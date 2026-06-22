package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.RepairOrder;
import com.example.communityserver.service.RepairOrderService;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repair")
public class RepairOrderController {

    @Autowired
    private RepairOrderService repairOrderService;

    @Autowired
    private UserService userService;

    // ==================== 居民端 ====================

    /**
     * 居民提交报修
     */
    @PostMapping("/submit")
    public Result<?> submit(@RequestBody RepairOrder order,
                            @RequestAttribute("userId") Long userId) {
        order.setUserId(userId);
        repairOrderService.submit(order);
        return Result.success(null);
    }

    /**
     * 居民查看"我的"报修列表
     */
    @GetMapping("/my-list")
    public Result<Page<RepairOrder>> myList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status,
            @RequestAttribute("userId") Long userId) {
        Page<RepairOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getUserId, userId);

        // 状态映射：前端英文 -> 后端数字
        if (status != null && !status.isEmpty()) {
            Integer statusInt = null;
            switch (status) {
                case "PENDING":    statusInt = 0; break;
                case "PROCESSING": statusInt = 1; break;
                case "CONFIRMING": statusInt = 2; break;
                case "COMPLETED":  statusInt = 3; break;
                case "RATED":      statusInt = 4; break;
            }
            if (statusInt != null) {
                wrapper.eq(RepairOrder::getStatus, statusInt);
            }
        }

        wrapper.orderByDesc(RepairOrder::getCreateTime);
        return Result.success(repairOrderService.page(pageParam, wrapper));
    }

    /**
     * 居民确认完工
     */
    @PutMapping("/confirm/{id}")
    public Result<?> confirm(@PathVariable Long id,
                             @RequestAttribute("userId") Long userId) {
        RepairOrder order = repairOrderService.getById(id);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            return Result.error(403, "无权操作");
        }
        repairOrderService.confirm(id);
        return Result.success(null);
    }

    /**
     * 居民评价工单
     */
    @PutMapping("/rate/{id}")
    public Result<?> rate(@PathVariable Long id,
                          @RequestParam Integer rating,
                          @RequestParam(required = false) String comment,
                          @RequestAttribute("userId") Long userId) {
        RepairOrder order = repairOrderService.getById(id);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            return Result.error(403, "无权操作");
        }
        repairOrderService.rate(id, rating, comment);
        return Result.success(null);
    }

    // ==================== 物业管理员端 ====================

    /**
     * 全部工单列表（物业/管理员查看，可按状态筛选）
     */
    @GetMapping("/list")
    public Result<Page<RepairOrder>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status,
            @RequestAttribute("role") String role) {
        // role: manager/admin 可查看
        if (!"manager".equals(role) && !"admin".equals(role) && !"maintainer".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Page<RepairOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        
        // 状态映射：前端英文 -> 后端数字
        if (status != null && !status.isEmpty()) {
            Integer statusInt = null;
            switch (status) {
                case "PENDING":    statusInt = 0; break;
                case "PROCESSING": statusInt = 1; break;
                case "CONFIRMING": statusInt = 2; break;
                case "COMPLETED":  statusInt = 3; break;
                case "RATED":      statusInt = 4; break;
            }
            if (statusInt != null) {
                wrapper.eq(RepairOrder::getStatus, statusInt);
            }
        }
        
        // 维修人员只看自己的工单
        if ("maintainer".equals(role)) {
            Long userId = (Long) org.springframework.web.context.request.RequestContextHolder
                    .currentRequestAttributes()
                    .getAttribute("userId", org.springframework.web.context.request.RequestAttributes.SCOPE_REQUEST);
            wrapper.eq(RepairOrder::getHandlerId, userId);
        }
        
        wrapper.orderByDesc(RepairOrder::getCreateTime);
        return Result.success(repairOrderService.page(pageParam, wrapper));
    }

    /**
     * 物业接单并指派维修人员
     */
    @PutMapping("/assign/{id}")
    public Result<?> assign(@PathVariable Long id,
                            @RequestParam Long handlerId,
                            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        repairOrderService.assign(id, handlerId);
        return Result.success(null);
    }

    /**
     * 获取维修人员列表（用于派单选择）
     */
    @GetMapping("/handlers")
    public Result<?> getHandlers(@RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getRole, 1);
        List<User> maintainers = userService.list(wrapper);
        List<Map<String, Object>> result = maintainers.stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getRealName() != null ? u.getRealName() : u.getUsername());
                    return map;
                })
                .collect(Collectors.toList());
        return Result.success(result);
    }

    // ==================== 维修人员端 ====================

    /**
     * 维修人员完工
     */
    @PutMapping("/complete/{id}")
    public Result<?> complete(@PathVariable Long id,
                              @RequestParam String result,
                              @RequestAttribute("role") String role) {
        if (!"maintainer".equals(role)) {
            return Result.error(403, "权限不足");
        }
        repairOrderService.complete(id, result);
        return Result.success(null);
    }

    // ==================== 通用接口 ====================

    /**
     * 工单详情（所有角色可查看）
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        RepairOrder order = repairOrderService.getById(id);
        if (order == null) {
            return Result.error(404, "工单不存在");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("userId", order.getUserId());
        result.put("title", order.getTitle());
        result.put("description", order.getDescription());
        result.put("images", parseImages(order.getImages()));
        result.put("address", order.getAddress());
        result.put("phone", order.getPhone());
        result.put("status", order.getStatus());
        result.put("handlerId", order.getHandlerId());
        result.put("result", order.getResult());
        result.put("rating", order.getRating());
        result.put("comment", order.getComment());
        result.put("createTime", order.getCreateTime());
        result.put("acceptTime", order.getAcceptTime());
        result.put("finishTime", order.getFinishTime());
        return Result.success(result);
    }

    private List<String> parseImages(String images) {
        if (images == null || images.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        // images 是 JSON 数组字符串，尝试解析
        String trimmed = images.trim();
        if (!trimmed.startsWith("[")) {
            // 如果不是 JSON 数组格式，尝试按逗号分割
            java.util.List<String> result = new java.util.ArrayList<>();
            String[] parts = trimmed.split(",");
            for (String part : parts) {
                String item = part.trim();
                if (!item.isEmpty()) {
                    // 确保路径以 /uploads/ 开头
                    if (!item.startsWith("/")) {
                        item = "/" + item;
                    }
                    if (!item.startsWith("/uploads/")) {
                        item = "/uploads/" + item.replaceFirst("^uploads/", "");
                    }
                    result.add(item);
                }
            }
            return result;
        }
        try {
            // 简单解析 JSON 数组
            trimmed = trimmed.substring(1, trimmed.length() - 1);
            String[] parts = trimmed.split(",");
            java.util.List<String> result = new java.util.ArrayList<>();
            for (String part : parts) {
                String item = part.trim();
                // 去除引号
                if (item.startsWith("\"") && item.endsWith("\"")) {
                    item = item.substring(1, item.length() - 1);
                }
                if (item.startsWith("'") && item.endsWith("'")) {
                    item = item.substring(1, item.length() - 1);
                }
                if (!item.isEmpty()) {
                    // 确保路径以 /uploads/ 开头
                    if (!item.startsWith("/")) {
                        item = "/" + item;
                    }
                    if (!item.startsWith("/uploads/")) {
                        item = "/uploads/" + item.replaceFirst("^uploads/", "");
                    }
                    result.add(item);
                }
            }
            return result;
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }
}
