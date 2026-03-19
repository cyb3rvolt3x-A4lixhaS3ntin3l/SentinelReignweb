import asyncio
import aiohttp
import feedparser
from bs4 import BeautifulSoup
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import datetime
import json
from slugify import slugify

from services.agents import agent_pipeline, SentimentVerificationResult
from services.seo_index_daemon import seo_daemon
from models.article import Article, Category
from models.memory import AgentMemory, AgentLog
from core.database import SessionLocal
import re

def auto_interlink(markdown_text: str, existing_articles: list, new_article) -> str:
    """Intelligently links matching keywords to existing articles once per document."""
    sorted_articles = sorted(existing_articles, key=lambda x: len(x.title), reverse=True)
    linked_articles = []
    
    for article in sorted_articles:
        if len(article.title) <= 4:
            continue
        if f"(/article/{article.slug})" in markdown_text:
            continue
            
        pattern = re.compile(r'(?<!\[)\b(' + re.escape(article.title) + r')\b(?!\])', re.IGNORECASE)
        # Check if match exists before replacing, so we can track relationships
        if pattern.search(markdown_text):
            markdown_text = pattern.sub(f'[\\1](/article/{article.slug})', markdown_text, count=1)
            linked_articles.append(article)
            
    if new_article:
        for a in linked_articles:
            new_article.related_articles.append(a)
            
    return markdown_text

logger = logging.getLogger(__name__)

class AutonomousIntelligenceEngine:
    def __init__(self):
        # We start with broad queries. In the future AgentMemory will dictate this list dynamically.
        self.seed_queries = [
            "latest critical cybersecurity zero day vulnerabilities",
            "artificial intelligence developments in enterprise tech",
            "advanced linux privilege escalation techniques tutorial"
        ]

    async def run_pipeline(self):
        logger.info("Starting Autonomous Web Search Crawler...")
        db: Session = SessionLocal()
        
        try:
            for query in self.seed_queries:
                # Deduplicate check based on memory
                mem_check = db.query(AgentMemory).filter(AgentMemory.topic.ilike(f"%{query}%")).first()
                if mem_check:
                    agent_pipeline.log_action(db, "IntelligenceEngine", f"Skipping known seed query: {query}", status="SKIP")
                    continue
                    
                agent_pipeline.log_action(db, "IntelligenceEngine", f"Triggering Research Agent on seed: {query}")
                
                # 1. Autonomous Research using Playwright Stealth Scraper
                research_data = await agent_pipeline.run_research_agent(query)
                if not research_data:
                    continue
                
                topic_title = research_data['topic']
                content_format = research_data['format']
                complexity = research_data.get('complexity', 'Simple')
                
                # Check memory again against the specific formulated topic
                topic_check = db.query(AgentMemory).filter(AgentMemory.topic == topic_title).first()
                if topic_check:
                    agent_pipeline.log_action(db, "IntelligenceEngine", f"Skipping known topic formulation: {topic_title}", status="SKIP")
                    continue
                
                if complexity == "Complex":
                    agent_pipeline.log_action(db, "ArchitectAgent", f"Generating Roadmap for Complex Topic: {topic_title}")
                    draft_md = agent_pipeline.run_architect_agent(topic_title, research_data['gathered_data'])
                    content_format = "Roadmap"
                    verification = SentimentVerificationResult(95.0, 'Architect Trusted')
                else:
                    # 2. Drafting & Verification with Auto-Retry (Repolishing)
                    max_retries = 2
                    feedback = None
                    
                    for attempt in range(max_retries + 1):
                        agent_pipeline.log_action(db, "WriterAgent", f"Drafting {content_format} concerning {topic_title} (Attempt {attempt + 1})")
                        draft_md = agent_pipeline.run_writer_agent(topic_title, research_data['gathered_data'], content_format, feedback=feedback)
                        
                        # 3. Validation Swarm
                        agent_pipeline.log_action(db, "CriticAgent", f"Critiquing drafting logic: {topic_title}")
                        critic_fb = agent_pipeline.run_critic_agent(draft_md)
                        agent_pipeline.log_action(db, "FactCheckerAgent", f"Verifying facts: {topic_title}")
                        fact_fb = agent_pipeline.run_factchecker_agent(draft_md)
                        agent_pipeline.log_action(db, "JudgeAgent", f"Evaluating final intelligence: {topic_title}")
                        verification = agent_pipeline.run_judge_agent(draft_md, critic_fb, fact_fb)
                        
                        if verification.confidence_score >= 85.0:
                            agent_pipeline.log_action(db, "IntelligenceEngine", f"Intelligence Validated (Score: {verification.confidence_score})")
                            break
                        else:
                            feedback = verification.verification_details
                            if attempt < max_retries:
                                agent_pipeline.log_action(db, "IntelligenceEngine", f"Low Confidence ({verification.confidence_score}). Re-polishing draft with Verification feedback...", status="WARNING")
                            else:
                                agent_pipeline.log_action(db, "IntelligenceEngine", f"Auto Intelligence Rejected after retries (Score: {verification.confidence_score}). Detail: {verification.verification_details}", status="ERROR")
                                draft_md = None # Mark as failed
                
                if not draft_md:
                    continue # Skip to next seed query if failed completely
                
                # 4. SEO
                agent_pipeline.log_action(db, "SEOAgent", f"Generating metadata for {topic_title}")
                seo_meta = agent_pipeline.run_seo_agent(draft_md)
                
                # Record Memory
                new_memory = AgentMemory(
                    topic=topic_title,
                    content_type=content_format,
                    search_queries_used=research_data['queries_used'],
                    confidence_score=str(verification.confidence_score)
                )
                db.add(new_memory)
                db.flush()
                
                # Setup Categories
                primary_cat_name = seo_meta.get("category", "Technology")
                sub_cat_name = seo_meta.get("subcategory", "General")

                primary_cat = db.query(Category).filter(Category.name == primary_cat_name, Category.parent_id == None).first()
                if not primary_cat:
                    primary_cat = Category(name=primary_cat_name, slug=slugify(primary_cat_name))
                    db.add(primary_cat)
                    db.flush()

                sub_cat = db.query(Category).filter(Category.name == sub_cat_name, Category.parent_id == primary_cat.id).first()
                if not sub_cat:
                    sub_cat = Category(name=sub_cat_name, slug=slugify(f"{primary_cat_name}-{sub_cat_name}"), parent_id=primary_cat.id)
                    db.add(sub_cat)
                    db.flush()
                
                # Auto Internal Linking
                existing_articles = db.query(Article).all()
                draft_md = auto_interlink(draft_md, existing_articles, None)

                # Simple HTML fallback for legacy/preview
                formatted_md = draft_md.replace('##', '<h2>').replace('###', '<h3>').replace('\\n', '<br>')
                html_rendered = f"<div class='markdown-body'>{formatted_md}</div>"
                
                # Create Article / Post
                slug = slugify(topic_title)
                new_article = Article(
                    title=topic_title,
                    slug=slug,
                    content=draft_md,
                    html_content=html_rendered,
                    summary=research_data['gathered_data'][:250] + "...",
                    category_id=sub_cat.id,
                    author_id=1,
                    ai_verification_score=verification.confidence_score,
                    seo_metadata=json.dumps(seo_meta)
                )
                
                # Re-run interlinking to map the relationships to the new object safely
                auto_interlink(draft_md, existing_articles, new_article)
                
                db.add(new_article)
                agent_pipeline.log_action(db, "IntelligenceEngine", f"Successfully published {content_format}: {topic_title}", status="SUCCESS")

            db.commit()
            
            # Phase 8: Deep SEO Real-Time Indexation Ping
            try:
                # We fetch the slugs explicitly to avoid lazy-loading issues out of session
                slugs_to_ping = [a.slug for a in db.query(Article).order_by(Article.id.desc()).limit(len(self.seed_queries)).all()]
                for slug in slugs_to_ping:
                    seo_daemon.ping_google_index(f"https://sentinelreign.com/article/{slug}")
            except Exception as e:
                logger.error(f"Failed to execute SEO pings: {e}")
            
        except Exception as e:
            db.rollback()
            agent_pipeline.log_action(db, "IntelligenceEngine", f"Pipeline Exception", details=str(e), status="CRITICAL")
            logger.error(f"IntelligenceEngine fault: {e}")
        finally:
            db.close()

    async def run_manual_topic(self, topic: str):
        """
        Manually trigger the full pipeline for a specific user-defined topic.
        Bypasses seed deduplication to ensure the user gets exactly what they requested.
        """
        logger.info(f"Initiating Manual Generation Protocol for topic: {topic}")
        db: Session = SessionLocal()
        
        try:
            agent_pipeline.log_action(db, "IntelligenceEngine", f"Manual Trigger: {topic}")
            
            # 1. Research phase (we use the topic as the primary query)
            research_data = await agent_pipeline.run_research_agent(topic)
            if not research_data:
                agent_pipeline.log_action(db, "IntelligenceEngine", "Research Agent failed to process manual topic", status="ERROR")
                return
            
            # Use requested topic if research doesn't provide a cleaner one
            topic_title = research_data.get('topic', topic)
            content_format = research_data.get('format', 'Tutorial')
            
            # 2. Drafting & Verification with Auto-Retry
            max_retries = 2
            feedback = None
            for attempt in range(max_retries + 1):
                agent_pipeline.log_action(db, "WriterAgent", f"Drafting Manual Intelligence (Attempt {attempt + 1}): {topic_title}")
                draft_md = agent_pipeline.run_writer_agent(topic_title, research_data['gathered_data'], content_format, feedback=feedback)
                
                # 3. Validation Swarm
                agent_pipeline.log_action(db, "CriticAgent", f"Critiquing Manual Draft: {topic_title}")
                critic_fb = agent_pipeline.run_critic_agent(draft_md)
                agent_pipeline.log_action(db, "FactCheckerAgent", f"Verifying Manual Facts: {topic_title}")
                fact_fb = agent_pipeline.run_factchecker_agent(draft_md)
                agent_pipeline.log_action(db, "JudgeAgent", f"Evaluating Manual Intelligence: {topic_title}")
                verification = agent_pipeline.run_judge_agent(draft_md, critic_fb, fact_fb)
                
                if verification.confidence_score >= 85.0:
                    agent_pipeline.log_action(db, "IntelligenceEngine", f"Intelligence Validated (Score: {verification.confidence_score})")
                    break
                else:
                    feedback = verification.verification_details
                    if attempt < max_retries:
                        agent_pipeline.log_action(db, "IntelligenceEngine", f"Low Confidence ({verification.confidence_score}). Re-polishing draft with Verification feedback...", status="WARNING")
                    else:
                        agent_pipeline.log_action(db, "IntelligenceEngine", f"Intelligence Rejected (Score: {verification.confidence_score}). Detail: {verification.verification_details}", status="ERROR")
                        return # Hard fail after retries
            
            # 4. SEO
            agent_pipeline.log_action(db, "SEOAgent", f"Metadata mapping for: {topic_title}")
            seo_meta = agent_pipeline.run_seo_agent(draft_md)
            
            # Setup Categories
            primary_cat_name = seo_meta.get("category", "Technology")
            sub_cat_name = seo_meta.get("subcategory", "General")

            primary_cat = db.query(Category).filter(Category.name == primary_cat_name, Category.parent_id == None).first()
            if not primary_cat:
                primary_cat = Category(name=primary_cat_name, slug=slugify(primary_cat_name))
                db.add(primary_cat)
                db.flush()

            sub_cat = db.query(Category).filter(Category.name == sub_cat_name, Category.parent_id == primary_cat.id).first()
            if not sub_cat:
                sub_cat = Category(name=sub_cat_name, slug=slugify(f"{primary_cat_name}-{sub_cat_name}"), parent_id=primary_cat.id)
                db.add(sub_cat)
                db.flush()
            
            # Auto Internal Linking
            existing_articles = db.query(Article).all()
            draft_md = auto_interlink(draft_md, existing_articles, None)
            
            # HTML Render fallback (frontend Marked.js is the primary renderer)
            formatted_md = draft_md.replace('##', '<h2>').replace('###', '<h3>').replace('\\n', '<br>')
            html_rendered = f"<div class='markdown-body'>{formatted_md}</div>"
            
            new_article = Article(
                title=topic_title,
                slug=slugify(topic_title) + "-" + datetime.now().strftime("%H%M%S"),
                content=draft_md,
                html_content=html_rendered,
                summary=research_data['gathered_data'][:250].replace('\\n', ' '),
                category_id=sub_cat.id,
                author_id=1,
                ai_verification_score=verification.confidence_score,
                seo_metadata=json.dumps(seo_meta)
            )
            
            # Re-run interlinking to map the relationships to the new object safely
            auto_interlink(draft_md, existing_articles, new_article)
            
            db.add(new_article)
            db.commit()
            agent_pipeline.log_action(db, "IntelligenceEngine", f"Manual Article Published: {topic_title}", status="SUCCESS")
            
            # Deep SEO Real-Time Indexation Ping
            seo_daemon.ping_google_index(f"https://sentinelreign.com/article/{new_article.slug}")
            
        except Exception as e:
            db.rollback()
            agent_pipeline.log_action(db, "IntelligenceEngine", f"Manual Pipeline Exception", details=str(e), status="CRITICAL")
            logger.error(f"Manual Intelligence fault: {e}")
        finally:
            db.close()

