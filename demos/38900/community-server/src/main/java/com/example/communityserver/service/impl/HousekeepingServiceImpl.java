package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.Housekeeping;
import com.example.communityserver.mapper.HousekeepingMapper;
import com.example.communityserver.service.HousekeepingService;
import org.springframework.stereotype.Service;

@Service
public class HousekeepingServiceImpl extends ServiceImpl<HousekeepingMapper, Housekeeping> implements HousekeepingService {
}
