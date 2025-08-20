import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import AutocompleteInput from '../components/AutocompleteInput'
import { API_ENDPOINTS } from '../config/api'

interface PropertyFormData {
  // User info (for auto-registration)
  full_name: string
  email: string
  phone_number: string
  // Property details
  property_type: 'condo' | 'house' | 'townhouse'
  project_name: string
  province: string
  property_address: string
  property_size_sqm: number
  bedrooms: number
  bathrooms: number
  asking_price: number
  property_condition: string
  preferred_timeline: string
}

const PropertyForm = () => {
  const { user, setAuthData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectNameError, setProjectNameError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PropertyFormData>()

  // Pre-fill project name if coming from landing page
  useEffect(() => {
    if (location.state?.projectName) {
      setProjectName(location.state.projectName)
      setValue('project_name', location.state.projectName)
    }
  }, [location.state, setValue])

  const onSubmit = async (data: PropertyFormData) => {
    // Clear any previous errors
    setProjectNameError('')
    
    // Validate project name
    if (!projectName.trim()) {
      setProjectNameError(t('errors.required'))
      return
    }
    
    // Use the autocomplete state value instead of form value
    const submissionData = { ...data, project_name: projectName }
    console.log('Form submitted with data:', submissionData)
    setIsSubmitting(true)
    try {
      console.log('Sending request to:', API_ENDPOINTS.SUBMIT_PROPERTY)
      // Submit to new endpoint that handles auto-registration
      const response = await axios.post(API_ENDPOINTS.SUBMIT_PROPERTY, submissionData)
      console.log('Response received:', response.data)
      const { access_token, user: newUser } = response.data
      
      // Auto-login the user
      if (access_token && newUser) {
        setAuthData(access_token, newUser)
      }
      
      setSubmitSuccess(true)
      reset()
      setTimeout(() => {
        // Navigate to language-prefixed dashboard
        const isEnglishPath = location.pathname.startsWith('/en')
        const dashboardPath = isEnglishPath ? '/en/dashboard' : '/th/dashboard'
        navigate(dashboardPath)
      }, 2000)
    } catch (error: any) {
      console.error('Failed to submit application:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      alert(`Submission failed: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md mx-auto p-8 bg-white border border-green-200 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-6">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('success.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('success.message')}
            </p>
            <p className="text-sm text-gray-500">
              {t('success.redirecting')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('form.title')}
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-800 text-lg">
              {t('form.subtitle')}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('form.personalInfo')}</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.fullName')} {t('form.required')}
                  </label>
                  <input
                    type="text"
                    {...register('full_name', { 
                      required: t('errors.required'),
                      minLength: { value: 2, message: t('errors.nameTooShort') }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('form.placeholders.fullName')}
                  />
                  {errors.full_name && (
                    <p className="text-red-600 text-sm mt-2">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.phoneNumber')} {t('form.required')}
                  </label>
                  <input
                    type="tel"
                    {...register('phone_number', { 
                      required: t('errors.required'),
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: t('errors.invalidPhone')
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('form.placeholders.phoneNumber')}
                  />
                  {errors.phone_number && (
                    <p className="text-red-600 text-sm mt-2">{errors.phone_number.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.email')} {t('form.required')}
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: t('errors.required'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t('errors.invalidEmail')
                    }
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('form.placeholders.email')}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {t('form.emailNote')}
                </p>
              </div>
            </div>

            {/* Property Information Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('form.propertyInfo')}</h3>

              {/* Property Type (Fixed to Condo) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.propertyType')} {t('form.required')}
                </label>
                <input
                  type="text"
                  value={t('form.options.propertyType.condo')}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed"
                />
                <input
                  type="hidden"
                  {...register('property_type', { value: 'condo' })}
                />
              </div>

              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.projectName')} {t('form.required')}
                </label>
                <AutocompleteInput
                  value={projectName}
                  onChange={setProjectName}
                  placeholder={t('form.placeholders.projectName')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {projectNameError && (
                  <p className="text-red-600 text-sm mt-2">{projectNameError}</p>
                )}
              </div>

              {/* Province */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.province')} {t('form.required')}
                </label>
                <select
                  {...register('province', { required: t('errors.required') })}
                  defaultValue="Bangkok"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Popular Provinces */}
                  <option value="Bangkok">{t('form.options.provinces.bangkok')}</option>
                  <option value="Pattaya">{t('form.options.provinces.pattaya')}</option>
                  <option value="Phuket">{t('form.options.provinces.phuket')}</option>
                  <option value="Chiang Mai">{t('form.options.provinces.chiangMai')}</option>
                  <option value="Samui">{t('form.options.provinces.samui')}</option>
                  
                  {/* Separator */}
                  <option disabled>────────────────────</option>
                  
                  {/* Other Provinces */}
                  <option value="Chonburi">{t('form.options.provinces.chonburi')}</option>
                  <option value="Nonthaburi">{t('form.options.provinces.nonthaburi')}</option>
                  <option value="Pathum Thani">{t('form.options.provinces.pathumThani')}</option>
                  {/* Add more provinces as needed */}
                </select>
                {errors.province && (
                  <p className="text-red-600 text-sm mt-2">{errors.province.message}</p>
                )}
              </div>

              {/* Property Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.propertyAddress')} {t('form.required')}
                </label>
                <textarea
                  {...register('property_address', { required: t('errors.required') })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder={t('form.placeholders.address')}
                />
                {errors.property_address && (
                  <p className="text-red-600 text-sm mt-2">{errors.property_address.message}</p>
                )}
              </div>

              {/* Property Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.size')} {t('form.required')}
                  </label>
                  <input
                    type="number"
                    {...register('property_size_sqm', {
                      required: t('errors.required'),
                      min: { value: 1, message: t('errors.mustBePositive') },
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 45"
                  />
                  {errors.property_size_sqm && (
                    <p className="text-red-600 text-sm mt-2">{errors.property_size_sqm.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.askingPrice')} {t('form.required')}
                  </label>
                  <input
                    type="number"
                    {...register('asking_price', {
                      required: t('errors.required'),
                      min: { value: 1, message: t('errors.mustBePositive') },
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('form.placeholders.price')}
                  />
                  {errors.asking_price && (
                    <p className="text-red-600 text-sm mt-2">{errors.asking_price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.bedrooms')} {t('form.required')}
                  </label>
                  <input
                    type="number"
                    {...register('bedrooms', {
                      required: t('errors.required'),
                      min: { value: 0, message: t('errors.mustBePositive') },
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.bedrooms && (
                    <p className="text-red-600 text-sm mt-2">{errors.bedrooms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('form.bathrooms')} {t('form.required')}
                  </label>
                  <input
                    type="number"
                    {...register('bathrooms', {
                      required: t('errors.required'),
                      min: { value: 1, message: t('errors.minBathrooms') },
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.bathrooms && (
                    <p className="text-red-600 text-sm mt-2">{errors.bathrooms.message}</p>
                  )}
                </div>
              </div>

              {/* Property Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.condition')} {t('form.required')}
                </label>
                <select
                  {...register('property_condition', { required: t('errors.required') })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('form.options.condition.select')}</option>
                  <option value="excellent">{t('form.options.condition.excellent')}</option>
                  <option value="good">{t('form.options.condition.good')}</option>
                  <option value="fair">{t('form.options.condition.fair')}</option>
                  <option value="needs_work">{t('form.options.condition.needsWork')}</option>
                </select>
                {errors.property_condition && (
                  <p className="text-red-600 text-sm mt-2">{errors.property_condition.message}</p>
                )}
              </div>

              {/* Preferred Timeline */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('form.timeline')} {t('form.required')}
                </label>
                <select
                  {...register('preferred_timeline', { required: t('errors.required') })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('form.options.timeline.select')}</option>
                  <option value="asap">{t('form.options.timeline.asap')}</option>
                  <option value="1_month">{t('form.options.timeline.oneMonth')}</option>
                  <option value="3_months">{t('form.options.timeline.threeMonths')}</option>
                  <option value="6_months">{t('form.options.timeline.sixMonths')}</option>
                </select>
                {errors.preferred_timeline && (
                  <p className="text-red-600 text-sm mt-2">{errors.preferred_timeline.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? t('form.submitting') : t('form.submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PropertyForm