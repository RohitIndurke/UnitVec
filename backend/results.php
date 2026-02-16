<?php
// backend_php/results.php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $path_parts[1] ?? '';

    if ($action === 'submit') {
        $studentId = $input['student_id'];
        $examCode = $input['exam_code'];
        $answers = $input['answers']; // map {question_id: option_index}

        // 1. Get Exam ID
        $stmt = $pdo->prepare("SELECT exam_id FROM exams WHERE exam_code = ?");
        $stmt->execute([$examCode]);
        $exam = $stmt->fetch();

        if (!$exam) {
            http_response_code(404);
            echo json_encode(['error' => 'Exam not found']);
            exit;
        }
        $examId = $exam['exam_id'];

        // 2. Get Questions
        $stmt = $pdo->prepare("SELECT question_id, correct_option FROM questions WHERE exam_id = ?");
        $stmt->execute([$examId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Calculate Score
        $score = 0;
        $totalQuestions = count($questions);
        $correctAnswersMap = [];
        foreach ($questions as $q) {
            $correctAnswersMap[$q['question_id']] = $q['correct_option'];
        }

        foreach ($answers as $qId => $selectedOption) {
            if (isset($correctAnswersMap[$qId]) && (int)$correctAnswersMap[$qId] === (int)$selectedOption) {
                $score++;
            }
        }

        // 4. Save Result
        try {
            $stmt = $pdo->prepare("INSERT INTO results (student_id, exam_id, score) VALUES (?, ?, ?)");
            $stmt->execute([$studentId, $examId, $score]);
            echo json_encode(['success' => true, 'score' => $score, 'total' => $totalQuestions]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit exam: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $examCode = $path_parts[1] ?? '';
    
    if (empty($examCode)) {
         http_response_code(400);
         echo json_encode(['error' => 'Exam code required']);
         exit;
    }

    $query = "SELECT r.result_id, s.name as student_name, s.roll_no, r.score, r.submitted_at 
              FROM results r 
              JOIN students s ON r.student_id = s.student_id 
              JOIN exams e ON r.exam_id = e.exam_id 
              WHERE e.exam_code = ? 
              ORDER BY r.submitted_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$examCode]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($results)) {
        // Check if unique exam exists? Maybe.
        // For now just return empty array
    }

    echo json_encode($results);
}
?>
