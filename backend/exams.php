<?php
// backend_php/exams.php

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($path_parts) || !isset($path_parts[1])) {
        // GET /exams
        $stmt = $pdo->query("SELECT * FROM exams");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        // GET /exams/:code
        $code = $path_parts[1];
        
        $stmt = $pdo->prepare("SELECT * FROM exams WHERE exam_code = ?");
        $stmt->execute([$code]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$exam) {
            http_response_code(404);
            echo json_encode(['error' => 'Exam not found']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM questions WHERE exam_id = ?");
        $stmt->execute([$exam['exam_id']]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'exam' => $exam,
            'questions' => $questions
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $action = $path_parts[1] ?? '';

    if ($action === 'create') {
        // Create Exam
        $name = $input['name'];
        $code = $input['exam_code'];
        $teacherId = $input['teacher_id'];
        $duration = $input['duration'];
        $totalMarks = $input['total_marks'];
        $questions = $input['questions'] ?? [];

        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO exams (title, teacher_id, duration_minutes, total_marks, exam_code) VALUES (?, ?, ?, ?, ?) RETURNING exam_id");
            $stmt->execute([$name, $teacherId, $duration, $totalMarks, $code]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            $examId = $exam['exam_id'];

            foreach ($questions as $q) {
                $opts = is_string($q['options']) ? $q['options'] : json_encode($q['options']);

                $stmt = $pdo->prepare("INSERT INTO questions (exam_id, question_text, options, correct_option) VALUES (?, ?, ?, ?)");
                $stmt->execute([$examId, $q['question_text'], $opts, $q['correct_option']]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'exam_id' => $examId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create exam: ' . $e->getMessage()]);
        }
    } elseif ($action === 'question') {
        // Add Question
        $code = $input['exam_code'];
        $stmt = $pdo->prepare("SELECT exam_id FROM exams WHERE exam_code = ?");
        $stmt->execute([$code]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$exam) {
            http_response_code(404);
            echo json_encode(['error' => 'Exam not found']);
            exit;
        }
        
        $examId = $exam['exam_id'];
        $questionText = $input['question_text'];
        $options = $input['options'];
        $correctOption = $input['correct_option'];

        $opts = is_string($options) ? $options : json_encode($options);

        try {
             $stmt = $pdo->prepare("INSERT INTO questions (exam_id, question_text, options, correct_option) VALUES (?, ?, ?, ?)");
             $stmt->execute([$examId, $questionText, $opts, $correctOption]);
             echo json_encode(['success' => true, 'message' => 'Question added successfully']);
        } catch (Exception $e) {
             http_response_code(500);
             echo json_encode(['error' => 'Failed to add question: ' . $e->getMessage()]);
        }
    }
}
?>
