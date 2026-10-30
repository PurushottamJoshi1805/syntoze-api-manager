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
  title: 'Syntoze | Developer API Key Vault',
  description:
    'Zero-knowledge personal API key manager for engineering teams and indie builders. Store, organize, and export secrets across environments.',
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
