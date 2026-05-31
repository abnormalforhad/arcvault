'use client';

import { useBlockNumber, useGasPrice } from 'wagmi';
import { formatGwei } from 'viem';
import { arcTestnet } from '@/config/wagmi';

export default function NetworkStats() {
  const { data: blockNumber } = useBlockNumber({
    chainId: arcTestnet.id,
    watch: true,
  });
  const { data: gasPrice } = useGasPrice({
    chainId: arcTestnet.id,
  });

  const stats = [
    {
      label: '⬡ Network',
      value: 'Arc Testnet',
      sub: `Chain ID: ${arcTestnet.id}`,
      gradient: true,
    },
    {
      label: '◈ Block Height',
      value: blockNumber ? Number(blockNumber).toLocaleString() : '—',
      sub: 'Live tracking',
    },
    {
      label: '⛽ Gas Price',
      value: gasPrice ? `${parseFloat(formatGwei(gasPrice)).toFixed(4)}` : '—',
      sub: 'Gwei (USDC)',
    },
    {
      label: '⚡ Finality',
      value: '< 1s',
      sub: 'Malachite consensus',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, i) => (
        <div key={i} className={`glass-card stat-card animate-in delay-${i + 1}`}>
          <div className="stat-label">{stat.label}</div>
          <div className={`stat-value${stat.gradient ? ' gradient' : ''}`}>
            {stat.value}
          </div>
          <div className="stat-subtext">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
