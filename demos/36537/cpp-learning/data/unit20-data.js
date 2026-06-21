/**
 * 单元20：移动语义与资源管理
 */
const Unit20Data = {
    id: 20,
    title: '移动语义与资源管理',
    description: '深入理解C++移动语义、右值引用、资源管理RAII惯用法，掌握现代C++的核心特性',
    lessons: [
        {
            id: '20.1',
            title: '左值与右值的形式化',
            duration: '40分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 左值与右值的形式化

### 什么是左值（lvalue）？

左值是指**有名字、有地址**的表达式，可以出现在赋值语句的左边。

\`\`\`cpp
int x = 10;      // x是左值
x = 20;          // 正确：左值可以赋值

int arr[5] = {1, 2, 3, 4, 5};
arr[0] = 10;     // arr[0]是左值

std::string s = "hello";
s[0] = 'H';      // s[0]是左值
\`\`\`

### 什么是右值（rvalue）？

右值是指**没有名字、临时存在**的表达式，通常是一个值或临时对象。

\`\`\`cpp
int x = 10;      // 10是右值
int y = x + 5;   // x + 5是右值

std::string s1 = "hello";
std::string s2 = s1 + " world";  // s1 + " world"是右值

int getValue() { return 42; }
int z = getValue();  // getValue()是右值
\`\`\`

### 左值与右值的区别

| 特性 | 左值 | 右值 |
|------|------|------|
| 有名字 | 是 | 否 |
| 有地址 | 是 | 否（临时） |
| 可以取地址 | 是 | 否 |
| 可以赋值 | 通常可以 | 否 |
| 生命周期 | 持久 | 临时 |

### 判断方法

\`\`\`cpp
int x = 10;
int& lr = x;       // 正确：左值引用绑定左值
// int& lr2 = 10;  // 错误：左值引用不能绑定右值

const int& cr = 10;  // 正确：const左值引用可以绑定右值

int&& rr = 10;     // 正确：右值引用绑定右值（C++11）
// int&& rr2 = x;  // 错误：右值引用不能绑定左值
\`\`\`

### 左值引用与右值引用

\`\`\`cpp
// 左值引用
int x = 10;
int& lr = x;           // 绑定到左值
const int& clr = 10;   // const引用可以绑定右值

// 右值引用（C++11）
int&& rr1 = 10;        // 绑定到右值
int&& rr2 = x + 5;     // 绑定到右值表达式
int&& rr3 = getValue(); // 绑定到函数返回的右值

// std::move将左值转换为右值
int&& rr4 = std::move(x);  // 正确
\`\`\`

### 值类别详解（C++11）

C++11将表达式分为三个主要类别：

\`\`\`
表达式
├── glvalue（泛左值）
│   ├── lvalue（左值）
│   └── xvalue（将亡值）
└── rvalue（右值）
    ├── prvalue（纯右值）
    └── xvalue（将亡值）
\`\`\`

#### lvalue（左值）

\`\`\`cpp
int x;              // x是左值
int* p = &x;        // 可以取地址
int& ref = x;       // 可以绑定左值引用

struct Point { int x, y; };
Point pt;
pt.x = 10;          // pt.x是左值

int arr[5];
arr[0] = 1;         // arr[0]是左值
\`\`\`

#### prvalue（纯右值）

\`\`\`cpp
42                  // 字面量
x + y               // 算术表达式
x++                 // 后置自增
"hello"             // 字符串字面量（const char[6]）
std::string("hi")   // 临时对象
\`\`\`

#### xvalue（将亡值）

\`\`\`cpp
std::move(x)        // 将左值转换为将亡值
std::forward<T>(t)  // 完美转发
\`\`\`

### 常见误区

#### 1. 字符串字面量是左值

\`\`\`cpp
"hello";            // 类型是const char[6]，是左值！
&"hello";           // 可以取地址

// 但字符串字面量不能修改
// "hello"[0] = 'H';  // 未定义行为
\`\`\`

#### 2. 函数返回类型影响值类别

\`\`\`cpp
int getValue() { return 42; }
getValue();         // 返回int，是右值

int& getRef(int& x) { return x; }
int a = 10;
getRef(a);          // 返回int&，是左值

int&& getRvalue() { return 42; }
getRvalue();        // 返回int&&，是右值
\`\`\`

#### 3. 成员访问的值类别

\`\`\`cpp
struct Point { int x, y; };

Point pt;
pt.x;               // 左值.成员 = 左值

Point getPoint() { return {1, 2}; }
getPoint().x;       // 右值.成员 = 右值（C++11起）

Point& getPointRef() { static Point p; return p; }
getPointRef().x;    // 左值引用.成员 = 左值
\`\`\`

### 实际应用

\`\`\`cpp
#include <iostream>
#include <string>
#include <utility>

void processValue(int& x) {
    std::cout << "左值: " << x << std::endl;
}

void processValue(int&& x) {
    std::cout << "右值: " << x << std::endl;
}

int main() {
    int x = 10;
    
    processValue(x);          // 调用左值版本
    processValue(10);         // 调用右值版本
    processValue(x + 5);      // 调用右值版本
    processValue(std::move(x)); // 调用右值版本
    
    return 0;
}
\`\`\``,
            examples: [
                {
                    title: '左值与右值识别',
                    code: `#include <iostream>
#include <string>
#include <utility>

// 左值引用版本
void identify(int& x) {
    std::cout << "左值: " << x << std::endl;
}

// 右值引用版本
void identify(int&& x) {
    std::cout << "右值: " << x << std::endl;
}

// const左值引用（可以接受任何值）
void identifyConst(const int& x) {
    std::cout << "const引用: " << x << std::endl;
}

int getValue() { return 42; }

int main() {
    int x = 10;
    int& ref = x;
    
    std::cout << "=== 左值与右值识别 ===" << std::endl;
    
    // 左值
    identify(x);              // 左值
    identify(ref);            // 左值引用本身是左值
    
    // 右值
    identify(10);             // 字面量
    identify(x + 5);          // 表达式结果
    identify(getValue());     // 函数返回值
    identify(std::move(x));   // std::move的结果
    
    std::cout << "\\n=== const引用可以绑定任何值 ===" << std::endl;
    identifyConst(x);         // 左值
    identifyConst(10);        // 右值
    
    return 0;
}`,
                    description: '演示如何识别左值和右值。'
                },
                {
                    title: '值类别的实际应用',
                    code: `#include <iostream>
#include <string>
#include <vector>

class Resource {
private:
    std::string name;
    int* data;
    size_t size;
    
public:
    Resource(const std::string& n, size_t s) 
        : name(n), data(new int[s]), size(s) {
        std::cout << "构造: " << name << std::endl;
    }
    
    ~Resource() {
        std::cout << "析构: " << name << std::endl;
        delete[] data;
    }
    
    // 拷贝构造
    Resource(const Resource& other) 
        : name(other.name + "_copy"), data(new int[other.size]), size(other.size) {
        std::cout << "拷贝构造: " << name << std::endl;
        std::copy(other.data, other.data + size, data);
    }
    
    // 移动构造
    Resource(Resource&& other) noexcept
        : name(std::move(other.name)), data(other.data), size(other.size) {
        std::cout << "移动构造: " << name << std::endl;
        other.data = nullptr;
        other.size = 0;
    }
};

// 接受左值引用
void processResource(Resource& r) {
    std::cout << "处理左值资源" << std::endl;
}

// 接受右值引用
void processResource(Resource&& r) {
    std::cout << "处理右值资源（可移动）" << std::endl;
}

int main() {
    std::cout << "=== 创建资源 ===" << std::endl;
    Resource r1("资源1", 100);
    
    std::cout << "\\n=== 传递左值 ===" << std::endl;
    processResource(r1);  // 调用左值版本
    
    std::cout << "\\n=== 传递右值（临时对象）===" << std::endl;
    processResource(Resource("临时资源", 50));  // 调用右值版本
    
    std::cout << "\\n=== 使用std::move ===" << std::endl;
    processResource(std::move(r1));  // 调用右值版本
    
    std::cout << "\\n=== 程序结束 ===" << std::endl;
    return 0;
}`,
                    description: '展示左值和右值在资源管理中的应用。'
                }
            ],
            handsOn: {
                title: '识别值类别',
                description: '判断以下表达式的值类别，并编写代码验证。',
                initialCode: `#include <iostream>
#include <string>
#include <utility>

// TODO: 实现两个重载函数
// printCategory(int& x) - 打印"左值"
// printCategory(int&& x) - 打印"右值"


int getValue() { return 42; }
int& getRef(int& x) { return x; }
int&& getRvalue(int x) { return std::move(x); }

int main() {
    int x = 10;
    int arr[5] = {1, 2, 3, 4, 5};
    
    std::cout << "=== 判断值类别 ===" << std::endl;
    
    // TODO: 对以下表达式调用printCategory
    // 1. x
    // 2. 10
    // 3. x + 5
    // 4. getValue()
    // 5. arr[0]
    // 6. std::move(x)
    // 7. getRef(x)
    // 8. getRvalue(10)
    
    return 0;
}`,
                expectedOutput: `=== 判断值类别 ===
x: 左值
10: 右值
x + 5: 右值
getValue(): 右值
arr[0]: 左值
std::move(x): 右值
getRef(x): 左值
getRvalue(10): 右值`,
                solutionRegex: 'printCategory|左值|右值|int&|int&&',
                hint: '左值引用绑定左值，右值引用绑定右值。使用函数重载来区分。',
                xp: 150
            },
            references: [
                { title: '值类别', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '左值与右值', book: 'Effective Modern C++', chapter: '条款1-5' }
            ],
            assistantTips: [
                '左值有名字、有地址；右值是临时的',
                'const左值引用可以绑定任何值',
                'std::move将左值转换为右值',
                '函数返回非引用类型时返回右值'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '以下哪个是左值？', 
                    options: [
                        { text: '10' }, 
                        { text: 'x + 5' }, 
                        { text: 'x', correct: true }, 
                        { text: 'getValue()' }
                    ], 
                    explanation: 'x是有名字的变量，可以取地址，是左值。' 
                },
                { 
                    type: 'single', 
                    question: 'int& r = 10; 是否正确？', 
                    options: [
                        { text: '正确' }, 
                        { text: '错误，左值引用不能绑定右值', correct: true }, 
                        { text: '取决于编译器' }, 
                        { text: '需要const修饰' }
                    ], 
                    explanation: '非const左值引用不能绑定到右值。' 
                },
                { 
                    type: 'single', 
                    question: 'std::move(x)的结果是什么？', 
                    options: [
                        { text: '左值' }, 
                        { text: '右值（将亡值）', correct: true }, 
                        { text: '纯右值' }, 
                        { text: '取决于x的类型' }
                    ], 
                    explanation: 'std::move将左值转换为右值引用（将亡值）。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个表达式是右值？', 
                    options: [
                        { text: 'arr[0]' }, 
                        { text: '*ptr' }, 
                        { text: 'x++', correct: true }, 
                        { text: '++x' }
                    ], 
                    explanation: '后置自增返回原值的副本，是右值。前置自增返回左值引用。' 
                },
                { 
                    type: 'single', 
                    question: '字符串字面量"hello"是什么？', 
                    options: [
                        { text: '右值' }, 
                        { text: '左值', correct: true }, 
                        { text: '将亡值' }, 
                        { text: '取决于上下文' }
                    ], 
                    explanation: '字符串字面量是const char数组类型，有地址，是左值。' 
                }
            ]
        },
        {
            id: '20.2',
            title: '右值引用与移动语义的深入',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 右值引用与移动语义的深入

### 右值引用的本质

右值引用（rvalue reference）是C++11引入的新类型，用于绑定到右值。

\`\`\`cpp
int&& rr = 10;        // 右值引用绑定到字面量
int&& rr2 = x + 5;    // 右值引用绑定到表达式结果
int&& rr3 = getValue(); // 右值引用绑定到函数返回值
\`\`\`

### 为什么需要右值引用？

#### 问题：不必要的拷贝

\`\`\`cpp
std::vector<int> createVector() {
    std::vector<int> result(1000000);
    return result;  // 传统上会拷贝整个vector
}

std::vector<int> v = createVector();  // 可能拷贝100万个元素
\`\`\`

#### 解决：移动语义

\`\`\`cpp
std::vector<int> createVector() {
    std::vector<int> result(1000000);
    return result;  // 移动语义：只转移所有权
}

std::vector<int> v = createVector();  // 只移动指针，O(1)
\`\`\`

### 移动语义的核心

移动语义允许**转移资源所有权**而不是拷贝资源。

\`\`\`cpp
class String {
private:
    char* data;
    size_t length;
    
public:
    // 拷贝构造：深拷贝
    String(const String& other) 
        : data(new char[other.length]), length(other.length) {
        std::copy(other.data, other.data + length, data);
    }
    
    // 移动构造：转移所有权
    String(String&& other) noexcept
        : data(other.data), length(other.length) {
        other.data = nullptr;  // 源对象不再拥有资源
        other.length = 0;
    }
};
\`\`\`

### 右值引用的特性

#### 1. 延长临时对象生命周期

\`\`\`cpp
std::string&& ref = std::string("hello");
// 临时对象的生命周期延长到ref的生命周期
std::cout << ref << std::endl;  // 安全
\`\`\`

#### 2. 区分拷贝和移动

\`\`\`cpp
void process(std::string& s) {
    std::cout << "左值版本: " << s << std::endl;
}

void process(std::string&& s) {
    std::cout << "右值版本: " << s << std::endl;
}

std::string s = "hello";
process(s);                    // 调用左值版本
process(std::string("world")); // 调用右值版本
process(std::move(s));         // 调用右值版本
\`\`\`

#### 3. 右值引用本身是左值

\`\`\`cpp
void process(int&& x) {
    // x的类型是int&&，但x本身是左值！
    // 因为x有名字，可以取地址
    
    int&& r1 = std::move(x);  // 正确：需要std::move
    // int&& r2 = x;          // 错误：x是左值
}
\`\`\`

### 移动语义的工作原理

\`\`\`cpp
#include <iostream>
#include <utility>

class Buffer {
private:
    int* data;
    size_t size;
    
public:
    Buffer(size_t s) : data(new int[s]), size(s) {
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    ~Buffer() {
        std::cout << "析构: " << (data ? "有数据" : "空") << std::endl;
        delete[] data;
    }
    
    // 拷贝构造
    Buffer(const Buffer& other) 
        : data(new int[other.size]), size(other.size) {
        std::cout << "拷贝构造" << std::endl;
        std::copy(other.data, other.data + size, data);
    }
    
    // 移动构造
    Buffer(Buffer&& other) noexcept
        : data(other.data), size(other.size) {
        std::cout << "移动构造" << std::endl;
        other.data = nullptr;
        other.size = 0;
    }
    
    // 拷贝赋值
    Buffer& operator=(const Buffer& other) {
        std::cout << "拷贝赋值" << std::endl;
        if (this != &other) {
            delete[] data;
            data = new int[other.size];
            size = other.size;
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }
    
    // 移动赋值
    Buffer& operator=(Buffer&& other) noexcept {
        std::cout << "移动赋值" << std::endl;
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};

int main() {
    Buffer b1(100);
    Buffer b2 = b1;              // 拷贝构造
    Buffer b3 = std::move(b1);   // 移动构造
    
    Buffer b4(50);
    b4 = b2;                     // 拷贝赋值
    b4 = std::move(b3);          // 移动赋值
    
    return 0;
}
\`\`\`

### 引用折叠规则

当模板和类型推导涉及引用时，会触发引用折叠：

\`\`\`cpp
template<typename T>
void func(T&& arg) {
    // T&& 是转发引用（万能引用）
}

int x = 10;
func(x);     // T = int&, 参数类型 = int& && = int&
func(10);    // T = int, 参数类型 = int&&

// 引用折叠规则：
// &  + &  = &
// &  + && = &
// && + &  = &
// && + && = &&
\`\`\`

### 完美转发

使用std::forward保持参数的值类别：

\`\`\`cpp
#include <utility>

template<typename T, typename Arg>
auto make_unique(Arg&& arg) {
    return std::unique_ptr<T>(new T(std::forward<Arg>(arg)));
}

std::string s = "hello";
auto p1 = make_unique<std::string>(s);           // 拷贝
auto p2 = make_unique<std::string>(std::move(s)); // 移动
\`\`\`

### 移动语义的注意事项

#### 1. 移动后源对象处于有效但未定义状态

\`\`\`cpp
std::string s1 = "hello";
std::string s2 = std::move(s1);
// s1现在处于有效但未定义状态
// 可以安全地赋新值
s1 = "world";  // 正确
// 但不要假设s1的值
// std::cout << s1;  // 未定义行为
\`\`\`

#### 2. 并非所有类型都受益于移动

\`\`\`cpp
// 小类型：移动和拷贝成本相同
int x = 10;
int y = std::move(x);  // 没有性能优势

// 数组类型：不支持移动
int arr[100];
// int arr2 = std::move(arr);  // 错误
\`\`\`

#### 3. 移动操作要标记noexcept

\`\`\`cpp
class MyVector {
public:
    MyVector(MyVector&& other) noexcept;  // 推荐标记noexcept
    MyVector& operator=(MyVector&& other) noexcept;
};
\`\`\``,
            examples: [
                {
                    title: '移动语义性能对比',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <utility>

class BigData {
private:
    std::vector<int> data;
    
public:
    BigData(size_t size) : data(size, 0) {}
    
    // 拷贝构造
    BigData(const BigData& other) : data(other.data) {
        std::cout << "拷贝构造: " << data.size() << " 个元素" << std::endl;
    }
    
    // 移动构造
    BigData(BigData&& other) noexcept : data(std::move(other.data)) {
        std::cout << "移动构造: " << data.size() << " 个元素" << std::endl;
    }
};

BigData createBigData(size_t size) {
    return BigData(size);
}

int main() {
    const size_t SIZE = 1000000;
    
    std::cout << "=== 拷贝测试 ===" << std::endl;
    auto start = std::chrono::high_resolution_clock::now();
    BigData original(SIZE);
    BigData copy = original;  // 拷贝
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "耗时: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << " 微秒" << std::endl;
    
    std::cout << "\\n=== 移动测试 ===" << std::endl;
    start = std::chrono::high_resolution_clock::now();
    BigData moved = createBigData(SIZE);  // 移动（或RVO）
    end = std::chrono::high_resolution_clock::now();
    std::cout << "耗时: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << " 微秒" << std::endl;
    
    std::cout << "\\n=== std::move测试 ===" << std::endl;
    BigData source(SIZE);
    start = std::chrono::high_resolution_clock::now();
    BigData target = std::move(source);  // 移动
    end = std::chrono::high_resolution_clock::now();
    std::cout << "耗时: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << " 微秒" << std::endl;
    
    return 0;
}`,
                    description: '对比拷贝和移动的性能差异。'
                },
                {
                    title: '完美转发示例',
                    code: `#include <iostream>
#include <string>
#include <utility>

class Widget {
public:
    std::string name;
    int value;
    
    Widget(const std::string& n, int v) : name(n), value(v) {
        std::cout << "构造: " << name << ", " << value << std::endl;
    }
    
    Widget(std::string&& n, int v) : name(std::move(n)), value(v) {
        std::cout << "移动构造: " << name << ", " << value << std::endl;
    }
};

// 不完美转发
template<typename T, typename U>
Widget* create1(U&& arg1, T&& arg2) {
    return new Widget(arg1, arg2);  // 总是拷贝
}

// 完美转发
template<typename T, typename U>
Widget* create2(U&& arg1, T&& arg2) {
    return new Widget(std::forward<U>(arg1), std::forward<T>(arg2));
}

int main() {
    std::string s = "Widget1";
    
    std::cout << "=== 不完美转发 ===" << std::endl;
    auto w1 = create1(s, 10);
    auto w2 = create1(std::string("Widget2"), 20);
    delete w1;
    delete w2;
    
    std::cout << "\\n=== 完美转发 ===" << std::endl;
    auto w3 = create2(s, 10);  // 左值，拷贝
    auto w4 = create2(std::string("Widget4"), 20);  // 右值，移动
    delete w3;
    delete w4;
    
    return 0;
}`,
                    description: '展示完美转发如何保持参数的值类别。'
                }
            ],
            handsOn: {
                title: '实现移动语义',
                description: '为String类实现移动构造和移动赋值。',
                initialCode: `#include <iostream>
#include <cstring>
#include <utility>

class String {
private:
    char* data;
    size_t length;
    
public:
    // 构造函数
    String(const char* str = "") {
        length = std::strlen(str);
        data = new char[length + 1];
        std::strcpy(data, str);
    }
    
    // 析构函数
    ~String() {
        delete[] data;
    }
    
    // 拷贝构造
    String(const String& other) {
        length = other.length;
        data = new char[length + 1];
        std::strcpy(data, other.data);
        std::cout << "拷贝构造: " << data << std::endl;
    }
    
    // TODO: 实现移动构造
    String(String&& other) noexcept {
        // 1. 转移资源
        // 2. 将源对象置空
        // 3. 打印"移动构造"
    }
    
    // 拷贝赋值
    String& operator=(const String& other) {
        if (this != &other) {
            delete[] data;
            length = other.length;
            data = new char[length + 1];
            std::strcpy(data, other.data);
            std::cout << "拷贝赋值: " << data << std::endl;
        }
        return *this;
    }
    
    // TODO: 实现移动赋值
    String& operator=(String&& other) noexcept {
        // 1. 检查自赋值
        // 2. 释放当前资源
        // 3. 转移资源
        // 4. 将源对象置空
        // 5. 打印"移动赋值"
        return *this;
    }
    
    const char* c_str() const { return data; }
};

int main() {
    String s1("Hello");
    String s2("World");
    
    std::cout << "=== 移动构造测试 ===" << std::endl;
    String s3 = std::move(s1);
    std::cout << "s3: " << s3.c_str() << std::endl;
    
    std::cout << "\\n=== 移动赋值测试 ===" << std::endl;
    s2 = std::move(s3);
    std::cout << "s2: " << s2.c_str() << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 移动构造测试 ===
移动构造: Hello
s3: Hello

=== 移动赋值测试 ===
移动赋值: Hello
s2: Hello`,
                solutionRegex: 'std::move|other.data|nullptr|other.length',
                hint: '移动构造直接转移指针，移动赋值要先释放当前资源再转移',
                xp: 200
            },
            references: [
                { title: '移动语义', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '右值引用', book: 'Effective Modern C++', chapter: '条款1-10' }
            ],
            assistantTips: [
                '右值引用用于绑定到右值',
                '移动语义转移资源所有权而非拷贝',
                '右值引用本身是左值',
                '移动后源对象处于有效但未定义状态'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '右值引用的主要用途是？', 
                    options: [
                        { text: '替代指针' }, 
                        { text: '实现移动语义', correct: true }, 
                        { text: '替代const引用' }, 
                        { text: '替代引用' }
                    ], 
                    explanation: '右值引用主要用于实现移动语义，避免不必要的拷贝。' 
                },
                { 
                    type: 'single', 
                    question: 'int&& r = x; 是否正确？', 
                    options: [
                        { text: '正确' }, 
                        { text: '错误，需要std::move(x)', correct: true }, 
                        { text: '取决于x的类型' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '右值引用不能直接绑定到左值，需要用std::move转换。' 
                },
                { 
                    type: 'single', 
                    question: '移动构造后源对象的状态是？', 
                    options: [
                        { text: '完全无效' }, 
                        { text: '有效但未定义', correct: true }, 
                        { text: '与原来相同' }, 
                        { text: '自动析构' }
                    ], 
                    explanation: '移动后源对象处于有效但未定义状态，可以安全赋新值。' 
                },
                { 
                    type: 'single', 
                    question: '引用折叠：int& && 的结果是？', 
                    options: [
                        { text: 'int&&' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '根据引用折叠规则，左值引用与右值引用折叠为左值引用。' 
                },
                { 
                    type: 'single', 
                    question: 'std::forward的作用是？', 
                    options: [
                        { text: '将左值转为右值' }, 
                        { text: '保持参数的值类别', correct: true }, 
                        { text: '创建临时对象' }, 
                        { text: '调用移动构造' }
                    ], 
                    explanation: 'std::forward用于完美转发，保持参数原有的值类别。' 
                }
            ]
        },
        {
            id: '20.3',
            title: '移动构造与移动赋值的实现',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 移动构造与移动赋值的实现

### 移动构造函数

移动构造函数用于从临时对象"窃取"资源。

\`\`\`cpp
class MyString {
private:
    char* data;
    size_t size;
    
public:
    // 移动构造函数
    MyString(MyString&& other) noexcept
        : data(other.data), size(other.size) {
        other.data = nullptr;  // 源对象不再拥有资源
        other.size = 0;
    }
};
\`\`\`

### 移动赋值运算符

移动赋值运算符用于将资源从一个对象转移到另一个已存在的对象。

\`\`\`cpp
class MyString {
public:
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {  // 防止自赋值
            delete[] data;      // 释放当前资源
            
            data = other.data;  // 转移资源
            size = other.size;
            
            other.data = nullptr;  // 源对象置空
            other.size = 0;
        }
        return *this;
    }
};
\`\`\`

### 完整实现示例

\`\`\`cpp
#include <iostream>
#include <cstring>
#include <utility>

class MyString {
private:
    char* data;
    size_t size;
    
public:
    // 默认构造
    MyString() : data(nullptr), size(0) {}
    
    // 构造函数
    MyString(const char* str) {
        size = std::strlen(str);
        data = new char[size + 1];
        std::strcpy(data, str);
    }
    
    // 析构函数
    ~MyString() {
        delete[] data;
    }
    
    // 拷贝构造
    MyString(const MyString& other) {
        size = other.size;
        data = new char[size + 1];
        std::strcpy(data, other.data);
        std::cout << "拷贝构造: " << data << std::endl;
    }
    
    // 移动构造
    MyString(MyString&& other) noexcept
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        std::cout << "移动构造: " << (data ? data : "null") << std::endl;
    }
    
    // 拷贝赋值
    MyString& operator=(const MyString& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new char[size + 1];
            std::strcpy(data, other.data);
            std::cout << "拷贝赋值: " << data << std::endl;
        }
        return *this;
    }
    
    // 移动赋值
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
            std::cout << "移动赋值: " << (data ? data : "null") << std::endl;
        }
        return *this;
    }
    
    const char* c_str() const { return data ? data : ""; }
};

int main() {
    MyString s1("Hello");
    MyString s2 = s1;              // 拷贝构造
    MyString s3 = std::move(s1);   // 移动构造
    
    MyString s4;
    s4 = s2;                       // 拷贝赋值
    s4 = std::move(s3);            // 移动赋值
    
    return 0;
}
\`\`\`

### 移动操作的规则

#### 1. 五法则（Rule of Five）

如果需要自定义析构函数、拷贝构造或拷贝赋值，通常也需要移动构造和移动赋值。

\`\`\`cpp
class Resource {
public:
    ~Resource();                           // 析构函数
    Resource(const Resource&);             // 拷贝构造
    Resource& operator=(const Resource&);  // 拷贝赋值
    Resource(Resource&&) noexcept;         // 移动构造
    Resource& operator=(Resource&&) noexcept; // 移动赋值
};
\`\`\`

#### 2. 零法则（Rule of Zero）

优先使用智能指针和标准容器，让编译器自动生成特殊成员函数。

\`\`\`cpp
class GoodClass {
private:
    std::string name;
    std::vector<int> data;
    std::unique_ptr<int> ptr;
    
public:
    // 不需要自定义任何特殊成员函数！
    // 编译器自动生成的版本工作良好
};
\`\`\`

#### 3. 默认和删除

\`\`\`cpp
class MyClass {
public:
    MyClass() = default;
    MyClass(const MyClass&) = default;
    MyClass(MyClass&&) = default;
    MyClass& operator=(const MyClass&) = default;
    MyClass& operator=(MyClass&&) = default;
    ~MyClass() = default;
    
    // 禁止拷贝
    // MyClass(const MyClass&) = delete;
};
\`\`\`

### 移动操作与异常

移动操作应该标记noexcept，因为：

1. 标准容器在重新分配时会优先使用移动操作（如果noexcept）
2. 强异常安全保证需要移动操作不抛异常

\`\`\`cpp
class MyVector {
public:
    MyVector(MyVector&& other) noexcept {
        // 移动操作不应该抛异常
    }
};

// std::vector在重新分配时
std::vector<MyVector> vec;
vec.push_back(MyVector());  // 如果移动构造是noexcept，使用移动
                            // 否则使用拷贝
\`\`\`

### 常见错误

#### 1. 忘记将源对象置空

\`\`\`cpp
// 错误
MyString(MyString&& other) 
    : data(other.data), size(other.size) {
    // 忘记将other.data置空！
    // 析构时会double free
}

// 正确
MyString(MyString&& other) noexcept
    : data(other.data), size(other.size) {
    other.data = nullptr;
    other.size = 0;
}
\`\`\`

#### 2. 移动赋值忘记释放当前资源

\`\`\`cpp
// 错误
MyString& operator=(MyString&& other) {
    data = other.data;  // 内存泄漏！
    other.data = nullptr;
    return *this;
}

// 正确
MyString& operator=(MyString&& other) noexcept {
    if (this != &other) {
        delete[] data;  // 先释放当前资源
        data = other.data;
        other.data = nullptr;
    }
    return *this;
}
\`\`\`

#### 3. 忘记检查自赋值

\`\`\`cpp
// 危险
MyString& operator=(MyString&& other) noexcept {
    delete[] data;
    data = other.data;  // 如果this == &other，data已被删除
    other.data = nullptr;
    return *this;
}

// 正确
MyString& operator=(MyString&& other) noexcept {
    if (this != &other) {
        delete[] data;
        data = other.data;
        other.data = nullptr;
    }
    return *this;
}
\`\`\`

### 交换操作

实现swap函数可以简化移动操作：

\`\`\`cpp
class MyString {
public:
    friend void swap(MyString& a, MyString& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
        swap(a.size, b.size);
    }
    
    // 使用swap实现移动赋值
    MyString& operator=(MyString&& other) noexcept {
        swap(*this, other);
        return *this;
    }
    
    // 也可以用于拷贝赋值
    MyString& operator=(const MyString& other) {
        MyString temp(other);
        swap(*this, temp);
        return *this;
    }
};
\`\`\``,
            examples: [
                {
                    title: '完整的资源管理类',
                    code: `#include <iostream>
#include <cstring>
#include <utility>

class Buffer {
private:
    int* data;
    size_t size;
    
public:
    // 默认构造
    Buffer() : data(nullptr), size(0) {
        std::cout << "默认构造" << std::endl;
    }
    
    // 带参数构造
    explicit Buffer(size_t s) : data(new int[s]()), size(s) {
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    // 析构函数
    ~Buffer() {
        std::cout << "析构: " << (data ? "有数据" : "空") << std::endl;
        delete[] data;
    }
    
    // 拷贝构造
    Buffer(const Buffer& other) 
        : data(new int[other.size]), size(other.size) {
        std::cout << "拷贝构造" << std::endl;
        std::copy(other.data, other.data + size, data);
    }
    
    // 移动构造
    Buffer(Buffer&& other) noexcept
        : data(other.data), size(other.size) {
        std::cout << "移动构造" << std::endl;
        other.data = nullptr;
        other.size = 0;
    }
    
    // 拷贝赋值
    Buffer& operator=(const Buffer& other) {
        std::cout << "拷贝赋值" << std::endl;
        if (this != &other) {
            delete[] data;
            data = new int[other.size];
            size = other.size;
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }
    
    // 移动赋值
    Buffer& operator=(Buffer&& other) noexcept {
        std::cout << "移动赋值" << std::endl;
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
    
    size_t getSize() const { return size; }
};

Buffer createBuffer(size_t size) {
    return Buffer(size);
}

int main() {
    std::cout << "=== 创建缓冲区 ===" << std::endl;
    Buffer b1(100);
    
    std::cout << "\\n=== 拷贝构造 ===" << std::endl;
    Buffer b2 = b1;
    
    std::cout << "\\n=== 移动构造 ===" << std::endl;
    Buffer b3 = std::move(b1);
    
    std::cout << "\\n=== 拷贝赋值 ===" << std::endl;
    Buffer b4;
    b4 = b2;
    
    std::cout << "\\n=== 移动赋值 ===" << std::endl;
    Buffer b5;
    b5 = std::move(b3);
    
    std::cout << "\\n=== 返回值 ===" << std::endl;
    Buffer b6 = createBuffer(50);
    
    std::cout << "\\n=== 程序结束 ===" << std::endl;
    return 0;
}`,
                    description: '展示完整的资源管理类实现。'
                },
                {
                    title: '使用swap简化实现',
                    code: `#include <iostream>
#include <cstring>
#include <utility>
#include <algorithm>

class String {
private:
    char* data;
    size_t size;
    
public:
    String() : data(nullptr), size(0) {}
    
    String(const char* str) {
        size = std::strlen(str);
        data = new char[size + 1];
        std::strcpy(data, str);
    }
    
    ~String() {
        delete[] data;
    }
    
    // 拷贝构造
    String(const String& other) : String(other.data) {
        std::cout << "拷贝构造" << std::endl;
    }
    
    // 移动构造
    String(String&& other) noexcept : String() {
        swap(*this, other);
        std::cout << "移动构造" << std::endl;
    }
    
    // 拷贝赋值（使用拷贝交换惯用法）
    String& operator=(String other) {
        swap(*this, other);
        std::cout << "拷贝赋值" << std::endl;
        return *this;
    }
    
    // 移动赋值（不需要单独实现，上面的版本可以处理）
    
    friend void swap(String& a, String& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
        swap(a.size, b.size);
    }
    
    const char* c_str() const { return data ? data : ""; }
};

int main() {
    String s1("Hello");
    String s2("World");
    
    std::cout << "=== 拷贝赋值 ===" << std::endl;
    s1 = s2;
    std::cout << "s1: " << s1.c_str() << std::endl;
    
    std::cout << "\\n=== 移动赋值 ===" << std::endl;
    String s3;
    s3 = std::move(s2);
    std::cout << "s3: " << s3.c_str() << std::endl;
    
    return 0;
}`,
                    description: '使用swap和拷贝交换惯用法简化实现。'
                }
            ],
            handsOn: {
                title: '实现动态数组类',
                description: '为DynamicArray类实现完整的移动语义。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <utility>

class DynamicArray {
private:
    int* data;
    size_t size;
    size_t capacity;
    
public:
    // 默认构造
    DynamicArray() : data(nullptr), size(0), capacity(0) {}
    
    // 带容量构造
    explicit DynamicArray(size_t cap) 
        : data(new int[cap]()), size(0), capacity(cap) {}
    
    // 析构函数
    ~DynamicArray() {
        delete[] data;
    }
    
    // TODO: 实现拷贝构造
    DynamicArray(const DynamicArray& other) {
        // 1. 分配新内存
        // 2. 复制元素
        // 3. 打印"拷贝构造"
    }
    
    // TODO: 实现移动构造
    DynamicArray(DynamicArray&& other) noexcept {
        // 1. 转移资源
        // 2. 将源对象置空
        // 3. 打印"移动构造"
    }
    
    // TODO: 实现拷贝赋值
    DynamicArray& operator=(const DynamicArray& other) {
        // 1. 检查自赋值
        // 2. 释放当前资源
        // 3. 分配新内存并复制
        // 4. 打印"拷贝赋值"
        return *this;
    }
    
    // TODO: 实现移动赋值
    DynamicArray& operator=(DynamicArray&& other) noexcept {
        // 1. 检查自赋值
        // 2. 释放当前资源
        // 3. 转移资源
        // 4. 将源对象置空
        // 5. 打印"移动赋值"
        return *this;
    }
    
    void push_back(int value) {
        if (size >= capacity) {
            size_t newCap = capacity == 0 ? 1 : capacity * 2;
            int* newData = new int[newCap];
            std::copy(data, data + size, newData);
            delete[] data;
            data = newData;
            capacity = newCap;
        }
        data[size++] = value;
    }
    
    size_t getSize() const { return size; }
    int operator[](size_t index) const { return data[index]; }
};

int main() {
    DynamicArray arr1;
    arr1.push_back(1);
    arr1.push_back(2);
    arr1.push_back(3);
    
    std::cout << "=== 拷贝构造测试 ===" << std::endl;
    DynamicArray arr2 = arr1;
    std::cout << "arr2大小: " << arr2.getSize() << std::endl;
    
    std::cout << "\\n=== 移动构造测试 ===" << std::endl;
    DynamicArray arr3 = std::move(arr1);
    std::cout << "arr3大小: " << arr3.getSize() << std::endl;
    
    std::cout << "\\n=== 拷贝赋值测试 ===" << std::endl;
    DynamicArray arr4;
    arr4 = arr2;
    std::cout << "arr4大小: " << arr4.getSize() << std::endl;
    
    std::cout << "\\n=== 移动赋值测试 ===" << std::endl;
    DynamicArray arr5;
    arr5 = std::move(arr3);
    std::cout << "arr5大小: " << arr5.getSize() << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 拷贝构造测试 ===
拷贝构造
arr2大小: 3

=== 移动构造测试 ===
移动构造
arr3大小: 3

=== 拷贝赋值测试 ===
拷贝赋值
arr4大小: 3

=== 移动赋值测试 ===
移动赋值
arr5大小: 3`,
                solutionRegex: 'new int|delete\\[\\]|other.data|nullptr|std::copy',
                hint: '拷贝要深拷贝，移动要转移指针并置空源对象',
                xp: 250
            },
            references: [
                { title: '移动构造与移动赋值', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '五法则', book: 'Effective C++', chapter: '条款11' }
            ],
            assistantTips: [
                '移动构造直接转移资源所有权',
                '移动赋值要先释放当前资源',
                '移动操作要标记noexcept',
                '记得将源对象置空避免double free'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '移动构造函数的参数类型是？', 
                    options: [
                        { text: 'const T&' }, 
                        { text: 'T&' }, 
                        { text: 'T&&', correct: true }, 
                        { text: 'const T&&' }
                    ], 
                    explanation: '移动构造函数接受右值引用参数。' 
                },
                { 
                    type: 'single', 
                    question: '移动赋值运算符为什么需要检查自赋值？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '避免释放自己的资源后再访问', correct: true }, 
                        { text: '编译器要求' }, 
                        { text: '代码风格' }
                    ], 
                    explanation: '自赋值时如果先释放资源，后面访问会出错。' 
                },
                { 
                    type: 'single', 
                    question: '五法则是指？', 
                    options: [
                        { text: '五个设计原则' }, 
                        { text: '析构、拷贝构造、拷贝赋值、移动构造、移动赋值', correct: true }, 
                        { text: '五种继承方式' }, 
                        { text: '五个访问修饰符' }
                    ], 
                    explanation: '五法则指需要自定义这五个特殊成员函数。' 
                },
                { 
                    type: 'single', 
                    question: '移动操作为什么要标记noexcept？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '标准容器在重新分配时会优先使用noexcept的移动', correct: true }, 
                        { text: '编译器要求' }, 
                        { text: '避免内存泄漏' }
                    ], 
                    explanation: 'noexcept的移动操作可以让标准容器安全使用移动而非拷贝。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝交换惯用法的优点是？', 
                    options: [
                        { text: '代码更复杂' }, 
                        { text: '自动处理自赋值和异常安全', correct: true }, 
                        { text: '性能更好' }, 
                        { text: '减少代码量' }
                    ], 
                    explanation: '拷贝交换惯用法自动处理自赋值并提供强异常安全保证。' 
                }
            ]
        },
        {
            id: '20.4',
            title: 'noexcept 与移动操作',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## noexcept 与移动操作

### 什么是noexcept？

noexcept是C++11引入的关键字，用于指定函数不会抛出异常。

\`\`\`cpp
void func() noexcept {
    // 这个函数保证不抛出异常
}

void func2() noexcept(true) {  // 等价于noexcept
    // ...
}

void func3() noexcept(false) {  // 可能抛出异常
    // ...
}
\`\`\`

### 为什么移动操作要标记noexcept？

#### 1. 标准容器的优化

标准容器在重新分配内存时，会优先使用移动操作（如果noexcept）。

\`\`\`cpp
#include <vector>

class Widget {
public:
    Widget(Widget&& other) noexcept;  // 移动构造
};

std::vector<Widget> vec;
vec.push_back(Widget());  // 如果移动构造是noexcept，使用移动
                          // 否则使用拷贝（更安全但更慢）
\`\`\`

#### 2. 强异常安全保证

移动操作如果不抛异常，可以提供强异常安全保证。

\`\`\`cpp
template<typename T>
void swap(T& a, T& b) noexcept(
    std::is_nothrow_move_constructible<T>::value &&
    std::is_nothrow_move_assignable<T>::value
) {
    T temp = std::move(a);
    a = std::move(b);
    b = std::move(temp);
}
\`\`\`

### noexcept的行为

#### 1. 如果抛出异常

\`\`\`cpp
void func() noexcept {
    throw std::runtime_error("error");  // 程序会调用std::terminate
}
\`\`\`

#### 2. 条件noexcept

\`\`\`cpp
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}

// 只有当T的swap不抛异常时，这个swap才不抛异常
\`\`\`

### noexcept与类型系统

\`\`\`cpp
void f1() noexcept;
void f2();

// 函数指针
void (*pf1)() noexcept = f1;  // 正确
// void (*pf2)() noexcept = f2;  // 错误：f2可能抛异常

// 虚函数
struct Base {
    virtual void f() noexcept;
};

struct Derived : Base {
    void f() noexcept override;  // 必须保持noexcept
    // void f() override;  // 错误：不能放宽noexcept
};
\`\`\`

### 移动操作的最佳实践

#### 1. 总是标记noexcept

\`\`\`cpp
class Widget {
public:
    Widget(Widget&& other) noexcept;
    Widget& operator=(Widget&& other) noexcept;
};
\`\`\`

#### 2. 析构函数隐式noexcept

\`\`\`cpp
class Widget {
public:
    ~Widget();  // 隐式noexcept
    // ~Widget() noexcept;  // 等价
};
\`\`\`

#### 3. 默认操作

\`\`\`cpp
class Widget {
public:
    Widget() = default;
    Widget(Widget&&) = default;  // 自动推导noexcept
    Widget& operator=(Widget&&) = default;
};
\`\`\`

### noexcept运算符

noexcept运算符在编译时检查表达式是否不抛异常。

\`\`\`cpp
void f1() noexcept {}
void f2() {}

constexpr bool b1 = noexcept(f1());  // true
constexpr bool b2 = noexcept(f2());  // false

// 用于条件编译
template<typename T>
void process(T&& value) noexcept(noexcept(std::declval<T>().process())) {
    value.process();
}
\`\`\`

### 类型特征

\`\`\`cpp
#include <type_traits>

class Widget {
public:
    Widget(Widget&&) noexcept;
    Widget& operator=(Widget&&) noexcept;
};

// 检查类型特征
static_assert(std::is_nothrow_move_constructible<Widget>::value);
static_assert(std::is_nothrow_move_assignable<Widget>::value);
static_assert(std::is_nothrow_destructible<Widget>::value);
\`\`\`

### 实际示例

\`\`\`cpp
#include <iostream>
#include <vector>
#include <string>

class GoodType {
public:
    std::string data;
    
    GoodType() = default;
    GoodType(GoodType&& other) noexcept : data(std::move(other.data)) {
        std::cout << "GoodType移动构造" << std::endl;
    }
    GoodType& operator=(GoodType&& other) noexcept {
        data = std::move(other.data);
        std::cout << "GoodType移动赋值" << std::endl;
        return *this;
    }
};

class BadType {
public:
    std::string data;
    
    BadType() = default;
    BadType(BadType&& other) : data(std::move(other.data)) {  // 没有noexcept
        std::cout << "BadType移动构造" << std::endl;
    }
    BadType& operator=(BadType&& other) {
        data = std::move(other.data);
        std::cout << "BadType移动赋值" << std::endl;
        return *this;
    }
};

int main() {
    std::cout << "=== GoodType (noexcept) ===" << std::endl;
    std::vector<GoodType> v1;
    v1.reserve(2);
    v1.push_back(GoodType());
    std::cout << "重新分配..." << std::endl;
    v1.push_back(GoodType());  // 使用移动
    
    std::cout << "\\n=== BadType (无noexcept) ===" << std::endl;
    std::vector<BadType> v2;
    v2.reserve(2);
    v2.push_back(BadType());
    std::cout << "重新分配..." << std::endl;
    v2.push_back(BadType());  // 可能使用拷贝
    
    return 0;
}
\`\`\`

### noexcept的权衡

#### 优点
- 编译器可以优化
- 标准容器会优先使用移动
- 提供更强的异常安全保证

#### 缺点
- 如果真的抛出异常，程序会终止
- 需要仔细考虑是否真的不会抛异常

\`\`\`cpp
// 安全的做法：只在确定不会抛异常时使用noexcept
class SafeClass {
public:
    SafeClass(SafeClass&& other) noexcept 
        : ptr(other.ptr) {  // 指针赋值不会抛异常
        other.ptr = nullptr;
    }
    
private:
    int* ptr;
};

// 危险的做法：std::string的移动可能抛异常吗？
// 实际上不会，但需要了解实现细节
class RiskyClass {
public:
    RiskyClass(RiskyClass&& other) noexcept 
        : str(std::move(other.str)) {}  // std::string的移动是noexcept
    
private:
    std::string str;
};
\`\`\``,
            examples: [
                {
                    title: 'noexcept对容器的影响',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <utility>

class WithNoexcept {
public:
    std::string data;
    
    WithNoexcept() = default;
    WithNoexcept(const std::string& s) : data(s) {}
    
    WithNoexcept(WithNoexcept&& other) noexcept 
        : data(std::move(other.data)) {
        std::cout << "  WithNoexcept移动构造" << std::endl;
    }
    
    WithNoexcept& operator=(WithNoexcept&& other) noexcept {
        data = std::move(other.data);
        std::cout << "  WithNoexcept移动赋值" << std::endl;
        return *this;
    }
};

class WithoutNoexcept {
public:
    std::string data;
    
    WithoutNoexcept() = default;
    WithoutNoexcept(const std::string& s) : data(s) {}
    
    WithoutNoexcept(WithoutNoexcept&& other) 
        : data(std::move(other.data)) {
        std::cout << "  WithoutNoexcept移动构造" << std::endl;
    }
    
    WithoutNoexcept& operator=(WithoutNoexcept&& other) {
        data = std::move(other.data);
        std::cout << "  WithoutNoexcept移动赋值" << std::endl;
        return *this;
    }
};

int main() {
    std::cout << "=== WithNoexcept ===" << std::endl;
    std::vector<WithNoexcept> v1;
    v1.reserve(2);
    v1.emplace_back("A");
    std::cout << "添加第二个元素（触发重新分配）:" << std::endl;
    v1.emplace_back("B");
    
    std::cout << "\\n=== WithoutNoexcept ===" << std::endl;
    std::vector<WithoutNoexcept> v2;
    v2.reserve(2);
    v2.emplace_back("A");
    std::cout << "添加第二个元素（触发重新分配）:" << std::endl;
    v2.emplace_back("B");
    
    return 0;
}`,
                    description: '展示noexcept对std::vector重新分配行为的影响。'
                },
                {
                    title: 'noexcept运算符',
                    code: `#include <iostream>
#include <type_traits>
#include <string>

void noThrowFunc() noexcept {
    std::cout << "不抛异常" << std::endl;
}

void mayThrowFunc() {
    std::cout << "可能抛异常" << std::endl;
}

class MyClass {
public:
    void method() noexcept {}
    void riskyMethod() {}
};

int main() {
    std::cout << "=== noexcept运算符 ===" << std::endl;
    std::cout << "noThrowFunc: " << noexcept(noThrowFunc()) << std::endl;
    std::cout << "mayThrowFunc: " << noexcept(mayThrowFunc()) << std::endl;
    
    std::cout << "\\n=== 类型特征 ===" << std::endl;
    std::cout << "int是noexcept移动构造: " 
              << std::is_nothrow_move_constructible<int>::value << std::endl;
    std::cout << "std::string是noexcept移动构造: " 
              << std::is_nothrow_move_constructible<std::string>::value << std::endl;
    
    std::cout << "\\n=== 成员函数 ===" << std::endl;
    MyClass obj;
    std::cout << "method: " << noexcept(obj.method()) << std::endl;
    std::cout << "riskyMethod: " << noexcept(obj.riskyMethod()) << std::endl;
    
    return 0;
}`,
                    description: '展示noexcept运算符和类型特征的使用。'
                }
            ],
            handsOn: {
                title: '实现noexcept移动操作',
                description: '为Container类实现带noexcept的移动操作。',
                initialCode: `#include <iostream>
#include <vector>
#include <type_traits>

class Container {
private:
    int* data;
    size_t size;
    
public:
    Container() : data(nullptr), size(0) {}
    
    explicit Container(size_t s) : data(new int[s]()), size(s) {
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    ~Container() {
        delete[] data;
    }
    
    // TODO: 实现拷贝构造（不需要noexcept）
    Container(const Container& other) {
        // 分配并复制
        std::cout << "拷贝构造" << std::endl;
    }
    
    // TODO: 实现移动构造（标记noexcept）
    Container(Container&& other) noexcept {
        // 转移资源并置空源对象
        std::cout << "移动构造" << std::endl;
    }
    
    // TODO: 实现拷贝赋值
    Container& operator=(const Container& other) {
        std::cout << "拷贝赋值" << std::endl;
        return *this;
    }
    
    // TODO: 实现移动赋值（标记noexcept）
    Container& operator=(Container&& other) noexcept {
        std::cout << "移动赋值" << std::endl;
        return *this;
    }
    
    size_t getSize() const { return size; }
};

int main() {
    // 检查类型特征
    std::cout << "=== 类型特征检查 ===" << std::endl;
    std::cout << "is_nothrow_move_constructible: " 
              << std::is_nothrow_move_constructible<Container>::value << std::endl;
    std::cout << "is_nothrow_move_assignable: " 
              << std::is_nothrow_move_assignable<Container>::value << std::endl;
    
    // 测试vector行为
    std::cout << "\\n=== vector测试 ===" << std::endl;
    std::vector<Container> vec;
    vec.reserve(2);
    
    vec.emplace_back(10);
    std::cout << "添加第二个元素:" << std::endl;
    vec.emplace_back(20);  // 触发重新分配
    
    return 0;
}`,
                expectedOutput: `=== 类型特征检查 ===
is_nothrow_move_constructible: 1
is_nothrow_move_assignable: 1

=== vector测试 ===
构造: 10 个元素
添加第二个元素:
构造: 20 个元素
移动构造
移动构造`,
                solutionRegex: 'noexcept|other.data|nullptr|new int|delete\\[\\]',
                hint: '移动操作标记noexcept，转移指针后置空源对象',
                xp: 180
            },
            references: [
                { title: 'noexcept', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '异常安全', book: 'Effective C++', chapter: '条款29' }
            ],
            assistantTips: [
                '移动操作应该标记noexcept',
                'noexcept让标准容器优先使用移动',
                '析构函数隐式noexcept',
                '使用noexcept运算符检查表达式'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'noexcept函数如果抛出异常会怎样？', 
                    options: [
                        { text: '异常被忽略' }, 
                        { text: '调用std::terminate', correct: true }, 
                        { text: '异常正常传播' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: 'noexcept函数抛出异常会调用std::terminate终止程序。' 
                },
                { 
                    type: 'single', 
                    question: '为什么移动操作要标记noexcept？', 
                    options: [
                        { text: '语法要求' }, 
                        { text: '让标准容器优先使用移动', correct: true }, 
                        { text: '提高编译速度' }, 
                        { text: '减少内存使用' }
                    ], 
                    explanation: '标准容器在重新分配时会优先使用noexcept的移动操作。' 
                },
                { 
                    type: 'single', 
                    question: '析构函数默认是noexcept吗？', 
                    options: [
                        { text: '否' }, 
                        { text: '是', correct: true }, 
                        { text: '取决于类型' }, 
                        { text: '需要显式标记' }
                    ], 
                    explanation: '析构函数隐式标记为noexcept。' 
                },
                { 
                    type: 'single', 
                    question: 'noexcept(f())的作用是？', 
                    options: [
                        { text: '调用f' }, 
                        { text: '检查f是否不抛异常', correct: true }, 
                        { text: '让f不抛异常' }, 
                        { text: '捕获f的异常' }
                    ], 
                    explanation: 'noexcept运算符在编译时检查表达式是否不抛异常。' 
                },
                { 
                    type: 'single', 
                    question: '虚函数重写时noexcept可以放宽吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以', correct: true }, 
                        { text: '取决于编译器' }, 
                        { text: '只能更严格' }
                    ], 
                    explanation: '虚函数重写时不能放宽noexcept限制，但可以更严格。' 
                }
            ]
        },
        {
            id: '20.5',
            title: 'std::move 与 std::forward 本质',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## std::move 与 std::forward 本质

### std::move的本质

std::move并不移动任何东西，它只是将左值转换为右值引用。

\`\`\`cpp
template<typename T>
constexpr typename std::remove_reference<T>::type&& 
move(T&& t) noexcept {
    return static_cast<typename std::remove_reference<T>::type&&>(t);
}
\`\`\`

#### 简化理解

\`\`\`cpp
int x = 10;
int&& r = std::move(x);  // std::move(x) 就是 static_cast<int&&>(x)

// std::move只是类型转换，不产生移动代码
// 真正的移动发生在移动构造函数或移动赋值运算符中
\`\`\`

### std::move的使用

\`\`\`cpp
std::string s1 = "hello";
std::string s2 = std::move(s1);  // 调用移动构造函数

// s1现在处于有效但未定义状态
s1 = "world";  // 可以安全赋新值
\`\`\`

### std::move的误区

#### 1. std::move不移动

\`\`\`cpp
int x = 10;
std::move(x);  // 什么都没发生！x仍然是10

int y = std::move(x);  // 这里只是拷贝，int没有移动语义
\`\`\`

#### 2. 移动后源对象仍有效

\`\`\`cpp
std::string s1 = "hello";
std::string s2 = std::move(s1);

// s1仍然有效，可以安全使用
s1.size();      // 有效（返回0或其他值）
s1 = "world";   // 有效
// s1[0];        // 未定义行为
\`\`\`

### std::forward的本质

std::forward用于完美转发，保持参数原有的值类别。

\`\`\`cpp
template<typename T>
constexpr T&& forward(typename std::remove_reference<T>::type& t) noexcept {
    return static_cast<T&&>(t);
}

template<typename T>
constexpr T&& forward(typename std::remove_reference<T>::type&& t) noexcept {
    static_assert(!std::is_lvalue_reference<T>::value, 
                  "Cannot forward an rvalue as an lvalue");
    return static_cast<T&&>(t);
}
\`\`\`

### 完美转发

\`\`\`cpp
#include <utility>
#include <iostream>

void process(int& x) {
    std::cout << "左值: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "右值: " << x << std::endl;
}

template<typename T>
void wrapper(T&& arg) {
    process(std::forward<T>(arg));  // 完美转发
}

int main() {
    int x = 10;
    wrapper(x);              // 调用左值版本
    wrapper(10);             // 调用右值版本
    wrapper(std::move(x));   // 调用右值版本
}
\`\`\`

### std::forward的工作原理

\`\`\`cpp
template<typename T>
void wrapper(T&& arg) {
    // T&& 是转发引用（万能引用）
    
    // 如果传入左值：T = int&, arg类型 = int& && = int&
    // 如果传入右值：T = int, arg类型 = int&&
    
    process(std::forward<T>(arg));
    
    // std::forward<T>(arg) 的行为：
    // T = int& 时：返回 int& && = int&（左值引用）
    // T = int 时：返回 int&&（右值引用）
}
\`\`\`

### std::move vs std::forward

| 特性 | std::move | std::forward |
|------|-----------|--------------|
| 用途 | 无条件转换为右值 | 条件性转换 |
| 参数 | 任意类型 | 需要模板参数T |
| 场景 | 明确要移动 | 完美转发 |
| 返回 | 总是右值引用 | 保持原有值类别 |

### 转发引用（万能引用）

\`\`\`cpp
template<typename T>
void func(T&& arg);  // T&& 是转发引用

// 转发引用的条件：
// 1. 必须是模板参数
// 2. 必须是T&&形式
// 3. 必须发生类型推导

// 不是转发引用的情况：
void func(int&& arg);  // 右值引用，不是转发引用

template<typename T>
class MyClass {
    void func(T&& arg);  // 不是转发引用（T在类实例化时确定）
};
\`\`\`

### 实际应用

#### 1. 工厂函数

\`\`\`cpp
template<typename T, typename... Args>
std::unique_ptr<T> make_unique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

std::string s = "hello";
auto p1 = make_unique<std::string>(s);           // 拷贝
auto p2 = make_unique<std::string>(std::move(s)); // 移动
\`\`\`

#### 2. 包装函数

\`\`\`cpp
template<typename Func, typename... Args>
auto invoke(Func&& f, Args&&... args) 
    -> decltype(std::forward<Func>(f)(std::forward<Args>(args)...)) {
    return std::forward<Func>(f)(std::forward<Args>(args)...);
}
\`\`\`

#### 3. 容器的emplace方法

\`\`\`cpp
template<typename T, typename... Args>
void emplace_back(Args&&... args) {
    // 使用完美转发构造元素
    new (data + size) T(std::forward<Args>(args)...);
}
\`\`\`

### 常见错误

#### 1. 在转发引用上使用std::move

\`\`\`cpp
template<typename T>
void wrong(T&& arg) {
    process(std::move(arg));  // 错误：总是转换为右值
}

template<typename T>
void right(T&& arg) {
    process(std::forward<T>(arg));  // 正确：保持值类别
}
\`\`\`

#### 2. 忘记std::forward

\`\`\`cpp
template<typename T>
void wrong(T&& arg) {
    process(arg);  // 错误：arg本身是左值
}

template<typename T>
void right(T&& arg) {
    process(std::forward<T>(arg));  // 正确
}
\`\`\`

#### 3. 对非转发引用使用std::forward

\`\`\`cpp
void func(int&& arg) {
    // arg是右值引用，不是转发引用
    process(std::forward<int>(arg));  // 可以但没必要
    process(std::move(arg));          // 更清晰
}
\`\`\``,
            examples: [
                {
                    title: 'std::move的本质',
                    code: `#include <iostream>
#include <string>
#include <utility>

// 自己实现move
template<typename T>
typename std::remove_reference<T>::type&& my_move(T& t) {
    return static_cast<typename std::remove_reference<T>::type&&>(t);
}

int main() {
    std::string s1 = "Hello";
    
    std::cout << "=== std::move只是类型转换 ===" << std::endl;
    std::cout << "s1: " << s1 << std::endl;
    std::string&& ref = std::move(s1);  // 只是转换，没有移动
    std::cout << "std::move后 s1: " << s1 << std::endl;
    std::cout << "ref: " << ref << std::endl;
    
    std::cout << "\\n=== 真正的移动 ===" << std::endl;
    std::string s2 = "World";
    std::string s3 = std::move(s2);  // 调用移动构造函数
    std::cout << "移动后 s2: '" << s2 << "'" << std::endl;
    std::cout << "s3: " << s3 << std::endl;
    
    std::cout << "\\n=== 使用自己的move ===" << std::endl;
    std::string s4 = "Test";
    std::string s5 = my_move(s4);
    std::cout << "my_move后 s4: '" << s4 << "'" << std::endl;
    std::cout << "s5: " << s5 << std::endl;
    
    return 0;
}`,
                    description: '展示std::move的本质只是类型转换。'
                },
                {
                    title: '完美转发示例',
                    code: `#include <iostream>
#include <string>
#include <utility>

class Widget {
public:
    std::string name;
    int value;
    
    Widget(const std::string& n, int v) : name(n), value(v) {
        std::cout << "构造(const string&, int): " << name << std::endl;
    }
    
    Widget(std::string&& n, int v) : name(std::move(n)), value(v) {
        std::cout << "构造(string&&, int): " << name << std::endl;
    }
};

// 不完美转发
template<typename T, typename U>
Widget* create_bad(U&& arg1, T&& arg2) {
    return new Widget(arg1, arg2);  // 总是拷贝
}

// 完美转发
template<typename T, typename U>
Widget* create_good(U&& arg1, T&& arg2) {
    return new Widget(std::forward<U>(arg1), std::forward<T>(arg2));
}

int main() {
    std::string s = "Widget";
    
    std::cout << "=== 不完美转发 ===" << std::endl;
    auto w1 = create_bad(s, 10);
    auto w2 = create_bad(std::string("Temp"), 20);
    delete w1;
    delete w2;
    
    std::cout << "\\n=== 完美转发 ===" << std::endl;
    auto w3 = create_good(s, 10);  // 左值，拷贝
    auto w4 = create_good(std::string("Temp"), 20);  // 右值，移动
    delete w3;
    delete w4;
    
    return 0;
}`,
                    description: '展示完美转发如何保持参数的值类别。'
                }
            ],
            handsOn: {
                title: '实现完美转发包装器',
                description: '实现一个通用的函数包装器，支持完美转发。',
                initialCode: `#include <iostream>
#include <string>
#include <utility>

void process(int& x) {
    std::cout << "左值: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "右值: " << x << std::endl;
}

void process(const std::string& s) {
    std::cout << "左值字符串: " << s << std::endl;
}

void process(std::string&& s) {
    std::cout << "右值字符串: " << s << std::endl;
}

// TODO: 实现通用包装器
template<typename T>
void wrapper(T&& arg) {
    // 使用std::forward完美转发
    // 调用process函数
}

// TODO: 实现带返回值的包装器
template<typename Func, typename... Args>
auto invoke(Func&& f, Args&&... args) 
    -> decltype(std::forward<Func>(f)(std::forward<Args>(args)...)) {
    // 完美转发所有参数并调用f
    // 返回结果
}

int add(int a, int b) {
    return a + b;
}

int main() {
    // 测试wrapper
    std::cout << "=== 测试wrapper ===" << std::endl;
    int x = 10;
    wrapper(x);              // 应该输出"左值: 10"
    wrapper(20);             // 应该输出"右值: 20"
    
    std::string s = "hello";
    wrapper(s);              // 应该输出"左值字符串: hello"
    wrapper(std::string("world"));  // 应该输出"右值字符串: world"
    
    // 测试invoke
    std::cout << "\\n=== 测试invoke ===" << std::endl;
    int result = invoke(add, 3, 4);
    std::cout << "add(3, 4) = " << result << std::endl;
    
    auto lambda = [](int a, int b) { return a * b; };
    int product = invoke(lambda, 5, 6);
    std::cout << "lambda(5, 6) = " << product << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 测试wrapper ===
左值: 10
右值: 20
左值字符串: hello
右值字符串: world

=== 测试invoke ===
add(3, 4) = 7
lambda(5, 6) = 30`,
                solutionRegex: 'std::forward|process\\(std::forward|f\\(std::forward',
                hint: 'wrapper使用std::forward<T>(arg)，invoke使用参数包展开',
                xp: 200
            },
            references: [
                { title: 'std::move与std::forward', book: 'Effective Modern C++', chapter: '条款23-25' },
                { title: '完美转发', book: 'C++ Primer 第五版', chapter: '第16章' }
            ],
            assistantTips: [
                'std::move只是类型转换，不移动',
                'std::forward用于完美转发',
                '转发引用必须是T&&且发生类型推导',
                '转发引用本身是左值，需要std::forward'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::move的作用是？', 
                    options: [
                        { text: '移动对象' }, 
                        { text: '将左值转换为右值引用', correct: true }, 
                        { text: '删除对象' }, 
                        { text: '拷贝对象' }
                    ], 
                    explanation: 'std::move只是将左值转换为右值引用，真正的移动在移动构造函数中发生。' 
                },
                { 
                    type: 'single', 
                    question: 'std::forward的主要用途是？', 
                    options: [
                        { text: '无条件转换为右值' }, 
                        { text: '完美转发，保持值类别', correct: true }, 
                        { text: '类型转换' }, 
                        { text: '异常处理' }
                    ], 
                    explanation: 'std::forward用于完美转发，保持参数原有的值类别。' 
                },
                { 
                    type: 'single', 
                    question: '转发引用的条件是？', 
                    options: [
                        { text: '任何T&&' }, 
                        { text: '模板参数T&&且发生类型推导', correct: true }, 
                        { text: '函数参数T&&' }, 
                        { text: '返回类型T&&' }
                    ], 
                    explanation: '转发引用必须是模板参数T&&形式，且必须发生类型推导。' 
                },
                { 
                    type: 'single', 
                    question: 'void f(T&& arg)中arg本身是什么？', 
                    options: [
                        { text: '右值' }, 
                        { text: '左值', correct: true }, 
                        { text: '取决于T' }, 
                        { text: '取决于实参' }
                    ], 
                    explanation: 'arg有名字，是左值。需要std::forward保持原有值类别。' 
                },
                { 
                    type: 'single', 
                    question: 'std::move(x)和std::forward<T>(x)的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'move总是返回右值，forward条件性返回', correct: true }, 
                        { text: 'move更快' }, 
                        { text: 'forward更安全' }
                    ], 
                    explanation: 'std::move无条件转换为右值，std::forward根据T条件性转换。' 
                }
            ]
        },
        {
            id: '20.6',
            title: '返回值优化与移动语义的协作',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 返回值优化与移动语义的协作

### 什么是返回值优化（RVO）？

返回值优化是编译器优化技术，避免不必要的拷贝。

\`\`\`cpp
std::string createString() {
    return std::string("hello");  // RVO：直接在调用处构造
}

std::string s = createString();  // 没有拷贝或移动
\`\`\`

### RVO的类型

#### 1. RVO（Return Value Optimization）

函数返回临时对象时的优化。

\`\`\`cpp
std::string createString() {
    return std::string("hello");  // RVO
}

// 编译器优化后等价于：
void createString(std::string* result) {
    new (result) std::string("hello");
}
\`\`\`

#### 2. NRVO（Named Return Value Optimization）

函数返回命名对象时的优化。

\`\`\`cpp
std::string createString() {
    std::string result = "hello";
    return result;  // NRVO
}

// 编译器优化后等价于：
void createString(std::string* result) {
    new (result) std::string("hello");
}
\`\`\`

### C++17的强制RVO

C++17强制要求RVO（对于prvalue）：

\`\`\`cpp
struct Widget {
    Widget() {}
    Widget(const Widget&) = delete;  // 禁止拷贝
    Widget(Widget&&) = delete;       // 禁止移动
};

Widget createWidget() {
    return Widget();  // C++17保证成功（强制RVO）
}

Widget w = createWidget();  // C++17：成功
                            // C++14：可能失败（如果RVO失败）
\`\`\`

### RVO与移动语义

#### 1. RVO优先于移动

\`\`\`cpp
std::string createString() {
    return std::string("hello");  // RVO，不调用移动构造
}

std::string s = createString();
\`\`\`

#### 2. RVO失败时使用移动

\`\`\`cpp
std::string createString(bool cond) {
    std::string s1 = "hello";
    std::string s2 = "world";
    
    if (cond) {
        return s1;  // NRVO可能失败，使用移动
    }
    return s2;      // NRVO可能失败，使用移动
}
\`\`\`

### 何时RVO失败

#### 1. 多个返回路径

\`\`\`cpp
std::string createString(bool cond) {
    std::string result;
    if (cond) {
        result = "hello";
    } else {
        result = "world";
    }
    return result;  // NRVO通常成功
}

// 但这种情况NRVO通常失败：
std::string createString(bool cond) {
    std::string s1 = "hello";
    std::string s2 = "world";
    return cond ? s1 : s2;  // NRVO失败，使用移动
}
\`\`\`

#### 2. 返回参数

\`\`\`cpp
std::string process(std::string s) {
    return s;  // NRVO失败，使用移动
}
\`\`\`

#### 3. 返回全局变量

\`\`\`cpp
std::string global = "hello";

std::string getGlobal() {
    return global;  // NRVO失败，使用拷贝
}
\`\`\`

### 不要对返回值使用std::move

#### 错误做法

\`\`\`cpp
std::string createString() {
    std::string result = "hello";
    return std::move(result);  // 错误！阻碍NRVO
}
\`\`\`

#### 正确做法

\`\`\`cpp
std::string createString() {
    std::string result = "hello";
    return result;  // NRVO或移动语义自动生效
}
\`\`\`

### 原因分析

\`\`\`cpp
std::string createString() {
    std::string result = "hello";
    return result;
    // result是左值，但C++11规定：
    // 如果函数返回局部变量，且该变量类型与返回类型相同，
    // 则首先尝试移动构造，然后尝试拷贝构造
}

std::string createString() {
    std::string result = "hello";
    return std::move(result);
    // std::move(result)是右值
    // 编译器无法应用NRVO
    // 只能使用移动构造（比NRVO多一次移动）
}
\`\`\`

### 返回值优化示例

\`\`\`cpp
#include <iostream>
#include <string>

class Tracker {
public:
    std::string name;
    
    Tracker(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    
    Tracker(const Tracker& other) : name(other.name + "_copy") {
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    Tracker(Tracker&& other) noexcept : name(std::move(other.name)) {
        std::cout << "移动构造: " << name << std::endl;
        other.name = "moved";
    }
    
    ~Tracker() {
        std::cout << "析构: " << name << std::endl;
    }
};

// RVO
Tracker createRVO() {
    return Tracker("RVO");
}

// NRVO
Tracker createNRVO() {
    Tracker result("NRVO");
    return result;
}

// NRVO可能失败
Tracker createNRVOFail(bool cond) {
    Tracker t1("NRVO1");
    Tracker t2("NRVO2");
    return cond ? t1 : t2;  // NRVO失败
}

// 错误：阻碍NRVO
Tracker createBad() {
    Tracker result("Bad");
    return std::move(result);  // 阻碍NRVO
}

int main() {
    std::cout << "=== RVO ===" << std::endl;
    {
        auto t = createRVO();
    }
    
    std::cout << "\\n=== NRVO ===" << std::endl;
    {
        auto t = createNRVO();
    }
    
    std::cout << "\\n=== NRVO失败 ===" << std::endl;
    {
        auto t = createNRVOFail(true);
    }
    
    std::cout << "\\n=== 阻碍NRVO ===" << std::endl;
    {
        auto t = createBad();
    }
    
    return 0;
}
\`\`\`

### 按值返回的规则

#### 1. 返回局部对象

\`\`\`cpp
std::string func() {
    std::string result = "hello";
    return result;  // NRVO或移动
}
\`\`\`

#### 2. 返回临时对象

\`\`\`cpp
std::string func() {
    return std::string("hello");  // RVO（C++17强制）
}
\`\`\`

#### 3. 返回参数

\`\`\`cpp
std::string func(std::string s) {
    return s;  // 移动
}
\`\`\`

#### 4. 返回成员

\`\`\`cpp
std::string MyClass::getName() const {
    return name;  // 拷贝
}
\`\`\`

### 性能对比

\`\`\`cpp
#include <iostream>
#include <string>
#include <chrono>

class BigData {
public:
    std::string data;
    BigData(size_t n) : data(n, 'x') {}
    BigData(const BigData& other) : data(other.data) {
        std::cout << "拷贝" << std::endl;
    }
    BigData(BigData&& other) noexcept : data(std::move(other.data)) {
        std::cout << "移动" << std::endl;
    }
};

BigData createNRVO() {
    BigData result(1000000);
    return result;
}

BigData createBad() {
    BigData result(1000000);
    return std::move(result);
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();
    auto d1 = createNRVO();
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "NRVO: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << " 微秒" << std::endl;
    
    start = std::chrono::high_resolution_clock::now();
    auto d2 = createBad();
    end = std::chrono::high_resolution_clock::now();
    std::cout << "Bad: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count()
              << " 微秒" << std::endl;
    
    return 0;
}
\`\`\``,
            examples: [
                {
                    title: 'RVO演示',
                    code: `#include <iostream>
#include <string>

class Tracker {
public:
    std::string name;
    
    Tracker(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    
    Tracker(const Tracker& other) : name(other.name + "_copy") {
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    Tracker(Tracker&& other) noexcept : name(std::move(other.name)) {
        std::cout << "移动构造: " << name << std::endl;
        other.name = "moved";
    }
    
    ~Tracker() {
        std::cout << "析构: " << name << std::endl;
    }
};

Tracker createRVO() {
    return Tracker("RVO");
}

Tracker createNRVO() {
    Tracker result("NRVO");
    return result;
}

Tracker createBad() {
    Tracker result("Bad");
    return std::move(result);
}

int main() {
    std::cout << "=== RVO（返回临时对象）===" << std::endl;
    {
        Tracker t = createRVO();
    }
    
    std::cout << "\\n=== NRVO（返回命名对象）===" << std::endl;
    {
        Tracker t = createNRVO();
    }
    
    std::cout << "\\n=== 阻碍NRVO（使用std::move）===" << std::endl;
    {
        Tracker t = createBad();
    }
    
    return 0;
}`,
                    description: '演示RVO和NRVO的效果。'
                },
                {
                    title: 'C++17强制RVO',
                    code: `#include <iostream>

class NonCopyable {
public:
    NonCopyable() {
        std::cout << "构造" << std::endl;
    }
    
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable(NonCopyable&&) = delete;
    
    ~NonCopyable() {
        std::cout << "析构" << std::endl;
    }
};

NonCopyable create() {
    return NonCopyable();  // C++17强制RVO
}

int main() {
    std::cout << "=== C++17强制RVO ===" << std::endl;
    std::cout << "即使删除了拷贝和移动构造函数，仍然可以返回" << std::endl;
    
    auto obj = create();  // C++17：成功
    
    std::cout << "\\n程序结束" << std::endl;
    return 0;
}`,
                    description: '展示C++17的强制RVO。'
                }
            ],
            handsOn: {
                title: '分析RVO行为',
                description: '分析以下函数的RVO行为，并修改代码以优化。',
                initialCode: `#include <iostream>
#include <string>

class Tracker {
public:
    std::string name;
    
    Tracker(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    
    Tracker(const Tracker& other) : name(other.name + "_copy") {
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    Tracker(Tracker&& other) noexcept : name(std::move(other.name)) {
        std::cout << "移动构造: " << name << std::endl;
        other.name = "moved";
    }
    
    ~Tracker() {
        std::cout << "析构: " << name << std::endl;
    }
};

// TODO: 分析这个函数的RVO行为
// 是否有RVO/NRVO？是否有拷贝或移动？
Tracker func1() {
    Tracker result("func1");
    return result;
}

// TODO: 分析这个函数的RVO行为
// 是否有RVO/NRVO？是否有拷贝或移动？
Tracker func2() {
    Tracker result("func2");
    return std::move(result);
}

// TODO: 分析这个函数的RVO行为
// 是否有RVO/NRVO？是否有拷贝或移动？
Tracker func3(bool cond) {
    Tracker t1("func3_1");
    Tracker t2("func3_2");
    if (cond) {
        return t1;
    }
    return t2;
}

// TODO: 分析这个函数的RVO行为
// 是否有RVO/NRVO？是否有拷贝或移动？
Tracker func4(Tracker t) {
    return t;
}

int main() {
    std::cout << "=== func1 ===" << std::endl;
    {
        Tracker t = func1();
    }
    
    std::cout << "\\n=== func2 ===" << std::endl;
    {
        Tracker t = func2();
    }
    
    std::cout << "\\n=== func3 ===" << std::endl;
    {
        Tracker t = func3(true);
    }
    
    std::cout << "\\n=== func4 ===" << std::endl;
    {
        Tracker t = func4(Tracker("arg"));
    }
    
    return 0;
}`,
                expectedOutput: `=== func1 ===
构造: func1
析构: func1

=== func2 ===
构造: func2
移动构造: func2
析构: moved
析构: func2

=== func3 ===
构造: func3_1
构造: func3_2
移动构造: func3_1
析构: func3_2
析构: moved
析构: func3_1

=== func4 ===
构造: arg
移动构造: arg
析构: moved
析构: arg`,
                solutionRegex: 'return result|return std::move|return t|return t1|return t2',
                hint: 'func1有NRVO，func2阻碍NRVO，func3 NRVO失败用移动，func4返回参数用移动',
                xp: 180
            },
            references: [
                { title: '返回值优化', book: 'Effective Modern C++', chapter: '条款25' },
                { title: 'RVO', book: 'C++ Primer 第五版', chapter: '第13章' }
            ],
            assistantTips: [
                'RVO避免返回值拷贝',
                'NRVO优化命名返回值',
                'C++17强制RVO',
                '不要对返回值使用std::move'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'RVO是什么？', 
                    options: [
                        { text: '运行时优化' }, 
                        { text: '返回值优化', correct: true }, 
                        { text: '资源验证优化' }, 
                        { text: '引用值优化' }
                    ], 
                    explanation: 'RVO是Return Value Optimization，返回值优化。' 
                },
                { 
                    type: 'single', 
                    question: 'NRVO是什么？', 
                    options: [
                        { text: '新的RVO' }, 
                        { text: '命名返回值优化', correct: true }, 
                        { text: '非返回值优化' }, 
                        { text: '嵌套RVO' }
                    ], 
                    explanation: 'NRVO是Named Return Value Optimization，命名返回值优化。' 
                },
                { 
                    type: 'single', 
                    question: '为什么不应该对返回值使用std::move？', 
                    options: [
                        { text: '会编译错误' }, 
                        { text: '阻碍NRVO', correct: true }, 
                        { text: '性能更差' }, 
                        { text: '语法不允许' }
                    ], 
                    explanation: 'std::move会阻碍NRVO，导致额外的移动操作。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17对RVO的要求是？', 
                    options: [
                        { text: '可选优化' }, 
                        { text: '强制RVO（对于prvalue）', correct: true }, 
                        { text: '不要求' }, 
                        { text: '只要求NRVO' }
                    ], 
                    explanation: 'C++17强制要求RVO对于prvalue（纯右值）。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况NRVO通常失败？', 
                    options: [
                        { text: '返回局部变量' }, 
                        { text: '返回多个不同变量之一', correct: true }, 
                        { text: '返回临时对象' }, 
                        { text: '返回常量' }
                    ], 
                    explanation: '当有多个返回路径返回不同变量时，NRVO通常失败。' 
                }
            ]
        },
        {
            id: '20.7',
            title: '资源管理的 RAII 惯用法',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 资源管理的 RAII 惯用法

### 什么是RAII？

RAII（Resource Acquisition Is Initialization）是C++的核心资源管理技术：
- **资源获取即初始化**：在构造函数中获取资源
- **资源释放即析构**：在析构函数中释放资源

\`\`\`cpp
class FileHandle {
private:
    FILE* file;
    
public:
    // 构造函数：获取资源
    FileHandle(const char* filename, const char* mode) {
        file = fopen(filename, mode);
        if (!file) throw std::runtime_error("Cannot open file");
    }
    
    // 析构函数：释放资源
    ~FileHandle() {
        if (file) fclose(file);
    }
    
    // 禁止拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};
\`\`\`

### RAII的优势

#### 1. 自动资源管理

\`\`\`cpp
void processFile() {
    FileHandle file("data.txt", "r");
    // 使用文件...
    // 函数结束时自动关闭文件，即使发生异常
}
\`\`\`

#### 2. 异常安全

\`\`\`cpp
void riskyOperation() {
    int* p = new int[1000];
    // 如果这里抛出异常，内存泄漏！
    delete[] p;
}

void safeOperation() {
    std::vector<int> v(1000);
    // 如果抛出异常，vector析构函数自动释放内存
}
\`\`\`

#### 3. 作用域绑定

\`\`\`cpp
{
    std::unique_ptr<int> p(new int(10));
    // 使用p...
}  // 自动释放
\`\`\`

### RAII的实现要点

#### 1. 获取资源在构造函数

\`\`\`cpp
class LockGuard {
private:
    std::mutex& mtx;
    
public:
    explicit LockGuard(std::mutex& m) : mtx(m) {
        mtx.lock();  // 获取资源
    }
};
\`\`\`

#### 2. 释放资源在析构函数

\`\`\`cpp
class LockGuard {
public:
    ~LockGuard() {
        mtx.unlock();  // 释放资源
    }
};
\`\`\`

#### 3. 禁止或正确实现拷贝

\`\`\`cpp
class Resource {
public:
    // 禁止拷贝
    Resource(const Resource&) = delete;
    Resource& operator=(const Resource&) = delete;
    
    // 允许移动
    Resource(Resource&& other) noexcept;
    Resource& operator=(Resource&& other) noexcept;
};
\`\`\`

### 标准库中的RAII

#### 1. 智能指针

\`\`\`cpp
#include <memory>

// unique_ptr：独占所有权
std::unique_ptr<int> p1(new int(10));

// shared_ptr：共享所有权
std::shared_ptr<int> p2 = std::make_shared<int>(20);

// weak_ptr：弱引用
std::weak_ptr<int> wp = p2;
\`\`\`

#### 2. 标准容器

\`\`\`cpp
#include <vector>
#include <string>

std::vector<int> vec(100);  // 自动管理内存
std::string str = "hello";  // 自动管理字符数组
\`\`\`

#### 3. 锁管理

\`\`\`cpp
#include <mutex>

std::mutex mtx;

void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);
    // 临界区代码
    // 函数结束时自动解锁
}

void betterFunction() {
    std::unique_lock<std::mutex> lock(mtx);
    // 可以手动解锁和重新加锁
    lock.unlock();
    // ...
    lock.lock();
}
\`\`\`

### 自定义RAII类

#### 文件句柄

\`\`\`cpp
#include <cstdio>
#include <stdexcept>

class File {
private:
    FILE* handle;
    
public:
    File(const char* filename, const char* mode) 
        : handle(std::fopen(filename, mode)) {
        if (!handle) {
            throw std::runtime_error("Cannot open file");
        }
    }
    
    ~File() {
        if (handle) {
            std::fclose(handle);
        }
    }
    
    // 禁止拷贝
    File(const File&) = delete;
    File& operator=(const File&) = delete;
    
    // 允许移动
    File(File&& other) noexcept : handle(other.handle) {
        other.handle = nullptr;
    }
    
    File& operator=(File&& other) noexcept {
        if (this != &other) {
            if (handle) std::fclose(handle);
            handle = other.handle;
            other.handle = nullptr;
        }
        return *this;
    }
    
    // 文件操作
    void write(const char* data) {
        std::fputs(data, handle);
    }
    
    int read() {
        return std::fgetc(handle);
    }
};
\`\`\`

#### 网络套接字

\`\`\`cpp
class Socket {
private:
    int sockfd;
    
public:
    Socket(int domain, int type, int protocol) {
        sockfd = socket(domain, type, protocol);
        if (sockfd < 0) {
            throw std::runtime_error("Cannot create socket");
        }
    }
    
    ~Socket() {
        if (sockfd >= 0) {
            close(sockfd);
        }
    }
    
    // 禁止拷贝
    Socket(const Socket&) = delete;
    Socket& operator=(const Socket&) = delete;
    
    // 允许移动
    Socket(Socket&& other) noexcept : sockfd(other.sockfd) {
        other.sockfd = -1;
    }
    
    void connect(const sockaddr* addr, socklen_t len) {
        if (::connect(sockfd, addr, len) < 0) {
            throw std::runtime_error("Connect failed");
        }
    }
    
    void send(const void* data, size_t len) {
        ::send(sockfd, data, len, 0);
    }
};
\`\`\`

### RAII与异常安全

#### 异常安全级别

1. **基本保证**：异常发生时，对象仍处于有效状态
2. **强保证**：异常发生时，操作回滚，状态不变
3. **不抛异常保证**：保证不抛出异常

\`\`\`cpp
class SafeContainer {
private:
    std::vector<int> data;
    
public:
    // 强异常安全保证
    void addElement(int value) {
        std::vector<int> temp = data;  // 拷贝
        temp.push_back(value);          // 修改拷贝
        data.swap(temp);                // 原子交换
    }
    
    // 不抛异常保证
    void clear() noexcept {
        data.clear();
    }
};
\`\`\`

### RAII的常见应用

#### 1. 数据库连接

\`\`\`cpp
class DatabaseConnection {
private:
    Connection* conn;
    
public:
    DatabaseConnection(const std::string& connectionString) {
        conn = connect(connectionString);
    }
    
    ~DatabaseConnection() {
        if (conn) disconnect(conn);
    }
    
    // 禁止拷贝，允许移动
};
\`\`\`

#### 2. 内存管理

\`\`\`cpp
class Buffer {
private:
    char* data;
    size_t size;
    
public:
    explicit Buffer(size_t s) : data(new char[s]), size(s) {}
    
    ~Buffer() {
        delete[] data;
    }
    
    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;
    
    Buffer(Buffer&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }
};
\`\`\`

#### 3. 计时器

\`\`\`cpp
class Timer {
private:
    std::chrono::time_point<std::chrono::high_resolution_clock> start;
    std::string name;
    
public:
    explicit Timer(const std::string& n) 
        : start(std::chrono::high_resolution_clock::now()), name(n) {}
    
    ~Timer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << name << ": " << duration.count() << "ms" << std::endl;
    }
};

void function() {
    Timer t("function");
    // 函数结束时自动打印耗时
}
\`\`\`

### RAII最佳实践

1. **优先使用标准库**：unique_ptr、shared_ptr、vector等
2. **一个类管理一个资源**：单一职责原则
3. **禁止拷贝或实现深拷贝**：避免资源重复释放
4. **提供移动语义**：支持资源转移
5. **考虑异常安全**：确保析构函数不抛异常`,
            examples: [
                {
                    title: 'RAII文件管理',
                    code: `#include <iostream>
#include <fstream>
#include <string>

// 自定义RAII文件类
class File {
private:
    std::FILE* handle;
    
public:
    File(const char* filename, const char* mode) 
        : handle(std::fopen(filename, mode)) {
        if (!handle) {
            throw std::runtime_error("Cannot open file");
        }
        std::cout << "文件打开: " << filename << std::endl;
    }
    
    ~File() {
        if (handle) {
            std::fclose(handle);
            std::cout << "文件关闭" << std::endl;
        }
    }
    
    File(const File&) = delete;
    File& operator=(const File&) = delete;
    
    File(File&& other) noexcept : handle(other.handle) {
        other.handle = nullptr;
    }
    
    void write(const std::string& data) {
        std::fputs(data.c_str(), handle);
    }
    
    std::string readLine() {
        char buffer[256];
        if (std::fgets(buffer, sizeof(buffer), handle)) {
            return buffer;
        }
        return "";
    }
};

void processFile() {
    File file("test.txt", "w");
    file.write("Hello, RAII!\\n");
    file.write("This is a test.\\n");
    // 函数结束时自动关闭文件
}

int main() {
    std::cout << "=== RAII文件管理 ===" << std::endl;
    
    try {
        processFile();
        std::cout << "\\n文件处理完成" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示RAII在文件管理中的应用。'
                },
                {
                    title: 'RAII锁管理',
                    code: `#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

class Counter {
private:
    int value;
    std::mutex mtx;
    
public:
    Counter() : value(0) {}
    
    void increment() {
        std::lock_guard<std::mutex> lock(mtx);  // RAII锁
        ++value;
    }
    
    int get() const {
        std::lock_guard<std::mutex> lock(mtx);
        return value;
    }
};

void worker(Counter& counter, int iterations) {
    for (int i = 0; i < iterations; ++i) {
        counter.increment();
    }
}

int main() {
    Counter counter;
    const int THREADS = 4;
    const int ITERATIONS = 10000;
    
    std::vector<std::thread> threads;
    
    std::cout << "启动 " << THREADS << " 个线程..." << std::endl;
    
    for (int i = 0; i < THREADS; ++i) {
        threads.emplace_back(worker, std::ref(counter), ITERATIONS);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "预期值: " << THREADS * ITERATIONS << std::endl;
    std::cout << "实际值: " << counter.get() << std::endl;
    
    return 0;
}`,
                    description: '展示RAII在锁管理中的应用。'
                }
            ],
            handsOn: {
                title: '实现RAII计时器',
                description: '实现一个RAII计时器类，自动测量代码块执行时间。',
                initialCode: `#include <iostream>
#include <chrono>
#include <string>
#include <thread>

class Timer {
private:
    // TODO: 添加成员变量
    // 1. 开始时间点
    // 2. 计时器名称
    
public:
    // TODO: 实现构造函数
    // 记录开始时间和名称
    explicit Timer(const std::string& name) {
        // 记录开始时间
        // 打印"开始计时: [name]"
    }
    
    // TODO: 实现析构函数
    // 计算并打印耗时
    ~Timer() {
        // 计算耗时
        // 打印"[name]: [duration]ms"
    }
    
    // 禁止拷贝
    Timer(const Timer&) = delete;
    Timer& operator=(const Timer&) = delete;
};

void simulateWork(int milliseconds) {
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}

int main() {
    std::cout << "=== RAII计时器测试 ===" << std::endl;
    
    {
        Timer t1("任务1");
        simulateWork(100);
        // t1析构时自动打印耗时
    }
    
    {
        Timer t2("任务2");
        simulateWork(200);
        // t2析构时自动打印耗时
    }
    
    std::cout << "\\n嵌套计时器测试:" << std::endl;
    {
        Timer outer("外层任务");
        simulateWork(50);
        
        {
            Timer inner("内层任务");
            simulateWork(100);
        }
        
        simulateWork(50);
    }
    
    return 0;
}`,
                expectedOutput: `=== RAII计时器测试 ===
开始计时: 任务1
任务1: 100ms
开始计时: 任务2
任务2: 200ms

嵌套计时器测试:
开始计时: 外层任务
开始计时: 内层任务
内层任务: 100ms
外层任务: 200ms`,
                solutionRegex: 'high_resolution_clock|now|duration_cast|milliseconds',
                hint: '使用std::chrono::high_resolution_clock记录时间，析构时计算差值',
                xp: 180
            },
            references: [
                { title: 'RAII', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '资源管理', book: 'Effective C++', chapter: '条款13-17' }
            ],
            assistantTips: [
                'RAII：资源获取即初始化',
                '析构函数负责释放资源',
                '禁止拷贝或实现深拷贝',
                '优先使用标准库的RAII类'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'RAII的全称是？', 
                    options: [
                        { text: 'Resource Allocation Is Initialization' }, 
                        { text: 'Resource Acquisition Is Initialization', correct: true }, 
                        { text: 'Resource Access Is Initialization' }, 
                        { text: 'Resource Assignment Is Initialization' }
                    ], 
                    explanation: 'RAII是Resource Acquisition Is Initialization，资源获取即初始化。' 
                },
                { 
                    type: 'single', 
                    question: 'RAII的核心思想是？', 
                    options: [
                        { text: '手动管理资源' }, 
                        { text: '将资源生命周期绑定到对象生命周期', correct: true }, 
                        { text: '避免使用资源' }, 
                        { text: '延迟释放资源' }
                    ], 
                    explanation: 'RAII将资源生命周期绑定到对象生命周期，构造获取，析构释放。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个不是RAII类？', 
                    options: [
                        { text: 'std::unique_ptr' }, 
                        { text: 'std::vector' }, 
                        { text: 'int*', correct: true }, 
                        { text: 'std::lock_guard' }
                    ], 
                    explanation: 'int*是原始指针，不自动管理资源，不是RAII类。' 
                },
                { 
                    type: 'single', 
                    question: 'RAII类通常如何处理拷贝？', 
                    options: [
                        { text: '允许拷贝' }, 
                        { text: '禁止拷贝或实现深拷贝', correct: true }, 
                        { text: '自动拷贝' }, 
                        { text: '忽略拷贝' }
                    ], 
                    explanation: 'RAII类通常禁止拷贝（避免重复释放）或实现深拷贝。' 
                },
                { 
                    type: 'single', 
                    question: 'RAII如何保证异常安全？', 
                    options: [
                        { text: '捕获所有异常' }, 
                        { text: '析构函数自动释放资源', correct: true }, 
                        { text: '禁止异常' }, 
                        { text: '忽略异常' }
                    ], 
                    explanation: '即使发生异常，栈展开时析构函数仍会被调用，自动释放资源。' 
                }
            ]
        },
        {
            id: '20.8',
            title: '范围锁与智能指针自定义删除器',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 范围锁与智能指针自定义删除器

### 范围锁（Scoped Lock）

范围锁是RAII在锁管理中的应用，确保锁在作用域结束时自动释放。

#### std::lock_guard

\`\`\`cpp
#include <mutex>

std::mutex mtx;

void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);
    // 临界区代码
    // 函数结束时自动解锁
}
\`\`\`

#### std::unique_lock

\`\`\`cpp
#include <mutex>

std::mutex mtx;

void flexibleFunction() {
    std::unique_lock<std::mutex> lock(mtx);
    // 临界区代码
    
    lock.unlock();  // 手动解锁
    // 非临界区代码
    
    lock.lock();    // 重新加锁
    // 临界区代码
}
\`\`\`

#### std::scoped_lock（C++17）

\`\`\`cpp
#include <mutex>

std::mutex mtx1, mtx2;

void safeMultipleLocks() {
    std::scoped_lock lock(mtx1, mtx2);  // 同时锁定多个互斥量
    // 临界区代码
    // 自动解锁，避免死锁
}
\`\`\`

### 死锁避免

#### 问题：死锁

\`\`\`cpp
std::mutex mtx1, mtx2;

void func1() {
    std::lock_guard<std::mutex> lock1(mtx1);
    // ... 其他线程此时锁定了mtx2
    std::lock_guard<std::mutex> lock2(mtx2);  // 死锁！
}

void func2() {
    std::lock_guard<std::mutex> lock2(mtx2);
    // ... 其他线程此时锁定了mtx1
    std::lock_guard<std::mutex> lock1(mtx1);  // 死锁！
}
\`\`\`

#### 解决方案1：std::lock

\`\`\`cpp
void safeFunction() {
    std::lock(mtx1, mtx2);  // 原子地锁定多个互斥量
    std::lock_guard<std::mutex> lock1(mtx1, std::adopt_lock);
    std::lock_guard<std::mutex> lock2(mtx2, std::adopt_lock);
    // 临界区代码
}
\`\`\`

#### 解决方案2：std::scoped_lock（C++17）

\`\`\`cpp
void safeFunction() {
    std::scoped_lock lock(mtx1, mtx2);  // 更简洁
    // 临界区代码
}
\`\`\`

### 智能指针自定义删除器

#### 默认删除器

\`\`\`cpp
std::unique_ptr<int> p1(new int(10));  // 默认使用delete
std::unique_ptr<int[]> p2(new int[10]);  // 使用delete[]
\`\`\`

#### 自定义删除器

\`\`\`cpp
// 函数指针作为删除器
void deleteInt(int* p) {
    std::cout << "自定义删除" << std::endl;
    delete p;
}

std::unique_ptr<int, void(*)(int*)> p(new int(10), deleteInt);

// Lambda作为删除器
auto deleter = [](int* p) {
    std::cout << "Lambda删除" << std::endl;
    delete p;
};

std::unique_ptr<int, decltype(deleter)> p2(new int(10), deleter);
\`\`\`

### 自定义删除器的应用

#### 1. 文件句柄

\`\`\`cpp
#include <cstdio>
#include <memory>

auto fileDeleter = [](FILE* f) {
    if (f) {
        std::cout << "关闭文件" << std::endl;
        std::fclose(f);
    }
};

using FilePtr = std::unique_ptr<FILE, decltype(fileDeleter)>;

FilePtr openFile(const char* filename, const char* mode) {
    FILE* f = std::fopen(filename, mode);
    if (!f) throw std::runtime_error("Cannot open file");
    return FilePtr(f, fileDeleter);
}

int main() {
    auto file = openFile("test.txt", "w");
    std::fputs("Hello", file.get());
    // 自动关闭文件
}
\`\`\`

#### 2. 动态数组

\`\`\`cpp
#include <memory>

// 自定义删除器
auto arrayDeleter = [](int* p) {
    std::cout << "删除数组" << std::endl;
    delete[] p;
};

std::unique_ptr<int, decltype(arrayDeleter)> arr(new int[10], arrayDeleter);
\`\`\`

#### 3. 共享内存

\`\`\`cpp
#include <memory>
#include <cstring>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/mman.h>
#endif

auto sharedMemDeleter = [](void* p) {
#ifdef _WIN32
    VirtualFree(p, 0, MEM_RELEASE);
#else
    munmap(p, 4096);
#endif
};

std::unique_ptr<void, decltype(sharedMemDeleter)> 
allocateSharedMemory() {
#ifdef _WIN32
    void* p = VirtualAlloc(nullptr, 4096, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
#else
    void* p = mmap(nullptr, 4096, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANONYMOUS, -1, 0);
#endif
    return std::unique_ptr<void, decltype(sharedMemDeleter)>(p, sharedMemDeleter);
}
\`\`\`

#### 4. C API资源

\`\`\`cpp
#include <memory>
#include <sqlite3.h>

auto sqliteDeleter = [](sqlite3* db) {
    if (db) {
        sqlite3_close(db);
        std::cout << "关闭数据库" << std::endl;
    }
};

using SQLitePtr = std::unique_ptr<sqlite3, decltype(sqliteDeleter)>;

SQLitePtr openDatabase(const char* filename) {
    sqlite3* db;
    if (sqlite3_open(filename, &db) != SQLITE_OK) {
        throw std::runtime_error("Cannot open database");
    }
    return SQLitePtr(db, sqliteDeleter);
}
\`\`\`

### shared_ptr与删除器

\`\`\`cpp
#include <memory>

auto deleter = [](int* p) {
    std::cout << "删除int" << std::endl;
    delete p;
};

// shared_ptr的删除器在构造时指定
std::shared_ptr<int> p(new int(10), deleter);

// 所有副本共享同一个删除器
auto p2 = p;
auto p3 = p;
// 当最后一个shared_ptr销毁时，调用删除器
\`\`\`

### unique_ptr与删除器的区别

| 特性 | unique_ptr | shared_ptr |
|------|-----------|------------|
| 删除器类型 | 模板参数 | 运行时指定 |
| 删除器存储 | 直接存储 | 控制块中存储 |
| 类型大小 | 可能更小 | 固定大小 |
| 性能 | 更好 | 稍差 |

\`\`\`cpp
// unique_ptr：删除器是类型的一部分
std::unique_ptr<int, void(*)(int*)> p1(new int(10), deleter);

// shared_ptr：删除器不是类型的一部分
std::shared_ptr<int> p2(new int(10), deleter);
std::shared_ptr<int> p3(new int(20), [](int* p) { delete p; });
// p2和p3是相同类型
\`\`\`

### 实际应用示例

#### 日志系统

\`\`\`cpp
#include <memory>
#include <fstream>

class Logger {
private:
    std::ofstream file;
    
public:
    Logger(const std::string& filename) : file(filename) {}
    
    void log(const std::string& message) {
        file << message << std::endl;
    }
    
    ~Logger() {
        file.close();
    }
};

// 使用unique_ptr管理Logger
auto loggerDeleter = [](Logger* p) {
    std::cout << "关闭日志系统" << std::endl;
    delete p;
};

std::unique_ptr<Logger, decltype(loggerDeleter)> 
createLogger(const std::string& filename) {
    return std::unique_ptr<Logger, decltype(loggerDeleter)>(
        new Logger(filename), loggerDeleter
    );
}
\`\`\`

### 最佳实践

1. **优先使用标准删除器**：delete和delete[]
2. **使用lambda简化删除器**：避免定义单独的函数
3. **使用类型别名**：简化复杂类型
4. **考虑异常安全**：确保删除器不抛异常

\`\`\`cpp
// 使用类型别名简化
template<typename T>
using UniquePtrWithDeleter = std::unique_ptr<T, void(*)(T*)>;

UniquePtrWithDeleter<int> p(new int(10), [](int* p) { delete p; });
\`\`\``,
            examples: [
                {
                    title: '范围锁示例',
                    code: `#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

class BankAccount {
private:
    double balance;
    std::mutex mtx;
    
public:
    BankAccount(double initial) : balance(initial) {}
    
    void deposit(double amount) {
        std::lock_guard<std::mutex> lock(mtx);
        balance += amount;
        std::cout << "存款: " << amount << ", 余额: " << balance << std::endl;
    }
    
    bool withdraw(double amount) {
        std::lock_guard<std::mutex> lock(mtx);
        if (balance >= amount) {
            balance -= amount;
            std::cout << "取款: " << amount << ", 余额: " << balance << std::endl;
            return true;
        }
        std::cout << "取款失败: 余额不足" << std::endl;
        return false;
    }
    
    double getBalance() {
        std::lock_guard<std::mutex> lock(mtx);
        return balance;
    }
};

void transfer(BankAccount& from, BankAccount& to, double amount) {
    // C++17: 使用scoped_lock避免死锁
    std::scoped_lock lock(from.mtx, to.mtx);
    
    if (from.balance >= amount) {
        from.balance -= amount;
        to.balance += amount;
        std::cout << "转账: " << amount << std::endl;
    }
}

int main() {
    BankAccount account1(1000);
    BankAccount account2(500);
    
    std::cout << "初始余额:" << std::endl;
    std::cout << "账户1: " << account1.getBalance() << std::endl;
    std::cout << "账户2: " << account2.getBalance() << std::endl;
    
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 3; ++i) {
        threads.emplace_back([&account1, &account2]() {
            account1.deposit(100);
            account2.withdraw(50);
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "\\n最终余额:" << std::endl;
    std::cout << "账户1: " << account1.getBalance() << std::endl;
    std::cout << "账户2: " << account2.getBalance() << std::endl;
    
    return 0;
}`,
                    description: '展示范围锁在银行账户管理中的应用。'
                },
                {
                    title: '自定义删除器示例',
                    code: `#include <iostream>
#include <memory>
#include <cstdio>

// 文件指针删除器
auto fileDeleter = [](FILE* f) {
    if (f) {
        std::cout << "关闭文件" << std::endl;
        std::fclose(f);
    }
};

using FilePtr = std::unique_ptr<FILE, decltype(fileDeleter)>;

FilePtr openFile(const char* filename, const char* mode) {
    FILE* f = std::fopen(filename, mode);
    if (!f) {
        throw std::runtime_error("Cannot open file");
    }
    return FilePtr(f, fileDeleter);
}

// 数组删除器
auto arrayDeleter = [](int* p) {
    std::cout << "删除数组" << std::endl;
    delete[] p;
};

int main() {
    std::cout << "=== 文件管理 ===" << std::endl;
    {
        auto file = openFile("test.txt", "w");
        std::fputs("Hello, Custom Deleter!", file.get());
        // 自动关闭文件
    }
    
    std::cout << "\\n=== 数组管理 ===" << std::endl;
    {
        std::unique_ptr<int, decltype(arrayDeleter)> arr(new int[5], arrayDeleter);
        for (int i = 0; i < 5; ++i) {
            arr[i] = i * 10;
        }
        for (int i = 0; i < 5; ++i) {
            std::cout << arr[i] << " ";
        }
        std::cout << std::endl;
        // 自动删除数组
    }
    
    std::cout << "\\n=== shared_ptr删除器 ===" << std::endl;
    {
        auto sharedDeleter = [](int* p) {
            std::cout << "shared_ptr删除" << std::endl;
            delete p;
        };
        
        std::shared_ptr<int> p1(new int(42), sharedDeleter);
        auto p2 = p1;  // 共享所有权
        std::cout << "值: " << *p1 << std::endl;
        // 当p1和p2都销毁时，调用删除器
    }
    
    return 0;
}`,
                    description: '展示自定义删除器的各种应用。'
                }
            ],
            handsOn: {
                title: '实现资源管理类',
                description: '使用智能指针和自定义删除器管理资源。',
                initialCode: `#include <iostream>
#include <memory>
#include <fstream>

// TODO: 实现文件管理器
// 使用unique_ptr和自定义删除器管理FILE*
class FileManager {
private:
    // TODO: 定义FilePtr类型
    // 使用unique_ptr<FILE, 删除器类型>
    
public:
    // TODO: 实现openFile函数
    // 打开文件并返回FilePtr
    static auto openFile(const char* filename, const char* mode) {
        // 1. 使用fopen打开文件
        // 2. 如果失败，抛出异常
        // 3. 返回FilePtr
    }
    
    // TODO: 实现write函数
    static void write(/* FilePtr& */ auto& file, const std::string& data) {
        // 使用fputs写入数据
    }
    
    // TODO: 实现read函数
    static std::string read(/* FilePtr& */ auto& file) {
        // 使用fgets读取一行
        char buffer[256];
        // ...
    }
};

// TODO: 实现动态数组管理器
// 使用unique_ptr和自定义删除器管理动态数组
class ArrayManager {
public:
    // TODO: 定义ArrayPtr类型
    
    // TODO: 实现createArray函数
    static auto createArray(size_t size) {
        // 1. 分配数组
        // 2. 返回ArrayPtr
    }
    
    // TODO: 实现fill函数
    static void fill(/* ArrayPtr& */ auto& arr, size_t size, int value) {
        // 填充数组
    }
    
    // TODO: 实现print函数
    static void print(/* ArrayPtr& */ auto& arr, size_t size) {
        // 打印数组元素
    }
};

int main() {
    std::cout << "=== 文件管理测试 ===" << std::endl;
    {
        auto file = FileManager::openFile("test.txt", "w");
        FileManager::write(file, "Hello, RAII!");
        std::cout << "文件写入成功" << std::endl;
        // 自动关闭文件
    }
    
    std::cout << "\\n=== 数组管理测试 ===" << std::endl;
    {
        const size_t SIZE = 5;
        auto arr = ArrayManager::createArray(SIZE);
        ArrayManager::fill(arr, SIZE, 42);
        ArrayManager::print(arr, SIZE);
        // 自动删除数组
    }
    
    return 0;
}`,
                expectedOutput: `=== 文件管理测试 ===
文件写入成功
关闭文件

=== 数组管理测试 ===
42 42 42 42 42 
删除数组`,
                solutionRegex: 'unique_ptr|fopen|fputs|new int|delete\\[\\]|fclose',
                hint: '使用lambda定义删除器，unique_ptr管理资源',
                xp: 200
            },
            references: [
                { title: '范围锁', book: 'C++ Concurrency in Action', chapter: '第3章' },
                { title: '智能指针', book: 'Effective Modern C++', chapter: '条款18-22' }
            ],
            assistantTips: [
                '范围锁确保锁自动释放',
                'std::scoped_lock可以同时锁定多个互斥量',
                '自定义删除器可以管理任意资源',
                '使用lambda简化删除器定义'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::lock_guard的作用是？', 
                    options: [
                        { text: '手动加锁解锁' }, 
                        { text: 'RAII方式管理锁', correct: true }, 
                        { text: '创建互斥量' }, 
                        { text: '避免死锁' }
                    ], 
                    explanation: 'std::lock_guard使用RAII方式管理锁，构造时加锁，析构时解锁。' 
                },
                { 
                    type: 'single', 
                    question: 'std::scoped_lock（C++17）的优势是？', 
                    options: [
                        { text: '更快的加锁' }, 
                        { text: '可以同时锁定多个互斥量，避免死锁', correct: true }, 
                        { text: '更小的内存占用' }, 
                        { text: '支持递归锁' }
                    ], 
                    explanation: 'std::scoped_lock可以原子地锁定多个互斥量，避免死锁。' 
                },
                { 
                    type: 'single', 
                    question: 'unique_ptr的自定义删除器是？', 
                    options: [
                        { text: '运行时指定' }, 
                        { text: '模板参数', correct: true }, 
                        { text: '构造函数参数' }, 
                        { text: '不支持的' }
                    ], 
                    explanation: 'unique_ptr的删除器是模板参数的一部分。' 
                },
                { 
                    type: 'single', 
                    question: 'shared_ptr的自定义删除器是？', 
                    options: [
                        { text: '模板参数' }, 
                        { text: '运行时指定', correct: true }, 
                        { text: '不支持的' }, 
                        { text: '编译时确定' }
                    ], 
                    explanation: 'shared_ptr的删除器在构造时指定，不是类型的一部分。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况适合使用自定义删除器？', 
                    options: [
                        { text: '管理new分配的内存' }, 
                        { text: '管理文件句柄', correct: true }, 
                        { text: '管理标准容器' }, 
                        { text: '管理局部变量' }
                    ], 
                    explanation: '文件句柄需要使用fclose而非delete释放，适合自定义删除器。' 
                }
            ]
        }
    ]
};

window.Unit20Data = Unit20Data;
