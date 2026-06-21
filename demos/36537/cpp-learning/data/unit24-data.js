/**
 * 单元24：C++11/14/17/20/23 核心特性专题
 * 深入学习现代C++的核心语言特性
 */
const Unit24Data = {
    id: 24,
    title: 'C++11/14/17/20/23 核心特性专题',
    description: '深入学习现代C++的核心语言特性，从C++11的基础改进到C++23的最新特性',
    lessons: [
        {
            id: '24.1',
            title: '初始化列表与统一初始化',
            duration: '30分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 初始化列表与统一初始化

C++11引入了统一初始化语法（Uniform Initialization），旨在提供一种一致的初始化方式。

### 初始化列表 std::initializer_list

\`\`\`cpp
#include <initializer_list>
#include <vector>

// 使用初始化列表
void print(std::initializer_list<int> list) {
    for (auto n : list) {
        std::cout << n << " ";
    }
}

// 容器支持初始化列表
std::vector<int> v = {1, 2, 3, 4, 5};
\`\`\`

### 统一初始化语法

使用花括号 \`{}\` 进行初始化：

\`\`\`cpp
// 基本类型
int x{42};
double d{3.14};
std::string s{"Hello"};

// 数组
int arr[]{1, 2, 3, 4, 5};

// 对象
struct Point {
    int x, y;
};
Point p{10, 20};

// 容器
std::vector<int> vec{1, 2, 3};
std::map<int, std::string> m{{1, "one"}, {2, "two"}};
\`\`\`

### 列表初始化的优势

1. **防止窄化转换**：
\`\`\`cpp
int x = 3.14;     // 警告，但允许
int y{3.14};      // 编译错误！防止窄化
\`\`\`

2. **统一语法**：
\`\`\`cpp
// 传统方式多样
int a = 10;
int b(10);
int c = int(10);

// 统一初始化
int d{10};
\`\`\`

### 最令人烦恼的解析（Most Vexing Parse）

\`\`\`cpp
// 传统方式的问题
struct Widget {
    Widget() {}
    Widget(int) {}
};

Widget w1();      // 函数声明，不是对象！
Widget w2{ };     // 对象初始化，明确

// 另一个例子
std::vector<int> v();    // 函数声明
std::vector<int> v{};    // 对象
\`\`\`

### 自定义类型支持初始化列表

\`\`\`cpp
class MyVector {
    std::vector<int> data;
public:
    MyVector(std::initializer_list<int> list) 
        : data(list) {}
    
    void push_back(int n) { data.push_back(n); }
};

MyVector mv{1, 2, 3, 4, 5};
\`\`\`

### 初始化列表的优先级

当构造函数和初始化列表构造函数同时存在时：

\`\`\`cpp
class Widget {
public:
    Widget() { std::cout << "default\\n"; }
    Widget(std::initializer_list<int>) { 
        std::cout << "initializer_list\\n"; 
    }
    Widget(int) { std::cout << "int\\n"; }
};

Widget w1{};      // 默认构造
Widget w2{42};    // initializer_list！（int被包装）
Widget w3(42);    // int构造
\`\`\``,
            examples: [
                {
                    title: '统一初始化基础示例',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <map>

struct Point {
    int x, y;
};

class Container {
    std::vector<int> data;
public:
    Container(std::initializer_list<int> list) 
        : data(list) {
        std::cout << "初始化列表构造，大小: " << data.size() << std::endl;
    }
    
    void print() const {
        for (int n : data) {
            std::cout << n << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    // 基本类型统一初始化
    int x{42};
    double d{3.14159};
    std::string s{"Hello C++11"};
    
    std::cout << "x = " << x << std::endl;
    std::cout << "d = " << d << std::endl;
    std::cout << "s = " << s << std::endl;
    
    // 数组初始化
    int arr[]{1, 2, 3, 4, 5};
    std::cout << "数组: ";
    for (int n : arr) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // 结构体初始化
    Point p{10, 20};
    std::cout << "Point: (" << p.x << ", " << p.y << ")" << std::endl;
    
    // 容器初始化
    std::vector<int> vec{1, 2, 3, 4, 5};
    std::cout << "Vector大小: " << vec.size() << std::endl;
    
    // Map初始化
    std::map<int, std::string> m{
        {1, "one"},
        {2, "two"},
        {3, "three"}
    };
    std::cout << "Map大小: " << m.size() << std::endl;
    
    // 自定义类型初始化列表
    Container c{10, 20, 30, 40, 50};
    c.print();
    
    return 0;
}`
                },
                {
                    title: '防止窄化转换',
                    code: `#include <iostream>
#include <vector>

int main() {
    std::cout << "=== 列表初始化防止窄化转换 ===" << std::endl;
    
    // 传统初始化 - 可能发生窄化转换
    double d = 3.14;
    int a = d;  // 隐式转换，丢失小数部分
    std::cout << "传统初始化: int a = " << d << " -> " << a << std::endl;
    
    // 列表初始化 - 防止窄化转换
    // int b{d};  // 编译错误！不能窄化
    
    // 正确做法
    int b{static_cast<int>(d)};
    std::cout << "列表初始化: int b{static_cast<int>(" << d << ")} -> " << b << std::endl;
    
    // 浮点数示例
    float f{3.14f};      // OK
    // float f2{3.14};   // 错误！double到float是窄化
    
    std::cout << "\\n=== 容器初始化 ===" << std::endl;
    
    // 嵌套初始化
    std::vector<std::vector<int>> matrix{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    
    std::cout << "矩阵:" << std::endl;
    for (const auto& row : matrix) {
        for (int n : row) {
            std::cout << n << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现支持初始化列表的队列类',
                description: '创建一个队列类，支持使用初始化列表进行初始化，并提供基本的队列操作。',
                initialCode: `#include <iostream>
#include <initializer_list>
#include <deque>
#include <string>

// TODO: 实现一个支持初始化列表的队列类
template<typename T>
class InitQueue {
private:
    // TODO: 定义数据成员
    
public:
    // TODO: 默认构造函数
    
    // TODO: 初始化列表构造函数
    // InitQueue(std::initializer_list<T> list)
    
    // TODO: 入队操作 void enqueue(const T& value)
    
    // TODO: 出队操作 T dequeue()
    
    // TODO: 查看队头 const T& front() const
    
    // TODO: 查看队尾 const T& back() const
    
    // TODO: 判断是否为空 bool empty() const
    
    // TODO: 获取大小 size_t size() const
    
    // TODO: 打印队列内容 void print() const
};

int main() {
    // 使用初始化列表创建队列
    InitQueue<int> q1{1, 2, 3, 4, 5};
    std::cout << "初始队列: ";
    q1.print();
    
    // 测试队列操作
    q1.enqueue(6);
    std::cout << "入队6后: ";
    q1.print();
    
    int val = q1.dequeue();
    std::cout << "出队" << val << "后: ";
    q1.print();
    
    std::cout << "队头: " << q1.front() << std::endl;
    std::cout << "队尾: " << q1.back() << std::endl;
    std::cout << "大小: " << q1.size() << std::endl;
    
    // 字符串队列
    InitQueue<std::string> q2{"Hello", "World", "C++"};
    std::cout << "\\n字符串队列: ";
    q2.print();
    
    return 0;
}`,
                solution: `#include <iostream>
#include <initializer_list>
#include <deque>
#include <string>

template<typename T>
class InitQueue {
private:
    std::deque<T> data;
    
public:
    InitQueue() = default;
    
    InitQueue(std::initializer_list<T> list) 
        : data(list) {}
    
    void enqueue(const T& value) {
        data.push_back(value);
    }
    
    T dequeue() {
        if (data.empty()) {
            throw std::runtime_error("Queue is empty");
        }
        T value = data.front();
        data.pop_front();
        return value;
    }
    
    const T& front() const {
        return data.front();
    }
    
    const T& back() const {
        return data.back();
    }
    
    bool empty() const {
        return data.empty();
    }
    
    size_t size() const {
        return data.size();
    }
    
    void print() const {
        std::cout << "[";
        for (size_t i = 0; i < data.size(); ++i) {
            std::cout << data[i];
            if (i < data.size() - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
};

int main() {
    InitQueue<int> q1{1, 2, 3, 4, 5};
    std::cout << "初始队列: ";
    q1.print();
    
    q1.enqueue(6);
    std::cout << "入队6后: ";
    q1.print();
    
    int val = q1.dequeue();
    std::cout << "出队" << val << "后: ";
    q1.print();
    
    std::cout << "队头: " << q1.front() << std::endl;
    std::cout << "队尾: " << q1.back() << std::endl;
    std::cout << "大小: " << q1.size() << std::endl;
    
    InitQueue<std::string> q2{"Hello", "World", "C++"};
    std::cout << "\\n字符串队列: ";
    q2.print();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪种初始化方式会防止窄化转换？',
                    options: ['int x = 3.14;', 'int x(3.14);', 'int x{3.14};', 'int x = int(3.14);'],
                    correct: 2,
                    explanation: '列表初始化（使用花括号{}）会防止窄化转换，int x{3.14}会编译错误，因为double到int是窄化转换。'
                },
                {
                    question: 'std::initializer_list 的主要用途是什么？',
                    options: ['存储任意数量的对象', '支持花括号初始化列表语法', '替代std::vector', '用于动态内存分配'],
                    correct: 1,
                    explanation: 'std::initializer_list主要用于支持花括号初始化列表语法，允许类型接受{...}形式的初始化。'
                },
                {
                    question: '关于"最令人烦恼的解析"（Most Vexing Parse），以下说法正确的是？',
                    options: ['只发生在函数声明中', 'Widget w()声明了一个Widget对象', 'Widget w{}可以避免这个问题', '这个问题在C++11中已完全解决'],
                    correct: 2,
                    explanation: 'Widget w()会被解析为函数声明而非对象定义，使用Widget w{}可以明确表示对象初始化，避免歧义。'
                },
                {
                    question: '当类同时有普通构造函数和initializer_list构造函数时，Widget w{42}会调用哪个？',
                    options: ['普通构造函数Widget(int)', 'initializer_list构造函数', '编译错误，有歧义', '取决于编译器实现'],
                    correct: 1,
                    explanation: '当同时存在普通构造函数和initializer_list构造函数时，花括号初始化会优先选择initializer_list版本。'
                },
                {
                    question: '以下代码的输出是什么？std::vector<int> v{5};',
                    options: ['创建包含5个0的vector', '创建包含一个元素5的vector', '编译错误', '创建大小为5的未初始化vector'],
                    correct: 1,
                    explanation: '使用花括号初始化时，{5}表示一个包含元素5的初始化列表，所以创建一个包含单个元素5的vector。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Initialization',
                    url: 'https://en.cppreference.com/w/cpp/language/initialization'
                },
                {
                    title: 'Effective Modern C++ - Item 7',
                    url: 'https://www.aristeia.com/EMC++.html'
                }
            ],
            assistantTips: '统一初始化是现代C++的重要特性，建议优先使用{}进行初始化。但要注意initializer_list构造函数的优先级问题，在容器类设计时要特别小心。'
        },
        {
            id: '24.2',
            title: '范围 for 循环',
            duration: '25分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 240,
            concepts: `## 范围 for 循环

C++11引入的范围for循环（Range-based for loop）提供了一种简洁的方式来遍历序列。

### 基本语法

\`\`\`cpp
for (declaration : range) {
    // 循环体
}
\`\`\`

### 基本用法

\`\`\`cpp
#include <vector>
#include <iostream>

// 遍历数组
int arr[] = {1, 2, 3, 4, 5};
for (int n : arr) {
    std::cout << n << " ";
}

// 遍历vector
std::vector<int> vec = {1, 2, 3, 4, 5};
for (int n : vec) {
    std::cout << n << " ";
}

// 使用auto
for (auto n : vec) {
    std::cout << n << " ";
}
\`\`\`

### 引用与值

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 值拷贝 - 不能修改原元素
for (auto n : vec) {
    n *= 2;  // 只修改副本
}

// 引用 - 可以修改原元素
for (auto& n : vec) {
    n *= 2;  // 修改原元素
}

// 常量引用 - 避免拷贝，禁止修改
for (const auto& n : vec) {
    std::cout << n << " ";  // 只读访问
}
\`\`\`

### 支持的范围类型

范围for循环支持以下类型：

1. **数组**：
\`\`\`cpp
int arr[] = {1, 2, 3};
for (int n : arr) { }
\`\`\`

2. **标准容器**：
\`\`\`cpp
std::vector<int> v;
std::list<int> l;
std::set<int> s;
std::map<int, int> m;
\`\`\`

3. **初始化列表**：
\`\`\`cpp
for (int n : {1, 2, 3, 4, 5}) { }
\`\`\`

4. **字符串**：
\`\`\`cpp
std::string s = "Hello";
for (char c : s) { }
\`\`\`

### 工作原理

范围for循环等价于：

\`\`\`cpp
// 范围for
for (auto& elem : container) { }

// 等价于
for (auto it = container.begin(); it != container.end(); ++it) {
    auto& elem = *it;
}
\`\`\`

### C++20 增强

C++20支持带初始化的范围for：

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

for (int i = 0; auto& n : vec) {
    n = i++;
}
\`\`\``,
            examples: [
                {
                    title: '范围for循环基础用法',
                    code: `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <map>
#include <string>

int main() {
    std::cout << "=== 遍历数组 ===" << std::endl;
    int arr[] = {1, 2, 3, 4, 5};
    for (int n : arr) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 遍历vector ===" << std::endl;
    std::vector<int> vec = {10, 20, 30, 40, 50};
    for (const auto& n : vec) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 遍历list ===" << std::endl;
    std::list<std::string> names = {"Alice", "Bob", "Charlie"};
    for (const auto& name : names) {
        std::cout << name << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 遍历set ===" << std::endl;
    std::set<int> s = {5, 3, 1, 4, 2};
    for (int n : s) {
        std::cout << n << " ";  // 自动排序输出
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 遍历map ===" << std::endl;
    std::map<std::string, int> scores = {
        {"Alice", 95},
        {"Bob", 87},
        {"Charlie", 92}
    };
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    std::cout << "\\n=== 遍历string ===" << std::endl;
    std::string text = "Hello";
    for (char c : text) {
        std::cout << c << "-";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 使用初始化列表 ===" << std::endl;
    for (int n : {100, 200, 300}) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`
                },
                {
                    title: '引用与值的区别',
                    code: `#include <iostream>
#include <vector>
#include <string>

class Widget {
public:
    int value;
    Widget(int v) : value(v) {
        std::cout << "构造 Widget(" << v << ")" << std::endl;
    }
    Widget(const Widget& other) : value(other.value) {
        std::cout << "拷贝 Widget(" << value << ")" << std::endl;
    }
    ~Widget() {
        std::cout << "析构 Widget(" << value << ")" << std::endl;
    }
};

int main() {
    std::cout << "=== 值拷贝（会产生拷贝）===" << std::endl;
    {
        std::vector<Widget> vec;
        vec.emplace_back(1);
        vec.emplace_back(2);
        
        std::cout << "开始遍历:" << std::endl;
        for (auto w : vec) {  // 每次都拷贝！
            std::cout << "  value = " << w.value << std::endl;
        }
        std::cout << "遍历结束" << std::endl;
    }
    
    std::cout << "\\n=== 引用（避免拷贝）===" << std::endl;
    {
        std::vector<Widget> vec;
        vec.emplace_back(1);
        vec.emplace_back(2);
        
        std::cout << "开始遍历:" << std::endl;
        for (const auto& w : vec) {  // 无拷贝
            std::cout << "  value = " << w.value << std::endl;
        }
        std::cout << "遍历结束" << std::endl;
    }
    
    std::cout << "\\n=== 修改元素 ===" << std::endl;
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    std::cout << "原始: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // 值拷贝 - 不修改原元素
    for (auto n : numbers) {
        n *= 2;
    }
    std::cout << "值拷贝后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // 引用 - 修改原元素
    for (auto& n : numbers) {
        n *= 2;
    }
    std::cout << "引用修改后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用范围for处理数据',
                description: '使用范围for循环实现数据统计和转换功能。',
                initialCode: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>

struct Student {
    std::string name;
    int score;
};

int main() {
    std::vector<Student> students = {
        {"Alice", 95},
        {"Bob", 87},
        {"Charlie", 92},
        {"David", 78},
        {"Eve", 88}
    };
    
    // TODO: 使用范围for计算平均分
    
    // TODO: 使用范围for找出最高分和最低分
    
    // TODO: 使用范围for将分数转换为等级（A:90+, B:80+, C:70+, D:60+, F:<60）
    
    // TODO: 使用范围for统计各等级人数
    
    // TODO: 使用范围for打印所有学生信息
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>

struct Student {
    std::string name;
    int score;
};

char scoreToGrade(int score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

int main() {
    std::vector<Student> students = {
        {"Alice", 95},
        {"Bob", 87},
        {"Charlie", 92},
        {"David", 78},
        {"Eve", 88}
    };
    
    // 计算平均分
    double sum = 0;
    for (const auto& s : students) {
        sum += s.score;
    }
    double average = sum / students.size();
    std::cout << "平均分: " << average << std::endl;
    
    // 找出最高分和最低分
    int maxScore = students[0].score;
    int minScore = students[0].score;
    std::string maxName, minName;
    
    for (const auto& s : students) {
        if (s.score > maxScore) {
            maxScore = s.score;
            maxName = s.name;
        }
        if (s.score < minScore) {
            minScore = s.score;
            minName = s.name;
        }
    }
    std::cout << "最高分: " << maxName << " (" << maxScore << ")" << std::endl;
    std::cout << "最低分: " << minName << " (" << minScore << ")" << std::endl;
    
    // 统计各等级人数
    std::map<char, int> gradeCount;
    for (const auto& s : students) {
        gradeCount[scoreToGrade(s.score)]++;
    }
    
    std::cout << "\\n等级分布:" << std::endl;
    for (const auto& [grade, count] : gradeCount) {
        std::cout << "  " << grade << ": " << count << "人" << std::endl;
    }
    
    // 打印所有学生信息
    std::cout << "\\n学生列表:" << std::endl;
    for (const auto& s : students) {
        std::cout << "  " << s.name << ": " << s.score 
                  << " (" << scoreToGrade(s.score) << ")" << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪种方式可以避免遍历容器时的元素拷贝？',
                    options: ['for (auto n : vec)', 'for (auto& n : vec)', 'for (int n : vec)', 'for (auto* n : vec)'],
                    correct: 1,
                    explanation: '使用引用auto&可以避免元素拷贝，直接访问容器中的元素。'
                },
                {
                    question: '范围for循环对std::map遍历时，每次迭代得到的元素类型是？',
                    options: ['键的类型', '值的类型', 'std::pair<const Key, Value>', '取决于声明方式'],
                    correct: 2,
                    explanation: '遍历std::map时，每次迭代得到的是std::pair<const Key, Value>类型的键值对。'
                },
                {
                    question: '以下代码的输出是什么？std::vector<int> v{1,2,3}; for (int& n : v) n *= 2; for (int n : v) std::cout << n;',
                    options: ['1 2 3', '2 4 6', '编译错误', '未定义行为'],
                    correct: 1,
                    explanation: '第一个循环使用引用修改元素，第二个循环输出修改后的值，所以输出2 4 6。'
                },
                {
                    question: '范围for循环可以用于以下哪种类型？',
                    options: ['只有标准容器', '数组和标准容器', '任何有begin()和end()的类型', '只有数组'],
                    correct: 2,
                    explanation: '范围for循环可以用于数组、标准容器，以及任何提供了begin()和end()成员函数或自由函数的类型。'
                },
                {
                    question: 'C++20的范围for循环新增了什么特性？',
                    options: ['支持反向遍历', '支持带初始化语句', '支持并行执行', '支持条件过滤'],
                    correct: 1,
                    explanation: 'C++20为范围for循环增加了初始化语句，如for (int i = 0; auto& n : vec)。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Range-based for loop',
                    url: 'https://en.cppreference.com/w/cpp/language/range-for'
                }
            ],
            assistantTips: '遍历容器时，优先使用const auto&避免不必要的拷贝。需要修改元素时使用auto&。C++17的结构化绑定可以让遍历map时代码更清晰。'
        },
        {
            id: '24.3',
            title: 'nullptr 关键字',
            duration: '20分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 200,
            concepts: `## nullptr 关键字

C++11引入了nullptr关键字，用于表示空指针，解决了NULL和0的歧义问题。

### 问题背景

在C++11之前，空指针使用NULL或0表示：

\`\`\`cpp
void f(int);
void f(int*);

f(0);      // 调用f(int)
f(NULL);   // 可能调用f(int)！因为NULL可能定义为0
\`\`\`

### nullptr 的优势

\`\`\`cpp
void f(int);
void f(int*);

f(0);        // 调用f(int)
f(nullptr);  // 明确调用f(int*)
\`\`\`

### nullptr 的类型

nullptr的类型是std::nullptr_t：

\`\`\`cpp
#include <cstddef>

std::nullptr_t np = nullptr;

// 可以隐式转换为任何指针类型
int* p1 = nullptr;
char* p2 = nullptr;
void (*fp)() = nullptr;
\`\`\`

### 不能转换为整数

\`\`\`cpp
int n1 = nullptr;  // 编译错误
int n2 = 0;        // OK

bool b1 = nullptr; // OK，但警告（可以转换为bool）
bool b2{nullptr};  // 编译错误（列表初始化不允许）
\`\`\`

### 模板中的使用

\`\`\`cpp
template<typename T>
void func(T arg) {
    // 如果T是int，arg是0
    // 如果T是int*，arg是空指针
}

func(0);        // T = int
func(nullptr);  // T = std::nullptr_t
func((int*)nullptr);  // T = int*
\`\`\`

### 最佳实践

\`\`\`cpp
// 推荐
int* p = nullptr;
if (p != nullptr) { }
if (p) { }  // 隐式转换为bool

// 不推荐
int* p = NULL;
int* p = 0;
\`\`\``,
            examples: [
                {
                    title: 'nullptr解决重载歧义',
                    code: `#include <iostream>

// 重载函数
void process(int value) {
    std::cout << "处理整数: " << value << std::endl;
}

void process(int* ptr) {
    if (ptr) {
        std::cout << "处理指针: " << *ptr << std::endl;
    } else {
        std::cout << "处理空指针" << std::endl;
    }
}

void process(double value) {
    std::cout << "处理浮点数: " << value << std::endl;
}

int main() {
    std::cout << "=== NULL vs nullptr ===" << std::endl;
    
    int x = 42;
    
    // 使用0
    process(0);          // 调用process(int)
    
    // 使用NULL（可能有问题）
    // process(NULL);    // 歧义：可能调用process(int)
    
    // 使用nullptr - 明确表示指针
    process(nullptr);    // 明确调用process(int*)
    
    // 正常调用
    process(x);          // process(int)
    process(&x);         // process(int*)
    process(3.14);       // process(double)
    
    std::cout << "\\n=== 指针检查 ===" << std::endl;
    
    int* p1 = nullptr;
    int* p2 = &x;
    
    std::cout << "p1是" << (p1 ? "非空" : "空") << std::endl;
    std::cout << "p2是" << (p2 ? "非空" : "空") << std::endl;
    
    // 与nullptr比较
    if (p1 == nullptr) {
        std::cout << "p1是空指针" << std::endl;
    }
    
    return 0;
}`
                },
                {
                    title: 'nullptr在模板中的应用',
                    code: `#include <iostream>
#include <typeinfo>
#include <memory>

// 检测参数类型的函数
template<typename T>
void checkType(T arg) {
    std::cout << "类型: " << typeid(T).name() << std::endl;
    std::cout << "值: " << arg << std::endl;
}

// 特化版本 - 指针类型
template<typename T>
void checkType(T* arg) {
    std::cout << "类型: " << typeid(T*).name() << " (指针)" << std::endl;
    if (arg) {
        std::cout << "值: " << *arg << std::endl;
    } else {
        std::cout << "值: 空指针" << std::endl;
    }
}

// nullptr_t 特化
void checkType(std::nullptr_t) {
    std::cout << "类型: std::nullptr_t" << std::endl;
    std::cout << "值: nullptr" << std::endl;
}

class Widget {
public:
    int value = 100;
};

int main() {
    std::cout << "=== 模板类型推导 ===" << std::endl;
    
    checkType(0);          // T = int
    checkType(nullptr);    // T = std::nullptr_t
    
    int x = 42;
    checkType(&x);         // T = int*
    
    Widget w;
    checkType(&w);         // T = Widget*
    
    Widget* wp = nullptr;
    checkType(wp);         // T = Widget*
    
    std::cout << "\\n=== 智能指针与nullptr ===" << std::endl;
    
    // 智能指针可以与nullptr比较
    std::unique_ptr<int> up1;
    std::unique_ptr<int> up2 = std::make_unique<int>(42);
    
    if (up1 == nullptr) {
        std::cout << "up1是空的" << std::endl;
    }
    if (up2 != nullptr) {
        std::cout << "up2包含: " << *up2 << std::endl;
    }
    
    // 重置为nullptr
    up2 = nullptr;
    std::cout << "重置后up2是" << (up2 ? "非空" : "空") << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现安全的指针包装类',
                description: '创建一个智能指针风格的包装类，正确处理nullptr。',
                initialCode: `#include <iostream>
#include <string>

template<typename T>
class SafePtr {
private:
    T* ptr;
    
public:
    // TODO: 默认构造函数（初始化为nullptr）
    
    // TODO: 接受原始指针的构造函数
    
    // TODO: 接受nullptr_t的构造函数
    
    // TODO: 解引用操作符 T& operator*()
    
    // TODO: 箭头操作符 T* operator->()
    
    // TODO: 布尔转换操作符 explicit operator bool()
    
    // TODO: 获取原始指针 T* get()
    
    // TODO: 重置为nullptr void reset()
    
    // TODO: 重置为新指针 void reset(T* p)
    
    // TODO: 与nullptr比较
    // bool operator==(std::nullptr_t) const
    // bool operator!=(std::nullptr_t) const
};

int main() {
    SafePtr<int> p1;
    std::cout << "p1是" << (p1 ? "非空" : "空") << std::endl;
    
    int x = 42;
    SafePtr<int> p2(&x);
    std::cout << "p2值: " << *p2 << std::endl;
    
    p2.reset();
    std::cout << "重置后p2是" << (p2 ? "非空" : "空") << std::endl;
    
    // 测试nullptr比较
    if (p1 == nullptr) {
        std::cout << "p1等于nullptr" << std::endl;
    }
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>

template<typename T>
class SafePtr {
private:
    T* ptr;
    
public:
    SafePtr() : ptr(nullptr) {}
    
    SafePtr(T* p) : ptr(p) {}
    
    SafePtr(std::nullptr_t) : ptr(nullptr) {}
    
    T& operator*() { 
        if (!ptr) throw std::runtime_error("空指针解引用");
        return *ptr; 
    }
    
    T* operator->() { 
        if (!ptr) throw std::runtime_error("空指针访问");
        return ptr; 
    }
    
    explicit operator bool() const { 
        return ptr != nullptr; 
    }
    
    T* get() { return ptr; }
    
    void reset() { ptr = nullptr; }
    
    void reset(T* p) { ptr = p; }
    
    bool operator==(std::nullptr_t) const { return ptr == nullptr; }
    bool operator!=(std::nullptr_t) const { return ptr != nullptr; }
};

int main() {
    SafePtr<int> p1;
    std::cout << "p1是" << (p1 ? "非空" : "空") << std::endl;
    
    int x = 42;
    SafePtr<int> p2(&x);
    std::cout << "p2值: " << *p2 << std::endl;
    
    p2.reset();
    std::cout << "重置后p2是" << (p2 ? "非空" : "空") << std::endl;
    
    if (p1 == nullptr) {
        std::cout << "p1等于nullptr" << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'nullptr的类型是什么？',
                    options: ['int', 'void*', 'std::nullptr_t', 'NULL'],
                    correct: 2,
                    explanation: 'nullptr的类型是std::nullptr_t，它可以隐式转换为任何指针类型，但不能转换为整数类型。'
                },
                {
                    question: '以下代码调用哪个函数？void f(int); void f(int*); f(nullptr);',
                    options: ['f(int)', 'f(int*)', '编译错误，有歧义', '运行时错误'],
                    correct: 1,
                    explanation: 'nullptr可以隐式转换为int*，所以调用f(int*)。这是nullptr的主要优势：明确表示空指针。'
                },
                {
                    question: '以下哪个语句是合法的？',
                    options: ['int n = nullptr;', 'int* p = nullptr;', 'int n{nullptr};', 'double d = nullptr;'],
                    correct: 1,
                    explanation: 'nullptr可以隐式转换为任何指针类型，但不能转换为整数类型（除了bool）。所以int* p = nullptr是合法的。'
                },
                {
                    question: '为什么推荐使用nullptr而不是NULL？',
                    options: ['nullptr性能更好', 'nullptr有明确的类型，避免重载歧义', 'NULL已被弃用', 'nullptr是C++标准'],
                    correct: 1,
                    explanation: 'NULL可能被定义为0或((void*)0)，在函数重载时可能导致歧义。nullptr有明确的类型std::nullptr_t，可以正确匹配指针类型的重载。'
                },
                {
                    question: '以下代码的输出是什么？std::unique_ptr<int> p; if (p) std::cout << "A"; else std::cout << "B";',
                    options: ['A', 'B', '编译错误', '运行时错误'],
                    correct: 1,
                    explanation: '默认构造的unique_ptr是空的（等于nullptr），在布尔上下文中转换为false，所以输出B。'
                }
            ],
            references: [
                {
                    title: 'cppreference - nullptr',
                    url: 'https://en.cppreference.com/w/cpp/language/nullptr'
                }
            ],
            assistantTips: '在现代C++中，始终使用nullptr表示空指针，避免使用NULL或0。nullptr的类型安全性可以避免很多隐蔽的bug。'
        },
        {
            id: '24.4',
            title: '= default / = delete',
            duration: '25分钟',
            difficulty: '基础',
            xp: 130,
            estimatedXp: 260,
            concepts: `## = default / = delete

C++11引入了=default和=delete，用于显式控制特殊成员函数的生成。

### 特殊成员函数

C++的类有六个特殊成员函数：

1. 默认构造函数
2. 析构函数
3. 拷贝构造函数
4. 拷贝赋值运算符
5. 移动构造函数（C++11）
6. 移动赋值运算符（C++11）

### = default

显式要求编译器生成默认实现：

\`\`\`cpp
class Widget {
public:
    Widget() = default;  // 默认构造函数
    
    Widget(const Widget&) = default;  // 拷贝构造
    Widget& operator=(const Widget&) = default;  // 拷贝赋值
    
    Widget(Widget&&) = default;  // 移动构造
    Widget& operator=(Widget&&) = default;  // 移动赋值
    
    ~Widget() = default;  // 析构函数
};
\`\`\`

### = delete

禁止编译器生成某些函数：

\`\`\`cpp
class NonCopyable {
public:
    NonCopyable() = default;
    
    // 禁止拷贝
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable& operator=(const NonCopyable&) = delete;
};
\`\`\`

### 三法则/五法则

如果需要自定义析构函数、拷贝构造或拷贝赋值，通常需要同时定义所有五个操作。

### 零法则

如果可能，让编译器自动生成所有特殊成员函数，使用智能指针和标准容器。`,
            examples: [
                {
                    title: '=default和=delete基础',
                    code: `#include <iostream>
#include <string>

// 不可拷贝的类
class NonCopyable {
public:
    NonCopyable() = default;
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable& operator=(const NonCopyable&) = delete;
};

// 禁止默认构造
class NoDefault {
public:
    int value;
    NoDefault(int v) : value(v) {}
    NoDefault() = delete;
};

int main() {
    NonCopyable nc1;
    // NonCopyable nc2 = nc1;  // 编译错误
    
    NoDefault nd(42);
    // NoDefault nd2;  // 编译错误
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现单例模式',
                description: '使用=delete实现单例模式。',
                initialCode: `#include <iostream>
#include <string>

class Singleton {
private:
    // TODO: 私有静态实例
    
    // TODO: 私有构造函数
    
public:
    // TODO: 删除拷贝构造函数
    // TODO: 删除拷贝赋值运算符
    
    // TODO: 静态获取实例方法
};

int main() {
    Singleton& s1 = Singleton::getInstance();
    Singleton& s2 = Singleton::getInstance();
    
    std::cout << "s1地址: " << &s1 << std::endl;
    std::cout << "s2地址: " << &s2 << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>

class Singleton {
private:
    static Singleton* instance;
    Singleton() = default;
    
public:
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
    
    static Singleton& getInstance() {
        if (!instance) {
            instance = new Singleton();
        }
        return *instance;
    }
};

Singleton* Singleton::instance = nullptr;

int main() {
    Singleton& s1 = Singleton::getInstance();
    Singleton& s2 = Singleton::getInstance();
    
    std::cout << "s1地址: " << &s1 << std::endl;
    std::cout << "s2地址: " << &s2 << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪个声明会阻止编译器自动生成移动构造函数？',
                    options: ['自定义默认构造函数', '自定义析构函数', '自定义拷贝构造函数', '使用=default'],
                    correct: 2,
                    explanation: '当自定义了拷贝构造函数时，编译器不会自动生成移动操作。'
                },
                {
                    question: '=delete可以用于以下哪些函数？',
                    options: ['只有特殊成员函数', '只有普通成员函数', '任何函数', '只有构造函数'],
                    correct: 2,
                    explanation: '=delete可以用于任何函数，包括特殊成员函数、普通成员函数、自由函数。'
                },
                {
                    question: '以下代码有什么问题？class A { A() = delete; };',
                    options: ['没有问题', '无法创建A的对象', '编译错误', '运行时错误'],
                    correct: 1,
                    explanation: '删除默认构造函数后，如果没有其他构造函数，就无法创建该类的对象。'
                },
                {
                    question: '关于=default，以下说法正确的是？',
                    options: ['只能用于默认构造函数', '可以在类外使用', '总是生成内联函数', '不能用于析构函数'],
                    correct: 1,
                    explanation: '=default可以在类定义内或类外使用。在类外使用时，函数会被定义为非内联的。'
                },
                {
                    question: '以下哪种情况适合使用=default？',
                    options: ['需要自定义拷贝逻辑', '需要禁止拷贝', '编译器默认实现足够', '需要虚析构函数'],
                    correct: 2,
                    explanation: '当编译器自动生成的默认实现足够时，使用=default明确表达意图。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Special member functions',
                    url: 'https://en.cppreference.com/w/cpp/language/member_functions'
                }
            ],
            assistantTips: '遵循"零法则"：优先使用智能指针和标准容器，让编译器自动生成特殊成员函数。'
        },
        {
            id: '24.5',
            title: '委托构造函数与继承构造函数',
            duration: '25分钟',
            difficulty: '中级',
            xp: 140,
            estimatedXp: 280,
            concepts: `## 委托构造函数与继承构造函数

C++11引入了委托构造函数和继承构造函数，简化了构造函数的编写。

### 委托构造函数

一个构造函数可以调用另一个构造函数：

\`\`\`cpp
class Widget {
    int x, y;
    std::string name;
    
public:
    // 目标构造函数
    Widget(int a, int b, const std::string& n) 
        : x(a), y(b), name(n) {}
    
    // 委托构造函数
    Widget() : Widget(0, 0, "default") {}
    Widget(int a) : Widget(a, 0, "partial") {}
};
\`\`\`

### 继承构造函数

C++11允许派生类继承基类的构造函数：

\`\`\`cpp
class Base {
public:
    Base(int x) { }
    Base(int x, int y) { }
};

class Derived : public Base {
public:
    using Base::Base;  // 继承所有构造函数
};
\`\`\``,
            examples: [
                {
                    title: '委托构造函数示例',
                    code: `#include <iostream>
#include <string>

class Student {
    std::string name;
    int age;
    double gpa;
    
public:
    // 主构造函数
    Student(const std::string& n, int a, double g) 
        : name(n), age(a), gpa(g) {
        std::cout << "创建学生: " << name << std::endl;
    }
    
    // 委托构造函数
    Student() : Student("Unknown", 18, 0.0) {}
    Student(const std::string& n) : Student(n, 18, 0.0) {}
};

int main() {
    Student s1;
    Student s2("Alice");
    Student s3("Bob", 20, 3.8);
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现配置类',
                description: '使用委托构造函数实现一个灵活的配置类。',
                initialCode: `#include <iostream>
#include <string>

class Config {
private:
    std::string filename;
    bool autoSave;
    int timeout;
    
public:
    // TODO: 主构造函数
    
    // TODO: 委托构造函数
};

int main() {
    Config c1;
    Config c2("app.cfg");
    Config c3("app.cfg", true, 30);
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>

class Config {
private:
    std::string filename;
    bool autoSave;
    int timeout;
    
public:
    Config(const std::string& file, bool save, int time)
        : filename(file), autoSave(save), timeout(time) {}
    
    Config() : Config("default.cfg", false, 10) {}
    Config(const std::string& file) : Config(file, false, 10) {}
    Config(const std::string& file, bool save) : Config(file, save, 10) {}
};

int main() {
    Config c1;
    Config c2("app.cfg");
    Config c3("app.cfg", true, 30);
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '委托构造函数的执行顺序是？',
                    options: ['先执行委托的构造函数', '先执行当前构造函数体', '同时执行', '取决于编译器'],
                    correct: 0,
                    explanation: '委托构造函数会先完成被委托的构造函数的执行。'
                },
                {
                    question: '以下代码有什么问题？class A { int x; A() : A(0), x(0) {} };',
                    options: ['没有问题', 'x被初始化两次', '编译错误：不能同时委托和初始化成员', '运行时错误'],
                    correct: 2,
                    explanation: '委托构造函数不能同时在初始化列表中初始化成员变量。'
                },
                {
                    question: 'using Base::Base的作用是？',
                    options: ['声明Base为基类', '继承Base的所有构造函数', '创建Base的别名', '调用Base的构造函数'],
                    correct: 1,
                    explanation: 'using Base::Base让派生类继承基类的所有构造函数。'
                },
                {
                    question: '继承构造函数时，派生类的新成员如何初始化？',
                    options: ['自动默认初始化', '必须手动初始化', '编译错误', '未定义行为'],
                    correct: 0,
                    explanation: '继承的构造函数只会初始化基类部分，派生类的新成员会进行默认初始化。'
                },
                {
                    question: '以下哪个说法是正确的？',
                    options: ['委托构造函数可以形成循环', '继承构造函数可以继承所有函数', '委托构造函数可以减少代码重复', '继承构造函数不能用于多重继承'],
                    correct: 2,
                    explanation: '委托构造函数的主要目的是避免代码重复。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Delegating constructor',
                    url: 'https://en.cppreference.com/w/cpp/language/constructor'
                }
            ],
            assistantTips: '委托构造函数适合有多个重载构造函数且初始化逻辑相似的类。'
        },
        {
            id: '24.6',
            title: '显式转换操作符',
            duration: '20分钟',
            difficulty: '中级',
            xp: 120,
            estimatedXp: 240,
            concepts: `## 显式转换操作符

C++11引入了explicit关键字用于转换操作符，防止隐式类型转换带来的问题。

### explicit 转换操作符

\`\`\`cpp
class SmartPtr {
    T* ptr;
public:
    // 显式转换操作符
    explicit operator bool() const { 
        return ptr != nullptr; 
    }
};

SmartPtr p;
if (p) { }    // OK：上下文转换为bool
// bool b = p;  // 编译错误
\`\`\`

### 上下文转换

显式转换操作符在if、while、for等条件上下文中可以隐式使用。`,
            examples: [
                {
                    title: '显式bool转换',
                    code: `#include <iostream>

class SafeBool {
    bool value;
public:
    SafeBool(bool v) : value(v) {}
    
    explicit operator bool() const {
        return value;
    }
};

int main() {
    SafeBool sb(true);
    
    if (sb) {
        std::cout << "sb是true" << std::endl;
    }
    
    // bool b = sb;  // 编译错误
    bool b = static_cast<bool>(sb);  // OK
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现安全的字符串类',
                description: '实现一个字符串类，使用显式转换操作符。',
                initialCode: `#include <iostream>
#include <string>

class SafeString {
private:
    char* data;
    
public:
    // TODO: 构造函数
    // TODO: 显式转换为bool
    // TODO: 显式转换为const char*
};

int main() {
    SafeString s1("Hello");
    SafeString s2("");
    
    if (s1) {
        std::cout << "s1非空" << std::endl;
    }
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>

class SafeString {
private:
    std::string data;
    
public:
    SafeString(const char* s = "") : data(s) {}
    
    explicit operator bool() const {
        return !data.empty();
    }
    
    explicit operator const char*() const {
        return data.c_str();
    }
};

int main() {
    SafeString s1("Hello");
    SafeString s2("");
    
    if (s1) {
        std::cout << "s1非空" << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'explicit operator bool()在什么情况下可以隐式调用？',
                    options: ['任何时候都不能', '只在if/while等条件上下文中', '只在赋值时', '只在函数参数中'],
                    correct: 1,
                    explanation: '显式bool转换操作符在条件上下文中可以隐式使用。'
                },
                {
                    question: '以下代码有什么问题？class A { operator int() { return 0; } }; int x = A();',
                    options: ['没有问题', '应该使用explicit', 'operator int应该返回const int', '需要const限定符'],
                    correct: 0,
                    explanation: '这段代码没有问题。隐式转换操作符允许这种隐式转换。'
                },
                {
                    question: '为什么智能指针的operator bool通常声明为explicit？',
                    options: ['性能原因', '防止意外的隐式转换到整数', '语法要求', '编译器限制'],
                    correct: 1,
                    explanation: '如果不声明为explicit，智能指针可能被隐式转换为bool，然后隐式转换为int等类型。'
                },
                {
                    question: '以下哪个是合法的？class A { explicit operator int(); }; A a;',
                    options: ['int x = a;', 'int x = (int)a;', 'int x = static_cast<int>(a);', 'int x = int(a);'],
                    correct: 2,
                    explanation: '显式转换操作符需要使用显式转换语法，如static_cast<int>(a)。'
                },
                {
                    question: 'explicit operator bool()与operator bool()的主要区别是？',
                    options: ['没有区别', '前者只能在条件上下文中隐式使用', '前者性能更好', '前者只能用于指针类型'],
                    correct: 1,
                    explanation: 'explicit operator bool()只能在条件上下文中隐式使用。'
                }
            ],
            references: [
                {
                    title: 'cppreference - explicit',
                    url: 'https://en.cppreference.com/w/cpp/language/explicit'
                }
            ],
            assistantTips: '对于bool转换操作符，建议使用explicit以避免意外的隐式转换。'
        },
        {
            id: '24.7',
            title: '用户定义字面量',
            duration: '25分钟',
            difficulty: '中级',
            xp: 140,
            estimatedXp: 280,
            concepts: `## 用户定义字面量

C++11允许用户定义字面量后缀，使代码更加直观和类型安全。

### 基本语法

\`\`\`cpp
ReturnType operator"" _suffix(Parameters);
\`\`\`

### 时间单位示例

\`\`\`cpp
constexpr long long operator"" _ms(unsigned long long ms) {
    return ms;
}

constexpr long long operator"" _s(unsigned long long s) {
    return s * 1000;
}

auto t1 = 100_ms;   // 100毫秒
auto t2 = 2_s;      // 2000毫秒
\`\`\`

### 注意事项

1. 后缀必须以下划线开头
2. 字面量操作符通常是constexpr`,
            examples: [
                {
                    title: '时间单位字面量',
                    code: `#include <iostream>

constexpr long long operator"" _ms(unsigned long long ms) {
    return ms;
}

constexpr long long operator"" _s(unsigned long long s) {
    return s * 1000;
}

int main() {
    auto t1 = 100_ms;
    auto t2 = 2_s;
    
    std::cout << "100毫秒 = " << t1 << "ms" << std::endl;
    std::cout << "2秒 = " << t2 << "ms" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现角度和弧度字面量',
                description: '实现角度和弧度的用户定义字面量。',
                initialCode: `#include <iostream>
#include <cmath>

namespace angle {
    constexpr double PI = 3.14159265358979323846;
    
    // TODO: 角度字面量
    // constexpr double operator"" _deg(long double deg)
    
    // TODO: 弧度字面量
    // constexpr double operator"" _rad(long double rad)
}

int main() {
    using namespace angle;
    
    auto a1 = 90.0_deg;
    std::cout << "90度 = " << a1 << "弧度" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <cmath>

namespace angle {
    constexpr double PI = 3.14159265358979323846;
    
    constexpr double operator"" _deg(long double deg) {
        return deg * PI / 180.0;
    }
    
    constexpr double operator"" _rad(long double rad) {
        return rad;
    }
}

int main() {
    using namespace angle;
    
    auto a1 = 90.0_deg;
    std::cout << "90度 = " << a1 << "弧度" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '用户定义字面量的后缀必须以什么开头？',
                    options: ['字母', '下划线', '数字', '任意字符'],
                    correct: 1,
                    explanation: '标准规定用户定义字面量的后缀必须以下划线开头。'
                },
                {
                    question: '整数字面量操作符的参数类型是？',
                    options: ['int', 'long', 'unsigned long long', 'size_t'],
                    correct: 2,
                    explanation: '整数字面量操作符的参数类型必须是unsigned long long。'
                },
                {
                    question: '字符串字面量操作符的参数是？',
                    options: ['const char*', 'const char*, size_t', 'std::string', 'const char[]'],
                    correct: 1,
                    explanation: '字符串字面量操作符接受两个参数：const char*和size_t。'
                },
                {
                    question: '以下哪个是合法的用户定义字面量？',
                    options: ['42km', '42_km', 'km42', '_km42'],
                    correct: 1,
                    explanation: '用户定义字面量的格式是数值后跟下划线开头的后缀。'
                },
                {
                    question: '用户定义字面量操作符通常声明为？',
                    options: ['static', 'virtual', 'constexpr', 'inline'],
                    correct: 2,
                    explanation: '用户定义字面量操作符通常声明为constexpr，以便在编译时计算。'
                }
            ],
            references: [
                {
                    title: 'cppreference - User-defined literals',
                    url: 'https://en.cppreference.com/w/cpp/language/user_literal'
                }
            ],
            assistantTips: '用户定义字面量可以让代码更直观，特别是对于物理单位、时间等。记得后缀以下划线开头。'
        },
        {
            id: '24.8',
            title: '属性（attributes）概览',
            duration: '25分钟',
            difficulty: '中级',
            xp: 130,
            estimatedXp: 260,
            concepts: `## 属性（attributes）概览

C++11引入了属性语法，提供了一种标准化的方式来添加编译器指令和提示。

### 基本语法

\`\`\`cpp
[[attribute]]
[[attribute(value)]]
\`\`\`

### 常用属性

- **[[noreturn]]**: 函数不返回
- **[[deprecated]]**: 标记已弃用
- **[[fallthrough]]**: switch中故意穿透
- **[[nodiscard]]**: 警告忽略返回值
- **[[maybe_unused]]**: 抑制未使用警告
- **[[likely]] / [[unlikely]]**: 分支预测提示（C++20）`,
            examples: [
                {
                    title: '常用属性示例',
                    code: `#include <iostream>

[[nodiscard]] int calculate() { return 42; }

[[deprecated("Use newFunction() instead")]]
void oldFunction() {}

int main() {
    // calculate();  // 警告：返回值被忽略
    int result = calculate();
    
    oldFunction();  // 警告：已弃用
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用属性改进代码',
                description: '使用各种属性改进一个资源管理类。',
                initialCode: `#include <iostream>
#include <string>

class ResourceManager {
public:
    // TODO: 添加 [[nodiscard]] 属性
    bool init() { return true; }
    
    // TODO: 添加 [[deprecated]] 属性
    void oldProcess() {}
    
    // TODO: 添加 [[noreturn]] 属性
    void fatalError(const std::string& msg) {
        std::cerr << msg << std::endl;
        std::exit(1);
    }
};

int main() {
    ResourceManager rm;
    rm.init();
    return 0;
}`,
                solution: `#include <iostream>
#include <string>

class ResourceManager {
public:
    [[nodiscard]] bool init() { return true; }
    
    [[deprecated("Use process() instead")]]
    void oldProcess() {}
    
    [[noreturn]] void fatalError(const std::string& msg) {
        std::cerr << msg << std::endl;
        std::exit(1);
    }
};

int main() {
    ResourceManager rm;
    if (rm.init()) {
        std::cout << "初始化成功" << std::endl;
    }
    return 0;
}`
            },
            quiz: [
                {
                    question: '[[nodiscard]]属性的作用是？',
                    options: ['标记函数已弃用', '警告忽略返回值', '提示函数不返回', '优化内存布局'],
                    correct: 1,
                    explanation: '[[nodiscard]]用于标记返回值不应被忽略的函数。'
                },
                {
                    question: '[[fallthrough]]属性应该用在什么地方？',
                    options: ['函数声明', '变量声明', 'switch语句中case穿透', '类声明'],
                    correct: 2,
                    explanation: '[[fallthrough]]用于switch语句中，明确表示case穿透是有意的。'
                },
                {
                    question: '[[noreturn]]属性表示什么？',
                    options: ['函数返回void', '函数不会返回到调用者', '函数返回nullptr', '函数返回错误'],
                    correct: 1,
                    explanation: '[[noreturn]]表示函数不会返回到调用者。'
                },
                {
                    question: '以下哪个属性是C++20引入的？',
                    options: ['[[deprecated]]', '[[nodiscard]]', '[[likely]]', '[[noreturn]]'],
                    correct: 2,
                    explanation: '[[likely]]和[[unlikely]]是C++20引入的。'
                },
                {
                    question: '[[maybe_unused]]属性的作用是？',
                    options: ['标记变量可能未定义', '抑制未使用实体的警告', '标记变量可能为空', '优化变量存储'],
                    correct: 1,
                    explanation: '[[maybe_unused]]用于抑制编译器对未使用变量的警告。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Attributes',
                    url: 'https://en.cppreference.com/w/cpp/language/attributes'
                }
            ],
            assistantTips: '属性是现代C++的重要特性，可以改善代码质量和编译器优化。'
        },
        {
            id: '24.9',
            title: '结构化绑定（C++17）',
            duration: '30分钟',
            difficulty: '中级',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 结构化绑定（C++17）

C++17引入了结构化绑定，可以方便地将复合类型的元素分解为单独的变量。

### 基本语法

\`\`\`cpp
auto [a, b, c] = expression;
\`\`\`

### 绑定pair和tuple

\`\`\`cpp
std::pair<int, std::string> p{42, "hello"};
auto [num, str] = p;

std::tuple<int, double, char> t{1, 3.14, 'a'};
auto [i, d, c] = t;
\`\`\`

### 在范围for中使用

\`\`\`cpp
std::map<std::string, int> scores;
for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score;
}
\`\`\``,
            examples: [
                {
                    title: '结构化绑定基础',
                    code: `#include <iostream>
#include <tuple>
#include <map>

int main() {
    // 绑定pair
    std::pair<int, std::string> p{42, "hello"};
    auto [num, str] = p;
    std::cout << num << ": " << str << std::endl;
    
    // 绑定tuple
    std::tuple<int, double, char> t{1, 3.14, 'a'};
    auto [i, d, c] = t;
    std::cout << i << ", " << d << ", " << c << std::endl;
    
    // 遍历map
    std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用结构化绑定处理数据',
                description: '使用结构化绑定简化数据处理代码。',
                initialCode: `#include <iostream>
#include <map>
#include <tuple>

std::tuple<std::string, int, double> getStudentInfo() {
    return {"Alice", 20, 3.8};
}

int main() {
    // TODO: 使用结构化绑定获取学生信息
    
    // TODO: 遍历map并打印
    std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};
    
    return 0;
}`,
                solution: `#include <iostream>
#include <map>
#include <tuple>

std::tuple<std::string, int, double> getStudentInfo() {
    return {"Alice", 20, 3.8};
}

int main() {
    auto [name, age, gpa] = getStudentInfo();
    std::cout << name << ", " << age << ", " << gpa << std::endl;
    
    std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '结构化绑定是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 2,
                    explanation: '结构化绑定是C++17引入的特性。'
                },
                {
                    question: '遍历std::map时，结构化绑定的两个变量分别是什么？',
                    options: ['值和键', '键和值', '两个值', '迭代器'],
                    correct: 1,
                    explanation: 'map的元素是pair<const Key, Value>，所以第一个是键，第二个是值。'
                },
                {
                    question: '以下哪种方式可以修改原pair的值？',
                    options: ['auto [a, b] = p;', 'auto& [a, b] = p;', 'const auto& [a, b] = p;', 'auto* [a, b] = p;'],
                    correct: 1,
                    explanation: '使用auto&进行引用绑定，可以修改原pair的值。'
                },
                {
                    question: '结构化绑定可以用于以下哪种类型？',
                    options: ['只有pair和tuple', '数组、pair、tuple和简单结构体', '只有数组', '所有类型'],
                    correct: 1,
                    explanation: '结构化绑定可以用于数组、pair、tuple以及聚合类型。'
                },
                {
                    question: '以下代码的输出是什么？std::pair<int, int> p{1, 2}; auto [a, b] = p;',
                    options: ['a=1, b=2', '编译错误', '未定义行为', '运行时错误'],
                    correct: 0,
                    explanation: '结构化绑定将pair的两个元素绑定到a和b。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Structured binding',
                    url: 'https://en.cppreference.com/w/cpp/language/structured_binding'
                }
            ],
            assistantTips: '结构化绑定大大简化了处理pair、tuple和map的代码。'
        },
        {
            id: '24.10',
            title: 'std::optional, std::variant, std::any（C++17）',
            duration: '35分钟',
            difficulty: '中级',
            xp: 160,
            estimatedXp: 320,
            concepts: `## std::optional, std::variant, std::any（C++17）

C++17引入了三种新的类型安全的数据结构。

### std::optional

表示一个值可能存在或不存在：

\`\`\`cpp
std::optional<int> findValue(int key) {
    if (key > 0) return key * 2;
    return std::nullopt;
}

auto result = findValue(5);
if (result) {
    std::cout << *result;
}
\`\`\`

### std::variant

类型安全的联合体：

\`\`\`cpp
std::variant<int, double, std::string> v;
v = 42;
v = 3.14;
\`\`\`

### std::any

可以持有任意类型的值：

\`\`\`cpp
std::any a;
a = 42;
a = 3.14;
\`\`\``,
            examples: [
                {
                    title: 'std::optional示例',
                    code: `#include <iostream>
#include <optional>

std::optional<int> findUser(int id) {
    if (id > 0) return id * 100;
    return std::nullopt;
}

int main() {
    if (auto user = findUser(5)) {
        std::cout << "找到用户: " << *user << std::endl;
    }
    
    std::cout << "默认值: " << findUser(-1).value_or(0) << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现配置系统',
                description: '使用optional、variant实现一个类型安全的配置系统。',
                initialCode: `#include <iostream>
#include <optional>
#include <variant>
#include <string>
#include <map>

using ConfigValue = std::variant<int, double, bool, std::string>;

class Config {
    std::map<std::string, ConfigValue> data;
    
public:
    // TODO: 设置配置值
    template<typename T>
    void set(const std::string& key, const T& value) {}
    
    // TODO: 获取配置值
    template<typename T>
    std::optional<T> get(const std::string& key) const {
        return std::nullopt;
    }
};

int main() {
    Config config;
    config.set("timeout", 30);
    config.set("ratio", 1.5);
    
    return 0;
}`,
                solution: `#include <iostream>
#include <optional>
#include <variant>
#include <string>
#include <map>

using ConfigValue = std::variant<int, double, bool, std::string>;

class Config {
    std::map<std::string, ConfigValue> data;
    
public:
    template<typename T>
    void set(const std::string& key, const T& value) {
        data[key] = value;
    }
    
    template<typename T>
    std::optional<T> get(const std::string& key) const {
        auto it = data.find(key);
        if (it != data.end()) {
            if (auto* p = std::get_if<T>(&it->second)) {
                return *p;
            }
        }
        return std::nullopt;
    }
};

int main() {
    Config config;
    config.set("timeout", 30);
    config.set("ratio", 1.5);
    
    if (auto timeout = config.get<int>("timeout")) {
        std::cout << "timeout: " << *timeout << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::optional表示什么？',
                    options: ['必须存在的值', '可能存在或不存在的值', '空指针', '错误码'],
                    correct: 1,
                    explanation: 'std::optional表示一个值可能存在或不存在。'
                },
                {
                    question: '如何检查std::optional是否有值？',
                    options: ['has_value()方法', 'operator bool()', '两者都可以', '只能用if判断'],
                    correct: 2,
                    explanation: 'has_value()和operator bool()都可以检查optional是否有值。'
                },
                {
                    question: 'std::variant与union的主要区别是？',
                    options: ['variant性能更好', 'variant是类型安全的', 'variant可以存储更多类型', '没有区别'],
                    correct: 1,
                    explanation: 'std::variant是类型安全的联合体，知道当前存储的是哪种类型。'
                },
                {
                    question: 'std::any可以存储什么类型的值？',
                    options: ['只有基本类型', '只有标准库类型', '任意可复制构造的类型', '只有指针类型'],
                    correct: 2,
                    explanation: 'std::any可以存储任意可复制构造的类型。'
                },
                {
                    question: '以下哪个最适合表示函数可能失败的返回值？',
                    options: ['std::any', 'std::variant', 'std::optional', '指针'],
                    correct: 2,
                    explanation: 'std::optional最适合表示可能失败的函数返回值，成功时返回值，失败时返回nullopt。'
                }
            ],
            references: [
                {
                    title: 'cppreference - optional',
                    url: 'https://en.cppreference.com/w/cpp/utility/optional'
                }
            ],
            assistantTips: 'std::optional适合表示可选值，std::variant适合表示多种已知类型，std::any适合需要存储任意类型的场景。'
        },
        {
            id: '24.11',
            title: '范围库（ranges）与视图（C++20）',
            duration: '40分钟',
            difficulty: '高级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 范围库（ranges）与视图（C++20）

C++20引入了范围库，提供了一种更现代、更函数式的方式来处理序列。

### 基本概念

范围库提供了视图（Views）和算法的组合，支持惰性求值。

### 视图示例

\`\`\`cpp
#include <ranges>
#include <vector>

std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// 过滤偶数，然后转换
auto result = numbers 
    | std::views::filter([](int n) { return n % 2 == 0; })
    | std::views::transform([](int n) { return n * 2; });
\`\`\`

### 常用视图

- **filter**: 过滤元素
- **transform**: 转换元素
- **take**: 取前N个
- **drop**: 跳过前N个
- **reverse**: 反转`,
            examples: [
                {
                    title: '范围库基础',
                    code: `#include <iostream>
#include <vector>
#include <ranges>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // 过滤偶数并乘以2
    auto result = numbers 
        | std::views::filter([](int n) { return n % 2 == 0; })
        | std::views::transform([](int n) { return n * 2; });
    
    for (int n : result) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用范围库处理数据',
                description: '使用范围库实现数据处理管道。',
                initialCode: `#include <iostream>
#include <vector>
#include <ranges>
#include <string>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // TODO: 使用范围库过滤大于5的数，然后平方
    
    // TODO: 取前3个元素
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <ranges>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    auto result = numbers 
        | std::views::filter([](int n) { return n > 5; })
        | std::views::transform([](int n) { return n * n; })
        | std::views::take(3);
    
    for (int n : result) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '范围库是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: '范围库是C++20引入的特性。'
                },
                {
                    question: '视图（View）的特点是？',
                    options: ['立即求值', '惰性求值', '修改原容器', '必须复制数据'],
                    correct: 1,
                    explanation: '视图是惰性求值的，不会立即计算结果。'
                },
                {
                    question: '以下哪个视图用于过滤元素？',
                    options: ['transform', 'take', 'filter', 'reverse'],
                    correct: 2,
                    explanation: 'filter视图用于根据条件过滤元素。'
                },
                {
                    question: '管道操作符|的作用是？',
                    options: ['位或运算', '逻辑或运算', '组合视图', '除法运算'],
                    correct: 2,
                    explanation: '管道操作符|用于组合多个视图操作。'
                },
                {
                    question: 'std::views::take(5)的作用是？',
                    options: ['跳过前5个元素', '取前5个元素', '删除前5个元素', '复制5次'],
                    correct: 1,
                    explanation: 'take视图用于取前N个元素。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Ranges library',
                    url: 'https://en.cppreference.com/w/cpp/ranges'
                }
            ],
            assistantTips: '范围库提供了更现代的数据处理方式，支持惰性求值和链式调用。'
        },
        {
            id: '24.12',
            title: '协程（coroutines）快速入门',
            duration: '45分钟',
            difficulty: '高级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 协程（coroutines）快速入门

C++20引入了协程，允许函数暂停和恢复执行。

### 基本概念

协程是可以暂停和恢复的函数，使用co_await、co_yield、co_return关键字。

### 协程关键字

- **co_await**: 暂停协程等待结果
- **co_yield**: 产生一个值并暂停
- **co_return**: 从协程返回

### 简单示例

\`\`\`cpp
// 协程需要返回类型支持协程特性
// 通常使用库提供的类型如std::generator（C++23）
\`\`\`

### 注意事项

协程是高级特性，需要深入理解才能正确使用。`,
            examples: [
                {
                    title: '协程概念说明',
                    code: `#include <iostream>
#include <coroutine>

// 协程是C++20的高级特性
// 需要自定义返回类型或使用库

// 简单示例：协程的基本概念
// 实际使用需要更复杂的设置

int main() {
    std::cout << "协程是C++20引入的高级特性" << std::endl;
    std::cout << "需要使用co_await、co_yield、co_return关键字" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '理解协程概念',
                description: '学习协程的基本概念。',
                initialCode: `#include <iostream>

// 协程是C++20的高级特性
// 需要深入理解才能正确使用

int main() {
    std::cout << "协程学习：" << std::endl;
    // TODO: 理解协程的三个关键字
    // co_await: 暂停等待
    // co_yield: 产生值并暂停
    // co_return: 从协程返回
    
    return 0;
}`,
                solution: `#include <iostream>

int main() {
    std::cout << "协程学习：" << std::endl;
    std::cout << "co_await: 暂停协程等待结果" << std::endl;
    std::cout << "co_yield: 产生一个值并暂停" << std::endl;
    std::cout << "co_return: 从协程返回" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '协程是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: '协程是C++20引入的特性。'
                },
                {
                    question: '以下哪个不是协程关键字？',
                    options: ['co_await', 'co_yield', 'co_return', 'co_pause'],
                    correct: 3,
                    explanation: '协程关键字是co_await、co_yield、co_return，没有co_pause。'
                },
                {
                    question: 'co_yield的作用是？',
                    options: ['等待结果', '产生值并暂停', '返回结果', '启动协程'],
                    correct: 1,
                    explanation: 'co_yield用于产生一个值并暂停协程。'
                },
                {
                    question: '协程与普通函数的主要区别是？',
                    options: ['协程更快', '协程可以暂停和恢复', '协程不能有参数', '协程不能返回值'],
                    correct: 1,
                    explanation: '协程可以暂停执行并在之后恢复。'
                },
                {
                    question: '协程适合用于什么场景？',
                    options: ['简单计算', '异步IO操作', '内存分配', '类型转换'],
                    correct: 1,
                    explanation: '协程适合用于异步IO、生成器等需要暂停恢复的场景。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Coroutines',
                    url: 'https://en.cppreference.com/w/cpp/language/coroutines'
                }
            ],
            assistantTips: '协程是C++20的高级特性，需要深入理解才能正确使用。建议先学习基础概念再实践。'
        },
        {
            id: '24.13',
            title: '模块（modules）初步（C++20）',
            duration: '30分钟',
            difficulty: '中级',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 模块（modules）初步（C++20）

C++20引入了模块，作为头文件的现代替代方案。

### 基本语法

\`\`\`cpp
// 模块接口文件
export module mymodule;

export int add(int a, int b) {
    return a + b;
}

// 模块导入
import mymodule;
\`\`\`

### 模块的优势

1. **更快的编译速度**
2. **更好的封装性**
3. **避免宏污染**
4. **无需重复解析**`,
            examples: [
                {
                    title: '模块概念说明',
                    code: `// 模块是C++20的新特性
// 需要编译器支持

// 传统头文件方式
// #include <iostream>

// 模块方式（C++20）
// import <iostream>;

int main() {
    std::cout << "模块是C++20的现代特性" << std::endl;
    return 0;
}`
                }
            ],
            handsOn: {
                title: '理解模块概念',
                description: '学习模块的基本概念。',
                initialCode: `#include <iostream>

// 传统方式使用头文件
// 模块方式使用import

int main() {
    // TODO: 理解模块与传统头文件的区别
    
    return 0;
}`,
                solution: `#include <iostream>

int main() {
    std::cout << "模块优势：" << std::endl;
    std::cout << "1. 更快的编译速度" << std::endl;
    std::cout << "2. 更好的封装性" << std::endl;
    std::cout << "3. 避免宏污染" << std::endl;
    std::cout << "4. 无需重复解析" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '模块是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: '模块是C++20引入的特性。'
                },
                {
                    question: '模块的主要优势是？',
                    options: ['代码更短', '编译更快', '运行更快', '内存更少'],
                    correct: 1,
                    explanation: '模块的主要优势是更快的编译速度。'
                },
                {
                    question: '导入模块使用什么关键字？',
                    options: ['include', 'import', 'using', 'require'],
                    correct: 1,
                    explanation: '使用import关键字导入模块。'
                },
                {
                    question: '导出模块接口使用什么关键字？',
                    options: ['public', 'export', 'extern', 'visible'],
                    correct: 1,
                    explanation: '使用export关键字导出模块接口。'
                },
                {
                    question: '模块可以避免什么问题？',
                    options: ['内存泄漏', '宏污染', '线程安全', '类型错误'],
                    correct: 1,
                    explanation: '模块可以避免头文件中的宏污染问题。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Modules',
                    url: 'https://en.cppreference.com/w/cpp/language/modules'
                }
            ],
            assistantTips: '模块是C++20的重要特性，但编译器支持仍在完善中。建议了解概念，等待成熟后使用。'
        },
        {
            id: '24.14',
            title: '概念（concepts）深入',
            duration: '40分钟',
            difficulty: '高级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 概念（concepts）深入

C++20引入了概念，用于约束模板参数，提供更好的错误信息。

### 基本语法

\`\`\`cpp
template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

template<Numeric T>
T add(T a, T b) {
    return a + b;
}
\`\`\`

### 标准概念

- **std::integral**: 整数类型
- **std::floating_point**: 浮点类型
- **std::same_as**: 相同类型
- **std::derived_from**: 派生关系
- **std::convertible_to**: 可转换`,
            examples: [
                {
                    title: '概念基础',
                    code: `#include <iostream>
#include <concepts>

template<std::integral T>
T add(T a, T b) {
    return a + b;
}

int main() {
    std::cout << add(1, 2) << std::endl;
    // add(1.5, 2.5);  // 编译错误：不是整数类型
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用概念约束模板',
                description: '使用概念约束模板参数。',
                initialCode: `#include <iostream>
#include <concepts>

// TODO: 定义一个Numeric概念

// TODO: 使用概念约束模板
template<typename T>
T multiply(T a, T b) {
    return a * b;
}

int main() {
    std::cout << multiply(2, 3) << std::endl;
    return 0;
}`,
                solution: `#include <iostream>
#include <concepts>

template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

template<Numeric T>
T multiply(T a, T b) {
    return a * b;
}

int main() {
    std::cout << multiply(2, 3) << std::endl;
    std::cout << multiply(2.5, 3.5) << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '概念是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: '概念是C++20引入的特性。'
                },
                {
                    question: 'std::integral概念表示什么？',
                    options: ['浮点类型', '整数类型', '任意类型', '指针类型'],
                    correct: 1,
                    explanation: 'std::integral表示整数类型。'
                },
                {
                    question: '概念的主要优势是？',
                    options: ['运行更快', '更好的错误信息', '代码更短', '内存更少'],
                    correct: 1,
                    explanation: '概念提供更好的模板错误信息。'
                },
                {
                    question: '定义概念使用什么关键字？',
                    options: ['template', 'concept', 'constraint', 'require'],
                    correct: 1,
                    explanation: '使用concept关键字定义概念。'
                },
                {
                    question: '以下哪个是标准概念？',
                    options: ['std::number', 'std::same_as', 'std::type', 'std::class'],
                    correct: 1,
                    explanation: 'std::same_as是标准概念，用于检查类型相同。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Concepts',
                    url: 'https://en.cppreference.com/w/cpp/concepts'
                }
            ],
            assistantTips: '概念是现代C++模板编程的重要工具，可以显著改善模板错误信息。'
        },
        {
            id: '24.15',
            title: '三路比较运算符 <=>（C++20）',
            duration: '30分钟',
            difficulty: '中级',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 三路比较运算符 <=>（C++20）

C++20引入了三路比较运算符（太空船运算符），简化比较操作的实现。

### 基本语法

\`\`\`cpp
auto result = a <=> b;

// result < 0: a < b
// result == 0: a == b
// result > 0: a > b
\`\`\`

### 默认比较

\`\`\`cpp
struct Point {
    int x, y;
    
    auto operator<=>(const Point&) const = default;
};
\`\`\`

### 比较类别

- **strong_ordering**: 强排序
- **weak_ordering**: 弱排序
- **partial_ordering**: 部分排序`,
            examples: [
                {
                    title: '三路比较运算符',
                    code: `#include <iostream>
#include <compare>

struct Point {
    int x, y;
    
    auto operator<=>(const Point&) const = default;
};

int main() {
    Point p1{1, 2};
    Point p2{1, 3};
    
    if (p1 < p2) {
        std::cout << "p1 < p2" << std::endl;
    }
    
    auto result = p1 <=> p2;
    if (result < 0) {
        std::cout << "p1小于p2" << std::endl;
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现比较操作',
                description: '使用三路比较运算符实现比较。',
                initialCode: `#include <iostream>
#include <compare>

struct Person {
    std::string name;
    int age;
    
    // TODO: 使用默认三路比较运算符
};

int main() {
    Person p1{"Alice", 25};
    Person p2{"Bob", 30};
    
    // TODO: 比较两个Person对象
    
    return 0;
}`,
                solution: `#include <iostream>
#include <compare>
#include <string>

struct Person {
    std::string name;
    int age;
    
    auto operator<=>(const Person&) const = default;
};

int main() {
    Person p1{"Alice", 25};
    Person p2{"Bob", 30};
    
    if (p1 < p2) {
        std::cout << "p1 < p2" << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '三路比较运算符是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: '三路比较运算符是C++20引入的特性。'
                },
                {
                    question: '三路比较运算符的符号是？',
                    options: ['<=>', '==>', '<==', '==='],
                    correct: 0,
                    explanation: '三路比较运算符使用<=>符号。'
                },
                {
                    question: 'a <=> b < 0 表示什么？',
                    options: ['a > b', 'a == b', 'a < b', 'a != b'],
                    correct: 2,
                    explanation: 'a <=> b < 0表示a小于b。'
                },
                {
                    question: '默认三路比较运算符会自动生成哪些操作？',
                    options: ['只有<', '<, >, ==, !=, <=, >=', '只有==', '只有<和>'],
                    correct: 1,
                    explanation: '默认三路比较运算符会生成所有六个比较操作。'
                },
                {
                    question: '三路比较运算符的别名是？',
                    options: ['箭头运算符', '太空船运算符', '比较运算符', '排序运算符'],
                    correct: 1,
                    explanation: '三路比较运算符也称为太空船运算符。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Three-way comparison',
                    url: 'https://en.cppreference.com/w/cpp/language/operator_comparison'
                }
            ],
            assistantTips: '三路比较运算符可以大大简化比较操作的实现，使用=default可以自动生成所有比较操作。'
        },
        {
            id: '24.16',
            title: '新版格式化库（std::format）',
            duration: '30分钟',
            difficulty: '中级',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 新版格式化库（std::format）

C++20引入了std::format，提供类型安全的格式化字符串功能。

### 基本用法

\`\`\`cpp
#include <format>
#include <iostream>

std::string s = std::format("Hello, {}!", "World");
std::cout << s;  // Hello, World!

std::string s2 = std::format("{0} + {1} = {2}", 1, 2, 3);
\`\`\`

### 格式说明符

\`\`\`cpp
std::format("{:d}", 42);      // 整数
std::format("{:f}", 3.14);    // 浮点
std::format("{:s}", "hello"); // 字符串
std::format("{:x}", 255);     // 十六进制
\`\`\``,
            examples: [
                {
                    title: 'std::format基础',
                    code: `#include <iostream>
#include <format>
#include <string>

int main() {
    std::string s1 = std::format("Hello, {}!", "World");
    std::cout << s1 << std::endl;
    
    std::string s2 = std::format("{} + {} = {}", 1, 2, 3);
    std::cout << s2 << std::endl;
    
    std::string s3 = std::format("{0} is {1} years old", "Alice", 25);
    std::cout << s3 << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用std::format',
                description: '使用格式化库输出信息。',
                initialCode: `#include <iostream>
#include <format>
#include <string>

int main() {
    std::string name = "Alice";
    int age = 25;
    double score = 95.5;
    
    // TODO: 使用std::format输出信息
    
    return 0;
}`,
                solution: `#include <iostream>
#include <format>
#include <string>

int main() {
    std::string name = "Alice";
    int age = 25;
    double score = 95.5;
    
    std::string info = std::format(
        "Name: {}, Age: {}, Score: {:.1f}", 
        name, age, score
    );
    
    std::cout << info << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::format是哪个C++标准引入的？',
                    options: ['C++11', 'C++14', 'C++17', 'C++20'],
                    correct: 3,
                    explanation: 'std::format是C++20引入的特性。'
                },
                {
                    question: 'std::format的主要优势是？',
                    options: ['性能更好', '类型安全', '代码更短', '内存更少'],
                    correct: 1,
                    explanation: 'std::format提供类型安全的格式化。'
                },
                {
                    question: '格式化占位符{}表示什么？',
                    options: ['必须指定类型', '自动推导类型', '只能是字符串', '只能是数字'],
                    correct: 1,
                    explanation: '{}会自动推导参数类型。'
                },
                {
                    question: '{0}和{1}表示什么？',
                    options: ['最小宽度', '参数索引', '精度', '类型'],
                    correct: 1,
                    explanation: '{0}和{1}表示参数的索引位置。'
                },
                {
                    question: '以下哪个格式说明符用于十六进制？',
                    options: ['{:d}', '{:x}', '{:h}', '{:b}'],
                    correct: 1,
                    explanation: '{:x}用于十六进制格式。'
                }
            ],
            references: [
                {
                    title: 'cppreference - format',
                    url: 'https://en.cppreference.com/w/cpp/utility/format'
                }
            ],
            assistantTips: 'std::format是类型安全的格式化工具，比printf更安全，比iostream更简洁。'
        },
        {
            id: '24.17',
            title: 'std::expected 与改进（C++23）',
            duration: '35分钟',
            difficulty: '高级',
            xp: 170,
            estimatedXp: 340,
            concepts: `## std::expected 与改进（C++23）

C++23引入了std::expected，用于表示可能成功或失败的操作结果。

### 基本概念

std::expected<T, E>可以包含一个成功值T或一个错误E。

\`\`\`cpp
#include <expected>

std::expected<int, std::string> divide(int a, int b) {
    if (b == 0) {
        return std::unexpected("Division by zero");
    }
    return a / b;
}
\`\`\`

### 使用方式

\`\`\`cpp
auto result = divide(10, 2);
if (result) {
    std::cout << *result;  // 成功值
} else {
    std::cout << result.error();  // 错误信息
}
\`\`\`

### 与optional的比较

- **optional**: 只有值或无值
- **expected**: 值或错误信息`,
            examples: [
                {
                    title: 'std::expected基础',
                    code: `#include <iostream>
#include <expected>
#include <string>

std::expected<int, std::string> divide(int a, int b) {
    if (b == 0) {
        return std::unexpected("Division by zero");
    }
    return a / b;
}

int main() {
    auto result1 = divide(10, 2);
    if (result1) {
        std::cout << "Result: " << *result1 << std::endl;
    }
    
    auto result2 = divide(10, 0);
    if (!result2) {
        std::cout << "Error: " << result2.error() << std::endl;
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '使用std::expected',
                description: '使用expected处理可能失败的操作。',
                initialCode: `#include <iostream>
#include <expected>
#include <string>

// TODO: 实现一个返回expected的函数
// 解析字符串为整数，失败时返回错误信息

int main() {
    // TODO: 测试函数
    
    return 0;
}`,
                solution: `#include <iostream>
#include <expected>
#include <string>

std::expected<int, std::string> parseInt(const std::string& s) {
    try {
        return std::stoi(s);
    } catch (const std::exception& e) {
        return std::unexpected("Invalid number: " + s);
    }
}

int main() {
    auto result1 = parseInt("42");
    if (result1) {
        std::cout << "Value: " << *result1 << std::endl;
    }
    
    auto result2 = parseInt("abc");
    if (!result2) {
        std::cout << "Error: " << result2.error() << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::expected是哪个C++标准引入的？',
                    options: ['C++17', 'C++20', 'C++23', 'C++26'],
                    correct: 2,
                    explanation: 'std::expected是C++23引入的特性。'
                },
                {
                    question: 'std::expected<T, E>中的T和E分别表示？',
                    options: ['类型和大小', '成功值类型和错误类型', '输入和输出', '开始和结束'],
                    correct: 1,
                    explanation: 'T是成功值类型，E是错误类型。'
                },
                {
                    question: '如何创建一个错误结果？',
                    options: ['return error;', 'return std::unexpected(e);', 'return nullptr;', 'return false;'],
                    correct: 1,
                    explanation: '使用std::unexpected创建错误结果。'
                },
                {
                    question: 'std::expected与std::optional的主要区别是？',
                    options: ['expected更快', 'expected可以携带错误信息', 'optional更安全', '没有区别'],
                    correct: 1,
                    explanation: 'expected可以携带错误信息，optional只能表示有无值。'
                },
                {
                    question: '如何检查expected是否成功？',
                    options: ['has_value()方法', 'operator bool()', '两者都可以', '只能用try-catch'],
                    correct: 2,
                    explanation: 'has_value()和operator bool()都可以检查expected是否成功。'
                }
            ],
            references: [
                {
                    title: 'cppreference - expected',
                    url: 'https://en.cppreference.com/w/cpp/utility/expected'
                }
            ],
            assistantTips: 'std::expected是处理错误的现代方式，比异常更轻量，比错误码更清晰。'
        }
    ]
};

window.Unit24Data = Unit24Data;
