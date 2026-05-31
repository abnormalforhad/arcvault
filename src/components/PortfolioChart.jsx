'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

const USDC_ADDRESS = CONTRACTS.USDC; // 0x3600000000000000000000000000000000000000
const EURC_ADDRESS = CONTRACTS.EURC; // 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a

const COLORS = {
  usdc: '#5B3A7A',
  eurc: '#C67B6B',
};

export default function PortfolioChart() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { address, isConnected } = useAccount();

  const { data: contractData, isLoading } = useReadContracts({
    contracts: [
      {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: arcTestnet.id,
      },
      {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: arcTestnet.id,
      },
      {
        address: EURC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: arcTestnet.id,
      },
      {
        address: EURC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: arcTestnet.id,
      },
    ],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const usdcRaw = contractData?.[0]?.result;
  const usdcDecimals = contractData?.[1]?.result ?? 6;
  const eurcRaw = contractData?.[2]?.result;
  const eurcDecimals = contractData?.[3]?.result ?? 6;

  const usdcBalance = usdcRaw != null ? parseFloat(formatUnits(usdcRaw, usdcDecimals)) : 0;
  const eurcBalance = eurcRaw != null ? parseFloat(formatUnits(eurcRaw, eurcDecimals)) : 0;
  const totalBalance = usdcBalance + eurcBalance;

  const usdcPct = totalBalance > 0 ? (usdcBalance / totalBalance) * 100 : 50;
  const eurcPct = totalBalance > 0 ? (eurcBalance / totalBalance) * 100 : 50;

  const drawChart = useCallback(
    (progress) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const size = 220;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;
      const outerR = 95;
      const innerR = 60;

      ctx.clearRect(0, 0, size, size);

      const slices = [
        { pct: usdcPct, color: COLORS.usdc, label: 'USDC' },
        { pct: eurcPct, color: COLORS.eurc, label: 'EURC' },
      ];

      let startAngle = -Math.PI / 2;
      const totalAngle = 2 * Math.PI * Math.min(progress, 1);

      slices.forEach((slice) => {
        const sliceAngle = (slice.pct / 100) * totalAngle;
        const endAngle = startAngle + sliceAngle;

        // Draw arc slice
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();

        // Gradient fill
        const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
        grad.addColorStop(0, slice.color + 'CC');
        grad.addColorStop(1, slice.color);
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle shadow
        ctx.shadowColor = slice.color + '66';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        startAngle = endAngle;
      });

      // Center text
      if (progress >= 1) {
        ctx.fillStyle = '#ffffffee';
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          totalBalance > 0 ? `$${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '$0.00',
          cx,
          cy - 8
        );
        ctx.fillStyle = '#ffffff88';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText('Total Value', cx, cy + 14);
      }
    },
    [usdcPct, eurcPct, totalBalance]
  );

  useEffect(() => {
    let start = null;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      drawChart(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawChart]);

  return (
    <section className="glass-card section-card animate-in delay-2">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">📊</span>
          Portfolio Allocation
        </h2>
        <span className="section-badge">Live</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1rem 0' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '220px' }} />

        {/* Legend */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'USDC', color: COLORS.usdc, balance: usdcBalance, pct: usdcPct },
            { label: 'EURC', color: COLORS.eurc, balance: eurcBalance, pct: eurcPct },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}66`,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#ffffffcc', fontSize: '0.85rem', fontWeight: 600 }}>
                  {item.label}
                </span>
                <span style={{ color: '#ffffff88', fontSize: '0.75rem' }}>
                  {item.pct.toFixed(1)}% · ${item.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!isConnected && (
          <p style={{ color: '#ffffff66', fontSize: '0.8rem', textAlign: 'center' }}>
            Connect wallet to view your allocation
          </p>
        )}
        {isLoading && isConnected && (
          <p style={{ color: '#ffffff66', fontSize: '0.8rem', textAlign: 'center' }}>
            Loading balances…
          </p>
        )}
      </div>
    </section>
  );
}
