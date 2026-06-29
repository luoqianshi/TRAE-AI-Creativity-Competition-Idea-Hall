<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$allowedFields = ['avatar', 'bio', 'email'];
$updateData = [];

foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
        $updateData[$field] = $input[$field];
    }
}

if (empty($updateData)) {
    Response::error('没有要更新的数据', 400);
}

if (isset($updateData['email'])) {
    $emailError = Validation::email($updateData['email']);
    if ($emailError) {
        Response::error('验证失败', 422, ['email' => [$emailError]]);
    }
    
    $existing = Database::getInstance()->fetch(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [$updateData['email'], $user['user_id']]
    );
    
    if ($existing) {
        Response::error('邮箱已被使用', 409);
    }
}

$updateData['updated_at'] = date('Y-m-d H:i:s');

$db = Database::getInstance();
$db->update('users', $updateData, 'id = ?', [$user['user_id']]);

Response::success(null, '更新成功');
