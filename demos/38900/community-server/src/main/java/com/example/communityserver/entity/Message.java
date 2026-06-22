package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("message")
public class Message {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long fromUserId;
    private Long toUserId;
    private String content;
    private Integer status; // 0-未读，1-已读
    private Integer type; // 0-普通消息，1-联系请求，2-收藏通知
    private Long relatedId; // 关联的物品ID或订单ID
    private LocalDateTime createTime;
    private LocalDateTime deleteTime;
}