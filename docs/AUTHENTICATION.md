# Authentication System Documentation

## 📍 Location
Create as: `/docs/AUTHENTICATION.md`

---

# Authentication Architecture - MGLTickets

## 🎯 Overview

MGLTickets uses a **dual-token authentication system** with **HttpOnly cookies** for maximum security:

- **Access Token** - Short-lived (15 min), stored in memory, sent in Authorization header
- **Refresh Token** - Long-lived (7 days), stored in HttpOnly cookie, automatically sent with requests

This approach combines the security of HttpOnly cookies with the flexibility of JWT tokens.

## 🔐 Why This Approach?

### ❌ What We DON'T Do (and why)

**localStorage for tokens:**
```typescript
// ❌ NEVER DO THIS
localStorage.setItem('token', accessToken);  // Vulnerable to XSS!
```
**Problem:** Any malicious script can read localStorage and steal tokens.

**Single long-lived token:**
```typescript
// ❌ AVOID THIS
const token = jwt.sign({userId}, secret, {expiresIn: '30d'});
```
**Problem:** If stolen, attacker has access for 30 days.

### ✅ What We DO (and why)

**HttpOnly cookies for refresh tokens:**
```python
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,  # JavaScript can't access
    secure=True,    # HTTPS only
    samesite="none" # Allow cross-subdomain
)
```
**Benefits:**
- ✅ JavaScript cannot read the cookie (XSS protection)
- ✅ Only sent over HTTPS (Secure flag)
- ✅ Browser automatically manages it
- ✅ Works across subdomains (SameSite=None)

**Short-lived access tokens in memory:**
```typescript
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;  // Stored in closure, not localStorage
};
```
**Benefits:**
- ✅ Expires quickly (15 min) - limits damage if stolen
- ✅ Automatically cleared on page refresh
- ✅ Refreshed automatically using refresh token

## 🔄 Authentication Flow

### 1. Initial Login

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Browser │                  │ Frontend│                  │ Backend │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. User enters credentials │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ 2. POST /auth/login        │
     │                            ├───────────────────────────>│
     │                            │    {username, password}    │
     │                            │                            │
     │                            │                            │ 3. Validate
     │                            │                            │    credentials
     │                            │                            │
     │                            │ 4. Response                │
     │                            │<───────────────────────────┤
     │                            │    Body: {access_token}    │
     │                            │    Cookie: refresh_token   │
     │                            │                            │
     │ 5. Save access token       │                            │
     │    in memory               │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ 6. Fetch user data         │                            │
     │                            ├───────────────────────────>│
     │                            │ GET /users/me              │
     │                            │ Header: Bearer {token}     │
     │                            │                            │
     │                            │ 7. User data               │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 8. Navigate to dashboard   │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**Code:**

```typescript
// Frontend - Login.tsx
const handleLogin = async (email: string, password: string) => {
  // 1. Call backend login
  const response = await loginUser({email, password});
  
  // 2. Save access token in memory
  await login(response.access_token);
  
  // 3. Navigate to dashboard
  navigate('/dashboard');
};
```

```python
# Backend - auth.py
@router.post("/auth/login")
async def login(response: Response, form: OAuth2PasswordRequestForm = Depends()):
    # 1. Validate credentials
    user = await authenticate_user(form.username, form.password)
    
    # 2. Generate tokens
    access_token = create_access_token(user.id)  # 15 min
    refresh_token = create_refresh_token(user.id)  # 7 days
    
    # 3. Save refresh token to database
    await create_refresh_session(user.id, refresh_token)
    
    # 4. Set HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        domain=".mgltickets.local",
        max_age=7 * 24 * 60 * 60
    )
    
    # 5. Return access token in body
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 900
    }
```

### 2. Making Authenticated Requests

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Frontend│                  │  Axios  │                  │ Backend │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. Component makes request │                            │
     │    api.get('/events')      │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ 2. Interceptor adds        │
     │                            │    Authorization header    │
     │                            │                            │
     │                            │ 3. Request with tokens     │
     │                            ├───────────────────────────>│
     │                            │ Header: Bearer {access}    │
     │                            │ Cookie: refresh_token      │
     │                            │                            │
     │                            │                            │ 4. Validate
     │                            │                            │    access token
     │                            │                            │
     │                            │ 5. Success response        │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 6. Return data to component│                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**Code:**

