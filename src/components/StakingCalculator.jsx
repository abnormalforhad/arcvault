'use client';

import { useState, useEffect, useRef } from 'react';

function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    let start = null;

    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

function formatCurrency(val) {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StakingCalculator() {
  const [deposit, setDeposit] = useState(1000);
  const [apy, setApy] = useState(8);
  const [period, setPeriod] = useState(365);
  const [periodUnit, setPeriodUnit] = useState('days');

  const daysFromUnit = (val, unit) => {
    if (unit === 'months') return val * 30;
    if (unit === 'years') return val * 365;
    return val;
  };

  const totalDays = daysFromUnit(period, periodUnit);
  const years = totalDays / 365;
  const rate = apy / 100;

  // Compound interest (daily compounding)
  const compoundEarnings = deposit * Math.pow(1 + rate / 365, totalDays) - deposit;
  // Simple interest
  const simpleEarnings = deposit * rate * years;

  const animCompound = useAnimatedNumber(compoundEarnings);
  const animSimple = useAnimatedNumber(simpleEarnings);
  const animTotal = useAnimatedNumber(deposit + compoundEarnings);
  const advantage = compoundEarnings - simpleEarnings;
  const animAdvantage = useAnimatedNumber(advantage);

  return (
    <section className="glass-card section-card animate-in delay-3">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-icon">🧮</span>
          Staking Calculator
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
        {/* Deposit Amount */}
        <div className="form-group">
          <label className="form-label" htmlFor="calc-deposit">
            Deposit Amount ($)
          </label>
          <input
            id="calc-deposit"
            className="form-input"
            type="number"
            min="0"
            step="100"
            value={deposit}
            onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))}
          />
        </div>

        {/* APY Slider */}
        <div className="form-group">
          <label className="form-label" htmlFor="calc-apy">
            APY Rate: <strong style={{ color: '#C67B6B' }}>{apy}%</strong>
          </label>
          <input
            id="calc-apy"
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={apy}
            onChange={(e) => setApy(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#5B3A7A',
              height: '6px',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#ffffff55',
              marginTop: '0.25rem',
            }}
          >
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Time Period */}
        <div className="form-group">
          <label className="form-label" htmlFor="calc-period">
            Time Period
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="calc-period"
              className="form-input"
              type="number"
              min="1"
              value={period}
              onChange={(e) => setPeriod(Math.max(1, Number(e.target.value)))}
              style={{ flex: 1 }}
            />
            <select
              className="form-input"
              value={periodUnit}
              onChange={(e) => setPeriodUnit(e.target.value)}
              style={{ flex: 0.7, cursor: 'pointer' }}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            background: 'rgba(91, 58, 122, 0.15)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid rgba(91, 58, 122, 0.25)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ResultCard
              label="Compound Interest"
              value={`$${formatCurrency(animCompound)}`}
              accent="#5B3A7A"
              sublabel="Daily compounding"
            />
            <ResultCard
              label="Simple Interest"
              value={`$${formatCurrency(animSimple)}`}
              accent="#C67B6B"
              sublabel="No compounding"
            />
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(198, 123, 107, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(198, 123, 107, 0.2)',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#ffffff88', fontSize: '0.75rem' }}>Compounding Advantage</span>
            <div style={{ color: '#C67B6B', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
              +${formatCurrency(Math.max(0, animAdvantage))}
            </div>
          </div>
        </div>

        {/* Total projection */}
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, rgba(91,58,122,0.2), rgba(198,123,107,0.2))',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: '#ffffff88', fontSize: '0.8rem' }}>Projected Portfolio Value</span>
          <div
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #5B3A7A, #C67B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '0.25rem',
            }}
          >
            ${formatCurrency(animTotal)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, accent, sublabel }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#ffffff88', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ color: accent, fontSize: '1.2rem', fontWeight: 700 }}>{value}</div>
      {sublabel && (
        <div style={{ color: '#ffffff44', fontSize: '0.65rem', marginTop: '0.15rem' }}>{sublabel}</div>
      )}
    </div>
  );
}
