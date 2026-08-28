# PreIPOKart — Product

PreIPOKart is a private-market **request book** for unlisted / pre-IPO shares in India. Investors browse private companies, place buy or sell requests at a stated price and quantity, and wait for a match. Funds sit in escrow until both sides complete settlement through a CDSL or NSDL demat path.

The product is **not** a recognised stock exchange, not a listed-market broker, and not a guaranteed counterparty. Illiquid names can sit unmatched. Prices on Home and company pages are last-traded / indicative, not NSE or BSE quotes.

The current codebase is a React + Vite frontend demo. Screens, flows, and fields below are what the live application must support. Data today lives in local modules and browser storage, not a backend.

---

## Positioning

| | |
|---|---|
| **Name** | PreIPOKart |
| **Tagline** | Pre-IPO marketplace |
| **Audience** | First-time buyers of unlisted shares, and later family offices / advisors |
| **Geography** | India (PAN, Aadhaar, CDSL / NSDL, INR) |
| **Core loop** | Browse company → place buy/sell request → match → escrow → settle → holdings |
| **Fee (demo)** | Place-order screen charges **0.25%** of notional as an escrow fee. FAQ / terms describe an Investor plan of **0.5% only on a matched deal**. Browsing is free. |

---

## How it works

1. **Browse companies** — Explore private companies not yet listed on NSE or BSE, with sector, last price, implied valuation, lockup, and series.
2. **Place a buy or sell request** — Set price and quantity. The book matches the request with the other side.
3. **Settle with escrow** — Money is held until the deal completes. Status moves: waiting → matched → money/shares held → completed.

---

## Access model

### Public (no login)

Landing, login, signup, companies list, company detail, IPOs, blog, FAQ, contact, careers, help, legal policies.

### Authenticated (login required)

Home (dashboard), portfolio, orders, order detail, place order, profile (including KYC / nominee / demat), notifications.

Unauthenticated users who hit a protected URL are sent to `/login?next=…` and returned after sign-in.

Redirects:

- `/kyc` → `/profile?tab=kyc`
- `/biometric` → `/profile`

---

## Features

### 1. Marketing landing (`/`)

Public homepage for first-time visitors.

- Sticky site header: How it works, Companies, IPOs, Blog / News, FAQ, Contact, Log in, Open account
- Hero with sample request-book chart (price path, volume, bid/ask guides)
- Trust stats: company count, escrow held, average match time, KYC-verified trades
- Trust signals: escrow protected, KYC before trading, transparent book
- Three-step process
- Feature grid: live market view, identity check, request book (not an exchange), in-app Help
- Featured company cards linking to company pages
- Landing FAQs (listed vs private, unmatched requests, not investment advice)
- Site footer with legal policy links, careers, contact

### 2. Authentication

#### Log in (`/login`)

- Email + password
- Redirect to `next` (safe path only; default `/dashboard`)
- Link to create an account (preserves `next`)
- Agreement to Terms of use and Privacy policy

#### Sign up (`/signup`)

- Channel: email **or** Indian mobile (`6–9` + 10 digits)
- OTP step: 6-digit code, paste-friendly, 30-second resend cooldown
- Demo OTP is `123456` in the current build
- Google sign-in shortcut
- After verify, same `next` redirect as login

Session today is a browser flag (`preipokart-auth`). A live product needs real accounts, password hashing, OTP delivery, OAuth, and server sessions.

### 3. App shell (logged-in chrome)

- Desktop sidebar + mobile top bar with drawer
- Browse: Home, Companies, Portfolio, Orders
- Account: Profile, Alerts, IPOs, Blog / News, FAQ, Contact us, Help
- Signed-in identity and log out
- Orders stays highlighted on Place order; Companies stays highlighted on stock pages

### 4. Home / live market (`/dashboard`)

Authenticated market overview.

- Search markets by name, ticker, or sector
- Pause / resume live price updates
- Notification bell with unread badge, list, mark one read, mark all read
- “Today’s takeaway” insight strip
- Price trend chart with 1D / 1W / 1M ranges and hover
- Live-ish bid volume and matching efficiency (pauseable)
- Order-book table per company: last clearing, best bid, best ask, LIQUID / ILLIQUID
- Row click opens the company page

### 5. Companies explorer (`/explore`)

Public company universe (Stripe is excluded from the public list; it is used as a place-order default in the demo).

- Search by name, ticker, or sector
- Sector chips (All + unique sectors)
- Sort by % change, price, or name
- Cards: logo, name, ticker, sector, last price, day change, implied valuation, lockup, series
- Click through to company detail

### 6. Company detail (`/stocks/:id`)

Public research page for one unlisted name.

- Header: logo, legal name, ticker, sector, last price, day change, implied valuation, lockup, series
- Buy / Sell CTAs → Place order (login required; guests go through login)
- Price chart: 1D / 1W / 1M / 1Y, hover crosshair (illustrative path, not a live exchange quote)
- Company facts: founded, HQ, CIN, website, employees, last funding, description
- Annual financials table: revenue, EBITDA, PAT, employees (₹ Cr)
- Document library: DRHP, financials, notices, cap table excerpts (download / open)
- Related navigation back to Companies

