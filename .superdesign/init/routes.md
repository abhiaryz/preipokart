# Routes

React Router v6 in `src/App.tsx`. Vite SPA. Landing is lazy-loaded.

## Router config (`src/App.tsx`)

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppShell from './components/AppShell';
import { BrowseLayout } from './components/PublicLayout';
import { RequireAuth } from './auth';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'));
const StockDetail = lazy(() => import('./pages/StockDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Help = lazy(() => import('./pages/Help'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Faq = lazy(() => import('./pages/Faq'));
const IPOs = lazy(() => import('./pages/IPOs'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Legal = lazy(() => import('./pages/Legal'));
const Notifications = lazy(() => import('./pages/Notifications'));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant" role="status">
      Loading…
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<BrowseLayout />}>
            <Route path="explore" element={<Explore />} />
            <Route path="stocks/:id" element={<StockDetail />} />
            <Route path="help" element={<Help />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="faq" element={<Faq />} />
            <Route path="ipos" element={<IPOs />} />
            <Route path="contact" element={<Contact />} />
            <Route path="careers" element={<Careers />} />
            <Route path="legal/:slug" element={<Legal />} />
          </Route>
          <Route element={<AppShell />}>
            <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
            <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="place-order" element={<RequireAuth><PlaceOrder /></RequireAuth>} />
            <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="kyc" element={<RequireAuth><Navigate to="/profile?tab=kyc" replace /></RequireAuth>} />
            <Route path="biometric" element={<RequireAuth><Navigate to="/profile" replace /></RequireAuth>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

```

## Route map

| Path | File | Layout | Summary |
|---|---|---|---|
| `/` | `src/pages/Landing.tsx` | None (own header/footer) | Marketing landing: hero + sample request book, trust, how it works, features, companies, FAQ, CTA |
| `/login` | `src/pages/Login.tsx` | AuthSplit | Email/password login |
| `/signup` | `src/pages/Signup.tsx` | AuthSplit | Email/mobile OTP signup |
| `/explore` | `src/pages/Explore.tsx` | BrowseLayout | Company list |
| `/stocks/:id` | `src/pages/StockDetail.tsx` | BrowseLayout | Company detail |
| `/help` | `src/pages/Help.tsx` | BrowseLayout | Help articles |
| `/blog` | `src/pages/Blog.tsx` | BrowseLayout | Blog index |
| `/blog/:slug` | `src/pages/BlogPost.tsx` | BrowseLayout | Blog post |
| `/faq` | `src/pages/Faq.tsx` | BrowseLayout | Full FAQ |
| `/ipos` | `src/pages/IPOs.tsx` | BrowseLayout | IPO calendar |
| `/contact` | `src/pages/Contact.tsx` | BrowseLayout | Contact |
| `/careers` | `src/pages/Careers.tsx` | BrowseLayout | Careers |
| `/legal/:slug` | `src/pages/Legal.tsx` | BrowseLayout | Policy pages |
| `/dashboard` | `src/pages/Dashboard.tsx` | AppShell + auth | Home / request book |
| `/portfolio` | `src/pages/Portfolio.tsx` | AppShell + auth | Holdings |
| `/orders` | `src/pages/Orders.tsx` | AppShell + auth | Order list |
| `/orders/:id` | `src/pages/OrderDetail.tsx` | AppShell + auth | Order detail |
| `/place-order` | `src/pages/PlaceOrder.tsx` | AppShell + auth | Place buy/sell request |
| `/profile` | `src/pages/Profile.tsx` | AppShell + auth | Profile, KYC, nominee, demat |
| `/notifications` | `src/pages/Notifications.tsx` | AppShell + auth | Alerts |
| `/kyc` | redirect | — | → `/profile?tab=kyc` |
| `/biometric` | redirect | — | → `/profile` |
| `*` | redirect | — | → `/` |
