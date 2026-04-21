require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const initDatabase = require("./db/init");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function startApp() {
  await initDatabase(dbConfig);
  const pool = mysql.createPool(dbConfig);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM tasks");
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    const { title, description, due_date } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    pool
      .query(
        "INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)",
        [title, description, due_date],
      )
      .then(([result]) => {
        res.status(201).json({
          message: "Task created successfully",
          taskId: result.insertId,
        });
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;

    pool
      .query("DELETE FROM tasks WHERE id = ?", [id])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  });

  app.patch("/api/tasks/:id/toggle", async (req, res) => {
    const { id } = req.params;

    pool
      .query("UPDATE tasks SET completed = NOT completed WHERE id = ?", [id])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task updated successfully" });
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startApp();
