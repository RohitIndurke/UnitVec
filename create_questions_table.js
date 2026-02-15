import { pool } from './backend/db.js';

const query = `
CREATE TABLE IF NOT EXISTS questions (
  question_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INT NOT NULL
);
`;

pool.query(query)
    .then(() => {
        console.log("Questions table created or already existed.");
        pool.end();
    })
    .catch(err => {
        console.error("Error creating table:", err);
        pool.end();
    });
