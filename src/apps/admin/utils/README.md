# Utils

## `dummyData.ts`

All placeholder data used for UI visualization before the backend is connected.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `dummyDashboardStats` | `DashboardStats` | Platform-wide KPI numbers |
| `dummyRevenueChart` | `ChartDataPoint[]` | 7-month revenue array |
| `dummyUserGrowthChart` | `ChartDataPoint[]` | 6-month user growth array |
| `dummyUsers` | `AdminUser[]` | 12 sample users across all roles |
| `dummyEvents` | `AdminEvent[]` | 8 sample events in various states |
| `dummyBookings` | `AdminBooking[]` | 8 sample bookings |
| `dummyPayments` | `AdminPayment[]` | 8 sample payment transactions |
| `dummyMessages` | `ContactMessage[]` | 6 sample contact messages |
| `dummyAuditLogs` | `AuditLog[]` | 8 sample audit entries |
| `dummyTicketTypes` | `AdminTicketType[]` | 7 sample ticket types |
| `dummyActivityFeed` | `object[]` | 6 recent activity items |
| `dummyEventCategories` | `ChartDataPoint[]` | Category distribution |
| `dummyBookingStatuses` | `ChartDataPoint[]` | Booking status distribution |
| `formatKES(n)` | `string` | `1200` → `"KES 1,200"` |
| `formatDate(iso)` | `string` | ISO → `"15 Mar 2025"` |
| `formatDateTime(iso)` | `string` | ISO → `"15 Mar 2025, 10:00"` |
| `timeAgo(iso)` | `string` | ISO → `"2h ago"` |

## `dataHelpers.ts`

Re-exports and convenience aliases. Currently just re-exports `dummyBookings as dummyRecentBookings`.

---

# Types (`types/index.ts`)

TypeScript interfaces matching the backend Pydantic schemas.

| Interface | Matches Schema |
|-----------|---------------|
| `AdminUser` | `UserOut` |
| `AdminEvent` | `EventOut` |
| `AdminBooking` | `BookingOut` |
| `AdminPayment` | `PaymentOut` |
| `AdminTicketType` | `TicketTypeOut` |
| `ContactMessage` | `ContactMessageOut` |
| `DashboardStats` | New (to be created) |
| `AuditLog` | New (to be created) |

Additional utility types: `FilterState`, `PaginationMeta`, `ApiResponse<T>`, `SortDirection`, `UserRole`, `EventStatus`, `BookingStatus`, `MessageStatus`.
