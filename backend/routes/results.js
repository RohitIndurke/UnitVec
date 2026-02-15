import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
    const { student_id, exam_code, answers } = req.body;

    try {
        // 1. Get Exam ID and Validation
        const examResult = await pool.query("SELECT exam_id FROM exams WHERE exam_code = $1", [exam_code]);
        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }
        const examId = examResult.rows[0].exam_id;

        // 2. Fetch Correct Answers
        const questionsResult = await pool.query("SELECT question_id, correct_option FROM questions WHERE exam_id = $1", [examId]);
        const dbQuestions = questionsResult.rows;

        // 3. Calculate Score
        let score = 0;
        const totalQuestions = dbQuestions.length;

        // Create a map for faster lookup
        const correctAnswersMap = {};
        dbQuestions.forEach(q => {
            correctAnswersMap[q.question_id] = q.correct_option;
        });

        // Iterate through user answers
        // answers is expected to be { question_id: selected_option_index }
        for (const [qId, selectedOption] of Object.entries(answers)) {
            if (correctAnswersMap[qId] === parseInt(selectedOption)) {
                score++;
            }
        }

        // 4. Save Result
        await pool.query(
            "INSERT INTO results (student_id, exam_id, score) VALUES ($1, $2, $3)",
            [student_id, examId, score]
        );

        res.json({ success: true, score, total: totalQuestions });

    } catch (err) {
        console.error("Error submitting exam:", err);
        if (err.code === '23503') {
            console.error(`Dependent key missing. StudentId: ${student_id}, ExamId: ${examId}`);
            return res.status(400).json({ error: "Invalid student or exam ID (foreign key failure)" });
        }
        res.status(500).json({ error: "Failed to submit exam: " + err.message });
    }
});

router.get("/:exam_code", async (req, res) => {
    const { exam_code } = req.params;

    try {
        const query = `
            SELECT r.result_id, s.name as student_name, s.roll_no, r.score, r.submitted_at 
            FROM results r 
            JOIN students s ON r.student_id = s.student_id 
            JOIN exams e ON r.exam_id = e.exam_id 
            WHERE e.exam_code = $1
            ORDER BY r.submitted_at DESC
        `;
        const result = await pool.query(query, [exam_code]);

        if (result.rows.length === 0) {
            // Check if exam exists at all to differentiate between "no results" and "invalid code"
            const examCheck = await pool.query("SELECT exam_id FROM exams WHERE exam_code = $1", [exam_code]);
            if (examCheck.rows.length === 0) {
                return res.status(404).json({ error: "Exam code not found" });
            }
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch results" });
    }
});

export default router;
