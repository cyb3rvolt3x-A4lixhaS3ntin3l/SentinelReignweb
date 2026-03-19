from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from models.base import Base

class AgentMemory(Base):
    __tablename__ = "agent_memory"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), unique=True, index=True, nullable=False)
    content_type = Column(String(50), nullable=False) # 'News', 'Threat_Intel', 'Tutorial'
    search_queries_used = Column(JSON, nullable=True) # list of queries used
    research_summary = Column(Text, nullable=True)
    confidence_score = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(50), nullable=False) # e.g. Researcher, Writer, SEO
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), default="INFO")
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
