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
$postId = $input['id'] ?? null;

if (!$postId) {
    Response::error('缺少帖子ID', 400);
}

$db = Database::getInstance();

$post = $db->fetch("SELECT user_id FROM posts WHERE id = ?", [$postId]);

if (!$post) {
    Response::error('帖子不存在', 404);
}

if ($post['user_id'] != $user['user_id']) {
    Response::error('无权修改此帖子', 403);
}

$allowedFields = ['title', 'content', 'category', 'tags'];
$updateData = [];

foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
        $updateData[$field] = $input[$field];
    }
}

if (empty($updateData)) {
    Response::error('没有要更新的数据', 400);
}

$updateData['updated_at'] = date('Y-m-d H:i:s');

$db->update('posts', $updateData, 'id = ?', [$postId]);

Response::success(null, '帖子更新成功');
