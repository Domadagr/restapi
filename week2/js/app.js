const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const sql = require('postgres');
// local
const books = require('./data/books');
const lh = require('./login');

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
//const testUser = "Domadager";
//console.log(generateAccessToken(testUser));

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

// Bcrypt
const saltRounds = 10;
const plainPassword = "testing123";


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

app.post("/api/login", async (req, res) => {
    const user = req.body.user;
    const pw = req.body.password;
    if (lh.loginHandler(user, pw)) {
        console.log(generateAccessToken(user));
    }


});

app.get("/api/booklist", async (req, res) => {
    const booklist = await books.getBooklist();
    res.json(booklist);
});

app.post("/api/booklist/addbook", authenticateToken, books.verifyPayload, async (req, res) => {
    const newBook = await books.addBook(req.body);
    res.status(201).json(newBook);
});

app.patch("/api/booklist/patch/:id", async (req, res) => {
    const reqID = parseInt(req.params.id);
    const patchedBook = await books.patchBook(reqID, req.body);
    res.status(200).send(patchedBook);
});

app.get('/api/booklist/:id', async (req, res) => {
    const book = await books.getBook(parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
});

app.delete('/api/booklist/deletebook/:id', authenticateToken, async (req, res) => {
    const book = await books.deleteBook(parseInt(req.params.id));
    if (!book) {
        res.status(404).send({ error: "Book not found" });
    }
    res.json(book);
});


async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('Connection successful:', result);
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

testConnection();
