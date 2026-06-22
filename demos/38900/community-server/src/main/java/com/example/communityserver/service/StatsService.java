package com.example.communityserver.service;

import com.example.communityserver.dto.StatsVO;

public interface StatsService {

    /**
     * 获取数据大屏全部统计数据
     */
    StatsVO getDashboardData();
}
