<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/auth.php';

$user = Auth::authenticate();

$input = json_decode(file_get_contents('php://input'), true);
$projectId = $input['project_id'] ?? null;

if (!$projectId) {
    Response::error('缺少项目ID', 400);
}

$db = Database::getInstance();

$project = $db->fetch("SELECT id FROM projects WHERE id = ?", [$projectId]);

if (!$project) {
    Response::error('项目不存在', 404);
}

$existingStar = $db->fetch(
    "SELECT id FROM project_stars WHERE project_id = ? AND user_id = ?",
    [$projectId, $user['user_id']]
);

if ($existingStar) {
    $db->delete('project_stars', 'project_id = ? AND user_id = ?', [$projectId, $user['user_id']]);
    $message = '已取消收藏';
    $starred = false;
} else {
    $db->insert('project_stars', [
        'project_id' => $projectId,
        'user_id' => $user['user_id'],
        'created_at' => date('Y-m-d H:i:s')
    ]);
    $message = '已收藏';
    $starred = true;
}

$starCount = $db->count('project_stars', 'project_id = ?', [$projectId]);

Response::success([
    'starred' => $starred,
    'star_count' => $starCount
], $message);
