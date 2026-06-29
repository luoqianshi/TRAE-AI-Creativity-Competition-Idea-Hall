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

$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, max(1, (int)($_GET['per_page'] ?? 10)));
$offset = ($page - 1) * $perPage;

$category = $_GET['category'] ?? null;
$keyword = $_GET['keyword'] ?? null;
$userId = $_GET['user_id'] ?? null;

$db = Database::getInstance();

$where = '1=1';
$params = [];

if ($category) {
    $where .= ' AND p.category = ?';
    $params[] = $category;
}

if ($keyword) {
    $where .= ' AND (p.title LIKE ? OR p.content LIKE ?)';
    $params[] = "%{$keyword}%";
    $params[] = "%{$keyword}%";
}

if ($userId) {
    $where .= ' AND p.user_id = ?';
    $params[] = $userId;
}

$total = $db->fetch(
    "SELECT COUNT(*) as count FROM posts p WHERE {$where}",
    $params
)['count'];

$params[] = $perPage;
$params[] = $offset;

$posts = $db->fetchAll(
    "SELECT p.*, u.username as author_name, u.avatar as author_avatar,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
     FROM posts p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE {$where}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?",
    $params
);

Response::paginated($posts, $total, $page, $perPage);
