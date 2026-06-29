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
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$rules = [
    'username' => ['required'],
    'password' => ['required']
];

$errors = Validation::validate($input, $rules);

if ($errors) {
    Response::error('验证失败', 422, $errors);
}

$db = Database::getInstance();

$user = $db->fetch(
    "SELECT id, username, email, password, avatar, bio, created_at FROM users WHERE username = ? OR email = ?",
    [$input['username'], $input['username']]
);

if (!$user || !password_verify($input['password'], $user['password'])) {
    Response::error('用户名或密码错误', 401);
}

$token = Auth::generateToken($user['id'], $user['username']);

unset($user['password']);

Response::success([
    'token' => $token,
    'user' => $user
], '登录成功');
