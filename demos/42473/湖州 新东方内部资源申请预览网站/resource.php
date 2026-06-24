<?php
require __DIR__ . '/config.php';

$pdo = db();
$id = (int)($_GET['id'] ?? 0);
$res = $pdo->prepare("SELECT * FROM resources WHERE id=?");
$res->execute([$id]);
$resource = $res->fetch();
if (!$resource) {
    head('未找到');
    echo '<div class="empty-state"><p>教室不存在</p><a class="btn" href="index.php">返回</a></div>';
    foot();
    exit;
}

// 日期范围：今天起 7 天
$dates = [];
for ($i = 0; $i < 7; $i++) {
    $dates[] = date('Y-m-d', strtotime("+$i day"));
}
$today = date('Y-m-d');
$slots = time_slots();

$stmt = $pdo->prepare("SELECT * FROM reservations WHERE resource_id=? AND reserve_date>=?");
$stmt->execute([$id, $today]);
$map = [];
foreach ($stmt->fetchAll() as $row) {
    $map[$row['reserve_date']][$row['time_slot']] = $row;
}

head(e($resource['name']));
?>
<a class="back" href="index.php">返回</a>

<div class="resource-head">
    <h1><?php echo e($resource['name']); ?></h1>
    <p class="muted"><?php echo e($resource['location'] ? $resource['location'] : ''); ?>
    <?php echo $resource['capacity'] ? ' · 容量' . (int)$resource['capacity'] : ''; ?></p>
</div>

<div class="legend">
    <span><i class="dot empty"></i>空闲</span>
    <span><i class="dot yellow"></i>待签到</span>
    <span><i class="dot green"></i>使用中</span>
    <span><i class="dot black"></i>失效</span>
</div>

<div class="table-scroll">
<table class="grid">
    <thead>
        <tr>
            <th>日期</th>
            <?php foreach ($slots as $n => $s): ?>
                <th><div class="th-time">
                    <span class="th-start"><?php echo $s[0]; ?></span>
                    <span class="th-end"><?php echo $s[1]; ?></span>
                </div></th>
            <?php endforeach; ?>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($dates as $d):
        $isToday = ($d === $today);
        $weekday = ['日','一','二','三','四','五','六'][date('w', strtotime($d))];
    ?>
        <tr>
            <td class="date-cell <?php echo $isToday ? 'today' : ''; ?>">
                <div><?php echo date('m/d', strtotime($d)); ?></div>
                <small>周<?php echo $weekday; ?></small>
            </td>
            <?php foreach ($slots as $n => $s):
                $cell = $map[$d][$n] ?? null;
                $dbStatus = $cell ? $cell['status'] : 'empty';
                $cssClass = ['reserved'=>'yellow','scanned'=>'green','missed'=>'black','empty'=>'empty'][$dbStatus] ?? 'empty';
                $statusLabel = ['reserved'=>'待签到','scanned'=>'使用中','missed'=>'失效'][$dbStatus] ?? '';
                $past = strtotime($d . ' ' . $s[1]) < time();
            ?>
            <td class="cell">
                <?php if ($cell): ?>
                    <a class="point <?php echo $cssClass; ?> <?php echo $past ? 'past' : ''; ?>"
                       href="reserve.php?id=<?php echo $id; ?>&date=<?php echo $d; ?>&slot=<?php echo $n; ?>">
                        <span class="point-status"><?php echo $statusLabel; ?></span>
                        <span class="point-name"><?php echo e($cell['name']); ?></span>
                    </a>
                <?php else: ?>
                    <?php if ($past): ?>
                        <span class="point empty past"></span>
                    <?php else: ?>
                        <a class="point empty" href="reserve.php?id=<?php echo $id; ?>&date=<?php echo $d; ?>&slot=<?php echo $n; ?>">+</a>
                    <?php endif; ?>
                <?php endif; ?>
            </td>
            <?php endforeach; ?>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
</div>

<p class="muted small" style="margin-top:10px;text-align:center">左右滑动查看更多时段 · 点击空闲(+)预约 · 预约后请到教室扫码签到</p>
<?php foot(); ?>
