package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.User;
import com.example.communityserver.mapper.UserMapper;
import com.example.communityserver.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User login(String username, String password) {
        User user = lambdaQuery().eq(User::getUsername, username).one();
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    @Override
    public User register(User user) {
        // BCrypt 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 默认角色为居民（role = 1）
        if (user.getRole() == null) {
            user.setRole(1);
        }
        save(user);
        return user;
    }
}
