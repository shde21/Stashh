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
            <Route path="fundraising" element={<DashboardPage role="STARTUP" section="fundraising" />} />
          </Route>
          <Route path="investor" element={<RequireRole role="INVESTOR" />}>
              <Route index element={<DashboardPage role="INVESTOR" section="overview" />} />
              <Route path="discover" element={<InvestorDiscoverPage />} />
            <Route path="portfolio" element={<DashboardPage role="INVESTOR" section="portfolio" />} />
          </Route>
          <Route path="admin" element={<RequireRole role="ADMIN" />}>
              <Route index element={<DashboardPage role="ADMIN" section="overview" />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
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
