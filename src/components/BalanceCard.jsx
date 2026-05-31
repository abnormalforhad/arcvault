'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

export default function BalanceCard() {
  const { address, isConnected } = useAccount();

  // Read balances AND decimals for each token
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: arcTestnet.id,
      },
      {
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: arcTestnet.id,
      },
      {
        address: CONTRACTS.EURC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: arcTestnet.id,
      },
      {
        address: CONTRACTS.EURC,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: arcTestnet.id,
      },
    ],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  });

  const usdcBalance = data?.[0]?.result;
  const usdcDecimals = data?.[1]?.result ?? 6;
  const eurcBalance = data?.[2]?.result;
  const eurcDecimals = data?.[3]?.result ?? 6;

  const formatBalance = (balance, decimals) => {
    if (balance === undefined || balance === null) return '0.00';
    return parseFloat(formatUnits(balance, Number(decimals))).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const tokens = [
    {
      symbol: 'USDC',
      icon: 'usdc',
      balance: usdcBalance,
      decimals: usdcDecimals,
      label: '$ Stablecoin · Native Gas',
    },
    {
      symbol: 'EURC',
      icon: 'eurc',
      balance: eurcBalance,
      decimals: eurcDecimals,
      label: '€ Stablecoin',
    },
  ];

  return (
    <div className="glass-card section-card animate-in delay-2">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(245,183,49,0.1)', color: '#F5B731' }}
          >
            💰
          </div>
          Balances
        </div>
        <div className="section-badge">Live</div>
      </div>

      <div className="balance-list">
        {tokens.map((token) => (
          <div key={token.symbol} className="balance-item">
            <div className="balance-token">
              <div className={`balance-token-icon ${token.icon}`}>
                {token.symbol.charAt(0)}
              </div>
              <div>
                <div className="balance-token-name">{token.symbol}</div>
                <div className="balance-token-sub">{token.label}</div>
              </div>
            </div>
            <div className="balance-amount">
              {isLoading ? (
                <div className="skeleton" style={{ width: 80, height: 24 }}></div>
              ) : (
                <>
                  <div className="balance-amount-value">
                    {formatBalance(token.balance, token.decimals)}
                  </div>
                  <div className="balance-amount-usd">
                    ≈ {token.symbol === 'USDC' ? '$' : '€'}
                    {formatBalance(token.balance, token.decimals)}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
