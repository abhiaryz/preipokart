# PreIPOKart — design system (landing)

**Product:** PreIPOKart is a private-market request book for unlisted / pre-IPO shares in India. Investors browse private companies, place buy or sell requests, and funds sit in escrow until settlement. Not a recognised exchange. Audience: first-time unlisted buyers in India.

**Brand lockup:** There is no SVG/PNG logo. Identity is a cobalt rounded-lg `LetterMark` (letter **P**) plus the wordmark **PreIPOKart** in Pale Cobalt Mist (`#B6C4FF`). Do not invent a pictorial logo.

**Landing (`/`) structure to preserve as product content:** sticky header (How it works, Companies, IPOs, Blog / News, FAQ, Contact, Log in, Open account) → skip link → hero (eyebrow “Unlisted equity, India”; H1 “Buy shares in companies before they list”; supporting copy about browse / request / escrow; CTAs Get started + How it works) + sample request-book card (Swiggy chart, bid/ask, 3 company rows) → trust stats (N+ private companies, ₹2.4 Cr escrow, 48 hrs match, 100% KYC) and three trust signals → How it works (3 steps) → feature bento → company cards → social proof → FAQ accordion → final CTA (Open account / Browse companies) → footer.

**Job of this file:** fonts, colors, elevation, and component styles are hard constraints. Redesigns may recompose layout and hierarchy; they must not invent serif display fonts, pink/purple palettes, or pill-bubbly SaaS chrome.

---

---
name: Romer Neo-Skeuomorphic
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c3c5d9'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#8d90a2'
  outline-variant: '#434656'
  surface-tint: '#b6c4ff'
  primary: '#b6c4ff'
  on-primary: '#00277f'
  primary-container: '#1a5cff'
  on-primary-container: '#edeeff'
  inverse-primary: '#004ee8'
  secondary: '#ccffe5'
  on-secondary: '#003826'
  secondary-container: '#00f4b3'
  on-secondary-container: '#006b4c'
  tertiary: '#c4c6cf'
  on-tertiary: '#2d3037'
  tertiary-container: '#6a6c74'
  on-tertiary-container: '#edeef7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab2'
  secondary-fixed: '#3effbf'
  secondary-fixed-dim: '#00e1a5'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#005139'
  tertiary-fixed: '#e1e2eb'
  tertiary-fixed-dim: '#c4c6cf'
  on-tertiary-fixed: '#191c22'
  on-tertiary-fixed-variant: '#44474e'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
  obsidian-night: '#0A0C10'
  machined-graphite: '#0F1218'
  electric-mint: '#2AFFBD'
typography:
  display-lg:
    fontFamily: Inter Tight
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter Tight
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter Tight
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter Tight
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter Tight
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
rounded:
  DEFAULT: 0.125rem
  lg: 0.25rem
  xl: 0.5rem
  2xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  widget-gap: 16px
---

# Design System: ROMER ALPHA
**Project:** Romer Neo-Skeuomorphic — Unlisted Equity Exchange

## 1. Visual Theme & Atmosphere

ROMER ALPHA is **obsidian precision** — a high-fidelity, neo-skeuomorphic trading desk for institutional investors and high-net-worth individuals. The mood is dense, tactile, and private-banking: every surface feels milled rather than drawn. Architectural modernism supplies the grid; physical-interface cues (inset fields, bezeled buttons, top-lit edges) supply the weight.

The canvas is a near-black, low-glare void that keeps financial data readable across long sessions. Depth is built from tonal elevation and frosted glass, not from flat SaaS cards. Lighting is directional — a cool top-center source that paints a thin highlight on the upper edge of widgets and primary actions. The result is exclusive without being theatrical: information-dense, machined, and high-value.

**Key characteristics:**
- Obsidian, low-glare canvas with cool blue-gray neutrals
- Three-layer elevation: void base, machined widgets, frosted overlays
- Dual type: condensed humanist sans for narrative, monospace for every number
- Soft, disciplined corners — milled, never bubbly
- Directional top-light bezels and cobalt outer glow on high-intent actions
- Modular widget grid instead of a continuous page flow

## 2. Color Palette & Roles

