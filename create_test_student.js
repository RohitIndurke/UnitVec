
import { pool } from './backend/db.js';

async function createStudent() {
    const email = 'student@mitacsc.edu.in';
    const password = 'password';

    try {
        // Check if exists
        const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (check.rowCount > 0) {
            console.log(`User ${email} already exists. Updating password to '${password}'...`);
            await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [password, email]);
        } else {
            console.log(`Creating new user ${email}...`);
            const res = await pool.query(
                "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id",
                [email, password, 'student']
            );
            const userId = res.rows[0].user_id;
            await pool.query(
                "INSERT INTO students (student_id, name, roll_no) VALUES ($1, $2, $3)",
                [userId, 'Test Student', '100']
            );
        }
        console.log(`\n✅ SUCCESS: Login with:\nEmail: ${email}\nPassword: ${password}`);
    } catch (err) {
        console.error("Error creating user:", err);
    } finally {
        pool.end();
    }
}

createStudent();
