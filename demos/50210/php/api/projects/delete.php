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

$projectId = $_GET['id'] ?? null;

if (!$projectId) {
    Response::error('缺少项目ID', 400);
}

$db = Database::getInstance();

$project = $db->fetch("SELECT user_id FROM projects WHERE id = ?", [$projectId]);

if (!$project) {
    Response::error('项目不存在', 404);
}

if ($project['user_id'] != $user['user_id']) {
    Response::error('无权删除此项目', 403);
}

$db->delete('project_components', 'project_id = ?', [$projectId]);
$db->delete('project_stars', 'project_id = ?', [$projectId]);
$db->delete('projects', 'id = ?', [$projectId]);

Response::success(null, '项目删除成功');
