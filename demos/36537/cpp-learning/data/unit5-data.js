/**
 * 第5章：语句
 * 完整的学习内容
 */

var Unit5Data = {
    id: 5,
    title: '语句',
    description: '掌握C++的各种控制流语句',
    lessons: [
        {
            id: '5.1',
            title: '语句概述',
            duration: '20分钟',
            difficulty: '入门',
            xp: 80,
            estimatedXp: 250,
            concepts: `## 语句概述

### 什么是语句？

语句是C++程序的**基本执行单位**，以分号结尾。

\`\`\`cpp
int x = 10;        // 声明语句
x = x + 1;         // 表达式语句
;                  // 空语句
\`\`\`

### 语句分类

\`\`\`
语句
├── 简单语句
│   ├── 表达式语句
│   ├── 空语句
│   └── 声明语句
├── 复合语句（语句块）
├── 控制语句
│   ├── 条件语句（if, switch）
│   ├── 循环语句（while, for, do-while）
│   └── 跳转语句（break, continue, return, goto）
└── 异常处理语句（try-catch）
\`\`\`

### 表达式语句

在表达式后加分号：

\`\`\`cpp
x = 10;           // 赋值表达式语句
x++;              // 递增表达式语句
func();           // 函数调用表达式语句
x + y;            // 合法但无意义（结果被丢弃）
\`\`\`

### 空语句

只包含一个分号：

\`\`\`cpp
;  // 空语句，什么都不做

// 常见用途：循环体为空
while (cin >> x && x != 0)
    ;  // 读取直到遇到0
\`\`\`

### 复合语句（语句块）

用花括号括起来的语句序列：

\`\`\`cpp
{
    int x = 10;    // 块内变量
    x = x + 1;
    std::cout << x;
}  // x在这里超出作用域
\`\`\`

### 声明语句

\`\`\`cpp
int x;                  // 变量声明
int y = 10;             // 带初始化的声明
const int MAX = 100;    // 常量声明
\`\`\`

### 语句的作用域

\`\`\`cpp
int x = 10;           // 全局作用域

void func() {
    int x = 20;       // 函数作用域
    {
        int x = 30;   // 块作用域
        std::cout << x;  // 30
    }
    std::cout << x;   // 20
}
\`\`\`

### 最佳实践

1. **每个语句独占一行**
   \`\`\`cpp
   // 推荐
   int x = 10;
   x = x + 1;

   // 不推荐
   int x = 10; x = x + 1;
   \`\`\`

2. **使用花括号明确代码块**
   \`\`\`cpp
   // 推荐：即使只有一条语句也使用花括号
   if (x > 0) {
       return x;
   }

   // 不推荐
   if (x > 0)
       return x;
   \`\`\`

3. **避免空语句的意外使用**
   \`\`\`cpp
   // 错误：意外的空语句
   if (x > 0);  // 这里的分号是空语句！
   {
       std::cout << "总是执行";
   }
   \`\`\`

4. **在最小作用域内声明变量**
   \`\`\`cpp
   // 推荐
   for (int i = 0; i < 10; ++i) {
       int temp = compute(i);  // 只在需要时声明
   }

   // 不推荐
   int temp;  // 过早声明
   for (int i = 0; i < 10; ++i) {
       temp = compute(i);
   }
   \`\`\`

### 常见错误

1. **漏掉分号**
   \`\`\`cpp
   int x = 10  // 错误：缺少分号
   int y = 20;
   \`\`\`

2. **多余的分号**
   \`\`\`cpp
   if (x > 0);  // 空语句，条件判断无效
   {
       std::cout << "总是执行";
   }
   \`\`\`

3. **花括号不匹配**
   \`\`\`cpp
   if (x > 0) {
       std::cout << "正数";
   // 错误：缺少右花括号
   \`\`\`

4. **变量作用域错误**
   \`\`\`cpp
   {
       int x = 10;
   }
   std::cout << x;  // 错误：x 已超出作用域
   \`\`\`

### 深入理解

**语句的执行模型**

C++ 程序的执行是语句的顺序执行：
- 除非遇到控制语句，否则按顺序执行
- 复合语句创建新的作用域
- 表达式语句先求值表达式，然后丢弃结果

**语句与表达式的区别**

- **表达式**：产生值，如 `x + y`、`a = b`
- **语句**：执行操作，如 `x = 10;`、`if (...) {...}`

\`\`\`cpp
x + y;      // 表达式语句：计算并丢弃结果
x = 10;     // 赋值表达式语句：计算并丢弃结果
\`\`\`

**空语句的用途**

空语句在某些场景下有用：
\`\`\`cpp
// 读取输入直到遇到特定值
while (std::cin >> x && x != 0)
    ;  // 空语句：只读取，不处理

// 用于标签
label: ;  // 空语句作为 goto 目标
\`\`\`

**声明语句与初始化**

C++ 的声明可以包含初始化：
\`\`\`cpp
int x;           // 默认初始化（可能未定义）
int y = 10;      // 拷贝初始化
int z(10);       // 直接初始化
int w{10};       // 列表初始化（C++11）
\`\`\``,
            examples: [
                {
                    title: '语句类型',
                    code: `#include <iostream>

int main() {
    // 表达式语句
    int x = 10;
    x = x + 5;
    
    // 空语句
    ;
    
    // 复合语句
    {
        int y = 20;
        std::cout << "块内 y = " << y << std::endl;
    }
    // y 在这里不可见
    
    // 声明语句
    const int MAX = 100;
    
    std::cout << "x = " << x << std::endl;
    std::cout << "MAX = " << MAX << std::endl;
    
    return 0;
}`,
                    description: '演示各种类型的语句。'
                }
            ],
            handsOn: {
                title: '语句练习',
                description: '练习识别和编写不同类型的语句。',
                initialCode: `#include <iostream>

int main() {
    // 声明语句
    int count = 0;
    double price = 19.99;
    
    // ===== 你的代码 =====
    // 1. 编写一个表达式语句: 将 count 加上 5
    // 2. 编写一个复合语句（语句块）: 在块内声明一个变量并输出
    // 3. 编写一个空语句
    
    // 表达式语句示例:
    count = count + 5;  // 这是表达式语句
    
    // 复合语句: 用花括号括起来的语句序列
    {
        int localVar = 100;
        std::cout << "块内变量: " << localVar << std::endl;
    }
    
    // 空语句: 只有一个分号
    ;  // 空语句，什么都不做
    
    // ===== 你的代码 =====
    // 编写代码统计以下语句的数量
    int statementCount = 0;
    // 下面的代码包含几个语句？尝试数一数
    
    {
        int x = 5;      // 语句1
        x = x + 1;      // 语句2
        std::cout << x; // 语句3
        ;               // 语句4（空语句）
    }
    
    statementCount = 4;  // 修改这一行，填入正确的数量
    
    std::cout << "块内语句数量: " << statementCount << std::endl;
    
    return 0;
}`,
                expectedOutput: '块内变量: 100\n块内语句数量: 4',
                solutionRegex: 'count.*=.*count.*\\+.*5|statementCount.*=.*4',
                hint: '语句以分号结尾，花括号内的是一个复合语句',
                xp: 80
            },
            quiz: [
                { type: 'single', question: '语句以什么符号结尾？', options: [{ text: '句号' }, { text: '分号', correct: true }, { text: '冒号' }, { text: '逗号' }], explanation: 'C++语句以分号(;)结尾。' },
                { type: 'single', question: '空语句是什么？', options: [{ text: '没有语句' }, { text: '只有一个分号的语句', correct: true }, { text: '注释' }, { text: '空格' }], explanation: '空语句只包含一个分号，什么都不做。' },
                { type: 'single', question: '复合语句用什么括起来？', options: [{ text: '小括号()' }, { text: '中括号[]' }, { text: '花括号{}', correct: true }, { text: '尖括号<>' }], explanation: '复合语句（语句块）用花括号{}括起来。' },
                { type: 'single', question: '块内变量的作用域是什么？', options: [{ text: '整个程序' }, { text: '整个函数' }, { text: '从定义到块结束', correct: true }, { text: '从定义到文件结束' }], explanation: '块内变量的作用域是从定义点到所在块的结束。' },
                { type: 'single', question: '以下哪个是表达式语句？', options: [{ text: 'int x;' }, { text: 'x = 10;', correct: true }, { text: '{ int x; }' }, { text: 'if (x > 0)' }], explanation: 'x = 10; 是赋值表达式语句。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.1节' }
            ],
            assistantTips: [
                '每个语句独占一行，提高可读性',
                '使用花括号明确代码块边界',
                '在最小作用域内声明变量'
            ]
        },
        {
            id: '5.2',
            title: '条件语句：if-else',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 条件语句：if-else

### if 语句

根据条件决定是否执行代码块：

\`\`\`cpp
if (condition) {
    // condition为真时执行
}

// 示例
int x = 10;
if (x > 0) {
    std::cout << "x是正数" << std::endl;
}
\`\`\`

### if-else 语句

\`\`\`cpp
if (condition) {
    // condition为真时执行
} else {
    // condition为假时执行
}

// 示例
int x = -5;
if (x >= 0) {
    std::cout << "x是非负数" << std::endl;
} else {
    std::cout << "x是负数" << std::endl;
}
\`\`\`

### if-else if-else 链

\`\`\`cpp
int score = 85;

if (score >= 90) {
    std::cout << "优秀" << std::endl;
} else if (score >= 80) {
    std::cout << "良好" << std::endl;
} else if (score >= 60) {
    std::cout << "及格" << std::endl;
} else {
    std::cout << "不及格" << std::endl;
}
\`\`\`

### 条件表达式

条件会被转换为bool值：

\`\`\`cpp
// 非零值为true，零值为false
int x = 10;
if (x) { }        // x非零，条件为真

// 指针
int* p = nullptr;
if (p) { }        // p非空，条件为真
if (!p) { }       // p为空，条件为真

// 常见写法
if (x != 0) { }   // 等价于 if (x)
if (x == 0) { }   // 等价于 if (!x)
\`\`\`

### 花括号的使用

\`\`\`cpp
// 单语句可以省略花括号（不推荐）
if (x > 0)
    std::cout << "正数" << std::endl;

// 多语句必须使用花括号
if (x > 0) {
    std::cout << "正数" << std::endl;
    count++;
}

// 推荐：始终使用花括号
if (x > 0) {
    std::cout << "正数" << std::endl;
}
\`\`\`

### 悬空else问题

\`\`\`cpp
// else匹配最近的未匹配的if
if (x > 0)
    if (y > 0)
        std::cout << "x和y都为正" << std::endl;
    else
        std::cout << "x为正，y不为正" << std::endl;

// 使用花括号消除歧义
if (x > 0) {
    if (y > 0) {
        std::cout << "x和y都为正" << std::endl;
    }
} else {
    std::cout << "x不为正" << std::endl;
}
\`\`\`

### 常见陷阱

\`\`\`cpp
// 陷阱1：混淆 = 和 ==
if (x = 5) { }   // 赋值！x被赋值为5，条件为真
if (x == 5) { }  // 比较，正确

// 陷阱2：漏掉花括号
if (x > 0)
    std::cout << "正数";
    count++;        // 这行总是执行！

// 陷阱3：多余的空语句
if (x > 0);      // 空语句！
{
    std::cout << "总是执行" << std::endl;
}
\`\`\`

### 最佳实践

1. **始终使用花括号**
   \`\`\`cpp
   // 推荐：即使只有一条语句
   if (x > 0) {
       return x;
   } else {
       return -x;
   }

   // 不推荐：容易出错
   if (x > 0)
       return x;
   else
       return -x;
   \`\`\`

2. **先处理特殊情况**
   \`\`\`cpp
   // 推荐：提前返回
   void process(int x) {
       if (x < 0) {
           return;  // 先处理无效情况
       }
       // 处理正常情况
   }

   // 不推荐：深层嵌套
   void process(int x) {
       if (x >= 0) {
           // 处理正常情况
       }
   }
   \`\`\`

3. **使用常量或枚举代替魔法数字**
   \`\`\`cpp
   // 推荐
   constexpr int SUCCESS = 0;
   constexpr int ERROR_INVALID = -1;

   if (result == SUCCESS) { }

   // 不推荐
   if (result == 0) { }
   \`\`\`

4. **避免深层嵌套**
   \`\`\`cpp
   // 不推荐：嵌套过深
   if (a > 0) {
       if (b > 0) {
           if (c > 0) {
               // ...
           }
       }
   }

   // 推荐：合并条件或提取函数
   if (a > 0 && b > 0 && c > 0) {
       // ...
   }
   \`\`\`

### 深入理解

**if 语句的条件求值**

条件表达式会被转换为 bool 类型：
\`\`\`cpp
// 以下值转换为 false
if (0) { }        // 整数 0
if (0.0) { }      // 浮点 0.0
if (nullptr) { }  // 空指针
if ('\\0') { }     // 空字符

// 其他值转换为 true
if (1) { }        // 非零整数
if (0.1) { }      // 非零浮点
if (ptr) { }      // 非空指针
\`\`\`

**else 的匹配规则**

else 总是匹配最近的未匹配的 if：
\`\`\`cpp
if (a > 0)
    if (b > 0)
        std::cout << "a和b都为正";
    else
        std::cout << "a为正，b不为正";  // 匹配内层 if
\`\`\`

**if 语句的优化**

编译器可能对 if 语句进行优化：
- 分支预测：预测哪个分支更可能执行
- 条件移动：使用 cmov 指令避免分支
- 向量化：将条件操作转换为向量操作

\`\`\`cpp
// 可能被优化为条件移动
int max = (a > b) ? a : b;
\`\`\`

**if constexpr（C++17）**

编译期条件判断：
\`\`\`cpp
template<typename T>
void process(T x) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "整数: " << x << std::endl;
    } else if constexpr (std::is_floating_point_v<T>) {
        std::cout << "浮点数: " << x << std::endl;
    }
}
\`\`\``,
            examples: [
                {
                    title: 'if-else基础',
                    code: `#include <iostream>

int main() {
    int x;
    std::cout << "请输入一个整数: ";
    std::cin >> x;
    
    // if-else
    if (x > 0) {
        std::cout << x << " 是正数" << std::endl;
    } else if (x < 0) {
        std::cout << x << " 是负数" << std::endl;
    } else {
        std::cout << x << " 是零" << std::endl;
    }
    
    // 嵌套if
    if (x != 0) {
        if (x % 2 == 0) {
            std::cout << x << " 是偶数" << std::endl;
        } else {
            std::cout << x << " 是奇数" << std::endl;
        }
    }
    
    return 0;
}`,
                    description: '演示if-else语句的基本用法。'
                },
                {
                    title: '成绩等级判断',
                    code: `#include <iostream>

int main() {
    int score;
    std::cout << "请输入成绩: ";
    std::cin >> score;
    
    // 输入验证
    if (score < 0 || score > 100) {
        std::cout << "成绩无效！" << std::endl;
        return 1;
    }
    
    // 等级判断
    char grade;
    if (score >= 90) {
        grade = 'A';
    } else if (score >= 80) {
        grade = 'B';
    } else if (score >= 70) {
        grade = 'C';
    } else if (score >= 60) {
        grade = 'D';
    } else {
        grade = 'F';
    }
    
    std::cout << "成绩等级: " << grade << std::endl;
    
    return 0;
}`,
                    description: '演示if-else if-else链的使用。'
                }
            ],
            handsOn: {
                title: 'if-else练习',
                description: '编写程序判断一个年份是否为闰年。',
                initialCode: `#include <iostream>

int main() {
    int year = 2024;
    
    // TODO: 判断闰年
    // 闰年规则：
    // 1. 能被4整除但不能被100整除，或者
    // 2. 能被400整除
    
    return 0;
}`,
                expectedOutput: '2024 是闰年',
                solutionRegex: '%.*==.*0|if.*year',
                hint: '使用 % 运算符判断整除，使用 && 和 || 组合条件',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'if语句的条件是什么类型？', options: [{ text: '只能是int' }, { text: '会被转换为bool', correct: true }, { text: '只能是bool' }, { text: '只能是表达式' }], explanation: 'if语句的条件会被转换为bool类型。' },
                { type: 'single', question: 'else匹配哪个if？', options: [{ text: '第一个if' }, { text: '最后一个if' }, { text: '最近的未匹配的if', correct: true }, { text: '所有if' }], explanation: 'else匹配最近的未匹配的if。' },
                { type: 'single', question: 'if (x = 5) 有什么问题？', options: [{ text: '语法错误' }, { text: '这是赋值，条件总是为真', correct: true }, { text: '条件为假' }, { text: '没有问题' }], explanation: 'x = 5是赋值表达式，值为5（非零），条件总是为真。' },
                { type: 'single', question: '为什么推荐始终使用花括号？', options: [{ text: '语法要求' }, { text: '提高可读性和避免错误', correct: true }, { text: '性能更好' }, { text: '编译器要求' }], explanation: '使用花括号可以避免悬空else等问题，提高代码可读性。' },
                { type: 'single', question: 'if (x); { ... } 有什么问题？', options: [{ text: '语法错误' }, { text: '花括号内的代码总是执行', correct: true }, { text: '条件不生效' }, { text: '没有问题' }], explanation: 'if后面的分号是空语句，花括号内的代码会无条件执行。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.2节' }
            ],
            assistantTips: [
                '始终使用花括号，即使只有一条语句',
                '注意区分 = 和 ==',
                '避免深层嵌套，考虑重构'
            ]
        },
        {
            id: '5.3',
            title: 'switch语句',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## switch语句

### 基本语法

switch语句根据表达式的值选择执行分支：

\`\`\`cpp
switch (expression) {
    case value1:
        // expression == value1 时执行
        break;
    case value2:
        // expression == value2 时执行
        break;
    default:
        // 其他情况执行
        break;
}
\`\`\`

### 示例

\`\`\`cpp
int day = 3;

switch (day) {
    case 1:
        std::cout << "星期一" << std::endl;
        break;
    case 2:
        std::cout << "星期二" << std::endl;
        break;
    case 3:
        std::cout << "星期三" << std::endl;
        break;
    // ...
    default:
        std::cout << "无效的日期" << std::endl;
        break;
}
\`\`\`

### switch的特点

1. **表达式类型**：必须是整数类型或枚举类型
2. **case标签**：必须是常量表达式
3. **default标签**：可选，处理其他情况
4. **break语句**：跳出switch，否则会继续执行下一个case

### 穿透行为

\`\`\`cpp
int x = 1;

switch (x) {
    case 1:
        std::cout << "case 1" << std::endl;
        // 没有break，继续执行case 2
    case 2:
        std::cout << "case 2" << std::endl;
        break;
    default:
        std::cout << "default" << std::endl;
}
// 输出：case 1
//       case 2
\`\`\`

### 利用穿透

\`\`\`cpp
char c = 'a';

switch (c) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        std::cout << "元音字母" << std::endl;
        break;
    default:
        std::cout << "辅音字母" << std::endl;
        break;
}
\`\`\`

### 变量定义

\`\`\`cpp
switch (x) {
    case 1:
        int y = 10;  // 错误！可能跳过初始化
        break;
    case 2:
        // y可能未初始化
        break;
}

// 正确做法：使用块
switch (x) {
    case 1: {
        int y = 10;  // 正确
        break;
    }
    case 2:
        break;
}
\`\`\`

### switch vs if-else

| 特性 | switch | if-else |
|------|--------|---------|
| 条件类型 | 整数/枚举 | 任意 |
| 比较方式 | 相等比较 | 任意条件 |
| 性能 | 可能使用跳转表 | 顺序判断 |
| 可读性 | 多分支时更好 | 条件复杂时更好 |

### 最佳实践

1. **始终添加 break 语句**
   \`\`\`cpp
   switch (x) {
       case 1:
           doSomething();
           break;  // 推荐：明确结束
       case 2:
           doAnother();
           break;
   }
   \`\`\`

2. **利用穿透简化代码**
   \`\`\`cpp
   // 多个case执行相同操作
   switch (ch) {
       case 'a':
       case 'e':
       case 'i':
       case 'o':
       case 'u':
           std::cout << "元音";
           break;
   }
   \`\`\`

3. **始终包含 default 分支**
   \`\`\`cpp
   switch (x) {
       case 1:
           // ...
           break;
       default:
           std::cout << "未知选项";
           break;
   }
   \`\`\`

4. **在 case 中定义变量时使用块**
   \`\`\`cpp
   switch (x) {
       case 1: {
           int temp = compute();  // 正确：在块内定义
           break;
       }
       case 2:
           break;
   }
   \`\`\`

### 常见错误

1. **忘记 break 导致穿透**
   \`\`\`cpp
   switch (x) {
       case 1:
           std::cout << "one";
           // 忘记break！
       case 2:
           std::cout << "two";  // x=1时也会执行
           break;
   }
   \`\`\`

2. **case 值重复**
   \`\`\`cpp
   switch (x) {
       case 1: break;
       case 1: break;  // 错误！重复的case值
   }
   \`\`\`

3. **case 中直接定义变量**
   \`\`\`cpp
   switch (x) {
       case 1:
           int y = 10;  // 错误！可能跳过初始化
           break;
   }
   \`\`\`

4. **使用非常量表达式作为 case 值**
   \`\`\`cpp
   int n = 10;
   switch (x) {
       case n:  // 错误！case必须是常量表达式
           break;
   }
   \`\`\`

### 深入理解

**switch 的实现机制**

编译器可能使用以下方式实现 switch：
- **跳转表**：对于连续的 case 值，使用数组存储跳转地址
- **二分查找**：对于稀疏的 case 值，使用二分查找
- **if-else 链**：对于少量 case，转换为 if-else

**switch 的性能优势**

\`\`\`cpp
// switch 可能被优化为 O(1) 查找
switch (x) {
    case 1: ... break;
    case 2: ... break;
    // ... 100个case
}

// if-else 是 O(n) 顺序判断
if (x == 1) { }
else if (x == 2) { }
// ... 100个条件
\`\`\`

**case 标签的限制**

- 必须是编译时常量表达式
- 必须是整数或枚举类型
- 同一 switch 中不能重复

\`\`\`cpp
// 正确
constexpr int A = 1;
switch (x) {
    case A: break;  // constexpr 是常量表达式
}

// 错误
const int B = 1;
switch (x) {
    case B: break;  // 某些编译器可能不接受
}
\`\`\`

**switch 初始化（C++17）**

\`\`\`cpp
// C++17: switch 中的初始化
switch (int x = getValue(); x) {
    case 1: break;
    case 2: break;
}
// x 的作用域是整个 switch
\`\`\``,
            examples: [
                {
                    title: 'switch基础',
                    code: `#include <iostream>

int main() {
    int choice;
    std::cout << "请选择 (1-4): ";
    std::cin >> choice;
    
    switch (choice) {
        case 1:
            std::cout << "你选择了选项1" << std::endl;
            break;
        case 2:
            std::cout << "你选择了选项2" << std::endl;
            break;
        case 3:
            std::cout << "你选择了选项3" << std::endl;
            break;
        case 4:
            std::cout << "你选择了选项4" << std::endl;
            break;
        default:
            std::cout << "无效的选择" << std::endl;
            break;
    }
    
    return 0;
}`,
                    description: '演示switch语句的基本用法。'
                },
                {
                    title: '利用穿透',
                    code: `#include <iostream>

int main() {
    char grade;
    std::cout << "请输入成绩等级 (A-F): ";
    std::cin >> grade;
    
    switch (grade) {
        case 'A':
        case 'a':
            std::cout << "优秀！90-100分" << std::endl;
            break;
        case 'B':
        case 'b':
            std::cout << "良好！80-89分" << std::endl;
            break;
        case 'C':
        case 'c':
            std::cout << "中等！70-79分" << std::endl;
            break;
        case 'D':
        case 'd':
            std::cout << "及格！60-69分" << std::endl;
            break;
        case 'F':
        case 'f':
            std::cout << "不及格！0-59分" << std::endl;
            break;
        default:
            std::cout << "无效的等级" << std::endl;
            break;
    }
    
    return 0;
}`,
                    description: '演示switch的穿透行为。'
                }
            ],
            handsOn: {
                title: 'switch语句练习',
                description: '使用switch语句实现成绩等级查询。',
                initialCode: `#include <iostream>

int main() {
    char grade = 'B';
    
    // ===== 你的代码 =====
    // 使用switch语句根据grade输出对应的分数范围
    // 'A': 90-100
    // 'B': 80-89
    // 'C': 70-79
    // 'D': 60-69
    // 'F': 0-59
    // 其他: 无效等级
    
    switch (grade) {
        // ===== 你的代码 =====
        // 在这里添加case语句
        case 'A':
            std::cout << "90-100分" << std::endl;
            break;
        case 'B':
            std::cout << "80-89分" << std::endl;
            break;
        case 'C':
            std::cout << "70-79分" << std::endl;
            break;
        case 'D':
            std::cout << "60-69分" << std::endl;
            break;
        case 'F':
            std::cout << "0-59分" << std::endl;
            break;
        default:
            std::cout << "无效等级" << std::endl;
            break;
    }
    
    // 额外练习: 利用穿透简化代码
    // 元音字母 a, e, i, o, u (不区分大小写) 都是元音
    char letter = 'U';
    
    std::cout << letter << " 是元音字母: ";
    
    switch (letter) {
        // ===== 你的代码 =====
        // 利用case穿透，让多个case执行相同的代码
        case 'a':
        case 'e':
        case 'i':
        case 'o':
        case 'u':
        case 'A':
        case 'E':
        case 'I':
        case 'O':
        case 'U':
            std::cout << "是" << std::endl;
            break;
        default:
            std::cout << "否" << std::endl;
            break;
    }
    
    return 0;
}`,
                expectedOutput: '80-89分\nU 是元音字母: 是',
                solutionRegex: 'case.*[A-F]:',
                hint: 'case标签后要加冒号，break语句用于跳出switch',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'switch的表达式可以是什么类型？', options: [{ text: '任意类型' }, { text: '整数或枚举类型', correct: true }, { text: '只能是int' }, { text: '只能是char' }], explanation: 'switch的表达式必须是整数类型或枚举类型。' },
                { type: 'single', question: 'case标签的值必须是什么？', options: [{ text: '变量' }, { text: '常量表达式', correct: true }, { text: '函数调用' }, { text: '任意表达式' }], explanation: 'case标签必须是编译时常量表达式。' },
                { type: 'single', question: '忘记写break会怎样？', options: [{ text: '编译错误' }, { text: '继续执行下一个case', correct: true }, { text: '跳到default' }, { text: '退出switch' }], explanation: '没有break会继续执行下一个case的代码（穿透）。' },
                { type: 'single', question: 'default标签是必须的吗？', options: [{ text: '是' }, { text: '否', correct: true }, { text: '取决于编译器' }, { text: '取决于case数量' }], explanation: 'default标签是可选的，用于处理其他情况。' },
                { type: 'single', question: '如何在case中定义变量？', options: [{ text: '直接定义' }, { text: '使用花括号创建块', correct: true }, { text: '不能定义变量' }, { text: '使用static' }], explanation: '在case中使用花括号创建块来定义变量。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.3.2节' }
            ],
            assistantTips: [
                '不要忘记break语句',
                '利用穿透可以简化多个case的处理',
                '在case中定义变量要使用块'
            ]
        },
        {
            id: '5.4',
            title: '循环语句：while和for',
            duration: '35分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 400,
            concepts: `## 循环语句：while和for

### while 循环

\`\`\`cpp
while (condition) {
    // 循环体
    // condition为真时重复执行
}

// 示例：计算1到100的和
int sum = 0;
int i = 1;
while (i <= 100) {
    sum += i;
    i++;
}
\`\`\`

### for 循环

\`\`\`cpp
for (init; condition; update) {
    // 循环体
}

// 示例：计算1到100的和
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;
}
\`\`\`

### for循环的执行流程

\`\`\`
1. init（初始化）- 只执行一次
2. condition（条件）- 为真继续，为假退出
3. 循环体
4. update（更新）
5. 回到步骤2
\`\`\`

### 范围for循环（C++11）

\`\`\`cpp
std::vector<int> v = {1, 2, 3, 4, 5};

// 只读遍历
for (int x : v) {
    std::cout << x << " ";
}

// 引用遍历（可修改）
for (int& x : v) {
    x *= 2;
}

// 使用auto
for (auto& x : v) {
    std::cout << x << " ";
}
\`\`\`

### do-while 循环

\`\`\`cpp
do {
    // 循环体
} while (condition);  // 注意分号

// 特点：至少执行一次

// 示例：读取输入直到有效
int x;
do {
    std::cout << "请输入正数: ";
    std::cin >> x;
} while (x <= 0);
\`\`\`

### 循环选择指南

| 循环类型 | 适用场景 |
|---------|---------|
| while | 不确定循环次数 |
| for | 确定循环次数 |
| 范围for | 遍历容器 |
| do-while | 至少执行一次 |

### 无限循环

\`\`\`cpp
// while无限循环
while (true) {
    // ...
    if (condition) break;
}

// for无限循环
for (;;) {
    // ...
    if (condition) break;
}
\`\`\`

### 嵌套循环

\`\`\`cpp
// 打印乘法表
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        std::cout << j << "*" << i << "=" << i*j << "\\t";
    }
    std::cout << std::endl;
}
\`\`\`

### 循环中的变量

\`\`\`cpp
// for循环中的变量作用域
for (int i = 0; i < 10; i++) {
    // i在循环内可见
}
// i在这里不可见

// while循环需要在外部声明
int i = 0;
while (i < 10) {
    // ...
    i++;
}
// i在这里仍然可见
\`\`\`

### 最佳实践

1. **选择合适的循环类型**
   \`\`\`cpp
   // 知道循环次数：使用 for
   for (int i = 0; i < n; ++i) { }

   // 不知道循环次数：使用 while
   while (std::cin >> x && x != 0) { }

   // 遍历容器：使用范围 for
   for (int x : container) { }

   // 至少执行一次：使用 do-while
   do { } while (condition);
   \`\`\`

2. **优先使用范围 for 遍历容器**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3, 4, 5};

   // 推荐：简洁、安全
   for (int x : v) {
       std::cout << x << " ";
   }

   // 不推荐：容易出错
   for (size_t i = 0; i < v.size(); ++i) {
       std::cout << v[i] << " ";
   }
   \`\`\`

3. **避免在循环条件中修改循环变量**
   \`\`\`cpp
   // 不推荐
   while (i++ < 10) { }  // 难以理解

   // 推荐
   while (i < 10) {
       ++i;
   }
   \`\`\`

4. **使用有意义的循环变量名**
   \`\`\`cpp
   // 推荐
   for (int row = 0; row < rows; ++row) {
       for (int col = 0; col < cols; ++col) { }
   }

   // 不推荐
   for (int i = 0; i < n; ++i) {
       for (int j = 0; j < m; ++j) { }
   }
   \`\`\`

### 常见错误

1. **差一错误（Off-by-one）**
   \`\`\`cpp
   // 错误：应该是 i < n 而不是 i <= n
   for (int i = 0; i <= n; ++i) {  // 访问了 n+1 个元素
       arr[i] = 0;
   }

   // 正确
   for (int i = 0; i < n; ++i) {
       arr[i] = 0;
   }
   \`\`\`

2. **无限循环**
   \`\`\`cpp
   // 错误：忘记更新循环变量
   int i = 0;
   while (i < 10) {
       std::cout << i;
       // 忘记 i++
   }

   // 错误：浮点数精度问题
   for (double x = 0.0; x != 1.0; x += 0.1) {  // 可能永远不等于 1.0
   }
   \`\`\`

3. **修改正在遍历的容器**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3, 4, 5};

   // 错误：遍历时修改容器
   for (int x : v) {
       if (x == 3) {
           v.push_back(6);  // 危险！可能导致未定义行为
       }
   }
   \`\`\`

4. **范围 for 中的引用错误**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};

   // 错误：需要修改但使用了值拷贝
   for (int x : v) {
       x *= 2;  // 只修改了副本
   }

   // 正确：使用引用
   for (int& x : v) {
       x *= 2;  // 修改原元素
   }
   \`\`\`

### 深入理解

**for 循环的等价形式**

\`\`\`cpp
// for 循环
for (int i = 0; i < 10; ++i) {
    std::cout << i;
}

// 等价的 while 循环
{
    int i = 0;
    while (i < 10) {
        std::cout << i;
        ++i;
    }
}
\`\`\`

**范围 for 的实现原理**

范围 for 循环实际上调用迭代器：
\`\`\`cpp
// 范围 for
for (int x : v) { }

// 等价于
for (auto it = v.begin(); it != v.end(); ++it) {
    int x = *it;
}
\`\`\`

**循环优化**

编译器可能对循环进行优化：
- **循环展开**：减少循环开销
- **向量化**：使用 SIMD 指令
- **循环不变量外提**：将不变计算移出循环

\`\`\`cpp
// 可能被展开
for (int i = 0; i < 4; ++i) {
    arr[i] = i;
}

// 展开后
arr[0] = 0;
arr[1] = 1;
arr[2] = 2;
arr[3] = 3;
\`\`\`

**循环的性能考虑**

- 循环次数少时，循环开销可能比循环体更大
- 嵌套循环的内层优化更重要
- 缓存友好性影响循环性能`,
            examples: [
                {
                    title: 'while循环',
                    code: `#include <iostream>

int main() {
    // 计算1到100的和
    int sum = 0;
    int i = 1;
    
    while (i <= 100) {
        sum += i;
        i++;
    }
    
    std::cout << "1到100的和: " << sum << std::endl;
    
    // 数字反转
    int n = 12345;
    int reversed = 0;
    
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    
    std::cout << "反转后: " << reversed << std::endl;
    
    return 0;
}`,
                    description: '演示while循环的使用。'
                },
                {
                    title: 'for循环',
                    code: `#include <iostream>
#include <vector>

int main() {
    // 基本for循环
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    std::cout << "1到10的和: " << sum << std::endl;
    
    // 范围for循环
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    std::cout << "vector内容: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // 修改元素
    for (int& x : v) {
        x *= 2;
    }
    
    std::cout << "翻倍后: ";
    for (const auto& x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '演示for循环和范围for循环。'
                }
            ],
            handsOn: {
                title: '循环练习',
                description: '使用循环计算阶乘。',
                initialCode: `#include <iostream>

int main() {
    int n = 10;
    
    // TODO: 使用循环计算n的阶乘
    // n! = 1 * 2 * 3 * ... * n
    
    long long factorial = 1;
    
    std::cout << n << "! = " << factorial << std::endl;
    
    return 0;
}`,
                expectedOutput: '10! = 3628800',
                solutionRegex: 'for|while',
                hint: '使用for循环从1乘到n',
                xp: 150
            },
            quiz: [
                { type: 'single', question: 'while和for的主要区别是什么？', options: [{ text: '性能不同' }, { text: '语法结构不同', correct: true }, { text: '功能不同' }, { text: '没有区别' }], explanation: 'while和for功能相同，只是语法结构不同，for更适合已知循环次数的情况。' },
                { type: 'single', question: '范围for循环用于什么？', options: [{ text: '无限循环' }, { text: '遍历容器', correct: true }, { text: '条件循环' }, { text: '递归' }], explanation: '范围for循环（C++11）用于遍历容器中的所有元素。' },
                { type: 'single', question: 'do-while的特点是什么？', options: [{ text: '可能不执行' }, { text: '至少执行一次', correct: true }, { text: '只执行一次' }, { text: '执行两次' }], explanation: 'do-while先执行循环体再检查条件，所以至少执行一次。' },
                { type: 'single', question: 'for (int i = 0; i < 10; i++) 中i的作用域是什么？', options: [{ text: '整个程序' }, { text: '整个函数' }, { text: '循环体内', correct: true }, { text: 'main函数' }], explanation: 'for循环中声明的变量作用域限于循环体内。' },
                { type: 'single', question: '如何创建无限循环？', options: [{ text: 'while (true)', correct: true }, { text: 'while (false)' }, { text: 'for (0)' }, { text: 'for (true)' }], explanation: 'while (true) 或 for (;;) 都可以创建无限循环。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.4节' }
            ],
            assistantTips: [
                '根据场景选择合适的循环类型',
                '范围for循环优先用于遍历容器',
                '注意循环变量的作用域'
            ]
        },
        {
            id: '5.5',
            title: '跳转语句',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 跳转语句

### break 语句

跳出最近的循环或switch：

\`\`\`cpp
// 在循环中使用
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;  // 跳出循环
    }
    std::cout << i << " ";
}
// 输出：0 1 2 3 4

// 在switch中使用
switch (x) {
    case 1:
        // ...
        break;  // 跳出switch
    case 2:
        // ...
        break;
}
\`\`\`

### continue 语句

跳过当前迭代，继续下一次迭代：

\`\`\`cpp
// 输出1到10中的奇数
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue;  // 跳过偶数
    }
    std::cout << i << " ";
}
// 输出：1 3 5 7 9
\`\`\`

### return 语句

从函数返回：

\`\`\`cpp
int add(int a, int b) {
    return a + b;  // 返回结果
}

void printHello() {
    std::cout << "Hello" << std::endl;
    return;  // 可选，void函数
}

// 提前返回
int find(int arr[], int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) {
            return i;  // 找到，提前返回
        }
    }
    return -1;  // 未找到
}
\`\`\`

### goto 语句

跳转到标签（不推荐使用）：

\`\`\`cpp
// 不推荐：使用goto
int i = 0;
start:
std::cout << i << " ";
i++;
if (i < 5) {
    goto start;
}

// 推荐：使用循环
for (int i = 0; i < 5; i++) {
    std::cout << i << " ";
}
\`\`\`

### 嵌套循环中的跳转

\`\`\`cpp
// break只跳出最内层循环
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) {
            break;  // 只跳出内层循环
        }
        std::cout << i << "," << j << " ";
    }
}

// 使用标志变量跳出多层循环
bool found = false;
for (int i = 0; i < 3 && !found; i++) {
    for (int j = 0; j < 3 && !found; j++) {
        if (condition) {
            found = true;
        }
    }
}
\`\`\`

### break vs continue vs return

| 语句 | 作用 |
|------|------|
| break | 跳出循环/switch |
| continue | 跳过当前迭代 |
| return | 从函数返回 |

### 最佳实践

1. **优先使用break和continue**，避免复杂的条件
   \`\`\`cpp
   // 推荐：使用break
   for (int i = 0; i < n; ++i) {
       if (found(arr[i])) {
           break;
       }
   }

   // 不推荐：复杂条件
   int i = 0;
   while (i < n && !found(arr[i])) {
       ++i;
   }
   \`\`\`

2. **避免使用goto**
   \`\`\`cpp
   // 不推荐：使用goto
   for (int i = 0; i < n; ++i) {
       for (int j = 0; j < m; ++j) {
           if (condition) goto exit;
       }
   }
   exit:

   // 推荐：使用标志变量或提取函数
   bool found = false;
   for (int i = 0; i < n && !found; ++i) {
       for (int j = 0; j < m && !found; ++j) {
           if (condition) found = true;
       }
   }
   \`\`\`

3. **使用return提前退出**可以提高可读性
   \`\`\`cpp
   // 推荐：提前返回
   bool process(int x) {
       if (x < 0) return false;
       if (x > 100) return false;
       // 处理正常情况
       return true;
   }

   // 不推荐：深层嵌套
   bool process(int x) {
       if (x >= 0) {
           if (x <= 100) {
               // 处理正常情况
               return true;
           }
       }
       return false;
   }
   \`\`\`

4. **嵌套循环考虑提取函数**
   \`\`\`cpp
   // 推荐：提取函数
   for (int i = 0; i < rows; ++i) {
       processRow(matrix[i]);
   }

   // 不推荐：嵌套过深
   for (int i = 0; i < rows; ++i) {
       for (int j = 0; j < cols; ++j) {
           // 复杂的处理
       }
   }
   \`\`\`

### 常见错误

1. **break/continue 使用位置错误**
   \`\`\`cpp
   // 错误：在if语句中使用break
   if (x > 0) {
       break;  // 错误！不在循环中
   }

   // 正确：在循环中使用
   while (true) {
       if (x > 0) {
           break;  // 正确
       }
   }
   \`\`\`

2. **误解 break 的作用范围**
   \`\`\`cpp
   // break 只跳出最内层循环
   for (int i = 0; i < 3; ++i) {
       for (int j = 0; j < 3; ++j) {
           if (j == 1) break;  // 只跳出内层循环
       }
       // i 循环继续
   }
   \`\`\`

3. **滥用 continue 导致逻辑错误**
   \`\`\`cpp
   // 错误：continue 跳过了必要的更新
   for (int i = 0; i < n; ++i) {
       if (skip(arr[i])) {
           continue;
       }
       process(arr[i]);
       ++i;  // 这行不会执行！导致死循环
   }
   \`\`\`

4. **goto 跳过变量初始化**
   \`\`\`cpp
   // 错误：跳过初始化
   goto label;
   int x = 10;  // 跳过初始化
   label:
   std::cout << x;  // x 未初始化
   \`\`\`

### 深入理解

**跳转语句的控制流**

- **break**：立即跳出最近的循环或 switch
- **continue**：跳到循环体末尾，继续下一次迭代
- **return**：立即从函数返回
- **goto**：无条件跳转到标签

**break 与异常的区别**

\`\`\`cpp
// break：正常的控制流
for (int i = 0; i < n; ++i) {
     if (error(arr[i])) {
         break;  // 正常退出循环
     }
}

// 异常：异常情况的处理
for (int i = 0; i < n; ++i) {
     if (criticalError(arr[i])) {
         throw std::runtime_error("Critical error");
     }
}
\`\`\`

**多层跳出的实现方式**

1. **标志变量**
   \`\`\`cpp
   bool found = false;
   for (int i = 0; i < n && !found; ++i) {
       for (int j = 0; j < m && !found; ++j) {
           if (condition) found = true;
       }
   }
   \`\`\`

2. **函数返回**
   \`\`\`cpp
   bool search() {
       for (int i = 0; i < n; ++i) {
           for (int j = 0; j < m; ++j) {
               if (condition) return true;
           }
       }
       return false;
   }
   \`\`\`

3. **异常（不推荐用于正常控制流）**
   \`\`\`cpp
   try {
       for (int i = 0; i < n; ++i) {
           for (int j = 0; j < m; ++j) {
               if (condition) throw FoundException();
           }
       }
   } catch (FoundException&) { }
   \`\`\`

**goto 的合理使用场景**

虽然通常应该避免 goto，但在某些情况下它是有用的：
- 资源清理（C 风格代码）
- 错误处理（替代嵌套 if）
- 性能关键代码

\`\`\`cpp
// 资源清理示例
void process() {
     char* buffer1 = malloc(1024);
     if (!buffer1) goto cleanup;

     char* buffer2 = malloc(1024);
     if (!buffer2) goto cleanup1;

     // 处理...

     free(buffer2);
cleanup1:
     free(buffer1);
cleanup:
     return;
}
\`\`\``,
            examples: [
                {
                    title: 'break和continue',
                    code: `#include <iostream>

int main() {
    // break示例：找到第一个能被7整除的数
    std::cout << "第一个能被7整除的数: ";
    for (int i = 1; i <= 100; i++) {
        if (i % 7 == 0) {
            std::cout << i << std::endl;
            break;
        }
    }
    
    // continue示例：输出不能被3整除的数
    std::cout << "\\n1-20中不能被3整除的数: ";
    for (int i = 1; i <= 20; i++) {
        if (i % 3 == 0) {
            continue;
        }
        std::cout << i << " ";
    }
    std::cout << std::endl;
    
    // 提前返回示例
    auto findFirstNegative = [](int arr[], int size) -> int {
        for (int i = 0; i < size; i++) {
            if (arr[i] < 0) {
                return i;
            }
        }
        return -1;
    };
    
    int arr[] = {1, 2, -3, 4, -5};
    int index = findFirstNegative(arr, 5);
    std::cout << "\\n第一个负数的索引: " << index << std::endl;
    
    return 0;
}`,
                    description: '演示break、continue和return的使用。'
                }
            ],
            handsOn: {
                title: '跳转语句练习',
                description: '使用break和continue实现特定逻辑。',
                initialCode: `#include <iostream>

int main() {
    // ===== 你的代码 =====
    // 1. 使用break: 找出第一个能被7整除的正整数
    int firstMultiple = 0;
    for (int i = 1; i <= 100; i++) {
        if (i % 7 == 0) {
            firstMultiple = i;
            break;  // 找到后跳出循环
        }
    }
    std::cout << "1-100中第一个能被7整除的数: " << firstMultiple << std::endl;
    
    // 2. 使用continue: 输出1-20中不能被3整除的数
    std::cout << "1-20中不能被3整除的数: ";
    for (int i = 1; i <= 20; i++) {
        // ===== 你的代码 =====
        // 如果i能被3整除，使用continue跳过
        if (i % 3 == 0) {
            continue;
        }
        std::cout << i << " ";
    }
    std::cout << std::endl;
    
    // 3. 找出第一个大于100的质数
    std::cout << "第一个大于100的质数: ";
    for (int i = 101;; i++) {
        bool isPrime = true;
        for (int j = 2; j * j <= i; j++) {
            if (i % j == 0) {
                isPrime = false;
                break;  // 不是质数，跳出内层循环
            }
        }
        if (isPrime) {
            std::cout << i << std::endl;
            break;  // 找到后跳出外层循环
        }
    }
    
    return 0;
}`,
                expectedOutput: '1-100中第一个能被7整除的数: 7\n1-20中不能被3整除的数: 1 2 4 5 7 8 10 11 13 14 16 17 19 20\n第一个大于100的质数: 101',
                solutionRegex: 'break|continue',
                hint: 'break跳出循环，continue跳过当前迭代',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'break语句的作用是什么？', options: [{ text: '跳过当前迭代' }, { text: '跳出循环或switch', correct: true }, { text: '从函数返回' }, { text: '跳转到标签' }], explanation: 'break语句用于跳出最近的循环或switch语句。' },
                { type: 'single', question: 'continue语句的作用是什么？', options: [{ text: '跳出循环' }, { text: '跳过当前迭代，继续下一次', correct: true }, { text: '从函数返回' }, { text: '结束程序' }], explanation: 'continue跳过当前迭代的剩余代码，继续下一次迭代。' },
                { type: 'single', question: '嵌套循环中的break跳出哪层？', options: [{ text: '所有循环' }, { text: '最外层循环' }, { text: '最内层循环', correct: true }, { text: '取决于条件' }], explanation: 'break只跳出最内层的循环。' },
                { type: 'single', question: '为什么应该避免使用goto？', options: [{ text: '语法错误' }, { text: '使代码难以理解和维护', correct: true }, { text: '性能差' }, { text: '编译器不支持' }], explanation: 'goto会破坏程序结构，使代码难以理解和维护。' },
                { type: 'single', question: 'void函数可以使用return吗？', options: [{ text: '不可以' }, { text: '可以，但不能有返回值', correct: true }, { text: '只能返回0' }, { text: '必须返回' }], explanation: 'void函数可以使用return;提前返回，但不能返回值。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.5节' }
            ],
            assistantTips: [
                'break跳出循环，continue跳过当前迭代',
                '避免使用goto',
                '嵌套循环考虑提取函数'
            ]
        },
        {
            id: '5.6',
            title: '异常处理基础',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 异常处理基础

### 什么是异常？

异常是程序运行时发生的**错误或意外情况**，需要特殊处理。

### try-catch 块

\`\`\`cpp
try {
    // 可能抛出异常的代码
} catch (exception_type e) {
    // 异常处理代码
}

// 示例
try {
    int result = divide(10, 0);
} catch (const std::runtime_error& e) {
    std::cout << "错误: " << e.what() << std::endl;
}
\`\`\`

### throw 语句

抛出异常：

\`\`\`cpp
double divide(double a, double b) {
    if (b == 0) {
        throw std::runtime_error("除数不能为0");
    }
    return a / b;
}
\`\`\`

### 标准异常类

\`\`\`cpp
#include <stdexcept>

// 常用异常类
std::exception          // 所有异常的基类
std::runtime_error      // 运行时错误
std::logic_error        // 逻辑错误
std::out_of_range       // 超出范围
std::invalid_argument   // 无效参数
std::length_error       // 长度错误
\`\`\`

### 多个catch块

\`\`\`cpp
try {
    // 可能抛出多种异常的代码
} catch (const std::out_of_range& e) {
    std::cout << "范围错误: " << e.what() << std::endl;
} catch (const std::invalid_argument& e) {
    std::cout << "参数错误: " << e.what() << std::endl;
} catch (const std::exception& e) {
    std::cout << "其他错误: " << e.what() << std::endl;
}
\`\`\`

### 异常的传播

\`\`\`cpp
void funcA() {
    throw std::runtime_error("错误");
}

void funcB() {
    funcA();  // 异常传播到这里
}

void funcC() {
    try {
        funcB();  // 异常传播到这里被捕获
    } catch (const std::exception& e) {
        std::cout << e.what() << std::endl;
    }
}
\`\`\`

### 异常安全

\`\`\`cpp
// 不安全：可能内存泄漏
void unsafe() {
    int* p = new int(10);
    func();  // 如果抛出异常，p不会被释放
    delete p;
}

// 安全：使用智能指针
void safe() {
    auto p = std::make_unique<int>(10);
    func();  // 即使抛出异常，p也会被自动释放
}
\`\`\`

### noexcept 说明符

\`\`\`cpp
// 声明函数不会抛出异常
void safeFunction() noexcept {
    // ...
}

// 条件noexcept
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
\`\`\`

### 最佳实践

1. **只在真正异常的情况下使用异常**
   \`\`\`cpp
   // 推荐：异常情况使用异常
   int getElement(int index) {
       if (index < 0 || index >= size) {
           throw std::out_of_range("索引越界");
       }
       return data[index];
   }

   // 不推荐：正常情况使用异常
   int find(int value) {
       for (int i = 0; i < size; ++i) {
           if (data[i] == value) return i;
       }
       throw std::runtime_error("未找到");  // 不推荐：未找到是正常情况
   }
   \`\`\`

2. **使用标准异常类**
   \`\`\`cpp
   // 推荐：使用标准异常
   throw std::invalid_argument("参数无效");
   throw std::out_of_range("索引越界");
   throw std::runtime_error("运行时错误");

   // 不推荐：抛出内置类型
   throw -1;  // 不推荐
   throw "错误";  // 不推荐
   \`\`\`

3. **确保异常安全**
   \`\`\`cpp
   // 推荐：使用 RAII
   void process() {
       auto file = std::make_unique<File>("data.txt");
       // 即使抛出异常，文件也会自动关闭
   }

   // 不推荐：手动管理资源
   void process() {
       FILE* f = fopen("data.txt", "r");
       // 如果这里抛出异常，文件不会关闭
       fclose(f);
   }
   \`\`\`

4. **避免在析构函数中抛出异常**
   \`\`\`cpp
   class Resource {
   public:
       ~Resource() noexcept {
           try {
               cleanup();  // 如果可能抛出异常，在内部捕获
           } catch (...) {
               // 吞掉异常，不要传播
           }
       }
   };
   \`\`\`

### 常见错误

1. **捕获异常时使用值而非引用**
   \`\`\`cpp
   // 不推荐：值捕获会导致对象切片
   catch (std::exception e) { }

   // 推荐：使用 const 引用
   catch (const std::exception& e) { }
   \`\`\`

2. **catch 块顺序错误**
   \`\`\`cpp
   // 错误：基类在前，派生类永远不会被捕获
   catch (const std::exception& e) { }
   catch (const std::runtime_error& e) { }  // 永远不会执行

   // 正确：派生类在前
   catch (const std::runtime_error& e) { }
   catch (const std::exception& e) { }
   \`\`\`

3. **空 catch 块**
   \`\`\`cpp
   // 不推荐：吞掉所有异常
   try {
       doSomething();
   } catch (...) {
       // 什么都不做，隐藏了错误
   }

   // 推荐：至少记录日志
   try {
       doSomething();
   } catch (const std::exception& e) {
       std::cerr << "错误: " << e.what() << std::endl;
   }
   \`\`\`

4. **异常安全级别不足**
   \`\`\`cpp
   // 不安全：可能泄漏资源
   void process() {
       int* p = new int[100];
       mightThrow();  // 如果抛出异常，内存泄漏
       delete[] p;
   }

   // 安全：使用智能指针
   void process() {
       auto p = std::make_unique<int[]>(100);
       mightThrow();  // 即使抛出异常，也会自动释放
   }
   \`\`\`

### 深入理解

**异常的传播机制**

当异常被抛出时：
1. 搜索最近的 try 块
2. 检查匹配的 catch 块
3. 如果没有匹配，继续搜索外层 try 块
4. 如果最终没有找到匹配的 catch，调用 std::terminate

**栈展开（Stack Unwinding）**

异常传播时会进行栈展开：
- 销毁局部对象（调用析构函数）
- 释放栈内存
- 确保资源正确清理

\`\`\`cpp
void func() {
     Resource r1;  // 析构函数会被调用
     Resource r2;  // 析构函数会被调用
     throw std::runtime_error("错误");
     // r2 和 r1 的析构函数被调用
}
\`\`\`

**异常安全级别**

1. **无异常安全**：可能泄漏资源
2. **基本保证**：对象处于有效状态，无泄漏
3. **强保证**：操作要么成功，要么回滚
4. **不抛出保证**：保证不抛出异常

\`\`\`cpp
// 强保证示例
void process(std::vector<int>& v) {
     std::vector<int> temp = v;  // 复制
     modify(temp);               // 修改副本
     v.swap(temp);               // 原子交换
     // 如果 modify 抛出异常，v 不变
}
\`\`\`

**异常与性能**

- 无异常时：几乎无开销
- 抛出异常时：开销较大（栈展开）
- 建议：异常用于异常情况，不用于正常控制流

**noexcept 的意义**

\`\`\`cpp
void safeFunction() noexcept {
     // 编译器可以优化，不需要异常处理代码
}

void unsafeFunction() {
     // 编译器需要生成异常处理代码
}
\`\`\``,
            examples: [
                {
                    title: '异常处理基础',
                    code: `#include <iostream>
#include <stdexcept>
#include <vector>

double divide(double a, double b) {
    if (b == 0) {
        throw std::runtime_error("除数不能为0");
    }
    return a / b;
}

int main() {
    try {
        double result = divide(10, 0);
        std::cout << "结果: " << result << std::endl;
    } catch (const std::runtime_error& e) {
        std::cout << "运行时错误: " << e.what() << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    // vector越界异常
    std::vector<int> v = {1, 2, 3};
    
    try {
        int x = v.at(10);  // at()会检查边界
    } catch (const std::out_of_range& e) {
        std::cout << "越界错误: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '演示异常处理的基本用法。'
                },
                {
                    title: '自定义异常',
                    code: `#include <iostream>
#include <stdexcept>
#include <string>

// 自定义异常类
class MyException : public std::exception {
private:
    std::string message;
    
public:
    MyException(const std::string& msg) : message(msg) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
};

void validateAge(int age) {
    if (age < 0) {
        throw MyException("年龄不能为负数");
    }
    if (age > 150) {
        throw MyException("年龄不合理");
    }
    std::cout << "年龄有效: " << age << std::endl;
}

int main() {
    try {
        validateAge(-5);
    } catch (const MyException& e) {
        std::cout << "自定义异常: " << e.what() << std::endl;
    } catch (const std::exception& e) {
        std::cout << "标准异常: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '演示自定义异常类。'
                }
            ],
            handsOn: {
                title: '异常处理练习',
                description: '使用try-catch处理除零错误。',
                initialCode: `#include <iostream>
#include <stdexcept>

// ===== 你的代码 =====
// 编写一个divide函数，当除数为0时抛出异常
double divide(double a, double b) {
    if (b == 0) {
        throw std::runtime_error("除数不能为0");
    }
    return a / b;
}

int main() {
    double result;
    
    // 测试正常的除法
    try {
        result = divide(10, 3);
        std::cout << "10 / 3 = " << result << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    // ===== 你的代码 =====
    // 测试除零情况
    try {
        // 调用divide函数，尝试 5 / 0
        result = divide(5, 0);
        std::cout << "5 / 0 = " << result << std::endl;
    }
    // ===== 你的代码 =====
    // 捕获异常并输出错误信息
    catch (const std::exception& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
    }
    
    // 额外练习: 处理多种异常
    std::cout << "\\n测试多次除法:" << std::endl;
    double pairs[][2] = {{10, 3}, {8, 2}, {5, 0}, {9, 3}};
    
    for (int i = 0; i < 4; i++) {
        try {
            double r = divide(pairs[i][0], pairs[i][1]);
            std::cout << pairs[i][0] << " / " << pairs[i][1] << " = " << r << std::endl;
        }
        // ===== 你的代码 =====
        // 捕获异常
        catch (const std::exception& e) {
            std::cout << pairs[i][0] << " / " << pairs[i][1] << " -> 错误: " << e.what() << std::endl;
        }
    }
    
    return 0;
}`,
                expectedOutput: '10 / 3 = 3.33333\n捕获异常: 除数不能为0\n\n测试多次除法:\n10 / 3 = 3.33333\n8 / 2 = 4\n5 / 0 -> 错误: 除数不能为0\n9 / 3 = 3',
                solutionRegex: 'throw.*runtime_error|catch.*exception',
                hint: 'throw抛出异常，catch捕获异常，e.what()获取异常信息',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'try块的作用是什么？', options: [{ text: '定义函数' }, { text: '包含可能抛出异常的代码', correct: true }, { text: '抛出异常' }, { text: '忽略异常' }], explanation: 'try块包含可能抛出异常的代码，用于检测异常。' },
                { type: 'single', question: 'throw语句的作用是什么？', options: [{ text: '捕获异常' }, { text: '抛出异常', correct: true }, { text: '忽略异常' }, { text: '处理异常' }], explanation: 'throw语句用于抛出异常。' },
                { type: 'single', question: 'catch块的参数类型应该是什么？', options: [{ text: '只能是int' }, { text: '只能是string' }, { text: '异常类型或其引用', correct: true }, { text: '任意类型' }], explanation: 'catch块的参数应该是要捕获的异常类型，通常使用const引用。' },
                { type: 'single', question: 'std::exception是什么？', options: [{ text: '一个函数' }, { text: '所有标准异常的基类', correct: true }, { text: '一个变量' }, { text: '一个宏' }], explanation: 'std::exception是所有标准异常类的基类。' },
                { type: 'single', question: 'noexcept表示什么？', options: [{ text: '函数会抛出异常' }, { text: '函数不会抛出异常', correct: true }, { text: '函数会捕获异常' }, { text: '函数会忽略异常' }], explanation: 'noexcept说明符表示函数不会抛出异常。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第5.6节' }
            ],
            assistantTips: [
                '只在真正异常的情况下使用异常',
                '使用标准异常类或继承它们',
                '确保异常安全，优先使用智能指针'
            ]
        }
    ]
};
