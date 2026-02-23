# BookingsView Component Structure

## Overview
The BookingsView has been refactored into smaller, reusable components for better maintainability and organization.

---

## File Structure

```
src/
├── organizer/
│   ├── pages/
│   │   └── BookingsView.tsx          # Main page component
│   └── components/
|       └── BookingViewPage/
    │       ├── BookingDetailsModal.tsx    # Shows full booking details
    │       ├── EmailModal.tsx             # Email composition modal (single + bulk)
    │       ├── BulkActionBar.tsx          # Selection bar with bulk actions
    │       └── BookingsTable.tsx          # Table with selection checkboxes
```

---

## Component Breakdown

### 1. **BookingsView.tsx** (Main Component)
**Location**: `src/organizer/pages/BookingsView.tsx`

**Responsibilities**:
- Fetch and manage booking data
- Handle filtering (search, status, date range)
- Manage selection state for bulk operations
- Coordinate between child components
- Export to CSV functionality

**Key State**:
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);
const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
const [showEmailModal, setShowEmailModal] = useState(false);
```

---

### 2. **BookingDetailsModal.tsx**
**Location**: `src/organizer/components/BookingDetailsModal.tsx`

**Purpose**: Display complete booking information in a modal

**Props**:
```typescript
interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onSendEmail: () => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
}
```

**Features**:
- Customer information
- Event and ticket details
- Booking timeline
- Quick actions (Close, Send Email)

---

### 3. **EmailModal.tsx**
**Location**: `src/organizer/components/EmailModal.tsx`

**Purpose**: Compose and send emails (single or bulk)

**Props**:
```typescript
interface EmailModalProps {
  selectedBookings: Booking[];
  emailData: { template: string; subject: string; message: string; };
  emailTemplates: EmailTemplate[];
  sendingEmail: boolean;
  onClose: () => void;
  onTemplateChange: (templateId: string) => void;
  onEmailDataChange: (data: { subject: string; message: string }) => void;
  onSend: () => void;
}
```

**Features**:
- Template selection (4 pre-built + custom)
- Shows recipient list for bulk emails
- Subject and message editing
- Send button with loading state
- Character count
- Recipient count display

**Email Templates**:
1. Event Reminder
2. Event Update
3. Thank You
4. Custom Message

---

### 4. **BulkActionBar.tsx**
**Location**: `src/organizer/components/BulkActionBar.tsx`

**Purpose**: Show selection status and bulk actions

**Props**:
```typescript
interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEmail: () => void;
}
```

**Features**:
- Shows number of selected bookings
- Clear selection button
- Send bulk email button
- Auto-hides when nothing selected
- Animated appearance

---

### 5. **BookingsTable.tsx**
**Location**: `src/organizer/components/BookingsTable.tsx`

**Purpose**: Display bookings in a table with selection checkboxes

**Props**:
```typescript
interface BookingsTableProps {
  bookings: Booking[];
  selectedBookings: number[];
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onToggleBooking: (bookingId: number) => void;
  onViewBooking: (booking: Booking) => void;
  onEmailBooking: (booking: Booking) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
}
```

**Features**:
- Checkbox in header (select all)
- Checkbox in each row (individual selection)
- Visual highlight for selected rows
- View and Email action buttons
- Status badges
- Responsive design

**Columns**:
1. Checkbox (selection)
2. Booking ID
3. Customer (name + email)
4. Ticket Type
5. Quantity
6. Total Price
7. Status Badge
8. Date
9. Actions (View, Email)

---

## Data Flow

```
BookingsView (Main)
    │
    ├──> BookingsTable
    │    ├── Displays bookings with checkboxes
    │    ├── Emits: onToggleSelectAll, onToggleBooking
    │    └── Emits: onViewBooking, onEmailBooking
    │
    ├──> BulkActionBar
    │    ├── Shows when bookings selected
    │    ├── Emits: onClearSelection
    │    └── Emits: onBulkEmail
    │
    ├──> BookingDetailsModal (conditional)
    │    ├── Shows full booking info
    │    ├── Emits: onClose
    │    └── Emits: onSendEmail
    │
    └──> EmailModal (conditional)
         ├── Composes email (single/bulk)
         ├── Emits: onClose, onTemplateChange
         ├── Emits: onEmailDataChange
         └── Emits: onSend
