package com.example.communityserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.communityserver.entity.IdleFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface IdleFavoriteMapper extends BaseMapper<IdleFavorite> {
    @Select("SELECT item_id FROM idle_favorite WHERE user_id = #{userId}")
    List<Long> getFavoriteItemIds(@Param("userId") Long userId);
}