### 7. Place order (`/place-order?asset=&side=`)

Authenticated request ticket.

- Asset from query (`asset`); side BUY or SELL
- Last price, series, lockup, link to company details
- Price-over-time chart
- Visible bid / ask book: size, price, number of people on each side
- Ticket: Buy / Sell toggle, limit price, quantity
- Fee: **0.25%** of notional
  - Buy obligation = notional + fee
  - Sell proceeds = notional − fee
- Must accept terms before confirm
- Validation: positive price and quantity; terms ticked
- Success state with new order id and link to Orders
- Money-held-safely (escrow) messaging

### 8. Orders (`/orders`)

Authenticated request history.

- Count of requests still in progress
- New buy or sell
- Search by company, ticker, or order id
- Filter by side (all / BUY / SELL)
- Filter by status: Waiting, Matched, Held, Done, Cancelled
- List: company, side, price, quantity, fee, total, status label, timestamps
- Open a row for detail

### 9. Order detail (`/orders/:id`)

Authenticated lifecycle of one request.

Statuses:

| Status | Label | Meaning |
|---|---|---|
| `open` | Waiting for a match | In the book |
| `matched` | Matched with a counterparty | Pair found |
| `holding` | Money / shares held | Escrow / delivery in progress |
| `completed` | Completed | Settled into holdings |
| `cancelled` | Cancelled | Removed from the book |

Pipeline steps: open → matched → holding → completed.

Rules:

- **Edit** price and quantity only while `open`
- **Cancel** while `open` or `matched`
- Recalculate fee and total on edit (same 0.25% rule)
- Not found state if the id is invalid
- Link to company details

### 10. Portfolio (`/portfolio`)

Authenticated holdings after settlement.

Derived from **completed** orders (FIFO lots) plus last prices:

- Holdings: quantity, reserved (open/matched/holding sells), available, avg cost, last price, invested, market value, unrealized P&amp;L, day P&amp;L
- Totals: invested, market value, unrealized %, realized P&amp;L, day P&amp;L
- Escrow in: buy notional on matched / holding buys
- Sector allocation bars
- Sortable holdings table
- Pending requests still on Orders
- Empty state → browse companies

### 11. Profile (`/profile`)

Authenticated account settings, tabbed (`?tab=`).

#### Your details

Full name, email (order updates), mobile, city, date of birth. Save confirmation.

#### Password

Current password, new password (≥ 8 characters), confirm. Show / hide. Success / error notices.

#### KYC (`?tab=kyc`)

PAN + Aadhaar (same as demat). Submit → “submitted, we will email when approved.” Required before matching in the product story. Header shows Verified / Not verified.

#### Nominee

Person who receives holdings if the investor cannot. Name, relationship (Spouse / Parent / Child / Sibling / Other), share 1–100%, DOB, mobile, optional PAN. Does not replace a will.

#### CDSL &amp; NSDL

- CDSL: DP ID + 16-digit BO ID; connect / disconnect
- NSDL: DP ID + Client ID; connect / disconnect
- Status shown on the profile header

### 12. Alerts (`/notifications`)

Authenticated notification inbox.

- Order progress, KYC reminders, price updates
- Tap to mark read
- Mark all as read
- Home bell is a compact version of the same feed

### 13. IPOs (`/ipos`)

Public IPO calendar (illustrative, not a live SEBI feed).

Summary counts: open now, upcoming with dates, DRHP stage.

Filters: All, Open now, Upcoming, DRHP passed, Closed / listing, Recently listed.

Per issue: name, legal name, sector, exchange, Mainboard / SME, price band, lot size, issue size, open / close / listing dates, DRHP date, SEBI status, GMP, subscription, registrar, lead managers, note.

Statuses: `open`, `upcoming`, `drhp`, `closed`, `listed`.

### 14. Blog / News (`/blog`, `/blog/:slug`)

Public editorial.

- Index: category, title, excerpt, date, read time, author, cover
- Article: published time IST, author role + photo, body, inline image
- Topics in the demo: listed-market tone, RBI policy, unlisted settlement, company news

### 15. FAQ (`/faq`)

Public searchable FAQ.

Categories: All, Getting started, Trading, Fees &amp; settlement, KYC &amp; demat, Risk.

Search (e.g. “fee”, “KYC”, “sell”). Links into Help / Profile for next steps.

Covered: listed vs private, what pre-IPO means, browse without account, how to buy/sell, where bids live, unmatched requests, when the fee is taken, escrow, PAN/Aadhaar, nominee, demat, not advice, not risk-free.

### 16. Help (`/help`)

In-app (and public) short answers on buy/sell, bids, PAN/Aadhaar, nominee, risk. Deep links to KYC, demat, and nominee tabs.

### 17. Contact (`/contact`)

Public desk contact.

