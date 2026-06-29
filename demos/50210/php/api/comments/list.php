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

$postId = $_GET['post_id'] ?? null;

if (!$postId) {
    Response::error('缺少帖子ID', 400);
}

$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, max(1, (int)($_GET['per_page'] ?? 20)));
$offset = ($page - 1) * $perPage;

$db = Database::getInstance();

$total = $db->count('comments', 'post_id = ?', [$postId]);

$comments = $db->fetchAll(
    "SELECT c.*, u.username as author_name, u.avatar as author_avatar
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC
     LIMIT ? OFFSET ?",
    [$postId, $perPage, $offset]
);

Response::paginated($comments, $total, $page, $perPage);
