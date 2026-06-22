package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.Message;
import com.example.communityserver.entity.User;
import com.example.communityserver.mapper.MessageMapper;
import com.example.communityserver.service.MessageService;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    @Autowired
    private UserService userService;

    @Override
    public List<Map<String, Object>> getMessages(Long userId) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getToUserId, userId)
               .isNull(Message::getDeleteTime)
               .orderByDesc(Message::getCreateTime);
        
        List<Message> messages = list(wrapper);
        
        return messages.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    @Override
    public int countUnread(Long userId) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getToUserId, userId)
               .eq(Message::getStatus, 0)
               .isNull(Message::getDeleteTime);
        return (int) count(wrapper);
    }

    private Map<String, Object> convertToMap(Message msg) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", msg.getId());
        map.put("content", msg.getContent());
        map.put("status", msg.getStatus());
        map.put("type", msg.getType());
        map.put("relatedId", msg.getRelatedId());
        map.put("createTime", msg.getCreateTime());
        
        User fromUser = userService.getById(msg.getFromUserId());
        if (fromUser != null) {
            map.put("fromUserName", fromUser.getRealName());
            map.put("fromUserId", fromUser.getId());
        }
        return map;
    }
}