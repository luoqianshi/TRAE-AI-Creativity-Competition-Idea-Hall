<?php
$pdo = getDB();
$id = $_GET['id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare('SELECT a.*, u.nickname AS author_name FROM announcements a JOIN users u ON a.author_id = u.id WHERE a.id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $row ? success($row) : error('公告不存在', 404);
    } else {
        $rows = $pdo->query('SELECT a.*, u.nickname AS author_name FROM announcements a JOIN users u ON a.author_id = u.id ORDER BY a.is_pinned DESC, a.created_at DESC LIMIT 50')->fetchAll();
        success($rows);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($input['title'] ?? '');
    $author_id = $input['author_id'] ?? null;
    if (!$title || !$author_id) error('标题和发布者不能为空');
    $stmt = $pdo->prepare('INSERT INTO announcements (title, content, author_id, is_pinned) VALUES (?, ?, ?, ?)');
    $stmt->execute([$title, $input['content'] ?? '', $author_id, $input['is_pinned'] ?? 0]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $input['id'] ?? $id;
    if (!$id) error('缺少公告ID');
    $fields = [];
    $params = [];
    foreach (['title', 'content', 'is_pinned'] as $f) {
        if (array_key_exists($f, $input)) {
            $fields[] = "$f = ?";
            $params[] = $input[$f];
        }
    }
    if (!$fields) error('没有要更新的字段');
    $params[] = $id;
    $stmt = $pdo->prepare('UPDATE announcements SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    success();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if (!$id) error('缺少公告ID');
    $stmt = $pdo->prepare('DELETE FROM announcements WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
