import os
import requests
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from core.config import settings
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.cms import SiteSettings

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

    def _get_api_key(self) -> str:
        """Get NVIDIA API key from DB settings, fallback to environment variable."""
        db: Session = SessionLocal()
        try:
            db_key = db.query(SiteSettings).filter(SiteSettings.key == "nvidia_api_key").first()
            env_key = os.getenv("NVIDIA_API_KEY")
            api_key = db_key.value if db_key and db_key.value else env_key
            
            if not api_key:
                logger.error("NVIDIA API Key not configured in SiteSettings or environment.")
                raise ValueError("NVIDIA API Key missing")
            
            return api_key
        finally:
            db.close()

    def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        # Dynamically fetch API key
        try:
            api_key = self._get_api_key()
        except ValueError as e:
            return {"success": False, "error": str(e)}

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": f"SYSTEM: {system_prompt}\\n\\nUSER: {user_prompt}"}
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

class AIRouter:
    def __init__(self):
        self.nvidia = NVIDIAProvider()
        
    def generate_content(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> Dict[str, Any]:
        """
        Routes the request to NVIDIA NIM API exclusively.
        No fallback providers - NVIDIA only architecture.
        """
        logger.info("AI Router: Executing NVIDIA NIM generation...")
        return self.nvidia.generate(system_prompt, user_prompt, max_tokens)

ai_router = AIRouter()
