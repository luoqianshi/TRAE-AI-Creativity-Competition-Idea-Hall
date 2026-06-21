<?php
$pdo = getDB();
$id = $_GET['id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $row ? success($row) : error('用户不存在', 404);
    } else {
        $rows = $pdo->query('SELECT * FROM users WHERE is_active = 1 ORDER BY id')->fetchAll();
        success($rows);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nickname = trim($input['nickname'] ?? '');
    $role_name = trim($input['role_name'] ?? '成员');
    if (!$nickname) error('昵称不能为空');
    $stmt = $pdo->prepare('INSERT INTO users (nickname, role_name) VALUES (?, ?)');
    $stmt->execute([$nickname, $role_name]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $input['id'] ?? $id;
    if (!$id) error('缺少用户ID');
    $fields = [];
    $params = [];
    foreach (['nickname', 'role_name', 'avatar'] as $f) {
        if (isset($input[$f])) {
            $fields[] = "$f = ?";
            $params[] = $input[$f];
        }
    }
    if (!$fields) error('没有要更新的字段');
    $params[] = $id;
    $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    success();
}
