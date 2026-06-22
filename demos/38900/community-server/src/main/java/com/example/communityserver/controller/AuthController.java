package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.UserService;
import com.example.communityserver.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginForm) {
        String username = loginForm.get("username");
        String password = loginForm.get("password");

        if (username == null || password == null) {
            return Result.error(400, "用户名和密码不能为空");
        }

        User user = userService.login(username, password);
        if (user == null) {
            return Result.error(401, "用户名或密码错误");
        }

        // 转换 role 为前端使用的字符串
        // 数据库角色定义：0=超级管理员 1=居民 2=维修人员 3=物业管理员 4=家政服务员
        String roleStr;
        switch (user.getRole() != null ? user.getRole() : 0) {
            case 0:
                roleStr = "admin";
                break;
            case 1:
                roleStr = "resident";
                break;
            case 2:
                roleStr = "maintainer";
                break;
            case 3:
                roleStr = "manager";
                break;
            case 4:
            default:
                roleStr = "housekeeper";
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roleStr);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", sanitizeUser(user));
        return Result.success(data);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return Result.error(400, "用户名和密码不能为空");
        }

        long count = userService.count(
                new LambdaQueryWrapper<User>().eq(User::getUsername, user.getUsername()));
        if (count > 0) {
            return Result.error(400, "用户名已存在");
        }

        User registered = userService.register(user);
        return Result.success(sanitizeUser(registered));
    }

    /**
     * 去除密码等敏感信息后返回
     */
    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("realName", user.getRealName());
        map.put("phone", user.getPhone());
        map.put("avatar", user.getAvatar());
        
        // 转换 role: 数据库角色定义：0=超级管理员 1=居民 2=维修人员 3=物业管理员 4=家政服务员
        String roleStr;
        switch (user.getRole() != null ? user.getRole() : 0) {
            case 0:
                roleStr = "admin";
                break;
            case 1:
                roleStr = "resident";
                break;
            case 2:
                roleStr = "maintainer";
                break;
            case 3:
                roleStr = "manager";
                break;
            case 4:
            default:
                roleStr = "housekeeper";
        }
        map.put("role", roleStr);
        
        map.put("communityId", user.getCommunityId());
        map.put("createTime", user.getCreateTime());
        return map;
    }
}
