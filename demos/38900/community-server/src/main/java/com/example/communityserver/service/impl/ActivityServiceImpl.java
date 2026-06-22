package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.Activity;
import com.example.communityserver.entity.ActivitySignup;
import com.example.communityserver.mapper.ActivityMapper;
import com.example.communityserver.mapper.ActivitySignupMapper;
import com.example.communityserver.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ActivityServiceImpl extends ServiceImpl<ActivityMapper, Activity> implements ActivityService {

    @Autowired
    private ActivitySignupMapper signupMapper;

    @Override
    @Transactional
    public void signup(Long activityId, Long userId) {
        Activity activity = getById(activityId);
        if (activity == null || activity.getStatus() != 0) {
            throw new RuntimeException("活动不可报名");
        }
        // 检查是否已报名
        LambdaQueryWrapper<ActivitySignup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivitySignup::getActivityId, activityId)
               .eq(ActivitySignup::getUserId, userId);
        if (signupMapper.selectCount(wrapper) > 0) {
            throw new RuntimeException("已报名，请勿重复操作");
        }
        // 人数检查
        if (activity.getCurrentPeople() >= activity.getMaxPeople()) {
            throw new RuntimeException("报名人数已满");
        }
        // 插入报名记录
        ActivitySignup signup = new ActivitySignup();
        signup.setActivityId(activityId);
        signup.setUserId(userId);
        signup.setSignupTime(LocalDateTime.now());
        signupMapper.insert(signup);
        // 更新已报名人数，并判断是否满额
        activity.setCurrentPeople(activity.getCurrentPeople() + 1);
        if (activity.getCurrentPeople() >= activity.getMaxPeople()) {
            activity.setStatus(1); // 满额
        }
        updateById(activity);
    }
}
