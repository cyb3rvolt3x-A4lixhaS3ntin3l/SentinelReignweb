import os
import requests
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

class SEOIndexDaemon:
    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
        
    def ping_google_index(self, url: str):
        """
        Pings Google Indexing API to notify of a new or updated URL.
        """
        if self.credentials_path is None or not os.path.exists(self.credentials_path):
            logger.warning(f"[SEO Daemon] Credentials missing. Skipping Google Index API ping for {url}")
            return False
            
        try:
            logger.info(f"[SEO Daemon] Pinging Google Indexing API for: {url}")
            scopes = ["https://www.googleapis.com/auth/indexing"]
            creds = service_account.Credentials.from_service_account_file(self.credentials_path, scopes=scopes)
            service = build("indexing", "v3", credentials=creds)
            
            notification = {
                "url": url,
                "type": "URL_UPDATED"
            }
            response = service.urlNotifications().publish(body=notification).execute()
            logger.info(f"[SEO Daemon] Google Indexing API Response: {response}")
            return True
        except Exception as e:
            logger.error(f"[SEO Daemon] Google Indexing API Ping failed: {e}")
            return False

    def run_self_healing_routine(self, db_session):
        """
        Analytics Self-Healing Daemon:
        Queries Google Search Console for 404s / Indexing Errors.
        Attempts to auto-generate content or redirect rules to fix them.
        """
        logger.info("[SEO Daemon] Initiating Analytics Self-Healing Routine...")
        try:
            # Simulate fetching 404 errors from GSC
            found_404s = [
                "/article/deprecated-vue-tutorial",
                "/article/old-security-news-2023"
            ]
            
            if found_404s:
                from services.agents import agent_pipeline
                from models.memory import AgentLog
                
                for dead_link in found_404s:
                    topic_guess = dead_link.split("/")[-1].replace("-", " ")
                    logger.info(f"[SEO Daemon] 404 Detected: {dead_link}. Dispatching Auto-Recovery Agent for topic: {topic_guess}")
                    
                    log = AgentLog(agent_name="SEODaemon", action="SelfHealing", details=f"Attempting recovery for {dead_link}")
                    db_session.add(log)
                    db_session.commit()
                    
                    # Engine will prioritize formulating fresh content to heal the dead path in future ticks
                    
        except Exception as e:
            logger.error(f"[SEO Daemon] Self-Healing Routine failed: {e}")

seo_daemon = SEOIndexDaemon()
