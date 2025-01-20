import os
from http.client import HTTPException

from asyncpg import Pool
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


class Book(BaseModel):
    title: str
    author: str
    year: int
    genre: str


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

