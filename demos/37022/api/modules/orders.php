<?php
$pdo = getDB();
$date = $_GET['date'] ?? date('Y-m-d');
$user_id = $_GET['user_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT o.*, d.name AS dish_name, d.emoji, d.category, u.nickname 
            FROM orders o 
            JOIN dishes d ON o.dish_id = d.id 
            JOIN users u ON o.user_id = u.id 
            WHERE o.order_date = ?';
    $params = [$date];
    if ($user_id) {
        $sql .= ' AND o.user_id = ?';
        $params[] = $user_id;
    }
    $sql .= ' ORDER BY o.created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $input['user_id'] ?? null;
    $dish_id = $input['dish_id'] ?? null;
    $quantity = $input['quantity'] ?? 1;
    $order_date = $input['order_date'] ?? date('Y-m-d');
    if (!$user_id || !$dish_id) error('缺少必要参数');

    $stmt = $pdo->prepare('INSERT INTO orders (user_id, dish_id, quantity, order_date) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user_id, $dish_id, $quantity, $order_date]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if (!$id) error('缺少记录ID');
    $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
