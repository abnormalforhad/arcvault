'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('arcvault-theme');
    if (saved === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-theme');
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    setIsLight((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('arcvault-theme', 'light');
      } else {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('arcvault-theme', 'dark');
      }
      return next;
    });
  };

  // Avoid hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: isLight
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(91, 58, 122, 0.3)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: isLight ? '#2a1a3e' : '#ffffffcc',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isLight
          ? '0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(91, 58, 122, 0.3)',
        outline: 'none',
        lineHeight: 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = isLight
          ? '0 4px 14px rgba(0,0,0,0.15)'
          : '0 4px 14px rgba(91, 58, 122, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isLight
          ? '0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(91, 58, 122, 0.3)';
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isLight ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: '1rem',
        }}
      >
        {isLight ? '☀️' : '🌙'}
      </span>
      <span>{isLight ? 'Light' : 'Dark'}</span>
    </button>
  );
}
