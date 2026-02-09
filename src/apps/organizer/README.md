# Organizer App - Event Management Portal

## 📍 Location
`/src/apps/organizer/`

## 🎯 Purpose

The **Organizer App** is where event organizers create, manage, and monitor their events. This is a role-restricted application that provides tools for:

- Creating and editing events
- Managing ticket types and pricing
- Viewing bookings and attendees
- Checking in guests at events
- Analyzing sales and attendance
- Managing co-organizers

## 🌐 URLs

**Development:** `https://organizer.mgltickets.local:3001`  
**Production:** `https://organizer.mgltickets.com`

## 🔐 Access Requirements

**Role Required:** `user.role === 'organizer'`

Users with other roles will see an "Organizer Access Required" message and be directed back to the main site.

## 📁 Directory Structure

```
organizer/
├── pages/                      # Page components
│   ├── Dashboard.tsx          # Organizer dashboard
│   ├── EventsList.tsx         # List of organizer's events
│   ├── EventDetails.tsx       # Single event management
│   ├── EventForm.tsx          # Create/edit event form
│   ├── BookingsView.tsx       # Event bookings/attendees
│   ├── TicketTypes.tsx        # Manage ticket types
│   ├── CoOrganizers.tsx       # Manage co-organizers
│   ├── CheckIn.tsx            # Guest check-in interface
│   ├── Analytics.tsx          # Event analytics
│   └── Profile.tsx            # Organizer profile
├── components/                 # Organizer-specific components
│   ├── EventCard.tsx          # Event display card
│   ├── BookingTable.tsx       # Bookings data table
│   ├── TicketEditor.tsx       # Ticket type editor
│   └── QRScanner.tsx          # QR code scanner
├── routes.tsx                 # Route configuration
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## 🛣️ Routes

All routes require authentication AND organizer role.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Dashboard` | Organizer overview (redirects to /dashboard) |
| `/dashboard` | `Dashboard` | Event stats, quick actions |
| `/events` | `EventsList` | List all organizer's events |
| `/events/create` | `EventForm` | Create new event |
| `/events/:eventSlug` | `EventDetails` | Event management hub |
| `/events/:eventSlug/edit` | `EventForm` | Edit event details |
| `/events/:eventId/bookings` | `BookingsView` | View/manage bookings |
| `/events/:eventId/tickets` | `TicketTypes` | Manage ticket types |
| `/events/:eventId/check-in` | `CheckIn` | Guest check-in interface |
| `/events/:eventId/analytics` | `Analytics` | Event analytics |
| `/co-organizers` | `CoOrganizers` | Manage team members |
| `/profile` | `Profile` | Organizer profile settings |

## 📊 Dashboard Overview

The dashboard provides at-a-glance insights:

### Key Metrics
- **Total Events** - Active, upcoming, past
- **Total Revenue** - Gross and net earnings
- **Total Tickets Sold** - Across all events
- **Upcoming Events** - Events in next 30 days

### Quick Actions
- Create New Event
- View Recent Bookings
- Check In Guests
- Export Reports

### Charts & Graphs
- Sales over time
- Ticket sales by event
- Revenue trends
- Attendance patterns

## 🎫 Event Management Workflow

### Creating an Event

```
1. Click "Create Event" (/events/create)
   ↓
2. Fill event details:
   - Name, description, category
   - Date, time, duration
   - Venue/location
   - Cover image
   ↓
3. Set up ticket types:
   - General Admission
   - VIP
   - Early Bird (with dates)
   - Group tickets
   ↓
4. Configure settings:
   - Visibility (public/private)
   - Capacity limits
   - Refund policy
   - Age restrictions
   ↓
5. Preview event
   ↓
6. Publish
   ↓
7. Event goes live on user app
```

### Managing an Event

