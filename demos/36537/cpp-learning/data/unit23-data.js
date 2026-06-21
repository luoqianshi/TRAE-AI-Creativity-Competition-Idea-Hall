/**
 * 单元23：类型系统与编译时计算
 */
const Unit23Data = {
    id: 23,
    title: '类型系统与编译时计算',
    description: '深入理解C++类型系统、类型萃取、编译时计算、constexpr编程以及现代C++的编译期特性',
    lessons: [
        {
            id: '23.1',
            title: '类型别名与 using',
            duration: '35分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 类型别名与 using

### 什么是类型别名？

类型别名是为已有类型定义一个新的名字，使代码更清晰、更易维护。

\`\`\`cpp
// 传统方式：typedef
typedef int Integer;
typedef std::vector<int> IntVector;
typedef void (*FunctionPtr)(int, double);

// 现代方式：using（C++11）
using Integer = int;
using IntVector = std::vector<int>;
using FunctionPtr = void(*)(int, double);
\`\`\`

### typedef vs using

#### 1. 基本类型别名

\`\`\`cpp
// typedef
typedef int Integer;
typedef double Real;

// using
using Integer = int;
using Real = double;

// 两者等价
Integer a = 10;
Real b = 3.14;
\`\`\`

#### 2. 指针类型

\`\`\`cpp
// typedef
typedef int* IntPtr;
typedef const int* ConstIntPtr;

// using
using IntPtr = int*;
using ConstIntPtr = const int*;

int x = 10;
IntPtr p = &x;
\`\`\`

#### 3. 函数指针

\`\`\`cpp
// typedef：语法复杂
typedef void (*Callback)(int);
typedef int (*Comparator)(const std::string&, const std::string&);

// using：语法清晰
using Callback = void(*)(int);
using Comparator = int(*)(const std::string&, const std::string&);

void myCallback(int x) { std::cout << x << std::endl; }
Callback cb = myCallback;
cb(42);
\`\`\`

#### 4. 模板别名

\`\`\`cpp
// typedef：不支持模板别名
// typedef std::vector<int> IntVector;  // 只能固定类型

// using：支持模板别名
template<typename T>
using Vector = std::vector<T>;

Vector<int> v1;        // std::vector<int>
Vector<std::string> v2; // std::vector<std::string>

// 更复杂的例子
template<typename T>
using Pair = std::pair<T, T>;

Pair<int> p1 = {1, 2};  // std::pair<int, int>
\`\`\`

### using 的优势

#### 1. 更清晰的语法

\`\`\`cpp
// typedef：新名字在前面
typedef void (*FuncType)(int, double, std::string);

// using：新名字在后面，更像赋值
using FuncType = void(*)(int, double, std::string);
\`\`\`

#### 2. 支持模板

\`\`\`cpp
// 使用typedef定义模板别名需要包装类
template<typename T>
struct VectorWrapper {
    typedef std::vector<T> Type;
};

VectorWrapper<int>::Type v1;  // 繁琐

// using直接支持
template<typename T>
using Vector = std::vector<T>;

Vector<int> v2;  // 简洁
\`\`\`

#### 3. 别名声明可以模板化

\`\`\`cpp
template<typename T>
using MyType = std::map<std::string, T>;

MyType<int> m1;        // std::map<std::string, int>
MyType<std::string> m2; // std::map<std::string, std::string>
\`\`\`

### 实际应用场景

#### 1. 简化复杂类型

\`\`\`cpp
#include <map>
#include <string>
#include <memory>

// 简化复杂模板类型
using StringMap = std::map<std::string, std::string>;
using StringPtr = std::shared_ptr<std::string>;
using IntVec = std::vector<int>;

StringMap config;
config["host"] = "localhost";
config["port"] = "8080";
\`\`\`

#### 2. 平台相关类型

\`\`\`cpp
// 跨平台类型定义
#ifdef _WIN32
    using SocketHandle = SOCKET;
    using ThreadId = DWORD;
#else
    using SocketHandle = int;
    using ThreadId = pthread_t;
#endif

SocketHandle sock;
ThreadId tid;
\`\`\`

#### 3. 函数对象类型

\`\`\`cpp
#include <functional>

// 定义函数对象类型
using IntUnaryOp = std::function<int(int)>;
using BinaryOp = std::function<int(int, int)>;

IntUnaryOp square = [](int x) { return x * x; };
BinaryOp add = [](int a, int b) { return a + b; };

std::cout << square(5) << std::endl;  // 25
std::cout << add(3, 4) << std::endl;  // 7
\`\`\`

#### 4. 智能指针别名

\`\`\`cpp
#include <memory>

template<typename T>
using Ptr = std::shared_ptr<T>;

template<typename T>
using UniquePtr = std::unique_ptr<T>;

Ptr<int> p1 = std::make_shared<int>(42);
UniquePtr<std::string> p2 = std::make_unique<std::string>("hello");
\`\`\`

### 类型别名的限制

#### 1. 不能定义新类型

\`\`\`cpp
using Integer = int;
Integer a = 10;
int b = a;  // 完全相同，不是新类型

// 不能用于函数重载
void func(int x);
void func(Integer x);  // 错误：重定义
\`\`\`

#### 2. 不能改变类型的属性

\`\`\`cpp
using ConstInt = const int;
ConstInt a = 10;
// a = 20;  // 错误：const

using IntPtr = int*;
const IntPtr p1 = nullptr;  // int* const p1，指针本身是const
const int* p2 = nullptr;    // 指向const int的指针
\`\`\`

### 最佳实践

#### 1. 优先使用 using

\`\`\`cpp
// 推荐
using String = std::string;
using StringVector = std::vector<std::string>;

// 不推荐（除非维护旧代码）
typedef std::string String;
\`\`\`

#### 2. 使用有意义的名字

\`\`\`cpp
// 好的命名
using EmployeeId = int;
using Salary = double;
using EmployeeMap = std::map<EmployeeId, std::string>;

// 不好的命名
using Id = int;  // 太泛
using Type1 = double;  // 无意义
\`\`\`

#### 3. 模板别名使用 using

\`\`\`cpp
// 推荐
template<typename T>
using Vector = std::vector<T>;

template<typename K, typename V>
using Map = std::map<K, V>;

// 使用
Vector<int> numbers;
Map<std::string, int> ages;
\`\`\``,
            examples: [
                {
                    title: '类型别名基础',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <memory>
#include <functional>

// 使用typedef定义类型别名
typedef int Integer;
typedef std::vector<int> IntVector;

// 使用using定义类型别名
using Real = double;
using StringVector = std::vector<std::string>;
using StringMap = std::map<std::string, std::string>;

// 函数指针别名
using Callback = void(*)(const std::string&);

// 模板别名
template<typename T>
using Ptr = std::shared_ptr<T>;

template<typename T>
using Vector = std::vector<T>;

void printMessage(const std::string& msg) {
    std::cout << "消息: " << msg << std::endl;
}

int main() {
    std::cout << "=== 基本类型别名 ===" << std::endl;
    Integer a = 10;
    Real b = 3.14;
    std::cout << "Integer: " << a << std::endl;
    std::cout << "Real: " << b << std::endl;
    
    std::cout << "\\n=== 容器类型别名 ===" << std::endl;
    IntVector v1 = {1, 2, 3, 4, 5};
    StringVector v2 = {"hello", "world"};
    
    for (const auto& i : v1) {
        std::cout << i << " ";
    }
    std::cout << std::endl;
    
    for (const auto& s : v2) {
        std::cout << s << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 函数指针别名 ===" << std::endl;
    Callback cb = printMessage;
    cb("使用类型别名");
    
    std::cout << "\\n=== 模板别名 ===" << std::endl;
    Vector<int> numbers = {1, 2, 3, 4, 5};
    for (const auto& n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 智能指针别名 ===" << std::endl;
    Ptr<std::string> p = std::make_shared<std::string>("智能指针");
    std::cout << *p << std::endl;
    
    return 0;
}`,
                    description: '展示类型别名的基本用法。'
                },
                {
                    title: '类型别名在实际项目中的应用',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <functional>
#include <memory>

// 定义业务相关类型别名
using UserId = uint64_t;
using UserName = std::string;
using Age = uint8_t;

// 用户信息
struct User {
    UserId id;
    UserName name;
    Age age;
};

// 容器类型别名
using UserList = std::vector<User>;
using UserMap = std::map<UserId, User>;

// 函数对象类型别名
using UserPredicate = std::function<bool(const User&)>;
using UserProcessor = std::function<void(const User&)>;

// 智能指针别名
using UserPtr = std::shared_ptr<User>;
using UserPtrList = std::vector<UserPtr>;

class UserManager {
private:
    UserMap users;
    
public:
    // 添加用户
    void addUser(const User& user) {
        users[user.id] = user;
    }
    
    // 查找用户
    UserPtr findUser(UserId id) const {
        auto it = users.find(id);
        if (it != users.end()) {
            return std::make_shared<User>(it->second);
        }
        return nullptr;
    }
    
    // 按条件查找
    UserList findUsers(UserPredicate pred) const {
        UserList result;
        for (const auto& pair : users) {
            if (pred(pair.second)) {
                result.push_back(pair.second);
            }
        }
        return result;
    }
    
    // 处理所有用户
    void processAll(UserProcessor proc) const {
        for (const auto& pair : users) {
            proc(pair.second);
        }
    }
    
    // 获取用户数量
    size_t count() const {
        return users.size();
    }
};

int main() {
    UserManager manager;
    
    std::cout << "=== 添加用户 ===" << std::endl;
    manager.addUser({1, "张三", 25});
    manager.addUser({2, "李四", 30});
    manager.addUser({3, "王五", 28});
    manager.addUser({4, "赵六", 35});
    
    std::cout << "用户总数: " << manager.count() << std::endl;
    
    std::cout << "\\n=== 查找用户 ===" << std::endl;
    auto user = manager.findUser(2);
    if (user) {
        std::cout << "找到用户: " << user->name << ", 年龄: " << (int)user->age << std::endl;
    }
    
    std::cout << "\\n=== 按条件查找（年龄>27）===" << std::endl;
    auto olderUsers = manager.findUsers([](const User& u) {
        return u.age > 27;
    });
    
    for (const auto& u : olderUsers) {
        std::cout << u.name << ": " << (int)u.age << "岁" << std::endl;
    }
    
    std::cout << "\\n=== 处理所有用户 ===" << std::endl;
    manager.processAll([](const User& u) {
        std::cout << "ID: " << u.id << ", 姓名: " << u.name << std::endl;
    });
    
    return 0;
}`,
                    description: '展示类型别名在实际项目中的应用。'
                }
            ],
            handsOn: {
                title: '定义类型别名',
                description: '为以下场景定义合适的类型别名。',
                initialCode: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <functional>

// TODO: 定义以下类型别名
// 1. Point - 表示二维点，使用std::pair<int, int>
// 2. PointList - 点的列表
// 3. PointMap - 点的映射，键为string，值为Point
// 4. PointOperation - 对点进行操作的函数对象

class PointProcessor {
private:
    // TODO: 使用上面定义的类型别名声明成员变量
    // points_ - 点列表
    // operations_ - 操作列表
    
public:
    // TODO: 实现addPoint函数
    // 添加一个点到列表
    void addPoint(const std::string& name, int x, int y) {
        // 创建点并添加到points_
        // 打印"添加点: [name] ([x], [y])"
    }
    
    // TODO: 实现addOperation函数
    // 添加一个操作
    void addOperation(/* 参数 */) {
        // 添加操作到operations_
    }
    
    // TODO: 实现processAll函数
    // 对所有点执行所有操作
    void processAll() {
        // 遍历所有点和所有操作
        // 打印"处理点: [name]"
    }
    
    // TODO: 实现count函数
    // 返回点的数量
    size_t count() const {
        return 0; // 返回实际数量
    }
};

int main() {
    PointProcessor processor;
    
    std::cout << "=== 添加点 ===" << std::endl;
    processor.addPoint("A", 10, 20);
    processor.addPoint("B", 30, 40);
    processor.addPoint("C", 50, 60);
    
    std::cout << "\\n点数量: " << processor.count() << std::endl;
    
    std::cout << "\\n=== 添加操作 ===" << std::endl;
    // TODO: 添加操作
    // 操作1: 打印点的坐标
    // 操作2: 计算点到原点的距离
    
    std::cout << "\\n=== 处理所有点 ===" << std::endl;
    processor.processAll();
    
    return 0;
}`,
                expectedOutput: `=== 添加点 ===
添加点: A (10, 20)
添加点: B (30, 40)
添加点: C (50, 60)

点数量: 3

=== 添加操作 ===
添加操作: 打印坐标
添加操作: 计算距离

=== 处理所有点 ===
处理点: A
处理点: B
处理点: C`,
                solutionRegex: 'using|typedef|Point|PointList|PointMap|PointOperation',
                hint: '使用using定义类型别名，模板别名可以简化容器类型',
                xp: 150
            },
            references: [
                { title: '类型别名', book: 'C++ Primer 第五版', chapter: '第2章' },
                { title: 'using与typedef', book: 'Effective Modern C++', chapter: '条款9' }
            ],
            assistantTips: [
                'using比typedef语法更清晰',
                'using支持模板别名',
                '类型别名不创建新类型',
                '使用有意义的名字提高可读性'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '以下哪种方式定义类型别名更推荐？', 
                    options: [
                        { text: 'typedef int Integer;' }, 
                        { text: 'using Integer = int;', correct: true }, 
                        { text: '#define Integer int' }, 
                        { text: 'int Integer;' }
                    ], 
                    explanation: 'using语法更清晰，且支持模板别名。' 
                },
                { 
                    type: 'single', 
                    question: 'using定义的类型别名会创建新类型吗？', 
                    options: [
                        { text: '会' }, 
                        { text: '不会', correct: true }, 
                        { text: '取决于类型' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '类型别名只是已有类型的同义词，不创建新类型。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个可以定义模板别名？', 
                    options: [
                        { text: 'typedef' }, 
                        { text: 'using', correct: true }, 
                        { text: '两者都可以' }, 
                        { text: '两者都不可以' }
                    ], 
                    explanation: '只有using支持模板别名，typedef不支持。' 
                },
                { 
                    type: 'single', 
                    question: 'using Func = void(*)(int); 定义的是什么？', 
                    options: [
                        { text: '函数' }, 
                        { text: '函数指针类型', correct: true }, 
                        { text: '函数对象' }, 
                        { text: '函数引用' }
                    ], 
                    explanation: '这是定义函数指针类型的别名。' 
                },
                { 
                    type: 'single', 
                    question: 'typedef和using的主要区别是？', 
                    options: [
                        { text: '性能不同' }, 
                        { text: 'using支持模板别名', correct: true }, 
                        { text: 'typedef更现代' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: 'using支持模板别名，typedef不支持。' 
                }
            ]
        },
        {
            id: '23.2',
            title: '枚举：enum 与 enum class',
            duration: '40分钟',
            difficulty: '基础',
            xp: 110,
            estimatedXp: 320,
            concepts: `## 枚举：enum 与 enum class

### 传统枚举（enum）

传统枚举是C++从C继承的特性，用于定义一组命名常量。

\`\`\`cpp
enum Color {
    RED,
    GREEN,
    BLUE
};

Color c = RED;
std::cout << c << std::endl;  // 输出: 0
\`\`\`

### 传统枚举的问题

#### 1. 作用域污染

\`\`\`cpp
enum Color { RED, GREEN, BLUE };
enum TrafficLight { RED, YELLOW, GREEN };  // 错误：RED重定义
\`\`\`

#### 2. 隐式转换为整数

\`\`\`cpp
enum Color { RED, GREEN, BLUE };
Color c = RED;
int x = c;  // 隐式转换，可能不安全
\`\`\`

### 强类型枚举（enum class）

C++11引入了强类型枚举enum class，解决了传统枚举的问题。

\`\`\`cpp
enum class Color {
    Red,
    Green,
    Blue
};

Color c = Color::Red;  // 必须使用作用域
// Color c = Red;      // 错误
// int x = c;          // 错误：不能隐式转换
\`\`\`

### enum class 的优势

#### 1. 作用域限定

\`\`\`cpp
enum class Color { Red, Green, Blue };
enum class TrafficLight { Red, Yellow, Green };

Color c = Color::Red;           // 正确
TrafficLight t = TrafficLight::Red;  // 正确，不冲突
\`\`\`

#### 2. 不隐式转换为整数

\`\`\`cpp
enum class Color { Red, Green, Blue };
Color c = Color::Red;
// int x = c;        // 错误：不能隐式转换
int x = static_cast<int>(c);  // 正确：显式转换
\`\`\`

#### 3. 可以指定底层类型

\`\`\`cpp
enum class Color : uint8_t {
    Red, Green, Blue
};

enum class BigEnum : long long {
    Value1 = 0,
    Value2 = 1000000000000LL
};
\`\`\`

### 枚举的使用

\`\`\`cpp
enum class Weekday {
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
};

Weekday today = Weekday::Monday;

switch (today) {
    case Weekday::Monday:
        std::cout << "星期一" << std::endl;
        break;
    case Weekday::Friday:
        std::cout << "星期五" << std::endl;
        break;
    default:
        std::cout << "其他" << std::endl;
}
\`\`\`

### 最佳实践

1. **优先使用enum class**
2. **为enum class提供工具函数**
3. **使用Count作为枚举计数**`,
            examples: [
                {
                    title: 'enum vs enum class',
                    code: `#include <iostream>
#include <string>

// 传统枚举
enum Color { RED, GREEN, BLUE };

// 强类型枚举
enum class HttpStatus {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    NotFound = 404
};

// 指定底层类型
enum class Permission : uint8_t {
    None = 0,
    Read = 1,
    Write = 2,
    Execute = 4
};

int main() {
    std::cout << "=== 传统枚举 ===" << std::endl;
    Color c = RED;
    std::cout << "RED = " << c << std::endl;
    
    std::cout << "\\n=== 强类型枚举 ===" << std::endl;
    HttpStatus status = HttpStatus::OK;
    int statusCode = static_cast<int>(status);
    std::cout << "Status code: " << statusCode << std::endl;
    
    std::cout << "\\n=== 位标志枚举 ===" << std::endl;
    Permission p = Permission::Read | Permission::Write;
    int permValue = static_cast<int>(p);
    std::cout << "Permission value: " << permValue << std::endl;
    
    return 0;
}`,
                    description: '对比传统枚举和强类型枚举的区别。'
                }
            ],
            handsOn: {
                title: '实现状态机',
                description: '使用enum class实现一个简单的状态机。',
                initialCode: `#include <iostream>
#include <string>

// TODO: 定义状态枚举
// States: Idle, Connecting, Connected, Disconnecting, Error

// TODO: 定义事件枚举
// Events: Connect, ConnectSuccess, ConnectFail, Disconnect

class StateMachine {
private:
    // TODO: 添加当前状态成员变量
    
public:
    StateMachine() {
        // 初始化为Idle状态
    }
    
    std::string getState() const {
        return "Idle";
    }
    
    void handleEvent(/* Event event */) {
        // 使用switch处理状态转换
    }
    
    void reset() {
        // 重置状态
    }
};

int main() {
    StateMachine sm;
    std::cout << "当前状态: " << sm.getState() << std::endl;
    return 0;
}`,
                expectedOutput: `当前状态: Idle`,
                solutionRegex: 'enum class|switch|case|static_cast',
                hint: '使用enum class定义状态和事件，switch处理状态转换',
                xp: 180
            },
            references: [
                { title: '枚举类型', book: 'C++ Primer 第五版', chapter: '第19章' },
                { title: '强类型枚举', book: 'Effective Modern C++', chapter: '条款10' }
            ],
            assistantTips: [
                '优先使用enum class',
                'enum class不会污染作用域',
                'enum class不会隐式转换为整数',
                '可以为enum class指定底层类型'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'enum class的主要优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '作用域限定和类型安全', correct: true }, 
                        { text: '占用内存更少' }, 
                        { text: '语法更简单' }
                    ], 
                    explanation: 'enum class提供作用域限定和类型安全。' 
                },
                { 
                    type: 'single', 
                    question: 'enum class可以隐式转换为整数吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以', correct: true }, 
                        { text: '取决于编译器' }, 
                        { text: '取决于底层类型' }
                    ], 
                    explanation: 'enum class不能隐式转换为整数，需要static_cast。' 
                },
                { 
                    type: 'single', 
                    question: '如何指定enum class的底层类型？', 
                    options: [
                        { text: 'enum class Color : int', correct: true }, 
                        { text: 'enum class<int> Color' }, 
                        { text: 'enum class Color(int)' }, 
                        { text: '不能指定' }
                    ], 
                    explanation: '使用enum class Name : Type语法指定底层类型。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的enum class用法？', 
                    options: [
                        { text: 'Color c = Red;' }, 
                        { text: 'Color c = Color::Red;', correct: true }, 
                        { text: 'Color c = 0;' }, 
                        { text: 'int c = Color::Red;' }
                    ], 
                    explanation: 'enum class必须使用作用域限定符访问枚举值。' 
                },
                { 
                    type: 'single', 
                    question: '传统enum的主要问题是？', 
                    options: [
                        { text: '性能差' }, 
                        { text: '作用域污染和隐式转换', correct: true }, 
                        { text: '不支持位运算' }, 
                        { text: '不能指定值' }
                    ], 
                    explanation: '传统enum会污染作用域，且可以隐式转换为整数。' 
                }
            ]
        },
        {
            id: '23.3',
            title: '类型萃取（type traits）基础',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 类型萃取（type traits）基础

### 什么是类型萃取？

类型萃取（Type Traits）是C++模板元编程的基础工具，用于在编译期获取类型的信息。

\`\`\`cpp
#include <type_traits>

// 检查类型是否是整数
std::cout << std::is_integral<int>::value << std::endl;  // true
std::cout << std::is_integral<double>::value << std::endl;  // false
\`\`\`

### 基本类型判断

\`\`\`cpp
#include <type_traits>

// 是否是整数类型
std::is_integral<int>::value;  // true

// 是否是浮点类型
std::is_floating_point<double>::value;  // true

// 是否是指针
std::is_pointer<int*>::value;  // true

// 是否是引用
std::is_reference<int&>::value;  // true
\`\`\`

### 类型修改

\`\`\`cpp
#include <type_traits>

// 移除const
std::remove_const<const int>::type;  // int

// 移除引用
std::remove_reference<int&>::type;  // int

// 移除指针
std::remove_pointer<int*>::type;  // int
\`\`\`

### 条件类型

\`\`\`cpp
#include <type_traits>

// 根据条件选择类型
using MyType = std::conditional<true, int, double>::type;  // int

// enable_if
template<typename T>
typename std::enable_if<std::is_integral<T>::value, T>::type
process(T value) {
    return value * 2;
}
\`\`\`

### C++17简化语法

\`\`\`cpp
#include <type_traits>

// C++11
std::is_integral<int>::value  // true

// C++17
std::is_integral_v<int>  // true
\`\`\``,
            examples: [
                {
                    title: '类型萃取基础',
                    code: `#include <iostream>
#include <type_traits>

int main() {
    std::cout << "=== 类型分类 ===" << std::endl;
    std::cout << "int是整数: " << std::is_integral<int>::value << std::endl;
    std::cout << "double是浮点: " << std::is_floating_point<double>::value << std::endl;
    std::cout << "int*是指针: " << std::is_pointer<int*>::value << std::endl;
    
    std::cout << "\\n=== 类型修改 ===" << std::endl;
    std::cout << "remove_const<const int>: " 
              << std::is_same<std::remove_const<const int>::type, int>::value << std::endl;
    
    std::cout << "\\n=== C++17简化语法 ===" << std::endl;
    std::cout << "is_integral_v<int>: " << std::is_integral_v<int> << std::endl;
    
    return 0;
}`,
                    description: '展示类型萃取的基本用法。'
                }
            ],
            handsOn: {
                title: '实现类型萃取工具',
                description: '实现自定义类型萃取工具。',
                initialCode: `#include <iostream>
#include <type_traits>

// TODO: 实现is_pointer模板
template<typename T>
struct is_pointer {
    static constexpr bool value = false;
};

// TODO: 实现is_pointer的特化版本

// TODO: 实现remove_const模板
template<typename T>
struct remove_const {
    using type = T;
};

// TODO: 实现remove_const的特化版本

int main() {
    std::cout << "is_pointer<int*>: " << is_pointer<int*>::value << std::endl;
    std::cout << "remove_const<const int>: " 
              << std::is_same<remove_const<const int>::type, int>::value << std::endl;
    return 0;
}`,
                expectedOutput: `is_pointer<int*>: 1
remove_const<const int>: 1`,
                solutionRegex: 'template|struct|type|value|static constexpr',
                hint: '使用模板特化实现类型萃取',
                xp: 200
            },
            references: [
                { title: '类型萃取', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '类型特征', book: 'Effective Modern C++', chapter: '条款9' }
            ],
            assistantTips: [
                '类型萃取在编译期获取类型信息',
                '使用模板特化实现自定义萃取',
                'C++17提供_v简化语法',
                'enable_if用于条件编译'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::is_integral<int>::value的值是？', 
                    options: [
                        { text: 'false' }, 
                        { text: 'true', correct: true }, 
                        { text: '编译错误' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: 'int是整数类型，所以is_integral返回true。' 
                },
                { 
                    type: 'single', 
                    question: 'std::remove_const<const int>::type是什么？', 
                    options: [
                        { text: 'const int' }, 
                        { text: 'int', correct: true }, 
                        { text: 'int&' }, 
                        { text: 'const int&' }
                    ], 
                    explanation: 'remove_const移除const修饰符，返回int。' 
                },
                { 
                    type: 'single', 
                    question: 'std::enable_if的作用是？', 
                    options: [
                        { text: '启用类型' }, 
                        { text: '条件编译', correct: true }, 
                        { text: '类型转换' }, 
                        { text: '类型判断' }
                    ], 
                    explanation: 'enable_if用于根据条件启用或禁用模板。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17中std::is_integral_v<int>等价于？', 
                    options: [
                        { text: 'std::is_integral<int>()' }, 
                        { text: 'std::is_integral<int>::value', correct: true }, 
                        { text: 'std::is_integral<int>::type' }, 
                        { text: 'std::is_integral<int>' }
                    ], 
                    explanation: '_v后缀是C++17引入的简化语法，等价于::value。' 
                },
                { 
                    type: 'single', 
                    question: 'std::is_same<int, int32_t>::value通常是？', 
                    options: [
                        { text: 'false' }, 
                        { text: 'true', correct: true }, 
                        { text: '编译错误' }, 
                        { text: '取决于平台' }
                    ], 
                    explanation: '在大多数平台上int和int32_t是相同类型。' 
                }
            ]
        },
        {
            id: '23.4',
            title: 'constexpr 函数与 constexpr 容器',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## constexpr 函数与 constexpr 容器

### 什么是 constexpr？

constexpr是C++11引入的关键字，用于指定**编译期常量**和**编译期计算**。

\`\`\`cpp
// 编译期常量
constexpr int MAX_SIZE = 100;

// 编译期函数
constexpr int square(int x) {
    return x * x;
}

// 编译期计算
constexpr int result = square(5);  // 编译期计算为25
\`\`\`

### constexpr 函数

\`\`\`cpp
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

constexpr int fact5 = factorial(5);  // 120
\`\`\`

### constexpr 构造函数

\`\`\`cpp
class Point {
private:
    int x, y;
    
public:
    constexpr Point(int x, int y) : x(x), y(y) {}
    constexpr int getX() const { return x; }
    constexpr int getY() const { return y; }
};

constexpr Point p(3, 4);
constexpr int x = p.getX();  // 3
\`\`\`

### constexpr 的限制

1. 不能有副作用
2. 不能使用非常量表达式
3. C++17放宽了很多限制`,
            examples: [
                {
                    title: 'constexpr基础',
                    code: `#include <iostream>

constexpr int square(int x) {
    return x * x;
}

constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

int main() {
    std::cout << "=== constexpr函数 ===" << std::endl;
    constexpr int sq = square(5);
    std::cout << "square(5): " << sq << std::endl;
    
    constexpr int fact5 = factorial(5);
    std::cout << "factorial(5): " << fact5 << std::endl;
    
    return 0;
}`,
                    description: '展示constexpr的基本用法。'
                }
            ],
            handsOn: {
                title: '实现编译期计算',
                description: '实现编译期计算函数。',
                initialCode: `#include <iostream>

// TODO: 实现编译期最大公约数（GCD）
constexpr int gcd(int a, int b) {
    return 0;
}

// TODO: 实现编译期最小公倍数（LCM）
constexpr int lcm(int a, int b) {
    return 0;
}

int main() {
    constexpr int g = gcd(48, 18);
    constexpr int l = lcm(4, 6);
    std::cout << "gcd(48, 18) = " << g << std::endl;
    std::cout << "lcm(4, 6) = " << l << std::endl;
    return 0;
}`,
                expectedOutput: `gcd(48, 18) = 6
lcm(4, 6) = 12`,
                solutionRegex: 'constexpr|return|if|for|while',
                hint: '使用constexpr关键字，递归或循环实现',
                xp: 200
            },
            references: [
                { title: 'constexpr', book: 'C++ Primer 第五版', chapter: '第2章' },
                { title: '编译期计算', book: 'Effective Modern C++', chapter: '条款15' }
            ],
            assistantTips: [
                'constexpr用于编译期计算',
                'constexpr函数可以在编译期或运行期执行',
                'C++14放宽了constexpr函数的限制',
                '优先使用constexpr提升性能'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'constexpr函数可以在什么时候执行？', 
                    options: [
                        { text: '只能编译期' }, 
                        { text: '只能运行期' }, 
                        { text: '编译期和运行期都可以', correct: true }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: 'constexpr函数可以在编译期和运行期执行。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr变量必须在什么时候初始化？', 
                    options: [
                        { text: '运行期' }, 
                        { text: '编译期', correct: true }, 
                        { text: '任何时候' }, 
                        { text: '取决于类型' }
                    ], 
                    explanation: 'constexpr变量必须在编译期初始化。' 
                },
                { 
                    type: 'single', 
                    question: 'C++14对constexpr函数做了什么改进？', 
                    options: [
                        { text: '只能有一条return语句' }, 
                        { text: '放宽限制，允许更复杂的逻辑', correct: true }, 
                        { text: '禁止递归' }, 
                        { text: '禁止局部变量' }
                    ], 
                    explanation: 'C++14放宽了constexpr函数的限制，允许更复杂的逻辑。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的constexpr用法？', 
                    options: [
                        { text: 'constexpr int x = rand();' }, 
                        { text: 'constexpr int square(int n) { return n * n; }', correct: true }, 
                        { text: 'constexpr void print() { std::cout << "hi"; }' }, 
                        { text: 'constexpr int* p = new int(10);' }
                    ], 
                    explanation: 'constexpr函数可以有返回值，但不能有副作用。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr和const的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'constexpr必须在编译期初始化', correct: true }, 
                        { text: 'const更严格' }, 
                        { text: 'constexpr不能用于变量' }
                    ], 
                    explanation: 'constexpr必须在编译期初始化，const可以在运行期初始化。' 
                }
            ]
        },
        {
            id: '23.5',
            title: 'if constexpr（C++17）',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## if constexpr（C++17）

### 什么是 if constexpr？

if constexpr是C++17引入的编译期条件语句，根据编译期条件选择性地编译代码。

\`\`\`cpp
template<typename T>
void process(T value) {
    if constexpr (std::is_integral<T>::value) {
        std::cout << "整数: " << value << std::endl;
    } else if constexpr (std::is_floating_point<T>::value) {
        std::cout << "浮点数: " << value << std::endl;
    }
}
\`\`\`

### if constexpr vs if

\`\`\`cpp
template<typename T>
void process(T value) {
    if constexpr (std::is_integral<T>::value) {
        // 只有条件为true时才编译这段代码
        std::cout << value * 2 << std::endl;
    }
    // 条件为false时，这段代码被丢弃，不会编译
}
\`\`\`

### 实际应用

\`\`\`cpp
template<typename T>
std::string serialize(const T& value) {
    if constexpr (std::is_integral<T>::value) {
        return std::to_string(value);
    } else if constexpr (std::is_same<T, std::string>::value) {
        return "\\"" + value + "\\"";
    }
}
\`\`\``,
            examples: [
                {
                    title: 'if constexpr基础',
                    code: `#include <iostream>
#include <type_traits>

template<typename T>
void printTypeInfo(T value) {
    if constexpr (std::is_integral<T>::value) {
        std::cout << "整数类型: " << value << std::endl;
    } else if constexpr (std::is_floating_point<T>::value) {
        std::cout << "浮点类型: " << value << std::endl;
    }
}

int main() {
    printTypeInfo(42);
    printTypeInfo(3.14);
    return 0;
}`,
                    description: '展示if constexpr的基本用法。'
                }
            ],
            handsOn: {
                title: '实现通用处理函数',
                description: '使用if constexpr实现通用处理函数。',
                initialCode: `#include <iostream>
#include <type_traits>

// TODO: 实现通用打印函数
template<typename T>
void smartPrint(const T& value) {
    // 如果是整数类型，打印"整数: value"
    // 如果是浮点类型，打印"浮点: value"
}

int main() {
    smartPrint(42);
    smartPrint(3.14);
    return 0;
}`,
                expectedOutput: `整数: 42
浮点: 3.14`,
                solutionRegex: 'if constexpr|std::is_',
                hint: '使用if constexpr结合类型萃取实现类型判断',
                xp: 200
            },
            references: [
                { title: 'if constexpr', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '编译期条件', book: 'Effective Modern C++', chapter: '条款17' }
            ],
            assistantTips: [
                'if constexpr在编译期选择代码分支',
                '未选中的分支不会被编译',
                '比SFINAE更简洁',
                '条件必须是编译期常量'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'if constexpr的条件必须是？', 
                    options: [
                        { text: '运行时变量' }, 
                        { text: '编译期常量', correct: true }, 
                        { text: '任意表达式' }, 
                        { text: '布尔值' }
                    ], 
                    explanation: 'if constexpr的条件必须是编译期常量表达式。' 
                },
                { 
                    type: 'single', 
                    question: 'if constexpr相比普通if的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '未选中的分支不会被编译', correct: true }, 
                        { text: '语法更简单' }, 
                        { text: '可以用于运行时' }
                    ], 
                    explanation: 'if constexpr未选中的分支不会被编译，避免编译错误。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的if constexpr用法？', 
                    options: [
                        { text: 'if constexpr (x > 0)' }, 
                        { text: 'if constexpr (std::is_integral<T>::value)', correct: true }, 
                        { text: 'if constexpr (func())' }, 
                        { text: 'if constexpr (rand() > 0)' }
                    ], 
                    explanation: 'if constexpr的条件必须是编译期常量表达式。' 
                },
                { 
                    type: 'single', 
                    question: 'if constexpr是C++哪个版本引入的？', 
                    options: [
                        { text: 'C++11' }, 
                        { text: 'C++14' }, 
                        { text: 'C++17', correct: true }, 
                        { text: 'C++20' }
                    ], 
                    explanation: 'if constexpr是C++17引入的特性。' 
                },
                { 
                    type: 'single', 
                    question: 'if constexpr可以替代什么技术？', 
                    options: [
                        { text: '虚函数' }, 
                        { text: 'SFINAE', correct: true }, 
                        { text: '异常处理' }, 
                        { text: '运行时多态' }
                    ], 
                    explanation: 'if constexpr可以替代SFINAE实现条件编译，更简洁。' 
                }
            ]
        },
        {
            id: '23.6',
            title: 'static_assert 编译期断言',
            duration: '35分钟',
            difficulty: '基础',
            xp: 110,
            estimatedXp: 320,
            concepts: `## static_assert 编译期断言

### 什么是 static_assert？

static_assert是C++11引入的编译期断言，用于在编译期检查条件是否成立。

\`\`\`cpp
// 基本语法
static_assert(条件, "错误消息");

// 示例
static_assert(sizeof(int) == 4, "int必须是4字节");
static_assert(sizeof(void*) == 8, "必须是64位系统");
\`\`\`

### 基本用法

#### 1. 检查类型大小

\`\`\`cpp
static_assert(sizeof(int) == 4, "int必须是4字节");
static_assert(sizeof(double) == 8, "double必须是8字节");
\`\`\`

#### 2. 检查类型属性

\`\`\`cpp
template<typename T>
void process(T value) {
    static_assert(std::is_integral<T>::value, "T必须是整数类型");
    // ...
}
\`\`\`

### static_assert vs assert

\`\`\`cpp
#include <cassert>

// assert：运行时断言
void func(int* p) {
    assert(p != nullptr);  // 运行时检查
}

// static_assert：编译期断言
template<typename T>
void func(T value) {
    static_assert(std::is_integral<T>::value, "T必须是整数");  // 编译期检查
}
\`\`\`

### C++17简化

\`\`\`cpp
// C++11：必须有错误消息
static_assert(sizeof(int) == 4, "int必须是4字节");

// C++17：可以省略错误消息
static_assert(sizeof(int) == 4);
\`\`\``,
            examples: [
                {
                    title: 'static_assert基础',
                    code: `#include <iostream>
#include <type_traits>

// 编译期检查
static_assert(sizeof(int) == 4, "int必须是4字节");

template<typename T>
class NumericContainer {
    static_assert(std::is_arithmetic<T>::value, "T必须是数值类型");
private:
    T value;
public:
    NumericContainer(T v) : value(v) {}
};

int main() {
    std::cout << "编译期检查通过" << std::endl;
    NumericContainer<int> nc(10);
    return 0;
}`,
                    description: '展示static_assert的基本用法。'
                }
            ],
            handsOn: {
                title: '实现类型约束',
                description: '使用static_assert实现类型约束。',
                initialCode: `#include <iostream>
#include <type_traits>

// TODO: 实现数值容器
template<typename T>
class NumericContainer {
    // 使用static_assert确保T是数值类型
private:
    T value;
public:
    NumericContainer(T v) : value(v) {}
    T getValue() const { return value; }
};

int main() {
    NumericContainer<int> nc(10);
    std::cout << nc.getValue() << std::endl;
    return 0;
}`,
                expectedOutput: `10`,
                solutionRegex: 'static_assert|std::is_arithmetic',
                hint: '使用static_assert结合类型萃取实现类型约束',
                xp: 180
            },
            references: [
                { title: 'static_assert', book: 'C++ Primer 第五版', chapter: '第2章' },
                { title: '编译期断言', book: 'Effective Modern C++', chapter: '条款15' }
            ],
            assistantTips: [
                'static_assert在编译期检查条件',
                '条件必须是编译期常量表达式',
                '提供有意义的错误消息',
                'C++17可以省略错误消息'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'static_assert在什么时候检查？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译期', correct: true }, 
                        { text: '链接时' }, 
                        { text: '取决于条件' }
                    ], 
                    explanation: 'static_assert在编译期检查条件。' 
                },
                { 
                    type: 'single', 
                    question: 'static_assert的条件必须是？', 
                    options: [
                        { text: '运行时表达式' }, 
                        { text: '编译期常量表达式', correct: true }, 
                        { text: '任意表达式' }, 
                        { text: '布尔变量' }
                    ], 
                    explanation: 'static_assert的条件必须是编译期常量表达式。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17对static_assert的改进是？', 
                    options: [
                        { text: '可以省略错误消息', correct: true }, 
                        { text: '可以用于运行时' }, 
                        { text: '性能更好' }, 
                        { text: '支持更多类型' }
                    ], 
                    explanation: 'C++17允许省略static_assert的错误消息。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的static_assert用法？', 
                    options: [
                        { text: 'static_assert(x > 0, "x must be positive")' }, 
                        { text: 'static_assert(sizeof(int) == 4, "int must be 4 bytes")', correct: true }, 
                        { text: 'static_assert(func(), "func failed")' }, 
                        { text: 'static_assert(rand() > 0, "random check")' }
                    ], 
                    explanation: 'static_assert的条件必须是编译期常量表达式。' 
                },
                { 
                    type: 'single', 
                    question: 'static_assert和assert的主要区别是？', 
                    options: [
                        { text: '性能不同' }, 
                        { text: '检查时机不同', correct: true }, 
                        { text: '语法不同' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: 'static_assert在编译期检查，assert在运行时检查。' 
                }
            ]
        },
        {
            id: '23.7',
            title: '变量模板与 inline 变量（C++17）',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 变量模板与 inline 变量（C++17）

### 变量模板

C++14引入了变量模板，允许模板化变量。

\`\`\`cpp
// 基本语法
template<typename T>
constexpr T pi = T(3.14159265358979);

// 使用
double d = pi<double>;
float f = pi<float>;
\`\`\`

### inline 变量

C++17引入了inline变量，允许在头文件中定义变量。

\`\`\`cpp
// 传统方式
class MyClass {
    static int count;  // 声明
};
int MyClass::count = 0;  // 定义（必须在.cpp中）

// inline方式
class MyClass {
    static inline int count = 0;  // 定义（可以在头文件中）
};
\`\`\`

### 实际应用

\`\`\`cpp
namespace math {
    template<typename T>
    inline constexpr T pi = T(3.14159265358979323846);
    
    template<typename T>
    inline constexpr T e = T(2.71828182845904523536);
}
\`\`\``,
            examples: [
                {
                    title: '变量模板基础',
                    code: `#include <iostream>

// 变量模板：数学常量
template<typename T>
constexpr T pi = T(3.14159265358979323846);

int main() {
    std::cout << "pi<float>: " << pi<float> << std::endl;
    std::cout << "pi<double>: " << pi<double> << std::endl;
    return 0;
}`,
                    description: '展示变量模板的基本用法。'
                }
            ],
            handsOn: {
                title: '实现数学常量库',
                description: '使用变量模板和inline实现数学常量库。',
                initialCode: `#include <iostream>

// TODO: 实现数学常量库
namespace math {
    // TODO: 定义pi常量
    // TODO: 定义e常量
}

int main() {
    std::cout << "pi: " << math::pi<double> << std::endl;
    std::cout << "e: " << math::e<double> << std::endl;
    return 0;
}`,
                expectedOutput: `pi: 3.14159265358979
e: 2.71828182845905`,
                solutionRegex: 'template|constexpr|inline|pi|e',
                hint: '使用变量模板定义类型相关的常量',
                xp: 180
            },
            references: [
                { title: '变量模板', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: 'inline变量', book: 'Effective Modern C++', chapter: '条款15' }
            ],
            assistantTips: [
                '变量模板允许模板化变量',
                'inline变量可以在头文件中定义',
                'constexpr隐含inline',
                '变量模板提供类型安全的常量'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '变量模板是C++哪个版本引入的？', 
                    options: [
                        { text: 'C++11' }, 
                        { text: 'C++14', correct: true }, 
                        { text: 'C++17' }, 
                        { text: 'C++20' }
                    ], 
                    explanation: '变量模板是C++14引入的特性。' 
                },
                { 
                    type: 'single', 
                    question: 'inline变量的主要用途是？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '在头文件中定义变量', correct: true }, 
                        { text: '减少内存占用' }, 
                        { text: '简化语法' }
                    ], 
                    explanation: 'inline变量允许在头文件中定义变量，避免链接错误。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr变量是否隐含inline？', 
                    options: [
                        { text: '否' }, 
                        { text: '是', correct: true }, 
                        { text: '取决于类型' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: 'constexpr变量隐含inline。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的变量模板用法？', 
                    options: [
                        { text: 'template<typename T> T pi = 3.14;' }, 
                        { text: 'template<typename T> constexpr T pi = T(3.14);', correct: true }, 
                        { text: 'template<T> T pi = 3.14;' }, 
                        { text: 'constexpr template<typename T> T pi = 3.14;' }
                    ], 
                    explanation: '变量模板使用template<typename T>语法，通常与constexpr一起使用。' 
                },
                { 
                    type: 'single', 
                    question: 'inline变量解决了什么问题？', 
                    options: [
                        { text: '性能问题' }, 
                        { text: '头文件中定义静态成员的链接错误', correct: true }, 
                        { text: '内存泄漏' }, 
                        { text: '类型安全问题' }
                    ], 
                    explanation: 'inline变量解决了在头文件中定义静态成员导致的链接错误问题。' 
                }
            ]
        },
        {
            id: '23.8',
            title: '折叠表达式与编译期循环',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 折叠表达式与编译期循环

### 折叠表达式（C++17）

折叠表达式是C++17引入的特性，用于简化可变参数模板的处理。

\`\`\`cpp
// 基本语法
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);  // 右折叠
}

// 使用
auto result = sum(1, 2, 3, 4, 5);  // 15
\`\`\`

### 折叠表达式类型

#### 1. 右折叠

\`\`\`cpp
(args + ...)  // 等价于: arg1 + (arg2 + (arg3 + ...))
\`\`\`

#### 2. 左折叠

\`\`\`cpp
(... + args)  // 等价于: ((arg1 + arg2) + arg3) + ...
\`\`\`

#### 3. 带初始值的折叠

\`\`\`cpp
(args + ... + 0)  // 右折叠，初始值为0
(0 + ... + args)  // 左折叠，初始值为0
\`\`\`

### 实际应用

\`\`\`cpp
// 打印所有参数
template<typename... Args>
void printAll(Args... args) {
    (std::cout << ... << args) << std::endl;
}

// 检查所有参数是否为真
template<typename... Args>
bool allTrue(Args... args) {
    return (... && args);
}

// 检查是否有任一参数为真
template<typename... Args>
bool anyTrue(Args... args) {
    return (... || args);
}
\`\`\`

### 编译期循环

使用模板元编程实现编译期循环：

\`\`\`cpp
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

// 使用
constexpr int fact5 = Factorial<5>::value;  // 120
\`\`\``,
            examples: [
                {
                    title: '折叠表达式基础',
                    code: `#include <iostream>

// 求和
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}

// 打印所有参数
template<typename... Args>
void printAll(Args... args) {
    ((std::cout << args << " "), ...);
    std::cout << std::endl;
}

int main() {
    std::cout << "=== 求和 ===" << std::endl;
    std::cout << "sum(1, 2, 3, 4, 5): " << sum(1, 2, 3, 4, 5) << std::endl;
    
    std::cout << "\\n=== 打印所有参数 ===" << std::endl;
    printAll(1, 2.5, "hello", 'c');
    
    return 0;
}`,
                    description: '展示折叠表达式的基本用法。'
                }
            ],
            handsOn: {
                title: '实现可变参数函数',
                description: '使用折叠表达式实现可变参数函数。',
                initialCode: `#include <iostream>

// TODO: 实现求乘积函数
template<typename... Args>
auto product(Args... args) {
    return 1; // 返回所有参数的乘积
}

// TODO: 实现求最大值函数
template<typename... Args>
auto maxValue(Args... args) {
    return args; // 返回最大值
}

int main() {
    std::cout << "product(1, 2, 3, 4): " << product(1, 2, 3, 4) << std::endl;
    std::cout << "maxValue(3, 1, 4, 1, 5): " << maxValue(3, 1, 4, 1, 5) << std::endl;
    return 0;
}`,
                expectedOutput: `product(1, 2, 3, 4): 24
maxValue(3, 1, 4, 1, 5): 5`,
                solutionRegex: '(...|args)|return',
                hint: '使用折叠表达式简化可变参数处理',
                xp: 200
            },
            references: [
                { title: '折叠表达式', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '可变参数模板', book: 'Effective Modern C++', chapter: '条款17' }
            ],
            assistantTips: [
                '折叠表达式简化可变参数模板',
                '右折叠：(args op ...)',
                '左折叠：(... op args)',
                '可以带初始值'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '折叠表达式是C++哪个版本引入的？', 
                    options: [
                        { text: 'C++11' }, 
                        { text: 'C++14' }, 
                        { text: 'C++17', correct: true }, 
                        { text: 'C++20' }
                    ], 
                    explanation: '折叠表达式是C++17引入的特性。' 
                },
                { 
                    type: 'single', 
                    question: '(args + ...)是什么类型的折叠？', 
                    options: [
                        { text: '左折叠' }, 
                        { text: '右折叠', correct: true }, 
                        { text: '双向折叠' }, 
                        { text: '不确定' }
                    ], 
                    explanation: '(args + ...)是右折叠，从右向左计算。' 
                },
                { 
                    type: 'single', 
                    question: '(... + args)是什么类型的折叠？', 
                    options: [
                        { text: '左折叠', correct: true }, 
                        { text: '右折叠' }, 
                        { text: '双向折叠' }, 
                        { text: '不确定' }
                    ], 
                    explanation: '(... + args)是左折叠，从左向右计算。' 
                },
                { 
                    type: 'single', 
                    question: '折叠表达式的主要用途是？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '简化可变参数模板', correct: true }, 
                        { text: '减少内存占用' }, 
                        { text: '类型安全' }
                    ], 
                    explanation: '折叠表达式用于简化可变参数模板的处理。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的折叠表达式？', 
                    options: [
                        { text: '(args ... +)' }, 
                        { text: '(args + ...)', correct: true }, 
                        { text: '(... args +)' }, 
                        { text: '(+ args ...)' }
                    ], 
                    explanation: '正确的折叠表达式语法是(args op ...)或(... op args)。' 
                }
            ]
        }
    ]
};

window.Unit23Data = Unit23Data;