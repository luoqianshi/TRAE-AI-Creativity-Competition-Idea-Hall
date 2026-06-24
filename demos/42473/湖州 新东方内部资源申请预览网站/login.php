<?php
require __DIR__ . '/config.php';
init_session();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = trim($_POST['password'] ?? '');
    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $_SESSION['admin_login'] = true;
        header('Location: admin.php');
        exit;
    } else {
        $error = '账号或密码错误';
    }
}

// 已登录直接跳转
if (!empty($_SESSION['admin_login'])) {
    header('Location: admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>管理后台登录</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="topbar"><div class="wrap">
<a class="brand" href="index.php">湖州新东方 · 教室预约</a>
</div></header>
<main class="wrap">
<div class="login-card">
    <h1>管理后台登录</h1>
    <?php if ($error): ?>
        <div class="alert error"><?php echo e($error); ?></div>
    <?php endif; ?>
    <form method="post" class="form">
        <label>账号<input type="text" name="username" required placeholder="请输入账号" autofocus></label>
        <label>密码<input type="password" name="password" required placeholder="请输入密码"></label>
        <button class="btn big" type="submit">登录</button>
    </form>
    <a class="back" href="index.php" style="justify-content:center;margin-top:16px">返回首页</a>
</div>
</main>
</body>
</html>
