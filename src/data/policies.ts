export type Policy = {
  slug: string;
  title: string;
  updated: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
};

export const policies: Policy[] = [
  {
    slug: 'terms',
    title: 'Terms of use',
    updated: '26 Aug 2026',
    summary:
      'These dummy terms explain how you may use the PreIPOKart request book, what we do not promise, and how accounts, orders, and disputes work in this prototype. They are not a live legal contract.',
    sections: [
      {
        heading: '1. Who we are',
        body: [
          'PreIPOKart is a product demo for a private-market request book in India. The screens you see — companies, orders, escrow status, KYC, and this legal set — are built so a first-time investor can understand the flow before any live licence or bank rails exist.',
          'In these terms, “we”, “us”, and “PreIPOKart” mean the demo operator shown on the Contact page (Bengaluru desk). “You” means the person who opens an account or browses the public site.',
          'Company names, prices, IPO dates, and blog posts are illustrative. They are not an invitation to deal in any particular security.',
        ],
      },
      {
        heading: '2. Agreement to these terms',
        body: [
          'By creating an account, placing a buy or sell request, or continuing to use the site after a posted update, you agree to these Terms of use, the Privacy policy, Cookie policy, Risk disclosure, Disclaimer, Refund and cancellation policy, KYC and AML policy, and Grievance process linked in the footer.',
          'If you do not agree, do not open an account and do not place a request. You may still read public pages such as Companies, IPOs, Blog, and FAQ.',
          'If you use the site for a family office or as an advisor, you still accept these terms personally unless we have a separate dummy advisor-desk arrangement in writing.',
        ],
      },
      {
        heading: '3. Eligibility',
        body: [
          'You must be at least 18 years old and competent to contract under the Indian Contract Act, 1872. Residents of jurisdictions where dealing in unlisted shares is restricted should not use the live product; this demo does not geo-block.',
          'We may ask you to finish KYC (PAN, Aadhaar, photograph, and demat path) before a request can match. Incomplete KYC can leave a request waiting even if another side appears.',
          'You may not open multiple dummy accounts to evade limits, nor use an account for someone else without an approved advisor desk.',
        ],
      },
      {
        heading: '4. What the service is',
        body: [
          'PreIPOKart matches buy and sell requests in unlisted shares. We are not a recognised stock exchange, not a listed-market stock broker, not a merchant banker, and not a guaranteed counterparty to your trade.',
          'A request states a company, side (buy or sell), quantity, and price. Matching in the demo is illustrative. Illiquid names can sit unmatched for a long time. You may cancel a waiting request from Orders as described in Help.',
          'Home may show bids, asks, and recent activity that look live. Those figures are dummy and can pause. They are not a continuous auction or a National Stock Exchange / Bombay Stock Exchange quote.',
        ],
      },
      {
        heading: '5. Your account and security',
        body: [
          'You must give a working email and keep login details private. Activity under your email is treated as yours until you tell us the account was used without permission via Contact us.',
          'The demo stores a login flag in the browser (see Cookie policy). Clearing site data logs you out. Do not share a logged-in device in a public place.',
          'We may suspend or close a dummy account if KYC looks incomplete, a request looks abusive (for example spoofing size you cannot settle), or we are asked to stop by a regulator in a live setting.',
        ],
      },
      {
        heading: '6. Orders, matching, and settlement',
        body: [
          'When you confirm a request, it appears under Orders. You can change price or quantity or cancel while it is still waiting and funds are not matched.',
          'If a match occurs in the demo, status moves toward escrow and settlement. You must be able to deliver shares (sell) or funds (buy) on the path you connected in Profile (CDSL / NSDL dummy fields).',
          'Settlement timelines in a live product would depend on the depository participant, bank, and both parties completing paperwork. This prototype does not move real money or real shares.',
        ],
      },
      {
        heading: '7. Fees',
        body: [
          'Browsing companies, IPOs, blog, FAQ, and Help is free. The Investor plan described on the landing page charges 0.5% only when a buy and sell request actually match in the demo narrative.',
          'Advisor desk pricing is “talk to us” and is not billed in this prototype. There is no annual subscription in the dummy pricing table; monthly and annual totals match because the fee is per matched deal.',
          'Taxes such as GST, STT (if applicable in a live structure), and stamp duty are not calculated here. A live invoice would show them separately.',
        ],
      },
      {
        heading: '8. Acceptable use',
        body: [
          'Do not attempt to interfere with the site, scrape in a way that harms the demo, or post false KYC. Do not use the request book to launder funds or to evade securities law in a live product.',
          'Market abuse concepts (for example placing a request you never intend to settle) can get a dummy account frozen. In a live product that could also be reported where the law requires.',
        ],
      },
      {
        heading: '9. Intellectual property',
        body: [
          'The PreIPOKart name, layout, and copy on this site belong to the demo operator except where third-party marks appear. You may not copy the product UI for a competing live venue without permission.',
          'Company logos are used only to show how a list might look. See the Disclaimer for affiliation language.',
        ],
      },
      {
        heading: '10. Liability and governing law',
        body: [
          'Because this is a prototype with dummy data, we do not accept liability for trading losses, missed matches, or reliance on prices or IPO dates. Read the Risk disclosure and Disclaimer.',
          'These dummy terms are framed under the laws of India. Courts at Bengaluru would be the example venue for a live dispute. That is not a submission to jurisdiction for any real claim arising from this demo.',
        ],
      },
      {
        heading: '11. Changes and contact',
        body: [
          'We may update these terms when the product changes. The “Last updated” date on this page is the revision shown in the demo. Material dummy changes would also be noted in Help where practical.',
          'Questions: use Contact us or hello@preipokart.in (dummy). Complaints: see Grievance redressal.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy policy',
    updated: '26 Aug 2026',
    summary:
      'How the PreIPOKart demo collects, uses, stores, and shares personal data such as email, KYC fields, demat details, and order history. Written in the spirit of the Digital Personal Data Protection Act, 2023 — not a live DPDP notice.',
    sections: [
      {
        heading: '1. Who controls the data',
        body: [
          'For this prototype, PreIPOKart (Bengaluru desk listed on Contact us) is treated as the dummy data fiduciary. There is no separate live data processor agreement because nothing is sent to a production server.',
          'If you write to us, we may keep the message you typed in this session so the form can show a success state. That copy is not emailed to a ticket system in the demo.',
        ],
      },
      {
        heading: '2. Data we collect',
        body: [
          'Account data: email, display name derived from the email, and a logged-in flag in local storage (key preipokart-auth).',
          'Profile and KYC fields you type: name, PAN, Aadhaar-related fields, nominee, bank or UPI dummy fields, and CDSL / NSDL identifiers. In this demo those values stay in the browser unless you clear site data.',
          'Transaction data: company, side, quantity, price, and status of requests you place in Orders.',
          'Usage data: pages opened (Companies, stock detail, IPOs, Blog, FAQ, legal pages) during the session. We do not run a live analytics product in this prototype.',
          'Contact form: name, email, phone, subject, and message you submit on Contact us. The demo only confirms receipt on screen.',
        ],
      },
      {
        heading: '3. Why we use it (purposes)',
        body: [
          'To create and keep your session so Home, Portfolio, Orders, and Profile work after a refresh.',
          'To show KYC status and to block matching in the story until dummy verification is marked complete.',
          'To display your request book, escrow narrative, and email-like status copy in the product.',
          'To answer a Contact us note and to operate grievance steps described in that policy.',
          'We do not sell personal data in this demo. We do not send marketing newsletters from this prototype.',
        ],
      },
      {
        heading: '4. Legal bases (dummy mapping)',
        body: [
          'Consent: you choose to create an account and to type KYC. You can log out and clear storage.',
          'Legitimate use of a demo: keeping the request book usable during a session.',
          'Legal obligation (live product only): a licensed intermediary would retain KYC and trade records for the period Indian AML and securities rules require. This demo does not create those statutory files.',
        ],
      },
      {
        heading: '5. Sharing',
        body: [
          'A live PreIPOKart would share data with KYC / CKYC vendors, banks holding escrow, depository participants, and email or SMS providers, under contracts.',
          'We may need to share with SEBI, stock exchanges, tax authorities, or law enforcement if a live licence required it. This demo does not file those reports.',
          'We do not share dummy KYC with advertisers. Blog images load from third-party image hosts; that is not a sale of your account data.',
        ],
      },
      {
        heading: '6. Retention',
        body: [
          'Session login lasts until you log out or clear the site. Order and profile fields in the demo follow whatever the front-end stores locally.',
          'In a live service we would keep KYC and matched-deal records for at least five years or the longer period applicable AML rules then require, then delete or anonymise them.',
          'Contact form success state is not a long-term ticket archive in this prototype.',
        ],
      },
      {
        heading: '7. Security',
        body: [
          'The demo is a front-end prototype. Do not enter real PAN, Aadhaar, or bank passwords. Use sample text only.',
          'A live build would use encrypted transport, access control for staff, and vendor due diligence. Those controls are not claimed for this marketing site.',
        ],
      },
      {
        heading: '8. Your rights',
        body: [
          'Under a live DPDP-style notice you could request access, correction, erasure (subject to AML hold), and withdrawal of consent for optional processing.',
          'In the demo you can log out, clear site data, and stop using the product. For a dummy access request, use Contact us with the email on the account.',
          'We will not ask for a fee for a reasonable dummy request. We may refuse a request that is repetitive or would break the demo’s ability to show Orders.',
        ],
      },
      {
        heading: '9. Children',
        body: [
          'The service is not directed at anyone under 18. We do not knowingly collect children’s data in the demo. If a parent believes a minor used the site, write to hello@preipokart.in (dummy).',
        ],
      },
      {
        heading: '10. International access',
        body: [
          'The desk example is India. If you open the demo from abroad, data still sits in your browser. A live product would say where servers sit and how cross-border transfer is handled.',
        ],
      },
      {
        heading: '11. Changes and contact',
        body: [
          'We will change the date at the top when this dummy policy is revised. Significant live changes would be emailed or shown at next login.',
          'Privacy questions: Contact us or hello@preipokart.in. Grievance officer example: grievance@preipokart.in (see Grievance redressal).',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie policy',
    updated: '26 Aug 2026',
    summary:
      'What the PreIPOKart demo stores in your browser, why login state is required, and what a live site might add later with a choice banner.',
    sections: [
      {
        heading: '1. What this policy covers',
        body: [
          'This policy describes cookies, local storage, and similar technologies on preipokart pages in this prototype. It should be read with the Privacy policy.',
          'A cookie is a small file a site can save on your device. Local storage is a similar browser store. Both can keep you logged in or remember a setting.',
        ],
      },
      {
        heading: '2. What we store today',
        body: [
          'Login flag: local storage key preipokart-auth holds a dummy email and name after you log in. It is first-party. It is not an advertising identifier.',
          'React Router keeps the page path in the address bar. That is not a tracking cookie.',
          'We do not set a live Google Analytics, Meta Pixel, or Hotjar cookie in this prototype. Session replay tools are not installed.',
        ],
      },
      {
        heading: '3. Strictly necessary',
        body: [
          'Without the login flag, Home, Portfolio, Orders, Profile, and KYC tabs cannot stay signed in after you refresh. That storage is strictly necessary for the logged-in demo.',
          'Security-related flags (for example to stop a double submit on Contact us) may exist only in memory for that visit.',
          'You can block storage in browser settings. The site will then treat you as logged out. Public pages (landing, FAQ, legal, companies list when not forced to login) still work.',
        ],
      },
      {
        heading: '4. Functional preferences',
        body: [
          'A live build might remember “pause live numbers” on Home, language, or a collapsed sidebar. This demo does not persist those as named cookies yet.',
          'If we add them, they would be first-party and described in a table on this page.',
        ],
      },
      {
        heading: '5. Analytics and marketing (not in this demo)',
        body: [
          'A live site might use analytics to see which FAQ topics are opened or whether IPO filters are used. That would load only after you accept optional cookies, except where the law allows a strictly necessary measurement cookie.',
          'We would not use marketing cookies to build a credit or insurance score from your unlisted-share activity in this product story.',
          'This demo has no cookie banner because optional cookies are not present. When they are added, a banner with Accept / Reject / Manage will appear, with Reject as easy as Accept.',
        ],
      },
      {
        heading: '6. Third-party content',
        body: [
          'Blog covers and some company images load from image hosts (for example Unsplash). Those hosts may see your IP address when the image is requested. That is not PreIPOKart selling a list of users.',
          'The Contact page map uses an OpenStreetMap embed. The map provider may set its own cookies when the iframe loads. Use the map only if you accept that third-party context, or skip the map and use the address text.',
        ],
      },
      {
        heading: '7. How long storage lasts',
        body: [
          'The login flag lasts until you log out or clear site data. It is not given a multi-year advertising expiry in this demo.',
          'Live analytics cookies, if added, would typically last 1–13 months depending on the tool and your choice.',
        ],
      },
      {
        heading: '8. How you can control it',
        body: [
          'Log out from the account menu. Clear cookies and site data for this origin in Chrome, Safari, Firefox, or Edge.',
          'Use the browser’s “block third-party cookies” setting if we later embed more third-party frames.',
          'Do not paste real credentials into the demo. Clearing storage is enough to reset the dummy account flag.',
        ],
      },
      {
        heading: '9. Changes',
        body: [
          'When we add a real analytics or chat tool, this page will list the cookie name, purpose, and duration. The updated date at the top will change.',
        ],
      },
    ],
  },
  {
    slug: 'risk-disclosure',
    title: 'Risk disclosure',
    updated: '26 Aug 2026',
    summary:
      'Unlisted and pre-IPO shares can fall in price, stay illiquid, and never list. Read this before you place a dummy buy or sell request. This is not investment advice.',
    sections: [
      {
        heading: '1. Purpose of this disclosure',
        body: [
          'Private-market dealing is different from buying a liquid NSE or BSE stock. This page lists the main risks in plain language so you can decide whether a request is suitable for you.',
          'Nothing here is a recommendation to buy or sell any name on Companies or IPOs. Dummy prices and calendars can be wrong.',
        ],
      },
      {
        heading: '2. Price risk',
        body: [
          'Fair value of a private company is uncertain. There is no continuous public order book. The last traded print on a company page is a dummy figure, not a guaranteed executable quote.',
          'Prices can gap up or down between matches. A peer listed IT or consumer name can re-rate while your unlisted print sits still for weeks.',
          'If the company later lists, the listing price can be below what you paid in the unlisted market. The opposite can also happen. Neither outcome is promised.',
        ],
      },
      {
        heading: '3. Liquidity and exit',
        body: [
          'You may not find a buyer or seller when you want. Requests can sit unmatched. Cancelling a waiting request is possible; forcing an exit is not.',
          'Lot sizes, transfer restrictions in the company’s articles, and right-of-first-refusal clauses (in a live deal) can delay or block a transfer even after a match on our book.',
          'Illiquidity can last years. Treat money in unlisted shares as money you can leave invested.',
        ],
      },
      {
        heading: '4. Listing and IPO risk',
        body: [
          'A company on our list may never file a DRHP, may withdraw an IPO, or may list much later than the dummy IPO calendar suggests. IPO pages on this site are not a SEBI feed.',
          'Allotment in a public issue is a different path from buying unlisted shares from another investor. See the education blog on this site for a dummy comparison — it is still not advice.',
        ],
      },
      {
        heading: '5. Company and information risk',
        body: [
          'Private companies disclose less than listed companies. Financials you see in a live process may be delayed, unaudited, or incomplete. This demo does not attach real filings.',
          'Business model, promoter, regulation, and technology risk sit with the company, not with PreIPOKart. A well-known consumer or fintech brand can still fail.',
        ],
      },
      {
        heading: '6. Counterparty and settlement risk',
        body: [
          'The other side of your request is another investor (or a dummy desk), not the company issuing primary shares (unless a live product later offers that).',
          'Settlement can fail if KYC, demat, or funds are not in place. Escrow in the demo is a story device; a live failure would follow the Refund and operations rules then in force.',
          'We are not a guarantor of the other party’s performance.',
        ],
      },
      {
        heading: '7. Operational, technology, and cyber risk',
        body: [
          'The site can be down, slow, or show stale dummy ticks. Pause-live-numbers on Home exists because moving figures can be hard to follow — they are still not live exchange data.',
          'Phishing and fake “PreIPOKart” pages can exist on the wider internet. Always check the address. We will not ask for your full password by email.',
        ],
      },
      {
        heading: '8. Legal, tax, and regulatory risk',
        body: [
          'Tax on unlisted shares (including holding period and surcharge) depends on your facts. We do not give tax advice. Speak to a chartered accountant.',
          'Rules on private transfers, FEMA (if you are NRI), and intermediary licences can change. A live PreIPOKart would operate only as permitted by its then licence. This demo is not that licence.',
        ],
      },
      {
        heading: '9. Concentration and leverage',
        body: [
          'Putting a large share of net worth in one private name increases the chance of a severe loss. The demo does not stop you from sizing a request too large — that is your decision.',
          'Do not borrow to fund dummy or live unlisted purchases unless you fully understand margin calls and forced selling. This product story does not offer leverage.',
        ],
      },
      {
        heading: '10. Capital at risk and no advice',
        body: [
          'You can lose some or all of the money notionally allocated to a request. Use only surplus funds.',
          'PreIPOKart, its dummy blog, and FAQ are not investment advice, a research report, or a portfolio management service. If you need advice, use a SEBI-registered adviser.',
          'By placing a request in the demo you confirm you have read this disclosure and the Disclaimer.',
        ],
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    updated: '26 Aug 2026',
    summary:
      'Limits on what prices, IPO dates, blogs, company marks, and the PreIPOKart demo itself are allowed to mean. Nothing here is an offer or a recommendation.',
    sections: [
      {
        heading: '1. Nature of the website',
        body: [
          'This website is a marketing and product prototype. It shows how a request book for unlisted shares might look and feel. It is not a live trading venue and not a solicitation to invest.',
          'If a production service launches later, that service will have its own licence status, bank partners, and final legal pages. Until then, treat every number as illustrative.',
        ],
      },
      {
        heading: '2. No offer, no recommendation',
        body: [
          'Nothing on this site is an offer to buy or sell securities, units, or any other instrument, or a prospectus under the Companies Act or SEBI ICDR.',
          'Nothing is a buy, hold, or sell recommendation. Company pages, sample books, and blogs (including dummy Nifty or FII notes) are for layout and education about the product, not for trading.',
        ],
      },
      {
        heading: '3. Accuracy of data',
        body: [
          'Prices, daily change, IPO open/close dates, DRHP status, and “last traded” prints can be delayed, incomplete, rounded, or invented for the demo.',
          'We do not warrant that any figure matches a broker, exchange, or the company’s cap table. Do not place a live trade off this screen.',
        ],
      },
      {
        heading: '4. Third-party names and logos',
        body: [
          'Names such as well-known consumer, fintech, or mobility brands appear so the company list feels realistic. Use of a logo or name does not mean that company has listed stock with us, endorsed PreIPOKart, or authorised a live offer of its shares here.',
          'Trademarks remain with their owners. We will remove a dummy mark on a reasonable request to Contact us.',
        ],
      },
      {
        heading: '5. Third-party links and embeds',
        body: [
          'Blog images, maps, and external articles (if linked) are outside our control. Their privacy practices are their own. We are not responsible for their content or availability.',
        ],
      },
      {
        heading: '6. Professional advice',
        body: [
          'Legal, tax, and investment questions depend on your facts. The FAQ, Help, and legal pages are general dummy copy. They do not create an adviser–client relationship.',
        ],
      },
      {
        heading: '7. No warranty',
        body: [
          'The demo is provided “as is” and “as available”. We disclaim implied warranties of merchantability, fitness for a particular purpose, and non-infringement to the extent Indian law allows for a prototype.',
          'We do not promise uninterrupted access, error-free matching, or that defects will be corrected on a set SLA in this marketing build.',
        ],
      },
      {
        heading: '8. Limitation of liability',
        body: [
          'To the extent permitted by law, PreIPOKart is not liable for loss of profits, data, goodwill, or indirect loss from use of dummy prices, failed demo matches, or reliance on IPO calendars.',
          'Nothing in this disclaimer limits liability that cannot be limited under applicable law, such as fraud in a live service (which this is not).',
        ],
      },
      {
        heading: '9. Forward-looking statements',
        body: [
          'Words such as “may list”, “pipeline”, or “upcoming IPO” on dummy pages are not forecasts. Actual events can differ. Do not treat them as a promise of listing premium.',
        ],
      },
      {
        heading: '10. Updates',
        body: [
          'We may change this disclaimer when the product matures. Continued use of the site after the updated date constitutes acceptance of the dummy text then shown.',
        ],
      },
    ],
  },
  {
    slug: 'refunds',
    title: 'Refund and cancellation',
    updated: '26 Aug 2026',
    summary:
      'When you can cancel a buy or sell request, when the 0.5% match fee applies, how dummy escrow is described, and what a live refund path would look like. No real money moves in this prototype.',
    sections: [
      {
        heading: '1. Scope',
        body: [
          'This policy covers cancellation of unmatched requests, the Investor match fee described on the landing page, and the escrow narrative. It does not cover bank or UPI disputes on a live rail, because those rails are not connected.',
          'Subscription refunds do not apply: there is no recurring card charge in this demo.',
        ],
      },
      {
        heading: '2. Cancelling before a match',
        body: [
          'Open Orders, find the waiting request, and cancel or edit price and quantity while status is still waiting and money is not held in the matched-escrow story.',
          'Cancellation is immediate in the demo UI. A live book might take a few seconds to pull a request if the other side is mid-confirm.',
          'If you navigated away, the request stays until you cancel it. We do not auto-cancel at end of day in this prototype.',
        ],
      },
      {
        heading: '3. After a match',
        body: [
          'Once the demo marks both sides matched, the flow moves to escrow and settlement. You cannot cancel from the same Orders action as a waiting request.',
          'A live operations team might unwind a match only if both parties agree, KYC fails, or settlement cannot complete. That exception process is not self-serve in this build.',
        ],
      },
      {
        heading: '4. Fees',
        body: [
          'Explore / browse: ₹0. No fee to look at companies, sectors, or Help.',
          'Investor plan: 0.5% of the matched notional, charged in the story only when a buy and a sell actually match. If you cancel before match, that 0.5% is not due.',
          'Advisor desk: custom; not invoiced in the demo. There is no “cooling-off” refund of a subscription because none is billed.',
        ],
      },
      {
        heading: '5. Dummy escrow and failed settlement',
        body: [
          'The product copy says funds stay with us until both sides complete. In a live service, escrow would sit with a bank or trustee under a written arrangement.',
          'If settlement fails after match in a live product, money would be released to the payer under the operations playbook (for example KYC mismatch, demat rejection, or timeout). This demo does not calculate partial fills or interest on escrow.',
          'GST invoices, if any, would be issued only in a live billing system.',
        ],
      },
      {
        heading: '6. Chargebacks and mistaken login',
        body: [
          'There is no card processor on this prototype, so there are no chargebacks. If a live card is added later, disputed fees would follow the card network and our then-current billing terms.',
          'If someone used your email on a shared computer, log out and Contact us. Dummy orders can be cancelled while waiting.',
        ],
      },
      {
        heading: '7. How to ask for a dummy refund review',
        body: [
          'Use Contact us. Include registered email, company name, order id from Orders, and whether the request was waiting or matched.',
          'We aim to reply on a Bengaluru working day (see Contact hours). This is not a RBI Ombudsman clock; we are not a live NBFC or bank.',
        ],
      },
      {
        heading: '8. Consumer law',
        body: [
          'A live paid service would comply with applicable Indian consumer protection rules for digital services. This prototype does not take consideration, so statutory refund clocks for paid digital goods are not triggered.',
        ],
      },
    ],
  },
  {
    slug: 'kyc-aml',
    title: 'KYC and AML',
    updated: '26 Aug 2026',
    summary:
      'Why PreIPOKart asks for PAN, Aadhaar, nominee, and demat details, what a live AML programme would check, and your duties. This demo does not call CKYC or watchlist APIs.',
    sections: [
      {
        heading: '1. Why we verify identity',
        body: [
          'Indian anti-money-laundering rules and securities-market practice require intermediaries to know their customer before they complete a transfer of shares or hold client money.',
          'Profile therefore includes PAN, Aadhaar-related fields, photograph placeholders, nominee, and CDSL / NSDL dummy fields so you can see the full journey. Filling them in the demo does not create a verified CKYC record.',
        ],
      },
      {
        heading: '2. Documents and data we may ask for',
        body: [
          'Identity: PAN, Aadhaar or other officially valid document, and a live or uploaded photo in a live build.',
          'Address: as on Aadhaar or a supporting bill, if the live vendor requires it.',
          'Financial: bank account for payouts, and source-of-funds notes for large dummy or live tickets.',
          'Securities: demat account with a depository participant so shares can settle. Nominee so holdings have a named successor on the form — this does not replace a will.',
        ],
      },
      {
        heading: '3. When KYC is required',
        body: [
          'You can browse Companies without KYC. Placing a request that can match, or moving to escrow in the story, expects KYC to be marked complete in Profile.',
          'We may re-ask for KYC if your details change, if a request size is unusual, or if a live periodic refresh is due (for example every few years under then-current PMLA rules).',
        ],
      },
      {
        heading: '4. What a live AML programme would do',
        body: [
          'Screen names against UN, domestic, and vendor watchlists at onboarding and on a schedule.',
          'Look at whether the pattern of requests fits the profile (for example sudden very large sells in a thin name).',
          'File Suspicious Transaction Reports with the Financial Intelligence Unit-India where the law requires, in a live licensed setup only.',
          'This demo performs none of those API checks. Do not treat a green KYC tick in the UI as a government clearance.',
        ],
      },
      {
        heading: '5. Politically exposed persons and nationality',
        body: [
          'A live form would ask if you are a politically exposed person (PEP) or a relative, and would apply extra review. NRIs would see FEMA-related declarations. Those modules are not fully built in this prototype.',
        ],
      },
      {
        heading: '6. Your duties',
        body: [
          'Give true, complete, and updated details. Do not use a third person’s PAN. Do not place requests for another beneficial owner without an approved advisor structure.',
          'Tell us through Contact us if you lose control of your email or if your tax residency changes in a live product.',
          'If we freeze a dummy account because the story around a request does not add up, we may ask for more documents before it reopens.',
        ],
      },
      {
        heading: '7. Record keeping',
        body: [
          'A live intermediary would keep KYC and transaction records for the period required under PMLA and SEBI-style manuals (often five years or more after the relationship ends).',
          'The demo only keeps what your browser stores. Clearing site data deletes the dummy session, not a statutory archive (there is none).',
        ],
      },
      {
        heading: '8. Sharing for compliance',
        body: [
          'Live sharing with CKYC, KRAs, depositories, banks, and authorities is described in the Privacy policy. We will not use KYC photos for marketing in this product story.',
        ],
      },
      {
        heading: '9. Failure to complete KYC',
        body: [
          'Unmatched requests can remain open but matching and payout in the narrative will wait. We may cancel waiting dummy requests after a long inactivity period in a future build; this version does not auto-purge.',
        ],
      },
    ],
  },
  {
    slug: 'grievance',
    title: 'Grievance redressal',
    updated: '26 Aug 2026',
    summary:
      'How to raise a complaint about the PreIPOKart demo desk, what to include, dummy response times, and how a live licensed platform would escalate. This demo is not a SEBI-registered intermediary.',
    sections: [
      {
        heading: '1. What you can complain about',
        body: [
          'Dummy order status, inability to cancel a waiting request, KYC fields, fees shown in the Investor plan copy, blog or IPO data that looks wrong, or access to your session.',
          'Investment losses from unlisted shares are market risk (see Risk disclosure) and are not, by themselves, a service failure of this prototype.',
        ],
      },
      {
        heading: '2. Level 1 — Contact the desk',
        body: [
          'Use the Contact us form or email hello@preipokart.in (dummy). Write from the email on the account if you have one.',
          'Include: full name, registered email, mobile if you gave one, company name, order id from Orders, time of the issue (IST), and what you want us to do (cancel, explain fee, correct KYC, etc.). Attach screenshots.',
          'Office hours (dummy): Monday–Friday 9:30 AM–6:30 PM IST, Saturday 10:00 AM–2:00 PM IST, closed Sunday and market holidays. We aim to acknowledge on the next working day those hours cover.',
        ],
      },
      {
        heading: '3. Level 2 — Grievance officer',
        body: [
          'If you are not satisfied within a dummy 7 working days of acknowledgement, write to grievance@preipokart.in with the Level 1 reference and why the reply was not enough.',
          'Example officer for the prototype: Grievance Officer, PreIPOKart, 3rd Floor, Prestige Atlanta, 80 Feet Road, Koramangala, Bengaluru 560034. Phone: +91 80 4567 2100 (dummy board).',
          'We aim to give a reasoned dummy response within 15 working days of a complete Level 2 email. Complex settlement stories may take longer; we would say so in a live process.',
        ],
      },
      {
        heading: '4. What a live licence would add',
        body: [
          'A SEBI-registered intermediary must display the SEBI scores / SCORES portal, exchange investor service centres, and any ODR (online dispute resolution) link that then applies.',
          'Banks holding escrow would point to the RBI Ombudsman for purely banking failures. PreIPOKart as a demo is none of these. Do not file SCORES against this prototype as if it were a live broker.',
        ],
      },
      {
        heading: '5. Records we may ask for',
        body: [
          'Keep the Orders screen, emails, and KYC upload receipts. We may ask you to re-send PAN (masked) only through the form — never share Aadhaar OTP on a call.',
          'We may refuse to discuss an account with a third party without a dummy authorisation that matches the registered email.',
        ],
      },
      {
        heading: '6. Abusive or repeat complaints',
        body: [
          'We will still log a genuine issue. We may stop corresponding on the same closed dummy ticket if new facts are not added, or if messages are threatening. That does not waive any right you would have against a live licensed entity.',
        ],
      },
      {
        heading: '7. Privacy of complaints',
        body: [
          'Complaint text is personal data. See the Privacy policy. We use it only to handle the grievance and to improve the demo, not for marketing.',
        ],
      },
      {
        heading: '8. Changes',
        body: [
          'When a live entity is incorporated and licensed, this page will name the real officer, CIN, and statutory links. Until then, treat emails and phones as illustrative.',
        ],
      },
    ],
  },
];

export const policyNav = policies.map(({ slug, title }) => ({
  to: `/legal/${slug}`,
  label: title,
}));

export function getPolicy(slug: string | undefined) {
  return policies.find((policy) => policy.slug === slug);
}
