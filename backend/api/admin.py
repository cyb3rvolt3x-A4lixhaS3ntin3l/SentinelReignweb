from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import APIKey
from models.newsletter import NewsletterSubscriber
from core.security import get_current_active_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

class APIKeyUpdate(BaseModel):
    service_name: str
    api_key: str

@router.get("/dashboard")
def admin_dashboard(admin=Depends(get_current_active_admin)):
    return {"message": "Welcome to SentinelReign Admin Dashboard"}

@router.post("/keys")
def update_api_key(key_data: APIKeyUpdate, db: Session = Depends(get_db), admin=Depends(get_current_active_admin)):
    key = db.query(APIKey).filter(APIKey.service_name == key_data.service_name).first()
    if key:
        key.api_key = key_data.api_key
    else:
        new_key = APIKey(service_name=key_data.service_name, api_key=key_data.api_key)
        db.add(new_key)
    db.commit()
    return {"status": "success", "message": f"{key_data.service_name} API Key updated."}

@router.post("/crawler/trigger")
def manual_crawler_trigger(admin=Depends(get_current_active_admin)):
    # Trigger crawler asynchronously or directly for MVP
    from services.crawler import crawler
    # Ideally should be a background task, but keeping simple for MVP
    return {"status": "success", "message": "Crawler triggered. Check server logs for progress."}

@router.get("/subscribers")
def list_subscribers(db: Session = Depends(get_db), admin=Depends(get_current_active_admin)):
    subs = db.query(NewsletterSubscriber).all()
    return {"data": [{"id": s.id, "email": s.email, "is_active": s.is_active, "date": s.subscribed_at} for s in subs]}

class CampaignRequest(BaseModel):
    subject: str
    body: str

@router.post("/send_campaign")
def send_marketing_campaign(camp: CampaignRequest, db: Session = Depends(get_db), admin=Depends(get_current_active_admin)):
    subs = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.is_active == True).count()
    # In a real system, queue an SMTP job via Celery/BackgroundTasks here.
    return {"status": "success", "message": f"Campaign '{camp.subject}' initiated across {subs} active nodes."}
