# Admin App - Platform Administration Dashboard

## 📍 Location
`/src/apps/admin/`

## 🎯 Purpose

The **Admin App** is the platform administration dashboard for MGLTickets staff only. It provides comprehensive tools for:

- Managing users and organizers
- Monitoring all events on the platform
- Handling disputes and refunds
- Viewing platform-wide analytics
- System configuration
- Content moderation
- Financial oversight

## 🌐 URLs

**Development:** `https://admin.mgltickets.local:3002`  
**Production:** `https://admin.mgltickets.com`

## 🔐 Access Requirements

**Role Required:** `user.role === 'admin'`

**This is the most restricted app.** Only MGLTickets administrators can access it. Regular users and organizers will see an "Admin Access Required" message.

## 📁 Directory Structure

```
admin/
├── pages/                      # Page components
│   ├── Dashboard.tsx          # Admin overview
│   ├── Users.tsx              # User management
│   ├── Organizers.tsx         # Organizer management
│   ├── Events.tsx             # All platform events
│   ├── EventDetails.tsx       # Single event admin view
│   ├── Bookings.tsx           # All bookings
│   ├── Disputes.tsx           # Dispute resolution
│   ├── Refunds.tsx            # Refund management
│   ├── Analytics.tsx          # Platform analytics
│   ├── Revenue.tsx            # Financial reports
│   ├── Settings.tsx           # System configuration
│   ├── ContentModeration.tsx  # Content review
│   ├── AuditLogs.tsx          # System audit logs
│   └── Reports.tsx            # Custom reports
├── components/                 # Admin-specific components
│   ├── UserTable.tsx          # User data table
│   ├── EventTable.tsx         # Events data table
│   ├── StatsCard.tsx          # Metric display card
│   └── ActionLog.tsx          # Activity timeline
├── routes.tsx                 # Route configuration
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## 🛣️ Routes

All routes require authentication AND admin role.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Dashboard` | Admin overview (redirects to /dashboard) |
| `/dashboard` | `Dashboard` | Platform metrics and alerts |
| `/users` | `Users` | Manage all users |
| `/organizers` | `Organizers` | Manage event organizers |
| `/events` | `Events` | All platform events |
| `/events/:eventId` | `EventDetails` | Event administration |
| `/bookings` | `Bookings` | All ticket bookings |
| `/disputes` | `Disputes` | Handle disputes |
| `/refunds` | `Refunds` | Process refunds |
| `/analytics` | `Analytics` | Platform analytics |
| `/revenue` | `Revenue` | Financial reports |
| `/settings` | `Settings` | System configuration |
| `/moderation` | `ContentModeration` | Review flagged content |
| `/audit-logs` | `AuditLogs` | System activity logs |
| `/reports` | `Reports` | Generate reports |

## 📊 Dashboard Overview

The admin dashboard provides a bird's-eye view of the entire platform:

### Key Platform Metrics

**User Metrics:**
- Total users
- New users (today, this week, this month)
- Active users
- User growth rate
- User churn rate

**Event Metrics:**
- Total events (all time)
- Active events (happening now)
- Upcoming events
- Events created (today, this week, this month)
- Event approval pending

**Financial Metrics:**
- Total revenue
- Revenue (today, this week, this month, this year)
- Platform fees collected
- Pending payouts to organizers
- Refunds processed

**Booking Metrics:**
- Total tickets sold
- Tickets sold (today, this week, this month)
- Active bookings
- Cancellation rate
- Check-in rate

### Real-Time Alerts

- Events pending approval
- Reported content requiring review
- Disputes requiring attention
- Unusual activity detected
- System errors
- Payment failures

### Activity Feed

Recent platform activity:
- New user registrations
- Events created/published
- Large ticket purchases
- Refund requests
- Content reports
- Admin actions

## 👥 User Management

### User Overview

View and manage all platform users:

**User List Features:**
- Search by name, email, ID
- Filter by:
  - Role (user, organizer, admin)
  - Status (active, deactivated, banned)
  - Registration date
  - Activity level
