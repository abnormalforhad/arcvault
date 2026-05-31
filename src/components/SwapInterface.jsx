'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ERC20_ABI, SWAP_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

const RATE_USDC_EURC = 0.92;
const RATE_EURC_USDC = 1.087;
const SLIPPAGE = 0.1;

export default function SwapInterface() {
  const { address, isConnected } = useAccount();
  const [direction, setDirection] = useState('USDC_TO_EURC'); // or EURC_TO_USDC
  const [inputAmount, setInputAmount] = useState('');
  const [step, setStep] = useState('idle'); // idle | approving | swapping
  const [status, setStatus] = useState(null);

  const isSwapDeployed = CONTRACTS.SWAP !== '0x0000000000000000000000000000000000000000';

  const fromToken = direction === 'USDC_TO_EURC' ? 'USDC' : 'EURC';
  const toToken = direction === 'USDC_TO_EURC' ? 'EURC' : 'USDC';
  const rate = direction === 'USDC_TO_EURC' ? RATE_USDC_EURC : RATE_EURC_USDC;
  const fromAddress = direction === 'USDC_TO_EURC' ? CONTRACTS.USDC : CONTRACTS.EURC;

  // Read user balance of from-token
  const { data: fromBalance } = useReadContract({
    address: fromAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: arcTestnet.id,
    query: { enabled: isConnected && !!address, refetchInterval: 5000 },
  });

  // Read decimals
  const { data: fromDecimals } = useReadContract({
    address: fromAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: arcTestnet.id,
    query: { enabled: isConnected },
  });

  const decimals = fromDecimals ? Number(fromDecimals) : 6;

  const outputAmount = inputAmount && !isNaN(inputAmount) && Number(inputAmount) > 0
    ? (Number(inputAmount) * rate * (1 - SLIPPAGE / 100)).toFixed(6)
    : '';

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      if (step === 'approving') {
        // Approval done, now swap
        setStep('swapping');
        setStatus({ type: 'info', msg: 'Approved! Now confirm swap...' });

        const amountParsed = parseUnits(inputAmount, decimals);
        const swapFn = direction === 'USDC_TO_EURC' ? 'swapUSDCtoEURC' : 'swapEURCtoUSDC';

        reset();
        setTimeout(() => {
          writeContract({
            address: CONTRACTS.SWAP,
            abi: SWAP_ABI,
            functionName: swapFn,
            args: [amountParsed],
          });
        }, 500);
      } else if (step === 'swapping') {
        setStatus({
          type: 'success',
          msg: `Swapped ${inputAmount} ${fromToken} → ${outputAmount} ${toToken}!`,
          hash,
        });
        setStep('idle');
        setInputAmount('');
      }
    }
  }, [isSuccess]);

  const handleSwap = () => {
    setStatus(null);

    if (!inputAmount || Number(inputAmount) <= 0) {
      setStatus({ type: 'error', msg: 'Enter a valid amount' });
      return;
    }

    if (!isSwapDeployed) {
      setStatus({ type: 'error', msg: 'Swap contract not deployed yet. Deploy ArcSwap.sol first.' });
      return;
    }

    const amountParsed = parseUnits(inputAmount, decimals);

    // Step 1: Approve
    setStep('approving');
    setStatus({ type: 'info', msg: `Approve ${fromToken} spend...` });

    reset();
    writeContract({
      address: fromAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.SWAP, amountParsed],
    });
  };

  const toggleDirection = () => {
    setDirection(d => d === 'USDC_TO_EURC' ? 'EURC_TO_USDC' : 'USDC_TO_EURC');
    setInputAmount('');
    setStatus(null);
    setStep('idle');
  };

  const formattedBalance = fromBalance !== undefined
    ? parseFloat(formatUnits(fromBalance, decimals)).toFixed(4)
    : '—';

  return (
    <div className="glass-card section-card animate-in delay-3">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(198,123,107,0.12)', color: '#D4917A' }}
          >
            ⇄
          </div>
          Swap
        </div>
        <div className="section-badge">
          {isSwapDeployed ? 'Live' : 'Deploy Required'}
        </div>
      </div>

      {/* Direction toggle */}
      <div className="toggle-group">
        <button
          className={`toggle-btn ${direction === 'USDC_TO_EURC' ? 'active' : ''}`}
          onClick={() => { setDirection('USDC_TO_EURC'); setInputAmount(''); setStatus(null); }}
        >
          USDC → EURC
        </button>
        <button
          className={`toggle-btn ${direction === 'EURC_TO_USDC' ? 'active' : ''}`}
          onClick={() => { setDirection('EURC_TO_USDC'); setInputAmount(''); setStatus(null); }}
        >
          EURC → USDC
        </button>
      </div>

      {/* From */}
      <div className="swap-container">
        <div className="swap-token-box">
          <div className="swap-token-label">From</div>
          <div className="swap-token-row">
            <input
              className="swap-token-input"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              disabled={!isConnected}
            />
            <div className="swap-token-name">{fromToken}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Balance: {formattedBalance} {fromToken}
          </div>
        </div>

        {/* Swap direction button */}
        <button className="swap-arrow-btn" onClick={toggleDirection}>↕</button>

        {/* To */}
        <div className="swap-token-box">
          <div className="swap-token-label">To (estimated)</div>
          <div className="swap-token-row">
            <input
              className="swap-token-input"
              type="text"
              placeholder="0.00"
              value={outputAmount}
              readOnly
            />
            <div className="swap-token-name">{toToken}</div>
          </div>
        </div>
      </div>

      {/* Rate & Slippage */}
      <div className="swap-rate">
        <span>1 {fromToken} = {rate} {toToken}</span>
        <span>Slippage: {SLIPPAGE}%</span>
      </div>

      {/* Swap button */}
      <button
        className={`btn btn-primary btn-full ${isPending || isConfirming ? 'btn-loading' : ''}`}
        onClick={handleSwap}
        disabled={!isConnected || isPending || isConfirming || !inputAmount}
      >
        {isPending
          ? 'Confirm in Wallet...'
          : isConfirming
          ? step === 'approving' ? 'Approving...' : 'Swapping...'
          : `Swap ${fromToken} → ${toToken}`}
      </button>

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
