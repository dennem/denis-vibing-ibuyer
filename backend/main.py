from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uvicorn

from database import get_db, Base, engine
from models import PropertyApplicationCreate, PropertyApplicationResponse, UserCreate, UserResponse, PropertySubmissionWithRegistration
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from crud import create_user, get_user_by_email, create_property_application, get_user_applications
from config import settings
import secrets
import string

# Import Celery task
from tasks.email import send_property_submission_email

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS middleware
# In production with monolithic deployment, CORS isn't needed for same-origin requests
# But we'll keep it configured for any external access
allowed_origins = [settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
if settings.is_production:
    # Add production URL
    allowed_origins.append("https://denis-vibing-ibuyer-production.up.railway.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Check if we should serve static files (production mode)
# In Docker, frontend dist is at /app/frontend/dist
STATIC_FILES_PATH = os.environ.get("STATIC_PATH", os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if not os.path.exists(STATIC_FILES_PATH) and os.path.exists("/app/frontend/dist"):
    STATIC_FILES_PATH = "/app/frontend/dist"
# Use explicit environment variable or fallback to production check
SERVE_STATIC = settings.SERVE_FRONTEND or (os.path.exists(STATIC_FILES_PATH) and settings.is_production)

# Debug logging
print(f"STATIC_FILES_PATH: {STATIC_FILES_PATH}")
print(f"Path exists: {os.path.exists(STATIC_FILES_PATH)}")
print(f"SERVE_FRONTEND env: {settings.SERVE_FRONTEND}")
print(f"is_production: {settings.is_production}")
print(f"SERVE_STATIC: {SERVE_STATIC}")

def generate_password(length: int = 12) -> str:
    """Generate a random password"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(characters) for i in range(length))
    return password

def send_welcome_email(email: str, password: str, full_name: str) -> bool:
    """Send welcome email with login details (placeholder for now)"""
    # TODO: Implement actual email sending
    print(f"=== EMAIL TO {email} ===")
    print(f"Subject: Welcome to IBuyer Thailand!")
    print(f"Dear {full_name},")
    print(f"Your account has been created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Login at: http://localhost:5173/login")
    print(f"========================")
    return True

@app.get("/api/health")
def health_check():
    return {"message": "IBuyer API is running"}

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = create_user(db, user, hashed_password)
    return db_user

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request.email)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current authenticated user's information"""
    return current_user

@app.post("/property-application", response_model=PropertyApplicationResponse)
def submit_property_application(
    application: PropertyApplicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_application = create_property_application(db, application, current_user.id)
    return db_application

@app.get("/my-applications", response_model=List[PropertyApplicationResponse])
def get_my_applications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    applications = get_user_applications(db, current_user.id)
    return applications

@app.post("/submit-property-with-registration")
def submit_property_with_registration(
    submission: PropertySubmissionWithRegistration,
    db: Session = Depends(get_db)
):
    """
    Submit a property application and auto-register user if they don't exist
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, email=submission.email)
    
    if existing_user:
        # User exists, just create the property application
        user = existing_user
        # Create access token for existing user
        access_token = create_access_token(data={"sub": user.email})
    else:
        # Create new user with generated password
        generated_password = generate_password()
        hashed_password = get_password_hash(generated_password)
        
        user_data = UserCreate(
            email=submission.email,
            password=generated_password,  # We'll hash this in create_user
            full_name=submission.full_name,
            phone_number=submission.phone_number
        )
        
        user = create_user(db, user_data, hashed_password)
        
        # Email will be sent asynchronously via Celery task
        
        # Create access token for new user
        access_token = create_access_token(data={"sub": user.email})
    
    # Create property application
    property_data = PropertyApplicationCreate(
        property_type=submission.property_type,
        project_name=submission.project_name,
        province=submission.province,
        property_address=submission.property_address,
        property_size_sqm=submission.property_size_sqm,
        bedrooms=submission.bedrooms,
        bathrooms=submission.bathrooms,
        asking_price=submission.asking_price,
        property_condition=submission.property_condition,
        preferred_timeline=submission.preferred_timeline
    )
    
    application = create_property_application(db, property_data, user.id)
    
    # Queue email task (fire and forget, like Sidekiq's perform_async)
    email_data = {
        'email': submission.email,
        'full_name': submission.full_name,
        'property_type': submission.property_type,
        'property_address': submission.property_address,
        'asking_price': submission.asking_price,
        'new_user': existing_user is None,
    }
    
    # Add password only for new users
    if existing_user is None:
        email_data['password'] = generated_password
    
    # Queue the task (won't wait for it to complete)
    send_property_submission_email.delay(email_data)
    
    return {
        "message": "Application submitted successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "application": application,
        "new_account_created": existing_user is None
    }

@app.post("/upload-photos/{application_id}")
async def upload_photos(
    application_id: int,
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement file upload logic
    return {"message": f"Uploaded {len(files)} photos for application {application_id}"}

@app.post("/upload-documents/{application_id}")
async def upload_documents(
    application_id: int,
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement file upload logic
    return {"message": f"Uploaded {len(files)} documents for application {application_id}"}

# Serve static files in production
# IMPORTANT: This must be at the END of the file, after all API routes are defined
if SERVE_STATIC:
    # Mount static assets directory
    if os.path.exists(os.path.join(STATIC_FILES_PATH, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_FILES_PATH, "assets")), name="assets")
    
    # Catch-all route MUST be last - it serves the React app for all unmatched routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes"""
        # Check if it's an API route that should 404
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve index.html for all other routes (React will handle routing)
        index_path = os.path.join(STATIC_FILES_PATH, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            raise HTTPException(status_code=404, detail="Frontend not found")

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)