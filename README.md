# PreIPOKart

Frontend for a private-market **request book** for unlisted / pre-IPO shares in India. Investors browse companies, place buy or sell requests at a stated price and quantity, and wait for a match.

This is **not** a recognised stock exchange, listed-market broker, or guaranteed counterparty. Prices on Home and company pages are last-traded / indicative, not NSE or BSE quotes.

## Stack

- React 18 + TypeScript
- Vite (proxies `/v1` to the API in development)
- Tailwind CSS
- React Router
- PostHog (optional analytics)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000). The Vite dev server proxies `/v1` to [http://localhost:8000](http://localhost:8000).

### Environment

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | API origin. Leave empty in local dev so requests go through the Vite proxy. Set to `https://api.preipokart.in` in production. |
| `VITE_POSTHOG_KEY` | No | PostHog project token. Analytics is skipped if unset. |
| `VITE_POSTHOG_HOST` | No | PostHog host, e.g. `https://us.i.posthog.com` |

Do not commit `.env`. `.env.example` is the template.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check and production build |
| `npm run preview` | Serve the production build locally |

## Auth

- Sign up uses OTP (`POST /v1/auth/signup/otp` + verify)
- Log in uses email + password, or the same OTP flow
- Access and refresh tokens are stored in `localStorage` (`preipokart-session`)
- Public routes: landing, companies, company detail, IPOs, blog, FAQ, contact, careers, help, legal
- Login required: dashboard, portfolio, orders, place order, profile (KYC / nominee / demat), notifications

## Project layout

```
src/
  api/            Typed client for the PreIPOKart REST API
  pages/          App screens
  components/     Layout, auth UI, shared widgets
  hooks/          useApi
  auth.tsx        Session + token bootstrap
docs/api.md       API contract
product.md        Product spec and flows
```

## License

Private. All rights reserved.
