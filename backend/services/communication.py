import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class CommunicationService:
    @staticmethod
    def send_email(to_email: str, subject: str, body_html: str, body_text: str = ""):
        """
        Sends a professional HTML email via SMTP.
        """
        if not settings.SMTP_SERVER or settings.SMTP_SERVER == "localhost":
            logger.warning(f"SMTP not configured. Simulation Mode: Sending Intel to {to_email}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = to_email

            part1 = MIMEText(body_text, "plain")
            part2 = MIMEText(body_html, "html")

            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                
                server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
            
            logger.info(f"Email successfully delivered to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to deliver mission-critical email to {to_email}: {str(e)}")
            return False

communication_service = CommunicationService()
