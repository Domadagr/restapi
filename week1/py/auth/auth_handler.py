# week1/py/auth/auth_handler.py
import time
from typing import Dict

import jwt
from decouple import config


JWT_SECRET = config("secret")
JWT_ALGORITHM = config("algorithm")

def sign_jwt(user_id: str,) -> Dict[str, str]:
    payload = {
        "user_id": user_id,
        "expires": time.time() + 1800
    }
