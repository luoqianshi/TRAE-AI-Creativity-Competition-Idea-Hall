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

$db = Database::getInstance();

$where = '1=1';
$params = [];

if ($category) {
    $where .= ' AND category = ?';
    $params[] = $category;
}

$total = $db->count('components', $where, $params);

$params[] = $perPage;
$params[] = $offset;

$components = $db->fetchAll(
    "SELECT * FROM components WHERE {$where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
    $params
);

Response::paginated($components, $total, $page, $perPage);
