import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

import {
  generateJwtToken,
  verifyJwtToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./utils/jwt.js";

import { supabase } from "../db.js";

const app = express();

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
    return res.status(403).json({ message: "Invalid token" });
  }
};

// routes

// register route

import bcrypt from "bcrypt";
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user exists already
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_email", email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert the new user into the database
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        user_name: username,
        user_email: email,
        user_password: hashedPassword,
      })
      .select("user_id, user_name, user_email")
      .single();

    if (insertError) {
      // unique_violation (another request registered the same email first)
      if (insertError.code === "23505") {
        return res.status(409).json({ message: "User already exists" });
      }
      throw insertError;
    }

    // now we need to generate a jwt for the user
    const token = generateJwtToken(newUser.user_id);
    const refreshToken = generateRefreshToken(newUser.user_id);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// login route

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const { data: user, error: lookupError } = await supabase
      .from("users")
      .select("*")
      .eq("user_email", email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!user) {
      return res
        .status(409)
        .json({ message: "User not found. Register first." });
    }

    // returns a boolean to check if the password is correct
    const validPass = await bcrypt.compare(password, user.user_password);

    if (!validPass) {
      return res.status(409).json({ message: "Incorrect password" });
    }

    // jwt generation
    const token = generateJwtToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    return res.status(200).json({
      message: "Login successful",
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// refresh route

app.post("/auth/refresh", async (req, res) => {
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

    return res.status(200).json({ accessToken: newToken });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// create a todo

app.post("/todos", authenticateJWT, async (req, res) => {
  try {
    const { description } = req.body;
    const now = new Date().toISOString();

    const { data: newTodo, error } = await supabase
      .from("todo")
      .insert({
        description,
        user_id: req.user.userId,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(newTodo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get all todos

app.get("/todos", authenticateJWT, async (req, res) => {
  try {
    const { data: allTodos, error } = await supabase
      .from("todo")
      .select("*")
      .eq("user_id", req.user.userId)
      .order("is_completed", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(allTodos);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get a todo

app.get("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: todo, error } = await supabase
      .from("todo")
      .select("*")
      .eq("todo_id", id)
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) throw error;

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// update a todo

app.put("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const { data: updateTodo, error } = await supabase
      .from("todo")
      .update({
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("todo_id", id)
      .eq("user_id", req.user.userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!updateTodo) {
      return res
        .status(404)
        .json({ message: "Todo not found or no changes made" });
    }

    res.json(updateTodo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// mark todo as complete/incomplete

app.patch("/todos/:id/complete", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;

    const { data: updateTodo, error } = await supabase
      .from("todo")
      .update({
        is_completed,
        updated_at: new Date().toISOString(),
      })
      .eq("todo_id", id)
      .eq("user_id", req.user.userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!updateTodo) {
      return res
        .status(404)
        .json({ message: "Todo not found or no changes made" });
    }

    res.json(updateTodo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// delete a todo

app.delete("/todos/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deleteTodo, error } = await supabase
      .from("todo")
      .delete()
      .eq("todo_id", id)
      .eq("user_id", req.user.userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!deleteTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(deleteTodo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 4500;

app.listen(port, () => {
  console.log(`Server is running on port ${port} (Supabase API backend)`);
});
