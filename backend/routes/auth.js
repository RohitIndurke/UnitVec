import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, password, role, name, roll_no, department } = req.body;

    try {

        const userResult = await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING user_id",
            [email, password, role]
        );

        const userId = userResult.rows[0].user_id;


        if (role === "student") {
            await pool.query(
                "INSERT INTO students (student_id, name, roll_no) VALUES ($1,$2,$3)",
                [userId, name, roll_no]
            );
        }

        if (role === "teacher") {
            await pool.query(
                "INSERT INTO teachers (teacher_id, name, department) VALUES ($1,$2,$3)",
                [userId, name, department]
            );
        }

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND password_hash = $2",
        [email, password]
    );

    if (result.rowCount === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
        user_id: result.rows[0].user_id,
        role: result.rows[0].role
    });
});

export default router;
