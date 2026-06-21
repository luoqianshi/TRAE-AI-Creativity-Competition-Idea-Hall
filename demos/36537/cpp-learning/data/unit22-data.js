/**
 * 单元22：异常处理与错误策略
 */
const Unit22Data = {
    id: 22,
    title: '异常处理与错误策略',
    description: '深入理解C++异常处理机制、异常安全保证、noexcept说明符，掌握现代C++错误处理策略',
    lessons: [
        {
            id: '22.1',
            title: '栈展开与析构',
            duration: '40分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 栈展开与析构

### 什么是栈展开（Stack Unwinding）？

当异常被抛出且被捕获时，程序会沿着调用栈向上查找匹配的catch块。在这个过程中，所有在try块中创建的局部对象会被自动销毁，这个过程称为**栈展开**。

\`\`\`cpp
#include <iostream>
#include <stdexcept>

class Resource {
public:
    std::string name;
    Resource(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    ~Resource() {
        std::cout << "析构: " << name << std::endl;
    }
};

void funcC() {
    Resource r("C");
    throw std::runtime_error("Error in C");
}

void funcB() {
    Resource r("B");
    funcC();
}

void funcA() {
    Resource r("A");
    funcB();
}

int main() {
    try {
        funcA();
    } catch (const std::exception& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
    }
    return 0;
}
// 输出：
// 构造: A
// 构造: B
// 构造: C
// 析构: C
// 析构: B
// 析构: A
// 捕获异常: Error in C
\`\`\`

### 栈展开的过程

1. **抛出异常**：throw语句执行
2. **查找catch块**：沿着调用栈向上查找匹配的catch
3. **销毁对象**：沿途销毁所有局部对象
4. **执行catch**：找到匹配的catch块并执行

### 析构函数与异常

#### 析构函数中的异常

**重要规则：析构函数不应该抛出异常！**

\`\`\`cpp
class BadClass {
public:
    ~BadClass() {
        throw std::runtime_error("析构函数中的异常");  // 危险！
    }
};

void func() {
    BadClass obj;
    throw std::runtime_error("另一个异常");
    // 栈展开时，obj的析构函数抛出异常
    // 程序调用std::terminate！
}
\`\`\`

#### 为什么析构函数不能抛异常？

\`\`\`cpp
// 场景：异常处理过程中又抛出异常
void dangerous() {
    BadClass obj;
    throw std::runtime_error("第一个异常");
    // 栈展开时：
    // 1. obj析构函数抛出"析构函数中的异常"
    // 2. 此时已有"第一个异常"在处理中
    // 3. 两个异常同时存在 -> std::terminate
}
\`\`\`

#### 正确的做法

\`\`\`cpp
class GoodClass {
public:
    ~GoodClass() noexcept {
        try {
            // 可能抛出异常的代码
            cleanup();
        } catch (...) {
            // 捕获并处理所有异常
            std::cerr << "析构时发生错误" << std::endl;
        }
    }
    
    void cleanup() {
        // 可能抛出异常的清理操作
    }
};
\`\`\`

### RAII与异常安全

RAII（资源获取即初始化）是异常安全的关键：

\`\`\`cpp
// 不安全：手动管理资源
void unsafe() {
    int* p = new int[1000];
    // 如果这里抛出异常，内存泄漏！
    doSomething();
    delete[] p;
}

// 安全：使用RAII
void safe() {
    std::vector<int> v(1000);
    // 即使抛出异常，vector析构函数自动释放内存
    doSomething();
}
\`\`\`

### 栈展开示例

\`\`\`cpp
#include <iostream>
#include <stdexcept>

class Tracker {
public:
    int id;
    Tracker(int i) : id(i) {
        std::cout << "Tracker " << id << " 构造" << std::endl;
    }
    ~Tracker() {
        std::cout << "Tracker " << id << " 析构" << std::endl;
    }
};

void level3() {
    Tracker t3(3);
    std::cout << "level3: 抛出异常" << std::endl;
    throw std::runtime_error("level3 error");
}

void level2() {
    Tracker t2(2);
    level3();
    std::cout << "level2: 不会执行" << std::endl;
}

void level1() {
    Tracker t1(1);
    level2();
    std::cout << "level1: 不会执行" << std::endl;
}

int main() {
    std::cout << "=== 开始 ===" << std::endl;
    try {
        level1();
    } catch (const std::exception& e) {
        std::cout << "捕获: " << e.what() << std::endl;
    }
    std::cout << "=== 结束 ===" << std::endl;
    return 0;
}
\`\`\`

### 异常处理流程

\`\`\`
抛出异常
    ↓
查找匹配的catch
    ↓
栈展开（销毁局部对象）
    ↓
执行catch块
    ↓
继续执行（或重新抛出）
\`\`\`

### 未捕获的异常

如果异常没有被任何catch块捕获：

\`\`\`cpp
void func() {
    throw std::runtime_error("未捕获的异常");
}

int main() {
    func();  // 没有try-catch
    // 程序调用std::terminate
    return 0;
}
\`\`\`

### std::terminate

\`\`\`cpp
#include <iostream>
#include <exception>
#include <cstdlib>

void myTerminate() {
    std::cerr << "自定义terminate处理" << std::endl;
    std::abort();
}

int main() {
    std::set_terminate(myTerminate);
    
    throw std::runtime_error("未捕获");
    // 调用myTerminate
}
\`\`\`

### 关键要点

1. **栈展开自动调用析构函数**：确保资源释放
2. **析构函数不能抛出异常**：会导致std::terminate
3. **使用RAII管理资源**：异常安全的保证
4. **异常必须被捕获**：否则调用std::terminate

## 最佳实践

### 1. 析构函数始终标记 noexcept

\`\`\`cpp
class Resource {
public:
    ~Resource() noexcept {  // C++11 风格
        // 安全的清理代码
    }
};

// C++11 起，析构函数默认是 noexcept
// 但如果基类或成员的析构函数可能抛出异常，需要显式指定
class Derived : public Base {
    ~Derived() noexcept(false) {  // 如果必须允许异常
        // 但这是危险的！
    }
};
\`\`\`

### 2. 使用 RAII 包装器管理资源

\`\`\`cpp
// 推荐：使用标准库 RAII 类型
void safeCode() {
    std::unique_ptr<int[]> data(new int[1000]);
    std::vector<int> vec(1000);
    std::string str = "Hello";
    std::fstream file("data.txt");
    
    // 所有资源都会自动释放，即使抛出异常
    doSomething();
}

// 自定义 RAII 包装器
class FileHandle {
    FILE* file;
public:
    FileHandle(const char* filename) : file(fopen(filename, "r")) {
        if (!file) throw std::runtime_error("Cannot open file");
    }
    ~FileHandle() noexcept {
        if (file) fclose(file);
    }
    // 禁止复制
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};
\`\`\`

### 3. 在析构函数中捕获所有异常

\`\`\`cpp
class SafeResource {
public:
    ~SafeResource() noexcept {
        try {
            cleanup();
        } catch (const std::exception& e) {
            // 记录日志，但不重新抛出
            std::cerr << "析构时错误: " << e.what() << std::endl;
        } catch (...) {
            std::cerr << "析构时未知错误" << std::endl;
        }
    }
    
private:
    void cleanup() {
        // 可能抛出异常的清理操作
    }
};
\`\`\`

### 4. 使用 scope_guard 模式

\`\`\`cpp
// C++17 scope_exit 模式
template<typename F>
class ScopeExit {
    F func;
    bool active = true;
public:
    explicit ScopeExit(F f) : func(std::move(f)) {}
    ~ScopeExit() { if (active) func(); }
    ScopeExit(ScopeExit&& other) : func(std::move(other.func)), active(other.active) {
        other.active = false;
    }
    ScopeExit(const ScopeExit&) = delete;
};

void processFile() {
    FILE* f = fopen("data.txt", "r");
    auto guard = ScopeExit([f]() {
        if (f) fclose(f);
        std::cout << "文件已关闭" << std::endl;
    });
    
    // 即使抛出异常，guard 析构时会关闭文件
    processContents(f);
}
\`\`\`

### 5. 避免在构造函数中抛出异常后资源泄漏

\`\`\`cpp
class Dangerous {
    int* data1;
    int* data2;
public:
    Dangerous() : data1(new int[100]), data2(nullptr) {
        try {
            data2 = new int[100];  // 可能抛出 bad_alloc
        } catch (...) {
            delete[] data1;  // 必须手动清理
            throw;
        }
    }
    ~Dangerous() {
        delete[] data1;
        delete[] data2;
    }
};

// 推荐：使用智能指针
class Safe {
    std::unique_ptr<int[]> data1;
    std::unique_ptr<int[]> data2;
public:
    Safe() : data1(std::make_unique<int[]>(100)),
             data2(std::make_unique<int[]>(100)) {}
    // 无需手动管理，异常安全
};
\`\`\`

## 常见错误

### 1. 析构函数抛出异常

\`\`\`cpp
// 错误：析构函数抛出异常
class BadClass {
    ~BadClass() {
        throw std::runtime_error("析构错误");  // 危险！
    }
};

void func() {
    BadClass obj;
    throw std::runtime_error("第一个异常");
    // 栈展开时 obj 析构抛出第二个异常 -> std::terminate
}

// 正确：捕获并处理异常
class GoodClass {
    ~GoodClass() noexcept {
        try {
            doCleanup();
        } catch (...) {
            // 记录日志，不重新抛出
        }
    }
};
\`\`\`

### 2. 忘记在构造函数中清理已分配的资源

\`\`\`cpp
// 错误：构造函数异常导致泄漏
class Leaky {
    int* a;
    int* b;
public:
    Leaky() : a(new int[100]), b(nullptr) {
        b = new int[100];  // 如果抛出异常，a 泄漏
    }
    ~Leaky() { delete[] a; delete[] b; }
};

// 正确：使用智能指针
class Safe {
    std::unique_ptr<int[]> a, b;
public:
    Safe() : a(std::make_unique<int[]>(100)),
             b(std::make_unique<int[]>(100)) {}
};
\`\`\`

### 3. 在栈展开期间调用 exit 或 abort

\`\`\`cpp
// 危险：栈展开期间调用 exit
class BadResource {
public:
    ~BadResource() {
        std::exit(0);  // 不调用其他析构函数！
    }
};

// 正确：让栈展开正常完成
class GoodResource {
public:
    ~GoodResource() noexcept {
        // 只做清理，不调用 exit
    }
};
\`\`\`

### 4. 误解 noexcept 的含义

\`\`\`cpp
// noexcept 不阻止异常，而是调用 std::terminate
class Misunderstood {
public:
    void func() noexcept {
        throw std::runtime_error("Error");  // std::terminate！
    }
};

// 正确理解：noexcept 表示"不会抛出异常"
class Correct {
public:
    void func() noexcept {
        try {
            mightThrow();
        } catch (...) {
            // 处理异常，不传播
        }
    }
};
\`\`\`

### 5. 使用原始指针管理资源

\`\`\`cpp
// 错误：原始指针在异常时不释放
void badCode() {
    int* p = new int[1000];
    process(p);  // 如果抛出异常，内存泄漏
    delete[] p;
}

// 正确：使用智能指针
void goodCode() {
    auto p = std::make_unique<int[]>(1000);
    process(p.get());  // 异常安全
}
\`\`\`

## 深入理解

### 1. 栈展开的实现机制

\`\`\`cpp
// 编译器为异常处理生成的代码：

// 1. 异常表（Exception Table）
// 编译器为每个函数生成一个表，记录：
// - 哪些代码区域可能抛出异常
// - 对应的 catch 块位置
// - 需要析构的对象

// 2. 展开过程
// 当异常抛出时：
// a) 运行时查找当前函数的异常表
// b) 如果没有匹配的 catch，析构当前函数的所有局部对象
// c) 返回到调用者，重复此过程
// d) 直到找到匹配的 catch 或调用 std::terminate

// 3. 性能影响
// - 异常抛出代价高（需要查找和展开）
// - 无异常时代价几乎为零（零成本异常模型）
\`\`\`

### 2. noexcept 与异常规范

\`\`\`cpp
// C++98 异常规范（已废弃）
void func() throw(std::runtime_error);  // 只能抛出 runtime_error
void func() throw();  // 不抛出异常
void func() throw(...);  // 可以抛出任何异常

// C++11 noexcept
void func() noexcept;  // 不抛出异常
void func() noexcept(true);  // 同上
void func() noexcept(false);  // 可能抛出异常

// noexcept 操作符
void mightThrow();
void noThrow() noexcept;

static_assert(!noexcept(mightThrow()));
static_assert(noexcept(noThrow()));

// 条件 noexcept
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
\`\`\`

### 3. 异常安全级别

\`\`\`cpp
// 1. 无异常安全（No exception safety）
void unsafe(int* p) {
    *p = 42;  // 如果 p 为空，未定义行为
}

// 2. 基本保证（Basic guarantee）
void basic(std::vector<int>& v) {
    // 操作失败时，对象仍处于有效状态
    // 但不保证是原来的状态
    v.clear();
    v.push_back(1);  // 如果失败，v 可能是空的
}

// 3. 强保证（Strong guarantee）
void strong(std::vector<int>& v) {
    // 操作失败时，对象状态不变
    std::vector<int> temp = v;
    temp.push_back(1);
    v.swap(temp);  // 只在成功时修改
}

// 4. 不抛出保证（No-throw guarantee）
void nothrow(int* p) noexcept {
    // 保证不抛出异常
    if (p) *p = 42;
}
\`\`\`

### 4. std::uncaught_exceptions

\`\`\`cpp
#include <exception>

// C++17: 检测是否有未捕获的异常
class ScopeGuard {
    int uncaught = std::uncaught_exceptions();
public:
    ~ScopeGuard() {
        // 只有在析构是由于异常时才执行
        if (std::uncaught_exceptions() > uncaught) {
            rollback();
        }
    }
    void rollback() { /* ... */ }
};

// 用途：事务性操作
void transaction() {
    ScopeGuard guard;
    // 如果后续代码抛出异常，guard 会回滚
    performOperation();
    // 如果成功，guard 不执行回滚
}
\`\`\`

### 5. 构造函数与析构函数的异常处理差异

\`\`\`cpp
// 构造函数可以抛出异常
class Constructor {
public:
    Constructor() {
        throw std::runtime_error("构造失败");
        // 对象未完全构造，析构函数不会被调用
    }
    ~Constructor() {
        // 如果构造失败，这里不会执行
    }
};

// 析构函数不能抛出异常
class Destructor {
public:
    ~Destructor() noexcept {
        // 必须保证不抛出异常
        // 如果需要处理错误，只能记录日志
    }
};

// 关键区别：
// - 构造函数抛出异常：对象不存在，不需要析构
// - 析构函数抛出异常：对象正在销毁，可能导致 std::terminate
\`\`\`
`,
            examples: [
                {
                    title: '栈展开演示',
                    code: `#include <iostream>
#include <stdexcept>
#include <string>

class Resource {
public:
    std::string name;
    
    Resource(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    
    ~Resource() {
        std::cout << "析构: " << name << std::endl;
    }
};

void funcC() {
    Resource r("C");
    std::cout << "funcC: 抛出异常" << std::endl;
    throw std::runtime_error("Error in funcC");
}

void funcB() {
    Resource r("B");
    funcC();
    std::cout << "funcB: 不会执行" << std::endl;
}

void funcA() {
    Resource r("A");
    funcB();
    std::cout << "funcA: 不会执行" << std::endl;
}

int main() {
    std::cout << "=== 栈展开演示 ===" << std::endl;
    
    try {
        funcA();
    } catch (const std::exception& e) {
        std::cout << "\\n捕获异常: " << e.what() << std::endl;
    }
    
    std::cout << "\\n程序继续执行" << std::endl;
    return 0;
}`,
                    description: '演示栈展开过程中析构函数的调用顺序。'
                },
                {
                    title: '析构函数中的异常处理',
                    code: `#include <iostream>
#include <stdexcept>
#include <fstream>

class SafeFile {
private:
    std::ofstream file;
    std::string filename;
    
public:
    SafeFile(const std::string& fname) : filename(fname) {
        file.open(filename);
        if (!file.is_open()) {
            throw std::runtime_error("Cannot open file: " + filename);
        }
        std::cout << "打开文件: " << filename << std::endl;
    }
    
    void write(const std::string& data) {
        file << data << std::endl;
    }
    
    ~SafeFile() noexcept {
        // 析构函数不能抛出异常
        try {
            if (file.is_open()) {
                file.close();
                std::cout << "关闭文件: " << filename << std::endl;
            }
        } catch (...) {
            // 捕获所有异常，防止传播
            std::cerr << "关闭文件时发生错误: " << filename << std::endl;
        }
    }
};

void processData() {
    SafeFile f("test.txt");
    f.write("Hello, RAII!");
    throw std::runtime_error("处理数据时出错");
    // 栈展开时，f的析构函数被调用
}

int main() {
    std::cout << "=== 析构函数异常安全 ===" << std::endl;
    
    try {
        processData();
    } catch (const std::exception& e) {
        std::cout << "\\n捕获异常: " << e.what() << std::endl;
    }
    
    std::cout << "\\n程序正常结束" << std::endl;
    return 0;
}`,
                    description: '展示如何在析构函数中安全处理异常。'
                }
            ],
            handsOn: {
                title: '跟踪栈展开',
                description: '实现一个类来跟踪栈展开过程中对象的析构顺序。',
                initialCode: `#include <iostream>
#include <stdexcept>
#include <string>

// TODO: 实现Tracker类
// 成员：id（整数）、name（字符串）
// 构造函数：打印"构造: [name]#[id]"
// 析构函数：打印"析构: [name]#[id]"

class Tracker {
    // TODO: 添加成员变量
    
public:
    // TODO: 实现构造函数
    Tracker(int id, const std::string& name) {
        // 打印构造信息
    }
    
    // TODO: 实现析构函数
    ~Tracker() {
        // 打印析构信息
    }
};

void level3() {
    // TODO: 创建Tracker对象，id=3, name="level3"
    // TODO: 抛出std::runtime_error("level3 error")
}

void level2() {
    // TODO: 创建Tracker对象，id=2, name="level2"
    // TODO: 调用level3()
}

void level1() {
    // TODO: 创建Tracker对象，id=1, name="level1"
    // TODO: 调用level2()
}

int main() {
    std::cout << "=== 栈展开跟踪 ===" << std::endl;
    
    try {
        level1();
    } catch (const std::exception& e) {
        std::cout << "\\n捕获异常: " << e.what() << std::endl;
    }
    
    std::cout << "\\n=== 程序结束 ===" << std::endl;
    return 0;
}`,
                expectedOutput: `=== 栈展开跟踪 ===
构造: level1#1
构造: level2#2
构造: level3#3

析构: level3#3
析构: level2#2
析构: level1#1

捕获异常: level3 error

=== 程序结束 ===`,
                solutionRegex: 'Tracker|构造|析构|throw|runtime_error',
                hint: '构造函数打印信息，析构函数打印信息，栈展开时按相反顺序析构',
                xp: 150
            },
            references: [
                { title: '异常处理基础', book: 'C++ Primer 第五版', chapter: '第18章' },
                { title: '析构函数与异常', book: 'Effective C++', chapter: '条款8' }
            ],
            assistantTips: [
                '栈展开时自动调用析构函数',
                '析构函数不能抛出异常',
                '使用RAII确保异常安全',
                '未捕获的异常调用std::terminate'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '栈展开时会发生什么？', 
                    options: [
                        { text: '程序立即终止' }, 
                        { text: '局部对象被自动销毁', correct: true }, 
                        { text: '全局变量被销毁' }, 
                        { text: '堆上的对象被释放' }
                    ], 
                    explanation: '栈展开时，所有在try块中创建的局部对象会被自动销毁。' 
                },
                { 
                    type: 'single', 
                    question: '析构函数抛出异常会导致什么？', 
                    options: [
                        { text: '异常正常传播' }, 
                        { text: '调用std::terminate', correct: true }, 
                        { text: '异常被忽略' }, 
                        { text: '程序继续执行' }
                    ], 
                    explanation: '如果在异常处理过程中析构函数抛出异常，程序会调用std::terminate。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的析构函数声明？', 
                    options: [
                        { text: '~MyClass()' }, 
                        { text: '~MyClass() noexcept', correct: true }, 
                        { text: '~MyClass() throw()' }, 
                        { text: '~MyClass(const MyClass&)' }
                    ], 
                    explanation: '析构函数应该标记noexcept，保证不抛出异常。' 
                },
                { 
                    type: 'single', 
                    question: 'RAII如何保证异常安全？', 
                    options: [
                        { text: '禁止异常' }, 
                        { text: '析构函数自动释放资源', correct: true }, 
                        { text: '捕获所有异常' }, 
                        { text: '延迟异常处理' }
                    ], 
                    explanation: 'RAII利用析构函数在栈展开时自动释放资源，确保异常安全。' 
                },
                { 
                    type: 'single', 
                    question: '未捕获的异常会导致什么？', 
                    options: [
                        { text: '程序继续执行' }, 
                        { text: '调用std::terminate', correct: true }, 
                        { text: '返回错误码' }, 
                        { text: '忽略异常' }
                    ], 
                    explanation: '如果异常没有被任何catch块捕获，程序会调用std::terminate。' 
                }
            ]
        },
        {
            id: '22.2',
            title: '标准异常体系',
            duration: '35分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 标准异常体系

### C++标准异常层次结构

C++标准库定义了一套异常类层次结构，所有标准异常都继承自std::exception。

\`\`\`
std::exception
├── std::logic_error
│   ├── std::domain_error
│   ├── std::invalid_argument
│   ├── std::length_error
│   └── std::out_of_range
├── std::runtime_error
│   ├── std::range_error
│   ├── std::overflow_error
│   └── std::underflow_error
├── std::bad_alloc
├── std::bad_cast
├── std::bad_typeid
├── std::bad_exception
└── std::bad_weak_ptr
\`\`\`

### std::exception基类

\`\`\`cpp
#include <exception>
#include <iostream>

class exception {
public:
    virtual ~exception() noexcept;
    virtual const char* what() const noexcept;
};
\`\`\`

### logic_error系列

用于程序逻辑错误，理论上可以在编译时检测：

\`\`\`cpp
#include <stdexcept>
#include <vector>
#include <iostream>

void example() {
    std::vector<int> v = {1, 2, 3};
    
    // out_of_range: 越界访问
    try {
        v.at(10);  // 抛出std::out_of_range
    } catch (const std::out_of_range& e) {
        std::cout << e.what() << std::endl;
    }
    
    // invalid_argument: 无效参数
    throw std::invalid_argument("参数不能为负数");
    
    // length_error: 长度错误
    throw std::length_error("容器大小超过最大值");
    
    // domain_error: 定义域错误
    throw std::domain_error("数学函数定义域错误");
}
\`\`\`

### runtime_error系列

用于运行时错误，无法在编译时预测：

\`\`\`cpp
#include <stdexcept>
#include <iostream>

void example() {
    // runtime_error: 通用运行时错误
    throw std::runtime_error("运行时错误");
    
    // range_error: 范围错误
    throw std::range_error("计算结果超出范围");
    
    // overflow_error: 上溢
    throw std::overflow_error("数值上溢");
    
    // underflow_error: 下溢
    throw std::underflow_error("数值下溢");
}
\`\`\`

### 内存相关异常

\`\`\`cpp
#include <new>
#include <iostream>

void memoryExample() {
    // bad_alloc: 内存分配失败
    try {
        int* p = new int[1000000000000];
    } catch (const std::bad_alloc& e) {
        std::cout << "内存分配失败: " << e.what() << std::endl;
    }
    
    // bad_array_new_length: 数组长度无效
    try {
        int* p = new int[-1];
    } catch (const std::bad_array_new_length& e) {
        std::cout << "数组长度无效: " << e.what() << std::endl;
    }
}
\`\`\`

### 类型相关异常

\`\`\`cpp
#include <typeinfo>
#include <iostream>

class Base { virtual void f() {} };
class Derived : public Base {};

void typeExample() {
    Base* b = new Base;
    
    // bad_cast: dynamic_cast失败
    try {
        Derived& d = dynamic_cast<Derived&>(*b);
    } catch (const std::bad_cast& e) {
        std::cout << "类型转换失败: " << e.what() << std::endl;
    }
    
    // bad_typeid: typeid对空指针解引用
    Base* ptr = nullptr;
    try {
        std::cout << typeid(*ptr).name();
    } catch (const std::bad_typeid& e) {
        std::cout << "typeid失败: " << e.what() << std::endl;
    }
    
    delete b;
}
\`\`\`

### 使用标准异常

\`\`\`cpp
#include <stdexcept>
#include <string>
#include <vector>

class Stack {
private:
    std::vector<int> data;
    static const size_t MAX_SIZE = 100;
    
public:
    void push(int value) {
        if (data.size() >= MAX_SIZE) {
            throw std::length_error("栈已满");
        }
        data.push_back(value);
    }
    
    int pop() {
        if (data.empty()) {
            throw std::out_of_range("栈为空");
        }
        int value = data.back();
        data.pop_back();
        return value;
    }
    
    int top() const {
        if (data.empty()) {
            throw std::out_of_range("栈为空");
        }
        return data.back();
    }
    
    size_t size() const { return data.size(); }
};
\`\`\`

### 捕获异常的顺序

\`\`\`cpp
#include <stdexcept>
#include <iostream>

void catchOrder() {
    try {
        throw std::runtime_error("运行时错误");
    }
    catch (const std::runtime_error& e) {
        std::cout << "runtime_error: " << e.what() << std::endl;
    }
    catch (const std::exception& e) {
        std::cout << "exception: " << e.what() << std::endl;
    }
    catch (...) {
        std::cout << "未知异常" << std::endl;
    }
}
\`\`\`

### 关键要点

1. **继承自std::exception**：所有标准异常都继承自std::exception
2. **logic_error**：程序逻辑错误，可预防
3. **runtime_error**：运行时错误，难以预防
4. **what()方法**：返回异常描述信息
5. **捕获顺序**：从具体到一般

## 最佳实践

### 1. 选择正确的异常类型

\`\`\`cpp
// 根据错误类型选择合适的异常

// 逻辑错误：程序员的错误
void processIndex(int index, int size) {
    if (index < 0 || index >= size) {
        throw std::out_of_range("Index out of range");
    }
}

void processValue(int value) {
    if (value < 0) {
        throw std::invalid_argument("Value must be non-negative");
    }
}

// 运行时错误：外部条件导致的错误
void readFromFile(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) {
        throw std::runtime_error("Cannot open file: " + filename);
    }
}

void allocateMemory(size_t size) {
    // 让 bad_alloc 自然抛出
    auto data = std::make_unique<int[]>(size);
}
\`\`\`

### 2. 提供有意义的错误信息

\`\`\`cpp
// 好的错误信息
void setValue(int value, int min, int max) {
    if (value < min || value > max) {
        throw std::out_of_range(
            "Value " + std::to_string(value) + 
            " is out of range [" + std::to_string(min) + 
            ", " + std::to_string(max) + "]"
        );
    }
}

// 不好的错误信息
void badExample() {
    throw std::runtime_error("Error");  // 信息不足
}
\`\`\`

### 3. 自定义异常类

\`\`\`cpp
#include <stdexcept>
#include <string>

// 继承自标准异常
class FileError : public std::runtime_error {
public:
    explicit FileError(const std::string& filename)
        : std::runtime_error("File error: " + filename),
          filename_(filename) {}
    
    const std::string& getFilename() const noexcept { return filename_; }
    
private:
    std::string filename_;
};

class FileNotFoundError : public FileError {
public:
    explicit FileNotFoundError(const std::string& filename)
        : FileError(filename) {}
};

class FilePermissionError : public FileError {
public:
    FilePermissionError(const std::string& filename, const std::string& operation)
        : FileError(filename), operation_(operation) {}
    
    const std::string& getOperation() const noexcept { return operation_; }
    
private:
    std::string operation_;
};
\`\`\`

### 4. 使用嵌套异常

\`\`\`cpp
#include <exception>
#include <stdexcept>

void lowLevelFunction() {
    throw std::runtime_error("Low level error");
}

void highLevelFunction() {
    try {
        lowLevelFunction();
    } catch (const std::exception& e) {
        // 重新抛出，保留原始异常
        std::throw_with_nested(
            std::runtime_error("High level operation failed")
        );
    }
}

void handleNestedException() {
    try {
        highLevelFunction();
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
        
        try {
            std::rethrow_if_nested(e);
        } catch (const std::exception& nested) {
            std::cout << "Nested: " << nested.what() << std::endl;
        }
    }
}
\`\`\`

### 5. 按引用捕获异常

\`\`\`cpp
// 推荐：按 const 引用捕获
try {
    doSomething();
} catch (const std::exception& e) {
    std::cout << e.what() << std::endl;
}

// 避免：按值捕获（会导致对象切片）
try {
    doSomething();
} catch (std::exception e) {  // 切片！丢失派生类信息
    std::cout << e.what() << std::endl;
}
\`\`\`

## 常见错误

### 1. 捕获顺序错误

\`\`\`cpp
// 错误：基类在前，派生类永远捕获不到
try {
    throw std::out_of_range("Error");
} catch (const std::exception& e) {
    // 所有异常都在这里被捕获
} catch (const std::out_of_range& e) {
    // 永远不会执行！
}

// 正确：从具体到一般
try {
    throw std::out_of_range("Error");
} catch (const std::out_of_range& e) {
    // 先捕获派生类
} catch (const std::exception& e) {
    // 再捕获基类
}
\`\`\`

### 2. 滥用异常类型

\`\`\`cpp
// 错误：用 runtime_error 表示逻辑错误
void setAge(int age) {
    if (age < 0) {
        throw std::runtime_error("Age cannot be negative");  // 应该用 invalid_argument
    }
}

// 正确：使用合适的异常类型
void setAge(int age) {
    if (age < 0) {
        throw std::invalid_argument("Age cannot be negative");
    }
}
\`\`\`

### 3. 忽略异常信息

\`\`\`cpp
// 错误：捕获但不处理
try {
    doSomething();
} catch (const std::exception& e) {
    // 什么都不做，吞掉异常
}

// 正确：至少记录日志
try {
    doSomething();
} catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << std::endl;
    throw;  // 重新抛出
}
\`\`\`

### 4. 异常中包含敏感信息

\`\`\`cpp
// 危险：暴露敏感信息
void login(const std::string& user, const std::string& pass) {
    if (!checkPassword(user, pass)) {
        throw std::runtime_error("Invalid password for user: " + user);
        // 暴露了用户名！
    }
}

// 正确：不暴露敏感信息
void login(const std::string& user, const std::string& pass) {
    if (!checkPassword(user, pass)) {
        throw std::runtime_error("Authentication failed");
    }
}
\`\`\`

### 5. 异常类不继承 std::exception

\`\`\`cpp
// 错误：自定义异常不继承标准异常
class MyError {
    std::string msg;
public:
    MyError(const std::string& m) : msg(m) {}
    std::string what() const { return msg; }
};

// 问题：无法用 catch(const std::exception&) 捕获

// 正确：继承 std::exception
class MyError : public std::runtime_error {
public:
    MyError(const std::string& msg) : std::runtime_error(msg) {}
};
\`\`\`

## 深入理解

### 1. 异常类的实现细节

\`\`\`cpp
// std::exception 的典型实现
namespace std {
    class exception {
    public:
        virtual ~exception() noexcept = default;
        virtual const char* what() const noexcept {
            return "std::exception";
        }
    };
    
    // logic_error 和 runtime_error 通常包含字符串成员
    class runtime_error : public exception {
        string _msg;
    public:
        explicit runtime_error(const string& msg) : _msg(msg) {}
        const char* what() const noexcept override {
            return _msg.c_str();
        }
    };
}

// 注意：what() 返回的指针在异常对象销毁后失效
// 但对于栈上的异常对象，这通常不是问题
\`\`\`

### 2. 异常对象的复制

\`\`\`cpp
// 异常对象可能被复制多次
void example() {
    try {
        throw MyException("Error");  // 1. 创建临时对象
    } catch (MyException e) {  // 2. 复制到 catch 参数（如果按值捕获）
        // ...
    }
}

// 异常对象的存储：
// 1. 抛出时，异常对象被复制到"异常存储区"
// 2. 异常存储区通常是线程安全的
// 3. 异常被捕获后，异常存储区被释放

// 建议：按引用捕获，避免不必要的复制
catch (const MyException& e) { /* ... */ }
\`\`\`

### 3. 异常与 RTTI

\`\`\`cpp
#include <typeinfo>

// 异常处理使用 RTTI（运行时类型识别）
// 来匹配 catch 块

void example() {
    try {
        throw std::runtime_error("Error");
    } catch (const std::exception& e) {
        // 使用 typeid 获取实际类型
        std::cout << "Exception type: " << typeid(e).name() << std::endl;
        // 输出类似 "St13runtime_error"
    }
}

// 动态匹配过程：
// 1. 运行时检查异常类型
// 2. 与每个 catch 块的类型比较
// 3. 找到第一个匹配的 catch
\`\`\`

### 4. 异常与 noexcept 函数

\`\`\`cpp
// noexcept 函数中抛出异常会调用 std::terminate
void noThrowFunc() noexcept {
    throw std::runtime_error("Error");  // std::terminate!
}

// 条件 noexcept
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}

// 检查函数是否 noexcept
static_assert(noexcept(std::move(std::declval<int>())));
\`\`\`

### 5. 异常与性能

\`\`\`cpp
// 异常的性能特点：

// 1. 无异常路径：零成本
//    - 编译器生成异常表，但不影响正常执行路径
//    - 正常代码没有额外的检查开销

// 2. 异常抛出：高成本
//    - 需要查找异常表
//    - 需要展开栈
//    - 需要析构局部对象

// 3. 建议：
//    - 用异常表示"异常"情况，不是正常控制流
//    - 频繁发生的错误用错误码
//    - 罕见但严重的错误用异常

// 示例：错误码 vs 异常
// 频繁发生：用错误码
bool tryParse(const std::string& s, int& result);

// 罕见发生：用异常
int parse(const std::string& s);  // 格式错误时抛异常
\`\`\`
`,
            examples: [
                {
                    title: '标准异常使用示例',
                    code: `#include <iostream>
#include <stdexcept>
#include <vector>
#include <string>

class Calculator {
public:
    double divide(double a, double b) {
        if (b == 0) {
            throw std::invalid_argument("除数不能为零");
        }
        return a / b;
    }
    
    double sqrt(double x) {
        if (x < 0) {
            throw std::domain_error("不能对负数开平方");
        }
        return std::sqrt(x);
    }
    
    int getElement(const std::vector<int>& v, size_t index) {
        if (index >= v.size()) {
            throw std::out_of_range("索引越界: " + std::to_string(index));
        }
        return v[index];
    }
};

int main() {
    Calculator calc;
    
    std::cout << "=== 测试标准异常 ===" << std::endl;
    
    // 测试除零
    try {
        calc.divide(10, 0);
    } catch (const std::invalid_argument& e) {
        std::cout << "invalid_argument: " << e.what() << std::endl;
    }
    
    // 测试负数开方
    try {
        calc.sqrt(-1);
    } catch (const std::domain_error& e) {
        std::cout << "domain_error: " << e.what() << std::endl;
    }
    
    // 测试越界访问
    try {
        std::vector<int> v = {1, 2, 3};
        calc.getElement(v, 10);
    } catch (const std::out_of_range& e) {
        std::cout << "out_of_range: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示标准异常类的使用方法。'
                },
                {
                    title: '异常层次结构演示',
                    code: `#include <iostream>
#include <stdexcept>
#include <typeinfo>

void throwException(int type) {
    switch (type) {
        case 1: throw std::runtime_error("runtime_error");
        case 2: throw std::logic_error("logic_error");
        case 3: throw std::out_of_range("out_of_range");
        case 4: throw std::invalid_argument("invalid_argument");
        case 5: throw 42;  // 非标准异常
    }
}

int main() {
    std::cout << "=== 异常层次结构演示 ===" << std::endl;
    
    for (int i = 1; i <= 5; ++i) {
        std::cout << "\\n测试 " << i << ":" << std::endl;
        try {
            throwException(i);
        }
        catch (const std::out_of_range& e) {
            std::cout << "  捕获 out_of_range: " << e.what() << std::endl;
        }
        catch (const std::logic_error& e) {
            std::cout << "  捕获 logic_error: " << e.what() << std::endl;
        }
        catch (const std::runtime_error& e) {
            std::cout << "  捕获 runtime_error: " << e.what() << std::endl;
        }
        catch (const std::exception& e) {
            std::cout << "  捕获 exception: " << e.what() << std::endl;
        }
        catch (...) {
            std::cout << "  捕获未知异常" << std::endl;
        }
    }
    
    return 0;
}`,
                    description: '演示异常捕获的顺序和层次结构。'
                }
            ],
            handsOn: {
                title: '实现安全的数组类',
                description: '实现一个安全的数组类，使用标准异常处理错误。',
                initialCode: `#include <iostream>
#include <stdexcept>
#include <string>

class SafeArray {
private:
    int* data;
    size_t size;
    static const size_t MAX_SIZE = 1000;
    
public:
    // TODO: 实现构造函数
    SafeArray(size_t s) {
        // 检查s是否为0，抛出std::invalid_argument
        // 检查s是否超过MAX_SIZE，抛出std::length_error
        // 分配内存，如果失败让std::bad_alloc自然抛出
    }
    
    // TODO: 实现析构函数
    ~SafeArray() {
        // 释放内存
    }
    
    // TODO: 实现at方法
    int& at(size_t index) {
        // 检查index是否越界，抛出std::out_of_range
        // 返回data[index]
    }
    
    // TODO: 实现getSize方法
    size_t getSize() const {
        // 返回size
    }
    
    // 禁止拷贝
    SafeArray(const SafeArray&) = delete;
    SafeArray& operator=(const SafeArray&) = delete;
};

int main() {
    std::cout << "=== 安全数组测试 ===" << std::endl;
    
    // 测试正常情况
    try {
        SafeArray arr(5);
        for (size_t i = 0; i < arr.getSize(); ++i) {
            arr.at(i) = i * 10;
        }
        std::cout << "数组创建成功，大小: " << arr.getSize() << std::endl;
        std::cout << "arr[2] = " << arr.at(2) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    // 测试越界
    try {
        SafeArray arr(5);
        arr.at(10);  // 应该抛出out_of_range
    } catch (const std::out_of_range& e) {
        std::cout << "\\n越界测试: " << e.what() << std::endl;
    }
    
    // 测试大小为0
    try {
        SafeArray arr(0);  // 应该抛出invalid_argument
    } catch (const std::invalid_argument& e) {
        std::cout << "\\n大小为0测试: " << e.what() << std::endl;
    }
    
    // 测试大小过大
    try {
        SafeArray arr(10000);  // 应该抛出length_error
    } catch (const std::length_error& e) {
        std::cout << "\\n大小过大测试: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `=== 安全数组测试 ===
数组创建成功，大小: 5
arr[2] = 20

越界测试: Index out of range

大小为0测试: Array size cannot be zero

大小过大测试: Array size exceeds maximum`,
                solutionRegex: 'invalid_argument|length_error|out_of_range|throw|new int',
                hint: '使用invalid_argument、length_error、out_of_range等标准异常',
                xp: 180
            },
            references: [
                { title: '标准异常类', book: 'C++ Primer 第五版', chapter: '第18章' },
                { title: '异常与错误处理', book: 'The C++ Programming Language', chapter: '第13章' }
            ],
            assistantTips: [
                '所有标准异常继承自std::exception',
                'logic_error用于可预防的逻辑错误',
                'runtime_error用于运行时错误',
                '捕获异常时从具体到一般'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::out_of_range继承自哪个类？', 
                    options: [
                        { text: 'std::runtime_error' }, 
                        { text: 'std::logic_error', correct: true }, 
                        { text: 'std::exception' }, 
                        { text: 'std::error' }
                    ], 
                    explanation: 'std::out_of_range继承自std::logic_error。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个异常用于内存分配失败？', 
                    options: [
                        { text: 'std::runtime_error' }, 
                        { text: 'std::bad_alloc', correct: true }, 
                        { text: 'std::memory_error' }, 
                        { text: 'std::overflow_error' }
                    ], 
                    explanation: 'std::bad_alloc在new失败时抛出。' 
                },
                { 
                    type: 'single', 
                    question: 'std::exception的what()方法返回什么？', 
                    options: [
                        { text: '错误码' }, 
                        { text: '异常描述信息', correct: true }, 
                        { text: '异常类型' }, 
                        { text: '文件名' }
                    ], 
                    explanation: 'what()返回C风格字符串，描述异常信息。' 
                },
                { 
                    type: 'single', 
                    question: '捕获异常的正确顺序是？', 
                    options: [
                        { text: '从一般到具体' }, 
                        { text: '从具体到一般', correct: true }, 
                        { text: '任意顺序' }, 
                        { text: '按字母顺序' }
                    ], 
                    explanation: '捕获异常时应该从具体（派生类）到一般（基类）。' 
                },
                { 
                    type: 'single', 
                    question: 'std::runtime_error适合用于？', 
                    options: [
                        { text: '编译时可检测的错误' }, 
                        { text: '运行时才能发现的错误', correct: true }, 
                        { text: '语法错误' }, 
                        { text: '链接错误' }
                    ], 
                    explanation: 'runtime_error用于运行时错误，无法在编译时预测。' 
                }
            ]
        },
        {
            id: '22.3',
            title: '自定义异常类',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 自定义异常类

### 为什么要自定义异常类？

1. **更精确的错误信息**：包含特定上下文
2. **更好的错误分类**：区分不同类型的错误
3. **携带额外数据**：错误码、文件名、行号等
4. **统一错误处理**：便于项目统一管理

### 基本自定义异常

\`\`\`cpp
#include <exception>
#include <string>
#include <iostream>

// 继承自std::exception
class MyException : public std::exception {
private:
    std::string message;
    
public:
    explicit MyException(const std::string& msg) : message(msg) {}
    
    // 重写what()方法
    const char* what() const noexcept override {
        return message.c_str();
    }
};

void func() {
    throw MyException("自定义异常信息");
}
\`\`\`

### 继承标准异常类

\`\`\`cpp
#include <stdexcept>
#include <string>
#include <iostream>

// 继承自std::runtime_error
class FileError : public std::runtime_error {
public:
    explicit FileError(const std::string& msg) 
        : std::runtime_error(msg) {}
};

class FileNotFoundError : public FileError {
private:
    std::string filename;
    
public:
    explicit FileNotFoundError(const std::string& file)
        : FileError("File not found: " + file), filename(file) {}
    
    const std::string& getFilename() const { return filename; }
};

class FilePermissionError : public FileError {
private:
    std::string filename;
    std::string operation;
    
public:
    FilePermissionError(const std::string& file, const std::string& op)
        : FileError("Permission denied: " + op + " on " + file),
          filename(file), operation(op) {}
    
    const std::string& getFilename() const { return filename; }
    const std::string& getOperation() const { return operation; }
};
\`\`\`

### 携带额外信息的异常

\`\`\`cpp
#include <exception>
#include <string>
#include <ctime>

class DatabaseException : public std::exception {
private:
    std::string message;
    int errorCode;
    std::string query;
    time_t timestamp;
    
public:
    DatabaseException(const std::string& msg, int code, const std::string& q)
        : message(msg), errorCode(code), query(q), timestamp(std::time(nullptr)) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    int getErrorCode() const { return errorCode; }
    const std::string& getQuery() const { return query; }
    time_t getTimestamp() const { return timestamp; }
    
    std::string getFullInfo() const {
        return "Error " + std::to_string(errorCode) + 
               ": " + message + 
               " (Query: " + query + ")";
    }
};
\`\`\`

### 带错误码的异常

\`\`\`cpp
#include <exception>
#include <string>
#include <map>

enum class ErrorCode {
    Success = 0,
    InvalidInput = 1001,
    NotFound = 1002,
    PermissionDenied = 1003,
    InternalError = 2001
};

class ErrorCodeException : public std::exception {
private:
    ErrorCode code;
    std::string message;
    
    static std::map<ErrorCode, std::string> errorMessages;
    
public:
    ErrorCodeException(ErrorCode c, const std::string& extra = "")
        : code(c) {
        message = errorMessages[code];
        if (!extra.empty()) {
            message += ": " + extra;
        }
    }
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    ErrorCode getErrorCode() const { return code; }
    
    int getErrorCodeValue() const { return static_cast<int>(code); }
};

std::map<ErrorCode, std::string> ErrorCodeException::errorMessages = {
    {ErrorCode::Success, "Success"},
    {ErrorCode::InvalidInput, "Invalid input"},
    {ErrorCode::NotFound, "Not found"},
    {ErrorCode::PermissionDenied, "Permission denied"},
    {ErrorCode::InternalError, "Internal error"}
};
\`\`\`

### 带上下文信息的异常

\`\`\`cpp
#include <exception>
#include <string>
#include <sstream>

class ContextException : public std::exception {
private:
    std::string message;
    std::string file;
    int line;
    std::string function;
    
public:
    ContextException(const std::string& msg, 
                     const std::string& f, int l, const std::string& func)
        : message(msg), file(f), line(l), function(func) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    std::string getContext() const {
        std::ostringstream oss;
        oss << file << ":" << line << " in " << function;
        return oss.str();
    }
    
    std::string getFullMessage() const {
        return message + " at " + getContext();
    }
};

// 辅助宏
#define THROW_CONTEXT(msg) \\
    throw ContextException(msg, __FILE__, __LINE__, __func__)
\`\`\`

### 异常层次结构设计

\`\`\`cpp
#include <exception>
#include <string>

// 基类：应用异常
class AppException : public std::exception {
protected:
    std::string message;
    
public:
    explicit AppException(const std::string& msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
};

// 网络异常
class NetworkException : public AppException {
public:
    explicit NetworkException(const std::string& msg) : AppException(msg) {}
};

class ConnectionException : public NetworkException {
public:
    ConnectionException(const std::string& host, int port)
        : NetworkException("Failed to connect to " + host + ":" + 
                          std::to_string(port)) {}
};

class TimeoutException : public NetworkException {
public:
    explicit TimeoutException(int seconds)
        : NetworkException("Connection timeout after " + 
                          std::to_string(seconds) + " seconds") {}
};

// 文件异常
class FileException : public AppException {
public:
    explicit FileException(const std::string& msg) : AppException(msg) {}
};

class FileNotFoundException : public FileException {
public:
    explicit FileNotFoundException(const std::string& file)
        : FileException("File not found: " + file) {}
};

class FileWriteException : public FileException {
public:
    FileWriteException(const std::string& file, const std::string& reason)
        : FileException("Cannot write to " + file + ": " + reason) {}
};
\`\`\`

### 最佳实践

1. **继承适当的基类**：通常继承std::exception或其派生类
2. **重写what()方法**：提供有意义的错误信息
3. **使用noexcept**：what()方法不应抛出异常
4. **携带上下文信息**：帮助调试和日志记录
5. **设计异常层次**：便于分类处理

## 最佳实践

### 1. 异常类设计原则

\`\`\`cpp
// 好的异常类设计
class GoodException : public std::runtime_error {
public:
    explicit GoodException(const std::string& msg)
        : std::runtime_error(msg) {}
    
    // what() 已经由 runtime_error 实现
    // 可以添加额外的访问器
};

// 避免：过于复杂的异常类
class BadException {
    std::vector<int> data;  // 可能抛出异常的成员
    std::string message;
public:
    BadException(const std::string& msg, const std::vector<int>& d)
        : message(msg), data(d) {}  // 如果 data 分配失败？
    
    const char* what() const { return message.c_str(); }  // 缺少 noexcept
};
\`\`\`

### 2. 使用 constexpr 构造函数

\`\`\`cpp
// C++11 起，异常类可以使用 constexpr
class ConstexprException : public std::exception {
    const char* msg;
public:
    constexpr explicit ConstexprException(const char* m) : msg(m) {}
    const char* what() const noexcept override { return msg; }
};

// 可以在编译期创建
constexpr ConstexprException compileTimeError("Compile time error");
\`\`\`

### 3. 提供格式化的错误信息

\`\`\`cpp
#include <sstream>
#include <iomanip>

class FormattedException : public std::runtime_error {
public:
    template<typename... Args>
    FormattedException(const char* format, Args... args)
        : std::runtime_error(formatString(format, args...)) {}
    
private:
    template<typename... Args>
    static std::string formatString(const char* format, Args... args) {
        std::ostringstream oss;
        formatImpl(oss, format, args...);
        return oss.str();
    }
    
    template<typename T, typename... Args>
    static void formatImpl(std::ostringstream& oss, const char* format, 
                          T first, Args... rest) {
        while (*format) {
            if (*format == '%' && *(format + 1) == '%') {
                oss << '%';
                format += 2;
            } else if (*format == '%') {
                oss << first;
                formatImpl(oss, format + 1, rest...);
                return;
            } else {
                oss << *format++;
            }
        }
    }
    
    static void formatImpl(std::ostringstream& oss, const char* format) {
        oss << format;
    }
};
\`\`\`

### 4. 使用异常层次结构

\`\`\`cpp
// 项目级异常层次
namespace app {
    // 基类
    class Exception : public std::exception {
    protected:
        std::string message;
    public:
        explicit Exception(const std::string& msg) : message(msg) {}
        const char* what() const noexcept override { return message.c_str(); }
    };
    
    // 分类
    class IOError : public Exception {
    public:
        explicit IOError(const std::string& msg) : Exception(msg) {}
    };
    
    class NetworkError : public Exception {
    public:
        explicit NetworkError(const std::string& msg) : Exception(msg) {}
    };
    
    class ValidationError : public Exception {
    public:
        explicit ValidationError(const std::string& msg) : Exception(msg) {}
    };
    
    // 具体异常
    class FileNotFoundError : public IOError {
    public:
        explicit FileNotFoundError(const std::string& file)
            : IOError("File not found: " + file) {}
    };
    
    class ConnectionTimeoutError : public NetworkError {
    public:
        ConnectionTimeoutError(const std::string& host, int timeout)
            : NetworkError("Connection to " + host + " timed out after " + 
                          std::to_string(timeout) + "ms") {}
    };
}
\`\`\`

### 5. 提供异常转换函数

\`\`\`cpp
// 将系统错误转换为异常
#include <system_error>

class SystemException : public std::system_error {
public:
    explicit SystemException(int errorCode, const std::string& context = "")
        : std::system_error(
            std::error_code(errorCode, std::system_category()),
            context
        ) {}
};

void checkSystemCall(int result, const std::string& operation) {
    if (result < 0) {
        throw SystemException(errno, operation);
    }
}

// 使用
void openFile(const std::string& filename) {
    int fd = ::open(filename.c_str(), O_RDONLY);
    checkSystemCall(fd, "open(" + filename + ")");
}
\`\`\`

## 常见错误

### 1. 异常类中存储动态数据

\`\`\`cpp
// 危险：异常类构造函数可能抛出异常
class DangerousException : public std::exception {
    std::string message;
    std::vector<int> data;  // 可能抛出 bad_alloc
public:
    DangerousException(const std::string& msg, const std::vector<int>& d)
        : message(msg), data(d) {}  // 如果 data 复制失败？
};
\`\`\`

### 2. what() 方法抛出异常

\`\`\`cpp
// 错误：what() 不应该抛出异常
class BadException : public std::exception {
    std::string message;
public:
    const char* what() const {  // 缺少 noexcept
        return message.c_str();  // 如果 message 无效？
    }
};

// 正确
class GoodException : public std::exception {
    std::string message;
public:
    const char* what() const noexcept override {
        return message.c_str();
    }
};
\`\`\`

### 3. 异常类不继承 std::exception

\`\`\`cpp
// 问题：无法用标准方式捕获
class MyError {
    std::string msg;
public:
    MyError(const std::string& m) : msg(m) {}
};

try {
    throw MyError("Error");
} catch (const std::exception& e) {
    // 捕获不到！
} catch (...) {
    // 只能在这里捕获
}
\`\`\`

### 4. 异常信息不足

\`\`\`cpp
// 不好：信息不足
throw std::runtime_error("Error");

// 好：提供详细信息
throw std::runtime_error(
    "Failed to open configuration file '" + filename + 
    "': " + std::strerror(errno)
);
\`\`\`

### 5. 异常类过于复杂

\`\`\`cpp
// 过于复杂
class OverEngineeredException : public std::exception {
    std::string message;
    std::string file;
    int line;
    std::string function;
    std::time_t timestamp;
    std::map<std::string, std::string> context;
    std::vector<std::string> stackTrace;
    // ... 太多成员
};

// 简洁有效
class SimpleException : public std::runtime_error {
public:
    explicit SimpleException(const std::string& msg)
        : std::runtime_error(msg) {}
};
\`\`\`

## 深入理解

### 1. 异常对象的存储

\`\`\`cpp
// 异常对象存储在特殊区域
void example() {
    try {
        throw MyException("Error");
        // 异常对象被复制到"异常存储区"
        // 这是一个由运行时管理的内存区域
    } catch (const MyException& e) {
        // e 引用异常存储区中的对象
    }
}

// 异常存储区的特点：
// 1. 线程安全：每个线程有自己的存储区
// 2. 大小有限：通常足够存储标准异常
// 3. 自动管理：异常处理后自动释放
\`\`\`

### 2. 异常类的复制语义

\`\`\`cpp
// 异常对象可能被复制多次
class MyException : public std::exception {
public:
    MyException() { std::cout << "构造" << std::endl; }
    MyException(const MyException&) { std::cout << "复制" << std::endl; }
    ~MyException() { std::cout << "析构" << std::endl; }
};

void test() {
    try {
        throw MyException();  // 1. 构造
    } catch (MyException e) {  // 2. 复制到 catch 参数
        // 3. 使用
    }  // 4. 析构 catch 参数
    // 5. 析构异常存储区中的对象
}

// 建议：按引用捕获，避免复制
catch (const MyException& e) { /* ... */ }
\`\`\`

### 3. 异常与虚函数

\`\`\`cpp
// 虚函数可以抛出异常
class Base {
public:
    virtual void func() {
        throw std::runtime_error("Base error");
    }
};

class Derived : public Base {
public:
    void func() override {
        throw std::logic_error("Derived error");  // 可以抛出不同类型的异常
    }
};

// 注意：异常类型不是函数签名的一部分
// 但 noexcept 说明符是
class SafeBase {
public:
    virtual void func() noexcept {  // 要求派生类也不抛出
        // ...
    }
};

class SafeDerived : public SafeBase {
public:
    void func() noexcept override {  // 必须也是 noexcept
        // ...
    }
};
\`\`\`

### 4. 异常与模板

\`\`\`cpp
// 模板类中的异常
template<typename T>
class Container {
public:
    T get(size_t index) const {
        if (index >= data.size()) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
    
private:
    std::vector<T> data;
};

// 模板函数中的异常
template<typename T>
T divide(T a, T b) {
    if (b == 0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

// 条件 noexcept
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
\`\`\`

### 5. 异常与多线程

\`\`\`cpp
#include <exception>
#include <thread>
#include <future>

// 异常可以在线程间传播
std::future<int> asyncTask() {
    return std::async(std::launch::async, []() {
        throw std::runtime_error("Async error");
        return 0;
    });
}

void handleAsyncException() {
    auto future = asyncTask();
    try {
        int result = future.get();  // 异常在此重新抛出
    } catch (const std::runtime_error& e) {
        std::cout << "Caught: " << e.what() << std::endl;
    }
}

// 注意：
// 1. 异常不能跨线程边界直接传播
// 2. std::future 会捕获并存储异常
// 3. get() 时重新抛出异常
\`\`\`
`,
            examples: [
                {
                    title: '文件操作异常',
                    code: `#include <iostream>
#include <exception>
#include <string>
#include <fstream>

// 文件异常基类
class FileException : public std::exception {
protected:
    std::string message;
    std::string filename;
    
public:
    FileException(const std::string& msg, const std::string& file)
        : message(msg), filename(file) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    const std::string& getFilename() const { return filename; }
};

// 文件未找到异常
class FileNotFoundException : public FileException {
public:
    explicit FileNotFoundException(const std::string& file)
        : FileException("File not found: " + file, file) {}
};

// 文件权限异常
class FilePermissionException : public FileException {
private:
    std::string operation;
    
public:
    FilePermissionException(const std::string& file, const std::string& op)
        : FileException("Permission denied: " + op + " on " + file, file),
          operation(op) {}
    
    const std::string& getOperation() const { return operation; }
};

// 安全的文件读取函数
std::string readFile(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw FileNotFoundException(filename);
    }
    
    std::string content((std::istreambuf_iterator<char>(file)),
                        std::istreambuf_iterator<char>());
    return content;
}

int main() {
    std::cout << "=== 文件异常测试 ===" << std::endl;
    
    try {
        std::string content = readFile("nonexistent.txt");
        std::cout << content << std::endl;
    }
    catch (const FileNotFoundException& e) {
        std::cout << "FileNotFoundException: " << e.what() << std::endl;
        std::cout << "文件名: " << e.getFilename() << std::endl;
    }
    catch (const FileException& e) {
        std::cout << "FileException: " << e.what() << std::endl;
    }
    catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示自定义文件异常类的实现和使用。'
                },
                {
                    title: '带错误码的异常系统',
                    code: `#include <iostream>
#include <exception>
#include <string>
#include <map>

// 错误码枚举
enum class ErrorCode {
    Success = 0,
    InvalidInput = 1001,
    NotFound = 1002,
    AlreadyExists = 1003,
    PermissionDenied = 1004,
    Timeout = 1005,
    InternalError = 2001
};

// 带错误码的异常
class SystemException : public std::exception {
private:
    ErrorCode code;
    std::string message;
    std::string context;
    
    static std::map<ErrorCode, std::string> errorMessages;
    
public:
    SystemException(ErrorCode c, const std::string& ctx = "")
        : code(c), context(ctx) {
        message = "[" + std::to_string(static_cast<int>(code)) + "] " +
                  errorMessages[code];
        if (!context.empty()) {
            message += " - " + context;
        }
    }
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    ErrorCode getErrorCode() const { return code; }
    const std::string& getContext() const { return context; }
};

std::map<ErrorCode, std::string> SystemException::errorMessages = {
    {ErrorCode::Success, "Success"},
    {ErrorCode::InvalidInput, "Invalid input"},
    {ErrorCode::NotFound, "Resource not found"},
    {ErrorCode::AlreadyExists, "Resource already exists"},
    {ErrorCode::PermissionDenied, "Permission denied"},
    {ErrorCode::Timeout, "Operation timeout"},
    {ErrorCode::InternalError, "Internal error"}
};

// 使用示例
void processUser(int userId) {
    if (userId <= 0) {
        throw SystemException(ErrorCode::InvalidInput, "userId=" + std::to_string(userId));
    }
    if (userId == 404) {
        throw SystemException(ErrorCode::NotFound, "userId=" + std::to_string(userId));
    }
    std::cout << "处理用户: " << userId << std::endl;
}

int main() {
    std::cout << "=== 错误码异常系统 ===" << std::endl;
    
    // 测试无效输入
    try {
        processUser(-1);
    } catch (const SystemException& e) {
        std::cout << "\\n错误: " << e.what() << std::endl;
        std::cout << "错误码: " << static_cast<int>(e.getErrorCode()) << std::endl;
    }
    
    // 测试未找到
    try {
        processUser(404);
    } catch (const SystemException& e) {
        std::cout << "\\n错误: " << e.what() << std::endl;
        std::cout << "上下文: " << e.getContext() << std::endl;
    }
    
    // 测试正常情况
    try {
        processUser(123);
    } catch (const SystemException& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示带错误码的异常系统实现。'
                }
            ],
            handsOn: {
                title: '实现网络异常类',
                description: '实现一套网络相关的异常类层次结构。',
                initialCode: `#include <iostream>
#include <exception>
#include <string>

// TODO: 实现网络异常基类
// 继承自std::exception
// 包含message成员变量
// 重写what()方法
class NetworkException : public std::exception {
protected:
    std::string message;
    
public:
    // TODO: 实现构造函数
    explicit NetworkException(const std::string& msg) {
        // 设置message
    }
    
    // TODO: 重写what()方法
    const char* what() const noexcept override {
        // 返回message.c_str()
    }
};

// TODO: 实现连接异常类
// 继承自NetworkException
// 包含host和port成员
class ConnectionException : public NetworkException {
private:
    std::string host;
    int port;
    
public:
    // TODO: 实现构造函数
    // message格式: "Failed to connect to [host]:[port]"
    ConnectionException(const std::string& h, int p) 
        : NetworkException(""), host(h), port(p) {
        // 设置message
    }
    
    // TODO: 实现getHost()方法
    const std::string& getHost() const {
        // 返回host
    }
    
    // TODO: 实现getPort()方法
    int getPort() const {
        // 返回port
    }
};

// TODO: 实现超时异常类
// 继承自NetworkException
// 包含timeout成员（秒数）
class TimeoutException : public NetworkException {
private:
    int timeout;
    
public:
    // TODO: 实现构造函数
    // message格式: "Connection timeout after [timeout] seconds"
    explicit TimeoutException(int t) : NetworkException(""), timeout(t) {
        // 设置message
    }
    
    // TODO: 实现getTimeout()方法
    int getTimeout() const {
        // 返回timeout
    }
};

void connectToServer(const std::string& host, int port, int timeout) {
    // 模拟连接失败
    if (host == "timeout.example.com") {
        throw TimeoutException(timeout);
    }
    if (host == "unreachable.example.com") {
        throw ConnectionException(host, port);
    }
    std::cout << "成功连接到 " << host << ":" << port << std::endl;
}

int main() {
    std::cout << "=== 网络异常测试 ===" << std::endl;
    
    // 测试超时
    try {
        connectToServer("timeout.example.com", 80, 30);
    } catch (const TimeoutException& e) {
        std::cout << "\\nTimeoutException: " << e.what() << std::endl;
        std::cout << "超时时间: " << e.getTimeout() << " 秒" << std::endl;
    } catch (const NetworkException& e) {
        std::cout << "NetworkException: " << e.what() << std::endl;
    }
    
    // 测试连接失败
    try {
        connectToServer("unreachable.example.com", 8080, 10);
    } catch (const ConnectionException& e) {
        std::cout << "\\nConnectionException: " << e.what() << std::endl;
        std::cout << "主机: " << e.getHost() << std::endl;
        std::cout << "端口: " << e.getPort() << std::endl;
    } catch (const NetworkException& e) {
        std::cout << "NetworkException: " << e.what() << std::endl;
    }
    
    // 测试成功
    try {
        connectToServer("example.com", 80, 10);
    } catch (const NetworkException& e) {
        std::cout << "NetworkException: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `=== 网络异常测试 ===

TimeoutException: Connection timeout after 30 seconds
超时时间: 30 秒

ConnectionException: Failed to connect to unreachable.example.com:8080
主机: unreachable.example.com
端口: 8080
成功连接到 example.com:80`,
                solutionRegex: 'NetworkException|ConnectionException|TimeoutException|what\\(\\)|message',
                hint: '继承NetworkException，在构造函数中设置message，重写what()方法',
                xp: 200
            },
            references: [
                { title: '自定义异常类', book: 'C++ Primer 第五版', chapter: '第18章' },
                { title: '异常设计', book: 'Effective C++', chapter: '条款9-10' }
            ],
            assistantTips: [
                '继承std::exception或其派生类',
                '重写what()方法并标记noexcept',
                '携带足够的上下文信息',
                '设计合理的异常层次结构'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '自定义异常类应该继承哪个类？', 
                    options: [
                        { text: 'std::string' }, 
                        { text: 'std::exception或其派生类', correct: true }, 
                        { text: 'void*' }, 
                        { text: 'int' }
                    ], 
                    explanation: '自定义异常类应该继承std::exception或其派生类，以符合标准异常体系。' 
                },
                { 
                    type: 'single', 
                    question: 'what()方法应该标记什么？', 
                    options: [
                        { text: 'virtual' }, 
                        { text: 'noexcept', correct: true }, 
                        { text: 'override' }, 
                        { text: 'const' }
                    ], 
                    explanation: 'what()方法不应该抛出异常，应该标记noexcept。' 
                },
                { 
                    type: 'single', 
                    question: '自定义异常类可以携带什么信息？', 
                    options: [
                        { text: '只能携带字符串' }, 
                        { text: '错误码、文件名、行号等任意信息', correct: true }, 
                        { text: '只能携带整数' }, 
                        { text: '不能携带额外信息' }
                    ], 
                    explanation: '自定义异常类可以携带任意有助于调试和错误处理的信息。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是好的异常类设计？', 
                    options: [
                        { text: '所有异常都是同一个类' }, 
                        { text: '按错误类型设计层次结构', correct: true }, 
                        { text: '每个函数一个异常类' }, 
                        { text: '不使用异常类' }
                    ], 
                    explanation: '好的异常类设计应该按错误类型组织层次结构，便于分类处理。' 
                },
                { 
                    type: 'single', 
                    question: '异常类的构造函数应该做什么？', 
                    options: [
                        { text: '抛出异常' }, 
                        { text: '初始化错误信息', correct: true }, 
                        { text: '分配大量内存' }, 
                        { text: '执行复杂计算' }
                    ], 
                    explanation: '异常类的构造函数应该简单快速，主要用于初始化错误信息。' 
                }
            ]
        },
        {
            id: '22.4',
            title: '异常安全保证：基本、强、无抛',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 异常安全保证：基本、强、无抛

### 什么是异常安全？

异常安全是指当异常发生时，程序仍能保持正确状态，不会泄露资源或破坏数据。

### 三种异常安全保证

#### 1. 基本保证（Basic Guarantee）

**定义**：异常发生后，对象仍处于有效状态，资源不会泄漏。

\`\`\`cpp
class String {
private:
    char* data;
    size_t size;
    
public:
    void append(const char* str) {
        // 基本保证：即使失败，对象仍有效
        char* newData = new char[size + strlen(str) + 1];
        strcpy(newData, data);
        strcat(newData, str);
        
        delete[] data;      // 先释放旧资源
        data = newData;     // 再更新指针
        size += strlen(str);
    }
};
\`\`\`

#### 2. 强保证（Strong Guarantee）

**定义**：异常发生后，操作回滚，状态不变（原子操作）。

\`\`\`cpp
class String {
private:
    char* data;
    size_t size;
    
public:
    void append(const char* str) {
        // 强保证：创建临时对象，成功后交换
        char* newData = new char[size + strlen(str) + 1];
        strcpy(newData, data);
        strcat(newData, str);
        
        // 原子交换
        char* oldData = data;
        data = newData;
        delete[] oldData;
        size += strlen(str);
    }
    
    // 更好的方式：使用拷贝交换惯用法
    void append(const std::string& str) {
        std::string temp = data;  // 创建副本
        temp += str;               // 修改副本
        std::swap(data, temp);     // 原子交换
    }
};
\`\`\`

#### 3. 无抛保证（No-throw Guarantee）

**定义**：操作保证不会抛出异常。

\`\`\`cpp
class String {
public:
    // 析构函数隐式noexcept
    ~String() {
        delete[] data;  // 不会抛出异常
    }
    
    // swap操作标记noexcept
    void swap(String& other) noexcept {
        std::swap(data, other.data);
        std::swap(size, other.size);
    }
    
    // 移动操作标记noexcept
    String(String&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }
};
\`\`\`

### 实现强保证的技术

#### 1. 拷贝交换惯用法（Copy-and-Swap）

\`\`\`cpp
class Container {
private:
    std::vector<int> data;
    
public:
    // 强异常安全保证
    void addElement(int value) {
        std::vector<int> temp = data;  // 1. 创建副本
        temp.push_back(value);          // 2. 修改副本
        std::swap(data, temp);          // 3. 原子交换
    }
    
    // 赋值运算符
    Container& operator=(Container other) {  // 值传递创建副本
        swap(data, other.data);               // 交换
        return *this;                          // 析构other时释放旧资源
    }
};
\`\`\`

#### 2. RAII包装

\`\`\`cpp
class Transaction {
private:
    std::vector<int>& data;
    std::vector<int> backup;
    bool committed;
    
public:
    explicit Transaction(std::vector<int>& d) 
        : data(d), backup(d), committed(false) {}
    
    void commit() {
        committed = true;
    }
    
    ~Transaction() {
        if (!committed) {
            data = backup;  // 回滚
        }
    }
    
    // 禁止拷贝
    Transaction(const Transaction&) = delete;
    Transaction& operator=(const Transaction&) = delete;
};

void modifyData(std::vector<int>& data) {
    Transaction t(data);  // 创建事务
    
    // 执行可能抛出异常的操作
    data.push_back(1);
    data.push_back(2);
    process(data);  // 可能抛出异常
    
    t.commit();  // 成功则提交
    // 如果异常，析构函数自动回滚
}
\`\`\`

### 异常安全分析示例

\`\`\`cpp
#include <vector>
#include <string>
#include <iostream>

class Stack {
private:
    std::vector<int> data;
    
public:
    // 无抛保证
    bool empty() const noexcept {
        return data.empty();
    }
    
    // 无抛保证
    size_t size() const noexcept {
        return data.size();
    }
    
    // 强保证
    void push(int value) {
        data.push_back(value);  // vector::push_back提供强保证
    }
    
    // 强保证
    int top() const {
        if (empty()) {
            throw std::out_of_range("Stack is empty");
        }
        return data.back();
    }
    
    // 强保证
    void pop() {
        if (empty()) {
            throw std::out_of_range("Stack is empty");
        }
        data.pop_back();
    }
    
    // 强保证
    void swap(Stack& other) noexcept {
        data.swap(other.data);
    }
};
\`\`\`

### 组合操作的问题

\`\`\`cpp
class Widget {
private:
    std::string name;
    std::vector<int> data;
    
public:
    // 问题：两个操作，可能只成功一个
    void setName(const std::string& n) {
        name = n;      // 可能抛出异常
        data.clear();  // 如果这里抛出异常，name已改变
    }
    
    // 解决方案：使用临时变量
    void setNameSafe(const std::string& n) {
        std::string tempName = n;    // 先准备
        std::vector<int> tempData;   // 先准备
        
        name.swap(tempName);         // 原子交换
        data.swap(tempData);
    }
};
\`\`\`

### 标准库的异常安全保证

| 操作 | 保证级别 |
|------|----------|
| vector::push_back | 强保证 |
| vector::pop_back | 无抛保证 |
| vector::clear | 无抛保证 |
| vector::swap | 无抛保证 |
| string::operator+= | 强保证 |
| 析构函数 | 无抛保证 |

### 最佳实践

1. **优先使用RAII**：自动管理资源
2. **提供至少基本保证**：确保资源不泄漏
3. **尽可能提供强保证**：使用拷贝交换
4. **标记noexcept**：明确无抛保证的操作
5. **避免在析构函数中抛出异常**

## 最佳实践

### 1. 使用 RAII 实现异常安全

\`\`\`cpp
// 推荐：使用标准库 RAII 类型
void safeFunction() {
    std::unique_ptr<int[]> data(new int[1000]);
    std::vector<int> vec;
    std::string str;
    
    // 所有资源自动管理，异常安全
    process(data.get(), vec, str);
}
\`\`\`

### 2. 使用拷贝交换惯用法

\`\`\`cpp
class Container {
    std::vector<int> data;
public:
    void addElement(int value) {
        auto temp = data;    // 创建副本
        temp.push_back(value);  // 修改副本
        std::swap(data, temp);  // 原子交换
    }
};
\`\`\`

### 3. 标记 noexcept 操作

\`\`\`cpp
class MyClass {
public:
    // 移动操作应该是 noexcept
    MyClass(MyClass&& other) noexcept;
    MyClass& operator=(MyClass&& other) noexcept;
    
    // swap 应该是 noexcept
    void swap(MyClass& other) noexcept;
    
    // 析构函数隐式 noexcept
    ~MyClass();
};
\`\`\`

## 常见错误

### 1. 违反强保证

\`\`\`cpp
// 错误：部分修改
void badUpdate(std::vector<int>& a, std::vector<int>& b) {
    a.push_back(1);  // 成功
    b.push_back(2);  // 如果失败，a 已修改
}

// 正确：使用临时变量
void goodUpdate(std::vector<int>& a, std::vector<int>& b) {
    auto tempA = a, tempB = b;
    tempA.push_back(1);
    tempB.push_back(2);
    a.swap(tempA);
    b.swap(tempB);
}
\`\`\`

### 2. 析构函数抛出异常

\`\`\`cpp
// 错误：析构函数抛出异常
class BadClass {
    ~BadClass() {
        throw std::runtime_error("Error");  // 危险！
    }
};

// 正确：析构函数捕获异常
class GoodClass {
    ~GoodClass() noexcept {
        try {
            cleanup();
        } catch (...) {}
    }
};
\`\`\`

## 深入理解

### 1. 异常安全的代价

\`\`\`cpp
// 强异常安全需要额外的复制开销
void strongGuarantee(std::vector<int>& v) {
    auto temp = v;  // 复制开销
    temp.push_back(1);
    v.swap(temp);
}

// 基本保证开销更低
void basicGuarantee(std::vector<int>& v) {
    v.push_back(1);  // 如果失败，v 可能改变
}
\`\`\`

### 2. 异常安全与移动语义

\`\`\`cpp
// noexcept 移动操作使 vector 使用移动而非拷贝
class MyClass {
public:
    MyClass(MyClass&& other) noexcept;  // 重要！
};

// std::vector 重新分配时：
// - 如果移动是 noexcept，使用移动
// - 否则使用拷贝（更安全但更慢）
\`\`\`
`,
            examples: [
                {
                    title: '异常安全保证对比',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>

class SafeContainer {
private:
    std::vector<int> data;
    std::string name;
    
public:
    // 基本保证：异常后对象有效，但状态可能改变
    void pushBasic(int value) {
        data.push_back(value);  // 可能抛出bad_alloc
        // 如果抛出异常，data状态未定义但有效
    }
    
    // 强保证：异常后状态不变
    void pushStrong(int value) {
        std::vector<int> temp = data;  // 创建副本
        temp.push_back(value);          // 修改副本
        data.swap(temp);                // 原子交换
    }
    
    // 无抛保证：绝不抛出异常
    size_t size() const noexcept {
        return data.size();
    }
    
    bool empty() const noexcept {
        return data.empty();
    }
    
    void clear() noexcept {
        data.clear();
    }
    
    // 组合操作的问题
    void setBoth_Bad(const std::string& n, int value) {
        name = n;           // 可能抛出异常
        data.push_back(value);  // 如果这里失败，name已改变
    }
    
    // 组合操作的正确做法
    void setBoth_Good(const std::string& n, int value) {
        std::string tempName = n;
        std::vector<int> tempData = data;
        tempData.push_back(value);
        
        // 原子交换
        name.swap(tempName);
        data.swap(tempData);
    }
    
    void print() const {
        std::cout << "Name: " << name << ", Size: " << data.size() << std::endl;
    }
};

int main() {
    SafeContainer container;
    
    std::cout << "=== 测试强保证 ===" << std::endl;
    container.pushStrong(1);
    container.pushStrong(2);
    std::cout << "Size: " << container.size() << std::endl;
    
    std::cout << "\\n=== 测试组合操作 ===" << std::endl;
    container.setBoth_Good("test", 3);
    container.print();
    
    std::cout << "\\n=== 测试无抛保证 ===" << std::endl;
    std::cout << "Empty: " << container.empty() << std::endl;
    container.clear();
    std::cout << "After clear, Empty: " << container.empty() << std::endl;
    
    return 0;
}`,
                    description: '对比三种异常安全保证的实现。'
                },
                {
                    title: '事务模式实现强保证',
                    code: `#include <iostream>
#include <vector>
#include <string>

// 事务类：确保强异常安全
template<typename T>
class Transaction {
private:
    T& data;
    T backup;
    bool committed;
    
public:
    explicit Transaction(T& d) 
        : data(d), backup(d), committed(false) {
        std::cout << "事务开始" << std::endl;
    }
    
    void commit() {
        committed = true;
        std::cout << "事务提交" << std::endl;
    }
    
    ~Transaction() {
        if (!committed) {
            data = backup;  // 回滚
            std::cout << "事务回滚" << std::endl;
        }
    }
    
    // 禁止拷贝
    Transaction(const Transaction&) = delete;
    Transaction& operator=(const Transaction&) = delete;
};

class BankAccount {
private:
    std::string owner;
    double balance;
    
public:
    BankAccount(const std::string& o, double b) 
        : owner(o), balance(b) {}
    
    void setOwner(const std::string& o) { owner = o; }
    void setBalance(double b) { balance = b; }
    
    std::string getOwner() const { return owner; }
    double getBalance() const { return balance; }
    
    void print() const {
        std::cout << owner << ": $" << balance << std::endl;
    }
};

// 可能抛出异常的操作
void riskyOperation(BankAccount& account, bool shouldFail) {
    Transaction<BankAccount> t(account);
    
    account.setOwner(account.getOwner() + " Jr.");
    account.setBalance(account.getBalance() * 2);
    
    if (shouldFail) {
        throw std::runtime_error("操作失败");
    }
    
    t.commit();
}

int main() {
    BankAccount account("Alice", 1000);
    
    std::cout << "=== 初始状态 ===" << std::endl;
    account.print();
    
    std::cout << "\\n=== 成功的事务 ===" << std::endl;
    try {
        riskyOperation(account, false);
    } catch (const std::exception& e) {
        std::cout << "异常: " << e.what() << std::endl;
    }
    account.print();
    
    std::cout << "\\n=== 失败的事务 ===" << std::endl;
    try {
        riskyOperation(account, true);
    } catch (const std::exception& e) {
        std::cout << "异常: " << e.what() << std::endl;
    }
    account.print();  // 状态应该回滚
    
    return 0;
}`,
                    description: '使用事务模式实现强异常安全保证。'
                }
            ],
            handsOn: {
                title: '实现异常安全的容器',
                description: '实现一个异常安全的动态数组类。',
                initialCode: `#include <iostream>
#include <algorithm>
#include <stdexcept>

class SafeArray {
private:
    int* data;
    size_t size;
    size_t capacity;
    
public:
    // TODO: 实现构造函数
    SafeArray() : data(nullptr), size(0), capacity(0) {}
    
    explicit SafeArray(size_t cap) {
        // 分配内存
        // 如果cap为0，设置data=nullptr, size=0, capacity=0
        // 否则分配cap个元素，初始化为0
    }
    
    // TODO: 实现析构函数（无抛保证）
    ~SafeArray() noexcept {
        // 释放内存
    }
    
    // TODO: 实现拷贝构造函数（强保证）
    SafeArray(const SafeArray& other) {
        // 1. 分配新内存
        // 2. 复制元素
        // 3. 如果失败，确保对象有效
    }
    
    // TODO: 实现拷贝赋值运算符（强保证）
    // 使用拷贝交换惯用法
    SafeArray& operator=(SafeArray other) {
        // 交换this和other的内容
        // 返回*this
    }
    
    // TODO: 实现移动构造函数（无抛保证）
    SafeArray(SafeArray&& other) noexcept {
        // 转移资源
        // 置空源对象
    }
    
    // TODO: 实现push_back（强保证）
    void push_back(int value) {
        // 1. 如果需要扩容，创建新数组
        // 2. 复制旧元素
        // 3. 添加新元素
        // 4. 交换指针
    }
    
    // TODO: 实现at方法（强保证）
    int& at(size_t index) {
        // 检查越界，抛出out_of_range
    }
    
    // TODO: 实现size方法（无抛保证）
    size_t getSize() const noexcept {
        // 返回size
    }
    
    // TODO: 实现swap方法（无抛保证）
    void swap(SafeArray& other) noexcept {
        // 交换所有成员
    }
};

int main() {
    std::cout << "=== 异常安全容器测试 ===" << std::endl;
    
    SafeArray arr1;
    arr1.push_back(1);
    arr1.push_back(2);
    arr1.push_back(3);
    std::cout << "arr1 size: " << arr1.getSize() << std::endl;
    
    SafeArray arr2 = arr1;  // 拷贝构造
    std::cout << "arr2 size: " << arr2.getSize() << std::endl;
    
    SafeArray arr3;
    arr3 = arr1;  // 拷贝赋值
    std::cout << "arr3 size: " << arr3.getSize() << std::endl;
    
    std::cout << "\\n=== 越界测试 ===" << std::endl;
    try {
        arr1.at(10);
    } catch (const std::out_of_range& e) {
        std::cout << "异常: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `=== 异常安全容器测试 ===
arr1 size: 3
arr2 size: 3
arr3 size: 3

=== 越界测试 ===
异常: Index out of range`,
                solutionRegex: 'noexcept|swap|push_back|at|out_of_range',
                hint: '使用拷贝交换惯用法实现强保证，标记noexcept实现无抛保证',
                xp: 220
            },
            references: [
                { title: '异常安全', book: 'Effective C++', chapter: '条款29' },
                { title: '异常安全保证', book: 'Exceptional C++', chapter: '条款8-12' }
            ],
            assistantTips: [
                '基本保证：资源不泄漏，对象有效',
                '强保证：操作原子，状态不变',
                '无抛保证：绝不抛出异常',
                '使用拷贝交换实现强保证'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '基本保证意味着什么？', 
                    options: [
                        { text: '操作原子执行' }, 
                        { text: '异常后对象有效，资源不泄漏', correct: true }, 
                        { text: '不抛出异常' }, 
                        { text: '操作成功' }
                    ], 
                    explanation: '基本保证确保异常发生后对象仍处于有效状态，资源不会泄漏。' 
                },
                { 
                    type: 'single', 
                    question: '强保证意味着什么？', 
                    options: [
                        { text: '资源不泄漏' }, 
                        { text: '操作原子，异常后状态不变', correct: true }, 
                        { text: '不抛出异常' }, 
                        { text: '操作成功' }
                    ], 
                    explanation: '强保证确保异常发生后操作回滚，状态保持不变。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个操作通常提供无抛保证？', 
                    options: [
                        { text: '内存分配' }, 
                        { text: '析构函数', correct: true }, 
                        { text: '文件操作' }, 
                        { text: '网络请求' }
                    ], 
                    explanation: '析构函数应该提供无抛保证，不应该抛出异常。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝交换惯用法用于实现什么？', 
                    options: [
                        { text: '基本保证' }, 
                        { text: '强保证', correct: true }, 
                        { text: '无抛保证' }, 
                        { text: '性能优化' }
                    ], 
                    explanation: '拷贝交换惯用法是实现强异常安全保证的常用技术。' 
                },
                { 
                    type: 'single', 
                    question: 'vector::push_back提供什么保证？', 
                    options: [
                        { text: '基本保证' }, 
                        { text: '强保证', correct: true }, 
                        { text: '无抛保证' }, 
                        { text: '无保证' }
                    ], 
                    explanation: 'vector::push_back提供强异常安全保证。' 
                }
            ]
        },
        {
            id: '22.5',
            title: 'noexcept 说明符与运算符',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## noexcept 说明符与运算符

### noexcept说明符

noexcept是C++11引入的关键字，用于指定函数是否会抛出异常。

\`\`\`cpp
// 不抛出异常
void func1() noexcept {
    // 保证不抛出异常
}

// 等价写法
void func2() noexcept(true) {
    // ...
}

// 可能抛出异常
void func3() noexcept(false) {
    // ...
}

// 默认（可能抛出异常）
void func4() {
    // ...
}
\`\`\`

### noexcept与std::terminate

如果noexcept函数抛出异常，程序会调用std::terminate：

\`\`\`cpp
void dangerous() noexcept {
    throw std::runtime_error("Error");  // 调用std::terminate
}
\`\`\`

### 条件noexcept

\`\`\`cpp
#include <type_traits>

// 条件noexcept：根据模板参数决定
template<typename T>
void swap(T& a, T& b) noexcept(
    std::is_nothrow_move_constructible<T>::value &&
    std::is_nothrow_move_assignable<T>::value
) {
    T temp = std::move(a);
    a = std::move(b);
    b = std::move(temp);
}

// 更简洁的写法
template<typename T>
void swap2(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
\`\`\`

### noexcept运算符

noexcept运算符在编译时检查表达式是否不会抛出异常：

\`\`\`cpp
void noThrow() noexcept {}
void mayThrow() {}

constexpr bool b1 = noexcept(noThrow());    // true
constexpr bool b2 = noexcept(mayThrow());   // false

int x;
constexpr bool b3 = noexcept(x = 10);       // true（int赋值不抛异常）
constexpr bool b4 = noexcept(throw 42);     // false
\`\`\`

### 类型特征

\`\`\`cpp
#include <type_traits>

class MyClass {
public:
    MyClass() noexcept {}
    MyClass(const MyClass&) noexcept {}
    MyClass(MyClass&&) noexcept {}
    ~MyClass() noexcept {}
};

// 类型特征检查
static_assert(std::is_nothrow_default_constructible<MyClass>::value);
static_assert(std::is_nothrow_copy_constructible<MyClass>::value);
static_assert(std::is_nothrow_move_constructible<MyClass>::value);
static_assert(std::is_nothrow_destructible<MyClass>::value);
\`\`\`

### noexcept与函数指针

\`\`\`cpp
void (*pf1)() noexcept = func1;  // 正确
// void (*pf2)() noexcept = func3;  // 错误：func3可能抛出异常

// 可以将noexcept函数赋给普通函数指针
void (*pf3)() = func1;  // 正确
\`\`\`

### noexcept与虚函数

\`\`\`cpp
class Base {
public:
    virtual void f() noexcept;
    virtual void g();
};

class Derived : public Base {
public:
    void f() noexcept override;  // 正确：保持noexcept
    // void f() override;        // 错误：不能放宽noexcept
    
    void g() noexcept override;  // 正确：可以收紧noexcept
};
\`\`\`

### 什么时候使用noexcept？

#### 应该使用noexcept的情况

1. **析构函数**（隐式noexcept）
2. **移动构造和移动赋值**
3. **swap函数**
4. **简单操作**（如getter）

\`\`\`cpp
class Widget {
private:
    int* data;
    
public:
    // 析构函数隐式noexcept
    ~Widget() { delete data; }
    
    // 移动构造应该noexcept
    Widget(Widget&& other) noexcept 
        : data(other.data) {
        other.data = nullptr;
    }
    
    // swap应该noexcept
    void swap(Widget& other) noexcept {
        std::swap(data, other.data);
    }
    
    // getter应该noexcept
    int getData() const noexcept { return data ? *data : 0; }
};
\`\`\`

#### 不应该使用noexcept的情况

1. **可能分配内存的操作**
2. **可能抛出异常的操作**
3. **不确定的操作**

\`\`\`cpp
// 不应该标记noexcept
void processData() noexcept {  // 危险！
    std::vector<int> v(1000);  // 可能抛出bad_alloc
}
\`\`\`

### noexcept与标准容器

标准容器在重新分配时会优先使用noexcept的移动操作：

\`\`\`cpp
#include <vector>

class GoodType {
public:
    GoodType(GoodType&& other) noexcept;  // noexcept移动
};

class BadType {
public:
    BadType(BadType&& other);  // 非noexcept移动
};

std::vector<GoodType> v1;
v1.push_back(GoodType());  // 使用移动（高效）

std::vector<BadType> v2;
v2.push_back(BadType());   // 可能使用拷贝（安全但慢）
\`\`\`

### 最佳实践

1. **析构函数总是noexcept**
2. **移动操作标记noexcept**
3. **swap标记noexcept**
4. **使用条件noexcept处理模板**
5. **不要盲目标记noexcept**

## 最佳实践

### 1. 正确使用 noexcept

\`\`\`cpp
// 析构函数：隐式 noexcept，无需显式标记
class MyClass {
    ~MyClass() = default;  // 自动 noexcept
};

// 移动操作：应该标记 noexcept
class Movable {
public:
    Movable(Movable&& other) noexcept;
    Movable& operator=(Movable&& other) noexcept;
};

// swap：应该标记 noexcept
template<typename T>
void swap(T& a, T& b) noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
\`\`\`

### 2. 条件 noexcept

\`\`\`cpp
// 根据类型特征决定是否 noexcept
template<typename T>
class Container {
public:
    void push_back(const T& value) 
        noexcept(std::is_nothrow_copy_constructible<T>::value) {
        // ...
    }
};
\`\`\`

## 常见错误

### 1. 错误标记 noexcept

\`\`\`cpp
// 错误：标记 noexcept 但可能抛出异常
void badFunc() noexcept {
    throw std::runtime_error("Error");  // std::terminate!
}

// 正确：不标记或处理异常
void goodFunc() {
    throw std::runtime_error("Error");  // OK
}
\`\`\`

### 2. 忘记 noexcept 移动操作

\`\`\`cpp
// 问题：移动操作未标记 noexcept
class BadClass {
public:
    BadClass(BadClass&& other) {  // 应该是 noexcept
        // ...
    }
};

// 影响：std::vector 可能使用拷贝而非移动
\`\`\`

## 深入理解

### 1. noexcept 与优化

\`\`\`cpp
// noexcept 允许编译器优化
void func() noexcept {
    // 编译器不需要生成异常处理代码
    // 可能生成更简洁的代码
}

// noexcept 操作符
static_assert(noexcept(std::move(std::declval<int>())));
\`\`\`

### 2. noexcept 与标准库

\`\`\`cpp
// std::vector 使用 noexcept 决定移动还是拷贝
// 如果移动构造是 noexcept，使用移动
// 否则使用拷贝
\`\`\`
`,
            examples: [
                {
                    title: 'noexcept基础示例',
                    code: `#include <iostream>
#include <type_traits>
#include <vector>

// noexcept函数
void noThrowFunc() noexcept {
    std::cout << "noexcept函数" << std::endl;
}

// 普通函数
void mayThrowFunc() {
    std::cout << "普通函数" << std::endl;
}

// 条件noexcept
template<typename T>
void safeSwap(T& a, T& b) noexcept(
    std::is_nothrow_move_constructible<T>::value &&
    std::is_nothrow_move_assignable<T>::value
) {
    T temp = std::move(a);
    a = std::move(b);
    b = std::move(temp);
}

class SafeClass {
public:
    SafeClass() noexcept {}
    SafeClass(const SafeClass&) noexcept {}
    SafeClass(SafeClass&&) noexcept {}
    ~SafeClass() noexcept {}
    
    void method() noexcept {}
};

int main() {
    std::cout << "=== noexcept运算符 ===" << std::endl;
    std::cout << "noThrowFunc: " << noexcept(noThrowFunc()) << std::endl;
    std::cout << "mayThrowFunc: " << noexcept(mayThrowFunc()) << std::endl;
    
    std::cout << "\\n=== 类型特征 ===" << std::endl;
    std::cout << "int is_nothrow_move_constructible: " 
              << std::is_nothrow_move_constructible<int>::value << std::endl;
    std::cout << "std::string is_nothrow_move_constructible: " 
              << std::is_nothrow_move_constructible<std::string>::value << std::endl;
    std::cout << "SafeClass is_nothrow_move_constructible: " 
              << std::is_nothrow_move_constructible<SafeClass>::value << std::endl;
    
    std::cout << "\\n=== 条件noexcept ===" << std::endl;
    int a = 1, b = 2;
    std::cout << "swap int: " << noexcept(safeSwap(a, b)) << std::endl;
    
    SafeClass s1, s2;
    std::cout << "swap SafeClass: " << noexcept(safeSwap(s1, s2)) << std::endl;
    
    return 0;
}`,
                    description: '展示noexcept说明符和运算符的基本用法。'
                },
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
    std::cout << "=== WithNoexcept (移动是noexcept) ===" << std::endl;
    std::vector<WithNoexcept> v1;
    v1.reserve(2);
    v1.emplace_back("A");
    std::cout << "添加第二个元素（触发重新分配）:" << std::endl;
    v1.emplace_back("B");
    
    std::cout << "\\n=== WithoutNoexcept (移动不是noexcept) ===" << std::endl;
    std::vector<WithoutNoexcept> v2;
    v2.reserve(2);
    v2.emplace_back("A");
    std::cout << "添加第二个元素（触发重新分配）:" << std::endl;
    v2.emplace_back("B");
    
    return 0;
}`,
                    description: '展示noexcept对std::vector重新分配行为的影响。'
                }
            ],
            handsOn: {
                title: '实现noexcept类型特征检查',
                description: '实现一个类，并验证其noexcept属性。',
                initialCode: `#include <iostream>
#include <type_traits>
#include <utility>

class SafeContainer {
private:
    int* data;
    size_t size;
    
public:
    // TODO: 实现默认构造函数（noexcept）
    SafeContainer() noexcept : data(nullptr), size(0) {}
    
    // TODO: 实现析构函数（noexcept）
    ~SafeContainer() noexcept {
        // 释放内存
    }
    
    // TODO: 实现移动构造函数（noexcept）
    SafeContainer(SafeContainer&& other) noexcept {
        // 转移资源
        // 置空源对象
    }
    
    // TODO: 实现移动赋值运算符（noexcept）
    SafeContainer& operator=(SafeContainer&& other) noexcept {
        // 检查自赋值
        // 释放当前资源
        // 转移资源
        // 置空源对象
        return *this;
    }
    
    // TODO: 实现swap方法（noexcept）
    void swap(SafeContainer& other) noexcept {
        // 交换所有成员
    }
    
    // TODO: 实现size方法（noexcept）
    size_t getSize() const noexcept {
        // 返回size
    }
    
    // 禁止拷贝
    SafeContainer(const SafeContainer&) = delete;
    SafeContainer& operator=(const SafeContainer&) = delete;
};

int main() {
    std::cout << "=== noexcept类型特征检查 ===" << std::endl;
    
    // 检查各种操作的noexcept属性
    std::cout << "is_nothrow_default_constructible: " 
              << std::is_nothrow_default_constructible<SafeContainer>::value << std::endl;
    std::cout << "is_nothrow_move_constructible: " 
              << std::is_nothrow_move_constructible<SafeContainer>::value << std::endl;
    std::cout << "is_nothrow_move_assignable: " 
              << std::is_nothrow_move_assignable<SafeContainer>::value << std::endl;
    std::cout << "is_nothrow_destructible: " 
              << std::is_nothrow_destructible<SafeContainer>::value << std::endl;
    
    std::cout << "\\n=== noexcept运算符检查 ===" << std::endl;
    SafeContainer c1, c2;
    std::cout << "swap: " << noexcept(c1.swap(c2)) << std::endl;
    std::cout << "move construct: " << noexcept(SafeContainer(std::move(c1))) << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== noexcept类型特征检查 ===
is_nothrow_default_constructible: 1
is_nothrow_move_constructible: 1
is_nothrow_move_assignable: 1
is_nothrow_destructible: 1

=== noexcept运算符检查 ===
swap: 1
move construct: 1`,
                solutionRegex: 'noexcept|std::swap|delete\\[\\]|nullptr',
                hint: '所有操作标记noexcept，移动操作转移资源并置空源对象',
                xp: 180
            },
            references: [
                { title: 'noexcept说明符', book: 'C++ Primer 第五版', chapter: '第18章' },
                { title: 'noexcept与移动语义', book: 'Effective Modern C++', chapter: '条款14' }
            ],
            assistantTips: [
                'noexcept函数抛出异常会调用std::terminate',
                '析构函数隐式noexcept',
                '移动操作应该标记noexcept',
                '使用条件noexcept处理模板'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'noexcept函数抛出异常会怎样？', 
                    options: [
                        { text: '异常正常传播' }, 
                        { text: '调用std::terminate', correct: true }, 
                        { text: '异常被忽略' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: 'noexcept函数如果抛出异常，程序会调用std::terminate终止。' 
                },
                { 
                    type: 'single', 
                    question: 'noexcept运算符返回什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: 'bool类型的constexpr值', correct: true }, 
                        { text: 'int' }, 
                        { text: '异常类型' }
                    ], 
                    explanation: 'noexcept运算符在编译时返回bool类型的constexpr值。' 
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
                    question: '虚函数重写时noexcept可以放宽吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以', correct: true }, 
                        { text: '取决于编译器' }, 
                        { text: '只能更严格' }
                    ], 
                    explanation: '虚函数重写时不能放宽noexcept限制，但可以更严格。' 
                },
                { 
                    type: 'single', 
                    question: '为什么移动操作应该标记noexcept？', 
                    options: [
                        { text: '语法要求' }, 
                        { text: '让标准容器优先使用移动', correct: true }, 
                        { text: '提高编译速度' }, 
                        { text: '减少内存使用' }
                    ], 
                    explanation: '标准容器在重新分配时会优先使用noexcept的移动操作。' 
                }
            ]
        },
        {
            id: '22.6',
            title: '异常与性能、使用建议',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 异常与性能、使用建议

### 异常的性能影响

#### 1. 无异常时的开销

\`\`\`cpp
// 无异常路径：几乎零开销
int divide(int a, int b) {
    return a / b;  // 正常执行，无额外开销
}
\`\`\`

#### 2. 异常抛出的开销

\`\`\`cpp
#include <stdexcept>

int divide(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Division by zero");  // 高开销
    }
    return a / b;
}
\`\`\`

**异常抛出的开销包括：**
- 栈展开
- 析构函数调用
- 异常对象构造
- 查找匹配的catch块

#### 3. 异常处理机制的实现

\`\`\`
两种主要实现方式：
1. 零成本异常（Zero-cost exceptions）
   - 正常执行无开销
   - 异常抛出时高开销
   - 使用表驱动机制

2. 动态注册（Dynamic registration）
   - 每个try块有运行时开销
   - 异常抛出时开销较低
\`\`\`

### 异常 vs 错误码

#### 错误码方式

\`\`\`cpp
// 错误码方式
int divide(int a, int b, int& result) {
    if (b == 0) return -1;  // 错误码
    result = a / b;
    return 0;  // 成功
}

// 使用
int result;
if (divide(10, 0, result) != 0) {
    // 处理错误
}
\`\`\`

#### 异常方式

\`\`\`cpp
// 异常方式
int divide(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

// 使用
try {
    int result = divide(10, 0);
} catch (const std::exception& e) {
    // 处理错误
}
\`\`\`

### 性能对比

\`\`\`cpp
#include <iostream>
#include <chrono>
#include <stdexcept>

// 错误码版本
int divide_error_code(int a, int b, int& result) {
    if (b == 0) return -1;
    result = a / b;
    return 0;
}

// 异常版本
int divide_exception(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

int main() {
    const int N = 10000000;
    
    // 测试错误码（无错误情况）
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < N; ++i) {
        int result;
        divide_error_code(i, i + 1, result);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "错误码（无错误）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    // 测试异常（无错误情况）
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < N; ++i) {
        divide_exception(i, i + 1);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "异常（无错误）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    return 0;
}
\`\`\`

### 何时使用异常

#### 适合使用异常的情况

1. **真正的异常情况**：不应该发生但可能发生
2. **构造函数失败**：无法通过返回值报告
3. **深层调用**：错误需要传播到上层
4. **无法忽略的错误**：强制处理

\`\`\`cpp
class File {
private:
    std::FILE* handle;
    
public:
    // 构造函数失败必须抛出异常
    File(const std::string& filename) {
        handle = std::fopen(filename.c_str(), "r");
        if (!handle) {
            throw std::runtime_error("Cannot open file: " + filename);
        }
    }
    
    ~File() {
        if (handle) std::fclose(handle);
    }
};
\`\`\`

#### 不适合使用异常的情况

1. **预期的错误**：正常的业务逻辑
2. **性能关键代码**：频繁发生的错误
3. **简单函数**：错误码更清晰
4. **与C代码交互**：异常不兼容

\`\`\`cpp
// 不适合用异常：预期的错误
int findIndex(const std::vector<int>& v, int value) {
    for (size_t i = 0; i < v.size(); ++i) {
        if (v[i] == value) return i;
    }
    return -1;  // 未找到是预期情况，用错误码
}
\`\`\`

### 异常使用建议

#### 1. 按值抛出，按引用捕获

\`\`\`cpp
// 推荐
throw std::runtime_error("Error");  // 按值抛出

try {
    // ...
} catch (const std::exception& e) {  // 按引用捕获
    // ...
}

// 不推荐
try {
    // ...
} catch (std::exception e) {  // 按值捕获：切片问题
    // ...
}
\`\`\`

#### 2. 使用RAII管理资源

\`\`\`cpp
// 推荐
void good() {
    std::vector<int> v(1000);
    std::unique_ptr<int> p(new int(10));
    // 异常安全
}

// 不推荐
void bad() {
    int* p = new int[1000];
    // 如果这里抛出异常，内存泄漏
    delete[] p;
}
\`\`\`

#### 3. 避免异常规范（已废弃）

\`\`\`cpp
// C++11已废弃
void func() throw(std::runtime_error);  // 不推荐

// 使用noexcept
void func() noexcept;  // 推荐
\`\`\`

#### 4. 重新抛出异常

\`\`\`cpp
void func() {
    try {
        // 可能抛出异常的代码
    } catch (const std::exception& e) {
        // 记录日志
        std::cerr << "Error: " << e.what() << std::endl;
        throw;  // 重新抛出
    }
}
\`\`\`

#### 5. 捕获所有异常

\`\`\`cpp
void func() {
    try {
        // ...
    } catch (const std::exception& e) {
        // 处理标准异常
    } catch (...) {
        // 处理其他异常
        throw;  // 通常重新抛出
    }
}
\`\`\`

### 异常与构造函数

\`\`\`cpp
class Resource {
private:
    int* data1;
    int* data2;
    
public:
    Resource(size_t size1, size_t size2) {
        data1 = new int[size1];  // 第一个分配
        
        try {
            data2 = new int[size2];  // 第二个分配，可能失败
        } catch (...) {
            delete[] data1;  // 清理第一个
            throw;  // 重新抛出
        }
    }
    
    ~Resource() {
        delete[] data1;
        delete[] data2;
    }
};

// 更好的方式：使用智能指针
class BetterResource {
private:
    std::unique_ptr<int[]> data1;
    std::unique_ptr<int[]> data2;
    
public:
    BetterResource(size_t size1, size_t size2)
        : data1(std::make_unique<int[]>(size1))
        , data2(std::make_unique<int[]>(size2)) {}
};
\`\`\`

### 最佳实践总结

1. **异常用于异常情况**：不是正常的控制流
2. **使用RAII**：确保异常安全
3. **按值抛出，按引用捕获**
4. **提供有意义的错误信息**
5. **考虑性能影响**
6. **与团队约定一致**

## 最佳实践

### 1. 异常 vs 错误码的选择

\`\`\`cpp
// 使用异常：罕见但严重的错误
int parseInteger(const std::string& s) {
    // 格式错误是异常情况
    int result;
    if (sscanf(s.c_str(), "%d", &result) != 1) {
        throw std::invalid_argument("Invalid integer: " + s);
    }
    return result;
}

// 使用错误码：频繁的预期错误
bool tryParseInteger(const std::string& s, int& result) {
    // 格式错误是正常情况
    return sscanf(s.c_str(), "%d", &result) == 1;
}
\`\`\`

### 2. 避免异常用于控制流

\`\`\`cpp
// 错误：使用异常进行控制流
int findIndex(const std::vector<int>& v, int value) {
    for (size_t i = 0; i <= v.size(); ++i) {  // 故意越界
        if (v[i] == value) return i;
    }
    // 永远不会执行到这里
}

// 正确：使用返回值
std::optional<size_t> findIndex(const std::vector<int>& v, int value) {
    for (size_t i = 0; i < v.size(); ++i) {
        if (v[i] == value) return i;
    }
    return std::nullopt;
}
\`\`\`

## 常见错误

### 1. 异常过于频繁

\`\`\`cpp
// 错误：频繁抛出异常
int sum(const std::vector<int>& v) {
    int result = 0;
    for (size_t i = 0; i <= v.size(); ++i) {  // 故意越界
        try {
            result += v.at(i);
        } catch (...) {
            break;  // 使用异常结束循环
        }
    }
    return result;
}

// 正确：正常控制流
int sum(const std::vector<int>& v) {
    int result = 0;
    for (int x : v) {
        result += x;
    }
    return result;
}
\`\`\`

### 2. 忽略性能影响

\`\`\`cpp
// 问题：异常抛出开销大
void processItems(const std::vector<Item>& items) {
    for (const auto& item : items) {
        try {
            process(item);
        } catch (const std::exception& e) {
            // 如果 process 频繁失败，性能很差
        }
    }
}
\`\`\`

## 深入理解

### 1. 异常的性能模型

\`\`\`cpp
// 异常的"零成本"模型：
// - 无异常路径：没有额外开销
// - 异常抛出：高开销

// 建议：
// - 异常用于真正异常的情况
// - 预期的错误用错误码或 optional
\`\`\`

### 2. 异常与调试

\`\`\`cpp
// 异常使调试更容易
// - 调用栈自动展开
// - 错误信息丰富
// - 可以在 catch 块中设置断点

// 但也可能隐藏错误
try {
    doSomething();
} catch (...) {
    // 吞掉所有异常，隐藏问题
}
\`\`\`
`,
            examples: [
                {
                    title: '异常性能对比',
                    code: `#include <iostream>
#include <chrono>
#include <stdexcept>
#include <vector>

// 错误码版本
bool divide_error_code(int a, int b, int& result) {
    if (b == 0) return false;
    result = a / b;
    return true;
}

// 异常版本
int divide_exception(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

int main() {
    const int N = 10000000;
    
    std::cout << "=== 性能对比 ===" << std::endl;
    
    // 测试错误码（无错误）
    auto start = std::chrono::high_resolution_clock::now();
    volatile int sum = 0;
    for (int i = 0; i < N; ++i) {
        int result;
        if (divide_error_code(i, i + 1, result)) {
            sum += result;
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "错误码（无错误）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    // 测试异常（无错误）
    start = std::chrono::high_resolution_clock::now();
    sum = 0;
    for (int i = 0; i < N; ++i) {
        sum += divide_exception(i, i + 1);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "异常（无错误）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    // 测试错误码（有错误）
    start = std::chrono::high_resolution_clock::now();
    sum = 0;
    for (int i = 0; i < N; ++i) {
        int result;
        if (divide_error_code(i, 0, result)) {
            sum += result;
        }
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "错误码（有错误）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    // 测试异常（有错误）- 注意：频繁抛出异常很慢
    start = std::chrono::high_resolution_clock::now();
    sum = 0;
    for (int i = 0; i < 1000; ++i) {  // 减少次数
        try {
            sum += divide_exception(i, 0);
        } catch (...) {}
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "异常（有错误，1000次）: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << "ms" << std::endl;
    
    return 0;
}`,
                    description: '对比异常和错误码的性能差异。'
                },
                {
                    title: '异常使用建议示例',
                    code: `#include <iostream>
#include <stdexcept>
#include <memory>
#include <fstream>

// 好的异常使用：构造函数失败
class FileHandle {
private:
    std::FILE* file;
    std::string filename;
    
public:
    explicit FileHandle(const std::string& fname) : filename(fname) {
        file = std::fopen(fname.c_str(), "r");
        if (!file) {
            throw std::runtime_error("Cannot open file: " + fname);
        }
        std::cout << "打开文件: " << fname << std::endl;
    }
    
    ~FileHandle() {
        if (file) {
            std::fclose(file);
            std::cout << "关闭文件: " << filename << std::endl;
        }
    }
    
    // 禁止拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};

// 好的异常使用：深层调用
void level3(int x) {
    if (x < 0) {
        throw std::invalid_argument("x不能为负数");
    }
    std::cout << "level3处理: " << x << std::endl;
}

void level2(int x) {
    level3(x);
    std::cout << "level2完成" << std::endl;
}

void level1(int x) {
    level2(x);
    std::cout << "level1完成" << std::endl;
}

// 重新抛出异常
void processFile(const std::string& filename) {
    try {
        FileHandle file(filename);
        // 处理文件
    } catch (const std::exception& e) {
        std::cerr << "处理文件时出错: " << e.what() << std::endl;
        throw;  // 重新抛出
    }
}

int main() {
    std::cout << "=== 构造函数异常 ===" << std::endl;
    try {
        FileHandle file("nonexistent.txt");
    } catch (const std::exception& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
    }
    
    std::cout << "\\n=== 深层调用异常 ===" << std::endl;
    try {
        level1(-1);
    } catch (const std::invalid_argument& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
    }
    
    std::cout << "\\n=== 重新抛出异常 ===" << std::endl;
    try {
        processFile("test.txt");
    } catch (const std::exception& e) {
        std::cout << "外层捕获: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示异常使用的最佳实践。'
                }
            ],
            handsOn: {
                title: '分析异常使用场景',
                description: '判断以下场景是否适合使用异常，并说明原因。',
                initialCode: `#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

// 场景1：用户输入验证
// 问题：用户输入无效是否应该抛出异常？
// TODO: 分析并给出建议
bool validateInput(const std::string& input) {
    if (input.empty()) {
        // throw std::invalid_argument("输入为空");  // 是否合适？
        return false;  // 或者返回错误码？
    }
    return true;
}

// 场景2：文件打开失败
// 问题：文件不存在是否应该抛出异常？
// TODO: 分析并给出建议
class FileReader {
public:
    std::string read(const std::string& filename) {
        // 文件不存在是预期情况还是异常情况？
        // 如果是用户指定的文件，可能不存在
        // 如果是程序必需的配置文件，不存在就是错误
    }
};

// 场景3：内存分配失败
// 问题：内存不足是否应该抛出异常？
// TODO: 分析并给出建议
class BigBuffer {
public:
    BigBuffer(size_t size) {
        // 内存不足应该抛出bad_alloc吗？
        // 还是返回nullptr？
    }
};

// 场景4：网络连接超时
// 问题：网络超时是否应该抛出异常？
// TODO: 分析并给出建议
class NetworkClient {
public:
    void connect(const std::string& host, int port) {
        // 网络超时是预期情况还是异常情况？
    }
};

// 场景5：查找操作
// 问题：未找到元素是否应该抛出异常？
// TODO: 分析并给出建议
int findElement(const std::vector<int>& v, int value) {
    // 未找到应该返回-1还是抛出异常？
    for (size_t i = 0; i < v.size(); ++i) {
        if (v[i] == value) return i;
    }
    return -1;  // 或者 throw std::out_of_range("Element not found");
}

int main() {
    std::cout << "=== 异常使用场景分析 ===" << std::endl;
    
    // TODO: 为每个场景编写测试代码
    // 并说明是否应该使用异常
    
    return 0;
}`,
                expectedOutput: `=== 异常使用场景分析 ===
场景1：用户输入验证 - 不适合异常（预期情况）
场景2：文件打开失败 - 取决于上下文
场景3：内存分配失败 - 适合异常（系统错误）
场景4：网络连接超时 - 取决于上下文
场景5：查找操作 - 不适合异常（预期情况）`,
                solutionRegex: 'throw|return|invalid_argument|out_of_range',
                hint: '异常用于异常情况，预期错误用错误码',
                xp: 150
            },
            references: [
                { title: '异常与性能', book: 'Effective Modern C++', chapter: '条款14' },
                { title: '异常使用建议', book: 'C++ Core Guidelines', chapter: 'E.1-E.30' }
            ],
            assistantTips: [
                '异常用于异常情况，不是正常控制流',
                '正常执行时异常几乎零开销',
                '抛出异常开销较大',
                '使用RAII确保异常安全'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '异常在正常执行时的开销是？', 
                    options: [
                        { text: '很大' }, 
                        { text: '几乎为零', correct: true }, 
                        { text: '中等' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '现代编译器实现零成本异常，正常执行时几乎无开销。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况适合使用异常？', 
                    options: [
                        { text: '用户输入验证失败' }, 
                        { text: '构造函数失败', correct: true }, 
                        { text: '查找元素未找到' }, 
                        { text: '循环结束条件' }
                    ], 
                    explanation: '构造函数失败无法通过返回值报告，适合使用异常。' 
                },
                { 
                    type: 'single', 
                    question: '应该如何捕获异常？', 
                    options: [
                        { text: '按值捕获' }, 
                        { text: '按引用捕获', correct: true }, 
                        { text: '按指针捕获' }, 
                        { text: '任意方式' }
                    ], 
                    explanation: '按引用捕获可以避免切片问题，是推荐的方式。' 
                },
                { 
                    type: 'single', 
                    question: '频繁抛出异常的性能影响是？', 
                    options: [
                        { text: '无影响' }, 
                        { text: '开销很大', correct: true }, 
                        { text: '开销很小' }, 
                        { text: '取决于异常类型' }
                    ], 
                    explanation: '异常抛出涉及栈展开等操作，频繁抛出开销很大。' 
                },
                { 
                    type: 'single', 
                    question: '重新抛出异常使用什么语句？', 
                    options: [
                        { text: 'throw e;' }, 
                        { text: 'throw;', correct: true }, 
                        { text: 'rethrow;' }, 
                        { text: 'throw e.what();' }
                    ], 
                    explanation: 'throw;语句重新抛出当前捕获的异常。' 
                }
            ]
        },
        {
            id: '22.7',
            title: '替代方案：std::optional、std::expected（C++23）',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 替代方案：std::optional、std::expected（C++23）

### 为什么需要替代方案？

异常虽然强大，但有些场景不适合：
1. **预期的错误**：不是真正的异常
2. **性能敏感**：频繁发生的错误
3. **禁用异常**：某些环境不允许异常
4. **明确性**：错误处理更显式

### std::optional（C++17）

std::optional表示一个值可能存在也可能不存在。

\`\`\`cpp
#include <optional>
#include <iostream>
#include <string>

// 使用optional表示可能失败的函数
std::optional<int> divide(int a, int b) {
    if (b == 0) {
        return std::nullopt;  // 失败
    }
    return a / b;  // 成功
}

int main() {
    auto result = divide(10, 2);
    
    if (result) {
        std::cout << "结果: " << *result << std::endl;
    } else {
        std::cout << "除零错误" << std::endl;
    }
    
    // 使用value_or提供默认值
    int value = divide(10, 0).value_or(0);
    std::cout << "值或默认: " << value << std::endl;
}
\`\`\`

### std::optional的用法

\`\`\`cpp
#include <optional>
#include <iostream>
#include <string>

int main() {
    // 创建optional
    std::optional<int> o1;              // 空
    std::optional<int> o2 = std::nullopt;  // 空
    std::optional<int> o3 = 42;         // 有值
    std::optional<int> o4{42};          // 有值
    
    // 检查是否有值
    if (o1.has_value()) {
        std::cout << *o1 << std::endl;
    }
    
    if (o3) {
        std::cout << *o3 << std::endl;
    }
    
    // 获取值
    std::cout << o3.value() << std::endl;      // 有值时返回值，否则抛出bad_optional_access
    std::cout << o3.value_or(0) << std::endl;  // 有值时返回值，否则返回默认值
    
    // 修改值
    o1 = 10;
    o1 = std::nullopt;  // 清空
    
    // 重置
    o3.reset();  // 变为空
}
\`\`\`

### std::optional与异常对比

\`\`\`cpp
#include <optional>
#include <stdexcept>
#include <iostream>

// 异常版本
int divide_exception(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

// optional版本
std::optional<int> divide_optional(int a, int b) {
    if (b == 0) return std::nullopt;
    return a / b;
}

int main() {
    // 异常版本
    try {
        int r = divide_exception(10, 0);
        std::cout << r << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    // optional版本
    auto r = divide_optional(10, 0);
    if (r) {
        std::cout << *r << std::endl;
    } else {
        std::cout << "除零错误" << std::endl;
    }
}
\`\`\`

### std::expected（C++23）

std::expected可以返回值或错误信息。

\`\`\`cpp
#include <expected>
#include <string>
#include <iostream>

// 定义错误类型
enum class Error {
    DivisionByZero,
    InvalidInput
};

// 使用expected返回值或错误
std::expected<int, Error> divide(int a, int b) {
    if (b == 0) {
        return std::unexpected(Error::DivisionByZero);
    }
    return a / b;
}

int main() {
    auto result = divide(10, 2);
    
    if (result) {
        std::cout << "结果: " << *result << std::endl;
    } else {
        std::cout << "错误: " << static_cast<int>(result.error()) << std::endl;
    }
}
\`\`\`

### std::expected的用法（C++23）

\`\`\`cpp
#include <expected>
#include <string>
#include <iostream>

struct ErrorInfo {
    int code;
    std::string message;
};

std::expected<int, ErrorInfo> processData(int value) {
    if (value < 0) {
        return std::unexpected(ErrorInfo{100, "Value cannot be negative"});
    }
    if (value > 100) {
        return std::unexpected(ErrorInfo{101, "Value too large"});
    }
    return value * 2;
}

int main() {
    auto result = processData(50);
    
    if (result) {
        std::cout << "成功: " << *result << std::endl;
    } else {
        std::cout << "错误 " << result.error().code 
                  << ": " << result.error().message << std::endl;
    }
    
    // 使用and_then链式调用
    auto finalResult = processData(50)
        .and_then([](int v) { return processData(v); })
        .transform([](int v) { return v + 1; });
}
\`\`\`

### std::variant作为替代

C++17的std::variant也可以用于错误处理：

\`\`\`cpp
#include <variant>
#include <string>
#include <iostream>

struct Error {
    int code;
    std::string message;
};

std::variant<int, Error> divide(int a, int b) {
    if (b == 0) {
        return Error{1, "Division by zero"};
    }
    return a / b;
}

int main() {
    auto result = divide(10, 2);
    
    if (std::holds_alternative<int>(result)) {
        std::cout << "结果: " << std::get<int>(result) << std::endl;
    } else {
        auto err = std::get<Error>(result);
        std::cout << "错误: " << err.message << std::endl;
    }
    
    // 使用std::visit
    std::visit([](auto&& arg) {
        using T = std::decay_t<decltype(arg)>;
        if constexpr (std::is_same_v<T, int>) {
            std::cout << "值: " << arg << std::endl;
        } else {
            std::cout << "错误: " << arg.message << std::endl;
        }
    }, result);
}
\`\`\`

### 选择指南

| 场景 | 推荐方式 |
|------|----------|
| 真正的异常情况 | 异常 |
| 可能失败的简单操作 | std::optional |
| 需要错误信息 | std::expected |
| 多种错误类型 | std::variant |
| 性能关键且频繁失败 | 错误码或std::optional |

### 最佳实践

1. **优先使用异常**：对于真正的异常情况
2. **使用optional**：对于可能失败的简单操作
3. **使用expected**：需要错误信息时
4. **保持一致性**：项目内统一错误处理策略

## 最佳实践

### 1. 选择合适的错误处理方式

\`\`\`cpp
// 异常：罕见、严重的错误
void openFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        throw std::runtime_error("Cannot open: " + path);
    }
}

// optional：可能失败的简单操作
std::optional<int> parseInteger(const std::string& s) {
    try { return std::stoi(s); }
    catch (...) { return std::nullopt; }
}

// expected：需要错误信息
std::expected<int, std::string> divide(int a, int b) {
    if (b == 0) return std::unexpected("Division by zero");
    return a / b;
}
\`\`\`

### 2. 使用 optional 表示可选值

\`\`\`cpp
class Config {
    std::string name;
    std::optional<int> timeout;
    std::optional<std::string> logFile;
    
public:
    int getTimeout() const { return timeout.value_or(30); }
};
\`\`\`

## 常见错误

### 1. 滥用 optional

\`\`\`cpp
// 问题：optional 用于严重错误
std::optional<int> openFile(const std::string& path) {
    // 文件打开失败应该是异常
}

// 正确：异常用于严重错误
std::ifstream openFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) throw std::runtime_error("Cannot open file");
    return file;
}
\`\`\`

### 2. 忽略 expected 的错误

\`\`\`cpp
// 问题：不检查 expected
auto result = divide(10, 0);
int value = *result;  // 未定义行为！

// 正确：检查结果
if (result) {
    int value = *result;
} else {
    std::cout << result.error() << std::endl;
}
\`\`\`

## 深入理解

### 1. optional vs expected vs variant

\`\`\`cpp
// optional：成功或失败（无错误信息）
std::optional<int> opt;

// expected：成功或错误（有错误信息）
std::expected<int, Error> exp;

// variant：多种结果类型
std::variant<int, Error1, Error2> var;

// 选择：
// - 只需要知道成功/失败 -> optional
// - 需要错误信息 -> expected
// - 多种错误类型 -> variant
\`\`\`

### 2. 错误处理的未来

\`\`\`cpp
// C++23 std::expected 提供了函数式错误处理
auto result = parseInteger("123")
    .and_then([](int x) { return divide(x, 2); })
    .transform([](int x) { return x * 2; });

// 链式调用，避免嵌套 if
\`\`\`
`,
            examples: [
                {
                    title: 'std::optional示例',
                    code: `#include <iostream>
#include <optional>
#include <string>
#include <vector>

// 使用optional表示可能失败的查找
std::optional<size_t> findIndex(const std::vector<int>& v, int value) {
    for (size_t i = 0; i < v.size(); ++i) {
        if (v[i] == value) {
            return i;
        }
    }
    return std::nullopt;
}

// 使用optional表示可能失败的解析
std::optional<int> parseInteger(const std::string& s) {
    try {
        return std::stoi(s);
    } catch (...) {
        return std::nullopt;
    }
}

// 使用optional表示可选配置
class Config {
private:
    std::string name;
    std::optional<int> timeout;
    std::optional<std::string> logFile;
    
public:
    Config(const std::string& n) : name(n) {}
    
    void setTimeout(int t) { timeout = t; }
    void setLogFile(const std::string& f) { logFile = f; }
    
    void print() const {
        std::cout << "Name: " << name << std::endl;
        std::cout << "Timeout: " << timeout.value_or(30) << " seconds" << std::endl;
        std::cout << "Log file: " << logFile.value_or("default.log") << std::endl;
    }
};

int main() {
    std::cout << "=== 查找示例 ===" << std::endl;
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    auto idx = findIndex(v, 3);
    if (idx) {
        std::cout << "找到元素，索引: " << *idx << std::endl;
    } else {
        std::cout << "未找到元素" << std::endl;
    }
    
    std::cout << "\\n=== 解析示例 ===" << std::endl;
    auto num = parseInteger("123");
    if (num) {
        std::cout << "解析成功: " << *num << std::endl;
    }
    
    auto invalid = parseInteger("abc");
    std::cout << "无效输入: " << invalid.value_or(-1) << std::endl;
    
    std::cout << "\\n=== 配置示例 ===" << std::endl;
    Config config("MyApp");
    config.setTimeout(60);
    // 不设置logFile，使用默认值
    config.print();
    
    return 0;
}`,
                    description: '展示std::optional的各种用法。'
                },
                {
                    title: '错误处理策略对比',
                    code: `#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

// 方式1：异常
int divide_exception(int a, int b) {
    if (b == 0) throw std::runtime_error("Division by zero");
    return a / b;
}

// 方式2：错误码
bool divide_error_code(int a, int b, int& result) {
    if (b == 0) return false;
    result = a / b;
    return true;
}

// 方式3：std::optional
std::optional<int> divide_optional(int a, int b) {
    if (b == 0) return std::nullopt;
    return a / b;
}

// 方式4：输出参数 + 状态
enum class Status { Success, DivisionByZero };

Status divide_status(int a, int b, int& result) {
    if (b == 0) return Status::DivisionByZero;
    result = a / b;
    return Status::Success;
}

int main() {
    std::cout << "=== 方式1：异常 ===" << std::endl;
    try {
        int r = divide_exception(10, 2);
        std::cout << "结果: " << r << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    std::cout << "\\n=== 方式2：错误码 ===" << std::endl;
    int result;
    if (divide_error_code(10, 2, result)) {
        std::cout << "结果: " << result << std::endl;
    } else {
        std::cout << "除零错误" << std::endl;
    }
    
    std::cout << "\\n=== 方式3：std::optional ===" << std::endl;
    auto opt = divide_optional(10, 2);
    if (opt) {
        std::cout << "结果: " << *opt << std::endl;
    } else {
        std::cout << "除零错误" << std::endl;
    }
    
    std::cout << "\\n=== 方式4：状态枚举 ===" << std::endl;
    int res;
    Status s = divide_status(10, 2, res);
    if (s == Status::Success) {
        std::cout << "结果: " << res << std::endl;
    } else {
        std::cout << "除零错误" << std::endl;
    }
    
    return 0;
}`,
                    description: '对比不同的错误处理策略。'
                }
            ],
            handsOn: {
                title: '使用std::optional重构',
                description: '将异常版本的代码重构为使用std::optional。',
                initialCode: `#include <iostream>
#include <optional>
#include <string>
#include <vector>

// 原始版本：使用异常
class Stack_exception {
private:
    std::vector<int> data;
    
public:
    void push(int value) {
        data.push_back(value);
    }
    
    int pop() {
        if (data.empty()) {
            throw std::runtime_error("Stack is empty");
        }
        int value = data.back();
        data.pop_back();
        return value;
    }
    
    int top() const {
        if (data.empty()) {
            throw std::runtime_error("Stack is empty");
        }
        return data.back();
    }
    
    bool empty() const { return data.empty(); }
};

// TODO: 实现optional版本
class Stack_optional {
private:
    std::vector<int> data;
    
public:
    void push(int value) {
        // TODO: 实现push
    }
    
    // TODO: 实现pop，返回std::optional<int>
    std::optional<int> pop() {
        // 如果栈为空，返回std::nullopt
        // 否则返回栈顶元素
    }
    
    // TODO: 实现top，返回std::optional<int>
    std::optional<int> top() const {
        // 如果栈为空，返回std::nullopt
        // 否则返回栈顶元素
    }
    
    bool empty() const { return data.empty(); }
};

// TODO: 实现查找函数
// 返回第一个大于value的元素的索引
std::optional<size_t> findFirstGreater(const std::vector<int>& v, int value) {
    // 遍历vector，找到第一个大于value的元素
    // 返回索引，如果没找到返回std::nullopt
}

// TODO: 实现解析函数
// 尝试将字符串解析为整数
std::optional<int> tryParseInt(const std::string& s) {
    // 使用std::stoi，捕获异常
    // 成功返回值，失败返回std::nullopt
}

int main() {
    std::cout << "=== Stack_optional测试 ===" << std::endl;
    Stack_optional stack;
    
    stack.push(1);
    stack.push(2);
    stack.push(3);
    
    auto top = stack.top();
    if (top) {
        std::cout << "栈顶: " << *top << std::endl;
    }
    
    while (!stack.empty()) {
        auto val = stack.pop();
        if (val) {
            std::cout << "弹出: " << *val << std::endl;
        }
    }
    
    auto emptyPop = stack.pop();
    std::cout << "空栈弹出: " << emptyPop.value_or(-1) << std::endl;
    
    std::cout << "\\n=== 查找测试 ===" << std::endl;
    std::vector<int> v = {1, 3, 5, 7, 9};
    auto idx = findFirstGreater(v, 4);
    if (idx) {
        std::cout << "找到，索引: " << *idx << ", 值: " << v[*idx] << std::endl;
    }
    
    std::cout << "\\n=== 解析测试 ===" << std::endl;
    auto num = tryParseInt("123");
    std::cout << "解析'123': " << num.value_or(-1) << std::endl;
    
    auto invalid = tryParseInt("abc");
    std::cout << "解析'abc': " << invalid.value_or(-1) << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== Stack_optional测试 ===
栈顶: 3
弹出: 3
弹出: 2
弹出: 1
空栈弹出: -1

=== 查找测试 ===
找到，索引: 2, 值: 5

=== 解析测试 ===
解析'123': 123
解析'abc': -1`,
                solutionRegex: 'std::optional|std::nullopt|value_or|return',
                hint: '使用std::optional<T>作为返回类型，失败时返回std::nullopt',
                xp: 200
            },
            references: [
                { title: 'std::optional', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: 'std::expected', book: 'C++23 标准', chapter: '第22章' }
            ],
            assistantTips: [
                'std::optional用于可能失败的简单操作',
                'std::expected可以携带错误信息',
                '异常用于真正的异常情况',
                '选择合适的错误处理策略'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::optional表示什么？', 
                    options: [
                        { text: '必须有一个值' }, 
                        { text: '可能有一个值，也可能没有', correct: true }, 
                        { text: '总是没有值' }, 
                        { text: '只能是空指针' }
                    ], 
                    explanation: 'std::optional表示一个值可能存在也可能不存在。' 
                },
                { 
                    type: 'single', 
                    question: '如何检查std::optional是否有值？', 
                    options: [
                        { text: '使用empty()' }, 
                        { text: '使用has_value()或隐式bool转换', correct: true }, 
                        { text: '使用is_valid()' }, 
                        { text: '使用check()' }
                    ], 
                    explanation: '可以使用has_value()方法或隐式bool转换检查是否有值。' 
                },
                { 
                    type: 'single', 
                    question: 'std::expected（C++23）相比std::optional的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '可以携带错误信息', correct: true }, 
                        { text: '更简单' }, 
                        { text: '内存更小' }
                    ], 
                    explanation: 'std::expected可以返回值或错误信息，比optional更灵活。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况适合使用std::optional？', 
                    options: [
                        { text: '构造函数失败' }, 
                        { text: '查找元素可能不存在', correct: true }, 
                        { text: '内存分配失败' }, 
                        { text: '严重的系统错误' }
                    ], 
                    explanation: '查找元素可能不存在是预期情况，适合使用std::optional。' 
                },
                { 
                    type: 'single', 
                    question: 'value_or()方法的作用是？', 
                    options: [
                        { text: '抛出异常' }, 
                        { text: '返回值或默认值', correct: true }, 
                        { text: '检查是否有值' }, 
                        { text: '清空optional' }
                    ], 
                    explanation: 'value_or()在有值时返回值，否则返回参数指定的默认值。' 
                }
            ]
        }
    ]
};

window.Unit22Data = Unit22Data;
