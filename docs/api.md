# PreIPOKart API

REST APIs required to run PreIPOKart as a live application. The frontend today uses in-memory modules and `localStorage`; this document is the contract a backend must implement so every screen can leave mock data.

Companion: [product.md](../product.md).

---

## Conventions

| | |
|---|---|
| Base URL | `https://api.preipokart.in/v1` |
| Format | JSON (`Content-Type: application/json`) unless noted |
| Time | ISO-8601 UTC in payloads; UI displays IST |
| Money | INR decimal, two places. Quantities are integers (shares) |
| Auth | `Authorization: Bearer <access_token>` on protected routes |
| Idempotency | `Idempotency-Key` header on POST that creates money or orders |

### Envelope

Success:

```json
{
  "data": {},
  "meta": { "requestId": "req_…" }
}
```

List success:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_…",
    "page": 1,
    "pageSize": 20,
    "total": 142
  }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Enter a valid price and quantity.",
    "fields": { "quantity": "Must be greater than 0" }
  },
  "meta": { "requestId": "req_…" }
}
```

### HTTP status

| Status | When |
|---|---|
| 200 | GET / PATCH success |
| 201 | Resource created |
| 204 | DELETE / disconnect with no body |
| 400 | Validation |
| 401 | Missing or expired token |
| 403 | KYC / demat / eligibility block |
| 404 | Unknown id |
| 409 | Duplicate (email, already applied, already connected) |
| 422 | Business rule (cannot cancel a holding order) |
| 429 | OTP / login rate limit |
| 500 | Server |

### Auth scopes

| Scope | Routes |
|---|---|
| Public | Markets, IPOs, blog, FAQ, help, legal, contact, careers list |
| User | Session, profile, KYC, nominee, demat, orders, portfolio, notifications, place order |
| Admin (ops) | Match, escrow, KYC review, jobs inbox — not in the current UI |

### Access tokens

- Access token: 15 minutes
- Refresh token: 30 days, rotating, httpOnly cookie `preipokart_rt` **or** body (mobile)
- Logout revokes refresh tokens for that device

---

## 1. Authentication

Powers `/login`, `/signup`, App shell session, `RequireAuth`.

### POST `/auth/signup/otp`

Start signup. Channel is email or Indian mobile.

```json
{
  "channel": "email",
  "email": "ananya@email.com"
}
```

```json
{
  "channel": "mobile",
  "mobile": "9876543210"
}
```

**201**

```json
{
  "data": {
    "challengeId": "ch_01H…",
    "channel": "email",
    "maskedTarget": "a•••@email.com",
    "expiresInSeconds": 300,
    "resendInSeconds": 30
  }
}
```

Rules: email RFC-valid; mobile `^[6-9]\d{9}$`. Rate-limit by IP + identifier.

### POST `/auth/signup/otp/resend`

```json
{ "challengeId": "ch_01H…" }
```

**200** — same shape as send. **429** if `resendInSeconds` not elapsed.

### POST `/auth/signup/verify`

```json
{
  "challengeId": "ch_01H…",
  "otp": "123456"
}
```

**201** — creates user if new, returns session (same as login).

```json
{
  "data": {
    "user": { "id": "usr_…", "email": "ananya@email.com", "name": "Ananya Sharma", "mobile": "+919876543210" },
    "accessToken": "eyJ…",
    "expiresIn": 900
  }
}
```

### POST `/auth/login`

Email + password for `/login`.

```json
{
  "email": "ananya@email.com",
  "password": "••••••••"
}
```

**200** — same session payload as verify. **401** invalid credentials. Do not reveal whether the email exists.

### POST `/auth/password/change`

Authenticated. Profile → Password.

```json
{
  "currentPassword": "old-pass-word",
  "newPassword": "new-pass-word"
}
```

**204**. New password min 8 characters. Invalidates other refresh tokens optionally.

### POST `/auth/oauth/google`

Google sign-in on signup.

```json
{ "idToken": "google-id-token" }
```

**200 / 201** — session payload. Links or creates user by Google email.

### POST `/auth/refresh`

```json
{ "refreshToken": "rt_…" }
```

Cookie-only clients may send an empty body. **200** new access (+ rotated refresh).

### POST `/auth/logout`

Authenticated. **204**. Clears refresh cookie / revokes token.

### GET `/auth/me`

Authenticated. Bootstrap for App shell.

```json
{
  "data": {
    "id": "usr_…",
    "email": "ananya@email.com",
    "name": "Ananya Sharma",
    "mobile": "+919876543210",
    "kycStatus": "unverified",
    "nomineeOnFile": false,
    "cdslConnected": false,
    "nsdlConnected": false
  }
}
```

`kycStatus`: `unverified` | `pending` | `verified` | `rejected`.

---

## 2. Profile

Powers `/profile` tabs **Your details**.

### GET `/users/me`

Authenticated. Full profile.

```json
{
  "data": {
    "id": "usr_…",
    "name": "Ananya Sharma",
    "email": "ananya@email.com",
    "mobile": "+919876543210",
    "city": "Bengaluru",
    "dateOfBirth": "1994-06-12",
    "kycStatus": "unverified",
    "nomineeOnFile": false,
    "cdslConnected": false,
    "nsdlConnected": false
  }
}
```

### PATCH `/users/me`

```json
{
  "name": "Ananya Sharma",
  "email": "ananya@email.com",
  "mobile": "+919876543210",
  "city": "Bengaluru",
  "dateOfBirth": "1994-06-12"
}
```

**200** updated user. Email change may require re-verification (OTP). Order updates go to email.

---

## 3. KYC

Powers `/profile?tab=kyc` and matching gates.

### GET `/kyc`

Authenticated.

```json
{
  "data": {
    "status": "pending",
    "panLast4": "234F",
    "aadhaarLast4": "3210",
    "submittedAt": "2026-08-26T06:12:00Z",
    "reviewedAt": null,
    "rejectionReason": null
  }
}
```

Never return full PAN or Aadhaar after submit.

### POST `/kyc`

```json
{
  "pan": "ABCDE1234F",
  "aadhaar": "123412341234"
}
```

**201** `{ "data": { "status": "pending" } }`.

Validate PAN format (`[A-Z]{5}[0-9]{4}[A-Z]`) and 12-digit Aadhaar. Live service should call CKYC / KRA / watchlists; until then mark `pending` and email on approve.

**403** on order match if status is not `verified`.

---

## 4. Nominee

Powers `/profile?tab=nominee`.

### GET `/users/me/nominee`

**200** nominee or **404** none.

```json
{
  "data": {
    "name": "Rohan Sharma",
    "relationship": "Spouse",
    "sharePercent": 100,
    "dateOfBirth": "1992-01-04",
    "mobile": "+919811122233",
    "pan": "XYZAB1234C"
  }
}
```

`relationship`: `Spouse` | `Parent` | `Child` | `Sibling` | `Other`. `sharePercent` 1–100. PAN optional.

### PUT `/users/me/nominee`

Same body. **200**. Replaces the single nominee record (product is one nominee, 100% default).

---

## 5. Demat (CDSL / NSDL)

Powers `/profile?tab=demat`. Settlement needs at least one connected path.

### GET `/users/me/demat`

```json
{
  "data": {
    "cdsl": { "connected": true, "dpId": "12000000", "boIdLast4": "0000" },
    "nsdl": { "connected": false, "dpId": null, "clientIdLast4": null }
  }
}
```

### POST `/users/me/demat/cdsl`

```json
{ "dpId": "12000000", "boId": "1200000000000000" }
```

**200** `{ "data": { "connected": true } }`. BO ID 16 digits.

### DELETE `/users/me/demat/cdsl`

**204** disconnect.

### POST `/users/me/demat/nsdl`

```json
{ "dpId": "IN300000", "clientId": "12345678" }
```

**200**.

### DELETE `/users/me/demat/nsdl`

**204**.

---

## 6. Markets — companies

Powers landing sample book, `/explore`, `/stocks/:id`, Home table, Place order header.

### GET `/markets/stocks`

Public.

Query:

| Param | Type | Notes |
|---|---|---|
| `q` | string | Name, ticker, sector |
| `sector` | string | Exact sector; omit for All |
| `sort` | `change` \| `price` \| `name` | Default `change` |
| `order` | `asc` \| `desc` | Default `desc` except name |
| `page` | int | Default 1 |
| `pageSize` | int | Default 50 |

Exclude internal-only names (demo hides `STRIP` from Explore).

**200**

```json
{
  "data": [
    {
      "id": "SWIGGY",
      "name": "Swiggy",
      "legalName": "Swiggy Limited",
      "ticker": "SWIGGY",
      "sector": "Consumer Tech",
      "change": 4.2,
      "price": 425.5,
      "impliedVal": "₹85K Cr",
      "lockup": "90-Day Lockup",
      "series": "Pre-IPO • Common",
      "domain": "swiggy.com"
    }
  ],
  "meta": { "page": 1, "pageSize": 50, "total": 6, "sectors": ["Consumer Tech", "Fintech"] }
}
```

`meta.sectors` feeds Explore chips.

### GET `/markets/stocks/{id}`

Public. Full research object.

```json
{
  "data": {
    "id": "SWIGGY",
    "name": "Swiggy",
    "legalName": "Swiggy Limited",
    "ticker": "SWIGGY",
    "sector": "Consumer Tech",
    "change": 4.2,
    "price": 425.5,
    "impliedVal": "₹85K Cr",
    "lockup": "90-Day Lockup",
    "series": "Pre-IPO • Common",
    "domain": "swiggy.com",
    "description": "…",
    "founded": "2014",
    "headquarters": "Bengaluru, Karnataka",
    "cin": "U73100KA2013PLC096411",
    "website": "https://www.swiggy.com",
    "employees": "6,000+",
    "lastFunding": "Series J",
    "documents": [
      { "title": "Draft Red Herring Prospectus", "type": "DRHP", "date": "Apr 2024", "url": "https://…" }
    ],
    "financials": [
      { "year": "FY24", "revenueCr": 11247, "ebitdaCr": -412, "patCr": -2350, "employees": 6100 }
    ]
  }
}
```

**404** unknown id.

### GET `/markets/stocks/{id}/chart`

Public. Company detail + Place order + Home charts.

Query: `range=1D|1W|1M|1Y`

```json
{
  "data": {
    "range": "1M",
    "currency": "INR",
    "points": [
      { "t": "2026-07-27T09:15:00Z", "price": 410.2, "volume": 12000 }
    ]
  }
}
```

Illustrative last-traded path is acceptable until a real tape exists. Label it non-exchange in the UI.

### GET `/markets/overview`

Authenticated. Home dashboard.

```json
{
  "data": {
    "takeaway": "Bid volume is healthy in consumer tech; illiquid names still wide.",
    "bidVolumeCr": 4.2,
    "matchEfficiencyPct": 94.2,
    "book": [
      {
        "id": "SWIGGY",
        "name": "Swiggy",
        "domain": "swiggy.com",
        "sector": "Consumer Tech",
        "lastClearing": 425.5,
        "bestBid": 423.37,
        "bestAsk": 428.9,
        "status": "LIQUID"
      }
    ]
  }
}
```

`status`: `LIQUID` | `ILLIQUID`. Support `?q=` for the Home search box.

Live numbers: poll this every 4s while “live” is on, or use the WebSocket below.

---

## 7. Order book (depth)

Powers Place order “Who wants to buy or sell”.

### GET `/markets/stocks/{id}/book`

Public or authenticated.

```json
{
  "data": {
    "assetId": "SWIGGY",
    "lastPrice": 425.5,
    "bids": [
      { "price": 424.6, "quantity": 5000, "participants": 2 }
    ],
    "asks": [
      { "price": 425.6, "quantity": 1500, "participants": 1 }
    ]
  }
}
```

Bids descending, asks ascending. Aggregated by price level.

---

## 8. Orders (request book)

Powers `/orders`, `/orders/:id`, `/place-order`.

Fee in the current UI:

```
notional = price × quantity
fee      = notional × 0.0025
buy.total  = notional + fee
sell.total = notional − fee
```

Server must compute fee and total. Do not trust client totals.

`side`: `BUY` | `SELL`  
`status`: `open` | `matched` | `holding` | `completed` | `cancelled`

### GET `/orders`

Authenticated. Current user’s requests.

Query: `side`, `status`, `q` (company / ticker / order id), `page`, `pageSize`.

**200**

```json
{
  "data": [
    {
      "id": "ORD-1042",
      "assetId": "SWIGGY",
      "company": "Swiggy",
      "ticker": "SWIGGY",
      "domain": "swiggy.com",
      "side": "BUY",
      "price": 422,
      "quantity": 150,
      "fee": 158.25,
      "total": 63458.25,
      "status": "open",
      "placedAt": "2026-08-26T03:50:00Z",
      "updatedAt": "2026-08-26T03:50:00Z"
    }
  ],
  "meta": { "openCount": 3, "page": 1, "pageSize": 20, "total": 10 }
}
```

`openCount` = orders in `open` | `matched` | `holding`.

Status labels for UI:

| status | label |
|---|---|
| open | Waiting for a match |
| matched | Matched with a counterparty |
| holding | Money / shares held |
| completed | Completed |
| cancelled | Cancelled |

### GET `/orders/{id}`

Authenticated. **404** if missing or not owned.

Include capability flags so the UI does not guess:

```json
{
  "data": {
    "id": "ORD-1042",
    "assetId": "SWIGGY",
    "company": "Swiggy",
    "ticker": "SWIGGY",
    "domain": "swiggy.com",
    "side": "BUY",
    "price": 422,
    "quantity": 150,
    "fee": 158.25,
    "total": 63458.25,
    "status": "open",
    "placedAt": "2026-08-26T03:50:00Z",
    "updatedAt": "2026-08-26T03:50:00Z",
    "canEdit": true,
    "canCancel": true
  }
}
```

Rules: `canEdit` only if `open`. `canCancel` if `open` or `matched`.

### POST `/orders`

Authenticated. Place order. Require accepted terms.

```json
{
  "assetId": "SWIGGY",
  "side": "BUY",
  "price": 422,
  "quantity": 150,
  "acceptedTerms": true
}
```

**201** full order, `status: "open"`.

**400** if price/quantity ≤ 0 or `acceptedTerms` false.  
**403** if KYC not verified when policy requires it before the request can rest in a matchable book.  
**422** if SELL quantity > available (holding − reserved).  
**409** duplicate `Idempotency-Key`.

Create an in-app notification: “Your {company} buy/sell request is in progress”.

### PATCH `/orders/{id}`

Authenticated. Edit open request.

```json
{ "price": 420, "quantity": 200 }
```

**200** updated order (fee/total recomputed). **422** if not `open`.

### POST `/orders/{id}/cancel`

Authenticated.

**200** `{ "data": { "id": "ORD-1042", "status": "cancelled", "updatedAt": "…" } }`  
**422** if status is `holding` or `completed`.

---

## 9. Matching, escrow, settlement (ops)

Not user-facing screens, but required for status to move and for Portfolio / escrow figures.

### POST `/ops/matches` (admin)

Pair an open buy with an open sell.

```json
{ "buyOrderId": "ORD-1042", "sellOrderId": "ORD-1038" }
```

Preconditions: both `open`, same `assetId`, KYC verified both sides, seller has available shares, prices cross (buy ≥ sell). Both become `matched`. Notify both users.

### POST `/ops/orders/{id}/hold` (admin)

Move `matched` → `holding` (funds pulled / shares blocked). Notify.

### POST `/ops/orders/{id}/complete` (admin)

Move `holding` → `completed`. Credit buyer lots, debit seller lots, release escrow remainder. Notify. Portfolio is derived from completed orders.

Partial fills are **out of scope** for v1 (product.md).

---

## 10. Portfolio

Powers `/portfolio`. Prefer a server snapshot so FIFO, reserved qty, and escrow stay consistent.

### GET `/portfolio`

Authenticated.

```json
{
  "data": {
    "invested": 232881,
    "marketValue": 248210,
    "unrealized": 15329,
    "unrealizedPct": 6.6,
    "realized": 800,
    "dayPnl": 4200,
    "escrowIn": 24862,
    "reservedShares": 400,
    "holdings": [
      {
        "assetId": "SWIGGY",
        "company": "Swiggy",
        "ticker": "SWIGGY",
        "domain": "swiggy.com",
        "sector": "Consumer Tech",
        "quantity": 250,
        "reserved": 0,
        "available": 250,
        "avgCost": 400.4,
        "lastPrice": 425.5,
        "dayChangePct": 4.2,
        "invested": 100100,
        "marketValue": 106375,
        "unrealized": 6275,
        "unrealizedPct": 6.3,
        "dayPnl": 4467.75
      }
    ],
    "allocation": [
      { "sector": "Consumer Tech", "value": 106375, "pct": 42.9 }
    ],
    "pending": []
  }
}
```

Derivation (must match current UI):

- Holdings from **completed** orders, FIFO lots
- `reserved` = sell qty in `open` | `matched` | `holding`
- `available` = quantity − reserved
- `escrowIn` = sum of buy `total` where status is `matched` or `holding`
- `pending` = user’s open / matched / holding orders
- `dayPnl` per holding = `marketValue × (dayChangePct / 100)`

---

## 11. Notifications

Powers Home bell and `/notifications`.

### GET `/notifications`

Authenticated. Query: `unread=true`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "id": "ntf_…",
      "title": "Your Swiggy buy request is in progress",
      "body": "We are matching you with a seller. This usually takes 1–2 working days.",
      "read": false,
      "createdAt": "2026-08-26T04:01:00Z",
      "href": "/orders/ORD-1042"
    }
  ],
  "meta": { "unreadCount": 2, "page": 1, "pageSize": 20, "total": 3 }
}
```

