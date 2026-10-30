# Syntoze API Manager: Personal API Key Vault

> Privacy-first, zero-knowledge client-side encrypted personal vault for developers to securely store, organize, and retrieve API keys across multiple projects.

---

## 🛡️ Core Security Architecture

1. **Zero-Knowledge Web Crypto**:
   - Secrets are encrypted inside the client's browser using **AES-256-GCM** (Galois/Counter Mode).
   - Keys are derived from your master passphrase using **PBKDF2-HMAC-SHA256** with $\ge 100,000$ iterations and a cryptographically secure 16-byte user salt.
   - The master passphrase is never sent to any server or written to disk.
2. **Ephemeral Memory & Auto-Lock**:
   - Master crypto keys exist only in volatile browser memory while unlocked.
   - Configurable inactivity auto-lock timer wipes in-memory crypto keys and plaintext secrets.
3. **Emergency Disaster Recovery**:
   - Formatted 24-character recovery code (`SYN-XXXX-XXXX-XXXX-XXXX`) allows mathematical key unwrapping if passphrase is lost.
   - Separates account authentication from vault decryption.
4. **Developer-First Workflow**:
   - Organized by **Project**, **Environment** (`DEV`, `STAGING`, `PROD`), and **Provider** (`OpenAI`, `Anthropic`, `Gemini`, `NVIDIA`, `Stripe`, etc.).
   - Instant masked display with deliberate reveal and auto-hide countdown.
   - One-click **Export to `.env`** for easy project bootstrapping.
   - Encrypted JSON backup export and restore.

---

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build for Production
```bash
npm run build
npm run start
```

### 3. Supabase Cloud Connection
- Run the SQL schema in [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase SQL Editor.
- Row Level Security (RLS) guarantees that only the authenticated user can access their encrypted rows and subscription record.

### 4. Cashfree Payments Gateway Setup (Pro Tier)
To enable real UPI / Cards / NetBanking payments via Cashfree:
1. Register on [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/pg/devstudio/api-keys).
2. Add your API credentials in `.env.local` (and in Vercel Project Settings):
   ```env
   CASHFREE_APP_ID=your_cashfree_app_id
   CASHFREE_SECRET_KEY=your_cashfree_secret_key
   CASHFREE_MODE=sandbox          # Set to 'production' for live payments
   NEXT_PUBLIC_CASHFREE_MODE=sandbox
   ```
3. A built-in Sandbox Demo Mode is also available for testing without active credentials.

