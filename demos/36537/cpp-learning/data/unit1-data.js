/**
 * 第1章：环境、编译与第一个程序
 * 完整的学习内容
 */

var Unit1Data = {
    id: 1,
    title: '环境、编译与第一个程序',
    description: '从零开始，了解C++的历史、开发环境和第一个程序',
    lessons: [
        {
            id: '1.1',
            title: 'C++ 简史与标准演化',
            duration: '25分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## C++ 简史与标准演化

### C++ 的起源

C++ 是一种通用的高级编程语言，由 **Bjarne Stroustrup** 于1979年在贝尔实验室开始设计和实现。

#### 发展历程

- **1979年**：Stroustrup 开始开发 "C with Classes"（带类的C）
- **1983年**：正式命名为 C++（++是C的递增运算符）
- **1985年**：发布第一版《The C++ Programming Language》
- **1998年**：ISO C++98 标准发布（第一个国际标准）
- **2003年**：C++03 发布（主要是bug修复）
- **2011年**：C++11 发布（现代C++的开端，革命性更新）
- **2014年**：C++14 发布（完善C++11）
- **2017年**：C++17 发布（实用特性大增）
- **2020年**：C++20 发布（概念、协程、模块等重大更新）
- **2023年**：C++23 发布（持续改进）

### C++ 的设计哲学

C++ 的核心设计原则是 **"零开销抽象"（Zero-overhead abstraction）**：

> 你不需要为你没有使用的特性付出代价。

这意味着：
1. C++ 提供高级抽象，但不会引入额外的运行时开销
2. 程序员可以精确控制程序的每一个细节
3. 信任程序员，不强制进行运行时检查

### C++ 标准版本检测

使用 \`__cplusplus\` 宏可以检测编译器支持的 C++ 标准版本：

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "C++ 标准版本: " << __cplusplus << std::endl;
    
    // 常见值：
    // 199711 - C++98/03
    // 201103 - C++11
    // 201402 - C++14
    // 201703 - C++17
    // 202002 - C++20
    
    return 0;
}
\`\`\`

### C++11 的重大变革

C++11 是现代C++的开端，引入了许多重要特性：

| 特性 | 说明 |
|------|------|
| auto | 自动类型推导 |
| 范围for | 简化容器遍历 |
| 智能指针 | shared_ptr, unique_ptr, weak_ptr |
| lambda表达式 | 匿名函数 |
| 右值引用 | 移动语义 |
| constexpr | 编译时计算 |
| nullptr | 空指针常量 |
| 初始化列表 | 统一初始化语法 |

### 最佳实践

1. **选择合适的标准版本**
   - 新项目建议使用 C++17 或 C++20
   - 需要跨平台兼容时，考虑最低支持 C++14
   - 避免使用已废弃的特性

2. **关注现代 C++ 特性**
   - 优先使用智能指针管理内存
   - 使用 auto 简化类型声明
   - 使用范围 for 循环遍历容器
   - 使用 constexpr 进行编译时计算

3. **代码风格一致性**
   - 在整个项目中保持一致的标准版本
   - 使用编译器标志明确指定标准版本（如 -std=c++17）
   - 团队协作时统一编码规范

### 常见错误

1. **标准版本混用**
   \`\`\`cpp
   // 错误：在旧标准代码中使用新特性
   // 如果编译器设置为 C++98，以下代码会报错
   auto x = 10;  // C++11 特性
   \`\`\`

2. **忽略编译器警告**
   \`\`\`cpp
   // 不同标准可能有不同的行为
   int arr[5];
   for (auto i : arr) { }  // C++11 范围 for
   \`\`\`

3. **使用已废弃的特性**
   \`\`\`cpp
   // C++11 后 auto_ptr 已废弃
   std::auto_ptr<int> p(new int(10));  // 应使用 unique_ptr
   \`\`\`

### 深入理解

**C++ 标准的演进策略**

C++ 标准委员会采用"每三年发布一个新标准"的策略，这确保了语言的持续发展：

- **稳定性优先**：新标准尽量保持向后兼容
- **渐进式改进**：每个版本都在前一个版本基础上完善
- **社区驱动**：特性提案来自实际开发需求

**零开销抽象的实现原理**

C++ 的零开销抽象通过以下方式实现：
1. **编译时计算**：模板、constexpr 等特性在编译时完成工作
2. **内联优化**：编译器可以内联小函数，消除调用开销
3. **静态类型**：类型信息在编译时确定，避免运行时类型检查

**编译器对标准的支持程度**

不同编译器对新标准的支持程度不同：
- GCC/Clang 通常较快支持新特性
- MSVC 在 Windows 平台上有独特优化
- 建议查阅编译器文档了解具体支持情况`,

            examples: [
                {
                    title: '检测C++标准版本',
                    code: `#include <iostream>

int main() {
    std::cout << "__cplusplus = " << __cplusplus << std::endl;
    
    #if __cplusplus >= 202002L
        std::cout << "支持 C++20" << std::endl;
    #elif __cplusplus >= 201703L
        std::cout << "支持 C++17" << std::endl;
    #elif __cplusplus >= 201402L
        std::cout << "支持 C++14" << std::endl;
    #elif __cplusplus >= 201103L
        std::cout << "支持 C++11" << std::endl;
    #else
        std::cout << "C++98/03" << std::endl;
    #endif
    
    return 0;
}`,
                    description: '使用预处理器检测编译器支持的C++标准版本。'
                }
            ],
            handsOn: {
                title: '检测C++标准版本',
                description: '## 任务目标\n编写一个程序，使用 `__cplusplus` 宏检测当前编译器支持的 C++ 标准版本，并根据检测结果输出对应的标准名称。\n\n## 操作步骤\n1. 使用 `std::cout` 输出 `__cplusplus` 宏的值\n2. 使用预处理指令 `#if`、`#elif`、`#else` 检测不同的版本值\n3. 根据检测结果输出对应的 C++ 标准名称\n\n## 预期成果\n程序应输出两行内容：\n- 第一行：`C++ 标准版本: ` + 版本数值（如 `202002`）\n- 第二行：`支持 C++` + 标准版本号（如 `C++20`）\n\n## 代码框架\n```cpp\n#include <iostream>\n\nint main() {\n    // 步骤1: 输出 __cplusplus 宏的值\n    // 提示: 使用 std::cout << \"C++ 标准版本: \" << __cplusplus << std::endl;\n    \n    // 步骤2: 使用预处理指令检测版本\n    // 199711L = C++98/03\n    // 201103L = C++11\n    // 201402L = C++14\n    // 201703L = C++17\n    // 202002L = C++20\n    \n    // 根据版本输出对应的标准名称\n    // 提示: 使用 #if __cplusplus >= 202002L\n    //           std::cout << \"支持 C++20\" << std::endl;\n    //       #elif ...\n    //       #endif\n    \n    return 0;\n}\n```',
                initialCode: `#include <iostream>

int main() {
    // ===== 步骤1: 输出 __cplusplus 宏的值 =====
    // 预期输出格式: "C++ 标准版本: 202002"
    std::cout << "C++ 标准版本: " << __cplusplus << std::endl;
    
    // ===== 步骤2: 根据版本值输出对应的标准名称 =====
    // 199711L = C++98/03
    // 201103L = C++11
    // 201402L = C++14
    // 201703L = C++17
    // 202002L = C++20
    
    // 使用 #if #elif #else 检测版本并输出
    #if __cplusplus >= 202002L
        std::cout << "支持 C++20" << std::endl;
    #elif __cplusplus >= 201703L
        std::cout << "支持 C++17" << std::endl;
    #elif __cplusplus >= 201402L
        std::cout << "支持 C++14" << std::endl;
    #elif __cplusplus >= 201103L
        std::cout << "支持 C++11" << std::endl;
    #else
        std::cout << "支持 C++98/03" << std::endl;
    #endif
    
    return 0;
}`,
                expectedOutput: 'C++ 标准版本: 202002\\n支持 C++20 或 C++17 或 C++14 或 C++11 或 C++98/03',
                solutionRegex: '__cplusplus|#if __cplusplus|#elif __cplusplus',
                hint: '预处理指令 #if 和 #elif 在编译时根据条件选择代码分支',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'C++ 最初被称为什么？', options: [{ text: 'C with Classes', correct: true }, { text: 'C++ with Objects' }, { text: 'Object C' }, { text: 'C#' }], explanation: 'C++最初被称为"C with Classes"，于1983年正式命名为C++。' },
                { type: 'single', question: '哪个标准标志着现代C++的开端？', options: [{ text: 'C++98' }, { text: 'C++11', correct: true }, { text: 'C++17' }, { text: 'C++20' }], explanation: 'C++11引入了auto、智能指针、lambda表达式等现代特性，是现代C++的开端。' },
                { type: 'single', question: 'C++的设计哲学"零开销抽象"是什么意思？', options: [{ text: '所有特性都是免费的' }, { text: '你只为你使用的特性付费', correct: true }, { text: '不需要任何开销' }, { text: '抽象没有成本' }], explanation: '零开销抽象意味着你不需要为你没有使用的特性付出代价。' },
                { type: 'single', question: '__cplusplus 宏用于检测什么？', options: [{ text: '编译器版本' }, { text: 'C++标准版本', correct: true }, { text: '操作系统' }, { text: 'CPU架构' }], explanation: '__cplusplus宏的值代表当前编译器支持的C++标准版本。' },
                { type: 'single', question: 'C++11引入了哪种智能指针？', options: [{ text: 'auto_ptr' }, { text: 'unique_ptr', correct: true }, { text: 'scoped_ptr' }, { text: 'smart_ptr' }], explanation: 'C++11引入了std::unique_ptr、std::shared_ptr和std::weak_ptr三种智能指针。' }
            ],
            references: [
                { title: 'C++ 标准文档', url: 'https://isocpp.org/' },
                { title: 'C++ Primer 第五版', book: '第1章' }
            ],
            assistantTips: [
                'C++98和C++03可以视为同一代标准',
                '现代C++通常指C++11及以后的版本',
                '建议使用最新稳定的标准（目前是C++20）'
            ]
        },
        {
            id: '1.2',
            title: '编译过程：预处理、编译、汇编、链接',
            duration: '35分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 编译过程

C++程序从源代码到可执行文件需要经过四个主要阶段：

\`\`\`
源代码(.cpp) → 预处理 → 编译 → 汇编 → 链接 → 可执行文件(.exe)
\`\`\`

### 1. 预处理（Preprocessing）

预处理阶段处理所有以 \`#\` 开头的预处理指令：

- \`#include\`：文件包含，将头文件内容插入到当前位置
- \`#define\`：宏定义，文本替换
- \`#ifdef\`、\`#ifndef\`、\`#endif\`：条件编译
- \`#pragma\`：编译器指令

\`\`\`cpp
#include <iostream>  // 将iostream头文件内容插入
#define PI 3.14159   // 定义宏

int main() {
    std::cout << PI << std::endl;  // PI会被替换为3.14159
    return 0;
}
\`\`\`

### 2. 编译（Compilation）

编译阶段将预处理后的源代码转换为汇编代码：

- 词法分析：将源代码分解为标记（token）
- 语法分析：构建语法树
- 语义分析：检查语义正确性
- 生成汇编代码

### 3. 汇编（Assembly）

汇编阶段将汇编代码转换为目标文件（机器码）：

- Windows: \`.obj\` 文件
- Linux/macOS: \`.o\` 文件

目标文件包含：
- 机器指令
- 数据
- 符号表（函数和变量的地址信息）

### 4. 链接（Linking）

链接阶段将多个目标文件和库文件合并为可执行文件：

- 解析外部符号引用
- 合并代码段和数据段
- 生成最终的可执行文件

### GCC/G++ 编译选项

\`\`\`bash
# 只预处理
g++ -E main.cpp -o main.i

# 只编译（到汇编）
g++ -S main.cpp -o main.s

# 只汇编（到目标文件）
g++ -c main.cpp -o main.o

# 完整编译
g++ main.cpp -o main

# 查看所有步骤
g++ -v main.cpp -o main
\`\`\`

### 最佳实践

1. **理解编译过程有助于调试**
   - 预处理错误：检查 #include 和 #define
   - 编译错误：检查语法和类型
   - 链接错误：检查库文件和符号定义

2. **使用合适的编译选项**
   - \`-Wall -Wextra\`：启用更多警告
   - \`-g\`：生成调试信息
   - \`-O2\` 或 \`-O3\`：优化级别
   - \`-std=c++17\`：指定标准版本

3. **管理头文件**
   - 使用 #include guards 或 #pragma once
   - 避免循环依赖
   - 在头文件中只声明，在源文件中定义

### 常见错误

1. **链接错误：未定义的引用**
   \`\`\`cpp
   // 声明了但未定义
   void func();  // 声明
   
   int main() {
       func();  // 链接错误：undefined reference
   }
   \`\`\`

2. **头文件重复包含**
   \`\`\`cpp
   // file1.h
   int x = 10;  // 错误：多次包含会导致重复定义
   
   // 正确做法
   #ifndef FILE1_H
   #define FILE1_H
   int x = 10;
   #endif
   \`\`\`

3. **预处理陷阱**
   \`\`\`cpp
   #define MAX 10
   int arr[MAX + 5];  // 正确
   
   #define SQUARE(x) x * x
   int y = SQUARE(1 + 2);  // 错误：展开为 1 + 2 * 1 + 2 = 5
   // 应使用：#define SQUARE(x) ((x) * (x))
   \`\`\`

### 深入理解

**预处理器的工作原理**

预处理器是一个文本替换工具：
- 它不理解 C++ 语法
- 只是简单的文本替换
- 宏定义可能导致意外的行为

**编译器的优化过程**

现代编译器会进行多种优化：
1. **常量折叠**：编译时计算常量表达式
2. **死代码消除**：删除不会执行的代码
3. **内联展开**：将小函数内联到调用处
4. **循环优化**：展开、向量化等

**链接器的工作机制**

链接器的主要任务：
1. **符号解析**：找到每个符号的定义
2. **重定位**：计算最终地址
3. **合并段**：将各目标文件的段合并

静态链接 vs 动态链接：
- 静态链接：库代码嵌入可执行文件
- 动态链接：运行时加载共享库`,

            examples: [
                {
                    title: '查看编译过程',
                    code: `// main.cpp
#include <iostream>

#define MESSAGE "Hello, World!"

int main() {
    std::cout << MESSAGE << std::endl;
    return 0;
}

/*
 * 编译命令：
 * g++ -E main.cpp -o main.i    // 预处理
 * g++ -S main.cpp -o main.s    // 编译到汇编
 * g++ -c main.cpp -o main.o    // 编译到目标文件
 * g++ main.cpp -o main         // 完整编译
 */`,
                    description: '演示如何使用g++的不同选项查看编译的各个阶段。'
                }
            ],
            handsOn: {
                title: '宏定义与预处理',
                description: '使用#define定义宏并观察宏的替换效果。',
                initialCode: `#include <iostream>

// TODO: 定义一个计算圆面积的宏 CIRCLE_AREA(r)
// 面积 = π * r * r，使用3.14159作为π的值

// TODO: 定义一个判断两个数最大值的宏 MAX(a, b)
// 提示：使用三元运算符 (a > b) ? a : b

int main() {
    // 使用宏计算半径为5的圆面积
    // ===== 你的代码 =====
    // 取消下面的注释并完成宏定义
    // std::cout << "圆面积: " << CIRCLE_AREA(5) << std::endl;
    
    // 使用宏比较两个数
    // ===== 你的代码 =====
    // 取消下面的注释并完成宏定义
    // std::cout << "最大值: " << MAX(10, 20) << std::endl;
    
    return 0;
}`,
                expectedOutput: '圆面积: 78.53975\\n最大值: 20',
                solutionRegex: '#define CIRCLE_AREA|#define MAX',
                hint: '宏只是文本替换，注意给参数加括号避免优先级问题',
                xp: 120
            },
            quiz: [
                { type: 'single', question: '编译过程的第一个阶段是什么？', options: [{ text: '编译' }, { text: '汇编' }, { text: '预处理', correct: true }, { text: '链接' }], explanation: '预处理是编译过程的第一个阶段，处理#include、#define等指令。' },
                { type: 'single', question: '#include指令在哪个阶段处理？', options: [{ text: '编译阶段' }, { text: '预处理阶段', correct: true }, { text: '汇编阶段' }, { text: '链接阶段' }], explanation: '#include是预处理指令，在预处理阶段处理。' },
                { type: 'single', question: '目标文件的扩展名是什么？', options: [{ text: '.cpp' }, { text: '.obj或.o', correct: true }, { text: '.exe' }, { text: '.dll' }], explanation: '目标文件在Windows上是.obj，在Linux/macOS上是.o。' },
                { type: 'single', question: '哪个阶段解决符号引用？', options: [{ text: '编译' }, { text: '汇编' }, { text: '链接', correct: true }, { text: '预处理' }], explanation: '链接阶段负责解析和解决外部符号引用。' },
                { type: 'single', question: 'g++ -E 选项的作用是什么？', options: [{ text: '仅编译' }, { text: '仅汇编' }, { text: '仅预处理', correct: true }, { text: '生成可执行文件' }], explanation: '-E选项告诉编译器只进行预处理阶段。' }
            ],
            references: [
                { title: 'GCC编译过程', url: 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html' }
            ],
            assistantTips: [
                '理解编译过程有助于排查编译错误',
                '预处理后的文件可能很大，因为包含了所有头文件内容',
                '链接错误通常与缺少库文件或函数声明有关'
            ]
        },
        {
            id: '1.3',
            title: '集成开发环境与编译器选择',
            duration: '25分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 开发环境

### 主流编译器

| 编译器 | 平台 | 特点 |
|--------|------|------|
| GCC/G++ | Linux, macOS, Windows(MinGW) | 开源免费，标准支持好 |
| Clang/LLVM | 全平台 | 编译速度快，错误信息友好 |
| MSVC | Windows | Visual Studio自带，Windows优化好 |

### 主流IDE

1. **Visual Studio** (Windows)
   - 微软官方IDE
   - 强大的调试功能
   - 集成MSVC编译器

2. **Visual Studio Code** (跨平台)
   - 轻量级编辑器
   - 丰富的插件生态
   - 需要配置编译器

3. **CLion** (跨平台)
   - JetBrains出品
   - 强大的代码分析
   - 收费软件

4. **Code::Blocks** (跨平台)
   - 开源免费
   - 轻量级
   - 适合初学者

### 在线编译器

- Compiler Explorer (godbolt.org)
- OnlineGDB
- Wandbox

### 编译器选择建议

- **Windows初学者**：Visual Studio Community（免费）
- **跨平台开发**：VS Code + CMake
- **Linux开发**：GCC/G++
- **macOS开发**：Clang（Xcode命令行工具）

### 最佳实践

1. **选择适合的开发环境**
   - 初学者：Visual Studio Community（Windows）或 VS Code
   - 专业开发：CLion 或 Visual Studio
   - 跨平台：VS Code + CMake

2. **配置良好的调试环境**
   - 学会使用断点调试
   - 了解如何查看变量值
   - 掌握调用栈分析

3. **版本控制集成**
   - 使用 Git 管理代码
   - IDE 中集成 Git 功能
   - 定期提交代码

### 常见错误

1. **环境配置不当**
   \`\`\`
   错误：'g++' 不是内部或外部命令
   解决：将编译器路径添加到系统 PATH
   \`\`\`

2. **编译器版本不匹配**
   \`\`\`cpp
   // 使用了新特性但编译器版本太旧
   auto x = 10;  // 需要 C++11 支持
   // 解决：更新编译器或使用 -std=c++11 标志
   \`\`\`

3. **项目配置错误**
   \`\`\`
   链接错误：无法解析的外部符号
   解决：检查库文件路径和链接配置
   \`\`\`

### 深入理解

**编译器的优化能力对比**

不同编译器在优化方面各有特点：
- **GCC**：成熟的优化框架，支持多种架构
- **Clang**：编译速度快，错误信息友好
- **MSVC**：Windows 平台优化出色，调试体验好

**IDE 的核心功能**

现代 IDE 提供的关键功能：
1. **智能代码补全**：基于语义的补全
2. **实时错误检测**：编辑时发现问题
3. **重构工具**：安全地重命名、提取函数
4. **调试器集成**：可视化调试体验

**构建系统的重要性**

对于大型项目，构建系统至关重要：
- **CMake**：跨平台构建工具，生成项目文件
- **Make/Ninja**：底层构建工具
- **良好的构建配置**：提高开发效率`,

            examples: [
                {
                    title: '检查编译器版本',
                    code: `// 在命令行中检查编译器版本

// GCC/G++
// g++ --version

// Clang
// clang++ --version

// MSVC (在Developer Command Prompt中)
// cl

// 示例输出：
// g++ (Ubuntu 11.3.0-1ubuntu1~22.04) 11.3.0
// Copyright (C) 2021 Free Software Foundation, Inc.
// This is free software; see the source for copying conditions.

#include <iostream>

int main() {
    std::cout << "编译器检查完成" << std::endl;
    return 0;
}`,
                    description: '演示如何检查编译器版本。'
                }
            ],
            handsOn: {
                title: '输出开发环境信息',
                description: '编写程序，输出当前C++编译器的版本信息和标准版本。',
                initialCode: `#include <iostream>

int main() {
    // ===== 你的代码 =====
    // 使用 __cplusplus 宏检测C++标准版本
    // 提示：__cplusplus 的值：
    // 199711L = C++98/03
    // 201103L = C++11
    // 201402L = C++14
    // 201703L = C++17
    // 202002L = C++20
    
    // TODO: 使用预处理指令判断并输出C++标准版本
    // 输出格式："C++ 标准: C++17" (根据实际版本)
    
    return 0;
}`,
                expectedOutput: 'C++ 标准: C++17 或 C++20 或 C++14 或 C++11',
                solutionRegex: '__cplusplus|#if __cplusplus >=|#elif',
                hint: '使用 #if __cplusplus > 201703L 判断是否支持C++20',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'GCC是什么？', options: [{ text: '一个IDE' }, { text: '一个编译器套件', correct: true }, { text: '一个操作系统' }, { text: '一个调试器' }], explanation: 'GCC（GNU Compiler Collection）是一个开源的编译器套件。' },
                { type: 'single', question: 'Visual Studio使用什么编译器？', options: [{ text: 'GCC' }, { text: 'Clang' }, { text: 'MSVC', correct: true }, { text: 'MinGW' }], explanation: 'Visual Studio使用微软的MSVC编译器。' },
                { type: 'single', question: 'Clang编译器的特点是什么？', options: [{ text: '只能用于Windows' }, { text: '编译速度快，错误信息友好', correct: true }, { text: '不支持C++11' }, { text: '收费软件' }], explanation: 'Clang以编译速度快和错误信息友好著称。' },
                { type: 'single', question: '哪个IDE是JetBrains出品的？', options: [{ text: 'Visual Studio' }, { text: 'VS Code' }, { text: 'CLion', correct: true }, { text: 'Code::Blocks' }], explanation: 'CLion是JetBrains出品的C++ IDE。' },
                { type: 'single', question: '初学者在Windows上推荐使用什么？', options: [{ text: '记事本' }, { text: 'Visual Studio Community', correct: true }, { text: 'Vim' }, { text: 'Emacs' }], explanation: 'Visual Studio Community免费且功能强大，适合Windows初学者。' }
            ],
            references: [
                { title: 'Visual Studio下载', url: 'https://visualstudio.microsoft.com/' },
                { title: 'VS Code下载', url: 'https://code.visualstudio.com/' }
            ],
            assistantTips: [
                '选择一个IDE并熟练使用它',
                '学会使用调试器是提高效率的关键',
                '在线编译器适合快速测试代码片段'
            ]
        },
        {
            id: '1.4',
            title: 'Hello World 详解：main 函数、返回值、注释',
            duration: '30分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## Hello World 程序

让我们详细分析第一个C++程序：

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
\`\`\`

### 1. #include <iostream>

- \`#\` 开头的是预处理指令
- \`#include\` 将头文件内容插入到当前位置
- \`<iostream>\` 是输入输出流头文件
- 包含 \`std::cout\`、\`std::cin\`、\`std::endl\` 等

### 2. int main()

- \`main\` 函数是程序的入口点
- 每个C++程序必须有且仅有一个 \`main\` 函数
- \`int\` 表示返回类型是整数
- 返回0表示程序正常结束

### 3. std::cout

- \`std\` 是标准命名空间
- \`cout\` 是标准输出流对象
- \`<<\` 是插入运算符（流输出运算符）
- 可以链式使用：\`cout << a << b << c;\`

### 4. std::endl

- 输出换行符并刷新缓冲区
- 等价于 \`'\\n'\` + \`flush()\`

### 5. return 0

- 返回0表示程序正常结束
- 非零值表示程序异常
- 在main函数中可以省略，编译器会自动添加return 0

### 注释

C++支持两种注释：

\`\`\`cpp
// 单行注释 - 从//到行末

/*
   多行注释
   可以跨越多行
*/
\`\`\`

### main函数的其他形式

\`\`\`cpp
// 无参数形式
int main() { }

// 带命令行参数形式
int main(int argc, char* argv[]) { }

// 更现代的写法
int main(int argc, char** argv) { }
\`\`\`

### 最佳实践

1. **main 函数的规范写法**
   - 始终返回 int 类型
   - 成功返回 0，失败返回非零值
   - 保持 main 函数简洁，逻辑放到其他函数

2. **注释的使用**
   \`\`\`cpp
   // 好的注释：解释"为什么"
   // 使用快速排序因为数据量小且基本有序
   sort(data);
   
   // 不好的注释：重复代码内容
   // 对数据进行排序
   sort(data);
   \`\`\`

3. **输出格式规范**
   - 使用 std::endl 或 "\\n" 换行
   - 错误信息输出到 std::cerr
   - 正常输出使用 std::cout

### 常见错误

1. **忘记分号**
   \`\`\`cpp
   int main() {
       std::cout << "Hello"  // 错误：缺少分号
       return 0;
   }
   \`\`\`

2. **命名空间使用不当**
   \`\`\`cpp
   // 不推荐：污染全局命名空间
   using namespace std;
   
   // 推荐：使用完整限定名
   std::cout << "Hello" << std::endl;
   
   // 或使用特定声明
   using std::cout;
   using std::endl;
   \`\`\`

3. **main 函数签名错误**
   \`\`\`cpp
   void main() { }  // 非标准，应避免
   int main() { }   // 正确
   \`\`\`

### 深入理解

**程序的启动过程**

当运行 C++ 程序时：
1. 操作系统加载可执行文件
2. C++ 运行时初始化（全局对象构造等）
3. 调用 main 函数
4. main 函数返回
5. C++ 运行时清理（全局对象析构等）
6. 程序退出

**标准输入输出流**

\`std::cout\` 是标准输出流对象：
- 默认连接到终端
- 支持链式操作
- 有缓冲区，定期刷新

\`std::cin\` 是标准输入流对象：
- 默认从终端读取
- 会跳过空白字符
- 可配合 std::getline 读取整行

**命令行参数的用途**

命令行参数常用于：
- 配置程序行为
- 指定输入输出文件
- 设置运行参数

\`\`\`cpp
// 示例：处理命令行参数
int main(int argc, char* argv[]) {
    for (int i = 1; i < argc; ++i) {
        std::cout << "参数 " << i << ": " << argv[i] << std::endl;
    }
    return 0;
}
\`\`\``,

            examples: [
                {
                    title: 'Hello World 完整示例',
                    code: `#include <iostream>  // 包含输入输出流头文件

/*
 * 这是多行注释
 * 程序入口：main函数
 */
int main() {
    // 单行注释：输出Hello World
    std::cout << "Hello, World!" << std::endl;
    
    // 链式输出
    std::cout << "数字: " << 42 << std::endl;
    std::cout << "小数: " << 3.14 << std::endl;
    
    return 0;  // 程序正常结束
}`,
                    description: '完整的Hello World程序，展示注释、输出和返回值。'
                },
                {
                    title: '命令行参数',
                    code: `#include <iostream>

int main(int argc, char* argv[]) {
    std::cout << "参数个数: " << argc << std::endl;
    
    for (int i = 0; i < argc; ++i) {
        std::cout << "argv[" << i << "]: " << argv[i] << std::endl;
    }
    
    return 0;
}

// 运行示例：./program arg1 arg2
// 输出：
// 参数个数: 3
// argv[0]: ./program
// argv[1]: arg1
// argv[2]: arg2`,
                    description: '展示如何使用命令行参数。'
                }
            ],
            handsOn: {
                title: '编写第一个程序',
                description: '编写一个程序，输出你的名字和年龄。',
                initialCode: `#include <iostream>

int main() {
    // TODO: 输出你的名字
    // TODO: 输出你的年龄
    
    return 0;
}`,
                expectedOutput: '你的名字\n你的年龄',
                solutionRegex: 'cout.*<<',
                hint: '使用std::cout和<<运算符输出内容',
                xp: 100
            },
            quiz: [
                { type: 'single', question: 'main函数的返回类型是什么？', options: [{ text: 'void' }, { text: 'int', correct: true }, { text: 'char' }, { text: '任意类型' }], explanation: 'main函数的标准返回类型是int。' },
                { type: 'single', question: 'return 0 表示什么？', options: [{ text: '程序出错' }, { text: '程序正常结束', correct: true }, { text: '程序需要输入' }, { text: '程序被中断' }], explanation: 'return 0表示程序正常结束。' },
                { type: 'single', question: 'std::endl的作用是什么？', options: [{ text: '结束程序' }, { text: '输出换行并刷新缓冲区', correct: true }, { text: '清空屏幕' }, { text: '等待输入' }], explanation: 'std::endl输出换行符并刷新输出缓冲区。' },
                { type: 'single', question: '#include <iostream> 的作用是什么？', options: [{ text: '定义main函数' }, { text: '包含输入输出流头文件', correct: true }, { text: '声明变量' }, { text: '注释代码' }], explanation: '#include <iostream>包含输入输出流头文件，使我们可以使用cout和cin。' },
                { type: 'single', question: 'C++支持哪些注释？', options: [{ text: '只有单行注释' }, { text: '只有多行注释' }, { text: '单行注释和多行注释', correct: true }, { text: '没有注释功能' }], explanation: 'C++支持//单行注释和/* */多行注释两种形式。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第1章' }
            ],
            assistantTips: [
                'main函数是程序的入口，必须存在',
                'std命名空间包含标准库的所有内容',
                '良好的注释习惯有助于代码维护'
            ]
        },
        {
            id: '1.5',
            title: '编译错误与警告初识',
            duration: '25分钟',
            difficulty: '入门',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 编译错误与警告

### 错误类型

#### 1. 语法错误（Syntax Error）

代码不符合C++语法规则，编译器无法理解。

\`\`\`cpp
// 错误示例
int main() {
    std::cout << "Hello"  // 缺少分号
    return 0
}
\`\`\`

#### 2. 语义错误（Semantic Error）

语法正确但含义错误。

\`\`\`cpp
// 错误示例
int main() {
    int x;
    std::cout << x;  // 使用未初始化的变量
    return 0;
}
\`\`\`

#### 3. 链接错误（Link Error）

编译成功但链接失败，通常是找不到函数定义。

\`\`\`
undefined reference to 'func()'
\`\`\`

### 警告（Warning）

警告不会阻止编译，但可能表示潜在问题：

\`\`\`cpp
int main() {
    int x = 3.14;  // 警告：浮点到整数转换
    if (x = 5) {}  // 警告：赋值作为条件
    return 0;
}
\`\`\`

### 常见编译选项

\`\`\`bash
# 显示所有警告
g++ -Wall main.cpp

# 将警告视为错误
g++ -Werror main.cpp

# 显示额外警告
g++ -Wall -Wextra main.cpp

# 最严格的警告
g++ -Wall -Wextra -Wpedantic main.cpp
\`\`\`

### 错误信息解读

\`\`\`
main.cpp:5:10: error: 'cout' was not declared in this scope
     5 |     cout << "Hello";
       |     ~~~~^~~~
\`\`\`

- \`main.cpp:5:10\`：文件名:行号:列号
- \`error\`：错误类型
- 后面是错误描述和建议

### 最佳实践

1. **从第一个错误开始修复**
   - 一个错误可能引发多个后续错误
   - 修复第一个错误后重新编译
   - 不要试图一次修复所有错误

2. **使用严格的编译选项**
   \`\`\`bash
   # 推荐的开发编译选项
   g++ -std=c++17 -Wall -Wextra -Wpedantic -g main.cpp
   \`\`\`

3. **阅读完整的错误信息**
   - 注意文件名和行号
   - 理解错误类型
   - 查看编译器建议

### 常见错误

1. **忽略警告**
   \`\`\`cpp
   int x;
   std::cin >> x;
   if (x = 10) { }  // 警告：赋值作为条件
   // 应该用 x == 10
   \`\`\`

2. **类型不匹配**
   \`\`\`cpp
   double d = 3.14;
   int* p = &d;  // 错误：类型不匹配
   \`\`\`

3. **未初始化变量**
   \`\`\`cpp
   int x;  // 未初始化
   std::cout << x;  // 警告：使用未初始化的变量
   \`\`\`

### 深入理解

**编译器的错误检测机制**

编译器通过多个阶段检测错误：
1. **词法分析**：检测非法字符
2. **语法分析**：检测语法错误
3. **语义分析**：检测类型错误
4. **链接阶段**：检测符号引用错误

**警告的重要性**

警告虽然不会阻止编译，但往往预示着潜在问题：
- **逻辑错误**：如 if (x = 5)
- **性能问题**：如不必要的拷贝
- **可移植性问题**：如依赖实现的行为

**静态分析工具**

除了编译器警告，还可以使用静态分析工具：
- **clang-tidy**：Clang 的静态分析器
- **cppcheck**：独立的静态分析工具
- **IDE 内置分析**：如 Visual Studio 的代码分析`,

            examples: [
                {
                    title: '常见错误示例',
                    code: `#include <iostream>

int main() {
    // 错误1：缺少分号
    // std::cout << "Hello"  // error: expected ';' before 'return'
    
    // 错误2：未声明的变量
    // std::cout << x;  // error: 'x' was not declared
    
    // 错误3：类型不匹配
    // int x = "string";  // error: cannot convert 'const char*' to 'int'
    
    // 正确代码
    std::cout << "Hello" << std::endl;
    int x = 10;
    std::cout << x << std::endl;
    
    return 0;
}`,
                    description: '展示常见的编译错误类型。'
                }
            ],
            handsOn: {
                title: '修复常见编译错误',
                description: '下面的程序有语法错误，修复它们使程序能正常编译运行。',
                initialCode: `#include <iostream>

int main() {
    // 错误1：缺少分号
    // std::cout << "Hello" << std::endl  // 缺少分号
    
    // 错误2：变量未声明
    // std::cout << y << std::endl;  // y未声明
    
    // 错误3：类型不匹配
    // int x = "Hello";  // 不能将字符串赋给int
    
    // ===== 你的代码 =====
    // 写出正确的代码，输出 "Hello" 和数字 42
    
    return 0;
}`,
                expectedOutput: 'Hello\\n42',
                solutionRegex: 'cout.*<<.*endl|int.*=',
                hint: '每条语句后需要分号，变量需要先声明后使用',
                xp: 120
            },
            quiz: [
                { type: 'single', question: '语法错误是什么？', options: [{ text: '代码逻辑错误' }, { text: '代码不符合语法规则', correct: true }, { text: '运行时错误' }, { text: '链接错误' }], explanation: '语法错误是代码不符合C++语法规则，编译器无法理解。' },
                { type: 'single', question: '-Wall选项的作用是什么？', options: [{ text: '关闭所有警告' }, { text: '显示所有警告', correct: true }, { text: '将警告转为错误' }, { text: '优化代码' }], explanation: '-Wall选项让编译器显示所有常见的警告信息。' },
                { type: 'single', question: '链接错误通常是什么原因？', options: [{ text: '语法错误' }, { text: '找不到函数定义', correct: true }, { text: '类型错误' }, { text: '内存不足' }], explanation: '链接错误通常是因为声明了函数但找不到定义。' },
                { type: 'single', question: '警告和错误的区别是什么？', options: [{ text: '没有区别' }, { text: '错误阻止编译，警告不会', correct: true }, { text: '警告阻止编译，错误不会' }, { text: '都会阻止编译' }], explanation: '错误会阻止编译，警告不会但表示潜在问题。' },
                { type: 'single', question: '如何将警告视为错误？', options: [{ text: '-Wall' }, { text: '-Werror', correct: true }, { text: '-Wextra' }, { text: '-w' }], explanation: '-Werror选项将所有警告视为错误，强制修复所有警告。' }
            ],
            references: [],
            assistantTips: [
                '养成阅读错误信息的习惯',
                '从第一个错误开始修复',
                '使用-Wall -Wextra选项捕获更多潜在问题'
            ]
        },
        {
            id: '1.6',
            title: '从源码到进程：程序的内存布局概览',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 程序的内存布局

当程序运行时，操作系统会为其分配内存空间。典型的内存布局如下：

\`\`\`
高地址
┌─────────────────┐
│    命令行参数    │
├─────────────────┤
│    环境变量      │
├─────────────────┤
│    栈 (Stack)    │  ← 向下增长
│        ↓        │
│                 │
│        ↑        │
│    堆 (Heap)     │  ← 向上增长
├─────────────────┤
│   BSS段（未初始化）│
├─────────────────┤
│   数据段（已初始化）│
├─────────────────┤
│   代码段（Text）  │
└─────────────────┘
低地址
\`\`\`

### 各段说明

#### 1. 代码段（Text Segment）
- 存放程序的可执行代码
- 只读，防止程序意外修改
- 可共享，多个进程可共享同一份代码

#### 2. 数据段（Data Segment）
- 存放已初始化的全局变量和静态变量
- 可读写

#### 3. BSS段（Block Started by Symbol）
- 存放未初始化的全局变量和静态变量
- 自动初始化为0

#### 4. 堆（Heap）
- 动态分配的内存区域
- 使用 new/malloc 分配
- 使用 delete/free 释放
- 程序员手动管理

#### 5. 栈（Stack）
- 存放局部变量、函数参数、返回地址
- 自动管理，函数结束时自动释放
- 大小有限，可能导致栈溢出

### 示例代码

\`\`\`cpp
#include <iostream>

int global_init = 10;      // 数据段
int global_uninit;         // BSS段

void func() {
    int local = 5;         // 栈
    static int static_var; // BSS段
    int* heap = new int(3);// 堆
}

int main() {
    func();
    return 0;
}
\`\`\`

### 最佳实践

1. **合理使用内存区域**
   - 大对象使用堆内存
   - 小对象和局部变量使用栈
   - 全局变量尽量少用

2. **避免内存泄漏**
   \`\`\`cpp
   // 危险：可能忘记释放
   int* p = new int(10);
   
   // 推荐：使用智能指针
   auto p = std::make_unique<int>(10);
   \`\`\`

3. **注意栈空间限制**
   \`\`\`cpp
   // 危险：大数组可能导致栈溢出
   int largeArray[1000000];  // 可能栈溢出
   
   // 正确：使用堆内存
   std::vector<int> largeArray(1000000);
   \`\`\`

### 常见错误

1. **栈溢出**
   \`\`\`cpp
   void recursive() {
       int largeArray[10000];
       recursive();  // 无限递归导致栈溢出
   }
   \`\`\`

2. **内存泄漏**
   \`\`\`cpp
   void func() {
       int* p = new int(10);
       // 忘记 delete p
   }  // 内存泄漏
   \`\`\`

3. **使用已释放的内存**
   \`\`\`cpp
   int* p = new int(10);
   delete p;
   std::cout << *p;  // 错误：使用已释放的内存
   \`\`\`

### 深入理解

**内存布局的设计原因**

现代操作系统的内存布局设计有以下考虑：
1. **安全性**：代码段只读，防止代码被篡改
2. **效率**：栈的分配释放速度快
3. **灵活性**：堆可以动态分配任意大小

**栈和堆的对比**

| 特性 | 栈 | 堆 |
|------|-----|-----|
| 分配速度 | 快（移动指针） | 慢（查找空闲块） |
| 释放方式 | 自动 | 手动 |
| 空间大小 | 较小（MB级别） | 较大（GB级别） |
| 碎片问题 | 无 | 有 |

**虚拟内存的概念**

现代操作系统使用虚拟内存：
- 每个进程有独立的地址空间
- 虚拟地址映射到物理地址
- 提供内存保护和隔离

**内存对齐**

为了提高访问效率，数据通常按特定边界对齐：
\`\`\`cpp
struct Example {
    char a;    // 1 字节
    // 3 字节填充
    int b;     // 4 字节
};  // 总共 8 字节
\`\`\``,

            examples: [
                {
                    title: '查看变量存储位置',
                    code: `#include <iostream>

int global_init = 100;      // 数据段（已初始化全局变量）
int global_uninit;          // BSS段（未初始化全局变量）

int main() {
    int local = 10;         // 栈
    static int static_var;  // BSS段
    int* heap = new int(5); // 堆
    
    std::cout << "代码段地址: " << (void*)main << std::endl;
    std::cout << "数据段地址: " << &global_init << std::endl;
    std::cout << "BSS段地址: " << &global_uninit << std::endl;
    std::cout << "栈地址: " << &local << std::endl;
    std::cout << "堆地址: " << heap << std::endl;
    
    delete heap;
    return 0;
}`,
                    description: '演示不同存储区域的变量地址。'
                }
            ],
            handsOn: {
                title: '观察内存地址',
                description: '定义不同存储类型的变量，观察它们的地址差异。',
                initialCode: `#include <iostream>

int global_var = 100;       // 全局变量（数据段）
static int static_var;      // 静态变量（BSS段）
int uninit_var;             // 未初始化全局变量（BSS段）

int main() {
    int local_var = 10;         // 局部变量（栈）
    static int local_static;    // 局部静态变量（BSS段）
    int* heap_var = new int(20); // 动态分配（堆）
    
    // ===== 你的代码 =====
    // TODO: 使用cout输出以下地址（转换为void*）:
    // 1. global_var 的地址
    // 2. static_var 的地址
    // 3. uninit_var 的地址
    // 4. local_var 的地址（栈）
    // 5. local_static 的地址
    // 6. heap_var 指向的地址（堆）
    
    delete heap_var;
    return 0;
}`,
                expectedOutput: '地址输出（示例，实际值可能不同）',
                solutionRegex: '&global|&static|cout.*<<.*\\(void\\*\\)',
                hint: '使用 &变量名 获取地址，使用 (void*) 转换为可打印格式',
                xp: 120
            },
            quiz: [
                { type: 'single', question: '局部变量存储在哪个区域？', options: [{ text: '代码段' }, { text: '数据段' }, { text: '栈', correct: true }, { text: '堆' }], explanation: '局部变量存储在栈上，函数结束时自动释放。' },
                { type: 'single', question: 'new分配的内存存储在哪个区域？', options: [{ text: '代码段' }, { text: '数据段' }, { text: '栈' }, { text: '堆', correct: true }], explanation: 'new分配的动态内存存储在堆上。' },
                { type: 'single', question: '未初始化的全局变量存储在哪个区域？', options: [{ text: '代码段' }, { text: 'BSS段', correct: true }, { text: '数据段' }, { text: '栈' }], explanation: '未初始化的全局变量存储在BSS段，自动初始化为0。' },
                { type: 'single', question: '代码段的特点是什么？', options: [{ text: '可读写' }, { text: '只读', correct: true }, { text: '可执行但可修改' }, { text: '动态分配' }], explanation: '代码段是只读的，防止程序意外修改指令。' },
                { type: 'single', question: '栈溢出是什么原因？', options: [{ text: '堆内存不足' }, { text: '递归太深或局部变量太大', correct: true }, { text: '全局变量太多' }, { text: '代码太长' }], explanation: '栈大小有限，递归太深或局部变量太大可能导致栈溢出。' }
            ],
            references: [
                { title: '程序员的自我修养', book: '第10章' }
            ],
            assistantTips: [
                '理解内存布局有助于理解程序行为',
                '栈空间有限，大对象应该放在堆上',
                '内存泄漏是堆内存没有被正确释放'
            ]
        }
    ]
};
