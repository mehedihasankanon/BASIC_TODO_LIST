const express = require("express");
const app = express();
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

import {
  generateJwtToken,
  verifyJwtToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./utils/jwt.js";

const { pool } = require("../db.js");

// middleware
app.use(cors());
app.use(express.json());

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyJwtToken(token);

    if (!decoded) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error.message);
  }
};

// routes

// register route

const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user exists already
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert the new user into the database
    const newUser = await pool.query(
      "INSERT into users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    // now we need to generate a jwt for the user
    const token = generateJwtToken(newUser.rows[0].user_id, email);
    const refreshToken = generateRefreshToken(newUser.rows[0].user_id, email);

    return res.status(201).json({
      message: "User registered successfully",
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error.message);
  }
});

// login route

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res
        .status(409)
        .json({ message: "User not found. Register first." });
    }

    // returns a boolean to check if the password is correct
    const validPass = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );

    if (!validPass) {
      return res.status(409).json({ message: "Incorrect password" });
    }

    // jwt generation
    const token = generateJwtToken(user.rows[0].user_id, email);
    const refreshToken = generateRefreshToken(user.rows[0].user_id, email);

    return res.status(200).json({
      message: "Login successful",
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error.message);
  }
});

// refresh route

app.post("/auth/refresh", authenticateJWT, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newToken = generateJwtToken(decoded.userId, decoded.email);

    return res.status(200).json({ token: newToken });
  } catch (error) {
    console.error(error.message);
  }
});

// create a todo

app.post("/todos", authenticateJWT, async (req, res) => {
  // waits for the function to complete before it continues

  try {
    // console.log(req.body);

    const { description } = req.body;

    const newTodo = await pool.query(
      "INSERT INTO todo (description, user_id ,updated_at, created_at) VALUES($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
      [description, req.user.user_id]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all todos

app.get("/todos", authenticateJWT, async (req, res) => {
  try {
    const allTodos = await pool.query(
      "SELECT * FROM todo WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.user_id]
    );
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// get a todo

app.get("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    // console.log(req.params.id);

    const { id } = req.params;

    const todo = await pool.query(
      "SELECT * FROM todo WHERE todo_id = $1 AND user_id = $2",
      [id, req.user.user_id]
    );

    if (todo.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// update a todo

app.put("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE todo_id = $2 AND user_id = $3 RETURNING *",
      [description, id, req.user.user_id]
    );

    if (updateTodo.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Todo not found or no changes made" });
    }

    res.json(updateTodo.rows[0]);

    // res.json("updated Todo");
    // console.log(updateTodo);
  } catch (err) {
    console.error(err.message);
  }
});

// delete a todo

app.delete("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteTodo = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.user_id]
    );

    if (deleteTodo.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(deleteTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(4500, () => {
  console.log("Server is running on port 4500");
});
