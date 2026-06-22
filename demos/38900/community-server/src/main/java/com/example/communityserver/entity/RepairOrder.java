package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("repair_order")
public class RepairOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String description;

    private String images;       // JSON数组字符串

    private String address;

    private String phone;

    private Integer status;      // 0-待受理 1-处理中 2-待确认 3-已完成 4-已评价

    private Long handlerId;      // 维修人员ID

    private String result;

    private Integer rating;

    private String comment;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    private LocalDateTime acceptTime;

    private LocalDateTime finishTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
