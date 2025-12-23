const express = require("express");
const app = express();
const cors = require("cors");

const { pool } = require("../db.js");

// middleware
app.use(cors());
app.use(express.json());

// routes

// register and login routes

// register route

const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    // TODO: implement jwt generation here
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

    // TODO: replace with jwt generation
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error.message);
  }
});

// create a todo

app.post("/todos", async (req, res) => {
  // waits for the function to complete before it continues

  try {
    console.log(req.body);

    const { description } = req.body;

    const newTodo = await pool.query(
      "INSERT INTO todo (description, updated_at) VALUES($1, CURRENT_TIMESTAMP) RETURNING *",
      [description]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all todos

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query(
      "SELECT * FROM todo ORDER BY todo_id DESC"
    );
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    console.log(req.params.id);

    const { id } = req.params;

    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE todo_id = $2",
      [description, id]
    );

    res.json("updated Todo");
    // console.log(updateTodo);
  } catch (err) {
    console.error(err.message);
  }
});

// delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [
      id,
    ]);

    res.json("Deleted Todo");
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(4500, () => {
  console.log("Server is running on port 4500");
});
