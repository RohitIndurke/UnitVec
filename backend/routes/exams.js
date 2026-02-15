import express from "express";
import { pool } from "../db.js";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM exams");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/create", async (req, res) => {
    const { name, exam_code, teacher_id, questions, duration, total_marks } = req.body;
    const duration_minutes = duration;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");


        const examResult = await client.query(
            "INSERT INTO exams (title, teacher_id, duration_minutes, total_marks, exam_code) VALUES ($1, $2, $3, $4, $5) RETURNING exam_id",
            [name, teacher_id, duration_minutes, total_marks, exam_code]
        );
        const examId = examResult.rows[0].exam_id;


        for (const q of questions) {
            await client.query(
                "INSERT INTO questions (exam_id, question_text, options, correct_option) VALUES ($1, $2, $3, $4)",
                [examId, q.question_text, JSON.stringify(q.options), q.correct_option]
            );
        }

        await client.query("COMMIT");
        res.json({ success: true, exam_id: examId });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to create exam" });
    } finally {
        client.release();
    }
});

router.get("/:code", async (req, res) => {
    const { code } = req.params;
    try {
        const examResult = await pool.query("SELECT * FROM exams WHERE exam_code = $1", [code]);

        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }

        const examId = examResult.rows[0].exam_id;
        const questionsResult = await pool.query("SELECT * FROM questions WHERE exam_id = $1", [examId]);

        res.json({
            exam: examResult.rows[0],
            questions: questionsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/question", async (req, res) => {
    const { exam_code, question_text, options, correct_option } = req.body;

    try {
        const examResult = await pool.query("SELECT exam_id FROM exams WHERE exam_code = $1", [exam_code]);

        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }

        const examId = examResult.rows[0].exam_id;

        await pool.query(
            "INSERT INTO questions (exam_id, question_text, options, correct_option) VALUES ($1, $2, $3, $4)",
            [examId, question_text, JSON.stringify(options), correct_option]
        );

        res.json({ success: true, message: "Question added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add question" });
    }
});

export default router;

