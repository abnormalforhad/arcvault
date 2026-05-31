'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'arcvault_address_book';

function loadAddresses() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAddresses(addresses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!label.trim() || !address.trim()) return;
    const entry = { id: Date.now().toString(), label: label.trim(), address: address.trim() };
    const updated = [...addresses, entry];
    setAddresses(updated);
    saveAddresses(updated);
    setLabel('');
    setAddress('');
  };

  const handleDelete = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
  };

  const handleCopy = async (addr, id) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="glass-card section-card animate-in delay-3">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">📒</span>
          Address Book
          <span className="section-badge">{addresses.length}</span>
        </h2>
      </div>

      {/* Add address form */}
      <form onSubmit={handleAdd} style={{ marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="ab-label">Label</label>
          <input
            id="ab-label"
            className="form-input"
            type="text"
            placeholder="e.g. My Wallet"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ab-address">Address</label>
          <input
            id="ab-address"
            className="form-input form-input-mono"
            type="text"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!label.trim() || !address.trim()}>
          + Add Address
        </button>
      </form>

      {/* Address list */}
      {addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.5 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📒</div>
          <p>No saved addresses yet</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {addresses.map((entry) => (
            <li
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => handleCopy(entry.address, entry.id)}
              title="Click to copy address"
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>{entry.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.address}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleCopy(entry.address, entry.id); }}
                  style={{ minWidth: '3rem', fontSize: '0.75rem' }}
                >
                  {copiedId === entry.id ? '✓' : '📋'}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                  style={{ fontSize: '0.75rem' }}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
