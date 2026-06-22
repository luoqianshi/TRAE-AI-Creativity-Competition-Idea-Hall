package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.Housekeeping;
import com.example.communityserver.service.HousekeepingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
public class HousekeepingController {

    @Autowired
    private HousekeepingService housekeepingService;

    /**
     * 管理员上架服务
     */
    @PostMapping
    public Result<?> add(@RequestBody Map<String, Object> formData,
                         @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Housekeeping housekeeping = new Housekeeping();
        housekeeping.setTitle((String) formData.get("name"));
        housekeeping.setCategory((String) formData.get("category"));
        if (formData.get("price") instanceof Number) {
            housekeeping.setPrice(BigDecimal.valueOf(((Number) formData.get("price")).doubleValue()));
        }
        housekeeping.setPhone((String) formData.get("phone"));
        housekeeping.setIntro((String) formData.get("description"));
        housekeeping.setStatus(1); // 上架
        housekeepingService.save(housekeeping);
        return Result.success(housekeeping);
    }

    /**
     * 管理员编辑服务
     */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id,
                            @RequestBody Map<String, Object> formData,
                            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Housekeeping housekeeping = housekeepingService.getById(id);
        if (housekeeping == null) {
            return Result.error(404, "服务不存在");
        }
        if (formData.get("name") != null) housekeeping.setTitle((String) formData.get("name"));
        if (formData.get("category") != null) housekeeping.setCategory((String) formData.get("category"));
        if (formData.get("price") != null) {
            if (formData.get("price") instanceof Number) {
                housekeeping.setPrice(BigDecimal.valueOf(((Number) formData.get("price")).doubleValue()));
            }
        }
        if (formData.get("phone") != null) housekeeping.setPhone((String) formData.get("phone"));
        if (formData.get("description") != null) housekeeping.setIntro((String) formData.get("description"));
        housekeepingService.updateById(housekeeping);
        return Result.success(null);
    }

    /**
     * 管理员上架/下架
     */
    @PutMapping("/{id}/status")
    public Result<?> changeStatus(@PathVariable Long id,
                                  @RequestParam Integer status, // 0-下架 1-上架
                                  @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Housekeeping housekeeping = housekeepingService.getById(id);
        if (housekeeping == null) {
            return Result.error(404, "服务不存在");
        }
        housekeeping.setStatus(status);
        housekeepingService.updateById(housekeeping);
        return Result.success(null);
    }

    /**
     * 服务列表（居民端，只显示上架的）
     */
    @GetMapping("/list")
    public Result<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<Housekeeping> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Housekeeping> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Housekeeping::getStatus, 1); // 上架
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Housekeeping::getTitle, keyword);
        }
        wrapper.orderByDesc(Housekeeping::getCreateTime);
        Page<Housekeeping> result = housekeepingService.page(pageParam, wrapper);

        // 转换字段名
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        List<Map<String, Object>> records = new ArrayList<>();
        for (Housekeeping hk : result.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", hk.getId());
            map.put("name", hk.getTitle()); // title -> name
            map.put("category", hk.getCategory());
            map.put("price", hk.getPrice());
            map.put("description", hk.getIntro()); // intro -> description
            map.put("phone", hk.getPhone());
            records.add(map);
        }
        resultPage.setRecords(records);
        return Result.success(resultPage);
    }

    /**
     * 管理员全部服务列表
     */
    @GetMapping("/admin-list")
    public Result<Page<Housekeeping>> adminList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Page<Housekeeping> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Housekeeping> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Housekeeping::getStatus, status);
        }
        wrapper.orderByDesc(Housekeeping::getCreateTime);
        return Result.success(housekeepingService.page(pageParam, wrapper));
    }

    /**
     * 服务详情
     */
    @GetMapping("/{id}")
    public Result<Housekeeping> detail(@PathVariable Long id) {
        Housekeeping housekeeping = housekeepingService.getById(id);
        if (housekeeping == null) {
            return Result.error(404, "服务不存在");
        }
        return Result.success(housekeeping);
    }

    /**
     * 管理员删除服务（软删除）
     */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id,
                            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        housekeepingService.removeById(id);
        return Result.success(null);
    }
}
