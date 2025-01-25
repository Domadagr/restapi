import os
<<<<<<< HEAD

from pydantic import BaseModel
=======
from http.client import HTTPException

from asyncpg import Pool
from pydantic import BaseModel, Field, field_validator
>>>>>>> 11fc9c2117f4fa4af8c054f9f5b0c0d05a637c14
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


<<<<<<< HEAD
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
=======
class Book(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    year: int = Field(..., ge=1000, le=2100)
    genre: Optional[str] = Field(None, max_length=100)

    @field_validator("title", "author")
    def no_empty_strings(self, value):
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value

    @field_validator('year')
    def no_empty_year(self, value):
        if value > 2100 or value < 1000:
            raise ValueError("Value out of bounds")
        return value

async def getbooks():
    async with db_pool.acquire() as conn:
        try:
            booklist = await conn.fetch('SELECT * FROM books')
            return booklist
        except Exception as e:
            raise RuntimeError(f"Error fetching list {e}")


async def add_book(pool: Pool, book: Book):
    async with pool.acquire() as conn:
        try:
            query = """
            INSERT INTO books(title, author, year, genre)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            """
            result = await conn.fetchrow(query, book.title, book.author, book.year, book.genre)
            return dict(result)
        except Exception as e:
            raise RuntimeError(f"Error inserting item: {e}")


async def update_book(book_id: int, book: Book):
    async with db_pool.acquire() as conn:
        try:
            query = """
            UPDATE books 
            SET title = $1, author = $2, year = $3, genre = $4
            WHERE id = $5
            RETURNING *;
            """
            result = await conn.fetchrow(query, book.title, book.author, book.year, book.genre, book_id)
            if result:
                return dict(result)
            else:
                raise RuntimeError(f"Book with id {book_id} not found.")
        except Exception as e:
            raise RuntimeError(f"Error inserting item: {e}")


async def get_book_by_id(book_id):
  async with db_pool.acquire() as conn:
      try:
          query = """
          SELECT * FROM books
          WHERE id = $1;
          """
          result = await conn.fetchrow(query, book_id)
          if result:
              return dict(result)
          else:
              raise RuntimeError(f"Book with id {book_id} not found.")
      except Exception as e:
          raise  RuntimeError(f"Error finding item: {e}")


async def remove_book_by_id(book_id):
    async with db_pool.acquire() as conn:
        try:
            query = """
            DELETE FROM books
            WHERE id = $1
            LIMIT 1
            """
            await conn.execute(query, book_id)
        except Exception as e:
            raise RuntimeError(f"Error deleting entry: {e}")
>>>>>>> 11fc9c2117f4fa4af8c054f9f5b0c0d05a637c14

