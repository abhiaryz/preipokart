import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppShell from './components/AppShell';
import PublicLayout, { BrowseLayout } from './components/PublicLayout';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { InactivityGuard } from './components/InactivityGuard';
import { RequireAuth } from './auth';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const ExploreScreener = lazy(() => import('./pages/ExploreScreener'));
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
const RoiCalculator = lazy(() => import('./pages/RoiCalculator'));
const StampDutyCalculator = lazy(() => import('./pages/StampDutyCalculator'));
const ShareBudget = lazy(() => import('./pages/ShareBudget'));
const BreakEven = lazy(() => import('./pages/BreakEven'));
const CapitalGains = lazy(() => import('./pages/CapitalGains'));
const IPOs = lazy(() => import('./pages/IPOs'));
const Contact = lazy(() => import('./pages/Contact'));
const Support = lazy(() => import('./pages/Support'));
const Careers = lazy(() => import('./pages/Careers'));
const Legal = lazy(() => import('./pages/Legal'));
const RaisePage = lazy(() => import('./pages/raise/RaisePage'));
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

          {/* Public Website, Blog & Calculators: NO sidenavbar, homepage effects & public footer */}
          <Route element={<PublicLayout />}>
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="roi-calculator" element={<RoiCalculator />} />
            <Route path="stamp-duty" element={<StampDutyCalculator />} />
            <Route path="share-budget" element={<ShareBudget />} />
            <Route path="break-even" element={<BreakEven />} />
            <Route path="capital-gains" element={<CapitalGains />} />
            <Route path="help" element={<Help />} />
            <Route path="faq" element={<Faq />} />
            <Route path="contact" element={<Contact />} />
            <Route path="careers" element={<Careers />} />
            <Route path="raise/:slug" element={<RaisePage />} />
            <Route path="legal/:slug" element={<Legal />} />
          </Route>

          {/* Directory & Markets: Platform view for logged-in users, public for guests */}
          <Route element={<BrowseLayout />}>
            <Route path="explore" element={<Explore />} />
            <Route path="explore/screener" element={<ExploreScreener />} />
            <Route path="stocks/:id" element={<StockDetail />} />
            <Route path="ipos" element={<IPOs />} />
          </Route>

          {/* Authenticated Workspace with Sidenavbar */}
          <Route element={<AppShell />}>
            <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
            <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="place-order" element={<RequireAuth><PlaceOrder /></RequireAuth>} />
            <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="support" element={<RequireAuth><Support /></RequireAuth>} />
            <Route path="kyc" element={<RequireAuth><Navigate to="/profile?tab=kyc" replace /></RequireAuth>} />
            <Route path="biometric" element={<RequireAuth><Navigate to="/profile" replace /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </Suspense>
      <InactivityGuard />
      <CookieConsentBanner />
    </Router>
  );
}

export default App;
