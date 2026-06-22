package com.example.communityserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.communityserver.entity.NoticeRead;
import com.example.communityserver.mapper.NoticeReadMapper;
import com.example.communityserver.service.NoticeReadService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NoticeReadServiceImpl extends ServiceImpl<NoticeReadMapper, NoticeRead> implements NoticeReadService {

    @Override
    public void markAsRead(Long noticeId, Long userId) {
        // 查询是否已有阅读记录
        LambdaQueryWrapper<NoticeRead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NoticeRead::getNoticeId, noticeId)
               .eq(NoticeRead::getUserId, userId);
        NoticeRead existing = this.getOne(wrapper);

        if (existing == null) {
            // 新增已读记录
            NoticeRead noticeRead = new NoticeRead();
            noticeRead.setNoticeId(noticeId);
            noticeRead.setUserId(userId);
            noticeRead.setIsRead(1);
            noticeRead.setReadTime(LocalDateTime.now());
            this.save(noticeRead);
        } else if (existing.getIsRead() == 0) {
            // 更新为已读
            existing.setIsRead(1);
            existing.setReadTime(LocalDateTime.now());
            this.updateById(existing);
        }
    }

    @Override
    public long countReadByNoticeId(Long noticeId) {
        LambdaQueryWrapper<NoticeRead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NoticeRead::getNoticeId, noticeId)
               .eq(NoticeRead::getIsRead, 1);
        return this.count(wrapper);
    }
}
