# Shared Code - MGLTickets

## 📍 Location
`/src/shared/`

## 🎯 Purpose

This directory contains **all code shared across the User, Organizer, and Admin applications**. By centralizing common functionality here, we:
- ✅ Avoid code duplication
- ✅ Ensure consistency across apps
- ✅ Make updates easier (change once, apply everywhere)
- ✅ Reduce bundle sizes

## 📁 Directory Structure

```
shared/
├── api/
│   ├── auth/              # Authentication API calls
│   ├── user/              # User-related API calls
│   ├── events/            # Events API calls
│   └── axiosConfig.ts     # Axios instance with interceptors
├── components/
│   ├── layouts/           # Layout components (headers, footers)
│   ├── ui/                # Reusable UI components
│   └── ErrorBoundary.tsx  # Error handling component
├── contexts/
│   └── AuthContext.tsx    # Global authentication state
├── routing/
│   ├── ProtectedRoute.tsx # Route protection component
│   └── PublicRoute.tsx    # Public route wrapper
├── config/
│   ├── app.config.ts      # App-specific configuration
│   └── recaptcha.ts       # reCAPTCHA configuration
├── types/
│   ├── Auth.ts            # Authentication types
│   ├── User.ts            # User types
│   └── Event.ts           # Event types
├── hooks/
│   └── useAuth.ts         # Custom hooks
├── utils/
│   └── helpers.ts         # Utility functions
└── pages/                 # Shared pages (legal, help, etc.)
```

## 🔑 Key Files Explained

### `api/axiosConfig.ts`

**Purpose:** Configured Axios instance for all API calls

**Features:**
- Base URL from environment variables
- Automatic Bearer token attachment
- Request/Response interceptors
- Automatic token refresh on 401 errors
- Cookie credentials (`withCredentials: true`)

**Usage:**
```typescript
import api from '@shared/api/axiosConfig';

const response = await api.get('/users/me');
```

**How it works:**
1. Every request automatically includes access token in `Authorization` header
2. If request returns 401, interceptor automatically:
   - Calls `/auth/refresh` to get new access token
   - Retries original request with new token
   - If refresh fails, redirects to login

### `contexts/AuthContext.tsx`

**Purpose:** Global authentication state management

**Provides:**
- `isAuthenticated` - Boolean auth status
- `loading` - Loading state during auth check
- `user` - Current user object (with role)
- `login(accessToken)` - Login function
- `logout()` - Logout function

**Usage:**
```typescript
import { useAuth } from '@shared/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

**Session Restoration:**
On app load, AuthContext automatically:
1. Calls `/auth/refresh` to check if refresh token cookie exists
2. If valid, gets new access token
3. Fetches user data
4. Sets `isAuthenticated = true`

This enables **persistent sessions** across page refreshes!

### `routing/ProtectedRoute.tsx`

**Purpose:** Protect routes that require authentication and/or specific roles

**Features:**
- Shows loading spinner while checking auth
- Redirects unauthenticated users to login
- Enforces role-based access (organizer/admin)
- Handles cross-app redirects properly

**Usage:**
```typescript
// In your routes
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Role-Based Access:**
```typescript
// Automatically checks user.role
// Organizer app: Requires role === 'organizer'
// Admin app: Requires role === 'admin'
// User app: No role requirement
```

**Cross-App Redirects:**
- If accessing organizer app without auth → redirects to user app login
- Login page accepts `?redirect=` param to return user to original location
- After successful login, user is redirected back

### `config/app.config.ts`

**Purpose:** Detect which app is currently running

**How it works:**
```typescript
// Detects based on hostname
export const APP_TYPE = (() => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('organizer')) return 'organizer';
  if (hostname.includes('admin')) return 'admin';
  return 'user';
})() as 'user' | 'organizer' | 'admin';
```

**Usage:**
```typescript
import { APP_TYPE } from '@shared/config/app.config';

if (APP_TYPE === 'organizer') {
  // Organizer-specific logic
}
```

**Why needed?**
- Same ProtectedRoute component behaves differently per app
- Different role requirements
- Different redirect logic

