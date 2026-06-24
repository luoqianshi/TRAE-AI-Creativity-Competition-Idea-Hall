<?php
require __DIR__ . '/config.php';

$pdo = db();

// 取消预约
if (($_GET['action'] ?? '') === 'cancel' && !empty($_GET['rid'])) {
    $rid = (int)$_GET['rid'];
    $pdo->prepare("DELETE FROM reservations WHERE id=? AND status='reserved'")
        ->execute([$rid]);
    echo '<div class="alert success">已取消预约</div>';
}

// 通过 IDs 查询预约（从 localStorage 传入）
$ids = $_GET['ids'] ?? '';
$records = [];
if ($ids !== '') {
    $idArr = array_filter(array_map('intval', explode(',', $ids)), function($v) { return $v > 0; });
    if ($idArr) {
        $placeholders = implode(',', array_fill(0, count($idArr), '?'));
        $stmt = $pdo->prepare("SELECT r.*, res.name AS resource_name, res.location
            FROM reservations r JOIN resources res ON res.id=r.resource_id
            WHERE r.id IN ($placeholders) ORDER BY r.reserve_date ASC, r.time_slot ASC");
        $stmt->execute($idArr);
        $records = $stmt->fetchAll();
    }
}

head('我的预约');
?>
<a class="back" href="index.php">返回首页</a>
<h1>我的预约</h1>
<div id="myReservations">
    <p class="muted">加载中...</p>
</div>

<script>
(function() {
    var container = document.getElementById('myReservations');
    var ids = [];
    try { ids = JSON.parse(localStorage.getItem('my_reserve_ids') || '[]'); } catch(e) {}

    if (!ids.length) {
        container.innerHTML = '<div class="empty-state"><p>暂无预约记录</p><a class="btn" href="index.php">前往预约</a></div>';
        return;
    }

    // 通过 AJAX 请求本页带 ids 参数
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'my.php?ids=' + ids.join(','), true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            // 解析返回的 HTML，提取 #myList 内容
            var parser = new DOMParser();
            var doc = parser.parseFromString(xhr.responseText, 'text/html');
            var list = doc.getElementById('myList');
            if (list) {
                container.innerHTML = list.innerHTML;
            } else {
                container.innerHTML = '<div class="empty-state"><p>暂无预约记录</p></div>';
            }
        }
    };
    xhr.send();
})();
</script>
<?php

// 如果有 ids 参数，渲染列表内容
if ($ids !== '' && $records):
    echo '<div id="myList">';
    echo '<div class="card-list">';
    foreach ($records as $r):
        $statusMap = ['reserved'=>'<span class="tag yellow">待签到</span>','scanned'=>'<span class="tag green">使用中</span>','missed'=>'<span class="tag black">已失效</span>'];
        $cssClass = ['reserved'=>'yellow','scanned'=>'green','missed'=>'black'][$r['status']] ?? 'empty';
    ?>
    <div class="card my-card <?php echo $cssClass; ?>">
        <div class="my-row">
            <span class="my-date"><?php echo e($r['reserve_date']); ?> <?php echo slot_label($r['time_slot']); ?></span>
            <?php echo $statusMap[$r['status']] ?? ''; ?>
        </div>
        <div class="my-row">
            <span class="my-name"><?php echo e($r['name']); ?></span>
            <?php if ($r['status'] === 'reserved'): ?>
            <a class="my-cancel" href="my.php?action=cancel&rid=<?php echo $r['id']; ?>&ids=<?php echo e($ids); ?>" onclick="return confirm('确认取消？')">取消</a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    endforeach;
    echo '</div>';
    echo '</div>';
elseif ($ids !== '' && !$records):
    echo '<div id="myList"><div class="empty-state"><p>预约记录不存在或已过期</p></div></div>';
endif;

foot();
