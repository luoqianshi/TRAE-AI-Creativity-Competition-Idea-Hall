package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.IdleFavorite;

import java.util.List;

public interface IdleFavoriteService extends IService<IdleFavorite> {
    boolean addFavorite(Long userId, Long itemId);
    boolean removeFavorite(Long userId, Long itemId);
    boolean isFavorite(Long userId, Long itemId);
    List<Long> getFavoriteItemIds(Long userId);
}