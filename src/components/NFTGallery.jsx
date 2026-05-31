'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

const SAMPLE_NFTS = [
  {
    id: 1,
    title: 'ARC Genesis Pass',
    description: 'Founding member access to ARC DeFi ecosystem.',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #F472B6 100%)',
    icon: '🔮',
  },
  {
    id: 2,
    title: 'Stablecoin Pioneer',
    description: 'Early USDC/EURC liquidity provider badge.',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
    icon: '💎',
  },
  {
    id: 3,
    title: 'AI Agent License',
    description: 'ERC-8183 certified autonomous agent NFT.',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
    icon: '🤖',
  },
  {
    id: 4,
    title: 'Vault Guardian',
    description: 'Top-tier governance & yield multiplier token.',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #EF4444 100%)',
    icon: '🛡️',
  },
];

export default function NFTGallery() {
  const { isConnected } = useAccount();
  const [mintingId, setMintingId] = useState(null);

  const handleMint = (id) => {
    if (!isConnected) return;
    setMintingId(id);
    setTimeout(() => setMintingId(null), 1500);
  };

  if (!isConnected) {
    return (
      <div className="section-card animate-in delay-4">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-title-icon">🖼️</span>
            NFT Gallery
          </h2>
          <span className="section-badge">ERC-721</span>
        </div>
        <div className="empty-state">Connect wallet to browse NFTs</div>
      </div>
    );
  }

  return (
    <div className="section-card animate-in delay-4">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">🖼️</span>
          NFT Gallery
        </h2>
        <span className="section-badge">{SAMPLE_NFTS.length} Items</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}
      >
        {SAMPLE_NFTS.map((nft) => (
          <div className="glass-card" key={nft.id} style={{ overflow: 'hidden' }}>
            {/* Image area */}
            <div
              style={{
                background: nft.gradient,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                borderRadius: '0.625rem 0.625rem 0 0',
              }}
            >
              {nft.icon}
            </div>

            {/* Info */}
            <div style={{ padding: '0.875rem' }}>
              <h3
                style={{
                  margin: '0 0 0.35rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#e8e2f0',
                }}
              >
                {nft.title}
              </h3>
              <p
                style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.8rem',
                  opacity: 0.65,
                  lineHeight: 1.4,
                  color: '#e8e2f0',
                }}
              >
                {nft.description}
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleMint(nft.id)}
                disabled={mintingId === nft.id}
              >
                {mintingId === nft.id ? 'Minting…' : 'Mint'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
