from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import Base

class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(Integer, primary_key=True, index=True)
    malware_name = Column(String(255), nullable=False, index=True)
    malware_family = Column(String(255), nullable=True)
    platform = Column(String(100), nullable=True) # e.g. Windows, Linux, Android
    
    attack_vector = Column(Text, nullable=True)
    technical_analysis = Column(Text, nullable=True)
    command_and_control = Column(Text, nullable=True)
    indicators_of_compromise = Column(JSON, nullable=True) # List of IPs, Domains, Hashes
    mitigation_steps = Column(Text, nullable=True)
    
    sources = Column(JSON, nullable=True) # List of URLs
    
    article_id = Column(Integer, ForeignKey('articles.id'), nullable=True)
    article = relationship("Article")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
