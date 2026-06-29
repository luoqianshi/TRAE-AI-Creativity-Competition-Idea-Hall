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
    'name' => ['required', ['maxLength', 100]],
    'category' => ['required']
];

$errors = Validation::validate($input, $rules);

if ($errors) {
    Response::error('验证失败', 422, $errors);
}

$db = Database::getInstance();

$existing = $db->fetch(
    "SELECT id FROM components WHERE name = ? AND model = ?",
    [$input['name'], $input['model'] ?? '']
);

if ($existing) {
    Response::error('该元器件已存在', 409);
}

$componentId = $db->insert('components', [
    'name' => $input['name'],
    'model' => $input['model'] ?? '',
    'category' => $input['category'],
    'description' => $input['description'] ?? '',
    'specifications' => $input['specifications'] ?? '',
    'pin_count' => $input['pin_count'] ?? 0,
    'package' => $input['package'] ?? '',
    'voltage_rating' => $input['voltage_rating'] ?? '',
    'current_rating' => $input['current_rating'] ?? '',
    'power_rating' => $input['power_rating'] ?? '',
    'datasheet_url' => $input['datasheet_url'] ?? '',
    'created_by' => $user['user_id'],
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s')
]);

Response::success(['component_id' => $componentId], '元器件添加成功');
