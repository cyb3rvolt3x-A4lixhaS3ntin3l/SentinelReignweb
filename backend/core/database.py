from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Handle SQLite specific threading requirements
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Use PostgreSQL native pooling or fallback arguments for SQLite
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    **({"connect_args": connect_args} if connect_args else {})
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
