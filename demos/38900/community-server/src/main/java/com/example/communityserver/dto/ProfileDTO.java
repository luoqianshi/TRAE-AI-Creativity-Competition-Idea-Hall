package com.example.communityserver.dto;

import lombok.Data;

@Data
public class ProfileDTO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String avatar;
    private String role;
    private String communityName;
    
    // 居民统计
    private Integer repairCount;
    private Integer idleCount;
    private Integer activitySignupCount;
    private Integer housekeepingOrderCount;
    
    // 维修人员统计
    private Integer pendingCount;
    private Integer completedCount;
    
    // 物业管理员统计
    private Integer pendingIdleCount;
    private Integer pendingRepairCount;
    private Integer monthActivityCount;
    
    // 超级管理员统计
    private Integer totalUserCount;
    private Integer totalRepairCount;
}
