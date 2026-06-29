<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/auth.php';

$user = Auth::authenticate();

$commentId = $_GET['id'] ?? null;

if (!$commentId) {
    Response::error('缺少评论ID', 400);
}

$db = Database::getInstance();

$comment = $db->fetch("SELECT user_id FROM comments WHERE id = ?", [$commentId]);

if (!$comment) {
    Response::error('评论不存在', 404);
}

if ($comment['user_id'] != $user['user_id']) {
    Response::error('无权删除此评论', 403);
}

$db->delete('comments', 'id = ?', [$commentId]);

Response::success(null, '评论删除成功');
