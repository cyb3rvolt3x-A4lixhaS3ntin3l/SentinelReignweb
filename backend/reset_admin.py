import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.user import User, UserRole

def reset_admins():
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            db.delete(admin)
        db.commit()
        print("✅ Deleted all existing admin users.")
    except Exception as e:
        print(f"❌ Error deleting admins: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admins()
