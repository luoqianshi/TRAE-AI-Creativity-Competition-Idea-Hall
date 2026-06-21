/**
 * 单元17：迭代器与泛型算法
 */
const Unit17Data = {
    id: 17,
    title: '迭代器与泛型算法',
    description: '深入理解C++迭代器体系与标准库泛型算法，掌握lambda表达式与函数式编程技巧',
    lessons: [
        {
            id: '17.1',
            title: '迭代器种类：输入、输出、前向、双向、随机访问',
            duration: '40分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 迭代器种类

### 什么是迭代器？

迭代器是一种类似指针的对象，用于遍历容器中的元素。它提供了统一的访问方式，使得算法可以独立于容器类型工作。

\`\`\`cpp
#include <vector>
#include <iostream>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 使用迭代器遍历
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";  // 解引用获取元素
}
\`\`\`

### 五种迭代器类别

C++标准库定义了五种迭代器类别，从弱到强依次为：

#### 1. 输入迭代器（Input Iterator）

只能读取元素，单向前进，只能遍历一次。

\`\`\`cpp
#include <iostream>
#include <iterator>

// istream_iterator 是输入迭代器
std::istream_iterator<int> it(std::cin);  // 从cin读取
std::istream_iterator<int> eos;           // 结束迭代器

while (it != eos) {
    std::cout << *it << " ";
    ++it;
}
\`\`\`

**支持的操作**：
- \`++it\` / \`it++\`：前进到下一个元素
- \`*it\`：读取元素
- \`it == it2\` / \`it != it2\`：比较

#### 2. 输出迭代器（Output Iterator）

只能写入元素，单向前进，只能遍历一次。

\`\`\`cpp
#include <iterator>
#include <vector>

std::vector<int> vec;
std::ostream_iterator<int> out_it(std::cout, " ");

*out_it = 10;  // 输出10
*out_it = 20;  // 输出20
\`\`\`

**支持的操作**：
- \`++it\` / \`it++\`：前进
- \`*it = value\`：写入元素

#### 3. 前向迭代器（Forward Iterator）

可以读写元素，单向前进，可以多次遍历。

\`\`\`cpp
#include <forward_list>
#include <iostream>

std::forward_list<int> flist = {1, 2, 3, 4, 5};

// forward_list的迭代器是前向迭代器
for (auto it = flist.begin(); it != flist.end(); ++it) {
    *it *= 2;  // 可以读写
    std::cout << *it << " ";
}
\`\`\`

**支持的操作**：
- 输入迭代器的所有操作
- 输出迭代器的所有操作
- 可以多次遍历同一序列

#### 4. 双向迭代器（Bidirectional Iterator）

可以读写元素，双向移动（前进和后退）。

\`\`\`cpp
#include <list>
#include <iostream>

std::list<int> lst = {1, 2, 3, 4, 5};

// list的迭代器是双向迭代器
auto it = lst.end();
--it;  // 后退
std::cout << *it << std::endl;  // 5

for (auto it = lst.rbegin(); it != lst.rend(); ++it) {
    std::cout << *it << " ";  // 反向遍历
}
\`\`\`

**支持的操作**：
- 前向迭代器的所有操作
- \`--it\` / \`it--\`：后退

#### 5. 随机访问迭代器（Random Access Iterator）

可以读写元素，支持任意跳转，像指针一样使用。

\`\`\`cpp
#include <vector>
#include <iostream>

std::vector<int> vec = {10, 20, 30, 40, 50};

// vector的迭代器是随机访问迭代器
auto it = vec.begin();

std::cout << it[2] << std::endl;    // 30，下标访问
std::cout << *(it + 3) << std::endl; // 40，算术运算

it += 4;  // 跳转
std::cout << *it << std::endl;      // 50

std::cout << (vec.end() - vec.begin()) << std::endl; // 5，距离计算
\`\`\`

**支持的操作**：
- 双向迭代器的所有操作
- \`it + n\` / \`it - n\`：算术运算
- \`it += n\` / \`it -= n\`：复合赋值
- \`it[n]\`：下标访问
- \`it1 - it2\`：距离计算
- \`it1 < it2\` / \`it1 > it2\`等：关系比较

### 迭代器类别层次

\`\`\`
随机访问迭代器
    ↑
双向迭代器
    ↑
前向迭代器
    ↑
输入迭代器 / 输出迭代器
\`\`\`

### 各容器支持的迭代器类别

| 容器 | 迭代器类别 |
|------|-----------|
| vector | 随机访问 |
| deque | 随机访问 |
| array | 随机访问 |
| string | 随机访问 |
| list | 双向 |
| set/map | 双向 |
| forward_list | 前向 |

### 迭代器特性

\`\`\`cpp
#include <iterator>
#include <vector>
#include <list>

// 使用iterator_traits获取迭代器信息
template<typename Iterator>
void printIteratorCategory() {
    using category = typename std::iterator_traits<Iterator>::iterator_category;
    
    if constexpr (std::is_same_v<category, std::random_access_iterator_tag>) {
        std::cout << "随机访问迭代器" << std::endl;
    } else if constexpr (std::is_same_v<category, std::bidirectional_iterator_tag>) {
        std::cout << "双向迭代器" << std::endl;
    } else if constexpr (std::is_same_v<category, std::forward_iterator_tag>) {
        std::cout << "前向迭代器" << std::endl;
    }
}

// 使用示例
printIteratorCategory<std::vector<int>::iterator>();  // 随机访问迭代器
printIteratorCategory<std::list<int>::iterator>();    // 双向迭代器
\`\`\`

### begin()和end()函数

\`\`\`cpp
#include <iterator>

int arr[] = {1, 2, 3, 4, 5};

// 使用std::begin和std::end
auto it = std::begin(arr);  // 等价于 arr
auto end = std::end(arr);   // 等价于 arr + 5

// C++11：非成员函数版本
std::vector<int> vec = {1, 2, 3};
for (auto it = std::begin(vec); it != std::end(vec); ++it) {
    std::cout << *it << " ";
}

// C++11：cbegin和cend（返回const迭代器）
auto cit = vec.cbegin();  // std::vector<int>::const_iterator
\`\`\`

### 最佳实践

#### 1. 使用 auto 简化迭代器声明

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 推荐：使用 auto
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}

// 不推荐：显式写出完整类型
for (std::vector<int>::iterator it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
\`\`\`

#### 2. 使用 cbegin/cend 避免意外修改

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 推荐：使用 const 迭代器
void printVector(const std::vector<int>& v) {
    for (auto it = v.cbegin(); it != v.cend(); ++it) {
        std::cout << *it << " ";
        // *it = 10;  // 编译错误，不能修改
    }
}

// 不推荐：使用普通迭代器
void printVector2(const std::vector<int>& v) {
    for (auto it = v.begin(); it != v.end(); ++it) {  // 可能意外修改
        std::cout << *it << " ";
    }
}
\`\`\`

#### 3. 使用范围 for 循环简化遍历

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 推荐：使用范围 for 循环
for (int val : vec) {
    std::cout << val << " ";
}

// 或者使用 const 引用
for (const int& val : vec) {
    std::cout << val << " ";
}

// 需要修改元素时
for (int& val : vec) {
    val *= 2;
}
\`\`\`

#### 4. 根据容器选择合适的算法

\`\`\`cpp
// 随机访问容器：可以使用随机访问算法
std::vector<int> vec = {1, 2, 3, 4, 5};
std::sort(vec.begin(), vec.end());  // 高效

// 双向容器：只能使用双向算法
std::list<int> lst = {1, 2, 3, 4, 5};
lst.sort();  // 使用成员函数，不能使用 std::sort

// 前向容器：功能受限
std::forward_list<int> flist = {1, 2, 3, 4, 5};
flist.sort();  // 使用成员函数
\`\`\`

#### 5. 使用迭代器适配器

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 使用反向迭代器
for (auto it = vec.rbegin(); it != vec.rend(); ++it) {
    std::cout << *it << " ";  // 5 4 3 2 1
}

// 使用插入迭代器
std::vector<int> dest;
std::copy(vec.begin(), vec.end(), std::back_inserter(dest));
\`\`\`

### 常见错误

#### 1. 使用失效的迭代器

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 错误：插入元素后迭代器失效
auto it = vec.begin();
vec.push_back(6);  // 可能导致重新分配
// std::cout << *it << std::endl;  // 未定义行为！

// 正确：操作后重新获取迭代器
vec.push_back(6);
it = vec.begin();  // 重新获取
\`\`\`

#### 2. 混淆迭代器类别

\`\`\`cpp
std::list<int> lst = {1, 2, 3, 4, 5};

// 错误：list 不支持随机访问
auto it = lst.begin();
// it += 2;  // 编译错误！

// 正确：使用 ++ 操作
++it;
++it;

// 或者使用 std::advance
std::advance(it, 2);
\`\`\`

#### 3. 忘记检查迭代器是否到达 end()

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 错误：不检查 end()
auto it = vec.begin();
while (true) {
    std::cout << *it << " ";
    ++it;
    // 可能越界！
}

// 正确：检查 end()
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
\`\`\`

#### 4. 在遍历时修改容器结构

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 错误：遍历时删除元素
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it % 2 == 0) {
        vec.erase(it);  // 迭代器失效！
    }
}

// 正确：使用 erase 的返回值
for (auto it = vec.begin(); it != vec.end(); ) {
    if (*it % 2 == 0) {
        it = vec.erase(it);
    } else {
        ++it;
    }
}
\`\`\`

#### 5. 使用错误的迭代器类型

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 错误：使用 const 迭代器修改元素
auto cit = vec.cbegin();
// *cit = 10;  // 编译错误！

// 正确：使用普通迭代器
auto it = vec.begin();
*it = 10;  // 正确
\`\`\`

### 深入理解

#### 1. 迭代器的设计模式

\`\`\`cpp
// 迭代器模式：提供一种方法顺序访问聚合对象中的元素
// 而不暴露该对象的内部表示

// 迭代器的核心操作：
// 1. 解引用：*it
// 2. 前进：++it
// 3. 比较：it1 == it2
// 4. 赋值：it1 = it2

// 不同迭代器提供不同级别的功能：
// - 输入迭代器：只读，单向
// - 输出迭代器：只写，单向
// - 前向迭代器：读写，单向
// - 双向迭代器：读写，双向
// - 随机访问迭代器：读写，随机访问
\`\`\`

#### 2. 迭代器的性能考虑

\`\`\`cpp
// 随机访问迭代器：O(1) 跳转
std::vector<int> vec(1000000);
auto it = vec.begin();
it += 500000;  // O(1)

// 双向迭代器：O(n) 跳转
std::list<int> lst(1000000);
auto it2 = lst.begin();
std::advance(it2, 500000);  // O(n)

// 性能对比：
// - vector：随机访问快，插入删除慢
// - list：随机访问慢，插入删除快
// - forward_list：最省内存，但功能最少
\`\`\`

#### 3. 迭代器失效规则

\`\`\`cpp
// vector/deque：
// - 插入：可能导致所有迭代器失效（重新分配）
// - 删除：被删除元素之后的迭代器失效

std::vector<int> vec = {1, 2, 3, 4, 5};
auto it1 = vec.begin() + 2;  // 指向 3
vec.insert(vec.begin() + 1, 10);  // 可能导致 it1 失效

// list/forward_list：
// - 插入：不影响现有迭代器
// - 删除：只有被删除的迭代器失效

std::list<int> lst = {1, 2, 3, 4, 5};
auto it2 = lst.begin();
++it2;  // 指向 2
lst.insert(lst.begin(), 10);  // it2 仍然有效

// set/map：
// - 插入：不影响现有迭代器
// - 删除：只有被删除的迭代器失效
\`\`\`

#### 4. 迭代器与算法的关系

\`\`\`cpp
// 标准库算法根据迭代器类别选择最优实现

// std::sort 需要随机访问迭代器
std::vector<int> vec = {3, 1, 4, 1, 5, 9};
std::sort(vec.begin(), vec.end());  // 正确

// std::list<int> lst = {3, 1, 4, 1, 5, 9};
// std::sort(lst.begin(), lst.end());  // 编译错误！

// std::find 只需要输入迭代器
std::vector<int> vec2 = {1, 2, 3, 4, 5};
auto it = std::find(vec2.begin(), vec2.end(), 3);  // 正确

std::list<int> lst2 = {1, 2, 3, 4, 5};
auto it2 = std::find(lst2.begin(), lst2.end(), 3);  // 正确
\`\`\`

#### 5. 自定义迭代器

\`\`\`cpp
// 自定义迭代器需要满足迭代器要求
template<typename T>
class MyIterator {
private:
    T* ptr;
    
public:
    using iterator_category = std::random_access_iterator_tag;
    using value_type = T;
    using difference_type = std::ptrdiff_t;
    using pointer = T*;
    using reference = T&;
    
    // 构造函数
    MyIterator(T* p = nullptr) : ptr(p) {}
    
    // 解引用
    reference operator*() const { return *ptr; }
    pointer operator->() const { return ptr; }
    
    // 前进
    MyIterator& operator++() { ++ptr; return *this; }
    MyIterator operator++(int) { MyIterator tmp = *this; ++ptr; return tmp; }
    
    // 后退
    MyIterator& operator--() { --ptr; return *this; }
    MyIterator operator--(int) { MyIterator tmp = *this; --ptr; return tmp; }
    
    // 算术运算
    MyIterator& operator+=(difference_type n) { ptr += n; return *this; }
    MyIterator& operator-=(difference_type n) { ptr -= n; return *this; }
    MyIterator operator+(difference_type n) const { return MyIterator(ptr + n); }
    MyIterator operator-(difference_type n) const { return MyIterator(ptr - n); }
    difference_type operator-(const MyIterator& other) const { return ptr - other.ptr; }
    
    // 比较
    bool operator==(const MyIterator& other) const { return ptr == other.ptr; }
    bool operator!=(const MyIterator& other) const { return ptr != other.ptr; }
    bool operator<(const MyIterator& other) const { return ptr < other.ptr; }
};
\`\`\``,
            examples: [
                {
                    title: '迭代器类别演示',
                    code: `#include <iostream>
#include <vector>
#include <list>
#include <forward_list>
#include <iterator>

int main() {
    // 随机访问迭代器 - vector
    std::vector<int> vec = {10, 20, 30, 40, 50};
    std::cout << "=== 随机访问迭代器 (vector) ===" << std::endl;
    
    auto vit = vec.begin();
    std::cout << "it[2] = " << vit[2] << std::endl;      // 下标访问
    std::cout << "*(it+3) = " << *(vit + 3) << std::endl; // 算术运算
    
    vit += 4;
    std::cout << "it += 4 后: " << *vit << std::endl;
    
    std::cout << "it - begin = " << (vit - vec.begin()) << std::endl;
    
    // 双向迭代器 - list
    std::list<int> lst = {1, 2, 3, 4, 5};
    std::cout << "\\n=== 双向迭代器 (list) ===" << std::endl;
    
    auto lit = lst.end();
    --lit;
    std::cout << "从后向前遍历: ";
    while (lit != lst.begin()) {
        std::cout << *lit << " ";
        --lit;
    }
    std::cout << *lit << std::endl;
    
    // 前向迭代器 - forward_list
    std::forward_list<int> flst = {100, 200, 300};
    std::cout << "\\n=== 前向迭代器 (forward_list) ===" << std::endl;
    
    std::cout << "从前向后遍历: ";
    for (auto fit = flst.begin(); fit != flst.end(); ++fit) {
        std::cout << *fit << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示不同迭代器类别的特性。'
                },
                {
                    title: '迭代器与算法',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    std::cout << "原始数据: ";
    for (int val : vec) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 使用迭代器进行排序
    std::sort(vec.begin(), vec.end());
    
    std::cout << "排序后: ";
    for (int val : vec) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 使用迭代器查找
    auto it = std::find(vec.begin(), vec.end(), 5);
    if (it != vec.end()) {
        std::cout << "找到5，位置: " << (it - vec.begin()) << std::endl;
    }
    
    // 使用迭代器复制到输出流
    std::cout << "输出到cout: ";
    std::copy(vec.begin(), vec.end(), std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;
    
    // 使用迭代器反转部分元素
    std::reverse(vec.begin(), vec.begin() + 5);
    
    std::cout << "反转前5个: ";
    for (int val : vec) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示迭代器与标准库算法的配合使用。'
                }
            ],
            handsOn: {
                title: '迭代器操作练习',
                description: '练习使用不同类型的迭代器进行容器操作。',
                initialCode: `#include <iostream>
#include <vector>
#include <list>
#include <algorithm>

int main() {
    // 任务1：使用随机访问迭代器
    std::vector<int> vec = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    
    // TODO: 使用迭代器算术运算
    // 1. 获取第5个元素（使用下标访问）
    // 2. 计算begin到end的距离
    // 3. 让迭代器跳到第7个元素
    
    std::cout << "=== 随机访问迭代器操作 ===" << std::endl;
    // TODO: 输出结果
    
    // 任务2：使用双向迭代器
    std::list<int> lst = {1, 2, 3, 4, 5};
    
    // TODO: 使用双向迭代器反向遍历list
    // 从最后一个元素遍历到第一个元素
    
    std::cout << "\\n=== 双向迭代器操作 ===" << std::endl;
    // TODO: 输出反向遍历结果
    
    // 任务3：使用迭代器修改元素
    std::vector<int> nums = {1, 2, 3, 4, 5};
    
    // TODO: 使用迭代器将所有元素乘以2
    
    std::cout << "\\n=== 修改元素后 ===" << std::endl;
    // TODO: 输出修改后的结果
    
    return 0;
}`,
                expectedOutput: `=== 随机访问迭代器操作 ===
第5个元素: 50
距离: 10
第7个元素: 70

=== 双向迭代器操作 ===
反向遍历: 5 4 3 2 1 

=== 修改元素后 ===
2 4 6 8 10`,
                solutionRegex: '\\[|\\+|-|distance|\\*it|\\*\\s*=|--|rbegin|rend',
                hint: '随机访问用[]或+，双向用--，修改用*it = value',
                xp: 150
            },
            references: [
                { title: '迭代器', book: 'C++ Primer 第五版', chapter: '第9章' },
                { title: '迭代器类别', book: 'The C++ Standard Library', chapter: '第9章' }
            ],
            assistantTips: [
                '迭代器是连接容器和算法的桥梁',
                '随机访问迭代器功能最强大',
                'forward_list只支持前向迭代器',
                '使用auto简化迭代器声明'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '以下哪个容器支持随机访问迭代器？', 
                    options: [
                        { text: 'list' }, 
                        { text: 'forward_list' }, 
                        { text: 'vector', correct: true }, 
                        { text: 'set' }
                    ], 
                    explanation: 'vector、deque、array、string支持随机访问迭代器。' 
                },
                { 
                    type: 'single', 
                    question: '输入迭代器的特点是？', 
                    options: [
                        { text: '可以多次遍历' }, 
                        { text: '只能读取，单向前进，只能遍历一次', correct: true }, 
                        { text: '可以双向移动' }, 
                        { text: '支持随机访问' }
                    ], 
                    explanation: '输入迭代器只能读取元素，单向前进，且只能遍历一次。' 
                },
                { 
                    type: 'single', 
                    question: '双向迭代器相比前向迭代器多了什么功能？', 
                    options: [
                        { text: '随机访问' }, 
                        { text: '后退操作（--）', correct: true }, 
                        { text: '写入操作' }, 
                        { text: '下标访问' }
                    ], 
                    explanation: '双向迭代器可以前进和后退，前向迭代器只能前进。' 
                },
                { 
                    type: 'single', 
                    question: 'it + n 操作需要什么迭代器？', 
                    options: [
                        { text: '输入迭代器' }, 
                        { text: '前向迭代器' }, 
                        { text: '双向迭代器' }, 
                        { text: '随机访问迭代器', correct: true }
                    ], 
                    explanation: '只有随机访问迭代器支持算术运算（+、-、+=、-=）。' 
                },
                { 
                    type: 'single', 
                    question: 'cbegin()返回什么类型的迭代器？', 
                    options: [
                        { text: '普通迭代器' }, 
                        { text: 'const迭代器', correct: true }, 
                        { text: '反向迭代器' }, 
                        { text: '移动迭代器' }
                    ], 
                    explanation: 'cbegin()返回const迭代器，不能通过它修改元素。' 
                }
            ]
        },
        {
            id: '17.2',
            title: '插入迭代器、流迭代器、反向迭代器、移动迭代器',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 特殊迭代器

### 插入迭代器

插入迭代器是一种适配器，将赋值操作转换为插入操作。

#### back_inserter

在容器尾部插入元素：

\`\`\`cpp
#include <iterator>
#include <vector>
#include <algorithm>

std::vector<int> vec;
auto it = std::back_inserter(vec);

*it = 10;  // vec.push_back(10)
*it = 20;  // vec.push_back(20)

// 常用于算法
std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst;
std::copy(src.begin(), src.end(), std::back_inserter(dst));
\`\`\`

#### front_inserter

在容器首部插入元素：

\`\`\`cpp
#include <iterator>
#include <list>
#include <algorithm>

std::list<int> lst;
auto it = std::front_inserter(lst);

*it = 10;  // lst.push_front(10)
*it = 20;  // lst.push_front(20)

// 结果：20, 10（后插入的在前面）
\`\`\`

#### inserter

在指定位置插入元素：

\`\`\`cpp
#include <iterator>
#include <set>
#include <algorithm>

std::set<int> s = {1, 3, 5};
auto it = std::inserter(s, s.begin());

*it = 2;  // 在合适位置插入2
*it = 4;  // 在合适位置插入4

// 结果：1, 2, 3, 4, 5
\`\`\`

### 流迭代器

流迭代器将输入/输出流当作容器来处理。

#### istream_iterator

从输入流读取数据：

\`\`\`cpp
#include <iterator>
#include <iostream>
#include <vector>

// 从cin读取整数
std::istream_iterator<int> it(std::cin);
std::istream_iterator<int> eos;  // 结束迭代器（默认构造）

std::vector<int> vec;
while (it != eos) {
    vec.push_back(*it);
    ++it;
}

// 更简洁的方式
std::vector<int> vec2(std::istream_iterator<int>(std::cin), 
                       std::istream_iterator<int>());
\`\`\`

#### ostream_iterator

向输出流写入数据：

\`\`\`cpp
#include <iterator>
#include <iostream>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 输出到cout，用空格分隔
std::ostream_iterator<int> out_it(std::cout, " ");
for (int val : vec) {
    *out_it = val;  // 输出val
}

// 使用copy算法
std::copy(vec.begin(), vec.end(), std::ostream_iterator<int>(std::cout, ", "));
\`\`\`

### 反向迭代器

反向迭代器从后向前遍历容器。

\`\`\`cpp
#include <vector>
#include <iostream>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 使用rbegin和rend
for (auto it = vec.rbegin(); it != vec.rend(); ++it) {
    std::cout << *it << " ";  // 5 4 3 2 1
}

// 反向迭代器与普通迭代器的转换
auto rit = vec.rbegin();
auto it = rit.base();  // base()返回对应的普通迭代器
\`\`\`

#### 反向迭代器的base()

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

auto rit = vec.rbegin();  // 指向5
++rit;                     // 指向4
auto it = rit.base();      // 指向5

// rit和it.base()的关系：
// rit指向4，it.base()指向rit的下一个位置（5）
\`\`\`

### 移动迭代器（C++11）

移动迭代器将元素的访问转换为移动操作。

\`\`\`cpp
#include <iterator>
#include <vector>
#include <string>
#include <algorithm>

std::vector<std::string> src = {"Hello", "World", "C++"};
std::vector<std::string> dst;

// 使用移动迭代器移动元素
std::copy(std::make_move_iterator(src.begin()),
          std::make_move_iterator(src.end()),
          std::back_inserter(dst));

// src中的字符串被移动，变为空
\`\`\`

### 综合示例

\`\`\`cpp
#include <iostream>
#include <iterator>
#include <vector>
#include <list>
#include <algorithm>
#include <sstream>

int main() {
    // 插入迭代器
    std::vector<int> vec;
    std::fill_n(std::back_inserter(vec), 5, 10);  // 插入5个10
    
    // 流迭代器
    std::stringstream ss("1 2 3 4 5");
    std::vector<int> nums(std::istream_iterator<int>(ss), 
                          std::istream_iterator<int>());
    
    // 反向迭代器
    std::cout << "反向输出: ";
    std::copy(nums.rbegin(), nums.rend(), 
              std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;
    
    // 移动迭代器
    std::vector<std::string> src = {"a", "b", "c"};
    std::vector<std::string> dst;
    std::copy(std::make_move_iterator(src.begin()),
              std::make_move_iterator(src.end()),
              std::back_inserter(dst));
    
    return 0;
}
\`\`\``,
            examples: [
                {
                    title: '插入迭代器应用',
                    code: `#include <iostream>
#include <iterator>
#include <vector>
#include <list>
#include <algorithm>

int main() {
    std::vector<int> src = {1, 2, 3, 4, 5};
    
    // back_inserter
    std::vector<int> vec1;
    std::copy(src.begin(), src.end(), std::back_inserter(vec1));
    
    std::cout << "back_inserter结果: ";
    for (int val : vec1) std::cout << val << " ";
    std::cout << std::endl;
    
    // front_inserter
    std::list<int> lst;
    std::copy(src.begin(), src.end(), std::front_inserter(lst));
    
    std::cout << "front_inserter结果: ";
    for (int val : lst) std::cout << val << " ";
    std::cout << std::endl;
    
    // inserter
    std::list<int> lst2 = {10, 20, 30};
    auto it = std::inserter(lst2, ++lst2.begin());
    std::copy(src.begin(), src.begin() + 2, it);
    
    std::cout << "inserter结果: ";
    for (int val : lst2) std::cout << val << " ";
    std::cout << std::endl;
    
    // 使用插入迭代器填充
    std::vector<int> vec2;
    std::fill_n(std::back_inserter(vec2), 5, 100);
    
    std::cout << "fill_n结果: ";
    for (int val : vec2) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示三种插入迭代器的使用。'
                },
                {
                    title: '流迭代器与反向迭代器',
                    code: `#include <iostream>
#include <iterator>
#include <vector>
#include <sstream>
#include <algorithm>

int main() {
    // 使用stringstream模拟输入
    std::stringstream ss("10 20 30 40 50");
    
    // istream_iterator读取数据
    std::vector<int> vec(std::istream_iterator<int>(ss), 
                         std::istream_iterator<int>());
    
    std::cout << "从流读取的数据: ";
    std::copy(vec.begin(), vec.end(), 
              std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;
    
    // 反向迭代器
    std::cout << "反向输出: ";
    std::copy(vec.rbegin(), vec.rend(), 
              std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;
    
    // 使用反向迭代器查找
    auto rit = std::find(vec.rbegin(), vec.rend(), 30);
    if (rit != vec.rend()) {
        std::cout << "从后向前找到30，位置（从后数）: " 
                  << (rit - vec.rbegin()) << std::endl;
        
        // 转换为正向迭代器
        auto it = rit.base();
        std::cout << "对应的正向位置: " << (it - vec.begin()) << std::endl;
    }
    
    // 使用反向迭代器排序（降序）
    std::vector<int> vec2 = {5, 2, 8, 1, 9};
    std::sort(vec2.rbegin(), vec2.rend());
    
    std::cout << "降序排序: ";
    for (int val : vec2) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示流迭代器和反向迭代器的使用。'
                }
            ],
            handsOn: {
                title: '特殊迭代器实践',
                description: '使用各种特殊迭代器完成数据处理任务。',
                initialCode: `#include <iostream>
#include <iterator>
#include <vector>
#include <list>
#include <sstream>
#include <algorithm>
#include <string>

int main() {
    // 任务1：使用插入迭代器合并两个vector
    std::vector<int> v1 = {1, 2, 3};
    std::vector<int> v2 = {4, 5, 6};
    
    // TODO: 使用back_inserter将v2的元素追加到v1
    
    std::cout << "合并后的v1: ";
    // TODO: 输出v1
    
    // 任务2：使用流迭代器解析字符串
    std::string input = "apple banana cherry date";
    std::stringstream ss(input);
    
    // TODO: 使用istream_iterator读取单词到vector
    
    std::cout << "\\n解析的单词: ";
    // TODO: 使用ostream_iterator输出
    
    // 任务3：使用反向迭代器
    std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // TODO: 使用反向迭代器输出后5个元素（逆序输出10 9 8 7 6）
    
    std::cout << "\\n后5个元素（逆序）: ";
    // TODO: 输出结果
    
    // 任务4：使用front_inserter
    std::list<int> lst = {10, 20, 30};
    std::vector<int> toInsert = {1, 2, 3};
    
    // TODO: 使用front_inserter将toInsert插入到lst前面
    
    std::cout << "\\nfront_inserter结果: ";
    // TODO: 输出lst
    
    return 0;
}`,
                expectedOutput: `合并后的v1: 1 2 3 4 5 6 

解析的单词: apple banana cherry date 

后5个元素（逆序）: 10 9 8 7 6 

front_inserter结果: 3 2 1 10 20 30`,
                solutionRegex: 'back_inserter|front_inserter|istream_iterator|ostream_iterator|rbegin|rend|copy',
                hint: '使用back_inserter追加，istream_iterator读取，rbegin/rend反向，front_inserter插入前面',
                xp: 200
            },
            references: [
                { title: '迭代器适配器', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: '流迭代器', book: 'The C++ Standard Library', chapter: '第6章' }
            ],
            assistantTips: [
                'back_inserter最常用，配合copy算法',
                'front_inserter会逆序插入',
                '流迭代器可以简化IO操作',
                '反向迭代器的base()要注意偏移'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'back_inserter将赋值操作转换为什么？', 
                    options: [
                        { text: 'insert' }, 
                        { text: 'push_back', correct: true }, 
                        { text: 'push_front' }, 
                        { text: 'emplace' }
                    ], 
                    explanation: 'back_inserter将赋值转换为push_back操作。' 
                },
                { 
                    type: 'single', 
                    question: 'front_inserter可以用于哪些容器？', 
                    options: [
                        { text: 'vector' }, 
                        { text: 'list和deque', correct: true }, 
                        { text: 'array' }, 
                        { text: '所有容器' }
                    ], 
                    explanation: 'front_inserter需要容器支持push_front，只有list、deque、forward_list支持。' 
                },
                { 
                    type: 'single', 
                    question: 'istream_iterator的默认构造函数创建什么？', 
                    options: [
                        { text: '指向流开始的迭代器' }, 
                        { text: '结束迭代器（EOF）', correct: true }, 
                        { text: '空迭代器' }, 
                        { text: '错误迭代器' }
                    ], 
                    explanation: '默认构造的istream_iterator表示流结束。' 
                },
                { 
                    type: 'single', 
                    question: 'rbegin()返回什么？', 
                    options: [
                        { text: '指向第一个元素的迭代器' }, 
                        { text: '指向最后一个元素的迭代器', correct: true }, 
                        { text: '指向结束位置的迭代器' }, 
                        { text: '空迭代器' }
                    ], 
                    explanation: 'rbegin()返回指向最后一个元素的反向迭代器。' 
                },
                { 
                    type: 'single', 
                    question: '移动迭代器的作用是？', 
                    options: [
                        { text: '复制元素' }, 
                        { text: '移动元素而非复制', correct: true }, 
                        { text: '删除元素' }, 
                        { text: '交换元素' }
                    ], 
                    explanation: '移动迭代器将元素访问转换为移动操作，提高性能。' 
                }
            ]
        },
        {
            id: '17.3',
            title: '算法概览：只读算法、写算法、重排算法',
            duration: '45分钟',
            difficulty: '基础',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 标准库算法概览

C++标准库提供了超过100种算法，定义在\`<algorithm>\`头文件中。

### 算法的分类

1. **只读算法**：不修改序列中的元素
2. **写算法**：修改序列中的元素
3. **重排算法**：改变元素顺序

### 只读算法

#### find - 查找元素

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

auto it = std::find(vec.begin(), vec.end(), 3);
if (it != vec.end()) {
    std::cout << "找到: " << *it << std::endl;
}
\`\`\`

#### find_if - 条件查找

\`\`\`cpp
#include <algorithm>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 查找第一个大于3的元素
auto it = std::find_if(vec.begin(), vec.end(), [](int x) {
    return x > 3;
});
// it指向4
\`\`\`

#### count - 计数

\`\`\`cpp
#include <algorithm>

std::vector<int> vec = {1, 2, 3, 2, 1, 2};

int cnt = std::count(vec.begin(), vec.end(), 2);  // 3

// 条件计数
int cnt2 = std::count_if(vec.begin(), vec.end(), [](int x) {
    return x > 1;
});  // 4
\`\`\`

#### accumulate - 累加

\`\`\`cpp
#include <numeric>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

int sum = std::accumulate(vec.begin(), vec.end(), 0);  // 15

// 使用自定义操作
int product = std::accumulate(vec.begin(), vec.end(), 1, 
                              std::multiplies<int>());  // 120
\`\`\`

#### equal - 比较

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = {1, 2, 3};

bool same = std::equal(v1.begin(), v1.end(), v2.begin());  // true
\`\`\`

### 写算法

#### fill - 填充

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec(10);

std::fill(vec.begin(), vec.end(), 5);  // 全部填充为5
std::fill_n(vec.begin(), 5, 10);       // 前5个填充为10
\`\`\`

#### copy - 复制

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst(5);

std::copy(src.begin(), src.end(), dst.begin());

// copy_if - 条件复制
std::vector<int> dst2;
std::copy_if(src.begin(), src.end(), std::back_inserter(dst2),
             [](int x) { return x > 2; });  // 3, 4, 5
\`\`\`

#### transform - 变换

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst(5);

// 一元变换
std::transform(src.begin(), src.end(), dst.begin(), [](int x) {
    return x * 2;
});  // 2, 4, 6, 8, 10

// 二元变换
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = {4, 5, 6};
std::vector<int> result(3);

std::transform(v1.begin(), v1.end(), v2.begin(), result.begin(),
               std::plus<int>());  // 5, 7, 9
\`\`\`

#### replace - 替换

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 2, 4, 2};

std::replace(vec.begin(), vec.end(), 2, 10);  // 1, 10, 3, 10, 4, 10

// 条件替换
std::replace_if(vec.begin(), vec.end(), [](int x) { return x < 5; }, 0);
\`\`\`

### 重排算法

#### sort - 排序

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {5, 2, 8, 1, 9, 3};

std::sort(vec.begin(), vec.end());  // 升序：1, 2, 3, 5, 8, 9

// 自定义比较
std::sort(vec.begin(), vec.end(), std::greater<int>());  // 降序

// 使用lambda
std::sort(vec.begin(), vec.end(), [](int a, int b) {
    return a > b;  // 降序
});
\`\`\`

#### stable_sort - 稳定排序

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <string>

struct Person {
    std::string name;
    int age;
};

std::vector<Person> people = {{"Alice", 30}, {"Bob", 25}, {"Carol", 30}};

// 稳定排序：相同年龄的保持原有顺序
std::stable_sort(people.begin(), people.end(), 
                 [](const Person& a, const Person& b) {
                     return a.age < b.age;
                 });
\`\`\`

#### unique - 去重

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 1, 2, 2, 3, 3, 3, 4};

// 先排序（unique只去除相邻重复）
std::sort(vec.begin(), vec.end());

// 去重
auto last = std::unique(vec.begin(), vec.end());
vec.erase(last, vec.end());  // 删除重复元素

// 结果：1, 2, 3, 4
\`\`\`

#### reverse - 反转

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

std::reverse(vec.begin(), vec.end());  // 5, 4, 3, 2, 1
\`\`\`

#### rotate - 旋转

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 将前2个元素移到末尾
std::rotate(vec.begin(), vec.begin() + 2, vec.end());  // 3, 4, 5, 1, 2
\`\`\`

#### partition - 分区

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8};

// 将偶数放在前面
auto it = std::partition(vec.begin(), vec.end(), [](int x) {
    return x % 2 == 0;
});
// it指向第一个奇数
\`\`\`

### 算法复杂度

| 算法 | 复杂度 |
|------|--------|
| find | O(n) |
| sort | O(n log n) |
| stable_sort | O(n log n) |
| unique | O(n) |
| reverse | O(n) |
| rotate | O(n) |
| partition | O(n) |`,
            examples: [
                {
                    title: '只读算法示例',
                    code: `#include <iostream>
#include <algorithm>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> vec = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    
    // find
    auto it = std::find(vec.begin(), vec.end(), 5);
    if (it != vec.end()) {
        std::cout << "找到5，位置: " << (it - vec.begin()) << std::endl;
    }
    
    // find_if
    auto it2 = std::find_if(vec.begin(), vec.end(), [](int x) {
        return x > 5;
    });
    if (it2 != vec.end()) {
        std::cout << "第一个大于5的元素: " << *it2 << std::endl;
    }
    
    // count
    int cnt = std::count(vec.begin(), vec.end(), 5);
    std::cout << "5出现的次数: " << cnt << std::endl;
    
    // count_if
    int cnt2 = std::count_if(vec.begin(), vec.end(), [](int x) {
        return x % 2 == 0;
    });
    std::cout << "偶数个数: " << cnt2 << std::endl;
    
    // accumulate
    int sum = std::accumulate(vec.begin(), vec.end(), 0);
    std::cout << "总和: " << sum << std::endl;
    
    double avg = (double)sum / vec.size();
    std::cout << "平均值: " << avg << std::endl;
    
    // min_element / max_element
    auto minIt = std::min_element(vec.begin(), vec.end());
    auto maxIt = std::max_element(vec.begin(), vec.end());
    std::cout << "最小值: " << *minIt << ", 最大值: " << *maxIt << std::endl;
    
    return 0;
}`,
                    description: '展示常用的只读算法。'
                },
                {
                    title: '写算法与重排算法',
                    code: `#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    // 写算法示例
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    // transform
    std::transform(vec.begin(), vec.end(), vec.begin(), [](int x) {
        return x * x;
    });
    
    std::cout << "平方后: ";
    for (int val : vec) std::cout << val << " ";
    std::cout << std::endl;
    
    // replace
    std::vector<int> vec2 = {1, 2, 3, 2, 4, 2};
    std::replace(vec2.begin(), vec2.end(), 2, 10);
    
    std::cout << "替换后: ";
    for (int val : vec2) std::cout << val << " ";
    std::cout << std::endl;
    
    // 重排算法示例
    std::vector<int> vec3 = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // sort
    std::sort(vec3.begin(), vec3.end());
    std::cout << "\\n排序后: ";
    for (int val : vec3) std::cout << val << " ";
    std::cout << std::endl;
    
    // reverse
    std::reverse(vec3.begin(), vec3.end());
    std::cout << "反转后: ";
    for (int val : vec3) std::cout << val << " ";
    std::cout << std::endl;
    
    // unique
    std::vector<int> vec4 = {1, 1, 2, 2, 3, 3, 4};
    auto last = std::unique(vec4.begin(), vec4.end());
    vec4.erase(last, vec4.end());
    
    std::cout << "\\n去重后: ";
    for (int val : vec4) std::cout << val << " ";
    std::cout << std::endl;
    
    // partition
    std::vector<int> vec5 = {1, 2, 3, 4, 5, 6, 7, 8};
    auto partitionPoint = std::partition(vec5.begin(), vec5.end(), 
                                          [](int x) { return x % 2 == 0; });
    
    std::cout << "\\n分区后（偶数在前）: ";
    for (int val : vec5) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示写算法和重排算法的使用。'
                }
            ],
            handsOn: {
                title: '算法综合练习',
                description: '使用各种算法处理学生成绩数据。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <numeric>
#include <vector>
#include <string>

struct Student {
    std::string name;
    int score;
};

int main() {
    std::vector<Student> students = {
        {"张三", 85},
        {"李四", 92},
        {"王五", 78},
        {"赵六", 92},
        {"钱七", 65},
        {"孙八", 88}
    };
    
    // 任务1：计算平均分
    // TODO: 使用accumulate计算总分
    
    std::cout << "平均分: " << /* TODO */ << std::endl;
    
    // 任务2：查找最高分学生
    // TODO: 使用max_element
    
    std::cout << "最高分学生: " << /* TODO */ << std::endl;
    
    // 任务3：统计及格人数（>=60）
    // TODO: 使用count_if
    
    std::cout << "及格人数: " << /* TODO */ << std::endl;
    
    // 任务4：按成绩降序排序
    // TODO: 使用sort
    
    std::cout << "\\n按成绩排序:" << std::endl;
    // TODO: 输出排序结果
    
    // 任务5：找出所有90分以上的学生
    // TODO: 使用copy_if
    
    std::cout << "\\n90分以上的学生:" << std::endl;
    // TODO: 输出结果
    
    return 0;
}`,
                expectedOutput: `平均分: 83.3333
最高分学生: 李四
及格人数: 6

按成绩排序:
李四: 92
赵六: 92
孙八: 88
张三: 85
王五: 78
钱七: 65

90分以上的学生:
李四: 92
赵六: 92`,
                solutionRegex: 'accumulate|max_element|count_if|sort|copy_if|score',
                hint: '使用accumulate求和，max_element找最大，count_if计数，sort排序，copy_if筛选',
                xp: 200
            },
            references: [
                { title: '泛型算法', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: '算法详解', book: 'The C++ Standard Library', chapter: '第11章' }
            ],
            assistantTips: [
                '算法不直接操作容器，而是通过迭代器',
                '只读算法不会修改元素',
                'unique需要先排序才能完全去重',
                'stable_sort保持相等元素的相对顺序'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'find_if的作用是？', 
                    options: [
                        { text: '查找指定值' }, 
                        { text: '查找满足条件的第一个元素', correct: true }, 
                        { text: '查找所有满足条件的元素' }, 
                        { text: '查找最后一个元素' }
                    ], 
                    explanation: 'find_if查找第一个满足谓词条件的元素。' 
                },
                { 
                    type: 'single', 
                    question: 'unique去重后需要做什么？', 
                    options: [
                        { text: '什么都不用做' }, 
                        { text: '调用erase删除末尾元素', correct: true }, 
                        { text: '调用clear' }, 
                        { text: '调用resize' }
                    ], 
                    explanation: 'unique只是将重复元素移到末尾，需要用erase真正删除。' 
                },
                { 
                    type: 'single', 
                    question: 'transform的作用是？', 
                    options: [
                        { text: '复制元素' }, 
                        { text: '对每个元素应用函数并存储结果', correct: true }, 
                        { text: '排序元素' }, 
                        { text: '删除元素' }
                    ], 
                    explanation: 'transform对序列中的每个元素应用函数，并将结果存储到目标位置。' 
                },
                { 
                    type: 'single', 
                    question: 'partition的作用是？', 
                    options: [
                        { text: '排序' }, 
                        { text: '将元素分成两部分，满足条件的在前', correct: true }, 
                        { text: '删除元素' }, 
                        { text: '复制元素' }
                    ], 
                    explanation: 'partition将序列分为两部分，满足条件的元素放在前面。' 
                },
                { 
                    type: 'single', 
                    question: 'stable_sort与sort的区别是？', 
                    options: [
                        { text: 'stable_sort更快' }, 
                        { text: 'stable_sort保持相等元素的相对顺序', correct: true }, 
                        { text: 'sort更稳定' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: 'stable_sort是稳定排序，相等元素的相对顺序不变。' 
                }
            ]
        },
        {
            id: '17.4',
            title: 'lambda 表达式与捕获列表',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## lambda 表达式

### 什么是lambda表达式？

lambda表达式是C++11引入的匿名函数，可以在需要函数的地方直接定义。

\`\`\`cpp
// 基本语法
[capture](parameters) -> return_type { body }

// 示例
auto add = [](int a, int b) -> int {
    return a + b;
};

int result = add(3, 4);  // 7
\`\`\`

### lambda的组成部分

\`\`\`cpp
auto f = [capture](params) -> ret { body };
//        ^^^^^^^^  ^^^^^^    ^^^   ^^^^
//        捕获列表   参数列表   返回类型 函数体
\`\`\`

### 捕获列表

捕获列表决定了lambda如何访问外部变量。

#### 1. 不捕获

\`\`\`cpp
auto f = []() { 
    std::cout << "Hello" << std::endl; 
};
f();
\`\`\`

#### 2. 值捕获

\`\`\`cpp
int x = 10;
auto f = [x]() {  // 值捕获，拷贝x
    std::cout << x << std::endl;  // 10
};
x = 20;
f();  // 仍然输出10，因为捕获的是副本
\`\`\`

#### 3. 引用捕获

\`\`\`cpp
int x = 10;
auto f = [&x]() {  // 引用捕获
    std::cout << x << std::endl;
};
x = 20;
f();  // 输出20，因为捕获的是引用
\`\`\`

#### 4. 隐式捕获

\`\`\`cpp
int x = 10, y = 20;

// [=] 值捕获所有使用的变量
auto f1 = [=]() {
    return x + y;  // 值捕获x和y
};

// [&] 引用捕获所有使用的变量
auto f2 = [&]() {
    x = 30;  // 修改外部x
    y = 40;  // 修改外部y
};

// 混合捕获
auto f3 = [=, &x]() {  // 默认值捕获，x引用捕获
    x = y + 1;  // x是引用，y是值
};
\`\`\`

#### 5. 初始化捕获（C++14）

\`\`\`cpp
auto p = std::make_unique<int>(10);

// 移动捕获
auto f = [ptr = std::move(p)]() {
    std::cout << *ptr << std::endl;
};
\`\`\`

### 可变lambda

默认情况下，值捕获的变量在lambda内是只读的。使用mutable可以修改。

\`\`\`cpp
int x = 10;

// 错误：不能修改值捕获的变量
// auto f = [x]() { x = 20; };

// 正确：使用mutable
auto f = [x]() mutable {
    x = 20;  // 修改的是lambda内部的副本
    std::cout << x << std::endl;
};

f();  // 20
std::cout << x << std::endl;  // 10（外部x不变）
\`\`\`

### 返回类型推导

\`\`\`cpp
// 自动推导返回类型
auto f1 = [](int x) {
    return x * 2;  // 返回int
};

// 显式指定返回类型
auto f2 = [](int x) -> double {
    return x / 2.0;
};

// 返回类型后置
auto f3 = [](int x) -> decltype(x * 2.0) {
    return x * 2.0;
};
\`\`\`

### 泛型lambda（C++14）

\`\`\`cpp
// 使用auto参数
auto add = [](auto a, auto b) {
    return a + b;
};

int i = add(1, 2);        // int
double d = add(1.5, 2.5); // double
std::string s = add(std::string("Hello"), std::string("World"));
\`\`\`

### lambda与算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 使用lambda作为谓词
int cnt = std::count_if(vec.begin(), vec.end(), [](int x) {
    return x > 2;
});

// 使用lambda进行排序
std::sort(vec.begin(), vec.end(), [](int a, int b) {
    return a > b;  // 降序
});

// 使用lambda进行变换
std::transform(vec.begin(), vec.end(), vec.begin(), [](int x) {
    return x * x;
});
\`\`\`

### 捕获this指针

在成员函数中使用lambda：

\`\`\`cpp
class MyClass {
private:
    int value;
public:
    void func() {
        // 捕获this
        auto f = [this]() {
            std::cout << value << std::endl;
        };
        
        // C++17：[*this]值捕获当前对象
        auto f2 = [*this]() {
            std::cout << value << std::endl;
        };
    }
};
\`\`\`

### 捕获列表总结

| 捕获方式 | 说明 |
|---------|------|
| [] | 不捕获任何变量 |
| [=] | 值捕获所有使用的变量 |
| [&] | 引用捕获所有使用的变量 |
| [x] | 值捕获x |
| [&x] | 引用捕获x |
| [=, &x] | 默认值捕获，x引用捕获 |
| [&, x] | 默认引用捕获，x值捕获 |
| [x = expr] | 初始化捕获（C++14） |`,
            examples: [
                {
                    title: 'lambda捕获示例',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int x = 10;
    int y = 20;
    
    // 值捕获
    auto f1 = [x]() {
        std::cout << "值捕获 x = " << x << std::endl;
    };
    
    // 引用捕获
    auto f2 = [&x]() {
        x = 100;
        std::cout << "引用捕获，修改x为 " << x << std::endl;
    };
    
    // 隐式值捕获
    auto f3 = [=]() {
        std::cout << "隐式值捕获 x + y = " << x + y << std::endl;
    };
    
    // 混合捕获
    auto f4 = [=, &y]() {
        y = x + 50;
        std::cout << "混合捕获，y = " << y << std::endl;
    };
    
    // mutable lambda
    int counter = 0;
    auto increment = [counter]() mutable {
        counter++;
        std::cout << "内部counter = " << counter << std::endl;
        return counter;
    };
    
    std::cout << "=== 测试各种捕获方式 ===" << std::endl;
    
    f1();  // x = 10
    f2();  // x被修改为100
    std::cout << "外部x = " << x << std::endl;
    
    f3();  // x + y = 120
    f4();  // y被修改
    
    std::cout << "\\n=== mutable lambda ===" << std::endl;
    std::cout << "第一次: " << increment() << std::endl;
    std::cout << "第二次: " << increment() << std::endl;
    std::cout << "外部counter = " << counter << std::endl;
    
    return 0;
}`,
                    description: '展示各种lambda捕获方式。'
                },
                {
                    title: 'lambda与算法配合',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 使用lambda查找
    auto it = std::find_if(vec.begin(), vec.end(), [](int x) {
        return x > 5;
    });
    std::cout << "第一个大于5的元素: " << *it << std::endl;
    
    // 使用lambda排序
    std::sort(vec.begin(), vec.end(), [](int a, int b) {
        return a > b;  // 降序
    });
    
    std::cout << "降序排序: ";
    for (int val : vec) std::cout << val << " ";
    std::cout << std::endl;
    
    // 使用lambda计数
    int threshold = 5;
    int cnt = std::count_if(vec.begin(), vec.end(), [threshold](int x) {
        return x > threshold;
    });
    std::cout << "大于" << threshold << "的元素个数: " << cnt << std::endl;
    
    // 使用lambda变换
    std::transform(vec.begin(), vec.end(), vec.begin(), [](int x) {
        return x * 2;
    });
    
    std::cout << "每个元素乘2: ";
    for (int val : vec) std::cout << val << " ";
    std::cout << std::endl;
    
    // 使用lambda累加
    int sum = std::accumulate(vec.begin(), vec.end(), 0, 
        [](int acc, int x) {
            return acc + x;
        });
    std::cout << "总和: " << sum << std::endl;
    
    // 泛型lambda（C++14）
    auto print = [](const auto& container) {
        for (const auto& val : container) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    };
    
    std::cout << "\\n使用泛型lambda输出: ";
    print(vec);
    
    return 0;
}`,
                    description: '展示lambda与标准库算法的配合使用。'
                }
            ],
            handsOn: {
                title: 'lambda表达式练习',
                description: '使用lambda表达式完成各种数据处理任务。',
                initialCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

int main() {
    std::vector<std::pair<std::string, int>> students = {
        {"张三", 85},
        {"李四", 92},
        {"王五", 78},
        {"赵六", 95},
        {"钱七", 88}
    };
    
    // 任务1：使用lambda按成绩降序排序
    // TODO: 使用sort和lambda
    
    std::cout << "按成绩降序排序:" << std::endl;
    // TODO: 输出结果
    
    // 任务2：使用lambda查找第一个90分以上的学生
    // TODO: 使用find_if和lambda
    
    std::cout << "\\n第一个90分以上的学生: " << /* TODO */ << std::endl;
    
    // 任务3：使用lambda统计85分以上的人数
    // TODO: 使用count_if和lambda
    
    std::cout << "85分以上人数: " << /* TODO */ << std::endl;
    
    // 任务4：使用lambda将所有成绩转换为等级
    // 90以上A，80以上B，70以上C，其他D
    // TODO: 使用transform和lambda
    
    std::vector<char> grades;
    // TODO: 实现转换
    
    std::cout << "\\n成绩等级: ";
    // TODO: 输出等级
    
    // 任务5：使用lambda按姓名长度排序
    // TODO: 使用sort和lambda
    
    std::cout << "\\n按姓名长度排序:" << std::endl;
    // TODO: 输出结果
    
    return 0;
}`,
                expectedOutput: `按成绩降序排序:
赵六: 95
李四: 92
钱七: 88
张三: 85
王五: 78

第一个90分以上的学生: 赵六
85分以上人数: 4

成绩等级: B A C A B 

按姓名长度排序:
李四: 92
王五: 78
赵六: 95
钱七: 88
张三: 85`,
                solutionRegex: 'sort|find_if|count_if|transform|lambda|\\[|\\]',
                hint: '使用[]捕获变量，lambda作为算法的谓词参数',
                xp: 200
            },
            references: [
                { title: 'lambda表达式', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: '泛型lambda', book: 'Effective Modern C++', chapter: '条款32-34' }
            ],
            assistantTips: [
                'lambda是匿名函数，适合一次性使用',
                '值捕获是拷贝，引用捕获是别名',
                'mutable允许修改值捕获的变量',
                'C++14支持泛型lambda（auto参数）'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '[=]表示什么？', 
                    options: [
                        { text: '引用捕获所有变量' }, 
                        { text: '值捕获所有使用的变量', correct: true }, 
                        { text: '不捕获任何变量' }, 
                        { text: '捕获this指针' }
                    ], 
                    explanation: '[=]表示值捕获所有在lambda中使用的变量。' 
                },
                { 
                    type: 'single', 
                    question: '如何让值捕获的变量在lambda内可修改？', 
                    options: [
                        { text: '使用引用捕获' }, 
                        { text: '添加mutable关键字', correct: true }, 
                        { text: '使用const_cast' }, 
                        { text: '无法修改' }
                    ], 
                    explanation: '使用mutable关键字可以让值捕获的变量在lambda内可修改。' 
                },
                { 
                    type: 'single', 
                    question: '[&, x]表示什么？', 
                    options: [
                        { text: 'x值捕获，其他引用捕获', correct: true }, 
                        { text: 'x引用捕获，其他值捕获' }, 
                        { text: '全部值捕获' }, 
                        { text: '全部引用捕获' }
                    ], 
                    explanation: '[&, x]表示默认引用捕获，但x值捕获。' 
                },
                { 
                    type: 'single', 
                    question: 'lambda的返回类型可以省略吗？', 
                    options: [
                        { text: '不可以' }, 
                        { text: '可以，编译器会自动推导', correct: true }, 
                        { text: '只有void可以省略' }, 
                        { text: '取决于捕获列表' }
                    ], 
                    explanation: 'lambda可以省略返回类型，编译器会根据return语句自动推导。' 
                },
                { 
                    type: 'single', 
                    question: 'C++14的泛型lambda有什么特点？', 
                    options: [
                        { text: '只能使用int类型' }, 
                        { text: '可以使用auto作为参数类型', correct: true }, 
                        { text: '不需要捕获列表' }, 
                        { text: '只能返回auto' }
                    ], 
                    explanation: 'C++14允许lambda使用auto作为参数类型，实现泛型lambda。' 
                }
            ]
        },
        {
            id: '17.5',
            title: '泛型算法与可调用对象',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 可调用对象

C++中有多种可调用对象，它们都可以像函数一样被调用。

### 可调用对象的类型

1. **函数指针**
2. **函数对象（仿函数）**
3. **lambda表达式**
4. **std::function**

### 函数指针

\`\`\`cpp
#include <algorithm>
#include <vector>

// 普通函数
bool isEven(int x) {
    return x % 2 == 0;
}

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6};
    
    // 使用函数指针
    int cnt = std::count_if(vec.begin(), vec.end(), isEven);
    
    // 函数指针变量
    bool (*fp)(int) = isEven;
    int cnt2 = std::count_if(vec.begin(), vec.end(), fp);
}
\`\`\`

### 函数对象（仿函数）

函数对象是重载了调用运算符的类。

\`\`\`cpp
#include <algorithm>
#include <vector>

// 函数对象
struct IsEven {
    bool operator()(int x) const {
        return x % 2 == 0;
    }
};

// 带状态的函数对象
class Threshold {
private:
    int threshold;
public:
    Threshold(int t) : threshold(t) {}
    
    bool operator()(int x) const {
        return x > threshold;
    }
};

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6};
    
    // 使用函数对象
    int cnt = std::count_if(vec.begin(), vec.end(), IsEven());
    
    // 带状态的函数对象
    int cnt2 = std::count_if(vec.begin(), vec.end(), Threshold(3));
}
\`\`\`

### 标准库函数对象

\`\`\`cpp
#include <functional>
#include <algorithm>
#include <vector>

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9};
    
    // 算术运算
    std::plus<int> add;
    int sum = add(3, 4);  // 7
    
    // 比较运算
    std::greater<int> gt;
    bool result = gt(5, 3);  // true
    
    // 用于排序
    std::sort(vec.begin(), vec.end(), std::greater<int>());  // 降序
    
    // 逻辑运算
    std::logical_and<bool> land;
    bool r = land(true, false);  // false
}
\`\`\`

### std::function

std::function是一个通用的函数包装器，可以存储任何可调用对象。

\`\`\`cpp
#include <functional>
#include <iostream>

int add(int a, int b) { return a + b; }

struct Multiply {
    int operator()(int a, int b) const { return a * b; }
};

int main() {
    // 存储函数指针
    std::function<int(int, int)> f1 = add;
    std::cout << f1(3, 4) << std::endl;  // 7
    
    // 存储lambda
    std::function<int(int, int)> f2 = [](int a, int b) {
        return a - b;
    };
    std::cout << f2(10, 3) << std::endl;  // 7
    
    // 存储函数对象
    std::function<int(int, int)> f3 = Multiply();
    std::cout << f3(3, 4) << std::endl;  // 12
    
    // 检查是否包含可调用对象
    if (f1) {
        std::cout << "f1 is callable" << std::endl;
    }
    
    // 重置
    f1 = nullptr;
    if (!f1) {
        std::cout << "f1 is empty" << std::endl;
    }
}
\`\`\`

### std::bind

std::bind可以绑定可调用对象的参数。

\`\`\`cpp
#include <functional>
#include <iostream>

int add(int a, int b, int c) {
    return a + b + c;
}

int main() {
    using namespace std::placeholders;
    
    // 绑定第一个参数为10
    auto f1 = std::bind(add, 10, _1, _2);
    std::cout << f1(1, 2) << std::endl;  // 10 + 1 + 2 = 13
    
    // 绑定第二个参数为20
    auto f2 = std::bind(add, _1, 20, _2);
    std::cout << f2(5, 5) << std::endl;  // 5 + 20 + 5 = 30
    
    // 重排参数顺序
    auto f3 = std::bind(add, _3, _2, _1);
    std::cout << f3(1, 2, 3) << std::endl;  // 3 + 2 + 1 = 6
}
\`\`\`

### 可调用对象与算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <functional>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 使用函数对象
    std::sort(vec.begin(), vec.end(), std::greater<int>());
    
    // 使用lambda
    int threshold = 5;
    auto cnt = std::count_if(vec.begin(), vec.end(), 
                             [threshold](int x) { return x > threshold; });
    
    // 使用std::function
    std::function<bool(int)> predicate = [](int x) { return x % 2 == 0; };
    auto evenCount = std::count_if(vec.begin(), vec.end(), predicate);
}
\`\`\`

### 可调用对象的比较

| 类型 | 优点 | 缺点 |
|------|------|------|
| 函数指针 | 简单、轻量 | 无状态、类型不安全 |
| 函数对象 | 可有状态、可内联 | 需要定义类 |
| lambda | 简洁、就地定义 | 只能用于局部 |
| std::function | 最通用、可存储任意可调用对象 | 有运行时开销 |`,
            examples: [
                {
                    title: '各种可调用对象',
                    code: `#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>

// 普通函数
int square(int x) {
    return x * x;
}

// 函数对象
struct Cube {
    int operator()(int x) const {
        return x * x * x;
    }
};

// 带状态的函数对象
class Multiplier {
private:
    int factor;
public:
    Multiplier(int f) : factor(f) {}
    int operator()(int x) const {
        return x * factor;
    }
};

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    // 1. 函数指针
    std::cout << "函数指针: ";
    std::transform(vec.begin(), vec.end(), 
                   std::ostream_iterator<int>(std::cout, " "), 
                   square);
    std::cout << std::endl;
    
    // 2. 函数对象
    std::cout << "函数对象: ";
    std::transform(vec.begin(), vec.end(),
                   std::ostream_iterator<int>(std::cout, " "),
                   Cube());
    std::cout << std::endl;
    
    // 3. 带状态的函数对象
    std::cout << "带状态的函数对象(乘以3): ";
    std::transform(vec.begin(), vec.end(),
                   std::ostream_iterator<int>(std::cout, " "),
                   Multiplier(3));
    std::cout << std::endl;
    
    // 4. lambda
    std::cout << "lambda: ";
    std::transform(vec.begin(), vec.end(),
                   std::ostream_iterator<int>(std::cout, " "),
                   [](int x) { return x + 10; });
    std::cout << std::endl;
    
    // 5. std::function
    std::function<int(int)> func = [](int x) { return x - 1; };
    std::cout << "std::function: ";
    std::transform(vec.begin(), vec.end(),
                   std::ostream_iterator<int>(std::cout, " "),
                   func);
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示各种可调用对象的使用。'
                },
                {
                    title: 'std::function应用',
                    code: `#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>
#include <map>
#include <string>

// 使用std::function实现回调机制
class Button {
private:
    std::string name;
    std::function<void()> onClick;
    
public:
    Button(const std::string& n) : name(n) {}
    
    void setOnClick(std::function<void()> callback) {
        onClick = callback;
    }
    
    void click() {
        std::cout << "按钮 '" << name << "' 被点击" << std::endl;
        if (onClick) {
            onClick();
        }
    }
};

// 使用std::function实现策略模式
class Calculator {
public:
    using Operation = std::function<int(int, int)>;
    
    int calculate(int a, int b, Operation op) {
        return op(a, b);
    }
};

int main() {
    // 回调示例
    Button btn("确定");
    
    btn.setOnClick([]() {
        std::cout << "执行确定操作" << std::endl;
    });
    
    btn.click();
    
    // 策略模式示例
    Calculator calc;
    
    std::map<std::string, Calculator::Operation> operations = {
        {"add", std::plus<int>()},
        {"sub", std::minus<int>()},
        {"mul", std::multiplies<int>()},
        {"div", std::divides<int>()}
    };
    
    int a = 10, b = 5;
    for (const auto& [name, op] : operations) {
        std::cout << a << " " << name << " " << b << " = " 
                  << calc.calculate(a, b, op) << std::endl;
    }
    
    return 0;
}`,
                    description: '展示std::function的实际应用场景。'
                }
            ],
            handsOn: {
                title: '可调用对象练习',
                description: '使用不同的可调用对象实现数据处理。',
                initialCode: `#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>
#include <string>

// TODO: 定义一个函数对象类，用于判断是否为偶数
struct IsEven {
    // TODO: 重载调用运算符
};

// TODO: 定义一个带状态的函数对象类，用于判断是否大于某个阈值
class GreaterThan {
    // TODO: 实现带状态的函数对象
};

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 任务1：使用函数对象统计偶数个数
    // TODO: 使用count_if和IsEven
    
    std::cout << "偶数个数: " << /* TODO */ << std::endl;
    
    // 任务2：使用带状态的函数对象统计大于5的元素
    // TODO: 使用count_if和GreaterThan
    
    std::cout << "大于5的元素个数: " << /* TODO */ << std::endl;
    
    // 任务3：使用std::function存储不同的可调用对象
    std::function<bool(int)> predicates[3];
    
    // TODO: 存储三个不同的判断条件
    // 1. 判断是否为奇数
    // 2. 判断是否大于3
    // 3. 判断是否在5到8之间
    
    std::cout << "\\n不同条件的统计结果:" << std::endl;
    for (size_t i = 0; i < 3; ++i) {
        // TODO: 使用count_if统计
        std::cout << "条件" << (i + 1) << ": " << /* TODO */ << " 个元素" << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `偶数个数: 5
大于5的元素个数: 5

不同条件的统计结果:
条件1: 5 个元素
条件2: 7 个元素
条件3: 4 个元素`,
                solutionRegex: 'operator\\(\\)|count_if|std::function|lambda|IsEven|GreaterThan',
                hint: '函数对象需要重载operator()，std::function可以存储任意可调用对象',
                xp: 180
            },
            references: [
                { title: '可调用对象', book: 'C++ Primer 第五版', chapter: '第14章' },
                { title: 'std::function', book: 'Effective Modern C++', chapter: '条款32' }
            ],
            assistantTips: [
                '函数对象可以有状态，比函数指针更灵活',
                'std::function是最通用的函数包装器',
                'lambda本质上是匿名的函数对象',
                '标准库提供了很多预定义的函数对象'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '函数对象是什么？', 
                    options: [
                        { text: '函数指针' }, 
                        { text: '重载了调用运算符的类', correct: true }, 
                        { text: 'lambda表达式' }, 
                        { text: '成员函数' }
                    ], 
                    explanation: '函数对象（仿函数）是重载了operator()的类。' 
                },
                { 
                    type: 'single', 
                    question: 'std::function的作用是？', 
                    options: [
                        { text: '定义函数' }, 
                        { text: '通用的函数包装器，可存储任意可调用对象', correct: true }, 
                        { text: '创建lambda' }, 
                        { text: '调用函数' }
                    ], 
                    explanation: 'std::function可以存储、复制和调用任何可调用对象。' 
                },
                { 
                    type: 'single', 
                    question: 'std::greater<int>()的作用是？', 
                    options: [
                        { text: '判断是否相等' }, 
                        { text: '判断是否大于', correct: true }, 
                        { text: '判断是否小于' }, 
                        { text: '加法运算' }
                    ], 
                    explanation: 'std::greater是标准库函数对象，用于大于比较。' 
                },
                { 
                    type: 'single', 
                    question: '函数对象相比函数指针的优势是？', 
                    options: [
                        { text: '更简单' }, 
                        { text: '可以有状态，更容易内联', correct: true }, 
                        { text: '更轻量' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: '函数对象可以保存状态，且编译器更容易内联优化。' 
                },
                { 
                    type: 'single', 
                    question: 'std::function为空时调用会发生什么？', 
                    options: [
                        { text: '返回0' }, 
                        { text: '抛出std::bad_function_call异常', correct: true }, 
                        { text: '什么都不做' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '调用空的std::function会抛出std::bad_function_call异常。' 
                }
            ]
        },
        {
            id: '17.6',
            title: '定制操作：传递函数指针、函数对象、lambda',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 定制操作

标准库算法允许我们传递自定义操作来定制算法行为。

### 传递函数指针

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <iostream>

// 比较函数
bool compareDescending(int a, int b) {
    return a > b;  // 降序
}

// 判断函数
bool isEven(int x) {
    return x % 2 == 0;
}

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 使用函数指针排序
    std::sort(vec.begin(), vec.end(), compareDescending);
    
    // 使用函数指针计数
    int cnt = std::count_if(vec.begin(), vec.end(), isEven);
    
    return 0;
}
\`\`\`

### 传递函数对象

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <functional>

// 自定义比较器
struct Descending {
    bool operator()(int a, int b) const {
        return a > b;
    }
};

// 带状态的比较器
struct ThresholdCompare {
    int threshold;
    ThresholdCompare(int t) : threshold(t) {}
    
    bool operator()(int x) const {
        return x > threshold;
    }
};

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 使用函数对象排序
    std::sort(vec.begin(), vec.end(), Descending());
    
    // 使用带状态的函数对象
    int cnt = std::count_if(vec.begin(), vec.end(), ThresholdCompare(5));
    
    // 使用标准库函数对象
    std::sort(vec.begin(), vec.end(), std::greater<int>());
}
\`\`\`

### 传递lambda

\`\`\`cpp
#include <algorithm>
#include <vector>

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 使用lambda排序
    std::sort(vec.begin(), vec.end(), [](int a, int b) {
        return a > b;  // 降序
    });
    
    // 捕获外部变量
    int threshold = 5;
    int cnt = std::count_if(vec.begin(), vec.end(), [threshold](int x) {
        return x > threshold;
    });
    
    // 更复杂的lambda
    std::sort(vec.begin(), vec.end(), [](int a, int b) {
        // 按奇偶性分组，偶数在前
        if (a % 2 != b % 2) {
            return a % 2 == 0;
        }
        return a < b;  // 同组内升序
    });
}
\`\`\`

### 自定义排序示例

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <string>

struct Person {
    std::string name;
    int age;
    double salary;
};

int main() {
    std::vector<Person> people = {
        {"Alice", 30, 50000},
        {"Bob", 25, 60000},
        {"Carol", 30, 55000},
        {"David", 25, 45000}
    };
    
    // 按年龄排序
    std::sort(people.begin(), people.end(), 
              [](const Person& a, const Person& b) {
                  return a.age < b.age;
              });
    
    // 按薪资降序
    std::sort(people.begin(), people.end(),
              [](const Person& a, const Person& b) {
                  return a.salary > b.salary;
              });
    
    // 多条件排序：先按年龄，再按薪资
    std::sort(people.begin(), people.end(),
              [](const Person& a, const Person& b) {
                  if (a.age != b.age) return a.age < b.age;
                  return a.salary > b.salary;
              });
    
    // 按姓名长度排序
    std::sort(people.begin(), people.end(),
              [](const Person& a, const Person& b) {
                  return a.name.size() < b.name.size();
              });
}
\`\`\`

### 自定义查找与筛选

\`\`\`cpp
#include <algorithm>
#include <vector>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 查找第一个偶数
    auto it = std::find_if(vec.begin(), vec.end(), [](int x) {
        return x % 2 == 0;
    });
    
    // 查找第一个大于5的元素
    auto it2 = std::find_if(vec.begin(), vec.end(), [](int x) {
        return x > 5;
    });
    
    // 筛选所有偶数
    std::vector<int> evens;
    std::copy_if(vec.begin(), vec.end(), std::back_inserter(evens),
                 [](int x) { return x % 2 == 0; });
    
    // 分区：偶数在前，奇数在后
    auto partitionPoint = std::partition(vec.begin(), vec.end(),
                                          [](int x) { return x % 2 == 0; });
}
\`\`\`

### 自定义变换

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <string>
#include <cctype>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    
    // 平方变换
    std::vector<int> squares;
    std::transform(nums.begin(), nums.end(), std::back_inserter(squares),
                   [](int x) { return x * x; });
    
    // 字符串处理
    std::vector<std::string> words = {"hello", "world"};
    std::vector<std::string> upper;
    std::transform(words.begin(), words.end(), std::back_inserter(upper),
                   [](const std::string& s) {
                       std::string result = s;
                       for (char& c : result) c = std::toupper(c);
                       return result;
                   });
}
\`\`\`

### 使用标准库函数对象

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <functional>

int main() {
    std::vector<int> vec = {5, 2, 8, 1, 9};
    
    // 使用std::greater降序排序
    std::sort(vec.begin(), vec.end(), std::greater<int>());
    
    // 使用std::less升序排序（默认）
    std::sort(vec.begin(), vec.end(), std::less<int>());
    
    // 使用std::multiplies进行乘法变换
    std::transform(vec.begin(), vec.end(), vec.begin(),
                   std::bind(std::multiplies<int>(), std::placeholders::_1, 2));
}
\`\`\``,
            examples: [
                {
                    title: '自定义排序',
                    code: `#include <iostream>
#include <algorithm>
#include <vector>
#include <string>

struct Product {
    std::string name;
    double price;
    int quantity;
};

int main() {
    std::vector<Product> products = {
        {"Apple", 2.5, 100},
        {"Banana", 1.8, 150},
        {"Orange", 3.0, 80},
        {"Grape", 5.0, 50}
    };
    
    // 按价格升序
    std::sort(products.begin(), products.end(),
              [](const Product& a, const Product& b) {
                  return a.price < b.price;
              });
    
    std::cout << "按价格升序:" << std::endl;
    for (const auto& p : products) {
        std::cout << p.name << ": $" << p.price << std::endl;
    }
    
    // 按库存降序
    std::sort(products.begin(), products.end(),
              [](const Product& a, const Product& b) {
                  return a.quantity > b.quantity;
              });
    
    std::cout << "\\n按库存降序:" << std::endl;
    for (const auto& p : products) {
        std::cout << p.name << ": " << p.quantity << "个" << std::endl;
    }
    
    // 按总价值（价格*数量）排序
    std::sort(products.begin(), products.end(),
              [](const Product& a, const Product& b) {
                  return a.price * a.quantity > b.price * b.quantity;
              });
    
    std::cout << "\\n按总价值降序:" << std::endl;
    for (const auto& p : products) {
        std::cout << p.name << ": $" << (p.price * p.quantity) << std::endl;
    }
    
    return 0;
}`,
                    description: '展示使用自定义操作进行排序。'
                },
                {
                    title: '自定义筛选与变换',
                    code: `#include <iostream>
#include <algorithm>
#include <vector>
#include <string>
#include <cctype>

int main() {
    std::vector<std::string> words = {
        "Hello", "world", "CPP", "programming", "is", "fun"
    };
    
    // 筛选长度大于3的单词
    std::vector<std::string> longWords;
    std::copy_if(words.begin(), words.end(), std::back_inserter(longWords),
                 [](const std::string& s) { return s.length() > 3; });
    
    std::cout << "长度大于3的单词: ";
    for (const auto& w : longWords) std::cout << w << " ";
    std::cout << std::endl;
    
    // 变换为小写
    std::vector<std::string> lowerWords;
    std::transform(words.begin(), words.end(), std::back_inserter(lowerWords),
                   [](std::string s) {
                       for (char& c : s) c = std::tolower(c);
                       return s;
                   });
    
    std::cout << "小写形式: ";
    for (const auto& w : lowerWords) std::cout << w << " ";
    std::cout << std::endl;
    
    // 筛选并变换：获取所有大写开头的单词的小写形式
    std::vector<std::string> result;
    std::for_each(words.begin(), words.end(), [&result](const std::string& s) {
        if (std::isupper(s[0])) {
            std::string lower = s;
            for (char& c : lower) c = std::tolower(c);
            result.push_back(lower);
        }
    });
    
    std::cout << "大写开头的单词（转小写）: ";
    for (const auto& w : result) std::cout << w << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示自定义筛选和变换操作。'
                }
            ],
            handsOn: {
                title: '定制操作练习',
                description: '使用自定义操作处理学生成绩数据。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <vector>
#include <string>

struct Student {
    std::string name;
    int math;
    int english;
    int science;
    
    int total() const { return math + english + science; }
    double average() const { return total() / 3.0; }
};

int main() {
    std::vector<Student> students = {
        {"张三", 85, 90, 88},
        {"李四", 92, 85, 95},
        {"王五", 78, 92, 80},
        {"赵六", 88, 76, 90},
        {"钱七", 95, 88, 92}
    };
    
    // 任务1：按总分降序排序
    // TODO: 使用sort和lambda
    
    std::cout << "按总分降序:" << std::endl;
    // TODO: 输出结果
    
    // 任务2：找出数学成绩最高的学生
    // TODO: 使用max_element和lambda
    
    std::cout << "\\n数学最高分: " << /* TODO */ << std::endl;
    
    // 任务3：筛选总分大于270的学生
    // TODO: 使用copy_if
    
    std::cout << "\\n总分大于270的学生:" << std::endl;
    // TODO: 输出结果
    
    // 任务4：按英语成绩升序，英语相同按数学降序
    // TODO: 使用sort和lambda
    
    std::cout << "\\n按英语升序（英语相同按数学降序）:" << std::endl;
    // TODO: 输出结果
    
    // 任务5：统计各科都及格（>=60）的学生人数
    // TODO: 使用count_if
    
    std::cout << "\\n各科都及格的人数: " << /* TODO */ << std::endl;
    
    return 0;
}`,
                expectedOutput: `按总分降序:
钱七: 275
李四: 272
张三: 263
赵六: 254
王五: 250

数学最高分: 钱七

总分大于270的学生:
钱七: 275
李四: 272

按英语升序（英语相同按数学降序）:
赵六: 76
张三: 90
王五: 92
钱七: 88
李四: 85

各科都及格的人数: 5`,
                solutionRegex: 'sort|max_element|copy_if|count_if|total|average|lambda',
                hint: '使用lambda作为算法的比较器或谓词参数',
                xp: 200
            },
            references: [
                { title: '定制操作', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: '算法定制', book: 'Effective STL', chapter: '条款39-46' }
            ],
            assistantTips: [
                'lambda是最常用的定制操作方式',
                '函数对象可以保存状态',
                '标准库提供了常用的函数对象',
                '多条件排序可以在lambda中使用if-else'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'sort的比较函数应该返回什么？', 
                    options: [
                        { text: 'bool，表示第一个参数是否应该排在前面', correct: true }, 
                        { text: 'int，负数、0、正数' }, 
                        { text: 'void' }, 
                        { text: '任意类型' }
                    ], 
                    explanation: 'sort的比较函数返回bool，true表示第一个参数应该排在前面。' 
                },
                { 
                    type: 'single', 
                    question: 'find_if的谓词应该返回什么？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'bool，表示元素是否满足条件', correct: true }, 
                        { text: 'void' }, 
                        { text: '迭代器' }
                    ], 
                    explanation: 'find_if的谓词返回bool，true表示找到目标元素。' 
                },
                { 
                    type: 'single', 
                    question: '如何实现多条件排序？', 
                    options: [
                        { text: '调用多次sort' }, 
                        { text: '在lambda中使用if-else判断多个条件', correct: true }, 
                        { text: '使用多个比较函数' }, 
                        { text: '不支持多条件' }
                    ], 
                    explanation: '在lambda中使用if-else可以实现多条件排序。' 
                },
                { 
                    type: 'single', 
                    question: 'std::greater<int>()用于什么？', 
                    options: [
                        { text: '判断相等' }, 
                        { text: '降序排序', correct: true }, 
                        { text: '升序排序' }, 
                        { text: '加法运算' }
                    ], 
                    explanation: 'std::greater返回a > b，用于降序排序。' 
                },
                { 
                    type: 'single', 
                    question: 'copy_if的作用是？', 
                    options: [
                        { text: '复制所有元素' }, 
                        { text: '复制满足条件的元素', correct: true }, 
                        { text: '删除元素' }, 
                        { text: '移动元素' }
                    ], 
                    explanation: 'copy_if只复制满足谓词条件的元素。' 
                }
            ]
        },
        {
            id: '17.7',
            title: '绑定器与占位符（std::bind）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## std::bind

### 什么是std::bind？

std::bind是一个函数适配器，可以绑定可调用对象的参数，生成新的可调用对象。

\`\`\`cpp
#include <functional>

int add(int a, int b) {
    return a + b;
}

int main() {
    // 绑定第一个参数为10
    auto add10 = std::bind(add, 10, std::placeholders::_1);
    int result = add10(5);  // 10 + 5 = 15
}
\`\`\`

### 占位符

占位符定义在\`std::placeholders\`命名空间中，表示新函数的参数位置。

\`\`\`cpp
using namespace std::placeholders;

int add(int a, int b, int c) {
    return a + b + c;
}

int main() {
    // _1, _2, _3 表示新函数的第1、2、3个参数
    
    auto f1 = std::bind(add, _1, _2, _3);
    std::cout << f1(1, 2, 3) << std::endl;  // 1 + 2 + 3 = 6
    
    auto f2 = std::bind(add, 10, _1, _2);
    std::cout << f2(2, 3) << std::endl;  // 10 + 2 + 3 = 15
    
    auto f3 = std::bind(add, _1, 20, _2);
    std::cout << f3(5, 5) << std::endl;  // 5 + 20 + 5 = 30
    
    // 重排参数顺序
    auto f4 = std::bind(add, _3, _2, _1);
    std::cout << f4(1, 2, 3) << std::endl;  // 3 + 2 + 1 = 6
}
\`\`\`

### 绑定成员函数

\`\`\`cpp
#include <functional>
#include <iostream>
#include <algorithm>
#include <vector>

class Person {
public:
    std::string name;
    int age;
    
    Person(const std::string& n, int a) : name(n), age(a) {}
    
    void introduce() const {
        std::cout << "我是" << name << "，" << age << "岁" << std::endl;
    }
    
    bool isOlderThan(int threshold) const {
        return age > threshold;
    }
};

int main() {
    Person p("张三", 25);
    
    // 绑定成员函数
    auto introduce = std::bind(&Person::introduce, &p);
    introduce();  // 调用p.introduce()
    
    // 绑定带参数的成员函数
    auto isOlder = std::bind(&Person::isOlderThan, &p, std::placeholders::_1);
    bool result = isOlder(20);  // 调用p.isOlderThan(20)
    
    // 用于算法
    std::vector<Person> people = {
        Person("李四", 30),
        Person("王五", 20),
        Person("赵六", 35)
    };
    
    // 统计年龄大于25的人数
    int cnt = std::count_if(people.begin(), people.end(),
                            std::bind(&Person::isOlderThan, 
                                     std::placeholders::_1, 25));
}
\`\`\`

### 绑定成员变量

\`\`\`cpp
#include <functional>
#include <algorithm>
#include <vector>

struct Product {
    std::string name;
    double price;
};

int main() {
    std::vector<Product> products = {
        {"Apple", 2.5},
        {"Banana", 1.8},
        {"Orange", 3.0}
    };
    
    // 绑定成员变量
    auto getPrice = std::bind(&Product::price, std::placeholders::_1);
    
    // 使用绑定获取价格
    double total = 0;
    for (const auto& p : products) {
        total += getPrice(p);
    }
    
    // 用于排序
    std::sort(products.begin(), products.end(),
              [](const Product& a, const Product& b) {
                  return a.price < b.price;
              });
}
\`\`\`

### bind与算法配合

\`\`\`cpp
#include <functional>
#include <algorithm>
#include <vector>

bool greaterThan(int x, int threshold) {
    return x > threshold;
}

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 使用bind固定阈值
    int threshold = 5;
    auto gt5 = std::bind(greaterThan, std::placeholders::_1, threshold);
    
    int cnt = std::count_if(vec.begin(), vec.end(), gt5);
    
    // 等价于lambda
    int cnt2 = std::count_if(vec.begin(), vec.end(), 
                             [threshold](int x) { return x > threshold; });
}
\`\`\`

### bind vs lambda

\`\`\`cpp
#include <functional>

int add(int a, int b) { return a + b; }

int main() {
    using namespace std::placeholders;
    
    // 使用bind
    auto add10_bind = std::bind(add, 10, _1);
    
    // 使用lambda
    auto add10_lambda = [](int x) { return add(10, x); };
    
    // 结果相同
    int r1 = add10_bind(5);   // 15
    int r2 = add10_lambda(5); // 15
}
\`\`\`

### bind的返回类型

\`\`\`cpp
#include <functional>
#include <type_traits>

int add(int a, int b) { return a + b; }

int main() {
    using namespace std::placeholders;
    
    auto f = std::bind(add, _1, _2);
    
    // 返回类型是未指定的，通常是一个复杂的模板类型
    // 可以用auto或std::function存储
    
    std::function<int(int, int)> func = std::bind(add, _1, _2);
}
\`\`\`

### 注意事项

1. **引用语义**：bind默认是值传递，需要使用std::ref/std::cref传递引用

\`\`\`cpp
#include <functional>
#include <iostream>

void increment(int& x) {
    x++;
}

int main() {
    int n = 10;
    
    // 错误：值传递，不会修改n
    // auto f = std::bind(increment, n);
    
    // 正确：使用std::ref传递引用
    auto f = std::bind(increment, std::ref(n));
    f();
    std::cout << n << std::endl;  // 11
}
\`\`\`

2. **占位符数量**：可以使用的占位符数量有限制（通常是20个）

3. **性能**：lambda通常比bind更高效，优先使用lambda`,
            examples: [
                {
                    title: 'std::bind基础',
                    code: `#include <iostream>
#include <functional>
#include <algorithm>
#include <vector>

int add(int a, int b, int c) {
    return a + b + c;
}

int main() {
    using namespace std::placeholders;
    
    std::cout << "=== 参数绑定 ===" << std::endl;
    
    // 绑定第一个参数
    auto f1 = std::bind(add, 10, _1, _2);
    std::cout << "add(10, 5, 3) = " << f1(5, 3) << std::endl;
    
    // 绑定中间参数
    auto f2 = std::bind(add, _1, 20, _2);
    std::cout << "add(5, 20, 3) = " << f2(5, 3) << std::endl;
    
    // 绑定所有参数
    auto f3 = std::bind(add, 1, 2, 3);
    std::cout << "add(1, 2, 3) = " << f3() << std::endl;
    
    std::cout << "\\n=== 参数重排 ===" << std::endl;
    
    // 重排参数顺序
    auto f4 = std::bind(add, _3, _2, _1);
    std::cout << "add(3, 2, 1) = " << f4(1, 2, 3) << std::endl;
    
    // 复用参数
    auto f5 = std::bind(add, _1, _1, _2);
    std::cout << "add(5, 5, 3) = " << f5(5, 3) << std::endl;
    
    std::cout << "\\n=== 与算法配合 ===" << std::endl;
    
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 绑定比较函数
    auto greaterThan5 = std::bind(std::greater<int>(), _1, 5);
    int cnt = std::count_if(vec.begin(), vec.end(), greaterThan5);
    std::cout << "大于5的元素个数: " << cnt << std::endl;
    
    return 0;
}`,
                    description: '展示std::bind的基本用法。'
                },
                {
                    title: 'bind绑定成员函数',
                    code: `#include <iostream>
#include <functional>
#include <algorithm>
#include <vector>
#include <string>

class Student {
public:
    std::string name;
    int score;
    
    Student(const std::string& n, int s) : name(n), score(s) {}
    
    bool passed(int threshold) const {
        return score >= threshold;
    }
    
    void print() const {
        std::cout << name << ": " << score << std::endl;
    }
};

int main() {
    using namespace std::placeholders;
    
    std::vector<Student> students = {
        {"张三", 85},
        {"李四", 92},
        {"王五", 78},
        {"赵六", 65},
        {"钱七", 88}
    };
    
    // 绑定成员函数进行筛选
    int passScore = 60;
    auto isPassed = std::bind(&Student::passed, _1, passScore);
    
    std::cout << "及格（>=60）的学生:" << std::endl;
    std::for_each(students.begin(), students.end(), 
        [&students](const Student& s) {
            if (s.passed(60)) {
                std::cout << s.name << ": " << s.score << std::endl;
            }
        });
    
    // 统计优秀学生（>=90）
    int excellentCount = std::count_if(students.begin(), students.end(),
        std::bind(&Student::passed, _1, 90));
    std::cout << "\\n优秀学生人数: " << excellentCount << std::endl;
    
    // 绑定成员变量进行排序
    std::sort(students.begin(), students.end(),
        [](const Student& a, const Student& b) {
            return a.score > b.score;
        });
    
    std::cout << "\\n按成绩降序:" << std::endl;
    for (const auto& s : students) {
        s.print();
    }
    
    return 0;
}`,
                    description: '展示使用bind绑定成员函数。'
                }
            ],
            handsOn: {
                title: 'std::bind练习',
                description: '使用std::bind完成函数适配。',
                initialCode: `#include <iostream>
#include <functional>
#include <algorithm>
#include <vector>

// 判断x是否在[min, max]范围内
bool inRange(int x, int min, int max) {
    return x >= min && x <= max;
}

// 计算x的n次方
int power(int x, int n) {
    int result = 1;
    for (int i = 0; i < n; ++i) {
        result *= x;
    }
    return result;
}

int main() {
    using namespace std::placeholders;
    
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 任务1：使用bind创建一个判断是否在[3, 7]范围内的函数
    // TODO: 使用bind绑定inRange
    
    auto in3to7 = /* TODO */;
    
    std::cout << "在[3,7]范围内的元素: ";
    for (int val : vec) {
        if (in3to7(val)) {
            std::cout << val << " ";
        }
    }
    std::cout << std::endl;
    
    // 任务2：使用bind和count_if统计在[3, 7]范围内的元素个数
    // TODO
    
    std::cout << "在[3,7]范围内的元素个数: " << /* TODO */ << std::endl;
    
    // 任务3：使用bind创建一个计算平方的函数
    // TODO: 使用bind绑定power
    
    auto square = /* TODO */;
    
    std::cout << "\\n平方结果:" << std::endl;
    for (int val : vec) {
        std::cout << val << "^2 = " << square(val) << std::endl;
    }
    
    // 任务4：使用bind和transform计算所有元素的平方
    std::vector<int> squares;
    // TODO: 使用transform和bind
    
    std::cout << "\\n所有元素的平方: ";
    for (int val : squares) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                expectedOutput: `在[3,7]范围内的元素: 3 4 5 6 7 
在[3,7]范围内的元素个数: 5

平方结果:
1^2 = 1
2^2 = 4
3^2 = 9
4^2 = 16
5^2 = 25
6^2 = 36
7^2 = 49
8^2 = 64
9^2 = 81
10^2 = 100

所有元素的平方: 1 4 9 16 25 36 49 64 81 100`,
                solutionRegex: 'bind|_1|_2|inRange|power|transform|count_if',
                hint: '使用std::bind绑定参数，_1表示第一个参数位置',
                xp: 180
            },
            references: [
                { title: 'std::bind', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: 'bind vs lambda', book: 'Effective Modern C++', chapter: '条款34' }
            ],
            assistantTips: [
                '现代C++优先使用lambda而非bind',
                'bind需要使用std::ref传递引用',
                '占位符_1、_2等表示新函数的参数位置',
                'bind可以绑定成员函数和成员变量'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::placeholders::_1表示什么？', 
                    options: [
                        { text: '绑定的第一个参数' }, 
                        { text: '新函数的第一个参数', correct: true }, 
                        { text: '返回值' }, 
                        { text: '默认值' }
                    ], 
                    explanation: '_1表示生成的新函数的第一个参数。' 
                },
                { 
                    type: 'single', 
                    question: '如何绑定成员函数？', 
                    options: [
                        { text: '直接使用函数名' }, 
                        { text: '使用&ClassName::memberFunction', correct: true }, 
                        { text: '使用对象调用' }, 
                        { text: '不能绑定成员函数' }
                    ], 
                    explanation: '绑定成员函数需要使用&ClassName::memberFunction语法。' 
                },
                { 
                    type: 'single', 
                    question: 'bind默认如何传递参数？', 
                    options: [
                        { text: '引用传递' }, 
                        { text: '值传递', correct: true }, 
                        { text: '指针传递' }, 
                        { text: '移动传递' }
                    ], 
                    explanation: 'bind默认是值传递，需要用std::ref传递引用。' 
                },
                { 
                    type: 'single', 
                    question: 'bind相比lambda的缺点是？', 
                    options: [
                        { text: '功能更少' }, 
                        { text: '性能通常较差，代码可读性差', correct: true }, 
                        { text: '不能绑定函数' }, 
                        { text: '没有缺点' }
                    ], 
                    explanation: 'lambda通常比bind更高效且更易读，现代C++优先使用lambda。' 
                },
                { 
                    type: 'single', 
                    question: '如何用bind重排参数顺序？', 
                    options: [
                        { text: '不能重排' }, 
                        { text: '使用不同的占位符顺序', correct: true }, 
                        { text: '使用swap' }, 
                        { text: '使用reverse' }
                    ], 
                    explanation: '通过改变占位符的顺序可以重排参数，如bind(f, _2, _1)。' 
                }
            ]
        },
        {
            id: '17.8',
            title: '标准库算法示例大全（查找、排序、变换、数值等）',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## 标准库算法分类

### 查找算法

#### find系列

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

// find - 查找元素
auto it1 = std::find(vec.begin(), vec.end(), 3);

// find_if - 条件查找
auto it2 = std::find_if(vec.begin(), vec.end(), [](int x) {
    return x > 3;
});

// find_if_not - 查找不满足条件的
auto it3 = std::find_if_not(vec.begin(), vec.end(), [](int x) {
    return x > 0;
});

// find_first_of - 查找两个序列中第一个匹配的元素
std::vector<int> seq = {3, 7, 9};
auto it4 = std::find_first_of(vec.begin(), vec.end(), seq.begin(), seq.end());

// adjacent_find - 查找相邻重复元素
std::vector<int> vec2 = {1, 2, 2, 3, 4};
auto it5 = std::adjacent_find(vec2.begin(), vec2.end());
\`\`\`

#### 二分查找（需要有序序列）

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// binary_search - 检查是否存在
bool found = std::binary_search(vec.begin(), vec.end(), 5);

// lower_bound - 第一个不小于value的位置
auto lb = std::lower_bound(vec.begin(), vec.end(), 5);

// upper_bound - 第一个大于value的位置
auto ub = std::upper_bound(vec.begin(), vec.end(), 5);

// equal_range - 返回等于value的范围
auto range = std::equal_range(vec.begin(), vec.end(), 5);
\`\`\`

### 排序算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};

// sort - 排序
std::sort(vec.begin(), vec.end());

// stable_sort - 稳定排序
std::stable_sort(vec.begin(), vec.end());

// partial_sort - 部分排序（前n个有序）
std::partial_sort(vec.begin(), vec.begin() + 3, vec.end());

// nth_element - 第n个元素就位
std::nth_element(vec.begin(), vec.begin() + 5, vec.end());

// is_sorted - 检查是否已排序
bool sorted = std::is_sorted(vec.begin(), vec.end());
\`\`\`

### 变换算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <iterator>

std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst(5);

// transform - 变换
std::transform(src.begin(), src.end(), dst.begin(), [](int x) {
    return x * 2;
});

// copy - 复制
std::copy(src.begin(), src.end(), dst.begin());

// copy_if - 条件复制
std::copy_if(src.begin(), src.end(), dst.begin(), [](int x) {
    return x > 2;
});

// copy_n - 复制n个元素
std::copy_n(src.begin(), 3, dst.begin());

// move - 移动
std::move(src.begin(), src.end(), dst.begin());

// swap_ranges - 交换范围
std::swap_ranges(src.begin(), src.end(), dst.begin());
\`\`\`

### 删除算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3, 2, 4, 2, 5};

// remove - 移除元素（不删除，只是移到末尾）
auto newEnd = std::remove(vec.begin(), vec.end(), 2);
vec.erase(newEnd, vec.end());  // 真正删除

// remove_if - 条件移除
auto newEnd2 = std::remove_if(vec.begin(), vec.end(), [](int x) {
    return x < 3;
});
vec.erase(newEnd2, vec.end());

// unique - 去重
std::sort(vec.begin(), vec.end());
auto newEnd3 = std::unique(vec.begin(), vec.end());
vec.erase(newEnd3, vec.end());
\`\`\`

### 数值算法

\`\`\`cpp
#include <numeric>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};

// accumulate - 累加
int sum = std::accumulate(vec.begin(), vec.end(), 0);

// 自定义操作
int product = std::accumulate(vec.begin(), vec.end(), 1, 
                              std::multiplies<int>());

// inner_product - 内积
std::vector<int> v2 = {1, 1, 1, 1, 1};
int dot = std::inner_product(vec.begin(), vec.end(), v2.begin(), 0);

// adjacent_difference - 相邻差
std::vector<int> diff(5);
std::adjacent_difference(vec.begin(), vec.end(), diff.begin());

// partial_sum - 部分和
std::vector<int> ps(5);
std::partial_sum(vec.begin(), vec.end(), ps.begin());

// iota - 填充递增序列
std::vector<int> seq(5);
std::iota(seq.begin(), seq.end(), 1);  // 1, 2, 3, 4, 5
\`\`\`

### 集合算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> a = {1, 2, 3, 4, 5};
std::vector<int> b = {3, 4, 5, 6, 7};

// includes - 检查是否包含
bool inc = std::includes(a.begin(), a.end(), b.begin(), b.end());

// set_union - 并集
std::vector<int> uni(10);
auto it1 = std::set_union(a.begin(), a.end(), b.begin(), b.end(), uni.begin());

// set_intersection - 交集
std::vector<int> inter(10);
auto it2 = std::set_intersection(a.begin(), a.end(), b.begin(), b.end(), inter.begin());

// set_difference - 差集
std::vector<int> diff(10);
auto it3 = std::set_difference(a.begin(), a.end(), b.begin(), b.end(), diff.begin());
\`\`\`

### 堆算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {3, 1, 4, 1, 5, 9, 2, 6};

// make_heap - 创建堆
std::make_heap(vec.begin(), vec.end());

// push_heap - 插入元素到堆
vec.push_back(10);
std::push_heap(vec.begin(), vec.end());

// pop_heap - 弹出堆顶
std::pop_heap(vec.begin(), vec.end());
vec.pop_back();

// sort_heap - 堆排序
std::sort_heap(vec.begin(), vec.end());

// is_heap - 检查是否是堆
bool isHeap = std::is_heap(vec.begin(), vec.end());
\`\`\`

### 排列算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {1, 2, 3};

// next_permutation - 下一个排列
do {
    for (int x : vec) std::cout << x << " ";
    std::cout << std::endl;
} while (std::next_permutation(vec.begin(), vec.end()));

// prev_permutation - 上一个排列
std::prev_permutation(vec.begin(), vec.end());

// is_permutation - 检查是否是排列
std::vector<int> v2 = {2, 1, 3};
bool isPerm = std::is_permutation(vec.begin(), vec.end(), v2.begin());
\`\`\`

### 最小最大算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> vec = {5, 2, 8, 1, 9};

// min_element / max_element
auto minIt = std::min_element(vec.begin(), vec.end());
auto maxIt = std::max_element(vec.begin(), vec.end());

// minmax_element - 同时获取最小最大
auto [min, max] = std::minmax_element(vec.begin(), vec.end());

// clamp - 限制在范围内（C++17）
int val = std::clamp(15, 0, 10);  // 10
\`\`\``,
            examples: [
                {
                    title: '查找算法示例',
                    code: `#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // find
    auto it1 = std::find(vec.begin(), vec.end(), 5);
    std::cout << "find(5): ";
    if (it1 != vec.end()) {
        std::cout << "找到，位置 " << (it1 - vec.begin()) << std::endl;
    }
    
    // find_if
    auto it2 = std::find_if(vec.begin(), vec.end(), [](int x) {
        return x > 5;
    });
    std::cout << "find_if(>5): ";
    if (it2 != vec.end()) {
        std::cout << "找到 " << *it2 << std::endl;
    }
    
    // 二分查找
    bool found = std::binary_search(vec.begin(), vec.end(), 7);
    std::cout << "binary_search(7): " << (found ? "找到" : "未找到") << std::endl;
    
    // lower_bound / upper_bound
    auto lb = std::lower_bound(vec.begin(), vec.end(), 5);
    auto ub = std::upper_bound(vec.begin(), vec.end(), 5);
    std::cout << "lower_bound(5): " << *lb << std::endl;
    std::cout << "upper_bound(5): " << *ub << std::endl;
    
    // min / max
    auto [minIt, maxIt] = std::minmax_element(vec.begin(), vec.end());
    std::cout << "最小: " << *minIt << ", 最大: " << *maxIt << std::endl;
    
    return 0;
}`,
                    description: '展示常用的查找算法。'
                },
                {
                    title: '数值与集合算法',
                    code: `#include <iostream>
#include <numeric>
#include <algorithm>
#include <vector>

int main() {
    // 数值算法
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    int sum = std::accumulate(vec.begin(), vec.end(), 0);
    std::cout << "累加和: " << sum << std::endl;
    
    int product = std::accumulate(vec.begin(), vec.end(), 1, 
                                  std::multiplies<int>());
    std::cout << "累乘积: " << product << std::endl;
    
    // 部分和
    std::vector<int> partial(5);
    std::partial_sum(vec.begin(), vec.end(), partial.begin());
    std::cout << "部分和: ";
    for (int x : partial) std::cout << x << " ";
    std::cout << std::endl;
    
    // 集合算法
    std::vector<int> a = {1, 2, 3, 4, 5};
    std::vector<int> b = {3, 4, 5, 6, 7};
    
    // 交集
    std::vector<int> inter(10);
    auto it = std::set_intersection(a.begin(), a.end(), 
                                     b.begin(), b.end(), inter.begin());
    inter.resize(it - inter.begin());
    
    std::cout << "\\n交集: ";
    for (int x : inter) std::cout << x << " ";
    std::cout << std::endl;
    
    // 并集
    std::vector<int> uni(10);
    it = std::set_union(a.begin(), a.end(), b.begin(), b.end(), uni.begin());
    uni.resize(it - uni.begin());
    
    std::cout << "并集: ";
    for (int x : uni) std::cout << x << " ";
    std::cout << std::endl;
    
    // 差集
    std::vector<int> diff(10);
    it = std::set_difference(a.begin(), a.end(), b.begin(), b.end(), diff.begin());
    diff.resize(it - diff.begin());
    
    std::cout << "差集(a-b): ";
    for (int x : diff) std::cout << x << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示数值和集合算法。'
                }
            ],
            handsOn: {
                title: '算法综合应用',
                description: '综合使用各种算法处理数据。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <numeric>
#include <vector>
#include <string>

int main() {
    std::vector<int> data = {5, 2, 8, 1, 9, 3, 7, 4, 6, 10, 3, 5, 2};
    
    // 任务1：排序并去重
    // TODO: 使用sort和unique
    
    std::cout << "排序去重后: ";
    // TODO: 输出结果
    
    // 任务2：查找第一个大于5的元素
    // TODO: 使用find_if
    
    std::cout << "\\n第一个大于5的元素: " << /* TODO */ << std::endl;
    
    // 任务3：计算总和与平均值
    // TODO: 使用accumulate
    
    std::cout << "总和: " << /* TODO */ << std::endl;
    std::cout << "平均值: " << /* TODO */ << std::endl;
    
    // 任务4：筛选出偶数
    // TODO: 使用copy_if
    
    std::vector<int> evens;
    // TODO: 实现
    
    std::cout << "\\n偶数: ";
    // TODO: 输出结果
    
    // 任务5：找出前3大的元素
    // TODO: 使用partial_sort或nth_element
    
    std::cout << "\\n前3大的元素: ";
    // TODO: 输出结果
    
    // 任务6：生成排列
    std::vector<int> perm = {1, 2, 3};
    std::cout << "\\n所有排列:" << std::endl;
    // TODO: 使用next_permutation输出所有排列
    
    return 0;
}`,
                expectedOutput: `排序去重后: 1 2 3 4 5 6 7 8 9 10 

第一个大于5的元素: 8
总和: 65
平均值: 5

偶数: 2 8 4 6 10 2 

前3大的元素: 10 9 8 

所有排列:
1 2 3 
1 3 2 
2 1 3 
2 3 1 
3 1 2 
3 2 1`,
                solutionRegex: 'sort|unique|find_if|accumulate|copy_if|partial_sort|nth_element|next_permutation',
                hint: '使用erase-remove惯用法去重，partial_sort找前n大，next_permutation生成排列',
                xp: 250
            },
            references: [
                { title: '算法概览', book: 'C++ Primer 第五版', chapter: '第10章' },
                { title: '算法详解', book: 'The C++ Standard Library', chapter: '第11章' }
            ],
            assistantTips: [
                '二分查找要求数据必须有序',
                'remove不真正删除元素，需要配合erase',
                'unique只去除相邻重复，需要先排序',
                '数值算法定义在<numeric>头文件中'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'binary_search要求序列必须是？', 
                    options: [
                        { text: '无序的' }, 
                        { text: '有序的', correct: true }, 
                        { text: '唯一的' }, 
                        { text: '连续的' }
                    ], 
                    explanation: 'binary_search使用二分查找，要求数据必须有序。' 
                },
                { 
                    type: 'single', 
                    question: 'lower_bound返回什么？', 
                    options: [
                        { text: '第一个等于value的元素' }, 
                        { text: '第一个不小于value的元素', correct: true }, 
                        { text: '最后一个等于value的元素' }, 
                        { text: '第一个大于value的元素' }
                    ], 
                    explanation: 'lower_bound返回第一个不小于value的元素位置。' 
                },
                { 
                    type: 'single', 
                    question: 'partial_sort的作用是？', 
                    options: [
                        { text: '完全排序' }, 
                        { text: '部分排序，前n个元素有序', correct: true }, 
                        { text: '随机排序' }, 
                        { text: '反转排序' }
                    ], 
                    explanation: 'partial_sort使前n个元素有序，其余元素位置不确定。' 
                },
                { 
                    type: 'single', 
                    question: 'accumulate定义在哪个头文件？', 
                    options: [
                        { text: '<algorithm>' }, 
                        { text: '<numeric>', correct: true }, 
                        { text: '<functional>' }, 
                        { text: '<iterator>' }
                    ], 
                    explanation: 'accumulate等数值算法定义在<numeric>头文件中。' 
                },
                { 
                    type: 'single', 
                    question: 'next_permutation返回什么？', 
                    options: [
                        { text: '下一个排列' }, 
                        { text: 'bool，表示是否还有下一个排列', correct: true }, 
                        { text: '排列数量' }, 
                        { text: 'void' }
                    ], 
                    explanation: 'next_permutation返回bool，true表示成功生成下一个排列。' 
                }
            ]
        },
        {
            id: '17.9',
            title: '并行算法（C++17）简介',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 并行算法（C++17）

### 什么是并行算法？

C++17引入了并行版本的STL算法，可以自动利用多核处理器进行并行计算。

\`\`\`cpp
#include <algorithm>
#include <execution>
#include <vector>

std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};

// 并行排序
std::sort(std::execution::par, vec.begin(), vec.end());
\`\`\`

### 执行策略

C++17定义了三种执行策略：

#### 1. sequenced_policy（seq）

顺序执行，不并行。

\`\`\`cpp
#include <execution>

std::sort(std::execution::seq, vec.begin(), vec.end());
// 等价于 std::sort(vec.begin(), vec.end());
\`\`\`

#### 2. parallel_policy（par）

并行执行，可能使用多线程。

\`\`\`cpp
std::sort(std::execution::par, vec.begin(), vec.end());
\`\`\`

#### 3. parallel_unsequenced_policy（par_unseq）

并行且向量化执行，可能使用SIMD指令。

\`\`\`cpp
std::sort(std::execution::par_unseq, vec.begin(), vec.end());
\`\`\`

### 支持并行算法的标准算法

大多数算法都有并行版本：

\`\`\`cpp
#include <algorithm>
#include <execution>
#include <vector>
#include <numeric>

std::vector<int> vec(1000000, 1);

// 并行算法示例
std::sort(std::execution::par, vec.begin(), vec.end());
std::for_each(std::execution::par, vec.begin(), vec.end(), [](int& x) {
    x *= 2;
});
std::transform(std::execution::par, vec.begin(), vec.end(), vec.begin(),
               [](int x) { return x * x; });
std::count_if(std::execution::par, vec.begin(), vec.end(),
              [](int x) { return x > 0; });
std::copy(std::execution::par, vec.begin(), vec.end(), dst.begin());
std::fill(std::execution::par, vec.begin(), vec.end(), 0);
std::replace(std::execution::par, vec.begin(), vec.end(), 0, 1);
\`\`\`

### 并行算法的注意事项

#### 1. 数据竞争

并行算法要求操作是线程安全的：

\`\`\`cpp
// 危险：数据竞争
int sum = 0;
std::for_each(std::execution::par, vec.begin(), vec.end(), [&sum](int x) {
    sum += x;  // 数据竞争！
});

// 正确：使用原子操作或互斥量
std::atomic<int> sum{0};
std::for_each(std::execution::par, vec.begin(), vec.end(), [&sum](int x) {
    sum += x;  // 原子操作，安全
});

// 更好：使用并行reduce
int sum = std::reduce(std::execution::par, vec.begin(), vec.end(), 0);
\`\`\`

#### 2. 函数对象要求

并行算法对函数对象有更严格的要求：

\`\`\`cpp
// 函数对象必须可复制
// 不能依赖内部状态（除非是线程安全的）
\`\`\`

### 新增的并行算法

#### reduce

并行版本的accumulate：

\`\`\`cpp
#include <numeric>
#include <execution>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 并行求和
int sum = std::reduce(std::execution::par, vec.begin(), vec.end(), 0);

// 自定义操作
int product = std::reduce(std::execution::par, vec.begin(), vec.end(), 1,
                          std::multiplies<int>());
\`\`\`

#### transform_reduce

并行版本的transform + reduce：

\`\`\`cpp
#include <numeric>
#include <execution>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 先变换再归约
int sumOfSquares = std::transform_reduce(
    std::execution::par,
    vec.begin(), vec.end(),
    0,                    // 初始值
    std::plus<int>(),     // 归约操作
    [](int x) { return x * x; }  // 变换操作
);
\`\`\`

#### inclusive_scan / exclusive_scan

并行版本的部分和：

\`\`\`cpp
#include <numeric>
#include <execution>

std::vector<int> vec = {1, 2, 3, 4, 5};
std::vector<int> result(5);

// inclusive_scan: 包含当前元素
std::inclusive_scan(std::execution::par, vec.begin(), vec.end(), result.begin());
// 结果: 1, 3, 6, 10, 15

// exclusive_scan: 不包含当前元素
std::exclusive_scan(std::execution::par, vec.begin(), vec.end(), result.begin(), 0);
// 结果: 0, 1, 3, 6, 10
\`\`\`

#### for_each_n

并行版本的for_each，处理前n个元素：

\`\`\`cpp
#include <algorithm>
#include <execution>

std::vector<int> vec(100);

std::for_each_n(std::execution::par, vec.begin(), 50, [](int& x) {
    x = 1;
});
\`\`\`

### 性能考虑

\`\`\`cpp
#include <algorithm>
#include <execution>
#include <vector>
#include <chrono>
#include <iostream>

int main() {
    const int N = 10000000;
    std::vector<int> vec(N);
    for (int i = 0; i < N; ++i) vec[i] = rand();
    
    // 顺序排序
    auto start = std::chrono::high_resolution_clock::now();
    std::sort(std::execution::seq, vec.begin(), vec.end());
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "顺序: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    // 重新打乱
    for (int i = 0; i < N; ++i) vec[i] = rand();
    
    // 并行排序
    start = std::chrono::high_resolution_clock::now();
    std::sort(std::execution::par, vec.begin(), vec.end());
    end = std::chrono::high_resolution_clock::now();
    std::cout << "并行: "
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    return 0;
}
\`\`\`

### 使用建议

1. **大数据集才使用并行**：小数据集并行开销可能超过收益
2. **注意数据竞争**：确保操作是线程安全的
3. **选择合适的策略**：根据场景选择seq、par或par_unseq
4. **测试性能**：并行不一定更快，需要实际测试`,
            examples: [
                {
                    title: '并行算法基础',
                    code: `#include <iostream>
#include <algorithm>
#include <execution>
#include <vector>
#include <numeric>
#include <chrono>
#include <random>

int main() {
    const int N = 1000000;
    std::vector<int> vec(N);
    
    // 填充随机数
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 100);
    for (int& x : vec) x = dis(gen);
    
    std::cout << "数据量: " << N << std::endl;
    
    // 顺序求和
    auto start = std::chrono::high_resolution_clock::now();
    long long sum1 = std::accumulate(vec.begin(), vec.end(), 0LL);
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "顺序求和: " << sum1 << ", 耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    // 并行求和
    start = std::chrono::high_resolution_clock::now();
    long long sum2 = std::reduce(std::execution::par, vec.begin(), vec.end(), 0LL);
    end = std::chrono::high_resolution_clock::now();
    std::cout << "并行求和: " << sum2 << ", 耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    // 并行计数
    start = std::chrono::high_resolution_clock::now();
    long long cnt = std::count_if(std::execution::par, vec.begin(), vec.end(),
                                   [](int x) { return x > 50; });
    end = std::chrono::high_resolution_clock::now();
    std::cout << "大于50的元素: " << cnt << ", 耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    // 并行变换
    start = std::chrono::high_resolution_clock::now();
    std::transform(std::execution::par, vec.begin(), vec.end(), vec.begin(),
                   [](int x) { return x * 2; });
    end = std::chrono::high_resolution_clock::now();
    std::cout << "并行变换耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    return 0;
}`,
                    description: '展示并行算法的基本使用和性能对比。'
                },
                {
                    title: '并行算法注意事项',
                    code: `#include <iostream>
#include <algorithm>
#include <execution>
#include <vector>
#include <numeric>
#include <atomic>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 正确：使用reduce代替accumulate
    long long sum = std::reduce(std::execution::par, vec.begin(), vec.end(), 0LL);
    std::cout << "并行求和: " << sum << std::endl;
    
    // 正确：使用transform_reduce
    long long sumOfSquares = std::transform_reduce(
        std::execution::par,
        vec.begin(), vec.end(),
        0LL,
        std::plus<>(),
        [](int x) { return x * x; }
    );
    std::cout << "平方和: " << sumOfSquares << std::endl;
    
    // 并行排序
    std::vector<int> data = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    std::sort(std::execution::par, data.begin(), data.end());
    
    std::cout << "并行排序后: ";
    for (int val : data) std::cout << val << " ";
    std::cout << std::endl;
    
    // 并行填充
    std::vector<int> filled(10);
    std::fill(std::execution::par, filled.begin(), filled.end(), 42);
    
    std::cout << "并行填充: ";
    for (int val : filled) std::cout << val << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示并行算法的正确使用方式。'
                }
            ],
            handsOn: {
                title: '并行算法实践',
                description: '体验并行算法的使用和性能差异。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <execution>
#include <vector>
#include <numeric>
#include <chrono>

int main() {
    // 创建大数据集
    const int N = 1000000;
    std::vector<int> vec(N);
    for (int i = 0; i < N; ++i) {
        vec[i] = i + 1;
    }
    
    std::cout << "数据量: " << N << std::endl;
    
    // 任务1：比较顺序和并行求和
    // TODO: 使用accumulate顺序求和
    auto start = std::chrono::high_resolution_clock::now();
    long long sum1 = /* TODO */;
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "顺序求和: " << sum1 << ", 耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    // TODO: 使用reduce并行求和
    start = std::chrono::high_resolution_clock::now();
    long long sum2 = /* TODO */;
    end = std::chrono::high_resolution_clock::now();
    std::cout << "并行求和: " << sum2 << ", 耗时: "
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << "us" << std::endl;
    
    // 任务2：使用transform_reduce计算平方和
    // TODO: 使用transform_reduce并行计算平方和
    
    long long sqSum = /* TODO */;
    std::cout << "\\n平方和: " << sqSum << std::endl;
    
    // 任务3：并行计数
    // TODO: 使用count_if统计偶数个数
    
    long long evenCount = /* TODO */;
    std::cout << "偶数个数: " << evenCount << std::endl;
    
    return 0;
}`,
                expectedOutput: `数据量: 1000000
顺序求和: 500000500000, 耗时: XXXXus
并行求和: 500000500000, 耗时: XXXXus

平方和: 333333833333500000
偶数个数: 500000`,
                solutionRegex: 'accumulate|reduce|transform_reduce|count_if|execution::par',
                hint: '使用std::reduce和std::execution::par进行并行计算',
                xp: 180
            },
            references: [
                { title: '并行算法', book: 'C++17 - The Complete Guide', chapter: '第10章' },
                { title: '执行策略', book: 'The C++ Standard Library', chapter: '第11章' }
            ],
            assistantTips: [
                '并行算法适合大数据集，小数据集可能更慢',
                '注意数据竞争，使用原子操作或reduce',
                'par_unseq可能使用SIMD指令加速',
                '实际性能需要测试，并行不一定更快'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::execution::par表示什么？', 
                    options: [
                        { text: '顺序执行' }, 
                        { text: '并行执行', correct: true }, 
                        { text: '向量化执行' }, 
                        { text: '延迟执行' }
                    ], 
                    explanation: 'par表示并行执行策略，可能使用多线程。' 
                },
                { 
                    type: 'single', 
                    question: '并行算法中直接修改共享变量会导致什么？', 
                    options: [
                        { text: '编译错误' }, 
                        { text: '数据竞争', correct: true }, 
                        { text: '性能提升' }, 
                        { text: '自动同步' }
                    ], 
                    explanation: '并行算法中直接修改共享变量会导致数据竞争，结果不确定。' 
                },
                { 
                    type: 'single', 
                    question: 'std::reduce相比std::accumulate的优势是？', 
                    options: [
                        { text: '更简单' }, 
                        { text: '可以并行执行', correct: true }, 
                        { text: '更安全' }, 
                        { text: '支持更多类型' }
                    ], 
                    explanation: 'reduce可以并行执行，在大数据集上更快。' 
                },
                { 
                    type: 'single', 
                    question: 'par_unseq相比par多了什么？', 
                    options: [
                        { text: '更多线程' }, 
                        { text: '向量化执行（SIMD）', correct: true }, 
                        { text: '更安全' }, 
                        { text: '更简单' }
                    ], 
                    explanation: 'par_unseq可能使用SIMD指令进行向量化执行。' 
                },
                { 
                    type: 'single', 
                    question: '什么时候应该使用并行算法？', 
                    options: [
                        { text: '所有情况' }, 
                        { text: '大数据集且操作可并行化', correct: true }, 
                        { text: '小数据集' }, 
                        { text: '单核CPU' }
                    ], 
                    explanation: '并行算法适合大数据集且操作可并行化的场景，小数据集可能更慢。' 
                }
            ]
        }
    ]
};

window.Unit17Data = Unit17Data;
