import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';

const faqs = [
  {
    q: 'What is a pre-IPO share?',
    a: 'It is a share in a company that is not yet listed on NSE or BSE. You buy from another investor, not from the company itself.',
  },
  {
    q: 'How do I buy?',
    a: 'Open Companies, pick a name, tap Place a buy or sell, then confirm. Your request appears under Orders. We hold the money until both sides complete the deal.',
  },
  {
    q: 'How do I sell?',
    a: 'Same flow from Companies, but choose Sell. Track, change, or cancel it from Orders while it is still waiting.',
  },
  {
    q: 'Where do I see my bids?',
    a: 'Open Orders. You can filter buy vs sell, search by company, open an order to change price or quantity, or cancel before money is held.',
  },
  {
    q: 'Why do you ask for PAN and Aadhaar?',
    a: 'Indian rules require us to know who is buying and selling. We use this only for verification.',
  },
  {
    q: 'What is a nominee?',
    a: 'A nominee is someone you name in Profile so they can receive your holdings if you cannot. This does not replace a will.',
  },
  {
    q: 'Is this risk-free?',
    a: 'No. Private company prices can go down, and it can take time to find a buyer or seller. Only use money you can afford to keep invested.',
  },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Help"
        description="Simple answers about buying and selling pre-IPO shares on PreIPOKart."
      />
      <div className="space-y-3">
        {faqs.map((item) => (
          <details key={item.q} className="card p-4">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-on-surface-variant">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm text-on-surface-variant">
        Still stuck? Open{' '}
        <Link className="text-primary underline" to="/profile?tab=kyc">
          KYC in your profile
        </Link>{' '}
        or connect{' '}
        <Link className="text-primary underline" to="/profile?tab=demat">
          CDSL / NSDL
        </Link>
        , or add a{' '}
        <Link className="text-primary underline" to="/profile?tab=nominee">
          nominee
        </Link>
        .
      </p>
    </div>
  );
}