### Primary Foundation
- **Obsidian Night** (#0A0C10) — True canvas. Body background, recessed chart wells, and inset input interiors. The darkest, flattest layer.
- **Graphite Void** (#111318) — Surface and background token. Default app chrome and page fill when Material surfaces are used.
- **Void Black** (#0C0E12) — Lowest container. Sidebar, marketing page base, and the floor beneath widgets.
- **Machined Graphite** (#0F1218) — Widget Layer (Level 1). Solid widget bodies with a 1px inner highlight on the top edge.
- **Raised Steel** (#1A1C20) — Low container. Trust bars, secondary bands, and recessed grouping.
- **Tonal Steel** (#1E2024) — Default container. Search wells and mid-elevation panels.
- **Brushed Steel** (#282A2E) — High container. Hover fills on nav items and compact control chips.
- **Forged Steel** (#333539) — Highest container and surface variant. Table headers, progress tracks, and the most elevated solid fill.
- **Ash Highlight** (#37393E) — Surface bright. Focused search fill and the lightest solid steel.

### Accent & Interactive
- **Romer Cobalt** (#1A5CFF) — Primary action fill. CTA buttons, active sidebar items, selected chips, focus rings. The high-intent color.
- **Deep Inverse Cobalt** (#004EE8) — Bottom stop of the primary button gradient; inverse primary. Creates the milled, lit-from-above button face.
- **Pale Cobalt Mist** (#B6C4FF) — Primary / surface tint. Wordmark, active nav text, thin progress fills, live-status dots, gradient display headlines.
- **Porcelain Ice** (#DCE1FF / #EDEEFF) — Primary-fixed and on-primary-container. Gradient headline highlights and text sitting on cobalt fills.
- **Navy Ink** (#00277F) — On-primary. Text/icon color only when placed on Pale Cobalt Mist.
- **Hairline Glass** (white at 5–10% opacity) — Widget bezels, nav hairlines, and card dividers. Defines edges without adding weight.

### Typography & Text Hierarchy
- **Polar Mist** (#E2E2E8) — On-surface / on-background. Headlines, prices, and primary reading text.
- **Cool Lavender-Gray** (#C3C5D9) — On-surface-variant. Supporting copy, secondary nav, placeholders at reduced opacity.
- **Brushed Aluminum** (#8D90A2) — Outline. Metadata labels, footer links, tertiary captions.
- **Slate Bezel** (#434656) — Outline-variant. Structural borders, ghost-button strokes, inactive bezels.

### Functional States
- **Electric Mint** (#00F4B3 / #00E1A5 / #2AFFBD) — Growth, liquidity, system-online, completed KYC, buy-side signal. Always with a soft outer glow. Never used as a primary CTA.
- **Mint Veil** (#CCFFE5) — Secondary text on mint-tinted surfaces; hover accent on footer links.
- **Forest Ink** (#003826 / #006B4C) — On-secondary. Text sitting on mint fills.
- **Coral Alert** (#FFB4AB) — Negative change, illiquid contrast, error text.
- **Blood Maroon** (#93000A) — Error container. Destructive well; on-error-container is **Blush Ice** (#FFDAD6).

## 3. Typography Rules

**Narrative family:** Inter Tight — condensed, elegant humanist sans. Slightly tighter than Inter, which gives headlines architectural compression without losing warmth.

**Data family:** JetBrains Mono — strictly reserved for tickers, prices, credentials, table cells, timestamps, and status labels. Tabular alignment is non-negotiable in data-heavy views.

**Icons:** Material Symbols Outlined, weight 400, optical size 24. Fill only when a state is active.

### Hierarchy & Weights
- **Display Large (H1):** Inter Tight, semi-bold (600), 48px, line-height 1.1, letter-spacing −0.02em. Hero titles and desk names. On Market Desk, apply a left-to-right gradient from Pale Cobalt Mist to Porcelain Ice. Scale to 32px on mobile.
- **Headline Medium (H2):** Inter Tight, semi-bold (600), 32px, line-height 1.2, letter-spacing −0.01em. Section titles such as “Trending Equities.”
- **Headline Small (H3):** Inter Tight, medium (500), 24px, line-height 1.3. Equity names, product titles, brand lockup at nav scale.
- **Body Large:** Inter Tight, regular (400), 18px, line-height 1.6. Hero supporting copy.
- **Body Medium:** Inter Tight, regular (400), 16px, line-height 1.5. Default UI copy, nav labels, secondary buttons. Medium (500) on primary button labels.
- **Data Large:** JetBrains Mono, medium (500), 20px, line-height 1.4. Last-traded prices and featured metrics.
- **Data Medium:** JetBrains Mono, medium (500), 14px, line-height 1.4. Search fields, table cells, credentials, compact metrics.
- **Label Caps:** JetBrains Mono, semi-bold (600), 12px, line-height 1.2, letter-spacing 0.08em, uppercase. Widget headers, table headers, trust-bar copy, status chips, form labels, “system online.” 10px is allowed for chart range chips and version stamps.

### Spacing Principles
- Display and headlines use tightened tracking so large type feels milled, not airy.
- Body copy stays at 1.5–1.6 line-height for long-session readability.
- Label Caps always sit above data — never the reverse — so metadata and values never compete.
- Related text stacks with 8–16px gaps; major sections use 24–48px.

## 4. Component Stylings

### Buttons
- **Shape:** Soft, nearly squared corners (4px / `rounded-lg`). Technical, not playful.
- **Primary (Cobalt mill):** Vertical gradient from Romer Cobalt (#1A5CFF) to Deep Inverse Cobalt (#004EE8). Polar white label. 1px top-edge highlight (white at 20%). Outer cobalt glow at 20–30% opacity. Hover raises the glow and top highlight; a 1px lift is allowed on login. Active presses the face down. Duration 200ms ease. Horizontal padding 24–32px; vertical 8px in nav, 14–16px in forms.
- **Ghost / Secondary:** Transparent fill, Slate Bezel stroke at 50%, faint inner top highlight. Hover fills with white at 5%. Used for biometric auth and “View Portfolio.”
- **Compact range chips:** Near-sharp 2px corners, Forged Steel fill; selected state is Romer Cobalt with Porcelain Ice text. Label Caps at 10px.

### Cards / Widgets
- **Corner style:** Generously disciplined 8px corners (`rounded-xl`) — a machined silhouette, not a pebble.
- **Widget Layer:** Machined Graphite (#0F1218) with inset top highlight (white at 5%) and a 12px, 20–50% drop shadow in obsidian — never pure black. Optional 1px Slate Bezel at 30%.
- **Glass Overlay:** Frosted panel at 80% #161920 with 20px backdrop blur, white stroke at 5–10%. Used for login, KYC forms, notifications, and floating alerts.
- **Internal padding:** 24px (gutter). Equity cards may use 24px with a 16px inner stack.
- **Hover (market cards):** Gentle 4px lift. No heavy shadow change — motion, not puff.
- **Image treatment:** 40–48px square logos with soft 4px corners, never full-bleed photography.

### Navigation
- **Desk (Dashboard / Bid Book):** Fixed 288px left rail on Void Black, hairline right border, deep obsidian shadow. Active item is a Romer Cobalt pill with inner top highlight and Porcelain Ice label. Inactive items are muted steel; hover slides 4px right and fills Brushed Steel.
- **Marketing / Explore / KYC:** 80px frosted top bar (Graphite Void at 80%, 24px blur), hairline bottom border, 32px ambient shadow. Wordmark in Pale Cobalt Mist. Active link: Pale Cobalt Mist with a 2px cobalt underline. Inactive: Cool Lavender-Gray, hover Polar Mist on a 5% white wash.
- **Mobile:** 80px frosted top bar; menu icon in Pale Cobalt Mist; drawer stacks links on Graphite Void.

### Inputs / Forms
- **Treatment:** Recessed — Obsidian Night well, inner 2px dark shadow, Slate Bezel stroke at 50%. Contrasts with protruding buttons.
- **Shape:** Soft 4px corners, matching buttons.
- **Typography:** Data Medium for values; Label Caps for labels, always with a 14px outlined icon.
- **Focus:** Border and 1px ring shift to Romer Cobalt. A 2px mint status dot may bloom beside credential fields.
- **Search (desk header):** Tonal Steel well, inset shadow, no border; focus ring in Pale Cobalt Mist, fill lifts to Ash Highlight.
- **Padding:** 12px vertical, 16px horizontal. Comfortable but compact.

### Domain Components
- **Equity / ticker cards:** Widget Layer, 8px corners, 48px logo, Label Caps sector, Headline Small name, Data Large price, mint or coral change chip. Hairline divider above the price row.
- **Status chips:** Near-sharp 2px corners. Liquid = Electric Mint at 10% fill, mint text, 20% mint stroke. Illiquid = Brushed Steel fill, Cool Lavender-Gray text. Growth pills may be fully rounded with a mint outer glow.
- **Data tables:** Label Caps headers, Data Medium cells, no static row rules. Hover is a 2% white wash. Live rows get a glowing Pale Cobalt Mist dot.
- **KYC stepper:** 40px circular stations. Completed = mint glow; current = cobalt fill with stronger glow and a white top-stroke; upcoming = muted, 50% opacity.
- **Login portal:** Centered 440px glass card, faint 40px technical grid on Obsidian Night, 600px cobalt bloom behind the card, four corner tick marks like a targeting reticle.

## 5. Layout Principles

### Grid & Structure
- **Max content width:** 1600px on the desk; 1280px (max-w-7xl) on marketing sections. Login is a single 440px column.
- **Desktop desk:** 12-column modular widget grid. Typical Market Desk split is 8 + 4, with a full-width table below.
- **Marketing grid:** Four equity cards on large desktop, two on tablet, one on mobile.
- **Sidebar:** 288px fixed rail; main column offsets by the same amount.
- **Breakpoints:** Mobile below 768px (single column, 80px top bar). Desktop from 768px (rail + widget grid).

### Whitespace Strategy
- **Base unit:** 4px. All spacing snaps to this scale.
- **Widget gap:** 16px between widgets — tight enough for a desk, not a magazine.
- **Gutter / inner padding:** 24px inside widgets.
- **Page margins:** 40px desktop, 16px mobile.
- **Hero (Explore):** 96–128px vertical padding, centered, with a 800px cobalt bloom behind the headline.

### Alignment & Visual Balance
- **Desk:** Left-aligned, data-forward. Headlines and metrics start at the content edge; charts sit in recessed wells.
- **Marketing hero and login:** Centered ceremonial composition.
- **Visual weight:** Dark void around lit widgets. Cobalt and mint are scarce — they mark action and health, never decoration.
- **Numbers always monospace** so columns of prices, bids, and IDs stay optically locked.

### Responsive Behavior & Touch
- **Desktop-first desk, collapsing to a stacked column** with a frosted top bar below 768px.
- Display Large scales to 32px / 24px on small screens so the wordmark does not overwhelm.
- Interactive targets stay at least 40px; primary form buttons use 44px+ height.
- Grids collapse 12 → 1; gutters remain 16px; page margin drops to 16px.
- Touch icons (menu, notifications) sit in 8px-padded, 4px-rounded hit areas.

## 6. Design System Notes for Stitch Generation

### Language to Use
- Atmosphere: “obsidian precision,” “neo-skeuomorphic modernism,” “private-banking desk,” “milled / machined surfaces”
- Corners: “soft nearly-squared 4px corners” for buttons; “disciplined 8px widget corners” for cards — never “bubbly” or “pill-shaped” except status dots
- Depth: “tonal elevation with a top-edge bezel” and “frosted glass overlay (20px blur)” — not generic drop shadows
- Inputs: “inset / recessed wells” vs “protruding cobalt-milled buttons”
- Spacing: “4px modular widget grid with 24px inner padding and 40px desktop margins”

### Color References
Always use descriptive names with hex codes:
- Canvas: “Obsidian Night (#0A0C10)” or “Graphite Void (#111318)”
- Widgets: “Machined Graphite (#0F1218)”
- Primary CTA: “Romer Cobalt (#1A5CFF) grading to Deep Inverse Cobalt (#004EE8)”
- Brand / active text: “Pale Cobalt Mist (#B6C4FF)”
- Body text: “Polar Mist (#E2E2E8)” / supporting “Cool Lavender-Gray (#C3C5D9)”
- Success: “Electric Mint (#00F4B3)” with a soft outer glow
- Error / down: “Coral Alert (#FFB4AB)”

### Component Prompts
- “Create a primary button with a vertical Romer Cobalt mill, 4px corners, a 1px white top-edge highlight, and a cobalt outer glow on hover.”
- “Design a widget in Machined Graphite (#0F1218) with 8px corners, an inset top highlight, Label Caps header in JetBrains Mono, and 24px inner padding.”
- “Build an inset credential field on Obsidian Night with a recessed inner shadow; on focus, ring it in Romer Cobalt (#1A5CFF).”
- “Add a frosted glass login card (80% #161920, 20px blur) centered on a faint 40px technical grid, with a large cobalt bloom behind it.”

### Incremental Iteration
1. Change one surface at a time (rail, widget, overlay) so elevation stays consistent.
2. Keep mint strictly for health/growth and cobalt strictly for intent — do not swap them.
3. If a new screen needs a table, use hover washes instead of row rules, and JetBrains Mono for every cell.
4. Never flatten the bezel: widgets without a top-edge highlight read as generic dark SaaS.
