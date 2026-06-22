package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.IdleOrder;
import com.example.communityserver.mapper.IdleOrderMapper;
import com.example.communityserver.service.IdleOrderService;
import org.springframework.stereotype.Service;

@Service
public class IdleOrderServiceImpl extends ServiceImpl<IdleOrderMapper, IdleOrder> implements IdleOrderService {
}
