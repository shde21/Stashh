import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { PublicOnly, RequireAuth, RequireRole } from './auth/guards'
import { AppShell } from './components/layout/AppShell'
import { FullPageLoading } from './components/feedback/States'
import { DashboardRedirectPage } from './pages/DashboardRedirectPage'

const FoundationPage = lazy(() => import('./pages/FoundationPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const StartupProfilePage = lazy(() => import('./pages/StartupProfilePage'))
const StartupFundraisingPage = lazy(() => import('./pages/StartupFundraisingPage'))
const StartupInterestsPage = lazy(() => import('./pages/StartupInterestsPage'))

const InvestorDiscoverPage = lazy(() => import('./pages/InvestorDiscoverPage'))
const InvestorWatchlistPage = lazy(() => import('./pages/InvestorWatchlistPage'))
const InvestorPortfolioPage = lazy(() => import('./pages/InvestorPortfolioPage'))

const AdminReviewsPage = lazy(() => import('./pages/AdminReviewsPage'))
const AdminFundraisingPage = lazy(() => import('./pages/AdminFundraisingPage'))
const AdminValuationsPage = lazy(() => import('./pages/AdminValuationsPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoading label="Loading workspace…" />}>
      <Routes>
        <Route path="/" element={<FoundationPage />} />
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardRedirectPage />} />
            <Route path="startup" element={<RequireRole role="STARTUP" />}>
              <Route index element={<DashboardPage role="STARTUP" section="overview" />} />
              <Route path="profile" element={<StartupProfilePage />} />
              <Route path="fundraising" element={<StartupFundraisingPage />} />
              <Route path="interests" element={<StartupInterestsPage />} />
            </Route>
            <Route path="investor" element={<RequireRole role="INVESTOR" />}>
              <Route index element={<DashboardPage role="INVESTOR" section="overview" />} />
              <Route path="discover" element={<InvestorDiscoverPage />} />
              <Route path="watchlist" element={<InvestorWatchlistPage />} />
              <Route path="portfolio" element={<InvestorPortfolioPage />} />
            </Route>
            <Route path="admin" element={<RequireRole role="ADMIN" />}>
              <Route index element={<DashboardPage role="ADMIN" section="overview" />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="fundraising" element={<AdminFundraisingPage />} />
              <Route path="valuations" element={<AdminValuationsPage />} />
              <Route path="users" element={<DashboardPage role="ADMIN" section="users" />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
