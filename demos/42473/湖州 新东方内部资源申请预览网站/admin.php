<?php
require __DIR__ . '/config.php';
init_session();

// 退出登录
if (($_GET['action'] ?? '') === 'logout') {
    $_SESSION['admin_login'] = false;
    unset($_SESSION['admin_login']);
    header('Location: login.php');
    exit;
}

require_admin();

$pdo = db();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['form'] ?? '') === 'resource') {
    $name = trim($_POST['name'] ?? '');
    $location = trim($_POST['location'] ?? '');
    $campus = trim($_POST['campus'] ?? '');
    $capacity = (int)($_POST['capacity'] ?? 0);
    $description = trim($_POST['description'] ?? '');
    if ($name === '') {
        $msg = '<div class="alert error">请填写教室名称</div>';
    } else {
        $pdo->prepare("INSERT INTO resources (name, location, campus, capacity, description) VALUES (?,?,?,?,?)")
            ->execute([$name, $location, $campus, $capacity, $description]);
        $msg = '<div class="alert success">教室已发布</div>';
    }
}

if (($_GET['action'] ?? '') === 'del' && !empty($_GET['rid'])) {
    $rid = (int)$_GET['rid'];
    $pdo->prepare("DELETE FROM reservations WHERE resource_id=?")->execute([$rid]);
    $pdo->prepare("DELETE FROM resources WHERE id=?")->execute([$rid]);
    $msg = '<div class="alert success">已删除</div>';
}

if (($_GET['action'] ?? '') === 'delres' && !empty($_GET['rid'])) {
    $pdo->prepare("DELETE FROM reservations WHERE id=?")->execute([(int)$_GET['rid']]);
    $msg = '<div class="alert success">记录已删除</div>';
}

$resources = $pdo->query("SELECT * FROM resources ORDER BY id DESC")->fetchAll();

$filter = $_GET['f'] ?? 'all';
$filterRes = (int)($_GET['res'] ?? 0);
$sql = "SELECT r.*, res.name AS resource_name FROM reservations r
    JOIN resources res ON res.id=r.resource_id WHERE 1=1";
$params = [];
if ($filter !== 'all' && in_array($filter, ['reserved','scanned','missed'])) {
    $sql .= " AND r.status=?";
    $params[] = $filter;
}
if ($filterRes) {
    $sql .= " AND r.resource_id=?";
    $params[] = $filterRes;
}
$sql .= " ORDER BY r.reserve_date DESC, r.time_slot ASC LIMIT 200";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$records = $stmt->fetchAll();

head('管理后台');
?>
<a class="back" href="index.php">返回首页</a>
<h1>管理后台</h1>
<a class="logout-link" href="admin.php?action=logout">退出登录</a>
<?php echo $msg; ?>

<section class="panel">
    <h2 style="font-size:16px;margin:0 0 12px">发布教室</h2>
    <form method="post" class="form">
        <input type="hidden" name="form" value="resource">
        <label>教室名称<input type="text" name="name" required placeholder="如：301教室"></label>
        <label>校区<input type="text" name="campus" placeholder="输入校区名称" list="campus-list"></label>
        <datalist id="campus-list">
            <?php
            $existing = $pdo->query("SELECT DISTINCT campus FROM resources WHERE campus!='' ORDER BY campus")->fetchAll();
            foreach ($existing as $ec): ?>
            <option value="<?php echo e($ec['campus']); ?>">
            <?php endforeach; ?>
        </datalist>
        <label>位置<input type="text" name="location" placeholder="如：3楼东侧"></label>
        <label>容量<input type="number" name="capacity" min="0" value="30"></label>
        <label>描述<textarea name="description" rows="2" placeholder="可选"></textarea></label>
        <button class="btn" type="submit">发布教室</button>
    </form>
</section>

<section class="panel">
    <h2 style="font-size:16px;margin:0 0 12px">教室列表</h2>
    <?php if (!$resources): ?>
        <p class="muted">暂无教室</p>
    <?php else: ?>
    <div class="card-list">
        <?php foreach ($resources as $r): ?>
        <div class="card" style="pointer-events:auto">
            <div class="card-head">
                <h3><a href="resource.php?id=<?php echo $r['id']; ?>"><?php echo e($r['name']); ?></a></h3>
                <span class="card-loc"><?php echo e($r['campus'] ?: ''); ?> <?php echo e($r['location'] ?: ''); ?></span>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <a class="btn-sm" href="qrcode.php?room=<?php echo $r['id']; ?>" target="_blank">签到码</a>
                <a class="btn-sm link-danger" href="admin.php?action=del&rid=<?php echo $r['id']; ?>" onclick="return confirm('确认删除？')" style="background:#fdecea;color:#c0392b">删除</a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
</section>

<section class="panel">
    <h2 style="font-size:16px;margin:0 0 12px">预约记录</h2>
    <form method="get" class="filter-bar">
        <select name="res">
            <option value="0">全部教室</option>
            <?php foreach ($resources as $r): ?>
            <option value="<?php echo $r['id']; ?>" <?php echo $filterRes==$r['id']?'selected':''; ?>><?php echo e($r['name']); ?></option>
            <?php endforeach; ?>
        </select>
        <select name="f">
            <option value="all" <?php echo $filter=='all'?'selected':''; ?>>全部</option>
            <option value="reserved" <?php echo $filter=='reserved'?'selected':''; ?>>待签到</option>
            <option value="scanned" <?php echo $filter=='scanned'?'selected':''; ?>>已签到</option>
            <option value="missed" <?php echo $filter=='missed'?'selected':''; ?>>已失效</option>
        </select>
        <button class="btn-sm" style="background:var(--green);color:#fff;border:none">筛选</button>
    </form>
    <?php if (!$records): ?>
        <p class="muted">暂无记录</p>
    <?php else: ?>
    <div class="card-list">
        <?php foreach ($records as $r):
            $statusMap = ['reserved'=>'<span class="tag yellow">待签到</span>','scanned'=>'<span class="tag green">已签到</span>','missed'=>'<span class="tag black">已失效</span>'];
        ?>
        <div class="card">
            <div class="card-head">
                <h3><?php echo e($r['resource_name']); ?> <?php echo $statusMap[$r['status']] ?? ''; ?></h3>
            </div>
            <p style="margin:4px 0;font-size:13px"><?php echo e($r['reserve_date']); ?> <?php echo slot_label($r['time_slot']); ?></p>
            <p style="margin:4px 0;font-size:13px"><?php echo e($r['name']); ?> · <?php echo e($r['employee_id']); ?> · <?php echo e($r['department']); ?> · <?php echo e($r['phone']); ?></p>
            <p style="margin:4px 0;font-size:12px;color:var(--muted)">预约 <?php echo e($r['created_at']); ?>　签到 <?php echo e($r['scanned_at'] ?: '—'); ?></p>
            <a class="link-danger" href="admin.php?action=delres&rid=<?php echo $r['id']; ?>&res=<?php echo $filterRes; ?>&f=<?php echo e($filter); ?>" onclick="return confirm('删除？')">删除</a>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
</section>
<?php foot(); ?>
