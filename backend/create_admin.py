import sys
import os
from passlib.context import CryptContext

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.user import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin(username, email, password):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"❌ User '{username}' already exists.")
            return

        hashed_pw = pwd_context.hash(password)
        new_admin = User(
            username=username,
            email=email,
            hashed_password=hashed_pw,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print(f"✅ Admin user '{username}' created successfully!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 create_admin.py <username> <email> <password>")
    else:
        create_admin(sys.argv[1], sys.argv[2], sys.argv[3])
