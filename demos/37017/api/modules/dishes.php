<?php
$pdo = getDB();
$id = $_GET['id'] ?? null;
$category = $_GET['category'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT * FROM dishes WHERE is_active = 1';
    $params = [];
    if ($id) {
        $sql .= ' AND id = ?';
        $params[] = $id;
    }
    if ($category && $category !== 'all') {
        $sql .= ' AND category = ?';
        $params[] = $category;
    }
    $sql .= ' ORDER BY id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $id ? ($row = $stmt->fetch() ? success($row) : error('菜品不存在', 404)) : success($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($input['name'] ?? '');
    if (!$name) error('菜名不能为空');
    $stmt = $pdo->prepare('INSERT INTO dishes (name, description, category, emoji, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $name,
        $input['description'] ?? '',
        $input['category'] ?? 'meat',
        $input['emoji'] ?? null,
        $input['image_url'] ?? null,
        $input['created_by'] ?? null,
    ]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $input['id'] ?? $id;
    if (!$id) error('缺少菜品ID');
    $fields = [];
    $params = [];
    foreach (['name', 'description', 'category', 'emoji', 'image_url', 'is_active'] as $f) {
        if (array_key_exists($f, $input)) {
            $fields[] = "$f = ?";
            $params[] = $input[$f];
        }
    }
    if (!$fields) error('没有要更新的字段');
    $params[] = $id;
    $stmt = $pdo->prepare('UPDATE dishes SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    success();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $input['id'] ?? $id;
    if (!$id) error('缺少菜品ID');
    $stmt = $pdo->prepare('UPDATE dishes SET is_active = 0 WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
