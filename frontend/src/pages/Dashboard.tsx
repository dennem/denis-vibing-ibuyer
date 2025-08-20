import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

interface PropertyApplication {
  id: number
  property_type: string
  property_address: string
  property_size_sqm: number
  bedrooms: number
  bathrooms: number
  asking_price: number
  property_condition: string
  preferred_timeline: string
  status: string
  offer_amount?: number
  offer_made_at?: string
  created_at: string
  updated_at?: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [applications, setApplications] = useState<PropertyApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MY_APPLICATIONS)
      setApplications(response.data)
    } catch (err) {
      setError(t('dashboard.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      offer_made: 'bg-green-100 text-green-800',
      offer_accepted: 'bg-green-200 text-green-900',
      offer_declined: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    return t(`dashboard.status.${status}`, status)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.welcome', { name: user?.full_name?.split(' ')[0] })}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {t('dashboard.noApplications')}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('dashboard.noApplicationsMessage')}
          </p>
          <a
            href={location.pathname.startsWith('/en') ? '/en' : '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition duration-200"
          >
            {t('dashboard.submitProperty')}
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.yourApplications', { count: applications.length })}
            </h2>
            <a
              href={location.pathname.startsWith('/en') ? '/en' : '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition duration-200"
            >
              {t('dashboard.submitNew')}
            </a>
          </div>

          <div className="grid gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.property_type.charAt(0).toUpperCase() + app.property_type.slice(1)} - 
                        {app.property_size_sqm} sqm
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {app.property_address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('dashboard.submittedOn', { date: formatDate(app.created_at) })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {getStatusText(app.status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{t('form.bedrooms')}</p>
                      <p className="font-medium">{app.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('form.bathrooms')}</p>
                      <p className="font-medium">{app.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('form.condition')}</p>
                      <p className="font-medium capitalize">{app.property_condition.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('form.askingPrice')}</p>
                      <p className="font-medium">{formatPrice(app.asking_price)}</p>
                    </div>
                  </div>

                  {app.offer_amount && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-green-800 font-medium">
                            {t('dashboard.ourOffer')}: {formatPrice(app.offer_amount)}
                          </p>
                          {app.offer_made_at && (
                            <p className="text-green-600 text-sm">
                              {t('dashboard.offeredOn', { date: formatDate(app.offer_made_at) })}
                            </p>
                          )}
                        </div>
                        {app.status === 'offer_made' && (
                          <div className="space-x-2">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-sm font-medium transition duration-200">
                              {t('dashboard.acceptOffer')}
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-sm font-medium transition duration-200">
                              {t('dashboard.declineOffer')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {app.status === 'under_review' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-800 font-medium">
                        🔍 {t('dashboard.reviewingTitle')}
                      </p>
                      <p className="text-yellow-700 text-sm">
                        {t('dashboard.reviewingMessage')}
                      </p>
                    </div>
                  )}

                  {app.status === 'submitted' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-800 font-medium">
                        📝 {t('dashboard.receivedTitle')}
                      </p>
                      <p className="text-blue-700 text-sm">
                        {t('dashboard.receivedMessage')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard