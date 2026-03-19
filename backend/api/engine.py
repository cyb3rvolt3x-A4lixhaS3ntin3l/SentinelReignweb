from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from core.database import get_db
from models.memory import AgentLog, AgentMemory
from models.article import Article
from models.cms import Page
from services.crawler import crawler
from core.security import get_current_active_admin

router = APIRouter(prefix="/api/engine", tags=["engine"])

@router.get("/logs")
def get_agent_logs(limit: int = 50, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Fetch real-time agent execution logs for the admin dashboard."""
    logs = db.query(AgentLog).order_by(AgentLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/memory")
def get_agent_memory(limit: int = 50, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Fetch previously researched topics to view the Agent's brain mapping."""
    memory = db.query(AgentMemory).order_by(AgentMemory.created_at.desc()).limit(limit).all()
    return memory
    
@router.post("/trigger")
async def trigger_autonomous_crawler(background_tasks: BackgroundTasks, current_user = Depends(get_current_active_admin)):
    """
    Manually triggers the Autonomous DDGS crawler pipeline.
    Runs in the background to prevent HTTP timeout.
    """
    background_tasks.add_task(crawler.run_pipeline)
    return {"message": "Autonomous Web Search Pipeline Triggered", "status": "processing"}

from pydantic import BaseModel
class ManualTopic(BaseModel):
    topic: str

@router.post("/generate_manual")
async def generate_manual_topic(payload: ManualTopic, background_tasks: BackgroundTasks, current_user = Depends(get_current_active_admin)):
    """
    Dispatches a specific manual topic to the AI generator as a background task.
    """
    background_tasks.add_task(crawler.run_manual_topic, payload.topic)
    return {"message": f"Manual Generation queued for: {payload.topic}", "status": "processing"}

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Fetch high level stats for the dashboard overview."""
    article_count = db.query(Article).count()
    page_count = db.query(Page).count()
    memory_count = db.query(AgentMemory).count()
    
    from models.newsletter import NewsletterSubscriber
    sub_count = db.query(NewsletterSubscriber).count()
    
    # Calculate avg confidence (mock logic or real averge)
    # Using python sum for SQLite compatibility simplicity 
    articles = db.query(Article.ai_verification_score).filter(Article.ai_verification_score != None).all()
    avg_conf = 0.0
    if articles:
        total = sum([float(a[0]) for a in articles if a[0]])
        avg_conf = round(total / len(articles), 1)
        
    return {
        "total_articles": article_count,
        "total_pages": page_count,
        "intelligence_nodes": memory_count,
        "avg_confidence": avg_conf,
        "subscribers": sub_count
    }
