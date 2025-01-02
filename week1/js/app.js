const express = require('express');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Start a listener
app.listen(PORT, () => {
    console.log("Server listening on PORT:", PORT);
});

app.get("/api/status", (req, res) => {
    const status = {
        "Status": "Running"
    }
});






let bookArray = [];

// Added a couple of initial books
bookArray.push({
    "title": "lets make it count", 
    "author": "pointy pencil", 
    "year": 1992, 
    "genre": "sci-fi"
});
bookArray.push({
    "title": "lizard people", 
    "author": "tinfoil hat", 
    "year": 2017, 
    "genre": "sci-fi"
});
console.log(bookArray);

