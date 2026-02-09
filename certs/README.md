# SSL Certificates - Local HTTPS Development

## 📍 Location
`/certs/`

## 🎯 Purpose

This directory contains **SSL certificates for local HTTPS development**. These certificates allow your development environment to run on HTTPS, which is required for:

1. **Cookie security** - Cookies with `Secure` flag only work on HTTPS
2. **Cross-subdomain authentication** - Modern browsers block certain cookie configurations on HTTP
3. **Development/Production parity** - Local environment matches production exactly
4. **Testing HTTPS-specific features** - Service workers, secure contexts, etc.

## 📁 Files in This Directory

```
certs/
├── cert.pem       # SSL certificate (public)
├── key.pem        # Private key (keep secret!)
└── README.md      # This file
```

## 🔐 What Are These Files?

### `cert.pem` (Certificate)
- Public certificate that browsers use to verify the server's identity
- Contains information about who the certificate is issued to
- Safe to share (but no need to commit to git)

### `key.pem` (Private Key)
- **Secret key** that proves you own the certificate
- **NEVER share this file publicly**
- **NEVER commit to git** (it's in `.gitignore`)
- If compromised, regenerate certificates immediately

## 🛠️ How These Were Created

These certificates were generated using `mkcert`, a tool for creating locally-trusted development certificates:

```bash
# 1. Install mkcert (one-time)
[Mkcert Installation Guide](../../docs/AUTHENTICATION.md)

# 2. Install local Certificate Authority (one-time)
mkcert -install

# 3. Generate certificates for our domains
mkcert -cert-file cert.pem -key-file key.pem \
  "mgltickets.local" \
  "*.mgltickets.local" \
  "localhost" \
  "127.0.0.1" \
  "::1"
```

## ✅ What Domains Are Covered?

These certificates are valid for:
- `mgltickets.local`
- `*.mgltickets.local` (any subdomain)
  - `organizer.mgltickets.local`
  - `admin.mgltickets.local`
  - `api.mgltickets.local`
- `localhost`
- `127.0.0.1`
- `::1` (IPv6 localhost)

## 🔄 Regenerating Certificates

You'll need to regenerate if:
- Certificates expire (mkcert certs last ~2 years)
- You add new domains
- Private key is compromised
- You get certificate errors in browser

**To regenerate:**

```bash
cd /path/to/mgl-frontend/certs

# Remove old certificates
rm cert.pem key.pem

# Generate new ones
mkcert -cert-file cert.pem -key-file key.pem \
  "mgltickets.local" \
  "*.mgltickets.local" \
  "localhost" \
  "127.0.0.1" \
  "::1"

# Restart all dev servers
```

## 🚫 .gitignore

**These files should NEVER be committed to git:**

```gitignore
# In your .gitignore
certs/*.pem
certs/*.key
```

**Why?**
1. **Security** - Private keys should never be in version control
2. **Machine-specific** - Each developer should generate their own
3. **CA trust** - Certificates are tied to local CA installation

## 👥 Team Setup

When a new team member joins:

1. **They need to set up their own certificates:**
   ```bash
   # Install mkcert
   mkcert -install
   
   # Generate certificates
   cd mgl-frontend
   mkdir certs
   cd certs
   mkcert -cert-file cert.pem -key-file key.pem \
     "mgltickets.local" \
     "*.mgltickets.local" \
     "localhost" \
     "127.0.0.1" \
     "::1"
   ```

2. **Update hosts file**
   ```
   127.0.0.1 mgltickets.local
   127.0.0.1 organizer.mgltickets.local
   127.0.0.1 admin.mgltickets.local
   127.0.0.1 api.mgltickets.local
   ```

3. **Start dev servers**
   ```bash
   npm run dev
   ```

## 🔧 How Vite Uses These Certificates

Each app's `vite.config.ts` references these certificates:

```typescript
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../../../certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../../certs/cert.pem')),
    },
  },
});
```

This tells Vite to serve the app over HTTPS using these certificates.

## 🐛 Troubleshooting

### Browser Shows "Not Secure" Warning

**Problem:** Browser doesn't trust the certificate

**Solution:**
```bash
# Reinstall the local CA
mkcert -install

# Restart browser completely (close all windows)
```

### "Certificate Signed by Unknown Authority"

**Problem:** Local CA not installed in system trust store

**Solution:**
```bash
# Check where CA is installed
mkcert -CAROOT

# Reinstall
mkcert -install
```

### Certificate Expired

**Problem:** Certificates are valid for ~2 years

**Solution:** Regenerate certificates (see "Regenerating Certificates" above)

### Wrong Domain in Certificate

**Problem:** Accessing `api.mgltickets.local` but certificate doesn't include it

**Solution:** Regenerate with all needed domains:
```bash
mkcert -cert-file cert.pem -key-file key.pem \
  "mgltickets.local" \
  "*.mgltickets.local" \
  "api.mgltickets.local" \  # Add specific domains if needed
  "localhost" \
  "127.0.0.1" \
  "::1"
```

## 🔒 Security Notes

### These Are For Development Only!

**DO NOT use these certificates in production!**

Production should use:
- Let's Encrypt (free, automated)
- CloudFlare SSL
- Commercial SSL certificates
- Or your hosting provider's SSL

### Keep Private Keys Private

If `key.pem` is ever exposed:
1. Delete it immediately
2. Generate new certificates
3. Update `.gitignore` to prevent future exposure
4. Rotate any other secrets that might be compromised

### Trust Store

mkcert installs a local Certificate Authority (CA) in your system's trust store. This CA is used to sign the development certificates.

**Location of CA:**
```bash
mkcert -CAROOT
# Shows path like: /Users/you/Library/Application Support/mkcert
```

The root CA files are also secret and should never be shared!

## 📖 Additional Resources

- [mkcert Documentation](https://github.com/FiloSottile/mkcert)
- [Why HTTPS in Development](https://web.dev/when-to-use-local-https/)
- [How HTTPS Works](https://howhttps.works/)

## ✅ Checklist for New Developers

- [ ] Install mkcert
- [ ] Run `mkcert -install`
- [ ] Generate certificates in `/certs` directory
- [ ] Verify `cert.pem` and `key.pem` exist
- [ ] Update hosts file with local domains
- [ ] Start dev servers with `npm run dev`
- [ ] Visit `https://mgltickets.local:3000` - should show lock icon 🔒
- [ ] No browser security warnings

---

**Remember:** These certificates enable secure local development. Without them, authentication won't work properly because cookies will be blocked by the browser!