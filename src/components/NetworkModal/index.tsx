import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'

import { ApplicationModal } from '../../state/application/actions'
import { ChainId } from '@sushiswap/sdk'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'

const PARAMS: {
    [chainId in ChainId]?: {
        chainId: string
        chainName: string
        nativeCurrency: {
            name: string
            symbol: string
            decimals: number
        }
        rpcUrls: string[]
        blockExplorerUrls: string[]
    }
} = {
    [ChainId.MAINNET]: {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3'],
        blockExplorerUrls: ['https://etherscan.com']
    },
    [ChainId.FANTOM]: {
        chainId: '0xfa',
        chainName: 'Fantom',
        nativeCurrency: {
            name: 'Fantom',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://rpcapi.fantom.network'],
        blockExplorerUrls: ['https://ftmscan.com']
    },
    [ChainId.FANTOM_TESTNET]: {
        chainId: '0xfa2',
        chainName: 'Fantom Testnet',
        nativeCurrency: {
            name: 'Fantom',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://rpc.testnet.fantom.network'],
        blockExplorerUrls: ['https://explorer.testnet.fantom.network/']
    },
    [ChainId.BSC]: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
    },
    [ChainId.MATIC]: {
        chainId: '0x89',
        chainName: 'Matic',
        nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://rpc-mainnet.maticvigil.com'], //['https://matic-mainnet.chainstacklabs.com/'],
        blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com']
    },
    [ChainId.RINKEBY]: {
        chainId: '0x4',
        chainName: 'Rinkeby Test Network',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://rinkeby.infura.io/v3/undefined'],
        blockExplorerUrls: ['https://rinkeby.etherscan.io']
    },
    [ChainId.GÖRLI]: {
        chainId: '0x5',
        chainName: 'GÖRLI',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://goerli.infura.io/v3'],
        blockExplorerUrls: ['https://goerli.etherscan.io']
    },

    [ChainId.HECO]: {
        chainId: '0x80',
        chainName: 'Heco',
        nativeCurrency: {
            name: 'Heco Token',
            symbol: 'HT',
            decimals: 18
        },
        rpcUrls: ['https://http-mainnet.hecochain.com'],
        blockExplorerUrls: ['https://hecoinfo.com']
    },
    [ChainId.XDAI]: {
        chainId: '0x64',
        chainName: 'xDai',
        nativeCurrency: {
            name: 'xDai Token',
            symbol: 'xDai',
            decimals: 18
        },
        rpcUrls: ['https://rpc.xdaichain.com'],
        blockExplorerUrls: ['https://blockscout.com/poa/xdai']
    },
    [ChainId.HARMONY]: {
        chainId: '0x63564C40',
        chainName: 'Harmony One',
        nativeCurrency: {
            name: 'One Token',
            symbol: 'ONE',
            decimals: 18
        },
        rpcUrls: ['https://api.s0.t.hmny.io'],
        blockExplorerUrls: ['https://explorer.harmony.one/']
    },
    [ChainId.AVALANCHE]: {
        chainId: '0xA86A',
        chainName: 'Avalanche',
        nativeCurrency: {
            name: 'Avalanche Token',
            symbol: 'AVAX',
            decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://explorer.avax.network']
    },
    [ChainId.OKEX]: {
        chainId: '0x42',
        chainName: 'OKEx',
        nativeCurrency: {
            name: 'OKEx Token',
            symbol: 'OKT',
            decimals: 18
        },
        rpcUrls: ['https://exchainrpc.okex.org'],
        blockExplorerUrls: ['https://www.oklink.com/okexchain']
    }
}

export default function NetworkModal(): JSX.Element | null {
    const { chainId, library, account } = useActiveWeb3React()
    const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
    const toggleNetworkModal = useNetworkModalToggle()

    if (!chainId) return null

    return (
        <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal}>
            <ModalHeader onClose={toggleNetworkModal} title="Select a Network" />
            <div className="text-lg text-primary mb-6">
                You are currently browsing <span className="font-bold text-pink">LUNAR</span>
                <br /> on the <span className="font-bold text-blue">{NETWORK_LABEL[chainId]}</span> network
            </div>

            <div className="flex flex-col space-y-5 overflow-y-auto">
                {[
                    ChainId.MAINNET,
                    ChainId.FANTOM,
                    ChainId.FANTOM_TESTNET,
                    ChainId.BSC,
                    ChainId.BSC_TESTNET,
                    ChainId.MATIC,
                    ChainId.MATIC_TESTNET,
                    ChainId.GÖRLI,
                    ChainId.RINKEBY
                ].map((key: ChainId, i: number) => {
                    if (chainId === key) {
                        return (
                            <button key={i} className="bg-gradient-to-b from-blue to-pink w-full rounded p-px">
                                <div className="flex items-center h-full w-full bg-dark-1000 rounded p-3">
                                    <img
                                        src={NETWORK_ICON[key]}
                                        alt="Switch Network"
                                        className="rounded-md mr-3 w-8 h-8"
                                    />
                                    <div className="text-primary font-bold">{NETWORK_LABEL[key]}</div>
                                </div>
                            </button>
                        )
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                toggleNetworkModal()
                                const params = PARAMS[key]
                                library?.send('wallet_addEthereumChain', [params, account])
                            }}
                            className="flex items-center bg-dark-800 hover:bg-dark-700 w-full rounded p-3 cursor-pointer"
                        >
                            <img src={NETWORK_ICON[key]} alt="Switch Network" className="rounded-md mr-2 w-8 h-8" />
                            <div className="text-primary font-bold">{NETWORK_LABEL[key]}</div>
                        </button>
                    )
                })}
            </div>
        </Modal>
    )
}
