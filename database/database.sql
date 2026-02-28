SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'online_exam'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS online_exam;
CREATE DATABASE online_exam;
\c online_exam;

CREATE TABLE users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher'))
);

CREATE TABLE students (
  student_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  roll_no VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teachers (
  teacher_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exams (
  exam_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  teacher_id INT REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  duration_minutes INT NOT NULL,
  total_marks INT NOT NULL,
  exam_code VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE questions (
  question_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INT NOT NULL
);


CREATE TABLE results (
  result_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
  exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
  score INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT * FROM users;
SELECT * FROM students;
SELECT * FROM teachers;
SELECT * FROM exams;
SELECT * FROM results;
