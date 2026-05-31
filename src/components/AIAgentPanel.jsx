'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

const SAMPLE_AGENTS = [
  {
    name: 'ArcTrader',
    description: 'Automated stablecoin trading',
    status: 'Active',
    registered: '2025-11-14',
  },
  {
    name: 'FXOracle',
    description: 'Real-time FX rate provider',
    status: 'Active',
    registered: '2025-12-02',
  },
  {
    name: 'ComplianceBot',
    description: 'KYC/AML screening agent',
    status: 'Pending',
    registered: '2026-01-18',
  },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  capabilities: '',
  endpoint: '',
};

export default function AIAgentPanel() {
  const { isConnected } = useAccount();
  const [form, setForm] = useState(INITIAL_FORM);
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = () => {
    if (!isConnected) {
      setStatusMsg('⚠️ Connect wallet first');
      return;
    }
    if (!form.name.trim() || !form.endpoint.trim()) {
      setStatusMsg('⚠️ Name and Endpoint URL required');
      return;
    }

    setSubmitting(true);
    setStatusMsg('');

    // Simulated registration
    setTimeout(() => {
      setSubmitting(false);
      setStatusMsg(`✅ Agent "${form.name}" registered successfully!`);
      setForm(INITIAL_FORM);
    }, 1500);
  };

  return (
    <div className="section-card animate-in delay-4">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">🤖</span>
          AI Agents
        </h2>
        <span className="section-badge">ERC-8183</span>
      </div>

      {/* Registration form */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3
          style={{
            margin: '0 0 1rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#e8e2f0',
          }}
        >
          Register New Agent
        </h3>

        <div className="form-group">
          <label className="form-label">Agent Name</label>
          <input
            className="form-input"
            placeholder="e.g. MyTradingBot"
            value={form.name}
            onChange={update('name')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            placeholder="Brief description of agent purpose"
            value={form.description}
            onChange={update('description')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Capabilities</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="List capabilities, one per line"
            value={form.capabilities}
            onChange={update('capabilities')}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Endpoint URL</label>
          <input
            className="form-input"
            placeholder="https://api.example.com/agent"
            value={form.endpoint}
            onChange={update('endpoint')}
          />
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleRegister}
          disabled={submitting}
        >
          {submitting ? 'Registering…' : 'Register Agent'}
        </button>

        {statusMsg && (
          <p className="status-message" style={{ marginTop: '0.75rem' }}>
            {statusMsg}
          </p>
        )}
      </div>

      {/* Registered agents */}
      <h3
        style={{
          margin: '0 0 0.75rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#e8e2f0',
          opacity: 0.8,
        }}
      >
        Registered Agents
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {SAMPLE_AGENTS.map((agent) => (
          <div
            className="glass-card"
            key={agent.name}
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#e8e2f0' }}>
                  {agent.name}
                </span>
                <span
                  className="section-badge"
                  style={{
                    background:
                      agent.status === 'Active'
                        ? 'rgba(110,231,160,0.15)'
                        : 'rgba(251,191,36,0.15)',
                    color: agent.status === 'Active' ? '#6EE7A0' : '#FBbf24',
                  }}
                >
                  {agent.status}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  opacity: 0.6,
                  color: '#e8e2f0',
                }}
              >
                {agent.description}
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                opacity: 0.45,
                whiteSpace: 'nowrap',
                color: '#e8e2f0',
              }}
            >
              {agent.registered}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
