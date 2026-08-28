# Page dependency trees

## / (Landing)
Entry: `src/pages/Landing.tsx`
Dependencies:
- `src/components/ui.tsx` (CompanyLogo, LetterMark)
- `src/components/HeroBackgroundAnimation.tsx`
  - `src/data/stocks.ts`
- `src/components/PublicLayout.tsx` (SiteHeader, SiteFooter only — AppShell import exists in file but is unused on this route)
  - `src/components/ui.tsx` (LetterMark)
  - `src/auth.tsx` (imported; unused by SiteHeader/SiteFooter)
  - `src/data/policies.ts` (policyNav for footer)
- `src/data/stocks.ts`
- `src/index.css` (landing-* utilities, tokens, buttons, cards)
- `tailwind.config.js`

Landing render branch: single return — desktop and mobile share one tree. Hero is two-column on lg (copy left, sample request-book card right); stacked on small screens. Header is sticky 56px. Footer is three-column on lg.

## /explore (Companies)
Entry: `src/pages/Explore.tsx`
Dependencies:
- `src/components/PublicLayout.tsx` via BrowseLayout
- `src/components/ui.tsx`
- `src/data/stocks.ts`

## /dashboard (Home)
Entry: `src/pages/Dashboard.tsx`
Dependencies:
- `src/components/AppShell.tsx`
  - `src/components/ui.tsx` (LetterMark)
  - `src/auth.tsx`
- `src/data/stocks.ts`
- `src/data/orders.ts`
