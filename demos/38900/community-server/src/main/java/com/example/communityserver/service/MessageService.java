package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.Message;

import java.util.List;
import java.util.Map;

public interface MessageService extends IService<Message> {
    List<Map<String, Object>> getMessages(Long userId);
    int countUnread(Long userId);
}