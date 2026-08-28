# Theme tokens

## Part 1 — Compact token summary

**Product:** PreIPOKart (ROMER ALPHA / neo-skeuomorphic trading desk). Dark-only (`color-scheme: dark`).

### Colors (RGB channels → hex)

| Token | RGB | Hex | Role |
|---|---|---|---|
| canvas | 10 12 16 | #0A0C10 | Page void |
| background / surface | 17 19 24 | #111318 | Chrome |
| surface-container-lowest | 12 14 18 | #0C0E12 | Sidebar / floor |
| surface-container-low | 26 28 32 | #1A1C20 | Trust bars |
| surface-container | 30 32 36 | #1E2024 | Mid panels |
| surface-container-high | 40 42 46 | #282A2E | Hover fills |
| surface-container-highest | 51 53 57 | #333539 | Table headers |
| surface-bright | 55 57 62 | #37393E | Focused wells |
| card | 15 18 24 | #0F1218 | Widgets |
| on-surface | 226 226 232 | #E2E2E8 | Primary text |
| on-surface-variant | 195 197 217 | #C3C5D9 | Secondary text |
| outline | 141 144 162 | #8D90A2 | Metadata |
| outline-variant | 67 70 86 | #434656 | Borders |
| primary | 182 196 255 | #B6C4FF | Wordmark, accents |
| primary-container | 26 92 255 | #1A5CFF | CTA fill (top of mill) |
| inverse-primary | 0 78 232 | #004EE8 | CTA fill (bottom of mill) |
| on-primary-container | 237 238 255 | #EDEEFF | Text on cobalt |
| secondary-container | 0 244 179 | #00F4B3 | Mint / bid |
| bid | 0 244 179 | #00F4B3 | Up / buy |
| ask / error | 255 180 171 | #FFB4AB | Down / sell |
| error-container | 147 0 10 | #93000A | Error well |
| ring | 182 196 255 | #B6C4FF | Focus |

### Typography
- Narrative: Inter Tight (sans)
- Data / labels: JetBrains Mono
- display-lg: 48px/1.1/600, tracking -0.02em
- headline-md: 32px/1.2/600
- headline-sm: 24px/1.3/500
- body-lg: 18px/1.6/400
- body-md: 16px/1.5/400
- data-lg: 20px/1.4/500 mono
- data-md: 14px/1.4/500 mono
- label-caps: 12px/1.2/600 mono, 0.08em uppercase

### Spacing / radius / shadow
- Unit 4px, gutter 24px, widget-gap 16px, margin desktop 40px / mobile 16px
- Radius: lg 4px (buttons), xl 8px (cards), 2xl 12px
- Widget shadow: `--shadow-widget`
- Primary mill: `--shadow-mill` / `--shadow-mill-hover`
- Header height: 56px
- Breakpoints: Tailwind defaults; marketing nav collapses below md (768px)
- Max content: 1400px marketing, 1440px desk

### Motion
- fade-up 420ms cubic-bezier(0.16, 1, 0.3, 1)
- Landing hero: ticker marquee, chart float, quant fade; disabled under prefers-reduced-motion

