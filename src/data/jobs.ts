export const teams = [
  { id: 'all', label: 'All teams' },
  { id: 'desk', label: 'Desk' },
  { id: 'product', label: 'Product' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'trust', label: 'Trust' },
] as const;

export type JobTeam = Exclude<(typeof teams)[number]['id'], 'all'>;

export type Job = {
  id: string;
  title: string;
  team: JobTeam;
  location: string;
  type: 'Full-time' | 'Contract';
  posted: string;
  summary: string;
  work: string[];
};

export const jobs: Job[] = [
  {
    id: 'matching-ops',
    title: 'Matching desk associate',
    team: 'desk',
    location: 'Bengaluru',
    type: 'Full-time',
    posted: '12 Aug 2026',
    summary: 'Sit with buy and sell requests, keep the book honest, and tell both sides when a match is real.',
    work: [
      'Review open requests and flag stale or incomplete orders.',
      'Call investors when a match is close and money is about to be held.',
      'Keep a written trail so compliance can reconstruct any deal.',
    ],
  },
  {
    id: 'kyc-officer',
    title: 'KYC and onboarding officer',
    team: 'trust',
    location: 'Bengaluru',
    type: 'Full-time',
    posted: '8 Aug 2026',
    summary: 'Check PAN, Aadhaar, and demat details before someone can place a larger order.',
    work: [
      'Review KYC packs against Indian verification rules.',
      'Ask for missing documents without jargon.',
      'Escalate mismatches to the trust lead, not to the matching desk.',
    ],
  },
  {
    id: 'product-lead',
    title: 'Product lead, request book',
    team: 'product',
    location: 'Bengaluru',
    type: 'Full-time',
    posted: '4 Aug 2026',
    summary: 'Own Home, Companies, and Orders. Make the book readable for first-time buyers of unlisted shares.',
    work: [
      'Ship small, testable changes to the request flow.',
      'Sit with the desk weekly and cut features that slow matching.',
      'Write specs that engineering can implement without a second meeting.',
    ],
  },
  {
    id: 'frontend-eng',
    title: 'Frontend engineer',
    team: 'engineering',
    location: 'Bengaluru / remote India',
    type: 'Full-time',
    posted: '1 Aug 2026',
    summary: 'Build the desk UI in React. Numbers stay in JetBrains Mono. Cobalt is for intent, mint is for health.',
    work: [
      'Implement screens from the design tokens, not from one-off hex.',
      'Keep forms, tables, and order status readable on a dark canvas.',
      'Add tests around money, quantity, and cancel paths.',
    ],
  },
  {
    id: 'backend-eng',
    title: 'Backend engineer, settlement',
    team: 'engineering',
    location: 'Bengaluru',
    type: 'Full-time',
    posted: '28 Jul 2026',
    summary: 'Hold funds until both sides complete a deal. Make status boring and correct.',
    work: [
      'Model request, match, hold, and complete as explicit states.',
      'Never move money without a written reason in the log.',
      'Work with CDSL and NSDL connection flows in Profile.',
    ],
  },
  {
    id: 'rel-mgr',
    title: 'Relationship manager, advisor desk',
    team: 'desk',
    location: 'Mumbai / Bengaluru',
    type: 'Contract',
    posted: '22 Jul 2026',
    summary: 'Help family offices place bulk requests and report what settled.',
    work: [
      'Take named-client orders without promising a fill.',
      'Send settlement reports the same day a deal completes.',
      'Escalate illiquid names early so nobody waits in the dark.',
    ],
  },
];

export const careersEmail = 'careers@preipokart.in';
