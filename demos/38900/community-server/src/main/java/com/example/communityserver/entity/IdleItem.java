package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("idle_item")
public class IdleItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String description;

    private String images;

    private String category;

    private BigDecimal price;

    private String tradeType;

    private Integer status;       // 0-待审核 1-已发布 2-已售出 3-已下架

    private String auditReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
