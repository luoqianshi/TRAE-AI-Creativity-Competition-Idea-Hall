/**
 * 单元11：继承与多态
 */
const Unit11Data = {
    id: 11,
    title: '继承与多态',
    description: '深入理解C++的继承机制，掌握多态的实现原理和最佳实践',
    lessons: [
        {
            id: '11.1',
            title: '基类与派生类定义',
            duration: '35分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 基类与派生类定义

### 什么是继承？

继承（Inheritance）是面向对象编程的核心特性之一，允许我们基于已有的类创建新类。

\`\`\`cpp
// 基类（父类）
class Animal {
public:
    std::string name;
    int age;
    
    void eat() {
        std::cout << name << "正在吃东西" << std::endl;
    }
};

// 派生类（子类）
class Dog : public Animal {
public:
    void bark() {
        std::cout << name << "汪汪叫！" << std::endl;
    }
};
\`\`\`

### 继承的语法

\`\`\`cpp
class 派生类名 : 继承方式 基类名 {
    // 派生类成员
};
\`\`\`

### 三种继承方式

| 继承方式 | 基类public成员 | 基类protected成员 | 基类private成员 |
|---------|---------------|------------------|----------------|
| public继承 | public | protected | 不可访问 |
| protected继承 | protected | protected | 不可访问 |
| private继承 | private | private | 不可访问 |

\`\`\`cpp
class Base {
public:
    int public_member;
protected:
    int protected_member;
private:
    int private_member;
};

// public继承
class DerivedPublic : public Base {
    void foo() {
        public_member = 1;      // OK: public
        protected_member = 2;   // OK: protected
        // private_member = 3;  // 错误：不可访问
    }
};

// private继承
class DerivedPrivate : private Base {
    void foo() {
        public_member = 1;      // OK: private
        protected_member = 2;   // OK: private
    }
};
\`\`\`

### 派生类的构成

派生类包含：
1. 基类的所有成员（除了构造函数和析构函数）
2. 派生类新增的成员

\`\`\`cpp
class Person {
protected:
    std::string name;
    int age;
public:
    Person(const std::string& n, int a) : name(n), age(a) {}
    void introduce() {
        std::cout << "我是" << name << "，今年" << age << "岁" << std::endl;
    }
};

class Student : public Person {
private:
    std::string school;
public:
    Student(const std::string& n, int a, const std::string& s)
        : Person(n, a), school(s) {}
    
    void study() {
        std::cout << name << "在" << school << "学习" << std::endl;
    }
};
\`\`\`

### 继承关系的判断

使用"is-a"关系判断是否应该使用继承：
- Dog **is a** Animal ✓
- Car **is a** Vehicle ✓
- Student **is a** Person ✓

\`\`\`cpp
// 正确的继承关系
class Vehicle { /* ... */ };
class Car : public Vehicle { /* ... */ };  // Car是Vehicle

// 错误的继承关系
class Engine { /* ... */ };
class Car : public Engine { /* ... */ };   // 错误！Car有Engine，不是is-a
// 应该使用组合
class Car {
    Engine engine;  // Car有Engine（has-a关系）
};
\`\`\`

### 成员访问

派生类可以访问基类的public和protected成员：

\`\`\`cpp
class Shape {
protected:
    double width;
    double height;
public:
    Shape(double w, double h) : width(w), height(h) {}
};

class Rectangle : public Shape {
public:
    Rectangle(double w, double h) : Shape(w, h) {}
    
    double area() {
        return width * height;  // 访问protected成员
    }
};
\`\`\`

### 最佳实践

#### 1. 遵循"is-a"关系原则

继承应该表示真正的"is-a"关系，而不是"has-a"关系：

\`\`\`cpp
// 正确：狗是动物
class Dog : public Animal { /* ... */ };

// 错误：汽车有引擎，不是汽车是引擎
class Car : public Engine { /* ... */ };  // 不推荐

// 正确：汽车有引擎（组合关系）
class Car {
private:
    Engine engine;  // 使用组合
};
\`\`\`

#### 2. 优先使用组合而非继承

当关系不确定时，优先考虑组合：

\`\`\`cpp
// 组合更灵活
class Student {
private:
    Person person;  // 学生有人的属性
    std::string studentId;
    // 更容易修改，不会破坏封装
};

// 继承耦合度更高
class Student : public Person {
    // 如果Person的实现改变，可能影响Student
};
\`\`\`

#### 3. 合理使用访问控制

\`\`\`cpp
class GoodDesign {
public:
    // 公共接口
    void performAction() {
        validateInput();  // 调用私有辅助函数
        doWork();
        cleanup();
    }

protected:
    // 供派生类重写
    virtual void doWork() = 0;

private:
    // 实现细节
    void validateInput() { /* ... */ }
    void cleanup() { /* ... */ }
    int internalState;
};
\`\`\`

#### 4. 构造函数初始化基类部分

\`\`\`cpp
class Derived : public Base {
public:
    // 正确：在初始化列表中调用基类构造函数
    Derived(int baseValue, int derivedValue)
        : Base(baseValue), derivedData(derivedValue) {
    }

    // 错误：忘记初始化基类部分
    // Derived(int derivedValue) : derivedData(derivedValue) {
    //     // Base部分会被默认构造，可能导致问题
    // }

private:
    int derivedData;
};
\`\`\`

### 常见错误

#### 1. 滥用继承

\`\`\`cpp
// 错误：鸟会飞，企鹅是鸟，但企鹅不会飞
class Bird {
public:
    virtual void fly() { /* 飞行 */ }
};

class Penguin : public Bird {
public:
    void fly() override {
        // 企鹅不会飞！设计有问题
        throw std::runtime_error("企鹅不会飞");
    }
};

// 正确：重新设计继承层次
class Bird { /* 鸟的基本属性 */ };
class FlyingBird : public Bird {
public:
    virtual void fly() = 0;
};
class Penguin : public Bird { /* 企鹅不会飞 */ };
\`\`\`

#### 2. 循环依赖

\`\`\`cpp
// 错误：循环继承（编译错误）
class A : public B { /* ... */ };
class B : public A { /* ... */ };  // 错误！

// 正确：使用前向声明和组合
class B;  // 前向声明

class A {
    B* b;  // 使用指针
};

class B {
    A* a;
};
\`\`\`

#### 3. 忽略基类的访问限制

\`\`\`cpp
class Base {
private:
    int privateData;
};

class Derived : public Base {
public:
    void accessPrivate() {
        // int x = privateData;  // 错误！不能访问基类的private成员
        // 应该通过基类提供的public/protected接口访问
    }
};
\`\`\`

#### 4. 继承层次过深

\`\`\`cpp
// 错误：继承层次太深，难以维护
class A { /* ... */ };
class B : public A { /* ... */ };
class C : public B { /* ... */ };
class D : public C { /* ... */ };
class E : public D { /* ... */ };  // 太复杂！

// 推荐：保持继承层次浅而宽
class Animal { /* ... */ };
class Mammal : public Animal { /* ... */ };
class Dog : public Mammal { /* ... */ };  // 3层足够
\`\`\`

### 深入理解

#### 1. 继承与内存布局

派生类对象在内存中的布局：

\`\`\`cpp
class Base {
public:
    int baseData;
};

class Derived : public Base {
public:
    int derivedData;
};

// 内存布局（简化）：
// [Base部分: baseData][Derived部分: derivedData]
// 派生类对象包含基类子对象
\`\`\`

#### 2. 继承与对象构造/析构顺序

\`\`\`cpp
class Base {
public:
    Base() { std::cout << "Base构造" << std::endl; }
    ~Base() { std::cout << "Base析构" << std::endl; }
};

class Derived : public Base {
public:
    Derived() { std::cout << "Derived构造" << std::endl; }
    ~Derived() { std::cout << "Derived析构" << std::endl; }
};

Derived d;
// 输出顺序：
// Base构造 -> Derived构造
// Derived析构 -> Base析构
\`\`\`

#### 3. 继承与类型转换

\`\`\`cpp
Derived derivedObj;
Base* basePtr = &derivedObj;  // 向上转型（隐式，安全）
Base& baseRef = derivedObj;   // 向上转型（隐式，安全）

// 向下转型需要显式转换
Derived* derivedPtr = static_cast<Derived*>(basePtr);  // 需要确保安全
\`\`\`

#### 4. 继承与友元

友元关系不能继承：

\`\`\`cpp
class Base {
    friend class FriendClass;
private:
    int privateData;
};

class Derived : public Base {
    // FriendClass不能访问Derived的私有成员
    // 友元关系不会被继承
};
\`\`\`

#### 5. 继承与静态成员

静态成员在继承层次中只有一份：

\`\`\`cpp
class Base {
public:
    static int count;
};
int Base::count = 0;

class Derived : public Base {
};

Base::count = 10;
std::cout << Derived::count;  // 输出10，共享同一个静态成员
\`\`\``,
            examples: [
                {
                    title: '基本继承示例',
                    code: `#include <iostream>
#include <string>

// 基类
class Animal {
protected:
    std::string name;
    int age;
    
public:
    Animal(const std::string& n, int a) : name(n), age(a) {}
    
    void eat() {
        std::cout << name << "正在吃东西" << std::endl;
    }
    
    void sleep() {
        std::cout << name << "正在睡觉" << std::endl;
    }
    
    void introduce() {
        std::cout << "我是" << name << "，今年" << age << "岁" << std::endl;
    }
};

// 派生类
class Dog : public Animal {
private:
    std::string breed;
    
public:
    Dog(const std::string& n, int a, const std::string& b) 
        : Animal(n, a), breed(b) {}
    
    void bark() {
        std::cout << name << "汪汪叫！" << std::endl;
    }
    
    void showBreed() {
        std::cout << name << "是" << breed << "品种" << std::endl;
    }
};

// 另一个派生类
class Cat : public Animal {
public:
    Cat(const std::string& n, int a) : Animal(n, a) {}
    
    void meow() {
        std::cout << name << "喵喵叫~" << std::endl;
    }
};

int main() {
    Dog dog("旺财", 3, "金毛");
    dog.introduce();   // 继承自Animal
    dog.eat();         // 继承自Animal
    dog.bark();        // Dog特有
    dog.showBreed();   // Dog特有
    
    std::cout << std::endl;
    
    Cat cat("咪咪", 2);
    cat.introduce();
    cat.sleep();
    cat.meow();
    
    return 0;
}`,
                    description: '展示基本的继承关系，派生类继承基类的成员。'
                },
                {
                    title: '继承方式对比',
                    code: `#include <iostream>
#include <string>

class Base {
public:
    int public_data = 1;
protected:
    int protected_data = 2;
private:
    int private_data = 3;
};

// public继承
class PublicDerived : public Base {
public:
    void show() {
        std::cout << "public_data: " << public_data << std::endl;       // OK
        std::cout << "protected_data: " << protected_data << std::endl; // OK
        // std::cout << private_data << std::endl;  // 错误！
    }
    
    int getPublic() { return public_data; }      // 外部可访问
    int getProtected() { return protected_data; } // 外部不可访问
};

// protected继承
class ProtectedDerived : protected Base {
public:
    void show() {
        std::cout << "public_data: " << public_data << std::endl;       // OK
        std::cout << "protected_data: " << protected_data << std::endl; // OK
    }
};

// private继承
class PrivateDerived : private Base {
public:
    void show() {
        std::cout << "public_data: " << public_data << std::endl;       // OK
        std::cout << "protected_data: " << protected_data << std::endl; // OK
    }
};

int main() {
    PublicDerived pub;
    pub.show();
    std::cout << "外部访问public_data: " << pub.getPublic() << std::endl;
    // pub.getProtected();  // 错误！protected成员外部不可访问
    
    std::cout << std::endl;
    
    ProtectedDerived prot;
    prot.show();
    // prot.public_data;  // 错误！protected继承使public成员变为protected
    
    std::cout << std::endl;
    
    PrivateDerived priv;
    priv.show();
    // priv.public_data;  // 错误！private继承使所有成员变为private
    
    return 0;
}`,
                    description: '展示三种继承方式对成员访问权限的影响。'
                }
            ],
            handsOn: {
                title: '实现派生类',
                description: '基于Employee基类，创建Manager和Engineer派生类。',
                initialCode: `#include <iostream>
#include <string>

// 员工基类
class Employee {
protected:
    std::string name;
    double salary;
    int id;
    
public:
    Employee(const std::string& n, double s, int i) 
        : name(n), salary(s), id(i) {}
    
    void display() {
        std::cout << "ID: " << id 
                  << ", 姓名: " << name 
                  << ", 薪资: " << salary << std::endl;
    }
    
    double getSalary() const { return salary; }
    std::string getName() const { return name; }
};

// TODO: 创建Manager类，继承Employee
// 添加私有成员: teamSize (团队人数)
// 添加公有方法: manage() 输出管理信息
class Manager {
    // 实现派生类
};

// TODO: 创建Engineer类，继承Employee
// 添加私有成员: specialty (专业领域)
// 添加公有方法: code() 输出编码信息
class Engineer {
    // 实现派生类
};

int main() {
    Manager mgr("张三", 15000, 1001, 5);
    std::cout << "=== 经理信息 ===" << std::endl;
    mgr.display();
    mgr.manage();
    
    std::cout << std::endl;
    
    Engineer eng("李四", 12000, 2001, "后端开发");
    std::cout << "=== 工程师信息 ===" << std::endl;
    eng.display();
    eng.code();
    
    return 0;
}`,
                expectedOutput: `=== 经理信息 ===
ID: 1001, 姓名: 张三, 薪资: 15000
张三管理着5人的团队

=== 工程师信息 ===
ID: 2001, 姓名: 李四, 薪资: 12000
李四正在后端开发领域编码`,
                solutionRegex: 'class Manager.*: public Employee|class Engineer.*: public Employee|teamSize|specialty',
                hint: '使用public继承，在派生类构造函数中调用基类构造函数',
                xp: 150
            },
            references: [
                { title: '继承', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '面向对象设计', book: 'Effective C++', chapter: '条款32-39' }
            ],
            assistantTips: [
                'public继承表示"is-a"关系',
                '派生类包含基类的所有成员',
                '派生类不能直接访问基类的private成员',
                '构造函数和析构函数不会被继承'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'public继承后，基类的protected成员在派生类中是？', 
                    options: [
                        { text: 'public' }, 
                        { text: 'protected', correct: true }, 
                        { text: 'private' }, 
                        { text: '不可访问' }
                    ], 
                    explanation: 'public继承保持基类成员的访问级别不变。' 
                },
                { 
                    type: 'single', 
                    question: '派生类可以访问基类的哪些成员？', 
                    options: [
                        { text: '所有成员' }, 
                        { text: 'public和protected成员', correct: true }, 
                        { text: '只有public成员' }, 
                        { text: '只有private成员' }
                    ], 
                    explanation: '派生类可以访问基类的public和protected成员，不能访问private成员。' 
                },
                { 
                    type: 'single', 
                    question: 'private继承后，基类的public成员在派生类中是？', 
                    options: [
                        { text: 'public' }, 
                        { text: 'protected' }, 
                        { text: 'private', correct: true }, 
                        { text: '不可访问' }
                    ], 
                    explanation: 'private继承使基类的所有可访问成员变为private。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个关系适合使用继承？', 
                    options: [
                        { text: '汽车和引擎' }, 
                        { text: '狗和动物', correct: true }, 
                        { text: '房间和家具' }, 
                        { text: '电脑和CPU' }
                    ], 
                    explanation: '狗是动物（is-a关系），适合继承。其他是has-a关系，应该用组合。' 
                },
                { 
                    type: 'single', 
                    question: '派生类构造函数应该做什么？', 
                    options: [
                        { text: '什么都不做' }, 
                        { text: '调用基类构造函数初始化基类部分', correct: true }, 
                        { text: '重新初始化所有成员' }, 
                        { text: '只初始化新增成员' }
                    ], 
                    explanation: '派生类构造函数需要调用基类构造函数来初始化继承的成员。' 
                }
            ]
        },
        {
            id: '11.2',
            title: '继承中的访问控制与作用域',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 继承中的访问控制与作用域

### 访问控制回顾

C++有三种访问级别：
- **public**：任何代码都可以访问
- **protected**：类本身和派生类可以访问
- **private**：只有类本身可以访问

\`\`\`cpp
class Base {
public:
    int public_member;
protected:
    int protected_member;
private:
    int private_member;
};
\`\`\`

### protected成员的特点

protected成员对外不可访问，但对派生类可见：

\`\`\`cpp
class Base {
protected:
    int value;
};

class Derived : public Base {
public:
    void setValue(int v) {
        value = v;  // OK：派生类可以访问protected成员
    }
};

int main() {
    Derived d;
    // d.value = 10;  // 错误！外部不能访问protected成员
    d.setValue(10);   // OK：通过public接口访问
}
\`\`\`

### 名字查找与作用域

派生类的作用域嵌套在基类作用域内：

\`\`\`cpp
class Base {
public:
    int value = 10;
    void func() { std::cout << "Base::func" << std::endl; }
};

class Derived : public Base {
public:
    int value = 20;  // 隐藏基类的value
    void func() {    // 隐藏基类的func
        std::cout << "Derived::func" << std::endl;
    }
    
    void show() {
        std::cout << value << std::endl;      // 20：派生类的value
        std::cout << Base::value << std::endl; // 10：基类的value
    }
};

int main() {
    Derived d;
    d.func();        // Derived::func
    d.Base::func();  // Base::func
}
\`\`\`

### 成员隐藏

派生类的同名成员会隐藏基类成员：

\`\`\`cpp
class Base {
public:
    void func(int x) {
        std::cout << "Base::func(int)" << std::endl;
    }
};

class Derived : public Base {
public:
    void func(double x) {  // 隐藏基类的所有func重载
        std::cout << "Derived::func(double)" << std::endl;
    }
};

int main() {
    Derived d;
    d.func(3.14);    // Derived::func(double)
    // d.func(10);   // 错误！基类的func被隐藏
    d.Base::func(10); // OK：显式调用基类版本
}
\`\`\`

### using声明

使用using声明可以恢复被隐藏的基类成员：

\`\`\`cpp
class Derived : public Base {
public:
    using Base::func;  // 引入基类的所有func重载
    
    void func(double x) {
        std::cout << "Derived::func(double)" << std::endl;
    }
};

int main() {
    Derived d;
    d.func(10);     // Base::func(int)
    d.func(3.14);   // Derived::func(double)
}
\`\`\`

### 访问控制与继承

派生类可以改变继承成员的访问级别（只能变得更严格）：

\`\`\`cpp
class Base {
public:
    int public_value;
protected:
    int protected_value;
};

class Derived : public Base {
public:
    // using声明改变访问级别
    using Base::protected_value;  // 提升为public（不推荐）
    
    // 不能降低访问级别
    // using Base::public_value;  // 错误！不能降低
};

// 使用private继承后提升访问级别
class AnotherDerived : private Base {
public:
    using Base::public_value;    // 提升为public
    using Base::protected_value; // 提升为public
};
\`\`\`

### 友元与继承

友元关系不能继承：

\`\`\`cpp
class Base {
    friend class Friend;
private:
    int secret;
};

class Derived : public Base {
    // Friend不是Derived的友元
};

class Friend {
public:
    void access(Base& b) {
        b.secret = 10;  // OK：Friend是Base的友元
    }
    
    void access(Derived& d) {
        // d.secret = 10;  // 错误！Friend不是Derived的友元
    }
};
\`\`\`

### 最佳实践

#### 1. 数据成员设为private

\`\`\`cpp
class GoodBase {
private:
    int data;  // 私有数据，封装性好

protected:
    int getData() const { return data; }  // protected访问接口
    void setData(int v) { data = v; }

public:
    int publicMethod() { return data; }  // public接口
};

// 不推荐：直接暴露protected数据成员
class BadBase {
protected:
    int data;  // 破坏封装，派生类可以直接修改
};
\`\`\`

#### 2. 使用protected提供派生类访问

\`\`\`cpp
class Widget {
private:
    std::string name;
    int value;

protected:
    // 提供protected访问函数，而不是直接暴露数据
    const std::string& getName() const { return name; }
    void setName(const std::string& n) { name = n; }

    int getValue() const { return value; }
    void setValue(int v) {
        if (v >= 0) value = v;  // 可以添加验证逻辑
    }
};
\`\`\`

#### 3. 避免成员名字隐藏

\`\`\`cpp
// 不推荐：隐藏基类成员
class BadDerived : public Base {
public:
    int value;  // 隐藏了Base::value，容易混淆
    void func() { /* 隐藏了Base::func */ }
};

// 推荐：使用不同的名字或using声明
class GoodDerived : public Base {
public:
    using Base::func;  // 引入基类成员

    void func(int x) { /* 新的重载 */ }
    void specificFunc() { /* 使用不同的名字 */ }
};
\`\`\`

#### 4. public继承表示is-a关系

\`\`\`cpp
// 正确：public继承保持语义一致性
class Dog : public Animal { /* ... */ };
// Dog确实是Animal，可以替代Animal使用

// 错误：private继承破坏is-a关系
class Dog : private Animal { /* ... */ };
// Dog不再是Animal，不能多态使用
\`\`\`

#### 5. 合理使用using声明

\`\`\`cpp
class Base {
public:
    void func(int x);
    void func(double x);
};

class Derived : public Base {
public:
    using Base::func;  // 引入所有基类重载

    void func(const std::string& s) { /* 新增重载 */ }
};

// 现在Derived有所有版本的func
\`\`\`

### 常见错误

#### 1. 误用protected成员

\`\`\`cpp
class Base {
protected:
    int value;  // 直接暴露数据成员
};

class Derived : public Base {
public:
    void modifyValue(int v) {
        value = v;  // 可以修改，但没有验证
    }
};

// 问题：任何派生类都可以随意修改，破坏封装
\`\`\`

#### 2. 忘记使用using声明

\`\`\`cpp
class Base {
public:
    void process(int x);
    void process(double x);
};

class Derived : public Base {
public:
    void process(const std::string& s) {
        // 只能访问这个版本
    }

    void test() {
        process(10);    // 错误！Base版本被隐藏
        process(3.14);  // 错误！Base版本被隐藏
    }
};

// 正确：使用using声明
class FixedDerived : public Base {
public:
    using Base::process;  // 引入基类版本

    void process(const std::string& s) { /* ... */ }
};
\`\`\`

#### 3. 混淆隐藏和覆盖

\`\`\`cpp
class Base {
public:
    void func() { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    void func() { std::cout << "Derived" << std::endl; }  // 隐藏，不是覆盖！
};

Base* ptr = new Derived();
ptr->func();  // 输出"Base"，不是"Derived"

// 如果需要多态，应该使用virtual
class CorrectBase {
public:
    virtual void func() { std::cout << "Base" << std::endl; }
};

class CorrectDerived : public CorrectBase {
public:
    void func() override { std::cout << "Derived" << std::endl; }  // 覆盖
};
\`\`\`

#### 4. 访问级别设置不当

\`\`\`cpp
class Bad {
public:
    int id;          // 公开数据，容易被误修改
    std::string name;  // 公开数据

protected:
    void validate() { /* ... */ }  // protected方法，但外部无法调用
};

class Good {
private:
    int id;          // 私有数据
    std::string name;

public:
    int getId() const { return id; }  // 公开访问接口
    void setId(int i) {
        if (i > 0) id = i;  // 可以验证
    }
};
\`\`\`

#### 5. 滥用友元

\`\`\`cpp
class Base {
    friend void externalFunction(Base& b);
private:
    int secret;
};

// 问题：友元关系不能继承，Derived的secret无法被externalFunction访问
class Derived : public Base {
private:
    int moreSecret;
};

void externalFunction(Base& b) {
    b.secret = 10;  // OK
}

void externalFunction(Derived& d) {
    // d.secret = 10;  // 错误！友元关系不继承
}
\`\`\`

### 深入理解

#### 1. 访问控制与编译器

\`\`\`cpp
class Base {
private:
    int privateData;

protected:
    int protectedData;

public:
    int publicData;
};

// 编译器在编译时检查访问权限
class Derived : public Base {
public:
    void accessMembers() {
        // int x = privateData;    // 编译错误
        int y = protectedData;     // OK
        int z = publicData;        // OK
    }
};

int main() {
    Base b;
    // b.privateData;    // 编译错误
    // b.protectedData;  // 编译错误
    b.publicData;        // OK
}
\`\`\`

#### 2. 名字查找机制

\`\`\`cpp
class Base {
public:
    void func(int x) { std::cout << "Base::func(int)" << std::endl; }
};

class Derived : public Base {
public:
    void func(double x) { std::cout << "Derived::func(double)" << std::endl; }
};

Derived d;
d.func(10);  // 调用Derived::func(double)，不是Base::func(int)！
// 名字查找顺序：
// 1. 在Derived中查找func
// 2. 找到Derived::func(double)
// 3. 停止查找，尝试匹配参数
// 4. int可以隐式转换为double，所以调用Derived版本
\`\`\`

#### 3. 访问控制与虚函数

\`\`\`cpp
class Base {
private:
    virtual void secretFunc() { std::cout << "Base secret" << std::endl; }

public:
    void callSecret() {
        secretFunc();  // 调用虚函数
    }
};

class Derived : public Base {
private:
    void secretFunc() override {  // 可以覆盖private虚函数！
        std::cout << "Derived secret" << std::endl;
    }
};

int main() {
    Derived d;
    d.callSecret();  // 输出"Derived secret"
    // 即使secretFunc是private，派生类仍然可以覆盖
    // 访问控制检查调用点的访问权限，不影响虚函数机制
}
\`\`\`

#### 4. 继承方式对接口的影响

\`\`\`cpp
class Base {
public:
    void publicMethod() {}
};

// public继承：保持接口
class PublicDerived : public Base {
    // publicMethod仍然是public
};

// protected继承：限制接口
class ProtectedDerived : protected Base {
    // publicMethod变为protected
public:
    using Base::publicMethod;  // 可以提升回public
};

// private继承：隐藏接口
class PrivateDerived : private Base {
    // publicMethod变为private
public:
    using Base::publicMethod;  // 可以提升回public
};
\`\`\`

#### 5. 作用域链与名字查找

\`\`\`cpp
class A {
public:
    int value = 1;
};

class B : public A {
public:
    int value = 2;  // 隐藏A::value
};

class C : public B {
public:
    int value = 3;  // 隐藏B::value

    void show() {
        std::cout << value << std::endl;        // 3：C::value
        std::cout << B::value << std::endl;     // 2：B::value
        std::cout << A::value << std::endl;     // 1：A::value
        std::cout << this->value << std::endl;  // 3：C::value
    }
};
\`\`\``,
            examples: [
                {
                    title: '成员隐藏与using声明',
                    code: `#include <iostream>

class Base {
public:
    void func() {
        std::cout << "Base::func()" << std::endl;
    }
    
    void func(int x) {
        std::cout << "Base::func(int): " << x << std::endl;
    }
    
    void func(double x) {
        std::cout << "Base::func(double): " << x << std::endl;
    }
};

// 不使用using声明
class DerivedWithoutUsing : public Base {
public:
    void func(const std::string& s) {
        std::cout << "Derived::func(string): " << s << std::endl;
    }
};

// 使用using声明
class DerivedWithUsing : public Base {
public:
    using Base::func;  // 引入基类的所有重载
    
    void func(const std::string& s) {
        std::cout << "Derived::func(string): " << s << std::endl;
    }
};

int main() {
    std::cout << "=== 不使用using声明 ===" << std::endl;
    DerivedWithoutUsing d1;
    d1.func("hello");       // OK
    // d1.func(10);         // 错误！被隐藏
    d1.Base::func(10);      // 需要显式调用
    
    std::cout << "\\n=== 使用using声明 ===" << std::endl;
    DerivedWithUsing d2;
    d2.func("hello");       // Derived版本
    d2.func(10);            // Base版本
    d2.func(3.14);          // Base版本
    
    return 0;
}`,
                    description: '展示成员隐藏和使用using声明恢复基类成员。'
                },
                {
                    title: 'protected成员的使用',
                    code: `#include <iostream>
#include <string>

class Document {
private:
    std::string content;
    
protected:
    int version;
    
    void setContent(const std::string& c) {
        content = c;
        version++;
    }
    
    const std::string& getContent() const {
        return content;
    }
    
public:
    Document(const std::string& c = "") : content(c), version(1) {}
    
    void display() const {
        std::cout << "版本: " << version << std::endl;
        std::cout << "内容: " << content << std::endl;
    }
};

class EditableDocument : public Document {
private:
    std::string author;
    
public:
    EditableDocument(const std::string& c, const std::string& a) 
        : Document(c), author(a) {}
    
    void edit(const std::string& newContent) {
        setContent(newContent);  // 调用protected方法
        std::cout << author << "编辑了文档" << std::endl;
    }
    
    void showVersion() {
        std::cout << "当前版本: " << version << std::endl;  // 访问protected成员
    }
};

int main() {
    EditableDocument doc("初始内容", "张三");
    
    std::cout << "=== 初始状态 ===" << std::endl;
    doc.display();
    
    std::cout << "\\n=== 编辑后 ===" << std::endl;
    doc.edit("修改后的内容");
    doc.display();
    
    std::cout << "\\n=== 版本信息 ===" << std::endl;
    doc.showVersion();
    
    return 0;
}`,
                    description: '展示protected成员在派生类中的使用。'
                }
            ],
            handsOn: {
                title: '管理成员访问',
                description: '实现一个基类和派生类，正确处理成员访问控制和作用域。',
                initialCode: `#include <iostream>
#include <string>

class Account {
private:
    std::string accountNumber;
    double balance;
    
protected:
    // TODO: 添加protected方法用于派生类访问私有成员
    double getBalance() const {
        // 返回余额
    }
    
    void setBalance(double b) {
        // 设置余额
    }
    
public:
    Account(const std::string& num, double bal) 
        : accountNumber(num), balance(bal) {}
    
    void display() const {
        std::cout << "账号: " << accountNumber 
                  << ", 余额: " << balance << std::endl;
    }
    
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
};

class SavingsAccount : public Account {
private:
    double interestRate;
    
public:
    SavingsAccount(const std::string& num, double bal, double rate)
        : Account(num, bal), interestRate(rate) {}
    
    // TODO: 实现计算利息方法
    void calculateInterest() {
        // 使用getBalance()获取余额
        // 计算利息：余额 * 利率
        // 使用setBalance()更新余额
        // 输出利息信息
    }
    
    // TODO: 实现显示利率方法
    void showRate() const {
        // 输出利率信息
    }
};

int main() {
    SavingsAccount savings("SA001", 10000, 0.05);
    
    std::cout << "=== 初始状态 ===" << std::endl;
    savings.display();
    savings.showRate();
    
    std::cout << "\\n=== 计算利息后 ===" << std::endl;
    savings.calculateInterest();
    savings.display();
    
    return 0;
}`,
                expectedOutput: `=== 初始状态 ===
账号: SA001, 余额: 10000
利率: 5%

=== 计算利息后 ===
利息: 500
账号: SA001, 余额: 10500`,
                solutionRegex: 'getBalance|setBalance|interestRate',
                hint: 'protected方法让派生类可以访问基类的私有数据',
                xp: 160
            },
            references: [
                { title: '访问控制与继承', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '类作用域', book: 'C++ Primer 第五版', chapter: '第7章' }
            ],
            assistantTips: [
                'protected成员对外不可见，对派生类可见',
                '派生类成员会隐藏基类同名成员',
                'using声明可以恢复被隐藏的基类成员',
                '友元关系不能继承'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'protected成员可以被谁访问？', 
                    options: [
                        { text: '任何人' }, 
                        { text: '只有类本身' }, 
                        { text: '类本身和派生类', correct: true }, 
                        { text: '只有派生类' }
                    ], 
                    explanation: 'protected成员可以被类本身和派生类访问，对外不可见。' 
                },
                { 
                    type: 'single', 
                    question: '派生类的同名函数会怎样？', 
                    options: [
                        { text: '重载基类函数' }, 
                        { text: '隐藏基类所有同名函数', correct: true }, 
                        { text: '覆盖基类函数' }, 
                        { text: '编译错误' }
                    ], 
                    explanation: '派生类的同名函数会隐藏基类所有同名函数（包括重载版本）。' 
                },
                { 
                    type: 'single', 
                    question: 'using Base::func的作用是？', 
                    options: [
                        { text: '删除基类函数' }, 
                        { text: '引入基类函数到派生类作用域', correct: true }, 
                        { text: '覆盖基类函数' }, 
                        { text: '创建新函数' }
                    ], 
                    explanation: 'using声明将基类函数引入派生类作用域，避免隐藏。' 
                },
                { 
                    type: 'single', 
                    question: '友元关系可以继承吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以', correct: true }, 
                        { text: '只继承public友元' }, 
                        { text: '取决于继承方式' }
                    ], 
                    explanation: '友元关系不能继承，基类的友元不是派生类的友元。' 
                },
                { 
                    type: 'single', 
                    question: '派生类可以提升基类成员的访问级别吗？', 
                    options: [
                        { text: '可以提升任何成员' }, 
                        { text: '只能提升protected成员' }, 
                        { text: '可以提升，但只能变得更严格或不变' }, 
                        { text: '可以提升，但不能变得更宽松', correct: true }
                    ], 
                    explanation: '派生类可以提升继承成员的访问级别，但不能降低。' 
                }
            ]
        },
        {
            id: '11.3',
            title: '虚函数与多态基础',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 400,
            concepts: `## 虚函数与多态基础

### 什么是多态？

多态（Polymorphism）是指同一操作作用于不同的对象，可以有不同的解释和执行结果。

\`\`\`cpp
// 静态多态（编译时）
void print(int x) { std::cout << x << std::endl; }
void print(double x) { std::cout << x << std::endl; }
void print(const std::string& s) { std::cout << s << std::endl; }

// 动态多态（运行时）- 通过虚函数实现
\`\`\`

### 虚函数

使用virtual关键字声明虚函数，实现运行时多态：

\`\`\`cpp
class Animal {
public:
    virtual void speak() {  // 虚函数
        std::cout << "动物发出声音" << std::endl;
    }
    
    virtual ~Animal() {}  // 虚析构函数
};

class Dog : public Animal {
public:
    void speak() override {  // 覆盖基类虚函数
        std::cout << "汪汪汪！" << std::endl;
    }
};

class Cat : public Animal {
public:
    void speak() override {
        std::cout << "喵喵喵~" << std::endl;
    }
};
\`\`\`

### 动态绑定

通过基类指针或引用调用虚函数时，会根据实际对象类型调用对应版本：

\`\`\`cpp
void makeSound(Animal& animal) {
    animal.speak();  // 动态绑定：根据实际类型调用
}

int main() {
    Dog dog;
    Cat cat;
    
    makeSound(dog);  // 输出：汪汪汪！
    makeSound(cat);  // 输出：喵喵喵~
}
\`\`\`

### 虚函数的工作原理

\`\`\`cpp
Animal* a = new Dog();
a->speak();  // 调用Dog::speak()

// 编译器生成的伪代码：
// a->vptr->speak(a);  // 通过虚函数表调用
\`\`\`

### 虚函数的规则

1. **只有成员函数可以是虚函数**
2. **静态函数不能是虚函数**
3. **构造函数不能是虚函数**
4. **析构函数应该是虚函数**（如果类会被继承）

\`\`\`cpp
class Base {
public:
    virtual void func1();        // OK：虚函数
    virtual void func2() const;  // OK：const虚函数
    
    // static virtual void func3();  // 错误！静态函数不能是虚函数
    // virtual Base();               // 错误！构造函数不能是虚函数
    virtual ~Base();              // OK：虚析构函数
};
\`\`\`

### 虚函数的默认实参

虚函数可以有默认实参，但要注意：

\`\`\`cpp
class Base {
public:
    virtual void func(int x = 10) {
        std::cout << "Base: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void func(int x = 20) override {
        std::cout << "Derived: " << x << std::endl;
    }
};

int main() {
    Base* b = new Derived();
    b->func();  // 输出：Derived: 10
    // 调用Derived::func，但使用Base的默认实参！
}
\`\`\`

### 虚函数与覆盖

派生类覆盖虚函数时：
- 函数签名必须完全相同
- 返回类型必须兼容（协变返回类型）
- 访问级别可以不同

\`\`\`cpp
class Base {
public:
    virtual int getValue() { return 1; }
protected:
    virtual void internal() {}
};

class Derived : public Base {
public:
    int getValue() override { return 2; }  // OK
    
private:
    void internal() override {}  // OK：可以改变访问级别
};
\`\`\`

### 纯虚函数

使用=0声明纯虚函数，使类成为抽象类：

\`\`\`cpp
class Shape {
public:
    virtual double area() = 0;  // 纯虚函数
    virtual ~Shape() = default;
};

// Shape是抽象类，不能实例化
// Shape s;  // 错误！

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() override { return 3.14159 * radius * radius; }
};
\`\`\`

### 多态的实际应用

\`\`\`cpp
#include <vector>
#include <memory>

void processShapes(std::vector<std::unique_ptr<Shape>>& shapes) {
    for (const auto& shape : shapes) {
        std::cout << "面积: " << shape->area() << std::endl;
    }
}

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(5.0));
    shapes.push_back(std::make_unique<Rectangle>(3.0, 4.0));
    
    processShapes(shapes);  // 多态调用
}
\`\`\`

### 最佳实践

#### 1. 总是使用override关键字

\`\`\`cpp
class Base {
public:
    virtual void func() { /* ... */ }
};

// 推荐：使用override
class GoodDerived : public Base {
public:
    void func() override {  // 明确表示覆盖基类虚函数
        // ...
    }
};

// 不推荐：不使用override
class BadDerived : public Base {
public:
    void func() {  // 容易出错，签名不匹配时不会报错
        // ...
    }
};
\`\`\`

#### 2. 基类析构函数应该是虚函数

\`\`\`cpp
// 正确：虚析构函数
class GoodBase {
public:
    virtual ~GoodBase() = default;  // 或提供实现
};

class GoodDerived : public GoodBase {
private:
    int* data;
public:
    ~GoodDerived() { delete data; }
};

GoodBase* ptr = new GoodDerived();
delete ptr;  // 正确调用GoodDerived析构函数

// 错误：非虚析构函数
class BadBase {
public:
    ~BadBase() {}  // 非虚析构函数
};

BadBase* ptr2 = new GoodDerived();
delete ptr2;  // 只调用BadBase析构函数，内存泄漏！
\`\`\`

#### 3. 避免在构造/析构函数中调用虚函数

\`\`\`cpp
class Base {
public:
    Base() {
        // init();  // 不推荐：调用虚函数
        // 此时派生类部分尚未构造，不会调用派生类版本
    }

    virtual void init() { std::cout << "Base init" << std::endl; }

protected:
    void baseInit() {  // 非虚函数，安全
        std::cout << "Base initialization" << std::endl;
    }
};

class Derived : public Base {
public:
    Derived() : Base() {
        init();  // OK：在派生类构造函数中调用
    }

    void init() override { std::cout << "Derived init" << std::endl; }
};
\`\`\`

#### 4. 合理使用纯虚函数

\`\`\`cpp
// 推荐：清晰的接口定义
class Drawable {
public:
    virtual void draw() = 0;  // 纯虚函数，强制派生类实现
    virtual ~Drawable() = default;
};

// 推荐：提供默认实现
class Serializable {
public:
    virtual std::string serialize() const {
        return "{}";  // 默认实现
    }
    virtual ~Serializable() = default;
};
\`\`\`

#### 5. 使用智能指针管理多态对象

\`\`\`cpp
#include <memory>
#include <vector>

// 推荐：使用unique_ptr
std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(5.0));
shapes.push_back(std::make_unique<Rectangle>(3.0, 4.0));

// 推荐：使用shared_ptr（需要共享所有权时）
auto sharedShape = std::make_shared<Circle>(5.0);
\`\`\`

### 常见错误

#### 1. 忘记使用virtual关键字

\`\`\`cpp
class Base {
public:
    void func() { std::cout << "Base" << std::endl; }  // 非虚函数！
};

class Derived : public Base {
public:
    void func() { std::cout << "Derived" << std::endl; }
};

Base* ptr = new Derived();
ptr->func();  // 输出"Base"，不是"Derived"！
// 问题：func不是虚函数，没有多态

// 正确：使用virtual
class CorrectBase {
public:
    virtual void func() { std::cout << "Base" << std::endl; }
};
\`\`\`

#### 2. 函数签名不匹配

\`\`\`cpp
class Base {
public:
    virtual void func(int x) { /* ... */ }
};

class Derived : public Base {
public:
    void func(double x) override {  // 错误！签名不匹配
        // 这不是覆盖，而是新函数
    }
};

// 正确：签名完全匹配
class CorrectDerived : public Base {
public:
    void func(int x) override {  // OK
        // ...
    }
};
\`\`\`

#### 3. 对象切片

\`\`\`cpp
Derived derivedObj;
Base baseObj = derivedObj;  // 对象切片！
baseObj.func();  // 调用Base::func，不是Derived::func

// 正确：使用指针或引用
Base& ref = derivedObj;
ref.func();  // 调用Derived::func

Base* ptr = &derivedObj;
ptr->func();  // 调用Derived::func
\`\`\`

#### 4. 默认实参陷阱

\`\`\`cpp
class Base {
public:
    virtual void func(int x = 10) {
        std::cout << "Base: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void func(int x = 20) override {  // 不同的默认值
        std::cout << "Derived: " << x << std::endl;
    }
};

Base* ptr = new Derived();
ptr->func();  // 输出"Derived: 10"，不是"Derived: 20"！
// 默认实参由指针的静态类型决定

// 建议：避免在虚函数中使用默认实参，或确保基类和派生类的默认值一致
\`\`\`

#### 5. 在构造/析构函数中调用虚函数

\`\`\`cpp
class Base {
public:
    Base() {
        init();  // 调用Base::init，不是Derived::init！
    }

    virtual void init() {
        std::cout << "Base init" << std::endl;
    }
};

class Derived : public Base {
public:
    void init() override {
        std::cout << "Derived init" << std::endl;
    }
};

Derived d;  // 输出"Base init"，不是"Derived init"
// 问题：构造时派生类部分尚未初始化，虚函数机制不完整
\`\`\`

### 深入理解

#### 1. 虚函数表的实现

\`\`\`cpp
class Base {
public:
    virtual void func1() { /* ... */ }
    virtual void func2() { /* ... */ }
    int data;
};

// 编译器可能的实现：
// struct Base {
//     void** vptr;  // 虚函数表指针
//     int data;
// };
//
// Base的虚函数表：
// vtable[0] = &Base::func1
// vtable[1] = &Base::func2

class Derived : public Base {
public:
    void func1() override { /* ... */ }  // 覆盖func1
    virtual void func3() { /* ... */ }   // 新增虚函数
};

// Derived的虚函数表：
// vtable[0] = &Derived::func1  // 覆盖的版本
// vtable[1] = &Base::func2     // 继承的版本
// vtable[2] = &Derived::func3  // 新增的版本
\`\`\`

#### 2. 虚函数调用的开销

\`\`\`cpp
// 非虚函数调用
obj.func();  // 直接调用，可能内联

// 虚函数调用
ptr->func();  // 间接调用：
              // 1. 获取vptr
              // 2. 从vtable中查找函数地址
              // 3. 调用函数

// 性能差异：
// - 虚函数调用稍慢（通常几个时钟周期）
// - 阻止内联优化
// - 增加对象大小（一个指针）
// 但通常可以忽略不计，不要为了性能避免使用虚函数
\`\`\`

#### 3. 多重继承与虚函数表

\`\`\`cpp
class Base1 {
public:
    virtual void func1() {}
};

class Base2 {
public:
    virtual void func2() {}
};

class Derived : public Base1, public Base2 {
public:
    void func1() override {}
    void func2() override {}
};

// Derived对象可能有两个vptr：
// - 一个指向Base1的虚函数表
// - 一个指向Base2的虚函数表

Derived d;
Base1* b1 = &d;  // 使用第一个vptr
Base2* b2 = &d;  // 使用第二个vptr（可能需要指针调整）
\`\`\`

#### 4. 纯虚函数与实现

\`\`\`cpp
class AbstractBase {
public:
    virtual void func() = 0;  // 纯虚函数
};

// 纯虚函数可以有实现！
void AbstractBase::func() {
    std::cout << "Default implementation" << std::endl;
}

class Concrete : public AbstractBase {
public:
    void func() override {
        AbstractBase::func();  // 调用基类实现
        std::cout << "Concrete implementation" << std::endl;
    }
};

// 用途：提供默认行为，派生类可以选择使用或覆盖
\`\`\`

#### 5. 虚函数与RTTI

\`\`\`cpp
class Base {
public:
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    void specificMethod() { std::cout << "Derived specific" << std::endl; }
};

void process(Base* ptr) {
    // 使用dynamic_cast进行向下转型
    if (Derived* d = dynamic_cast<Derived*>(ptr)) {
        d->specificMethod();  // 安全调用
    }

    // 使用typeid获取类型信息
    if (typeid(*ptr) == typeid(Derived)) {
        std::cout << "Object is Derived" << std::endl;
    }
}

// RTTI（运行时类型识别）依赖于虚函数表
// 只有具有虚函数的类才能使用dynamic_cast和typeid
\`\`\``,
            examples: [
                {
                    title: '基本多态示例',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <memory>

// 抽象基类
class Shape {
public:
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual std::string name() const = 0;
    
    virtual ~Shape() = default;
};

// 圆形
class Circle : public Shape {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    double perimeter() const override {
        return 2 * 3.14159 * radius;
    }
    
    std::string name() const override {
        return "圆形";
    }
};

// 矩形
class Rectangle : public Shape {
private:
    double width, height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() const override {
        return width * height;
    }
    
    double perimeter() const override {
        return 2 * (width + height);
    }
    
    std::string name() const override {
        return "矩形";
    }
};

// 打印图形信息（多态调用）
void printShapeInfo(const Shape& shape) {
    std::cout << shape.name() << ":" << std::endl;
    std::cout << "  面积: " << shape.area() << std::endl;
    std::cout << "  周长: " << shape.perimeter() << std::endl;
}

int main() {
    Circle circle(5.0);
    Rectangle rect(4.0, 6.0);
    
    std::cout << "=== 直接调用 ===" << std::endl;
    printShapeInfo(circle);
    std::cout << std::endl;
    printShapeInfo(rect);
    
    std::cout << "\\n=== 通过基类指针 ===" << std::endl;
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(3.0));
    shapes.push_back(std::make_unique<Rectangle>(5.0, 8.0));
    
    for (const auto& shape : shapes) {
        printShapeInfo(*shape);
        std::cout << std::endl;
    }
    
    return 0;
}`,
                    description: '展示使用虚函数实现的多态。'
                },
                {
                    title: '虚函数与默认实参',
                    code: `#include <iostream>
#include <string>

class Base {
public:
    virtual void greet(const std::string& name = "陌生人") {
        std::cout << "Base: 你好, " << name << "!" << std::endl;
    }
    
    virtual int getValue(int x = 10) {
        return x * 2;
    }
};

class Derived : public Base {
public:
    void greet(const std::string& name = "朋友") override {
        std::cout << "Derived: 欢迎, " << name << "!" << std::endl;
    }
    
    int getValue(int x = 20) override {
        return x * 3;
    }
};

int main() {
    Base* b1 = new Base();
    Base* b2 = new Derived();
    Derived* d = new Derived();
    
    std::cout << "=== Base指针调用 ===" << std::endl;
    b1->greet();        // Base: 你好, 陌生人!
    b2->greet();        // Derived: 欢迎, 陌生人! (注意：使用Base的默认值)
    
    std::cout << "\\n=== Derived指针调用 ===" << std::endl;
    d->greet();         // Derived: 欢迎, 朋友!
    
    std::cout << "\\n=== getValue测试 ===" << std::endl;
    std::cout << "b1->getValue(): " << b1->getValue() << std::endl;  // 20
    std::cout << "b2->getValue(): " << b2->getValue() << std::endl;  // 30 (使用Base的默认值10)
    std::cout << "d->getValue(): " << d->getValue() << std::endl;    // 60
    
    std::cout << "\\n=== 显式传参 ===" << std::endl;
    std::cout << "b2->getValue(5): " << b2->getValue(5) << std::endl;  // 15
    
    delete b1;
    delete b2;
    delete d;
    
    return 0;
}`,
                    description: '展示虚函数默认实参的行为：使用指针/引用的静态类型决定默认实参。'
                }
            ],
            handsOn: {
                title: '实现多态图形',
                description: '实现一个图形层次结构，使用虚函数实现多态。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <memory>

// 图形基类
class Graphic {
public:
    // TODO: 声明纯虚函数draw()
    // TODO: 声明虚析构函数
};

// TODO: 实现Circle类
class Circle {
private:
    int x, y, radius;
    
public:
    Circle(int x, int y, int r) : x(x), y(y), radius(r) {}
    
    // TODO: 实现draw方法
    // 输出: "在(" << x << "," << y << ")绘制半径为" << radius << "的圆形"
};

// TODO: 实现Rectangle类
class Rectangle {
private:
    int x, y, width, height;
    
public:
    Rectangle(int x, int y, int w, int h) 
        : x(x), y(y), width(w), height(h) {}
    
    // TODO: 实现draw方法
    // 输出: "在(" << x << "," << y << ")绘制" << width << "x" << height << "的矩形"
};

// TODO: 实现Triangle类
class Triangle {
private:
    int x1, y1, x2, y2, x3, y3;
    
public:
    Triangle(int x1, int y1, int x2, int y2, int x3, int y3)
        : x1(x1), y1(y1), x2(x2), y2(y2), x3(x3), y3(y3) {}
    
    // TODO: 实现draw方法
    // 输出: "绘制三角形: (" << x1 << "," << y1 << ") (" << x2 << "," << y2 << ") (" << x3 << "," << y3 << ")"
};

void renderScene(const std::vector<std::unique_ptr<Graphic>>& graphics) {
    std::cout << "=== 渲染场景 ===" << std::endl;
    for (const auto& g : graphics) {
        g->draw();
    }
}

int main() {
    std::vector<std::unique_ptr<Graphic>> scene;
    
    scene.push_back(std::make_unique<Circle>(10, 10, 5));
    scene.push_back(std::make_unique<Rectangle>(20, 20, 8, 6));
    scene.push_back(std::make_unique<Triangle>(0, 0, 5, 0, 2, 4));
    
    renderScene(scene);
    
    return 0;
}`,
                expectedOutput: `=== 渲染场景 ===
在(10,10)绘制半径为5的圆形
在(20,20)绘制8x6的矩形
绘制三角形: (0,0) (5,0) (2,4)`,
                solutionRegex: 'virtual.*draw|override|class Circle.*: public Graphic',
                hint: '基类声明纯虚函数virtual void draw() = 0，派生类使用override覆盖',
                xp: 180
            },
            references: [
                { title: '虚函数', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '多态', book: 'Effective C++', chapter: '条款34-37' }
            ],
            assistantTips: [
                'virtual关键字声明虚函数',
                '通过基类指针/引用调用虚函数实现多态',
                '派生类覆盖虚函数时使用override关键字',
                '析构函数应该是虚函数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '虚函数实现的是哪种多态？', 
                    options: [
                        { text: '编译时多态' }, 
                        { text: '运行时多态', correct: true }, 
                        { text: '静态多态' }, 
                        { text: '模板多态' }
                    ], 
                    explanation: '虚函数实现运行时多态，在运行时确定调用哪个函数。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个不能是虚函数？', 
                    options: [
                        { text: '成员函数' }, 
                        { text: '析构函数' }, 
                        { text: '构造函数', correct: true }, 
                        { text: 'const成员函数' }
                    ], 
                    explanation: '构造函数不能是虚函数，因为构造时对象类型尚未完全确定。' 
                },
                { 
                    type: 'single', 
                    question: '纯虚函数的声明方式是？', 
                    options: [
                        { text: 'virtual void func();' }, 
                        { text: 'virtual void func() = 0;', correct: true }, 
                        { text: 'pure virtual void func();' }, 
                        { text: 'abstract void func();' }
                    ], 
                    explanation: '纯虚函数使用=0声明，使类成为抽象类。' 
                },
                { 
                    type: 'single', 
                    question: '虚函数的默认实参由什么决定？', 
                    options: [
                        { text: '实际对象类型' }, 
                        { text: '指针或引用的静态类型', correct: true }, 
                        { text: '派生类的定义' }, 
                        { text: '运行时决定' }
                    ], 
                    explanation: '默认实参由指针或引用的静态类型决定，不是动态类型。' 
                },
                { 
                    type: 'single', 
                    question: '覆盖虚函数时，函数签名必须？', 
                    options: [
                        { text: '可以不同' }, 
                        { text: '必须完全相同', correct: true }, 
                        { text: '只有返回类型相同' }, 
                        { text: '只有参数相同' }
                    ], 
                    explanation: '覆盖虚函数时，函数签名（参数类型）必须完全相同。' 
                }
            ]
        },
        {
            id: '11.4',
            title: '虚函数表原理示意',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 虚函数表原理示意

### 什么是虚函数表？

虚函数表（Virtual Table，简称vtable）是C++实现多态的底层机制。

每个包含虚函数的类都有一个虚函数表，存储虚函数的地址。

### 虚函数表的工作原理

\`\`\`cpp
class Base {
public:
    virtual void func1() { std::cout << "Base::func1" << std::endl; }
    virtual void func2() { std::cout << "Base::func2" << std::endl; }
};

class Derived : public Base {
public:
    void func1() override { std::cout << "Derived::func1" << std::endl; }
    // func2使用Base的版本
};
\`\`\`

### 内存布局示意

\`\`\`
Base对象:
+----------------+
| vptr ---------> +-------> Base虚函数表
+----------------+         +----------------+
                           | &Base::func1   |
                           +----------------+
                           | &Base::func2   |
                           +----------------+

Derived对象:
+----------------+
| vptr ---------> +-------> Derived虚函数表
+----------------+         +----------------+
                           | &Derived::func1|  <-- 覆盖了Base版本
                           +----------------+
                           | &Base::func2   |  <-- 继承Base版本
                           +----------------+
\`\`\`

### vptr指针

每个包含虚函数的对象都有一个隐藏的vptr指针：

\`\`\`cpp
class WithVirtual {
public:
    virtual void func() {}
};

class WithoutVirtual {
public:
    void func() {}
};

int main() {
    std::cout << sizeof(WithVirtual) << std::endl;    // 通常8字节（64位系统）
    std::cout << sizeof(WithoutVirtual) << std::endl; // 1字节（空类）
}
\`\`\`

### 虚函数调用过程

\`\`\`cpp
Base* ptr = new Derived();
ptr->func1();  // 虚函数调用

// 编译器生成的伪代码：
// 1. 通过ptr找到vptr
// 2. 通过vptr找到虚函数表
// 3. 从表中取出func1的地址
// 4. 调用该函数
\`\`\`

### 多重继承的虚函数表

多重继承会有多个vptr：

\`\`\`cpp
class Base1 {
public:
    virtual void func1() {}
};

class Base2 {
public:
    virtual void func2() {}
};

class Derived : public Base1, public Base2 {
public:
    void func1() override {}
    void func2() override {}
};

// Derived对象有两个vptr，分别指向两个虚函数表
\`\`\`

### 虚函数表的特点

1. **每个类一个**：所有对象共享同一个虚函数表
2. **编译时生成**：虚函数表在编译时创建
3. **只读**：虚函数表存储在只读数据段
4. **性能开销**：
   - 额外的内存（vptr指针）
   - 间接调用（通过虚函数表）

### 查看虚函数表（调试技巧）

\`\`\`cpp
#include <iostream>

class Base {
public:
    virtual void func1() { std::cout << "Base::func1" << std::endl; }
    virtual void func2() { std::cout << "Base::func2" << std::endl; }
    virtual void func3() { std::cout << "Base::func3" << std::endl; }
};

class Derived : public Base {
public:
    void func1() override { std::cout << "Derived::func1" << std::endl; }
    void func3() override { std::cout << "Derived::func3" << std::endl; }
};

// 函数指针类型
using FuncPtr = void(*)();

int main() {
    Base b;
    Derived d;
    
    // 获取vptr（第一个8字节）
    void** vptr_b = *(void***)&b;
    void** vptr_d = *(void***)&d;
    
    std::cout << "Base虚函数表地址: " << vptr_b << std::endl;
    std::cout << "Derived虚函数表地址: " << vptr_d << std::endl;
    
    // 调用虚函数（仅用于演示，实际代码不要这样做）
    FuncPtr func = (FuncPtr)vptr_d[0];
    func();  // Derived::func1
    
    return 0;
}
\`\`\`

### 性能考虑

\`\`\`cpp
// 非虚函数：直接调用，可能内联
class FastClass {
public:
    void func() { /* ... */ }  // 可以内联
};

// 虚函数：间接调用，不能内联
class SlowClass {
public:
    virtual void func() { /* ... */ }  // 不能内联
};

// 性能差异通常很小，不要因为性能避免使用虚函数
\`\`\`

### 最佳实践

#### 1. 不要过度担心性能

\`\`\`cpp
// 虚函数的性能开销通常可以忽略
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

// 现代CPU虚函数调用开销：
// - 额外的内存访问：1-2个时钟周期
// - 阻止内联：但在性能关键路径才重要
// - 对象大小增加：一个指针（8字节）

// 建议：优先考虑设计清晰性，而不是过早优化
\`\`\`

#### 2. 正确使用虚析构函数

\`\`\`cpp
// 正确：基类有虚析构函数
class GoodBase {
public:
    virtual ~GoodBase() = default;
};

class GoodDerived : public GoodBase {
private:
    int* data;
public:
    ~GoodDerived() { delete data; }
};

GoodBase* ptr = new GoodDerived();
delete ptr;  // 正确调用GoodDerived析构函数

// 错误：基类没有虚析构函数
class BadBase {
public:
    ~BadBase() {}  // 非虚析构函数
};

BadBase* ptr2 = new GoodDerived();
delete ptr2;  // 未定义行为！只调用BadBase析构函数
\`\`\`

#### 3. 理解底层机制帮助调试

\`\`\`cpp
// 理解虚函数表可以帮助调试：
// 1. 为什么多态没有生效？检查是否使用了virtual
// 2. 为什么对象大小增加了？因为有vptr
// 3. 为什么构造函数中调用虚函数不工作？vptr还未设置

class DebugExample {
public:
    DebugExample() {
        // 调试时：此时vptr指向DebugExample的虚函数表
        // 如果是派生类对象，vptr还未更新为派生类的虚函数表
    }

    virtual void func() {}
};
\`\`\`

#### 4. 避免虚函数滥用

\`\`\`cpp
// 好的设计：需要多态时使用虚函数
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

// 不好的设计：不需要多态却使用虚函数
class SimpleValue {
public:
    virtual int getValue() { return value; }  // 不必要！
private:
    int value;
};

// 更好的设计：不需要多态时不使用虚函数
class BetterSimpleValue {
public:
    int getValue() const { return value; }  // 非虚函数，可以内联
private:
    int value;
};
\`\`\`

#### 5. 使用工具分析虚函数表

\`\`\`cpp
// 使用编译器选项查看虚函数表：
// GCC/Clang: -fdump-class-hierarchy
// MSVC: /d1reportAllClassLayout

// 使用调试器查看vptr：
// (gdb) p/x *(void**)obj  // 查看vptr
// (gdb) info vtbl obj     // 查看虚函数表（如果支持）
\`\`\`

### 常见错误

#### 1. 误解虚函数表的共享

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

// 错误理解：每个对象有自己的虚函数表
// 正确理解：所有对象共享同一个虚函数表

Base b1, b2, b3;
// b1, b2, b3的vptr都指向同一个虚函数表
// 虚函数表在编译时生成，存储在只读数据段
\`\`\`

#### 2. 忽略虚函数表指针的大小

\`\`\`cpp
struct Data {
    int x, y, z;  // 12字节
};

struct DataWithVirtual {
    virtual void func() {}
    int x, y, z;  // 12字节 + 8字节(vptr) = 20字节（可能还有填充）
};

// 在64位系统上：
// sizeof(Data) = 12字节
// sizeof(DataWithVirtual) = 24字节（包含填充）

// 注意：vptr会增加对象大小，在大量小对象时要考虑
\`\`\`

#### 3. 构造函数中调用虚函数

\`\`\`cpp
class Base {
public:
    Base() {
        init();  // 调用Base::init，不是Derived::init！
    }

    virtual void init() {
        std::cout << "Base init" << std::endl;
    }
};

class Derived : public Base {
public:
    void init() override {
        std::cout << "Derived init" << std::endl;
    }
};

Derived d;  // 输出"Base init"

// 原因：构造时vptr逐步设置
// 1. Base构造函数开始时，vptr指向Base的虚函数表
// 2. Base构造函数完成后，vptr更新为Derived的虚函数表
// 3. 所以Base构造函数中调用虚函数，使用Base的版本
\`\`\`

#### 4. 误用多重继承的虚函数表

\`\`\`cpp
class Base1 {
public:
    virtual void func1() {}
};

class Base2 {
public:
    virtual void func2() {}
};

class Derived : public Base1, public Base2 {
public:
    void func1() override {}
    void func2() override {}
};

Derived d;
Base1* b1 = &d;
Base2* b2 = &d;

// b1和b2指向不同的地址！
// b1 = &d（不需要调整）
// b2 = &d + sizeof(Base1)（需要调整）

// 调用虚函数时，编译器会自动处理指针调整
b2->func2();  // 正确工作
\`\`\`

#### 5. 忘记虚析构函数

\`\`\`cpp
class Base {
public:
    // 没有virtual ~Base()！
    virtual void func() {}
};

class Derived : public Base {
private:
    int* largeArray;
public:
    Derived() : largeArray(new int[1000]) {}
    ~Derived() { delete[] largeArray; }
};

Base* ptr = new Derived();
delete ptr;  // 未定义行为！
// 可能只调用Base析构函数，导致内存泄漏
// 可能崩溃，因为delete使用了错误的类型信息
\`\`\`

### 深入理解

#### 1. 虚函数表的存储位置

\`\`\`cpp
// 虚函数表通常存储在只读数据段（.rodata或.rdata）
// 这样可以防止运行时修改虚函数表

class Example {
public:
    virtual void func() {}
};

// 虚函数表布局：
// .rodata段：
//   vtable_for_Example:
//     [0]: &Example::func
//     [1]: &typeinfo_for_Example  // 用于RTTI

// 对象布局：
//   Example对象:
//     [0]: vptr -> vtable_for_Example
\`\`\`

#### 2. 虚函数表与RTTI

\`\`\`cpp
#include <typeinfo>

class Base {
public:
    virtual ~Base() = default;
};

class Derived : public Base {};

// RTTI信息存储在虚函数表中
Base* ptr = new Derived();

// typeid使用虚函数表中的typeinfo指针
const std::type_info& info = typeid(*ptr);
std::cout << info.name() << std::endl;  // 输出类型名

// dynamic_cast也使用虚函数表
Derived* d = dynamic_cast<Derived*>(ptr);
\`\`\`

#### 3. 虚函数表指针的初始化

\`\`\`cpp
class Base {
public:
    Base() {
        // 此时vptr = &Base::vtable
    }

    virtual void func() {}
};

class Derived : public Base {
public:
    Derived() : Base() {
        // Base构造完成后，vptr更新为&Derived::vtable
    }

    void func() override {}
};

// 构造顺序：
// 1. 分配内存
// 2. 设置vptr = &Base::vtable
// 3. 执行Base构造函数
// 4. 更新vptr = &Derived::vtable
// 5. 执行Derived构造函数

// 析构顺序（相反）：
// 1. 设置vptr = &Derived::vtable
// 2. 执行Derived析构函数
// 3. 更新vptr = &Base::vtable
// 4. 执行Base析构函数
\`\`\`

#### 4. 虚函数表与内联

\`\`\`cpp
class Example {
public:
    // 虚函数通常不能内联（通过指针调用时）
    virtual void func() { /* 简单代码 */ }
};

Example e;
e.func();  // 可能内联（编译器知道具体类型）

Example* ptr = &e;
ptr->func();  // 不能内联（通过虚函数表调用）

// 但在以下情况可能内联：
// 1. 编译器能确定具体类型
// 2. 函数在构造/析构函数中调用（此时不使用虚函数机制）
// 3. 使用final关键字（编译器知道不能进一步覆盖）
\`\`\`

#### 5. 不同编译器的实现

\`\`\`cpp
// 不同编译器的虚函数表实现可能不同：

// GCC/Clang:
// - vptr通常在对象开始位置
// - 虚函数表包含函数指针和RTTI信息

// MSVC:
// - vptr通常在对象开始位置
// - 虚函数表布局可能不同
// - 可能使用不同的RTTI实现

// 跨平台代码不应该依赖具体的虚函数表布局
\`\`\``,
            examples: [
                {
                    title: '虚函数表大小验证',
                    code: `#include <iostream>

// 没有虚函数的类
class NoVirtual {
public:
    int x;
    void func() {}
};

// 有虚函数的类
class WithVirtual {
public:
    int x;
    virtual void func() {}
};

// 多个虚函数的类
class MultipleVirtual {
public:
    int x;
    virtual void func1() {}
    virtual void func2() {}
    virtual void func3() {}
};

// 多重继承
class Base1 {
public:
    virtual void f1() {}
};

class Base2 {
public:
    virtual void f2() {}
};

class MultipleInheritance : public Base1, public Base2 {
public:
    virtual void f3() {}
};

int main() {
    std::cout << "=== 类大小比较 ===" << std::endl;
    std::cout << "NoVirtual: " << sizeof(NoVirtual) << " 字节" << std::endl;
    std::cout << "WithVirtual: " << sizeof(WithVirtual) << " 字节" << std::endl;
    std::cout << "MultipleVirtual: " << sizeof(MultipleVirtual) << " 字节" << std::endl;
    
    std::cout << "\\n=== 多重继承 ===" << std::endl;
    std::cout << "Base1: " << sizeof(Base1) << " 字节" << std::endl;
    std::cout << "Base2: " << sizeof(Base2) << " 字节" << std::endl;
    std::cout << "MultipleInheritance: " << sizeof(MultipleInheritance) << " 字节" << std::endl;
    
    std::cout << "\\n=== 指针大小 ===" << std::endl;
    std::cout << "指针大小: " << sizeof(void*) << " 字节" << std::endl;
    
    return 0;
}`,
                    description: '通过类大小验证虚函数表指针的存在。'
                },
                {
                    title: '虚函数调用追踪',
                    code: `#include <iostream>
#include <string>

class Animal {
public:
    Animal() {
        std::cout << "Animal构造函数" << std::endl;
    }
    
    virtual ~Animal() {
        std::cout << "Animal析构函数" << std::endl;
    }
    
    virtual void speak() {
        std::cout << "动物发声" << std::endl;
    }
    
    virtual void move() {
        std::cout << "动物移动" << std::endl;
    }
};

class Dog : public Animal {
public:
    Dog() {
        std::cout << "Dog构造函数" << std::endl;
    }
    
    ~Dog() override {
        std::cout << "Dog析构函数" << std::endl;
    }
    
    void speak() override {
        std::cout << "汪汪汪！" << std::endl;
    }
    
    void move() override {
        std::cout << "狗奔跑" << std::endl;
    }
};

class Cat : public Animal {
public:
    Cat() {
        std::cout << "Cat构造函数" << std::endl;
    }
    
    ~Cat() override {
        std::cout << "Cat析构函数" << std::endl;
    }
    
    void speak() override {
        std::cout << "喵喵喵~" << std::endl;
    }
    
    // 不覆盖move，使用Animal版本
};

int main() {
    std::cout << "=== 创建Dog ===" << std::endl;
    Animal* a1 = new Dog();
    
    std::cout << "\\n=== 虚函数调用 ===" << std::endl;
    a1->speak();  // Dog::speak
    a1->move();   // Dog::move
    
    std::cout << "\\n=== 删除Dog ===" << std::endl;
    delete a1;
    
    std::cout << "\\n=== 创建Cat ===" << std::endl;
    Animal* a2 = new Cat();
    
    std::cout << "\\n=== 虚函数调用 ===" << std::endl;
    a2->speak();  // Cat::speak
    a2->move();   // Animal::move（未覆盖）
    
    std::cout << "\\n=== 删除Cat ===" << std::endl;
    delete a2;
    
    return 0;
}`,
                    description: '追踪虚函数调用和对象构造/析构过程。'
                }
            ],
            handsOn: {
                title: '分析虚函数表',
                description: '创建类层次结构，分析虚函数表的行为。',
                initialCode: `#include <iostream>

// TODO: 创建基类Base，包含两个虚函数func1和func2
class Base {
public:
    // TODO: 声明虚析构函数
    
    // TODO: 声明虚函数func1，输出"Base::func1"
    
    // TODO: 声明虚函数func2，输出"Base::func2"
    
    // TODO: 声明普通函数normalFunc，输出"Base::normalFunc"
};

// TODO: 创建派生类Derived
class Derived {
public:
    // TODO: 覆盖func1，输出"Derived::func1"
    
    // 不覆盖func2
    
    // TODO: 隐藏normalFunc，输出"Derived::normalFunc"
};

int main() {
    std::cout << "=== 类大小 ===" << std::endl;
    std::cout << "sizeof(Base): " << sizeof(Base) << " 字节" << std::endl;
    std::cout << "sizeof(Derived): " << sizeof(Derived) << " 字节" << std::endl;
    
    std::cout << "\\n=== 基类指针调用 ===" << std::endl;
    Base* b = new Derived();
    b->func1();      // 应该调用Derived::func1
    b->func2();      // 应该调用Base::func2
    b->normalFunc(); // 应该调用Base::normalFunc（非虚函数，静态绑定）
    delete b;
    
    std::cout << "\\n=== 派生类指针调用 ===" << std::endl;
    Derived* d = new Derived();
    d->func1();      // Derived::func1
    d->func2();      // Base::func2
    d->normalFunc(); // Derived::normalFunc（隐藏了Base版本）
    delete d;
    
    return 0;
}`,
                expectedOutput: `=== 类大小 ===
sizeof(Base): 8 字节
sizeof(Derived): 8 字节

=== 基类指针调用 ===
Derived::func1
Base::func2
Base::normalFunc

=== 派生类指针调用 ===
Derived::func1
Base::func2
Derived::normalFunc`,
                solutionRegex: 'virtual.*func1|virtual.*func2|override',
                hint: '虚函数使用virtual声明，派生类覆盖时使用override',
                xp: 160
            },
            references: [
                { title: '虚函数实现', book: '深度探索C++对象模型', chapter: '第1-4章' },
                { title: '虚函数', book: 'C++ Primer 第五版', chapter: '第15章' }
            ],
            assistantTips: [
                '每个有虚函数的类都有一个虚函数表',
                '对象通过vptr指针指向虚函数表',
                '虚函数表在编译时生成，存储在只读数据段',
                '虚函数调用的性能开销通常很小'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '虚函数表存储在哪里？', 
                    options: [
                        { text: '栈' }, 
                        { text: '堆' }, 
                        { text: '只读数据段', correct: true }, 
                        { text: '代码段' }
                    ], 
                    explanation: '虚函数表存储在只读数据段，编译时生成。' 
                },
                { 
                    type: 'single', 
                    question: 'vptr指针存储在哪里？', 
                    options: [
                        { text: '虚函数表中' }, 
                        { text: '对象内部', correct: true }, 
                        { text: '全局变量区' }, 
                        { text: '寄存器中' }
                    ], 
                    explanation: 'vptr指针是对象的隐藏成员，存储在对象内部。' 
                },
                { 
                    type: 'single', 
                    question: '多重继承时，派生类有几个vptr？', 
                    options: [
                        { text: '1个' }, 
                        { text: '每个基类一个', correct: true }, 
                        { text: '取决于虚函数数量' }, 
                        { text: '0个' }
                    ], 
                    explanation: '多重继承时，派生类通常为每个基类维护一个vptr。' 
                },
                { 
                    type: 'single', 
                    question: '虚函数可以内联吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以' }, 
                        { text: '通过对象调用时可以', correct: true }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '通过对象直接调用（非指针/引用）时可以内联，因为编译时确定类型。' 
                },
                { 
                    type: 'single', 
                    question: '虚函数表是在什么时候创建的？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译时', correct: true }, 
                        { text: '链接时' }, 
                        { text: '对象构造时' }
                    ], 
                    explanation: '虚函数表在编译时创建，是类的静态数据。' 
                }
            ]
        },
        {
            id: '11.5',
            title: 'override 与 final 关键字',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## override 与 final 关键字

### override关键字

override关键字用于明确表示派生类的函数覆盖基类的虚函数。

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

class Derived : public Base {
public:
    void func() override {  // 明确表示覆盖
        std::cout << "Derived::func" << std::endl;
    }
};
\`\`\`

### override的优点

1. **编译器检查**：确保确实覆盖了基类虚函数
2. **防止拼写错误**：函数名错误会被编译器捕获
3. **提高可读性**：明确表示覆盖意图

\`\`\`cpp
class Base {
public:
    virtual void processData() {}
};

class Derived : public Base {
public:
    // 没有override：拼写错误不会被检测
    void processDate() {  // 错误！但编译通过
        std::cout << "拼写错误" << std::endl;
    }
    
    // 使用override：编译器报错
    void processDate() override {  // 编译错误！
        std::cout << "会被编译器捕获" << std::endl;
    }
};
\`\`\`

### override的常见错误

\`\`\`cpp
class Base {
public:
    virtual void func(int) {}
    virtual void anotherFunc() const {}
};

class Derived : public Base {
public:
    // 错误1：参数不匹配
    void func(double) override { }  // 错误！没有匹配的基类函数
    
    // 错误2：缺少const
    void anotherFunc() override { }  // 错误！签名不匹配
    
    // 错误3：基类函数不是虚函数
    void nonVirtual() override { }   // 错误！基类没有这个虚函数
};
\`\`\`

### final关键字

final关键字用于防止类被继承或函数被覆盖。

#### 防止类被继承

\`\`\`cpp
class FinalClass final {  // 不能被继承
public:
    void func() {}
};

// 错误！不能继承final类
class Derived : public FinalClass {  // 编译错误
};
\`\`\`

#### 防止函数被覆盖

\`\`\`cpp
class Base {
public:
    virtual void func() final {  // 不能被覆盖
        std::cout << "Base::func" << std::endl;
    }
    
    virtual void anotherFunc() {}
};

class Derived : public Base {
public:
    // 错误！不能覆盖final函数
    void func() override {  // 编译错误
        std::cout << "Derived::func" << std::endl;
    }
    
    // OK：可以覆盖非final函数
    void anotherFunc() override {
        std::cout << "Derived::anotherFunc" << std::endl;
    }
};
\`\`\`

### override与final的组合

\`\`\`cpp
class Base {
public:
    virtual void func1() {}
    virtual void func2() {}
};

class Derived : public Base {
public:
    void func1() override final {  // 覆盖且不允许进一步覆盖
        std::cout << "Derived::func1" << std::endl;
    }
    
    void func2() override {  // 只是覆盖
        std::cout << "Derived::func2" << std::endl;
    }
};

class GrandDerived : public Derived {
public:
    // 错误！不能覆盖final函数
    // void func1() override { }
    
    // OK
    void func2() override {
        std::cout << "GrandDerived::func2" << std::endl;
    }
};
\`\`\`

### 使用场景

#### 使用override的场景

1. **覆盖基类虚函数时**：总是使用override
2. **确保签名正确**：让编译器帮助检查

\`\`\`cpp
class GoodPractice : public Base {
public:
    void func() override {  // 推荐：总是使用override
        // ...
    }
};
\`\`\`

#### 使用final的场景

1. **设计不可变类**：如工具类、配置类
2. **优化性能**：防止虚函数进一步覆盖
3. **安全考虑**：防止恶意继承

\`\`\`cpp
// 工具类不应该被继承
class Utility final {
public:
    static void helper() {}
};

// 关键算法不应该被修改
class CriticalAlgorithm {
public:
    virtual void process() final {  // 不允许修改
        // 关键实现
    }
};
\`\`\`

### 最佳实践

#### 1. 总是使用override关键字

\`\`\`cpp
// 好的实践：总是使用override
class GoodClass : public Base {
public:
    void func1() override {  // 明确表示覆盖
        // ...
    }

    void func2() override final {  // 覆盖且锁定
        // ...
    }
};

// 不好的实践：不使用override
class BadClass : public Base {
public:
    void func1() {  // 容易出错，签名不匹配时不会报错
        // ...
    }
};
\`\`\`

#### 2. 合理使用final关键字

\`\`\`cpp
// final类：设计不可变类
class Utility final {
public:
    static void helper() {}
};

// final方法：保护关键实现
class CriticalAlgorithm {
public:
    virtual void process() final {  // 不允许修改
        // 关键实现
    }
};

// override final：覆盖且锁定
class Intermediate : public Base {
public:
    void criticalMethod() override final {  // 覆盖且不允许进一步覆盖
        // 重要实现
    }
};
\`\`\`

#### 3. 启用编译器警告

\`\`\`cpp
// 现代编译器会警告没有使用override的情况：

// GCC/Clang警告选项
// -Wsuggest-override

// MSVC警告
// /w45221

// 在代码中启用：
// #pragma GCC diagnostic warning "-Wsuggest-override"
\`\`\`

#### 4. 使用final优化性能

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

class Derived : public Base {
public:
    void func() override final {  // final可能允许编译器优化
        // 编译器知道这个函数不会被进一步覆盖
        // 可能进行去虚拟化优化（devirtualization）
    }
};

Derived d;
d.func();  // 编译器可能直接调用，不通过虚函数表
\`\`\`

#### 5. 文档化设计意图

\`\`\`cpp
class Interface {
public:
    // 纯虚函数：必须在派生类实现
    virtual void requiredMethod() = 0;

    // 虚函数：可以覆盖
    virtual void optionalMethod() {}

    // final函数：不允许覆盖
    virtual void fixedMethod() final {}

    virtual ~Interface() = default;
};
\`\`\`

### 常见错误

#### 1. 忘记使用override

\`\`\`cpp
class Base {
public:
    virtual void func(int x) {}
};

class Derived : public Base {
public:
    void func(double x) {  // 错误！签名不匹配，但没有override
        // 这不是覆盖，而是新函数
        // 编译器不会报错
    }
};

// 正确：使用override
class CorrectDerived : public Base {
public:
    void func(double x) override {  // 编译错误！签名不匹配
        // 编译器会报错，帮助发现问题
    }
};
\`\`\`

#### 2. 错误使用final

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

// 错误：final用在非虚函数上
class WrongDerived : public Base {
public:
    void normalMethod() final {  // 错误！final只能用于虚函数
        // ...
    }
};

// 正确：final用在虚函数上
class CorrectDerived : public Base {
public:
    void func() override final {  // OK
        // ...
    }
};
\`\`\`

#### 3. 滥用final类

\`\`\`cpp
// 错误：过度使用final类
class Data final {  // 不推荐：数据类可能需要扩展
public:
    int x, y;
};

// 正确：final类用于真正不应该继承的类
class Singleton final {
private:
    static Singleton* instance;
    Singleton() {}
public:
    static Singleton* getInstance() {
        if (!instance) instance = new Singleton();
        return instance;
    }
    // 禁止复制
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
};
\`\`\`

#### 4. override与访问级别

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

class Derived : public Base {
private:
    void func() override {  // OK：可以改变访问级别
        // 但要注意：通过基类指针仍然可以调用
    }
};

Base* ptr = new Derived();
ptr->func();  // 调用Derived::func，即使它是private！

// 建议：保持访问级别一致，避免混淆
\`\`\`

#### 5. 忽略const限定符

\`\`\`cpp
class Base {
public:
    virtual void func() const {}
};

class Derived : public Base {
public:
    void func() override {  // 错误！缺少const
        // 签名不匹配
    }
};

// 正确：签名完全匹配
class CorrectDerived : public Base {
public:
    void func() const override {  // OK
        // ...
    }
};
\`\`\`

### 深入理解

#### 1. override与编译器检查

\`\`\`cpp
class Base {
public:
    virtual void func(int x) {}
};

class Derived : public Base {
public:
    // 编译器检查：
    // 1. Base中是否有名为func的虚函数
    // 2. 函数签名是否完全匹配
    // 3. 返回类型是否兼容（协变）
    // 4. cv限定符是否一致

    void func(int x) override {  // 所有检查都通过
        // ...
    }
};

// 如果任何检查失败，编译器会报错
\`\`\`

#### 2. final与去虚拟化优化

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

class Derived : public Base {
public:
    void func() override final {}
};

void callFunc(Base* b) {
    b->func();  // 通常通过虚函数表调用
}

Derived d;
callFunc(&d);

// 编译器可能进行去虚拟化优化：
// 1. 如果编译器能确定b指向Derived对象
// 2. 且func是final的
// 3. 可以直接调用Derived::func，不通过虚函数表

// 这可以提高性能，但需要编译器支持
\`\`\`

#### 3. override与函数重载

\`\`\`cpp
class Base {
public:
    virtual void func(int x) {}
    virtual void func(double x) {}
};

class Derived : public Base {
public:
    using Base::func;  // 引入基类的所有重载

    void func(const std::string& s) {  // 新增重载，不需要override
        // ...
    }

    void func(int x) override {  // 覆盖基类版本
        // ...
    }
};
\`\`\`

#### 4. final与虚函数表

\`\`\`cpp
class Base {
public:
    virtual void func() {}
};

class Derived : public Base {
public:
    void func() override final {}
};

// 虚函数表中：
// Base的vtable: [&Base::func]
// Derived的vtable: [&Derived::func]

// final不会改变虚函数表的结构
// 它只是一个编译时检查，防止进一步覆盖
\`\`\`

#### 5. override与多继承

\`\`\`cpp
class Base1 {
public:
    virtual void func1() {}
};

class Base2 {
public:
    virtual void func2() {}
};

class Derived : public Base1, public Base2 {
public:
    void func1() override {  // 覆盖Base1的虚函数
        // ...
    }

    void func2() override {  // 覆盖Base2的虚函数
        // ...
    }
};

// override在多重继承中同样有效
// 编译器会在所有基类中查找匹配的虚函数
\`\`\``,
            examples: [
                {
                    title: 'override检查错误',
                    code: `#include <iostream>
#include <string>

class Document {
public:
    virtual void process(const std::string& data) {
        std::cout << "处理文档: " << data << std::endl;
    }
    
    virtual std::string getType() const {
        return "Document";
    }
    
    virtual void save() {
        std::cout << "保存文档" << std::endl;
    }
};

class PDFDocument : public Document {
public:
    // 正确的覆盖
    void process(const std::string& data) override {
        std::cout << "处理PDF: " << data << std::endl;
    }
    
    // 错误示例（取消注释会编译失败）
    // std::string getType() override {  // 错误！缺少const
    //     return "PDF";
    // }
    
    // 正确的覆盖
    std::string getType() const override {
        return "PDF";
    }
    
    // 错误示例
    // void save(const std::string& path) override {  // 错误！签名不匹配
    //     std::cout << "保存到: " << path << std::endl;
    // }
    
    // 正确的覆盖
    void save() override {
        std::cout << "保存PDF" << std::endl;
    }
};

class WordDocument : public Document {
public:
    void process(const std::string& data) override {
        std::cout << "处理Word: " << data << std::endl;
    }
    
    std::string getType() const override {
        return "Word";
    }
};

int main() {
    Document* docs[] = {
        new Document(),
        new PDFDocument(),
        new WordDocument()
    };
    
    for (auto doc : docs) {
        std::cout << "类型: " << doc->getType() << std::endl;
        doc->process("测试数据");
        doc->save();
        std::cout << std::endl;
        delete doc;
    }
    
    return 0;
}`,
                    description: '展示override关键字如何帮助捕获错误。'
                },
                {
                    title: 'final关键字使用',
                    code: `#include <iostream>
#include <string>

// final类：不能被继承
class Logger final {
public:
    void log(const std::string& message) {
        std::cout << "[LOG] " << message << std::endl;
    }
};

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    
    // final方法：不能被覆盖
    virtual void printInfo() final {
        std::cout << name() << " 面积: " << area() << std::endl;
    }
    
    virtual ~Shape() = default;
};

class Circle : public Shape {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    std::string name() const override {
        return "圆形";
    }
    
    // 错误！不能覆盖final方法
    // void printInfo() override { }
};

class Rectangle : public Shape {
private:
    double width, height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() const override {
        return width * height;
    }
    
    std::string name() const override {
        return "矩形";
    }
};

int main() {
    Logger logger;
    logger.log("程序开始");
    
    Circle circle(5.0);
    Rectangle rect(4.0, 6.0);
    
    circle.printInfo();
    rect.printInfo();
    
    logger.log("程序结束");
    
    return 0;
}`,
                    description: '展示final关键字用于类和方法。'
                }
            ],
            handsOn: {
                title: '使用override和final',
                description: '修复代码中的错误，正确使用override和final关键字。',
                initialCode: `#include <iostream>
#include <string>

class Vehicle {
public:
    virtual void start() {
        std::cout << "车辆启动" << std::endl;
    }
    
    virtual void stop() {
        std::cout << "车辆停止" << std::endl;
    }
    
    virtual std::string getType() {
        return "Vehicle";
    }
    
    virtual ~Vehicle() = default;
};

class Car : public Vehicle {
public:
    // TODO: 添加override关键字
    void start() {
        std::cout << "汽车启动引擎" << std::endl;
    }
    
    // TODO: 添加override关键字
    void stop() {
        std::cout << "汽车熄火" << std::endl;
    }
    
    // TODO: 添加override关键字（注意：这里缺少const）
    std::string getType() {
        return "Car";
    }
};

class ElectricCar : public Car {
public:
    // TODO: 添加override关键字
    void start() {
        std::cout << "电动汽车静默启动" << std::endl;
    }
    
    // TODO: 添加override和final关键字，防止进一步覆盖
    void stop() {
        std::cout << "电动汽车停止" << std::endl;
    }
};

// TODO: 尝试继承ElectricCar并覆盖stop方法
// 会发现编译错误（因为stop是final）

int main() {
    Vehicle* vehicles[] = {
        new Vehicle(),
        new Car(),
        new ElectricCar()
    };
    
    for (auto v : vehicles) {
        std::cout << "类型: " << v->getType() << std::endl;
        v->start();
        v->stop();
        std::cout << std::endl;
        delete v;
    }
    
    return 0;
}`,
                expectedOutput: `类型: Vehicle
车辆启动
车辆停止

类型: Car
汽车启动引擎
汽车熄火

类型: Car
电动汽车静默启动
电动汽车停止`,
                solutionRegex: 'override|final',
                hint: '覆盖虚函数时添加override，防止进一步覆盖时添加final',
                xp: 140
            },
            references: [
                { title: 'override与final', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '现代C++特性', book: 'Effective Modern C++', chapter: '条款12-14' }
            ],
            assistantTips: [
                '总是使用override关键字覆盖虚函数',
                'override让编译器帮助检查签名匹配',
                'final防止类被继承或函数被覆盖',
                'override和final可以一起使用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'override关键字的作用是？', 
                    options: [
                        { text: '声明虚函数' }, 
                        { text: '明确表示覆盖基类虚函数', correct: true }, 
                        { text: '防止函数被覆盖' }, 
                        { text: '声明纯虚函数' }
                    ], 
                    explanation: 'override明确表示派生函数覆盖基类虚函数，让编译器检查。' 
                },
                { 
                    type: 'single', 
                    question: 'final关键字可以用于？', 
                    options: [
                        { text: '只能用于类' }, 
                        { text: '只能用于函数' }, 
                        { text: '类和函数都可以', correct: true }, 
                        { text: '只能用于变量' }
                    ], 
                    explanation: 'final可以用于类（防止继承）和虚函数（防止覆盖）。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的？', 
                    options: [
                        { text: 'void func() override { }' }, 
                        { text: 'virtual void func() override { }', correct: true }, 
                        { text: 'override void func() { }' }, 
                        { text: 'void override func() { }' }
                    ], 
                    explanation: 'override放在函数声明的最后，virtual在前面。' 
                },
                { 
                    type: 'single', 
                    question: '如果函数签名不匹配，使用override会？', 
                    options: [
                        { text: '编译通过' }, 
                        { text: '编译错误', correct: true }, 
                        { text: '运行时错误' }, 
                        { text: '警告但通过' }
                    ], 
                    explanation: 'override让编译器检查签名，不匹配会产生编译错误。' 
                },
                { 
                    type: 'single', 
                    question: 'override final表示什么？', 
                    options: [
                        { text: '声明纯虚函数' }, 
                        { text: '覆盖基类函数且不允许进一步覆盖', correct: true }, 
                        { text: '覆盖基类函数' }, 
                        { text: '语法错误' }
                    ], 
                    explanation: 'override final表示覆盖基类函数，且派生类不能进一步覆盖。' 
                }
            ]
        },
        {
            id: '11.6',
            title: '纯虚函数与抽象基类',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 纯虚函数与抽象基类

### 纯虚函数

纯虚函数是没有实现的虚函数，使用=0声明：

\`\`\`cpp
class Shape {
public:
    virtual double area() const = 0;  // 纯虚函数
    virtual double perimeter() const = 0;
};
\`\`\`

### 抽象类

包含至少一个纯虚函数的类是抽象类：
- 不能实例化
- 可以有构造函数、析构函数、数据成员
- 可以有已实现的成员函数

\`\`\`cpp
class Shape {
protected:
    std::string name;
    
public:
    Shape(const std::string& n) : name(n) {}
    
    // 纯虚函数
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    
    // 已实现的函数
    void printName() const {
        std::cout << "图形: " << name << std::endl;
    }
    
    virtual ~Shape() = default;
};

// Shape s;  // 错误！抽象类不能实例化
\`\`\`

### 具体类

派生类必须实现所有纯虚函数才能成为具体类：

\`\`\`cpp
class Circle : public Shape {
private:
    double radius;
    
public:
    Circle(double r) : Shape("圆形"), radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    double perimeter() const override {
        return 2 * 3.14159 * radius;
    }
};

Circle c(5.0);  // OK：Circle是具体类
\`\`\`

### 纯虚函数的实现

纯虚函数可以有实现，但只能在类外定义：

\`\`\`cpp
class Base {
public:
    virtual void func() = 0;  // 纯虚函数声明
};

// 纯虚函数的实现
void Base::func() {
    std::cout << "纯虚函数的默认实现" << std::endl;
}

class Derived : public Base {
public:
    void func() override {
        Base::func();  // 调用基类实现
        std::cout << "派生类实现" << std::endl;
    }
};
\`\`\`

### 抽象类作为接口

抽象类常用于定义接口：

\`\`\`cpp
// 接口类（所有函数都是纯虚函数）
class IRenderer {
public:
    virtual void initialize() = 0;
    virtual void render() = 0;
    virtual void cleanup() = 0;
    virtual ~IRenderer() = default;
};

// 具体实现
class OpenGLRenderer : public IRenderer {
public:
    void initialize() override {
        std::cout << "初始化OpenGL" << std::endl;
    }
    
    void render() override {
        std::cout << "OpenGL渲染" << std::endl;
    }
    
    void cleanup() override {
        std::cout << "清理OpenGL资源" << std::endl;
    }
};

class DirectXRenderer : public IRenderer {
public:
    void initialize() override {
        std::cout << "初始化DirectX" << std::endl;
    }
    
    void render() override {
        std::cout << "DirectX渲染" << std::endl;
    }
    
    void cleanup() override {
        std::cout << "清理DirectX资源" << std::endl;
    }
};
\`\`\`

### 抽象类的使用场景

1. **定义接口**：规定派生类必须实现的功能
2. **代码复用**：提供公共实现
3. **多态基础**：通过基类指针操作派生类

\`\`\`cpp
// 使用抽象类指针
void renderScene(IRenderer& renderer) {
    renderer.initialize();
    renderer.render();
    renderer.cleanup();
}

int main() {
    OpenGLRenderer gl;
    DirectXRenderer dx;
    
    renderScene(gl);  // 使用OpenGL渲染
    renderScene(dx);  // 使用DirectX渲染
}
\`\`\`

### 纯虚析构函数

纯虚析构函数必须有定义：

\`\`\`cpp
class AbstractBase {
public:
    virtual ~AbstractBase() = 0;  // 纯虚析构函数
};

// 必须提供实现
AbstractBase::~AbstractBase() {
    std::cout << "纯虚析构函数调用" << std::endl;
}

class Concrete : public AbstractBase {
public:
    ~Concrete() override {
        std::cout << "Concrete析构" << std::endl;
    }
};
\`\`\`

### 抽象类的设计原则

\`\`\`cpp
// 好的设计：清晰的接口
class Database {
public:
    virtual bool connect(const std::string& connectionString) = 0;
    virtual bool disconnect() = 0;
    virtual bool executeQuery(const std::string& query) = 0;
    virtual ~Database() = default;
};

// 不好的设计：接口不清晰
class BadDatabase {
public:
    virtual void func1() = 0;
    virtual void func2() = 0;
    // 函数名不明确
};
\`\`\`

### 抽象类与具体类的对比

| 特性 | 抽象类 | 具体类 |
|------|--------|--------|
| 实例化 | 不能 | 可以 |
| 纯虚函数 | 至少一个 | 没有 |
| 用途 | 定义接口 | 创建对象 |
| 派生类要求 | 必须实现纯虚函数 | 无特殊要求 |`,
            examples: [
                {
                    title: '抽象类实现接口',
                    code: `#include <iostream>
#include <string>
#include <memory>

// 抽象接口
class Serializable {
public:
    virtual std::string serialize() const = 0;
    virtual bool deserialize(const std::string& data) = 0;
    virtual ~Serializable() = default;
};

// 具体类：用户信息
class UserInfo : public Serializable {
private:
    std::string name;
    int age;
    
public:
    UserInfo(const std::string& n = "", int a = 0) 
        : name(n), age(a) {}
    
    std::string serialize() const override {
        return "name:" + name + ";age:" + std::to_string(age);
    }
    
    bool deserialize(const std::string& data) override {
        // 简单解析
        size_t namePos = data.find("name:");
        size_t agePos = data.find(";age:");
        
        if (namePos == std::string::npos || agePos == std::string::npos) {
            return false;
        }
        
        name = data.substr(5, agePos - 5);
        age = std::stoi(data.substr(agePos + 5));
        return true;
    }
    
    void display() const {
        std::cout << "姓名: " << name << ", 年龄: " << age << std::endl;
    }
};

// 具体类：产品信息
class ProductInfo : public Serializable {
private:
    std::string productName;
    double price;
    
public:
    ProductInfo(const std::string& n = "", double p = 0.0)
        : productName(n), price(p) {}
    
    std::string serialize() const override {
        return "product:" + productName + ";price:" + std::to_string(price);
    }
    
    bool deserialize(const std::string& data) override {
        size_t productPos = data.find("product:");
        size_t pricePos = data.find(";price:");
        
        if (productPos == std::string::npos || pricePos == std::string::npos) {
            return false;
        }
        
        productName = data.substr(8, pricePos - 8);
        price = std::stod(data.substr(pricePos + 7));
        return true;
    }
    
    void display() const {
        std::cout << "产品: " << productName << ", 价格: " << price << std::endl;
    }
};

int main() {
    UserInfo user("张三", 25);
    ProductInfo product("笔记本电脑", 5999.99);
    
    std::cout << "=== 用户信息 ===" << std::endl;
    user.display();
    std::cout << "序列化: " << user.serialize() << std::endl;
    
    std::cout << "\\n=== 产品信息 ===" << std::endl;
    product.display();
    std::cout << "序列化: " << product.serialize() << std::endl;
    
    return 0;
}`,
                    description: '使用抽象类定义序列化接口。'
                },
                {
                    title: '纯虚函数的实现',
                    code: `#include <iostream>
#include <string>

// 抽象基类
class Plugin {
public:
    virtual void execute() = 0;  // 纯虚函数
    
    // 纯虚函数可以有默认实现
    virtual std::string getName() const = 0;
    
    virtual ~Plugin() = default;
};

// 纯虚函数的默认实现
std::string Plugin::getName() const {
    return "未命名插件";
}

// 具体插件1
class AudioPlugin : public Plugin {
public:
    void execute() override {
        std::cout << "执行音频处理插件" << std::endl;
    }
    
    std::string getName() const override {
        return "音频处理插件";
    }
};

// 具体插件2：使用默认名称
class VideoPlugin : public Plugin {
public:
    void execute() override {
        std::cout << "执行视频处理插件" << std::endl;
    }
    
    // 不覆盖getName，使用默认实现
};

// 具体插件3：部分使用默认
class ImagePlugin : public Plugin {
public:
    void execute() override {
        std::cout << "执行图像处理插件" << std::endl;
    }
    
    std::string getName() const override {
        // 可以调用基类实现
        return Plugin::getName() + " (图像版)";
    }
};

int main() {
    AudioPlugin audio;
    VideoPlugin video;
    ImagePlugin image;
    
    Plugin* plugins[] = {&audio, &video, &image};
    
    for (auto plugin : plugins) {
        std::cout << "插件名称: " << plugin->getName() << std::endl;
        plugin->execute();
        std::cout << std::endl;
    }
    
    return 0;
}`,
                    description: '展示纯虚函数可以有默认实现。'
                }
            ],
            handsOn: {
                title: '实现抽象类层次',
                description: '创建一个抽象基类和多个具体派生类。',
                initialCode: `#include <iostream>
#include <string>
#include <memory>

// TODO: 创建抽象基类MediaPlayer
class MediaPlayer {
public:
    // TODO: 声明纯虚函数play()
    
    // TODO: 声明纯虚函数pause()
    
    // TODO: 声明纯虚函数stop()
    
    // TODO: 声明虚析构函数
};

// TODO: 实现MP3Player类
class MP3Player {
private:
    std::string currentSong;
    
public:
    MP3Player() : currentSong("") {}
    
    // TODO: 实现play，输出"播放MP3: " << currentSong
    
    // TODO: 实现pause，输出"暂停MP3播放"
    
    // TODO: 实现stop，输出"停止MP3播放"
    
    void loadSong(const std::string& song) {
        currentSong = song;
    }
};

// TODO: 实现VideoPlayer类
class VideoPlayer {
private:
    std::string currentVideo;
    
public:
    VideoPlayer() : currentVideo("") {}
    
    // TODO: 实现play，输出"播放视频: " << currentVideo
    
    // TODO: 实现pause，输出"暂停视频播放"
    
    // TODO: 实现stop，输出"停止视频播放"
    
    void loadVideo(const std::string& video) {
        currentVideo = video;
    }
};

void testPlayer(MediaPlayer& player, const std::string& name) {
    std::cout << "=== 测试" << name << " ===" << std::endl;
    player.play();
    player.pause();
    player.stop();
    std::cout << std::endl;
}

int main() {
    MP3Player mp3;
    mp3.loadSong("晴天.mp3");
    
    VideoPlayer video;
    video.loadVideo("电影.mp4");
    
    testPlayer(mp3, "MP3播放器");
    testPlayer(video, "视频播放器");
    
    return 0;
}`,
                expectedOutput: `=== 测试MP3播放器 ===
播放MP3: 晴天.mp3
暂停MP3播放
停止MP3播放

=== 测试视频播放器 ===
播放视频: 电影.mp4
暂停视频播放
停止视频播放`,
                solutionRegex: 'virtual.*= 0|override',
                hint: '抽象类使用=0声明纯虚函数，派生类使用override实现',
                xp: 160
            },
            references: [
                { title: '抽象类', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '接口设计', book: 'Effective C++', chapter: '条款34-40' }
            ],
            assistantTips: [
                '抽象类包含至少一个纯虚函数',
                '抽象类不能实例化',
                '派生类必须实现所有纯虚函数才能实例化',
                '纯虚函数可以有默认实现'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '抽象类的特点是？', 
                    options: [
                        { text: '可以实例化' }, 
                        { text: '不能实例化', correct: true }, 
                        { text: '没有成员函数' }, 
                        { text: '没有数据成员' }
                    ], 
                    explanation: '抽象类包含纯虚函数，不能直接实例化。' 
                },
                { 
                    type: 'single', 
                    question: '纯虚函数的声明方式是？', 
                    options: [
                        { text: 'virtual void func();' }, 
                        { text: 'virtual void func() = 0;', correct: true }, 
                        { text: 'abstract void func();' }, 
                        { text: 'pure virtual void func();' }
                    ], 
                    explanation: '纯虚函数使用=0声明。' 
                },
                { 
                    type: 'single', 
                    question: '派生类要成为具体类，必须？', 
                    options: [
                        { text: '继承所有基类函数' }, 
                        { text: '实现所有纯虚函数', correct: true }, 
                        { text: '添加新成员' }, 
                        { text: '定义构造函数' }
                    ], 
                    explanation: '派生类必须实现所有纯虚函数才能实例化。' 
                },
                { 
                    type: 'single', 
                    question: '纯虚函数可以有实现吗？', 
                    options: [
                        { text: '不可以' }, 
                        { text: '可以，在类外定义', correct: true }, 
                        { text: '只能在类内定义' }, 
                        { text: '取决于编译器' }
                    ], 
                    explanation: '纯虚函数可以有实现，但必须在类外定义。' 
                },
                { 
                    type: 'single', 
                    question: '抽象类的主要用途是？', 
                    options: [
                        { text: '创建对象' }, 
                        { text: '定义接口和实现多态', correct: true }, 
                        { text: '提高性能' }, 
                        { text: '减少代码量' }
                    ], 
                    explanation: '抽象类用于定义接口，作为多态的基础。' 
                }
            ]
        },
        {
            id: '11.7',
            title: '继承中的构造函数与析构函数调用顺序',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 继承中的构造函数与析构函数调用顺序

### 构造函数调用顺序

在继承关系中，构造函数的调用顺序是：
1. **基类构造函数**（从最远的基类开始）
2. **成员对象的构造函数**（按声明顺序）
3. **派生类构造函数体**

\`\`\`cpp
class Base {
public:
    Base() { std::cout << "Base构造" << std::endl; }
};

class Member {
public:
    Member() { std::cout << "Member构造" << std::endl; }
};

class Derived : public Base {
private:
    Member member;
public:
    Derived() { std::cout << "Derived构造" << std::endl; }
};

int main() {
    Derived d;
    // 输出：
    // Base构造
    // Member构造
    // Derived构造
}
\`\`\`

### 析构函数调用顺序

析构函数的调用顺序与构造函数相反：
1. **派生类析构函数**
2. **成员对象的析构函数**（按声明逆序）
3. **基类析构函数**

\`\`\`cpp
class Base {
public:
    ~Base() { std::cout << "Base析构" << std::endl; }
};

class Member {
public:
    ~Member() { std::cout << "Member析构" << std::endl; }
};

class Derived : public Base {
private:
    Member member;
public:
    ~Derived() { std::cout << "Derived析构" << std::endl; }
};

int main() {
    Derived d;
    // 析构时输出：
    // Derived析构
    // Member析构
    // Base析构
}
\`\`\`

### 多层继承的构造顺序

\`\`\`cpp
class A { public: A() { std::cout << "A" << std::endl; } };
class B : public A { public: B() { std::cout << "B" << std::endl; } };
class C : public B { public: C() { std::cout << "C" << std::endl; } };

int main() {
    C c;
    // 输出：A B C
}
\`\`\`

### 多重继承的构造顺序

\`\`\`cpp
class Base1 { public: Base1() { std::cout << "Base1" << std::endl; } };
class Base2 { public: Base2() { std::cout << "Base2" << std::endl; } };
class Derived : public Base1, public Base2 {
public:
    Derived() { std::cout << "Derived" << std::endl; }
};

int main() {
    Derived d;
    // 输出：Base1 Base2 Derived
    // 按继承声明顺序
}
\`\`\`

### 派生类构造函数

派生类构造函数必须调用基类构造函数：

\`\`\`cpp
class Base {
protected:
    int value;
public:
    Base(int v) : value(v) {
        std::cout << "Base构造: " << value << std::endl;
    }
};

class Derived : public Base {
private:
    double extra;
public:
    // 必须调用基类构造函数
    Derived(int v, double e) : Base(v), extra(e) {
        std::cout << "Derived构造: " << extra << std::endl;
    }
};

int main() {
    Derived d(10, 3.14);
    // 输出：
    // Base构造: 10
    // Derived构造: 3.14
}
\`\`\`

### 成员初始化列表

\`\`\`cpp
class Base {
protected:
    std::string name;
public:
    Base(const std::string& n) : name(n) {}
};

class Member {
private:
    int value;
public:
    Member(int v) : value(v) {}
};

class Derived : public Base {
private:
    Member member1;
    Member member2;
    
public:
    // 初始化顺序：Base -> member1 -> member2 -> Derived
    Derived(const std::string& n, int v1, int v2)
        : Base(n), member1(v1), member2(v2) {
    }
};
\`\`\`

### 继承构造函数（C++11）

使用using声明继承基类构造函数：

\`\`\`cpp
class Base {
public:
    Base(int x) { std::cout << "Base(int)" << std::endl; }
    Base(int x, int y) { std::cout << "Base(int, int)" << std::endl; }
    Base(const std::string& s) { std::cout << "Base(string)" << std::endl; }
};

class Derived : public Base {
public:
    using Base::Base;  // 继承所有构造函数
    
    // 可以添加新的构造函数
    Derived(double d) : Base(0) {
        std::cout << "Derived(double)" << std::endl;
    }
};

int main() {
    Derived d1(10);          // 调用Base(int)
    Derived d2(10, 20);      // 调用Base(int, int)
    Derived d3("hello");     // 调用Base(string)
    Derived d4(3.14);        // 调用Derived(double)
}
\`\`\`

### 委托构造函数

\`\`\`cpp
class Base {
private:
    int x, y;
public:
    Base(int a, int b) : x(a), y(b) {
        std::cout << "主构造函数" << std::endl;
    }
    
    // 委托给Base(int, int)
    Base(int a) : Base(a, 0) {
        std::cout << "委托构造函数" << std::endl;
    }
    
    // 委托给Base(int)
    Base() : Base(0) {
        std::cout << "默认构造函数" << std::endl;
    }
};
\`\`\`

### 构造和析构中的虚函数

在构造和析构函数中调用虚函数要小心：

\`\`\`cpp
class Base {
public:
    Base() {
        func();  // 调用Base::func，不是Derived::func！
    }
    
    virtual void func() {
        std::cout << "Base::func" << std::endl;
    }
};

class Derived : public Base {
public:
    void func() override {
        std::cout << "Derived::func" << std::endl;
    }
};

int main() {
    Derived d;  // 输出：Base::func
}
\`\`\`

**原因**：在基类构造函数执行时，派生类部分尚未构造，虚函数表指针指向基类的虚函数表。

### 最佳实践

#### 1. 理解构造/析构顺序

\`\`\`cpp
// 构造顺序：基类 -> 成员 -> 派生类
// 析构顺序：派生类 -> 成员 -> 基类

class GoodExample : public Base {
private:
    Member member;
public:
    GoodExample() : Base(), member() {
        // 构造顺序：Base -> member -> GoodExample
    }

    ~GoodExample() {
        // 析构顺序：GoodExample -> member -> Base
    }
};
\`\`\`

#### 2. 使用初始化列表

\`\`\`cpp
// 推荐：使用初始化列表
class GoodDerived : public Base {
private:
    Member member;
public:
    GoodDerived() : Base(), member() {  // 明确初始化顺序
        // ...
    }
};

// 不推荐：在构造函数体内赋值
class BadDerived : public Base {
private:
    Member member;
public:
    BadDerived() {
        // Base默认构造，然后member默认构造
        // 效率较低
    }
};
\`\`\`

#### 3. 避免在构造/析构中调用虚函数

\`\`\`cpp
class Base {
public:
    Base() {
        // init();  // 不推荐：调用虚函数
        baseInit();  // 推荐：调用非虚函数
    }

    virtual void init() { /* ... */ }

    void baseInit() { /* 非虚函数，安全 */ }
};
\`\`\`

#### 4. 使用继承构造函数简化代码

\`\`\`cpp
class Base {
public:
    Base(int x) {}
    Base(int x, int y) {}
    Base(const std::string& s) {}
};

class Derived : public Base {
public:
    using Base::Base;  // 继承所有构造函数

    // 只需要添加新的构造函数
    Derived(double d) : Base(0) {}
};
\`\`\`

#### 5. 确保析构函数正确调用

\`\`\`cpp
class Base {
public:
    virtual ~Base() = default;  // 虚析构函数
};

class Derived : public Base {
private:
    int* data;
public:
    ~Derived() {
        delete data;  // 正确清理资源
    }
};

Base* ptr = new Derived();
delete ptr;  // 正确调用Derived析构函数
\`\`\`

### 常见错误

#### 1. 忘记调用基类构造函数

\`\`\`cpp
class Base {
protected:
    int value;
public:
    Base(int v) : value(v) {}
};

class Derived : public Base {
public:
    Derived(int v) {  // 错误！没有调用Base构造函数
        // Base部分未初始化
    }
};

// 正确：调用基类构造函数
class CorrectDerived : public Base {
public:
    Derived(int v) : Base(v) {  // OK
        // ...
    }
};
\`\`\`

#### 2. 初始化列表顺序错误

\`\`\`cpp
class Derived : public Base {
private:
    Member member1;
    Member member2;
public:
    // 初始化列表顺序不影响实际初始化顺序！
    Derived() : member2(), Base(), member1() {  // 容易混淆
        // 实际顺序：Base -> member1 -> member2
    }
};

// 推荐：初始化列表顺序与声明顺序一致
class BetterDerived : public Base {
private:
    Member member1;
    Member member2;
public:
    BetterDerived() : Base(), member1(), member2() {  // 清晰
        // ...
    }
};
\`\`\`

#### 3. 在构造函数中调用虚函数

\`\`\`cpp
class Base {
public:
    Base() {
        init();  // 调用Base::init，不是Derived::init
    }

    virtual void init() {
        std::cout << "Base init" << std::endl;
    }
};

class Derived : public Base {
public:
    void init() override {
        std::cout << "Derived init" << std::endl;
    }
};

Derived d;  // 输出"Base init"，不是"Derived init"
\`\`\`

#### 4. 析构函数中抛出异常

\`\`\`cpp
class BadClass {
public:
    ~BadClass() {
        throw std::runtime_error("Error");  // 危险！
    }
};

// 正确：捕获并处理异常
class GoodClass {
public:
    ~GoodClass() noexcept {
        try {
            cleanup();
        } catch (...) {
            // 捕获并处理异常，不让它传播
        }
    }
};
\`\`\`

#### 5. 循环依赖

\`\`\`cpp
class A {
public:
    B* b;  // 需要B的定义
};

class B {
public:
    A* a;  // 需要A的定义
};

// 解决方案：使用前向声明
class B;  // 前向声明

class A {
public:
    B* b;
};

class B {
public:
    A* a;
};
\`\`\`

### 深入理解

#### 1. 构造函数的执行过程

\`\`\`cpp
class Derived : public Base {
private:
    Member member;
public:
    Derived() : Base(), member() {
        // 构造函数体
    }
};

// 编译器生成的伪代码：
// Derived() {
//     // 1. 调用Base构造函数
//     Base::Base();
//
//     // 2. 构造成员对象
//     member.Member::Member();
//
//     // 3. 执行构造函数体
//     // ...
// }
\`\`\`

#### 2. 析构函数的执行过程

\`\`\`cpp
class Derived : public Base {
private:
    Member member;
public:
    ~Derived() {
        // 析构函数体
    }
};

// 编译器生成的伪代码：
// ~Derived() {
//     // 1. 执行析构函数体
//     // ...
//
//     // 2. 析构成员对象（逆序）
//     member.Member::~Member();
//
//     // 3. 调用Base析构函数
//     Base::~Base();
// }
\`\`\`

#### 3. 继承构造函数的实现

\`\`\`cpp
class Base {
public:
    Base(int x) {}
    Base(int x, int y) {}
};

class Derived : public Base {
public:
    using Base::Base;  // 编译器生成：
    // Derived(int x) : Base(x) {}
    // Derived(int x, int y) : Base(x, y) {}
};

// 注意：继承构造函数不会继承默认参数
\`\`\`

#### 4. 委托构造函数

\`\`\`cpp
class Example {
public:
    Example(int x, int y) : x_(x), y_(y) {
        // 主构造函数
    }

    Example(int x) : Example(x, 0) {  // 委托给主构造函数
        // 委托构造函数
    }

    Example() : Example(0) {  // 委托给Example(int)
        // 默认构造函数
    }

private:
    int x_, y_;
};

// 注意：委托构造函数不能再初始化成员
\`\`\`

#### 5. 构造/析构中的虚函数机制

\`\`\`cpp
class Base {
public:
    Base() {
        // 此时vptr指向Base的虚函数表
        func();  // 调用Base::func
    }

    virtual void func() {}
};

class Derived : public Base {
public:
    Derived() : Base() {
        // Base构造完成后，vptr更新为Derived的虚函数表
        func();  // 调用Derived::func
    }

    void func() override {}
};

// 析构时相反：
// Derived析构函数开始时，vptr指向Derived的虚函数表
// Base析构函数开始时，vptr指向Base的虚函数表
\`\`\``,
            examples: [
                {
                    title: '构造析构顺序追踪',
                    code: `#include <iostream>
#include <string>

class A {
public:
    A() { std::cout << "A构造" << std::endl; }
    ~A() { std::cout << "A析构" << std::endl; }
};

class B {
public:
    B() { std::cout << "B构造" << std::endl; }
    ~B() { std::cout << "B析构" << std::endl; }
};

class C {
public:
    C() { std::cout << "C构造" << std::endl; }
    ~C() { std::cout << "C析构" << std::endl; }
};

class Base {
private:
    A a;
public:
    Base() { std::cout << "Base构造" << std::endl; }
    ~Base() { std::cout << "Base析构" << std::endl; }
};

class Derived : public Base {
private:
    B b;
    C c;
public:
    Derived() { std::cout << "Derived构造" << std::endl; }
    ~Derived() { std::cout << "Derived析构" << std::endl; }
};

int main() {
    std::cout << "=== 创建对象 ===" << std::endl;
    {
        Derived d;
    }
    std::cout << "\\n=== 对象已销毁 ===" << std::endl;
    
    return 0;
}`,
                    description: '追踪完整的构造和析构顺序。'
                },
                {
                    title: '继承构造函数',
                    code: `#include <iostream>
#include <string>

class Person {
protected:
    std::string name;
    int age;
    
public:
    Person(const std::string& n, int a) : name(n), age(a) {
        std::cout << "Person构造: " << name << std::endl;
    }
    
    Person(const std::string& n) : Person(n, 0) {  // 委托构造
        std::cout << "Person(string)委托构造" << std::endl;
    }
    
    void display() const {
        std::cout << "姓名: " << name << ", 年龄: " << age << std::endl;
    }
};

class Student : public Person {
private:
    std::string school;
    
public:
    // 继承基类构造函数
    using Person::Person;
    
    // 新增构造函数
    Student(const std::string& n, int a, const std::string& s)
        : Person(n, a), school(s) {
        std::cout << "Student构造: " << school << std::endl;
    }
    
    void display() const {
        Person::display();
        std::cout << "学校: " << school << std::endl;
    }
};

int main() {
    std::cout << "=== 使用继承的构造函数 ===" << std::endl;
    Student s1("张三", 20);
    s1.display();
    
    std::cout << "\\n=== 使用派生类自己的构造函数 ===" << std::endl;
    Student s2("李四", 22, "清华大学");
    s2.display();
    
    return 0;
}`,
                    description: '展示继承构造函数和委托构造函数。'
                }
            ],
            handsOn: {
                title: '追踪构造析构顺序',
                description: '创建多层继承结构，追踪构造和析构的调用顺序。',
                initialCode: `#include <iostream>
#include <string>

// TODO: 创建类A，构造输出"A构造"，析构输出"A析构"
class A {
public:
    A() { std::cout << "A构造" << std::endl; }
    ~A() { std::cout << "A析构" << std::endl; }
};

// TODO: 创建类B，构造输出"B构造"，析构输出"B析构"
class B {
public:
    B() { std::cout << "B构造" << std::endl; }
    ~B() { std::cout << "B析构" << std::endl; }
};

// TODO: 创建类Base
// 包含私有成员A a
// 构造输出"Base构造"
// 析构输出"Base析构"

// TODO: 创建类Derived，继承Base
// 包含私有成员B b
// 构造输出"Derived构造"
// 析构输出"Derived析构"

// TODO: 创建类GrandDerived，继承Derived
// 构造输出"GrandDerived构造"
// 析构输出"GrandDerived析构"

int main() {
    std::cout << "=== 创建GrandDerived对象 ===" << std::endl;
    {
        // TODO: 创建GrandDerived对象
    }
    std::cout << "\\n=== 对象已销毁 ===" << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 创建GrandDerived对象 ===
A构造
Base构造
B构造
Derived构造
GrandDerived构造

=== 对象已销毁 ===
GrandDerived析构
Derived析构
B析构
Base析构
A析构`,
                solutionRegex: 'class.*: public|A构造|B构造|Base构造|Derived构造',
                hint: '构造顺序：基类->成员->派生类；析构顺序相反',
                xp: 150
            },
            references: [
                { title: '构造与析构', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '继承构造函数', book: 'Effective Modern C++', chapter: '条款19' }
            ],
            assistantTips: [
                '构造顺序：基类 -> 成员对象 -> 派生类',
                '析构顺序与构造相反',
                '构造函数中调用虚函数不会多态',
                '使用using继承基类构造函数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '派生类构造函数首先调用什么？', 
                    options: [
                        { text: '自己的构造函数体' }, 
                        { text: '基类构造函数', correct: true }, 
                        { text: '成员对象构造函数' }, 
                        { text: '析构函数' }
                    ], 
                    explanation: '派生类构造函数首先调用基类构造函数。' 
                },
                { 
                    type: 'single', 
                    question: '析构函数的调用顺序是？', 
                    options: [
                        { text: '与构造顺序相同' }, 
                        { text: '与构造顺序相反', correct: true }, 
                        { text: '随机顺序' }, 
                        { text: '只调用派生类析构' }
                    ], 
                    explanation: '析构顺序与构造顺序相反：派生类->成员->基类。' 
                },
                { 
                    type: 'single', 
                    question: '在基类构造函数中调用虚函数会？', 
                    options: [
                        { text: '调用派生类版本' }, 
                        { text: '调用基类版本', correct: true }, 
                        { text: '编译错误' }, 
                        { text: '运行时错误' }
                    ], 
                    explanation: '基类构造时派生类部分未构造，虚函数调用基类版本。' 
                },
                { 
                    type: 'single', 
                    question: 'using Base::Base的作用是？', 
                    options: [
                        { text: '删除基类构造函数' }, 
                        { text: '继承基类构造函数', correct: true }, 
                        { text: '隐藏基类构造函数' }, 
                        { text: '覆盖基类构造函数' }
                    ], 
                    explanation: 'using声明继承基类的所有构造函数。' 
                },
                { 
                    type: 'single', 
                    question: '成员对象的构造顺序由什么决定？', 
                    options: [
                        { text: '初始化列表顺序' }, 
                        { text: '声明顺序', correct: true }, 
                        { text: '字母顺序' }, 
                        { text: '随机' }
                    ], 
                    explanation: '成员对象按声明顺序构造，与初始化列表顺序无关。' 
                }
            ]
        },
        {
            id: '11.8',
            title: '虚析构函数的重要性',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 虚析构函数的重要性

### 问题：非虚析构函数

当通过基类指针删除派生类对象时，如果析构函数不是虚函数，会导致问题：

\`\`\`cpp
class Base {
public:
    ~Base() { std::cout << "Base析构" << std::endl; }
};

class Derived : public Base {
private:
    int* data;
public:
    Derived() : data(new int(100)) {}
    ~Derived() {
        delete data;
        std::cout << "Derived析构" << std::endl;
    }
};

int main() {
    Base* ptr = new Derived();
    delete ptr;  // 只调用Base析构！Derived析构不被调用
    // 内存泄漏！data没有被释放
}
\`\`\`

### 解决方案：虚析构函数

将基类析构函数声明为虚函数：

\`\`\`cpp
class Base {
public:
    virtual ~Base() { std::cout << "Base析构" << std::endl; }
};

class Derived : public Base {
private:
    int* data;
public:
    Derived() : data(new int(100)) {}
    ~Derived() override {
        delete data;
        std::cout << "Derived析构" << std::endl;
    }
};

int main() {
    Base* ptr = new Derived();
    delete ptr;  // 正确调用Derived析构，然后Base析构
}
\`\`\`

### 虚析构函数的工作原理

\`\`\`cpp
Base* ptr = new Derived();
delete ptr;

// 编译器生成的代码：
// 1. 通过vptr找到Derived的析构函数
// 2. 调用~Derived()
// 3. ~Derived()自动调用~Base()
\`\`\`

### 何时需要虚析构函数？

**规则**：如果类可能被继承，且会通过基类指针删除派生类对象，则析构函数应该是虚函数。

\`\`\`cpp
// 需要虚析构函数
class Shape {
public:
    virtual double area() = 0;
    virtual ~Shape() = default;  // 虚析构函数
};

// 不需要虚析构函数
class MathUtils {
public:
    static int add(int a, int b) { return a + b; }
    // 不会被继承，不需要虚析构函数
};
\`\`\`

### =default和=delete

\`\`\`cpp
class Base {
public:
    virtual ~Base() = default;  // 默认虚析构函数
};

class NonCopyable {
public:
    virtual ~NonCopyable() = default;
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable& operator=(const NonCopyable&) = delete;
};
\`\`\`

### 纯虚析构函数

纯虚析构函数使类成为抽象类，但必须有定义：

\`\`\`cpp
class AbstractBase {
public:
    virtual ~AbstractBase() = 0;  // 纯虚析构函数
};

// 必须提供定义
AbstractBase::~AbstractBase() {
    std::cout << "纯虚析构函数" << std::endl;
}

class Concrete : public AbstractBase {
public:
    ~Concrete() override {
        std::cout << "Concrete析构" << std::endl;
    }
};
\`\`\`

### 析构函数的异常

析构函数不应该抛出异常：

\`\`\`cpp
class GoodClass {
public:
    ~GoodClass() noexcept {  // 标记为noexcept
        try {
            // 可能抛出异常的操作
            cleanup();
        } catch (...) {
            // 捕获并处理异常，不让它传播
            std::cerr << "析构函数中捕获异常" << std::endl;
        }
    }
    
    void cleanup() {
        // 清理资源
    }
};
\`\`\`

### 资源管理最佳实践

使用智能指针避免手动管理：

\`\`\`cpp
#include <memory>

class Base {
public:
    virtual ~Base() = default;
};

class Derived : public Base {
private:
    std::unique_ptr<int> data;  // 自动管理
public:
    Derived() : data(std::make_unique<int>(100)) {}
    // 不需要手动定义析构函数
};

int main() {
    std::unique_ptr<Base> ptr = std::make_unique<Derived>();
    // 自动正确析构
}
\`\`\`

### 虚析构函数的性能

虚析构函数的性能开销：
- 增加一个虚函数表条目
- 析构时需要通过虚函数表查找

这个开销通常可以忽略不计。

### 总结

\`\`\`cpp
// 好的设计
class Interface {
public:
    virtual void doSomething() = 0;
    virtual ~Interface() = default;  // 总是提供虚析构函数
};

// 如果确定不会被继承
class FinalClass final {  // 使用final防止继承
public:
    ~FinalClass() = default;  // 不需要虚析构函数
};
\`\`\`

### 最佳实践

#### 1. 总是为基类提供虚析构函数

\`\`\`cpp
// 好的设计：总是提供虚析构函数
class Base {
public:
    virtual ~Base() = default;  // 或提供实现
};

// 不好的设计：没有虚析构函数
class BadBase {
public:
    ~BadBase() {}  // 如果被继承，可能导致资源泄漏
};
\`\`\`

#### 2. 使用=default简化代码

\`\`\`cpp
class Interface {
public:
    virtual ~Interface() = default;  // 简洁，编译器生成默认实现
};

// 等价于：
class Interface {
public:
    virtual ~Interface() {}  // 手动实现
};
\`\`\`

#### 3. 使用智能指针避免手动管理

\`\`\`cpp
// 推荐：使用智能指针
#include <memory>

class Base {
public:
    virtual ~Base() = default;
};

class Derived : public Base {
private:
    std::unique_ptr<int> data;  // 自动管理
public:
    Derived() : data(std::make_unique<int>(100)) {}
    // 不需要手动定义析构函数
};

std::unique_ptr<Base> ptr = std::make_unique<Derived>();
// 自动正确析构
\`\`\`

#### 4. 使用final防止继承

\`\`\`cpp
// 如果确定类不会被继承，使用final
class Utility final {
public:
    static void helper() {}
    ~Utility() = default;  // 不需要虚析构函数
};

// 编译器会阻止继承
// class Derived : public Utility {}  // 错误！
\`\`\`

#### 5. 析构函数标记为noexcept

\`\`\`cpp
class GoodClass {
public:
    ~GoodClass() noexcept {  // 标记为noexcept
        // 析构函数不应该抛出异常
        try {
            cleanup();
        } catch (...) {
            // 捕获并处理异常
        }
    }

private:
    void cleanup() { /* ... */ }
};
\`\`\`

### 常见错误

#### 1. 忘记虚析构函数

\`\`\`cpp
class Base {
public:
    // 没有virtual ~Base()！
};

class Derived : public Base {
private:
    int* data;
public:
    Derived() : data(new int[100]) {}
    ~Derived() { delete[] data; }
};

Base* ptr = new Derived();
delete ptr;  // 未定义行为！只调用Base析构函数
\`\`\`

#### 2. 纯虚析构函数没有定义

\`\`\`cpp
class AbstractBase {
public:
    virtual ~AbstractBase() = 0;  // 纯虚析构函数
};

// 错误：没有提供定义！
// 链接错误：AbstractBase::~AbstractBase()未定义

// 正确：提供定义
AbstractBase::~AbstractBase() {
    std::cout << "纯虚析构函数" << std::endl;
}
\`\`\`

#### 3. 析构函数抛出异常

\`\`\`cpp
class BadClass {
public:
    ~BadClass() {
        throw std::runtime_error("Error");  // 危险！
        // 如果在栈展开过程中抛出异常，程序会终止
    }
};

// 正确：捕获并处理异常
class GoodClass {
public:
    ~GoodClass() noexcept {
        try {
            cleanup();
        } catch (...) {
            // 捕获并处理异常，不让它传播
        }
    }
};
\`\`\`

#### 4. 虚析构函数但类不被继承

\`\`\`cpp
// 不必要的虚析构函数
class SimpleValue {
public:
    virtual ~SimpleValue() = default;  // 不必要！
private:
    int value;
};

// 如果确定不会被继承，不需要虚析构函数
class BetterSimpleValue {
public:
    ~BetterSimpleValue() = default;  // 更高效
private:
    int value;
};
\`\`\`

#### 5. 通过值删除多态对象

\`\`\`cpp
void badDelete(Base obj) {  // 值传递！对象切片！
    // obj是Base对象，不是Derived对象
    // 析构时只调用Base析构函数
}

// 正确：使用引用或指针
void goodDelete(Base& obj) {  // 引用传递
    // 正确的多态行为
}

void goodDelete(Base* obj) {  // 指针传递
    delete obj;  // 正确调用虚析构函数
}
\`\`\`

### 深入理解

#### 1. 虚析构函数的实现

\`\`\`cpp
class Base {
public:
    virtual ~Base() {}
};

class Derived : public Base {
public:
    ~Derived() override {}
};

// 虚函数表中的析构函数：
// Base的vtable: [&Base::~Base]
// Derived的vtable: [&Derived::~Derived]

Base* ptr = new Derived();
delete ptr;

// 编译器生成的代码：
// 1. 通过vptr找到Derived::~Derived
// 2. 调用Derived::~Derived
// 3. Derived::~Derived自动调用Base::~Base
\`\`\`

#### 2. 纯虚析构函数的作用

\`\`\`cpp
class AbstractBase {
public:
    virtual ~AbstractBase() = 0;  // 纯虚析构函数
};

// 必须提供定义
AbstractBase::~AbstractBase() {
    std::cout << "纯虚析构函数" << std::endl;
}

// 作用：
// 1. 使类成为抽象类，不能实例化
// 2. 强制派生类提供析构函数
// 3. 提供默认的析构行为

class Concrete : public AbstractBase {
public:
    ~Concrete() override {
        // 先执行Concrete的清理
        std::cout << "Concrete析构" << std::endl;
        // 然后自动调用AbstractBase::~AbstractBase
    }
};
\`\`\`

#### 3. 虚析构函数与delete

\`\`\`cpp
class Base {
public:
    virtual ~Base() {}
};

class Derived : public Base {
private:
    int* data;
public:
    Derived() : data(new int[100]) {}
    ~Derived() override { delete[] data; }
};

Base* ptr = new Derived();

// delete ptr的执行过程：
// 1. 检查ptr是否为nullptr
// 2. 通过vptr找到Derived::~Derived
// 3. 调用Derived::~Derived
//    - 执行Derived析构函数体
//    - 析构Derived的成员对象
//    - 调用Base::~Base
// 4. 释放内存（使用正确的size）
\`\`\`

#### 4. 虚析构函数与内存布局

\`\`\`cpp
class WithoutVirtual {
public:
    int data;
};

class WithVirtual {
public:
    virtual ~WithVirtual() {}
    int data;
};

// 内存布局：
// WithoutVirtual: [data]  // 4字节
// WithVirtual: [vptr][data]  // 8字节 + 4字节 = 12字节（可能填充到16字节）

// 虚析构函数会增加对象大小（一个指针）
\`\`\`

#### 5. 多重继承与虚析构函数

\`\`\`cpp
class Base1 {
public:
    virtual ~Base1() {}
};

class Base2 {
public:
    virtual ~Base2() {}
};

class Derived : public Base1, public Base2 {
public:
    ~Derived() override {}
};

// Derived对象有两个vptr：
// - 一个指向Base1的虚函数表（包含~Derived）
// - 一个指向Base2的虚函数表（包含~Derived的thunk）

Base1* b1 = new Derived();
Base2* b2 = new Derived();

delete b1;  // 通过第一个vptr调用~Derived
delete b2;  // 通过第二个vptr调用~Derived（需要调整this指针）
\`\`\``,
            examples: [
                {
                    title: '非虚析构函数问题',
                    code: `#include <iostream>
#include <string>

// 非虚析构函数的基类
class BadBase {
public:
    BadBase() { std::cout << "BadBase构造" << std::endl; }
    ~BadBase() { std::cout << "BadBase析构" << std::endl; }  // 非虚！
};

class BadDerived : public BadBase {
private:
    int* data;
public:
    BadDerived() : BadBase(), data(new int[100]) {
        std::cout << "BadDerived构造，分配内存" << std::endl;
    }
    
    ~BadDerived() {
        delete[] data;
        std::cout << "BadDerived析构，释放内存" << std::endl;
    }
};

// 虚析构函数的基类
class GoodBase {
public:
    GoodBase() { std::cout << "GoodBase构造" << std::endl; }
    virtual ~GoodBase() { std::cout << "GoodBase析构" << std::endl; }  // 虚析构！
};

class GoodDerived : public GoodBase {
private:
    int* data;
public:
    GoodDerived() : GoodBase(), data(new int[100]) {
        std::cout << "GoodDerived构造，分配内存" << std::endl;
    }
    
    ~GoodDerived() override {
        delete[] data;
        std::cout << "GoodDerived析构，释放内存" << std::endl;
    }
};

int main() {
    std::cout << "=== 非虚析构函数 ===" << std::endl;
    {
        BadBase* ptr = new BadDerived();
        delete ptr;  // 只调用BadBase析构！内存泄漏！
    }
    
    std::cout << "\\n=== 虚析构函数 ===" << std::endl;
    {
        GoodBase* ptr = new GoodDerived();
        delete ptr;  // 正确调用所有析构函数
    }
    
    return 0;
}`,
                    description: '对比非虚析构函数和虚析构函数的行为。'
                },
                {
                    title: '智能指针与虚析构',
                    code: `#include <iostream>
#include <memory>
#include <vector>

class Resource {
public:
    virtual void use() = 0;
    virtual ~Resource() = default;
};

class FileResource : public Resource {
private:
    std::string filename;
public:
    FileResource(const std::string& f) : filename(f) {
        std::cout << "打开文件: " << filename << std::endl;
    }
    
    void use() override {
        std::cout << "使用文件: " << filename << std::endl;
    }
    
    ~FileResource() override {
        std::cout << "关闭文件: " << filename << std::endl;
    }
};

class NetworkResource : public Resource {
private:
    std::string url;
public:
    NetworkResource(const std::string& u) : url(u) {
        std::cout << "连接网络: " << url << std::endl;
    }
    
    void use() override {
        std::cout << "访问网络: " << url << std::endl;
    }
    
    ~NetworkResource() override {
        std::cout << "断开网络: " << url << std::endl;
    }
};

int main() {
    std::cout << "=== 使用unique_ptr管理资源 ===" << std::endl;
    {
        std::vector<std::unique_ptr<Resource>> resources;
        
        resources.push_back(std::make_unique<FileResource>("data.txt"));
        resources.push_back(std::make_unique<NetworkResource>("http://example.com"));
        
        for (const auto& res : resources) {
            res->use();
        }
        
        std::cout << "\\n离开作用域，自动清理:" << std::endl;
    }
    
    std::cout << "\\n=== 使用shared_ptr管理资源 ===" << std::endl;
    {
        auto file = std::make_shared<FileResource>("config.txt");
        auto shared = file;  // 共享所有权
        
        std::cout << "引用计数: " << shared.use_count() << std::endl;
        
        std::cout << "\\n离开作用域:" << std::endl;
    }
    
    return 0;
}`,
                    description: '使用智能指针和虚析构函数管理资源。'
                }
            ],
            handsOn: {
                title: '修复析构问题',
                description: '修复代码中的析构函数问题，确保资源正确释放。',
                initialCode: `#include <iostream>
#include <string>
#include <memory>

// TODO: 修复这个类
class Database {
private:
    std::string connection;
    
public:
    Database(const std::string& conn) : connection(conn) {
        std::cout << "连接数据库: " << connection << std::endl;
    }
    
    // TODO: 这里应该是什么？
    ~Database() {
        std::cout << "关闭数据库: " << connection << std::endl;
    }
    
    virtual void query(const std::string& sql) {
        std::cout << "执行查询: " << sql << std::endl;
    }
};

// TODO: 创建派生类MySQLDatabase
class MySQLDatabase {
private:
    std::string charset;
    
public:
    MySQLDatabase(const std::string& conn, const std::string& cs)
        : Database(conn), charset(cs) {
        std::cout << "设置字符集: " << charset << std::endl;
    }
    
    // TODO: 实现析构函数
    
    void query(const std::string& sql) override {
        std::cout << "MySQL查询: " << sql << std::endl;
    }
};

// TODO: 创建派生类PostgreSQLDatabase
class PostgreSQLDatabase {
private:
    std::string schema;
    
public:
    PostgreSQLDatabase(const std::string& conn, const std::string& sch)
        : Database(conn), schema(sch) {
        std::cout << "设置模式: " << schema << std::endl;
    }
    
    // TODO: 实现析构函数
    
    void query(const std::string& sql) override {
        std::cout << "PostgreSQL查询: " << sql << std::endl;
    }
};

int main() {
    std::cout << "=== 创建数据库 ===" << std::endl;
    {
        std::unique_ptr<Database> db1 = std::make_unique<MySQLDatabase>(
            "mysql://localhost", "utf8mb4");
        std::unique_ptr<Database> db2 = std::make_unique<PostgreSQLDatabase>(
            "postgres://localhost", "public");
        
        db1->query("SELECT * FROM users");
        db2->query("SELECT * FROM products");
        
        std::cout << "\\n=== 销毁数据库 ===" << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `=== 创建数据库 ===
连接数据库: mysql://localhost
设置字符集: utf8mb4
连接数据库: postgres://localhost
设置模式: public
MySQL查询: SELECT * FROM users
PostgreSQL查询: SELECT * FROM products

=== 销毁数据库 ===
关闭数据库: postgres://localhost
关闭数据库: mysql://localhost`,
                solutionRegex: 'virtual ~Database|~MySQLDatabase|~PostgreSQLDatabase|override',
                hint: '基类析构函数应该是virtual，派生类析构函数使用override',
                xp: 150
            },
            references: [
                { title: '虚析构函数', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '资源管理', book: 'Effective C++', chapter: '条款7' }
            ],
            assistantTips: [
                '基类析构函数应该是虚函数',
                '通过基类指针删除派生类对象需要虚析构函数',
                '纯虚析构函数必须有定义',
                '使用智能指针可以避免手动管理'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '为什么需要虚析构函数？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '确保派生类析构函数被调用', correct: true }, 
                        { text: '减少内存使用' }, 
                        { text: '支持多线程' }
                    ], 
                    explanation: '虚析构函数确保通过基类指针删除对象时，派生类析构函数被调用。' 
                },
                { 
                    type: 'single', 
                    question: '如果基类析构函数不是虚函数，通过基类指针删除派生类对象会？', 
                    options: [
                        { text: '调用派生类析构函数' }, 
                        { text: '只调用基类析构函数', correct: true }, 
                        { text: '编译错误' }, 
                        { text: '运行时错误' }
                    ], 
                    explanation: '非虚析构函数导致只调用基类析构函数，派生类析构函数不被调用。' 
                },
                { 
                    type: 'single', 
                    question: '纯虚析构函数需要定义吗？', 
                    options: [
                        { text: '不需要' }, 
                        { text: '需要', correct: true }, 
                        { text: '取决于编译器' }, 
                        { text: '只有派生类需要' }
                    ], 
                    explanation: '纯虚析构函数必须有定义，因为派生类析构时会调用它。' 
                },
                { 
                    type: 'single', 
                    question: '析构函数应该抛出异常吗？', 
                    options: [
                        { text: '应该' }, 
                        { text: '不应该', correct: true }, 
                        { text: '取决于情况' }, 
                        { text: '只有虚析构函数可以' }
                    ], 
                    explanation: '析构函数不应该抛出异常，可能导致程序崩溃。' 
                },
                { 
                    type: 'single', 
                    question: '使用智能指针还需要虚析构函数吗？', 
                    options: [
                        { text: '不需要' }, 
                        { text: '需要', correct: true }, 
                        { text: '取决于智能指针类型' }, 
                        { text: '只有shared_ptr需要' }
                    ], 
                    explanation: '智能指针只是管理生命周期，虚析构函数确保正确的析构函数被调用。' 
                }
            ]
        },
        {
            id: '11.9',
            title: '动态绑定与静态绑定',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 动态绑定与静态绑定

### 什么是绑定？

绑定（Binding）是指将函数调用与函数体关联的过程。

### 静态绑定（早绑定）

静态绑定在编译时确定调用的函数：

\`\`\`cpp
class Base {
public:
    void func() { std::cout << "Base::func" << std::endl; }
};

class Derived : public Base {
public:
    void func() { std::cout << "Derived::func" << std::endl; }
};

int main() {
    Derived d;
    d.func();  // 静态绑定：编译时确定调用Derived::func
    
    Base* ptr = &d;
    ptr->func();  // 静态绑定：调用Base::func（非虚函数）
}
\`\`\`

### 动态绑定（晚绑定）

动态绑定在运行时确定调用的函数：

\`\`\`cpp
class Base {
public:
    virtual void func() { std::cout << "Base::func" << std::endl; }
};

class Derived : public Base {
public:
    void func() override { std::cout << "Derived::func" << std::endl; }
};

int main() {
    Derived d;
    Base* ptr = &d;
    ptr->func();  // 动态绑定：运行时确定调用Derived::func
}
\`\`\`

### 静态绑定与动态绑定的区别

| 特性 | 静态绑定 | 动态绑定 |
|------|----------|----------|
| 确定时机 | 编译时 | 运行时 |
| 函数类型 | 非虚函数 | 虚函数 |
| 调用方式 | 直接调用 | 通过虚函数表 |
| 性能 | 更快 | 稍慢 |
| 灵活性 | 较低 | 较高 |

### 默认参数与绑定

默认参数是静态绑定的：

\`\`\`cpp
class Base {
public:
    virtual void func(int x = 10) {
        std::cout << "Base: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void func(int x = 20) override {
        std::cout << "Derived: " << x << std::endl;
    }
};

int main() {
    Base* ptr = new Derived();
    ptr->func();  // 输出：Derived: 10
    // 函数是动态绑定（Derived::func）
    // 默认参数是静态绑定（Base的默认值10）
}
\`\`\`

### 引用与绑定

引用也支持动态绑定：

\`\`\`cpp
void callFunc(Base& ref) {
    ref.func();  // 动态绑定
}

int main() {
    Derived d;
    callFunc(d);  // 调用Derived::func
}
\`\`\`

### 对象与绑定

对象本身不支持动态绑定：

\`\`\`cpp
int main() {
    Derived d;
    Base b = d;  // 对象切片！
    b.func();    // 调用Base::func（静态绑定）
    
    // 正确做法：使用指针或引用
    Base& ref = d;
    ref.func();  // 动态绑定
}
\`\`\`

### 对象切片

当派生类对象赋值给基类对象时，会发生对象切片：

\`\`\`cpp
class Base {
public:
    int baseData;
    virtual void func() { std::cout << "Base" << std::endl; }
};

class Derived : public Base {
public:
    int derivedData;
    void func() override { std::cout << "Derived" << std::endl; }
};

int main() {
    Derived d;
    d.baseData = 10;
    d.derivedData = 20;
    
    Base b = d;  // 对象切片
    // b只包含baseData，derivedData丢失
    b.func();    // 调用Base::func
}
\`\`\`

### 编译器如何实现动态绑定

\`\`\`cpp
Base* ptr = new Derived();
ptr->func();

// 编译器生成的伪代码：
// 1. 获取vptr
// 2. 从虚函数表中获取func的地址
// 3. 调用函数
((ptr->vptr)[func_index])(ptr);
\`\`\`

### 性能考虑

\`\`\`cpp
// 静态绑定：可能内联
class StaticClass {
public:
    void func() { /* ... */ }  // 可以内联
};

// 动态绑定：不能内联
class DynamicClass {
public:
    virtual void func() { /* ... */ }  // 不能内联
};

// 性能差异通常很小，不要因为性能避免使用虚函数
\`\`\`

### 最佳实践

1. **需要多态时使用虚函数**
2. **不需要多态时使用非虚函数**
3. **避免对象切片**
4. **理解默认参数的静态绑定**

\`\`\`cpp
// 好的设计
class Shape {
public:
    virtual double area() const = 0;  // 需要多态
    std::string getName() const { return name; }  // 不需要多态
private:
    std::string name;
};

// 避免对象切片
void process(const Shape& shape) {  // 使用引用
    shape.area();
}
\`\`\``,
            examples: [
                {
                    title: '静态绑定与动态绑定对比',
                    code: `#include <iostream>
#include <string>

class Base {
public:
    // 非虚函数：静态绑定
    void staticFunc() {
        std::cout << "Base::staticFunc (静态绑定)" << std::endl;
    }
    
    // 虚函数：动态绑定
    virtual void dynamicFunc() {
        std::cout << "Base::dynamicFunc (动态绑定)" << std::endl;
    }
    
    // 虚函数带默认参数
    virtual void funcWithDefault(int x = 10) {
        std::cout << "Base::funcWithDefault: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void staticFunc() {
        std::cout << "Derived::staticFunc (隐藏了Base版本)" << std::endl;
    }
    
    void dynamicFunc() override {
        std::cout << "Derived::dynamicFunc (覆盖了Base版本)" << std::endl;
    }
    
    void funcWithDefault(int x = 20) override {
        std::cout << "Derived::funcWithDefault: " << x << std::endl;
    }
};

int main() {
    Derived d;
    Base* ptr = &d;
    
    std::cout << "=== 静态绑定 ===" << std::endl;
    ptr->staticFunc();  // Base::staticFunc
    
    std::cout << "\\n=== 动态绑定 ===" << std::endl;
    ptr->dynamicFunc();  // Derived::dynamicFunc
    
    std::cout << "\\n=== 默认参数（静态绑定） ===" << std::endl;
    ptr->funcWithDefault();  // Derived函数，但使用Base的默认值10
    
    std::cout << "\\n=== 显式传参 ===" << std::endl;
    ptr->funcWithDefault(30);  // Derived函数，参数30
    
    return 0;
}`,
                    description: '对比静态绑定和动态绑定的行为。'
                },
                {
                    title: '对象切片问题',
                    code: `#include <iostream>
#include <string>

class Animal {
protected:
    std::string name;
public:
    Animal(const std::string& n) : name(n) {}
    virtual void speak() const {
        std::cout << name << "发出声音" << std::endl;
    }
    
    // 虚析构函数
    virtual ~Animal() = default;
};

class Dog : public Animal {
private:
    std::string breed;
public:
    Dog(const std::string& n, const std::string& b) 
        : Animal(n), breed(b) {}
    
    void speak() const override {
        std::cout << name << "(" << breed << ")汪汪叫" << std::endl;
    }
    
    void fetch() const {
        std::cout << name << "正在捡球" << std::endl;
    }
};

// 错误的函数：会导致对象切片
void badProcess(Animal animal) {  // 值传递！
    animal.speak();  // 总是调用Animal::speak
}

// 正确的函数：使用引用
void goodProcess(const Animal& animal) {  // 引用传递
    animal.speak();  // 动态绑定
}

int main() {
    Dog dog("旺财", "金毛");
    
    std::cout << "=== 直接调用 ===" << std::endl;
    dog.speak();
    
    std::cout << "\\n=== 通过基类指针 ===" << std::endl;
    Animal* ptr = &dog;
    ptr->speak();  // 动态绑定
    
    std::cout << "\\n=== 通过基类引用 ===" << std::endl;
    Animal& ref = dog;
    ref.speak();  // 动态绑定
    
    std::cout << "\\n=== 对象切片（值传递） ===" << std::endl;
    badProcess(dog);  // 对象切片！
    
    std::cout << "\\n=== 正确做法（引用传递） ===" << std::endl;
    goodProcess(dog);  // 正确
    
    return 0;
}`,
                    description: '展示对象切片问题和解决方案。'
                }
            ],
            handsOn: {
                title: '区分静态和动态绑定',
                description: '实现代码，理解静态绑定和动态绑定的区别。',
                initialCode: `#include <iostream>
#include <string>

class Document {
public:
    std::string type;
    
    Document(const std::string& t) : type(t) {}
    
    // TODO: 声明非虚函数getType，返回type
    
    // TODO: 声明虚函数print，输出"打印" << type << "文档"
};

class PDFDocument : public Document {
public:
    PDFDocument() : Document("PDF") {}
    
    // TODO: 隐藏getType，返回"PDF格式"
    
    // TODO: 覆盖print，输出"打印PDF文档（高质量）"
};

class WordDocument : public Document {
public:
    WordDocument() : Document("Word") {}
    
    // TODO: 隐藏getType，返回"Word格式"
    
    // TODO: 覆盖print，输出"打印Word文档（可编辑）"
};

void processDocument(Document doc) {
    std::cout << "类型（静态绑定）: " << doc.getType() << std::endl;
    std::cout << "打印（静态绑定）: ";
    doc.print();
}

void processDocumentRef(const Document& doc) {
    std::cout << "类型（静态绑定）: " << doc.getType() << std::endl;
    std::cout << "打印（动态绑定）: ";
    doc.print();
}

int main() {
    PDFDocument pdf;
    WordDocument word;
    
    std::cout << "=== 值传递（对象切片） ===" << std::endl;
    processDocument(pdf);
    std::cout << std::endl;
    processDocument(word);
    
    std::cout << "\\n=== 引用传递（多态） ===" << std::endl;
    processDocumentRef(pdf);
    std::cout << std::endl;
    processDocumentRef(word);
    
    return 0;
}`,
                expectedOutput: `=== 值传递（对象切片） ===
类型（静态绑定）: PDF
打印（静态绑定）: 打印PDF文档

类型（静态绑定）: Word
打印（静态绑定）: 打印Word文档

=== 引用传递（多态） ===
类型（静态绑定）: PDF
打印（动态绑定）: 打印PDF文档（高质量）

类型（静态绑定）: Word
打印（动态绑定）: 打印Word文档（可编辑）`,
                solutionRegex: 'virtual.*print|std::string getType|override',
                hint: 'getType是非虚函数（静态绑定），print是虚函数（动态绑定）',
                xp: 160
            },
            references: [
                { title: '动态绑定', book: 'C++ Primer 第五版', chapter: '第15章' },
                { title: '对象切片', book: 'Effective C++', chapter: '条款22' }
            ],
            assistantTips: [
                '静态绑定在编译时确定，动态绑定在运行时确定',
                '虚函数使用动态绑定',
                '默认参数总是静态绑定',
                '避免对象切片：使用指针或引用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '静态绑定发生在什么时候？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译时', correct: true }, 
                        { text: '链接时' }, 
                        { text: '加载时' }
                    ], 
                    explanation: '静态绑定在编译时确定函数调用。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个使用动态绑定？', 
                    options: [
                        { text: '非虚函数' }, 
                        { text: '虚函数', correct: true }, 
                        { text: '静态函数' }, 
                        { text: '内联函数' }
                    ], 
                    explanation: '虚函数使用动态绑定，在运行时确定调用。' 
                },
                { 
                    type: 'single', 
                    question: '对象切片会导致什么？', 
                    options: [
                        { text: '编译错误' }, 
                        { text: '派生类部分丢失', correct: true }, 
                        { text: '内存泄漏' }, 
                        { text: '性能提升' }
                    ], 
                    explanation: '对象切片会丢失派生类特有的成员。' 
                },
                { 
                    type: 'single', 
                    question: '默认参数使用什么绑定？', 
                    options: [
                        { text: '动态绑定' }, 
                        { text: '静态绑定', correct: true }, 
                        { text: '两者都有' }, 
                        { text: '取决于函数类型' }
                    ], 
                    explanation: '默认参数总是静态绑定，由指针/引用的静态类型决定。' 
                },
                { 
                    type: 'single', 
                    question: '如何避免对象切片？', 
                    options: [
                        { text: '使用值传递' }, 
                        { text: '使用指针或引用', correct: true }, 
                        { text: '使用内联函数' }, 
                        { text: '使用静态函数' }
                    ], 
                    explanation: '使用指针或引用可以避免对象切片，保持多态性。' 
                }
            ]
        },
        {
            id: '11.10',
            title: '容器与继承：存（智能）指针',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 容器与继承：存（智能）指针

### 问题：容器不能直接存储多态对象

\`\`\`cpp
class Base { /* ... */ };
class Derived : public Base { /* ... */ };

std::vector<Base> vec;  // 不能存储Derived对象！
Derived d;
vec.push_back(d);  // 对象切片！只存储Base部分
\`\`\`

### 解决方案：存储指针

\`\`\`cpp
// 原始指针（需要手动管理）
std::vector<Base*> vec;
vec.push_back(new Derived());  // 需要手动delete

// 智能指针（推荐）
std::vector<std::unique_ptr<Base>> vec;
vec.push_back(std::make_unique<Derived>());  // 自动管理
\`\`\`

### 使用unique_ptr

\`\`\`cpp
#include <memory>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    
    shapes.push_back(std::make_unique<Circle>(5.0));
    shapes.push_back(std::make_unique<Rectangle>(4.0, 6.0));
    
    for (const auto& shape : shapes) {
        std::cout << shape->area() << std::endl;
    }
}
\`\`\`

### 使用shared_ptr

当需要共享所有权时使用shared_ptr：

\`\`\`cpp
#include <memory>
#include <vector>

int main() {
    std::vector<std::shared_ptr<Shape>> shapes;
    
    auto circle = std::make_shared<Circle>(5.0);
    
    shapes.push_back(circle);  // 共享所有权
    shapes.push_back(std::make_shared<Rectangle>(4.0, 6.0));
    
    // circle可以在其他地方使用
    auto another = circle;  // 引用计数增加
}
\`\`\`

### 工厂函数

使用工厂函数创建对象：

\`\`\`cpp
enum class ShapeType { Circle, Rectangle };

std::unique_ptr<Shape> createShape(ShapeType type) {
    switch (type) {
        case ShapeType::Circle:
            return std::make_unique<Circle>(1.0);
        case ShapeType::Rectangle:
            return std::make_unique<Rectangle>(1.0, 1.0);
    }
    return nullptr;
}

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(createShape(ShapeType::Circle));
    shapes.push_back(createShape(ShapeType::Rectangle));
}
\`\`\`

### 克隆函数

实现克隆以支持复制：

\`\`\`cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual std::unique_ptr<Shape> clone() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    
    double area() const override { return 3.14159 * radius * radius; }
    
    std::unique_ptr<Shape> clone() const override {
        return std::make_unique<Circle>(*this);
    }
};

// 使用克隆
std::vector<std::unique_ptr<Shape>> copyShapes(
    const std::vector<std::unique_ptr<Shape>>& original) {
    std::vector<std::unique_ptr<Shape>> result;
    for (const auto& shape : original) {
        result.push_back(shape->clone());
    }
    return result;
}
\`\`\`

### 遍历与操作

\`\`\`cpp
// 计算总面积
double totalArea(const std::vector<std::unique_ptr<Shape>>& shapes) {
    double total = 0;
    for (const auto& shape : shapes) {
        total += shape->area();
    }
    return total;
}

// 查找特定类型
Circle* findCircle(const std::vector<std::unique_ptr<Shape>>& shapes) {
    for (const auto& shape : shapes) {
        if (auto* circle = dynamic_cast<Circle*>(shape.get())) {
            return circle;
        }
    }
    return nullptr;
}
\`\`\`

### 智能指针的选择

| 指针类型 | 所有权 | 适用场景 |
|---------|--------|----------|
| unique_ptr | 独占 | 大多数情况 |
| shared_ptr | 共享 | 需要共享所有权 |
| weak_ptr | 不拥有 | 打破循环引用 |

### 最佳实践

\`\`\`cpp
// 1. 优先使用unique_ptr
std::vector<std::unique_ptr<Shape>> shapes;

// 2. 使用make_unique/make_shared
shapes.push_back(std::make_unique<Circle>(5.0));

// 3. 提供克隆函数
virtual std::unique_ptr<Shape> clone() const = 0;

// 4. 使用范围for循环
for (const auto& shape : shapes) {
    shape->area();
}

// 5. 使用const引用传递
void process(const std::vector<std::unique_ptr<Shape>>& shapes);
\`\`\`

### 注意事项

1. **虚析构函数**：基类必须有虚析构函数
2. **对象切片**：不要直接存储对象
3. **所有权清晰**：明确谁拥有对象
4. **避免循环引用**：使用weak_ptr打破循环

\`\`\`cpp
// 错误：对象切片
std::vector<Shape> bad;

// 正确：存储指针
std::vector<std::unique_ptr<Shape>> good;
\`\`\``,
            examples: [
                {
                    title: '容器存储多态对象',
                    code: `#include <iostream>
#include <vector>
#include <memory>
#include <string>

class Animal {
protected:
    std::string name;
public:
    Animal(const std::string& n) : name(n) {}
    virtual void speak() const = 0;
    virtual std::string getType() const = 0;
    virtual std::unique_ptr<Animal> clone() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    Dog(const std::string& n) : Animal(n) {}
    
    void speak() const override {
        std::cout << name << "汪汪汪！" << std::endl;
    }
    
    std::string getType() const override { return "狗"; }
    
    std::unique_ptr<Animal> clone() const override {
        return std::make_unique<Dog>(*this);
    }
};

class Cat : public Animal {
public:
    Cat(const std::string& n) : Animal(n) {}
    
    void speak() const override {
        std::cout << name << "喵喵喵~" << std::endl;
    }
    
    std::string getType() const override { return "猫"; }
    
    std::unique_ptr<Animal> clone() const override {
        return std::make_unique<Cat>(*this);
    }
};

// 工厂函数
std::unique_ptr<Animal> createAnimal(const std::string& type, const std::string& name) {
    if (type == "dog") return std::make_unique<Dog>(name);
    if (type == "cat") return std::make_unique<Cat>(name);
    return nullptr;
}

int main() {
    std::vector<std::unique_ptr<Animal>> animals;
    
    animals.push_back(createAnimal("dog", "旺财"));
    animals.push_back(createAnimal("cat", "咪咪"));
    animals.push_back(std::make_unique<Dog>("大黄"));
    
    std::cout << "=== 动物园 ===" << std::endl;
    for (const auto& animal : animals) {
        std::cout << animal->getType() << " ";
        animal->speak();
    }
    
    return 0;
}`,
                    description: '使用智能指针在容器中存储多态对象。'
                },
                {
                    title: '克隆与复制',
                    code: `#include <iostream>
#include <vector>
#include <memory>
#include <string>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual std::unique_ptr<Shape> clone() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    std::string name() const override {
        return "圆形";
    }

    std::unique_ptr<Shape> clone() const override {
        return std::make_unique<Circle>(*this);
    }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double area() const override {
        return width * height;
    }

    std::string name() const override {
        return "矩形";
    }

    std::unique_ptr<Shape> clone() const override {
        return std::make_unique<Rectangle>(*this);
    }
};

// 复制图形集合
std::vector<std::unique_ptr<Shape>> copyShapes(
    const std::vector<std::unique_ptr<Shape>>& original) {
    std::vector<std::unique_ptr<Shape>> result;
    for (const auto& shape : original) {
        result.push_back(shape->clone());
    }
    return result;
}

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(5.0));
    shapes.push_back(std::make_unique<Rectangle>(4.0, 6.0));

    std::cout << "=== 原始图形 ===" << std::endl;
    for (const auto& shape : shapes) {
        std::cout << shape->name() << " 面积: " << shape->area() << std::endl;
    }

    // 克隆图形
    auto copies = copyShapes(shapes);

    std::cout << "\\n=== 克隆图形 ===" << std::endl;
    for (const auto& shape : copies) {
        std::cout << shape->name() << " 面积: " << shape->area() << std::endl;
    }

    return 0;
}`,
                    description: '实现克隆函数支持多态对象的复制。'
                }
            ],
            handsOn: {
                title: '管理多态对象集合',
                description: '使用智能指针管理多态对象集合。',
                initialCode: `#include <iostream>
#include <vector>
#include <memory>
#include <string>

// TODO: 创建抽象基类Product
class Product {
protected:
    std::string name;
    double price;

public:
    Product(const std::string& n, double p) : name(n), price(p) {}

    // TODO: 声明纯虚函数display()

    // TODO: 声明纯虚函数calculateTax()，返回税额

    // TODO: 声明虚析构函数
};

// TODO: 实现Electronics类
class Electronics {
private:
    int warranty;  // 保修期（月）

public:
    Electronics(const std::string& n, double p, int w)
        : Product(n, p), warranty(w) {}

    // TODO: 实现display，输出"电子产品: " << name << " 价格: " << price << " 保修: " << warranty << "月"

    // TODO: 实现calculateTax，返回price * 0.13（13%税率）
};

// TODO: 实现Clothing类
class Clothing {
private:
    std::string size;

public:
    Clothing(const std::string& n, double p, const std::string& s)
        : Product(n, p), size(s) {}

    // TODO: 实现display，输出"服装: " << name << " 价格: " << price << " 尺码: " << size

    // TODO: 实现calculateTax，返回price * 0.05（5%税率）
};

// TODO: 实现Food类
class Food {
private:
    std::string expiryDate;

public:
    Food(const std::string& n, double p, const std::string& exp)
        : Product(n, p), expiryDate(exp) {}

    // TODO: 实现display，输出"食品: " << name << " 价格: " << price << " 过期: " << expiryDate

    // TODO: 实现calculateTax，返回0（食品免税）
};

int main() {
    std::vector<std::unique_ptr<Product>> cart;

    // TODO: 添加商品到购物车
    cart.push_back(std::make_unique<Electronics>("笔记本电脑", 5999.99, 24));
    cart.push_back(std::make_unique<Clothing>("T恤", 99.99, "L"));
    cart.push_back(std::make_unique<Food>("牛奶", 15.50, "2024-12-31"));

    std::cout << "=== 购物车 ===" << std::endl;
    double totalTax = 0;
    for (const auto& product : cart) {
        product->display();
        double tax = product->calculateTax();
        std::cout << "  税额: " << tax << std::endl;
        totalTax += tax;
    }

    std::cout << "\\n总税额: " << totalTax << std::endl;

    return 0;
}`,
                expectedOutput: `=== 购物车 ===
电子产品: 笔记本电脑 价格: 5999.99 保修: 24月
  税额: 779.999
服装: T恤 价格: 99.99 尺码: L
  税额: 4.9995
食品: 牛奶 价格: 15.5 过期: 2024-12-31
  税额: 0

总税额: 784.998`,
                solutionRegex: 'virtual.*= 0|override|std::unique_ptr<Product>',
                hint: '使用unique_ptr存储多态对象，基类声明纯虚函数',
                xp: 180
            },
            references: [
                { title: '智能指针', book: 'C++ Primer 第五版', chapter: '第12章' },
                { title: '容器与继承', book: 'Effective C++', chapter: '条款22' }
            ],
            assistantTips: [
                '容器不能直接存储多态对象（会对象切片）',
                '使用智能指针存储多态对象',
                'unique_ptr适合独占所有权',
                'shared_ptr适合共享所有权'
            ],
            quiz: [
                {
                    type: 'single',
                    question: '为什么不能直接在容器中存储多态对象？',
                    options: [
                        { text: '编译错误' },
                        { text: '会发生对象切片', correct: true },
                        { text: '性能太差' },
                        { text: '内存不足' }
                    ],
                    explanation: '直接存储对象会导致对象切片，丢失派生类部分。'
                },
                {
                    type: 'single',
                    question: '推荐使用哪种智能指针存储多态对象？',
                    options: [
                        { text: 'auto_ptr' },
                        { text: 'unique_ptr', correct: true },
                        { text: '总是shared_ptr' },
                        { text: '原始指针' }
                    ],
                    explanation: 'unique_ptr适合大多数情况，独占所有权且高效。'
                },
                {
                    type: 'single',
                    question: '如何支持多态对象的复制？',
                    options: [
                        { text: '直接复制' },
                        { text: '实现克隆函数', correct: true },
                        { text: '使用引用' },
                        { text: '不能复制' }
                    ],
                    explanation: '通过实现虚克隆函数可以支持多态对象的复制。'
                },
                {
                    type: 'single',
                    question: 'shared_ptr适合什么场景？',
                    options: [
                        { text: '总是使用' },
                        { text: '需要共享所有权时', correct: true },
                        { text: '性能要求高时' },
                        { text: '单线程时' }
                    ],
                    explanation: 'shared_ptr适合需要多个所有者共享对象的场景。'
                },
                {
                    type: 'single',
                    question: '使用智能指针存储多态对象时，基类需要什么？',
                    options: [
                        { text: '不需要任何特殊处理' },
                        { text: '虚析构函数', correct: true },
                        { text: '纯虚析构函数' },
                        { text: '拷贝构造函数' }
                    ],
                    explanation: '基类必须有虚析构函数，确保派生类析构函数被正确调用。'
                }
            ]
        }
    ]
};

window.Unit11Data = Unit11Data;