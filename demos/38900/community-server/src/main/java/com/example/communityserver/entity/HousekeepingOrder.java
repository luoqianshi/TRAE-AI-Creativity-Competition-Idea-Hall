package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("housekeeping_order")
public class HousekeepingOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long serviceId;

    private LocalDateTime appointTime;

    private String demand;

    private Integer status;       // 0-已下单 1-已接单 2-服务中 3-已完成 4-已评价

    private Integer rating;

    private String comment;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
