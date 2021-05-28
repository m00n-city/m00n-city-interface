import { ChainId } from '@sushiswap/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import sushiData from '@sushiswap/sushi-data'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useBoringHelperContract } from 'hooks/useContract'
import orderBy from 'lodash/orderBy'
import { useCallback, useEffect, useState } from 'react'
import { exchange_matic, lunarFarmClient, minichefv2_matic } from 'apollo/client'
import { getOneDayBlock } from 'apollo/getAverageBlockTime'
import {
    tokenQuery,
    liquidityPositionSubsetQuery,
    pairSubsetQuery,
    pairTimeTravelQuery,
    miniChefPoolQuery,
    lunarFarmPoolQuery
} from 'apollo/queries'
import { POOL_DENY } from '../../constants'

const hardcodedPair = {
    data: {
        pairs: [
            {
                id: '0xf370671dd4cc2f2a0b6442ddf010c6bd176daa16',
                reserve0: '25393582.969770713357421154',
                reserve1: '18365.728619841533231544',
                reserveETH: '36731.457239683066463088',
                reserveUSD: 104338892.8588822526603833084817214,
                timestamp: '1614313007',
                token0: {
                    derivedETH: '0.0007232429012362946262930399657498353',
                    id: '0xf370671dd4cc2f2a0b6442ddf010c6bd176daa16',
                    name: 'Lunar Token',
                    symbol: 'LUNAR',
                    totalSupply: 16856
                },
                token0Price: '1382.661341425713565404187319005124',
                token1: {
                    derivedETH: '1',
                    id: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                    name: 'Wrapped Ether',
                    symbol: 'WETH',
                    totalSupply: 17720
                },
                token1Price: '0.0007232429012362946262930399657498353',
                totalSupply: 643661.535356529764897158,
                trackedReserveETH: '36731.45723968306646308800000000001',
                txCount: '187302',
                untrackedVolumeUSD: '614838562.4182000636969551863121044',
                volumeUSD: 614838562.4182000636969551863121043
            }
        ]
    }
}

