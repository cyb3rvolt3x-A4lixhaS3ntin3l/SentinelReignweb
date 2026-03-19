import os
import aiohttp
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import APIKey, OAuthToken, User
from core.config import settings
import google_auth_oauthlib.flow
from core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active or user.role.value != "admin":
        raise HTTPException(status_code=400, detail="Inactive user or insufficient permissions")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Use environment variables or a default path for the client secrets file
CLIENT_SECRETS_FILE = os.environ.get("GOOGLE_CLIENT_SECRETS_FILE", "backend/client_secrets.json")
# Google Generative Language API scope
SCOPES = ['https://www.googleapis.com/auth/generative-language.retriever']

@router.get("/gemini/login")
def gemini_oauth_login(request: Request):
    """
    Initiates the proper Google OAuth2 flow to get permission for the Gemini API.
    """
    if not os.path.exists(CLIENT_SECRETS_FILE):
        return {"error": "Missing client_secrets.json", "message": "Create a Google Cloud Project, enable Generative Language API, create Desktop/Web OAuth credentials, and save as client_secrets.json in backend directory."}
        
    # Set up the OAuth2 flow
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    
    # Indicate where the API server will redirect the user after the user completes the authorization flow
    # Typically this must match exactly what is registered in Google Cloud Console
    flow.redirect_uri = "http://localhost:8000/auth/gemini/oauth"
    
    # Generate URL for request to Google's OAuth 2.0 server
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent' # Force consent to ensure we get a refresh token
    )
    
    return {"authorization_url": authorization_url}

@router.get("/gemini/oauth")
def gemini_oauth_callback(state: str, code: str, request: Request, db: Session = Depends(get_db)):
    """
    The actual callback catching the code and exchanging for real Google OAuth tokens.
    """
    try:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
            
        flow.redirect_uri = "http://localhost:8000/auth/gemini/oauth"
        
        # Trade code for access token
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        
        # Store in database
        token_record = db.query(OAuthToken).filter(OAuthToken.service_name == 'gemini_api').first()
        if not token_record:
            token_record = OAuthToken(service_name='gemini_api')
            db.add(token_record)
            
        token_record.access_token = credentials.token
        if credentials.refresh_token:
            token_record.refresh_token = credentials.refresh_token
            
        db.commit()
        return {"message": "Gemini API Successfully Linked via Google OAuth.", "refresh_token_saved": bool(credentials.refresh_token)}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Flow Failed: {str(e)}")
