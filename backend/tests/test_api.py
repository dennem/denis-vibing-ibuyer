"""
API endpoint tests - TDD style
"""
import pytest


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"message": "IBuyer API is running"}


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_new_user(self, client):
        user_data = {
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User",
            "phone_number": "+66812345678"
        }
        
        response = client.post("/register", json=user_data)
        assert response.status_code == 200
        assert response.json()["email"] == user_data["email"]
        assert response.json()["full_name"] == user_data["full_name"]
    
    def test_register_duplicate_user(self, client, test_user):
        # First registration
        client.post("/register", json=test_user)
        
        # Try to register again with same email
        response = client.post("/register", json=test_user)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_login_valid_credentials(self, client, test_user):
        # Register user first
        client.post("/register", json=test_user)
        
        # Login
        response = client.post("/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client):
        response = client.post("/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpass"
        })
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]


class TestPropertySubmission:
    """Test property submission endpoints"""
    
    def test_submit_property_new_user(self, client):
        submission_data = {
            "email": "seller@example.com",
            "full_name": "Property Seller",
            "phone_number": "+66812345678",
            "property_type": "condo",
            "project_name": "Test Condo",
            "province": "Bangkok",
            "property_address": "123 Test Street",
            "property_size_sqm": 50.0,
            "bedrooms": 2,
            "bathrooms": 1,
            "asking_price": 5000000,
            "property_condition": "excellent",
            "preferred_timeline": "asap"
        }
        
        response = client.post("/submit-property-with-registration", json=submission_data)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Application submitted successfully"
        assert response.json()["new_account_created"] is True
        assert "access_token" in response.json()
    
    def test_submit_property_existing_user(self, client, test_user):
        # Register user first
        client.post("/register", json=test_user)
        
        # Submit property with existing user email
        submission_data = {
            "email": test_user["email"],
            "full_name": test_user["full_name"],
            "phone_number": test_user["phone_number"],
            "property_type": "house",
            "project_name": "",
            "province": "Bangkok",
            "property_address": "456 Test Road",
            "property_size_sqm": 100.0,
            "bedrooms": 3,
            "bathrooms": 2,
            "asking_price": 10000000,
            "property_condition": "good",
            "preferred_timeline": "flexible"
        }
        
        response = client.post("/submit-property-with-registration", json=submission_data)
        
        assert response.status_code == 200
        assert response.json()["new_account_created"] is False
    
    def test_get_my_applications(self, client, auth_headers):
        # First submit a property
        submission_data = {
            "property_type": "condo",
            "project_name": "Test Project",
            "province": "Bangkok", 
            "property_address": "789 Test Ave",
            "property_size_sqm": 75.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "asking_price": 7500000,
            "property_condition": "new",
            "preferred_timeline": "within_3_months"
        }
        
        client.post("/property-application", json=submission_data, headers=auth_headers)
        
        # Get applications
        response = client.get("/my-applications", headers=auth_headers)
        
        assert response.status_code == 200
        applications = response.json()
        assert len(applications) > 0
        assert applications[0]["property_address"] == submission_data["property_address"]
        assert applications[0]["status"] == "submitted"


class TestProtectedEndpoints:
    """Test endpoints that require authentication"""
    
    def test_get_current_user_authenticated(self, client, auth_headers):
        response = client.get("/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
    
    def test_get_current_user_unauthenticated(self, client):
        response = client.get("/me")
        assert response.status_code == 403  # No auth header provided
    
    def test_submit_property_authenticated(self, client, auth_headers):
        property_data = {
            "property_type": "townhouse",
            "project_name": "",
            "province": "Bangkok",
            "property_address": "999 Test Place",
            "property_size_sqm": 120.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "asking_price": 8000000,
            "property_condition": "good",
            "preferred_timeline": "urgent"
        }
        
        response = client.post("/property-application", json=property_data, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["property_address"] == property_data["property_address"]