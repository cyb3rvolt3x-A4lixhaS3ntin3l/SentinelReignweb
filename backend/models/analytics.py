from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from models.base import Base

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # 'page_view', 'search_query'
    page_url = Column(String(255), nullable=True)
    search_query = Column(String(255), nullable=True) # If event_type is search
    
    ip_address = Column(String(45), nullable=True) # Masked/Hashed for privacy ideally
    user_agent = Column(String(255), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
