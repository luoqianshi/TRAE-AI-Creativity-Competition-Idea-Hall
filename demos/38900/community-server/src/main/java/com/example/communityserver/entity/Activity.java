package com.example.communityserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("activity")
public class Activity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String location;

    private Integer maxPeople;

    private Integer currentPeople;

    private Integer status;       // 0-报名中 1-已满额 2-进行中 3-已结束 4-已取消

    private Long publisherId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private LocalDateTime deleteTime;
}
