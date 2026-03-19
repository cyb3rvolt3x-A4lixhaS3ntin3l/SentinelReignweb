from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.article import Article, Category, TutorialCluster
from models.cms import Page
from models.newsletter import NewsletterSubscriber
from pydantic import BaseModel

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/articles")
def get_recent_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    articles = db.query(Article).order_by(Article.created_at.desc()).offset(skip).limit(limit).all()
    
    author_profile = {
        "name": "Syed Abrar",
        "bio": "Founder SentinelReign. Kulgam hacker → NDA grind → tech intel.",
        "url": "/author-syed-abrar.html",
        "credentials": "CTF player, Android dev, 'Even If She Never Returned' author"
    }

    return {"data": [{
        "id": a.id, 
        "title": a.title, 
        "slug": a.slug, 
        "summary": a.summary, 
        "category": a.category.name if a.category else "Technology",
        "category_slug": (a.category.name.lower().replace(" ", "-").replace("_", "-") if a.category else "technology"),
        "score": a.ai_verification_score, 
        "author": author_profile,
        "published_at": a.created_at
    } for a in articles]}

@router.get("/articles/{slug}")
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    related = [{"title": r.title, "slug": r.slug} for r in article.related_articles]
    
    author_profile = {
        "name": "Syed Abrar",
        "bio": "Founder SentinelReign. Kulgam hacker → NDA grind → tech intel.",
        "url": "/author-syed-abrar.html",
        "credentials": "CTF player, Android dev, 'Even If She Never Returned' author"
    }
    
    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "html_content": article.html_content,
        "image_url": article.image_url,
        "category": article.category.name if article.category else "Technology",
        "score": article.ai_verification_score,
        "seo": article.seo_metadata,
        "author": author_profile,
        "published_at": article.created_at,
        "related": related
    }

@router.get("/pages/{slug}")
def get_page(slug: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.slug == slug, Page.is_published == True).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found or not published")
    return {
        "id": page.id,
        "title": page.title,
        "content": page.content,
        "meta_title": page.meta_title,
        "meta_description": page.meta_description
    }

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return {"data": [{"name": c.name, "slug": c.slug} for c in categories]}

@router.get("/clusters")
def get_tutorial_clusters(db: Session = Depends(get_db)):
    clusters = db.query(TutorialCluster).all()
    return {"data": [{"name": c.cluster_name, "slug": c.slug, "description": c.description} for c in clusters]}

class SubscribeRequest(BaseModel):
    email: str

@router.post("/subscribe")
def subscribe_newsletter(req: SubscribeRequest, db: Session = Depends(get_db)):
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == req.email).first()
    if existing:
        return {"status": "success", "message": "Already subscribed."}
    
    sub = NewsletterSubscriber(email=req.email)
    db.add(sub)
    db.commit()
    return {"status": "success", "message": "Successfully subscribed to SentinelReign."}
