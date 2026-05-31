'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';

export default function TransferForm() {
  const { isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!recipient || !amount) {
      setStatus({ type: 'error', msg: 'Fill all fields' });
      return;
    }

    try {
      const tokenAddress = token === 'USDC' ? CONTRACTS.USDC : CONTRACTS.EURC;
      const amountParsed = parseUnits(amount, 6);

      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient, amountParsed],
      });

      setStatus({ type: 'info', msg: 'Transaction submitted...' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message?.slice(0, 80) || 'Transfer failed' });
    }
  };

  if (isSuccess && status?.type !== 'success') {
    setStatus({
      type: 'success',
      msg: `Transferred ${amount} ${token}! `,
      hash,
    });
  }

  return (
    <div className="glass-card section-card animate-in delay-3">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(198,123,107,0.12)', color: '#D4917A' }}
          >
            ↗
          </div>
          Transfer
        </div>
      </div>

      <form onSubmit={handleTransfer}>
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${token === 'USDC' ? 'active' : ''}`}
            onClick={() => setToken('USDC')}
          >
            USDC
          </button>
          <button
            type="button"
            className={`toggle-btn ${token === 'EURC' ? 'active' : ''}`}
            onClick={() => setToken('EURC')}
          >
            EURC
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input
            className="form-input form-input-mono"
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={!isConnected}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount ({token})</label>
          <input
            className="form-input"
            type="number"
            step="0.000001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isConnected}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full ${isPending || isConfirming ? 'btn-loading' : ''}`}
          disabled={!isConnected || isPending || isConfirming}
        >
          {isPending
            ? 'Confirm in Wallet...'
            : isConfirming
            ? 'Confirming...'
            : `Send ${token}`}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.type === 'success' && '✓ '}
          {status.type === 'error' && '✕ '}
          {status.type === 'info' && '◎ '}
          {status.msg}
          {status.hash && (
            <a
              href={`https://testnet.arcscan.app/tx/${status.hash}`}
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
