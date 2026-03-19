from services.ai_router import ai_router
import json
import logging
from typing import Optional
from services.playwright_scraper import stealth_scrape
import asyncio
from sqlalchemy.orm import Session
from models.memory import AgentMemory, AgentLog
from core.database import SessionLocal

logger = logging.getLogger(__name__)

class SentimentVerificationResult:
    def __init__(self, confidence_score: float, verification_details: str):
        self.confidence_score = confidence_score
        self.verification_details = verification_details

class AIAgentPipeline:
    
    def log_action(self, db: Session, agent_name: str, action: str, details: str = "", status: str = "INFO"):
        log = AgentLog(agent_name=agent_name, action=action, details=details, status=status)
        db.add(log)
        db.commit()
        logger.info(f"[{agent_name}] {action}")

    async def run_research_agent(self, base_query: str) -> dict:
        """
        Uses Playwright Stealth Scraping to search the live web. Analyzes results and decides if topic is Simple or Complex.
        """
        db = SessionLocal()
        self.log_action(db, "DiscoveryAgent", f"Initiating web search for: '{base_query}'")
        
        try:
            results = await stealth_scrape(base_query)
            
            if not results:
                self.log_action(db, "DiscoveryAgent", "Playwright Stealth blocked. Generating Simulated Research Data via LLM...")
                sim_prompt = (
                    "You are the SentinelReign Discovery Intelligence Engine. "
                    "You MUST simulate a highly technical web search on the following topic. "
                    "Your response must mimic raw search result snippets from top cybersecurity and tech sites. "
                    "Generate at least 8 distinct, comprehensive search result excerpts containing fictional but highly realistic details, zero-days, CVEs, or data points. "
                    "Return ONLY the plain text results, formatted as: Title | Snippet | Source URL."
                )
                sim_response = ai_router.generate_content(sim_prompt, f"Topic: {base_query}", max_tokens=2500)
                if not sim_response.get("success"):
                     self.log_action(db, "DiscoveryAgent", "Simulated AI research failed.")
                     return None
                gathered_data = sim_response.get("content", "")
            else:
                gathered_data = "\n\n".join([f"Title: {r['title']}\nSnippet: {r['body']}\nSource: {r['href']}" for r in results])
            
            self.log_action(db, "DiscoveryAgent", "Routing Decision: Analyzing complexity...")
            
            system_prompt = (
                "You are the Discovery Agent for SentinelReign. Analyze the search results. "
                "1. Decide complexity: If it's a deep, multi-faceted topic requiring a roadmap, choose 'Complex'. "
                "If it's a single news update or narrow vulnerability, choose 'Simple'. "
                "2. Decide format: 'News', 'Threat_Intel', 'Tutorial', 'Roadmap'. "
                "Return EXACTLY a JSON format: {\"format\": \"Tutorial\", \"complexity\": \"Complex\", \"topic\": \"...\"}"
            )
            user_prompt = f"Search Results for '{base_query}':\n{gathered_data}"
            
            response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=300)
            
            if not response.get("success"):
                raise Exception("AI Router failed to formulate research topic.")
                
            import re
            try:
                content_str = response.get("content", "")
                match = re.search(r'\{.*\}', content_str, re.DOTALL)
                if not match:
                    raise Exception("No JSON block found")
                data = json.loads(match.group(0))
                content_format = data.get("format", "News")
                topic = data.get("topic", base_query)
                complexity = data.get("complexity", "Simple")
            except Exception:
                content_format = "News"
                topic = base_query
                complexity = "Simple"
                
            self.log_action(db, "DiscoveryAgent", f"Decision Reached: [{complexity}] [{content_format}] on '{topic}'")
            db.close()
            
            return {
                "topic": topic,
                "format": content_format,
                "complexity": complexity,
                "gathered_data": gathered_data,
                "queries_used": [base_query]
            }
            
        except Exception as e:
            self.log_action(db, "DiscoveryAgent", f"Search Pipeline Error", details=str(e), status="ERROR")
            db.close()
            return None

    def run_writer_agent(self, topic: str, gathered_data: str, content_format: str = "News", feedback: Optional[str] = None) -> str:
        """
        Drafts content using Agent protocols.
        """
        try:
            with open("/media/syed/HDD/antigravity/sentinel/ai_memory/soul.md", "r") as f:
                soul_prompt = f.read()
            with open("/media/syed/HDD/antigravity/sentinel/ai_memory/writing_style.md", "r") as f:
                style_prompt = f.read()
        except:
            soul_prompt = "You are an elite analyst."
            style_prompt = "Write clearly."

        system_prompt = (
            f"You are the Writer Agent. Draft an authoritative {content_format} article based on the gathered data.\n"
            f"=== SOUL IDENTITY ===\n{soul_prompt}\n"
            f"=== WRITING STYLE ===\n{style_prompt}\n"
            "Format in Markdown. NO H1 tag.\n"
            "=== GENERATIVE ENGINE OPTIMIZATION (GEO) PROTOCOL ===\n"
            "1. TL;DR PROTOCOL: You MUST begin every major H2 section with a bolded, 50-word 'TL;DR Direct Answer'.\n"
            "2. FORMATTING: Use high-density Markdown tables, Pros/Cons lists, and statistical bullet points for data comparisons.\n"
            "CRITICAL: Append an '## Sources & References' section at the end of the markdown using [Source Name](url)."
        )
        user_prompt = f"Topic:\n{topic}\n\nGathered Technical Data:\n{gathered_data}\n"
        
        if feedback:
            user_prompt += f"\n\n=== REVISION FEEDBACK ===\n{feedback}\nYou MUST address this."
        
        response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=10000)
        return response.get("content", "Error generating content.") if response.get("success") else "Error generating content."

    def run_architect_agent(self, topic: str, gathered_data: str) -> str:
        """
        Takes a complex topic and outputs a sequential Roadmap.md.
        """
        system_prompt = (
            "You are the Architect Agent. Your job is to create a perfect 'Basic to Advanced' syllabus for a complex topic. "
            "You must output a Markdown file with a list of checkable roadmap sections. "
            "Format: '- [ ] **Module 1: Title** - Description'"
        )
        user_prompt = f"Topic:\n{topic}\nData:\n{gathered_data}\nGenerate the technical roadmap markdown."
        response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=2000)
        return response.get("content", "")

    def run_educator_agent(self, subtopic: str) -> str:
        """
        Educator Agent writes a simplified but deep dive on a subtopic segment.
        """
        system_prompt = (
            "You are the Educator Agent. Explain the requested advanced Subtopic using easy-to-understand examples and analogies. "
            "Format in Markdown."
        )
        user_prompt = f"Educate the reader entirely on this specific roadmap subtopic: {subtopic}"
        response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=5000)
        return response.get("content", "")

    def run_critic_agent(self, draft_content: str) -> str:
        """
        Critic Agent Protocol (Red Team Phase 1)
        """
        system_prompt = (
            "You are the Critic Agent for SentinelReign.\n"
            "Find logical flaws, missing context, or poor grammar. Reject hallucinated code.\n"
            "If the draft fails, output EXACTLY the word 'FAIL:' followed by the reason.\n"
            "If it passes, output EXACTLY 'PASS: No flaws detected.'"
        )
        response = ai_router.generate_content(system_prompt, f"Draft to verify:\n{draft_content}", max_tokens=300)
        return response.get("content", "FAIL: Service unavailable")

    def run_factchecker_agent(self, draft_content: str) -> str:
        """
        FactChecker Agent Protocol (Red Team Phase 2)
        """
        system_prompt = (
            "You are the FactChecker Agent for SentinelReign.\n"
            "Ensure technical claims align with reality. Highlight false vulnerabilities or impossible physics.\n"
            "If the draft fails, output EXACTLY the word 'FAIL:' followed by the reason.\n"
            "If it passes, output EXACTLY 'PASS: Facts verified.'"
        )
        response = ai_router.generate_content(system_prompt, f"Draft to verify:\n{draft_content}", max_tokens=300)
        return response.get("content", "FAIL: Service unavailable")

    def run_judge_agent(self, draft_content: str, critic_feedback: str, factchecker_feedback: str) -> SentimentVerificationResult:
        """
        Judge Agent Protocol (Red Team Phase 3)
        """
        system_prompt = (
            "You are the Judge Agent for SentinelReign.\n"
            "Score the final piece (0-100).\n"
            "If Critic or FactChecker failed, the score MUST be <85.\n"
            "Return EXACTLY as JSON: {\"confidence_score\": 95.5, \"details\": \"CRITIC: Passed. FACT_CHECK: Passed. JUDGE: Ready.\"}"
        )
        user_prompt = f"Draft:\n{draft_content}\nCritic: {critic_feedback}\nFactChecker: {factchecker_feedback}"
        
        response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=500)
        if not response.get("success"):
            return SentimentVerificationResult(0.0, "Judge Failed")
            
        import re
        try:
            content_str = response.get("content", "")
            match = re.search(r'\{.*\}', content_str, re.DOTALL)
            if not match:
                raise Exception("No JSON block found")
            data = json.loads(match.group(0))
            return SentimentVerificationResult(float(data.get("confidence_score", 0.0)), data.get("details", ""))
        except Exception as e:
            return SentimentVerificationResult(50.0, "Parsing Judge Result Failed.")

    def run_seo_agent(self, draft_content: str) -> dict:
        """
        Generates meta titles, descriptions, and keywords.
        """
        system_prompt = (
            "You are the SEO and Taxonomy Agent for SentinelReign. Analyze the article draft and generate SEO metadata. "
            "Additionally, determine the best Category and Subcategory for this content. "
            "Return EXACTLY as a JSON object: "
            "{\"meta_title\": \"...\", \"meta_description\": \"...\", \"keywords\": [\"a\", \"b\"], \"category\": \"...\", \"subcategory\": \"...\"}"
        )
        user_prompt = f"Draft:\n{draft_content}"
        
        response = ai_router.generate_content(system_prompt, user_prompt, max_tokens=500)
        if not response.get("success"):
            return {"meta_title": "SentinelReign Article", "meta_description": "", "keywords": [], "category": "Technology", "subcategory": "General"}
            
        import re
        try:
            content_str = response.get("content", "")
            match = re.search(r'\{.*\}', content_str, re.DOTALL)
            if not match:
                raise Exception("No JSON block found")
            data = json.loads(match.group(0))
            return data
        except Exception:
            return {"meta_title": "SentinelReign Article", "meta_description": "", "keywords": [], "category": "Technology", "subcategory": "General"}

agent_pipeline = AIAgentPipeline()
