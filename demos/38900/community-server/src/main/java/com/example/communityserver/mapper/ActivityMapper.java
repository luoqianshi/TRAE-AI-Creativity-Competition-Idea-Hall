package com.example.communityserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.communityserver.entity.Activity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {

    /**
     * 统计累计报名人次
     */
    @Select("SELECT COALESCE(SUM(current_people), 0) FROM activity WHERE delete_time IS NULL")
    Long sumCurrentPeople();
}
