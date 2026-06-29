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

$postId = $_GET['id'] ?? null;

if (!$postId) {
    Response::error('缺少帖子ID', 400);
}

$db = Database::getInstance();

$post = $db->fetch("SELECT user_id FROM posts WHERE id = ?", [$postId]);

if (!$post) {
    Response::error('帖子不存在', 404);
}

if ($post['user_id'] != $user['user_id']) {
    Response::error('无权删除此帖子', 403);
}

$db->delete('comments', 'post_id = ?', [$postId]);
$db->delete('posts', 'id = ?', [$postId]);

Response::success(null, '帖子删除成功');
