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
$orderBy = $_GET['order'] ?? 'created_at';

$allowedOrders = ['created_at', 'updated_at', 'star_count', 'view_count'];
if (!in_array($orderBy, $allowedOrders)) {
    $orderBy = 'created_at';
}

$db = Database::getInstance();

$where = '1=1';
$params = [];

if ($category) {
    $where .= ' AND p.category = ?';
    $params[] = $category;
}

if ($keyword) {
    $where .= ' AND (p.title LIKE ? OR p.description LIKE ?)';
    $params[] = "%{$keyword}%";
    $params[] = "%{$keyword}%";
}

$total = $db->fetch(
    "SELECT COUNT(*) as count FROM projects p WHERE {$where}",
    $params
)['count'];

$sql = "SELECT p.*, u.username as author_name, u.avatar as author_avatar,
        (SELECT COUNT(*) FROM project_stars WHERE project_id = p.id) as star_count
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE {$where}
        ORDER BY p.{$orderBy} DESC
        LIMIT ? OFFSET ?";

$params[] = $perPage;
$params[] = $offset;

$projects = $db->fetchAll($sql, $params);

Response::paginated($projects, $total, $page, $perPage);
