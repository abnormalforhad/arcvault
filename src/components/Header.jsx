'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import ThemeToggle from './ThemeToggle';

const ARC_LOGO = 'https://2cleyyjiu4t0uoo0.public.blob.vercel-storage.com/Gradual-Arc-icon-43ee6ca5-45c5-404d-ac1b-f54f93c51f06-1761315436123.png';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="header-logo">
          <img
            src={ARC_LOGO}
            alt="ARC"
            className="header-logo-img"
          />
          <div className="header-logo-text">
            Arc<span>Vault</span>
          </div>
        </a>

        <nav className="header-nav">
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Explorer ↗
          </a>
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Faucet ↗
          </a>
          <a
            href="https://docs.arc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Docs ↗
          </a>
        </nav>

        <div className="header-right">
          <div className="network-badge">
            <span className="network-badge-dot"></span>
            Arc Testnet
          </div>
          <ThemeToggle />
          <ConnectButton
            chainStatus="icon"
            accountStatus="address"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
