/**
 * 单元14：模板进阶
 */
const Unit14Data = {
    id: 14,
    title: '模板进阶',
    description: '深入理解模板机制，掌握类型推导、可变参数模板、完美转发和模板元编程',
    lessons: [
        {
            id: '14.1',
            title: '模板类型推导与 auto',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 模板类型推导与 auto

### 模板类型推导基础

当调用函数模板时，编译器会根据实参推导模板参数的类型。

\`\`\`cpp
template<typename T>
void func(T param);

int x = 10;
func(x);  // T推导为int，param的类型也是int
\`\`\`

### 三种类型推导情况

#### 情况1：ParamType是指针或引用（非万能引用）

\`\`\`cpp
template<typename T>
void func(T& param);  // param是引用

int x = 27;
const int cx = x;
const int& rx = x;

func(x);   // T为int，param类型为int&
func(cx);  // T为const int，param类型为const int&
func(rx);  // T为const int，param类型为const int&
\`\`\`

**规则**：如果expr是引用，忽略引用部分；然后根据ParamType推导T。

#### 情况2：ParamType是万能引用（转发引用）

\`\`\`cpp
template<typename T>
void func(T&& param);  // 万能引用

int x = 27;
const int cx = x;

func(x);   // x是左值，T推导为int&，param为int&
func(cx);  // cx是左值，T推导为const int&，param为const int&
func(27);  // 27是右值，T推导为int，param为int&&
\`\`\`

**规则**：左值推导为引用，右值推导为非引用。

#### 情况3：ParamType既非指针也非引用（值传递）

\`\`\`cpp
template<typename T>
void func(T param);  // 值传递

int x = 27;
const int cx = x;
const int& rx = x;

func(x);   // T和param都是int
func(cx);  // T和param都是int（const被忽略）
func(rx);  // T和param都是int（引用和const都被忽略）
\`\`\`

**规则**：忽略const、volatile和引用。

### 数组参数

\`\`\`cpp
template<typename T>
void func(T param);

const char name[] = "Hello";
func(name);  // T推导为const char*（数组退化为指针）

template<typename T, size_t N>
constexpr size_t arraySize(T (&)[N]) {
    return N;
}
// 数组引用可以保留数组大小
\`\`\`

### auto类型推导

auto的类型推导与模板类型推导基本相同，但有一个重要区别：

\`\`\`cpp
auto x = 27;        // 情况3：x是int
const auto cx = x;  // cx是const int

const auto& rx = x; // rx是const int&

// 重要区别：初始化列表
auto x1 = {1, 2, 3};  // x1是std::initializer_list<int>
// 模板推导不支持这种情况
\`\`\`

### auto与模板推导的对比

\`\`\`cpp
// auto推导
auto x = {1, 2, 3};  // OK: initializer_list<int>

// 模板推导
template<typename T>
void func(T param);
func({1, 2, 3});  // 错误！无法推导

// 特殊情况：声明为initializer_list
template<typename T>
void func2(std::initializer_list<T> param);
func2({1, 2, 3});  // OK: T推导为int
\`\`\`

### C++14中的auto返回类型

\`\`\`cpp
// C++14：自动推导返回类型
auto add(int a, int b) {
    return a + b;  // 返回类型推导为int
}

// C++14：lambda参数使用auto
auto lambda = [](auto x, auto y) {
    return x + y;
};
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <vector>
#include <memory>

// 使用auto简化代码
std::vector<int> numbers = {1, 2, 3, 4, 5};

// 传统写法
std::vector<int>::iterator it1 = numbers.begin();

// auto写法
auto it2 = numbers.begin();  // 更简洁

// 智能指针
auto ptr = std::make_unique<int>(42);  // unique_ptr<int>

// 范围for
for (auto& num : numbers) {
    num *= 2;  // 引用允许修改
}
\`\`\``,
            examples: [
                {
                    title: '模板类型推导示例',
                    code: `#include <iostream>
#include <type_traits>

// 辅助函数：打印类型信息
template<typename T>
void printType(T&& param) {
    std::cout << "T = ";
    
    if constexpr (std::is_lvalue_reference_v<T>) {
        std::cout << "lvalue reference to ";
    }
    
    using BaseType = std::remove_reference_t<T>;
    
    if constexpr (std::is_const_v<BaseType>) {
        std::cout << "const ";
    }
    
    std::cout << typeid(BaseType).name() << std::endl;
}

int main() {
    int x = 10;
    const int cx = 20;
    int& rx = x;
    
    std::cout << "=== 万能引用推导 ===" << std::endl;
    
    std::cout << "func(x): ";
    printType(x);  // 左值
    
    std::cout << "func(cx): ";
    printType(cx);  // const左值
    
    std::cout << "func(30): ";
    printType(30);  // 右值
    
    return 0;
}`,
                    description: '展示万能引用的类型推导规则。'
                },
                {
                    title: 'auto类型推导示例',
                    code: `#include <iostream>
#include <vector>
#include <memory>
#include <initializer_list>

int main() {
    // 基本类型推导
    auto a = 10;           // int
    auto b = 3.14;         // double
    auto c = 'A';          // char
    auto d = "Hello";      // const char*
    
    std::cout << "a = " << a << " (int)" << std::endl;
    std::cout << "b = " << b << " (double)" << std::endl;
    std::cout << "c = " << c << " (char)" << std::endl;
    std::cout << "d = " << d << " (const char*)" << std::endl;
    
    // const和引用
    int x = 100;
    const auto ca = x;     // const int
    auto& ref = x;         // int&
    const auto& cref = x;  // const int&
    
    std::cout << "\\nconst auto: " << ca << std::endl;
    std::cout << "auto&: " << ref << std::endl;
    std::cout << "const auto&: " << cref << std::endl;
    
    // 初始化列表
    auto list = {1, 2, 3, 4, 5};
    std::cout << "\\ninitializer_list size: " << list.size() << std::endl;
    
    // 智能指针
    auto ptr = std::make_unique<int>(42);
    std::cout << "unique_ptr value: " << *ptr << std::endl;
    
    // 容器迭代器
    std::vector<int> vec = {1, 2, 3};
    for (auto it = vec.begin(); it != vec.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    // 范围for
    for (const auto& val : vec) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示auto在各种场景下的类型推导。'
                }
            ],
            handsOn: {
                title: '理解类型推导',
                description: '编写代码验证不同情况下的模板类型推导规则。',
                initialCode: `#include <iostream>
#include <typeinfo>
#include <type_traits>

// 模板函数：打印推导的类型信息
template<typename T>
void analyze(T param) {
    // TODO: 打印param的类型信息
    // 使用typeid和std::is_*类型特征
    std::cout << "类型: " << typeid(param).name() << std::endl;
}

// 万能引用版本
template<typename T>
void analyzeUniversal(T&& param) {
    // TODO: 判断param是左值引用还是右值引用
    // 使用std::is_lvalue_reference和std::is_rvalue_reference
}

int main() {
    int x = 10;
    const int cx = 20;
    int& rx = x;
    
    std::cout << "=== 值传递 ===" << std::endl;
    // TODO: 调用analyze测试值传递
    
    std::cout << "\\n=== 引用传递 ===" << std::endl;
    // TODO: 修改analyze为引用传递版本并测试
    
    std::cout << "\\n=== 万能引用 ===" << std::endl;
    // TODO: 调用analyzeUniversal测试万能引用
    
    return 0;
}`,
                expectedOutput: `=== 值传递 ===
类型: int
类型: int
类型: int

=== 万能引用 ===
左值引用
const左值引用
右值引用`,
                solutionRegex: 'is_lvalue_reference|is_rvalue_reference|typeid|analyze',
                hint: '值传递会忽略const和引用，万能引用会保留这些特性',
                xp: 180
            },
            references: [
                { title: '模板类型推导', book: 'Effective Modern C++', chapter: '条款1' },
                { title: 'auto类型推导', book: 'Effective Modern C++', chapter: '条款2' }
            ],
            assistantTips: [
                '万能引用（T&&）会根据实参是左值还是右值进行不同推导',
                '值传递会忽略const、volatile和引用',
                'auto推导与模板推导几乎相同，但auto支持初始化列表',
                '优先使用auto简化代码，但要理解其推导规则'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'template<typename T> void f(T param); f(42)中T推导为？', 
                    options: [
                        { text: 'int&' }, 
                        { text: 'int', correct: true }, 
                        { text: 'const int' }, 
                        { text: 'int&&' }
                    ], 
                    explanation: '值传递时，T推导为int，忽略const等修饰符。' 
                },
                { 
                    type: 'single', 
                    question: 'template<typename T> void f(T&& param); int x=1; f(x)中T推导为？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int&&' }, 
                        { text: 'const int' }
                    ], 
                    explanation: '万能引用传入左值时，T推导为左值引用。' 
                },
                { 
                    type: 'single', 
                    question: 'auto x = {1, 2, 3}; x的类型是？', 
                    options: [
                        { text: 'std::vector<int>' }, 
                        { text: 'std::initializer_list<int>', correct: true }, 
                        { text: 'int[]' }, 
                        { text: 'std::array<int, 3>' }
                    ], 
                    explanation: 'auto使用初始化列表时推导为initializer_list。' 
                },
                { 
                    type: 'single', 
                    question: 'const auto& r = 42; r的类型是？', 
                    options: [
                        { text: 'int&' }, 
                        { text: 'const int&', correct: true }, 
                        { text: 'int' }, 
                        { text: 'const int' }
                    ], 
                    explanation: 'const auto&推导为const int&，临时对象会延长生命周期。' 
                },
                { 
                    type: 'single', 
                    question: '万能引用是什么？', 
                    options: [
                        { text: '任何T&&' }, 
                        { text: '类型推导上下文中的T&&', correct: true }, 
                        { text: '右值引用' }, 
                        { text: 'const T&&' }
                    ], 
                    explanation: '万能引用是模板参数T&&或auto&&，能接受左值和右值。' 
                }
            ]
        },
        {
            id: '14.2',
            title: 'decltype 与尾置返回类型',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## decltype 与尾置返回类型

### decltype基础

decltype用于获取表达式的类型，它返回表达式的精确类型。

\`\`\`cpp
int x = 10;
decltype(x) y = 20;  // y是int

const int& rx = x;
decltype(rx) ry = x;  // ry是const int&
\`\`\`

### decltype的推导规则

#### 规则1：标识符表达式

\`\`\`cpp
int x = 10;
decltype(x) a = x;    // int

const int cx = 20;
decltype(cx) b = cx;  // const int

int& rx = x;
decltype(rx) c = x;   // int&
\`\`\`

**规则**：decltype(e)返回e的声明类型。

#### 规则2：左值表达式（非标识符）

\`\`\`cpp
int x = 10;
decltype((x)) a = x;  // int&（注意双层括号）

int arr[5];
decltype(arr[0]) b = x;  // int&（下标返回左值）

struct S { int m; };
S s;
decltype(s.m) c = x;     // int
decltype((s.m)) d = x;   // int&
\`\`\`

**规则**：对于左值表达式，decltype返回引用类型。

#### 规则3：右值表达式

\`\`\`cpp
int x = 10;
decltype(x + 10) a = 20;  // int（x+10是右值）
decltype(x++) b = 30;     // int（x++返回右值）
decltype(++x) c = x;      // int&（++x返回左值）
\`\`\`

### decltype与auto的区别

\`\`\`cpp
int x = 10;
const int& rx = x;

auto a = rx;        // int（忽略const和引用）
decltype(rx) b = x; // const int&（保留const和引用）

auto& c = rx;       // const int&（auto&保留const）
decltype(auto) d = rx; // const int&（C++14）
\`\`\`

### 尾置返回类型

#### 基本语法

\`\`\`cpp
// 传统写法
int add(int a, int b);

// 尾置返回类型
auto add(int a, int b) -> int;
\`\`\`

#### 用于模板函数

当返回类型依赖于参数时，尾置返回类型非常有用：

\`\`\`cpp
template<typename T, typename U>
auto add(T t, U u) -> decltype(t + u) {
    return t + u;
}

// C++14简化写法
template<typename T, typename U>
auto add(T t, U u) {
    return t + u;  // 自动推导返回类型
}
\`\`\`

### decltype(auto)

C++14引入decltype(auto)，结合auto的便利性和decltype的精确性：

\`\`\`cpp
template<typename Container>
decltype(auto) getFirst(Container& c) {
    return c[0];  // 返回引用（如果c[0]返回引用）
}

// 对比
template<typename Container>
auto getFirst2(Container& c) {
    return c[0];  // 返回值（拷贝）
}
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <vector>
#include <string>

// 返回容器元素的引用
template<typename Container>
decltype(auto) getElement(Container& c, size_t index) {
    return c[index];
}

// 返回容器元素的拷贝
template<typename Container>
auto getElementCopy(Container& c, size_t index) {
    return c[index];
}

int main() {
    std::vector<int> vec = {1, 2, 3};
    
    // 返回引用，可以修改
    getElement(vec, 0) = 100;
    
    // 返回拷贝，不能修改
    int copy = getElementCopy(vec, 1);
}
\`\`\`

### 常见陷阱

\`\`\`cpp
decltype(auto) f1() {
    int x = 0;
    return x;  // OK: 返回int
}

decltype(auto) f2() {
    int x = 0;
    return (x);  // 危险！返回int&，引用局部变量
}
\`\`\``,
            examples: [
                {
                    title: 'decltype基本用法',
                    code: `#include <iostream>
#include <type_traits>

int main() {
    int x = 10;
    const int cx = 20;
    int& rx = x;
    int arr[5] = {1, 2, 3, 4, 5};
    
    // decltype基本用法
    decltype(x) a = 100;        // int
    decltype(cx) b = 200;       // const int
    decltype(rx) c = x;         // int&
    
    std::cout << "a = " << a << std::endl;
    std::cout << "b = " << b << std::endl;
    std::cout << "c = " << c << std::endl;
    
    // 表达式的decltype
    decltype(x + 1) d = 300;    // int（右值）
    decltype((x)) e = x;        // int&（左值表达式）
    decltype(arr[0]) f = x;     // int&（下标返回左值）
    
    e = 999;
    std::cout << "修改后 x = " << x << std::endl;
    
    // 类型检查
    std::cout << "\\n类型检查:" << std::endl;
    std::cout << "decltype(x) is int: " 
              << std::is_same_v<decltype(x), int> << std::endl;
    std::cout << "decltype((x)) is int&: " 
              << std::is_same_v<decltype((x)), int&> << std::endl;
    
    return 0;
}`,
                    description: '展示decltype的基本用法和推导规则。'
                },
                {
                    title: '尾置返回类型',
                    code: `#include <iostream>
#include <vector>
#include <string>

// 尾置返回类型：返回两个值的较大者
template<typename T, typename U>
auto max(T t, U u) -> decltype(t > u ? t : u) {
    return t > u ? t : u;
}

// C++14：自动推导返回类型
template<typename T, typename U>
auto add(T t, U u) {
    return t + u;
}

// decltype(auto)：保留引用
template<typename Container>
decltype(auto) getFirst(Container& c) {
    return c[0];
}

int main() {
    // 不同类型比较
    auto m1 = max(10, 20.5);
    std::cout << "max(10, 20.5) = " << m1 << std::endl;
    
    // 自动推导返回类型
    auto sum = add(10, 20.5);
    std::cout << "add(10, 20.5) = " << sum << std::endl;
    
    // 保留引用
    std::vector<int> vec = {100, 200, 300};
    getFirst(vec) = 999;  // 修改第一个元素
    std::cout << "vec[0] = " << vec[0] << std::endl;
    
    // 字符串拼接
    std::string s1 = "Hello";
    std::string s2 = "World";
    auto result = add(s1, s2);
    std::cout << "add(s1, s2) = " << result << std::endl;
    
    return 0;
}`,
                    description: '展示尾置返回类型和decltype(auto)的应用。'
                }
            ],
            handsOn: {
                title: '实现泛型访问器',
                description: '使用decltype(auto)实现一个能正确返回引用的容器访问函数。',
                initialCode: `#include <iostream>
#include <vector>
#include <map>
#include <string>

// TODO: 实现泛型访问函数
// 要求：对于vector返回元素引用，对于map返回mapped_type引用
template<typename Container>
decltype(auto) getValue(Container& c, size_t index) {
    // 返回容器的第index个元素
}

// TODO: 实现map的键值访问
template<typename Container>
decltype(auto) getMapped(Container& c, const typename Container::key_type& key) {
    // 返回map中key对应的值
}

int main() {
    // 测试vector
    std::vector<int> vec = {10, 20, 30};
    
    // 应该能修改
    getValue(vec, 0) = 100;
    std::cout << "vec[0] = " << vec[0] << std::endl;
    
    // 测试map
    std::map<std::string, int> scores;
    scores["Alice"] = 90;
    scores["Bob"] = 85;
    
    // 应该能修改
    getMapped(scores, "Alice") = 95;
    std::cout << "Alice score = " << scores["Alice"] << std::endl;
    
    return 0;
}`,
                expectedOutput: `vec[0] = 100
Alice score = 95`,
                solutionRegex: 'return c\\[|decltype\\(auto\\)',
                hint: '使用decltype(auto)保留返回类型的引用特性',
                xp: 180
            },
            references: [
                { title: 'decltype', book: 'Effective Modern C++', chapter: '条款3' },
                { title: '尾置返回类型', book: 'C++ Primer 第五版', chapter: '第16章' }
            ],
            assistantTips: [
                'decltype返回表达式的精确类型，包括const和引用',
                'decltype((x))返回引用，decltype(x)返回类型本身',
                '尾置返回类型用于返回类型依赖参数的情况',
                'decltype(auto)结合auto便利性和decltype精确性'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'decltype((x))对于int x返回什么？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int&&' }, 
                        { text: 'const int' }
                    ], 
                    explanation: '双层括号使表达式成为左值表达式，返回引用类型。' 
                },
                { 
                    type: 'single', 
                    question: 'decltype(auto)的作用是？', 
                    options: [
                        { text: '等同于auto' }, 
                        { text: '使用decltype规则推导auto', correct: true }, 
                        { text: '忽略const' }, 
                        { text: '忽略引用' }
                    ], 
                    explanation: 'decltype(auto)使用decltype的规则推导auto的类型。' 
                },
                { 
                    type: 'single', 
                    question: '尾置返回类型的语法是？', 
                    options: [
                        { text: 'auto func() -> Type', correct: true }, 
                        { text: 'Type func() -> auto' }, 
                        { text: 'auto func() : Type' }, 
                        { text: 'Type func() : auto' }
                    ], 
                    explanation: '尾置返回类型使用auto和->语法定义。' 
                },
                { 
                    type: 'single', 
                    question: 'auto f() { int x=0; return (x); }返回什么？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int&&' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '使用decltype(auto)时，return (x)返回int&，这是危险的。' 
                },
                { 
                    type: 'single', 
                    question: 'decltype(x + y)对于int x, y返回什么？', 
                    options: [
                        { text: 'int&' }, 
                        { text: 'int', correct: true }, 
                        { text: 'int&&' }, 
                        { text: 'const int' }
                    ], 
                    explanation: 'x + y是右值表达式，decltype返回非引用类型。' 
                }
            ]
        },
        {
            id: '14.3',
            title: '可变参数模板',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## 可变参数模板

### 什么是可变参数模板？

可变参数模板（Variadic Templates）允许模板接受任意数量的参数。

\`\`\`cpp
template<typename... Args>
void func(Args... args);

func();           // OK: 0个参数
func(1);          // OK: 1个参数
func(1, 2.0);     // OK: 2个参数
func(1, 2.0, "3"); // OK: 3个参数
\`\`\`

### 参数包

#### 模板参数包

\`\`\`cpp
template<typename... Types>  // Types是模板参数包
class Tuple;
\`\`\`

#### 函数参数包

\`\`\`cpp
template<typename... Args>
void func(Args... args) {  // args是函数参数包
    // ...
}
\`\`\`

### sizeof...运算符

\`\`\`cpp
template<typename... Args>
void printCount(Args... args) {
    std::cout << "参数数量: " << sizeof...(Args) << std::endl;
    std::cout << "参数数量: " << sizeof...(args) << std::endl;
}
\`\`\`

### 参数包展开

#### 递归展开

\`\`\`cpp
// 递归终止条件
void print() {}

// 递归模板
template<typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first << " ";
    print(rest...);  // 递归调用
}

print(1, 2.0, "three", '4');
// 输出: 1 2 three 4
\`\`\`

#### 使用初始化列表展开

\`\`\`cpp
template<typename... Args>
void print(Args... args) {
    // 使用初始化列表展开
    (void)std::initializer_list<int>{
        (std::cout << args << " ", 0)...
    };
}
\`\`\`

### 可变参数模板类

\`\`\`cpp
// 递归定义
template<typename... Types>
class Tuple;

// 空Tuple
template<>
class Tuple<> {};

// 递归特化
template<typename Head, typename... Tail>
class Tuple<Head, Tail...> : private Tuple<Tail...> {
public:
    Head value;
    
    Tuple(Head h, Tail... t) : Tuple<Tail...>(t...), value(h) {}
};
\`\`\`

### 实际应用：类型安全的printf

\`\`\`cpp
// 递归终止
void safePrintf(const char* format) {
    std::cout << format;
}

// 递归展开
template<typename T, typename... Args>
void safePrintf(const char* format, T value, Args... args) {
    while (*format) {
        if (*format == '%' && *(format + 1) != '%') {
            std::cout << value;
            safePrintf(format + 2, args...);
            return;
        }
        std::cout << *format++;
    }
}
\`\`\`

### 完美转发参数包

\`\`\`cpp
template<typename... Args>
void forwardToFunc(Args&&... args) {
    someFunction(std::forward<Args>(args)...);
}
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <iostream>
#include <string>

// 求和函数
template<typename T>
T sum(T t) {
    return t;
}

template<typename T, typename... Args>
T sum(T first, Args... rest) {
    return first + sum(rest...);
}

// 工厂函数
template<typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}
\`\`\``,
            examples: [
                {
                    title: '可变参数打印函数',
                    code: `#include <iostream>
#include <string>

// 递归终止
void print() {
    std::cout << std::endl;
}

// 递归打印
template<typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first;
    if (sizeof...(rest) > 0) {
        std::cout << ", ";
    }
    print(rest...);
}

// 带分隔符的打印
template<typename Separator>
void printWithSep(Separator) {}

template<typename Separator, typename T, typename... Args>
void printWithSep(Separator sep, T first, Args... rest) {
    std::cout << first;
    if (sizeof...(rest) > 0) {
        std::cout << sep;
    }
    printWithSep(sep, rest...);
}

int main() {
    std::cout << "基本打印:" << std::endl;
    print(1, 2.5, "hello", 'c');
    
    std::cout << "\\n带分隔符打印:" << std::endl;
    printWithSep(" | ", 1, 2, 3, 4, 5);
    std::cout << std::endl;
    
    std::cout << "\\n不同类型:" << std::endl;
    print("Name:", std::string("Alice"), "Age:", 25, "Score:", 95.5);
    
    return 0;
}`,
                    description: '展示可变参数模板的递归展开方式。'
                },
                {
                    title: '可变参数求和与最小值',
                    code: `#include <iostream>
#include <string>
#include <limits>

// 求和：递归终止
template<typename T>
T sum(T t) {
    return t;
}

// 求和：递归
template<typename T, typename... Args>
T sum(T first, Args... rest) {
    return first + sum(rest...);
}

// 最小值：递归终止
template<typename T>
T minValue(T t) {
    return t;
}

// 最小值：递归
template<typename T, typename... Args>
T minValue(T first, Args... rest) {
    T restMin = minValue(rest...);
    return first < restMin ? first : restMin;
}

// 计算参数数量
template<typename... Args>
size_t countArgs(Args... args) {
    return sizeof...(args);
}

// 平均值
template<typename... Args>
auto average(Args... args) {
    return sum(args...) / static_cast<double>(sizeof...(args));
}

int main() {
    std::cout << "求和:" << std::endl;
    std::cout << "sum(1,2,3,4,5) = " << sum(1, 2, 3, 4, 5) << std::endl;
    std::cout << "sum(1.5,2.5,3.5) = " << sum(1.5, 2.5, 3.5) << std::endl;
    
    std::cout << "\\n最小值:" << std::endl;
    std::cout << "minValue(5,3,8,1,9) = " << minValue(5, 3, 8, 1, 9) << std::endl;
    std::cout << "minValue(3.14,2.71,1.41) = " << minValue(3.14, 2.71, 1.41) << std::endl;
    
    std::cout << "\\n参数数量:" << std::endl;
    std::cout << "countArgs(1,2,3) = " << countArgs(1, 2, 3) << std::endl;
    
    std::cout << "\\n平均值:" << std::endl;
    std::cout << "average(1,2,3,4,5) = " << average(1, 2, 3, 4, 5) << std::endl;
    
    return 0;
}`,
                    description: '展示可变参数模板的实际应用。'
                }
            ],
            handsOn: {
                title: '实现可变参数函数',
                description: '实现一个可变参数的max函数，返回所有参数中的最大值。',
                initialCode: `#include <iostream>
#include <string>

// TODO: 实现递归终止版本的max
template<typename T>
T maxValue(T t) {
    // 返回单个值
}

// TODO: 实现递归版本的max
template<typename T, typename... Args>
T maxValue(T first, Args... rest) {
    // 比较first和rest中的最大值
}

// TODO: 实现可变参数的allOf函数
// 检查所有参数是否都满足条件（大于0）
template<typename T>
bool allPositive(T t) {
    // 检查单个值是否大于0
}

template<typename T, typename... Args>
bool allPositive(T first, Args... rest) {
    // 检查first和rest是否都大于0
}

int main() {
    // 测试maxValue
    std::cout << "maxValue(3, 1, 4, 1, 5, 9, 2, 6) = " 
              << maxValue(3, 1, 4, 1, 5, 9, 2, 6) << std::endl;
    
    std::cout << "maxValue(2.5, 3.7, 1.2) = " 
              << maxValue(2.5, 3.7, 1.2) << std::endl;
    
    // 测试allPositive
    std::cout << "\\nallPositive(1, 2, 3) = " 
              << allPositive(1, 2, 3) << std::endl;
    
    std::cout << "allPositive(1, -2, 3) = " 
              << allPositive(1, -2, 3) << std::endl;
    
    return 0;
}`,
                expectedOutput: `maxValue(3, 1, 4, 1, 5, 9, 2, 6) = 9
maxValue(2.5, 3.7, 1.2) = 3.7

allPositive(1, 2, 3) = 1
allPositive(1, -2, 3) = 0`,
                solutionRegex: 'return t|return first|maxValue\\(rest|t > 0|first > 0',
                hint: '递归终止返回单个值，递归版本比较第一个值和剩余值的最大值',
                xp: 200
            },
            references: [
                { title: '可变参数模板', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '参数包展开', book: 'Effective Modern C++', chapter: '条款27' }
            ],
            assistantTips: [
                'sizeof...可以获取参数包的大小',
                '参数包通过递归方式展开',
                '必须提供递归终止条件',
                'C++17折叠表达式提供了更简洁的展开方式'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'typename... Args中的...表示什么？', 
                    options: [
                        { text: '省略参数' }, 
                        { text: '参数包，可接受0个或多个参数', correct: true }, 
                        { text: '默认参数' }, 
                        { text: '可变参数函数' }
                    ], 
                    explanation: '...表示参数包，可以接受任意数量的参数。' 
                },
                { 
                    type: 'single', 
                    question: 'sizeof...(args)返回什么？', 
                    options: [
                        { text: '参数的字节数' }, 
                        { text: '参数包中参数的数量', correct: true }, 
                        { text: '参数类型数量' }, 
                        { text: '参数大小总和' }
                    ], 
                    explanation: 'sizeof...运算符返回参数包中参数的个数。' 
                },
                { 
                    type: 'single', 
                    question: '可变参数模板如何展开参数包？', 
                    options: [
                        { text: '使用for循环' }, 
                        { text: '使用递归', correct: true }, 
                        { text: '自动展开' }, 
                        { text: '使用迭代器' }
                    ], 
                    explanation: '参数包通常通过递归方式展开，需要提供终止条件。' 
                },
                { 
                    type: 'single', 
                    question: 'template<typename T, typename... Args>中Args可以匹配几个类型？', 
                    options: [
                        { text: '至少1个' }, 
                        { text: '0个或多个', correct: true }, 
                        { text: '恰好1个' }, 
                        { text: '最多10个' }
                    ], 
                    explanation: '参数包可以匹配0个或多个类型。' 
                },
                { 
                    type: 'single', 
                    question: '可变参数模板的递归终止条件通常是？', 
                    options: [
                        { text: 'return语句' }, 
                        { text: '无参数的函数重载', correct: true }, 
                        { text: 'break语句' }, 
                        { text: 'exit函数' }
                    ], 
                    explanation: '递归终止条件通常是无参数的重载版本。' 
                }
            ]
        },
        {
            id: '14.4',
            title: '折叠表达式（C++17）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 折叠表达式（C++17）

### 什么是折叠表达式？

C++17引入折叠表达式，简化可变参数模板的参数包展开。

\`\`\`cpp
// C++14方式：递归展开
template<typename T>
T sum14(T t) { return t; }

template<typename T, typename... Args>
T sum14(T first, Args... rest) {
    return first + sum14(rest...);
}

// C++17方式：折叠表达式
template<typename... Args>
auto sum17(Args... args) {
    return (args + ...);  // 一元右折叠
}
\`\`\`

### 四种折叠形式

#### 1. 一元右折叠：(pack op ...)

\`\`\`cpp
(args + ...)  // 展开为: arg1 + (arg2 + (arg3 + ...))
\`\`\`

#### 2. 一元左折叠：(... op pack)

\`\`\`cpp
(... + args)  // 展开为: ((arg1 + arg2) + arg3) + ...
\`\`\`

#### 3. 二元右折叠：(pack op ... op init)

\`\`\`cpp
(args + ... + 0)  // 展开为: arg1 + (arg2 + (... + (argN + 0)))
\`\`\`

#### 4. 二元左折叠：(init op ... op pack)

\`\`\`cpp
(0 + ... + args)  // 展开为: ((((0 + arg1) + arg2) + ...) + argN)
\`\`\`

### 支持的运算符

折叠表达式支持以下运算符：

\`\`\`cpp
+  -  *  /  %  ^  &  |  ~  =  <  >  <<  >>
+= -= *= /= %= ^= &= |= <<= >>= == != <= >= && || , .* ->*
\`\`\`

### 实际应用示例

#### 求和与求积

\`\`\`cpp
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);  // 一元右折叠
}

template<typename... Args>
auto product(Args... args) {
    return (args * ...);  // 一元右折叠
}

// 带初始值
template<typename... Args>
auto sumWithInit(Args... args) {
    return (args + ... + 0);  // 二元右折叠
}
\`\`\`

#### 逻辑运算

\`\`\`cpp
template<typename... Args>
bool allTrue(Args... args) {
    return (args && ...);  // 全部为真
}

template<typename... Args>
bool anyTrue(Args... args) {
    return (args || ...);  // 任一为真
}
\`\`\`

#### 打印所有参数

\`\`\`cpp
template<typename... Args>
void printAll(Args... args) {
    ((std::cout << args << " "), ...);  // 逗号折叠
    std::cout << std::endl;
}
\`\`\`

#### 调用多个函数

\`\`\`cpp
template<typename... Funcs>
void callAll(Funcs... funcs) {
    (funcs(), ...);  // 调用每个函数
}

// 使用示例
callAll(
    []{ std::cout << "A"; },
    []{ std::cout << "B"; },
    []{ std::cout << "C"; }
);
// 输出: ABC
\`\`\`

### 空参数包的处理

对于空参数包：

\`\`\`cpp
// 一元折叠空包
(... && args)  // 返回true
(... || args)  // 返回false
(... ,  args)  // 返回void()

// 其他运算符的一元折叠空包会编译错误
// 应使用二元折叠提供初始值
(args + ... + 0)  // 空包返回0
\`\`\`

### 折叠表达式与递归对比

\`\`\`cpp
// 递归版本
template<typename T>
void printRecursive(T t) { std::cout << t; }

template<typename T, typename... Args>
void printRecursive(T first, Args... rest) {
    std::cout << first << " ";
    printRecursive(rest...);
}

// 折叠表达式版本
template<typename... Args>
void printFold(Args... args) {
    ((std::cout << args << " "), ...);
}
\`\`\`

### 实际应用：容器操作

\`\`\`cpp
template<typename... Containers>
auto concat(Containers&&... containers) {
    std::string result;
    result.reserve((containers.size() + ...));
    (result += containers, ...);
    return result;
}

std::string s1 = "Hello";
std::string s2 = " ";
std::string s3 = "World";
auto combined = concat(s1, s2, s3);  // "Hello World"
\`\`\``,
            examples: [
                {
                    title: '折叠表达式基础',
                    code: `#include <iostream>
#include <string>

// 求和
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}

// 求积
template<typename... Args>
auto product(Args... args) {
    return (args * ...);
}

// 全部为真
template<typename... Args>
bool allTrue(Args... args) {
    return (args && ...);
}

// 任一为真
template<typename... Args>
bool anyTrue(Args... args) {
    return (args || ...);
}

// 打印所有参数
template<typename... Args>
void printAll(Args... args) {
    ((std::cout << args << " "), ...);
    std::cout << std::endl;
}

int main() {
    std::cout << "求和:" << std::endl;
    std::cout << "sum(1,2,3,4,5) = " << sum(1, 2, 3, 4, 5) << std::endl;
    
    std::cout << "\\n求积:" << std::endl;
    std::cout << "product(1,2,3,4,5) = " << product(1, 2, 3, 4, 5) << std::endl;
    
    std::cout << "\\n逻辑运算:" << std::endl;
    std::cout << "allTrue(true, true, true) = " << allTrue(true, true, true) << std::endl;
    std::cout << "allTrue(true, false, true) = " << allTrue(true, false, true) << std::endl;
    std::cout << "anyTrue(false, true, false) = " << anyTrue(false, true, false) << std::endl;
    
    std::cout << "\\n打印:" << std::endl;
    printAll(1, 2.5, "hello", 'c');
    
    return 0;
}`,
                    description: '展示折叠表达式的基本用法。'
                },
                {
                    title: '折叠表达式进阶应用',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

// 计算范围内的元素数量
template<typename... Args>
size_t countElements(Args... args) {
    return (sizeof...(args));
}

// 检查所有元素是否在范围内
template<typename T, typename... Args>
bool allInRange(T min, T max, Args... args) {
    return ((args >= min && args <= max) && ...);
}

// 找到最大值
template<typename T>
T maxVal(T t) { return t; }

template<typename... Args>
auto maxVal(Args... args) {
    // 使用折叠表达式找最大值
    auto result = args...;  // 需要特殊处理
    return result;
}

// 更好的方式：使用初始值
template<typename T, typename... Args>
T maxValue(T first, Args... rest) {
    T max = first;
    ((max = rest > max ? rest : max), ...);
    return max;
}

// 推入多个元素到容器
template<typename Container, typename... Args>
void pushBackAll(Container& c, Args... args) {
    (c.push_back(args), ...);
}

int main() {
    std::cout << "范围检查:" << std::endl;
    std::cout << "allInRange(1, 10, 2, 5, 8) = " 
              << allInRange(1, 10, 2, 5, 8) << std::endl;
    std::cout << "allInRange(1, 10, 2, 15, 8) = " 
              << allInRange(1, 10, 2, 15, 8) << std::endl;
    
    std::cout << "\\n最大值:" << std::endl;
    std::cout << "maxValue(3, 1, 4, 1, 5, 9, 2, 6) = " 
              << maxValue(3, 1, 4, 1, 5, 9, 2, 6) << std::endl;
    
    std::cout << "\\n推入容器:" << std::endl;
    std::vector<int> vec;
    pushBackAll(vec, 10, 20, 30, 40, 50);
    std::cout << "vec: ";
    for (int v : vec) std::cout << v << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示折叠表达式的实际应用场景。'
                }
            ],
            handsOn: {
                title: '使用折叠表达式',
                description: '使用折叠表达式实现字符串拼接和数值范围检查。',
                initialCode: `#include <iostream>
#include <string>
#include <sstream>

// TODO: 使用折叠表达式实现字符串拼接
template<typename... Args>
std::string concat(Args... args) {
    // 使用折叠表达式拼接所有参数
    // 提示：使用std::ostringstream
}

// TODO: 使用折叠表达式检查是否所有值都大于0
template<typename... Args>
bool allPositive(Args... args) {
    // 使用 && 折叠
}

// TODO: 使用折叠表达式计算平均值
template<typename... Args>
double average(Args... args) {
    // 先求和，再除以数量
}

int main() {
    // 测试字符串拼接
    std::cout << "concat: " << concat("Hello", " ", "World", "!") << std::endl;
    std::cout << "concat: " << concat(1, "+", 2, "=", 3) << std::endl;
    
    // 测试正数检查
    std::cout << "\\nallPositive(1, 2, 3): " << allPositive(1, 2, 3) << std::endl;
    std::cout << "allPositive(1, -2, 3): " << allPositive(1, -2, 3) << std::endl;
    
    // 测试平均值
    std::cout << "\\naverage(1, 2, 3, 4, 5): " << average(1, 2, 3, 4, 5) << std::endl;
    
    return 0;
}`,
                expectedOutput: `concat: Hello World!
concat: 1+2=3

allPositive(1, 2, 3): 1
allPositive(1, -2, 3): 0

average(1, 2, 3, 4, 5): 3`,
                solutionRegex: '\\(\\(.*<<.*\\), \\.\\.\\.\\)|\\(args && \\.\\.\\.\\)|\\(args \\+ \\.\\.\\.\\)',
                hint: '字符串拼接使用逗号折叠和ostringstream，正数检查使用&&折叠',
                xp: 180
            },
            references: [
                { title: '折叠表达式', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '折叠表达式', book: 'Effective Modern C++', chapter: '条款27' }
            ],
            assistantTips: [
                '折叠表达式简化了可变参数模板的编写',
                '一元折叠对空参数包有特殊规则',
                '二元折叠可以提供初始值处理空包',
                '逗号折叠可用于执行多个操作'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '(args + ...)是什么类型的折叠？', 
                    options: [
                        { text: '一元左折叠' }, 
                        { text: '一元右折叠', correct: true }, 
                        { text: '二元左折叠' }, 
                        { text: '二元右折叠' }
                    ], 
                    explanation: '一元右折叠形式为(pack op ...)。' 
                },
                { 
                    type: 'single', 
                    question: '(... && args)对空参数包返回什么？', 
                    options: [
                        { text: 'false' }, 
                        { text: 'true', correct: true }, 
                        { text: '编译错误' }, 
                        { text: 'void' }
                    ], 
                    explanation: '空参数包的&&折叠返回true，||折叠返回false。' 
                },
                { 
                    type: 'single', 
                    question: '((cout << args << " "), ...)使用的是什么折叠？', 
                    options: [
                        { text: '加法折叠' }, 
                        { text: '逗号折叠', correct: true }, 
                        { text: '逻辑折叠' }, 
                        { text: '位运算折叠' }
                    ], 
                    explanation: '使用逗号运算符的折叠表达式，依次执行每个表达式。' 
                },
                { 
                    type: 'single', 
                    question: '折叠表达式是哪个C++标准引入的？', 
                    options: [
                        { text: 'C++11' }, 
                        { text: 'C++14' }, 
                        { text: 'C++17', correct: true }, 
                        { text: 'C++20' }
                    ], 
                    explanation: '折叠表达式是C++17引入的新特性。' 
                },
                { 
                    type: 'single', 
                    question: '(args + ... + 0)是什么类型的折叠？', 
                    options: [
                        { text: '一元右折叠' }, 
                        { text: '一元左折叠' }, 
                        { text: '二元右折叠', correct: true }, 
                        { text: '二元左折叠' }
                    ], 
                    explanation: '二元右折叠形式为(pack op ... op init)。' 
                }
            ]
        },
        {
            id: '14.5',
            title: '转发引用与 std::forward',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 转发引用与 std::forward

### 什么是转发引用？

转发引用（Forwarding Reference）是模板参数中的T&&，它能接受左值和右值。

\`\`\`cpp
template<typename T>
void func(T&& arg);  // arg是转发引用

int x = 10;
func(x);   // 左值：T推导为int&，arg为int&
func(10);  // 右值：T推导为int，arg为int&&
\`\`\`

### 转发引用 vs 右值引用

\`\`\`cpp
// 转发引用（模板参数推导）
template<typename T>
void forwarding(T&& arg);  // 转发引用

// 右值引用（具体类型）
void rvalue(int&& arg);  // 右值引用

// 右值引用（非推导上下文）
template<typename T>
void notForwarding(typename std::remove_reference<T>::type&& arg);
\`\`\`

### 引用折叠规则

当创建引用的引用时，会触发引用折叠：

\`\`\`cpp
typedef int&  LRef;
typedef int&& RRef;

int n = 10;

LRef&  r1 = n;  // int&  &  -> int&
LRef&& r2 = n;  // int&  && -> int&
RRef&  r3 = n;  // int&& &  -> int&
RRef&& r4 = 10; // int&& && -> int&&
\`\`\`

**规则**：只有当两个都是右值引用时，结果才是右值引用，否则都是左值引用。

### std::forward的作用

std::forward用于保持参数的值类别（左值/右值）：

\`\`\`cpp
template<typename T>
void wrapper(T&& arg) {
    // arg本身是左值（有名字）
    actualFunc(std::forward<T>(arg));
}

int x = 10;
wrapper(x);   // 传递左值
wrapper(10);  // 传递右值
\`\`\`

### std::forward的工作原理

\`\`\`cpp
// 简化实现
template<typename T>
constexpr T&& forward(std::remove_reference_t<T>& arg) noexcept {
    return static_cast<T&&>(arg);
}

template<typename T>
constexpr T&& forward(std::remove_reference_t<T>&& arg) noexcept {
    static_assert(!std::is_lvalue_reference_v<T>);
    return static_cast<T&&>(arg);
}
\`\`\`

### 为什么需要std::forward？

\`\`\`cpp
class Widget {
public:
    Widget(const std::string& s) { std::cout << "拷贝构造\\n"; }
    Widget(std::string&& s) { std::cout << "移动构造\\n"; }
};

template<typename T>
void makeWidget(T&& arg) {
    // 不使用forward：arg总是左值
    Widget w1(arg);  // 总是调用拷贝构造
    
    // 使用forward：保持原有值类别
    Widget w2(std::forward<T>(arg));  // 正确选择构造函数
}

std::string s = "hello";
makeWidget(s);         // 拷贝构造
makeWidget(std::move(s));  // 移动构造
\`\`\`

### 完美转发的限制

完美转发在某些情况下会失败：

\`\`\`cpp
// 1. 大括号初始化列表
template<typename T>
void func(T&& arg);

func({1, 2, 3});  // 错误：无法推导

// 2. 0或NULL作为空指针
func(0);    // T推导为int，不是指针
func(NULL); // 同上

// 3. 重载函数名
int f(int);
double f(double);
func(f);  // 错误：无法确定哪个f
\`\`\`

### 实际应用

\`\`\`cpp
// 工厂函数
template<typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

// 包装函数
template<typename Func, typename... Args>
auto invoke(Func&& func, Args&&... args) 
    -> decltype(std::forward<Func>(func)(std::forward<Args>(args)...)) {
    return std::forward<Func>(func)(std::forward<Args>(args)...);
}
\`\`\``,
            examples: [
                {
                    title: '转发引用基础',
                    code: `#include <iostream>
#include <utility>
#include <string>
#include <type_traits>

// 打印参数类型的辅助函数
template<typename T>
void printValueType(T&& arg) {
    if constexpr (std::is_lvalue_reference_v<T>) {
        std::cout << "左值引用" << std::endl;
    } else {
        std::cout << "右值引用" << std::endl;
    }
}

// 没有转发的版本
template<typename T>
void processWithoutForward(T&& arg) {
    std::cout << "arg本身是左值（有名字）" << std::endl;
    printValueType(arg);  // 总是左值
}

// 使用转发的版本
template<typename T>
void processWithForward(T&& arg) {
    std::cout << "使用std::forward后: ";
    printValueType(std::forward<T>(arg));
}

int main() {
    int x = 10;
    const int cx = 20;
    
    std::cout << "=== 传入左值 ===" << std::endl;
    processWithForward(x);
    
    std::cout << "\\n=== 传入const左值 ===" << std::endl;
    processWithForward(cx);
    
    std::cout << "\\n=== 传入右值 ===" << std::endl;
    processWithForward(10);
    
    std::cout << "\\n=== 传入临时对象 ===" << std::endl;
    processWithForward(std::string("hello"));
    
    return 0;
}`,
                    description: '展示转发引用和std::forward的基本用法。'
                },
                {
                    title: '完美转发示例',
                    code: `#include <iostream>
#include <utility>
#include <string>
#include <memory>

class Message {
public:
    std::string content;
    
    Message(const std::string& s) : content(s) {
        std::cout << "构造（拷贝）: " << content << std::endl;
    }
    
    Message(std::string&& s) : content(std::move(s)) {
        std::cout << "构造（移动）: " << content << std::endl;
    }
    
    void show() const {
        std::cout << "内容: " << content << std::endl;
    }
};

// 不使用完美转发
template<typename T>
void createWithoutForward(T&& arg) {
    std::cout << "不使用forward: ";
    Message msg(arg);  // arg是左值，总是调用拷贝构造
}

// 使用完美转发
template<typename T>
void createWithForward(T&& arg) {
    std::cout << "使用forward: ";
    Message msg(std::forward<T>(arg));  // 保持值类别
}

int main() {
    std::string s1 = "Hello";
    std::string s2 = "World";
    
    std::cout << "=== 左值测试 ===" << std::endl;
    createWithoutForward(s1);
    createWithForward(s1);
    
    std::cout << "\\n=== 右值测试 ===" << std::endl;
    createWithoutForward(std::move(s2));
    createWithForward(std::move(s2));
    
    std::cout << "\\n=== 临时对象测试 ===" << std::endl;
    createWithForward(std::string("Temp"));
    
    return 0;
}`,
                    description: '展示完美转发如何保持参数的值类别。'
                }
            ],
            handsOn: {
                title: '实现完美转发包装器',
                description: '实现一个通用的函数包装器，正确转发所有参数。',
                initialCode: `#include <iostream>
#include <utility>
#include <string>
#include <vector>

class Data {
public:
    std::string name;
    std::vector<int> values;
    
    Data(const std::string& n, const std::vector<int>& v) 
        : name(n), values(v) {
        std::cout << "构造（拷贝）" << std::endl;
    }
    
    Data(std::string&& n, std::vector<int>&& v) 
        : name(std::move(n)), values(std::move(v)) {
        std::cout << "构造（移动）" << std::endl;
    }
    
    void print() const {
        std::cout << "Name: " << name << ", Values: ";
        for (int v : values) std::cout << v << " ";
        std::cout << std::endl;
    }
};

// TODO: 实现工厂函数createData
// 使用完美转发传递参数
template<typename... Args>
Data createData(Args&&... args) {
    // 返回用args构造的Data对象
}

// TODO: 实现函数调用包装器
template<typename Func, typename... Args>
auto call(Func&& func, Args&&... args) {
    // 调用func并转发所有参数
}

int main() {
    // 测试工厂函数
    std::string name = "Test";
    std::vector<int> vec = {1, 2, 3};
    
    std::cout << "=== 拷贝构造 ===" << std::endl;
    auto d1 = createData(name, vec);
    d1.print();
    
    std::cout << "\\n=== 移动构造 ===" << std::endl;
    auto d2 = createData(std::move(name), std::move(vec));
    d2.print();
    
    // 测试函数包装器
    std::cout << "\\n=== 函数包装器 ===" << std::endl;
    auto add = [](int a, int b) { return a + b; };
    std::cout << "add(3, 4) = " << call(add, 3, 4) << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 拷贝构造 ===
构造（拷贝）
Name: Test, Values: 1 2 3 

=== 移动构造 ===
构造（移动）
Name: Test, Values: 1 2 3 

=== 函数包装器 ===
add(3, 4) = 7`,
                solutionRegex: 'std::forward|return Data|return func',
                hint: '使用std::forward<Args>(args)...转发参数包',
                xp: 200
            },
            references: [
                { title: '转发引用', book: 'Effective Modern C++', chapter: '条款24' },
                { title: 'std::forward', book: 'C++ Primer 第五版', chapter: '第16章' }
            ],
            assistantTips: [
                '转发引用必须是模板参数T&&的形式',
                'std::forward保持参数的值类别',
                '有名字的变量本身是左值',
                '引用折叠规则决定最终类型'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'template<typename T> void f(T&&)中的T&&是？', 
                    options: [
                        { text: '右值引用' }, 
                        { text: '转发引用', correct: true }, 
                        { text: '左值引用' }, 
                        { text: 'const引用' }
                    ], 
                    explanation: '模板参数推导上下文中的T&&是转发引用。' 
                },
                { 
                    type: 'single', 
                    question: 'int x; func(x)对于template<typename T> void f(T&&)，T推导为？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int&&' }, 
                        { text: 'const int' }
                    ], 
                    explanation: '左值传入转发引用时，T推导为左值引用。' 
                },
                { 
                    type: 'single', 
                    question: 'std::forward的作用是？', 
                    options: [
                        { text: '将左值转为右值' }, 
                        { text: '保持参数的值类别', correct: true }, 
                        { text: '拷贝参数' }, 
                        { text: '删除参数' }
                    ], 
                    explanation: 'std::forward根据模板参数保持参数原有的值类别。' 
                },
                { 
                    type: 'single', 
                    question: '引用折叠：int& &&的结果是？', 
                    options: [
                        { text: 'int' }, 
                        { text: 'int&', correct: true }, 
                        { text: 'int&&' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '引用折叠规则：只有两个都是右值引用才得到右值引用。' 
                },
                { 
                    type: 'single', 
                    question: '有名字的右值引用变量本身是？', 
                    options: [
                        { text: '右值' }, 
                        { text: '左值', correct: true }, 
                        { text: '亡值' }, 
                        { text: '纯右值' }
                    ], 
                    explanation: '有名字的变量本身是左值，即使它绑定到右值。' 
                }
            ]
        },
        {
            id: '14.6',
            title: '完美转发',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 完美转发

### 什么是完美转发？

完美转发（Perfect Forwarding）是指函数模板能够将参数完美地转发给另一个函数，保持参数的值类别（左值/右值）和const属性。

\`\`\`cpp
template<typename T>
void wrapper(T&& arg) {
    actualFunc(std::forward<T>(arg));  // 完美转发
}
\`\`\`

### 完美转发的三个要素

1. **转发引用**：T&& 接受任意类型的参数
2. **std::forward**：保持参数的值类别
3. **引用折叠**：推导正确的类型

### 完整示例

\`\`\`cpp
#include <iostream>
#include <utility>
#include <string>

// 目标函数
void process(int& x) {
    std::cout << "左值引用: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "右值引用: " << x << std::endl;
}

void process(const int& x) {
    std::cout << "const左值引用: " << x << std::endl;
}

// 完美转发包装器
template<typename T>
void forwardToProcess(T&& arg) {
    process(std::forward<T>(arg));
}

int main() {
    int x = 10;
    const int cx = 20;
    
    forwardToProcess(x);    // 调用 process(int&)
    forwardToProcess(cx);   // 调用 process(const int&)
    forwardToProcess(30);   // 调用 process(int&&)
}
\`\`\`

### 可变参数的完美转发

\`\`\`cpp
template<typename... Args>
void variadicForward(Args&&... args) {
    targetFunction(std::forward<Args>(args)...);
}
\`\`\`

### 实际应用场景

#### 1. 工厂函数

\`\`\`cpp
template<typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

auto ptr = make<std::string>("Hello", 5);  // string("Hello", 5)
\`\`\`

#### 2. 包装器类

\`\`\`cpp
template<typename Func>
class Callback {
    Func func;
public:
    template<typename F>
    Callback(F&& f) : func(std::forward<F>(f)) {}
    
    template<typename... Args>
    auto operator()(Args&&... args) {
        return func(std::forward<Args>(args)...);
    }
};
\`\`\`

#### 3. 容器元素构造

\`\`\`cpp
template<typename T, typename... Args>
void emplaceBack(std::vector<T>& vec, Args&&... args) {
    vec.emplace_back(std::forward<Args>(args)...);
}
\`\`\`

### std::make_pair 和 std::make_tuple

这些标准库函数使用完美转发：

\`\`\`cpp
std::string s = "Hello";
auto p1 = std::make_pair(s, 10);           // 拷贝s
auto p2 = std::make_pair(std::move(s), 10); // 移动s
\`\`\`

### 完美转发的失败案例

#### 1. 大括号初始化列表

\`\`\`cpp
template<typename T>
void forwardToVector(T&& arg) {
    std::vector<int> v(std::forward<T>(arg));
}

forwardToVector({1, 2, 3});  // 错误！无法推导

// 解决方案
forwardToVector(std::vector<int>{1, 2, 3});  // OK
\`\`\`

#### 2. 静态数组

\`\`\`cpp
template<typename T>
void func(T&& arg);

const char name[] = "Hello";
func(name);  // T推导为const char (&)[6]
\`\`\`

### std::invoke 与完美转发

C++17的std::invoke结合完美转发：

\`\`\`cpp
template<typename Func, typename... Args>
decltype(auto) perfectInvoke(Func&& func, Args&&... args) {
    return std::invoke(std::forward<Func>(func), 
                       std::forward<Args>(args)...);
}
\`\`\`

### 性能考虑

完美转发避免了不必要的拷贝：

\`\`\`cpp
// 不使用完美转发
void process1(const std::string& s) {
    // 总是拷贝
    store(s);
}

// 使用完美转发
template<typename T>
void process2(T&& s) {
    // 可以移动
    store(std::forward<T>(s));
}

std::string str = "Hello";
process1(str);              // 拷贝
process2(str);              // 拷贝
process2(std::move(str));   // 移动
\`\`\``,
            examples: [
                {
                    title: '完美转发工厂',
                    code: `#include <iostream>
#include <utility>
#include <memory>
#include <string>

class Product {
public:
    std::string name;
    int id;
    double price;
    
    Product(const std::string& n, int i, double p) 
        : name(n), id(i), price(p) {
        std::cout << "构造（拷贝字符串）" << std::endl;
    }
    
    Product(std::string&& n, int i, double p) 
        : name(std::move(n)), id(i), price(p) {
        std::cout << "构造（移动字符串）" << std::endl;
    }
    
    void show() const {
        std::cout << "Product: " << name 
                  << " (ID: " << id 
                  << ", Price: " << price << ")" << std::endl;
    }
};

// 完美转发工厂函数
template<typename T, typename... Args>
std::unique_ptr<T> create(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

int main() {
    // 使用左值
    std::string name1 = "Widget";
    auto p1 = create<Product>(name1, 1001, 29.99);
    p1->show();
    
    // 使用右值
    auto p2 = create<Product>(std::string("Gadget"), 1002, 49.99);
    p2->show();
    
    // 使用移动
    std::string name2 = "Gizmo";
    auto p3 = create<Product>(std::move(name2), 1003, 19.99);
    p3->show();
    
    return 0;
}`,
                    description: '展示完美转发在工厂函数中的应用。'
                },
                {
                    title: '完美转发容器操作',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <utility>

class Item {
public:
    std::string name;
    int value;
    
    Item(const std::string& n, int v) : name(n), value(v) {
        std::cout << "Item拷贝构造: " << name << std::endl;
    }
    
    Item(std::string&& n, int v) : name(std::move(n)), value(v) {
        std::cout << "Item移动构造: " << name << std::endl;
    }
};

// 完美转发的emplace_back包装
template<typename Container, typename... Args>
void addItem(Container& c, Args&&... args) {
    c.emplace_back(std::forward<Args>(args)...);
}

int main() {
    std::vector<Item> items;
    
    std::cout << "=== 添加左值 ===" << std::endl;
    std::string name1 = "First";
    addItem(items, name1, 10);
    
    std::cout << "\\n=== 添加右值 ===" << std::endl;
    addItem(items, std::string("Second"), 20);
    
    std::cout << "\\n=== 添加移动 ===" << std::endl;
    std::string name2 = "Third";
    addItem(items, std::move(name2), 30);
    
    std::cout << "\\n=== 所有项目 ===" << std::endl;
    for (const auto& item : items) {
        std::cout << item.name << ": " << item.value << std::endl;
    }
    
    return 0;
}`,
                    description: '展示完美转发在容器操作中的应用。'
                }
            ],
            handsOn: {
                title: '实现通用函数包装器',
                description: '实现一个能完美转发参数的通用函数包装器。',
                initialCode: `#include <iostream>
#include <utility>
#include <functional>
#include <string>

// 目标函数
int add(int a, int b) {
    return a + b;
}

std::string concat(const std::string& a, const std::string& b) {
    return a + b;
}

// TODO: 实现通用函数包装器
template<typename Func>
class FunctionWrapper {
private:
    Func func;
    
public:
    // TODO: 构造函数，使用完美转发
    template<typename F>
    FunctionWrapper(F&& f) {
        // 完美转发存储函数
    }
    
    // TODO: 调用运算符，使用完美转发参数
    template<typename... Args>
    auto operator()(Args&&... args) {
        // 调用func并完美转发参数
    }
};

// TODO: 辅助函数创建包装器
template<typename Func>
auto makeWrapper(Func&& func) {
    // 返回包装器
}

int main() {
    // 测试整数加法
    auto addWrapper = makeWrapper(add);
    std::cout << "add(3, 4) = " << addWrapper(3, 4) << std::endl;
    
    // 测试字符串拼接
    auto concatWrapper = makeWrapper(concat);
    std::string s1 = "Hello";
    std::string s2 = "World";
    std::cout << "concat = " << concatWrapper(s1, s2) << std::endl;
    
    // 测试lambda
    auto lambdaWrapper = makeWrapper([](int x) { return x * x; });
    std::cout << "square(5) = " << lambdaWrapper(5) << std::endl;
    
    return 0;
}`,
                expectedOutput: `add(3, 4) = 7
concat = HelloWorld
square(5) = 25`,
                solutionRegex: 'std::forward|func\\(std::forward|FunctionWrapper\\(std::forward',
                hint: '构造函数和调用运算符都使用完美转发',
                xp: 200
            },
            references: [
                { title: '完美转发', book: 'Effective Modern C++', chapter: '条款25' },
                { title: '引用折叠', book: 'C++ Primer 第五版', chapter: '第16章' }
            ],
            assistantTips: [
                '完美转发保持参数的值类别和const属性',
                'std::forward<T>(arg)根据T的类型决定转发方式',
                '可变参数模板结合完美转发非常强大',
                '有名字的变量本身是左值，需要forward恢复值类别'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '完美转发的目的是？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '保持参数的值类别', correct: true }, 
                        { text: '减少代码量' }, 
                        { text: '支持多态' }
                    ], 
                    explanation: '完美转发保持参数原有的左值/右值属性。' 
                },
                { 
                    type: 'single', 
                    question: '完美转发需要哪三个要素？', 
                    options: [
                        { text: '指针、引用、移动' }, 
                        { text: '转发引用、std::forward、引用折叠', correct: true }, 
                        { text: '模板、继承、多态' }, 
                        { text: '构造、析构、拷贝' }
                    ], 
                    explanation: '完美转发需要转发引用、std::forward和引用折叠规则。' 
                },
                { 
                    type: 'single', 
                    question: 'std::make_unique使用什么技术？', 
                    options: [
                        { text: '深拷贝' }, 
                        { text: '完美转发', correct: true }, 
                        { text: '浅拷贝' }, 
                        { text: '引用计数' }
                    ], 
                    explanation: 'std::make_unique使用完美转发传递参数。' 
                },
                { 
                    type: 'single', 
                    question: '完美转发对大括号初始化列表会？', 
                    options: [
                        { text: '正常工作' }, 
                        { text: '编译错误', correct: true }, 
                        { text: '运行时错误' }, 
                        { text: '忽略' }
                    ], 
                    explanation: '大括号初始化列表无法被模板推导，导致编译错误。' 
                },
                { 
                    type: 'single', 
                    question: 'emplace_back相比push_back的优势是？', 
                    options: [
                        { text: '更简单' }, 
                        { text: '使用完美转发原地构造', correct: true }, 
                        { text: '更安全' }, 
                        { text: '支持更多类型' }
                    ], 
                    explanation: 'emplace_back使用完美转发在容器内直接构造对象。' 
                }
            ]
        },
        {
            id: '14.7',
            title: 'SFINAE 与 enable_if 简介',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## SFINAE 与 enable_if 简介

### 什么是SFINAE？

SFINAE（Substitution Failure Is Not An Error）是C++模板的重要特性：模板参数替换失败不是错误，编译器会尝试其他重载。

\`\`\`cpp
template<typename T>
typename T::value_type getFirst(const T& container) {
    return container[0];
}

// 对于int，没有value_type成员，但不是错误
// 编译器会寻找其他重载
int x = 10;
getFirst(x);  // 如果没有其他重载，编译错误
\`\`\`

### enable_if基础

std::enable_if根据条件启用或禁用模板：

\`\`\`cpp
#include <type_traits>

// 只有当T是整数类型时才启用
template<typename T>
typename std::enable_if<std::is_integral<T>::value, T>::type
onlyForIntegers(T value) {
    return value * 2;
}

onlyForIntegers(10);     // OK
onlyForIntegers(3.14);   // 编译错误
\`\`\`

### enable_if的用法

#### 1. 返回类型中使用

\`\`\`cpp
template<typename T>
typename std::enable_if<std::is_integral<T>::value, T>::type
func(T value) {
    return value;
}
\`\`\`

#### 2. 模板参数中使用

\`\`\`cpp
template<typename T, 
         typename = typename std::enable_if<std::is_integral<T>::value>::type>
T func(T value) {
    return value;
}
\`\`\`

#### 3. 函数参数中使用

\`\`\`cpp
template<typename T>
T func(T value, 
       typename std::enable_if<std::is_integral<T>::value>::type* = nullptr) {
    return value;
}
\`\`\`

### C++17简化：if constexpr

\`\`\`cpp
template<typename T>
auto process(T value) {
    if constexpr (std::is_integral_v<T>) {
        return value * 2;
    } else if constexpr (std::is_floating_point_v<T>) {
        return value * 2.0;
    } else {
        return value;
    }
}
\`\`\`

### 实际应用示例

#### 类型约束

\`\`\`cpp
// 只接受容器类型
template<typename Container>
typename std::enable_if<
    std::is_same_v<typename Container::value_type, int>,
    void
>::type
processInts(Container& c) {
    for (auto& elem : c) {
        elem *= 2;
    }
}
\`\`\`

#### 函数重载选择

\`\`\`cpp
// 整数版本
template<typename T>
typename std::enable_if<std::is_integral<T>::value, std::string>::type
toString(T value) {
    return "Integer: " + std::to_string(value);
}

// 浮点版本
template<typename T>
typename std::enable_if<std::is_floating_point<T>::value, std::string>::type
toString(T value) {
    return "Float: " + std::to_string(value);
}
\`\`\`

### 类型特征

常用的类型特征：

\`\`\`cpp
// 基本类型检查
std::is_integral<T>::value
std::is_floating_point<T>::value
std::is_pointer<T>::value
std::is_reference<T>::value
std::is_array<T>::value

// 类型关系
std::is_same<T, U>::value
std::is_base_of<Base, Derived>::value
std::is_convertible<From, To>::value

// 类型属性
std::is_const<T>::value
std::is_volatile<T>::value
std::is_trivial<T>::value

// 类型修改
std::remove_reference<T>::type
std::remove_const<T>::type
std::add_pointer<T>::type
\`\`\`

### void_t（C++17）

void_t用于检测类型是否有特定成员：

\`\`\`cpp
template<typename T, typename = void>
struct HasSize : std::false_type {};

template<typename T>
struct HasSize<T, std::void_t<decltype(std::declval<T>().size())>> 
    : std::true_type {};

// 使用
HasSize<std::vector<int>>::value;  // true
HasSize<int>::value;               // false
\`\`\`

### 检测成员函数

\`\`\`cpp
template<typename T, typename = void>
struct HasToString : std::false_type {};

template<typename T>
struct HasToString<T, std::void_t<decltype(std::declval<T>().toString())>> 
    : std::true_type {};

template<typename T>
auto convert(const T& obj) {
    if constexpr (HasToString<T>::value) {
        return obj.toString();
    } else {
        return std::to_string(obj);
    }
}
\`\`\``,
            examples: [
                {
                    title: 'enable_if基础用法',
                    code: `#include <iostream>
#include <type_traits>
#include <string>

// 只接受整数类型
template<typename T>
typename std::enable_if<std::is_integral<T>::value, T>::type
doubleValue(T value) {
    std::cout << "整数版本: ";
    return value * 2;
}

// 只接受浮点类型
template<typename T>
typename std::enable_if<std::is_floating_point<T>::value, T>::type
doubleValue(T value) {
    std::cout << "浮点版本: ";
    return value * 2.0;
}

// 只接受指针类型
template<typename T>
typename std::enable_if<std::is_pointer<T>::value, T>::type
doubleValue(T ptr) {
    std::cout << "指针版本: ";
    return ptr;
}

int main() {
    std::cout << doubleValue(10) << std::endl;
    std::cout << doubleValue(3.14) << std::endl;
    
    int x = 5;
    std::cout << doubleValue(&x) << std::endl;
    
    // doubleValue("hello");  // 编译错误：没有匹配的重载
    
    return 0;
}`,
                    description: '展示enable_if的基本用法。'
                },
                {
                    title: '检测类型成员',
                    code: `#include <iostream>
#include <type_traits>
#include <vector>
#include <string>

// 检测是否有size成员
template<typename T, typename = void>
struct HasSize : std::false_type {};

template<typename T>
struct HasSize<T, std::void_t<decltype(std::declval<T>().size())>> 
    : std::true_type {};

// 检测是否有push_back成员
template<typename T, typename = void>
struct HasPushBack : std::false_type {};

template<typename T>
struct HasPushBack<T, std::void_t<decltype(std::declval<T>().push_back(std::declval<typename T::value_type>()))>> 
    : std::true_type {};

// 根据类型特征选择处理方式
template<typename T>
void process(const T& obj) {
    if constexpr (HasSize<T>::value) {
        std::cout << "Size: " << obj.size() << std::endl;
    } else {
        std::cout << "No size member" << std::endl;
    }
    
    if constexpr (HasPushBack<T>::value) {
        std::cout << "Has push_back" << std::endl;
    } else {
        std::cout << "No push_back member" << std::endl;
    }
}

int main() {
    std::cout << "=== vector<int> ===" << std::endl;
    std::vector<int> vec = {1, 2, 3};
    process(vec);
    
    std::cout << "\\n=== string ===" << std::endl;
    std::string str = "Hello";
    process(str);
    
    std::cout << "\\n=== int ===" << std::endl;
    int x = 10;
    process(x);
    
    return 0;
}`,
                    description: '展示如何使用SFINAE检测类型的成员。'
                }
            ],
            handsOn: {
                title: '实现类型约束函数',
                description: '使用enable_if实现只接受特定类型的函数。',
                initialCode: `#include <iostream>
#include <type_traits>
#include <string>
#include <vector>

// TODO: 实现只接受算术类型（整数或浮点）的函数
template<typename T>
typename std::enable_if</* 条件 */, T>::type
square(T value) {
    // 返回value的平方
}

// TODO: 实现只接受容器类型的函数
// 提示：检查是否有begin和end成员
template<typename T, typename = void>
struct IsContainer : std::false_type {};

template<typename T>
struct IsContainer<T, std::void_t<
    decltype(std::declval<T>().begin()),
    decltype(std::declval<T>().end())
>> : std::true_type {};

template<typename Container>
typename std::enable_if<IsContainer<Container>::value, size_t>::type
getSize(const Container& c) {
    // 返回容器大小
}

// TODO: 实现只接受字符串类型的函数
template<typename T>
typename std::enable_if</* 条件 */, std::string>::type
getString(const T& value) {
    // 返回字符串表示
}

int main() {
    // 测试square
    std::cout << "square(5) = " << square(5) << std::endl;
    std::cout << "square(2.5) = " << square(2.5) << std::endl;
    // square("hello");  // 应该编译错误
    
    // 测试getSize
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "Size: " << getSize(vec) << std::endl;
    // getSize(10);  // 应该编译错误
    
    return 0;
}`,
                expectedOutput: `square(5) = 25
square(2.5) = 6.25
Size: 5`,
                solutionRegex: 'is_arithmetic|is_same.*string|return value \\* value|return c.size',
                hint: '使用std::is_arithmetic检查算术类型，使用自定义IsContainer检查容器',
                xp: 220
            },
            references: [
                { title: 'SFINAE', book: 'C++ Templates', chapter: '第8章' },
                { title: 'enable_if', book: 'Effective Modern C++', chapter: '条款27' }
            ],
            assistantTips: [
                'SFINAE让编译器在替换失败时尝试其他重载',
                'enable_if根据条件启用或禁用模板',
                'C++17的if constexpr提供了更简洁的方式',
                'void_t可以检测类型是否有特定成员'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'SFINAE是什么的缩写？', 
                    options: [
                        { text: 'Substitution Failure Is Not An Error', correct: true }, 
                        { text: 'Special Function In Not An Error' }, 
                        { text: 'Substitution Function Is Not An Error' }, 
                        { text: 'Special Failure Is Not An Error' }
                    ], 
                    explanation: 'SFINAE表示模板参数替换失败不是错误。' 
                },
                { 
                    type: 'single', 
                    question: 'std::enable_if<true, T>::type是什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: 'T', correct: true }, 
                        { text: 'bool' }, 
                        { text: '不存在' }
                    ], 
                    explanation: '当条件为true时，enable_if::type是T。' 
                },
                { 
                    type: 'single', 
                    question: 'std::enable_if<false, T>::type是什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: 'T' }, 
                        { text: '不存在（导致SFINAE）', correct: true }, 
                        { text: 'false' }
                    ], 
                    explanation: '当条件为false时，enable_if没有type成员，触发SFINAE。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17的if constexpr相比enable_if的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '语法更简洁', correct: true }, 
                        { text: '支持更多类型' }, 
                        { text: '编译更快' }
                    ], 
                    explanation: 'if constexpr提供了更直观的条件编译语法。' 
                },
                { 
                    type: 'single', 
                    question: 'void_t的作用是？', 
                    options: [
                        { text: '返回void' }, 
                        { text: '检测类型是否有特定成员', correct: true }, 
                        { text: '删除类型' }, 
                        { text: '添加void成员' }
                    ], 
                    explanation: 'void_t用于在SFINAE上下文中检测类型成员。' 
                }
            ]
        },
        {
            id: '14.8',
            title: '概念与 requires（C++20）简介',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 概念与 requires（C++20）简介

### 什么是概念？

概念（Concepts）是C++20引入的特性，用于命名和约束模板参数，使模板编程更清晰、错误信息更友好。

\`\`\`cpp
// C++20之前：使用enable_if
template<typename T, 
         typename = std::enable_if_t<std::is_integral_v<T>>>
T add(T a, T b) { return a + b; }

// C++20：使用概念
template<std::integral T>
T add(T a, T b) { return a + b; }
\`\`\`

### 标准库概念

C++20在<concepts>头文件中提供了丰富的概念：

\`\`\`cpp
#include <concepts>

// 类型类别概念
std::integral<T>        // 整数类型
std::floating_point<T>  // 浮点类型
std::same_as<T, U>      // 相同类型
std::derived_from<D, B> // 派生关系

// 比较概念
std::equality_comparable<T>  // 可比较相等
std::totally_ordered<T>      // 完全有序

// 对象概念
std::movable<T>    // 可移动
std::copyable<T>   // 可拷贝
std::regular<T>    // 正则类型

// 可调用概念
std::invocable<F, Args...>  // 可调用
std::predicate<F, Args...>  // 谓词
\`\`\`

### 定义概念

\`\`\`cpp
// 基本语法
template<typename T>
concept MyConcept = /* 要求 */;

// 示例：定义数值概念
template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

// 示例：定义加法概念
template<typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::same_as<T>;
};
\`\`\`

### requires表达式

requires表达式用于定义要求：

\`\`\`cpp
template<typename T>
concept Container = requires(T c) {
    typename T::value_type;  // 类型要求
    { c.begin() } -> std::same_as<typename T::iterator>;  // 表达式要求
    { c.end() } -> std::same_as<typename T::iterator>;
    { c.size() } -> std::convertible_to<size_t>;
    requires std::same_as<typename T::value_type, int>;  // 嵌套要求
};
\`\`\`

### requires子句

requires子句用于约束模板：

\`\`\`cpp
// 简单要求
template<typename T>
    requires std::integral<T>
T add(T a, T b) { return a + b; }

// 尾置requires
template<typename T>
T add(T a, T b) requires std::integral<T> { 
    return a + b; 
}

// 简写语法
template<std::integral T>
T add(T a, T b) { return a + b; }
\`\`\`

### 概念的使用方式

#### 1. 约束模板参数

\`\`\`cpp
// 方式1：typename后使用概念
template<std::integral T>
T func(T value);

// 方式2：requires子句
template<typename T>
    requires std::integral<T>
T func(T value);

// 方式3：尾置requires
template<typename T>
T func(T value) requires std::integral<T>;
\`\`\`

#### 2. 约束auto参数

\`\`\`cpp
// C++20：约束auto
void process(std::integral auto value) {
    // value必须是整数类型
}

process(10);     // OK
process(3.14);   // 编译错误
\`\`\`

#### 3. 约束返回类型

\`\`\`cpp
auto add(std::integral auto a, std::integral auto b) {
    return a + b;
}
\`\`\`

### 概念的组合

\`\`\`cpp
// 与运算
template<typename T>
concept SignedIntegral = std::integral<T> && std::is_signed_v<T>;

// 或运算
template<typename T>
concept Number = std::integral<T> || std::floating_point<T>;

// 复杂组合
template<typename T>
concept Serializable = 
    std::copyable<T> && 
    requires(T t, std::ostream& os) {
        { os << t } -> std::same_as<std::ostream&>;
    };
\`\`\`

### 子概念关系

\`\`\`cpp
template<typename T>
concept Integral = std::is_integral_v<T>;

template<typename T>
concept SignedIntegral = Integral<T> && std::is_signed_v<T>;

// SignedIntegral是Integral的子概念
// 更受约束的概念可以替代更宽松的概念
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <concepts>
#include <iostream>
#include <vector>

// 定义可打印概念
template<typename T>
concept Printable = requires(std::ostream& os, T value) {
    { os << value } -> std::same_as<std::ostream&>;
};

// 使用概念约束
template<Printable T>
void print(const T& value) {
    std::cout << value << std::endl;
}

// 定义容器概念
template<typename T>
concept Container = requires(T c) {
    typename T::value_type;
    { c.begin() } -> std::same_as<typename T::iterator>;
    { c.end() } -> std::same_as<typename T::iterator>;
    { c.size() } -> std::convertible_to<size_t>;
};

template<Container C>
void printAll(const C& container) {
    for (const auto& elem : container) {
        std::cout << elem << " ";
    }
    std::cout << std::endl;
}
\`\`\`

### 概念的优势

1. **更清晰的代码**：意图明确
2. **更好的错误信息**：编译器能给出具体的约束失败原因
3. **更好的性能**：编译期检查，无运行时开销
4. **更简单的重载**：基于概念重载比SFINAE更直观`,
            examples: [
                {
                    title: '概念基础用法',
                    code: `#include <iostream>
#include <concepts>
#include <string>

// 使用标准库概念
template<std::integral T>
T doubleValue(T value) {
    return value * 2;
}

template<std::floating_point T>
T doubleValue(T value) {
    return value * 2.0;
}

// 定义自己的概念
template<typename T>
concept Printable = requires(std::ostream& os, T value) {
    { os << value } -> std::same_as<std::ostream&>;
};

template<Printable T>
void print(const T& value) {
    std::cout << value << std::endl;
}

// 组合概念
template<typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template<Numeric T>
T add(T a, T b) {
    return a + b;
}

int main() {
    std::cout << "doubleValue(10) = " << doubleValue(10) << std::endl;
    std::cout << "doubleValue(3.14) = " << doubleValue(3.14) << std::endl;
    
    print(42);
    print(std::string("Hello"));
    print(3.14);
    
    std::cout << "add(5, 3) = " << add(5, 3) << std::endl;
    std::cout << "add(2.5, 1.5) = " << add(2.5, 1.5) << std::endl;
    
    return 0;
}`,
                    description: '展示C++20概念的基本用法。'
                },
                {
                    title: '定义复杂概念',
                    code: `#include <iostream>
#include <concepts>
#include <vector>
#include <string>
#include <type_traits>

// 定义迭代器概念
template<typename T>
concept Iterator = requires(T it) {
    { *it } -> std::same_as<typename std::iterator_traits<T>::value_type&>;
    { ++it } -> std::same_as<T&>;
    { it != it } -> std::convertible_to<bool>;
};

// 定义容器概念
template<typename T>
concept Container = requires(T c) {
    typename T::value_type;
    typename T::iterator;
    typename T::const_iterator;
    { c.begin() } -> std::same_as<typename T::iterator>;
    { c.end() } -> std::same_as<typename T::iterator>;
    { c.size() } -> std::convertible_to<size_t>;
};

// 定义可序列化概念
template<typename T>
concept Serializable = requires(std::ostream& os, T value) {
    { os << value } -> std::same_as<std::ostream&>;
};

// 使用容器概念
template<Container C>
size_t getSize(const C& container) {
    return container.size();
}

// 使用可序列化概念
template<Serializable T>
std::string toString(const T& value) {
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "Vector size: " << getSize(vec) << std::endl;
    
    std::string str = "Hello";
    std::cout << "String size: " << getSize(str) << std::endl;
    
    int num = 42;
    std::cout << "toString(42) = " << toString(num) << std::endl;
    
    return 0;
}`,
                    description: '展示如何定义和使用复杂概念。'
                }
            ],
            handsOn: {
                title: '实现自定义概念',
                description: '定义并使用自定义概念约束模板。',
                initialCode: `#include <iostream>
#include <concepts>
#include <string>
#include <vector>

// TODO: 定义Addable概念
// 要求类型T支持 + 运算符
template<typename T>
concept Addable = requires(T a, T b) {
    // 添加要求
};

// TODO: 定义Multipliable概念
// 要求类型T支持 * 运算符
template<typename T>
concept Multipliable = requires(T a, T b) {
    // 添加要求
};

// TODO: 定义Numeric概念
// 要求既是Addable又是Multipliable
template<typename T>
concept Numeric = /* 组合概念 */;

// TODO: 使用Numeric概念实现计算函数
template<Numeric T>
T calculate(T a, T b) {
    // 返回 (a + b) * 2
}

// TODO: 定义Container概念
// 要求有begin, end, size成员
template<typename T>
concept Container = requires(T c) {
    // 添加要求
};

// TODO: 使用Container概念实现打印函数
template<Container C>
void printContainer(const C& container) {
    // 打印容器中的所有元素
}

int main() {
    // 测试Numeric
    std::cout << "calculate(3, 4) = " << calculate(3, 4) << std::endl;
    std::cout << "calculate(2.5, 1.5) = " << calculate(2.5, 1.5) << std::endl;
    
    // 测试Container
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "Container: ";
    printContainer(vec);
    
    return 0;
}`,
                expectedOutput: `calculate(3, 4) = 14
calculate(2.5, 1.5) = 8
Container: 1 2 3 4 5`,
                solutionRegex: 'a \\+ b|a \\* b|c.begin\\(\\)|c.end\\(\\)|c.size\\(\\)',
                hint: '使用requires表达式定义概念要求，使用&&组合概念',
                xp: 200
            },
            references: [
                { title: '概念', book: 'C++20 - The Complete Guide', chapter: '概念' },
                { title: '约束', book: 'C++ Primer 第五版', chapter: '第16章' }
            ],
            assistantTips: [
                '概念让模板约束更清晰直观',
                'requires表达式用于定义要求',
                '标准库提供了丰富的预定义概念',
                '概念可以组合使用（&&、||）'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'C++20概念用于什么？', 
                    options: [
                        { text: '定义类' }, 
                        { text: '约束模板参数', correct: true }, 
                        { text: '定义函数' }, 
                        { text: '声明变量' }
                    ], 
                    explanation: '概念用于命名和约束模板参数。' 
                },
                { 
                    type: 'single', 
                    question: 'std::integral<T>检查什么？', 
                    options: [
                        { text: 'T是否是类' }, 
                        { text: 'T是否是整数类型', correct: true }, 
                        { text: 'T是否有成员' }, 
                        { text: 'T是否可拷贝' }
                    ], 
                    explanation: 'std::integral检查T是否是整数类型。' 
                },
                { 
                    type: 'single', 
                    question: 'requires表达式的作用是？', 
                    options: [
                        { text: '定义函数' }, 
                        { text: '定义模板要求', correct: true }, 
                        { text: '定义变量' }, 
                        { text: '定义类' }
                    ], 
                    explanation: 'requires表达式用于定义模板参数的要求。' 
                },
                { 
                    type: 'single', 
                    question: 'template<std::integral T>是什么语法？', 
                    options: [
                        { text: '类型参数' }, 
                        { text: '约束模板参数的简写语法', correct: true }, 
                        { text: '非类型参数' }, 
                        { text: '模板模板参数' }
                    ], 
                    explanation: '这是C++20约束模板参数的简写语法。' 
                },
                { 
                    type: 'single', 
                    question: '概念可以如何组合？', 
                    options: [
                        { text: '只能单独使用' }, 
                        { text: '使用&&和||组合', correct: true }, 
                        { text: '使用+和-组合' }, 
                        { text: '使用,组合' }
                    ], 
                    explanation: '概念可以使用&&和||进行逻辑组合。' 
                }
            ]
        },
        {
            id: '14.9',
            title: '模板元编程：编译期计算、类型操作',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 160,
            estimatedXp: 450,
            concepts: `## 模板元编程：编译期计算、类型操作

### 什么是模板元编程？

模板元编程（Template Metaprogramming, TMP）是利用模板在编译期进行计算和类型操作的技术。

\`\`\`cpp
// 编译期计算阶乘
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

int main() {
    std::cout << Factorial<5>::value;  // 120，编译期计算
}
\`\`\`

### 编译期计算

#### 传统方式：模板特化

\`\`\`cpp
// 编译期计算斐波那契数列
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N-1>::value + Fibonacci<N-2>::value;
};

template<>
struct Fibonacci<0> { static constexpr int value = 0; };

template<>
struct Fibonacci<1> { static constexpr int value = 1; };
\`\`\`

#### C++11：constexpr函数

\`\`\`cpp
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int f5 = factorial(5);  // 编译期计算
\`\`\`

#### C++17：if constexpr

\`\`\`cpp
template<int N>
constexpr int fibonacci() {
    if constexpr (N <= 1) {
        return N;
    } else {
        return fibonacci<N-1>() + fibonacci<N-2>();
    }
}
\`\`\`

### 类型操作

#### 类型选择

\`\`\`cpp
// std::conditional
using Type = std::conditional_t<true, int, double>;  // int

// 自定义实现
template<bool Cond, typename Then, typename Else>
struct Conditional {
    using type = Then;
};

template<typename Then, typename Else>
struct Conditional<false, Then, Else> {
    using type = Else;
};
\`\`\`

#### 类型列表

\`\`\`cpp
template<typename... Types>
struct TypeList {};

// 获取第N个类型
template<typename List, size_t N>
struct TypeAt;

template<typename Head, typename... Tail>
struct TypeAt<TypeList<Head, Tail...>, 0> {
    using type = Head;
};

template<typename Head, typename... Tail, size_t N>
struct TypeAt<TypeList<Head, Tail...>, N> {
    using type = typename TypeAt<TypeList<Tail...>, N-1>::type;
};
\`\`\`

#### 类型判断

\`\`\`cpp
// 判断是否是相同类型
template<typename T, typename U>
struct IsSame {
    static constexpr bool value = false;
};

template<typename T>
struct IsSame<T, T> {
    static constexpr bool value = true;
};
\`\`\`

### 编译期类型列表操作

\`\`\`cpp
// 类型列表长度
template<typename List>
struct Length;

template<typename... Types>
struct Length<TypeList<Types...>> {
    static constexpr size_t value = sizeof...(Types);
};

// 查找类型
template<typename List, typename T>
struct Contains;

template<typename T>
struct Contains<TypeList<>, T> {
    static constexpr bool value = false;
};

template<typename Head, typename... Tail, typename T>
struct Contains<TypeList<Head, Tail...>, T> {
    static constexpr bool value = 
        IsSame<Head, T>::value || Contains<TypeList<Tail...>, T>::value;
};
\`\`\`

### SFINAE与类型特征

\`\`\`cpp
// 移除引用
template<typename T>
struct RemoveReference {
    using type = T;
};

template<typename T>
struct RemoveReference<T&> {
    using type = T;
};

template<typename T>
struct RemoveReference<T&&> {
    using type = T;
};

// 添加指针
template<typename T>
struct AddPointer {
    using type = T*;
};
\`\`\`

### 编译期字符串处理

\`\`\`cpp
// 编译期字符串长度
constexpr size_t strLength(const char* str) {
    return *str ? 1 + strLength(str + 1) : 0;
}

constexpr size_t len = strLength("Hello");  // 5
\`\`\`

### 实际应用：编译期类型注册

\`\`\`cpp
template<typename T>
struct TypeInfo {
    static constexpr const char* name = "Unknown";
};

template<>
struct TypeInfo<int> {
    static constexpr const char* name = "int";
};

template<>
struct TypeInfo<double> {
    static constexpr const char* name = "double";
};

template<typename T>
const char* getTypeName() {
    return TypeInfo<T>::name;
}
\`\`\`

### 编译期循环展开

\`\`\`cpp
template<int N>
struct Unroll {
    template<typename F>
    static void apply(F f) {
        f(N);
        Unroll<N-1>::apply(f);
    }
};

template<>
struct Unroll<0> {
    template<typename F>
    static void apply(F) {}
};

// 使用
Unroll<5>::apply([](int i) { std::cout << i << " "; });
// 输出: 5 4 3 2 1
\`\`\`

### 变量模板（C++14）

\`\`\`cpp
template<typename T>
constexpr bool isIntegral_v = std::is_integral<T>::value;

// 使用
if constexpr (isIntegral_v<T>) { ... }
\`\`\`

### 编译期优化技巧

1. **使用constexpr替代模板特化**：更易读
2. **使用if constexpr替代SFINAE**：更直观
3. **使用折叠表达式**：简化可变参数处理
4. **使用概念**：更清晰的约束`,
            examples: [
                {
                    title: '编译期计算',
                    code: `#include <iostream>

// 编译期计算阶乘（模板方式）
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

// 编译期计算阶乘（constexpr方式）
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// 编译期计算斐波那契（模板方式）
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N-1>::value + Fibonacci<N-2>::value;
};

template<>
struct Fibonacci<0> { static constexpr int value = 0; };

template<>
struct Fibonacci<1> { static constexpr int value = 1; };

// 编译期计算幂
template<int Base, int Exp>
struct Power {
    static constexpr int value = Base * Power<Base, Exp - 1>::value;
};

template<int Base>
struct Power<Base, 0> {
    static constexpr int value = 1;
};

int main() {
    std::cout << "=== 阶乘 ===" << std::endl;
    std::cout << "Factorial<5> = " << Factorial<5>::value << std::endl;
    std::cout << "factorial(5) = " << factorial(5) << std::endl;
    
    std::cout << "\\n=== 斐波那契 ===" << std::endl;
    std::cout << "Fibonacci<10> = " << Fibonacci<10>::value << std::endl;
    
    std::cout << "\\n=== 幂运算 ===" << std::endl;
    std::cout << "Power<2, 10> = " << Power<2, 10>::value << std::endl;
    
    // 编译期验证
    static_assert(Factorial<5>::value == 120, "Factorial error");
    static_assert(Fibonacci<10>::value == 55, "Fibonacci error");
    static_assert(Power<2, 10>::value == 1024, "Power error");
    
    return 0;
}`,
                    description: '展示编译期计算的各种技术。'
                },
                {
                    title: '类型操作',
                    code: `#include <iostream>
#include <type_traits>

// 类型列表
template<typename... Types>
struct TypeList {};

// 获取类型列表长度
template<typename List>
struct Length;

template<typename... Types>
struct Length<TypeList<Types...>> {
    static constexpr size_t value = sizeof...(Types);
};

// 获取第N个类型
template<typename List, size_t N>
struct TypeAt;

template<typename Head, typename... Tail>
struct TypeAt<TypeList<Head, Tail...>, 0> {
    using type = Head;
};

template<typename Head, typename... Tail, size_t N>
struct TypeAt<TypeList<Head, Tail...>, N> {
    using type = typename TypeAt<TypeList<Tail...>, N-1>::type;
};

// 追加类型
template<typename List, typename T>
struct Append;

template<typename... Types, typename T>
struct Append<TypeList<Types...>, T> {
    using type = TypeList<Types..., T>;
};

// 判断类型是否在列表中
template<typename List, typename T>
struct Contains;

template<typename T>
struct Contains<TypeList<>, T> {
    static constexpr bool value = false;
};

template<typename Head, typename... Tail, typename T>
struct Contains<TypeList<Head, Tail...>, T> {
    static constexpr bool value = 
        std::is_same_v<Head, T> || Contains<TypeList<Tail...>, T>::value;
};

int main() {
    using MyList = TypeList<int, double, char>;
    
    std::cout << "=== 类型列表操作 ===" << std::endl;
    std::cout << "Length: " << Length<MyList>::value << std::endl;
    
    std::cout << "\\nType at index 0: " 
              << typeid(TypeAt<MyList, 0>::type).name() << std::endl;
    std::cout << "Type at index 1: " 
              << typeid(TypeAt<MyList, 1>::type).name() << std::endl;
    std::cout << "Type at index 2: " 
              << typeid(TypeAt<MyList, 2>::type).name() << std::endl;
    
    std::cout << "\\nContains<int>: " << Contains<MyList, int>::value << std::endl;
    std::cout << "Contains<float>: " << Contains<MyList, float>::value << std::endl;
    
    using ExtendedList = Append<MyList, float>::type;
    std::cout << "\\nExtended length: " << Length<ExtendedList>::value << std::endl;
    
    return 0;
}`,
                    description: '展示编译期类型操作技术。'
                }
            ],
            handsOn: {
                title: '实现编译期算法',
                description: '实现编译期的最大公约数计算和类型过滤。',
                initialCode: `#include <iostream>
#include <type_traits>

// TODO: 实现编译期最大公约数（GCD）
template<int A, int B>
struct GCD {
    // 使用欧几里得算法
    // GCD(A, B) = GCD(B, A % B)
    // 终止条件：B == 0
};

// TODO: GCD的特化版本（终止条件）
template<int A>
struct GCD<A, 0> {
    // 返回A
};

// TODO: 实现编译期最小公倍数（LCM）
template<int A, int B>
struct LCM {
    // LCM(A, B) = A * B / GCD(A, B)
};

// 类型列表
template<typename... Types>
struct TypeList {};

// TODO: 实现类型过滤
// 只保留满足条件的类型
template<typename List, template<typename> class Predicate>
struct Filter;

// 空列表
template<template<typename> class Predicate>
struct Filter<TypeList<>, Predicate> {
    using type = TypeList<>;
};

// 非空列表
template<typename Head, typename... Tail, template<typename> class Predicate>
struct Filter<TypeList<Head, Tail...>, Predicate> {
    // 如果Predicate<Head>::value为真，保留Head
    // 否则，不保留
};

// 辅助：判断是否是整数类型
template<typename T>
struct IsIntegral {
    static constexpr bool value = std::is_integral_v<T>;
};

int main() {
    // 测试GCD和LCM
    std::cout << "GCD(48, 18) = " << GCD<48, 18>::value << std::endl;
    std::cout << "GCD(100, 35) = " << GCD<100, 35>::value << std::endl;
    std::cout << "LCM(4, 6) = " << LCM<4, 6>::value << std::endl;
    
    // 测试类型过滤
    using MixedList = TypeList<int, double, char, float, long>;
    using IntsOnly = Filter<MixedList, IsIntegral>::type;
    
    // 验证
    static_assert(GCD<48, 18>::value == 6, "GCD error");
    static_assert(LCM<4, 6>::value == 12, "LCM error");
    
    return 0;
}`,
                expectedOutput: `GCD(48, 18) = 6
GCD(100, 35) = 5
LCM(4, 6) = 12`,
                solutionRegex: 'GCD<B, A % B>|GCD<A, 0>|A \\* B / GCD|Predicate<Head>::value',
                hint: 'GCD使用递归，LCM使用GCD结果，Filter使用条件类型选择',
                xp: 220
            },
            references: [
                { title: '模板元编程', book: 'C++ Templates', chapter: '第23章' },
                { title: '编译期计算', book: 'Effective Modern C++', chapter: '条款15' }
            ],
            assistantTips: [
                '模板元编程在编译期执行，无运行时开销',
                'constexpr函数比模板特化更易读',
                'if constexpr简化了编译期条件判断',
                '类型操作是模板元编程的核心应用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '模板元编程在什么时候执行？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译期', correct: true }, 
                        { text: '链接时' }, 
                        { text: '加载时' }
                    ], 
                    explanation: '模板元编程在编译期执行，无运行时开销。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr函数相比模板特化的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '更易读和维护', correct: true }, 
                        { text: '支持更多类型' }, 
                        { text: '编译更快' }
                    ], 
                    explanation: 'constexpr函数语法更简洁，更易读和维护。' 
                },
                { 
                    type: 'single', 
                    question: '模板特化用于什么？', 
                    options: [
                        { text: '创建对象' }, 
                        { text: '为特定类型提供特殊实现', correct: true }, 
                        { text: '删除模板' }, 
                        { text: '优化性能' }
                    ], 
                    explanation: '模板特化用于为特定类型或值提供特殊实现。' 
                },
                { 
                    type: 'single', 
                    question: 'if constexpr是哪个标准引入的？', 
                    options: [
                        { text: 'C++11' }, 
                        { text: 'C++14' }, 
                        { text: 'C++17', correct: true }, 
                        { text: 'C++20' }
                    ], 
                    explanation: 'if constexpr是C++17引入的编译期条件判断。' 
                },
                { 
                    type: 'single', 
                    question: '类型特征（type traits）用于什么？', 
                    options: [
                        { text: '运行时类型检查' }, 
                        { text: '编译期类型查询和修改', correct: true }, 
                        { text: '动态类型转换' }, 
                        { text: '内存管理' }
                    ], 
                    explanation: '类型特征用于在编译期查询和修改类型属性。' 
                }
            ]
        }
    ]
};

window.Unit14Data = Unit14Data;
