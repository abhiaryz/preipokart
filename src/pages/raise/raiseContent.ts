export const raisePages = [
  {
    slug: 'pre-ipo-fundraising',
    label: 'Pre-IPO fundraising',
    eyebrow: 'Raise capital',
    title: 'Pre-IPO fundraising',
    summary:
      'Connect with verified buyers looking for unlisted equity. Share your raise story, target size, and timeline — we introduce matched interest from the book.',
    points: [
      'Reach investors already researching private companies on PreIPOKart',
      'Share raise size, share class, and preferred lockup terms',
      'Stay in control — introductions only after you review interest',
      'Escrow-ready settlement path when a match is ready to proceed',
    ],
    ctaLabel: 'Start a raise conversation',
    formTitle: 'Tell us about your raise',
    askLabel: 'What are you raising for?',
    askPlaceholder: 'Round size, share class, timeline, and any constraints…',
    subject: 'Raise · Pre-IPO fundraising',
  },
  {
    slug: 'valuations',
    label: 'Get your valuations',
    eyebrow: 'Pricing insight',
    title: 'Get your valuations',
    summary:
      'Request a directional view of how the secondary book prices names like yours — recent asks, bids, and implied valuation context for careful planning.',
    points: [
      'See how similar unlisted names are quoted on the book',
      'Understand implied valuation ranges buyers discuss today',
      'Useful before a raise, ESOP liquidity, or secondary sale',
      'Not a formal fairness opinion — a market-context brief',
    ],
    ctaLabel: 'Request a valuation brief',
    formTitle: 'Request a valuation brief',
    askLabel: 'What should we look at?',
    askPlaceholder: 'Company stage, last round, revenue band, and why you need a view…',
    subject: 'Raise · Valuation brief',
  },
  {
    slug: 'sme-ipos',
    label: 'SME IPOs',
    eyebrow: 'Listing path',
    title: 'SME IPOs',
    summary:
      'Explore SME IPO readiness — exchange path, documentation cadence, and how secondary interest can sit alongside a future public listing plan.',
    points: [
      'Clarity on SME vs mainboard timing and typical prep steps',
      'Align secondary liquidity with a longer listing roadmap',
      'Introductions to advisors when you are ready for formal work',
      'Track open and upcoming SME issues from our IPOs desk',
    ],
    ctaLabel: 'Talk about an SME IPO path',
    formTitle: 'SME IPO enquiry',
    askLabel: 'Where are you in the journey?',
    askPlaceholder: 'DRHP status, exchange preference, capital need, timeline…',
    subject: 'Raise · SME IPOs',
  },
  {
    slug: 'sell-business',
    label: 'Sell business',
    eyebrow: 'Exit options',
    title: 'Sell your business',
    summary:
      'Exploring a full or partial exit? Share confidential basics and we will outline whether a secondary book process, structured sale, or intro path fits.',
    points: [
      'Confidential first conversation — no public listing of your intent',
      'Partial liquidity for founders or early shareholders',
      'Or a broader process when you are ready for a full exit',
      'We route serious interest; you decide what moves forward',
    ],
    ctaLabel: 'Start a confidential conversation',
    formTitle: 'Confidential exit enquiry',
    askLabel: 'What are you exploring?',
    askPlaceholder: 'Partial vs full exit, timeline, and any constraints we should know…',
    subject: 'Raise · Sell business',
  },
] as const;

export type RaiseSlug = (typeof raisePages)[number]['slug'];

export function getRaisePage(slug: string | undefined) {
  return raisePages.find((page) => page.slug === slug) ?? null;
}

export const raiseNavLinks = raisePages.map(({ slug, label }) => ({
  label,
  to: `/raise/${slug}`,
}));
