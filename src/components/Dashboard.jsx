'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NetworkStats from './NetworkStats';
import BalanceCard from './BalanceCard';
import TransferForm from './TransferForm';
import VaultPanel from './VaultPanel';
import TransactionHistory from './TransactionHistory';
import PortfolioChart from './PortfolioChart';
import SwapInterface from './SwapInterface';
import AddressBook from './AddressBook';
import MultiSend from './MultiSend';
import StakingCalculator from './StakingCalculator';
import QRCode from './QRCode';
import NFTGallery from './NFTGallery';
import AIAgentPanel from './AIAgentPanel';

const ARC_LOGO = 'https://2cleyyjiu4t0uoo0.public.blob.vercel-storage.com/Gradual-Arc-icon-43ee6ca5-45c5-404d-ac1b-f54f93c51f06-1761315436123.png';

const TABS = [
  { key: 'overview', label: '◈ Overview' },
  { key: 'transfer', label: '↗ Transfer' },
  { key: 'swap', label: '⇄ Swap' },
  { key: 'vault', label: '🏦 Vault' },
  { key: 'nft', label: '🖼 NFTs' },
  { key: 'agents', label: '🤖 AI Agents' },
];

export default function Dashboard() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');

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

      {/* Tab Navigation */}
      <div className="dashboard-tabs animate-in">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Network Stats — always visible */}
      <NetworkStats />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="main-grid">
          <BalanceCard />
          <PortfolioChart />
          <QRCode />
          <StakingCalculator />
          <TransactionHistory />
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="main-grid">
          <TransferForm />
          <AddressBook />
          <MultiSend />
        </div>
      )}

      {activeTab === 'swap' && (
        <div className="main-grid">
          <SwapInterface />
          <StakingCalculator />
        </div>
      )}

      {activeTab === 'vault' && (
        <div className="main-grid">
          <VaultPanel />
          <StakingCalculator />
          <TransactionHistory />
        </div>
      )}

      {activeTab === 'nft' && (
        <div className="main-grid">
          <NFTGallery />
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="main-grid">
          <AIAgentPanel />
        </div>
      )}
    </div>
  );
}
