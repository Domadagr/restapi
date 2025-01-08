let bookArray = [];
let bookID = 0;

const getBooklist = ((req) => {
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

const verifyPayload = ((req, res, next) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year || !genre) {
        return res.status(400).send({ error: "All fields required: Title, Author, Year, Genre" });
    }
    next();
});

const patchBook = ((reqID, patch) => {

    const bookIndex = bookArray.findIndex(book => book.id === reqID);
    if (bookIndex === -1) {
        return null;
    }

    bookArray[bookIndex] = { ...bookArray[bookIndex], ...patch };
    return bookArray[bookIndex];
});

const getBook = ((req) => {
    const reqID = parseInt(req.params.id);
    const book = bookArray.find(book => book.id === reqID);
    if (!book) {
        return null;
    }
    return book;
});

const deleteBook = ((req) => {
    const reqID = parseInt(req.params.id);
    const bookIndex = bookArray.findIndex(book => book.id === reqID);

    if (bookIndex === -1) {
        return null;
    }
    return bookArray.splice(bookIndex, 1);
});

module.exports = { getBooklist, addBook, verifyPayload, patchBook, getBook, deleteBook };