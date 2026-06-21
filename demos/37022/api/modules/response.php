<?php
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function success($data = null, string $message = 'ok'): void {
    jsonResponse(['code' => 0, 'message' => $message, 'data' => $data]);
}

function error(string $message = 'error', int $code = 400): void {
    jsonResponse(['code' => -1, 'message' => $message, 'data' => null], $code);
}

function getInput(): array {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}
