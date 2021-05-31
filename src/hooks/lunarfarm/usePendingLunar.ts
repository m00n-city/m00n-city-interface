import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useLunarFarmContract } from 'hooks/useContract'
import { useCallback, useEffect, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'
import Fraction from '../../entities/Fraction'

const usePending = (pid: number) => {
    const [balance, setBalance] = useState<string>('0')
    const { account } = useActiveWeb3React()

    const lunarFarmContract = useLunarFarmContract()
    const currentBlockNumber = useBlockNumber()

    const fetchPending = useCallback(async () => {
        const pending = await lunarFarmContract?.pendingLunar(pid, account)
        const formatted = Fraction.from(BigNumber.from(pending), BigNumber.from(10).pow(18)).toString(18)
        setBalance(formatted)
    }, [account, lunarFarmContract, pid])

    useEffect(() => {
        if (account && lunarFarmContract && String(pid)) {
            // pid = 0 is evaluated as false
            fetchPending()
        }
    }, [account, currentBlockNumber, fetchPending, lunarFarmContract, pid])

    return balance
}

export default usePending
