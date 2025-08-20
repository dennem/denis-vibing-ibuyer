import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'
import Header from './components/Header'
import Landing from './pages/Landing'
import PropertyForm from './pages/PropertyForm'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Language wrapper component to handle language from URL
function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const location = useLocation()
  
  useEffect(() => {
    // Extract language from URL
    const pathSegments = location.pathname.split('/')
    const firstSegment = pathSegments[1]
    
    // Check if it's a language prefix
    if (firstSegment === 'en') {
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en')
      }
    } else if (firstSegment === 'th' || !firstSegment || firstSegment === '') {
      // Default to Thai for root path or /th
      if (i18n.language !== 'th') {
        i18n.changeLanguage('th')
      }
    }
  }, [location.pathname, i18n])
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LanguageWrapper>
          <Routes>
            {/* Thai routes (default) */}
            <Route path="/" element={<Landing />} />
            <Route path="/th" element={<Navigate to="/" replace />} />
            
            {/* English routes */}
            <Route path="/en" element={<Landing />} />
            
            {/* Thai pages with header */}
            <Route path="/property-form" element={
              <div className="min-h-screen">
                <Header />
                <PropertyForm />
              </div>
            } />
            <Route path="/th/property-form" element={<Navigate to="/property-form" replace />} />
            
            {/* English pages with header */}
            <Route path="/en/property-form" element={
              <div className="min-h-screen">
                <Header />
                <PropertyForm />
              </div>
            } />
            
            {/* Login routes */}
            <Route path="/login" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <Login />
                </main>
              </div>
            } />
            <Route path="/th/login" element={<Navigate to="/login" replace />} />
            <Route path="/en/login" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <Login />
                </main>
              </div>
            } />
            
            {/* Register routes */}
            <Route path="/register" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <Register />
                </main>
              </div>
            } />
            <Route path="/th/register" element={<Navigate to="/register" replace />} />
            <Route path="/en/register" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <Register />
                </main>
              </div>
            } />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </main>
              </div>
            } />
            <Route path="/th/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/en/dashboard" element={
              <div className="bg-gray-50 min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </main>
              </div>
            } />
          </Routes>
        </LanguageWrapper>
      </Router>
    </AuthProvider>
  )
}

export default App
