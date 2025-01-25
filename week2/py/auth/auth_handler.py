# week1/py/auth/auth_handler.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

# Simulated user database
fake_users_db = {
    "testuser": {
        "username": "testuser",
        "hashed_password": "$2b$12$KIXQJkK2J3hxG1/JTZZ7gOa7Z2.bTfQaQi9gY8opLgfKwqKPPogkS",  # "password"
    }
}