### POST `/notifications/{id}/read`

**204**.

### POST `/notifications/read-all`

**204**. Clears unread badge.

Suggested triggers: order placed, matched, holding, completed, cancelled, KYC pending / approved / rejected, material last-price move.

---

## 12. IPOs

Powers `/ipos`.

### GET `/ipos`

Public.

Query: `status=open|upcoming|drhp|closed|listed` (omit for all).

```json
{
  "data": [
    {
      "id": "WAELINFRA",
      "name": "Waaree Energies",
      "legalName": "Waaree Energies Limited",
      "sector": "Renewable Energy",
      "exchange": "NSE & BSE",
      "status": "open",
      "issueType": "Mainboard",
      "priceBand": "₹1,427 – ₹1,503",
      "lotSize": 9,
      "issueSize": "₹4,320 Cr",
      "openDate": "2026-08-25",
      "closeDate": "2026-08-27",
      "listingDate": "2026-09-02",
      "drhpDate": "2026-03-01",
      "sebiStatus": "SEBI observations cleared",
      "gmp": "+₹118",
      "subscription": "4.1x (day 1)",
      "registrar": "KFin Technologies",
      "leadManagers": "JM Financial, Axis Capital",
      "domain": "waaree.com",
      "note": "…"
    }
  ],
  "meta": {
    "counts": { "open": 2, "upcoming": 3, "drhp": 3, "closed": 2, "listed": 2 }
  }
}
```

