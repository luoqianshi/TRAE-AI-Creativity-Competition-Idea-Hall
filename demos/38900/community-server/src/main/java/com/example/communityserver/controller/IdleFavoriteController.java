package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.IdleFavorite;
import com.example.communityserver.entity.IdleItem;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.IdleFavoriteService;
import com.example.communityserver.service.IdleItemService;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/idle/favorite")
public class IdleFavoriteController {

    @Autowired
    private IdleFavoriteService favoriteService;

    @Autowired
    private IdleItemService idleItemService;

    @Autowired
    private UserService userService;

    @PostMapping("/add/{itemId}")
    public Result<?> add(@PathVariable Long itemId, @RequestAttribute("userId") Long userId) {
        boolean success = favoriteService.addFavorite(userId, itemId);
        return success ? Result.success(null) : Result.error(400, "已收藏");
    }

    @PostMapping("/remove/{itemId}")
    public Result<?> remove(@PathVariable Long itemId, @RequestAttribute("userId") Long userId) {
        favoriteService.removeFavorite(userId, itemId);
        return Result.success(null);
    }

    @GetMapping("/check/{itemId}")
    public Result<Map<String, Object>> check(@PathVariable Long itemId, @RequestAttribute("userId") Long userId) {
        return Result.success(Map.of("favorite", favoriteService.isFavorite(userId, itemId)));
    }

    @GetMapping("/list")
    public Result<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestAttribute("userId") Long userId) {
        
        List<Long> itemIds = favoriteService.getFavoriteItemIds(userId);
        
        Page<IdleItem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<IdleItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(IdleItem::getId, itemIds)
               .eq(IdleItem::getStatus, 1)
               .orderByDesc(IdleItem::getCreateTime);
        
        Page<IdleItem> result = idleItemService.page(pageParam, wrapper);
        
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        resultPage.setRecords(result.getRecords().stream().map(this::convertToMap).collect(Collectors.toList()));
        return Result.success(resultPage);
    }

    private Map<String, Object> convertToMap(IdleItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("userId", item.getUserId());
        map.put("title", item.getTitle());
        map.put("description", item.getDescription());
        map.put("images", item.getImages());
        String coverImg = item.getImages() != null && !item.getImages().isEmpty() ?
                (item.getImages().startsWith("[") ? 
                    item.getImages().substring(2, item.getImages().indexOf("\",", 2)) : 
                    item.getImages().split(",")[0]) : null;
        map.put("coverImg", coverImg);
        map.put("category", item.getCategory());
        map.put("price", item.getPrice());
        map.put("tradeType", item.getTradeType());
        map.put("status", item.getStatus());
        map.put("createTime", item.getCreateTime());
        
        if (item.getUserId() != null) {
            User user = userService.getById(item.getUserId());
            if (user != null) {
                map.put("publisher", user.getRealName());
                map.put("phone", user.getPhone());
            }
        }
        return map;
    }
}