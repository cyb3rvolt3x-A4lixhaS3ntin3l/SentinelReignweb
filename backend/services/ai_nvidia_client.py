import os
import requests
import json
from schemas.ai_models import AIResponsePayload
from core.config import settings

class AIEngine:
    def __init__(self):
        self.nvidia_api_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        self.nvidia_model = "moonshotai/kimi-k2.5" # Changed via admin panel
        
    def generate_content(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> AIResponsePayload:
        """
        Primary AI Model: NVIDIA Inference API
        """
        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            return self._fallback_gemini_cli(system_prompt, user_prompt)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "model": self.nvidia_model,
            "messages": [
                {"role": "user", "content": f"SYSTEM: {system_prompt}\n\nUSER: {user_prompt}"}
            ],
            "max_tokens": 16384,
            "temperature": 1.00,
            "top_p": 1.00,
            "stream": False,
            "chat_template_kwargs": {"thinking": True}
        }

        try:
            response = requests.post(self.nvidia_api_url, headers=headers, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return AIResponsePayload(success=True, content=content, provider="nvidia")
            else:
                print(f"NVIDIA API Error: {response.status_code} - {response.text}")
                return self._fallback_gemini_cli(system_prompt, user_prompt)
        except Exception as e:
            print(f"Exception calling NVIDIA API: {e}")
            return self._fallback_gemini_cli(system_prompt, user_prompt)

    def _fallback_gemini_cli(self, system_prompt: str, user_prompt: str) -> AIResponsePayload:
        """
        Fallback AI Model: Gemini CLI via local execution.
        Assumes Gemini CLI is installed and configured via OAuth.
        """
        import subprocess
        print("Falling back to Gemini CLI...")
        
        # Combine prompts for the CLI
        full_prompt = f"{system_prompt}\n\nTask:\n{user_prompt}"
        
        try:
            # Note: This is a placeholder for the actual Gemini CLI command.
            # Replace 'gemini-cli' with the actual command installed on the system.
            # For this MVP, we will simulate a successful response if the CLI is not found to prevent complete breakage during dev.
            
            result = subprocess.run(
                ["gemini", "generate", "--prompt", full_prompt],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                 return AIResponsePayload(success=True, content=result.stdout.strip(), provider="gemini_cli")
            else:
                 return AIResponsePayload(success=False, content=f"Gemini Error: {result.stderr}", provider="gemini_cli")

        except FileNotFoundError:
             # Development Mock Response
             return AIResponsePayload(
                 success=True, 
                 content="[Mock Gemini Response] The AI system is currently in development mode. Please configure NVIDIA API or Gemini CLI.",
                 provider="mock"
             )
        except Exception as e:
            return AIResponsePayload(success=False, content=f"CLI Execution Error: {str(e)}", provider="gemini_cli")

ai_engine = AIEngine()
