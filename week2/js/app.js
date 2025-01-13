const express = require('express');
const { body, param, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const sql = require('postgres');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

// Swagger

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Book API",
            version: "1.0.0",
        },
    },
    apis: ["./*.js", "./books/*.js"], 
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Token generation :: using digitalocean tutorial for JWT
const generateAccessToken = ((username) => {
    const payload = { user: username }
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
})

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

app.post("/api/login",
    [
        body('user').isString().withMessage('Email must be a string').trim().notEmpty().withMessage('Email is required'),
        body('password').isString().withMessage('Password must be a string').trim().notEmpty().withMessage('Password is required'),
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
    try {
        const user = req.body.user;
        const pw = req.body.password;
        const authorized = await lh.loginHandler(user, pw);
        if (authorized) {
            token = generateAccessToken(user);
            res.status(200).send({ token });
        } else {
            res.status(401).send({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


app.get("/api/booklist", async (req, res) => {
    try {
        const booklist = await books.getBooklist();
        res.status(200).send(booklist);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


app.post("/api/booklist/addbook",
    [
        body('title').isString().withMessage('Title must be a string').trim().notEmpty().withMessage('Title is required'),
        body('author').isString().withMessage('Author must be a string').trim().notEmpty().withMessage('Author is required'),
        body('year').isInt({ min: 0 }).withMessage('Year must be a positive integer').trim().notEmpty().withMessage('Year is required'),
        body('genre').optional().isString().withMessage('Genre must be a string'),
    ],
    authenticateToken, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
    try {
        const newBook = await books.addBook(req.body);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


app.patch("/api/booklist/patch/:id",
    [
        param('id')
            .isInt({ min: 0 }).withMessage('ID must be a positive integer')
            .toInt()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
    try {
        const reqID = parseInt(req.params.id);
        const patchedBook = await books.patchBook(reqID, req.body);
        res.status(200).send(patchedBook);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/api/booklist/:id',
    [
        param('id')
            .isInt({ min: 0 }).withMessage('ID must be a positive integer')
            .toInt()
    ],  
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
    try {
        const book = await books.getBook(parseInt(req.params.id));
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.json(book);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.delete('/api/booklist/deletebook/:id',
    [
        param('id')
            .isInt({ min: 0 }).withMessage('ID must be a positive integer')
            .toInt()
    ],
    authenticateToken, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.status(400).json({ error: errors.array() });
        }
    try {
        const book = await books.deleteBook(parseInt(req.params.id));
        if (!book) {
            res.status(404).send({ error: "Book not found" });
        }
        res.json(book);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('Connection successful:');
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

testConnection();
