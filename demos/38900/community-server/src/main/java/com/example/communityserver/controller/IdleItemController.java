package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.IdleItem;
import com.example.communityserver.entity.IdleOrder;
import com.example.communityserver.entity.Message;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.IdleItemService;
import java.math.BigDecimal;
import com.example.communityserver.service.IdleOrderService;
import com.example.communityserver.service.MessageService;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/idle")
public class IdleItemController {

    @Autowired
    private IdleItemService idleItemService;

    @Autowired
    private IdleOrderService idleOrderService;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageService messageService;

    /**
     * 居民发布闲置物品
     */
    @PostMapping
    public Result<?> publish(@RequestBody IdleItem item,
                             @RequestAttribute("userId") Long userId) {
        item.setUserId(userId);
        item.setStatus(0); // 待审核
        idleItemService.save(item);
        return Result.success(null);
    }

    /**
     * 前台列表（居民只显示已发布的，管理员显示所有状态）
     */
    @GetMapping("/list")
    public Result<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestAttribute(required = false) String role) {
        Page<IdleItem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleItem> wrapper = new LambdaQueryWrapper<>();
        // 管理员可以看到所有状态，普通居民只能看到已发布的
        if (!"manager".equals(role) && !"admin".equals(role)) {
            wrapper.eq(IdleItem::getStatus, 1); // 已发布
        } else if (status != null) {
            // 管理员可以按状态筛选
            wrapper.eq(IdleItem::getStatus, status);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.like(IdleItem::getCategory, category);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(IdleItem::getTitle, keyword);
        }
        wrapper.orderByDesc(IdleItem::getCreateTime);
        Page<IdleItem> result = idleItemService.page(pageParam, wrapper);
        
        // 转换为前端需要的格式
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(convertToMapList(result.getRecords()));
        return Result.success(resultPage);
    }

    /**
     * 闲置物品详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        IdleItem item = idleItemService.getById(id);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }
        Map<String, Object> map = convertToMap(item);
        return Result.success(map);
    }

    /**
     * 我的闲置列表（发布者查看）
     */
    @GetMapping("/my-list")
    public Result<Page<Map<String, Object>>> myList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestAttribute("userId") Long userId) {
        Page<IdleItem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleItem::getUserId, userId)
               .orderByDesc(IdleItem::getCreateTime);
        Page<IdleItem> result = idleItemService.page(pageParam, wrapper);
        
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(convertToMapList(result.getRecords()));
        return Result.success(resultPage);
    }

    /**
     * 管理员待审核列表
     */
    @GetMapping("/audit-list")
    public Result<Page<Map<String, Object>>> auditList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Page<IdleItem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleItem> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(IdleItem::getStatus, status);
        } else {
            wrapper.eq(IdleItem::getStatus, 0); // 默认待审核
        }
        wrapper.orderByDesc(IdleItem::getCreateTime);
        Page<IdleItem> result = idleItemService.page(pageParam, wrapper);
        
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(convertToMapList(result.getRecords()));
        return Result.success(resultPage);
    }

    /**
     * 发布者编辑闲置物品（仅能修改标题、描述、分类、价格、交易方式、图片）
     */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id,
                            @RequestBody Map<String, Object> data,
                            @RequestAttribute("userId") Long userId) {
        IdleItem item = idleItemService.getById(id);
        if (item == null || !Objects.equals(item.getUserId(), userId)) {
            return Result.error(403, "无权操作");
        }
        // 只能修改以下字段，且修改后需要重新审核
        if (data.containsKey("title")) {
            item.setTitle((String) data.get("title"));
        }
        if (data.containsKey("description")) {
            item.setDescription((String) data.get("description"));
        }
        if (data.containsKey("category")) {
            item.setCategory((String) data.get("category"));
        }
        if (data.containsKey("price")) {
            item.setPrice(BigDecimal.valueOf(((Number) data.get("price")).doubleValue()));
        }
        if (data.containsKey("tradeType")) {
            item.setTradeType((String) data.get("tradeType"));
        }
        if (data.containsKey("images")) {
            item.setImages((String) data.get("images"));
        }
        // 修改后重新审核
        item.setStatus(0);
        item.setAuditReason(null);
        idleItemService.updateById(item);
        return Result.success(null);
    }

    /**
     * 管理员审核（通过/驳回）
     */
    @PutMapping("/audit/{id}")
    public Result<?> audit(@PathVariable Long id,
                           @RequestParam Integer status,  // 1-通过 3-下架
                           @RequestParam(required = false) String reason,
                           @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        IdleItem item = idleItemService.getById(id);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }
        item.setStatus(status);
        if (status == 3 && reason != null) {
            item.setAuditReason(reason);
        }
        idleItemService.updateById(item);
        return Result.success(null);
    }

    /**
     * 发布者标记售出/下架
     */
    @PutMapping("/status/{id}")
    public Result<?> changeStatus(@PathVariable Long id,
                                  @RequestParam Integer status,  // 2-售出 3-下架
                                  @RequestAttribute("userId") Long userId) {
        IdleItem item = idleItemService.getById(id);
        if (item == null || !Objects.equals(item.getUserId(), userId)) {
            return Result.error(403, "无权操作");
        }
        // 如果标记为售出，自动创建订单
        if (status == 2) {
            IdleOrder order = new IdleOrder();
            order.setItemId(id);
            order.setBuyerId(userId); // 卖给发布者自己（线下交易）
            order.setSellerId(item.getUserId());
            order.setPrice(item.getPrice());
            order.setStatus(1); // 直接标记为已完成
            order.setBuyerMessage("线下交易");
            idleOrderService.save(order);
        }
        item.setStatus(status);
        idleItemService.updateById(item);
        return Result.success(null);
    }

    /**
     * 管理员强制下架
     */
    @PutMapping("/force-offline/{id}")
    public Result<?> forceOffline(@PathVariable Long id,
                                  @RequestParam(required = false) String reason,
                                  @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        IdleItem item = idleItemService.getById(id);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }
        item.setStatus(3); // 下架
        if (reason != null) {
            item.setAuditReason(reason);
        }
        idleItemService.updateById(item);
        return Result.success(null);
    }

    // ==================== 购买功能 ====================

    /**
     * 发起购买（创建订单）
     */
    @PostMapping("/order/buy")
    public Result<?> buyItem(@RequestBody Map<String, Object> data,
                             @RequestAttribute("userId") Long userId) {
        Long itemId = ((Number) data.get("itemId")).longValue();
        String message = (String) data.get("message");

        IdleItem item = idleItemService.getById(itemId);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }
        if (item.getStatus() != 1) {
            return Result.error(400, "物品已下架或已售出");
        }
        if (Objects.equals(item.getUserId(), userId)) {
            return Result.error(400, "不能购买自己发布的物品");
        }

        // 检查是否已有进行中的订单
        LambdaQueryWrapper<IdleOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleOrder::getItemId, itemId)
               .eq(IdleOrder::getBuyerId, userId)
               .in(IdleOrder::getStatus, 0, 1);
        if (idleOrderService.count(wrapper) > 0) {
            return Result.error(400, "您已购买或正在购买该物品");
        }

        IdleOrder order = new IdleOrder();
        order.setItemId(itemId);
        order.setBuyerId(userId);
        order.setSellerId(item.getUserId());
        order.setPrice(item.getPrice());
        order.setStatus(0);
        order.setBuyerMessage(message);
        idleOrderService.save(order);

        return Result.success(null);
    }

    /**
     * 卖家确认订单（交易完成）
     */
    @PutMapping("/order/{id}/confirm")
    public Result<?> confirmOrder(@PathVariable Long id,
                                  @RequestAttribute("userId") Long userId) {
        IdleOrder order = idleOrderService.getById(id);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }

        IdleItem item = idleItemService.getById(order.getItemId());
        if (item == null) {
            return Result.error(404, "物品不存在");
        }

        // 只有卖家可以确认
        if (!Objects.equals(order.getSellerId(), userId)) {
            return Result.error(403, "无权操作");
        }
        if (order.getStatus() != 0) {
            return Result.error(400, "订单已处理");
        }

        // 更新订单状态
        order.setStatus(1);
        idleOrderService.updateById(order);

        // 更新物品状态为已售出
        item.setStatus(2);
        idleItemService.updateById(item);

        return Result.success(null);
    }

    /**
     * 取消订单
     */
    @PutMapping("/order/{id}/cancel")
    public Result<?> cancelOrder(@PathVariable Long id,
                                 @RequestParam(required = false) String reason,
                                 @RequestAttribute("userId") Long userId) {
        IdleOrder order = idleOrderService.getById(id);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }

        // 买家或卖家都可以取消
        if (!Objects.equals(order.getBuyerId(), userId) && !Objects.equals(order.getSellerId(), userId)) {
            return Result.error(403, "无权操作");
        }
        if (order.getStatus() != 0) {
            return Result.error(400, "订单已处理，无法取消");
        }

        order.setStatus(2);
        order.setCancelReason(reason);
        idleOrderService.updateById(order);

        return Result.success(null);
    }

    /**
     * 我的订单（我购买的）
     */
    @GetMapping("/order/my-orders")
    public Result<Page<Map<String, Object>>> myOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestAttribute("userId") Long userId) {
        Page<IdleOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleOrder::getBuyerId, userId)
               .orderByDesc(IdleOrder::getCreateTime);
        Page<IdleOrder> result = idleOrderService.page(pageParam, wrapper);

        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(result.getRecords().stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("itemId", order.getItemId());
            map.put("price", order.getPrice());
            map.put("status", order.getStatus());
            map.put("buyerMessage", order.getBuyerMessage());
            map.put("createTime", order.getCreateTime());
            // 查询物品信息
            IdleItem item = idleItemService.getById(order.getItemId());
            if (item != null) {
                map.put("itemTitle", item.getTitle());
                map.put("itemCover", getFirstImage(item.getImages()));
            }
            return map;
        }).collect(Collectors.toList()));
        return Result.success(resultPage);
    }

    /**
     * 我收到的订单（我售卖的）
     */
    @GetMapping("/order/my-sales")
    public Result<Page<Map<String, Object>>> mySales(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestAttribute("userId") Long userId) {
        Page<IdleOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleOrder::getSellerId, userId)
               .orderByDesc(IdleOrder::getCreateTime);
        Page<IdleOrder> result = idleOrderService.page(pageParam, wrapper);

        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(result.getRecords().stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("itemId", order.getItemId());
            map.put("price", order.getPrice());
            map.put("status", order.getStatus());
            map.put("buyerMessage", order.getBuyerMessage());
            map.put("createTime", order.getCreateTime());
            // 查询买家信息
            User buyer = userService.getById(order.getBuyerId());
            if (buyer != null) {
                map.put("buyerName", buyer.getRealName());
                map.put("buyerPhone", buyer.getPhone());
            }
            // 查询物品信息
            IdleItem item = idleItemService.getById(order.getItemId());
            if (item != null) {
                map.put("itemTitle", item.getTitle());
                map.put("itemCover", getFirstImage(item.getImages()));
            }
            return map;
        }).collect(Collectors.toList()));
        return Result.success(resultPage);
    }

    /**
     * 联系卖家
     */
    @PostMapping("/contact")
    public Result<?> contactSeller(@RequestBody Map<String, Object> data,
                                   @RequestAttribute("userId") Long userId) {
        Long itemId = ((Number) data.get("itemId")).longValue();
        String message = (String) data.get("message");

        IdleItem item = idleItemService.getById(itemId);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }

        // 创建消息记录发送给卖家
        Message msg = new Message();
        msg.setFromUserId(userId);
        msg.setToUserId(item.getUserId());
        msg.setContent(message != null ? message : "我想购买您的商品：" + item.getTitle());
        msg.setType(1); // 联系请求
        msg.setRelatedId(itemId);
        msg.setStatus(0);
        msg.setCreateTime(LocalDateTime.now());

        messageService.save(msg);
        return Result.success(null);
    }

    /**
     * 表达购买意向（我想要）
     */
    @PostMapping("/want")
    public Result<?> wantItem(@RequestBody Map<String, Object> data,
                              @RequestAttribute("userId") Long userId) {
        Long itemId = ((Number) data.get("itemId")).longValue();

        IdleItem item = idleItemService.getById(itemId);
        if (item == null) {
            return Result.error(404, "物品不存在");
        }

        if (Objects.equals(item.getUserId(), userId)) {
            return Result.error(400, "不能对自己发布的物品表达购买意向");
        }

        // 创建消息通知卖家
        Message msg = new Message();
        msg.setFromUserId(userId);
        msg.setToUserId(item.getUserId());
        msg.setContent("有人对您的商品「" + item.getTitle() + "」表达了购买意向");
        msg.setType(2); // 收藏通知/购买意向
        msg.setRelatedId(itemId);
        msg.setStatus(0);
        msg.setCreateTime(LocalDateTime.now());

        messageService.save(msg);
        return Result.success(null);
    }
    
    /**
     * 将 IdleItem 转换为 Map，包含 coverImg 和 publisher 字段
     */
    private Map<String, Object> convertToMap(IdleItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("userId", item.getUserId());
        map.put("title", item.getTitle());
        map.put("description", item.getDescription());
        map.put("images", item.getImages());
        String coverImg = getFirstImage(item.getImages());
        map.put("coverImg", coverImg);
        map.put("category", item.getCategory());
        map.put("price", item.getPrice());
        map.put("tradeType", item.getTradeType());
        map.put("status", item.getStatus());
        map.put("auditReason", item.getAuditReason());
        map.put("createTime", item.getCreateTime());
        if (item.getUserId() != null) {
            User user = userService.getById(item.getUserId());
            if (user != null) {
                map.put("publisher", user.getRealName());
                map.put("phone", user.getPhone());
            } else {
                map.put("publisher", "未知");
            }
        }
        return map;
    }
    
    /**
     * 批量转换
     */
    private List<Map<String, Object>> convertToMapList(List<IdleItem> items) {
        return items.stream().map(this::convertToMap).collect(Collectors.toList());
    }
    
    /**
     * 获取第一张图片
     */
    private String getFirstImage(String images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        // images 可能是 JSON 数组字符串，尝试解析
        String trimmed = images.trim();
        if (trimmed.startsWith("[")) {
            try {
                // 简单解析 JSON 数组
                trimmed = trimmed.substring(1, trimmed.length() - 1);
                String first = trimmed.split(",")[0].trim();
                // 去除引号
                if (first.startsWith("\"") && first.endsWith("\"")) {
                    first = first.substring(1, first.length() - 1);
                }
                if (first.startsWith("'") && first.endsWith("'")) {
                    first = first.substring(1, first.length() - 1);
                }
                return first.isEmpty() ? null : first;
            } catch (Exception e) {
                return null;
            }
        }
        // 如果不是 JSON 数组，假设是逗号分隔
        String[] parts = images.split(",");
        return parts.length > 0 && !parts[0].trim().isEmpty() ? parts[0].trim() : null;
    }
}
