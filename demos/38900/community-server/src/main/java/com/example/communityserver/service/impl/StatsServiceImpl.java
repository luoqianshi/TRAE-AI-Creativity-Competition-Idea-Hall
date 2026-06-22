package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.communityserver.dto.StatsVO;
import com.example.communityserver.entity.*;
import com.example.communityserver.mapper.*;
import com.example.communityserver.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsServiceImpl implements StatsService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RepairOrderMapper repairOrderMapper;

    @Autowired
    private IdleItemMapper idleItemMapper;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private HousekeepingOrderMapper housekeepingOrderMapper;

    @Override
    public StatsVO getDashboardData() {
        StatsVO vo = new StatsVO();

        // ========== 关键指标卡片 ==========

        // 总居民数（role = 1 的用户）
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getRole, 1);
        vo.setTotalResidents(userMapper.selectCount(userWrapper));

        // 本月报修数量
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay();
        LambdaQueryWrapper<RepairOrder> monthlyRepairWrapper = new LambdaQueryWrapper<>();
        monthlyRepairWrapper.between(RepairOrder::getCreateTime, monthStart, monthEnd);
        vo.setMonthlyRepairs(repairOrderMapper.selectCount(monthlyRepairWrapper));

        // 待处理报修（状态0-待受理 和 1-处理中）
        LambdaQueryWrapper<RepairOrder> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.in(RepairOrder::getStatus, 0, 1);
        vo.setPendingRepairs(repairOrderMapper.selectCount(pendingWrapper));

        // 闲置物品总数（已发布的）
        LambdaQueryWrapper<IdleItem> idleWrapper = new LambdaQueryWrapper<>();
        idleWrapper.eq(IdleItem::getStatus, 1);
        vo.setTotalIdleItems(idleItemMapper.selectCount(idleWrapper));

        // 本月活动场次
        LambdaQueryWrapper<Activity> activityWrapper = new LambdaQueryWrapper<>();
        activityWrapper.between(Activity::getStartTime, monthStart, monthEnd);
        vo.setMonthlyActivities(activityMapper.selectCount(activityWrapper));

        // 累计活动报名人次
        Long totalSignups = activityMapper.sumCurrentPeople();
        vo.setTotalSignups(totalSignups != null ? totalSignups : 0L);

        // ========== 可视化图表数据 ==========

        // 近7天报修数量趋势（折线图）
        List<Map<String, Object>> repairTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.between(RepairOrder::getCreateTime, dayStart, dayEnd);
            long count = repairOrderMapper.selectCount(wrapper);
            Map<String, Object> map = new HashMap<>();
            map.put("date", date.toString());
            map.put("count", count);
            repairTrend.add(map);
        }
        vo.setRepairTrend(repairTrend);

        // 报修工单状态分布（饼图）
        List<Map<String, Object>> statusPieData = new ArrayList<>();
        String[] statusNames = {"待受理", "处理中", "待确认", "已完成", "已评价"};
        long totalRepairs = 0;
        long completedRepairs = 0;
        for (int i = 0; i < 5; i++) {
            LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(RepairOrder::getStatus, i);
            long count = repairOrderMapper.selectCount(wrapper);
            totalRepairs += count;
            if (i == 3 || i == 4) {
                completedRepairs += count; // 已完成 + 已评价
            }
            Map<String, Object> map = new HashMap<>();
            map.put("name", statusNames[i]);
            map.put("value", count);
            statusPieData.add(map);
        }
        vo.setStatusPieData(statusPieData);

        // 工单完成率
        if (totalRepairs > 0) {
            vo.setRepairCompletionRate(Math.round(completedRepairs * 10000.0 / totalRepairs) / 100.0);
        } else {
            vo.setRepairCompletionRate(0.0);
        }

        // 月度活动报名趋势（柱状图）- 近6个月
        List<Map<String, Object>> signupTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDateTime mStart = monthDate.atStartOfDay();
            LocalDateTime mEnd = monthDate.plusMonths(1).atStartOfDay();
            LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
            wrapper.between(Activity::getStartTime, mStart, mEnd);
            List<Activity> activities = activityMapper.selectList(wrapper);
            long signupCount = activities.stream()
                    .mapToLong(a -> a.getCurrentPeople() != null ? a.getCurrentPeople() : 0)
                    .sum();
            Map<String, Object> map = new HashMap<>();
            map.put("month", monthDate.getYear() + "-" + String.format("%02d", monthDate.getMonthValue()));
            map.put("count", signupCount);
            signupTrend.add(map);
        }
        vo.setSignupTrend(signupTrend);

        // 家政订单完成率
        long totalHousekeepingOrders = housekeepingOrderMapper.selectCount(null);
        LambdaQueryWrapper<HousekeepingOrder> completedWrapper = new LambdaQueryWrapper<>();
        completedWrapper.in(HousekeepingOrder::getStatus, 3, 4); // 已完成 + 已评价
        long completedHousekeepingOrders = housekeepingOrderMapper.selectCount(completedWrapper);
        if (totalHousekeepingOrders > 0) {
            vo.setHousekeepingCompletionRate(
                    Math.round(completedHousekeepingOrders * 10000.0 / totalHousekeepingOrders) / 100.0);
        } else {
            vo.setHousekeepingCompletionRate(0.0);
        }

        return vo;
    }
}
