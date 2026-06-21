/**
 * 单元10：拷贝控制深入
 */
const Unit10Data = {
    id: 10,
    title: '拷贝控制深入',
    description: '深入理解拷贝控制机制，掌握值语义、引用语义、移动语义和三五法则',
    lessons: [
        {
            id: '10.1',
            title: '值语义与引用语义',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 值语义与引用语义

### 什么是值语义？

值语义（Value Semantics）是指对象在拷贝时，会创建一个完全独立的副本。修改副本不会影响原对象。

\`\`\`cpp
int a = 10;
int b = a;  // b是a的副本
b = 20;     // 修改b不影响a
// a仍然是10
\`\`\`

### 什么是引用语义？

引用语义（Reference Semantics）是指对象在拷贝时，副本和原对象共享底层资源。修改副本会影响原对象。

\`\`\`cpp
int a = 10;
int& b = a;  // b是a的引用
b = 20;      // 修改b也修改了a
// a变成了20
\`\`\`

### C++中的语义选择

C++默认使用值语义，但可以通过指针或引用实现引用语义：

\`\`\`cpp
// 值语义
std::string s1 = "hello";
std::string s2 = s1;  // 独立副本
s2[0] = 'H';          // s1不受影响

// 引用语义（通过指针）
std::string* p1 = new std::string("hello");
std::string* p2 = p1;  // 共享同一对象
(*p2)[0] = 'H';        // *p1也被修改
\`\`\`

### 深拷贝 vs 浅拷贝

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| 浅拷贝 | 只复制指针，共享资源 | 引用语义 |
| 深拷贝 | 复制整个对象和资源 | 值语义 |

\`\`\`cpp
class ShallowCopy {
public:
    int* data;
    ShallowCopy(int val) { data = new int(val); }
    // 默认拷贝构造函数是浅拷贝
};

class DeepCopy {
public:
    int* data;
    DeepCopy(int val) { data = new int(val); }
    
    // 深拷贝构造函数
    DeepCopy(const DeepCopy& other) {
        data = new int(*other.data);  // 分配新内存
    }
    
    ~DeepCopy() { delete data; }
};
\`\`\`

### 值语义的优点

1. **简单直观**：对象独立，易于理解
2. **异常安全**：对象析构时自动释放资源
3. **线程安全**：每个线程有自己的副本
4. **符合RAII**：资源管理自动化

### 引用语义的优点

1. **性能高效**：避免不必要的拷贝
2. **共享数据**：多个对象可以共享同一资源
3. **多态支持**：通过基类指针访问派生类对象`,
            examples: [
                {
                    title: '值语义示例',
                    code: `#include <iostream>
#include <string>

class ValueClass {
private:
    std::string name;
    int value;
public:
    ValueClass(const std::string& n, int v) : name(n), value(v) {}
    
    // 默认拷贝构造函数实现值语义
    void setValue(int v) { value = v; }
    void print() const {
        std::cout << name << ": " << value << std::endl;
    }
};

int main() {
    ValueClass obj1("Object1", 10);
    ValueClass obj2 = obj1;  // 值语义：独立副本
    
    obj2.setValue(20);  // 修改obj2
    
    std::cout << "修改obj2后:" << std::endl;
    obj1.print();  // Object1: 10（未受影响）
    obj2.print();  // Object1: 20
    
    return 0;
}`,
                    description: '展示值语义：拷贝后对象相互独立。'
                },
                {
                    title: '引用语义示例',
                    code: `#include <iostream>

class RefClass {
private:
    int* data;
public:
    RefClass(int val) { data = new int(val); }
    
    // 默认拷贝构造函数（浅拷贝）
    void setValue(int val) { *data = val; }
    int getValue() const { return *data; }
    
    ~RefClass() { delete data; }
};

int main() {
    RefClass obj1(10);
    RefClass obj2 = obj1;  // 浅拷贝：共享数据
    
    obj2.setValue(20);  // 修改obj2
    
    std::cout << "修改obj2后:" << std::endl;
    std::cout << "obj1: " << obj1.getValue() << std::endl;  // 20
    std::cout << "obj2: " << obj2.getValue() << std::endl;  // 20
    
    // 注意：这里会double delete！
    // 需要实现深拷贝或使用智能指针
    
    return 0;
}`,
                    description: '展示引用语义的危险：浅拷贝导致资源共享和double delete。'
                }
            ],
            handsOn: {
                title: '实现深拷贝类',
                description: '实现一个Buffer类，包含动态分配的字符数组，要求实现深拷贝。',
                initialCode: `#include <iostream>
#include <cstring>

class Buffer {
private:
    char* data;
    size_t size;
    
public:
    // 构造函数
    Buffer(const char* str = "") {
        // TODO: 分配内存并复制字符串
    }
    
    // 深拷贝构造函数
    Buffer(const Buffer& other) {
        // TODO: 实现深拷贝
    }
    
    // 析构函数
    ~Buffer() {
        // TODO: 释放内存
    }
    
    void print() const {
        std::cout << data << std::endl;
    }
    
    void setChar(size_t index, char c) {
        if (index < size) data[index] = c;
    }
};

int main() {
    Buffer b1("Hello");
    Buffer b2 = b1;  // 深拷贝
    
    b2.setChar(0, 'h');  // 修改b2
    
    std::cout << "b1: ";
    b1.print();  // 应该输出 "Hello"
    
    std::cout << "b2: ";
    b2.print();  // 应该输出 "hello"
    
    return 0;
}`,
                expectedOutput: `b1: Hello
b2: hello`,
                solutionRegex: 'new char|strcpy|delete\\[\\]',
                hint: '深拷贝需要分配新内存并复制内容',
                xp: 180
            },
            references: [
                { title: '拷贝控制', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '值语义', book: 'Effective C++', chapter: '条款13-17' }
            ],
            assistantTips: [
                '值语义是C++的默认语义',
                '浅拷贝可能导致资源泄漏和double delete',
                '深拷贝需要自己管理内存分配和释放',
                '现代C++推荐使用智能指针避免手动管理'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '值语义的特点是？', 
                    options: [
                        { text: '拷贝后共享资源' }, 
                        { text: '拷贝后对象独立', correct: true }, 
                        { text: '只能通过指针使用' }, 
                        { text: '不支持拷贝' }
                    ], 
                    explanation: '值语义拷贝后创建独立副本，修改副本不影响原对象。' 
                },
                { 
                    type: 'single', 
                    question: '浅拷贝的问题是？', 
                    options: [
                        { text: '性能太低' }, 
                        { text: '可能导致double delete', correct: true }, 
                        { text: '无法拷贝' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '浅拷贝共享资源，多个对象析构时会多次释放同一内存。' 
                },
                { 
                    type: 'single', 
                    question: '深拷贝需要做什么？', 
                    options: [
                        { text: '只复制指针' }, 
                        { text: '分配新内存并复制内容', correct: true }, 
                        { text: '使用引用' }, 
                        { text: '不分配内存' }
                    ], 
                    explanation: '深拷贝需要为新对象分配独立的内存，并复制原对象的内容。' 
                },
                { 
                    type: 'single', 
                    question: 'C++默认的语义是？', 
                    options: [
                        { text: '引用语义' }, 
                        { text: '值语义', correct: true }, 
                        { text: '指针语义' }, 
                        { text: '移动语义' }
                    ], 
                    explanation: 'C++默认使用值语义，拷贝时创建独立副本。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况适合使用引用语义？', 
                    options: [
                        { text: '简单的数值类型' }, 
                        { text: '需要共享大型资源', correct: true }, 
                        { text: '所有情况' }, 
                        { text: '永远不适合' }
                    ], 
                    explanation: '当多个对象需要共享同一资源时，引用语义更合适。' 
                }
            ]
        },
        {
            id: '10.2',
            title: '行为像值的类与行为像指针的类',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 行为像值的类与行为像指针的类

### 行为像值的类（Value-like Class）

行为像值的类在拷贝时创建独立副本，修改副本不影响原对象。

\`\`\`cpp
class ValueClass {
private:
    std::string* data;
public:
    // 构造函数
    ValueClass(const std::string& s = "") 
        : data(new std::string(s)) {}
    
    // 析构函数
    ~ValueClass() { delete data; }
    
    // 拷贝构造函数（深拷贝）
    ValueClass(const ValueClass& other) 
        : data(new std::string(*other.data)) {}
    
    // 拷贝赋值运算符
    ValueClass& operator=(const ValueClass& other) {
        if (this != &other) {
            delete data;
            data = new std::string(*other.data);
        }
        return *this;
    }
};
\`\`\`

### 行为像指针的类（Pointer-like Class）

行为像指针的类在拷贝时共享资源，需要实现引用计数来管理资源生命周期。

\`\`\`cpp
class PointerClass {
private:
    std::string* data;
    size_t* count;  // 引用计数
    
public:
    // 构造函数
    PointerClass(const std::string& s = "") 
        : data(new std::string(s)), count(new size_t(1)) {}
    
    // 拷贝构造函数（共享资源）
    PointerClass(const PointerClass& other) 
        : data(other.data), count(other.count) {
        ++*count;  // 增加引用计数
    }
    
    // 析构函数
    ~PointerClass() {
        if (--*count == 0) {
            delete data;
            delete count;
        }
    }
    
    // 拷贝赋值运算符
    PointerClass& operator=(const PointerClass& other);
};
\`\`\`

### 拷贝赋值运算符的实现

行为像指针的类需要正确处理引用计数：

\`\`\`cpp
PointerClass& PointerClass::operator=(const PointerClass& other) {
    ++*other.count;  // 先增加右侧计数
    
    if (--*count == 0) {  // 减少左侧计数
        delete data;
        delete count;
    }
    
    data = other.data;
    count = other.count;
    return *this;
}
\`\`\`

### 两种类的对比

| 特性 | 行为像值的类 | 行为像指针的类 |
|------|-------------|---------------|
| 拷贝语义 | 深拷贝 | 浅拷贝+引用计数 |
| 资源管理 | 每个对象独立 | 多个对象共享 |
| 性能 | 拷贝开销大 | 拷贝开销小 |
| 实现复杂度 | 相对简单 | 需要引用计数 |
| 适用场景 | 小对象、需要独立副本 | 大对象、需要共享 |

### 使用智能指针

现代C++推荐使用智能指针实现行为像指针的类：

\`\`\`cpp
#include <memory>

class SmartPointerClass {
private:
    std::shared_ptr<std::string> data;
public:
    SmartPointerClass(const std::string& s = "") 
        : data(std::make_shared<std::string>(s)) {}
    
    // 默认的拷贝操作即可
    // shared_ptr自动管理引用计数
};
\`\`\``,
            examples: [
                {
                    title: '行为像值的类',
                    code: `#include <iostream>
#include <string>

class ValueString {
private:
    std::string* data;
public:
    ValueString(const std::string& s = "") 
        : data(new std::string(s)) {}
    
    ~ValueString() { 
        delete data; 
    }
    
    // 深拷贝构造函数
    ValueString(const ValueString& other) 
        : data(new std::string(*other.data)) {}
    
    // 深拷贝赋值
    ValueString& operator=(const ValueString& other) {
        if (this != &other) {
            delete data;
            data = new std::string(*other.data);
        }
        return *this;
    }
    
    std::string& operator*() { return *data; }
    const std::string& operator*() const { return *data; }
};

int main() {
    ValueString s1("Hello");
    ValueString s2 = s1;  // 深拷贝
    
    *s2 = "World";  // 修改s2
    
    std::cout << "s1: " << *s1 << std::endl;  // Hello
    std::cout << "s2: " << *s2 << std::endl;  // World
    
    return 0;
}`,
                    description: '行为像值的类：拷贝后对象相互独立。'
                },
                {
                    title: '行为像指针的类',
                    code: `#include <iostream>
#include <string>

class PointerString {
private:
    std::string* data;
    size_t* refCount;
    
public:
    PointerString(const std::string& s = "") 
        : data(new std::string(s)), refCount(new size_t(1)) {}
    
    // 拷贝构造：共享资源
    PointerString(const PointerString& other) 
        : data(other.data), refCount(other.refCount) {
        ++*refCount;
        std::cout << "引用计数: " << *refCount << std::endl;
    }
    
    ~PointerString() {
        if (--*refCount == 0) {
            delete data;
            delete refCount;
            std::cout << "资源已释放" << std::endl;
        } else {
            std::cout << "引用计数: " << *refCount << std::endl;
        }
    }
    
    std::string& operator*() { return *data; }
    const std::string& operator*() const { return *data; }
};

int main() {
    PointerString p1("Hello");
    PointerString p2 = p1;  // 共享资源
    
    std::cout << "p1: " << *p1 << std::endl;
    std::cout << "p2: " << *p2 << std::endl;
    
    // 修改会影响两个对象
    *p2 = "World";
    std::cout << "修改后 p1: " << *p1 << std::endl;
    std::cout << "修改后 p2: " << *p2 << std::endl;
    
    return 0;
}`,
                    description: '行为像指针的类：使用引用计数共享资源。'
                }
            ],
            handsOn: {
                title: '实现引用计数字符串类',
                description: '实现一个使用引用计数的字符串类，要求正确处理拷贝构造、析构和赋值。',
                initialCode: `#include <iostream>
#include <string>
#include <cstring>

class RefCountString {
private:
    char* data;
    size_t* refCount;
    
public:
    // 构造函数
    RefCountString(const char* str = "") {
        // TODO: 分配内存并初始化引用计数为1
    }
    
    // 拷贝构造函数
    RefCountString(const RefCountString& other) {
        // TODO: 共享资源，增加引用计数
    }
    
    // 拷贝赋值运算符
    RefCountString& operator=(const RefCountString& other) {
        // TODO: 处理自赋值，更新引用计数
        return *this;
    }
    
    // 析构函数
    ~RefCountString() {
        // TODO: 减少引用计数，必要时释放资源
    }
    
    const char* c_str() const { return data; }
    size_t getCount() const { return *refCount; }
};

int main() {
    RefCountString s1("Hello");
    std::cout << "s1 引用计数: " << s1.getCount() << std::endl;
    
    RefCountString s2 = s1;
    std::cout << "s2 引用计数: " << s2.getCount() << std::endl;
    
    RefCountString s3 = s2;
    std::cout << "s3 引用计数: " << s3.getCount() << std::endl;
    
    return 0;
}`,
                expectedOutput: `s1 引用计数: 1
s2 引用计数: 2
s3 引用计数: 3`,
                solutionRegex: 'refCount|\\+\\+\\*|--\\*',
                hint: '拷贝时增加引用计数，析构时减少引用计数',
                xp: 200
            },
            references: [
                { title: '拷贝控制', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '资源管理', book: 'Effective C++', chapter: '条款13-17' }
            ],
            assistantTips: [
                '行为像值的类需要实现深拷贝',
                '行为像指针的类需要引用计数',
                '赋值运算符要先增加右侧计数再减少左侧',
                '使用shared_ptr可以简化实现'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '行为像值的类需要实现？', 
                    options: [
                        { text: '浅拷贝' }, 
                        { text: '深拷贝', correct: true }, 
                        { text: '引用计数' }, 
                        { text: '移动语义' }
                    ], 
                    explanation: '行为像值的类需要深拷贝，确保每个对象有独立资源。' 
                },
                { 
                    type: 'single', 
                    question: '行为像指针的类使用什么管理资源？', 
                    options: [
                        { text: '深拷贝' }, 
                        { text: '引用计数', correct: true }, 
                        { text: '互斥锁' }, 
                        { text: '虚函数' }
                    ], 
                    explanation: '行为像指针的类使用引用计数跟踪共享资源的用户数量。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝赋值运算符中，应该先做什么？', 
                    options: [
                        { text: '释放左侧资源' }, 
                        { text: '增加右侧引用计数', correct: true }, 
                        { text: '减少左侧引用计数' }, 
                        { text: '删除右侧资源' }
                    ], 
                    explanation: '先增加右侧计数可以正确处理自赋值情况。' 
                },
                { 
                    type: 'single', 
                    question: 'shared_ptr实现了什么语义？', 
                    options: [
                        { text: '值语义' }, 
                        { text: '指针语义', correct: true }, 
                        { text: '移动语义' }, 
                        { text: '无语义' }
                    ], 
                    explanation: 'shared_ptr实现指针语义，多个指针可共享同一资源。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是行为像值的类的特点？', 
                    options: [
                        { text: '拷贝开销小' }, 
                        { text: '对象间共享资源' }, 
                        { text: '修改副本不影响原对象', correct: true }, 
                        { text: '需要引用计数' }
                    ], 
                    explanation: '行为像值的类拷贝后对象独立，修改副本不影响原对象。' 
                }
            ]
        },
        {
            id: '10.3',
            title: '交换操作与拷贝并交换技术',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 360,
            concepts: `## 交换操作与拷贝并交换技术

### swap函数

交换操作是拷贝控制的重要组成部分，用于高效地交换两个对象的内容。

\`\`\`cpp
// 标准库的swap
#include <utility>
std::swap(a, b);  // 交换a和b
\`\`\`

### 自定义swap函数

对于管理资源的类，应该提供自己的swap函数以提高效率：

\`\`\`cpp
class MyString {
    friend void swap(MyString& a, MyString& b);
private:
    char* data;
    size_t size;
public:
    MyString(const char* s = "");
    ~MyString();
};

// 高效的swap：只交换指针
inline void swap(MyString& a, MyString& b) {
    using std::swap;
    swap(a.data, b.data);    // 交换指针
    swap(a.size, b.size);    // 交换大小
}
\`\`\`

### 拷贝并交换技术（Copy-and-Swap）

拷贝并交换技术是一种实现赋值运算符的优雅方式：

\`\`\`cpp
class MyString {
public:
    // 拷贝赋值运算符（使用拷贝并交换）
    MyString& operator=(MyString other) {  // 注意：参数是值传递
        swap(*this, other);  // 交换资源
        return *this;
        // other析构时自动释放旧资源
    }
};
\`\`\`

### 拷贝并交换的优点

1. **代码复用**：利用拷贝构造函数
2. **自动异常安全**：拷贝失败不影响原对象
3. **自动处理自赋值**：无需显式检查
4. **统一处理拷贝和移动**：结合移动语义

### 完整示例

\`\`\`cpp
class Widget {
    friend void swap(Widget& a, Widget& b);
private:
    int* data;
public:
    // 构造函数
    Widget(int val = 0) : data(new int(val)) {}
    
    // 析构函数
    ~Widget() { delete data; }
    
    // 拷贝构造函数
    Widget(const Widget& other) 
        : data(new int(*other.data)) {}
    
    // 移动构造函数
    Widget(Widget&& other) noexcept 
        : data(other.data) {
        other.data = nullptr;
    }
    
    // 使用拷贝并交换的赋值运算符
    Widget& operator=(Widget other) {
        swap(*this, other);
        return *this;
    }
};

inline void swap(Widget& a, Widget& b) {
    using std::swap;
    swap(a.data, b.data);
}
\`\`\`

### 使用swap的场景

\`\`\`cpp
// 排序算法
std::sort(vec.begin(), vec.end());

// 容器操作
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = {4, 5, 6};
v1.swap(v2);  // 高效交换

// 强异常安全保证
void safeFunction(Widget& w) {
    Widget temp(w);  // 拷贝
    // 修改temp...
    swap(w, temp);   // 原子操作
}
\`\`\``,
            examples: [
                {
                    title: '自定义swap函数',
                    code: `#include <iostream>
#include <string>
#include <utility>

class Person {
    friend void swap(Person& a, Person& b);
private:
    std::string* name;
    int* age;
public:
    Person(const std::string& n = "", int a = 0) 
        : name(new std::string(n)), age(new int(a)) {}
    
    ~Person() {
        delete name;
        delete age;
    }
    
    // 拷贝构造函数
    Person(const Person& other) 
        : name(new std::string(*other.name)), 
          age(new int(*other.age)) {}
    
    // 使用拷贝并交换的赋值
    Person& operator=(Person other) {
        swap(*this, other);
        return *this;
    }
    
    void print() const {
        std::cout << *name << " (" << *age << ")" << std::endl;
    }
};

inline void swap(Person& a, Person& b) {
    using std::swap;
    swap(a.name, b.name);
    swap(a.age, b.age);
}

int main() {
    Person p1("Alice", 25);
    Person p2("Bob", 30);
    
    std::cout << "交换前:" << std::endl;
    p1.print();
    p2.print();
    
    swap(p1, p2);
    
    std::cout << "交换后:" << std::endl;
    p1.print();
    p2.print();
    
    return 0;
}`,
                    description: '实现自定义swap函数，高效交换对象内容。'
                },
                {
                    title: '拷贝并交换技术',
                    code: `#include <iostream>
#include <utility>

class Buffer {
    friend void swap(Buffer& a, Buffer& b);
private:
    int* data;
    size_t size;
public:
    Buffer(size_t s = 0) : data(s ? new int[s]() : nullptr), size(s) {}
    
    ~Buffer() { delete[] data; }
    
    // 拷贝构造函数
    Buffer(const Buffer& other) 
        : data(other.size ? new int[other.size] : nullptr),
          size(other.size) {
        for (size_t i = 0; i < size; ++i)
            data[i] = other.data[i];
    }
    
    // 移动构造函数
    Buffer(Buffer&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }
    
    // 使用拷贝并交换的赋值运算符
    Buffer& operator=(Buffer other) {
        swap(*this, other);
        return *this;
    }
    
    void setValue(size_t i, int val) {
        if (i < size) data[i] = val;
    }
    
    void print() const {
        for (size_t i = 0; i < size; ++i)
            std::cout << data[i] << " ";
        std::cout << std::endl;
    }
};

inline void swap(Buffer& a, Buffer& b) {
    using std::swap;
    swap(a.data, b.data);
    swap(a.size, b.size);
}

int main() {
    Buffer b1(3);
    b1.setValue(0, 1);
    b1.setValue(1, 2);
    b1.setValue(2, 3);
    
    Buffer b2(2);
    b2.setValue(0, 10);
    b2.setValue(1, 20);
    
    std::cout << "赋值前:" << std::endl;
    std::cout << "b1: "; b1.print();
    std::cout << "b2: "; b2.print();
    
    b2 = b1;  // 使用拷贝并交换
    
    std::cout << "赋值后:" << std::endl;
    std::cout << "b1: "; b1.print();
    std::cout << "b2: "; b2.print();
    
    return 0;
}`,
                    description: '使用拷贝并交换技术实现赋值运算符。'
                }
            ],
            handsOn: {
                title: '实现拷贝并交换',
                description: '为SimpleVector类实现swap函数和使用拷贝并交换技术的赋值运算符。',
                initialCode: `#include <iostream>
#include <utility>

class SimpleVector {
    friend void swap(SimpleVector& a, SimpleVector& b);
private:
    int* data;
    size_t size;
public:
    SimpleVector(size_t s = 0) 
        : data(s ? new int[s]() : nullptr), size(s) {}
    
    ~SimpleVector() { delete[] data; }
    
    // 拷贝构造函数
    SimpleVector(const SimpleVector& other) 
        : data(other.size ? new int[other.size] : nullptr),
          size(other.size) {
        for (size_t i = 0; i < size; ++i)
            data[i] = other.data[i];
    }
    
    // 移动构造函数
    SimpleVector(SimpleVector&& other) noexcept {
        // TODO: 实现移动构造
    }
    
    // 赋值运算符（使用拷贝并交换）
    SimpleVector& operator=(SimpleVector other) {
        // TODO: 使用swap实现
        return *this;
    }
    
    void push_back(int val) {
        int* newData = new int[size + 1];
        for (size_t i = 0; i < size; ++i)
            newData[i] = data[i];
        newData[size] = val;
        delete[] data;
        data = newData;
        ++size;
    }
    
    void print() const {
        for (size_t i = 0; i < size; ++i)
            std::cout << data[i] << " ";
        std::cout << std::endl;
    }
};

// swap函数
inline void swap(SimpleVector& a, SimpleVector& b) {
    // TODO: 实现swap
}

int main() {
    SimpleVector v1;
    v1.push_back(1);
    v1.push_back(2);
    
    SimpleVector v2;
    v2.push_back(3);
    
    std::cout << "赋值前:" << std::endl;
    std::cout << "v1: "; v1.print();
    std::cout << "v2: "; v2.print();
    
    v2 = v1;
    
    std::cout << "赋值后:" << std::endl;
    std::cout << "v1: "; v1.print();
    std::cout << "v2: "; v2.print();
    
    return 0;
}`,
                expectedOutput: `赋值前:
v1: 1 2 
v2: 3 
赋值后:
v1: 1 2 
v2: 1 2 `,
                solutionRegex: 'swap\\(a\\.data|swap\\(a\\.size|swap\\(\\*this',
                hint: 'swap函数交换成员变量，赋值运算符使用swap(*this, other)',
                xp: 180
            },
            references: [
                { title: '拷贝控制', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '拷贝并交换', book: 'Effective C++', chapter: '条款11' }
            ],
            assistantTips: [
                '自定义swap可以提高交换效率',
                '拷贝并交换自动处理自赋值',
                '拷贝并交换提供强异常安全保证',
                '参数是值传递，会调用拷贝或移动构造函数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'swap函数应该声明为什么？', 
                    options: [
                        { text: '成员函数' }, 
                        { text: '友元函数', correct: true }, 
                        { text: '静态函数' }, 
                        { text: '虚函数' }
                    ], 
                    explanation: 'swap通常声明为友元函数，可以访问私有成员。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝并交换技术的赋值运算符参数是？', 
                    options: [
                        { text: 'const引用' }, 
                        { text: '值传递', correct: true }, 
                        { text: '右值引用' }, 
                        { text: '指针' }
                    ], 
                    explanation: '值传递参数会调用拷贝或移动构造函数，然后交换。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝并交换技术的优点是？', 
                    options: [
                        { text: '性能最优' }, 
                        { text: '自动异常安全', correct: true }, 
                        { text: '减少代码量' }, 
                        { text: '支持多态' }
                    ], 
                    explanation: '拷贝失败不影响原对象，交换操作不会失败，提供强异常安全。' 
                },
                { 
                    type: 'single', 
                    question: '自定义swap应该使用什么命名空间？', 
                    options: [
                        { text: 'std命名空间' }, 
                        { text: '与类相同的命名空间', correct: true }, 
                        { text: '全局命名空间' }, 
                        { text: '匿名命名空间' }
                    ], 
                    explanation: '自定义swap应放在与类相同的命名空间，以便ADL查找。' 
                },
                { 
                    type: 'single', 
                    question: 'swap函数内部应该使用？', 
                    options: [
                        { text: 'std::swap' }, 
                        { text: 'using std::swap; swap(...)', correct: true }, 
                        { text: '自定义swap' }, 
                        { text: 'memcpy' }
                    ], 
                    explanation: '使用using std::swap可以让编译器选择最佳swap版本。' 
                }
            ]
        },
        {
            id: '10.4',
            title: '引用限定符 & 与 &&',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 引用限定符 & 与 &&

### 什么是引用限定符？

引用限定符（Reference Qualifier）用于指定成员函数只能在左值对象或右值对象上调用。

\`\`\`cpp
class MyClass {
public:
    void foo() &;   // 只能在左值对象上调用
    void foo() &&;  // 只能在右值对象上调用
};
\`\`\`

### 左值引用限定符 &

使用 & 限定的成员函数只能在左值对象上调用：

\`\`\`cpp
class String {
private:
    std::string data;
public:
    // 返回引用，避免拷贝
    std::string& get() & {
        return data;
    }
};

String s;
s.get();  // OK：s是左值
String().get();  // 错误：临时对象是右值
\`\`\`

### 右值引用限定符 &&

使用 && 限定的成员函数只能在右值对象上调用：

\`\`\`cpp
class String {
private:
    std::string data;
public:
    // 返回值，允许移动
    std::string get() && {
        return std::move(data);
    }
};

String s;
s.get();  // 错误：s是左值
String().get();  // OK：临时对象是右值
\`\`\`

### 重载成员函数

可以同时提供 & 和 && 版本：

\`\`\`cpp
class Container {
private:
    std::vector<int> data;
public:
    // 左值版本：返回引用
    std::vector<int>& getData() & {
        return data;
    }
    
    // 右值版本：返回值（移动）
    std::vector<int> getData() && {
        return std::move(data);
    }
};

Container c;
auto& ref = c.getData();      // 调用左值版本
auto val = Container().getData();  // 调用右值版本
\`\`\`

### 与const的组合

引用限定符可以与const组合使用：

\`\`\`cpp
class Widget {
public:
    void process() const &;   // const左值
    void process() const &&;  // const右值
    void process() &;         // 非const左值
    void process() &&;        // 非const右值
};
\`\`\`

### 实际应用场景

1. **优化资源访问**：右值对象可以移动资源
2. **防止误用**：禁止在临时对象上调用危险操作
3. **链式调用**：支持移动语义的链式操作

\`\`\`cpp
class StringBuilder {
private:
    std::string data;
public:
    StringBuilder& append(const std::string& s) & {
        data += s;
        return *this;
    }
    
    StringBuilder&& append(const std::string& s) && {
        data += s;
        return std::move(*this);
    }
    
    std::string build() && {
        return std::move(data);
    }
};

// 链式调用
std::string result = StringBuilder()
    .append("Hello")
    .append(" ")
    .append("World")
    .build();
\`\`\``,
            examples: [
                {
                    title: '引用限定符基础',
                    code: `#include <iostream>
#include <string>
#include <utility>

class Resource {
private:
    std::string name;
public:
    Resource(const std::string& n) : name(n) {}
    
    // 左值版本：返回引用
    std::string& getName() & {
        std::cout << "左值版本" << std::endl;
        return name;
    }
    
    // 右值版本：返回值（移动）
    std::string getName() && {
        std::cout << "右值版本" << std::endl;
        return std::move(name);
    }
    
    void print() const {
        std::cout << "Resource: " << name << std::endl;
    }
};

int main() {
    Resource r1("Data");
    
    // 左值调用
    std::string& ref = r1.getName();
    std::cout << "获取引用: " << ref << std::endl;
    
    // 右值调用
    std::string val = Resource("Temp").getName();
    std::cout << "获取值: " << val << std::endl;
    
    return 0;
}`,
                    description: '展示引用限定符的基本用法。'
                },
                {
                    title: '链式调用优化',
                    code: `#include <iostream>
#include <string>
#include <utility>

class QueryBuilder {
private:
    std::string query;
public:
    QueryBuilder& select(const std::string& columns) & {
        query = "SELECT " + columns;
        return *this;
    }
    
    QueryBuilder&& select(const std::string& columns) && {
        query = "SELECT " + columns;
        return std::move(*this);
    }
    
    QueryBuilder& from(const std::string& table) & {
        query += " FROM " + table;
        return *this;
    }
    
    QueryBuilder&& from(const std::string& table) && {
        query += " FROM " + table;
        return std::move(*this);
    }
    
    QueryBuilder& where(const std::string& condition) & {
        query += " WHERE " + condition;
        return *this;
    }
    
    QueryBuilder&& where(const std::string& condition) && {
        query += " WHERE " + condition;
        return std::move(*this);
    }
    
    std::string build() && {
        return std::move(query);
    }
    
    const std::string& getQuery() const & {
        return query;
    }
};

int main() {
    // 右值链式调用
    std::string sql = QueryBuilder()
        .select("id, name")
        .from("users")
        .where("age > 18")
        .build();
    
    std::cout << "SQL: " << sql << std::endl;
    
    // 左值分步调用
    QueryBuilder builder;
    builder.select("id");
    builder.from("products");
    builder.where("price < 100");
    
    std::cout << "Query: " << builder.getQuery() << std::endl;
    
    return 0;
}`,
                    description: '使用引用限定符实现高效的链式调用。'
                }
            ],
            handsOn: {
                title: '实现引用限定符',
                description: '为Config类实现带引用限定符的getter方法，左值返回引用，右值返回值。',
                initialCode: `#include <iostream>
#include <string>
#include <utility>

class Config {
private:
    std::string host;
    int port;
public:
    Config(const std::string& h = "", int p = 0) 
        : host(h), port(p) {}
    
    // TODO: 实现左值版本的getHost，返回引用
    std::string& getHost() {
        // 返回host的引用
    }
    
    // TODO: 实现右值版本的getHost，返回值
    std::string getHost() {
        // 返回移动后的host
    }
    
    // TODO: 实现左值版本的getPort
    int& getPort() {
        // 返回port的引用
    }
    
    // TODO: 实现右值版本的getPort
    int getPort() {
        // 返回port的值
    }
    
    void setHost(const std::string& h) { host = h; }
    void setPort(int p) { port = p; }
};

int main() {
    // 左值测试
    Config cfg("localhost", 8080);
    std::string& hostRef = cfg.getHost();
    int& portRef = cfg.getPort();
    
    std::cout << "左值引用: " << hostRef << ":" << portRef << std::endl;
    
    // 右值测试
    std::string hostVal = Config("example.com", 443).getHost();
    int portVal = Config("example.com", 443).getPort();
    
    std::cout << "右值值: " << hostVal << ":" << portVal << std::endl;
    
    return 0;
}`,
                expectedOutput: `左值引用: localhost:8080
右值值: example.com:443`,
                solutionRegex: '&\\s*$|&&\\s*$|std::move',
                hint: '左值方法后加 &，右值方法后加 &&，右值版本使用std::move',
                xp: 160
            },
            references: [
                { title: '成员函数与引用限定符', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '现代C++特性', book: 'Effective Modern C++', chapter: '条款12' }
            ],
            assistantTips: [
                '& 限定符表示只能对左值调用',
                '&& 限定符表示只能对右值调用',
                '可以同时提供两个版本实现不同行为',
                '右值版本通常用于移动资源'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '引用限定符 & 表示什么？', 
                    options: [
                        { text: '返回引用' }, 
                        { text: '只能对左值对象调用', correct: true }, 
                        { text: '参数是引用' }, 
                        { text: '只能对右值对象调用' }
                    ], 
                    explanation: '& 限定符表示成员函数只能在左值对象上调用。' 
                },
                { 
                    type: 'single', 
                    question: '引用限定符 && 表示什么？', 
                    options: [
                        { text: '返回右值引用' }, 
                        { text: '只能对右值对象调用', correct: true }, 
                        { text: '参数是右值引用' }, 
                        { text: '只能对左值对象调用' }
                    ], 
                    explanation: '&& 限定符表示成员函数只能在右值对象上调用。' 
                },
                { 
                    type: 'single', 
                    question: '可以同时提供 & 和 && 版本吗？', 
                    options: [
                        { text: '不可以' }, 
                        { text: '可以，这是重载', correct: true }, 
                        { text: '只能提供一个' }, 
                        { text: '会导致编译错误' }
                    ], 
                    explanation: '可以同时提供两个版本，编译器根据对象是左值还是右值选择。' 
                },
                { 
                    type: 'single', 
                    question: '临时对象是左值还是右值？', 
                    options: [
                        { text: '左值' }, 
                        { text: '右值', correct: true }, 
                        { text: '都不是' }, 
                        { text: '取决于类型' }
                    ], 
                    explanation: '临时对象（如函数返回的对象）是右值。' 
                },
                { 
                    type: 'single', 
                    question: '右值版本的成员函数通常做什么？', 
                    options: [
                        { text: '返回引用' }, 
                        { text: '移动资源', correct: true }, 
                        { text: '拷贝资源' }, 
                        { text: '什么都不做' }
                    ], 
                    explanation: '右值版本通常移动资源，因为对象即将销毁。' 
                }
            ]
        },
        {
            id: '10.5',
            title: '移动语义的实践应用',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 移动语义的实践应用

### 移动语义回顾

移动语义允许资源从一个对象转移到另一个对象，避免不必要的拷贝。

\`\`\`cpp
// 拷贝：复制资源
std::string s1 = "Hello";
std::string s2 = s1;  // 复制字符串内容

// 移动：转移资源
std::string s3 = std::move(s1);  // s1的资源转移给s3
// s1现在为空
\`\`\`

### 移动构造函数

\`\`\`cpp
class Buffer {
private:
    int* data;
    size_t size;
public:
    // 移动构造函数
    Buffer(Buffer&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;  // 置空源对象
        other.size = 0;
    }
};
\`\`\`

### 移动赋值运算符

\`\`\`cpp
class Buffer {
public:
    // 移动赋值运算符
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;        // 释放当前资源
            data = other.data;    // 接管资源
            size = other.size;
            other.data = nullptr; // 置空源对象
            other.size = 0;
        }
        return *this;
    }
};
\`\`\`

### 实践应用场景

#### 1. 容器操作

\`\`\`cpp
std::vector<std::string> vec;
std::string s = "Hello";

vec.push_back(s);              // 拷贝
vec.push_back(std::move(s));   // 移动，s变为空
vec.push_back("World");        // 移动临时对象
\`\`\`

#### 2. 函数返回值

\`\`\`cpp
std::vector<int> createVector() {
    std::vector<int> result;
    result.push_back(1);
    result.push_back(2);
    return result;  // 自动移动或RVO
}

auto vec = createVector();  // 无拷贝
\`\`\`

#### 3. 工厂函数

\`\`\`cpp
class Widget {
public:
    static Widget create() {
        return Widget();  // 移动或RVO
    }
};

Widget w = Widget::create();
\`\`\`

#### 4. 资源管理

\`\`\`cpp
class FileHandle {
private:
    FILE* file;
public:
    FileHandle(const char* filename) 
        : file(fopen(filename, "r")) {}
    
    ~FileHandle() { 
        if (file) fclose(file); 
    }
    
    // 移动构造
    FileHandle(FileHandle&& other) noexcept 
        : file(other.file) {
        other.file = nullptr;
    }
    
    // 禁止拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};
\`\`\`

### std::move的使用时机

\`\`\`cpp
// 正确：转移即将销毁的对象
std::string process(std::string s) {
    return std::move(s);  // 或直接return s;
}

// 错误：转移后继续使用
std::string name = "Alice";
std::string other = std::move(name);
std::cout << name;  // 危险：name可能为空

// 正确：转移容器内容
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = std::move(v1);
// v1现在为空
\`\`\`

### 性能优化示例

\`\`\`cpp
// 拷贝版本
std::vector<std::string> copyStrings(const std::vector<std::string>& src) {
    std::vector<std::string> result;
    for (const auto& s : src) {
        result.push_back(s);  // 每次拷贝
    }
    return result;
}

// 移动版本
std::vector<std::string> moveStrings(std::vector<std::string> src) {
    std::vector<std::string> result;
    for (auto& s : src) {
        result.push_back(std::move(s));  // 每次移动
    }
    return result;
}
\`\`\``,
            examples: [
                {
                    title: '移动语义优化性能',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <utility>

class BigData {
private:
    std::vector<int> data;
public:
    BigData(size_t size = 0) : data(size, 0) {}
    
    // 拷贝构造
    BigData(const BigData& other) : data(other.data) {
        std::cout << "拷贝构造: " << data.size() << " 个元素" << std::endl;
    }
    
    // 移动构造
    BigData(BigData&& other) noexcept 
        : data(std::move(other.data)) {
        std::cout << "移动构造: " << data.size() << " 个元素" << std::endl;
    }
    
    // 拷贝赋值
    BigData& operator=(const BigData& other) {
        data = other.data;
        std::cout << "拷贝赋值: " << data.size() << " 个元素" << std::endl;
        return *this;
    }
    
    // 移动赋值
    BigData& operator=(BigData&& other) noexcept {
        data = std::move(other.data);
        std::cout << "移动赋值: " << data.size() << " 个元素" << std::endl;
        return *this;
    }
    
    size_t size() const { return data.size(); }
};

int main() {
    std::cout << "创建对象:" << std::endl;
    BigData d1(1000);
    
    std::cout << "\\n拷贝操作:" << std::endl;
    BigData d2 = d1;  // 拷贝构造
    
    std::cout << "\\n移动操作:" << std::endl;
    BigData d3 = std::move(d1);  // 移动构造
    
    std::cout << "\\n移动后d1大小: " << d1.size() << std::endl;
    std::cout << "d3大小: " << d3.size() << std::endl;
    
    return 0;
}`,
                    description: '展示移动语义如何避免不必要的拷贝。'
                },
                {
                    title: '容器中的移动语义',
                    code: `#include <iostream>
#include <vector>
#include <string>
#include <utility>

class Message {
private:
    std::string content;
    int id;
public:
    Message(int i, const std::string& c) : id(i), content(c) {}
    
    // 移动构造
    Message(Message&& other) noexcept 
        : id(other.id), content(std::move(other.content)) {
        other.id = 0;
        std::cout << "移动消息 " << id << std::endl;
    }
    
    // 拷贝构造
    Message(const Message& other) 
        : id(other.id), content(other.content) {
        std::cout << "拷贝消息 " << id << std::endl;
    }
    
    const std::string& getContent() const { return content; }
    int getId() const { return id; }
};

int main() {
    std::vector<Message> messages;
    
    std::cout << "添加消息（拷贝）:" << std::endl;
    Message m1(1, "Hello");
    messages.push_back(m1);
    
    std::cout << "\\n添加消息（移动）:" << std::endl;
    Message m2(2, "World");
    messages.push_back(std::move(m2));
    
    std::cout << "\\n添加临时消息:" << std::endl;
    messages.push_back(Message(3, "Temp"));
    
    std::cout << "\\n消息列表:" << std::endl;
    for (const auto& msg : messages) {
        std::cout << "ID: " << msg.getId() 
                  << ", 内容: " << msg.getContent() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示容器操作中移动语义的应用。'
                }
            ],
            handsOn: {
                title: '实现移动语义',
                description: '为DynamicArray类实现移动构造函数和移动赋值运算符。',
                initialCode: `#include <iostream>
#include <utility>

class DynamicArray {
private:
    int* data;
    size_t size;
    
public:
    DynamicArray(size_t s = 0) 
        : data(s ? new int[s]() : nullptr), size(s) {}
    
    ~DynamicArray() { delete[] data; }
    
    // 拷贝构造函数
    DynamicArray(const DynamicArray& other) 
        : data(other.size ? new int[other.size] : nullptr),
          size(other.size) {
        for (size_t i = 0; i < size; ++i)
            data[i] = other.data[i];
    }
    
    // TODO: 实现移动构造函数
    DynamicArray(DynamicArray&& other) noexcept {
        // 移动资源，置空源对象
    }
    
    // 拷贝赋值运算符
    DynamicArray& operator=(const DynamicArray& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = size ? new int[size] : nullptr;
            for (size_t i = 0; i < size; ++i)
                data[i] = other.data[i];
        }
        return *this;
    }
    
    // TODO: 实现移动赋值运算符
    DynamicArray& operator=(DynamicArray&& other) noexcept {
        // 释放当前资源，接管新资源，置空源对象
        return *this;
    }
    
    void setValue(size_t i, int val) {
        if (i < size) data[i] = val;
    }
    
    int getValue(size_t i) const {
        return (i < size) ? data[i] : 0;
    }
    
    size_t getSize() const { return size; }
};

int main() {
    DynamicArray arr1(5);
    for (size_t i = 0; i < 5; ++i)
        arr1.setValue(i, i * 10);
    
    std::cout << "arr1 大小: " << arr1.getSize() << std::endl;
    
    // 移动构造
    DynamicArray arr2 = std::move(arr1);
    std::cout << "移动后 arr1 大小: " << arr1.getSize() << std::endl;
    std::cout << "arr2 大小: " << arr2.getSize() << std::endl;
    std::cout << "arr2[2] = " << arr2.getValue(2) << std::endl;
    
    // 移动赋值
    DynamicArray arr3;
    arr3 = std::move(arr2);
    std::cout << "移动后 arr2 大小: " << arr2.getSize() << std::endl;
    std::cout << "arr3 大小: " << arr3.getSize() << std::endl;
    
    return 0;
}`,
                expectedOutput: `arr1 大小: 5
移动后 arr1 大小: 0
arr2 大小: 5
arr2[2] = 20
移动后 arr2 大小: 0
arr3 大小: 5`,
                solutionRegex: 'other\\.data|other\\.size|nullptr',
                hint: '移动构造：直接接管资源，置空源对象。移动赋值：先释放当前资源，再接管。',
                xp: 200
            },
            references: [
                { title: '移动语义', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '移动语义', book: 'Effective Modern C++', chapter: '条款17-25' }
            ],
            assistantTips: [
                '移动操作应该标记为noexcept',
                '移动后源对象应该处于有效但未定义的状态',
                'std::move只是类型转换，不执行移动',
                '优先使用移动而非拷贝来优化性能'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '移动构造函数的参数是？', 
                    options: [
                        { text: 'const左值引用' }, 
                        { text: '右值引用', correct: true }, 
                        { text: '指针' }, 
                        { text: '值传递' }
                    ], 
                    explanation: '移动构造函数接受右值引用参数。' 
                },
                { 
                    type: 'single', 
                    question: '移动操作应该标记为什么？', 
                    options: [
                        { text: 'inline' }, 
                        { text: 'noexcept', correct: true }, 
                        { text: 'virtual' }, 
                        { text: 'static' }
                    ], 
                    explanation: '移动操作标记noexcept可以让容器更好地优化。' 
                },
                { 
                    type: 'single', 
                    question: 'std::move的作用是？', 
                    options: [
                        { text: '执行移动操作' }, 
                        { text: '将左值转换为右值引用', correct: true }, 
                        { text: '拷贝对象' }, 
                        { text: '删除对象' }
                    ], 
                    explanation: 'std::move只是类型转换，实际移动由移动构造函数完成。' 
                },
                { 
                    type: 'single', 
                    question: '移动后源对象应该处于什么状态？', 
                    options: [
                        { text: '无效状态' }, 
                        { text: '有效但未定义的状态', correct: true }, 
                        { text: '与原来相同' }, 
                        { text: '必须为空' }
                    ], 
                    explanation: '移动后源对象应该可以安全析构和赋值，但值未定义。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个场景适合使用移动语义？', 
                    options: [
                        { text: '需要保留原对象时' }, 
                        { text: '函数返回局部对象', correct: true }, 
                        { text: '需要深拷贝时' }, 
                        { text: '对象很小不需要优化' }
                    ], 
                    explanation: '函数返回局部对象时，移动语义可以避免拷贝。' 
                }
            ]
        },
        {
            id: '10.6',
            title: '拷贝省略与返回值优化（RVO）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 360,
            concepts: `## 拷贝省略与返回值优化（RVO）

### 什么是拷贝省略？

拷贝省略（Copy Elision）是编译器优化技术，避免不必要的拷贝或移动操作。

### 返回值优化（RVO）

RVO（Return Value Optimization）是最常见的拷贝省略形式：

\`\`\`cpp
std::string createString() {
    return std::string("Hello");  // RVO：直接在调用处构造
}

std::string s = createString();  // 无拷贝，无移动
\`\`\`

### 具名返回值优化（NRVO）

NRVO（Named Return Value Optimization）优化具名局部变量：

\`\`\`cpp
std::vector<int> createVector() {
    std::vector<int> result;  // 具名局部变量
    result.push_back(1);
    result.push_back(2);
    return result;  // NRVO：可能直接在调用处构造
}

auto vec = createVector();  // 可能无拷贝
\`\`\`

### C++17保证的拷贝省略

C++17标准保证在某些情况下的拷贝省略：

\`\`\`cpp
// C++17保证无拷贝
Widget w1 = Widget();           // 直接构造
Widget w2 = createWidget();     // 直接构造（prvalue）

// 以下情况C++17保证省略
T x = T(T(T()));  // 直接构造，无任何拷贝/移动
\`\`\`

### 拷贝省略的条件

#### 保证省略（C++17）

1. **prvalue初始化同类型对象**：
\`\`\`cpp
T x = T();       // 保证省略
T y = createT(); // 保证省略（如果返回prvalue）
\`\`\`

2. **函数返回prvalue**：
\`\`\`cpp
T func() {
    return T();  // 保证省略
}
\`\`\`

#### 非保证省略（编译器优化）

1. **NRVO**：
\`\`\`cpp
T func() {
    T result;
    return result;  // 可能省略，但不保证
}
\`\`\`

2. **异常处理**：
\`\`\`cpp
try {
    throw T();  // 可能省略
} catch (T e) {  // 可能省略
}
\`\`\`

### 验证拷贝省略

\`\`\`cpp
#include <iostream>

class Tracker {
public:
    Tracker() { std::cout << "构造\\n"; }
    Tracker(const Tracker&) { std::cout << "拷贝\\n"; }
    Tracker(Tracker&&) { std::cout << "移动\\n"; }
    ~Tracker() { std::cout << "析构\\n"; }
};

Tracker create() {
    return Tracker();  // C++17保证无拷贝/移动
}

int main() {
    std::cout << "开始\\n";
    Tracker t = create();
    std::cout << "结束\\n";
    // 输出：
    // 开始
    // 构造
    // 结束
    // 析构
}
\`\`\`

### 禁用拷贝省略

使用编译器选项可以禁用拷贝省略：

\`\`\`bash
# GCC/Clang
g++ -fno-elide-constructors

# MSVC
cl /Od
\`\`\`

### 实践建议

1. **依赖RVO**：返回值优化很可靠
2. **不要过度优化**：让编译器做优化
3. **理解限制**：NRVO不总是可行
4. **C++17优先**：保证的拷贝省略更可靠

\`\`\`cpp
// 好的做法：让编译器优化
std::string process(const std::string& input) {
    std::string result = input;
    // 处理result...
    return result;  // NRVO
}

// 不必要的"优化"
std::string process_bad(const std::string& input) {
    std::string result = input;
    return std::move(result);  // 阻止NRVO！
}
\`\`\``,
            examples: [
                {
                    title: 'RVO演示',
                    code: `#include <iostream>

class Counter {
public:
    static int constructions;
    static int copies;
    static int moves;
    
    Counter() { ++constructions; std::cout << "构造\\n"; }
    Counter(const Counter&) { ++copies; std::cout << "拷贝\\n"; }
    Counter(Counter&&) { ++moves; std::cout << "移动\\n"; }
    ~Counter() { std::cout << "析构\\n"; }
};

int Counter::constructions = 0;
int Counter::copies = 0;
int Counter::moves = 0;

Counter createRVO() {
    return Counter();  // RVO
}

Counter createNRVO() {
    Counter c;  // NRVO
    return c;
}

int main() {
    std::cout << "=== RVO测试 ===" << std::endl;
    {
        Counter c1 = createRVO();
    }
    
    std::cout << "\\n=== NRVO测试 ===" << std::endl;
    {
        Counter c2 = createNRVO();
    }
    
    std::cout << "\\n统计:" << std::endl;
    std::cout << "构造: " << Counter::constructions << std::endl;
    std::cout << "拷贝: " << Counter::copies << std::endl;
    std::cout << "移动: " << Counter::moves << std::endl;
    
    return 0;
}`,
                    description: '演示RVO和NRVO的效果。'
                },
                {
                    title: 'C++17保证的拷贝省略',
                    code: `#include <iostream>
#include <vector>

class Widget {
public:
    Widget() { std::cout << "Widget构造\\n"; }
    Widget(const Widget&) { std::cout << "Widget拷贝\\n"; }
    Widget(Widget&&) { std::cout << "Widget移动\\n"; }
    ~Widget() { std::cout << "Widget析构\\n"; }
};

Widget createWidget() {
    return Widget();  // C++17保证省略
}

Widget createWidgetChain() {
    // C++17保证：整个链都省略
    return Widget(Widget(Widget()));
}

int main() {
    std::cout << "=== 直接构造 ===" << std::endl;
    {
        Widget w = Widget();
    }
    
    std::cout << "\\n=== 函数返回 ===" << std::endl;
    {
        Widget w = createWidget();
    }
    
    std::cout << "\\n=== 链式构造 ===" << std::endl;
    {
        Widget w = createWidgetChain();
    }
    
    std::cout << "\\n=== 容器中 ===" << std::endl;
    {
        std::vector<Widget> vec;
        vec.push_back(Widget());  // 可能一次移动
    }
    
    return 0;
}`,
                    description: '展示C++17保证的拷贝省略。'
                }
            ],
            handsOn: {
                title: '验证拷贝省略',
                description: '创建一个类来验证不同场景下的拷贝省略效果。',
                initialCode: `#include <iostream>
#include <string>

class TestObject {
public:
    static int defaultCtor;
    static int copyCtor;
    static int moveCtor;
    
    std::string name;
    
    TestObject(const std::string& n = "") : name(n) {
        // TODO: 增加默认构造计数
        std::cout << "默认构造: " << name << std::endl;
    }
    
    TestObject(const TestObject& other) : name(other.name) {
        // TODO: 增加拷贝构造计数
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    TestObject(TestObject&& other) : name(std::move(other.name)) {
        // TODO: 增加移动构造计数
        std::cout << "移动构造: " << name << std::endl;
    }
    
    ~TestObject() {
        std::cout << "析构: " << name << std::endl;
    }
};

int TestObject::defaultCtor = 0;
int TestObject::copyCtor = 0;
int TestObject::moveCtor = 0;

// TODO: 实现返回prvalue的函数
TestObject createDirect() {
    // 直接返回临时对象
}

// TODO: 实现返回具名对象的函数
TestObject createNamed() {
    // 创建具名对象并返回
}

int main() {
    std::cout << "=== 测试RVO ===" << std::endl;
    {
        TestObject obj = createDirect();
    }
    
    std::cout << "\\n=== 测试NRVO ===" << std::endl;
    {
        TestObject obj = createNamed();
    }
    
    std::cout << "\\n=== 统计 ===" << std::endl;
    std::cout << "默认构造: " << TestObject::defaultCtor << std::endl;
    std::cout << "拷贝构造: " << TestObject::copyCtor << std::endl;
    std::cout << "移动构造: " << TestObject::moveCtor << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 测试RVO ===
默认构造: RVO
析构: RVO

=== 测试NRVO ===
默认构造: NRVO
析构: NRVO

=== 统计 ===
默认构造: 2
拷贝构造: 0
移动构造: 0`,
                solutionRegex: 'return TestObject|return obj|\\+\\+defaultCtor|\\+\\+copyCtor|\\+\\+moveCtor',
                hint: 'RVO函数直接返回临时对象，NRVO函数创建具名对象后返回',
                xp: 160
            },
            references: [
                { title: '拷贝省略', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: 'RVO', book: 'Effective Modern C++', chapter: '条款25' }
            ],
            assistantTips: [
                'C++17保证了prvalue的拷贝省略',
                '不要在return语句中使用std::move',
                'NRVO是优化，不保证总是发生',
                '让编译器自动优化，不要过度手动优化'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'RVO是什么的缩写？', 
                    options: [
                        { text: 'Return Value Operation' }, 
                        { text: 'Return Value Optimization', correct: true }, 
                        { text: 'Reference Value Optimization' }, 
                        { text: 'Runtime Value Optimization' }
                    ], 
                    explanation: 'RVO是Return Value Optimization（返回值优化）的缩写。' 
                },
                { 
                    type: 'single', 
                    question: 'NRVO与RVO的区别是？', 
                    options: [
                        { text: 'NRVO更高效' }, 
                        { text: 'NRVO优化具名局部变量', correct: true }, 
                        { text: 'RVO优化具名变量' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: 'NRVO（Named RVO）优化具名局部变量的返回。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17是否保证RVO？', 
                    options: [
                        { text: '不保证' }, 
                        { text: '只保证prvalue情况', correct: true }, 
                        { text: '完全保证' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: 'C++17保证prvalue初始化同类型对象时的拷贝省略。' 
                },
                { 
                    type: 'single', 
                    question: 'return std::move(result)的问题是什么？', 
                    options: [
                        { text: '编译错误' }, 
                        { text: '阻止NRVO', correct: true }, 
                        { text: '性能更好' }, 
                        { text: '没有问题' }
                    ], 
                    explanation: '使用std::move会阻止NRVO优化，应该直接return result。' 
                },
                { 
                    type: 'single', 
                    question: '拷贝省略的好处是？', 
                    options: [
                        { text: '减少代码量' }, 
                        { text: '避免不必要的拷贝/移动', correct: true }, 
                        { text: '增加类型安全' }, 
                        { text: '支持多态' }
                    ], 
                    explanation: '拷贝省略避免不必要的拷贝或移动操作，提高性能。' 
                }
            ]
        },
        {
            id: '10.7',
            title: '三五法则与零法则',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## 三五法则与零法则

### 三法则（Rule of Three）

如果一个类需要自定义以下任何一个，那么它很可能需要自定义全部三个：

1. **析构函数**
2. **拷贝构造函数**
3. **拷贝赋值运算符**

\`\`\`cpp
class ResourceOwner {
private:
    int* data;
public:
    // 析构函数
    ~ResourceOwner() { delete data; }
    
    // 拷贝构造函数
    ResourceOwner(const ResourceOwner& other) 
        : data(new int(*other.data)) {}
    
    // 拷贝赋值运算符
    ResourceOwner& operator=(const ResourceOwner& other) {
        if (this != &other) {
            delete data;
            data = new int(*other.data);
        }
        return *this;
    }
};
\`\`\`

### 五法则（Rule of Five）

C++11引入移动语义后，三法则扩展为五法则：

1. **析构函数**
2. **拷贝构造函数**
3. **拷贝赋值运算符**
4. **移动构造函数**
5. **移动赋值运算符**

\`\`\`cpp
class ResourceOwner {
public:
    // 析构函数
    ~ResourceOwner() { delete data; }
    
    // 拷贝构造函数
    ResourceOwner(const ResourceOwner& other) 
        : data(new int(*other.data)) {}
    
    // 拷贝赋值运算符
    ResourceOwner& operator=(const ResourceOwner& other);
    
    // 移动构造函数
    ResourceOwner(ResourceOwner&& other) noexcept 
        : data(other.data) {
        other.data = nullptr;
    }
    
    // 移动赋值运算符
    ResourceOwner& operator=(ResourceOwner&& other) noexcept;
};
\`\`\`

### 零法则（Rule of Zero）

现代C++推荐零法则：让编译器自动生成所有特殊成员函数。

使用智能指针和标准库类型：

\`\`\`cpp
#include <memory>
#include <string>
#include <vector>

class ModernClass {
private:
    std::unique_ptr<int> data;
    std::string name;
    std::vector<double> values;
    
public:
    // 不需要任何特殊成员函数！
    // 编译器自动生成正确的版本
    
    ModernClass(int val, const std::string& n) 
        : data(std::make_unique<int>(val)), name(n) {}
};
\`\`\`

### 三法则示例

\`\`\`cpp
class CString {
private:
    char* data;
public:
    // 构造函数
    CString(const char* s = "") {
        data = new char[strlen(s) + 1];
        strcpy(data, s);
    }
    
    // 1. 析构函数
    ~CString() {
        delete[] data;
    }
    
    // 2. 拷贝构造函数
    CString(const CString& other) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
    }
    
    // 3. 拷贝赋值运算符
    CString& operator=(const CString& other) {
        if (this != &other) {
            delete[] data;
            data = new char[strlen(other.data) + 1];
            strcpy(data, other.data);
        }
        return *this;
    }
};
\`\`\`

### 五法则示例

\`\`\`cpp
class CString {
private:
    char* data;
public:
    // 构造函数
    CString(const char* s = "");
    
    // 1. 析构函数
    ~CString();
    
    // 2. 拷贝构造函数
    CString(const CString& other);
    
    // 3. 拷贝赋值运算符
    CString& operator=(const CString& other);
    
    // 4. 移动构造函数
    CString(CString&& other) noexcept : data(other.data) {
        other.data = nullptr;
    }
    
    // 5. 移动赋值运算符
    CString& operator=(CString&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            other.data = nullptr;
        }
        return *this;
    }
};
\`\`\`

### 零法则示例

\`\`\`cpp
#include <memory>
#include <string>

// 使用智能指针，遵循零法则
class SmartString {
private:
    std::unique_ptr<std::string> data;
    
public:
    SmartString(const std::string& s = "") 
        : data(std::make_unique<std::string>(s)) {}
    
    // 不需要析构函数
    // 不需要拷贝操作（unique_ptr不可拷贝）
    // 移动操作自动生成
    
    const std::string& get() const { return *data; }
};

// 使用标准容器，遵循零法则
class DataContainer {
private:
    std::vector<int> numbers;
    std::string label;
    
public:
    // 所有特殊成员函数自动生成
    // 拷贝、移动、析构都正确
    
    void add(int n) { numbers.push_back(n); }
};
\`\`\`

### 何时使用哪个法则？

| 法则 | 适用场景 | 复杂度 |
|------|----------|--------|
| 零法则 | 使用智能指针和标准库 | 最低 |
| 三法则 | 管理资源，不需要移动 | 中等 |
| 五法则 | 管理资源，需要移动优化 | 较高 |

### 最佳实践

1. **优先零法则**：使用智能指针和RAII类型
2. **需要资源管理时**：实现五法则
3. **使用=default和=delete**：明确意图
4. **遵循RAII原则**：资源获取即初始化

\`\`\`cpp
class BestPractice {
private:
    std::unique_ptr<Resource> resource;
    
public:
    BestPractice() = default;
    ~BestPractice() = default;
    
    // 禁止拷贝（unique_ptr不可拷贝）
    BestPractice(const BestPractice&) = delete;
    BestPractice& operator=(const BestPractice&) = delete;
    
    // 允许移动
    BestPractice(BestPractice&&) = default;
    BestPractice& operator=(BestPractice&&) = default;
};
\`\`\``,
            examples: [
                {
                    title: '三法则实现',
                    code: `#include <iostream>
#include <cstring>

class String {
private:
    char* data;
    
public:
    // 构造函数
    String(const char* s = "") {
        data = new char[strlen(s) + 1];
        strcpy(data, s);
        std::cout << "构造: " << data << std::endl;
    }
    
    // 析构函数
    ~String() {
        std::cout << "析构: " << (data ? data : "null") << std::endl;
        delete[] data;
    }
    
    // 拷贝构造函数
    String(const String& other) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
        std::cout << "拷贝构造: " << data << std::endl;
    }
    
    // 拷贝赋值运算符
    String& operator=(const String& other) {
        if (this != &other) {
            delete[] data;
            data = new char[strlen(other.data) + 1];
            strcpy(data, other.data);
            std::cout << "拷贝赋值: " << data << std::endl;
        }
        return *this;
    }
    
    const char* c_str() const { return data; }
};

int main() {
    String s1("Hello");
    String s2 = s1;  // 拷贝构造
    String s3;
    s3 = s2;         // 拷贝赋值
    
    std::cout << "\\n最终值:" << std::endl;
    std::cout << "s1: " << s1.c_str() << std::endl;
    std::cout << "s2: " << s2.c_str() << std::endl;
    std::cout << "s3: " << s3.c_str() << std::endl;
    
    return 0;
}`,
                    description: '实现遵循三法则的字符串类。'
                },
                {
                    title: '零法则实现',
                    code: `#include <iostream>
#include <memory>
#include <string>
#include <vector>

// 零法则：使用智能指针和标准库
class Document {
private:
    std::string title;
    std::unique_ptr<std::string> content;
    std::vector<std::string> tags;
    
public:
    Document(const std::string& t, const std::string& c) 
        : title(t), content(std::make_unique<std::string>(c)) {}
    
    // 不需要定义任何特殊成员函数！
    // 编译器自动生成正确的：
    // - 析构函数
    // - 移动构造函数
    // - 移动赋值运算符
    
    // 拷贝操作被unique_ptr禁止
    
    void addTag(const std::string& tag) {
        tags.push_back(tag);
    }
    
    void print() const {
        std::cout << "标题: " << title << std::endl;
        std::cout << "内容: " << *content << std::endl;
        std::cout << "标签: ";
        for (const auto& tag : tags) {
            std::cout << tag << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    Document doc1("报告", "这是报告内容");
    doc1.addTag("重要");
    doc1.addTag("2024");
    
    std::cout << "原文档:" << std::endl;
    doc1.print();
    
    // 移动构造（自动生成）
    Document doc2 = std::move(doc1);
    
    std::cout << "\\n移动后的文档:" << std::endl;
    doc2.print();
    
    return 0;
}`,
                    description: '使用智能指针实现零法则。'
                }
            ],
            handsOn: {
                title: '实现五法则',
                description: '为IntArray类实现完整的五法则。',
                initialCode: `#include <iostream>
#include <algorithm>

class IntArray {
private:
    int* data;
    size_t size;
    
public:
    // 构造函数
    IntArray(size_t s = 0) : data(s ? new int[s]() : nullptr), size(s) {}
    
    // TODO: 实现析构函数
    ~IntArray() {
        // 释放内存
    }
    
    // TODO: 实现拷贝构造函数
    IntArray(const IntArray& other) {
        // 深拷贝
    }
    
    // TODO: 实现拷贝赋值运算符
    IntArray& operator=(const IntArray& other) {
        // 处理自赋值，深拷贝
        return *this;
    }
    
    // TODO: 实现移动构造函数
    IntArray(IntArray&& other) noexcept {
        // 移动资源，置空源对象
    }
    
    // TODO: 实现移动赋值运算符
    IntArray& operator=(IntArray&& other) noexcept {
        // 释放当前资源，接管新资源
        return *this;
    }
    
    void setValue(size_t i, int val) {
        if (i < size) data[i] = val;
    }
    
    int getValue(size_t i) const {
        return (i < size) ? data[i] : 0;
    }
    
    size_t getSize() const { return size; }
};

int main() {
    IntArray arr1(3);
    arr1.setValue(0, 10);
    arr1.setValue(1, 20);
    arr1.setValue(2, 30);
    
    std::cout << "arr1: ";
    for (size_t i = 0; i < arr1.getSize(); ++i)
        std::cout << arr1.getValue(i) << " ";
    std::cout << std::endl;
    
    // 拷贝
    IntArray arr2 = arr1;
    std::cout << "arr2 (拷贝): ";
    for (size_t i = 0; i < arr2.getSize(); ++i)
        std::cout << arr2.getValue(i) << " ";
    std::cout << std::endl;
    
    // 移动
    IntArray arr3 = std::move(arr1);
    std::cout << "arr3 (移动): ";
    for (size_t i = 0; i < arr3.getSize(); ++i)
        std::cout << arr3.getValue(i) << " ";
    std::cout << std::endl;
    
    std::cout << "arr1 移动后大小: " << arr1.getSize() << std::endl;
    
    return 0;
}`,
                expectedOutput: `arr1: 10 20 30 
arr2 (拷贝): 10 20 30 
arr3 (移动): 10 20 30 
arr1 移动后大小: 0`,
                solutionRegex: 'delete\\[\\]|new int\\[|other\\.data|nullptr',
                hint: '析构释放内存，拷贝分配新内存，移动直接接管资源',
                xp: 220
            },
            references: [
                { title: '三五法则', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '资源管理', book: 'Effective C++', chapter: '条款11-17' },
                { title: '现代C++', book: 'Effective Modern C++', chapter: '条款17-22' }
            ],
            assistantTips: [
                '零法则优先：使用智能指针',
                '三法则：需要析构函数就需要拷贝操作',
                '五法则：添加移动语义',
                '使用=default和=delete明确意图'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '三法则包括哪些？', 
                    options: [
                        { text: '构造、析构、拷贝' }, 
                        { text: '析构、拷贝构造、拷贝赋值', correct: true }, 
                        { text: '构造、移动、析构' }, 
                        { text: '拷贝、移动、析构' }
                    ], 
                    explanation: '三法则包括析构函数、拷贝构造函数和拷贝赋值运算符。' 
                },
                { 
                    type: 'single', 
                    question: '五法则在三法则基础上增加了什么？', 
                    options: [
                        { text: '构造函数' }, 
                        { text: '移动构造和移动赋值', correct: true }, 
                        { text: '默认构造' }, 
                        { text: '虚析构函数' }
                    ], 
                    explanation: '五法则增加了移动构造函数和移动赋值运算符。' 
                },
                { 
                    type: 'single', 
                    question: '零法则的核心思想是？', 
                    options: [
                        { text: '不定义任何函数' }, 
                        { text: '使用智能指针和RAII类型', correct: true }, 
                        { text: '只定义构造函数' }, 
                        { text: '禁止拷贝' }
                    ], 
                    explanation: '零法则使用智能指针和标准库类型，让编译器自动生成特殊成员函数。' 
                },
                { 
                    type: 'single', 
                    question: '为什么需要三法则？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '正确管理资源', correct: true }, 
                        { text: '支持多态' }, 
                        { text: '减少代码' }
                    ], 
                    explanation: '三法则确保资源正确管理，避免内存泄漏和double delete。' 
                },
                { 
                    type: 'single', 
                    question: 'unique_ptr遵循什么法则？', 
                    options: [
                        { text: '三法则' }, 
                        { text: '五法则' }, 
                        { text: '零法则', correct: true }, 
                        { text: '一法则' }
                    ], 
                    explanation: 'unique_ptr使用RAII，用户无需定义任何特殊成员函数。' 
                }
            ]
        }
    ]
};

window.Unit10Data = Unit10Data;
