# backend/main.py

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import models
from db.database import SessionLocal, engine
import os
from dotenv import load_dotenv
import logging
import pymysql
from jose.exceptions import ExpiredSignatureError

load_dotenv()

# Logger Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SECRET_KEY for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# Enable CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

# Pydantic Schema for User
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Dependency to Get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    except pymysql.err.OperationalError as e:
        logger.error(f"MySQL Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection lost")
    except Exception as e:
        logger.error(f"Error during database operation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

# Pydantic model for updating user profile
class UserUpdate(BaseModel):
    name: str

# Function to verify JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            logger.error("Invalid token: No email found in payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except ExpiredSignatureError:
        logger.error("Token validation failed: Token has expired")
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except JWTError as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not validate token")

# Hash Password
def hash_password(password: str):
    return pwd_context.hash(password)

# Create JWT Token
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Register a new user
@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Received registration request: {user.dict()}")

        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password and create new user
        hashed_password = hash_password(user.password)
        new_user = models.User(name=user.name, email=user.email, password=hashed_password, is_authenticated=False)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"User {new_user.email} registered successfully")

        # Generate a token
        access_token = create_access_token(data={"sub": new_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

        return {
            "message": "User registered successfully",
            "name": new_user.name,
            "email": new_user.email,
            "is_authenticated": new_user.is_authenticated,
            "token": access_token
        }

    except pymysql.err.OperationalError as e:
        logger.error(f"MySQL Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection lost. Please try again.")
    
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Login user
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login request received for email: {user.email}")

        # Fetch user from database
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if not db_user or not pwd_context.verify(user.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        db_user.is_authenticated = True
        db.commit()
        
        # Create token
        access_token = create_access_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

        return {
            "message": "Login successful",
            "user": {
                "name": db_user.name,
                "email": db_user.email,
                "is_authenticated": db_user.is_authenticated,
                "token": access_token
            }
        }

    except pymysql.err.OperationalError as e:
        logger.error(f"MySQL Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection lost. Please try again.")

    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Update user profile endpoint
@app.post("/update-profile")
def update_profile(
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    authorization: str = Header(default=None)  # Fixed Header Parsing
):
    if not authorization or not authorization.startswith("Bearer "):
        logger.error("Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = authorization.replace("Bearer ", "", 1)  # Extract token safely
    user_email = verify_token(token)  # Validate token and extract email

    db_user = db.query(models.User).filter(models.User.email == user_email).first()
    if not db_user:
        logger.error(f"User not found for email: {user_email}")
        raise HTTPException(status_code=404, detail="User not found")

    db_user.name = user_update.name
    db.commit()
    db.refresh(db_user)

    logger.info(f"Profile updated successfully for {user_email}")

    return {"message": "Profile updated successfully", "name": db_user.name, "email": db_user.email}

class LogoutRequest(BaseModel):
    email: str

@app.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update is_authenticated status
        user.is_authenticated = False
        db.commit()

        logger.info(f"User {request.email} logged out successfully")
        return {"message": "Logout successful", "success": True}

    except pymysql.err.OperationalError as e:
        logger.error(f"MySQL Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection lost. Please try again.")

    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")