/**
 * 单元26：内存模型与对象生命周期
 * 深入理解C++内存模型和对象生命周期管理
 */
const Unit26Data = {
    id: 26,
    title: '内存模型与对象生命周期',
    description: '深入理解C++内存模型，掌握存储持续性、对象生命周期、内存对齐、POD类型以及内存调试技术',
    lessons: [
        {
            id: '26.1',
            title: '存储持续性、作用域与链接性',
            duration: '35分钟',
            difficulty: '中级',
            xp: 160,
            estimatedXp: 320,
            concepts: `## 存储持续性、作用域与链接性

C++中的变量具有不同的存储持续性、作用域和链接性，这些特性决定了变量的生命周期和可见性。

### 存储持续性（Storage Duration）

存储持续性决定了变量的生命周期：

#### 1. 自动存储持续性（Automatic Storage Duration）

局部变量默认具有自动存储持续性，在定义时创建，在作用域结束时销毁。

\`\`\`cpp
void func() {
    int x = 10;        // 自动存储持续性
    double y = 3.14;   // 进入函数时创建，退出时销毁
}
\`\`\`

#### 2. 静态存储持续性（Static Storage Duration）

全局变量和静态变量具有静态存储持续性，程序开始时创建，程序结束时销毁。

\`\`\`cpp
int globalVar = 100;        // 静态存储持续性

void func() {
    static int count = 0;   // 静态存储持续性
    count++;
}
\`\`\`

#### 3. 线程存储持续性（Thread Storage Duration）

C++11引入，每个线程有独立的副本。

\`\`\`cpp
thread_local int tlsVar = 0;  // 每个线程独立

void func() {
    thread_local static int counter = 0;  // 线程局部静态变量
    counter++;
}
\`\`\`

#### 4. 动态存储持续性（Dynamic Storage Duration）

通过new分配，通过delete释放。

\`\`\`cpp
int* ptr = new int(42);  // 动态存储持续性
delete ptr;              // 手动释放
\`\`\`

### 作用域（Scope）

作用域决定了变量的可见范围：

#### 1. 块作用域（Block Scope）

\`\`\`cpp
void func() {
    int x = 10;        // 块作用域
    if (true) {
        int y = 20;    // 块作用域，只在if块内可见
    }
    // y 不可见
}
\`\`\`

#### 2. 类作用域（Class Scope）

\`\`\`cpp
class MyClass {
    int member;        // 类作用域
public:
    void func() {
        member = 10;   // 类成员可见
    }
};
\`\`\`

#### 3. 命名空间作用域（Namespace Scope）

\`\`\`cpp
namespace MyNS {
    int x = 10;        // 命名空间作用域
}

void func() {
    MyNS::x = 20;      // 通过命名空间访问
}
\`\`\`

#### 4. 全局作用域（Global Scope）

\`\`\`cpp
int globalVar = 100;   // 全局作用域

void func() {
    ::globalVar = 200; // 使用::访问全局变量
}
\`\`\`

### 链接性（Linkage）

链接性决定了变量是否可以在多个文件间共享：

#### 1. 无链接（No Linkage）

局部变量没有链接性，只在定义它的块内可见。

\`\`\`cpp
void func() {
    int x = 10;        // 无链接
}
\`\`\`

#### 2. 内部链接（Internal Linkage）

使用static关键字，只在当前文件可见。

\`\`\`cpp
// file1.cpp
static int internalVar = 100;  // 内部链接

namespace {
    int anotherInternal = 200; // 匿名命名空间也是内部链接
}
\`\`\`

#### 3. 外部链接（External Linkage）

全局变量和函数默认具有外部链接。

\`\`\`cpp
// file1.cpp
int globalVar = 100;           // 外部链接
extern int anotherGlobal;      // 声明外部变量

// file2.cpp
extern int globalVar;          // 使用file1.cpp中的globalVar
int anotherGlobal = 200;       // 定义
\`\`\`

### const 和 constexpr 的链接性

const变量默认具有内部链接：

\`\`\`cpp
const int MAX_SIZE = 100;      // 内部链接（C++默认）
extern const int LIMIT = 200;  // 外部链接（需要extern）

// 头文件中
extern const int GLOBAL_CONST; // 声明

// 源文件中
extern const int GLOBAL_CONST = 300; // 定义
\`\`\`

### inline 变量（C++17）

C++17允许在头文件中定义inline变量：

\`\`\`cpp
// header.h
struct MyClass {
    static inline int count = 0;  // C++17 inline变量
};

inline int globalInline = 100;    // 全局inline变量
\`\`\`

### 存储持续性总结

| 类型 | 创建时机 | 销毁时机 | 示例 |
|------|----------|----------|------|
| 自动 | 进入块时 | 离开块时 | 局部变量 |
| 静态 | 程序开始 | 程序结束 | 全局变量、static变量 |
| 线程 | 线程开始 | 线程结束 | thread_local变量 |
| 动态 | new时 | delete时 | 动态分配 |

### 最佳实践

1. **优先使用自动存储持续性**：让编译器管理生命周期
2. **避免全局变量**：使用命名空间或单例模式
3. **使用thread_local处理线程局部数据**
4. **使用const和constexpr提高类型安全性**
5. **使用匿名命名空间替代static全局变量**`,
            examples: [
                {
                    title: '存储持续性示例',
                    code: `#include <iostream>
#include <thread>

// 全局变量 - 静态存储持续性
int globalCounter = 0;

// 线程局部变量 - 线程存储持续性
thread_local int threadLocalVar = 0;

void demonstrateStorageDuration() {
    // 自动存储持续性
    int autoVar = 10;
    
    // 静态局部变量 - 静态存储持续性
    static int staticLocalVar = 0;
    staticLocalVar++;
    
    // 线程局部变量
    threadLocalVar++;
    
    std::cout << "自动变量: " << autoVar << std::endl;
    std::cout << "静态局部变量: " << staticLocalVar << std::endl;
    std::cout << "线程局部变量: " << threadLocalVar << std::endl;
    std::cout << "全局变量: " << globalCounter << std::endl;
}

void threadFunction(int id) {
    threadLocalVar = id * 100;
    globalCounter++;
    
    std::cout << "线程 " << id << ":" << std::endl;
    std::cout << "  threadLocalVar = " << threadLocalVar << std::endl;
    std::cout << "  globalCounter = " << globalCounter << std::endl;
}

int main() {
    std::cout << "=== 存储持续性演示 ===" << std::endl;
    
    // 多次调用观察静态变量
    for (int i = 0; i < 3; i++) {
        std::cout << "\\n第" << (i + 1) << "次调用:" << std::endl;
        demonstrateStorageDuration();
    }
    
    std::cout << "\\n=== 线程局部存储演示 ===" << std::endl;
    
    // 创建多个线程
    std::thread t1(threadFunction, 1);
    std::thread t2(threadFunction, 2);
    std::thread t3(threadFunction, 3);
    
    t1.join();
    t2.join();
    t3.join();
    
    std::cout << "\\n主线程中:" << std::endl;
    std::cout << "  threadLocalVar = " << threadLocalVar << std::endl;
    std::cout << "  globalCounter = " << globalCounter << std::endl;
    
    return 0;
}`
                },
                {
                    title: '链接性示例',
                    code: `#include <iostream>

// 外部链接 - 全局变量
int externalVar = 100;

// 内部链接 - static全局变量
static int internalVar = 200;

// 匿名命名空间 - 内部链接
namespace {
    int anonymousVar = 300;
    
    void internalFunction() {
        std::cout << "内部函数被调用" << std::endl;
    }
}

// const变量 - 默认内部链接
const int CONST_VAR = 400;

// constexpr变量 - 默认内部链接
constexpr int EXPR_VAR = 500;

// extern const - 外部链接
extern const int EXTERN_CONST = 600;

// 命名空间
namespace MyNamespace {
    int namespaceVar = 700;  // 外部链接
    
    namespace {
        int nestedAnonymous = 800;  // 内部链接
    }
}

void demonstrateLinkage() {
    std::cout << "externalVar = " << externalVar << std::endl;
    std::cout << "internalVar = " << internalVar << std::endl;
    std::cout << "anonymousVar = " << anonymousVar << std::endl;
    std::cout << "CONST_VAR = " << CONST_VAR << std::endl;
    std::cout << "EXPR_VAR = " << EXPR_VAR << std::endl;
    std::cout << "EXTERN_CONST = " << EXTERN_CONST << std::endl;
    std::cout << "MyNamespace::namespaceVar = " << MyNamespace::namespaceVar << std::endl;
    
    internalFunction();
}

// 演示作用域
void demonstrateScope() {
    int x = 10;  // 块作用域
    
    {
        int y = 20;  // 内层块作用域
        std::cout << "内层块: x = " << x << ", y = " << y << std::endl;
    }
    
    // y 不可见
    // std::cout << y << std::endl;  // 编译错误
    
    // 使用作用域解析运算符
    int externalVar = 999;  // 局部变量遮蔽全局变量
    std::cout << "局部 externalVar = " << externalVar << std::endl;
    std::cout << "全局 externalVar = " << ::externalVar << std::endl;
}

int main() {
    std::cout << "=== 链接性演示 ===" << std::endl;
    demonstrateLinkage();
    
    std::cout << "\\n=== 作用域演示 ===" << std::endl;
    demonstrateScope();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现计数器系统',
                description: '使用不同的存储持续性实现一个多线程安全的计数器系统。',
                initialCode: `#include <iostream>
#include <thread>
#include <vector>

// TODO: 实现全局计数器（静态存储持续性）

// TODO: 实现线程局部计数器（线程存储持续性）

class CounterSystem {
public:
    // TODO: 实现静态成员变量（类作用域，静态存储持续性）
    
    // TODO: 实现增加全局计数的方法
    
    // TODO: 实现增加线程局部计数的方法
    
    // TODO: 实现获取计数的方法
};

void workerThread(int id) {
    // TODO: 在每个线程中增加计数
}

int main() {
    // TODO: 创建多个线程测试计数器
    
    // TODO: 输出最终计数结果
    
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

// 全局计数器
int globalCounter = 0;
std::mutex globalMutex;

// 线程局部计数器
thread_local int threadLocalCounter = 0;

class CounterSystem {
public:
    static int classCounter;
    static std::mutex classMutex;
    
    static void incrementGlobal() {
        std::lock_guard<std::mutex> lock(globalMutex);
        globalCounter++;
    }
    
    static void incrementThreadLocal() {
        threadLocalCounter++;
    }
    
    static void incrementClass() {
        std::lock_guard<std::mutex> lock(classMutex);
        classCounter++;
    }
    
    static void printCounters() {
        std::cout << "全局计数器: " << globalCounter << std::endl;
        std::cout << "类静态计数器: " << classCounter << std::endl;
        std::cout << "线程局部计数器: " << threadLocalCounter << std::endl;
    }
};

int CounterSystem::classCounter = 0;
std::mutex CounterSystem::classMutex;

void workerThread(int id) {
    for (int i = 0; i < 5; i++) {
        CounterSystem::incrementGlobal();
        CounterSystem::incrementThreadLocal();
        CounterSystem::incrementClass();
    }
    
    std::cout << "线程 " << id << " 完成，线程局部计数: " << threadLocalCounter << std::endl;
}

int main() {
    const int numThreads = 5;
    std::vector<std::thread> threads;
    
    for (int i = 0; i < numThreads; i++) {
        threads.emplace_back(workerThread, i);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "\\n最终计数结果:" << std::endl;
    std::cout << "全局计数器: " << globalCounter << std::endl;
    std::cout << "类静态计数器: " << CounterSystem::classCounter << std::endl;
    std::cout << "主线程局部计数器: " << threadLocalCounter << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪种存储持续性的变量在程序开始时创建，程序结束时销毁？',
                    options: ['自动存储持续性', '静态存储持续性', '线程存储持续性', '动态存储持续性'],
                    correct: 1,
                    explanation: '静态存储持续性的变量（全局变量和static变量）在程序开始时创建，程序结束时销毁。'
                },
                {
                    question: 'thread_local变量的特点是什么？',
                    options: ['所有线程共享同一个副本', '每个线程有独立的副本', '只能在主线程中使用', '必须配合static使用'],
                    correct: 1,
                    explanation: 'thread_local变量每个线程有独立的副本，线程开始时创建，线程结束时销毁。'
                },
                {
                    question: '以下哪个声明具有内部链接？',
                    options: ['int globalVar;', 'extern int extVar;', 'static int staticVar;', 'const int CONST_VAR;'],
                    correct: 2,
                    explanation: 'static关键字声明的全局变量具有内部链接，只在当前文件可见。const变量默认也是内部链接。'
                },
                {
                    question: '在块作用域内使用::运算符访问的是什么？',
                    options: ['局部变量', '类成员', '全局变量', '命名空间变量'],
                    correct: 2,
                    explanation: "::是作用域解析运算符，单独使用时访问全局作用域的变量。"
                },
                {
                    question: '以下关于const变量链接性的说法，正确的是？',
                    options: ['const变量默认有外部链接', 'const变量必须有extern才有效', 'const变量默认有内部链接', 'const变量不能有链接性'],
                    correct: 2,
                    explanation: 'const变量默认具有内部链接，如果需要外部链接需要显式使用extern关键字。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Storage duration',
                    url: 'https://en.cppreference.com/w/cpp/language/storage_duration'
                },
                {
                    title: 'cppreference - Linkage',
                    url: 'https://en.cppreference.com/w/cpp/language/language_linkage'
                }
            ],
            assistantTips: '理解存储持续性、作用域和链接性是掌握C++内存模型的基础。记住：自动变量由编译器管理，静态变量生命周期贯穿程序始终，thread_local为每个线程提供独立副本。'
        },
        {
            id: '26.2',
            title: '动态分配与对齐（alignof/alignas）',
            duration: '35分钟',
            difficulty: '中级',
            xp: 170,
            estimatedXp: 340,
            concepts: `## 动态分配与对齐（alignof/alignas）

C++11引入了alignof和alignas关键字，用于控制内存对齐，这对性能优化和硬件兼容性非常重要。

### 内存对齐基础

内存对齐是指数据在内存中的起始地址必须满足特定的边界要求。

#### 为什么需要内存对齐？

1. **硬件效率**：许多CPU只能从对齐的地址读取数据
2. **性能优化**：对齐的内存访问更快
3. **原子操作**：某些原子操作要求对齐
4. **SIMD指令**：向量化操作要求特定对齐

\`\`\`cpp
struct Example {
    char a;     // 1 byte
    // 3 bytes padding
    int b;      // 4 bytes (需要4字节对齐)
    char c;     // 1 byte
    // 3 bytes padding
};  // 总大小: 12 bytes
\`\`\`

### alignof 运算符

alignof返回类型的对齐要求（字节数）：

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "char对齐: " << alignof(char) << std::endl;      // 1
    std::cout << "short对齐: " << alignof(short) << std::endl;    // 2
    std::cout << "int对齐: " << alignof(int) << std::endl;        // 4
    std::cout << "double对齐: " << alignof(double) << std::endl;  // 8
    
    struct alignas(16) AlignedStruct {
        int x;
    };
    
    std::cout << "AlignedStruct对齐: " << alignof(AlignedStruct) << std::endl;  // 16
    
    return 0;
}
\`\`\`

### alignas 说明符

alignas用于指定自定义对齐要求：

\`\`\`cpp
// 指定变量对齐
alignas(16) int alignedVar;

// 指定类型对齐
struct alignas(32) CacheLine {
    int data[8];
};

// 指定类成员对齐
struct MyClass {
    alignas(16) int x;
    alignas(32) double y;
};
\`\`\`

### 对齐规则

1. **对齐值必须是2的幂**
2. **对齐值不能小于自然对齐**
3. **数组对齐与元素类型相同**
4. **结构体对齐是成员最大对齐值**

\`\`\`cpp
struct Example {
    char a;              // 对齐: 1
    alignas(8) int b;    // 对齐: 8
    double c;            // 对齐: 8
};

// Example的对齐是8（最大对齐值）
\`\`\`

### 动态内存分配与对齐

C++17引入了对齐的new/delete：

\`\`\`cpp
#include <new>

// C++17 对齐分配
void* ptr = ::operator new(sizeof(int), std::align_val_t{16});
::operator delete(ptr, std::align_val_t{16});

// 使用alignas
struct alignas(16) AlignedType {
    int data[4];
};

AlignedType* alignedObj = new AlignedType;
delete alignedObj;
\`\`\`

### std::aligned_storage

用于创建对齐的未初始化存储：

\`\`\`cpp
#include <type_traits>

// 创建对齐的存储空间
std::aligned_storage<sizeof(int), alignof(int)>::type storage;

// 在存储中构造对象
int* ptr = new (&storage) int(42);

// 使用对象
std::cout << *ptr << std::endl;

// 手动析构
ptr->~int();
\`\`\`

### std::aligned_union

C++11提供，用于创建对齐的联合体存储：

\`\`\`cpp
#include <type_traits>

std::aligned_union<sizeof(double), int, double>::type storage;
\`\`\`

### 对齐与性能

\`\`\`cpp
#include <iostream>
#include <chrono>

// 未对齐的结构
struct Unaligned {
    char a;
    int b;
    char c;
    double d;
};

// 对齐优化的结构
struct Aligned {
    double d;    // 8 bytes
    int b;       // 4 bytes
    char a;      // 1 byte
    char c;      // 1 byte
    // 2 bytes padding
};

int main() {
    std::cout << "Unaligned大小: " << sizeof(Unaligned) << std::endl;
    std::cout << "Aligned大小: " << sizeof(Aligned) << std::endl;
    
    return 0;
}
\`\`\`

### 使用场景

1. **SIMD指令**：需要16/32/64字节对齐
2. **内存映射IO**：硬件要求特定对齐
3. **缓存优化**：避免缓存行伪共享
4. **原子操作**：某些平台要求对齐

\`\`\`cpp
// SIMD对齐示例
struct alignas(32) SIMDData {
    float data[8];  // 32字节对齐，适合AVX
};

// 缓存行对齐，避免伪共享
struct alignas(64) CacheLineAligned {
    int data;
    char padding[60];  // 填充到64字节
};
\`\`\`

### 检查对齐

\`\`\`cpp
#include <cstdint>

bool isAligned(void* ptr, size_t alignment) {
    return (reinterpret_cast<uintptr_t>(ptr) % alignment) == 0;
}

int main() {
    alignas(16) int x;
    
    if (isAligned(&x, 16)) {
        std::cout << "x已16字节对齐" << std::endl;
    }
    
    return 0;
}
\`\`\``,
            examples: [
                {
                    title: 'alignof和alignas基础',
                    code: `#include <iostream>
#include <cstdint>

// 自定义对齐的结构
struct alignas(16) Vector4 {
    float x, y, z, w;
};

// 缓存行对齐
struct alignas(64) CacheLineAligned {
    int data;
    char padding[60];
};

// 检查对齐
bool isAligned(const void* ptr, size_t alignment) {
    return (reinterpret_cast<uintptr_t>(ptr) % alignment) == 0;
}

int main() {
    std::cout << "=== 基本类型对齐 ===" << std::endl;
    std::cout << "char: " << alignof(char) << " bytes" << std::endl;
    std::cout << "short: " << alignof(short) << " bytes" << std::endl;
    std::cout << "int: " << alignof(int) << " bytes" << std::endl;
    std::cout << "long: " << alignof(long) << " bytes" << std::endl;
    std::cout << "double: " << alignof(double) << " bytes" << std::endl;
    std::cout << "long double: " << alignof(long double) << " bytes" << std::endl;
    
    std::cout << "\\n=== 自定义对齐 ===" << std::endl;
    std::cout << "Vector4对齐: " << alignof(Vector4) << " bytes" << std::endl;
    std::cout << "Vector4大小: " << sizeof(Vector4) << " bytes" << std::endl;
    std::cout << "CacheLineAligned对齐: " << alignof(CacheLineAligned) << " bytes" << std::endl;
    std::cout << "CacheLineAligned大小: " << sizeof(CacheLineAligned) << " bytes" << std::endl;
    
    std::cout << "\\n=== 对齐检查 ===" << std::endl;
    
    alignas(16) int alignedInt;
    int normalInt;
    
    std::cout << "alignedInt地址: " << &alignedInt << std::endl;
    std::cout << "16字节对齐: " << (isAligned(&alignedInt, 16) ? "是" : "否") << std::endl;
    
    std::cout << "normalInt地址: " << &normalInt << std::endl;
    std::cout << "16字节对齐: " << (isAligned(&normalInt, 16) ? "是" : "否") << std::endl;
    
    Vector4 vec;
    std::cout << "Vector4地址: " << &vec << std::endl;
    std::cout << "16字节对齐: " << (isAligned(&vec, 16) ? "是" : "否") << std::endl;
    
    return 0;
}`
                },
                {
                    title: '内存布局优化',
                    code: `#include <iostream>
#include <chrono>

// 未优化的结构
struct BadLayout {
    char a;      // 1 byte
    // 3 bytes padding
    int b;       // 4 bytes
    char c;      // 1 byte
    // 3 bytes padding
    double d;    // 8 bytes
    char e;      // 1 byte
    // 7 bytes padding
};

// 优化后的结构
struct GoodLayout {
    double d;    // 8 bytes
    int b;       // 4 bytes
    char a;      // 1 byte
    char c;      // 1 byte
    char e;      // 1 byte
    // 1 byte padding
};

// 使用alignas强制对齐
struct ForcedAlignment {
    alignas(16) char a;
    alignas(16) int b;
};

int main() {
    std::cout << "=== 内存布局对比 ===" << std::endl;
    
    std::cout << "BadLayout大小: " << sizeof(BadLayout) << " bytes" << std::endl;
    std::cout << "GoodLayout大小: " << sizeof(GoodLayout) << " bytes" << std::endl;
    std::cout << "ForcedAlignment大小: " << sizeof(ForcedAlignment) << " bytes" << std::endl;
    
    std::cout << "\\n=== 成员偏移量 ===" << std::endl;
    
    BadLayout bad;
    std::cout << "BadLayout:" << std::endl;
    std::cout << "  a偏移: " << offsetof(BadLayout, a) << std::endl;
    std::cout << "  b偏移: " << offsetof(BadLayout, b) << std::endl;
    std::cout << "  c偏移: " << offsetof(BadLayout, c) << std::endl;
    std::cout << "  d偏移: " << offsetof(BadLayout, d) << std::endl;
    std::cout << "  e偏移: " << offsetof(BadLayout, e) << std::endl;
    
    GoodLayout good;
    std::cout << "\\nGoodLayout:" << std::endl;
    std::cout << "  d偏移: " << offsetof(GoodLayout, d) << std::endl;
    std::cout << "  b偏移: " << offsetof(GoodLayout, b) << std::endl;
    std::cout << "  a偏移: " << offsetof(GoodLayout, a) << std::endl;
    std::cout << "  c偏移: " << offsetof(GoodLayout, c) << std::endl;
    std::cout << "  e偏移: " << offsetof(GoodLayout, e) << std::endl;
    
    std::cout << "\\n=== 性能测试 ===" << std::endl;
    
    const int N = 10000000;
    
    // 测试BadLayout
    auto start = std::chrono::high_resolution_clock::now();
    BadLayout* badArray = new BadLayout[N];
    for (int i = 0; i < N; i++) {
        badArray[i].d = i * 1.5;
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "BadLayout写入时间: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    delete[] badArray;
    
    // 测试GoodLayout
    start = std::chrono::high_resolution_clock::now();
    GoodLayout* goodArray = new GoodLayout[N];
    for (int i = 0; i < N; i++) {
        goodArray[i].d = i * 1.5;
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "GoodLayout写入时间: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    delete[] goodArray;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现对齐的内存池',
                description: '实现一个支持自定义对齐的内存池分配器。',
                initialCode: `#include <iostream>
#include <cstdint>
#include <cstddef>

class AlignedMemoryPool {
private:
    // TODO: 定义内存池成员变量
    
public:
    // TODO: 构造函数，指定内存池大小和对齐要求
    // AlignedMemoryPool(size_t poolSize, size_t alignment)
    
    // TODO: 析构函数
    // ~AlignedMemoryPool()
    
    // TODO: 分配对齐的内存
    // void* allocate(size_t size)
    
    // TODO: 释放内存（简单实现：不支持单独释放）
    // void deallocate(void* ptr)
    
    // TODO: 重置内存池
    // void reset()
    
    // TODO: 检查指针是否对齐
    // static bool isAligned(void* ptr, size_t alignment)
};

int main() {
    // TODO: 测试对齐内存池
    
    // 创建16字节对齐的内存池
    
    // 分配不同大小的内存块
    
    // 检查对齐
    
    return 0;
}`,
                solution: `#include <iostream>
#include <cstdint>
#include <cstddef>
#include <cstring>

class AlignedMemoryPool {
private:
    char* pool;
    size_t poolSize;
    size_t alignment;
    size_t offset;
    
public:
    AlignedMemoryPool(size_t size, size_t align) 
        : poolSize(size), alignment(align), offset(0) {
        // 分配对齐的内存池
        void* raw = ::operator new(size + align);
        uintptr_t addr = reinterpret_cast<uintptr_t>(raw);
        uintptr_t aligned = (addr + align - 1) & ~(align - 1);
        pool = reinterpret_cast<char*>(aligned);
    }
    
    ~AlignedMemoryPool() {
        ::operator delete(pool);
    }
    
    void* allocate(size_t size) {
        if (offset + size > poolSize) {
            return nullptr;  // 内存不足
        }
        
        void* ptr = pool + offset;
        offset += size;
        
        // 确保分配的内存对齐
        uintptr_t addr = reinterpret_cast<uintptr_t>(ptr);
        if (addr % alignment != 0) {
            // 调整到下一个对齐边界
            offset += alignment - (addr % alignment);
            ptr = pool + offset;
            offset += size;
        }
        
        return ptr;
    }
    
    void deallocate(void* ptr) {
        // 简单实现：不支持单独释放
    }
    
    void reset() {
        offset = 0;
    }
    
    static bool isAligned(void* ptr, size_t align) {
        uintptr_t addr = reinterpret_cast<uintptr_t>(ptr);
        return (addr % align) == 0;
    }
};

int main() {
    std::cout << "=== 对齐内存池测试 ===" << std::endl;
    
    // 创建16字节对齐的内存池
    AlignedMemoryPool pool(1024, 16);
    
    // 分配不同大小的内存块
    int* p1 = static_cast<int*>(pool.allocate(sizeof(int)));
    double* p2 = static_cast<double*>(pool.allocate(sizeof(double)));
    char* p3 = static_cast<char*>(pool.allocate(32));
    
    // 检查对齐
    std::cout << "p1对齐: " << (AlignedMemoryPool::isAligned(p1, 16) ? "是" : "否") << std::endl;
    std::cout << "p2对齐: " << (AlignedMemoryPool::isAligned(p2, 16) ? "是" : "否") << std::endl;
    std::cout << "p3对齐: " << (AlignedMemoryPool::isAligned(p3, 16) ? "是" : "否") << std::endl;
    
    // 使用内存
    *p1 = 42;
    *p2 = 3.14159;
    std::strcpy(p3, "Hello, Aligned Memory!");
    
    std::cout << "p1值: " << *p1 << std::endl;
    std::cout << "p2值: " << *p2 << std::endl;
    std::cout << "p3值: " << p3 << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'alignof(char)的返回值通常是？',
                    options: ['0', '1', '2', '4'],
                    correct: 1,
                    explanation: 'char类型通常只需要1字节对齐，因为它的长度就是1字节。'
                },
                {
                    question: '以下哪个声明创建了一个16字节对齐的变量？',
                    options: ['int x alignas(16);', 'alignas(16) int x;', 'int alignas(16) x;', 'alignas int x(16);'],
                    correct: 1,
                    explanation: 'alignas放在类型前面，用于指定变量的对齐要求。'
                },
                {
                    question: '为什么需要内存对齐？',
                    options: ['只是为了节省内存', '提高硬件访问效率和兼容性', '增加程序复杂度', '编译器要求'],
                    correct: 1,
                    explanation: '内存对齐可以提高CPU访问内存的效率，某些硬件和SIMD指令要求特定对齐。'
                },
                {
                    question: '以下结构体的大小可能是多少？struct { char a; int b; };',
                    options: ['5 bytes', '8 bytes', '6 bytes', '4 bytes'],
                    correct: 1,
                    explanation: 'char占1字节，然后有3字节填充，int占4字节，总共8字节。'
                },
                {
                    question: 'alignas(8) char c; 对c的大小有什么影响？',
                    options: ['大小变为8字节', '大小不变，但对齐要求变为8字节', '编译错误', '大小变为1字节'],
                    correct: 1,
                    explanation: 'alignas只影响对齐要求，不改变变量本身的大小。char仍然是1字节，但对齐要求变为8字节。'
                }
            ],
            references: [
                {
                    title: 'cppreference - alignof',
                    url: 'https://en.cppreference.com/w/cpp/language/alignof'
                },
                {
                    title: 'cppreference - alignas',
                    url: 'https://en.cppreference.com/w/cpp/language/alignas'
                }
            ],
            assistantTips: '内存对齐是性能优化的重要手段。理解alignof和alignas可以帮助你编写更高效的代码，特别是在SIMD编程和高性能计算场景中。'
        },
        {
            id: '26.3',
            title: '对象构造与析构的精确时间',
            duration: '40分钟',
            difficulty: '高级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 对象构造与析构的精确时间

理解对象构造和析构的精确时间对于资源管理和性能优化至关重要。

### 构造时机

#### 1. 自动存储对象

自动存储对象在定义点构造，在作用域结束时析构：

\`\`\`cpp
void func() {
    int x = 10;           // 构造时机：执行到此行
    std::string s = "hi"; // 构造时机：执行到此行
    
    if (true) {
        int y = 20;       // 构造时机：进入if块
    }                     // 析构时机：离开if块，y被析构
    
}  // 析构时机：离开函数，x和s被析构（逆序）
\`\`\`

#### 2. 静态存储对象

静态存储对象的构造和析构时机：

\`\`\`cpp
// 全局对象
GlobalObject globalObj;  // main()之前构造，main()之后析构

void func() {
    static StaticObject obj;  // 第一次调用时构造，程序结束时析构
}

int main() {
    func();  // obj构造
    func();  // obj已存在，不再次构造
    return 0;
}  // 程序结束时obj析构
\`\`\`

#### 3. 动态存储对象

动态存储对象使用new和delete控制：

\`\`\`cpp
Object* obj = new Object;  // 构造时机：new时
delete obj;                // 析构时机：delete时

Object* arr = new Object[10];  // 构造时机：new[]时
delete[] arr;                   // 析构时机：delete[]时
\`\`\`

#### 4. 成员对象

成员对象的构造顺序：

\`\`\`cpp
class Container {
    Member1 m1;  // 先构造
    Member2 m2;  // 后构造
    
public:
    Container() : m2(), m1() {  // 初始化列表顺序不影响
        // m1和m2已构造完成
    }
    
    ~Container() {
        // 析构函数体执行
    }
    // m2先析构
    // m1后析构
};
\`\`\`

**重要规则**：成员构造顺序由声明顺序决定，与初始化列表顺序无关。

#### 5. 基类对象

继承关系中的构造顺序：

\`\`\`cpp
class Base {
public:
    Base() { std::cout << "Base构造\\n"; }
    ~Base() { std::cout << "Base析构\\n"; }
};

class Derived : public Base {
public:
    Derived() { std::cout << "Derived构造\\n"; }
    ~Derived() { std::cout << "Derived析构\\n"; }
};

// 创建Derived对象时：
// 1. Base构造
// 2. Derived构造
// 析构时：
// 1. Derived析构
// 2. Base析构
\`\`\`

### 析构时机

#### 1. 自动析构

作用域结束时自动析构：

\`\`\`cpp
{
    Object obj;  // 构造
    // ...
}  // 析构
\`\`\`

#### 2. 异常安全

异常抛出时会自动析构已构造的对象：

\`\`\`cpp
void func() {
    Object obj1;  // 构造
    Object obj2;  // 构造
    
    throw std::runtime_error("error");
    
    // obj2析构
    // obj1析构
}
\`\`\`

#### 3. 手动析构

使用placement new时需要手动析构：

\`\`\`cpp
#include <new>

char buffer[sizeof(Object)];

Object* obj = new (buffer) Object();  // placement new
obj->~Object();  // 手动析构
\`\`\`

### 构造/析构顺序规则

1. **继承层次**：基类 → 成员 → 派生类
2. **成员顺序**：按声明顺序
3. **析构顺序**：与构造顺序相反

\`\`\`cpp
class A { 
public: 
    A() { std::cout << "A\\n"; } 
    ~A() { std::cout << "~A\\n"; } 
};

class B { 
public: 
    B() { std::cout << "B\\n"; } 
    ~B() { std::cout << "~B\\n"; } 
};

class C : public A {
    B b;
public:
    C() { std::cout << "C\\n"; }
    ~C() { std::cout << "~C\\n"; }
};

int main() {
    C c;
    // 输出: A B C
    // 析构: ~C ~B ~A
}
\`\`\`

### 临时对象的生命周期

#### 1. 表达式结束

临时对象通常在完整表达式结束时析构：

\`\`\`cpp
std::string s = std::string("hello") + " world";
// 临时string("hello")在语句结束时析构
\`\`\`

#### 2. 绑定到const引用

绑定到const引用时，生命周期延长：

\`\`\`cpp
const std::string& ref = std::string("hello");
// 临时对象的生命周期延长到ref的作用域结束
\`\`\`

#### 3. 绑定到非const引用

不能绑定临时对象到非const引用（C++11之前）：

\`\`\`cpp
// std::string& ref = std::string("hello");  // 错误
const std::string& ref = std::string("hello");  // 正确
\`\`\`

### 静态初始化顺序问题

#### 问题

多个编译单元中的全局对象初始化顺序未定义：

\`\`\`cpp
// file1.cpp
FileLogger logger;  // 全局对象

// file2.cpp
class Config {
    Config() {
        logger.log("Config created");  // 可能logger还未初始化！
    }
} config;  // 另一个全局对象
\`\`\`

#### 解决方案：构造首次使用

\`\`\`cpp
FileLogger& getLogger() {
    static FileLogger logger;  // 第一次调用时构造
    return logger;
}

// 使用
getLogger().log("message");
\`\`\`

### 对象生命周期图解

\`\`\`
构造顺序：
全局对象 → 静态对象 → main() → 自动对象 → 动态对象

析构顺序（逆序）：
动态对象 → 自动对象 → main()结束 → 静态对象 → 全局对象
\`\`\`

### 最佳实践

1. **使用RAII**：让对象管理资源
2. **避免全局对象依赖**
3. **使用智能指针管理动态对象**
4. **理解构造/析构顺序**
5. **注意临时对象生命周期**`,
            examples: [
                {
                    title: '构造与析构顺序',
                    code: `#include <iostream>
#include <string>

class Member {
    std::string name;
public:
    Member(const std::string& n) : name(n) {
        std::cout << "Member " << name << " 构造" << std::endl;
    }
    ~Member() {
        std::cout << "Member " << name << " 析构" << std::endl;
    }
};

class Base {
public:
    Base() { std::cout << "Base 构造" << std::endl; }
    virtual ~Base() { std::cout << "Base 析构" << std::endl; }
};

class Derived : public Base {
    Member m1;  // 先声明
    Member m2;  // 后声明
    
public:
    // 初始化列表顺序不影响构造顺序
    Derived() : m2("m2"), m1("m1") {
        std::cout << "Derived 构造" << std::endl;
    }
    
    ~Derived() {
        std::cout << "Derived 析构" << std::endl;
    }
};

void testAutoObjects() {
    std::cout << "\\n=== 自动对象测试 ===" << std::endl;
    
    std::cout << "进入外层块" << std::endl;
    Member outer("outer");
    
    {
        std::cout << "进入内层块" << std::endl;
        Member inner("inner");
        std::cout << "离开内层块" << std::endl;
    }
    
    std::cout << "离开外层块" << std::endl;
}

void testExceptionSafety() {
    std::cout << "\\n=== 异常安全测试 ===" << std::endl;
    
    try {
        Member obj1("obj1");
        Member obj2("obj2");
        
        std::cout << "抛出异常" << std::endl;
        throw std::runtime_error("test exception");
    }
    catch (const std::exception& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
    }
}

int main() {
    std::cout << "=== 继承与成员构造顺序 ===" << std::endl;
    {
        Derived d;
    }
    
    testAutoObjects();
    testExceptionSafety();
    
    std::cout << "\\n=== 临时对象生命周期 ===" << std::endl;
    {
        const Member& ref = Member("temp");
        std::cout << "临时对象绑定到const引用" << std::endl;
        std::cout << "离开作用域" << std::endl;
    }
    
    return 0;
}`
                },
                {
                    title: '静态初始化与placement new',
                    code: `#include <iostream>
#include <new>
#include <string>

class Resource {
    std::string name;
public:
    Resource(const std::string& n) : name(n) {
        std::cout << "Resource " << name << " 构造" << std::endl;
    }
    ~Resource() {
        std::cout << "Resource " << name << " 析构" << std::endl;
    }
    
    void use() {
        std::cout << "使用 Resource " << name << std::endl;
    }
};

// 全局对象
Resource globalRes("global");

// 函数静态对象
Resource& getStaticResource() {
    static Resource staticRes("static-local");
    return staticRes;
}

void demonstrateStaticInit() {
    std::cout << "\\n=== 静态初始化 ===" << std::endl;
    
    std::cout << "第一次调用 getStaticResource()" << std::endl;
    getStaticResource().use();
    
    std::cout << "\\n第二次调用 getStaticResource()" << std::endl;
    getStaticResource().use();
}

void demonstratePlacementNew() {
    std::cout << "\\n=== Placement New ===" << std::endl;
    
    // 分配原始内存
    char buffer[sizeof(Resource)];
    
    std::cout << "使用 placement new 在 buffer 中构造对象" << std::endl;
    Resource* res = new (buffer) Resource("placement");
    
    res->use();
    
    std::cout << "手动调用析构函数" << std::endl;
    res->~Resource();
    
    std::cout << "buffer 内存仍在，但对象已析构" << std::endl;
}

void demonstrateArrayConstruction() {
    std::cout << "\\n=== 数组构造与析构 ===" << std::endl;
    
    std::cout << "创建对象数组" << std::endl;
    Resource* arr = new Resource[3]{
        Resource("arr0"),
        Resource("arr1"),
        Resource("arr2")
    };
    
    std::cout << "\\n删除对象数组" << std::endl;
    delete[] arr;
}

int main() {
    std::cout << "=== main() 开始 ===" << std::endl;
    
    demonstrateStaticInit();
    demonstratePlacementNew();
    demonstrateArrayConstruction();
    
    std::cout << "\\n=== main() 结束 ===" << std::endl;
    
    return 0;
}

// 程序结束时：
// static-local 析构
// global 析构`
                }
            ],
            handsOn: {
                title: '实现对象生命周期跟踪器',
                description: '实现一个跟踪对象构造和析构的工具类。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>

// 对象生命周期跟踪器
class ObjectTracker {
private:
    // TODO: 定义静态成员来跟踪所有对象
    
public:
    // TODO: 构造函数，记录对象创建
    // ObjectTracker(const std::string& name)
    
    // TODO: 拷贝构造函数
    // ObjectTracker(const ObjectTracker& other)
    
    // TODO: 析构函数，记录对象销毁
    
    // TODO: 静态方法：获取当前存活对象数量
    // static size_t getAliveCount()
    
    // TODO: 静态方法：打印所有存活对象
    // static void printAliveObjects()
    
    // TODO: 获取对象名称
    // const std::string& getName() const
};

// TODO: 定义静态成员

class TestClass {
    ObjectTracker tracker;
public:
    // TODO: 构造函数
    
    // TODO: 析构函数
};

int main() {
    // TODO: 测试对象生命周期跟踪
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

class ObjectTracker {
private:
    std::string name;
    static std::vector<ObjectTracker*> aliveObjects;
    
public:
    ObjectTracker(const std::string& n) : name(n) {
        aliveObjects.push_back(this);
        std::cout << "构造: " << name 
                  << " (存活对象: " << aliveObjects.size() << ")" << std::endl;
    }
    
    ObjectTracker(const ObjectTracker& other) : name(other.name + "_copy") {
        aliveObjects.push_back(this);
        std::cout << "拷贝构造: " << name 
                  << " (存活对象: " << aliveObjects.size() << ")" << std::endl;
    }
    
    ~ObjectTracker() {
        auto it = std::find(aliveObjects.begin(), aliveObjects.end(), this);
        if (it != aliveObjects.end()) {
            aliveObjects.erase(it);
        }
        std::cout << "析构: " << name 
                  << " (存活对象: " << aliveObjects.size() << ")" << std::endl;
    }
    
    static size_t getAliveCount() {
        return aliveObjects.size();
    }
    
    static void printAliveObjects() {
        std::cout << "存活对象列表:" << std::endl;
        for (const auto* obj : aliveObjects) {
            std::cout << "  - " << obj->name << std::endl;
        }
    }
    
    const std::string& getName() const {
        return name;
    }
};

std::vector<ObjectTracker*> ObjectTracker::aliveObjects;

class TestClass {
    ObjectTracker tracker;
public:
    TestClass(const std::string& name) : tracker(name) {
        std::cout << "TestClass " << name << " 构造完成" << std::endl;
    }
    
    ~TestClass() {
        std::cout << "TestClass " << tracker.getName() << " 析构开始" << std::endl;
    }
};

int main() {
    std::cout << "=== 对象生命周期跟踪测试 ===" << std::endl;
    
    {
        TestClass obj1("obj1");
        ObjectTracker::printAliveObjects();
        
        {
            TestClass obj2("obj2");
            ObjectTracker::printAliveObjects();
        }
        
        std::cout << "\\nobj2 已析构" << std::endl;
        ObjectTracker::printAliveObjects();
    }
    
    std::cout << "\\nobj1 已析构" << std::endl;
    std::cout << "当前存活对象数: " << ObjectTracker::getAliveCount() << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下代码中，成员对象的构造顺序是？class A { B b; C c; public: A() : c(), b() {} };',
                    options: ['b先构造，c后构造', 'c先构造，b后构造', '同时构造', '取决于编译器'],
                    correct: 0,
                    explanation: '成员对象的构造顺序由声明顺序决定，与初始化列表顺序无关。b先声明，所以b先构造。'
                },
                {
                    question: '临时对象绑定到const引用后，其生命周期如何？',
                    options: ['立即析构', '延长到引用的作用域结束', '延长到程序结束', '不变'],
                    correct: 1,
                    explanation: '临时对象绑定到const引用时，其生命周期会延长到引用的作用域结束。'
                },
                {
                    question: '使用placement new创建的对象应该如何销毁？',
                    options: ['使用delete', '使用delete[]', '手动调用析构函数', '自动析构'],
                    correct: 2,
                    explanation: 'placement new在已有内存上构造对象，需要手动调用析构函数来销毁对象，但不能使用delete。'
                },
                {
                    question: '抛出异常时，已构造的自动对象会怎样？',
                    options: ['不会析构', '按构造顺序析构', '按构造逆序析构', '导致未定义行为'],
                    correct: 2,
                    explanation: '异常抛出时，会自动析构已构造的对象，析构顺序与构造顺序相反（栈展开）。'
                },
                {
                    question: '静态局部变量何时构造？',
                    options: ['程序开始时', '第一次执行到定义时', 'main函数之前', '编译时'],
                    correct: 1,
                    explanation: '静态局部变量在第一次执行到其定义时构造，之后不再构造。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Constructor',
                    url: 'https://en.cppreference.com/w/cpp/language/constructor'
                },
                {
                    title: 'cppreference - Destructor',
                    url: 'https://en.cppreference.com/w/cpp/language/destructor'
                }
            ],
            assistantTips: '理解对象生命周期是C++资源管理的基础。记住：构造顺序是基类→成员→派生类，析构顺序相反。使用RAII可以让资源管理更安全。'
        },
        {
            id: '26.4',
            title: '平凡类型、POD 与标准布局',
            duration: '40分钟',
            difficulty: '高级',
            xp: 190,
            estimatedXp: 380,
            concepts: `## 平凡类型、POD 与标准布局

C++对类型进行了细致的分类，理解这些分类对于底层编程、序列化和性能优化非常重要。

### 类型分类概述

C++11引入了以下类型分类：

1. **平凡类型（Trivial Type）**
2. **标准布局类型（Standard Layout Type）**
3. **POD类型（Plain Old Data）**

### 平凡类型（Trivial Type）

平凡类型具有以下特征：

#### 平凡的特殊成员函数

- 平凡默认构造函数
- 平凡拷贝构造函数
- 平凡移动构造函数
- 平凡拷贝赋值运算符
- 平凡移动赋值运算符
- 平凡析构函数

#### 平凡类型的条件

\`\`\`cpp
// 平凡类型示例
struct TrivialType {
    int x;
    double y;
};

// 非平凡类型示例
struct NonTrivialType {
    int x;
    NonTrivialType() : x(0) {}  // 用户定义的构造函数
    virtual void foo() {}       // 虚函数
};
\`\`\`

#### 平凡类型的特点

1. 可以用memcpy安全复制
2. 可以用memset清零
3. 可以在不同编译单元间传递
4. 兼容C语言

\`\`\`cpp
#include <type_traits>

struct Trivial {
    int a;
    double b;
};

static_assert(std::is_trivial_v<Trivial>, "Trivial should be trivial");

struct NonTrivial {
    int a;
    NonTrivial() {}  // 用户定义的构造函数
};

static_assert(!std::is_trivial_v<NonTrivial>, "NonTrivial should not be trivial");
\`\`\`

### 标准布局类型（Standard Layout Type）

标准布局类型具有与C兼容的内存布局。

#### 标准布局的条件

1. 所有非静态成员具有相同的访问控制
2. 没有虚函数或虚基类
3. 所有非静态成员都是标准布局
4. 没有多个基类包含相同类型的成员

\`\`\`cpp
// 标准布局类型
struct StandardLayout {
    int x;
    double y;
};

// 非标准布局类型
struct NonStandardLayout {
public:
    int x;
private:
    double y;  // 不同访问控制
};
\`\`\`

#### 检查标准布局

\`\`\`cpp
#include <type_traits>

struct StandardLayout {
    int x;
    double y;
};

static_assert(std::is_standard_layout_v<StandardLayout>);

struct NonStandardLayout {
public:
    int x;
private:
    double y;
};

static_assert(!std::is_standard_layout_v<NonStandardLayout>);
\`\`\`

### POD类型（Plain Old Data）

POD类型同时是平凡类型和标准布局类型。

#### POD类型的条件

\`\`\`cpp
// POD类型
struct PODType {
    int x;
    double y;
};

static_assert(std::is_pod_v<PODType>);  // C++20中is_pod被弃用

// 非POD类型
struct NonPOD {
    int x;
    NonPOD() : x(0) {}  // 用户定义的构造函数
};
\`\`\`

#### C++20的变化

C++20弃用了std::is_pod，建议分别使用：

- std::is_trivial
- std::is_standard_layout

\`\`\`cpp
// C++20推荐方式
template<typename T>
constexpr bool is_pod_v = std::is_trivial_v<T> && std::is_standard_layout_v<T>;
\`\`\`

### 类型特征（Type Traits）

#### 常用类型特征

\`\`\`cpp
#include <type_traits>

// 平凡类型检查
std::is_trivial_v<T>
std::is_trivially_default_constructible_v<T>
std::is_trivially_copy_constructible_v<T>
std::is_trivially_move_constructible_v<T>
std::is_trivially_copy_assignable_v<T>
std::is_trivially_move_assignable_v<T>
std::is_trivially_destructible_v<T>

// 标准布局检查
std::is_standard_layout_v<T>

// POD检查（C++20弃用）
std::is_pod_v<T>

// 聚合类型检查
std::is_aggregate_v<T>
\`\`\`

### 实际应用

#### 1. 序列化

POD类型可以直接序列化：

\`\`\`cpp
template<typename T>
void serialize(std::ostream& os, const T& obj) {
    static_assert(std::is_trivially_copyable_v<T>);
    os.write(reinterpret_cast<const char*>(&obj), sizeof(T));
}

template<typename T>
T deserialize(std::istream& is) {
    static_assert(std::is_trivially_copyable_v<T>);
    T obj;
    is.read(reinterpret_cast<char*>(&obj), sizeof(T));
    return obj;
}
\`\`\`

#### 2. 内存操作

平凡类型可以安全使用memcpy：

\`\`\`cpp
template<typename T>
void safeCopy(T* dest, const T* src) {
    static_assert(std::is_trivially_copyable_v<T>);
    std::memcpy(dest, src, sizeof(T));
}
\`\`\`

#### 3. 与C交互

标准布局类型可以与C代码交互：

\`\`\`cpp
// C++代码
struct alignas(16) Vector {
    float x, y, z, w;
};

static_assert(std::is_standard_layout_v<Vector>);

// 可以安全传递给C函数
extern "C" void processVector(const Vector* v);
\`\`\`

### 聚合类型（Aggregate Type）

聚合类型是一种特殊的类型，可以使用花括号初始化。

#### 聚合类型的条件

1. 数组类型，或
2. 满足以下条件的类类型：
   - 没有用户声明的构造函数（C++11-17）/ 没有用户提供的构造函数（C++20）
   - 没有私有或保护的非静态数据成员
   - 没有虚函数
   - 没有虚基类

\`\`\`cpp
// 聚合类型
struct Aggregate {
    int x;
    double y;
};

Aggregate a{10, 3.14};  // 聚合初始化

// 非聚合类型
struct NonAggregate {
    int x;
    NonAggregate(int v) : x(v) {}  // 用户定义的构造函数
};
\`\`\`

### 类型分类总结

| 类型 | 平凡 | 标准布局 | POD | 特点 |
|------|------|----------|-----|------|
| int | ✓ | ✓ | ✓ | 基本类型 |
| 普通struct | ✓ | ✓ | ✓ | 无构造函数、虚函数 |
| 带构造函数的struct | ✗ | ✓ | ✗ | 标准布局但非平凡 |
| 带虚函数的struct | ✗ | ✗ | ✗ | 都不是 |
| 带不同访问控制的struct | ✓ | ✗ | ✗ | 平凡但非标准布局 |

### 最佳实践

1. **需要序列化**：使用平凡类型
2. **需要与C交互**：使用标准布局类型
3. **两者都需要**：使用POD类型
4. **性能关键**：优先使用平凡类型
5. **C++20及以后**：分别检查平凡和标准布局`,
            examples: [
                {
                    title: '类型特征检查',
                    code: `#include <iostream>
#include <type_traits>

// 平凡类型
struct TrivialType {
    int x;
    double y;
};

// 非平凡类型（有用户定义的构造函数）
struct NonTrivialType {
    int x;
    NonTrivialType() : x(0) {}
};

// 标准布局类型
struct StandardLayoutType {
    int x;
    double y;
};

// 非标准布局类型（不同访问控制）
struct NonStandardLayoutType {
public:
    int x;
private:
    double y;
};

// POD类型
struct PODType {
    int x;
    double y;
};

// 非POD类型
struct NonPODType {
    int x;
    virtual void foo() {}
};

// 聚合类型
struct AggregateType {
    int x;
    double y;
};

void printTypeInfo(const std::string& name) {
    std::cout << "\\n=== " << name << " ===" << std::endl;
}

template<typename T>
void analyzeType(const std::string& name) {
    std::cout << "\\n=== " << name << " ===" << std::endl;
    std::cout << "is_trivial: " << std::is_trivial_v<T> << std::endl;
    std::cout << "is_standard_layout: " << std::is_standard_layout_v<T> << std::endl;
    std::cout << "is_pod: " << std::is_pod_v<T> << std::endl;
    std::cout << "is_aggregate: " << std::is_aggregate_v<T> << std::endl;
    std::cout << "is_trivially_copyable: " << std::is_trivially_copyable_v<T> << std::endl;
    std::cout << "is_trivially_default_constructible: " 
              << std::is_trivially_default_constructible_v<T> << std::endl;
    std::cout << "is_trivially_destructible: " 
              << std::is_trivially_destructible_v<T> << std::endl;
}

int main() {
    std::cout << "=== 类型特征分析 ===" << std::endl;
    
    analyzeType<TrivialType>("TrivialType");
    analyzeType<NonTrivialType>("NonTrivialType");
    analyzeType<StandardLayoutType>("StandardLayoutType");
    analyzeType<NonStandardLayoutType>("NonStandardLayoutType");
    analyzeType<PODType>("PODType");
    analyzeType<NonPODType>("NonPODType");
    analyzeType<AggregateType>("AggregateType");
    
    // 基本类型
    analyzeType<int>("int");
    analyzeType<double>("double");
    analyzeType<int[10]>("int[10]");
    
    return 0;
}`
                },
                {
                    title: 'POD类型应用',
                    code: `#include <iostream>
#include <type_traits>
#include <cstring>
#include <fstream>

// POD结构体 - 可以安全序列化
struct alignas(16) Particle {
    float x, y, z;    // 位置
    float vx, vy, vz; // 速度
    float mass;
    float padding;    // 对齐填充
};

static_assert(std::is_trivially_copyable_v<Particle>, 
              "Particle must be trivially copyable");
static_assert(std::is_standard_layout_v<Particle>, 
              "Particle must be standard layout");

// 序列化函数
template<typename T>
void serialize(std::ostream& os, const T& obj) {
    static_assert(std::is_trivially_copyable_v<T>,
                  "Type must be trivially copyable for serialization");
    os.write(reinterpret_cast<const char*>(&obj), sizeof(T));
}

// 反序列化函数
template<typename T>
T deserialize(std::istream& is) {
    static_assert(std::is_trivially_copyable_v<T>,
                  "Type must be trivially copyable for deserialization");
    T obj;
    is.read(reinterpret_cast<char*>(&obj), sizeof(T));
    return obj;
}

// 安全内存复制
template<typename T>
void safeMemCopy(T* dest, const T* src) {
    static_assert(std::is_trivially_copyable_v<T>,
                  "Type must be trivially copyable for memcpy");
    std::memcpy(dest, src, sizeof(T));
}

// 与C交互示例
extern "C" {
    struct CVector {
        float x, y, z;
    };
    
    void processVector(CVector* v) {
        v->x *= 2;
        v->y *= 2;
        v->z *= 2;
    }
}

// C++包装
struct Vector : CVector {
    float length() const {
        return std::sqrt(x*x + y*y + z*z);
    }
};

static_assert(std::is_standard_layout_v<Vector>,
              "Vector must be standard layout for C compatibility");

int main() {
    std::cout << "=== POD类型应用 ===" << std::endl;
    
    // 创建粒子
    Particle p1{1.0f, 2.0f, 3.0f, 0.1f, 0.2f, 0.3f, 1.0f, 0.0f};
    
    // 安全复制
    Particle p2;
    safeMemCopy(&p2, &p1);
    
    std::cout << "p1: (" << p1.x << ", " << p1.y << ", " << p1.z << ")" << std::endl;
    std::cout << "p2: (" << p2.x << ", " << p2.y << ", " << p2.z << ")" << std::endl;
    
    // 与C交互
    Vector v{1.0f, 2.0f, 3.0f};
    std::cout << "\\n原始向量长度: " << v.length() << std::endl;
    
    processVector(&v);
    std::cout << "处理后向量长度: " << v.length() << std::endl;
    
    // 聚合初始化
    Particle particles[] = {
        {0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f},
        {1.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 0.0f},
        {0.0f, 1.0f, 0.0f, 0.0f, 0.0f, 1.0f, 1.0f, 0.0f}
    };
    
    std::cout << "\\n粒子数组大小: " << sizeof(particles) << " bytes" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现类型安全的序列化系统',
                description: '实现一个只对POD类型工作的序列化系统。',
                initialCode: `#include <iostream>
#include <type_traits>
#include <cstring>
#include <vector>

// TODO: 实现类型检查辅助函数
// template<typename T>
// constexpr bool is_serializable_v = ...

// TODO: 实现序列化函数
// template<typename T>
// std::vector<char> serialize(const T& obj)

// TODO: 实现反序列化函数
// template<typename T>
// T deserialize(const std::vector<char>& data)

// 测试结构体
struct Point {
    float x, y, z;
};

struct NonSerializable {
    int x;
    NonSerializable() : x(0) {}  // 用户定义的构造函数
};

int main() {
    // TODO: 测试序列化系统
    
    // 测试POD类型
    
    // 测试非POD类型（应该编译失败）
    
    return 0;
}`,
                solution: `#include <iostream>
#include <type_traits>
#include <cstring>
#include <vector>
#include <stdexcept>

// 类型检查
template<typename T>
constexpr bool is_serializable_v = std::is_trivially_copyable_v<T> && 
                                     std::is_standard_layout_v<T>;

// 序列化函数
template<typename T>
std::vector<char> serialize(const T& obj) {
    static_assert(is_serializable_v<T>, 
                  "Type must be trivially copyable and standard layout");
    
    std::vector<char> data(sizeof(T));
    std::memcpy(data.data(), &obj, sizeof(T));
    return data;
}

// 反序列化函数
template<typename T>
T deserialize(const std::vector<char>& data) {
    static_assert(is_serializable_v<T>, 
                  "Type must be trivially copyable and standard layout");
    
    if (data.size() != sizeof(T)) {
        throw std::runtime_error("Data size mismatch");
    }
    
    T obj;
    std::memcpy(&obj, data.data(), sizeof(T));
    return obj;
}

// 测试结构体
struct Point {
    float x, y, z;
};

struct NonSerializable {
    int x;
    NonSerializable() : x(0) {}
};

int main() {
    std::cout << "=== 类型安全序列化系统 ===" << std::endl;
    
    // 测试POD类型
    Point p1{1.0f, 2.0f, 3.0f};
    std::cout << "原始点: (" << p1.x << ", " << p1.y << ", " << p1.z << ")" << std::endl;
    
    // 序列化
    auto data = serialize(p1);
    std::cout << "序列化后大小: " << data.size() << " bytes" << std::endl;
    
    // 反序列化
    Point p2 = deserialize<Point>(data);
    std::cout << "反序列化后: (" << p2.x << ", " << p2.y << ", " << p2.z << ")" << std::endl;
    
    // 类型检查
    std::cout << "\\n类型检查:" << std::endl;
    std::cout << "Point is_serializable: " << is_serializable_v<Point> << std::endl;
    std::cout << "NonSerializable is_serializable: " << is_serializable_v<NonSerializable> << std::endl;
    
    // 以下代码会编译失败
    // NonSerializable ns;
    // auto data2 = serialize(ns);
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪个是平凡类型的特征？',
                    options: ['有虚函数', '有用户定义的构造函数', '可以用memcpy安全复制', '有私有成员'],
                    correct: 2,
                    explanation: '平凡类型可以用memcpy安全复制，因为没有用户定义的特殊成员函数和虚函数。'
                },
                {
                    question: '标准布局类型的主要用途是什么？',
                    options: ['提高性能', '与C语言交互', '支持多态', '实现继承'],
                    correct: 1,
                    explanation: '标准布局类型具有与C兼容的内存布局，可以安全地与C代码交互。'
                },
                {
                    question: 'POD类型必须同时满足什么条件？',
                    options: ['是聚合类型和标准布局类型', '是平凡类型和标准布局类型', '是平凡类型和聚合类型', '有默认构造函数'],
                    correct: 1,
                    explanation: 'POD类型必须同时是平凡类型和标准布局类型。'
                },
                {
                    question: '以下哪个结构体是POD类型？',
                    options: ['struct A { int x; A() {} };', 'struct B { int x; virtual void f() {} };', 'struct C { int x; double y; };', 'struct D { int x; private: int y; };'],
                    correct: 2,
                    explanation: 'struct C没有用户定义的构造函数、虚函数，且所有成员都是public，所以是POD类型。'
                },
                {
                    question: 'C++20中std::is_pod被弃用，应该使用什么替代？',
                    options: ['std::is_trivial', 'std::is_standard_layout', '两者分别检查', 'std::is_aggregate'],
                    correct: 2,
                    explanation: 'C++20建议分别使用std::is_trivial和std::is_standard_layout来检查类型特性。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Type traits',
                    url: 'https://en.cppreference.com/w/cpp/types'
                },
                {
                    title: 'cppreference - is_trivial',
                    url: 'https://en.cppreference.com/w/cpp/types/is_trivial'
                }
            ],
            assistantTips: '理解POD类型对于底层编程、序列化和与C交互非常重要。记住：POD = 平凡 + 标准布局。C++20后建议分别检查这两个特性。'
        },
        {
            id: '26.5',
            title: '内存池与自定义 new/delete 重载',
            duration: '45分钟',
            difficulty: '高级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 内存池与自定义 new/delete 重载

自定义内存管理和内存池可以显著提高程序性能，特别是在频繁分配释放的场景中。

### 全局 new/delete 重载

#### 基本重载

\`\`\`cpp
#include <iostream>
#include <cstdlib>

// 全局 new 重载
void* operator new(std::size_t size) {
    std::cout << "全局 new: " << size << " bytes" << std::endl;
    void* ptr = std::malloc(size);
    if (!ptr) throw std::bad_alloc();
    return ptr;
}

// 全局 delete 重载
void operator delete(void* ptr) noexcept {
    std::cout << "全局 delete" << std::endl;
    std::free(ptr);
}

// C++17: 对齐版本
void* operator new(std::size_t size, std::align_val_t align) {
    std::cout << "对齐 new: " << size << " bytes, 对齐: " 
              << static_cast<size_t>(align) << std::endl;
    void* ptr = std::aligned_alloc(static_cast<size_t>(align), size);
    if (!ptr) throw std::bad_alloc();
    return ptr;
}

void operator delete(void* ptr, std::align_val_t) noexcept {
    std::free(ptr);
}
\`\`\`

#### 带异常处理的版本

\`\`\`cpp
// nothrow 版本
void* operator new(std::size_t size, const std::nothrow_t&) noexcept {
    return std::malloc(size);
}

void operator delete(void* ptr, const std::nothrow_t&) noexcept {
    std::free(ptr);
}
\`\`\`

### 类级别 new/delete 重载

#### 成员函数重载

\`\`\`cpp
class MyClass {
public:
    // 类级别 new
    static void* operator new(std::size_t size) {
        std::cout << "MyClass::new " << size << " bytes" << std::endl;
        return ::operator new(size);
    }
    
    // 类级别 delete
    static void operator delete(void* ptr) {
        std::cout << "MyClass::delete" << std::endl;
        ::operator delete(ptr);
    }
    
    // 数组版本
    static void* operator new[](std::size_t size) {
        std::cout << "MyClass::new[] " << size << " bytes" << std::endl;
        return ::operator new(size);
    }
    
    static void operator delete[](void* ptr) {
        std::cout << "MyClass::delete[]" << std::endl;
        ::operator delete(ptr);
    }
};
\`\`\`

### 内存池实现

#### 简单内存池

\`\`\`cpp
#include <vector>
#include <cstddef>

class MemoryPool {
private:
    struct Block {
        Block* next;
    };
    
    std::vector<void*> chunks;
    Block* freeList;
    size_t blockSize;
    size_t chunkSize;
    
public:
    MemoryPool(size_t blockSz, size_t chunkSz = 1024)
        : blockSize(blockSz), chunkSize(chunkSz), freeList(nullptr) {}
    
    ~MemoryPool() {
        for (void* chunk : chunks) {
            ::operator delete(chunk);
        }
    }
    
    void* allocate() {
        if (!freeList) {
            // 分配新块
            char* chunk = static_cast<char*>(::operator new(blockSize * chunkSize));
            chunks.push_back(chunk);
            
            // 构建空闲链表
            for (size_t i = 0; i < chunkSize; i++) {
                Block* block = reinterpret_cast<Block*>(chunk + i * blockSize);
                block->next = freeList;
                freeList = block;
            }
        }
        
        Block* block = freeList;
        freeList = freeList->next;
        return block;
    }
    
    void deallocate(void* ptr) {
        Block* block = static_cast<Block*>(ptr);
        block->next = freeList;
        freeList = block;
    }
};
\`\`\`

#### 使用内存池的类

\`\`\`cpp
class PooledObject {
    static MemoryPool pool;
    
public:
    static void* operator new(size_t size) {
        if (size != sizeof(PooledObject)) {
            return ::operator new(size);
        }
        return pool.allocate();
    }
    
    static void operator delete(void* ptr) {
        pool.deallocate(ptr);
    }
};

MemoryPool PooledObject::pool(sizeof(PooledObject));
\`\`\`

### 对象池模式

\`\`\`cpp
#include <memory>
#include <stack>

template<typename T>
class ObjectPool {
private:
    std::stack<std::unique_ptr<T>> pool;
    size_t maxSize;
    
public:
    ObjectPool(size_t max = 100) : maxSize(max) {}
    
    template<typename... Args>
    std::unique_ptr<T, std::function<void(T*)>> acquire(Args&&... args) {
        if (pool.empty()) {
            return std::unique_ptr<T, std::function<void(T*)>>(
                new T(std::forward<Args>(args)...),
                [this](T* ptr) { this->release(ptr); }
            );
        }
        
        auto obj = std::move(pool.top());
        pool.pop();
        return std::unique_ptr<T, std::function<void(T*)>(
            obj.release(),
            [this](T* ptr) { this->release(ptr); }
        );
    }
    
    void release(T* obj) {
        if (pool.size() < maxSize) {
            pool.push(std::unique_ptr<T>(obj));
        } else {
            delete obj;
        }
    }
};
\`\`\`

### Arena 分配器

\`\`\`cpp
class Arena {
private:
    char* buffer;
    size_t capacity;
    size_t offset;
    
public:
    Arena(size_t size) : capacity(size), offset(0) {
        buffer = static_cast<char*>(std::malloc(size));
    }
    
    ~Arena() {
        std::free(buffer);
    }
    
    void* allocate(size_t size, size_t alignment = alignof(std::max_align_t)) {
        uintptr_t current = reinterpret_cast<uintptr_t>(buffer + offset);
        uintptr_t aligned = (current + alignment - 1) & ~(alignment - 1);
        
        size_t padding = aligned - current;
        if (offset + padding + size > capacity) {
            throw std::bad_alloc();
        }
        
        offset += padding + size;
        return reinterpret_cast<void*>(aligned);
    }
    
    void reset() {
        offset = 0;
    }
};
\`\`\`

### 性能考虑

#### 内存池的优势

1. **减少内存碎片**
2. **提高分配速度**
3. **缓存友好**
4. **减少系统调用**

#### 适用场景

1. **频繁分配释放相同大小的对象**
2. **实时系统**
3. **游戏开发**
4. **嵌入式系统**

### 调试支持

#### 内存泄漏检测

\`\`\`cpp
#include <unordered_map>
#include <iostream>

class MemoryTracker {
    static std::unordered_map<void*, size_t> allocations;
    
public:
    static void* track(void* ptr, size_t size) {
        allocations[ptr] = size;
        return ptr;
    }
    
    static void untrack(void* ptr) {
        allocations.erase(ptr);
    }
    
    static void reportLeaks() {
        if (!allocations.empty()) {
            std::cerr << "内存泄漏检测到:" << std::endl;
            for (const auto& [ptr, size] : allocations) {
                std::cerr << "  地址: " << ptr << ", 大小: " << size << std::endl;
            }
        }
    }
};
\`\`\`

### 最佳实践

1. **优先使用标准容器和智能指针**
2. **在性能关键路径使用内存池**
3. **测试和验证自定义分配器**
4. **考虑线程安全**
5. **提供回退机制**`,
            examples: [
                {
                    title: '全局new/delete重载',
                    code: `#include <iostream>
#include <cstdlib>
#include <new>

// 全局 new 重载
void* operator new(std::size_t size) {
    std::cout << "全局 new: " << size << " bytes" << std::endl;
    void* ptr = std::malloc(size);
    if (!ptr) throw std::bad_alloc();
    return ptr;
}

void operator delete(void* ptr) noexcept {
    std::cout << "全局 delete" << std::endl;
    if (ptr) std::free(ptr);
}

void operator delete(void* ptr, std::size_t size) noexcept {
    std::cout << "全局 delete (size: " << size << ")" << std::endl;
    if (ptr) std::free(ptr);
}

class TestClass {
public:
    int x, y, z;
    
    TestClass(int a, int b, int c) : x(a), y(b), z(c) {
        std::cout << "TestClass 构造" << std::endl;
    }
    
    ~TestClass() {
        std::cout << "TestClass 析构" << std::endl;
    }
};

int main() {
    std::cout << "=== 全局 new/delete 重载测试 ===" << std::endl;
    
    // 基本类型
    int* p1 = new int(42);
    std::cout << "*p1 = " << *p1 << std::endl;
    delete p1;
    
    std::cout << "\\n";
    
    // 对象
    TestClass* p2 = new TestClass(1, 2, 3);
    std::cout << "p2: (" << p2->x << ", " << p2->y << ", " << p2->z << ")" << std::endl;
    delete p2;
    
    std::cout << "\\n";
    
    // 数组
    int* arr = new int[5]{1, 2, 3, 4, 5};
    std::cout << "arr: ";
    for (int i = 0; i < 5; i++) std::cout << arr[i] << " ";
    std::cout << std::endl;
    delete[] arr;
    
    return 0;
}`
                },
                {
                    title: '内存池实现',
                    code: `#include <iostream>
#include <vector>
#include <chrono>
#include <random>

// 简单内存池
class MemoryPool {
private:
    struct Block {
        Block* next;
    };
    
    std::vector<void*> chunks;
    Block* freeList;
    size_t blockSize;
    size_t blocksPerChunk;
    size_t totalAllocations;
    size_t totalDeallocations;
    
    void allocateChunk() {
        char* chunk = static_cast<char*>(::operator new(blockSize * blocksPerChunk));
        chunks.push_back(chunk);
        
        for (size_t i = 0; i < blocksPerChunk; i++) {
            Block* block = reinterpret_cast<Block*>(chunk + i * blockSize);
            block->next = freeList;
            freeList = block;
        }
    }
    
public:
    MemoryPool(size_t blockSz, size_t blocksPerChunk = 1024)
        : blockSize(blockSz), blocksPerChunk(blocksPerChunk), 
          freeList(nullptr), totalAllocations(0), totalDeallocations(0) {
        if (blockSize < sizeof(Block)) {
            blockSize = sizeof(Block);
        }
    }
    
    ~MemoryPool() {
        for (void* chunk : chunks) {
            ::operator delete(chunk);
        }
    }
    
    void* allocate() {
        if (!freeList) {
            allocateChunk();
        }
        
        Block* block = freeList;
        freeList = freeList->next;
        totalAllocations++;
        return block;
    }
    
    void deallocate(void* ptr) {
        if (!ptr) return;
        
        Block* block = static_cast<Block*>(ptr);
        block->next = freeList;
        freeList = block;
        totalDeallocations++;
    }
    
    void printStats() const {
        std::cout << "内存池统计:" << std::endl;
        std::cout << "  块大小: " << blockSize << " bytes" << std::endl;
        std::cout << "  每块数量: " << blocksPerChunk << std::endl;
        std::cout << "  已分配块: " << chunks.size() << std::endl;
        std::cout << "  总分配次数: " << totalAllocations << std::endl;
        std::cout << "  总释放次数: " << totalDeallocations << std::endl;
    }
};

// 使用内存池的对象
class Particle {
    float x, y, z;
    float vx, vy, vz;
    
public:
    static MemoryPool pool;
    
    Particle(float px = 0, float py = 0, float pz = 0)
        : x(px), y(py), z(pz), vx(0), vy(0), vz(0) {}
    
    static void* operator new(size_t size) {
        return pool.allocate();
    }
    
    static void operator delete(void* ptr) {
        pool.deallocate(ptr);
    }
};

MemoryPool Particle::pool(sizeof(Particle), 1000);

int main() {
    std::cout << "=== 内存池性能测试 ===" << std::endl;
    
    const int N = 100000;
    
    // 测试标准分配
    {
        auto start = std::chrono::high_resolution_clock::now();
        
        std::vector<Particle*> particles;
        for (int i = 0; i < N; i++) {
            particles.push_back(new Particle(i * 0.1f, i * 0.2f, i * 0.3f));
        }
        
        for (auto p : particles) {
            delete p;
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        std::cout << "内存池分配/释放时间: " 
                  << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
                  << " ms" << std::endl;
    }
    
    Particle::pool.printStats();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现对象池',
                description: '实现一个通用的对象池，支持对象的获取和回收。',
                initialCode: `#include <iostream>
#include <memory>
#include <stack>
#include <functional>

template<typename T>
class ObjectPool {
private:
    // TODO: 定义对象池成员变量
    
public:
    // TODO: 构造函数
    // ObjectPool(size_t maxSize = 100)
    
    // TODO: 获取对象
    // template<typename... Args>
    // std::unique_ptr<T, std::function<void(T*)>> acquire(Args&&... args)
    
    // TODO: 释放对象
    // void release(T* obj)
    
    // TODO: 获取池大小
    // size_t size() const
};

class Resource {
public:
    int id;
    std::string name;
    
    Resource(int i, const std::string& n) : id(i), name(n) {
        std::cout << "Resource " << id << " 创建" << std::endl;
    }
    
    ~Resource() {
        std::cout << "Resource " << id << " 销毁" << std::endl;
    }
    
    void reset(int i, const std::string& n) {
        id = i;
        name = n;
    }
};

int main() {
    // TODO: 测试对象池
    
    // 创建对象池
    
    // 获取对象
    
    // 使用对象
    
    // 对象自动回收到池中
    
    return 0;
}`,
                solution: `#include <iostream>
#include <memory>
#include <stack>
#include <functional>
#include <string>

template<typename T>
class ObjectPool {
private:
    std::stack<std::unique_ptr<T>> pool;
    size_t maxSize;
    size_t createdCount;
    
public:
    ObjectPool(size_t max = 100) : maxSize(max), createdCount(0) {}
    
    template<typename... Args>
    std::unique_ptr<T, std::function<void(T*)>> acquire(Args&&... args) {
        T* obj = nullptr;
        
        if (pool.empty()) {
            obj = new T(std::forward<Args>(args)...);
            createdCount++;
        } else {
            obj = pool.top().release();
            pool.pop();
            // 重置对象状态
            obj->~T();
            new (obj) T(std::forward<Args>(args)...);
        }
        
        return std::unique_ptr<T, std::function<void(T*)>>(
            obj,
            [this](T* ptr) { this->release(ptr); }
        );
    }
    
    void release(T* obj) {
        if (pool.size() < maxSize) {
            pool.push(std::unique_ptr<T>(obj));
        } else {
            delete obj;
        }
    }
    
    size_t size() const {
        return pool.size();
    }
    
    size_t getCreatedCount() const {
        return createdCount;
    }
};

class Resource {
public:
    int id;
    std::string name;
    
    Resource(int i = 0, const std::string& n = "") : id(i), name(n) {
        std::cout << "Resource " << id << " 创建" << std::endl;
    }
    
    ~Resource() {
        std::cout << "Resource " << id << " 销毁" << std::endl;
    }
    
    void reset(int i, const std::string& n) {
        id = i;
        name = n;
    }
};

int main() {
    std::cout << "=== 对象池测试 ===" << std::endl;
    
    ObjectPool<Resource> pool(5);
    
    {
        auto r1 = pool.acquire(1, "First");
        auto r2 = pool.acquire(2, "Second");
        
        std::cout << "\\n使用资源:" << std::endl;
        std::cout << "r1: id=" << r1->id << ", name=" << r1->name << std::endl;
        std::cout << "r2: id=" << r2->id << ", name=" << r2->name << std::endl;
        
        std::cout << "\\n池中对象数: " << pool.size() << std::endl;
        std::cout << "已创建对象数: " << pool.getCreatedCount() << std::endl;
    }
    
    std::cout << "\\n资源离开作用域后:" << std::endl;
    std::cout << "池中对象数: " << pool.size() << std::endl;
    
    {
        std::cout << "\\n再次获取资源:" << std::endl;
        auto r3 = pool.acquire(3, "Third");
        std::cout << "r3: id=" << r3->id << ", name=" << r3->name << std::endl;
        std::cout << "池中对象数: " << pool.size() << std::endl;
    }
    
    std::cout << "\\n最终池中对象数: " << pool.size() << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '重载全局operator new时，应该使用什么函数分配内存？',
                    options: ['new', 'malloc', 'calloc', 'realloc'],
                    correct: 1,
                    explanation: '重载operator new时通常使用malloc分配原始内存，因为new会调用operator new导致无限递归。'
                },
                {
                    question: '类级别的operator new必须是？',
                    options: ['虚函数', '静态函数', 'const函数', '内联函数'],
                    correct: 1,
                    explanation: '类级别的operator new必须是静态函数，即使没有显式声明static，编译器也会将其视为静态的。'
                },
                {
                    question: '内存池的主要优势是？',
                    options: ['减少内存使用', '提高分配速度和减少碎片', '支持更大的对象', '自动内存管理'],
                    correct: 1,
                    explanation: '内存池通过预分配内存块，减少了系统调用和内存碎片，从而提高分配速度。'
                },
                {
                    question: '以下哪个是重载operator delete的正确签名？',
                    options: ['void operator delete(void* ptr);', 'void* operator delete(void* ptr);', 'int operator delete(void* ptr);', 'void operator delete();'],
                    correct: 0,
                    explanation: 'operator delete的返回类型是void，参数是void*指针。'
                },
                {
                    question: 'C++17引入的对齐new的签名是？',
                    options: ['void* operator new(size_t, size_t);', 'void* operator new(size_t, align_val_t);', 'void* operator new(size_t, alignment_t);', 'void* operator new_aligned(size_t);'],
                    correct: 1,
                    explanation: 'C++17使用std::align_val_t类型来指定对齐要求，如void* operator new(size_t, std::align_val_t)。'
                }
            ],
            references: [
                {
                    title: 'cppreference - operator new',
                    url: 'https://en.cppreference.com/w/cpp/memory/new/operator_new'
                },
                {
                    title: 'cppreference - operator delete',
                    url: 'https://en.cppreference.com/w/cpp/memory/new/operator_delete'
                }
            ],
            assistantTips: '自定义内存管理是高级技术，应该只在性能关键路径使用。优先使用标准容器和智能指针，在确实需要优化时再考虑内存池。'
        },
        {
            id: '26.6',
            title: '调试内存问题：ASan、Valgrind 简介',
            duration: '40分钟',
            difficulty: '中级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 调试内存问题：ASan、Valgrind 简介

内存错误是C++程序中最常见和最难调试的问题之一。现代工具可以自动检测许多内存错误。

### 常见内存错误类型

#### 1. 内存泄漏（Memory Leak）

\`\`\`cpp
void leak() {
    int* ptr = new int(42);
    // 忘记delete，内存泄漏
}

void noLeak() {
    int* ptr = new int(42);
    delete ptr;  // 正确释放
}

// 更好的方式：使用智能指针
void smartNoLeak() {
    auto ptr = std::make_unique<int>(42);
    // 自动释放
}
\`\`\`

#### 2. 悬空指针（Dangling Pointer）

\`\`\`cpp
int* createDangling() {
    int x = 42;
    return &x;  // 返回局部变量的地址
}

void useAfterFree() {
    int* ptr = new int(42);
    delete ptr;
    *ptr = 100;  // 使用已释放的内存
}
\`\`\`

#### 3. 缓冲区溢出（Buffer Overflow）

\`\`\`cpp
void bufferOverflow() {
    int arr[5];
    arr[10] = 100;  // 越界访问
}

void stackOverflow() {
    char buffer[10];
    strcpy(buffer, "This string is too long");  // 缓冲区溢出
}
\`\`\`

#### 4. 双重释放（Double Free）

\`\`\`cpp
void doubleFree() {
    int* ptr = new int(42);
    delete ptr;
    delete ptr;  // 双重释放
}
\`\`\`

#### 5. 未初始化内存（Uninitialized Memory）

\`\`\`cpp
void uninitializedRead() {
    int x;  // 未初始化
    if (x > 0) {  // 使用未初始化的值
        // ...
    }
}
\`\`\`

### AddressSanitizer (ASan)

#### 简介

AddressSanitizer（ASan）是一个快速的内存错误检测器，集成在GCC和Clang中。

#### 编译选项

\`\`\`bash
# GCC/Clang
g++ -fsanitize=address -g program.cpp -o program

# 更详细的输出
g++ -fsanitize=address -fno-omit-frame-pointer -g program.cpp -o program

# 运行
./program
\`\`\`

#### 检测的错误类型

1. **堆缓冲区溢出**
2. **栈缓冲区溢出**
3. **全局缓冲区溢出**
4. **释放后使用**
5. **双重释放**
6. **内存泄漏**

#### 示例代码

\`\`\`cpp
// heap_overflow.cpp
#include <iostream>

int main() {
    int* arr = new int[10];
    arr[10] = 100;  // 堆缓冲区溢出
    delete[] arr;
    return 0;
}
\`\`\`

编译运行：

\`\`\`bash
g++ -fsanitize=address -g heap_overflow.cpp -o heap_overflow
./heap_overflow
\`\`\`

ASan会输出详细的错误信息：

\`\`\`
=================================================================
==12345==ERROR: AddressSanitizer: heap-buffer-overflow
WRITE of size 4 at 0x602000000038 thread T0
    #0 0x400a3d in main heap_overflow.cpp:5
    #1 0x7f...

0x602000000038 is located 0 bytes to the right of 40-byte region
allocated by thread T0 here:
    #0 0x7f... in operator new[]
    #1 0x400a26 in main heap_overflow.cpp:4
\`\`\`

#### ASan选项

\`\`\`bash
# 检测内存泄漏
ASAN_OPTIONS=detect_leaks=1 ./program

# 更详细的输出
ASAN_OPTIONS=verbosity=1 ./program

# 检测栈使用后返回
ASAN_OPTIONS=detect_stack_use_after_return=1 ./program
\`\`\`

### Valgrind

#### 简介

Valgrind是一个强大的内存调试和性能分析工具套件。

#### 安装

\`\`\`bash
# Ubuntu/Debian
sudo apt-get install valgrind

# CentOS/RHEL
sudo yum install valgrind

# macOS
brew install valgrind
\`\`\`

#### Memcheck工具

Memcheck是Valgrind默认的内存检查工具：

\`\`\`bash
# 基本使用
valgrind ./program

# 详细输出
valgrind --leak-check=full ./program

# 显示泄漏详情
valgrind --leak-check=full --show-leak-kinds=all ./program

# 跟踪来源
valgrind --leak-check=full --track-origins=yes ./program
\`\`\`

#### 示例输出

\`\`\`
==12345== Memcheck, a memory error detector
==12345== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==12345== Using Valgrind-3.15.0 and LibVEX
==12345== Command: ./program
==12345== 
==12345== Invalid write of size 4
==12345==    at 0x400A3D: main (program.cpp:5)
==12345==  Address 0x5203068 is 0 bytes after a block of size 40 alloc'd
==12345==    at 0x4C3017F: operator new[](unsigned long)
==12345==    by 0x400A26: main (program.cpp:4)
\`\`\`

#### 内存泄漏报告

\`\`\`
==12345== HEAP SUMMARY:
==12345==     in use at exit: 72,704 bytes in 1 blocks
==12345==   total heap usage: 1 allocs, 0 frees, 72,704 bytes allocated
==12345== 
==12345== LEAK SUMMARY:
==12345==    definitely lost: 0 bytes in 0 blocks
==12345==    indirectly lost: 0 bytes in 0 blocks
==12345==      possibly lost: 0 bytes in 0 blocks
==12345==    still reachable: 72,704 bytes in 1 blocks
==12345==         suppressed: 0 bytes in 0 blocks
\`\`\`

### 其他工具

#### 1. UndefinedBehaviorSanitizer (UBSan)

检测未定义行为：

\`\`\`bash
g++ -fsanitize=undefined -g program.cpp -o program
./program
\`\`\`

#### 2. ThreadSanitizer (TSan)

检测数据竞争：

\`\`\`bash
g++ -fsanitize=thread -g program.cpp -o program
./program
\`\`\`

#### 3. MemorySanitizer (MSan)

检测未初始化读取：

\`\`\`bash
clang++ -fsanitize=memory -g program.cpp -o program
./program
\`\`\`

### 最佳实践

#### 1. 开发阶段

- 使用ASan进行日常开发
- 在CI/CD中集成内存检查
- 定期运行Valgrind

#### 2. 代码规范

\`\`\`cpp
// 使用智能指针
auto ptr = std::make_unique<int>(42);
auto arr = std::make_unique<int[]>(10);

// 使用标准容器
std::vector<int> vec(10);
vec.at(10);  // 抛出异常而不是未定义行为

// 使用RAII
class Resource {
    int* data;
public:
    Resource() : data(new int(42)) {}
    ~Resource() { delete data; }
};
\`\`\`

#### 3. 调试技巧

\`\`\`cpp
// 使用assert检查不变量
#include <cassert>

void process(int* ptr) {
    assert(ptr != nullptr);
    // ...
}

// 使用边界检查
template<typename T, size_t N>
T& safeAccess(T (&arr)[N], size_t index) {
    if (index >= N) throw std::out_of_range("Index out of bounds");
    return arr[index];
}
\`\`\`

### 工具对比

| 特性 | ASan | Valgrind |
|------|------|----------|
| 性能影响 | 2-3倍慢 | 10-50倍慢 |
| 内存开销 | 2-3倍 | 更大 |
| 检测范围 | 内存错误 | 内存、线程、缓存 |
| 编译要求 | 需要重编译 | 不需要重编译 |
| 适用场景 | 开发测试 | 详细分析 |

### 常见问题解决

#### 内存泄漏

\`\`\`cpp
// 问题
void func() {
    int* p = new int(42);
    // 忘记delete
}

// 解决方案
void func() {
    auto p = std::make_unique<int>(42);
    // 自动释放
}
\`\`\`

#### 缓冲区溢出

\`\`\`cpp
// 问题
char buf[10];
strcpy(buf, "This is too long");

// 解决方案
char buf[10];
strncpy(buf, "This is too long", sizeof(buf) - 1);
buf[sizeof(buf) - 1] = '\\0';

// 或使用std::string
std::string str = "This is too long";  // 自动管理
\`\`\``,
            examples: [
                {
                    title: '常见内存错误示例',
                    code: `#include <iostream>
#include <cstring>
#include <memory>

// 1. 内存泄漏
void memoryLeak() {
    std::cout << "=== 内存泄漏示例 ===" << std::endl;
    int* ptr = new int(42);
    std::cout << "分配了内存，但忘记释放" << std::endl;
    // delete ptr;  // 应该释放
}

// 2. 使用已释放的内存
void useAfterFree() {
    std::cout << "\\n=== 释放后使用示例 ===" << std::endl;
    int* ptr = new int(42);
    delete ptr;
    // std::cout << *ptr << std::endl;  // 危险！
    std::cout << "已释放内存，不应再访问" << std::endl;
}

// 3. 缓冲区溢出
void bufferOverflow() {
    std::cout << "\\n=== 缓冲区溢出示例 ===" << std::endl;
    int arr[5];
    // arr[10] = 100;  // 危险！越界访问
    std::cout << "数组大小为5，不应访问索引10" << std::endl;
}

// 4. 双重释放
void doubleFree() {
    std::cout << "\\n=== 双重释放示例 ===" << std::endl;
    int* ptr = new int(42);
    delete ptr;
    // delete ptr;  // 危险！双重释放
    std::cout << "已释放一次，不应再次释放" << std::endl;
}

// 5. 未初始化内存
void uninitializedMemory() {
    std::cout << "\\n=== 未初始化内存示例 ===" << std::endl;
    int x;  // 未初始化
    // if (x > 0) { }  // 危险！使用未初始化的值
    x = 0;  // 正确：初始化后再使用
    std::cout << "x已初始化: " << x << std::endl;
}

// 正确的做法
void correctUsage() {
    std::cout << "\\n=== 正确用法示例 ===" << std::endl;
    
    // 使用智能指针
    auto ptr = std::make_unique<int>(42);
    std::cout << "智能指针: " << *ptr << std::endl;
    
    // 使用vector
    std::vector<int> vec(5);
    vec.at(0) = 100;  // at()会进行边界检查
    std::cout << "vector: " << vec.at(0) << std::endl;
    
    // 使用string
    std::string str = "Hello";
    std::cout << "string: " << str << std::endl;
}

int main() {
    memoryLeak();
    useAfterFree();
    bufferOverflow();
    doubleFree();
    uninitializedMemory();
    correctUsage();
    
    return 0;
}`
                },
                {
                    title: '使用ASan检测错误',
                    code: `// 编译: g++ -fsanitize=address -g asan_demo.cpp -o asan_demo
// 运行: ./asan_demo

#include <iostream>
#include <vector>

// 演示ASan检测的错误

void heapBufferOverflow() {
    std::cout << "测试堆缓冲区溢出..." << std::endl;
    int* arr = new int[10];
    
    // 正常访问
    for (int i = 0; i < 10; i++) {
        arr[i] = i;
    }
    
    // 危险：越界写入
    // arr[10] = 100;  // ASan会检测到
    
    // 正确做法
    std::vector<int> vec(10);
    for (int i = 0; i < 10; i++) {
        vec[i] = i;
    }
    
    delete[] arr;
    std::cout << "测试完成" << std::endl;
}

void stackBufferOverflow() {
    std::cout << "\\n测试栈缓冲区溢出..." << std::endl;
    int arr[10];
    
    // 正常访问
    for (int i = 0; i < 10; i++) {
        arr[i] = i;
    }
    
    // 危险：越界写入
    // arr[10] = 100;  // ASan会检测到
    
    std::cout << "测试完成" << std::endl;
}

void useAfterFree() {
    std::cout << "\\n测试释放后使用..." << std::endl;
    int* ptr = new int(42);
    delete ptr;
    
    // 危险：使用已释放的内存
    // std::cout << *ptr << std::endl;  // ASan会检测到
    
    std::cout << "测试完成" << std::endl;
}

void memoryLeak() {
    std::cout << "\\n测试内存泄漏..." << std::endl;
    int* ptr = new int(42);
    
    // 危险：忘记释放
    // delete ptr;  // 应该释放
    
    // 使用ASan检测泄漏:
    // ASAN_OPTIONS=detect_leaks=1 ./asan_demo
    
    std::cout << "测试完成" << std::endl;
}

int main() {
    std::cout << "=== ASan 演示 ===" << std::endl;
    std::cout << "编译: g++ -fsanitize=address -g asan_demo.cpp -o asan_demo" << std::endl;
    std::cout << "运行: ./asan_demo" << std::endl;
    
    heapBufferOverflow();
    stackBufferOverflow();
    useAfterFree();
    memoryLeak();
    
    std::cout << "\\n=== 所有测试完成 ===" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '修复内存错误',
                description: '找出并修复代码中的内存错误。',
                initialCode: `#include <iostream>
#include <cstring>

class Buffer {
private:
    char* data;
    size_t size;
    
public:
    // TODO: 检查构造函数中的问题
    Buffer(size_t sz) {
        data = new char[sz];
        size = sz;
    }
    
    // TODO: 检查析构函数
    ~Buffer() {
        // 有问题吗？
    }
    
    // TODO: 检查拷贝构造函数
    Buffer(const Buffer& other) {
        data = other.data;
        size = other.size;
    }
    
    // TODO: 检查赋值运算符
    Buffer& operator=(const Buffer& other) {
        data = other.data;
        size = other.size;
        return *this;
    }
    
    void write(const char* str) {
        // TODO: 检查是否有缓冲区溢出风险
        strcpy(data, str);
    }
    
    const char* read() const {
        return data;
    }
};

// TODO: 检查这个函数的问题
int* createArray() {
    int arr[10];
    for (int i = 0; i < 10; i++) {
        arr[i] = i;
    }
    return arr;  // 有问题吗？
}

// TODO: 检查这个函数的问题
void processData() {
    int* p1 = new int(42);
    int* p2 = new int(100);
    
    delete p1;
    // 使用p1
    std::cout << *p1 << std::endl;  // 有问题吗？
    
    delete p1;  // 有问题吗？
}

int main() {
    // 测试Buffer类
    Buffer b1(10);
    b1.write("Hello");
    std::cout << b1.read() << std::endl;
    
    // 测试拷贝
    Buffer b2 = b1;
    
    // 测试数组函数
    int* arr = createArray();
    // std::cout << arr[0] << std::endl;  // 有问题吗？
    
    // 测试processData
    processData();
    
    return 0;
}`,
                solution: `#include <iostream>
#include <cstring>
#include <algorithm>

class Buffer {
private:
    char* data;
    size_t size;
    
public:
    Buffer(size_t sz) : size(sz) {
        data = new char[sz]();  // 初始化为0
    }
    
    ~Buffer() {
        delete[] data;  // 使用delete[]
    }
    
    // 深拷贝
    Buffer(const Buffer& other) : size(other.size) {
        data = new char[size];
        std::memcpy(data, other.data, size);
    }
    
    // 拷贝赋值
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new char[size];
            std::memcpy(data, other.data, size);
        }
        return *this;
    }
    
    void write(const char* str) {
        size_t len = std::strlen(str);
        size_t copyLen = std::min(len, size - 1);
        std::memcpy(data, str, copyLen);
        data[copyLen] = '\\0';
    }
    
    const char* read() const {
        return data;
    }
};

// 修复：返回动态分配的数组
int* createArray() {
    int* arr = new int[10];
    for (int i = 0; i < 10; i++) {
        arr[i] = i;
    }
    return arr;
}

// 修复：避免使用已释放的内存和双重释放
void processData() {
    int* p1 = new int(42);
    int* p2 = new int(100);
    
    std::cout << "p1 = " << *p1 << std::endl;
    std::cout << "p2 = " << *p2 << std::endl;
    
    delete p1;
    delete p2;
}

int main() {
    // 测试Buffer类
    Buffer b1(10);
    b1.write("Hello");
    std::cout << "b1: " << b1.read() << std::endl;
    
    // 测试拷贝
    Buffer b2 = b1;
    std::cout << "b2: " << b2.read() << std::endl;
    
    // 测试数组函数
    int* arr = createArray();
    std::cout << "arr[0] = " << arr[0] << std::endl;
    delete[] arr;
    
    // 测试processData
    processData();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'ASan相比Valgrind的主要优势是？',
                    options: ['检测更多错误', '性能开销更小', '不需要编译', '支持更多平台'],
                    correct: 1,
                    explanation: 'ASan的性能开销通常只有2-3倍，而Valgrind可能慢10-50倍，所以ASan更适合日常开发。'
                },
                {
                    question: '以下哪个命令使用ASan编译程序？',
                    options: ['g++ -fsanitize=memory program.cpp', 'g++ -fsanitize=address program.cpp', 'g++ -fsanitize=thread program.cpp', 'valgrind g++ program.cpp'],
                    correct: 1,
                    explanation: '-fsanitize=address启用AddressSanitizer，用于检测内存错误。'
                },
                {
                    question: 'Valgrind的Memcheck工具可以检测什么？',
                    options: ['只有内存泄漏', '只有缓冲区溢出', '多种内存错误', '只有性能问题'],
                    correct: 2,
                    explanation: 'Memcheck可以检测内存泄漏、缓冲区溢出、使用未初始化的内存、双重释放等多种内存错误。'
                },
                {
                    question: '以下哪种错误ASan无法检测？',
                    options: ['堆缓冲区溢出', '栈缓冲区溢出', '未初始化内存读取', '释放后使用'],
                    correct: 2,
                    explanation: 'ASan主要检测地址相关的错误，未初始化内存读取需要使用MemorySanitizer (MSan)检测。'
                },
                {
                    question: '预防内存错误的最佳实践是？',
                    options: ['手动管理所有内存', '使用智能指针和RAII', '避免使用动态内存', '依赖垃圾回收'],
                    correct: 1,
                    explanation: '使用智能指针和RAII可以自动管理资源生命周期，大大减少内存错误的可能性。'
                }
            ],
            references: [
                {
                    title: 'AddressSanitizer',
                    url: 'https://github.com/google/sanitizers/wiki/AddressSanitizer'
                },
                {
                    title: 'Valgrind',
                    url: 'https://valgrind.org/'
                }
            ],
            assistantTips: '内存错误是C++程序中最常见的问题。养成使用ASan进行日常测试的习惯，在CI/CD中集成内存检查，可以大大减少内存相关的bug。记住：预防胜于治疗，优先使用智能指针和RAII。'
        }
    ]
};

window.Unit26Data = Unit26Data;
