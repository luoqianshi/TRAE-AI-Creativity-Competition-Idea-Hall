/**
 * 单元27：性能优化专题
 * 深入学习C++性能优化技术与最佳实践
 */
const Unit27Data = {
    id: 27,
    title: '性能优化专题',
    description: '深入学习C++性能优化技术，包括基准测试、内存优化、缓存友好设计、编译时计算等核心主题',
    lessons: [
        {
            id: '27.1',
            title: '基准测试与性能分析工具',
            duration: '35分钟',
            difficulty: '中级',
            xp: 160,
            estimatedXp: 320,
            concepts: `## 基准测试与性能分析工具

性能优化的第一步是测量。本节介绍如何正确地进行基准测试和使用性能分析工具。

### 为什么需要基准测试

\`\`\`cpp
// 错误的优化方式：凭感觉优化
// "我觉得这个函数慢，改一下" - 这是危险的！

// 正确的优化方式：先测量，再优化
// 1. 确定性能瓶颈
// 2. 测量基准性能
// 3. 优化
// 4. 再次测量验证
\`\`\`

### 使用 chrono 进行时间测量

C++11 提供了 \`<chrono>\` 库用于高精度时间测量：

\`\`\`cpp
#include <chrono>
#include <iostream>

void measureTime() {
    auto start = std::chrono::high_resolution_clock::now();
    
    // 被测量的代码
    for (int i = 0; i < 1000000; ++i) {
        // 一些操作
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "耗时: " << duration.count() << " 微秒" << std::endl;
}
\`\`\`

### 基准测试的最佳实践

1. **多次运行取平均**：避免偶然因素影响
2. **预热缓存**：第一次运行可能较慢
3. **关闭优化时测试**：验证算法正确性
4. **开启优化后测试**：测量真实性能

\`\`\`cpp
#include <chrono>
#include <vector>
#include <numeric>
#include <algorithm>

template<typename Func>
double benchmark(Func func, int iterations = 100) {
    std::vector<double> times;
    times.reserve(iterations);
    
    // 预热
    func();
    
    for (int i = 0; i < iterations; ++i) {
        auto start = std::chrono::high_resolution_clock::now();
        func();
        auto end = std::chrono::high_resolution_clock::now();
        
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        times.push_back(duration.count());
    }
    
    // 计算中位数（比平均值更稳定）
    std::sort(times.begin(), times.end());
    return times[iterations / 2];
}
\`\`\`

### 常用性能分析工具

1. **编译器内置工具**：
   - GCC/Clang: \`-pg\` 选项 + gprof
   - MSVC: Performance Profiler

2. **第三方工具**：
   - Valgrind (Linux): 内存分析和性能分析
   - perf (Linux): Linux 性能分析工具
   - VTune (Intel): 高级性能分析
   - Tracy: 实时性能分析器

3. **简单计时宏**：

\`\`\`cpp
#define TIMER_START(name) auto _timer_##name = std::chrono::high_resolution_clock::now()
#define TIMER_END(name) do { \
    auto _end = std::chrono::high_resolution_clock::now(); \
    auto _duration = std::chrono::duration_cast<std::chrono::milliseconds>(_end - _timer_##name); \
    std::cout << #name << " 耗时: " << _duration.count() << " ms" << std::endl; \
} while(0)

// 使用示例
void processData() {
    TIMER_START(process);
    // 处理代码
    TIMER_END(process);
}
\`\`\`

### 避免基准测试陷阱

\`\`\`cpp
// 陷阱1：编译器优化掉了"无用"代码
int sum = 0;
for (int i = 0; i < 1000000; ++i) {
    sum += i;  // 编译器可能优化掉！
}
// 解决：使用 volatile 或输出结果
std::cout << sum << std::endl;

// 陷阱2：测量了不相关的开销
auto start = std::chrono::high_resolution_clock::now();
std::vector<int> v(1000000);  // 内存分配时间也被计入！
// ... 算法代码
auto end = std::chrono::high_resolution_clock::now();

// 陷阱3：缓存效应
// 第一次运行可能较慢（冷缓存）
// 后续运行较快（热缓存）
\`\`\``,
            examples: [
                {
                    title: '完整的基准测试框架',
                    code: `#include <iostream>
#include <chrono>
#include <vector>
#include <algorithm>
#include <numeric>
#include <cmath>

// 基准测试结果
struct BenchmarkResult {
    double min;
    double max;
    double mean;
    double median;
    double stddev;
};

// 基准测试函数
template<typename Func>
BenchmarkResult benchmark(Func func, int iterations = 100) {
    std::vector<double> times;
    times.reserve(iterations);
    
    // 预热运行
    func();
    
    // 正式测量
    for (int i = 0; i < iterations; ++i) {
        auto start = std::chrono::high_resolution_clock::now();
        func();
        auto end = std::chrono::high_resolution_clock::now();
        
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        times.push_back(static_cast<double>(duration.count()));
    }
    
    // 计算统计量
    std::sort(times.begin(), times.end());
    
    double sum = std::accumulate(times.begin(), times.end(), 0.0);
    double mean = sum / iterations;
    
    double sq_sum = 0;
    for (double t : times) {
        sq_sum += (t - mean) * (t - mean);
    }
    double stddev = std::sqrt(sq_sum / iterations);
    
    return {
        times.front(),
        times.back(),
        mean,
        times[iterations / 2],
        stddev
    };
}

// 打印结果
void printResult(const std::string& name, const BenchmarkResult& result) {
    std::cout << "=== " << name << " ===" << std::endl;
    std::cout << "最小值: " << result.min << " ns" << std::endl;
    std::cout << "最大值: " << result.max << " ns" << std::endl;
    std::cout << "平均值: " << result.mean << " ns" << std::endl;
    std::cout << "中位数: " << result.median << " ns" << std::endl;
    std::cout << "标准差: " << result.stddev << " ns" << std::endl;
    std::cout << std::endl;
}

// 测试函数
void testVectorPush() {
    std::vector<int> v;
    for (int i = 0; i < 1000; ++i) {
        v.push_back(i);
    }
}

void testVectorReserve() {
    std::vector<int> v;
    v.reserve(1000);
    for (int i = 0; i < 1000; ++i) {
        v.push_back(i);
    }
}

int main() {
    std::cout << "性能基准测试示例" << std::endl;
    std::cout << "==================" << std::endl << std::endl;
    
    auto result1 = benchmark(testVectorPush, 50);
    printResult("Vector普通push_back", result1);
    
    auto result2 = benchmark(testVectorReserve, 50);
    printResult("Vector预分配后push_back", result2);
    
    // 计算性能提升
    double improvement = (result1.median - result2.median) / result1.median * 100;
    std::cout << "性能提升: " << improvement << "%" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '比较不同算法的性能',
                    code: `#include <iostream>
#include <chrono>
#include <vector>
#include <algorithm>
#include <random>

// 计时辅助类
class Timer {
private:
    std::chrono::high_resolution_clock::time_point start;
    std::string name;
    
public:
    Timer(const std::string& n) : name(n) {
        start = std::chrono::high_resolution_clock::now();
    }
    
    ~Timer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << name << ": " << duration.count() << " ms" << std::endl;
    }
};

// 生成随机数据
std::vector<int> generateData(size_t size) {
    std::vector<int> data(size);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 1000000);
    
    for (auto& val : data) {
        val = dis(gen);
    }
    return data;
}

// 查找算法比较
int linearSearch(const std::vector<int>& data, int target) {
    for (size_t i = 0; i < data.size(); ++i) {
        if (data[i] == target) return static_cast<int>(i);
    }
    return -1;
}

int binarySearch(const std::vector<int>& data, int target) {
    int left = 0;
    int right = static_cast<int>(data.size()) - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (data[mid] == target) return mid;
        if (data[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    const size_t SIZE = 100000;
    auto data = generateData(SIZE);
    
    // 排序用于二分查找
    {
        Timer t("排序时间");
        std::sort(data.begin(), data.end());
    }
    
    int target = data[SIZE / 2];  // 查找中间元素
    
    // 线性查找
    {
        Timer t("线性查找");
        int result = linearSearch(data, target);
        std::cout << "找到位置: " << result << std::endl;
    }
    
    // 二分查找
    {
        Timer t("二分查找");
        int result = binarySearch(data, target);
        std::cout << "找到位置: " << result << std::endl;
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现性能比较工具',
                description: '创建一个工具，比较不同容器操作的性能。',
                initialCode: `#include <iostream>
#include <chrono>
#include <vector>
#include <list>
#include <set>
#include <random>

// TODO: 实现计时器类
class Timer {
    // TODO: 定义成员变量
    
public:
    // TODO: 构造函数，开始计时
    
    // TODO: stop() 方法，停止计时并返回毫秒数
    
    // TODO: 析构函数，自动打印时间
};

// TODO: 实现生成随机数据的函数
std::vector<int> generateRandomData(size_t size) {
    // 返回包含 size 个随机数的 vector
    return {};
}

// TODO: 实现 benchmark 函数模板
// 接受一个函数和迭代次数，返回平均执行时间（毫秒）
template<typename Func>
double benchmark(Func func, int iterations = 10) {
    return 0.0;
}

int main() {
    const size_t SIZE = 10000;
    
    // TODO: 比较在 vector 和 list 头部插入元素的性能
    
    // TODO: 比较在 vector 和 set 中查找元素的性能
    
    return 0;
}`,
                solution: `#include <iostream>
#include <chrono>
#include <vector>
#include <list>
#include <set>
#include <random>
#include <algorithm>

class Timer {
private:
    std::chrono::high_resolution_clock::time_point start;
    std::string name;
    
public:
    Timer(const std::string& n) : name(n) {
        start = std::chrono::high_resolution_clock::now();
    }
    
    double stop() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        return duration.count();
    }
    
    ~Timer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << name << ": " << duration.count() << " ms" << std::endl;
    }
};

std::vector<int> generateRandomData(size_t size) {
    std::vector<int> data(size);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 1000000);
    
    for (auto& val : data) {
        val = dis(gen);
    }
    return data;
}

template<typename Func>
double benchmark(Func func, int iterations) {
    double totalTime = 0;
    
    for (int i = 0; i < iterations; ++i) {
        auto start = std::chrono::high_resolution_clock::now();
        func();
        auto end = std::chrono::high_resolution_clock::now();
        
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        totalTime += duration.count();
    }
    
    return totalTime / iterations;
}

int main() {
    const size_t SIZE = 10000;
    
    // 比较头部插入性能
    std::cout << "=== 头部插入性能比较 ===" << std::endl;
    
    double vectorTime = benchmark([&]() {
        std::vector<int> v;
        for (size_t i = 0; i < 1000; ++i) {
            v.insert(v.begin(), i);
        }
    }, 10);
    std::cout << "vector: " << vectorTime << " ms" << std::endl;
    
    double listTime = benchmark([&]() {
        std::list<int> l;
        for (size_t i = 0; i < 1000; ++i) {
            l.push_front(i);
        }
    }, 10);
    std::cout << "list: " << listTime << " ms" << std::endl;
    
    // 比较查找性能
    std::cout << "\\n=== 查找性能比较 ===" << std::endl;
    
    auto data = generateRandomData(SIZE);
    int target = data[SIZE / 2];
    
    std::vector<int> vec = data;
    std::set<int> s(data.begin(), data.end());
    
    double vecFindTime = benchmark([&]() {
        auto it = std::find(vec.begin(), vec.end(), target);
    }, 100);
    std::cout << "vector查找: " << vecFindTime << " ms" << std::endl;
    
    double setFindTime = benchmark([&]() {
        auto it = s.find(target);
    }, 100);
    std::cout << "set查找: " << setFindTime << " ms" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '进行性能优化时，正确的顺序是？',
                    options: ['直接修改代码 -> 测试性能', '测量性能 -> 找到瓶颈 -> 优化 -> 验证', '参考别人的优化方案 -> 应用', '使用最快的算法'],
                    correct: 1,
                    explanation: '性能优化的正确流程是：先测量找到瓶颈，然后针对性优化，最后验证优化效果。'
                },
                {
                    question: '使用 chrono 库测量时间时，high_resolution_clock 的特点是？',
                    options: ['精度最低', '精度最高', '只能测量秒', '不可移植'],
                    correct: 1,
                    explanation: 'high_resolution_clock 提供最高精度的时钟，适合用于性能测量。'
                },
                {
                    question: '基准测试时为什么要进行"预热"？',
                    options: ['让CPU预热', '填充缓存，避免冷启动影响', '让编译器优化', '测试稳定性'],
                    correct: 1,
                    explanation: '预热可以让缓存填充数据，避免第一次运行时的冷缓存效应对测量结果的影响。'
                },
                {
                    question: '以下哪个不是基准测试的常见陷阱？',
                    options: ['编译器优化掉无用代码', '测量了不相关的开销', '缓存效应', '使用太多变量'],
                    correct: 3,
                    explanation: '使用太多变量不是基准测试的陷阱。主要陷阱包括编译器优化、测量范围不当、缓存效应等。'
                },
                {
                    question: '为什么基准测试通常使用中位数而不是平均值？',
                    options: ['中位数计算更快', '中位数不受极端值影响', '平均值总是错误的', '编译器要求'],
                    correct: 1,
                    explanation: '中位数对极端值不敏感，更能反映典型性能，而平均值会被极端值拉偏。'
                }
            ],
            references: [
                {
                    title: 'cppreference - chrono',
                    url: 'https://en.cppreference.com/w/cpp/chrono'
                },
                {
                    title: 'Google Benchmark',
                    url: 'https://github.com/google/benchmark'
                }
            ],
            assistantTips: '性能优化的黄金法则：先测量，再优化。不要凭直觉优化，要用数据说话。记住"过早优化是万恶之源"。'
        },
        {
            id: '27.2',
            title: '减少不必要的拷贝与移动',
            duration: '40分钟',
            difficulty: '中级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 减少不必要的拷贝与移动

拷贝和移动操作是C++程序中常见的性能瓶颈。本节学习如何识别和消除不必要的拷贝。

### 拷贝的开销

\`\`\`cpp
#include <string>
#include <vector>

class BigData {
    std::vector<int> data;  // 可能很大
    
public:
    // 拷贝构造函数 - 昂贵的操作
    BigData(const BigData& other) : data(other.data) {
        // 需要分配内存并复制所有元素
    }
    
    // 移动构造函数 - 高效
    BigData(BigData&& other) noexcept : data(std::move(other.data)) {
        // 只需要转移指针，O(1)
    }
};

void process(BigData data) {  // 值传递 - 会拷贝！
    // ...
}

void processRef(const BigData& data) {  // 引用传递 - 无拷贝
    // ...
}
\`\`\`

### 使用引用避免拷贝

\`\`\`cpp
// 不好的做法
void printVector(std::vector<int> v) {  // 拷贝整个vector
    for (int n : v) std::cout << n << " ";
}

// 好的做法
void printVector(const std::vector<int>& v) {  // 无拷贝
    for (int n : v) std::cout << n << " ";
}

// 需要修改时使用非const引用
void modifyVector(std::vector<int>& v) {
    v.push_back(42);
}
\`\`\`

### 移动语义的正确使用

\`\`\`cpp
#include <utility>
#include <string>

std::string getName() {
    return "Hello World";  // 返回值优化(RVO)或移动
}

void processString() {
    std::string s1 = getName();  // RVO或移动，高效
    
    std::string s2;
    s2 = getName();  // 移动赋值
    
    // 不要对返回值使用std::move
    // std::string s3 = std::move(getName());  // 反而可能阻止RVO！
}

// 正确使用std::move的场景
void transferOwnership() {
    std::vector<int> source = {1, 2, 3, 4, 5};
    std::vector<int> dest = std::move(source);  // 移动，source变为空
    
    // source 现在是空的
}
\`\`\`

### 返回值优化 (RVO/NRVO)

\`\`\`cpp
class Widget {
public:
    Widget() { std::cout << "构造\\n"; }
    Widget(const Widget&) { std::cout << "拷贝\\n"; }
    Widget(Widget&&) { std::cout << "移动\\n"; }
};

// RVO (Return Value Optimization)
Widget createWidget() {
    return Widget();  // C++17 保证不拷贝/移动
}

// NRVO (Named RVO)
Widget createWidgetNamed() {
    Widget w;  // 可能被优化，直接在调用者处构造
    return w;
}

void testRVO() {
    auto w1 = createWidget();      // 只调用构造函数
    auto w2 = createWidgetNamed(); // 可能只调用构造函数
}
\`\`\`

### 使用 emplace 替代 push/insert

\`\`\`cpp
#include <vector>
#include <string>

struct Person {
    std::string name;
    int age;
    Person(std::string n, int a) : name(std::move(n)), age(a) {}
};

void testEmplace() {
    std::vector<Person> people;
    
    // push_back - 创建临时对象，然后移动
    people.push_back(Person("Alice", 25));
    
    // emplace_back - 直接在容器中构造，无临时对象
    people.emplace_back("Bob", 30);  // 更高效！
}
\`\`\`

### 字符串视图避免拷贝

\`\`\`cpp
#include <string_view>
#include <string>

// 传统方式 - 可能产生临时string
void processOld(const std::string& s);

// C++17 string_view - 不拥有数据，只是视图
void processNew(std::string_view sv) {
    // 可以接受 const char*, std::string, 字符串字面量
    // 不会产生额外的拷贝
}

void testStringView() {
    std::string s = "Hello";
    processNew(s);           // OK
    processNew("World");     // OK，无需构造临时string
    processNew(s.c_str());   // OK
}
\`\`\`

### 拷贝消除的最佳实践

1. **优先使用引用传递**：对于大对象，使用 \`const T&\`
2. **使用移动语义**：实现移动构造和移动赋值
3. **利用RVO**：信任编译器的返回值优化
4. **使用emplace**：避免创建临时对象
5. **使用string_view**：C++17的字符串视图`,
            examples: [
                {
                    title: '拷贝与移动的性能对比',
                    code: `#include <iostream>
#include <vector>
#include <chrono>
#include <string>

class BigObject {
public:
    std::vector<int> data;
    std::string name;
    
    BigObject(size_t size) : data(size, 42), name("BigObject") {
        std::cout << "构造 BigObject, 大小: " << size << std::endl;
    }
    
    // 拷贝构造
    BigObject(const BigObject& other) 
        : data(other.data), name(other.name) {
        std::cout << "拷贝构造 BigObject" << std::endl;
    }
    
    // 移动构造
    BigObject(BigObject&& other) noexcept
        : data(std::move(other.data)), name(std::move(other.name)) {
        std::cout << "移动构造 BigObject" << std::endl;
    }
    
    // 拷贝赋值
    BigObject& operator=(const BigObject& other) {
        data = other.data;
        name = other.name;
        std::cout << "拷贝赋值 BigObject" << std::endl;
        return *this;
    }
    
    // 移动赋值
    BigObject& operator=(BigObject&& other) noexcept {
        data = std::move(other.data);
        name = std::move(other.name);
        std::cout << "移动赋值 BigObject" << std::endl;
        return *this;
    }
};

// 值传递 - 会拷贝
void processByValue(BigObject obj) {
    std::cout << "处理对象: " << obj.name << std::endl;
}

// const引用 - 无拷贝
void processByRef(const BigObject& obj) {
    std::cout << "处理对象: " << obj.name << std::endl;
}

// 右值引用 - 可以移动
void processByRvalueRef(BigObject&& obj) {
    std::cout << "处理对象: " << obj.name << std::endl;
}

int main() {
    std::cout << "=== 创建对象 ===" << std::endl;
    BigObject obj1(100000);
    
    std::cout << "\\n=== 值传递（拷贝）===" << std::endl;
    processByValue(obj1);
    
    std::cout << "\\n=== const引用传递（无拷贝）===" << std::endl;
    processByRef(obj1);
    
    std::cout << "\\n=== 移动传递 ===" << std::endl;
    BigObject obj2(100000);
    processByRvalueRef(std::move(obj2));
    
    std::cout << "\\n=== 返回值优化 ===" << std::endl;
    auto createBigObject = []() {
        return BigObject(100000);  // RVO
    };
    BigObject obj3 = createBigObject();
    
    std::cout << "\\n=== vector的push_back vs emplace_back ===" << std::endl;
    std::vector<BigObject> vec;
    
    std::cout << "push_back:" << std::endl;
    vec.push_back(BigObject(1000));  // 构造 + 移动
    
    std::cout << "\\nemplace_back:" << std::endl;
    vec.emplace_back(1000);  // 直接构造
    
    return 0;
}`
                },
                {
                    title: 'string_view 减少字符串拷贝',
                    code: `#include <iostream>
#include <string>
#include <string_view>
#include <vector>
#include <chrono>

// 传统方式 - 可能产生string临时对象
std::string getPrefixOld(const std::string& s, size_t n) {
    return s.substr(0, n);  // 创建新string
}

// 使用string_view - 无拷贝
std::string_view getPrefixNew(std::string_view sv, size_t n) {
    return sv.substr(0, n);  // 只返回视图，不拷贝
}

// 演示string_view的灵活性
void processString(std::string_view sv) {
    std::cout << "处理: " << sv << std::endl;
    std::cout << "长度: " << sv.length() << std::endl;
    std::cout << "前3个字符: " << sv.substr(0, 3) << std::endl;
}

int main() {
    std::cout << "=== string_view 基本用法 ===" << std::endl;
    
    // string_view可以接受多种字符串类型
    std::string s = "Hello, World!";
    const char* cstr = "C-string";
    
    processString(s);           // std::string
    processString(cstr);        // const char*
    processString("literal");   // 字符串字面量
    processString(s.c_str());   // C风格字符串
    
    std::cout << "\\n=== 性能对比 ===" << std::endl;
    
    const int ITERATIONS = 1000000;
    std::string longString(1000, 'x');
    
    // 测试传统substr
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string prefix = getPrefixOld(longString, 100);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto oldTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "传统substr: " << oldTime.count() << " ms" << std::endl;
    
    // 测试string_view
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string_view prefix = getPrefixNew(longString, 100);
    }
    end = std::chrono::high_resolution_clock::now();
    auto newTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "string_view: " << newTime.count() << " ms" << std::endl;
    
    std::cout << "\\n=== 注意事项 ===" << std::endl;
    std::cout << "string_view不拥有数据，要注意生命周期！" << std::endl;
    std::cout << "不要返回指向临时数据的string_view" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '优化数据传递',
                description: '优化一个数据处理函数，减少不必要的拷贝。',
                initialCode: `#include <iostream>
#include <vector>
#include <string>
#include <chrono>

struct Record {
    int id;
    std::string name;
    std::vector<double> values;
    
    // TODO: 实现移动构造函数
    // Record(Record&& other) noexcept
    
    // TODO: 实现移动赋值运算符
    // Record& operator=(Record&& other) noexcept
};

// TODO: 优化这个函数，避免不必要的拷贝
// 当前是值传递，会拷贝整个vector
void processRecords(std::vector<Record> records) {
    std::cout << "处理 " << records.size() << " 条记录" << std::endl;
}

// TODO: 实现一个接受右值引用的重载版本
// void processRecords(std::vector<Record>&& records)

// TODO: 实现一个使用string_view的函数
// void printRecordName(/* 参数 */)

int main() {
    // 创建测试数据
    std::vector<Record> records;
    for (int i = 0; i < 100; ++i) {
        Record r;
        r.id = i;
        r.name = "Record_" + std::to_string(i);
        r.values.resize(1000, i * 1.5);
        records.push_back(std::move(r));
    }
    
    // TODO: 测试不同的传递方式
    // 1. 拷贝传递
    // 2. 引用传递
    // 3. 移动传递
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <string_view>

struct Record {
    int id;
    std::string name;
    std::vector<double> values;
    
    Record() : id(0) {}
    
    Record(int i, std::string n, std::vector<double> v)
        : id(i), name(std::move(n)), values(std::move(v)) {}
    
    // 移动构造函数
    Record(Record&& other) noexcept
        : id(other.id), name(std::move(other.name)), values(std::move(other.values)) {
        other.id = 0;
    }
    
    // 移动赋值运算符
    Record& operator=(Record&& other) noexcept {
        if (this != &other) {
            id = other.id;
            name = std::move(other.name);
            values = std::move(other.values);
            other.id = 0;
        }
        return *this;
    }
};

// const引用传递 - 避免拷贝
void processRecords(const std::vector<Record>& records) {
    std::cout << "处理 " << records.size() << " 条记录（引用传递）" << std::endl;
}

// 右值引用版本 - 可以移动
void processRecords(std::vector<Record>&& records) {
    std::cout << "处理 " << records.size() << " 条记录（移动传递）" << std::endl;
    // 可以直接使用records的数据
}

// 使用string_view避免字符串拷贝
void printRecordName(std::string_view name) {
    std::cout << "记录名: " << name << std::endl;
}

int main() {
    // 创建测试数据
    std::vector<Record> records;
    records.reserve(100);
    for (int i = 0; i < 100; ++i) {
        records.emplace_back(
            i,
            "Record_" + std::to_string(i),
            std::vector<double>(1000, i * 1.5)
        );
    }
    
    // 测试引用传递
    processRecords(records);
    
    // 测试移动传递
    std::vector<Record> records2;
    records2.push_back(Record(1, "Test", std::vector<double>(100, 1.0)));
    processRecords(std::move(records2));
    
    // 测试string_view
    Record r(1, "TestRecord", {});
    printRecordName(r.name);
    printRecordName("LiteralString");
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '以下哪种方式可以避免vector参数的拷贝？',
                    options: ['void f(std::vector<int> v)', 'void f(const std::vector<int>& v)', 'void f(std::vector<int>* v)', 'void f(std::vector<int>&& v)'],
                    correct: 1,
                    explanation: '使用const引用传递可以避免拷贝，同时允许传入左值和右值。'
                },
                {
                    question: '关于RVO（返回值优化），以下说法正确的是？',
                    options: ['RVO是编译器可选的优化', 'C++17强制要求RVO', 'RVO只适用于基本类型', 'RVO会调用移动构造函数'],
                    correct: 1,
                    explanation: 'C++17标准要求编译器必须执行RVO（对于返回纯右值的情况），不再依赖编译器优化。'
                },
                {
                    question: 'emplace_back比push_back更高效的原因是？',
                    options: ['emplace_back使用移动语义', 'emplace_back直接在容器中构造对象', 'emplace_back不检查容量', 'emplace_back使用更快的内存分配'],
                    correct: 1,
                    explanation: 'emplace_back直接在容器的内存空间中构造对象，避免了创建临时对象和移动操作。'
                },
                {
                    question: 'std::string_view的主要优势是？',
                    options: ['拥有字符串数据', '可以修改字符串', '避免字符串拷贝', '自动管理内存'],
                    correct: 2,
                    explanation: 'string_view只是一个字符串的视图，不拥有数据，因此可以避免拷贝，但要注意生命周期问题。'
                },
                {
                    question: '以下代码会发生什么？std::string s = std::move(getName());',
                    options: ['更高效的移动', '可能阻止RVO优化', '编译错误', '运行时错误'],
                    correct: 1,
                    explanation: '对返回值使用std::move可能阻止编译器的RVO优化，反而降低性能。应该直接写 auto s = getName();'
                }
            ],
            references: [
                {
                    title: 'cppreference - Move semantics',
                    url: 'https://en.cppreference.com/w/cpp/utility/move'
                },
                {
                    title: 'cppreference - string_view',
                    url: 'https://en.cppreference.com/w/cpp/string/basic_string_view'
                }
            ],
            assistantTips: '减少拷贝是性能优化的重要手段。记住：传大对象用引用，需要所有权转移用移动，构造对象用emplace，字符串操作考虑string_view。'
        },
        {
            id: '27.3',
            title: '对象存储与缓存友好',
            duration: '45分钟',
            difficulty: '高级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 对象存储与缓存友好

现代CPU的性能瓶颈往往是内存访问速度。本节学习如何设计缓存友好的数据结构和算法。

### CPU缓存基础

\`\`\`cpp
// CPU缓存层次结构（典型值）
// L1 Cache: 32-64 KB, 延迟 ~1-4 周期
// L2 Cache: 256 KB - 1 MB, 延迟 ~10-20 周期
// L3 Cache: 4-64 MB, 延迟 ~40-60 周期
// 主内存: 延迟 ~100-300 周期

// 缓存行大小通常是 64 字节
constexpr size_t CACHE_LINE_SIZE = 64;
\`\`\`

### 数据局部性原则

\`\`\`cpp
#include <vector>
#include <iostream>

// 好的例子：连续内存访问
void processVector(const std::vector<int>& data) {
    int sum = 0;
    for (int n : data) {  // 顺序访问，缓存友好
        sum += n;
    }
}

// 不好的例子：随机访问
void processRandom(const std::vector<int>& data, const std::vector<size_t>& indices) {
    int sum = 0;
    for (size_t idx : indices) {  // 随机访问，缓存不友好
        sum += data[idx];
    }
}
\`\`\`

### 结构体布局优化

\`\`\`cpp
// 不好的布局：缓存不友好
struct BadParticle {
    double x, y, z;      // 位置
    double vx, vy, vz;   // 速度
    double r, g, b;      // 颜色
    double mass;         // 质量
};

// 如果只需要更新位置，会加载不必要的数据到缓存

// 好的布局：数据导向设计（DOD）
struct GoodParticles {
    std::vector<double> x, y, z;      // 位置
    std::vector<double> vx, vy, vz;   // 速度
    std::vector<double> r, g, b;      // 颜色
    std::vector<double> mass;         // 质量
};

// 更新位置时，只加载位置数据到缓存
void updatePositions(GoodParticles& p, double dt) {
    for (size_t i = 0; i < p.x.size(); ++i) {
        p.x[i] += p.vx[i] * dt;
        p.y[i] += p.vy[i] * dt;
        p.z[i] += p.vz[i] * dt;
    }
}
\`\`\`

### 避免伪共享（False Sharing）

\`\`\`cpp
#include <thread>
#include <vector>

// 伪共享问题
struct BadCounter {
    int count1;  // 可能在同一缓存行
    int count2;  // 导致伪共享
};

// 解决方案：对齐到缓存行
struct alignas(64) GoodCounter {
    int count1;
    char padding[60];  // 填充到64字节
    int count2;
};

// 或使用C++17的硬件破坏性干扰大小
struct alignas(std::hardware_destructive_interference_size) AlignedCounter {
    int count1;
    int count2;
};
\`\`\`

### 数组 vs 链表

\`\`\`cpp
#include <vector>
#include <list>

// 数组：缓存友好
std::vector<int> vec = {1, 2, 3, 4, 5};
// 内存连续，预取有效

// 链表：缓存不友好
std::list<int> lst = {1, 2, 3, 4, 5};
// 每个节点可能在不同内存位置
// 每次访问都可能缓存未命中

// 建议：优先使用vector，即使需要中间插入
// 对于小数据，vector的移动开销可能小于链表的缓存未命中
\`\`\`

### 矩阵存储顺序

\`\`\`cpp
#include <vector>

// 行优先存储（C/C++默认）
void processRowMajor(const std::vector<std::vector<int>>& matrix) {
    for (size_t i = 0; i < matrix.size(); ++i) {
        for (size_t j = 0; j < matrix[i].size(); ++j) {
            // matrix[i][j] - 缓存友好
        }
    }
}

// 列优先访问（缓存不友好）
void processColumnMajor(const std::vector<std::vector<int>>& matrix) {
    for (size_t j = 0; j < matrix[0].size(); ++j) {
        for (size_t i = 0; i < matrix.size(); ++i) {
            // matrix[i][j] - 每次访问可能缓存未命中
        }
    }
}
\`\`\`

### 内存预取

\`\`\`cpp
#include <vector>

// 手动预取（编译器通常会自动优化）
void prefetchExample(const std::vector<int>& data) {
    for (size_t i = 0; i < data.size(); ++i) {
        // 预取后面的数据
        if (i + 8 < data.size()) {
            __builtin_prefetch(&data[i + 8]);
        }
        // 处理当前数据
        int value = data[i];
    }
}
\`\`\``,
            examples: [
                {
                    title: '缓存友好的数据布局',
                    code: `#include <iostream>
#include <vector>
#include <chrono>
#include <random>

// 传统面向对象设计
struct ParticleOO {
    double x, y, z;
    double vx, vy, vz;
    double mass;
    double r, g, b;
};

// 数据导向设计
struct ParticleDOD {
    std::vector<double> x, y, z;
    std::vector<double> vx, vy, vz;
    std::vector<double> mass;
    std::vector<double> r, g, b;
    
    void resize(size_t n) {
        x.resize(n);
        y.resize(n);
        z.resize(n);
        vx.resize(n);
        vy.resize(n);
        vz.resize(n);
        mass.resize(n);
        r.resize(n);
        g.resize(n);
        b.resize(n);
    }
};

// 更新位置 - OO版本
void updateOO(std::vector<ParticleOO>& particles, double dt) {
    for (auto& p : particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
    }
}

// 更新位置 - DOD版本
void updateDOD(ParticleDOD& particles, double dt) {
    for (size_t i = 0; i < particles.x.size(); ++i) {
        particles.x[i] += particles.vx[i] * dt;
        particles.y[i] += particles.vy[i] * dt;
        particles.z[i] += particles.vz[i] * dt;
    }
}

int main() {
    const size_t N = 1000000;
    const int ITERATIONS = 100;
    
    // 准备数据
    std::vector<ParticleOO> particlesOO(N);
    ParticleDOD particlesDOD;
    particlesDOD.resize(N);
    
    // 初始化
    for (size_t i = 0; i < N; ++i) {
        particlesOO[i] = {double(i), double(i), double(i), 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0};
        particlesDOD.x[i] = particlesDOD.y[i] = particlesDOD.z[i] = double(i);
        particlesDOD.vx[i] = particlesDOD.vy[i] = particlesDOD.vz[i] = 1.0;
    }
    
    // 测试OO版本
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        updateOO(particlesOO, 0.1);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto ooTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试DOD版本
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        updateDOD(particlesDOD, 0.1);
    }
    end = std::chrono::high_resolution_clock::now();
    auto dodTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "粒子数量: " << N << std::endl;
    std::cout << "迭代次数: " << ITERATIONS << std::endl;
    std::cout << "OO版本: " << ooTime.count() << " ms" << std::endl;
    std::cout << "DOD版本: " << dodTime.count() << " ms" << std::endl;
    std::cout << "DOD快 " << (double)ooTime.count() / dodTime.count() << " 倍" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '矩阵遍历顺序的影响',
                    code: `#include <iostream>
#include <vector>
#include <chrono>

int main() {
    const size_t ROWS = 4000;
    const size_t COLS = 4000;
    
    // 创建矩阵
    std::vector<std::vector<int>> matrix(ROWS, std::vector<int>(COLS, 1));
    
    // 行优先遍历（缓存友好）
    auto start = std::chrono::high_resolution_clock::now();
    long long sum1 = 0;
    for (size_t i = 0; i < ROWS; ++i) {
        for (size_t j = 0; j < COLS; ++j) {
            sum1 += matrix[i][j];
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto rowMajorTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 列优先遍历（缓存不友好）
    start = std::chrono::high_resolution_clock::now();
    long long sum2 = 0;
    for (size_t j = 0; j < COLS; ++j) {
        for (size_t i = 0; i < ROWS; ++i) {
            sum2 += matrix[i][j];
        }
    }
    end = std::chrono::high_resolution_clock::now();
    auto colMajorTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "矩阵大小: " << ROWS << " x " << COLS << std::endl;
    std::cout << "行优先遍历: " << rowMajorTime.count() << " ms" << std::endl;
    std::cout << "列优先遍历: " << colMajorTime.count() << " ms" << std::endl;
    std::cout << "行优先快 " << (double)colMajorTime.count() / rowMajorTime.count() << " 倍" << std::endl;
    
    std::cout << "Sum1 = " << sum1 << ", Sum2 = " << sum2 << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '优化数据结构以提高缓存命中率',
                description: '将面向对象的数据结构转换为数据导向设计。',
                initialCode: `#include <iostream>
#include <vector>
#include <chrono>

// TODO: 传统面向对象设计
struct Entity {
    int id;
    double health;
    double x, y, z;
    double attack;
    double defense;
};

// TODO: 数据导向设计
struct EntitySystem {
    // 将数据按类型分开存储
    // std::vector<int> ids;
    // ...
};

// TODO: 实现更新位置的函数 - OO版本
void updatePositionsOO(std::vector<Entity>& entities, double dt) {
}

// TODO: 实现更新位置的函数 - DOD版本
void updatePositionsDOD(EntitySystem& system, double dt) {
}

int main() {
    const size_t N = 100000;
    
    // TODO: 创建测试数据并比较性能
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <chrono>

// 传统面向对象设计
struct Entity {
    int id;
    double health;
    double x, y, z;
    double attack;
    double defense;
};

// 数据导向设计
struct EntitySystem {
    std::vector<int> ids;
    std::vector<double> health;
    std::vector<double> x, y, z;
    std::vector<double> attack;
    std::vector<double> defense;
    
    void resize(size_t n) {
        ids.resize(n);
        health.resize(n);
        x.resize(n); y.resize(n); z.resize(n);
        attack.resize(n);
        defense.resize(n);
    }
};

// 更新位置 - OO版本
void updatePositionsOO(std::vector<Entity>& entities, double dt) {
    for (auto& e : entities) {
        e.x += dt;
        e.y += dt;
        e.z += dt;
    }
}

// 更新位置 - DOD版本
void updatePositionsDOD(EntitySystem& system, double dt) {
    for (size_t i = 0; i < system.x.size(); ++i) {
        system.x[i] += dt;
        system.y[i] += dt;
        system.z[i] += dt;
    }
}

int main() {
    const size_t N = 100000;
    const int ITERATIONS = 1000;
    
    // 准备OO数据
    std::vector<Entity> entitiesOO(N);
    for (size_t i = 0; i < N; ++i) {
        entitiesOO[i] = {int(i), 100.0, 0.0, 0.0, 0.0, 10.0, 5.0};
    }
    
    // 准备DOD数据
    EntitySystem system;
    system.resize(N);
    for (size_t i = 0; i < N; ++i) {
        system.ids[i] = i;
        system.health[i] = 100.0;
        system.x[i] = system.y[i] = system.z[i] = 0.0;
        system.attack[i] = 10.0;
        system.defense[i] = 5.0;
    }
    
    // 测试OO版本
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        updatePositionsOO(entitiesOO, 0.1);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto ooTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试DOD版本
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        updatePositionsDOD(system, 0.1);
    }
    end = std::chrono::high_resolution_clock::now();
    auto dodTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "实体数量: " << N << std::endl;
    std::cout << "迭代次数: " << ITERATIONS << std::endl;
    std::cout << "OO版本: " << ooTime.count() << " ms" << std::endl;
    std::cout << "DOD版本: " << dodTime.count() << " ms" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'CPU缓存访问速度比主内存快多少？',
                    options: ['约2倍', '约10倍', '约100倍', '约1000倍'],
                    correct: 2,
                    explanation: 'L1缓存访问延迟约1-4周期，主内存约100-300周期，差距约100倍。'
                },
                {
                    question: '什么是伪共享（False Sharing）？',
                    options: ['多个线程共享同一数据', '不同变量位于同一缓存行导致的竞争', '缓存数据过期', '内存泄漏'],
                    correct: 1,
                    explanation: '伪共享是指不同线程访问的不同变量恰好位于同一缓存行，导致缓存频繁失效。'
                },
                {
                    question: '数据导向设计（DOD）的主要目的是？',
                    options: ['简化代码', '提高缓存命中率', '减少内存使用', '提高可读性'],
                    correct: 1,
                    explanation: 'DOD将相关数据连续存储，提高缓存命中率，从而提升性能。'
                },
                {
                    question: '对于C/C++中的二维数组，哪种遍历顺序更缓存友好？',
                    options: ['列优先', '行优先', '随机访问', '没有区别'],
                    correct: 1,
                    explanation: 'C/C++使用行优先存储，行优先遍历时数据在内存中连续，缓存命中率高。'
                },
                {
                    question: '为什么vector通常比list更高效？',
                    options: ['vector使用更少内存', 'vector的内存连续，缓存友好', 'list有额外的指针开销', 'vector支持随机访问'],
                    correct: 1,
                    explanation: 'vector的内存连续性使得CPU可以高效预取数据，缓存命中率高，这是最主要的优势。'
                }
            ],
            references: [
                {
                    title: 'What Every Programmer Should Know About Memory',
                    url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf'
                },
                {
                    title: 'Data-Oriented Design',
                    url: 'https://www.dataorienteddesign.com/dodbook/'
                }
            ],
            assistantTips: '缓存优化是性能优化的关键。记住：数据连续存储、顺序访问、避免伪共享。对于大量数据，考虑数据导向设计。'
        },
        {
            id: '27.4',
            title: '虚函数的开销与去虚拟化',
            duration: '35分钟',
            difficulty: '高级',
            xp: 170,
            estimatedXp: 340,
            concepts: `## 虚函数的开销与去虚拟化

虚函数提供了运行时多态，但也带来了一定的性能开销。本节分析虚函数的开销及优化方法。

### 虚函数的工作原理

\`\`\`cpp
class Base {
public:
    virtual void foo() { }
    virtual void bar() { }
};

class Derived : public Base {
public:
    void foo() override { }
    void bar() override { }
};

// 编译器为每个有虚函数的类创建虚函数表（vtable）
// 每个对象包含一个指向vtable的指针（vptr）

// 虚函数调用的开销：
// 1. 加载vptr
// 2. 从vtable中查找函数地址
// 3. 间接跳转到函数
\`\`\`

### 虚函数的开销分析

\`\`\`cpp
#include <iostream>
#include <chrono>
#include <vector>

// 非虚函数版本
class Concrete {
public:
    void process() { value++; }
private:
    int value = 0;
};

// 虚函数版本
class Base {
public:
    virtual void process() { value++; }
    virtual ~Base() = default;
protected:
    int value = 0;
};

class Derived : public Base {
public:
    void process() override { value += 2; }
};

// 性能测试
void testConcrete() {
    std::vector<Concrete> objects(1000000);
    for (auto& obj : objects) {
        obj.process();
    }
}

void testVirtual() {
    std::vector<Base*> objects(1000000);
    for (auto& ptr : objects) {
        ptr = new Derived();
    }
    for (auto ptr : objects) {
        ptr->process();  // 虚函数调用
    }
    for (auto ptr : objects) {
        delete ptr;
    }
}
\`\`\`

### 编译器去虚拟化

编译器有时可以自动优化虚函数调用：

\`\`\`cpp
class Base {
public:
    virtual void foo() { }
};

class Derived : public Base {
public:
    void foo() override { }
};

void test1(Base* b) {
    b->foo();  // 可能无法去虚拟化
}

void test2() {
    Derived d;
    d.foo();  // 编译器知道确切类型，可以内联！
}

void test3(Base* b) {
    if (Derived* d = dynamic_cast<Derived*>(b)) {
        d->foo();  // 显式转换后可以内联
    }
}

// final关键字帮助去虚拟化
class FinalDerived final : public Base {
public:
    void foo() override { }
};

void test4(Base* b) {
    // 如果编译器能证明b指向FinalDerived
    // 则可以内联，因为没有更多派生类
    b->foo();
}
\`\`\`

### 使用 final 关键字

\`\`\`cpp
// 在类上使用final
class FinalClass final : public Base {
    void foo() override { }
};

// 在虚函数上使用final
class SomeClass : public Base {
    void foo() override final { }  // 不能再被覆盖
};
\`\`\`

### 替代虚函数的设计

\`\`\`cpp
#include <variant>
#include <vector>

// 方案1：使用std::variant（C++17）
struct Circle { double radius; };
struct Square { double side; };
struct Triangle { double base, height; };

using Shape = std::variant<Circle, Square, Triangle>;

double area(const Shape& s) {
    return std::visit([](const auto& shape) {
        using T = std::decay_t<decltype(shape)>;
        if constexpr (std::is_same_v<T, Circle>) {
            return 3.14159 * shape.radius * shape.radius;
        } else if constexpr (std::is_same_v<T, Square>) {
            return shape.side * shape.side;
        } else {
            return 0.5 * shape.base * shape.height;
        }
    }, s);
}

// 方案2：使用函数指针或std::function
struct FastObject {
    void (*process)(FastObject*);
    int data;
};

// 方案3：手动实现多态（CRTP）
template<typename Derived>
class CRTPBase {
public:
    void process() {
        static_cast<Derived*>(this)->processImpl();
    }
};

class CRTPDerived : public CRTPBase<CRTPDerived> {
public:
    void processImpl() { }
};
\`\`\`

### 内联缓存

\`\`\`cpp
// 对于虚函数调用，如果类型在运行时稳定
// 可以缓存上次调用的结果

class OptimizedCall {
    Base* lastObject = nullptr;
    void (*lastFunc)(Base*) = nullptr;
    
public:
    void call(Base* obj) {
        if (obj == lastObject) {
            // 同一对象，直接调用缓存的函数
            lastFunc(obj);
        } else {
            // 虚函数调用并缓存
            obj->foo();
            // lastFunc = ...; // 需要额外机制获取
            lastObject = obj;
        }
    }
};
\`\`\``,
            examples: [
                {
                    title: '虚函数与非虚函数性能对比',
                    code: `#include <iostream>
#include <vector>
#include <chrono>
#include <memory>

// 非虚函数版本
class FastProcessor {
public:
    void process(int& value) {
        value = value * 2 + 1;
    }
};

// 虚函数版本
class ProcessorBase {
public:
    virtual void process(int& value) {
        value = value * 2 + 1;
    }
    virtual ~ProcessorBase() = default;
};

class ProcessorA : public ProcessorBase {
public:
    void process(int& value) override {
        value = value * 2 + 1;
    }
};

class ProcessorB : public ProcessorBase {
public:
    void process(int& value) override {
        value = value * 3 + 2;
    }
};

int main() {
    const size_t N = 10000000;
    
    // 测试非虚函数
    std::vector<FastProcessor> fastProcs(10);
    std::vector<int> data1(N, 1);
    
    auto start = std::chrono::high_resolution_clock::now();
    for (auto& proc : fastProcs) {
        for (auto& val : data1) {
            proc.process(val);
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto fastTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试虚函数
    std::vector<std::unique_ptr<ProcessorBase>> procs;
    for (int i = 0; i < 10; ++i) {
        procs.push_back(std::make_unique<ProcessorA>());
    }
    std::vector<int> data2(N, 1);
    
    start = std::chrono::high_resolution_clock::now();
    for (auto& proc : procs) {
        for (auto& val : data2) {
            proc->process(val);
        }
    }
    end = std::chrono::high_resolution_clock::now();
    auto virtualTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "迭代次数: " << N << std::endl;
    std::cout << "非虚函数: " << fastTime.count() << " ms" << std::endl;
    std::cout << "虚函数: " << virtualTime.count() << " ms" << std::endl;
    std::cout << "虚函数慢 " << (double)virtualTime.count() / fastTime.count() << " 倍" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '使用std::variant替代虚函数',
                    code: `#include <iostream>
#include <variant>
#include <vector>
#include <chrono>

// 传统虚函数方式
class ShapeBase {
public:
    virtual double area() const = 0;
    virtual ~ShapeBase() = default;
};

class Circle : public ShapeBase {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};

class Rectangle : public ShapeBase {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
};

// std::variant方式
struct CircleV { double radius; };
struct RectangleV { double width, height; };

using ShapeV = std::variant<CircleV, RectangleV>;

double areaV(const ShapeV& shape) {
    return std::visit([](const auto& s) -> double {
        using T = std::decay_t<decltype(s)>;
        if constexpr (std::is_same_v<T, CircleV>) {
            return 3.14159 * s.radius * s.radius;
        } else {
            return s.width * s.height;
        }
    }, shape);
}

int main() {
    const size_t N = 1000000;
    
    // 测试虚函数
    std::vector<std::unique_ptr<ShapeBase>> shapes1;
    for (size_t i = 0; i < N; ++i) {
        if (i % 2 == 0) {
            shapes1.push_back(std::make_unique<Circle>(2.0));
        } else {
            shapes1.push_back(std::make_unique<Rectangle>(2.0, 3.0));
        }
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    double total1 = 0;
    for (const auto& s : shapes1) {
        total1 += s->area();
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto virtualTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试variant
    std::vector<ShapeV> shapes2;
    for (size_t i = 0; i < N; ++i) {
        if (i % 2 == 0) {
            shapes2.push_back(CircleV{2.0});
        } else {
            shapes2.push_back(RectangleV{2.0, 3.0});
        }
    }
    
    start = std::chrono::high_resolution_clock::now();
    double total2 = 0;
    for (const auto& s : shapes2) {
        total2 += areaV(s);
    }
    end = std::chrono::high_resolution_clock::now();
    auto variantTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "形状数量: " << N << std::endl;
    std::cout << "虚函数: " << virtualTime.count() << " ms" << std::endl;
    std::cout << "variant: " << variantTime.count() << " ms" << std::endl;
    std::cout << "Total1: " << total1 << ", Total2: " << total2 << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '优化虚函数调用',
                description: '使用CRTP模式替代虚函数实现静态多态。',
                initialCode: `#include <iostream>
#include <vector>
#include <chrono>

// TODO: 实现CRTP基类
template<typename Derived>
class Shape {
public:
    // TODO: 实现调用派生类方法的接口
    // double area() const { return static_cast<const Derived*>(this)->areaImpl(); }
};

// TODO: 实现Circle类
// class Circle : public Shape<Circle> { ... };

// TODO: 实现Rectangle类
// class Rectangle : public Shape<Rectangle> { ... };

// TODO: 实现一个可以处理不同Shape的函数模板
// template<typename T>
// double totalArea(const std::vector<T>& shapes)

int main() {
    // TODO: 创建测试数据并比较性能
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <chrono>

// CRTP基类
template<typename Derived>
class Shape {
public:
    double area() const {
        return static_cast<const Derived*>(this)->areaImpl();
    }
};

// Circle类
class Circle : public Shape<Circle> {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double areaImpl() const { return 3.14159 * radius * radius; }
};

// Rectangle类
class Rectangle : public Shape<Rectangle> {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double areaImpl() const { return width * height; }
};

// 计算总面积（模板版本）
template<typename T>
double totalArea(const std::vector<T>& shapes) {
    double total = 0;
    for (const auto& s : shapes) {
        total += s.area();
    }
    return total;
}

int main() {
    const size_t N = 1000000;
    
    // 测试Circle
    std::vector<Circle> circles;
    circles.reserve(N);
    for (size_t i = 0; i < N; ++i) {
        circles.emplace_back(2.0);
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    double total1 = totalArea(circles);
    auto end = std::chrono::high_resolution_clock::now();
    auto circleTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试Rectangle
    std::vector<Rectangle> rectangles;
    rectangles.reserve(N);
    for (size_t i = 0; i < N; ++i) {
        rectangles.emplace_back(2.0, 3.0);
    }
    
    start = std::chrono::high_resolution_clock::now();
    double total2 = totalArea(rectangles);
    end = std::chrono::high_resolution_clock::now();
    auto rectTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "形状数量: " << N << std::endl;
    std::cout << "Circle: " << circleTime.count() << " ms, 总面积: " << total1 << std::endl;
    std::cout << "Rectangle: " << rectTime.count() << " ms, 总面积: " << total2 << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '虚函数调用的主要开销是？',
                    options: ['内存分配', '间接调用和无法内联', '参数传递', '返回值处理'],
                    correct: 1,
                    explanation: '虚函数需要通过vtable间接调用，且编译器通常无法内联，这是主要开销。'
                },
                {
                    question: '使用final关键字可以帮助编译器做什么？',
                    options: ['减少内存使用', '去虚拟化', '加快编译速度', '减少代码大小'],
                    correct: 1,
                    explanation: 'final告诉编译器该类或函数不能被继承/覆盖，编译器可以进行去虚拟化优化。'
                },
                {
                    question: 'CRTP（奇异递归模板模式）的主要优势是？',
                    options: ['代码更简洁', '静态多态，无虚函数开销', '支持运行时类型判断', '减少内存使用'],
                    correct: 1,
                    explanation: 'CRTP在编译时确定类型，避免了虚函数的运行时开销，同时保持了多态性。'
                },
                {
                    question: 'std::variant相比虚函数的优势是？',
                    options: ['支持更多类型', '值语义，缓存友好', '可以动态添加类型', '语法更简单'],
                    correct: 1,
                    explanation: 'variant使用值语义，对象连续存储，缓存友好，且编译器可以优化visit调用。'
                },
                {
                    question: '以下哪种情况编译器最可能对虚函数进行去虚拟化？',
                    options: ['通过基类指针调用', '在派生类对象上直接调用', '通过基类引用调用', '在构造函数中调用'],
                    correct: 1,
                    explanation: '当编译器能确定对象的实际类型时（如直接在派生类对象上调用），可以进行去虚拟化。'
                }
            ],
            references: [
                {
                    title: 'Virtual Functions and Performance',
                    url: 'https://www.modernescpp.com/index.php/c-core-guidelines-the-performance-concerns-of-virtual-functions'
                },
                {
                    title: 'CRTP Idiom',
                    url: 'https://en.cppreference.com/w/cpp/language/crtp'
                }
            ],
            assistantTips: '虚函数的开销通常不大，不要过早优化。但在性能关键路径，考虑使用final、CRTP或variant来避免虚函数开销。'
        },
        {
            id: '27.5',
            title: '字符串优化（SSO）',
            duration: '30分钟',
            difficulty: '中级',
            xp: 150,
            estimatedXp: 300,
            concepts: `## 字符串优化（SSO）

SSO（Small String Optimization）是std::string的重要优化技术。本节学习其原理和应用。

### SSO 原理

\`\`\`cpp
#include <string>

// std::string通常有两种存储模式：
// 1. 短字符串：直接存储在对象内部（无堆分配）
// 2. 长字符串：存储在堆上

// 典型实现（简化版）
class MyString {
    union {
        char small[16];      // 短字符串缓冲区
        struct {
            char* ptr;       // 堆指针
            size_t capacity; // 容量
        } large;
    };
    size_t size;
    bool isSmall;  // 是否使用短字符串优化
};

// SSO阈值因实现而异：
// - GCC: 15字节
// - Clang: 22字节
// - MSVC: 15字节
\`\`\`

### SSO 的好处

\`\`\`cpp
#include <iostream>
#include <string>

void demonstrateSSO() {
    // 短字符串 - 无堆分配
    std::string s1 = "Hello";  // 存储在对象内部
    
    // 长字符串 - 堆分配
    std::string s2 = "This is a very long string that exceeds SSO threshold";
    
    std::cout << "sizeof(std::string): " << sizeof(std::string) << std::endl;
    // 通常是 24-32 字节
}
\`\`\`

### 字符串性能优化技巧

\`\`\`cpp
#include <string>
#include <vector>

// 1. 预分配容量
std::string buildString() {
    std::string result;
    result.reserve(100);  // 预分配，避免多次重新分配
    for (int i = 0; i < 10; ++i) {
        result += "value_";
    }
    return result;
}

// 2. 使用append代替+=（对于多个追加）
std::string concat() {
    std::string result;
    result.reserve(100);
    result.append("Hello").append(" ").append("World");
    return result;
}

// 3. 避免不必要的拷贝
void process(const std::string& s);  // 使用引用

// 4. 使用string_view（C++17）
void processView(std::string_view sv);  // 避免拷贝

// 5. 移动语义
std::string createString() {
    return "Hello";  // RVO或移动
}

void useString() {
    std::string s = createString();  // 高效
}
\`\`\`

### 字符串拼接优化

\`\`\`cpp
#include <string>
#include <sstream>
#include <vector>

// 不好的方式：多次+=
std::string badConcat(const std::vector<std::string>& parts) {
    std::string result;
    for (const auto& p : parts) {
        result += p;  // 可能多次重新分配
    }
    return result;
}

// 好的方式1：预计算大小
std::string goodConcat1(const std::vector<std::string>& parts) {
    size_t totalSize = 0;
    for (const auto& p : parts) {
        totalSize += p.size();
    }
    
    std::string result;
    result.reserve(totalSize);
    for (const auto& p : parts) {
        result += p;
    }
    return result;
}

// 好的方式2：使用ostringstream（适合复杂格式）
std::string goodConcat2(const std::vector<std::string>& parts) {
    std::ostringstream oss;
    for (const auto& p : parts) {
        oss << p;
    }
    return oss.str();
}
\`\`\`

### 字符串视图（string_view）

\`\`\`cpp
#include <string_view>
#include <string>

// string_view 不拥有数据，只是视图
void processView(std::string_view sv) {
    // 可以进行各种字符串操作
    auto pos = sv.find(':');
    if (pos != std::string_view::npos) {
        std::string_view key = sv.substr(0, pos);
        std::string_view value = sv.substr(pos + 1);
        // 无拷贝分割
    }
}

// 解析配置行的例子
void parseConfig(std::string_view line) {
    // 去除空白
    while (!line.empty() && std::isspace(line.front())) {
        line.remove_prefix(1);
    }
    while (!line.empty() && std::isspace(line.back())) {
        line.remove_suffix(1);
    }
    
    // 解析键值对
    auto pos = line.find('=');
    if (pos != std::string_view::npos) {
        std::string_view key = line.substr(0, pos);
        std::string_view value = line.substr(pos + 1);
        // 无拷贝解析
    }
}
\`\`\`

### 避免字符串转换

\`\`\`cpp
#include <string>
#include <string_view>

// 避免在string和string_view之间频繁转换
void badExample() {
    std::string s = "Hello";
    std::string_view sv = s;  // OK
    std::string s2 = sv;      // 拷贝！
    std::string_view sv2 = s2; // OK
}

// 好的做法：统一使用string_view作为接口
void goodExample(std::string_view sv) {
    // 接受string、const char*、string_view
}
\`\`\``,
            examples: [
                {
                    title: 'SSO演示与性能测试',
                    code: `#include <iostream>
#include <string>
#include <chrono>
#include <vector>

// 检查字符串是否使用SSO
bool usesSSO(const std::string& s) {
    // 通过比较容量判断是否使用SSO
    // 这是一个简化判断，实际实现可能不同
    return s.capacity() <= sizeof(std::string);
}

int main() {
    std::cout << "sizeof(std::string): " << sizeof(std::string) << " bytes" << std::endl;
    
    // 测试SSO阈值
    std::cout << "\\n=== SSO阈值测试 ===" << std::endl;
    for (int len = 1; len <= 30; ++len) {
        std::string s(len, 'x');
        std::cout << "长度 " << len << ": capacity=" << s.capacity() 
                  << ", SSO=" << (usesSSO(s) ? "是" : "否") << std::endl;
    }
    
    // 性能测试：短字符串 vs 长字符串
    std::cout << "\\n=== 性能测试 ===" << std::endl;
    const int ITERATIONS = 10000000;
    
    // 短字符串（SSO）
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string s = "Hello";  // SSO
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto shortTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 长字符串（堆分配）
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string s = "This is a very long string that needs heap allocation";
    }
    end = std::chrono::high_resolution_clock::now();
    auto longTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "短字符串(SSO): " << shortTime.count() << " ms" << std::endl;
    std::cout << "长字符串(堆): " << longTime.count() << " ms" << std::endl;
    std::cout << "SSO快 " << (double)longTime.count() / shortTime.count() << " 倍" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '字符串拼接优化',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <sstream>

// 方式1：直接+=
std::string concatDirect(const std::vector<std::string>& parts) {
    std::string result;
    for (const auto& p : parts) {
        result += p;
    }
    return result;
}

// 方式2：预分配
std::string concatReserve(const std::vector<std::string>& parts) {
    size_t total = 0;
    for (const auto& p : parts) {
        total += p.size();
    }
    
    std::string result;
    result.reserve(total);
    for (const auto& p : parts) {
        result += p;
    }
    return result;
}

// 方式3：ostringstream
std::string concatStream(const std::vector<std::string>& parts) {
    std::ostringstream oss;
    for (const auto& p : parts) {
        oss << p;
    }
    return oss.str();
}

int main() {
    // 准备测试数据
    std::vector<std::string> parts;
    for (int i = 0; i < 1000; ++i) {
        parts.push_back("Part_" + std::to_string(i) + "_");
    }
    
    const int ITERATIONS = 1000;
    
    // 测试直接+=
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string result = concatDirect(parts);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto directTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试预分配
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string result = concatReserve(parts);
    }
    end = std::chrono::high_resolution_clock::now();
    auto reserveTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // 测试ostringstream
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        std::string result = concatStream(parts);
    }
    end = std::chrono::high_resolution_clock::now();
    auto streamTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "字符串数量: " << parts.size() << std::endl;
    std::cout << "迭代次数: " << ITERATIONS << std::endl;
    std::cout << "直接+=: " << directTime.count() << " ms" << std::endl;
    std::cout << "预分配: " << reserveTime.count() << " ms" << std::endl;
    std::cout << "ostringstream: " << streamTime.count() << " ms" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '优化字符串处理函数',
                description: '优化一个字符串分割和拼接函数。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <string_view>

// TODO: 实现高效的字符串分割函数
// 使用string_view避免拷贝
std::vector<std::string_view> split(std::string_view str, char delimiter) {
    std::vector<std::string_view> result;
    // TODO: 实现分割逻辑
    return result;
}

// TODO: 实现高效的字符串拼接函数
// 预计算总大小，一次性分配
std::string join(const std::vector<std::string>& parts, std::string_view delimiter) {
    // TODO: 实现拼接逻辑
    return "";
}

// TODO: 实现字符串trim函数
// 使用string_view，返回新string
std::string trim(std::string_view str) {
    // TODO: 去除首尾空白
    return std::string(str);
}

int main() {
    // 测试split
    std::string test = "apple,banana,cherry,date";
    auto parts = split(test, ',');
    std::cout << "分割结果:" << std::endl;
    for (auto p : parts) {
        std::cout << "  [" << p << "]" << std::endl;
    }
    
    // 测试join
    std::vector<std::string> words = {"Hello", "World", "C++"};
    std::cout << "\\n拼接结果: " << join(words, " ") << std::endl;
    
    // 测试trim
    std::cout << "\\nTrim测试: [" << trim("  hello world  ") << "]" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>
#include <vector>
#include <string_view>

std::vector<std::string_view> split(std::string_view str, char delimiter) {
    std::vector<std::string_view> result;
    size_t start = 0;
    
    for (size_t i = 0; i < str.size(); ++i) {
        if (str[i] == delimiter) {
            result.push_back(str.substr(start, i - start));
            start = i + 1;
        }
    }
    result.push_back(str.substr(start));
    
    return result;
}

std::string join(const std::vector<std::string>& parts, std::string_view delimiter) {
    if (parts.empty()) return "";
    
    // 预计算总大小
    size_t totalSize = (parts.size() - 1) * delimiter.size();
    for (const auto& p : parts) {
        totalSize += p.size();
    }
    
    std::string result;
    result.reserve(totalSize);
    
    result = parts[0];
    for (size_t i = 1; i < parts.size(); ++i) {
        result += delimiter;
        result += parts[i];
    }
    
    return result;
}

std::string trim(std::string_view str) {
    size_t start = 0;
    size_t end = str.size();
    
    while (start < end && std::isspace(str[start])) {
        ++start;
    }
    while (end > start && std::isspace(str[end - 1])) {
        --end;
    }
    
    return std::string(str.substr(start, end - start));
}

int main() {
    std::string test = "apple,banana,cherry,date";
    auto parts = split(test, ',');
    std::cout << "分割结果:" << std::endl;
    for (auto p : parts) {
        std::cout << "  [" << p << "]" << std::endl;
    }
    
    std::vector<std::string> words = {"Hello", "World", "C++"};
    std::cout << "\\n拼接结果: " << join(words, " ") << std::endl;
    
    std::cout << "\\nTrim测试: [" << trim("  hello world  ") << "]" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'SSO（Small String Optimization）的主要目的是？',
                    options: ['减少字符串长度', '避免短字符串的堆分配', '加快字符串比较', '减少内存碎片'],
                    correct: 1,
                    explanation: 'SSO将短字符串直接存储在string对象内部，避免了堆分配的开销。'
                },
                {
                    question: '典型std::string实现的SSO阈值大约是？',
                    options: ['8字节', '15-22字节', '32字节', '64字节'],
                    correct: 1,
                    explanation: '不同实现的SSO阈值不同，GCC和MSVC约15字节，Clang约22字节。'
                },
                {
                    question: 'std::string_view相比std::string的主要优势是？',
                    options: ['可以修改字符串', '避免字符串拷贝', '支持更多操作', '自动内存管理'],
                    correct: 1,
                    explanation: 'string_view只是字符串的视图，不拥有数据，避免了拷贝开销。'
                },
                {
                    question: '字符串拼接时，最高效的方式是？',
                    options: ['使用+=操作符', '使用ostringstream', '预计算大小并reserve', '使用C风格strcat'],
                    correct: 2,
                    explanation: '预计算总大小并reserve可以一次性分配足够内存，避免多次重新分配。'
                },
                {
                    question: '以下哪种情况string_view是危险的？',
                    options: ['作为函数参数', '从string创建', '从临时string创建', '从字符串字面量创建'],
                    correct: 2,
                    explanation: '从临时string创建string_view是危险的，因为临时对象会被销毁，导致悬空视图。'
                }
            ],
            references: [
                {
                    title: 'cppreference - basic_string',
                    url: 'https://en.cppreference.com/w/cpp/string/basic_string'
                },
                {
                    title: 'cppreference - string_view',
                    url: 'https://en.cppreference.com/w/cpp/string/basic_string_view'
                }
            ],
            assistantTips: 'SSO是std::string的重要优化。记住：短字符串无堆分配，预分配提高拼接效率，string_view避免拷贝但注意生命周期。'
        },
        {
            id: '27.6',
            title: '容器选择与算法复杂度',
            duration: '40分钟',
            difficulty: '中级',
            xp: 180,
            estimatedXp: 360,
            concepts: `## 容器选择与算法复杂度

选择正确的容器和算法对性能至关重要。本节学习如何根据使用场景选择最优方案。

### 标准容器复杂度对比

\`\`\`cpp
#include <vector>
#include <list>
#include <deque>
#include <set>
#include <map>
#include <unordered_set>
#include <unordered_map>

/*
操作复杂度对比：

vector:
- 随机访问: O(1)
- 尾部插入/删除: O(1) 摊销
- 中间插入/删除: O(n)
- 查找: O(n)

list:
- 随机访问: O(n)
- 任意位置插入/删除: O(1)
- 查找: O(n)

deque:
- 随机访问: O(1)
- 头尾插入/删除: O(1)
- 中间插入/删除: O(n)

set/map (红黑树):
- 插入/删除/查找: O(log n)

unordered_set/map (哈希表):
- 插入/删除/查找: O(1) 平均, O(n) 最坏
*/
\`\`\`

### 选择容器的决策树

\`\`\`cpp
/*
1. 需要随机访问？
   是 -> vector 或 deque

2. 只在头尾操作？
   是 -> deque（两端）或 vector（只尾）

3. 需要有序？
   是 -> set / map

4. 需要快速查找？
   是 -> unordered_set / unordered_map

5. 频繁在中间插入/删除？
   是 -> list 或 forward_list（但要考虑缓存）

6. 需要关联数组？
   是 -> map 或 unordered_map
*/

// 示例场景
#include <vector>
#include <set>
#include <unordered_map>

// 场景1：存储日志，只在尾部添加
std::vector<std::string> logs;  // 最佳选择

// 场景2：需要快速查找用户ID是否存在
std::unordered_set<int> userIds;  // O(1) 查找

// 场景3：需要按时间排序的事件
std::set<Event> events;  // 自动排序

// 场景4：键值对存储，需要快速查找
std::unordered_map<std::string, User> userMap;
\`\`\`

### vector 的最佳实践

\`\`\`cpp
#include <vector>

// 1. 预分配容量
std::vector<int> vec;
vec.reserve(1000);  // 避免多次重新分配

// 2. 使用emplace_back
vec.emplace_back(42);  // 直接构造，无临时对象

// 3. 批量删除
std::vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
// 删除所有偶数 - 使用erase-remove惯用法
v.erase(std::remove_if(v.begin(), v.end(), [](int n) { return n % 2 == 0; }), v.end());

// 4. 避免在中间插入
// 对于小vector，重新分配可能比链表遍历更快

// 5. shrink_to_fit（C++11）
vec.shrink_to_fit();  // 释放多余容量
\`\`\`

### 关联容器的选择

\`\`\`cpp
#include <set>
#include <unordered_set>
#include <map>
#include <unordered_map>

// set vs unordered_set
// set: 有序，O(log n)，支持范围查询
// unordered_set: 无序，O(1) 平均，不支持范围查询

// 需要有序遍历
std::set<int> ordered = {3, 1, 4, 1, 5};
for (int n : ordered) { /* 1, 1, 3, 4, 5 */ }

// 只需要快速查找
std::unordered_set<int> fast = {3, 1, 4, 1, 5};
fast.find(3);  // O(1) 平均

// map vs unordered_map
// 类似的选择逻辑

// 需要自定义哈希函数
struct MyHash {
    size_t operator()(const MyType& t) const {
        return std::hash<std::string>()(t.name) ^ std::hash<int>()(t.value);
    }
};
std::unordered_set<MyType, MyHash> mySet;
\`\`\`

### 算法复杂度与选择

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};

// 排序: O(n log n)
std::sort(v.begin(), v.end());

// 二分查找: O(log n) - 需要先排序
bool found = std::binary_search(v.begin(), v.end(), 5);

// 线性查找: O(n)
auto it = std::find(v.begin(), v.end(), 5);

// 部分排序: O(n log k)
std::partial_sort(v.begin(), v.begin() + 3, v.end());  // 前3个最小

// 第n元素: O(n)
std::nth_element(v.begin(), v.begin() + 5, v.end());  // 第5小的元素

// 去重: O(n) - 需要先排序
auto last = std::unique(v.begin(), v.end());
v.erase(last, v.end());
\`\`\`

### 小数据的特殊情况

\`\`\`cpp
#include <vector>
#include <list>
#include <algorithm>

// 对于小数据量，vector可能比list更快
// 原因：缓存友好性

// 经验法则：
// - 小于约50个元素：vector通常更快
// - 需要实际测试确认

void testSmallData() {
    // 小数据测试
    std::vector<int> vec;
    std::list<int> lst;
    
    // 即使在中间插入，vector可能更快
    // 因为现代CPU的缓存效应
}
\`\`\``,
            examples: [
                {
                    title: '容器性能对比',
                    code: `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <unordered_set>
#include <chrono>
#include <random>
#include <algorithm>

int main() {
    const size_t N = 100000;
    const int ITERATIONS = 100;
    
    // 生成随机数据
    std::vector<int> data(N);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, N * 10);
    for (auto& val : data) {
        val = dis(gen);
    }
    
    // 测试查找性能
    std::cout << "=== 查找性能测试 ===" << std::endl;
    int target = data[N / 2];
    
    // vector
    std::vector<int> vec = data;
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        auto it = std::find(vec.begin(), vec.end(), target);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "vector查找: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // set
    std::set<int> s(data.begin(), data.end());
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        auto it = s.find(target);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "set查找: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // unordered_set
    std::unordered_set<int> us(data.begin(), data.end());
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < ITERATIONS; ++i) {
        auto it = us.find(target);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "unordered_set查找: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // 测试插入性能
    std::cout << "\\n=== 中间插入性能测试 ===" << std::endl;
    
    // vector中间插入
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 10; ++i) {
        std::vector<int> v = data;
        v.insert(v.begin() + v.size() / 2, 42);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "vector中间插入: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // list中间插入
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 10; ++i) {
        std::list<int> l(data.begin(), data.end());
        auto it = l.begin();
        std::advance(it, l.size() / 2);
        l.insert(it, 42);
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "list中间插入: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '排序算法选择',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <random>

int main() {
    const size_t N = 1000000;
    
    // 生成随机数据
    std::vector<int> data(N);
    std::random_device rd;
    std::mt19937 gen(rd());
    for (auto& val : data) {
        val = gen();
    }
    
    // 测试完整排序
    std::vector<int> v1 = data;
    auto start = std::chrono::high_resolution_clock::now();
    std::sort(v1.begin(), v1.end());
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "完整排序: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // 测试部分排序（前100个最小）
    std::vector<int> v2 = data;
    start = std::chrono::high_resolution_clock::now();
    std::partial_sort(v2.begin(), v2.begin() + 100, v2.end());
    end = std::chrono::high_resolution_clock::now();
    std::cout << "部分排序(前100): " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // 测试nth_element（找第100小的元素）
    std::vector<int> v3 = data;
    start = std::chrono::high_resolution_clock::now();
    std::nth_element(v3.begin(), v3.begin() + 100, v3.end());
    end = std::chrono::high_resolution_clock::now();
    std::cout << "nth_element: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms" << std::endl;
    
    // 验证结果
    std::cout << "\\n验证结果:" << std::endl;
    std::cout << "完整排序后前100个已排序: " << std::is_sorted(v1.begin(), v1.begin() + 100) << std::endl;
    std::cout << "部分排序后前100个已排序: " << std::is_sorted(v2.begin(), v2.begin() + 100) << std::endl;
    std::cout << "nth_element后第100个元素: " << v3[100] << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '选择合适的容器',
                description: '根据不同场景选择最优容器并实现。',
                initialCode: `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <unordered_set>
#include <map>
#include <unordered_map>
#include <string>

// TODO: 场景1 - 实现一个日志系统
// 特点：只在尾部添加，需要随机访问历史记录
class Logger {
    // 选择合适的容器存储日志
    // void addLog(const std::string& msg);
    // std::string getLog(size_t index) const;
    // size_t size() const;
};

// TODO: 场景2 - 实现一个用户注册系统
// 特点：需要快速判断用户名是否已存在
class UserRegistry {
    // 选择合适的容器存储用户名
    // bool registerUser(const std::string& username);
    // bool exists(const std::string& username) const;
    // size_t count() const;
};

// TODO: 场景3 - 实现一个排行榜
// 特点：需要按分数排序，支持插入新分数
class Leaderboard {
    // 选择合适的容器存储分数
    // void addScore(const std::string& name, int score);
    // std::vector<std::pair<std::string, int>> getTopN(int n) const;
};

int main() {
    // 测试Logger
    Logger logger;
    logger.addLog("系统启动");
    logger.addLog("用户登录");
    std::cout << "日志数量: " << logger.size() << std::endl;
    
    // 测试UserRegistry
    UserRegistry registry;
    std::cout << "注册Alice: " << registry.registerUser("Alice") << std::endl;
    std::cout << "Alice存在: " << registry.exists("Alice") << std::endl;
    std::cout << "再次注册Alice: " << registry.registerUser("Alice") << std::endl;
    
    // 测试Leaderboard
    Leaderboard board;
    board.addScore("Alice", 100);
    board.addScore("Bob", 150);
    board.addScore("Charlie", 120);
    auto top = board.getTopN(2);
    
    return 0;
}`,
                solution: `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <unordered_set>
#include <map>
#include <unordered_map>
#include <string>
#include <algorithm>

// 场景1 - 日志系统：只在尾部添加，需要随机访问
class Logger {
    std::vector<std::string> logs;
public:
    void addLog(const std::string& msg) {
        logs.push_back(msg);
    }
    
    std::string getLog(size_t index) const {
        return logs.at(index);
    }
    
    size_t size() const {
        return logs.size();
    }
};

// 场景2 - 用户注册：需要快速判断存在性
class UserRegistry {
    std::unordered_set<std::string> usernames;
public:
    bool registerUser(const std::string& username) {
        auto [it, success] = usernames.insert(username);
        return success;
    }
    
    bool exists(const std::string& username) const {
        return usernames.find(username) != usernames.end();
    }
    
    size_t count() const {
        return usernames.size();
    }
};

// 场景3 - 排行榜：需要按分数排序
class Leaderboard {
    std::multimap<int, std::string, std::greater<int>> scores;
public:
    void addScore(const std::string& name, int score) {
        scores.insert({score, name});
    }
    
    std::vector<std::pair<std::string, int>> getTopN(int n) const {
        std::vector<std::pair<std::string, int>> result;
        int count = 0;
        for (const auto& [score, name] : scores) {
            result.push_back({name, score});
            if (++count >= n) break;
        }
        return result;
    }
};

int main() {
    Logger logger;
    logger.addLog("系统启动");
    logger.addLog("用户登录");
    std::cout << "日志数量: " << logger.size() << std::endl;
    
    UserRegistry registry;
    std::cout << "注册Alice: " << registry.registerUser("Alice") << std::endl;
    std::cout << "Alice存在: " << registry.exists("Alice") << std::endl;
    std::cout << "再次注册Alice: " << registry.registerUser("Alice") << std::endl;
    
    Leaderboard board;
    board.addScore("Alice", 100);
    board.addScore("Bob", 150);
    board.addScore("Charlie", 120);
    auto top = board.getTopN(2);
    
    std::cout << "\\n排行榜前2名:" << std::endl;
    for (const auto& [name, score] : top) {
        std::cout << name << ": " << score << std::endl;
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '需要频繁在头部和尾部插入删除元素，应该选择哪个容器？',
                    options: ['vector', 'list', 'deque', 'set'],
                    correct: 2,
                    explanation: 'deque支持O(1)的头部和尾部插入删除，同时支持随机访问。'
                },
                {
                    question: 'std::unordered_map的查找复杂度是？',
                    options: ['O(1) 最坏情况', 'O(log n) 平均', 'O(1) 平均，O(n) 最坏', 'O(n)'],
                    correct: 2,
                    explanation: '哈希表平均O(1)，但哈希冲突严重时可能退化为O(n)。'
                },
                {
                    question: '需要找出数组中第K大的元素，最高效的算法是？',
                    options: ['sort', 'partial_sort', 'nth_element', 'stable_sort'],
                    correct: 2,
                    explanation: 'nth_element可以在O(n)时间内找到第K大的元素，比完整排序更高效。'
                },
                {
                    question: '对于小数据量（如10个元素），哪种容器通常最快？',
                    options: ['list', 'vector', 'set', 'unordered_set'],
                    correct: 1,
                    explanation: '小数据量时，vector的缓存友好性通常使其比list更快，即使需要移动元素。'
                },
                {
                    question: 'std::set相比std::unordered_set的优势是？',
                    options: ['更快的查找', '更少的内存', '有序存储，支持范围查询', '更简单的接口'],
                    correct: 2,
                    explanation: 'set基于红黑树，元素有序，支持范围查询和有序遍历，这是unordered_set不支持的。'
                }
            ],
            references: [
                {
                    title: 'cppreference - Containers',
                    url: 'https://en.cppreference.com/w/cpp/container'
                },
                {
                    title: 'Complexity of STL operations',
                    url: 'https://www.cplusplus.com/reference/stl/'
                }
            ],
            assistantTips: '选择容器要考虑操作类型和数据规模。记住：默认选vector，需要查找选unordered_set/map，需要有序选set/map，两端操作选deque。'
        },
        {
            id: '27.7',
            title: '编译时计算与模板展开',
            duration: '45分钟',
            difficulty: '高级',
            xp: 190,
            estimatedXp: 380,
            concepts: `## 编译时计算与模板展开

将计算从运行时移到编译时可以显著提升性能。本节学习编译时计算技术。

### constexpr 基础

\`\`\`cpp
// constexpr变量
constexpr int MAX_SIZE = 100;
constexpr double PI = 3.14159265358979;

// constexpr函数
constexpr int square(int x) {
    return x * x;
}

constexpr int result = square(5);  // 编译时计算

// C++14允许更复杂的constexpr函数
constexpr int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

constexpr int fact5 = factorial(5);  // 编译时计算 = 120
\`\`\`

### 编译时计算的优势

\`\`\`cpp
#include <array>

// 编译时生成查找表
constexpr std::array<int, 10> generateSquares() {
    std::array<int, 10> arr{};
    for (int i = 0; i < 10; ++i) {
        arr[i] = i * i;
    }
    return arr;
}

constexpr auto squares = generateSquares();  // 编译时生成

// 运行时直接使用，无需计算
int getSquare(int n) {
    return squares[n];
}
\`\`\`

### 模板元编程基础

\`\`\`cpp
// 编译时计算阶乘（传统模板元编程）
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

int main() {
    std::cout << Factorial<5>::value;  // 编译时计算 = 120
}

// 现代方式：使用constexpr函数更简洁
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}
\`\`\`

### 类型萃取（Type Traits）

\`\`\`cpp
#include <type_traits>

// 编译时类型检查
template<typename T>
void process(T value) {
    if constexpr (std::is_integral_v<T>) {
        // 整数类型
        std::cout << "Integer: " << value << std::endl;
    } else if constexpr (std::is_floating_point_v<T>) {
        // 浮点类型
        std::cout << "Float: " << value << std::endl;
    } else {
        // 其他类型
        std::cout << "Other type" << std::endl;
    }
}

// 编译时条件选择
template<bool Condition, typename TrueType, typename FalseType>
struct Conditional {
    using type = TrueType;
};

template<typename TrueType, typename FalseType>
struct Conditional<false, TrueType, FalseType> {
    using type = FalseType;
};

// 使用std::conditional_t
using MyType = std::conditional_t<sizeof(int) == 4, int, long>;
\`\`\`

### 可变参数模板

\`\`\`cpp
#include <iostream>

// 基础情况
void print() {}

// 递归展开
template<typename T, typename... Args>
void print(const T& first, const Args&... rest) {
    std::cout << first << " ";
    print(rest...);  // 递归调用
}

// C++17 折叠表达式
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);  // 右折叠
}

template<typename... Args>
void printAll(Args... args) {
    ((std::cout << args << " "), ...);  // 逗号折叠
}

int main() {
    print(1, 2.0, "three", '4');
    std::cout << std::endl;
    
    std::cout << "Sum: " << sum(1, 2, 3, 4, 5) << std::endl;
    printAll(1, 2, 3, 4, 5);
}
\`\`\`

### 编译时字符串处理

\`\`\`cpp
#include <string_view>

// 编译时字符串长度
constexpr size_t strLength(const char* str) {
    size_t len = 0;
    while (str[len] != '\\0') {
        ++len;
    }
    return len;
}

constexpr auto len = strLength("Hello");  // 编译时 = 5

// 编译时字符串比较
constexpr bool strEqual(const char* a, const char* b) {
    while (*a && *b && *a == *b) {
        ++a;
        ++b;
    }
    return *a == *b;
}

constexpr bool eq = strEqual("hello", "hello");  // 编译时 = true
\`\`\`

### 编译时断言

\`\`\`cpp
// static_assert：编译时检查
static_assert(sizeof(int) == 4, "int must be 4 bytes");
static_assert(sizeof(void*) == 8, "64-bit platform required");

// 用于模板约束
template<typename T>
class Container {
    static_assert(std::is_default_constructible_v<T>,
                  "T must be default constructible");
    // ...
};
\`\`\`

### 模板展开优化

\`\`\`cpp
#include <array>
#include <iostream>

// 展开循环
template<size_t... Is>
void printIndices(std::index_sequence<Is...>) {
    ((std::cout << Is << " "), ...);
}

template<size_t N>
void printIndices() {
    printIndices(std::make_index_sequence<N>{});
}

// 编译时生成数组
template<size_t N>
constexpr std::array<int, N> makeSequence() {
    std::array<int, N> arr{};
    for (size_t i = 0; i < N; ++i) {
        arr[i] = static_cast<int>(i);
    }
    return arr;
}

constexpr auto seq = makeSequence<10>();
\`\`\``,
            examples: [
                {
                    title: '编译时计算示例',
                    code: `#include <iostream>
#include <array>
#include <cmath>

// 编译时计算斐波那契数列
constexpr long long fibonacci(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        long long temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

// 编译时生成斐波那契数列数组
template<size_t N>
constexpr std::array<long long, N> generateFibonacci() {
    std::array<long long, N> arr{};
    if (N > 0) arr[0] = 0;
    if (N > 1) arr[1] = 1;
    for (size_t i = 2; i < N; ++i) {
        arr[i] = arr[i-1] + arr[i-2];
    }
    return arr;
}

// 编译时判断素数
constexpr bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

// 编译时生成素数数组
constexpr int countPrimes(int max) {
    int count = 0;
    for (int i = 2; i <= max; ++i) {
        if (isPrime(i)) ++count;
    }
    return count;
}

int main() {
    // 编译时计算
    constexpr auto fib10 = fibonacci(10);
    std::cout << "fibonacci(10) = " << fib10 << std::endl;
    
    // 编译时生成数组
    constexpr auto fibArray = generateFibonacci<20>();
    std::cout << "\\n前20个斐波那契数:" << std::endl;
    for (auto n : fibArray) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // 编译时判断素数
    constexpr bool is17Prime = isPrime(17);
    constexpr bool is18Prime = isPrime(18);
    std::cout << "\\n17是素数: " << (is17Prime ? "是" : "否") << std::endl;
    std::cout << "18是素数: " << (is18Prime ? "是" : "否") << std::endl;
    
    // 编译时统计素数数量
    constexpr int primeCount = countPrimes(100);
    std::cout << "\\n100以内素数数量: " << primeCount << std::endl;
    
    return 0;
}`
                },
                {
                    title: '模板元编程与折叠表达式',
                    code: `#include <iostream>
#include <tuple>
#include <string>

// 可变参数模板：求和
template<typename... Args>
constexpr auto sum(Args... args) {
    return (args + ...);  // C++17 折叠表达式
}

// 可变参数模板：求乘积
template<typename... Args>
constexpr auto product(Args... args) {
    return (args * ...);
}

// 可变参数模板：打印所有参数
template<typename... Args>
void printAll(Args... args) {
    ((std::cout << args << " "), ...);
    std::cout << std::endl;
}

// 可变参数模板：统计参数个数
template<typename... Args>
constexpr size_t countArgs(Args...) {
    return sizeof...(Args);
}

// 处理tuple
template<typename Tuple, size_t... Is>
void printTupleImpl(const Tuple& t, std::index_sequence<Is...>) {
    ((std::cout << (Is == 0 ? "" : ", ") << std::get<Is>(t)), ...);
    std::cout << std::endl;
}

template<typename... Args>
void printTuple(const std::tuple<Args...>& t) {
    std::cout << "(";
    printTupleImpl(t, std::index_sequence_for<Args...>{});
    std::cout << ")";
}

// 编译时类型列表操作
template<typename... Types>
struct TypeList {};

template<typename List>
struct Length;

template<typename... Types>
struct Length<TypeList<Types...>> {
    static constexpr size_t value = sizeof...(Types);
};

int main() {
    // 折叠表达式示例
    std::cout << "sum(1,2,3,4,5) = " << sum(1, 2, 3, 4, 5) << std::endl;
    std::cout << "product(1,2,3,4,5) = " << product(1, 2, 3, 4, 5) << std::endl;
    
    std::cout << "\\n打印所有参数: ";
    printAll(1, 2.5, "hello", 'c');
    
    std::cout << "参数个数: " << countArgs(1, 2, 3, 4, 5) << std::endl;
    
    // tuple处理
    auto t = std::make_tuple(1, 2.5, std::string("hello"));
    std::cout << "\\nTuple内容: ";
    printTuple(t);
    
    // 类型列表
    using MyTypes = TypeList<int, double, char, std::string>;
    std::cout << "\\n类型列表长度: " << Length<MyTypes>::value << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现编译时计算工具',
                description: '使用constexpr和模板实现编译时计算。',
                initialCode: `#include <iostream>
#include <array>

// TODO: 实现编译时计算幂函数
// constexpr double power(double base, int exp)

// TODO: 实现编译时计算最大公约数
// constexpr int gcd(int a, int b)

// TODO: 实现编译时生成阶乘数组
// template<size_t N>
// constexpr std::array<long long, N> factorialArray()

// TODO: 实现编译时字符串哈希
// constexpr size_t strHash(const char* str)

int main() {
    // 测试power
    // constexpr auto p = power(2.0, 10);
    
    // 测试gcd
    // constexpr auto g = gcd(48, 18);
    
    // 测试阶乘数组
    // constexpr auto facts = factorialArray<10>();
    
    // 测试字符串哈希
    // constexpr auto h = strHash("hello");
    
    return 0;
}`,
                solution: `#include <iostream>
#include <array>

// 编译时计算幂函数
constexpr double power(double base, int exp) {
    if (exp < 0) return 1.0 / power(base, -exp);
    if (exp == 0) return 1.0;
    double result = 1.0;
    for (int i = 0; i < exp; ++i) {
        result *= base;
    }
    return result;
}

// 编译时计算最大公约数
constexpr int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 编译时生成阶乘数组
template<size_t N>
constexpr std::array<long long, N> factorialArray() {
    std::array<long long, N> arr{};
    if (N > 0) arr[0] = 1;
    for (size_t i = 1; i < N; ++i) {
        arr[i] = arr[i-1] * i;
    }
    return arr;
}

// 编译时字符串哈希
constexpr size_t strHash(const char* str) {
    size_t hash = 5381;
    while (*str) {
        hash = ((hash << 5) + hash) + static_cast<size_t>(*str);
        ++str;
    }
    return hash;
}

int main() {
    // 测试power
    constexpr auto p = power(2.0, 10);
    std::cout << "2^10 = " << p << std::endl;
    
    // 测试gcd
    constexpr auto g = gcd(48, 18);
    std::cout << "gcd(48, 18) = " << g << std::endl;
    
    // 测试阶乘数组
    constexpr auto facts = factorialArray<10>();
    std::cout << "阶乘数组: ";
    for (auto n : facts) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // 测试字符串哈希
    constexpr auto h1 = strHash("hello");
    constexpr auto h2 = strHash("world");
    std::cout << "hash(hello) = " << h1 << std::endl;
    std::cout << "hash(world) = " << h2 << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'constexpr函数在什么条件下会在编译时计算？',
                    options: ['总是编译时计算', '当参数是编译时常量时', '永远不会编译时计算', '需要特殊编译器选项'],
                    correct: 1,
                    explanation: '当constexpr函数的参数都是编译时常量时，编译器会在编译时计算结果。'
                },
                {
                    question: 'C++17折叠表达式 (args + ...) 的作用是？',
                    options: ['计算平均值', '对所有参数求和', '连接所有参数', '计算最大值'],
                    correct: 1,
                    explanation: '折叠表达式 (args + ...) 会将所有参数用+运算符连接起来，相当于求和。'
                },
                {
                    question: 'static_assert的作用是？',
                    options: ['运行时断言', '编译时断言', '调试断言', '日志输出'],
                    correct: 1,
                    explanation: 'static_assert在编译时检查条件，如果为false则编译失败，并显示错误信息。'
                },
                {
                    question: '以下哪个不是编译时计算的优势？',
                    options: ['减少运行时开销', '提前发现错误', '代码更简洁', '减少可执行文件大小'],
                    correct: 3,
                    explanation: '编译时计算可能增加可执行文件大小（因为结果被嵌入），但能减少运行时开销。'
                },
                {
                    question: 'std::conditional_t<Condition, A, B>的作用是？',
                    options: ['运行时选择类型', '编译时选择类型', '条件编译', '类型转换'],
                    correct: 1,
                    explanation: 'std::conditional_t根据编译时常量选择A或B类型，是编译时类型选择。'
                }
            ],
            references: [
                {
                    title: 'cppreference - constexpr',
                    url: 'https://en.cppreference.com/w/cpp/language/constexpr'
                },
                {
                    title: 'cppreference - Fold expressions',
                    url: 'https://en.cppreference.com/w/cpp/language/fold'
                }
            ],
            assistantTips: '编译时计算是现代C++的强大特性。优先使用constexpr函数而非模板元编程，代码更清晰。记住：能用constexpr就用，让编译器帮你优化。'
        },
        {
            id: '27.8',
            title: '并发性能与无锁数据结构简介',
            duration: '50分钟',
            difficulty: '高级',
            xp: 210,
            estimatedXp: 420,
            concepts: `## 并发性能与无锁数据结构简介

多线程编程是提升性能的重要手段。本节介绍并发编程的基础和无锁数据结构。

### 并发基础概念

\`\`\`cpp
#include <thread>
#include <mutex>
#include <atomic>

// 线程创建
void worker() {
    // 工作代码
}

int main() {
    std::thread t1(worker);
    std::thread t2(worker);
    
    t1.join();
    t2.join();
}

// 互斥锁保护共享数据
std::mutex mtx;
int sharedData = 0;

void increment() {
    std::lock_guard<std::mutex> lock(mtx);
    ++sharedData;
}
\`\`\`

### 原子操作

\`\`\`cpp
#include <atomic>

// 原子类型
std::atomic<int> counter(0);

void increment() {
    counter.fetch_add(1, std::memory_order_relaxed);
}

// 原子操作保证：
// 1. 原子性：操作不可分割
// 2. 可见性：修改对其他线程可见
// 3. 顺序性：操作顺序有保证

// 内存序选项
// memory_order_relaxed: 只保证原子性
// memory_order_acquire: 读操作，防止后续操作重排到前面
// memory_order_release: 写操作，防止前面操作重排到后面
// memory_order_seq_cst: 默认，完全顺序一致
\`\`\`

### 锁的性能问题

\`\`\`cpp
#include <mutex>
#include <chrono>

// 锁的问题：
// 1. 竞争：多个线程等待锁
// 2. 死锁：多个锁的循环等待
// 3. 优先级反转
// 4. 上下文切换开销

// 细粒度锁
class BankAccount {
    std::mutex mtx;
    int balance;
public:
    void deposit(int amount) {
        std::lock_guard<std::mutex> lock(mtx);
        balance += amount;
    }
};

// 读写锁
#include <shared_mutex>
std::shared_mutex rwMtx;

void readData() {
    std::shared_lock<std::shared_mutex> lock(rwMtx);  // 共享读
    // 读取数据
}

void writeData() {
    std::unique_lock<std::shared_mutex> lock(rwMtx);  // 独占写
    // 写入数据
}
\`\`\`

### 无锁编程基础

\`\`\`cpp
#include <atomic>

// 无锁栈（简化版）
template<typename T>
class LockFreeStack {
    struct Node {
        T data;
        Node* next;
        Node(const T& d) : data(d), next(nullptr) {}
    };
    
    std::atomic<Node*> head;
    
public:
    LockFreeStack() : head(nullptr) {}
    
    void push(const T& data) {
        Node* newNode = new Node(data);
        newNode->next = head.load(std::memory_order_relaxed);
        
        // CAS操作
        while (!head.compare_exchange_weak(
            newNode->next, newNode,
            std::memory_order_release,
            std::memory_order_relaxed)) {
            // next已被更新，重试
        }
    }
    
    bool pop(T& result) {
        Node* oldHead = head.load(std::memory_order_relaxed);
        
        while (oldHead && !head.compare_exchange_weak(
            oldHead, oldHead->next,
            std::memory_order_acquire,
            std::memory_order_relaxed)) {
            // 重试
        }
        
        if (oldHead) {
            result = oldHead->data;
            // 注意：这里存在内存回收问题（ABA问题）
            return true;
        }
        return false;
    }
};
\`\`\`

### ABA问题

\`\`\`cpp
// ABA问题描述：
// 1. 线程1读取head = A
// 2. 线程2将A弹出，push C，然后push A
// 3. 线程1执行CAS，head从A变为A（成功！）
// 但此时链表结构已经改变

// 解决方案：
// 1. 带版本号的指针
// 2. 危险指针（Hazard Pointers）
// 3. RCU（Read-Copy-Update）

// 带版本号的指针示例
struct TaggedPointer {
    Node* ptr;
    uint64_t tag;
};
\`\`\`

### 无锁队列简介

\`\`\`cpp
#include <atomic>
#include <memory>

// 简化的MPSC队列（多生产者单消费者）
template<typename T>
class MPSCQueue {
    struct Node {
        T data;
        std::atomic<Node*> next{nullptr};
    };
    
    std::atomic<Node*> head;  // 生产者端
    Node* tail;               // 消费者端（单线程访问）
    
public:
    MPSCQueue() {
        Node* dummy = new Node();
        head.store(dummy, std::memory_order_relaxed);
        tail = dummy;
    }
    
    void push(const T& data) {
        Node* newNode = new Node();
        newNode->data = data;
        
        Node* prevHead = head.exchange(newNode, std::memory_order_acq_rel);
        prevHead->next.store(newNode, std::memory_order_release);
    }
    
    bool pop(T& result) {
        Node* next = tail->next.load(std::memory_order_acquire);
        if (next == nullptr) {
            return false;
        }
        
        result = next->data;
        delete tail;
        tail = next;
        return true;
    }
};
\`\`\`

### 并发性能优化建议

\`\`\`cpp
// 1. 减少锁的粒度
// 使用多个小锁而不是一个大锁

// 2. 使用读写锁
// 读多写少的场景

// 3. 避免锁竞争
// 使用线程本地存储
thread_local int localCounter = 0;

// 4. 使用无锁数据结构
// 对于简单操作，原子操作可能更快

// 5. 批量处理
// 减少锁的获取/释放次数

// 6. 避免虚假共享
struct alignas(64) AlignedCounter {
    std::atomic<int> value{0};
};
\`\`\``,
            examples: [
                {
                    title: '原子计数器 vs 互斥锁',
                    code: `#include <iostream>
#include <thread>
#include <atomic>
#include <mutex>
#include <vector>
#include <chrono>

// 使用互斥锁
class MutexCounter {
    std::mutex mtx;
    int value = 0;
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx);
        ++value;
    }
    int get() const { return value; }
};

// 使用原子操作
class AtomicCounter {
    std::atomic<int> value{0};
public:
    void increment() {
        value.fetch_add(1, std::memory_order_relaxed);
    }
    int get() const { return value.load(); }
};

template<typename Counter>
void testCounter(const std::string& name, int numThreads, int iterations) {
    Counter counter;
    
    auto start = std::chrono::high_resolution_clock::now();
    
    std::vector<std::thread> threads;
    for (int i = 0; i < numThreads; ++i) {
        threads.emplace_back([&counter, iterations]() {
            for (int j = 0; j < iterations; ++j) {
                counter.increment();
            }
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << name << ": " << duration.count() << " ms, "
              << "result = " << counter.get() << std::endl;
}

int main() {
    const int NUM_THREADS = 8;
    const int ITERATIONS = 1000000;
    
    std::cout << "线程数: " << NUM_THREADS << std::endl;
    std::cout << "每线程迭代: " << ITERATIONS << std::endl;
    std::cout << std::endl;
    
    testCounter<MutexCounter>("互斥锁", NUM_THREADS, ITERATIONS);
    testCounter<AtomicCounter>("原子操作", NUM_THREADS, ITERATIONS);
    
    return 0;
}`
                },
                {
                    title: '简单的无锁栈',
                    code: `#include <iostream>
#include <atomic>
#include <thread>
#include <vector>

template<typename T>
class LockFreeStack {
    struct Node {
        T data;
        Node* next;
        Node(const T& d) : data(d), next(nullptr) {}
    };
    
    std::atomic<Node*> head{nullptr};
    
public:
    void push(const T& data) {
        Node* newNode = new Node(data);
        newNode->next = head.load(std::memory_order_relaxed);
        
        while (!head.compare_exchange_weak(
            newNode->next, newNode,
            std::memory_order_release,
            std::memory_order_relaxed)) {
        }
    }
    
    bool pop(T& result) {
        Node* oldHead = head.load(std::memory_order_relaxed);
        
        while (oldHead && !head.compare_exchange_weak(
            oldHead, oldHead->next,
            std::memory_order_acquire,
            std::memory_order_relaxed)) {
        }
        
        if (oldHead) {
            result = oldHead->data;
            // 注意：实际应用中需要处理内存回收
            return true;
        }
        return false;
    }
    
    ~LockFreeStack() {
        T dummy;
        while (pop(dummy)) {}
    }
};

int main() {
    LockFreeStack<int> stack;
    
    // 多线程push
    std::vector<std::thread> producers;
    for (int i = 0; i < 4; ++i) {
        producers.emplace_back([&stack, i]() {
            for (int j = 0; j < 1000; ++j) {
                stack.push(i * 1000 + j);
            }
        });
    }
    
    for (auto& t : producers) {
        t.join();
    }
    
    // 单线程pop
    int count = 0;
    int value;
    while (stack.pop(value)) {
        ++count;
    }
    
    std::cout << "压入元素总数: 4000" << std::endl;
    std::cout << "弹出元素数量: " << count << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现线程安全的数据结构',
                description: '实现一个线程安全的队列。',
                initialCode: `#include <iostream>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <thread>

// TODO: 实现线程安全队列
template<typename T>
class ThreadSafeQueue {
private:
    // TODO: 定义数据成员
    // std::queue<T> queue;
    // std::mutex mtx;
    // std::condition_variable cv;
    
public:
    // TODO: 实现push方法
    void push(const T& value) {
    }
    
    // TODO: 实现pop方法（阻塞）
    T pop() {
        return T();
    }
    
    // TODO: 实现try_pop方法（非阻塞）
    bool try_pop(T& value) {
        return false;
    }
    
    // TODO: 实现empty方法
    bool empty() const {
        return true;
    }
    
    // TODO: 实现size方法
    size_t size() const {
        return 0;
    }
};

int main() {
    ThreadSafeQueue<int> queue;
    
    // 生产者线程
    std::thread producer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            queue.push(i);
            std::cout << "生产: " << i << std::endl;
        }
    });
    
    // 消费者线程
    std::thread consumer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            int value = queue.pop();
            std::cout << "消费: " << value << std::endl;
        }
    });
    
    producer.join();
    consumer.join();
    
    return 0;
}`,
                solution: `#include <iostream>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <thread>

template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    mutable std::mutex mtx;
    std::condition_variable cv;
    
public:
    void push(const T& value) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            queue.push(value);
        }
        cv.notify_one();
    }
    
    T pop() {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [this]() { return !queue.empty(); });
        
        T value = std::move(queue.front());
        queue.pop();
        return value;
    }
    
    bool try_pop(T& value) {
        std::lock_guard<std::mutex> lock(mtx);
        if (queue.empty()) {
            return false;
        }
        value = std::move(queue.front());
        queue.pop();
        return true;
    }
    
    bool empty() const {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.empty();
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.size();
    }
};

int main() {
    ThreadSafeQueue<int> queue;
    
    std::thread producer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            queue.push(i);
            std::cout << "生产: " << i << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    });
    
    std::thread consumer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            int value = queue.pop();
            std::cout << "消费: " << value << std::endl;
        }
    });
    
    producer.join();
    consumer.join();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::atomic的主要作用是？',
                    options: ['自动内存管理', '提供原子操作', '线程同步', '性能优化'],
                    correct: 1,
                    explanation: 'std::atomic提供原子操作，保证操作的原子性、可见性和顺序性。'
                },
                {
                    question: 'compare_exchange_weak的作用是？',
                    options: ['交换两个值', '条件交换（CAS）', '弱比较', '弱交换'],
                    correct: 1,
                    explanation: 'compare_exchange_weak实现CAS（Compare-And-Swap）操作，原子地比较并交换。'
                },
                {
                    question: 'ABA问题是指什么？',
                    options: ['内存泄漏', '值从A变B再变回A，CAS误判', '死锁', '竞争条件'],
                    correct: 1,
                    explanation: 'ABA问题是指值从A变为B再变回A，CAS操作无法检测到中间的变化，可能导致错误。'
                },
                {
                    question: 'memory_order_relaxed的特点是？',
                    options: ['完全顺序一致', '只保证原子性', '最严格的内存序', '只用于写操作'],
                    correct: 1,
                    explanation: 'memory_order_relaxed只保证操作的原子性，不保证顺序性和可见性。'
                },
                {
                    question: '无锁编程的主要优势是？',
                    options: ['代码更简单', '避免锁的开销和死锁', '内存使用更少', '编译器优化更好'],
                    correct: 1,
                    explanation: '无锁编程避免了锁的获取/释放开销、死锁风险和优先级反转等问题。'
                }
            ],
            references: [
                {
                    title: 'cppreference - atomic',
                    url: 'https://en.cppreference.com/w/cpp/atomic/atomic'
                },
                {
                    title: 'C++ Concurrency In Action',
                    url: 'https://www.manning.com/books/c-plus-plus-concurrency-in-action'
                }
            ],
            assistantTips: '并发编程复杂且容易出错。建议：优先使用高级抽象（如std::atomic、线程安全队列），避免直接使用底层同步原语。无锁编程是高级主题，需要深入理解内存模型。'
        }
    ]
};

window.Unit27Data = Unit27Data;