## Part 2 — Raw source

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
const rgb = (token) => `rgb(var(--color-${token}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: rgb("background"),
        canvas: rgb("canvas"),
        surface: rgb("surface"),
        "surface-dim": rgb("surface"),
        "surface-bright": rgb("surface-bright"),
        "surface-container-lowest": rgb("surface-container-lowest"),
        "surface-container-low": rgb("surface-container-low"),
        "surface-container": rgb("surface-container"),
        "surface-container-high": rgb("surface-container-high"),
        "surface-container-highest": rgb("surface-container-highest"),
        "surface-variant": rgb("surface-container-highest"),
        "on-surface": rgb("on-surface"),
        "on-surface-variant": rgb("on-surface-variant"),
        "on-background": rgb("on-surface"),
        outline: rgb("outline"),
        "outline-variant": rgb("outline-variant"),
        primary: rgb("primary"),
        "on-primary": rgb("on-primary"),
        "primary-container": rgb("primary-container"),
        "on-primary-container": rgb("on-primary-container"),
        "inverse-primary": rgb("inverse-primary"),
        "primary-fixed": rgb("primary-fixed"),
        secondary: rgb("secondary"),
        "secondary-container": rgb("secondary-container"),
        "on-secondary-container": rgb("on-secondary-container"),
        "secondary-fixed": rgb("secondary-fixed"),
        error: rgb("error"),
        "error-container": rgb("error-container"),
        "on-error": rgb("on-error"),
        card: rgb("card"),
        "card-foreground": rgb("on-surface"),
        muted: rgb("muted"),
        "muted-foreground": rgb("on-surface-variant"),
        border: rgb("outline-variant"),
        accent: rgb("primary-container"),
        "on-accent": rgb("on-primary-container"),
        destructive: rgb("error"),
        ring: rgb("ring"),
        foreground: rgb("on-surface"),
        scrim: rgb("scrim"),
        bid: rgb("bid"),
        ask: rgb("ask"),
        "obsidian-night": rgb("canvas"),
        "machined-graphite": rgb("card"),
      },
      borderColor: {
        DEFAULT: "rgb(var(--color-outline-variant) / 0.45)",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "9999px",
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        unit: "4px",
        "widget-gap": "16px",
        gutter: "24px",
      },
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        "label-caps": ["JetBrains Mono", "ui-monospace", "monospace"],
        "data-md": ["JetBrains Mono", "ui-monospace", "monospace"],
        "body-md": ["Inter Tight", "system-ui", "sans-serif"],
        "body-lg": ["Inter Tight", "system-ui", "sans-serif"],
        "headline-sm": ["Inter Tight", "system-ui", "sans-serif"],
        "display-lg": ["Inter Tight", "system-ui", "sans-serif"],
        "data-lg": ["JetBrains Mono", "ui-monospace", "monospace"],
        "headline-md": ["Inter Tight", "system-ui", "sans-serif"],
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "600" }],
        "data-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "data-lg": ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "headline-md": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      zIndex: {
        nav: "40",
        overlay: "50",
        modal: "60",
      },
    },
  },
  plugins: [],
};

```

### `src/index.css`

