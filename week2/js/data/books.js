// Using postgresql 
const sql = require('../db.js');

const getBooklist = async () => {
    return await sql`select * from books`;
};

const addBook = async (book) => {
    return await sql`
    INSERT INTO books (title, author, year, genre)
    VALUES (${book.title}, ${book.author}, ${book.year}, ${book.genre})
    RETURNING *`;
};

const verifyPayload = ((req, res, next) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year || !genre) {
        return res.status(400).send({ error: "All fields required: Title, Author, Year, Genre" });
    }
    next();
});

const patchBook = async (reqID, patch) => {
    const [updateBook] = await sql`
    UPDATE books
    SET title = ${patch.title}, author = ${patch.author}, year = ${patch.year}, genre = ${patch.genre}
    WHERE id = ${reqID}
    RETURNING *`;
    return updateBook;
};

const getBook = async (id) => {
    const [book] = await sql`
        SELECT * FROM books
        WHERE id = ${id}`;

    return book;
};

const deleteBook = async (id) => {
    const [book] = await sql`
    DELETE FROM books
    WHERE id = ${id}
    RETURNING *`;

    return book;
};

module.exports = { getBooklist, addBook, verifyPayload, patchBook, getBook, deleteBook };