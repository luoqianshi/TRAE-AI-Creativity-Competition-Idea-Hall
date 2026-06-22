package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.IdleFavorite;
import com.example.communityserver.entity.IdleItem;
import com.example.communityserver.entity.Message;
import com.example.communityserver.entity.User;
import com.example.communityserver.mapper.IdleFavoriteMapper;
import com.example.communityserver.service.IdleFavoriteService;
import com.example.communityserver.service.IdleItemService;
import com.example.communityserver.service.MessageService;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IdleFavoriteServiceImpl extends ServiceImpl<IdleFavoriteMapper, IdleFavorite> implements IdleFavoriteService {

    @Autowired
    private IdleItemService idleItemService;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageService messageService;

    @Override
    public boolean addFavorite(Long userId, Long itemId) {
        if (isFavorite(userId, itemId)) {
            return false;
        }

        IdleFavorite favorite = new IdleFavorite();
        favorite.setUserId(userId);
        favorite.setItemId(itemId);
        favorite.setCreateTime(LocalDateTime.now());
        
        save(favorite);

        IdleItem item = idleItemService.getById(itemId);
        if (item != null && item.getUserId() != null && !item.getUserId().equals(userId)) {
            User user = userService.getById(userId);
            String content = (user != null ? user.getRealName() : "用户") + "收藏了您发布的物品《" + item.getTitle() + "》";
            
            Message msg = new Message();
            msg.setFromUserId(userId);
            msg.setToUserId(item.getUserId());
            msg.setContent(content);
            msg.setType(2);
            msg.setRelatedId(itemId);
            msg.setStatus(0);
            msg.setCreateTime(LocalDateTime.now());
            messageService.save(msg);
        }

        return true;
    }

    @Override
    public boolean removeFavorite(Long userId, Long itemId) {
        LambdaQueryWrapper<IdleFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleFavorite::getUserId, userId)
               .eq(IdleFavorite::getItemId, itemId);
        return remove(wrapper);
    }

    @Override
    public boolean isFavorite(Long userId, Long itemId) {
        LambdaQueryWrapper<IdleFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IdleFavorite::getUserId, userId)
               .eq(IdleFavorite::getItemId, itemId);
        return count(wrapper) > 0;
    }

    @Override
    public List<Long> getFavoriteItemIds(Long userId) {
        return getBaseMapper().getFavoriteItemIds(userId);
    }
}