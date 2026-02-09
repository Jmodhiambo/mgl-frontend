# DEFINITIVE GUIDE: HTTPS Local Development with mkcert

## 🎯 What We're Building

A professional local development environment that mirrors production exactly:

**Development URLs:**
- User App: `https://mgltickets.local:3000`
- Organizer App: `https://organizer.mgltickets.local:3001`
- Admin App: `https://admin.mgltickets.local:3002`
- Backend API: `https://api.mgltickets.local:8000`

**Cookie Settings:**
- Domain: `.mgltickets.local`
- Secure: `true`
- SameSite: `none`
- HttpOnly: `true`

**Time to complete:** 45 minutes
**Difficulty:** Medium (but worth it!)

---

## PHASE 1: Install mkcert & Create Certificates (15 min)

### Step 1.1: Install mkcert

**On Windows (using Chocolatey):**
```bash
# Download the Windows binary from the mkcert GitHub releases
mkcert-vX.X.X-windows-amd64.exe

# Rename it to mkcert.exe and move it to a folder in your PATH (e.g., C:\Windows\System32)
mkcert.exe

# Verify installation
mkcert -version
```

**On Windows (using Scoop):**
```bash
scoop bucket add extras
scoop install mkcert
```

**On macOS:**
```bash
brew install mkcert
brew install nss  # For Firefox
```

**On Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert

# Or use your package manager if available
```

### Step 1.2: Install Local Certificate Authority

```bash
# This creates and installs a local CA in your system trust store
mkcert -install
```

**Expected output:**
```
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️
```

### Step 1.3: Create Certificates Directory

Navigate to your project root:

```bash
cd E:/mgl-frontend
mkdir -p certs
cd certs
```

### Step 1.4: Generate Certificates

**Generate certificates for all your domains:**

```bash
mkcert -cert-file cert.pem -key-file key.pem \
  "mgltickets.local" \
  "*.mgltickets.local" \
  "localhost" \
  "127.0.0.1" \
  "::1"
```

**Expected output:**
```
Created a new certificate valid for the following names 📜
 - "mgltickets.local"
 - "*.mgltickets.local"
 - "localhost"
 - "127.0.0.1"
 - "::1"

The certificate is at "./cert.pem" and the key at "./key.pem" ✅
```

**Verify files were created:**
```bash
ls -la
# Should see:
# cert.pem
# key.pem
```

---

## PHASE 2: Update Hosts File (5 min)

### Step 2.1: Edit Hosts File

**On Windows:**
1. Press `Windows Key`
2. Type: `notepad`
3. Right-click "Notepad"
4. Click "Run as administrator"
5. Click "File" → "Open"
6. Navigate to: `C:\Windows\System32\drivers\etc\`
7. Change file type dropdown to "All Files"
8. Open file named `hosts` (no extension)

**On Mac/Linux:**
```bash
sudo nano /etc/hosts
```

### Step 2.2: Add These Lines

Add to the bottom of the hosts file:

```
# MGLTickets Local Development
127.0.0.1 mgltickets.local
127.0.0.1 organizer.mgltickets.local
127.0.0.1 admin.mgltickets.local
127.0.0.1 api.mgltickets.local
```

**Save and close.**

### Step 2.3: Flush DNS Cache

**Windows:**
```bash
ipconfig /flushdns
```

**Mac:**
```bash
sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

### Step 2.4: Verify Hosts File

```bash
ping mgltickets.local
ping api.mgltickets.local
```

Should all respond with `127.0.0.1`. Press `Ctrl+C` to stop.

---

## PHASE 3: Update Frontend Vite Configs (10 min)

### Step 3.1: User App Vite Config

**File: `src/apps/user/vite.config.ts`**

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../../"), '');

  return {
    root: path.resolve(__dirname),
    envDir: path.resolve(__dirname, "../../../"),
    cacheDir: "../../../node_modules/.vite",
    
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "../../shared"),
        "@user": path.resolve(__dirname, "./"),
      },
    },
    
    server: {
      port: 3000,
      host: true,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "../../../certs/key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "../../../certs/cert.pem")),
      },
      allowedHosts: ['.local'],
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://api.mgltickets.local:8000",
          changeOrigin: true,
          secure: false,  // Allow self-signed certs in dev
        },
      },
    },
    
    base: '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/user"),
      emptyOutDir: true,
    },
  };
});
```

### Step 3.2: Organizer App Vite Config

**File: `src/apps/organizer/vite.config.ts`**

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../../"), '');

  return {
    root: path.resolve(__dirname),
    envDir: path.resolve(__dirname, "../../../"),
    cacheDir: "../../../node_modules/.vite",
    
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "../../shared"),
        "@organizer": path.resolve(__dirname, "./"),
      },
    },
    
    server: {
      port: 3001,
      host: true,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "../../../certs/key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "../../../certs/cert.pem")),
      },
      allowedHosts: ['.local'],
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://api.mgltickets.local:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    base: '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/organizer"),
      emptyOutDir: true,
    },
  };
});
```

