import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  contracts: {},
});

// Deployed PayPerSecond contract on Monad Testnet
export const PAY_PER_SECOND_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_CONTRACT ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

export const PAY_PER_SECOND_ABI = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createSession',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'videoId', type: 'uint256' },
      { name: 'pricePerSecond', type: 'uint256' },
      { name: 'maxSpend', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'executor', type: 'address' },
    ],
    outputs: [{ name: 'sessionId', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'paySecond',
    inputs: [{ name: 'sessionId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'closeSession',
    inputs: [{ name: 'sessionId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balances',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'creatorEarnings',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isSessionPayable',
    inputs: [{ name: 'sessionId', type: 'bytes32' }],
    outputs: [
      { name: 'payableStatus', type: 'bool' },
      { name: 'reason', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'SecondPaid',
    inputs: [
      { name: 'sessionId', type: 'bytes32', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'videoId', type: 'uint256', indexed: false },
      { name: 'second', type: 'uint256', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;
