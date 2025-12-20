from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production-' + str(uuid.uuid4()))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# =============================================================================
# MODELS
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "user"  # user or admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TripCreate(BaseModel):
    title: str
    destination: str
    duration: str
    price: float
    description: str
    image: str

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    destination: str
    duration: str
    price: float
    description: str
    image: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    trip_id: str
    travel_date: str
    travelers: int

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    trip_id: str
    trip_title: str
    travel_date: str
    travelers: int
    status: str = "pending"  # pending, confirmed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    reply: Optional[str] = None
    status: str = "pending"  # pending, replied
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactReply(BaseModel):
    reply: str

class BookingStatusUpdate(BaseModel):
    status: str

class DashboardStats(BaseModel):
    total_trips: int
    total_bookings: int
    pending_bookings: int
    total_contacts: int

# =============================================================================
# AUTHENTICATION HELPERS
# =============================================================================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    return current_user

# =============================================================================
# AUTH ROUTES
# =============================================================================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role="user"
    )
    
    # Hash password and store
    user_doc = user.model_dump()
    user_doc['password_hash'] = get_password_hash(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user_doc['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Convert datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password_hash'})
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# =============================================================================
# TRIP ROUTES
# =============================================================================

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate, admin: User = Depends(get_admin_user)):
    trip = Trip(**trip_data.model_dump())
    trip_doc = trip.model_dump()
    trip_doc['created_at'] = trip_doc['created_at'].isoformat()
    
    await db.trips.insert_one(trip_doc)
    return trip

@api_router.get("/trips", response_model=List[Trip])
async def get_all_trips():
    trips = await db.trips.find({}, {"_id": 0}).to_list(1000)
    
    for trip in trips:
        if isinstance(trip['created_at'], str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return trips

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip_by_id(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    if isinstance(trip['created_at'], str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return Trip(**trip)

@api_router.put("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip_data: TripCreate, admin: User = Depends(get_admin_user)):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    updated_data = trip_data.model_dump()
    await db.trips.update_one({"id": trip_id}, {"$set": updated_data})
    
    trip.update(updated_data)
    if isinstance(trip['created_at'], str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return Trip(**trip)

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, admin: User = Depends(get_admin_user)):
    result = await db.trips.delete_one({"id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    return {"message": "Trip deleted successfully"}

# =============================================================================
# BOOKING ROUTES
# =============================================================================

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: User = Depends(get_current_user)):
    # Get trip details
    trip = await db.trips.find_one({"id": booking_data.trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    booking = Booking(
        user_id=current_user.id,
        user_email=current_user.email,
        trip_id=booking_data.trip_id,
        trip_title=trip['title'],
        travel_date=booking_data.travel_date,
        travelers=booking_data.travelers,
        status="pending"
    )
    
    booking_doc = booking.model_dump()
    booking_doc['created_at'] = booking_doc['created_at'].isoformat()
    
    await db.bookings.insert_one(booking_doc)
    return booking

@api_router.get("/bookings/my", response_model=List[Booking])
async def get_user_bookings(current_user: User = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    
    return bookings

@api_router.get("/bookings", response_model=List[Booking])
async def get_all_bookings(admin: User = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    
    return bookings

@api_router.patch("/bookings/{booking_id}/status", response_model=Booking)
async def update_booking_status(booking_id: str, status_data: BookingStatusUpdate, admin: User = Depends(get_admin_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status_data.status}})
    
    booking['status'] = status_data.status
    if isinstance(booking['created_at'], str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    
    return Booking(**booking)

# =============================================================================
# CONTACT ROUTES
# =============================================================================

@api_router.post("/contact", response_model=Contact)
async def submit_contact(contact_data: ContactCreate):
    contact = Contact(**contact_data.model_dump())
    contact_doc = contact.model_dump()
    contact_doc['created_at'] = contact_doc['created_at'].isoformat()
    
    await db.contacts.insert_one(contact_doc)
    return contact

@api_router.get("/contact", response_model=List[Contact])
async def get_all_contacts(admin: User = Depends(get_admin_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    
    for contact in contacts:
        if isinstance(contact['created_at'], str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

@api_router.patch("/contact/{contact_id}/reply", response_model=Contact)
async def reply_to_contact(contact_id: str, reply_data: ContactReply, admin: User = Depends(get_admin_user)):
    contact = await db.contacts.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found"
        )
    
    await db.contacts.update_one(
        {"id": contact_id},
        {"$set": {"reply": reply_data.reply, "status": "replied"}}
    )
    
    contact['reply'] = reply_data.reply
    contact['status'] = "replied"
    if isinstance(contact['created_at'], str):
        contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return Contact(**contact)

# =============================================================================
# DASHBOARD STATS
# =============================================================================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(admin: User = Depends(get_admin_user)):
    total_trips = await db.trips.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    total_contacts = await db.contacts.count_documents({})
    
    return DashboardStats(
        total_trips=total_trips,
        total_bookings=total_bookings,
        pending_bookings=pending_bookings,
        total_contacts=total_contacts
    )

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def create_admin_user():
    # Create default admin if not exists
    admin = await db.users.find_one({"email": "admin@tripplanner.com"})
    if not admin:
        admin_user = User(
            email="admin@tripplanner.com",
            name="Admin User",
            role="admin"
        )
        admin_doc = admin_user.model_dump()
        admin_doc['password_hash'] = get_password_hash("admin123")
        admin_doc['created_at'] = admin_doc['created_at'].isoformat()
        await db.users.insert_one(admin_doc)
        logger.info("Default admin user created: admin@tripplanner.com / admin123")
