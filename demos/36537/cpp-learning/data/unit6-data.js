/**
 * 第6章：函数基础
 * 完整的学习内容
 */

var Unit6Data = {
    id: 6,
    title: '函数基础',
    description: '掌握C++函数的定义、参数传递、重载、内联等核心概念',
    lessons: [
        {
            id: '6.1',
            title: '函数基础与定义',
            duration: '30分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 函数基础与定义

### 什么是函数

函数是**完成特定任务的独立代码单元**。使用函数可以：

1. **代码复用**：避免重复编写相同代码
2. **模块化**：将复杂问题分解为小问题
3. **可维护性**：便于调试和修改
4. **可读性**：提高代码的可理解性

### 函数的定义

一个完整的函数定义包括：

\`\`\`cpp
返回类型 函数名(参数列表) {
    函数体
    return 返回值;
}
\`\`\`

#### 示例：简单函数

\`\`\`cpp
// 定义一个求和函数
int add(int a, int b) {
    return a + b;
}

// 定义一个无返回值的函数
void greet() {
    std::cout << "Hello, C++!" << std::endl;
    // void函数可以没有return语句
}
\`\`\`

### 函数的组成部分

#### 1. 返回类型

- 指定函数返回值的数据类型
- \`void\` 表示不返回任何值
- 不能省略返回类型

\`\`\`cpp
int getNumber() { return 42; }      // 返回int
double getPi() { return 3.14; }     // 返回double
bool isEven(int n) { return n % 2 == 0; }  // 返回bool
void doSomething() { /* ... */ }    // 无返回值
\`\`\`

#### 2. 函数名

- 遵循标识符命名规则
- 应该具有描述性，表达函数的功能
- 采用小驼峰或下划线命名法

\`\`\`cpp
// 好的命名
int calculateSum(int a, int b);
bool isValidEmail(std::string email);
void printUserInfo();

// 不好的命名
int f(int x);           // 不清楚功能
void process();         // 过于模糊
\`\`\`

#### 3. 参数列表

- 参数是函数的输入
- 可以有零个或多个参数
- 参数之间用逗号分隔

\`\`\`cpp
// 无参数函数
int getCurrentYear() { return 2024; }

// 单参数函数
int square(int n) { return n * n; }

// 多参数函数
int max(int a, int b, int c) {
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}
\`\`\`

#### 4. 函数体

- 包含在花括号中的代码块
- 实现函数的具体逻辑

### 函数声明与定义

\`\`\`cpp
// 函数声明（原型）- 告诉编译器函数存在
int add(int a, int b);

// 函数定义 - 实现函数
int add(int a, int b) {
    return a + b;
}
\`\`\`

#### 分离声明和定义

\`\`\`cpp
// mymath.h - 头文件
#ifndef MYMATH_H
#define MYMATH_H

int add(int a, int b);
int subtract(int a, int b);

#endif

// mymath.cpp - 源文件
#include "mymath.h"

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}
\`\`\`

### 函数调用

\`\`\`cpp
#include <iostream>

int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(3, 5);  // 调用函数
    std::cout << "3 + 5 = " << result << std::endl;
    
    // 直接在表达式中使用
    std::cout << "10 + 20 = " << add(10, 20) << std::endl;
    
    return 0;
}
\`\`\`

### 局部变量与作用域

函数内部定义的变量是**局部变量**，只在函数内部有效：

\`\`\`cpp
void example() {
    int x = 10;      // x是局部变量
    double y = 3.14; // y是局部变量
} // x和y在这里被销毁

int main() {
    // std::cout << x; // 错误！x不可见
    return 0;
}
\`\`\`

### 函数的最佳实践

1. **单一职责**：每个函数只做一件事
2. **命名清晰**：函数名应该描述其功能
3. **参数适量**：参数不宜过多（通常不超过4个）
4. **避免副作用**：尽量不修改全局变量
5. **保持简短**：函数体不宜过长

\`\`\`cpp
// 好的函数设计
bool isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}
\`\`\`

### 常见错误

#### 1. 忘记返回值

\`\`\`cpp
// 错误：非void函数忘记return
int add(int a, int b) {
    int result = a + b;
    // 忘记return result;
}

// 正确
int add(int a, int b) {
    return a + b;
}
\`\`\`

#### 2. 返回局部变量的引用或指针

\`\`\`cpp
// 错误：返回局部变量的引用
int& getNumber() {
    int num = 10;
    return num;  // num在函数返回后被销毁
}

// 正确：返回值
int getNumber() {
    int num = 10;
    return num;  // 返回值的副本
}
\`\`\`

#### 3. 参数过多导致调用困难

\`\`\`cpp
// 不好的设计：参数太多
void createUser(std::string name, int age, std::string email, 
                std::string phone, std::string address, 
                std::string city, std::string country);

// 更好的设计：使用结构体
struct UserInfo {
    std::string name;
    int age;
    std::string email;
    std::string phone;
    std::string address;
    std::string city;
    std::string country;
};

void createUser(const UserInfo& info);
\`\`\`

#### 4. 函数命名不清晰

\`\`\`cpp
// 不好的命名
int f(int x);           // 不清楚功能
void process();         // 过于模糊
void data();            // 名词，不像函数

// 好的命名
int calculateSquare(int x);
void processUserData();
void loadData();
\`\`\`

#### 5. 函数体过长

\`\`\`cpp
// 不好的设计：函数太长
void processOrder(Order& order) {
    // 验证订单（20行）
    // 计算价格（30行）
    // 更新库存（25行）
    // 发送通知（15行）
    // 记录日志（10行）
    // 总共100行
}

// 更好的设计：拆分成多个函数
void processOrder(Order& order) {
    if (!validateOrder(order)) return;
    calculatePrice(order);
    updateInventory(order);
    sendNotification(order);
    logOrder(order);
}
\`\`\`

### 深入理解

#### 函数调用的底层机制

当函数被调用时，编译器会执行以下步骤：

1. **参数压栈**：将实参从右向左压入栈中
2. **保存返回地址**：将调用指令的下一条指令地址压栈
3. **跳转执行**：跳转到函数代码开始执行
4. **建立栈帧**：为局部变量分配空间
5. **执行函数体**：运行函数代码
6. **清理栈帧**：释放局部变量空间
7. **返回**：根据返回地址跳回调用处

\`\`\`
栈帧结构：
┌─────────────────┐
│ 参数n           │
│ ...             │
│ 参数1           │
│ 返回地址        │
│ 保存的寄存器    │
│ 局部变量        │
│ 临时空间        │
└─────────────────┘
\`\`\`

#### 函数的链接过程

函数声明和定义分离的好处：

\`\`\`cpp
// math.h - 头文件（声明）
#ifndef MATH_H
#define MATH_H
int add(int a, int b);  // 告诉编译器函数存在
#endif

// math.cpp - 源文件（定义）
#include "math.h"
int add(int a, int b) {  // 实际实现
    return a + b;
}

// main.cpp
#include "math.h"
int main() {
    int result = add(3, 5);  // 链接时找到add的实现
    return 0;
}
\`\`\`

编译过程：
1. **预处理**：展开#include，处理宏
2. **编译**：每个.cpp文件编译成.o文件
3. **链接**：将所有.o文件链接成可执行文件

#### 内联展开 vs 函数调用

\`\`\`cpp
// 普通函数调用
int square(int n) { return n * n; }

int main() {
    int x = square(5);  // 生成调用指令
    return 0;
}

// 内联展开后（编译器优化）
int main() {
    int x = 5 * 5;  // 直接计算，无调用开销
    return 0;
}
\`\`\`

#### 函数重载的内部实现

编译器使用**名称修饰（Name Mangling）**来区分重载函数：

\`\`\`cpp
// 源代码
void print(int n);
void print(double d);
void print(const std::string& s);

// 编译后的内部名称（示意）
void _Z5printi(int n);        // print(int)
void _Z5printd(double d);     // print(double)
void _Z5printRKSs(const string& s);  // print(string)
\`\`\`

#### 函数指针的本质

函数指针存储的是函数代码在内存中的地址：

\`\`\`cpp
int add(int a, int b) { return a + b; }

int main() {
    int (*fp)(int, int) = add;
    
    // fp存储的是add函数的入口地址
    std::cout << "函数地址: " << reinterpret_cast<void*>(fp) << std::endl;
    
    // 通过地址调用函数
    int result = fp(3, 4);
    return 0;
}
\`\`\`

#### 尾调用优化（TCO）

当函数的最后操作是调用另一个函数时，编译器可以优化为跳转：

\`\`\`cpp
// 非尾调用
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 乘法在递归之后
}

// 尾调用形式
int factorialTail(int n, int acc = 1) {
    if (n <= 1) return acc;
    return factorialTail(n - 1, n * acc);  // 递归是最后操作
}
\`\`\`

尾调用优化后，不会增加栈深度，可以避免栈溢出。`,
            examples: [
                {
                    title: '基础函数示例',
                    code: `#include <iostream>
#include <string>

// 无参数无返回值
void printWelcome() {
    std::cout << "==================" << std::endl;
    std::cout << "  欢迎学习C++函数  " << std::endl;
    std::cout << "==================" << std::endl;
}

// 有参数有返回值
int square(int n) {
    return n * n;
}

// 多参数函数
int max(int a, int b) {
    return (a > b) ? a : b;
}

// 字符串参数
std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    // 调用各种函数
    printWelcome();
    
    std::cout << "5的平方: " << square(5) << std::endl;
    std::cout << "10和20的最大值: " << max(10, 20) << std::endl;
    std::cout << greet("C++学习者") << std::endl;
    
    return 0;
}`
                },
                {
                    title: '函数声明与定义分离',
                    code: `#include <iostream>

// 函数声明（原型）
int factorial(int n);
bool isPositive(int n);
void printResult(int value, const std::string& label);

int main() {
    // 在main之前声明，可以在main中调用
    int num = 5;
    
    if (isPositive(num)) {
        int result = factorial(num);
        printResult(result, "阶乘");
    }
    
    return 0;
}

// 函数定义
int factorial(int n) {
    if (n <= 1) return 1;
    int result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

bool isPositive(int n) {
    return n > 0;
}

void printResult(int value, const std::string& label) {
    std::cout << label << "结果: " << value << std::endl;
}`
                }
            ],
            handsOn: {
                title: '动手实践：创建计算器函数',
                description: '创建一个简单的计算器，实现加减乘除四个函数',
                instructions: [
                    '创建四个函数：add、subtract、multiply、divide',
                    '每个函数接收两个double参数，返回double结果',
                    'divide函数需要处理除数为0的情况，返回0',
                    '在main函数中测试所有运算'
                ],
                hints: [
                    '除法函数需要先检查除数是否为0',
                    '使用if语句进行条件判断',
                    '函数返回类型为double'
                ],
                solution: `#include <iostream>

double add(double a, double b) {
    return a + b;
}

double subtract(double a, double b) {
    return a - b;
}

double multiply(double a, double b) {
    return a * b;
}

double divide(double a, double b) {
    if (b == 0) {
        std::cout << "错误：除数不能为0" << std::endl;
        return 0;
    }
    return a / b;
}

int main() {
    double x = 10.0, y = 3.0;
    
    std::cout << x << " + " << y << " = " << add(x, y) << std::endl;
    std::cout << x << " - " << y << " = " << subtract(x, y) << std::endl;
    std::cout << x << " * " << y << " = " << multiply(x, y) << std::endl;
    std::cout << x << " / " << y << " = " << divide(x, y) << std::endl;
    std::cout << x << " / 0 = " << divide(x, 0) << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '以下哪个是正确的函数声明？',
                    options: [
                        'A. int myFunction()',
                        'B. myFunction() int',
                        'C. void myFunction',
                        'D. function int myFunction()'
                    ],
                    answer: 'A',
                    explanation: '函数声明的正确格式是：返回类型 函数名(参数列表)。选项A正确，返回类型int在前，然后是函数名和参数列表。'
                },
                {
                    type: 'single',
                    question: 'void类型的函数表示什么？',
                    options: [
                        'A. 函数返回整数',
                        'B. 函数不返回任何值',
                        'C. 函数没有参数',
                        'D. 函数返回空指针'
                    ],
                    answer: 'B',
                    explanation: 'void作为返回类型表示函数不返回任何值。void函数可以没有return语句，或者只有return;语句。'
                },
                {
                    type: 'single',
                    question: '以下代码的输出是什么？\n\nint square(int n) { return n * n; }\nint main() {\n    std::cout << square(3) + square(4);\n    return 0;\n}',
                    options: [
                        'A. 7',
                        'B. 12',
                        'C. 25',
                        'D. 49'
                    ],
                    answer: 'C',
                    explanation: 'square(3)返回9，square(4)返回16，9 + 16 = 25。函数可以在表达式中直接调用。'
                },
                {
                    type: 'single',
                    question: '关于函数参数，以下说法正确的是？',
                    options: [
                        'A. 函数必须至少有一个参数',
                        'B. 参数名在声明和定义中必须相同',
                        'C. 函数可以有零个或多个参数',
                        'D. 参数只能是基本数据类型'
                    ],
                    answer: 'C',
                    explanation: '函数可以有零个或多个参数。无参数函数使用空括号()。参数名在声明中可以省略，参数可以是任何数据类型。'
                },
                {
                    type: 'single',
                    question: '局部变量的作用域是什么？',
                    options: [
                        'A. 整个程序',
                        'B. 定义它的源文件',
                        'C. 定义它的函数内部',
                        'D. 从定义处到程序结束'
                    ],
                    answer: 'C',
                    explanation: '局部变量在函数内部定义，只在该函数内部有效。函数执行完毕后，局部变量被销毁。'
                }
            ],
            references: [
                {
                    title: 'C++ Primer 第6章：函数',
                    url: 'https://www.informit.com/store/c-plus-plus-primer-9780321714114'
                },
                {
                    title: 'C++ 函数教程',
                    url: 'https://www.learncpp.com/cpp-tutorial/introduction-to-functions/'
                }
            ],
            assistantTips: '函数是C++程序的基本构建块。建议从简单函数开始练习，逐步掌握参数传递和返回值的使用。记住"单一职责"原则，让每个函数只做一件事。'
        },
        {
            id: '6.2',
            title: '参数传递（值传递）',
            duration: '25分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 参数传递（值传递）

### 什么是值传递

**值传递**是最基本的参数传递方式：函数接收的是实参的**副本**，而不是实参本身。

\`\`\`cpp
void doubleValue(int x) {
    x = x * 2;  // 修改的是副本
}

int main() {
    int num = 5;
    doubleValue(num);
    std::cout << num;  // 输出5，原值未改变
    return 0;
}
\`\`\`

### 值传递的工作原理

\`\`\`
调用函数时：
┌─────────┐         ┌─────────┐
│ 实参 num │ ──复制──→ │ 形参 x  │
│   = 5   │         │   = 5   │
└─────────┘         └─────────┘
    原值               副本
  （不变）           （可修改）
\`\`\`

### 值传递的特点

#### 1. 形参是实参的副本

\`\`\`cpp
#include <iostream>

void modify(int x) {
    std::cout << "函数内修改前: " << x << std::endl;
    x = 100;
    std::cout << "函数内修改后: " << x << std::endl;
}

int main() {
    int num = 10;
    std::cout << "调用前: " << num << std::endl;
    modify(num);
    std::cout << "调用后: " << num << std::endl;
    
    return 0;
}
// 输出：
// 调用前: 10
// 函数内修改前: 10
// 函数内修改后: 100
// 调用后: 10  ← 原值未改变
\`\`\`

#### 2. 函数内修改不影响原值

\`\`\`cpp
void tryToChange(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    std::cout << "函数内: a=" << a << ", b=" << b << std::endl;
}

int main() {
    int x = 1, y = 2;
    tryToChange(x, y);
    std::cout << "函数外: x=" << x << ", y=" << y << std::endl;
    return 0;
}
// 输出：
// 函数内: a=2, b=1
// 函数外: x=1, y=2  ← 原值未交换
\`\`\`

#### 3. 值传递的优缺点

**优点：**
- 简单直观，不易出错
- 保护原数据不被意外修改
- 函数调用无副作用

**缺点：**
- 复制大对象时开销大
- 无法修改原值

### 何时使用值传递

#### 适合值传递的情况

1. **基本数据类型**（int, double, char等）
2. **不需要修改原值**
3. **对象较小**

\`\`\`cpp
// 基本类型适合值传递
int square(int n) {
    return n * n;
}

double calculate(double x, double y) {
    return x * x + y * y;
}

bool isEven(int number) {
    return number % 2 == 0;
}
\`\`\`

#### 不适合值传递的情况

1. **大型对象**（数组、大结构体）
2. **需要修改原值**
3. **字符串或容器**

\`\`\`cpp
// 不推荐：复制整个vector开销大
void printVector(std::vector<int> v) {  // 复制整个vector
    for (int n : v) {
        std::cout << n << " ";
    }
}

// 推荐：使用const引用（后续章节讲解）
void printVector(const std::vector<int>& v) {  // 不复制
    for (int n : v) {
        std::cout << n << " ";
    }
}
\`\`\`

### 指针参数与值传递

传递指针也是值传递，但可以通过指针修改原值：

\`\`\`cpp
void doubleValue(int* p) {
    *p = *p * 2;  // 通过解引用修改原值
}

int main() {
    int num = 5;
    doubleValue(&num);  // 传递地址
    std::cout << num;   // 输出10
    return 0;
}
\`\`\`

### 值传递的内存分析

\`\`\`cpp
void process(int a, int b) {
    // 函数调用时，栈上分配空间给a和b
    a = a + b;
    b = a - b;
}

int main() {
    int x = 10, y = 20;
    process(x, y);
    // 函数返回后，a和b的空间被释放
    return 0;
}
\`\`\`

内存布局：
\`\`\`
main函数栈帧：
┌────────────┐
│ x = 10     │
│ y = 20     │
└────────────┘

process函数栈帧（调用时创建）：
┌────────────┐
│ a = 10     │ ← x的副本
│ b = 20     │ ← y的副本
└────────────┘
\`\`\`

### 实践建议

1. **小对象用值传递**：int, double, char等
2. **大对象用引用**：避免复制开销
3. **需要修改用指针或引用**
4. **明确函数意图**：值传递暗示不修改原值

### 常见错误

#### 1. 期望值传递能修改原值

\`\`\`cpp
// 错误：期望修改原值
void increment(int n) {
    n++;  // 只修改了副本
}

int main() {
    int x = 5;
    increment(x);
    std::cout << x;  // 仍然是5，不是6
}

// 正确：使用引用或指针
void increment(int& n) {
    n++;  // 修改原值
}
\`\`\`

#### 2. 大对象值传递导致性能问题

\`\`\`cpp
// 不好的设计：复制整个vector
void printVector(std::vector<int> v) {  // 复制开销大
    for (int n : v) {
        std::cout << n << " ";
    }
}

// 正确：使用const引用
void printVector(const std::vector<int>& v) {  // 无复制
    for (int n : v) {
        std::cout << n << " ";
    }
}
\`\`\`

#### 3. 指针参数忘记判空

\`\`\`cpp
// 危险：没有检查空指针
void process(int* p) {
    *p = 10;  // 如果p是nullptr会崩溃
}

// 正确：检查空指针
void process(int* p) {
    if (p != nullptr) {
        *p = 10;
    }
}
\`\`\`

#### 4. 误解指针参数的传递方式

\`\`\`cpp
// 错误理解：以为可以修改指针本身
void allocate(int* p, int size) {
    p = new int[size];  // 只修改了p的副本
}

int main() {
    int* arr = nullptr;
    allocate(arr, 10);
    // arr仍然是nullptr！
}

// 正确：使用指针的引用或双重指针
void allocate(int*& p, int size) {
    p = new int[size];  // 修改原指针
}
\`\`\`

#### 5. 字符串值传递

\`\`\`cpp
// 不好的设计：复制整个字符串
void printMessage(std::string msg) {  // 复制开销
    std::cout << msg << std::endl;
}

// 正确：使用const引用
void printMessage(const std::string& msg) {  // 无复制
    std::cout << msg << std::endl;
}
\`\`\`

### 深入理解

#### 值传递的内存布局

\`\`\`
调用 process(x, y) 时：

调用前：
┌────────────┐
│ x = 10     │ ← main的栈
│ y = 20     │
└────────────┘

调用时（创建副本）：
┌────────────┐
│ x = 10     │ ← main的栈
│ y = 20     │
└────────────┘
┌────────────┐
│ a = 10     │ ← process的栈（副本）
│ b = 20     │
└────────────┘

返回后：
┌────────────┐
│ x = 10     │ ← main的栈（不变）
│ y = 20     │
└────────────┘
\`\`\`

#### 复制构造函数的调用

值传递自定义类型时会调用复制构造函数：

\`\`\`cpp
class BigObject {
public:
    BigObject() { std::cout << "构造" << std::endl; }
    BigObject(const BigObject& other) {
        std::cout << "复制构造" << std::endl;
        // 复制所有成员...
    }
};

void process(BigObject obj) {  // 调用复制构造函数
    // ...
}

int main() {
    BigObject obj;  // 输出：构造
    process(obj);   // 输出：复制构造
}
\`\`\`

#### 编译器优化：复制省略

现代编译器会优化不必要的复制：

\`\`\`cpp
BigObject createObject() {
    return BigObject();  // 可能直接在调用者处构造
}

int main() {
    BigObject obj = createObject();  // 可能无复制
}
\`\`\`

#### 寄存器传递优化

对于小对象，编译器可能通过寄存器传递：

\`\`\`cpp
// 源代码
int add(int a, int b) {
    return a + b;
}

// 可能的汇编代码（示意）
// mov eax, [a]    ; 参数a在寄存器中
// add eax, [b]    ; 参数b在寄存器中
// ret             ; 返回值在eax中
\`\`\`

#### ABI（应用程序二进制接口）

不同平台有不同的参数传递规则：

\`\`\`
x86（32位）：主要通过栈传递参数
x64（Windows）：前4个参数通过寄存器（rcx, rdx, r8, r9）
x64（Linux）：前6个参数通过寄存器（rdi, rsi, rdx, rcx, r8, r9）
ARM：前4个参数通过寄存器（r0-r3）
\`\`\`

#### 移动语义与值传递

C++11引入移动语义后，值传递可能触发移动而非复制：

\`\`\`cpp
void process(std::vector<int> v) {
    // v是通过复制或移动得到的
}

int main() {
    std::vector<int> data = {1, 2, 3};
    process(data);              // 复制
    process(std::move(data));   // 移动，data变为空
}
\`\`\``,
            examples: [
                {
                    title: '值传递示例',
                    code: `#include <iostream>

// 值传递：形参是实参的副本
void tryModify(int x) {
    std::cout << "函数内 - 修改前: x = " << x << std::endl;
    x = 100;
    std::cout << "函数内 - 修改后: x = " << x << std::endl;
}

// 值传递计算
int add(int a, int b) {
    return a + b;  // 使用副本计算
}

// 值传递不改变原值
void swapFail(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    std::cout << "函数内交换后: a=" << a << ", b=" << b << std::endl;
}

int main() {
    // 示例1：值传递不改变原值
    int num = 5;
    std::cout << "=== 示例1：值传递不改变原值 ===" << std::endl;
    std::cout << "调用前: num = " << num << std::endl;
    tryModify(num);
    std::cout << "调用后: num = " << num << std::endl;
    
    // 示例2：值传递用于计算
    std::cout << "\\n=== 示例2：值传递用于计算 ===" << std::endl;
    int x = 10, y = 20;
    int sum = add(x, y);
    std::cout << x << " + " << y << " = " << sum << std::endl;
    
    // 示例3：交换失败
    std::cout << "\\n=== 示例3：值传递无法交换 ===" << std::endl;
    int a = 1, b = 2;
    std::cout << "调用前: a=" << a << ", b=" << b << std::endl;
    swapFail(a, b);
    std::cout << "调用后: a=" << a << ", b=" << b << std::endl;
    
    return 0;
}`
                },
                {
                    title: '指针参数实现修改',
                    code: `#include <iostream>

// 通过指针参数修改原值
void doubleValue(int* p) {
    if (p != nullptr) {
        *p = *p * 2;
    }
}

// 通过指针交换两个值
void swapByPointer(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// 值传递：无法修改
void swapByValue(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    std::cout << "=== 指针参数 vs 值传递 ===" << std::endl;
    
    // 使用指针修改
    int num = 5;
    std::cout << "修改前: num = " << num << std::endl;
    doubleValue(&num);
    std::cout << "指针修改后: num = " << num << std::endl;
    
    // 使用指针交换
    int x = 10, y = 20;
    std::cout << "\\n交换前: x=" << x << ", y=" << y << std::endl;
    swapByPointer(&x, &y);
    std::cout << "指针交换后: x=" << x << ", y=" << y << std::endl;
    
    // 值传递交换失败
    int a = 1, b = 2;
    std::cout << "\\n交换前: a=" << a << ", b=" << b << std::endl;
    swapByValue(a, b);
    std::cout << "值传递交换后: a=" << a << ", b=" << b << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：理解值传递',
                description: '编写函数验证值传递的特性',
                instructions: [
                    '编写一个函数increment，尝试通过值传递将参数加1',
                    '编写一个函数incrementByPointer，通过指针参数将值加1',
                    '在main中测试两个函数，观察原值的变化',
                    '输出每个步骤的结果'
                ],
                hints: [
                    '值传递的函数无法修改原值',
                    '指针参数需要使用解引用(*)来访问原值',
                    '调用指针参数函数时需要传递地址(&)'
                ],
                solution: `#include <iostream>

// 值传递：无法修改原值
void increment(int n) {
    n = n + 1;
    std::cout << "值传递函数内: n = " << n << std::endl;
}

// 指针参数：可以修改原值
void incrementByPointer(int* p) {
    *p = *p + 1;
    std::cout << "指针函数内: *p = " << *p << std::endl;
}

int main() {
    int value = 10;
    
    // 测试值传递
    std::cout << "=== 测试值传递 ===" << std::endl;
    std::cout << "调用前: value = " << value << std::endl;
    increment(value);
    std::cout << "调用后: value = " << value << std::endl;
    
    // 测试指针参数
    std::cout << "\\n=== 测试指针参数 ===" << std::endl;
    std::cout << "调用前: value = " << value << std::endl;
    incrementByPointer(&value);
    std::cout << "调用后: value = " << value << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '值传递时，函数内修改形参，实参会怎样？',
                    options: [
                        'A. 实参也会被修改',
                        'B. 实参不会被修改',
                        'C. 编译错误',
                        'D. 运行时错误'
                    ],
                    answer: 'B',
                    explanation: '值传递时，形参是实参的副本，修改形参不会影响实参的值。'
                },
                {
                    type: 'single',
                    question: '以下代码输出什么？\n\nvoid change(int x) { x = 100; }\nint main() {\n    int n = 5;\n    change(n);\n    std::cout << n;\n}',
                    options: [
                        'A. 5',
                        'B. 100',
                        'C. 0',
                        'D. 编译错误'
                    ],
                    answer: 'A',
                    explanation: '值传递不会修改原值，n仍然是5。change函数修改的是n的副本。'
                },
                {
                    type: 'single',
                    question: '以下哪种情况最适合使用值传递？',
                    options: [
                        'A. 需要修改原值',
                        'B. 传递大型数组',
                        'C. 传递int类型的小数值',
                        'D. 传递大型结构体'
                    ],
                    answer: 'C',
                    explanation: '基本数据类型（如int）适合值传递，因为复制开销小，且不需要修改原值。大型对象应该使用引用传递。'
                },
                {
                    type: 'single',
                    question: '值传递的主要优点是什么？',
                    options: [
                        'A. 可以修改原值',
                        'B. 节省内存',
                        'C. 保护原数据不被意外修改',
                        'D. 提高运行速度'
                    ],
                    answer: 'C',
                    explanation: '值传递的主要优点是保护原数据不被意外修改，因为函数操作的是副本而非原值。'
                },
                {
                    type: 'single',
                    question: '以下代码的输出是什么？\n\nint add(int a, int b) { return a + b; }\nint main() {\n    int x = 3, y = 4;\n    std::cout << add(x, y) << " " << x << " " << y;\n}',
                    options: [
                        'A. 7 3 4',
                        'B. 7 7 7',
                        'C. 3 4 7',
                        'D. 编译错误'
                    ],
                    answer: 'A',
                    explanation: 'add函数返回7，但值传递不会修改x和y的值，所以输出7 3 4。'
                }
            ],
            references: [
                {
                    title: 'C++ 参数传递详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/pass-by-value/'
                },
                {
                    title: '值传递 vs 引用传递',
                    url: 'https://www.geeksforgeeks.org/passing-by-value-vs-passing-by-reference-in-cpp/'
                }
            ],
            assistantTips: '值传递是C++中最基本的参数传递方式。理解值传递的关键是记住"形参是实参的副本"。对于小对象，值传递简单安全；对于大对象或需要修改的情况，应该使用引用或指针。'
        },
        {
            id: '6.3',
            title: '参数传递（引用传递）',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 参数传递（引用传递）

### 什么是引用传递

**引用传递**：形参是实参的**别名**，操作形参就是操作实参本身。

\`\`\`cpp
void doubleValue(int& x) {  // 注意 &
    x = x * 2;  // 直接修改原值
}

int main() {
    int num = 5;
    doubleValue(num);
    std::cout << num;  // 输出10，原值被修改
    return 0;
}
\`\`\`

### 引用传递的工作原理

\`\`\`
调用函数时：
┌─────────┐
│ 实参 num │ ←─────┐
│   = 5   │       │
└─────────┘       │
                  │ 引用（别名）
┌─────────┐       │
│ 形参 x  │ ──────┘
│ (别名)  │
└─────────┘
\`\`\`

### 引用传递的特点

#### 1. 形参是实参的别名

\`\`\`cpp
#include <iostream>

void modify(int& x) {
    std::cout << "函数内修改前: " << x << std::endl;
    x = 100;
    std::cout << "函数内修改后: " << x << std::endl;
}

int main() {
    int num = 10;
    std::cout << "调用前: " << num << std::endl;
    modify(num);
    std::cout << "调用后: " << num << std::endl;
    
    return 0;
}
// 输出：
// 调用前: 10
// 函数内修改前: 10
// 函数内修改后: 100
// 调用后: 100  ← 原值被修改
\`\`\`

#### 2. 可以修改原值

\`\`\`cpp
// 使用引用实现交换
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 1, y = 2;
    swap(x, y);
    std::cout << "x=" << x << ", y=" << y << std::endl;  // x=2, y=1
    return 0;
}
\`\`\`

#### 3. 避免复制开销

\`\`\`cpp
#include <iostream>
#include <string>

// 值传递：复制整个字符串
void printByValue(std::string s) {
    std::cout << s << std::endl;
}

// 引用传递：不复制
void printByReference(const std::string& s) {
    std::cout << s << std::endl;
}

int main() {
    std::string text = "这是一个很长的字符串...";
    
    // 推荐：使用const引用，避免复制
    printByReference(text);
    
    return 0;
}
\`\`\`

### const 引用

使用 \`const\` 修饰引用参数，可以避免复制，同时防止修改：

\`\`\`cpp
// const引用：只读，不修改
void printString(const std::string& s) {
    std::cout << s << std::endl;
    // s = "hello";  // 错误！不能修改const引用
}

// 计算字符串长度
size_t getStringLength(const std::string& s) {
    return s.length();  // 只读操作
}
\`\`\`

### 引用传递 vs 值传递

| 特性 | 值传递 | 引用传递 |
|------|--------|----------|
| 语法 | \`void f(int x)\` | \`void f(int& x)\` |
| 传递内容 | 副本 | 别名 |
| 能否修改原值 | 不能 | 能 |
| 复制开销 | 有 | 无 |
| 适合场景 | 小对象、不修改 | 大对象、需修改 |

### 何时使用引用传递

#### 1. 需要修改实参

\`\`\`cpp
void increment(int& n) {
    n++;
}

void toUpperCase(std::string& s) {
    for (char& c : s) {
        c = std::toupper(c);
    }
}
\`\`\`

#### 2. 避免大对象复制

\`\`\`cpp
// 推荐：const引用传递大对象
void processVector(const std::vector<int>& v) {
    for (int n : v) {
        std::cout << n << " ";
    }
}

void processString(const std::string& s) {
    std::cout << "字符串长度: " << s.length() << std::endl;
}
\`\`\`

#### 3. 需要返回多个值

\`\`\`cpp
// 通过引用参数返回多个值
void getMinMax(const std::vector<int>& v, int& min, int& max) {
    min = v[0];
    max = v[0];
    for (int n : v) {
        if (n < min) min = n;
        if (n > max) max = n;
    }
}

int main() {
    std::vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6};
    int minVal, maxVal;
    getMinMax(data, minVal, maxVal);
    std::cout << "最小值: " << minVal << ", 最大值: " << maxVal << std::endl;
    return 0;
}
\`\`\`

### 引用传递的注意事项

#### 1. 不能传递临时值

\`\`\`cpp
void increment(int& n) {
    n++;
}

int main() {
    int x = 5;
    increment(x);      // 正确
    // increment(5);   // 错误！不能传递字面量
    // increment(x+1); // 错误！不能传递表达式结果
    return 0;
}
\`\`\`

#### 2. const引用可以绑定临时值

\`\`\`cpp
void print(const int& n) {
    std::cout << n << std::endl;
}

int main() {
    print(5);      // 正确！const引用可以绑定临时值
    print(3 + 2);  // 正确！
    return 0;
}
\`\`\`

### 最佳实践

1. **小对象用值传递**：int, double, char等
2. **大对象用const引用**：string, vector, 自定义类
3. **需要修改用非const引用**
4. **输出参数用引用或指针**

\`\`\`cpp
// 推荐的参数传递方式
void process(int value);                      // 小对象，值传递
void process(const std::string& str);         // 大对象，const引用
void modify(std::vector<int>& vec);           // 需要修改，非const引用
void getResult(int& out1, double& out2);      // 输出参数，引用
\`\`\`

### 常见错误

#### 1. 返回局部变量的引用

\`\`\`cpp
// 错误：返回局部变量的引用
int& getValue() {
    int value = 10;
    return value;  // value在函数返回后被销毁
}

// 正确：返回值
int getValue() {
    int value = 10;
    return value;
}

// 或返回静态变量
int& getValue() {
    static int value = 10;
    return value;
}
\`\`\`

#### 2. 悬空引用

\`\`\`cpp
// 危险：引用指向已销毁的对象
int& getRef() {
    int x = 10;
    return x;  // 返回局部变量的引用
}

int main() {
    int& ref = getRef();  // ref是悬空引用
    std::cout << ref;     // 未定义行为
}

// 正确：确保引用的对象存在
int globalValue = 10;
int& getRef() {
    return globalValue;
}
\`\`\`

#### 3. 临时对象的非const引用

\`\`\`cpp
// 错误：非const引用不能绑定临时对象
void process(std::string& str);

int main() {
    process(std::string("hello"));  // 错误！
    process("hello");               // 错误！
}

// 正确：使用const引用
void process(const std::string& str);

int main() {
    process(std::string("hello"));  // 正确
    process("hello");               // 正确
}
\`\`\`

#### 4. 引用未初始化

\`\`\`cpp
// 错误：引用必须初始化
int& ref;  // 编译错误！

// 正确：引用必须绑定到对象
int x = 10;
int& ref = x;
\`\`\`

#### 5. 误解引用的本质

\`\`\`cpp
// 错误理解：以为引用是独立对象
int x = 10;
int& ref1 = x;
int& ref2 = ref1;  // ref2也绑定到x，不是ref1

std::cout << &x << " " << &ref1 << " " << &ref2;  // 地址相同

// 引用没有自己的地址，它就是被引用对象的别名
\`\`\`

### 深入理解

#### 引用的底层实现

引用通常通过指针实现：

\`\`\`cpp
// 源代码
int x = 10;
int& ref = x;
ref = 20;

// 编译器可能的实现（示意）
int x = 10;
int* const ref = &x;  // 常量指针
*ref = 20;            // 通过指针修改
\`\`\`

#### 引用 vs 指针的底层差异

\`\`\`cpp
// 引用
int x = 10;
int& ref = x;  // 汇编：lea ref, [x]  ; 加载x的地址

// 指针
int* ptr = &x;  // 汇编：mov ptr, offset x  ; 存储x的地址

// 使用
ref = 20;  // 汇编：mov [ref], 20
*ptr = 20; // 汇编：mov [ptr], 20
\`\`\`

#### 引用折叠规则

在模板和typedef中，引用可以折叠：

\`\`\`cpp
typedef int&  LRef;
typedef int&& RRef;

int n = 10;

LRef&  r1 = n;  // int& &  → int&
LRef&& r2 = n;  // int& && → int&
RRef&  r3 = n;  // int&& & → int&
RRef&& r4 = 10; // int&& &&→ int&&

// 规则：所有引用折叠为引用，除了 && && → &&
\`\`\`

#### 完美转发

使用std::forward实现参数的完美转发：

\`\`\`cpp
template<typename T>
void wrapper(T&& arg) {
    // arg总是左值，即使T是右值引用类型
    process(std::forward<T>(arg));  // 保持arg的值类别
}

void process(int& x) { std::cout << "左值" << std::endl; }
void process(int&& x) { std::cout << "右值" << std::endl; }

int main() {
    int x = 10;
    wrapper(x);   // 输出：左值
    wrapper(10);  // 输出：右值
}
\`\`\`

#### 引用限定的成员函数

C++11允许根据*this是左值还是右值选择成员函数：

\`\`\`cpp
class String {
    std::string data;
public:
    // 左值对象调用：返回引用
    char& operator[](size_t i) & {
        return data[i];
    }
    
    // 右值对象调用：返回值
    char operator[](size_t i) && {
        return data[i];
    }
};

int main() {
    String s;
    s[0] = 'a';           // 调用左值版本
    // String()[0] = 'a'; // 错误！右值版本返回值
}
\`\`\`

#### const引用的生命周期延长

const引用绑定临时对象时，会延长临时对象的生命周期：

\`\`\`cpp
int main() {
    const std::string& ref = std::string("hello");
    // 临时对象的生命周期延长到ref的作用域结束
    std::cout << ref;  // 正确
    
    // 非const引用不会延长生命周期
    // std::string& ref2 = std::string("world");  // 错误！
}
\`\`\`

#### 引用与多态

引用支持多态，是实现运行时多态的常用方式：

\`\`\`cpp
class Base {
public:
    virtual void show() { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    void show() override { std::cout << "Derived" << std::endl; }
};

void display(Base& obj) {
    obj.show();  // 多态调用
}

int main() {
    Derived d;
    display(d);  // 输出：Derived
}
\`\`\``,
            examples: [
                {
                    title: '引用传递基础示例',
                    code: `#include <iostream>
#include <string>

// 引用传递：可以修改原值
void doubleValue(int& n) {
    n = n * 2;
}

// 引用传递实现交换
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

// const引用：只读，不复制
void printInfo(const std::string& name, const int& age) {
    std::cout << "姓名: " << name << ", 年龄: " << age << std::endl;
}

int main() {
    // 示例1：修改原值
    std::cout << "=== 修改原值 ===" << std::endl;
    int num = 5;
    std::cout << "修改前: " << num << std::endl;
    doubleValue(num);
    std::cout << "修改后: " << num << std::endl;
    
    // 示例2：交换值
    std::cout << "\\n=== 交换值 ===" << std::endl;
    int x = 10, y = 20;
    std::cout << "交换前: x=" << x << ", y=" << y << std::endl;
    swap(x, y);
    std::cout << "交换后: x=" << x << ", y=" << y << std::endl;
    
    // 示例3：const引用
    std::cout << "\\n=== const引用 ===" << std::endl;
    std::string name = "张三";
    int age = 25;
    printInfo(name, age);
    
    return 0;
}`
                },
                {
                    title: '引用传递实现多返回值',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

// 通过引用参数返回多个值
void analyzeVector(const std::vector<int>& v, 
                   int& min, int& max, double& avg) {
    if (v.empty()) {
        min = max = 0;
        avg = 0.0;
        return;
    }
    
    min = v[0];
    max = v[0];
    double sum = 0;
    
    for (int n : v) {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
    }
    
    avg = sum / v.size();
}

// 修改vector内容
void sortAndReverse(std::vector<int>& v) {
    std::sort(v.begin(), v.end());
    std::reverse(v.begin(), v.end());
}

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 分析vector
    int minVal, maxVal;
    double average;
    analyzeVector(numbers, minVal, maxVal, average);
    
    std::cout << "原始数据: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    std::cout << "最小值: " << minVal << std::endl;
    std::cout << "最大值: " << maxVal << std::endl;
    std::cout << "平均值: " << average << std::endl;
    
    // 修改vector
    sortAndReverse(numbers);
    std::cout << "\\n排序并反转后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：引用传递应用',
                description: '使用引用传递实现实用函数',
                instructions: [
                    '编写函数clamp，将值限制在[min, max]范围内',
                    '编写函数parseString，将字符串分割成单词并存入vector',
                    '使用引用传递修改参数',
                    '测试所有函数'
                ],
                hints: [
                    'clamp函数需要三个参数：值、最小值、最大值',
                    'parseString可以使用string的find方法',
                    '记得使用const引用传递不需要修改的大对象'
                ],
                solution: `#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// 将值限制在范围内
void clamp(int& value, int min, int max) {
    if (value < min) value = min;
    if (value > max) value = max;
}

// 分割字符串为单词
void parseString(const std::string& str, std::vector<std::string>& words) {
    std::istringstream iss(str);
    std::string word;
    while (iss >> word) {
        words.push_back(word);
    }
}

int main() {
    // 测试clamp
    std::cout << "=== 测试clamp ===" << std::endl;
    int value1 = 5, value2 = 15, value3 = -5;
    
    clamp(value1, 0, 10);
    clamp(value2, 0, 10);
    clamp(value3, 0, 10);
    
    std::cout << "5 限制在[0,10]: " << value1 << std::endl;
    std::cout << "15 限制在[0,10]: " << value2 << std::endl;
    std::cout << "-5 限制在[0,10]: " << value3 << std::endl;
    
    // 测试parseString
    std::cout << "\\n=== 测试parseString ===" << std::endl;
    std::string text = "Hello World C++ Programming";
    std::vector<std::string> words;
    parseString(text, words);
    
    std::cout << "原字符串: " << text << std::endl;
    std::cout << "分割后的单词: ";
    for (const auto& w : words) {
        std::cout << "[" << w << "] ";
    }
    std::cout << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '引用传递时，函数内修改形参，实参会怎样？',
                    options: [
                        'A. 实参不会被修改',
                        'B. 实参也会被修改',
                        'C. 编译错误',
                        'D. 运行时错误'
                    ],
                    answer: 'B',
                    explanation: '引用传递时，形参是实参的别名，修改形参就是修改实参本身。'
                },
                {
                    type: 'single',
                    question: '以下哪个是正确的引用参数声明？',
                    options: [
                        'A. void f(int& x)',
                        'B. void f(int &x)',
                        'C. void f(int & x)',
                        'D. 以上都正确'
                    ],
                    answer: 'D',
                    explanation: '引用符号&可以放在类型名后、变量名前，或中间有空格，三种写法都正确。'
                },
                {
                    type: 'single',
                    question: '以下代码输出什么？\n\nvoid swap(int& a, int& b) { int t=a; a=b; b=t; }\nint main() {\n    int x=1, y=2;\n    swap(x, y);\n    std::cout << x << y;\n}',
                    options: [
                        'A. 12',
                        'B. 21',
                        'C. 11',
                        'D. 22'
                    ],
                    answer: 'B',
                    explanation: '引用传递实现了真正的交换，x变为2，y变为1，输出21。'
                },
                {
                    type: 'single',
                    question: 'const引用的主要作用是什么？',
                    options: [
                        'A. 允许修改原值',
                        'B. 避免复制且防止修改',
                        'C. 增加复制开销',
                        'D. 只能用于基本类型'
                    ],
                    answer: 'B',
                    explanation: 'const引用可以避免复制大对象的开销，同时防止函数内部修改原值。'
                },
                {
                    type: 'single',
                    question: '以下哪种情况应该使用引用传递？',
                    options: [
                        'A. 传递int类型的小数值',
                        'B. 传递大型vector并需要修改',
                        'C. 传递字面量常量',
                        'D. 函数不需要修改参数'
                    ],
                    answer: 'B',
                    explanation: '大型对象应该使用引用传递避免复制开销，需要修改时使用非const引用。'
                }
            ],
            references: [
                {
                    title: 'C++ 引用传递详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/pass-by-reference/'
                },
                {
                    title: 'const引用的使用',
                    url: 'https://en.cppreference.com/w/cpp/language/reference'
                }
            ],
            assistantTips: '引用传递是C++的重要特性。记住：引用是别名，不是副本。对于大对象，优先使用const引用；需要修改时使用非const引用。引用传递让代码更高效、更清晰。'
        },
        {
            id: '6.4',
            title: '返回值类型',
            duration: '25分钟',
            difficulty: '基础',
            xp: 110,
            estimatedXp: 320,
            concepts: `## 返回值类型

### 函数返回值基础

函数可以返回一个值给调用者，返回值的类型由函数声明指定：

\`\`\`cpp
返回类型 函数名(参数) {
    // ...
    return 返回值;
}
\`\`\`

### 基本返回类型

#### 1. 返回基本类型

\`\`\`cpp
// 返回int
int add(int a, int b) {
    return a + b;
}

// 返回double
double divide(double a, double b) {
    return a / b;
}

// 返回bool
bool isEven(int n) {
    return n % 2 == 0;
}

// 返回char
char getGrade(int score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'F';
}
\`\`\`

#### 2. 返回void

\`\`\`cpp
void greet() {
    std::cout << "Hello!" << std::endl;
    // 可以没有return语句
}

void process(int n) {
    if (n < 0) {
        return;  // 提前返回，不返回任何值
    }
    std::cout << "处理: " << n << std::endl;
}
\`\`\`

### 返回引用

函数可以返回引用，避免复制：

\`\`\`cpp
// 返回引用
int& getMax(int& a, int& b) {
    return (a > b) ? a : b;
}

int main() {
    int x = 10, y = 20;
    getMax(x, y) = 100;  // 修改最大值
    std::cout << y;      // 输出100
    return 0;
}
\`\`\`

#### 返回引用的注意事项

**危险：不要返回局部变量的引用！**

\`\`\`cpp
// 错误！返回局部变量的引用
int& dangerous() {
    int local = 10;
    return local;  // local在函数返回后被销毁
}

// 正确：返回参数的引用
int& safe(int& n) {
    return n;  // n在调用者处存在
}

// 正确：返回静态变量的引用
int& getCounter() {
    static int counter = 0;
    return counter;
}
\`\`\`

### 返回指针

\`\`\`cpp
// 返回指针
int* findMax(int* arr, int size) {
    if (size == 0) return nullptr;
    
    int* maxPtr = arr;
    for (int i = 1; i < size; i++) {
        if (arr[i] > *maxPtr) {
            maxPtr = &arr[i];
        }
    }
    return maxPtr;
}

int main() {
    int data[] = {3, 1, 4, 1, 5, 9};
    int* max = findMax(data, 6);
    if (max != nullptr) {
        std::cout << "最大值: " << *max << std::endl;
    }
    return 0;
}
\`\`\`

### 返回值优化（RVO）

现代编译器会对返回值进行优化，避免不必要的复制：

\`\`\`cpp
#include <string>

std::string createString() {
    std::string s = "Hello";
    return s;  // 编译器优化：直接在调用者处构造
}

int main() {
    std::string result = createString();  // 无复制开销
    return 0;
}
\`\`\`

### 返回多个值

#### 方法1：使用引用参数

\`\`\`cpp
void divideWithRemainder(int a, int b, int& quotient, int& remainder) {
    quotient = a / b;
    remainder = a % b;
}

int main() {
    int q, r;
    divideWithRemainder(17, 5, q, r);
    std::cout << "商: " << q << ", 余数: " << r << std::endl;
    return 0;
}
\`\`\`

#### 方法2：使用结构体

\`\`\`cpp
struct DivisionResult {
    int quotient;
    int remainder;
};

DivisionResult divide(int a, int b) {
    return {a / b, a % b};  // C++11聚合初始化
}

int main() {
    auto result = divide(17, 5);
    std::cout << "商: " << result.quotient << ", 余数: " << result.remainder << std::endl;
    return 0;
}
\`\`\`

#### 方法3：使用std::pair

\`\`\`cpp
#include <utility>

std::pair<int, int> divide(int a, int b) {
    return {a / b, a % b};
}

int main() {
    auto [q, r] = divide(17, 5);  // C++17结构化绑定
    std::cout << "商: " << q << ", 余数: " << r << std::endl;
    return 0;
}
\`\`\`

#### 方法4：使用std::tuple

\`\`\`cpp
#include <tuple>

std::tuple<int, int, double> analyze(int a, int b) {
    return {a + b, a - b, (double)a / b};
}

int main() {
    auto [sum, diff, ratio] = analyze(10, 3);  // C++17
    std::cout << "和: " << sum << ", 差: " << diff << ", 比: " << ratio << std::endl;
    return 0;
}
\`\`\`

### auto返回类型（C++14）

\`\`\`cpp
// C++14：自动推导返回类型
auto add(int a, int b) {
    return a + b;  // 返回类型推导为int
}

auto createVector() {
    std::vector<int> v = {1, 2, 3};
    return v;  // 返回类型推导为std::vector<int>
}
\`\`\`

### 尾置返回类型（C++11）

\`\`\`cpp
// C++11：尾置返回类型
auto add(double a, double b) -> double {
    return a + b;
}

// 用于复杂返回类型
template<typename T, typename U>
auto add(T t, U u) -> decltype(t + u) {
    return t + u;
}
\`\`\`

### 最佳实践

1. **小对象直接返回值**：int, double等
2. **大对象返回引用或使用RVO**
3. **多返回值用结构体或tuple**
4. **避免返回局部变量的引用或指针**
5. **考虑使用auto简化代码**

### 常见错误

#### 1. 返回局部变量的引用或指针

\`\`\`cpp
// 错误：返回局部变量的引用
int& getValue() {
    int value = 10;
    return value;  // value在函数返回后被销毁
}

// 错误：返回局部变量的指针
int* getPointer() {
    int value = 10;
    return &value;  // 返回悬空指针
}

// 正确：返回值
int getValue() {
    int value = 10;
    return value;  // 返回副本
}
\`\`\`

#### 2. 返回临时对象的引用

\`\`\`cpp
// 错误：返回临时对象的引用
const std::string& getName() {
    return std::string("hello");  // 临时对象在返回后销毁
}

// 正确：返回值
std::string getName() {
    return std::string("hello");  // RVO优化
}
\`\`\`

#### 3. 忘记返回值

\`\`\`cpp
// 错误：非void函数没有return
int add(int a, int b) {
    int result = a + b;
    // 忘记return result;
}

// 正确
int add(int a, int b) {
    return a + b;
}
\`\`\`

#### 4. 返回类型与实际返回值不匹配

\`\`\`cpp
// 错误：返回类型不匹配
double divide(int a, int b) {
    if (b == 0) {
        return -1;  // 返回int，可能被截断
    }
    return (double)a / b;
}

// 正确：使用特殊值或异常
double divide(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Division by zero");
    }
    return (double)a / b;
}
\`\`\`

#### 5. 误解RVO的适用范围

\`\`\`cpp
// RVO不适用的情况
std::string getName(bool flag) {
    std::string a = "Alice";
    std::string b = "Bob";
    
    if (flag) {
        return a;  // 可能无法RVO
    } else {
        return b;  // 可能无法RVO
    }
}

// 更好的做法
std::string getName(bool flag) {
    return flag ? "Alice" : "Bob";  // 更容易优化
}
\`\`\`

### 深入理解

#### 返回值优化（RVO）的原理

编译器通过在调用者处直接构造对象来避免复制：

\`\`\`cpp
// 源代码
std::string createString() {
    return std::string("hello");
}

int main() {
    std::string s = createString();
}

// 编译器优化后（示意）
void createString(std::string* result) {
    new(result) std::string("hello");  // 直接在s的位置构造
}

int main() {
    std::string s;
    createString(&s);  // 无复制
}
\`\`\`

#### 命名返回值优化（NRVO）

对于命名变量，编译器也可以优化：

\`\`\`cpp
// 源代码
std::string createString() {
    std::string result = "hello";
    result += " world";
    return result;  // NRVO可能优化
}

// 编译器优化后（示意）
void createString(std::string* result) {
    new(result) std::string("hello");
    *result += " world";
}
\`\`\`

#### 移动语义与返回值

C++11引入移动语义后，返回局部变量会优先移动而非复制：

\`\`\`cpp
std::vector<int> createVector() {
    std::vector<int> result = {1, 2, 3};
    return result;  // 如果RVO失败，会移动而非复制
}

int main() {
    std::vector<int> v = createVector();  // 移动或RVO
}
\`\`\`

#### 返回值的生命周期

\`\`\`cpp
// 返回值是临时对象
std::string getName() {
    return "hello";
}

int main() {
    const std::string& ref = getName();  // 生命周期延长
    std::cout << ref;  // 正确
    
    std::string&& rref = getName();  // 右值引用
    std::cout << rref;  // 正确
}
\`\`\`

#### 尾置返回类型的应用

用于复杂返回类型的推导：

\`\`\`cpp
// C++11：尾置返回类型
template<typename T, typename U>
auto add(T t, U u) -> decltype(t + u) {
    return t + u;
}

// C++14：自动推导
template<typename T, typename U>
auto add(T t, U u) {
    return t + u;  // 自动推导返回类型
}

// C++11：用于迭代器
template<typename Container>
auto getIterator(Container& c) -> decltype(c.begin()) {
    return c.begin();
}
\`\`\`

#### 结构化绑定（C++17）

简化多返回值的接收：

\`\`\`cpp
#include <tuple>

std::tuple<int, double, std::string> getData() {
    return {42, 3.14, "hello"};
}

int main() {
    auto [num, pi, str] = getData();  // 结构化绑定
    std::cout << num << " " << pi << " " << str << std::endl;
}
\`\`\`

#### 返回值与异常安全

\`\`\`cpp
// 异常安全的返回
std::vector<int> createVector() {
    std::vector<int> result;
    // ... 填充result
    return result;  // 即使抛出异常，result也会被正确析构
}

// 使用RAII确保资源释放
std::unique_ptr<File> openFile(const std::string& path) {
    auto file = std::make_unique<File>(path);
    if (!file->isOpen()) {
        throw std::runtime_error("Cannot open file");
    }
    return file;  // 移动语义确保所有权转移
}
\`\`\`

#### 返回值优化标志

\`\`\`cpp
// C++17：强制RVO
std::string createString() {
    return std::string("hello");  // C++17保证RVO
}

// 注意：命名变量不保证
std::string createString(bool flag) {
    std::string result = "hello";
    if (flag) {
        result += " world";
    }
    return result;  // NRVO不保证
}
\`\`\``,
            examples: [
                {
                    title: '各种返回类型示例',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <tuple>

// 返回基本类型
int add(int a, int b) {
    return a + b;
}

// 返回bool
bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

// 返回string
std::string repeat(const std::string& s, int times) {
    std::string result;
    for (int i = 0; i < times; i++) {
        result += s;
    }
    return result;
}

// 返回引用（安全示例）
int& getElement(std::vector<int>& v, int index) {
    return v[index];
}

// 返回多个值（使用tuple）
std::tuple<int, int, double> calculateStats(int a, int b) {
    return {a + b, a * b, (double)(a + b) / 2};
}

int main() {
    // 返回基本类型
    std::cout << "5 + 3 = " << add(5, 3) << std::endl;
    
    // 返回bool
    std::cout << "7是质数? " << (isPrime(7) ? "是" : "否") << std::endl;
    
    // 返回string
    std::cout << "重复3次: " << repeat("Hi", 3) << std::endl;
    
    // 返回引用
    std::vector<int> numbers = {10, 20, 30};
    getElement(numbers, 1) = 200;  // 修改元素
    std::cout << "修改后的vector: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // 返回多个值
    auto [sum, product, average] = calculateStats(4, 6);
    std::cout << "\\n和: " << sum << ", 积: " << product << ", 平均: " << average << std::endl;
    
    return 0;
}`
                },
                {
                    title: '返回值优化与移动语义',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <utility>

class BigData {
public:
    std::vector<int> data;
    
    BigData(int size) : data(size, 0) {
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    BigData(const BigData& other) : data(other.data) {
        std::cout << "复制构造" << std::endl;
    }
    
    BigData(BigData&& other) noexcept : data(std::move(other.data)) {
        std::cout << "移动构造" << std::endl;
    }
};

// RVO：返回值优化
BigData createBigData(int size) {
    BigData result(size);  // 直接在调用者处构造
    return result;  // 编译器优化，无复制
}

// 返回移动的对象
BigData createAndMove(int size) {
    BigData result(size);
    return std::move(result);  // 显式移动
}

int main() {
    std::cout << "=== RVO示例 ===" << std::endl;
    BigData d1 = createBigData(100);  // 可能无复制
    
    std::cout << "\\n=== 移动语义示例 ===" << std::endl;
    BigData d2 = createAndMove(100);  // 移动构造
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：多返回值函数',
                description: '实现一个函数，返回数组的最小值、最大值和平均值',
                instructions: [
                    '编写函数analyzeArray，接收一个vector',
                    '返回最小值、最大值和平均值',
                    '使用std::tuple返回三个值',
                    '在main中测试并输出结果'
                ],
                hints: [
                    '使用std::tuple<int, int, double>作为返回类型',
                    'C++17可以使用结构化绑定接收返回值',
                    '平均值应该是double类型'
                ],
                solution: `#include <iostream>
#include <vector>
#include <tuple>
#include <limits>

std::tuple<int, int, double> analyzeArray(const std::vector<int>& arr) {
    if (arr.empty()) {
        return {0, 0, 0.0};
    }
    
    int minVal = arr[0];
    int maxVal = arr[0];
    long long sum = 0;
    
    for (int n : arr) {
        if (n < minVal) minVal = n;
        if (n > maxVal) maxVal = n;
        sum += n;
    }
    
    double avg = static_cast<double>(sum) / arr.size();
    return {minVal, maxVal, avg};
}

int main() {
    std::vector<int> numbers = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    
    std::cout << "数组: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    auto [minVal, maxVal, avgVal] = analyzeArray(numbers);
    
    std::cout << "最小值: " << minVal << std::endl;
    std::cout << "最大值: " << maxVal << std::endl;
    std::cout << "平均值: " << avgVal << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '以下哪个是返回引用的正确用法？',
                    options: [
                        'A. int& f() { int x=10; return x; }',
                        'B. int& f(int& n) { return n; }',
                        'C. int& f() { return 10; }',
                        'D. int& f(int n) { return n; }'
                    ],
                    answer: 'B',
                    explanation: '返回引用时，必须确保引用的对象在函数返回后仍然存在。返回参数的引用是安全的，返回局部变量的引用是危险的。'
                },
                {
                    type: 'single',
                    question: 'void函数可以包含return语句吗？',
                    options: [
                        'A. 不可以',
                        'B. 只能包含return;',
                        'C. 可以包含return;用于提前返回',
                        'D. 只能在函数末尾'
                    ],
                    answer: 'C',
                    explanation: 'void函数可以包含return;语句，用于提前退出函数，但不返回任何值。'
                },
                {
                    type: 'single',
                    question: '以下代码输出什么？\n\nint getValue() { return 42; }\nint main() {\n    int x = getValue();\n    std::cout << x;\n}',
                    options: [
                        'A. 42',
                        'B. 0',
                        'C. 编译错误',
                        'D. 运行时错误'
                    ],
                    answer: 'A',
                    explanation: 'getValue函数返回42，赋值给x，输出42。这是基本的返回值使用。'
                },
                {
                    type: 'single',
                    question: '使用std::tuple返回多个值时，C++17如何接收？',
                    options: [
                        'A. 只能使用std::get<0>(tuple)',
                        'B. 可以使用结构化绑定auto [a, b] = f()',
                        'C. 必须创建临时变量',
                        'D. 不支持多个返回值'
                    ],
                    answer: 'B',
                    explanation: 'C++17引入了结构化绑定，可以用auto [a, b, c] = f()的形式直接解包tuple。'
                },
                {
                    type: 'single',
                    question: 'RVO（返回值优化）的作用是什么？',
                    options: [
                        'A. 增加复制次数',
                        'B. 避免不必要的复制',
                        'C. 增加内存使用',
                        'D. 降低性能'
                    ],
                    answer: 'B',
                    explanation: 'RVO（Return Value Optimization）是编译器优化技术，可以避免函数返回值的不必要复制，提高性能。'
                }
            ],
            references: [
                {
                    title: 'C++ 返回值详解',
                    url: 'https://www.learncpp.com/cpp-tutorial-return-by-value-and-return-by-reference/'
                },
                {
                    title: 'RVO和移动语义',
                    url: 'https://en.cppreference.com/w/cpp/language/copy_elision'
                }
            ],
            assistantTips: '返回值类型的选择很重要：小对象直接返回值，大对象考虑引用或RVO。永远不要返回局部变量的引用或指针。C++17的结构化绑定让多返回值更优雅。'
        },
        {
            id: '6.5',
            title: '函数重载',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 函数重载

### 什么是函数重载

**函数重载**：允许定义多个同名函数，但参数列表不同。编译器根据调用时的参数选择正确的版本。

\`\`\`cpp
// 同名函数，不同参数
int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}

int add(int a, int b, int c) {
    return a + b + c;
}
\`\`\`

### 重载的条件

函数必须满足以下至少一个条件才能构成重载：

1. **参数数量不同**
2. **参数类型不同**
3. **参数顺序不同**（类型不同时）

\`\`\`cpp
// 参数数量不同
void print(int a);
void print(int a, int b);
void print(int a, int b, int c);

// 参数类型不同
void process(int n);
void process(double d);
void process(const std::string& s);

// 参数顺序不同
void func(int a, double b);
void func(double a, int b);
\`\`\`

### 不能用于重载的区别

以下情况**不能**构成重载：

\`\`\`cpp
// 错误：只有返回类型不同
int getValue();
double getValue();  // 编译错误！

// 错误：只有参数名不同
void print(int a);
void print(int b);  // 编译错误！

// 错误：typedef只是别名
typedef int Integer;
void process(int n);
void process(Integer n);  // 编译错误！
\`\`\`

### 重载解析

编译器选择最佳匹配的规则：

\`\`\`cpp
void print(int n);
void print(double d);
void print(const std::string& s);

int main() {
    print(10);        // 调用 print(int)
    print(3.14);      // 调用 print(double)
    print("hello");   // 调用 print(string)
    print('A');       // 调用 print(int)，char提升为int
    return 0;
}
\`\`\`

### 重载与默认参数

默认参数可能导致二义性：

\`\`\`cpp
// 危险：可能产生二义性
void func(int a, int b = 10);
void func(int a);

int main() {
    func(5);  // 错误！调用哪个？
    return 0;
}
\`\`\`

### 常见重载模式

#### 1. 不同类型的相同操作

\`\`\`cpp
// 计算绝对值
int abs(int n) {
    return n < 0 ? -n : n;
}

double abs(double d) {
    return d < 0 ? -d : d;
}

long long abs(long long n) {
    return n < 0 ? -n : n;
}
\`\`\`

#### 2. const重载

\`\`\`cpp
class Container {
    std::vector<int> data;
public:
    // const版本：只读访问
    const int& operator[](size_t index) const {
        return data[index];
    }
    
    // 非const版本：可修改
    int& operator[](size_t index) {
        return data[index];
    }
};
\`\`\`

#### 3. 指针与引用重载

\`\`\`cpp
void process(int* p);
void process(int& r);
void process(const int* p);  // 与第一个不同
\`\`\`

### 重载与模板

函数模板可以与普通函数重载：

\`\`\`cpp
// 模板版本
template<typename T>
T add(T a, T b) {
    return a + b;
}

// 特化版本：字符串连接
std::string add(std::string a, std::string b) {
    return a + b;
}

int main() {
    std::cout << add(1, 2) << std::endl;           // 模板
    std::cout << add(1.5, 2.5) << std::endl;       // 模板
    std::cout << add("Hello ", "World") << std::endl;  // 特化版本
    return 0;
}
\`\`\`

### 重载解析优先级

1. **精确匹配**
2. **const转换**
3. **类型提升**（如char到int）
4. **标准转换**（如int到double）
5. **用户定义转换**
6. **模板实例化**

\`\`\`cpp
void f(int n);
void f(double d);
void f(long l);

int main() {
    f(10);     // 精确匹配：f(int)
    f(3.14);   // 精确匹配：f(double)
    f(10L);    // 精确匹配：f(long)
    f('A');    // 类型提升：f(int)
    f(10u);    // 标准转换：f(int)
    return 0;
}
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <iostream>
#include <string>
#include <vector>

// 打印不同类型
void print(int n) {
    std::cout << "整数: " << n << std::endl;
}

void print(double d) {
    std::cout << "浮点数: " << d << std::endl;
}

void print(const std::string& s) {
    std::cout << "字符串: " << s << std::endl;
}

void print(const std::vector<int>& v) {
    std::cout << "向量: [";
    for (size_t i = 0; i < v.size(); i++) {
        std::cout << v[i];
        if (i < v.size() - 1) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
}

int main() {
    print(42);
    print(3.14);
    print("Hello");
    print({1, 2, 3, 4, 5});
    return 0;
}
\`\`\`

### 最佳实践

1. **重载应保持语义一致**：同名函数应做类似的事情
2. **避免二义性**：注意默认参数和类型转换
3. **不要过度重载**：保持代码清晰
4. **考虑使用模板**：对于模式相同的操作

### 常见错误

#### 1. 仅返回类型不同的重载

\`\`\`cpp
// 错误：只有返回类型不同
int getValue() { return 10; }
double getValue() { return 3.14; }  // 编译错误！

// 正确：使用不同的函数名
int getIntValue() { return 10; }
double getDoubleValue() { return 3.14; }
\`\`\`

#### 2. 参数名不同不构成重载

\`\`\`cpp
// 错误：参数名不同不构成重载
void print(int a);
void print(int b);  // 编译错误！重复定义

// 正确：使用不同的参数类型或数量
void print(int value);
void print(int value1, int value2);
\`\`\`

#### 3. typedef不构成新类型

\`\`\`cpp
// 错误：typedef只是别名
typedef int Integer;
void process(int n);
void process(Integer n);  // 编译错误！重复定义

// 正确：使用真正不同的类型
void process(int n);
void process(long n);  // 正确，long是不同类型
\`\`\`

#### 4. 默认参数导致二义性

\`\`\`cpp
// 危险：默认参数导致二义性
void func(int a);
void func(int a, int b = 10);

int main() {
    func(5);  // 错误！调用哪个？
}

// 正确：避免二义性
void func(int a);
void func(int a, int b);  // 移除默认参数
\`\`\`

#### 5. 类型转换导致意外调用

\`\`\`cpp
void print(int n);
void print(double d);

int main() {
    print('A');    // 调用print(int)，char提升为int
    print(3.14f);  // 调用print(double)，float提升为double
    print(10u);    // 调用print(int)，unsigned转int
}

// 更明确的做法
void print(int n);
void print(double d);
void print(char c);  // 添加char版本
\`\`\`

### 深入理解

#### 名称修饰（Name Mangling）

编译器通过名称修饰区分重载函数：

\`\`\`cpp
// 源代码
void print(int n);
void print(double d);
void print(const std::string& s);

// 编译后的内部名称（示意，不同编译器不同）
void _Z5printi(int n);              // print(int)
void _Z5printd(double d);           // print(double)
void _Z5printRKNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEE(const string& s);
\`\`\`

#### 重载解析过程

编译器选择最佳匹配的步骤：

1. **候选函数**：找到所有同名函数
2. **可行函数**：参数数量匹配，可以类型转换
3. **最佳匹配**：选择转换最少的

\`\`\`cpp
void f(int n);
void f(double d);
void f(long l);

int main() {
    f(10);     // 精确匹配：f(int)
    f(3.14);   // 精确匹配：f(double)
    f(10L);    // 精确匹配：f(long)
    f('A');    // 类型提升：f(int)
    f(10u);    // 标准转换：f(int)或f(long)，有二义性
}
\`\`\`

#### 重载与const

const可以区分重载：

\`\`\`cpp
class Container {
    std::vector<int> data;
public:
    // const版本：只读访问
    const int& operator[](size_t index) const {
        return data[index];
    }
    
    // 非const版本：可修改
    int& operator[](size_t index) {
        return data[index];
    }
};

int main() {
    Container c1;
    const Container c2;
    
    c1[0] = 10;   // 调用非const版本
    int x = c2[0]; // 调用const版本
}
\`\`\`

#### 重载与引用

引用和值传递可以重载：

\`\`\`cpp
void process(int n);
void process(int& n);
void process(const int& n);

int main() {
    int x = 10;
    process(10);  // 调用process(int)或process(const int&)
    process(x);   // 二义性！
}
\`\`\`

#### 重载与模板

函数模板可以与普通函数重载：

\`\`\`cpp
// 模板版本
template<typename T>
void print(T value) {
    std::cout << "Template: " << value << std::endl;
}

// 特化版本
void print(int n) {
    std::cout << "Int: " << n << std::endl;
}

int main() {
    print(10);      // 调用非模板版本
    print(3.14);    // 调用模板版本
    print("hello"); // 调用模板版本
}
\`\`\`

#### 重载与作用域

重载发生在同一作用域：

\`\`\`cpp
void func(int n);

namespace MyNamespace {
    void func(double d);
    
    void test() {
        func(10);    // 调用func(double)，不调用全局func(int)
        func(3.14);  // 调用func(double)
    }
}

// 使用using引入其他作用域的函数
namespace MyNamespace {
    using ::func;  // 引入全局func
    
    void test() {
        func(10);    // 调用全局func(int)
        func(3.14);  // 调用func(double)
    }
}
\`\`\`

#### 重载解析优先级

\`\`\`cpp
void f(long l);
void f(float f);

int main() {
    f(10);  // int -> long 和 int -> float 都是标准转换
            // 二义性！
}

// 解决方法：显式转换
f(10L);    // 调用f(long)
f(10.0f);  // 调用f(float)
\`\`\`

#### SFINAE与重载

使用SFINAE控制重载：

\`\`\`cpp
#include <type_traits>

// 只对整数类型启用
template<typename T>
std::enable_if_t<std::is_integral_v<T>, void>
process(T value) {
    std::cout << "Integer: " << value << std::endl;
}

// 只对浮点类型启用
template<typename T>
std::enable_if_t<std::is_floating_point_v<T>, void>
process(T value) {
    std::cout << "Float: " << value << std::endl;
}

int main() {
    process(10);    // 调用整数版本
    process(3.14);  // 调用浮点版本
}
\`\`\``,
            examples: [
                {
                    title: '函数重载基础',
                    code: `#include <iostream>
#include <string>

// 重载：参数数量不同
int sum(int a, int b) {
    return a + b;
}

int sum(int a, int b, int c) {
    return a + b + c;
}

// 重载：参数类型不同
double sum(double a, double b) {
    return a + b;
}

// 重载：字符串连接
std::string sum(const std::string& a, const std::string& b) {
    return a + b;
}

int main() {
    std::cout << "sum(1, 2) = " << sum(1, 2) << std::endl;
    std::cout << "sum(1, 2, 3) = " << sum(1, 2, 3) << std::endl;
    std::cout << "sum(1.5, 2.5) = " << sum(1.5, 2.5) << std::endl;
    std::cout << "sum(\"Hello\", \"World\") = " << sum("Hello", "World") << std::endl;
    
    return 0;
}`
                },
                {
                    title: 'const重载与实际应用',
                    code: `#include <iostream>
#include <string>

class TextBuffer {
private:
    std::string content;
    
public:
    TextBuffer(const std::string& s) : content(s) {}
    
    // const版本：只读访问
    const char& operator[](size_t index) const {
        std::cout << "[const访问] ";
        return content[index];
    }
    
    // 非const版本：可修改
    char& operator[](size_t index) {
        std::cout << "[非const访问] ";
        return content[index];
    }
    
    void print() const {
        std::cout << content << std::endl;
    }
};

// 重载print函数
void print(const TextBuffer& buf) {
    std::cout << "const TextBuffer: ";
    buf.print();
}

void print(TextBuffer& buf) {
    std::cout << "非const TextBuffer: ";
    buf.print();
}

int main() {
    TextBuffer buffer("Hello");
    const TextBuffer constBuffer("World");
    
    // 非const对象调用非const版本
    buffer[0] = 'h';
    std::cout << "buffer[0] = " << buffer[0] << std::endl;
    
    // const对象调用const版本
    std::cout << "constBuffer[0] = " << constBuffer[0] << std::endl;
    
    // 重载解析
    print(buffer);       // 非const版本
    print(constBuffer);  // const版本
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：实现重载函数',
                description: '创建一组重载的max函数，支持不同类型和数量',
                instructions: [
                    '实现max(int, int)',
                    '实现max(double, double)',
                    '实现max(int, int, int)',
                    '实现max(double, double, double)',
                    '测试所有重载版本'
                ],
                hints: [
                    '使用三元运算符(?:)简化代码',
                    '三个参数的版本可以调用两个参数的版本',
                    '注意重载的参数类型和数量要不同'
                ],
                solution: `#include <iostream>

// 两个int
int max(int a, int b) {
    return (a > b) ? a : b;
}

// 两个double
double max(double a, double b) {
    return (a > b) ? a : b;
}

// 三个int
int max(int a, int b, int c) {
    return max(max(a, b), c);
}

// 三个double
double max(double a, double b, double c) {
    return max(max(a, b), c);
}

int main() {
    std::cout << "max(3, 5) = " << max(3, 5) << std::endl;
    std::cout << "max(3.14, 2.71) = " << max(3.14, 2.71) << std::endl;
    std::cout << "max(1, 5, 3) = " << max(1, 5, 3) << std::endl;
    std::cout << "max(1.1, 5.5, 3.3) = " << max(1.1, 5.5, 3.3) << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '以下哪组函数可以构成重载？',
                    options: [
                        'A. int f() 和 double f()',
                        'B. void f(int a) 和 void f(int b)',
                        'C. void f(int a) 和 void f(double a)',
                        'D. void f(int a) 和 int f(int a)'
                    ],
                    answer: 'C',
                    explanation: '只有参数列表不同才能构成重载。选项C的参数类型不同，可以重载。返回类型不同不能重载。'
                },
                {
                    type: 'single',
                    question: '函数重载的主要目的是什么？',
                    options: [
                        'A. 提高运行速度',
                        'B. 减少内存使用',
                        'C. 使用相同的函数名处理不同类型或数量的参数',
                        'D. 避免命名冲突'
                    ],
                    answer: 'C',
                    explanation: '函数重载允许使用相同的函数名来处理不同类型或数量的参数，提高代码的可读性和便利性。'
                },
                {
                    type: 'single',
                    question: '以下代码会调用哪个函数？\n\nvoid f(int n);\nvoid f(double d);\nf(3.14f);',
                    options: [
                        'A. f(int)',
                        'B. f(double)',
                        'C. 编译错误',
                        'D. 两个都调用'
                    ],
                    answer: 'B',
                    explanation: '3.14f是float类型，会提升为double，所以调用f(double)。'
                },
                {
                    type: 'single',
                    question: '以下哪种情况会导致重载二义性？',
                    options: [
                        'A. void f(int) 和 void f(double)',
                        'B. void f(int) 和 void f(int, int)',
                        'C. void f(int) 和 void f(long) 调用 f(10)',
                        'D. void f(int) 和 void f(int, int = 0)'
                    ],
                    answer: 'D',
                    explanation: '当f(int)和f(int, int=0)同时存在时，调用f(10)会产生二义性，因为两个函数都可以匹配。'
                },
                {
                    type: 'single',
                    question: 'const可以用于函数重载吗？',
                    options: [
                        'A. 不可以',
                        'B. 只有顶层const可以',
                        'C. 只有底层const可以',
                        'D. 可以，const参数和非const参数可以重载'
                    ],
                    answer: 'D',
                    explanation: 'const可以用于函数重载。指向const的指针/引用与指向非const的指针/引用是不同的类型，可以重载。'
                }
            ],
            references: [
                {
                    title: 'C++ 函数重载详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/introduction-to-function-overloading/'
                },
                {
                    title: '重载解析规则',
                    url: 'https://en.cppreference.com/w/cpp/language/overload_resolution'
                }
            ],
            assistantTips: '函数重载让代码更直观。记住：只有参数列表不同才能重载，返回类型不重要。重载函数应该有相似的语义，不要让同名函数做完全不同的事情。'
        },
        {
            id: '6.6',
            title: '默认参数',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 默认参数

### 什么是默认参数

**默认参数**：在函数声明中为参数指定默认值，调用时可以省略该参数。

\`\`\`cpp
// 带默认参数的函数
void greet(const std::string& name = "World") {
    std::cout << "Hello, " << name << "!" << std::endl;
}

int main() {
    greet();          // 输出: Hello, World!
    greet("C++");     // 输出: Hello, C++!
    return 0;
}
\`\`\`

### 默认参数的规则

#### 1. 默认参数必须从右向左连续

\`\`\`cpp
// 正确
void func(int a, int b = 10, int c = 20);
void func(int a, int b, int c = 30, int d = 40);

// 错误：默认参数不连续
void wrong(int a = 1, int b, int c = 3);  // 编译错误！
\`\`\`

#### 2. 调用时参数从左向右匹配

\`\`\`cpp
void func(int a, int b = 10, int c = 20) {
    std::cout << a << ", " << b << ", " << c << std::endl;
}

int main() {
    func(1);           // 1, 10, 20
    func(1, 2);        // 1, 2, 20
    func(1, 2, 3);     // 1, 2, 3
    // func();         // 错误！a没有默认值
    // func(1, , 3);   // 错误！不能跳过中间参数
    return 0;
}
\`\`\`

#### 3. 默认参数在声明中指定

\`\`\`cpp
// 头文件 (.h)
void func(int a, int b = 10);

// 源文件 (.cpp)
void func(int a, int b) {  // 不要再写默认值
    // ...
}
\`\`\`

### 默认参数的使用场景

#### 1. 简化常用调用

\`\`\`cpp
// 打印函数，默认打印到标准输出
void print(const std::string& msg, std::ostream& os = std::cout) {
    os << msg << std::endl;
}

int main() {
    print("Hello");  // 打印到cout
    print("Error", std::cerr);  // 打印到cerr
    return 0;
}
\`\`\`

#### 2. 扩展功能时保持兼容

\`\`\`cpp
// 旧版本
void processData(const std::vector<int>& data);

// 新版本：添加选项，但保持兼容
void processData(const std::vector<int>& data, bool sort = false) {
    std::vector<int> temp = data;
    if (sort) {
        std::sort(temp.begin(), temp.end());
    }
    // 处理数据...
}
\`\`\`

#### 3. 配置选项

\`\`\`cpp
void createWindow(const std::string& title,
                  int width = 800,
                  int height = 600,
                  bool fullscreen = false);

int main() {
    createWindow("My App");                    // 默认大小
    createWindow("My App", 1024, 768);         // 自定义大小
    createWindow("Game", 1920, 1080, true);    // 全屏
    return 0;
}
\`\`\`

### 默认参数与函数重载

可能导致二义性：

\`\`\`cpp
// 危险：可能产生二义性
void print(int a);
void print(int a, int b = 10);

int main() {
    print(5);  // 错误！调用哪个？
    return 0;
}
\`\`\`

### 默认参数的类型

#### 1. 字面量

\`\`\`cpp
void func(int a = 0, double b = 3.14, char c = 'a');
\`\`\`

#### 2. 表达式

\`\`\`cpp
int defaultValue() { return 42; }

void func(int a = defaultValue(), int b = 10 + 20);
\`\`\`

#### 3. 全局变量

\`\`\`cpp
extern int globalValue;
void func(int a = globalValue);
\`\`\`

### 默认参数与构造函数

\`\`\`cpp
class Rectangle {
    double width, height;
public:
    Rectangle(double w = 1.0, double h = 1.0) 
        : width(w), height(h) {}
    
    double area() const { return width * height; }
};

int main() {
    Rectangle r1;        // 1x1
    Rectangle r2(5);     // 5x1
    Rectangle r3(5, 3);  // 5x3
    return 0;
}
\`\`\`

### 默认参数的最佳实践

1. **将最常用的值设为默认值**
2. **默认参数放在声明中，不在定义中**
3. **避免与重载产生二义性**
4. **保持默认值有意义**

\`\`\`cpp
// 好的设计
std::string readFile(const std::string& filename,
                     bool binary = false,
                     size_t maxSize = 1024 * 1024);

// 不好的设计
void process(int a = 0, int b = 0, int c = 0, int d = 0);  // 太多默认参数
\`\`\`

### 常见错误

#### 1. 默认参数不连续

\`\`\`cpp
// 错误：默认参数不连续
void func(int a = 1, int b, int c = 3);  // 编译错误！

// 正确：默认参数从右向左连续
void func(int a, int b, int c = 3);
void func(int a, int b = 2, int c = 3);
void func(int a = 1, int b = 2, int c = 3);
\`\`\`

#### 2. 默认参数在定义中重复

\`\`\`cpp
// 头文件 (.h)
void func(int a, int b = 10);

// 源文件 (.cpp)
void func(int a, int b = 10) {  // 错误！重复定义默认参数
    // ...
}

// 正确：只在声明中指定
void func(int a, int b) {  // 不要再写默认值
    // ...
}
\`\`\`

#### 3. 默认参数与重载冲突

\`\`\`cpp
// 危险：二义性
void print(int a);
void print(int a, int b = 10);

int main() {
    print(5);  // 错误！调用哪个？
}

// 正确：避免冲突
void print(int a);
void print(int a, int b);  // 移除默认参数
\`\`\`

#### 4. 默认参数使用局部变量

\`\`\`cpp
// 错误：默认参数不能使用局部变量
void func(int n) {
    int local = 10;
    void inner(int x = local);  // 错误！
}

// 正确：使用全局变量或静态变量
int globalValue = 10;
void func(int x = globalValue);  // 正确
\`\`\`

#### 5. 虚函数的默认参数

\`\`\`cpp
class Base {
public:
    virtual void func(int n = 10) {
        std::cout << "Base: " << n << std::endl;
    }
};

class Derived : public Base {
public:
    void func(int n = 20) override {  // 危险！默认参数不同
        std::cout << "Derived: " << n << std::endl;
    }
};

int main() {
    Base* ptr = new Derived();
    ptr->func();  // 输出：Derived: 10  使用Base的默认参数！
}

// 正确：虚函数不要使用默认参数，或保持一致
\`\`\`

### 深入理解

#### 默认参数的绑定时机

默认参数在**调用点**求值，不是在声明点：

\`\`\`cpp
int globalValue = 10;

void func(int n = globalValue);

int main() {
    globalValue = 20;
    func();  // 使用当前的globalValue = 20
}
\`\`\`

#### 默认参数的函数调用

\`\`\`cpp
int getValue() { return 42; }

void func(int n = getValue());

int main() {
    func();  // 调用getValue()获取默认值
}
\`\`\`

#### 默认参数与函数指针

\`\`\`cpp
void func(int a, int b = 10);

int main() {
    void (*fp)(int, int) = func;
    fp(5);      // 错误！函数指针不保留默认参数信息
    fp(5, 10);  // 正确
}
\`\`\`

#### 默认参数与模板

\`\`\`cpp
// 模板默认参数
template<typename T = int>
void func(T value) {
    std::cout << value << std::endl;
}

int main() {
    func(10);     // T = int
    func(3.14);   // T = double
    func<int>(10);  // 显式指定
}
\`\`\`

#### 默认参数与构造函数

\`\`\`cpp
class Rectangle {
    double width, height;
public:
    Rectangle(double w = 1.0, double h = 1.0) 
        : width(w), height(h) {}
};

int main() {
    Rectangle r1;        // 1.0 x 1.0
    Rectangle r2(5);     // 5.0 x 1.0
    Rectangle r3(5, 3);  // 5.0 x 3.0
}
\`\`\`

#### 默认参数的内存布局

\`\`\`
调用 func(5) 时：

栈帧：
┌────────────┐
│ 参数a = 5  │ ← 显式传递
│ 参数b = 10 │ ← 编译器插入默认值
└────────────┘

等价于 func(5, 10)
\`\`\`

#### 默认参数与inline函数

\`\`\`cpp
// 内联函数的默认参数
inline void func(int a, int b = 10) {
    // ...
}

// 每个调用点都会插入默认值
func(5);      // 展开为 func(5, 10)
func(5, 20);  // 展开为 func(5, 20)
\`\`\`

#### 默认参数与重载决议

\`\`\`cpp
void func(int a);
void func(int a, int b = 10);
void func(int a, int b, int c = 20);

int main() {
    func(1);        // 二义性！
    func(1, 2);     // 二义性！
    func(1, 2, 3);  // 正确
}

// 正确设计：避免二义性
void func(int a);
void func(int a, int b);
void func(int a, int b, int c);
\`\`\`

#### 默认参数的性能影响

\`\`\`cpp
// 默认参数在编译时确定，无运行时开销
void func(int a, int b = 10) {
    // ...
}

int main() {
    func(5);  // 编译器生成 func(5, 10)
}

// 汇编代码（示意）
// mov ecx, 5
// mov edx, 10
// call func
\`\`\`

#### 默认参数与异常安全

\`\`\`cpp
Resource* getResource(const std::string& name = "default") {
    Resource* res = new Resource(name);
    if (!res->isValid()) {
        delete res;
        return nullptr;
    }
    return res;
}

// 更好的做法：使用智能指针
std::unique_ptr<Resource> getResource(const std::string& name = "default") {
    auto res = std::make_unique<Resource>(name);
    if (!res->isValid()) {
        return nullptr;
    }
    return res;
}
\`\`\``,

### 默认参数 vs 函数重载

| 特性 | 默认参数 | 函数重载 |
|------|----------|----------|
| 语法简洁 | 是 | 否 |
| 灵活性 | 较低 | 较高 |
| 可读性 | 好 | 一般 |
| 适用场景 | 简单默认值 | 复杂逻辑 |

\`\`\`cpp
// 使用默认参数
void print(const std::string& s, int times = 1) {
    for (int i = 0; i < times; i++) {
        std::cout << s << std::endl;
    }
}

// 使用重载
void print(const std::string& s) {
    std::cout << s << std::endl;
}

void print(const std::string& s, int times) {
    for (int i = 0; i < times; i++) {
        std::cout << s << std::endl;
    }
}
\`\`\``,
            examples: [
                {
                    title: '默认参数基础',
                    code: `#include <iostream>
#include <string>

// 默认参数从右向左
void printInfo(const std::string& name,
               int age = 0,
               const std::string& city = "Unknown") {
    std::cout << "姓名: " << name << std::endl;
    std::cout << "年龄: " << age << std::endl;
    std::cout << "城市: " << city << std::endl;
    std::cout << "-------------------" << std::endl;
}

// 多个默认参数
int power(int base, int exp = 2) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main() {
    // 使用默认参数
    printInfo("张三");
    
    // 部分使用默认参数
    printInfo("李四", 25);
    
    // 不使用默认参数
    printInfo("王五", 30, "北京");
    
    // power函数
    std::cout << "power(3) = " << power(3) << std::endl;      // 3^2 = 9
    std::cout << "power(2, 10) = " << power(2, 10) << std::endl;  // 2^10 = 1024
    
    return 0;
}`
                },
                {
                    title: '默认参数与构造函数',
                    code: `#include <iostream>
#include <string>

class Config {
public:
    std::string host;
    int port;
    std::string username;
    std::string password;
    bool useSSL;
    
    // 使用默认参数的构造函数
    Config(const std::string& h = "localhost",
           int p = 8080,
           const std::string& u = "admin",
           const std::string& pwd = "",
           bool ssl = false)
        : host(h), port(p), username(u), password(pwd), useSSL(ssl) {}
    
    void print() const {
        std::cout << "Host: " << host << std::endl;
        std::cout << "Port: " << port << std::endl;
        std::cout << "Username: " << username << std::endl;
        std::cout << "SSL: " << (useSSL ? "Yes" : "No") << std::endl;
        std::cout << "-------------------" << std::endl;
    }
};

int main() {
    // 使用所有默认值
    Config c1;
    std::cout << "配置1（默认）:" << std::endl;
    c1.print();
    
    // 自定义host
    Config c2("example.com");
    std::cout << "配置2（自定义host）:" << std::endl;
    c2.print();
    
    // 自定义host和port
    Config c3("secure.example.com", 443, "user", "pass", true);
    std::cout << "配置3（完全自定义）:" << std::endl;
    c3.print();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：使用默认参数',
                description: '创建一个日志函数，使用默认参数',
                instructions: [
                    '创建log函数，接收消息、级别、时间戳参数',
                    '级别默认为"INFO"',
                    '时间戳默认为false',
                    '当时间戳为true时，显示当前时间'
                ],
                hints: [
                    '使用<ctime>获取当前时间',
                    '默认参数从右向左声明',
                    '级别参数在时间戳之前'
                ],
                solution: `#include <iostream>
#include <string>
#include <ctime>

void log(const std::string& message,
         const std::string& level = "INFO",
         bool showTimestamp = false) {
    if (showTimestamp) {
        time_t now = time(nullptr);
        char buffer[26];
        ctime_s(buffer, sizeof(buffer), &now);
        buffer[24] = '\\0';  // 移除换行符
        std::cout << "[" << buffer << "] ";
    }
    
    std::cout << "[" << level << "] " << message << std::endl;
}

int main() {
    log("程序启动");
    log("发现错误", "ERROR");
    log("重要事件", "WARNING", true);
    log("调试信息", "DEBUG", true);
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '以下哪个函数声明是正确的？',
                    options: [
                        'A. void f(int a = 1, int b, int c = 3);',
                        'B. void f(int a, int b = 2, int c = 3);',
                        'C. void f(int a = 1, int b = 2, int c);',
                        'D. void f(int a, int b = 2, int c);'
                    ],
                    answer: 'B',
                    explanation: '默认参数必须从右向左连续，不能跳过。只有B符合这个规则。'
                },
                {
                    type: 'single',
                    question: '调用 void f(int a, int b = 2, int c = 3) 时，f(1, 5) 的结果是什么？',
                    options: [
                        'A. a=1, b=2, c=3',
                        'B. a=1, b=5, c=3',
                        'C. a=1, b=5, c=5',
                        'D. 编译错误'
                    ],
                    answer: 'B',
                    explanation: '参数从左向右匹配，f(1, 5)中a=1，b=5，c使用默认值3。'
                },
                {
                    type: 'single',
                    question: '默认参数应该放在哪里？',
                    options: [
                        'A. 函数定义中',
                        'B. 函数声明中',
                        'C. 两者都可以',
                        'D. 两者都必须有'
                    ],
                    answer: 'B',
                    explanation: '默认参数应该放在函数声明中（通常是头文件），而不是定义中。如果在定义中重复指定会导致编译错误。'
                },
                {
                    type: 'single',
                    question: '以下代码有什么问题？\n\nvoid f(int a = 1);\nvoid f(int a);',
                    options: [
                        'A. 没有问题',
                        'B. 重复定义',
                        'C. 二义性',
                        'D. 默认参数重复声明'
                    ],
                    answer: 'C',
                    explanation: '当调用f(5)时，编译器无法确定是调用带默认参数的版本还是不带默认参数的版本，产生二义性。'
                },
                {
                    type: 'single',
                    question: '默认参数的主要优点是什么？',
                    options: [
                        'A. 提高运行速度',
                        'B. 减少函数数量，简化调用',
                        'C. 增加类型安全',
                        'D. 减少内存使用'
                    ],
                    answer: 'B',
                    explanation: '默认参数可以减少需要定义的函数数量，同时简化常用场景的函数调用。'
                }
            ],
            references: [
                {
                    title: 'C++ 默认参数详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/default-arguments/'
                },
                {
                    title: '默认参数最佳实践',
                    url: 'https://en.cppreference.com/w/cpp/language/default_arguments'
                }
            ],
            assistantTips: '默认参数让函数调用更灵活。记住：默认参数从右向左，调用时从左向右匹配。避免与重载产生二义性，将默认值放在声明中。'
        },
        {
            id: '6.7',
            title: '内联函数',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 内联函数

### 什么是内联函数

**内联函数**：建议编译器将函数代码直接嵌入调用处，避免函数调用的开销。

\`\`\`cpp
// 普通函数调用
int add(int a, int b) {
    return a + b;
}

// 内联函数
inline int add(int a, int b) {
    return a + b;
}
\`\`\`

### 函数调用的开销

普通函数调用需要：

1. **保存现场**：保存寄存器、返回地址
2. **参数传递**：将参数压栈或放入寄存器
3. **跳转执行**：跳转到函数代码
4. **返回处理**：恢复现场，返回结果

\`\`\`
普通函数调用：
┌─────────┐     调用      ┌─────────┐
│ main()  │ ──────────→  │ add()   │
│         │ ←──────────  │         │
└─────────┘     返回      └─────────┘
     ↑                        ↑
     └──── 开销：跳转、压栈 ────┘

内联函数：
┌─────────────────────────────┐
│ main() {                    │
│   // add的代码直接嵌入这里   │
│   result = a + b;           │
│ }                           │
└─────────────────────────────┘
\`\`\`

### 内联函数的定义

\`\`\`cpp
// 内联函数通常定义在头文件中
inline int square(int n) {
    return n * n;
}

// 类内定义的函数默认是内联的
class Calculator {
public:
    int add(int a, int b) {  // 隐式内联
        return a + b;
    }
    
    inline int multiply(int a, int b) {  // 显式内联
        return a * b;
    }
};
\`\`\`

### 内联函数的特点

#### 1. 减少调用开销

\`\`\`cpp
// 内联前：每次调用都有开销
for (int i = 0; i < 1000000; i++) {
    result += square(i);  // 100万次函数调用
}

// 内联后：代码直接嵌入
for (int i = 0; i < 1000000; i++) {
    result += i * i;  // 直接计算，无调用开销
}
\`\`\`

#### 2. 可能增加代码大小

\`\`\`cpp
// 如果函数体很大，内联会导致代码膨胀
inline void bigFunction() {
    // 100行代码...
}

// 调用10次 = 复制10次代码
bigFunction();  // 100行
bigFunction();  // 100行
bigFunction();  // 100行
// ... 总共1000行代码
\`\`\`

#### 3. 编译器可能忽略inline

\`\`\`cpp
// 编译器可能拒绝内联的情况：
// 1. 函数体过大
// 2. 函数包含循环
// 3. 函数包含switch语句
// 4. 递归函数
// 5. 虚函数

inline void complexFunction() {
    for (int i = 0; i < 100; i++) {  // 循环
        // ...
    }
    // 编译器可能忽略inline建议
}
\`\`\`

### 何时使用内联

#### 适合内联的情况

\`\`\`cpp
// 1. 简单的访问函数
inline int getX() const { return x; }
inline void setX(int val) { x = val; }

// 2. 简单的计算函数
inline int max(int a, int b) { return a > b ? a : b; }
inline int min(int a, int b) { return a < b ? a : b; }
inline int abs(int n) { return n < 0 ? -n : n; }

// 3. 小型工具函数
inline bool isEven(int n) { return n % 2 == 0; }
inline double square(double x) { return x * x; }
\`\`\`

#### 不适合内联的情况

\`\`\`cpp
// 1. 函数体较大
void processData(std::vector<int>& data) {
    // 很多代码...
}

// 2. 包含循环
int sum(const std::vector<int>& v) {
    int total = 0;
    for (int n : v) total += n;  // 循环
    return total;
}

// 3. 递归函数
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 递归
}
\`\`\`

### 内联与头文件

内联函数通常放在头文件中：

\`\`\`cpp
// math_utils.h
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

inline int square(int n) {
    return n * n;
}

inline int cube(int n) {
    return n * n * n;
}

#endif

// main.cpp
#include "math_utils.h"

int main() {
    int x = square(5);  // 直接嵌入代码
    return 0;
}
\`\`\`

### constexpr vs inline

\`\`\`cpp
// constexpr函数隐式是内联的
constexpr int square(int n) {
    return n * n;
}

// constexpr可以在编译时计算
constexpr int result = square(5);  // 编译时计算为25

// inline只是建议，不一定在编译时计算
inline int add(int a, int b) {
    return a + b;
}
\`\`\`

### 内联函数的优缺点

**优点：**
- 减少函数调用开销
- 提高执行速度（对小型函数）
- 编译器可进行更多优化

**缺点：**
- 可能增加代码大小（代码膨胀）
- 可能降低指令缓存效率
- 编译时间增加
- 修改内联函数需要重新编译所有使用它的文件

### 最佳实践

1. **只对小型、简单的函数使用inline**
2. **不要内联包含循环的函数**
3. **不要内联递归函数**
4. **让编译器决定**：现代编译器会自动优化

\`\`\`cpp
// 好的内联候选
inline double toRadians(double degrees) {
    return degrees * 3.14159 / 180.0;
}

// 不好的内联候选
inline void processData(std::vector<int>& data) {
    std::sort(data.begin(), data.end());
    for (auto& n : data) {
        n *= 2;
    }
}
\`\`\`

### 常见错误

#### 1. 过度使用inline

\`\`\`cpp
// 不好的设计：过度内联
inline void complexFunction() {
    // 100行代码...
    // 内联会导致代码膨胀
}

// 正确：让编译器决定
void complexFunction() {
    // 100行代码...
    // 编译器会自动判断是否内联
}
\`\`\`

#### 2. 内联大型函数

\`\`\`cpp
// 不好的设计：内联大型函数
inline void processData(std::vector<int>& data) {
    std::sort(data.begin(), data.end());
    for (auto& n : data) {
        n *= 2;
    }
    // ...更多代码
}

// 正确：不使用inline
void processData(std::vector<int>& data) {
    std::sort(data.begin(), data.end());
    for (auto& n : data) {
        n *= 2;
    }
}
\`\`\`

#### 3. 内联递归函数

\`\`\`cpp
// 错误：内联递归函数
inline int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 编译器会忽略inline
}

// 正确：不使用inline
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\`

#### 4. 内联虚函数

\`\`\`cpp
class Base {
public:
    virtual void func() {  // 虚函数通常不被内联
        std::cout << "Base" << std::endl;
    }
};

class Derived : public Base {
public:
    void func() override {
        std::cout << "Derived" << std::endl;
    }
};

int main() {
    Base* ptr = new Derived();
    ptr->func();  // 虚函数调用，无法内联
}
\`\`\`

#### 5. 内联函数放在源文件

\`\`\`cpp
// 错误：内联函数放在.cpp文件
// math.cpp
inline int square(int n) {
    return n * n;
}

// main.cpp
int main() {
    int x = square(5);  // 链接错误！
}

// 正确：内联函数放在头文件
// math.h
inline int square(int n) {
    return n * n;
}
\`\`\`

### 深入理解

#### 内联展开的汇编代码

\`\`\`cpp
// 源代码
inline int add(int a, int b) {
    return a + b;
}

int main() {
    int x = add(3, 5);
}

// 可能的汇编代码（内联后）
// mov eax, 3
// add eax, 5
// mov [x], eax
// 无函数调用指令
\`\`\`

#### 内联与调试

\`\`\`cpp
// 调试模式下，编译器通常不内联
// Release模式下，编译器会积极内联

// 强制内联（编译器特定）
// MSVC: __forceinline
// GCC/Clang: __attribute__((always_inline))

__forceinline int add(int a, int b) {
    return a + b;
}
\`\`\`

#### 内联与代码膨胀

\`\`\`cpp
// 内联前：代码大小 = 函数体大小 + 调用点数 × 调用指令大小
// 内联后：代码大小 = 调用点数 × 函数体大小

// 示例：
inline void smallFunc() {
    // 10字节代码
}

// 调用100次
// 内联前：10 + 100 × 5 = 510字节
// 内联后：100 × 10 = 1000字节
\`\`\`

#### 内联与指令缓存

\`\`\`cpp
// 内联可能影响指令缓存效率
// 小函数内联：提高缓存局部性
// 大函数内联：降低缓存效率

// 热点函数：适合内联
// 冷门函数：不适合内联
\`\`\`

#### 内联与链接时优化（LTO）

\`\`\`cpp
// 链接时优化可以跨编译单元内联
// file1.cpp
void func() {
    // ...
}

// file2.cpp
int main() {
    func();  // LTO可以内联
}

// 编译选项：-flto (GCC/Clang)
\`\`\`

#### 内联与异常处理

\`\`\`cpp
inline void func() {
    throw std::runtime_error("error");  // 异常处理代码不被内联
}

// 异常处理表仍然需要，无法完全内联
\`\`\`

#### 内联与性能分析

\`\`\`cpp
// 性能测试：内联 vs 非内联
#include <chrono>

inline int addInline(int a, int b) {
    return a + b;
}

int addNoInline(int a, int b) {
    return a + b;
}

int main() {
    const int N = 100000000;
    
    auto start = std::chrono::high_resolution_clock::now();
    volatile int result = 0;
    for (int i = 0; i < N; i++) {
        result = addInline(i, i + 1);
    }
    auto end = std::chrono::high_resolution_clock::now();
    
    // 比较时间...
}
\`\`\`

#### 内联与constexpr

\`\`\`cpp
// constexpr函数隐式是内联的
constexpr int square(int n) {
    return n * n;
}

// 编译时计算
constexpr int result = square(5);  // 完全内联，编译时计算

// 运行时计算
int x = 10;
int y = square(x);  // 可能内联
\`\`\`

#### 内联与模板

\`\`\`cpp
// 模板函数通常定义在头文件，隐式内联
template<typename T>
T add(T a, T b) {
    return a + b;
}

// 显式实例化可以避免代码膨胀
// math.cpp
template int add<int>(int, int);
template double add<double>(double, double);
\`\`\`

#### 内联的编译器启发式算法

编译器决定是否内联的因素：

1. **函数大小**：小函数更容易内联
2. **调用频率**：频繁调用的函数更可能内联
3. **函数复杂度**：简单函数更容易内联
4. **优化级别**：-O2/-O3会积极内联
5. **代码膨胀风险**：避免过度膨胀
6. **热点分析**：基于性能分析的内联

\`\`\`cpp
// 编译器选项
// -finline-functions: 启用内联
// -fno-inline: 禁用内联
// -Winline: 警告未内联的函数
\`\`\``,`,
            examples: [
                {
                    title: '内联函数示例',
                    code: `#include <iostream>
#include <chrono>

// 内联函数
inline int square(int n) {
    return n * n;
}

inline int cube(int n) {
    return n * n * n;
}

// 非内联函数
int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main() {
    // 使用内联函数
    std::cout << "square(5) = " << square(5) << std::endl;
    std::cout << "cube(3) = " << cube(3) << std::endl;
    
    // 性能测试
    const int N = 100000000;
    volatile int result = 0;  // volatile防止优化
    
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < N; i++) {
        result = square(i % 100);
    }
    auto end = std::chrono::high_resolution_clock::now();
    
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "\\n内联函数执行时间: " << duration.count() << " ms" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '类中的内联函数',
                    code: `#include <iostream>
#include <string>

class Point {
private:
    double x, y;
    
public:
    // 构造函数
    Point(double x = 0, double y = 0) : x(x), y(y) {}
    
    // 内联访问函数（类内定义，隐式内联）
    double getX() const { return x; }
    double getY() const { return y; }
    
    // 内联设置函数
    void setX(double val) { x = val; }
    void setY(double val) { y = val; }
    
    // 内联计算函数
    double distanceFromOrigin() const {
        return std::sqrt(x * x + y * y);
    }
    
    // 非内联函数（类外定义）
    void print() const;
    
    // 友元内联函数
    friend inline Point operator+(const Point& a, const Point& b) {
        return Point(a.x + b.x, a.y + b.y);
    }
};

// 类外定义（非内联）
void Point::print() const {
    std::cout << "(" << x << ", " << y << ")" << std::endl;
}

int main() {
    Point p1(3, 4);
    Point p2(1, 2);
    
    // 使用内联函数
    std::cout << "p1: ";
    p1.print();
    std::cout << "p1.x = " << p1.getX() << std::endl;
    std::cout << "p1距原点距离 = " << p1.distanceFromOrigin() << std::endl;
    
    // 使用内联运算符
    Point p3 = p1 + p2;
    std::cout << "p1 + p2 = ";
    p3.print();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：创建内联工具函数',
                description: '创建一组数学工具内联函数',
                instructions: [
                    '创建内联函数：toDegrees（弧度转角度）',
                    '创建内联函数：clamp（限制值范围）',
                    '创建内联函数：lerp（线性插值）',
                    '测试所有函数'
                ],
                hints: [
                    '弧度转角度：degrees = radians * 180 / π',
                    'clamp：将值限制在[min, max]范围内',
                    'lerp：线性插值 lerp(a, b, t) = a + t * (b - a)'
                ],
                solution: `#include <iostream>
#include <cmath>

const double PI = 3.14159265358979323846;

// 弧度转角度
inline double toDegrees(double radians) {
    return radians * 180.0 / PI;
}

// 角度转弧度
inline double toRadians(double degrees) {
    return degrees * PI / 180.0;
}

// 限制值范围
inline double clamp(double value, double min, double max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

// 线性插值
inline double lerp(double a, double b, double t) {
    return a + t * (b - a);
}

int main() {
    // 测试角度转换
    std::cout << "=== 角度转换 ===" << std::endl;
    std::cout << "π弧度 = " << toDegrees(PI) << "度" << std::endl;
    std::cout << "π/2弧度 = " << toDegrees(PI / 2) << "度" << std::endl;
    std::cout << "180度 = " << toRadians(180) << "弧度" << std::endl;
    
    // 测试clamp
    std::cout << "\\n=== Clamp测试 ===" << std::endl;
    std::cout << "clamp(5, 0, 10) = " << clamp(5, 0, 10) << std::endl;
    std::cout << "clamp(-5, 0, 10) = " << clamp(-5, 0, 10) << std::endl;
    std::cout << "clamp(15, 0, 10) = " << clamp(15, 0, 10) << std::endl;
    
    // 测试lerp
    std::cout << "\\n=== 线性插值 ===" << std::endl;
    std::cout << "lerp(0, 10, 0.0) = " << lerp(0, 10, 0.0) << std::endl;
    std::cout << "lerp(0, 10, 0.5) = " << lerp(0, 10, 0.5) << std::endl;
    std::cout << "lerp(0, 10, 1.0) = " << lerp(0, 10, 1.0) << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: 'inline关键字的作用是什么？',
                    options: [
                        'A. 强制编译器内联函数',
                        'B. 建议编译器内联函数',
                        'C. 禁止编译器内联函数',
                        'D. 使函数在编译时计算'
                    ],
                    answer: 'B',
                    explanation: 'inline只是对编译器的建议，编译器可以选择忽略。编译器会根据函数的复杂度等因素决定是否真正内联。'
                },
                {
                    type: 'single',
                    question: '以下哪种函数最适合内联？',
                    options: [
                        'A. 包含100行代码的函数',
                        'B. 递归函数',
                        'C. 简单的getter/setter函数',
                        'D. 包含复杂循环的函数'
                    ],
                    answer: 'C',
                    explanation: '简单的getter/setter函数体很小，内联后不会导致代码膨胀，且能减少调用开销，最适合内联。'
                },
                {
                    type: 'single',
                    question: '类内定义的成员函数默认是什么？',
                    options: [
                        'A. 非内联',
                        'B. 内联',
                        'C. 虚函数',
                        'D. 静态函数'
                    ],
                    answer: 'B',
                    explanation: '在类定义内部定义的成员函数默认是内联的，不需要显式使用inline关键字。'
                },
                {
                    type: 'single',
                    question: '内联函数的主要缺点是什么？',
                    options: [
                        'A. 降低执行速度',
                        'B. 可能导致代码膨胀',
                        'C. 增加函数调用开销',
                        'D. 降低类型安全'
                    ],
                    answer: 'B',
                    explanation: '内联函数会将代码复制到每个调用点，如果函数体较大或调用次数很多，会导致代码膨胀。'
                },
                {
                    type: 'single',
                    question: '内联函数通常应该放在哪里？',
                    options: [
                        'A. 源文件(.cpp)',
                        'B. 头文件(.h)',
                        'C. 单独的内联文件',
                        'D. 任何地方都可以'
                    ],
                    answer: 'B',
                    explanation: '内联函数通常放在头文件中，因为编译器需要看到函数的完整定义才能进行内联。'
                }
            ],
            references: [
                {
                    title: 'C++ 内联函数详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/inline-functions/'
                },
                {
                    title: '内联函数最佳实践',
                    url: 'https://en.cppreference.com/w/cpp/language/inline'
                }
            ],
            assistantTips: 'inline是对编译器的建议，不是命令。只对小型、频繁调用的函数使用内联。现代编译器很智能，会自动进行内联优化，不必过度使用inline关键字。'
        },
        {
            id: '6.8',
            title: 'constexpr函数',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## constexpr函数

### 什么是constexpr函数

**constexpr函数**：可以在**编译时**计算的函数。当参数是常量表达式时，函数在编译时计算。

\`\`\`cpp
constexpr int square(int n) {
    return n * n;
}

int main() {
    constexpr int result = square(5);  // 编译时计算，result = 25
    int x = 10;
    int y = square(x);  // 运行时计算
    return 0;
}
\`\`\`

### constexpr vs const

\`\`\`cpp
const int a = 10;           // 运行时常量
constexpr int b = 10;       // 编译时常量

const int c = square(5);    // 可能运行时计算
constexpr int d = square(5); // 编译时计算

int x = 10;
const int e = x;            // 正确：const可以从变量初始化
// constexpr int f = x;     // 错误！constexpr需要编译时常量
\`\`\`

### constexpr函数的规则

#### C++11规则

\`\`\`cpp
// C++11 constexpr函数限制：
// 1. 只能有一个return语句
// 2. 不能有循环、条件语句
// 3. 不能有局部变量

constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);  // 使用递归和三元运算符
}
\`\`\`

#### C++14放宽限制

\`\`\`cpp
// C++14允许：
// 1. 多条语句
// 2. 局部变量
// 3. if、for、while等控制语句

constexpr int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

constexpr int abs(int n) {
    if (n < 0) {
        return -n;
    }
    return n;
}
\`\`\`

### constexpr函数的特点

#### 1. 编译时计算

\`\`\`cpp
constexpr int square(int n) {
    return n * n;
}

int main() {
    // 编译时计算
    constexpr int a = square(5);  // 编译后直接是25
    
    // 运行时计算
    int x = 10;
    int b = square(x);  // 运行时计算
    
    // 用于数组大小
    int arr[square(3)];  // 正确！大小为9
    
    return 0;
}
\`\`\`

#### 2. 可以用于常量表达式

\`\`\`cpp
constexpr int size = 10;
int array[size];  // 正确

constexpr int getValue() { return 42; }
int arr[getValue()];  // 正确！数组大小为42

// 用于模板参数
template<int N>
struct Array {
    int data[N];
};

Array<square(3)> arr;  // Array<9>
\`\`\`

#### 3. 隐式内联

\`\`\`cpp
// constexpr函数隐式是内联的
constexpr int add(int a, int b) {
    return a + b;
}
// 等价于 inline constexpr int add(int a, int b)
\`\`\`

### constexpr与浮点数

\`\`\`cpp
constexpr double PI = 3.14159265358979;

constexpr double toRadians(double degrees) {
    return degrees * PI / 180.0;
}

constexpr double sinApprox(double x) {
    // 泰勒级数近似
    return x - x*x*x/6 + x*x*x*x*x/120;
}

int main() {
    constexpr double rad = toRadians(90.0);  // 编译时计算
    return 0;
}
\`\`\`

### constexpr与类

\`\`\`cpp
class Point {
    double x, y;
public:
    constexpr Point(double x = 0, double y = 0) : x(x), y(y) {}
    
    constexpr double getX() const { return x; }
    constexpr double getY() const { return y; }
    
    constexpr double distanceFromOrigin() const {
        return sqrt(x*x + y*y);  // C++26前需要constexpr sqrt
    }
};

constexpr Point p(3, 4);
constexpr double dist = p.distanceFromOrigin();  // 编译时计算
\`\`\`

### constexpr与递归

\`\`\`cpp
// 编译时递归
constexpr int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

constexpr int fib10 = fibonacci(10);  // 编译时计算 = 55

// 注意：递归深度有限制
// constexpr int fib100 = fibonacci(100);  // 可能超出编译器限制
\`\`\`

### constexpr与标准库

C++标准库中越来越多的函数成为constexpr：

\`\`\`cpp
#include <array>
#include <algorithm>

constexpr int sumArray() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : arr) {
        sum += n;
    }
    return sum;
}

constexpr int total = sumArray();  // 编译时计算 = 15
\`\`\`

### constexpr if (C++17)

\`\`\`cpp
template<typename T>
constexpr auto getValue(T t) {
    if constexpr (std::is_integral_v<T>) {
        return t * 2;
    } else {
        return t;
    }
}

constexpr int a = getValue(5);      // 10
constexpr double b = getValue(3.14); // 3.14
\`\`\`

### constexpr函数的限制

不能在constexpr函数中使用：

\`\`\`cpp
// 以下在C++20前不允许：
constexpr void example() {
    // static int x = 0;        // C++23前不允许
    // thread_local int y = 0;  // 不允许
    // new int(10);             // C++20前不允许
    // delete ptr;              // C++20前不允许
    // throw exception;         // C++20前不允许
    // asm(...);                // 不允许
}
\`\`\`

### 实际应用

#### 1. 编译时计算

\`\`\`cpp
constexpr int pow(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; ++i) {
        result *= base;
    }
    return result;
}

// 编译时计算2^10
constexpr int KB = pow(2, 10);  // 1024
constexpr int MB = pow(2, 20);  // 1048576
\`\`\`

#### 2. 类型安全常量

\`\`\`cpp
constexpr int MAX_SIZE = 100;
constexpr double EPSILON = 1e-9;
constexpr const char* APP_NAME = "MyApp";
\`\`\`

#### 3. 模板元编程替代

\`\`\`cpp
// 传统模板元编程
template<int N>
struct Factorial {
    static const int value = N * Factorial<N-1>::value;
};

// constexpr替代
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}
\`\`\`

### 最佳实践

1. **优先使用constexpr**：能编译时计算就编译时
2. **参数验证**：注意编译时和运行时的行为一致
3. **避免深度递归**：可能超出编译器限制
4. **利用标准库**：越来越多的函数支持constexpr

### 常见错误

#### 1. constexpr函数包含不允许的语句

\`\`\`cpp
// C++11错误：包含多条语句
constexpr int factorial(int n) {
    int result = 1;  // C++11不允许局部变量
    for (int i = 2; i <= n; ++i) {  // C++11不允许循环
        result *= i;
    }
    return result;
}

// C++11正确：使用递归和三元运算符
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// C++14及以后：允许循环和局部变量
constexpr int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}
\`\`\`

#### 2. constexpr变量用运行时值初始化

\`\`\`cpp
int getRuntimeValue() { return 42; }

int main() {
    int x = 10;
    constexpr int a = x;  // 错误！x不是编译时常量
    constexpr int b = getRuntimeValue();  // 错误！
    
    // 正确：使用const或运行时初始化
    const int c = x;  // 正确
    int d = x;  // 正确
}
\`\`\`

#### 3. constexpr函数调用非constexpr函数

\`\`\`cpp
int nonConstexprFunc() { return 42; }

constexpr int func() {
    return nonConstexprFunc();  // 错误！
}

// 正确：所有调用的函数都必须是constexpr
constexpr int constexprFunc() { return 42; }

constexpr int func() {
    return constexprFunc();  // 正确
}
\`\`\`

#### 4. constexpr递归深度过大

\`\`\`cpp
constexpr int fibonacci(int n) {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    constexpr int fib10 = fibonacci(10);  // 正确
    // constexpr int fib100 = fibonacci(100);  // 可能超出编译器限制
}
\`\`\`

#### 5. constexpr成员函数修改对象

\`\`\`cpp
class Counter {
    int value = 0;
public:
    constexpr void increment() {
        value++;  // C++14允许，C++11不允许
    }
};

int main() {
    constexpr Counter c;  // C++14允许
    // c.increment();  // 错误！c是const
}
\`\`\`

### 深入理解

#### constexpr的编译时执行

\`\`\`cpp
constexpr int square(int n) {
    return n * n;
}

int main() {
    constexpr int a = square(5);  // 编译时计算
    int x = 10;
    int b = square(x);  // 运行时计算
    
    // 编译后的代码（示意）
    // int a = 25;  // 直接替换为结果
    // int b = x * x;  // 运行时计算
}
\`\`\`

#### constexpr与模板元编程

\`\`\`cpp
// 传统模板元编程
template<int N>
struct Factorial {
    static const int value = N * Factorial<N-1>::value;
};

template<>
struct Factorial<0> {
    static const int value = 1;
};

// constexpr替代
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// 使用
int main() {
    int a = Factorial<5>::value;  // 模板元编程
    constexpr int b = factorial(5);  // constexpr
}
\`\`\`

#### constexpr与编译器限制

\`\`\`cpp
// 编译器对constexpr的限制
// - 递归深度限制（通常512-1024层）
// - 计算步骤限制
// - 内存分配限制（C++20前）

// 检查编译器限制
#include <iostream>

constexpr int deepRecursion(int n) {
    return n <= 0 ? 0 : 1 + deepRecursion(n - 1);
}

int main() {
    // 测试递归深度
    // constexpr int depth = deepRecursion(1000);  // 可能失败
}
\`\`\`

#### constexpr与浮点数

\`\`\`cpp
constexpr double PI = 3.14159265358979;

constexpr double toRadians(double degrees) {
    return degrees * PI / 180.0;
}

constexpr double sinApprox(double x) {
    // 泰勒级数近似
    return x - x*x*x/6 + x*x*x*x*x/120 - x*x*x*x*x*x*x/5040;
}

int main() {
    constexpr double rad = toRadians(90.0);
    constexpr double sin90 = sinApprox(PI / 2);
}
\`\`\`

#### constexpr与标准库

\`\`\`cpp
#include <array>
#include <algorithm>

constexpr int sumArray() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : arr) {
        sum += n;
    }
    return sum;
}

constexpr int total = sumArray();  // C++17起支持

// C++20支持更多标准库函数
#include <vector>
constexpr std::vector<int> createVector() {
    std::vector<int> v = {1, 2, 3};
    return v;  // C++20支持
}
\`\`\`

#### constexpr if (C++17)

\`\`\`cpp
template<typename T>
constexpr auto getValue(T t) {
    if constexpr (std::is_integral_v<T>) {
        return t * 2;
    } else {
        return t;
    }
}

constexpr int a = getValue(5);      // 10
constexpr double b = getValue(3.14); // 3.14
\`\`\`

#### constexpr与动态内存（C++20）

\`\`\`cpp
// C++20允许constexpr中使用动态内存
constexpr int* createArray(int size) {
    int* arr = new int[size];
    for (int i = 0; i < size; ++i) {
        arr[i] = i * i;
    }
    return arr;
}

constexpr int getValue() {
    int* arr = createArray(10);
    int result = arr[5];  // 25
    delete[] arr;
    return result;
}

constexpr int val = getValue();  // C++20支持
\`\`\`

#### consteval (C++23)

\`\`\`cpp
// consteval：强制编译时计算
consteval int square(int n) {
    return n * n;
}

int main() {
    constexpr int a = square(5);  // 正确
    int x = 10;
    // int b = square(x);  // 错误！必须用编译时常量
    
    const int c = 5;
    int d = square(c);  // 正确，c是编译时常量
}
\`\`\`

#### constexpr的性能影响

\`\`\`cpp
// 编译时计算：增加编译时间，减少运行时间
constexpr int fibonacci(int n) {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    // 编译时计算，运行时无开销
    constexpr int fib20 = fibonacci(20);
    
    // 运行时计算
    int n;
    std::cin >> n;
    int result = fibonacci(n);  // 运行时计算
}
\`\`\`

#### constexpr与调试

\`\`\`cpp
// constexpr函数可以在调试器中单步执行
constexpr int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    constexpr int result = factorial(5);  // 编译时计算
    // 调试时，result已经是120，无法单步执行
    
    int x = 5;
    int runtime_result = factorial(x);  // 运行时计算
    // 调试时可以单步执行
}
\`\`\`

#### constexpr的编译器支持

\`\`\`cpp
// C++11: 基本constexpr
// C++14: 放宽限制（循环、局部变量）
// C++17: constexpr if, constexpr lambda
// C++20: 动态内存、虚函数、try-catch
// C++23: consteval, if consteval

// 检查编译器支持
#if __cplusplus >= 202002L
    // C++20特性
#endif
\`\`\``,`,
            examples: [
                {
                    title: 'constexpr函数基础',
                    code: `#include <iostream>

// constexpr函数：编译时计算
constexpr int square(int n) {
    return n * n;
}

// constexpr递归
constexpr int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// constexpr条件计算
constexpr int abs(int n) {
    return n < 0 ? -n : n;
}

// constexpr循环（C++14）
constexpr int sum(int n) {
    int result = 0;
    for (int i = 1; i <= n; ++i) {
        result += i;
    }
    return result;
}

int main() {
    // 编译时计算
    constexpr int sq = square(5);
    constexpr int fact = factorial(5);
    constexpr int absolute = abs(-10);
    constexpr int total = sum(10);
    
    std::cout << "square(5) = " << sq << std::endl;
    std::cout << "factorial(5) = " << fact << std::endl;
    std::cout << "abs(-10) = " << absolute << std::endl;
    std::cout << "sum(10) = " << total << std::endl;
    
    // 用于数组大小
    int arr[square(3)];  // 大小为9
    std::cout << "\\n数组大小: " << sizeof(arr) / sizeof(arr[0]) << std::endl;
    
    // 运行时计算
    int x = 5;
    std::cout << "\\n运行时计算 square(" << x << ") = " << square(x) << std::endl;
    
    return 0;
}`
                },
                {
                    title: 'constexpr类与实际应用',
                    code: `#include <iostream>
#include <array>

// constexpr类
class Complex {
    double real, imag;
public:
    constexpr Complex(double r = 0, double i = 0) : real(r), imag(i) {}
    
    constexpr double getReal() const { return real; }
    constexpr double getImag() const { return imag; }
    
    constexpr Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }
    
    constexpr Complex operator*(const Complex& other) const {
        return Complex(
            real * other.real - imag * other.imag,
            real * other.imag + imag * other.real
        );
    }
};

// constexpr数组操作
constexpr int sumArray(const std::array<int, 5>& arr) {
    int sum = 0;
    for (int n : arr) {
        sum += n;
    }
    return sum;
}

// 编译时查找
constexpr int findMax(const int* arr, int size) {
    int maxVal = arr[0];
    for (int i = 1; i < size; ++i) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}

int main() {
    // constexpr复数运算
    constexpr Complex c1(3, 4);
    constexpr Complex c2(1, 2);
    constexpr Complex sum = c1 + c2;
    constexpr Complex product = c1 * c2;
    
    std::cout << "c1 = " << c1.getReal() << " + " << c1.getImag() << "i" << std::endl;
    std::cout << "c2 = " << c2.getReal() << " + " << c2.getImag() << "i" << std::endl;
    std::cout << "c1 + c2 = " << sum.getReal() << " + " << sum.getImag() << "i" << std::endl;
    std::cout << "c1 * c2 = " << product.getReal() << " + " << product.getImag() << "i" << std::endl;
    
    // constexpr数组
    constexpr std::array<int, 5> numbers = {1, 2, 3, 4, 5};
    constexpr int total = sumArray(numbers);
    std::cout << "\\n数组元素和: " << total << std::endl;
    
    // constexpr查找
    constexpr int data[] = {3, 1, 4, 1, 5, 9, 2, 6};
    constexpr int maxVal = findMax(data, 8);
    std::cout << "最大值: " << maxVal << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：constexpr数学函数',
                description: '实现编译时计算的数学函数',
                instructions: [
                    '实现constexpr函数power(base, exp)：计算幂',
                    '实现constexpr函数gcd(a, b)：最大公约数',
                    '实现constexpr函数isPrime(n)：判断质数',
                    '测试编译时和运行时计算'
                ],
                hints: [
                    'power可以使用循环或递归',
                    'gcd使用欧几里得算法：gcd(a,b) = gcd(b, a%b)',
                    'isPrime检查2到sqrt(n)的因子'
                ],
                solution: `#include <iostream>

// 计算幂
constexpr long long power(int base, int exp) {
    long long result = 1;
    for (int i = 0; i < exp; ++i) {
        result *= base;
    }
    return result;
}

// 最大公约数（欧几里得算法）
constexpr int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 判断质数
constexpr bool isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    // 编译时计算
    constexpr auto p1 = power(2, 10);
    constexpr auto p2 = power(3, 5);
    constexpr auto g = gcd(48, 18);
    constexpr bool prime = isPrime(97);
    
    std::cout << "=== 编译时计算 ===" << std::endl;
    std::cout << "2^10 = " << p1 << std::endl;
    std::cout << "3^5 = " << p2 << std::endl;
    std::cout << "gcd(48, 18) = " << g << std::endl;
    std::cout << "97是质数? " << (prime ? "是" : "否") << std::endl;
    
    // 用于编译时常量
    int arr[power(2, 3)];  // 大小为8
    std::cout << "\\n数组大小: " << sizeof(arr) / sizeof(arr[0]) << std::endl;
    
    // 运行时计算
    int base, exp;
    std::cout << "\\n=== 运行时计算 ===" << std::endl;
    std::cout << "输入基数和指数: ";
    std::cin >> base >> exp;
    std::cout << base << "^" << exp << " = " << power(base, exp) << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: 'constexpr函数与普通函数的主要区别是什么？',
                    options: [
                        'A. constexpr函数运行更快',
                        'B. constexpr函数可以在编译时计算',
                        'C. constexpr函数不能有参数',
                        'D. constexpr函数只能返回int'
                    ],
                    answer: 'B',
                    explanation: 'constexpr函数的主要特点是当参数是常量表达式时，可以在编译时计算结果，而不是运行时。'
                },
                {
                    type: 'single',
                    question: '以下代码哪个是正确的？',
                    options: [
                        'A. constexpr int x = std::cin.get();',
                        'B. constexpr int y = 10 + 20;',
                        'C. constexpr int z; z = 30;',
                        'D. constexpr int arr[10];'
                    ],
                    answer: 'B',
                    explanation: 'constexpr变量必须用常量表达式初始化。10+20是常量表达式，可以在编译时计算。std::cin.get()是运行时操作，不能用于constexpr。'
                },
                {
                    type: 'single',
                    question: 'constexpr函数可以用于什么？',
                    options: [
                        'A. 只能用于运行时计算',
                        'B. 数组大小、模板参数等需要编译时常量的地方',
                        'C. 只能用于整数计算',
                        'D. 只能用于简单表达式'
                    ],
                    answer: 'B',
                    explanation: 'constexpr函数的结果可以用作编译时常量，因此可以用于数组大小、模板参数、枚举值等需要编译时常量的场景。'
                },
                {
                    type: 'single',
                    question: 'C++14对constexpr函数做了什么改进？',
                    options: [
                        'A. 允许使用虚函数',
                        'B. 允许使用循环和局部变量',
                        'C. 允许使用动态内存分配',
                        'D. 允许使用异常'
                    ],
                    answer: 'B',
                    explanation: 'C++14放宽了constexpr函数的限制，允许使用局部变量、if语句、循环等，使constexpr函数更灵活。'
                },
                {
                    type: 'single',
                    question: 'constexpr函数隐式具有什么属性？',
                    options: [
                        'A. static',
                        'B. inline',
                        'C. virtual',
                        'D. extern'
                    ],
                    answer: 'B',
                    explanation: 'constexpr函数隐式是inline的，因为编译器需要看到函数的完整定义才能在编译时计算。'
                }
            ],
            references: [
                {
                    title: 'C++ constexpr详解',
                    url: 'https://en.cppreference.com/w/cpp/language/constexpr'
                },
                {
                    title: 'constexpr函数教程',
                    url: 'https://www.learncpp.com/cpp-tutorial/constexpr-and-consteval-functions/'
                }
            ],
            assistantTips: 'constexpr是现代C++的重要特性。它将计算从运行时移到编译时，提高性能。记住：constexpr函数既可以在编译时也可以在运行时执行，取决于参数。'
        },
        {
            id: '6.9',
            title: '函数指针',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 函数指针

### 什么是函数指针

**函数指针**：指向函数的指针，可以动态调用不同的函数。

\`\`\`cpp
int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

// 函数指针
int (*operation)(int, int);

operation = add;      // 指向add函数
int result = operation(3, 4);  // 调用add，结果为7

operation = multiply; // 指向multiply函数
result = operation(3, 4);  // 调用multiply，结果为12
\`\`\`

### 函数指针的声明

\`\`\`cpp
// 语法：返回类型 (*指针名)(参数类型列表)

// 无参数函数指针
void (*funcPtr)();

// 带参数的函数指针
int (*calcPtr)(int, int);

// 返回指针的函数指针
int* (*factoryPtr)(int);

// 指向const成员函数的指针
void (MyClass::*memberPtr)(int) const;
\`\`\`

### 函数指针的使用

#### 1. 基本使用

\`\`\`cpp
#include <iostream>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

int main() {
    // 声明函数指针
    int (*operation)(int, int);
    
    // 指向add函数
    operation = add;
    std::cout << "add(5, 3) = " << operation(5, 3) << std::endl;
    
    // 指向subtract函数
    operation = subtract;
    std::cout << "subtract(5, 3) = " << operation(5, 3) << std::endl;
    
    return 0;
}
\`\`\`

#### 2. 使用typedef简化

\`\`\`cpp
// 使用typedef定义函数指针类型
typedef int (*Operation)(int, int);

int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

int main() {
    Operation op = add;
    std::cout << op(3, 4) << std::endl;
    
    op = multiply;
    std::cout << op(3, 4) << std::endl;
    
    return 0;
}
\`\`\`

#### 3. 使用using（C++11推荐）

\`\`\`cpp
// 使用using定义函数指针类型（更清晰）
using Operation = int(*)(int, int);

// 或者
using Operation = int(int, int);
Operation* op = add;
\`\`\`

### 函数指针作为参数

\`\`\`cpp
#include <iostream>
#include <vector>

// 函数指针作为参数
void processArray(const std::vector<int>& arr, int (*processor)(int)) {
    for (int n : arr) {
        std::cout << processor(n) << " ";
    }
    std::cout << std::endl;
}

int square(int n) { return n * n; }
int doubleIt(int n) { return n * 2; }
int negate(int n) { return -n; }

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    std::cout << "平方: ";
    processArray(numbers, square);
    
    std::cout << "翻倍: ";
    processArray(numbers, doubleIt);
    
    std::cout << "取反: ";
    processArray(numbers, negate);
    
    return 0;
}
\`\`\`

### 函数指针作为返回值

\`\`\`cpp
#include <iostream>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }

// 返回函数指针
int (*getOperation(char op))(int, int) {
    switch (op) {
        case '+': return add;
        case '-': return subtract;
        case '*': return multiply;
        default: return nullptr;
    }
}

int main() {
    auto op = getOperation('+');
    if (op) {
        std::cout << "5 + 3 = " << op(5, 3) << std::endl;
    }
    
    return 0;
}
\`\`\`

### 函数指针数组

\`\`\`cpp
#include <iostream>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }
int divide(int a, int b) { return b != 0 ? a / b : 0; }

int main() {
    // 函数指针数组
    int (*operations[])(int, int) = {add, subtract, multiply, divide};
    char symbols[] = {'+', '-', '*', '/'};
    
    int a = 10, b = 5;
    for (int i = 0; i < 4; i++) {
        std::cout << a << " " << symbols[i] << " " << b << " = " 
                  << operations[i](a, b) << std::endl;
    }
    
    return 0;
}
\`\`\`

### std::function（C++11推荐）

现代C++推荐使用 \`std::function\` 替代函数指针：

\`\`\`cpp
#include <iostream>
#include <functional>

int add(int a, int b) { return a + b; }

int main() {
    // 使用std::function
    std::function<int(int, int)> operation = add;
    std::cout << operation(3, 4) << std::endl;
    
    // 可以存储lambda表达式
    operation = [](int a, int b) { return a * b; };
    std::cout << operation(3, 4) << std::endl;
    
    return 0;
}
\`\`\`

### 成员函数指针

\`\`\`cpp
#include <iostream>

class Calculator {
public:
    int add(int a, int b) { return a + b; }
    int multiply(int a, int b) { return a * b; }
};

int main() {
    // 成员函数指针
    int (Calculator::*funcPtr)(int, int) = &Calculator::add;
    
    Calculator calc;
    Calculator* calcPtr = &calc;
    
    // 使用对象调用
    std::cout << (calc.*funcPtr)(3, 4) << std::endl;
    
    // 使用指针调用
    std::cout << (calcPtr->*funcPtr)(3, 4) << std::endl;
    
    return 0;
}
\`\`\`

### 回调函数

函数指针常用于实现回调机制：

\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

// 使用函数指针作为回调
void forEach(const std::vector<int>& arr, void (*callback)(int)) {
    for (int n : arr) {
        callback(n);
    }
}

void print(int n) {
    std::cout << n << " ";
}

void printSquared(int n) {
    std::cout << n * n << " ";
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    std::cout << "原始: ";
    forEach(numbers, print);
    
    std::cout << "\\n平方: ";
    forEach(numbers, printSquared);
    
    return 0;
}
\`\`\`

### 函数指针 vs std::function vs lambda

| 特性 | 函数指针 | std::function | lambda |
|------|----------|---------------|--------|
| 类型安全 | 低 | 高 | 高 |
| 灵活性 | 低 | 高 | 高 |
| 性能 | 最高 | 较高 | 高 |
| 可读性 | 低 | 中 | 高 |
| 状态 | 无 | 有 | 有 |

### 最佳实践

1. **优先使用std::function**：更安全、更灵活
2. **使用using简化声明**
3. **考虑使用lambda替代**
4. **C风格API使用函数指针**

### 常见错误

#### 1. 函数指针类型不匹配

\`\`\`cpp
int add(int a, int b) { return a + b; }
double multiply(double a, double b) { return a * b; }

int main() {
    int (*fp)(int, int) = add;     // 正确
    // fp = multiply;              // 错误！类型不匹配
    
    // 正确：使用正确的函数指针类型
    double (*fp2)(double, double) = multiply;
}
\`\`\`

#### 2. 成员函数指针使用错误

\`\`\`cpp
class Calculator {
public:
    int add(int a, int b) { return a + b; }
};

int main() {
    // 错误：成员函数指针需要对象
    int (Calculator::*fp)(int, int) = &Calculator::add;
    // int result = fp(3, 4);  // 错误！需要对象
    
    // 正确：使用对象调用
    Calculator calc;
    int result = (calc.*fp)(3, 4);
}
\`\`\`

#### 3. 函数指针未初始化

\`\`\`cpp
int main() {
    int (*fp)(int, int);  // 未初始化
    // int result = fp(3, 4);  // 危险！未定义行为
    
    // 正确：初始化为nullptr或有效函数
    int (*fp2)(int, int) = nullptr;
    if (fp2) {
        int result = fp2(3, 4);
    }
}
\`\`\`

#### 4. 函数指针与重载函数

\`\`\`cpp
void func(int n);
void func(double d);

int main() {
    // void (*fp)() = func;  // 错误！二义性
    
    // 正确：显式转换
    void (*fp1)(int) = func;
    void (*fp2)(double) = func;
}
\`\`\`

#### 5. 函数指针与模板函数

\`\`\`cpp
template<typename T>
T add(T a, T b) { return a + b; }

int main() {
    // int (*fp)(int, int) = add;  // 错误！无法推导模板参数
    
    // 正确：显式指定模板参数
    int (*fp)(int, int) = add<int>;
}
\`\`\`

### 深入理解

#### 函数指针的内存表示

\`\`\`cpp
int add(int a, int b) { return a + b; }

int main() {
    int (*fp)(int, int) = add;
    
    // 函数指针存储的是函数代码的入口地址
    std::cout << "函数地址: " << reinterpret_cast<void*>(fp) << std::endl;
    
    // 通过函数指针调用
    int result = fp(3, 4);
    
    // 等价于
    result = (*fp)(3, 4);  // 显式解引用
}
\`\`\`

#### 函数指针与虚函数表

\`\`\`cpp
class Base {
public:
    virtual void func() { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    void func() override { std::cout << "Derived" << std::endl; }
};

int main() {
    // 虚函数通过虚函数表调用
    Base* ptr = new Derived();
    ptr->func();  // 通过vtable调用
    
    // 成员函数指针
    void (Base::*fp)() = &Base::func;
    (ptr->*fp)();  // 也通过vtable调用
}
\`\`\`

#### 函数指针与回调机制

\`\`\`cpp
#include <vector>
#include <iostream>

// 使用函数指针实现回调
void forEach(const std::vector<int>& arr, void (*callback)(int)) {
    for (int n : arr) {
        callback(n);
    }
}

void print(int n) { std::cout << n << " "; }
void doublePrint(int n) { std::cout << n * 2 << " "; }

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    forEach(numbers, print);       // 1 2 3 4 5
    std::cout << std::endl;
    forEach(numbers, doublePrint); // 2 4 6 8 10
}
\`\`\`

#### 函数指针与std::function

\`\`\`cpp
#include <functional>

int add(int a, int b) { return a + b; }

int main() {
    // 函数指针
    int (*fp)(int, int) = add;
    
    // std::function
    std::function<int(int, int)> func = add;
    
    // std::function更灵活
    func = [](int a, int b) { return a * b; };  // lambda
    func = std::bind(add, std::placeholders::_1, 10);  // 绑定
    
    // 类型擦除
    std::function<void()> f1 = []() {};
    std::function<void()> f2 = []() {};
    // f1和f2可以有不同的实际类型
}
\`\`\`

#### 函数指针与动态库

\`\`\`cpp
// 动态加载函数（Windows示例）
#include <windows.h>

typedef int (*AddFunc)(int, int);

int main() {
    HMODULE hDll = LoadLibrary("mylib.dll");
    if (hDll) {
        AddFunc add = (AddFunc)GetProcAddress(hDll, "add");
        if (add) {
            int result = add(3, 4);
        }
        FreeLibrary(hDll);
    }
}
\`\`\`

#### 函数指针数组与状态机

\`\`\`cpp
#include <iostream>

// 状态机示例
enum State { STATE_A, STATE_B, STATE_C, NUM_STATES };

void stateA() { std::cout << "State A" << std::endl; }
void stateB() { std::cout << "State B" << std::endl; }
void stateC() { std::cout << "State C" << std::endl; }

int main() {
    // 函数指针数组
    void (*stateTable[NUM_STATES])() = {stateA, stateB, stateC};
    
    // 状态转换
    State currentState = STATE_A;
    stateTable[currentState]();  // 输出：State A
    
    currentState = STATE_B;
    stateTable[currentState]();  // 输出：State B
}
\`\`\`

#### 函数指针与策略模式

\`\`\`cpp
#include <iostream>
#include <functional>

// 策略模式
class Sorter {
    std::function<bool(int, int)> compare;
public:
    Sorter(std::function<bool(int, int)> cmp) : compare(cmp) {}
    
    void sort(int* arr, int size) {
        for (int i = 0; i < size - 1; i++) {
            for (int j = i + 1; j < size; j++) {
                if (compare(arr[j], arr[i])) {
                    std::swap(arr[i], arr[j]);
                }
            }
        }
    }
};

int main() {
    int arr[] = {5, 2, 8, 1, 9};
    
    Sorter ascSorter([](int a, int b) { return a < b; });
    ascSorter.sort(arr, 5);  // 升序排序
    
    Sorter descSorter([](int a, int b) { return a > b; });
    descSorter.sort(arr, 5);  // 降序排序
}
\`\`\`

#### 函数指针与信号处理

\`\`\`cpp
#include <csignal>
#include <iostream>

void signalHandler(int signal) {
    std::cout << "Signal " << signal << " received" << std::endl;
}

int main() {
    // 注册信号处理函数
    std::signal(SIGINT, signalHandler);
    
    // 等待信号
    std::cout << "Press Ctrl+C to trigger signal" << std::endl;
    while (true) {}
}
\`\`\`

#### 函数指针的性能

\`\`\`cpp
#include <chrono>
#include <iostream>

int add(int a, int b) { return a + b; }

int main() {
    const int N = 100000000;
    
    // 直接调用
    auto start = std::chrono::high_resolution_clock::now();
    volatile int result = 0;
    for (int i = 0; i < N; i++) {
        result = add(i, i + 1);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Direct: " << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "ms" << std::endl;
    
    // 函数指针调用
    int (*fp)(int, int) = add;
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < N; i++) {
        result = fp(i, i + 1);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "Function pointer: " << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "ms" << std::endl;
}
\`\`\`

#### 函数指针与内联

\`\`\`cpp
inline int add(int a, int b) { return a + b; }

int main() {
    int (*fp)(int, int) = add;
    
    // 通过函数指针调用通常不会被内联
    int result = fp(3, 4);
    
    // 直接调用可能被内联
    result = add(3, 4);
}
\`\`\``,`,
            examples: [
                {
                    title: '函数指针基础',
                    code: `#include <iostream>
#include <vector>

// 定义函数指针类型
using CompareFunc = bool(*)(int, int);

// 排序函数，使用函数指针作为比较器
void sort(std::vector<int>& arr, CompareFunc compare) {
    for (size_t i = 0; i < arr.size() - 1; i++) {
        for (size_t j = i + 1; j < arr.size(); j++) {
            if (compare(arr[j], arr[i])) {
                std::swap(arr[i], arr[j]);
            }
        }
    }
}

// 比较函数
bool ascending(int a, int b) { return a < b; }
bool descending(int a, int b) { return a > b; }

void print(const std::vector<int>& arr) {
    for (int n : arr) std::cout << n << " ";
    std::cout << std::endl;
}

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3};
    
    // 升序排序
    std::vector<int> asc = numbers;
    sort(asc, ascending);
    std::cout << "升序: ";
    print(asc);
    
    // 降序排序
    std::vector<int> desc = numbers;
    sort(desc, descending);
    std::cout << "降序: ";
    print(desc);
    
    return 0;
}`
                },
                {
                    title: 'std::function与回调',
                    code: `#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>

// 使用std::function作为参数
void processNumbers(const std::vector<int>& numbers,
                   std::function<void(int)> callback) {
    for (int n : numbers) {
        callback(n);
    }
}

// 事件处理器类
class EventHandler {
public:
    using EventCallback = std::function<void(const std::string&)>;
    
    void setCallback(EventCallback cb) {
        callback = cb;
    }
    
    void triggerEvent(const std::string& event) {
        if (callback) {
            callback(event);
        }
    }
    
private:
    EventCallback callback;
};

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // 使用lambda作为回调
    int sum = 0;
    processNumbers(numbers, [&sum](int n) {
        sum += n;
    });
    std::cout << "总和: " << sum << std::endl;
    
    // 事件处理
    EventHandler handler;
    handler.setCallback([](const std::string& event) {
        std::cout << "事件触发: " << event << std::endl;
    });
    
    handler.triggerEvent("点击");
    handler.triggerEvent("双击");
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：实现简单计算器',
                description: '使用函数指针实现一个可扩展的计算器',
                instructions: [
                    '定义加减乘除四个函数',
                    '创建函数指针数组存储这些操作',
                    '根据用户输入选择操作',
                    '执行计算并输出结果'
                ],
                hints: [
                    '使用typedef或using定义函数指针类型',
                    '函数指针数组可以与字符数组配合使用',
                    '注意除法时除数为0的情况'
                ],
                solution: `#include <iostream>
#include <string>

// 定义函数指针类型
using MathOp = double(*)(double, double);

// 数学运算函数
double add(double a, double b) { return a + b; }
double subtract(double a, double b) { return a - b; }
double multiply(double a, double b) { return a * b; }
double divide(double a, double b) {
    if (b == 0) {
        std::cout << "错误：除数不能为0" << std::endl;
        return 0;
    }
    return a / b;
}

int main() {
    // 函数指针数组
    MathOp operations[] = {add, subtract, multiply, divide};
    std::string symbols[] = {"+", "-", "*", "/"};
    
    double a, b;
    char op;
    
    std::cout << "简单计算器" << std::endl;
    std::cout << "输入表达式 (如: 5 + 3): ";
    std::cin >> a >> op >> b;
    
    int index = -1;
    switch (op) {
        case '+': index = 0; break;
        case '-': index = 1; break;
        case '*': index = 2; break;
        case '/': index = 3; break;
        default:
            std::cout << "未知操作符: " << op << std::endl;
            return 1;
    }
    
    double result = operations[index](a, b);
    std::cout << a << " " << op << " " << b << " = " << result << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '以下哪个是正确的函数指针声明？',
                    options: [
                        'A. int *func(int, int);',
                        'B. int (*func)(int, int);',
                        'C. int func*(int, int);',
                        'D. (int *)func(int, int);'
                    ],
                    answer: 'B',
                    explanation: '函数指针的正确语法是：返回类型 (*指针名)(参数列表)。选项B声明了一个名为func的函数指针，指向返回int、接受两个int参数的函数。'
                },
                {
                    type: 'single',
                    question: '如何调用函数指针fp指向的函数？',
                    options: [
                        'A. fp();',
                        'B. *fp();',
                        'C. &fp();',
                        'D. fp->();'
                    ],
                    answer: 'A',
                    explanation: '函数指针可以直接使用fp()调用，也可以使用(*fp)()调用。两种方式都正确，但第一种更简洁。'
                },
                {
                    type: 'single',
                    question: 'std::function相比函数指针的优点是什么？',
                    options: [
                        'A. 运行速度更快',
                        'B. 可以存储lambda和函数对象',
                        'C. 占用内存更少',
                        'D. 只能存储普通函数'
                    ],
                    answer: 'B',
                    explanation: 'std::function更灵活，可以存储普通函数指针、lambda表达式、函数对象等，而函数指针只能指向普通函数。'
                },
                {
                    type: 'single',
                    question: '以下代码的输出是什么？\n\nint f(int x) { return x * 2; }\nint main() {\n    int (*p)(int) = f;\n    std::cout << p(5);\n}',
                    options: [
                        'A. 5',
                        'B. 10',
                        'C. 编译错误',
                        'D. 运行时错误'
                    ],
                    answer: 'B',
                    explanation: 'p是指向f的函数指针，p(5)调用f(5)，返回10。'
                },
                {
                    type: 'single',
                    question: '函数指针数组的作用是什么？',
                    options: [
                        'A. 存储函数的返回值',
                        'B. 存储多个函数指针，实现函数表或策略模式',
                        'C. 提高函数执行速度',
                        'D. 减少内存使用'
                    ],
                    answer: 'B',
                    explanation: '函数指针数组可以存储多个函数指针，常用于实现函数表、策略模式、命令模式等，根据索引或条件动态选择要执行的函数。'
                }
            ],
            references: [
                {
                    title: 'C++ 函数指针详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/function-pointers/'
                },
                {
                    title: 'std::function使用指南',
                    url: 'https://en.cppreference.com/w/cpp/utility/functional/function'
                }
            ],
            assistantTips: '函数指针是C语言的遗产，在现代C++中优先使用std::function和lambda。但理解函数指针对于阅读旧代码和与C API交互很重要。记住：函数指针存储的是函数的地址。'
        },
        {
            id: '6.10',
            title: '递归函数',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 递归函数

### 什么是递归

**递归**：函数直接或间接调用自身。

\`\`\`cpp
// 递归计算阶乘
int factorial(int n) {
    if (n <= 1) return 1;      // 基准情况
    return n * factorial(n - 1);  // 递归调用
}
\`\`\`

### 递归的组成

每个递归函数必须有两个部分：

1. **基准情况（Base Case）**：终止递归的条件
2. **递归情况（Recursive Case）**：向基准情况推进

\`\`\`cpp
int factorial(int n) {
    // 基准情况
    if (n <= 1) {
        return 1;
    }
    // 递归情况
    return n * factorial(n - 1);
}

// 执行过程：factorial(5)
// 5 * factorial(4)
// 5 * 4 * factorial(3)
// 5 * 4 * 3 * factorial(2)
// 5 * 4 * 3 * 2 * factorial(1)
// 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

### 经典递归示例

#### 1. 斐波那契数列

\`\`\`cpp
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// fibonacci(5) = 5
// 序列: 0, 1, 1, 2, 3, 5, 8, 13, 21...
\`\`\`

#### 2. 二分查找

\`\`\`cpp
int binarySearch(const std::vector<int>& arr, int target, int left, int right) {
    if (left > right) return -1;  // 未找到
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) return mid;
    if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid - 1);
    }
    return binarySearch(arr, target, mid + 1, right);
}
\`\`\`

#### 3. 汉诺塔

\`\`\`cpp
void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        std::cout << "移动盘子 1 从 " << from << " 到 " << to << std::endl;
        return;
    }
    hanoi(n - 1, from, aux, to);
    std::cout << "移动盘子 " << n << " 从 " << from << " 到 " << to << std::endl;
    hanoi(n - 1, aux, to, from);
}
\`\`\`

### 递归的内存模型

每次递归调用都会在栈上创建新的栈帧：

\`\`\`
factorial(4) 的调用栈：
┌─────────────────┐
│ factorial(1)    │ ← 栈顶
│ n = 1, return 1 │
├─────────────────┤
│ factorial(2)    │
│ n = 2, return 2*1 = 2
├─────────────────┤
│ factorial(3)    │
│ n = 3, return 3*2 = 6
├─────────────────┤
│ factorial(4)    │ ← 栈底
│ n = 4, return 4*6 = 24
└─────────────────┘
\`\`\`

### 递归 vs 迭代

| 特性 | 递归 | 迭代 |
|------|------|------|
| 代码简洁性 | 高 | 较低 |
| 内存使用 | 较高（栈空间） | 较低 |
| 性能 | 较低（函数调用开销） | 较高 |
| 适用场景 | 树遍历、分治算法 | 简单循环 |

\`\`\`cpp
// 递归版本
int factorialRecursive(int n) {
    if (n <= 1) return 1;
    return n * factorialRecursive(n - 1);
}

// 迭代版本
int factorialIterative(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
\`\`\`

### 尾递归优化

尾递归：递归调用是函数的最后操作，可以被编译器优化为迭代。

\`\`\`cpp
// 非尾递归
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 乘法在递归之后
}

// 尾递归版本
int factorialTail(int n, int accumulator = 1) {
    if (n <= 1) return accumulator;
    return factorialTail(n - 1, n * accumulator);  // 递归是最后操作
}
\`\`\`

### 递归的注意事项

1. **确保有基准情况**：否则无限递归
2. **注意栈溢出**：递归深度过大
3. **避免重复计算**：使用记忆化
4. **考虑迭代替代**：性能敏感场景

\`\`\`cpp
// 记忆化优化斐波那契
#include <unordered_map>

std::unordered_map<int, long long> memo;

long long fibonacciMemo(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    
    memo[n] = fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
    return memo[n];
}
\`\`\`

### 常见错误

#### 1. 缺少基准情况

\`\`\`cpp
// 错误：没有基准情况
int factorial(int n) {
    return n * factorial(n - 1);  // 无限递归！
}

// 正确：添加基准情况
int factorial(int n) {
    if (n <= 1) return 1;  // 基准情况
    return n * factorial(n - 1);
}
\`\`\`

#### 2. 基准情况错误

\`\`\`cpp
// 错误：基准情况不正确
int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);  // factorial(-1)会导致无限递归
}

// 正确：处理所有情况
int factorial(int n) {
    if (n <= 1) return 1;  // 处理n <= 1的情况
    return n * factorial(n - 1);
}
\`\`\`

#### 3. 递归深度过大导致栈溢出

\`\`\`cpp
// 危险：递归深度过大
int deepRecursion(int n) {
    if (n <= 0) return 0;
    return 1 + deepRecursion(n - 1);
}

int main() {
    // deepRecursion(100000);  // 栈溢出！
}

// 正确：使用迭代
int deepIteration(int n) {
    int result = 0;
    for (int i = 0; i < n; i++) {
        result++;
    }
    return result;
}
\`\`\`

#### 4. 重复计算

\`\`\`cpp
// 低效：重复计算
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);  // 大量重复计算
}

// 正确：使用记忆化
int fibonacci(int n, std::unordered_map<int, int>& memo) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    return memo[n];
}
\`\`\`

#### 5. 误解递归的执行顺序

\`\`\`cpp
void printNumbers(int n) {
    if (n <= 0) return;
    printNumbers(n - 1);  // 先递归
    std::cout << n << " ";  // 后打印
}

int main() {
    printNumbers(5);  // 输出：1 2 3 4 5
}

// 如果交换顺序
void printNumbersReverse(int n) {
    if (n <= 0) return;
    std::cout << n << " ";  // 先打印
    printNumbersReverse(n - 1);  // 后递归
}

int main() {
    printNumbersReverse(5);  // 输出：5 4 3 2 1
}
\`\`\`

### 深入理解

#### 递归的调用栈

\`\`\`
factorial(4) 的调用栈：

调用过程：
┌─────────────────┐
│ factorial(4)    │ n=4, 等待factorial(3)
├─────────────────┤
│ factorial(3)    │ n=3, 等待factorial(2)
├─────────────────┤
│ factorial(2)    │ n=2, 等待factorial(1)
├─────────────────┤
│ factorial(1)    │ n=1, 返回1
└─────────────────┘

返回过程：
┌─────────────────┐
│ factorial(1)    │ 返回1
├─────────────────┤
│ factorial(2)    │ 返回2*1=2
├─────────────────┤
│ factorial(3)    │ 返回3*2=6
├─────────────────┤
│ factorial(4)    │ 返回4*6=24
└─────────────────┘
\`\`\`

#### 尾递归优化

\`\`\`cpp
// 非尾递归
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 乘法在递归之后
}

// 尾递归
int factorialTail(int n, int accumulator = 1) {
    if (n <= 1) return accumulator;
    return factorialTail(n - 1, n * accumulator);  // 递归是最后操作
}

// 编译器优化后（示意）
int factorialTail(int n, int accumulator = 1) {
start:
    if (n <= 1) return accumulator;
    accumulator = n * accumulator;
    n = n - 1;
    goto start;  // 跳转，无函数调用
}
\`\`\`

#### 递归与分治算法

\`\`\`cpp
// 归并排序
void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left >= right) return;  // 基准情况
    
    int mid = left + (right - left) / 2;
    
    // 分治
    mergeSort(arr, left, mid);      // 排序左半部分
    mergeSort(arr, mid + 1, right);  // 排序右半部分
    
    // 合并
    merge(arr, left, mid, right);
}

// 快速排序
void quickSort(std::vector<int>& arr, int low, int high) {
    if (low >= high) return;  // 基准情况
    
    int pivot = partition(arr, low, high);  // 分区
    
    quickSort(arr, low, pivot - 1);   // 排序左半部分
    quickSort(arr, pivot + 1, high);  // 排序右半部分
}
\`\`\`

#### 递归与树遍历

\`\`\`cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};

// 前序遍历
void preorder(TreeNode* root) {
    if (root == nullptr) return;  // 基准情况
    
    std::cout << root->val << " ";  // 访问根
    preorder(root->left);           // 遍历左子树
    preorder(root->right);          // 遍历右子树
}

// 中序遍历
void inorder(TreeNode* root) {
    if (root == nullptr) return;
    
    inorder(root->left);
    std::cout << root->val << " ";
    inorder(root->right);
}

// 后序遍历
void postorder(TreeNode* root) {
    if (root == nullptr) return;
    
    postorder(root->left);
    postorder(root->right);
    std::cout << root->val << " ";
}
\`\`\`

#### 递归与动态规划

\`\`\`cpp
// 递归+记忆化 = 自顶向下的动态规划
int climbStairs(int n, std::vector<int>& memo) {
    if (n <= 2) return n;
    if (memo[n] != -1) return memo[n];
    
    memo[n] = climbStairs(n - 1, memo) + climbStairs(n - 2, memo);
    return memo[n];
}

// 迭代 = 自底向上的动态规划
int climbStairs(int n) {
    if (n <= 2) return n;
    
    std::vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}
\`\`\`

#### 递归与回溯

\`\`\`cpp
// 八皇后问题
bool isSafe(std::vector<std::string>& board, int row, int col) {
    // 检查是否可以放置皇后
    // ...
}

bool solveNQueens(std::vector<std::string>& board, int row) {
    if (row >= board.size()) return true;  // 所有皇后都放置成功
    
    for (int col = 0; col < board.size(); col++) {
        if (isSafe(board, row, col)) {
            board[row][col] = 'Q';  // 放置皇后
            
            if (solveNQueens(board, row + 1)) {
                return true;  // 找到解决方案
            }
            
            board[row][col] = '.';  // 回溯，撤销放置
        }
    }
    
    return false;  // 当前行无法放置
}
\`\`\`

#### 递归的性能分析

\`\`\`cpp
// 时间复杂度分析
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 时间复杂度：O(2^n)
// 空间复杂度：O(n) - 递归深度

// 记忆化后
int fibonacciMemo(int n, std::vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    
    memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    return memo[n];
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
\`\`\`

#### 递归与迭代的选择

\`\`\`cpp
// 递归：代码简洁，适合树遍历、分治算法
void traverseTree(TreeNode* root) {
    if (root == nullptr) return;
    traverseTree(root->left);
    traverseTree(root->right);
}

// 迭代：性能更好，适合简单循环
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// 选择原则：
// 1. 树、图等数据结构：递归更自然
// 2. 简单循环：迭代更高效
// 3. 性能敏感：优先迭代
// 4. 代码可读性：递归通常更清晰
\`\`\`

#### 递归的栈溢出防护

\`\`\`cpp
#include <iostream>

// 使用静态变量或全局变量跟踪递归深度
int maxDepth = 0;

void safeRecursion(int n, int depth = 0) {
    if (depth > 1000) {  // 限制递归深度
        std::cout << "递归深度过大" << std::endl;
        return;
    }
    
    if (n <= 0) return;
    
    maxDepth = std::max(maxDepth, depth);
    safeRecursion(n - 1, depth + 1);
}

int main() {
    safeRecursion(100);
    std::cout << "最大递归深度: " << maxDepth << std::endl;
}
\`\`\`

#### 递归与并发

\`\`\`cpp
#include <future>

// 并行递归
int parallelFibonacci(int n) {
    if (n <= 1) return n;
    
    if (n > 30) {  // 大任务并行处理
        auto future1 = std::async(std::launch::async, parallelFibonacci, n - 1);
        auto future2 = std::async(std::launch::async, parallelFibonacci, n - 2);
        
        return future1.get() + future2.get();
    } else {  // 小任务串行处理
        return parallelFibonacci(n - 1) + parallelFibonacci(n - 2);
    }
}
\`\`\``,`,
            examples: [
                {
                    title: '递归基础示例',
                    code: `#include <iostream>

// 阶乘
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// 斐波那契
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 数字之和
int digitSum(int n) {
    if (n < 10) return n;
    return n % 10 + digitSum(n / 10);
}

int main() {
    std::cout << "5! = " << factorial(5) << std::endl;
    std::cout << "fibonacci(10) = " << fibonacci(10) << std::endl;
    std::cout << "12345的数字之和 = " << digitSum(12345) << std::endl;
    return 0;
}`
                },
                {
                    title: '递归与记忆化',
                    code: `#include <iostream>
#include <vector>

// 普通递归（效率低）
long long fibSlow(int n) {
    if (n <= 1) return n;
    return fibSlow(n - 1) + fibSlow(n - 2);
}

// 记忆化递归
std::vector<long long> memo(100, -1);

long long fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    
    memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    return memo[n];
}

// 动态规划（迭代）
long long fibDP(int n) {
    if (n <= 1) return n;
    
    std::vector<long long> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

int main() {
    std::cout << "fibMemo(40) = " << fibMemo(40) << std::endl;
    std::cout << "fibDP(40) = " << fibDP(40) << std::endl;
    return 0;
}`
                }
            ],
            handsOn: {
                title: '动手实践：实现递归函数',
                description: '实现几个经典递归函数',
                instructions: [
                    '实现power(base, exp)：计算幂',
                    '实现gcd(a, b)：最大公约数',
                    '实现isPalindrome(str)：判断回文',
                    '测试所有函数'
                ],
                hints: [
                    'power: base^exp = base * base^(exp-1)',
                    'gcd: 使用欧几里得算法',
                    'isPalindrome: 比较首尾字符，递归中间部分'
                ],
                solution: `#include <iostream>
#include <string>

// 幂运算
long long power(int base, int exp) {
    if (exp == 0) return 1;
    return base * power(base, exp - 1);
}

// 最大公约数
int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

// 回文判断
bool isPalindrome(const std::string& str, int left, int right) {
    if (left >= right) return true;
    if (str[left] != str[right]) return false;
    return isPalindrome(str, left + 1, right - 1);
}

bool isPalindrome(const std::string& str) {
    return isPalindrome(str, 0, str.length() - 1);
}

int main() {
    std::cout << "2^10 = " << power(2, 10) << std::endl;
    std::cout << "gcd(48, 18) = " << gcd(48, 18) << std::endl;
    std::cout << "racecar是回文? " << (isPalindrome("racecar") ? "是" : "否") << std::endl;
    std::cout << "hello是回文? " << (isPalindrome("hello") ? "是" : "否") << std::endl;
    return 0;
}`
            },
            quiz: [
                {
                    type: 'single',
                    question: '递归函数必须包含什么？',
                    options: [
                        'A. 至少一个参数',
                        'B. 基准情况和递归情况',
                        'C. 返回值',
                        'D. 循环语句'
                    ],
                    answer: 'B',
                    explanation: '递归函数必须包含基准情况（终止条件）和递归情况（向基准情况推进），否则会导致无限递归。'
                },
                {
                    type: 'single',
                    question: '以下代码的输出是什么？\n\nint f(int n) {\n    if (n <= 1) return 1;\n    return n + f(n - 1);\n}\nstd::cout << f(5);',
                    options: [
                        'A. 5',
                        'B. 10',
                        'C. 15',
                        'D. 25'
                    ],
                    answer: 'C',
                    explanation: 'f(5) = 5 + f(4) = 5 + 4 + f(3) = 5 + 4 + 3 + f(2) = 5 + 4 + 3 + 2 + f(1) = 5 + 4 + 3 + 2 + 1 = 15。'
                },
                {
                    type: 'single',
                    question: '递归的主要缺点是什么？',
                    options: [
                        'A. 代码复杂',
                        'B. 可能栈溢出',
                        'C. 不能处理大数据',
                        'D. 只能用于数学计算'
                    ],
                    answer: 'B',
                    explanation: '递归的主要缺点是可能栈溢出，因为每次递归调用都会在栈上创建新的栈帧，递归深度过大时会导致栈溢出。'
                },
                {
                    type: 'single',
                    question: '什么是尾递归？',
                    options: [
                        'A. 递归调用在函数末尾',
                        'B. 递归调用是函数的最后操作',
                        'C. 只有一个递归调用',
                        'D. 递归深度为1'
                    ],
                    answer: 'B',
                    explanation: '尾递归是指递归调用是函数的最后操作，没有后续计算。编译器可以将尾递归优化为迭代，避免栈溢出。'
                },
                {
                    type: 'single',
                    question: '记忆化的作用是什么？',
                    options: [
                        'A. 减少内存使用',
                        'B. 避免重复计算',
                        'C. 增加递归深度',
                        'D. 简化代码'
                    ],
                    answer: 'B',
                    explanation: '记忆化通过存储已计算的结果，避免重复计算，显著提高递归算法的效率。'
                }
            ],
            references: [
                {
                    title: 'C++ 递归详解',
                    url: 'https://www.learncpp.com/cpp-tutorial/recursion/'
                },
                {
                    title: '递归与迭代',
                    url: 'https://en.cppreference.com/w/cpp/language/functions'
                }
            ],
            assistantTips: '递归是强大的编程技术，但要小心使用。确保有明确的基准情况，注意递归深度，对于性能敏感的场景考虑使用迭代或记忆化优化。'
        }
    ]
};