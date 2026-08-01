# MGLTickets Help Center Articles — Summary

**Date completed:** 2026-07-20
**Total articles:** 44
**Location:** `src/shared/articles/help/{category}/`
**Metadata registry:** `src/data/helpArticles.ts`

---

## What Was Done

1. Audited the old `OldHelpCenter.tsx` page, which listed 8 categories and 44 planned
   articles, only 2 of which existed as real components (`HowToPurchaseTickets` and
   `HowToPayWithMpesa`).
2. Wrote the remaining 42 articles as React components, one category at a time.
3. Standardized all articles on the **content-only pattern** — each exports just an
   `<article className="prose prose-lg max-w-none">...</article>`, no page chrome
   (no back link, header, related-articles, or contact CTA). This matches
   `ArticleLayout.tsx`, which supplies the page wrapper, and the original
   `how-to-purchase-tickets.tsx` pattern.
4. Rewrote `how-to-pay-with-mpesa.tsx`, which originally included its own full-page
   chrome, to match the content-only pattern.
5. Created a category `index.ts` for every category, and updated the master
   `src/shared/articles/help/index.ts` to export all categories and register every
   component in the `articleComponents` registry.
6. Added metadata for all 44 articles to `src/data/helpArticles.ts`
   (`ArticleMetadata` entries — slug, componentName, title, summary, category,
   read time, tags).
7. Renumbered every article `id` sequentially from `1` to `44`, in the order the
   articles appear in the registry (grouped by category, same order as site nav).

---

## Category Breakdown

| # | Category | Articles | Notes |
|---|----------|----------|-------|
| 1 | Getting Started | 4 | All new |
| 2 | Buying Tickets | 6 | 1 pre-existing (`HowToPurchaseTickets`), 5 new |
| 3 | Payments & Billing | 6 | 1 pre-existing (`HowToPayWithMpesa`, rewritten for layout), 5 new |
| 4 | Account Management | 6 | All new |
| 5 | Events & Attendance | 6 | All new |
| 6 | Refunds & Cancellations | 5 | All new |
| 7 | For Event Organizers | 6 | All new (kept in user app, not organizer app — see note below) |
| 8 | Security & Privacy | 5 | All new |

**Total: 44**

---

## Full Article List

### Getting Started
| ID | Title | Slug |
|----|-------|------|
| 1 | Creating Your MGLTickets Account | `creating-your-account` |
| 2 | How to Browse Events | `how-to-browse-events` |
| 3 | Understanding Event Pages | `understanding-event-pages` |
| 4 | Account Settings Overview | `account-settings-overview` |

### Buying Tickets
| ID | Title | Slug |
|----|-------|------|
| 5 | How to Purchase Tickets | `how-to-purchase-tickets` |
| 6 | Selecting Ticket Types and Quantities | `selecting-ticket-types` |
| 7 | Understanding Ticket Prices and Fees | `ticket-prices-and-fees` |
| 8 | Accessing Your Digital Tickets | `accessing-your-digital-tickets` |
| 9 | Transferring Tickets to Others | `transferring-tickets` |
| 10 | What to Do If You Don't Receive Your Tickets | `troubleshooting-missing-tickets` |

### Payments & Billing
| ID | Title | Slug |
|----|-------|------|
| 11 | How to Pay with M-Pesa | `how-to-pay-with-mpesa` |
| 12 | Accepted Payment Methods | `accepted-payment-methods` |
| 13 | Payment Security and Protection | `payment-security-and-protection` |
| 14 | Troubleshooting Failed Payments | `troubleshooting-failed-payments` |
| 15 | Understanding Service Fees | `understanding-service-fees` |
| 16 | Viewing Your Payment History | `viewing-your-payment-history` |

### For Event Organizers
| ID | Title | Slug |
|----|-------|------|
| 17 | Creating Your First Event | `creating-your-first-event` |
| 18 | Setting Up Ticket Types | `setting-up-ticket-types` |
| 19 | Managing Event Sales | `managing-event-sales` |
| 20 | Event Marketing Tools | `event-marketing-tools` |
| 21 | Scanning Tickets at Entry | `scanning-tickets-at-entry` |
| 22 | Organizer Dashboard Overview | `organizer-dashboard-overview` |

### Account Management
| ID | Title | Slug |
|----|-------|------|
| 23 | Updating Your Profile Information | `updating-your-profile` |
| 24 | Changing Your Password | `changing-your-password` |
| 25 | Resetting a Forgotten Password | `resetting-forgotten-password` |
| 26 | Email Verification | `email-verification` |
| 27 | Managing Notification Preferences | `managing-notification-preferences` |
| 28 | Deactivating or Deleting Your Account | `deactivating-your-account` |

### Events & Attendance
| ID | Title | Slug |
|----|-------|------|
| 29 | Preparing for Event Day | `preparing-for-event-day` |
| 30 | Using Your QR Code at Entry | `using-your-qr-code-at-entry` |
| 31 | What If My Event is Cancelled | `what-if-my-event-is-cancelled` |
| 32 | Rescheduled Events | `rescheduled-events` |
| 33 | Contacting Event Organizers | `contacting-event-organizers` |
| 34 | Lost or Forgotten Tickets | `lost-or-forgotten-tickets` |

### Refunds & Cancellations
| ID | Title | Slug |
|----|-------|------|
| 35 | Understanding Our Refund Policy | `understanding-our-refund-policy` |
| 36 | How to Request a Refund | `how-to-request-a-refund` |
| 37 | Refund Processing Times | `refund-processing-times` |
| 38 | Event Cancellation Refunds | `event-cancellation-refunds` |
| 39 | Partial Refunds and Fees | `partial-refunds-and-fees` |

