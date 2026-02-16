<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $path_parts[1] ?? '';

if ($action === 'register') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';
    $name = $input['name'] ?? '';
    $roll_no = $input['roll_no'] ?? null;
    $department = $input['department'] ?? null;

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) RETURNING user_id");
        $stmt->execute([$email, $password, $role]);
        $user = $stmt->fetch();
        $userId = $user['user_id'];

        if ($role === 'student') {
            $stmt = $pdo->prepare("INSERT INTO students (student_id, name, roll_no) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $name, $roll_no]);
        } elseif ($role === 'teacher') {
            $stmt = $pdo->prepare("INSERT INTO teachers (teacher_id, name, department) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $name, $department]);
        }

        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }

} elseif ($action === 'login') {
    // /auth/login
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password_hash = ?");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    echo json_encode([
        'user_id' => $user['user_id'],
        'role' => $user['role']
    ]);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