### Step 3.3: Admin App Vite Config

**File: `src/apps/admin/vite.config.ts`**

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../../"), '');

  return {
    root: path.resolve(__dirname),
    envDir: path.resolve(__dirname, "../../../"),
    cacheDir: "../../../node_modules/.vite",
    
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "../../shared"),
        "@admin": path.resolve(__dirname, "./"),
      },
    },
    
    server: {
      port: 3002,
      host: true,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "../../../certs/key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "../../../certs/cert.pem")),
      },
      allowedHosts: ['.local'],
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://api.mgltickets.local:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    base: '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/admin"),
      emptyOutDir: true,
    },
  };
});
```

---

## PHASE 4: Update Frontend Environment Variables (2 min)

### `.env.development`

```bash
# Backend API
VITE_API_URL=https://api.mgltickets.local:8000

# App Domains (Development - HTTPS)
VITE_USER_DOMAIN=https://mgltickets.local:3000
VITE_ORGANIZER_DOMAIN=https://organizer.mgltickets.local:3001
VITE_ADMIN_DOMAIN=https://admin.mgltickets.local:3002
```

### `.env.production`

```bash
# Backend API
VITE_API_URL=https://api.mgltickets.com

# App Domains (Production)
VITE_USER_DOMAIN=https://mgltickets.com
VITE_ORGANIZER_DOMAIN=https://organizer.mgltickets.com
VITE_ADMIN_DOMAIN=https://admin.mgltickets.com
```

---

## PHASE 5: Update Backend for HTTPS (10 min)

### Step 5.1: Update Backend Environment Files

**Backend `.env.development`**

```bash
# Environment
ENVIRONMENT=development

# Cookie settings
COOKIE_DOMAIN=.mgltickets.local

# CORS
ALLOWED_ORIGINS=https://mgltickets.local:3000,https://organizer.mgltickets.local:3001,https://admin.mgltickets.local:3002

# Frontend URL
FRONTEND_URL=https://mgltickets.local:3000
```

### Step 5.2: Update Cookie Settings in auth.py

**File: `backend/app/routes/auth.py`**

Update both login and refresh endpoints:

```python
from fastapi.responses import JSONResponse

# Login endpoint
@router.post("/auth/login", status_code=status.HTTP_200_OK)
async def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token with refresh token cookie."""
    
    email: str = form.username
    user: UserOut = await get_user_by_email_service(email)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    if not await authenticate_user_service(user.id, email, form.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate tokens
    access_token = create_access_token(user.id)
    session_id = str(uuid.uuid4().hex)
    refresh_token = create_refresh_token(user.id, session_id)
    refresh_token_hash = hash_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    # Create refresh session
    await create_refresh_session_service(
        session_id=session_id,
        user_id=user.id,
        refresh_token_hash=refresh_token_hash,
        expires_at=expires_at,
    )

    # Create response with cookie
    response = JSONResponse(
        content={
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 900,
        }
    )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # ⭐ TRUE for HTTPS
        samesite="none",  # ⭐ NONE for cross-subdomain
        domain=COOKIE_DOMAIN,
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    print(f"🍪 Cookie set - Domain: {COOKIE_DOMAIN}, Secure: True, SameSite: none")

    return response


# Refresh endpoint
@router.post("/auth/refresh")
async def refresh_token(request: Request):
    """Rotate refresh token and issue new access token."""
    
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )
    
    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("id")
    session_id = payload.get("sid")

    if not user_id or not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    # Fetch and verify session
    session = await get_refresh_session_service(session_id)

    if not session or session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if session.revoked_at:
        time_since_revoked = datetime.now(timezone.utc) - convert_eat_to_utc(session.revoked_at)
        if time_since_revoked.total_seconds() < 5:
            new_session = await get_refresh_session_service(session_id)
            if new_session and not new_session.revoked_at:
                return JSONResponse(
                    content={
                        "access_token": create_access_token(user_id),
                        "token_type": "bearer",
                        "expires_in": 3600,
                    }
                )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked",
        )

    if session.expires_at < datetime.now():
        await delete_refresh_session_service(session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    
    if not verify_token(refresh_token, session.refresh_token_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Rotate refresh token
    new_session_id = str(uuid.uuid4().hex)
    new_refresh_token = create_refresh_token(user_id, new_session_id)
    refresh_token_hash = hash_token(new_refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await create_refresh_session_service(
        session_id=new_session_id,
        user_id=user_id,
        refresh_token_hash=refresh_token_hash,
        expires_at=expires_at
    )

    await revoke_refresh_session_service(session_id, new_session_id)

    # Create response with new cookie
    response = JSONResponse(
        content={
            "access_token": create_access_token(user_id),
            "token_type": "bearer",
            "expires_in": 3600,
        }
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,  # ⭐ NEW token, not old!
        httponly=True,
        secure=True,
        samesite="none",
        domain=COOKIE_DOMAIN,
        path="/",
        max_age=7 * 24 * 60 * 60
    )
      
    return response
```

### Step 5.3: Run Backend with HTTPS

**Option A: Using uvicorn with SSL (Recommended)**

Create a startup script:

**File: `run_dev.py`** (in backend root)

```python
#!/usr/bin/env python3
"""Development server with HTTPS support."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ssl_keyfile="../mgl-frontend/certs/key.pem",
        ssl_certfile="../mgl-frontend/certs/cert.pem",
    )
