'use client';

import { useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ERC20_ABI, VAULT_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

export default function VaultPanel() {
  const { address, isConnected } = useAccount();
  const [mode, setMode] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [step, setStep] = useState('idle'); // idle | approving | depositing | withdrawing

  const isVaultDeployed = CONTRACTS.VAULT !== '0x0000000000000000000000000000000000000000';

  // Read vault balance
  const { data: vaultBalance } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: arcTestnet.id,
    query: {
      enabled: isConnected && !!address && isVaultDeployed,
      refetchInterval: 5000,
    },
  });

  // Read total deposits
  const { data: totalDeposits } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'totalDeposits',
    chainId: arcTestnet.id,
    query: {
      enabled: isVaultDeployed,
      refetchInterval: 10000,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const formatBalance = (balance) => {
    if (balance === undefined || balance === null) return '0.00';
    return parseFloat(formatUnits(balance, 6)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', msg: 'Enter valid amount' });
      return;
    }

    try {
      const amountParsed = parseUnits(amount, 6);

      // Step 1: Approve
      setStep('approving');
      setStatus({ type: 'info', msg: 'Approve USDC spend in wallet...' });

      writeContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT, amountParsed],
      });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message?.slice(0, 80) || 'Failed' });
      setStep('idle');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', msg: 'Enter valid amount' });
      return;
    }

    try {
      const amountParsed = parseUnits(amount, 6);

      setStep('withdrawing');
      setStatus({ type: 'info', msg: 'Confirm withdrawal in wallet...' });

      writeContract({
        address: CONTRACTS.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [amountParsed],
      });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message?.slice(0, 80) || 'Failed' });
      setStep('idle');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);
    if (mode === 'deposit') {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  if (isSuccess && status?.type !== 'success') {
    setStatus({
      type: 'success',
      msg: `${mode === 'deposit' ? 'Deposited' : 'Withdrawn'} ${amount} USDC!`,
      hash,
    });
    setStep('idle');
  }

  return (
    <div className="glass-card section-card animate-in delay-4">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(108,92,231,0.1)', color: '#6C5CE7' }}
          >
            🏦
          </div>
          Vault
        </div>
        <div className="section-badge">
          TVL: ${formatBalance(totalDeposits)}
        </div>
      </div>

      {!isVaultDeployed ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <div className="empty-state-text">Vault not deployed yet</div>
          <div className="empty-state-sub">
            Deploy contracts/ArcVault.sol and update CONTRACTS.VAULT address
          </div>
        </div>
      ) : (
        <>
          {/* User vault balance */}
          <div
            className="balance-item"
            style={{ marginBottom: 20 }}
          >
            <div className="balance-token">
              <div
                className="balance-token-icon"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7, #3E74BB)',
                  boxShadow: '0 0 16px rgba(108,92,231,0.3)',
                }}
              >
                V
              </div>
              <div>
                <div className="balance-token-name">Your Vault Balance</div>
                <div className="balance-token-sub">Staked USDC</div>
              </div>
            </div>
            <div className="balance-amount">
              <div className="balance-amount-value">
                {formatBalance(vaultBalance)}
              </div>
              <div className="balance-amount-usd">
                ≈ ${formatBalance(vaultBalance)}
              </div>
            </div>
          </div>

          {/* Deposit/Withdraw toggle */}
          <form onSubmit={handleSubmit}>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${mode === 'deposit' ? 'active' : ''}`}
                onClick={() => setMode('deposit')}
              >
                Deposit
              </button>
              <button
                type="button"
                className={`toggle-btn ${mode === 'withdraw' ? 'active' : ''}`}
                onClick={() => setMode('withdraw')}
              >
                Withdraw
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (USDC)</label>
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
              className={`btn ${mode === 'deposit' ? 'btn-primary' : 'btn-secondary'} btn-full ${
                isPending || isConfirming ? 'btn-loading' : ''
              }`}
              disabled={!isConnected || isPending || isConfirming}
            >
              {isPending
                ? 'Confirm in Wallet...'
                : isConfirming
                ? 'Confirming...'
                : mode === 'deposit'
                ? 'Deposit USDC'
                : 'Withdraw USDC'}
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
                  style={{ marginLeft: 4, color: 'var(--text-accent)' }}
                >
                  View ↗
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