- Sort by various fields
- Bulk actions

**User Details:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  last_login: Date;
  total_bookings: number;
  total_spent: number;
  events_organized?: number;  // If organizer
}
```

### User Actions

**Available Actions:**
- View user details
- Edit user profile
- Change user role
- Verify email (manual)
- Activate/deactivate account
- Ban/unban user
- Reset password
- View user activity
- View purchase history
- View organized events (if organizer)
- Send message to user
- Export user data (GDPR)

### Role Management

**Upgrading to Organizer:**
```
1. User applies to become organizer (via user app)
2. Admin reviews application
3. Check:
   - Profile completeness
   - Verification status
   - Past activity
   - Flags/reports
4. Approve/Reject
5. If approved, role changed to 'organizer'
6. User gets notification
```

**Promoting to Admin:**
```
1. Select user
2. Click "Change Role" → "Admin"
3. Confirm (requires current admin password)
4. User role updated to 'admin'
5. User gains admin access immediately
```

## 🎪 Event Management

### All Events Overview

View and manage all events on the platform:

**Event List Features:**
- Search by name, organizer, category
- Filter by:
  - Status (draft, published, cancelled, completed)
  - Date range
  - Category
  - Approval status
  - Flagged content
- Sort by date, popularity, revenue
- Bulk actions (approve, feature, hide)

### Event Moderation

**Review Process:**
```
1. Organizer creates event
2. Event submitted for review
3. Admin reviews:
   - Content appropriateness
   - Image quality
   - Accurate information
   - Compliance with policies
4. Approve/Reject/Request changes
5. If approved, event goes live
```

**Moderation Criteria:**
- No prohibited content
- Accurate event details
- Appropriate category
- Valid venue information
- Reasonable pricing
- Clear refund policy
- No spam/scams

### Event Actions

**Available Actions:**
- View full event details
- Edit event (override organizer)
- Approve/reject event
- Feature event (homepage, category)
- Hide event (temporarily)
- Cancel event
- Flag for review
- Contact organizer
- View analytics
- Export attendee list

## 💰 Financial Management

### Revenue Dashboard

**Platform Revenue:**
- Total gross revenue
- Platform fees (typically 5-10%)
- Net revenue to organizers
- Refunds processed
- Revenue by category
- Revenue by date range

**Payout Management:**
- Pending payouts to organizers
- Process batch payouts
- View payout history
- Handle payout disputes
- Export financial reports

### Refund Management

**Refund Queue:**
- Pending refund requests
- Auto-approved refunds (within policy)
- Disputed refunds
- Processed refunds

**Refund Process:**
```
1. User requests refund (via user app)
2. System checks refund policy
3. If eligible, auto-approve
4. If disputed or outside policy:
   → Admin review required
5. Admin reviews:
   - Reason for refund
   - Event status
   - User history
   - Organizer input
6. Approve/Reject
7. If approved:
   - Refund processed
   - Organizer notified
   - Revenue adjusted
```

## 🚨 Dispute Resolution

### Types of Disputes

**User Disputes:**
- Ticket not received
- Event cancelled without refund
- Misleading event description
- Venue/time changed
- Poor event quality

**Organizer Disputes:**
- Fraudulent booking
- Chargeback issues
- User no-show
- Platform fee disputes

### Dispute Workflow

```
1. Dispute filed
   ↓
2. Admin receives alert
   ↓
3. Review dispute details:
   - User complaint
   - Organizer response
   - Booking details
   - Communication history
   - Evidence (screenshots, etc.)
   ↓
4. Contact both parties for clarification
   ↓
5. Make decision:
   - Full refund to user
   - Partial refund
   - No refund (favor organizer)
   - Platform credit
   - Other resolution
   ↓
6. Document decision
   ↓
7. Notify both parties
   ↓
8. Execute resolution
   ↓
