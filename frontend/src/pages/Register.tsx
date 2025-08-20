import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  phone_number: string
}

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number,
      })
      // Navigate to language-prefixed dashboard
      const isEnglishPath = location.pathname.startsWith('/en')
      const dashboardPath = isEnglishPath ? '/en/dashboard' : '/th/dashboard'
      navigate(dashboardPath)
    } catch (err) {
      setError(t('errors.registrationFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {t('auth.registerTitle')}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fullName')}
            </label>
            <input
              id="full_name"
              type="text"
              {...register('full_name', {
                required: t('errors.required'),
                minLength: {
                  value: 2,
                  message: t('errors.nameTooShort'),
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.placeholders.fullName')}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

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
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.phoneNumber')}
            </label>
            <input
              id="phone_number"
              type="tel"
              {...register('phone_number', {
                required: t('errors.required'),
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: t('errors.invalidPhone'),
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.placeholders.phoneNumber')}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: t('errors.required'),
                validate: (value) =>
                  value === password || t('errors.passwordsDontMatch'),
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
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
            {isLoading ? t('auth.creatingAccount') : t('auth.registerButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.haveAccount')}{' '}
            <Link to={location.pathname.startsWith('/en') ? '/en/login' : '/th/login'} className="text-blue-600 hover:text-blue-500 font-medium">
              {t('auth.loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register