/**
 * 单元13：模板与泛型编程基础
 */
const Unit13Data = {
    id: 13,
    title: '模板与泛型编程基础',
    description: '掌握C++模板的核心概念，学习函数模板、类模板、模板特化等泛型编程技术',
    lessons: [
        {
            id: '13.1',
            title: '函数模板的定义与实例化',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 函数模板的定义与实例化

### 什么是函数模板？

函数模板是一种通用的函数描述，可以用于多种不同的数据类型。

\`\`\`cpp
// 定义一个通用的比较函数
template <typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}
\`\`\`

### 模板定义语法

\`\`\`cpp
template <typename T>        // 模板参数列表
返回类型 函数名(参数列表) {
    // 函数体
}

// typename 也可以写成 class
template <class T>
T min(T a, T b) {
    return (a < b) ? a : b;
}
\`\`\`

### 模板实例化

编译器根据调用时的参数类型生成具体的函数版本：

\`\`\`cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    // 隐式实例化
    int i = add(1, 2);        // 实例化 add<int>
    double d = add(1.5, 2.5); // 实例化 add<double>
    
    // 显式实例化
    float f = add<float>(1, 2);  // 显式指定类型
    
    return 0;
}
\`\`\`

### 模板参数推导

编译器会自动推导模板参数类型：

\`\`\`cpp
template <typename T>
void print(T value) {
    std::cout << value << std::endl;
}

print(42);        // T 推导为 int
print(3.14);      // T 推导为 double
print("hello");   // T 推导为 const char*
\`\`\`

### 多个模板参数

\`\`\`cpp
template <typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}

// C++14 更简洁的写法
template <typename T, typename U>
auto add(T a, U b) {
    return a + b;
}
\`\`\`

### 模板参数匹配规则

\`\`\`cpp
template <typename T>
void func(T a, T b) { }

func(1, 2);       // OK: T = int
func(1.0, 2.0);   // OK: T = double
func(1, 2.0);     // 错误: T 推导冲突

// 解决方法1: 显式指定
func<double>(1, 2.0);  // OK

// 解决方法2: 使用不同参数
template <typename T, typename U>
void func2(T a, U b) { }
func2(1, 2.0);   // OK: T = int, U = double
\`\`\`

### 非类型模板参数

\`\`\`cpp
template <typename T, int Size>
class Array {
private:
    T data[Size];
public:
    int size() const { return Size; }
};

Array<int, 10> arr;  // Size = 10
\`\`\`

### 函数模板重载

\`\`\`cpp
// 模板版本
template <typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

// 非模板重载
const char* max(const char* a, const char* b) {
    return (strcmp(a, b) > 0) ? a : b;
}

// 指针特化版本
template <typename T>
T* max(T* a, T* b) {
    return (*a > *b) ? a : b;
}
\`\`\`

### 模板编译模型

模板代码通常需要放在头文件中：

\`\`\`cpp
// header.h
template <typename T>
T square(T x) {
    return x * x;
}

// 使用时必须能看到完整定义
#include "header.h"
int main() {
    int result = square(5);  // 编译器需要看到模板定义
}
\`\`\``,
            examples: [
                {
                    title: '通用交换函数',
                    code: `#include <iostream>
#include <string>

// 通用交换函数模板
template <typename T>
void mySwap(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}

int main() {
    // 交换整数
    int x = 10, y = 20;
    std::cout << "交换前: x=" << x << ", y=" << y << std::endl;
    mySwap(x, y);
    std::cout << "交换后: x=" << x << ", y=" << y << std::endl;
    
    // 交换字符串
    std::string s1 = "Hello", s2 = "World";
    std::cout << "\\n交换前: s1=" << s1 << ", s2=" << s2 << std::endl;
    mySwap(s1, s2);
    std::cout << "交换后: s1=" << s1 << ", s2=" << s2 << std::endl;
    
    // 交换浮点数
    double d1 = 3.14, d2 = 2.71;
    std::cout << "\\n交换前: d1=" << d1 << ", d2=" << d2 << std::endl;
    mySwap(d1, d2);
    std::cout << "交换后: d1=" << d1 << ", d2=" << d2 << std::endl;
    
    return 0;
}`,
                    description: '展示函数模板如何处理不同类型的交换操作。'
                },
                {
                    title: '通用数组操作',
                    code: `#include <iostream>
#include <string>

// 打印数组
template <typename T>
void printArray(const T* arr, int size) {
    for (int i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

// 查找最大值
template <typename T>
T findMax(const T* arr, int size) {
    T maxVal = arr[0];
    for (int i = 1; i < size; ++i) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}

// 数组求和
template <typename T>
T sum(const T* arr, int size) {
    T total = T();  // 默认初始化
    for (int i = 0; i < size; ++i) {
        total += arr[i];
    }
    return total;
}

int main() {
    // 整数数组
    int intArr[] = {3, 1, 4, 1, 5, 9, 2, 6};
    int intSize = sizeof(intArr) / sizeof(intArr[0]);
    
    std::cout << "整数数组: ";
    printArray(intArr, intSize);
    std::cout << "最大值: " << findMax(intArr, intSize) << std::endl;
    std::cout << "总和: " << sum(intArr, intSize) << std::endl;
    
    // 浮点数组
    double doubleArr[] = {1.1, 2.2, 3.3, 4.4, 5.5};
    int doubleSize = sizeof(doubleArr) / sizeof(doubleArr[0]);
    
    std::cout << "\\n浮点数组: ";
    printArray(doubleArr, doubleSize);
    std::cout << "最大值: " << findMax(doubleArr, doubleSize) << std::endl;
    std::cout << "总和: " << sum(doubleArr, doubleSize) << std::endl;
    
    // 字符串数组
    std::string strArr[] = {"apple", "banana", "cherry"};
    int strSize = sizeof(strArr) / sizeof(strArr[0]);
    
    std::cout << "\\n字符串数组: ";
    printArray(strArr, strSize);
    std::cout << "最大值: " << findMax(strArr, strSize) << std::endl;
    
    return 0;
}`,
                    description: '展示函数模板用于通用数组操作。'
                }
            ],
            handsOn: {
                title: '实现通用比较函数',
                description: '## 任务目标\n实现三个函数模板，掌握函数模板的定义和实例化机制。\n\n## 操作步骤\n1. **定义 `getMax` 函数模板**：\n   - 使用 `template <typename T>` 声明泛型类型\n   - 使用三元运算符 `a > b ? a : b` 返回较大值\n\n2. **定义 `getMin` 函数模板**：\n   - 与 `getMax` 类似，但返回较小值\n\n3. **定义 `compare` 函数模板**：\n   - 返回 `int` 类型\n   - a < b 时返回 -1，a == b 时返回 0，a > b 时返回 1\n\n## 预期成果\n能够比较不同类型的数据（整数、浮点数、字符串）：\n```\n整数比较:\nmax(10, 20) = 20\nmin(10, 20) = 10\ncompare(10, 20) = -1\n\n浮点数比较:\nmax(3.14, 2.71) = 3.14\nmin(3.14, 2.71) = 2.71\n\n字符串比较:\nmax(apple, banana) = banana\nmin(apple, banana) = apple\n```\n\n## 代码框架\n```cpp\n// 通用最大值函数模板\ntemplate <typename T>\nT getMax(const T& a, const T& b) {\n    // 使用三元运算符返回较大值\n    return (a > b) ? a : b;\n}\n\n// 通用最小值函数模板\ntemplate <typename T>\nT getMin(const T& a, const T& b) {\n    // 使用三元运算符返回较小值\n    return (a < b) ? a : b;\n}\n\n// 通用比较函数模板\ntemplate <typename T>\nint compare(const T& a, const T& b) {\n    if (a < b) return -1;\n    if (a > b) return 1;\n    return 0;\n}\n```',
                initialCode: `#include <iostream>
#include <string>

// ===== 步骤1: 实现通用最大值函数模板 getMax =====
// 提示: template <typename T>
//       返回 (a > b) ? a : b
template <typename T>
T getMax(const T& a, const T& b) {
    return (a > b) ? a : b;
}

// ===== 步骤2: 实现通用最小值函数模板 getMin =====
// 提示: template <typename T>
//       返回 (a < b) ? a : b
template <typename T>
T getMin(const T& a, const T& b) {
    return (a < b) ? a : b;
}

// ===== 步骤3: 实现通用比较函数模板 compare =====
// 提示: 返回 -1 (a < b), 0 (a == b), 1 (a > b)
template <typename T>
int compare(const T& a, const T& b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

int main() {
    // 测试整数
    int a = 10, b = 20;
    std::cout << "整数比较:" << std::endl;
    std::cout << "max(" << a << ", " << b << ") = " << getMax(a, b) << std::endl;
    std::cout << "min(" << a << ", " << b << ") = " << getMin(a, b) << std::endl;
    std::cout << "compare(" << a << ", " << b << ") = " << compare(a, b) << std::endl;
    
    // 测试浮点数
    double x = 3.14, y = 2.71;
    std::cout << "\\n浮点数比较:" << std::endl;
    std::cout << "max(" << x << ", " << y << ") = " << getMax(x, y) << std::endl;
    std::cout << "min(" << x << ", " << y << ") = " << getMin(x, y) << std::endl;
    
    // 测试字符串
    std::string s1 = "apple", s2 = "banana";
    std::cout << "\\n字符串比较:" << std::endl;
    std::cout << "max(" << s1 << ", " << s2 << ") = " << getMax(s1, s2) << std::endl;
    std::cout << "min(" << s1 << ", " << s2 << ") = " << getMin(s1, s2) << std::endl;
    
    return 0;
}`,
                expectedOutput: `整数比较:
max(10, 20) = 20
min(10, 20) = 10
compare(10, 20) = -1

浮点数比较:
max(3.14, 2.71) = 3.14
min(3.14, 2.71) = 2.71

字符串比较:
max(apple, banana) = banana
min(apple, banana) = apple`,
                solutionRegex: 'template\\s*<|typename\\s+T|return\\s+\\(',
                hint: '函数模板在调用时自动根据参数类型实例化，无需手动指定类型',
                xp: 180
            },
            references: [
                { title: '函数模板', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '模板定义', book: 'Effective C++', chapter: '条款45' }
            ],
            assistantTips: [
                'template <typename T> 和 template <class T> 等价',
                '模板参数推导只根据函数参数，不根据返回类型',
                '模板代码通常放在头文件中',
                '编译器会为每种使用的类型生成一份代码'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '函数模板的关键字是什么？', 
                    options: [
                        { text: 'function' }, 
                        { text: 'template', correct: true }, 
                        { text: 'generic' }, 
                        { text: 'type' }
                    ], 
                    explanation: '使用 template 关键字定义模板。' 
                },
                { 
                    type: 'single', 
                    question: 'typename 和 class 在模板参数中有什么区别？', 
                    options: [
                        { text: 'typename 更高效' }, 
                        { text: 'class 只能用于类类型' }, 
                        { text: '没有区别，可以互换', correct: true }, 
                        { text: 'typename 只能用于基本类型' }
                    ], 
                    explanation: '在模板参数列表中，typename 和 class 完全等价。' 
                },
                { 
                    type: 'single', 
                    question: '模板实例化发生在什么时候？', 
                    options: [
                        { text: '编译时', correct: true }, 
                        { text: '链接时' }, 
                        { text: '运行时' }, 
                        { text: '预处理时' }
                    ], 
                    explanation: '模板在编译时实例化，生成具体类型的代码。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个调用会编译错误？', 
                    options: [
                        { text: 'func(1, 2)' }, 
                        { text: 'func(1.0, 2.0)' }, 
                        { text: 'func(1, 2.0)', correct: true }, 
                        { text: 'func<int>(1, 2)' }
                    ], 
                    explanation: 'func(1, 2.0) 中 T 推导冲突，int 和 double 不一致。' 
                },
                { 
                    type: 'single', 
                    question: '模板代码通常应该放在哪里？', 
                    options: [
                        { text: '源文件 (.cpp)' }, 
                        { text: '头文件 (.h)', correct: true }, 
                        { text: '资源文件' }, 
                        { text: '任意位置' }
                    ], 
                    explanation: '模板代码需要放在头文件中，因为编译器需要看到完整定义。' 
                }
            ]
        },
        {
            id: '13.2',
            title: '类模板的定义与使用',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 类模板的定义与使用

### 什么是类模板？

类模板是类的蓝图，可以生成针对不同类型的类。

\`\`\`cpp
template <typename T>
class Container {
private:
    T value;
public:
    Container(T v) : value(v) {}
    T getValue() const { return value; }
    void setValue(T v) { value = v; }
};
\`\`\`

### 类模板实例化

\`\`\`cpp
// 必须显式指定模板参数
Container<int> intContainer(42);
Container<std::string> strContainer("Hello");

int val = intContainer.getValue();
std::string str = strContainer.getValue();
\`\`\`

### 类模板成员函数

成员函数可以定义在类内部或外部：

\`\`\`cpp
// 内部定义
template <typename T>
class Box {
private:
    T data;
public:
    Box(T d) : data(d) {}
    T getData() const { return data; }  // 内部定义
};

// 外部定义
template <typename T>
class Box2 {
private:
    T data;
public:
    Box2(T d);
    T getData() const;
};

// 注意：外部定义也需要 template 声明
template <typename T>
Box2<T>::Box2(T d) : data(d) {}

template <typename T>
T Box2<T>::getData() const {
    return data;
}
\`\`\`

### 多个模板参数

\`\`\`cpp
template <typename K, typename V>
class Pair {
private:
    K key;
    V value;
public:
    Pair(K k, V v) : key(k), value(v) {}
    K getKey() const { return key; }
    V getValue() const { return value; }
};

Pair<std::string, int> person("Alice", 25);
Pair<int, double> measurement(1, 3.14);
\`\`\`

### 类模板与友元

\`\`\`cpp
template <typename T>
class Wrapper {
private:
    T data;
public:
    Wrapper(T d) : data(d) {}
    
    // 友元函数模板
    template <typename U>
    friend std::ostream& operator<<(std::ostream& os, const Wrapper<U>& w);
};

template <typename T>
std::ostream& operator<<(std::ostream& os, const Wrapper<T>& w) {
    return os << w.data;
}
\`\`\`

### 静态成员

类模板的静态成员每个实例化类型各有一份：

\`\`\`cpp
template <typename T>
class Counter {
public:
    static int count;
    Counter() { ++count; }
    ~Counter() { --count; }
};

// 静态成员定义
template <typename T>
int Counter<T>::count = 0;

Counter<int> c1, c2;     // Counter<int>::count = 2
Counter<double> c3;       // Counter<double>::count = 1
\`\`\`

### 类模板示例：动态数组

\`\`\`cpp
template <typename T>
class DynamicArray {
private:
    T* data;
    size_t size;
    size_t capacity;
    
public:
    DynamicArray() : data(nullptr), size(0), capacity(0) {}
    
    ~DynamicArray() {
        delete[] data;
    }
    
    void push_back(const T& value) {
        if (size >= capacity) {
            resize(capacity == 0 ? 1 : capacity * 2);
        }
        data[size++] = value;
    }
    
    T& operator[](size_t index) {
        return data[index];
    }
    
    size_t getSize() const { return size; }
    
private:
    void resize(size_t newCapacity) {
        T* newData = new T[newCapacity];
        for (size_t i = 0; i < size; ++i) {
            newData[i] = data[i];
        }
        delete[] data;
        data = newData;
        capacity = newCapacity;
    }
};
\`\`\`

### 类模板的使用注意事项

1. **必须显式指定类型**：与函数模板不同，类模板不会自动推导类型
2. **成员函数延迟实例化**：只有被调用的成员函数才会被实例化
3. **模板代码放在头文件**：实现通常需要放在头文件中
4. **类型依赖**：使用模板类型时可能需要 typename 关键字`,
            examples: [
                {
                    title: '通用栈实现',
                    code: `#include <iostream>
#include <stdexcept>

template <typename T>
class Stack {
private:
    T* data;
    int top;
    int capacity;
    
public:
    Stack(int cap = 10) : capacity(cap), top(-1) {
        data = new T[capacity];
    }
    
    ~Stack() {
        delete[] data;
    }
    
    void push(const T& value) {
        if (top >= capacity - 1) {
            throw std::overflow_error("Stack is full");
        }
        data[++top] = value;
    }
    
    T pop() {
        if (isEmpty()) {
            throw std::underflow_error("Stack is empty");
        }
        return data[top--];
    }
    
    T peek() const {
        if (isEmpty()) {
            throw std::underflow_error("Stack is empty");
        }
        return data[top];
    }
    
    bool isEmpty() const {
        return top < 0;
    }
    
    int size() const {
        return top + 1;
    }
};

int main() {
    // 整数栈
    Stack<int> intStack(5);
    intStack.push(10);
    intStack.push(20);
    intStack.push(30);
    
    std::cout << "整数栈操作:" << std::endl;
    std::cout << "栈顶元素: " << intStack.peek() << std::endl;
    std::cout << "弹出: " << intStack.pop() << std::endl;
    std::cout << "弹出: " << intStack.pop() << std::endl;
    
    // 字符串栈
    Stack<std::string> strStack(3);
    strStack.push("Hello");
    strStack.push("World");
    
    std::cout << "\\n字符串栈操作:" << std::endl;
    while (!strStack.isEmpty()) {
        std::cout << "弹出: " << strStack.pop() << std::endl;
    }
    
    return 0;
}`,
                    description: '实现通用的栈数据结构。'
                },
                {
                    title: '通用键值对',
                    code: `#include <iostream>
#include <string>

template <typename K, typename V>
class KeyValuePair {
private:
    K key;
    V value;
    
public:
    KeyValuePair() : key(K()), value(V()) {}
    KeyValuePair(const K& k, const V& v) : key(k), value(v) {}
    
    // Getter
    K getKey() const { return key; }
    V getValue() const { return value; }
    
    // Setter
    void setKey(const K& k) { key = k; }
    void setValue(const V& v) { value = v; }
    
    // 打印
    void print() const {
        std::cout << "[" << key << ": " << value << "]";
    }
};

// 简单字典类
template <typename K, typename V>
class SimpleDictionary {
private:
    KeyValuePair<K, V>* pairs;
    int size;
    int capacity;
    
public:
    SimpleDictionary(int cap = 10) : capacity(cap), size(0) {
        pairs = new KeyValuePair<K, V>[capacity];
    }
    
    ~SimpleDictionary() {
        delete[] pairs;
    }
    
    void insert(const K& key, const V& value) {
        if (size < capacity) {
            pairs[size++] = KeyValuePair<K, V>(key, value);
        }
    }
    
    V* find(const K& key) {
        for (int i = 0; i < size; ++i) {
            if (pairs[i].getKey() == key) {
                return &pairs[i];
            }
        }
        return nullptr;
    }
    
    void printAll() const {
        for (int i = 0; i < size; ++i) {
            pairs[i].print();
            std::cout << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    // 字符串-整数映射
    SimpleDictionary<std::string, int> ages;
    ages.insert("Alice", 25);
    ages.insert("Bob", 30);
    ages.insert("Charlie", 28);
    
    std::cout << "年龄字典: ";
    ages.printAll();
    
    // 整数-字符串映射
    SimpleDictionary<int, std::string> grades;
    grades.insert(1, "优秀");
    grades.insert(2, "良好");
    grades.insert(3, "及格");
    
    std::cout << "成绩字典: ";
    grades.printAll();
    
    return 0;
}`,
                    description: '实现通用的键值对和简单字典。'
                }
            ],
            handsOn: {
                title: '实现通用队列',
                description: '实现一个通用的队列类模板，支持入队、出队、查看队首等操作。',
                initialCode: `#include <iostream>
#include <stdexcept>

template <typename T>
class Queue {
private:
    T* data;
    int front;      // 队首索引
    int rear;       // 队尾索引
    int capacity;
    int count;      // 当前元素数量
    
public:
    // TODO: 实现构造函数
    Queue(int cap = 10) {
        // 初始化成员变量，分配内存
    }
    
    // TODO: 实现析构函数
    ~Queue() {
        // 释放内存
    }
    
    // TODO: 实现入队
    void enqueue(const T& value) {
        // 检查是否已满，添加元素
    }
    
    // TODO: 实现出队
    T dequeue() {
        // 检查是否为空，返回并移除队首元素
        return T(); // 临时返回
    }
    
    // TODO: 实现查看队首
    T peek() const {
        // 返回队首元素但不移除
        return T(); // 临时返回
    }
    
    // TODO: 实现判空
    bool isEmpty() const {
        // 返回是否为空
        return true; // 临时返回
    }
    
    // TODO: 实现获取大小
    int size() const {
        // 返回当前元素数量
        return 0; // 临时返回
    }
};

int main() {
    // 测试整数队列
    Queue<int> intQueue(5);
    intQueue.enqueue(1);
    intQueue.enqueue(2);
    intQueue.enqueue(3);
    
    std::cout << "整数队列测试:" << std::endl;
    std::cout << "队首: " << intQueue.peek() << std::endl;
    std::cout << "出队: " << intQueue.dequeue() << std::endl;
    std::cout << "出队: " << intQueue.dequeue() << std::endl;
    std::cout << "当前大小: " << intQueue.size() << std::endl;
    
    // 测试字符串队列
    Queue<std::string> strQueue(3);
    strQueue.enqueue("First");
    strQueue.enqueue("Second");
    
    std::cout << "\\n字符串队列测试:" << std::endl;
    while (!strQueue.isEmpty()) {
        std::cout << "出队: " << strQueue.dequeue() << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `整数队列测试:
队首: 1
出队: 1
出队: 2
当前大小: 1

字符串队列测试:
出队: First
出队: Second`,
                solutionRegex: 'new T\\[|delete\\[\\]|data\\[|count|front|rear',
                hint: '使用循环数组实现，front指向队首，rear指向下一个插入位置',
                xp: 200
            },
            references: [
                { title: '类模板', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '模板类设计', book: 'Effective C++', chapter: '条款45' }
            ],
            assistantTips: [
                '类模板必须显式指定类型参数',
                '成员函数外部定义需要重复 template 声明',
                '静态成员每个实例化类型各有一份',
                '模板代码通常放在头文件中'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '类模板实例化时需要？', 
                    options: [
                        { text: '自动推导类型' }, 
                        { text: '显式指定类型参数', correct: true }, 
                        { text: '使用 auto 关键字' }, 
                        { text: '不需要任何操作' }
                    ], 
                    explanation: '类模板不会自动推导类型，必须显式指定。' 
                },
                { 
                    type: 'single', 
                    question: '类模板的成员函数定义在类外部时需要？', 
                    options: [
                        { text: '不需要特殊处理' }, 
                        { text: '重复 template 声明', correct: true }, 
                        { text: '使用 inline 关键字' }, 
                        { text: '放在源文件中' }
                    ], 
                    explanation: '外部定义的成员函数需要重复 template 声明。' 
                },
                { 
                    type: 'single', 
                    question: '类模板的静态成员有多少份？', 
                    options: [
                        { text: '只有一份' }, 
                        { text: '每个实例化类型各有一份', correct: true }, 
                        { text: '每个对象各有一份' }, 
                        { text: '没有静态成员' }
                    ], 
                    explanation: '类模板的静态成员对于每个实例化类型都是独立的。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的类模板实例化？', 
                    options: [
                        { text: 'Container c(42)' }, 
                        { text: 'Container<int> c(42)', correct: true }, 
                        { text: 'Container c<int>(42)' }, 
                        { text: 'int Container c(42)' }
                    ], 
                    explanation: '类模板实例化需要 <类型> 语法。' 
                },
                { 
                    type: 'single', 
                    question: '类模板成员函数什么时候被实例化？', 
                    options: [
                        { text: '类实例化时全部实例化' }, 
                        { text: '只有被调用时才实例化', correct: true }, 
                        { text: '编译时全部实例化' }, 
                        { text: '链接时实例化' }
                    ], 
                    explanation: '类模板成员函数延迟实例化，只有被调用时才生成代码。' 
                }
            ]
        },
        {
            id: '13.3',
            title: '模板参数：类型参数与非类型参数',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 模板参数：类型参数与非类型参数

### 类型参数（Type Parameters）

类型参数使用 typename 或 class 关键字声明：

\`\`\`cpp
template <typename T>
class Container { };

template <class T>  // 等价写法
class Box { };

// 多个类型参数
template <typename K, typename V>
class Map { };

// 可变数量类型参数（C++11）
template <typename... Args>
class Tuple { };
\`\`\`

### 非类型参数（Non-type Parameters）

非类型参数表示一个具体的值，而不是类型：

\`\`\`cpp
template <typename T, int Size>
class Array {
private:
    T data[Size];
public:
    int size() const { return Size; }
};

Array<int, 10> arr;  // Size = 10
\`\`\`

### 非类型参数的类型限制

非类型参数只能是以下类型：

1. **整型或枚举类型**
2. **指针类型**
3. **左值引用类型**
4. **nullptr_t（C++11）**

\`\`\`cpp
// 整型非类型参数
template <int N>
struct IntValue {
    static constexpr int value = N;
};

// 指针非类型参数
template <const char* Msg>
class Message {
public:
    void print() { std::cout << Msg << std::endl; }
};

// 引用非类型参数
template <int& Ref>
class RefWrapper {
public:
    void set(int v) { Ref = v; }
};
\`\`\`

### 非类型模板参数的使用

\`\`\`cpp
// 固定大小数组
template <typename T, size_t N>
class FixedArray {
private:
    T data[N];
public:
    T& operator[](size_t i) { return data[i]; }
    const T& operator[](size_t i) const { return data[i]; }
    constexpr size_t size() const { return N; }
};

FixedArray<int, 5> arr;  // 5个int的数组

// 编译时计算
template <int N>
struct Factorial {
    static constexpr int value = N * Factorial<N-1>::value;
};

template <>
struct Factorial<0> {
    static constexpr int value = 1;
};

int result = Factorial<5>::value;  // 120
\`\`\`

### 模板模板参数（Template Template Parameters）

模板参数本身也可以是模板：

\`\`\`cpp
template <typename T>
class Allocator { };

// Container 接受一个模板作为参数
template <template <typename> class Alloc>
class Container {
public:
    Alloc<int> intAlloc;
    Alloc<double> doubleAlloc;
};

Container<Allocator> c;
\`\`\`

### 默认模板参数

\`\`\`cpp
// 类型参数默认值
template <typename T = int>
class Wrapper {
private:
    T value;
public:
    Wrapper(T v) : value(v) {}
};

Wrapper<> w1(42);      // T = int
Wrapper<double> w2(3.14);  // T = double

// 非类型参数默认值
template <typename T, int Size = 10>
class Buffer {
private:
    T data[Size];
};

Buffer<int> b1;       // Size = 10
Buffer<int, 20> b2;   // Size = 20
\`\`\`

### 参数推导（C++17）

C++17 支持类模板参数推导：

\`\`\`cpp
template <typename T>
class Wrapper {
public:
    T value;
    Wrapper(T v) : value(v) {}
};

// C++17 自动推导
Wrapper w1(42);        // Wrapper<int>
Wrapper w2(3.14);      // Wrapper<double>
Wrapper w3("hello");   // Wrapper<const char*>

// 推导指引（自定义推导规则）
template <typename T>
Wrapper(T) -> Wrapper<T>;
\`\`\`

### 非类型参数的限制

\`\`\`cpp
// 错误：浮点数不能作为非类型参数（C++20之前）
// template <double D>
// class DoubleValue { };

// 错误：字符串字面量不能直接使用
// template <const char* Str>
// class StringValue { };

// 正确：使用指针
extern const char globalStr[] = "Hello";
template <const char* S>
class StringValue { };
StringValue<globalStr> sv;  // OK
\`\`\`

### 实际应用示例

\`\`\`cpp
// 编译时字符串比较
template <char... Chars>
struct CompileString {
    static constexpr char value[] = {Chars..., '\\0'};
};

// 位掩码
template <unsigned int Mask>
class BitFlags {
public:
    static bool test(unsigned int bits) {
        return (bits & Mask) == Mask;
    }
};

BitFlags<0x0F> flags;
bool result = flags.test(0x05);  // true
\`\`\``,
            examples: [
                {
                    title: '固定大小数组',
                    code: `#include <iostream>
#include <stdexcept>

template <typename T, size_t Size>
class FixedArray {
private:
    T data[Size];
    
public:
    // 元素访问
    T& operator[](size_t index) {
        if (index >= Size) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
    
    const T& operator[](size_t index) const {
        if (index >= Size) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
    
    // 容量
    constexpr size_t size() const { return Size; }
    
    // 填充
    void fill(const T& value) {
        for (size_t i = 0; i < Size; ++i) {
            data[i] = value;
        }
    }
    
    // 迭代器
    T* begin() { return data; }
    T* end() { return data + Size; }
    const T* begin() const { return data; }
    const T* end() const { return data + Size; }
};

int main() {
    // 整数数组
    FixedArray<int, 5> intArr;
    intArr.fill(0);
    intArr[0] = 10;
    intArr[2] = 30;
    intArr[4] = 50;
    
    std::cout << "整数数组 (大小=" << intArr.size() << "): ";
    for (int val : intArr) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    // 字符串数组
    FixedArray<std::string, 3> strArr;
    strArr[0] = "Hello";
    strArr[1] = "World";
    strArr[2] = "!";
    
    std::cout << "字符串数组: ";
    for (const auto& str : strArr) {
        std::cout << str << " ";
    }
    std::cout << std::endl;
    
    // 编译时大小
    FixedArray<double, 10> doubleArr;
    std::cout << "double数组大小: " << doubleArr.size() << std::endl;
    
    return 0;
}`,
                    description: '使用非类型模板参数实现固定大小数组。'
                },
                {
                    title: '编译时计算',
                    code: `#include <iostream>

// 编译时计算阶乘
template <int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static constexpr int value = 1;
};

// 编译时计算斐波那契数
template <int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N - 1>::value + Fibonacci<N - 2>::value;
};

template <>
struct Fibonacci<0> {
    static constexpr int value = 0;
};

template <>
struct Fibonacci<1> {
    static constexpr int value = 1;
};

// 编译时计算幂
template <int Base, int Exp>
struct Power {
    static constexpr int value = Base * Power<Base, Exp - 1>::value;
};

template <int Base>
struct Power<Base, 0> {
    static constexpr int value = 1;
};

int main() {
    std::cout << "=== 编译时计算 ===" << std::endl;
    
    // 阶乘
    std::cout << "5! = " << Factorial<5>::value << std::endl;
    std::cout << "10! = " << Factorial<10>::value << std::endl;
    
    // 斐波那契
    std::cout << "\\n斐波那契数列:" << std::endl;
    std::cout << "F(0) = " << Fibonacci<0>::value << std::endl;
    std::cout << "F(1) = " << Fibonacci<1>::value << std::endl;
    std::cout << "F(10) = " << Fibonacci<10>::value << std::endl;
    std::cout << "F(15) = " << Fibonacci<15>::value << std::endl;
    
    // 幂运算
    std::cout << "\\n幂运算:" << std::endl;
    std::cout << "2^10 = " << Power<2, 10>::value << std::endl;
    std::cout << "3^5 = " << Power<3, 5>::value << std::endl;
    
    return 0;
}`,
                    description: '使用非类型模板参数进行编译时计算。'
                }
            ],
            handsOn: {
                title: '实现矩阵模板',
                description: '实现一个固定大小的矩阵类模板，使用非类型参数指定行列数。',
                initialCode: `#include <iostream>
#include <stdexcept>

template <typename T, int Rows, int Cols>
class Matrix {
private:
    T data[Rows][Cols];
    
public:
    // TODO: 实现默认构造函数，初始化为0
    Matrix() {
        // 将所有元素初始化为默认值
    }
    
    // TODO: 实现元素访问
    T& at(int row, int col) {
        // 检查边界，返回元素引用
        return data[0][0]; // 临时返回
    }
    
    // TODO: 实现常量版本
    const T& at(int row, int col) const {
        // 检查边界，返回元素常量引用
        return data[0][0]; // 临时返回
    }
    
    // TODO: 实现行列数获取
    int rows() const { return Rows; }
    int cols() const { return Cols; }
    
    // TODO: 实现矩阵加法
    Matrix<T, Rows, Cols> operator+(const Matrix<T, Rows, Cols>& other) const {
        Matrix<T, Rows, Cols> result;
        // 实现矩阵加法
        return result;
    }
    
    // TODO: 实现打印函数
    void print() const {
        // 打印矩阵
    }
};

int main() {
    // 创建 2x3 矩阵
    Matrix<int, 2, 3> m1;
    m1.at(0, 0) = 1; m1.at(0, 1) = 2; m1.at(0, 2) = 3;
    m1.at(1, 0) = 4; m1.at(1, 1) = 5; m1.at(1, 2) = 6;
    
    std::cout << "矩阵 m1 (" << m1.rows() << "x" << m1.cols() << "):" << std::endl;
    m1.print();
    
    // 创建另一个矩阵
    Matrix<int, 2, 3> m2;
    m2.at(0, 0) = 10; m2.at(0, 1) = 20; m2.at(0, 2) = 30;
    m2.at(1, 0) = 40; m2.at(1, 1) = 50; m2.at(1, 2) = 60;
    
    std::cout << "\\n矩阵 m2:" << std::endl;
    m2.print();
    
    // 矩阵加法
    Matrix<int, 2, 3> m3 = m1 + m2;
    std::cout << "\\nm1 + m2:" << std::endl;
    m3.print();
    
    return 0;
}`,
                expectedOutput: `矩阵 m1 (2x3):
1 2 3 
4 5 6 

矩阵 m2:
10 20 30 
40 50 60 

m1 + m2:
11 22 33 
44 55 60 `,
                solutionRegex: 'data\\[row\\]\\[col\\]|throw|for\\s*\\(.*row|for\\s*\\(.*col',
                hint: '使用二维数组存储，边界检查用 if 或 throw',
                xp: 200
            },
            references: [
                { title: '模板参数', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '非类型模板参数', book: 'Effective C++', chapter: '条款46' }
            ],
            assistantTips: [
                '非类型参数必须是编译时常量',
                'C++20 之前浮点数不能作为非类型参数',
                '类型参数使用 typename 或 class',
                '模板参数可以有默认值'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '非类型模板参数可以是？', 
                    options: [
                        { text: '任意类型' }, 
                        { text: '整型、指针、引用等', correct: true }, 
                        { text: '只能是整数' }, 
                        { text: '只能是字符串' }
                    ], 
                    explanation: '非类型参数可以是整型、枚举、指针、引用等。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是非类型模板参数的正确用法？', 
                    options: [
                        { text: 'template <double D>' }, 
                        { text: 'template <int N>', correct: true }, 
                        { text: 'template <string S>' }, 
                        { text: 'template <float F>' }
                    ], 
                    explanation: '整型可以作为非类型模板参数（C++20之前浮点数不行）。' 
                },
                { 
                    type: 'single', 
                    question: '模板参数默认值如何指定？', 
                    options: [
                        { text: 'template <T = int>' }, 
                        { text: 'template <typename T = int>', correct: true }, 
                        { text: 'template <T: int>' }, 
                        { text: 'template <T == int>' }
                    ], 
                    explanation: '使用 = 语法指定模板参数默认值。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17 的类模板参数推导有什么作用？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '自动推导模板类型参数', correct: true }, 
                        { text: '支持更多类型' }, 
                        { text: '简化语法错误' }
                    ], 
                    explanation: 'C++17 可以根据构造函数参数自动推导类模板类型。' 
                },
                { 
                    type: 'single', 
                    question: '模板模板参数是什么？', 
                    options: [
                        { text: '模板的模板' }, 
                        { text: '参数本身是模板', correct: true }, 
                        { text: '嵌套模板' }, 
                        { text: '递归模板' }
                    ], 
                    explanation: '模板模板参数是指模板参数本身也是一个模板。' 
                }
            ]
        },
        {
            id: '13.4',
            title: '模板编译与头文件管理',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 模板编译与头文件管理

### 模板的编译模型

模板代码的编译方式与普通代码不同：

1. **模板定义**：编译器需要看到完整的模板定义
2. **模板实例化**：在使用时根据具体类型生成代码
3. **链接阶段**：多个编译单元可能生成重复的实例化代码

### 包含模型（Inclusion Model）

最常用的方式是将模板定义放在头文件中：

\`\`\`cpp
// header.h
#ifndef HEADER_H
#define HEADER_H

template <typename T>
class Container {
private:
    T value;
public:
    Container(T v) : value(v) {}
    T getValue() const { return value; }
};

// 成员函数也放在头文件中
template <typename T>
void Container<T>::setValue(T v) {
    value = v;
}

#endif
\`\`\`

### 分离模型（Separation Model）

使用 export 关键字（已废弃）：

\`\`\`cpp
// header.h
export template <typename T>
class Container { };

// implementation.cpp
export template <typename T>
T Container<T>::getValue() const { return value; }
\`\`\`

**注意**：export 关键字在 C++11 中被移除，不建议使用。

### 显式实例化

可以显式告诉编译器实例化特定类型：

\`\`\`cpp
// template.h
template <typename T>
class Container {
public:
    void process();
};

// template.cpp
#include "template.h"

// 显式实例化定义
template class Container<int>;
template class Container<double>;

// 成员函数实现
template <typename T>
void Container<T>::process() { }
\`\`\`

### 显式实例化声明

使用 extern 声明实例化在其他地方：

\`\`\`cpp
// user.cpp
#include "template.h"

// 声明实例化在别处
extern template class Container<int>;
extern template class Container<double>;

void use() {
    Container<int> c;  // 使用外部实例化
}
\`\`\`

### 模板代码组织方式

#### 方式一：全部在头文件

\`\`\`cpp
// myvector.h
#ifndef MYVECTOR_H
#define MYVECTOR_H

template <typename T>
class MyVector {
private:
    T* data;
    size_t size;
public:
    MyVector() : data(nullptr), size(0) {}
    ~MyVector() { delete[] data; }
    
    void push_back(const T& value) {
        // 实现放在头文件
        T* newData = new T[size + 1];
        for (size_t i = 0; i < size; ++i) {
            newData[i] = data[i];
        }
        newData[size] = value;
        delete[] data;
        data = newData;
        ++size;
    }
};

#endif
\`\`\`

#### 方式二：头文件 + 实现文件（显式实例化）

\`\`\`cpp
// myvector.h
#ifndef MYVECTOR_H
#define MYVECTOR_H

template <typename T>
class MyVector {
public:
    void push_back(const T& value);
};

#endif

// myvector.cpp
#include "myvector.h"

template <typename T>
void MyVector<T>::push_back(const T& value) {
    // 实现
}

// 显式实例化常用类型
template class MyVector<int>;
template class MyVector<double>;
\`\`\`

#### 方式三：.tpp 文件（实现分离但仍在头文件中包含）

\`\`\`cpp
// myvector.h
#ifndef MYVECTOR_H
#define MYVECTOR_H

template <typename T>
class MyVector {
public:
    void push_back(const T& value);
};

#include "myvector.tpp"  // 包含实现
#endif

// myvector.tpp
#ifndef MYVECTOR_TPP
#define MYVECTOR_TPP

template <typename T>
void MyVector<T>::push_back(const T& value) {
    // 实现
}

#endif
\`\`\`

### 编译错误定位

模板错误信息通常很长且难以理解：

\`\`\`cpp
template <typename T>
void process(T value) {
    value.nonexistentMethod();  // 编译错误
}

process(42);  // 错误：int 没有 nonexistentMethod
\`\`\`

错误信息可能包含：
- 模板参数推导失败
- 类型不满足要求
- 成员函数不存在

### 最佳实践

1. **模板定义放在头文件**：最简单可靠的方式
2. **使用显式实例化**：减少编译时间和代码膨胀
3. **使用 concepts（C++20）**：提供更好的错误信息
4. **模块化（C++20）**：使用 modules 替代头文件

\`\`\`cpp
// C++20 模块
export module myvector;

export template <typename T>
class MyVector {
    // ...
};
\`\`\``,
            examples: [
                {
                    title: '头文件组织示例',
                    code: `#include <iostream>
#include <string>

// 模拟头文件内容
namespace header {

// 模板类定义（通常在 .h 文件中）
template <typename T>
class Calculator {
public:
    T add(T a, T b) { return a + b; }
    T subtract(T a, T b) { return a - b; }
    T multiply(T a, T b) { return a * b; }
    T divide(T a, T b) { return a / b; }
};

// 模板函数（通常在 .h 文件中）
template <typename T>
void printValue(const T& value) {
    std::cout << "Value: " << value << std::endl;
}

// 多模板参数
template <typename T, typename U>
auto convert(U value) -> T {
    return static_cast<T>(value);
}

} // namespace header

int main() {
    // 使用模板类
    header::Calculator<int> intCalc;
    std::cout << "10 + 5 = " << intCalc.add(10, 5) << std::endl;
    std::cout << "10 - 5 = " << intCalc.subtract(10, 5) << std::endl;
    std::cout << "10 * 5 = " << intCalc.multiply(10, 5) << std::endl;
    
    header::Calculator<double> doubleCalc;
    std::cout << "\\n10.5 / 2.0 = " << doubleCalc.divide(10.5, 2.0) << std::endl;
    
    // 使用模板函数
    header::printValue(42);
    header::printValue(3.14);
    header::printValue(std::string("Hello"));
    
    // 类型转换
    double d = 3.7;
    int i = header::convert<int>(d);
    std::cout << "\\nConverted " << d << " to int: " << i << std::endl;
    
    return 0;
}`,
                    description: '展示模板代码在头文件中的组织方式。'
                },
                {
                    title: '显式实例化示例',
                    code: `#include <iostream>
#include <string>

// 模板定义
template <typename T>
class Processor {
private:
    T value;
public:
    Processor(T v) : value(v) {}
    
    void process() {
        std::cout << "Processing: " << value << std::endl;
    }
    
    T getValue() const { return value; }
};

// 显式实例化声明（告诉编译器实例化在别处）
// extern template class Processor<int>;
// extern template class Processor<std::string>;

// 显式实例化定义（在某个 .cpp 文件中）
// template class Processor<int>;
// template class Processor<std::string>;

// 模板函数
template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}

// 显式实例化
// template int maxValue<int>(int, int);
// template double maxValue<double>(double, double);

int main() {
    // 使用模板
    Processor<int> p1(42);
    p1.process();
    
    Processor<std::string> p2("Hello");
    p2.process();
    
    // 使用模板函数
    std::cout << "\\nMax of 10 and 20: " << maxValue(10, 20) << std::endl;
    std::cout << "Max of 3.14 and 2.71: " << maxValue(3.14, 2.71) << std::endl;
    
    // 显式指定类型
    std::cout << "Max of 'a' and 'z': " << maxValue<char>('a', 'z') << std::endl;
    
    return 0;
}`,
                    description: '展示显式实例化的用法。'
                }
            ],
            handsOn: {
                title: '组织模板代码',
                description: '创建一个简单的模板库，包含头文件风格的模板定义。',
                initialCode: `#include <iostream>
#include <string>
#include <stdexcept>

// TODO: 实现 ArrayUtils 模板类
// 包含以下静态方法：
// - print: 打印数组
// - find: 查找元素，返回索引（未找到返回-1）
// - sort: 简单排序
// - reverse: 反转数组

template <typename T>
class ArrayUtils {
public:
    // TODO: 实现打印数组
    static void print(const T* arr, int size) {
        // 打印数组元素
    }
    
    // TODO: 实现查找元素
    static int find(const T* arr, int size, const T& value) {
        // 返回元素索引，未找到返回 -1
        return -1; // 临时返回
    }
    
    // TODO: 实现简单排序（冒泡排序）
    static void sort(T* arr, int size) {
        // 升序排序
    }
    
    // TODO: 实现反转数组
    static void reverse(T* arr, int size) {
        // 反转数组
    }
};

int main() {
    // 测试整数数组
    int intArr[] = {5, 2, 8, 1, 9, 3};
    int intSize = sizeof(intArr) / sizeof(intArr[0]);
    
    std::cout << "原始整数数组: ";
    ArrayUtils<int>::print(intArr, intSize);
    
    std::cout << "查找 8 的索引: " << ArrayUtils<int>::find(intArr, intSize, 8) << std::endl;
    std::cout << "查找 7 的索引: " << ArrayUtils<int>::find(intArr, intSize, 7) << std::endl;
    
    ArrayUtils<int>::sort(intArr, intSize);
    std::cout << "排序后: ";
    ArrayUtils<int>::print(intArr, intSize);
    
    ArrayUtils<int>::reverse(intArr, intSize);
    std::cout << "反转后: ";
    ArrayUtils<int>::print(intArr, intSize);
    
    // 测试字符串数组
    std::string strArr[] = {"banana", "apple", "cherry", "date"};
    int strSize = sizeof(strArr) / sizeof(strArr[0]);
    
    std::cout << "\\n原始字符串数组: ";
    ArrayUtils<std::string>::print(strArr, strSize);
    
    ArrayUtils<std::string>::sort(strArr, strSize);
    std::cout << "排序后: ";
    ArrayUtils<std::string>::print(strArr, strSize);
    
    return 0;
}`,
                expectedOutput: `原始整数数组: 5 2 8 1 9 3 
查找 8 的索引: 2
查找 7 的索引: -1
排序后: 1 2 3 5 8 9 
反转后: 9 8 5 3 2 1 

原始字符串数组: banana apple cherry date 
排序后: apple banana cherry date `,
                solutionRegex: 'for\\s*\\(|arr\\[i\\]|arr\\[j\\]|return\\s+i|std::swap',
                hint: '使用 for 循环遍历数组，冒泡排序比较相邻元素',
                xp: 180
            },
            references: [
                { title: '模板编译模型', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '模板与头文件', book: 'Effective C++', chapter: '条款30' }
            ],
            assistantTips: [
                '模板定义通常放在头文件中',
                '显式实例化可以减少编译时间',
                '模板错误信息通常很长，需要耐心阅读',
                'C++20 模块提供了更好的代码组织方式'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '模板代码为什么通常放在头文件中？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '编译器需要看到完整定义', correct: true }, 
                        { text: '语法要求' }, 
                        { text: '方便调试' }
                    ], 
                    explanation: '模板实例化时编译器需要看到完整的模板定义。' 
                },
                { 
                    type: 'single', 
                    question: '显式实例化的关键字是什么？', 
                    options: [
                        { text: 'explicit' }, 
                        { text: 'template class/struct', correct: true }, 
                        { text: 'instantiate' }, 
                        { text: 'instance' }
                    ], 
                    explanation: '使用 template class ClassName<Type>; 显式实例化。' 
                },
                { 
                    type: 'single', 
                    question: 'extern template 的作用是？', 
                    options: [
                        { text: '导出模板' }, 
                        { text: '声明实例化在其他地方', correct: true }, 
                        { text: '创建外部模板' }, 
                        { text: '链接外部库' }
                    ], 
                    explanation: 'extern template 声明模板实例化在其他编译单元中。' 
                },
                { 
                    type: 'single', 
                    question: 'export 关键字现在的状态是？', 
                    options: [
                        { text: '广泛使用' }, 
                        { text: '已被移除', correct: true }, 
                        { text: '新增功能' }, 
                        { text: '仅用于类模板' }
                    ], 
                    explanation: 'export 关键字在 C++11 中被移除。' 
                },
                { 
                    type: 'single', 
                    question: '.tpp 文件通常用于？', 
                    options: [
                        { text: '模板测试' }, 
                        { text: '模板实现分离', correct: true }, 
                        { text: '模板类型定义' }, 
                        { text: '模板参数' }
                    ], 
                    explanation: '.tpp 文件用于分离模板实现，但仍被头文件包含。' 
                }
            ]
        },
        {
            id: '13.5',
            title: '模板特化与偏特化',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## 模板特化与偏特化

### 什么是模板特化？

模板特化允许为特定类型提供定制实现。

\`\`\`cpp
// 通用模板
template <typename T>
class TypeInfo {
public:
    static void print() {
        std::cout << "Unknown type" << std::endl;
    }
};

// 特化版本
template <>
class TypeInfo<int> {
public:
    static void print() {
        std::cout << "int type" << std::endl;
    }
};
\`\`\`

### 完全特化（Full Specialization）

为特定类型提供完全定制的实现：

\`\`\`cpp
// 通用模板
template <typename T>
class Container {
public:
    void process(T value) {
        std::cout << "Generic: " << value << std::endl;
    }
};

// int 特化
template <>
class Container<int> {
public:
    void process(int value) {
        std::cout << "Integer: " << value << std::endl;
    }
};

// bool 特化
template <>
class Container<bool> {
public:
    void process(bool value) {
        std::cout << "Boolean: " << (value ? "true" : "false") << std::endl;
    }
};
\`\`\`

### 函数模板特化

\`\`\`cpp
// 通用函数模板
template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}

// 指针特化
template <>
const char* maxValue<const char*>(const char* a, const char* b) {
    return (strcmp(a, b) > 0) ? a : b;
}

// 注意：函数模板不支持偏特化，只能重载
\`\`\`

### 偏特化（Partial Specialization）

只指定部分模板参数或对参数进行限制：

\`\`\`cpp
// 通用模板
template <typename T, typename U>
class Pair {
public:
    void print() {
        std::cout << "Generic Pair" << std::endl;
    }
};

// 偏特化：两个类型相同
template <typename T>
class Pair<T, T> {
public:
    void print() {
        std::cout << "Same type Pair" << std::endl;
    }
};

// 偏特化：第二个是 int
template <typename T>
class Pair<T, int> {
public:
    void print() {
        std::cout << "Second is int" << std::endl;
    }
};

// 偏特化：指针类型
template <typename T, typename U>
class Pair<T*, U*> {
public:
    void print() {
        std::cout << "Pointer Pair" << std::endl;
    }
};
\`\`\`

### 类模板偏特化示例

\`\`\`cpp
// 通用版本
template <typename T>
class TypeTraits {
public:
    static constexpr bool isPointer = false;
    static constexpr bool isReference = false;
};

// 指针偏特化
template <typename T>
class TypeTraits<T*> {
public:
    static constexpr bool isPointer = true;
    static constexpr bool isReference = false;
};

// 引用偏特化
template <typename T>
class TypeTraits<T&> {
public:
    static constexpr bool isPointer = false;
    static constexpr bool isReference = true;
};

// const 偏特化
template <typename T>
class TypeTraits<const T> {
public:
    static constexpr bool isConst = true;
};
\`\`\`

### 成员函数特化

可以只特化成员函数：

\`\`\`cpp
template <typename T>
class Container {
public:
    void process(T value);
};

// 通用成员函数
template <typename T>
void Container<T>::process(T value) {
    std::cout << "Generic process" << std::endl;
}

// 成员函数特化
template <>
void Container<int>::process(int value) {
    std::cout << "Int process: " << value << std::endl;
}
\`\`\`

### 特化的应用场景

1. **类型特性**：为不同类型提供不同行为
2. **性能优化**：为特定类型优化实现
3. **类型萃取**：编译时类型判断
4. **条件编译**：基于类型的编译时分支

\`\`\`cpp
// 类型萃取示例
template <typename T>
struct is_pointer {
    static constexpr bool value = false;
};

template <typename T>
struct is_pointer<T*> {
    static constexpr bool value = true;
};

// 使用
if constexpr (is_pointer<int*>::value) {
    std::cout << "It's a pointer!" << std::endl;
}
\`\`\`

### 特化匹配规则

编译器选择最特化的版本：

\`\`\`cpp
template <typename T>
void func(T) { std::cout << "Generic\\n"; }

template <typename T>
void func(T*) { std::cout << "Pointer\\n"; }

template <>
void func<int*>(int*) { std::cout << "int pointer\\n"; }

int* p;
func(p);  // 选择 int pointer 特化（最特化）
\`\`\``,
            examples: [
                {
                    title: '类型特性特化',
                    code: `#include <iostream>
#include <typeinfo>

// 通用类型特性
template <typename T>
class TypeProperties {
public:
    static void print() {
        std::cout << "Type: " << typeid(T).name() << std::endl;
        std::cout << "  is pointer: false" << std::endl;
        std::cout << "  is reference: false" << std::endl;
        std::cout << "  is array: false" << std::endl;
    }
};

// 指针特化
template <typename T>
class TypeProperties<T*> {
public:
    static void print() {
        std::cout << "Type: pointer to " << typeid(T).name() << std::endl;
        std::cout << "  is pointer: true" << std::endl;
        std::cout << "  is reference: false" << std::endl;
        std::cout << "  is array: false" << std::endl;
    }
};

// 引用特化
template <typename T>
class TypeProperties<T&> {
public:
    static void print() {
        std::cout << "Type: reference to " << typeid(T).name() << std::endl;
        std::cout << "  is pointer: false" << std::endl;
        std::cout << "  is reference: true" << std::endl;
        std::cout << "  is array: false" << std::endl;
    }
};

// 数组特化
template <typename T, size_t N>
class TypeProperties<T[N]> {
public:
    static void print() {
        std::cout << "Type: array of " << typeid(T).name() << "[" << N << "]" << std::endl;
        std::cout << "  is pointer: false" << std::endl;
        std::cout << "  is reference: false" << std::endl;
        std::cout << "  is array: true" << std::endl;
    }
};

int main() {
    std::cout << "=== 类型特性测试 ===" << std::endl << std::endl;
    
    std::cout << "int:" << std::endl;
    TypeProperties<int>::print();
    
    std::cout << "\\nint*:" << std::endl;
    TypeProperties<int*>::print();
    
    std::cout << "\\ndouble&:" << std::endl;
    TypeProperties<double&>::print();
    
    std::cout << "\\nchar[10]:" << std::endl;
    TypeProperties<char[10]>::print();
    
    return 0;
}`,
                    description: '使用模板特化实现类型特性检测。'
                },
                {
                    title: '智能比较函数',
                    code: `#include <iostream>
#include <cstring>
#include <string>

// 通用比较
template <typename T>
bool isEqual(T a, T b) {
    return a == b;
}

// C字符串特化
template <>
bool isEqual<const char*>(const char* a, const char* b) {
    return strcmp(a, b) == 0;
}

// 指针特化
template <typename T>
bool isEqual(T* a, T* b) {
    return *a == *b;
}

// 数组比较函数
template <typename T>
bool arrayEqual(const T* a, const T* b, size_t size) {
    for (size_t i = 0; i < size; ++i) {
        if (!isEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

int main() {
    // 整数比较
    int x = 10, y = 10, z = 20;
    std::cout << "10 == 10: " << isEqual(x, y) << std::endl;
    std::cout << "10 == 20: " << isEqual(x, z) << std::endl;
    
    // 字符串比较
    std::string s1 = "hello", s2 = "hello", s3 = "world";
    std::cout << "\\nhello == hello: " << isEqual(s1, s2) << std::endl;
    std::cout << "hello == world: " << isEqual(s1, s3) << std::endl;
    
    // C字符串比较
    const char* c1 = "test";
    const char* c2 = "test";
    const char* c3 = "demo";
    std::cout << "\\n\"test\" == \"test\": " << isEqual(c1, c2) << std::endl;
    std::cout << "\"test\" == \"demo\": " << isEqual(c1, c3) << std::endl;
    
    // 指针比较
    int* px = &x;
    int* py = &y;
    std::cout << "\\n*px == *py: " << isEqual(px, py) << std::endl;
    
    // 数组比较
    int arr1[] = {1, 2, 3, 4, 5};
    int arr2[] = {1, 2, 3, 4, 5};
    int arr3[] = {1, 2, 3, 4, 6};
    
    std::cout << "\\n数组比较:" << std::endl;
    std::cout << "arr1 == arr2: " << arrayEqual(arr1, arr2, 5) << std::endl;
    std::cout << "arr1 == arr3: " << arrayEqual(arr1, arr3, 5) << std::endl;
    
    return 0;
}`,
                    description: '使用模板特化实现智能比较。'
                }
            ],
            handsOn: {
                title: '实现类型判断特化',
                description: '实现一个模板类，使用特化判断类型是否为指针、引用或数组。',
                initialCode: `#include <iostream>
#include <typeinfo>

// TODO: 实现 TypeChecker 模板类
// 使用特化判断类型属性

template <typename T>
class TypeChecker {
public:
    // TODO: 添加静态常量
    // static constexpr bool isPointer = ?
    // static constexpr bool isReference = ?
    // static constexpr bool isArray = ?
    
    static void printInfo() {
        std::cout << "Type: " << typeid(T).name() << std::endl;
        // TODO: 打印类型属性
    }
};

// TODO: 实现指针特化


// TODO: 实现引用特化


// TODO: 实现数组特化（提示：template <typename T, size_t N>）


int main() {
    std::cout << "=== 类型检查测试 ===" << std::endl << std::endl;
    
    std::cout << "int:" << std::endl;
    TypeChecker<int>::printInfo();
    std::cout << std::endl;
    
    std::cout << "int*:" << std::endl;
    TypeChecker<int*>::printInfo();
    std::cout << std::endl;
    
    std::cout << "double&:" << std::endl;
    TypeChecker<double&>::printInfo();
    std::cout << std::endl;
    
    std::cout << "char[20]:" << std::endl;
    TypeChecker<char[20]>::printInfo();
    std::cout << std::endl;
    
    std::cout << "int**:" << std::endl;
    TypeChecker<int**>::printInfo();
    
    return 0;
}`,
                expectedOutput: `=== 类型检查测试 ===

int:
Type: int
isPointer: false
isReference: false
isArray: false

int*:
Type: pointer to int
isPointer: true
isReference: false
isArray: false

double&:
Type: reference to double
isPointer: false
isReference: true
isArray: false

char[20]:
Type: array of char[20]
isPointer: false
isReference: false
isArray: true

int**:
Type: pointer to pointer to int
isPointer: true
isReference: false
isArray: false`,
                solutionRegex: 'template\\s*<.*>|isPointer|isReference|isArray|T\\*|T&|T\\[N\\]',
                hint: '使用 template<> 进行完全特化，使用 template<typename T> 进行偏特化',
                xp: 200
            },
            references: [
                { title: '模板特化', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '类型萃取', book: 'Effective C++', chapter: '条款47' }
            ],
            assistantTips: [
                '完全特化使用 template<>',
                '偏特化保留部分模板参数',
                '函数模板不支持偏特化，只能重载',
                '编译器选择最特化的版本'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '完全特化的语法是？', 
                    options: [
                        { text: 'template <T>' }, 
                        { text: 'template <>', correct: true }, 
                        { text: 'specialize <T>' }, 
                        { text: 'template <typename T>' }
                    ], 
                    explanation: '完全特化使用 template<> 表示所有参数都已指定。' 
                },
                { 
                    type: 'single', 
                    question: '偏特化与完全特化的区别是？', 
                    options: [
                        { text: '偏特化更高效' }, 
                        { text: '偏特化保留部分模板参数', correct: true }, 
                        { text: '完全特化更灵活' }, 
                        { text: '没有区别' }
                    ], 
                    explanation: '偏特化只指定部分模板参数，完全特化指定所有参数。' 
                },
                { 
                    type: 'single', 
                    question: '函数模板支持偏特化吗？', 
                    options: [
                        { text: '支持' }, 
                        { text: '不支持，只能重载', correct: true }, 
                        { text: '只有成员函数支持' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '函数模板不支持偏特化，但可以通过重载实现类似效果。' 
                },
                { 
                    type: 'single', 
                    question: '编译器如何选择特化版本？', 
                    options: [
                        { text: '随机选择' }, 
                        { text: '选择最特化的版本', correct: true }, 
                        { text: '选择第一个匹配的' }, 
                        { text: '选择最后定义的' }
                    ], 
                    explanation: '编译器会选择最特化（最具体）的版本。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的偏特化？', 
                    options: [
                        { text: 'template <> class A<int>' }, 
                        { text: 'template <typename T> class A<T*>', correct: true }, 
                        { text: 'specialize A<int>' }, 
                        { text: 'template A<int>' }
                    ], 
                    explanation: '偏特化保留部分模板参数，如 template<typename T> class A<T*>。' 
                }
            ]
        },
        {
            id: '13.6',
            title: '默认模板实参',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 默认模板实参

### 什么是默认模板实参？

可以为模板参数指定默认值，使模板使用更方便。

\`\`\`cpp
// 类型参数默认值
template <typename T = int>
class Container {
private:
    T value;
public:
    Container(T v) : value(v) {}
};

Container<> c1(42);       // T = int
Container<double> c2(3.14);  // T = double
\`\`\`

### 函数模板默认参数

\`\`\`cpp
// 函数模板默认类型参数
template <typename T = double>
T divide(T a, T b) {
    return a / b;
}

auto r1 = divide(10.0, 3.0);     // T = double
auto r2 = divide<int>(10, 3);    // T = int
auto r3 = divide<>(10.0, 3.0);   // T = double
\`\`\`

### 类模板默认参数

\`\`\`cpp
template <typename T = int, int Size = 10>
class Array {
private:
    T data[Size];
public:
    int size() const { return Size; }
};

Array<> a1;           // T = int, Size = 10
Array<double> a2;     // T = double, Size = 10
Array<int, 20> a3;    // T = int, Size = 20
Array<double, 5> a4;  // T = double, Size = 5
\`\`\`

### 默认参数的规则

1. **从右向左**：默认参数必须从最右边开始

\`\`\`cpp
// 正确
template <typename T, typename U = int>
class Pair { };

// 错误：默认参数不在最右边
// template <typename T = int, typename U>
// class Pair { };

// 正确：多个默认参数
template <typename T = int, typename U = double, typename V = char>
class Triple { };
\`\`\`

2. **声明与定义**：默认参数通常在声明中指定

\`\`\`cpp
// 声明
template <typename T = int>
class Container;

// 定义
template <typename T>
class Container {
    // ...
};
\`\`\`

### 复杂默认参数示例

\`\`\`cpp
#include <memory>

// 使用智能指针作为默认分配器
template <typename T, typename Allocator = std::allocator<T>>
class Vector {
private:
    T* data;
    Allocator alloc;
public:
    void push_back(const T& value);
};

// 默认比较器
template <typename T, typename Compare = std::less<T>>
class PriorityQueue {
private:
    Compare comp;
public:
    void push(const T& value);
};
\`\`\`

### 模板模板参数的默认值

\`\`\`cpp
template <typename T>
class DefaultContainer { };

template <template <typename> class Container = DefaultContainer>
class Wrapper {
public:
    Container<int> data;
};

Wrapper<> w1;           // 使用 DefaultContainer
Wrapper<std::vector> w2; // 使用 std::vector
\`\`\`

### 默认参数与类型推导

\`\`\`cpp
template <typename T = int>
void process(T value = T()) {
    std::cout << value << std::endl;
}

process();        // T = int, value = 0
process(3.14);    // T = double
process<double>(); // T = double, value = 0.0
\`\`\`

### 实际应用示例

\`\`\`cpp
// 通用回调类
template <typename Result, typename Arg, typename Func = std::function<Result(Arg)>>
class Callback {
private:
    Func func;
public:
    Callback(Func f) : func(f) {}
    Result call(Arg a) { return func(a); }
};

// 使用
Callback<int, int> cb1([](int x) { return x * 2; });
Callback<std::string, int> cb2([](int x) { return std::to_string(x); });
\`\`\`

### C++17 类模板参数推导

C++17 允许省略模板参数（如果可以推导）：

\`\`\`cpp
template <typename T = int>
class Value {
public:
    T val;
    Value(T v) : val(v) {}
};

// C++17
Value v1(42);       // Value<int>
Value v2(3.14);     // Value<double>
Value v3 = Value(); // Value<int>（使用默认）
\`\`\``,
            examples: [
                {
                    title: '默认分配器',
                    code: `#include <iostream>
#include <memory>

// 简单分配器
template <typename T>
class SimpleAllocator {
public:
    T* allocate(size_t n) {
        std::cout << "SimpleAllocator: 分配 " << n << " 个 " << typeid(T).name() << std::endl;
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }
    
    void deallocate(T* p, size_t n) {
        std::cout << "SimpleAllocator: 释放内存" << std::endl;
        ::operator delete(p);
    }
};

// 带默认分配器的容器
template <typename T, typename Allocator = SimpleAllocator<T>>
class SimpleVector {
private:
    T* data;
    size_t sz;
    Allocator alloc;
    
public:
    SimpleVector(size_t n = 0) : sz(n) {
        if (n > 0) {
            data = alloc.allocate(n);
            for (size_t i = 0; i < n; ++i) {
                new(&data[i]) T();
            }
        }
    }
    
    ~SimpleVector() {
        for (size_t i = 0; i < sz; ++i) {
            data[i].~T();
        }
        if (sz > 0) {
            alloc.deallocate(data, sz);
        }
    }
    
    T& operator[](size_t i) { return data[i]; }
    size_t size() const { return sz; }
};

int main() {
    std::cout << "=== 使用默认分配器 ===" << std::endl;
    SimpleVector<int> v1(5);  // 使用 SimpleAllocator
    for (size_t i = 0; i < v1.size(); ++i) {
        v1[i] = i * 10;
    }
    
    std::cout << "\\n内容: ";
    for (size_t i = 0; i < v1.size(); ++i) {
        std::cout << v1[i] << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n=== 使用 std::allocator ===" << std::endl;
    SimpleVector<double, std::allocator<double>> v2(3);
    for (size_t i = 0; i < v2.size(); ++i) {
        v2[i] = i * 1.5;
    }
    
    std::cout << "内容: ";
    for (size_t i = 0; i < v2.size(); ++i) {
        std::cout << v2[i] << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示默认模板参数在分配器中的应用。'
                },
                {
                    title: '默认比较器',
                    code: `#include <iostream>
#include <string>
#include <functional>

// 默认比较器：升序
template <typename T>
struct DefaultCompare {
    bool operator()(const T& a, const T& b) const {
        return a < b;
    }
};

// 降序比较器
template <typename T>
struct DescendingCompare {
    bool operator()(const T& a, const T& b) const {
        return a > b;
    }
};

// 带默认比较器的排序容器
template <typename T, typename Compare = DefaultCompare<T>>
class SortedContainer {
private:
    T* data;
    size_t sz;
    size_t cap;
    Compare comp;
    
public:
    SortedContainer() : data(nullptr), sz(0), cap(0) {}
    
    ~SortedContainer() { delete[] data; }
    
    void insert(const T& value) {
        // 扩容
        if (sz >= cap) {
            size_t newCap = (cap == 0) ? 1 : cap * 2;
            T* newData = new T[newCap];
            for (size_t i = 0; i < sz; ++i) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            cap = newCap;
        }
        
        // 找到插入位置
        size_t pos = 0;
        while (pos < sz && comp(data[pos], value)) {
            ++pos;
        }
        
        // 移动元素
        for (size_t i = sz; i > pos; --i) {
            data[i] = data[i-1];
        }
        
        data[pos] = value;
        ++sz;
    }
    
    void print() const {
        for (size_t i = 0; i < sz; ++i) {
            std::cout << data[i] << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    std::cout << "=== 升序排序（默认） ===" << std::endl;
    SortedContainer<int> asc;
    asc.insert(5);
    asc.insert(2);
    asc.insert(8);
    asc.insert(1);
    asc.insert(9);
    std::cout << "升序: ";
    asc.print();
    
    std::cout << "\\n=== 降序排序 ===" << std::endl;
    SortedContainer<int, DescendingCompare<int>> desc;
    desc.insert(5);
    desc.insert(2);
    desc.insert(8);
    desc.insert(1);
    desc.insert(9);
    std::cout << "降序: ";
    desc.print();
    
    std::cout << "\\n=== 字符串排序 ===" << std::endl;
    SortedContainer<std::string> strAsc;
    strAsc.insert("banana");
    strAsc.insert("apple");
    strAsc.insert("cherry");
    std::cout << "字符串升序: ";
    strAsc.print();
    
    return 0;
}`,
                    description: '展示默认比较器模板参数的应用。'
                }
            ],
            handsOn: {
                title: '实现带默认参数的缓存',
                description: '实现一个缓存类模板，支持自定义容量和淘汰策略。',
                initialCode: `#include <iostream>
#include <string>
#include <map>

// 默认淘汰策略：简单计数
template <typename Key>
class DefaultEvictionPolicy {
private:
    std::map<Key, int> counts;
    
public:
    void onAccess(const Key& key) {
        // TODO: 访问时增加计数
    }
    
    Key selectForEviction() {
        // TODO: 选择计数最少的键淘汰
        return Key(); // 临时返回
    }
    
    void onRemove(const Key& key) {
        // TODO: 移除时清除计数
    }
};

// TODO: 实现带默认参数的 Cache 类
// template <typename Key, typename Value, typename Policy = DefaultEvictionPolicy<Key>>
// 默认容量为 10

template <typename Key, typename Value, typename Policy = DefaultEvictionPolicy<Key>>
class Cache {
private:
    std::map<Key, Value> data;
    std::map<Key, Value> storage;
    Policy policy;
    size_t capacity;
    size_t maxSize;
    
public:
    // TODO: 实现构造函数，默认容量 10
    Cache(size_t max = 10) : maxSize(max), capacity(0) {
    }
    
    // TODO: 实现插入
    void put(const Key& key, const Value& value) {
        // 如果已满，执行淘汰
        // 插入新元素
    }
    
    // TODO: 实现获取
    Value* get(const Key& key) {
        // 查找并返回，更新访问计数
        return nullptr; // 临时返回
    }
    
    // TODO: 实现大小
    size_t size() const {
        return 0; // 临时返回
    }
    
    // TODO: 实现打印
    void print() const {
        // 打印所有键值对
    }
};

int main() {
    // 使用默认参数
    Cache<std::string, int> cache;
    
    cache.put("one", 1);
    cache.put("two", 2);
    cache.put("three", 3);
    
    std::cout << "缓存内容: ";
    cache.print();
    
    std::cout << "\\n获取 'two': ";
    int* val = cache.get("two");
    if (val) {
        std::cout << *val << std::endl;
    }
    
    std::cout << "获取 'four': ";
    val = cache.get("four");
    if (val) {
        std::cout << *val << std::endl;
    } else {
        std::cout << "未找到" << std::endl;
    }
    
    std::cout << "\\n当前大小: " << cache.size() << std::endl;
    
    return 0;
}`,
                expectedOutput: `缓存内容: one:1 two:2 three:3 

获取 'two': 2
获取 'four': 未找到

当前大小: 3`,
                solutionRegex: 'maxSize|capacity|policy|storage\\[key\\]|data\\[key\\]',
                hint: '使用 map 存储数据，淘汰策略跟踪访问',
                xp: 180
            },
            references: [
                { title: '默认模板参数', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '模板设计', book: 'Effective C++', chapter: '条款45' }
            ],
            assistantTips: [
                '默认参数从右向左指定',
                '类模板参数可以有默认值',
                '函数模板参数也可以有默认值',
                'C++17 支持类模板参数自动推导'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '默认模板参数的指定方向是？', 
                    options: [
                        { text: '从左向右' }, 
                        { text: '从右向左', correct: true }, 
                        { text: '任意位置' }, 
                        { text: '只能一个' }
                    ], 
                    explanation: '默认模板参数必须从最右边开始指定。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的默认参数声明？', 
                    options: [
                        { text: 'template <typename T = int, typename U>' }, 
                        { text: 'template <typename T, typename U = int>', correct: true }, 
                        { text: 'template <T = int>' }, 
                        { text: 'template <default int T>' }
                    ], 
                    explanation: '默认参数必须在右边，使用 typename T = value 语法。' 
                },
                { 
                    type: 'single', 
                    question: 'Container<> 表示什么？', 
                    options: [
                        { text: '错误语法' }, 
                        { text: '使用所有默认参数', correct: true }, 
                        { text: '空模板' }, 
                        { text: '无参模板' }
                    ], 
                    explanation: 'Container<> 表示使用所有模板参数的默认值。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17 的类模板参数推导有什么作用？', 
                    options: [
                        { text: '忽略默认参数' }, 
                        { text: '自动推导模板参数', correct: true }, 
                        { text: '禁用默认参数' }, 
                        { text: '强制指定参数' }
                    ], 
                    explanation: 'C++17 可以根据构造函数参数自动推导类模板类型。' 
                },
                { 
                    type: 'single', 
                    question: '默认参数通常在哪里指定？', 
                    options: [
                        { text: '定义中' }, 
                        { text: '声明中', correct: true }, 
                        { text: '使用时' }, 
                        { text: '链接时' }
                    ], 
                    explanation: '默认参数通常在模板声明中指定。' 
                }
            ]
        },
        {
            id: '13.7',
            title: '成员模板',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 成员模板

### 什么是成员模板？

成员模板是类（普通类或类模板）的成员函数或嵌套类，本身也是模板。

\`\`\`cpp
class Container {
public:
    // 成员函数模板
    template <typename T>
    void process(T value) {
        std::cout << "Processing: " << value << std::endl;
    }
};
\`\`\`

### 普通类的成员模板

\`\`\`cpp
class Printer {
public:
    // 成员函数模板
    template <typename T>
    void print(const T& value) {
        std::cout << value << std::endl;
    }
    
    // 多模板参数
    template <typename T, typename U>
    void printPair(const T& first, const U& second) {
        std::cout << "(" << first << ", " << second << ")" << std::endl;
    }
};

Printer p;
p.print(42);           // T = int
p.print("hello");      // T = const char*
p.printPair(1, 2.0);   // T = int, U = double
\`\`\`

### 类模板的成员模板

\`\`\`cpp
template <typename T>
class Container {
public:
    // 成员函数模板
    template <typename U>
    void convertFrom(const Container<U>& other) {
        // 从其他类型容器转换
        value = static_cast<T>(other.getValue());
    }
    
private:
    T value;
};
\`\`\`

### 嵌套类模板

\`\`\`cpp
class Outer {
public:
    // 嵌套类模板
    template <typename T>
    class Inner {
    private:
        T data;
    public:
        Inner(T d) : data(d) {}
        T getData() const { return data; }
    };
};

Outer::Inner<int> inner1(42);
Outer::Inner<std::string> inner2("hello");
\`\`\`

### 构造函数模板

\`\`\`cpp
class Wrapper {
public:
    // 构造函数模板
    template <typename T>
    Wrapper(const T& value) : data(std::to_string(value)) {}
    
    // 特化版本
    Wrapper(const std::string& s) : data(s) {}
    
    void print() const { std::cout << data << std::endl; }
    
private:
    std::string data;
};

Wrapper w1(42);       // 调用模板构造函数
Wrapper w2(3.14);     // 调用模板构造函数
Wrapper w3("hello");  // 调用 string 构造函数
\`\`\`

### 成员模板与容器

标准库容器广泛使用成员模板：

\`\`\`cpp
template <typename T>
class MyVector {
public:
    // 从迭代器范围构造
    template <typename Iterator>
    MyVector(Iterator first, Iterator last) {
        while (first != last) {
            push_back(*first);
            ++first;
        }
    }
    
    // 从初始化列表构造
    MyVector(std::initializer_list<T> init) {
        for (const auto& item : init) {
            push_back(item);
        }
    }
    
private:
    void push_back(const T& value) { /* ... */ }
};

// 使用
std::vector<int> src = {1, 2, 3, 4, 5};
MyVector<int> dest(src.begin(), src.end());  // 迭代器构造
MyVector<int> vec = {1, 2, 3};               // 初始化列表
\`\`\`

### 成员模板特化

\`\`\`cpp
class Converter {
public:
    template <typename T>
    std::string toString(T value) {
        return std::to_string(value);
    }
};

// 成员模板特化
template <>
std::string Converter::toString<bool>(bool value) {
    return value ? "true" : "false";
}
\`\`\`

### 成员模板的限制

1. **虚函数不能是模板**：
\`\`\`cpp
class Base {
    // 错误：虚函数不能是模板
    // template <typename T>
    // virtual void process(T value);
};
\`\`\`

2. **析构函数不能是模板**

3. **成员模板不能覆盖虚函数**

### 实际应用示例

\`\`\`cpp
// 智能指针类
template <typename T>
class SmartPtr {
private:
    T* ptr;
    
public:
    SmartPtr(T* p = nullptr) : ptr(p) {}
    
    // 成员模板：支持派生类到基类的转换
    template <typename U>
    SmartPtr(const SmartPtr<U>& other) : ptr(other.get()) {
        // 只有 U* 可以转换为 T* 时才编译通过
    }
    
    T* get() const { return ptr; }
};

class Base { };
class Derived : public Base { };

SmartPtr<Derived> derivedPtr(new Derived);
SmartPtr<Base> basePtr = derivedPtr;  // 使用成员模板转换
\`\`\``,
            examples: [
                {
                    title: '通用转换器',
                    code: `#include <iostream>
#include <string>
#include <sstream>

class Converter {
public:
    // 成员模板：任意类型转字符串
    template <typename T>
    std::string toString(const T& value) {
        std::ostringstream oss;
        oss << value;
        return oss.str();
    }
    
    // 成员模板：字符串转任意类型
    template <typename T>
    T fromString(const std::string& str) {
        std::istringstream iss(str);
        T value;
        iss >> value;
        return value;
    }
    
    // 特化：bool 转字符串
    template <>
    std::string toString<bool>(const bool& value) {
        return value ? "true" : "false";
    }
    
    // 特化：字符串转 bool
    template <>
    bool fromString<bool>(const std::string& str) {
        return (str == "true" || str == "1");
    }
};

int main() {
    Converter conv;
    
    // 各种类型转字符串
    std::cout << "=== toString 测试 ===" << std::endl;
    std::cout << "int: " << conv.toString(42) << std::endl;
    std::cout << "double: " << conv.toString(3.14159) << std::endl;
    std::cout << "bool: " << conv.toString(true) << std::endl;
    std::cout << "char: " << conv.toString('A') << std::endl;
    
    // 字符串转各种类型
    std::cout << "\\n=== fromString 测试 ===" << std::endl;
    std::cout << "string \"123\" to int: " << conv.fromString<int>("123") << std::endl;
    std::cout << "string \"3.14\" to double: " << conv.fromString<double>("3.14") << std::endl;
    std::cout << "string \"true\" to bool: " << conv.fromString<bool>("true") << std::endl;
    
    return 0;
}`,
                    description: '使用成员模板实现通用类型转换器。'
                },
                {
                    title: '容器构造函数模板',
                    code: `#include <iostream>
#include <vector>
#include <list>
#include <array>

template <typename T>
class SimpleContainer {
private:
    std::vector<T> data;
    
public:
    // 默认构造
    SimpleContainer() = default;
    
    // 成员模板：从迭代器范围构造
    template <typename Iterator>
    SimpleContainer(Iterator first, Iterator last) {
        while (first != last) {
            data.push_back(*first);
            ++first;
        }
    }
    
    // 成员模板：从初始化列表构造
    SimpleContainer(std::initializer_list<T> init) {
        for (const auto& item : init) {
            data.push_back(item);
        }
    }
    
    // 成员模板：从其他容器构造
    template <typename Container>
    SimpleContainer(const Container& other) {
        for (const auto& item : other) {
            data.push_back(item);
        }
    }
    
    // 打印
    void print() const {
        std::cout << "[";
        for (size_t i = 0; i < data.size(); ++i) {
            std::cout << data[i];
            if (i < data.size() - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
    
    size_t size() const { return data.size(); }
};

int main() {
    std::cout << "=== 从初始化列表构造 ===" << std::endl;
    SimpleContainer<int> c1 = {1, 2, 3, 4, 5};
    c1.print();
    
    std::cout << "\\n=== 从 vector 构造 ===" << std::endl;
    std::vector<int> vec = {10, 20, 30};
    SimpleContainer<int> c2(vec);
    c2.print();
    
    std::cout << "\\n=== 从 list 构造 ===" << std::endl;
    std::list<double> lst = {1.1, 2.2, 3.3};
    SimpleContainer<double> c3(lst);
    c3.print();
    
    std::cout << "\\n=== 从迭代器范围构造 ===" << std::endl;
    std::array<int, 4> arr = {100, 200, 300, 400};
    SimpleContainer<int> c4(arr.begin(), arr.end());
    c4.print();
    
    std::cout << "\\n大小: " << c4.size() << std::endl;
    
    return 0;
}`,
                    description: '使用成员模板实现灵活的容器构造。'
                }
            ],
            handsOn: {
                title: '实现通用工厂',
                description: '使用成员模板实现一个工厂类，可以创建不同类型的对象。',
                initialCode: `#include <iostream>
#include <string>
#include <memory>

// 产品基类
class Product {
public:
    virtual ~Product() = default;
    virtual void use() const = 0;
};

// 具体产品
class ProductA : public Product {
public:
    void use() const override {
        std::cout << "使用产品 A" << std::endl;
    }
};

class ProductB : public Product {
public:
    void use() const override {
        std::cout << "使用产品 B" << std::endl;
    }
};

// TODO: 实现工厂类
class Factory {
public:
    // TODO: 实现成员模板 create
    // template <typename T, typename... Args>
    // static std::unique_ptr<T> create(Args&&... args)
    // 要求：T 必须是 Product 的派生类
    
};

int main() {
    // 创建产品 A
    auto productA = Factory::create<ProductA>();
    productA->use();
    
    // 创建产品 B
    auto productB = Factory::create<ProductB>();
    productB->use();
    
    // 使用基类指针
    std::unique_ptr<Product> products[] = {
        Factory::create<ProductA>(),
        Factory::create<ProductB>()
    };
    
    std::cout << "\\n通过基类指针使用:" << std::endl;
    for (const auto& p : products) {
        p->use();
    }
    
    return 0;
}`,
                expectedOutput: `使用产品 A
使用产品 B

通过基类指针使用:
使用产品 A
使用产品 B`,
                solutionRegex: 'template\\s*<|std::make_unique|std::forward|new T',
                hint: '使用 std::make_unique<T>() 创建对象，支持可变参数模板',
                xp: 180
            },
            references: [
                { title: '成员模板', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: '模板成员函数', book: 'Effective C++', chapter: '条款45' }
            ],
            assistantTips: [
                '成员模板可以是普通类或类模板的成员',
                '构造函数可以是模板',
                '虚函数不能是模板',
                '成员模板常用于类型转换和容器构造'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '成员模板是什么？', 
                    options: [
                        { text: '类的模板成员' }, 
                        { text: '本身是模板的类成员', correct: true }, 
                        { text: '模板类的成员' }, 
                        { text: '静态模板' }
                    ], 
                    explanation: '成员模板是类中本身也是模板的成员函数或嵌套类。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个可以是成员模板？', 
                    options: [
                        { text: '虚函数' }, 
                        { text: '构造函数', correct: true }, 
                        { text: '析构函数' }, 
                        { text: '纯虚函数' }
                    ], 
                    explanation: '构造函数可以是模板，但虚函数和析构函数不能。' 
                },
                { 
                    type: 'single', 
                    question: '成员模板的主要用途是？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '支持泛型操作', correct: true }, 
                        { text: '简化代码' }, 
                        { text: '支持多态' }
                    ], 
                    explanation: '成员模板支持泛型操作，如从迭代器构造容器。' 
                },
                { 
                    type: 'single', 
                    question: '嵌套类可以是模板吗？', 
                    options: [
                        { text: '不可以' }, 
                        { text: '可以', correct: true }, 
                        { text: '只有外部类是模板时才可以' }, 
                        { text: '只有静态嵌套类可以' }
                    ], 
                    explanation: '嵌套类可以是模板，无论外部类是否是模板。' 
                },
                { 
                    type: 'single', 
                    question: '智能指针的成员模板用于？', 
                    options: [
                        { text: '内存管理' }, 
                        { text: '派生类到基类的转换', correct: true }, 
                        { text: '引用计数' }, 
                        { text: '线程安全' }
                    ], 
                    explanation: '智能指针使用成员模板支持派生类指针到基类指针的转换。' 
                }
            ]
        },
        {
            id: '13.8',
            title: '控制实例化（extern template）',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 控制实例化（extern template）

### 什么是模板实例化？

模板实例化是编译器根据模板生成具体类型代码的过程：

\`\`\`cpp
template <typename T>
class Container { };

Container<int> c1;    // 实例化 Container<int>
Container<double> c2; // 实例化 Container<double>
\`\`\`

### 隐式实例化

通常，模板在使用时自动实例化：

\`\`\`cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    add(1, 2);     // 隐式实例化 add<int>
    add(1.0, 2.0); // 隐式实例化 add<double>
}
\`\`\`

### 显式实例化定义

使用 template 关键字显式实例化：

\`\`\`cpp
// 显式实例化定义
template class Container<int>;
template class Container<double>;

// 函数模板显式实例化
template int add<int>(int, int);
template double add<double>(double, double);
\`\`\`

### 显式实例化声明（extern template）

使用 extern template 声明实例化在其他地方：

\`\`\`cpp
// 声明：实例化在别处
extern template class Container<int>;
extern template class Container<double>;

// 使用
Container<int> c;  // 不会在此处实例化
\`\`\`

### 为什么需要控制实例化？

1. **减少编译时间**：避免在多个编译单元重复实例化
2. **减少代码膨胀**：控制生成的代码量
3. **分离接口与实现**：模板实现可以放在源文件中

### 实际应用示例

#### 头文件（template.h）

\`\`\`cpp
#ifndef TEMPLATE_H
#define TEMPLATE_H

template <typename T>
class Container {
public:
    void process();
};

#endif
\`\`\`

#### 实现文件（template.cpp）

\`\`\`cpp
#include "template.h"
#include <iostream>

template <typename T>
void Container<T>::process() {
    std::cout << "Processing..." << std::endl;
}

// 显式实例化常用类型
template class Container<int>;
template class Container<double>;
template class Container<std::string>;
\`\`\`

#### 使用文件（main.cpp）

\`\`\`cpp
#include "template.h"

// 声明实例化在别处
extern template class Container<int>;
extern template class Container<double>;

int main() {
    Container<int> c;
    c.process();  // 使用 template.cpp 中的实例化
}
\`\`\`

### 实例化的时机

| 类型 | 时机 | 说明 |
|------|------|------|
| 隐式实例化 | 使用时 | 自动进行 |
| 显式实例化定义 | 编译时 | 强制生成代码 |
| 显式实例化声明 | 链接时 | 使用其他地方的实例化 |

### 成员函数的实例化

类模板的成员函数是延迟实例化的：

\`\`\`cpp
template <typename T>
class Container {
public:
    void method1() { /* 使用 T */ }
    void method2() { /* 不使用 T */ }
};

Container<int> c;
c.method2();  // 只实例化 method2
// method1 可能不会被实例化
\`\`\`

### 显式实例化的注意事项

1. **必须可见定义**：显式实例化时必须能看到完整定义
2. **不能重复**：同一类型不能多次显式实例化定义
3. **extern 必须匹配**：extern 声明必须有对应的显式实例化定义

\`\`\`cpp
// 错误：重复实例化
template class Container<int>;
template class Container<int>;  // 错误！

// 正确：extern 声明 + 定义
extern template class Container<int>;  // 声明
template class Container<int>;         // 定义
\`\`\`

### 编译时优化

\`\`\`cpp
// common_types.h
#pragma once

template <typename T>
class Vector { /* ... */ };

// 声明常用类型的实例化在别处
extern template class Vector<int>;
extern template class Vector<double>;
extern template class Vector<std::string>;

// common_types.cpp
#include "common_types.h"

// 显式实例化常用类型
template class Vector<int>;
template class Vector<double>;
template class Vector<std::string>;
\`\`\`

### 最佳实践

1. **大型项目**：使用 extern template 减少编译时间
2. **库开发**：显式实例化常用类型
3. **模板实现**：可以放在源文件中（配合显式实例化）
4. **避免滥用**：小型项目可能不需要`,
            examples: [
                {
                    title: '显式实例化示例',
                    code: `#include <iostream>
#include <string>

// 模板定义
template <typename T>
class Processor {
private:
    T value;
public:
    Processor(T v) : value(v) {}
    
    void process() {
        std::cout << "Processing value: " << value << std::endl;
    }
    
    T getValue() const { return value; }
};

// 函数模板
template <typename T>
T compute(T a, T b) {
    return a + b;
}

// 显式实例化定义
template class Processor<int>;
template class Processor<double>;
template class Processor<std::string>;

template int compute<int>(int, int);
template double compute<double>(double, double);

int main() {
    std::cout << "=== 类模板实例化 ===" << std::endl;
    
    Processor<int> p1(42);
    p1.process();
    
    Processor<double> p2(3.14);
    p2.process();
    
    Processor<std::string> p3("Hello");
    p3.process();
    
    std::cout << "\\n=== 函数模板实例化 ===" << std::endl;
    
    int sum1 = compute(10, 20);
    std::cout << "10 + 20 = " << sum1 << std::endl;
    
    double sum2 = compute(1.5, 2.5);
    std::cout << "1.5 + 2.5 = " << sum2 << std::endl;
    
    return 0;
}`,
                    description: '展示显式实例化的基本用法。'
                },
                {
                    title: 'extern template 示例',
                    code: `#include <iostream>
#include <string>

// 模拟模板库的组织方式

// ===== template.h =====
template <typename T>
class Calculator {
public:
    T add(T a, T b) { return a + b; }
    T subtract(T a, T b) { return a - b; }
    T multiply(T a, T b) { return a * b; }
    T divide(T a, T b) { return a / b; }
};

// extern 声明（告诉编译器实例化在别处）
// extern template class Calculator<int>;
// extern template class Calculator<double>;

// ===== template.cpp =====
// 显式实例化定义
// template class Calculator<int>;
// template class Calculator<double>;

// ===== main.cpp =====
int main() {
    std::cout << "=== 使用 Calculator<int> ===" << std::endl;
    Calculator<int> intCalc;
    std::cout << "10 + 5 = " << intCalc.add(10, 5) << std::endl;
    std::cout << "10 - 5 = " << intCalc.subtract(10, 5) << std::endl;
    std::cout << "10 * 5 = " << intCalc.multiply(10, 5) << std::endl;
    std::cout << "10 / 5 = " << intCalc.divide(10, 5) << std::endl;
    
    std::cout << "\\n=== 使用 Calculator<double> ===" << std::endl;
    Calculator<double> doubleCalc;
    std::cout << "10.5 + 2.5 = " << doubleCalc.add(10.5, 2.5) << std::endl;
    std::cout << "10.5 - 2.5 = " << doubleCalc.subtract(10.5, 2.5) << std::endl;
    std::cout << "10.5 * 2.5 = " << doubleCalc.multiply(10.5, 2.5) << std::endl;
    std::cout << "10.5 / 2.5 = " << doubleCalc.divide(10.5, 2.5) << std::endl;
    
    // 未显式实例化的类型会在使用时隐式实例化
    std::cout << "\\n=== 使用 Calculator<long> ===" << std::endl;
    Calculator<long> longCalc;
    std::cout << "100L + 200L = " << longCalc.add(100L, 200L) << std::endl;
    
    return 0;
}`,
                    description: '展示 extern template 的组织方式。'
                }
            ],
            handsOn: {
                title: '组织模板库',
                description: '创建一个模板库，使用显式实例化和 extern template 组织代码。',
                initialCode: `#include <iostream>
#include <string>

// TODO: 实现 MathUtils 模板类
// 包含：add, subtract, multiply, divide, power

template <typename T>
class MathUtils {
public:
    // TODO: 实现加法
    static T add(T a, T b) {
        return T(); // 临时返回
    }
    
    // TODO: 实现减法
    static T subtract(T a, T b) {
        return T(); // 临时返回
    }
    
    // TODO: 实现乘法
    static T multiply(T a, T b) {
        return T(); // 临时返回
    }
    
    // TODO: 实现除法
    static T divide(T a, T b) {
        return T(); // 临时返回
    }
    
    // TODO: 实现幂运算（简单循环实现）
    static T power(T base, int exp) {
        return T(); // 临时返回
    }
};

// TODO: 显式实例化常用类型
// template class MathUtils<int>;
// template class MathUtils<double>;

int main() {
    std::cout << "=== MathUtils<int> ===" << std::endl;
    std::cout << "5 + 3 = " << MathUtils<int>::add(5, 3) << std::endl;
    std::cout << "5 - 3 = " << MathUtils<int>::subtract(5, 3) << std::endl;
    std::cout << "5 * 3 = " << MathUtils<int>::multiply(5, 3) << std::endl;
    std::cout << "6 / 3 = " << MathUtils<int>::divide(6, 3) << std::endl;
    std::cout << "2^10 = " << MathUtils<int>::power(2, 10) << std::endl;
    
    std::cout << "\\n=== MathUtils<double> ===" << std::endl;
    std::cout << "5.5 + 3.3 = " << MathUtils<double>::add(5.5, 3.3) << std::endl;
    std::cout << "5.5 - 3.3 = " << MathUtils<double>::subtract(5.5, 3.3) << std::endl;
    std::cout << "5.5 * 3.3 = " << MathUtils<double>::multiply(5.5, 3.3) << std::endl;
    std::cout << "5.5 / 2.0 = " << MathUtils<double>::divide(5.5, 2.0) << std::endl;
    std::cout << "2.0^5 = " << MathUtils<double>::power(2.0, 5) << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== MathUtils<int> ===
5 + 3 = 8
5 - 3 = 2
5 * 3 = 15
6 / 3 = 2
2^10 = 1024

=== MathUtils<double> ===
5.5 + 3.3 = 8.8
5.5 - 3.3 = 2.2
5.5 * 3.3 = 18.15
5.5 / 2.0 = 2.75
2.0^5 = 32`,
                solutionRegex: 'return a \\+ b|return a - b|return a \\* b|return a / b|result \\*= base',
                hint: '实现基本运算，power 使用循环累乘',
                xp: 160
            },
            references: [
                { title: '模板实例化', book: 'C++ Primer 第五版', chapter: '第16章' },
                { title: 'extern template', book: 'Effective C++', chapter: '条款30' }
            ],
            assistantTips: [
                '显式实例化使用 template class 语法',
                'extern template 声明实例化在其他地方',
                '可以减少编译时间和代码膨胀',
                '大型项目中推荐使用显式实例化'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '显式实例化定义的语法是？', 
                    options: [
                        { text: 'instantiate class Container<int>' }, 
                        { text: 'template class Container<int>', correct: true }, 
                        { text: 'class Container<int>' }, 
                        { text: 'template <int> class Container' }
                    ], 
                    explanation: '使用 template class ClassName<Type>; 显式实例化。' 
                },
                { 
                    type: 'single', 
                    question: 'extern template 的作用是？', 
                    options: [
                        { text: '导出模板' }, 
                        { text: '声明实例化在其他地方', correct: true }, 
                        { text: '创建外部模板' }, 
                        { text: '链接外部库' }
                    ], 
                    explanation: 'extern template 声明模板实例化在其他编译单元中。' 
                },
                { 
                    type: 'single', 
                    question: '隐式实例化发生在什么时候？', 
                    options: [
                        { text: '编译时' }, 
                        { text: '链接时' }, 
                        { text: '使用时', correct: true }, 
                        { text: '运行时' }
                    ], 
                    explanation: '隐式实例化在模板被使用时自动发生。' 
                },
                { 
                    type: 'single', 
                    question: '类模板成员函数什么时候实例化？', 
                    options: [
                        { text: '类实例化时' }, 
                        { text: '被调用时', correct: true }, 
                        { text: '编译时' }, 
                        { text: '链接时' }
                    ], 
                    explanation: '类模板成员函数是延迟实例化的，只有被调用时才实例化。' 
                },
                { 
                    type: 'single', 
                    question: '显式实例化的好处是？', 
                    options: [
                        { text: '提高运行速度' }, 
                        { text: '减少编译时间和代码膨胀', correct: true }, 
                        { text: '支持更多类型' }, 
                        { text: '简化代码' }
                    ], 
                    explanation: '显式实例化可以减少编译时间和避免重复代码生成。' 
                }
            ]
        }
    ]
};

window.Unit13Data = Unit13Data;