```
Event Details Page (/events/:slug)
├── Overview Tab
│   ├── Event info summary
│   ├── Quick stats
│   └── Publish status
├── Tickets Tab
│   ├── Add/edit ticket types
│   ├── Set prices
│   ├── Manage availability
│   └── Promo codes
├── Bookings Tab
│   ├── View all bookings
│   ├── Filter/search
│   ├── Export to CSV
│   └── Send messages
├── Check-In Tab
│   ├── QR code scanner
│   ├── Manual check-in
│   └── Check-in statistics
├── Analytics Tab
│   ├── Sales metrics
│   ├── Traffic sources
│   ├── Demographics
│   └── Revenue breakdown
└── Settings Tab
    ├── Edit event details
    ├── Cancel event
    ├── Delete event
    └── Co-organizer access
```

## 🎟️ Ticket Management

### Ticket Types

Each event can have multiple ticket types:

```typescript
interface TicketType {
  id: string;
  name: string;              // "General Admission", "VIP"
  description: string;
  price: number;
  quantity: number;          // Total available
  quantity_sold: number;     // Number sold
  quantity_remaining: number;
  sale_start: Date | null;   // When sales begin
  sale_end: Date | null;     // When sales end
  is_active: boolean;
  min_per_order: number;     // Min tickets per purchase
  max_per_order: number;     // Max tickets per purchase
}
```

### Ticket Operations

**Create Ticket Type:**
```typescript
POST /api/events/:eventId/tickets
{
  name: "VIP",
  price: 50.00,
  quantity: 100,
  sale_start: "2026-03-01T00:00:00Z",
  sale_end: "2026-03-31T23:59:59Z"
}
```

**Update Ticket Type:**
```typescript
PATCH /api/events/:eventId/tickets/:ticketId
{
  price: 45.00,  // Price change
  quantity: 150  // Increase capacity
}
```

**Deactivate Ticket Type:**
```typescript
PATCH /api/events/:eventId/tickets/:ticketId
{
  is_active: false  // Hide from sales
}
```

## 📋 Bookings Management

### Viewing Bookings

**Filters:**
- Status (confirmed, cancelled, refunded)
- Date range
- Ticket type
- Payment status
- Check-in status

**Actions:**
- View booking details
- Send confirmation email
- Issue refund
- Mark as checked in
- Export to CSV
- Send bulk messages

### Booking Details

```typescript
interface Booking {
  id: string;
  booking_number: string;     // "MGT-123456"
  user: User;
  event: Event;
  tickets: TicketPurchase[];
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_status: 'confirmed' | 'cancelled';
  check_in_status: 'not_checked_in' | 'checked_in';
  check_in_time: Date | null;
  created_at: Date;
}
```

### Guest Check-In

**QR Code Scanner:**
```
1. Open Check-In page
2. Scan guest's QR code (from email ticket)
3. System validates ticket
4. Mark as checked in
5. Display confirmation
```

**Manual Check-In:**
```
1. Search by booking number or guest name
2. Verify identity
3. Click "Check In"
4. Confirm
```

## 👥 Co-Organizers

Organizers can invite team members to help manage events:

### Inviting Co-Organizers

```
1. Go to Co-Organizers page
2. Click "Invite Co-Organizer"
3. Enter email address
4. Set permissions:
   - View only
   - Edit events
   - Manage bookings
   - Full access
5. Send invitation
6. Co-organizer receives email
7. They accept invitation
8. Added to your team
```

### Permissions Levels

| Permission | View | Edit Event | Manage Bookings | Delete Event |
|------------|------|------------|-----------------|--------------|
| View Only  | ✅   | ❌         | ❌              | ❌           |
| Editor     | ✅   | ✅         | ❌              | ❌           |
| Manager    | ✅   | ✅         | ✅              | ❌           |
| Full Access| ✅   | ✅         | ✅              | ✅           |

## 📊 Analytics

### Event Analytics Dashboard

**Sales Metrics:**
- Tickets sold over time (chart)
- Revenue by ticket type (pie chart)
- Sales velocity (tickets/day)
- Conversion rate (views → purchases)

**Audience Insights:**
- Demographics (age, gender, location)
- First-time vs returning customers
- Group size distribution
- Peak purchase times