// Todo: Rewrite in terms of web3 as opposed to subgraph
const useFarms = () => {
    const [farms, setFarms] = useState<any | undefined>()
    const { account, chainId } = useActiveWeb3React()
    const boringHelperContract = useBoringHelperContract()

    const fetchAllFarms = useCallback(async () => {
        let results: any[] = []
        switch (chainId) {
            case ChainId.RINKEBY:
                results = await Promise.all([
                    lunarFarmClient[ChainId.RINKEBY].query({
                        query: lunarFarmPoolQuery
                    }),
                    exchange_matic.query({
                        query: liquidityPositionSubsetQuery,
                        variables: { user: String('0x5Adc6eB6cf61A2BFef9AE6A64c7236F34dF3081a').toLowerCase() } //minichef
                    }),                    
                    sushiData.exchange.ethPrice()
                ])
                break

            default:
                break
        }

        if (!results.length) {
            setFarms({ farms: [], userFarms: [] })
            return
        }
        const pools = results[0]?.data?.pools
        const pairAddresses = pools
            .map((pool: any) => {
                return pool.pair
            })
            .sort()
        const pairsQuery = await exchange_matic.query({
            query: pairSubsetQuery,
            variables: { pairAddresses }
        })
        const oneDayBlock = await getOneDayBlock(chainId)
        const pairs24AgoQuery = await Promise.all(
            pairAddresses.map((address: string) => {
                //console.log(address, oneDayBlock)
                return exchange_matic.query({
                    query: pairTimeTravelQuery,
                    variables: { id: address, block: oneDayBlock }
                })
            })
        )
        const pairs24Ago = pairs24AgoQuery.map((query: any) => {
            return {
                ...query?.data?.pair
            }
        })

        const liquidityPositions = results[1]?.data.liquidityPositions                
        const pairs = hardcodedPair?.data?.pairs // pairsQuery?.data?.pairs
        const lunarPrice = results[2] / 1000; // ETH price / 1000 - hardcode for now
        console.log('lunarPrice:', lunarPrice)

        console.log('pools:', pools)
        const farms = pools
            .filter((pool: any) => {                
                return (
                    !POOL_DENY.includes(pool?.id) 
                    // && pairs.find((pair: any) => pair?.id === pool?.pair) 
                    // && Number(pool.miniChef.totalAllocPoint) > 0 
                    // && !['0'].includes(pool?.id) // manual filter for now
                )
            })
            .map((pool: any) => {
                const pair = pairs.find((pair: any) => pair.id === pool.dToken)

                if(!pair) return
                console.log('pair', pair)
                const pair24Ago = pairs24Ago.find((pair: any) => pair.id === pool.pair)
                const liquidityPosition = liquidityPositions.find(
                    (liquidityPosition: any) => liquidityPosition.pair.id === pair.id
                )

                const totalAllocPoint = 1000 //pool.miniChef.totalAllocPoint

                const balance = Number(pool.slpBalance / 1e18)
                const balanceUSD = (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD)

                const rewardPerSecond = ((pool.depositAmount / totalAllocPoint) * pool.lunarPerSecond) / 1e18
                const rewardPerDay = rewardPerSecond * 86400
                
                const roiPerSecond = (rewardPerSecond * lunarPrice) / balanceUSD
                const roiPerHour = roiPerSecond * 3600
                const roiPerDay = roiPerHour * 24
                const roiPerMonth = roiPerDay * 30
                //const oneYearFees = 0.05
                const oneDayVolume = pair.volumeUSD ? pair.volumeUSD - pair24Ago?.volumeUSD : 10000
                const oneYearFees = (oneDayVolume * 0.003 * 365) / pair.reserveUSD
                const oneMonthFees = oneYearFees ? oneYearFees / 12 : 0.05
                const rewardAPR = roiPerMonth * 12
                //const roiPerYear = rewardAPR
                //where (1 + r/n )** n – 1
                let roiPerYear
                if (rewardAPR < 0.35) {
                    roiPerYear = (1 + ((roiPerMonth + oneMonthFees) * 12) / 120) ** 120 - 1 // compounding 3 days APY
                } else {
                    roiPerYear = (1 + ((roiPerMonth + oneMonthFees) * 12) / 24) ** 24 - 1 // compounding 2 weeks APY
                }
                //const roiPerYear = (1 + ((roiPerDay + feeFactorAnnualized / 365) * 365) / 365) ** 365 - 1 // compounding daily APY
                //const roiPerYear = roiPerMonth * 12
                //console.log('pool:', pool.slpBalance)
                //console.log(pair.token0.symbol + '-' + pair.token1.symbol, roiPerYear)

                return {
                    ...pool,
                    type: 'SLP',
                    symbol: pair.token0.symbol + '-' + pair.token1.symbol,
                    name: pair.token0.name + ' ' + pair.token1.name,
                    pid: Number(pool.id),
                    pairAddress: pair.id,
                    slpBalance: pool.slpBalance,
                    liquidityPair: pair,
                    rewardTokens: [
                        '0xf370671dd4cc2f2a0b6442ddf010c6bd176daa16', //LUNAR on Matic
                        // '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC on Matic
                    ],
                    lunarRewardPerDay: rewardPerDay,
                    secondaryRewardPerDay: 0,
                    roiPerSecond,
                    roiPerHour,
                    roiPerDay,
                    roiPerMonth,
                    roiPerYear,
                    rewardPerThousand: 1 * roiPerDay * (1000 / lunarPrice),
                    tvl: liquidityPosition?.liquidityTokenBalance
                        ? (pair.reserveUSD / pair.totalSupply) * liquidityPosition.liquidityTokenBalance
                        : 0.1
                }
            })

        console.log('farms:', farms)
        const sorted = orderBy(farms, ['pid'], ['desc'])

        const pids = sorted.map(pool => {
            return pool.pid
        })
        setFarms({ farms: sorted, userFarms: [] })
       
    }, [])

    useEffect(() => {
        fetchAllFarms()
    }, [fetchAllFarms])

    return farms
}

export default useFarms
