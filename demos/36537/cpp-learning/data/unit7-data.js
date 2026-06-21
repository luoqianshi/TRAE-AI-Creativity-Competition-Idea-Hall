/**
 * 单元7：类与对象（上）
 * C++面向对象编程基础
 */
const Unit7Data = {
    id: 7,
    title: '类与对象（上）',
    description: '学习C++类的基础知识，包括类的定义、构造函数、析构函数、拷贝控制、友元和静态成员等核心概念。',
    lessons: [
        {
            id: '7.1',
            title: '类的定义与成员',
            duration: '30分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 类的定义与成员

类是C++面向对象编程的核心，它将数据和操作数据的函数封装在一起。

### 类的基本定义

\`\`\`cpp
class Student {
private:    // 私有成员
    std::string name;
    int age;
    
public:     // 公有成员
    // 成员函数
    void setName(const std::string& n) { name = n; }
    void setAge(int a) { age = a; }
    
    std::string getName() const { return name; }
    int getAge() const { return age; }
    
    void display() const {
        std::cout << "姓名: " << name << ", 年龄: " << age << std::endl;
    }
};
\`\`\`

### 类的成员

**数据成员（成员变量）**：
- 存储对象的状态信息
- 通常声明为private以实现封装

**成员函数（方法）**：
- 定义对象的行为
- 可以访问类的所有成员
- const成员函数不能修改对象状态

### 定义成员函数的两种方式

**1. 类内定义（隐式inline）**：
\`\`\`cpp
class Point {
    int x, y;
public:
    int getX() const { return x; }  // 隐式inline
};
\`\`\`

**2. 类外定义**：
\`\`\`cpp
class Point {
    int x, y;
public:
    int getX() const;  // 声明
};

int Point::getX() const {  // 定义，使用::作用域运算符
    return x;
}
\`\`\`

### 创建和使用对象

\`\`\`cpp
int main() {
    Student s1;           // 默认构造
    Student s2 = Student(); // 显式调用默认构造
    
    s1.setName("张三");
    s1.setAge(20);
    s1.display();
    
    return 0;
}
\`\`\`

### struct与class的区别

\`\`\`cpp
struct Point {   // 默认public
    int x, y;
};

class Point {    // 默认private
    int x, y;
};
\`\`\`

| 特性 | struct | class |
|------|--------|-------|
| 默认访问权限 | public | private |
| 默认继承方式 | public | private |
| 适用场景 | 简单数据结构 | 复杂对象 |`,
            examples: [
                {
                    title: '定义一个简单的矩形类',
                    code: `#include <iostream>

class Rectangle {
private:
    double width;
    double height;
    
public:
    // 设置宽度和高度
    void setDimensions(double w, double h) {
        width = w;
        height = h;
    }
    
    // 计算面积
    double getArea() const {
        return width * height;
    }
    
    // 计算周长
    double getPerimeter() const {
        return 2 * (width + height);
    }
    
    // 显示信息
    void display() const {
        std::cout << "矩形: " << width << " x " << height << std::endl;
        std::cout << "面积: " << getArea() << std::endl;
        std::cout << "周长: " << getPerimeter() << std::endl;
    }
};

int main() {
    Rectangle rect;
    rect.setDimensions(5.0, 3.0);
    rect.display();
    return 0;
}`,
                    description: '定义一个矩形类，包含私有数据成员和公有成员函数。'
                },
                {
                    title: '类外定义成员函数',
                    code: `#include <iostream>
#include <string>

class Book {
private:
    std::string title;
    std::string author;
    double price;
    
public:
    // 成员函数声明
    void setInfo(const std::string& t, const std::string& a, double p);
    void display() const;
    double getPrice() const;
};

// 类外定义成员函数
void Book::setInfo(const std::string& t, const std::string& a, double p) {
    title = t;
    author = a;
    price = p;
}

void Book::display() const {
    std::cout << "书名: " << title << std::endl;
    std::cout << "作者: " << author << std::endl;
    std::cout << "价格: " << price << "元" << std::endl;
}

double Book::getPrice() const {
    return price;
}

int main() {
    Book book;
    book.setInfo("C++ Primer", "Lippman", 128.0);
    book.display();
    return 0;
}`,
                    description: '展示如何在类外定义成员函数，使用作用域运算符::。'
                }
            ],
            handsOn: {
                title: '实现一个简单的银行账户类',
                description: '## 任务目标\n创建一个 `BankAccount` 类，掌握类的基本定义、私有成员、公有接口的设计方法。\n\n## 操作步骤\n1. **定义私有成员变量**：账户名（字符串类型）和余额（浮点类型）\n2. **实现公有成员函数**：\n   - `setAccountName()` - 设置账户名\n   - `deposit()` - 存款，增加余额\n   - `withdraw()` - 取款，减少余额（需判断余额是否充足）\n   - `getBalance()` - 返回当前余额\n   - `display()` - 显示账户信息\n\n## 预期成果\n创建账户后，存入1000元，取出300元，最终显示：\n```\n账户名: 张三的账户\n余额: 700\n```\n\n## 代码框架\n```cpp\nclass BankAccount {\nprivate:\n    // 私有成员变量\n    std::string accountName;  // 账户名\n    double balance;           // 余额\n\npublic:\n    // 公有成员函数\n    void setAccountName(const std::string& name);\n    void deposit(double amount);\n    bool withdraw(double amount);\n    double getBalance() const;\n    void display() const;\n};\n\n// 在类外实现成员函数\nvoid BankAccount::setAccountName(const std::string& name) {\n    accountName = name;\n}\n\nvoid BankAccount::deposit(double amount) {\n    // 实现: 增加余额\n}\n\nbool BankAccount::withdraw(double amount) {\n    // 实现: 判断余额是否充足后减少余额\n    // 返回 true 表示成功，false 表示失败\n}\n\ndouble BankAccount::getBalance() const {\n    // 实现: 返回余额\n}\n\nvoid BankAccount::display() const {\n    // 实现: 输出账户信息\n}\n```',
                initialCode: `#include <iostream>
#include <string>

class BankAccount {
private:
    // 私有成员变量
    std::string accountName;  // 账户名
    double balance;           // 余额

public:
    // 公有成员函数声明
    void setAccountName(const std::string& name);
    void deposit(double amount);
    bool withdraw(double amount);
    double getBalance() const;
    void display() const;
};

// ===== 成员函数实现 =====

void BankAccount::setAccountName(const std::string& name) {
    // 实现: 保存账户名
    accountName = name;
}

void BankAccount::deposit(double amount) {
    // 实现: 增加余额
    if (amount > 0) {
        balance += amount;
    }
}

bool BankAccount::withdraw(double amount) {
    // 实现: 判断余额是否充足后减少余额
    if (amount > 0 && balance >= amount) {
        balance -= amount;
        return true;
    }
    return false;
}

double BankAccount::getBalance() const {
    // 实现: 返回当前余额
    return balance;
}

void BankAccount::display() const {
    // 实现: 输出账户信息
    std::cout << "账户名: " << accountName << std::endl;
    std::cout << "余额: " << balance << std::endl;
}

int main() {
    BankAccount account;
    account.setAccountName("张三的账户");
    account.deposit(1000);
    account.withdraw(300);
    account.display();
    return 0;
}`,
                expectedOutput: `账户名: 张三的账户
余额: 700`,
                solutionRegex: 'accountName|balance|deposit|withdraw',
                hint: '私有成员变量不能在类外部直接访问，必须通过公有成员函数操作',
                xp: 150
            },
            references: [
                { title: '类定义', book: 'C++ Primer 第五版', chapter: '第7章 7.2节' },
                { title: 'cppreference - 类', url: 'https://en.cppreference.com/w/cpp/language/class' }
            ],
            assistantTips: [
                '类名通常使用大驼峰命名法（如BankAccount）',
                '成员变量通常设为private，通过public函数访问',
                'const成员函数不会修改对象状态，可以安全调用'
            ],
            quiz: [
                { type: 'single', question: '类中成员的默认访问权限是？', options: [{ text: 'public' }, { text: 'private', correct: true }, { text: 'protected' }, { text: '无默认权限' }], explanation: 'class中成员默认是private访问权限。' },
                { type: 'single', question: 'const成员函数的特点是？', options: [{ text: '可以修改任何成员' }, { text: '不能修改对象状态', correct: true }, { text: '只能访问静态成员' }, { text: '必须是静态函数' }], explanation: 'const成员函数承诺不修改对象的数据成员。' },
                { type: 'single', question: '在类外定义成员函数需要使用？', options: [{ text: '.运算符' }, { text: '->运算符' }, { text: '::作用域运算符', correct: true }, { text: ':运算符' }], explanation: '类外定义成员函数使用 类名::函数名 的形式。' },
                { type: 'single', question: 'struct和class的主要区别是？', options: [{ text: 'struct不能有成员函数' }, { text: '默认访问权限不同', correct: true }, { text: 'class不能有数据成员' }, { text: '没有区别' }], explanation: 'struct默认public，class默认private。' },
                { type: 'single', question: '以下哪种说法正确？', options: [{ text: '成员函数必须在类内定义' }, { text: '成员函数可以在类外定义', correct: true }, { text: '成员函数不能访问私有成员' }, { text: '成员函数必须是公有的' }], explanation: '成员函数可以在类内或类外定义，类外定义使用::运算符。' }
            ]
        },
        {
            id: '7.2',
            title: 'this 指针',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 250,
            concepts: `## this 指针

this指针是C++中的一个隐式指针，每个非静态成员函数都有一个this指针。

### this指针的本质

\`\`\`cpp
class Point {
private:
    int x, y;
    
public:
    void setX(int x) {
        this->x = x;  // 使用this区分成员变量和参数
    }
    
    void setY(int y) {
        this->y = y;
    }
};
\`\`\`

**this指针的特点**：
- 类型为 \`ClassName* const\`（指向当前对象的常量指针）
- 只能在成员函数内部使用
- 不能被修改（始终指向当前对象）
- 静态成员函数没有this指针

### this指针的用途

**1. 区分成员变量和参数**：
\`\`\`cpp
void setName(const std::string& name) {
    this->name = name;  // name是参数，this->name是成员
}
\`\`\`

**2. 返回当前对象（支持链式调用）**：
\`\`\`cpp
class StringBuilder {
private:
    std::string data;
    
public:
    StringBuilder& append(const std::string& s) {
        data += s;
        return *this;  // 返回当前对象的引用
    }
    
    void print() const {
        std::cout << data << std::endl;
    }
};

// 链式调用
StringBuilder sb;
sb.append("Hello").append(" ").append("World");
sb.print();  // Hello World
\`\`\`

**3. 返回当前对象的副本**：
\`\`\`cpp
Point getCopy() const {
    return *this;  // 返回当前对象的副本
}
\`\`\`

**4. 检查自赋值**：
\`\`\`cpp
MyClass& operator=(const MyClass& other) {
    if (this != &other) {  // 检查是否自赋值
        // 执行赋值操作
    }
    return *this;
}
\`\`\`

### this指针的内部原理

当调用 \`obj.method()\` 时，编译器实际上：
1. 将obj的地址传递给method
2. method内部通过this指针访问obj的成员

\`\`\`cpp
// 编译器视角
obj.method(arg);
// 实际调用
method(&obj, arg);  // 隐式传递this指针
\`\`\``,
            examples: [
                {
                    title: '链式调用示例',
                    code: `#include <iostream>
#include <string>

class Calculator {
private:
    double value;
    
public:
    Calculator() : value(0) {}
    
    Calculator& add(double x) {
        value += x;
        return *this;
    }
    
    Calculator& subtract(double x) {
        value -= x;
        return *this;
    }
    
    Calculator& multiply(double x) {
        value *= x;
        return *this;
    }
    
    Calculator& divide(double x) {
        if (x != 0) value /= x;
        return *this;
    }
    
    double getResult() const {
        return value;
    }
};

int main() {
    Calculator calc;
    double result = calc.add(10)
                        .multiply(2)
                        .subtract(5)
                        .divide(3)
                        .getResult();
    std::cout << "结果: " << result << std::endl;  // 5
    return 0;
}`,
                    description: '使用this指针实现链式调用，使代码更简洁。'
                },
                {
                    title: '区分成员变量和参数',
                    code: `#include <iostream>
#include <string>

class Person {
private:
    std::string name;
    int age;
    
public:
    // 当参数名与成员变量名相同时，使用this区分
    void setName(const std::string& name) {
        this->name = name;  // this->name是成员，name是参数
    }
    
    void setAge(int age) {
        this->age = age;
    }
    
    void display() const {
        std::cout << "姓名: " << name << ", 年龄: " << age << std::endl;
    }
};

int main() {
    Person p;
    p.setName("李四");
    p.setAge(25);
    p.display();
    return 0;
}`,
                    description: '当参数名与成员变量名相同时，使用this指针进行区分。'
                }
            ],
            handsOn: {
                title: '实现链式调用的字符串构建器',
                description: '创建一个TextBuilder类，实现addText、addLine、clear等方法，支持链式调用。',
                initialCode: `#include <iostream>
#include <string>

class TextBuilder {
private:
    std::string content;
    
public:
    TextBuilder() : content("") {}
    
    // TODO: 实现addText方法，添加文本（不换行）
    // 返回 *this 以支持链式调用
    TextBuilder& addText(const std::string& text) {
        // 在此实现
    }
    
    // TODO: 实现addLine方法，添加一行文本（自动换行）
    TextBuilder& addLine(const std::string& text) {
        // 在此实现
    }
    
    // TODO: 实现clear方法，清空内容
    TextBuilder& clear() {
        // 在此实现
    }
    
    void print() const {
        std::cout << content;
    }
};

int main() {
    TextBuilder builder;
    builder.addLine("标题：C++学习笔记")
           .addText("作者：张三")
           .addLine("")
           .addLine("这是正文内容。");
    builder.print();
    return 0;
}`,
                expectedOutput: `标题：C++学习笔记
作者：张三

这是正文内容。`,
                solutionRegex: 'return \\*this|this->content',
                hint: '每个方法最后返回 *this 以支持链式调用',
                xp: 150
            },
            references: [
                { title: 'this指针', book: 'C++ Primer 第五版', chapter: '第7章 7.1.2节' },
                { title: 'cppreference - this指针', url: 'https://en.cppreference.com/w/cpp/language/this' }
            ],
            assistantTips: [
                'this指针是常量指针，不能修改它指向的对象',
                '静态成员函数没有this指针',
                '返回*this可以实现链式调用'
            ],
            quiz: [
                { type: 'single', question: 'this指针的类型是？', options: [{ text: 'ClassName*' }, { text: 'const ClassName*' }, { text: 'ClassName* const', correct: true }, { text: 'const ClassName* const' }], explanation: 'this是常量指针，指针本身不能修改，但可以修改指向的对象。' },
                { type: 'single', question: '以下哪个函数有this指针？', options: [{ text: '静态成员函数' }, { text: '非静态成员函数', correct: true }, { text: '全局函数' }, { text: '友元函数' }], explanation: '只有非静态成员函数有this指针。' },
                { type: 'single', question: 'return *this 返回的是？', options: [{ text: '指针' }, { text: '当前对象的引用', correct: true }, { text: '当前对象的副本' }, { text: 'void' }], explanation: '*this解引用得到当前对象，返回类型决定是引用还是副本。' },
                { type: 'single', question: '链式调用的关键是？', options: [{ text: '返回void' }, { text: '返回*this', correct: true }, { text: '返回this' }, { text: '返回nullptr' }], explanation: '返回当前对象的引用（*this）才能继续调用成员函数。' },
                { type: 'single', question: 'this指针在什么时候存在？', options: [{ text: '编译时' }, { text: '成员函数被调用时', correct: true }, { text: '对象创建时' }, { text: '程序启动时' }], explanation: 'this指针在成员函数被调用时指向调用该函数的对象。' }
            ]
        },
        {
            id: '7.3',
            title: '访问控制：public、private、protected',
            duration: '30分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 访问控制：public、private、protected

C++通过访问说明符控制类成员的可见性，实现封装。

### 三种访问级别

| 访问说明符 | 类内部 | 派生类 | 外部代码 |
|-----------|--------|--------|----------|
| public | ✓ | ✓ | ✓ |
| protected | ✓ | ✓ | ✗ |
| private | ✓ | ✗ | ✗ |

### public（公有）

\`\`\`cpp
class Student {
public:
    std::string name;  // 任何代码都可以访问
    
    void display() {
        std::cout << name << std::endl;
    }
};

int main() {
    Student s;
    s.name = "张三";  // OK，public成员
    s.display();       // OK，public成员
}
\`\`\`

### private（私有）

\`\`\`cpp
class BankAccount {
private:
    double balance;  // 只有类内部可以访问
    
public:
    void deposit(double amount) {
        balance += amount;  // OK，类内部访问
    }
    
    double getBalance() const {
        return balance;  // 通过public函数间接访问
    }
};

int main() {
    BankAccount account;
    // account.balance = 100;  // 错误！private成员
    account.deposit(100);      // OK，通过public接口
}
\`\`\`

### protected（受保护）

\`\`\`cpp
class Animal {
protected:
    std::string name;  // 派生类可以访问
    
public:
    Animal(const std::string& n) : name(n) {}
};

class Dog : public Animal {
public:
    Dog(const std::string& n) : Animal(n) {}
    
    void bark() {
        std::cout << name << " says woof!";  // OK，派生类访问protected
    }
};

int main() {
    Dog dog("Buddy");
    // dog.name = "Max";  // 错误！外部不能访问protected
}
\`\`\`

### 封装原则

**好的封装**：
\`\`\`cpp
class GoodExample {
private:
    int value;  // 数据成员私有
    
public:
    int getValue() const { return value; }  // 通过函数访问
    void setValue(int v) { 
        if (v >= 0) value = v;  // 可以添加验证逻辑
    }
};
\`\`\`

**不好的封装**：
\`\`\`cpp
class BadExample {
public:
    int value;  // 数据成员公开，破坏封装
};
\`\`\`

### 访问控制的最佳实践

1. **数据成员设为private**：保护数据完整性
2. **通过public函数访问**：提供受控的访问接口
3. **protected用于继承**：允许派生类访问但禁止外部访问`,
            examples: [
                {
                    title: '封装示例：温度类',
                    code: `#include <iostream>

class Temperature {
private:
    double celsius;  // 私有数据成员
    
public:
    Temperature(double c = 0) : celsius(c) {}
    
    // 公有接口：获取摄氏度
    double getCelsius() const {
        return celsius;
    }
    
    // 公有接口：获取华氏度
    double getFahrenheit() const {
        return celsius * 9.0 / 5.0 + 32;
    }
    
    // 公有接口：设置摄氏度（带验证）
    void setCelsius(double c) {
        if (c >= -273.15) {  // 绝对零度检查
            celsius = c;
        } else {
            std::cout << "错误：温度不能低于绝对零度！" << std::endl;
        }
    }
    
    // 公有接口：设置华氏度
    void setFahrenheit(double f) {
        setCelsius((f - 32) * 5.0 / 9.0);
    }
};

int main() {
    Temperature temp;
    temp.setCelsius(25);
    std::cout << "摄氏: " << temp.getCelsius() << "°C" << std::endl;
    std::cout << "华氏: " << temp.getFahrenheit() << "°F" << std::endl;
    
    temp.setCelsius(-300);  // 无效温度
    return 0;
}`,
                    description: '使用private保护数据，通过public函数提供受控访问。'
                },
                {
                    title: 'protected成员示例',
                    code: `#include <iostream>
#include <string>

class Shape {
protected:
    double width;
    double height;
    
public:
    Shape(double w, double h) : width(w), height(h) {}
    
    virtual double area() const {
        return width * height;
    }
};

class Rectangle : public Shape {
public:
    Rectangle(double w, double h) : Shape(w, h) {}
    
    // 可以直接访问protected成员
    double perimeter() const {
        return 2 * (width + height);
    }
    
    void scale(double factor) {
        width *= factor;   // 访问protected成员
        height *= factor;
    }
};

int main() {
    Rectangle rect(5, 3);
    std::cout << "面积: " << rect.area() << std::endl;
    std::cout << "周长: " << rect.perimeter() << std::endl;
    
    rect.scale(2);
    std::cout << "放大后面积: " << rect.area() << std::endl;
    return 0;
}`,
                    description: 'protected成员允许派生类访问，但禁止外部访问。'
                }
            ],
            handsOn: {
                title: '实现封装的学生成绩类',
                description: '创建一个StudentGrade类，私有成员包括姓名和成绩，公有接口包括设置和获取方法，成绩必须在0-100之间。',
                initialCode: `#include <iostream>
#include <string>

class StudentGrade {
private:
    // TODO: 添加私有成员变量
    // 姓名 name
    // 成绩 score（0-100）
    
public:
    // TODO: 实现构造函数，初始化姓名和成绩
    
    // TODO: 实现setName方法
    
    // TODO: 实现setScore方法
    // 如果成绩不在0-100范围，输出错误信息并不修改
    
    // TODO: 实现getName方法
    
    // TODO: 实现getScore方法
    
    // TODO: 实现getGrade方法
    // 返回等级：90-100为A，80-89为B，70-79为C，60-69为D，60以下为F
    
    // TODO: 实现display方法，显示姓名、成绩和等级
};

int main() {
    StudentGrade student("张三", 85);
    student.display();
    
    student.setScore(95);
    student.display();
    
    student.setScore(150);  // 无效成绩
    student.display();
    
    return 0;
}`,
                expectedOutput: `姓名: 张三, 成绩: 85, 等级: B
姓名: 张三, 成绩: 95, 等级: A
错误：成绩必须在0-100之间！
姓名: 张三, 成绩: 95, 等级: A`,
                solutionRegex: 'private:|setScore|getGrade',
                hint: '成绩验证在setScore方法中实现',
                xp: 150
            },
            references: [
                { title: '访问控制', book: 'C++ Primer 第五版', chapter: '第7章 7.2节' },
                { title: 'cppreference - 访问说明符', url: 'https://en.cppreference.com/w/cpp/language/access' }
            ],
            assistantTips: [
                '数据成员通常设为private以实现封装',
                'protected主要用于继承体系中',
                'public接口应该简洁明了'
            ],
            quiz: [
                { type: 'single', question: 'private成员可以被谁访问？', options: [{ text: '任何代码' }, { text: '只有类本身', correct: true }, { text: '类和派生类' }, { text: '只有友元' }], explanation: 'private成员只能被类本身的成员函数和友元访问。' },
                { type: 'single', question: 'protected成员可以被派生类访问吗？', options: [{ text: '不能' }, { text: '可以', correct: true }, { text: '只有public继承时可以' }, { text: '取决于编译器' }], explanation: 'protected成员可以被派生类访问，无论何种继承方式。' },
                { type: 'single', question: '封装的主要目的是？', options: [{ text: '减少代码量' }, { text: '保护数据完整性', correct: true }, { text: '提高运行速度' }, { text: '简化语法' }], explanation: '封装通过隐藏实现细节、提供受控访问接口来保护数据完整性。' },
                { type: 'single', question: '以下哪种设计更好？', options: [{ text: '所有成员都是public' }, { text: '数据private，通过函数访问', correct: true }, { text: '所有成员都是protected' }, { text: '不使用访问控制' }], explanation: '好的封装将数据设为private，通过public函数提供受控访问。' },
                { type: 'single', question: '外部代码能访问protected成员吗？', options: [{ text: '能' }, { text: '不能', correct: true }, { text: '取决于继承方式' }, { text: '取决于声明顺序' }], explanation: 'protected成员对外部代码不可见，只能被类本身和派生类访问。' }
            ]
        },
        {
            id: '7.4',
            title: '构造函数与默认构造函数',
            duration: '35分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 构造函数与默认构造函数

构造函数是特殊的成员函数，用于初始化对象。

### 构造函数的特点

- 与类同名
- 没有返回类型
- 可以重载
- 在对象创建时自动调用
- 不能被声明为const

### 基本构造函数

\`\`\`cpp
class Student {
private:
    std::string name;
    int age;
    
public:
    // 构造函数
    Student(const std::string& n, int a) {
        name = n;
        age = a;
    }
    
    void display() const {
        std::cout << name << ", " << age << "岁" << std::endl;
    }
};

int main() {
    Student s1("张三", 20);      // 直接初始化
    Student s2 = Student("李四", 22);  // 拷贝初始化
}
\`\`\`

### 默认构造函数

**不需要参数的构造函数**：

\`\`\`cpp
class Point {
private:
    int x, y;
    
public:
    // 默认构造函数
    Point() {
        x = 0;
        y = 0;
    }
    
    // 带参数的构造函数
    Point(int x, int y) : x(x), y(y) {}
};

int main() {
    Point p1;        // 调用默认构造函数
    Point p2(3, 4);  // 调用带参数的构造函数
}
\`\`\`

### 合成的默认构造函数

如果没有定义任何构造函数，编译器会生成默认构造函数：

\`\`\`cpp
class SimpleClass {
public:
    int value;
    std::string text;
    // 编译器自动生成默认构造函数
};

int main() {
    SimpleClass obj;  // 使用合成的默认构造函数
    // value未定义（可能是任意值）
    // text被默认初始化为空字符串
}
\`\`\`

**注意**：合成的默认构造函数：
- 对类类型成员调用其默认构造函数
- 对内置类型成员不初始化（值未定义）

### = default（C++11）

显式要求编译器生成默认构造函数：

\`\`\`cpp
class MyClass {
public:
    MyClass() = default;  // 显式使用合成的默认构造函数
    MyClass(int v) : value(v) {}
private:
    int value;
};
\`\`\`

### 构造函数重载

\`\`\`cpp
class Date {
private:
    int year, month, day;
    
public:
    // 默认构造函数
    Date() : year(2000), month(1), day(1) {}
    
    // 部分参数
    Date(int y) : year(y), month(1), day(1) {}
    
    // 全部参数
    Date(int y, int m, int d) : year(y), month(m), day(d) {}
    
    void display() const {
        std::cout << year << "-" << month << "-" << day << std::endl;
    }
};
\`\`\`

### explicit关键字

防止隐式转换：

\`\`\`cpp
class MyInt {
public:
    explicit MyInt(int v) : value(v) {}
private:
    int value;
};

int main() {
    MyInt a(10);      // OK
    // MyInt b = 10;  // 错误！explicit阻止隐式转换
}
\`\`\``,
            examples: [
                {
                    title: '多种构造函数形式',
                    code: `#include <iostream>
#include <string>

class Book {
private:
    std::string title;
    std::string author;
    double price;
    
public:
    // 默认构造函数
    Book() : title("未知"), author("未知"), price(0) {
        std::cout << "默认构造函数被调用" << std::endl;
    }
    
    // 带标题的构造函数
    Book(const std::string& t) : title(t), author("未知"), price(0) {
        std::cout << "单参数构造函数被调用" << std::endl;
    }
    
    // 全参数构造函数
    Book(const std::string& t, const std::string& a, double p) 
        : title(t), author(a), price(p) {
        std::cout << "全参数构造函数被调用" << std::endl;
    }
    
    void display() const {
        std::cout << "《" << title << "》 - " << author 
                  << " (" << price << "元)" << std::endl;
    }
};

int main() {
    Book b1;                           // 默认构造
    Book b2("C++ Primer");             // 单参数构造
    Book b3("Effective C++", "Scott Meyers", 89.0);  // 全参数构造
    
    b1.display();
    b2.display();
    b3.display();
    return 0;
}`,
                    description: '展示构造函数的重载，根据参数不同调用不同版本。'
                },
                {
                    title: 'explicit防止隐式转换',
                    code: `#include <iostream>

class Distance {
private:
    double meters;
    
public:
    explicit Distance(double m) : meters(m) {}
    
    double getMeters() const { return meters; }
    double getKilometers() const { return meters / 1000; }
};

void printDistance(const Distance& d) {
    std::cout << d.getMeters() << "米 (" << d.getKilometers() << "千米)" << std::endl;
}

int main() {
    Distance d1(1000);           // OK，显式构造
    // Distance d2 = 500;        // 错误！explicit阻止隐式转换
    // printDistance(2000);      // 错误！不能隐式转换
    
    printDistance(Distance(2000));  // OK，显式构造
    return 0;
}`,
                    description: 'explicit关键字防止意外的隐式类型转换。'
                }
            ],
            handsOn: {
                title: '实现时间类构造函数',
                description: '创建一个Time类，包含时、分、秒三个成员，实现默认构造函数（00:00:00）、单参数构造函数（只设置小时）、全参数构造函数。',
                initialCode: `#include <iostream>

class Time {
private:
    int hour;
    int minute;
    int second;
    
public:
    // TODO: 实现默认构造函数，初始化为 00:00:00
    
    // TODO: 实现单参数构造函数，只设置小时
    // 分和秒初始化为0
    
    // TODO: 实现全参数构造函数
    // 验证：hour 0-23, minute 0-59, second 0-59
    // 如果超出范围，设为0
    
    void display() const {
        std::cout << hour << ":" << minute << ":" << second << std::endl;
    }
};

int main() {
    Time t1;           // 0:0:0
    Time t2(10);       // 10:0:0
    Time t3(14, 30, 45);  // 14:30:45
    Time t4(25, 70, 80);  // 无效时间，应为 0:0:0
    
    t1.display();
    t2.display();
    t3.display();
    t4.display();
    
    return 0;
}`,
                expectedOutput: `0:0:0
10:0:0
14:30:45
0:0:0`,
                solutionRegex: 'Time\\(\\)|Time\\(int|hour.*minute.*second',
                hint: '构造函数中可以调用验证逻辑',
                xp: 150
            },
            references: [
                { title: '构造函数', book: 'C++ Primer 第五版', chapter: '第7章 7.1.4节' },
                { title: 'cppreference - 构造函数', url: 'https://en.cppreference.com/w/cpp/language/constructor' }
            ],
            assistantTips: [
                '如果定义了任何构造函数，编译器不会生成默认构造函数',
                '单参数构造函数通常应该声明为explicit',
                '构造函数可以重载以提供多种初始化方式'
            ],
            quiz: [
                { type: 'single', question: '构造函数的名称是？', options: [{ text: '任意名称' }, { text: '与类同名', correct: true }, { text: 'constructor' }, { text: 'init' }], explanation: '构造函数必须与类同名。' },
                { type: 'single', question: '默认构造函数的特点是？', options: [{ text: '必须有参数' }, { text: '不需要参数', correct: true }, { text: '必须是private的' }, { text: '必须有返回值' }], explanation: '默认构造函数是可以无参调用的构造函数。' },
                { type: 'single', question: '如果定义了带参数的构造函数，编译器还会生成默认构造函数吗？', options: [{ text: '会' }, { text: '不会', correct: true }, { text: '取决于参数类型' }, { text: '取决于编译器' }], explanation: '一旦定义了任何构造函数，编译器就不会自动生成默认构造函数。' },
                { type: 'single', question: 'explicit关键字的作用是？', options: [{ text: '允许隐式转换' }, { text: '阻止隐式转换', correct: true }, { text: '删除构造函数' }, { text: '创建默认构造函数' }], explanation: 'explicit阻止构造函数被用于隐式类型转换。' },
                { type: 'single', question: '= default的作用是？', options: [{ text: '删除默认构造函数' }, { text: '显式要求编译器生成默认构造函数', correct: true }, { text: '创建私有构造函数' }, { text: '阻止构造函数调用' }], explanation: '= default显式要求编译器生成合成的默认构造函数。' }
            ]
        },
        {
            id: '7.5',
            title: '初始化列表与成员初始化顺序',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 初始化列表与成员初始化顺序

初始化列表是C++中初始化类成员的推荐方式。

### 初始化列表语法

\`\`\`cpp
class Student {
private:
    std::string name;
    int age;
    double score;
    
public:
    // 使用初始化列表
    Student(const std::string& n, int a, double s) 
        : name(n), age(a), score(s) {
        // 构造函数体可以为空
    }
};
\`\`\`

### 必须使用初始化列表的情况

**1. const成员**：
\`\`\`cpp
class Circle {
private:
    const double PI;  // const成员
    
public:
    Circle() : PI(3.14159) {}  // 必须在初始化列表中初始化
};
\`\`\`

**2. 引用成员**：
\`\`\`cpp
class Wrapper {
private:
    int& ref;  // 引用成员
    
public:
    Wrapper(int& r) : ref(r) {}  // 必须在初始化列表中初始化
};
\`\`\`

**3. 没有默认构造函数的类类型成员**：
\`\`\`cpp
class Engine {
public:
    Engine(int power) {}  // 没有默认构造函数
};

class Car {
private:
    Engine engine;  // 必须在初始化列表中初始化
    
public:
    Car() : engine(100) {}  // 必须使用初始化列表
};
\`\`\`

### 初始化列表 vs 赋值

\`\`\`cpp
class Example {
private:
    std::string name;
    
public:
    // 方式1：初始化列表（推荐）
    Example(const std::string& n) : name(n) {
        // 直接初始化，效率高
    }
    
    // 方式2：构造函数体内赋值
    Example(const std::string& n) {
        name = n;  // 先默认构造，再赋值，效率低
    }
};
\`\`\`

### 成员初始化顺序

**重要**：成员按声明顺序初始化，不是按初始化列表顺序！

\`\`\`cpp
class BadExample {
private:
    int a;
    int b;
    
public:
    BadExample(int val) : b(val), a(b) {}  // 危险！a先初始化，此时b未定义
};

class GoodExample {
private:
    int a;
    int b;
    
public:
    GoodExample(int val) : a(val), b(a) {}  // 安全：a先初始化，然后b用a初始化
};
\`\`\`

### 初始化列表的最佳实践

\`\`\`cpp
class Rectangle {
private:
    double width;
    double height;
    double area;  // 依赖于width和height
    
public:
    Rectangle(double w, double h) 
        : width(w), height(h), area(w * h) {}  // 按声明顺序写初始化列表
};
\`\`\``,
            examples: [
                {
                    title: '初始化列表示例',
                    code: `#include <iostream>
#include <string>

class Person {
private:
    const std::string name;  // const成员
    const int id;            // const成员
    int age;
    
public:
    // 使用初始化列表初始化const成员
    Person(const std::string& n, int i, int a) 
        : name(n), id(i), age(a) {
        std::cout << "创建: " << name << std::endl;
    }
    
    void display() const {
        std::cout << "ID: " << id << ", 姓名: " << name 
                  << ", 年龄: " << age << std::endl;
    }
};

int main() {
    Person p("张三", 1001, 25);
    p.display();
    return 0;
}`,
                    description: 'const成员必须在初始化列表中初始化。'
                },
                {
                    title: '成员初始化顺序',
                    code: `#include <iostream>

class InitOrder {
private:
    int a;
    int b;
    int c;
    
public:
    // 注意：初始化顺序是 a -> b -> c（声明顺序）
    // 不是初始化列表中的顺序
    InitOrder(int val) 
        : c(val * 3),    // 第三个初始化
          a(val),        // 第一个初始化
          b(val * 2)     // 第二个初始化
    {
        std::cout << "初始化顺序: a=" << a << ", b=" << b << ", c=" << c << std::endl;
    }
    
    // 危险示例：依赖未初始化的成员
    InitOrder(bool dangerous, int val)
        : a(val),
          b(a * 2),      // OK: a已初始化
          c(b * 3)       // OK: b已初始化
    {
        std::cout << "正确顺序: a=" << a << ", b=" << b << ", c=" << c << std::endl;
    }
};

int main() {
    InitOrder obj1(10);
    InitOrder obj2(true, 5);
    return 0;
}`,
                    description: '展示成员初始化顺序与声明顺序一致，而非初始化列表顺序。'
                }
            ],
            handsOn: {
                title: '实现包含const成员的类',
                description: '创建一个Product类，包含const成员id和name，以及普通成员price，使用初始化列表初始化。',
                initialCode: `#include <iostream>
#include <string>

class Product {
private:
    // TODO: 添加const成员 id（产品ID）
    // TODO: 添加const成员 name（产品名称）
    // TODO: 添加普通成员 price（价格）
    
public:
    // TODO: 实现构造函数，使用初始化列表
    // 注意：const成员必须在初始化列表中初始化
    
    // TODO: 实现display方法
    
    // TODO: 实现setPrice方法（只能修改price）
};

int main() {
    Product p1("P001", "笔记本电脑", 5999.0);
    p1.display();
    
    p1.setPrice(5499.0);
    p1.display();
    
    // p1.id = "P002";  // 错误！const成员不能修改
    // p1.name = "台式机";  // 错误！const成员不能修改
    
    return 0;
}`,
                expectedOutput: `产品ID: P001, 名称: 笔记本电脑, 价格: 5999
产品ID: P001, 名称: 笔记本电脑, 价格: 5499`,
                solutionRegex: 'const.*id|const.*name|:.*id\\(.*name\\(',
                hint: 'const成员必须在初始化列表中初始化',
                xp: 150
            },
            references: [
                { title: '构造函数初始化列表', book: 'C++ Primer 第五版', chapter: '第7章 7.1.4节' },
                { title: 'cppreference - 成员初始化列表', url: 'https://en.cppreference.com/w/cpp/language/constructor' }
            ],
            assistantTips: [
                '成员按声明顺序初始化，与初始化列表顺序无关',
                'const成员和引用成员必须在初始化列表中初始化',
                '初始化列表比构造函数体内赋值更高效'
            ],
            quiz: [
                { type: 'single', question: 'const成员必须在哪里初始化？', options: [{ text: '构造函数体内' }, { text: '初始化列表', correct: true }, { text: '声明时' }, { text: '析构函数中' }], explanation: 'const成员和引用成员必须在初始化列表中初始化。' },
                { type: 'single', question: '成员初始化顺序取决于？', options: [{ text: '初始化列表顺序' }, { text: '声明顺序', correct: true }, { text: '字母顺序' }, { text: '随机顺序' }], explanation: '成员按在类中声明的顺序初始化，与初始化列表中的顺序无关。' },
                { type: 'single', question: '以下哪种情况必须使用初始化列表？', options: [{ text: '所有成员' }, { text: 'const成员和引用成员', correct: true }, { text: '只有int成员' }, { text: '只有指针成员' }], explanation: 'const成员、引用成员和没有默认构造函数的类类型成员必须在初始化列表中初始化。' },
                { type: 'single', question: '初始化列表相比构造函数体内赋值的优势是？', options: [{ text: '代码更短' }, { text: '效率更高', correct: true }, { text: '可以初始化更多成员' }, { text: '没有区别' }], explanation: '初始化列表直接初始化成员，避免了先默认构造再赋值的开销。' },
                { type: 'single', question: '以下代码有什么问题？', options: [{ text: '没有问题' }, { text: 'b在初始化时a还未初始化', correct: true }, { text: '语法错误' }, { text: '编译器会自动修正' }], explanation: '成员按声明顺序初始化，如果b声明在a之前，初始化b时a还未初始化。' }
            ]
        },
        {
            id: '7.6',
            title: '委托构造函数',
            duration: '25分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 250,
            concepts: `## 委托构造函数

C++11引入了委托构造函数，允许一个构造函数调用另一个构造函数。

### 基本语法

\`\`\`cpp
class Student {
private:
    std::string name;
    int age;
    double score;
    
public:
    // 主构造函数（目标构造函数）
    Student(const std::string& n, int a, double s) 
        : name(n), age(a), score(s) {
        std::cout << "主构造函数" << std::endl;
    }
    
    // 委托构造函数
    Student() : Student("未知", 0, 0.0) {
        std::cout << "委托构造函数" << std::endl;
    }
    
    // 委托给另一个构造函数
    Student(const std::string& n) : Student(n, 18, 60.0) {
        std::cout << "单参数委托" << std::endl;
    }
};
\`\`\`

### 执行顺序

\`\`\`cpp
class Example {
public:
    Example() : Example(0) {
        // 3. 委托构造函数体执行
        std::cout << "默认构造函数体" << std::endl;
    }
    
    Example(int v) : value(v) {
        // 1. 初始化列表执行
        // 2. 目标构造函数体执行
        std::cout << "int构造函数体" << std::endl;
    }
    
private:
    int value;
};

// 调用 Example() 输出：
// int构造函数体
// 默认构造函数体
\`\`\`

### 减少代码重复

**不使用委托构造函数**：
\`\`\`cpp
class BadExample {
private:
    std::string name;
    int age;
    
public:
    BadExample() {
        name = "未知";
        age = 0;
        validate();  // 重复代码
    }
    
    BadExample(const std::string& n, int a) {
        name = n;
        age = a;
        validate();  // 重复代码
    }
    
    void validate() { /* 验证逻辑 */ }
};
\`\`\`

**使用委托构造函数**：
\`\`\`cpp
class GoodExample {
private:
    std::string name;
    int age;
    
public:
    GoodExample(const std::string& n, int a) : name(n), age(a) {
        validate();  // 只写一次
    }
    
    GoodExample() : GoodExample("未知", 0) {}  // 委托
    
    void validate() { /* 验证逻辑 */ }
};
\`\`\`

### 注意事项

\`\`\`cpp
class Warning {
public:
    // 错误：不能同时使用初始化列表和委托
    // Warning() : value(0), Warning(0) {}  // 编译错误！
    
    // 正确：只使用委托
    Warning() : Warning(0) {}
    
    Warning(int v) : value(v) {}
    
private:
    int value;
};
\`\`\`

**规则**：
- 委托构造函数不能有成员初始化列表
- 委托构造函数体在目标构造函数执行完后执行
- 避免循环委托（A委托B，B委托A）`,
            examples: [
                {
                    title: '委托构造函数示例',
                    code: `#include <iostream>
#include <string>

class Date {
private:
    int year;
    int month;
    int day;
    
public:
    // 主构造函数
    Date(int y, int m, int d) : year(y), month(m), day(d) {
        normalize();
        std::cout << "创建日期: ";
        display();
    }
    
    // 委托构造函数
    Date() : Date(2000, 1, 1) {
        std::cout << "（使用默认日期）" << std::endl;
    }
    
    // 委托构造函数
    Date(int y) : Date(y, 1, 1) {
        std::cout << "（只指定年份）" << std::endl;
    }
    
    void normalize() {
        if (month < 1) month = 1;
        if (month > 12) month = 12;
        if (day < 1) day = 1;
        if (day > 31) day = 31;
    }
    
    void display() const {
        std::cout << year << "-" << month << "-" << day << std::endl;
    }
};

int main() {
    Date d1;          // 使用委托
    Date d2(2024);    // 使用委托
    Date d3(2024, 6, 15);  // 直接调用主构造函数
    return 0;
}`,
                    description: '使用委托构造函数减少代码重复。'
                },
                {
                    title: '链式委托',
                    code: `#include <iostream>
#include <string>

class Config {
private:
    std::string host;
    int port;
    bool debug;
    
public:
    // 主构造函数
    Config(const std::string& h, int p, bool d) 
        : host(h), port(p), debug(d) {
        std::cout << "完整配置创建" << std::endl;
    }
    
    // 委托：默认端口
    Config(const std::string& h, bool d) 
        : Config(h, 8080, d) {
        std::cout << "使用默认端口" << std::endl;
    }
    
    // 委托：默认端口和非调试模式
    Config(const std::string& h) 
        : Config(h, false) {
        std::cout << "使用默认配置" << std::endl;
    }
    
    // 委托：全部默认
    Config() : Config("localhost") {
        std::cout << "使用全部默认值" << std::endl;
    }
    
    void display() const {
        std::cout << "Host: " << host << ", Port: " << port 
                  << ", Debug: " << (debug ? "on" : "off") << std::endl;
    }
};

int main() {
    Config c1;
    c1.display();
    
    Config c2("192.168.1.1");
    c2.display();
    
    return 0;
}`,
                    description: '展示链式委托构造函数的使用。'
                }
            ],
            handsOn: {
                title: '实现委托构造函数',
                description: '创建一个Rectangle类，使用委托构造函数实现多种初始化方式。',
                initialCode: `#include <iostream>

class Rectangle {
private:
    double width;
    double height;
    
public:
    // TODO: 实现主构造函数（全参数）
    Rectangle(double w, double h) {
        // 设置宽度和高度
        // 验证：宽度和高度必须为正数
    }
    
    // TODO: 实现委托构造函数（正方形）
    // 委托给主构造函数，宽高相等
    Rectangle(double side) {
        // 委托给 Rectangle(side, side)
    }
    
    // TODO: 实现委托构造函数（默认：单位正方形）
    // 委托给单参数版本
    Rectangle() {
        // 委托给 Rectangle(1.0)
    }
    
    double getArea() const {
        return width * height;
    }
    
    void display() const {
        std::cout << "矩形: " << width << " x " << height 
                  << ", 面积: " << getArea() << std::endl;
    }
};

int main() {
    Rectangle r1;        // 1 x 1
    Rectangle r2(5);     // 5 x 5
    Rectangle r3(4, 6);  // 4 x 6
    
    r1.display();
    r2.display();
    r3.display();
    
    return 0;
}`,
                expectedOutput: `矩形: 1 x 1, 面积: 1
矩形: 5 x 5, 面积: 25
矩形: 4 x 6, 面积: 24`,
                solutionRegex: ': Rectangle\\(|Rectangle\\(.*Rectangle\\(',
                hint: '委托构造函数使用 : ClassName(args) 语法',
                xp: 150
            },
            references: [
                { title: '委托构造函数', book: 'C++ Primer 第五版', chapter: '第7章 7.1.4节' },
                { title: 'cppreference - 委托构造函数', url: 'https://en.cppreference.com/w/cpp/language/constructor#Delegating_constructor' }
            ],
            assistantTips: [
                '委托构造函数可以减少代码重复',
                '委托构造函数不能同时使用初始化列表',
                '避免循环委托（A委托B，B委托A）'
            ],
            quiz: [
                { type: 'single', question: '委托构造函数的语法是？', options: [{ text: 'ClassName() { ClassName(args); }' }, { text: 'ClassName() : ClassName(args) {}', correct: true }, { text: 'ClassName() -> ClassName(args)' }, { text: 'delegate ClassName(args)' }], explanation: '委托构造函数使用初始化列表语法调用另一个构造函数。' },
                { type: 'single', question: '委托构造函数可以同时使用成员初始化列表吗？', options: [{ text: '可以' }, { text: '不可以', correct: true }, { text: '取决于成员类型' }, { text: '只有const成员可以' }], explanation: '委托构造函数不能同时使用成员初始化列表，只能委托给另一个构造函数。' },
                { type: 'single', question: '委托构造函数的执行顺序是？', options: [{ text: '先执行委托函数体' }, { text: '先执行目标构造函数', correct: true }, { text: '同时执行' }, { text: '随机顺序' }], explanation: '目标构造函数先执行，然后执行委托构造函数体。' },
                { type: 'single', question: '委托构造函数的主要优点是？', options: [{ text: '提高运行速度' }, { text: '减少代码重复', correct: true }, { text: '减少内存使用' }, { text: '简化语法' }], explanation: '委托构造函数可以将公共初始化逻辑集中到一个构造函数中。' },
                { type: 'single', question: '以下哪种委托是错误的？', options: [{ text: 'A() : A(0) {}' }, { text: 'A(int) : A() {}' }, { text: 'A() : A(0) {}, A(int) : A() {}', correct: true }, { text: 'A(int) : A(0, 0) {}' }], explanation: '循环委托（A委托B，B委托A）会导致无限递归。' }
            ]
        },
        {
            id: '7.7',
            title: '析构函数',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 250,
            concepts: `## 析构函数

析构函数是对象生命周期结束时自动调用的特殊成员函数。

### 析构函数的特点

- 名称为 \`~类名\`
- 没有返回类型
- 没有参数（不能重载）
- 一个类只能有一个析构函数

### 基本语法

\`\`\`cpp
class Resource {
private:
    int* data;
    
public:
    // 构造函数
    Resource(int size) {
        data = new int[size];
        std::cout << "资源已分配" << std::endl;
    }
    
    // 析构函数
    ~Resource() {
        delete[] data;
        std::cout << "资源已释放" << std::endl;
    }
};

int main() {
    {
        Resource r(100);  // 构造函数被调用
    }  // 离开作用域，析构函数自动调用
}
\`\`\`

### 析构函数调用时机

\`\`\`cpp
void example() {
    Resource r1;       // 1. 局部对象：作用域结束时
    
    Resource* r2 = new Resource();  // 2. 动态对象：delete时
    delete r2;
    
    static Resource r3;  // 3. 静态对象：程序结束时
}  // r1在这里析构
\`\`\`

### 析构顺序

**与构造顺序相反**：

\`\`\`cpp
class A {
public:
    A(int n) : num(n) { std::cout << "A" << num << "构造" << std::endl; }
    ~A() { std::cout << "A" << num << "析构" << std::endl; }
private:
    int num;
};

void test() {
    A a1(1);
    A a2(2);
    A a3(3);
}
// 输出：
// A1构造 A2构造 A3构造
// A3析构 A2析构 A1析构
\`\`\`

### 资源管理

析构函数主要用于释放资源：

\`\`\`cpp
class FileHandler {
private:
    std::ofstream file;
    
public:
    FileHandler(const std::string& filename) {
        file.open(filename);
    }
    
    ~FileHandler() {
        if (file.is_open()) {
            file.close();
            std::cout << "文件已关闭" << std::endl;
        }
    }
    
    void write(const std::string& content) {
        file << content;
    }
};
\`\`\`

### 合成的析构函数

如果没有定义析构函数，编译器会合成一个：

\`\`\`cpp
class SimpleClass {
public:
    int value;
    std::string text;
    // 编译器合成析构函数
    // 会调用 text 的析构函数
    // value 是内置类型，不需要析构
};
\`\`\`

### 析构函数与异常

析构函数不应该抛出异常：

\`\`\`cpp
class BadExample {
public:
    ~BadExample() {
        throw std::runtime_error("错误");  // 危险！
    }
};
\`\`\``,
            examples: [
                {
                    title: '析构函数自动调用',
                    code: `#include <iostream>

class Tracker {
private:
    std::string name;
    
public:
    Tracker(const std::string& n) : name(n) {
        std::cout << name << " 创建" << std::endl;
    }
    
    ~Tracker() {
        std::cout << name << " 销毁" << std::endl;
    }
};

void createAndDestroy() {
    std::cout << "--- 进入函数 ---" << std::endl;
    Tracker t1("局部对象");
    {
        Tracker t2("内部块对象");
    }  // t2在这里析构
    std::cout << "--- 离开函数 ---" << std::endl;
}  // t1在这里析构

int main() {
    std::cout << "=== 程序开始 ===" << std::endl;
    createAndDestroy();
    std::cout << "=== 程序结束 ===" << std::endl;
    return 0;
}`,
                    description: '展示析构函数的自动调用时机和顺序。'
                },
                {
                    title: '资源管理示例',
                    code: `#include <iostream>

class DynamicArray {
private:
    int* data;
    size_t size;
    
public:
    // 构造函数
    DynamicArray(size_t s) : size(s) {
        data = new int[size];
        std::cout << "分配了 " << size << " 个整数的空间" << std::endl;
    }
    
    // 析构函数
    ~DynamicArray() {
        delete[] data;
        std::cout << "释放了 " << size << " 个整数的空间" << std::endl;
    }
    
    // 设置值
    void set(size_t index, int value) {
        if (index < size) {
            data[index] = value;
        }
    }
    
    // 获取值
    int get(size_t index) const {
        return (index < size) ? data[index] : 0;
    }
    
    // 打印所有元素
    void print() const {
        std::cout << "[";
        for (size_t i = 0; i < size; i++) {
            std::cout << data[i];
            if (i < size - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
};

int main() {
    {
        DynamicArray arr(5);
        for (int i = 0; i < 5; i++) {
            arr.set(i, i * 10);
        }
        arr.print();
    }  // arr在这里析构
    std::cout << "数组已超出作用域" << std::endl;
    return 0;
}`,
                    description: '使用析构函数管理动态分配的内存。'
                }
            ],
            handsOn: {
                title: '实现文件句柄类',
                description: '创建一个FileLogger类，在构造函数中打开日志文件，在析构函数中关闭文件。',
                initialCode: `#include <iostream>
#include <fstream>
#include <string>

class FileLogger {
private:
    // TODO: 添加私有成员
    // std::ofstream logFile;
    // std::string filename;
    
public:
    // TODO: 实现构造函数
    // 打开文件，如果失败输出错误信息
    FileLogger(const std::string& fname) {
        // 在此实现
    }
    
    // TODO: 实现析构函数
    // 关闭文件，输出关闭信息
    ~FileLogger() {
        // 在此实现
    }
    
    // TODO: 实现log方法
    // 写入日志信息，格式：[时间戳] 消息
    void log(const std::string& message) {
        // 在此实现
    }
    
    // TODO: 实现isOpen方法
    // 返回文件是否成功打开
    bool isOpen() const {
        // 在此实现
    }
};

int main() {
    {
        FileLogger logger("test.log");
        if (logger.isOpen()) {
            logger.log("程序启动");
            logger.log("执行操作");
            logger.log("程序结束");
        }
    }  // logger在这里析构，文件自动关闭
    std::cout << "日志记录完成" << std::endl;
    return 0;
}`,
                expectedOutput: `打开日志文件: test.log
写入日志: [LOG] 程序启动
写入日志: [LOG] 执行操作
写入日志: [LOG] 程序结束
关闭日志文件: test.log
日志记录完成`,
                solutionRegex: '~FileLogger|logFile\\.close|logFile\\.is_open',
                hint: '析构函数中检查文件是否打开后再关闭',
                xp: 150
            },
            references: [
                { title: '析构函数', book: 'C++ Primer 第五版', chapter: '第7章 7.1.4节' },
                { title: 'cppreference - 析构函数', url: 'https://en.cppreference.com/w/cpp/language/destructor' }
            ],
            assistantTips: [
                '析构函数用于释放资源，如内存、文件句柄等',
                '析构顺序与构造顺序相反',
                '析构函数不应该抛出异常'
            ],
            quiz: [
                { type: 'single', question: '析构函数的名称是？', options: [{ text: '~类名', correct: true }, { text: 'destructor' }, { text: '~destructor' }, { text: 'finalize' }], explanation: '析构函数名称为波浪号加类名，如 ~MyClass()。' },
                { type: 'single', question: '析构函数可以有参数吗？', options: [{ text: '可以' }, { text: '不可以', correct: true }, { text: '只能有一个参数' }, { text: '可以有默认参数' }], explanation: '析构函数没有参数，因此不能重载。' },
                { type: 'single', question: '局部对象的析构函数何时调用？', options: [{ text: '创建时' }, { text: '作用域结束时', correct: true }, { text: '程序结束时' }, { text: '手动调用时' }], explanation: '局部对象在离开其作用域时自动调用析构函数。' },
                { type: 'single', question: '析构顺序与构造顺序的关系是？', options: [{ text: '相同' }, { text: '相反', correct: true }, { text: '随机' }, { text: '取决于类型' }], explanation: '析构顺序与构造顺序相反，后构造的先析构。' },
                { type: 'single', question: '析构函数的主要用途是？', options: [{ text: '初始化对象' }, { text: '释放资源', correct: true }, { text: '创建对象' }, { text: '复制对象' }], explanation: '析构函数主要用于释放对象持有的资源。' }
            ]
        },
        {
            id: '7.8',
            title: '拷贝构造函数与拷贝赋值运算符',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 400,
            concepts: `## 拷贝构造函数与拷贝赋值运算符

拷贝控制是C++类设计的核心内容，控制对象如何被复制。

### 拷贝构造函数

当一个对象被另一个同类型对象初始化时调用：

\`\`\`cpp
class String {
private:
    char* data;
    size_t length;
    
public:
    // 拷贝构造函数
    String(const String& other) {
        length = other.length;
        data = new char[length + 1];
        strcpy(data, other.data);
        std::cout << "拷贝构造" << std::endl;
    }
};

String s1("hello");
String s2 = s1;  // 拷贝构造
String s3(s1);   // 拷贝构造
\`\`\`

### 拷贝构造函数调用时机

\`\`\`cpp
void func(String s);     // 值传递

String s1;
String s2 = s1;          // 1. 对象初始化
String s3(s1);           // 2. 直接初始化
func(s1);                // 3. 函数参数传递
return s1;               // 4. 函数返回值
\`\`\`

### 拷贝赋值运算符

当已存在的对象被赋值时调用：

\`\`\`cpp
class String {
public:
    // 拷贝赋值运算符
    String& operator=(const String& other) {
        if (this != &other) {  // 检查自赋值
            delete[] data;      // 释放旧资源
            length = other.length;
            data = new char[length + 1];
            strcpy(data, other.data);
        }
        return *this;
    }
};

String s1, s2;
s1 = s2;  // 拷贝赋值
\`\`\`

### 深拷贝 vs 浅拷贝

**浅拷贝（默认行为）**：
\`\`\`cpp
class ShallowCopy {
public:
    int* ptr;
    ShallowCopy(int v) { ptr = new int(v); }
    // 编译器合成的拷贝构造函数只复制指针值
};

ShallowCopy a(10);
ShallowCopy b = a;  // b.ptr 和 a.ptr 指向同一内存！
// 问题：析构时会 delete 同一内存两次
\`\`\`

**深拷贝（正确做法）**：
\`\`\`cpp
class DeepCopy {
public:
    int* ptr;
    DeepCopy(int v) { ptr = new int(v); }
    
    // 深拷贝构造函数
    DeepCopy(const DeepCopy& other) {
        ptr = new int(*other.ptr);  // 分配新内存
    }
    
    // 深拷贝赋值运算符
    DeepCopy& operator=(const DeepCopy& other) {
        if (this != &other) {
            delete ptr;
            ptr = new int(*other.ptr);
        }
        return *this;
    }
    
    ~DeepCopy() { delete ptr; }
};
\`\`\`

### 完整示例

\`\`\`cpp
class MyString {
private:
    char* data;
    
public:
    // 构造函数
    MyString(const char* s = "") {
        data = new char[strlen(s) + 1];
        strcpy(data, s);
    }
    
    // 析构函数
    ~MyString() {
        delete[] data;
    }
    
    // 拷贝构造函数
    MyString(const MyString& other) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
    }
    
    // 拷贝赋值运算符
    MyString& operator=(const MyString& other) {
        if (this != &other) {
            delete[] data;
            data = new char[strlen(other.data) + 1];
            strcpy(data, other.data);
        }
        return *this;
    }
};
\`\`\``,
            examples: [
                {
                    title: '深拷贝示例',
                    code: `#include <iostream>
#include <cstring>

class MyBuffer {
private:
    int* buffer;
    size_t size;
    
public:
    // 构造函数
    MyBuffer(size_t s) : size(s) {
        buffer = new int[size];
        for (size_t i = 0; i < size; i++) {
            buffer[i] = 0;
        }
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    // 析构函数
    ~MyBuffer() {
        delete[] buffer;
        std::cout << "析构: " << size << " 个元素" << std::endl;
    }
    
    // 拷贝构造函数（深拷贝）
    MyBuffer(const MyBuffer& other) : size(other.size) {
        buffer = new int[size];
        for (size_t i = 0; i < size; i++) {
            buffer[i] = other.buffer[i];
        }
        std::cout << "拷贝构造" << std::endl;
    }
    
    // 拷贝赋值运算符（深拷贝）
    MyBuffer& operator=(const MyBuffer& other) {
        if (this != &other) {
            delete[] buffer;
            size = other.size;
            buffer = new int[size];
            for (size_t i = 0; i < size; i++) {
                buffer[i] = other.buffer[i];
            }
            std::cout << "拷贝赋值" << std::endl;
        }
        return *this;
    }
    
    void set(size_t index, int value) {
        if (index < size) buffer[index] = value;
    }
    
    int get(size_t index) const {
        return (index < size) ? buffer[index] : 0;
    }
};

int main() {
    MyBuffer b1(5);
    for (int i = 0; i < 5; i++) b1.set(i, i + 1);
    
    MyBuffer b2 = b1;  // 拷贝构造
    b2.set(0, 100);    // 修改b2不影响b1
    
    std::cout << "b1[0] = " << b1.get(0) << std::endl;
    std::cout << "b2[0] = " << b2.get(0) << std::endl;
    
    return 0;
}`,
                    description: '展示深拷贝的正确实现。'
                },
                {
                    title: '拷贝构造 vs 拷贝赋值',
                    code: `#include <iostream>
#include <string>

class Tracker {
private:
    std::string name;
    
public:
    Tracker(const std::string& n) : name(n) {
        std::cout << "构造: " << name << std::endl;
    }
    
    // 拷贝构造函数
    Tracker(const Tracker& other) : name(other.name + "_copy") {
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    // 拷贝赋值运算符
    Tracker& operator=(const Tracker& other) {
        name = other.name + "_assigned";
        std::cout << "拷贝赋值: " << name << std::endl;
        return *this;
    }
    
    void print() const {
        std::cout << "对象: " << name << std::endl;
    }
};

int main() {
    std::cout << "--- 创建对象 ---" << std::endl;
    Tracker t1("original");
    
    std::cout << "\\n--- 拷贝构造 ---" << std::endl;
    Tracker t2 = t1;  // 拷贝构造
    t2.print();
    
    std::cout << "\\n--- 拷贝赋值 ---" << std::endl;
    Tracker t3("another");
    t3 = t1;  // 拷贝赋值
    t3.print();
    
    return 0;
}`,
                    description: '区分拷贝构造函数和拷贝赋值运算符的调用时机。'
                }
            ],
            handsOn: {
                title: '实现完整的拷贝控制',
                description: '创建一个SimpleArray类，实现深拷贝的拷贝构造函数和拷贝赋值运算符。',
                initialCode: `#include <iostream>

class SimpleArray {
private:
    int* data;
    size_t size;
    
public:
    // 构造函数
    SimpleArray(size_t s) : size(s) {
        data = new int[size];
        for (size_t i = 0; i < size; i++) {
            data[i] = 0;
        }
    }
    
    // TODO: 实现析构函数
    ~SimpleArray() {
        // 在此实现
    }
    
    // TODO: 实现拷贝构造函数（深拷贝）
    SimpleArray(const SimpleArray& other) {
        // 在此实现深拷贝
        // 1. 分配新内存
        // 2. 复制数据
    }
    
    // TODO: 实现拷贝赋值运算符（深拷贝）
    SimpleArray& operator=(const SimpleArray& other) {
        // 在此实现深拷贝赋值
        // 1. 检查自赋值
        // 2. 释放旧内存
        // 3. 分配新内存
        // 4. 复制数据
        // 5. 返回 *this
    }
    
    void set(size_t index, int value) {
        if (index < size) data[index] = value;
    }
    
    int get(size_t index) const {
        return (index < size) ? data[index] : 0;
    }
    
    void print() const {
        std::cout << "[";
        for (size_t i = 0; i < size; i++) {
            std::cout << data[i];
            if (i < size - 1) std::cout << ", ";
        }
        std::cout << "]";
    }
};

int main() {
    SimpleArray a1(5);
    for (int i = 0; i < 5; i++) a1.set(i, i * 10);
    
    SimpleArray a2 = a1;  // 拷贝构造
    a2.set(0, 999);
    
    SimpleArray a3(3);
    a3 = a1;  // 拷贝赋值
    
    std::cout << "a1: "; a1.print(); std::cout << std::endl;
    std::cout << "a2: "; a2.print(); std::cout << std::endl;
    std::cout << "a3: "; a3.print(); std::cout << std::endl;
    
    return 0;
}`,
                expectedOutput: `a1: [0, 10, 20, 30, 40]
a2: [999, 10, 20, 30, 40]
a3: [0, 10, 20, 30, 40]`,
                solutionRegex: 'delete\\[\\].*data|new int\\[.*other\\.size|this != &other',
                hint: '拷贝赋值运算符必须检查自赋值',
                xp: 200
            },
            references: [
                { title: '拷贝控制', book: 'C++ Primer 第五版', chapter: '第13章 13.1节' },
                { title: 'cppreference - 拷贝构造函数', url: 'https://en.cppreference.com/w/cpp/language/copy_constructor' }
            ],
            assistantTips: [
                '拷贝构造函数用于初始化，拷贝赋值用于已存在对象的赋值',
                '深拷贝需要分配新内存并复制内容',
                '拷贝赋值运算符必须检查自赋值'
            ],
            quiz: [
                { type: 'single', question: '拷贝构造函数的参数类型是？', options: [{ text: '类类型' }, { text: '类类型的引用', correct: true }, { text: '类类型的指针' }, { text: '任意类型' }], explanation: '拷贝构造函数的参数必须是同类型的引用，通常为const引用。' },
                { type: 'single', question: 'String s2 = s1; 调用的是？', options: [{ text: '默认构造函数' }, { text: '拷贝构造函数', correct: true }, { text: '拷贝赋值运算符' }, { text: '移动构造函数' }], explanation: '对象初始化时调用拷贝构造函数。' },
                { type: 'single', question: 's1 = s2; （s1已存在）调用的是？', options: [{ text: '拷贝构造函数' }, { text: '拷贝赋值运算符', correct: true }, { text: '默认构造函数' }, { text: '析构函数' }], explanation: '已存在的对象被赋值时调用拷贝赋值运算符。' },
                { type: 'single', question: '深拷贝和浅拷贝的区别是？', options: [{ text: '深拷贝更快' }, { text: '深拷贝复制指针指向的内容', correct: true }, { text: '浅拷贝更安全' }, { text: '没有区别' }], explanation: '深拷贝复制指针指向的实际数据，浅拷贝只复制指针值。' },
                { type: 'single', question: '拷贝赋值运算符为什么需要检查自赋值？', options: [{ text: '提高效率' }, { text: '避免释放资源后无法访问', correct: true }, { text: '语法要求' }, { text: '编译器要求' }], explanation: '自赋值时如果先释放资源，就无法复制数据了。' }
            ]
        },
        {
            id: '7.9',
            title: '阻止拷贝（= delete）',
            duration: '25分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 250,
            concepts: `## 阻止拷贝（= delete）

某些类不应该被拷贝，可以使用 = delete 阻止拷贝操作。

### = delete 语法

\`\`\`cpp
class NonCopyable {
public:
    NonCopyable() = default;
    
    // 删除拷贝构造函数
    NonCopyable(const NonCopyable&) = delete;
    
    // 删除拷贝赋值运算符
    NonCopyable& operator=(const NonCopyable&) = delete;
};

NonCopyable a;
NonCopyable b = a;  // 编译错误！
a = b;              // 编译错误！
\`\`\`

### 应该阻止拷贝的情况

**1. 表示唯一实体的类**：
\`\`\`cpp
class Singleton {
private:
    static Singleton* instance;
    
public:
    // 删除拷贝操作
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
    
    static Singleton* getInstance() {
        if (!instance) instance = new Singleton();
        return instance;
    }
};
\`\`\`

**2. 管理独占资源的类**：
\`\`\`cpp
class FileHandle {
private:
    FILE* file;
    
public:
    FileHandle(const char* filename) {
        file = fopen(filename, "r");
    }
    
    ~FileHandle() {
        if (file) fclose(file);
    }
    
    // 文件句柄不应该被拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};
\`\`\`

**3. 不可复制的资源**：
\`\`\`cpp
class Mutex {
public:
    Mutex() = default;
    
    // 互斥锁不应该被拷贝
    Mutex(const Mutex&) = delete;
    Mutex& operator=(const Mutex&) = delete;
    
    void lock() { /* ... */ }
    void unlock() { /* ... */ }
};
\`\`\`

### 删除的函数不能被调用

\`\`\`cpp
class Example {
public:
    Example() = default;
    Example(const Example&) = delete;
};

void func(Example e);  // 值传递会调用拷贝构造

Example obj;
func(obj);  // 编译错误！拷贝构造函数被删除

void func2(const Example& e);  // 使用引用
func2(obj);  // OK
\`\`\`

### 删除其他函数

= delete 不仅可以用于拷贝控制：

\`\`\`cpp
class Math {
public:
    // 删除特定重载
    void calculate(double) = delete;  // 禁止double参数
    
    void calculate(int x) {
        std::cout << "计算: " << x << std::endl;
    }
};

Math m;
m.calculate(10);    // OK
m.calculate(3.14);  // 编译错误！
\`\`\`

### C++11之前的方法

在C++11之前，通过声明为private且不定义来阻止拷贝：

\`\`\`cpp
class OldStyle {
private:
    OldStyle(const OldStyle&);  // 声明为private
    OldStyle& operator=(const OldStyle&);
    // 不提供定义
};
\`\`\``,
            examples: [
                {
                    title: '不可拷贝的类',
                    code: `#include <iostream>

class UniqueID {
private:
    static int nextId;
    int id;
    
public:
    UniqueID() : id(nextId++) {
        std::cout << "创建ID: " << id << std::endl;
    }
    
    ~UniqueID() {
        std::cout << "销毁ID: " << id << std::endl;
    }
    
    // 阻止拷贝
    UniqueID(const UniqueID&) = delete;
    UniqueID& operator=(const UniqueID&) = delete;
    
    // 允许移动
    UniqueID(UniqueID&& other) noexcept : id(other.id) {
        other.id = -1;
        std::cout << "移动ID: " << id << std::endl;
    }
    
    int getId() const { return id; }
};

int UniqueID::nextId = 1;

int main() {
    UniqueID id1;
    UniqueID id2;
    
    // UniqueID id3 = id1;  // 编译错误！
    // id1 = id2;           // 编译错误！
    
    std::cout << "ID1 = " << id1.getId() << std::endl;
    std::cout << "ID2 = " << id2.getId() << std::endl;
    
    return 0;
}`,
                    description: '使用 = delete 阻止拷贝，确保每个对象唯一。'
                },
                {
                    title: '删除特定函数重载',
                    code: `#include <iostream>

class Integer {
private:
    int value;
    
public:
    Integer(int v) : value(v) {}
    
    // 删除bool转换，防止意外行为
    operator bool() const = delete;
    
    // 显式转换函数
    int toInt() const { return value; }
    
    void print() const {
        std::cout << "值: " << value << std::endl;
    }
};

int main() {
    Integer i(42);
    i.print();
    
    // if (i) { }  // 编译错误！bool转换被删除
    
    int v = i.toInt();  // OK，显式调用
    std::cout << "转换后: " << v << std::endl;
    
    return 0;
}`,
                    description: '使用 = delete 删除特定的类型转换。'
                }
            ],
            handsOn: {
                title: '实现不可拷贝的数据库连接类',
                description: '创建一个DatabaseConnection类，阻止拷贝操作，确保连接的唯一性。',
                initialCode: `#include <iostream>
#include <string>

class DatabaseConnection {
private:
    std::string connectionString;
    bool connected;
    
public:
    DatabaseConnection(const std::string& connStr) 
        : connectionString(connStr), connected(false) {
        std::cout << "创建连接: " << connectionString << std::endl;
    }
    
    ~DatabaseConnection() {
        if (connected) {
            disconnect();
        }
        std::cout << "销毁连接: " << connectionString << std::endl;
    }
    
    // TODO: 使用 = delete 阻止拷贝构造函数
    
    // TODO: 使用 = delete 阻止拷贝赋值运算符
    
    void connect() {
        if (!connected) {
            connected = true;
            std::cout << "已连接到数据库" << std::endl;
        }
    }
    
    void disconnect() {
        if (connected) {
            connected = false;
            std::cout << "已断开数据库连接" << std::endl;
        }
    }
    
    void execute(const std::string& query) {
        if (connected) {
            std::cout << "执行查询: " << query << std::endl;
        } else {
            std::cout << "错误：未连接到数据库" << std::endl;
        }
    }
};

int main() {
    DatabaseConnection db1("localhost:3306");
    db1.connect();
    db1.execute("SELECT * FROM users");
    
    // DatabaseConnection db2 = db1;  // 应该编译错误
    // db1 = DatabaseConnection("other");  // 应该编译错误
    
    return 0;
}`,
                expectedOutput: `创建连接: localhost:3306
已连接到数据库
执行查询: SELECT * FROM users
销毁连接: localhost:3306`,
                solutionRegex: '= delete|=delete',
                hint: '在拷贝构造函数和拷贝赋值运算符后添加 = delete',
                xp: 150
            },
            references: [
                { title: '删除的函数', book: 'C++ Primer 第五版', chapter: '第13章 13.1.6节' },
                { title: 'cppreference - 删除的函数', url: 'https://en.cppreference.com/w/cpp/language/function#Deleted_functions' }
            ],
            assistantTips: [
                '= delete 可以阻止函数被调用',
                '管理独占资源的类应该删除拷贝操作',
                '删除的函数参与重载决议，但调用时会编译错误'
            ],
            quiz: [
                { type: 'single', question: '= delete 的作用是？', options: [{ text: '删除对象' }, { text: '阻止函数被调用', correct: true }, { text: '删除类' }, { text: '删除变量' }], explanation: '= delete 告诉编译器不要生成该函数，调用会导致编译错误。' },
                { type: 'single', question: '以下哪种类应该阻止拷贝？', options: [{ text: '简单数据类' }, { text: '管理独占资源的类', correct: true }, { text: '所有类' }, { text: '没有成员的类' }], explanation: '管理独占资源（如文件句柄、网络连接）的类不应该被拷贝。' },
                { type: 'single', question: '删除拷贝构造函数后，还能通过值传递该类型的参数吗？', options: [{ text: '可以' }, { text: '不可以', correct: true }, { text: '取决于编译器' }, { text: '取决于参数类型' }], explanation: '值传递需要调用拷贝构造函数，删除后无法值传递。' },
                { type: 'single', question: '= delete 可以用于普通函数吗？', options: [{ text: '不可以' }, { text: '可以', correct: true }, { text: '只能用于成员函数' }, { text: '只能用于构造函数' }], explanation: '= delete 可以用于任何函数，包括普通函数和成员函数。' },
                { type: 'single', question: 'C++11之前如何阻止拷贝？', options: [{ text: '使用 = delete' }, { text: '声明为private且不定义', correct: true }, { text: '使用 final' }, { text: '使用 override' }], explanation: 'C++11之前通过声明为private且不定义来阻止拷贝。' }
            ]
        },
        {
            id: '7.10',
            title: '移动构造函数与移动赋值运算符基础',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 移动构造函数与移动赋值运算符基础

C++11引入了移动语义，可以高效地转移资源所有权。

### 为什么需要移动语义

\`\`\`cpp
// 传统拷贝：需要分配新内存并复制数据
std::vector<int> v1 = {1, 2, 3, 4, 5};
std::vector<int> v2 = v1;  // 深拷贝，开销大

// 移动：直接转移资源所有权
std::vector<int> v3 = std::move(v1);  // v1变为空，v3接管数据
\`\`\`

### 右值引用

移动语义基于右值引用 \`&&\`：

\`\`\`cpp
int x = 10;        // x是左值
int& lr = x;       // 左值引用
int&& rr = 10;     // 右值引用（绑定到右值）
int&& rr2 = x+1;   // 右值引用（绑定到临时值）
// int&& rr3 = x;   // 错误！右值引用不能绑定到左值
\`\`\`

### std::move

将左值转换为右值引用：

\`\`\`cpp
std::string s1 = "hello";
std::string s2 = std::move(s1);  // s1的内容被移动到s2
// s1现在处于有效但未定义的状态
\`\`\`

### 移动构造函数

\`\`\`cpp
class MyString {
private:
    char* data;
    size_t length;
    
public:
    // 移动构造函数
    MyString(MyString&& other) noexcept 
        : data(other.data), length(other.length) {
        other.data = nullptr;   // 源对象置空
        other.length = 0;
        std::cout << "移动构造" << std::endl;
    }
};

MyString s1("hello");
MyString s2 = std::move(s1);  // 调用移动构造函数
\`\`\`

### 移动赋值运算符

\`\`\`cpp
class MyString {
public:
    // 移动赋值运算符
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            delete[] data;          // 释放当前资源
            data = other.data;      // 接管资源
            length = other.length;
            other.data = nullptr;   // 源对象置空
            other.length = 0;
        }
        return *this;
    }
};

MyString s1, s2("hello");
s1 = std::move(s2);  // 调用移动赋值运算符
\`\`\`

### noexcept 关键字

移动操作通常声明为 noexcept：

\`\`\`cpp
MyString(MyString&& other) noexcept;  // 承诺不抛出异常
\`\`\`

**好处**：
- 标准容器在重新分配时会优先使用移动操作
- 编译器可以生成更优化的代码

### 移动 vs 拷贝

\`\`\`cpp
std::vector<MyString> vec;
MyString s("hello");

vec.push_back(s);              // 拷贝
vec.push_back(std::move(s));   // 移动，s之后不可用
vec.push_back(MyString("world"));  // 移动（临时对象是右值）
\`\`\``,
            examples: [
                {
                    title: '移动语义示例',
                    code: `#include <iostream>
#include <cstring>

class Buffer {
private:
    int* data;
    size_t size;
    
public:
    // 构造函数
    Buffer(size_t s) : size(s) {
        data = new int[size];
        std::cout << "构造: " << size << " 个元素" << std::endl;
    }
    
    // 析构函数
    ~Buffer() {
        delete[] data;
        std::cout << "析构" << std::endl;
    }
    
    // 拷贝构造函数
    Buffer(const Buffer& other) : size(other.size) {
        data = new int[size];
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "拷贝构造" << std::endl;
    }
    
    // 移动构造函数
    Buffer(Buffer&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        std::cout << "移动构造" << std::endl;
    }
    
    // 移动赋值运算符
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        std::cout << "移动赋值" << std::endl;
        return *this;
    }
};

int main() {
    Buffer b1(1000);
    Buffer b2 = std::move(b1);  // 移动构造
    
    Buffer b3(100);
    b3 = std::move(b2);  // 移动赋值
    
    return 0;
}`,
                    description: '展示移动构造函数和移动赋值运算符的实现。'
                },
                {
                    title: '移动语义的性能优势',
                    code: `#include <iostream>
#include <vector>
#include <string>

class HeavyObject {
private:
    std::vector<int> data;
    
public:
    HeavyObject(size_t n) : data(n, 0) {
        std::cout << "创建 " << n << " 个元素" << std::endl;
    }
    
    // 拷贝构造
    HeavyObject(const HeavyObject& other) : data(other.data) {
        std::cout << "拷贝 " << data.size() << " 个元素" << std::endl;
    }
    
    // 移动构造
    HeavyObject(HeavyObject&& other) noexcept 
        : data(std::move(other.data)) {
        std::cout << "移动 " << data.size() << " 个元素" << std::endl;
    }
};

HeavyObject createHeavyObject() {
    return HeavyObject(10000);  // 返回临时对象
}

int main() {
    std::cout << "--- 直接初始化 ---" << std::endl;
    HeavyObject obj1 = createHeavyObject();  // 可能使用移动或RVO
    
    std::cout << "\\n--- 显式移动 ---" << std::endl;
    HeavyObject obj2(5000);
    HeavyObject obj3 = std::move(obj2);  // 显式移动
    
    return 0;
}`,
                    description: '展示移动语义在处理大对象时的性能优势。'
                }
            ],
            handsOn: {
                title: '实现移动语义',
                description: '为DynamicBuffer类实现移动构造函数和移动赋值运算符。',
                initialCode: `#include <iostream>

class DynamicBuffer {
private:
    int* data;
    size_t size;
    
public:
    DynamicBuffer(size_t s = 0) : size(s) {
        data = (s > 0) ? new int[s] : nullptr;
        std::cout << "构造: " << size << std::endl;
    }
    
    ~DynamicBuffer() {
        delete[] data;
        std::cout << "析构: " << size << std::endl;
    }
    
    // 拷贝构造函数
    DynamicBuffer(const DynamicBuffer& other) : size(other.size) {
        data = new int[size];
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "拷贝构造" << std::endl;
    }
    
    // TODO: 实现移动构造函数
    DynamicBuffer(DynamicBuffer&& other) noexcept {
        // 在此实现移动构造
        // 1. 接管 other 的资源
        // 2. 将 other 置为安全状态
    }
    
    // TODO: 实现移动赋值运算符
    DynamicBuffer& operator=(DynamicBuffer&& other) noexcept {
        // 在此实现移动赋值
        // 1. 检查自赋值
        // 2. 释放当前资源
        // 3. 接管 other 的资源
        // 4. 将 other 置为安全状态
        // 5. 返回 *this
    }
    
    size_t getSize() const { return size; }
};

int main() {
    DynamicBuffer b1(100);
    std::cout << "b1 size: " << b1.getSize() << std::endl;
    
    DynamicBuffer b2 = std::move(b1);  // 移动构造
    std::cout << "b1 size after move: " << b1.getSize() << std::endl;
    std::cout << "b2 size: " << b2.getSize() << std::endl;
    
    DynamicBuffer b3;
    b3 = std::move(b2);  // 移动赋值
    std::cout << "b2 size after move: " << b2.getSize() << std::endl;
    std::cout << "b3 size: " << b3.getSize() << std::endl;
    
    return 0;
}`,
                expectedOutput: `构造: 100
b1 size: 100
移动构造
b1 size after move: 0
b2 size: 100
构造: 0
移动赋值
b2 size after move: 0
b3 size: 100
析构: 100
析构: 0
析构: 0`,
                solutionRegex: 'noexcept|other\\.data = nullptr|other\\.size = 0',
                hint: '移动操作应该将源对象置为安全状态（指针为nullptr，size为0）',
                xp: 200
            },
            references: [
                { title: '移动语义', book: 'C++ Primer 第五版', chapter: '第13章 13.6节' },
                { title: 'cppreference - 移动构造函数', url: 'https://en.cppreference.com/w/cpp/language/move_constructor' }
            ],
            assistantTips: [
                '移动操作转移资源所有权，而不是复制',
                '移动后的源对象应该处于有效但未定义的状态',
                '移动操作通常声明为noexcept'
            ],
            quiz: [
                { type: 'single', question: '右值引用的语法是？', options: [{ text: 'T&' }, { text: 'T&&', correct: true }, { text: 'T*' }, { text: 'const T&' }], explanation: '右值引用使用双与号 && 声明。' },
                { type: 'single', question: 'std::move的作用是？', options: [{ text: '移动对象' }, { text: '将左值转换为右值引用', correct: true }, { text: '删除对象' }, { text: '拷贝对象' }], explanation: 'std::move 将左值转换为右值引用，使移动语义生效。' },
                { type: 'single', question: '移动构造函数的参数类型是？', options: [{ text: 'const T&' }, { text: 'T&' }, { text: 'T&&', correct: true }, { text: 'const T&&' }], explanation: '移动构造函数接受右值引用参数 T&&。' },
                { type: 'single', question: '移动操作通常声明为noexcept的原因是？', options: [{ text: '语法要求' }, { text: '提高性能，标准容器优化', correct: true }, { text: '防止内存泄漏' }, { text: '编译器要求' }], explanation: 'noexcept 允许标准容器在重新分配时使用移动而非拷贝。' },
                { type: 'single', question: '移动后源对象的状态是？', options: [{ text: '被删除' }, { text: '有效但未定义', correct: true }, { text: '与之前相同' }, { text: '不可用' }], explanation: '移动后源对象应该处于有效但未定义的状态，可以安全析构。' }
            ]
        },
        {
            id: '7.11',
            title: '合成的拷贝控制与三五法则',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 合成的拷贝控制与三五法则

理解编译器自动生成的拷贝控制成员和三五法则。

### 合成的拷贝控制成员

如果用户没有定义，编译器会自动生成：

| 成员 | 合成条件 | 行为 |
|------|---------|------|
| 默认构造函数 | 没有任何构造函数 | 成员默认初始化 |
| 析构函数 | 总是合成 | 成员逆序析构 |
| 拷贝构造函数 | 没有定义移动操作 | 成员逐个拷贝 |
| 拷贝赋值运算符 | 没有定义移动操作 | 成员逐个赋值 |
| 移动构造函数 | 没有定义拷贝操作且所有成员可移动 | 成员逐个移动 |
| 移动赋值运算符 | 没有定义拷贝操作且所有成员可移动 | 成员逐个移动赋值 |

### 三五法则

如果类需要自定义以下任何一个，通常需要自定义全部五个：

1. **析构函数**
2. **拷贝构造函数**
3. **拷贝赋值运算符**
4. **移动构造函数**（C++11）
5. **移动赋值运算符**（C++11）

### 为什么需要三五法则

\`\`\`cpp
class BadExample {
public:
    int* data;
    
    BadExample(int v) : data(new int(v)) {}
    
    ~BadExample() { delete data; }  // 定义了析构函数
    
    // 没有定义拷贝操作！
    // 编译器合成的拷贝构造函数只复制指针值
    // 导致两个对象指向同一内存，析构时重复删除
};

BadExample a(10);
BadExample b = a;  // 浅拷贝！
// 析构时 a.data 和 b.data 被删除两次！
\`\`\`

### 正确的实现

\`\`\`cpp
class GoodExample {
public:
    int* data;
    
    GoodExample(int v) : data(new int(v)) {}
    
    // 1. 析构函数
    ~GoodExample() { delete data; }
    
    // 2. 拷贝构造函数
    GoodExample(const GoodExample& other) 
        : data(new int(*other.data)) {}
    
    // 3. 拷贝赋值运算符
    GoodExample& operator=(const GoodExample& other) {
        if (this != &other) {
            delete data;
            data = new int(*other.data);
        }
        return *this;
    }
    
    // 4. 移动构造函数
    GoodExample(GoodExample&& other) noexcept : data(other.data) {
        other.data = nullptr;
    }
    
    // 5. 移动赋值运算符
    GoodExample& operator=(GoodExample&& other) noexcept {
        if (this != &other) {
            delete data;
            data = other.data;
            other.data = nullptr;
        }
        return *this;
    }
};
\`\`\`

### 使用 = default 和 = delete

\`\`\`cpp
class SimpleClass {
public:
    // 使用合成的默认实现
    SimpleClass() = default;
    ~SimpleClass() = default;
    SimpleClass(const SimpleClass&) = default;
    SimpleClass& operator=(const SimpleClass&) = default;
    SimpleClass(SimpleClass&&) = default;
    SimpleClass& operator=(SimpleClass&&) = default;
};

class NonCopyable {
public:
    NonCopyable() = default;
    // 删除拷贝操作
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable& operator=(const NonCopyable&) = delete;
    // 移动操作也被隐式删除
};
\`\`\`

### 何时需要自定义拷贝控制

**需要自定义的情况**：
- 类管理动态内存
- 类持有系统资源（文件句柄、网络连接等）
- 类需要深拷贝语义

**不需要自定义的情况**：
- 类只包含标准库容器（vector、string等）
- 类没有资源管理需求
- 使用智能指针管理资源`,
            examples: [
                {
                    title: '三五法则示例',
                    code: `#include <iostream>

class Resource {
private:
    int* data;
    std::string name;
    
public:
    // 构造函数
    Resource(const std::string& n, int v) : name(n) {
        data = new int(v);
        std::cout << "创建资源: " << name << std::endl;
    }
    
    // 1. 析构函数
    ~Resource() {
        delete data;
        std::cout << "销毁资源: " << name << std::endl;
    }
    
    // 2. 拷贝构造函数
    Resource(const Resource& other) : name(other.name + "_copy") {
        data = new int(*other.data);
        std::cout << "拷贝构造: " << name << std::endl;
    }
    
    // 3. 拷贝赋值运算符
    Resource& operator=(const Resource& other) {
        if (this != &other) {
            delete data;
            data = new int(*other.data);
            name = other.name + "_assigned";
            std::cout << "拷贝赋值: " << name << std::endl;
        }
        return *this;
    }
    
    // 4. 移动构造函数
    Resource(Resource&& other) noexcept 
        : data(other.data), name(std::move(other.name)) {
        other.data = nullptr;
        name += "_moved";
        std::cout << "移动构造: " << name << std::endl;
    }
    
    // 5. 移动赋值运算符
    Resource& operator=(Resource&& other) noexcept {
        if (this != &other) {
            delete data;
            data = other.data;
            name = std::move(other.name) + "_moved";
            other.data = nullptr;
            std::cout << "移动赋值: " << name << std::endl;
        }
        return *this;
    }
    
    void print() const {
        if (data) {
            std::cout << name << ": " << *data << std::endl;
        } else {
            std::cout << name << ": (空)" << std::endl;
        }
    }
};

int main() {
    Resource r1("R1", 100);
    Resource r2 = r1;           // 拷贝构造
    Resource r3 = std::move(r1); // 移动构造
    
    r2.print();
    r3.print();
    r1.print();  // r1已被移动
    
    return 0;
}`,
                    description: '展示三五法则的完整实现。'
                },
                {
                    title: '使用智能指针避免手动管理',
                    code: `#include <iostream>
#include <memory>
#include <string>

// 使用智能指针，不需要手动实现拷贝控制
class ModernResource {
private:
    std::unique_ptr<int> data;
    std::string name;
    
public:
    ModernResource(const std::string& n, int v) 
        : data(std::make_unique<int>(v)), name(n) {
        std::cout << "创建: " << name << std::endl;
    }
    
    ~ModernResource() {
        std::cout << "销毁: " << name << std::endl;
    }
    
    // 拷贝操作需要自定义（unique_ptr不可拷贝）
    ModernResource(const ModernResource& other) 
        : data(std::make_unique<int>(*other.data)), 
          name(other.name + "_copy") {}
    
    ModernResource& operator=(const ModernResource& other) {
        if (this != &other) {
            data = std::make_unique<int>(*other.data);
            name = other.name + "_assigned";
        }
        return *this;
    }
    
    // 移动操作使用默认即可
    ModernResource(ModernResource&&) = default;
    ModernResource& operator=(ModernResource&&) = default;
    
    void print() const {
        std::cout << name << ": " << *data << std::endl;
    }
};

int main() {
    ModernResource m1("M1", 50);
    ModernResource m2 = std::move(m1);  // 移动构造
    m2.print();
    
    return 0;
}`,
                    description: '使用智能指针简化资源管理。'
                }
            ],
            handsOn: {
                title: '实现三五法则',
                description: '为IntegerArray类实现完整的拷贝控制（三五法则）。',
                initialCode: `#include <iostream>

class IntegerArray {
private:
    int* data;
    size_t size;
    
public:
    // 构造函数
    IntegerArray(size_t s = 0) : size(s) {
        data = (s > 0) ? new int[s]{0} : nullptr;
    }
    
    // TODO: 实现析构函数
    ~IntegerArray() {
        // 在此实现
    }
    
    // TODO: 实现拷贝构造函数
    IntegerArray(const IntegerArray& other) {
        // 在此实现深拷贝
    }
    
    // TODO: 实现拷贝赋值运算符
    IntegerArray& operator=(const IntegerArray& other) {
        // 在此实现深拷贝赋值
    }
    
    // TODO: 实现移动构造函数
    IntegerArray(IntegerArray&& other) noexcept {
        // 在此实现移动
    }
    
    // TODO: 实现移动赋值运算符
    IntegerArray& operator=(IntegerArray&& other) noexcept {
        // 在此实现移动赋值
    }
    
    void set(size_t index, int value) {
        if (index < size) data[index] = value;
    }
    
    int get(size_t index) const {
        return (index < size) ? data[index] : 0;
    }
    
    size_t getSize() const { return size; }
};

int main() {
    IntegerArray a1(5);
    for (int i = 0; i < 5; i++) a1.set(i, i + 1);
    
    IntegerArray a2 = a1;  // 拷贝构造
    IntegerArray a3 = std::move(a1);  // 移动构造
    
    std::cout << "a1 size: " << a1.getSize() << std::endl;
    std::cout << "a2[0]: " << a2.get(0) << std::endl;
    std::cout << "a3[0]: " << a3.get(0) << std::endl;
    
    return 0;
}`,
                expectedOutput: `a1 size: 0
a2[0]: 1
a3[0]: 1`,
                solutionRegex: 'delete\\[\\].*data|new int\\[.*other\\.size|other\\.data = nullptr',
                hint: '三五法则：析构、拷贝构造、拷贝赋值、移动构造、移动赋值',
                xp: 200
            },
            references: [
                { title: '三五法则', book: 'C++ Primer 第五版', chapter: '第13章 13.1.4节' },
                { title: 'cppreference - 规则', url: 'https://en.cppreference.com/w/cpp/language/rule_of_three' }
            ],
            assistantTips: [
                '如果需要析构函数，通常也需要拷贝和移动操作',
                '使用智能指针可以避免手动实现拷贝控制',
                '定义移动操作会阻止编译器生成合成的拷贝操作'
            ],
            quiz: [
                { type: 'single', question: '三五法则包括哪些成员？', options: [{ text: '构造函数、析构函数、拷贝构造' }, { text: '析构函数、拷贝构造、拷贝赋值', correct: true }, { text: '构造函数、析构函数、移动构造' }, { text: '所有成员函数' }], explanation: '三五法则指析构函数、拷贝构造函数、拷贝赋值运算符（加上移动操作是五法则）。' },
                { type: 'single', question: '为什么定义了析构函数通常也需要定义拷贝操作？', options: [{ text: '语法要求' }, { text: '防止浅拷贝导致资源问题', correct: true }, { text: '提高性能' }, { text: '编译器要求' }], explanation: '如果析构函数释放资源，合成的浅拷贝会导致重复释放。' },
                { type: 'single', question: '定义移动操作后，编译器还会合成拷贝操作吗？', options: [{ text: '会' }, { text: '不会', correct: true }, { text: '取决于成员类型' }, { text: '取决于编译器' }], explanation: '定义移动操作后，编译器不会自动合成拷贝操作。' },
                { type: 'single', question: '以下哪种情况不需要自定义拷贝控制？', options: [{ text: '类管理动态内存' }, { text: '类只包含标准库容器', correct: true }, { text: '类持有文件句柄' }, { text: '类需要深拷贝' }], explanation: '如果类只包含标准库容器，它们自己管理资源，不需要自定义拷贝控制。' },
                { type: 'single', question: '使用智能指针的好处是？', options: [{ text: '提高运行速度' }, { text: '自动管理资源，避免手动实现拷贝控制', correct: true }, { text: '减少内存使用' }, { text: '简化语法' }], explanation: '智能指针自动管理资源，避免手动实现复杂的拷贝控制。' }
            ]
        },
        {
            id: '7.12',
            title: '友元函数与友元类',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 友元函数与友元类

友元机制允许特定的外部函数或类访问类的私有成员。

### 友元函数

\`\`\`cpp
class Point {
private:
    int x, y;
    
public:
    Point(int x, int y) : x(x), y(y) {}
    
    // 声明友元函数
    friend Point operator+(const Point& a, const Point& b);
    friend std::ostream& operator<<(std::ostream& os, const Point& p);
};

// 友元函数定义（不是成员函数）
Point operator+(const Point& a, const Point& b) {
    return Point(a.x + b.x, a.y + b.y);  // 可以访问私有成员
}

std::ostream& operator<<(std::ostream& os, const Point& p) {
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}
\`\`\`

### 友元类

\`\`\`cpp
class Engine;  // 前向声明

class Car {
private:
    int speed;
    
public:
    Car() : speed(0) {}
    friend class Engine;  // Engine是Car的友元类
};

class Engine {
public:
    void accelerate(Car& car, int amount) {
        car.speed += amount;  // 可以访问Car的私有成员
    }
    
    int getSpeed(const Car& car) {
        return car.speed;
    }
};
\`\`\`

### 友元成员函数

\`\`\`cpp
class B;  // 前向声明

class A {
private:
    int data;
public:
    A(int d) : data(d) {}
    void accessB(B& b);  // 成员函数声明
};

class B {
private:
    int secret;
public:
    B(int s) : secret(s) {}
    friend void A::accessB(B& b);  // 只有A::accessB是友元
};

void A::accessB(B& b) {
    std::cout << b.secret;  // 可以访问B的私有成员
}
\`\`\`

### 友元的特点

**友元关系**：
- 是单向的（A是B的友元，B不一定是A的友元）
- 不能传递（A是B的友元，B是C的友元，A不是C的友元）
- 不能继承（基类的友元不是派生类的友元）

### 友元的常见用途

**1. 运算符重载**：
\`\`\`cpp
class Complex {
private:
    double real, imag;
public:
    friend std::ostream& operator<<(std::ostream& os, const Complex& c);
};
\`\`\`

**2. 两个类需要紧密协作**：
\`\`\`cpp
class List;
class Node {
    friend class List;  // List需要访问Node的私有成员
};
\`\`\`

**3. 工厂模式**：
\`\`\`cpp
class Product {
private:
    Product() {}  // 私有构造函数
    friend class Factory;  // 只有Factory可以创建Product
};
\`\`\``,
            examples: [
                {
                    title: '友元函数示例',
                    code: `#include <iostream>

class Vector3D {
private:
    double x, y, z;
    
public:
    Vector3D(double x, double y, double z) : x(x), y(y), z(z) {}
    
    // 友元函数声明
    friend Vector3D operator+(const Vector3D& a, const Vector3D& b);
    friend double dotProduct(const Vector3D& a, const Vector3D& b);
    friend std::ostream& operator<<(std::ostream& os, const Vector3D& v);
};

// 友元函数定义
Vector3D operator+(const Vector3D& a, const Vector3D& b) {
    return Vector3D(a.x + b.x, a.y + b.y, a.z + b.z);
}

double dotProduct(const Vector3D& a, const Vector3D& b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

std::ostream& operator<<(std::ostream& os, const Vector3D& v) {
    os << "(" << v.x << ", " << v.y << ", " << v.z << ")";
    return os;
}

int main() {
    Vector3D v1(1, 2, 3);
    Vector3D v2(4, 5, 6);
    
    Vector3D v3 = v1 + v2;
    std::cout << "v1 + v2 = " << v3 << std::endl;
    
    std::cout << "点积 = " << dotProduct(v1, v2) << std::endl;
    
    return 0;
}`,
                    description: '使用友元函数实现向量运算和输出。'
                },
                {
                    title: '友元类示例',
                    code: `#include <iostream>
#include <string>

class User {
private:
    std::string username;
    std::string password;
    bool loggedIn;
    
public:
    User(const std::string& u, const std::string& p) 
        : username(u), password(p), loggedIn(false) {}
    
    friend class Admin;  // Admin是User的友元类
};

class Admin {
public:
    bool login(User& user, const std::string& password) {
        if (user.password == password) {
            user.loggedIn = true;
            return true;
        }
        return false;
    }
    
    void logout(User& user) {
        user.loggedIn = false;
    }
    
    void changePassword(User& user, const std::string& newPass) {
        user.password = newPass;
    }
    
    void printStatus(const User& user) {
        std::cout << user.username << ": " 
                  << (user.loggedIn ? "已登录" : "未登录") << std::endl;
    }
};

int main() {
    User user("张三", "123456");
    Admin admin;
    
    admin.printStatus(user);
    admin.login(user, "123456");
    admin.printStatus(user);
    admin.logout(user);
    admin.printStatus(user);
    
    return 0;
}`,
                    description: '使用友元类实现管理员对用户的管理。'
                }
            ],
            handsOn: {
                title: '实现友元函数',
                description: '创建一个Matrix类，使用友元函数实现矩阵加法和乘法。',
                initialCode: `#include <iostream>

class Matrix {
private:
    int data[2][2];
    
public:
    Matrix(int a = 0, int b = 0, int c = 0, int d = 0) {
        data[0][0] = a; data[0][1] = b;
        data[1][0] = c; data[1][1] = d;
    }
    
    // TODO: 声明友元函数 operator+
    
    // TODO: 声明友元函数 operator*
    
    // TODO: 声明友元函数 operator<<
    
    void print() const {
        std::cout << "[" << data[0][0] << " " << data[0][1] << "]" << std::endl;
        std::cout << "[" << data[1][0] << " " << data[1][1] << "]" << std::endl;
    }
};

// TODO: 实现矩阵加法
Matrix operator+(const Matrix& a, const Matrix& b) {
    // 在此实现
}

// TODO: 实现矩阵乘法
Matrix operator*(const Matrix& a, const Matrix& b) {
    // 在此实现
}

int main() {
    Matrix m1(1, 2, 3, 4);
    Matrix m2(5, 6, 7, 8);
    
    std::cout << "m1:" << std::endl;
    m1.print();
    
    std::cout << "\\nm2:" << std::endl;
    m2.print();
    
    std::cout << "\\nm1 + m2:" << std::endl;
    Matrix m3 = m1 + m2;
    m3.print();
    
    std::cout << "\\nm1 * m2:" << std::endl;
    Matrix m4 = m1 * m2;
    m4.print();
    
    return 0;
}`,
                expectedOutput: `m1:
[1 2]
[3 4]

m2:
[5 6]
[7 8]

m1 + m2:
[6 8]
[10 12]

m1 * m2:
[19 22]
[43 50]`,
                solutionRegex: 'friend.*operator|data\\[.*\\]\\[.*\\]',
                hint: '矩阵乘法：result[i][j] = sum(a[i][k] * b[k][j])',
                xp: 150
            },
            references: [
                { title: '友元', book: 'C++ Primer 第五版', chapter: '第7章 7.2.4节' },
                { title: 'cppreference - 友元', url: 'https://en.cppreference.com/w/cpp/language/friend' }
            ],
            assistantTips: [
                '友元关系是单向的，不能传递',
                '友元函数不是类的成员函数',
                '谨慎使用友元，过度使用会破坏封装'
            ],
            quiz: [
                { type: 'single', question: '友元函数可以访问类的什么成员？', options: [{ text: '只有public成员' }, { text: '所有成员（包括private）', correct: true }, { text: '只有protected成员' }, { text: '只有static成员' }], explanation: '友元函数可以访问类的所有成员，包括私有成员。' },
                { type: 'single', question: '友元关系是？', options: [{ text: '双向的' }, { text: '单向的', correct: true }, { text: '可传递的' }, { text: '可继承的' }], explanation: '友元关系是单向的，A是B的友元不代表B是A的友元。' },
                { type: 'single', question: '友元函数是类的成员函数吗？', options: [{ text: '是' }, { text: '不是', correct: true }, { text: '取决于声明位置' }, { text: '取决于访问权限' }], explanation: '友元函数不是类的成员函数，只是被授权访问私有成员。' },
                { type: 'single', question: '如何声明友元类？', options: [{ text: 'friend class ClassName;', correct: true }, { text: 'class friend ClassName;' }, { text: 'friend ClassName;' }, { text: 'class ClassName friend;' }], explanation: '使用 friend class ClassName; 声明友元类。' },
                { type: 'single', question: '以下哪种情况适合使用友元？', options: [{ text: '所有外部函数' }, { text: '运算符重载需要访问私有成员', correct: true }, { text: '所有成员函数' }, { text: '所有派生类' }], explanation: '运算符重载（如<<）经常需要访问私有成员，适合声明为友元。' }
            ]
        },
        {
            id: '7.13',
            title: '类的静态成员',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 类的静态成员

静态成员属于类本身，而不是类的某个对象。

### 静态数据成员

\`\`\`cpp
class Counter {
private:
    static int count;  // 静态数据成员声明
    
public:
    Counter() { count++; }
    ~Counter() { count--; }
    
    static int getCount() { return count; }  // 静态成员函数
};

// 静态数据成员定义（必须在类外）
int Counter::count = 0;

int main() {
    Counter c1, c2, c3;
    std::cout << Counter::getCount();  // 3
}
\`\`\`

### 静态成员的特点

**静态数据成员**：
- 所有对象共享同一份数据
- 必须在类外定义和初始化
- 可以通过类名或对象访问

**静态成员函数**：
- 没有this指针
- 只能访问静态成员
- 可以通过类名直接调用

### 访问静态成员

\`\`\`cpp
class MyClass {
public:
    static int value;
    static void func() {}
};

// 方式1：通过类名
MyClass::value = 10;
MyClass::func();

// 方式2：通过对象
MyClass obj;
obj.value = 20;
obj.func();
\`\`\`

### 静态成员的用途

**1. 计数器**：
\`\`\`cpp
class Student {
private:
    static int totalStudents;
    int id;
    
public:
    Student() : id(++totalStudents) {
        std::cout << "创建学生 #" << id << std::endl;
    }
    
    static int getTotal() { return totalStudents; }
};

int Student::totalStudents = 0;
\`\`\`

**2. 常量**：
\`\`\`cpp
class Math {
public:
    static constexpr double PI = 3.14159265358979;
    static constexpr double E = 2.71828182845905;
};
\`\`\`

**3. 单例模式**：
\`\`\`cpp
class Singleton {
private:
    static Singleton* instance;
    Singleton() {}  // 私有构造函数
    
public:
    static Singleton* getInstance() {
        if (!instance) {
            instance = new Singleton();
        }
        return instance;
    }
};

Singleton* Singleton::instance = nullptr;
\`\`\`

### 静态成员 vs 普通成员

| 特性 | 静态成员 | 普通成员 |
|------|---------|---------|
| 归属 | 类 | 对象 |
| this指针 | 无 | 有 |
| 访问方式 | 类名::成员 | 对象.成员 |
| 存储位置 | 静态存储区 | 对象内存中 |
| 生命周期 | 程序开始到结束 | 对象创建到销毁 |

### 内联静态成员（C++17）

\`\`\`cpp
class ModernClass {
public:
    static inline int count = 0;  // C++17：可以在类内初始化
    static inline std::string name = "default";
};
\`\`\``,
            examples: [
                {
                    title: '静态计数器',
                    code: `#include <iostream>

class GameObject {
private:
    static int objectCount;
    int id;
    
public:
    GameObject() : id(++objectCount) {
        std::cout << "创建对象 #" << id 
                  << " (总数: " << objectCount << ")" << std::endl;
    }
    
    ~GameObject() {
        objectCount--;
        std::cout << "销毁对象 #" << id 
                  << " (剩余: " << objectCount << ")" << std::endl;
    }
    
    static int getCount() { return objectCount; }
    
    int getId() const { return id; }
};

int GameObject::objectCount = 0;

int main() {
    std::cout << "初始数量: " << GameObject::getCount() << std::endl;
    
    {
        GameObject obj1;
        GameObject obj2;
        std::cout << "当前数量: " << GameObject::getCount() << std::endl;
    }
    
    std::cout << "最终数量: " << GameObject::getCount() << std::endl;
    return 0;
}`,
                    description: '使用静态成员跟踪对象数量。'
                },
                {
                    title: '单例模式',
                    code: `#include <iostream>
#include <string>

class Logger {
private:
    static Logger* instance;
    std::string logData;
    
    // 私有构造函数
    Logger() : logData("") {
        std::cout << "Logger 初始化" << std::endl;
    }
    
public:
    // 删除拷贝操作
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    // 获取单例
    static Logger* getInstance() {
        if (!instance) {
            instance = new Logger();
        }
        return instance;
    }
    
    void log(const std::string& message) {
        logData += message + "\\n";
    }
    
    void printLog() const {
        std::cout << "=== 日志 ===" << std::endl;
        std::cout << logData;
        std::cout << "============" << std::endl;
    }
};

Logger* Logger::instance = nullptr;

int main() {
    Logger* logger = Logger::getInstance();
    logger->log("程序启动");
    logger->log("执行操作");
    
    Logger::getInstance()->log("程序结束");
    Logger::getInstance()->printLog();
    
    return 0;
}`,
                    description: '使用静态成员实现单例模式。'
                }
            ],
            handsOn: {
                title: '实现静态配置类',
                description: '创建一个Config类，使用静态成员存储应用程序配置。',
                initialCode: `#include <iostream>
#include <string>

class Config {
private:
    // TODO: 添加静态成员变量
    // appName - 应用名称
    // version - 版本号
    // debugMode - 调试模式
    
public:
    // TODO: 实现静态getter方法
    static std::string getAppName() {
        // 在此实现
    }
    
    static std::string getVersion() {
        // 在此实现
    }
    
    static bool isDebugMode() {
        // 在此实现
    }
    
    // TODO: 实现静态setter方法
    static void setAppName(const std::string& name) {
        // 在此实现
    }
    
    static void setVersion(const std::string& v) {
        // 在此实现
    }
    
    static void setDebugMode(bool debug) {
        // 在此实现
    }
    
    // TODO: 实现静态printConfig方法
    static void printConfig() {
        // 在此实现：打印所有配置
    }
};

// TODO: 在类外定义和初始化静态成员

int main() {
    Config::setAppName("MyApplication");
    Config::setVersion("1.0.0");
    Config::setDebugMode(true);
    
    Config::printConfig();
    
    Config::setDebugMode(false);
    std::cout << "调试模式: " << (Config::isDebugMode() ? "开启" : "关闭") << std::endl;
    
    return 0;
}`,
                expectedOutput: `应用名称: MyApplication
版本号: 1.0.0
调试模式: 开启
调试模式: 关闭`,
                solutionRegex: 'static.*appName|static.*version|static.*debugMode|Config::',
                hint: '静态成员变量必须在类外定义和初始化',
                xp: 150
            },
            references: [
                { title: '静态成员', book: 'C++ Primer 第五版', chapter: '第7章 7.6节' },
                { title: 'cppreference - 静态成员', url: 'https://en.cppreference.com/w/cpp/language/static' }
            ],
            assistantTips: [
                '静态成员属于类，所有对象共享',
                '静态成员函数没有this指针',
                '静态数据成员必须在类外定义'
            ],
            quiz: [
                { type: 'single', question: '静态数据成员属于谁？', options: [{ text: '每个对象' }, { text: '类本身', correct: true }, { text: '只有第一个对象' }, { text: '编译器' }], explanation: '静态数据成员属于类，所有对象共享同一份数据。' },
                { type: 'single', question: '静态成员函数可以访问什么？', options: [{ text: '所有成员' }, { text: '只有静态成员', correct: true }, { text: '只有非静态成员' }, { text: '只有私有成员' }], explanation: '静态成员函数没有this指针，只能访问静态成员。' },
                { type: 'single', question: '静态数据成员应该在哪里初始化？', options: [{ text: '构造函数中' }, { text: '类外', correct: true }, { text: '声明时' }, { text: '析构函数中' }], explanation: '静态数据成员必须在类外定义和初始化（C++17的inline静态成员除外）。' },
                { type: 'single', question: '静态成员函数有this指针吗？', options: [{ text: '有' }, { text: '没有', correct: true }, { text: '取决于调用方式' }, { text: '取决于成员类型' }], explanation: '静态成员函数不与特定对象关联，没有this指针。' },
                { type: 'single', question: '如何访问静态成员？', options: [{ text: '只能通过对象' }, { text: '只能通过类名' }, { text: '通过类名或对象都可以', correct: true }, { text: '只能通过指针' }], explanation: '静态成员可以通过类名::成员或对象.成员访问。' }
            ]
        }
    ]
};

window.Unit7Data = Unit7Data;