`issueType`: `Mainboard` | `SME`. Dates may be null for DRHP-only rows. This is a curated calendar, not a SEBI firehose.

---

## 13. Blog / news

Powers `/blog` and `/blog/:slug`.

### GET `/blog`

Public. Query: `category`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "slug": "nse-nifty-opens-higher-on-global-cues",
      "title": "Nifty opens higher as global cues lift risk appetite",
      "excerpt": "…",
      "date": "26 Aug 2026",
      "publishedAt": "2026-08-26T08:32:00+05:30",
      "publishedTime": "8:32 AM IST",
      "readMinutes": 4,
      "category": "Markets",
      "author": "Meera Iyer",
      "authorRole": "Markets desk",
      "authorImage": "https://…",
      "cover": "https://…"
    }
  ]
}
```

### GET `/blog/{slug}`

Public. Index fields plus:

```json
{
  "data": {
    "slug": "nse-nifty-opens-higher-on-global-cues",
    "inlineImage": "https://…",
    "body": ["Paragraph 1…", "Paragraph 2…"]
  }
}
```

**404** unknown slug.

---

## 14. FAQ and Help

Powers `/faq` and `/help`.

### GET `/faqs`

Public. Query: `q`, `category=getting-started|trading|fees|kyc|risk`.

```json
{
  "data": [
    {
      "id": "how-buy",
      "category": "trading",
      "q": "How do I buy?",
      "a": "Open Companies, pick a name, tap Place a buy or sell, then confirm. …"
    }
  ],
  "meta": {
    "categories": [
      { "id": "getting-started", "label": "Getting started" },
      { "id": "trading", "label": "Trading" },
      { "id": "fees", "label": "Fees & settlement" },
      { "id": "kyc", "label": "KYC & demat" },
      { "id": "risk", "label": "Risk" }
    ]
  }
}
```

Help can reuse this resource with a fixed id list, or GET `/help` returning the shorter in-app set.

---

## 15. Legal policies

Powers `/legal/:slug` and footer.

### GET `/legal`

Public. Nav list.

```json
{
  "data": [
    { "slug": "terms", "title": "Terms of use" },
    { "slug": "privacy", "title": "Privacy policy" },
    { "slug": "cookies", "title": "Cookie policy" },
    { "slug": "risk-disclosure", "title": "Risk disclosure" },
    { "slug": "disclaimer", "title": "Disclaimer" },
    { "slug": "refunds", "title": "Refund and cancellation" },
    { "slug": "kyc-aml", "title": "KYC and AML" },
    { "slug": "grievance", "title": "Grievance process" }
  ]
}
```

### GET `/legal/{slug}`

```json
{
  "data": {
    "slug": "terms",
    "title": "Terms of use",
    "updated": "26 Aug 2026",
    "summary": "…",
    "sections": [
      { "heading": "1. Who we are", "body": ["…"] }
    ]
  }
}
```

---

## 16. Contact

Powers `/contact`.

### GET `/contact/office`

Public. Address, hours, map — so the page is not hard-coded.

```json
{
  "data": {
    "line1": "3rd Floor, Prestige Atlanta",
    "line2": "80 Feet Road, Koramangala",
    "city": "Bengaluru, Karnataka 560034",
    "phone": "+91 80 4567 2100",
    "email": "hello@preipokart.in",
    "mapsQuery": "Prestige Atlanta, 80 Feet Road, Koramangala, Bengaluru",
    "mapEmbedUrl": "https://www.openstreetmap.org/export/embed.html?…",
    "hours": [
      { "day": "Monday – Friday", "time": "9:30 AM – 6:30 PM IST" }
    ]
  }
}
```

### POST `/contact`

Public (rate-limited).

```json
{
  "name": "Ananya Sharma",
  "email": "ananya@email.com",
  "phone": "+91 98765 43210",
  "subject": "Order ORD-1042",
  "message": "Please explain the fee on my last request."
}
```

**201** `{ "data": { "ticketId": "tkt_…" } }`.  
**400** if name, email, or message missing. Email ops at `hello@preipokart.in`.

---

## 17. Careers

Powers `/careers` and apply dialog.

### GET `/jobs`

Public. Query: `team=desk|product|engineering|trust`.

```json
{
  "data": [
    {
      "id": "kyc-officer",
      "title": "KYC and onboarding officer",
      "team": "trust",
      "location": "Bengaluru",
      "type": "Full-time",
      "posted": "8 Aug 2026",
      "summary": "…",
      "work": ["Review KYC packs against Indian verification rules."]
    }
  ],
  "meta": {
    "teams": [
      { "id": "desk", "label": "Desk" },
      { "id": "product", "label": "Product" },
      { "id": "engineering", "label": "Engineering" },
      { "id": "trust", "label": "Trust" }
    ],
    "careersEmail": "careers@preipokart.in"
  }
}
```

`type`: `Full-time` | `Contract`.

### GET `/jobs/{id}/application`

Authenticated optional. **200** `{ "data": { "applied": true } }` so the dialog can disable a second apply.

### POST `/jobs/{id}/applications`

`multipart/form-data`:

| Field | Required |
|---|---|
| `name` | yes |
| `email` | yes |
| `phone` | yes, ≥ 10 digits |
| `city` | yes |
| `linkedin` | no |
| `note` | no |
| `resume` | yes, PDF / DOC / DOCX, max 5 MB |

**201**

```json
{
  "data": {
    "id": "app-…",
    "jobId": "kyc-officer",
    "jobTitle": "KYC and onboarding officer",
    "submittedAt": "2026-08-26T08:00:00Z"
  }
}
```

**409** if this email already applied to this job. Store resume in object storage; do not keep files in IndexedDB.

---

## 18. Landing stats (optional)

Powers the landing trust bar.

### GET `/stats/public`

Public, cacheable.

```json
{
  "data": {
    "companyCount": 6,
    "escrowHeldLabel": "₹2.4 Cr",
    "avgMatchHours": 48,
    "kycVerifiedTradePct": 100
  }
}
```

---

## 19. Realtime (Home live prices)

While Home “live” is on, the UI currently jitters local numbers every 4s. For a real book:

**WebSocket** `wss://api.preipokart.in/v1/stream`

