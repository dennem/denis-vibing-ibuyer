from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from database import PropertyType, ApplicationStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PropertyApplicationBase(BaseModel):
    property_type: PropertyType
    project_name: str
    province: Optional[str] = "Bangkok"
    property_address: str
    property_size_sqm: float
    bedrooms: int
    bathrooms: int
    asking_price: float
    property_condition: str
    preferred_timeline: str

class PropertyApplicationCreate(PropertyApplicationBase):
    pass

class PropertyApplicationResponse(PropertyApplicationBase):
    id: int
    user_id: int
    status: ApplicationStatus
    offer_amount: Optional[float]
    offer_made_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PropertyDocumentResponse(BaseModel):
    id: int
    document_name: str
    document_type: str
    file_size: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class PropertyPhotoResponse(BaseModel):
    id: int
    photo_name: str
    file_size: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class PropertySubmissionWithRegistration(BaseModel):
    # User information
    full_name: str
    email: EmailStr
    phone_number: str
    # Property information
    property_type: PropertyType
    project_name: str
    province: str
    property_address: str
    property_size_sqm: float
    bedrooms: int
    bathrooms: int
    asking_price: float
    property_condition: str
    preferred_timeline: str