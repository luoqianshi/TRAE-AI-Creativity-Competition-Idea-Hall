package com.example.communityserver.controller;

import com.example.communityserver.common.result.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${file.upload-path}")
    private String uploadPath;

    @PostMapping("/image")
    public Result<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error(400, "文件不能为空");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + extension;

            String uploadDir = uploadPath + "uploads/";
            File destFile = new File(uploadDir + newFilename);
            if (!destFile.getParentFile().exists()) {
                destFile.getParentFile().mkdirs();
            }
            file.transferTo(destFile);

            String url = "/uploads/" + newFilename;
            Map<String, Object> data = new HashMap<>();
            data.put("url", url);
            data.put("name", newFilename);
            return Result.success(data);
        } catch (IOException e) {
            return Result.error(500, "文件上传失败");
        }
    }

    @PostMapping("/images")
    public Result<Map<String, Object>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Result.error(400, "文件不能为空");
        }

        StringBuilder urls = new StringBuilder();
        try {
            String uploadDir = uploadPath + "uploads/";
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String originalFilename = file.getOriginalFilename();
                    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String newFilename = UUID.randomUUID().toString() + extension;

                    File destFile = new File(uploadDir + newFilename);
                    if (!destFile.getParentFile().exists()) {
                        destFile.getParentFile().mkdirs();
                    }
                    file.transferTo(destFile);

                    if (urls.length() > 0) {
                        urls.append(",");
                    }
                    urls.append("/uploads/").append(newFilename);
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("urls", urls.toString());
            return Result.success(data);
        } catch (IOException e) {
            return Result.error(500, "文件上传失败");
        }
    }
}