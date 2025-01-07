from pydantic import BaseModel
from typing import Optional

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


def getbooks():
    return books


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

