<?php
$pdo = getDB();
$month = $_GET['month'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT d.*, u.nickname AS related_name, c.nickname AS creator_name FROM important_dates d LEFT JOIN users u ON d.related_user_id = u.id JOIN users c ON d.created_by = c.id';
    $params = [];
    if ($month) {
        $sql .= ' WHERE MONTH(d.event_date) = ?';
        $params[] = $month;
    }
    $sql .= ' ORDER BY MONTH(d.event_date), DAY(d.event_date)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($input['title'] ?? '');
    $event_date = $input['event_date'] ?? null;
    $created_by = $input['created_by'] ?? null;
    if (!$title || !$event_date || !$created_by) error('标题、日期和创建者不能为空');
    $stmt = $pdo->prepare('INSERT INTO important_dates (title, event_date, date_type, related_user_id, created_by) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$title, $event_date, $input['date_type'] ?? 'other', $input['related_user_id'] ?? null, $created_by]);
    success(['id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if (!$id) error('缺少日期ID');
    $stmt = $pdo->prepare('DELETE FROM important_dates WHERE id = ?');
    $stmt->execute([$id]);
    success();
}
