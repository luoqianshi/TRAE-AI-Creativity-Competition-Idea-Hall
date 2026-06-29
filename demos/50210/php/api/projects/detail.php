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
require_once __DIR__ . '/../../includes/auth.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    Response::error('缺少项目ID', 400);
}

$db = Database::getInstance();

$project = $db->fetch(
    "SELECT p.*, u.username as author_name, u.avatar as author_avatar, u.bio as author_bio
     FROM projects p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.id = ?",
    [$id]
);

if (!$project) {
    Response::error('项目不存在', 404);
}

$db->query("UPDATE projects SET view_count = view_count + 1 WHERE id = ?", [$id]);

$project['star_count'] = $db->count('project_stars', 'project_id = ?', [$id]);

$user = null;
$authHeader = getallheaders();
$token = null;
if (preg_match('/Bearer\s+(.+)$/i', $authHeader['Authorization'] ?? '', $matches)) {
    $token = $matches[1];
}

if ($token) {
    require_once __DIR__ . '/../../includes/auth.php';
    $payload = Auth::validateToken($token);
    if ($payload) {
        $project['is_starred'] = $db->count('project_stars', 'project_id = ? AND user_id = ?', [$id, $payload['user_id']]) > 0;
        $project['is_owner'] = $project['user_id'] == $payload['user_id'];
    } else {
        $project['is_starred'] = false;
        $project['is_owner'] = false;
    }
} else {
    $project['is_starred'] = false;
    $project['is_owner'] = false;
}

$components = $db->fetchAll(
    "SELECT c.* FROM components c
     INNER JOIN project_components pc ON c.id = pc.component_id
     WHERE pc.project_id = ?",
    [$id]
);

$project['components'] = $components;

Response::success($project);