9. Close dispute
```

## 📊 Analytics & Reporting

### Platform Analytics

**User Analytics:**
- User acquisition channels
- User demographics
- User behavior patterns
- Retention metrics
- Lifetime value

**Event Analytics:**
- Events by category
- Popular event types
- Peak booking times
- Geographic distribution
- Success metrics

**Financial Analytics:**
- Revenue trends
- Top revenue events
- Platform fee collection
- Refund rates
- Payment method usage

**Custom Reports:**
- Build custom queries
- Export to CSV/Excel
- Schedule automated reports
- Share with stakeholders

## ⚙️ System Settings

### Platform Configuration

**General Settings:**
- Platform name and branding
- Contact information
- Default currency
- Timezone settings
- Language options

**Fee Structure:**
- Platform commission (%)
- Payment processing fees
- Minimum/maximum fees
- Promotional fee waivers

**Email Settings:**
- SMTP configuration
- Email templates
- Notification preferences
- Bulk email limits

**Payment Gateway:**
- Payment provider credentials
- Supported payment methods
- Webhook configurations
- Test mode toggle

**Security Settings:**
- Password requirements
- Session timeout
- Two-factor authentication
- IP whitelist (admin access)
- Rate limiting

### Feature Flags

Enable/disable platform features:

```typescript
interface FeatureFlags {
  allow_event_creation: boolean;
  require_event_approval: boolean;
  enable_refunds: boolean;
  enable_promo_codes: boolean;
  enable_group_bookings: boolean;
  maintenance_mode: boolean;
}
```

## 🔍 Content Moderation

### Flagged Content Queue

Content flagged by users for review:

**Types of Flagged Content:**
- Events with inappropriate content
- User reviews/comments
- Event descriptions
- User profiles
- Images/media

**Moderation Actions:**
- Approve (no issue)
- Edit (fix minor issues)
- Request changes (from organizer)
- Hide (temporarily)
- Delete (permanent)
- Ban user (severe violations)

### Automated Filters

**Content Screening:**
- Prohibited keywords filter
- Image content analysis
- Duplicate detection
- Spam detection
- Scam indicators

## 📜 Audit Logs

Track all administrative actions:

**Logged Actions:**
- User role changes
- Event approvals/rejections
- Refund decisions
- Dispute resolutions
- System setting changes
- Content moderation actions
- Financial transactions
- Admin logins

**Audit Log Entry:**
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  admin_user: User;
  action: string;              // "user_banned", "event_approved"
  target_type: string;         // "user", "event", "booking"
  target_id: string;
  details: Record<string, any>;
  ip_address: string;
}
```

**Use Cases:**
- Compliance audits
- Security investigations
- Dispute evidence
- Performance reviews
- System debugging

## 🎨 Design Patterns

### Data Tables

All data tables support:
- Pagination
- Sorting
- Filtering
- Column selection
- Bulk actions
- Export to CSV
- Responsive mobile view

### Permission-Based UI

Different admin levels see different features:

```typescript
interface AdminPermissions {
  can_manage_users: boolean;
  can_approve_events: boolean;
  can_process_refunds: boolean;
  can_change_settings: boolean;
  can_view_financials: boolean;
  can_moderate_content: boolean;
}
```

### Confirmation Modals

High-risk actions require confirmation:

```typescript
// Ban user
<ConfirmModal
  title="Ban User?"
  message="This will permanently ban the user. They won't be able to login."
  action="Ban User"
  onConfirm={handleBanUser}
  danger
/>
```

## 🛠️ Development

### Running Locally

```bash
# Start admin app only
npm run dev:admin

# Or start all apps
npm run dev
```

### Building

```bash
# Build admin app
npm run build:admin

# Preview production build
npm run preview:admin
```

### Environment Variables

Uses shared environment variables from root `.env.development`:

```bash
VITE_API_URL=https://api.mgltickets.local:8000
VITE_ADMIN_DOMAIN=https://admin.mgltickets.local:3002
VITE_USER_DOMAIN=https://mgltickets.local:3000
VITE_ORGANIZER_DOMAIN=https://organizer.mgltickets.local:3001
```

