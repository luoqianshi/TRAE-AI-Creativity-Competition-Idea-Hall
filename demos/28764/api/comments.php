<?php
/**
 * FlowerSea Blog - 留言板 API
 * 
 * API 端点：
 * GET  /api/comments.php?action=list&article_id=article1    - 获取文章留言列表
 * GET  /api/comments.php?action=count&article_id=article1   - 获取文章留言数量
 * POST /api/comments.php?action=submit                      - 提交新留言
 * 
 * 请求示例：
 * POST 数据格式（JSON）：
 * {
 *     "article_id": "article1",
 *     "nickname": "访客",
 *     "email": "visitor@example.com",
 *     "content": "这篇文章写得很好！"
 * }
 */

require_once 'config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        getComments();
        break;
    case 'count':
        getCommentCount();
        break;
    case 'submit':
        submitComment();
        break;
    default:
        jsonResponse(false, null, '未知操作');
}

/**
 * 获取留言列表
 */
function getComments() {
    $article_id = isset($_GET['article_id']) ? sanitize($_GET['article_id']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    try {
        $db = getDB();
        
        // 构建查询条件
        $where = "WHERE status = 1";
        $params = [];
        
        if (!empty($article_id)) {
            $where .= " AND article_id = ?";
            $params[] = $article_id;
        }
        
        // 获取总数量
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM comments $where");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        // 获取留言列表
        $sql = "SELECT id, article_id, nickname, email, content, created_at 
                FROM comments 
                $where 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";
        
        $stmt = $db->prepare($sql);
        $execParams = array_merge($params, [$limit, $offset]);
        $stmt->execute($execParams);
        $comments = $stmt->fetchAll();
        
        // 格式化时间
        foreach ($comments as &$comment) {
            $comment['created_at'] = formatTime($comment['created_at']);
            // 隐藏邮箱域名部分
            if (!empty($comment['email'])) {
                $comment['email'] = maskEmail($comment['email']);
            }
        }
        
        jsonResponse(true, [
            'comments' => $comments,
            'total' => intval($total),
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(false, null, '查询失败: ' . $e->getMessage());
    }
}

/**
 * 获取留言数量
 */
function getCommentCount() {
    $article_id = isset($_GET['article_id']) ? sanitize($_GET['article_id']) : '';
    
    try {
        $db = getDB();
        
        if (!empty($article_id)) {
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND status = 1");
            $stmt->execute([$article_id]);
        } else {
            $stmt = $db->query("SELECT COUNT(*) as count FROM comments WHERE status = 1");
        }
        
        $count = $stmt->fetch()['count'];
        jsonResponse(true, ['count' => intval($count)]);
        
    } catch (PDOException $e) {
        jsonResponse(false, null, '查询失败: ' . $e->getMessage());
    }
}

/**
 * 提交新留言
 */
function submitComment() {
    // 获取 POST 数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // 尝试从 $_POST 获取
        $input = $_POST;
    }
    
    $article_id = isset($input['article_id']) ? sanitize($input['article_id']) : '';
    $nickname = isset($input['nickname']) ? sanitize($input['nickname']) : '';
    $email = isset($input['email']) ? sanitize($input['email']) : '';
    $content = isset($input['content']) ? sanitize($input['content']) : '';
    
    // 验证必填字段
    if (empty($article_id)) {
        jsonResponse(false, null, '文章 ID 不能为空');
    }
    if (empty($nickname)) {
        jsonResponse(false, null, '昵称不能为空');
    }
    if (empty($content)) {
        jsonResponse(false, null, '留言内容不能为空');
    }
    
    // 长度限制
    if (mb_strlen($nickname) > 50) {
        jsonResponse(false, null, '昵称不能超过 50 个字符');
    }
    if (mb_strlen($content) > 2000) {
        jsonResponse(false, null, '留言内容不能超过 2000 个字符');
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, null, '邮箱格式不正确');
    }
    
    // 简单的防垃圾机制：同一 IP 1 分钟内只能提交一次
    $ip = getClientIP();
    
    try {
        $db = getDB();
        
        // 检查同一 IP 最近 1 分钟内的提交
        $checkStmt = $db->prepare("SELECT COUNT(*) as count FROM comments 
                                   WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)");
        $checkStmt->execute([$ip]);
        if ($checkStmt->fetch()['count'] > 0) {
            jsonResponse(false, null, '提交太频繁，请稍后再试');
        }
        
        // 插入留言
        $stmt = $db->prepare("INSERT INTO comments (article_id, nickname, email, content, ip_address) 
                              VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$article_id, $nickname, $email, $content, $ip]);
        
        $commentId = $db->lastInsertId();
        
        jsonResponse(true, [
            'id' => $commentId,
            'article_id' => $article_id,
            'nickname' => $nickname,
            'content' => $content,
            'created_at' => '刚刚'
        ], '留言提交成功！');
        
    } catch (PDOException $e) {
        jsonResponse(false, null, '提交失败: ' . $e->getMessage());
    }
}

/**
 * 格式化时间显示
 */
function formatTime($datetime) {
    $time = strtotime($datetime);
    $now = time();
    $diff = $now - $time;
    
    if ($diff < 60) {
        return '刚刚';
    } elseif ($diff < 3600) {
        return floor($diff / 60) . '分钟前';
    } elseif ($diff < 86400) {
        return floor($diff / 3600) . '小时前';
    } elseif ($diff < 604800) {
        return floor($diff / 86400) . '天前';
    } else {
        return date('Y-m-d H:i', $time);
    }
}

/**
 * 隐藏邮箱中间部分
 */
function maskEmail($email) {
    if (empty($email)) return '';
    $parts = explode('@', $email);
    if (count($parts) !== 2) return $email;
    
    $name = $parts[0];
    $domain = $parts[1];
    
    $nameLen = strlen($name);
    if ($nameLen <= 2) {
        $maskedName = str_repeat('*', $nameLen);
    } else {
        $maskedName = substr($name, 0, 2) . str_repeat('*', $nameLen - 2);
    }
    
    return $maskedName . '@' . $domain;
}
