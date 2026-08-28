export interface FinancialYear {
  year: string;
  revenueCr: number;
  ebitdaCr: number;
  patCr: number;
  employees: number;
}

export interface StockDocument {
  title: string;
  type: string;
  date: string;
  href: string;
}

export interface Stock {
  id: string;
  name: string;
  legalName: string;
  ticker: string;
  sector: string;
  change: number;
  price: number;
  impliedVal: string;
  lockup: string;
  series: string;
  domain: string;
  description: string;
  founded: string;
  headquarters: string;
  cin: string;
  website: string;
  employees: string;
  lastFunding: string;
  documents: StockDocument[];
  financials: FinancialYear[];
}

export const stocks: Stock[] = [
  {
    id: 'SWIGGY',
    name: 'Swiggy',
    legalName: 'Swiggy Limited',
    ticker: 'SWIGGY',
    sector: 'Consumer Tech',
    change: 4.2,
    price: 425.5,
    impliedVal: '₹85K Cr',
    lockup: '90-Day Lockup',
    series: 'Pre-IPO • Common',
    domain: 'swiggy.com',
    description:
      'Swiggy is an Indian consumer-tech platform for food delivery, quick commerce, and dining. It operates restaurant delivery, Instamart grocery, and related marketplace services across major Indian cities.',
    founded: '2014',
    headquarters: 'Bengaluru, Karnataka',
    cin: 'U73100KA2013PLC096411',
    website: 'https://www.swiggy.com',
    employees: '6,000+',
    lastFunding: 'Series J',
    documents: [
      { title: 'Draft Red Herring Prospectus', type: 'DRHP', date: 'Apr 2024', href: '#' },
      { title: 'FY24 Annual Financials', type: 'Financials', date: 'Jun 2024', href: '#' },
      { title: 'Shareholder circular', type: 'Notice', date: 'Jan 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 5705, ebitdaCr: -2341, patCr: -3629, employees: 5200 },
      { year: 'FY23', revenueCr: 8264, ebitdaCr: -1988, patCr: -4179, employees: 5600 },
      { year: 'FY24', revenueCr: 11247, ebitdaCr: -412, patCr: -2350, employees: 6100 },
      { year: 'FY25', revenueCr: 14120, ebitdaCr: 186, patCr: -890, employees: 6400 },
    ],
  },
  {
    id: 'RAZORPAY',
    name: 'Razorpay',
    legalName: 'Razorpay Software Private Limited',
    ticker: 'RAZORPAY',
    sector: 'Fintech',
    change: 1.8,
    price: 1250,
    impliedVal: '₹60K Cr',
    lockup: '120-Day Lockup',
    series: 'Series E • Preferred',
    domain: 'razorpay.com',
    description:
      'Razorpay provides payment gateway, banking, and business-finance products for Indian companies. Merchants use it to accept payments, run payroll, and manage current-account style flows.',
    founded: '2014',
    headquarters: 'Bengaluru, Karnataka',
    cin: 'U72200KA2013PTC097389',
    website: 'https://razorpay.com',
    employees: '3,500+',
    lastFunding: 'Series F',
    documents: [
      { title: 'Latest cap table summary', type: 'Cap table', date: 'Dec 2024', href: '#' },
      { title: 'FY24 standalone statements', type: 'Financials', date: 'Sep 2024', href: '#' },
      { title: 'ESOP policy excerpt', type: 'Policy', date: 'Mar 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 1074, ebitdaCr: -312, patCr: -418, employees: 2800 },
      { year: 'FY23', revenueCr: 1548, ebitdaCr: -188, patCr: -265, employees: 3200 },
      { year: 'FY24', revenueCr: 2012, ebitdaCr: 42, patCr: -86, employees: 3450 },
      { year: 'FY25', revenueCr: 2480, ebitdaCr: 210, patCr: 64, employees: 3600 },
    ],
  },
  {
    id: 'PHARMEASY',
    name: 'Pharmeasy',
    legalName: 'API Holdings Limited',
    ticker: 'PHARMEASY',
    sector: 'Health Tech',
    change: -2.1,
    price: 85.2,
    impliedVal: '₹12K Cr',
    lockup: '360-Day Lockup',
    series: 'Series D • Common',
    domain: 'pharmeasy.in',
    description:
      'Pharmeasy (API Holdings) is a digital pharmacy and diagnostics platform. It sells medicines, wellness products, and lab tests through online and offline channels.',
    founded: '2015',
    headquarters: 'Mumbai, Maharashtra',
    cin: 'U85320MH2019PLC325213',
    website: 'https://pharmeasy.in',
    employees: '4,200+',
    lastFunding: 'Series E',
    documents: [
      { title: 'API Holdings financials FY24', type: 'Financials', date: 'Aug 2024', href: '#' },
      { title: 'Related-party note pack', type: 'Disclosure', date: 'Nov 2024', href: '#' },
      { title: 'Lab network overview', type: 'Factsheet', date: 'Feb 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 4560, ebitdaCr: -1890, patCr: -4120, employees: 5100 },
      { year: 'FY23', revenueCr: 5120, ebitdaCr: -980, patCr: -2180, employees: 4600 },
      { year: 'FY24', revenueCr: 5488, ebitdaCr: -410, patCr: -1320, employees: 4300 },
      { year: 'FY25', revenueCr: 5920, ebitdaCr: -95, patCr: -640, employees: 4200 },
    ],
  },
  {
    id: 'OLA_ELECTRIC',
    name: 'Ola Electric',
    legalName: 'Ola Electric Mobility Limited',
    ticker: 'OLA',
    sector: 'EV Mobility',
    change: 8.5,
    price: 145.8,
    impliedVal: '₹48K Cr',
    lockup: 'No Lockup',
    series: 'Listed • Active desk',
    domain: 'olaelectric.com',
    description:
      'Ola Electric designs and sells electric scooters and related charging and software services in India. The Futurefactory in Tamil Nadu is its primary manufacturing base.',
    founded: '2017',
    headquarters: 'Bengaluru, Karnataka',
    cin: 'U74999KA2017PLC099619',
    website: 'https://olaelectric.com',
    employees: '5,800+',
    lastFunding: 'IPO / listed',
    documents: [
      { title: 'Prospectus', type: 'IPO', date: 'Aug 2024', href: '#' },
      { title: 'Q3 production update', type: 'Update', date: 'Jan 2025', href: '#' },
      { title: 'Annual report FY25', type: 'Annual report', date: 'Jul 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 373, ebitdaCr: -784, patCr: -831, employees: 2100 },
      { year: 'FY23', revenueCr: 2631, ebitdaCr: -1288, patCr: -1472, employees: 4200 },
      { year: 'FY24', revenueCr: 5010, ebitdaCr: -980, patCr: -1584, employees: 5400 },
      { year: 'FY25', revenueCr: 4480, ebitdaCr: -620, patCr: -1120, employees: 5800 },
    ],
  },
  {
    id: 'BYJUS',
    name: "Byju's",
    legalName: 'Think & Learn Private Limited',
    ticker: 'BYJUS',
    sector: 'Edtech',
    change: -12.4,
    price: 12,
    impliedVal: '₹2.4K Cr',
    lockup: '360-Day Lockup',
    series: 'Series F • Common',
    domain: 'byjus.com',
    description:
      "Byju's is an Indian education-technology company offering K-12 and test-prep content through apps and classroom programmes. Trading in unlisted shares is thin and prices can move sharply.",
    founded: '2011',
    headquarters: 'Bengaluru, Karnataka',
    cin: 'U80301KA2011PTC061219',
    website: 'https://byjus.com',
    employees: '8,000+',
    lastFunding: 'Restructured',
    documents: [
      { title: 'FY23 delayed financials', type: 'Financials', date: 'Oct 2024', href: '#' },
      { title: 'NCLT / insolvency status note', type: 'Legal', date: 'Mar 2025', href: '#' },
      { title: 'Brand licensing summary', type: 'Disclosure', date: 'Jun 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 2843, ebitdaCr: -4588, patCr: -4588, employees: 24000 },
      { year: 'FY23', revenueCr: 2246, ebitdaCr: -5120, patCr: -8486, employees: 16000 },
      { year: 'FY24', revenueCr: 980, ebitdaCr: -2100, patCr: -3200, employees: 9000 },
      { year: 'FY25', revenueCr: 620, ebitdaCr: -840, patCr: -1100, employees: 8000 },
    ],
  },
  {
    id: 'RELIANCE_RETAIL',
    name: 'Reliance Retail',
    legalName: 'Reliance Retail Ventures Limited',
    ticker: 'RRVL',
    sector: 'Retail',
    change: 0.8,
    price: 3150,
    impliedVal: '₹8.5L Cr',
    lockup: '180-Day Lockup',
    series: 'Unlisted • Common',
    domain: 'relianceretail.com',
    description:
      'Reliance Retail is India’s largest retailer by revenue, spanning grocery, fashion, consumer electronics, and wholesale. Unlisted RRVL shares trade in the pre-IPO market at a premium to listed peers.',
    founded: '2006',
    headquarters: 'Mumbai, Maharashtra',
    cin: 'U52390MH2006PLC161319',
    website: 'https://relianceretail.com',
    employees: '250,000+',
    lastFunding: 'Strategic / PE',
    documents: [
      { title: 'RRVL FY25 results note', type: 'Financials', date: 'Apr 2025', href: '#' },
      { title: 'Store network factsheet', type: 'Factsheet', date: 'Dec 2024', href: '#' },
      { title: 'Related-party transactions', type: 'Disclosure', date: 'May 2025', href: '#' },
    ],
    financials: [
      { year: 'FY22', revenueCr: 199714, ebitdaCr: 9984, patCr: 4247, employees: 180000 },
      { year: 'FY23', revenueCr: 260964, ebitdaCr: 16621, patCr: 9373, employees: 210000 },
      { year: 'FY24', revenueCr: 306800, ebitdaCr: 19840, patCr: 10480, employees: 235000 },
      { year: 'FY25', revenueCr: 331200, ebitdaCr: 22410, patCr: 11890, employees: 250000 },
    ],
  },
  {
    id: 'STRIP',
    name: 'Stripe',
    legalName: 'Stripe, Inc.',
    ticker: 'STRIP',
    sector: 'Fintech',
    change: 2.4,
    price: 65.4,
    impliedVal: '$65B',
    lockup: '180-Day Lockup',
    series: 'Series I • Preferred',
    domain: 'stripe.com',
    description:
      'Stripe is a global payments infrastructure company. It provides APIs for online checkout, billing, treasury, and fraud tools used by internet businesses worldwide.',
    founded: '2010',
    headquarters: 'South San Francisco, USA',
    cin: 'N/A (Delaware C-Corp)',
    website: 'https://stripe.com',
    employees: '8,000+',
    lastFunding: 'Series I',
    documents: [
      { title: 'Series I term-sheet summary', type: 'Funding', date: 'Mar 2023', href: '#' },
      { title: 'Transfer-agent instructions', type: 'Transfer', date: 'Nov 2024', href: '#' },
      { title: 'Risk factors excerpt', type: 'Disclosure', date: 'Jan 2025', href: '#' },
    ],
    financials: [
      { year: '2022', revenueCr: 120000, ebitdaCr: 18000, patCr: 9200, employees: 7000 },
      { year: '2023', revenueCr: 142000, ebitdaCr: 24000, patCr: 12800, employees: 7500 },
      { year: '2024', revenueCr: 168000, ebitdaCr: 31000, patCr: 17600, employees: 8000 },
      { year: '2025', revenueCr: 191000, ebitdaCr: 38000, patCr: 22100, employees: 8400 },
    ],
  },
];

export const stockById: Record<string, Stock> = Object.fromEntries(stocks.map((s) => [s.id, s]));

export const exploreSectors = ['All', ...Array.from(new Set(stocks.filter((s) => s.id !== 'STRIP').map((s) => s.sector)))];

export function getStock(id: string | undefined): Stock | undefined {
  if (!id) return undefined;
  return stockById[id];
}

export function logoUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}
