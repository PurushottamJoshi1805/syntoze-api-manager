import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Syntoze - Zero-Knowledge Developer API Key Vault';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#08090C',
          padding: '70px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
          }}
        />

        {/* Top bar with Branding & Security Badge */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#11131c',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#818cf8',
                fontSize: '26px',
                fontWeight: 700,
              }}
            >
              ⛊
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                SYNTOZE
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 600 }}>
                DEVELOPER VAULT
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            <span>● Client WebCrypto AES-256-GCM</span>
          </div>
        </div>

        {/* Main Headline & Value Proposition */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Stop Leaking API Keys in Git.<br />
            <span style={{ color: '#818cf8' }}>Zero-Knowledge Developer Secrets Vault.</span>
          </h1>
          <p style={{ fontSize: '22px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Organize, audit, and securely export environment credentials across Dev, Staging &amp; Production. Master keys never leave your browser.
          </p>
        </div>

        {/* Bottom Feature Badges & Pricing Hook */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#e2e8f0',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#0e1017',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span style={{ color: '#10b981' }}>✓</span> Instant .env Batch Exporter
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#e2e8f0',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#0e1017',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span style={{ color: '#10b981' }}>✓</span> 90-Day Key Leak Prevention
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              marginLeft: 'auto',
            }}
          >
            <span style={{ color: '#a5b4fc' }}>⚡</span> Free Tier + Pro from ₹99 / $1.49
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

