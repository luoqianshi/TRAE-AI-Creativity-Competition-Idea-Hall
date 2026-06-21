const Unit21Data = {
    id: 21,
    title: '并发与多线程',
    description: '本章将深入学习C++的并发编程与多线程技术，包括线程创建、同步机制、原子操作、异步任务、线程本地存储、内存模型、并行算法以及协程基础。掌握这些知识将帮助您编写高效、安全的并发程序。',
    lessons: [
        {
            id: '21.1',
            title: '线程创建与 join/detach',
            concepts: `
# 线程创建与 join/detach

## 1. 线程基础概念

**线程**是操作系统能够进行运算调度的最小单位，它被包含在进程之中，是进程中的实际运作单位。

### 线程与进程的区别
- **进程**：拥有独立的内存空间和系统资源
- **线程**：共享进程的内存空间，但拥有独立的执行栈

## 2. 创建线程

C++11 引入了 \`<thread>\` 头文件，提供了 \`std::thread\` 类来创建和管理线程。

### 基本创建方式

\`\`\`cpp
#include <iostream>
#include <thread>

void printMessage() {
    std::cout << "Hello from thread!" << std::endl;
}

int main() {
    std::thread t(printMessage);  // 创建线程
    t.join();  // 等待线程完成
    return 0;
}
\`\`\`

### 使用 Lambda 表达式

\`\`\`cpp
#include <iostream>
#include <thread>

int main() {
    std::thread t([]() {
        std::cout << "Lambda thread running" << std::endl;
    });
    t.join();
    return 0;
}
\`\`\`

### 带参数的线程函数

\`\`\`cpp
#include <iostream>
#include <thread>

void printSum(int a, int b) {
    std::cout << "Sum: " << a + b << std::endl;
}

int main() {
    std::thread t(printSum, 10, 20);
    t.join();
    return 0;
}
\`\`\`

### 使用成员函数

\`\`\`cpp
#include <iostream>
#include <thread>

class Worker {
public:
    void doWork(int value) {
        std::cout << "Working with value: " << value << std::endl;
    }
};

int main() {
    Worker w;
    std::thread t(&Worker::doWork, &w, 42);
    t.join();
    return 0;
}
\`\`\`

## 3. join() - 等待线程完成

\`join()\` 会阻塞当前线程，直到被调用的线程执行完毕。

\`\`\`cpp
#include <iostream>
#include <thread>
#include <chrono>

void task() {
    for (int i = 0; i < 5; ++i) {
        std::cout << "Task: " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
}

int main() {
    std::thread t(task);
    std::cout << "Main thread waiting..." << std::endl;
    t.join();  // 主线程等待 t 完成
    std::cout << "Thread finished!" << std::endl;
    return 0;
}
\`\`\`

### joinable() 检查

\`\`\`cpp
std::thread t;
if (t.joinable()) {
    t.join();  // 只有在可 join 时才调用
}
\`\`\`

## 4. detach() - 分离线程

\`detach()\` 将线程与 \`std::thread\` 对象分离，使其在后台独立运行。

\`\`\`cpp
#include <iostream>
#include <thread>
#include <chrono>

void backgroundTask() {
    for (int i = 0; i < 3; ++i) {
        std::cout << "Background: " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
}

int main() {
    std::thread t(backgroundTask);
    t.detach();  // 分离线程，让其独立运行
    
    std::cout << "Main thread continues..." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 0;
}
\`\`\`

### 注意事项
- 分离后的线程无法再被 join
- 主线程结束时，分离的线程也会被强制终止
- 需要确保分离线程不会访问已销毁的资源

## 5. 线程管理最佳实践

### RAII 管理线程

\`\`\`cpp
#include <iostream>
#include <thread>

class ThreadGuard {
    std::thread& t;
public:
    explicit ThreadGuard(std::thread& t_) : t(t_) {}
    ~ThreadGuard() {
        if (t.joinable()) {
            t.join();
        }
    }
    ThreadGuard(const ThreadGuard&) = delete;
    ThreadGuard& operator=(const ThreadGuard&) = delete;
};

void task() {
    std::cout << "Task running" << std::endl;
}

int main() {
    std::thread t(task);
    ThreadGuard g(t);
    // 当 g 析构时，自动 join
    return 0;
}
\`\`\`

## 6. 获取线程信息

\`\`\`cpp
#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::cout << "Hardware concurrency: " 
              << std::thread::hardware_concurrency() << std::endl;
    
    std::thread t([](){
        std::cout << "Thread ID: " << std::this_thread::get_id() << std::endl;
    });
    
    std::cout << "Main thread ID: " << std::this_thread::get_id() << std::endl;
    std::cout << "Worker thread ID: " << t.get_id() << std::endl;
    
    t.join();
    return 0;
}
\`\`\`

## 最佳实践

### 1. 始终确保线程被 join 或 detach

\`\`\`cpp
// 推荐：使用 RAII 包装器
class ThreadGuard {
    std::thread& t;
public:
    explicit ThreadGuard(std::thread& t_) : t(t_) {}
    ~ThreadGuard() {
        if (t.joinable()) {
            t.join();
        }
    }
    ThreadGuard(const ThreadGuard&) = delete;
    ThreadGuard& operator=(const ThreadGuard&) = delete;
};

void safeFunction() {
    std::thread t(worker);
    ThreadGuard g(t);  // 异常安全
    // 函数结束时自动 join
}
\`\`\`

### 2. 避免传递局部变量的引用

\`\`\`cpp
// 错误：局部变量的引用
void badExample() {
    int local = 42;
    std::thread t([&local]() {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        std::cout << local << std::endl;  // 危险！local可能已销毁
    });
    t.detach();  // 更危险
}

// 正确：值捕获或确保生命周期
void goodExample() {
    int local = 42;
    std::thread t([local]() {  // 值捕获
        std::cout << local << std::endl;
    });
    t.join();  // 等待完成
}
\`\`\`

### 3. 使用 std::ref 显式传递引用

\`\`\`cpp
void process(int& value) { value *= 2; }

int main() {
    int x = 10;
    // std::thread t(process, x);  // 编译错误！默认值传递
    std::thread t(process, std::ref(x));  // 正确：显式传递引用
    t.join();
    return 0;
}
\`\`\`

### 4. 合理设置线程数量

\`\`\`cpp
// 根据硬件并发能力设置线程数
unsigned int numThreads = std::thread::hardware_concurrency();
if (numThreads == 0) numThreads = 4;  // 默认值

std::vector<std::thread> threads;
for (unsigned int i = 0; i < numThreads; ++i) {
    threads.emplace_back(worker, i);
}
\`\`\`

## 常见错误

### 1. 忘记 join 或 detach

\`\`\`cpp
void error1() {
    std::thread t(worker);
    // 忘记 t.join() 或 t.detach()
    // 程序崩溃！std::terminate 被调用
}
\`\`\`

### 2. 对已 join/detach 的线程再次操作

\`\`\`cpp
void error2() {
    std::thread t(worker);
    t.join();
    t.join();  // 错误！线程已不可 join
}
\`\`\`

### 3. detach 后访问已销毁的资源

\`\`\`cpp
void error3() {
    int* ptr = new int(42);
    std::thread t([ptr]() {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        delete ptr;  // 可能主线程已退出
    });
    t.detach();
    // 主线程结束，detach 的线程被强制终止
}
\`\`\`

### 4. 线程函数参数的隐式拷贝

\`\`\`cpp
void process(std::unique_ptr<int> ptr) {}

void error4() {
    auto ptr = std::make_unique<int>(42);
    // std::thread t(process, ptr);  // 编译错误！unique_ptr 不可拷贝
    std::thread t(process, std::move(ptr));  // 正确：显式移动
    t.join();
}
\`\`\`

### 5. 异常导致 join 未执行

\`\`\`cpp
void error5() {
    std::thread t(worker);
    doSomething();  // 如果抛出异常，t.join() 不会执行
    t.join();
}

// 正确：使用 RAII
void correct5() {
    std::thread t(worker);
    ThreadGuard g(t);  // 异常安全
    doSomething();
}
\`\`\`

## 深入理解

### 线程对象与执行线程的区别

\`\`\`cpp
std::thread t;  // t 不代表任何执行线程
std::cout << t.joinable();  // false

t = std::thread(worker);  // 现在关联一个执行线程
std::cout << t.joinable();  // true

std::thread t2 = std::move(t);  // 所有权转移
std::cout << t.joinable();   // false
std::cout << t2.joinable();  // true
\`\`\`

### 线程启动的开销

创建线程涉及：
1. **栈空间分配**：默认约 1MB（可调整）
2. **内核对象创建**：操作系统管理开销
3. **上下文切换**：调度器开销

\`\`\`cpp
// 对于简单任务，线程开销可能超过收益
void simpleTask() { int x = 1 + 1; }

// 不推荐：创建线程的开销 > 任务本身
std::thread t(simpleTask);
t.join();

// 推荐：对于轻量任务，直接执行或使用线程池
simpleTask();
\`\`\`

### 线程 ID 的用途

\`\`\`cpp
// 1. 调试和日志
void loggedFunction() {
    std::cout << "Thread " << std::this_thread::get_id() << " executing\\n";
}

// 2. 线程本地存储的键
std::unordered_map<std::thread::id, ThreadLocalData> threadData;

// 3. 检测是否在主线程
std::thread::id mainThreadId;

void init() {
    mainThreadId = std::this_thread::get_id();
}

bool isMainThread() {
    return std::this_thread::get_id() == mainThreadId;
}
\`\`\`

### 线程参数传递机制

\`\`\`cpp
// 参数在创建线程时被拷贝到线程的内部存储
void func(int x, const std::string& s);

std::string str = "hello";
std::thread t(func, 42, str);  // str 被拷贝！

// 使用 std::cref 避免拷贝
std::thread t2(func, 42, std::cref(str));  // 传递 const 引用

// 使用 std::move 转移所有权
std::thread t3(func, 42, std::move(str));  // str 被移动
\`\`\`

### 线程与异常安全

\`\`\`cpp
// 异常安全的线程管理
class ScopedThread {
    std::thread t;
public:
    explicit ScopedThread(std::thread t_) : t(std::move(t_)) {
        if (!t.joinable()) {
            throw std::logic_error("No thread");
        }
    }
    ~ScopedThread() {
        t.join();
    }
    ScopedThread(const ScopedThread&) = delete;
    ScopedThread& operator=(const ScopedThread&) = delete;
};

void safeExample() {
    ScopedThread st(std::thread(worker));
    // 即使抛出异常，线程也会被正确 join
}
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-1-1',
                    title: '创建多个线程',
                    code: `#include <iostream>
#include <thread>
#include <vector>

void worker(int id) {
    std::cout << "Thread " << id << " is running" << std::endl;
}

int main() {
    std::vector<std::thread> threads;
    
    // 创建5个线程
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back(worker, i);
    }
    
    // 等待所有线程完成
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "All threads completed!" << std::endl;
    return 0;
}`,
                    output: `Thread 0 is running
Thread 1 is running
Thread 2 is running
Thread 3 is running
Thread 4 is running
All threads completed!`
                },
                {
                    id: 'example-21-1-2',
                    title: '使用 Lambda 和引用参数',
                    code: `#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    int sum = 0;
    
    // 使用 std::ref 传递引用
    std::thread t([&data, &sum]() {
        for (int n : data) {
            sum += n;
        }
    });
    
    t.join();
    
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}`,
                    output: `Sum: 15`
                }
            ],
            handsOn: {
                title: '创建线程池基础',
                description: '实现一个简单的线程管理器，能够创建多个线程并等待它们完成。',
                initialCode: `#include <iostream>
#include <thread>
#include <vector>
#include <functional>

class ThreadManager {
private:
    std::vector<std::thread> threads;
    
public:
    // TODO: 添加线程
    void addThread(std::function<void()> task) {
        // 创建线程并添加到 threads 中
    }
    
    // TODO: 等待所有线程完成
    void waitAll() {
        // 遍历 threads，join 每个线程
    }
    
    // TODO: 获取线程数量
    size_t size() const {
        // 返回 threads 的大小
        return 0;
    }
};

int main() {
    ThreadManager manager;
    
    // 添加3个工作线程
    for (int i = 0; i < 3; ++i) {
        manager.addThread([i]() {
            std::cout << "Thread " << i << " working..." << std::endl;
        });
    }
    
    std::cout << "Total threads: " << manager.size() << std::endl;
    manager.waitAll();
    std::cout << "All threads completed!" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <vector>
#include <functional>

class ThreadManager {
private:
    std::vector<std::thread> threads;
    
public:
    void addThread(std::function<void()> task) {
        threads.emplace_back(task);
    }
    
    void waitAll() {
        for (auto& t : threads) {
            if (t.joinable()) {
                t.join();
            }
        }
    }
    
    size_t size() const {
        return threads.size();
    }
};

int main() {
    ThreadManager manager;
    
    for (int i = 0; i < 3; ++i) {
        manager.addThread([i]() {
            std::cout << "Thread " << i << " working..." << std::endl;
        });
    }
    
    std::cout << "Total threads: " << manager.size() << std::endl;
    manager.waitAll();
    std::cout << "All threads completed!" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪种方式可以正确创建一个线程？',
                    options: [
                        'std::thread t = new std::thread(func);',
                        'std::thread t(func);',
                        'thread t(func);',
                        'std::Thread t(func);'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::thread 是一个类，直接通过构造函数创建对象即可，不需要使用 new。'
                },
                {
                    question: '关于 join() 和 detach()，以下说法正确的是？',
                    options: [
                        'join() 和 detach() 可以在同一个线程对象上多次调用',
                        'join() 会阻塞当前线程直到目标线程完成',
                        'detach() 会阻塞当前线程直到目标线程完成',
                        '调用 join() 或 detach() 后，线程对象仍然可以再次 join'
                    ],
                    correctAnswer: 1,
                    explanation: 'join() 会阻塞当前线程，等待目标线程执行完成。一个线程只能被 join 或 detach 一次。'
                },
                {
                    question: '以下代码有什么问题？\nstd::thread t(func);\nt.detach();\nt.join();',
                    options: [
                        '没有问题，可以正常运行',
                        'detach() 后不能再调用 join()',
                        '应该先调用 join() 再调用 detach()',
                        '需要使用 t.start() 启动线程'
                    ],
                    correctAnswer: 1,
                    explanation: '线程一旦被 detach，就与 thread 对象分离，不能再被 join。这会导致程序崩溃或未定义行为。'
                },
                {
                    question: '如何检查一个线程对象是否可以被 join？',
                    options: [
                        '使用 t.isJoinable()',
                        '使用 t.joinable()',
                        '使用 t.canJoin()',
                        '使用 t.status() == JOINABLE'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::thread 提供了 joinable() 方法来检查线程是否可以被 join 或 detach。'
                },
                {
                    question: '以下哪种情况会导致程序崩溃？',
                    options: [
                        '创建线程后立即调用 join()',
                        '创建线程后调用 detach()',
                        '创建线程后既不调用 join() 也不调用 detach()',
                        '使用 Lambda 表达式创建线程'
                    ],
                    correctAnswer: 2,
                    explanation: '如果创建线程后既不调用 join() 也不调用 detach()，当 thread 对象析构时会调用 std::terminate() 终止程序。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::thread',
                    url: 'https://en.cppreference.com/w/cpp/thread/thread'
                },
                {
                    title: 'C++ Concurrency In Action',
                    url: 'https://www.manning.com/books/c-plus-plus-concurrency-in-action'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 记住每个 std::thread 对象都必须被 join 或 detach\n2. 使用 RAII 技术管理线程生命周期\n3. 注意线程函数中的参数传递方式，默认是值传递\n4. 使用 std::ref 或 std::cref 传递引用参数'
        },
        {
            id: '21.2',
            title: '数据竞争与互斥量（mutex）',
            concepts: `
# 数据竞争与互斥量（mutex）

## 1. 数据竞争问题

**数据竞争**发生在多个线程同时访问同一内存位置，且至少有一个是写操作时。

### 数据竞争示例

\`\`\`cpp
#include <iostream>
#include <thread>
#include <vector>

int counter = 0;

void increment() {
    for (int i = 0; i < 10000; ++i) {
        counter++;  // 非原子操作，存在数据竞争
    }
}

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Counter: " << counter << std::endl;  // 预期 100000，实际可能小于
    return 0;
}
\`\`\`

### 为什么会出现问题？

\`counter++\` 实际包含三个步骤：
1. 读取 counter 的值
2. 将值加 1
3. 将新值写回 counter

多个线程可能同时执行这些步骤，导致更新丢失。

## 2. 互斥量（mutex）

**互斥量**是一种同步原语，用于保护共享资源，确保同一时间只有一个线程可以访问。

### 基本使用

\`\`\`cpp
#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

int counter = 0;
std::mutex mtx;  // 互斥量

void increment() {
    for (int i = 0; i < 10000; ++i) {
        mtx.lock();      // 加锁
        counter++;       // 安全操作
        mtx.unlock();    // 解锁
    }
}

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Counter: " << counter << std::endl;  // 正确输出 100000
    return 0;
}
\`\`\`

## 3. mutex 的成员函数

### lock() 和 unlock()

\`\`\`cpp
std::mutex mtx;

mtx.lock();    // 获取锁，如果锁被占用则阻塞
// 临界区代码
mtx.unlock();  // 释放锁
\`\`\`

### try_lock()

\`\`\`cpp
std::mutex mtx;

if (mtx.try_lock()) {
    // 成功获取锁
    // 临界区代码
    mtx.unlock();
} else {
    // 获取锁失败，执行其他操作
}
\`\`\`

### try_lock_for() 和 try_lock_until()（timed_mutex）

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <chrono>

std::timed_mutex mtx;

void task() {
    if (mtx.try_lock_for(std::chrono::milliseconds(100))) {
        std::cout << "Got the lock" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
        mtx.unlock();
    } else {
        std::cout << "Failed to get the lock" << std::endl;
    }
}

int main() {
    std::thread t1(task);
    std::thread t2(task);
    
    t1.join();
    t2.join();
    return 0;
}
\`\`\`

## 4. 互斥量类型

### std::mutex
- 基本互斥量
- 不可递归锁定

### std::recursive_mutex
- 允许同一线程多次锁定
- 必须解锁相同次数

\`\`\`cpp
#include <iostream>
#include <mutex>

std::recursive_mutex rmtx;

void recursiveFunction(int depth) {
    if (depth <= 0) return;
    
    rmtx.lock();
    std::cout << "Depth: " << depth << std::endl;
    recursiveFunction(depth - 1);  // 递归调用，再次锁定
    rmtx.unlock();
}

int main() {
    recursiveFunction(5);
    return 0;
}
\`\`\`

### std::timed_mutex
- 支持超时锁定

### std::recursive_timed_mutex
- 递归 + 超时

## 5. 死锁问题

**死锁**发生在两个或多个线程互相等待对方释放锁时。

### 死锁示例

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx1, mtx2;

void threadA() {
    mtx1.lock();
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
    mtx2.lock();  // 等待 mtx2，但 threadB 已持有
    // ...
    mtx2.unlock();
    mtx1.unlock();
}

void threadB() {
    mtx2.lock();
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
    mtx1.lock();  // 等待 mtx1，但 threadA 已持有
    // ...
    mtx1.unlock();
    mtx2.unlock();
}

int main() {
    std::thread t1(threadA);
    std::thread t2(threadB);
    t1.join();
    t2.join();
    return 0;
}
\`\`\`

### 避免死锁的方法

1. **按固定顺序加锁**
\`\`\`cpp
void threadA() {
    std::lock(mtx1, mtx2);  // 同时锁定多个互斥量
    // ...
    mtx1.unlock();
    mtx2.unlock();
}

void threadB() {
    std::lock(mtx1, mtx2);  // 相同顺序
    // ...
    mtx1.unlock();
    mtx2.unlock();
}
\`\`\`

2. **使用 std::scoped_lock（C++17）**
\`\`\`cpp
void safeFunction() {
    std::scoped_lock lock(mtx1, mtx2);  // RAII，自动管理
    // 临界区代码
}
\`\`\`

## 6. 性能考虑

- 锁的粒度要尽可能小
- 避免在持有锁时执行耗时操作
- 考虑使用读写锁（shared_mutex）优化读多写少的场景

## 最佳实践

### 1. 使用 RAII 管理锁

\`\`\`cpp
// 推荐：使用 lock_guard 或 unique_lock
void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);
    // 临界区代码
}  // 自动解锁

// 不推荐：手动管理
void unsafeFunction() {
    mtx.lock();
    // 如果这里抛出异常，锁不会被释放！
    mtx.unlock();
}
\`\`\`

### 2. 最小化临界区

\`\`\`cpp
// 不好：锁的范围太大
void badExample() {
    std::lock_guard<std::mutex> lock(mtx);
    processData();      // 不需要锁
    updateCounter();    // 需要锁
    writeLog();         // 不需要锁
}

// 好：只锁定必要的部分
void goodExample() {
    processData();      // 锁外执行
    {
        std::lock_guard<std::mutex> lock(mtx);
        updateCounter();  // 只锁定这部分
    }
    writeLog();         // 锁外执行
}
\`\`\`

### 3. 避免嵌套锁

\`\`\`cpp
// 危险：可能导致死锁
void dangerous() {
    std::lock_guard<std::mutex> lock1(mtx1);
    std::lock_guard<std::mutex> lock2(mtx2);  // 可能死锁
}

// 安全：使用 scoped_lock 同时锁定
void safe() {
    std::scoped_lock lock(mtx1, mtx2);  // C++17
}
\`\`\`

### 4. 使用适当的互斥量类型

\`\`\`cpp
// 读多写少：使用 shared_mutex
std::shared_mutex rwMtx;

void readData() {
    std::shared_lock<std::shared_mutex> lock(rwMtx);  // 共享读
    // 读取数据
}

void writeData() {
    std::unique_lock<std::shared_mutex> lock(rwMtx);  // 独占写
    // 写入数据
}

// 需要递归锁定：使用 recursive_mutex
std::recursive_mutex recMtx;
void recursiveFunction(int depth) {
    std::lock_guard<std::recursive_mutex> lock(recMtx);
    if (depth > 0) recursiveFunction(depth - 1);
}
\`\`\`

### 5. 使用 try_lock 避免阻塞

\`\`\`cpp
void nonBlockingOperation() {
    if (mtx.try_lock()) {
        // 成功获取锁
        // 执行操作
        mtx.unlock();
    } else {
        // 做其他事情，不阻塞
        handleLockFailure();
    }
}
\`\`\`

## 常见错误

### 1. 忘记解锁

\`\`\`cpp
// 错误：手动管理可能忘记解锁
void error1() {
    mtx.lock();
    if (someCondition) {
        return;  // 忘记解锁！
    }
    mtx.unlock();
}

// 正确：使用 lock_guard
void correct1() {
    std::lock_guard<std::mutex> lock(mtx);
    if (someCondition) {
        return;  // 自动解锁
    }
}
\`\`\`

### 2. 锁的粒度过大

\`\`\`cpp
// 错误：整个函数都被锁定
void error2() {
    std::lock_guard<std::mutex> lock(mtx);
    readFromFile();    // I/O 操作，很慢
    processData();     // 计算
    writeToNetwork();  // 网络操作，很慢
}

// 正确：只锁定共享数据访问
void correct2() {
    readFromFile();    // 锁外执行
    {
        std::lock_guard<std::mutex> lock(mtx);
        updateSharedData();  // 只锁定这部分
    }
    writeToNetwork();  // 锁外执行
}
\`\`\`

### 3. 死锁

\`\`\`cpp
// 错误：不同顺序锁定导致死锁
std::mutex mtxA, mtxB;

void thread1() {
    std::lock_guard<std::mutex> lockA(mtxA);
    std::lock_guard<std::mutex> lockB(mtxB);  // 死锁风险
}

void thread2() {
    std::lock_guard<std::mutex> lockB(mtxB);
    std::lock_guard<std::mutex> lockA(mtxA);  // 死锁！
}

// 正确：使用 scoped_lock
void safeThread() {
    std::scoped_lock lock(mtxA, mtxB);  // 避免死锁
}
\`\`\`

### 4. 在持有锁时调用外部代码

\`\`\`cpp
// 错误：持有锁时调用未知代码
void error4() {
    std::lock_guard<std::mutex> lock(mtx);
    callback();  // 如果 callback 尝试获取同一个锁，死锁！
}

// 正确：先复制数据，释放锁后再调用
void correct4() {
    Data copy;
    {
        std::lock_guard<std::mutex> lock(mtx);
        copy = sharedData;  // 复制
    }
    callback(copy);  // 锁外调用
}
\`\`\`

### 5. 误用 recursive_mutex

\`\`\`cpp
// 错误：用 recursive_mutex 掩盖设计问题
class BadDesign {
    std::recursive_mutex mtx;
public:
    void methodA() {
        std::lock_guard<std::recursive_mutex> lock(mtx);
        methodB();  // 递归锁定
    }
    void methodB() {
        std::lock_guard<std::recursive_mutex> lock(mtx);
        // 实际上应该重构代码避免递归锁定
    }
};
\`\`\`

## 深入理解

### 互斥量的实现原理

\`\`\`cpp
// 简化的互斥量实现概念
class SimpleMutex {
    std::atomic<bool> locked{false};
    
public:
    void lock() {
        while (locked.exchange(true, std::memory_order_acquire)) {
            // 自旋等待或让出 CPU
            std::this_thread::yield();
        }
    }
    
    void unlock() {
        locked.store(false, std::memory_order_release);
    }
};
\`\`\`

### 锁竞争与性能

\`\`\`cpp
// 高竞争场景
void highContention() {
    for (int i = 0; i < 1000000; ++i) {
        std::lock_guard<std::mutex> lock(mtx);
        counter++;  // 每次操作都需要获取锁
    }
}

// 优化：减少锁竞争
void lowContention() {
    int localCounter = 0;
    for (int i = 0; i < 1000000; ++i) {
        localCounter++;  // 本地操作，无锁
    }
    std::lock_guard<std::mutex> lock(mtx);
    counter += localCounter;  // 一次更新
}
\`\`\`

### 伪共享问题

\`\`\`cpp
// 问题：多个线程访问同一缓存行上的不同变量
struct BadCounter {
    int count1;  // 线程1访问
    int count2;  // 线程2访问
    // 可能在同一缓存行，导致伪共享
};

// 解决：对齐到缓存行
struct GoodCounter {
    alignas(64) int count1;
    alignas(64) int count2;
};
\`\`\`

### 锁的公平性

\`\`\`cpp
// 默认互斥量不保证公平性
// 可能出现线程饥饿

// 使用先进先出队列的锁实现公平性
class FairLock {
    std::mutex mtx;
    std::condition_variable cv;
    std::queue<std::thread::id> waiters;
    bool locked = false;
    
public:
    void lock() {
        std::unique_lock<std::mutex> lock(mtx);
        waiters.push(std::this_thread::get_id());
        cv.wait(lock, [this]() {
            return waiters.front() == std::this_thread::get_id() && !locked;
        });
        locked = true;
        waiters.pop();
    }
    
    void unlock() {
        std::lock_guard<std::mutex> lock(mtx);
        locked = false;
        cv.notify_all();
    }
};
\`\`\`

### 内存序与互斥量

\`\`\`cpp
// lock() 和 unlock() 提供同步保证
// lock()：获取语义，防止后续操作重排到前面
// unlock()：释放语义，防止前面操作重排到后面

std::mutex mtx;
int data = 0;
bool ready = false;

void producer() {
    data = 42;
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;  // unlock() 确保上面的 data = 42 可见
    }
}

void consumer() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        // lock() 确保看到 producer 的所有修改
    }
    if (ready) {
        std::cout << data << std::endl;  // 保证看到 42
    }
}
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-2-1',
                    title: '线程安全的计数器',
                    code: `#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

class ThreadSafeCounter {
private:
    int value = 0;
    std::mutex mtx;
    
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx);
        ++value;
    }
    
    void decrement() {
        std::lock_guard<std::mutex> lock(mtx);
        --value;
    }
    
    int get() {
        std::lock_guard<std::mutex> lock(mtx);
        return value;
    }
};

int main() {
    ThreadSafeCounter counter;
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&counter]() {
            for (int j = 0; j < 1000; ++j) {
                counter.increment();
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Final value: " << counter.get() << std::endl;
    return 0;
}`,
                    output: `Final value: 10000`
                },
                {
                    id: 'example-21-2-2',
                    title: '线程安全的队列',
                    code: `#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>

template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    std::mutex mtx;
    std::condition_variable cv;
    
public:
    void push(T value) {
        std::lock_guard<std::mutex> lock(mtx);
        queue.push(value);
        cv.notify_one();
    }
    
    T pop() {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [this]() { return !queue.empty(); });
        T value = queue.front();
        queue.pop();
        return value;
    }
    
    bool empty() {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.empty();
    }
};

int main() {
    ThreadSafeQueue<int> tsQueue;
    
    std::thread producer([&tsQueue]() {
        for (int i = 0; i < 5; ++i) {
            tsQueue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
    });
    
    std::thread consumer([&tsQueue]() {
        for (int i = 0; i < 5; ++i) {
            int value = tsQueue.pop();
            std::cout << "Consumed: " << value << std::endl;
        }
    });
    
    producer.join();
    consumer.join();
    
    return 0;
}`,
                    output: `Produced: 0
Produced: 1
Consumed: 0
Produced: 2
Consumed: 1
Produced: 3
Consumed: 2
Produced: 4
Consumed: 3
Consumed: 4`
                }
            ],
            handsOn: {
                title: '实现线程安全的栈',
                description: '实现一个线程安全的栈数据结构，支持 push、pop 和 top 操作。',
                initialCode: `#include <iostream>
#include <thread>
#include <stack>
#include <mutex>
#include <vector>

template<typename T>
class ThreadSafeStack {
private:
    std::stack<T> stk;
    std::mutex mtx;
    
public:
    // TODO: 实现线程安全的 push
    void push(const T& value) {
        // 加锁，将 value 压入栈
    }
    
    // TODO: 实现线程安全的 pop
    // 如果栈为空，返回 false
    bool pop(T& value) {
        // 加锁，检查栈是否为空
        // 如果不为空，取出栈顶元素并返回 true
        return false;
    }
    
    // TODO: 实现线程安全的 empty
    bool empty() {
        // 加锁，返回栈是否为空
        return true;
    }
};

int main() {
    ThreadSafeStack<int> stack;
    std::vector<std::thread> threads;
    
    // 多个线程同时 push
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&stack, i]() {
            for (int j = 0; j < 10; ++j) {
                stack.push(i * 10 + j);
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    // 弹出所有元素
    int value;
    int count = 0;
    while (stack.pop(value)) {
        count++;
    }
    
    std::cout << "Total elements popped: " << count << std::endl;
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <stack>
#include <mutex>
#include <vector>

template<typename T>
class ThreadSafeStack {
private:
    std::stack<T> stk;
    std::mutex mtx;
    
public:
    void push(const T& value) {
        std::lock_guard<std::mutex> lock(mtx);
        stk.push(value);
    }
    
    bool pop(T& value) {
        std::lock_guard<std::mutex> lock(mtx);
        if (stk.empty()) {
            return false;
        }
        value = stk.top();
        stk.pop();
        return true;
    }
    
    bool empty() {
        std::lock_guard<std::mutex> lock(mtx);
        return stk.empty();
    }
};

int main() {
    ThreadSafeStack<int> stack;
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&stack, i]() {
            for (int j = 0; j < 10; ++j) {
                stack.push(i * 10 + j);
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    int value;
    int count = 0;
    while (stack.pop(value)) {
        count++;
    }
    
    std::cout << "Total elements popped: " << count << std::endl;
    return 0;
}`
            },
            quiz: [
                {
                    question: '数据竞争发生的条件是什么？',
                    options: [
                        '多个线程同时访问同一变量',
                        '多个线程同时访问同一变量，且至少有一个是写操作',
                        '多个线程同时写入同一变量',
                        '多个线程按顺序访问同一变量'
                    ],
                    correctAnswer: 1,
                    explanation: '数据竞争需要满足：多个线程同时访问同一内存位置，且至少有一个是写操作，且没有同步机制。'
                },
                {
                    question: '以下关于 mutex 的说法，哪个是正确的？',
                    options: [
                        'mutex 可以被同一线程多次锁定',
                        'mutex.lock() 如果锁已被占用会立即返回',
                        'mutex.lock() 如果锁已被占用会阻塞等待',
                        'mutex 必须在创建时初始化'
                    ],
                    correctAnswer: 2,
                    explanation: 'std::mutex 的 lock() 方法会阻塞当前线程，直到获取到锁。如果不想阻塞，应使用 try_lock()。'
                },
                {
                    question: 'std::recursive_mutex 与 std::mutex 的主要区别是？',
                    options: [
                        'std::recursive_mutex 性能更好',
                        'std::recursive_mutex 允许同一线程多次锁定',
                        'std::recursive_mutex 不需要解锁',
                        'std::recursive_mutex 支持超时'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::recursive_mutex 允许同一线程多次获取同一把锁，适用于递归调用场景。'
                },
                {
                    question: '以下哪种情况会导致死锁？',
                    options: [
                        '单个线程多次锁定同一个 mutex',
                        '两个线程以不同顺序锁定多个 mutex',
                        '使用 try_lock() 获取锁',
                        '在持有锁时执行快速操作'
                    ],
                    correctAnswer: 1,
                    explanation: '当多个线程以不同顺序锁定多个互斥量时，可能互相等待对方释放锁，导致死锁。'
                },
                {
                    question: '如何避免死锁？',
                    options: [
                        '使用更多的 mutex',
                        '按固定顺序锁定多个 mutex',
                        '增加锁的持有时间',
                        '避免使用任何同步机制'
                    ],
                    correctAnswer: 1,
                    explanation: '按固定顺序锁定多个互斥量是避免死锁的有效方法。也可以使用 std::lock() 或 std::scoped_lock 同时锁定多个互斥量。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::mutex',
                    url: 'https://en.cppreference.com/w/cpp/thread/mutex'
                },
                {
                    title: 'Deadlock Prevention',
                    url: 'https://en.wikipedia.org/wiki/Deadlock_prevention_algorithms'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 理解数据竞争的本质：并发访问 + 至少一个写操作 + 无同步\n2. 使用 mutex 时要确保锁一定会被释放（使用 lock_guard）\n3. 注意死锁问题，多锁场景要按固定顺序加锁\n4. 锁的粒度要尽可能小，减少持有锁的时间'
        },
        {
            id: '21.3',
            title: '锁管理：lock_guard、unique_lock',
            concepts: `
# 锁管理：lock_guard、unique_lock

## 1. 为什么需要锁管理？

直接使用 \`lock()\` 和 \`unlock()\` 容易出错：
- 忘记解锁
- 异常导致解锁失败
- 代码复杂时难以管理

**RAII（Resource Acquisition Is Initialization）** 是解决方案。

## 2. std::lock_guard

最简单的锁管理类，构造时加锁，析构时解锁。

### 基本使用

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx;

void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);  // 构造时加锁
    // 临界区代码
    std::cout << "Safe operation" << std::endl;
}  // 析构时自动解锁

int main() {
    std::thread t(safeFunction);
    t.join();
    return 0;
}
\`\`\`

### 异常安全

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <stdexcept>

std::mutex mtx;

void mayThrow() {
    std::lock_guard<std::mutex> lock(mtx);
    
    // 即使抛出异常，锁也会被正确释放
    throw std::runtime_error("Error occurred");
}

int main() {
    try {
        mayThrow();
    } catch (const std::exception& e) {
        std::cout << "Caught: " << e.what() << std::endl;
    }
    // 锁已被正确释放
    return 0;
}
\`\`\`

## 3. std::unique_lock

比 \`lock_guard\` 更灵活，但稍慢。

### 基本使用

\`\`\`cpp
#include <iostream>
#include <mutex>

std::mutex mtx;

void flexibleLock() {
    std::unique_lock<std::mutex> lock(mtx);  // 构造时加锁
    
    // 可以手动解锁
    lock.unlock();
    std::cout << "Lock released" << std::endl;
    
    // 可以再次加锁
    lock.lock();
    std::cout << "Lock acquired again" << std::endl;
}  // 析构时自动解锁（如果还持有锁）
\`\`\`

### 延迟加锁

\`\`\`cpp
#include <iostream>
#include <mutex>

std::mutex mtx;

void deferredLock() {
    std::unique_lock<std::mutex> lock(mtx, std::defer_lock);  // 不立即加锁
    
    std::cout << "Doing some work without lock" << std::endl;
    
    lock.lock();  // 稍后加锁
    // 临界区代码
}
\`\`\`

### try_to_lock

\`\`\`cpp
#include <iostream>
#include <mutex>

std::mutex mtx;

void tryLock() {
    std::unique_lock<std::mutex> lock(mtx, std::try_to_lock);
    
    if (lock.owns_lock()) {
        std::cout << "Got the lock" << std::endl;
    } else {
        std::cout << "Failed to get the lock" << std::endl;
    }
}
\`\`\`

### adopt_lock

\`\`\`cpp
#include <iostream>
#include <mutex>

std::mutex mtx;

void adoptLock() {
    mtx.lock();  // 手动加锁
    std::unique_lock<std::mutex> lock(mtx, std::adopt_lock);  // 接管已加锁的 mutex
    // 析构时会自动解锁
}
\`\`\`

## 4. unique_lock 的成员函数

\`\`\`cpp
std::mutex mtx;
std::unique_lock<std::mutex> lock(mtx);

lock.lock();           // 加锁
lock.unlock();         // 解锁
lock.try_lock();       // 尝试加锁
bool owns = lock.owns_lock();  // 是否持有锁
std::mutex* m = lock.mutex();  // 获取关联的 mutex
lock.release();        // 释放 mutex 的所有权，不再管理
\`\`\`

## 5. 同时锁定多个互斥量

### std::lock（C++11）

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx1, mtx2;

void safeFunction() {
    std::unique_lock<std::mutex> lock1(mtx1, std::defer_lock);
    std::unique_lock<std::mutex> lock2(mtx2, std::defer_lock);
    
    std::lock(lock1, lock2);  // 同时锁定，避免死锁
    
    // 临界区代码
    std::cout << "Both locks acquired" << std::endl;
}

int main() {
    std::thread t(safeFunction);
    t.join();
    return 0;
}
\`\`\`

### std::scoped_lock（C++17）

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx1, mtx2, mtx3;

void safeFunction() {
    std::scoped_lock lock(mtx1, mtx2, mtx3);  // 同时锁定多个 mutex
    
    // 临界区代码
    std::cout << "All locks acquired" << std::endl;
}  // 自动释放所有锁

int main() {
    std::thread t(safeFunction);
    t.join();
    return 0;
}
\`\`\`

## 6. lock_guard vs unique_lock

| 特性 | lock_guard | unique_lock |
|------|-----------|-------------|
| 性能 | 更快 | 稍慢 |
| 灵活性 | 固定 | 高 |
| 手动加锁/解锁 | 不支持 | 支持 |
| 延迟加锁 | 不支持 | 支持 |
| 条件变量 | 不支持 | 支持 |
| 移动语义 | 不支持 | 支持 |

## 7. 使用建议

1. **优先使用 lock_guard**：简单场景下性能更好
2. **需要灵活性时使用 unique_lock**：条件变量、延迟加锁等
3. **多锁场景使用 scoped_lock**：C++17 起，最简洁安全

## 最佳实践

### 1. 根据场景选择合适的锁管理类

\`\`\`cpp
// 简单场景：使用 lock_guard
void simpleOperation() {
    std::lock_guard<std::mutex> lock(mtx);
    // 简单的临界区操作
}

// 需要条件变量：使用 unique_lock
void waitForCondition() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    // 条件满足后执行
}

// 多个互斥量：使用 scoped_lock
void multiLockOperation() {
    std::scoped_lock lock(mtx1, mtx2, mtx3);
    // 安全地访问多个共享资源
}
\`\`\`

### 2. 使用 defer_lock 实现灵活的锁定策略

\`\`\`cpp
void flexibleLocking() {
    std::unique_lock<std::mutex> lock1(mtx1, std::defer_lock);
    std::unique_lock<std::mutex> lock2(mtx2, std::defer_lock);
    
    // 执行一些不需要锁的操作
    prepareData();
    
    // 需要时再锁定
    std::lock(lock1, lock2);  // 避免死锁
    // 临界区操作
}
\`\`\`

### 3. 利用 RAII 确保异常安全

\`\`\`cpp
void exceptionSafeOperation() {
    std::lock_guard<std::mutex> lock(mtx);
    riskyOperation();  // 即使抛出异常，锁也会被正确释放
}
\`\`\`

### 4. 避免过度使用 unique_lock

\`\`\`cpp
// 不推荐：不必要的灵活性
void overkill() {
    std::unique_lock<std::mutex> lock(mtx);  // lock_guard 就够了
    simpleOperation();
}

// 推荐：简单场景用简单工具
void appropriate() {
    std::lock_guard<std::mutex> lock(mtx);
    simpleOperation();
}
\`\`\`

## 常见错误

### 1. 混用 lock_guard 和条件变量

\`\`\`cpp
// 错误：lock_guard 不能用于条件变量
void error1() {
    std::lock_guard<std::mutex> lock(mtx);
    cv.wait(lock);  // 编译错误！lock_guard 没有 release() 方法
}

// 正确：使用 unique_lock
void correct1() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock);  // OK
}
\`\`\`

### 2. 忘记检查 owns_lock()

\`\`\`cpp
// 错误：假设 try_to_lock 一定成功
void error2() {
    std::unique_lock<std::mutex> lock(mtx, std::try_to_lock);
    // 假设已获取锁，可能错误！
    accessSharedData();
}

// 正确：检查是否获取锁
void correct2() {
    std::unique_lock<std::mutex> lock(mtx, std::try_to_lock);
    if (lock.owns_lock()) {
        accessSharedData();
    } else {
        handleLockFailure();
    }
}
\`\`\`

### 3. 错误使用 adopt_lock

\`\`\`cpp
// 错误：使用 adopt_lock 但互斥量未锁定
void error3() {
    std::unique_lock<std::mutex> lock(mtx, std::adopt_lock);
    // mtx 实际上未锁定！未定义行为
}

// 正确：先锁定再 adopt
void correct3() {
    mtx.lock();
    std::unique_lock<std::mutex> lock(mtx, std::adopt_lock);
    // 现在可以安全使用
}
\`\`\`

### 4. 手动解锁后继续使用

\`\`\`cpp
// 危险：手动解锁后继续访问
void error4() {
    std::unique_lock<std::mutex> lock(mtx);
    lock.unlock();
    accessSharedData();  // 危险！锁已释放
}
\`\`\`

### 5. 忘记 scoped_lock 的 C++17 要求

\`\`\`cpp
// 错误：在 C++11/14 中使用 scoped_lock
void error5() {
    // std::scoped_lock lock(mtx1, mtx2);  // C++17 才支持
}

// 正确：C++11/14 使用 std::lock + unique_lock
void correct5() {
    std::unique_lock<std::mutex> lock1(mtx1, std::defer_lock);
    std::unique_lock<std::mutex> lock2(mtx2, std::defer_lock);
    std::lock(lock1, lock2);
}
\`\`\`

## 深入理解

### lock_guard 的实现原理

\`\`\`cpp
template<typename Mutex>
class lock_guard {
    Mutex& m;
public:
    explicit lock_guard(Mutex& m_) : m(m_) {
        m.lock();
    }
    ~lock_guard() {
        m.unlock();
    }
    lock_guard(const lock_guard&) = delete;
    lock_guard& operator=(const lock_guard&) = delete;
};
\`\`\`

### unique_lock 的内部状态

\`\`\`cpp
// unique_lock 维护以下状态：
// 1. 指向互斥量的指针
// 2. 是否拥有锁的标志
// 3. 是否在析构时需要解锁的标志

// 这就是为什么 unique_lock 比 lock_guard 稍慢：
// 需要额外的状态检查
\`\`\`

### 条件变量为什么需要 unique_lock

\`\`\`cpp
// cv.wait() 的工作原理：
// 1. 解锁互斥量
// 2. 进入等待状态
// 3. 被唤醒后重新加锁
// 4. 返回

// 这需要能够临时释放锁，unique_lock 提供了这个能力
// lock_guard 不支持解锁，所以不能用于条件变量
\`\`\`

### 移动语义

\`\`\`cpp
// unique_lock 支持移动，lock_guard 不支持
std::unique_lock<std::mutex> getLock() {
    std::unique_lock<std::mutex> lock(mtx);
    return lock;  // 移动返回
}

// 可以转移锁的所有权
std::unique_lock<std::mutex> lock1(mtx);
std::unique_lock<std::mutex> lock2 = std::move(lock1);
// lock1 不再管理锁，lock2 接管
\`\`\`

### 性能对比

\`\`\`cpp
// lock_guard：零开销抽象
// - 构造时调用 lock()
// - 析构时调用 unlock()
// - 没有额外的状态检查

// unique_lock：有少量开销
// - 需要维护 owns_lock 状态
// - 析构时需要检查是否需要解锁
// - 但开销通常可以忽略不计
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-3-1',
                    title: '使用 lock_guard 保护共享资源',
                    code: `#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

class BankAccount {
private:
    double balance;
    std::mutex mtx;
    
public:
    BankAccount(double initial) : balance(initial) {}
    
    void deposit(double amount) {
        std::lock_guard<std::mutex> lock(mtx);
        balance += amount;
        std::cout << "Deposited: " << amount 
                  << ", Balance: " << balance << std::endl;
    }
    
    bool withdraw(double amount) {
        std::lock_guard<std::mutex> lock(mtx);
        if (balance >= amount) {
            balance -= amount;
            std::cout << "Withdrew: " << amount 
                      << ", Balance: " << balance << std::endl;
            return true;
        }
        std::cout << "Insufficient funds" << std::endl;
        return false;
    }
    
    double getBalance() {
        std::lock_guard<std::mutex> lock(mtx);
        return balance;
    }
};

int main() {
    BankAccount account(1000);
    std::vector<std::thread> threads;
    
    // 多个线程同时操作账户
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&account, i]() {
            account.deposit(100);
            account.withdraw(50);
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Final balance: " << account.getBalance() << std::endl;
    return 0;
}`,
                    output: `Deposited: 100, Balance: 1100
Deposited: 100, Balance: 1200
Withdrew: 50, Balance: 1150
...
Final balance: 1250`
                },
                {
                    id: 'example-21-3-2',
                    title: '使用 unique_lock 实现转账',
                    code: `#include <iostream>
#include <thread>
#include <mutex>

class BankAccount {
public:
    double balance;
    std::mutex mtx;
    
    BankAccount(double initial) : balance(initial) {}
};

void transfer(BankAccount& from, BankAccount& to, double amount) {
    // 使用 defer_lock 避免立即加锁
    std::unique_lock<std::mutex> lock1(from.mtx, std::defer_lock);
    std::unique_lock<std::mutex> lock2(to.mtx, std::defer_lock);
    
    // 同时锁定两个账户，避免死锁
    std::lock(lock1, lock2);
    
    if (from.balance >= amount) {
        from.balance -= amount;
        to.balance += amount;
        std::cout << "Transferred: " << amount << std::endl;
    } else {
        std::cout << "Insufficient funds" << std::endl;
    }
}

int main() {
    BankAccount account1(1000);
    BankAccount account2(500);
    
    std::thread t1(transfer, std::ref(account1), std::ref(account2), 200);
    std::thread t2(transfer, std::ref(account2), std::ref(account1), 100);
    
    t1.join();
    t2.join();
    
    std::cout << "Account1: " << account1.balance << std::endl;
    std::cout << "Account2: " << account2.balance << std::endl;
    
    return 0;
}`,
                    output: `Transferred: 200
Transferred: 100
Account1: 900
Account2: 600`
                }
            ],
            handsOn: {
                title: '实现线程安全的日志系统',
                description: '实现一个线程安全的日志类，支持多线程同时写入日志。',
                initialCode: `#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <fstream>
#include <string>

class ThreadSafeLogger {
private:
    std::ofstream logFile;
    std::mutex mtx;
    
public:
    // TODO: 构造函数，打开日志文件
    ThreadSafeLogger(const std::string& filename) {
        // 打开文件
    }
    
    // TODO: 析构函数，关闭文件
    ~ThreadSafeLogger() {
        // 关闭文件
    }
    
    // TODO: 线程安全的日志写入
    void log(const std::string& message) {
        // 使用 lock_guard 保护文件写入
        // 写入消息并换行
    }
};

int main() {
    ThreadSafeLogger logger("log.txt");
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&logger, i]() {
            for (int j = 0; j < 3; ++j) {
                logger.log("Thread " + std::to_string(i) + 
                          " message " + std::to_string(j));
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Logging completed. Check log.txt" << std::endl;
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <fstream>
#include <string>

class ThreadSafeLogger {
private:
    std::ofstream logFile;
    std::mutex mtx;
    
public:
    ThreadSafeLogger(const std::string& filename) {
        logFile.open(filename);
    }
    
    ~ThreadSafeLogger() {
        if (logFile.is_open()) {
            logFile.close();
        }
    }
    
    void log(const std::string& message) {
        std::lock_guard<std::mutex> lock(mtx);
        if (logFile.is_open()) {
            logFile << message << std::endl;
        }
    }
};

int main() {
    ThreadSafeLogger logger("log.txt");
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&logger, i]() {
            for (int j = 0; j < 3; ++j) {
                logger.log("Thread " + std::to_string(i) + 
                          " message " + std::to_string(j));
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Logging completed. Check log.txt" << std::endl;
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::lock_guard 的主要优点是什么？',
                    options: [
                        '可以手动加锁和解锁',
                        '支持延迟加锁',
                        '自动管理锁的生命周期，异常安全',
                        '性能比直接使用 mutex.lock() 更好'
                    ],
                    correctAnswer: 2,
                    explanation: 'lock_guard 使用 RAII 机制，构造时加锁，析构时自动解锁，确保异常安全。'
                },
                {
                    question: '以下关于 unique_lock 的说法，哪个是错误的？',
                    options: [
                        '可以手动加锁和解锁',
                        '支持延迟加锁（defer_lock）',
                        '可以用于条件变量',
                        '性能比 lock_guard 更好'
                    ],
                    correctAnswer: 3,
                    explanation: 'unique_lock 比 lock_guard 更灵活，但由于额外的状态管理，性能稍差。'
                },
                {
                    question: '如何创建一个不立即加锁的 unique_lock？',
                    options: [
                        'std::unique_lock<std::mutex> lock(mtx, std::defer_lock);',
                        'std::unique_lock<std::mutex> lock(mtx, false);',
                        'std::unique_lock<std::mutex> lock(mtx, std::no_lock);',
                        'std::unique_lock<std::mutex> lock(mtx, std::late_lock);'
                    ],
                    correctAnswer: 0,
                    explanation: '使用 std::defer_lock 标志可以创建一个不立即加锁的 unique_lock。'
                },
                {
                    question: 'std::scoped_lock（C++17）的主要用途是？',
                    options: [
                        '替代 lock_guard，提供更好的性能',
                        '同时锁定多个互斥量，避免死锁',
                        '支持条件变量',
                        '实现递归锁定'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::scoped_lock 可以同时锁定多个互斥量，使用避免死锁的算法，是 C++17 的最佳实践。'
                },
                {
                    question: '以下代码有什么问题？\nstd::unique_lock<std::mutex> lock(mtx);\nlock.lock();',
                    options: [
                        '没有问题',
                        'unique_lock 构造时已经加锁，再次 lock() 会死锁',
                        '应该使用 lock_guard',
                        '需要先调用 unlock()'
                    ],
                    correctAnswer: 1,
                    explanation: 'unique_lock 默认构造时会立即加锁，再次调用 lock() 会导致死锁。应该使用 defer_lock 或检查 owns_lock()。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::lock_guard',
                    url: 'https://en.cppreference.com/w/cpp/thread/lock_guard'
                },
                {
                    title: 'C++ Reference - std::unique_lock',
                    url: 'https://en.cppreference.com/w/cpp/thread/unique_lock'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 优先使用 lock_guard，简单高效\n2. 需要条件变量或延迟加锁时使用 unique_lock\n3. C++17 起，多锁场景使用 scoped_lock\n4. 理解 RAII 是资源管理的核心思想'
        },
        {
            id: '21.4',
            title: '条件变量（condition_variable）',
            concepts: `
# 条件变量（condition_variable）

## 1. 条件变量概述

**条件变量**是一种同步原语，允许线程等待特定条件成立。它通常与互斥量配合使用。

### 为什么需要条件变量？

\`\`\`cpp
// 忙等待（效率低）
while (!ready) {
    // 不断检查，浪费 CPU
}

// 使用条件变量（高效）
std::unique_lock<std::mutex> lock(mtx);
cv.wait(lock, []{ return ready; });  // 条件不满足时休眠
\`\`\`

## 2. 基本使用

### 简单示例

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mtx);
    
    // 等待 ready 变为 true
    cv.wait(lock, []{ return ready; });
    
    std::cout << "Worker is processing" << std::endl;
}

int main() {
    std::thread t(worker);
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();  // 通知等待的线程
    
    t.join();
    return 0;
}
\`\`\`

## 3. condition_variable 的成员函数

### wait()

\`\`\`cpp
// 无条件等待（可能虚假唤醒）
cv.wait(lock);

// 带谓词的等待（推荐）
cv.wait(lock, []{ return condition; });
\`\`\`

### wait_for() 和 wait_until()

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void waitForEvent() {
    std::unique_lock<std::mutex> lock(mtx);
    
    // 等待最多 1 秒
    if (cv.wait_for(lock, std::chrono::seconds(1), []{ return ready; })) {
        std::cout << "Condition met" << std::endl;
    } else {
        std::cout << "Timeout" << std::endl;
    }
}

int main() {
    std::thread t(waitForEvent);
    t.join();
    return 0;
}
\`\`\`

### notify_one() 和 notify_all()

\`\`\`cpp
cv.notify_one();  // 唤醒一个等待线程
cv.notify_all();  // 唤醒所有等待线程
\`\`\`

## 4. 生产者-消费者模型

\`\`\`cpp
#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>

std::queue<int> dataQueue;
std::mutex mtx;
std::condition_variable cv;
bool finished = false;

void producer() {
    for (int i = 0; i < 10; ++i) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            dataQueue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
        cv.notify_one();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    
    {
        std::lock_guard<std::mutex> lock(mtx);
        finished = true;
    }
    cv.notify_all();
}

void consumer() {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);
        
        cv.wait(lock, []{ return !dataQueue.empty() || finished; });
        
        if (dataQueue.empty() && finished) {
            break;
        }
        
        int data = dataQueue.front();
        dataQueue.pop();
        std::cout << "Consumed: " << data << std::endl;
    }
}

int main() {
    std::thread p(producer);
    std::thread c(consumer);
    
    p.join();
    c.join();
    
    return 0;
}
\`\`\`

## 5. 虚假唤醒

**虚假唤醒**是指线程在没有收到通知的情况下被唤醒。

### 原因
- 操作系统实现细节
- 性能优化

### 解决方案

\`\`\`cpp
// 错误：可能虚假唤醒
cv.wait(lock);

// 正确：使用谓词
cv.wait(lock, []{ return ready; });

// 或者手动检查
while (!ready) {
    cv.wait(lock);
}
\`\`\`

## 6. condition_variable_any

\`std::condition_variable_any\` 可以与任何锁类型配合使用，而 \`std::condition_variable\` 只能与 \`std::unique_lock<std::mutex>\` 配合。

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <shared_mutex>

std::shared_mutex mtx;
std::condition_variable_any cv;
bool ready = false;

void reader() {
    std::shared_lock<std::shared_mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    std::cout << "Reader accessing data" << std::endl;
}

int main() {
    std::thread t(reader);
    
    {
        std::unique_lock<std::shared_mutex> lock(mtx);
        ready = true;
    }
    cv.notify_all();
    
    t.join();
    return 0;
}
\`\`\`

## 7. 使用注意事项

1. **必须与互斥量配合使用**
2. **使用谓词避免虚假唤醒**
3. **通知时持有锁不是必须的，但建议持有**
4. **wait() 会自动释放锁，唤醒时重新获取锁**

## 最佳实践

### 1. 始终使用带谓词的 wait

\`\`\`cpp
// 推荐：带谓词，避免虚假唤醒
cv.wait(lock, []{ return ready; });

// 不推荐：可能虚假唤醒
cv.wait(lock);
if (!ready) { /* 问题！ */ }
\`\`\`

### 2. 通知时考虑是否需要持有锁

\`\`\`cpp
// 情况1：通知时不需要持有锁（效率更高）
{
    std::lock_guard<std::mutex> lock(mtx);
    ready = true;
}  // 先释放锁
cv.notify_one();  // 再通知，避免唤醒后立即阻塞

// 情况2：通知时持有锁（更安全）
{
    std::lock_guard<std::mutex> lock(mtx);
    ready = true;
    cv.notify_one();  // 持有锁时通知
}
\`\`\`

### 3. 使用 condition_variable_any 支持不同锁类型

\`\`\`cpp
// 与 shared_mutex 配合
std::shared_mutex mtx;
std::condition_variable_any cv;

void reader() {
    std::shared_lock<std::shared_mutex> lock(mtx);  // 共享锁
    cv.wait(lock, []{ return ready; });
}
\`\`\`

### 4. 正确处理生产者-消费者模型

\`\`\`cpp
// 生产者：先修改条件，再通知
void produce(int value) {
    {
        std::lock_guard<std::mutex> lock(mtx);
        queue.push(value);
        ready = true;
    }
    cv.notify_one();  // 或 notify_all()
}

// 消费者：使用谓词等待
void consume() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return !queue.empty(); });
    // 处理数据
}
\`\`\`

## 常见错误

### 1. 忘记使用谓词

\`\`\`cpp
// 错误：可能虚假唤醒
void error1() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock);
    // 可能 ready 还是 false！
    process(ready);
}

// 正确：使用谓词
void correct1() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    process(ready);
}
\`\`\`

### 2. 条件变量与错误的锁类型

\`\`\`cpp
// 错误：condition_variable 需要 unique_lock<mutex>
void error2() {
    std::lock_guard<std::mutex> lock(mtx);
    // cv.wait(lock);  // 编译错误！
}

// 正确：使用 unique_lock
void correct2() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
}
\`\`\`

### 3. 通知丢失

\`\`\`cpp
// 错误：通知可能在等待之前发生
void error3() {
    std::thread t([&]() {
        // 如果这里先执行 notify
        cv.notify_one();
    });
    
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });  // 可能永远等待！
}

// 正确：确保条件在通知前设置
void correct3() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();
}
\`\`\`

### 4. 忘记唤醒所有线程

\`\`\`cpp
// 错误：只唤醒一个线程
void error4() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();  // 如果有多个等待线程，可能不够
}

// 正确：唤醒所有等待线程
void correct4() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_all();  // 唤醒所有线程
}
\`\`\`

### 5. 死锁：在持有锁时等待另一个条件

\`\`\`cpp
// 危险：可能导致死锁
void error5() {
    std::unique_lock<std::mutex> lock1(mtx1);
    cv1.wait(lock1, []{ return ready1; });
    
    // 如果这里需要 mtx2
    std::lock_guard<std::mutex> lock2(mtx2);  // 可能死锁
}
\`\`\`

## 深入理解

### wait() 的内部实现

\`\`\`cpp
// wait(lock, pred) 的等价实现
template<typename Lock, typename Predicate>
void wait(Lock& lock, Predicate pred) {
    while (!pred()) {
        wait(lock);  // 解锁、等待、加锁
    }
}

// wait(lock) 的简化实现
void wait(Lock& lock) {
    // 1. 解锁互斥量
    lock.unlock();
    // 2. 进入等待队列，休眠
    // 3. 被唤醒后重新加锁
    lock.lock();
}
\`\`\`

### 虚假唤醒的原因

\`\`\`cpp
// 虚假唤醒可能发生在：
// 1. 操作系统信号处理
// 2. 系统调用被中断
// 3. 性能优化的副作用

// 这就是为什么必须使用谓词
while (!ready) {
    cv.wait(lock);
}
// 等价于
cv.wait(lock, []{ return ready; });
\`\`\`

### notify_one vs notify_all

\`\`\`cpp
// notify_one：唤醒一个等待线程
// 适用于：只有一个线程需要被唤醒
// 例如：生产者-消费者队列，一个生产者对应一个消费者

// notify_all：唤醒所有等待线程
// 适用于：多个线程等待同一条件变化
// 例如：状态改变，所有线程都需要检查

// 示例：多个线程等待资源可用
std::mutex mtx;
std::condition_variable cv;
bool resourceAvailable = false;

void waitForResource() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return resourceAvailable; });
    // 使用资源
}

void releaseResource() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        resourceAvailable = true;
    }
    cv.notify_all();  // 唤醒所有等待的线程
}
\`\`\`

### 条件变量与信号量的区别

\`\`\`cpp
// 条件变量：需要与互斥量配合，用于复杂条件等待
// 信号量：独立使用，用于资源计数

// 条件变量示例
std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void wait() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
}

// 信号量示例（C++20）
std::counting_semaphore<10> sem(0);

void wait() {
    sem.acquire();  // 简单的计数等待
}
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-4-1',
                    title: '线程安全的阻塞队列',
                    code: `#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>

template<typename T>
class BlockingQueue {
private:
    std::queue<T> queue;
    std::mutex mtx;
    std::condition_variable notEmpty;
    std::condition_variable notFull;
    size_t maxSize;
    
public:
    BlockingQueue(size_t size) : maxSize(size) {}
    
    void push(T value) {
        std::unique_lock<std::mutex> lock(mtx);
        
        // 等待队列不满
        notFull.wait(lock, [this]() { return queue.size() < maxSize; });
        
        queue.push(value);
        notEmpty.notify_one();
    }
    
    T pop() {
        std::unique_lock<std::mutex> lock(mtx);
        
        // 等待队列不空
        notEmpty.wait(lock, [this]() { return !queue.empty(); });
        
        T value = queue.front();
        queue.pop();
        notFull.notify_one();
        return value;
    }
    
    bool empty() {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.empty();
    }
};

int main() {
    BlockingQueue<int> queue(5);
    
    std::thread producer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            queue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
    });
    
    std::thread consumer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            int value = queue.pop();
            std::cout << "Consumed: " << value << std::endl;
        }
    });
    
    producer.join();
    consumer.join();
    
    return 0;
}`,
                    output: `Produced: 0
Produced: 1
Consumed: 0
Produced: 2
Consumed: 1
...`
                },
                {
                    id: 'example-21-4-2',
                    title: '多线程任务队列',
                    code: `#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <vector>

class TaskQueue {
private:
    std::queue<std::function<void()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
    bool stop = false;
    
public:
    void addTask(std::function<void()> task) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            tasks.push(task);
        }
        cv.notify_one();
    }
    
    void stopProcessing() {
        {
            std::lock_guard<std::mutex> lock(mtx);
            stop = true;
        }
        cv.notify_all();
    }
    
    void processTasks() {
        while (true) {
            std::function<void()> task;
            {
                std::unique_lock<std::mutex> lock(mtx);
                cv.wait(lock, [this]() { return !tasks.empty() || stop; });
                
                if (stop && tasks.empty()) {
                    return;
                }
                
                task = tasks.front();
                tasks.pop();
            }
            task();
        }
    }
};

int main() {
    TaskQueue taskQueue;
    
    std::thread worker([&taskQueue]() {
        taskQueue.processTasks();
    });
    
    for (int i = 0; i < 5; ++i) {
        taskQueue.addTask([i]() {
            std::cout << "Task " << i << " executed by thread " 
                      << std::this_thread::get_id() << std::endl;
        });
    }
    
    taskQueue.stopProcessing();
    worker.join();
    
    return 0;
}`,
                    output: `Task 0 executed by thread 2
Task 1 executed by thread 2
Task 2 executed by thread 2
Task 3 executed by thread 2
Task 4 executed by thread 2`
                }
            ],
            handsOn: {
                title: '实现读写锁',
                description: '使用条件变量实现一个读写锁，支持多个读者同时读取，但写者独占访问。',
                initialCode: `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

class ReadWriteLock {
private:
    std::mutex mtx;
    std::condition_variable readCV;
    std::condition_variable writeCV;
    int readers = 0;
    bool writing = false;
    int waitingWriters = 0;
    
public:
    // TODO: 获取读锁
    void lockRead() {
        std::unique_lock<std::mutex> lock(mtx);
        // 等待条件：没有写者在写，且没有等待的写者（写者优先）
        // 增加读者计数
    }
    
    // TODO: 释放读锁
    void unlockRead() {
        std::unique_lock<std::mutex> lock(mtx);
        // 减少读者计数
        // 如果没有读者了，通知写者
    }
    
    // TODO: 获取写锁
    void lockWrite() {
        std::unique_lock<std::mutex> lock(mtx);
        // 增加等待写者计数
        // 等待条件：没有读者在读，没有写者在写
        // 设置 writing 为 true，减少等待写者计数
    }
    
    // TODO: 释放写锁
    void unlockWrite() {
        std::unique_lock<std::mutex> lock(mtx);
        // 设置 writing 为 false
        // 通知所有读者和写者
    }
};

// RAII 包装器
class ReadLock {
    ReadWriteLock& rwlock;
public:
    ReadLock(ReadWriteLock& lock) : rwlock(lock) { rwlock.lockRead(); }
    ~ReadLock() { rwlock.unlockRead(); }
};

class WriteLock {
    ReadWriteLock& rwlock;
public:
    WriteLock(ReadWriteLock& lock) : rwlock(lock) { rwlock.lockWrite(); }
    ~WriteLock() { rwlock.unlockWrite(); }
};

int main() {
    ReadWriteLock rwlock;
    int sharedData = 0;
    
    std::thread readers[3];
    std::thread writers[2];
    
    // 创建读者线程
    for (int i = 0; i < 3; ++i) {
        readers[i] = std::thread([&rwlock, &sharedData, i]() {
            for (int j = 0; j < 3; ++j) {
                ReadLock lock(rwlock);
                std::cout << "Reader " << i << " read: " << sharedData << std::endl;
            }
        });
    }
    
    // 创建写者线程
    for (int i = 0; i < 2; ++i) {
        writers[i] = std::thread([&rwlock, &sharedData, i]() {
            for (int j = 0; j < 2; ++j) {
                WriteLock lock(rwlock);
                sharedData++;
                std::cout << "Writer " << i << " wrote: " << sharedData << std::endl;
            }
        });
    }
    
    for (auto& t : readers) t.join();
    for (auto& t : writers) t.join();
    
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

class ReadWriteLock {
private:
    std::mutex mtx;
    std::condition_variable readCV;
    std::condition_variable writeCV;
    int readers = 0;
    bool writing = false;
    int waitingWriters = 0;
    
public:
    void lockRead() {
        std::unique_lock<std::mutex> lock(mtx);
        readCV.wait(lock, [this]() { return !writing && waitingWriters == 0; });
        readers++;
    }
    
    void unlockRead() {
        std::unique_lock<std::mutex> lock(mtx);
        readers--;
        if (readers == 0) {
            writeCV.notify_one();
        }
    }
    
    void lockWrite() {
        std::unique_lock<std::mutex> lock(mtx);
        waitingWriters++;
        writeCV.wait(lock, [this]() { return readers == 0 && !writing; });
        waitingWriters--;
        writing = true;
    }
    
    void unlockWrite() {
        std::unique_lock<std::mutex> lock(mtx);
        writing = false;
        if (waitingWriters > 0) {
            writeCV.notify_one();
        } else {
            readCV.notify_all();
        }
    }
};

class ReadLock {
    ReadWriteLock& rwlock;
public:
    ReadLock(ReadWriteLock& lock) : rwlock(lock) { rwlock.lockRead(); }
    ~ReadLock() { rwlock.unlockRead(); }
};

class WriteLock {
    ReadWriteLock& rwlock;
public:
    WriteLock(ReadWriteLock& lock) : rwlock(lock) { rwlock.lockWrite(); }
    ~WriteLock() { rwlock.unlockWrite(); }
};

int main() {
    ReadWriteLock rwlock;
    int sharedData = 0;
    
    std::thread readers[3];
    std::thread writers[2];
    
    for (int i = 0; i < 3; ++i) {
        readers[i] = std::thread([&rwlock, &sharedData, i]() {
            for (int j = 0; j < 3; ++j) {
                ReadLock lock(rwlock);
                std::cout << "Reader " << i << " read: " << sharedData << std::endl;
            }
        });
    }
    
    for (int i = 0; i < 2; ++i) {
        writers[i] = std::thread([&rwlock, &sharedData, i]() {
            for (int j = 0; j < 2; ++j) {
                WriteLock lock(rwlock);
                sharedData++;
                std::cout << "Writer " << i << " wrote: " << sharedData << std::endl;
            }
        });
    }
    
    for (auto& t : readers) t.join();
    for (auto& t : writers) t.join();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '条件变量必须与什么配合使用？',
                    options: [
                        '原子变量',
                        '互斥量',
                        '信号量',
                        '自旋锁'
                    ],
                    correctAnswer: 1,
                    explanation: '条件变量必须与互斥量配合使用，wait() 会自动释放锁并在唤醒时重新获取锁。'
                },
                {
                    question: '什么是虚假唤醒？',
                    options: [
                        '线程在没有收到通知的情况下被唤醒',
                        '线程收到多次通知',
                        '通知丢失',
                        '死锁的一种形式'
                    ],
                    correctAnswer: 0,
                    explanation: '虚假唤醒是指线程在没有收到 notify 的情况下被唤醒，这是操作系统实现的一种特性。'
                },
                {
                    question: '如何避免虚假唤醒？',
                    options: [
                        '使用 notify_all() 代替 notify_one()',
                        '使用带谓词的 wait()',
                        '增加互斥量数量',
                        '使用 try_lock()'
                    ],
                    correctAnswer: 1,
                    explanation: '使用带谓词的 wait() 可以自动检查条件，避免虚假唤醒带来的问题。'
                },
                {
                    question: 'cv.wait(lock) 执行时会做什么？',
                    options: [
                        '只等待通知',
                        '释放锁并等待，唤醒时重新获取锁',
                        '保持锁并等待',
                        '创建新的锁'
                    ],
                    correctAnswer: 1,
                    explanation: 'wait() 会自动释放锁进入等待状态，被唤醒后会重新获取锁。'
                },
                {
                    question: '以下哪个函数可以设置超时等待？',
                    options: [
                        'cv.wait()',
                        'cv.wait_for()',
                        'cv.notify_one()',
                        'cv.notify_all()'
                    ],
                    correctAnswer: 1,
                    explanation: 'wait_for() 可以设置超时时间，超时后会自动返回。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::condition_variable',
                    url: 'https://en.cppreference.com/w/cpp/thread/condition_variable'
                },
                {
                    title: 'Producer-Consumer Problem',
                    url: 'https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 条件变量必须与互斥量配合使用\n2. 始终使用带谓词的 wait() 避免虚假唤醒\n3. 理解 wait() 会自动释放和重新获取锁\n4. 生产者-消费者模型是经典应用场景'
        },
        {
            id: '21.5',
            title: '原子操作与原子类型（atomic）',
            concepts: `
# 原子操作与原子类型（atomic）

## 1. 原子操作概述

**原子操作**是不可分割的操作，要么完全执行，要么完全不执行，不会被中断。

### 为什么需要原子操作？

\`\`\`cpp
// 非原子操作，存在数据竞争
int counter = 0;
counter++;  // 读取、加1、写入 - 三个步骤

// 原子操作，线程安全
std::atomic<int> counter(0);
counter++;  // 原子递增，不可分割
\`\`\`

## 2. std::atomic 基本使用

### 初始化

\`\`\`cpp
#include <atomic>

std::atomic<int> a(10);        // 初始化为 10
std::atomic<int> b{20};        // 初始化为 20
std::atomic<int> c = 30;       // C++17 起
\`\`\`

### 基本操作

\`\`\`cpp
#include <iostream>
#include <atomic>

int main() {
    std::atomic<int> value(0);
    
    // 读取
    int v = value.load();
    std::cout << "Value: " << v << std::endl;
    
    // 写入
    value.store(10);
    
    // 交换
    int old = value.exchange(20);
    std::cout << "Old: " << old << ", New: " << value << std::endl;
    
    return 0;
}
\`\`\`

## 3. 原子类型支持的操作

### 整数类型

\`\`\`cpp
#include <iostream>
#include <atomic>

int main() {
    std::atomic<int> value(0);
    
    // 原子递增
    value++;           // 返回新值
    ++value;           // 返回新值
    value.fetch_add(1); // 返回旧值
    
    // 原子递减
    value--;
    --value;
    value.fetch_sub(1);
    
    // 原子位运算
    value.fetch_and(0xFF);
    value.fetch_or(0x01);
    value.fetch_xor(0x10);
    
    return 0;
}
\`\`\`

### 指针类型

\`\`\`cpp
#include <iostream>
#include <atomic>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    std::atomic<int*> ptr(arr);
    
    // 原子指针运算
    int* p = ptr.fetch_add(2);  // 移动 2 个元素
    std::cout << "Pointer points to: " << *ptr << std::endl;
    
    return 0;
}
\`\`\`

### 布尔类型

\`\`\`cpp
#include <iostream>
#include <atomic>

int main() {
    std::atomic<bool> flag(false);
    
    // 原子设置
    flag.store(true);
    
    // 原子交换
    bool old = flag.exchange(false);
    
    return 0;
}
\`\`\`

## 4. 比较交换（CAS）

**比较交换（Compare-And-Swap）** 是原子操作的核心，用于实现无锁算法。

\`\`\`cpp
#include <iostream>
#include <atomic>

int main() {
    std::atomic<int> value(10);
    
    int expected = 10;
    int desired = 20;
    
    // 如果 value == expected，则 value = desired
    if (value.compare_exchange_strong(expected, desired)) {
        std::cout << "Exchange successful: " << value << std::endl;
    } else {
        std::cout << "Exchange failed, current value: " << expected << std::endl;
    }
    
    return 0;
}
\`\`\`

### compare_exchange_strong vs weak

\`\`\`cpp
std::atomic<int> value(10);
int expected = 10;

// strong: 只有在 value != expected 时返回 false
value.compare_exchange_strong(expected, 20);

// weak: 可能在 value == expected 时也返回 false（虚假失败）
// 适用于循环中
do {
    expected = value.load();
} while (!value.compare_exchange_weak(expected, expected + 1));
\`\`\`

## 5. 线程安全的计数器

\`\`\`cpp
#include <iostream>
#include <thread>
#include <vector>
#include <atomic>

std::atomic<int> counter(0);

void increment() {
    for (int i = 0; i < 10000; ++i) {
        counter++;  // 原子递增
    }
}

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Counter: " << counter << std::endl;  // 正确输出 100000
    return 0;
}
\`\`\`

## 6. 自旋锁实现

\`\`\`cpp
#include <iostream>
#include <thread>
#include <atomic>

class SpinLock {
private:
    std::atomic<bool> locked{false};
    
public:
    void lock() {
        while (locked.exchange(true)) {
            // 自旋等待
        }
    }
    
    void unlock() {
        locked.store(false);
    }
};

SpinLock spinlock;

void safePrint(int id) {
    spinlock.lock();
    std::cout << "Thread " << id << " is working" << std::endl;
    spinlock.unlock();
}

int main() {
    std::thread t1(safePrint, 1);
    std::thread t2(safePrint, 2);
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

## 7. atomic_flag

最简单的原子类型，只有两个状态：设置和清除。

\`\`\`cpp
#include <iostream>
#include <atomic>
#include <thread>

std::atomic_flag lock = ATOMIC_FLAG_INIT;

void spinlockExample() {
    while (lock.test_and_set(std::memory_order_acquire)) {
        // 自旋等待
    }
    
    // 临界区
    std::cout << "Critical section" << std::endl;
    
    lock.clear(std::memory_order_release);
}

int main() {
    std::thread t1(spinlockExample);
    std::thread t2(spinlockExample);
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

## 8. 原子类型的限制

不是所有类型都可以原子化：
- 必须是可平凡复制（Trivially Copyable）的类型
- 大小通常受限于硬件支持

\`\`\`cpp
// 可以
std::atomic<int> a;
std::atomic<float> b;
std::atomic<void*> c;

// 不可以
struct BigStruct {
    int data[100];
};
std::atomic<BigStruct> d;  // 可能不支持
\`\`\`

## 最佳实践

### 1. 选择合适的原子操作

\`\`\`cpp
// 推荐：使用高级操作
std::atomic<int> counter(0);
counter.fetch_add(1);  // 明确表达意图

// 避免：过度使用 CAS 循环
int expected = counter.load();
while (!counter.compare_exchange_weak(expected, expected + 1)) {
    // 仅在必要时使用
}
\`\`\`

### 2. 使用 memory_order 提高性能

\`\`\`cpp
std::atomic<int> counter(0);

// 默认：最强保证，性能较低
counter.load();  // 等同于 memory_order_seq_cst

// 放松顺序：适用于独立计数器
counter.fetch_add(1, std::memory_order_relaxed);

// 获取-释放：适用于同步
counter.store(10, std::memory_order_release);
int v = counter.load(std::memory_order_acquire);
\`\`\`

### 3. 优先使用 atomic 而非 mutex（简单场景）

\`\`\`cpp
// 简单计数器：使用 atomic
std::atomic<int> counter(0);
counter++;  // 高效

// 复杂操作：使用 mutex
std::mutex mtx;
std::vector<int> data;
{
    std::lock_guard<std::mutex> lock(mtx);
    data.push_back(1);  // 需要保护整个操作序列
    data.push_back(2);
}
\`\`\`

### 4. 避免自旋锁在单核 CPU 上使用

\`\`\`cpp
// 问题：单核 CPU 上自旋锁会浪费 CPU 时间
class SpinLock {
    std::atomic<bool> locked{false};
public:
    void lock() {
        while (locked.exchange(true)) {
            // 单核 CPU：线程无法切换，死循环！
        }
    }
    void unlock() { locked.store(false); }
};

// 改进：添加退避策略
void lock() {
    while (locked.exchange(true)) {
        std::this_thread::yield();  // 让出 CPU
    }
}
\`\`\`

## 常见错误

### 1. 误解原子操作的适用范围

\`\`\`cpp
// 错误：认为 atomic 使整个类线程安全
struct Data {
    std::atomic<int> x;
    std::atomic<int> y;
};

Data d;
// 仍然不是线程安全的！
d.x.store(1);
d.y.store(2);  // 其他线程可能看到 x=1, y=旧值

// 正确：使用 mutex 保护相关联的数据
std::mutex mtx;
int x, y;
{
    std::lock_guard<std::mutex> lock(mtx);
    x = 1;
    y = 2;  // 原子地更新两个变量
}
\`\`\`

### 2. 忽略 ABA 问题

\`\`\`cpp
// ABA 问题示例
std::atomic<int*> ptr;
int a = 1, b = 2;

// 线程1：读取 ptr = &a
int* p = ptr.load();

// 线程2：修改 ptr
ptr.store(&b);
ptr.store(&a);  // 又改回 &a

// 线程1：CAS 成功，但数据已被修改！
ptr.compare_exchange_strong(p, &b);  // 危险！

// 解决方案：使用带版本号的指针或 hazard pointer
\`\`\`

### 3. 错误使用 compare_exchange

\`\`\`cpp
std::atomic<int> value(10);

// 错误：expected 未更新
int expected = 10;
if (!value.compare_exchange_strong(expected, 20)) {
    // expected 会被更新为当前值
    std::cout << expected;  // 不是 10！
}

// 正确：理解 expected 的语义
int expected = 10;
while (!value.compare_exchange_weak(expected, 20)) {
    // expected 已被更新，继续尝试
}
\`\`\`

### 4. 滥用 memory_order_relaxed

\`\`\`cpp
std::atomic<bool> ready{false};
int data = 0;

// 线程1
data = 42;
ready.store(true, std::memory_order_relaxed);  // 危险！

// 线程2
if (ready.load(std::memory_order_relaxed)) {
    // 可能看不到 data = 42！
    std::cout << data;  // 可能输出 0
}

// 正确：使用 release-acquire 语义
ready.store(true, std::memory_order_release);
if (ready.load(std::memory_order_acquire)) {
    std::cout << data;  // 保证看到 42
}
\`\`\`

## 深入理解

### 1. 内存序（Memory Order）详解

C++ 提供了六种内存序，从弱到强：

\`\`\`cpp
// 1. memory_order_relaxed：无同步，仅保证原子性
std::atomic<int> counter(0);
counter.fetch_add(1, std::memory_order_relaxed);
// 适用：独立计数器、统计信息

// 2. memory_order_consume：数据依赖同步（C++17 已弱化）
// 实际中很少使用

// 3. memory_order_acquire：防止后续读写重排到前面
std::atomic<bool> ready{false};
// 读线程
if (ready.load(std::memory_order_acquire)) {
    // 保证看到所有 release 前的写入
}

// 4. memory_order_release：防止前面读写重排到后面
// 写线程
data = 42;
ready.store(true, std::memory_order_release);

// 5. memory_order_acq_rel：同时具有 acquire 和 release 语义
std::atomic<int> counter;
counter.fetch_add(1, std::memory_order_acq_rel);

// 6. memory_order_seq_cst：最强保证，全局顺序一致
// 默认值，保证所有线程看到相同的操作顺序
\`\`\`

### 2. 无锁编程的挑战

\`\`\`cpp
// 无锁栈的 ABA 问题
template<typename T>
class LockFreeStack {
    struct Node { T data; Node* next; };
    std::atomic<Node*> head;

    void push(T value) {
        Node* n = new Node{value, head.load()};
        // 问题：如果其他线程在此期间 pop 并 delete 了 head
        // 然后 push 新节点恰好分配在同一地址
        // CAS 会错误地成功
        while (!head.compare_exchange_weak(n->next, n));
    }
};

// 解决方案：使用带版本号的指针
struct TaggedPointer {
    Node* ptr;
    uint64_t tag;  // 版本号
};
std::atomic<TaggedPointer> head;
\`\`\`

### 3. 原子操作的硬件实现

\`\`\`cpp
// x86 架构：LOCK 前缀指令
// std::atomic<int>::fetch_add() 编译为：
// lock xadd [mem], reg

// ARM 架构：LDXR/STXR 独占加载/存储
// CAS 操作使用 LL/SC（Load-Linked/Store-Conditional）

// 理解硬件差异有助于优化：
// - x86：CAS 较快，但所有原子操作有隐式屏障
// - ARM：relaxed 操作更快，但需要显式屏障
\`\`\`

### 4. 原子智能指针（C++20）

\`\`\`cpp
#include <memory>
#include <atomic>

// C++20 提供了 std::atomic<std::shared_ptr>
std::atomic<std::shared_ptr<int>> atomicPtr;

// 线程安全地更新
auto newPtr = std::make_shared<int>(42);
atomicPtr.store(newPtr);

// 线程安全地读取
auto ptr = atomicPtr.load();
if (ptr) {
    std::cout << *ptr << std::endl;
}

// 注意：std::atomic<std::shared_ptr> 通常使用内部锁实现
// 对于高性能场景，考虑其他方案
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-5-1',
                    title: '无锁栈',
                    code: `#include <iostream>
#include <atomic>
#include <memory>

template<typename T>
class LockFreeStack {
private:
    struct Node {
        T data;
        Node* next;
        Node(const T& value) : data(value), next(nullptr) {}
    };
    
    std::atomic<Node*> head;
    
public:
    LockFreeStack() : head(nullptr) {}
    
    void push(const T& value) {
        Node* newNode = new Node(value);
        newNode->next = head.load();
        
        // CAS 循环
        while (!head.compare_exchange_weak(newNode->next, newNode));
    }
    
    bool pop(T& result) {
        Node* oldHead = head.load();
        
        while (oldHead && !head.compare_exchange_weak(oldHead, oldHead->next));
        
        if (oldHead) {
            result = oldHead->data;
            delete oldHead;
            return true;
        }
        return false;
    }
};

int main() {
    LockFreeStack<int> stack;
    
    stack.push(1);
    stack.push(2);
    stack.push(3);
    
    int value;
    while (stack.pop(value)) {
        std::cout << "Popped: " << value << std::endl;
    }
    
    return 0;
}`,
                    output: `Popped: 3
Popped: 2
Popped: 1`
                },
                {
                    id: 'example-21-5-2',
                    title: '原子引用计数',
                    code: `#include <iostream>
#include <atomic>
#include <string>

class ReferenceCounted {
private:
    std::atomic<int> refCount;
    std::string data;
    
public:
    ReferenceCounted(const std::string& s) : data(s), refCount(1) {}
    
    void addRef() {
        refCount++;
    }
    
    void release() {
        if (--refCount == 0) {
            delete this;
        }
    }
    
    const std::string& getData() const {
        return data;
    }
};

int main() {
    ReferenceCounted* obj = new ReferenceCounted("Hello");
    
    obj->addRef();
    obj->addRef();
    
    std::cout << "Data: " << obj->getData() << std::endl;
    
    obj->release();
    obj->release();
    obj->release();  // 最后一次释放，对象被删除
    
    std::cout << "Object destroyed" << std::endl;
    return 0;
}`,
                    output: `Data: Hello
Object destroyed`
                }
            ],
            handsOn: {
                title: '实现原子最大值跟踪器',
                description: '实现一个线程安全的类，跟踪多个线程更新的最大值。',
                initialCode: `#include <iostream>
#include <thread>
#include <vector>
#include <atomic>
#include <random>

class MaxTracker {
private:
    std::atomic<int> maxValue;
    
public:
    MaxTracker(int initial = 0) : maxValue(initial) {}
    
    // TODO: 更新最大值（如果新值更大）
    void update(int value) {
        // 使用 compare_exchange 实现原子更新
        // 如果 value > maxValue，则更新
    }
    
    // TODO: 获取当前最大值
    int get() const {
        // 返回 maxValue
        return 0;
    }
};

int main() {
    MaxTracker tracker;
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&tracker, i]() {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(1, 100);
            
            for (int j = 0; j < 10; ++j) {
                int value = dis(gen);
                tracker.update(value);
                std::cout << "Thread " << i << " generated: " << value << std::endl;
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Maximum value: " << tracker.get() << std::endl;
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <vector>
#include <atomic>
#include <random>

class MaxTracker {
private:
    std::atomic<int> maxValue;
    
public:
    MaxTracker(int initial = 0) : maxValue(initial) {}
    
    void update(int value) {
        int current = maxValue.load();
        while (value > current && !maxValue.compare_exchange_weak(current, value)) {
            // current 会被更新为当前值，继续尝试
        }
    }
    
    int get() const {
        return maxValue.load();
    }
};

int main() {
    MaxTracker tracker;
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&tracker, i]() {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(1, 100);
            
            for (int j = 0; j < 10; ++j) {
                int value = dis(gen);
                tracker.update(value);
                std::cout << "Thread " << i << " generated: " << value << std::endl;
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Maximum value: " << tracker.get() << std::endl;
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::atomic 的主要作用是什么？',
                    options: [
                        '提高性能',
                        '提供线程安全的原子操作',
                        '替代互斥量',
                        '简化代码'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::atomic 提供原子操作，确保操作不可分割，避免数据竞争，实现线程安全。'
                },
                {
                    question: 'compare_exchange_strong 的作用是？',
                    options: [
                        '比较两个值是否相等',
                        '如果当前值等于期望值，则设置新值',
                        '交换两个值',
                        '原子递增'
                    ],
                    correctAnswer: 1,
                    explanation: 'compare_exchange_strong 是比较交换操作，如果原子变量的值等于 expected，则设置为 desired。'
                },
                {
                    question: '以下哪个类型可以用作 std::atomic 的模板参数？',
                    options: [
                        'std::string',
                        'std::vector<int>',
                        'int',
                        '包含虚函数的类'
                    ],
                    correctAnswer: 2,
                    explanation: 'std::atomic 要求类型必须是可平凡复制（Trivially Copyable）的类型，int 满足这个要求。'
                },
                {
                    question: 'std::atomic_flag 与 std::atomic<bool> 的区别是？',
                    options: [
                        'atomic_flag 更快但功能更少',
                        'atomic<bool> 更快',
                        '它们完全相同',
                        'atomic_flag 支持更多操作'
                    ],
                    correctAnswer: 0,
                    explanation: 'std::atomic_flag 是最简单的原子类型，只支持 test_and_set 和 clear，但性能最好。'
                },
                {
                    question: '原子操作可以完全替代互斥量吗？',
                    options: [
                        '可以，原子操作更快',
                        '不可以，复杂操作仍需要互斥量',
                        '可以，原子操作更安全',
                        '不可以，原子操作已过时'
                    ],
                    correctAnswer: 1,
                    explanation: '原子操作适用于简单的读写场景，复杂的临界区操作仍需要互斥量来保护。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::atomic',
                    url: 'https://en.cppreference.com/w/cpp/atomic/atomic'
                },
                {
                    title: 'Lock-Free Programming',
                    url: 'https://preshing.com/20120612/an-introduction-to-lock-free-programming/'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 原子操作适用于简单的共享变量访问\n2. CAS（比较交换）是实现无锁算法的核心\n3. 理解 compare_exchange_strong 和 weak 的区别\n4. 复杂操作仍需要互斥量，不要过度使用原子操作'
        },
        {
            id: '21.6',
            title: '异步任务：future、promise、async',
            concepts: `
# 异步任务：future、promise、async

## 1. 异步编程概述

**异步编程**允许任务在后台执行，主线程可以继续其他工作，稍后获取结果。

### 同步 vs 异步

\`\`\`cpp
// 同步：阻塞等待
int result = compute();  // 等待计算完成
doOtherWork();           // 计算完成后才执行

// 异步：并行执行
std::future<int> fut = std::async(compute);  // 启动异步任务
doOtherWork();                               // 同时执行其他工作
int result = fut.get();                      // 获取结果
\`\`\`

## 2. std::future

**future** 用于获取异步任务的结果。

### 基本使用

\`\`\`cpp
#include <iostream>
#include <future>
#include <chrono>

int compute() {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 42;
}

int main() {
    std::future<int> fut = std::async(std::launch::async, compute);
    
    std::cout << "Waiting for result..." << std::endl;
    int result = fut.get();  // 阻塞直到结果就绪
    
    std::cout << "Result: " << result << std::endl;
    return 0;
}
\`\`\`

### future 的成员函数

\`\`\`cpp
std::future<int> fut = std::async(compute);

// 检查结果是否就绪
bool ready = fut.valid();

// 等待结果就绪
fut.wait();

// 等待一段时间
auto status = fut.wait_for(std::chrono::seconds(1));
if (status == std::future_status::ready) {
    int result = fut.get();
}

// 等待到指定时间点
auto status = fut.wait_until(std::chrono::system_clock::now() + std::chrono::seconds(1));
\`\`\`

## 3. std::promise

**promise** 用于设置异步任务的结果或异常。

### 基本使用

\`\`\`cpp
#include <iostream>
#include <future>
#include <thread>

void compute(std::promise<int>& prom) {
    try {
        // 执行计算
        int result = 42;
        prom.set_value(result);
    } catch (...) {
        prom.set_exception(std::current_exception());
    }
}

int main() {
    std::promise<int> prom;
    std::future<int> fut = prom.get_future();
    
    std::thread t(compute, std::ref(prom));
    
    int result = fut.get();
    std::cout << "Result: " << result << std::endl;
    
    t.join();
    return 0;
}
\`\`\`

### 设置异常

\`\`\`cpp
#include <iostream>
#include <future>
#include <thread>
#include <stdexcept>

void mayThrow(std::promise<int>& prom) {
    try {
        throw std::runtime_error("Something went wrong");
    } catch (...) {
        prom.set_exception(std::current_exception());
    }
}

int main() {
    std::promise<int> prom;
    std::future<int> fut = prom.get_future();
    
    std::thread t(mayThrow, std::ref(prom));
    
    try {
        int result = fut.get();
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
    
    t.join();
    return 0;
}
\`\`\`

## 4. std::async

**async** 用于启动异步任务，返回一个 future。

### 启动策略

\`\`\`cpp
#include <iostream>
#include <future>
#include <thread>

int compute() {
    std::cout << "Computing on thread: " << std::this_thread::get_id() << std::endl;
    return 42;
}

int main() {
    // 异步启动（新线程）
    auto fut1 = std::async(std::launch::async, compute);
    
    // 延迟启动（调用 get() 时执行）
    auto fut2 = std::async(std::launch::deferred, compute);
    
    // 由实现决定（默认）
    auto fut3 = std::async(compute);
    
    std::cout << "Result 1: " << fut1.get() << std::endl;
    std::cout << "Result 2: " << fut2.get() << std::endl;
    std::cout << "Result 3: " << fut3.get() << std::endl;
    
    return 0;
}
\`\`\`

### 带参数的任务

\`\`\`cpp
#include <iostream>
#include <future>

int add(int a, int b) {
    return a + b;
}

int main() {
    std::future<int> fut = std::async(add, 10, 20);
    std::cout << "Sum: " << fut.get() << std::endl;
    return 0;
}
\`\`\`

## 5. std::shared_future

**shared_future** 允许多个线程等待同一个结果。

\`\`\`cpp
#include <iostream>
#include <future>
#include <thread>
#include <vector>

int main() {
    std::promise<int> prom;
    std::shared_future<int> sfut = prom.get_future().share();
    
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([sfut, i]() {
            int result = sfut.get();
            std::cout << "Thread " << i << " got: " << result << std::endl;
        });
    }
    
    prom.set_value(42);
    
    for (auto& t : threads) {
        t.join();
    }
    
    return 0;
}
\`\`\`

## 6. 实际应用示例

### 并行计算

\`\`\`cpp
#include <iostream>
#include <future>
#include <vector>

int sumRange(int start, int end) {
    int sum = 0;
    for (int i = start; i <= end; ++i) {
        sum += i;
    }
    return sum;
}

int main() {
    // 并行计算 1-100 的和
    auto fut1 = std::async(std::launch::async, sumRange, 1, 50);
    auto fut2 = std::async(std::launch::async, sumRange, 51, 100);
    
    int total = fut1.get() + fut2.get();
    std::cout << "Sum: " << total << std::endl;
    
    return 0;
}
\`\`\`

### 超时处理

\`\`\`cpp
#include <iostream>
#include <future>
#include <chrono>

int slowCompute() {
    std::this_thread::sleep_for(std::chrono::seconds(5));
    return 42;
}

int main() {
    std::future<int> fut = std::async(std::launch::async, slowCompute);
    
    if (fut.wait_for(std::chrono::seconds(2)) == std::future_status::timeout) {
        std::cout << "Operation timed out" << std::endl;
    } else {
        std::cout << "Result: " << fut.get() << std::endl;
    }
    
    return 0;
}
\`\`\`

## 最佳实践

### 1. 明确指定 async 启动策略

\`\`\`cpp
// 推荐：明确指定策略
auto fut1 = std::async(std::launch::async, compute);    // 强制新线程
auto fut2 = std::async(std::launch::deferred, compute); // 延迟执行

// 避免：依赖默认行为
auto fut3 = std::async(compute);  // 行为不确定！
// 某些实现可能不创建新线程
\`\`\`

### 2. 使用 shared_future 实现广播

\`\`\`cpp
// 场景：多个线程需要同一结果
std::promise<int> prom;
std::shared_future<int> sfut = prom.get_future().share();

// 多个线程可以安全地调用 get()
std::thread t1([sfut]() { std::cout << sfut.get() << std::endl; });
std::thread t2([sfut]() { std::cout << sfut.get() << std::endl; });

prom.set_value(42);
t1.join();
t2.join();
\`\`\`

### 3. 处理 future 的异常

\`\`\`cpp
std::future<int> fut = std::async([]() -> int {
    throw std::runtime_error("Task failed");
    return 42;
});

try {
    int result = fut.get();  // 异常会在此重新抛出
} catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << std::endl;
}
\`\`\`

### 4. 使用 wait_for 实现超时

\`\`\`cpp
std::future<int> fut = std::async(std::launch::async, slowTask);

while (true) {
    auto status = fut.wait_for(std::chrono::milliseconds(100));
    if (status == std::future_status::ready) {
        int result = fut.get();
        break;
    } else if (status == std::future_status::timeout) {
        std::cout << "Still waiting..." << std::endl;
        // 可以做其他工作
    }
}
\`\`\`

### 5. 避免忘记获取结果

\`\`\`cpp
// 问题：future 析构时会阻塞等待任务完成
{
    auto fut = std::async(std::launch::async, longTask);
    // 忘记调用 get() 或 wait()
}  // 析构函数会阻塞！

// 解决方案：确保处理结果
{
    auto fut = std::async(std::launch::async, longTask);
    // ... 其他工作
    fut.get();  // 或显式 wait()
}
\`\`\`

## 常见错误

### 1. 多次调用 future::get()

\`\`\`cpp
std::future<int> fut = std::async([]() { return 42; });

int result = fut.get();  // 正确
// int result2 = fut.get();  // 错误！未定义行为

// 正确：使用 shared_future
std::shared_future<int> sfut = std::async([]() { return 42; }).share();
int r1 = sfut.get();  // OK
int r2 = sfut.get();  // OK
\`\`\`

### 2. promise 重复设置值

\`\`\`cpp
std::promise<int> prom;

prom.set_value(42);
// prom.set_value(100);  // 错误！抛出 std::future_error

// 正确：检查状态
try {
    prom.set_value(42);
} catch (const std::future_error& e) {
    std::cerr << e.what() << std::endl;
}
\`\`\`

### 3. 忽略 deferred 任务的阻塞行为

\`\`\`cpp
auto fut = std::async(std::launch::deferred, []() {
    std::cout << "Running..." << std::endl;
    return 42;
});

// 问题：在 wait_for 中永远不会就绪
auto status = fut.wait_for(std::chrono::seconds(1));
// status == std::future_status::deferred，不是 timeout！

// 正确：检查 deferred 状态
if (status == std::future_status::deferred) {
    int result = fut.get();  // 此时会同步执行
}
\`\`\`

### 4. 悬空 promise

\`\`\`cpp
std::future<int> createFuture() {
    std::promise<int> prom;  // 局部变量
    std::future<int> fut = prom.get_future();
    
    std::thread t([&prom]() {
        prom.set_value(42);  // 危险！prom 可能已销毁
    });
    t.detach();
    
    return fut;  // prom 被销毁
}

// 正确：使用 shared_ptr
std::future<int> createFutureSafe() {
    auto prom = std::make_shared<std::promise<int>>();
    std::future<int> fut = prom->get_future();
    
    std::thread t([prom]() {
        prom->set_value(42);  // 安全
    });
    t.detach();
    
    return fut;
}
\`\`\`

### 5. 死锁：等待自己

\`\`\`cpp
std::future<int> fut = std::async(std::launch::async, []() {
    // 在异步任务中等待自己的 future（无法访问）
    // 这只是示例，实际中可能是间接依赖
    return 42;
});

// 如果任务内部需要主线程的结果，可能死锁
\`\`\`

## 深入理解

### 1. future 与 promise 的通信模型

\`\`\`cpp
// future-promise 是单向通道
// promise（生产者）-> future（消费者）

std::promise<int> prom;           // 创建承诺
std::future<int> fut = prom.get_future();  // 获取关联的 future

// 生产者线程
std::thread producer([&prom]() {
    // 可以设置值或异常
    prom.set_value(42);
    // 或 prom.set_exception(std::make_exception_ptr(...));
});

// 消费者线程
int result = fut.get();  // 阻塞直到值就绪

producer.join();

// 注意：promise 和 future 是可移动但不可复制的
// std::move(prom) 转移所有权
\`\`\`

### 2. packaged_task 封装可调用对象

\`\`\`cpp
#include <future>
#include <functional>

// packaged_task 将函数包装为可异步执行的任务
std::packaged_task<int(int, int)> task([](int a, int b) {
    return a + b;
});

std::future<int> fut = task.get_future();

// 可以在任何地方执行
std::thread t(std::move(task), 10, 20);
t.detach();

int result = fut.get();  // 30

// 用途：线程池、任务队列
\`\`\`

### 3. async 的实现策略

\`\`\`cpp
// std::launch::async
// - 保证在新线程中执行
// - 析构时等待线程完成
// - 适用于真正需要并行的场景

// std::launch::deferred
// - 延迟到 get()/wait() 时在当前线程执行
// - 不创建新线程
// - 适用于可能不需要执行的场景

// 默认（async | deferred）
// - 实现自行决定
// - MSVC：通常创建新线程
// - GCC/libstdc++：默认不创建新线程（类似 deferred）
// - 移植性问题：始终显式指定策略！
\`\`\`

### 4. 异常传播机制

\`\`\`cpp
// 异步任务中的异常会存储在 future 中
std::future<int> fut = std::async([]() -> int {
    throw std::runtime_error("Error in async task");
});

try {
    int result = fut.get();  // 异常在此重新抛出
} catch (const std::runtime_error& e) {
    std::cout << "Caught: " << e.what() << std::endl;
}

// promise 也可以设置异常
std::promise<int> prom;
prom.set_exception(std::make_exception_ptr(std::logic_error("Logic error")));

try {
    prom.get_future().get();
} catch (const std::logic_error& e) {
    std::cout << "Caught: " << e.what() << std::endl;
}
\`\`\`

### 5. future 的析构行为

\`\`\`cpp
// future 析构时的行为取决于关联的共享状态

// 1. 来自 async(launch::async) 的 future
//    - 析构时会阻塞等待任务完成
//    - 这是为了防止程序在任务完成前退出
{
    auto fut = std::async(std::launch::async, []() {
        std::this_thread::sleep_for(std::chrono::seconds(5));
    });
    // 析构时会等待 5 秒！
}

// 2. 来自 promise 或 packaged_task 的 future
//    - 析构时不等待
//    - 任务可能继续运行

// 3. shared_future
//    - 只是减少引用计数
//    - 最后一个 shared_future 析构时才释放共享状态
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-6-1',
                    title: '并行下载模拟',
                    code: `#include <iostream>
#include <future>
#include <vector>
#include <string>
#include <chrono>
#include <thread>

std::string downloadFile(const std::string& url) {
    std::cout << "Downloading: " << url << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    return "Content of " + url;
}

int main() {
    std::vector<std::string> urls = {
        "http://example.com/file1",
        "http://example.com/file2",
        "http://example.com/file3"
    };
    
    std::vector<std::future<std::string>> futures;
    
    // 启动所有下载任务
    for (const auto& url : urls) {
        futures.push_back(std::async(std::launch::async, downloadFile, url));
    }
    
    // 收集结果
    for (size_t i = 0; i < futures.size(); ++i) {
        std::string content = futures[i].get();
        std::cout << "Received: " << content << std::endl;
    }
    
    std::cout << "All downloads completed!" << std::endl;
    return 0;
}`,
                    output: `Downloading: http://example.com/file1
Downloading: http://example.com/file2
Downloading: http://example.com/file3
Received: Content of http://example.com/file1
Received: Content of http://example.com/file2
Received: Content of http://example.com/file3
All downloads completed!`
                },
                {
                    id: 'example-21-6-2',
                    title: '任务队列',
                    code: `#include <iostream>
#include <future>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <functional>

class TaskQueue {
private:
    std::queue<std::packaged_task<int()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
    bool stop = false;
    
public:
    void addTask(std::function<int()> task) {
        std::packaged_task<int()> packagedTask(task);
        {
            std::lock_guard<std::mutex> lock(mtx);
            tasks.push(std::move(packagedTask));
        }
        cv.notify_one();
    }
    
    void stopProcessing() {
        {
            std::lock_guard<std::mutex> lock(mtx);
            stop = true;
        }
        cv.notify_all();
    }
    
    void processTasks() {
        while (true) {
            std::packaged_task<int()> task;
            {
                std::unique_lock<std::mutex> lock(mtx);
                cv.wait(lock, [this]() { return !tasks.empty() || stop; });
                
                if (stop && tasks.empty()) return;
                
                task = std::move(tasks.front());
                tasks.pop();
            }
            task();
        }
    }
};

int main() {
    TaskQueue queue;
    
    std::thread worker([&queue]() {
        queue.processTasks();
    });
    
    std::vector<std::future<int>> futures;
    
    for (int i = 0; i < 5; ++i) {
        auto fut = queue.addTask([i]() {
            return i * i;
        });
        // 需要返回 future，这里简化处理
    }
    
    queue.stopProcessing();
    worker.join();
    
    return 0;
}`,
                    output: `Task completed`
                }
            ],
            handsOn: {
                title: '实现并行求和',
                description: '使用 std::async 实现并行计算数组元素的和。',
                initialCode: `#include <iostream>
#include <future>
#include <vector>
#include <numeric>

// 计算部分和
int partialSum(const std::vector<int>& data, size_t start, size_t end) {
    // TODO: 计算 data[start] 到 data[end-1] 的和
    return 0;
}

// 并行求和
int parallelSum(const std::vector<int>& data, size_t numThreads) {
    // TODO: 将数据分成 numThreads 份
    // TODO: 使用 std::async 并行计算每份的和
    // TODO: 汇总结果
    return 0;
}

int main() {
    std::vector<int> data(10000);
    for (size_t i = 0; i < data.size(); ++i) {
        data[i] = i + 1;
    }
    
    // 串行求和
    int serialSum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Serial sum: " << serialSum << std::endl;
    
    // 并行求和
    int parallelResult = parallelSum(data, 4);
    std::cout << "Parallel sum: " << parallelResult << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <future>
#include <vector>
#include <numeric>

int partialSum(const std::vector<int>& data, size_t start, size_t end) {
    int sum = 0;
    for (size_t i = start; i < end; ++i) {
        sum += data[i];
    }
    return sum;
}

int parallelSum(const std::vector<int>& data, size_t numThreads) {
    std::vector<std::future<int>> futures;
    size_t chunkSize = data.size() / numThreads;
    
    for (size_t i = 0; i < numThreads; ++i) {
        size_t start = i * chunkSize;
        size_t end = (i == numThreads - 1) ? data.size() : start + chunkSize;
        futures.push_back(std::async(std::launch::async, partialSum, 
                                     std::cref(data), start, end));
    }
    
    int total = 0;
    for (auto& fut : futures) {
        total += fut.get();
    }
    
    return total;
}

int main() {
    std::vector<int> data(10000);
    for (size_t i = 0; i < data.size(); ++i) {
        data[i] = i + 1;
    }
    
    int serialSum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Serial sum: " << serialSum << std::endl;
    
    int parallelResult = parallelSum(data, 4);
    std::cout << "Parallel sum: " << parallelResult << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::future 的 get() 方法可以被调用几次？',
                    options: [
                        '无限次',
                        '2次',
                        '1次',
                        '取决于任务类型'
                    ],
                    correctAnswer: 2,
                    explanation: 'std::future::get() 只能调用一次，调用后 future 变为无效状态。如需多次获取，使用 shared_future。'
                },
                {
                    question: 'std::async(std::launch::deferred, func) 什么时候执行任务？',
                    options: [
                        '立即在新线程中执行',
                        '在调用 get() 或 wait() 时在当前线程执行',
                        '在程序结束时执行',
                        '永远不会执行'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::launch::deferred 表示延迟执行，任务会在调用 get() 或 wait() 时在当前线程同步执行。'
                },
                {
                    question: 'std::promise 的主要作用是？',
                    options: [
                        '启动异步任务',
                        '设置异步任务的结果或异常',
                        '等待异步任务完成',
                        '取消异步任务'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::promise 用于设置异步任务的结果（set_value）或异常（set_exception），然后通过关联的 future 获取。'
                },
                {
                    question: 'std::shared_future 与 std::future 的主要区别是？',
                    options: [
                        'shared_future 性能更好',
                        'shared_future 可以被多次调用 get()',
                        'shared_future 不支持异常',
                        'shared_future 只能用于只读数据'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::shared_future 允许多个线程共享同一个异步结果，可以多次调用 get()。'
                },
                {
                    question: '以下代码的输出是什么？\nauto fut = std::async(std::launch::async, []{ return 42; });\nfut.wait();\nstd::cout << fut.get();',
                    options: [
                        '编译错误',
                        '运行时错误',
                        '42',
                        '未定义行为'
                    ],
                    correctAnswer: 2,
                    explanation: 'wait() 只是等待任务完成，不会消耗结果。之后可以调用 get() 获取结果。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - std::future',
                    url: 'https://en.cppreference.com/w/cpp/thread/future'
                },
                {
                    title: 'C++ Reference - std::async',
                    url: 'https://en.cppreference.com/w/cpp/thread/async'
                }
            ],
            assistantTips: '💡 学习提示：\n1. future 的 get() 只能调用一次，需要多次获取用 shared_future\n2. 理解 async 的两种启动策略：async 和 deferred\n3. promise 用于手动设置结果，适用于复杂场景\n4. 异步编程适合 I/O 密集型和可并行的计算任务'
        },
        {
            id: '21.7',
            title: '线程本地存储（thread_local）',
            concepts: `
# 线程本地存储（thread_local）

## 1. 线程本地存储概述

**线程本地存储（Thread Local Storage, TLS）** 使每个线程拥有变量的独立副本，互不干扰。

### 为什么需要线程本地存储？

\`\`\`cpp
// 全局变量：所有线程共享
int globalCounter = 0;

// 线程本地变量：每个线程独立
thread_local int localCounter = 0;
\`\`\`

## 2. thread_local 关键字

### 基本使用

\`\`\`cpp
#include <iostream>
#include <thread>

thread_local int counter = 0;

void increment(const std::string& name) {
    for (int i = 0; i < 5; ++i) {
        counter++;
        std::cout << name << ": " << counter << std::endl;
    }
}

int main() {
    std::thread t1(increment, "Thread 1");
    std::thread t2(increment, "Thread 2");
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

输出：
\`\`\`
Thread 1: 1
Thread 1: 2
Thread 1: 3
Thread 1: 4
Thread 1: 5
Thread 2: 1
Thread 2: 2
Thread 2: 3
Thread 2: 4
Thread 2: 5
\`\`\`

## 3. thread_local 的作用域

### 全局作用域

\`\`\`cpp
#include <iostream>
#include <thread>

thread_local int globalTLS = 100;

void printTLS() {
    std::cout << "Value: " << globalTLS << std::endl;
}

int main() {
    globalTLS = 200;  // 只影响主线程
    
    std::thread t([]() {
        std::cout << "Thread: " << globalTLS << std::endl;  // 输出 100
    });
    
    t.join();
    
    std::cout << "Main: " << globalTLS << std::endl;  // 输出 200
    
    return 0;
}
\`\`\`

### 函数作用域

\`\`\`cpp
#include <iostream>
#include <thread>

void func() {
    thread_local int count = 0;  // 每个线程独立
    count++;
    std::cout << "Count: " << count << std::endl;
}

int main() {
    std::thread t1([]() {
        func();
        func();
        func();
    });
    
    std::thread t2([]() {
        func();
        func();
    });
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

输出：
\`\`\`
Count: 1  (t1)
Count: 2  (t1)
Count: 3  (t1)
Count: 1  (t2)
Count: 2  (t2)
\`\`\`

### 类成员变量

\`\`\`cpp
#include <iostream>
#include <thread>

class ThreadSafeCounter {
    static thread_local int counter;  // 静态线程本地成员
    
public:
    void increment() {
        counter++;
        std::cout << "Counter: " << counter << std::endl;
    }
};

// 定义静态成员
thread_local int ThreadSafeCounter::counter = 0;

int main() {
    ThreadSafeCounter c1, c2;
    
    std::thread t1([&c1]() {
        c1.increment();
        c1.increment();
    });
    
    std::thread t2([&c2]() {
        c2.increment();
    });
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

## 4. 应用场景

### 线程安全的随机数生成器

\`\`\`cpp
#include <iostream>
#include <thread>
#include <random>

thread_local std::mt19937 generator(std::random_device{}());

int getRandomNumber() {
    std::uniform_int_distribution<int> dist(1, 100);
    return dist(generator);
}

int main() {
    std::thread t1([]() {
        for (int i = 0; i < 3; ++i) {
            std::cout << "Thread 1: " << getRandomNumber() << std::endl;
        }
    });
    
    std::thread t2([]() {
        for (int i = 0; i < 3; ++i) {
            std::cout << "Thread 2: " << getRandomNumber() << std::endl;
        }
    });
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

### 线程安全的日志

\`\`\`cpp
#include <iostream>
#include <thread>
#include <sstream>

thread_local std::stringstream logBuffer;

void addToLog(const std::string& message) {
    logBuffer << message << " ";
}

void flushLog() {
    std::cout << "Thread " << std::this_thread::get_id() 
              << ": " << logBuffer.str() << std::endl;
    logBuffer.str("");
}

int main() {
    std::thread t1([]() {
        addToLog("Hello");
        addToLog("World");
        flushLog();
    });
    
    std::thread t2([]() {
        addToLog("C++");
        addToLog("Threading");
        flushLog();
    });
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

### 连接池

\`\`\`cpp
#include <iostream>
#include <thread>
#include <memory>

class Connection {
public:
    Connection() {
        std::cout << "Connection created" << std::endl;
    }
    
    ~Connection() {
        std::cout << "Connection destroyed" << std::endl;
    }
    
    void query(const std::string& sql) {
        std::cout << "Executing: " << sql << std::endl;
    }
};

thread_local std::unique_ptr<Connection> connection;

Connection& getConnection() {
    if (!connection) {
        connection = std::make_unique<Connection>();
    }
    return *connection;
}

int main() {
    std::thread t1([]() {
        getConnection().query("SELECT * FROM table1");
        getConnection().query("SELECT * FROM table2");
    });
    
    std::thread t2([]() {
        getConnection().query("SELECT * FROM table3");
    });
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

## 5. 生命周期

线程本地变量的生命周期：
- **创建**：线程开始时
- **销毁**：线程结束时

\`\`\`cpp
#include <iostream>
#include <thread>

struct Logger {
    Logger() { std::cout << "Logger created" << std::endl; }
    ~Logger() { std::cout << "Logger destroyed" << std::endl; }
};

thread_local Logger logger;

int main() {
    std::cout << "Main thread start" << std::endl;
    
    std::thread t([]() {
        std::cout << "Worker thread start" << std::endl;
        // logger 在此处创建
        std::cout << "Worker thread end" << std::endl;
        // logger 在此处销毁
    });
    
    t.join();
    
    std::cout << "Main thread end" << std::endl;
    return 0;
}
\`\`\`

## 6. 注意事项

1. **初始化顺序**：thread_local 变量的初始化顺序可能不确定
2. **性能开销**：访问 thread_local 变量比普通变量稍慢
3. **内存占用**：每个线程都有独立副本，注意内存使用

## 最佳实践

### 1. 使用 thread_local 避免锁竞争

\`\`\`cpp
// 问题：全局随机数生成器需要锁
std::mt19937 globalGen;
std::mutex genMutex;

int getRandom() {
    std::lock_guard<std::mutex> lock(genMutex);
    return globalGen();
}

// 解决方案：使用 thread_local
thread_local std::mt19937 localGen(std::random_device{}());

int getRandomFast() {
    return localGen();  // 无锁，高性能
}
\`\`\`

### 2. 线程本地资源管理

\`\`\`cpp
// 数据库连接池：每个线程一个连接
class ConnectionPool {
    thread_local static std::unique_ptr<Connection> conn;
    
public:
    static Connection& get() {
        if (!conn) {
            conn = std::make_unique<Connection>();
        }
        return *conn;
    }
};

// 使用时无需担心线程安全
void processData() {
    auto& conn = ConnectionPool::get();
    conn.query("SELECT ...");
}
\`\`\`

### 3. 函数内 thread_local 实现延迟初始化

\`\`\`cpp
// 推荐：函数内 thread_local
Logger& getLogger() {
    thread_local Logger instance;  // 每个线程首次调用时初始化
    return instance;
}

// 避免：全局 thread_local 可能初始化顺序问题
thread_local Logger globalLogger;  // 初始化顺序不确定
\`\`\`

### 4. 使用 thread_local 实现线程安全单例

\`\`\`cpp
// 每个线程独立的单例
class ThreadLocalSingleton {
    thread_local static ThreadLocalSingleton* instance;
    
public:
    static ThreadLocalSingleton& get() {
        if (!instance) {
            instance = new ThreadLocalSingleton();
        }
        return *instance;
    }
};

thread_local ThreadLocalSingleton* ThreadLocalSingleton::instance = nullptr;
\`\`\`

## 常见错误

### 1. 误解 thread_local 的作用域

\`\`\`cpp
class MyClass {
    thread_local static int x;  // 必须是静态的
};

// 错误：非静态成员不能是 thread_local
class Error {
    thread_local int x;  // 编译错误！
};

// 正确：使用静态成员
class Correct {
    static thread_local int x;
};
thread_local int Correct::x = 0;
\`\`\`

### 2. 悬空 thread_local 指针

\`\`\`cpp
// 危险：返回线程本地变量的指针
int* getThreadLocalPtr() {
    thread_local int value = 0;
    return &value;  // 如果在其他线程使用，指向不同的内存！
}

// 错误用法
int* p = getThreadLocalPtr();
std::thread t([p]() {
    *p = 42;  // 修改的是主线程的副本，不是当前线程的！
});
\`\`\`

### 3. 忘记 thread_local 的初始化

\`\`\`cpp
// 问题：依赖默认初始化
thread_local std::vector<int> data;  // 每个线程都是空 vector

// 如果期望非空初始状态
thread_local std::vector<int> data = {1, 2, 3};  // 正确

// 或使用函数初始化
std::vector<int> initVector() { return {1, 2, 3}; }
thread_local std::vector<int> data = initVector();
\`\`\`

### 4. 线程池中的 thread_local 状态残留

\`\`\`cpp
// 问题：线程池中 thread_local 状态不会自动重置
thread_local int requestCount = 0;

void handleRequest() {
    requestCount++;  // 每次请求递增
    // 但线程池中的线程会保留上次的值！
}

// 解决方案：显式重置
void handleRequestFixed() {
    thread_local int requestCount = 0;
    requestCount = 0;  // 每次开始时重置
    requestCount++;
}
\`\`\`

### 5. 动态加载库中的 thread_local

\`\`\`cpp
// 动态库中的 thread_local 可能在卸载时出问题
// DLL/SO 中的 thread_local 变量：
// - 加载时创建
// - 卸载时销毁
// 如果线程仍在运行，可能导致崩溃

// 建议：避免在动态加载库中使用复杂的 thread_local 对象
\`\`\`

## 深入理解

### 1. thread_local 的存储位置

\`\`\`cpp
// thread_local 变量存储在线程本地存储区（TLS）
// 每个线程有独立的 TLS 段

// 访问方式：
// 1. 通过 TLS 索引间接访问
// 2. 编译器生成特殊代码：fs/gs 段寄存器（x86-64）

// 性能对比：
int globalVar = 0;
thread_local int tlsVar = 0;

// globalVar：直接内存访问，1 条指令
// tlsVar：TLS 查找，2-3 条指令（略有开销）
\`\`\`

### 2. 初始化时机详解

\`\`\`cpp
// thread_local 变量的初始化时机：

// 1. 全局/命名空间作用域
thread_local int x = init();  // 线程启动时（首次使用前）

// 2. 函数作用域
void func() {
    thread_local int y = init();  // 首次执行到此行时
}

// 3. 类静态成员
class MyClass {
    static thread_local int z;  // 线程启动时
};

// 注意：动态初始化顺序可能不确定
// 避免在 thread_local 初始化中依赖其他 thread_local
\`\`\`

### 3. 与其他存储类说明符的组合

\`\`\`cpp
// thread_local 可以与 static/extern 组合

// 内部链接的线程本地变量
static thread_local int internalTLS = 0;

// 外部链接的线程本地变量
extern thread_local int externalTLS;

// 函数内的静态线程本地变量
void func() {
    static thread_local int count = 0;  // 静态存储期 + 线程本地
    // 生命周期：线程开始到结束
    // 作用域：函数内
}
\`\`\`

### 4. 析构顺序

\`\`\`cpp
// thread_local 对象的析构顺序：

struct A { ~A() { std::cout << "A destroyed\\n"; } };
struct B { ~B() { std::cout << "B destroyed\\n"; } };

thread_local A a;
thread_local B b;

// 析构顺序与构造顺序相反
// 但跨编译单元的顺序未定义！

// 建议：避免 thread_local 对象之间的依赖
\`\`\`

### 5. 跨平台实现差异

\`\`\`cpp
// Windows：使用 __declspec(thread) 或 thread_local
// Linux：使用 __thread 或 thread_local
// macOS：使用 thread_local

// C++11 thread_local 是跨平台标准

// 注意事项：
// 1. Windows DLL 中的 thread_local 需要特殊处理
// 2. 某些旧编译器可能不完全支持
// 3. 动态初始化的支持程度不同

// 检查编译器支持
#if __cplusplus >= 201103L
    #define TLS thread_local
#else
    #ifdef _MSC_VER
        #define TLS __declspec(thread)
    #else
        #define TLS __thread
    #endif
#endif
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-7-1',
                    title: '线程安全的累加器',
                    code: `#include <iostream>
#include <thread>
#include <vector>

class ThreadAccumulator {
private:
    thread_local static int sum;
    
public:
    void add(int value) {
        sum += value;
    }
    
    int getSum() const {
        return sum;
    }
};

thread_local int ThreadAccumulator::sum = 0;

int main() {
    std::vector<std::thread> threads;
    std::vector<int> results(5);
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&results, i]() {
            ThreadAccumulator acc;
            for (int j = 0; j < 10; ++j) {
                acc.add(j);
            }
            results[i] = acc.getSum();
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    for (int i = 0; i < 5; ++i) {
        std::cout << "Thread " << i << " sum: " << results[i] << std::endl;
    }
    
    return 0;
}`,
                    output: `Thread 0 sum: 45
Thread 1 sum: 45
Thread 2 sum: 45
Thread 3 sum: 45
Thread 4 sum: 45`
                },
                {
                    id: 'example-21-7-2',
                    title: '线程本地缓存',
                    code: `#include <iostream>
#include <thread>
#include <map>
#include <string>

thread_local std::map<std::string, int> cache;

int expensiveComputation(const std::string& key) {
    // 检查缓存
    auto it = cache.find(key);
    if (it != cache.end()) {
        std::cout << "Cache hit for " << key << std::endl;
        return it->second;
    }
    
    // 模拟耗时计算
    std::cout << "Computing for " << key << std::endl;
    int result = key.length() * 100;
    
    // 存入缓存
    cache[key] = result;
    return result;
}

int main() {
    std::thread t1([]() {
        std::cout << "Thread 1:" << std::endl;
        expensiveComputation("hello");
        expensiveComputation("world");
        expensiveComputation("hello");  // 缓存命中
    });
    
    std::thread t2([]() {
        std::cout << "Thread 2:" << std::endl;
        expensiveComputation("hello");  // 不同线程，重新计算
        expensiveComputation("cpp");
    });
    
    t1.join();
    t2.join();
    
    return 0;
}`,
                    output: `Thread 1:
Computing for hello
Computing for world
Cache hit for hello
Thread 2:
Computing for hello
Computing for cpp`
                }
            ],
            handsOn: {
                title: '实现线程本地计数器',
                description: '实现一个线程本地计数器类，每个线程维护独立的计数，并提供全局统计功能。',
                initialCode: `#include <iostream>
#include <thread>
#include <vector>
#include <mutex>
#include <atomic>

class ThreadLocalCounter {
private:
    // TODO: 定义线程本地计数变量
    // thread_local static int localCount;
    
    // TODO: 定义全局统计变量
    // static std::atomic<int> totalCount;
    // static std::mutex printMutex;
    
public:
    // TODO: 增加计数
    void increment() {
        // 增加 localCount
        // 增加 totalCount
    }
    
    // TODO: 获取本地计数
    int getLocalCount() const {
        return 0;
    }
    
    // TODO: 获取总计数
    static int getTotalCount() {
        return 0;
    }
    
    // TODO: 线程安全打印
    void print(const std::string& message) {
        // 使用 printMutex 保护输出
    }
};

// TODO: 初始化静态成员

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([i]() {
            ThreadLocalCounter counter;
            for (int j = 0; j < 10; ++j) {
                counter.increment();
            }
            counter.print("Thread " + std::to_string(i) + 
                         " local count: " + std::to_string(counter.getLocalCount()));
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Total count: " << ThreadLocalCounter::getTotalCount() << std::endl;
    return 0;
}`,
                solution: `#include <iostream>
#include <thread>
#include <vector>
#include <mutex>
#include <atomic>

class ThreadLocalCounter {
private:
    thread_local static int localCount;
    static std::atomic<int> totalCount;
    static std::mutex printMutex;
    
public:
    void increment() {
        localCount++;
        totalCount++;
    }
    
    int getLocalCount() const {
        return localCount;
    }
    
    static int getTotalCount() {
        return totalCount;
    }
    
    void print(const std::string& message) {
        std::lock_guard<std::mutex> lock(printMutex);
        std::cout << message << std::endl;
    }
};

thread_local int ThreadLocalCounter::localCount = 0;
std::atomic<int> ThreadLocalCounter::totalCount{0};
std::mutex ThreadLocalCounter::printMutex;

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([i]() {
            ThreadLocalCounter counter;
            for (int j = 0; j < 10; ++j) {
                counter.increment();
            }
            counter.print("Thread " + std::to_string(i) + 
                         " local count: " + std::to_string(counter.getLocalCount()));
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Total count: " << ThreadLocalCounter::getTotalCount() << std::endl;
    return 0;
}`
            },
            quiz: [
                {
                    question: 'thread_local 变量的生命周期是？',
                    options: [
                        '程序开始到结束',
                        '线程开始到结束',
                        '变量定义到作用域结束',
                        '手动创建到手动销毁'
                    ],
                    correctAnswer: 1,
                    explanation: 'thread_local 变量在线程开始时创建，线程结束时销毁，每个线程有独立的副本。'
                },
                {
                    question: '以下哪种声明是正确的？',
                    options: [
                        'thread_local static int x;',
                        'static thread_local int x;',
                        'int thread_local x;',
                        'A 和 B 都正确'
                    ],
                    correctAnswer: 3,
                    explanation: 'thread_local 和 static 可以以任意顺序组合，都表示线程本地存储的静态变量。'
                },
                {
                    question: 'thread_local 变量适用于以下哪种场景？',
                    options: [
                        '线程间共享数据',
                        '每个线程需要独立的状态',
                        '需要高性能的共享变量',
                        '全局配置信息'
                    ],
                    correctAnswer: 1,
                    explanation: 'thread_local 适用于每个线程需要独立状态的场景，如随机数生成器、日志缓冲区等。'
                },
                {
                    question: '以下代码的输出是什么？\nthread_local int x = 0;\nvoid func() { x++; std::cout << x; }\nint main() {\n  std::thread t(func); t.join();\n  std::thread t2(func); t2.join();\n}',
                    options: [
                        '11',
                        '12',
                        '21',
                        '22'
                    ],
                    correctAnswer: 0,
                    explanation: '每个线程有独立的 x 副本，初始都是 0，所以两个线程都输出 1。'
                },
                {
                    question: 'thread_local 变量的主要缺点是？',
                    options: [
                        '不能用于类成员',
                        '访问速度比普通变量慢',
                        '不支持自定义类型',
                        '必须手动初始化'
                    ],
                    correctAnswer: 1,
                    explanation: '访问 thread_local 变量需要额外的间接寻址，性能略低于普通变量，但换来线程安全。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - thread_local storage',
                    url: 'https://en.cppreference.com/w/cpp/language/storage_duration'
                },
                {
                    title: 'Thread-Local Storage',
                    url: 'https://en.wikipedia.org/wiki/Thread-local_storage'
                }
            ],
            assistantTips: '💡 学习提示：\n1. thread_local 变量每个线程独立，无需同步\n2. 适用于随机数生成器、日志、缓存等场景\n3. 注意生命周期：线程开始创建，线程结束销毁\n4. 访问性能略低于普通变量，但避免了锁的开销'
        },
        {
            id: '21.8',
            title: '内存模型与内存序简介',
            concepts: `
# 内存模型与内存序简介

## 1. 内存模型概述

**内存模型**定义了多线程程序中内存访问的行为和可见性规则。

### 为什么需要内存模型？

\`\`\`cpp
// 线程 1
x = 1;
ready = true;

// 线程 2
while (!ready);
print(x);  // 可能输出 0 或 1
\`\`\`

由于编译器优化和 CPU 重排序，代码执行顺序可能与书写顺序不同。

## 2. 内存序（Memory Order）

C++11 定义了 6 种内存序：

\`\`\`cpp
namespace std {
    enum memory_order {
        memory_order_relaxed,   // 宽松序
        memory_order_consume,   // 消费序（C++17 起不推荐）
        memory_order_acquire,   // 获取序
        memory_order_release,   // 释放序
        memory_order_acq_rel,   // 获取-释放序
        memory_order_seq_cst    // 顺序一致序（默认）
    };
}
\`\`\`

## 3. memory_order_seq_cst（顺序一致序）

**默认的内存序**，提供最强的保证。

\`\`\`cpp
#include <iostream>
#include <atomic>
#include <thread>

std::atomic<bool> ready{false};
std::atomic<int> data{0};

void producer() {
    data.store(42, std::memory_order_seq_cst);
    ready.store(true, std::memory_order_seq_cst);
}

void consumer() {
    while (!ready.load(std::memory_order_seq_cst));
    std::cout << "Data: " << data.load(std::memory_order_seq_cst) << std::endl;
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

### 特点
- 所有线程看到相同的操作顺序
- 最直观，但性能开销最大
- 默认选项，除非有性能需求

## 4. memory_order_acquire 和 memory_order_release

**获取-释放序**：一对同步操作。

\`\`\`cpp
#include <iostream>
#include <atomic>
#include <thread>

std::atomic<bool> ready{false};
int data = 0;

void producer() {
    data = 42;
    ready.store(true, std::memory_order_release);  // 释放
}

void consumer() {
    while (!ready.load(std::memory_order_acquire));  // 获取
    std::cout << "Data: " << data << std::endl;  // 保证看到 42
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);
    
    t1.join();
    t2.join();
    
    return 0;
}
\`\`\`

### 规则
- **release**：之前的写操作对其他线程可见
- **acquire**：之后的读操作能看到 release 前的写操作

## 5. memory_order_relaxed（宽松序）

**最弱的内存序**，只保证原子性，不保证顺序。

\`\`\`cpp
#include <iostream>
#include <atomic>
#include <thread>
#include <vector>

std::atomic<int> counter{0};

void increment() {
    for (int i = 0; i < 1000; ++i) {
        counter.fetch_add(1, std::memory_order_relaxed);
    }
}

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Counter: " << counter << std::endl;
    return 0;
}
\`\`\`

### 适用场景
- 简单计数器
- 不需要同步其他数据
- 性能敏感场景

## 6. 自旋锁示例

\`\`\`cpp
#include <iostream>
#include <atomic>
#include <thread>

class SpinLock {
private:
    std::atomic_flag flag = ATOMIC_FLAG_INIT;
    
public:
    void lock() {
        while (flag.test_and_set(std::memory_order_acquire)) {
            // 自旋等待
        }
    }
    
    void unlock() {
        flag.clear(std::memory_order_release);
    }
};

SpinLock spinlock;
int counter = 0;

void increment() {
    for (int i = 0; i < 1000; ++i) {
        spinlock.lock();
        counter++;
        spinlock.unlock();
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    
    t1.join();
    t2.join();
    
    std::cout << "Counter: " << counter << std::endl;
    return 0;
}
\`\`\`

## 7. 内存序选择指南

| 内存序 | 保证 | 性能 | 使用场景 |
|--------|------|------|----------|
| seq_cst | 最强 | 最慢 | 默认选择，简单场景 |
| acquire/release | 中等 | 中等 | 生产者-消费者 |
| relaxed | 最弱 | 最快 | 简单计数器 |

## 8. happens-before 关系

**happens-before** 定义了操作之间的可见性关系。

\`\`\`cpp
// 线程 1
data = 42;                    // A
ready.store(true, release);   // B

// 线程 2
while (!ready.load(acquire)); // C
print(data);                  // D

// A happens-before B
// B synchronizes-with C
// C happens-before D
// 因此 A happens-before D，D 保证看到 A 的效果
\`\`\`

## 9. 常见陷阱

### 双重检查锁定

\`\`\`cpp
// 错误实现
if (!initialized) {
    std::lock_guard<std::mutex> lock(mtx);
    if (!initialized) {
        initialize();
        initialized = true;  // 可能被重排序
    }
}

// 正确实现
if (!initialized.load(std::memory_order_acquire)) {
    std::lock_guard<std::mutex> lock(mtx);
    if (!initialized.load(std::memory_order_relaxed)) {
        initialize();
        initialized.store(true, std::memory_order_release);
    }
}
\`\`\`

## 最佳实践

### 1. 默认使用 memory_order_seq_cst

\`\`\`cpp
// 推荐：简单场景使用默认序
std::atomic<int> counter(0);
counter++;  // 默认 seq_cst，安全且直观

// 只有在性能瓶颈时才考虑优化
// 优化前先测量！
\`\`\`

### 2. 正确配对 acquire/release

\`\`\`cpp
// 生产者：使用 release
void publish(int value) {
    data = value;
    ready.store(true, std::memory_order_release);  // 释放
}

// 消费者：使用 acquire
int consume() {
    while (!ready.load(std::memory_order_acquire));  // 获取
    return data;  // 保证看到发布的值
}

// 错误：不匹配的配对
// ready.store(true, std::memory_order_release);
// while (!ready.load(std::memory_order_relaxed));  // 危险！
\`\`\`

### 3. 使用 fence 建立同步

\`\`\`cpp
#include <atomic>

std::atomic<bool> ready{false};
int data = 0;

void producer() {
    data = 42;
    std::atomic_thread_fence(std::memory_order_release);
    ready.store(true, std::memory_order_relaxed);
}

void consumer() {
    while (!ready.load(std::memory_order_relaxed));
    std::atomic_thread_fence(std::memory_order_acquire);
    // 保证看到 data = 42
}
\`\`\`

### 4. relaxed 用于独立计数

\`\`\`cpp
// 场景：统计信息，不需要精确同步
std::atomic<int> requestCount{0};
std::atomic<int> errorCount{0};

void handleRequest() {
    requestCount.fetch_add(1, std::memory_order_relaxed);
    // ... 处理请求
}

// 场景：性能监控
std::atomic<uint64_t> bytesProcessed{0};

void processData(const char* data, size_t len) {
    // ... 处理数据
    bytesProcessed.fetch_add(len, std::memory_order_relaxed);
}
\`\`\`

## 常见错误

### 1. 误用 relaxed 导致数据竞争

\`\`\`cpp
// 错误：需要同步但使用 relaxed
std::atomic<bool> ready{false};
int data = 0;

void producer() {
    data = 42;
    ready.store(true, std::memory_order_relaxed);  // 危险！
}

void consumer() {
    while (!ready.load(std::memory_order_relaxed));
    std::cout << data;  // 可能输出 0！
}

// 正确：使用 release/acquire
void producer() {
    data = 42;
    ready.store(true, std::memory_order_release);
}

void consumer() {
    while (!ready.load(std::memory_order_acquire));
    std::cout << data;  // 保证输出 42
}
\`\`\`

### 2. 混淆 synchronizes-with 和 happens-before

\`\`\`cpp
// synchronizes-with：原子操作之间的同步
// release 操作 synchronizes-with 对应的 acquire 操作

// happens-before：更广泛的关系
// 包括 sequenced-before（同一线程内的顺序）
// 和 synchronizes-with（跨线程同步）

// 示例：
// 线程1: A -> B (release)
// 线程2: C (acquire) -> D
// 如果 B synchronizes-with C
// 则 A happens-before D

// 错误理解：
// 认为 relaxed 操作可以建立 synchronizes-with 关系
// relaxed 不建立任何同步关系！
\`\`\`

### 3. 忽略编译器重排

\`\`\`cpp
// 即使使用原子操作，非原子操作仍可能被重排
std::atomic<bool> flag{false};
int x = 0, y = 0;

// 线程1
x = 1;
y = 2;
flag.store(true, std::memory_order_release);

// 线程2
if (flag.load(std::memory_order_acquire)) {
    // 可能看到 x=1, y=0 或 x=0, y=2
    // 因为 x 和 y 的写入可能被重排！
}

// 解决方案：确保相关操作在 release 之前完成
// 或使用更强的内存序
\`\`\`

### 4. 错误的双重检查锁定

\`\`\`cpp
// 经典错误
class Singleton {
    static Singleton* instance;
public:
    static Singleton* get() {
        if (!instance) {  // 第一次检查：非原子！
            std::lock_guard<std::mutex> lock(mtx);
            if (!instance) {
                instance = new Singleton();  // 可能被重排
            }
        }
        return instance;
    }
};

// 正确：使用原子操作
class Singleton {
    static std::atomic<Singleton*> instance;
public:
    static Singleton* get() {
        auto* p = instance.load(std::memory_order_acquire);
        if (!p) {
            std::lock_guard<std::mutex> lock(mtx);
            p = instance.load(std::memory_order_relaxed);
            if (!p) {
                p = new Singleton();
                instance.store(p, std::memory_order_release);
            }
        }
        return p;
    }
};
\`\`\`

### 5. 过度优化内存序

\`\`\`cpp
// 错误：过早优化
std::atomic<int> counter{0};
counter.fetch_add(1, std::memory_order_relaxed);  // 真的需要吗？

// 建议：
// 1. 先用默认 seq_cst 写正确代码
// 2. 测量性能，找到瓶颈
// 3. 只优化真正的瓶颈

// 大多数情况下，seq_cst 性能已经足够好
// 过早优化是万恶之源
\`\`\`

## 深入理解

### 1. 内存序与硬件内存屏障

\`\`\`cpp
// x86 架构（强内存模型）
// - 大多数操作隐含 acquire/release 语义
// - seq_cst 只需要少量额外屏障
// - relaxed 和 seq_cst 性能差异较小

// ARM 架构（弱内存模型）
// - 需要显式内存屏障
// - relaxed 性能优势明显
// - seq_cst 需要完整的屏障指令

// 示例：release 操作的汇编
// x86: 无需额外指令（store 已有 release 语义）
// ARM: dmb ish（数据内存屏障）

// 这就是为什么跨平台代码需要谨慎选择内存序
\`\`\`

### 2. 顺序一致性的代价

\`\`\`cpp
// seq_cst 的实现通常需要：
// 1. 禁止编译器重排
// 2. 插入 CPU 内存屏障
// 3. 可能导致缓存同步开销

// 示例：seq_cst store
std::atomic<int> x, y;
x.store(1, std::memory_order_seq_cst);
y.store(2, std::memory_order_seq_cst);

// 编译器必须保证所有线程看到相同的 x 和 y 的修改顺序
// 这可能需要昂贵的全局同步操作
\`\`\`

### 3. consume 的历史与现状

\`\`\`cpp
// memory_order_consume 的设计初衷：
// - 只同步有数据依赖的操作
// - 比 acquire 更轻量

// 问题：
// - 编译器实现困难
// - C++17 将其弱化为 consume 没有任何同步效果
// - 实践中建议使用 acquire 替代

// 原始意图示例（现在不推荐）
std::atomic<int*> ptr;
int* p = ptr.load(std::memory_order_consume);
int x = *p;  // 只有这个依赖操作受保护

// 现在推荐
int* p = ptr.load(std::memory_order_acquire);
int x = *p;  // 所有后续操作都受保护
\`\`\`

### 4. 修改顺序与一致性

\`\`\`cpp
// 修改顺序（modification order）：
// 每个原子变量有一个全局的修改顺序
// 所有线程对同一变量的修改按此顺序排列

std::atomic<int> x{0};

// 线程1: x.store(1);
// 线程2: x.store(2);
// 线程3: x.store(3);

// 修改顺序可能是 0->1->2->3 或 0->2->1->3 等
// 但所有线程看到的顺序相同（对于 seq_cst）

// 写-写一致性
x.store(1);
x.store(2);  // 任何线程看到 2 必定也看到过 1

// 读-读一致性
int a = x.load();  // 读到 2
int b = x.load();  // 必定读到 2 或更新的值
\`\`\`

### 5. 实践中的性能影响

\`\`\`cpp
// 性能测试示例
#include <chrono>
#include <atomic>

std::atomic<int> counter{0};

// 测试 seq_cst
auto start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 10000000; ++i) {
    counter.fetch_add(1, std::memory_order_seq_cst);
}
auto end = std::chrono::high_resolution_clock::now();

// 测试 relaxed
counter = 0;
start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 10000000; ++i) {
    counter.fetch_add(1, std::memory_order_relaxed);
}
end = std::chrono::high_resolution_clock::now();

// 结果（因平台而异）：
// x86: 差异约 5-10%
// ARM: 差异可达 2-3 倍

// 结论：
// 1. 测量实际性能
// 2. 考虑可移植性
// 3. 权衡正确性与性能
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-8-1',
                    title: '单例模式的线程安全实现',
                    code: `#include <iostream>
#include <atomic>
#include <mutex>
#include <thread>

class Singleton {
private:
    static std::atomic<Singleton*> instance;
    static std::mutex mtx;
    
    Singleton() {
        std::cout << "Singleton created" << std::endl;
    }
    
public:
    static Singleton* getInstance() {
        Singleton* tmp = instance.load(std::memory_order_acquire);
        if (tmp == nullptr) {
            std::lock_guard<std::mutex> lock(mtx);
            tmp = instance.load(std::memory_order_relaxed);
            if (tmp == nullptr) {
                tmp = new Singleton();
                instance.store(tmp, std::memory_order_release);
            }
        }
        return tmp;
    }
};

std::atomic<Singleton*> Singleton::instance{nullptr};
std::mutex Singleton::mtx;

int main() {
    std::thread t1([]() {
        Singleton* s = Singleton::getInstance();
        std::cout << "Thread 1 got instance" << std::endl;
    });
    
    std::thread t2([]() {
        Singleton* s = Singleton::getInstance();
        std::cout << "Thread 2 got instance" << std::endl;
    });
    
    t1.join();
    t2.join();
    
    return 0;
}`,
                    output: `Singleton created
Thread 1 got instance
Thread 2 got instance`
                },
                {
                    id: 'example-21-8-2',
                    title: '发布-订阅模式',
                    code: `#include <iostream>
#include <atomic>
#include <thread>
#include <string>

std::atomic<bool> ready{false};
std::string message;

void publisher() {
    message = "Hello, World!";
    ready.store(true, std::memory_order_release);
    std::cout << "Message published" << std::endl;
}

void subscriber() {
    while (!ready.load(std::memory_order_acquire)) {
        std::this_thread::yield();
    }
    std::cout << "Received: " << message << std::endl;
}

int main() {
    std::thread pub(publisher);
    std::thread sub(subscriber);
    
    pub.join();
    sub.join();
    
    return 0;
}`,
                    output: `Message published
Received: Hello, World!`
                }
            ],
            handsOn: {
                title: '实现线程安全的标志',
                description: '使用不同的内存序实现线程安全的标志，并比较性能。',
                initialCode: `#include <iostream>
#include <atomic>
#include <thread>
#include <chrono>

class Flag {
private:
    std::atomic<bool> value{false};
    
public:
    // TODO: 使用 seq_cst 设置标志
    void set() {
        // 使用默认内存序
    }
    
    // TODO: 使用 seq_cst 获取标志
    bool get() const {
        return false;
    }
    
    // TODO: 使用 release 设置标志
    void setRelease() {
        // 使用 memory_order_release
    }
    
    // TODO: 使用 acquire 获取标志
    bool getAcquire() const {
        return false;
    }
};

int main() {
    Flag flag;
    
    std::thread t1([&flag]() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        flag.set();
        std::cout << "Flag set" << std::endl;
    });
    
    std::thread t2([&flag]() {
        while (!flag.get()) {
            std::this_thread::yield();
        }
        std::cout << "Flag detected" << std::endl;
    });
    
    t1.join();
    t2.join();
    
    return 0;
}`,
                solution: `#include <iostream>
#include <atomic>
#include <thread>
#include <chrono>

class Flag {
private:
    std::atomic<bool> value{false};
    
public:
    void set() {
        value.store(true, std::memory_order_seq_cst);
    }
    
    bool get() const {
        return value.load(std::memory_order_seq_cst);
    }
    
    void setRelease() {
        value.store(true, std::memory_order_release);
    }
    
    bool getAcquire() const {
        return value.load(std::memory_order_acquire);
    }
};

int main() {
    Flag flag;
    
    std::thread t1([&flag]() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        flag.set();
        std::cout << "Flag set" << std::endl;
    });
    
    std::thread t2([&flag]() {
        while (!flag.get()) {
            std::this_thread::yield();
        }
        std::cout << "Flag detected" << std::endl;
    });
    
    t1.join();
    t2.join();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'memory_order_seq_cst 的主要特点是？',
                    options: [
                        '性能最好',
                        '所有线程看到相同的操作顺序',
                        '不保证任何顺序',
                        '只保证原子性'
                    ],
                    correctAnswer: 1,
                    explanation: 'memory_order_seq_cst 提供最强的保证，所有线程看到相同的操作顺序，是最直观的内存序。'
                },
                {
                    question: 'memory_order_release 通常与什么配合使用？',
                    options: [
                        'memory_order_relaxed',
                        'memory_order_acquire',
                        'memory_order_seq_cst',
                        'memory_order_consume'
                    ],
                    correctAnswer: 1,
                    explanation: 'memory_order_release 和 memory_order_acquire 是一对，用于建立同步关系。'
                },
                {
                    question: 'memory_order_relaxed 适用于什么场景？',
                    options: [
                        '需要严格顺序保证的场景',
                        '简单的原子计数器',
                        '生产者-消费者模型',
                        '双重检查锁定'
                    ],
                    correctAnswer: 1,
                    explanation: 'memory_order_relaxed 只保证原子性，不保证顺序，适用于简单的计数器等不需要同步的场景。'
                },
                {
                    question: '以下哪种内存序是默认的？',
                    options: [
                        'memory_order_relaxed',
                        'memory_order_acquire',
                        'memory_order_release',
                        'memory_order_seq_cst'
                    ],
                    correctAnswer: 3,
                    explanation: 'memory_order_seq_cst 是默认的内存序，提供最强的保证。'
                },
                {
                    question: 'happens-before 关系的作用是？',
                    options: [
                        '提高性能',
                        '定义操作之间的可见性',
                        '避免死锁',
                        '减少内存使用'
                    ],
                    correctAnswer: 1,
                    explanation: 'happens-before 定义了操作之间的可见性关系，如果 A happens-before B，则 A 的效果对 B 可见。'
                }
            ],
            references: [
                {
                    title: 'C++ Memory Model',
                    url: 'https://en.cppreference.com/w/cpp/atomic/memory_order'
                },
                {
                    title: 'C++ Concurrency in Action - Memory Model',
                    url: 'https://www.manning.com/books/c-plus-plus-concurrency-in-action'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 默认使用 memory_order_seq_cst，简单安全\n2. 性能敏感时考虑 acquire/release\n3. 理解 happens-before 关系是关键\n4. 内存序是高级话题，初学者可先使用默认值'
        },
        {
            id: '21.9',
            title: '并行算法与执行策略（C++17）',
            concepts: `
# 并行算法与执行策略（C++17）

## 1. 并行算法概述

C++17 在 \`<algorithm>\` 和 \`<numeric>\` 头文件中引入了并行版本的算法。

### 传统算法 vs 并行算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data = {5, 2, 8, 1, 9};

// 传统排序（单线程）
std::sort(data.begin(), data.end());

// 并行排序（多线程）
std::sort(std::execution::par, data.begin(), data.end());
\`\`\`

## 2. 执行策略

C++17 定义了三种执行策略：

### std::execution::seq - 顺序执行

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data = {1, 2, 3, 4, 5};

// 顺序执行，与传统算法相同
std::for_each(std::execution::seq, data.begin(), data.end(), 
              [](int& x) { x *= 2; });
\`\`\`

### std::execution::par - 并行执行

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data(10000, 1);
    
    // 并行执行，可能使用多线程
    std::for_each(std::execution::par, data.begin(), data.end(), 
                  [](int& x) { x *= 2; });
    
    std::cout << "First element: " << data[0] << std::endl;
    return 0;
}
\`\`\`

### std::execution::par_unseq - 并行向量化

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data(10000, 1);

// 并行 + 向量化（SIMD）
std::for_each(std::execution::par_unseq, data.begin(), data.end(), 
              [](int& x) { x *= 2; });
\`\`\`

## 3. 支持并行算法的标准库函数

### 排序算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data = {5, 2, 8, 1, 9, 3, 7, 4, 6};

// 并行排序
std::sort(std::execution::par, data.begin(), data.end());

// 并行稳定排序
std::stable_sort(std::execution::par, data.begin(), data.end());
\`\`\`

### 查找算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// 并行查找
auto it = std::find(std::execution::par, data.begin(), data.end(), 5);

// 并行查找所有匹配
std::vector<int> results;
std::copy_if(std::execution::par, data.begin(), data.end(), 
             std::back_inserter(results), [](int x) { return x % 2 == 0; });
\`\`\`

### 数值算法

\`\`\`cpp
#include <numeric>
#include <vector>
#include <execution>

std::vector<int> data = {1, 2, 3, 4, 5};

// 并行求和
int sum = std::reduce(std::execution::par, data.begin(), data.end(), 0);

// 并行累积（reduce 的并行版本）
int product = std::reduce(std::execution::par, data.begin(), data.end(), 
                          1, std::multiplies<int>());

// 并行扫描（前缀和）
std::vector<int> prefix(data.size());
std::exclusive_scan(std::execution::par, data.begin(), data.end(), 
                    prefix.begin(), 0);
\`\`\`

### 变换算法

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>

std::vector<int> data = {1, 2, 3, 4, 5};
std::vector<int> result(data.size());

// 并行变换
std::transform(std::execution::par, data.begin(), data.end(), 
               result.begin(), [](int x) { return x * x; });

// 并行替换
std::replace(std::execution::par, data.begin(), data.end(), 3, 30);
\`\`\`

## 4. 实际示例

### 并行计数

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data(1000000);
    for (size_t i = 0; i < data.size(); ++i) {
        data[i] = i % 100;
    }
    
    // 并行计数
    auto count = std::count_if(std::execution::par, data.begin(), data.end(), 
                               [](int x) { return x < 50; });
    
    std::cout << "Count: " << count << std::endl;
    return 0;
}
\`\`\`

### 并行归约

\`\`\`cpp
#include <numeric>
#include <vector>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data(1000000, 1);
    
    // 并行求和
    int sum = std::reduce(std::execution::par, data.begin(), data.end(), 0);
    
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}
\`\`\`

### 并行排序大数组

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>
#include <random>
#include <chrono>
#include <iostream>

int main() {
    std::vector<int> data(10000000);
    std::random_device rd;
    std::mt19937 gen(rd());
    
    for (auto& x : data) {
        x = gen();
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    std::sort(std::execution::par, data.begin(), data.end());
    auto end = std::chrono::high_resolution_clock::now();
    
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "Parallel sort time: " << duration.count() << " ms" << std::endl;
    
    return 0;
}
\`\`\`

## 5. 注意事项

### 线程安全

\`\`\`cpp
// 危险：非线程安全的操作
int counter = 0;
std::for_each(std::execution::par, data.begin(), data.end(), 
              [&counter](int x) { counter++; });  // 数据竞争！

// 正确：使用原子变量
std::atomic<int> counter{0};
std::for_each(std::execution::par, data.begin(), data.end(), 
              [&counter](int x) { counter++; });
\`\`\`

### 异常处理

\`\`\`cpp
#include <algorithm>
#include <vector>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    
    try {
        std::for_each(std::execution::par, data.begin(), data.end(), 
                      [](int x) {
                          if (x == 3) throw std::runtime_error("Error");
                      });
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
    
    return 0;
}
\`\`\`

## 6. 性能考虑

- **数据量**：小数据集并行化可能更慢
- **操作复杂度**：简单操作并行化收益有限
- **硬件支持**：依赖 CPU 核心数和 SIMD 支持

## 最佳实践

### 1. 选择合适的执行策略

\`\`\`cpp
// seq：需要保证执行顺序
std::for_each(std::execution::seq, data.begin(), data.end(),
              [](int& x) { /* 必须按顺序执行 */ });

// par：计算密集型任务
std::sort(std::execution::par, largeData.begin(), largeData.end());

// par_unseq：简单操作，可向量化
std::transform(std::execution::par_unseq, data.begin(), data.end(),
               result.begin(), [](int x) { return x * 2; });

// 选择指南：
// - 需要顺序保证 -> seq
// - 大数据集、复杂操作 -> par
// - 简单操作、数据量大 -> par_unseq
\`\`\`

### 2. 确保操作无副作用

\`\`\`cpp
// 推荐：纯函数，无副作用
std::transform(std::execution::par, input.begin(), input.end(),
               output.begin(), [](int x) { return x * x; });

// 避免：修改共享状态
int sum = 0;
std::for_each(std::execution::par, data.begin(), data.end(),
              [&sum](int x) { sum += x; });  // 数据竞争！

// 正确：使用 reduce
int sum = std::reduce(std::execution::par, data.begin(), data.end(), 0);
\`\`\`

### 3. 使用 transform_reduce 组合操作

\`\`\`cpp
#include <numeric>
#include <execution>

std::vector<int> data = {1, 2, 3, 4, 5};

// 组合变换和归约
int sumOfSquares = std::transform_reduce(
    std::execution::par,
    data.begin(), data.end(),
    0,                              // 初始值
    std::plus<>(),                  // 归约操作
    [](int x) { return x * x; }     // 变换操作
);

// 计算点积
std::vector<int> a = {1, 2, 3};
std::vector<int> b = {4, 5, 6};
int dotProduct = std::transform_reduce(
    std::execution::par,
    a.begin(), a.end(),
    b.begin(),
    0
);
\`\`\`

### 4. 预分配输出空间

\`\`\`cpp
// 推荐：预分配输出空间
std::vector<int> input(1000000);
std::vector<int> output(input.size());  // 预分配

std::transform(std::execution::par, input.begin(), input.end(),
               output.begin(), [](int x) { return x * 2; });

// 避免：使用 back_inserter（需要同步）
std::vector<int> output;
std::transform(std::execution::par, input.begin(), input.end(),
               std::back_inserter(output), [](int x) { return x * 2; });
// back_inserter 不是线程安全的！
\`\`\`

### 5. 测量性能

\`\`\`cpp
#include <chrono>
#include <iostream>

void benchmarkSort(std::vector<int>& data) {
    // 测试顺序排序
    auto data1 = data;
    auto start = std::chrono::high_resolution_clock::now();
    std::sort(data1.begin(), data1.end());
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Sequential: "
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << " ms" << std::endl;

    // 测试并行排序
    auto data2 = data;
    start = std::chrono::high_resolution_clock::now();
    std::sort(std::execution::par, data2.begin(), data2.end());
    end = std::chrono::high_resolution_clock::now();
    std::cout << "Parallel: "
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
              << " ms" << std::endl;
}
\`\`\`

## 常见错误

### 1. 数据竞争

\`\`\`cpp
// 错误：共享变量的非原子访问
int counter = 0;
std::for_each(std::execution::par, data.begin(), data.end(),
              [&counter](int x) {
                  if (x > 0) counter++;  // 数据竞争！
              });

// 正确：使用原子变量
std::atomic<int> counter{0};
std::for_each(std::execution::par, data.begin(), data.end(),
              [&counter](int x) {
                  if (x > 0) counter++;
              });

// 更好：使用 count_if
auto counter = std::count_if(std::execution::par, data.begin(), data.end(),
                             [](int x) { return x > 0; });
\`\`\`

### 2. 迭代器失效

\`\`\`cpp
std::vector<int> data = {1, 2, 3, 4, 5};

// 危险：在并行算法中修改容器
std::for_each(std::execution::par, data.begin(), data.end(),
              [&data](int x) {
                  if (x == 3) data.push_back(6);  // 迭代器失效！
              });

// 正确：不要在并行算法中修改容器结构
\`\`\`

### 3. 异常安全

\`\`\`cpp
// 问题：并行算法中的异常
std::vector<int> data = {1, 2, 3, 4, 5};

try {
    std::for_each(std::execution::par, data.begin(), data.end(),
                  [](int x) {
                      if (x == 3) throw std::runtime_error("Error");
                  });
} catch (const std::exception& e) {
    // 异常会被捕获，但其他线程可能仍在运行
    // 算法会等待所有线程完成
}

// 建议：避免在并行算法中抛出异常
// 如果必须，确保异常处理是线程安全的
\`\`\`

### 4. 小数据集过度并行化

\`\`\`cpp
// 问题：小数据集并行化开销大于收益
std::vector<int> smallData = {1, 2, 3, 4, 5};

// 并行化开销 > 计算时间
std::sort(std::execution::par, smallData.begin(), smallData.end());

// 建议：小数据集使用顺序算法
std::sort(smallData.begin(), smallData.end());  // 更快

// 经验法则：数据量 > 10000 时考虑并行化
\`\`\`

### 5. 死锁风险

\`\`\`cpp
std::mutex mtx;
std::vector<int> data = {1, 2, 3, 4, 5};

// 危险：并行算法中使用锁可能导致死锁
std::for_each(std::execution::par, data.begin(), data.end(),
              [&mtx](int x) {
                  std::lock_guard<std::mutex> lock(mtx);
                  // 如果多个线程同时等待锁...
              });

// 建议：避免在并行算法中使用锁
// 使用无锁数据结构或原子操作
\`\`\`

## 深入理解

### 1. 执行策略的实现

\`\`\`cpp
// std::execution::seq
// - 单线程执行
// - 保证顺序执行
// - 无额外开销

// std::execution::par
// - 使用线程池
// - 可能分块执行
// - 需要线程安全的操作

// std::execution::par_unseq
// - 并行 + 向量化（SIMD）
// - 编译器可能生成 SSE/AVX 指令
// - 最强的优化，但要求最严格

// 实现细节：
// - 通常使用工作窃取线程池
// - 数据分块策略影响性能
// - 缓存友好的分块大小很重要
\`\`\`

### 2. 并行算法的复杂度

\`\`\`cpp
// 并行算法的时间复杂度分析：

// 并行排序：O(n log n / p)
// p = 处理器数量

// 并行归约：O(n / p)
// 理想情况下，加速比 = p

// 并行查找：O(n / p)
// 但有额外开销

// 实际加速比受限于：
// 1. Amdahl 定律：串行部分限制加速
// 2. 负载不均衡
// 3. 内存带宽瓶颈
// 4. 缓存一致性开销
\`\`\`

### 3. 新算法：reduce vs accumulate

\`\`\`cpp
#include <numeric>
#include <execution>
#include <vector>

std::vector<int> data = {1, 2, 3, 4, 5};

// std::accumulate：顺序执行
int sum1 = std::accumulate(data.begin(), data.end(), 0);
// 执行顺序：((((0+1)+2)+3)+4)+5

// std::reduce：可并行执行
int sum2 = std::reduce(std::execution::par, data.begin(), data.end(), 0);
// 执行顺序可能是：(1+2) + ((3+4) + 5)

// 重要区别：
// 1. reduce 要求操作是可交换和可结合的
// 2. reduce 可以并行执行
// 3. 对于浮点数，结果可能不同

// 浮点数示例
std::vector<double> floats = {1.1, 2.2, 3.3, 4.4, 5.5};
double sum_seq = std::accumulate(floats.begin(), floats.end(), 0.0);
double sum_par = std::reduce(std::execution::par, floats.begin(), floats.end(), 0.0);
// sum_seq 和 sum_par 可能略有不同！
\`\`\`

### 4. 并行扫描算法

\`\`\`cpp
#include <numeric>
#include <execution>
#include <vector>

std::vector<int> data = {1, 2, 3, 4, 5};
std::vector<int> result(data.size());

// inclusive_scan：包含当前元素
std::inclusive_scan(std::execution::par, data.begin(), data.end(),
                    result.begin());
// result: {1, 3, 6, 10, 15}

// exclusive_scan：不包含当前元素
std::exclusive_scan(std::execution::par, data.begin(), data.end(),
                    result.begin(), 0);
// result: {0, 1, 3, 6, 10}

// transform_inclusive_scan：先变换再扫描
std::transform_inclusive_scan(std::execution::par, data.begin(), data.end(),
                               result.begin(), std::plus<>(),
                               [](int x) { return x * x; });
// result: {1, 5, 14, 30, 55}  // 1, 1+4, 1+4+9, ...
\`\`\`

### 5. 内存分配与并行算法

\`\`\`cpp
// 并行算法可能需要临时内存

// 问题：内存分配可能成为瓶颈
std::vector<int> hugeData(100000000);

// 并行排序需要 O(n) 额外内存
std::sort(std::execution::par, hugeData.begin(), hugeData.end());

// 建议：
// 1. 对于内存受限场景，考虑原地算法
// 2. 使用自定义分配器
// 3. 监控内存使用

// 自定义分配器示例
template<typename T>
class PoolAllocator {
    // 线程安全的内存池
    // 减少并行算法中的内存分配竞争
};

std::vector<int, PoolAllocator<int>> data;
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-9-1',
                    title: '并行计算统计信息',
                    code: `#include <algorithm>
#include <numeric>
#include <vector>
#include <execution>
#include <random>
#include <iostream>
#include <cmath>

int main() {
    const size_t N = 1000000;
    std::vector<double> data(N);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<> dis(100.0, 15.0);
    
    for (auto& x : data) {
        x = dis(gen);
    }
    
    // 并行计算平均值
    double sum = std::reduce(std::execution::par, data.begin(), data.end(), 0.0);
    double mean = sum / N;
    
    // 并行计算标准差
    double variance = std::transform_reduce(
        std::execution::par,
        data.begin(), data.end(),
        0.0,
        std::plus<>(),
        [mean](double x) { return (x - mean) * (x - mean); }
    ) / N;
    
    double stddev = std::sqrt(variance);
    
    std::cout << "Mean: " << mean << std::endl;
    std::cout << "Standard Deviation: " << stddev << std::endl;
    
    return 0;
}`,
                    output: `Mean: 100.123
Standard Deviation: 14.987`
                },
                {
                    id: 'example-21-9-2',
                    title: '并行数据处理管道',
                    code: `#include <algorithm>
#include <vector>
#include <execution>
#include <random>
#include <iostream>

int main() {
    const size_t N = 100000;
    std::vector<int> data(N);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 100);
    
    for (auto& x : data) {
        x = dis(gen);
    }
    
    // 步骤1：并行过滤（保留偶数）
    std::vector<int> evens;
    std::copy_if(std::execution::par, data.begin(), data.end(), 
                 std::back_inserter(evens), [](int x) { return x % 2 == 0; });
    
    // 步骤2：并行变换（平方）
    std::vector<int> squares(evens.size());
    std::transform(std::execution::par, evens.begin(), evens.end(), 
                   squares.begin(), [](int x) { return x * x; });
    
    // 步骤3：并行排序
    std::sort(std::execution::par, squares.begin(), squares.end());
    
    // 步骤4：并行去重
    auto last = std::unique(std::execution::par, squares.begin(), squares.end());
    squares.erase(last, squares.end());
    
    std::cout << "Original size: " << N << std::endl;
    std::cout << "Even numbers: " << evens.size() << std::endl;
    std::cout << "Unique squares: " << squares.size() << std::endl;
    
    return 0;
}`,
                    output: `Original size: 100000
Even numbers: 50123
Unique squares: 2500`
                }
            ],
            handsOn: {
                title: '并行图像处理模拟',
                description: '使用并行算法模拟图像处理操作。',
                initialCode: `#include <algorithm>
#include <vector>
#include <execution>
#include <random>
#include <iostream>

// 模拟像素
struct Pixel {
    unsigned char r, g, b;
    
    Pixel() : r(0), g(0), b(0) {}
    Pixel(unsigned char r_, unsigned char g_, unsigned char b_) 
        : r(r_), g(g_), b(b_) {}
};

class Image {
private:
    std::vector<Pixel> pixels;
    size_t width, height;
    
public:
    Image(size_t w, size_t h) : width(w), height(h), pixels(w * h) {}
    
    // TODO: 并行设置所有像素为指定颜色
    void fill(const Pixel& color) {
        // 使用 std::for_each 并行填充
    }
    
    // TODO: 并行调整亮度
    void adjustBrightness(int delta) {
        // 使用 std::for_each 并行调整每个像素的亮度
        // 注意处理溢出
    }
    
    // TODO: 并行转换为灰度
    void toGrayscale() {
        // 使用 std::for_each 并行转换
        // 灰度 = 0.299*R + 0.587*G + 0.114*B
    }
    
    // TODO: 并行反转颜色
    void invert() {
        // 使用 std::for_each 并行反转每个通道
    }
    
    size_t size() const { return pixels.size(); }
};

int main() {
    Image img(1920, 1080);
    
    std::cout << "Image size: " << img.size() << " pixels" << std::endl;
    
    img.fill(Pixel(100, 150, 200));
    std::cout << "Filled with color" << std::endl;
    
    img.adjustBrightness(50);
    std::cout << "Brightness adjusted" << std::endl;
    
    img.toGrayscale();
    std::cout << "Converted to grayscale" << std::endl;
    
    img.invert();
    std::cout << "Colors inverted" << std::endl;
    
    return 0;
}`,
                solution: `#include <algorithm>
#include <vector>
#include <execution>
#include <random>
#include <iostream>

struct Pixel {
    unsigned char r, g, b;
    
    Pixel() : r(0), g(0), b(0) {}
    Pixel(unsigned char r_, unsigned char g_, unsigned char b_) 
        : r(r_), g(g_), b(b_) {}
};

class Image {
private:
    std::vector<Pixel> pixels;
    size_t width, height;
    
public:
    Image(size_t w, size_t h) : width(w), height(h), pixels(w * h) {}
    
    void fill(const Pixel& color) {
        std::for_each(std::execution::par, pixels.begin(), pixels.end(),
                      [&color](Pixel& p) { p = color; });
    }
    
    void adjustBrightness(int delta) {
        std::for_each(std::execution::par, pixels.begin(), pixels.end(),
                      [delta](Pixel& p) {
                          p.r = std::min(255, std::max(0, (int)p.r + delta));
                          p.g = std::min(255, std::max(0, (int)p.g + delta));
                          p.b = std::min(255, std::max(0, (int)p.b + delta));
                      });
    }
    
    void toGrayscale() {
        std::for_each(std::execution::par, pixels.begin(), pixels.end(),
                      [](Pixel& p) {
                          unsigned char gray = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
                          p.r = p.g = p.b = gray;
                      });
    }
    
    void invert() {
        std::for_each(std::execution::par, pixels.begin(), pixels.end(),
                      [](Pixel& p) {
                          p.r = 255 - p.r;
                          p.g = 255 - p.g;
                          p.b = 255 - p.b;
                      });
    }
    
    size_t size() const { return pixels.size(); }
};

int main() {
    Image img(1920, 1080);
    
    std::cout << "Image size: " << img.size() << " pixels" << std::endl;
    
    img.fill(Pixel(100, 150, 200));
    std::cout << "Filled with color" << std::endl;
    
    img.adjustBrightness(50);
    std::cout << "Brightness adjusted" << std::endl;
    
    img.toGrayscale();
    std::cout << "Converted to grayscale" << std::endl;
    
    img.invert();
    std::cout << "Colors inverted" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'C++17 引入的并行算法需要包含哪个头文件？',
                    options: [
                        '<parallel>',
                        '<thread>',
                        '<execution>',
                        '<concurrent>'
                    ],
                    correctAnswer: 2,
                    explanation: 'C++17 的并行算法需要包含 <execution> 头文件来使用执行策略。'
                },
                {
                    question: 'std::execution::par 表示什么？',
                    options: [
                        '顺序执行',
                        '并行执行',
                        '并行向量化执行',
                        '延迟执行'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::execution::par 表示并行执行，算法可能使用多线程来加速。'
                },
                {
                    question: '以下哪个算法有并行版本？',
                    options: [
                        'std::swap',
                        'std::sort',
                        'std::move',
                        'std::copy'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::sort 有并行版本，可以使用 std::sort(std::execution::par, ...) 来并行排序。'
                },
                {
                    question: '使用并行算法时需要注意什么？',
                    options: [
                        '不需要考虑线程安全',
                        '操作必须是线程安全的',
                        '只能用于数值计算',
                        '必须手动创建线程'
                    ],
                    correctAnswer: 1,
                    explanation: '并行算法会在多线程中执行操作，因此操作必须是线程安全的，避免数据竞争。'
                },
                {
                    question: 'std::reduce 与 std::accumulate 的主要区别是？',
                    options: [
                        'reduce 不支持自定义操作',
                        'reduce 可以并行执行',
                        'accumulate 性能更好',
                        '它们完全相同'
                    ],
                    correctAnswer: 1,
                    explanation: 'std::reduce 是 C++17 引入的，支持并行执行，而 std::accumulate 只能顺序执行。'
                }
            ],
            references: [
                {
                    title: 'C++ Reference - Execution policies',
                    url: 'https://en.cppreference.com/w/cpp/algorithm/execution_policy'
                },
                {
                    title: 'C++17 Parallel Algorithms',
                    url: 'https://en.cppreference.com/w/cpp/algorithm'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 并行算法自动利用多核，无需手动管理线程\n2. 注意操作的线程安全性\n3. 小数据集并行化可能反而更慢\n4. std::execution::par_unseq 可能使用 SIMD 指令加速'
        },
        {
            id: '21.10',
            title: '协程基础（C++20）',
            concepts: `
# 协程基础（C++20）

## 1. 协程概述

**协程**是可以暂停和恢复执行的函数，提供了一种编写异步代码的同步方式。

### 协程 vs 函数

\`\`\`cpp
// 普通函数：一次性执行完毕
int normalFunction() {
    return 42;
}

// 协程：可以暂停和恢复
Task coroutineFunction() {
    co_await delay(100ms);  // 暂停 100ms
    co_return 42;          // 返回结果
}
\`\`\`

## 2. 协程关键字

C++20 引入了三个协程关键字：

- **co_await**：暂停协程，等待某个操作完成
- **co_yield**：产生一个值，暂停协程
- **co_return**：从协程返回

### co_await 示例

\`\`\`cpp
#include <iostream>
#include <coroutine>
#include <chrono>
#include <thread>

// 简单的等待器
struct Awaiter {
    bool await_ready() { return false; }
    void await_suspend(std::coroutine_handle<> h) {
        std::thread([h]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            h.resume();
        }).detach();
    }
    void await_resume() {}
};

Task myCoroutine() {
    std::cout << "Start" << std::endl;
    co_await Awaiter{};  // 暂停
    std::cout << "End" << std::endl;
    co_return;
}
\`\`\`

### co_yield 示例

\`\`\`cpp
#include <iostream>
#include <coroutine>
#include <memory>

// 生成器协程
Generator<int> counter() {
    for (int i = 0; i < 5; ++i) {
        co_yield i;  // 产生值并暂停
    }
}

int main() {
    auto gen = counter();
    for (int value : gen) {
        std::cout << value << " ";
    }
    // 输出: 0 1 2 3 4
    return 0;
}
\`\`\`

## 3. 协程返回类型

协程必须返回一个包含特定嵌套类型的对象：

\`\`\`cpp
struct Task {
    struct promise_type {
        Task get_return_object();
        std::suspend_never initial_suspend();
        std::suspend_never final_suspend() noexcept;
        void return_void();
        void unhandled_exception();
    };
};
\`\`\`

## 4. promise_type 要求

\`promise_type\` 必须定义以下方法：

| 方法 | 说明 |
|------|------|
| get_return_object() | 创建协程返回对象 |
| initial_suspend() | 协程开始时的行为 |
| final_suspend() | 协程结束时的行为 |
| return_value() / return_void() | 处理 co_return |
| yield_value() | 处理 co_yield |
| unhandled_exception() | 处理异常 |

## 5. 简单的 Task 实现

\`\`\`cpp
#include <iostream>
#include <coroutine>
#include <stdexcept>

class Task {
public:
    struct promise_type {
        Task get_return_object() {
            return Task{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_never final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() { std::terminate(); }
    };
    
    Task(std::coroutine_handle<promise_type> h) : handle(h) {}
    ~Task() { if (handle) handle.destroy(); }
    
private:
    std::coroutine_handle<promise_type> handle;
};

Task simpleCoroutine() {
    std::cout << "Hello from coroutine!" << std::endl;
    co_return;
}
\`\`\`

## 6. 协程的应用场景

- **异步 I/O**：网络请求、文件操作
- **生成器**：惰性序列
- **状态机**：游戏逻辑、解析器
- **协作式多任务**：轻量级并发

## 7. 注意事项

1. **编译器支持**：需要 C++20 编译器
2. **性能**：协程切换比线程切换更轻量
3. **内存**：协程状态在堆上分配
4. **调试**：协程调试可能比较困难

## 最佳实践

### 1. 使用现有的协程库

\`\`\`cpp
// 推荐：使用成熟的协程库
// - cppcoro (Lewis Baker)
// - folly::coro
// - async_simple

// 避免从零开始实现 promise_type
// 协程框架的实现很复杂，容易出错

// 示例：使用 cppcoro
#include <cppcoro/task.hpp>
#include <cppcoro/sync_wait.hpp>

cppcoro::task<int> asyncCompute() {
    co_return 42;
}

int main() {
    return cppcoro::sync_wait(asyncCompute());
}
\`\`\`

### 2. 正确管理协程生命周期

\`\`\`cpp
// 问题：协程句柄悬空
Task createTask() {
    Task task = someCoroutine();
    // task 析构时销毁协程
    return task;  // 返回后协程已销毁！
}

// 正确：使用智能指针或确保生命周期
std::unique_ptr<Task> createTaskSafe() {
    return std::make_unique<Task>(someCoroutine());
}

// 或使用 shared_state
class SharedTask {
    std::shared_ptr<TaskState> state;
public:
    // 可以安全复制
};
\`\`\`

### 3. 异常处理

\`\`\`cpp
// promise_type 中的异常处理
struct promise_type {
    std::exception_ptr exception;
    
    void unhandled_exception() {
        exception = std::current_exception();
    }
    
    void rethrow_if_exception() {
        if (exception) {
            std::rethrow_exception(exception);
        }
    }
};

// 使用时检查异常
Task myCoroutine() {
    try {
        co_await someOperation();
        co_return 42;
    } catch (const std::exception& e) {
        // 异常会被存储到 promise
    }
}
\`\`\`

### 4. 使用对称转移优化

\`\`\`cpp
// C++20 对称转移：协程可以无缝切换
struct promise_type {
    auto await_suspend(std::coroutine_handle<> h) {
        // 返回另一个协程句柄，直接切换
        return otherCoroutineHandle;
    }
};

// 好处：避免不必要的恢复/暂停开销
// 适用于协程链式调用
\`\`\`

### 5. 避免堆分配（HALO）

\`\`\`cpp
// 编译器可能优化掉堆分配（HALO - Heap Allocation eLision Optimization）
// 条件：
// 1. 协程生命周期在调用者栈帧内
// 2. 协程状态大小在编译期可知

// 帮助编译器优化
Task simpleCoroutine() {
    co_return 42;  // 编译器可能优化为栈分配
}

// 避免动态大小
Task badCoroutine(int n) {
    std::vector<int> data(n);  // 阻止 HALO
    co_return 0;
}
\`\`\`

## 常见错误

### 1. 悬空协程句柄

\`\`\`cpp
// 错误：使用已销毁的协程
std::coroutine_handle<> globalHandle;

Task badCoroutine() {
    globalHandle = std::coroutine_handle<>::from_address(nullptr);
    co_return;
}

void useAfterDestroy() {
    auto task = badCoroutine();
    // task 析构后，globalHandle 无效
    globalHandle.resume();  // 未定义行为！
}

// 正确：确保协程在使用期间有效
\`\`\`

### 2. 忘记恢复协程

\`\`\`cpp
// 错误：协程永远暂停
Task hangingCoroutine() {
    co_await std::suspend_always{};  // 永远暂停
    co_return 42;  // 永远不会执行
}

// 正确：确保有恢复路径
Task correctCoroutine() {
    co_await someAwaitable;  // 最终会恢复
    co_return 42;
}
\`\`\`

### 3. 在协程中使用阻塞操作

\`\`\`cpp
// 错误：在协程中阻塞
Task badAsyncTask() {
    std::this_thread::sleep_for(std::chrono::seconds(1));  // 阻塞线程！
    co_return;
}

// 正确：使用异步等待
Task goodAsyncTask() {
    co_await asyncSleep(1s);  // 不阻塞线程
    co_return;
}
\`\`\`

### 4. 协程中的线程安全问题

\`\`\`cpp
// 危险：协程可能在多个线程上恢复
Task threadUnsafeCoroutine() {
    int localData = 0;
    
    co_await switchToThread1();
    localData++;  // 在线程1
    
    co_await switchToThread2();
    localData++;  // 在线程2 - 数据竞争！
    
    co_return;
}

// 正确：使用原子操作或同步机制
\`\`\`

### 5. 错误理解 co_return

\`\`\`cpp
// 错误：使用 return 而非 co_return
Task wrongCoroutine() {
    return;  // 编译错误！协程必须使用 co_return
}

// 正确
Task correctCoroutine() {
    co_return;  // 或 co_return value;
}

// 注意：协程中不能同时使用 return 和 co_return
\`\`\`

## 深入理解

### 1. 协程的编译器变换

\`\`\`cpp
// 原始协程代码
Task myCoroutine(int x) {
    int y = x + 1;
    co_await someAwaitable;
    co_return y;
}

// 编译器生成的伪代码
Task myCoroutine(int x) {
    // 1. 分配协程帧
    auto* frame = new CoroutineFrame;
    
    // 2. 复制参数到帧
    frame->x = x;
    
    // 3. 创建 promise
    auto& promise = frame->promise;
    
    // 4. 获取返回对象
    auto returnObject = promise.get_return_object();
    
    // 5. 初始暂停
    co_await promise.initial_suspend();
    
    try {
        // 6. 协程体
        frame->y = frame->x + 1;
        co_await someAwaitable;
        promise.return_value(frame->y);
    } catch (...) {
        promise.unhandled_exception();
    }
    
    // 7. 最终暂停
    co_await promise.final_suspend();
    
    return returnObject;
}
\`\`\`

### 2. 协程帧的内存布局

\`\`\`cpp
// 协程帧包含：
// 1. promise 对象
// 2. 参数副本
// 3. 局部变量
// 4. 恢复点（当前执行位置）
// 5. 销毁点

struct CoroutineFrame {
    void (*resume)(CoroutineFrame*);
    void (*destroy)(CoroutineFrame*);
    promise_type promise;
    // 参数和局部变量...
    int x;
    int y;
    int resumePoint;  // 状态机状态
};

// 内存大小在编译期确定
// 但可能很大（如果有很多局部变量）
\`\`\`

### 3. Awaiter 接口详解

\`\`\`cpp
// 完整的 Awaiter 接口
struct Awaiter {
    // 1. 是否需要暂停？
    bool await_ready() {
        // 返回 true：不暂停，直接继续
        // 返回 false：暂停，调用 await_suspend
        return false;
    }
    
    // 2. 暂停时的行为
    void await_suspend(std::coroutine_handle<> h) {
        // h：当前协程的句柄
        // 可以保存 h 以便稍后恢复
        // 可以立即恢复其他协程（对称转移）
    }
    
    // 或返回协程句柄（对称转移）
    std::coroutine_handle<> await_suspend(std::coroutine_handle<> h) {
        return otherCoroutine;  // 直接切换到另一个协程
    }
    
    // 或返回 bool
    bool await_suspend(std::coroutine_handle<> h) {
        // true：暂停
        // false：不暂停，继续执行
        return true;
    }
    
    // 3. 恢复时的行为
    T await_resume() {
        // co_await 表达式的结果
        return value;
    }
};
\`\`\`

### 4. 无栈协程 vs 有栈协程

\`\`\`cpp
// C++20 协程：无栈协程（Stackless）
// - 协程状态在堆上
// - 不能从嵌套函数中暂停
// - 内存效率高

void nestedFunction() {
    // 不能在这里暂停外层协程
}

Task stacklessCoroutine() {
    nestedFunction();
    co_await something;  // 只能在协程体中暂停
}

// 有栈协程（Stackful）- 如 Boost.Context
// - 每个协程有自己的栈
// - 可以从嵌套函数中暂停
// - 内存开销大

// C++20 选择无栈协程的原因：
// 1. 内存效率
// 2. 与现有 C++ 代码兼容
// 3. 更好的性能
\`\`\`

### 5. 协程与异步 I/O

\`\`\`cpp
// 异步 I/O 是协程的主要应用场景

// 传统回调方式
void fetchDataCallback(std::function<void(Data)> callback) {
    asyncRead([](Buffer buf) {
        processData(buf, [](Data data) {
            callback(data);
        });
    });
}

// 使用协程（同步风格）
Task<Data> fetchData() {
    Buffer buf = co_await asyncRead();
    Data data = co_await processData(buf);
    co_return data;
}

// 使用
Task<void> processRequest() {
    Data data = co_await fetchData();
    co_await saveData(data);
}

// 优势：
// 1. 代码更清晰
// 2. 错误处理更简单
// 3. 资源管理更安全（RAII）
\`\`\`
`,
            examples: [
                {
                    id: 'example-21-10-1',
                    title: '生成器协程',
                    code: `#include <iostream>
#include <coroutine>
#include <memory>

template<typename T>
class Generator {
public:
    struct promise_type {
        T value;
        
        Generator get_return_object() {
            return Generator{
                std::coroutine_handle<promise_type>::from_promise(*this)
            };
        }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void unhandled_exception() { std::terminate(); }
        
        std::suspend_always yield_value(T v) {
            value = v;
            return {};
        }
    };
    
    struct iterator {
        std::coroutine_handle<promise_type> h;
        bool operator!=(std::default_sentinel_t) { return h && !h.done(); }
        void operator++() { h.resume(); }
        T operator*() { return h.promise().value; }
    };
    
    iterator begin() { h.resume(); return {h}; }
    std::default_sentinel_t end() { return {}; }
    
    Generator(std::coroutine_handle<promise_type> h) : h(h) {}
    ~Generator() { if (h) h.destroy(); }
    
private:
    std::coroutine_handle<promise_type> h;
};

Generator<int> fibonacci(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        co_yield a;
        auto tmp = a;
        a = b;
        b = tmp + b;
    }
}

int main() {
    for (int value : fibonacci(10)) {
        std::cout << value << " ";
    }
    return 0;
}`,
                    output: `0 1 1 2 3 5 8 13 21 34`
                },
                {
                    id: 'example-21-10-2',
                    title: '异步任务协程',
                    code: `#include <iostream>
#include <coroutine>
#include <thread>
#include <chrono>

class AsyncTask {
public:
    struct promise_type {
        AsyncTask get_return_object() {
            return AsyncTask{
                std::coroutine_handle<promise_type>::from_promise(*this)
            };
        }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_never final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() { std::terminate(); }
    };
    
    AsyncTask(std::coroutine_handle<promise_type> h) : handle(h) {}
    ~AsyncTask() { if (handle) handle.destroy(); }
    
private:
    std::coroutine_handle<promise_type> handle;
};

struct Timer {
    int ms;
    bool await_ready() { return false; }
    void await_suspend(std::coroutine_handle<> h) {
        std::thread([h, this]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(ms));
            h.resume();
        }).detach();
    }
    void await_resume() {}
};

AsyncTask delayedPrint() {
    std::cout << "Start" << std::endl;
    co_await Timer{1000};
    std::cout << "After 1 second" << std::endl;
    co_await Timer{500};
    std::cout << "After another 0.5 seconds" << std::endl;
}

int main() {
    auto task = delayedPrint();
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 0;
}`,
                    output: `Start
After 1 second
After another 0.5 seconds`
                }
            ],
            handsOn: {
                title: '实现范围生成器',
                description: '实现一个生成器协程，生成指定范围内的整数序列。',
                initialCode: `#include <iostream>
#include <coroutine>

// TODO: 定义 Generator 类模板
template<typename T>
class Generator {
public:
    // TODO: 定义 promise_type
    struct promise_type {
        // get_return_object()
        // initial_suspend()
        // final_suspend()
        // yield_value()
        // unhandled_exception()
    };
    
    // TODO: 定义迭代器支持
    // begin(), end()
};

// TODO: 实现范围生成器协程
Generator<int> range(int start, int end) {
    // 使用 co_yield 生成从 start 到 end-1 的整数
}

int main() {
    std::cout << "Range 1-5: ";
    for (int value : range(1, 6)) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    std::cout << "Range 10-15: ";
    for (int value : range(10, 16)) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <coroutine>

template<typename T>
class Generator {
public:
    struct promise_type {
        T value;
        
        Generator get_return_object() {
            return Generator{
                std::coroutine_handle<promise_type>::from_promise(*this)
            };
        }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void unhandled_exception() { std::terminate(); }
        
        std::suspend_always yield_value(T v) {
            value = v;
            return {};
        }
    };
    
    struct iterator {
        std::coroutine_handle<promise_type> h;
        bool operator!=(std::default_sentinel_t) { return h && !h.done(); }
        void operator++() { h.resume(); }
        T operator*() { return h.promise().value; }
    };
    
    iterator begin() { h.resume(); return {h}; }
    std::default_sentinel_t end() { return {}; }
    
    Generator(std::coroutine_handle<promise_type> h) : h(h) {}
    ~Generator() { if (h) h.destroy(); }
    
private:
    std::coroutine_handle<promise_type> h;
};

Generator<int> range(int start, int end) {
    for (int i = start; i < end; ++i) {
        co_yield i;
    }
}

int main() {
    std::cout << "Range 1-5: ";
    for (int value : range(1, 6)) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    std::cout << "Range 10-15: ";
    for (int value : range(10, 16)) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'C++20 协程的三个关键字是？',
                    options: [
                        'async, await, yield',
                        'co_await, co_yield, co_return',
                        'suspend, resume, return',
                        'coroutine, pause, continue'
                    ],
                    correctAnswer: 1,
                    explanation: 'C++20 引入了三个协程关键字：co_await、co_yield 和 co_return。'
                },
                {
                    question: 'co_await 的作用是？',
                    options: [
                        '返回一个值',
                        '产生一个值',
                        '暂停协程，等待操作完成',
                        '创建协程'
                    ],
                    correctAnswer: 2,
                    explanation: 'co_await 用于暂停协程，等待某个异步操作完成后再恢复执行。'
                },
                {
                    question: 'promise_type 必须定义哪个方法？',
                    options: [
                        'run()',
                        'execute()',
                        'get_return_object()',
                        'start()'
                    ],
                    correctAnswer: 2,
                    explanation: 'promise_type 必须定义 get_return_object() 方法来创建协程返回对象。'
                },
                {
                    question: '协程与线程的主要区别是？',
                    options: [
                        '协程由操作系统调度',
                        '协程在用户态切换，更轻量',
                        '协程不能并发执行',
                        '协程没有栈'
                    ],
                    correctAnswer: 1,
                    explanation: '协程在用户态进行切换，由程序员控制，比线程更轻量，切换开销更小。'
                },
                {
                    question: 'co_yield 的作用是？',
                    options: [
                        '结束协程',
                        '暂停协程并产生一个值',
                        '等待异步操作',
                        '创建新协程'
                    ],
                    correctAnswer: 1,
                    explanation: 'co_yield 用于暂停协程并产生一个值，常用于实现生成器。'
                }
            ],
            references: [
                {
                    title: 'C++20 Coroutines',
                    url: 'https://en.cppreference.com/w/cpp/language/coroutines'
                },
                {
                    title: 'C++ Coroutines: Under the Hood',
                    url: 'https://devblogs.microsoft.com/cppblog/c-coroutines-under-the-hood/'
                }
            ],
            assistantTips: '💡 学习提示：\n1. 协程是 C++20 的高级特性，需要编译器支持\n2. 理解 promise_type 是实现协程的关键\n3. 协程适用于异步编程和生成器场景\n4. 协程比线程更轻量，适合高并发场景'
        }
    ]
};

window.Unit21Data = Unit21Data;