```css
@import "@fontsource/inter-tight/latin-400.css";
@import "@fontsource/inter-tight/latin-500.css";
@import "@fontsource/inter-tight/latin-600.css";
@import "@fontsource/jetbrains-mono/latin-500.css";
@import "@fontsource/jetbrains-mono/latin-600.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
    --header-height: 56px;
    --color-canvas: 10 12 16;
    --color-background: 17 19 24;
    --color-surface: 17 19 24;
    --color-surface-bright: 55 57 62;
    --color-surface-container-lowest: 12 14 18;
    --color-surface-container-low: 26 28 32;
    --color-surface-container: 30 32 36;
    --color-surface-container-high: 40 42 46;
    --color-surface-container-highest: 51 53 57;
    --color-card: 15 18 24;
    --color-on-surface: 226 226 232;
    --color-on-surface-variant: 195 197 217;
    --color-outline: 141 144 162;
    --color-outline-variant: 67 70 86;
    --color-primary: 182 196 255;
    --color-on-primary: 0 39 127;
    --color-primary-container: 26 92 255;
    --color-on-primary-container: 237 238 255;
    --color-inverse-primary: 0 78 232;
    --color-primary-fixed: 220 225 255;
    --color-secondary: 204 255 229;
    --color-secondary-container: 0 244 179;
    --color-on-secondary-container: 0 107 76;
    --color-secondary-fixed: 62 255 191;
    --color-error: 255 180 171;
    --color-error-container: 147 0 10;
    --color-on-error: 105 0 5;
    --color-muted: 30 32 36;
    --color-ring: 182 196 255;
    --color-scrim: 10 12 16;
    --color-bid: 0 244 179;
    --color-ask: 255 180 171;
    --shadow-widget: 0 12px 24px -12px rgb(10 12 16 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.05);
    --shadow-mill: inset 0 1px 0 rgb(255 255 255 / 0.2), 0 4px 12px rgb(26 92 255 / 0.28);
    --shadow-mill-hover: inset 0 1px 0 rgb(255 255 255 / 0.3), 0 6px 16px rgb(26 92 255 / 0.4);
    --field-inset: inset 0 2px 4px rgb(0 0 0 / 0.45), 0 1px 0 rgb(255 255 255 / 0.04);
  }

  html {
    scroll-padding-top: var(--header-height);
    background-color: rgb(var(--color-canvas));
    color: rgb(var(--color-on-surface));
  }

  body {
    @apply min-h-[100dvh] font-sans antialiased;
    background-color: rgb(var(--color-canvas));
    color: rgb(var(--color-on-surface));
  }

  h1,
  h2,
  h3,
  h4 {
    color: rgb(var(--color-on-surface));
  }

  input,
  select,
  textarea,
  button {
    color: inherit;
    color-scheme: dark;
  }

  input::placeholder,
  textarea::placeholder {
    color: rgb(var(--color-outline));
    opacity: 1;
  }

  input[type='checkbox'],
  input[type='radio'] {
    accent-color: rgb(var(--color-primary-container));
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: rgb(var(--color-on-surface));
    caret-color: rgb(var(--color-on-surface));
    box-shadow: 0 0 0 1000px rgb(var(--color-canvas)) inset;
    transition: background-color 99999s ease-out;
  }

  body::selection,
  body *::selection {
    background-color: rgb(var(--color-primary-container) / 0.22);
    color: rgb(var(--color-on-surface));
  }

  option {
    background-color: rgb(var(--color-card));
    color: rgb(var(--color-on-surface));
  }

  :focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgb(var(--color-canvas)), 0 0 0 4px rgb(var(--color-ring));
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 font-body-md text-sm font-medium transition duration-200;
    background-color: rgb(var(--color-primary-container));
    background-image: linear-gradient(to bottom, rgb(var(--color-primary-container)), rgb(var(--color-inverse-primary)));
    color: rgb(var(--color-on-primary-container));
    box-shadow: var(--shadow-mill);
    @apply hover:brightness-[1.04] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50;
  }
  .btn-primary:hover {
    box-shadow: var(--shadow-mill-hover);
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border bg-transparent px-5 py-2.5 font-body-md text-sm transition duration-200;
    border-color: rgb(var(--color-outline-variant) / 0.7);
    color: rgb(var(--color-on-surface));
    @apply active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50;
  }
  .btn-secondary:hover {
    background-color: rgb(var(--color-on-surface) / 0.05);
  }

  .btn-ghost {
    @apply inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition duration-200;
    color: rgb(var(--color-on-surface-variant));
  }
  .btn-ghost:hover {
    background-color: rgb(var(--color-surface-container-high));
    color: rgb(var(--color-on-surface));
  }

  .nav-active {
    background-color: rgb(var(--color-primary-container));
    background-image: linear-gradient(to bottom, rgb(var(--color-primary-container)), rgb(var(--color-inverse-primary)));
    color: rgb(var(--color-on-primary-container));
    box-shadow: var(--shadow-mill);
  }

  .elevation-widget,
  .card {
    background-color: rgb(var(--color-card));
    border: 1px solid rgb(var(--color-outline-variant) / 0.45);
    box-shadow: var(--shadow-widget);
    @apply rounded-xl;
    color: rgb(var(--color-on-surface));
  }

  .elevation-active {
    background-color: rgb(var(--color-card));
    border: 1px solid rgb(var(--color-outline-variant) / 0.55);
    box-shadow: var(--shadow-widget);
  }

  @supports ((-webkit-backdrop-filter: blur(20px)) or (backdrop-filter: blur(20px))) {
    .elevation-active {
      background-color: rgb(var(--color-card) / 0.88);
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .elevation-active {
      background-color: rgb(var(--color-card));
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }

  .field {
    @apply w-full rounded-lg border px-4 py-3 font-data-md text-data-md transition duration-200;
    appearance: none;
    -webkit-appearance: none;
    border-color: rgb(var(--color-outline-variant) / 0.5);
    background-color: rgb(var(--color-canvas));
    color: rgb(var(--color-on-surface));
    box-shadow: var(--field-inset);
  }
  .field::placeholder {
    color: rgb(var(--color-outline));
  }
  select.field {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath stroke='%23C3C5D9' stroke-width='1.5' d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
  }
  select.field option {
    background-color: rgb(var(--color-card));
    color: rgb(var(--color-on-surface));
  }
  input[type='date'].field::-webkit-datetime-edit,
  input[type='date'].field::-webkit-datetime-edit-fields-wrapper,
  input[type='date'].field::-webkit-datetime-edit-text,
  input[type='date'].field::-webkit-datetime-edit-month-field,
  input[type='date'].field::-webkit-datetime-edit-day-field,
  input[type='date'].field::-webkit-datetime-edit-year-field {
    color: rgb(var(--color-on-surface));
  }
  input[type='date'].field::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.7;
    filter: invert(1);
  }
  .field:focus {
    outline: none;
    border-color: rgb(var(--color-primary-container));
    box-shadow: var(--field-inset), 0 0 0 1px rgb(var(--color-primary-container));
  }

  .label {
    @apply mb-1.5 block font-label-caps text-label-caps uppercase;
    color: rgb(var(--color-on-surface-variant));
  }

  .landing-grid {
    background-image:
      linear-gradient(rgb(var(--color-on-surface) / 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--color-on-surface) / 0.05) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 75%);
  }

  .landing-hero-glow {
    background: radial-gradient(
      ellipse at center,
      rgb(var(--color-primary-container) / 0.18) 0%,
      rgb(var(--color-secondary-container) / 0.06) 45%,
      transparent 70%
    );
    filter: blur(60px);
  }

  .landing-gradient-text {
    background-image: linear-gradient(
      135deg,
      rgb(var(--color-primary)) 0%,
      rgb(var(--color-on-primary-container)) 45%,
      rgb(var(--color-secondary-container)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .landing-market-card {
    box-shadow:
      var(--shadow-widget),
      0 0 0 1px rgb(var(--color-primary-container) / 0.08),
      0 24px 48px -24px rgb(var(--color-primary-container) / 0.25);
  }

  .landing-cta-card {
    background-color: rgb(var(--color-card));
  }

  .landing-cta-glow {
    background:
      radial-gradient(ellipse 60% 80% at 0% 100%, rgb(var(--color-primary-container) / 0.12), transparent 55%),
      radial-gradient(ellipse 50% 60% at 100% 0%, rgb(var(--color-secondary-container) / 0.08), transparent 50%);
  }

  .landing-hero-animation {
    z-index: 0;
  }

  .landing-hero-animation-mask {
    background:
      radial-gradient(ellipse 90% 75% at 50% 40%, transparent 15%, rgb(var(--color-canvas) / 0.6) 65%, rgb(var(--color-canvas) / 0.94) 100%),
      linear-gradient(to bottom, rgb(var(--color-canvas) / 0.55) 0%, transparent 28%, transparent 58%, rgb(var(--color-canvas) / 0.8) 100%);
  }

  .landing-ticker-row {
    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  }

  .landing-ticker-track.landing-ticker-forward {
    animation: landing-ticker-left 55s linear infinite;
  }

  .landing-ticker-track.landing-ticker-reverse {
    animation: landing-ticker-right 62s linear infinite;
  }

  .landing-quant-track {
    animation: landing-ticker-left 70s linear infinite;
  }

  .landing-ticker-chip {
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.03);
  }

  .landing-chart-panel {
    animation: landing-chart-float 8s ease-in-out infinite;
  }

  .landing-chart-line {
    stroke-dasharray: 100;
    animation: landing-chart-draw 6s ease-in-out infinite;
  }

  .landing-chart-fill {
    animation: landing-chart-pulse 5s ease-in-out infinite;
  }

  .landing-quant-label {
    animation: landing-quant-fade 6s ease-in-out infinite;
    padding: 0.35rem 0.6rem;
    border-radius: 0.375rem;
    border: 1px solid rgb(var(--color-outline-variant) / 0.15);
    background: rgb(var(--color-card) / 0.2);
  }

  @keyframes landing-ticker-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @keyframes landing-ticker-right {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes landing-chart-draw {
    0%,
    100% {
      stroke-dashoffset: 20;
      opacity: 0.35;
    }
    50% {
      stroke-dashoffset: 0;
      opacity: 0.65;
    }
  }

  @keyframes landing-chart-pulse {
    0%,
    100% {
      opacity: 0.12;
    }
    50% {
      opacity: 0.28;
    }
  }

  @keyframes landing-chart-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  @keyframes landing-quant-fade {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 0.55;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .landing-ticker-track,
    .landing-quant-track {
      animation: none;
    }

    .landing-chart-panel,
    .landing-chart-line,
    .landing-chart-fill,
    .landing-quant-label {
      animation: none;
      opacity: 0.3;
    }
  }
}

@layer utilities {
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgb(var(--color-outline-variant) / 0.8);
  border-radius: 3px;
}

```
