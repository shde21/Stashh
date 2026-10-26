import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { PublicOnly, RequireAuth, RequireRole } from './auth/guards'
import { AppShell } from './components/layout/AppShell'
import DashboardPage, { DashboardRedirectPage } from './pages/DashboardPage'
import ForbiddenPage from './pages/ForbiddenPage'
import FoundationPage from './pages/FoundationPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import StartupProfilePage from './pages/StartupProfilePage'
import AdminReviewsPage from './pages/AdminReviewsPage'
import InvestorDiscoverPage from './pages/InvestorDiscoverPage'
import StartupFundraisingPage from './pages/StartupFundraisingPage'
import InvestorPortfolioPage from './pages/InvestorPortfolioPage'
import AdminFundraisingPage from './pages/AdminFundraisingPage'
import AdminValuationsPage from './pages/AdminValuationsPage'
import StartupInterestsPage from './pages/StartupInterestsPage'
import InvestorWatchlistPage from './pages/InvestorWatchlistPage'

function AppRoutes() {
  return (
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
