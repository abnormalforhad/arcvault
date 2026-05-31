'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { ERC20_ABI, CONTRACTS } from '@/config/contracts';
import { arcTestnet } from '@/config/wagmi';

export default function TransactionHistory() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient({ chainId: arcTestnet.id });

  useEffect(() => {
    if (!isConnected || !address || !publicClient) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        // Look back ~1000 blocks
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;

        // Get Transfer events where user is sender
        const sentLogs = await publicClient.getLogs({
          address: CONTRACTS.USDC,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
          },
          args: { from: address },
          fromBlock,
          toBlock: currentBlock,
        });

        // Get Transfer events where user is receiver
        const receivedLogs = await publicClient.getLogs({
          address: CONTRACTS.USDC,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
          },
          args: { to: address },
          fromBlock,
          toBlock: currentBlock,
        });

        const allTx = [
          ...sentLogs.map((log) => ({
            type: 'send',
            amount: log.args.value,
            counterparty: log.args.to,
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
          })),
          ...receivedLogs.map((log) => ({
            type: 'receive',
            amount: log.args.value,
            counterparty: log.args.from,
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
          })),
        ]
          .sort((a, b) => Number(b.blockNumber - a.blockNumber))
          .slice(0, 10);

        setTransactions(allTx);
      } catch (err) {
        console.error('Failed to fetch tx history:', err);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [address, isConnected, publicClient]);

  const shortenAddr = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(formatUnits(amount, 6)).toFixed(2);
  };

  return (
    <div className="glass-card section-card main-grid-full animate-in delay-4">
      <div className="section-header">
        <div className="section-title">
          <div
            className="section-title-icon"
            style={{ background: 'rgba(255,183,77,0.1)', color: '#FFB74D' }}
          >
            📋
          </div>
          Recent Transactions
        </div>
        <div className="section-badge">USDC</div>
      </div>

      {loading ? (
        <div className="tx-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }}></div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No recent transactions</div>
          <div className="empty-state-sub">
            Send or receive USDC to see activity here
          </div>
        </div>
      ) : (
        <div className="tx-list">
          {transactions.map((tx, i) => (
            <div key={`${tx.hash}-${i}`} className="tx-item">
              <div className="tx-left">
                <div className={`tx-icon ${tx.type}`}>
                  {tx.type === 'send' ? '↑' : '↓'}
                </div>
                <div>
                  <div className="tx-type">
                    {tx.type === 'send' ? 'Sent' : 'Received'}
                  </div>
                  <div className="tx-time">
                    {tx.type === 'send' ? 'To: ' : 'From: '}
                    {shortenAddr(tx.counterparty)}
                  </div>
                </div>
              </div>
              <div className="tx-right">
                <div className={`tx-amount ${tx.type === 'send' ? 'negative' : 'positive'}`}>
                  {tx.type === 'send' ? '-' : '+'}
                  {formatAmount(tx.amount)} USDC
                </div>
                <div className="tx-hash">
                  <a
                    href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.hash?.slice(0, 10)}...
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
