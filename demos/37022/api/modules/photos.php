<?php
$pdo = getDB();
$album = $_GET['album'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($album) {
        $stmt = $pdo->prepare('SELECT p.*, u.nickname AS uploader_name FROM photos p JOIN users u ON p.uploaded_by = u.id WHERE p.album_name = ? ORDER BY p.created_at DESC');
        $stmt->execute([$album]);
    } else {
        $stmt = $pdo->query('SELECT p.*, u.nickname AS uploader_name FROM photos p JOIN users u ON p.uploaded_by = u.id ORDER BY p.created_at DESC LIMIT 100');
    }
    success($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $url = trim($input['url'] ?? '');
    $uploaded_by = $input['uploaded_by'] ?? null;
    if (!$url || !$uploaded_by) error('照片URL和上传者不能为空');
    $stmt = $pdo->prepare('INSERT INTO photos (url, album_name, caption, uploaded_by) VALUES (?, ?, ?, ?)');
    $stmt->execute([$url, $input['album_name'] ?? '默认相册', $input['caption'] ?? '', $uploaded_by]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if (!$id) error('缺少照片ID');
    $stmt = $pdo->prepare('DELETE FROM photos WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
