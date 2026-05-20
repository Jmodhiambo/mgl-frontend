# Layout Components

## Files

### `AdminLayout.tsx`
The root layout wrapper. Renders `<Sidebar>` (desktop always visible, mobile as overlay) + `<Header>` + `<Outlet>` (page content).

- Reads `pending_approvals` and `open_messages` from `dummyDashboardStats` to inject badge counts into the sidebar.
- Maps route paths to readable page titles for the header.
- **TODO:** Replace hardcoded `adminName` with `useAuth().user?.first_name`.

### `Sidebar.tsx`
Left navigation panel with:
- Logo + app name
- Grouped nav sections (Overview, Management, Communication, Insights, System)
- Dynamic badges on Events (pending approvals) and Messages (open messages)
- Active route highlight via `NavLink`
- Quick actions at the bottom (Notifications, Profile, Sign Out)

### `Header.tsx`
Top bar with:
- Mobile hamburger menu toggle
- Global search bar (navigates to `/users?search=...`)
- Notification bell with badge
- Admin avatar + name + role label

## Styling
All layout dimensions are controlled via CSS variables in `index.css`:
```css
:root {
  --sidebar-width: 260px;
  --header-height: 64px;
  --sidebar-bg: #120e1a;
}
```
