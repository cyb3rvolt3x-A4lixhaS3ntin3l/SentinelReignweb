import os
from sqlalchemy import create_engine
from core.database import SessionLocal, engine
import models.user
import models.article
import models.memory
from models.article import Article
from models.memory import AgentMemory, AgentLog

db = SessionLocal()
try:
    print(f"Deleting {db.query(Article).count()} articles...")
    db.query(Article).delete()
    db.query(AgentMemory).delete()
    db.query(AgentLog).delete()
    db.commit()
    print("Database successfully cleared of old articles and agent logs.")
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
