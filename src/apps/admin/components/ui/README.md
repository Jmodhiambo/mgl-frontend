# UI Components (`components/ui/index.tsx`)

All shared building blocks used across every admin page. Import from `'../components/ui'`.

## Component Reference

### `<StatusBadge status="active" />`
Renders a colored pill badge. Supports: `active`, `inactive`, `verified`, `unverified`, `upcoming`, `ongoing`, `completed`, `cancelled`, `draft`, `confirmed`, `refunded`, `pending`, `open`, `responded`, `closed`, `spam`, `admin`, `organizer`, `user`.

### `<ConfirmDialog />`
Modal dialog for destructive actions. Props: `title`, `message`, `confirmLabel`, `variant` (`danger`|`warning`|`info`), `onConfirm`, `onCancel`, `loading`.

### `<Spinner size="md" />`
Spinning loader. Sizes: `sm`, `md`, `lg`.

### `<EmptyState icon={Users} title="No users" description="..." action={{ label, onClick }} />`
Centered empty state with optional icon, description, and CTA button.

### `<PageLoader />`
Full-panel centered spinner for page-level loading states.

### `<AlertBanner type="success" message="..." onClose={...} />`
Inline alert strip. Types: `success`, `error`, `warning`, `info`.

### `<Pagination page={1} totalPages={5} total={50} limit={10} onPageChange={fn} />`
Pagination row with page numbers and prev/next arrows.

### `<FilterBar search={...} onSearchChange={fn} placeholder="..." filters={<>...</>} actions={<>...</>} />`
Search input + filter slot + actions slot in a flex row.

### `<TableSkeleton rows={6} cols={5} />`
Animated skeleton table for loading states.

### `<SectionCard title="..." subtitle="..." actions={...} noPadding>`
Card wrapper with header row. `noPadding` moves padding to header only (useful when card contains a table).

### `<StatCard label="..." value="..." delta={{ value: '+5%', up: true }} icon={Users} iconBg="bg-purple-100" iconColor="text-purple-600" />`
KPI metric card with icon, value, and delta indicator.

### `<MiniBarChart data={[{ label, value }]} height={80} color="#9333ea" />`
Simple inline SVG bar chart. No external dependencies.

### `<SparkLine data={[number]} height={40} color="#9333ea" />`
SVG polyline sparkline chart.
