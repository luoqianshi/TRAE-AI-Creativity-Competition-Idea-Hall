<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/validation.php';

$user = Auth::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$rules = [
    'title' => ['required', ['maxLength', 200]],
    'content' => ['required']
];

$errors = Validation::validate($input, $rules);

if ($errors) {
    Response::error('验证失败', 422, $errors);
}

$db = Database::getInstance();

$postId = $db->insert('posts', [
    'user_id' => $user['user_id'],
    'title' => $input['title'],
    'content' => $input['content'],
    'category' => $input['category'] ?? '讨论',
    'tags' => $input['tags'] ?? '',
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s')
]);

Response::success(['post_id' => $postId], '发帖成功');
