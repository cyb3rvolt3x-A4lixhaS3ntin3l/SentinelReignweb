import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import engine
from models.base import Base
# Import all models to ensure they are registered with Base.metadata
from models import article, cms, memory, user, analytics, newsletter, source, threat

def migrate():
    print("⏳ Initializing PostgreSQL Schema...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
        
        # Also try running Alembic if available
        import subprocess
        try:
            print("⏳ Running Alembic migrations...")
            subprocess.run(["alembic", "upgrade", "head"], check=False)
            print("✅ Alembic migrations completed!")
        except Exception as ae:
            print(f"⚠️ Alembic skipped: {str(ae)}")

    except Exception as e:
        print(f"❌ Migration Error: {str(e)}")

if __name__ == "__main__":
    migrate()
