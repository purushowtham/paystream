import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { monadTestnet, PAY_PER_SECOND_ADDRESS, PAY_PER_SECOND_ABI } from '../config/monad';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class MonadWeb3Service {
  public publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http('https://testnet-rpc.monad.xyz'),
  });

  public async connectBrowserWallet(): Promise<{
    address: `0x${string}`;
    balanceEth: string;
  }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask or EVM browser extension not detected. Please install MetaMask extension in your browser!');
    }

    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum),
    });

    // Prompt MetaMask popup to request user accounts
    const [address] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch or Add Monad Testnet chain (10143 = 0x279f)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x279f' }],
      });
    } catch (switchError: any) {
      // 4902 error code means chain is not added to MetaMask yet
      if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x279f',
              chainName: 'Monad Testnet',
              nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
              rpcUrls: ['https://testnet-rpc.monad.xyz'],
              blockExplorerUrls: ['https://testnet.monadexplorer.com'],
            },
          ],
        });
      }
    }

    // Fetch live MON balance from Monad Testnet RPC
    const balanceWei = await this.publicClient.getBalance({ address: address as `0x${string}` });

    return {
      address: address as `0x${string}`,
      balanceEth: formatEther(balanceWei),
    };
  }

  public async getBalance(address: `0x${string}`): Promise<bigint> {
    try {
      return await this.publicClient.getBalance({ address });
    } catch (e) {
      console.warn('Failed to fetch balance from Monad RPC', e);
      return parseEther('0');
    }
  }

  public async sendDeposit(userAddress: `0x${string}`, amountWei: bigint): Promise<`0x${string}`> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask wallet not connected');
    }

    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum),
      account: userAddress,
    });

    const hash = await walletClient.writeContract({
      address: PAY_PER_SECOND_ADDRESS,
      abi: PAY_PER_SECOND_ABI,
      functionName: 'deposit',
      value: amountWei,
    });

    return hash;
  }
}

export const monadWeb3Service = new MonadWeb3Service();
