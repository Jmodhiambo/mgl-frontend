# User App - Main Public Application

## 📍 Location
`/src/apps/user/`

## 🎯 Purpose

The **User App** is the main public-facing application where customers browse events, purchase tickets, and manage their profiles. This is the primary entry point for all users and handles:

- Public event browsing (no auth required)
- User registration and login
- Authenticated event browsing with enhanced features
- Ticket purchasing
- Order history
- Profile management

## 🌐 URLs

**Development:** `https://mgltickets.local:3000`  
**Production:** `https://mgltickets.com`

## 📁 Directory Structure

```
user/
├── pages/                    # Page components
│   ├── Home.tsx             # Landing page (public)
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Registration page
│   ├── Events.tsx           # Public event browsing
│   ├── BrowseEvents.tsx     # Auth event browsing (enhanced)
│   ├── EventDetails.tsx     # Public event details
│   ├── BrowseEventDetails.tsx  # Auth event details
│   ├── Checkout.tsx         # Ticket purchase
│   ├── MyTickets.tsx        # User's purchased tickets
│   ├── Profile.tsx          # User profile
│   ├── Dashboard.tsx        # User dashboard
│   ├── MyEvents.tsx         # Events user is organizing
│   ├── ForgotPassword.tsx   # Password reset request
│   ├── ResetPassword.tsx    # Password reset form
│   └── ReactivateAccount.tsx # Account reactivation
├── components/              # User-specific components
│   └── (app-specific UI components)
├── routes.tsx              # Route configuration
├── App.tsx                 # Root component
├── main.tsx                # Entry point
├── index.css               # Global styles
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🛣️ Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Landing page with hero section |
| `/events` | `Events` | Browse public events (limited features) |
| `/events/:eventId` | `EventDetails` | View event details publicly |
| `/login` | `Login` | User login |
| `/register` | `Register` | New user registration |
| `/forgot-password` | `ForgotPassword` | Request password reset |
| `/reset-password` | `ResetPassword` | Reset password with token |
| `/reactivate-account` | `ReactivateAccount` | Reactivate deactivated account |
| `/verify-email` | `EmailVerification` | Email verification |

### Legal/Help Routes (Public)

| Route | Component | Description |
|-------|-----------|-------------|
| `/terms` | `TermsOfService` | Terms of service |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/refund` | `RefundPolicy` | Refund policy |
| `/about` | `AboutUs` | About the platform |
| `/contact` | `ContactPage` | Contact form |
| `/faq` | `FAQPage` | Frequently asked questions |
| `/help/*` | `HelpRoutes` | Help center articles |
| `/press` | `PressAndMedia` | Press information |
| `/careers` | `CareersPage` | Career opportunities |

### Protected Routes (Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `Dashboard` | User dashboard overview |
| `/browse-events` | `BrowseEvents` | Enhanced event browsing (auth) |
| `/browse-events/:eventId` | `BrowseEventDetails` | Enhanced event details |
| `/checkout` | `Checkout` | Ticket purchase flow |
| `/my-tickets` | `MyTickets` | User's purchased tickets |
| `/profile` | `Profile` | User profile settings |
| `/my-events` | `MyEvents` | Events user is organizing |
| `/setup-organizer-profile` | `OrganizerProfileSetup` | Become an organizer |

## 🔐 Authentication Flow

### Registration
```
User fills form → POST /auth/register → Email verification sent → User verifies → Account active
```

### Login
```
User enters credentials → POST /auth/login → 
Backend returns:
  - access_token (in response body)
  - refresh_token (in HttpOnly cookie)
→ Fetch user data → Navigate to dashboard
```

### Password Reset
```
User requests reset → Email sent with token → 
User clicks link → Reset form → New password → Success
```

### Session Persistence
On page load, `AuthContext` automatically:
1. Calls `/auth/refresh` with HttpOnly cookie
2. Gets new access token
3. Fetches user data
4. Restores session

## 📊 User Journeys

### Journey 1: First-Time Visitor to Ticket Purchase

```
1. Land on Home page (/)
   ↓
2. Browse public events (/events)
   ↓
3. View event details (/events/:id)
   ↓
4. Click "Buy Tickets" → Redirected to /login
   ↓
5. Register new account (/register)
   ↓
6. Verify email → Login
   ↓
7. Redirected back to event (/browse-events/:id)
   ↓
8. Select tickets → Checkout (/checkout)
   ↓
9. Complete purchase
   ↓
10. View tickets (/my-tickets)
```

### Journey 2: Returning User

