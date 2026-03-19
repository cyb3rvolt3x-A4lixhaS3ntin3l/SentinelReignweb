import os
import requests
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from core.config import settings
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.user import OAuthToken
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest

import threading
import time

logger = logging.getLogger(__name__)

class TokenBucket:
    def __init__(self, capacity, fill_rate):
        self.capacity = float(capacity)
        self.fill_rate = float(fill_rate)
        self.tokens = float(capacity)
        self.last_update = time.time()
        self.lock = threading.Lock()

    def consume(self, tokens=1):
        with self.lock:
            now = time.time()
            self.tokens += (now - self.last_update) * self.fill_rate
            self.last_update = now
            if self.tokens > self.capacity:
                self.tokens = self.capacity
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    def wait_for_token(self):
        while not self.consume(1):
            time.sleep(0.5)

# Sentinel NVIDIA NIM Global Rate Limiter: 15 requests per minute
nvidia_rate_limiter = TokenBucket(capacity=15, fill_rate=15.0 / 60.0)

class AIProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        pass

class NVIDIAProvider(AIProvider):
    def __init__(self):
        self.api_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        self.model = "meta/llama-3.1-70b-instruct"

    def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        # Dynamically fetch API key from DB, fallback to env config
        db: Session = SessionLocal()
        from models.cms import SiteSettings
        db_key = db.query(SiteSettings).filter(SiteSettings.key == "nvidia_api_key").first()
        env_key = getattr(settings, "NVIDIA_API_KEY", None)
        api_key = db_key.value if db_key and db_key.value else (env_key if env_key else "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")
        db.close()

        if not api_key:
            logger.warning("NVIDIA API Key missing.")
            return {"success": False, "error": "Missing NVIDIA API Key"}

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": f"SYSTEM: {system_prompt}\n\nUSER: {user_prompt}"}
            ],
            "max_tokens": 16384,
            "temperature": 0.5,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
            "stream": False,
            "chat_template_kwargs": {"thinking": True}
        }

        try:
            # Enforce 15 req/min Token Bucket limits
            logger.info("Awaiting NVIDIA NIM token from TokenBucket...")
            nvidia_rate_limiter.wait_for_token()

            # Note: We are executing a standard synchronous request here inside the async pipeline
            # In a highly concurrent prod env, an async client like HTTPX would be better, but requests suffices for MVP crawler.
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=300)
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return {"success": True, "content": content, "provider": "nvidia"}
            elif response.status_code == 429:
                logger.warning("NVIDIA API Rate Limit Exceeded.")
                return {"success": False, "error": "rate_limit"}
            else:
                logger.error(f"NVIDIA API Error {response.status_code}: {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            logger.error(f"NVIDIA Provider Exception: {e}")
            return {"success": False, "error": str(e)}

class GeminiAPIProvider(AIProvider):
    def __init__(self):
        self.db: Session = SessionLocal()
        # Initialize Google scopes to match what we requested during auth hook
        self.scopes = ['https://www.googleapis.com/auth/generative-language.retriever']

    def _get_valid_credentials(self) -> Optional[Credentials]:
        token_record = self.db.query(OAuthToken).filter(OAuthToken.service_name == 'gemini_api').first()
        if not token_record or not token_record.access_token:
            logger.error("No Gemini OAuth credentials found in database.")
            return None
            
        creds = Credentials(
            token=token_record.access_token,
            refresh_token=token_record.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.environ.get("GOOGLE_CLIENT_ID"), 
            client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
            scopes=self.scopes
        )
        
        # Automatically refresh if expired
        if not creds.valid and creds.refresh_token:
            try:
                creds.refresh(GoogleRequest())
                # Update DB with new access token
                token_record.access_token = creds.token
                self.db.commit()
            except Exception as e:
                logger.error(f"Failed to refresh Gemini OAuth token: {e}")
                return None
                
        return creds

    def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        """
        Executes a real REST call against the Gemini 1.5 Pro API using OAuth Access Tokens.
        """
        creds = self._get_valid_credentials()
        if not creds or not creds.valid:
            logger.error("Gemini API execution failed: Valid OAuth Credentials Unavailable.")
            return {
                "success": False,
                "error": "Valid OAuth Credentials Unavailable. Administrator must re-authenticate via Admin panel."
            }
            
        endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
        
        headers = {
            "Authorization": f"Bearer {creds.token}",
            "Content-Type": "application/json"
        }
        
        # Gemini specific API payload structuring
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"SYSTEM INSTRUCTION: {system_prompt}\n\nUSER PROMPT: {user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.2
            }
        }
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=40)
            response.raise_for_status()
            data = response.json()
            
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            
            return {
                "success": True,
                "content": content,
                "provider": "gemini_api_oauth"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API Error: {str(e)}")
            response_text = e.response.text if hasattr(e, 'response') and e.response else str(e)
            return {
                "success": False,
                "error": f"Gemini Request Failed: {response_text}"
            }
        except Exception as e:
            logger.error(f"Gemini Parsing Error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            self.db.close()

class AIRouter:
    def __init__(self):
        self.nvidia = NVIDIAProvider()
        self.gemini = GeminiAPIProvider()
        
    def generate_content(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        """
        Routes the request to NVIDIA first. Falls back to Gemini API on failure.
        """
        logger.info("AI Router: Attempting primary provider (NVIDIA)...")
        nv_result = self.nvidia.generate(system_prompt, user_prompt, max_tokens)
        
        if nv_result.get("success"):
            return nv_result
            
        logger.warning(f"AI Router: NVIDIA failed ({nv_result.get('error')}). Triggering Fallback.")
        
        gem_result = self.gemini.generate(system_prompt, user_prompt, max_tokens)
        
        if gem_result.get("success"):
            return gem_result
            
        logger.error("AI Router: ALL providers exhausted.")
        return {"success": False, "error": "All AI providers failed.", "provider": "none"}

ai_router = AIRouter()
