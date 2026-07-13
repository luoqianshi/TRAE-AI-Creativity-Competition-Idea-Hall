# 候鸟旅居通 · AI 推荐算法设计

## 算法定位

**轻量级规则引擎 + 动态加权评分**

不依赖外部AI API或模型，使用透明可解释的加权规则，让用户知道"为什么推荐这个城市"。

---

## 输入参数

| 参数 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| age | int | 55-90 | 用户年龄 |
| budget | int | 1000-5000+ | 月预算（元） |
| month | int | 1-12 | 计划居住月份 |
| health | string | ""/"高血压"/"心脏病"/"呼吸道疾病" | 健康情况（选填） |
| preference | string | ""/"安静"/"热闹"/"山区"/"海边" | 偏好（选填） |

---

## 算法流程

```
用户输入
    │
    ▼
1. 季节判断
    ├── 5-9月 → 避暑模式（筛选避暑城市）
    └── 10-4月 → 避寒模式（筛选避寒城市）
    │
    ▼
2. 预算评分 (满分30分)
    ├── 预算/房租 ≥ 1.2 → 30分
    ├── 预算/房租 ≥ 1.0 → 25分
    ├── 预算/房租 ≥ 0.7 → 15分
    └── 预算/房租 < 0.7 → 5分
    │
    ▼
3. 医疗评分 (满分25分)
    ├── medical_score × 5
    │
    ▼
4. 综合宜居评分 (满分30分)
    ├── elderly_score × 0.3
    │
    ▼
5. 交通评分 (满分15分)
    ├── transport_score × 3
    │
    ▼
6. 生活便利评分 (满分15分)
    ├── living_score × 3
    │
    ▼
7. 偏好加分 (满分10分)
    ├── 安静：elderly_score > 80 → +5
    ├── 热闹：elderly_score < 85 → +5
    ├── 山区：altitude > 500 → +5
    └── 海边：altitude ≤ 100 → +5
    │
    ▼
8. 健康扣分
    ├── 高血压 + 海拔 > 1500 → -10
    ├── 心脏病 + 海拔 > 1500 → -10
    └── （可扩展其他规则）
    │
    ▼
9. 按总分降序排列 → Top 10
```

---

## 评分公式

```
Score = budget_score(30) 
      + medical_score × 5 (25)
      + elderly_score × 0.3 (30)
      + transport_score × 3 (15)
      + living_score × 3 (15)
      + preference_bonus (10)
      - health_penalty
```

**满分：115分**

---

## 各维度详解

### 1. 季节判断

```python
is_summer = month in [5, 6, 7, 8, 9]
if is_summer:
    candidates = cities.filter(category="避暑")
else:
    candidates = cities.filter(category="避寒")
```

**原理**：5-9月为中国大部分地区的夏季，老人需要避暑；10-4月为秋冬春季，老人需要避寒。

### 2. 预算评分

```python
ratio = user_budget / city.rent_avg
if ratio >= 1.2:  budget_score = 30  # 预算充裕
elif ratio >= 1.0: budget_score = 25  # 刚好覆盖
elif ratio >= 0.7: budget_score = 15  # 略超预算
else: budget_score = 5                  # 远超预算
```

**设计思路**：预算匹配度是最核心的决策因子之一。退休老人对价格敏感，能负担得起是前提。

### 3. 医疗评分

```python
medical_part = city.medical_score * 5  # 满分25
```

**设计思路**：医疗是老人旅居的刚需。medical_score 范围 0-5，乘以5后范围 0-25。

### 4. 综合宜居评分

```python
elderly_part = city.elderly_score * 0.3  # 满分30
```

**设计思路**：elderly_score 已综合了气候(30%)+医疗(20%)+房价(20%)+交通(15%)+生活(15%)，作为整体宜居性的参考。范围0-100，乘以0.3后范围0-30。

### 5. 交通评分

```python
transport_part = city.transport_score * 3  # 满分15
```

**设计思路**：交通便利度影响老人出行和子女探访。范围0-5 × 3 = 0-15。

### 6. 生活便利评分

```python
living_part = city.living_score * 3  # 满分15
```

**设计思路**：买菜、购物、银行等日常生活便利性。范围0-5 × 3 = 0-15。

### 7. 偏好加分

```python
bonus = 0
if "安静" in preference and city.elderly_score > 80: bonus += 5
if "热闹" in preference and city.elderly_score < 85: bonus += 5
if "山区" in preference and city.altitude > 500:     bonus += 5
if "海边" in preference and city.altitude <= 100:    bonus += 5
```

**设计思路**：通过城市属性与用户偏好的匹配给予额外加分，提升推荐的个性化程度。

### 8. 健康扣分

