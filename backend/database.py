from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class ApplicationStatus(enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    OFFER_MADE = "offer_made"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    COMPLETED = "completed"

class PropertyType(enum.Enum):
    CONDO = "condo"
    HOUSE = "house"
    TOWNHOUSE = "townhouse"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    property_applications = relationship("PropertyApplication", back_populates="user")

class PropertyApplication(Base):
    __tablename__ = "property_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Property Details
    property_type = Column(Enum(PropertyType), nullable=False)
    project_name = Column(String, nullable=True, default="")
    province = Column(String, nullable=True, default="Bangkok")
    property_address = Column(Text, nullable=False)
    property_size_sqm = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    asking_price = Column(Float, nullable=False)
    property_condition = Column(String, nullable=False)
    preferred_timeline = Column(String, nullable=False)
    
    # Application Status
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    offer_amount = Column(Float, nullable=True)
    offer_made_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="property_applications")
    documents = relationship("PropertyDocument", back_populates="application")
    photos = relationship("PropertyPhoto", back_populates="application")

class PropertyDocument(Base):
    __tablename__ = "property_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("property_applications.id"), nullable=False)
    document_name = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # title_deed, land_certificate, etc.
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    application = relationship("PropertyApplication", back_populates="documents")

class PropertyPhoto(Base):
    __tablename__ = "property_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("property_applications.id"), nullable=False)
    photo_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    application = relationship("PropertyApplication", back_populates="photos")

# Database connection - using SQLite for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./ibuyer.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite specific
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()