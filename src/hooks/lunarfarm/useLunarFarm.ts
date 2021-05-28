import { ethers } from 'ethers'
import { useLunarFarmContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'

import { useCallback } from 'react'
import { useTransactionAdder } from '../../state/transactions/hooks'

const useLunarFarm = () => {
    const addTransaction = useTransactionAdder()
    const lunarFarmContract = useLunarFarmContract() // withSigner
    const { account } = useActiveWeb3React()

    // Deposit
    const deposit = useCallback(
        async (pid: number, amount: string, name: string, decimals = 18) => {
            // KMP decimals depend on asset, SLP is always 18
            console.log('depositing...', pid, amount)
            try {
                // const options = { gasPrice: 1000000000, gasLimit: 85000};
                const tx = await lunarFarmContract?.deposit(pid, ethers.utils.parseUnits(amount, decimals), account)
                return addTransaction(tx, { summary: `Deposit ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [account, addTransaction, lunarFarmContract]
    )

    // Withdraw
    const withdraw = useCallback(
        async (pid: number, amount: string, name: string, decimals = 18) => {
            try {
                const tx = await lunarFarmContract?.withdraw(pid, ethers.utils.parseUnits(amount, decimals), account)
                return addTransaction(tx, { summary: `Withdraw ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [account, addTransaction, lunarFarmContract]
    )

    const harvest = useCallback(
        async (pid: number, name: string) => {
            try {
                console.log('help:', pid, account)
                const tx = await lunarFarmContract?.harvest(pid, account)
                return addTransaction(tx, { summary: `Harvest ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [account, addTransaction, lunarFarmContract]
    )

    return { deposit, withdraw, harvest }
}

export default useLunarFarm
