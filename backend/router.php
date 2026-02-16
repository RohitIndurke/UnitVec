<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path === '/' || $path === '') {
    $path = '/index.html';
}
if (file_exists($_SERVER['DOCUMENT_ROOT'] . $path) && is_file($_SERVER['DOCUMENT_ROOT'] . $path)) {
    return false;
}

require_once __DIR__ . '/db.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// $path_parts[0] should be 'auth', 'exams', or 'results'
$resource = $path_parts[0] ?? '';

if ($resource === 'auth') {
    require __DIR__ . '/auth.php';
} elseif ($resource === 'exams') {
    // exams.php logic expects $path_parts to be available
    require __DIR__ . '/exams.php';
} elseif ($resource === 'results') {
    require __DIR__ . '/results.php';
} else {
    // 404 Not Found
    http_response_code(404);
    echo json_encode(['error' => 'Not Found', 'path' => $path]);
}
?>
