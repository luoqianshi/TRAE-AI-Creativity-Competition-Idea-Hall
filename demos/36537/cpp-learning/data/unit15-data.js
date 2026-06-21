/**
 * 单元15：顺序容器
 */
const Unit15Data = {
    id: 15,
    title: '顺序容器',
    description: '深入理解C++顺序容器，掌握vector、deque、list、string、array及容器适配器的使用',
    lessons: [
        {
            id: '15.1',
            title: '容器概述与选择策略',
            duration: '30分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 容器概述与选择策略

### 什么是容器？

容器是用于存储和管理一组对象的数据结构。C++标准库提供了多种容器类型。

\`\`\`cpp
#include <vector>
#include <list>
#include <deque>
#include <array>
#include <string>
#include <forward_list>
\`\`\`

### 顺序容器的类型

| 容器 | 特点 | 底层结构 |
|------|------|----------|
| vector | 动态数组，随机访问快 | 连续内存 |
| deque | 双端队列，两端操作快 | 分段连续内存 |
| list | 双向链表，任意位置插入删除快 | 双向链表节点 |
| forward_list | 单向链表，内存占用小 | 单向链表节点 |
| array | 固定大小数组 | 连续内存 |
| string | 字符串容器 | 连续内存 |

### 容器的共同操作

#### 1. 构造与初始化

\`\`\`cpp
// 默认构造
std::vector<int> v1;

// 初始化列表
std::vector<int> v2 = {1, 2, 3, 4, 5};

// 指定大小
std::vector<int> v3(10);  // 10个元素，值为0

// 指定大小和初始值
std::vector<int> v4(10, 5);  // 10个元素，值为5

// 拷贝构造
std::vector<int> v5(v2);

// 迭代器范围
std::vector<int> v6(v2.begin(), v2.end());
\`\`\`

#### 2. 大小与容量

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

vec.size();       // 元素数量：5
vec.empty();      // 是否为空：false
vec.max_size();   // 最大可能大小
vec.capacity();   // 容量（vector特有）
\`\`\`

#### 3. 访问元素

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

vec[0];           // 下标访问（不检查边界）
vec.at(0);        // 安全访问（检查边界）
vec.front();      // 首元素
vec.back();       // 末元素
\`\`\`

#### 4. 迭代器

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 正向迭代器
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}

// 反向迭代器
for (auto it = vec.rbegin(); it != vec.rend(); ++it) {
    std::cout << *it << " ";
}

// 范围for循环
for (int val : vec) {
    std::cout << val << " ";
}
\`\`\`

### 容器选择策略

#### 选择vector当：
- 需要随机访问元素
- 主要在末尾添加/删除元素
- 元素数量变化不大

#### 选择deque当：
- 需要在两端添加/删除元素
- 需要随机访问
- 内存分配敏感

#### 选择list/forward_list当：
- 需要在中间频繁插入/删除
- 不需要随机访问
- 迭代器稳定性重要

\`\`\`cpp
// 示例：根据需求选择容器

// 场景1：存储学生成绩，需要随机访问
std::vector<int> scores;  // 最佳选择

// 场景2：任务队列，两端都需要操作
std::deque<Task> taskQueue;  // 最佳选择

// 场景3：频繁在中间插入的数据
std::list<Data> dataList;  // 最佳选择
\`\`\`

### 性能对比

| 操作 | vector | deque | list |
|------|--------|-------|------|
| 随机访问 | O(1) | O(1) | O(n) |
| 末尾插入/删除 | O(1)* | O(1) | O(1) |
| 首部插入/删除 | O(n) | O(1) | O(1) |
| 中间插入/删除 | O(n) | O(n) | O(1) |

*vector可能需要重新分配内存

### 容器的限制

\`\`\`cpp
// 容器元素必须可拷贝
class NonCopyable {
public:
    NonCopyable(const NonCopyable&) = delete;
};

std::vector<NonCopyable> vec;  // 错误！

// 使用智能指针或移动语义
std::vector<std::unique_ptr<Data>> vec;  // 正确
\`\`\``,
            examples: [
                {
                    title: '容器基本操作',
                    code: `#include <iostream>
#include <vector>
#include <list>
#include <deque>

int main() {
    // vector示例
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "Vector: ";
    for (int val : vec) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    std::cout << "大小: " << vec.size() << std::endl;
    std::cout << "首元素: " << vec.front() << std::endl;
    std::cout << "末元素: " << vec.back() << std::endl;
    
    // deque示例
    std::deque<int> deq;
    deq.push_back(10);
    deq.push_front(5);
    std::cout << "\\nDeque: ";
    for (int val : deq) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // list示例
    std::list<int> lst = {10, 20, 30};
    lst.insert(lst.begin(), 5);
    std::cout << "\\nList: ";
    for (int val : lst) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示vector、deque、list的基本操作。'
                },
                {
                    title: '容器选择示例',
                    code: `#include <iostream>
#include <vector>
#include <deque>
#include <list>
#include <chrono>

// 测试插入性能
void testInsertPerformance() {
    const int N = 100000;
    
    // vector末尾插入
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<int> vec;
    for (int i = 0; i < N; ++i) {
        vec.push_back(i);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Vector末尾插入: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // deque首部插入
    start = std::chrono::high_resolution_clock::now();
    std::deque<int> deq;
    for (int i = 0; i < N; ++i) {
        deq.push_front(i);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "Deque首部插入: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // list首部插入
    start = std::chrono::high_resolution_clock::now();
    std::list<int> lst;
    for (int i = 0; i < N; ++i) {
        lst.push_front(i);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "List首部插入: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
}

int main() {
    std::cout << "性能测试 (插入" << 100000 << "个元素):" << std::endl;
    testInsertPerformance();
    
    return 0;
}`,
                    description: '比较不同容器的插入性能。'
                }
            ],
            handsOn: {
                title: '选择合适的容器',
                description: '根据场景选择合适的容器并完成基本操作。',
                initialCode: `#include <iostream>
#include <vector>
#include <deque>
#include <list>

// TODO: 为以下场景选择合适的容器类型

// 场景1：存储100个学生的成绩，需要随机访问和排序
// 选择容器类型并完成初始化
void scenario1() {
    // TODO: 选择容器并初始化
    // 添加成绩：85, 92, 78, 90, 88
    // 计算平均分
}

// 场景2：实现一个简单的任务队列，新任务添加到末尾，处理任务从首部取出
// 选择容器类型并实现
void scenario2() {
    // TODO: 选择容器并实现队列操作
    // 添加任务：Task1, Task2, Task3
    // 取出并显示第一个任务
}

// 场景3：实现一个撤销功能，需要在中间插入操作记录
// 选择容器类型并实现
void scenario3() {
    // TODO: 选择容器并实现插入操作
    // 添加记录：Record1, Record3
    // 在中间插入：Record2
}

int main() {
    std::cout << "=== 场景1 ===" << std::endl;
    scenario1();
    
    std::cout << "\\n=== 场景2 ===" << std::endl;
    scenario2();
    
    std::cout << "\\n=== 场景3 ===" << std::endl;
    scenario3();
    
    return 0;
}`,
                expectedOutput: `=== 场景1 ===
平均分: 86.6

=== 场景2 ===
添加任务: Task1 Task2 Task3 
处理任务: Task1

=== 场景3 ===
操作记录: Record1 Record2 Record3`,
                solutionRegex: 'vector|deque|list|push_back|push_front|insert',
                hint: '场景1用vector，场景2用deque，场景3用list',
                xp: 150
            },
            references: [
                { title: '顺序容器', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '容器选择', book: 'Effective STL', chapter: '条款1-10' }
            ],
            assistantTips: [
                'vector是最常用的容器，优先考虑',
                'deque适合双端操作场景',
                'list适合频繁中间插入删除',
                '根据访问模式选择容器'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '以下哪个容器支持随机访问？', 
                    options: [
                        { text: 'list' }, 
                        { text: 'forward_list' }, 
                        { text: 'vector', correct: true }, 
                        { text: '都不支持' }
                    ], 
                    explanation: 'vector和deque支持随机访问，list和forward_list不支持。' 
                },
                { 
                    type: 'single', 
                    question: '在容器首部插入元素效率最高的是？', 
                    options: [
                        { text: 'vector' }, 
                        { text: 'deque', correct: true }, 
                        { text: 'array' }, 
                        { text: 'string' }
                    ], 
                    explanation: 'deque在首部插入是O(1)，vector是O(n)。' 
                },
                { 
                    type: 'single', 
                    question: 'vector的capacity()返回什么？', 
                    options: [
                        { text: '元素数量' }, 
                        { text: '已分配内存可容纳的元素数量', correct: true }, 
                        { text: '最大可能大小' }, 
                        { text: '剩余空间' }
                    ], 
                    explanation: 'capacity()返回已分配内存可容纳的元素数量，size()返回实际元素数量。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个操作对所有顺序容器都可用？', 
                    options: [
                        { text: 'push_front()' }, 
                        { text: 'push_back()', correct: true }, 
                        { text: 'at()' }, 
                        { text: 'capacity()' }
                    ], 
                    explanation: 'push_back()对所有顺序容器可用（array除外），push_front()只对deque、list、forward_list可用。' 
                },
                { 
                    type: 'single', 
                    question: 'forward_list相比list的优势是？', 
                    options: [
                        { text: '支持反向遍历' }, 
                        { text: '内存占用更小', correct: true }, 
                        { text: '随机访问更快' }, 
                        { text: '插入更快' }
                    ], 
                    explanation: 'forward_list是单向链表，每个节点只存储一个指针，内存占用更小。' 
                }
            ]
        },
        {
            id: '15.2',
            title: 'vector：容量管理、插入删除、迭代器失效',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## vector：容量管理、插入删除、迭代器失效

### vector的本质

vector是动态数组，元素存储在连续内存中。

\`\`\`cpp
#include <vector>

std::vector<int> vec;
vec.push_back(1);  // 动态增长
vec.push_back(2);
vec.push_back(3);
\`\`\`

### 容量管理

#### size vs capacity

\`\`\`cpp
std::vector<int> vec;

vec.push_back(1);
std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
// size: 1, capacity: 1

vec.push_back(2);
std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
// size: 2, capacity: 2

vec.push_back(3);
std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
// size: 3, capacity: 4 (容量通常翻倍增长)
\`\`\`

#### 容量管理函数

\`\`\`cpp
std::vector<int> vec;

// 预留空间
vec.reserve(100);  // 预分配100个元素的空间
std::cout << "capacity: " << vec.capacity() << std::endl;  // 100

// 调整大小
vec.resize(10);    // 大小变为10，新增元素值为0
vec.resize(20, 5); // 大小变为20，新增元素值为5

// 缩小容量
vec.shrink_to_fit();  // 请求释放未使用的内存
\`\`\`

#### 内存重新分配

\`\`\`cpp
std::vector<int> vec;
vec.reserve(10);

for (int i = 0; i < 15; ++i) {
    vec.push_back(i);
    std::cout << "size: " << vec.size() 
              << ", capacity: " << vec.capacity() << std::endl;
}
// 当size超过capacity时，vector会重新分配更大的内存
\`\`\`

### 插入与删除

#### 尾部操作

\`\`\`cpp
std::vector<int> vec;

// 尾部插入
vec.push_back(1);
vec.push_back(2);
vec.emplace_back(3);  // 原地构造（C++11）

// 尾部删除
vec.pop_back();
\`\`\`

#### 任意位置操作

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 插入
auto it = vec.insert(vec.begin() + 2, 10);  // 在位置2插入10
// vec: 1, 2, 10, 3, 4, 5

// 插入多个
vec.insert(vec.begin(), 3, 0);  // 在开头插入3个0
// vec: 0, 0, 0, 1, 2, 10, 3, 4, 5

// 删除
vec.erase(vec.begin() + 1);  // 删除位置1的元素
vec.erase(vec.begin(), vec.begin() + 2);  // 删除范围

// 清空
vec.clear();
\`\`\`

#### emplace操作

\`\`\`cpp
class Person {
public:
    std::string name;
    int age;
    Person(const std::string& n, int a) : name(n), age(a) {}
};

std::vector<Person> people;

// push_back需要创建临时对象
people.push_back(Person("Alice", 25));

// emplace_back直接在容器中构造
people.emplace_back("Bob", 30);  // 更高效
\`\`\`

### 迭代器失效

迭代器失效是使用vector时的重要问题！

#### 何时迭代器失效？

1. **重新分配内存时**：所有迭代器、指针、引用失效
2. **插入/删除元素时**：从操作位置到末尾的迭代器失效

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};
auto it = vec.begin() + 2;  // 指向3

vec.push_back(6);  // 可能触发重新分配
// it可能失效！

vec.insert(vec.begin(), 0);  // 插入导致元素移动
// it肯定失效！
\`\`\`

#### 安全使用迭代器

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 错误：迭代器失效
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it == 3) {
        vec.insert(it, 10);  // it失效！
    }
}

// 正确：使用返回的新迭代器
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it == 3) {
        it = vec.insert(it, 10);  // 更新迭代器
        ++it;  // 跳过新插入的元素
    }
}

// 正确：使用索引
for (size_t i = 0; i < vec.size(); ++i) {
    if (vec[i] == 3) {
        vec.insert(vec.begin() + i, 10);
        ++i;  // 跳过新元素
    }
}
\`\`\`

#### 删除元素时的迭代器

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5, 6};

// 错误：删除后迭代器失效
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it % 2 == 0) {
        vec.erase(it);  // it失效！
    }
}

// 正确：使用erase的返回值
for (auto it = vec.begin(); it != vec.end(); ) {
    if (*it % 2 == 0) {
        it = vec.erase(it);  // 返回下一个有效迭代器
    } else {
        ++it;
    }
}

// 正确：使用remove_if和erase（推荐）
vec.erase(
    std::remove_if(vec.begin(), vec.end(), [](int x) { return x % 2 == 0; }),
    vec.end()
);
\`\`\`

### 性能优化技巧

\`\`\`cpp
// 1. 预分配空间
std::vector<int> vec;
vec.reserve(1000);  // 避免多次重新分配

// 2. 使用emplace_back
std::vector<std::string> strs;
strs.emplace_back("Hello");  // 比push_back高效

// 3. 批量操作
std::vector<int> vec1 = {1, 2, 3};
std::vector<int> vec2 = {4, 5, 6};
vec1.insert(vec1.end(), vec2.begin(), vec2.end());  // 批量插入

// 4. swap技巧释放内存
std::vector<int>().swap(vec);  // 清空并释放内存
\`\`\``,
            examples: [
                {
                    title: '容量管理示例',
                    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec;
    
    std::cout << "初始状态:" << std::endl;
    std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
    
    // 预留空间
    vec.reserve(10);
    std::cout << "\\nreserve(10)后:" << std::endl;
    std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
    
    // 添加元素
    for (int i = 0; i < 15; ++i) {
        vec.push_back(i);
        if (i < 5 || i >= 10) {
            std::cout << "添加" << i << "后: size=" << vec.size() 
                      << ", capacity=" << vec.capacity() << std::endl;
        }
    }
    
    // 调整大小
    vec.resize(20, 99);
    std::cout << "\\nresize(20, 99)后:" << std::endl;
    std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
    
    // 缩小容量
    vec.shrink_to_fit();
    std::cout << "\\nshrink_to_fit()后:" << std::endl;
    std::cout << "size: " << vec.size() << ", capacity: " << vec.capacity() << std::endl;
    
    return 0;
}`,
                    description: '展示vector容量管理的各种操作。'
                },
                {
                    title: '迭代器失效处理',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // 示例1：删除偶数元素
    std::vector<int> vec1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    std::cout << "原始vector: ";
    for (int val : vec1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 正确的删除方式
    for (auto it = vec1.begin(); it != vec1.end(); ) {
        if (*it % 2 == 0) {
            it = vec1.erase(it);
        } else {
            ++it;
        }
    }
    
    std::cout << "删除偶数后: ";
    for (int val : vec1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 示例2：使用remove_if + erase
    std::vector<int> vec2 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    vec2.erase(
        std::remove_if(vec2.begin(), vec2.end(), [](int x) { return x > 5; }),
        vec2.end()
    );
    
    std::cout << "\\n删除大于5的元素后: ";
    for (int val : vec2) std::cout << val << " ";
    std::cout << std::endl;
    
    // 示例3：安全插入
    std::vector<int> vec3 = {1, 2, 3, 4, 5};
    auto it = vec3.begin() + 2;
    
    std::cout << "\\n插入前迭代器指向: " << *it << std::endl;
    
    it = vec3.insert(it, 10);  // 更新迭代器
    std::cout << "插入后迭代器指向: " << *it << std::endl;
    
    std::cout << "vector内容: ";
    for (int val : vec3) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示如何正确处理迭代器失效问题。'
                }
            ],
            handsOn: {
                title: 'vector操作实践',
                description: '实现一个简单的动态数组管理器，包含插入、删除、查找等功能。',
                initialCode: `#include <iostream>
#include <vector>
#include <algorithm>

class DynamicArray {
private:
    std::vector<int> data;
    
public:
    // 添加元素
    void add(int value) {
        // TODO: 实现添加元素
    }
    
    // 在指定位置插入元素
    void insertAt(size_t index, int value) {
        // TODO: 实现在指定位置插入
    }
    
    // 删除指定位置的元素
    void removeAt(size_t index) {
        // TODO: 实现删除指定位置元素
    }
    
    // 删除所有等于value的元素
    void removeAll(int value) {
        // TODO: 实现删除所有匹配元素
    }
    
    // 查找元素，返回索引（不存在返回-1）
    int find(int value) const {
        // TODO: 实现查找功能
        return -1;
    }
    
    // 预留空间
    void reserve(size_t capacity) {
        // TODO: 实现预留空间
    }
    
    // 显示所有元素
    void display() const {
        std::cout << "数组内容: ";
        for (int val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
        std::cout << "大小: " << data.size() << ", 容量: " << data.capacity() << std::endl;
    }
};

int main() {
    DynamicArray arr;
    
    arr.add(1);
    arr.add(2);
    arr.add(3);
    arr.display();
    
    arr.insertAt(1, 10);
    std::cout << "\\n在位置1插入10后:" << std::endl;
    arr.display();
    
    arr.removeAt(2);
    std::cout << "\\n删除位置2的元素后:" << std::endl;
    arr.display();
    
    arr.add(2);
    arr.add(2);
    std::cout << "\\n添加两个2后:" << std::endl;
    arr.display();
    
    arr.removeAll(2);
    std::cout << "\\n删除所有2后:" << std::endl;
    arr.display();
    
    int index = arr.find(10);
    std::cout << "\\n查找10的位置: " << index << std::endl;
    
    return 0;
}`,
                expectedOutput: `数组内容: 1 2 3 
大小: 3, 容量: 3

在位置1插入10后:
数组内容: 1 10 2 3 
大小: 4, 容量: 6

删除位置2的元素后:
数组内容: 1 10 3 
大小: 3, 容量: 6

添加两个2后:
数组内容: 1 10 3 2 2 
大小: 5, 容量: 6

删除所有2后:
数组内容: 1 10 3 
大小: 3, 容量: 6

查找10的位置: 1`,
                solutionRegex: 'push_back|insert|erase|remove|find|reserve',
                hint: '使用push_back添加，insert插入，erase删除，remove_if批量删除，find查找',
                xp: 200
            },
            references: [
                { title: 'vector', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '迭代器失效', book: 'Effective STL', chapter: '条款9-10' }
            ],
            assistantTips: [
                '使用reserve预分配空间提高性能',
                '插入/删除操作可能导致迭代器失效',
                'emplace_back比push_back更高效',
                '使用erase-remove惯用法删除元素'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'vector的capacity()和size()的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'capacity是已分配内存可容纳的元素数，size是实际元素数', correct: true }, 
                        { text: 'capacity总是等于size' }, 
                        { text: 'size总是大于capacity' }
                    ], 
                    explanation: 'capacity是已分配内存可容纳的元素数量，size是实际存储的元素数量。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况会导致vector迭代器失效？', 
                    options: [
                        { text: '读取元素' }, 
                        { text: '使用at()访问' }, 
                        { text: '插入元素导致重新分配', correct: true }, 
                        { text: '使用front()' }
                    ], 
                    explanation: '插入元素可能导致vector重新分配内存，使所有迭代器失效。' 
                },
                { 
                    type: 'single', 
                    question: 'emplace_back相比push_back的优势是？', 
                    options: [
                        { text: '更安全' }, 
                        { text: '原地构造，避免临时对象', correct: true }, 
                        { text: '支持更多类型' }, 
                        { text: '更简单' }
                    ], 
                    explanation: 'emplace_back直接在容器中构造对象，避免创建临时对象。' 
                },
                { 
                    type: 'single', 
                    question: '删除vector中所有偶数的正确方法是？', 
                    options: [
                        { text: '用for循环直接erase' }, 
                        { text: '用erase-remove_if惯用法', correct: true }, 
                        { text: '用clear()' }, 
                        { text: '用pop_back()' }
                    ], 
                    explanation: '使用erase-remove_if惯用法是删除满足条件元素的标准方法。' 
                },
                { 
                    type: 'single', 
                    question: 'reserve(100)的作用是？', 
                    options: [
                        { text: '添加100个元素' }, 
                        { text: '预分配至少容纳100个元素的空间', correct: true }, 
                        { text: '删除100个元素' }, 
                        { text: '设置size为100' }
                    ], 
                    explanation: 'reserve预分配空间但不改变size，避免多次重新分配。' 
                }
            ]
        },
        {
            id: '15.3',
            title: 'deque：双端操作',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## deque：双端操作

### deque的特点

deque（double-ended queue）是双端队列，支持在两端高效地插入和删除元素。

\`\`\`cpp
#include <deque>

std::deque<int> dq;
dq.push_back(1);   // 尾部插入
dq.push_front(2);  // 首部插入
\`\`\`

### deque的内部结构

deque由多个固定大小的块（chunk）组成：

\`\`\`
+--------+--------+--------+
| Chunk1 | Chunk2 | Chunk3 |  ...
+--------+--------+--------+
    ^                  ^
    |                  |
  front              back
\`\`\`

- 元素在内存中不完全连续
- 通过中控器（map）管理各个块
- 两端插入都是O(1)

### deque vs vector

| 特性 | deque | vector |
|------|-------|--------|
| 随机访问 | O(1) | O(1) |
| 尾部插入/删除 | O(1) | O(1) |
| 首部插入/删除 | O(1) | O(n) |
| 中间插入/删除 | O(n) | O(n) |
| 内存连续性 | 分段连续 | 完全连续 |
| 迭代器 | 更复杂 | 简单指针 |

### deque的操作

#### 构造与初始化

\`\`\`cpp
// 默认构造
std::deque<int> dq1;

// 初始化列表
std::deque<int> dq2 = {1, 2, 3, 4, 5};

// 指定大小
std::deque<int> dq3(10);  // 10个元素，值为0

// 指定大小和初始值
std::deque<int> dq4(10, 5);  // 10个元素，值为5

// 拷贝构造
std::deque<int> dq5(dq2);
\`\`\`

#### 双端操作

\`\`\`cpp
std::deque<int> dq;

// 尾部操作
dq.push_back(1);
dq.push_back(2);
dq.emplace_back(3);  // 原地构造

dq.pop_back();  // 删除尾部元素

// 首部操作
dq.push_front(0);
dq.emplace_front(-1);

dq.pop_front();  // 删除首部元素
\`\`\`

#### 访问元素

\`\`\`cpp
std::deque<int> dq = {1, 2, 3, 4, 5};

dq[0];           // 下标访问（不检查边界）
dq.at(0);        // 安全访问（检查边界）
dq.front();      // 首元素
dq.back();       // 末元素
\`\`\`

#### 迭代器

\`\`\`cpp
std::deque<int> dq = {1, 2, 3, 4, 5};

// 正向遍历
for (auto it = dq.begin(); it != dq.end(); ++it) {
    std::cout << *it << " ";
}

// 反向遍历
for (auto it = dq.rbegin(); it != dq.rend(); ++it) {
    std::cout << *it << " ";
}

// 范围for
for (int val : dq) {
    std::cout << val << " ";
}
\`\`\`

#### 插入与删除

\`\`\`cpp
std::deque<int> dq = {1, 2, 3, 4, 5};

// 任意位置插入
auto it = dq.insert(dq.begin() + 2, 10);  // 在位置2插入10

// 删除
dq.erase(dq.begin() + 1);  // 删除位置1的元素
dq.erase(dq.begin(), dq.begin() + 2);  // 删除范围

// 清空
dq.clear();
\`\`\`

### deque的迭代器失效

deque的迭代器失效规则比vector复杂：

1. **在首部或尾部插入**：所有迭代器失效，但指针和引用不失效
2. **在中间插入**：所有迭代器、指针、引用失效
3. **删除首部或尾部元素**：只有被删除元素的迭代器失效
4. **删除中间元素**：所有迭代器、指针、引用失效

\`\`\`cpp
std::deque<int> dq = {1, 2, 3, 4, 5};

int* p = &dq[2];  // 指向3

dq.push_back(6);  // 迭代器失效，但p仍有效
dq.push_front(0); // 迭代器失效，但p仍有效

dq.insert(dq.begin() + 2, 10);  // 所有都失效！
\`\`\`

### deque的应用场景

#### 1. 滑动窗口

\`\`\`cpp
#include <deque>
#include <vector>

std::vector<int> maxSlidingWindow(const std::vector<int>& nums, int k) {
    std::deque<int> dq;  // 存储索引
    std::vector<int> result;
    
    for (int i = 0; i < nums.size(); ++i) {
        // 移除窗口外的元素
        while (!dq.empty() && dq.front() <= i - k) {
            dq.pop_front();
        }
        
        // 维护递减序列
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}
\`\`\`

#### 2. 任务队列

\`\`\`cpp
class TaskQueue {
private:
    std::deque<Task> tasks;
    
public:
    void addTask(const Task& task) {
        tasks.push_back(task);
    }
    
    void addUrgentTask(const Task& task) {
        tasks.push_front(task);
    }
    
    Task getNextTask() {
        if (tasks.empty()) throw std::runtime_error("No tasks");
        Task task = tasks.front();
        tasks.pop_front();
        return task;
    }
    
    bool empty() const { return tasks.empty(); }
};
\`\`\`

#### 3. 浏览器历史记录

\`\`\`cpp
class BrowserHistory {
private:
    std::deque<std::string> history;
    size_t current;
    
public:
    void visit(const std::string& url) {
        // 清除当前位置之后的历史
        while (history.size() > current + 1) {
            history.pop_back();
        }
        history.push_back(url);
        current = history.size() - 1;
    }
    
    std::string back() {
        if (current > 0) --current;
        return history[current];
    }
    
    std::string forward() {
        if (current < history.size() - 1) ++current;
        return history[current];
    }
};
\`\`\``,
            examples: [
                {
                    title: 'deque基本操作',
                    code: `#include <iostream>
#include <deque>

int main() {
    std::deque<int> dq;
    
    // 双端插入
    dq.push_back(2);
    dq.push_back(3);
    dq.push_front(1);
    dq.push_front(0);
    
    std::cout << "双端插入后: ";
    for (int val : dq) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 访问元素
    std::cout << "首元素: " << dq.front() << std::endl;
    std::cout << "末元素: " << dq.back() << std::endl;
    std::cout << "中间元素[2]: " << dq[2] << std::endl;
    
    // 双端删除
    dq.pop_front();
    dq.pop_back();
    
    std::cout << "\\n双端删除后: ";
    for (int val : dq) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 中间插入
    dq.insert(dq.begin() + 1, 10);
    std::cout << "中间插入后: ";
    for (int val : dq) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示deque的基本操作。'
                },
                {
                    title: '滑动窗口最大值',
                    code: `#include <iostream>
#include <deque>
#include <vector>

std::vector<int> maxSlidingWindow(const std::vector<int>& nums, int k) {
    std::deque<int> dq;  // 存储索引
    std::vector<int> result;
    
    for (int i = 0; i < nums.size(); ++i) {
        // 移除窗口外的元素
        while (!dq.empty() && dq.front() <= i - k) {
            dq.pop_front();
        }
        
        // 维护递减序列
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}

int main() {
    std::vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    
    std::cout << "数组: ";
    for (int val : nums) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    std::cout << "窗口大小: " << k << std::endl;
    
    std::vector<int> result = maxSlidingWindow(nums, k);
    
    std::cout << "滑动窗口最大值: ";
    for (int val : result) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '使用deque实现滑动窗口最大值算法。'
                }
            ],
            handsOn: {
                title: '实现任务调度器',
                description: '使用deque实现一个支持优先级和普通任务的任务调度器。',
                initialCode: `#include <iostream>
#include <deque>
#include <string>

struct Task {
    std::string name;
    int priority;  // 0=普通, 1=高优先级
    
    Task(const std::string& n, int p = 0) : name(n), priority(p) {}
};

class TaskScheduler {
private:
    std::deque<Task> tasks;
    
public:
    // 添加普通任务（添加到尾部）
    void addTask(const std::string& name) {
        // TODO: 实现添加普通任务
    }
    
    // 添加高优先级任务（添加到首部）
    void addUrgentTask(const std::string& name) {
        // TODO: 实现添加高优先级任务
    }
    
    // 获取下一个任务
    Task getNextTask() {
        // TODO: 实现获取并移除下一个任务
        // 如果没有任务，返回空任务
        return Task("", 0);
    }
    
    // 查看下一个任务（不移除）
    Task peekNextTask() const {
        // TODO: 实现查看下一个任务
        return Task("", 0);
    }
    
    // 获取任务数量
    size_t getTaskCount() const {
        // TODO: 返回任务数量
        return 0;
    }
    
    // 显示所有任务
    void displayTasks() const {
        std::cout << "当前任务队列:" << std::endl;
        for (const auto& task : tasks) {
            std::cout << "  - " << task.name 
                      << " (优先级: " << (task.priority ? "高" : "普通") << ")" 
                      << std::endl;
        }
    }
};

int main() {
    TaskScheduler scheduler;
    
    scheduler.addTask("任务A");
    scheduler.addTask("任务B");
    scheduler.addUrgentTask("紧急任务1");
    scheduler.addTask("任务C");
    scheduler.addUrgentTask("紧急任务2");
    
    std::cout << "初始任务队列:" << std::endl;
    scheduler.displayTasks();
    
    std::cout << "\\n处理任务:" << std::endl;
    while (scheduler.getTaskCount() > 0) {
        Task task = scheduler.getNextTask();
        std::cout << "处理: " << task.name << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `初始任务队列:
当前任务队列:
  - 紧急任务2 (优先级: 高)
  - 紧急任务1 (优先级: 高)
  - 任务A (优先级: 普通)
  - 任务B (优先级: 普通)
  - 任务C (优先级: 普通)

处理任务:
处理: 紧急任务2
处理: 紧急任务1
处理: 任务A
处理: 任务B
处理: 任务C`,
                solutionRegex: 'push_back|push_front|pop_front|front|size',
                hint: '普通任务用push_back，高优先级用push_front，获取用front和pop_front',
                xp: 180
            },
            references: [
                { title: 'deque', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '容器选择', book: 'Effective STL', chapter: '条款4-5' }
            ],
            assistantTips: [
                'deque适合需要双端操作的场景',
                'deque的迭代器比vector复杂',
                '首尾插入不使指针和引用失效',
                '中间插入会使所有迭代器失效'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'deque相比vector的优势是？', 
                    options: [
                        { text: '随机访问更快' }, 
                        { text: '首部插入删除更快', correct: true }, 
                        { text: '内存占用更小' }, 
                        { text: '迭代器更简单' }
                    ], 
                    explanation: 'deque在首部插入删除是O(1)，vector是O(n)。' 
                },
                { 
                    type: 'single', 
                    question: 'deque的内存结构是？', 
                    options: [
                        { text: '完全连续' }, 
                        { text: '分段连续', correct: true }, 
                        { text: '完全分散' }, 
                        { text: '链式结构' }
                    ], 
                    explanation: 'deque由多个固定大小的块组成，内存分段连续。' 
                },
                { 
                    type: 'single', 
                    question: '在deque首部插入元素后，迭代器会失效吗？', 
                    options: [
                        { text: '不会失效' }, 
                        { text: '迭代器失效，指针和引用不失效', correct: true }, 
                        { text: '全部失效' }, 
                        { text: '取决于位置' }
                    ], 
                    explanation: '在deque首部或尾部插入，迭代器失效但指针和引用不失效。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个操作deque没有？', 
                    options: [
                        { text: 'push_back()' }, 
                        { text: 'push_front()' }, 
                        { text: 'capacity()', correct: true }, 
                        { text: 'at()' }
                    ], 
                    explanation: 'deque没有capacity()函数，因为它不需要预分配连续内存。' 
                },
                { 
                    type: 'single', 
                    question: 'deque适合实现什么数据结构？', 
                    options: [
                        { text: '栈' }, 
                        { text: '队列', correct: true }, 
                        { text: '树' }, 
                        { text: '图' }
                    ], 
                    explanation: 'deque的双端操作特性使其非常适合实现队列。' 
                }
            ]
        },
        {
            id: '15.4',
            title: 'list 与 forward_list：链式结构',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## list 与 forward_list：链式结构

### list的特点

list是双向链表，每个节点包含指向前驱和后继的指针。

\`\`\`cpp
#include <list>

std::list<int> lst;
lst.push_back(1);
lst.push_front(2);
\`\`\`

### forward_list的特点

forward_list是单向链表，每个节点只包含指向后继的指针。

\`\`\`cpp
#include <forward_list>

std::forward_list<int> flst;
flst.push_front(1);
flst.push_front(2);
\`\`\`

### list vs forward_list vs vector

| 特性 | list | forward_list | vector |
|------|------|--------------|--------|
| 随机访问 | O(n) | O(n) | O(1) |
| 任意位置插入/删除 | O(1) | O(1)* | O(n) |
| 内存占用 | 较大 | 较小 | 最小 |
| 反向遍历 | 支持 | 不支持 | 支持 |
| 迭代器稳定性 | 稳定 | 稳定 | 不稳定 |

*forward_list的插入删除需要先找到前驱节点

### list的操作

#### 构造与初始化

\`\`\`cpp
// 默认构造
std::list<int> lst1;

// 初始化列表
std::list<int> lst2 = {1, 2, 3, 4, 5};

// 指定大小
std::list<int> lst3(10);  // 10个元素，值为0

// 指定大小和初始值
std::list<int> lst4(10, 5);
\`\`\`

#### 插入与删除

\`\`\`cpp
std::list<int> lst = {1, 2, 3, 4, 5};

// 尾部操作
lst.push_back(6);
lst.pop_back();

// 首部操作
lst.push_front(0);
lst.pop_front();

// 任意位置插入
auto it = lst.begin();
std::advance(it, 2);  // 移动到位置2
lst.insert(it, 10);

// 删除
lst.erase(it);
lst.remove(3);  // 删除所有值为3的元素
lst.remove_if([](int x) { return x % 2 == 0; });  // 删除偶数
\`\`\`

#### 特有操作

\`\`\`cpp
std::list<int> lst1 = {1, 3, 5};
std::list<int> lst2 = {2, 4, 6};

// 拼接
lst1.splice(lst1.end(), lst2);  // 将lst2拼接到lst1末尾

// 排序
lst1.sort();

// 合并（需要先排序）
std::list<int> lst3 = {1, 3, 5};
std::list<int> lst4 = {2, 4, 6};
lst3.merge(lst4);  // 合并后lst4为空

// 去重（需要先排序）
lst3.unique();

// 反转
lst3.reverse();
\`\`\`

### forward_list的操作

#### 构造与初始化

\`\`\`cpp
// 默认构造
std::forward_list<int> flst1;

// 初始化列表
std::forward_list<int> flst2 = {1, 2, 3, 4, 5};

// 指定大小
std::forward_list<int> flst3(10);
\`\`\`

#### 插入与删除

\`\`\`cpp
std::forward_list<int> flst = {1, 2, 3, 4, 5};

// 只能在首部插入
flst.push_front(0);
flst.pop_front();

// 在指定位置之后插入
auto it = flst.begin();
flst.insert_after(it, 10);
flst.emplace_after(it, 20);

// 删除指定位置之后的元素
flst.erase_after(it);
\`\`\`

#### 特殊操作

\`\`\`cpp
std::forward_list<int> flst = {1, 2, 3, 4, 5};

// 获取首前迭代器
auto before_begin = flst.before_begin();
flst.insert_after(before_begin, 0);  // 在首部插入

// 调整大小
flst.resize(10);  // 增加到10个元素
flst.resize(5);   // 减少到5个元素

// 清空
flst.clear();
\`\`\`

### 迭代器稳定性

list和forward_list的最大优势是迭代器稳定性：

\`\`\`cpp
std::list<int> lst = {1, 2, 3, 4, 5};
auto it = lst.begin();
std::advance(it, 2);  // 指向3

lst.insert(lst.begin(), 0);  // 插入元素
lst.erase(lst.begin());      // 删除元素

// it仍然有效，指向3
std::cout << *it << std::endl;  // 输出3
\`\`\`

### 选择建议

#### 使用list当：
- 需要双向遍历
- 需要在中间频繁插入/删除
- 迭代器稳定性重要

#### 使用forward_list当：
- 只需要单向遍历
- 内存敏感
- 不需要size()操作

\`\`\`cpp
// 示例：使用list实现学生管理
class StudentManager {
private:
    std::list<Student> students;
    
public:
    void addStudent(const Student& s) {
        students.push_back(s);
    }
    
    void removeStudent(int id) {
        students.remove_if([id](const Student& s) { 
            return s.id == id; 
        });
    }
    
    // 迭代器保持稳定
    std::list<Student>::iterator findStudent(int id) {
        for (auto it = students.begin(); it != students.end(); ++it) {
            if (it->id == id) return it;
        }
        return students.end();
    }
};
\`\`\``,
            examples: [
                {
                    title: 'list特有操作',
                    code: `#include <iostream>
#include <list>

int main() {
    std::list<int> lst1 = {3, 1, 4, 1, 5, 9, 2, 6};
    
    std::cout << "原始列表: ";
    for (int val : lst1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 排序
    lst1.sort();
    std::cout << "排序后: ";
    for (int val : lst1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 去重
    lst1.unique();
    std::cout << "去重后: ";
    for (int val : lst1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 反转
    lst1.reverse();
    std::cout << "反转后: ";
    for (int val : lst1) std::cout << val << " ";
    std::cout << std::endl;
    
    // 合并
    std::list<int> lst2 = {0, 7, 8};
    lst2.sort();
    lst1.merge(lst2);
    std::cout << "合并后: ";
    for (int val : lst1) std::cout << val << " ";
    std::cout << std::endl;
    
    std::cout << "lst2大小: " << lst2.size() << std::endl;
    
    return 0;
}`,
                    description: '展示list的特有操作：sort、unique、reverse、merge。'
                },
                {
                    title: 'forward_list操作',
                    code: `#include <iostream>
#include <forward_list>

int main() {
    std::forward_list<int> flst = {1, 2, 3, 4, 5};
    
    std::cout << "原始列表: ";
    for (int val : flst) std::cout << val << " ";
    std::cout << std::endl;
    
    // 在首部插入
    flst.push_front(0);
    std::cout << "首部插入0后: ";
    for (int val : flst) std::cout << val << " ";
    std::cout << std::endl;
    
    // 在指定位置之后插入
    auto it = flst.begin();
    ++it;  // 指向1
    flst.insert_after(it, 10);
    std::cout << "在1之后插入10: ";
    for (int val : flst) std::cout << val << " ";
    std::cout << std::endl;
    
    // 在首前位置插入
    auto before = flst.before_begin();
    flst.insert_after(before, -1);
    std::cout << "在首部插入-1: ";
    for (int val : flst) std::cout << val << " ";
    std::cout << std::endl;
    
    // 删除指定位置之后的元素
    it = flst.begin();
    ++it;  // 指向0
    flst.erase_after(it);  // 删除0之后的元素
    std::cout << "删除0之后的元素: ";
    for (int val : flst) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示forward_list的特殊操作。'
                }
            ],
            handsOn: {
                title: '实现链表操作',
                description: '使用list实现一个简单的学生成绩管理系统。',
                initialCode: `#include <iostream>
#include <list>
#include <string>
#include <algorithm>

struct Student {
    int id;
    std::string name;
    double score;
    
    Student(int i, const std::string& n, double s) 
        : id(i), name(n), score(s) {}
};

class StudentManager {
private:
    std::list<Student> students;
    
public:
    // 添加学生
    void addStudent(int id, const std::string& name, double score) {
        // TODO: 实现添加学生
    }
    
    // 删除学生
    bool removeStudent(int id) {
        // TODO: 实现删除学生
        // 返回是否成功删除
        return false;
    }
    
    // 修改成绩
    bool modifyScore(int id, double newScore) {
        // TODO: 实现修改成绩
        // 返回是否成功修改
        return false;
    }
    
    // 按成绩排序
    void sortByScore() {
        // TODO: 实现按成绩排序
    }
    
    // 查找学生
    void findStudent(int id) const {
        // TODO: 实现查找学生并显示信息
        // 如果没找到，显示"未找到"
    }
    
    // 显示所有学生
    void displayAll() const {
        std::cout << "\\n学生列表:" << std::endl;
        std::cout << "ID\\t姓名\\t成绩" << std::endl;
        for (const auto& s : students) {
            std::cout << s.id << "\\t" << s.name << "\\t" << s.score << std::endl;
        }
    }
};

int main() {
    StudentManager manager;
    
    manager.addStudent(101, "张三", 85.5);
    manager.addStudent(102, "李四", 92.0);
    manager.addStudent(103, "王五", 78.5);
    manager.addStudent(104, "赵六", 88.0);
    
    manager.displayAll();
    
    std::cout << "\\n查找学生102:" << std::endl;
    manager.findStudent(102);
    
    std::cout << "\\n修改学生102的成绩为95.0:" << std::endl;
    manager.modifyScore(102, 95.0);
    manager.findStudent(102);
    
    std::cout << "\\n删除学生103:" << std::endl;
    manager.removeStudent(103);
    manager.displayAll();
    
    std::cout << "\\n按成绩排序:" << std::endl;
    manager.sortByScore();
    manager.displayAll();
    
    return 0;
}`,
                expectedOutput: `
学生列表:
ID      姓名    成绩
101     张三    85.5
102     李四    92
103     王五    78.5
104     赵六    88

查找学生102:
找到学生: ID=102, 姓名=李四, 成绩=92

修改学生102的成绩为95.0:
找到学生: ID=102, 姓名=李四, 成绩=95

删除学生103:

学生列表:
ID      姓名    成绩
101     张三    85.5
102     李四    95
104     赵六    88

按成绩排序:

学生列表:
ID      姓名    成绩
102     李四    95
104     赵六    88
101     张三    85.5`,
                solutionRegex: 'push_back|remove_if|sort|find_if',
                hint: '使用push_back添加，remove_if删除，sort排序，find_if查找',
                xp: 200
            },
            references: [
                { title: 'list与forward_list', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '链表操作', book: 'Effective STL', chapter: '条款4-5' }
            ],
            assistantTips: [
                'list适合频繁中间插入删除的场景',
                'forward_list内存占用更小',
                'list的迭代器在插入删除后仍然有效',
                'forward_list没有size()函数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'list相比vector的优势是？', 
                    options: [
                        { text: '随机访问更快' }, 
                        { text: '任意位置插入删除更快', correct: true }, 
                        { text: '内存占用更小' }, 
                        { text: '迭代更简单' }
                    ], 
                    explanation: 'list在任意位置插入删除是O(1)，vector是O(n)。' 
                },
                { 
                    type: 'single', 
                    question: 'forward_list相比list的优势是？', 
                    options: [
                        { text: '支持反向遍历' }, 
                        { text: '内存占用更小', correct: true }, 
                        { text: '有size()函数' }, 
                        { text: '随机访问更快' }
                    ], 
                    explanation: 'forward_list是单向链表，每个节点只存储一个指针，内存占用更小。' 
                },
                { 
                    type: 'single', 
                    question: 'list插入元素后，迭代器会失效吗？', 
                    options: [
                        { text: '全部失效' }, 
                        { text: '不会失效', correct: true }, 
                        { text: '只有被插入位置的失效' }, 
                        { text: '取决于插入位置' }
                    ], 
                    explanation: 'list的迭代器在插入删除操作后仍然有效，这是链表的优势。' 
                },
                { 
                    type: 'single', 
                    question: 'forward_list使用什么函数在首部插入？', 
                    options: [
                        { text: 'push_back()' }, 
                        { text: 'push_front()', correct: true }, 
                        { text: 'insert()' }, 
                        { text: 'emplace()' }
                    ], 
                    explanation: 'forward_list只能在首部插入，使用push_front()。' 
                },
                { 
                    type: 'single', 
                    question: 'list的sort()函数有什么特点？', 
                    options: [
                        { text: '使用std::sort' }, 
                        { text: '是成员函数，时间复杂度O(n log n)', correct: true }, 
                        { text: '不能排序自定义类型' }, 
                        { text: '只能升序排序' }
                    ], 
                    explanation: 'list有自己的sort()成员函数，因为std::sort需要随机访问迭代器。' 
                }
            ]
        },
        {
            id: '15.5',
            title: 'string：深入操作与查找',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## string：深入操作与查找

### string的本质

string是字符的顺序容器，本质上是basic_string<char>的别名。

\`\`\`cpp
#include <string>

std::string s1 = "Hello";
std::string s2("World");
std::string s3(10, 'a');  // "aaaaaaaaaa"
\`\`\`

### string的构造

\`\`\`cpp
// 默认构造
std::string s1;

// 从C字符串构造
std::string s2("Hello");

// 从C字符串的一部分构造
std::string s3("Hello World", 5);  // "Hello"

// 从多个相同字符构造
std::string s4(10, 'a');  // "aaaaaaaaaa"

// 从其他string构造
std::string s5(s2);

// 从迭代器范围构造
std::string s6(s2.begin(), s2.end());

// C++11：从初始化列表构造
std::string s7 = {'H', 'e', 'l', 'l', 'o'};
\`\`\`

### 字符串操作

#### 拼接

\`\`\`cpp
std::string s1 = "Hello";
std::string s2 = "World";

// 使用+
std::string s3 = s1 + " " + s2;

// 使用+=
s1 += " ";
s1 += s2;

// 使用append
s1.append("!");

// 使用push_back
s1.push_back('!');
\`\`\`

#### 访问

\`\`\`cpp
std::string s = "Hello World";

// 下标访问
char c1 = s[0];  // 'H'

// 安全访问
char c2 = s.at(0);  // 'H'

// 首尾字符
char c3 = s.front();  // 'H'
char c4 = s.back();   // 'd'

// C字符串
const char* cstr = s.c_str();
const char* data = s.data();  // C++17起与c_str相同
\`\`\`

#### 子串

\`\`\`cpp
std::string s = "Hello World";

// 获取子串
std::string sub = s.substr(0, 5);  // "Hello"
std::string sub2 = s.substr(6);    // "World"
\`\`\`

#### 插入与删除

\`\`\`cpp
std::string s = "Hello";

// 插入
s.insert(5, " World");  // "Hello World"
s.insert(0, 1, '!');    // "!Hello World"

// 删除
s.erase(0, 1);          // "Hello World"
s.pop_back();           // 删除最后一个字符

// 清空
s.clear();
\`\`\`

#### 替换

\`\`\`cpp
std::string s = "Hello World";

// 替换子串
s.replace(6, 5, "C++");  // "Hello C++"

// 替换为多个相同字符
s.replace(6, 3, 5, '!');  // "Hello !!!!!"
\`\`\`

### 字符串查找

#### find系列

\`\`\`cpp
std::string s = "Hello World Hello";

// 查找子串
size_t pos1 = s.find("World");  // 6
size_t pos2 = s.find("world");  // string::npos（未找到）

// 从指定位置开始查找
size_t pos3 = s.find("Hello", 7);  // 12

// 查找字符
size_t pos4 = s.find('o');  // 4
\`\`\`

#### rfind（反向查找）

\`\`\`cpp
std::string s = "Hello World Hello";

// 从后向前查找
size_t pos = s.rfind("Hello");  // 12
\`\`\`

#### find_first_of系列

\`\`\`cpp
std::string s = "Hello World";

// 查找第一个匹配字符集中任一字符的位置
size_t pos1 = s.find_first_of("aeiou");  // 1（'e'）

// 查找第一个不匹配字符集中任一字符的位置
size_t pos2 = s.find_first_not_of("Helo");  // 5（' '）

// 查找最后一个匹配字符集中任一字符的位置
size_t pos3 = s.find_last_of("aeiou");  // 7（'o'）

// 查找最后一个不匹配字符集中任一字符的位置
size_t pos4 = s.find_last_not_of("Helo");  // 10（'d'）
\`\`\`

### 字符串比较

\`\`\`cpp
std::string s1 = "Hello";
std::string s2 = "World";

// 比较运算符
bool b1 = (s1 == s2);  // false
bool b2 = (s1 < s2);   // true（字典序）

// compare函数
int result = s1.compare(s2);  // <0表示s1 < s2

// 比较子串
int result2 = s1.compare(0, 3, s2, 0, 3);  // 比较前3个字符
\`\`\`

### 字符串转换

\`\`\`cpp
#include <string>

// 数值转字符串
std::string s1 = std::to_string(123);      // "123"
std::string s2 = std::to_string(3.14);     // "3.140000"
std::string s3 = std::to_string(100L);     // "100"

// 字符串转数值
int i = std::stoi("123");           // 123
long l = std::stol("1234567890");   // 1234567890
double d = std::stod("3.14");       // 3.14
float f = std::stof("2.718");       // 2.718f

// 带错误处理
try {
    size_t pos;
    int num = std::stoi("123abc", &pos);  // num=123, pos=3
} catch (const std::exception& e) {
    // 转换失败
}
\`\`\`

### 字符串处理函数

\`\`\`cpp
#include <algorithm>
#include <cctype>

std::string s = "Hello World";

// 大小写转换
std::transform(s.begin(), s.end(), s.begin(), ::toupper);  // "HELLO WORLD"
std::transform(s.begin(), s.end(), s.begin(), ::tolower);  // "hello world"

// 去除空白
s.erase(0, s.find_first_not_of(" \\t\\n"));  // 去除前导空白
s.erase(s.find_last_not_of(" \\t\\n") + 1);  // 去除尾部空白

// 分割字符串
std::vector<std::string> split(const std::string& s, char delimiter) {
    std::vector<std::string> tokens;
    size_t start = 0, end = 0;
    while ((end = s.find(delimiter, start)) != std::string::npos) {
        tokens.push_back(s.substr(start, end - start));
        start = end + 1;
    }
    tokens.push_back(s.substr(start));
    return tokens;
}
\`\`\``,
            examples: [
                {
                    title: '字符串查找与替换',
                    code: `#include <iostream>
#include <string>

int main() {
    std::string text = "The quick brown fox jumps over the lazy dog.";
    
    std::cout << "原始文本: " << text << std::endl;
    
    // 查找所有"the"的位置
    std::cout << "\\n查找 'the' 的位置:" << std::endl;
    size_t pos = 0;
    while ((pos = text.find("the", pos)) != std::string::npos) {
        std::cout << "位置: " << pos << std::endl;
        pos++;
    }
    
    // 替换
    std::string newText = text;
    pos = 0;
    while ((pos = newText.find("the", pos)) != std::string::npos) {
        newText.replace(pos, 3, "a");
        pos += 1;
    }
    
    std::cout << "\\n替换 'the' 为 'a' 后: " << newText << std::endl;
    
    // 查找元音字母
    std::cout << "\\n元音字母位置:" << std::endl;
    pos = text.find_first_of("aeiouAEIOU");
    while (pos != std::string::npos) {
        std::cout << "位置 " << pos << ": " << text[pos] << std::endl;
        pos = text.find_first_of("aeiouAEIOU", pos + 1);
    }
    
    return 0;
}`,
                    description: '展示字符串查找和替换操作。'
                },
                {
                    title: '字符串处理工具',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>

// 分割字符串
std::vector<std::string> split(const std::string& s, char delimiter) {
    std::vector<std::string> tokens;
    size_t start = 0, end = 0;
    while ((end = s.find(delimiter, start)) != std::string::npos) {
        tokens.push_back(s.substr(start, end - start));
        start = end + 1;
    }
    tokens.push_back(s.substr(start));
    return tokens;
}

// 去除首尾空白
std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

// 转小写
std::string toLower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
}

int main() {
    std::string text = "  Hello,World,C++,Programming  ";
    
    std::cout << "原始文本: '" << text << "'" << std::endl;
    
    // 去除空白
    std::string trimmed = trim(text);
    std::cout << "\\n去除空白后: '" << trimmed << "'" << std::endl;
    
    // 分割
    std::cout << "\\n分割结果:" << std::endl;
    auto tokens = split(trimmed, ',');
    for (const auto& token : tokens) {
        std::cout << "  - " << token << std::endl;
    }
    
    // 转小写
    std::cout << "\\n转小写: " << toLower(trimmed) << std::endl;
    
    // 字符串转数字
    std::string numStr = "12345";
    int num = std::stoi(numStr);
    std::cout << "\\n字符串转数字: " << numStr << " -> " << num << std::endl;
    
    return 0;
}`,
                    description: '展示常用的字符串处理工具函数。'
                }
            ],
            handsOn: {
                title: '实现字符串处理函数',
                description: '实现常用的字符串处理函数：分割、连接、替换等。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>

// TODO: 实现字符串分割函数
// 将字符串按分隔符分割成多个子串
std::vector<std::string> split(const std::string& s, char delimiter) {
    // TODO: 实现分割逻辑
    return {};
}

// TODO: 实现字符串连接函数
// 将字符串数组用分隔符连接成一个字符串
std::string join(const std::vector<std::string>& parts, const std::string& delimiter) {
    // TODO: 实现连接逻辑
    return "";
}

// TODO: 实现字符串替换函数
// 替换字符串中所有出现的子串
std::string replaceAll(std::string s, const std::string& from, const std::string& to) {
    // TODO: 实现替换逻辑
    return s;
}

// TODO: 实现去除首尾空白函数
std::string trim(const std::string& s) {
    // TODO: 实现去除首尾空白
    return s;
}

int main() {
    // 测试split
    std::string text = "apple,banana,cherry,date";
    std::cout << "分割测试:" << std::endl;
    std::cout << "原始: " << text << std::endl;
    auto parts = split(text, ',');
    std::cout << "结果: ";
    for (const auto& part : parts) {
        std::cout << "[" << part << "] ";
    }
    std::cout << std::endl;
    
    // 测试join
    std::cout << "\\n连接测试:" << std::endl;
    std::string joined = join(parts, " | ");
    std::cout << "结果: " << joined << std::endl;
    
    // 测试replaceAll
    std::cout << "\\n替换测试:" << std::endl;
    std::string text2 = "hello world hello universe";
    std::cout << "原始: " << text2 << std::endl;
    std::string replaced = replaceAll(text2, "hello", "hi");
    std::cout << "替换后: " << replaced << std::endl;
    
    // 测试trim
    std::cout << "\\n去除空白测试:" << std::endl;
    std::string text3 = "  hello world  ";
    std::cout << "原始: '" << text3 << "'" << std::endl;
    std::cout << "去除后: '" << trim(text3) << "'" << std::endl;
    
    return 0;
}`,
                expectedOutput: `分割测试:
原始: apple,banana,cherry,date
结果: [apple] [banana] [cherry] [date] 

连接测试:
结果: apple | banana | cherry | date

替换测试:
原始: hello world hello universe
替换后: hi world hi universe

去除空白测试:
原始: '  hello world  '
去除后: 'hello world'`,
                solutionRegex: 'find|substr|npos|push_back|find_first_not_of|find_last_not_of',
                hint: '使用find查找分隔符，substr提取子串，循环处理所有匹配',
                xp: 200
            },
            references: [
                { title: 'string', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '字符串操作', book: 'Effective STL', chapter: '条款13' }
            ],
            assistantTips: [
                'string本质是字符容器，支持所有容器操作',
                'find找不到返回string::npos',
                '使用stoi/stod等函数进行字符串转换',
                'C++17起data()与c_str()等价'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'string::npos表示什么？', 
                    options: [
                        { text: '字符串的长度' }, 
                        { text: '查找失败时的返回值', correct: true }, 
                        { text: '字符串的末尾位置' }, 
                        { text: '空字符串' }
                    ], 
                    explanation: 'string::npos是size_t类型的最大值，表示查找失败。' 
                },
                { 
                    type: 'single', 
                    question: 'substr(2, 3)返回什么？', 
                    options: [
                        { text: '从位置2到末尾的子串' }, 
                        { text: '从位置2开始的3个字符', correct: true }, 
                        { text: '从位置2到位置3的子串' }, 
                        { text: '最后3个字符' }
                    ], 
                    explanation: 'substr(pos, len)返回从pos开始的len个字符。' 
                },
                { 
                    type: 'single', 
                    question: 'find_first_of的作用是？', 
                    options: [
                        { text: '查找第一个字符' }, 
                        { text: '查找第一个匹配字符集中任一字符的位置', correct: true }, 
                        { text: '查找第一个子串' }, 
                        { text: '查找第一个空白字符' }
                    ], 
                    explanation: 'find_first_of查找第一个匹配字符集中任一字符的位置。' 
                },
                { 
                    type: 'single', 
                    question: 'stoi("123abc", &pos)的结果是？', 
                    options: [
                        { text: '抛出异常' }, 
                        { text: '返回123，pos=3', correct: true }, 
                        { text: '返回0' }, 
                        { text: '返回123abc' }
                    ], 
                    explanation: 'stoi会解析数字部分，pos返回停止解析的位置。' 
                },
                { 
                    type: 'single', 
                    question: 'rfind的作用是？', 
                    options: [
                        { text: '反向查找子串', correct: true }, 
                        { text: '查找最后一个字符' }, 
                        { text: '查找并替换' }, 
                        { text: '递归查找' }
                    ], 
                    explanation: 'rfind从后向前查找子串最后一次出现的位置。' 
                }
            ]
        },
        {
            id: '15.6',
            title: 'array（C++11）与内置数组',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## array（C++11）与内置数组

### std::array的特点

std::array是固定大小的数组容器，大小在编译时确定。

\`\`\`cpp
#include <array>

std::array<int, 5> arr = {1, 2, 3, 4, 5};
\`\`\`

### std::array vs 内置数组

| 特性 | std::array | 内置数组 |
|------|-----------|----------|
| 大小固定 | 是 | 是 |
| 支持迭代器 | 是 | 否 |
| 支持容器操作 | 是 | 否 |
| 不会退化为指针 | 是 | 否 |
| 边界检查 | at()支持 | 否 |
| 可拷贝 | 是 | 否 |

### std::array的操作

#### 构造与初始化

\`\`\`cpp
// 默认构造（元素未初始化）
std::array<int, 5> arr1;

// 聚合初始化
std::array<int, 5> arr2 = {1, 2, 3, 4, 5};
std::array<int, 5> arr3 = {1};  // 其余为0

// 统一初始化
std::array<int, 5> arr4{1, 2, 3, 4, 5};

// 全部初始化为0
std::array<int, 5> arr5 = {};

// C++17：类型推导
std::array arr6 = {1, 2, 3, 4, 5};  // std::array<int, 5>
\`\`\`

#### 访问元素

\`\`\`cpp
std::array<int, 5> arr = {1, 2, 3, 4, 5};

// 下标访问
int val1 = arr[0];

// 安全访问（检查边界）
int val2 = arr.at(0);  // 越界抛出异常

// 首尾元素
int val3 = arr.front();
int val4 = arr.back();

// 数据指针
int* p = arr.data();
\`\`\`

#### 迭代器

\`\`\`cpp
std::array<int, 5> arr = {1, 2, 3, 4, 5};

// 正向迭代器
for (auto it = arr.begin(); it != arr.end(); ++it) {
    std::cout << *it << " ";
}

// 反向迭代器
for (auto it = arr.rbegin(); it != arr.rend(); ++it) {
    std::cout << *it << " ";
}

// 范围for
for (int val : arr) {
    std::cout << val << " ";
}
\`\`\`

#### 大小与容量

\`\`\`cpp
std::array<int, 5> arr = {1, 2, 3, 4, 5};

arr.size();      // 5
arr.max_size();  // 5
arr.empty();     // false
\`\`\`

#### 填充与交换

\`\`\`cpp
std::array<int, 5> arr;

// 填充相同值
arr.fill(10);  // {10, 10, 10, 10, 10}

// 交换
std::array<int, 5> arr1 = {1, 2, 3, 4, 5};
std::array<int, 5> arr2 = {6, 7, 8, 9, 10};
arr1.swap(arr2);
\`\`\`

### 内置数组

#### 声明与初始化

\`\`\`cpp
// 声明
int arr1[5];

// 初始化
int arr2[5] = {1, 2, 3, 4, 5};
int arr3[5] = {1};  // 其余为0
int arr4[] = {1, 2, 3};  // 大小自动推导

// C++11：统一初始化
int arr5[5]{1, 2, 3, 4, 5};
\`\`\`

#### 访问元素

\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};

// 下标访问
int val = arr[0];

// 指针访问
int* p = arr;
int val2 = p[0];
int val3 = *(p + 1);
\`\`\`

#### 数组退化为指针

\`\`\`cpp
void func(int arr[]) {
    // arr是指针，丢失大小信息
    sizeof(arr);  // 指针大小，不是数组大小
}

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    func(arr);  // 数组退化为指针
}
\`\`\`

### std::array的优势

#### 1. 不会退化

\`\`\`cpp
template<typename T, size_t N>
void printArray(const std::array<T, N>& arr) {
    for (const auto& val : arr) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
}

// 内置数组需要单独传递大小
template<typename T>
void printArray(const T arr[], size_t size) {
    for (size_t i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}
\`\`\`

#### 2. 支持拷贝

\`\`\`cpp
std::array<int, 5> arr1 = {1, 2, 3, 4, 5};
std::array<int, 5> arr2 = arr1;  // 可以拷贝

int arr3[5] = {1, 2, 3, 4, 5};
int arr4[5] = arr3;  // 错误！内置数组不能拷贝
\`\`\`

#### 3. 支持比较

\`\`\`cpp
std::array<int, 3> a1 = {1, 2, 3};
std::array<int, 3> a2 = {1, 2, 3};

if (a1 == a2) {  // 可以比较
    std::cout << "相等" << std::endl;
}
\`\`\`

#### 4. 支持容器算法

\`\`\`cpp
#include <algorithm>
#include <array>

std::array<int, 5> arr = {5, 3, 1, 4, 2};

// 排序
std::sort(arr.begin(), arr.end());

// 查找
auto it = std::find(arr.begin(), arr.end(), 3);

// 反转
std::reverse(arr.begin(), arr.end());
\`\`\`

### 使用建议

1. **优先使用std::array**：更安全、更现代
2. **需要C接口时**：使用data()获取指针
3. **多维数组**：可以使用std::array嵌套

\`\`\`cpp
// 二维数组
std::array<std::array<int, 3>, 4> matrix = {{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
    {10, 11, 12}
}};

// 访问元素
int val = matrix[0][1];  // 2
\`\`\``,
            examples: [
                {
                    title: 'std::array基本操作',
                    code: `#include <iostream>
#include <array>
#include <algorithm>

int main() {
    // 创建和初始化
    std::array<int, 5> arr1 = {1, 2, 3, 4, 5};
    std::array<int, 5> arr2;
    arr2.fill(10);  // 填充为10
    
    std::cout << "arr1: ";
    for (int val : arr1) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    std::cout << "arr2: ";
    for (int val : arr2) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 访问元素
    std::cout << "\\n访问元素:" << std::endl;
    std::cout << "arr1[0] = " << arr1[0] << std::endl;
    std::cout << "arr1.at(2) = " << arr1.at(2) << std::endl;
    std::cout << "arr1.front() = " << arr1.front() << std::endl;
    std::cout << "arr1.back() = " << arr1.back() << std::endl;
    
    // 大小
    std::cout << "\\n大小: " << arr1.size() << std::endl;
    
    // 排序
    std::array<int, 5> arr3 = {5, 3, 1, 4, 2};
    std::sort(arr3.begin(), arr3.end());
    std::cout << "\\n排序后: ";
    for (int val : arr3) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 比较
    std::array<int, 3> a1 = {1, 2, 3};
    std::array<int, 3> a2 = {1, 2, 3};
    std::cout << "\\na1 == a2: " << (a1 == a2) << std::endl;
    
    return 0;
}`,
                    description: '展示std::array的基本操作。'
                },
                {
                    title: 'std::array vs 内置数组',
                    code: `#include <iostream>
#include <array>

// 使用std::array
template<typename T, size_t N>
void printStdArray(const std::array<T, N>& arr) {
    std::cout << "大小: " << N << std::endl;
    for (const auto& val : arr) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
}

// 使用内置数组（需要传递大小）
template<typename T>
void printBuiltinArray(const T arr[], size_t size) {
    std::cout << "大小: " << size << std::endl;
    for (size_t i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    // std::array
    std::array<int, 5> stdArr = {1, 2, 3, 4, 5};
    std::cout << "std::array:" << std::endl;
    printStdArray(stdArr);
    
    // 内置数组
    int builtinArr[5] = {1, 2, 3, 4, 5};
    std::cout << "\\n内置数组:" << std::endl;
    printBuiltinArray(builtinArr, 5);
    
    // 拷贝测试
    std::cout << "\\n拷贝测试:" << std::endl;
    auto stdArrCopy = stdArr;  // std::array可以拷贝
    std::cout << "std::array拷贝成功" << std::endl;
    
    // int builtinArrCopy[5] = builtinArr;  // 错误！内置数组不能拷贝
    std::cout << "内置数组不能直接拷贝" << std::endl;
    
    // 获取C风格指针
    int* p = stdArr.data();
    std::cout << "\\n通过data()访问: " << p[0] << std::endl;
    
    return 0;
}`,
                    description: '比较std::array和内置数组的区别。'
                }
            ],
            handsOn: {
                title: '使用std::array实现矩阵',
                description: '使用std::array实现一个简单的2x2矩阵类。',
                initialCode: `#include <iostream>
#include <array>

template<typename T>
class Matrix2x2 {
private:
    std::array<std::array<T, 2>, 2> data;
    
public:
    // 默认构造
    Matrix2x2() {
        // TODO: 初始化为零矩阵
    }
    
    // 从数组构造
    Matrix2x2(const std::array<std::array<T, 2>, 2>& arr) : data(arr) {}
    
    // 访问元素
    T& at(size_t row, size_t col) {
        // TODO: 实现元素访问
        return data[0][0];
    }
    
    const T& at(size_t row, size_t col) const {
        // TODO: 实现常量元素访问
        return data[0][0];
    }
    
    // 矩阵加法
    Matrix2x2 operator+(const Matrix2x2& other) const {
        // TODO: 实现矩阵加法
        return Matrix2x2();
    }
    
    // 矩阵乘法
    Matrix2x2 operator*(const Matrix2x2& other) const {
        // TODO: 实现矩阵乘法
        return Matrix2x2();
    }
    
    // 转置
    Matrix2x2 transpose() const {
        // TODO: 实现矩阵转置
        return Matrix2x2();
    }
    
    // 打印矩阵
    void print() const {
        for (const auto& row : data) {
            for (const auto& val : row) {
                std::cout << val << "\\t";
            }
            std::cout << std::endl;
        }
    }
};

int main() {
    Matrix2x2<int> m1;
    m1.at(0, 0) = 1;
    m1.at(0, 1) = 2;
    m1.at(1, 0) = 3;
    m1.at(1, 1) = 4;
    
    std::cout << "矩阵 m1:" << std::endl;
    m1.print();
    
    Matrix2x2<int> m2;
    m2.at(0, 0) = 5;
    m2.at(0, 1) = 6;
    m2.at(1, 0) = 7;
    m2.at(1, 1) = 8;
    
    std::cout << "\\n矩阵 m2:" << std::endl;
    m2.print();
    
    std::cout << "\\nm1 + m2:" << std::endl;
    (m1 + m2).print();
    
    std::cout << "\\nm1 * m2:" << std::endl;
    (m1 * m2).print();
    
    std::cout << "\\nm1 转置:" << std::endl;
    m1.transpose().print();
    
    return 0;
}`,
                expectedOutput: `矩阵 m1:
1       2
3       4

矩阵 m2:
5       6
7       8

m1 + m2:
6       8
10      12

m1 * m2:
19      22
43      50

m1 转置:
1       3
2       4`,
                solutionRegex: 'data\\[row\\]\\[col\\]|data\\[i\\]\\[j\\]|data\\[j\\]\\[i\\]',
                hint: '矩阵加法对应元素相加，矩阵乘法需要三重循环，转置交换行列索引',
                xp: 180
            },
            references: [
                { title: 'array', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '内置数组', book: 'C++ Primer 第五版', chapter: '第3章' }
            ],
            assistantTips: [
                '优先使用std::array代替内置数组',
                'std::array支持拷贝和比较',
                '使用data()获取C风格指针',
                'std::array不会退化为指针'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::array的大小何时确定？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译时', correct: true }, 
                        { text: '可以动态改变' }, 
                        { text: '取决于元素类型' }
                    ], 
                    explanation: 'std::array的大小是模板参数，在编译时确定。' 
                },
                { 
                    type: 'single', 
                    question: 'std::array相比内置数组的优势是？', 
                    options: [
                        { text: '大小可以改变' }, 
                        { text: '支持拷贝和容器操作', correct: true }, 
                        { text: '性能更好' }, 
                        { text: '内存占用更小' }
                    ], 
                    explanation: 'std::array支持拷贝、比较、迭代器等容器操作。' 
                },
                { 
                    type: 'single', 
                    question: '内置数组作为函数参数时会怎样？', 
                    options: [
                        { text: '完整传递' }, 
                        { text: '退化为指针', correct: true }, 
                        { text: '抛出异常' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '内置数组作为参数时会退化为指针，丢失大小信息。' 
                },
                { 
                    type: 'single', 
                    question: 'std::array的at()方法的特点是？', 
                    options: [
                        { text: '比[]更快' }, 
                        { text: '会进行边界检查', correct: true }, 
                        { text: '不检查边界' }, 
                        { text: '只能读取' }
                    ], 
                    explanation: 'at()会检查边界，越界时抛出std::out_of_range异常。' 
                },
                { 
                    type: 'single', 
                    question: '如何获取std::array的C风格指针？', 
                    options: [
                        { text: '&arr' }, 
                        { text: 'arr.data()', correct: true }, 
                        { text: 'arr.pointer()' }, 
                        { text: '(int*)arr' }
                    ], 
                    explanation: '使用data()方法获取指向底层数组的指针。' 
                }
            ]
        },
        {
            id: '15.7',
            title: '容器适配器：stack、queue、priority_queue',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 容器适配器：stack、queue、priority_queue

### 什么是容器适配器？

容器适配器是对基础容器的封装，提供特定的数据结构接口。

\`\`\`cpp
#include <stack>
#include <queue>
\`\`\`

### stack（栈）

栈是后进先出（LIFO）的数据结构。

\`\`\`cpp
#include <stack>

std::stack<int> s;
s.push(1);
s.push(2);
s.push(3);

int top = s.top();  // 3
s.pop();            // 移除顶部元素
\`\`\`

#### stack的操作

\`\`\`cpp
std::stack<int> s;

// 入栈
s.push(10);
s.emplace(20);  // 原地构造

// 访问栈顶
int val = s.top();

// 出栈
s.pop();

// 大小
s.size();
s.empty();
\`\`\`

#### 底层容器

默认使用deque，可以指定其他容器：

\`\`\`cpp
// 使用vector作为底层容器
std::stack<int, std::vector<int>> s1;

// 使用list作为底层容器
std::stack<int, std::list<int>> s2;
\`\`\`

### queue（队列）

队列是先进先出（FIFO）的数据结构。

\`\`\`cpp
#include <queue>

std::queue<int> q;
q.push(1);
q.push(2);
q.push(3);

int front = q.front();  // 1
int back = q.back();    // 3
q.pop();                // 移除队首元素
\`\`\`

#### queue的操作

\`\`\`cpp
std::queue<int> q;

// 入队
q.push(10);
q.emplace(20);

// 访问队首和队尾
int f = q.front();
int b = q.back();

// 出队
q.pop();

// 大小
q.size();
q.empty();
\`\`\`

#### 底层容器

默认使用deque，可以指定list：

\`\`\`cpp
// 使用list作为底层容器
std::queue<int, std::list<int>> q;
\`\`\`

### priority_queue（优先队列）

优先队列是按优先级出队的数据结构，默认是大顶堆。

\`\`\`cpp
#include <queue>

std::priority_queue<int> pq;
pq.push(3);
pq.push(1);
pq.push(4);
pq.push(2);

// 出队顺序：4, 3, 2, 1（从大到小）
while (!pq.empty()) {
    std::cout << pq.top() << " ";
    pq.pop();
}
\`\`\`

#### priority_queue的操作

\`\`\`cpp
std::priority_queue<int> pq;

// 入队
pq.push(10);
pq.emplace(20);

// 访问队首（优先级最高）
int val = pq.top();

// 出队
pq.pop();

// 大小
pq.size();
pq.empty();
\`\`\`

#### 自定义比较器

\`\`\`cpp
#include <functional>

// 小顶堆
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

// 自定义比较器
struct Compare {
    bool operator()(const std::pair<int, int>& a, const std::pair<int, int>& b) {
        return a.second > b.second;  // 按second升序
    }
};

std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, Compare> pq;
\`\`\`

### 应用示例

#### 1. 括号匹配（stack）

\`\`\`cpp
bool isValidParentheses(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}
\`\`\`

#### 2. 任务调度（queue）

\`\`\`cpp
class TaskScheduler {
private:
    std::queue<std::string> tasks;
    
public:
    void addTask(const std::string& task) {
        tasks.push(task);
    }
    
    std::string getNextTask() {
        if (tasks.empty()) return "";
        std::string task = tasks.front();
        tasks.pop();
        return task;
    }
    
    bool hasTasks() const {
        return !tasks.empty();
    }
};
\`\`\`

#### 3. 合并K个有序链表（priority_queue）

\`\`\`cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

struct Compare {
    bool operator()(ListNode* a, ListNode* b) {
        return a->val > b->val;
    }
};

ListNode* mergeKLists(std::vector<ListNode*>& lists) {
    std::priority_queue<ListNode*, std::vector<ListNode*>, Compare> pq;
    
    for (ListNode* node : lists) {
        if (node) pq.push(node);
    }
    
    ListNode dummy(0);
    ListNode* tail = &dummy;
    
    while (!pq.empty()) {
        ListNode* node = pq.top();
        pq.pop();
        tail->next = node;
        tail = tail->next;
        if (node->next) pq.push(node->next);
    }
    
    return dummy.next;
}
\`\`\`

### 容器适配器的限制

1. **不能使用迭代器**：适配器不提供迭代器接口
2. **不能随机访问**：只能访问特定位置的元素
3. **底层容器受限**：需要容器支持特定操作

\`\`\`cpp
// stack需要底层容器支持：
// back(), push_back(), pop_back()

// queue需要底层容器支持：
// front(), back(), push_back(), pop_front()

// priority_queue需要底层容器支持：
// front(), push_back(), pop_back()，且需要随机访问迭代器
\`\`\``,
            examples: [
                {
                    title: 'stack应用：表达式求值',
                    code: `#include <iostream>
#include <stack>
#include <string>
#include <cctype>

int evaluateExpression(const std::string& expr) {
    std::stack<int> operands;
    std::stack<char> operators;
    
    for (size_t i = 0; i < expr.size(); ++i) {
        char c = expr[i];
        
        if (std::isspace(c)) continue;
        
        if (std::isdigit(c)) {
            int num = 0;
            while (i < expr.size() && std::isdigit(expr[i])) {
                num = num * 10 + (expr[i] - '0');
                ++i;
            }
            --i;
            operands.push(num);
        }
        else if (c == '(') {
            operators.push(c);
        }
        else if (c == ')') {
            while (!operators.empty() && operators.top() != '(') {
                int b = operands.top(); operands.pop();
                int a = operands.top(); operands.pop();
                char op = operators.top(); operators.pop();
                
                int result;
                switch (op) {
                    case '+': result = a + b; break;
                    case '-': result = a - b; break;
                    case '*': result = a * b; break;
                    case '/': result = a / b; break;
                }
                operands.push(result);
            }
            operators.pop();  // 移除'('
        }
        else {
            while (!operators.empty() && operators.top() != '(') {
                int b = operands.top(); operands.pop();
                int a = operands.top(); operands.pop();
                char op = operators.top(); operators.pop();
                
                int result;
                switch (op) {
                    case '+': result = a + b; break;
                    case '-': result = a - b; break;
                    case '*': result = a * b; break;
                    case '/': result = a / b; break;
                }
                operands.push(result);
            }
            operators.push(c);
        }
    }
    
    while (!operators.empty()) {
        int b = operands.top(); operands.pop();
        int a = operands.top(); operands.pop();
        char op = operators.top(); operators.pop();
        
        int result;
        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = a / b; break;
        }
        operands.push(result);
    }
    
    return operands.top();
}

int main() {
    std::string expr = "3 + 4 * 2 - 1";
    std::cout << "表达式: " << expr << std::endl;
    std::cout << "结果: " << evaluateExpression(expr) << std::endl;
    
    return 0;
}`,
                    description: '使用stack实现简单的表达式求值。'
                },
                {
                    title: 'priority_queue应用：Top K问题',
                    code: `#include <iostream>
#include <queue>
#include <vector>
#include <functional>

// 找出数组中最大的K个元素
std::vector<int> findTopK(const std::vector<int>& nums, int k) {
    // 使用小顶堆，保持堆的大小为k
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    
    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }
    
    std::vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top());
        minHeap.pop();
    }
    
    return result;
}

// 找出数组中最小的K个元素
std::vector<int> findBottomK(const std::vector<int>& nums, int k) {
    // 使用大顶堆，保持堆的大小为k
    std::priority_queue<int> maxHeap;
    
    for (int num : nums) {
        maxHeap.push(num);
        if (maxHeap.size() > k) {
            maxHeap.pop();
        }
    }
    
    std::vector<int> result;
    while (!maxHeap.empty()) {
        result.push_back(maxHeap.top());
        maxHeap.pop();
    }
    
    return result;
}

int main() {
    std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
    int k = 3;
    
    std::cout << "数组: ";
    for (int num : nums) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n最大的 " << k << " 个元素: ";
    auto topK = findTopK(nums, k);
    for (int num : topK) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    std::cout << "最小的 " << k << " 个元素: ";
    auto bottomK = findBottomK(nums, k);
    for (int num : bottomK) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '使用priority_queue解决Top K问题。'
                }
            ],
            handsOn: {
                title: '实现浏览器历史记录',
                description: '使用stack实现浏览器的前进后退功能。',
                initialCode: `#include <iostream>
#include <stack>
#include <string>

class BrowserHistory {
private:
    std::stack<std::string> backStack;
    std::stack<std::string> forwardStack;
    std::string currentPage;
    
public:
    // 访问新页面
    void visit(const std::string& url) {
        // TODO: 实现访问新页面
        // 1. 如果当前有页面，将其加入backStack
        // 2. 清空forwardStack
        // 3. 设置当前页面
    }
    
    // 后退
    std::string back() {
        // TODO: 实现后退
        // 1. 如果backStack为空，返回当前页面
        // 2. 将当前页面加入forwardStack
        // 3. 从backStack取出页面作为当前页面
        // 4. 返回当前页面
        return currentPage;
    }
    
    // 前进
    std::string forward() {
        // TODO: 实现前进
        // 1. 如果forwardStack为空，返回当前页面
        // 2. 将当前页面加入backStack
        // 3. 从forwardStack取出页面作为当前页面
        // 4. 返回当前页面
        return currentPage;
    }
    
    // 获取当前页面
    std::string getCurrentPage() const {
        return currentPage;
    }
    
    // 显示状态
    void showStatus() const {
        std::cout << "当前页面: " << currentPage << std::endl;
        std::cout << "可后退: " << backStack.size() << " 页" << std::endl;
        std::cout << "可前进: " << forwardStack.size() << " 页" << std::endl;
    }
};

int main() {
    BrowserHistory browser;
    
    browser.visit("google.com");
    browser.visit("github.com");
    browser.visit("stackoverflow.com");
    
    std::cout << "=== 初始状态 ===" << std::endl;
    browser.showStatus();
    
    std::cout << "\\n=== 后退一次 ===" << std::endl;
    browser.back();
    browser.showStatus();
    
    std::cout << "\\n=== 再后退一次 ===" << std::endl;
    browser.back();
    browser.showStatus();
    
    std::cout << "\\n=== 前进一次 ===" << std::endl;
    browser.forward();
    browser.showStatus();
    
    std::cout << "\\n=== 访问新页面 ===" << std::endl;
    browser.visit("cppreference.com");
    browser.showStatus();
    
    return 0;
}`,
                expectedOutput: `=== 初始状态 ===
当前页面: stackoverflow.com
可后退: 2 页
可前进: 0 页

=== 后退一次 ===
当前页面: github.com
可后退: 1 页
可前进: 1 页

=== 再后退一次 ===
当前页面: google.com
可后退: 0 页
可前进: 2 页

=== 前进一次 ===
当前页面: github.com
可后退: 1 页
可前进: 1 页

=== 访问新页面 ===
当前页面: cppreference.com
可后退: 2 页
可前进: 0 页`,
                solutionRegex: 'push|pop|top|empty|clear',
                hint: 'visit时清空forwardStack，back时操作backStack和forwardStack，forward相反',
                xp: 180
            },
            references: [
                { title: '容器适配器', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '优先队列', book: '算法导论', chapter: '第6章' }
            ],
            assistantTips: [
                'stack适合LIFO场景，如撤销操作',
                'queue适合FIFO场景，如任务队列',
                'priority_queue适合优先级调度',
                '容器适配器不提供迭代器'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'stack的特点是？', 
                    options: [
                        { text: '先进先出' }, 
                        { text: '后进先出', correct: true }, 
                        { text: '按优先级出队' }, 
                        { text: '随机访问' }
                    ], 
                    explanation: 'stack是后进先出（LIFO）的数据结构。' 
                },
                { 
                    type: 'single', 
                    question: 'priority_queue默认是什么堆？', 
                    options: [
                        { text: '小顶堆' }, 
                        { text: '大顶堆', correct: true }, 
                        { text: '二叉搜索树' }, 
                        { text: '平衡树' }
                    ], 
                    explanation: 'priority_queue默认是大顶堆，top()返回最大元素。' 
                },
                { 
                    type: 'single', 
                    question: 'queue的默认底层容器是？', 
                    options: [
                        { text: 'vector' }, 
                        { text: 'deque', correct: true }, 
                        { text: 'list' }, 
                        { text: 'array' }
                    ], 
                    explanation: 'stack和queue默认使用deque作为底层容器。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个操作stack没有？', 
                    options: [
                        { text: 'push()' }, 
                        { text: 'pop()' }, 
                        { text: 'front()', correct: true }, 
                        { text: 'top()' }
                    ], 
                    explanation: 'stack使用top()访问栈顶元素，没有front()操作。' 
                },
                { 
                    type: 'single', 
                    question: '如何创建小顶堆的priority_queue？', 
                    options: [
                        { text: 'priority_queue<int>' }, 
                        { text: 'priority_queue<int, vector<int>, greater<int>>', correct: true }, 
                        { text: 'priority_queue<int, less<int>>' }, 
                        { text: 'priority_queue<int, min_heap>' }
                    ], 
                    explanation: '使用std::greater<int>作为比较器创建小顶堆。' 
                }
            ]
        }
    ]
};

window.Unit15Data = Unit15Data;