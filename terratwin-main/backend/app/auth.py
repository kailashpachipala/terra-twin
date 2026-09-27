import os
import httpx
import jwt
from cryptography.x509 import load_pem_x509_certificate
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from . import models

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "terra-twin-9f022")
ALGORITHM = "RS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Cache certificates in memory to prevent spamming Google's API on every request
GOOGLE_CERTS_CACHE = {}
CERTS_EXPIRATION = 0

def fetch_google_public_keys() -> dict:
    global GOOGLE_CERTS_CACHE
    try:
        response = httpx.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
        if response.status_code == 200:
            GOOGLE_CERTS_CACHE = response.json()
    except Exception as e:
        print(f"Error fetching Google certificates: {e}")
    return GOOGLE_CERTS_CACHE

def verify_firebase_id_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Retrieve 'kid' (Key ID) from unverified header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise credentials_exception
            
        # Fetch certificates (use cached first)
        certs = GOOGLE_CERTS_CACHE if GOOGLE_CERTS_CACHE else fetch_google_public_keys()
        cert_pem = certs.get(kid)
        
        # If not found in cache, fetch fresh certificates
        if not cert_pem:
            certs = fetch_google_public_keys()
            cert_pem = certs.get(kid)
            if not cert_pem:
                raise credentials_exception
                
        # Load public key from certificate PEM
        cert_obj = load_pem_x509_certificate(cert_pem.encode())
        public_key = cert_obj.public_key()
        
        # Decode and verify token parameters
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[ALGORITHM],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        )
        return payload
    except Exception as e:
        print(f"Token verification error: {e}")
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    # If the token is a mock session token, handle fallback for offline runs
    if token == "mock-jwt-token-12345" or token == "mock-jwt-token-auto" or token == "mock-jwt-token-onboarded":
        user = db.query(models.User).filter(models.User.email == "dr.elena.rodriguez@terratwin.ai").first()
        if not user:
            # Auto populate mock user in DB
            user = models.User(
                email="dr.elena.rodriguez@terratwin.ai",
                hashed_password="mock",
                full_name="Dr. Elena Rodriguez",
                role="Senior Agricultural Research Scientist"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    payload = verify_firebase_id_token(token)
    email: str = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing email claim."
        )
        
    user = db.query(models.User).filter(models.User.email == email).first()
    
    # If authenticated via Firebase but does not exist in local SQL database yet, instantiate user record
    if user is None:
        user = models.User(
            email=email,
            hashed_password="firebase_authenticated",
            full_name=payload.get("name", email.split('@')[0]),
            role="Agricultural Enterprise Client"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize default settings
        user_settings = models.Settings(
            user_id=user.id,
            stress_alert=True,
            pest_alert=True,
            weekly_digest=False,
            dark_mode=False
        )
        db.add(user_settings)
        db.commit()

    return user
