from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.database import get_db
from models.article import Article, Category
from models.cms import Page
from typing import Optional

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("/")
def search_system(q: str, category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Unified search endpoint spanning Articles and Static Pages.
    We simulate Full-Text Search via simple ILIKE matching for immediate MVP 
    cross-database compatibility (SQLite / MySQL base engines).
    """
    if not q or len(q) < 2:
        return {"results": []}
        
    term = f"%{q}%"
    
    # 1. Search Articles
    article_query = db.query(Article).filter(
        or_(
            Article.title.ilike(term),
            Article.summary.ilike(term),
            Article.content.ilike(term)
        )
    )
    
    if category:
        article_query = article_query.join(Category).filter(Category.slug == category.lower())
        
    articles = article_query.limit(10).all()
    
    # 2. Search Static Pages
    pages = db.query(Page).filter(
        Page.is_published == True,
        or_(
            Page.title.ilike(term),
            Page.content.ilike(term)
        )
    ).limit(5).all()
    
    results = [] # Initialize results list
    
    for a in articles:
        results.append({
            "type": "article",
            "title": a.title,
            "url": f"/blog/{a.slug}", # Updated URL for articles
            "summary": a.summary
        })
        
    for p in pages:
        results.append({
            "type": "page",
            "title": p.title,
            "url": f"/{p.slug}",
            "summary": "Page Content match..."
        })
        
    return {"query": q, "results": results}
