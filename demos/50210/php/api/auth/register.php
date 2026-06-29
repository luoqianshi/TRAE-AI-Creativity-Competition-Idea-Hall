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
require_once __DIR__ . '/../../includes/validation.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$rules = [
    'username' => ['required', 'username'],
    'email' => ['required', 'email'],
    'password' => ['required', 'password'],
    'confirm_password' => ['required']
];

$errors = Validation::validate($input, $rules);

if ($errors) {
    Response::error('验证失败', 422, $errors);
}

if ($input['password'] !== $input['confirm_password']) {
    Response::error('两次输入的密码不一致', 422);
}

$db = Database::getInstance();

$existingUser = $db->fetch(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [$input['username'], $input['email']]
);

if ($existingUser) {
    Response::error('用户名或邮箱已被注册', 409);
}

$userId = $db->insert('users', [
    'username' => $input['username'],
    'email' => $input['email'],
    'password' => password_hash($input['password'], PASSWORD_DEFAULT),
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s')
]);

Response::success(['user_id' => $userId], '注册成功');
