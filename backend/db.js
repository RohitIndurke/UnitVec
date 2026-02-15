import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "1234",
    database: "online_exam",
    port: 5432,
});
