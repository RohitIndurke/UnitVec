# Online Exam System

A simple exam platform where teachers can create exams and students can take them using a generated code.

## Prerequisites

### Windows
- PHP 8.0+ installed and added to PATH
- PostgreSQL installed and running locally
- PHP extensions enabled in `php.ini`: `pdo_pgsql`, `pgsql`

### Linux (Ubuntu/Debian)
- PHP 8.0+ installed: `sudo apt install php php-pgsql php-pdo-pgsql`
- PostgreSQL installed: `sudo apt install postgresql postgresql-contrib`

## Setup Instructions

### Database Setup
1. Create a database named `online_exam` in PostgreSQL.
2. Import the schema:
   ```bash
   psql -U postgres -d online_exam -f database/database.sql
   ```
   *(Adjust username `-U` as needed)*

### Running the Application

#### Windows
1. Double-click `run_php.bat` to start the server.
2. The application will be available at `http://localhost:3000`.

#### Linux / Mac
1. Open a terminal in the project root.
2. Start the PHP built-in server:
   ```bash
   php -S localhost:3000 -t frontend backend/router.php
   ```
3. Open your browser and navigate to `http://localhost:3000`.



## Usage Guide

### Teacher
1. Click "I am a Teacher".
2. Enter an Exam Name (e.g., "Math 101").
3. Enter a 6-digit Code (e.g., "123456").
4. Add questions with options and specify the correct option number (1-4).
5. Click "Create Exam".

### Student
1. Click "I am a Student".
2. Enter your Student ID.
3. Enter the exact Exam Name and the 6-digit Code provided by the teacher.
4. Click "Start Exam".
5. Answer the questions and submit to see your score.
