import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'ArcVault — DeFi Dashboard on ARC',
  description:
    'Premium DeFi dashboard for Circle\'s ARC blockchain. Manage USDC & EURC, stake in vaults, and track transactions with sub-second finality.',
  openGraph: {
    title: 'ArcVault — DeFi Dashboard on ARC',
    description:
      'Manage stablecoins on ARC — the stablecoin-native L1 by Circle.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
