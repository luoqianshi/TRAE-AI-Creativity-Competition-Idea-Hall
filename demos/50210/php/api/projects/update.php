<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/validation.php';

$user = Auth::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$projectId = $input['id'] ?? null;

if (!$projectId) {
    Response::error('缺少项目ID', 400);
}

$db = Database::getInstance();

$project = $db->fetch("SELECT user_id FROM projects WHERE id = ?", [$projectId]);

if (!$project) {
    Response::error('项目不存在', 404);
}

if ($project['user_id'] != $user['user_id']) {
    Response::error('无权修改此项目', 403);
}

$allowedFields = ['title', 'description', 'category', 'difficulty', 'tags', 'schematic_url'];
$updateData = [];

foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
        $updateData[$field] = $input[$field];
    }
}

if (empty($updateData)) {
    Response::error('没有要更新的数据', 400);
}

$updateData['updated_at'] = date('Y-m-d H:i:s');

$db->update('projects', $updateData, 'id = ?', [$projectId]);

if (isset($input['components'])) {
    $db->delete('project_components', 'project_id = ?', [$projectId]);
    
    foreach ($input['components'] as $componentId) {
        $db->insert('project_components', [
            'project_id' => $projectId,
            'component_id' => $componentId
        ]);
    }
}

Response::success(null, '项目更新成功');