Query: `token=<access_token>`

Client → server:

```json
{ "type": "subscribe", "channels": ["overview", "book:SWIGGY"] }
```

Server → client:

```json
{
  "type": "overview",
  "bidVolumeCr": 4.21,
  "matchEfficiencyPct": 94.3,
  "book": [{ "id": "SWIGGY", "lastClearing": 425.7, "bestBid": 423.5, "bestAsk": 429.0, "status": "LIQUID" }]
}
```

Fallback: poll `GET /markets/overview` every 4s. Pause must stop the socket or the poll.

---

## Screen → API map

| Screen | APIs |
|---|---|
| Landing | `GET /markets/stocks`, `GET /stats/public` |
| Login | `POST /auth/login`, `GET /auth/me` |
| Signup | `POST /auth/signup/otp`, resend, verify, `POST /auth/oauth/google` |
| App shell | `GET /auth/me`, `POST /auth/logout`, `GET /notifications?unread=true` |
| Home | `GET /markets/overview`, `GET /markets/stocks/{id}/chart`, `GET /notifications`, read / read-all, WS optional |
| Companies | `GET /markets/stocks` |
| Company detail | `GET /markets/stocks/{id}`, `GET /markets/stocks/{id}/chart` |
| Place order | `GET /markets/stocks/{id}`, chart, `GET /markets/stocks/{id}/book`, `POST /orders` |
| Orders | `GET /orders` |
| Order detail | `GET /orders/{id}`, `PATCH /orders/{id}`, `POST /orders/{id}/cancel` |
| Portfolio | `GET /portfolio` |
| Profile details | `GET /users/me`, `PATCH /users/me` |
| Password | `POST /auth/password/change` |
| KYC | `GET /kyc`, `POST /kyc` |
| Nominee | `GET/PUT /users/me/nominee` |
| Demat | `GET /users/me/demat`, POST/DELETE cdsl & nsdl |
| Alerts | `GET /notifications`, read, read-all |
| IPOs | `GET /ipos` |
| Blog | `GET /blog`, `GET /blog/{slug}` |
| FAQ / Help | `GET /faqs` |
| Legal | `GET /legal`, `GET /legal/{slug}` |
| Contact | `GET /contact/office`, `POST /contact` |
| Careers | `GET /jobs`, application check, `POST /jobs/{id}/applications` |

