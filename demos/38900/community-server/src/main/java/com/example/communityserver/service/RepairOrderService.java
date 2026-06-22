package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.RepairOrder;

public interface RepairOrderService extends IService<RepairOrder> {

    /**
     * 居民提交报修
     */
    void submit(RepairOrder order);

    /**
     * 物业接单并派单给维修人员
     */
    void assign(Long orderId, Long handlerId);

    /**
     * 维修人员完工
     */
    void complete(Long orderId, String result);

    /**
     * 居民确认完工
     */
    void confirm(Long orderId);

    /**
     * 居民评价
     */
    void rate(Long orderId, Integer rating, String comment);
}
