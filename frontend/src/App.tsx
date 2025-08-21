import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
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

// Layout component that wraps language-specific routes
function LanguageLayout() {
  return <Outlet />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LanguageWrapper>
          <Routes>
            {/* Landing page - special case without language prefix for Thai */}
            <Route path="/" element={<Landing />} />
            <Route path="/th" element={<Navigate to="/" replace />} />
            <Route path="/en" element={<Landing />} />
            
            {/* Nested routes for both Thai and English using a language layout */}
            {['th', 'en'].map(lang => (
              <Route key={lang} path={`/${lang}`} element={<LanguageLayout />}>
                <Route path="property-form" element={
                  <div className="min-h-screen">
                    <Header />
                    <PropertyForm />
                  </div>
                } />
                <Route path="login" element={
                  <div className="bg-gray-50 min-h-screen">
                    <Header />
                    <main className="container mx-auto px-4 py-8">
                      <Login />
                    </main>
                  </div>
                } />
                <Route path="register" element={
                  <div className="bg-gray-50 min-h-screen">
                    <Header />
                    <main className="container mx-auto px-4 py-8">
                      <Register />
                    </main>
                  </div>
                } />
                <Route path="dashboard" element={
                  <div className="bg-gray-50 min-h-screen">
                    <Header />
                    <main className="container mx-auto px-4 py-8">
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </main>
                  </div>
                } />
              </Route>
            ))}
          </Routes>
        </LanguageWrapper>
      </Router>
    </AuthProvider>
  )
}

export default App