```

---

## Usage Example

### Import in BookingsView:
```typescript
import BookingDetailsModal from '../components/BookingDetailsModal';
import EmailModal from '../components/EmailModal';
import BulkActionBar from '../components/BulkActionBar';
import BookingsTable from '../components/BookingsTable';
```

### Use in JSX:
```typescript
{/* Bulk Action Bar */}
<BulkActionBar
  selectedCount={selectedBookings.length}
  onClearSelection={clearSelection}
  onBulkEmail={openBulkEmailModal}
/>

{/* Bookings Table */}
<BookingsTable
  bookings={filteredBookings}
  selectedBookings={selectedBookings}
  selectAll={selectAll}
  onToggleSelectAll={toggleSelectAll}
  onToggleBooking={toggleBookingSelection}
  onViewBooking={handleViewBooking}
  onEmailBooking={openEmailModal}
  getStatusBadge={getStatusBadge}
  formatDate={formatDate}
/>

{/* Modals (conditional) */}
{showBookingDetails && selectedBooking && (
  <BookingDetailsModal ... />
)}

{showEmailModal && (
  <EmailModal ... />
)}
```

---

## Key Features

### ✅ Bulk Email
- Select individual bookings with checkboxes
- Select all with header checkbox
- Send to multiple recipients at once
- Shows recipient list in modal
- Same template system for bulk and single

### ✅ Component Separation
- Each component has single responsibility
- Easy to test individually
- Reusable across the app
- Cleaner code organization

### ✅ State Management
- Main state in BookingsView
- Props passed down to children
- Callbacks for child actions
- Unidirectional data flow

---

## API Integration Points

### Send Email (Single or Bulk)
```typescript
// In BookingsView.tsx
const handleSendEmail = async () => {
  const response = await sendBulkEmail({
    booking_ids: selectedBookings,
    subject: emailData.subject,
    message: emailData.message,
    template_used: emailData.template
  });
};
```

### Load Bookings
```typescript
const loadBookings = async () => {
  const response = eventId 
    ? await getBookingsByEvent(eventId)
    : await getAllOrganizerBookings();
  setBookings(response.data);
};
```

---

## Styling

All components use:
- **Blue theme** (matching organizer app)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Consistent spacing** and shadows
- **Hover states** for interactivity
- **Animations** (fade-in, transitions)

---

## Testing Checklist

### BookingsTable
- [ ] Select individual bookings
- [ ] Select all bookings
- [ ] Deselect all bookings
- [ ] Selected rows highlight in blue
- [ ] View button opens details modal
- [ ] Email button opens email modal

### BulkActionBar
- [ ] Shows when bookings selected
- [ ] Hides when no selection
- [ ] Shows correct count
- [ ] Clear button works
- [ ] Bulk email button works

### EmailModal
- [ ] Shows single recipient info
- [ ] Shows bulk recipient list
- [ ] Template selection works
- [ ] Template variables replace
- [ ] Subject and message editable
- [ ] Send button disabled when empty
- [ ] Loading state shows when sending

### BookingDetailsModal
- [ ] Shows all booking info
- [ ] Status badge displays correctly
- [ ] Dates format correctly
- [ ] Close button works
- [ ] Send email button opens email modal

---

## File Sizes

- **BookingsView.tsx**: ~700 lines (main component)
- **BookingDetailsModal.tsx**: ~150 lines
- **EmailModal.tsx**: ~200 lines
- **BulkActionBar.tsx**: ~50 lines
- **BookingsTable.tsx**: ~200 lines

**Total**: ~1,300 lines (split across 5 files)
**Before**: Would have been ~1,300 lines in one file

---

## Benefits

1. **Maintainability**: Easier to find and fix bugs
2. **Reusability**: Components can be used elsewhere
3. **Testability**: Test each component independently
4. **Readability**: Smaller files are easier to understand
5. **Collaboration**: Multiple devs can work on different components
6. **Performance**: Can optimize individual components

---

## Future Enhancements

### Possible Component Additions:
- `BookingStatsCards.tsx` - Stats display
- `BookingFilters.tsx` - Search and filter controls
- `EmailTemplateSelector.tsx` - Template UI
- `RecipientList.tsx` - Bulk email recipient display

### Possible Features:
- Drag-and-drop email attachments
- Rich text editor for emails
- Email scheduling
- Email history viewer
- Batch actions (refund, cancel)