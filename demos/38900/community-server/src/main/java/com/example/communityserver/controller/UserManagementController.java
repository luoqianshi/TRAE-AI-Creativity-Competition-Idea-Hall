package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    @Autowired
    private UserService userService;

    /**
     * 用户列表（分页）
     */
    @GetMapping
    public Result<Page<User>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer role,
            @RequestAttribute("role") String currentRole) {
        
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(User::getUsername, keyword)
                   .or()
                   .like(User::getRealName, keyword)
                   .or()
                   .like(User::getPhone, keyword);
        }
        
        if (role != null) {
            wrapper.eq(User::getRole, role);
        }
        
        wrapper.orderByDesc(User::getId);
        Page<User> result = userService.page(pageParam, wrapper);
        return Result.success(result);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id, @RequestAttribute("role") String currentRole) {
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        User user = userService.getById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(user);
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<?> create(@RequestBody User user, @RequestAttribute("role") String currentRole) {
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        // 不能创建超级管理员
        if (user.getRole() == 0) {
            return Result.error(403, "无法创建超级管理员");
        }
        
        // 设置默认密码
        user.setPassword("$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C"); // 123456
        userService.save(user);
        return Result.success(null);
    }

    /**
     * 更新用户信息（包括角色）
     * 超级管理员可以对除超级管理员外的所有人操作
     * 物业管理员只能操作居民、维修人员、家政服务员
     */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, 
                           @RequestBody Map<String, Object> data, 
                           @RequestAttribute("role") String currentRole) {
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        User user = userService.getById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        
        // 超级管理员不能修改超级管理员
        if (user.getRole() == 0) {
            return Result.error(403, "无法修改超级管理员");
        }
        
        // 物业管理员不能修改物业管理员
        if ("manager".equals(currentRole) && user.getRole() == 3) {
            return Result.error(403, "权限不足，无法修改该用户");
        }
        
        if (data.containsKey("username")) {
            user.setUsername((String) data.get("username"));
        }
        if (data.containsKey("realName")) {
            user.setRealName((String) data.get("realName"));
        }
        if (data.containsKey("phone")) {
            user.setPhone((String) data.get("phone"));
        }
        if (data.containsKey("role")) {
            int newRole = ((Number) data.get("role")).intValue();
            // 不能设置超级管理员角色
            if (newRole == 0) {
                return Result.error(403, "无法设置超级管理员角色");
            }
            // 物业管理员不能设置物业管理员角色
            if ("manager".equals(currentRole) && newRole == 3) {
                return Result.error(403, "权限不足，无法设置该角色");
            }
            user.setRole(newRole);
        }
        
        userService.updateById(user);
        return Result.success(null);
    }

    /**
     * 删除用户（逻辑删除）
     * 超级管理员可以对除超级管理员外的所有人操作
     * 物业管理员只能删除居民、维修人员、家政服务员
     */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id, @RequestAttribute("role") String currentRole) {
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        User user = userService.getById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        
        // 超级管理员不能删除超级管理员
        if (user.getRole() == 0) {
            return Result.error(403, "无法删除超级管理员");
        }
        
        // 物业管理员不能删除物业管理员
        if ("manager".equals(currentRole) && user.getRole() == 3) {
            return Result.error(403, "权限不足，无法删除该用户");
        }
        
        userService.removeById(id);
        return Result.success(null);
    }

    /**
     * 获取所有角色选项
     */
    @GetMapping("/roles")
    public Result<Map<Integer, String>> getRoles(@RequestAttribute("role") String currentRole) {
        if (!"manager".equals(currentRole) && !"admin".equals(currentRole)) {
            return Result.error(403, "权限不足");
        }
        
        Map<Integer, String> roles = new HashMap<>();
        roles.put(1, "居民");
        roles.put(2, "维修人员");
        roles.put(3, "物业管理员");
        roles.put(4, "家政服务员");
        roles.put(0, "超级管理员");
        return Result.success(roles);
    }
}
