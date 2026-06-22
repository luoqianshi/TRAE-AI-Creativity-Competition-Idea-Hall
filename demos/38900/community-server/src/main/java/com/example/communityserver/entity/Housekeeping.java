package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("housekeeping")
public class Housekeeping {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String category;

    private BigDecimal price;

    private String intro;

    private String phone;

    private Integer status;       // 0-下架 1-上架

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
