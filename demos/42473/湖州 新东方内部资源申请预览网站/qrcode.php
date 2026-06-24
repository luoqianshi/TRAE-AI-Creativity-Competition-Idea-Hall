<?php
require __DIR__ . '/config.php';

$pdo = db();
$rid = (int)($_GET['room'] ?? 0);
$res = $pdo->prepare("SELECT * FROM resources WHERE id=?");
$res->execute([$rid]);
$resource = $res->fetch();
if (!$resource) {
    head('未找到');
    echo '<div class="empty-state"><p>教室不存在</p><a class="btn" href="index.php">返回</a></div>';
    foot();
    exit;
}

$scanUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http')
    . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
    . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/scan.php?room=' . $rid;
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>签到码 · <?php echo e($resource['name']); ?></title>
<link rel="stylesheet" href="style.css">
<style>
    body{background:#fff}
    .topbar{display:none}
    .print-card{max-width:360px;margin:30px auto;text-align:center;border:3px dashed #ccc;border-radius:16px;padding:30px 20px}
    .print-card h1{font-size:24px;margin-bottom:4px}
    .print-card .room-info{color:#666;font-size:14px;margin-bottom:20px}
    .print-card img{border:none}
    .print-card .hint{margin-top:16px;color:#888;font-size:13px;line-height:1.8}
    .print-card .hint b{color:#333}
    .no-print{text-align:center;margin:16px}
    @media print{.no-print{display:none}.print-card{border:2px solid #999}}
</style>
</head>
<body>
<div class="no-print">
    <a class="btn ghost" href="resource.php?id=<?php echo $rid; ?>">返回</a>
    <button class="btn" onclick="window.print()" style="margin-top:8px">打印签到码</button>
</div>
<div class="print-card">
    <h1><?php echo e($resource['name']); ?></h1>
    <div class="room-info"><?php echo e($resource['location'] ? $resource['location'] : ''); ?>
        <?php echo $resource['capacity'] ? ' · 容量 ' . (int)$resource['capacity'] : ''; ?></div>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=<?php echo urlencode($scanUrl); ?>"
         alt="签到二维码" width="240" height="240">
    <div class="hint">
        <b>扫码签到</b><br>
        到教室后扫描此二维码<br>
        输入工号完成签到 → 点位变绿<br>
        未签到 → 点位变黑失效
    </div>
</div>
</body>
</html>
