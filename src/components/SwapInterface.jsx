'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';

const TOKENS = {
  USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 6, icon: '💵' },
  EURC: { symbol: 'EURC', name: 'Euro Coin', decimals: 6, icon: '💶' },
};

const RATES = {
  'USDC→EURC': 0.92,
  'EURC→USDC': 1.087,
};

const SLIPPAGE = 0.1;

export default function SwapInterface() {
  const { address, isConnected } = useAccount();
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('EURC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rateKey = `${fromToken}→${toToken}`;
  const rate = RATES[rateKey];

  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount) && Number(fromAmount) > 0) {
      setToAmount((Number(fromAmount) * rate).toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, rate]);

  useEffect(() => {
    if (isSuccess) {
      setStatusMsg(`✅ Swap confirmed! Tx: ${hash?.slice(0, 10)}…`);
      setFromAmount('');
      setToAmount('');
    }
  }, [isSuccess, hash]);

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = () => {
    if (!isConnected) {
      setStatusMsg('⚠️ Connect wallet first');
      return;
    }
    if (!fromAmount || Number(fromAmount) <= 0) {
      setStatusMsg('⚠️ Enter a valid amount');
      return;
    }

    setStatusMsg('');

    const contractAddr =
      fromToken === 'USDC' ? CONTRACTS.USDC : CONTRACTS.EURC;

    writeContract({
      address: contractAddr,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [
        CONTRACTS.TREASURY ?? address,
        parseUnits(fromAmount, TOKENS[fromToken].decimals),
      ],
    });
  };

  const minReceived = toAmount
    ? (Number(toAmount) * (1 - SLIPPAGE / 100)).toFixed(6)
    : '0.000000';

  return (
    <div className="section-card animate-in delay-3">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">🔄</span>
          Swap
        </h2>
        <span className="section-badge">Instant</span>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {/* From */}
        <div className="form-group">
          <label className="form-label">
            From ({TOKENS[fromToken].icon} {fromToken})
          </label>
          <input
            className="form-input"
            type="number"
            placeholder="0.00"
            min="0"
            step="any"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>

        {/* Direction toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
          <button
            className="btn"
            onClick={handleSwapDirection}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Reverse direction"
          >
            ↕
          </button>
        </div>

        {/* To */}
        <div className="form-group">
          <label className="form-label">
            To ({TOKENS[toToken].icon} {toToken})
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="0.00"
            value={toAmount}
            readOnly
          />
        </div>

        {/* Rate & slippage */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            opacity: 0.7,
            margin: '0.75rem 0',
          }}
        >
          <span>
            Rate: 1 {fromToken} = {rate} {toToken}
          </span>
          <span>Slippage: {SLIPPAGE}%</span>
        </div>

        {toAmount && (
          <div
            style={{
              fontSize: '0.8rem',
              opacity: 0.6,
              marginBottom: '0.75rem',
            }}
          >
            Min received: {minReceived} {toToken}
          </div>
        )}

        {/* Toggle group (visual only) */}
        <div className="toggle-group" style={{ marginBottom: '1rem' }}>
          <button
            className={`toggle-btn ${fromToken === 'USDC' ? 'active' : ''}`}
            onClick={() => {
              setFromToken('USDC');
              setToToken('EURC');
              setFromAmount('');
            }}
          >
            USDC → EURC
          </button>
          <button
            className={`toggle-btn ${fromToken === 'EURC' ? 'active' : ''}`}
            onClick={() => {
              setFromToken('EURC');
              setToToken('USDC');
              setFromAmount('');
            }}
          >
            EURC → USDC
          </button>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleSwap}
          disabled={isPending || isConfirming || !fromAmount}
        >
          {isPending
            ? 'Confirm in Wallet…'
            : isConfirming
            ? 'Confirming…'
            : 'Swap'}
        </button>

        {statusMsg && (
          <p className="status-message" style={{ marginTop: '0.75rem' }}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}
