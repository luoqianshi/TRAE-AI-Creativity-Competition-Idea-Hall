/**
 * 单元9：动态内存与智能指针
 */
const Unit9Data = {
    id: 9,
    title: '动态内存与智能指针',
    description: '学习动态内存管理和现代C++智能指针的使用',
    lessons: [
        {
            id: '9.1',
            title: '动态内存与 new/delete',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 动态内存与 new/delete

在C++中，程序使用的内存分为几个区域：
- **栈（Stack）**：自动管理的内存，函数结束时自动释放
- **堆（Heap）**：动态分配的内存，需要手动管理

### 为什么需要动态内存？

1. 程序运行时才能确定需要的内存大小
2. 对象的生命周期需要超出函数作用域
3. 需要共享数据

### new 运算符

\`\`\`cpp
// 分配单个对象
int* p = new int;        // 分配一个未初始化的int
int* p2 = new int(42);   // 分配并初始化为42
int* p3 = new int{42};   // C++11 列表初始化

// 分配自定义类型
class MyClass {
public:
    MyClass(int v) : value(v) {}
private:
    int value;
};

MyClass* obj = new MyClass(10);  // 调用构造函数
\`\`\`

### delete 运算符

\`\`\`cpp
int* p = new int(42);
delete p;  // 释放内存

MyClass* obj = new MyClass(10);
delete obj;  // 调用析构函数并释放内存
\`\`\`

### new 失败处理

\`\`\`cpp
// 默认抛出 std::bad_alloc 异常
int* p = new int[1000000000000];

// 使用 nothrow 版本返回 nullptr
int* p2 = new (std::nothrow) int[1000000000000];
if (p2 == nullptr) {
    std::cout << "内存分配失败" << std::endl;
}
\`\`\`

### 动态内存的生命周期

\`\`\`cpp
void example() {
    int* p = new int(42);  // 在堆上分配
    // ... 使用 p
    delete p;  // 必须手动释放！
    p = nullptr;  // 好习惯：置空指针
}
\`\`\`

### 注意事项

1. **配对使用**：每个 new 必须有对应的 delete
2. **避免重复释放**：delete 后不要再次 delete
3. **置空指针**：delete 后将指针置为 nullptr
4. **避免内存泄漏**：确保所有分配的内存都被释放`,
            examples: [
                {
                    title: '基本动态内存分配',
                    code: `#include <iostream>

int main() {
    // 分配单个整数
    int* p = new int;
    *p = 42;
    std::cout << "值: " << *p << std::endl;
    delete p;
    p = nullptr;
    
    // 分配并初始化
    int* p2 = new int(100);
    std::cout << "初始化值: " << *p2 << std::endl;
    delete p2;
    p2 = nullptr;
    
    return 0;
}`,
                    description: '演示基本的动态内存分配和释放。'
                },
                {
                    title: '动态对象创建',
                    code: `#include <iostream>
#include <string>

class Student {
private:
    std::string name;
    int age;
public:
    Student(const std::string& n, int a) : name(n), age(a) {
        std::cout << "构造: " << name << std::endl;
    }
    
    ~Student() {
        std::cout << "析构: " << name << std::endl;
    }
    
    void introduce() const {
        std::cout << "我是" << name << "，" << age << "岁" << std::endl;
    }
};

int main() {
    Student* s1 = new Student("张三", 20);
    s1->introduce();
    
    Student* s2 = new Student("李四", 22);
    s2->introduce();
    
    delete s1;
    delete s2;
    
    return 0;
}`,
                    description: '演示动态创建对象，构造函数和析构函数的调用时机。'
                }
            ],
            handsOn: {
                title: '动态创建和释放对象',
                description: '创建一个Rectangle类，动态分配对象并计算面积。',
                initialCode: `#include <iostream>

class Rectangle {
private:
    double width;
    double height;
public:
    // TODO: 实现构造函数
    // 接收宽度和高度参数
    
    // TODO: 实现计算面积的方法
    // 返回 width * height
    
    // TODO: 实现析构函数
    // 输出 "Rectangle destroyed"
};

int main() {
    // TODO: 使用 new 动态创建 Rectangle 对象
    // 宽度为 5.0，高度为 3.0
    
    // TODO: 调用计算面积方法并输出结果
    
    // TODO: 使用 delete 释放对象
    
    return 0;
}`,
                expectedOutput: `面积: 15
Rectangle destroyed`,
                solutionRegex: 'new Rectangle|delete',
                hint: '使用 new 创建对象，使用 delete 释放对象',
                xp: 150
            },
            references: [
                { title: '动态内存', book: 'C++ Primer 第五版', chapter: '第12章' },
                { title: 'new和delete', book: 'Effective C++', chapter: '条款16-17' }
            ],
            assistantTips: [
                'new分配的内存在堆上，不会自动释放',
                'delete会调用析构函数然后释放内存',
                'delete后立即将指针置为nullptr是好习惯',
                '使用智能指针可以避免手动管理内存'
            ],
            quiz: [
                { type: 'single', question: 'new运算符在哪个内存区域分配？', options: [{ text: '栈' }, { text: '堆', correct: true }, { text: '静态存储区' }, { text: '代码区' }], explanation: 'new在堆上分配内存，需要手动释放。' },
                { type: 'single', question: 'delete运算符的作用是？', options: [{ text: '删除指针变量' }, { text: '释放内存并调用析构函数', correct: true }, { text: '只释放内存' }, { text: '只调用析构函数' }], explanation: 'delete会先调用析构函数，然后释放内存。' },
                { type: 'single', question: 'new失败时默认会？', options: [{ text: '返回nullptr' }, { text: '抛出std::bad_alloc异常', correct: true }, { text: '程序崩溃' }, { text: '返回0' }], explanation: 'new失败默认抛出std::bad_alloc异常。' },
                { type: 'single', question: 'delete后应该做什么？', options: [{ text: '什么都不做' }, { text: '将指针置为nullptr', correct: true }, { text: '再次delete' }, { text: '输出日志' }], explanation: 'delete后置空指针可以避免悬空指针问题。' },
                { type: 'single', question: '以下哪种情况会导致内存泄漏？', options: [{ text: 'delete后置空指针' }, { text: 'new后没有delete', correct: true }, { text: '使用智能指针' }, { text: '在栈上创建对象' }], explanation: 'new分配的内存如果没有delete释放，就会导致内存泄漏。' }
            ]
        },
        {
            id: '9.2',
            title: '动态数组',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 动态数组

### new[] 和 delete[]

使用 new[] 分配数组，使用 delete[] 释放数组。

\`\`\`cpp
// 分配动态数组
int* arr = new int[10];  // 分配10个int的数组

// 初始化
for (int i = 0; i < 10; ++i) {
    arr[i] = i * 2;
}

// 释放数组 - 必须使用 delete[]
delete[] arr;
arr = nullptr;
\`\`\`

### 初始化动态数组

\`\`\`cpp
// C++11 列表初始化
int* arr = new int[5]{1, 2, 3, 4, 5};

// 值初始化（全部初始化为0）
int* arr2 = new int[10]();  // 所有元素为0
int* arr3 = new int[10]{};  // 同上
\`\`\`

### 动态对象数组

\`\`\`cpp
class Point {
public:
    int x, y;
    Point() : x(0), y(0) {}
    Point(int x, int y) : x(x), y(y) {}
};

// 必须有默认构造函数
Point* points = new Point[5];

// 使用初始化列表
Point* points2 = new Point[3]{Point(1,1), Point(2,2), Point(3,3)};

delete[] points;
delete[] points2;
\`\`\`

### 重要注意事项

1. **配对使用**：new[] 必须与 delete[] 配对
2. **错误示例**：
\`\`\`cpp
int* arr = new int[10];
delete arr;   // 错误！应该用 delete[]
\`\`\`

3. **不要混用**：
\`\`\`cpp
int* p = new int;
delete[] p;   // 错误！应该用 delete
\`\`\`

### 获取数组大小

动态数组不会保存大小信息，需要自己维护：

\`\`\`cpp
int size = 10;
int* arr = new int[size];
// 需要自己记住 size
delete[] arr;
\`\`\``,
            examples: [
                {
                    title: '动态数组基本使用',
                    code: `#include <iostream>

int main() {
    int size = 5;
    
    // 分配动态数组
    int* arr = new int[size];
    
    // 初始化数组
    for (int i = 0; i < size; ++i) {
        arr[i] = (i + 1) * 10;
    }
    
    // 输出数组
    std::cout << "数组内容: ";
    for (int i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    
    // 释放数组
    delete[] arr;
    arr = nullptr;
    
    return 0;
}`,
                    description: '演示动态数组的基本操作。'
                },
                {
                    title: '动态对象数组',
                    code: `#include <iostream>
#include <string>

class Book {
private:
    std::string title;
    double price;
public:
    Book() : title("未命名"), price(0.0) {}
    Book(const std::string& t, double p) : title(t), price(p) {}
    
    void display() const {
        std::cout << "《" << title << "》价格: " << price << std::endl;
    }
};

int main() {
    // 使用默认构造函数创建数组
    Book* books = new Book[3];
    
    // 使用初始化列表
    Book* books2 = new Book[3]{
        Book("C++ Primer", 128.0),
        Book("Effective C++", 68.0),
        Book("STL源码剖析", 88.0)
    };
    
    std::cout << "书籍列表:" << std::endl;
    for (int i = 0; i < 3; ++i) {
        books2[i].display();
    }
    
    delete[] books;
    delete[] books2;
    
    return 0;
}`,
                    description: '演示动态对象数组的创建和使用。'
                }
            ],
            handsOn: {
                title: '实现动态数组求和',
                description: '动态创建一个整数数组，计算所有元素的和。',
                initialCode: `#include <iostream>

int main() {
    int size = 5;
    
    // TODO: 使用 new[] 分配大小为 size 的整数数组
    
    // TODO: 使用循环初始化数组元素为 1, 2, 3, 4, 5
    
    // TODO: 计算数组所有元素的和
    
    // TODO: 输出结果
    
    // TODO: 使用 delete[] 释放数组
    
    return 0;
}`,
                expectedOutput: `数组元素: 1 2 3 4 5 
总和: 15`,
                solutionRegex: 'new int\\[|delete\\[\\]',
                hint: '使用 new[] 分配数组，使用 delete[] 释放数组',
                xp: 150
            },
            references: [
                { title: '动态数组', book: 'C++ Primer 第五版', chapter: '第12.2节' }
            ],
            assistantTips: [
                'new[] 分配的数组必须用 delete[] 释放',
                'delete 和 delete[] 不能混用',
                '动态数组不保存大小，需要自己维护',
                '优先使用 std::vector 而不是动态数组'
            ],
            quiz: [
                { type: 'single', question: '分配动态数组使用哪个运算符？', options: [{ text: 'new' }, { text: 'new[]', correct: true }, { text: 'malloc' }, { text: 'alloc' }], explanation: 'new[] 专门用于分配数组。' },
                { type: 'single', question: '释放动态数组应该使用？', options: [{ text: 'delete' }, { text: 'delete[]', correct: true }, { text: 'free' }, { text: 'release' }], explanation: 'new[] 分配的数组必须用 delete[] 释放。' },
                { type: 'single', question: 'int* arr = new int[10]; delete arr; 会怎样？', options: [{ text: '正常释放' }, { text: '未定义行为', correct: true }, { text: '编译错误' }, { text: '只释放第一个元素' }], explanation: '数组应该用 delete[] 释放，用 delete 会导致未定义行为。' },
                { type: 'single', question: '动态数组的大小信息存储在哪里？', options: [{ text: '数组本身保存' }, { text: '需要程序员自己维护', correct: true }, { text: '编译器自动维护' }, { text: '操作系统记录' }], explanation: '动态数组不保存大小，程序员需要自己记住。' },
                { type: 'single', question: '创建动态对象数组时，类需要？', options: [{ text: '虚析构函数' }, { text: '默认构造函数', correct: true }, { text: '拷贝构造函数' }, { text: '移动构造函数' }], explanation: '创建对象数组时，如果没有提供初始化列表，需要默认构造函数。' }
            ]
        },
        {
            id: '9.3',
            title: 'shared_ptr：创建、拷贝、引用计数',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## shared_ptr：共享所有权的智能指针

shared_ptr 是 C++11 引入的智能指针，允许多个指针共享同一个对象的所有权。

### 基本概念

- **引用计数**：记录有多少个 shared_ptr 指向同一个对象
- **自动释放**：当最后一个 shared_ptr 被销毁时，自动删除对象

### 创建 shared_ptr

\`\`\`cpp
#include <memory>

// 方式1：使用 make_shared（推荐）
auto p1 = std::make_shared<int>(42);
auto p2 = std::make_shared<std::string>("Hello");

// 方式2：使用 new
std::shared_ptr<int> p3(new int(42));

// 方式3：空指针
std::shared_ptr<int> p4;  // 空指针
\`\`\`

### 拷贝和赋值

\`\`\`cpp
auto p1 = std::make_shared<int>(42);
auto p2 = p1;  // 拷贝，引用计数 +1
auto p3 = p1;  // 引用计数 +1

std::cout << p1.use_count();  // 输出: 3

p1.reset();  // p1 放弃所有权，引用计数 -1
std::cout << p2.use_count();  // 输出: 2
\`\`\`

### 常用操作

\`\`\`cpp
auto p = std::make_shared<int>(42);

// 访问值
std::cout << *p;      // 解引用
std::cout << p.get(); // 获取原始指针

// 检查是否为空
if (p) {
    std::cout << "p 不为空" << std::endl;
}

// 重置
p.reset();  // 释放所有权

// 获取引用计数
std::cout << p.use_count();
\`\`\`

### 自定义删除器

\`\`\`cpp
auto deleter = [](int* p) {
    std::cout << "自定义删除" << std::endl;
    delete p;
};

std::shared_ptr<int> p(new int(42), deleter);
\`\`\`

### 使用场景

1. 多个对象需要共享同一资源
2. 需要在对象之间传递所有权
3. 容器中存储指针`,
            examples: [
                {
                    title: 'shared_ptr 基本使用',
                    code: `#include <iostream>
#include <memory>

class Resource {
public:
    Resource(int id) : id(id) {
        std::cout << "创建资源 " << id << std::endl;
    }
    ~Resource() {
        std::cout << "销毁资源 " << id << std::endl;
    }
    int getId() const { return id; }
private:
    int id;
};

int main() {
    std::cout << "=== 创建第一个 shared_ptr ===" << std::endl;
    std::shared_ptr<Resource> p1 = std::make_shared<Resource>(1);
    std::cout << "引用计数: " << p1.use_count() << std::endl;
    
    std::cout << "\\n=== 拷贝 shared_ptr ===" << std::endl;
    std::shared_ptr<Resource> p2 = p1;
    std::cout << "p1 引用计数: " << p1.use_count() << std::endl;
    std::cout << "p2 引用计数: " << p2.use_count() << std::endl;
    
    std::cout << "\\n=== 再拷贝一个 ===" << std::endl;
    std::shared_ptr<Resource> p3 = p1;
    std::cout << "引用计数: " << p1.use_count() << std::endl;
    
    std::cout << "\\n=== p1 释放所有权 ===" << std::endl;
    p1.reset();
    std::cout << "引用计数: " << p2.use_count() << std::endl;
    
    std::cout << "\\n=== 程序结束 ===" << std::endl;
    return 0;
}`,
                    description: '演示 shared_ptr 的引用计数机制。'
                },
                {
                    title: 'shared_ptr 在容器中使用',
                    code: `#include <iostream>
#include <memory>
#include <vector>

class Shape {
public:
    virtual void draw() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override {
        std::cout << "绘制圆形" << std::endl;
    }
};

class Square : public Shape {
public:
    void draw() const override {
        std::cout << "绘制正方形" << std::endl;
    }
};

int main() {
    std::vector<std::shared_ptr<Shape>> shapes;
    
    shapes.push_back(std::make_shared<Circle>());
    shapes.push_back(std::make_shared<Square>());
    shapes.push_back(std::make_shared<Circle>());
    
    for (const auto& shape : shapes) {
        shape->draw();
    }
    
    // 容器销毁时自动释放所有对象
    return 0;
}`,
                    description: '演示 shared_ptr 在容器中的使用，实现多态。'
                }
            ],
            handsOn: {
                title: '实现共享计数器',
                description: '使用 shared_ptr 实现多个对象共享同一个计数器。',
                initialCode: `#include <iostream>
#include <memory>

class Counter {
private:
    int value;
public:
    Counter(int v = 0) : value(v) {
        std::cout << "创建计数器: " << value << std::endl;
    }
    ~Counter() {
        std::cout << "销毁计数器: " << value << std::endl;
    }
    
    void increment() { ++value; }
    int get() const { return value; }
};

int main() {
    // TODO: 使用 make_shared 创建一个 Counter 对象
    
    // TODO: 创建另一个 shared_ptr 共享同一个 Counter
    
    // TODO: 通过第一个指针增加计数
    
    // TODO: 通过第二个指针增加计数
    
    // TODO: 输出引用计数和计数器值
    
    // TODO: 输出两个指针的引用计数是否相同
    
    return 0;
}`,
                expectedOutput: `创建计数器: 0
引用计数: 2
计数器值: 2
销毁计数器: 2`,
                solutionRegex: 'make_shared|shared_ptr',
                hint: '使用 std::make_shared 创建，通过拷贝共享所有权',
                xp: 150
            },
            references: [
                { title: '智能指针', book: 'C++ Primer 第五版', chapter: '第12.1节' },
                { title: '智能指针', book: 'Effective Modern C++', chapter: '条款19-22' }
            ],
            assistantTips: [
                '优先使用 make_shared 而不是 new',
                '引用计数是线程安全的，但对象访问需要同步',
                '避免从原始指针创建多个 shared_ptr',
                'shared_ptr 有一定性能开销，不适合所有场景'
            ],
            quiz: [
                { type: 'single', question: 'shared_ptr 的主要特点是？', options: [{ text: '独占所有权' }, { text: '共享所有权', correct: true }, { text: '不管理内存' }, { text: '手动释放' }], explanation: 'shared_ptr 允许多个指针共享同一个对象。' },
                { type: 'single', question: '创建 shared_ptr 的推荐方式是？', options: [{ text: 'new shared_ptr' }, { text: 'make_shared', correct: true }, { text: 'malloc' }, { text: 'alloc' }], explanation: 'make_shared 更高效且异常安全。' },
                { type: 'single', question: 'use_count() 返回什么？', options: [{ text: '对象数量' }, { text: '引用计数', correct: true }, { text: '内存大小' }, { text: '指针地址' }], explanation: 'use_count() 返回指向同一对象的 shared_ptr 数量。' },
                { type: 'single', question: '当引用计数变为0时会发生什么？', options: [{ text: '抛出异常' }, { text: '自动删除对象', correct: true }, { text: '什么都不发生' }, { text: '程序崩溃' }], explanation: '引用计数为0时，shared_ptr 自动删除管理的对象。' },
                { type: 'single', question: '以下哪种情况会导致问题？', options: [{ text: '用 make_shared 创建' }, { text: '从同一原始指针创建多个 shared_ptr', correct: true }, { text: '拷贝 shared_ptr' }, { text: 'reset() 释放所有权' }], explanation: '从同一原始指针创建多个 shared_ptr 会导致重复删除。' }
            ]
        },
        {
            id: '9.4',
            title: 'unique_ptr：独占所有权、转移、自定义删除器',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## unique_ptr：独占所有权的智能指针

unique_ptr 独占所管理的对象，不能拷贝，只能移动。

### 基本概念

- **独占所有权**：同一时刻只能有一个 unique_ptr 指向对象
- **零开销**：与原始指针大小相同，没有额外开销
- **不可拷贝**：只能移动，不能拷贝

### 创建 unique_ptr

\`\`\`cpp
#include <memory>

// 方式1：使用 make_unique（C++14推荐）
auto p1 = std::make_unique<int>(42);
auto p2 = std::make_unique<std::string>("Hello");

// 方式2：使用 new
std::unique_ptr<int> p3(new int(42));

// 方式3：空指针
std::unique_ptr<int> p4;
\`\`\`

### 移动语义

\`\`\`cpp
auto p1 = std::make_unique<int>(42);

// 移动所有权
auto p2 = std::move(p1);  // p1 变为空，p2 拥有对象

// p1 现在为空
if (!p1) {
    std::cout << "p1 为空" << std::endl;
}

// 在函数间转移所有权
std::unique_ptr<int> createInt() {
    return std::make_unique<int>(42);
}

auto p3 = createInt();  // 所有权转移到 p3
\`\`\`

### 常用操作

\`\`\`cpp
auto p = std::make_unique<int>(42);

// 访问值
std::cout << *p;       // 解引用
std::cout << p.get();  // 获取原始指针

// 释放所有权（不删除对象）
int* raw = p.release();

// 重置
p.reset();  // 删除对象，p 变为空
p.reset(new int(100));  // 删除旧对象，管理新对象
\`\`\`

### 自定义删除器

\`\`\`cpp
// 函数指针形式
void deleteInt(int* p) {
    std::cout << "自定义删除" << std::endl;
    delete p;
}

std::unique_ptr<int, void(*)(int*)> p(new int(42), deleteInt);

// 使用 lambda
auto deleter = [](int* p) {
    std::cout << "Lambda删除" << std::endl;
    delete p;
};
std::unique_ptr<int, decltype(deleter)> p2(new int(42), deleter);
\`\`\`

### 数组特化

\`\`\`cpp
// unique_ptr 支持数组
auto arr = std::make_unique<int[]>(10);
arr[0] = 42;  // 使用下标访问

// 注意：make_unique<int[10]> 是错误的
\`\`\`

### 工厂函数返回 unique_ptr

\`\`\`cpp
class Shape { /* ... */ };
class Circle : public Shape { /* ... */ };

std::unique_ptr<Shape> createShape() {
    return std::make_unique<Circle>();
}
\`\`\``,
            examples: [
                {
                    title: 'unique_ptr 基本使用',
                    code: `#include <iostream>
#include <memory>

class Resource {
public:
    Resource(int id) : id(id) {
        std::cout << "创建资源 " << id << std::endl;
    }
    ~Resource() {
        std::cout << "销毁资源 " << id << std::endl;
    }
private:
    int id;
};

int main() {
    std::cout << "=== 创建 unique_ptr ===" << std::endl;
    auto p1 = std::make_unique<Resource>(1);
    
    std::cout << "\\n=== 移动所有权 ===" << std::endl;
    auto p2 = std::move(p1);
    
    if (!p1) {
        std::cout << "p1 现在为空" << std::endl;
    }
    if (p2) {
        std::cout << "p2 拥有资源" << std::endl;
    }
    
    std::cout << "\\n=== 程序结束 ===" << std::endl;
    return 0;
}`,
                    description: '演示 unique_ptr 的独占所有权和移动语义。'
                },
                {
                    title: 'unique_ptr 自定义删除器',
                    code: `#include <iostream>
#include <memory>
#include <fstream>

// 自定义文件删除器
auto fileDeleter = [](FILE* f) {
    std::cout << "关闭文件" << std::endl;
    if (f) fclose(f);
};

int main() {
    // 使用自定义删除器管理 FILE*
    std::unique_ptr<FILE, decltype(fileDeleter)> file(
        fopen("test.txt", "w"),
        fileDeleter
    );
    
    if (file) {
        fputs("Hello, unique_ptr!", file.get());
        std::cout << "写入文件成功" << std::endl;
    }
    
    // 离开作用域时自动调用 fileDeleter
    return 0;
}`,
                    description: '演示 unique_ptr 的自定义删除器，管理 FILE 资源。'
                }
            ],
            handsOn: {
                title: '实现工厂模式',
                description: '使用 unique_ptr 实现一个简单的工厂函数。',
                initialCode: `#include <iostream>
#include <memory>
#include <string>

class Animal {
public:
    virtual void speak() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override {
        std::cout << "汪汪汪!" << std::endl;
    }
};

class Cat : public Animal {
public:
    void speak() const override {
        std::cout << "喵喵喵!" << std::endl;
    }
};

// TODO: 实现工厂函数
// 参数: type ("dog" 或 "cat")
// 返回: unique_ptr<Animal>
std::unique_ptr<Animal> createAnimal(const std::string& type) {
    // TODO: 根据 type 创建对应的动物对象
    return nullptr;
}

int main() {
    auto dog = createAnimal("dog");
    auto cat = createAnimal("cat");
    
    if (dog) dog->speak();
    if (cat) cat->speak();
    
    return 0;
}`,
                expectedOutput: `汪汪汪!
喵喵喵!`,
                solutionRegex: 'make_unique|new Dog|new Cat',
                hint: '使用 make_unique<Dog> 或 make_unique<Cat> 创建对象',
                xp: 150
            },
            references: [
                { title: 'unique_ptr', book: 'C++ Primer 第五版', chapter: '第12.1.5节' },
                { title: 'unique_ptr', book: 'Effective Modern C++', chapter: '条款18' }
            ],
            assistantTips: [
                'unique_ptr 是零开销的智能指针',
                '不能拷贝 unique_ptr，只能移动',
                '优先使用 make_unique（C++14）',
                '工厂函数应该返回 unique_ptr 而不是原始指针'
            ],
            quiz: [
                { type: 'single', question: 'unique_ptr 的主要特点是？', options: [{ text: '共享所有权' }, { text: '独占所有权', correct: true }, { text: '不管理内存' }, { text: '可以拷贝' }], explanation: 'unique_ptr 独占所管理的对象。' },
                { type: 'single', question: '如何转移 unique_ptr 的所有权？', options: [{ text: '拷贝' }, { text: '使用 std::move', correct: true }, { text: '赋值' }, { text: 'swap' }], explanation: 'unique_ptr 不能拷贝，只能通过 move 转移所有权。' },
                { type: 'single', question: 'unique_ptr 相比 shared_ptr 的优势是？', options: [{ text: '可以共享' }, { text: '零开销', correct: true }, { text: '可以拷贝' }, { text: '自动引用计数' }], explanation: 'unique_ptr 与原始指针大小相同，没有额外开销。' },
                { type: 'single', question: 'release() 方法的作用是？', options: [{ text: '删除对象' }, { text: '释放所有权并返回原始指针', correct: true }, { text: '重置指针' }, { text: '增加引用计数' }], explanation: 'release() 释放所有权但不删除对象，返回原始指针。' },
                { type: 'single', question: 'unique_ptr 管理数组时应该？', options: [{ text: '使用 unique_ptr<T>' }, { text: '使用 unique_ptr<T[]>', correct: true }, { text: '不能管理数组' }, { text: '使用 shared_ptr' }], explanation: 'unique_ptr<T[]> 是数组的特化版本。' }
            ]
        },
        {
            id: '9.5',
            title: 'weak_ptr 与循环引用',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## weak_ptr 与循环引用

weak_ptr 是一种不控制对象生命周期的智能指针，它指向一个由 shared_ptr 管理的对象。

### weak_ptr 的作用

1. 打破 shared_ptr 的循环引用
2. 观察对象是否存在
3. 临时访问对象

### 基本使用

\`\`\`cpp
#include <memory>

auto shared = std::make_shared<int>(42);

// 创建 weak_ptr
std::weak_ptr<int> weak = shared;

// 检查对象是否存在
if (!weak.expired()) {
    // 获取 shared_ptr 来访问对象
    if (auto locked = weak.lock()) {
        std::cout << *locked << std::endl;
    }
}

// 获取引用计数
std::cout << weak.use_count();  // shared_ptr 的数量
\`\`\`

### 循环引用问题

\`\`\`cpp
class Node {
public:
    std::shared_ptr<Node> next;  // 强引用
    ~Node() { std::cout << "销毁节点" << std::endl; }
};

void problem() {
    auto node1 = std::make_shared<Node>();
    auto node2 = std::make_shared<Node>();
    
    node1->next = node2;  // node2 引用计数 +1
    node2->next = node1;  // node1 引用计数 +1
    
    // 函数结束时，两个节点都无法释放！
    // 因为它们的引用计数都是 1
}
\`\`\`

### 使用 weak_ptr 解决循环引用

\`\`\`cpp
class Node {
public:
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // 使用 weak_ptr 打破循环
    ~Node() { std::cout << "销毁节点" << std::endl; }
};

void solution() {
    auto node1 = std::make_shared<Node>();
    auto node2 = std::make_shared<Node>();
    
    node1->next = node2;
    node2->prev = node1;  // weak_ptr 不增加引用计数
    
    // 函数结束时正确释放
}
\`\`\`

### 常用操作

\`\`\`cpp
std::weak_ptr<int> weak;

// 检查是否过期
bool isExpired = weak.expired();

// 获取引用计数
long count = weak.use_count();

// 锁定对象（返回 shared_ptr）
auto shared = weak.lock();
if (shared) {
    // 对象存在，可以安全使用
}

// 重置
weak.reset();
\`\`\`

### 使用场景

1. 观察者模式：观察者持有被观察者的 weak_ptr
2. 缓存：缓存持有对象的 weak_ptr
3. 打破循环引用`,
            examples: [
                {
                    title: '循环引用问题演示',
                    code: `#include <iostream>
#include <memory>

class Node {
public:
    std::shared_ptr<Node> next;
    std::string name;
    
    Node(const std::string& n) : name(n) {
        std::cout << "创建节点: " << name << std::endl;
    }
    ~Node() {
        std::cout << "销毁节点: " << name << std::endl;
    }
};

void demonstrateProblem() {
    std::cout << "=== 循环引用问题 ===" << std::endl;
    
    auto node1 = std::make_shared<Node>("A");
    auto node2 = std::make_shared<Node>("B");
    
    std::cout << "连接前引用计数: " << node1.use_count() << std::endl;
    
    node1->next = node2;
    node2->next = node1;  // 循环引用！
    
    std::cout << "连接后引用计数: " << node1.use_count() << std::endl;
    std::cout << "函数结束，但节点不会被销毁..." << std::endl;
}

int main() {
    demonstrateProblem();
    std::cout << "程序结束" << std::endl;
    return 0;
}`,
                    description: '演示循环引用导致的内存泄漏问题。'
                },
                {
                    title: '使用 weak_ptr 解决循环引用',
                    code: `#include <iostream>
#include <memory>

class Node {
public:
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // 使用 weak_ptr
    std::string name;
    
    Node(const std::string& n) : name(n) {
        std::cout << "创建节点: " << name << std::endl;
    }
    ~Node() {
        std::cout << "销毁节点: " << name << std::endl;
    }
};

void demonstrateSolution() {
    std::cout << "=== 使用 weak_ptr 解决 ===" << std::endl;
    
    auto node1 = std::make_shared<Node>("A");
    auto node2 = std::make_shared<Node>("B");
    
    node1->next = node2;
    node2->prev = node1;  // weak_ptr 不增加引用计数
    
    std::cout << "node1 引用计数: " << node1.use_count() << std::endl;
    std::cout << "node2 引用计数: " << node2.use_count() << std::endl;
    
    // 访问前驱节点
    if (auto prev = node2->prev.lock()) {
        std::cout << "node2 的前驱: " << prev->name << std::endl;
    }
    
    std::cout << "函数结束，节点将被正确销毁..." << std::endl;
}

int main() {
    demonstrateSolution();
    std::cout << "程序结束" << std::endl;
    return 0;
}`,
                    description: '演示如何使用 weak_ptr 解决循环引用问题。'
                }
            ],
            handsOn: {
                title: '实现双向链表节点',
                description: '实现一个双向链表节点类，正确处理前驱指针。',
                initialCode: `#include <iostream>
#include <memory>

class ListNode {
public:
    int value;
    std::shared_ptr<ListNode> next;
    // TODO: 声明 prev 为 weak_ptr
    
    ListNode(int v) : value(v) {
        std::cout << "创建节点: " << value << std::endl;
    }
    ~ListNode() {
        std::cout << "销毁节点: " << value << std::endl;
    }
};

int main() {
    auto node1 = std::make_shared<ListNode>(1);
    auto node2 = std::make_shared<ListNode>(2);
    auto node3 = std::make_shared<ListNode>(3);
    
    // TODO: 连接节点
    // node1 -> node2 -> node3
    // node3 -> node2 -> node1 (使用 weak_ptr)
    
    // TODO: 使用 lock() 访问 node3 的前驱节点并输出值
    
    std::cout << "程序结束" << std::endl;
    return 0;
}`,
                expectedOutput: `创建节点: 1
创建节点: 2
创建节点: 3
node3的前驱节点值: 2
程序结束
销毁节点: 3
销毁节点: 2
销毁节点: 1`,
                solutionRegex: 'weak_ptr|lock\\(\\)',
                hint: '前驱指针使用 weak_ptr，访问时使用 lock() 获取 shared_ptr',
                xp: 150
            },
            references: [
                { title: 'weak_ptr', book: 'C++ Primer 第五版', chapter: '第12.1.6节' }
            ],
            assistantTips: [
                'weak_ptr 不增加引用计数',
                '使用 lock() 安全地获取 shared_ptr',
                '循环引用是 shared_ptr 的常见陷阱',
                'weak_ptr 适合"观察者"角色'
            ],
            quiz: [
                { type: 'single', question: 'weak_ptr 的作用是？', options: [{ text: '管理对象生命周期' }, { text: '观察对象但不拥有', correct: true }, { text: '替代 shared_ptr' }, { text: '替代 unique_ptr' }], explanation: 'weak_ptr 不控制对象生命周期，只是观察。' },
                { type: 'single', question: '循环引用会导致什么问题？', options: [{ text: '编译错误' }, { text: '内存泄漏', correct: true }, { text: '运行时错误' }, { text: '性能下降' }], explanation: '循环引用导致引用计数无法归零，内存无法释放。' },
                { type: 'single', question: '如何安全地使用 weak_ptr 访问对象？', options: [{ text: '直接解引用' }, { text: '使用 lock() 获取 shared_ptr', correct: true }, { text: '使用 get()' }, { text: '使用 release()' }], explanation: 'lock() 返回 shared_ptr，如果对象存在则可以安全使用。' },
                { type: 'single', question: 'expired() 返回 true 表示？', options: [{ text: '对象存在' }, { text: '对象已被销毁', correct: true }, { text: '引用计数为1' }, { text: '指针为空' }], explanation: 'expired() 返回 true 表示对象已被销毁。' },
                { type: 'single', question: 'weak_ptr 会影响引用计数吗？', options: [{ text: '会增加引用计数' }, { text: '不会影响引用计数', correct: true }, { text: '会减少引用计数' }, { text: '取决于对象类型' }], explanation: 'weak_ptr 不影响 shared_ptr 的引用计数。' }
            ]
        },
        {
            id: '9.6',
            title: '动态内存管理错误（内存泄漏、野指针）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 动态内存管理错误

动态内存管理是 C++ 中最容易出错的地方之一。

### 常见错误类型

#### 1. 内存泄漏（Memory Leak）

\`\`\`cpp
void leak() {
    int* p = new int(42);
    // 忘记 delete p;
}  // 内存泄漏！

// 另一种情况
void leak2() {
    int* p = new int(42);
    p = new int(100);  // 第一个内存泄漏
    delete p;
}
\`\`\`

#### 2. 野指针（Dangling Pointer）

\`\`\`cpp
void dangling() {
    int* p = new int(42);
    delete p;
    // p 现在是野指针
    *p = 100;  // 未定义行为！
}

// 返回局部变量的指针
int* dangerous() {
    int local = 42;
    return &local;  // 返回局部变量的地址
}
\`\`\`

#### 3. 重复释放（Double Free）

\`\`\`cpp
void doubleFree() {
    int* p = new int(42);
    delete p;
    delete p;  // 错误！重复释放
}

// 另一种情况
void doubleFree2() {
    int* p1 = new int(42);
    int* p2 = p1;
    delete p1;
    delete p2;  // 错误！两个指针指向同一内存
}
\`\`\`

#### 4. 使用未初始化的指针

\`\`\`cpp
void uninit() {
    int* p;  // 未初始化
    *p = 42;  // 未定义行为！
}
\`\`\`

#### 5. new/delete 不匹配

\`\`\`cpp
void mismatch() {
    int* arr = new int[10];
    delete arr;  // 错误！应该用 delete[]
    
    int* p = new int(42);
    delete[] p;  // 错误！应该用 delete
}
\`\`\`

### 防御措施

\`\`\`cpp
// 1. 使用智能指针
auto p = std::make_unique<int>(42);  // 自动释放

// 2. delete 后置空
int* p = new int(42);
delete p;
p = nullptr;  // 防止野指针

// 3. 检查指针
if (p != nullptr) {
    *p = 42;
}

// 4. 使用 RAII
class Resource {
    int* data;
public:
    Resource() : data(new int(42)) {}
    ~Resource() { delete data; }  // 自动释放
};
\`\`\`

### 调试技巧

\`\`\`cpp
// 使用工具检测内存泄漏
// - Valgrind (Linux)
// - AddressSanitizer (GCC/Clang)
// - Visual Studio 内存检测

// 编译时启用 AddressSanitizer
// g++ -fsanitize=address -g program.cpp
\`\`\``,
            examples: [
                {
                    title: '内存泄漏示例',
                    code: `#include <iostream>

class Resource {
public:
    int id;
    Resource(int i) : id(i) {
        std::cout << "创建资源 " << id << std::endl;
    }
    ~Resource() {
        std::cout << "销毁资源 " << id << std::endl;
    }
};

void memoryLeak() {
    std::cout << "=== 内存泄漏示例 ===" << std::endl;
    Resource* r1 = new Resource(1);
    Resource* r2 = new Resource(2);
    
    // 只释放了一个
    delete r1;
    // 忘记 delete r2;
    
    std::cout << "函数结束，r2 泄漏了" << std::endl;
}

int main() {
    memoryLeak();
    std::cout << "\\n程序结束" << std::endl;
    return 0;
}`,
                    description: '演示内存泄漏的情况。'
                },
                {
                    title: '使用智能指针避免错误',
                    code: `#include <iostream>
#include <memory>

class Resource {
public:
    int id;
    Resource(int i) : id(i) {
        std::cout << "创建资源 " << id << std::endl;
    }
    ~Resource() {
        std::cout << "销毁资源 " << id << std::endl;
    }
};

void safeCode() {
    std::cout << "=== 使用智能指针 ===" << std::endl;
    
    auto r1 = std::make_unique<Resource>(1);
    auto r2 = std::make_unique<Resource>(2);
    
    // 不需要手动 delete
    // 自动释放，不会泄漏
    
    std::cout << "函数结束" << std::endl;
}

int main() {
    safeCode();
    std::cout << "\\n程序结束" << std::endl;
    return 0;
}`,
                    description: '演示使用智能指针避免内存管理错误。'
                }
            ],
            handsOn: {
                title: '修复内存管理错误',
                description: '修复以下代码中的内存管理错误。',
                initialCode: `#include <iostream>

class Buffer {
public:
    int* data;
    int size;
    
    Buffer(int s) : size(s) {
        data = new int[s];
        std::cout << "创建缓冲区，大小: " << size << std::endl;
    }
    
    ~Buffer() {
        // TODO: 实现析构函数，释放 data
    }
};

int main() {
    // 问题代码 - 需要修复
    int* p = new int(42);
    int* q = p;
    
    delete p;
    // TODO: 修复野指针问题
    
    // 数组问题
    int* arr = new int[5];
    for (int i = 0; i < 5; ++i) {
        arr[i] = i;
    }
    // TODO: 正确释放数组
    
    // Buffer 使用
    Buffer* buf = new Buffer(10);
    // TODO: 正确释放 Buffer
    
    std::cout << "程序结束" << std::endl;
    return 0;
}`,
                expectedOutput: `创建缓冲区，大小: 10
销毁缓冲区
程序结束`,
                solutionRegex: 'delete\\[\\]|delete buf|nullptr',
                hint: '数组用 delete[]，对象用 delete，delete 后置空指针',
                xp: 150
            },
            references: [
                { title: '动态内存管理', book: 'C++ Primer 第五版', chapter: '第12章' },
                { title: '内存管理', book: 'Effective C++', chapter: '条款16-17' }
            ],
            assistantTips: [
                '使用智能指针可以避免大多数内存错误',
                'delete 后立即将指针置为 nullptr',
                'new[] 必须与 delete[] 配对',
                '使用工具检测内存问题（Valgrind、ASan）'
            ],
            quiz: [
                { type: 'single', question: '内存泄漏是指？', options: [{ text: '指针指向错误地址' }, { text: '分配的内存没有被释放', correct: true }, { text: '重复释放内存' }, { text: '访问越界' }], explanation: '内存泄漏是指动态分配的内存没有被正确释放。' },
                { type: 'single', question: '野指针是指？', options: [{ text: '空指针' }, { text: '指向已释放内存的指针', correct: true }, { text: '未初始化的指针' }, { text: 'const指针' }], explanation: '野指针指向已经被释放的内存，访问它是未定义行为。' },
                { type: 'single', question: '重复释放会导致？', options: [{ text: '编译错误' }, { text: '未定义行为', correct: true }, { text: '内存泄漏' }, { text: '正常运行' }], explanation: '重复释放同一块内存会导致未定义行为，可能崩溃。' },
                { type: 'single', question: '如何避免野指针？', options: [{ text: '不使用指针' }, { text: 'delete 后置空指针', correct: true }, { text: '使用 const' }, { text: '增加引用计数' }], explanation: 'delete 后将指针置为 nullptr 可以避免野指针问题。' },
                { type: 'single', question: '以下哪个是最佳实践？', options: [{ text: '手动管理所有内存' }, { text: '使用智能指针', correct: true }, { text: '避免使用动态内存' }, { text: '使用全局变量' }], explanation: '使用智能指针是现代 C++ 管理内存的最佳实践。' }
            ]
        },
        {
            id: '9.7',
            title: '使用 allocator 进行原始内存分配',
            duration: '30分钟',
            difficulty: '高级',
            xp: 100,
            estimatedXp: 300,
            concepts: `## allocator 类

allocator 是一个标准库类，用于将内存分配与对象构造分离。

### 为什么需要 allocator？

\`\`\`cpp
// new 的问题：分配和构造绑定
std::string* p = new std::string[100];  // 创建100个空字符串

// 如果我们只需要内存，不需要立即构造对象
// 使用 allocator 可以分离这两个操作
\`\`\`

### 基本使用

\`\`\`cpp
#include <memory>

// 创建 allocator
std::allocator<std::string> alloc;

// 1. 分配内存（未构造）
std::string* p = alloc.allocate(10);  // 分配10个 string 的内存

// 2. 构造对象
alloc.construct(p, "Hello");          // 在 p 位置构造
alloc.construct(p + 1, "World");      // 在 p+1 位置构造

// 3. 使用对象
std::cout << p[0] << " " << p[1] << std::endl;

// 4. 销毁对象
alloc.destroy(p);
alloc.destroy(p + 1);

// 5. 释放内存
alloc.deallocate(p, 10);  // 必须指定大小
\`\`\`

### allocator 操作

| 操作 | 说明 |
|------|------|
| allocate(n) | 分配 n 个对象的原始内存 |
| deallocate(p, n) | 释放内存，n 必须与 allocate 一致 |
| construct(p, args...) | 在 p 位置构造对象 |
| destroy(p) | 销毁 p 位置的对象 |

### 批量操作

\`\`\`cpp
#include <memory>
#include <algorithm>

std::allocator<int> alloc;

// 分配内存
int* p = alloc.allocate(10);

// 批量构造（C++20 之前）
for (int i = 0; i < 10; ++i) {
    alloc.construct(p + i, i * 2);
}

// 使用 uninitialized_copy
int arr[] = {1, 2, 3, 4, 5};
int* p2 = alloc.allocate(5);
std::uninitialized_copy(std::begin(arr), std::end(arr), p2);

// 使用 uninitialized_fill
int* p3 = alloc.allocate(5);
std::uninitialized_fill(p3, p3 + 5, 42);

// 清理
for (int i = 0; i < 10; ++i) alloc.destroy(p + i);
alloc.deallocate(p, 10);
\`\`\`

### 自定义容器的内存管理

\`\`\`cpp
template<typename T>
class MyVector {
private:
    std::allocator<T> alloc;
    T* data;
    size_t sz;
    size_t cap;
    
public:
    void push_back(const T& value) {
        if (sz == cap) {
            // 重新分配
            reserve(cap * 2);
        }
        alloc.construct(data + sz, value);
        ++sz;
    }
    
    void reserve(size_t new_cap) {
        T* new_data = alloc.allocate(new_cap);
        // 移动旧元素...
        alloc.deallocate(data, cap);
        data = new_data;
        cap = new_cap;
    }
};
\`\`\``,
            examples: [
                {
                    title: 'allocator 基本使用',
                    code: `#include <iostream>
#include <memory>
#include <string>

int main() {
    std::allocator<std::string> alloc;
    
    // 分配内存
    std::string* p = alloc.allocate(5);
    
    // 构造对象
    alloc.construct(p, "Hello");
    alloc.construct(p + 1, "World");
    alloc.construct(p + 2, "C++");
    
    // 使用对象
    std::cout << "构造的对象: ";
    for (int i = 0; i < 3; ++i) {
        std::cout << p[i] << " ";
    }
    std::cout << std::endl;
    
    // 销毁对象
    for (int i = 0; i < 3; ++i) {
        alloc.destroy(p + i);
    }
    
    // 释放内存
    alloc.deallocate(p, 5);
    
    std::cout << "内存已释放" << std::endl;
    return 0;
}`,
                    description: '演示 allocator 的基本使用方法。'
                },
                {
                    title: '使用 uninitialized_copy',
                    code: `#include <iostream>
#include <memory>
#include <algorithm>

class Point {
public:
    int x, y;
    Point(int x = 0, int y = 0) : x(x), y(y) {
        std::cout << "构造点(" << x << "," << y << ")" << std::endl;
    }
    ~Point() {
        std::cout << "销毁点(" << x << "," << y << ")" << std::endl;
    }
};

int main() {
    std::allocator<Point> alloc;
    
    // 原始数组
    Point points[] = {Point(1, 1), Point(2, 2), Point(3, 3)};
    
    // 分配内存
    Point* p = alloc.allocate(3);
    
    std::cout << "\\n复制到新内存..." << std::endl;
    // 批量构造
    std::uninitialized_copy(std::begin(points), std::end(points), p);
    
    std::cout << "\\n新内存中的点:" << std::endl;
    for (int i = 0; i < 3; ++i) {
        std::cout << "(" << p[i].x << "," << p[i].y << ")" << std::endl;
    }
    
    std::cout << "\\n销毁对象..." << std::endl;
    for (int i = 0; i < 3; ++i) {
        alloc.destroy(p + i);
    }
    alloc.deallocate(p, 3);
    
    return 0;
}`,
                    description: '演示使用 uninitialized_copy 批量构造对象。'
                }
            ],
            handsOn: {
                title: '使用 allocator 管理内存',
                description: '使用 allocator 分配内存并构造整数数组。',
                initialCode: `#include <iostream>
#include <memory>

int main() {
    std::allocator<int> alloc;
    
    // TODO: 分配 5 个 int 的内存
    
    // TODO: 使用 construct 在每个位置构造值
    // 值分别为 10, 20, 30, 40, 50
    
    // TODO: 输出所有值
    
    // TODO: 销毁所有对象
    
    // TODO: 释放内存
    
    return 0;
}`,
                expectedOutput: `值: 10 20 30 40 50 
内存已释放`,
                solutionRegex: 'allocate|construct|destroy|deallocate',
                hint: '使用 allocate 分配，construct 构造，destroy 销毁，deallocate 释放',
                xp: 150
            },
            references: [
                { title: 'allocator', book: 'C++ Primer 第五版', chapter: '第12.2.2节' }
            ],
            assistantTips: [
                'allocator 将内存分配与对象构造分离',
                'construct 和 destroy 必须配对',
                'deallocate 的大小参数必须与 allocate 一致',
                'allocator 常用于实现自定义容器'
            ],
            quiz: [
                { type: 'single', question: 'allocator 的主要作用是？', options: [{ text: '自动管理内存' }, { text: '分离内存分配与对象构造', correct: true }, { text: '替代 new/delete' }, { text: '实现垃圾回收' }], explanation: 'allocator 允许先分配内存，再按需构造对象。' },
                { type: 'single', question: 'allocate(n) 返回什么？', options: [{ text: 'n 个已构造的对象' }, { text: 'n 个对象的原始内存', correct: true }, { text: 'n 个空指针' }, { text: 'n 个默认对象' }], explanation: 'allocate 只分配内存，不构造对象。' },
                { type: 'single', question: 'construct 的作用是？', options: [{ text: '分配内存' }, { text: '在指定位置构造对象', correct: true }, { text: '销毁对象' }, { text: '释放内存' }], explanation: 'construct 在已分配的内存上构造对象。' },
                { type: 'single', question: 'deallocate 需要指定什么？', options: [{ text: '只需要指针' }, { text: '指针和大小', correct: true }, { text: '只需要大小' }, { text: '不需要参数' }], explanation: 'deallocate 需要指针和分配时的大小。' },
                { type: 'single', question: 'uninitialized_copy 的作用是？', options: [{ text: '复制已构造的对象' }, { text: '在原始内存上批量构造对象', correct: true }, { text: '分配内存' }, { text: '释放内存' }], explanation: 'uninitialized_copy 在原始内存上构造对象的副本。' }
            ]
        },
        {
            id: '9.8',
            title: '自定义内存管理简介',
            duration: '30分钟',
            difficulty: '高级',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 自定义内存管理

在某些场景下，我们需要自定义内存管理策略以提高性能或满足特殊需求。

### 为什么需要自定义内存管理？

1. **性能优化**：减少内存碎片，提高分配速度
2. **内存池**：预分配大块内存，减少系统调用
3. **特殊需求**：嵌入式系统、游戏引擎等

### 重载 new 和 delete

\`\`\`cpp
class MyClass {
public:
    void* operator new(size_t size) {
        std::cout << "自定义 new，大小: " << size << std::endl;
        return ::operator new(size);
    }
    
    void operator delete(void* ptr) {
        std::cout << "自定义 delete" << std::endl;
        ::operator delete(ptr);
    }
    
    // 数组版本
    void* operator new[](size_t size) {
        std::cout << "自定义 new[]，大小: " << size << std::endl;
        return ::operator new[](size);
    }
    
    void operator delete[](void* ptr) {
        std::cout << "自定义 delete[]" << std::endl;
        ::operator delete[](ptr);
    }
};
\`\`\`

### 内存池示例

\`\`\`cpp
class MemoryPool {
private:
    struct Block {
        Block* next;
    };
    
    Block* freeList;
    size_t blockSize;
    std::vector<void*> chunks;
    
public:
    MemoryPool(size_t size) : freeList(nullptr), blockSize(size) {}
    
    void* allocate() {
        if (!freeList) {
            // 分配新块
            const int chunkSize = 32;
            char* chunk = new char[blockSize * chunkSize];
            chunks.push_back(chunk);
            
            for (int i = 0; i < chunkSize; ++i) {
                Block* block = reinterpret_cast<Block*>(chunk + i * blockSize);
                block->next = freeList;
                freeList = block;
            }
        }
        
        void* result = freeList;
        freeList = freeList->next;
        return result;
    }
    
    void deallocate(void* ptr) {
        Block* block = reinterpret_cast<Block*>(ptr);
        block->next = freeList;
        freeList = block;
    }
    
    ~MemoryPool() {
        for (void* chunk : chunks) {
            delete[] static_cast<char*>(chunk);
        }
    }
};
\`\`\`

### 全局 new/delete 重载

\`\`\`cpp
void* operator new(size_t size) {
    std::cout << "全局 new: " << size << " 字节" << std::endl;
    return malloc(size);
}

void operator delete(void* ptr) noexcept {
    std::cout << "全局 delete" << std::endl;
    free(ptr);
}
\`\`\`

### 使用自定义分配器

\`\`\`cpp
template<typename T>
class CustomAllocator {
public:
    using value_type = T;
    
    CustomAllocator() = default;
    
    template<typename U>
    CustomAllocator(const CustomAllocator<U>&) {}
    
    T* allocate(size_t n) {
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }
    
    void deallocate(T* p, size_t n) {
        ::operator delete(p);
    }
    
    template<typename U>
    bool operator==(const CustomAllocator<U>&) const { return true; }
    
    template<typename U>
    bool operator!=(const CustomAllocator<U>&) const { return false; }
};

// 使用
std::vector<int, CustomAllocator<int>> vec;
\`\`\`

### 注意事项

1. 重载 new/delete 要小心，可能影响整个程序
2. 内存池需要正确处理对齐
3. 多线程环境需要同步
4. 考虑异常安全`,
            examples: [
                {
                    title: '重载类级别 new/delete',
                    code: `#include <iostream>
#include <cstdlib>

class Widget {
private:
    int id;
    static int count;
    
public:
    Widget(int i) : id(i) {
        std::cout << "构造 Widget " << id << std::endl;
    }
    
    ~Widget() {
        std::cout << "析构 Widget " << id << std::endl;
    }
    
    // 重载 new
    void* operator new(size_t size) {
        std::cout << "自定义 new，分配 " << size << " 字节" << std::endl;
        ++count;
        return std::malloc(size);
    }
    
    // 重载 delete
    void operator delete(void* ptr) {
        std::cout << "自定义 delete" << std::endl;
        --count;
        std::free(ptr);
    }
    
    static int getCount() { return count; }
};

int Widget::count = 0;

int main() {
    std::cout << "=== 创建 Widget ===" << std::endl;
    Widget* w1 = new Widget(1);
    Widget* w2 = new Widget(2);
    
    std::cout << "\\n当前 Widget 数量: " << Widget::getCount() << std::endl;
    
    std::cout << "\\n=== 删除 Widget ===" << std::endl;
    delete w1;
    delete w2;
    
    std::cout << "\\n最终 Widget 数量: " << Widget::getCount() << std::endl;
    
    return 0;
}`,
                    description: '演示如何重载类级别的 new 和 delete。'
                },
                {
                    title: '简单内存池',
                    code: `#include <iostream>
#include <vector>

// 简单的固定大小内存池
class MemoryPool {
private:
    struct FreeBlock {
        FreeBlock* next;
    };
    
    FreeBlock* freeList;
    size_t blockSize;
    std::vector<void*> chunks;
    
public:
    MemoryPool(size_t size) : freeList(nullptr), blockSize(size) {}
    
    ~MemoryPool() {
        for (void* chunk : chunks) {
            ::operator delete(chunk);
        }
    }
    
    void* allocate() {
        if (!freeList) {
            // 分配新块
            const size_t blocksPerChunk = 16;
            void* chunk = ::operator new(blockSize * blocksPerChunk);
            chunks.push_back(chunk);
            
            char* ptr = static_cast<char*>(chunk);
            for (size_t i = 0; i < blocksPerChunk; ++i) {
                FreeBlock* block = reinterpret_cast<FreeBlock*>(ptr + i * blockSize);
                block->next = freeList;
                freeList = block;
            }
        }
        
        void* result = freeList;
        freeList = freeList->next;
        return result;
    }
    
    void deallocate(void* ptr) {
        FreeBlock* block = reinterpret_cast<FreeBlock*>(ptr);
        block->next = freeList;
        freeList = block;
    }
    
    size_t chunkCount() const { return chunks.size(); }
};

int main() {
    MemoryPool pool(sizeof(int));
    
    std::cout << "=== 分配内存 ===" << std::endl;
    int* p1 = static_cast<int*>(pool.allocate());
    int* p2 = static_cast<int*>(pool.allocate());
    int* p3 = static_cast<int*>(pool.allocate());
    
    *p1 = 100;
    *p2 = 200;
    *p3 = 300;
    
    std::cout << "值: " << *p1 << ", " << *p2 << ", " << *p3 << std::endl;
    std::cout << "块数量: " << pool.chunkCount() << std::endl;
    
    std::cout << "\\n=== 释放内存 ===" << std::endl;
    pool.deallocate(p1);
    pool.deallocate(p2);
    
    // 重新分配会复用释放的内存
    int* p4 = static_cast<int*>(pool.allocate());
    *p4 = 400;
    std::cout << "复用内存，新值: " << *p4 << std::endl;
    std::cout << "块数量: " << pool.chunkCount() << " (未增加)" << std::endl;
    
    pool.deallocate(p3);
    pool.deallocate(p4);
    
    return 0;
}`,
                    description: '演示简单的固定大小内存池实现。'
                }
            ],
            handsOn: {
                title: '实现简单的内存计数器',
                description: '重载 new 和 delete 来跟踪内存分配次数。',
                initialCode: `#include <iostream>
#include <cstdlib>

class TrackedObject {
private:
    static int allocCount;
    static int deallocCount;
    
public:
    int value;
    
    TrackedObject(int v = 0) : value(v) {
        std::cout << "构造对象，值: " << value << std::endl;
    }
    
    ~TrackedObject() {
        std::cout << "析构对象，值: " << value << std::endl;
    }
    
    // TODO: 重载 new 运算符
    // 增加 allocCount，输出分配信息
    
    // TODO: 重载 delete 运算符
    // 增加 deallocCount，输出释放信息
    
    static void printStats() {
        std::cout << "分配次数: " << allocCount << std::endl;
        std::cout << "释放次数: " << deallocCount << std::endl;
    }
};

int TrackedObject::allocCount = 0;
int TrackedObject::deallocCount = 0;

int main() {
    TrackedObject* obj1 = new TrackedObject(42);
    TrackedObject* obj2 = new TrackedObject(100);
    
    delete obj1;
    
    TrackedObject::printStats();
    
    delete obj2;
    
    return 0;
}`,
                expectedOutput: `分配内存: 4 字节
构造对象，值: 42
分配内存: 4 字节
构造对象，值: 100
析构对象，值: 42
释放内存
分配次数: 2
释放次数: 1
析构对象，值: 100
释放内存`,
                solutionRegex: 'operator new|operator delete',
                hint: '使用 static 成员变量计数，重载 new 和 delete',
                xp: 150
            },
            references: [
                { title: '自定义内存管理', book: 'Effective C++', chapter: '条款50-52' },
                { title: '内存池', book: 'More Effective C++', chapter: '条款8' }
            ],
            assistantTips: [
                '重载 new/delete 可以实现自定义内存策略',
                '内存池可以显著提高分配性能',
                '注意内存对齐和多线程安全',
                '优先使用现有的内存池库而不是自己实现'
            ],
            quiz: [
                { type: 'single', question: '重载 new 的函数签名是？', options: [{ text: 'void new(size_t)' }, { text: 'void* operator new(size_t)', correct: true }, { text: 'void* new(size_t)' }, { text: 'operator new(size_t)' }], explanation: 'new 运算符重载必须返回 void* 并接受 size_t 参数。' },
                { type: 'single', question: '内存池的主要优势是？', options: [{ text: '减少内存使用' }, { text: '提高分配速度', correct: true }, { text: '自动垃圾回收' }, { text: '防止内存泄漏' }], explanation: '内存池预分配大块内存，减少系统调用，提高分配速度。' },
                { type: 'single', question: '全局 new 重载会影响？', options: [{ text: '只有当前类' }, { text: '整个程序的所有分配', correct: true }, { text: '只有当前文件' }, { text: '只有动态分配' }], explanation: '全局 new 重载会影响程序中所有的内存分配。' },
                { type: 'single', question: '自定义分配器需要实现哪些方法？', options: [{ text: '只有 allocate' }, { text: 'allocate 和 deallocate', correct: true }, { text: '只有 deallocate' }, { text: 'construct 和 destroy' }], explanation: '自定义分配器至少需要实现 allocate 和 deallocate。' },
                { type: 'single', question: '内存池适用于什么场景？', options: [{ text: '所有场景' }, { text: '频繁分配释放固定大小对象', correct: true }, { text: '大对象分配' }, { text: '字符串处理' }], explanation: '内存池最适合频繁分配释放相同大小对象的场景。' }
            ]
        }
    ]
};

window.Unit9Data = Unit9Data;
