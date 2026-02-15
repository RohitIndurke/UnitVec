# Online Exam System

A simple exam platform where teachers can create exams and students can take them using a generated code.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017

## Setup Instructions

1. **Backend Setup**
   - Open a terminal in `d:\online-exam\backend`
   - Run: `npm install`
   - Start the server: `npm start` (or `node server.js`)
   - The server will run on `http://localhost:3000`

2. **Frontend Setup**
   - Open `d:\online-exam\frontend\index.html` in your web browser.
   - Alternatively, you can use a live server extension in VS Code.

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
