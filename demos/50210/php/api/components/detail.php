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
    Response::error('缺少元器件ID', 400);
}

$db = Database::getInstance();

$component = $db->fetch("SELECT * FROM components WHERE id = ?", [$id]);

if (!$component) {
    Response::error('元器件不存在', 404);
}

$projects = $db->fetchAll(
    "SELECT p.id, p.title, p.description FROM projects p
     INNER JOIN project_components pc ON p.id = pc.project_id
     WHERE pc.component_id = ?
     ORDER BY p.created_at DESC
     LIMIT 10",
    [$id]
);

$component['projects'] = $projects;

Response::success($component);
