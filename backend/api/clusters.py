from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from core.database import get_db
from models.article import TutorialCluster, ClusterItem

router = APIRouter(prefix="/api/clusters", tags=["clusters"])

@router.get("/")
def get_clusters(db: Session = Depends(get_db)):
    """Fetch all tutorial clusters and their ordered items."""
    clusters = db.query(TutorialCluster).all()
    
    result = []
    for c in clusters:
        items = db.query(ClusterItem).filter(ClusterItem.cluster_id == c.id).order_by(ClusterItem.sequence_order.asc()).all()
        item_data = []
        for i in items:
            item_data.append({
                "sequence_order": i.sequence_order,
                "article_title": i.article.title if i.article else "Unknown Module",
                "article_slug": i.article.slug if i.article else "#"
            })
            
        result.append({
            "id": c.id,
            "cluster_name": c.cluster_name,
            "slug": c.slug,
            "description": c.description,
            "items": item_data
        })
        
    return result
