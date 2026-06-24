<?php
require __DIR__ . '/config.php';

$pdo = db();
$id = (int)($_GET['id'] ?? $_POST['resource_id'] ?? 0);
$date = $_GET['date'] ?? $_POST['reserve_date'] ?? '';
$slot = (int)($_GET['slot'] ?? $_POST['time_slot'] ?? 0);

$res = $pdo->prepare("SELECT * FROM resources WHERE id=?");
$res->execute([$id]);
$resource = $res->fetch();
if (!$resource) {
    head('未找到');
    echo '<div class="empty-state"><p>教室不存在</p><a class="btn" href="index.php">返回</a></div>';
    foot();
    exit;
}

$slots = time_slots();
$slotOk = isset($slots[$slot]);
$dateOk = preg_match('/^\d{4}-\d{2}-\d{2}$/', $date);

head('预约');
?>
<a class="back" href="resource.php?id=<?php echo $id; ?>">返回时段</a>

<?php
// 取消预约
if (($_GET['action'] ?? '') === 'cancel' && !empty($_GET['rid'])) {
    $rid = (int)$_GET['rid'];
    $pdo->prepare("DELETE FROM reservations WHERE id=? AND status='reserved'")
        ->execute([$rid]);
    echo '<div class="alert success">已取消预约，时段已释放</div>';
    echo '<a class="btn" href="resource.php?id=' . $id . '">返回时段</a>';
    foot();
    exit;
}

// 提交预约
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $employee_id = trim($_POST['employee_id'] ?? '');
    $department = trim($_POST['department'] ?? '');
    $errors = [];
    if ($name === '') $errors[] = '请填写姓名';
    if (!preg_match('/^1[3-9]\d{9}$/', $phone)) $errors[] = '请填写正确的手机号';
    if ($employee_id === '') $errors[] = '请填写工号';
    if (!$slotOk || !$dateOk) $errors[] = '时段参数错误';

    if (!$errors) {
        $chk = $pdo->prepare("SELECT id FROM reservations WHERE resource_id=? AND reserve_date=? AND time_slot=? AND status IN ('reserved','scanned')");
        $chk->execute([$id, $date, $slot]);
        if ($chk->fetch()) $errors[] = '该时段已被占用';
    }

    if ($errors) {
        echo '<div class="alert error">' . implode('；', $errors) . '</div>';
    } else {
        $token = gen_token();
        $pdo->prepare("INSERT INTO reservations (resource_id, reserve_date, time_slot, status, name, phone, employee_id, department, token)
            VALUES (?,?,?,?,?,?,?,?,?)")
            ->execute([$id, $date, $slot, 'reserved', $name, $phone, $employee_id, $department, $token]);
        $newId = $pdo->lastInsertId();

        echo '<div class="alert success">预约成功！请到教室扫码签到</div>';
        echo '<div class="result-card">';
        echo '<h3>预约信息</h3>';
        echo '<p><b>教室：</b>' . e($resource['name']) . '</p>';
        echo '<p><b>时段：</b>' . e($date) . ' ' . slot_label($slot) . '</p>';
        echo '<p><b>姓名：</b>' . e($name) . '　<b>工号：</b>' . e($employee_id) . '</p>';
        echo '<p><b>部门：</b>' . e($department) . '　<b>手机：</b>' . e($phone) . '</p>';
        echo '<p class="muted small" style="margin-top:8px">请到教室后扫描门上的二维码签到，签到后点位变绿。若未签到，时段结束后点位将变黑失效。</p>';
        // 隐藏字段供 JS 保存预约ID到 localStorage
        echo '<input type="hidden" id="newReserveId" value="' . $newId . '">';
        echo '<div class="btn-group">';
        echo '<a class="btn" href="resource.php?id=' . $id . '">返回时段</a>';
        echo '<a class="btn ghost" href="reserve.php?id=' . $id . '&date=' . $date . '&slot=' . $slot . '&action=cancel&rid=' . $newId . '">取消预约</a>';
        echo '</div>';
        echo '</div>';
        foot();
        exit;
    }
}

// 查看该时段是否已有预约
$existing = null;
if ($dateOk && $slotOk) {
    $ex = $pdo->prepare("SELECT * FROM reservations WHERE resource_id=? AND reserve_date=? AND time_slot=? AND status IN ('reserved','scanned','missed')");
    $ex->execute([$id, $date, $slot]);
    $existing = $ex->fetch();
}

if ($existing):
?>
    <div class="result-card">
        <h3>该时段已被预约</h3>
        <p><b>时段：</b><?php echo e($date); ?> <?php echo slot_label($slot); ?></p>
        <p><b>预约人：</b><?php echo e($existing['name']); ?>（<?php echo e($existing['employee_id']); ?>）</p>
        <p><b>部门：</b><?php echo e($existing['department']); ?>　<b>手机：</b><?php echo e($existing['phone']); ?></p>
        <p><b>状态：</b>
            <?php
            $map = ['reserved'=>'<span class="tag yellow">待签到</span>','scanned'=>'<span class="tag green">使用中</span>','missed'=>'<span class="tag black">已失效</span>'];
            echo $map[$existing['status']] ?? '';
            ?>
        </p>
        <?php if ($existing['status'] === 'reserved'): ?>
        <p class="muted small">请到教室扫描门上的二维码签到</p>
        <?php endif; ?>
        <a class="btn" href="resource.php?id=<?php echo $id; ?>">返回时段</a>
    </div>
<?php elseif ($slotOk && $dateOk):
    $past = strtotime($date . ' ' . $slots[$slot][1]) < time();
    if ($past): ?>
        <div class="alert error">该时段已过，无法预约</div>
        <a class="btn" href="resource.php?id=<?php echo $id; ?>">返回时段</a>
    <?php else: ?>
    <div class="form-card">
        <p class="muted">预约 <b><?php echo e($resource['name']); ?></b></p>
        <p style="margin:0 0 12px;font-size:15px"><b><?php echo e($date); ?> <?php echo slot_label($slot); ?></b></p>
        <form method="post" class="form" id="reserveForm">
            <input type="hidden" name="resource_id" value="<?php echo $id; ?>">
            <input type="hidden" name="reserve_date" value="<?php echo e($date); ?>">
            <input type="hidden" name="time_slot" value="<?php echo $slot; ?>">
            <label>姓名<input type="text" name="name" data-autofill="name" required placeholder="请输入姓名"></label>
            <label>手机号<input type="tel" name="phone" data-autofill="phone" required pattern="1[3-9]\d{9}" placeholder="请输入手机号"></label>
            <label>工号<input type="text" name="employee_id" data-autofill="employee_id" required placeholder="请输入工号"></label>
            <label>部门<input type="text" name="department" data-autofill="department" placeholder="请输入部门"></label>
            <button type="submit" class="btn big">提交预约</button>
        </form>
    </div>
    <?php endif;
else: ?>
    <div class="alert error">请从时段页面选择预约</div>
    <a class="btn" href="resource.php?id=<?php echo $id; ?>">前往选择</a>
<?php endif; ?>
<?php foot(); ?>
