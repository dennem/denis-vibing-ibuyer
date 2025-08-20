"""
Email task for property submission
Just one task - send email after property is submitted
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_property_submission_email(self, submission_data: dict):
    """
    Send email after property submission
    Includes welcome email for new users and confirmation for all
    
    Args:
        submission_data: {
            'email': str,
            'full_name': str,
            'property_type': str,
            'property_address': str,
            'asking_price': float,
            'new_user': bool,
            'password': str (only if new_user is True)
        }
    """
    try:
        email = submission_data['email']
        full_name = submission_data['full_name']
        is_new_user = submission_data.get('new_user', False)
        
        logger.info(f"Sending property submission email to {email}")
        
        # TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
        # For now, just log the email content
        
        if is_new_user:
            # Welcome email for new user
            password = submission_data.get('password')
            print(f"""
            ===== WELCOME EMAIL SENT =====
            To: {email}
            Subject: Welcome to iBuyer Thailand - Property Submitted!
            
            Dear {full_name},
            
            Thank you for submitting your property! We've created an account for you.
            
            Your temporary password is: {password}
            
            Property Details:
            - Type: {submission_data.get('property_type')}
            - Address: {submission_data.get('property_address')}
            - Asking Price: ฿{submission_data.get('asking_price', 0):,.0f}
            
            What happens next:
            1. Our team will review your property within 24 hours
            2. We'll prepare a cash offer if your property meets our criteria
            3. You can track the status in your dashboard
            
            Login at: https://denis-vibing-ibuyer-production.up.railway.app
            
            Best regards,
            iBuyer Thailand Team
            ==============================
            """)
        else:
            # Confirmation email for existing user
            print(f"""
            ===== CONFIRMATION EMAIL SENT =====
            To: {email}
            Subject: Property Submission Received - iBuyer Thailand
            
            Dear {full_name},
            
            We've received your property submission!
            
            Property Details:
            - Type: {submission_data.get('property_type')}
            - Address: {submission_data.get('property_address')}
            - Asking Price: ฿{submission_data.get('asking_price', 0):,.0f}
            
            What happens next:
            1. Our team will review your property within 24 hours
            2. We'll prepare a cash offer if your property meets our criteria
            3. You can track the status in your dashboard
            
            View your dashboard: https://denis-vibing-ibuyer-production.up.railway.app/dashboard
            
            Best regards,
            iBuyer Thailand Team
            ====================================
            """)
        
        return {
            "status": "sent",
            "email": email,
            "type": "welcome" if is_new_user else "confirmation"
        }
        
    except Exception as exc:
        logger.error(f"Failed to send email to {submission_data.get('email')}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))