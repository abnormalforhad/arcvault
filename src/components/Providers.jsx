'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import { NotificationProvider } from './NotificationCenter';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Custom theme matching ARC purple-coral palette
const customTheme = darkTheme({
  accentColor: '#5B3A7A',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'large',
});

customTheme.colors.connectButtonBackground = 'rgba(255,255,255,0.05)';
customTheme.colors.connectButtonInnerBackground = 'rgba(255,255,255,0.07)';
customTheme.colors.modalBackground = '#1A0E2E';
customTheme.colors.modalBorder = 'rgba(255,255,255,0.06)';
customTheme.colors.profileForeground = '#1A0E2E';
customTheme.shadows.connectButton = '0 4px 20px rgba(91,58,122,0.25)';

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} modalSize="compact">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