**Marketing Performance:**
- Traffic sources (direct, social, email, etc.)
- Campaign effectiveness
- Referral tracking
- Promo code usage

**Export Options:**
- PDF report
- CSV data export
- Email scheduled reports
- Share with co-organizers

## 🎨 Design Patterns

### Responsive Tables

All data tables (bookings, events) are responsive:

```typescript
// Mobile: Card view
<div className="md:hidden">
  {bookings.map(booking => (
    <BookingCard key={booking.id} booking={booking} />
  ))}
</div>

// Desktop: Table view
<div className="hidden md:block">
  <BookingTable bookings={bookings} />
</div>
```

### Form Validation

All forms use client-side validation:

```typescript
const validateEvent = (data: EventFormData) => {
  const errors: FormErrors = {};
  
  if (!data.name) errors.name = 'Event name required';
  if (!data.date) errors.date = 'Event date required';
  if (new Date(data.date) < new Date()) {
    errors.date = 'Event date must be in the future';
  }
  if (!data.venue) errors.venue = 'Venue required';
  
  return errors;
};
```

### Loading States

All async operations show loading feedback:

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSave = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await api.post('/events', eventData);
    toast.success('Event created!');
    navigate('/events');
  } catch (err) {
    setError('Failed to create event');
  } finally {
    setLoading(false);
  }
};
```

## 🔗 Navigation

### To Other Apps

```typescript
// Link back to main site
<a href={import.meta.env.VITE_USER_DOMAIN}>
  View Public Site
</a>

// Link to admin (if user is also admin)
{user?.role === 'admin' && (
  <a href={import.meta.env.VITE_ADMIN_DOMAIN}>
    Admin Panel
  </a>
)}
```

### Within Organizer App

```typescript
import { Link } from 'react-router-dom';

<Link to="/events">My Events</Link>
<Link to="/events/create">Create Event</Link>
<Link to={`/events/${event.slug}`}>Manage Event</Link>
```

## 🛠️ Development

### Running Locally

```bash
# Start organizer app only
npm run dev:organizer

# Or start all apps
npm run dev
```

### Building

```bash
# Build organizer app
npm run build:organizer

# Preview production build
npm run preview:organizer
```

### Environment Variables

Uses shared environment variables from root `.env.development`:

```bash
VITE_API_URL=https://api.mgltickets.local:8000
VITE_ORGANIZER_DOMAIN=https://organizer.mgltickets.local:3001
VITE_USER_DOMAIN=https://mgltickets.local:3000
```

## 🔧 Configuration

### Vite Config (`vite.config.ts`)

```typescript
{
  server: {
    port: 3001,
    host: true,
    https: {
      key: fs.readFileSync('../../../certs/key.pem'),
      cert: fs.readFileSync('../../../certs/cert.pem'),
    }
  }
}
```

### Route Protection

All routes automatically protected by `ProtectedRoute`:

```typescript
// routes.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'events', element: <EventsList /> },
      // ...more routes
    ]
  }
]);
```

`ProtectedRoute` checks:
1. User is authenticated
2. User role is 'organizer'
3. If not → shows access denied or redirects to login

## 🐛 Common Issues

### Issue: "Organizer Access Required" message

**Cause:** User role is not 'organizer'

**Solution:**
1. Go to main site (user app)
2. Navigate to "Become Organizer"
3. Complete organizer profile setup
4. Role will be upgraded to 'organizer'
5. Can now access organizer portal

### Issue: Can't create event

**Cause:** Missing required fields or validation error

**Solution:**
1. Check all required fields are filled
2. Check event date is in the future
3. Check venue is specified
4. Check image is uploaded
5. Review validation errors in form

### Issue: Bookings not showing

**Cause:** API error or permission issue

**Solution:**
1. Check Network tab for errors
2. Verify event belongs to current organizer
3. Check backend logs for errors
4. Verify database connection

## 📱 Mobile Responsiveness

The organizer app is fully responsive:

### Desktop (>1024px)
- Sidebar navigation
- Multi-column layouts
- Data tables with many columns
- Advanced charts

### Tablet (768px - 1024px)
- Collapsible sidebar
- Simplified layouts
- Scrollable tables
- Basic charts

### Mobile (<768px)
- Bottom navigation
- Card-based layouts
- Mobile-optimized forms
- Minimal charts
- Swipe gestures

## 🔒 Security Considerations

### Access Control

Every page checks user role:

```typescript
// In ProtectedRoute.tsx
if (APP_TYPE === 'organizer' && user.role !== 'organizer') {
  return <AccessDenied />;
}
```

### Data Isolation

Organizers can only access their own events:

```typescript
// Backend ensures data isolation
const events = await Event.findAll({
  where: { organizer_id: user.id }  // Only user's events
});
```

### Input Validation

All form inputs validated:

```typescript
// Client-side
const schema = z.object({
  name: z.string().min(3).max(100),
  date: z.date().min(new Date()),
  price: z.number().positive()
});