```
1. Visit site → Auto-login via refresh token
   ↓
2. Dashboard (/dashboard)
   ↓
3. Browse events (/browse-events)
   ↓
4. One-click ticket purchase (already logged in)
   ↓
5. View tickets (/my-tickets)
```

### Journey 3: Becoming an Organizer

```
1. Login as regular user
   ↓
2. Navigate to "Become Organizer"
   ↓
3. Setup organizer profile (/setup-organizer-profile)
   ↓
4. Account upgraded to organizer role
   ↓
5. Access organizer portal (https://organizer.mgltickets.local:3001)
```

## 🎨 Design Patterns

### Public vs Protected Layouts

**Public Pages:**
- Minimal header (logo, login button)
- No navbar
- Focused on conversion (CTAs)
- Footer with links

**Protected Pages:**
- Full navbar with user menu
- Profile avatar
- Quick actions
- Enhanced features

### Route Organization

We use **two separate route groups** for public vs protected:

```typescript
// Public routes - PublicLayout (no navbar)
{
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: 'events', element: <Events /> },
    { path: 'events/:eventId', element: <EventDetails /> }
  ]
}

// Protected routes - ProtectedLayout (with navbar)
{
  path: '/',
  element: (
    <ProtectedRoute>
      <ProtectedLayout />
    </ProtectedRoute>
  ),
  children: [
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'browse-events', element: <BrowseEvents /> },
    { path: 'my-tickets', element: <MyTickets /> }
  ]
}
```

**Why?**
- Clear separation of concerns
- Different UX for public vs authenticated users
- Easy to protect entire sections with one wrapper

## 🔗 Navigation Links

### To Other Apps

```typescript
// Link to Organizer Portal
<a href={import.meta.env.VITE_ORGANIZER_DOMAIN}>
  Organizer Portal
</a>

// Link to Admin Panel (admins only)
{user?.role === 'admin' && (
  <a href={import.meta.env.VITE_ADMIN_DOMAIN}>
    Admin Panel
  </a>
)}
```

### Within User App

```typescript
// Use React Router Link for same-app navigation
import { Link } from 'react-router-dom';

<Link to="/browse-events">Browse Events</Link>
<Link to="/my-tickets">My Tickets</Link>
<Link to="/profile">Profile</Link>
```

## 📱 Key Features

### Public Event Browsing
- **No auth required** - Anyone can view events
- **Limited features** - Basic event info only
- **CTA to login** - Encouraged to create account

### Enhanced Event Browsing (Auth)
- **Personalized** - Recommended events based on history
- **Save for later** - Bookmark events
- **Quick purchase** - One-click checkout
- **Order history** - View past purchases

### Checkout Flow
1. Select event and tickets
2. Review order
3. Enter payment details
4. Confirm purchase
5. Receive tickets via email
6. View in "My Tickets"

### Profile Management
- Update personal info
- Change password
- View order history
- Manage payment methods
- Email preferences
- Account deactivation

### Organizer Features
- Apply to become organizer
- Manage events (redirects to organizer app)
- View event analytics

## 🛠️ Development

### Running Locally

```bash
# Start user app only
npm run dev:user

# Or start all apps
npm run dev
```

### Building

```bash
# Build user app
npm run build:user

# Preview production build
npm run preview:user
```

### Environment Variables

Required variables (from root `.env.development`):

```bash
VITE_API_URL=https://api.mgltickets.local:8000
VITE_USER_DOMAIN=https://mgltickets.local:3000
VITE_ORGANIZER_DOMAIN=https://organizer.mgltickets.local:3001
VITE_ADMIN_DOMAIN=https://admin.mgltickets.local:3002
```

## 🎯 Page-Specific Notes

### Home.tsx
- **SEO critical** - Include meta tags, structured data
- **Performance critical** - Lazy load images, optimize assets
- **Conversion focused** - Clear CTAs, social proof

### Login.tsx
- Handles `?redirect=` query param for post-login navigation
- Shows reactivation link for deactivated accounts
- reCAPTCHA integration for bot protection

### Register.tsx
- Email verification required
- Password strength indicator
- Terms acceptance checkbox
- reCAPTCHA integration

### Checkout.tsx
- Payment processing integration
- Order summary
- Ticket selection validation
- Promo code support

### MyTickets.tsx
- QR code generation for tickets
- Download ticket PDFs
- Transfer tickets (future)
- Refund requests

### Dashboard.tsx
- Upcoming events
- Recent purchases
- Quick actions
- Personalized recommendations

## 🔧 Configuration

### Vite Config (`vite.config.ts`)

