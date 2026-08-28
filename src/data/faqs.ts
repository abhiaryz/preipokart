export type FaqCategory = 'getting-started' | 'trading' | 'fees' | 'kyc' | 'risk';

export type FaqItem = {
  id: string;
  category: FaqCategory;
  q: string;
  a: string;
};

export const faqCategories: { id: FaqCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'trading', label: 'Trading' },
  { id: 'fees', label: 'Fees & settlement' },
  { id: 'kyc', label: 'KYC & demat' },
  { id: 'risk', label: 'Risk' },
];

export const faqItems: FaqItem[] = [
  {
    id: 'listed-or-private',
    category: 'getting-started',
    q: 'Are these companies listed on NSE or BSE?',
    a: 'No. PreIPOKart is for shares in companies that are still private. Listing on a public exchange is not guaranteed.',
  },
  {
    id: 'what-is-pre-ipo',
    category: 'getting-started',
    q: 'What is a pre-IPO share?',
    a: 'It is a share in a company that is not yet listed on NSE or BSE. You buy from another investor, not from the company itself.',
  },
  {
    id: 'need-account',
    category: 'getting-started',
    q: 'Do I need an account to browse companies?',
    a: 'You can browse the company list without placing an order. You need an account to send a buy or sell request and to finish KYC.',
  },
  {
    id: 'how-buy',
    category: 'trading',
    q: 'How do I buy?',
    a: 'Open Companies, pick a name, tap Place a buy or sell, then confirm. Your request appears under Orders. We hold the money until both sides complete the deal.',
  },
  {
    id: 'how-sell',
    category: 'trading',
    q: 'How do I sell?',
    a: 'Same flow from Companies, but choose Sell. Track, change, or cancel it from Orders while it is still waiting.',
  },
  {
    id: 'where-bids',
    category: 'trading',
    q: 'Where do I see my bids?',
    a: 'Open Orders. You can filter buy vs sell, search by company, open an order to change price or quantity, or cancel before money is held.',
  },
  {
    id: 'no-match',
    category: 'trading',
    q: 'What if nobody takes the other side?',
    a: 'Your request can sit unmatched. You can cancel it from Place order. Illiquid names often take longer.',
  },
  {
    id: 'when-fee',
    category: 'fees',
    q: 'When do you take the fee?',
    a: 'The Investor plan charges 0.5% only when a buy and sell request actually match. Browsing companies is free.',
  },
  {
    id: 'escrow',
    category: 'fees',
    q: 'Where does my money sit until the deal settles?',
    a: 'Funds stay with us until both sides complete the transfer. You can track status from Home after you log in.',
  },
  {
    id: 'pan-aadhaar',
    category: 'kyc',
    q: 'Why do you ask for PAN and Aadhaar?',
    a: 'Indian rules require us to know who is buying and selling. We use this only for verification.',
  },
  {
    id: 'nominee',
    category: 'kyc',
    q: 'What is a nominee?',
    a: 'A nominee is someone you name in Profile so they can receive your holdings if you cannot. This does not replace a will.',
  },
  {
    id: 'demat',
    category: 'kyc',
    q: 'Do I need a demat account?',
    a: 'Yes, to settle unlisted shares you need a demat path (CDSL or NSDL). You can connect this from Profile after you log in.',
  },
  {
    id: 'investment-advice',
    category: 'risk',
    q: 'Is this investment advice?',
    a: 'No. We provide a place to request trades. Do your own research. Unlisted shares can lose value and may be hard to sell.',
  },
  {
    id: 'risk-free',
    category: 'risk',
    q: 'Is this risk-free?',
    a: 'No. Private company prices can go down, and it can take time to find a buyer or seller. Only use money you can afford to keep invested.',
  },
];
