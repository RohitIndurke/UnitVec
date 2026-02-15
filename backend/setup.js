
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    port: 5432,
});

async function setup() {
    try {
        await client.connect();


        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'online_exam'");
        if (res.rowCount === 0) {
            console.log("Database 'online_exam' does not exist. Creating...");
            await client.query("CREATE DATABASE online_exam");
            console.log("Database created.");
        } else {
            console.log("Database 'online_exam' already exists.");
        }

        await client.end();


        const dbClient = new Client({
            host: 'localhost',
            user: 'postgres',
            password: '1234',
            database: 'online_exam',
            port: 5432,
        });

        await dbClient.connect();


        console.log("Creating tables...");
        await dbClient.query(`
      CREATE TABLE users (
        user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'teacher'))
      );
    `);

        await dbClient.query(`
      CREATE TABLE students (
        student_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        roll_no VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        await dbClient.query(`
      CREATE TABLE teachers (
        teacher_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        await dbClient.query(`
      CREATE TABLE exams (
        exam_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        teacher_id INT REFERENCES teachers(teacher_id) ON DELETE SET NULL,
        duration_minutes INT NOT NULL,
        total_marks INT NOT NULL
      );
    `);

        await dbClient.query(`
      CREATE TABLE questions (
        question_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_option INT NOT NULL
      );
    `);

        await dbClient.query(`
      CREATE TABLE results (
        result_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
        exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
        score INT,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log("Tables created successfully.");
        await dbClient.end();

    } catch (err) {
        console.error("Error setting up database:", err);
        await client.end().catch(() => { });
    }
}

setup();
