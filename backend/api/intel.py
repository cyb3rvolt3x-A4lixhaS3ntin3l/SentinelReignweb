from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from core.database import get_db
from models.source import ResearchSource
from models.threat import ThreatReport

router = APIRouter(prefix="/api/intel", tags=["intel"])

# --- Sources Management ---
class SourceCreate(BaseModel):
    source_name: str
    source_type: str
    url: str
    category: Optional[str] = None
    enabled: bool = True

@router.get("/sources")
def get_sources(db: Session = Depends(get_db)):
    return db.query(ResearchSource).all()

@router.post("/sources")
def create_source(source: SourceCreate, db: Session = Depends(get_db)):
    db_source = ResearchSource(**source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.delete("/sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    db_source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(db_source)
    db.commit()
    return {"message": "Source deleted"}

# --- Threat Management ---
class ThreatCreate(BaseModel):
    malware_name: str
    malware_family: Optional[str] = None
    platform: Optional[str] = None
    attack_vector: Optional[str] = None
    technical_analysis: Optional[str] = None
    mitigation_steps: Optional[str] = None
    indicators_of_compromise: Optional[Dict[str, Any]] = None

@router.get("/threats")
def get_threats(db: Session = Depends(get_db)):
    return db.query(ThreatReport).order_by(ThreatReport.created_at.desc()).all()

@router.post("/threats")
def create_threat(threat: ThreatCreate, db: Session = Depends(get_db)):
    db_threat = ThreatReport(**threat.dict())
    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)
    return db_threat
