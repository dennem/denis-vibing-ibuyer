import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const toggleLanguage = () => {
    const currentPath = location.pathname
    const pathSegments = currentPath.split('/').filter(Boolean)
    
    // Remove language prefix if it exists
    if (pathSegments[0] === 'en' || pathSegments[0] === 'th') {
      pathSegments.shift()
    }
    
    const newLang = i18n.language === 'en' ? 'th' : 'en'
    
    // Build new path
    let newPath = ''
    
    // Special handling for landing page
    if (pathSegments.length === 0) {
      // On landing page
      newPath = newLang === 'en' ? '/en' : '/'
    } else {
      // On other pages - always use language prefix
      if (newLang === 'en') {
        newPath = '/en/' + pathSegments.join('/')
      } else {
        // For Thai, use /th prefix for all pages except landing
        newPath = '/th/' + pathSegments.join('/')
      }
    }
    
    // Keep query parameters if any
    if (location.search) {
      newPath += location.search
    }
    
    // Navigate to new path
    navigate(newPath)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-blue-500 rounded transition duration-200"
      title={t('navigation.switchLanguage')}
    >
      <span className="text-lg">
        {i18n.language === 'en' ? '🇹🇭' : '🇺🇸'}
      </span>
      <span className="font-medium">
        {i18n.language === 'en' ? 'ไทย' : 'EN'}
      </span>
    </button>
  )
}

export default LanguageSwitcher