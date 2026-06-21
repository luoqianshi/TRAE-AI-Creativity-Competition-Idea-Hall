<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-Id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/modules/db.php';
require_once __DIR__ . '/modules/response.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

$segments = explode('/', trim($uri, '/'));
$resource = end($segments);

switch ($resource) {
    case 'users':
        require __DIR__ . '/modules/users.php';
        break;
    case 'dishes':
        require __DIR__ . '/modules/dishes.php';
        break;
    case 'orders':
        require __DIR__ . '/modules/orders.php';
        break;
    case 'cooking':
        require __DIR__ . '/modules/cooking.php';
        break;
    case 'announcements':
        require __DIR__ . '/modules/announcements.php';
        break;
    case 'photos':
        require __DIR__ . '/modules/photos.php';
        break;
    case 'dates':
        require __DIR__ . '/modules/dates.php';
        break;
    case 'upload':
        require __DIR__ . '/modules/upload.php';
        break;
    default:
        error('Not Found', 404);
}
