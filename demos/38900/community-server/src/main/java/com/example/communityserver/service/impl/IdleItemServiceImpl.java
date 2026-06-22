package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.IdleItem;
import com.example.communityserver.mapper.IdleItemMapper;
import com.example.communityserver.service.IdleItemService;
import org.springframework.stereotype.Service;

@Service
public class IdleItemServiceImpl extends ServiceImpl<IdleItemMapper, IdleItem> implements IdleItemService {
}
