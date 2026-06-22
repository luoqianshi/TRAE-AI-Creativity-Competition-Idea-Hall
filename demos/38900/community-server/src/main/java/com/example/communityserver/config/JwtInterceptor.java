package com.example.communityserver.config;

import com.example.communityserver.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行 OPTIONS 预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                Claims claims = jwtUtil.parseToken(token);
                request.setAttribute("userId", claims.get("userId", Long.class));
                request.setAttribute("username", claims.get("username", String.class));
                request.setAttribute("role", claims.get("role", String.class));
                return true;
            } catch (Exception e) {
                throw new RuntimeException("Token无效或已过期");
            }
        }
        throw new RuntimeException("未登录，请先登录");
    }
}
