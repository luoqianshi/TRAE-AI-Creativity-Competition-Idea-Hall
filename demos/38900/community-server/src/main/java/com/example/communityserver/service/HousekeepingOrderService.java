package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.HousekeepingOrder;

public interface HousekeepingOrderService extends IService<HousekeepingOrder> {

    /**
     * 居民下单预约
     */
    void submit(HousekeepingOrder order);

    /**
     * 管理员接单
     */
    void accept(Long orderId);

    /**
     * 更新订单状态（服务中/已完成）
     */
    void updateStatus(Long orderId, Integer status);

    /**
     * 居民评价
     */
    void rate(Long orderId, Integer rating, String comment);
}
