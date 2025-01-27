const express = require('express');
const { body, param, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const sql = require('postgres');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// local
const books = require('./data/books');
const lh = require('./login');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

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
            const token = await lh.generateAccessToken(user);
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
    lh.authenticateToken('admin', 'editor'), async (req, res) => {
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
            .toInt(),
            body('title')
            .isLength({ max: 255 }).withMessage('Title must not exceed 100 characters'),
            body('author')
            .isLength({ max: 255 }).withMessage('Author must not exceed 100 characters'),
            body('year')
            .isInt({ min: 1400, max: 2060 }).withMessage('Year must be a number'),
            body('genre')
            .isLength({ max: 100 }).withMessage('Genre must not exceed 100 characters'),
    ], 
    lh.authenticateToken('admin', 'editor'), async (req, res) => {
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
            .toInt(),
    ],  
    lh.authenticateToken('admin', 'editor', 'user'), async (req, res) => {
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
    lh.authenticateToken('admin'), async (req, res) => {
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
module.exports = app;
