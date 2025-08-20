from sqlalchemy.orm import Session
from database import User, PropertyApplication
from models import UserCreate, PropertyApplicationCreate

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate, hashed_password: str):
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone_number=user.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_property_application(db: Session, application: PropertyApplicationCreate, user_id: int):
    db_application = PropertyApplication(
        user_id=user_id,
        property_type=application.property_type,
        property_address=application.property_address,
        property_size_sqm=application.property_size_sqm,
        bedrooms=application.bedrooms,
        bathrooms=application.bathrooms,
        asking_price=application.asking_price,
        property_condition=application.property_condition,
        preferred_timeline=application.preferred_timeline
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_user_applications(db: Session, user_id: int):
    return db.query(PropertyApplication).filter(PropertyApplication.user_id == user_id).all()

def get_all_applications(db: Session):
    return db.query(PropertyApplication).all()