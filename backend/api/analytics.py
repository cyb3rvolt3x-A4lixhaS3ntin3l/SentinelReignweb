from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from typing import List, Dict, Any
from core.database import get_db
from models.analytics import AnalyticsEvent
from models.article import Article
from models.newsletter import NewsletterSubscriber
from datetime import datetime, timedelta
from core.security import get_current_active_admin
import re

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

def parse_user_agent(user_agent: str) -> Dict[str, str]:
    """Simple user agent parser for OS and browser detection."""
    if not user_agent or user_agent == "unknown":
        return {"os": "Unknown", "browser": "Unknown"}
    
    os_info = "Unknown"
    if "Windows" in user_agent:
        os_info = "Windows"
    elif "Mac OS" in user_agent or "MacOS" in user_agent:
        os_info = "MacOS"
    elif "Linux" in user_agent:
        os_info = "Linux"
    elif "Android" in user_agent:
        os_info = "Android"
    elif "iOS" in user_agent or "iPhone" in user_agent or "iPad" in user_agent:
        os_info = "iOS"
    
    browser_info = "Unknown"
    if "Chrome" in user_agent and "Edg" not in user_agent:
        browser_info = "Chrome"
    elif "Firefox" in user_agent:
        browser_info = "Firefox"
    elif "Safari" in user_agent and "Chrome" not in user_agent:
        browser_info = "Safari"
    elif "Edg" in user_agent:
        browser_info = "Edge"
    
    return {"os": os_info, "browser": browser_info}

@router.post("/track")
def track_event(event_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Simple ingest point for frontend analytics tracker payload."""
    event = AnalyticsEvent(
        event_type=event_data.get("event_type", "page_view"),
        page_url=event_data.get("page_url"),
        search_query=event_data.get("search_query"),
        user_agent=event_data.get("user_agent", "unknown")
    )
    db.add(event)
    db.commit()
    return {"status": "tracked"}

@router.get("/dashboard")
def get_analytics_dashboard(days: int = 7, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Aggregation endpoint for the Admin Analytics Dashboard with REAL SQL queries."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # Total Views
    total_views = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.event_type == 'page_view',
        AnalyticsEvent.timestamp >= cutoff
    ).count()
    
    # Daily views breakdown (REAL aggregation)
    daily_views = db.query(
        extract('day', AnalyticsEvent.timestamp).label('day'),
        extract('month', AnalyticsEvent.timestamp).label('month'),
        func.count().label('count')
    ).filter(
        AnalyticsEvent.event_type == 'page_view',
        AnalyticsEvent.timestamp >= cutoff
    ).group_by(
        extract('day', AnalyticsEvent.timestamp),
        extract('month', AnalyticsEvent.timestamp)
    ).order_by(
        extract('day', AnalyticsEvent.timestamp)
    ).all()
    
    # Format daily views for chart
    labels = []
    values = []
    for i in range(days):
        date = cutoff + timedelta(days=i)
        day_label = date.strftime("%a")
        labels.append(day_label)
        
        # Find matching day in query results
        match = next((d for d in daily_views if d.day == date.day and d.month == date.month), None)
        values.append(match.count if match else 0)
    
    # Top Searches (REAL aggregation)
    searches = db.query(
        AnalyticsEvent.search_query,
        func.count().label('count')
    ).filter(
        AnalyticsEvent.event_type == 'search_query', 
        AnalyticsEvent.timestamp >= cutoff,
        AnalyticsEvent.search_query.isnot(None)
    ).group_by(AnalyticsEvent.search_query).order_by(desc('count')).limit(10).all()
    
    top_searches = [{"keyword": s[0], "count": s[1]} for s in searches if s[0]]
    
    # OS Distribution (REAL aggregation from user agents)
    all_events = db.query(AnalyticsEvent.user_agent).filter(
        AnalyticsEvent.timestamp >= cutoff
    ).all()
    
    os_counts = {}
    for event in all_events:
        ua = event[0] or "unknown"
        parsed = parse_user_agent(ua)
        os_name = parsed["os"]
        os_counts[os_name] = os_counts.get(os_name, 0) + 1
    
    os_distribution = [{"os": k, "count": v} for k, v in sorted(os_counts.items(), key=lambda x: x[1], reverse=True)]
    
    # Browser Distribution
    browser_counts = {}
    for event in all_events:
        ua = event[0] or "unknown"
        parsed = parse_user_agent(ua)
        browser_name = parsed["browser"]
        browser_counts[browser_name] = browser_counts.get(browser_name, 0) + 1
    
    browser_distribution = [{"browser": k, "count": v} for k, v in sorted(browser_counts.items(), key=lambda x: x[1], reverse=True)]
    
    # Top Pages
    page_views = db.query(
        AnalyticsEvent.page_url,
        func.count().label('count')
    ).filter(
        AnalyticsEvent.event_type == 'page_view',
        AnalyticsEvent.timestamp >= cutoff,
        AnalyticsEvent.page_url.isnot(None)
    ).group_by(AnalyticsEvent.page_url).order_by(desc('count')).limit(10).all()
    
    top_pages = [{"url": p[0], "views": p[1]} for p in page_views if p[0]]
    
    # Article stats
    total_articles = db.query(Article).count()
    published_articles = db.query(Article).filter(Article.is_published == True).count()
    
    # Subscriber count
    total_subscribers = db.query(NewsletterSubscriber).count()
    
    return {
        "period_days": days,
        "total_views": total_views,
        "total_articles": total_articles,
        "published_articles": published_articles,
        "total_subscribers": total_subscribers,
        "pageviews": {
            "labels": labels,
            "values": values
        },
        "os_distribution": os_distribution,
        "browser_distribution": browser_distribution,
        "top_queries": top_searches,
        "top_pages": top_pages
    }
