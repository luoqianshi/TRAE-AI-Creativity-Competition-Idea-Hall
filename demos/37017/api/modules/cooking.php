<?php
$pdo = getDB();
$date = $_GET['date'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT c.*, d.name AS dish_name, d.emoji, d.category, u.nickname 
            FROM cooking_records c 
            JOIN dishes d ON c.dish_id = d.id 
            JOIN users u ON c.user_id = u.id';
    $params = [];
    if ($date) {
        $sql .= ' WHERE c.cooking_date = ?';
        $params[] = $date;
    }
    $sql .= ' ORDER BY c.cooking_date DESC, c.created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $input['user_id'] ?? null;
    $dish_id = $input['dish_id'] ?? null;
    $cooking_date = $input['cooking_date'] ?? date('Y-m-d');
    if (!$user_id || !$dish_id) error('缺少必要参数');

    $stmt = $pdo->prepare('INSERT INTO cooking_records (user_id, dish_id, cooking_date, note) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user_id, $dish_id, $cooking_date, $input['note'] ?? '']);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if (!$id) error('缺少记录ID');
    $stmt = $pdo->prepare('DELETE FROM cooking_records WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
