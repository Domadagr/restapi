
from typing import List
from datetime import datetime
import psutil
from data import books
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
import os

from data import books
from data import books
from data.books import getbooks, init_db, db_pool
from pydantic import BaseModel
# Rewrite login handler and JWT generation

app = FastAPI()
start_time = datetime.now()
load_dotenv()

@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await init_db()


# AUTH HANDLER
SECRET_KEY = os.environ.get('SECRET_KEY')
ALGORITHM = os.environ.get('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES')


class LoginRequest(BaseModel):
    username: str
    password: str

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password bearer instance
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Helper function to verify passwords
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Authenticate user
def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user


# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return  encoded_jwt


# Endpoint to generate token
@app.post("/token")
def login(request: LoginRequest):
    # rewrite this
    return None

# Dependency to get the current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return get_user(username)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/api/status", response_model=dict)
def status(current_user: dict = Depends(get_current_user)):
    # Calculate uptime
    uptime = datetime.now() - start_time
    # Get memory usage
    memory_usage = psutil.virtual_memory()._asdict()
    return{
        "status": "Running",
        "uptime": str(uptime),
        "date": datetime.now().isoformat(),
        "memory usage": memory_usage
        }


@app.get("/api/booklist")
async def booklist():
    books = await getbooks()
    return books


@app.post("/api/booklist/addbook")
async def add_book(book: books.Book):
    try:
        new_book = await books.add_book(db_pool, book)
        return new_book
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/booklist/update/{book_id}")
async def update_book(book_id: int, book: books.Book):
    try:
        update = await books.update_book(book_id, book)
        return update
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/booklist/get/{book_id}")
async def get_book(book_id: int):
    try:
        book = await books.get_book_by_id(book_id)
        return book
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/booklist/delete/{book_id}")
async def remove_book(book_id: int):
    try:
        await books.remove_book_by_id(book_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))