## 🔧 Configuration

### Vite Config (`vite.config.ts`)

```typescript
{
  server: {
    port: 3002,
    host: true,
    https: {
      key: fs.readFileSync('../../../certs/key.pem'),
      cert: fs.readFileSync('../../../certs/cert.pem'),
    }
  }
}
```

### Route Protection

```typescript
// All routes protected with admin role check
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      // ...more routes
    ]
  }
]);
```

## 🐛 Common Issues

### Issue: Can't access admin panel

**Cause:** User role is not 'admin'

**Solution:**
Only platform administrators can access this app. Contact system administrator to grant admin access.

### Issue: Actions not saving

**Cause:** Permission issue or API error

**Solution:**
1. Check admin permissions level
2. Check Network tab for errors
3. Verify backend API is running
4. Check audit logs for conflicts

## 🔒 Security Considerations

### Access Logging

All admin actions are logged:
- Who performed the action
- What was changed
- When it happened
- From which IP address

### Two-Factor Authentication

Recommended for all admin accounts:
```
1. Enable 2FA in profile settings
2. Scan QR code with authenticator app
3. Enter verification code
4. Backup codes provided
5. 2FA required on every login
```

### IP Whitelisting

Restrict admin access to specific IPs:
```
# In system settings
Allowed Admin IPs:
- 203.0.113.0
- 198.51.100.0
- Corporate VPN range
```

### Session Management

Admin sessions are:
- Shorter timeout (30 minutes idle)
- Require re-authentication for sensitive actions
- Automatically logged on suspicious activity

## 📊 API Endpoints Used

### Users
- `GET /api/admin/users` - All users
- `GET /api/admin/users/:id` - User details
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/ban` - Ban user

### Events
- `GET /api/admin/events` - All events
- `PATCH /api/admin/events/:id/approve` - Approve event
- `PATCH /api/admin/events/:id/reject` - Reject event
- `DELETE /api/admin/events/:id` - Delete event

### Financial
- `GET /api/admin/revenue` - Revenue reports
- `GET /api/admin/payouts` - Pending payouts
- `POST /api/admin/payouts/:id/process` - Process payout

### Analytics
- `GET /api/admin/analytics/dashboard` - Dashboard metrics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/users` - User analytics

### Audit
- `GET /api/admin/audit-logs` - Audit log entries

## 📚 Related Documentation

- [Root README](../../../README.md) - Project overview
- [Authentication](../../../docs/AUTHENTICATION.md) - Auth system
- [User App](../user/README.md) - User application
- [Organizer App](../organizer/README.md) - Organizer portal

## 🎓 Admin Best Practices

### Decision Making
- Review all relevant information before acting
- Document reasoning for important decisions
- Communicate clearly with users/organizers
- Be fair and consistent
- When in doubt, escalate to senior admin

### User Communication
- Be professional and courteous
- Explain decisions clearly
- Provide paths to resolution
- Follow up on commitments
- Maintain user trust

### Data Privacy
- Only access user data when necessary
- Don't share personal information
- Follow GDPR/privacy regulations
- Secure sensitive information
- Report any data breaches immediately

### Financial Oversight
- Review large transactions
- Monitor for fraud patterns
- Process payouts promptly
- Handle refunds fairly
- Maintain accurate records

## ✅ Admin Daily Checklist

Morning:
- [ ] Review dashboard alerts
- [ ] Check pending event approvals
- [ ] Review overnight bookings
- [ ] Check dispute queue
- [ ] Monitor system health

Throughout Day:
- [ ] Respond to flagged content
- [ ] Process refund requests
- [ ] Handle user support escalations
- [ ] Review revenue reports
- [ ] Check audit logs for anomalies

End of Day:
- [ ] Close resolved disputes
- [ ] Export daily reports
- [ ] Update team on key metrics
- [ ] Document important decisions
- [ ] Plan next day priorities

---

**The Admin App is the command center for MGLTickets. With great power comes great responsibility. Use it wisely!** 👨‍💼