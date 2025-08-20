import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          IBuyer Thailand
        </Link>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200">
                {t('navigation.dashboard')}
              </Link>
              <span className="text-sm">Welcome back, {user.full_name?.split(' ')[0]}!</span>
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition duration-200"
              >
                {t('navigation.logout')}
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="hover:text-blue-200 transition duration-200"
              >
                {t('navigation.login')}
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition duration-200"
              >
                {t('navigation.register')}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header