```

**Run it:**
```bash
python run_dev.py
```

**Option B: Manual uvicorn command**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
  --ssl-keyfile=../mgl-frontend/certs/key.pem \
  --ssl-certfile=../mgl-frontend/certs/cert.pem
```

### Step 5.4: Update CORS in main.py

**File: `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import ALLOWED_ORIGINS

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Uses .env ALLOWED_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["set-cookie", "Set-Cookie"],
)

# Debug print
print("=" * 50)
print(f"🌐 ALLOWED ORIGINS: {ALLOWED_ORIGINS}")
print("=" * 50)
```

---

## PHASE 6: Start Everything & Test (10 min)

### Step 6.1: Start Backend

```bash
cd path/to/backend
python run_dev.py
```

**Expected output:**
```
==================================================
🌐 ALLOWED ORIGINS: ['https://mgltickets.local:3000', 'https://organizer.mgltickets.local:3001', 'https://admin.mgltickets.local:3002']
==================================================
INFO:     Uvicorn running on https://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 6.2: Start Frontend

```bash
cd path/to/frontend
npm run dev
```

**Expected output:**
```
[0]   VITE v7.3.0  ready in XXX ms
[0]
[0]   ➜  Local:   https://localhost:3000/
[0]   ➜  Network: https://mgltickets.local:3000/
[1]
[1]   VITE v7.3.0  ready in XXX ms
[1]
[1]   ➜  Local:   https://localhost:3001/
[1]   ➜  Network: https://organizer.mgltickets.local:3001/
[2]
[2]   VITE v7.3.0  ready in XXX ms
[2]
[2]   ➜  Local:   https://localhost:3002/
[2]   ➜  Network: https://admin.mgltickets.local:3002/
```

### Step 6.3: Test User App

1. Open browser
2. Go to: `https://mgltickets.local:3000`
3. Browser should NOT show any security warnings ✅
4. Page should load normally ✅

### Step 6.4: Test Login

1. Go to: `https://mgltickets.local:3000/login`
2. Login with organizer credentials
3. Open DevTools (F12)
4. Go to: **Application** → **Cookies** → `https://mgltickets.local:3000`
5. **Should see `refresh_token` cookie with:**
   - Domain: `.mgltickets.local` ✅
   - Secure: ✓ (checked) ✅
   - HttpOnly: ✓ (checked) ✅
   - SameSite: `None` ✅

**TAKE A SCREENSHOT OF THIS - YOU'LL WANT TO CELEBRATE! 🎉**

### Step 6.5: Test Cookie Persistence

1. **Refresh the page** (F5)
2. Should stay logged in ✅
3. Check Console - should NOT see refresh errors ✅
4. Check Network tab → `/auth/refresh` should return 200 ✅

### Step 6.6: Test Organizer App

1. Navigate to: `https://organizer.mgltickets.local:3001`
2. Should load organizer dashboard WITHOUT redirecting to login ✅
3. Check DevTools → Application → Cookies
4. Should see the SAME `refresh_token` cookie here too! ✅

