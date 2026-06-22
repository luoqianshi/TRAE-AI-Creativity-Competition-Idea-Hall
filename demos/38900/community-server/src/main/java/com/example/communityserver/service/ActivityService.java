package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.Activity;

public interface ActivityService extends IService<Activity> {

    /**
     * 居民报名活动
     */
    void signup(Long activityId, Long userId);
}
