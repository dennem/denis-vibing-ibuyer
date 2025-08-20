import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

interface PropertyFormData {
  // User info (for auto-registration)
  full_name: string
  email: string
  phone_number: string
  // Property details
  property_type: 'condo' | 'house' | 'townhouse'
  province: string
  property_address: string
  property_size_sqm: number
  bedrooms: number
  bathrooms: number
  asking_price: number
  property_condition: string
  preferred_timeline: string
}

const Home = () => {
  const { user, setAuthData } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>()

  const onSubmit = async (data: PropertyFormData) => {
    console.log('Form submitted with data:', data)
    setIsSubmitting(true)
    try {
      console.log('Sending request to:', API_ENDPOINTS.SUBMIT_PROPERTY)
      // Submit to new endpoint that handles auto-registration
      const response = await axios.post(API_ENDPOINTS.SUBMIT_PROPERTY, data)
      console.log('Response received:', response.data)
      const { access_token, user: newUser } = response.data
      
      // Auto-login the user
      if (access_token && newUser) {
        setAuthData(access_token, newUser)
      }
      
      setSubmitSuccess(true)
      reset()
      setTimeout(() => {
        navigate('/dashboard')
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
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            {t('success.title')}
          </h2>
          <p className="text-green-700 mb-4">
            {t('success.message')}
          </p>
          <p className="text-sm text-green-600">
            {t('success.redirecting')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          {t('hero.subtitle')}
        </p>
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">
            {t('hero.howItWorks')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-blue-600 text-2xl font-bold mb-2">1</div>
              <p className="text-sm">{t('hero.step1')}</p>
            </div>
            <div>
              <div className="text-blue-600 text-2xl font-bold mb-2">2</div>
              <p className="text-sm">{t('hero.step2')}</p>
            </div>
            <div>
              <div className="text-blue-600 text-2xl font-bold mb-2">3</div>
              <p className="text-sm">{t('hero.step3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Submission Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('form.title')}
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            {t('form.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('form.personalInfo')}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.fullName')} {t('form.required')}
                </label>
                <input
                  type="text"
                  {...register('full_name', { 
                    required: t('errors.required'),
                    minLength: { value: 2, message: t('errors.nameTooShort') }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('form.placeholders.fullName')}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('form.placeholders.phoneNumber')}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('form.placeholders.email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {t('form.emailNote')}
              </p>
            </div>
          </div>

          {/* Property Information Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('form.propertyInfo')}</h3>
          
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.propertyType')} {t('form.required')}
            </label>
            <input
              type="text"
              value={t('form.options.propertyType.condo')}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <input
              type="hidden"
              {...register('property_type', { value: 'condo' })}
            />
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.province')} {t('form.required')}
            </label>
            <select
              {...register('province', { required: t('errors.required') })}
              defaultValue="Bangkok"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="Amnat Charoen">{t('form.options.provinces.amnatCharoen')}</option>
              <option value="Ang Thong">{t('form.options.provinces.angThong')}</option>
              <option value="Bueng Kan">{t('form.options.provinces.buengKan')}</option>
              <option value="Buri Ram">{t('form.options.provinces.buriRam')}</option>
              <option value="Chachoengsao">{t('form.options.provinces.chachoengsao')}</option>
              <option value="Chai Nat">{t('form.options.provinces.chainat')}</option>
              <option value="Chaiyaphum">{t('form.options.provinces.chaiyaphum')}</option>
              <option value="Chanthaburi">{t('form.options.provinces.chanthaburi')}</option>
              <option value="Chiang Rai">{t('form.options.provinces.chiangRai')}</option>
              <option value="Chonburi">{t('form.options.provinces.chonburi')}</option>
              <option value="Chumphon">{t('form.options.provinces.chumphon')}</option>
              <option value="Kalasin">{t('form.options.provinces.kalasin')}</option>
              <option value="Kamphaeng Phet">{t('form.options.provinces.kamphaengPhet')}</option>
              <option value="Kanchanaburi">{t('form.options.provinces.kanchanaburi')}</option>
              <option value="Khon Kaen">{t('form.options.provinces.khonKaen')}</option>
              <option value="Krabi">{t('form.options.provinces.krabi')}</option>
              <option value="Lampang">{t('form.options.provinces.lampang')}</option>
              <option value="Lamphun">{t('form.options.provinces.lamphun')}</option>
              <option value="Loei">{t('form.options.provinces.loei')}</option>
              <option value="Lopburi">{t('form.options.provinces.lopburi')}</option>
              <option value="Mae Hong Son">{t('form.options.provinces.maeHongSon')}</option>
              <option value="Maha Sarakham">{t('form.options.provinces.mahaSarakham')}</option>
              <option value="Mukdahan">{t('form.options.provinces.mukdahan')}</option>
              <option value="Nakhon Nayok">{t('form.options.provinces.nakhonNayok')}</option>
              <option value="Nakhon Pathom">{t('form.options.provinces.nakhonPathom')}</option>
              <option value="Nakhon Phanom">{t('form.options.provinces.nakhonPhanom')}</option>
              <option value="Nakhon Ratchasima">{t('form.options.provinces.nakhonRatchasima')}</option>
              <option value="Nakhon Sawan">{t('form.options.provinces.nakhonSawan')}</option>
              <option value="Nakhon Si Thammarat">{t('form.options.provinces.nakhonSiThammarat')}</option>
              <option value="Nan">{t('form.options.provinces.nan')}</option>
              <option value="Narathiwat">{t('form.options.provinces.narathiwat')}</option>
              <option value="Nong Bua Lamphu">{t('form.options.provinces.nongBuaLamphu')}</option>
              <option value="Nong Khai">{t('form.options.provinces.nongKhai')}</option>
              <option value="Nonthaburi">{t('form.options.provinces.nonthaburi')}</option>
              <option value="Pathum Thani">{t('form.options.provinces.pathumThani')}</option>
              <option value="Pattani">{t('form.options.provinces.pattani')}</option>
              <option value="Phang Nga">{t('form.options.provinces.phangNga')}</option>
              <option value="Phatthalung">{t('form.options.provinces.phatthalung')}</option>
              <option value="Phayao">{t('form.options.provinces.phayao')}</option>
              <option value="Phetchabun">{t('form.options.provinces.phetchabun')}</option>
              <option value="Phetchaburi">{t('form.options.provinces.phetchaburi')}</option>
              <option value="Phichit">{t('form.options.provinces.phichit')}</option>
              <option value="Phitsanulok">{t('form.options.provinces.phitsanulok')}</option>
              <option value="Phrae">{t('form.options.provinces.phrae')}</option>
              <option value="Prachinburi">{t('form.options.provinces.prachinburi')}</option>
              <option value="Prachuap Khiri Khan">{t('form.options.provinces.prachuapKhiriKhan')}</option>
              <option value="Ranong">{t('form.options.provinces.ranong')}</option>
              <option value="Ratchaburi">{t('form.options.provinces.ratchaburi')}</option>
              <option value="Rayong">{t('form.options.provinces.rayong')}</option>
              <option value="Roi Et">{t('form.options.provinces.roiEt')}</option>
              <option value="Sa Kaeo">{t('form.options.provinces.saKaeo')}</option>
              <option value="Sakon Nakhon">{t('form.options.provinces.sakonNakhon')}</option>
              <option value="Samut Prakan">{t('form.options.provinces.samutPrakan')}</option>
              <option value="Samut Sakhon">{t('form.options.provinces.samutSakhon')}</option>
              <option value="Samut Songkhram">{t('form.options.provinces.samutSongkhram')}</option>
              <option value="Saraburi">{t('form.options.provinces.saraburi')}</option>
              <option value="Satun">{t('form.options.provinces.satun')}</option>
              <option value="Sing Buri">{t('form.options.provinces.singBuri')}</option>
              <option value="Sisaket">{t('form.options.provinces.sisaket')}</option>
              <option value="Songkhla">{t('form.options.provinces.songkhla')}</option>
              <option value="Sukhothai">{t('form.options.provinces.sukhothai')}</option>
              <option value="Suphan Buri">{t('form.options.provinces.suphanBuri')}</option>
              <option value="Surat Thani">{t('form.options.provinces.suratThani')}</option>
              <option value="Surin">{t('form.options.provinces.surin')}</option>
              <option value="Tak">{t('form.options.provinces.tak')}</option>
              <option value="Trang">{t('form.options.provinces.trang')}</option>
              <option value="Trat">{t('form.options.provinces.trat')}</option>
              <option value="Ubon Ratchathani">{t('form.options.provinces.ubonRatchathani')}</option>
              <option value="Udon Thani">{t('form.options.provinces.udonThani')}</option>
              <option value="Uthai Thani">{t('form.options.provinces.uthaiThani')}</option>
              <option value="Uttaradit">{t('form.options.provinces.uttaradit')}</option>
              <option value="Yala">{t('form.options.provinces.yala')}</option>
              <option value="Yasothon">{t('form.options.provinces.yasothon')}</option>
            </select>
            {errors.province && (
              <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
            )}
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.propertyAddress')} {t('form.required')}
            </label>
            <textarea
              {...register('property_address', { required: t('errors.required') })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.placeholders.address')}
            />
            {errors.property_address && (
              <p className="text-red-500 text-sm mt-1">{errors.property_address.message}</p>
            )}
          </div>

          {/* Property Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.size')} {t('form.required')}
              </label>
              <input
                type="number"
                {...register('property_size_sqm', {
                  required: t('errors.required'),
                  min: { value: 1, message: t('errors.mustBePositive') },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              {errors.property_size_sqm && (
                <p className="text-red-500 text-sm mt-1">{errors.property_size_sqm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.askingPrice')} {t('form.required')}
              </label>
              <input
                type="number"
                {...register('asking_price', {
                  required: t('errors.required'),
                  min: { value: 1, message: t('errors.mustBePositive') },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('form.placeholders.price')}
                />
              {errors.asking_price && (
                <p className="text-red-500 text-sm mt-1">{errors.asking_price.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.bedrooms')} {t('form.required')}
              </label>
              <input
                type="number"
                {...register('bedrooms', {
                  required: t('errors.required'),
                  min: { value: 0, message: t('errors.mustBePositive') },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              {errors.bedrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.bathrooms')} {t('form.required')}
              </label>
              <input
                type="number"
                {...register('bathrooms', {
                  required: t('errors.required'),
                  min: { value: 1, message: t('errors.minBathrooms') },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              {errors.bathrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
              )}
            </div>
          </div>

          {/* Property Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.condition')} {t('form.required')}
            </label>
            <select
              {...register('property_condition', { required: t('errors.required') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('form.options.condition.select')}</option>
              <option value="excellent">{t('form.options.condition.excellent')}</option>
              <option value="good">{t('form.options.condition.good')}</option>
              <option value="fair">{t('form.options.condition.fair')}</option>
              <option value="needs_work">{t('form.options.condition.needsWork')}</option>
            </select>
            {errors.property_condition && (
              <p className="text-red-500 text-sm mt-1">{errors.property_condition.message}</p>
            )}
          </div>

          {/* Preferred Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.timeline')} {t('form.required')}
            </label>
            <select
              {...register('preferred_timeline', { required: t('errors.required') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('form.options.timeline.select')}</option>
              <option value="asap">{t('form.options.timeline.asap')}</option>
              <option value="1_month">{t('form.options.timeline.oneMonth')}</option>
              <option value="3_months">{t('form.options.timeline.threeMonths')}</option>
              <option value="6_months">{t('form.options.timeline.sixMonths')}</option>
            </select>
            {errors.preferred_timeline && (
              <p className="text-red-500 text-sm mt-1">{errors.preferred_timeline.message}</p>
            )}
          </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-medium transition duration-200 ${
                !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-400 text-gray-100 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Home