package com.example.communityserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.entity.NoticeRead;

public interface NoticeReadService extends IService<NoticeRead> {

    /**
     * 标记公告为已读（若已存在则跳过）
     */
    void markAsRead(Long noticeId, Long userId);

    /**
     * 查询公告已读人数
     */
    long countReadByNoticeId(Long noticeId);
}
