/**
 * 单元12：多重继承与虚继承
 */
const Unit12Data = {
    id: 12,
    title: '多重继承与虚继承',
    description: '深入理解多重继承机制，掌握虚继承解决菱形继承问题的方法，学习多重继承下的类设计最佳实践',
    lessons: [
        {
            id: '12.1',
            title: '多重继承的定义与歧义',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 多重继承的定义与歧义

### 什么是多重继承？

多重继承（Multiple Inheritance）是指一个派生类可以同时继承多个基类。

\`\`\`cpp
class Base1 { /* ... */ };
class Base2 { /* ... */ };

// Derived同时继承Base1和Base2
class Derived : public Base1, public Base2 {
    /* ... */
};
\`\`\`

### 多重继承的基本语法

\`\`\`cpp
#include <iostream>
#include <string>

class Flyable {
public:
    void fly() { std::cout << "正在飞行" << std::endl; }
};

class Swimmable {
public:
    void swim() { std::cout << "正在游泳" << std::endl; }
};

// Duck同时继承Flyable和Swimmable
class Duck : public Flyable, public Swimmable {
public:
    void quack() { std::cout << "嘎嘎叫" << std::endl; }
};

int main() {
    Duck duck;
    duck.fly();   // 来自Flyable
    duck.swim();  // 来自Swimmable
    duck.quack(); // Duck自己的方法
    return 0;
}
\`\`\`

### 多重继承的内存布局

派生类对象包含所有基类的子对象：

\`\`\`cpp
class A {
public:
    int a;
};

class B {
public:
    int b;
};

class C : public A, public B {
public:
    int c;
};

// C对象的内存布局：
// [ A::a ] [ B::b ] [ C::c ]
\`\`\`

### 成员访问歧义

当多个基类有同名成员时，会产生歧义：

\`\`\`cpp
class Base1 {
public:
    void show() { std::cout << "Base1::show()" << std::endl; }
};

class Base2 {
public:
    void show() { std::cout << "Base2::show()" << std::endl; }
};

class Derived : public Base1, public Base2 {
};

int main() {
    Derived d;
    // d.show();  // 错误：歧义！
    d.Base1::show();  // 正确：明确指定
    d.Base2::show();  // 正确：明确指定
    return 0;
}
\`\`\`

### 解决歧义的方法

#### 1. 使用作用域限定符

\`\`\`cpp
d.Base1::show();  // 明确调用Base1的show
d.Base2::show();  // 明确调用Base2的show
\`\`\`

#### 2. 在派生类中重写

\`\`\`cpp
class Derived : public Base1, public Base2 {
public:
    void show() {
        Base1::show();  // 选择调用哪个版本
    }
};
\`\`\`

#### 3. 使用using声明

\`\`\`cpp
class Derived : public Base1, public Base2 {
public:
    using Base1::show;  // 使Base1::show可见
};
\`\`\`

### 数据成员歧义

\`\`\`cpp
class Base1 {
public:
    int value;
};

class Base2 {
public:
    int value;
};

class Derived : public Base1, public Base2 {
public:
    void setValue(int v) {
        // value = v;  // 错误：歧义
        Base1::value = v;  // 正确
        Base2::value = v;  // 正确
    }
};
\`\`\`

### 多重继承的类型转换

\`\`\`cpp
class Base1 { /* ... */ };
class Base2 { /* ... */ };
class Derived : public Base1, public Base2 { /* ... */ };

Derived d;
Base1* p1 = &d;  // 隐式转换
Base2* p2 = &d;  // 隐式转换（指针会调整）

// 从Base指针转回Derived需要dynamic_cast
Derived* pd = dynamic_cast<Derived*>(p1);
\`\`\`

### 多重继承的优缺点

| 优点 | 缺点 |
|------|------|
| 代码复用更灵活 | 可能产生歧义 |
| 符合组合思想 | 内存布局复杂 |
| 支持多接口继承 | 菱形继承问题 |
| 表达能力强 | 设计复杂度高 |

### 最佳实践

1. **优先使用单一继承**：简单清晰
2. **多重继承主要用于接口**：纯虚类（抽象类）
3. **避免有数据成员的多重继承**：减少复杂度
4. **使用虚继承解决菱形问题**：后续章节详解

\`\`\`cpp
// 推荐的接口式多重继承
class ISerializable {
public:
    virtual void serialize() = 0;
};

class IPrintable {
public:
    virtual void print() = 0;
};

class Document : public ISerializable, public IPrintable {
    // 实现两个接口
    void serialize() override { /* ... */ }
    void print() override { /* ... */ }
};
\`\`\``,
            examples: [
                {
                    title: '多重继承基础示例',
                    code: `#include <iostream>
#include <string>

// 第一个基类
class Artist {
public:
    void draw() {
        std::cout << "正在绘画" << std::endl;
    }
    std::string style = "印象派";
};

// 第二个基类
class Musician {
public:
    void play() {
        std::cout << "正在演奏音乐" << std::endl;
    }
    std::string instrument = "钢琴";
};

// 多重继承
class CreativePerson : public Artist, public Musician {
public:
    void create() {
        std::cout << "正在创作艺术作品" << std::endl;
    }
};

int main() {
    CreativePerson person;
    
    std::cout << "=== 调用继承的方法 ===" << std::endl;
    person.draw();   // 来自Artist
    person.play();   // 来自Musician
    person.create(); // 自己的方法
    
    std::cout << "\\n=== 访问继承的成员 ===" << std::endl;
    std::cout << "艺术风格: " << person.style << std::endl;
    std::cout << "乐器: " << person.instrument << std::endl;
    
    return 0;
}`,
                    description: '展示多重继承的基本用法，派生类同时获得两个基类的功能。'
                },
                {
                    title: '解决成员歧义',
                    code: `#include <iostream>

class File {
public:
    void open() {
        std::cout << "File::open() - 打开文件" << std::endl;
    }
    void close() {
        std::cout << "File::close() - 关闭文件" << std::endl;
    }
};

class Network {
public:
    void open() {
        std::cout << "Network::open() - 打开网络连接" << std::endl;
    }
    void close() {
        std::cout << "Network::close() - 关闭网络连接" << std::endl;
    }
};

// 多重继承，两个基类有同名方法
class NetworkFile : public File, public Network {
public:
    // 方法1：在派生类中重写，明确调用哪个版本
    void openFile() {
        File::open();
    }
    
    void openNetwork() {
        Network::open();
    }
    
    // 方法2：使用using声明
    using File::close;  // 选择File的close
    
    // 方法3：提供统一的接口
    void closeAll() {
        File::close();
        Network::close();
    }
};

int main() {
    NetworkFile nf;
    
    std::cout << "=== 通过派生类方法访问 ===" << std::endl;
    nf.openFile();
    nf.openNetwork();
    
    std::cout << "\\n=== 使用using声明 ===" << std::endl;
    nf.close();  // 调用File::close
    
    std::cout << "\\n=== 统一接口 ===" << std::endl;
    nf.closeAll();
    
    std::cout << "\\n=== 使用作用域限定符 ===" << std::endl;
    nf.File::open();
    nf.Network::open();
    
    return 0;
}`,
                    description: '展示多重继承中同名成员的歧义问题及三种解决方法。'
                }
            ],
            handsOn: {
                title: '实现多接口类',
                description: '创建一个实现多个接口的类，处理接口方法的歧义问题。',
                initialCode: `#include <iostream>
#include <string>

// 接口1：可序列化
class Serializable {
public:
    virtual std::string toString() const = 0;
    virtual ~Serializable() = default;
};

// 接口2：可比较
class Comparable {
public:
    virtual int compare(const Comparable& other) const = 0;
    virtual ~Comparable() = default;
};

// 接口3：可打印
class Printable {
public:
    virtual void print() const = 0;
    virtual ~Printable() = default;
};

// TODO: 创建Person类，多重继承三个接口
class Person {
    // TODO: 添加私有成员 name 和 age
    
public:
    // TODO: 实现构造函数
    
    // TODO: 实现 Serializable 接口
    std::string toString() const override {
        // 返回格式: "Person(name, age)"
        return "";
    }
    
    // TODO: 实现 Comparable 接口
    int compare(const Comparable& other) const override {
        // 比较年龄，返回 -1, 0, 1
        return 0;
    }
    
    // TODO: 实现 Printable 接口
    void print() const override {
        // 打印: "姓名: name, 年龄: age"
    }
    
    // Getter方法
    std::string getName() const { return name; }
    int getAge() const { return age; }
};

int main() {
    Person p1("张三", 25);
    Person p2("李四", 30);
    
    std::cout << "=== Serializable接口 ===" << std::endl;
    std::cout << p1.toString() << std::endl;
    
    std::cout << "\\n=== Comparable接口 ===" << std::endl;
    std::cout << "比较结果: " << p1.compare(p2) << std::endl;
    
    std::cout << "\\n=== Printable接口 ===" << std::endl;
    p1.print();
    p2.print();
    
    return 0;
}`,
                expectedOutput: `=== Serializable接口 ===
Person(张三, 25)

=== Comparable接口 ===
比较结果: -1

=== Printable接口 ===
姓名: 张三, 年龄: 25
姓名: 李四, 年龄: 30`,
                solutionRegex: 'class Person.*Serializable.*Comparable.*Printable|toString|compare|print',
                hint: 'Person类需要继承三个接口并实现所有纯虚函数',
                xp: 200
            },
            references: [
                { title: '多重继承', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '多重继承与虚继承', book: 'Effective C++', chapter: '条款40' }
            ],
            assistantTips: [
                '多重继承允许一个类继承多个基类',
                '同名成员会产生歧义，需要用作用域限定符解决',
                '优先使用接口式多重继承（纯虚类）',
                '多重继承会增加设计复杂度，谨慎使用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '多重继承是指？', 
                    options: [
                        { text: '一个基类有多个派生类' }, 
                        { text: '一个派生类继承多个基类', correct: true }, 
                        { text: '多个派生类继承一个基类' }, 
                        { text: '类的多层继承' }
                    ], 
                    explanation: '多重继承是指一个派生类可以同时继承多个基类。' 
                },
                { 
                    type: 'single', 
                    question: '多个基类有同名成员时会产生什么问题？', 
                    options: [
                        { text: '编译错误' }, 
                        { text: '运行时错误' }, 
                        { text: '歧义', correct: true }, 
                        { text: '内存泄漏' }
                    ], 
                    explanation: '多个基类有同名成员时，派生类访问该成员会产生歧义。' 
                },
                { 
                    type: 'single', 
                    question: '解决成员歧义的方法不包括？', 
                    options: [
                        { text: '使用作用域限定符' }, 
                        { text: '在派生类中重写' }, 
                        { text: '使用using声明' }, 
                        { text: '删除基类成员', correct: true }
                    ], 
                    explanation: '不能删除基类成员，可以通过作用域限定符、重写或using声明解决歧义。' 
                },
                { 
                    type: 'single', 
                    question: '多重继承的派生类对象包含什么？', 
                    options: [
                        { text: '只包含第一个基类的子对象' }, 
                        { text: '所有基类的子对象', correct: true }, 
                        { text: '不包含基类的子对象' }, 
                        { text: '只包含最后一个基类的子对象' }
                    ], 
                    explanation: '派生类对象包含所有基类的子对象。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪种情况最适合使用多重继承？', 
                    options: [
                        { text: '需要复用多个实现类' }, 
                        { text: '实现多个接口（纯虚类）', correct: true }, 
                        { text: '需要多层继承' }, 
                        { text: '所有情况都适合' }
                    ], 
                    explanation: '多重继承最适合用于实现多个接口，避免实现继承的复杂度。' 
                }
            ]
        },
        {
            id: '12.2',
            title: '虚继承与虚基类',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 420,
            concepts: `## 虚继承与虚基类

### 菱形继承问题

当两个派生类继承同一个基类，而另一个类同时继承这两个派生类时，形成菱形继承结构：

\`\`\`
      Animal
      /    \\
   Flying  Swimming
      \\    /
       Duck
\`\`\`

\`\`\`cpp
class Animal {
public:
    int age;
};

class Flying : public Animal {
    // ...
};

class Swimming : public Animal {
    // ...
};

// Duck有两个Animal子对象！
class Duck : public Flying, public Swimming {
    // age来自Flying::Animal
    // age来自Swimming::Animal
    // 两个age！
};
\`\`\`

### 菱形继承的问题

1. **数据冗余**：基类成员被复制多份
2. **访问歧义**：访问基类成员时产生歧义
3. **内存浪费**：存储多份相同数据
4. **一致性难以保证**：多个副本可能不同步

\`\`\`cpp
Duck duck;
// duck.age = 1;  // 错误：歧义
duck.Flying::age = 1;
duck.Swimming::age = 2;  // 两个age值不同！
\`\`\`

### 虚继承的解决方案

虚继承确保只有一个共享的基类子对象：

\`\`\`cpp
class Animal {
public:
    int age;
    Animal() : age(0) {}
};

// 使用virtual关键字声明虚继承
class Flying : virtual public Animal {
    // ...
};

class Swimming : virtual public Animal {
    // ...
};

// Duck现在只有一个Animal子对象
class Duck : public Flying, public Swimming {
    // 只有一个age成员
};
\`\`\`

### 虚基类的概念

被虚继承的基类称为**虚基类**（Virtual Base Class）。

\`\`\`cpp
class Base { /* ... */ };

class Derived1 : virtual public Base { /* ... */ };
class Derived2 : virtual public Base { /* ... */ };

class Final : public Derived1, public Derived2 {
    // 只有一个Base子对象
};
\`\`\`

### 虚继承的语法

\`\`\`cpp
// 方式1：public虚继承
class Derived : virtual public Base { };

// 方式2：private虚继承
class Derived : virtual private Base { };

// 方式3：protected虚继承
class Derived : virtual protected Base { };

// 方式4：简写
class Derived : virtual Base { };  // 默认private
\`\`\`

### 虚继承的内存布局

普通继承：
\`\`\`
[Flying部分: Animal子对象 + Flying成员]
[Swimming部分: Animal子对象 + Swimming成员]
[Duck成员]
// 共有两个Animal子对象
\`\`\`

虚继承：
\`\`\`
[Flying部分: 指向虚基类的指针 + Flying成员]
[Swimming部分: 指向虚基类的指针 + Swimming成员]
[Duck成员]
[共享的Animal子对象]
// 只有一个Animal子对象
\`\`\`

### 虚继承示例

\`\`\`cpp
#include <iostream>

class Animal {
public:
    int age;
    Animal() : age(0) {
        std::cout << "Animal构造" << std::endl;
    }
};

class Flying : virtual public Animal {
public:
    Flying() {
        std::cout << "Flying构造" << std::endl;
    }
    void fly() {
        std::cout << "飞行，年龄: " << age << std::endl;
    }
};

class Swimming : virtual public Animal {
public:
    Swimming() {
        std::cout << "Swimming构造" << std::endl;
    }
    void swim() {
        std::cout << "游泳，年龄: " << age << std::endl;
    }
};

class Duck : public Flying, public Swimming {
public:
    Duck() {
        std::cout << "Duck构造" << std::endl;
    }
};

int main() {
    Duck duck;
    duck.age = 5;  // 无歧义，只有一个age
    
    duck.fly();
    duck.swim();
    
    return 0;
}
\`\`\`

### 虚继承的注意事项

1. **虚基类由最远派生类初始化**：虚基类的构造函数由最远派生类直接调用
2. **中间类不初始化虚基类**：中间派生类对虚基类的构造调用会被忽略
3. **性能开销**：虚继承需要额外的指针和间接访问
4. **设计复杂性**：增加代码理解和维护难度

### 虚继承 vs 普通继承

| 特性 | 普通继承 | 虚继承 |
|------|----------|--------|
| 基类子对象 | 每条路径一份 | 共享一份 |
| 初始化责任 | 直接基类 | 最远派生类 |
| 内存布局 | 连续存储 | 需要指针间接访问 |
| 性能 | 更快 | 略慢 |
| 适用场景 | 单继承、无菱形 | 菱形继承 |

### 何时使用虚继承

1. **菱形继承不可避免时**：解决数据冗余和歧义
2. **需要共享基类状态时**：所有派生类访问同一基类实例
3. **接口继承**：抽象基类作为接口

\`\`\`cpp
// 推荐用法：接口继承
class IStream {
public:
    virtual void read() = 0;
    virtual void write() = 0;
};

class IInput : virtual public IStream {
public:
    virtual void read() override { /* ... */ }
};

class IOutput : virtual public IStream {
public:
    virtual void write() override { /* ... */ }
};

class IOStream : public IInput, public IOutput {
    // 只有一个IStream子对象
};
\`\`\``,
            examples: [
                {
                    title: '菱形继承问题演示',
                    code: `#include <iostream>

// 基类
class Person {
public:
    std::string name;
    Person() {
        std::cout << "Person构造" << std::endl;
    }
};

// 没有使用虚继承 - 会产生问题
class Student : public Person {
public:
    Student() {
        std::cout << "Student构造" << std::endl;
    }
};

class Employee : public Person {
public:
    Employee() {
        std::cout << "Employee构造" << std::endl;
    }
};

// TeachingAssistant有两个Person子对象！
class TeachingAssistant : public Student, public Employee {
public:
    TeachingAssistant() {
        std::cout << "TeachingAssistant构造" << std::endl;
    }
};

int main() {
    std::cout << "=== 没有虚继承 ===" << std::endl;
    TeachingAssistant ta;
    
    // 问题1：歧义
    // ta.name = "张三";  // 错误：歧义
    
    // 必须指定哪个Person
    ta.Student::name = "学生张三";
    ta.Employee::name = "员工张三";
    
    std::cout << "Student::name = " << ta.Student::name << std::endl;
    std::cout << "Employee::name = " << ta.Employee::name << std::endl;
    std::cout << "两个name值不同！" << std::endl;
    
    return 0;
}`,
                    description: '展示没有虚继承时的菱形继承问题：数据冗余和歧义。'
                },
                {
                    title: '虚继承解决菱形问题',
                    code: `#include <iostream>
#include <string>

// 基类
class Person {
public:
    std::string name;
    Person() : name("未命名") {
        std::cout << "Person构造" << std::endl;
    }
};

// 使用virtual关键字进行虚继承
class Student : virtual public Person {
public:
    Student() {
        std::cout << "Student构造" << std::endl;
    }
    void study() {
        std::cout << name << "正在学习" << std::endl;
    }
};

class Employee : virtual public Person {
public:
    Employee() {
        std::cout << "Employee构造" << std::endl;
    }
    void work() {
        std::cout << name << "正在工作" << std::endl;
    }
};

// TeachingAssistant现在只有一个Person子对象
class TeachingAssistant : public Student, public Employee {
public:
    TeachingAssistant() {
        std::cout << "TeachingAssistant构造" << std::endl;
    }
    void teach() {
        std::cout << name << "正在教学" << std::endl;
    }
};

int main() {
    std::cout << "=== 使用虚继承 ===" << std::endl;
    TeachingAssistant ta;
    
    // 无歧义，只有一个name
    ta.name = "张三";
    
    std::cout << "\\n=== 所有方法访问同一个name ===" << std::endl;
    ta.study();
    ta.work();
    ta.teach();
    
    std::cout << "\\n=== 验证只有一个Person子对象 ===" << std::endl;
    ta.Student::name = "李四";
    std::cout << "Employee::name = " << ta.Employee::name << std::endl;
    std::cout << "修改Student::name后，Employee::name也变了！" << std::endl;
    
    return 0;
}`,
                    description: '展示虚继承如何解决菱形继承问题：只有一个共享的基类子对象。'
                }
            ],
            handsOn: {
                title: '实现虚继承层次',
                description: '创建一个使用虚继承的类层次结构，解决菱形继承问题。',
                initialCode: `#include <iostream>
#include <string>

// 基类：设备
class Device {
protected:
    int deviceId;
public:
    Device() : deviceId(0) {
        std::cout << "Device构造" << std::endl;
    }
    
    int getId() const { return deviceId; }
    void setId(int id) { deviceId = id; }
};

// TODO: 使用虚继承创建NetworkDevice类
class NetworkDevice {
    // 虚继承Device
    // 添加 connect() 方法，输出 "设备[id]连接网络"
};

// TODO: 使用虚继承创建StorageDevice类
class StorageDevice {
    // 虚继承Device
    // 添加 save() 方法，输出 "设备[id]保存数据"
};

// TODO: 创建SmartDevice类，多重继承NetworkDevice和StorageDevice
class SmartDevice {
    // 添加 sync() 方法，输出 "设备[id]同步数据"
};

int main() {
    std::cout << "=== 创建智能设备 ===" << std::endl;
    SmartDevice sd;
    
    std::cout << "\\n=== 设置设备ID ===" << std::endl;
    sd.setId(1001);  // 应该无歧义
    
    std::cout << "\\n=== 调用方法 ===" << std::endl;
    sd.connect();  // 来自NetworkDevice
    sd.save();     // 来自StorageDevice
    sd.sync();     // 自己的方法
    
    std::cout << "\\n=== 验证单一Device子对象 ===" << std::endl;
    std::cout << "设备ID: " << sd.getId() << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 创建智能设备 ===
Device构造
NetworkDevice构造
StorageDevice构造
SmartDevice构造

=== 设置设备ID ===

=== 调用方法 ===
设备[1001]连接网络
设备[1001]保存数据
设备[1001]同步数据

=== 验证单一Device子对象 ===
设备ID: 1001`,
                solutionRegex: 'virtual public Device|virtual Device',
                hint: 'NetworkDevice和StorageDevice都需要使用virtual继承Device',
                xp: 220
            },
            references: [
                { title: '虚继承', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '多重继承与虚继承', book: 'Effective C++', chapter: '条款40' }
            ],
            assistantTips: [
                '菱形继承会导致基类子对象重复',
                '虚继承确保只有一个共享的基类子对象',
                'virtual关键字加在中间派生类上',
                '虚继承有轻微的性能开销'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '菱形继承会导致什么问题？', 
                    options: [
                        { text: '编译错误' }, 
                        { text: '基类子对象重复', correct: true }, 
                        { text: '无法实例化' }, 
                        { text: '链接错误' }
                    ], 
                    explanation: '菱形继承会导致基类子对象在最终派生类中存在多份副本。' 
                },
                { 
                    type: 'single', 
                    question: '虚继承的关键字是？', 
                    options: [
                        { text: 'virtual' }, 
                        { text: 'abstract' }, 
                        { text: 'override' }, 
                        { text: 'final' }
                    ], 
                    explanation: '使用virtual关键字声明虚继承。' 
                },
                { 
                    type: 'single', 
                    question: '虚继承的基类子对象有几份？', 
                    options: [
                        { text: '每条继承路径一份' }, 
                        { text: '只有一份', correct: true }, 
                        { text: '两份' }, 
                        { text: '取决于派生类数量' }
                    ], 
                    explanation: '虚继承确保只有一个共享的基类子对象。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个类应该使用虚继承？', 
                    options: [
                        { text: '单继承中的基类' }, 
                        { text: '菱形继承结构中的中间类', correct: true }, 
                        { text: '最终派生类' }, 
                        { text: '所有基类' }
                    ], 
                    explanation: '菱形继承结构中的中间派生类应该使用虚继承。' 
                },
                { 
                    type: 'single', 
                    question: '虚继承的缺点是？', 
                    options: [
                        { text: '无法解决菱形问题' }, 
                        { text: '有轻微性能开销', correct: true }, 
                        { text: '不支持多态' }, 
                        { text: '编译器不支持' }
                    ], 
                    explanation: '虚继承需要额外的指针和间接访问，有轻微性能开销。' 
                }
            ]
        },
        {
            id: '12.3',
            title: '构造函数中的虚基类初始化',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 构造函数中的虚基类初始化

### 虚基类的初始化规则

在虚继承中，虚基类的构造函数由**最远派生类**直接调用，而不是由直接派生类调用。

\`\`\`cpp
class Base {
public:
    Base(int x) { std::cout << "Base(" << x << ")" << std::endl; }
};

class Derived1 : virtual public Base {
public:
    Derived1() : Base(1) {  // 这个调用会被忽略！
        std::cout << "Derived1" << std::endl;
    }
};

class Derived2 : virtual public Base {
public:
    Derived2() : Base(2) {  // 这个调用会被忽略！
        std::cout << "Derived2" << std::endl;
    }
};

class Final : public Derived1, public Derived2 {
public:
    Final() : Base(100) {  // 这个调用生效！
        std::cout << "Final" << std::endl;
    }
};
\`\`\`

### 为什么由最远派生类初始化？

因为虚基类只有一份子对象，如果由中间类初始化：
1. 多个中间类可能提供不同的初始化值
2. 无法确定应该使用哪个初始化值
3. 可能导致不一致的状态

### 构造顺序

\`\`\`cpp
#include <iostream>

class A {
public:
    A() { std::cout << "A构造" << std::endl; }
};

class B : virtual public A {
public:
    B() { std::cout << "B构造" << std::endl; }
};

class C : virtual public A {
public:
    C() { std::cout << "C构造" << std::endl; }
};

class D : public B, public C {
public:
    D() { std::cout << "D构造" << std::endl; }
};

int main() {
    D d;
    // 输出顺序：
    // A构造（虚基类最先）
    // B构造
    // C构造
    // D构造
    return 0;
}
\`\`\`

### 构造顺序规则

1. **虚基类最先构造**：在任何非虚基类之前
2. **按继承声明顺序**：从左到右
3. **深度优先**：先构造基类，再构造派生类

\`\`\`cpp
class A { /* ... */ };
class B { /* ... */ };
class C : virtual public A { /* ... */ };
class D : public B, virtual public A { /* ... */ };

// D的构造顺序：
// 1. A（虚基类）
// 2. B（非虚基类）
// 3. D
\`\`\`

### 带参数的虚基类构造

\`\`\`cpp
class Animal {
protected:
    std::string name;
public:
    Animal(const std::string& n) : name(n) {
        std::cout << "Animal: " << name << std::endl;
    }
};

class Flying : virtual public Animal {
public:
    Flying() : Animal("") {  // 被忽略
        std::cout << "Flying" << std::endl;
    }
};

class Swimming : virtual public Animal {
public:
    Swimming() : Animal("") {  // 被忽略
        std::cout << "Swimming" << std::endl;
    }
};

class Duck : public Flying, public Swimming {
public:
    // 必须初始化虚基类
    Duck(const std::string& n) : Animal(n) {
        std::cout << "Duck: " << name << std::endl;
    }
};

int main() {
    Duck duck("唐老鸭");
    // 输出：
    // Animal: 唐老鸭
    // Flying
    // Swimming
    // Duck: 唐老鸭
    return 0;
}
\`\`\`

### 析构顺序

析构顺序与构造顺序相反：

\`\`\`cpp
// 构造顺序：A -> B -> C -> D
// 析构顺序：D -> C -> B -> A
\`\`\`

### 默认构造函数的情况

如果虚基类有默认构造函数，派生类可以不显式初始化：

\`\`\`cpp
class Base {
public:
    Base() { std::cout << "Base默认构造" << std::endl; }
    Base(int x) { std::cout << "Base(" << x << ")" << std::endl; }
};

class Derived1 : virtual public Base {
public:
    Derived1() { std::cout << "Derived1" << std::endl; }
};

class Derived2 : virtual public Base {
public:
    Derived2() { std::cout << "Derived2" << std::endl; }
};

class Final : public Derived1, public Derived2 {
public:
    // 如果不显式初始化Base，会调用Base()
    Final() { std::cout << "Final" << std::endl; }
};
\`\`\`

### 实际应用示例

\`\`\`cpp
#include <iostream>
#include <string>

class Person {
protected:
    std::string name;
    int age;
public:
    Person(const std::string& n, int a) 
        : name(n), age(a) {
        std::cout << "Person构造: " << name << std::endl;
    }
    
    void introduce() const {
        std::cout << "我是" << name << "，" << age << "岁" << std::endl;
    }
};

class Student : virtual public Person {
protected:
    std::string school;
public:
    Student(const std::string& n, int a, const std::string& s)
        : Person(n, a), school(s) {
        std::cout << "Student构造: " << school << std::endl;
    }
    
    void study() const {
        std::cout << name << "在" << school << "学习" << std::endl;
    }
};

class Employee : virtual public Person {
protected:
    std::string company;
public:
    Employee(const std::string& n, int a, const std::string& c)
        : Person(n, a), company(c) {
        std::cout << "Employee构造: " << company << std::endl;
    }
    
    void work() const {
        std::cout << name << "在" << company << "工作" << std::endl;
    }
};

class TeachingAssistant : public Student, public Employee {
public:
    // 必须初始化虚基类Person
    TeachingAssistant(const std::string& n, int a, 
                      const std::string& school, const std::string& company)
        : Person(n, a),      // 初始化虚基类
          Student(n, a, school),
          Employee(n, a, company) {
        std::cout << "TeachingAssistant构造" << std::endl;
    }
    
    void teach() const {
        std::cout << name << "既是学生也是员工" << std::endl;
    }
};

int main() {
    TeachingAssistant ta("张三", 25, "清华大学", "计算机系");
    
    std::cout << "\\n=== 调用方法 ===" << std::endl;
    ta.introduce();
    ta.study();
    ta.work();
    ta.teach();
    
    return 0;
}
\`\`\`

### 注意事项

1. **最远派生类负责初始化虚基类**
2. **中间类对虚基类的初始化会被忽略**
3. **如果虚基类没有默认构造函数，最远派生类必须显式初始化**
4. **构造顺序：虚基类 -> 非虚基类 -> 派生类**`,
            examples: [
                {
                    title: '虚基类构造顺序',
                    code: `#include <iostream>
#include <string>

class Base {
public:
    int value;
    
    Base(int v = 0) : value(v) {
        std::cout << "Base构造，value = " << value << std::endl;
    }
    
    ~Base() {
        std::cout << "Base析构" << std::endl;
    }
};

class Derived1 : virtual public Base {
public:
    Derived1() : Base(1) {
        std::cout << "Derived1构造（Base(1)被忽略）" << std::endl;
    }
    
    ~Derived1() {
        std::cout << "Derived1析构" << std::endl;
    }
};

class Derived2 : virtual public Base {
public:
    Derived2() : Base(2) {
        std::cout << "Derived2构造（Base(2)被忽略）" << std::endl;
    }
    
    ~Derived2() {
        std::cout << "Derived2析构" << std::endl;
    }
};

class Final : public Derived1, public Derived2 {
public:
    Final() : Base(100) {  // 这个调用生效
        std::cout << "Final构造" << std::endl;
    }
    
    ~Final() {
        std::cout << "Final析构" << std::endl;
    }
};

int main() {
    std::cout << "=== 构造顺序 ===" << std::endl;
    {
        Final f;
        std::cout << "\\nvalue = " << f.value << std::endl;
        std::cout << "\\n=== 析构顺序 ===" << std::endl;
    }
    
    return 0;
}`,
                    description: '展示虚基类的构造顺序和初始化规则。'
                },
                {
                    title: '带参数的虚基类初始化',
                    code: `#include <iostream>
#include <string>

class Component {
protected:
    std::string name;
    int id;
public:
    Component(const std::string& n, int i) : name(n), id(i) {
        std::cout << "Component构造: " << name << " (ID: " << id << ")" << std::endl;
    }
    
    void show() const {
        std::cout << "组件: " << name << ", ID: " << id << std::endl;
    }
};

class InputComponent : virtual public Component {
public:
    InputComponent() : Component("", 0) {  // 被忽略
        std::cout << "InputComponent构造" << std::endl;
    }
    
    void processInput() {
        std::cout << name << "处理输入" << std::endl;
    }
};

class OutputComponent : virtual public Component {
public:
    OutputComponent() : Component("", 0) {  // 被忽略
        std::cout << "OutputComponent构造" << std::endl;
    }
    
    void processOutput() {
        std::cout << name << "处理输出" << std::endl;
    }
};

class IOComponent : public InputComponent, public OutputComponent {
public:
    // 必须初始化虚基类Component
    IOComponent(const std::string& n, int i) 
        : Component(n, i) {
        std::cout << "IOComponent构造" << std::endl;
    }
    
    void process() {
        processInput();
        processOutput();
    }
};

int main() {
    std::cout << "=== 创建IOComponent ===" << std::endl;
    IOComponent io("数据处理器", 1001);
    
    std::cout << "\\n=== 组件信息 ===" << std::endl;
    io.show();
    
    std::cout << "\\n=== 处理数据 ===" << std::endl;
    io.process();
    
    return 0;
}`,
                    description: '展示最远派生类如何初始化带参数的虚基类。'
                }
            ],
            handsOn: {
                title: '实现虚基类初始化',
                description: '创建一个完整的虚继承层次结构，正确处理虚基类的初始化。',
                initialCode: `#include <iostream>
#include <string>

// 虚基类：资源
class Resource {
protected:
    std::string resourceName;
    int resourceId;
    
public:
    // TODO: 实现构造函数
    Resource(const std::string& name, int id) {
        // 初始化成员变量
        // 输出: "Resource构造: [name] (ID: [id])"
    }
    
    void showInfo() const {
        std::cout << "资源: " << resourceName 
                  << ", ID: " << resourceId << std::endl;
    }
};

// TODO: 实现Readable类，虚继承Resource
class Readable {
public:
    Readable() : Resource("", 0) {
        // 输出: "Readable构造"
    }
    
    void read() {
        std::cout << "读取资源: " << resourceName << std::endl;
    }
};

// TODO: 实现Writable类，虚继承Resource
class Writable {
public:
    Writable() : Resource("", 0) {
        // 输出: "Writable构造"
    }
    
    void write() {
        std::cout << "写入资源: " << resourceName << std::endl;
    }
};

// TODO: 实现File类，多重继承Readable和Writable
class File {
public:
    // 必须初始化虚基类Resource
    File(const std::string& name, int id) {
        // 初始化虚基类
        // 输出: "File构造"
    }
    
    void copy() {
        std::cout << "复制文件: " << resourceName << std::endl;
    }
};

int main() {
    std::cout << "=== 创建文件 ===" << std::endl;
    File file("document.txt", 2001);
    
    std::cout << "\\n=== 文件信息 ===" << std::endl;
    file.showInfo();
    
    std::cout << "\\n=== 文件操作 ===" << std::endl;
    file.read();
    file.write();
    file.copy();
    
    return 0;
}`,
                expectedOutput: `=== 创建文件 ===
Resource构造: document.txt (ID: 2001)
Readable构造
Writable构造
File构造

=== 文件信息 ===
资源: document.txt, ID: 2001

=== 文件操作 ===
读取资源: document.txt
写入资源: document.txt
复制文件: document.txt`,
                solutionRegex: 'Resource\\(name, id\\)|: Resource\\(',
                hint: 'File构造函数必须显式初始化Resource虚基类',
                xp: 200
            },
            references: [
                { title: '虚基类初始化', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '构造与析构顺序', book: 'Effective C++', chapter: '条款40' }
            ],
            assistantTips: [
                '虚基类由最远派生类初始化',
                '中间类对虚基类的初始化会被忽略',
                '构造顺序：虚基类优先',
                '如果虚基类没有默认构造函数，必须显式初始化'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '虚基类由谁初始化？', 
                    options: [
                        { text: '直接派生类' }, 
                        { text: '最远派生类', correct: true }, 
                        { text: '任意派生类' }, 
                        { text: '编译器自动' }
                    ], 
                    explanation: '虚基类由最远派生类直接初始化。' 
                },
                { 
                    type: 'single', 
                    question: '中间类对虚基类的构造调用会怎样？', 
                    options: [
                        { text: '正常执行' }, 
                        { text: '被忽略', correct: true }, 
                        { text: '编译错误' }, 
                        { text: '运行时错误' }
                    ], 
                    explanation: '中间类对虚基类的构造调用会被忽略，由最远派生类负责初始化。' 
                },
                { 
                    type: 'single', 
                    question: '构造顺序中，虚基类什么时候构造？', 
                    options: [
                        { text: '最后' }, 
                        { text: '最先', correct: true }, 
                        { text: '中间' }, 
                        { text: '随机' }
                    ], 
                    explanation: '虚基类在任何非虚基类之前构造。' 
                },
                { 
                    type: 'single', 
                    question: '如果虚基类没有默认构造函数，最远派生类必须？', 
                    options: [
                        { text: '提供默认构造函数' }, 
                        { text: '显式初始化虚基类', correct: true }, 
                        { text: '无法创建对象' }, 
                        { text: '使用其他构造函数' }
                    ], 
                    explanation: '如果虚基类没有默认构造函数，最远派生类必须显式调用虚基类的构造函数。' 
                },
                { 
                    type: 'single', 
                    question: '析构顺序与构造顺序的关系是？', 
                    options: [
                        { text: '相同' }, 
                        { text: '相反', correct: true }, 
                        { text: '无关' }, 
                        { text: '随机' }
                    ], 
                    explanation: '析构顺序与构造顺序完全相反。' 
                }
            ]
        },
        {
            id: '12.4',
            title: '多重继承下的类设计与讨论',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 430,
            concepts: `## 多重继承下的类设计与讨论

### 多重继承的设计原则

#### 1. 接口继承优先

多重继承最适合用于实现多个接口：

\`\`\`cpp
// 纯接口类
class ISerializable {
public:
    virtual std::string serialize() const = 0;
    virtual bool deserialize(const std::string&) = 0;
    virtual ~ISerializable() = default;
};

class IPrintable {
public:
    virtual void print() const = 0;
    virtual ~IPrintable() = default;
};

class IComparable {
public:
    virtual int compare(const IComparable&) const = 0;
    virtual ~IComparable() = default;
};

// 实现多个接口
class Document : public ISerializable, 
                 public IPrintable, 
                 public IComparable {
public:
    std::string serialize() const override { /* ... */ }
    bool deserialize(const std::string& s) override { /* ... */ }
    void print() const override { /* ... */ }
    int compare(const IComparable& other) const override { /* ... */ }
};
\`\`\`

#### 2. 避免实现继承的菱形结构

\`\`\`cpp
// 不推荐：实现继承的菱形结构
class Animal { /* 有数据成员 */ };
class Mammal : public Animal { /* ... */ };
class Bird : public Animal { /* ... */ };
class Platypus : public Mammal, public Bird { /* 问题！ */ };

// 推荐：使用接口和组合
class IAnimal { /* 纯虚接口 */ };
class IMammal : virtual public IAnimal { /* ... */ };
class IBird : virtual public IAnimal { /* ... */ };
class Platypus : public IMammal, public IBird { /* OK */ };
\`\`\`

#### 3. 使用组合替代多重实现继承

\`\`\`cpp
// 不推荐
class Worker : public Person, public Employee { /* ... */ };

// 推荐：使用组合
class Worker {
private:
    Person person;
    Employee employee;
public:
    // 委托方法
};
\`\`\`

### 多重继承的常见模式

#### 模式1：Mixin类

Mixin类提供可组合的功能片段：

\`\`\`cpp
// Mixin类：添加功能
template<typename Derived>
class Printable {
public:
    void print() const {
        static_cast<const Derived*>(this)->printImpl();
    }
};

template<typename Derived>
class Serializable {
public:
    std::string serialize() const {
        return static_cast<const Derived*>(this)->serializeImpl();
    }
};

class MyClass : public Printable<MyClass>, 
                public Serializable<MyClass> {
public:
    void printImpl() const { /* ... */ }
    std::string serializeImpl() const { /* ... */ }
};
\`\`\`

#### 模式2：接口组合

\`\`\`cpp
class IReader {
public:
    virtual int read(char* buffer, int size) = 0;
    virtual ~IReader() = default;
};

class IWriter {
public:
    virtual int write(const char* buffer, int size) = 0;
    virtual ~IWriter() = default;
};

class IClosable {
public:
    virtual void close() = 0;
    virtual ~IClosable() = default;
};

// 组合多个接口
class IStream : public IReader, public IWriter, public IClosable {
    // 继承所有纯虚函数
};
\`\`\`

#### 模式3：策略模式与多重继承

\`\`\`cpp
class SortingStrategy {
public:
    virtual void sort(int* data, int size) = 0;
    virtual ~SortingStrategy() = default;
};

class QuickSort : public SortingStrategy {
public:
    void sort(int* data, int size) override { /* 快速排序 */ }
};

class MergeSort : public SortingStrategy {
public:
    void sort(int* data, int size) override { /* 归并排序 */ }
};

class DataProcessor {
private:
    SortingStrategy* strategy;
public:
    void setStrategy(SortingStrategy* s) { strategy = s; }
    void process(int* data, int size) { strategy->sort(data, size); }
};
\`\`\`

### 多重继承的陷阱与解决方案

#### 陷阱1：基类指针转换

\`\`\`cpp
class Base1 { int a; };
class Base2 { int b; };
class Derived : public Base1, public Base2 { int c; };

Derived d;
Base1* p1 = &d;  // OK
Base2* p2 = &d;  // OK，但指针值会调整

// 错误的转换
Base2* p2_wrong = (Base2*)(void*)p1;  // 危险！

// 正确的转换
Derived* pd = dynamic_cast<Derived*>(p1);
Base2* p2_correct = dynamic_cast<Base2*>(p1);
\`\`\`

#### 陷阱2：虚函数覆盖

\`\`\`cpp
class Base1 {
public:
    virtual void foo() { std::cout << "Base1::foo" << std::endl; }
};

class Base2 {
public:
    virtual void foo() { std::cout << "Base2::foo" << std::endl; }
};

class Derived : public Base1, public Base2 {
public:
    // 同时覆盖两个foo
    void foo() override {
        std::cout << "Derived::foo" << std::endl;
    }
};
\`\`\`

#### 陷阱3：默认构造函数

\`\`\`cpp
class Base {
public:
    Base(int x) {}  // 没有默认构造函数
};

class Derived1 : virtual public Base {
public:
    Derived1() : Base(1) {}  // 被忽略
};

class Derived2 : virtual public Base {
public:
    Derived2() : Base(2) {}  // 被忽略
};

class Final : public Derived1, public Derived2 {
public:
    Final() : Base(100) {}  // 必须初始化Base
};
\`\`\`

### 最佳实践总结

1. **优先使用接口继承**：纯虚类作为接口
2. **避免菱形实现继承**：使用虚继承或组合
3. **明确继承意图**：public继承表示"is-a"关系
4. **使用override关键字**：确保正确覆盖虚函数
5. **谨慎使用类型转换**：优先使用dynamic_cast
6. **考虑使用组合**：组合比继承更灵活

### 多重继承的替代方案

\`\`\`cpp
// 方案1：组合
class Worker {
    Person person;
    Employee employee;
};

// 方案2：委托
class Worker : private Person, private Employee {
public:
    using Person::getName;
    using Employee::getSalary;
};

// 方案3：接口+实现
class IPerson { /* 接口 */ };
class IEmployee { /* 接口 */ };
class Worker : public IPerson, public IEmployee {
    PersonImpl personImpl;  // 组合实现
    EmployeeImpl employeeImpl;
};
\`\`\`

### 设计决策指南

| 场景 | 推荐方案 |
|------|----------|
| 需要多个接口 | 多重接口继承 |
| 共享基类状态 | 虚继承 |
| 复用实现代码 | 组合或私有继承 |
| 运行时多态 | 虚函数 + 接口 |
| 编译期多态 | CRTP / 模板 |

### CRTP模式

奇异递归模板模式（Curiously Recurring Template Pattern）：

\`\`\`cpp
template<typename Derived>
class Base {
public:
    void interface() {
        static_cast<Derived*>(this)->implementation();
    }
};

class Derived : public Base<Derived> {
public:
    void implementation() { /* ... */ }
};
\`\`\``,
            examples: [
                {
                    title: '接口式多重继承',
                    code: `#include <iostream>
#include <string>
#include <sstream>

// 接口1：可序列化
class ISerializable {
public:
    virtual std::string serialize() const = 0;
    virtual bool deserialize(const std::string& data) = 0;
    virtual ~ISerializable() = default;
};

// 接口2：可打印
class IPrintable {
public:
    virtual void print() const = 0;
    virtual ~IPrintable() = default;
};

// 接口3：可克隆
class ICloneable {
public:
    virtual ICloneable* clone() const = 0;
    virtual ~ICloneable() = default;
};

// 实现所有接口
class Product : public ISerializable, public IPrintable, public ICloneable {
private:
    std::string name;
    double price;
    
public:
    Product(const std::string& n = "", double p = 0.0) 
        : name(n), price(p) {}
    
    // ISerializable
    std::string serialize() const override {
        std::ostringstream oss;
        oss << name << "," << price;
        return oss.str();
    }
    
    bool deserialize(const std::string& data) override {
        size_t pos = data.find(',');
        if (pos == std::string::npos) return false;
        name = data.substr(0, pos);
        price = std::stod(data.substr(pos + 1));
        return true;
    }
    
    // IPrintable
    void print() const override {
        std::cout << "商品: " << name << ", 价格: " << price << std::endl;
    }
    
    // ICloneable
    ICloneable* clone() const override {
        return new Product(*this);
    }
    
    const std::string& getName() const { return name; }
    double getPrice() const { return price; }
};

int main() {
    Product p1("笔记本电脑", 5999.0);
    
    std::cout << "=== IPrintable接口 ===" << std::endl;
    p1.print();
    
    std::cout << "\\n=== ISerializable接口 ===" << std::endl;
    std::string data = p1.serialize();
    std::cout << "序列化数据: " << data << std::endl;
    
    Product p2;
    p2.deserialize(data);
    std::cout << "反序列化后: ";
    p2.print();
    
    std::cout << "\\n=== ICloneable接口 ===" << std::endl;
    Product* p3 = static_cast<Product*>(p1.clone());
    std::cout << "克隆对象: ";
    p3->print();
    
    delete p3;
    return 0;
}`,
                    description: '展示接口式多重继承的最佳实践。'
                },
                {
                    title: 'Mixin模式实现',
                    code: `#include <iostream>
#include <string>

// Mixin类：添加计数功能
template<typename Derived>
class Counter {
protected:
    static int count;
    
    Counter() { ++count; }
    Counter(const Counter&) { ++count; }
    ~Counter() { --count; }
    
public:
    static int getCount() { return count; }
};

template<typename Derived>
int Counter<Derived>::count = 0;

// Mixin类：添加ID功能
template<typename Derived>
class Identified {
protected:
    int id;
    static int nextId;
    
    Identified() : id(nextId++) {}
    
public:
    int getId() const { return id; }
};

template<typename Derived>
int Identified<Derived>::nextId = 1;

// Mixin类：添加名称功能
template<typename Derived>
class Named {
protected:
    std::string name;
    
    Named(const std::string& n = "") : name(n) {}
    
public:
    const std::string& getName() const { return name; }
    void setName(const std::string& n) { name = n; }
};

// 组合多个Mixin
class Entity : public Counter<Entity>, 
               public Identified<Entity>, 
               public Named<Entity> {
public:
    Entity(const std::string& n = "") : Named<Entity>(n) {
        std::cout << "创建实体: " << name << " (ID: " << id << ")" << std::endl;
    }
    
    ~Entity() {
        std::cout << "销毁实体: " << name << std::endl;
    }
    
    void show() const {
        std::cout << "实体[" << id << "]: " << name << std::endl;
    }
};

int main() {
    std::cout << "=== 创建实体 ===" << std::endl;
    Entity e1("玩家");
    Entity e2("敌人");
    Entity e3("NPC");
    
    std::cout << "\\n=== 实体信息 ===" << std::endl;
    e1.show();
    e2.show();
    e3.show();
    
    std::cout << "\\n=== 实体数量 ===" << std::endl;
    std::cout << "当前实体数: " << Entity::getCount() << std::endl;
    
    {
        Entity e4("临时实体");
        std::cout << "临时作用域内实体数: " << Entity::getCount() << std::endl;
    }
    
    std::cout << "临时作用域外实体数: " << Entity::getCount() << std::endl;
    
    return 0;
}`,
                    description: '展示使用Mixin模式组合多个功能。'
                }
            ],
            handsOn: {
                title: '设计多接口类',
                description: '设计一个实现多个接口的类，展示良好的多重继承设计。',
                initialCode: `#include <iostream>
#include <string>
#include <sstream>

// 接口：可比较
class IComparable {
public:
    virtual int compareTo(const IComparable& other) const = 0;
    virtual ~IComparable() = default;
};

// 接口：可排序
class ISortable {
public:
    virtual void sort() = 0;
    virtual ~ISortable() = default;
};

// 接口：可迭代
class IIterable {
public:
    virtual void reset() = 0;
    virtual bool hasNext() const = 0;
    virtual int next() = 0;
    virtual ~IIterable() = default;
};

// TODO: 实现NumberList类，继承所有三个接口
class NumberList {
private:
    int* data;
    int size;
    int capacity;
    int current;  // 用于迭代
    
public:
    // TODO: 实现构造函数
    NumberList(int cap = 10) {
        // 分配内存，初始化成员
    }
    
    // TODO: 实现析构函数
    ~NumberList() {
        // 释放内存
    }
    
    // TODO: 实现添加元素方法
    void add(int value) {
        // 添加元素到列表
    }
    
    // TODO: 实现IComparable接口
    int compareTo(const IComparable& other) const override {
        // 比较两个列表的元素和
        // 返回 -1, 0, 1
        return 0;
    }
    
    // TODO: 实现ISortable接口
    void sort() override {
        // 对列表进行排序（冒泡排序即可）
    }
    
    // TODO: 实现IIterable接口
    void reset() override {
        // 重置迭代器
    }
    
    bool hasNext() const override {
        // 是否有下一个元素
        return false;
    }
    
    int next() override {
        // 返回下一个元素
        return 0;
    }
    
    // 辅助方法
    int getSum() const {
        int sum = 0;
        for (int i = 0; i < size; ++i) sum += data[i];
        return sum;
    }
    
    void print() const {
        std::cout << "[";
        for (int i = 0; i < size; ++i) {
            std::cout << data[i];
            if (i < size - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
};

int main() {
    NumberList list1;
    list1.add(3);
    list1.add(1);
    list1.add(4);
    list1.add(1);
    list1.add(5);
    
    NumberList list2;
    list2.add(2);
    list2.add(7);
    list2.add(1);
    list2.add(8);
    
    std::cout << "=== 初始列表 ===" << std::endl;
    std::cout << "list1: "; list1.print();
    std::cout << "list2: "; list2.print();
    
    std::cout << "\\n=== IComparable接口 ===" << std::endl;
    int cmp = list1.compareTo(list2);
    std::cout << "比较结果: " << cmp << std::endl;
    
    std::cout << "\\n=== ISortable接口 ===" << std::endl;
    list1.sort();
    std::cout << "排序后list1: "; list1.print();
    
    std::cout << "\\n=== IIterable接口 ===" << std::endl;
    std::cout << "遍历list1: ";
    list1.reset();
    while (list1.hasNext()) {
        std::cout << list1.next() << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 初始列表 ===
list1: [3, 1, 4, 1, 5]
list2: [2, 7, 1, 8]

=== IComparable接口 ===
比较结果: -1

=== ISortable接口 ===
排序后list1: [1, 1, 3, 4, 5]

=== IIterable接口 ===
遍历list1: 1 1 3 4 5`,
                solutionRegex: 'class NumberList.*IComparable.*ISortable.*IIterable|compareTo|sort\\(\\)|hasNext|next\\(\\)',
                hint: 'NumberList需要继承三个接口并实现所有纯虚函数',
                xp: 250
            },
            references: [
                { title: '多重继承设计', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '多重继承', book: 'Effective C++', chapter: '条款40' },
                { title: '接口设计', book: 'Effective C++', chapter: '条款32-39' }
            ],
            assistantTips: [
                '优先使用接口式多重继承',
                '避免实现继承的菱形结构',
                '使用组合替代多重实现继承',
                'Mixin模式可以灵活组合功能',
                '明确每个继承关系的意图'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '多重继承最适合用于？', 
                    options: [
                        { text: '复用多个实现类' }, 
                        { text: '实现多个接口', correct: true }, 
                        { text: '创建菱形继承' }, 
                        { text: '替代组合' }
                    ], 
                    explanation: '多重继承最适合用于实现多个接口（纯虚类）。' 
                },
                { 
                    type: 'single', 
                    question: 'Mixin模式的作用是？', 
                    options: [
                        { text: '创建接口' }, 
                        { text: '组合功能片段', correct: true }, 
                        { text: '解决菱形问题' }, 
                        { text: '优化性能' }
                    ], 
                    explanation: 'Mixin模式允许灵活组合多个功能片段。' 
                },
                { 
                    type: 'single', 
                    question: '避免菱形继承问题的方法是？', 
                    options: [
                        { text: '不使用继承' }, 
                        { text: '使用虚继承或组合', correct: true }, 
                        { text: '使用私有继承' }, 
                        { text: '增加基类数量' }
                    ], 
                    explanation: '可以使用虚继承解决菱形问题，或使用组合替代继承。' 
                },
                { 
                    type: 'single', 
                    question: '接口类通常有什么特点？', 
                    options: [
                        { text: '有数据成员' }, 
                        { text: '只有纯虚函数', correct: true }, 
                        { text: '有实现代码' }, 
                        { text: '不能被继承' }
                    ], 
                    explanation: '接口类通常只包含纯虚函数，没有数据成员。' 
                },
                { 
                    type: 'single', 
                    question: '组合相比继承的优点是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '更灵活，降低耦合', correct: true }, 
                        { text: '代码更少' }, 
                        { text: '支持多态' }
                    ], 
                    explanation: '组合比继承更灵活，降低了类之间的耦合度。' 
                }
            ]
        }
    ]
};

window.Unit12Data = Unit12Data;