// Server-side (backend)
@validator(EventSchema)
async createEvent(data: EventData) {
  // ...
}
```

## 📊 API Endpoints Used

### Events
- `GET /api/organizer/events` - List organizer's events
- `POST /api/organizer/events` - Create event
- `GET /api/organizer/events/:id` - Event details
- `PATCH /api/organizer/events/:id` - Update event
- `DELETE /api/organizer/events/:id` - Delete event

### Tickets
- `GET /api/events/:id/tickets` - List ticket types
- `POST /api/events/:id/tickets` - Create ticket type
- `PATCH /api/tickets/:id` - Update ticket type
- `DELETE /api/tickets/:id` - Delete ticket type

### Bookings
- `GET /api/events/:id/bookings` - Event bookings
- `GET /api/bookings/:id` - Booking details
- `PATCH /api/bookings/:id/check-in` - Check in guest
- `POST /api/bookings/:id/refund` - Issue refund

### Analytics
- `GET /api/events/:id/analytics` - Event analytics
- `GET /api/organizer/dashboard-stats` - Dashboard metrics

## 📚 Related Documentation

- [Root README](../../../README.md) - Project overview
- [Shared Code](../../shared/README.md) - Shared utilities
- [Authentication](../../../docs/AUTHENTICATION.md) - Auth system
- [User App](../user/README.md) - Main application
- [Admin App](../admin/README.md) - Admin panel

## 🎓 Best Practices

### Event Creation
- Use descriptive, SEO-friendly names
- Upload high-quality cover images (1200x630px)
- Provide detailed descriptions
- Set realistic capacity limits
- Configure refund policies clearly

### Ticket Pricing
- Offer early bird discounts
- Consider tiered pricing (GA, VIP)
- Set reasonable min/max per order
- Use promo codes strategically

### Communication
- Send booking confirmations immediately
- Send reminders 24 hours before event
- Update attendees if event changes
- Thank attendees post-event

### Data Management
- Export bookings regularly
- Backup event data
- Monitor analytics weekly
- Review and respond to feedback

## ✅ Organizer Checklist

Before event day:

- [ ] Event details complete and accurate
- [ ] All ticket types configured
- [ ] Pricing finalized
- [ ] Cover image uploaded
- [ ] Event published and visible
- [ ] Marketing campaigns launched
- [ ] Co-organizers invited (if needed)
- [ ] Check-in process tested
- [ ] QR scanner working
- [ ] Attendee list reviewed
- [ ] Venue confirmed
- [ ] Equipment prepared
- [ ] Staff briefed

On event day:

- [ ] Arrive early
- [ ] Test check-in system
- [ ] Set up QR scanner
- [ ] Brief check-in staff
- [ ] Monitor attendance
- [ ] Handle issues promptly
- [ ] Collect feedback

Post-event:

- [ ] Mark event as completed
- [ ] Review analytics
- [ ] Send thank you emails
- [ ] Request feedback/reviews
- [ ] Export attendee data
- [ ] Plan next event

---

**The Organizer App empowers event creators to build amazing experiences. Every feature is designed with organizers in mind!** 🎪