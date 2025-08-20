import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface LoginFormData {
  email: string
  password: string
}

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      await login(data.email, data.password)
      // Navigate to language-prefixed dashboard
      const isEnglishPath = location.pathname.startsWith('/en')
      const dashboardPath = isEnglishPath ? '/en/dashboard' : '/th/dashboard'
      navigate(dashboardPath)
    } catch (err) {
      setError(t('errors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {t('auth.loginTitle')}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: t('errors.required'),
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: t('errors.invalidEmail'),
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.placeholders.email')}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: t('errors.required'),
                minLength: {
                  value: 6,
                  message: t('errors.passwordTooShort'),
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.password')}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-xl font-medium transition duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to={location.pathname.startsWith('/en') ? '/en/register' : '/th/register'} className="text-blue-600 hover:text-blue-500 font-medium">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login