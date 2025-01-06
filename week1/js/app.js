const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const books = require('./data/books');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
let bookID = 0;

// Get config variables
dotenv.config();
process.env.TOKEN_SECRET;

// Token generation :: using digitalocean tutorial for JWT
const generateAccessToken = ((username) => {
    const payload = { user: username }
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
})
// Generate a token that can be used with postman for testing
const testUser = "Domadager";
console.log(generateAccessToken(testUser));

// Authenticate token using express.js middleware
const authenticateToken = ((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.status(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403);
        req.user = user;
        next();
    });
});

// Start a listener
app.listen(PORT, () => {
    console.log("Server listening on PORT:", PORT);
});

app.get("/api/status", (req, res) => {
    res.status(200).send({
        status: "Running",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        date: new Date()
    });
});

app.get("/api/booklist", (req, res) => {
    res.status(200).send(books.getBooklist(req));
});

app.post("/api/booklist/addbook", authenticateToken, books.verifyPayload, (req, res) => {
    const newBook = books.addBook(req.body);
    res.status(201).send(newBook);
});

app.patch("/api/booklist/patch/:id", (req, res) => {
    const patch = req.body;
    const reqID = parseInt(req.params.id);
    const update = books.patchBook(reqID, patch);
    if (!books.patchBook(reqID, patch)) {
        return res.status(404).send({ error: "Book not found" });
    }
    res.status(201).send(update);
});

app.get('/api/booklist/:id', (req, res) => {
    const book = books.getBook(req);
    if (!books.getBook(req)) {
        return res.status(404).send({ error: "Book not found" });
    }
    res.status(200).send(book);
});

app.delete('/api/booklist/deletebook/:id', authenticateToken, (req, res) => {
    const book = books.deleteBook(req);
    if (!book) {
        return res.status(404).send({ error: "Book not found" });
    }
    res.status(200).send(book);
});



let bookArray = [];

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

