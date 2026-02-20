# Legal Pages Architecture

> **TL;DR — When updating legal copy, open `TermsContent.tsx` or `RefundContent.tsx` and edit there. Never touch the page wrapper files for content changes. The modal in Checkout updates automatically.**

---

## The Problem This Solves

The `Checkout` page shows a terms checkbox that lets users read the **Terms & Conditions** and **Refund Policy** in a modal — without losing their place in the checkout flow. Initially, the modal rendered the full page components (`TermsOfService`, `RefundPolicy`) directly, which caused two issues:

1. **Page-level chrome leaked into the modal** — `min-h-screen`, `bg-gradient`, `pt-16`, and SEO helmet tags all rendered inside the modal panel.
2. **Fragile CSS override** — A Tailwind arbitrary variant hack (`[&>div]:min-h-0`) was used to suppress those styles. It worked, but it was targeting internal DOM structure and would silently break if the page components were ever refactored.

---

## The Solution: Content / Page Separation

Each legal document is split into **two files**:

```
TermsContent.tsx     ← The actual legal copy. Edit this.
TermsOfService.tsx   ← Page wrapper only. Do not edit for content.

RefundContent.tsx    ← The actual policy copy. Edit this.
RefundPolicy.tsx     ← Page wrapper only. Do not edit for content.
```

Both the **full page** and the **checkout modal** import the `*Content` component. There is a single source of truth for the copy.

---

## File Responsibilities

### `TermsContent.tsx` / `RefundContent.tsx`
- Contains **all legal text, headings, and layout sections**
- Has **no** SEO tags, no `document.title`, no `min-h-screen`, no `pt-16`, no background
- Is a plain React component that returns JSX — nothing else
- **This is the only file you need to open when updating legal copy**

### `TermsOfService.tsx` / `RefundPolicy.tsx`
- Thin page wrappers — approximately 25 lines each, and they should stay that way
- Owns exactly two concerns:
  - The SEO helmet (`<TermsSEO />` / `<RefundSEO />`)
  - The full-page background and layout chrome (`min-h-screen`, `bg-gradient`, `pt-16`)
- Renders the corresponding `*Content` component as its only child
- **Do not add legal copy here**

### `Checkout.tsx`
- Imports `TermsContent` and `RefundContent` directly from `@shared/pages`
- Renders them inside a modal panel — no wrappers, no overrides needed
- The modal has its own header (title + close button) and footer (Close / I Agree buttons)
- Clicking **I Agree** in the modal automatically ticks the checkbox and closes the modal

---

## How to Update Legal Copy

### Updating Terms of Service
1. Open `src/shared/pages/TermsContent.tsx`
2. Edit the relevant section
3. Save — that's it

The updated copy appears automatically on:
- `/terms` — the full Terms of Service page
- The checkout modal when users click "Terms & Conditions"

### Updating the Refund Policy
1. Open `src/shared/pages/RefundContent.tsx`
2. Edit the relevant section
3. Save — that's it

The updated copy appears automatically on:
- `/refund` — the full Refund Policy page
- The checkout modal when users click "Refund Policy"

---

## File Map

```
src/
└── shared/
    └── pages/
        ├── TermsContent.tsx       ← Edit for terms copy changes
        ├── TermsOfService.tsx     ← Page wrapper (SEO + chrome only)
        ├── RefundContent.tsx      ← Edit for refund policy changes
        └── RefundPolicy.tsx       ← Page wrapper (SEO + chrome only)

src/
└── user/
    └── pages/
        └── Checkout.tsx           ← Imports *Content directly for the modal
```

---

## Data Flow

```
User visits /terms
  └── TermsOfService.tsx
        ├── <TermsSEO />           (SEO helmet)
        └── <TermsContent />       (all legal copy)

User is on Checkout, clicks "Terms & Conditions"
  └── Checkout.tsx
        └── Modal panel
              └── <TermsContent /> (same component, no chrome)

User visits /refund
  └── RefundPolicy.tsx
        ├── <RefundSEO />          (SEO helmet)
        └── <RefundContent />      (all policy copy)

User is on Checkout, clicks "Refund Policy"
  └── Checkout.tsx
        └── Modal panel
              └── <RefundContent /> (same component, no chrome)
```

---

## The Checkout Modal — How It Works

The modal is controlled by a single state variable:

```tsx
const [modalContent, setModalContent] = useState<'terms' | 'refund' | null>(null);
```

- `null` — modal is closed
- `'terms'` — modal open, showing `<TermsContent />`
- `'refund'` — modal open, showing `<RefundContent />`

### Opening the modal
The links in the terms checkbox call:
```tsx
onClick={() => setModalContent('terms')}
onClick={() => setModalContent('refund')}
```

### Closing the modal
Three ways to close:
1. Click the **×** button in the modal header
2. Click the **Close** button in the modal footer
3. Click the **backdrop** (outside the modal panel)

### Agreeing via the modal
The **I Agree** button in the footer:
```tsx
onClick={() => {
  setAgreedToTerms(true);          // ticks the checkbox
  setErrors({ ...errors, terms: undefined }); // clears any error
  setModalContent(null);           // closes the modal
}}
```
This means a user can open the modal, read the policy, click "I Agree", and the checkbox is ticked for them — they don't need to scroll back to tick it manually.

### The checkbox position
The checkbox lives **below the Complete Payment button** in the Order Summary sidebar (right column). This was intentional — it is the last thing a user sees before clicking pay, making it easy to spot on all screen sizes including laptops.

---

## Adding a New Legal Document (e.g. Privacy Policy)

Follow the same pattern:

1. **Create the content file** — `PrivacyContent.tsx`
   - No SEO, no page chrome, just the content

2. **Update the page wrapper** — `PrivacyPolicy.tsx`
   ```tsx
   import PrivacyContent from './PrivacyContent';
   
   const PrivacyPolicy: React.FC = () => {
     document.title = 'Privacy Policy - MGLTickets';
     return (
       <>
         <PrivacySEO />
         <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
           <PrivacyContent />
         </div>
       </>
     );
   };
   ```

3. **Use in a modal** — import and render `<PrivacyContent />` directly. No wrappers needed.

---

## Why Not Just Render the Full Page Component in the Modal?

Rendering `<TermsOfService />` directly inside the modal would pull in:

| What it brings | Why it's a problem in a modal |
|---|---|
| `<TermsSEO />` | Injects `<meta>` / `<title>` tags mid-render |
| `min-h-screen` | Forces the modal content to be at least the full viewport height |
| `bg-gradient-to-br` | Overrides the modal's white background |
| `pt-16` | Adds 64px of blank space at the top inside the modal |

A CSS override can suppress these — but it's targeting the page component's internal DOM structure. If the page component is ever refactored (e.g., wrapping div is removed, or a Fragment is used instead), the override silently stops working with no error.

The content/page split eliminates the problem at the source: the content component simply has nothing to suppress.

---

## Rules to Keep This Clean

1. **`*Content.tsx` files contain only content** — no SEO, no layout wrappers, no `min-h-screen`, no `pt-16`.
2. **`*Page.tsx` / page wrapper files stay ~25 lines** — if you find yourself adding copy there, you are in the wrong file.
3. **One source of truth** — the content files are it. Both the page and the modal read from the same place.
4. **New legal documents follow the same pattern** — always create a `*Content` component first.