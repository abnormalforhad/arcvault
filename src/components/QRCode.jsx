'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function QRCode() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="glass-card section-card animate-in delay-2">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-title-icon">📱</span>
            QR Code
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.5 }}>
          Connect wallet to generate QR code
        </div>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;

  return (
    <div className="glass-card section-card animate-in delay-2">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">📱</span>
          QR Code
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            display: 'inline-flex',
          }}
        >
          <img
            src={qrUrl}
            alt="Wallet QR Code"
            width={200}
            height={200}
            style={{ display: 'block', borderRadius: '0.25rem' }}
          />
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
            textAlign: 'center',
            opacity: 0.7,
            maxWidth: '260px',
          }}
        >
          {address}
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy Address'}
        </button>
      </div>
    </div>
  );
}
