# Admin API Module (`api/adminApi.ts`)

Centralises all HTTP calls to the backend admin endpoints.

## Current State
All functions currently return **dummy data** (from `utils/dummyData.ts`) so the UI renders correctly without a live backend.

## Activating Real API Calls

1. Uncomment the top import:
   ```ts
   import api from '@shared/api/axiosConfig';
   ```

2. In each function, uncomment the `api.xxx(...)` call and remove the `Promise.resolve(dummy...)` line.

## Endpoint Mapping

| Function | Method | Endpoint | Backend File |
|----------|--------|----------|--------------|
| `listAllUsers` | GET | `/admin/users` | `user_admin.py` |
| `getUserById` | GET | `/admin/users/:id` | `user_admin.py` |
| `deleteUser` | DELETE | `/admin/users/:id` | `user_admin.py` |
| `activateUser` | PATCH | `/admin/users/:id/activate` | `user_admin.py` |
| `deactivateUser` | PATCH | `/admin/users/:id/deactivate` | `user_admin.py` |
| `verifyUserEmail` | PATCH | `/admin/users/:id/verify` | `user_admin.py` |
| `promoteToOrganizer` | PATCH | `/admin/users/:id/role/user-to-organizer` | `user_admin.py` |
| `promoteToAdmin` | PATCH | `/admin/users/:id/role/user-to-admin` | `user_admin.py` |
| `demoteFromAdmin` | PATCH | `/admin/users/:id/role/admin-to-user` | `user_admin.py` |
| `listAllEvents` | GET | `/admin/events` | `event_admin.py` |
| `approveEvent` | PATCH | `/admin/events/:id/approve` | `event_admin.py` |
| `rejectEvent` | PATCH | `/admin/events/:id/reject` | `event_admin.py` |
| `deleteEvent` | DELETE | `/admin/events/:id` | `event_admin.py` |
| `listAllBookings` | GET | `/admin/bookings` | `booking_admin.py` |
| `deleteBooking` | DELETE | `/admin/bookings/:id` | `booking_admin.py` |
| `listAllPayments` | GET | `/admin/payments` | `payment_admin.py` |
| `listContactMessages` | GET | `/admin/contact` | `contact_messages_admin.py` |
| `markMessageAsResponded` | PATCH | `/admin/contact/:id/respond` | `contact_messages_admin.py` |
| `markMessageAsClosed` | PATCH | `/admin/contact/:id/close` | `contact_messages_admin.py` |
| `markMessageAsSpam` | PATCH | `/admin/contact/:id/spam` | `contact_messages_admin.py` |
| `cleanupSessions` | POST | `/admin/auth/cleanup-sessions` | `auth_admin.py` |

## New Endpoints Required (not yet in backend)

| Function | Method | Endpoint | Notes |
|----------|--------|----------|-------|
| `getDashboardStats` | GET | `/admin/analytics/dashboard` | Returns `DashboardStats` |
| `getRevenueChart` | GET | `/admin/analytics/revenue` | Returns `[{label, value}]` |
| `getUserGrowthChart` | GET | `/admin/analytics/user-growth` | Returns `[{label, value}]` |
| `getEventCategories` | GET | `/admin/analytics/events-by-category` | Returns `[{label, value}]` |
