import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Farms from './pages/Farms'
import FarmDetail from './pages/FarmDetail'
import CarbonCredits from './pages/CarbonCredits'
import Verification from './pages/Verification'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="farms" element={<Farms />} />
              <Route path="farms/:id" element={<FarmDetail />} />
              <Route path="carbon-credits" element={<CarbonCredits />} />
              <Route path="verification" element={<Verification />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App