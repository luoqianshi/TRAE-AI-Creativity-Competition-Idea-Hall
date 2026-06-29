<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    Response::error('缺少帖子ID', 400);
}

$db = Database::getInstance();

$post = $db->fetch(
    "SELECT p.*, u.username as author_name, u.avatar as author_avatar, u.bio as author_bio
     FROM posts p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.id = ?",
    [$id]
);

if (!$post) {
    Response::error('帖子不存在', 404);
}

$db->query("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", [$id]);
$post['view_count']++;

$comments = $db->fetchAll(
    "SELECT c.*, u.username as author_name, u.avatar as author_avatar
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC",
    [$id]
);

$post['comments'] = $comments;

Response::success($post);
