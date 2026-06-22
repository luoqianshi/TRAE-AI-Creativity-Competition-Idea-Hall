package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.Housekeeping;
import com.example.communityserver.entity.HousekeepingOrder;
import com.example.communityserver.service.HousekeepingOrderService;
import com.example.communityserver.service.HousekeepingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
public class HousekeepingOrderController {

    @Autowired
    private HousekeepingOrderService housekeepingOrderService;

    @Autowired
    private HousekeepingService housekeepingService;

    /**
     * 居民预约服务（创建订单）
     */
    @PostMapping("/order")
    public Result<?> createOrder(@RequestBody Map<String, Object> formData,
                                 @RequestAttribute("userId") Long userId) {
        try {
            HousekeepingOrder order = new HousekeepingOrder();
            order.setUserId(userId);
            
            // 获取服务ID
            Object serviceIdObj = formData.get("serviceId");
            if (serviceIdObj instanceof Number) {
                order.setServiceId(((Number) serviceIdObj).longValue());
            } else if (serviceIdObj instanceof String) {
                order.setServiceId(Long.parseLong((String) serviceIdObj));
            } else {
                return Result.error(400, "服务ID不能为空");
            }
            
            // 获取预约时间
            Object appointTimeObj = formData.get("appointTime");
            if (appointTimeObj != null && !((String) appointTimeObj).isEmpty()) {
                String timeStr = (String) appointTimeObj;
                // 处理不同格式的时间
                if (timeStr.contains("Z")) {
                    timeStr = timeStr.replace("Z", "");
                }
                if (timeStr.contains("T")) {
                    order.setAppointTime(LocalDateTime.parse(timeStr));
                } else {
                    // 处理 "yyyy-MM-dd HH:mm:ss" 格式
                    order.setAppointTime(LocalDateTime.parse(timeStr.replace(" ", "T")));
                }
            } else {
                return Result.error(400, "预约时间不能为空");
            }
            
            // 获取需求描述
            order.setDemand((String) formData.get("demand"));
            order.setStatus(0); // 已下单
            
            housekeepingOrderService.save(order);
            return Result.success(order);
        } catch (Exception e) {
            return Result.error(500, "预约失败：" + e.getMessage());
        }
    }

    /**
     * 居民查看我的订单
     */
    @GetMapping("/my-orders")
    public Result<Page<Map<String, Object>>> myOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestAttribute("userId") Long userId) {
        Page<HousekeepingOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<HousekeepingOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HousekeepingOrder::getUserId, userId);
        wrapper.orderByDesc(HousekeepingOrder::getCreateTime);
        Page<HousekeepingOrder> result = housekeepingOrderService.page(pageParam, wrapper);

        // 组合服务信息
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        List<Map<String, Object>> records = new ArrayList<>();
        for (HousekeepingOrder order : result.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("serviceId", order.getServiceId());
            map.put("appointTime", order.getAppointTime());
            map.put("status", convertStatus(order.getStatus()));
            map.put("remark", order.getDemand());
            map.put("rating", order.getRating());
            map.put("comment", order.getComment());
            // 获取服务名称
            Housekeeping service = housekeepingService.getById(order.getServiceId());
            if (service != null) {
                map.put("serviceName", service.getTitle());
            } else {
                map.put("serviceName", "服务已下架");
            }
            records.add(map);
        }
        resultPage.setRecords(records);
        return Result.success(resultPage);
    }

    /**
     * 管理员查看全部订单
     */
    @GetMapping("/orders")
    public Result<Page<Map<String, Object>>> allOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Page<HousekeepingOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<HousekeepingOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(HousekeepingOrder::getStatus, status);
        }
        wrapper.orderByDesc(HousekeepingOrder::getCreateTime);
        Page<HousekeepingOrder> result = housekeepingOrderService.page(pageParam, wrapper);

        // 组合服务信息
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        List<Map<String, Object>> records = new ArrayList<>();
        for (HousekeepingOrder order : result.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("serviceId", order.getServiceId());
            map.put("userId", order.getUserId());
            map.put("appointTime", order.getAppointTime());
            map.put("status", convertStatus(order.getStatus()));
            map.put("remark", order.getDemand());
            map.put("rating", order.getRating());
            map.put("comment", order.getComment());
            // 获取服务名称
            Housekeeping service = housekeepingService.getById(order.getServiceId());
            if (service != null) {
                map.put("serviceName", service.getTitle());
            } else {
                map.put("serviceName", "服务已下架");
            }
            records.add(map);
        }
        resultPage.setRecords(records);
        return Result.success(resultPage);
    }

    /**
     * 更新订单状态（管理员）
     */
    @PutMapping("/order/{id}/status")
    public Result<?> updateStatus(@PathVariable Long id,
                                  @RequestParam Integer status,
                                  @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        HousekeepingOrder order = housekeepingOrderService.getById(id);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }
        order.setStatus(status);
        housekeepingOrderService.updateById(order);
        return Result.success(null);
    }

    /**
     * 居民评价
     */
    @PutMapping("/order/{id}/rate")
    public Result<?> rate(@PathVariable Long id,
                          @RequestParam Integer rating,
                          @RequestParam(required = false) String comment,
                          @RequestAttribute("userId") Long userId) {
        HousekeepingOrder order = housekeepingOrderService.getById(id);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            return Result.error(403, "无权限操作此订单");
        }
        order.setRating(rating);
        order.setComment(comment);
        order.setStatus(4); // 已评价
        housekeepingOrderService.updateById(order);
        return Result.success(null);
    }

    private String convertStatus(Integer status) {
        switch (status) {
            case 0: return "PENDING";
            case 1: return "ACCEPTED";
            case 2: return "ONGOING";
            case 3: return "COMPLETED";
            case 4: return "RATED";
            default: return "UNKNOWN";
        }
    }
}
