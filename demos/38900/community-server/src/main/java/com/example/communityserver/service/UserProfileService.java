package com.example.communityserver.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.communityserver.dto.PasswordUpdateDTO;
import com.example.communityserver.dto.ProfileDTO;
import com.example.communityserver.dto.ProfileUpdateDTO;
import com.example.communityserver.entity.*;
import com.example.communityserver.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class UserProfileService {

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RepairOrderMapper repairOrderMapper;
    
    @Autowired
    private IdleItemMapper idleItemMapper;
    
    @Autowired
    private ActivitySignupMapper activitySignupMapper;
    
    @Autowired
    private HousekeepingOrderMapper housekeepingOrderMapper;
    
    @Autowired
    private NoticeMapper noticeMapper;
    
    @Autowired
    private ActivityMapper activityMapper;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ProfileDTO getProfile(Long userId, String role) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        
        ProfileDTO profile = new ProfileDTO();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setRealName(user.getRealName());
        profile.setPhone(user.getPhone());
        profile.setAvatar(user.getAvatar());
        // 将数字角色转换为字符串角色
        String roleStr;
        switch (user.getRole()) {
            case 0: roleStr = "resident"; break;
            case 1: roleStr = "maintainer"; break;
            case 2: roleStr = "manager"; break;
            case 3: roleStr = "admin"; break;
            case 4: roleStr = "housekeeper"; break;
            default: roleStr = "resident";
        }
        profile.setRole(roleStr);
        profile.setCommunityName(null); // 暂时设为null
        
        // 根据角色计算统计
        if ("resident".equals(role)) {
            // 居民统计
            profile.setRepairCount(countRepairByUserId(userId));
            profile.setIdleCount(countIdleByUserId(userId));
            profile.setActivitySignupCount(countActivitySignupByUserId(userId));
            profile.setHousekeepingOrderCount(countHousekeepingByUserId(userId));
        } else if ("maintainer".equals(role)) {
            // 维修人员统计
            profile.setPendingCount(countPendingRepairByHandlerId(userId));
            profile.setCompletedCount(countCompletedRepairByHandlerId(userId));
        } else if ("manager".equals(role)) {
            // 物业管理员统计
            profile.setPendingIdleCount(countPendingIdle());
            profile.setPendingRepairCount(countPendingRepair());
            profile.setMonthActivityCount(countMonthActivity());
        } else if ("admin".equals(role)) {
            // 超级管理员统计
            profile.setTotalUserCount(countTotalUser());
            profile.setTotalRepairCount(countTotalRepair());
        }
        
        return profile;
    }
    
    public boolean updateProfile(Long userId, ProfileUpdateDTO dto) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        // 检查用户名是否被其他用户占用
        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, dto.getUsername()).ne(User::getId, userId);
            if (userMapper.selectCount(wrapper) > 0) {
                return false; // 用户名已被占用
            }
            user.setUsername(dto.getUsername());
        }
        if (dto.getRealName() != null) {
            user.setRealName(dto.getRealName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        userMapper.updateById(user);
        return true;
    }
    
    public boolean updatePassword(Long userId, PasswordUpdateDTO dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            return false;
        }
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        
        // 验证旧密码
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            return false;
        }
        
        // 更新新密码
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userMapper.updateById(user);
        return true;
    }
    
    public boolean updateAvatar(Long userId, String avatarUrl) {
        User user = new User();
        user.setId(userId);
        user.setAvatar(avatarUrl);
        return userMapper.updateById(user) > 0;
    }
    
    public Page<?> getRecords(Long userId, String type, int page, int size) {
        Page<?> result = null;
        
        switch (type) {
            case "repair":
                result = getRepairRecords(userId, page, size);
                break;
            case "idle":
                result = getIdleRecords(userId, page, size);
                break;
            case "activity":
                result = getActivityRecords(userId, page, size);
                break;
            case "housekeeping":
                result = getHousekeepingRecords(userId, page, size);
                break;
            case "repair_assign":
                result = getRepairAssignRecords(userId, page, size);
                break;
            case "notice_publish":
                result = getNoticePublishRecords(userId, page, size);
                break;
            default:
                result = new Page<>(page, size);
        }
        
        return result;
    }
    
    // 统计方法
    private Integer countRepairByUserId(Long userId) {
        return Math.toIntExact(repairOrderMapper.selectCount(
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getUserId, userId)
                .isNull(RepairOrder::getDeleteTime)
        ));
    }
    
    private Integer countIdleByUserId(Long userId) {
        return Math.toIntExact(idleItemMapper.selectCount(
            new LambdaQueryWrapper<IdleItem>()
                .eq(IdleItem::getUserId, userId)
                .isNull(IdleItem::getDeleteTime)
        ));
    }
    
    private Integer countActivitySignupByUserId(Long userId) {
        return Math.toIntExact(activitySignupMapper.selectCount(
            new LambdaQueryWrapper<ActivitySignup>()
                .eq(ActivitySignup::getUserId, userId)
        ));
    }
    
    private Integer countHousekeepingByUserId(Long userId) {
        return Math.toIntExact(housekeepingOrderMapper.selectCount(
            new LambdaQueryWrapper<HousekeepingOrder>()
                .eq(HousekeepingOrder::getUserId, userId)
                .isNull(HousekeepingOrder::getDeleteTime)
        ));
    }
    
    private Integer countPendingRepairByHandlerId(Long userId) {
        return Math.toIntExact(repairOrderMapper.selectCount(
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getHandlerId, userId)
                .in(RepairOrder::getStatus, 1, 2)
                .isNull(RepairOrder::getDeleteTime)
        ));
    }
    
    private Integer countCompletedRepairByHandlerId(Long userId) {
        return Math.toIntExact(repairOrderMapper.selectCount(
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getHandlerId, userId)
                .in(RepairOrder::getStatus, 3, 4)
                .isNull(RepairOrder::getDeleteTime)
        ));
    }
    
    private Integer countPendingIdle() {
        return Math.toIntExact(idleItemMapper.selectCount(
            new LambdaQueryWrapper<IdleItem>()
                .eq(IdleItem::getStatus, 0)
                .isNull(IdleItem::getDeleteTime)
        ));
    }
    
    private Integer countPendingRepair() {
        return Math.toIntExact(repairOrderMapper.selectCount(
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getStatus, 0)
                .isNull(RepairOrder::getDeleteTime)
        ));
    }
    
    private Integer countMonthActivity() {
        LocalDateTime start = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        return Math.toIntExact(activityMapper.selectCount(
            new LambdaQueryWrapper<Activity>()
                .ge(Activity::getCreateTime, start)
                .isNull(Activity::getDeleteTime)
        ));
    }
    
    private Integer countTotalUser() {
        return Math.toIntExact(userMapper.selectCount(null));
    }
    
    private Integer countTotalRepair() {
        return Math.toIntExact(repairOrderMapper.selectCount(null));
    }
    
    // 记录查询方法
    private Page<RepairOrder> getRepairRecords(Long userId, int page, int size) {
        return repairOrderMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getUserId, userId)
                .isNull(RepairOrder::getDeleteTime)
                .orderByDesc(RepairOrder::getCreateTime)
        );
    }
    
    private Page<IdleItem> getIdleRecords(Long userId, int page, int size) {
        return idleItemMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<IdleItem>()
                .eq(IdleItem::getUserId, userId)
                .isNull(IdleItem::getDeleteTime)
                .orderByDesc(IdleItem::getCreateTime)
        );
    }
    
    private Page<ActivitySignup> getActivityRecords(Long userId, int page, int size) {
        return activitySignupMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<ActivitySignup>()
                .eq(ActivitySignup::getUserId, userId)
                .orderByDesc(ActivitySignup::getSignupTime)
        );
    }
    
    private Page<HousekeepingOrder> getHousekeepingRecords(Long userId, int page, int size) {
        return housekeepingOrderMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<HousekeepingOrder>()
                .eq(HousekeepingOrder::getUserId, userId)
                .isNull(HousekeepingOrder::getDeleteTime)
                .orderByDesc(HousekeepingOrder::getCreateTime)
        );
    }
    
    private Page<RepairOrder> getRepairAssignRecords(Long userId, int page, int size) {
        return repairOrderMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getHandlerId, userId)
                .isNull(RepairOrder::getDeleteTime)
                .orderByDesc(RepairOrder::getCreateTime)
        );
    }
    
    private Page<Notice> getNoticePublishRecords(Long userId, int page, int size) {
        return noticeMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<Notice>()
                .eq(Notice::getPublisherId, userId)
                .isNull(Notice::getDeleteTime)
                .orderByDesc(Notice::getCreateTime)
        );
    }
}
