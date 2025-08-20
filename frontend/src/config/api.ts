// API Configuration
// In production, use relative URLs since frontend and backend are on same domain
// In development, use localhost:8000
const isProduction = import.meta.env.PROD;
export const API_BASE_URL = isProduction 
  ? '' // Use relative URLs in production
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  ME: `${API_BASE_URL}/me`,
  
  // Property
  SUBMIT_PROPERTY: `${API_BASE_URL}/submit-property-with-registration`,
  MY_APPLICATIONS: `${API_BASE_URL}/my-applications`,
  PROPERTY_APPLICATION: `${API_BASE_URL}/property-application`,
  
  // Uploads
  UPLOAD_PHOTOS: (id: number) => `${API_BASE_URL}/upload-photos/${id}`,
  UPLOAD_DOCUMENTS: (id: number) => `${API_BASE_URL}/upload-documents/${id}`,
};