/**
 * 第4章：表达式与运算符
 * 完整的学习内容
 */

var Unit4Data = {
    id: 4,
    title: '表达式与运算符',
    description: '深入理解C++的表达式和各种运算符',
    lessons: [
        {
            id: '4.1',
            title: '表达式基础',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 表达式基础

### 什么是表达式？

表达式由**一个或多个运算对象**组成，用于**计算一个值**。

\`\`\`cpp
42              // 字面量是表达式
x               // 变量是表达式
x + y           // 算术表达式
x = 10          // 赋值表达式
func()          // 函数调用是表达式
\`\`\`

### 表达式的组成

- **运算对象（操作数）**：参与运算的值
- **运算符**：指定运算操作
- **结果**：表达式计算得到的值

\`\`\`cpp
int result = a + b * c;
//          ^   ^ ^
//          |   | |
//       操作数 运算符 操作数
\`\`\`

### 运算符分类

| 类别 | 运算符 |
|------|--------|
| 算术 | + - * / % |
| 关系 | == != < > <= >= |
| 逻辑 | && \|\| ! |
| 赋值 | = += -= *= /= |
| 递增递减 | ++ -- |
| 位运算 | & \| ^ ~ << >> |
| 条件 | ?: |
| 逗号 | , |
| 其他 | sizeof typeid :: |

### 运算符优先级

优先级决定运算顺序，**优先级高的先计算**：

\`\`\`cpp
int x = 2 + 3 * 4;   // 2 + (3 * 4) = 14
int y = (2 + 3) * 4; // 5 * 4 = 20
\`\`\`

**常用优先级（从高到低）**：

| 优先级 | 运算符 | 结合性 |
|--------|--------|--------|
| 1 | :: | 左到右 |
| 2 | () [] -> . ++ -- | 左到右 |
| 3 | ! ~ ++ -- + - * & sizeof | 右到左 |
| 4 | * / % | 左到右 |
| 5 | + - | 左到右 |
| 6 | << >> | 左到右 |
| 7 | < <= > >= | 左到右 |
| 8 | == != | 左到右 |
| 9 | & | 左到右 |
| 10 | ^ | 左到右 |
| 11 | \| | 左到右 |
| 12 | && | 左到右 |
| 13 | \|\| | 左到右 |
| 14 | ?: | 右到左 |
| 15 | = += -= ... | 右到左 |
| 16 | , | 左到右 |

### 结合性

当优先级相同时，结合性决定运算顺序：

\`\`\`cpp
int a = 10 - 5 - 2;   // (10 - 5) - 2 = 3，左结合
int b = a = c = 5;    // a = (c = 5)，右结合
\`\`\`

### 求值顺序

C++中大多数运算符的求值顺序是**未指定的**：

\`\`\`cpp
int i = 0;
int x = i + ++i;  // 未定义行为！i和++i的求值顺序不确定

// 安全的做法
int j = i;
int x = j + ++i;  // 明确的求值顺序
\`\`\`

**明确求值顺序的运算符**：
- \`&&\`：先计算左操作数，只有为真才计算右操作数
- \`||\`：先计算左操作数，只有为假才计算右操作数
- \`?:\`：先计算条件，再根据结果计算一个分支
- \`,\`：先计算左操作数，再计算右操作数

### 左值与右值

- **左值（lvalue）**：可以取地址的表达式，代表一个存储位置
- **右值（rvalue）**：不能取地址的表达式，代表一个值

\`\`\`cpp
int x = 10;    // x是左值，10是右值
int y = x;     // x可以用作右值
x = 20;        // x作为左值使用

int& ref = x;  // 左值引用绑定到左值
int&& rref = 10;  // 右值引用绑定到右值（C++11）
\`\`\`

### 最佳实践

1. **使用括号明确优先级**
   \`\`\`cpp
   // 不确定时使用括号
   int result = (a + b) * c;
   bool valid = (x > 0) && (y > 0);
   \`\`\`

2. **避免在表达式中多次修改同一变量**
   \`\`\`cpp
   // 危险：未定义行为
   int x = i + ++i;
   
   // 正确：分开写
   int temp = i;
   ++i;
   int x = temp + i;
   \`\`\`

3. **利用短路求值**
   \`\`\`cpp
   // 安全访问指针
   if (ptr && ptr->value > 0) { }
   
   // 避免除零
   if (x != 0 && 10 / x > 1) { }
   \`\`\`

### 常见错误

1. **优先级错误**
   \`\`\`cpp
   int x = 2 + 3 * 4;   // 14，不是 20
   bool b = a < b < c;  // 错误！应该是 a < b && b < c
   \`\`\`

2. **未定义的求值顺序**
   \`\`\`cpp
   int i = 0;
   int x = i + ++i;  // 未定义行为
   int y = f(i) + g(++i);  // 未定义行为
   \`\`\`

3. **混淆 = 和 ==**
   \`\`\`cpp
   if (x = 5) { }   // 赋值，条件为真
   if (x == 5) { }  // 比较
   \`\`\`

### 深入理解

**表达式求值的四个阶段**

1. **确定操作数**：计算每个操作数的值
2. **类型转换**：必要时进行隐式转换
3. **执行运算**：根据运算符语义计算
4. **产生结果**：返回值或副作用

**左值与右值的本质**

- **左值**：有持久地址，可以取地址
- **右值**：临时值，即将销毁
- **将亡值**：C++11 引入，可被移动

**运算符重载的影响**

重载运算符会改变运算符的语义：
- 重载的运算符函数调用顺序是确定的
- 短路求值对重载的 && 和 || 无效
- 逗号运算符重载后不保证求值顺序

**表达式模板**

高级技术，用于延迟计算：
\`\`\`cpp
// 表达式模板可以优化复杂表达式
auto result = vec1 + vec2 + vec3;
// 不创建临时 vector，延迟到赋值时计算
\`\`\``,

            examples: [
                {
                    title: '运算符优先级',
                    code: `#include <iostream>

int main() {
    // 算术运算符优先级
    int a = 2 + 3 * 4;      // 14，不是20
    int b = (2 + 3) * 4;    // 20
    
    std::cout << "2 + 3 * 4 = " << a << std::endl;
    std::cout << "(2 + 3) * 4 = " << b << std::endl;
    
    // 混合运算符
    int x = 10, y = 5;
    bool result = x > y && x < 20;
    std::cout << "\\nx > y && x < 20 = " << result << std::endl;
    
    // 赋值和比较
    int z;
    if ((z = x + y) > 10) {  // 赋值表达式的值是赋值后的值
        std::cout << "z = " << z << std::endl;
    }
    
    return 0;
}`,
                    description: '演示运算符优先级和结合性。'
                },
                {
                    title: '求值顺序问题',
                    code: `#include <iostream>

int main() {
    // 危险：未定义的求值顺序
    int i = 0;
    // int x = i + ++i;  // 危险！未定义行为
    
    // 安全的做法
    int j = 0;
    int a = j;
    int b = ++j;
    int x = a + b;
    std::cout << "安全的计算: " << x << std::endl;
    
    // 短路求值
    int value = 0;
    if (true || (value = 10)) {  // value不会被赋值
        std::cout << "短路求值后 value = " << value << std::endl;
    }
    
    // && 短路
    if (false && (value = 20)) {  // value不会被赋值
        // 不会执行
    }
    std::cout << "再次短路后 value = " << value << std::endl;
    
    return 0;
}`,
                    description: '演示求值顺序和短路求值。'
                }
            ],
            handsOn: {
                title: '表达式计算练习',
                description: '计算包含多种运算符的表达式的值。',
                initialCode: `#include <iostream>

int main() {
    int a = 5, b = 2, c = 3;
    
    // ===== 你的代码 =====
    // 请计算以下表达式的值并赋值给result
    // 表达式: a + b * c
    // 注意：先算乘除，后算加减
    
    int result = 0;  // 修改这一行
    
    std::cout << "a + b * c = " << result << std::endl;
    
    // 再计算: (a + b) * c
    int result2 = 0;  // 修改这一行
    
    std::cout << "(a + b) * c = " << result2 << std::endl;
    
    return 0;
}`,
                expectedOutput: 'a + b * c = 11\n(a + b) * c = 21',
                solutionRegex: 'result.*=.*a.*\\+.*b.*\\*.*c|result.*=.*11',
                hint: '乘法优先级高于加法，所以 a + b * c 等于 a + (b * c)',
                xp: 100
            },
            quiz: [
                { type: 'single', question: '表达式 2 + 3 * 4 的值是多少？', options: [{ text: '20' }, { text: '14', correct: true }, { text: '24' }, { text: '9' }], explanation: '乘法优先级高于加法，先计算3*4=12，再计算2+12=14。' },
                { type: 'single', question: '运算符的结合性决定什么？', options: [{ text: '运算顺序' }, { text: '优先级相同时的运算顺序', correct: true }, { text: '运算结果' }, { text: '运算类型' }], explanation: '当优先级相同时，结合性决定运算顺序。' },
                { type: 'single', question: '以下哪个运算符有明确的求值顺序？', options: [{ text: '+' }, { text: '*' }, { text: '&&', correct: true }, { text: '|' }], explanation: '&&和||有短路求值特性，先计算左操作数。' },
                { type: 'single', question: '什么是左值？', options: [{ text: '左边的值' }, { text: '可以取地址的表达式', correct: true }, { text: '常量' }, { text: '临时值' }], explanation: '左值是代表存储位置的表达式，可以取地址。' },
                { type: 'single', question: 'int x = i + ++i; 为什么是危险的？', options: [{ text: '语法错误' }, { text: '求值顺序未定义', correct: true }, { text: '类型不匹配' }, { text: '溢出' }], explanation: 'i和++i的求值顺序未定义，可能导致未定义行为。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.1节' }
            ],
            assistantTips: [
                '不确定优先级时使用括号',
                '避免在表达式中多次修改同一变量',
                '理解短路求值可以提高代码效率'
            ]
        },
        {
            id: '4.2',
            title: '算术运算符',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 算术运算符

### 基本算术运算符

| 运算符 | 名称 | 示例 | 说明 |
|--------|------|------|------|
| + | 加法 | a + b | 两数相加 |
| - | 减法 | a - b | 两数相减 |
| * | 乘法 | a * b | 两数相乘 |
| / | 除法 | a / b | 两数相除 |
| % | 取模 | a % b | 整数除法的余数 |

### 整数除法

\`\`\`cpp
int a = 7 / 3;    // 2（整数除法，舍去小数）
int b = 7 % 3;    // 1（余数）

// 注意：除数不能为0
// int c = 10 / 0;  // 运行时错误
\`\`\`

### 浮点除法

\`\`\`cpp
double x = 7.0 / 3.0;  // 2.333...
double y = 7 / 3.0;    // 2.333...（整数提升为浮点）
int z = 7 / 3;         // 2（整数除法）
\`\`\`

### 一元运算符

\`\`\`cpp
int x = 10;
int y = -x;   // y = -10（一元负号）
int z = +x;   // z = 10（一元正号，通常省略）
\`\`\`

### 取模运算

取模运算符 \`%\` 只能用于整数：

\`\`\`cpp
int a = 10 % 3;   // 1
int b = -10 % 3;  // -1（结果的符号与被除数相同）
int c = 10 % -3;  // 1

// 常见用途
// 1. 判断奇偶
if (n % 2 == 0) { /* 偶数 */ }

// 2. 循环索引
int index = i % size;

// 3. 提取数字
int lastDigit = n % 10;
\`\`\`

### 溢出

算术运算可能导致溢出：

\`\`\`cpp
#include <climits>

int a = INT_MAX;
int b = a + 1;  // 溢出！结果是INT_MIN

// 使用更大的类型
long long c = (long long)a + 1;  // 正确
\`\`\`

### 类型转换

运算时会发生隐式类型转换：

\`\`\`cpp
int i = 5;
double d = 2.5;

auto result = i + d;  // double，i被提升为double
// result 的类型是 double
\`\`\`

**类型提升规则**：
1. 小于int的类型提升为int
2. 有符号和无符号混合时，转为无符号
3. 低精度向高精度转换

### 数学函数

\`\`\`cpp
#include <cmath>

double x = 2.0;
std::pow(x, 3);    // x³ = 8.0
std::sqrt(x);      // √x ≈ 1.414
std::abs(-5);      // 绝对值 = 5
std::fabs(-5.5);   // 浮点绝对值 = 5.5
std::ceil(2.1);    // 向上取整 = 3.0
std::floor(2.9);   // 向下取整 = 2.0
std::round(2.5);   // 四舍五入 = 3.0
\`\`\`

### 最佳实践

1. **注意整数除法**
   \`\`\`cpp
   int a = 5, b = 2;
   double result = a / b;  // 2.0，不是 2.5
   double correct = (double)a / b;  // 2.5
   \`\`\`

2. **检查除零**
   \`\`\`cpp
   int divide(int a, int b) {
       if (b == 0) {
           throw std::runtime_error("除零错误");
       }
       return a / b;
   }
   \`\`\`

3. **使用取模判断整除**
   \`\`\`cpp
   // 判断奇偶
   if (n % 2 == 0) { /* 偶数 */ }
   
   // 判断能否被3整除
   if (n % 3 == 0) { /* 能 */ }
   \`\`\`

### 常见错误

1. **整数溢出**
   \`\`\`cpp
   int a = INT_MAX;
   int b = a + 1;  // 溢出！
   long long c = (long long)a + 1;  // 正确
   \`\`\`

2. **浮点精度问题**
   \`\`\`cpp
   double x = 0.1 + 0.2;
   if (x == 0.3) { }  // 可能失败
   \`\`\`

3. **负数取模**
   \`\`\`cpp
   int a = -10 % 3;   // -1（C++11 后定义明确）
   int b = 10 % -3;   // 1
   \`\`\`

### 深入理解

**整数运算的溢出行为**

- 有符号整数溢出：未定义行为
- 无符号整数溢出：回绕（模运算）

**浮点运算的精度**

浮点数运算可能产生精度误差：
- 0.1 无法精确表示
- 累加误差会放大
- 使用 Kahan 求和减少误差

**数学函数的使用**

\`\`\`cpp
#include <cmath>

// 幂运算
std::pow(2, 10);    // 1024
std::sqrt(16);      // 4
std::cbrt(27);      // 3（立方根）

// 对数
std::log(2.718);    // 自然对数
std::log10(100);    // 常用对数
std::log2(8);       // 以2为底

// 三角函数
std::sin(M_PI / 2); // 1
std::cos(0);        // 1
std::tan(M_PI / 4); // 1
\`\`\`

**数值限制**

\`\`\`cpp
#include <limits>

std::numeric_limits<int>::max();
std::numeric_limits<double>::epsilon();
std::numeric_limits<float>::infinity();
\`\`\``,

            examples: [
                {
                    title: '算术运算符',
                    code: `#include <iostream>
#include <cmath>

int main() {
    // 基本运算
    int a = 10, b = 3;
    std::cout << a << " + " << b << " = " << a + b << std::endl;
    std::cout << a << " - " << b << " = " << a - b << std::endl;
    std::cout << a << " * " << b << " = " << a * b << std::endl;
    std::cout << a << " / " << b << " = " << a / b << std::endl;
    std::cout << a << " % " << b << " = " << a % b << std::endl;
    
    // 整数除法 vs 浮点除法
    std::cout << "\\n整数除法: 7 / 3 = " << 7 / 3 << std::endl;
    std::cout << "浮点除法: 7.0 / 3.0 = " << 7.0 / 3.0 << std::endl;
    
    // 数学函数
    std::cout << "\\n数学函数:" << std::endl;
    std::cout << "pow(2, 10) = " << std::pow(2, 10) << std::endl;
    std::cout << "sqrt(2) = " << std::sqrt(2) << std::endl;
    std::cout << "abs(-10) = " << std::abs(-10) << std::endl;
    
    return 0;
}`,
                    description: '演示算术运算符的基本用法。'
                },
                {
                    title: '取模运算应用',
                    code: `#include <iostream>

int main() {
    int n = 12345;
    
    // 提取各位数字
    int ones = n % 10;           // 5
    int tens = (n / 10) % 10;    // 4
    int hundreds = (n / 100) % 10; // 3
    
    std::cout << n << " 的各位数字:" << std::endl;
    std::cout << "个位: " << ones << std::endl;
    std::cout << "十位: " << tens << std::endl;
    std::cout << "百位: " << hundreds << std::endl;
    
    // 判断奇偶
    std::cout << "\\n" << n << " 是" << (n % 2 == 0 ? "偶数" : "奇数") << std::endl;
    
    // 循环索引
    std::cout << "\\n循环索引示例:" << std::endl;
    for (int i = 0; i < 10; ++i) {
        std::cout << i % 3 << " ";  // 0 1 2 0 1 2 0 1 2 0
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '演示取模运算的常见应用。'
                }
            ],
            handsOn: {
                title: '算术运算练习',
                description: '计算一个三位数各位数字之和。',
                initialCode: `#include <iostream>

int main() {
    int n = 456;
    
    // TODO: 计算各位数字之和
    // 提示：使用 / 和 % 运算符
    
    int sum = 0;
    
    std::cout << n << " 各位数字之和: " << sum << std::endl;
    
    return 0;
}`,
                expectedOutput: '456 各位数字之和: 15',
                solutionRegex: '%|/',
                hint: '使用 % 10 获取个位，/ 10 去掉个位',
                xp: 100
            },
            quiz: [
                { type: 'single', question: '7 / 3 的结果是什么？', options: [{ text: '2.33' }, { text: '2', correct: true }, { text: '3' }, { text: '编译错误' }], explanation: '整数除法结果仍为整数，舍去小数部分。' },
                { type: 'single', question: '取模运算符 % 可以用于浮点数吗？', options: [{ text: '可以' }, { text: '不可以', correct: true }, { text: '取决于编译器' }, { text: '只有double可以' }], explanation: '取模运算符只能用于整数类型。' },
                { type: 'single', question: '-10 % 3 的结果是什么？', options: [{ text: '1' }, { text: '-1', correct: true }, { text: '2' }, { text: '编译错误' }], explanation: '取模结果的符号与被除数相同。' },
                { type: 'single', question: '如何判断一个整数是偶数？', options: [{ text: 'n / 2 == 0' }, { text: 'n % 2 == 0', correct: true }, { text: 'n * 2 == 0' }, { text: 'n - 2 == 0' }], explanation: '偶数除以2余数为0，所以用n % 2 == 0判断。' },
                { type: 'single', question: 'int a = INT_MAX; int b = a + 1; 会发生什么？', options: [{ text: '编译错误' }, { text: 'b等于INT_MIN', correct: true }, { text: 'b等于INT_MAX' }, { text: '运行时错误' }], explanation: '整数溢出会回绕，INT_MAX + 1变成INT_MIN。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.2节' }
            ],
            assistantTips: [
                '注意整数除法和浮点除法的区别',
                '取模运算只能用于整数',
                '注意算术溢出问题'
            ]
        },
        {
            id: '4.3',
            title: '关系与逻辑运算符',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 关系与逻辑运算符

### 关系运算符

| 运算符 | 名称 | 示例 | 结果 |
|--------|------|------|------|
| == | 等于 | a == b | 相等为true |
| != | 不等于 | a != b | 不相等为true |
| < | 小于 | a < b | a小于b为true |
| > | 大于 | a > b | a大于b为true |
| <= | 小于等于 | a <= b | a小于等于b为true |
| >= | 大于等于 | a >= b | a大于等于b为true |

\`\`\`cpp
int a = 10, b = 20;

bool r1 = a == b;  // false
bool r2 = a != b;  // true
bool r3 = a < b;   // true
bool r4 = a > b;   // false
bool r5 = a <= 10; // true
bool r6 = b >= 20; // true
\`\`\`

### 逻辑运算符

| 运算符 | 名称 | 示例 | 说明 |
|--------|------|------|------|
| && | 逻辑与 | a && b | 两者都为真才为真 |
| \|\| | 逻辑或 | a \|\| b | 任一为真就为真 |
| ! | 逻辑非 | !a | 真变假，假变真 |

\`\`\`cpp
bool a = true, b = false;

bool r1 = a && b;   // false
bool r2 = a || b;   // true
bool r3 = !a;       // false
bool r4 = !b;       // true
\`\`\`

### 短路求值

\`\`\`cpp
// && 短路：如果左边为假，右边不计算
if (ptr != nullptr && ptr->value > 0) {
    // 如果ptr为nullptr，不会访问ptr->value
}

// || 短路：如果左边为真，右边不计算
if (x == 0 || 10 / x > 1) {
    // 如果x为0，不会计算10/x（避免除零）
}
\`\`\`

### 真值表

**&&（逻辑与）**：
| A | B | A && B |
|---|---|--------|
| F | F | F |
| F | T | F |
| T | F | F |
| T | T | T |

**||（逻辑或）**：
| A | B | A \|\| B |
|---|---|---------|
| F | F | F |
| F | T | T |
| T | F | T |
| T | T | T |

### 常见陷阱

\`\`\`cpp
// 陷阱1：混淆 == 和 =
if (x = 5) { }   // 赋值！x被赋值为5，条件为真
if (x == 5) { }  // 比较，正确

// 陷阱2：比较浮点数
double x = 0.1 + 0.2;
if (x == 0.3) { }  // 可能失败！浮点精度问题

// 陷阱3：链式比较
if (a < b < c) { }  // 错误！这是 (a < b) < c
if (a < b && b < c) { }  // 正确
\`\`\`

### 布尔值转换

\`\`\`cpp
// 非零值为真，零值为假
bool b1 = 42;    // true
bool b2 = 0;     // false
bool b3 = -1;    // true

// 指针转换
int* p = nullptr;
if (p) { }       // p不为nullptr时为真
if (!p) { }      // p为nullptr时为真
\`\`\`

### 最佳实践

1. **使用显式比较**
   \`\`\`cpp
   // 推荐：意图明确
   if (x == 0) { }
   if (ptr != nullptr) { }
   
   // 不推荐：隐式转换
   if (x) { }
   if (ptr) { }
   \`\`\`

2. **避免链式比较**
   \`\`\`cpp
   // 错误
   if (a < b < c) { }  // 这是 (a < b) < c
   
   // 正确
   if (a < b && b < c) { }
   \`\`\`

3. **利用短路求值优化**
   \`\`\`cpp
   // 将最可能为假的条件放在前面
   if (rareCondition && expensiveCheck()) { }
   \`\`\`

### 常见错误

1. **混淆 && 和 &**
   \`\`\`cpp
   bool a = true, b = false;
   bool r1 = a && b;  // false（逻辑与）
   bool r2 = a & b;   // false（位与）
   // 对于 bool 结果相同，但语义不同
   \`\`\`

2. **浮点数比较**
   \`\`\`cpp
   double x = 0.1 + 0.2;
   if (x == 0.3) { }  // 可能失败
   
   // 正确：使用容差
   if (std::abs(x - 0.3) < 1e-9) { }
   \`\`\`

3. **指针与整数比较**
   \`\`\`cpp
   int* p = nullptr;
   if (p == 0) { }    // 可以，但不推荐
   if (p == nullptr) { }  // 推荐
   \`\`\`

### 深入理解

**逻辑运算符的短路机制**

短路求值的工作原理：
- \`&&\`：左操作数为假时，不计算右操作数
- \`||\`：左操作数为真时，不计算右操作数

**关系运算符的返回值**

关系运算符返回 bool 类型：
- true 转换为 1
- false 转换为 0
- 可以参与算术运算

**布尔上下文**

在需要 bool 的上下文中：
- 非零值转换为 true
- 零值转换为 false
- 指针：非空为 true，空为 false

**三态逻辑**

某些情况下需要三态逻辑：
\`\`\`cpp
enum class TriState { False, True, Unknown };
\`\`\``,

            examples: [
                {
                    title: '关系运算符',
                    code: `#include <iostream>
#include <iomanip>

int main() {
    int a = 10, b = 20;
    
    std::cout << std::boolalpha;
    
    std::cout << "a = " << a << ", b = " << b << std::endl;
    std::cout << "a == b: " << (a == b) << std::endl;
    std::cout << "a != b: " << (a != b) << std::endl;
    std::cout << "a < b: " << (a < b) << std::endl;
    std::cout << "a > b: " << (a > b) << std::endl;
    std::cout << "a <= 10: " << (a <= 10) << std::endl;
    std::cout << "b >= 20: " << (b >= 20) << std::endl;
    
    // 字符串比较
    std::string s1 = "apple";
    std::string s2 = "banana";
    std::cout << "\\n字符串比较:" << std::endl;
    std::cout << "apple < banana: " << (s1 < s2) << std::endl;
    
    return 0;
}`,
                    description: '演示关系运算符的使用。'
                },
                {
                    title: '逻辑运算符与短路求值',
                    code: `#include <iostream>

bool check(int x) {
    std::cout << "check(" << x << ") 被调用" << std::endl;
    return x > 0;
}

int main() {
    std::cout << std::boolalpha;
    
    // && 短路
    std::cout << "\\n测试 && 短路:" << std::endl;
    bool r1 = false && check(1);  // check不会被调用
    std::cout << "false && check(1) = " << r1 << std::endl;
    
    bool r2 = true && check(1);   // check会被调用
    std::cout << "true && check(1) = " << r2 << std::endl;
    
    // || 短路
    std::cout << "\\n测试 || 短路:" << std::endl;
    bool r3 = true || check(2);   // check不会被调用
    std::cout << "true || check(2) = " << r3 << std::endl;
    
    bool r4 = false || check(2);  // check会被调用
    std::cout << "false || check(2) = " << r4 << std::endl;
    
    // 实际应用：安全访问指针
    int* ptr = nullptr;
    if (ptr && *ptr > 0) {
        std::cout << "不会执行" << std::endl;
    }
    std::cout << "安全检查通过" << std::endl;
    
    return 0;
}`,
                    description: '演示逻辑运算符和短路求值。'
                }
            ],
            handsOn: {
                title: '逻辑运算符练习',
                description: '使用逻辑运算符判断年龄分组。',
                initialCode: `#include <iostream>

int main() {
    int age = 25;
    
    // ===== 你的代码 =====
    // 使用逻辑运算符判断:
    // 1. age是否在18-30岁之间（青年）
    // 2. age是否小于18岁（未成年）
    // 3. age是否大于等于60岁（老年）
    
    bool isYouth = false;      // 修改这一行，判断是否18-30岁
    bool isMinor = false;      // 修改这一行，判断是否未成年
    bool isElderly = false;    // 修改这一行，判断是否老年
    
    std::cout << std::boolalpha;
    std::cout << "年龄 " << age << ":" << std::endl;
    std::cout << "青年(18-30): " << isYouth << std::endl;
    std::cout << "未成年(<18): " << isMinor << std::endl;
    std::cout << "老年(>=60): " << isElderly << std::endl;
    
    return 0;
}`,
                expectedOutput: '年龄 25:\n青年(18-30): true\n未成年(<18): false\n老年(>=60): false',
                solutionRegex: 'age.*>=.*18.*&&.*age.*<=.*30|isYouth.*true',
                hint: '使用 && 表示"并且"，使用 > < >= <= 比较',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'true && false 的结果是什么？', options: [{ text: 'true' }, { text: 'false', correct: true }, { text: '1' }, { text: '编译错误' }], explanation: '逻辑与运算，只有两者都为真才为真。' },
                { type: 'single', question: '短路求值是什么意思？', options: [{ text: '快速计算' }, { text: '根据左边结果决定是否计算右边', correct: true }, { text: '跳过计算' }, { text: '并行计算' }], explanation: '短路求值指&&和||根据左边的结果决定是否计算右边的表达式。' },
                { type: 'single', question: 'if (x = 5) 有什么问题？', options: [{ text: '语法错误' }, { text: '这是赋值而不是比较', correct: true }, { text: '没有问题' }, { text: 'x被赋值为false' }], explanation: 'x = 5是赋值表达式，值为5（非零为真），应该用x == 5进行比较。' },
                { type: 'single', question: '如何正确判断 a < b < c？', options: [{ text: 'a < b < c' }, { text: 'a < b && b < c', correct: true }, { text: '(a < b) < c' }, { text: 'a < (b < c)' }], explanation: 'a < b < c会被解析为(a < b) < c，应该用a < b && b < c。' },
                { type: 'single', question: '!true 的结果是什么？', options: [{ text: 'true' }, { text: 'false', correct: true }, { text: '1' }, { text: '0' }], explanation: '逻辑非运算符!将true变为false。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.3节' }
            ],
            assistantTips: [
                '区分 == 和 =',
                '利用短路求值提高代码安全性和效率',
                '避免直接比较浮点数'
            ]
        },
        {
            id: '4.4',
            title: '赋值运算符',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 赋值运算符

### 基本赋值运算符

\`\`\`cpp
int x;
x = 10;  // 将10赋值给x

// 赋值表达式返回左值的引用
int y;
y = x = 20;  // x = 20，然后 y = x
// 最终 x = 20, y = 20
\`\`\`

### 复合赋值运算符

| 运算符 | 等价形式 | 示例 |
|--------|---------|------|
| += | a = a + b | a += b |
| -= | a = a - b | a -= b |
| *= | a = a * b | a *= b |
| /= | a = a / b | a /= b |
| %= | a = a % b | a %= b |
| &= | a = a & b | a &= b |
| \|= | a = a \| b | a \|= b |
| ^= | a = a ^ b | a ^= b |
| <<= | a = a << b | a <<= b |
| >>= | a = a >> b | a >>= b |

\`\`\`cpp
int x = 10;

x += 5;   // x = x + 5 = 15
x -= 3;   // x = x - 3 = 12
x *= 2;   // x = x * 2 = 24
x /= 4;   // x = x / 4 = 6
x %= 4;   // x = x % 4 = 2
\`\`\`

### 赋值与初始化

\`\`\`cpp
// 初始化
int x = 10;      // 拷贝初始化
int y(10);       // 直接初始化
int z{10};       // 列表初始化

// 赋值
x = 20;          // 赋值（x已存在）
\`\`\`

### 赋值运算符的特点

1. **返回左值的引用**
\`\`\`cpp
int x = 10;
(x = 20) = 30;  // 合法！x最终为30
\`\`\`

2. **右结合性**
\`\`\`cpp
int a, b, c;
a = b = c = 0;  // 从右向左赋值
// 等价于 a = (b = (c = 0));
\`\`\`

3. **类型转换**
\`\`\`cpp
double d = 3.14;
int i = d;      // i = 3，发生窄化转换

// 列表初始化不允许窄化
// int j = {d};  // 错误！
\`\`\`

### 自定义类型的赋值

\`\`\`cpp
class MyString {
public:
    MyString& operator=(const MyString& other) {
        if (this != &other) {  // 防止自赋值
            // 释放旧资源
            // 分配新资源
            // 复制内容
        }
        return *this;
    }
};
\`\`\`

### 常见错误

\`\`\`cpp
// 错误1：混淆 == 和 =
if (x = 5) { }   // 赋值，条件为真
if (x == 5) { }  // 比较，正确

// 错误2：忘记赋值
int x;           // 未初始化
x += 10;         // 危险！x的值不确定

// 错误3：自赋值
a = a;           // 通常无害，但自定义类型需要处理
\`\`\`

### 最佳实践

1. **使用复合赋值运算符**
   \`\`\`cpp
   // 推荐
   x += 5;
   x *= 2;
   
   // 不推荐
   x = x + 5;
   x = x * 2;
   \`\`\`

2. **区分初始化和赋值**
   \`\`\`cpp
   int x = 10;  // 初始化
   x = 20;      // 赋值
   
   // 初始化更高效
   std::string s1 = "Hello";  // 可能两次构造
   std::string s2("Hello");   // 直接构造
   \`\`\`

3. **链式赋值要谨慎**
   \`\`\`cpp
   int a, b, c;
   a = b = c = 0;  // 可读性好
   
   // 但避免复杂表达式
   // x = y = func();  // 不推荐
   \`\`\`

### 常见错误

1. **混淆 == 和 =**
   \`\`\`cpp
   if (x = 5) { }   // 赋值，条件为真
   if (x == 5) { }  // 比较
   
   // 防御性编程
   if (5 == x) { }  // 写错会编译错误
   \`\`\`

2. **赋值表达式作为条件**
   \`\`\`cpp
   // 危险但有时有用
   while ((c = getchar()) != EOF) { }
   // 注意括号！
   \`\`\`

3. **类型转换陷阱**
   \`\`\`cpp
   double d = 3.14;
   int i = d;  // 窄化转换
   // i = 3
   \`\`\`

### 深入理解

**赋值运算符的返回值**

赋值表达式返回左值的引用：
\`\`\`cpp
int x;
(x = 10) = 20;  // 合法，x 最终为 20
\`\`\`

**复合赋值的优势**

复合赋值运算符的优势：
1. 代码更简洁
2. 可能更高效（只计算左操作数一次）
3. 意图更明确

**移动赋值（C++11）**

\`\`\`cpp
std::string s1 = "Hello";
std::string s2;
s2 = std::move(s1);  // 移动赋值
// s1 变为空，s2 = "Hello"
\`\`\`

**自定义类型的赋值**

自定义类型需要实现赋值运算符：
\`\`\`cpp
class MyString {
public:
    MyString& operator=(const MyString& other) {
        if (this != &other) {  // 防止自赋值
            // 释放旧资源
            // 分配新资源
            // 复制内容
        }
        return *this;
    }
};
\`\`\``,

            examples: [
                {
                    title: '赋值运算符',
                    code: `#include <iostream>

int main() {
    int x = 10;
    
    std::cout << "初始值: x = " << x << std::endl;
    
    // 复合赋值
    x += 5;
    std::cout << "x += 5: " << x << std::endl;
    
    x -= 3;
    std::cout << "x -= 3: " << x << std::endl;
    
    x *= 2;
    std::cout << "x *= 2: " << x << std::endl;
    
    x /= 4;
    std::cout << "x /= 4: " << x << std::endl;
    
    x %= 3;
    std::cout << "x %= 3: " << x << std::endl;
    
    // 链式赋值
    int a, b, c;
    a = b = c = 100;
    std::cout << "\\n链式赋值: a=" << a << ", b=" << b << ", c=" << c << std::endl;
    
    return 0;
}`,
                    description: '演示赋值运算符的使用。'
                },
                {
                    title: '赋值与类型转换',
                    code: `#include <iostream>
#include <iomanip>

int main() {
    // 隐式类型转换
    double d = 3.14159;
    int i = d;  // 窄化转换
    
    std::cout << std::fixed << std::setprecision(5);
    std::cout << "double d = " << d << std::endl;
    std::cout << "int i = d = " << i << std::endl;
    
    // 复合赋值中的类型转换
    int x = 10;
    x += 2.5;  // 2.5被截断为2
    std::cout << "\\nx += 2.5 后 x = " << x << std::endl;
    
    // bool转换
    bool b = 0;     // false
    bool b2 = 42;   // true
    bool b3 = -1;   // true
    
    std::cout << std::boolalpha;
    std::cout << "\\nbool b = 0: " << b << std::endl;
    std::cout << "bool b2 = 42: " << b2 << std::endl;
    std::cout << "bool b3 = -1: " << b3 << std::endl;
    
    return 0;
}`,
                    description: '演示赋值中的类型转换。'
                }
            ],
            handsOn: {
                title: '赋值运算符练习',
                description: '使用复合赋值运算符简化计算。',
                initialCode: `#include <iostream>

int main() {
    int x = 10;
    
    // ===== 你的代码 =====
    // 请使用复合赋值运算符完成以下操作:
    // 1. x += 5  (等价于 x = x + 5)
    // 2. x *= 2  (等价于 x = x * 2)
    // 3. x -= 3  (等价于 x = x - 3)
    
    // 在下面使用复合赋值运算符
    x += 5;  // 修改这里
    x *= 2;  // 修改这里
    x -= 3;  // 修改这里
    
    std::cout << "最终 x = " << x << std::endl;
    
    // 额外练习：计算 1+2+3+...+10 的和
    int sum = 0;
    for (int i = 1; i <= 10; ++i) {
        // ===== 你的代码 =====
        // 使用 += 将 i 加到 sum 上
        sum += i;  // 修改这里
    }
    std::cout << "1+2+3+...+10 = " << sum << std::endl;
    
    return 0;
}`,
                expectedOutput: '最终 x = 27\n1+2+3+...+10 = 55',
                solutionRegex: '\\+=.*-=|\\*=|\\-=',
                hint: '复合赋值运算符如 += 相当于 x = x + 5',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'x += 5 等价于什么？', options: [{ text: 'x = 5' }, { text: 'x = x + 5', correct: true }, { text: 'x + 5' }, { text: 'x++' }], explanation: '复合赋值运算符+=将右边的值加到左边变量上。' },
                { type: 'single', question: 'a = b = c = 0 的求值顺序是什么？', options: [{ text: '从左到右' }, { text: '从右到左', correct: true }, { text: '不确定' }, { text: '同时赋值' }], explanation: '赋值运算符是右结合的，所以从右向左计算。' },
                { type: 'single', question: 'int x = 3.14; x的值是多少？', options: [{ text: '3.14' }, { text: '3', correct: true }, { text: '4' }, { text: '编译错误' }], explanation: 'double赋值给int会发生窄化转换，小数部分被截断。' },
                { type: 'single', question: '赋值表达式的返回值是什么？', options: [{ text: 'void' }, { text: '左值的引用', correct: true }, { text: '右值' }, { text: '常量' }], explanation: '赋值表达式返回左操作数的引用，所以可以链式赋值。' },
                { type: 'single', question: '以下哪个是正确的初始化？', options: [{ text: 'int x;' }, { text: 'int x = 10;', correct: true }, { text: 'int 10 = x;' }, { text: 'x = 10;' }], explanation: 'int x = 10是正确的初始化语法。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.4节' }
            ],
            assistantTips: [
                '区分初始化和赋值',
                '优先使用复合赋值运算符',
                '注意类型转换可能导致的精度丢失'
            ]
        },
        {
            id: '4.5',
            title: '递增递减运算符',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 递增递减运算符

### 前置与后置

\`\`\`cpp
int x = 5;

// 前置递增：先加1，再使用
int a = ++x;  // x = 6, a = 6

// 后置递增：先使用，再加1
int b = x++;  // b = 6, x = 7
\`\`\`

### 返回值

| 运算符 | 返回值 | 示例 |
|--------|--------|------|
| ++x | 递增后的值（左值） | int& ref = ++x; |
| x++ | 递增前的值（右值） | int val = x++; |
| --x | 递减后的值（左值） | int& ref = --x; |
| x-- | 递减前的值（右值） | int val = x--; |

\`\`\`cpp
int x = 5;

++x = 10;    // 正确！前置++返回左值
// x++ = 10; // 错误！后置++返回右值

int y = ++x; // y = 11, x = 11
int z = x++; // z = 11, x = 12
\`\`\`

### 常见用法

\`\`\`cpp
// 循环中
for (int i = 0; i < 10; ++i) {  // 前置++更高效
    // ...
}

// 迭代器
std::vector<int> v = {1, 2, 3};
auto it = v.begin();
++it;  // 移动到下一个元素

// 数组索引
int arr[] = {10, 20, 30};
int i = 0;
int x = arr[i++];  // x = 10, i = 1
int y = arr[++i];  // y = 30, i = 2
\`\`\`

### 性能差异

对于基本类型，前置和后置性能相同。但对于自定义类型（如迭代器），前置++更高效：

\`\`\`cpp
// 后置++需要保存旧值
Iterator operator++(int) {
    Iterator temp = *this;  // 复制
    ++(*this);
    return temp;  // 返回副本
}

// 前置++不需要保存
Iterator& operator++() {
    // 递增操作
    return *this;
}
\`\`\`

### 常见陷阱

\`\`\`cpp
int i = 0;

// 陷阱1：未定义行为
int x = i + ++i;  // 错误！求值顺序未定义

// 陷阱2：多次修改
int y = ++i + ++i;  // 错误！同一表达式多次修改

// 陷阱3：在复杂表达式中使用
int arr[] = {1, 2, 3};
int j = 0;
int z = arr[j++] + arr[j++];  // 错误！未定义行为

// 正确做法：分开写
i++;
int x = i + i;
\`\`\`

### 最佳实践

1. **优先使用前置++**：对于自定义类型更高效
2. **避免在复杂表达式中使用**：防止未定义行为
3. **保持代码清晰**：可读性比简洁性更重要

\`\`\`cpp
// 不推荐
*ptr++ = *++ptr;

// 推荐
*ptr = *(ptr + 1);
ptr += 2;
\`\`\`

### 最佳实践

1. **优先使用前置 ++**
   \`\`\`cpp
   // 对于迭代器和自定义类型，前置 ++ 更高效
   for (auto it = v.begin(); it != v.end(); ++it) { }
   
   // 对于基本类型，两者效率相同
   ++i;
   i++;
   \`\`\`

2. **避免在复杂表达式中使用**
   \`\`\`cpp
   // 危险
   int x = arr[i++] + arr[i++];
   
   // 安全
   int a = arr[i++];
   int b = arr[i++];
   int x = a + b;
   \`\`\`

3. **理解返回值差异**
   \`\`\`cpp
   int x = 5;
   int a = ++x;  // a = 6, x = 6
   int b = x++;  // b = 6, x = 7
   \`\`\`

### 常见错误

1. **同一表达式多次修改**
   \`\`\`cpp
   int i = 0;
   int x = ++i + ++i;  // 未定义行为
   \`\`\`

2. **混淆前置和后置**
   \`\`\`cpp
   int arr[] = {1, 2, 3};
   int i = 0;
   int x = arr[i++];  // x = 1, i = 1
   int y = arr[++i];  // y = 3, i = 2
   \`\`\`

3. **对常量使用**
   \`\`\`cpp
   const int x = 10;
   ++x;  // 错误！不能修改常量
   \`\`\`

### 深入理解

**前置 vs 后置的实现**

\`\`\`cpp
// 前置 ++ 的典型实现
T& operator++() {
    ++value;
    return *this;
}

// 后置 ++ 的典型实现
T operator++(int) {
    T temp = *this;  // 保存旧值
    ++value;
    return temp;     // 返回旧值
}
\`\`\`

**性能差异的原因**

后置 ++ 需要：
1. 保存当前状态
2. 执行递增
3. 返回保存的状态

前置 ++ 只需要：
1. 执行递增
2. 返回引用

**序列点与求值顺序**

C++17 明确了更多求值顺序：
\`\`\`cpp
// C++17: 右操作数先求值
int x = 0;
int arr[2] = {0};
arr[x++] = x;  // C++17 定义明确
\`\`\`

**迭代器的递增**

迭代器的递增操作：
- 前置 ++ 返回递增后的迭代器
- 后置 ++ 返回递增前的迭代器副本
- 对于复杂迭代器，前置 ++ 明显更高效`,

            examples: [
                {
                    title: '前置与后置',
                    code: `#include <iostream>

int main() {
    int x = 5;
    
    std::cout << "初始值: x = " << x << std::endl;
    
    // 前置++
    int a = ++x;
    std::cout << "int a = ++x; 后: x = " << x << ", a = " << a << std::endl;
    
    // 后置++
    x = 5;  // 重置
    int b = x++;
    std::cout << "int b = x++; 后: x = " << x << ", b = " << b << std::endl;
    
    // 前置--
    x = 5;
    int c = --x;
    std::cout << "int c = --x; 后: x = " << x << ", c = " << c << std::endl;
    
    // 后置--
    x = 5;
    int d = x--;
    std::cout << "int d = x--; 后: x = " << x << ", d = " << d << std::endl;
    
    return 0;
}`,
                    description: '演示前置和后置递增递减的区别。'
                },
                {
                    title: '实际应用',
                    code: `#include <iostream>
#include <vector>

int main() {
    // 数组遍历
    int arr[] = {10, 20, 30, 40, 50};
    int i = 0;
    
    std::cout << "使用后置++遍历数组:" << std::endl;
    while (i < 5) {
        std::cout << "arr[" << i << "] = " << arr[i++] << std::endl;
    }
    
    // vector迭代器
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    std::cout << "\\n使用前置++遍历vector:" << std::endl;
    for (auto it = v.begin(); it != v.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    // 累加求和
    int sum = 0;
    int n = 1;
    while (n <= 10) {
        sum += n++;
    }
    std::cout << "\\n1到10的和: " << sum << std::endl;
    
    return 0;
}`,
                    description: '演示递增运算符的实际应用。'
                }
            ],
            handsOn: {
                title: '递增递减运算符练习',
                description: '分析前置和后置递增的效果。',
                initialCode: `#include <iostream>

int main() {
    int a = 5;
    
    // ===== 你的代码 =====
    // 分析以下表达式的结果
    
    // 前置++：先递增，再使用值
    int b = ++a;  // a先变为6，再赋值给b
    // 问：此时 a = ?  b = ?
    
    int c = 5;
    // 后置++：先使用值，再递增
    int d = c++;  // 先赋值给d，c再变为6
    // 问：此时 c = ?  d = ?
    
    std::cout << "前置递增: a = " << a << ", b = " << b << std::endl;
    std::cout << "后置递增: c = " << c << ", d = " << d << std::endl;
    
    // ===== 你的代码 =====
    // 计算最终结果
    int x = 10;
    // x++ + ++x + x++ + ++x 的结果是什么？
    // 提示：分步计算，注意每次递增的影响
    
    int result = 0;  // 修改这一行，填入正确的结果
    // 提示：10 + 12 + 11 + 13 = ?
    
    std::cout << "x++ + ++x + x++ + ++x 的结果是: " << result << std::endl;
    
    return 0;
}`,
                expectedOutput: '前置递增: a = 6, b = 6\n后置递增: c = 6, d = 5\nx++ + ++x + x++ + ++x 的结果是: 46',
                solutionRegex: 'result.*=.*46|=.*46',
                hint: '前置++先递增后使用，后置++先使用后递增',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'int x = 5; int y = ++x; y的值是多少？', options: [{ text: '5' }, { text: '6', correct: true }, { text: '4' }, { text: '不确定' }], explanation: '前置++先加1再使用，所以x变成6，y也得到6。' },
                { type: 'single', question: 'int x = 5; int y = x++; y的值是多少？', options: [{ text: '5', correct: true }, { text: '6' }, { text: '4' }, { text: '不确定' }], explanation: '后置++先使用再加1，所以y得到5，x变成6。' },
                { type: 'single', question: '为什么优先使用前置++？', options: [{ text: '更简洁' }, { text: '对自定义类型更高效', correct: true }, { text: '更安全' }, { text: '没有区别' }], explanation: '前置++不需要保存旧值，对自定义类型（如迭代器）更高效。' },
                { type: 'single', question: 'int i = 0; int x = i + ++i; 有什么问题？', options: [{ text: '语法错误' }, { text: '未定义行为', correct: true }, { text: 'x = 1' }, { text: 'x = 2' }], explanation: '同一表达式中多次修改同一变量，求值顺序未定义。' },
                { type: 'single', question: '++x 可以作为左值吗？', options: [{ text: '不可以' }, { text: '可以', correct: true }, { text: '取决于类型' }, { text: '取决于上下文' }], explanation: '前置++返回递增后的值的引用，可以作为左值。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.5节' }
            ],
            assistantTips: [
                '优先使用前置++，特别是对迭代器',
                '避免在同一表达式中多次修改同一变量',
                '理解前置和后置的返回值差异'
            ]
        },
        {
            id: '4.6',
            title: '位运算符',
            duration: '30分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 400,
            concepts: `## 位运算符

### 位运算符概述

| 运算符 | 名称 | 示例 | 说明 |
|--------|------|------|------|
| & | 按位与 | a & b | 两位都为1才为1 |
| \| | 按位或 | a \| b | 任一位为1就为1 |
| ^ | 按位异或 | a ^ b | 两位不同为1 |
| ~ | 按位取反 | ~a | 0变1，1变0 |
| << | 左移 | a << n | 左移n位 |
| >> | 右移 | a >> n | 右移n位 |

### 按位与 (&)

\`\`\`cpp
unsigned char a = 0b1100;  // 12
unsigned char b = 0b1010;  // 10
unsigned char c = a & b;   // 0b1000 = 8

// 应用：掩码操作
unsigned char flags = 0b1101;
unsigned char mask = 0b0100;
if (flags & mask) {  // 检查第2位是否为1
    // 第2位为1
}
\`\`\`

### 按位或 (|)

\`\`\`cpp
unsigned char a = 0b1100;  // 12
unsigned char b = 0b1010;  // 10
unsigned char c = a | b;   // 0b1110 = 14

// 应用：设置位
unsigned char flags = 0b1000;
flags |= 0b0010;  // 设置第1位，flags = 0b1010
\`\`\`

### 按位异或 (^)

\`\`\`cpp
unsigned char a = 0b1100;  // 12
unsigned char b = 0b1010;  // 10
unsigned char c = a ^ b;   // 0b0110 = 6

// 特性：a ^ b ^ b = a
// 应用：简单加密、交换变量
int x = 5, y = 10;
x = x ^ y;
y = x ^ y;
x = x ^ y;
// x = 10, y = 5
\`\`\`

### 按位取反 (~)

\`\`\`cpp
unsigned char a = 0b1100;   // 12
unsigned char b = ~a;       // 0b11110011 = 243

// 注意：对于有符号数，结果取决于实现
\`\`\`

### 左移 (<<)

\`\`\`cpp
unsigned char a = 0b0001;   // 1
unsigned char b = a << 2;   // 0b0100 = 4

// 左移n位相当于乘以2^n
int x = 5;
int y = x << 3;  // 5 * 8 = 40
\`\`\`

### 右移 (>>)

\`\`\`cpp
unsigned char a = 0b1000;   // 8
unsigned char b = a >> 2;   // 0b0010 = 2

// 对于无符号数：右移n位相当于除以2^n
// 对于有符号数：可能是算术移位或逻辑移位

unsigned int x = 16;
unsigned int y = x >> 2;  // 16 / 4 = 4
\`\`\`

### 位操作技巧

\`\`\`cpp
// 设置第n位
x |= (1 << n);

// 清除第n位
x &= ~(1 << n);

// 切换第n位
x ^= (1 << n);

// 检查第n位
if (x & (1 << n)) { /* 第n位为1 */ }

// 清除最低位的1
x &= (x - 1);

// 获取最低位的1
int lowest = x & (-x);

// 判断是否为2的幂
bool isPowerOf2 = (x > 0) && ((x & (x - 1)) == 0);
\`\`\`

### 位域（Bit Fields）

\`\`\`cpp
struct Flags {
    unsigned int readable : 1;   // 1位
    unsigned int writable : 1;   // 1位
    unsigned int executable : 1; // 1位
    unsigned int reserved : 5;   // 5位
};

Flags f;
f.readable = 1;
f.writable = 0;
\`\`\`

### 最佳实践

1. **使用无符号类型进行位运算**
   \`\`\`cpp
   // 推荐：行为明确
   unsigned int flags = 0;

   // 不推荐：有符号数的右移行为不确定
   int flags = -1;
   flags >> 1;  // 可能是算术移位或逻辑移位
   \`\`\`

2. **使用 constexpr 或宏定义位掩码**
   \`\`\`cpp
   constexpr unsigned int READABLE = 1 << 0;
   constexpr unsigned int WRITABLE = 1 << 1;
   constexpr unsigned int EXECUTABLE = 1 << 2;

   unsigned int flags = READABLE | WRITABLE;
   \`\`\`

3. **使用 std::bitset 调试位操作**
   \`\`\`cpp
   #include <bitset>
   unsigned int x = 0b1010;
   std::cout << std::bitset<8>(x);  // 输出: 00001010
   \`\`\`

4. **优先使用位运算替代乘除法（仅当性能关键时）**
   \`\`\`cpp
   // 现代编译器会自动优化
   int x = n / 2;      // 编译器可能优化为 n >> 1
   int y = n * 8;      // 编译器可能优化为 n << 3

   // 显式使用位运算（仅当需要明确意图时）
   int z = n >> 1;     // 明确表示"除以2"
   \`\`\`

### 常见错误

1. **混淆位运算符和逻辑运算符**
   \`\`\`cpp
   int a = 5, b = 3;
   if (a & b) { }   // 位运算：5 & 3 = 1，条件为真
   if (a && b) { }  // 逻辑运算：两者都非零，条件为真

   // 结果可能相同，但含义不同
   if (a | b) { }   // 位运算：5 | 3 = 7，条件为真
   if (a || b) { }  // 逻辑运算：a非零，条件为真
   \`\`\`

2. **移位数量超出范围**
   \`\`\`cpp
   int x = 1;
   int y = x << 32;  // 未定义行为！int通常是32位
   // 正确：移位数量应小于类型位数
   int z = x << 31;
   \`\`\`

3. **对负数进行右移**
   \`\`\`cpp
   int x = -8;
   int y = x >> 1;  // 结果可能是 -4 或 2147483644
   // 取决于编译器实现（算术移位 vs 逻辑移位）
   \`\`\`

4. **位运算优先级错误**
   \`\`\`cpp
   int x = 1;
   if (x & 1 == 1) { }  // 错误！== 优先级高于 &
   // 实际解析为：x & (1 == 1) = x & 1

   // 正确写法
   if ((x & 1) == 1) { }
   \`\`\`

### 深入理解

**位运算的本质**

位运算直接操作内存中的二进制位：
- CPU 原生支持，速度极快
- 常用于底层编程、嵌入式系统
- 某些算法中用于优化性能

**算术移位 vs 逻辑移位**

- **逻辑移位**：移出的位丢弃，空位填0
- **算术移位**：移出的位丢弃，空位填符号位（右移时）

\`\`\`cpp
// 对于无符号数：总是逻辑移位
unsigned int u = 0x80000000;
u >> 1;  // 0x40000000

// 对于有符号数：右移可能是算术移位
int s = -2147483648;  // 0x80000000
s >> 1;  // 可能是 -1073741824（算术移位）或 1073741824（逻辑移位）
\`\`\`

**位运算的应用场景**

1. **标志位管理**
   \`\`\`cpp
   unsigned int flags = 0;
   flags |= READABLE;    // 设置标志
   flags &= ~WRITABLE;   // 清除标志
   if (flags & EXECUTABLE) { }  // 检查标志
   \`\`\`

2. **快速计算**
   \`\`\`cpp
   x & (x - 1)  // 清除最低位的1
   x & (-x)     // 获取最低位的1
   x ^ y        // 不用临时变量交换
   \`\`\`

3. **权限控制**
   \`\`\`cpp
   enum Permission { READ = 1, WRITE = 2, EXECUTE = 4 };
   unsigned int perm = READ | WRITE;
   \`\`\``,
            examples: [
                {
                    title: '位运算基础',
                    code: `#include <iostream>
#include <bitset>

int main() {
    unsigned char a = 0b1100;  // 12
    unsigned char b = 0b1010;  // 10
    
    std::cout << "a = " << std::bitset<8>(a) << " (" << (int)a << ")" << std::endl;
    std::cout << "b = " << std::bitset<8>(b) << " (" << (int)b << ")" << std::endl;
    
    std::cout << "\\n位运算结果:" << std::endl;
    std::cout << "a & b = " << std::bitset<8>(a & b) << " (" << (int)(a & b) << ")" << std::endl;
    std::cout << "a | b = " << std::bitset<8>(a | b) << " (" << (int)(a | b) << ")" << std::endl;
    std::cout << "a ^ b = " << std::bitset<8>(a ^ b) << " (" << (int)(a ^ b) << ")" << std::endl;
    std::cout << "~a    = " << std::bitset<8>(~a) << " (" << (int)(unsigned char)(~a) << ")" << std::endl;
    
    // 移位
    std::cout << "\\n移位操作:" << std::endl;
    std::cout << "a << 2 = " << std::bitset<8>(a << 2) << " (" << (int)(a << 2) << ")" << std::endl;
    std::cout << "a >> 2 = " << std::bitset<8>(a >> 2) << " (" << (int)(a >> 2) << ")" << std::endl;
    
    return 0;
}`,
                    description: '演示位运算符的基本用法。'
                },
                {
                    title: '位操作技巧',
                    code: `#include <iostream>
#include <bitset>

int main() {
    unsigned int x = 0b10110100;
    
    std::cout << "原始值: " << std::bitset<8>(x) << std::endl;
    
    // 设置第0位
    x |= (1 << 0);
    std::cout << "设置第0位: " << std::bitset<8>(x) << std::endl;
    
    // 清除第2位
    x &= ~(1 << 2);
    std::cout << "清除第2位: " << std::bitset<8>(x) << std::endl;
    
    // 切换第4位
    x ^= (1 << 4);
    std::cout << "切换第4位: " << std::bitset<8>(x) << std::endl;
    
    // 检查第5位
    bool bit5 = (x & (1 << 5)) != 0;
    std::cout << "第5位: " << (bit5 ? "1" : "0") << std::endl;
    
    // 判断是否为2的幂
    unsigned int n = 16;
    bool isPower = (n > 0) && ((n & (n - 1)) == 0);
    std::cout << "\\n" << n << " 是2的幂: " << (isPower ? "是" : "否") << std::endl;
    
    return 0;
}`,
                    description: '演示常用的位操作技巧。'
                }
            ],
            handsOn: {
                title: '位运算练习',
                description: '使用位运算判断一个数是否为2的幂。',
                initialCode: `#include <iostream>

bool isPowerOfTwo(unsigned int n) {
    // TODO: 使用位运算判断n是否为2的幂
    // 提示：2的幂的二进制表示只有一个1
    
    return false;
}

int main() {
    std::cout << "1 是2的幂: " << (isPowerOfTwo(1) ? "是" : "否") << std::endl;
    std::cout << "2 是2的幂: " << (isPowerOfTwo(2) ? "是" : "否") << std::endl;
    std::cout << "3 是2的幂: " << (isPowerOfTwo(3) ? "是" : "否") << std::endl;
    std::cout << "16 是2的幂: " << (isPowerOfTwo(16) ? "是" : "否") << std::endl;
    
    return 0;
}`,
                expectedOutput: '1 是2的幂: 是\n2 是2的幂: 是\n3 是2的幂: 否\n16 是2的幂: 是',
                solutionRegex: '&.*\\(.*-.*1\\)|n.*&.*\\(n.*-.*1\\)',
                hint: '2的幂满足：n > 0 且 n & (n-1) == 0',
                xp: 150
            },
            quiz: [
                { type: 'single', question: '0b1100 & 0b1010 的结果是什么？', options: [{ text: '0b1110' }, { text: '0b1000', correct: true }, { text: '0b0110' }, { text: '0b0100' }], explanation: '按位与：两位都为1才为1，所以结果是0b1000。' },
                { type: 'single', question: 'x << 3 相当于什么？', options: [{ text: 'x + 3' }, { text: 'x * 3' }, { text: 'x * 8', correct: true }, { text: 'x / 8' }], explanation: '左移n位相当于乘以2^n，左移3位就是乘以8。' },
                { type: 'single', question: '如何设置变量x的第3位为1？', options: [{ text: 'x = 3' }, { text: 'x |= (1 << 3)', correct: true }, { text: 'x &= (1 << 3)' }, { text: 'x ^= (1 << 3)' }], explanation: '使用按位或设置位：x |= (1 << n)设置第n位。' },
                { type: 'single', question: 'a ^ b ^ b 的结果是什么？', options: [{ text: '0' }, { text: 'a', correct: true }, { text: 'b' }, { text: 'a ^ b' }], explanation: '异或的性质：a ^ b ^ b = a ^ 0 = a。' },
                { type: 'single', question: '~0 的结果是什么？', options: [{ text: '0' }, { text: '1' }, { text: '全1', correct: true }, { text: '-1' }], explanation: '按位取反，0变成全1（对于unsigned是最大值，对于signed是-1）。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.8节' }
            ],
            assistantTips: [
                '位运算常用于标志位操作和优化',
                '注意有符号数的右移行为',
                '使用std::bitset可以方便地查看二进制表示'
            ]
        },
        {
            id: '4.7',
            title: '条件运算符与逗号运算符',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 条件运算符与逗号运算符

### 条件运算符（三目运算符）

条件运算符是C++中唯一的**三元运算符**：

\`\`\`cpp
condition ? expression1 : expression2

// 如果condition为真，返回expression1
// 否则返回expression2
\`\`\`

### 基本用法

\`\`\`cpp
int x = 10, y = 20;
int max = (x > y) ? x : y;  // max = 20

// 等价于
int max;
if (x > y) {
    max = x;
} else {
    max = y;
}
\`\`\`

### 嵌套条件运算符

\`\`\`cpp
int score = 85;
char grade = (score >= 90) ? 'A' :
             (score >= 80) ? 'B' :
             (score >= 70) ? 'C' :
             (score >= 60) ? 'D' : 'F';
// grade = 'B'
\`\`\`

### 返回值类型

两个分支的类型必须相同或可以转换：

\`\`\`cpp
int x = 10;
double d = 3.14;

// 类型不同，会进行转换
auto result = true ? x : d;  // result是double类型

// 错误：无法转换
// auto err = true ? 0 : "hello";  // 编译错误
\`\`\`

### 条件运算符与输出

\`\`\`cpp
int x = 10;
std::cout << "x is " << (x % 2 == 0 ? "even" : "odd") << std::endl;
\`\`\`

### 逗号运算符

逗号运算符按顺序执行两个表达式，返回**最后一个表达式的值**：

\`\`\`cpp
int x = (1, 2, 3);  // x = 3

int a = 5;
int b = (a++, a + 2);  // a = 6, b = 8
\`\`\`

### 逗号运算符的求值顺序

逗号运算符保证**从左到右**的求值顺序：

\`\`\`cpp
int i = 0;
int x = (i++, i++, i++);  // x = 2, i = 3
\`\`\`

### 常见用途

\`\`\`cpp
// 在for循环中
for (int i = 0, j = 10; i < j; ++i, --j) {
    // ...
}

// 简化代码
int a, b;
int max = (a > b) ? (a++, a) : (b++, b);
\`\`\`

### 注意事项

\`\`\`cpp
// 逗号运算符优先级最低
int x = 1, 2, 3;  // 错误！这是声明，不是逗号运算符
int y = (1, 2, 3);  // 正确，y = 3

// 函数调用中的逗号是分隔符，不是运算符
func(a, b);  // 这里逗号是参数分隔符
func((a, b));  // 这里逗号是运算符，传入b的值
\`\`\`

### 条件运算符 vs if-else

| 特性 | 条件运算符 | if-else |
|------|-----------|---------|
| 返回值 | 有 | 无 |
| 可读性 | 简单时更好 | 复杂时更好 |
| 语句 | 只能是表达式 | 可以是语句 |
| 嵌套 | 可读性下降 | 更清晰 |

### 最佳实践

1. **条件运算符用于简单的条件表达式**
   \`\`\`cpp
   // 推荐：简单、清晰
   int max = (a > b) ? a : b;
   const char* msg = (n > 0) ? "positive" : "non-positive";

   // 不推荐：过于复杂
   int result = (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
   // 改用 if-else 更清晰
   \`\`\`

2. **避免嵌套过深的条件运算符**
   \`\`\`cpp
   // 不推荐
   char grade = s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : 'F';

   // 推荐：使用 if-else 或 switch
   char grade;
   if (s >= 90) grade = 'A';
   else if (s >= 80) grade = 'B';
   else if (s >= 70) grade = 'C';
   else grade = 'F';
   \`\`\`

3. **逗号运算符主要用于 for 循环**
   \`\`\`cpp
   // 推荐：for 循环中的多个变量
   for (int i = 0, j = n - 1; i < j; ++i, --j) {
       std::swap(arr[i], arr[j]);
   }

   // 不推荐：在普通表达式中使用
   int x = (a++, b++, c);  // 难以理解
   \`\`\`

4. **条件运算符的分支使用相同类型**
   \`\`\`cpp
   // 推荐：类型一致
   int x = flag ? 1 : 0;

   // 注意：类型不同会发生隐式转换
   double d = flag ? 1 : 0.0;  // 两个分支都会转为 double
   \`\`\`

### 常见错误

1. **条件运算符优先级问题**
   \`\`\`cpp
   int x = 1, y = 2;
   std::cout << x > y ? x : y;  // 错误！解析为 (cout << x) > y ? x : y

   // 正确：使用括号
   std::cout << (x > y ? x : y);
   \`\`\`

2. **混淆逗号运算符和逗号分隔符**
   \`\`\`cpp
   int a = 1, b = 2, c = 3;  // 这是声明，不是逗号运算符
   int d = (1, 2, 3);        // 这是逗号运算符，d = 3

   func(a, b);      // 参数分隔符
   func((a, b));    // 逗号运算符，传入 b 的值
   \`\`\`

3. **条件运算符中的副作用**
   \`\`\`cpp
   int x = 0;
   int y = true ? x++ : x;  // x 变为 1，y = 0
   // 注意：只有一个分支会执行
   \`\`\`

4. **返回值类型不兼容**
   \`\`\`cpp
   // 错误：类型不兼容
   auto x = flag ? 0 : "hello";  // 编译错误

   // 正确：使用相同类型
   auto x = flag ? "0" : "hello";
   \`\`\`

### 深入理解

**条件运算符的类型推导**

当两个分支类型不同时，编译器会尝试找到一个公共类型：
\`\`\`cpp
int i = 1;
double d = 2.0;

auto result = true ? i : d;  // result 是 double 类型
// i 会被提升为 double
\`\`\`

**条件运算符的求值顺序**

条件运算符保证：
1. 条件表达式首先求值
2. 只有一个分支会被求值（短路求值）

\`\`\`cpp
int x = 0;
int y = true ? ++x : x++;  // 只有 ++x 被执行
// x = 1, y = 1
\`\`\`

**逗号运算符的语义**

逗号运算符是唯一保证从左到右求值的运算符：
\`\`\`cpp
int a = 1;
int b = (a++, a++, a++);  // 保证顺序执行
// a = 4, b = 3
\`\`\`

**条件运算符与模板元编程**

条件运算符在编译期计算中很有用：
\`\`\`cpp
template<bool Cond, typename T, typename F>
struct conditional {
    using type = T;
};

template<typename T, typename F>
struct conditional<false, T, F> {
    using type = F;
};
\`\`\``,
            examples: [
                {
                    title: '条件运算符',
                    code: `#include <iostream>

int main() {
    int x = 10, y = 20;
    
    // 求最大值
    int max = (x > y) ? x : y;
    std::cout << "max(" << x << ", " << y << ") = " << max << std::endl;
    
    // 求绝对值
    int n = -5;
    int abs_n = (n < 0) ? -n : n;
    std::cout << "|" << n << "| = " << abs_n << std::endl;
    
    // 判断奇偶
    int m = 7;
    std::cout << m << " is " << (m % 2 == 0 ? "even" : "odd") << std::endl;
    
    // 嵌套：成绩等级
    int score = 85;
    char grade = (score >= 90) ? 'A' :
                 (score >= 80) ? 'B' :
                 (score >= 70) ? 'C' :
                 (score >= 60) ? 'D' : 'F';
    std::cout << "Score " << score << " -> Grade " << grade << std::endl;
    
    return 0;
}`,
                    description: '演示条件运算符的使用。'
                },
                {
                    title: '逗号运算符',
                    code: `#include <iostream>

int main() {
    // 基本用法
    int x = (1, 2, 3);
    std::cout << "x = (1, 2, 3) -> x = " << x << std::endl;
    
    // 在for循环中
    std::cout << "\\nfor循环中的逗号运算符:" << std::endl;
    for (int i = 0, j = 10; i < j; ++i, --j) {
        std::cout << "i = " << i << ", j = " << j << std::endl;
    }
    
    // 顺序执行
    int a = 1;
    int b = (a++, a++, a++);
    std::cout << "\\na++执行3次后: a = " << a << ", b = " << b << std::endl;
    
    // 与函数调用
    auto getValue = []() { return 42; };
    int result = (std::cout << "计算中...\\n", getValue());
    std::cout << "result = " << result << std::endl;
    
    return 0;
}`,
                    description: '演示逗号运算符的使用。'
                }
            ],
            handsOn: {
                title: '条件运算符练习',
                description: '使用条件运算符找出三个数中的最大值。',
                initialCode: `#include <iostream>

int main() {
    int a = 15, b = 8, c = 25;
    
    // ===== 你的代码 =====
    // 使用嵌套条件运算符找出 a, b, c 中的最大值
    // 语法: (条件) ? 值1 : 值2
    
    int max = 0;  // 修改这一行，使用条件运算符
    
    std::cout << "最大值: " << max << std::endl;
    
    // ===== 你的代码 =====
    // 使用逗号运算符实现: 先计算 x = 5，然后 y = x * 2
    int x = 3;
    int y = 0;  // 修改这一行，使用逗号运算符: (++, ++)
    // 期望: x 变为 5，y 为 10
    
    std::cout << "逗号运算: x = " << x << ", y = " << y << std::endl;
    
    return 0;
}`,
                expectedOutput: '最大值: 25\n逗号运算: x = 5, y = 10',
                solutionRegex: '\\?.*:.*\\?.*:|y.*=.*\\(.*x.*\\+\\+.*,.*x.*\\*.*2',
                hint: '条件运算符可以嵌套使用，逗号运算符从左到右求值并返回最后一个值',
                xp: 100
            },
            quiz: [
                { type: 'single', question: '条件运算符有几个操作数？', options: [{ text: '1个' }, { text: '2个' }, { text: '3个', correct: true }, { text: '不确定' }], explanation: '条件运算符是C++中唯一的三元运算符，有3个操作数。' },
                { type: 'single', question: '(a > b) ? a : b 返回什么？', options: [{ text: 'true或false' }, { text: 'a和b中较大的值', correct: true }, { text: 'a' }, { text: 'b' }], explanation: '条件运算符根据条件返回其中一个表达式的值。' },
                { type: 'single', question: 'int x = (1, 2, 3); x的值是多少？', options: [{ text: '1' }, { text: '2' }, { text: '3', correct: true }, { text: '编译错误' }], explanation: '逗号运算符返回最后一个表达式的值。' },
                { type: 'single', question: '逗号运算符的求值顺序是什么？', options: [{ text: '从右到左' }, { text: '从左到右', correct: true }, { text: '不确定' }, { text: '同时求值' }], explanation: '逗号运算符保证从左到右的求值顺序。' },
                { type: 'single', question: 'func(a, b) 中的逗号是什么？', options: [{ text: '逗号运算符' }, { text: '参数分隔符', correct: true }, { text: '两者都可以' }, { text: '语法错误' }], explanation: '函数调用中的逗号是参数分隔符，不是逗号运算符。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.7节' }
            ],
            assistantTips: [
                '简单条件用条件运算符，复杂条件用if-else',
                '逗号运算符优先级最低，注意加括号',
                '区分逗号运算符和参数分隔符'
            ]
        },
        {
            id: '4.8',
            title: '类型转换',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 类型转换

### 隐式类型转换

编译器自动进行的类型转换：

\`\`\`cpp
// 整型提升
short s = 10;
int i = s;  // short -> int

// 算术转换
int a = 5;
double b = 2.0;
auto c = a + b;  // int + double -> double

// 指针转换
int* p = nullptr;
bool b = p;  // 指针 -> bool

// 布尔转换
int x = true;   // true -> 1
bool b = 42;    // 非零 -> true
\`\`\`

### 算术转换规则

1. **整型提升**：小于int的类型提升为int
2. **符号扩展**：有符号数扩展时保持符号
3. **寻常算术转换**：运算时转换为较大类型

\`\`\`cpp
// 规则：提升到能容纳两个操作数的类型
int + long -> long
unsigned + int -> unsigned
float + double -> double
\`\`\`

### 显式类型转换（C风格）

\`\`\`cpp
double d = 3.14;
int i = (int)d;    // C风格转换
int j = int(d);    // 函数风格转换
\`\`\`

### C++风格类型转换

| 转换符 | 用途 |
|--------|------|
| static_cast | 通用类型转换 |
| const_cast | 添加/移除const |
| dynamic_cast | 多态类型的安全向下转换 |
| reinterpret_cast | 底层重新解释 |

### static_cast

\`\`\`cpp
double d = 3.14;
int i = static_cast<int>(d);  // 安全的数值转换

void* p = &i;
int* pi = static_cast<int*>(p);  // 指针转换
\`\`\`

### const_cast

\`\`\`cpp
const int x = 10;
// int* p = &x;  // 错误！
int* p = const_cast<int*>(&x);  // 移除const

// 注意：修改const对象是未定义行为
// *p = 20;  // 危险！
\`\`\`

### dynamic_cast

\`\`\`cpp
class Base { virtual void foo() {} };
class Derived : public Base {};

Base* base = new Derived;
Derived* derived = dynamic_cast<Derived*>(base);  // 安全

if (derived) {
    // 转换成功
}
\`\`\`

### reinterpret_cast

\`\`\`cpp
int x = 0x12345678;
char* p = reinterpret_cast<char*>(&x);  // 重新解释内存

// 危险操作，谨慎使用
\`\`\`

### 类型转换最佳实践

1. **避免C风格转换**：使用C++风格更安全
2. **优先使用static_cast**：最常用、最安全
3. **少用reinterpret_cast**：危险，只在必要时使用
4. **const_cast要小心**：修改const对象是未定义行为

### 类型别名与转换

\`\`\`cpp
using IntPtr = int*;
const IntPtr p1 = nullptr;     // int* const（指针本身是const）
const int* p2 = nullptr;       // 指向const int的指针

// 注意区别！
\`\`\`

### 常见错误

1. **精度丢失**
   \`\`\`cpp
   double d = 3.14159265358979;
   int i = d;  // i = 3，精度丢失
   float f = d;  // 精度降低

   // 注意：浮点数转整数是截断，不是四舍五入
   \`\`\`

2. **符号问题**
   \`\`\`cpp
   int i = -1;
   unsigned int u = i;  // u = 4294967295（非常大的数）

   // 有符号转无符号时要特别小心
   for (unsigned int i = 10; i >= 0; --i) {  // 无限循环！
       // i 永远 >= 0
   }
   \`\`\`

3. **溢出问题**
   \`\`\`cpp
   long long big = 9223372036854775807LL;
   int small = big;  // 溢出，结果未定义

   // 检查范围
   if (big >= INT_MIN && big <= INT_MAX) {
       small = static_cast<int>(big);
   }
   \`\`\`

4. **危险的 const_cast**
   \`\`\`cpp
   const int x = 10;
   int* p = const_cast<int*>(&x);
   *p = 20;  // 未定义行为！可能崩溃或数据不变

   // const_cast 只应用于原本非 const 的数据
   \`\`\`

5. **dynamic_cast 失败处理**
   \`\`\`cpp
   Base* base = new Base;
   Derived* derived = dynamic_cast<Derived*>(base);  // 返回 nullptr

   if (derived == nullptr) {
       // 转换失败，需要处理
   }

   // 引用版本会抛出异常
   try {
       Derived& d = dynamic_cast<Derived&>(*base);
   } catch (std::bad_cast& e) {
       // 处理转换失败
   }
   \`\`\`

### 深入理解

**隐式转换的触发场景**

1. **初始化**：`int i = 3.14;`
2. **赋值**：`i = 3.14;`
3. **函数参数**：`void f(int); f(3.14);`
4. **函数返回值**：`int f() { return 3.14; }`
5. **运算表达式**：`3.14 + 1`

**整型提升的细节**

\`\`\`cpp
char c = 100;
short s = 100;

// 在表达式中，char 和 short 会提升为 int
auto result = c + s;  // int 类型

// 即使结果可以放入 char，运算也是用 int 进行
\`\`\`

**寻常算术转换的完整规则**

1. 如果任一操作数是 long double，转换为 long double
2. 否则，如果任一操作数是 double，转换为 double
3. 否则，如果任一操作数是 float，转换为 float
4. 否则，执行整型提升
5. 如果符号相同，转换为较大类型
6. 如果符号不同，复杂规则决定结果类型

**类型转换的性能影响**

- **隐式转换**：编译时完成，无运行时开销
- **static_cast**：编译时完成，无运行时开销
- **dynamic_cast**：运行时检查，有性能开销
- **const_cast**：编译时完成，无运行时开销
- **reinterpret_cast**：编译时完成，无运行时开销

**安全转换的指导原则**

1. 数值转换：检查范围，避免溢出
2. 指针转换：确保类型兼容
3. 类层次转换：优先使用 dynamic_cast
4. 底层转换：谨慎使用 reinterpret_cast`,
            examples: [
                {
                    title: '隐式类型转换',
                    code: `#include <iostream>
#include <typeinfo>

int main() {
    // 整型提升
    short s = 100;
    int i = s;
    std::cout << "short -> int: " << s << " -> " << i << std::endl;
    
    // 算术转换
    int a = 5;
    double b = 2.5;
    auto c = a + b;
    std::cout << "int + double: " << typeid(c).name() << ", value = " << c << std::endl;
    
    // 布尔转换
    bool b1 = 42;      // true
    bool b2 = 0;       // false
    bool b3 = -1;      // true
    int x = true;      // 1
    int y = false;     // 0
    
    std::cout << std::boolalpha;
    std::cout << "42 -> bool: " << b1 << std::endl;
    std::cout << "0 -> bool: " << b2 << std::endl;
    std::cout << "true -> int: " << x << std::endl;
    
    // 指针转换
    int* p = nullptr;
    if (!p) {
        std::cout << "nullptr -> false" << std::endl;
    }
    
    return 0;
}`,
                    description: '演示隐式类型转换。'
                },
                {
                    title: 'C++风格类型转换',
                    code: `#include <iostream>

class Base {
public:
    virtual void foo() { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    void foo() override { std::cout << "Derived" << std::endl; }
};

int main() {
    // static_cast
    double d = 3.14159;
    int i = static_cast<int>(d);
    std::cout << "static_cast<double->int>: " << i << std::endl;
    
    // dynamic_cast
    Base* base = new Derived();
    Derived* derived = dynamic_cast<Derived*>(base);
    if (derived) {
        std::cout << "dynamic_cast succeeded" << std::endl;
        derived->foo();
    }
    delete base;
    
    // const_cast
    const int x = 10;
    const int* cp = &x;
    int* p = const_cast<int*>(cp);
    std::cout << "const_cast: " << *p << std::endl;
    // *p = 20;  // 未定义行为！
    
    // reinterpret_cast
    int value = 0x41424344;
    char* bytes = reinterpret_cast<char*>(&value);
    std::cout << "reinterpret_cast: ";
    for (int j = 0; j < 4; ++j) {
        std::cout << bytes[j];
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '演示C++风格的类型转换。'
                }
            ],
            handsOn: {
                title: '类型转换练习',
                description: '实现华氏度到摄氏度的温度转换。',
                initialCode: `#include <iostream>

int main() {
    // 华氏度转摄氏度公式: C = (F - 32) * 5 / 9
    int fahrenheit = 212;
    
    // ===== 你的代码 =====
    // 1. 将 fahrenheit 转换为 double 进行计算
    // 2. 使用 static_cast 进行安全的类型转换
    // 3. 将结果赋值给 celsius
    
    double celsius = 0;  // 修改这一行，使用 static_cast
    
    std::cout << fahrenheit << "F = " << celsius << "C" << std::endl;
    
    // 额外练习：整数除法 vs 浮点除法
    int a = 7, b = 2;
    
    int intResult = a / b;        // 整数除法
    double doubleResult = a / b;   // 这还是整数除法！
    
    // ===== 你的代码 =====
    // 正确计算 a / b 的浮点结果
    double correctResult = 0;  // 修改这一行
    
    std::cout << "整数除法 7 / 2 = " << intResult << std::endl;
    std::cout << "错误写法 7 / 2 = " << doubleResult << std::endl;
    std::cout << "正确写法 7 / 2 = " << correctResult << std::endl;
    
    return 0;
}`,
                expectedOutput: '212F = 100C\n整数除法 7 / 2 = 3\n错误写法 7 / 2 = 3\n正确写法 7 / 2 = 3.5',
                solutionRegex: 'static_cast|double.*\\(.*a.*\\/.*b|double.*=.*a.*\\/.*static_cast|3\\.5',
                hint: '使用 static_cast<double>(a) / b 或 (double)a / b 进行浮点除法',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'int + double 的结果类型是什么？', options: [{ text: 'int' }, { text: 'double', correct: true }, { text: 'float' }, { text: '取决于值' }], explanation: '算术转换规则：转换为较大类型，int + double -> double。' },
                { type: 'single', question: '哪种C++类型转换最常用？', options: [{ text: 'const_cast' }, { text: 'dynamic_cast' }, { text: 'static_cast', correct: true }, { text: 'reinterpret_cast' }], explanation: 'static_cast是最常用的类型转换，用于安全的类型转换。' },
                { type: 'single', question: 'dynamic_cast用于什么？', options: [{ text: '数值转换' }, { text: '多态类型的安全向下转换', correct: true }, { text: '移除const' }, { text: '重新解释内存' }], explanation: 'dynamic_cast用于多态类型的安全向下转换，需要虚函数。' },
                { type: 'single', question: 'const_cast可以做什么？', options: [{ text: '转换数值类型' }, { text: '添加或移除const', correct: true }, { text: '转换指针类型' }, { text: '转换类类型' }], explanation: 'const_cast专门用于添加或移除const限定符。' },
                { type: 'single', question: '为什么应该避免C风格类型转换？', options: [{ text: '效率低' }, { text: '不够安全，无法区分转换类型', correct: true }, { text: '语法复杂' }, { text: '不支持指针转换' }], explanation: 'C风格转换不够安全，无法区分不同类型的转换，容易出错。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第4.11节' }
            ],
            assistantTips: [
                '优先使用C++风格的类型转换',
                '理解隐式转换规则可以避免意外',
                'reinterpret_cast最危险，谨慎使用'
            ]
        }
    ]
};
