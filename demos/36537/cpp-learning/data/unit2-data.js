/**
 * 第2章：变量与基本数据类型
 * 完整的学习内容
 */

var Unit2Data = {
    id: 2,
    title: '变量与基本数据类型',
    description: '深入理解C++的变量系统和基本数据类型',
    lessons: [
        {
            id: '2.1',
            title: '变量的定义与初始化',
            duration: '30分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 变量的定义与初始化

### 什么是变量？

变量是程序中**存储数据的命名内存空间**。每个变量都有：
- **类型**：决定存储空间大小和可执行的操作
- **名称**：标识符，用于访问变量
- **值**：存储的具体数据
- **地址**：内存中的位置

### 变量定义

\`\`\`cpp
// 基本语法：类型 变量名;
int age;           // 定义一个整型变量
double price;      // 定义一个双精度浮点变量
char letter;       // 定义一个字符变量
\`\`\`

### 初始化方式

C++支持多种初始化方式：

#### 1. 拷贝初始化（Copy Initialization）
\`\`\`cpp
int x = 10;
double pi = 3.14;
char c = 'A';
\`\`\`

#### 2. 直接初始化（Direct Initialization）
\`\`\`cpp
int x(10);
double pi(3.14);
char c('A');
\`\`\`

#### 3. 列表初始化（List Initialization，C++11）
\`\`\`cpp
int x = {10};      // 拷贝列表初始化
int x{10};         // 直接列表初始化
double pi{3.14};
\`\`\`

**列表初始化的优点**：
- 不允许窄化转换（narrowing conversion）
- 更安全的初始化方式

\`\`\`cpp
int x = 3.14;      // 警告：窄化转换，x = 3
int x{3.14};       // 错误：不允许窄化转换
\`\`\`

#### 4. 默认初始化

\`\`\`cpp
int x;             // 默认初始化
// 全局变量：初始化为0
// 局部变量：未定义值（危险！）
\`\`\`

### 变量命名规则

**必须遵守的规则**：
1. 只能包含字母、数字和下划线
2. 必须以字母或下划线开头
3. 不能使用C++关键字
4. 区分大小写

**推荐的命名规范**：
- 使用有意义的名称
- 驼峰命名法：\`studentAge\`
- 下划线命名法：\`student_age\`
- 常量使用全大写：\`MAX_SIZE\`

\`\`\`cpp
// 好的命名
int studentAge = 18;
double averageScore = 85.5;
const int MAX_STUDENTS = 50;

// 不好的命名
int a = 18;           // 无意义
int 1stPlace = 1;     // 错误：数字开头
int my-var = 10;      // 错误：包含连字符
int int = 5;          // 错误：使用关键字
\`\`\`

### 未初始化变量的危险

\`\`\`cpp
int main() {
    int x;           // 未初始化，值不确定
    std::cout << x;  // 可能输出任何值！
    return 0;
}
\`\`\`

**最佳实践**：定义变量时立即初始化！

### 最佳实践

1. **始终初始化变量**
   - 定义时立即赋值
   - 使用列表初始化更安全
   - 避免使用未定义值

2. **选择有意义的变量名**
   \`\`\`cpp
   // 好的命名
   int studentCount = 30;
   double averageScore = 85.5;
   std::string userName = "Alice";
   
   // 不好的命名
   int x = 30;          // 无意义
   double d = 85.5;     // 不明确
   std::string s = "Alice";  // 太短
   \`\`\`

3. **使用 const 和 constexpr**
   \`\`\`cpp
   const int MAX_SIZE = 100;      // 运行时常量
   constexpr int SIZE = 100;      // 编译时常量
   \`\`\`

### 常见错误

1. **使用未初始化的变量**
   \`\`\`cpp
   int x;
   std::cout << x;  // 错误：值不确定
   \`\`\`

2. **变量名冲突**
   \`\`\`cpp
   int value = 10;
   {
       int value = 20;  // 隐藏外层变量
       std::cout << value;  // 输出 20
   }
   \`\`\`

3. **初始化语法混淆**
   \`\`\`cpp
   int x();      // 函数声明，不是变量！
   int x{};      // 正确：值初始化为 0
   int x = 0;    // 正确：拷贝初始化
   \`\`\`

### 深入理解

**初始化的底层机制**

不同初始化方式的区别：
- **拷贝初始化**：可能调用拷贝构造函数
- **直接初始化**：直接调用构造函数
- **列表初始化**：防止窄化转换，更安全

**变量在内存中的表示**

变量在内存中的存储：
- **栈上变量**：自动管理，函数结束时释放
- **堆上变量**：手动管理，需要显式释放
- **全局/静态变量**：程序开始时创建，结束时释放

**命名空间的作用**

命名空间防止命名冲突：
\`\`\`cpp
namespace Project1 {
    int value = 10;
}

namespace Project2 {
    int value = 20;  // 不冲突
}
\`\`\``,

            examples: [
                {
                    title: '各种初始化方式',
                    code: `#include <iostream>

int main() {
    // 拷贝初始化
    int a = 10;
    
    // 直接初始化
    int b(20);
    
    // 列表初始化（C++11推荐）
    int c = {30};
    int d{40};
    
    std::cout << "a = " << a << std::endl;
    std::cout << "b = " << b << std::endl;
    std::cout << "c = " << c << std::endl;
    std::cout << "d = " << d << std::endl;
    
    return 0;
}`,
                    description: '演示C++中各种变量初始化方式。'
                },
                {
                    title: '列表初始化的安全性',
                    code: `#include <iostream>

int main() {
    // 拷贝初始化允许窄化转换
    double pi = 3.14159;
    int a = pi;  // 警告但允许，a = 3
    std::cout << "a = " << a << std::endl;
    
    // 列表初始化不允许窄化转换
    // int b{pi};  // 错误：narrowing conversion
    
    // 正确用法
    int b{100};
    std::cout << "b = " << b << std::endl;
    
    return 0;
}`,
                    description: '展示列表初始化如何防止窄化转换。'
                }
            ],
            handsOn: {
                title: '变量定义与初始化',
                description: '## 任务目标\n定义并初始化不同类型的变量，掌握C++中变量的声明和初始化方法。\n\n## 操作步骤\n1. 定义整型变量 age，使用列表初始化初始化为 18\n2. 定义浮点型变量 height，初始化为 1.75\n3. 定义字符型变量 grade，初始化为 \'A\'\n4. 使用 std::cout 输出变量值',
                initialCode: `#include <iostream>

int main() {
    // ===== 定义并初始化变量 =====
    int age{18};           // 整型变量，年龄
    double height{1.75};   // 浮点型变量，身高（米）
    char grade{'A'};       // 字符型变量，成绩等级
    
    // ===== 输出变量值 =====
    std::cout << "年龄: " << age << std::endl;
    std::cout << "身高: " << height << std::endl;
    std::cout << "等级: " << grade << std::endl;
    
    return 0;
}`,
                expectedOutput: '年龄: 18\n身高: 1.75\n等级: A',
                solutionRegex: 'int.*age.*18|double.*height.*1\\.75|char.*grade.*A',
                hint: '推荐使用列表初始化（花括号{}），更安全且统一',
                xp: 100
            },
            quiz: [
                { type: 'single', question: '以下哪种初始化方式不允许窄化转换？', options: [{ text: 'int x = 3.14;' }, { text: 'int x(3.14);' }, { text: 'int x{3.14};', correct: true }, { text: '以上都允许' }], explanation: '列表初始化（花括号初始化）不允许窄化转换，更加安全。' },
                { type: 'single', question: '局部变量默认初始化的值是什么？', options: [{ text: '0' }, { text: '未定义值', correct: true }, { text: 'null' }, { text: '随机正数' }], explanation: '局部变量默认初始化时，其值是未定义的，可能包含任何垃圾值。' },
                { type: 'single', question: '以下哪个变量名是合法的？', options: [{ text: '2ndPlace' }, { text: 'my-var' }, { text: '_count', correct: true }, { text: 'int' }], explanation: '变量名可以以下划线开头，不能以数字开头，不能包含连字符，不能是关键字。' },
                { type: 'single', question: 'int x = {10}; 是什么类型的初始化？', options: [{ text: '直接初始化' }, { text: '拷贝列表初始化', correct: true }, { text: '默认初始化' }, { text: '值初始化' }], explanation: '使用等号和花括号的初始化方式称为拷贝列表初始化。' },
                { type: 'single', question: '定义变量时应该遵循的最佳实践是什么？', options: [{ text: '先定义后初始化' }, { text: '定义时立即初始化', correct: true }, { text: '使用时再初始化' }, { text: '不需要初始化' }], explanation: '定义变量时立即初始化可以避免使用未定义值，是良好的编程习惯。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2章' },
                { title: 'Effective C++', book: '条款4：确保对象在使用前被初始化' }
            ],
            assistantTips: [
                '推荐使用列表初始化（花括号初始化）',
                '始终在定义变量时进行初始化',
                '变量名应该有明确的含义'
            ]
        },
        {
            id: '2.2',
            title: '基本数据类型概述',
            duration: '25分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 基本数据类型概述

C++的基本数据类型可以分为以下几类：

### 数据类型分类

\`\`\`
基本数据类型
├── 算术类型
│   ├── 整型
│   │   ├── bool（布尔型）
│   │   ├── char（字符型）
│   │   ├── wchar_t（宽字符型）
│   │   ├── char16_t（Unicode字符）
│   │   ├── char32_t（Unicode字符）
│   │   ├── short（短整型）
│   │   ├── int（整型）
│   │   ├── long（长整型）
│   │   └── long long（长长整型）
│   └── 浮点型
│       ├── float（单精度）
│       ├── double（双精度）
│       └── long double（扩展精度）
└── void（空类型）
\`\`\`

### 类型大小与范围

| 类型 | 最小大小 | 典型大小 | 范围 |
|------|---------|---------|------|
| bool | 1字节 | 1字节 | true/false |
| char | 1字节 | 1字节 | -128~127 或 0~255 |
| short | 2字节 | 2字节 | -32768~32767 |
| int | 2字节 | 4字节 | 约±21亿 |
| long | 4字节 | 4/8字节 | 至少±21亿 |
| long long | 8字节 | 8字节 | 约±9×10¹⁸ |
| float | 4字节 | 4字节 | 约7位有效数字 |
| double | 8字节 | 8字节 | 约15位有效数字 |

### sizeof 运算符

使用 \`sizeof\` 可以获取类型或变量的大小：

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "bool: " << sizeof(bool) << " 字节" << std::endl;
    std::cout << "char: " << sizeof(char) << " 字节" << std::endl;
    std::cout << "int: " << sizeof(int) << " 字节" << std::endl;
    std::cout << "double: " << sizeof(double) << " 字节" << std::endl;
    return 0;
}
\`\`\`

### 有符号与无符号

整型可以分为有符号和无符号：

\`\`\`cpp
int x = 10;           // 有符号整型
unsigned int y = 10;  // 无符号整型

signed char c1 = -10;   // 有符号字符
unsigned char c2 = 255; // 无符号字符
\`\`\`

### 类型选择建议

1. **整数**：一般使用 \`int\`，大数使用 \`long long\`
2. **浮点数**：优先使用 \`double\`
3. **字符**：使用 \`char\`，Unicode使用 \`char16_t\` 或 \`char32_t\`
4. **布尔**：使用 \`bool\`

### 类型限制头文件

\`\`\`cpp
#include <climits>   // 整型限制
#include <cfloat>    // 浮点型限制

// 示例
INT_MAX    // int的最大值
INT_MIN    // int的最小值
DBL_MAX    // double的最大值
FLT_DIG    // float的有效数字位数
\`\`\`

### 最佳实践

1. **选择合适的数据类型**
   - 一般整数用 int
   - 大整数用 long long
   - 浮点数优先用 double
   - 非负数考虑 unsigned

2. **避免隐式类型转换**
   \`\`\`cpp
   // 危险：有符号和无符号混用
   int x = -1;
   unsigned int y = 10;
   if (x < y) { }  // x 被转换为很大的无符号数！
   
   // 正确：统一使用有符号类型
   int x = -1;
   int y = 10;
   if (x < y) { }  // 正确
   \`\`\`

3. **使用固定宽度类型**
   \`\`\`cpp
   #include <cstdint>
   
   int32_t exactInt;     // 恰好 32 位
   int64_t bigInt;       // 恰好 64 位
   uint8_t byte;         // 恰好 8 位无符号
   \`\`\`

### 常见错误

1. **整数溢出**
   \`\`\`cpp
   short s = 32767;
   s = s + 1;  // 溢出！结果不确定
   \`\`\`

2. **浮点精度问题**
   \`\`\`cpp
   float f = 0.1f;
   if (f == 0.1) { }  // 错误：0.1 是 double，精度不同
   \`\`\`

3. **类型大小假设**
   \`\`\`cpp
   // 错误：假设 int 是 4 字节
   // 正确：使用 sizeof
   std::cout << sizeof(int) << std::endl;
   \`\`\`

### 深入理解

**数据类型的内部表示**

整数在计算机中使用二进制补码表示：
- 正数：直接表示
- 负数：按位取反加一

浮点数使用 IEEE 754 标准：
- 符号位：1 位
- 指数位：8 位（float）或 11 位（double）
- 尾数位：23 位（float）或 52 位（double）

**类型转换规则**

隐式类型转换遵循以下规则：
1. 整型提升：小于 int 的类型提升为 int
2. 常规算术转换：转换为较大类型
3. 有符号/无符号混合：转为无符号

**平台差异**

不同平台数据类型大小可能不同：
- int 在大多数平台是 4 字节
- long 在 Windows 是 4 字节，在 Linux 64 位是 8 字节
- 使用 sizeof 确定实际大小`,

            examples: [
                {
                    title: '查看各类型大小',
                    code: `#include <iostream>
#include <climits>
#include <cfloat>

int main() {
    std::cout << "=== 类型大小 ===" << std::endl;
    std::cout << "bool: " << sizeof(bool) << " 字节" << std::endl;
    std::cout << "char: " << sizeof(char) << " 字节" << std::endl;
    std::cout << "short: " << sizeof(short) << " 字节" << std::endl;
    std::cout << "int: " << sizeof(int) << " 字节" << std::endl;
    std::cout << "long: " << sizeof(long) << " 字节" << std::endl;
    std::cout << "long long: " << sizeof(long long) << " 字节" << std::endl;
    std::cout << "float: " << sizeof(float) << " 字节" << std::endl;
    std::cout << "double: " << sizeof(double) << " 字节" << std::endl;
    
    std::cout << "\\n=== 类型范围 ===" << std::endl;
    std::cout << "int 范围: " << INT_MIN << " ~ " << INT_MAX << std::endl;
    std::cout << "long long 范围: " << LLONG_MIN << " ~ " << LLONG_MAX << std::endl;
    std::cout << "double 有效数字: " << DBL_DIG << " 位" << std::endl;
    
    return 0;
}`,
                    description: '使用sizeof和climits查看各类型的大小和范围。'
                },
                {
                    title: '有符号与无符号',
                    code: `#include <iostream>

int main() {
    // 有符号整型
    int signedNum = -100;
    std::cout << "有符号: " << signedNum << std::endl;
    
    // 无符号整型
    unsigned int unsignedNum = 100;
    std::cout << "无符号: " << unsignedNum << std::endl;
    
    // 注意：无符号数不能为负
    unsigned int negative = -1;  // 会变成很大的正数！
    std::cout << "-1 作为无符号数: " << negative << std::endl;
    
    // 无符号数的范围
    std::cout << "unsigned int 最大值: " << UINT_MAX << std::endl;
    
    return 0;
}`,
                    description: '演示有符号和无符号整型的区别。'
                }
            ],
            handsOn: {
                title: '数据类型大小与范围',
                description: '## 任务目标\n使用sizeof运算符查看不同数据类型在当前系统中的字节大小，理解各类型的内存占用。\n\n## 操作步骤\n1. 使用 sizeof(bool) 输出bool类型大小\n2. 使用 sizeof(char) 输出char类型大小\n3. 使用 sizeof(short) 输出short类型大小\n4. 使用 sizeof(int) 输出int类型大小\n5. 使用 sizeof(long) 输出long类型大小\n6. 使用 sizeof(long long) 输出long long类型大小\n7. 使用 sizeof(float) 输出float类型大小\n8. 使用 sizeof(double) 输出double类型大小',
                initialCode: `#include <iostream>

int main() {
    // ===== 使用 sizeof 查看各类型大小 =====
    std::cout << "bool: " << sizeof(bool) << " 字节" << std::endl;
    std::cout << "char: " << sizeof(char) << " 字节" << std::endl;
    std::cout << "short: " << sizeof(short) << " 字节" << std::endl;
    std::cout << "int: " << sizeof(int) << " 字节" << std::endl;
    std::cout << "long: " << sizeof(long) << " 字节" << std::endl;
    std::cout << "long long: " << sizeof(long long) << " 字节" << std::endl;
    std::cout << "float: " << sizeof(float) << " 字节" << std::endl;
    std::cout << "double: " << sizeof(double) << " 字节" << std::endl;
    
    return 0;
}`,
                expectedOutput: 'bool: 1 字节\\nchar: 1 字节\\nshort: 2 字节\\nint: 4 字节\\nlong: 4 或 8 字节\\nlong long: 8 字节\\nfloat: 4 字节\\ndouble: 8 字节',
                solutionRegex: 'sizeof.*bool|sizeof.*int|sizeof.*double',
                hint: 'sizeof返回size_t类型，表示字节数，注意long的大小可能因平台而异',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'sizeof(char) 的值是多少？', options: [{ text: '取决于平台' }, { text: '1字节', correct: true }, { text: '2字节' }, { text: '4字节' }], explanation: '根据C++标准，sizeof(char)始终为1字节。' },
                { type: 'single', question: '以下哪种类型适合存储大整数？', options: [{ text: 'int' }, { text: 'short' }, { text: 'long long', correct: true }, { text: 'float' }], explanation: 'long long可以存储约±9×10¹⁸的整数，适合存储大整数。' },
                { type: 'single', question: 'float和double的主要区别是什么？', options: [{ text: 'float只能存正数' }, { text: 'double精度更高', correct: true }, { text: 'float没有符号' }, { text: '它们完全相同' }], explanation: 'double是双精度浮点数，精度约为15位有效数字，比float（约7位）更高。' },
                { type: 'single', question: 'unsigned int 可以存储负数吗？', options: [{ text: '可以' }, { text: '不可以', correct: true }, { text: '取决于编译器' }, { text: '只能存储-1' }], explanation: 'unsigned int是无符号整型，只能存储非负整数。' },
                { type: 'single', question: 'INT_MAX 定义在哪个头文件中？', options: [{ text: '<iostream>' }, { text: '<climits>', correct: true }, { text: '<cmath>' }, { text: '<limits>' }], explanation: 'INT_MAX等整型限制常量定义在<climits>头文件中。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.1节' }
            ],
            assistantTips: [
                'sizeof(char)始终为1，这是C++标准规定的',
                '浮点数优先使用double，精度更高',
                '避免混用有符号和无符号数'
            ]
        },
        {
            id: '2.3',
            title: '整型类型详解',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 整型类型详解

### 整型分类

C++提供了多种整型，按大小从小到大排列：

| 类型 | 最小大小 | 典型大小 |
|------|---------|---------|
| short | 2字节 | 2字节 |
| int | 2字节 | 4字节 |
| long | 4字节 | 4/8字节 |
| long long | 8字节 | 8字节 |

### 整型字面量

\`\`\`cpp
int decimal = 42;        // 十进制
int octal = 052;         // 八进制（以0开头）
int hexadecimal = 0x2A;  // 十六进制（以0x开头）
int binary = 0b101010;   // 二进制（C++14，以0b开头）

// 长整型后缀
long x = 42L;
long long y = 42LL;
unsigned int z = 42U;
unsigned long long w = 42ULL;
\`\`\`

### 数值分隔符（C++14）

使用单引号作为分隔符，提高可读性：

\`\`\`cpp
int million = 1'000'000;
long long big = 1'000'000'000'000LL;
int binary = 0b1111'0000'1111'0000;
\`\`\`

### 整型溢出

当数值超出类型范围时会发生溢出：

\`\`\`cpp
#include <iostream>
#include <climits>

int main() {
    int x = INT_MAX;
    x = x + 1;  // 溢出！
    std::cout << x << std::endl;  // 输出INT_MIN
    
    unsigned int y = 0;
    y = y - 1;  // 无符号数下溢
    std::cout << y << std::endl;  // 输出UINT_MAX
    
    return 0;
}
\`\`\`

### 固定宽度整型（C++11）

\`\`\`cpp
#include <cstdint>

int32_t x = 42;      // 恰好32位
int64_t y = 42LL;    // 恰好64位
uint8_t byte = 255;  // 恰好8位无符号
int16_t word = 1000; // 恰好16位
\`\`\`

### 整型选择指南

| 需求 | 推荐类型 |
|------|---------|
| 一般整数运算 | int |
| 大整数 | long long |
| 节省内存 | short |
| 位操作 | unsigned 类型 |
| 跨平台固定大小 | int32_t, int64_t |
| 非负数 | unsigned 类型 |

### 整型陷阱

\`\`\`cpp
// 陷阱1：有符号与无符号混用
int x = -1;
unsigned int y = 10;
if (x < y) {  // x被转换为无符号数，变成UINT_MAX
    // 这个条件为false！
}

// 陷阱2：循环中使用无符号数
for (unsigned int i = 10; i >= 0; --i) {
    // 无限循环！i永远不会小于0
}

// 正确写法
for (int i = 10; i >= 0; --i) {
    // 正常循环
}
\`\`\`

### 最佳实践

1. **选择合适的整型**
   \`\`\`cpp
   // 一般情况
   int count = 0;
   
   // 大数值
   long long population = 7800000000LL;
   
   // 固定大小（跨平台）
   int32_t fixed = 42;
   
   // 位操作
   uint32_t flags = 0xFF;
   \`\`\`

2. **避免无符号数陷阱**
   \`\`\`cpp
   // 危险：无符号数永远不会小于 0
   for (unsigned i = 10; i >= 0; --i) { }  // 无限循环！
   
   // 正确：使用有符号数
   for (int i = 10; i >= 0; --i) { }
   \`\`\`

3. **检查溢出**
   \`\`\`cpp
   int a = INT_MAX;
   if (a > INT_MAX - 1) {
       // 即将溢出
   }
   \`\`\`

### 常见错误

1. **整数除法截断**
   \`\`\`cpp
   int a = 5, b = 2;
   double result = a / b;  // 结果是 2.0，不是 2.5
   // 正确：先转换
   double result = (double)a / b;
   \`\`\`

2. **无符号数比较**
   \`\`\`cpp
   int x = -1;
   unsigned y = 1;
   if (x < y) { }  // 错误！x 被转为很大的无符号数
   \`\`\`

3. **字面量类型错误**
   \`\`\`cpp
   long x = 2147483648;  // 可能溢出！
   long x = 2147483648L;  // 正确：明确指定为 long
   \`\`\`

### 深入理解

**整数的二进制表示**

整数在内存中以二进制补码形式存储：
- 正数：直接存储二进制
- 负数：按位取反加一

例如，对于 8 位整数：
- 5 = 00000101
- -5 = 11111011

**溢出的本质**

整数溢出是未定义行为：
- 有符号数溢出：结果不确定
- 无符号数溢出：回绕（模运算）

**不同进制的使用场景**

- **十进制**：日常使用
- **十六进制**：内存地址、颜色值、位掩码
- **二进制**：位操作、标志位
- **八进制**：Unix 文件权限`,

            examples: [
                {
                    title: '整型字面量',
                    code: `#include <iostream>

int main() {
    // 不同进制的整型字面量
    int decimal = 42;
    int octal = 052;
    int hexadecimal = 0x2A;
    int binary = 0b101010;  // C++14
    
    std::cout << "十进制: " << decimal << std::endl;
    std::cout << "八进制: " << octal << std::endl;
    std::cout << "十六进制: " << hexadecimal << std::endl;
    std::cout << "二进制: " << binary << std::endl;
    
    // 它们的值都是42
    std::cout << "所有值相等: " << (decimal == octal && octal == hexadecimal) << std::endl;
    
    return 0;
}`,
                    description: '演示不同进制的整型字面量。'
                },
                {
                    title: '整型溢出',
                    code: `#include <iostream>
#include <climits>

int main() {
    // 有符号整型溢出
    int max = INT_MAX;
    std::cout << "INT_MAX = " << max << std::endl;
    std::cout << "INT_MAX + 1 = " << max + 1 << std::endl;  // 溢出
    
    // 无符号整型下溢
    unsigned int zero = 0;
    std::cout << "\\n0 - 1 (unsigned) = " << zero - 1 << std::endl;  // 下溢
    
    // 使用long long避免溢出
    long long big = static_cast<long long>(INT_MAX) + 1;
    std::cout << "\\n使用long long: " << big << std::endl;
    
    return 0;
}`,
                    description: '演示整型溢出行为。'
                }
            ],
            handsOn: {
                title: '整型进制表示',
                description: '## 任务目标\n掌握C++中不同进制的整数表示方法：十进制、十六进制和二进制。\n\n## 操作步骤\n1. 用十进制表示255\n2. 用十六进制表示255（0xFF）\n3. 用二进制表示255（0b11111111）\n4. 输出三个变量的值验证它们相等\n5. 使用逻辑运算符判断三个值是否全部相等',
                initialCode: `#include <iostream>

int main() {
    // ===== 不同进制表示同一个值 255 =====
    int decimal{255};      // 十进制
    int hexadecimal{0xFF}; // 十六进制 (0x开头)
    int binary{0b11111111}; // 二进制 (0b开头，C++14及以上)
    
    // ===== 输出各进制的值 =====
    std::cout << "十进制: " << decimal << std::endl;
    std::cout << "十六进制: " << hexadecimal << std::endl;
    std::cout << "二进制: " << binary << std::endl;
    
    // ===== 验证是否全部相等 =====
    bool allEqual = (decimal == hexadecimal) && (hexadecimal == binary);
    std::cout << "全部相等: " << allEqual << std::endl;
    
    return 0;
}`,
                expectedOutput: '十进制: 255\n十六进制: 255\n二进制: 255\n全部相等: 1',
                solutionRegex: '0x[0-9a-fA-F]+|0b[01]+',
                hint: '十六进制用0x开头，二进制用0b开头（C++14引入）',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'C++中如何表示十六进制字面量？', options: [{ text: '0开头' }, { text: '0x开头', correct: true }, { text: 'h开头' }, { text: 'x开头' }], explanation: '十六进制字面量以0x或0X开头，如0x2A。' },
                { type: 'single', question: 'int类型溢出时会发生什么？', options: [{ text: '程序崩溃' }, { text: '编译错误' }, { text: '值回绕到最小值', correct: true }, { text: '自动转换为long long' }], explanation: '有符号整型溢出时，值会回绕到最小值（未定义行为，但通常如此）。' },
                { type: 'single', question: '以下哪个是C++14引入的特性？', options: [{ text: '十六进制字面量' }, { text: '二进制字面量', correct: true }, { text: '八进制字面量' }, { text: '长整型' }], explanation: 'C++14引入了二进制字面量（0b开头）和数值分隔符（单引号）。' },
                { type: 'single', question: 'int32_t 保证什么？', options: [{ text: '至少32位' }, { text: '恰好32位', correct: true }, { text: '最多32位' }, { text: '无符号32位' }], explanation: 'int32_t是固定宽度整型，保证恰好为32位。' },
                { type: 'single', question: '为什么不应该在循环中使用unsigned int作为计数器？', options: [{ text: '效率低' }, { text: '可能导致无限循环', correct: true }, { text: '编译器不支持' }, { text: '占用更多内存' }], explanation: 'unsigned int永远不会小于0，条件i>=0永远为真，可能导致无限循环。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.1.1节' }
            ],
            assistantTips: [
                '使用数值分隔符提高大数字的可读性',
                '注意整型溢出，必要时使用更大的类型',
                '避免有符号和无符号数混用'
            ]
        },
        {
            id: '2.4',
            title: '浮点类型详解',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 浮点类型详解

### 浮点类型

C++提供三种浮点类型：

| 类型 | 大小 | 有效数字 | 范围 |
|------|------|---------|------|
| float | 4字节 | 约7位 | 约±3.4×10³⁸ |
| double | 8字节 | 约15位 | 约±1.8×10³⁰⁸ |
| long double | 8-16字节 | ≥15位 | 更大 |

### 浮点字面量

\`\`\`cpp
double d1 = 3.14;        // 小数形式
double d2 = 3.14e2;      // 科学计数法：314.0
double d3 = 3.14e-2;     // 科学计数法：0.0314

float f = 3.14f;         // float后缀：f或F
long double ld = 3.14L;  // long double后缀：l或L
\`\`\`

### 浮点数的精度问题

浮点数在计算机中是近似存储的：

\`\`\`cpp
#include <iostream>
#include <iomanip>

int main() {
    double x = 0.1 + 0.2;
    std::cout << std::setprecision(17);
    std::cout << x << std::endl;  // 0.30000000000000004
    
    // 精度问题导致比较失败
    if (x == 0.3) {
        std::cout << "相等" << std::endl;
    } else {
        std::cout << "不相等" << std::endl;  // 输出这个
    }
    
    return 0;
}
\`\`\`

### 特殊浮点值

\`\`\`cpp
#include <cmath>
#include <limits>

double inf = std::numeric_limits<double>::infinity();
double nan = std::numeric_limits<double>::quiet_NaN();

std::cout << inf << std::endl;  // inf
std::cout << nan << std::endl;  // nan

// 检查函数
std::isinf(inf);  // true
std::isnan(nan);  // true
\`\`\`

### 浮点数比较

由于精度问题，浮点数比较应该使用容差：

\`\`\`cpp
#include <cmath>

bool almostEqual(double a, double b, double epsilon = 1e-9) {
    return std::abs(a - b) < epsilon;
}

double x = 0.1 + 0.2;
if (almostEqual(x, 0.3)) {
    std::cout << "近似相等" << std::endl;
}
\`\`\`

### 浮点数陷阱

\`\`\`cpp
// 陷阱1：大数吃小数
double big = 1e16;
double small = 1.0;
std::cout << big + small - big << std::endl;  // 0，不是1！

// 陷阱2：累加误差
double sum = 0.0;
for (int i = 0; i < 10; ++i) {
    sum += 0.1;
}
std::cout << sum << std::endl;  // 不是精确的1.0
\`\`\`

### 选择建议

- **默认使用 double**：精度足够，性能好
- **float**：需要节省内存且精度要求不高
- **long double**：需要极高精度时

### 最佳实践

1. **默认使用 double**
   \`\`\`cpp
   double price = 19.99;     // 推荐
   float price2 = 19.99f;    // 仅在需要节省内存时使用
   \`\`\`

2. **避免直接比较浮点数**
   \`\`\`cpp
   double x = 0.1 + 0.2;
   // 错误：if (x == 0.3)
   
   // 正确：使用容差比较
   const double EPSILON = 1e-9;
   if (std::abs(x - 0.3) < EPSILON) { }
   \`\`\`

3. **注意精度损失**
   \`\`\`cpp
   // 大数吃小数
   double big = 1e16;
   double small = 1.0;
   double result = big + small - big;  // 结果可能是 0
   \`\`\`

### 常见错误

1. **精度问题导致比较失败**
   \`\`\`cpp
   double x = 0.1 + 0.2;
   if (x == 0.3) { }  // 错误！x ≈ 0.30000000000000004
   \`\`\`

2. **累加误差**
   \`\`\`cpp
   double sum = 0.0;
   for (int i = 0; i < 10; ++i) {
       sum += 0.1;
   }
   // sum 可能不等于 1.0
   \`\`\`

3. **类型后缀遗漏**
   \`\`\`cpp
   float f = 3.14;   // 3.14 是 double，会转换
   float f = 3.14f;  // 正确：明确指定为 float
   \`\`\`

### 深入理解

**IEEE 754 浮点数标准**

浮点数由三部分组成：
- **符号位**：决定正负
- **指数位**：决定范围
- **尾数位**：决定精度

**精度丢失的原因**

浮点数无法精确表示某些十进制数：
- 0.1 在二进制中是无限循环
- 类似于 1/3 在十进制中是 0.333...

**特殊值的作用**

- **无穷大**：表示溢出或除以零
- **NaN**：表示无效操作（如 0/0）
- **非规格化数**：表示非常小的数

**Kahan 求和算法**

减少累加误差的方法：
\`\`\`cpp
double kahan_sum(double* arr, int n) {
    double sum = 0.0, c = 0.0;
    for (int i = 0; i < n; ++i) {
        double y = arr[i] - c;
        double t = sum + y;
        c = (t - sum) - y;
        sum = t;
    }
    return sum;
}
\`\`\``,

            examples: [
                {
                    title: '浮点数精度问题',
                    code: `#include <iostream>
#include <iomanip>

int main() {
    std::cout << std::setprecision(17);
    
    // 经典的0.1 + 0.2问题
    double x = 0.1 + 0.2;
    std::cout << "0.1 + 0.2 = " << x << std::endl;
    std::cout << "与0.3比较: " << (x == 0.3 ? "相等" : "不相等") << std::endl;
    
    // float精度更低
    float f = 0.1f;
    std::cout << "\\nfloat 0.1 = " << f << std::endl;
    
    // 大数吃小数
    double big = 1e16;
    double small = 1.0;
    std::cout << "\\n大数吃小数: " << big + small - big << std::endl;
    
    return 0;
}`,
                    description: '演示浮点数的精度问题。'
                },
                {
                    title: '正确比较浮点数',
                    code: `#include <iostream>
#include <cmath>

// 比较两个浮点数是否近似相等
bool almostEqual(double a, double b, double epsilon = 1e-9) {
    // 方法1：绝对误差
    // return std::abs(a - b) < epsilon;
    
    // 方法2：相对误差（更好）
    if (a == b) return true;
    return std::abs(a - b) < epsilon * std::max(std::abs(a), std::abs(b));
}

int main() {
    double x = 0.1 + 0.2;
    double y = 0.3;
    
    std::cout << "直接比较: " << (x == y ? "相等" : "不相等") << std::endl;
    std::cout << "近似比较: " << (almostEqual(x, y) ? "相等" : "不相等") << std::endl;
    
    return 0;
}`,
                    description: '演示如何正确比较浮点数。'
                }
            ],
            handsOn: {
                title: '浮点数精度问题',
                description: '观察浮点数的精度问题，理解为什么不能直接用==比较浮点数。',
                initialCode: `#include <iostream>
#include <iomanip>

int main() {
    // ===== 你的代码 =====
    // TODO: 计算 0.1 + 0.2 的结果并输出（设置精度为17）
    // std::cout << std::setprecision(17);
    // double sum = 0.1 + 0.2;
    // std::cout << "0.1 + 0.2 = " << sum << std::endl;
    
    // TODO: 判断 sum == 0.3 并输出结果（直接比较）
    
    // TODO: 使用容差比较（epsilon = 1e-9）判断是否相等
    
    return 0;
}`,
                expectedOutput: '0.1 + 0.2 = 0.30000000000000004\\n直接比较: 不相等\\n容差比较: 相等',
                solutionRegex: 'setprecision|0\\.1 \\+ 0\\.2|fabs|epsilon',
                hint: '浮点数精度问题导致0.1+0.2不等于0.3，需用容差比较',
                xp: 150
            },
            quiz: [
                { type: 'single', question: 'double类型的有效数字大约是多少位？', options: [{ text: '7位' }, { text: '15位', correct: true }, { text: '31位' }, { text: '64位' }], explanation: 'double是双精度浮点数，有效数字约为15位。' },
                { type: 'single', question: '如何定义一个float类型的字面量？', options: [{ text: '3.14' }, { text: '3.14f', correct: true }, { text: '3.14F' }, { text: 'B和C都对', correct: true }], explanation: 'float字面量需要加f或F后缀，如3.14f或3.14F。' },
                { type: 'single', question: '为什么0.1 + 0.2 != 0.3？', options: [{ text: '编译器错误' }, { text: '浮点数精度问题', correct: true }, { text: '类型不匹配' }, { text: '运算符优先级' }], explanation: '浮点数在计算机中是近似存储的，0.1和0.2都无法精确表示，累加后产生误差。' },
                { type: 'single', question: '如何正确比较两个浮点数？', options: [{ text: '使用 == 运算符' }, { text: '使用容差比较', correct: true }, { text: '转换为整数比较' }, { text: '使用 > 和 <' }], explanation: '由于精度问题，浮点数比较应该使用容差（epsilon）比较，而不是直接使用==。' },
                { type: 'single', question: '3.14e2 表示什么值？', options: [{ text: '3.14' }, { text: '31.4' }, { text: '314', correct: true }, { text: '0.0314' }], explanation: '3.14e2是科学计数法，表示3.14×10²=314。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.1.2节' },
                { title: 'What Every Computer Scientist Should Know About Floating-Point Arithmetic' }
            ],
            assistantTips: [
                '默认使用double，精度更高',
                '永远不要用==直接比较浮点数',
                '注意浮点数的累加误差'
            ]
        },
        {
            id: '2.5',
            title: '字符类型与布尔类型',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 字符类型与布尔类型

### 字符类型

C++提供多种字符类型：

| 类型 | 大小 | 用途 |
|------|------|------|
| char | 1字节 | 基本字符（ASCII） |
| wchar_t | 2-4字节 | 宽字符 |
| char16_t | 2字节 | UTF-16字符 |
| char32_t | 4字节 | UTF-32字符 |
| char8_t | 1字节 | UTF-8字符（C++20） |

### char 类型

\`\`\`cpp
char c1 = 'A';        // 字符字面量
char c2 = 65;         // ASCII码值，也是'A'
char c3 = '\\n';       // 转义字符

// char可以是有符号或无符号的
signed char sc = -10;
unsigned char uc = 255;
\`\`\`

### 转义字符

| 转义序列 | 含义 |
|---------|------|
| \\n | 换行 |
| \\t | 水平制表符 |
| \\r | 回车 |
| \\\\ | 反斜杠 |
| \\' | 单引号 |
| \\" | 双引号 |
| \\0 | 空字符 |
| \\xhh | 十六进制ASCII码 |

### 字符字面量

\`\`\`cpp
char c = 'A';           // 普通字符
wchar_t wc = L'A';      // 宽字符
char16_t c16 = u'A';    // UTF-16字符
char32_t c32 = U'A';    // UTF-32字符
\`\`\`

### 布尔类型

\`\`\`cpp
bool b1 = true;
bool b2 = false;
bool b3 = 1;    // true（非零值为true）
bool b4 = 0;    // false

// bool转换为整数
int x = true;   // x = 1
int y = false;  // y = 0
\`\`\`

### 布尔值的输出

\`\`\`cpp
#include <iostream>

int main() {
    bool b = true;
    std::cout << b << std::endl;        // 输出：1
    std::cout << std::boolalpha;
    std::cout << b << std::endl;        // 输出：true
    return 0;
}
\`\`\`

### 字符处理函数

\`\`\`cpp
#include <cctype>

isalpha('A');   // 是否为字母
isdigit('5');   // 是否为数字
islower('a');   // 是否为小写
isupper('A');   // 是否为大写
isspace(' ');   // 是否为空白字符
tolower('A');   // 转换为小写
toupper('a');   // 转换为大写
\`\`\`

### 最佳实践

1. **使用字符处理函数**
   \`\`\`cpp
   #include <cctype>
   
   char c = 'A';
   if (isalpha(c)) {
       c = tolower(c);  // 转为小写
   }
   \`\`\`

2. **布尔值输出使用 boolalpha**
   \`\`\`cpp
   bool flag = true;
   std::cout << std::boolalpha << flag;  // 输出 "true"
   \`\`\`

3. **处理 Unicode 字符**
   \`\`\`cpp
   // C++11 起
   char16_t ch = u'中';  // UTF-16
   char32_t ch2 = U'中'; // UTF-32
   \`\`\`

### 常见错误

1. **字符与字符串混淆**
   \`\`\`cpp
   char c = "A";   // 错误！"A" 是字符串
   char c = 'A';   // 正确：'A' 是字符
   \`\`\`

2. **转义字符错误**
   \`\`\`cpp
   char c = '\\';   // 错误！需要转义
   char c = '\\\\';  // 正确：表示反斜杠
   \`\`\`

3. **布尔值与整数混用**
   \`\`\`cpp
   bool b = true;
   int x = b + 1;  // x = 2，可能不是预期行为
   \`\`\`

### 深入理解

**ASCII 编码**

标准 ASCII 使用 7 位表示 128 个字符：
- 0-31：控制字符
- 32-126：可打印字符
- 127：删除字符

**字符编码的发展**

- **ASCII**：7 位，仅支持英文
- **扩展 ASCII**：8 位，支持更多符号
- **Unicode**：支持全球所有字符
- **UTF-8**：变长编码，兼容 ASCII

**布尔类型的实现**

bool 类型通常占用 1 字节：
- true 存储为 1
- false 存储为 0
- 任何非零值转换为 true

**字符处理函数的返回值**

<cctype> 中的函数返回 int 而非 bool：
- 返回非零表示真
- 返回零表示假
- 这是为了兼容 C 语言`,

            examples: [
                {
                    title: '字符类型示例',
                    code: `#include <iostream>
#include <cctype>

int main() {
    // 字符定义
    char c1 = 'A';
    char c2 = 65;  // ASCII码
    
    std::cout << "c1 = " << c1 << std::endl;
    std::cout << "c2 = " << c2 << std::endl;
    std::cout << "c1 == c2: " << (c1 == c2) << std::endl;
    
    // 转义字符
    std::cout << "Hello\\nWorld" << std::endl;
    std::cout << "Tab:\\tHere" << std::endl;
    
    // 字符处理
    char ch = 'a';
    std::cout << "\\n'" << ch << "' 是字母: " << isalpha(ch) << std::endl;
    std::cout << "转大写: " << (char)toupper(ch) << std::endl;
    
    return 0;
}`,
                    description: '演示字符类型的定义和使用。'
                },
                {
                    title: '布尔类型示例',
                    code: `#include <iostream>

int main() {
    bool b1 = true;
    bool b2 = false;
    
    // 默认输出0/1
    std::cout << "true = " << b1 << std::endl;
    std::cout << "false = " << b2 << std::endl;
    
    // 使用boolalpha输出true/false
    std::cout << std::boolalpha;
    std::cout << "true = " << b1 << std::endl;
    std::cout << "false = " << b2 << std::endl;
    
    // 布尔运算
    std::cout << "\\ntrue && false = " << (b1 && b2) << std::endl;
    std::cout << "true || false = " << (b1 || b2) << std::endl;
    std::cout << "!true = " << !b1 << std::endl;
    
    return 0;
}`,
                    description: '演示布尔类型的使用。'
                }
            ],
            handsOn: {
                title: '字符处理',
                description: '编写程序，判断输入的字符是大写字母、小写字母还是数字。',
                initialCode: `#include <iostream>
#include <cctype>

int main() {
    char ch = 'A';  // 测试字符
    
    // TODO: 判断ch是大写字母、小写字母还是数字
    // 使用 isupper, islower, isdigit 函数
    
    return 0;
}`,
                expectedOutput: '字符 A 是大写字母',
                solutionRegex: 'isupper|islower|isdigit',
                hint: '使用<cctype>中的函数：isupper()、islower()、isdigit()',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'char类型的大小是多少字节？', options: [{ text: '取决于平台' }, { text: '1字节', correct: true }, { text: '2字节' }, { text: '4字节' }], explanation: 'char类型始终为1字节，这是C++标准规定的。' },
                { type: 'single', question: '\\n 表示什么？', options: [{ text: '反斜杠和n' }, { text: '换行符', correct: true }, { text: '回车符' }, { text: '制表符' }], explanation: '\\n是转义字符，表示换行符。' },
                { type: 'single', question: 'bool类型的值可以是什么？', options: [{ text: '只能是0或1' }, { text: 'true或false', correct: true }, { text: '任意整数' }, { text: '任意字符' }], explanation: 'bool类型的值只能是true或false。' },
                { type: 'single', question: '如何让cout输出true而不是1？', options: [{ text: 'cout << true' }, { text: '使用std::boolalpha', correct: true }, { text: '转换为字符串' }, { text: '不可能' }], explanation: '使用std::boolalpha操纵符可以让布尔值输出为true/false。' },
                { type: 'single', question: 'isalpha()函数定义在哪个头文件？', options: [{ text: '<iostream>' }, { text: '<cctype>', correct: true }, { text: '<string>' }, { text: '<ctype>' }], explanation: '字符处理函数如isalpha、isdigit等定义在<cctype>头文件中。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.1.1节' }
            ],
            assistantTips: [
                'char可以是有符号或无符号的，取决于编译器',
                '使用<cctype>中的函数处理字符更安全',
                '布尔值输出时使用boolalpha更清晰'
            ]
        },
        {
            id: '2.6',
            title: 'const与constexpr',
            duration: '35分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 400,
            concepts: `## const与constexpr

### const 关键字

\`const\` 定义**常量**，值不能被修改：

\`\`\`cpp
const int MAX_SIZE = 100;
const double PI = 3.14159;

MAX_SIZE = 200;  // 错误！不能修改const变量
\`\`\`

### const 的特点

1. **必须初始化**
\`\`\`cpp
const int x;        // 错误！const变量必须初始化
const int y = 10;   // 正确
\`\`\`

2. **可以在运行时初始化**
\`\`\`cpp
int getValue() { return 42; }
const int x = getValue();  // 运行时初始化
\`\`\`

3. **const与指针**
\`\`\`cpp
// 指向常量的指针（底层const）
const int* p1 = &x;     // 不能通过p1修改x

// 常量指针（顶层const）
int* const p2 = &x;     // p2不能指向其他地址

// 指向常量的常量指针
const int* const p3 = &x;  // 都不能修改
\`\`\`

### constexpr（C++11）

\`constexpr\` 定义**常量表达式**，值必须在**编译时**确定：

\`\`\`cpp
constexpr int MAX_SIZE = 100;        // 编译时常量
constexpr int ARR_SIZE = MAX_SIZE * 2;  // 编译时计算

int x = 10;
constexpr int y = x;  // 错误！x不是常量表达式
\`\`\`

### constexpr 函数

\`\`\`cpp
constexpr int square(int x) {
    return x * x;
}

constexpr int result = square(5);  // 编译时计算，result = 25
\`\`\`

### const vs constexpr

| 特性 | const | constexpr |
|------|-------|-----------|
| 初始化时机 | 运行时或编译时 | 必须编译时 |
| 值是否可变 | 不可变 | 不可变 |
| 用于数组大小 | 不一定可以 | 可以 |
| 用于模板参数 | 不一定可以 | 可以 |

\`\`\`cpp
int x = 10;
const int c1 = x;           // 正确：运行时初始化
constexpr int c2 = x;       // 错误：x不是常量表达式

const int c3 = 10;
constexpr int c4 = c3;      // 正确：c3是常量表达式

int arr1[c1];               // 可能错误：c1不一定是编译时常量
int arr2[c4];               // 正确：c4是编译时常量
\`\`\`

### const 的其他用途

#### const 引用
\`\`\`cpp
const int& ref = 10;  // 正确：const引用可以绑定到临时值
int& ref2 = 10;       // 错误：非const引用不能绑定到临时值
\`\`\`

#### const 成员函数
\`\`\`cpp
class MyClass {
public:
    int getValue() const {  // const成员函数
        return value;        // 不能修改成员变量
    }
private:
    int value;
};
\`\`\`

### 最佳实践

1. 能用constexpr就用constexpr
2. 需要编译时常量时使用constexpr
3. 只需要运行时常量时使用const

### 最佳实践详解

1. **优先使用 constexpr**
   \`\`\`cpp
   // 编译时常量
   constexpr int MAX_SIZE = 100;
   constexpr double PI = 3.14159;
   
   // 编译时计算
   constexpr int square(int x) { return x * x; }
   constexpr int result = square(5);  // 编译时计算
   \`\`\`

2. **理解顶层 const 和底层 const**
   \`\`\`cpp
   int x = 10;
   const int* p1 = &x;      // 底层 const：不能通过 p1 修改 x
   int* const p2 = &x;      // 顶层 const：p2 不能指向其他地址
   const int* const p3 = &x; // 两者都有
   \`\`\`

3. **使用 const 成员函数**
   \`\`\`cpp
   class Point {
   public:
       int getX() const { return x_; }  // 不修改对象状态
       void setX(int x) { x_ = x; }      // 可能修改对象状态
   private:
       int x_, y_;
   };
   \`\`\`

### 常见错误

1. **const 变量未初始化**
   \`\`\`cpp
   const int x;  // 错误！必须初始化
   const int x = 10;  // 正确
   \`\`\`

2. **忽略 const 限定符**
   \`\`\`cpp
   const int x = 10;
   int* p = &x;  // 错误！不能将 const int* 转为 int*
   const int* p = &x;  // 正确
   \`\`\`

3. **constexpr 函数不够简单**
   \`\`\`cpp
   // 错误：constexpr 函数不能有复杂控制流（C++11）
   constexpr int func(int x) {
       if (x > 0) return x;  // C++14 前不允许
       return -x;
   }
   \`\`\`

### 深入理解

**const 的语义**

const 有两层含义：
- **编译时检查**：编译器阻止修改
- **运行时保护**：可能存储在只读内存

**constexpr 的限制**

C++11 中 constexpr 函数的限制：
- 只能有一条 return 语句
- 不能有循环、分支
- 只能调用其他 constexpr 函数

C++14 放宽了这些限制。

**const 与宏的区别**

\`\`\`cpp
#define MAX 100       // 宏：文本替换，无类型检查
const int MAX = 100;  // const：有类型，有作用域
constexpr int MAX = 100;  // constexpr：编译时常量
\`\`\`

**const 引用的绑定规则**

\`\`\`cpp
const int& r1 = 10;   // 正确：const 引用可绑定临时值
int& r2 = 10;         // 错误：非 const 引用不能绑定临时值
\`\`\``,

            examples: [
                {
                    title: 'const基础用法',
                    code: `#include <iostream>

int main() {
    // const变量必须初始化
    const int MAX_SIZE = 100;
    const double PI = 3.14159;
    
    std::cout << "MAX_SIZE = " << MAX_SIZE << std::endl;
    std::cout << "PI = " << PI << std::endl;
    
    // MAX_SIZE = 200;  // 错误！不能修改
    
    // const与指针
    int x = 10, y = 20;
    const int* p1 = &x;   // 指向常量的指针
    int* const p2 = &x;   // 常量指针
    
    // *p1 = 30;  // 错误！不能通过p1修改
    p1 = &y;     // 正确！p1可以指向其他地址
    
    *p2 = 30;    // 正确！可以通过p2修改
    // p2 = &y;  // 错误！p2不能指向其他地址
    
    return 0;
}`,
                    description: '演示const关键字的基本用法。'
                },
                {
                    title: 'constexpr用法',
                    code: `#include <iostream>

// constexpr函数
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int square(int x) {
    return x * x;
}

int main() {
    // 编译时常量
    constexpr int MAX = 100;
    constexpr int SIZE = square(10);  // 编译时计算
    
    // 用于数组大小
    int arr[MAX];
    int arr2[SIZE];
    
    // constexpr函数调用
    constexpr int fact5 = factorial(5);  // 编译时计算
    int n = 5;
    int fact = factorial(n);  // 运行时计算
    
    std::cout << "5! = " << fact5 << std::endl;
    std::cout << "10² = " << SIZE << std::endl;
    
    return 0;
}`,
                    description: '演示constexpr关键字和constexpr函数。'
                }
            ],
            handsOn: {
                title: 'const与constexpr练习',
                description: '定义一个constexpr函数计算圆的面积，并使用它定义编译时常量。',
                initialCode: `#include <iostream>

// TODO: 定义constexpr函数计算圆的面积
// 面积 = π * r * r

int main() {
    // TODO: 使用constexpr定义PI
    // TODO: 使用constexpr函数计算半径为5的圆面积
    
    return 0;
}`,
                expectedOutput: '半径为5的圆面积: 78.5',
                solutionRegex: 'constexpr.*PI|constexpr.*area',
                hint: 'constexpr函数的参数和返回类型都应该是字面量类型',
                xp: 150
            },
            quiz: [
                { type: 'single', question: 'const变量必须怎样？', options: [{ text: '可以不初始化' }, { text: '必须初始化', correct: true }, { text: '必须为0' }, { text: '必须是全局变量' }], explanation: 'const变量定义时必须初始化，之后不能修改。' },
                { type: 'single', question: 'constexpr与const的主要区别是什么？', options: [{ text: '没有区别' }, { text: 'constexpr必须在编译时确定值', correct: true }, { text: 'const更高效' }, { text: 'constexpr可以修改' }], explanation: 'constexpr要求值在编译时确定，而const可以在运行时初始化。' },
                { type: 'single', question: 'const int* p 表示什么？', options: [{ text: 'p是常量' }, { text: 'p指向的值是常量', correct: true }, { text: 'p和它指向的值都是常量' }, { text: '语法错误' }], explanation: 'const int* p是指向常量的指针，不能通过p修改它指向的值。' },
                { type: 'single', question: 'constexpr函数有什么要求？', options: [{ text: '只能有一条return语句' }, { text: '必须有返回值且函数体简单', correct: true }, { text: '不能有参数' }, { text: '必须是void类型' }], explanation: 'constexpr函数必须有返回值，函数体应该足够简单以便编译时计算。' },
                { type: 'single', question: '以下哪个可以用作数组大小？', options: [{ text: 'const int n = getValue();' }, { text: 'constexpr int n = 10;', correct: true }, { text: 'int n = 10;' }, { text: 'volatile int n = 10;' }], explanation: '数组大小需要编译时常量，constexpr保证值在编译时确定。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.4节' },
                { title: 'Effective Modern C++', book: '条款15：尽可能使用constexpr' }
            ],
            assistantTips: [
                '优先使用constexpr定义编译时常量',
                '理解顶层const和底层const的区别',
                'const引用可以绑定到临时值'
            ]
        },
        {
            id: '2.7',
            title: '类型别名与auto',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 类型别名与auto

### 类型别名

类型别名是为已有类型起一个新名字。

#### typedef（传统方式）

\`\`\`cpp
typedef int Integer;
typedef double* DoublePtr;
typedef int Array[10];

Integer x = 10;           // 等价于 int x = 10;
DoublePtr p = new double; // 等价于 double* p
Array arr;                // 等价于 int arr[10]
\`\`\`

#### using（C++11推荐）

\`\`\`cpp
using Integer = int;
using DoublePtr = double*;
using String = std::string;
using IntVec = std::vector<int>;

Integer x = 10;
String s = "Hello";
IntVec v = {1, 2, 3};
\`\`\`

#### typedef vs using

\`\`\`cpp
// typedef的问题
typedef int (*FuncPtr)(int, int);  // 难以理解

// using更清晰
using FuncPtr = int(*)(int, int);

// 模板别名（typedef不支持）
template<typename T>
using Vec = std::vector<T>;

Vec<int> v1;
Vec<double> v2;
\`\`\`

### auto 关键字（C++11）

\`auto\` 让编译器自动推导变量类型：

\`\`\`cpp
auto x = 10;           // int
auto y = 3.14;         // double
auto s = "Hello";      // const char*
auto str = std::string("Hello");  // std::string
\`\`\`

### auto 的规则

1. **必须初始化**
\`\`\`cpp
auto x;        // 错误！必须初始化
auto y = 10;   // 正确
\`\`\`

2. **推导规则**
\`\`\`cpp
int x = 10;
auto a = x;          // int（拷贝）
auto& b = x;         // int&（引用）
const auto& c = x;   // const int&
auto* d = &x;        // int*
\`\`\`

3. **忽略顶层const**
\`\`\`cpp
const int x = 10;
auto a = x;          // int（顶层const被忽略）
const auto b = x;    // const int（需要显式指定）
\`\`\`

### auto 的常见用法

\`\`\`cpp
#include <vector>
#include <map>

int main() {
    // 简化迭代器声明
    std::vector<int> vec = {1, 2, 3};
    for (auto it = vec.begin(); it != vec.end(); ++it) {
        // ...
    }
    
    // 简化复杂类型
    std::map<std::string, std::vector<int>> data;
    auto& ref = data;  // 不用写长长的类型
    
    // 范围for循环
    for (auto& item : vec) {
        item *= 2;
    }
    
    return 0;
}
\`\`\`

### auto 与初始化列表

\`\`\`cpp
auto x = {1, 2, 3};  // std::initializer_list<int>
auto y = 1;          // int
auto z{1};           // int（C++17）
\`\`\`

### decltype（C++11）

\`decltype\` 返回表达式的类型：

\`\`\`cpp
int x = 10;
decltype(x) y = 20;  // y的类型是int

decltype(x + 0.5) z = 1.5;  // z的类型是double

// 用于返回类型
template<typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}
\`\`\`

### 最佳实践

1. 使用 \`using\` 而不是 \`typedef\`
2. 当类型很长或显而易见时使用 \`auto\`
3. 需要获取表达式类型时使用 \`decltype\`

### 最佳实践详解

1. **使用 using 定义类型别名**
   \`\`\`cpp
   // 推荐：using 语法更清晰
   using IntPtr = int*;
   using String = std::string;
   using IntVec = std::vector<int>;
   
   // 模板别名（typedef 不支持）
   template<typename T>
   using Vec = std::vector<T>;
   \`\`\`

2. **合理使用 auto**
   \`\`\`cpp
   // 好的使用场景
   auto it = vec.begin();           // 迭代器类型很长
   auto result = complexFunction(); // 返回类型明确
   for (auto& item : container) { } // 范围 for
   
   // 不好的使用场景
   auto x = 10;       // 类型很明显，不需要 auto
   auto y = getValue(); // 类型不明确，最好显式指定
   \`\`\`

3. **使用 decltype 获取类型**
   \`\`\`cpp
   int x = 10;
   decltype(x) y = 20;  // y 的类型是 int
   
   // 用于返回类型
   auto add(int a, int b) -> decltype(a + b) {
       return a + b;
   }
   \`\`\`

### 常见错误

1. **auto 忽略顶层 const**
   \`\`\`cpp
   const int x = 10;
   auto a = x;        // a 是 int，不是 const int
   const auto b = x;  // b 是 const int
   \`\`\`

2. **auto 与引用**
   \`\`\`cpp
   int x = 10;
   auto a = x;    // a 是 int（拷贝）
   auto& b = x;   // b 是 int&（引用）
   const auto& c = x;  // c 是 const int&
   \`\`\`

3. **初始化列表与 auto**
   \`\`\`cpp
   auto x = {1, 2, 3};  // x 是 std::initializer_list<int>
   auto y = 1;          // y 是 int
   auto z{1};           // C++17: z 是 int
   \`\`\`

### 深入理解

**auto 的类型推导规则**

auto 的推导类似于模板参数推导：
1. 忽略顶层 const
2. 引用修饰符需要显式指定
3. 数组名退化为指针

**decltype 的推导规则**

decltype 保留更多类型信息：
- 保留 const
- 保留引用
- 保留数组类型

**using vs typedef 的区别**

\`\`\`cpp
// typedef 的问题
typedef int (*FuncPtr)(int, int);  // 难以理解

// using 更清晰
using FuncPtr = int(*)(int, int);

// using 支持模板
template<typename T>
using Vec = std::vector<T>;  // typedef 不支持
\`\`\`

**C++14 的返回类型推导**

\`\`\`cpp
// C++14: 自动推导返回类型
auto add(int a, int b) {
    return a + b;  // 返回类型推导为 int
}

// C++14: decltype(auto) 保留引用
decltype(auto) getRef(int& x) {
    return x;  // 返回 int&
}
\`\`\``,

            examples: [
                {
                    title: '类型别名',
                    code: `#include <iostream>
#include <vector>
#include <string>

// using定义类型别名
using Integer = int;
using String = std::string;
using IntVector = std::vector<int>;

// 模板别名
template<typename T>
using Vec = std::vector<T>;

int main() {
    Integer x = 100;
    String name = "C++";
    IntVector nums = {1, 2, 3, 4, 5};
    
    Vec<double> doubles = {1.1, 2.2, 3.3};
    
    std::cout << "x = " << x << std::endl;
    std::cout << "name = " << name << std::endl;
    std::cout << "nums size = " << nums.size() << std::endl;
    std::cout << "doubles size = " << doubles.size() << std::endl;
    
    return 0;
}`,
                    description: '演示using定义类型别名。'
                },
                {
                    title: 'auto自动类型推导',
                    code: `#include <iostream>
#include <vector>
#include <map>

int main() {
    // 基本类型推导
    auto i = 42;          // int
    auto d = 3.14;        // double
    auto s = "hello";     // const char*
    
    std::cout << "i = " << i << std::endl;
    std::cout << "d = " << d << std::endl;
    std::cout << "s = " << s << std::endl;
    
    // 复杂类型简化
    std::map<std::string, std::vector<int>> data;
    data["key"] = {1, 2, 3};
    
    // 使用auto简化迭代器
    for (auto it = data.begin(); it != data.end(); ++it) {
        std::cout << it->first << ": ";
        for (auto val : it->second) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}`,
                    description: '演示auto关键字的类型推导。'
                }
            ],
            handsOn: {
                title: 'auto练习',
                description: '使用auto简化复杂类型的变量声明。',
                initialCode: `#include <iostream>
#include <vector>
#include <map>

int main() {
    std::map<std::string, std::vector<std::pair<int, double>>> complexData;
    complexData["scores"] = {{1, 95.5}, {2, 87.0}, {3, 92.3}};
    
    // TODO: 使用auto声明迭代器遍历complexData
    // TODO: 使用auto引用遍历vector中的pair
    
    return 0;
}`,
                expectedOutput: 'scores: (1, 95.5) (2, 87) (3, 92.3)',
                solutionRegex: 'auto.*it|auto.*&',
                hint: '使用auto&来获取引用，避免拷贝',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'using和typedef的主要区别是什么？', options: [{ text: '没有区别' }, { text: 'using支持模板别名', correct: true }, { text: 'typedef更现代' }, { text: 'using不能定义指针' }], explanation: 'using支持模板别名，语法更清晰，是C++11推荐的方式。' },
                { type: 'single', question: 'auto x = 10; x的类型是什么？', options: [{ text: 'auto' }, { text: 'int', correct: true }, { text: 'double' }, { text: 'const int' }], explanation: 'auto会根据初始化表达式推导类型，10是int字面量，所以x是int。' },
                { type: 'single', question: 'auto变量必须怎样？', options: [{ text: '必须是全局变量' }, { text: '必须初始化', correct: true }, { text: '必须是const' }, { text: '必须是指针' }], explanation: 'auto变量必须有初始化表达式，编译器才能推导类型。' },
                { type: 'single', question: 'decltype的作用是什么？', options: [{ text: '定义新类型' }, { text: '返回表达式的类型', correct: true }, { text: '删除类型' }, { text: '转换类型' }], explanation: 'decltype返回表达式的类型，常用于需要获取表达式类型的场景。' },
                { type: 'single', question: 'const int x = 10; auto y = x; y的类型是什么？', options: [{ text: 'const int' }, { text: 'int', correct: true }, { text: 'int&' }, { text: 'auto' }], explanation: 'auto会忽略顶层const，所以y的类型是int而不是const int。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.5节' },
                { title: 'Effective Modern C++', book: '条款5：优先使用auto而非显式类型声明' }
            ],
            assistantTips: [
                '优先使用using而不是typedef',
                'auto可以大大简化代码，但不要滥用',
                '理解auto的推导规则，特别是const和引用'
            ]
        },
        {
            id: '2.8',
            title: '作用域与生命周期',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 作用域与生命周期

### 作用域（Scope）

作用域是程序中名称可见的区域。

#### 作用域类型

\`\`\`cpp
// 全局作用域
int globalVar = 100;

void function() {
    // 函数作用域
    int localVar = 200;
    
    {
        // 块作用域
        int blockVar = 300;
        // localVar在这里也可见
    }
    // blockVar在这里不可见
}
// localVar在这里不可见
\`\`\`

### 作用域规则

1. **局部变量**：从定义点到所在块结束
2. **全局变量**：从定义点到文件结束
3. **嵌套作用域**：内层可以访问外层的名称

\`\`\`cpp
int x = 10;  // 全局变量

void func() {
    int x = 20;  // 局部变量，隐藏全局x
    std::cout << x << std::endl;  // 输出20
    
    {
        int x = 30;  // 隐藏外层x
        std::cout << x << std::endl;  // 输出30
    }
    
    std::cout << x << std::endl;  // 输出20
}

// ::x 可以访问全局x
\`\`\`

### 生命周期（Lifetime）

生命周期是对象存在的时间段。

| 存储类型 | 生命周期 | 初始化 |
|---------|---------|--------|
| 自动（局部变量） | 块内 | 未定义 |
| 静态（static） | 程序运行期 | 0 |
| 动态（new） | 手动管理 | 未定义 |
| 线程局部（thread_local） | 线程运行期 | 0 |

### 静态变量

\`\`\`cpp
void counter() {
    static int count = 0;  // 静态局部变量
    count++;
    std::cout << "调用次数: " << count << std::endl;
}

int main() {
    counter();  // 输出：调用次数: 1
    counter();  // 输出：调用次数: 2
    counter();  // 输出：调用次数: 3
    return 0;
}
\`\`\`

### 全局变量

\`\`\`cpp
// file1.cpp
int globalVar = 100;  // 定义

// file2.cpp
extern int globalVar;  // 声明，使用其他文件的变量
\`\`\`

### 命名空间作用域

\`\`\`cpp
namespace MyNamespace {
    int x = 10;
    void func() { }
}

// 使用
MyNamespace::x;
MyNamespace::func();

// using声明
using MyNamespace::x;

// using指令
using namespace MyNamespace;
\`\`\`

### 变量隐藏

\`\`\`cpp
int x = 10;  // 全局x

void func() {
    int x = 20;  // 隐藏全局x
    std::cout << x << std::endl;      // 20
    std::cout << ::x << std::endl;    // 10，使用全局x
}
\`\`\`

### 最佳实践

1. 尽量减少全局变量的使用
2. 在最小作用域内定义变量
3. 使用命名空间组织代码
4. 避免变量名隐藏

### 最佳实践详解

1. **最小作用域原则**
   \`\`\`cpp
   // 好的做法：在需要时才定义
   void process() {
       // ... 一些代码
       if (condition) {
           int result = calculate();  // 只在需要时定义
           useResult(result);
       }
       // result 在这里不可见
   }
   \`\`\`

2. **避免全局变量**
   \`\`\`cpp
   // 不好的做法
   int globalCounter = 0;  // 全局变量
   
   // 好的做法：使用命名空间
   namespace Counter {
       static int value = 0;
       void increment() { ++value; }
   }
   \`\`\`

3. **使用静态局部变量**
   \`\`\`cpp
   // 单例模式的常见实现
   class Singleton {
   public:
       static Singleton& getInstance() {
           static Singleton instance;  // 静态局部变量
           return instance;
       }
   private:
       Singleton() {}
   };
   \`\`\`

### 常见错误

1. **变量名隐藏**
   \`\`\`cpp
   int x = 10;
   void func() {
       int x = 20;  // 隐藏全局 x
       {
           int x = 30;  // 隐藏外层 x
           std::cout << x;  // 30
       }
   }
   \`\`\`

2. **生命周期问题**
   \`\`\`cpp
   int* getPointer() {
       int x = 10;
       return &x;  // 错误！返回局部变量的地址
   }
   \`\`\`

3. **静态变量初始化顺序**
   \`\`\`cpp
   // file1.cpp
   int a = initA();  // 初始化顺序不确定
   
   // file2.cpp
   int b = initB();  // 可能依赖 a，但 a 可能未初始化
   \`\`\`

### 深入理解

**作用域的类型**

C++ 有多种作用域：
- **全局作用域**：整个程序可见
- **命名空间作用域**：命名空间内可见
- **类作用域**：类成员可见性
- **局部作用域**：块内可见

**存储持续期**

变量的生命周期取决于存储持续期：
- **自动存储期**：局部变量，栈上分配
- **静态存储期**：全局变量、静态变量
- **动态存储期**：new 分配，堆上
- **线程存储期**：thread_local 变量

**链接属性**

变量和函数的链接属性：
- **外部链接**：可被其他文件访问
- **内部链接**：仅本文件可见（static）
- **无链接**：局部变量

\`\`\`cpp
// 外部链接
int global;           // 可被其他文件访问
extern int otherVar;  // 声明其他文件的变量

// 内部链接
static int fileLocal = 10;  // 仅本文件可见
const int CONST = 100;      // const 默认内部链接

// 无链接
void func() {
    int local = 20;  // 无链接
}
\`\`\`

**RAII 与生命周期管理**

RAII（资源获取即初始化）利用生命周期管理资源：
\`\`\`cpp
void process() {
    std::vector<int> data;  // 构造时分配内存
    // ... 使用 data
}  // 析构时自动释放内存
\`\`\``,

            examples: [
                {
                    title: '作用域示例',
                    code: `#include <iostream>

int globalVar = 100;  // 全局变量

void demonstrateScope() {
    int localVar = 200;  // 局部变量
    
    std::cout << "函数内: localVar = " << localVar << std::endl;
    std::cout << "函数内: globalVar = " << globalVar << std::endl;
    
    {
        int blockVar = 300;  // 块变量
        int localVar = 999;  // 隐藏外层localVar
        
        std::cout << "块内: blockVar = " << blockVar << std::endl;
        std::cout << "块内: localVar = " << localVar << std::endl;
        std::cout << "块内: ::globalVar = " << ::globalVar << std::endl;
    }
    // blockVar在这里不可见
    
    std::cout << "块外: localVar = " << localVar << std::endl;
}

int main() {
    demonstrateScope();
    // localVar在这里不可见
    std::cout << "main: globalVar = " << globalVar << std::endl;
    return 0;
}`,
                    description: '演示不同作用域的变量可见性。'
                },
                {
                    title: '静态变量示例',
                    code: `#include <iostream>

// 静态局部变量
void counter() {
    static int count = 0;  // 只初始化一次
    count++;
    std::cout << "第 " << count << " 次调用" << std::endl;
}

// 静态全局变量（只在本文件可见）
static int fileStatic = 100;

int main() {
    counter();  // 第1次
    counter();  // 第2次
    counter();  // 第3次
    
    std::cout << "\\n静态全局变量: " << fileStatic << std::endl;
    
    return 0;
}`,
                    description: '演示静态变量的生命周期。'
                }
            ],
            handsOn: {
                title: '作用域练习',
                description: '编写一个计数器函数，使用静态变量记录调用次数。',
                initialCode: `#include <iostream>

// TODO: 编写函数getCallCount
// 每次调用返回调用次数（1, 2, 3...）

int main() {
    std::cout << getCallCount() << std::endl;  // 应输出1
    std::cout << getCallCount() << std::endl;  // 应输出2
    std::cout << getCallCount() << std::endl;  // 应输出3
    
    return 0;
}`,
                expectedOutput: '1\n2\n3',
                solutionRegex: 'static.*count',
                hint: '使用static局部变量，它只初始化一次',
                xp: 120
            },
            quiz: [
                { type: 'single', question: '局部变量的作用域是什么？', options: [{ text: '整个程序' }, { text: '整个文件' }, { text: '定义点到所在块结束', correct: true }, { text: '整个函数' }], explanation: '局部变量的作用域是从定义点到所在块（花括号内）结束。' },
                { type: 'single', question: '静态局部变量的生命周期是什么？', options: [{ text: '函数调用期间' }, { text: '程序运行期间', correct: true }, { text: '块执行期间' }, { text: '不确定' }], explanation: '静态局部变量在程序开始时创建，程序结束时销毁，但作用域仍是局部的。' },
                { type: 'single', question: '如何访问被隐藏的全局变量？', options: [{ text: '不能访问' }, { text: '使用::前缀', correct: true }, { text: '使用extern' }, { text: '使用static' }], explanation: '使用作用域解析运算符::可以访问全局变量，如::globalVar。' },
                { type: 'single', question: 'extern关键字的作用是什么？', options: [{ text: '定义变量' }, { text: '声明其他文件的变量', correct: true }, { text: '删除变量' }, { text: '创建静态变量' }], explanation: 'extern用于声明在其他文件中定义的全局变量。' },
                { type: 'single', question: '以下哪个不是好的编程习惯？', options: [{ text: '最小作用域原则' }, { text: '大量使用全局变量', correct: true }, { text: '使用命名空间' }, { text: '避免变量名隐藏' }], explanation: '大量使用全局变量会导致代码难以维护，应该尽量避免。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第2.2.4节' }
            ],
            assistantTips: [
                '在最小作用域内定义变量',
                '静态变量只初始化一次',
                '避免过多使用全局变量'
            ]
        }
    ]
};
