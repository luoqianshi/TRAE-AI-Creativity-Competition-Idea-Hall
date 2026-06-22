package com.example.communityserver.controller;

import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.Message;
import com.example.communityserver.service.IdleItemService;
import com.example.communityserver.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private IdleItemService idleItemService;

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> list(@RequestAttribute("userId") Long userId) {
        return Result.success(messageService.getMessages(userId));
    }

    @GetMapping("/unread-count")
    public Result<Map<String, Object>> unreadCount(@RequestAttribute("userId") Long userId) {
        return Result.success(Map.of("count", messageService.countUnread(userId)));
    }

    @PostMapping("/send")
    public Result<?> send(@RequestBody Map<String, Object> data, @RequestAttribute("userId") Long userId) {
        Long toUserId = ((Number) data.get("toUserId")).longValue();
        String content = (String) data.get("content");
        Integer type = (Integer) data.getOrDefault("type", 0);
        Long relatedId = data.get("relatedId") != null ? ((Number) data.get("relatedId")).longValue() : null;

        Message msg = new Message();
        msg.setFromUserId(userId);
        msg.setToUserId(toUserId);
        msg.setContent(content);
        msg.setType(type);
        msg.setRelatedId(relatedId);
        msg.setStatus(0);
        msg.setCreateTime(LocalDateTime.now());
        
        messageService.save(msg);
        return Result.success(null);
    }

    @PutMapping("/read/{id}")
    public Result<?> read(@PathVariable Long id) {
        Message msg = messageService.getById(id);
        if (msg != null) {
            msg.setStatus(1);
            messageService.updateById(msg);
        }
        return Result.success(null);
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        Message msg = messageService.getById(id);
        if (msg != null) {
            msg.setDeleteTime(LocalDateTime.now());
            messageService.updateById(msg);
        }
        return Result.success(null);
    }
}