# Scheduler hook for FastAPI main app
from apscheduler.schedulers.asyncio import AsyncIOScheduler

crawler_scheduler = AsyncIOScheduler()
crawler = AutonomousIntelligenceEngine()

@crawler_scheduler.scheduled_job('interval', minutes=60)
async def scheduled_crawler_job():
    await crawler.run_pipeline()

@crawler_scheduler.scheduled_job('interval', minutes=30)
async def map_pending_roadmaps():
    logger.info("[Execution Cron] Scanning for pending EducatorAgent Roadmap subtopics...")
    db = SessionLocal()
    try:
        import re
        roadmaps = db.query(Article).filter(Article.content.like('%- [ ]%')).all()
        for roadmap in roadmaps:
            # Find the first unchecked roadmap module
            match = re.search(r'- \[ \] \*\*([^*]+)\*\*', roadmap.content)
            if match:
                subtopic = match.group(1)
                agent_pipeline.log_action(db, "EducatorAgent", f"Drafting deeper subtopic: {subtopic} for roadmap: {roadmap.title}")
                subtopic_md = agent_pipeline.run_educator_agent(subtopic)
                
                if not subtopic_md:
                    continue
                    
                sub_slug = slugify(roadmap.title + "-" + subtopic)
                new_article = Article(
                    title=f"{subtopic} ({roadmap.title})",
                    slug=sub_slug,
                    content=subtopic_md,
                    html_content=f"<div class='markdown-body'>{subtopic_md}</div>",
                    summary=f"In-depth analysis of {subtopic} bridging theory to execution.",
                    category_id=roadmap.category_id,
                    author_id=1,
                    ai_verification_score=95.0,
                    seo_metadata="{}"
                )
                db.add(new_article)
                
                # Update roadmap UI and link
                roadmap.content = roadmap.content.replace(f"- [ ] **{subtopic}**", f"- [x] **[{subtopic}](/article/{sub_slug})**", 1)
                roadmap.html_content = f"<div class='markdown-body'>{roadmap.content}</div>"
                db.commit()
                agent_pipeline.log_action(db, "EducatorAgent", f"Published Subtopic: {subtopic}", status="SUCCESS")
                
                # Ping Indexing API
                seo_daemon.ping_google_index(f"https://sentinelreign.com/article/{sub_slug}")
                
                break # Process one per interval
    except Exception as e:
        logger.error(f"Roadmap dispatch fault: {e}")
@crawler_scheduler.scheduled_job('interval', minutes=720)
async def self_healing_daemon_job():
    db = SessionLocal()
    try:
        seo_daemon.run_self_healing_routine(db)
    finally:
        db.close()