## 🎨 Shared Components

### Layouts

**`ProtectedLayout.tsx`**
- Main layout with navigation bar
- User avatar/menu
- Responsive design
- Used by: All authenticated pages

**`PublicLayout.tsx`**
- Layout for public pages (no auth required)
- Simpler header
- Used by: Landing page, public event browsing

**`LegalLayout.tsx`**
- Layout for legal/help pages
- Minimal header with branding
- Used by: Terms, Privacy, Help pages

### UI Components

Reusable components like:
- Buttons
- Forms
- Modals
- Cards
- Loading spinners
- Error messages

## 🔐 Authentication Flow (Detailed)

### Initial Page Load

```
1. User visits app
   ↓
2. AuthContext mounts
   ↓
3. Calls /auth/refresh
   ↓
4a. Success → Get access token → Fetch user → Set authenticated
4b. Fail → Set not authenticated
   ↓
5. ProtectedRoute checks isAuthenticated
   ↓
6a. True → Show page
6b. False → Redirect to login
```

### Login Flow

```
1. User submits login form
   ↓
2. Call /auth/login with credentials
   ↓
3. Backend returns:
   - access_token (in response body)
   - refresh_token (in HttpOnly cookie)
   ↓
4. Frontend:
   - Calls login(accessToken)
   - Stores access token in memory
   - Fetches user data
   ↓
5. Navigate to dashboard/redirect URL
```

### API Request with Auto-Refresh

```
1. Component makes API call
   ↓
2. Axios interceptor adds Authorization header
   ↓
3. Request sent to backend
   ↓
4a. Success → Return data
4b. 401 Error → Axios interceptor catches it
   ↓
5. Interceptor calls /auth/refresh
   ↓
6a. Refresh success → Get new token → Retry original request
6b. Refresh fail → Clear auth → Redirect to login
```

## 📝 TypeScript Types

All shared types are in `/types` directory:

**`Auth.ts`**
```typescript
export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

**`User.ts`**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  // ...other fields
}
```

## 🎯 Import Aliases

All shared code can be imported using the `@shared` alias:

```typescript
// Instead of this:
import { useAuth } from '../../../shared/contexts/AuthContext';

// Use this:
import { useAuth } from '@shared/contexts/AuthContext';
```

**Configured in:**
- `vite.config.ts` (each app)
- `tsconfig.json`

## ⚠️ Important Notes

### Don't Import From Specific Apps

```typescript
// ❌ NEVER DO THIS from shared code
import Something from '@user/components/Something';

// ✅ DO THIS
// If component is needed across apps, move it to shared
import Something from '@shared/components/Something';
```

**Why?** Shared code should not depend on app-specific code. Dependencies should only flow one way: Apps → Shared.

### Cookie Configuration

The `axiosConfig.ts` file has **critical settings** for authentication to work:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // ⭐ CRITICAL: Sends cookies!
});
```

**Never remove `withCredentials: true`** - this is what allows the refresh token cookie to be sent with requests!

### Axios Interceptors

The request/response interceptors handle:
1. Adding Bearer token to all requests
2. Auto-refreshing tokens on 401 errors
3. Preventing refresh loops
4. Handling concurrent requests during refresh

**Don't modify interceptors** unless you fully understand the flow!

## 🔄 Making Changes to Shared Code

When updating shared code:

1. **Test on all apps**
   - Changes affect User, Organizer, AND Admin apps
   - Run all three apps and test the change

2. **Check TypeScript**
   ```bash
   npm run typecheck
   ```

3. **Consider backwards compatibility**
   - If changing an interface, might break existing code
   - Update all usages across all apps

4. **Document breaking changes**
   - Update this README
   - Add migration notes if needed

## 📚 Related Documentation

- [Root README](../../README.md) - Overall project architecture
- [Authentication Guide](../../docs/AUTHENTICATION.md) - Detailed auth flow
- [API Documentation](../../docs/API.md) - Backend API reference

---

**Remember:** This code is the foundation of all three apps. Changes here ripple everywhere. Test thoroughly!