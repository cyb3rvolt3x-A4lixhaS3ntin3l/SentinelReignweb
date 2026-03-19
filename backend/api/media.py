from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
import os
import shutil
from typing import List
from core.database import get_db

from core.security import get_current_active_admin

router = APIRouter(prefix="/api/admin/media", tags=["admin-media"])

IMAGE_DIR = os.path.join(os.path.dirname(__file__), "../../frontend/assets/images")

@router.get("/")
def list_media(admin_user = Depends(get_current_active_admin)):
    """
    Lists all intelligence assets (images) stored on the system.
    """
    if not os.path.exists(IMAGE_DIR):
        return {"data": []}
    
    files = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))]
    media_list = []
    for f in files:
        stats = os.stat(os.path.join(IMAGE_DIR, f))
        media_list.append({
            "name": f,
            "url": f"/assets/images/{f}",
            "size": stats.st_size,
            "modified": stats.st_mtime
        })
    
    # Sort by modification time desc
    media_list.sort(key=lambda x: x['modified'], reverse=True)
    return {"data": media_list}

@router.post("/upload")
async def upload_media(file: UploadFile = File(...), admin_user = Depends(get_current_active_admin)):
    """
    Handles the transmission of new intelligence assets to the platform.
    """
    if not os.path.exists(IMAGE_DIR):
        os.makedirs(IMAGE_DIR, exist_ok=True)
    
    # Sanitize filename
    filename = os.path.basename(file.filename)
    path = os.path.join(IMAGE_DIR, filename)
    
    # Prevent overwriting critical system files if any
    if os.path.exists(path):
         # Add timestamp to name if exists
         name, ext = os.path.splitext(filename)
         import time
         filename = f"{name}_{int(time.time())}{ext}"
         path = os.path.join(IMAGE_DIR, filename)

    try:
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
        
    return {
        "status": "success", 
        "filename": filename, 
        "url": f"/assets/images/{filename}"
    }

@router.delete("/{filename}")
def delete_media(filename: str, admin_user = Depends(get_current_active_admin)):
    """
    Purges an intelligence asset from the disk.
    """
    # Security: Prevent path traversal
    filename = os.path.basename(filename)
    path = os.path.join(IMAGE_DIR, filename)
    
    if os.path.exists(path):
        os.remove(path)
        return {"status": "success", "message": f"Asset {filename} purged."}
    else:
        raise HTTPException(status_code=404, detail="Asset not found")
