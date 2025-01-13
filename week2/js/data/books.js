// Using postgresql 
const sql = require('../db.js');

const getBooklist = async () => {
    try {
        const booklist = await sql`select * from books`;
        return booklist;
    } catch (error) {
        throw new Error("Failed to get list, try again later");
    }
};

const addBook = async (book) => {
    try {
        const result = await sql`
        INSERT INTO books (title, author, year, genre)
        VALUES (${book.title}, ${book.author}, ${book.year}, ${book.genre})
        RETURNING *`;
        return result;
    } catch (error) {
        throw new Error("Failed to add book, try again later");
    }
};

const patchBook = async (reqID, patch) => {
    try {
        const [updateBook] = await sql`
        UPDATE books
        SET title = ${patch.title}, author = ${patch.author}, year = ${patch.year}, genre = ${patch.genre}
        WHERE id = ${reqID}
        RETURNING *`;
        return updateBook;
    } catch (error) {
        throw new Error("Failed to update book, try again later");
    } 
};

const getBook = async (id) => {
    try {
        const [book] = await sql`
        SELECT * FROM books
        WHERE id = ${id}`;

    return book;
    } catch (error) {
        throw new Error("Failed to retrieve book, try again later");
    } 
};

const deleteBook = async (id) => {
    try {
        const [book] = await sql`
        DELETE FROM books
        WHERE id = ${id}
        RETURNING *`;
    
        return book;
    } catch (error) {
        throw new Error("Failed to delete book, try again later");
    } 
};

module.exports = { getBooklist, addBook, patchBook, getBook, deleteBook };