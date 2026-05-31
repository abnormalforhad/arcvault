'use client';

import { useState } from 'react';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { NFT_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

const NFT_TYPES = [
  {
    id: 0,
    title: 'ARC Genesis Pass',
    description: 'Founding member access to ARC DeFi ecosystem.',
    gradient: 'linear-gradient(135deg, #5B3A7A 0%, #C67B6B 100%)',
    icon: '🔮',
    maxSupply: 10000,
  },
  {
    id: 1,
    title: 'Stablecoin Pioneer',
    description: 'Early USDC/EURC liquidity provider badge.',
    gradient: 'linear-gradient(135deg, #8B6AAF 0%, #D4917A 100%)',
    icon: '💎',
    maxSupply: 5000,
  },
  {
    id: 2,
    title: 'AI Agent License',
    description: 'ERC-8183 certified autonomous agent NFT.',
    gradient: 'linear-gradient(135deg, #A68BC7 0%, #F5B731 100%)',
    icon: '🤖',
    maxSupply: 2500,
  },
  {
    id: 3,
    title: 'Vault Guardian',
    description: 'Top-tier governance & yield multiplier token.',
    gradient: 'linear-gradient(135deg, #C67B6B 0%, #EDAA2B 100%)',
    icon: '🛡️',
    maxSupply: 1000,
  },
];

export default function NFTGallery() {
  const { address, isConnected } = useAccount();
  const [mintingId, setMintingId] = useState(null);
  const [mintStatus, setMintStatus] = useState(null);

  const isNFTDeployed = CONTRACTS.NFT !== '0x0000000000000000000000000000000000000000';

  // Read canMint for each type
  const { data: canMintData, refetch: refetchCanMint } = useReadContracts({
    contracts: NFT_TYPES.map((nft) => ({
      address: CONTRACTS.NFT,
      abi: NFT_ABI,
      functionName: 'canMint',
      args: [address, nft.id],
      chainId: arcTestnet.id,
    })),
    query: {
      enabled: isConnected && !!address && isNFTDeployed,
      refetchInterval: 10000,
    },
  });

  // Read hasMinted for each type
  const { data: hasMintedData } = useReadContracts({
    contracts: NFT_TYPES.map((nft) => ({
      address: CONTRACTS.NFT,
      abi: NFT_ABI,
      functionName: 'hasMinted',
      args: [address, nft.id],
      chainId: arcTestnet.id,
    })),
    query: {
      enabled: isConnected && !!address && isNFTDeployed,
      refetchInterval: 10000,
    },
  });

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.NFT,
    abi: NFT_ABI,
    functionName: 'totalSupply',
    chainId: arcTestnet.id,
    query: { enabled: isNFTDeployed, refetchInterval: 10000 },
  });

  // Read user's NFT balance
  const { data: userBalance } = useReadContract({
    address: CONTRACTS.NFT,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: arcTestnet.id,
    query: { enabled: isConnected && !!address && isNFTDeployed, refetchInterval: 10000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Handle successful mint
  if (isSuccess && mintingId !== null && mintStatus?.type !== 'success') {
    setMintStatus({
      type: 'success',
      msg: `Minted ${NFT_TYPES[mintingId]?.title}!`,
      hash,
    });
    setMintingId(null);
    refetchCanMint();
  }

  const handleMint = (typeId) => {
    if (!isConnected) return;
    setMintStatus(null);
    setMintingId(typeId);

    if (!isNFTDeployed) {
      setMintStatus({ type: 'error', msg: 'NFT contract not deployed. Deploy ArcNFT.sol first.' });
      setMintingId(null);
      return;
    }

    writeContract({
      address: CONTRACTS.NFT,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [BigInt(typeId)],
    });
  };

  return (
    <div className="glass-card section-card main-grid-full animate-in delay-4">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(245,183,49,0.1)', color: '#F5B731' }}
          >
            🖼
          </div>
          NFT Collection
        </div>
        <div className="section-badge">
          {isNFTDeployed
            ? `${totalSupply !== undefined ? Number(totalSupply) : 0} Minted`
            : 'Deploy Required'
          }
        </div>
      </div>

      {/* User stats */}
      {isConnected && isNFTDeployed && (
        <div style={{
          display: 'flex', gap: 16, marginBottom: 20,
          fontSize: 13, color: 'var(--text-secondary)'
        }}>
          <span>Your NFTs: <strong style={{ color: 'var(--gold)' }}>
            {userBalance !== undefined ? Number(userBalance) : 0}
          </strong></span>
          <span>Total Minted: <strong style={{ color: 'var(--text-primary)' }}>
            {totalSupply !== undefined ? Number(totalSupply) : 0}
          </strong></span>
        </div>
      )}

      {/* NFT Grid */}
      <div className="nft-grid">
        {NFT_TYPES.map((nft, i) => {
          const canMint = canMintData?.[i]?.result;
          const alreadyMinted = hasMintedData?.[i]?.result;
          const isMinting = mintingId === nft.id && (isPending || isConfirming);

          return (
            <div className="nft-card" key={nft.id}>
              {/* Image area */}
              <div
                className="nft-card-image"
                style={{ background: nft.gradient }}
              >
                <span style={{ fontSize: 48 }}>{nft.icon}</span>
              </div>

              {/* Info */}
              <div className="nft-card-info">
                <div className="nft-card-title">{nft.title}</div>
                <div className="nft-card-desc">{nft.description}</div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 10,
                  fontSize: 11, color: 'var(--text-muted)'
                }}>
                  <span>Max: {nft.maxSupply.toLocaleString()}</span>
                  <span>Free Mint</span>
                </div>

                {!isConnected ? (
                  <button className="btn btn-secondary btn-sm" disabled>
                    Connect Wallet
                  </button>
                ) : alreadyMinted ? (
                  <button className="btn btn-secondary btn-sm" disabled style={{
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    borderColor: 'rgba(110,231,160,0.12)',
                  }}>
                    ✓ Owned
                  </button>
                ) : (
                  <button
                    className={`btn btn-primary btn-sm ${isMinting ? 'btn-loading' : ''}`}
                    onClick={() => handleMint(nft.id)}
                    disabled={isMinting || (isNFTDeployed && canMint === false)}
                  >
                    {isMinting ? 'Minting...' : 'Mint Free'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {mintStatus && (
        <div className={`status-message ${mintStatus.type}`} style={{ marginTop: 16 }}>
          {mintStatus.type === 'success' && '✓ '}
          {mintStatus.type === 'error' && '✕ '}
          {mintStatus.msg}
          {mintStatus.hash && (
            <a
              href={`https://testnet.arcscan.app/tx/${mintStatus.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 4, color: 'var(--gold)' }}
            >
              View ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
