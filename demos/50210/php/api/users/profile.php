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

$user = Auth::authenticate();

$db = Database::getInstance();

$userData = $db->fetch(
    "SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?",
    [$user['user_id']]
);

if (!$userData) {
    Response::error('用户不存在', 404);
}

$projectCount = $db->count('projects', 'user_id = ?', [$user['user_id']]);
$postCount = $db->count('posts', 'user_id = ?', [$user['user_id']]);

$userData['project_count'] = $projectCount;
$userData['post_count'] = $postCount;

Response::success($userData);