```typescript
{
  server: {
    port: 3000,
    host: true,
    https: {
      key: fs.readFileSync('../../../certs/key.pem'),
      cert: fs.readFileSync('../../../certs/cert.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://api.mgltickets.local:8000',
        changeOrigin: true,
      }
    }
  }
}
```

### Route Config (`routes.tsx`)

Uses `createBrowserRouter` from React Router v7:

```typescript
export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <PublicLayout />, children: [...] },
  
  // Auth routes (standalone)
  { path: '/login', element: <Login /> },
  
  // Protected routes
  { path: '/', element: <ProtectedRoute><ProtectedLayout /></ProtectedRoute>, children: [...] },
]);
```

## 🐛 Common Issues

### Issue: Redirected to login when already logged in

**Cause:** `isAuthenticated` is false when it shouldn't be

**Solution:** Check:
1. AuthContext is wrapping the app in `App.tsx`
2. Refresh token cookie exists (DevTools → Application → Cookies)
3. `/auth/refresh` endpoint working (Network tab)
4. Backend CORS configured correctly

### Issue: Can't access organizer features

**Cause:** User role is not 'organizer'

**Solution:** 
1. Complete organizer profile setup at `/setup-organizer-profile`
2. Backend should upgrade `user.role` to 'organizer'
3. Re-login if needed to refresh user data

### Issue: Payment not processing

**Cause:** Payment gateway configuration

**Solution:** Check:
1. Payment API keys in backend `.env`
2. Test mode vs live mode
3. Network requests in DevTools
4. Backend payment service logs

## 📊 Analytics & Tracking

### Events to Track

**User Actions:**
- Page views
- Event views
- Ticket purchases
- Account creation
- Login/logout
- Search queries

**Conversion Funnel:**
1. Landing page visit
2. Event browsing
3. Event details view
4. Add to cart
5. Checkout initiated
6. Payment submitted
7. Purchase completed

**Integration Points:**
```typescript
// Example: Track event view
import { trackEvent } from '@shared/analytics';

trackEvent('event_viewed', {
  eventId: event.id,
  eventName: event.name,
  category: event.category
});
```

## 🔒 Security Considerations

### XSS Prevention
- All user input sanitized
- React escapes by default
- Don't use `dangerouslySetInnerHTML` without sanitization

### CSRF Protection
- Backend validates CSRF tokens
- Forms include CSRF token
- API calls use proper headers

### Rate Limiting
- Login attempts limited (backend)
- API calls rate limited (backend)
- reCAPTCHA on sensitive forms

### Payment Security
- PCI compliance required
- Never store card details
- Use payment gateway tokens
- HTTPS only for payment pages

## 📚 Related Documentation

- [Root README](../../../README.md) - Project overview
- [Shared Code](../../shared/README.md) - Shared components/utilities
- [Authentication](../../../docs/AUTHENTICATION.md) - Auth architecture
- [Organizer App](../organizer/README.md) - Organizer portal docs
- [Admin App](../admin/README.md) - Admin panel docs

## 🎓 Best Practices

### Component Organization
```
pages/
  MyTickets/
    MyTickets.tsx        # Main page component
    TicketCard.tsx       # Page-specific component
    index.tsx            # Export
```

### State Management
- Use `AuthContext` for auth state
- Use `useState` for local component state
- Consider context for app-wide state (cart, theme)

### Error Handling
```typescript
try {
  const response = await api.get('/events');
  setEvents(response.data);
} catch (error) {
  // Show user-friendly error message
  setError('Failed to load events. Please try again.');
  
  // Log for debugging
  console.error('Event fetch error:', error);
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/events');
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

if (loading) return <LoadingSpinner />;
```

## ✅ Deployment Checklist

Before deploying user app:

- [ ] All environment variables set in production
- [ ] SSL certificate configured
- [ ] Domain DNS records updated
- [ ] Payment gateway in live mode
- [ ] Email service configured (SendGrid/SES)
- [ ] Analytics integrated (Google Analytics/Mixpanel)
- [ ] Error tracking enabled (Sentry)
- [ ] SEO meta tags complete
- [ ] Open Graph tags for social sharing
- [ ] Favicon and app icons added
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Performance optimized (Lighthouse score 90+)
- [ ] Accessibility tested (WCAG AA compliant)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive verified
- [ ] Legal pages reviewed (Terms, Privacy)
- [ ] GDPR compliance implemented (cookie consent)
- [ ] Backup strategy in place

---

**The User App is the face of MGLTickets. Every interaction matters. Build with care!** 🎯