```typescript
// Frontend - axiosConfig.ts
api.interceptors.request.use((config) => {
  // Automatically add access token to every request
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### 3. Token Refresh (Automatic)

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Frontend│                  │  Axios  │                  │ Backend │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. Request with expired    │                            │
     │    access token            ├───────────────────────────>│
     │                            │ Header: Bearer {expired}   │
     │                            │ Cookie: refresh_token      │
     │                            │                            │
     │                            │ 2. 401 Unauthorized        │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ 3. Interceptor catches 401 │
     │                            │                            │
     │                            │ 4. POST /auth/refresh      │
     │                            ├───────────────────────────>│
     │                            │ Cookie: refresh_token      │
     │                            │                            │
     │                            │                            │ 5. Validate
     │                            │                            │    refresh token
     │                            │                            │
     │                            │ 6. New access token        │
     │                            │<───────────────────────────┤
     │                            │ Body: {access_token}       │
     │                            │ Cookie: new_refresh_token  │
     │                            │                            │
     │                            │ 7. Save new access token   │
     │                            │                            │
     │                            │ 8. Retry original request  │
     │                            ├───────────────────────────>│
     │                            │ Header: Bearer {new_token} │
     │                            │                            │
     │                            │ 9. Success                 │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 10. Return data            │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**This happens automatically!** The user never knows their token expired.

**Code:**

```typescript
// Frontend - axiosConfig.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get new access token
        const response = await axios.post('/auth/refresh', {}, {
          withCredentials: true  // Sends refresh token cookie
        });
        
        const newAccessToken = response.data.access_token;
        setAccessToken(newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

```python
# Backend - auth.py
@router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    # 1. Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(401, "No refresh token")
    
    # 2. Validate refresh token
    payload = decode_token(refresh_token)
    session = await get_refresh_session(payload['sid'])
    
    if not session or session.user_id != payload['id']:
        raise HTTPException(401, "Invalid refresh token")
    
    # 3. Generate new tokens
    new_access_token = create_access_token(payload['id'])
    new_refresh_token = create_refresh_token(payload['id'])
    
    # 4. Rotate refresh token (invalidate old, save new)
    await revoke_refresh_session(payload['sid'])
    await create_refresh_session(payload['id'], new_refresh_token)
    
    # 5. Set new refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        domain=".mgltickets.local",
        max_age=7 * 24 * 60 * 60
    )
    
    # 6. Return new access token
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 900
    }
```

### 4. Session Restoration (Page Refresh)

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Browser │                  │ Frontend│                  │ Backend │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. User refreshes page     │                            │
     │    (F5)                    │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ 2. AuthContext mounts      │
     │                            │                            │
     │                            │ 3. POST /auth/refresh      │
     │                            ├───────────────────────────>│
     │                            │ Cookie: refresh_token      │
     │                            │                            │
     │                            │ 4. New access token        │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ 5. Save access token       │
     │                            │                            │
     │                            │ 6. GET /users/me           │
     │                            ├───────────────────────────>│
     │                            │ Header: Bearer {token}     │
     │                            │                            │
     │                            │ 7. User data               │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 8. User stays logged in!   │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**Code:**

```typescript
// Frontend - AuthContext.tsx
useEffect(() => {
  const restoreSession = async () => {
    try {
      // Try to refresh token
      const response = await api.post("/auth/refresh");
      const accessToken = response.data.access_token;
      setAccessToken(accessToken);

      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // No valid session - user needs to login
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, []);
```

### 5. Logout

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Frontend│                  │ Backend │                  │ Database│
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. User clicks logout      │                            │
     │                            │                            │
     │ 2. POST /auth/logout       │                            │
     ├───────────────────────────>│                            │
     │ Cookie: refresh_token      │                            │
     │                            │                            │
     │                            │ 3. Delete session          │
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │ 4. Delete cookie           │
     │                            │    response.delete_cookie  │
     │                            │                            │
     │                            │ 5. Success                 │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ 6. Clear local state       │                            │
     │    setAccessToken(null)    │                            │
     │    setUser(null)           │                            │
     │                            │                            │
     │ 7. Redirect to login       │                            │
     │                            │                            │
```

## 🔒 Security Features

### 1. HttpOnly Cookies
**What:** Cookie cannot be accessed by JavaScript
**Prevents:** XSS attacks from stealing tokens

### 2. Secure Flag
**What:** Cookie only sent over HTTPS
**Prevents:** Man-in-the-middle attacks

### 3. SameSite=None
**What:** Cookie sent on cross-origin requests
**Why needed:** Our apps are on different subdomains
**Requires:** Secure flag (HTTPS)

### 4. Token Rotation
**What:** Every refresh generates a new refresh token and invalidates the old one
**Prevents:** Replay attacks

### 5. Short-lived Access Tokens
**What:** Access tokens expire in 15 minutes
**Prevents:** Long-term damage if stolen

### 6. Database Session Tracking
**What:** All refresh tokens stored in database
**Allows:** Remote logout, session management, security audits

## 🌐 Cross-App Authentication

### The Challenge

We have 3 apps on different subdomains:
- `mgltickets.local:3000` (User)
- `organizer.mgltickets.local:3001` (Organizer)
- `admin.mgltickets.local:3002` (Admin)

How do we share authentication?

### The Solution: Wildcard Cookie Domain

```python
# Backend sets cookie domain to wildcard
response.set_cookie(
    domain=".mgltickets.local",  # Note the leading dot!
    # ...
)
```

**Result:**
- Cookie is accessible on ALL `*.mgltickets.local` subdomains
- Login once, authenticated everywhere
- Same refresh token shared across apps

### Access Control

Each app checks the user's role:

```typescript
// ProtectedRoute.tsx
if (APP_TYPE === 'organizer' && user.role !== 'organizer') {
  return <AccessDenied />;
}

if (APP_TYPE === 'admin' && user.role !== 'admin') {
  return <AccessDenied />;
}
```

## ⚠️ Common Pitfalls

### 1. Forgetting withCredentials

```typescript
// ❌ Cookie won't be sent!
axios.get('/api/users');

// ✅ Cookie included
axios.get('/api/users', { withCredentials: true });

// ✅ Or set globally
axios.create({ withCredentials: true });
```

### 2. Wrong Cookie Domain

```python
# ❌ Only works on exact domain
domain="mgltickets.local"

# ✅ Works on all subdomains
domain=".mgltickets.local"  # Leading dot!
```

### 3. HTTP with Secure Flag

```python
# ❌ Won't work - Secure requires HTTPS
secure=True  # But serving over HTTP

# ✅ Match protocol to Secure flag
# HTTP: secure=False
# HTTPS: secure=True
```

### 4. SameSite Without Secure

```python
# ❌ SameSite=None requires Secure=True
samesite="none",
secure=False  # ERROR!

# ✅ Correct combination
samesite="none",
secure=True
```

### 5. Not Handling 401 Errors

```typescript
// ❌ User sees errors when token expires
api.get('/events');  // 401 after 15 min

// ✅ Interceptor automatically refreshes
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh and retry
    }
  }
);
```

## 🧪 Testing Authentication

### Test Scenarios

1. **Login → Success**
   - Access token in memory
   - Refresh token in cookie
   - User data fetched

2. **API Call → Success**
   - Authorization header added
   - 200 response

3. **Token Expiry → Auto-refresh**
   - Wait 16 minutes
   - Make API call
   - Should get 401, then auto-refresh, then 200

4. **Page Refresh → Stay Logged In**
   - Refresh page (F5)
   - Should call /auth/refresh
   - Should fetch user data
   - Should stay logged in

5. **Cross-App Navigation**
   - Login on user app
   - Navigate to organizer app
   - Should stay logged in
   - Same cookie visible in DevTools

6. **Logout → Clean State**
   - Logout
   - Cookie deleted
   - Access token cleared
   - Redirected to login

7. **Role-Based Access**
   - Login as regular user
   - Try to access organizer app
   - Should show "Access Denied"

## 📊 Monitoring & Analytics

Track these metrics:
- Login success/failure rate
- Average session duration
- Token refresh frequency
- 401 error rate
- Cross-app navigation patterns

## 🔗 Related Files

- Frontend:
  - `/src/shared/contexts/AuthContext.tsx`
  - `/src/shared/api/axiosConfig.ts`
  - `/src/shared/routing/ProtectedRoute.tsx`
  - `/src/apps/user/pages/Login.tsx`

- Backend:
  - `/app/routes/auth.py`
  - `/app/core/security.py`
  - `/app/services/ref_session_services.py`

---

**This architecture provides enterprise-grade security while maintaining excellent UX. Users stay logged in, tokens refresh automatically, and the system is resilient to common attacks.**