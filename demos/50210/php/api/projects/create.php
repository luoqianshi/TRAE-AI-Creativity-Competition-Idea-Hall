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
require_once __DIR__ . '/../../includes/validation.php';

$user = Auth::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('请求方法不支持', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$rules = [
    'title' => ['required', ['maxLength', 100]],
    'description' => ['required']
];

$errors = Validation::validate($input, $rules);

if ($errors) {
    Response::error('验证失败', 422, $errors);
}

$db = Database::getInstance();

$projectId = $db->insert('projects', [
    'user_id' => $user['user_id'],
    'title' => $input['title'],
    'description' => $input['description'],
    'category' => $input['category'] ?? '其他',
    'difficulty' => $input['difficulty'] ?? '中级',
    'tags' => $input['tags'] ?? '',
    'schematic_url' => $input['schematic_url'] ?? '',
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s')
]);

if (!empty($input['components'])) {
    foreach ($input['components'] as $componentId) {
        $db->insert('project_components', [
            'project_id' => $projectId,
            'component_id' => $componentId
        ]);
    }
}

Response::success(['project_id' => $projectId], '项目创建成功');
