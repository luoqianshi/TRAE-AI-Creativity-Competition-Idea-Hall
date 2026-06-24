<?php
require __DIR__ . '/config.php';

$pdo = db();
// 动态读取已有校区
$campusList = $pdo->query("SELECT DISTINCT campus FROM resources WHERE campus!='' ORDER BY campus")->fetchAll(PDO::FETCH_COLUMN);
$selCampus = $_GET['campus'] ?? '';

if ($selCampus !== '' && in_array($selCampus, $campusList)) {
    $stmt = $pdo->prepare("SELECT * FROM resources WHERE campus=? ORDER BY id DESC");
    $stmt->execute([$selCampus]);
} else {
    $selCampus = '';
    $resources = $pdo->query("SELECT * FROM resources ORDER BY campus, id DESC")->fetchAll();
}
if (isset($stmt)) $resources = $stmt->fetchAll();

$today = date('Y-m-d');
head('教室预约');
?>
<h1>教室预约</h1>
<p class="subtitle">暑期教室使用 · 在线预约 · 扫码签到</p>

<a class="btn ghost my-reserve-btn" href="my.php">我的预约</a>

<!-- 校区标签 -->
<div class="campus-tabs">
    <a class="campus-tab <?php echo $selCampus === '' ? 'active' : ''; ?>"
       href="index.php">全部</a>
    <?php foreach ($campusList as $c): ?>
    <a class="campus-tab <?php echo $selCampus === $c ? 'active' : ''; ?>"
       href="index.php?campus=<?php echo urlencode($c); ?>"><?php echo e($c); ?></a>
    <?php endforeach; ?>
</div>

<div class="legend">
    <span><i class="dot empty"></i>空闲</span>
    <span><i class="dot yellow"></i>待签到</span>
    <span><i class="dot green"></i>使用中</span>
    <span><i class="dot black"></i>失效</span>
</div>

<?php if (!$resources): ?>
    <div class="empty-state">
        <p>暂无教室资源</p>
    </div>
<?php else: ?>
    <div class="card-list">
        <?php foreach ($resources as $r):
            $cnt = $pdo->prepare("SELECT
                SUM(status='reserved') AS reserved,
                SUM(status='scanned') AS scanned,
                SUM(status='missed') AS missed
                FROM reservations WHERE resource_id=? AND reserve_date>=?");
            $cnt->execute([$r['id'], $today]);
            $c = $cnt->fetch();
        ?>
        <a class="card" href="resource.php?id=<?php echo $r['id']; ?>">
            <div class="card-head">
                <h3><?php echo e($r['name']); ?></h3>
                <span class="card-campus"><?php echo e($r['campus'] ?: ''); ?></span>
            </div>
            <p class="card-loc2"><?php echo e($r['location'] ?: ''); ?>
            <?php echo $r['capacity'] ? ' · 容量' . (int)$r['capacity'] : ''; ?></p>
            <div class="card-stats">
                <span><i class="dot yellow"></i><?php echo (int)$c['reserved']; ?> 待签到</span>
                <span><i class="dot green"></i><?php echo (int)$c['scanned']; ?> 使用中</span>
                <span><i class="dot black"></i><?php echo (int)$c['missed']; ?> 失效</span>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
<?php foot(); ?>
