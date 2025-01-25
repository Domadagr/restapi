import os

from pydantic import BaseModel
from typing import Optional
import asyncpg
import asyncio
from dotenv import load_dotenv

load_dotenv()
db_pool = None

async def init_db():
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_USER_PW'),
            database=os.getenv('DB_NAME'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            min_size=1,
            max_size=10
        )
    return db_pool


async def close_db():
    if db_pool:
        await db_pool.close()


bookID = 3


class Book(BaseModel):
    id: Optional[int] = None,
    title: str
    author: str
    year: int


books = [
    {"id": 1, "title": "The Great Adventure", "author": "John Doe", "year": 2005},
    {"id": 2, "title": "Learning FastAPI", "author": "Jane Smith", "year": 2021},
]


async def getbooks():
    async with db_pool.acquire() as conn:
        return await conn.fetch('SELECT * FROM books')


def add_book(book):
    global bookID
    new_book = {"id": bookID, **book.dict(exclude={"id"})}  # Exclude 'id' from the request
    books.append(new_book)
    bookID += 1
    return new_book


def update_book(book_id, updated_book):
    for i, book in enumerate(books):
        if book['id'] == book_id:
            books[i] = updated_book
            return updated_book
    return None


def get_book_by_id(book_id):
    for i, book in enumerate(books):
        if book['id'] == book_id:
            return book
    return None


def remove_book_by_id(book_id):
    for i, book in enumerate(books):
        if book['id'] == book_id:
            books.pop(i)
            return book_id
    return None