- Form: name, email, phone, subject, message (name + email + message required)
- Success / validation notices
- Bengaluru office address, phone, `hello@preipokart.in`
- Hours: Mon–Fri 9:30–6:30 IST, Sat 10:00–2:00, Sunday and market holidays closed
- Embedded map

### 18. Careers (`/careers`)

Public jobs board.

Teams: Desk, Product, Engineering, Trust.

Per role: title, location, full-time / contract, posted date, summary, work bullets.

Apply dialog:

- Name, email, phone (≥ 10 digits), city, LinkedIn, note
- Resume PDF / DOC / DOCX, max 5 MB
- One application per job in the demo
- Prefill from logged-in user when present
- Careers inbox: `careers@preipokart.in`

### 19. Legal (`/legal/:slug`)

Public policy set, updated 26 Aug 2026:

| Slug | Title |
|---|---|
| `terms` | Terms of use |
| `privacy` | Privacy policy |
| `cookies` | Cookie policy |
| `risk-disclosure` | Risk disclosure |
| `disclaimer` | Disclaimer |
| `refunds` | Refund and cancellation |
| `kyc-aml` | KYC and AML |
| `grievance` | Grievance process |

Footer and auth screens link into this set. Copy is written for the demo (not a live licence).

---

## Product rules (must hold in a live build)

1. **Browse is free; matching is not guaranteed.** A request can sit unmatched. Illiquid names take longer.
2. **KYC before a request can match.** PAN and Aadhaar (aligned with demat). Incomplete KYC can leave a request waiting even if a counterparty appears.
3. **Demat path required to settle.** CDSL or NSDL identifiers on Profile.
4. **Escrow until both sides complete.** Buys contribute to “escrow in” while matched or holding. Sells reserve quantity so it cannot be double-sold.
5. **Cancel / edit windows.** Edit only while waiting (`open`). Cancel while waiting or matched. After holding, operations unwind — not self-serve in this product.
6. **Fee on the ticket.** Place order uses 0.25% of notional. Terms describe 0.5% only when a deal actually matches. Live billing must pick one published schedule and show GST separately.
7. **Portfolio is settled stock only.** Open requests stay on Orders. Holdings use FIFO lots from completed buys vs sells.
8. **Not investment advice.** Unlisted shares can lose value and may be hard to sell. Listing is not guaranteed.
9. **Eligibility.** 18+, competent to contract. No multiple accounts to evade limits.
10. **Not an exchange.** No continuous auction, no NSE/BSE quote, no promise that PreIPOKart is the other side of the trade.

---

## Order lifecycle

```
place request
      │
      ▼
   open ────────── cancel ──► cancelled
      │
      │  (counterparty found; KYC + demat ok)
      ▼
   matched ────── cancel ──► cancelled
      │
      │  (funds / shares locked)
      ▼
   holding
      │
      │  (delivery + payout)
      ▼
   completed  ──► holdings / realized P&L
```

---

## Information architecture

```
Public
  /                 Landing
  /login            Log in
  /signup           Create account
  /explore          Companies
  /stocks/:id       Company detail
  /ipos             IPO calendar
  /blog             News index
  /blog/:slug       Article
  /faq              FAQ
  /help             Help
  /contact          Contact
  /careers          Jobs
  /legal/:slug      Policies

Authenticated
  /dashboard        Home / live book
  /portfolio        Holdings
  /orders           Request list
  /orders/:id       Request detail
  /place-order      New buy or sell
  /profile          Account, KYC, nominee, demat
  /notifications    Alerts
```

---

## Company record (research object)

Each tradable name carries:

- Identity: id, display name, legal name, ticker, sector, domain, website, CIN
- Market: last price, day change %, implied valuation, lockup, series
- Profile: description, founded, headquarters, employees, last funding
- Documents: title, type, date, href
- Financials by year: revenue, EBITDA, PAT (₹ Cr), employees

Demo names include Swiggy, Razorpay, Pharmeasy, Ola Electric, Byju’s, Reliance Retail (and Stripe as an internal place-order default).

---

## Out of scope today (called out in product copy)

- Live CKYC / KRA / watchlist screening
- Real bank escrow rails
- Real CDSL / NSDL transfers
- Partial fills
- Interest on escrow
- GST / STT / stamp duty invoices
- Advisor-desk billing
- Biometric login (route redirects to Profile)
- Geo-blocking restricted jurisdictions

These belong in a licensed live service, not in the current demo.

---

## Success metrics (product)

| Metric | Why it matters |
|---|---|
| Requests placed / matched / completed | Core marketplace health |
| Time to match (target story: ~48 hours) | Liquidity |
| Unmatched open book by name | Illiquidity risk |
| KYC completion rate | Funnel before matching |
| Demat connect rate (CDSL or NSDL) | Settlement readiness |
| Cancel rate before match | Intent quality |
| Escrow outstanding | Operational risk |
| Contact / grievance tickets | Trust |

---

## Related docs

- [API documentation](./docs/api.md) — REST APIs required to run this application
- Design system: `design-system/romer-alpha/`
