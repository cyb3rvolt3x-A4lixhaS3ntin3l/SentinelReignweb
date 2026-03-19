from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from core.database import get_db
from models.cms import Page, NavigationItem, SiteSettings
from slugify import slugify
from core.security import get_current_active_admin

router = APIRouter(prefix="/api/cms", tags=["cms"])

# -- Pydantic Schemas --
class PageCreate(BaseModel):
    title: str
    content: str
    meta_title: str | None = None
    meta_description: str | None = None
    is_published: bool = True

class PageUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    is_published: bool | None = None

class NavItemCreate(BaseModel):
    title: str
    url: str
    location: str
    order: int = 0
    is_visible: bool = True

class SettingUpdate(BaseModel):
    key_name: str
    value: str

class ArticleCreate(BaseModel):
    id: int | None = None
    title: str
    slug: str | None = None
    content: str
    summary: str | None = None
    category_id: int | None = None
    image_url: str | None = None
    is_published: bool = True

# -- PAGE CRUD --
@router.get("/pages")
def get_pages(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    return db.query(Page).all()
    
@router.get("/pages/{slug}")
def get_page_by_slug(slug: str, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.post("/pages")
def create_page(page: PageCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    db_page = Page(
        title=page.title,
        slug=slugify(page.title),
        content=page.content,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        is_published=page.is_published
    )
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

@router.put("/pages/{slug}")
def update_page(slug: str, page_data: PageUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if page_data.title is not None:
        page.title = page_data.title
        page.slug = slugify(page_data.title)
    if page_data.content is not None:
        page.content = page_data.content
    if page_data.meta_title is not None:
        page.meta_title = page_data.meta_title
    if page_data.meta_description is not None:
        page.meta_description = page_data.meta_description
    if page_data.is_published is not None:
        page.is_published = page_data.is_published
        
    db.commit()
    db.refresh(page)
    return page

@router.delete("/pages/{slug}")
def delete_page(slug: str, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
    db.commit()
    return {"message": "Page deleted"}

# -- ARTICLES CRUD --
@router.get("/articles")
def get_articles_admin(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    from models.article import Article
    return db.query(Article).order_by(Article.created_at.desc()).all()

@router.get("/articles/{article_id}")
def get_article_admin(article_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    from models.article import Article
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    # For the frontend editor, provide flat fields
    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "content": article.content,
        "summary": article.summary,
        "category": article.category.name if article.category else "Technology",
        "score": article.ai_verification_score,
        "image_url": article.image_url,
        "is_published": article.is_published
    }

@router.post("/articles")
def create_article(article_data: ArticleCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    from models.article import Article
    from datetime import datetime
    
    slug = article_data.slug or slugify(article_data.title)
    new_art = Article(
        title=article_data.title,
        slug=slug,
        content=article_data.content,
        summary=article_data.summary,
        category_id=article_data.category_id,
        image_url=article_data.image_url,
        is_published=article_data.is_published
    )
    db.add(new_art)
    db.commit()
    db.refresh(new_art)
    return new_art

@router.put("/articles/{article_id}")
def update_article(article_id: int, article_data: ArticleCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    from models.article import Article
    target = db.query(Article).filter(Article.id == article_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Article not found")
    
    target.title = article_data.title
    target.slug = article_data.slug or slugify(article_data.title)
    target.content = article_data.content
    target.summary = article_data.summary
    target.category_id = article_data.category_id
    target.image_url = article_data.image_url
    target.is_published = article_data.is_published
    
    db.commit()
    db.refresh(target)
    return target

@router.delete("/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    from models.article import Article
    target = db.query(Article).filter(Article.id == article_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(target)
    db.commit()
    return {"status": "success"}

# -- NAVIGATION CRUD --
@router.get("/nav")
def get_navigation_admin(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    return db.query(NavigationItem).order_by(NavigationItem.location, NavigationItem.order).all()

@router.get("/nav/{location}")
def get_navigation_public(location: str, db: Session = Depends(get_db)):
    return db.query(NavigationItem).filter(NavigationItem.location == location, NavigationItem.is_visible == True).order_by(NavigationItem.order).all()

@router.post("/nav")
def create_nav_item(item: NavItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    nav = NavigationItem(**item.model_dump())
    db.add(nav)
    db.commit()
    db.refresh(nav)
    return nav

@router.delete("/nav/{nav_id}")
def delete_nav_item(nav_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    nav = db.query(NavigationItem).filter(NavigationItem.id == nav_id).first()
    if not nav:
        raise HTTPException(status_code=404, detail="Nav item not found")
    db.delete(nav)
    db.commit()
    return {"message": "Deleted"}

# -- SETTINGS CRUD --
@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    return db.query(SiteSettings).all()

@router.post("/settings")
@router.put("/settings/{key}")
def update_setting(setting: SettingUpdate, key: str | None = None, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    key = key or setting.key_name
    target = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if not target:
        target = SiteSettings(key=key, value=setting.value)
        db.add(target)
    else:
        target.value = setting.value
    db.commit()
    db.refresh(target)
    return target