---

## Minimum set to un-mock the app

Ship in this order:

1. **Auth** — signup OTP, login, me, logout, refresh  
2. **Markets** — stock list, stock detail, chart, book, overview  
3. **Orders** — create, list, get, edit, cancel  
4. **Portfolio** — snapshot from completed orders  
5. **Profile** — details, password, KYC, nominee, demat  
6. **Notifications** — list + read  
7. **Content** — IPOs, blog, FAQs, legal, contact, jobs  

Matching (`/ops/*`) can stay a manual desk tool until the book is live.

---

## Error codes

| Code | Typical status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Field-level failure |
| `UNAUTHENTICATED` | 401 | No / expired token |
| `FORBIDDEN` | 403 | KYC or eligibility |
| `NOT_FOUND` | 404 | Unknown resource |
| `CONFLICT` | 409 | Duplicate application / idempotent replay |
| `ORDER_NOT_EDITABLE` | 422 | Edit after `open` |
| `ORDER_NOT_CANCELLABLE` | 422 | Cancel after `matched` window |
| `INSUFFICIENT_SHARES` | 422 | Sell > available |
| `KYC_REQUIRED` | 403 | Match / place blocked |
| `DEMAT_REQUIRED` | 403 | Settlement blocked |
| `RATE_LIMITED` | 429 | OTP / login / contact |
| `OTP_INVALID` | 400 | Wrong or expired OTP |

---

## Security notes

- Hash passwords (Argon2id / bcrypt). Never log PAN, Aadhaar, BO ID, or OTPs.
- Return only last-4 for KYC and demat identifiers after save.
- OTP: 6 digits, 5-minute TTL, lock after N failures, 30-second resend.
- CORS allow the web origin only. CSRF: same-site refresh cookie + bearer access token.
- File uploads: MIME + extension allowlist, virus scan, private bucket.
- Idempotency keys on `POST /orders` and money-moving ops.
- Audit log every status change (`open` → `matched` → `holding` → `completed` / `cancelled`).
