package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.ActivitySignup;
import com.example.communityserver.mapper.ActivitySignupMapper;
import com.example.communityserver.service.ActivitySignupService;
import org.springframework.stereotype.Service;

@Service
public class ActivitySignupServiceImpl extends ServiceImpl<ActivitySignupMapper, ActivitySignup> implements ActivitySignupService {
}