```python
penalty = 0
if "高血压" in health and city.altitude > 1500:  penalty += 10
if "心脏病" in health and city.altitude > 1500:  penalty += 10
if "呼吸道疾病" in health and city.humidity > 75: penalty += 10
```

**设计思路**：基于医学常识的规则。高海拔对心脑血管疾病患者不利，高湿度对呼吸道疾病不利。

---

## 代码实现

```python
def recommend(age, budget, month, health, preference):
    # 1. 季节筛选
    is_summer = month in [5,6,7,8,9]
    cities = City.query.filter_by(category="避暑" if is_summer else "避寒")

    # 2. 评分
    def score(city):
        s = 0
        # 预算
        ratio = budget / max(city.rent_avg, 1)
        if ratio >= 1.2: s += 30
        elif ratio >= 1.0: s += 25
        elif ratio >= 0.7: s += 15
        else: s += 5
        # 医疗
        s += city.medical_score * 5
        # 宜居
        s += city.elderly_score * 0.3
        # 交通
        s += city.transport_score * 3
        # 生活
        s += city.living_score * 3
        # 偏好
        if preference:
            if "安静" in preference and city.elderly_score > 80: s += 5
            if "热闹" in preference and city.elderly_score < 85: s += 5
            if "山区" in preference and city.altitude > 500: s += 5
            if "海边" in preference and city.altitude <= 100: s += 5
        # 健康
        if health:
            if "高血压" in health and city.altitude > 1500: s -= 10
            if "心脏病" in health and city.altitude > 1500: s -= 10
        return s

    ranked = sorted(cities, key=score, reverse=True)
    return ranked[:10]
```

---

## 推荐示例

### 示例1：普通退休老人

```
输入：age=65, budget=2000, month=7, health="", preference=""
```

| 排名 | 城市 | 预算分 | 医疗分 | 宜居分 | 交通分 | 生活分 | 总分 |
|------|------|--------|--------|--------|--------|--------|------|
| 1 | 六盘水 | 30 | 20 | 27.6 | 12 | 13.5 | 103.1 |
| 2 | 昆明 | 25 | 24 | 27.0 | 14.4 | 14.4 | 104.8 |
| 3 | 贵阳 | 25 | 22.5 | 26.4 | 15 | 13.5 | 102.4 |

### 示例2：有高血压、预算充裕

```
输入：age=70, budget=4000, month=7, health="高血压", preference="安静"
```

| 排名 | 城市 | 预算分 | 医疗分 | 宜居分 | 交通分 | 生活分 | 偏好 | 健康扣分 | 总分 |
|------|------|--------|--------|--------|--------|--------|------|----------|------|
| 1 | 昆明(1890m) | 30 | 24 | 27 | 14.4 | 14.4 | +5 | -10 | 104.8 |
| 2 | 贵阳(1100m) | 30 | 22.5 | 26.4 | 15 | 13.5 | +5 | 0 | 112.4 |
| 3 | 成都(500m) | 30 | 25 | 27 | 15 | 15 | +5 | 0 | 117 |

> 注：虽然昆明总分高，但海拔1890m对高血压患者不利，系统自动降权。

### 示例3：预算有限、冬季避寒

```
输入：age=65, budget=1500, month=12, health="", preference="海边"
```

| 排名 | 城市 | 预算分 | 总分 |
|------|------|--------|------|
| 1 | 北海 | 30 | 98.9 |
| 2 | 湛江 | 30 | 94.0 |
| 3 | 惠州 | 25 | 96.7 |

---

## 后续升级方向

### 阶段2：增加权重配置

```python
# 可配置权重
WEIGHTS = {
    "budget": 0.25,    # 预算权重 25%
    "medical": 0.20,   # 医疗权重 20%
    "elderly": 0.25,   # 综合宜居 25%
    "transport": 0.15, # 交通 15%
    "living": 0.15,    # 生活 15%
}
```

### 阶段3：引入协同过滤

```python
# "喜欢这个城市的老人也喜欢..."
similar_cities = get_similar_cities(user_favorites)
```

### 阶段4：LLM增强

```python
prompt = f"""
用户信息：{age}岁, 预算{budget}元, {month}月居住, 健康{health}, 偏好{preference}
推荐理由：请用通俗易懂的语言解释为什么推荐这些城市
"""
response = llm.chat(prompt)
```

### 阶段5：个性化学习

- 记录用户点击/收藏行为
- 动态调整用户偏好权重
- 冷启动：使用同年龄段/同预算用户群体的热门选择

---

## 算法验证指标

| 指标 | 说明 | 目标 |
|------|------|------|
| 点击率 | 推荐结果被点击的比例 | > 40% |
| 收藏率 | 推荐城市被收藏的比例 | > 15% |
| 停留时长 | 用户在推荐页的停留时间 | > 30s |
| 满意度调查 | 用户反馈"推荐是否准确" | > 4.0/5.0 |
