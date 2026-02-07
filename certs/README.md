This folder contains local development TLS certificates.

Certificates are generated using mkcert and are intentionally not committed.

Setup:
1. Install mkcert
2. Run:
   ```mkcert -cert-file cert.pem -key-file key.pem mgltickets.local "*.mgltickets.local" "localhost" "127.0.0.1" "::1"
   ```

The generated cert.pem and key.pem files should remain untracked.


Terminal Output:
```Created a new certificate valid for the following names 📜
 - "mgltickets.local"  
 - "*.mgltickets.local"
 - "localhost"
 - "127.0.0.1"
 - "::1"

Reminder: X.509 wildcards only go one level deep, so this won't match a.b.mgltickets.local ℹ️

The certificate is at "cert.pem" and the key at "key.pem" ✅

It will expire on 7 May 2028 🗓
```