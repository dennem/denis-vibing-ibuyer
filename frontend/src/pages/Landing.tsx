import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AutocompleteInput from '../components/AutocompleteInput'
import LanguageSwitcher from '../components/LanguageSwitcher'

interface ProjectFormData {
  project_name: string
}

const Landing = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [heroProjectName, setHeroProjectName] = useState('')
  const [finalProjectName, setFinalProjectName] = useState('')
  const [heroError, setHeroError] = useState('')
  const [finalError, setFinalError] = useState('')

  // Separate form controls for hero and final CTA
  const heroForm = useForm<ProjectFormData>()
  const finalForm = useForm<ProjectFormData>()

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    // Navigate to detailed form with project name pre-filled
    navigate('/property-form', { state: { projectName: data.project_name } })
  }

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHeroError('')
    
    if (!heroProjectName.trim()) {
      setHeroError(t('errors.required'))
      return
    }
    
    if (heroProjectName.length < 2) {
      setHeroError(t('errors.projectTooShort'))
      return
    }
    
    setIsSubmitting(true)
    const langPrefix = i18n.language === 'en' ? '/en' : ''
    navigate(`${langPrefix}/property-form`, { state: { projectName: heroProjectName } })
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFinalError('')
    
    if (!finalProjectName.trim()) {
      setFinalError(t('errors.required'))
      return
    }
    
    if (finalProjectName.length < 2) {
      setFinalError(t('errors.projectTooShort'))
      return
    }
    
    setIsSubmitting(true)
    const langPrefix = i18n.language === 'en' ? '/en' : ''
    navigate(`${langPrefix}/property-form`, { state: { projectName: finalProjectName } })
  }

  return (
    <div className="w-full">
      {/* Language Switcher - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-blue-600 rounded-lg shadow-lg">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-50 py-24 sm:py-32 w-full">
        <div className="max-w-4xl mx-auto text-center px-6">
            {/* Question */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('landing.hero.question')}
            </h1>
            
            {/* Answer */}
            <p className="text-xl md:text-2xl text-gray-700 mb-12 font-normal">
              {t('landing.hero.answer')}
            </p>
            
            {/* Input Form */}
            <form onSubmit={handleHeroSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 p-3 bg-white rounded-2xl shadow-xl">
                <div className="flex-1">
                  <AutocompleteInput
                    value={heroProjectName}
                    onChange={setHeroProjectName}
                    placeholder={t('landing.hero.placeholder')}
                    className="w-full px-6 py-4 text-lg bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('landing.hero.processing') : t('landing.hero.cta')}
                </button>
              </div>
              {heroError && (
                <p className="text-red-600 text-sm mt-2">{heroError}</p>
              )}
            </form>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-500">
                {'★'.repeat(5)}
              </div>
              <span className="text-gray-900 font-semibold">5.0</span>
              <span className="text-gray-600">({t('landing.trust.reviews')})</span>
            </div>
            <div className="text-gray-300">
              {t('landing.trust.separator')}
            </div>
            <div className="text-gray-900 font-semibold">
              {t('landing.trust.satisfied')}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.process.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-xl font-bold text-white">{step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(`landing.process.step${step}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`landing.process.step${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.testimonials.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex text-yellow-500 mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-gray-700 mb-6">
                  "{t(`landing.testimonials.testimonial${testimonial}.text`)}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {t(`landing.testimonials.testimonial${testimonial}.initial`)}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">
                      {t(`landing.testimonials.testimonial${testimonial}.name`)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {t(`landing.testimonials.testimonial${testimonial}.location`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.benefits.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['commissions', 'waiting', 'condition', 'obligation'].map((benefit, index) => (
              <div key={benefit} className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(`landing.benefits.${benefit}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`landing.benefits.${benefit}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {t('landing.finalCta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            {t('landing.finalCta.subtitle')}
          </p>
          
          <form onSubmit={handleFinalSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl">
              <AutocompleteInput
                value={finalProjectName}
                onChange={setFinalProjectName}
                placeholder={t('landing.hero.placeholder')}
                className="flex-1 px-6 py-4 text-lg bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-blue-700 text-white font-semibold text-lg rounded-xl hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('landing.hero.processing') : t('landing.hero.cta')}
              </button>
            </div>
            {finalError && (
              <p className="text-red-500 text-sm mt-2">{finalError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Landing