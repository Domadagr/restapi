from fastapi import FastAPI
from typing import List
from datetime import datetime
import psutil
from data import books

app = FastAPI()
start_time = datetime.now()


@app.get("/api/status", response_model=dict)
def status():
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