### Security & Privacy
| ID | Title | Slug |
|----|-------|------|
| 40 | Account Security Best Practices | `account-security-best-practices` |
| 41 | Recognizing Fraudulent Tickets | `recognizing-fraudulent-tickets` |
| 42 | Two-Factor Authentication | `two-factor-authentication` |
| 43 | Privacy Settings and Data Protection | `privacy-settings-and-data-protection` |
| 44 | Reporting Suspicious Activity | `reporting-suspicious-activity` |

---

## Files Changed or Added

```
src/data/helpArticles.ts                                  (updated — 44 entries, ids 1–44)
src/shared/articles/help/index.ts                          (updated — all 8 categories registered)

src/shared/articles/help/getting-started/
  ├── creating-your-account.tsx                            (new)
  ├── how-to-browse-events.tsx                              (new)
  ├── understanding-event-pages.tsx                         (new)
  ├── account-settings-overview.tsx                         (new)
  └── index.ts                                              (new)

src/shared/articles/help/buying-tickets/
  ├── how-to-purchase-tickets.tsx                           (unchanged)
  ├── selecting-ticket-types.tsx                             (new)
  ├── ticket-prices-and-fees.tsx                             (new)
  ├── accessing-your-digital-tickets.tsx                     (new)
  ├── transferring-tickets.tsx                               (new)
  ├── troubleshooting-missing-tickets.tsx                    (new)
  └── index.ts                                              (updated)

src/shared/articles/help/payments/
  ├── how-to-pay-with-mpesa.tsx                              (rewritten — content-only)
  ├── accepted-payment-methods.tsx                           (new)
  ├── payment-security-and-protection.tsx                    (new)
  ├── troubleshooting-failed-payments.tsx                    (new)
  ├── understanding-service-fees.tsx                         (new)
  ├── viewing-your-payment-history.tsx                       (new)
  └── index.ts                                              (updated)

src/shared/articles/help/organizers/
  ├── creating-your-first-event.tsx                          (new)
  ├── setting-up-ticket-types.tsx                            (new)
  ├── managing-event-sales.tsx                               (new)
  ├── event-marketing-tools.tsx                              (new)
  ├── scanning-tickets-at-entry.tsx                          (new)
  ├── organizer-dashboard-overview.tsx                       (new)
  └── index.ts                                              (new)

src/shared/articles/help/account/
  ├── updating-your-profile.tsx                              (new)
  ├── changing-your-password.tsx                             (new)
  ├── resetting-forgotten-password.tsx                       (new)
  ├── email-verification.tsx                                 (new)
  ├── managing-notification-preferences.tsx                  (new)
  ├── deactivating-your-account.tsx                          (new)
  └── index.ts                                              (new)

src/shared/articles/help/events/
  ├── preparing-for-event-day.tsx                            (new)
  ├── using-your-qr-code-at-entry.tsx                        (new)
  ├── what-if-my-event-is-cancelled.tsx                      (new)
  ├── rescheduled-events.tsx                                 (new)
  ├── contacting-event-organizers.tsx                        (new)
  ├── lost-or-forgotten-tickets.tsx                          (new)
  └── index.ts                                              (new)

src/shared/articles/help/refunds/
  ├── understanding-our-refund-policy.tsx                    (new)
  ├── how-to-request-a-refund.tsx                            (new)
  ├── refund-processing-times.tsx                            (new)
  ├── event-cancellation-refunds.tsx                         (new)
  ├── partial-refunds-and-fees.tsx                           (new)
  └── index.ts                                              (new)

src/shared/articles/help/security/
  ├── account-security-best-practices.tsx                    (new)
  ├── recognizing-fraudulent-tickets.tsx                     (new)
  ├── two-factor-authentication.tsx                          (new)
  ├── privacy-settings-and-data-protection.tsx                (new)
  ├── reporting-suspicious-activity.tsx                      (new)
  └── index.ts                                              (new)
```

---

## Key Decisions Made Along the Way

- **Content-only pattern chosen** for all articles (vs. full-page pattern), since
  `ArticleLayout.tsx` already supplies the page chrome. `how-to-pay-with-mpesa.tsx`
  was rewritten to match, and its old "Related Articles" / "Contact Support"
  sections were dropped since those now belong to the page-level component, not
  the article.
- **Organizer articles live in the user app help center**, not the organizer app,
  since they serve people researching whether to host with MGLTickets — a
  discovery/marketing purpose, not an in-portal reference. Styled consistently
  with the rest of the user-app help center (orange theme).
- **Accepted Payment Methods** and **Two-Factor Authentication** both explicitly
  state the current limitation (card payments not yet supported; 2FA not yet
  built) rather than describing unbuilt features as if they exist.
- **Understanding Service Fees / Event Cancellation Refunds** are explicit that
  MGLTickets charges no service fees on top of ticket prices, and that any
  Safaricom M-Pesa transaction charge is separate and outside MGLTickets' control.
- **Article `id`s are sequential (`1`–`44`)**, ordered by category in the same
  order as `articleRegistry`. They don't map to the original `OldHelpCenter.tsx`
  numbering, which was inconsistent to begin with.

---

## Still Outstanding / For Your Review

- All `lastUpdated` dates are placeholders (`2026-07-20`) — the date this batch
  was written, not necessarily a real publish date.
- **Two-Factor Authentication** article assumes 2FA isn't built yet — confirm
  this is accurate before publishing.
- No images/screenshots included in any article — text and icons only, per the
  existing pattern in `how-to-purchase-tickets.tsx`.
- Per the README checklist, articles should also be spot-checked by loading each
  URL once wired into routing, and related-articles links (referenced by name in
  prose, e.g. "See 'Refund Processing Times'") should be checked against the
  actual page-level "Related Articles" component, if one exists, to make sure
  the referenced titles match.