### Step 6.7: Test Admin App

1. Navigate to: `https://admin.mgltickets.local:3002`
2. Should work similarly (if you have admin role) ✅

---

## VERIFICATION CHECKLIST

Before celebrating, verify ALL of these:

- [ ] No browser security warnings on any domain
- [ ] `https://mgltickets.local:3000` loads without errors
- [ ] `https://organizer.mgltickets.local:3001` loads without errors
- [ ] `https://admin.mgltickets.local:3002` loads without errors
- [ ] `https://api.mgltickets.local:8000` responds (check /docs)
- [ ] Can login successfully
- [ ] `refresh_token` cookie appears in DevTools
- [ ] Cookie has `Secure` flag checked
- [ ] Cookie has `HttpOnly` flag checked
- [ ] Cookie domain is `.mgltickets.local`
- [ ] Cookie `SameSite` is `None`
- [ ] Page refresh keeps you logged in
- [ ] Can navigate from user app to organizer app while staying logged in
- [ ] Can navigate from organizer back to user app while staying logged in
- [ ] No console errors
- [ ] Backend terminal shows "Setting cookie" log
- [ ] Backend shows no CORS errors

---

## TROUBLESHOOTING

### Issue: Browser shows "Not Secure" warning

**Solution:**
1. Make sure you ran `mkcert -install`
2. Restart browser completely
3. Clear browser cache
4. On Windows, you may need to restart computer

### Issue: "net::ERR_CERT_AUTHORITY_INVALID"

**Solution:**
1. Check that certificates are in the right location
2. Verify certificate was generated for the domain
3. Run `mkcert -install` again
4. Restart browser

### Issue: "UNABLE_TO_VERIFY_LEAF_SIGNATURE"

**Solution:**
Backend can't verify frontend's certificate. Update backend to trust mkcert CA or use `ssl_verify=False` in development.

### Issue: No cookie appears

**Solution:**
1. Check backend terminal - does it print "Setting cookie"?
2. Check Network tab → login request → Response Headers
3. Look for `set-cookie` header
4. If not there, backend issue
5. If there but not in Application tab, CORS issue

### Issue: Cookie appears but refresh still fails

**Solution:**
1. Check cookie domain matches (should be `.mgltickets.local`)
2. Check Secure flag is checked
3. Check SameSite is `None`
4. Verify backend is running on HTTPS

### Issue: CORS errors in console

**Solution:**
1. Verify `ALLOWED_ORIGINS` includes the correct HTTPS URLs
2. Check `allow_credentials=True` in CORS middleware
3. Restart backend after changing CORS settings

---

## PRODUCTION DEPLOYMENT

When deploying to production, your setup is ready! Just:

1. **Update `.env.production`** on backend:
   ```bash
   ENVIRONMENT=production
   COOKIE_DOMAIN=.mgltickets.com
   ALLOWED_ORIGINS=https://mgltickets.com,https://organizer.mgltickets.com,https://admin.mgltickets.com
   ```

2. **Use proper SSL certificates** (Let's Encrypt, Cloudflare, etc.)

3. **No code changes needed** - everything is environment-driven!

---

## CONGRATULATIONS! 🎉

You now have:
- ✅ Professional local HTTPS development environment
- ✅ Trusted SSL certificates (no browser warnings)
- ✅ Cookies working perfectly across subdomains
- ✅ Development that mirrors production exactly
- ✅ Secure, HttpOnly, SameSite=None cookies
- ✅ No more authentication headaches!

**This is industry-standard, production-ready setup!**

Time to celebrate and move forward with building your app! 🚀

---

## Quick Reference Commands

**Start everything:**
```bash
# Terminal 1 - Backend
cd backend
python run_dev.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access apps:**
- User: https://mgltickets.local:3000
- Organizer: https://organizer.mgltickets.local:3001
- Admin: https://admin.mgltickets.local:3002
- API Docs: https://api.mgltickets.local:8000/docs

**Verify setup:**
```bash
ping mgltickets.local
ping api.mgltickets.local
```

**View certificates:**
```bash
cd certs
ls -la
```

---

## Final Notes

- **Certificates are valid for 2 years** - regenerate when expired
- **Keep `certs/` folder in `.gitignore`** - never commit certificates
- **Share setup guide with team** - everyone needs same setup
- **Works offline** - no internet needed for local development

You're all set! 🎯