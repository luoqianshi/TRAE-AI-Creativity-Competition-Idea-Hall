/**
 * 单元16：关联容器
 */
const Unit16Data = {
    id: 16,
    title: '关联容器',
    description: '深入理解C++关联容器，掌握pair、set、map、multiset、multimap及无序容器的使用',
    lessons: [
        {
            id: '16.1',
            title: 'pair 类型',
            duration: '25分钟',
            difficulty: '基础',
            xp: 90,
            estimatedXp: 280,
            concepts: `## pair 类型

### 什么是pair？

pair是C++标准库中的一个简单模板类，用于存储两个值的组合。

\`\`\`cpp
#include <utility>  // pair定义在此头文件中

std::pair<int, std::string> p1(1, "Hello");
std::pair<std::string, double> p2("PI", 3.14);
\`\`\`

### pair的定义

\`\`\`cpp
template<typename T1, typename T2>
struct pair {
    T1 first;
    T2 second;
    
    // 构造函数
    pair();
    pair(const T1& x, const T2& y);
    template<typename U1, typename U2>
    pair(const pair<U1, U2>& p);
};
\`\`\`

### 创建pair

#### 1. 直接构造

\`\`\`cpp
std::pair<int, std::string> p1(1, "Hello");
std::pair<double, char> p2(3.14, 'A');
\`\`\`

#### 2. 使用make_pair（C++11前）

\`\`\`cpp
auto p1 = std::make_pair(1, "Hello");  // 自动推导类型
auto p2 = std::make_pair(3.14, 'A');
\`\`\`

#### 3. 使用初始化列表（C++11）

\`\`\`cpp
std::pair<int, std::string> p1{1, "Hello"};
std::pair<int, std::string> p2 = {2, "World"};
\`\`\`

#### 4. 使用花括号初始化（C++17）

\`\`\`cpp
std::pair p1(1, "Hello");  // 自动推导类型
std::pair p2(3.14, 'A');
\`\`\`

### 访问pair的元素

\`\`\`cpp
std::pair<int, std::string> p(1, "Hello");

// 访问first和second
std::cout << p.first << std::endl;   // 1
std::cout << p.second << std::endl;  // Hello

// 修改元素
p.first = 10;
p.second = "World";
\`\`\`

### pair的操作

#### 1. 比较

\`\`\`cpp
std::pair<int, int> p1(1, 2);
std::pair<int, int> p2(1, 3);
std::pair<int, int> p3(2, 1);

// 按字典序比较：先比较first，再比较second
std::cout << (p1 < p2) << std::endl;  // true (1==1, 2<3)
std::cout << (p1 < p3) << std::endl;  // true (1<2)
std::cout << (p1 == p2) << std::endl; // false
\`\`\`

#### 2. 赋值

\`\`\`cpp
std::pair<int, std::string> p1(1, "Hello");
std::pair<int, std::string> p2;

p2 = p1;  // 拷贝赋值
p2 = {2, "World"};  // C++11：列表赋值
\`\`\`

#### 3. 交换

\`\`\`cpp
std::pair<int, int> p1(1, 2);
std::pair<int, int> p2(3, 4);

p1.swap(p2);  // 交换内容
// 或
std::swap(p1, p2);
\`\`\`

### pair的应用场景

#### 1. 作为map的元素

\`\`\`cpp
std::map<int, std::string> m;
m.insert(std::pair<int, std::string>(1, "One"));
m.insert(std::make_pair(2, "Two"));
m.insert({3, "Three"});  // C++11
\`\`\`

#### 2. 函数返回多个值

\`\`\`cpp
std::pair<bool, int> findElement(const std::vector<int>& vec, int value) {
    for (size_t i = 0; i < vec.size(); ++i) {
        if (vec[i] == value) {
            return {true, i};  // 找到，返回索引
        }
    }
    return {false, -1};  // 未找到
}

// 使用
auto result = findElement(vec, 5);
if (result.first) {
    std::cout << "找到，索引：" << result.second << std::endl;
}
\`\`\`

#### 3. 存储坐标

\`\`\`cpp
using Point = std::pair<int, int>;

Point p1(10, 20);
Point p2(30, 40);

// 计算曼哈顿距离
int distance = std::abs(p1.first - p2.first) + std::abs(p1.second - p2.second);
\`\`\`

### 结构化绑定（C++17）

C++17引入了结构化绑定，可以方便地解构pair：

\`\`\`cpp
std::pair<int, std::string> p(1, "Hello");

// 结构化绑定
auto [id, name] = p;
std::cout << id << ": " << name << std::endl;  // 1: Hello

// 引用绑定
auto& [idRef, nameRef] = p;
idRef = 10;  // 修改p.first
\`\`\`

### pair与tuple

pair可以看作是tuple的特例：

\`\`\`cpp
#include <tuple>

std::pair<int, std::string> p(1, "Hello");

// 使用tuple操作
auto t = std::make_tuple(1, "Hello");
std::cout << std::get<0>(p) << std::endl;  // 1（C++11起）
std::cout << std::get<1>(p) << std::endl;  // Hello
\`\`\`

### 常用技巧

#### 1. 使用typedef或using简化类型

\`\`\`cpp
using IntStringPair = std::pair<int, std::string>;
using Point = std::pair<int, int>;

IntStringPair p1(1, "Hello");
Point p2(10, 20);
\`\`\`

#### 2. pair数组

\`\`\`cpp
std::pair<int, int> points[] = {{0, 0}, {1, 1}, {2, 2}};
for (const auto& p : points) {
    std::cout << "(" << p.first << ", " << p.second << ")" << std::endl;
}
\`\`\`

#### 3. pair的vector

\`\`\`cpp
std::vector<std::pair<int, std::string>> vec;
vec.push_back({1, "One"});
vec.push_back({2, "Two"});
vec.emplace_back(3, "Three");  // 更高效
\`\`\`

### 最佳实践

#### 1. 使用结构化绑定提高可读性

\`\`\`cpp
// 推荐：使用结构化绑定
std::pair<int, std::string> p(1, "Hello");
auto [id, name] = p;

// 不推荐：使用 first 和 second
std::cout << p.first << ": " << p.second << std::endl;
\`\`\`

#### 2. 使用 using 简化类型声明

\`\`\`cpp
// 推荐：使用类型别名
using Point = std::pair<int, int>;
using Student = std::pair<std::string, int>;

Point p1(10, 20);
Student s1("Alice", 95);

// 不推荐：重复写完整类型
std::pair<int, int> p2(10, 20);
std::pair<std::string, int> s2("Bob", 87);
\`\`\`

#### 3. 使用 emplace 避免临时对象

\`\`\`cpp
std::vector<std::pair<std::string, int>> vec;

// 推荐：使用 emplace_back
vec.emplace_back("Alice", 95);

// 不推荐：创建临时对象
vec.push_back(std::make_pair("Bob", 87));
\`\`\`

#### 4. 函数返回多个值时使用 pair

\`\`\`cpp
// 推荐：使用 pair 返回多个值
std::pair<bool, int> findElement(const std::vector<int>& vec, int value) {
    for (size_t i = 0; i < vec.size(); ++i) {
        if (vec[i] == value) {
            return {true, static_cast<int>(i)};
        }
    }
    return {false, -1};
}

// 使用结构化绑定接收
auto [found, index] = findElement(vec, 5);
\`\`\`

### 常见错误

#### 1. 混淆 first 和 second

\`\`\`cpp
std::pair<std::string, int> person("Alice", 25);

// 错误：容易混淆哪个是名字，哪个是年龄
std::cout << person.first << " is " << person.second << " years old" << std::endl;

// 正确：使用有意义的变量名
auto [name, age] = person;
std::cout << name << " is " << age << " years old" << std::endl;
\`\`\`

#### 2. 忘记 pair 定义在 utility 头文件中

\`\`\`cpp
// 错误：忘记包含头文件
// #include <utility>  // 必须包含
std::pair<int, int> p(1, 2);  // 编译错误

// 正确：包含必要的头文件
#include <utility>
std::pair<int, int> p(1, 2);
\`\`\`

#### 3. 使用过时的 make_pair

\`\`\`cpp
// C++11 前：必须使用 make_pair
auto p1 = std::make_pair(1, "Hello");

// C++11 后：可以直接使用初始化列表
std::pair<int, std::string> p2{1, "Hello"};

// C++17 后：可以使用类模板参数推导
std::pair p3(1, "Hello");
\`\`\`

#### 4. 修改 pair 的键（在 map 中）

\`\`\`cpp
std::map<std::string, int> scores;
scores["Alice"] = 95;

// 错误：map 中的 pair 的 first（键）是 const 的
auto it = scores.begin();
// it->first = "Bob";  // 编译错误！

// 正确：只能修改值
it->second = 100;
\`\`\`

### 深入理解

#### 1. pair 的内存布局

\`\`\`cpp
std::pair<int, double> p(42, 3.14);

// pair 在内存中的布局
// +--------+--------+
// | first  | second |
// | int    | double |
// | 4字节  | 8字节  |
// +--------+--------+

// 可能存在填充字节
std::cout << sizeof(p) << std::endl;  // 可能是16字节（4 + 4填充 + 8）
\`\`\`

#### 2. pair 的比较机制

\`\`\`cpp
std::pair<int, int> p1(1, 100);
std::pair<int, int> p2(2, 1);

// 比较规则：字典序
// 1. 先比较 first
// 2. 如果 first 相等，再比较 second

if (p1 < p2) {
    // p1.first (1) < p2.first (2)，所以 p1 < p2
    // 即使 p1.second (100) > p2.second (1)
}

// 这使得 pair 可以作为 set 和 map 的元素
std::set<std::pair<int, int>> s;
s.insert({1, 2});
s.insert({1, 3});  // 可以插入，因为 second 不同
\`\`\`

#### 3. pair 与 tuple 的关系

\`\`\`cpp
#include <tuple>

// pair 是 tuple 的特例
std::pair<int, std::string> p(1, "Hello");

// 可以使用 tuple 的操作
std::cout << std::get<0>(p) << std::endl;  // 1
std::cout << std::get<1>(p) << std::endl;  // Hello

// tuple_size 和 tuple_element
std::cout << std::tuple_size<decltype(p)>::value << std::endl;  // 2
std::tuple_element<0, decltype(p)>::type first;  // int
std::tuple_element<1, decltype(p)>::type second;  // std::string
\`\`\`

#### 4. pair 的性能考虑

\`\`\`cpp
// pair 的拷贝和移动
std::pair<std::string, std::vector<int>> p1{"data", {1, 2, 3}};

// 拷贝：深拷贝所有成员
auto p2 = p1;  // 拷贝字符串和 vector

// 移动：转移资源所有权
auto p3 = std::move(p1);  // 移动字符串和 vector，p1 变为空

// 使用移动语义提高性能
std::vector<std::pair<std::string, std::vector<int>>> vec;
vec.push_back(std::move(p3));  // 移动整个 pair
\`\`\`

#### 5. pair 在标准库中的应用

\`\`\`cpp
// 1. map 和 multimap 的元素类型
std::map<int, std::string> m;
m.insert(std::make_pair(1, "One"));  // 插入 pair

// 2. insert 返回值
auto result = m.insert({2, "Two"});
// result.first 是迭代器，result.second 是 bool

// 3. minmax 函数返回值
auto [min_val, max_val] = std::minmax({3, 1, 4, 1, 5, 9});

// 4. equal_range 返回值
std::set<int> s = {1, 2, 3, 4, 5};
auto range = s.equal_range(3);  // 返回 pair<iterator, iterator>
\`\`\``,
            examples: [
                {
                    title: 'pair基本操作',
                    code: `#include <iostream>
#include <utility>
#include <string>

int main() {
    // 创建pair的多种方式
    std::pair<int, std::string> p1(1, "Hello");
    auto p2 = std::make_pair(2, "World");
    std::pair<int, std::string> p3 = {3, "C++"};
    
    // 访问元素
    std::cout << "p1: (" << p1.first << ", " << p1.second << ")" << std::endl;
    std::cout << "p2: (" << p2.first << ", " << p2.second << ")" << std::endl;
    std::cout << "p3: (" << p3.first << ", " << p3.second << ")" << std::endl;
    
    // 比较
    std::pair<int, int> a(1, 2);
    std::pair<int, int> b(1, 3);
    std::pair<int, int> c(2, 1);
    
    std::cout << "\\n比较结果:" << std::endl;
    std::cout << "(1,2) < (1,3): " << (a < b) << std::endl;  // true
    std::cout << "(1,2) < (2,1): " << (a < c) << std::endl;  // true
    std::cout << "(1,2) == (1,3): " << (a == b) << std::endl;  // false
    
    // 交换
    std::cout << "\\n交换前: p1 = (" << p1.first << ", " << p1.second << ")" << std::endl;
    std::cout << "交换前: p2 = (" << p2.first << ", " << p2.second << ")" << std::endl;
    
    p1.swap(p2);
    
    std::cout << "交换后: p1 = (" << p1.first << ", " << p1.second << ")" << std::endl;
    std::cout << "交换后: p2 = (" << p2.first << ", " << p2.second << ")" << std::endl;
    
    return 0;
}`,
                    description: '展示pair的创建、访问、比较和交换操作。'
                },
                {
                    title: 'pair作为函数返回值',
                    code: `#include <iostream>
#include <utility>
#include <vector>
#include <string>

// 查找元素，返回是否找到和索引
std::pair<bool, int> findElement(const std::vector<int>& vec, int value) {
    for (size_t i = 0; i < vec.size(); ++i) {
        if (vec[i] == value) {
            return {true, static_cast<int>(i)};
        }
    }
    return {false, -1};
}

// 找到最小值和最大值
std::pair<int, int> findMinMax(const std::vector<int>& vec) {
    if (vec.empty()) return {0, 0};
    
    int minVal = vec[0];
    int maxVal = vec[0];
    
    for (int val : vec) {
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
    }
    
    return {minVal, maxVal};
}

int main() {
    std::vector<int> numbers = {5, 3, 8, 1, 9, 2, 7};
    
    // 查找元素
    std::cout << "查找元素 8:" << std::endl;
    auto result1 = findElement(numbers, 8);
    if (result1.first) {
        std::cout << "找到，索引: " << result1.second << std::endl;
    } else {
        std::cout << "未找到" << std::endl;
    }
    
    std::cout << "\\n查找元素 10:" << std::endl;
    auto result2 = findElement(numbers, 10);
    if (result2.first) {
        std::cout << "找到，索引: " << result2.second << std::endl;
    } else {
        std::cout << "未找到" << std::endl;
    }
    
    // 找最小最大值
    auto [minVal, maxVal] = findMinMax(numbers);  // C++17结构化绑定
    std::cout << "\\n最小值: " << minVal << std::endl;
    std::cout << "最大值: " << maxVal << std::endl;
    
    return 0;
}`,
                    description: '展示pair作为函数返回值返回多个值的用法。'
                }
            ],
            handsOn: {
                title: '使用pair实现坐标系统',
                description: '使用pair表示二维坐标点，实现距离计算等功能。',
                initialCode: `#include <iostream>
#include <utility>
#include <vector>
#include <cmath>

using Point = std::pair<int, int>;

// TODO: 计算两点之间的欧几里得距离
double distance(const Point& p1, const Point& p2) {
    // TODO: 实现距离计算
    return 0.0;
}

// TODO: 计算两点之间的曼哈顿距离
int manhattanDistance(const Point& p1, const Point& p2) {
    // TODO: 实现曼哈顿距离
    return 0;
}

// TODO: 判断点是否在矩形内
// rect是矩形的左上角和右下角两个点
bool isInsideRect(const Point& p, const std::pair<Point, Point>& rect) {
    // TODO: 实现判断逻辑
    return false;
}

// TODO: 找到距离给定点最近的点
Point findNearestPoint(const Point& target, const std::vector<Point>& points) {
    // TODO: 实现查找逻辑
    // 如果points为空，返回target
    return target;
}

int main() {
    Point p1(0, 0);
    Point p2(3, 4);
    
    std::cout << "点p1: (" << p1.first << ", " << p1.second << ")" << std::endl;
    std::cout << "点p2: (" << p2.first << ", " << p2.second << ")" << std::endl;
    
    std::cout << "\\n欧几里得距离: " << distance(p1, p2) << std::endl;
    std::cout << "曼哈顿距离: " << manhattanDistance(p1, p2) << std::endl;
    
    std::pair<Point, Point> rect = {{0, 0}, {10, 10}};
    Point p3(5, 5);
    Point p4(15, 15);
    
    std::cout << "\\n点(5,5)在矩形内: " << isInsideRect(p3, rect) << std::endl;
    std::cout << "点(15,15)在矩形内: " << isInsideRect(p4, rect) << std::endl;
    
    std::vector<Point> points = {{1, 1}, {5, 5}, {10, 10}, {2, 3}};
    Point target(4, 4);
    Point nearest = findNearestPoint(target, points);
    std::cout << "\\n距离(4,4)最近的点: (" << nearest.first << ", " << nearest.second << ")" << std::endl;
    
    return 0;
}`,
                expectedOutput: `点p1: (0, 0)
点p2: (3, 4)

欧几里得距离: 5
曼哈顿距离: 7

点(5,5)在矩形内: 1
点(15,15)在矩形内: 0

距离(4,4)最近的点: (5, 5)`,
                solutionRegex: 'sqrt|pow|abs|first|second',
                hint: '欧几里得距离用sqrt(pow(x1-x2,2)+pow(y1-y2,2))，曼哈顿距离用abs(x1-x2)+abs(y1-y2)',
                xp: 150
            },
            references: [
                { title: 'pair类型', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: 'utility头文件', book: 'C++标准库', chapter: '第5章' }
            ],
            assistantTips: [
                'pair是map和multimap的基础元素类型',
                '使用make_pair可以自动推导类型',
                'C++17的结构化绑定让pair更易用',
                'pair的比较按字典序进行'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'pair定义在哪个头文件中？', 
                    options: [
                        { text: '<pair>' }, 
                        { text: '<utility>', correct: true }, 
                        { text: '<tuple>' }, 
                        { text: '<algorithm>' }
                    ], 
                    explanation: 'pair定义在<utility>头文件中。' 
                },
                { 
                    type: 'single', 
                    question: '如何访问pair的第一个元素？', 
                    options: [
                        { text: 'p[0]' }, 
                        { text: 'p.first', correct: true }, 
                        { text: 'p.get(0)' }, 
                        { text: 'p.begin()' }
                    ], 
                    explanation: 'pair使用first和second成员访问元素。' 
                },
                { 
                    type: 'single', 
                    question: 'pair的比较规则是？', 
                    options: [
                        { text: '只比较first' }, 
                        { text: '只比较second' }, 
                        { text: '先比较first，再比较second', correct: true }, 
                        { text: '比较first和second的和' }
                    ], 
                    explanation: 'pair按字典序比较，先比较first，如果相等再比较second。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17的结构化绑定如何解构pair？', 
                    options: [
                        { text: 'auto p = pair' }, 
                        { text: 'auto [a, b] = pair', correct: true }, 
                        { text: 'auto {a, b} = pair' }, 
                        { text: 'auto (a, b) = pair' }
                    ], 
                    explanation: 'C++17使用auto [a, b] = pair的形式进行结构化绑定。' 
                },
                { 
                    type: 'single', 
                    question: 'make_pair的作用是？', 
                    options: [
                        { text: '创建pair并自动推导类型', correct: true }, 
                        { text: '创建pair但不推导类型' }, 
                        { text: '修改pair的值' }, 
                        { text: '比较两个pair' }
                    ], 
                    explanation: 'make_pair可以根据参数自动推导pair的类型。' 
                }
            ]
        },
        {
            id: '16.2',
            title: 'set 与 multiset',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## set 与 multiset

### set的特点

set是关联容器，存储唯一的元素，并自动排序。

\`\`\`cpp
#include <set>

std::set<int> s;
s.insert(3);
s.insert(1);
s.insert(2);
// 元素自动排序：1, 2, 3
\`\`\`

### set vs multiset

| 特性 | set | multiset |
|------|-----|----------|
| 元素唯一性 | 唯一 | 允许重复 |
| 插入重复元素 | 忽略 | 允许 |
| 底层结构 | 红黑树 | 红黑树 |
| 时间复杂度 | O(log n) | O(log n) |

### set的操作

#### 1. 构造与初始化

\`\`\`cpp
#include <set>

// 默认构造
std::set<int> s1;

// 初始化列表
std::set<int> s2 = {1, 2, 3, 4, 5};

// 迭代器范围
std::vector<int> vec = {3, 1, 4, 1, 5};
std::set<int> s3(vec.begin(), vec.end());  // 1, 3, 4, 5

// 拷贝构造
std::set<int> s4(s2);

// 自定义比较器
std::set<int, std::greater<int>> s5 = {1, 2, 3};  // 降序
\`\`\`

#### 2. 插入元素

\`\`\`cpp
std::set<int> s;

// insert返回pair<iterator, bool>
auto result = s.insert(5);
if (result.second) {
    std::cout << "插入成功" << std::endl;
    std::cout << "元素位置：" << *result.first << std::endl;
}

// 插入多个元素
s.insert({1, 2, 3, 4});

// 插入迭代器范围
std::vector<int> vec = {6, 7, 8};
s.insert(vec.begin(), vec.end());

// 带提示的插入
auto it = s.begin();
s.insert(it, 0);  // 提示插入位置，可能提高效率

// emplace（原地构造）
s.emplace(10);
\`\`\`

#### 3. 删除元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 按值删除
s.erase(3);  // 删除值为3的元素

// 按迭代器删除
auto it = s.find(2);
if (it != s.end()) {
    s.erase(it);
}

// 删除范围
s.erase(s.begin(), s.end());  // 清空

// 清空所有元素
s.clear();
\`\`\`

#### 4. 查找元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// find返回迭代器
auto it = s.find(3);
if (it != s.end()) {
    std::cout << "找到：" << *it << std::endl;
}

// count返回元素个数（set中为0或1）
if (s.count(3) > 0) {
    std::cout << "元素存在" << std::endl;
}

// lower_bound：第一个不小于值的元素
auto lower = s.lower_bound(3);  // 指向3

// upper_bound：第一个大于值的元素
auto upper = s.upper_bound(3);  // 指向4

// equal_range：返回lower_bound和upper_bound
auto range = s.equal_range(3);
// range.first == lower_bound(3)
// range.second == upper_bound(3)
\`\`\`

#### 5. 访问元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 迭代器访问
for (auto it = s.begin(); it != s.end(); ++it) {
    std::cout << *it << " ";
}

// 范围for
for (int val : s) {
    std::cout << val << " ";
}

// 反向迭代
for (auto it = s.rbegin(); it != s.rend(); ++it) {
    std::cout << *it << " ";
}

// 注意：set没有下标访问！
// s[0];  // 错误！
\`\`\`

#### 6. 大小与容量

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

s.size();      // 元素数量
s.empty();     // 是否为空
s.max_size();  // 最大可能大小
\`\`\`

### multiset的操作

multiset与set类似，但允许重复元素：

\`\`\`cpp
#include <set>

std::multiset<int> ms;

// 插入重复元素
ms.insert(1);
ms.insert(1);
ms.insert(2);
ms.insert(2);
ms.insert(2);

// count返回实际个数
std::cout << ms.count(1) << std::endl;  // 2
std::cout << ms.count(2) << std::endl;  // 3

// erase删除所有匹配元素
ms.erase(1);  // 删除所有1

// 删除一个匹配元素
auto it = ms.find(2);
if (it != ms.end()) {
    ms.erase(it);  // 只删除一个2
}

// equal_range获取所有匹配元素
auto range = ms.equal_range(2);
for (auto it = range.first; it != range.second; ++it) {
    std::cout << *it << " ";
}
\`\`\`

### set的应用场景

#### 1. 去重

\`\`\`cpp
std::vector<int> vec = {1, 2, 2, 3, 3, 3, 4, 4, 5};

// 使用set去重
std::set<int> uniqueSet(vec.begin(), vec.end());
std::vector<int> uniqueVec(uniqueSet.begin(), uniqueSet.end());

// 或使用unordered_set（更快，但无序）
#include <unordered_set>
std::unordered_set<int> us(vec.begin(), vec.end());
\`\`\`

#### 2. 维护有序集合

\`\`\`cpp
class SortedCollection {
private:
    std::set<int> data;
    
public:
    void add(int value) {
        data.insert(value);
    }
    
    void remove(int value) {
        data.erase(value);
    }
    
    bool contains(int value) const {
        return data.count(value) > 0;
    }
    
    void print() const {
        for (int val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
};
\`\`\`

#### 3. 区间查询

\`\`\`cpp
// 查找在[low, high]范围内的元素
std::set<int> s = {1, 3, 5, 7, 9, 11, 13};

int low = 5, high = 11;

// 方法1：使用lower_bound和upper_bound
auto start = s.lower_bound(low);
auto end = s.upper_bound(high);

std::cout << "区间[" << low << ", " << high << "]内的元素：";
for (auto it = start; it != end; ++it) {
    std::cout << *it << " ";
}
std::cout << std::endl;
\`\`\`

### 性能特点

| 操作 | 时间复杂度 |
|------|-----------|
| 插入 | O(log n) |
| 删除 | O(log n) |
| 查找 | O(log n) |
| 遍历 | O(n) |

### set的限制

1. **不能修改元素值**：元素是const的
2. **没有下标访问**：只能通过迭代器访问
3. **自定义类型需要定义比较函数**

\`\`\`cpp
// 错误：不能修改元素
std::set<int> s = {1, 2, 3};
auto it = s.begin();
// *it = 10;  // 错误！元素是const的

// 正确：删除后重新插入
s.erase(it);
s.insert(10);
\`\`\`

### 最佳实践

#### 1. 根据需求选择 set 或 unordered_set

\`\`\`cpp
// 需要有序遍历或范围查询：使用 set
std::set<int> orderedSet = {5, 2, 8, 1, 9};
for (int val : orderedSet) {
    std::cout << val << " ";  // 1 2 5 8 9（有序）
}

// 只需要快速查找：使用 unordered_set
std::unordered_set<int> unorderedSet = {5, 2, 8, 1, 9};
unorderedSet.find(5);  // 平均 O(1)
\`\`\`

#### 2. 使用 emplace 提高插入效率

\`\`\`cpp
std::set<std::pair<int, std::string>> s;

// 推荐：使用 emplace 原地构造
s.emplace(1, "One");

// 不推荐：创建临时对象
s.insert(std::make_pair(2, "Two"));
\`\`\`

#### 3. 预分配 unordered_set 的空间

\`\`\`cpp
// 如果知道大概的元素数量
std::unordered_set<int> us;
us.reserve(10000);  // 预分配空间，避免多次重哈希

for (int i = 0; i < 10000; ++i) {
    us.insert(i);
}
\`\`\`

#### 4. 使用 lower_bound/upper_bound 做范围查询

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9, 11, 13};

// 查找 [5, 11] 范围内的元素
auto start = s.lower_bound(5);   // 第一个 >= 5
auto end = s.upper_bound(11);    // 第一个 > 11

for (auto it = start; it != end; ++it) {
    std::cout << *it << " ";  // 5 7 9 11
}
\`\`\`

#### 5. 检查插入是否成功

\`\`\`cpp
std::set<int> s;

auto result = s.insert(5);
if (result.second) {
    std::cout << "插入成功" << std::endl;
} else {
    std::cout << "元素已存在" << std::endl;
}
\`\`\`

### 常见错误

#### 1. 尝试修改 set 中的元素

\`\`\`cpp
std::set<int> s = {1, 2, 3};

// 错误：set 的元素是 const 的
auto it = s.find(2);
// *it = 10;  // 编译错误！

// 正确：删除后重新插入
s.erase(it);
s.insert(10);
\`\`\`

#### 2. 在遍历时删除元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 错误：遍历时删除会导致迭代器失效
for (auto it = s.begin(); it != s.end(); ++it) {
    if (*it % 2 == 0) {
        s.erase(it);  // 错误！it 失效
    }
}

// 正确：使用 erase 的返回值
for (auto it = s.begin(); it != s.end(); ) {
    if (*it % 2 == 0) {
        it = s.erase(it);  // erase 返回下一个有效迭代器
    } else {
        ++it;
    }
}
\`\`\`

#### 3. 混淆 lower_bound 和 upper_bound

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

// lower_bound：第一个 >= 给定值
auto lower = s.lower_bound(5);  // 指向 5

// upper_bound：第一个 > 给定值
auto upper = s.upper_bound(5);  // 指向 7

// 常见错误：混淆两者
// 如果要查找 [5, 10] 范围，应该用：
auto start = s.lower_bound(5);   // >= 5
auto end = s.upper_bound(10);    // > 10
\`\`\`

#### 4. multiset 的 erase 删除所有匹配元素

\`\`\`cpp
std::multiset<int> ms = {1, 2, 2, 2, 3};

// 错误：erase 删除所有匹配元素
ms.erase(2);  // 删除所有 2，剩下 {1, 3}

// 正确：只删除一个元素
auto it = ms.find(2);
if (it != ms.end()) {
    ms.erase(it);  // 只删除一个 2
}
\`\`\`

#### 5. 忘记检查 find 的返回值

\`\`\`cpp
std::set<int> s = {1, 2, 3};

// 错误：不检查返回值
auto it = s.find(5);
// std::cout << *it << std::endl;  // 未定义行为！

// 正确：检查返回值
auto it = s.find(5);
if (it != s.end()) {
    std::cout << *it << std::endl;
} else {
    std::cout << "未找到" << std::endl;
}
\`\`\`

### 深入理解

#### 1. 红黑树的平衡机制

\`\`\`cpp
// set 和 multiset 通常使用红黑树实现
// 红黑树特性：
// 1. 每个节点是红色或黑色
// 2. 根节点是黑色
// 3. 红色节点的子节点必须是黑色
// 4. 从任一节点到其叶子的所有路径包含相同数量的黑色节点

// 这保证了树的高度最多为 2*log2(n+1)
// 因此查找、插入、删除的时间复杂度为 O(log n)

// 插入示例：
std::set<int> s;
s.insert(5);  // 树可能需要重新平衡
s.insert(3);  // 可能触发旋转操作
s.insert(7);  // 维持红黑树性质
\`\`\`

#### 2. 迭代器的稳定性

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// set 的迭代器在插入和删除时保持稳定（除了被删除的元素）
auto it = s.find(3);

s.insert(10);  // it 仍然有效
s.erase(5);    // it 仍然有效
s.erase(3);    // it 失效！

// 这与 unordered_set 不同
std::unordered_set<int> us = {1, 2, 3};
auto it2 = us.find(2);
us.insert(100);  // 可能触发重哈希，it2 可能失效！
\`\`\`

#### 3. 性能对比：set vs unordered_set

\`\`\`cpp
#include <chrono>

// 插入性能
std::set<int> s;
std::unordered_set<int> us;

auto start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 100000; ++i) {
    s.insert(i);
}
auto end = std::chrono::high_resolution_clock::now();
// set 插入：O(n log n)

start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 100000; ++i) {
    us.insert(i);
}
end = std::chrono::high_resolution_clock::now();
// unordered_set 插入：平均 O(n)，但可能有重哈希开销

// 查找性能
s.find(50000);     // O(log n)
us.find(50000);    // 平均 O(1)
\`\`\`

#### 4. 自定义类型的 set

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    
    // 必须定义比较函数
    bool operator<(const Person& other) const {
        if (name != other.name) return name < other.name;
        return age < other.age;
    }
};

std::set<Person> people;
people.insert({"Alice", 25});
people.insert({"Bob", 30});

// 查找
Person target{"Alice", 25};
auto it = people.find(target);
\`\`\`

#### 5. 内存布局

\`\`\`cpp
// set 的内存布局（红黑树节点）
struct Node {
    bool color;           // 1 字节
    // 3 字节填充
    Node* left;           // 8 字节
    Node* right;          // 8 字节
    Node* parent;         // 8 字节
    int value;            // 4 字节
    // 4 字节填充
};

// 每个节点大约占用 36 字节（64位系统）
// 对于 1000 个元素的 set，大约需要 36KB 内存

// unordered_set 的内存布局
// 哈希表 + 链表节点
// 通常比 set 占用更多内存
\`\`\``,
            examples: [
                {
                    title: 'set基本操作',
                    code: `#include <iostream>
#include <set>

int main() {
    std::set<int> s;
    
    // 插入元素
    s.insert(5);
    s.insert(2);
    s.insert(8);
    s.insert(1);
    s.insert(3);
    
    std::cout << "插入后（自动排序）: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 插入重复元素
    auto result = s.insert(5);
    std::cout << "\\n插入重复元素5: " << (result.second ? "成功" : "失败") << std::endl;
    
    // 查找元素
    std::cout << "\\n查找元素:" << std::endl;
    std::cout << "count(3) = " << s.count(3) << std::endl;
    std::cout << "count(10) = " << s.count(10) << std::endl;
    
    auto it = s.find(3);
    if (it != s.end()) {
        std::cout << "find(3) 找到: " << *it << std::endl;
    }
    
    // lower_bound和upper_bound
    std::cout << "\\nlower_bound和upper_bound:" << std::endl;
    auto lower = s.lower_bound(3);  // 第一个>=3的元素
    auto upper = s.upper_bound(3);  // 第一个>3的元素
    std::cout << "lower_bound(3) = " << *lower << std::endl;
    std::cout << "upper_bound(3) = " << *upper << std::endl;
    
    // 删除元素
    s.erase(5);
    std::cout << "\\n删除5后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 大小
    std::cout << "\\n大小: " << s.size() << std::endl;
    std::cout << "是否为空: " << (s.empty() ? "是" : "否") << std::endl;
    
    return 0;
}`,
                    description: '展示set的插入、查找、删除等基本操作。'
                },
                {
                    title: 'multiset处理重复元素',
                    code: `#include <iostream>
#include <set>

int main() {
    std::multiset<int> ms;
    
    // 插入重复元素
    ms.insert(5);
    ms.insert(3);
    ms.insert(5);
    ms.insert(1);
    ms.insert(5);
    ms.insert(3);
    
    std::cout << "multiset内容: ";
    for (int val : ms) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 统计元素个数
    std::cout << "\\n元素个数统计:" << std::endl;
    std::cout << "count(1) = " << ms.count(1) << std::endl;
    std::cout << "count(3) = " << ms.count(3) << std::endl;
    std::cout << "count(5) = " << ms.count(5) << std::endl;
    
    // equal_range获取所有匹配元素
    std::cout << "\\n使用equal_range查找所有5:" << std::endl;
    auto range = ms.equal_range(5);
    std::cout << "找到 " << std::distance(range.first, range.second) << " 个5" << std::endl;
    for (auto it = range.first; it != range.second; ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    // 删除所有3
    ms.erase(3);
    std::cout << "\\n删除所有3后: ";
    for (int val : ms) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 只删除一个5
    auto it = ms.find(5);
    if (it != ms.end()) {
        ms.erase(it);
    }
    std::cout << "删除一个5后: ";
    for (int val : ms) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示multiset处理重复元素的方法。'
                }
            ],
            handsOn: {
                title: '使用set实现数据去重和排序',
                description: '使用set实现数据去重、排序和区间查询功能。',
                initialCode: `#include <iostream>
#include <set>
#include <vector>

class DataProcessor {
private:
    std::set<int> data;
    
public:
    // TODO: 添加数据
    void addData(int value) {
        // TODO: 实现添加数据
    }
    
    // TODO: 批量添加数据
    void addData(const std::vector<int>& values) {
        // TODO: 实现批量添加
    }
    
    // TODO: 删除数据
    bool removeData(int value) {
        // TODO: 实现删除数据
        // 返回是否成功删除
        return false;
    }
    
    // TODO: 检查数据是否存在
    bool contains(int value) const {
        // TODO: 实现查找功能
        return false;
    }
    
    // TODO: 获取指定范围内的数据
    std::vector<int> getRange(int low, int high) const {
        // TODO: 实现区间查询
        // 返回[low, high]范围内的所有元素
        return {};
    }
    
    // TODO: 获取最小值
    int getMin() const {
        // TODO: 实现获取最小值
        // 如果为空返回INT_MAX
        return INT_MAX;
    }
    
    // TODO: 获取最大值
    int getMax() const {
        // TODO: 实现获取最大值
        // 如果为空返回INT_MIN
        return INT_MIN;
    }
    
    // 显示所有数据
    void display() const {
        std::cout << "数据: ";
        for (int val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
        std::cout << "数量: " << data.size() << std::endl;
    }
};

int main() {
    DataProcessor processor;
    
    // 添加数据
    processor.addData({5, 2, 8, 1, 3, 5, 2, 9, 4, 7, 6, 8});
    std::cout << "添加数据后:" << std::endl;
    processor.display();
    
    // 查找数据
    std::cout << "\\n查找数据:" << std::endl;
    std::cout << "包含5: " << (processor.contains(5) ? "是" : "否") << std::endl;
    std::cout << "包含10: " << (processor.contains(10) ? "是" : "否") << std::endl;
    
    // 区间查询
    std::cout << "\\n区间[3, 7]内的数据: ";
    auto range = processor.getRange(3, 7);
    for (int val : range) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 最值
    std::cout << "\\n最小值: " << processor.getMin() << std::endl;
    std::cout << "最大值: " << processor.getMax() << std::endl;
    
    // 删除数据
    processor.removeData(5);
    std::cout << "\\n删除5后:" << std::endl;
    processor.display();
    
    return 0;
}`,
                expectedOutput: `添加数据后:
数据: 1 2 3 4 5 6 7 8 9 
数量: 9

查找数据:
包含5: 是
包含10: 否

区间[3, 7]内的数据: 3 4 5 6 7 

最小值: 1
最大值: 9

删除5后:
数据: 1 2 3 4 6 7 8 9 
数量: 8`,
                solutionRegex: 'insert|erase|find|count|lower_bound|upper_bound|begin|rbegin',
                hint: '使用insert添加，erase删除，find或count查找，lower_bound和upper_bound做区间查询',
                xp: 180
            },
            references: [
                { title: '关联容器', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: 'set和multiset', book: 'C++标准库', chapter: '第7章' }
            ],
            assistantTips: [
                'set自动排序且元素唯一',
                'multiset允许重复元素',
                '使用lower_bound/upper_bound做区间查询',
                'set的元素是const的，不能直接修改'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'set的底层实现是？', 
                    options: [
                        { text: '数组' }, 
                        { text: '链表' }, 
                        { text: '红黑树', correct: true }, 
                        { text: '哈希表' }
                    ], 
                    explanation: 'set和multiset通常使用红黑树实现，保证有序性。' 
                },
                { 
                    type: 'single', 
                    question: 'set插入重复元素会发生什么？', 
                    options: [
                        { text: '覆盖原元素' }, 
                        { text: '忽略重复元素', correct: true }, 
                        { text: '抛出异常' }, 
                        { text: '添加到末尾' }
                    ], 
                    explanation: 'set保证元素唯一，插入重复元素会被忽略。' 
                },
                { 
                    type: 'single', 
                    question: 'set的find操作时间复杂度是？', 
                    options: [
                        { text: 'O(1)' }, 
                        { text: 'O(n)' }, 
                        { text: 'O(log n)', correct: true }, 
                        { text: 'O(n log n)' }
                    ], 
                    explanation: 'set基于红黑树，查找时间复杂度为O(log n)。' 
                },
                { 
                    type: 'single', 
                    question: '如何获取set中第一个大于5的元素？', 
                    options: [
                        { text: 'find(5)' }, 
                        { text: 'lower_bound(5)' }, 
                        { text: 'upper_bound(5)', correct: true }, 
                        { text: 'count(5)' }
                    ], 
                    explanation: 'upper_bound返回第一个大于给定值的元素。' 
                },
                { 
                    type: 'single', 
                    question: 'multiset与set的主要区别是？', 
                    options: [
                        { text: '底层实现不同' }, 
                        { text: '允许重复元素', correct: true }, 
                        { text: '排序方式不同' }, 
                        { text: '查找速度不同' }
                    ], 
                    explanation: 'multiset允许存储重复元素，set保证元素唯一。' 
                }
            ]
        },
        {
            id: '16.3',
            title: 'map 与 multimap',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## map 与 multimap

### map的特点

map是关联容器，存储键值对（key-value pairs），键唯一且自动排序。

\`\`\`cpp
#include <map>

std::map<std::string, int> scores;
scores["Alice"] = 95;
scores["Bob"] = 87;
\`\`\`

### map vs multimap

| 特性 | map | multimap |
|------|-----|----------|
| 键的唯一性 | 唯一 | 允许重复 |
| 下标访问 | 支持 | 不支持 |
| 底层结构 | 红黑树 | 红黑树 |
| 时间复杂度 | O(log n) | O(log n) |

### map的操作

#### 1. 构造与初始化

\`\`\`cpp
#include <map>

// 默认构造
std::map<std::string, int> m1;

// 初始化列表
std::map<std::string, int> m2 = {
    {"Alice", 95},
    {"Bob", 87},
    {"Charlie", 92}
};

// 拷贝构造
std::map<std::string, int> m3(m2);

// 自定义比较器
std::map<std::string, int, std::greater<std::string>> m4;
\`\`\`

#### 2. 插入元素

\`\`\`cpp
std::map<std::string, int> scores;

// 下标操作符（如果键不存在会创建）
scores["Alice"] = 95;

// insert插入pair
scores.insert(std::pair<std::string, int>("Bob", 87));
scores.insert(std::make_pair("Charlie", 92));

// C++11：使用初始化列表
scores.insert({"David", 88});

// insert返回pair<iterator, bool>
auto result = scores.insert({"Alice", 100});
if (!result.second) {
    std::cout << "键已存在，插入失败" << std::endl;
}

// emplace（原地构造）
scores.emplace("Eve", 90);

// 带提示的插入
auto it = scores.begin();
scores.insert(it, {"Frank", 85});
\`\`\`

#### 3. 访问元素

\`\`\`cpp
std::map<std::string, int> scores = {
    {"Alice", 95},
    {"Bob", 87}
};

// 下标访问（键不存在会创建）
int score1 = scores["Alice"];  // 95
scores["Charlie"] = 92;  // 插入新元素

// at访问（键不存在抛出异常）
int score2 = scores.at("Bob");  // 87
// scores.at("David");  // 抛出std::out_of_range

// 迭代器访问
for (auto it = scores.begin(); it != scores.end(); ++it) {
    std::cout << it->first << ": " << it->second << std::endl;
}

// 范围for
for (const auto& pair : scores) {
    std::cout << pair.first << ": " << pair.second << std::endl;
}

// C++17：结构化绑定
for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << std::endl;
}
\`\`\`

#### 4. 查找元素

\`\`\`cpp
std::map<std::string, int> scores = {
    {"Alice", 95},
    {"Bob", 87},
    {"Charlie", 92}
};

// find返回迭代器
auto it = scores.find("Bob");
if (it != scores.end()) {
    std::cout << "找到: " << it->first << " = " << it->second << std::endl;
}

// count返回元素个数（map中为0或1）
if (scores.count("Alice") > 0) {
    std::cout << "Alice存在" << std::endl;
}

// lower_bound和upper_bound
auto lower = scores.lower_bound("Bob");
auto upper = scores.upper_bound("Bob");

// equal_range
auto range = scores.equal_range("Bob");
\`\`\`

#### 5. 删除元素

\`\`\`cpp
std::map<std::string, int> scores = {
    {"Alice", 95},
    {"Bob", 87},
    {"Charlie", 92}
};

// 按键删除
scores.erase("Bob");

// 按迭代器删除
auto it = scores.find("Alice");
if (it != scores.end()) {
    scores.erase(it);
}

// 删除范围
scores.erase(scores.begin(), scores.end());

// 清空
scores.clear();
\`\`\`

#### 6. 大小与容量

\`\`\`cpp
std::map<std::string, int> scores;

scores.size();      // 元素数量
scores.empty();     // 是否为空
scores.max_size();  // 最大可能大小
\`\`\`

### multimap的操作

multimap允许重复的键：

\`\`\`cpp
#include <map>

std::multimap<std::string, int> scores;

// 插入重复键
scores.insert({"Alice", 95});
scores.insert({"Alice", 87});
scores.insert({"Alice", 92});

// 统计键的数量
std::cout << scores.count("Alice") << std::endl;  // 3

// 注意：multimap不支持下标访问！
// scores["Alice"] = 100;  // 错误！

// 获取所有匹配元素
auto range = scores.equal_range("Alice");
for (auto it = range.first; it != range.second; ++it) {
    std::cout << it->first << ": " << it->second << std::endl;
}
\`\`\`

### map的应用场景

#### 1. 字典/映射

\`\`\`cpp
std::map<std::string, std::string> dictionary = {
    {"apple", "苹果"},
    {"banana", "香蕉"},
    {"orange", "橙子"}
};

std::cout << dictionary["apple"] << std::endl;  // 苹果
\`\`\`

#### 2. 计数器

\`\`\`cpp
#include <map>
#include <string>

std::map<std::string, int> wordCount;
std::vector<std::string> words = {"apple", "banana", "apple", "orange", "banana", "apple"};

for (const auto& word : words) {
    wordCount[word]++;  // 如果不存在会自动创建并初始化为0
}

for (const auto& [word, count] : wordCount) {
    std::cout << word << ": " << count << std::endl;
}
\`\`\`

#### 3. 缓存

\`\`\`cpp
#include <map>
#include <string>
#include <functional>

template<typename Key, typename Value>
class Cache {
private:
    std::map<Key, Value> cache;
    
public:
    Value get(const Key& key, std::function<Value()> loader) {
        auto it = cache.find(key);
        if (it != cache.end()) {
            return it->second;  // 缓存命中
        }
        
        Value value = loader();  // 加载数据
        cache[key] = value;      // 存入缓存
        return value;
    }
    
    void clear() {
        cache.clear();
    }
};
\`\`\`

#### 4. 分组

\`\`\`cpp
#include <map>
#include <vector>
#include <string>

struct Student {
    std::string name;
    int grade;
};

std::map<int, std::vector<std::string>> groupByGrade(const std::vector<Student>& students) {
    std::map<int, std::vector<std::string>> groups;
    
    for (const auto& student : students) {
        groups[student.grade].push_back(student.name);
    }
    
    return groups;
}
\`\`\`

### 下标访问 vs at vs insert

\`\`\`cpp
std::map<std::string, int> m;

// 下标访问：键不存在会创建
m["key1"] = 1;  // 创建key1并赋值

// at：键不存在抛出异常
try {
    int val = m.at("key2");  // 抛出异常
} catch (const std::out_of_range& e) {
    std::cout << "键不存在" << std::endl;
}

// insert：键存在则不插入
auto result = m.insert({"key1", 2});
if (!result.second) {
    std::cout << "键已存在，未插入" << std::endl;
}
\`\`\`

### 性能特点

| 操作 | 时间复杂度 |
|------|-----------|
| 插入 | O(log n) |
| 删除 | O(log n) |
| 查找 | O(log n) |
| 下标访问 | O(log n) |

### 注意事项

1. **下标访问会创建元素**：如果键不存在，会创建并初始化
2. **元素按键排序**：遍历时按键的顺序
3. **键是const的**：不能修改键的值

\`\`\`cpp
std::map<std::string, int> m;

// 下标访问会创建元素
int val = m["newKey"];  // 创建newKey，值为0

// 键是const的
auto it = m.begin();
// it->first = "newName";  // 错误！键是const的
it->second = 100;  // 正确
\`\`\`

### 最佳实践

#### 1. 使用 at() 避免意外创建元素

\`\`\`cpp
std::map<std::string, int> scores = {{"Alice", 95}};

// 推荐：使用 at()，键不存在时抛出异常
try {
    int score = scores.at("Bob");
} catch (const std::out_of_range& e) {
    std::cout << "键不存在" << std::endl;
}

// 不推荐：使用下标，会意外创建元素
int score = scores["Bob"];  // 创建 Bob，值为 0
\`\`\`

#### 2. 使用 insert 或 emplace 避免覆盖

\`\`\`cpp
std::map<std::string, int> scores;

// 推荐：使用 insert，不会覆盖已存在的值
auto result = scores.insert({"Alice", 95});
if (!result.second) {
    std::cout << "Alice 已存在，未覆盖" << std::endl;
}

// 不推荐：使用下标会覆盖
scores["Alice"] = 100;  // 覆盖原有值
\`\`\`

#### 3. 使用结构化绑定遍历 map

\`\`\`cpp
std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};

// 推荐：使用结构化绑定（C++17）
for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << std::endl;
}

// 不推荐：使用 first 和 second
for (const auto& pair : scores) {
    std::cout << pair.first << ": " << pair.second << std::endl;
}
\`\`\`

#### 4. 使用 count 或 find 检查键是否存在

\`\`\`cpp
std::map<std::string, int> scores = {{"Alice", 95}};

// 推荐：使用 count
if (scores.count("Alice") > 0) {
    std::cout << "Alice 存在" << std::endl;
}

// 或者使用 find
if (scores.find("Alice") != scores.end()) {
    std::cout << "Alice 存在" << std::endl;
}

// 不推荐：使用下标检查（会创建元素）
if (scores["Bob"] != 0) {  // 创建 Bob，值为 0
    // ...
}
\`\`\`

#### 5. 批量插入使用初始化列表

\`\`\`cpp
std::map<std::string, int> scores;

// 推荐：使用初始化列表
scores.insert({{"Alice", 95}, {"Bob", 87}, {"Charlie", 92}});

// 不推荐：多次调用 insert
scores.insert({"Alice", 95});
scores.insert({"Bob", 87});
scores.insert({"Charlie", 92});
\`\`\`

### 常见错误

#### 1. 使用下标访问不存在的键

\`\`\`cpp
std::map<std::string, int> scores = {{"Alice", 95}};

// 错误：下标访问会创建元素
int score = scores["Bob"];  // 创建 Bob，值为 0
std::cout << scores.size() << std::endl;  // 2（意外增加了元素）

// 正确：使用 at() 或先检查
if (scores.count("Bob") > 0) {
    int score = scores["Bob"];
}
\`\`\`

#### 2. 修改 map 的键

\`\`\`cpp
std::map<std::string, int> scores;
scores["Alice"] = 95;

// 错误：键是 const 的
auto it = scores.begin();
// it->first = "Bob";  // 编译错误！

// 正确：删除后重新插入
scores.erase(it);
scores["Bob"] = 95;
\`\`\`

#### 3. multimap 使用下标访问

\`\`\`cpp
std::multimap<std::string, int> scores;

// 错误：multimap 不支持下标访问
// scores["Alice"] = 95;  // 编译错误！

// 正确：使用 insert
scores.insert({"Alice", 95});
scores.insert({"Alice", 87});
\`\`\`

#### 4. 在遍历时删除元素

\`\`\`cpp
std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};

// 错误：遍历时删除会导致迭代器失效
for (auto it = scores.begin(); it != scores.end(); ++it) {
    if (it->second < 90) {
        scores.erase(it);  // 错误！it 失效
    }
}

// 正确：使用 erase 的返回值
for (auto it = scores.begin(); it != scores.end(); ) {
    if (it->second < 90) {
        it = scores.erase(it);
    } else {
        ++it;
    }
}
\`\`\`

#### 5. 忽略 insert 的返回值

\`\`\`cpp
std::map<std::string, int> scores;

// 错误：忽略返回值，不知道是否插入成功
scores.insert({"Alice", 95});
scores.insert({"Alice", 100});  // 插入失败，但不知道

// 正确：检查返回值
auto result = scores.insert({"Alice", 100});
if (!result.second) {
    std::cout << "Alice 已存在，插入失败" << std::endl;
    // 可以选择更新
    result.first->second = 100;
}
\`\`\`

### 深入理解

#### 1. map 的底层实现

\`\`\`cpp
// map 通常使用红黑树实现
// 红黑树保证了：
// 1. 元素按键排序
// 2. 查找、插入、删除都是 O(log n)
// 3. 迭代器稳定（插入和删除不影响其他迭代器）

// 节点结构（简化）
struct Node {
    bool color;
    Node* left;
    Node* right;
    Node* parent;
    std::pair<const Key, Value> data;  // 键是 const 的
};
\`\`\`

#### 2. 下标访问的实现机制

\`\`\`cpp
std::map<std::string, int> m;

// operator[] 的实现（简化）
int& operator[](const std::string& key) {
    auto it = find(key);
    if (it != end()) {
        return it->second;  // 找到，返回值
    }
    // 未找到，插入默认值
    auto result = insert({key, int{}});
    return result.first->second;
}

// 这就是为什么下标访问会创建元素
m["newKey"];  // 插入 {"newKey", 0}
\`\`\`

#### 3. 性能对比：map vs unordered_map

\`\`\`cpp
#include <chrono>

// 查找性能测试
std::map<int, std::string> m;
std::unordered_map<int, std::string> um;

for (int i = 0; i < 100000; ++i) {
    m[i] = "value";
    um[i] = "value";
}

// map 查找：O(log n)
auto start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 10000; ++i) {
    m.find(50000);
}
auto end = std::chrono::high_resolution_clock::now();
// 较慢

// unordered_map 查找：平均 O(1)
start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 10000; ++i) {
    um.find(50000);
}
end = std::chrono::high_resolution_clock::now();
// 更快
\`\`\`

#### 4. map 的内存布局

\`\`\`cpp
// map 的内存布局（红黑树节点）
// 每个节点包含：
// - 颜色标志（1字节 + 3字节填充）
// - 左右子节点指针（各8字节）
// - 父节点指针（8字节）
// - 键值对（大小取决于类型）

// 对于 map<int, int>：
// 每个节点大约 40 字节（64位系统）

// 对于 map<string, string>：
// 每个节点可能 80+ 字节（包含字符串内容）

// 内存占用比 unordered_map 小
\`\`\`

#### 5. 自定义键类型的 map

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    
    // 必须定义比较函数
    bool operator<(const Person& other) const {
        if (name != other.name) return name < other.name;
        return age < other.age;
    }
};

std::map<Person, std::string> personInfo;
personInfo[{"Alice", 25}] = "Engineer";
personInfo[{"Bob", 30}] = "Manager";

// 查找
Person target{"Alice", 25};
auto it = personInfo.find(target);
if (it != personInfo.end()) {
    std::cout << it->second << std::endl;
}
\`\`\``,
            examples: [
                {
                    title: 'map基本操作',
                    code: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> scores;
    
    // 插入元素
    scores["Alice"] = 95;
    scores["Bob"] = 87;
    scores.insert({"Charlie", 92});
    scores.emplace("David", 88);
    
    std::cout << "插入后的map:" << std::endl;
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    // 访问元素
    std::cout << "\\n访问元素:" << std::endl;
    std::cout << "scores[\\"Alice\\"] = " << scores["Alice"] << std::endl;
    std::cout << "scores.at(\\"Bob\\") = " << scores.at("Bob") << std::endl;
    
    // 下标访问会创建元素
    std::cout << "\\n访问不存在的键:" << std::endl;
    std::cout << "scores[\\"Eve\\"] = " << scores["Eve"] << std::endl;  // 创建并初始化为0
    std::cout << "map大小: " << scores.size() << std::endl;
    
    // 查找元素
    std::cout << "\\n查找元素:" << std::endl;
    auto it = scores.find("Charlie");
    if (it != scores.end()) {
        std::cout << "找到: " << it->first << " = " << it->second << std::endl;
    }
    
    std::cout << "count(\\"Alice\\") = " << scores.count("Alice") << std::endl;
    std::cout << "count(\\"Frank\\") = " << scores.count("Frank") << std::endl;
    
    // 删除元素
    scores.erase("Eve");
    std::cout << "\\n删除Eve后的大小: " << scores.size() << std::endl;
    
    return 0;
}`,
                    description: '展示map的插入、访问、查找和删除操作。'
                },
                {
                    title: '单词计数器',
                    code: `#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <algorithm>

int main() {
    std::vector<std::string> words = {
        "apple", "banana", "apple", "orange", "banana",
        "apple", "grape", "orange", "banana", "apple"
    };
    
    // 统计单词出现次数
    std::map<std::string, int> wordCount;
    for (const auto& word : words) {
        wordCount[word]++;
    }
    
    std::cout << "单词统计结果:" << std::endl;
    for (const auto& [word, count] : wordCount) {
        std::cout << word << ": " << count << std::endl;
    }
    
    // 找出出现次数最多的单词
    std::string maxWord;
    int maxCount = 0;
    for (const auto& [word, count] : wordCount) {
        if (count > maxCount) {
            maxCount = count;
            maxWord = word;
        }
    }
    
    std::cout << "\\n出现最多的单词: " << maxWord << " (" << maxCount << "次)" << std::endl;
    
    // 按出现次数排序
    std::vector<std::pair<std::string, int>> sortedWords(wordCount.begin(), wordCount.end());
    std::sort(sortedWords.begin(), sortedWords.end(), 
              [](const auto& a, const auto& b) { return a.second > b.second; });
    
    std::cout << "\\n按出现次数排序:" << std::endl;
    for (const auto& [word, count] : sortedWords) {
        std::cout << word << ": " << count << std::endl;
    }
    
    return 0;
}`,
                    description: '使用map实现单词计数功能。'
                }
            ],
            handsOn: {
                title: '实现学生成绩管理系统',
                description: '使用map实现学生成绩管理，支持添加、查询、修改和统计功能。',
                initialCode: `#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <algorithm>

class StudentManager {
private:
    std::map<std::string, int> scores;  // 姓名 -> 成绩
    
public:
    // TODO: 添加学生成绩
    void addStudent(const std::string& name, int score) {
        // TODO: 实现添加功能
        // 如果学生已存在，更新成绩
    }
    
    // TODO: 获取学生成绩
    int getScore(const std::string& name) const {
        // TODO: 实现查询功能
        // 如果学生不存在，返回-1
        return -1;
    }
    
    // TODO: 删除学生
    bool removeStudent(const std::string& name) {
        // TODO: 实现删除功能
        // 返回是否成功删除
        return false;
    }
    
    // TODO: 获取所有学生姓名
    std::vector<std::string> getAllNames() const {
        // TODO: 返回所有学生姓名（已排序）
        return {};
    }
    
    // TODO: 获取成绩在指定范围内的学生
    std::vector<std::string> getStudentsInRange(int minScore, int maxScore) const {
        // TODO: 返回成绩在[minScore, maxScore]范围内的学生姓名
        return {};
    }
    
    // TODO: 计算平均成绩
    double getAverageScore() const {
        // TODO: 计算并返回平均成绩
        // 如果没有学生，返回0.0
        return 0.0;
    }
    
    // TODO: 获取最高分学生
    std::string getTopStudent() const {
        // TODO: 返回成绩最高的学生姓名
        // 如果没有学生，返回空字符串
        return "";
    }
    
    // 显示所有学生
    void displayAll() const {
        std::cout << "\\n学生列表:" << std::endl;
        std::cout << "姓名\\t成绩" << std::endl;
        for (const auto& [name, score] : scores) {
            std::cout << name << "\\t" << score << std::endl;
        }
    }
};

int main() {
    StudentManager manager;
    
    // 添加学生
    manager.addStudent("张三", 85);
    manager.addStudent("李四", 92);
    manager.addStudent("王五", 78);
    manager.addStudent("赵六", 88);
    manager.addStudent("钱七", 95);
    
    manager.displayAll();
    
    // 查询成绩
    std::cout << "\\n查询成绩:" << std::endl;
    std::cout << "张三的成绩: " << manager.getScore("张三") << std::endl;
    std::cout << "孙八的成绩: " << manager.getScore("孙八") << std::endl;
    
    // 修改成绩
    std::cout << "\\n修改张三成绩为90:" << std::endl;
    manager.addStudent("张三", 90);
    std::cout << "张三的新成绩: " << manager.getScore("张三") << std::endl;
    
    // 统计信息
    std::cout << "\\n统计信息:" << std::endl;
    std::cout << "平均成绩: " << manager.getAverageScore() << std::endl;
    std::cout << "最高分学生: " << manager.getTopStudent() << std::endl;
    
    // 区间查询
    std::cout << "\\n成绩在[85, 92]的学生:" << std::endl;
    auto students = manager.getStudentsInRange(85, 92);
    for (const auto& name : students) {
        std::cout << name << " ";
    }
    std::cout << std::endl;
    
    // 删除学生
    manager.removeStudent("王五");
    std::cout << "\\n删除王五后:" << std::endl;
    manager.displayAll();
    
    return 0;
}`,
                expectedOutput: `
学生列表:
姓名    成绩
张三    85
李四    92
王五    78
赵六    88
钱七    95

查询成绩:
张三的成绩: 85
孙八的成绩: -1

修改张三成绩为90:
张三的新成绩: 90

统计信息:
平均成绩: 88.6
最高分学生: 钱七

成绩在[85, 92]的学生:
张三 李四 赵六 

删除王五后:

学生列表:
姓名    成绩
张三    90
李四    92
赵六    88
钱七    95`,
                solutionRegex: 'insert|operator\\[\\]|find|erase|begin|end|first|second',
                hint: '使用[]或insert添加，find查找，erase删除，遍历统计',
                xp: 200
            },
            references: [
                { title: '关联容器', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: 'map和multimap', book: 'C++标准库', chapter: '第7章' }
            ],
            assistantTips: [
                'map的下标访问会自动创建不存在的键',
                '使用at()可以避免意外创建元素',
                'multimap不支持下标访问',
                'map的键是const的，不能修改'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'map的下标访问如果键不存在会怎样？', 
                    options: [
                        { text: '抛出异常' }, 
                        { text: '返回nullptr' }, 
                        { text: '创建新元素并初始化', correct: true }, 
                        { text: '返回默认值' }
                    ], 
                    explanation: 'map的下标访问如果键不存在，会创建新元素并用默认值初始化。' 
                },
                { 
                    type: 'single', 
                    question: 'map的at()方法如果键不存在会怎样？', 
                    options: [
                        { text: '创建新元素' }, 
                        { text: '抛出std::out_of_range异常', correct: true }, 
                        { text: '返回0' }, 
                        { text: '返回nullptr' }
                    ], 
                    explanation: 'at()方法在键不存在时会抛出std::out_of_range异常。' 
                },
                { 
                    type: 'single', 
                    question: 'multimap与map的主要区别是？', 
                    options: [
                        { text: '底层实现不同' }, 
                        { text: '允许重复的键', correct: true }, 
                        { text: '排序方式不同' }, 
                        { text: '查找速度不同' }
                    ], 
                    explanation: 'multimap允许存储重复的键，map的键必须唯一。' 
                },
                { 
                    type: 'single', 
                    question: '如何遍历map的所有元素？', 
                    options: [
                        { text: '使用下标访问' }, 
                        { text: '使用迭代器或范围for', correct: true }, 
                        { text: '使用at()方法' }, 
                        { text: '使用find()方法' }
                    ], 
                    explanation: 'map可以使用迭代器或范围for循环遍历所有元素。' 
                },
                { 
                    type: 'single', 
                    question: 'map的元素按键排序的依据是？', 
                    options: [
                        { text: '插入顺序' }, 
                        { text: '键的比较函数', correct: true }, 
                        { text: '值的比较函数' }, 
                        { text: '哈希值' }
                    ], 
                    explanation: 'map的元素按键的比较函数排序，默认使用std::less。' 
                }
            ]
        },
        {
            id: '16.4',
            title: '无序容器（unordered_set/map）与哈希',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 无序容器（unordered_set/map）与哈希

### 什么是无序容器？

无序容器使用哈希表实现，元素不按特定顺序存储，但查找速度更快。

\`\`\`cpp
#include <unordered_set>
#include <unordered_map>

std::unordered_set<int> us = {1, 2, 3, 4, 5};
std::unordered_map<std::string, int> um = {{"Alice", 95}, {"Bob", 87}};
\`\`\`

### 有序容器 vs 无序容器

| 特性 | 有序容器 | 无序容器 |
|------|---------|---------|
| 底层结构 | 红黑树 | 哈希表 |
| 查找时间 | O(log n) | 平均O(1)，最坏O(n) |
| 元素顺序 | 有序 | 无序 |
| 内存占用 | 较小 | 较大 |
| 迭代器稳定性 | 稳定 | 可能失效 |

### unordered_set

#### 基本操作

\`\`\`cpp
#include <unordered_set>

std::unordered_set<int> us;

// 插入
us.insert(5);
us.insert({1, 2, 3});
us.emplace(4);

// 查找
auto it = us.find(3);
if (it != us.end()) {
    std::cout << "找到: " << *it << std::endl;
}

// 删除
us.erase(5);

// 大小
std::cout << "大小: " << us.size() << std::endl;
std::cout << "是否为空: " << us.empty() << std::endl;

// 清空
us.clear();
\`\`\`

#### 遍历

\`\`\`cpp
std::unordered_set<int> us = {5, 2, 8, 1, 9};

// 迭代器遍历（顺序不确定）
for (auto it = us.begin(); it != us.end(); ++it) {
    std::cout << *it << " ";
}

// 范围for
for (int val : us) {
    std::cout << val << " ";
}
\`\`\`

### unordered_map

#### 基本操作

\`\`\`cpp
#include <unordered_map>

std::unordered_map<std::string, int> um;

// 插入
um["Alice"] = 95;
um.insert({"Bob", 87});
um.emplace("Charlie", 92);

// 访问
std::cout << um["Alice"] << std::endl;
std::cout << um.at("Bob") << std::endl;

// 查找
auto it = um.find("Charlie");
if (it != um.end()) {
    std::cout << it->first << ": " << it->second << std::endl;
}

// 删除
um.erase("Alice");

// 大小
std::cout << "大小: " << um.size() << std::endl;
\`\`\`

#### 遍历

\`\`\`cpp
std::unordered_map<std::string, int> um = {
    {"Alice", 95},
    {"Bob", 87},
    {"Charlie", 92}
};

// 迭代器遍历
for (auto it = um.begin(); it != um.end(); ++it) {
    std::cout << it->first << ": " << it->second << std::endl;
}

// 范围for
for (const auto& [name, score] : um) {
    std::cout << name << ": " << score << std::endl;
}
\`\`\`

### unordered_multiset 和 unordered_multimap

允许重复元素：

\`\`\`cpp
#include <unordered_set>
#include <unordered_map>

// unordered_multiset
std::unordered_multiset<int> ums;
ums.insert(1);
ums.insert(1);
ums.insert(2);
std::cout << ums.count(1) << std::endl;  // 2

// unordered_multimap
std::unordered_multimap<std::string, int> umm;
umm.insert({"Alice", 95});
umm.insert({"Alice", 87});
std::cout << umm.count("Alice") << std::endl;  // 2

// 注意：不支持下标访问！
\`\`\`

### 哈希函数

无序容器使用哈希函数将元素映射到桶中：

\`\`\`cpp
#include <unordered_set>
#include <functional>

// 标准库提供的哈希函数
std::hash<int> hashInt;
std::hash<std::string> hashString;

std::cout << hashInt(42) << std::endl;
std::cout << hashString("Hello") << std::endl;

// 查看元素的哈希值
std::unordered_set<int> us = {1, 2, 3};
for (int val : us) {
    std::cout << val << " -> " << hashInt(val) << std::endl;
}
\`\`\`

### 桶接口

无序容器提供桶接口来检查和调整性能：

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5};

// 桶的数量
std::cout << "桶数量: " << us.bucket_count() << std::endl;
std::cout << "最大桶数量: " << us.max_bucket_count() << std::endl;

// 每个桶的元素数量
for (size_t i = 0; i < us.bucket_count(); ++i) {
    std::cout << "桶 " << i << ": " << us.bucket_size(i) << " 个元素" << std::endl;
}

// 元素所在的桶
for (int val : us) {
    std::cout << val << " 在桶 " << us.bucket(val) << std::endl;
}

// 遍历单个桶
for (auto it = us.begin(0); it != us.end(0); ++it) {
    std::cout << *it << " ";
}
\`\`\`

### 负载因子

负载因子 = 元素数量 / 桶数量

\`\`\`cpp
std::unordered_set<int> us;

// 插入元素
for (int i = 0; i < 100; ++i) {
    us.insert(i);
}

// 负载因子
std::cout << "负载因子: " << us.load_factor() << std::endl;
std::cout << "最大负载因子: " << us.max_load_factor() << std::endl;

// 设置最大负载因子
us.max_load_factor(0.5f);

// 预留空间
us.rehash(200);  // 设置桶数量至少为200
us.reserve(200);  // 预留至少200个元素的空间
\`\`\`

### 性能优化

#### 1. 预留空间

\`\`\`cpp
std::unordered_set<int> us;
us.reserve(1000);  // 预留空间，避免多次重哈希
\`\`\`

#### 2. 设置负载因子

\`\`\`cpp
std::unordered_set<int> us;
us.max_load_factor(0.7f);  // 设置合适的负载因子
\`\`\`

#### 3. 选择合适的哈希函数

\`\`\`cpp
// 对于自定义类型，需要提供哈希函数
struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 自定义哈希函数
struct PointHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 1);
    }
};

std::unordered_set<Point, PointHash> points;
\`\`\`

### 何时使用无序容器？

#### 使用无序容器当：
- 需要快速查找（平均O(1)）
- 不需要元素有序
- 键类型有好的哈希函数

#### 使用有序容器当：
- 需要元素有序
- 需要范围查询
- 需要稳定的迭代器

\`\`\`cpp
// 示例：选择合适的容器

// 场景1：快速查找用户
std::unordered_map<int, User> userCache;  // 无序容器

// 场景2：按名字排序的用户列表
std::map<std::string, User> sortedUsers;  // 有序容器

// 场景3：去重（不需要顺序）
std::unordered_set<int> uniqueValues;  // 无序容器

// 场景4：去重并排序
std::set<int> sortedUniqueValues;  // 有序容器
\`\`\`

### 迭代器失效

无序容器的迭代器在重哈希时会失效：

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3};
auto it = us.begin();

us.rehash(100);  // 重哈希
// it可能失效！

// 插入可能触发重哈希
for (int i = 0; i < 1000; ++i) {
    us.insert(i);  // 可能触发重哈希
}
\`\`\`

### 最佳实践

#### 1. 根据需求选择有序或无序容器

\`\`\`cpp
// 需要有序遍历或范围查询：使用有序容器
std::map<int, std::string> orderedMap;
orderedMap[1] = "One";
orderedMap[2] = "Two";
// 遍历时按键排序

// 只需要快速查找：使用无序容器
std::unordered_map<int, std::string> unorderedMap;
unorderedMap[1] = "One";
unorderedMap[2] = "Two";
// 查找更快，但遍历顺序不确定
\`\`\`

#### 2. 预分配空间避免重哈希

\`\`\`cpp
// 推荐：预分配空间
std::unordered_set<int> us;
us.reserve(10000);  // 预分配足够空间

for (int i = 0; i < 10000; ++i) {
    us.insert(i);  // 不会触发重哈希
}

// 不推荐：不预分配
std::unordered_set<int> us2;
for (int i = 0; i < 10000; ++i) {
    us2.insert(i);  // 可能多次重哈希
}
\`\`\`

#### 3. 为自定义类型提供好的哈希函数

\`\`\`cpp
struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 推荐：使用组合哈希
struct PointHash {
    std::size_t operator()(const Point& p) const {
        std::size_t h1 = std::hash<int>{}(p.x);
        std::size_t h2 = std::hash<int>{}(p.y);
        return h1 ^ (h2 << 1);  // 组合哈希值
    }
};

std::unordered_set<Point, PointHash> points;
\`\`\`

#### 4. 监控负载因子

\`\`\`cpp
std::unordered_set<int> us;

for (int i = 0; i < 1000; ++i) {
    us.insert(i);
    
    // 监控负载因子
    if (us.load_factor() > 0.8) {
        std::cout << "负载因子过高: " << us.load_factor() << std::endl;
        // 考虑调整最大负载因子或预分配更多空间
    }
}
\`\`\`

#### 5. 使用 at() 避免意外创建元素

\`\`\`cpp
std::unordered_map<std::string, int> um = {{"Alice", 95}};

// 推荐：使用 at()
try {
    int score = um.at("Bob");
} catch (const std::out_of_range& e) {
    std::cout << "键不存在" << std::endl;
}

// 不推荐：使用下标会创建元素
int score = um["Bob"];  // 创建 Bob，值为 0
\`\`\`

### 常见错误

#### 1. 忘记为自定义类型定义哈希函数

\`\`\`cpp
struct Point {
    int x, y;
};

// 错误：没有定义哈希函数
std::unordered_set<Point> points;  // 编译错误！

// 正确：定义哈希函数和 operator==
struct PointHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>{}(p.x) ^ (std::hash<int>{}(p.y) << 1);
    }
};

bool operator==(const Point& a, const Point& b) {
    return a.x == b.x && a.y == b.y;
}

std::unordered_set<Point, PointHash> points;  // 正确
\`\`\`

#### 2. 假设无序容器的遍历顺序

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5};

// 错误：假设遍历顺序
for (int val : us) {
    std::cout << val << " ";  // 顺序不确定！
}

// 正确：如果需要有序，使用有序容器
std::set<int> s = {1, 2, 3, 4, 5};
for (int val : s) {
    std::cout << val << " ";  // 1 2 3 4 5
}
\`\`\`

#### 3. 在重哈希后使用旧迭代器

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3};
auto it = us.begin();

// 错误：重哈希后迭代器失效
us.rehash(100);  // 重哈希
// std::cout << *it << std::endl;  // 未定义行为！

// 正确：重哈希后重新获取迭代器
us.rehash(100);
it = us.begin();  // 重新获取
\`\`\`

#### 4. 使用糟糕的哈希函数

\`\`\`cpp
// 错误：糟糕的哈希函数
struct BadHash {
    std::size_t operator()(int x) const {
        return x % 10;  // 只用最后一位，容易冲突
    }
};

std::unordered_set<int, BadHash> us;
for (int i = 0; i < 100; ++i) {
    us.insert(i);  // 大量冲突，性能差
}

// 正确：使用标准库哈希
std::unordered_set<int> us2;  // 使用默认哈希
\`\`\`

#### 5. 忽略负载因子的影响

\`\`\`cpp
std::unordered_set<int> us;

// 错误：不关注负载因子
for (int i = 0; i < 10000; ++i) {
    us.insert(i);
}
// 负载因子可能很高，查找性能下降

// 正确：监控并调整负载因子
std::cout << "负载因子: " << us.load_factor() << std::endl;
if (us.load_factor() > 1.0) {
    us.max_load_factor(0.7);  // 降低最大负载因子
    us.rehash(us.size() / 0.7);  // 重新分配桶
}
\`\`\`

### 深入理解

#### 1. 哈希表的实现原理

\`\`\`cpp
// 无序容器使用哈希表实现
// 哈希表结构：
// 1. 桶数组：存储元素
// 2. 哈希函数：将元素映射到桶
// 3. 冲突解决：链表法或开放寻址法

// 插入过程：
// 1. 计算哈希值：hash = hash_function(key)
// 2. 计算桶索引：bucket = hash % bucket_count
// 3. 在桶中查找或插入元素

// 查找过程：
// 1. 计算哈希值和桶索引
// 2. 在桶中查找元素

// 时间复杂度：
// - 平均：O(1)
// - 最坏（所有元素在一个桶）：O(n)
\`\`\`

#### 2. 重哈希的触发条件

\`\`\`cpp
std::unordered_set<int> us;

// 重哈希触发条件：
// load_factor() > max_load_factor()

// 默认最大负载因子通常是 1.0
std::cout << "默认最大负载因子: " << us.max_load_factor() << std::endl;

// 插入元素，观察重哈希
for (int i = 0; i < 100; ++i) {
    size_t old_buckets = us.bucket_count();
    us.insert(i);
    size_t new_buckets = us.bucket_count();
    
    if (new_buckets != old_buckets) {
        std::cout << "重哈希: " << old_buckets << " -> " << new_buckets << std::endl;
    }
}
\`\`\`

#### 3. 桶分布与性能

\`\`\`cpp
std::unordered_set<int> us;

// 插入元素
for (int i = 0; i < 1000; ++i) {
    us.insert(i);
}

// 分析桶分布
size_t max_bucket_size = 0;
size_t empty_buckets = 0;

for (size_t i = 0; i < us.bucket_count(); ++i) {
    size_t size = us.bucket_size(i);
    max_bucket_size = std::max(max_bucket_size, size);
    if (size == 0) empty_buckets++;
}

std::cout << "最大桶大小: " << max_bucket_size << std::endl;
std::cout << "空桶数量: " << empty_buckets << std::endl;
std::cout << "负载因子: " << us.load_factor() << std::endl;

// 理想情况：桶大小均匀分布
// 最坏情况：所有元素在一个桶，退化为链表
\`\`\`

#### 4. 性能优化技巧

\`\`\`cpp
// 1. 预分配空间
std::unordered_set<int> us;
us.reserve(10000);  // 避免多次重哈希

// 2. 调整最大负载因子
us.max_load_factor(0.5);  // 降低冲突概率

// 3. 选择好的哈希函数
struct GoodHash {
    std::size_t operator()(const std::string& s) const {
        // 使用标准库哈希
        return std::hash<std::string>{}(s);
    }
};

// 4. 避免频繁插入删除
// 如果需要频繁插入删除，考虑使用其他容器

// 5. 监控性能
std::cout << "桶数量: " << us.bucket_count() << std::endl;
std::cout << "负载因子: " << us.load_factor() << std::endl;
\`\`\`

#### 5. 内存占用分析

\`\`\`cpp
// 无序容器的内存占用
// 1. 桶数组：bucket_count * sizeof(void*)
// 2. 元素节点：size * sizeof(Node)
// 3. 节点包含：元素 + 指针

// 对于 unordered_set<int>：
// - 桶数组：bucket_count * 8 字节
// - 节点：size * (4 + 8) 字节（int + 指针）
// - 总计：约 size * 20 字节（假设负载因子 1.0）

// 对于 unordered_map<int, int>：
// - 桶数组：bucket_count * 8 字节
// - 节点：size * (4 + 4 + 8) 字节（两个 int + 指针）
// - 总计：约 size * 24 字节

// 比有序容器占用更多内存
\`\`\``,
            examples: [
                {
                    title: '无序容器基本操作',
                    code: `#include <iostream>
#include <unordered_set>
#include <unordered_map>
#include <string>

int main() {
    // unordered_set
    std::unordered_set<int> us = {5, 2, 8, 1, 9, 3, 7};
    
    std::cout << "unordered_set: ";
    for (int val : us) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 插入
    us.insert(10);
    std::cout << "插入10后: ";
    for (int val : us) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 查找
    std::cout << "\\n查找元素:" << std::endl;
    std::cout << "count(5) = " << us.count(5) << std::endl;
    std::cout << "count(100) = " << us.count(100) << std::endl;
    
    // 桶信息
    std::cout << "\\n桶信息:" << std::endl;
    std::cout << "桶数量: " << us.bucket_count() << std::endl;
    std::cout << "负载因子: " << us.load_factor() << std::endl;
    
    // unordered_map
    std::unordered_map<std::string, int> um;
    um["Alice"] = 95;
    um["Bob"] = 87;
    um["Charlie"] = 92;
    
    std::cout << "\\nunordered_map:" << std::endl;
    for (const auto& [name, score] : um) {
        std::cout << name << ": " << score << std::endl;
    }
    
    std::cout << "\\n桶数量: " << um.bucket_count() << std::endl;
    std::cout << "负载因子: " << um.load_factor() << std::endl;
    
    return 0;
}`,
                    description: '展示unordered_set和unordered_map的基本操作。'
                },
                {
                    title: '性能对比：有序 vs 无序',
                    code: `#include <iostream>
#include <set>
#include <unordered_set>
#include <chrono>
#include <vector>
#include <random>

int main() {
    const int N = 100000;
    std::vector<int> data;
    
    // 生成随机数据
    std::random_device rd;
    std::mt19937 gen(rd());
    for (int i = 0; i < N; ++i) {
        data.push_back(gen());
    }
    
    // 测试set
    auto start = std::chrono::high_resolution_clock::now();
    std::set<int> s;
    for (int val : data) {
        s.insert(val);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "set插入" << N << "个元素: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试unordered_set
    start = std::chrono::high_resolution_clock::now();
    std::unordered_set<int> us;
    for (int val : data) {
        us.insert(val);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "unordered_set插入" << N << "个元素: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试查找性能
    int searchVal = data[N / 2];
    
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 10000; ++i) {
        s.find(searchVal);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "\\nset查找10000次: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 10000; ++i) {
        us.find(searchVal);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "unordered_set查找10000次: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    return 0;
}`,
                    description: '比较set和unordered_set的性能差异。'
                }
            ],
            handsOn: {
                title: '实现缓存系统',
                description: '使用unordered_map实现一个简单的缓存系统。',
                initialCode: `#include <iostream>
#include <unordered_map>
#include <string>
#include <functional>
#include <chrono>
#include <thread>

template<typename Key, typename Value>
class SimpleCache {
private:
    std::unordered_map<Key, Value> cache;
    std::unordered_map<Key, std::chrono::steady_clock::time_point> timestamps;
    std::chrono::milliseconds ttl;  // 缓存过期时间
    
public:
    SimpleCache(std::chrono::milliseconds ttl = std::chrono::milliseconds(5000))
        : ttl(ttl) {}
    
    // TODO: 获取缓存，如果不存在或过期则加载
    Value get(const Key& key, std::function<Value()> loader) {
        // TODO: 实现缓存获取逻辑
        // 1. 检查缓存是否存在
        // 2. 如果存在，检查是否过期
        // 3. 如果不存在或过期，调用loader加载数据
        // 4. 更新缓存和时间戳
        return Value();
    }
    
    // TODO: 手动设置缓存
    void set(const Key& key, const Value& value) {
        // TODO: 实现手动设置缓存
    }
    
    // TODO: 删除缓存
    bool remove(const Key& key) {
        // TODO: 实现删除缓存
        return false;
    }
    
    // TODO: 清空缓存
    void clear() {
        // TODO: 实现清空缓存
    }
    
    // TODO: 获取缓存大小
    size_t size() const {
        // TODO: 返回缓存大小
        return 0;
    }
    
    // TODO: 检查键是否存在
    bool contains(const Key& key) const {
        // TODO: 检查键是否存在
        return false;
    }
    
    // TODO: 清理过期缓存
    void cleanExpired() {
        // TODO: 删除所有过期的缓存项
    }
};

// 模拟耗时操作
std::string loadData(const std::string& key) {
    std::cout << "从数据库加载: " << key << std::endl;
    return "Value of " + key;
}

int main() {
    SimpleCache<std::string, std::string> cache(std::chrono::milliseconds(2000));
    
    // 第一次获取（需要加载）
    std::cout << "第一次获取user1:" << std::endl;
    std::string val1 = cache.get("user1", []() { return loadData("user1"); });
    std::cout << "结果: " << val1 << std::endl;
    
    // 第二次获取（缓存命中）
    std::cout << "\\n第二次获取user1:" << std::endl;
    std::string val2 = cache.get("user1", []() { return loadData("user1"); });
    std::cout << "结果: " << val2 << std::endl;
    
    // 等待缓存过期
    std::cout << "\\n等待2秒..." << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(2500));
    
    // 再次获取（缓存过期，需要重新加载）
    std::cout << "\\n过期后获取user1:" << std::endl;
    std::string val3 = cache.get("user1", []() { return loadData("user1"); });
    std::cout << "结果: " << val3 << std::endl;
    
    // 手动设置缓存
    cache.set("user2", "Manual value");
    std::cout << "\\n手动设置的user2: " << cache.get("user2", []() { return loadData("user2"); }) << std::endl;
    
    // 缓存统计
    std::cout << "\\n缓存大小: " << cache.size() << std::endl;
    std::cout << "包含user1: " << (cache.contains("user1") ? "是" : "否") << std::endl;
    
    // 删除缓存
    cache.remove("user1");
    std::cout << "\\n删除user1后:" << std::endl;
    std::cout << "包含user1: " << (cache.contains("user1") ? "是" : "否") << std::endl;
    
    return 0;
}`,
                expectedOutput: `第一次获取user1:
从数据库加载: user1
结果: Value of user1

第二次获取user1:
结果: Value of user1

等待2秒...

过期后获取user1:
从数据库加载: user1
结果: Value of user1

手动设置的user2: Manual value

缓存大小: 2
包含user1: 是

删除user1后:
包含user1: 否`,
                solutionRegex: 'find|insert|emplace|erase|count|clear|size',
                hint: '使用find查找缓存，insert或emplace插入，erase删除，检查时间戳判断过期',
                xp: 200
            },
            references: [
                { title: '无序容器', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: '哈希表', book: '算法导论', chapter: '第11章' }
            ],
            assistantTips: [
                '无序容器查找速度更快（平均O(1)）',
                '无序容器不保证元素顺序',
                '重哈希会导致迭代器失效',
                '使用reserve预分配空间提高性能'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'unordered_set的查找时间复杂度是？', 
                    options: [
                        { text: 'O(1)' }, 
                        { text: 'O(log n)' }, 
                        { text: '平均O(1)，最坏O(n)', correct: true }, 
                        { text: 'O(n)' }
                    ], 
                    explanation: '无序容器平均查找时间是O(1)，但哈希冲突时最坏是O(n)。' 
                },
                { 
                    type: 'single', 
                    question: '无序容器的底层实现是？', 
                    options: [
                        { text: '红黑树' }, 
                        { text: '哈希表', correct: true }, 
                        { text: '链表' }, 
                        { text: '数组' }
                    ], 
                    explanation: '无序容器使用哈希表实现。' 
                },
                { 
                    type: 'single', 
                    question: '负载因子的计算公式是？', 
                    options: [
                        { text: '桶数量 / 元素数量' }, 
                        { text: '元素数量 / 桶数量', correct: true }, 
                        { text: '元素数量 * 桶数量' }, 
                        { text: '元素数量 + 桶数量' }
                    ], 
                    explanation: '负载因子 = 元素数量 / 桶数量。' 
                },
                { 
                    type: 'single', 
                    question: '何时应该使用无序容器？', 
                    options: [
                        { text: '需要元素有序时' }, 
                        { text: '需要快速查找且不需要顺序', correct: true }, 
                        { text: '需要范围查询时' }, 
                        { text: '需要稳定的迭代器时' }
                    ], 
                    explanation: '无序容器适合快速查找场景，但不保证元素顺序。' 
                },
                { 
                    type: 'single', 
                    question: 'unordered_map与map的主要区别是？', 
                    options: [
                        { text: '底层实现不同，unordered_map更快但无序', correct: true }, 
                        { text: 'unordered_map不支持查找' }, 
                        { text: 'map更快' }, 
                        { text: 'unordered_map不支持插入' }
                    ], 
                    explanation: 'unordered_map使用哈希表，查找更快但元素无序。' 
                }
            ]
        },
        {
            id: '16.5',
            title: '自定义键类型的比较函数与哈希函数',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 自定义键类型的比较函数与哈希函数

### 为什么需要自定义？

标准容器默认使用std::less进行比较，使用std::hash进行哈希。对于自定义类型，需要提供自定义的比较函数或哈希函数。

### 有序容器的比较函数

#### 1. 重载运算符

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    
    // 重载 < 运算符
    bool operator<(const Person& other) const {
        return name < other.name;  // 按名字排序
    }
};

std::set<Person> people;
people.insert({"Alice", 25});
people.insert({"Bob", 30});
\`\`\`

#### 2. 函数对象（仿函数）

\`\`\`cpp
struct Person {
    std::string name;
    int age;
};

// 按年龄比较
struct CompareByAge {
    bool operator()(const Person& a, const Person& b) const {
        return a.age < b.age;
    }
};

std::set<Person, CompareByAge> people;
\`\`\`

#### 3. Lambda表达式（C++11）

\`\`\`cpp
auto comp = [](const Person& a, const Person& b) {
    return a.name < b.name;
};

// 注意：需要传递lambda的类型
std::set<Person, decltype(comp)> people(comp);
\`\`\`

#### 4. 特化std::less

\`\`\`cpp
namespace std {
    template<>
    struct less<Person> {
        bool operator()(const Person& a, const Person& b) const {
            return a.name < b.name;
        }
    };
}

// 现在可以直接使用
std::set<Person> people;
\`\`\`

### 无序容器的哈希函数

#### 1. 自定义哈希函数

\`\`\`cpp
struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 自定义哈希函数
struct PointHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 1);
    }
};

std::unordered_set<Point, PointHash> points;
\`\`\`

#### 2. 特化std::hash

\`\`\`cpp
namespace std {
    template<>
    struct hash<Point> {
        std::size_t operator()(const Point& p) const {
            return hash<int>()(p.x) ^ (hash<int>()(p.y) << 1);
        }
    };
}

// 现在可以直接使用
std::unordered_set<Point> points;
\`\`\`

#### 3. 使用boost::hash_combine（推荐）

\`\`\`cpp
template<typename T>
void hash_combine(std::size_t& seed, const T& val) {
    seed ^= std::hash<T>()(val) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

struct PointHash {
    std::size_t operator()(const Point& p) const {
        std::size_t seed = 0;
        hash_combine(seed, p.x);
        hash_combine(seed, p.y);
        return seed;
    }
};
\`\`\`

### 完整示例：自定义类型作为键

\`\`\`cpp
#include <iostream>
#include <set>
#include <unordered_set>
#include <string>

struct Student {
    int id;
    std::string name;
    
    // 用于有序容器
    bool operator<(const Student& other) const {
        return id < other.id;  // 按ID排序
    }
    
    // 用于无序容器
    bool operator==(const Student& other) const {
        return id == other.id && name == other.name;
    }
};

// 自定义哈希函数
struct StudentHash {
    std::size_t operator()(const Student& s) const {
        return std::hash<int>()(s.id) ^ (std::hash<std::string>()(s.name) << 1);
    }
};

int main() {
    // 有序容器
    std::set<Student> students1;
    students1.insert({1, "Alice"});
    students1.insert({2, "Bob"});
    
    // 无序容器
    std::unordered_set<Student, StudentHash> students2;
    students2.insert({1, "Alice"});
    students2.insert({2, "Bob"});
    
    return 0;
}
\`\`\`

### 多字段比较

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    std::string city;
};

// 先按名字，再按年龄，最后按城市
struct ComparePerson {
    bool operator()(const Person& a, const Person& b) const {
        if (a.name != b.name) return a.name < b.name;
        if (a.age != b.age) return a.age < b.age;
        return a.city < b.city;
    }
};

// C++11：使用std::tie简化
#include <tuple>

struct ComparePersonSimple {
    bool operator()(const Person& a, const Person& b) const {
        return std::tie(a.name, a.age, a.city) < 
               std::tie(b.name, b.age, b.city);
    }
};
\`\`\`

### 自定义比较器的map

\`\`\`cpp
#include <map>
#include <string>

// 不区分大小写的字符串比较
struct CaseInsensitiveCompare {
    bool operator()(const std::string& a, const std::string& b) const {
        return std::lexicographical_compare(
            a.begin(), a.end(),
            b.begin(), b.end(),
            [](char c1, char c2) { return tolower(c1) < tolower(c2); }
        );
    }
};

std::map<std::string, int, CaseInsensitiveCompare> caseInsensitiveMap;
caseInsensitiveMap["Hello"] = 1;
caseInsensitiveMap["HELLO"];  // 会找到"Hello"
\`\`\`

### 性能考虑

#### 1. 比较函数的性能

\`\`\`cpp
// 好的做法：先比较简单的字段
struct GoodCompare {
    bool operator()(const Person& a, const Person& b) const {
        if (a.age != b.age) return a.age < b.age;  // int比较快
        return a.name < b.name;  // string比较慢
    }
};

// 不好的做法：总是比较慢的字段
struct BadCompare {
    bool operator()(const Person& a, const Person& b) const {
        if (a.name != b.name) return a.name < b.name;  // 总是比较string
        return a.age < b.age;
    }
};
\`\`\`

#### 2. 哈希函数的质量

\`\`\`cpp
// 好的哈希函数：分布均匀
struct GoodHash {
    std::size_t operator()(const Point& p) const {
        std::size_t h1 = std::hash<int>()(p.x);
        std::size_t h2 = std::hash<int>()(p.y);
        return h1 ^ (h2 << 1);  // 组合哈希值
    }
};

// 不好的哈希函数：容易冲突
struct BadHash {
    std::size_t operator()(const Point& p) const {
        return p.x + p.y;  // (1,2)和(2,1)哈希值相同
    }
};
\`\`\`

### 注意事项

1. **比较函数必须满足严格弱序**：
   - 反自反性：a < a 为假
   - 反对称性：如果 a < b，则 !(b < a)
   - 传递性：如果 a < b 且 b < c，则 a < c

2. **哈希函数的要求**：
   - 相同的对象必须产生相同的哈希值
   - 尽量均匀分布
   - 计算速度快

3. **相等比较**：
   - 无序容器需要operator==
   - 如果a == b，则hash(a) == hash(b)

\`\`\`cpp
// 错误：比较函数不满足严格弱序
struct BadCompare {
    bool operator()(int a, int b) const {
        return a <= b;  // 错误！应该用 <
    }
};

// 正确：满足严格弱序
struct GoodCompare {
    bool operator()(int a, int b) const {
        return a < b;
    }
};
\`\`\`

### 最佳实践

#### 1. 使用 std::tie 简化多字段比较

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    std::string city;
    
    // 推荐：使用 std::tie
    bool operator<(const Person& other) const {
        return std::tie(name, age, city) < 
               std::tie(other.name, other.age, other.city);
    }
    
    // 不推荐：手动比较每个字段
    // bool operator<(const Person& other) const {
    //     if (name != other.name) return name < other.name;
    //     if (age != other.age) return age < other.age;
    //     return city < other.city;
    // }
};
\`\`\`

#### 2. 为自定义类型特化 std::hash

\`\`\`cpp
struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 推荐：特化 std::hash
namespace std {
    template<>
    struct hash<Point> {
        std::size_t operator()(const Point& p) const {
            return hash<int>()(p.x) ^ (hash<int>()(p.y) << 1);
        }
    };
}

// 现在可以直接使用
std::unordered_set<Point> points;
\`\`\`

#### 3. 使用组合哈希提高哈希质量

\`\`\`cpp
// 推荐：使用组合哈希
template<typename T>
void hash_combine(std::size_t& seed, const T& val) {
    seed ^= std::hash<T>()(val) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

struct PointHash {
    std::size_t operator()(const Point& p) const {
        std::size_t seed = 0;
        hash_combine(seed, p.x);
        hash_combine(seed, p.y);
        return seed;
    }
};

// 不推荐：简单异或
struct BadHash {
    std::size_t operator()(const Point& p) const {
        return p.x ^ p.y;  // (1,2) 和 (2,1) 冲突
    }
};
\`\`\`

#### 4. 确保比较函数满足严格弱序

\`\`\`cpp
// 推荐：使用 < 运算符
struct GoodCompare {
    bool operator()(int a, int b) const {
        return a < b;  // 满足严格弱序
    }
};

// 错误：使用 <= 运算符
struct BadCompare {
    bool operator()(int a, int b) const {
        return a <= b;  // 不满足严格弱序！
    }
};
\`\`\`

#### 5. 为无序容器同时定义 == 和 hash

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    
    // 必须定义 operator==
    bool operator==(const Person& other) const {
        return name == other.name && age == other.age;
    }
};

// 必须定义哈希函数
struct PersonHash {
    std::size_t operator()(const Person& p) const {
        return std::hash<std::string>()(p.name) ^ (std::hash<int>()(p.age) << 1);
    }
};

// 现在可以使用
std::unordered_set<Person, PersonHash> people;
\`\`\`

### 常见错误

#### 1. 比较函数不满足严格弱序

\`\`\`cpp
// 错误：使用 <=
struct BadCompare {
    bool operator()(int a, int b) const {
        return a <= b;  // 不满足反自反性
    }
};

// 错误：比较函数不一致
struct InconsistentCompare {
    bool operator()(int a, int b) const {
        return a % 10 < b % 10;  // 只比较个位数
    }
};
// 问题：5 和 15 被认为相等，但 5 < 15 且 15 < 5 都为假

// 正确：使用 <
struct GoodCompare {
    bool operator()(int a, int b) const {
        return a < b;
    }
};
\`\`\`

#### 2. 哈希函数与相等比较不一致

\`\`\`cpp
struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x;  // 只比较 x
    }
};

// 错误：哈希函数使用了 x 和 y
struct BadHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x) ^ std::hash<int>()(p.y);
    }
};

// 问题：(1,2) 和 (1,3) 相等，但哈希值不同！

// 正确：哈希函数只使用 x
struct GoodHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x);
    }
};
\`\`\`

#### 3. 忘记定义 operator==

\`\`\`cpp
struct Point {
    int x, y;
};

// 错误：没有定义 operator==
std::unordered_set<Point> points;  // 编译错误！

// 正确：定义 operator==
bool operator==(const Point& a, const Point& b) {
    return a.x == b.x && a.y == b.y;
}
\`\`\`

#### 4. 哈希函数质量差

\`\`\`cpp
// 错误：哈希函数质量差
struct BadHash {
    std::size_t operator()(int x) const {
        return x % 10;  // 只用最后一位
    }
};

// 问题：1, 11, 21, 31... 都映射到同一个桶
std::unordered_set<int, BadHash> us;
for (int i = 0; i < 100; ++i) {
    us.insert(i);
}
// 大量冲突，性能差

// 正确：使用标准库哈希
std::unordered_set<int> us2;  // 使用默认哈希
\`\`\`

#### 5. 比较函数性能差

\`\`\`cpp
struct Person {
    std::string name;
    int age;
    std::string city;
};

// 错误：先比较慢的字段
struct BadCompare {
    bool operator()(const Person& a, const Person& b) const {
        if (a.name != b.name) return a.name < b.name;  // 字符串比较慢
        return a.age < b.age;
    }
};

// 正确：先比较快的字段
struct GoodCompare {
    bool operator()(const Person& a, const Person& b) const {
        if (a.age != b.age) return a.age < b.age;  // int 比较快
        return a.name < b.name;
    }
};
\`\`\`

### 深入理解

#### 1. 严格弱序的要求

\`\`\`cpp
// 严格弱序必须满足：
// 1. 反自反性：comp(a, a) 为假
// 2. 反对称性：如果 comp(a, b) 为真，则 comp(b, a) 为假
// 3. 传递性：如果 comp(a, b) 和 comp(b, c) 为真，则 comp(a, c) 为真
// 4. 不可比性的传递性：如果 !comp(a, b) && !comp(b, a) 且
//    !comp(b, c) && !comp(c, b)，则 !comp(a, c) && !comp(c, a)

// 示例：std::less<int> 满足严格弱序
std::less<int> comp;
// comp(1, 1) = false  ✓ 反自反性
// comp(1, 2) = true, comp(2, 1) = false  ✓ 反对称性
// comp(1, 2) && comp(2, 3) => comp(1, 3)  ✓ 传递性
\`\`\`

#### 2. 哈希函数的设计原则

\`\`\`cpp
// 好的哈希函数应该：
// 1. 确定性：相同输入产生相同输出
// 2. 均匀分布：输出值均匀分布
// 3. 高效：计算速度快
// 4. 相似输入产生不同输出

// 示例：组合哈希
template<typename T>
void hash_combine(std::size_t& seed, const T& val) {
    // 魔法常数 0x9e3779b9 是黄金比例
    seed ^= std::hash<T>()(val) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

// 使用示例
struct PersonHash {
    std::size_t operator()(const Person& p) const {
        std::size_t seed = 0;
        hash_combine(seed, p.name);
        hash_combine(seed, p.age);
        hash_combine(seed, p.city);
        return seed;
    }
};
\`\`\`

#### 3. 比较函数与排序

\`\`\`cpp
// 比较函数决定了容器的排序方式
std::set<int, std::less<int>> ascending;  // 升序
std::set<int, std::greater<int>> descending;  // 降序

// 自定义比较
struct PersonCompare {
    bool operator()(const Person& a, const Person& b) const {
        return a.age < b.age;  // 按年龄排序
    }
};

std::set<Person, PersonCompare> peopleByAge;

// 注意：比较函数必须一致
// 如果 a < b，则 a 应该排在 b 前面
\`\`\`

#### 4. 哈希冲突与性能

\`\`\`cpp
// 哈希冲突：不同元素映射到同一个桶
// 冲突越多，查找性能越差

// 好的哈希函数：冲突少
struct GoodHash {
    std::size_t operator()(int x) const {
        return std::hash<int>()(x);
    }
};

// 差的哈希函数：冲突多
struct BadHash {
    std::size_t operator()(int x) const {
        return x % 10;  // 大量冲突
    }
};

// 性能对比
std::unordered_set<int, GoodHash> goodSet;
std::unordered_set<int, BadHash> badSet;

for (int i = 0; i < 1000; ++i) {
    goodSet.insert(i);
    badSet.insert(i);
}

// goodSet 查找：O(1)
// badSet 查找：可能 O(n)
\`\`\`

#### 5. 自定义类型的完整示例

\`\`\`cpp
struct Student {
    int id;
    std::string name;
    double score;
    
    // 用于有序容器
    bool operator<(const Student& other) const {
        if (id != other.id) return id < other.id;
        return name < other.name;
    }
    
    // 用于无序容器
    bool operator==(const Student& other) const {
        return id == other.id && name == other.name;
    }
};

// 哈希函数
struct StudentHash {
    std::size_t operator()(const Student& s) const {
        std::size_t seed = 0;
        seed ^= std::hash<int>()(s.id) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        seed ^= std::hash<std::string>()(s.name) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        return seed;
    }
};

// 使用
std::set<Student> orderedStudents;
std::unordered_set<Student, StudentHash> unorderedStudents;
\`\`\``,
            examples: [
                {
                    title: '自定义类型的有序容器',
                    code: `#include <iostream>
#include <set>
#include <map>
#include <string>

struct Person {
    std::string name;
    int age;
    
    // 重载 < 运算符
    bool operator<(const Person& other) const {
        if (name != other.name) return name < other.name;
        return age < other.age;
    }
};

// 按年龄比较的仿函数
struct CompareByAge {
    bool operator()(const Person& a, const Person& b) const {
        return a.age < b.age;
    }
};

int main() {
    // 使用默认比较（按名字，再按年龄）
    std::set<Person> people1;
    people1.insert({"Alice", 25});
    people1.insert({"Bob", 30});
    people1.insert({"Alice", 20});  // 名字相同，年龄不同
    
    std::cout << "按名字排序:" << std::endl;
    for (const auto& p : people1) {
        std::cout << p.name << " (" << p.age << ")" << std::endl;
    }
    
    // 使用自定义比较（按年龄）
    std::set<Person, CompareByAge> people2;
    people2.insert({"Alice", 25});
    people2.insert({"Bob", 30});
    people2.insert({"Charlie", 20});
    
    std::cout << "\\n按年龄排序:" << std::endl;
    for (const auto& p : people2) {
        std::cout << p.name << " (" << p.age << ")" << std::endl;
    }
    
    // 使用自定义比较的map
    std::map<Person, std::string, CompareByAge> personInfo;
    personInfo[{"Alice", 25}] = "Engineer";
    personInfo[{"Bob", 30}] = "Manager";
    
    std::cout << "\\nPerson信息:" << std::endl;
    for (const auto& [person, info] : personInfo) {
        std::cout << person.name << " (" << person.age << "): " << info << std::endl;
    }
    
    return 0;
}`,
                    description: '展示如何为自定义类型定义比较函数。'
                },
                {
                    title: '自定义类型的无序容器',
                    code: `#include <iostream>
#include <unordered_set>
#include <unordered_map>
#include <string>

struct Point {
    int x, y;
    
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 自定义哈希函数
struct PointHash {
    std::size_t operator()(const Point& p) const {
        // 组合x和y的哈希值
        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 1);
    }
};

// 输出Point
std::ostream& operator<<(std::ostream& os, const Point& p) {
    return os << "(" << p.x << ", " << p.y << ")";
}

int main() {
    // 使用自定义哈希函数
    std::unordered_set<Point, PointHash> points;
    
    points.insert({1, 2});
    points.insert({3, 4});
    points.insert({1, 2});  // 重复，不会插入
    points.insert({5, 6});
    
    std::cout << "Points in set:" << std::endl;
    for (const auto& p : points) {
        std::cout << p << std::endl;
    }
    
    std::cout << "\\nSize: " << points.size() << std::endl;
    
    // 查找
    Point target{1, 2};
    if (points.find(target) != points.end()) {
        std::cout << "Found " << target << std::endl;
    }
    
    // 使用自定义哈希函数的map
    std::unordered_map<Point, std::string, PointHash> pointNames;
    pointNames[{0, 0}] = "Origin";
    pointNames[{1, 0}] = "Unit X";
    pointNames[{0, 1}] = "Unit Y";
    
    std::cout << "\\nPoint names:" << std::endl;
    for (const auto& [point, name] : pointNames) {
        std::cout << point << ": " << name << std::endl;
    }
    
    return 0;
}`,
                    description: '展示如何为自定义类型定义哈希函数。'
                }
            ],
            handsOn: {
                title: '实现自定义类型的容器',
                description: '为Book类型实现比较函数和哈希函数，使其可以作为容器键。',
                initialCode: `#include <iostream>
#include <set>
#include <unordered_set>
#include <string>

struct Book {
    std::string isbn;
    std::string title;
    std::string author;
    double price;
    
    // TODO: 实现operator==（用于无序容器）
    bool operator==(const Book& other) const {
        // TODO: 按ISBN判断相等
        return false;
    }
};

// TODO: 实现按ISBN比较的仿函数（用于有序容器）
struct CompareByISBN {
    bool operator()(const Book& a, const Book& b) const {
        // TODO: 实现比较逻辑
        return false;
    }
};

// TODO: 实现Book的哈希函数（用于无序容器）
struct BookHash {
    std::size_t operator()(const Book& b) const {
        // TODO: 实现哈希函数
        return 0;
    }
};

int main() {
    // 测试有序容器
    std::set<Book, CompareByISBN> bookSet;
    
    bookSet.insert({"978-0-13-468599-1", "The C++ Programming Language", "Bjarne Stroustrup", 59.99});
    bookSet.insert({"978-0-321-56384-2", "Effective Modern C++", "Scott Meyers", 49.99});
    bookSet.insert({"978-0-201-61562-3", "Effective C++", "Scott Meyers", 45.99});
    
    std::cout << "有序书籍集合（按ISBN）:" << std::endl;
    for (const auto& book : bookSet) {
        std::cout << book.isbn << " - " << book.title << std::endl;
    }
    
    // 测试无序容器
    std::unordered_set<Book, BookHash> bookUnorderedSet;
    
    bookUnorderedSet.insert({"978-0-13-468599-1", "The C++ Programming Language", "Bjarne Stroustrup", 59.99});
    bookUnorderedSet.insert({"978-0-321-56384-2", "Effective Modern C++", "Scott Meyers", 49.99});
    bookUnorderedSet.insert({"978-0-201-61562-3", "Effective C++", "Scott Meyers", 45.99});
    
    std::cout << "\\n无序书籍集合:" << std::endl;
    for (const auto& book : bookUnorderedSet) {
        std::cout << book.isbn << " - " << book.title << std::endl;
    }
    
    // 测试查找
    Book searchBook = {"978-0-321-56384-2", "", "", 0};
    
    auto it1 = bookSet.find(searchBook);
    if (it1 != bookSet.end()) {
        std::cout << "\\n有序集合中找到: " << it1->title << std::endl;
    }
    
    auto it2 = bookUnorderedSet.find(searchBook);
    if (it2 != bookUnorderedSet.end()) {
        std::cout << "无序集合中找到: " << it2->title << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `有序书籍集合（按ISBN）:
978-0-13-468599-1 - The C++ Programming Language
978-0-201-61562-3 - Effective C++
978-0-321-56384-2 - Effective Modern C++

无序书籍集合:
978-0-321-56384-2 - Effective Modern C++
978-0-201-61562-3 - Effective C++
978-0-13-468599-1 - The C++ Programming Language

有序集合中找到: Effective Modern C++
无序集合中找到: Effective Modern C++`,
                solutionRegex: 'isbn|hash|operator<|operator==',
                hint: '比较函数比较ISBN，哈希函数使用std::hash<std::string>()(isbn)',
                xp: 180
            },
            references: [
                { title: '自定义操作', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: '哈希函数', book: '算法导论', chapter: '第11章' }
            ],
            assistantTips: [
                '比较函数必须满足严格弱序',
                '哈希函数应尽量均匀分布',
                '使用std::tie简化多字段比较',
                '无序容器需要同时定义==和hash'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '有序容器需要定义什么？', 
                    options: [
                        { text: 'operator==' }, 
                        { text: 'operator<', correct: true }, 
                        { text: 'hash函数' }, 
                        { text: 'operator>' }
                    ], 
                    explanation: '有序容器默认使用operator<进行元素比较。' 
                },
                { 
                    type: 'single', 
                    question: '无序容器需要定义什么？', 
                    options: [
                        { text: 'operator<和hash函数' }, 
                        { text: 'operator==和hash函数', correct: true }, 
                        { text: 'operator<和operator==' }, 
                        { text: '只需要hash函数' }
                    ], 
                    explanation: '无序容器需要operator==判断相等，需要hash函数计算哈希值。' 
                },
                { 
                    type: 'single', 
                    question: '比较函数必须满足什么条件？', 
                    options: [
                        { text: '自反性' }, 
                        { text: '严格弱序', correct: true }, 
                        { text: '对称性' }, 
                        { text: '传递性' }
                    ], 
                    explanation: '比较函数必须满足严格弱序：反自反、反对称、传递。' 
                },
                { 
                    type: 'single', 
                    question: '好的哈希函数应该？', 
                    options: [
                        { text: '总是返回相同的值' }, 
                        { text: '分布均匀且计算快', correct: true }, 
                        { text: '计算复杂' }, 
                        { text: '只考虑部分字段' }
                    ], 
                    explanation: '好的哈希函数应该分布均匀以减少冲突，且计算速度快。' 
                },
                { 
                    type: 'single', 
                    question: '如何简化多字段比较？', 
                    options: [
                        { text: '使用多个if语句' }, 
                        { text: '使用std::tie', correct: true }, 
                        { text: '使用switch语句' }, 
                        { text: '使用循环' }
                    ], 
                    explanation: 'std::tie可以将多个字段组合成tuple进行比较，代码更简洁。' 
                }
            ]
        },
        {
            id: '16.6',
            title: '有序容器的查找、插入与删除',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 有序容器的查找、插入与删除

### 查找操作

#### 1. find

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

// find返回迭代器
auto it = s.find(5);
if (it != s.end()) {
    std::cout << "找到: " << *it << std::endl;
}

// 如果没找到，返回end()
auto it2 = s.find(4);
if (it2 == s.end()) {
    std::cout << "未找到" << std::endl;
}
\`\`\`

#### 2. count

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

// count返回元素个数
if (s.count(5) > 0) {
    std::cout << "元素存在" << std::endl;
}

// 对于set，count返回0或1
// 对于multiset，返回实际个数
\`\`\`

#### 3. lower_bound

返回第一个**不小于**给定值的元素：

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

auto it = s.lower_bound(5);  // 指向5
std::cout << *it << std::endl;  // 5

auto it2 = s.lower_bound(6);  // 指向7（第一个>=6的元素）
std::cout << *it2 << std::endl;  // 7

auto it3 = s.lower_bound(10);  // 返回end()
if (it3 == s.end()) {
    std::cout << "没有大于等于10的元素" << std::endl;
}
\`\`\`

#### 4. upper_bound

返回第一个**大于**给定值的元素：

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

auto it = s.upper_bound(5);  // 指向7（第一个>5的元素）
std::cout << *it << std::endl;  // 7

auto it2 = s.upper_bound(6);  // 指向7
std::cout << *it2 << std::endl;  // 7
\`\`\`

#### 5. equal_range

返回一个pair，包含lower_bound和upper_bound：

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

auto range = s.equal_range(5);
// range.first == lower_bound(5) -> 指向5
// range.second == upper_bound(5) -> 指向7

// 遍历等于5的所有元素
for (auto it = range.first; it != range.second; ++it) {
    std::cout << *it << " ";
}
\`\`\`

### 插入操作

#### 1. insert

\`\`\`cpp
std::set<int> s;

// 插入单个元素，返回pair<iterator, bool>
auto result = s.insert(5);
if (result.second) {
    std::cout << "插入成功" << std::endl;
    std::cout << "元素: " << *result.first << std::endl;
}

// 插入重复元素
auto result2 = s.insert(5);
if (!result2.second) {
    std::cout << "元素已存在，插入失败" << std::endl;
}

// 插入多个元素
s.insert({1, 2, 3, 4});

// 插入迭代器范围
std::vector<int> vec = {6, 7, 8};
s.insert(vec.begin(), vec.end());
\`\`\`

#### 2. emplace

原地构造元素，避免临时对象：

\`\`\`cpp
std::set<std::pair<int, std::string>> s;

// insert需要创建临时对象
s.insert(std::make_pair(1, "Hello"));

// emplace直接构造
s.emplace(2, "World");  // 更高效
\`\`\`

#### 3. 带提示的插入

\`\`\`cpp
std::set<int> s = {1, 5, 10};

// 提示插入位置
auto hint = s.find(5);
auto it = s.insert(hint, 7);  // 提示7应该在5附近

// 如果提示正确，可以提高插入效率
// 如果提示错误，仍会正确插入，但效率不提高
\`\`\`

### 删除操作

#### 1. 按值删除

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 返回删除的元素个数
size_t count = s.erase(3);  // count = 1

// 对于multiset
std::multiset<int> ms = {1, 2, 2, 2, 3};
size_t count2 = ms.erase(2);  // count2 = 3（删除所有2）
\`\`\`

#### 2. 按迭代器删除

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

auto it = s.find(3);
if (it != s.end()) {
    s.erase(it);  // 删除迭代器指向的元素
}

// C++11：erase返回下一个有效迭代器
auto next = s.erase(s.begin());
\`\`\`

#### 3. 删除范围

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 删除[begin, lower_bound(5))范围的元素
s.erase(s.begin(), s.lower_bound(5));
// 删除了1, 2, 3, 4

// 删除所有大于等于5的元素
s.erase(s.lower_bound(5), s.end());
\`\`\`

#### 4. 清空

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

s.clear();  // 清空所有元素
std::cout << s.size() << std::endl;  // 0
\`\`\`

### 区间操作

#### 1. 查找区间内的元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 查找[3, 7]范围内的元素
auto lower = s.lower_bound(3);  // 第一个>=3
auto upper = s.upper_bound(7);  // 第一个>7

std::cout << "区间[3, 7]内的元素: ";
for (auto it = lower; it != upper; ++it) {
    std::cout << *it << " ";  // 3 4 5 6 7
}
std::cout << std::endl;
\`\`\`

#### 2. 删除区间内的元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 删除[3, 7]范围内的元素
s.erase(s.lower_bound(3), s.upper_bound(7));
// 删除了3, 4, 5, 6, 7
\`\`\`

#### 3. 统计区间内的元素个数

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 统计[3, 7]范围内的元素个数
auto lower = s.lower_bound(3);
auto upper = s.upper_bound(7);
size_t count = std::distance(lower, upper);
std::cout << "区间[3, 7]内的元素个数: " << count << std::endl;  // 5
\`\`\`

### multiset的特殊操作

\`\`\`cpp
std::multiset<int> ms = {1, 2, 2, 2, 3, 3, 4, 5};

// count返回实际个数
std::cout << "2的个数: " << ms.count(2) << std::endl;  // 3

// equal_range获取所有匹配元素
auto range = ms.equal_range(2);
std::cout << "所有2: ";
for (auto it = range.first; it != range.second; ++it) {
    std::cout << *it << " ";
}
std::cout << std::endl;

// 删除单个元素
auto it = ms.find(2);
if (it != ms.end()) {
    ms.erase(it);  // 只删除一个2
}

// 删除所有匹配元素
ms.erase(2);  // 删除所有2
\`\`\`

### 性能考虑

#### 1. 使用正确的查找方法

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 好：使用find
auto it = s.find(3);

// 不好：使用count后find
if (s.count(3) > 0) {
    auto it = s.find(3);  // 查找了两次
}
\`\`\`

#### 2. 使用lower_bound/upper_bound做范围查询

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 好：使用lower_bound和upper_bound
auto lower = s.lower_bound(3);
auto upper = s.upper_bound(7);

// 不好：遍历所有元素
for (int val : s) {
    if (val >= 3 && val <= 7) {
        // ...
    }
}
\`\`\`

#### 3. 使用提示提高插入效率

\`\`\`cpp
std::set<int> s;

// 如果知道插入位置，使用提示
auto hint = s.end();
for (int i = 0; i < 1000; ++i) {
    hint = s.insert(hint, i);  // 提示在末尾插入
}
\`\`\`

### 实际应用示例

#### 1. 维护有序数据

\`\`\`cpp
class SortedData {
private:
    std::set<int> data;
    
public:
    void add(int value) {
        data.insert(value);
    }
    
    void remove(int value) {
        data.erase(value);
    }
    
    bool contains(int value) const {
        return data.count(value) > 0;
    }
    
    std::vector<int> getRange(int low, int high) const {
        std::vector<int> result;
        auto start = data.lower_bound(low);
        auto end = data.upper_bound(high);
        for (auto it = start; it != end; ++it) {
            result.push_back(*it);
        }
        return result;
    }
};
\`\`\`

#### 2. 查找最近的元素

\`\`\`cpp
int findNearest(const std::set<int>& s, int target) {
    auto it = s.lower_bound(target);
    
    if (it == s.end()) {
        // 所有元素都小于target
        return *s.rbegin();
    }
    
    if (it == s.begin()) {
        // 所有元素都大于等于target
        return *it;
    }
    
    // 比较it和it-1哪个更接近target
    auto prev = std::prev(it);
    if (target - *prev <= *it - target) {
        return *prev;
    }
    return *it;
}
\`\`\`

### 最佳实践

#### 1. 使用正确的查找方法

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 推荐：直接使用 find
auto it = s.find(3);
if (it != s.end()) {
    std::cout << "找到: " << *it << std::endl;
}

// 不推荐：先 count 再 find（查找两次）
if (s.count(3) > 0) {
    auto it = s.find(3);  // 重复查找
}

// 不推荐：遍历查找（效率低）
for (int val : s) {
    if (val == 3) {
        // ...
    }
}
\`\`\`

#### 2. 使用 lower_bound/upper_bound 做范围操作

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9, 11, 13};

// 推荐：使用 lower_bound 和 upper_bound
auto start = s.lower_bound(5);   // 第一个 >= 5
auto end = s.upper_bound(11);    // 第一个 > 11

// 遍历 [5, 11] 范围
for (auto it = start; it != end; ++it) {
    std::cout << *it << " ";  // 5 7 9 11
}

// 删除 [5, 11] 范围
s.erase(start, end);

// 不推荐：遍历所有元素
for (int val : s) {
    if (val >= 5 && val <= 11) {
        // ...
    }
}
\`\`\`

#### 3. 使用带提示的插入提高效率

\`\`\`cpp
std::set<int> s;

// 推荐：如果知道插入位置，使用提示
auto hint = s.end();
for (int i = 0; i < 1000; ++i) {
    hint = s.insert(hint, i);  // 提示在末尾插入
}

// 不推荐：不使用提示
for (int i = 0; i < 1000; ++i) {
    s.insert(i);  // 每次都要查找插入位置
}
\`\`\`

#### 4. 使用 emplace 提高插入效率

\`\`\`cpp
std::set<std::pair<int, std::string>> s;

// 推荐：使用 emplace 原地构造
s.emplace(1, "One");

// 不推荐：创建临时对象
s.insert(std::make_pair(2, "Two"));
\`\`\`

#### 5. 检查插入是否成功

\`\`\`cpp
std::set<int> s;

// 推荐：检查返回值
auto result = s.insert(5);
if (result.second) {
    std::cout << "插入成功" << std::endl;
} else {
    std::cout << "元素已存在" << std::endl;
}

// 不推荐：忽略返回值
s.insert(5);  // 不知道是否成功
\`\`\`

### 常见错误

#### 1. 在遍历时删除元素

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5};

// 错误：遍历时删除导致迭代器失效
for (auto it = s.begin(); it != s.end(); ++it) {
    if (*it % 2 == 0) {
        s.erase(it);  // 错误！it 失效
    }
}

// 正确：使用 erase 的返回值
for (auto it = s.begin(); it != s.end(); ) {
    if (*it % 2 == 0) {
        it = s.erase(it);  // erase 返回下一个有效迭代器
    } else {
        ++it;
    }
}

// 或者：先收集要删除的元素
std::vector<int> toRemove;
for (int val : s) {
    if (val % 2 == 0) {
        toRemove.push_back(val);
    }
}
for (int val : toRemove) {
    s.erase(val);
}
\`\`\`

#### 2. 混淆 lower_bound 和 upper_bound

\`\`\`cpp
std::set<int> s = {1, 3, 5, 7, 9};

// 错误：混淆两者
auto it1 = s.lower_bound(5);  // 第一个 >= 5，指向 5
auto it2 = s.upper_bound(5);  // 第一个 > 5，指向 7

// 常见错误：用 upper_bound 查找元素
auto it = s.upper_bound(5);  // 指向 7，不是 5！
if (it != s.end() && *it == 5) {  // 条件不成立
    // ...
}

// 正确：用 find 或 lower_bound 查找元素
auto it = s.find(5);  // 正确
auto it = s.lower_bound(5);  // 也可以，但要检查
\`\`\`

#### 3. multiset 的 erase 删除所有匹配元素

\`\`\`cpp
std::multiset<int> ms = {1, 2, 2, 2, 3};

// 错误：erase 删除所有匹配元素
ms.erase(2);  // 删除所有 2，剩下 {1, 3}

// 正确：只删除一个元素
auto it = ms.find(2);
if (it != ms.end()) {
    ms.erase(it);  // 只删除一个 2
}
\`\`\`

#### 4. 忘记检查 find 的返回值

\`\`\`cpp
std::set<int> s = {1, 2, 3};

// 错误：不检查返回值
auto it = s.find(5);
// std::cout << *it << std::endl;  // 未定义行为！

// 正确：检查返回值
auto it = s.find(5);
if (it != s.end()) {
    std::cout << *it << std::endl;
} else {
    std::cout << "未找到" << std::endl;
}
\`\`\`

#### 5. 使用错误的删除范围

\`\`\`cpp
std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 错误：删除范围不正确
s.erase(s.lower_bound(5), s.lower_bound(5));  // 什么都没删除

// 正确：删除 [5, 7] 范围
s.erase(s.lower_bound(5), s.upper_bound(7));  // 删除 5, 6, 7

// 错误：删除所有 >= 5 的元素
s.erase(s.begin(), s.lower_bound(5));  // 删除 < 5 的元素

// 正确：删除所有 >= 5 的元素
s.erase(s.lower_bound(5), s.end());
\`\`\`

### 深入理解

#### 1. 查找操作的时间复杂度

\`\`\`cpp
// set 和 map 的查找操作都是 O(log n)
// 因为底层是红黑树（平衡二叉搜索树）

std::set<int> s;
for (int i = 0; i < 1000000; ++i) {
    s.insert(i);
}

// find：O(log n)
auto it = s.find(500000);  // 最多比较 20 次（log2(1000000) ≈ 20）

// count：O(log n)
s.count(500000);  // 与 find 相同

// lower_bound：O(log n)
s.lower_bound(500000);

// upper_bound：O(log n)
s.upper_bound(500000);

// 对比：vector 的 find 是 O(n)
std::vector<int> v;
for (int i = 0; i < 1000000; ++i) {
    v.push_back(i);
}
std::find(v.begin(), v.end(), 500000);  // 平均比较 500000 次
\`\`\`

#### 2. 插入操作的时间复杂度

\`\`\`cpp
// 插入操作：O(log n)
// 包括：
// 1. 查找插入位置：O(log n)
// 2. 插入元素：O(1)
// 3. 重新平衡树：O(log n)

std::set<int> s;

// 普通插入
s.insert(5);  // O(log n)

// 带提示的插入
auto hint = s.end();
s.insert(hint, 10);  // 如果提示正确，O(1)；否则 O(log n)

// 批量插入
s.insert({1, 2, 3, 4, 5});  // m 个元素，O(m log(n+m))

// emplace
s.emplace(20);  // O(log n)，但避免临时对象
\`\`\`

#### 3. 删除操作的时间复杂度

\`\`\`cpp
// 删除操作：O(log n)
// 包括：
// 1. 查找元素：O(log n)
// 2. 删除元素：O(1)
// 3. 重新平衡树：O(log n)

std::set<int> s = {1, 2, 3, 4, 5};

// 按值删除
s.erase(3);  // O(log n)

// 按迭代器删除
auto it = s.find(2);
s.erase(it);  // O(1)（不需要查找）

// 删除范围
s.erase(s.begin(), s.end());  // O(n)

// multiset 的删除
std::multiset<int> ms = {1, 2, 2, 2, 3};
ms.erase(2);  // O(log n + m)，m 是匹配元素数量
\`\`\`

#### 4. 迭代器的稳定性

\`\`\`cpp
// set 和 map 的迭代器在插入和删除时保持稳定
// 除了被删除的元素

std::set<int> s = {1, 2, 3, 4, 5};

auto it1 = s.find(3);
auto it2 = s.find(4);

s.insert(10);  // it1 和 it2 仍然有效
s.erase(5);    // it1 和 it2 仍然有效
s.erase(3);    // it1 失效，it2 仍然有效

// 这与 vector 不同
std::vector<int> v = {1, 2, 3, 4, 5};
auto vit = v.begin() + 2;
v.push_back(10);  // vit 可能失效（重新分配）
\`\`\`

#### 5. 性能优化技巧

\`\`\`cpp
// 1. 使用正确的容器
// 需要有序：set/map
// 只需要查找：unordered_set/unordered_map

// 2. 使用提示插入
std::set<int> s;
auto hint = s.end();
for (int i = 0; i < 10000; ++i) {
    hint = s.insert(hint, i);  // 提高插入效率
}

// 3. 使用 emplace
std::set<std::pair<int, std::string>> s;
s.emplace(1, "One");  // 避免临时对象

// 4. 批量操作
std::vector<int> vec = {1, 2, 3, 4, 5};
std::set<int> s(vec.begin(), vec.end());  // 一次性构造

// 5. 避免不必要的查找
std::set<int> s;
auto result = s.insert(5);
if (!result.second) {
    // 插入失败，元素已存在
    // result.first 是现有元素的迭代器
}
\`\`\``,
            examples: [
                {
                    title: '查找操作示例',
                    code: `#include <iostream>
#include <set>

int main() {
    std::set<int> s = {1, 3, 5, 7, 9, 11, 13, 15};
    
    std::cout << "集合内容: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // find
    std::cout << "\\nfind操作:" << std::endl;
    auto it = s.find(7);
    if (it != s.end()) {
        std::cout << "find(7) = " << *it << std::endl;
    }
    
    it = s.find(8);
    std::cout << "find(8) = " << (it == s.end() ? "未找到" : "找到") << std::endl;
    
    // lower_bound
    std::cout << "\\nlower_bound操作:" << std::endl;
    std::cout << "lower_bound(7) = " << *s.lower_bound(7) << std::endl;
    std::cout << "lower_bound(8) = " << *s.lower_bound(8) << std::endl;
    
    // upper_bound
    std::cout << "\\nupper_bound操作:" << std::endl;
    std::cout << "upper_bound(7) = " << *s.upper_bound(7) << std::endl;
    std::cout << "upper_bound(8) = " << *s.upper_bound(8) << std::endl;
    
    // equal_range
    std::cout << "\\nequal_range操作:" << std::endl;
    auto range = s.equal_range(7);
    std::cout << "equal_range(7): [" << *range.first << ", " << *range.second << ")" << std::endl;
    
    // 区间查询
    std::cout << "\\n区间[5, 11]内的元素: ";
    auto lower = s.lower_bound(5);
    auto upper = s.upper_bound(11);
    for (auto it = lower; it != upper; ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示set的各种查找操作。'
                },
                {
                    title: '插入和删除操作',
                    code: `#include <iostream>
#include <set>

int main() {
    std::set<int> s;
    
    // 插入操作
    std::cout << "插入操作:" << std::endl;
    
    auto result1 = s.insert(5);
    std::cout << "插入5: " << (result1.second ? "成功" : "失败") << std::endl;
    
    auto result2 = s.insert(5);
    std::cout << "再次插入5: " << (result2.second ? "成功" : "失败") << std::endl;
    
    s.insert({1, 2, 3, 4});
    std::cout << "批量插入后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // emplace
    s.emplace(6);
    std::cout << "emplace(6)后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 删除操作
    std::cout << "\\n删除操作:" << std::endl;
    
    size_t count = s.erase(5);
    std::cout << "删除5，删除了" << count << "个元素" << std::endl;
    
    auto it = s.find(3);
    if (it != s.end()) {
        s.erase(it);
        std::cout << "通过迭代器删除3" << std::endl;
    }
    
    std::cout << "删除后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 删除范围
    s.insert({10, 20, 30, 40, 50});
    std::cout << "\\n插入更多元素后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    s.erase(s.lower_bound(10), s.upper_bound(30));
    std::cout << "删除[10, 30]范围后: ";
    for (int val : s) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示set的插入和删除操作。'
                }
            ],
            handsOn: {
                title: '实现区间统计功能',
                description: '使用set实现区间统计、查找最近元素等功能。',
                initialCode: `#include <iostream>
#include <set>
#include <vector>
#include <cmath>
#include <climits>

class NumberSet {
private:
    std::set<int> numbers;
    
public:
    // TODO: 添加数字
    void add(int num) {
        // TODO: 实现添加功能
    }
    
    // TODO: 删除数字
    bool remove(int num) {
        // TODO: 实现删除功能
        return false;
    }
    
    // TODO: 检查数字是否存在
    bool contains(int num) const {
        // TODO: 实现查找功能
        return false;
    }
    
    // TODO: 获取区间内的所有数字
    std::vector<int> getRange(int low, int high) const {
        // TODO: 返回[low, high]范围内的所有数字
        return {};
    }
    
    // TODO: 统计区间内的数字个数
    size_t countRange(int low, int high) const {
        // TODO: 返回[low, high]范围内的数字个数
        return 0;
    }
    
    // TODO: 查找最接近target的数字
    int findNearest(int target) const {
        // TODO: 返回最接近target的数字
        // 如果集合为空，返回INT_MIN
        return INT_MIN;
    }
    
    // TODO: 查找第一个大于等于target的数字
    int findFirstGreaterEqual(int target) const {
        // TODO: 返回第一个>=target的数字
        // 如果不存在，返回INT_MAX
        return INT_MAX;
    }
    
    // TODO: 查找最后一个小于等于target的数字
    int findLastLessEqual(int target) const {
        // TODO: 返回最后一个<=target的数字
        // 如果不存在，返回INT_MIN
        return INT_MIN;
    }
    
    // 显示所有数字
    void display() const {
        std::cout << "数字集合: ";
        for (int num : numbers) {
            std::cout << num << " ";
        }
        std::cout << std::endl;
        std::cout << "大小: " << numbers.size() << std::endl;
    }
};

int main() {
    NumberSet ns;
    
    // 添加数字
    for (int i : {5, 2, 8, 1, 9, 3, 7, 4, 6, 10}) {
        ns.add(i);
    }
    std::cout << "初始状态:" << std::endl;
    ns.display();
    
    // 查找
    std::cout << "\\n查找操作:" << std::endl;
    std::cout << "包含5: " << (ns.contains(5) ? "是" : "否") << std::endl;
    std::cout << "包含11: " << (ns.contains(11) ? "是" : "否") << std::endl;
    
    // 区间查询
    std::cout << "\\n区间查询:" << std::endl;
    auto range = ns.getRange(3, 7);
    std::cout << "[3, 7]内的数字: ";
    for (int num : range) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    std::cout << "[3, 7]内的数字个数: " << ns.countRange(3, 7) << std::endl;
    
    // 查找最近
    std::cout << "\\n查找最近:" << std::endl;
    std::cout << "最接近6的数字: " << ns.findNearest(6) << std::endl;
    std::cout << "最接近11的数字: " << ns.findNearest(11) << std::endl;
    std::cout << "最接近0的数字: " << ns.findNearest(0) << std::endl;
    
    // 查找边界
    std::cout << "\\n查找边界:" << std::endl;
    std::cout << "第一个>=5的数字: " << ns.findFirstGreaterEqual(5) << std::endl;
    std::cout << "第一个>=11的数字: " << ns.findFirstGreaterEqual(11) << std::endl;
    std::cout << "最后一个<=5的数字: " << ns.findLastLessEqual(5) << std::endl;
    std::cout << "最后一个<=0的数字: " << ns.findLastLessEqual(0) << std::endl;
    
    // 删除
    ns.remove(5);
    std::cout << "\\n删除5后:" << std::endl;
    ns.display();
    
    return 0;
}`,
                expectedOutput: `初始状态:
数字集合: 1 2 3 4 5 6 7 8 9 10 
大小: 10

查找操作:
包含5: 是
包含11: 否

区间查询:
[3, 7]内的数字: 3 4 5 6 7 
[3, 7]内的数字个数: 5

查找最近:
最接近6的数字: 6
最接近11的数字: 10
最接近0的数字: 1

查找边界:
第一个>=5的数字: 5
第一个>=11的数字: 2147483647
最后一个<=5的数字: 5
最后一个<=0的数字: -2147483648

删除5后:
数字集合: 1 2 3 4 6 7 8 9 10 
大小: 9`,
                solutionRegex: 'insert|erase|find|count|lower_bound|upper_bound|begin|rbegin',
                hint: '使用lower_bound和upper_bound做区间查询，prev(it)获取前一个元素',
                xp: 200
            },
            references: [
                { title: '关联容器操作', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: '二分查找', book: '算法导论', chapter: '第12章' }
            ],
            assistantTips: [
                'lower_bound返回第一个>=给定值的元素',
                'upper_bound返回第一个>给定值的元素',
                'equal_range返回等于给定值的所有元素',
                '使用lower_bound/upper_bound做高效的范围查询'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'lower_bound(5)返回什么？', 
                    options: [
                        { text: '第一个等于5的元素' }, 
                        { text: '第一个大于5的元素' }, 
                        { text: '第一个不小于5的元素', correct: true }, 
                        { text: '最后一个小于5的元素' }
                    ], 
                    explanation: 'lower_bound返回第一个不小于（>=）给定值的元素。' 
                },
                { 
                    type: 'single', 
                    question: 'upper_bound(5)返回什么？', 
                    options: [
                        { text: '第一个等于5的元素' }, 
                        { text: '第一个大于5的元素', correct: true }, 
                        { text: '第一个不小于5的元素' }, 
                        { text: '最后一个小于5的元素' }
                    ], 
                    explanation: 'upper_bound返回第一个大于给定值的元素。' 
                },
                { 
                    type: 'single', 
                    question: 'set的insert返回什么？', 
                    options: [
                        { text: '迭代器' }, 
                        { text: 'bool' }, 
                        { text: 'pair<iterator, bool>', correct: true }, 
                        { text: 'void' }
                    ], 
                    explanation: 'insert返回pair，first是迭代器，second表示是否插入成功。' 
                },
                { 
                    type: 'single', 
                    question: '如何删除set中所有>=5的元素？', 
                    options: [
                        { text: 'erase(5, end())' }, 
                        { text: 'erase(lower_bound(5), end())', correct: true }, 
                        { text: 'erase(upper_bound(5), end())' }, 
                        { text: 'erase(begin(), lower_bound(5))' }
                    ], 
                    explanation: '使用erase(lower_bound(5), end())删除所有>=5的元素。' 
                },
                { 
                    type: 'single', 
                    question: 'multiset的erase(5)会删除几个元素？', 
                    options: [
                        { text: '1个' }, 
                        { text: '所有等于5的元素', correct: true }, 
                        { text: '第一个等于5的元素' }, 
                        { text: '最后一个等于5的元素' }
                    ], 
                    explanation: 'multiset的erase按值删除会删除所有匹配的元素。' 
                }
            ]
        },
        {
            id: '16.7',
            title: '桶管理与性能',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 桶管理与性能

### 无序容器的桶结构

无序容器使用哈希表实现，哈希表由多个桶组成：

\`\`\`
哈希表结构：
+----+    +----+----+----+
| 0  | -> | 5  | 10 | 15 |  桶0：存储哈希值%桶数为0的元素
+----+    +----+----+----+
| 1  | -> | 1  | 6  |
+----+    +----+----+
| 2  | -> | 2  |
+----+    +----+
| ...|
+----+
\`\`\`

### 桶接口

#### 1. 桶数量

\`\`\`cpp
#include <unordered_set>

std::unordered_set<int> us = {1, 2, 3, 4, 5};

// 当前桶数量
std::cout << "桶数量: " << us.bucket_count() << std::endl;

// 最大桶数量
std::cout << "最大桶数量: " << us.max_bucket_count() << std::endl;
\`\`\`

#### 2. 桶大小

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// 每个桶的元素数量
for (size_t i = 0; i < us.bucket_count(); ++i) {
    std::cout << "桶 " << i << ": " << us.bucket_size(i) << " 个元素" << std::endl;
}
\`\`\`

#### 3. 元素所在的桶

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5};

// 元素所在的桶索引
for (int val : us) {
    std::cout << val << " 在桶 " << us.bucket(val) << std::endl;
}
\`\`\`

#### 4. 遍历桶

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// 遍历所有桶
for (size_t i = 0; i < us.bucket_count(); ++i) {
    std::cout << "桶 " << i << ": ";
    for (auto it = us.begin(i); it != us.end(i); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
}
\`\`\`

### 负载因子

负载因子 = 元素数量 / 桶数量

\`\`\`cpp
std::unordered_set<int> us;

// 插入元素
for (int i = 0; i < 100; ++i) {
    us.insert(i);
}

// 当前负载因子
std::cout << "负载因子: " << us.load_factor() << std::endl;

// 最大负载因子（触发重哈希的阈值）
std::cout << "最大负载因子: " << us.max_load_factor() << std::endl;

// 设置最大负载因子
us.max_load_factor(0.5f);  // 降低阈值，减少冲突
\`\`\`

### 重哈希

当负载因子超过最大负载因子时，容器会自动重哈希：

\`\`\`cpp
std::unordered_set<int> us;

std::cout << "初始桶数量: " << us.bucket_count() << std::endl;

// 插入元素，观察桶数量变化
for (int i = 0; i < 100; ++i) {
    us.insert(i);
    if (i % 20 == 19) {
        std::cout << "插入" << (i+1) << "个元素后，桶数量: " << us.bucket_count() 
                  << "，负载因子: " << us.load_factor() << std::endl;
    }
}
\`\`\`

#### 手动重哈希

\`\`\`cpp
std::unordered_set<int> us;

// 设置桶数量至少为100
us.rehash(100);
std::cout << "rehash(100)后桶数量: " << us.bucket_count() << std::endl;

// 预留至少100个元素的空间
us.reserve(100);
std::cout << "reserve(100)后桶数量: " << us.bucket_count() << std::endl;
\`\`\`

### 性能优化

#### 1. 预分配空间

\`\`\`cpp
std::unordered_set<int> us;

// 坏：多次重哈希
for (int i = 0; i < 10000; ++i) {
    us.insert(i);  // 可能触发多次重哈希
}

// 好：预分配空间
std::unordered_set<int> us2;
us2.reserve(10000);  // 一次分配足够空间
for (int i = 0; i < 10000; ++i) {
    us2.insert(i);  // 不会重哈希
}
\`\`\`

#### 2. 调整负载因子

\`\`\`cpp
std::unordered_set<int> us;

// 默认最大负载因子通常是1.0
// 降低负载因子可以减少冲突，提高查找速度
us.max_load_factor(0.5f);

// 提高负载因子可以节省内存，但可能降低查找速度
us.max_load_factor(2.0f);
\`\`\`

#### 3. 选择好的哈希函数

\`\`\`cpp
// 坏的哈希函数：容易冲突
struct BadHash {
    std::size_t operator()(int x) const {
        return x % 10;  // 只用最后一位
    }
};

// 好的哈希函数：分布均匀
struct GoodHash {
    std::size_t operator()(int x) const {
        return std::hash<int>()(x);  // 使用标准库哈希
    }
};
\`\`\`

### 性能对比

\`\`\`cpp
#include <iostream>
#include <unordered_set>
#include <set>
#include <chrono>
#include <vector>
#include <random>

void performanceTest() {
    const int N = 100000;
    std::vector<int> data;
    
    // 生成随机数据
    std::random_device rd;
    std::mt19937 gen(rd());
    for (int i = 0; i < N; ++i) {
        data.push_back(gen());
    }
    
    // 测试unordered_set（无预分配）
    auto start = std::chrono::high_resolution_clock::now();
    std::unordered_set<int> us1;
    for (int val : data) {
        us1.insert(val);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "unordered_set（无预分配）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试unordered_set（有预分配）
    start = std::chrono::high_resolution_clock::now();
    std::unordered_set<int> us2;
    us2.reserve(N);
    for (int val : data) {
        us2.insert(val);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "unordered_set（有预分配）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试set
    start = std::chrono::high_resolution_clock::now();
    std::set<int> s;
    for (int val : data) {
        s.insert(val);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "set: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
}
\`\`\`

### 桶管理最佳实践

#### 1. 根据数据量预分配

\`\`\`cpp
// 如果知道大概的元素数量
std::unordered_set<int> us;
us.reserve(expected_size);

// 或者设置桶数量
us.rehash(expected_size / max_load_factor);
\`\`\`

#### 2. 监控负载因子

\`\`\`cpp
std::unordered_set<int> us;

// 插入元素后检查
for (int i = 0; i < 1000; ++i) {
    us.insert(i);
    
    if (i % 100 == 99) {
        std::cout << "元素数: " << us.size() 
                  << "，桶数: " << us.bucket_count()
                  << "，负载因子: " << us.load_factor() << std::endl;
    }
}
\`\`\`

#### 3. 分析桶分布

\`\`\`cpp
void analyzeBuckets(const std::unordered_set<int>& us) {
    std::cout << "桶数量: " << us.bucket_count() << std::endl;
    std::cout << "元素数量: " << us.size() << std::endl;
    std::cout << "负载因子: " << us.load_factor() << std::endl;
    
    // 统计桶大小分布
    std::map<size_t, size_t> bucketSizeCount;
    for (size_t i = 0; i < us.bucket_count(); ++i) {
        bucketSizeCount[us.bucket_size(i)]++;
    }
    
    std::cout << "\\n桶大小分布:" << std::endl;
    for (const auto& [size, count] : bucketSizeCount) {
        std::cout << "  大小" << size << ": " << count << "个桶" << std::endl;
    }
}
\`\`\`

### 内存占用

无序容器比有序容器占用更多内存：

\`\`\`cpp
#include <iostream>
#include <set>
#include <unordered_set>

int main() {
    const int N = 10000;
    
    std::set<int> s;
    std::unordered_set<int> us;
    
    for (int i = 0; i < N; ++i) {
        s.insert(i);
        us.insert(i);
    }
    
    // 注意：这只是估算
    std::cout << "set大约占用: " << sizeof(s) + N * sizeof(int) * 3 << " 字节" << std::endl;
    std::cout << "unordered_set桶数量: " << us.bucket_count() << std::endl;
    std::cout << "unordered_set大约占用: " << sizeof(us) + us.bucket_count() * sizeof(void*) + N * sizeof(int) * 2 << " 字节" << std::endl;
    
    return 0;
}
\`\`\`

### 选择建议

| 场景 | 推荐容器 |
|------|---------|
| 需要快速查找 | unordered_set/map |
| 需要有序遍历 | set/map |
| 内存敏感 | set/map |
| 需要范围查询 | set/map |
| 数据量大且查找频繁 | unordered_set/map（预分配） |
| 数据量小 | set/map（开销小） |

### 最佳实践

#### 1. 预分配空间避免重哈希

\`\`\`cpp
// 推荐：预分配空间
std::unordered_set<int> us;
us.reserve(10000);  // 预分配足够空间

for (int i = 0; i < 10000; ++i) {
    us.insert(i);  // 不会触发重哈希
}

// 不推荐：不预分配
std::unordered_set<int> us2;
for (int i = 0; i < 10000; ++i) {
    us2.insert(i);  // 可能多次重哈希，性能差
}
\`\`\`

#### 2. 监控负载因子

\`\`\`cpp
std::unordered_set<int> us;

for (int i = 0; i < 1000; ++i) {
    us.insert(i);
    
    // 监控负载因子
    if (us.load_factor() > 0.8) {
        std::cout << "负载因子过高: " << us.load_factor() << std::endl;
        // 考虑调整最大负载因子或预分配更多空间
    }
}

// 输出统计信息
std::cout << "元素数量: " << us.size() << std::endl;
std::cout << "桶数量: " << us.bucket_count() << std::endl;
std::cout << "负载因子: " << us.load_factor() << std::endl;
\`\`\`

#### 3. 调整最大负载因子

\`\`\`cpp
std::unordered_set<int> us;

// 默认最大负载因子通常是 1.0
std::cout << "默认最大负载因子: " << us.max_load_factor() << std::endl;

// 降低最大负载因子：减少冲突，提高查找速度，但增加内存占用
us.max_load_factor(0.5f);

// 提高最大负载因子：节省内存，但可能降低查找速度
// us.max_load_factor(2.0f);

for (int i = 0; i < 1000; ++i) {
    us.insert(i);
}

std::cout << "调整后负载因子: " << us.load_factor() << std::endl;
\`\`\`

#### 4. 分析桶分布

\`\`\`cpp
void analyzeBuckets(const std::unordered_set<int>& us) {
    std::cout << "=== 桶分析报告 ===" << std::endl;
    std::cout << "元素数量: " << us.size() << std::endl;
    std::cout << "桶数量: " << us.bucket_count() << std::endl;
    std::cout << "负载因子: " << us.load_factor() << std::endl;
    
    // 统计桶大小分布
    std::map<size_t, size_t> bucketSizeCount;
    size_t maxBucketSize = 0;
    size_t emptyBuckets = 0;
    
    for (size_t i = 0; i < us.bucket_count(); ++i) {
        size_t size = us.bucket_size(i);
        bucketSizeCount[size]++;
        maxBucketSize = std::max(maxBucketSize, size);
        if (size == 0) emptyBuckets++;
    }
    
    std::cout << "最大桶大小: " << maxBucketSize << std::endl;
    std::cout << "空桶数量: " << emptyBuckets << std::endl;
    
    std::cout << "\\n桶大小分布:" << std::endl;
    for (const auto& [size, count] : bucketSizeCount) {
        std::cout << "  " << count << " 个桶包含 " << size << " 个元素" << std::endl;
    }
}
\`\`\`

#### 5. 选择合适的容器

\`\`\`cpp
// 根据需求选择容器：

// 1. 需要快速查找，不关心顺序
std::unordered_map<int, std::string> fastLookup;

// 2. 需要有序遍历或范围查询
std::map<int, std::string> orderedMap;

// 3. 内存敏感
std::set<int> memoryEfficient;  // 比 unordered_set 占用内存少

// 4. 数据量大且查找频繁
std::unordered_set<int> largeDataSet;
largeDataSet.reserve(1000000);  // 预分配

// 5. 数据量小
std::set<int> smallDataSet;  // 开销小
\`\`\`

### 常见错误

#### 1. 忘记预分配空间

\`\`\`cpp
// 错误：不预分配，导致多次重哈希
std::unordered_set<int> us;
for (int i = 0; i < 100000; ++i) {
    us.insert(i);  // 可能触发多次重哈希
}

// 正确：预分配空间
std::unordered_set<int> us2;
us2.reserve(100000);  // 一次分配足够空间
for (int i = 0; i < 100000; ++i) {
    us2.insert(i);  // 不会重哈希
}
\`\`\`

#### 2. 忽略负载因子的影响

\`\`\`cpp
std::unordered_set<int> us;

// 错误：不关注负载因子
for (int i = 0; i < 10000; ++i) {
    us.insert(i);
}
// 负载因子可能很高，查找性能下降

// 正确：监控并调整负载因子
std::cout << "负载因子: " << us.load_factor() << std::endl;
if (us.load_factor() > 1.0) {
    us.max_load_factor(0.7);  // 降低最大负载因子
    us.rehash(us.size() / 0.7);  // 重新分配桶
}
\`\`\`

#### 3. 在重哈希后使用旧迭代器

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3};
auto it = us.begin();

// 错误：重哈希后迭代器失效
us.rehash(100);  // 重哈希
// std::cout << *it << std::endl;  // 未定义行为！

// 正确：重哈希后重新获取迭代器
us.rehash(100);
it = us.begin();  // 重新获取
\`\`\`

#### 4. 假设无序容器的遍历顺序

\`\`\`cpp
std::unordered_set<int> us = {1, 2, 3, 4, 5};

// 错误：假设遍历顺序
for (int val : us) {
    std::cout << val << " ";  // 顺序不确定！
}

// 正确：如果需要有序，使用有序容器
std::set<int> s = {1, 2, 3, 4, 5};
for (int val : s) {
    std::cout << val << " ";  // 1 2 3 4 5
}
\`\`\`

#### 5. 使用糟糕的哈希函数

\`\`\`cpp
// 错误：糟糕的哈希函数
struct BadHash {
    std::size_t operator()(int x) const {
        return x % 10;  // 只用最后一位，容易冲突
    }
};

std::unordered_set<int, BadHash> us;
for (int i = 0; i < 100; ++i) {
    us.insert(i);  // 大量冲突，性能差
}

// 正确：使用标准库哈希
std::unordered_set<int> us2;  // 使用默认哈希
\`\`\`

### 深入理解

#### 1. 哈希表的实现原理

\`\`\`cpp
// 无序容器使用哈希表实现
// 哈希表结构：
// 1. 桶数组：存储元素
// 2. 哈希函数：将元素映射到桶
// 3. 冲突解决：链表法或开放寻址法

// 插入过程：
// 1. 计算哈希值：hash = hash_function(key)
// 2. 计算桶索引：bucket = hash % bucket_count
// 3. 在桶中查找或插入元素

// 查找过程：
// 1. 计算哈希值和桶索引
// 2. 在桶中查找元素

// 时间复杂度：
// - 平均：O(1)
// - 最坏（所有元素在一个桶）：O(n)
\`\`\`

#### 2. 重哈希的触发条件

\`\`\`cpp
std::unordered_set<int> us;

// 重哈希触发条件：
// load_factor() > max_load_factor()

// 默认最大负载因子通常是 1.0
std::cout << "默认最大负载因子: " << us.max_load_factor() << std::endl;

// 插入元素，观察重哈希
for (int i = 0; i < 100; ++i) {
    size_t old_buckets = us.bucket_count();
    us.insert(i);
    size_t new_buckets = us.bucket_count();
    
    if (new_buckets != old_buckets) {
        std::cout << "重哈希: " << old_buckets << " -> " << new_buckets << std::endl;
        std::cout << "负载因子: " << us.load_factor() << std::endl;
    }
}
\`\`\`

#### 3. 桶分布与性能

\`\`\`cpp
std::unordered_set<int> us;

// 插入元素
for (int i = 0; i < 1000; ++i) {
    us.insert(i);
}

// 分析桶分布
size_t max_bucket_size = 0;
size_t empty_buckets = 0;

for (size_t i = 0; i < us.bucket_count(); ++i) {
    size_t size = us.bucket_size(i);
    max_bucket_size = std::max(max_bucket_size, size);
    if (size == 0) empty_buckets++;
}

std::cout << "最大桶大小: " << max_bucket_size << std::endl;
std::cout << "空桶数量: " << empty_buckets << std::endl;
std::cout << "负载因子: " << us.load_factor() << std::endl;

// 理想情况：桶大小均匀分布
// 最坏情况：所有元素在一个桶，退化为链表
\`\`\`

#### 4. 性能优化技巧

\`\`\`cpp
// 1. 预分配空间
std::unordered_set<int> us;
us.reserve(10000);  // 避免多次重哈希

// 2. 调整最大负载因子
us.max_load_factor(0.5);  // 降低冲突概率

// 3. 选择好的哈希函数
struct GoodHash {
    std::size_t operator()(const std::string& s) const {
        // 使用标准库哈希
        return std::hash<std::string>{}(s);
    }
};

// 4. 避免频繁插入删除
// 如果需要频繁插入删除，考虑使用其他容器

// 5. 监控性能
std::cout << "桶数量: " << us.bucket_count() << std::endl;
std::cout << "负载因子: " << us.load_factor() << std::endl;
\`\`\`

#### 5. 内存占用分析

\`\`\`cpp
// 无序容器的内存占用
// 1. 桶数组：bucket_count * sizeof(void*)
// 2. 元素节点：size * sizeof(Node)
// 3. 节点包含：元素 + 指针

// 对于 unordered_set<int>：
// - 桶数组：bucket_count * 8 字节
// - 节点：size * (4 + 8) 字节（int + 指针）
// - 总计：约 size * 20 字节（假设负载因子 1.0）

// 对于 unordered_map<int, int>：
// - 桶数组：bucket_count * 8 字节
// - 节点：size * (4 + 4 + 8) 字节（两个 int + 指针）
// - 总计：约 size * 24 字节

// 比有序容器占用更多内存
\`\`\``,
            examples: [
                {
                    title: '桶管理示例',
                    code: `#include <iostream>
#include <unordered_set>

int main() {
    std::unordered_set<int> us;
    
    // 插入元素
    for (int i = 0; i < 20; ++i) {
        us.insert(i);
    }
    
    std::cout << "元素数量: " << us.size() << std::endl;
    std::cout << "桶数量: " << us.bucket_count() << std::endl;
    std::cout << "负载因子: " << us.load_factor() << std::endl;
    std::cout << "最大负载因子: " << us.max_load_factor() << std::endl;
    
    // 显示每个桶的内容
    std::cout << "\\n桶内容:" << std::endl;
    for (size_t i = 0; i < us.bucket_count(); ++i) {
        if (us.bucket_size(i) > 0) {
            std::cout << "桶 " << i << ": ";
            for (auto it = us.begin(i); it != us.end(i); ++it) {
                std::cout << *it << " ";
            }
            std::cout << std::endl;
        }
    }
    
    // 元素所在的桶
    std::cout << "\\n元素所在的桶:" << std::endl;
    for (int i = 0; i < 10; ++i) {
        std::cout << i << " -> 桶" << us.bucket(i) << std::endl;
    }
    
    // 调整最大负载因子
    us.max_load_factor(0.5f);
    std::cout << "\\n设置最大负载因子为0.5后:" << std::endl;
    std::cout << "桶数量: " << us.bucket_count() << std::endl;
    std::cout << "负载因子: " << us.load_factor() << std::endl;
    
    return 0;
}`,
                    description: '展示无序容器的桶管理功能。'
                },
                {
                    title: '性能优化示例',
                    code: `#include <iostream>
#include <unordered_set>
#include <chrono>
#include <vector>
#include <random>

int main() {
    const int N = 100000;
    std::vector<int> data;
    
    // 生成随机数据
    std::random_device rd;
    std::mt19937 gen(rd());
    for (int i = 0; i < N; ++i) {
        data.push_back(gen());
    }
    
    // 测试1：无预分配
    auto start = std::chrono::high_resolution_clock::now();
    {
        std::unordered_set<int> us;
        for (int val : data) {
            us.insert(val);
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "无预分配插入" << N << "个元素: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试2：有预分配
    start = std::chrono::high_resolution_clock::now();
    {
        std::unordered_set<int> us;
        us.reserve(N);
        for (int val : data) {
            us.insert(val);
        }
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "有预分配插入" << N << "个元素: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 测试3：调整负载因子
    start = std::chrono::high_resolution_clock::now();
    {
        std::unordered_set<int> us;
        us.max_load_factor(0.3f);
        us.reserve(N);
        for (int val : data) {
            us.insert(val);
        }
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "低负载因子插入" << N << "个元素: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    // 查找性能测试
    std::unordered_set<int> us;
    us.reserve(N);
    for (int val : data) {
        us.insert(val);
    }
    
    int searchVal = data[N / 2];
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 10000; ++i) {
        us.find(searchVal);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "\\n查找10000次: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << "ms" << std::endl;
    
    return 0;
}`,
                    description: '展示无序容器的性能优化技巧。'
                }
            ],
            handsOn: {
                title: '分析桶分布',
                description: '实现一个工具来分析无序容器的桶分布情况。',
                initialCode: `#include <iostream>
#include <unordered_set>
#include <map>
#include <vector>
#include <random>

template<typename T>
class BucketAnalyzer {
private:
    std::unordered_set<T> data;
    
public:
    // TODO: 添加数据
    void add(const T& value) {
        // TODO: 实现添加数据
    }
    
    // TODO: 批量添加数据
    void add(const std::vector<T>& values) {
        // TODO: 实现批量添加
    }
    
    // TODO: 获取桶数量
    size_t getBucketCount() const {
        // TODO: 返回桶数量
        return 0;
    }
    
    // TODO: 获取元素数量
    size_t getSize() const {
        // TODO: 返回元素数量
        return 0;
    }
    
    // TODO: 获取负载因子
    float getLoadFactor() const {
        // TODO: 返回负载因子
        return 0.0f;
    }
    
    // TODO: 获取桶大小分布
    std::map<size_t, size_t> getBucketSizeDistribution() const {
        // TODO: 返回桶大小分布
        // key: 桶中元素数量, value: 有多少个桶是这个大小
        return {};
    }
    
    // TODO: 获取最大桶大小
    size_t getMaxBucketSize() const {
        // TODO: 返回最大桶中的元素数量
        return 0;
    }
    
    // TODO: 获取空桶数量
    size_t getEmptyBucketCount() const {
        // TODO: 返回空桶的数量
        return 0;
    }
    
    // TODO: 打印桶分析报告
    void printReport() const {
        // TODO: 打印详细的分析报告
        // 包括：元素数量、桶数量、负载因子、桶大小分布等
    }
};

int main() {
    BucketAnalyzer<int> analyzer;
    
    // 添加随机数据
    std::vector<int> data;
    std::random_device rd;
    std::mt19937 gen(rd());
    
    for (int i = 0; i < 100; ++i) {
        data.push_back(gen() % 1000);
    }
    
    analyzer.add(data);
    
    // 打印分析报告
    analyzer.printReport();
    
    // 获取桶大小分布
    auto distribution = analyzer.getBucketSizeDistribution();
    std::cout << "\\n桶大小分布:" << std::endl;
    for (const auto& [size, count] : distribution) {
        std::cout << "  " << count << " 个桶包含 " << size << " 个元素" << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `=== 桶分析报告 ===
元素数量: 100
桶数量: 128
负载因子: 0.78
最大桶大小: 4
空桶数量: 47

桶大小分布:
  47 个桶包含 0 个元素
  45 个桶包含 1 个元素
  25 个桶包含 2 个元素
  8 个桶包含 3 个元素
  3 个桶包含 4 个元素`,
                solutionRegex: 'bucket_count|bucket_size|load_factor|size|begin|end',
                hint: '使用bucket_count()获取桶数量，bucket_size(i)获取第i个桶的大小，load_factor()获取负载因子',
                xp: 180
            },
            references: [
                { title: '无序容器', book: 'C++ Primer 第五版', chapter: '第11章' },
                { title: '哈希表性能', book: '算法导论', chapter: '第11章' }
            ],
            assistantTips: [
                '预分配空间可以避免多次重哈希',
                '负载因子影响查找性能',
                '桶分布均匀说明哈希函数质量好',
                '监控桶大小分布可以优化性能'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '负载因子的计算公式是？', 
                    options: [
                        { text: '桶数量 / 元素数量' }, 
                        { text: '元素数量 / 桶数量', correct: true }, 
                        { text: '元素数量 * 桶数量' }, 
                        { text: '元素数量 + 桶数量' }
                    ], 
                    explanation: '负载因子 = 元素数量 / 桶数量，反映哈希表的填充程度。' 
                },
                { 
                    type: 'single', 
                    question: '何时会触发重哈希？', 
                    options: [
                        { text: '每次插入时' }, 
                        { text: '负载因子超过最大负载因子时', correct: true }, 
                        { text: '删除元素时' }, 
                        { text: '查找元素时' }
                    ], 
                    explanation: '当负载因子超过最大负载因子时，容器会自动重哈希以保持性能。' 
 
                },
                { 
                    type: 'single', 
                    question: 'reserve(100)的作用是？', 
                    options: [
                        { text: '设置桶数量为100' }, 
                        { text: '预留至少100个元素的空间', correct: true }, 
                        { text: '删除100个元素' }, 
                        { text: '设置最大负载因子为100' }
                    ], 
                    explanation: 'reserve(n)预留至少n个元素的空间，避免多次重哈希。' 
                },
                { 
                    type: 'single', 
                    question: '如何遍历特定桶中的元素？', 
                    options: [
                        { text: '使用begin()和end()' }, 
                        { text: '使用begin(n)和end(n)', correct: true }, 
                        { text: '使用bucket_begin(n)' }, 
                        { text: '使用at(n)' }
                    ], 
                    explanation: 'begin(n)和end(n)返回第n个桶的迭代器范围。' 
                },
                { 
                    type: 'single', 
                    question: '降低最大负载因子会怎样？', 
                    options: [
                        { text: '减少内存占用' }, 
                        { text: '增加桶数量，减少冲突', correct: true }, 
                        { text: '提高查找速度' }, 
                        { text: '减少元素数量' }
                    ], 
                    explanation: '降低最大负载因子会增加桶数量，减少哈希冲突，但会增加内存占用。' 
                }
            ]
        }
    ]
};

window.Unit16Data = Unit16Data;