package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("idle_order")
public class IdleOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long itemId;          // 闲置物品ID

    private Long buyerId;         // 买家ID

    private Long sellerId;        // 卖家ID

    private BigDecimal price;     // 成交价格

    private Integer status;        // 0-待确认 1-已确认(完成) 2-已取消

    private String buyerMessage;  // 买家留言

    private String cancelReason;  // 取消原因

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
