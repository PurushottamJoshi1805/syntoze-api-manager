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

### 3. Supabase Cloud Connection (Optional)
When you are ready to persist to Supabase:
- Run the SQL migrations in [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase SQL Editor.
- Row Level Security (RLS) guarantees that only the authenticated user can access their encrypted rows.

