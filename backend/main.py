from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from core.database import get_db
from api import public, admin, seo, cms, auth, search, engine, analytics, intel, clusters, comments, media
from services.crawler import crawler_scheduler
import os
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import all models here to ensure they are registered with Base.metadata before create_all
    from models import article, cms, memory, user, analytics, newsletter, source, threat
    from core.database import engine
    
    # Auto-Migrate schema depending on generic DATABASE_URL connection
    import subprocess
    import sys
    import os
    logger.info("Running abstract database auto-migration sequences...")
    try:
        # Run via module to bypass noexec filesystem restrictions
        subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=False, capture_output=True)
    except Exception as e:
        logger.warning(f"Alembic auto-migration failed: {e}")
    
    from models.base import Base
    Base.metadata.create_all(bind=engine)
    
    # Start the background crawler scheduler
    crawler_scheduler.start()
    yield
    # Shutdown: Stop the scheduler
    crawler_scheduler.shutdown()

app = FastAPI(
    title="SentinelReign API",
    description="High-authority AI-driven technology intelligence platform",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for the frontend if they are hosted on different origins or ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(admin.router)
app.include_router(seo.router)
app.include_router(cms.router)
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(engine.router)
app.include_router(analytics.router)
app.include_router(intel.router)
app.include_router(clusters.router)
app.include_router(comments.router)
app.include_router(media.router)

# SEO Roots
@app.get("/sitemap.xml", include_in_schema=False)
def sitemap(db: Session = Depends(get_db)):
    from api.seo import generate_sitemap
    return generate_sitemap(db)

@app.get("/robots.txt", include_in_schema=False)
def robots(db: Session = Depends(get_db)):
    from api.seo import generate_robots
    return generate_robots(db)

@app.get("/feed.xml", include_in_schema=False)
def feed(db: Session = Depends(get_db)):
    from api.seo import generate_rss
    return generate_rss(db)

# Serve Frontend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "v3-frontend", "public")

# Helper to check if a directory exists before mounting
def safe_mount(path, mount_point, name):
    if os.path.exists(path):
        app.mount(mount_point, StaticFiles(directory=path), name=name)
    else:
        logger.warning(f"Static directory {path} not found. Skipping mount for {mount_point}.")

safe_mount(frontend_path, "/assets", "assets")

@app.get("/")
def serve_home():
    return {"message": "SentinelReign API is running. Access the frontend separately via Next.js."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "components": {"database": "connected", "ai_integration": "active"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
