package com.example.communityserver.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class StatsVO {

    // ========== 关键指标卡片 ==========
    
    /** 总居民数 */
    private Long totalResidents;
    
    /** 本月新增报修数量 */
    private Long monthlyRepairs;
    
    /** 待处理报修数量 */
    private Long pendingRepairs;
    
    /** 闲置物品总数 */
    private Long totalIdleItems;
    
    /** 本月活动场次 */
    private Long monthlyActivities;
    
    /** 累计活动报名人次 */
    private Long totalSignups;

    // ========== 可视化图表数据 ==========
    
    /** 近7天报修数量趋势（折线图） */
    private List<Map<String, Object>> repairTrend;
    
    /** 报修工单状态分布（饼图） */
    private List<Map<String, Object>> statusPieData;
    
    /** 月度活动报名人次统计（柱状图） */
    private List<Map<String, Object>> signupTrend;
    
    /** 工单完成率 */
    private Double repairCompletionRate;
    
    /** 家政订单完成率 */
    private Double housekeepingCompletionRate;
}
