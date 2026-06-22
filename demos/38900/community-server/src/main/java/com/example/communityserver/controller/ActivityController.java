package com.example.communityserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.communityserver.common.result.Result;
import com.example.communityserver.entity.Activity;
import com.example.communityserver.entity.ActivitySignup;
import com.example.communityserver.entity.User;
import com.example.communityserver.service.ActivityService;
import com.example.communityserver.service.ActivitySignupService;
import com.example.communityserver.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivitySignupService activitySignupService;

    @Autowired
    private UserService userService;

    /**
     * 管理员发布活动
     */
    @PostMapping
    public Result<?> publish(@RequestBody Map<String, Object> formData,
                             @RequestAttribute("userId") Long userId,
                             @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Activity activity = new Activity();
        activity.setTitle((String) formData.get("title"));
        activity.setDescription((String) formData.get("description"));
        activity.setCoverImage((String) formData.get("coverImage"));
        activity.setLocation((String) formData.get("location"));
        if (formData.get("startTime") != null) {
            activity.setStartTime(parseDateTime((String) formData.get("startTime")));
        }
        if (formData.get("endTime") != null) {
            activity.setEndTime(parseDateTime((String) formData.get("endTime")));
        }
        if (formData.get("maxCount") instanceof Number) {
            activity.setMaxPeople(((Number) formData.get("maxCount")).intValue());
        }
        activity.setPublisherId(userId);
        activity.setStatus(0);       // 报名中
        activity.setCurrentPeople(0);
        activityService.save(activity);
        return Result.success(activity);
    }

    /**
     * 编辑活动
     */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id,
                            @RequestBody Map<String, Object> formData,
                            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Activity activity = activityService.getById(id);
        if (activity == null) {
            return Result.error(404, "活动不存在");
        }
        if (formData.get("title") != null) activity.setTitle((String) formData.get("title"));
        if (formData.get("description") != null) activity.setDescription((String) formData.get("description"));
        if (formData.get("coverImage") != null) activity.setCoverImage((String) formData.get("coverImage"));
        if (formData.get("location") != null) activity.setLocation((String) formData.get("location"));
        if (formData.get("startTime") != null) {
            activity.setStartTime(parseDateTime((String) formData.get("startTime")));
        }
        if (formData.get("endTime") != null) {
            activity.setEndTime(parseDateTime((String) formData.get("endTime")));
        }
        if (formData.get("maxCount") != null) {
            if (formData.get("maxCount") instanceof Number) {
                activity.setMaxPeople(((Number) formData.get("maxCount")).intValue());
            }
        }
        activityService.updateById(activity);
        return Result.success(null);
    }

    /**
     * 取消活动
     */
    @DeleteMapping("/{id}")
    public Result<?> cancel(@PathVariable Long id,
                            @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        Activity activity = activityService.getById(id);
        if (activity == null) {
            return Result.error(404, "活动不存在");
        }
        activity.setStatus(4); // 已取消
        activityService.updateById(activity);
        return Result.success(null);
    }

    /**
     * 活动列表（根据状态展示）
     */
    @GetMapping("/list")
    public Result<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        Page<Activity> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            Integer statusInt = null;
            switch (status) {
                case "SIGNING": statusInt = 0; break;
                case "FULL": statusInt = 1; break;
                case "ONGOING": statusInt = 2; break;
                case "ENDED": statusInt = 3; break;
                case "CANCELLED": statusInt = 4; break;
            }
            if (statusInt != null) {
                wrapper.eq(Activity::getStatus, statusInt);
            }
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Activity::getTitle, keyword);
        }
        wrapper.orderByDesc(Activity::getCreateTime);
        Page<Activity> result = activityService.page(pageParam, wrapper);

        // 转换字段名
        Page<Map<String, Object>> resultPage = new Page<>(page, size, result.getTotal());
        List<Map<String, Object>> records = new ArrayList<>();
        for (Activity activity : result.getRecords()) {
            Map<String, Object> map = convertToMap(activity, userId);
            records.add(map);
        }
        resultPage.setRecords(records);
        return Result.success(resultPage);
    }

    /**
     * 活动详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id,
                                               @RequestAttribute(value = "userId", required = false) Long userId) {
        Activity activity = activityService.getById(id);
        if (activity == null) {
            return Result.error(404, "活动不存在");
        }
        return Result.success(convertToMap(activity, userId));
    }

    /**
     * 居民报名
     */
    @PostMapping("/signup/{id}")
    public Result<?> signup(@PathVariable Long id,
                            @RequestAttribute("userId") Long userId) {
        // 检查是否已报名
        LambdaQueryWrapper<ActivitySignup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivitySignup::getActivityId, id)
               .eq(ActivitySignup::getUserId, userId);
        if (activitySignupService.count(wrapper) > 0) {
            return Result.error(400, "您已报名该活动");
        }

        Activity activity = activityService.getById(id);
        if (activity == null) {
            return Result.error(404, "活动不存在");
        }
        if (activity.getCurrentPeople() >= activity.getMaxPeople()) {
            return Result.error(400, "活动已满员");
        }

        activityService.signup(id, userId);
        return Result.success(null);
    }

    /**
     * 查看报名名单（管理员）
     */
    @GetMapping("/{id}/signups")
    public Result<List<Map<String, Object>>> signups(@PathVariable Long id,
                                                 @RequestAttribute("role") String role) {
        if (!"manager".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "权限不足");
        }
        LambdaQueryWrapper<ActivitySignup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivitySignup::getActivityId, id)
               .orderByDesc(ActivitySignup::getSignupTime);
        List<ActivitySignup> signups = activitySignupService.list(wrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ActivitySignup signup : signups) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", signup.getId());
            map.put("activityId", signup.getActivityId());
            map.put("userId", signup.getUserId());
            map.put("signupTime", signup.getSignupTime());
            // 添加用户名
            if (signup.getUserId() != null) {
                User user = userService.getById(signup.getUserId());
                if (user != null) {
                    map.put("userName", user.getRealName());
                    map.put("userPhone", user.getPhone());
                }
            }
            result.add(map);
        }
        return Result.success(result);
    }

    /**
     * 我的报名记录
     */
    @GetMapping("/my-signups")
    public Result<List<Map<String, Object>>> mySignups(@RequestAttribute("userId") Long userId) {
        LambdaQueryWrapper<ActivitySignup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivitySignup::getUserId, userId)
               .orderByDesc(ActivitySignup::getSignupTime);
        List<ActivitySignup> signups = activitySignupService.list(wrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ActivitySignup signup : signups) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", signup.getId());
            map.put("activityId", signup.getActivityId());
            map.put("userId", signup.getUserId());
            map.put("signupTime", signup.getSignupTime());
            // 添加活动信息
            Activity activity = activityService.getById(signup.getActivityId());
            if (activity != null) {
                map.put("activityTitle", activity.getTitle());
                map.put("activityLocation", activity.getLocation());
                map.put("activityStartTime", activity.getStartTime());
                map.put("activityEndTime", activity.getEndTime());
                map.put("status", convertStatus(activity.getStatus()));
            }
            result.add(map);
        }
        return Result.success(result);
    }

    /**
     * 将 Activity 转换为 Map
     */
    private Map<String, Object> convertToMap(Activity activity, Long userId) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", activity.getId());
        map.put("title", activity.getTitle());
        map.put("description", activity.getDescription());
        map.put("coverImg", activity.getCoverImage());
        map.put("startTime", activity.getStartTime());
        map.put("endTime", activity.getEndTime());
        map.put("location", activity.getLocation());
        map.put("maxCount", activity.getMaxPeople());
        map.put("signupCount", activity.getCurrentPeople());
        map.put("status", calculateStatus(activity)); // 动态计算状态
        map.put("publisherId", activity.getPublisherId());
        map.put("createTime", activity.getCreateTime());

        // 添加发布人名字
        if (activity.getPublisherId() != null) {
            User publisher = userService.getById(activity.getPublisherId());
            if (publisher != null) {
                map.put("publisherName", publisher.getRealName());
            }
        }

        // 检查当前用户是否已报名
        if (userId != null) {
            LambdaQueryWrapper<ActivitySignup> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ActivitySignup::getActivityId, activity.getId())
                   .eq(ActivitySignup::getUserId, userId);
            boolean hasSignedUp = activitySignupService.count(wrapper) > 0;
            map.put("hasSignedUp", hasSignedUp);
        } else {
            map.put("hasSignedUp", false);
        }

        return map;
    }

    /**
     * 动态计算活动状态
     */
    private String calculateStatus(Activity activity) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = activity.getStartTime();
        LocalDateTime endTime = activity.getEndTime();

        // 如果活动被取消
        if (activity.getStatus() != null && activity.getStatus() == 4) {
            return "CANCELLED";
        }

        // 如果当前人数已满
        if (activity.getCurrentPeople() >= activity.getMaxPeople()) {
            return "FULL";
        }

        // 活动未开始
        if (startTime != null && now.isBefore(startTime)) {
            return "SIGNING";
        }

        // 活动进行中
        if (startTime != null && endTime != null && !now.isBefore(startTime) && !now.isAfter(endTime)) {
            return "ONGOING";
        }

        // 活动已结束
        if (endTime != null && now.isAfter(endTime)) {
            return "ENDED";
        }

        // 默认报名中
        return "SIGNING";
    }

    private String convertStatus(Integer status) {
        switch (status) {
            case 0: return "SIGNING";
            case 1: return "FULL";
            case 2: return "ONGOING";
            case 3: return "ENDED";
            case 4: return "CANCELLED";
            default: return "UNKNOWN";
        }
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        try {
            return LocalDateTime.parse(dateTimeStr, formatter);
        } catch (DateTimeParseException e) {
            return LocalDateTime.parse(dateTimeStr);
        }
    }
}
