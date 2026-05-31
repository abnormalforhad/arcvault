'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NetworkStats from './NetworkStats';
import BalanceCard from './BalanceCard';
import TransferForm from './TransferForm';
import VaultPanel from './VaultPanel';
import TransactionHistory from './TransactionHistory';

const ARC_LOGO = 'https://2cleyyjiu4t0uoo0.public.blob.vercel-storage.com/Gradual-Arc-icon-43ee6ca5-45c5-404d-ac1b-f54f93c51f06-1761315436123.png';

export default function Dashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="connect-prompt">
          <div className="connect-prompt-icon">
            <img src={ARC_LOGO} alt="ARC" />
          </div>
          <h2>Welcome to ArcVault</h2>
          <p>
            Connect your wallet to access the DeFi dashboard on ARC — Circle's
            stablecoin-native L1 with sub-second finality and USDC as gas.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title animate-in">Dashboard</h1>
      <p className="dashboard-subtitle animate-in">
        Manage your stablecoins on ARC Testnet
      </p>

      <NetworkStats />

      <div className="main-grid">
        <BalanceCard />
        <TransferForm />
        <VaultPanel />
        <TransactionHistory />
      </div>
    </div>
  );
}
