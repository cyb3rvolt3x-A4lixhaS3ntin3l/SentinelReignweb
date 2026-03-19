from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from models.base import Base

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False) # 'rss', 'api', 'web'
    url = Column(String(500), nullable=False)
    category = Column(String(100), nullable=True) # e.g. technology, cybersecurity
    enabled = Column(Boolean, default=True)
    
    last_checked = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
