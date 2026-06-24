<?php
require __DIR__ . '/config.php';

$pdo = db();
$token = $_GET['token'] ?? '';
$rid = (int)($_GET['room'] ?? 0);
$done = false;
$error = '';
$reservation = null;
$resource = null;

if ($token !== '') {
    $stmt = $pdo->prepare("SELECT r.*, res.name AS resource_name, res.location
        FROM reservations r JOIN resources res ON res.id=r.resource_id
        WHERE r.token=?");
    $stmt->execute([$token]);
    $reservation = $stmt->fetch();
    if (!$reservation) {
        $error = '无效的二维码或预约不存在';
    } else {
        $resource = ['name' => $reservation['resource_name'], 'location' => $reservation['location']];
    }
}

if ($rid > 0 && !$reservation) {
    $stmt = $pdo->prepare("SELECT * FROM resources WHERE id=?");
    $stmt->execute([$rid]);
    $resource = $stmt->fetch();
    if (!$resource) {
        $error = '教室不存在';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($reservation && $reservation['status'] === 'reserved') {
        $slots = time_slots();
        $endTs = strtotime($reservation['reserve_date'] . ' ' . ($slots[$reservation['time_slot']][1] ?? '22:00'));
        if (time() > $endTs) {
            $pdo->prepare("UPDATE reservations SET status='missed' WHERE id=?")->execute([$reservation['id']]);
            $error = '时段已结束，未能签到，点位已失效';
            $reservation['status'] = 'missed';
        } else {
            $pdo->prepare("UPDATE reservations SET status='scanned', scanned_at=datetime('now','localtime') WHERE id=?")
                ->execute([$reservation['id']]);
            $done = true;
            $reservation['status'] = 'scanned';
        }
    }
    elseif ($rid > 0 && $resource) {
        $empId = trim($_POST['employee_id'] ?? '');
        if ($empId === '') {
            $error = '请输入工号';
        } else {
            $today = date('Y-m-d');
            $now = time();
            $slots = time_slots();
            $found = null;
            $stmt = $pdo->prepare("SELECT * FROM reservations
                WHERE resource_id=? AND reserve_date=? AND employee_id=? AND status='reserved'
                ORDER BY time_slot ASC");
            $stmt->execute([$rid, $today, $empId]);
            foreach ($stmt->fetchAll() as $row) {
                $endTs = strtotime($row['reserve_date'] . ' ' . ($slots[$row['time_slot']][1] ?? '22:00'));
                $startTs = strtotime($row['reserve_date'] . ' ' . ($slots[$row['time_slot']][0] ?? '08:00'));
                if (($now >= $startTs && $now <= $endTs) || ($now >= $startTs - 1800 && $now < $startTs)) {
                    $found = $row;
                    break;
                }
            }
            if ($found) {
                $pdo->prepare("UPDATE reservations SET status='scanned', scanned_at=datetime('now','localtime') WHERE id=?")
                    ->execute([$found['id']]);
                $reservation = $found;
                $reservation['resource_name'] = $resource['name'];
                $reservation['location'] = $resource['location'];
                $done = true;
            } else {
                $chk = $pdo->prepare("SELECT id FROM reservations
                    WHERE resource_id=? AND reserve_date=? AND employee_id=? AND status='scanned'");
                $chk->execute([$rid, $today, $empId]);
                if ($chk->fetch()) {
                    $error = '您今天的预约已签到，无需重复签到';
                } else {
                    $error = '未找到匹配的预约，请确认今天有该教室的预约且当前在预约时段内';
                }
            }
        }
    }
    elseif ($reservation && $reservation['status'] !== 'reserved') {
        $error = '该预约状态无法签到（' . $reservation['status'] . '）';
    }
}

head('扫码签到');
?>
<?php if ($error): ?>
    <div class="alert error"><?php echo e($error); ?></div>
<?php endif; ?>

<?php if ($done && $reservation): ?>
    <div class="alert success">签到成功！可开始使用教室</div>
    <div class="result-card">
        <h3>签到信息</h3>
        <p><b>教室：</b><?php echo e($reservation['resource_name'] ?? $resource['name']); ?></p>
        <p><b>时段：</b><?php echo e($reservation['reserve_date']); ?> <?php echo slot_label($reservation['time_slot']); ?></p>
        <p><b>姓名：</b><?php echo e($reservation['name']); ?>（<?php echo e($reservation['employee_id']); ?>）</p>
        <p><b>部门：</b><?php echo e($reservation['department']); ?></p>
        <p><b>签到时间：</b><?php echo e($reservation['scanned_at']); ?></p>
        <span class="tag green">已签到</span>
    </div>
    <?php if ($rid): ?>
    <a class="btn" href="scan.php?room=<?php echo $rid; ?>">继续签到</a>
    <?php endif; ?>

<?php elseif ($token && $reservation && !$done): ?>
    <?php
    $slots = time_slots();
    $endTs = strtotime($reservation['reserve_date'] . ' ' . ($slots[$reservation['time_slot']][1] ?? '22:00'));
    $expired = time() > $endTs;
    ?>
    <div class="scan-wrap">
        <h1>确认签到</h1>
        <div class="result-card">
            <h3><?php echo e($reservation['resource_name']); ?></h3>
            <p><b>时段：</b><?php echo e($reservation['reserve_date']); ?> <?php echo slot_label($reservation['time_slot']); ?></p>
            <p><b>预约人：</b><?php echo e($reservation['name']); ?>（<?php echo e($reservation['employee_id']); ?>）</p>
            <p><b>部门：</b><?php echo e($reservation['department']); ?></p>
            <p><b>状态：</b>
                <?php
                $map = ['reserved'=>'<span class="tag yellow">待签到</span>','scanned'=>'<span class="tag green">已签到</span>','missed'=>'<span class="tag black">已失效</span>'];
                echo $map[$reservation['status']] ?? '';
                ?>
            </p>
            <?php if ($reservation['status'] === 'reserved' && !$expired): ?>
            <form method="post">
                <button class="btn big" type="submit">确认签到</button>
            </form>
            <?php elseif ($expired && $reservation['status'] === 'reserved'): ?>
            <div class="alert error">时段已结束，无法签到</div>
            <?php endif; ?>
        </div>
    </div>

<?php elseif ($rid && $resource && !$done): ?>
    <div class="scan-wrap">
        <div class="door-sign">
            <h1><?php echo e($resource['name']); ?></h1>
            <p class="muted"><?php echo e($resource['location'] ? $resource['location'] : ''); ?></p>
            <p class="scan-hint">输入工号完成签到</p>
            <form method="post" class="form door-form">
                <label>工号<input type="text" name="employee_id" required placeholder="请输入工号" autofocus></label>
                <button class="btn big" type="submit">签到</button>
            </form>
            <p class="muted small">签到后点位变绿；未签到将变黑失效</p>
        </div>
    </div>

<?php else: ?>
    <div class="scan-wrap">
        <h1>扫码签到</h1>
        <p class="muted">请扫描教室门上的二维码签到</p>
        <form method="get" class="form">
            <label>或输入签到码<input type="text" name="token" placeholder="预约签到码"></label>
            <button class="btn">查询</button>
        </form>
    </div>
<?php endif; ?>
<?php foot(); ?>
