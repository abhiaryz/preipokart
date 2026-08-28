export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  publishedAt: string;
  publishedTime: string;
  readMinutes: number;
  category: string;
  author: string;
  authorRole: string;
  authorImage: string;
  cover: string;
  inlineImage: string;
  body: string[];
};

export const blogs: BlogPost[] = [
  {
    slug: 'nse-nifty-opens-higher-on-global-cues',
    title: 'Nifty opens higher as global cues lift risk appetite',
    excerpt:
      'Benchmark indices started the week in the green after overnight gains in US futures and a softer dollar.',
    date: '26 Aug 2026',
    publishedAt: '2026-08-26T08:32:00+05:30',
    publishedTime: '8:32 AM IST',
    readMinutes: 4,
    category: 'Markets',
    author: 'Meera Iyer',
    authorRole: 'Markets desk',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80',
    inlineImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    body: [
      'Indian equity benchmarks opened higher on Wednesday as traders chased overnight strength in global futures. Banking and IT led the early tape, while metals lagged after a softer print in industrial metals overnight.',
      'Dealers said cash volumes were healthy in large-caps, with foreign desks adding to financials after last week’s dip. Mid-caps were mixed, a reminder that liquidity still concentrates in names with a clear bid.',
      'For unlisted share investors, listed market tone still matters. When listed peers re-rate, pre-IPO conversations on similar businesses often pick up — though settlement and discovery remain slower than on the exchange.',
    ],
  },
  {
    slug: 'rbi-policy-preview-what-traders-are-watching',
    title: 'RBI policy preview: what traders are watching this week',
    excerpt:
      'The Street is split on the next move. Here is the checklist desks are using into the announcement.',
    date: '24 Aug 2026',
    publishedAt: '2026-08-24T07:15:00+05:30',
    publishedTime: '7:15 AM IST',
    readMinutes: 5,
    category: 'Policy',
    author: 'Arjun Sen',
    authorRole: 'Macro strategy',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    cover: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80',
    inlineImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
    body: [
      'The policy meeting is the main event on this week’s calendar. Consensus is for a hold, but the language on inflation and liquidity is expected to move the rupee and the short end of the curve.',
      'Equity desks are watching two things: guidance on durable inflation and any hint on system liquidity. Banks with large treasury books tend to reprice quickly if the tone is more hawkish than priced.',
      'Private-market activity usually pauses around policy days. If you have a live buy or sell request on PreIPOKart, expect matching to stay quiet until listed markets digest the statement.',
    ],
  },
  {
    slug: 'unlisted-shares-vs-ipo-allotment-dummy-guide',
    title: 'Unlisted shares vs IPO allotment: a practical comparison',
    excerpt:
      'Same company, two very different ways to get exposure. Dummy explainer for first-time buyers.',
    date: '21 Aug 2026',
    publishedAt: '2026-08-21T11:40:00+05:30',
    publishedTime: '11:40 AM IST',
    readMinutes: 6,
    category: 'Education',
    author: 'Nisha Kapoor',
    authorRole: 'Investor education',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    inlineImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    body: [
      'An IPO allotment is a primary issue from the company. Unlisted shares are typically bought from another investor in the secondary market, at a negotiated or last-traded price.',
      'Pricing is the biggest difference. IPOs have a stated band. Unlisted names can gap up or down with little volume, and you may wait to find the other side of the trade.',
      'This article is dummy content for the landing site. Real trades still need KYC, a demat path, and money you can afford to keep locked until a match settles.',
    ],
  },
  {
    slug: 'it-services-pipeline-and-private-valuations',
    title: 'IT services pipeline: listed peers and private valuations',
    excerpt:
      'Deal chatter in private IT names often tracks listed peer multiples with a lag. Here is a dummy snapshot.',
    date: '18 Aug 2026',
    publishedAt: '2026-08-18T16:05:00+05:30',
    publishedTime: '4:05 PM IST',
    readMinutes: 4,
    category: 'Sectors',
    author: 'Rohit Banerjee',
    authorRole: 'Sector notes',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    inlineImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    body: [
      'Listed IT names recovered some of last quarter’s drawdown after better commentary on discretionary spend in the US. That usually feeds into how buyers talk about still-private software and services companies.',
      'In the unlisted book, the lag can be weeks, not hours. A last traded print may sit far from the listed peer move until a fresh match prints.',
      'Dummy takeaway: use listed peers as a compass, not a quote. Always check the latest request book on the company page before you size a bid.',
    ],
  },
  {
    slug: 'fii-flows-and-what-it-means-for-risk-assets',
    title: 'FII flows turn positive: what it means for risk assets',
    excerpt:
      'A dummy round-up of foreign flows, rupee implications, and how that can spill into private-market interest.',
    date: '14 Aug 2026',
    publishedAt: '2026-08-14T09:20:00+05:30',
    publishedTime: '9:20 AM IST',
    readMinutes: 3,
    category: 'Flows',
    author: 'Meera Iyer',
    authorRole: 'Markets desk',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    cover: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1400&q=80',
    inlineImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    body: [
      'Provisional exchange data showed foreign portfolios as net buyers for a third session. The rupee held a tight range, which usually keeps imported inflation fears in check.',
      'When listed risk appetite improves, family offices often re-open conversations on pre-IPO names they paused. That is not a guarantee of higher unlisted prints — it is simply more two-way interest.',
      'Dummy reminder: flows can reverse in a week. Size requests so you can sit through a quiet book without needing an emergency exit.',
    ],
  },
];

export function getBlog(slug: string) {
  return blogs.find((post) => post.slug === slug);
}

export function getLatestBlogs(excludeSlug?: string, limit = 4) {
  return blogs.filter((post) => post.slug !== excludeSlug).slice(0, limit);
}
