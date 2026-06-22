package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.RepairOrder;
import com.example.communityserver.mapper.RepairOrderMapper;
import com.example.communityserver.service.RepairOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RepairOrderServiceImpl extends ServiceImpl<RepairOrderMapper, RepairOrder> implements RepairOrderService {

    @Override
    @Transactional
    public void submit(RepairOrder order) {
        order.setStatus(0); // 待受理
        save(order);
    }

    @Override
    @Transactional
    public void assign(Long orderId, Long handlerId) {
        RepairOrder order = getById(orderId);
        if (order == null || order.getStatus() != 0) {
            throw new RuntimeException("工单状态不正确，无法派单");
        }
        order.setHandlerId(handlerId);
        order.setStatus(1);           // 处理中
        order.setAcceptTime(LocalDateTime.now());
        updateById(order);
    }

    @Override
    @Transactional
    public void complete(Long orderId, String result) {
        RepairOrder order = getById(orderId);
        if (order == null || order.getStatus() != 1) {
            throw new RuntimeException("工单状态不正确，无法完工");
        }
        order.setResult(result);
        order.setStatus(2);           // 待用户确认
        order.setFinishTime(LocalDateTime.now());
        updateById(order);
    }

    @Override
    @Transactional
    public void confirm(Long orderId) {
        RepairOrder order = getById(orderId);
        if (order == null || order.getStatus() != 2) {
            throw new RuntimeException("工单状态不正确，无法确认");
        }
        order.setStatus(3);           // 已完成
        updateById(order);
    }

    @Override
    @Transactional
    public void rate(Long orderId, Integer rating, String comment) {
        RepairOrder order = getById(orderId);
        if (order == null || (order.getStatus() != 2 && order.getStatus() != 3)) {
            throw new RuntimeException("工单状态不正确，无法评价");
        }
        order.setRating(rating);
        order.setComment(comment);
        order.setStatus(4);           // 已评价
        updateById(order);
    }
}
