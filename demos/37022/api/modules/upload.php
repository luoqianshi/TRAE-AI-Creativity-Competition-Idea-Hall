<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') error('仅支持POST上传', 405);

if (!isset($_FILES['file'])) error('没有上传文件');

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) error('上传出错: ' . $file['error']);

$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowed)) error('仅支持 jpg/png/gif/webp 格式');

$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) error('文件不能超过5MB');

$uploadDir = __DIR__ . '/../../uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) error('保存失败');

$url = '/uploads/' . $filename;
success(['url' => $url, 'filename' => $filename]);
