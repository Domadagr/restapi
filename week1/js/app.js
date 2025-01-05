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
    res.status(200).send(books.getBooks(req));
});

const verifyPayload = ((req, res, next) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year || !genre) {
        return res.status(400).send({ error: "All fields required: Title, Author, Year, Genre" });
    }
    next();
});

app.post("/api/addbook", authenticateToken, verifyPayload, (req, res) => {
    const newBook = books.addBook(req.body);
    res.status(201).send(newBook);
})

app.patch("/api/booklist/patch/:id", (req, res) => {
    const patch = req.body;
    const reqID = parseInt(req.params.id);

    const bookIndex = bookArray.findIndex(book => book.id === reqID);
    if (bookIndex === -1) {
        res.status(404).send({ error: "Book not found" });
    }

    bookArray[bookIndex] = { ...bookArray[bookIndex], ...patch };
    res.status(201).send(bookArray[bookIndex]);

});

app.get('/api/booklist/:id', (req, res) => {
    const reqID = req.params.id;
    try {
        const book = bookArray.find(book => book.id === parseInt(reqID));
        if(!book) {
            throw new Error("Book ID " + reqID + " not found");
        }
        res.status(200).send(book);        
    } catch (error) {
        res.status(404).send({ error: "Book not found" });
    }
});

app.delete('/api/booklist/deletebook/:id', authenticateToken, (req, res) => {
    const reqID = parseInt(req.params.id);
    const bookIndex = bookArray.findIndex(book => book.id === reqID);

    if (bookIndex === -1) {
        return res.status(404).send({ error: "Book not found" });
    }

    bookArray.splice(bookIndex, 1);
    return res.status(200).send({ message: `Book with ${reqID} has been removed` });
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

