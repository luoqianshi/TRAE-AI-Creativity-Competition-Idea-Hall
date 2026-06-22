package com.example.communityserver.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.dto.PasswordUpdateDTO;
import com.example.communityserver.dto.ProfileDTO;
import com.example.communityserver.dto.ProfileUpdateDTO;
import com.example.communityserver.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @Value("${file.upload-path}")
    private String uploadPath;

    @GetMapping("/profile")
    public Result<ProfileDTO> getProfile(@RequestAttribute("userId") Long userId,
                                         @RequestAttribute("role") String role) {
        ProfileDTO profile = userProfileService.getProfile(userId, role);
        if (profile == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(profile);
    }

    @PutMapping("/profile")
    public Result<?> updateProfile(@RequestAttribute("userId") Long userId,
                                   @RequestBody ProfileUpdateDTO dto) {
        boolean success = userProfileService.updateProfile(userId, dto);
        if (success) {
            return Result.success(null);
        } else {
            return Result.error(500, "更新失败");
        }
    }

    @PostMapping("/avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestAttribute("userId") Long userId,
                                                    @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error(400, "文件不能为空");
        }
        
        try {
            // 简单的文件上传实现
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + extension;
            
            // 保存路径
            String uploadDir = uploadPath;
            File destFile = new File(uploadDir + "uploads/" + newFilename);
            if (!destFile.getParentFile().exists()) {
                destFile.getParentFile().mkdirs();
            }
            file.transferTo(destFile);
            
            // 更新用户头像
            String avatarUrl = "/uploads/" + newFilename;
            userProfileService.updateAvatar(userId, avatarUrl);
            
            Map<String, String> data = new HashMap<>();
            data.put("avatar", avatarUrl);
            return Result.success(data);
        } catch (IOException e) {
            return Result.error(500, "文件上传失败");
        }
    }

    @PutMapping("/password")
    public Result<?> updatePassword(@RequestAttribute("userId") Long userId,
                                    @RequestBody PasswordUpdateDTO dto) {
        if (dto.getOldPassword() == null || dto.getNewPassword() == null || dto.getConfirmPassword() == null) {
            return Result.error(400, "参数不完整");
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            return Result.error(400, "两次密码不一致");
        }
        
        boolean success = userProfileService.updatePassword(userId, dto);
        if (success) {
            return Result.success(null);
        } else {
            return Result.error(400, "密码修改失败，请检查旧密码是否正确");
        }
    }

    @GetMapping("/records")
    public Result<Page<?>> getRecords(@RequestAttribute("userId") Long userId,
                                      @RequestParam String type,
                                      @RequestParam(defaultValue = "1") Integer page,
                                      @RequestParam(defaultValue = "10") Integer size) {
        Page<?> records = userProfileService.getRecords(userId, type, page, size);
        return Result.success(records);
    }
}
