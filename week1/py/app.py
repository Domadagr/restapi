
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

app = FastAPI()
start_time = datetime.now()

# AUTH HANDLER
SECRET_KEY="SECRET_SAUCE"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

fake_users_db = {
    "testuser": {
        "username": "testuser",
        "hashed_password": "$2b$12$KIXQJkK2J3hxG1/JTZZ7gOa7Z2.bTfQaQi9gY8opLgfKwqKPPogkS",  # "password"
    }
}

from pydantic import BaseModel

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


# Get user from fake DB
def get_user(username: str):
    user = fake_users_db.get(username)
    if user:
        return {"username": username, **user}
    return None


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
    if request.username == "testuser" and request.password == "password":
        # Replace this with actual user validation logic
        access_token = create_access_token(data={"sub": request.username})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")


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
def booklist():
    return books.getbooks()


@app.post("/api/booklist/addbook")
def add_book(book: books.Book):
    return books.add_book(book)


@app.put("/api/booklist/update/{book_id}")
def update_book(book_id: int, book: books.Book):
    return books.update_book(book_id, book)


@app.get("/api/booklist/get/{book_id}")
def get_book(book_id: int):
    return books.get_book_by_id(book_id)


@app.delete("/api/booklist/delete/{book_id}")
def remove_book(book_id: int):
    return books.remove_book_by_id(book_id)