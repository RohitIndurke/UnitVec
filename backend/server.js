import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import examRoutes from "./routes/exams.js";
import resultRoutes from "./routes/results.js";

const app = express();


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/auth", authRoutes);
app.use("/exams", examRoutes);
app.use("/results", resultRoutes);


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
