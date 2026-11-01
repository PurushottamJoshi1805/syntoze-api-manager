import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { VaultProvider } from '@/lib/context/vaultContext';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://syntoze-api-manager.vercel.app'),
  title: {
    default: 'Syntoze | Zero-Knowledge Developer API Key Vault',
    template: '%s | Syntoze',
  },
  description:
    'Client-encrypted zero-knowledge API key manager for engineering teams and indie hackers. Store, organize, and export secrets across dev, staging, and production with AES-256-GCM.',
  keywords: [
    'API key manager',
    'developer vault',
    'zero-knowledge encryption',
    'AES-256-GCM',
    'environment variables',
    'secrets management',
    'dotenv exporter',
    'indie hacker security',
  ],
  authors: [{ name: 'Syntoze' }],
  creator: 'Syntoze',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://syntoze-api-manager.vercel.app',
    title: 'Syntoze | Zero-Knowledge Developer API Key Vault',
    description:
      'Client-side AES-256-GCM encrypted secret manager. Your master keys never touch our servers.',
    siteName: 'Syntoze API Vault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntoze | Zero-Knowledge Developer API Key Vault',
    description:
      'Client-side AES-256-GCM encrypted secret manager for developers. Stop leaking .env keys in Git.',
    creator: '@syntoze',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#08090C] text-slate-100 font-sans antialiased selection:bg-indigo-500/25 selection:text-white">
        <VaultProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0D0E12',
                border: '1px solid #1E2231',
                color: '#F8FAFC',
              },
            }}
          />
        </VaultProvider>
      </body>
    </html>
  );
}
