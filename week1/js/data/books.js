let bookArray = [];
let bookID = 0;

// Added a couple of initial books
bookArray.push({
    "id": bookID++,
    "title": "lets make it count", 
    "author": "pointy pencil", 
    "year": 1992, 
    "genre": "sci-fi"
});
bookArray.push({
    "id": bookID++,
    "title": "lizard people", 
    "author": "tinfoil hat", 
    "year": 2017, 
    "genre": "sci-fi"
});
bookArray.push({
    "id": bookID++,
    "title": "Divergent Aperture Harmonics", 
    "author": "Domadagr", 
    "year": 2025, 
    "genre": "biography"
});

const getBooks = ((req) => {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    return {
        totalBooks: bookArray.length,
        books: bookArray.slice(startIndex, endIndex)
    };
});

const addBook = ((book) => {
    const newBook = { "id": bookID++, ...book };
    bookArray.push(newBook);
    return newBook;
});

module.exports = { getBooks, addBook };