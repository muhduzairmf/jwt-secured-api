// Import express and initialiaze express app
const express = require("express");
const app = express();

// Import dotenv and cofigure usage of .env file
const dotenv = require("dotenv");
dotenv.config();

// Use express.json() function to get and send json
app.use(express.json());

// A route for root
app.get("/", (req, res) => {
    res.json({ message: "Hello, World" });
});

// Import and use routes from routes/auth.js
app.use("/auth", require("./routes/auth"));

// Import and use routes from routes/posts.js
app.use("/post", require("./routes/posts"));

// Import and use routes from routes/users.js
app.use("/user", require("./routes/users"));

// Set up a port for this server
app.listen(3275, () => {
    console.log("Server is listening on http://localhost:3275");
});
