'use client';

import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';

const USDC_ADDRESS = CONTRACTS.USDC ?? '0x3600000000000000000000000000000000000000';

function emptyRow() {
  return { id: Date.now().toString() + Math.random(), address: '', amount: '' };
}

export default function MultiSend() {
  const { address: sender, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: decimals } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const [rows, setRows] = useState([emptyRow(), emptyRow()]);
  const [status, setStatus] = useState('');

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (id) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const n = parseFloat(r.amount);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [rows]);

  const validRows = rows.filter((r) => r.address.trim() && parseFloat(r.amount) > 0);

  const handleSend = async () => {
    if (!isConnected || validRows.length === 0) return;
    const dec = decimals ?? 6;
    setStatus(`Sending to ${validRows.length} recipient(s)…`);

    for (let i = 0; i < validRows.length; i++) {
      const { address: to, amount } = validRows[i];
      try {
        setStatus(`Sending ${amount} USDC to ${to.slice(0, 6)}…${to.slice(-4)} (${i + 1}/${validRows.length})`);
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, parseUnits(amount, Number(dec))],
        });
      } catch (err) {
        setStatus(`❌ Failed on recipient ${i + 1}: ${err?.shortMessage || err?.message || 'Unknown error'}`);
        return;
      }
    }

    setStatus(`✅ Successfully sent USDC to ${validRows.length} recipient(s)!`);
    setRows([emptyRow(), emptyRow()]);
  };

  return (
    <div className="glass-card section-card animate-in delay-4">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">📤</span>
          Multi-Send USDC
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              {idx === 0 && <label className="form-label">Recipient Address</label>}
              <input
                className="form-input form-input-mono"
                type="text"
                placeholder="0x..."
                value={row.address}
                onChange={(e) => updateRow(row.id, 'address', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {idx === 0 && <label className="form-label">Amount</label>}
              <input
                className="form-input"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={row.amount}
                onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              style={{ marginBottom: '0.125rem', fontSize: '0.8rem' }}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={addRow}>
          + Add Recipient
        </button>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          Total: <span style={{ fontFamily: 'monospace' }}>{total.toFixed(2)}</span> USDC
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSend}
        disabled={!isConnected || isPending || validRows.length === 0}
      >
        {isPending ? 'Sending…' : `Send to ${validRows.length} Recipient${validRows.length !== 1 ? 's' : ''}`}
      </button>

      {status && (
        <div className="status-message" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
          {status}
        </div>
      )}
    </div>
  );
}
