from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from models.article import Article, ArticleComment
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from core.security import get_current_active_admin

router = APIRouter(tags=["comments"])

# --- SCHEMAS ---
class CommentCreate(BaseModel):
    author_name: str = "Anonymous"
    content: str

class CommentResponse(BaseModel):
    id: int
    author_name: str
    content: str
    created_at: datetime
    is_approved: bool

# --- PUBLIC ENDPOINTS ---

@router.post("/api/public/articles/{slug}/comments")
def post_comment(slug: str, req: CommentCreate, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    comment = ArticleComment(
        article_id=article.id,
        author_name=req.author_name,
        content=req.content,
        is_approved=False # Default to moderation queue
    )
    db.add(comment)
    db.commit()
    return {"status": "success", "message": "Comment received. Awaiting moderation."}

@router.get("/api/public/articles/{slug}/comments", response_model=List[CommentResponse])
def get_approved_comments(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    comments = db.query(ArticleComment).filter(
        ArticleComment.article_id == article.id,
        ArticleComment.is_approved == True
    ).order_by(ArticleComment.created_at.desc()).all()
    
    return comments

# --- ADMIN ENDPOINTS ---

@router.get("/api/admin/comments", response_model=List[CommentResponse])
def admin_list_comments(
    status: Optional[str] = Query(None, description="pending, approved, all"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    query = db.query(ArticleComment)
    if status == "pending":
        query = query.filter(ArticleComment.is_approved == False)
    elif status == "approved":
        query = query.filter(ArticleComment.is_approved == True)
    
    return query.order_by(ArticleComment.created_at.desc()).all()

@router.put("/api/admin/comments/{comment_id}/approve")
def approve_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    comment = db.query(ArticleComment).filter(ArticleComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_approved = True
    db.commit()
    return {"status": "success", "message": "Comment approved."}

@router.delete("/api/admin/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    comment = db.query(ArticleComment).filter(ArticleComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return {"status": "success", "message": "Comment deleted."}
