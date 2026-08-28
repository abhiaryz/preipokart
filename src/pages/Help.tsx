import { Link } from 'react-router-dom';
import { PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import { useApi } from '../hooks/useApi';

export default function Help() {
  const { data, error, loading } = useApi(() => api.listHelp(), []);
  const faqs = data?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Help"
        description="Simple answers about buying and selling pre-IPO shares on PreIPOKart."
      />
      <QueryStatus loading={loading} error={error}>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.id} className="card p-4">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-on-surface-variant">{item.a}</p>
            </details>
          ))}
        </div>
      </QueryStatus>
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
