package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.User;

public interface UserService extends IService<User> {

    /**
     * 用户登录：根据用户名查询并校验密码
     * @return 登录成功返回 User，失败返回 null
     */
    User login(String username, String password);

    /**
     * 用户注册：密码 BCrypt 加密，设置默认角色
     */
    User register(User user);
}
