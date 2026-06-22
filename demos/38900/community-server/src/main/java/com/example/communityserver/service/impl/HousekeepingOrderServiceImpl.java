package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.HousekeepingOrder;
import com.example.communityserver.mapper.HousekeepingOrderMapper;
import com.example.communityserver.service.HousekeepingOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HousekeepingOrderServiceImpl extends ServiceImpl<HousekeepingOrderMapper, HousekeepingOrder> implements HousekeepingOrderService {

    @Override
    @Transactional
    public void submit(HousekeepingOrder order) {
        order.setStatus(0); // 已下单
        save(order);
    }

    @Override
    @Transactional
    public void accept(Long orderId) {
        HousekeepingOrder order = getById(orderId);
        if (order == null || order.getStatus() != 0) {
            throw new RuntimeException("订单状态不正确，无法接单");
        }
        order.setStatus(1); // 已接单
        updateById(order);
    }

    @Override
    @Transactional
    public void updateStatus(Long orderId, Integer status) {
        HousekeepingOrder order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        // 状态校验：已接单(1) -> 服务中(2) -> 已完成(3)
        if (status == 2 && order.getStatus() != 1) {
            throw new RuntimeException("订单状态不正确，无法开始服务");
        }
        if (status == 3 && order.getStatus() != 2) {
            throw new RuntimeException("订单状态不正确，无法完成服务");
        }
        order.setStatus(status);
        updateById(order);
    }

    @Override
    @Transactional
    public void rate(Long orderId, Integer rating, String comment) {
        HousekeepingOrder order = getById(orderId);
        if (order == null || order.getStatus() != 3) {
            throw new RuntimeException("订单状态不正确，无法评价");
        }
        order.setRating(rating);
        order.setComment(comment);
        order.setStatus(4); // 已评价
        updateById(order);
    }
}
