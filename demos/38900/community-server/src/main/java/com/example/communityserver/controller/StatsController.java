package com.example.communityserver.controller;

import com.example.communityserver.common.result.Result;
import com.example.communityserver.dto.StatsVO;
import com.example.communityserver.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    /**
     * 数据大屏 - 全部统计数据（前端30秒轮询刷新）
     */
    @GetMapping("/dashboard")
    public Result<StatsVO> dashboard() {
        return Result.success(statsService.getDashboardData());
    }
}
