import { pool } from './backend/db.js';

const query = `
CREATE TABLE IF NOT EXISTS results (
  result_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
  exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
  score INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
`;

pool.query(query)
    .then(() => {
        console.log("Results table created or already existed.");
        pool.end();
    })
    .catch(err => {
        console.error("Error creating table:", err);
        pool.end();
    });
