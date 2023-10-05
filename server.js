const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Allow requests from http://127.0.0.1:5503
const allowedOrigins = ['http://127.0.0.1:5503'];

app.use(cors({
    origin: allowedOrigins,
}));

// Define a sample route
app.get('/sample', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
