/**
 * 单元8：类与对象（下）
 */
const Unit8Data = {
    id: 8,
    title: '类与对象（下）',
    description: '深入学习运算符重载、类型转换、lambda表达式等高级特性',
    lessons: [
        {
            id: '8.1',
            title: '运算符重载基础',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 运算符重载基础

运算符重载允许我们为自定义类型定义运算符的行为，使类对象可以像内置类型一样使用运算符。

### 为什么需要运算符重载？

\`\`\`cpp
// 没有运算符重载
Complex c1(3, 4), c2(1, 2);
Complex c3 = c1.add(c2);  // 不直观

// 有运算符重载
Complex c3 = c1 + c2;     // 直观自然
\`\`\`

### 运算符重载的两种形式

#### 1. 成员函数形式

\`\`\`cpp
class Complex {
private:
    double real, imag;
public:
    // 成员函数重载：左侧操作数是*this
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }
    
    // 单目运算符
    Complex operator-() const {
        return Complex(-real, -imag);
    }
};
\`\`\`

#### 2. 友元函数形式

\`\`\`cpp
class Complex {
private:
    double real, imag;
public:
    friend Complex operator+(const Complex& a, const Complex& b);
    friend std::ostream& operator<<(std::ostream& os, const Complex& c);
};

// 友元函数定义
Complex operator+(const Complex& a, const Complex& b) {
    return Complex(a.real + b.real, a.imag + b.imag);
}
\`\`\`

### 可重载的运算符

| 类别 | 运算符 |
|------|--------|
| 算术运算符 | +, -, *, /, % |
| 关系运算符 | ==, !=, <, >, <=, >= |
| 逻辑运算符 | &&, \|\|, ! |
| 位运算符 | &, \|, ^, ~, <<, >> |
| 赋值运算符 | =, +=, -=, *=, /= |
| 递增递减 | ++, -- |
| 其他 | [], (), ->, *, , |

### 不可重载的运算符

- \`.\` 成员访问运算符
- \`.*\` 成员指针访问运算符
- \`::\` 作用域解析运算符
- \`?:\` 条件运算符
- \`sizeof\` 大小运算符
- \`typeid\` 类型信息运算符

### 重载规则

1. **不能改变运算符的优先级和结合性**
2. **不能改变操作数个数**（单目还是双目）
3. **不能发明新的运算符**
4. **至少有一个操作数是类类型**

### 选择成员还是友元？

**作为成员函数：**
- 赋值运算符 (=)
- 下标运算符 ([])
- 函数调用运算符 (())
- 箭头运算符 (->)
- 递增递减运算符 (++, --)

**作为友元函数：**
- 输入输出运算符 (<<, >>)
- 对称性运算符（如 +, -, *, /）
- 第一个参数需要类型转换的运算符`,
            examples: [
                {
                    title: '复数类基础运算符重载',
                    code: `#include <iostream>
#include <cmath>

class Complex {
private:
    double real, imag;
public:
    Complex(double r = 0, double i = 0) : real(r), imag(i) {}
    
    // 加法运算符（成员函数）
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }
    
    // 减法运算符（成员函数）
    Complex operator-(const Complex& other) const {
        return Complex(real - other.real, imag - other.imag);
    }
    
    // 负号运算符（单目）
    Complex operator-() const {
        return Complex(-real, -imag);
    }
    
    // 输出运算符（友元函数）
    friend std::ostream& operator<<(std::ostream& os, const Complex& c) {
        os << c.real;
        if (c.imag >= 0) os << " + ";
        else os << " - ";
        os << std::abs(c.imag) << "i";
        return os;
    }
    
    double getReal() const { return real; }
    double getImag() const { return imag; }
};

int main() {
    Complex c1(3, 4);
    Complex c2(1, -2);
    
    Complex c3 = c1 + c2;
    std::cout << c1 << " + " << c2 << " = " << c3 << std::endl;
    
    Complex c4 = -c1;
    std::cout << "-" << c1 << " = " << c4 << std::endl;
    
    return 0;
}`,
                    description: '为复数类重载基本的算术运算符和输出运算符。'
                },
                {
                    title: '分数类运算符重载',
                    code: `#include <iostream>

class Fraction {
private:
    int numerator;    // 分子
    int denominator;  // 分母
    
    // 辅助函数：求最大公约数
    int gcd(int a, int b) const {
        return b == 0 ? a : gcd(b, a % b);
    }
    
    // 约分
    void simplify() {
        if (denominator < 0) {
            numerator = -numerator;
            denominator = -denominator;
        }
        int g = gcd(std::abs(numerator), denominator);
        numerator /= g;
        denominator /= g;
    }
    
public:
    Fraction(int n = 0, int d = 1) : numerator(n), denominator(d) {
        if (d == 0) throw std::invalid_argument("分母不能为零");
        simplify();
    }
    
    // 加法
    Fraction operator+(const Fraction& other) const {
        return Fraction(
            numerator * other.denominator + other.numerator * denominator,
            denominator * other.denominator
        );
    }
    
    // 乘法
    Fraction operator*(const Fraction& other) const {
        return Fraction(numerator * other.numerator, 
                       denominator * other.denominator);
    }
    
    // 输出
    friend std::ostream& operator<<(std::ostream& os, const Fraction& f) {
        if (f.denominator == 1) {
            os << f.numerator;
        } else {
            os << f.numerator << "/" << f.denominator;
        }
        return os;
    }
};

int main() {
    Fraction f1(1, 2);   // 1/2
    Fraction f2(1, 3);   // 1/3
    
    std::cout << f1 << " + " << f2 << " = " << (f1 + f2) << std::endl;
    std::cout << f1 << " * " << f2 << " = " << (f1 * f2) << std::endl;
    
    return 0;
}`,
                    description: '为分数类重载算术运算符，自动约分。'
                }
            ],
            handsOn: {
                title: '实现二维向量类',
                description: '创建一个Vector2D类，重载加法、减法和数乘运算符。',
                initialCode: `#include <iostream>
#include <cmath>

class Vector2D {
private:
    double x, y;
    
public:
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}
    
    // TODO: 重载加法运算符
    Vector2D operator+(const Vector2D& other) const {
        // 返回两个向量的和
    }
    
    // TODO: 重载减法运算符
    Vector2D operator-(const Vector2D& other) const {
        // 返回两个向量的差
    }
    
    // TODO: 重载数乘运算符（向量 * 标量）
    Vector2D operator*(double scalar) const {
        // 返回向量与标量的乘积
    }
    
    // 计算向量长度
    double length() const {
        return std::sqrt(x * x + y * y);
    }
    
    // 输出向量
    friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {
        os << "(" << v.x << ", " << v.y << ")";
        return os;
    }
};

int main() {
    Vector2D v1(3, 4);
    Vector2D v2(1, 2);
    
    Vector2D v3 = v1 + v2;
    Vector2D v4 = v1 - v2;
    Vector2D v5 = v1 * 2;
    
    std::cout << v1 << " + " << v2 << " = " << v3 << std::endl;
    std::cout << v1 << " - " << v2 << " = " << v4 << std::endl;
    std::cout << v1 << " * 2 = " << v5 << std::endl;
    
    return 0;
}`,
                expectedOutput: `(3, 4) + (1, 2) = (4, 6)
(3, 4) - (1, 2) = (2, 2)
(3, 4) * 2 = (6, 8)`,
                solutionRegex: 'return Vector2D\\(.*\\+.*other\\.',
                hint: '向量加法：对应分量相加；数乘：每个分量乘以标量',
                xp: 200
            },
            references: [
                { title: '运算符重载', book: 'C++ Primer 第五版', chapter: '第14章' },
                { title: '运算符重载基础', book: 'Effective C++', chapter: '条款10' }
            ],
            assistantTips: [
                '运算符重载应该保持直观性和一致性',
                '成员函数形式左侧参数隐式为this',
                '友元函数形式需要显式传递所有参数',
                '返回类型要考虑是否支持链式调用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '运算符重载使用哪个关键字？', 
                    options: [
                        { text: 'overload' }, 
                        { text: 'operator', correct: true }, 
                        { text: 'override' }, 
                        { text: 'virtual' }
                    ], 
                    explanation: '运算符重载必须使用operator关键字，后跟运算符符号。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个运算符不能被重载？', 
                    options: [
                        { text: '+' }, 
                        { text: '[]' }, 
                        { text: '::', correct: true }, 
                        { text: '()' }
                    ], 
                    explanation: '作用域解析运算符(::)不能被重载，它是语言的基础组成部分。' 
                },
                { 
                    type: 'single', 
                    question: '成员函数形式的二元运算符重载有几个参数？', 
                    options: [
                        { text: '0个' }, 
                        { text: '1个', correct: true }, 
                        { text: '2个' }, 
                        { text: '3个' }
                    ], 
                    explanation: '成员函数形式的二元运算符有1个显式参数，左侧操作数是隐式的this指针。' 
                },
                { 
                    type: 'single', 
                    question: '重载运算符后，运算符的优先级会改变吗？', 
                    options: [
                        { text: '会改变' }, 
                        { text: '不会改变', correct: true }, 
                        { text: '可能改变' }, 
                        { text: '取决于实现' }
                    ], 
                    explanation: '运算符重载不能改变运算符的优先级、结合性和操作数个数。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个运算符通常应该作为成员函数重载？', 
                    options: [
                        { text: '<<' }, 
                        { text: '+' }, 
                        { text: '==', correct: true }, 
                        { text: '>>' }
                    ], 
                    explanation: '关系运算符通常作为成员函数重载，而输入输出运算符通常作为友元函数。' 
                }
            ]
        },
        {
            id: '8.2',
            title: '输入输出运算符重载',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 输入输出运算符重载

输入输出运算符的重载是C++中最重要的运算符重载之一，它使得自定义类型可以像内置类型一样进行I/O操作。

### 输出运算符 <<

#### 基本形式

\`\`\`cpp
class MyClass {
private:
    int value;
public:
    MyClass(int v) : value(v) {}
    
    // 必须作为友元函数
    friend std::ostream& operator<<(std::ostream& os, const MyClass& obj) {
        os << obj.value;  // 输出格式由你决定
        return os;        // 返回引用支持链式调用
    }
};
\`\`\`

#### 为什么返回 ostream&？

\`\`\`cpp
// 支持链式输出
std::cout << obj1 << " " << obj2 << std::endl;

// 等价于
((std::cout << obj1) << " ") << obj2;
\`\`\`

### 输入运算符 >>

#### 基本形式

\`\`\`cpp
class Date {
private:
    int year, month, day;
public:
    friend std::istream& operator>>(std::istream& is, Date& d) {
        is >> d.year >> d.month >> d.day;
        return is;
    }
};
\`\`\`

#### 输入错误处理

\`\`\`cpp
friend std::istream& operator>>(std::istream& is, Date& d) {
    char c1, c2;
    is >> d.year >> c1 >> d.month >> c2 >> d.day;
    
    // 检查格式
    if (c1 != '/' || c2 != '/') {
        is.setstate(std::ios::failbit);  // 设置错误状态
    }
    
    return is;
}
\`\`\`

### 设计原则

1. **输出运算符应该尽量减少格式化**
   - 不输出换行符
   - 让调用者决定输出格式

2. **输入运算符要处理错误**
   - 检查输入格式
   - 设置流状态
   - 在错误时保持对象有效状态

3. **IO运算符通常作为友元函数**
   - 需要访问私有成员
   - 左侧操作数是流对象，不是类对象

### 格式化输出示例

\`\`\`cpp
class Money {
private:
    double amount;
public:
    Money(double a) : amount(a) {}
    
    friend std::ostream& operator<<(std::ostream& os, const Money& m) {
        os << "$" << std::fixed << std::setprecision(2) << m.amount;
        return os;
    }
};

int main() {
    Money price(19.99);
    std::cout << price;  // $19.99
}
\`\`\``,
            examples: [
                {
                    title: '日期类IO运算符',
                    code: `#include <iostream>
#include <iomanip>

class Date {
private:
    int year, month, day;
    
    // 检查日期是否有效
    bool isValid() const {
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        return true;
    }
    
public:
    Date(int y = 2000, int m = 1, int d = 1) 
        : year(y), month(m), day(d) {}
    
    // 输出运算符
    friend std::ostream& operator<<(std::ostream& os, const Date& d) {
        os << d.year << "-" 
           << std::setfill('0') << std::setw(2) << d.month << "-"
           << std::setfill('0') << std::setw(2) << d.day;
        return os;
    }
    
    // 输入运算符
    friend std::istream& operator>>(std::istream& is, Date& d) {
        char sep1, sep2;
        is >> d.year >> sep1 >> d.month >> sep2 >> d.day;
        
        // 检查分隔符和日期有效性
        if (sep1 != '-' || sep2 != '-' || !d.isValid()) {
            is.setstate(std::ios::failbit);
        }
        
        return is;
    }
    
    int getYear() const { return year; }
    int getMonth() const { return month; }
    int getDay() const { return day; }
};

int main() {
    // 输出测试
    Date birthday(2000, 5, 15);
    std::cout << "生日: " << birthday << std::endl;
    
    // 输入测试
    Date inputDate;
    std::cout << "请输入日期(YYYY-MM-DD): ";
    std::cin >> inputDate;
    
    if (std::cin) {
        std::cout << "输入的日期: " << inputDate << std::endl;
    } else {
        std::cout << "日期格式错误!" << std::endl;
    }
    
    return 0;
}`,
                    description: '为日期类重载输入输出运算符，支持格式化输入输出。'
                },
                {
                    title: '复数类完整IO',
                    code: `#include <iostream>
#include <iomanip>
#include <cmath>

class Complex {
private:
    double real, imag;
    
public:
    Complex(double r = 0, double i = 0) : real(r), imag(i) {}
    
    // 输出运算符：支持多种格式
    friend std::ostream& operator<<(std::ostream& os, const Complex& c) {
        // 设置输出格式
        os << std::fixed << std::setprecision(2);
        
        if (c.real != 0) {
            os << c.real;
        }
        
        if (c.imag != 0) {
            if (c.imag > 0 && c.real != 0) {
                os << " + ";
            } else if (c.imag < 0) {
                os << " - ";
            }
            os << std::abs(c.imag) << "i";
        }
        
        // 特殊情况：实部和虚部都为0
        if (c.real == 0 && c.imag == 0) {
            os << "0";
        }
        
        return os;
    }
    
    // 输入运算符：支持 (real, imag) 格式
    friend std::istream& operator>>(std::istream& is, Complex& c) {
        char ch;
        
        // 跳过空白
        is >> std::ws;
        
        // 读取格式: (real, imag)
        if (is.peek() == '(') {
            is >> ch;  // 读取 '('
            is >> c.real >> ch;  // 读取 real 和 ','
            is >> c.imag >> ch;  // 读取 imag 和 ')'
        } else {
            // 简单格式：只读取实部
            is >> c.real;
            c.imag = 0;
        }
        
        return is;
    }
    
    double getReal() const { return real; }
    double getImag() const { return imag; }
};

int main() {
    Complex c1(3, 4);
    Complex c2(-2, -1);
    Complex c3(0, 5);
    Complex c4(5, 0);
    Complex c5(0, 0);
    
    std::cout << "c1 = " << c1 << std::endl;
    std::cout << "c2 = " << c2 << std::endl;
    std::cout << "c3 = " << c3 << std::endl;
    std::cout << "c4 = " << c4 << std::endl;
    std::cout << "c5 = " << c5 << std::endl;
    
    return 0;
}`,
                    description: '为复数类实现智能的输入输出运算符。'
                }
            ],
            handsOn: {
                title: '实现学生类IO运算符',
                description: '为Student类重载输入输出运算符，格式：姓名 年龄 分数',
                initialCode: `#include <iostream>
#include <string>
#include <iomanip>

class Student {
private:
    std::string name;
    int age;
    double score;
    
public:
    Student(const std::string& n = "", int a = 0, double s = 0)
        : name(n), age(a), score(s) {}
    
    // TODO: 重载输出运算符
    // 格式: 姓名: 张三, 年龄: 20, 分数: 85.50
    friend std::ostream& operator<<(std::ostream& os, const Student& s) {
        // 实现输出格式
    }
    
    // TODO: 重载输入运算符
    // 输入格式: 姓名 年龄 分数（空格分隔）
    friend std::istream& operator>>(std::istream& is, Student& s) {
        // 实现输入
    }
    
    std::string getName() const { return name; }
    int getAge() const { return age; }
    double getScore() const { return score; }
};

int main() {
    Student s1("张三", 20, 85.5);
    std::cout << s1 << std::endl;
    
    Student s2;
    std::cout << "请输入学生信息(姓名 年龄 分数): ";
    std::cin >> s2;
    std::cout << "输入的学生: " << s2 << std::endl;
    
    return 0;
}`,
                expectedOutput: `姓名: 张三, 年龄: 20, 分数: 85.50`,
                solutionRegex: 'os.*<<.*name.*<<.*age.*<<.*score',
                hint: '输出运算符返回ostream引用，使用setprecision控制小数位数',
                xp: 200
            },
            references: [
                { title: '输入输出运算符', book: 'C++ Primer 第五版', chapter: '第14.2节' },
                { title: 'IO库', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                'IO运算符必须返回流的引用以支持链式调用',
                '输出运算符不应该输出换行符',
                '输入运算符要处理可能的错误情况',
                'IO运算符通常声明为友元函数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '输出运算符<<应该返回什么类型？', 
                    options: [
                        { text: 'void' }, 
                        { text: 'std::ostream&', correct: true }, 
                        { text: 'std::ostream' }, 
                        { text: 'bool' }
                    ], 
                    explanation: '返回ostream引用可以支持链式调用，如 cout << a << b << c;' 
                },
                { 
                    type: 'single', 
                    question: '为什么IO运算符通常作为友元函数？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '左侧操作数是流对象', correct: true }, 
                        { text: '语法要求' }, 
                        { text: '编译器限制' }
                    ], 
                    explanation: 'IO运算符的左侧操作数是流对象(ostream/istream)，不是类对象本身，所以必须作为非成员函数。' 
                },
                { 
                    type: 'single', 
                    question: '输出运算符应该输出换行符吗？', 
                    options: [
                        { text: '应该' }, 
                        { text: '不应该', correct: true }, 
                        { text: '必须' }, 
                        { text: '取决于类型' }
                    ], 
                    explanation: '输出运算符不应该输出换行符，让调用者决定输出格式。' 
                },
                { 
                    type: 'single', 
                    question: '输入运算符遇到错误时应该做什么？', 
                    options: [
                        { text: '抛出异常' }, 
                        { text: '设置流状态', correct: true }, 
                        { text: '返回默认值' }, 
                        { text: '忽略错误' }
                    ], 
                    explanation: '输入运算符应该设置流的错误状态(failbit)，让调用者检测错误。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是正确的输出运算符声明？', 
                    options: [
                        { text: 'void operator<<(ostream& os, const T& obj);' }, 
                        { text: 'ostream operator<<(ostream& os, const T& obj);' }, 
                        { text: 'ostream& operator<<(ostream& os, const T& obj);', correct: true }, 
                        { text: 'T& operator<<(ostream& os, const T& obj);' }
                    ], 
                    explanation: '正确的声明是返回ostream引用，参数是ostream引用和对象的const引用。' 
                }
            ]
        },
        {
            id: '8.3',
            title: '算术与关系运算符重载',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 算术与关系运算符重载

算术运算符和关系运算符是最常用的运算符重载，它们让自定义类型支持数学运算和比较操作。

### 算术运算符

#### 基本算术运算符

\`\`\`cpp
class Rational {
private:
    int num, den;  // 分子、分母
public:
    // 加法
    Rational operator+(const Rational& rhs) const {
        return Rational(num * rhs.den + rhs.num * den, den * rhs.den);
    }
    
    // 减法
    Rational operator-(const Rational& rhs) const {
        return *this + (-rhs);  // 复用加法
    }
    
    // 乘法
    Rational operator*(const Rational& rhs) const {
        return Rational(num * rhs.num, den * rhs.den);
    }
    
    // 除法
    Rational operator/(const Rational& rhs) const {
        return Rational(num * rhs.den, den * rhs.num);
    }
    
    // 取负（单目）
    Rational operator-() const {
        return Rational(-num, den);
    }
};
\`\`\`

#### 复合赋值运算符

\`\`\`cpp
class Rational {
public:
    // 复合赋值运算符通常返回引用
    Rational& operator+=(const Rational& rhs) {
        num = num * rhs.den + rhs.num * den;
        den = den * rhs.den;
        simplify();  // 约分
        return *this;
    }
    
    // 其他算术运算符可以基于复合赋值实现
    Rational operator+(const Rational& rhs) const {
        Rational result = *this;
        result += rhs;
        return result;
    }
};
\`\`\`

### 关系运算符

#### 相等运算符

\`\`\`cpp
class Point {
private:
    int x, y;
public:
    bool operator==(const Point& rhs) const {
        return x == rhs.x && y == rhs.y;
    }
    
    bool operator!=(const Point& rhs) const {
        return !(*this == rhs);  // 复用==
    }
};
\`\`\`

#### 比较运算符

\`\`\`cpp
class String {
private:
    std::string str;
public:
    bool operator<(const String& rhs) const {
        return str < rhs.str;
    }
    
    bool operator<=(const String& rhs) const {
        return !(rhs < *this);
    }
    
    bool operator>(const String& rhs) const {
        return rhs < *this;
    }
    
    bool operator>=(const String& rhs) const {
        return !(*this < rhs);
    }
};
\`\`\`

### C++20 三向比较运算符 <=>

\`\`\`cpp
#include <compare>

class Point {
private:
    int x, y;
public:
    // 自动生成所有6个比较运算符
    auto operator<=>(const Point& rhs) const = default;
};

// 也可以自定义
auto operator<=>(const Point& rhs) const {
    if (auto cmp = x <=> rhs.x; cmp != 0) return cmp;
    return y <=> rhs.y;
}
\`\`\`

### 设计原则

1. **对称性**：如果 a == b，则 b == a
2. **传递性**：如果 a == b 且 b == c，则 a == c
3. **一致性**：多次比较结果相同
4. **算术运算符返回新对象**：不修改操作数
5. **复合赋值返回引用**：支持链式调用`,
            examples: [
                {
                    title: '有理数类完整实现',
                    code: `#include <iostream>
#include <numeric>

class Rational {
private:
    int numerator;
    int denominator;
    
    void simplify() {
        if (denominator < 0) {
            numerator = -numerator;
            denominator = -denominator;
        }
        int g = std::gcd(std::abs(numerator), denominator);
        numerator /= g;
        denominator /= g;
    }
    
public:
    Rational(int n = 0, int d = 1) : numerator(n), denominator(d) {
        if (d == 0) throw std::invalid_argument("分母不能为零");
        simplify();
    }
    
    // 算术运算符
    Rational operator+(const Rational& rhs) const {
        return Rational(numerator * rhs.denominator + rhs.numerator * denominator,
                       denominator * rhs.denominator);
    }
    
    Rational operator-(const Rational& rhs) const {
        return Rational(numerator * rhs.denominator - rhs.numerator * denominator,
                       denominator * rhs.denominator);
    }
    
    Rational operator*(const Rational& rhs) const {
        return Rational(numerator * rhs.numerator, denominator * rhs.denominator);
    }
    
    Rational operator/(const Rational& rhs) const {
        return Rational(numerator * rhs.denominator, denominator * rhs.numerator);
    }
    
    // 关系运算符
    bool operator==(const Rational& rhs) const {
        return numerator == rhs.numerator && denominator == rhs.denominator;
    }
    
    bool operator<(const Rational& rhs) const {
        return numerator * rhs.denominator < rhs.numerator * denominator;
    }
    
    bool operator!=(const Rational& rhs) const { return !(*this == rhs); }
    bool operator>(const Rational& rhs) const { return rhs < *this; }
    bool operator<=(const Rational& rhs) const { return !(rhs < *this); }
    bool operator>=(const Rational& rhs) const { return !(*this < rhs); }
    
    // 输出
    friend std::ostream& operator<<(std::ostream& os, const Rational& r) {
        if (r.denominator == 1) os << r.numerator;
        else os << r.numerator << "/" << r.denominator;
        return os;
    }
};

int main() {
    Rational r1(1, 2);   // 1/2
    Rational r2(1, 3);   // 1/3
    Rational r3(2, 4);   // 1/2 (自动约分)
    
    std::cout << r1 << " + " << r2 << " = " << (r1 + r2) << std::endl;
    std::cout << r1 << " - " << r2 << " = " << (r1 - r2) << std::endl;
    std::cout << r1 << " * " << r2 << " = " << (r1 * r2) << std::endl;
    std::cout << r1 << " / " << r2 << " = " << (r1 / r2) << std::endl;
    
    std::cout << r1 << " == " << r3 << " ? " << (r1 == r3 ? "是" : "否") << std::endl;
    std::cout << r1 << " < " << r2 << " ? " << (r1 < r2 ? "是" : "否") << std::endl;
    
    return 0;
}`,
                    description: '实现完整的有理数类，包含算术和关系运算符。'
                },
                {
                    title: '时间类比较运算符',
                    code: `#include <iostream>
#include <iomanip>

class Time {
private:
    int hours, minutes, seconds;
    
    void normalize() {
        minutes += seconds / 60;
        seconds %= 60;
        if (seconds < 0) { seconds += 60; minutes--; }
        
        hours += minutes / 60;
        minutes %= 60;
        if (minutes < 0) { minutes += 60; hours--; }
    }
    
public:
    Time(int h = 0, int m = 0, int s = 0) 
        : hours(h), minutes(m), seconds(s) {
        normalize();
    }
    
    // 转换为总秒数用于比较
    int totalSeconds() const {
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    // 关系运算符
    bool operator==(const Time& rhs) const {
        return totalSeconds() == rhs.totalSeconds();
    }
    
    bool operator<(const Time& rhs) const {
        return totalSeconds() < rhs.totalSeconds();
    }
    
    bool operator!=(const Time& rhs) const { return !(*this == rhs); }
    bool operator>(const Time& rhs) const { return rhs < *this; }
    bool operator<=(const Time& rhs) const { return !(rhs < *this); }
    bool operator>=(const Time& rhs) const { return !(*this < rhs); }
    
    // 算术运算符
    Time operator+(const Time& rhs) const {
        return Time(0, 0, totalSeconds() + rhs.totalSeconds());
    }
    
    Time operator-(const Time& rhs) const {
        return Time(0, 0, totalSeconds() - rhs.totalSeconds());
    }
    
    // 输出
    friend std::ostream& operator<<(std::ostream& os, const Time& t) {
        os << std::setfill('0') 
           << std::setw(2) << t.hours << ":"
           << std::setw(2) << t.minutes << ":"
           << std::setw(2) << t.seconds;
        return os;
    }
};

int main() {
    Time t1(2, 30, 45);   // 2:30:45
    Time t2(1, 15, 30);   // 1:15:30
    Time t3(2, 30, 45);   // 2:30:45
    
    std::cout << t1 << " + " << t2 << " = " << (t1 + t2) << std::endl;
    std::cout << t1 << " - " << t2 << " = " << (t1 - t2) << std::endl;
    
    std::cout << t1 << " == " << t3 << " ? " << (t1 == t3 ? "是" : "否") << std::endl;
    std::cout << t1 << " > " << t2 << " ? " << (t1 > t2 ? "是" : "否") << std::endl;
    
    return 0;
}`,
                    description: '为时间类实现比较和算术运算符。'
                }
            ],
            handsOn: {
                title: '实现点类运算符',
                description: '为Point类实现算术和关系运算符。',
                initialCode: `#include <iostream>
#include <cmath>

class Point {
private:
    double x, y;
    
public:
    Point(double x = 0, double y = 0) : x(x), y(y) {}
    
    // TODO: 实现加法运算符
    Point operator+(const Point& rhs) const {
        // 返回两个点的和（对应坐标相加）
    }
    
    // TODO: 实现减法运算符
    Point operator-(const Point& rhs) const {
        // 返回两个点的差
    }
    
    // TODO: 实现相等运算符
    bool operator==(const Point& rhs) const {
        // 判断两个点是否相等
    }
    
    // TODO: 实现不等运算符
    bool operator!=(const Point& rhs) const {
        // 判断两个点是否不等
    }
    
    // 计算到原点的距离
    double distance() const {
        return std::sqrt(x * x + y * y);
    }
    
    // 输出
    friend std::ostream& operator<<(std::ostream& os, const Point& p) {
        os << "(" << p.x << ", " << p.y << ")";
        return os;
    }
};

int main() {
    Point p1(3, 4);
    Point p2(1, 2);
    Point p3(3, 4);
    
    std::cout << p1 << " + " << p2 << " = " << (p1 + p2) << std::endl;
    std::cout << p1 << " - " << p2 << " = " << (p1 - p2) << std::endl;
    std::cout << p1 << " == " << p3 << " ? " << (p1 == p3 ? "是" : "否") << std::endl;
    std::cout << p1 << " != " << p2 << " ? " << (p1 != p2 ? "是" : "否") << std::endl;
    
    return 0;
}`,
                expectedOutput: `(3, 4) + (1, 2) = (4, 6)
(3, 4) - (1, 2) = (2, 2)
(3, 4) == (3, 4) ? 是
(3, 4) != (1, 2) ? 是`,
                solutionRegex: 'return Point\\(|return x == rhs\\.x',
                hint: '算术运算符返回新对象，关系运算符返回bool',
                xp: 200
            },
            references: [
                { title: '算术与关系运算符', book: 'C++ Primer 第五版', chapter: '第14.3-14.5节' },
                { title: '运算符重载', book: 'Effective C++', chapter: '条款10-11' }
            ],
            assistantTips: [
                '算术运算符应该返回新对象，不修改原对象',
                '复合赋值运算符应该返回*this的引用',
                '关系运算符要满足对称性和传递性',
                '可以用一个比较运算符实现其他比较运算符'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '算术运算符（如+）应该返回什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: '新对象', correct: true }, 
                        { text: '引用' }, 
                        { text: '指针' }
                    ], 
                    explanation: '算术运算符应该返回新对象，不修改操作数。' 
                },
                { 
                    type: 'single', 
                    question: '复合赋值运算符（如+=）应该返回什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: '新对象' }, 
                        { text: '*this的引用', correct: true }, 
                        { text: 'bool' }
                    ], 
                    explanation: '复合赋值运算符返回*this的引用，支持链式调用。' 
                },
                { 
                    type: 'single', 
                    question: '如何实现!=运算符最简单？', 
                    options: [
                        { text: '完全重新实现' }, 
                        { text: '复用==运算符', correct: true }, 
                        { text: '使用指针比较' }, 
                        { text: '调用库函数' }
                    ], 
                    explanation: '!=可以通过复用==实现：return !(*this == rhs);' 
                },
                { 
                    type: 'single', 
                    question: '关系运算符应该满足什么性质？', 
                    options: [
                        { text: '只满足对称性' }, 
                        { text: '只满足传递性' }, 
                        { text: '对称性和传递性', correct: true }, 
                        { text: '没有要求' }
                    ], 
                    explanation: '关系运算符应该满足对称性(a==b则b==a)和传递性(a==b且b==c则a==c)。' 
                },
                { 
                    type: 'single', 
                    question: 'C++20引入的三向比较运算符是？', 
                    options: [
                        { text: '<=>' }, 
                        { text: '<=>', correct: true }, 
                        { text: '<=>' }, 
                        { text: 'compare()' }
                    ], 
                    explanation: 'C++20引入了三向比较运算符<=>（太空船运算符），可以自动生成所有6个比较运算符。' 
                }
            ]
        },
        {
            id: '8.4',
            title: '赋值运算符与组合',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 赋值运算符与组合

赋值运算符是类中最重要且最容易出错的运算符之一，正确实现它需要理解资源管理和对象生命周期。

### 拷贝赋值运算符

#### 基本实现

\`\`\`cpp
class MyString {
private:
    char* data;
    size_t size;
    
public:
    // 拷贝赋值运算符
    MyString& operator=(const MyString& other) {
        // 1. 检查自赋值
        if (this == &other) {
            return *this;
        }
        
        // 2. 释放旧资源
        delete[] data;
        
        // 3. 分配新资源并拷贝
        size = other.size;
        data = new char[size + 1];
        strcpy(data, other.data);
        
        // 4. 返回*this
        return *this;
    }
};
\`\`\`

#### 异常安全的实现

\`\`\`cpp
MyString& operator=(const MyString& other) {
    if (this != &other) {
        // 先创建副本，再交换
        char* newData = new char[other.size + 1];
        strcpy(newData, other.data);
        
        delete[] data;  // 释放旧资源
        data = newData;
        size = other.size;
    }
    return *this;
}
\`\`\`

#### Copy-and-Swap 惯用法

\`\`\`cpp
class MyString {
public:
    // 交换函数
    void swap(MyString& other) noexcept {
        std::swap(data, other.data);
        std::swap(size, other.size);
    }
    
    // 拷贝赋值使用copy-and-swap
    MyString& operator=(MyString other) {  // 注意：传值
        swap(other);  // 交换资源
        return *this;  // other析构时释放旧资源
    }
};
\`\`\`

### 移动赋值运算符

\`\`\`cpp
class MyString {
public:
    // 移动赋值运算符
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            delete[] data;  // 释放旧资源
            
            // 窃取资源
            data = other.data;
            size = other.size;
            
            // 置空源对象
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};
\`\`\`

### 复合赋值运算符

\`\`\`cpp
class Number {
private:
    int value;
public:
    Number& operator+=(const Number& rhs) {
        value += rhs.value;
        return *this;
    }
    
    Number& operator-=(const Number& rhs) {
        value -= rhs.value;
        return *this;
    }
    
    // 可以基于复合赋值实现算术运算符
    Number operator+(const Number& rhs) const {
        Number result = *this;
        result += rhs;
        return result;
    }
};
\`\`\`

### 规则：三/五法则

**三法则（Rule of Three）：**
如果类需要析构函数，则也需要拷贝构造函数和拷贝赋值运算符。

**五法则（Rule of Five）：**
在现代C++中，还需要移动构造函数和移动赋值运算符。

\`\`\`cpp
class Resource {
public:
    ~Resource();                          // 析构函数
    Resource(const Resource&);            // 拷贝构造
    Resource& operator=(const Resource&); // 拷贝赋值
    Resource(Resource&&) noexcept;        // 移动构造
    Resource& operator=(Resource&&) noexcept; // 移动赋值
};
\`\`\`

### 禁止赋值

\`\`\`cpp
class NonCopyable {
public:
    NonCopyable(const NonCopyable&) = delete;
    NonCopyable& operator=(const NonCopyable&) = delete;
};
\`\`\``,
            examples: [
                {
                    title: '完整字符串类实现',
                    code: `#include <iostream>
#include <cstring>
#include <utility>

class MyString {
private:
    char* data;
    size_t length;
    
public:
    // 默认构造
    MyString() : data(nullptr), length(0) {}
    
    // 构造函数
    MyString(const char* str) {
        if (str) {
            length = strlen(str);
            data = new char[length + 1];
            strcpy(data, str);
        } else {
            data = nullptr;
            length = 0;
        }
    }
    
    // 析构函数
    ~MyString() {
        delete[] data;
    }
    
    // 拷贝构造
    MyString(const MyString& other) {
        length = other.length;
        if (other.data) {
            data = new char[length + 1];
            strcpy(data, other.data);
        } else {
            data = nullptr;
        }
    }
    
    // 移动构造
    MyString(MyString&& other) noexcept 
        : data(other.data), length(other.length) {
        other.data = nullptr;
        other.length = 0;
    }
    
    // 拷贝赋值（copy-and-swap）
    MyString& operator=(MyString other) {
        swap(other);
        return *this;
    }
    
    // 移动赋值
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            length = other.length;
            other.data = nullptr;
            other.length = 0;
        }
        return *this;
    }
    
    // 交换
    void swap(MyString& other) noexcept {
        std::swap(data, other.data);
        std::swap(length, other.length);
    }
    
    // 复合赋值
    MyString& operator+=(const MyString& rhs) {
        if (rhs.data) {
            char* newData = new char[length + rhs.length + 1];
            strcpy(newData, data ? data : "");
            strcat(newData, rhs.data);
            delete[] data;
            data = newData;
            length += rhs.length;
        }
        return *this;
    }
    
    // 加法
    MyString operator+(const MyString& rhs) const {
        MyString result = *this;
        result += rhs;
        return result;
    }
    
    // 输出
    friend std::ostream& operator<<(std::ostream& os, const MyString& s) {
        os << (s.data ? s.data : "");
        return os;
    }
    
    size_t size() const { return length; }
};

int main() {
    MyString s1("Hello");
    MyString s2(" World");
    
    // 测试拷贝赋值
    MyString s3;
    s3 = s1;
    std::cout << "s3 = " << s3 << std::endl;
    
    // 测试移动赋值
    MyString s4;
    s4 = MyString("Temporary");
    std::cout << "s4 = " << s4 << std::endl;
    
    // 测试复合赋值
    MyString s5 = s1 + s2;
    std::cout << "s5 = " << s5 << std::endl;
    
    return 0;
}`,
                    description: '实现完整的字符串类，包含拷贝/移动语义。'
                },
                {
                    title: '动态数组类',
                    code: `#include <iostream>
#include <algorithm>

class DynamicArray {
private:
    int* data;
    size_t size;
    size_t capacity;
    
public:
    // 构造函数
    DynamicArray() : data(nullptr), size(0), capacity(0) {}
    
    explicit DynamicArray(size_t n) 
        : data(new int[n]()), size(n), capacity(n) {}
    
    // 析构函数
    ~DynamicArray() {
        delete[] data;
    }
    
    // 拷贝构造
    DynamicArray(const DynamicArray& other)
        : data(new int[other.capacity]), 
          size(other.size), 
          capacity(other.capacity) {
        std::copy(other.data, other.data + size, data);
    }
    
    // 移动构造
    DynamicArray(DynamicArray&& other) noexcept
        : data(other.data), size(other.size), capacity(other.capacity) {
        other.data = nullptr;
        other.size = 0;
        other.capacity = 0;
    }
    
    // 拷贝赋值
    DynamicArray& operator=(const DynamicArray& other) {
        if (this != &other) {
            int* newData = new int[other.capacity];
            std::copy(other.data, other.data + other.size, newData);
            
            delete[] data;
            data = newData;
            size = other.size;
            capacity = other.capacity;
        }
        return *this;
    }
    
    // 移动赋值
    DynamicArray& operator=(DynamicArray&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            capacity = other.capacity;
            
            other.data = nullptr;
            other.size = 0;
            other.capacity = 0;
        }
        return *this;
    }
    
    // 下标运算符
    int& operator[](size_t index) { return data[index]; }
    const int& operator[](size_t index) const { return data[index]; }
    
    // 添加元素
    void push_back(int value) {
        if (size >= capacity) {
            reserve(capacity == 0 ? 1 : capacity * 2);
        }
        data[size++] = value;
    }
    
    // 预留空间
    void reserve(size_t newCapacity) {
        if (newCapacity > capacity) {
            int* newData = new int[newCapacity];
            std::copy(data, data + size, newData);
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
    }
    
    size_t getSize() const { return size; }
    size_t getCapacity() const { return capacity; }
};

int main() {
    DynamicArray arr1;
    for (int i = 0; i < 5; ++i) {
        arr1.push_back(i * 10);
    }
    
    std::cout << "arr1: ";
    for (size_t i = 0; i < arr1.getSize(); ++i) {
        std::cout << arr1[i] << " ";
    }
    std::cout << std::endl;
    
    DynamicArray arr2 = arr1;  // 拷贝构造
    DynamicArray arr3;
    arr3 = std::move(arr1);    // 移动赋值
    
    std::cout << "arr3: ";
    for (size_t i = 0; i < arr3.getSize(); ++i) {
        std::cout << arr3[i] << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '实现动态数组类，演示完整的资源管理。'
                }
            ],
            handsOn: {
                title: '实现智能指针类',
                description: '实现一个简单的智能指针类，包含拷贝和移动语义。',
                initialCode: `#include <iostream>

template<typename T>
class SmartPtr {
private:
    T* ptr;
    
public:
    // 构造函数
    explicit SmartPtr(T* p = nullptr) : ptr(p) {}
    
    // 析构函数
    ~SmartPtr() {
        // TODO: 释放资源
    }
    
    // 拷贝构造（禁止）
    SmartPtr(const SmartPtr& other) = delete;
    
    // 拷贝赋值（禁止）
    SmartPtr& operator=(const SmartPtr& other) = delete;
    
    // TODO: 移动构造
    SmartPtr(SmartPtr&& other) noexcept {
        // 窃取资源，置空源对象
    }
    
    // TODO: 移动赋值
    SmartPtr& operator=(SmartPtr&& other) noexcept {
        // 检查自赋值，释放旧资源，窃取新资源
    }
    
    // 解引用
    T& operator*() const { return *ptr; }
    
    // 箭头运算符
    T* operator->() const { return ptr; }
    
    // 获取原始指针
    T* get() const { return ptr; }
    
    // 是否非空
    explicit operator bool() const { return ptr != nullptr; }
};

int main() {
    SmartPtr<int> p1(new int(42));
    std::cout << "p1: " << *p1 << std::endl;
    
    SmartPtr<int> p2 = std::move(p1);
    std::cout << "p2: " << *p2 << std::endl;
    
    if (!p1) {
        std::cout << "p1 is null" << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `p1: 42
p2: 42
p1 is null`,
                solutionRegex: 'ptr = other\\.ptr|other\\.ptr = nullptr',
                hint: '移动操作：窃取资源，置空源对象',
                xp: 250
            },
            references: [
                { title: '赋值运算符', book: 'C++ Primer 第五版', chapter: '第13章' },
                { title: '资源管理', book: 'Effective C++', chapter: '条款10-17' }
            ],
            assistantTips: [
                '赋值运算符必须处理自赋值情况',
                '使用copy-and-swap惯用法实现异常安全',
                '移动语义可以显著提高性能',
                '遵循三/五法则'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '拷贝赋值运算符必须检查什么？', 
                    options: [
                        { text: '参数是否为空' }, 
                        { text: '自赋值', correct: true }, 
                        { text: '内存是否足够' }, 
                        { text: '类型是否匹配' }
                    ], 
                    explanation: '必须检查自赋值，否则可能先释放资源再访问导致错误。' 
                },
                { 
                    type: 'single', 
                    question: 'copy-and-swap惯用法的优点是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '代码更短' }, 
                        { text: '异常安全', correct: true }, 
                        { text: '不需要析构函数' }
                    ], 
                    explanation: 'copy-and-swap惯用法提供了强异常安全保证。' 
                },
                { 
                    type: 'single', 
                    question: '移动赋值运算符应该标记为？', 
                    options: [
                        { text: 'const' }, 
                        { text: 'noexcept', correct: true }, 
                        { text: 'virtual' }, 
                        { text: 'static' }
                    ], 
                    explanation: '移动操作应该标记为noexcept，这样标准库容器才能使用它进行优化。' 
                },
                { 
                    type: 'single', 
                    question: '三法则指的是哪三个函数？', 
                    options: [
                        { text: '构造、析构、赋值' }, 
                        { text: '析构、拷贝构造、拷贝赋值', correct: true }, 
                        { text: '构造、拷贝构造、移动构造' }, 
                        { text: '析构、移动构造、移动赋值' }
                    ], 
                    explanation: '三法则：如果需要析构函数，则也需要拷贝构造和拷贝赋值。' 
                },
                { 
                    type: 'single', 
                    question: '如何禁止拷贝赋值？', 
                    options: [
                        { text: 'private声明' }, 
                        { text: '= delete', correct: true }, 
                        { text: '不实现' }, 
                        { text: '返回void' }
                    ], 
                    explanation: '使用 = delete 明确禁止拷贝赋值，编译器会报错。' 
                }
            ]
        },
        {
            id: '8.5',
            title: '下标运算符与解引用',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 下标运算符与解引用

下标运算符和解引用运算符让类对象可以像数组或指针一样使用，这是实现容器类和智能指针的关键。

### 下标运算符 []

#### 基本实现

\`\`\`cpp
class Array {
private:
    int* data;
    size_t size;
    
public:
    // 非const版本：可以修改
    int& operator[](size_t index) {
        return data[index];
    }
    
    // const版本：只能读取
    const int& operator[](size_t index) const {
        return data[index];
    }
};
\`\`\`

#### 带边界检查

\`\`\`cpp
class SafeArray {
private:
    int* data;
    size_t size;
    
public:
    int& operator[](size_t index) {
        if (index >= size) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
    
    const int& operator[](size_t index) const {
        if (index >= size) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
};
\`\`\`

### 解引用运算符 *

\`\`\`cpp
template<typename T>
class SmartPtr {
private:
    T* ptr;
    
public:
    // 解引用
    T& operator*() const {
        return *ptr;
    }
};
\`\`\`

### 箭头运算符 ->

\`\`\`cpp
template<typename T>
class SmartPtr {
public:
    // 箭头运算符
    T* operator->() const {
        return ptr;
    }
};

// 使用
SmartPtr<Person> p(new Person);
p->name = "Alice";  // 等价于 (p.operator->())->name
\`\`\`

### 下标运算符与多维数组

\`\`\`cpp
class Matrix {
private:
    int* data;
    size_t rows, cols;
    
public:
    // 返回行代理
    class RowProxy {
    private:
        int* row;
        size_t cols;
    public:
        RowProxy(int* r, size_t c) : row(r), cols(c) {}
        int& operator[](size_t col) { return row[col]; }
    };
    
    // 第一次[]返回代理，第二次[]访问元素
    RowProxy operator[](size_t row) {
        return RowProxy(data + row * cols, cols);
    }
};

// 使用
Matrix m(3, 4);
m[1][2] = 10;  // m[1]返回RowProxy，[2]访问元素
\`\`\`

### 设计原则

1. **下标运算符通常返回引用**
   - 支持读写操作
   - 允许链式调用

2. **提供const和非const版本**
   - const对象只能调用const版本
   - 非const对象可以调用任一版本

3. **箭头运算符返回指针**
   - 使得可以访问成员
   - 支持链式调用（智能指针）

4. **解引用返回对象引用**
   - 使得对象可以像指针一样使用`,
            examples: [
                {
                    title: '安全数组类',
                    code: `#include <iostream>
#include <stdexcept>

class SafeArray {
private:
    int* data;
    size_t size;
    
public:
    explicit SafeArray(size_t s) : data(new int[s]()), size(s) {}
    
    ~SafeArray() { delete[] data; }
    
    // 禁止拷贝
    SafeArray(const SafeArray&) = delete;
    SafeArray& operator=(const SafeArray&) = delete;
    
    // 下标运算符（非const）
    int& operator[](size_t index) {
        if (index >= size) {
            throw std::out_of_range(
                "Index " + std::to_string(index) + 
                " out of range [0, " + std::to_string(size) + ")"
            );
        }
        return data[index];
    }
    
    // 下标运算符（const）
    const int& operator[](size_t index) const {
        if (index >= size) {
            throw std::out_of_range(
                "Index " + std::to_string(index) + 
                " out of range [0, " + std::to_string(size) + ")"
            );
        }
        return data[index];
    }
    
    size_t getSize() const { return size; }
    
    // 打印数组
    void print() const {
        std::cout << "[";
        for (size_t i = 0; i < size; ++i) {
            std::cout << data[i];
            if (i < size - 1) std::cout << ", ";
        }
        std::cout << "]";
    }
};

int main() {
    SafeArray arr(5);
    
    // 写入数据
    for (size_t i = 0; i < arr.getSize(); ++i) {
        arr[i] = i * 10;
    }
    
    // 读取数据
    arr.print();
    std::cout << std::endl;
    
    // 边界检查
    try {
        arr[10] = 100;
    } catch (const std::out_of_range& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '实现带边界检查的安全数组类。'
                },
                {
                    title: '智能指针完整实现',
                    code: `#include <iostream>
#include <string>

template<typename T>
class UniquePtr {
private:
    T* ptr;
    
public:
    explicit UniquePtr(T* p = nullptr) : ptr(p) {}
    
    ~UniquePtr() {
        delete ptr;
    }
    
    // 禁止拷贝
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;
    
    // 移动构造
    UniquePtr(UniquePtr&& other) noexcept : ptr(other.ptr) {
        other.ptr = nullptr;
    }
    
    // 移动赋值
    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            delete ptr;
            ptr = other.ptr;
            other.ptr = nullptr;
        }
        return *this;
    }
    
    // 解引用运算符
    T& operator*() const {
        return *ptr;
    }
    
    // 箭头运算符
    T* operator->() const {
        return ptr;
    }
    
    // 获取原始指针
    T* get() const { return ptr; }
    
    // 重置
    void reset(T* p = nullptr) {
        delete ptr;
        ptr = p;
    }
    
    // 释放所有权
    T* release() {
        T* temp = ptr;
        ptr = nullptr;
        return temp;
    }
    
    // 布尔转换
    explicit operator bool() const {
        return ptr != nullptr;
    }
};

// 测试类
struct Person {
    std::string name;
    int age;
    
    void introduce() const {
        std::cout << "我是" << name << "，今年" << age << "岁" << std::endl;
    }
};

int main() {
    // 使用智能指针
    UniquePtr<Person> p1(new Person{"张三", 25});
    
    // 使用箭头运算符访问成员
    p1->introduce();
    
    // 使用解引用运算符
    (*p1).name = "李四";
    p1->age = 30;
    p1->introduce();
    
    // 移动语义
    UniquePtr<Person> p2 = std::move(p1);
    
    if (!p1) {
        std::cout << "p1已经为空" << std::endl;
    }
    
    p2->introduce();
    
    return 0;
}`,
                    description: '实现完整的unique_ptr风格智能指针。'
                }
            ],
            handsOn: {
                title: '实现二维矩阵类',
                description: '实现一个Matrix类，支持下标访问 m[row][col]。',
                initialCode: `#include <iostream>
#include <stdexcept>

class Matrix {
private:
    double* data;
    size_t rows, cols;
    
public:
    Matrix(size_t r, size_t c) : rows(r), cols(c) {
        data = new double[r * c]();  // 初始化为0
    }
    
    ~Matrix() {
        delete[] data;
    }
    
    // 禁止拷贝
    Matrix(const Matrix&) = delete;
    Matrix& operator=(const Matrix&) = delete;
    
    // TODO: 实现行代理类
    class RowProxy {
    private:
        double* row;
        size_t cols;
        
    public:
        RowProxy(double* r, size_t c) : row(r), cols(c) {}
        
        // TODO: 实现下标运算符
        double& operator[](size_t col) {
            // 检查边界并返回元素
        }
    };
    
    // TODO: 实现下标运算符，返回RowProxy
    RowProxy operator[](size_t row) {
        // 检查边界并返回RowProxy
    }
    
    size_t getRows() const { return rows; }
    size_t getCols() const { return cols; }
    
    void print() const {
        for (size_t i = 0; i < rows; ++i) {
            for (size_t j = 0; j < cols; ++j) {
                std::cout << data[i * cols + j] << " ";
            }
            std::cout << std::endl;
        }
    }
};

int main() {
    Matrix m(3, 4);
    
    // 设置值
    for (size_t i = 0; i < m.getRows(); ++i) {
        for (size_t j = 0; j < m.getCols(); ++j) {
            m[i][j] = i * m.getCols() + j;
        }
    }
    
    m.print();
    
    return 0;
}`,
                expectedOutput: `0 1 2 3 
4 5 6 7 
8 9 10 11 `,
                solutionRegex: 'return RowProxy|return row\\[col\\]',
                hint: '第一次[]返回行代理，第二次[]访问具体元素',
                xp: 200
            },
            references: [
                { title: '下标和解引用运算符', book: 'C++ Primer 第五版', chapter: '第14.6节' },
                { title: '智能指针', book: 'Effective C++', chapter: '条款17-20' }
            ],
            assistantTips: [
                '下标运算符应该提供const和非const两个版本',
                '解引用和箭头运算符让类像指针一样使用',
                '多维数组可以用代理类实现',
                '箭头运算符会自动递归调用直到返回指针'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '下标运算符应该返回什么类型？', 
                    options: [
                        { text: '值' }, 
                        { text: '引用', correct: true }, 
                        { text: '指针' }, 
                        { text: 'void' }
                    ], 
                    explanation: '返回引用才能支持读写操作。' 
                },
                { 
                    type: 'single', 
                    question: '为什么需要const版本的下标运算符？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: 'const对象需要调用', correct: true }, 
                        { text: '语法要求' }, 
                        { text: '编译器限制' }
                    ], 
                    explanation: 'const对象只能调用const成员函数，所以需要const版本。' 
                },
                { 
                    type: 'single', 
                    question: '箭头运算符应该返回什么？', 
                    options: [
                        { text: '对象引用' }, 
                        { text: '对象指针', correct: true }, 
                        { text: '对象副本' }, 
                        { text: 'void' }
                    ], 
                    explanation: '箭头运算符返回指针，使得可以访问成员。' 
                },
                { 
                    type: 'single', 
                    question: '解引用运算符*应该返回什么？', 
                    options: [
                        { text: '指针' }, 
                        { text: '对象引用', correct: true }, 
                        { text: '对象副本' }, 
                        { text: 'void' }
                    ], 
                    explanation: '解引用返回对象引用，使得可以读写对象。' 
                },
                { 
                    type: 'single', 
                    question: '如何实现二维数组的下标访问？', 
                    options: [
                        { text: '重载两次[]' }, 
                        { text: '使用代理类', correct: true }, 
                        { text: '重载(,)运算符' }, 
                        { text: '不能实现' }
                    ], 
                    explanation: '使用代理类，第一次[]返回代理对象，第二次[]访问元素。' 
                }
            ]
        },
        {
            id: '8.6',
            title: '递增递减运算符',
            duration: '25分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 250,
            concepts: `## 递增递减运算符

递增(++)和递减(--)运算符需要区分前置和后置形式，它们的实现方式有所不同。

### 前置递增 ++obj

\`\`\`cpp
class Counter {
private:
    int value;
public:
    // 前置++：先递增，返回递增后的对象
    Counter& operator++() {
        ++value;
        return *this;  // 返回引用
    }
};

// 使用
Counter c(5);
++c;  // 调用 c.operator++()
\`\`\`

### 后置递增 obj++

\`\`\`cpp
class Counter {
private:
    int value;
public:
    // 后置++：返回原值，再递增
    Counter operator++(int) {  // int参数是占位符
        Counter old = *this;   // 保存原值
        ++value;               // 递增
        return old;            // 返回原值的副本
    }
};

// 使用
Counter c(5);
c++;  // 调用 c.operator++(0)
\`\`\`

### 递减运算符

\`\`\`cpp
class Counter {
public:
    // 前置--
    Counter& operator--() {
        --value;
        return *this;
    }
    
    // 后置--
    Counter operator--(int) {
        Counter old = *this;
        --value;
        return old;
    }
};
\`\`\`

### 迭代器示例

\`\`\`cpp
template<typename T>
class Iterator {
private:
    T* ptr;
public:
    // 前置++
    Iterator& operator++() {
        ++ptr;
        return *this;
    }
    
    // 后置++
    Iterator operator++(int) {
        Iterator old = *this;
        ++ptr;
        return old;
    }
    
    // 解引用
    T& operator*() const { return *ptr; }
};

// 使用
Iterator<int> it;
*++it;  // 先递增，再解引用
*it++;  // 先解引用，再递增
\`\`\`

### 设计原则

1. **前置运算符**
   - 返回引用
   - 效率更高（不需要创建副本）
   - 可以用于链式调用

2. **后置运算符**
   - 返回值（副本）
   - 需要int占位参数
   - 效率较低（需要保存原值）

3. **一致性**
   - 后置应该基于前置实现
   - 保持与内置类型相同的行为

### 最佳实践

\`\`\`cpp
class Number {
private:
    int value;
public:
    // 前置++（推荐使用）
    Number& operator++() {
        ++value;
        return *this;
    }
    
    // 后置++基于前置实现
    Number operator++(int) {
        Number temp = *this;
        ++(*this);  // 调用前置++
        return temp;
    }
};
\`\`\``,
            examples: [
                {
                    title: '计数器类',
                    code: `#include <iostream>

class Counter {
private:
    int value;
    
public:
    Counter(int v = 0) : value(v) {}
    
    // 前置++
    Counter& operator++() {
        ++value;
        std::cout << "前置++: " << value << std::endl;
        return *this;
    }
    
    // 后置++
    Counter operator++(int) {
        Counter old = *this;
        ++value;
        std::cout << "后置++: " << old.value << " -> " << value << std::endl;
        return old;
    }
    
    // 前置--
    Counter& operator--() {
        --value;
        std::cout << "前置--: " << value << std::endl;
        return *this;
    }
    
    // 后置--
    Counter operator--(int) {
        Counter old = *this;
        --value;
        std::cout << "后置--: " << old.value << " -> " << value << std::endl;
        return old;
    }
    
    int getValue() const { return value; }
    
    friend std::ostream& operator<<(std::ostream& os, const Counter& c) {
        os << c.value;
        return os;
    }
};

int main() {
    Counter c(5);
    
    std::cout << "初始值: " << c << std::endl;
    
    // 前置++
    Counter c1 = ++c;
    std::cout << "++c = " << c1 << ", c = " << c << std::endl;
    
    // 后置++
    Counter c2 = c++;
    std::cout << "c++ = " << c2 << ", c = " << c << std::endl;
    
    // 链式调用
    ++(++c);
    std::cout << "++(++c) = " << c << std::endl;
    
    return 0;
}`,
                    description: '演示前置和后置递增递减运算符的区别。'
                },
                {
                    title: '自定义迭代器',
                    code: `#include <iostream>
#include <vector>

template<typename T>
class MyIterator {
private:
    T* ptr;
    
public:
    explicit MyIterator(T* p = nullptr) : ptr(p) {}
    
    // 前置++
    MyIterator& operator++() {
        ++ptr;
        return *this;
    }
    
    // 后置++
    MyIterator operator++(int) {
        MyIterator temp = *this;
        ++ptr;
        return temp;
    }
    
    // 前置--
    MyIterator& operator--() {
        --ptr;
        return *this;
    }
    
    // 后置--
    MyIterator operator--(int) {
        MyIterator temp = *this;
        --ptr;
        return temp;
    }
    
    // 解引用
    T& operator*() const { return *ptr; }
    
    // 箭头
    T* operator->() const { return ptr; }
    
    // 比较
    bool operator==(const MyIterator& other) const { return ptr == other.ptr; }
    bool operator!=(const MyIterator& other) const { return ptr != other.ptr; }
};

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    MyIterator<int> begin(arr);
    MyIterator<int> end(arr + 5);
    
    std::cout << "正向遍历: ";
    for (MyIterator<int> it = begin; it != end; ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    std::cout << "反向遍历: ";
    for (MyIterator<int> it = end; it != begin;) {
        std::cout << *--it << " ";
    }
    std::cout << std::endl;
    
    // 演示前置和后置的区别
    MyIterator<int> it = begin;
    std::cout << "*it++ = " << *it++ << std::endl;  // 10
    std::cout << "现在 *it = " << *it << std::endl;  // 20
    
    std::cout << "*++it = " << *++it << std::endl;  // 30
    
    return 0;
}`,
                    description: '实现自定义迭代器，演示递增递减运算符。'
                }
            ],
            handsOn: {
                title: '实现位置类',
                description: '实现一个Position类，支持++和--运算符移动位置。',
                initialCode: `#include <iostream>

class Position {
private:
    int x, y;
    
public:
    Position(int x = 0, int y = 0) : x(x), y(y) {}
    
    // TODO: 前置++（向右移动）
    Position& operator++() {
        // x加1，返回*this
    }
    
    // TODO: 后置++
    Position operator++(int) {
        // 保存原值，x加1，返回原值
    }
    
    // TODO: 前置--（向左移动）
    Position& operator--() {
        // x减1，返回*this
    }
    
    // TODO: 后置--
    Position operator--(int) {
        // 保存原值，x减1，返回原值
    }
    
    friend std::ostream& operator<<(std::ostream& os, const Position& p) {
        os << "(" << p.x << ", " << p.y << ")";
        return os;
    }
};

int main() {
    Position p(5, 3);
    
    std::cout << "初始位置: " << p << std::endl;
    
    Position p1 = ++p;
    std::cout << "++p: " << p1 << ", 当前: " << p << std::endl;
    
    Position p2 = p++;
    std::cout << "p++: " << p2 << ", 当前: " << p << std::endl;
    
    --(--p);
    std::cout << "--(--p): " << p << std::endl;
    
    return 0;
}`,
                expectedOutput: `初始位置: (5, 3)
++p: (6, 3), 当前: (6, 3)
p++: (6, 3), 当前: (7, 3)
--(--p): (5, 3)`,
                solutionRegex: '\\+\\+x|--x|return \\*this',
                hint: '前置返回引用，后置返回副本',
                xp: 150
            },
            references: [
                { title: '递增递减运算符', book: 'C++ Primer 第五版', chapter: '第14.6节' },
                { title: '迭代器', book: 'C++ Primer 第五版', chapter: '第9章' }
            ],
            assistantTips: [
                '前置++返回引用，效率更高',
                '后置++需要int占位参数',
                '后置应该基于前置实现',
                '前置支持链式调用'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '前置++应该返回什么？', 
                    options: [
                        { text: 'void' }, 
                        { text: '对象副本' }, 
                        { text: '*this的引用', correct: true }, 
                        { text: '指针' }
                    ], 
                    explanation: '前置++返回引用，支持链式调用且效率高。' 
                },
                { 
                    type: 'single', 
                    question: '后置++的int参数有什么作用？', 
                    options: [
                        { text: '指定递增量' }, 
                        { text: '占位符区分前置', correct: true }, 
                        { text: '返回值' }, 
                        { text: '错误处理' }
                    ], 
                    explanation: 'int参数只是占位符，用于区分前置和后置形式。' 
                },
                { 
                    type: 'single', 
                    question: '哪个效率更高？', 
                    options: [
                        { text: '前置++', correct: true }, 
                        { text: '后置++' }, 
                        { text: '一样' }, 
                        { text: '取决于类型' }
                    ], 
                    explanation: '前置++不需要创建副本，效率更高。' 
                },
                { 
                    type: 'single', 
                    question: '*it++ 的执行顺序是？', 
                    options: [
                        { text: '先递增再解引用' }, 
                        { text: '先解引用再递增', correct: true }, 
                        { text: '同时进行' }, 
                        { text: '不确定' }
                    ], 
                    explanation: '后置++返回原值，所以先解引用原值，再递增迭代器。' 
                },
                { 
                    type: 'single', 
                    question: '如何实现后置++？', 
                    options: [
                        { text: '完全重新实现' }, 
                        { text: '基于前置++实现', correct: true }, 
                        { text: '调用库函数' }, 
                        { text: '不能实现' }
                    ], 
                    explanation: '后置++应该基于前置++实现，保持一致性。' 
                }
            ]
        },
        {
            id: '8.7',
            title: '函数调用运算符与 lambda 初步',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 400,
            concepts: `## 函数调用运算符与 lambda 初步

函数调用运算符让对象可以像函数一样被调用，这种对象称为"函数对象"或"仿函数"。Lambda表达式是C++11引入的匿名函数对象。

### 函数调用运算符 ()

#### 基本实现

\`\`\`cpp
class Adder {
private:
    int offset;
public:
    Adder(int o) : offset(o) {}
    
    // 函数调用运算符
    int operator()(int x) const {
        return x + offset;
    }
};

// 使用
Adder add5(5);
int result = add5(10);  // result = 15
\`\`\`

#### 多参数版本

\`\`\`cpp
class Calculator {
public:
    int operator()(int a, int b, char op) const {
        switch(op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b != 0 ? a / b : 0;
            default: return 0;
        }
    }
};

// 使用
Calculator calc;
int result = calc(10, 5, '+');  // 15
\`\`\`

### 函数对象的优势

1. **可以保存状态**
\`\`\`cpp
class Counter {
private:
    int count;
public:
    Counter() : count(0) {}
    int operator()() { return ++count; }
};

Counter c;
c();  // 1
c();  // 2
c();  // 3
\`\`\`

2. **可以内联优化**
3. **可以作为算法参数**

### Lambda 表达式

#### 基本语法

\`\`\`cpp
[capture](parameters) -> return_type { body }
\`\`\`

#### 示例

\`\`\`cpp
// 最简单的lambda
auto greet = []() { std::cout << "Hello"; };
greet();  // Hello

// 带参数
auto add = [](int a, int b) { return a + b; };
int sum = add(3, 4);  // 7

// 显式返回类型
auto divide = [](double a, double b) -> double {
    return b != 0 ? a / b : 0;
};
\`\`\`

### 捕获列表

\`\`\`cpp
int x = 10;
int y = 20;

// 值捕获
auto f1 = [x]() { return x; };

// 引用捕获
auto f2 = [&x]() { x++; };

// 全部值捕获
auto f3 = [=]() { return x + y; };

// 全部引用捕获
auto f4 = [&]() { x++; y++; };

// 混合捕获
auto f5 = [=, &x]() { x = y; };  // x引用，y值
\`\`\`

### 在算法中使用

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> nums = {1, 2, 3, 4, 5};

// 使用lambda作为谓词
int count = std::count_if(nums.begin(), nums.end(), 
    [](int n) { return n % 2 == 0; });  // 统计偶数

// 使用函数对象
struct IsEven {
    bool operator()(int n) const { return n % 2 == 0; }
};
int count2 = std::count_if(nums.begin(), nums.end(), IsEven());
\`\`\`

### std::function

\`\`\`cpp
#include <functional>

// 可以存储任何可调用对象
std::function<int(int, int)> operation;

operation = [](int a, int b) { return a + b; };
operation(3, 4);  // 7

operation = std::multiplies<int>();
operation(3, 4);  // 12
\`\`\``,
            examples: [
                {
                    title: '函数对象示例',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

// 函数对象：判断是否在范围内
class InRange {
private:
    int low, high;
public:
    InRange(int l, int h) : low(l), high(h) {}
    
    bool operator()(int value) const {
        return value >= low && value <= high;
    }
};

// 函数对象：累加器
class Accumulator {
private:
    int sum;
public:
    Accumulator() : sum(0) {}
    
    int operator()(int value) {
        sum += value;
        return sum;
    }
    
    int getSum() const { return sum; }
};

int main() {
    std::vector<int> numbers = {1, 5, 10, 15, 20, 25, 30};
    
    // 使用函数对象统计范围内的数字
    InRange rangeChecker(10, 25);
    int count = std::count_if(numbers.begin(), numbers.end(), rangeChecker);
    std::cout << "10-25之间的数字个数: " << count << std::endl;
    
    // 使用累加器
    Accumulator acc;
    for (int n : numbers) {
        acc(n);
    }
    std::cout << "累加和: " << acc.getSum() << std::endl;
    
    // 直接使用函数对象
    InRange checker(5, 15);
    std::cout << "8在5-15范围内? " << (checker(8) ? "是" : "否") << std::endl;
    std::cout << "20在5-15范围内? " << (checker(20) ? "是" : "否") << std::endl;
    
    return 0;
}`,
                    description: '演示函数对象的使用场景。'
                },
                {
                    title: 'Lambda表达式示例',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // 1. 基本lambda
    auto printVector = [&numbers]() {
        for (int n : numbers) {
            std::cout << n << " ";
        }
        std::cout << std::endl;
    };
    
    std::cout << "原始数组: ";
    printVector();
    
    // 2. 排序（使用lambda）
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {
        return a > b;  // 降序
    });
    std::cout << "降序排序: ";
    printVector();
    
    // 3. 查找（使用lambda）
    int threshold = 5;
    auto it = std::find_if(numbers.begin(), numbers.end(), 
        [threshold](int n) { return n < threshold; });
    if (it != numbers.end()) {
        std::cout << "第一个小于" << threshold << "的数: " << *it << std::endl;
    }
    
    // 4. 变换（使用lambda）
    int multiplier = 10;
    std::transform(numbers.begin(), numbers.end(), numbers.begin(),
        [multiplier](int n) { return n * multiplier; });
    std::cout << "乘以" << multiplier << ": ";
    printVector();
    
    // 5. 带状态的lambda
    int sum = 0;
    std::for_each(numbers.begin(), numbers.end(), [&sum](int n) {
        sum += n;
    });
    std::cout << "总和: " << sum << std::endl;
    
    // 6. std::function存储lambda
    std::function<int(int)> operations[] = {
        [](int x) { return x * 2; },
        [](int x) { return x + 10; },
        [](int x) { return x * x; }
    };
    
    int value = 5;
    std::cout << "对" << value << "进行操作:" << std::endl;
    for (auto& op : operations) {
        std::cout << "  结果: " << op(value) << std::endl;
    }
    
    return 0;
}`,
                    description: '演示lambda表达式的各种用法。'
                }
            ],
            handsOn: {
                title: '实现自定义排序器',
                description: '使用函数对象和lambda实现多种排序方式。',
                initialCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct Person {
    std::string name;
    int age;
    double score;
};

// TODO: 实现按年龄排序的函数对象
class CompareByAge {
public:
    bool operator()(const Person& a, const Person& b) const {
        // 返回a的年龄是否小于b的年龄
    }
};

// TODO: 实现按分数排序的函数对象
class CompareByScore {
public:
    bool operator()(const Person& a, const Person& b) const {
        // 返回a的分数是否大于b的分数（降序）
    }
};

void printPersons(const std::vector<Person>& persons) {
    for (const auto& p : persons) {
        std::cout << p.name << " (年龄:" << p.age 
                  << ", 分数:" << p.score << ")" << std::endl;
    }
    std::cout << std::endl;
}

int main() {
    std::vector<Person> persons = {
        {"张三", 20, 85.5},
        {"李四", 22, 92.0},
        {"王五", 19, 78.5},
        {"赵六", 21, 95.5}
    };
    
    std::cout << "原始数据:" << std::endl;
    printPersons(persons);
    
    // 按年龄排序
    std::sort(persons.begin(), persons.end(), CompareByAge());
    std::cout << "按年龄排序:" << std::endl;
    printPersons(persons);
    
    // 按分数排序
    std::sort(persons.begin(), persons.end(), CompareByScore());
    std::cout << "按分数排序:" << std::endl;
    printPersons(persons);
    
    // TODO: 使用lambda按姓名排序
    // std::sort(persons.begin(), persons.end(), ...);
    std::cout << "按姓名排序:" << std::endl;
    printPersons(persons);
    
    return 0;
}`,
                expectedOutput: `原始数据:
张三 (年龄:20, 分数:85.5)
李四 (年龄:22, 分数:92)
王五 (年龄:19, 分数:78.5)
赵六 (年龄:21, 分数:95.5)`,
                solutionRegex: 'return a\\.age < b\\.age|return a\\.score > b\\.score',
                hint: '函数对象重载()运算符，返回bool表示比较结果',
                xp: 200
            },
            references: [
                { title: '函数对象', book: 'C++ Primer 第五版', chapter: '第14.8节' },
                { title: 'Lambda表达式', book: 'C++ Primer 第五版', chapter: '第10.3节' }
            ],
            assistantTips: [
                '函数对象可以保存状态，比函数指针更灵活',
                'Lambda本质上是编译器生成的函数对象',
                '值捕获在lambda创建时拷贝，引用捕获保持引用',
                '优先使用lambda，需要保存状态或复用时用函数对象'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '函数调用运算符是？', 
                    options: [
                        { text: '()' }, 
                        { text: 'operator()', correct: true }, 
                        { text: 'call()' }, 
                        { text: 'invoke()' }
                    ], 
                    explanation: '函数调用运算符是operator()，让对象可以像函数一样调用。' 
                },
                { 
                    type: 'single', 
                    question: 'Lambda的捕获列表[=]表示？', 
                    options: [
                        { text: '不捕获任何变量' }, 
                        { text: '引用捕获所有变量' }, 
                        { text: '值捕获所有变量', correct: true }, 
                        { text: '捕获this指针' }
                    ], 
                    explanation: '[=]表示值捕获所有局部变量。' 
                },
                { 
                    type: 'single', 
                    question: 'Lambda的捕获列表[&x]表示？', 
                    options: [
                        { text: '值捕获x' }, 
                        { text: '引用捕获x', correct: true }, 
                        { text: '不捕获x' }, 
                        { text: '捕获x的地址' }
                    ], 
                    explanation: '[&x]表示引用捕获变量x。' 
                },
                { 
                    type: 'single', 
                    question: '函数对象相比函数指针的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '可以保存状态', correct: true }, 
                        { text: '语法更简单' }, 
                        { text: '不需要头文件' }
                    ], 
                    explanation: '函数对象可以保存状态，而函数指针不能。' 
                },
                { 
                    type: 'single', 
                    question: 'std::function可以存储什么？', 
                    options: [
                        { text: '只能存储函数指针' }, 
                        { text: '只能存储lambda' }, 
                        { text: '任何可调用对象', correct: true }, 
                        { text: '只能存储函数对象' }
                    ], 
                    explanation: 'std::function可以存储函数指针、lambda、函数对象等任何可调用对象。' 
                }
            ]
        },
        {
            id: '8.8',
            title: '类型转换运算符与 explicit',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 350,
            concepts: `## 类型转换运算符与 explicit

类型转换运算符允许对象自动转换为其他类型，而explicit关键字可以控制这种转换的发生方式。

### 类型转换运算符

#### 基本语法

\`\`\`cpp
class MyClass {
public:
    operator target_type() const {
        return converted_value;
    }
};
\`\`\`

#### 示例：分数转double

\`\`\`cpp
class Fraction {
private:
    int numerator, denominator;
public:
    Fraction(int n, int d) : numerator(n), denominator(d) {}
    
    // 转换为double
    operator double() const {
        return static_cast<double>(numerator) / denominator;
    }
};

Fraction f(3, 4);
double d = f;  // 隐式转换，d = 0.75
\`\`\`

#### 转换为bool

\`\`\`cpp
class SmartPtr {
private:
    void* ptr;
public:
    // 转换为bool，用于条件判断
    explicit operator bool() const {
        return ptr != nullptr;
    }
};

SmartPtr p;
if (p) {  // 使用bool转换
    // ...
}
\`\`\`

### explicit 关键字

#### 用于构造函数

\`\`\`cpp
class MyInt {
private:
    int value;
public:
    // explicit禁止隐式转换
    explicit MyInt(int v) : value(v) {}
};

MyInt a(10);      // OK：直接初始化
MyInt b = 10;     // 错误：隐式转换被禁止
MyInt c = MyInt(10);  // OK：显式转换
\`\`\`

#### 用于类型转换运算符

\`\`\`cpp
class MyString {
private:
    std::string str;
public:
    // explicit转换运算符
    explicit operator std::string() const {
        return str;
    }
};

MyString s("hello");
std::string str = s;  // 错误：隐式转换被禁止
std::string str2 = static_cast<std::string>(s);  // OK
\`\`\`

### 转换的二义性

\`\`\`cpp
class B;
class A {
public:
    A(const B&);  // B可以转换为A
};

class B {
public:
    operator A() const;  // B也可以转换为A
};

B b;
A a = b;  // 错误：二义性！两种转换路径
A a2(b);  // OK：直接调用构造函数
A a3 = b.operator A();  // OK：显式调用转换运算符
\`\`\`

### 设计原则

1. **避免过度使用类型转换运算符**
   - 容易产生意外行为
   - 可能导致二义性

2. **使用explicit防止意外转换**
   - 单参数构造函数通常应该声明为explicit
   - 类型转换运算符也可以声明为explicit

3. **转换为bool是例外**
   - 通常不需要explicit
   - 用于条件判断很自然

4. **提供显式转换函数作为替代**
\`\`\`cpp
class Fraction {
public:
    // 显式转换函数
    double toDouble() const {
        return static_cast<double>(numerator) / denominator;
    }
};

double d = f.toDouble();  // 显式调用
\`\`\``,
            examples: [
                {
                    title: '温度类类型转换',
                    code: `#include <iostream>
#include <iomanip>

class Temperature {
private:
    double celsius;
    
public:
    explicit Temperature(double c = 0) : celsius(c) {}
    
    // 转换为华氏度
    explicit operator double() const {
        return celsius * 9.0 / 5.0 + 32.0;
    }
    
    // 显式转换函数
    double toCelsius() const { return celsius; }
    double toFahrenheit() const {
        return celsius * 9.0 / 5.0 + 32.0;
    }
    double toKelvin() const {
        return celsius + 273.15;
    }
    
    friend std::ostream& operator<<(std::ostream& os, const Temperature& t) {
        os << std::fixed << std::setprecision(2)
           << t.celsius << "°C";
        return os;
    }
};

int main() {
    Temperature temp(25);  // 25摄氏度
    
    std::cout << "温度: " << temp << std::endl;
    std::cout << "华氏度: " << temp.toFahrenheit() << "°F" << std::endl;
    std::cout << "开尔文: " << temp.toKelvin() << "K" << std::endl;
    
    // 使用显式转换运算符
    double fahrenheit = static_cast<double>(temp);
    std::cout << "显式转换: " << fahrenheit << "°F" << std::endl;
    
    // Temperature t = 30;  // 错误：explicit禁止隐式转换
    Temperature t2(30);    // OK：直接初始化
    
    return 0;
}`,
                    description: '演示类型转换运算符和explicit的使用。'
                },
                {
                    title: '智能指针bool转换',
                    code: `#include <iostream>

template<typename T>
class SmartPtr {
private:
    T* ptr;
    
public:
    explicit SmartPtr(T* p = nullptr) : ptr(p) {}
    
    ~SmartPtr() { delete ptr; }
    
    // 禁止拷贝
    SmartPtr(const SmartPtr&) = delete;
    SmartPtr& operator=(const SmartPtr&) = delete;
    
    // 移动构造
    SmartPtr(SmartPtr&& other) noexcept : ptr(other.ptr) {
        other.ptr = nullptr;
    }
    
    // 解引用
    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
    
    // 转换为bool（用于条件判断）
    explicit operator bool() const {
        return ptr != nullptr;
    }
    
    // 获取原始指针
    T* get() const { return ptr; }
};

class Resource {
public:
    Resource() { std::cout << "Resource created" << std::endl; }
    ~Resource() { std::cout << "Resource destroyed" << std::endl; }
    void use() { std::cout << "Resource used" << std::endl; }
};

int main() {
    SmartPtr<Resource> p1(new Resource());
    SmartPtr<Resource> p2;
    
    // 使用bool转换
    if (p1) {
        std::cout << "p1 is valid" << std::endl;
        p1->use();
    }
    
    if (!p2) {
        std::cout << "p2 is null" << std::endl;
    }
    
    // 在条件表达式中使用
    SmartPtr<Resource> p3 = p1 ? SmartPtr<Resource>(new Resource()) 
                               : SmartPtr<Resource>();
    
    if (p3) {
        std::cout << "p3 is valid" << std::endl;
    }
    
    return 0;
}`,
                    description: '智能指针使用bool转换运算符。'
                }
            ],
            handsOn: {
                title: '实现角度类类型转换',
                description: '实现Angle类，支持转换为弧度和度数。',
                initialCode: `#include <iostream>
#include <cmath>

class Angle {
private:
    double degrees;  // 角度值
    
public:
    explicit Angle(double d = 0) : degrees(d) {}
    
    // TODO: 转换为弧度
    explicit operator double() const {
        // 角度转弧度：弧度 = 角度 * π / 180
    }
    
    // 显式转换函数
    double toDegrees() const { return degrees; }
    
    double toRadians() const {
        return degrees * M_PI / 180.0;
    }
    
    // 三角函数
    double sin() const {
        return std::sin(toRadians());
    }
    
    double cos() const {
        return std::cos(toRadians());
    }
    
    friend std::ostream& operator<<(std::ostream& os, const Angle& a) {
        os << a.degrees << "°";
        return os;
    }
};

int main() {
    Angle a(45);  // 45度
    
    std::cout << "角度: " << a << std::endl;
    std::cout << "弧度: " << a.toRadians() << std::endl;
    std::cout << "sin(45°) = " << a.sin() << std::endl;
    std::cout << "cos(45°) = " << a.cos() << std::endl;
    
    // 显式转换
    double radians = static_cast<double>(a);
    std::cout << "显式转换为弧度: " << radians << std::endl;
    
    return 0;
}`,
                expectedOutput: `角度: 45°
弧度: 0.785398
sin(45°) = 0.707107
cos(45°) = 0.707107`,
                solutionRegex: 'return degrees.*M_PI|return degrees.*3\\.14159',
                hint: '弧度 = 角度 * π / 180',
                xp: 200
            },
            references: [
                { title: '类型转换运算符', book: 'C++ Primer 第五版', chapter: '第14.9节' },
                { title: 'explicit', book: 'Effective C++', chapter: '条款5' }
            ],
            assistantTips: [
                '类型转换运算符没有返回类型声明',
                'explicit防止意外的隐式转换',
                '转换为bool通常不需要explicit',
                '优先使用显式转换函数而非转换运算符'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '类型转换运算符的语法是？', 
                    options: [
                        { text: 'T operator()()' }, 
                        { text: 'operator T() const', correct: true }, 
                        { text: 'T cast()' }, 
                        { text: 'convert T()' }
                    ], 
                    explanation: '类型转换运算符使用operator关键字后跟目标类型。' 
                },
                { 
                    type: 'single', 
                    question: 'explicit的作用是？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '禁止隐式转换', correct: true }, 
                        { text: '允许隐式转换' }, 
                        { text: '优化代码' }
                    ], 
                    explanation: 'explicit关键字禁止构造函数或转换运算符的隐式调用。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个应该声明为explicit？', 
                    options: [
                        { text: '拷贝构造函数' }, 
                        { text: '单参数构造函数', correct: true }, 
                        { text: '析构函数' }, 
                        { text: '移动构造函数' }
                    ], 
                    explanation: '单参数构造函数容易产生意外的隐式转换，应该声明为explicit。' 
                },
                { 
                    type: 'single', 
                    question: '类型转换运算符可以返回什么？', 
                    options: [
                        { text: '任意类型' }, 
                        { text: '基本类型和类类型', correct: true }, 
                        { text: '只能基本类型' }, 
                        { text: '只能类类型' }
                    ], 
                    explanation: '类型转换运算符可以转换为基本类型（如double、bool）或类类型。' 
                },
                { 
                    type: 'single', 
                    question: '为什么bool转换运算符通常不需要explicit？', 
                    options: [
                        { text: '语法不允许' }, 
                        { text: '用于条件判断很自然', correct: true }, 
                        { text: '性能更好' }, 
                        { text: '编译器要求' }
                    ], 
                    explanation: 'bool转换用于if、while等条件判断，隐式转换很自然。' 
                }
            ]
        },
        {
            id: '8.9',
            title: '字面值常量类',
            duration: '30分钟',
            difficulty: '进阶',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 字面值常量类

字面值常量类（Literal Class）是C++11引入的特性，允许在编译期创建和使用类对象，这对于模板元编程和constexpr函数非常重要。

### constexpr 构造函数

\`\`\`cpp
class Point {
private:
    int x, y;
public:
    // constexpr构造函数
    constexpr Point(int x = 0, int y = 0) : x(x), y(y) {}
    
    // constexpr成员函数
    constexpr int getX() const { return x; }
    constexpr int getY() const { return y; }
    
    constexpr int distanceSquared() const {
        return x * x + y * y;
    }
};

// 编译期创建对象
constexpr Point p(3, 4);
constexpr int dist = p.distanceSquared();  // 编译期计算：25
\`\`\`

### 字面值常量类的条件

1. **所有数据成员都必须是字面值类型**
   - 基本类型（int, double等）
   - 其他字面值常量类
   - 指针和引用

2. **必须有constexpr构造函数**

3. **如果有基类，基类必须是字面值常量类**

4. **不能有虚函数或虚基类**

5. **成员函数必须是constexpr（如果要编译期使用）**

### constexpr 成员函数

\`\`\`cpp
class Complex {
private:
    double real, imag;
public:
    constexpr Complex(double r = 0, double i = 0) 
        : real(r), imag(i) {}
    
    constexpr double getReal() const { return real; }
    constexpr double getImag() const { return imag; }
    
    constexpr double magnitudeSquared() const {
        return real * real + imag * imag;
    }
    
    constexpr Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }
};

// 编译期运算
constexpr Complex c1(3, 4);
constexpr Complex c2(1, 2);
constexpr Complex c3 = c1 + c2;  // 编译期计算
constexpr double mag = c3.magnitudeSquared();  // 52
\`\`\`

### 编译期数组

\`\`\`cpp
#include <array>

constexpr std::array<int, 5> makeArray() {
    return {1, 2, 3, 4, 5};
}

constexpr auto arr = makeArray();
static_assert(arr[2] == 3, "Compile-time check");
\`\`\`

### 实际应用：编译期计算

\`\`\`cpp
class Rational {
private:
    int num, den;
public:
    constexpr Rational(int n, int d) : num(n), den(d) {}
    
    constexpr Rational reduce() const {
        return Rational(num / gcd(num, den), den / gcd(num, den));
    }
    
    constexpr int gcd(int a, int b) const {
        return b == 0 ? a : gcd(b, a % b);
    }
    
    constexpr int numerator() const { return num; }
    constexpr int denominator() const { return den; }
};

constexpr Rational r(6, 8);
constexpr Rational reduced = r.reduce();
static_assert(reduced.numerator() == 3, "Should be 3/4");
static_assert(reduced.denominator() == 4, "Should be 3/4");
\`\`\`

### 字面值运算符

\`\`\`cpp
class Distance {
private:
    double meters;
public:
    constexpr Distance(double m) : meters(m) {}
    constexpr double getMeters() const { return meters; }
};

// 用户定义字面值
constexpr Distance operator""_km(long double d) {
    return Distance(d * 1000);
}

constexpr Distance operator""_m(long double d) {
    return Distance(d);
}

// 使用
constexpr Distance d1 = 5.0_km;   // 5000米
constexpr Distance d2 = 300.0_m;  // 300米
\`\`\``,
            examples: [
                {
                    title: '编译期数学计算',
                    code: `#include <iostream>
#include <cmath>

class Angle {
private:
    double degrees;
    
public:
    constexpr Angle(double d = 0) : degrees(d) {}
    
    constexpr double toRadians() const {
        return degrees * 3.14159265359 / 180.0;
    }
    
    // C++26之前，constexpr函数不能调用非constexpr函数
    // 这里使用泰勒级数近似计算sin
    constexpr double sin() const {
        double x = toRadians();
        double term = x;
        double sum = x;
        
        for (int n = 1; n < 10; ++n) {
            term *= -x * x / ((2 * n) * (2 * n + 1));
            sum += term;
        }
        
        return sum;
    }
    
    constexpr double getDegrees() const { return degrees; }
};

int main() {
    // 编译期计算
    constexpr Angle a(30);
    constexpr double sin30 = a.sin();
    
    std::cout << "sin(30°) = " << sin30 << std::endl;
    std::cout << "标准库: " << std::sin(a.toRadians()) << std::endl;
    
    // 编译期验证
    static_assert(sin30 > 0.49 && sin30 < 0.51, "sin(30°) ≈ 0.5");
    
    // 运行时使用
    Angle b(45);
    std::cout << "sin(45°) = " << b.sin() << std::endl;
    
    return 0;
}`,
                    description: '使用字面值常量类进行编译期数学计算。'
                },
                {
                    title: '编译期字符串处理',
                    code: `#include <iostream>
#include <array>

// 编译期字符串类
class ConstexprString {
private:
    const char* data;
    size_t len;
    
public:
    template<size_t N>
    constexpr ConstexprString(const char (&str)[N]) 
        : data(str), len(N - 1) {}
    
    constexpr size_t size() const { return len; }
    
    constexpr char operator[](size_t i) const {
        return i < len ? data[i] : '\\0';
    }
    
    constexpr bool startsWith(char c) const {
        return len > 0 && data[0] == c;
    }
    
    constexpr size_t count(char c) const {
        size_t cnt = 0;
        for (size_t i = 0; i < len; ++i) {
            if (data[i] == c) ++cnt;
        }
        return cnt;
    }
};

int main() {
    constexpr ConstexprString str("Hello, World!");
    
    // 编译期计算
    constexpr size_t len = str.size();
    constexpr char first = str[0];
    constexpr size_t l_count = str.count('l');
    
    std::cout << "字符串长度: " << len << std::endl;
    std::cout << "第一个字符: " << first << std::endl;
    std::cout << "'l'的数量: " << l_count << std::endl;
    
    // 编译期验证
    static_assert(len == 13, "Length should be 13");
    static_assert(first == 'H', "First char should be 'H'");
    static_assert(l_count == 3, "Should have 3 'l's");
    
    // 运行时使用
    ConstexprString str2("Programming");
    std::cout << "字符串: " << str2.size() << " 个字符" << std::endl;
    std::cout << "'r'的数量: " << str2.count('r') << std::endl;
    
    return 0;
}`,
                    description: '实现编译期字符串处理。'
                }
            ],
            handsOn: {
                title: '实现编译期复数类',
                description: '实现一个constexpr复数类，支持编译期运算。',
                initialCode: `#include <iostream>

class Complex {
private:
    double real, imag;
    
public:
    // constexpr构造函数
    constexpr Complex(double r = 0, double i = 0) 
        : real(r), imag(i) {}
    
    // TODO: constexpr获取实部
    constexpr double getReal() const {
        // 返回real
    }
    
    // TODO: constexpr获取虚部
    constexpr double getImag() const {
        // 返回imag
    }
    
    // TODO: constexpr加法运算符
    constexpr Complex operator+(const Complex& other) const {
        // 返回两个复数的和
    }
    
    // TODO: constexpr模的平方
    constexpr double magnitudeSquared() const {
        // 返回 |z|² = real² + imag²
    }
    
    friend std::ostream& operator<<(std::ostream& os, const Complex& c) {
        os << c.real << " + " << c.imag << "i";
        return os;
    }
};

int main() {
    // 编译期计算
    constexpr Complex c1(3, 4);
    constexpr Complex c2(1, 2);
    constexpr Complex c3 = c1 + c2;
    constexpr double mag = c3.magnitudeSquared();
    
    std::cout << "c1 = " << c1 << std::endl;
    std::cout << "c2 = " << c2 << std::endl;
    std::cout << "c1 + c2 = " << c3 << std::endl;
    std::cout << "|c3|² = " << mag << std::endl;
    
    // 编译期验证
    static_assert(c3.getReal() == 4, "Real part should be 4");
    static_assert(c3.getImag() == 6, "Imag part should be 6");
    static_assert(mag == 52, "Magnitude squared should be 52");
    
    return 0;
}`,
                expectedOutput: `c1 = 3 + 4i
c2 = 1 + 2i
c1 + c2 = 4 + 6i
|c3|² = 52`,
                solutionRegex: 'return real|return imag|return Complex|return real.*real.*imag.*imag',
                hint: 'constexpr函数必须可以在编译期执行',
                xp: 200
            },
            references: [
                { title: 'constexpr类', book: 'C++ Primer 第五版', chapter: '第7.5节' },
                { title: 'constexpr函数', book: 'C++ Primer 第五版', chapter: '第6.5节' }
            ],
            assistantTips: [
                '字面值常量类允许编译期创建对象',
                'constexpr构造函数必须有函数体',
                'constexpr成员函数默认是const的',
                '编译期计算可以提高运行时性能'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '字面值常量类必须有？', 
                    options: [
                        { text: '虚函数' }, 
                        { text: 'constexpr构造函数', correct: true }, 
                        { text: '动态内存分配' }, 
                        { text: '友元函数' }
                    ], 
                    explanation: '字面值常量类必须有至少一个constexpr构造函数。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr成员函数有什么限制？', 
                    options: [
                        { text: '不能有返回值' }, 
                        { text: '必须是静态的' }, 
                        { text: '必须是编译期可计算的', correct: true }, 
                        { text: '不能有参数' }
                    ], 
                    explanation: 'constexpr成员函数必须能在编译期执行完成。' 
                },
                { 
                    type: 'single', 
                    question: '字面值常量类不能有？', 
                    options: [
                        { text: '基本类型成员' }, 
                        { text: '虚函数', correct: true }, 
                        { text: 'constexpr构造函数' }, 
                        { text: '其他字面值常量类成员' }
                    ], 
                    explanation: '字面值常量类不能有虚函数或虚基类。' 
                },
                { 
                    type: 'single', 
                    question: 'constexpr对象在什么时候创建？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译期', correct: true }, 
                        { text: '链接时' }, 
                        { text: '加载时' }
                    ], 
                    explanation: 'constexpr对象在编译期创建，值在编译期确定。' 
                },
                { 
                    type: 'single', 
                    question: '以下哪个是字面值类型？', 
                    options: [
                        { text: 'std::vector' }, 
                        { text: 'std::string' }, 
                        { text: 'std::array', correct: true }, 
                        { text: 'std::map' }
                    ], 
                    explanation: 'std::array是字面值类型，可以在constexpr中使用。' 
                }
            ]
        },
        {
            id: '8.10',
            title: '类的设计与最佳实践',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 400,
            concepts: `## 类的设计与最佳实践

良好的类设计是写出高质量C++代码的基础。本节总结类设计的核心原则和最佳实践。

### 类设计原则

#### 1. 单一职责原则（SRP）

一个类应该只有一个引起它变化的原因。

\`\`\`cpp
// 不好：一个类做太多事
class User {
public:
    void login();
    void logout();
    void saveToFile();
    void loadFromFile();
    void sendEmail();
};

// 好：职责分离
class User {
public:
    void login();
    void logout();
};

class UserRepository {
public:
    void save(const User& user);
    User load(int id);
};

class EmailService {
public:
    void sendEmail(const User& user, const std::string& message);
};
\`\`\`

#### 2. 封装

隐藏实现细节，只暴露必要的接口。

\`\`\`cpp
// 好：数据私有，提供访问方法
class BankAccount {
private:
    double balance;
    
public:
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    
    bool withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    double getBalance() const { return balance; }
};
\`\`\`

#### 3. RAII（资源获取即初始化）

\`\`\`cpp
class FileHandle {
private:
    FILE* file;
    
public:
    FileHandle(const char* filename, const char* mode) {
        file = fopen(filename, mode);
        if (!file) throw std::runtime_error("Cannot open file");
    }
    
    ~FileHandle() {
        if (file) fclose(file);
    }
    
    // 禁止拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
    
    // 允许移动
    FileHandle(FileHandle&& other) noexcept : file(other.file) {
        other.file = nullptr;
    }
    
    FILE* get() const { return file; }
};

// 使用
void processFile() {
    FileHandle file("data.txt", "r");
    // 使用file...
    // 函数结束时自动关闭文件
}
\`\`\`

### 构造函数和析构函数

#### 构造函数最佳实践

\`\`\`cpp
class Widget {
private:
    std::string name;
    std::vector<int> data;
    int* ptr;
    
public:
    // 1. 使用成员初始化列表
    Widget(const std::string& n, size_t size) 
        : name(n), data(size), ptr(new int[size]) {}
    
    // 2. 委托构造
    Widget() : Widget("default", 10) {}
    
    // 3. explicit避免隐式转换
    explicit Widget(int value) : Widget("value", value) {}
    
    // 4. 移动构造
    Widget(Widget&& other) noexcept
        : name(std::move(other.name))
        , data(std::move(other.data))
        , ptr(other.ptr) {
        other.ptr = nullptr;
    }
};
\`\`\`

#### 析构函数最佳实践

\`\`\`cpp
class Resource {
public:
    // 1. 基类析构函数应该是virtual
    virtual ~Resource() {
        // 释放资源
    }
    
    // 2. 析构函数不应该抛出异常
    ~Resource() noexcept {
        try {
            // 清理代码
        } catch (...) {
            // 捕获并处理异常
        }
    }
};
\`\`\`

### 运算符重载最佳实践

\`\`\`cpp
class Number {
private:
    int value;
    
public:
    // 1. 返回类型要合理
    Number operator+(const Number& rhs) const {
        return Number(value + rhs.value);  // 返回新对象
    }
    
    Number& operator+=(const Number& rhs) {
        value += rhs.value;
        return *this;  // 返回引用
    }
    
    // 2. 保持语义一致
    bool operator==(const Number& rhs) const {
        return value == rhs.value;
    }
    
    bool operator!=(const Number& rhs) const {
        return !(*this == rhs);  // 基于==实现
    }
    
    // 3. 不要重载&&、||、,
    // 这些运算符的重载会改变求值顺序
};
\`\`\`

### 类设计检查清单

1. **构造函数**
   - [ ] 是否需要explicit？
   - [ ] 成员是否都初始化了？
   - [ ] 是否需要委托构造？

2. **拷贝控制**
   - [ ] 是否需要自定义拷贝/移动？
   - [ ] 是否需要禁止拷贝？
   - [ ] 是否遵循三/五法则？

3. **析构函数**
   - [ ] 是否需要virtual析构函数？
   - [ ] 是否正确释放资源？

4. **运算符重载**
   - [ ] 返回类型是否正确？
   - [ ] 是否保持语义一致？
   - [ ] 是否提供const和非const版本？

5. **封装**
   - [ ] 数据成员是否私有？
   - [ ] 是否只暴露必要的接口？

6. **异常安全**
   - [ ] 是否提供基本保证？
   - [ ] 析构函数是否noexcept？`,
            examples: [
                {
                    title: '良好设计的银行账户类',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <iomanip>

class BankAccount {
private:
    std::string accountNumber;
    std::string ownerName;
    double balance;
    std::vector<std::string> transactionHistory;
    
    void recordTransaction(const std::string& type, double amount) {
        std::ostringstream oss;
        oss << type << ": $" << std::fixed << std::setprecision(2) << amount;
        transactionHistory.push_back(oss.str());
    }
    
public:
    // 构造函数
    BankAccount(const std::string& number, const std::string& owner)
        : accountNumber(number), ownerName(owner), balance(0.0) {
        if (number.empty() || owner.empty()) {
            throw std::invalid_argument("Account number and owner name required");
        }
    }
    
    // 存款
    void deposit(double amount) {
        if (amount <= 0) {
            throw std::invalid_argument("Deposit amount must be positive");
        }
        balance += amount;
        recordTransaction("Deposit", amount);
    }
    
    // 取款
    bool withdraw(double amount) {
        if (amount <= 0) {
            throw std::invalid_argument("Withdrawal amount must be positive");
        }
        if (amount > balance) {
            return false;
        }
        balance -= amount;
        recordTransaction("Withdrawal", amount);
        return true;
    }
    
    // 查询余额
    double getBalance() const { return balance; }
    
    // 查询账户信息
    std::string getAccountNumber() const { return accountNumber; }
    std::string getOwnerName() const { return ownerName; }
    
    // 打印交易历史
    void printTransactionHistory() const {
        std::cout << "Transaction History for " << ownerName << ":" << std::endl;
        for (const auto& t : transactionHistory) {
            std::cout << "  " << t << std::endl;
        }
        std::cout << "Current Balance: $" << std::fixed << std::setprecision(2) 
                  << balance << std::endl;
    }
    
    // 输出运算符
    friend std::ostream& operator<<(std::ostream& os, const BankAccount& acc) {
        os << "Account: " << acc.accountNumber 
           << ", Owner: " << acc.ownerName
           << ", Balance: $" << std::fixed << std::setprecision(2) << acc.balance;
        return os;
    }
};

int main() {
    try {
        BankAccount account("1234567890", "张三");
        
        std::cout << account << std::endl;
        
        account.deposit(1000);
        account.withdraw(300);
        account.deposit(500);
        account.withdraw(200);
        
        std::cout << std::endl;
        account.printTransactionHistory();
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                    description: '展示良好设计的银行账户类。'
                },
                {
                    title: 'RAII资源管理示例',
                    code: `#include <iostream>
#include <fstream>
#include <memory>
#include <vector>

// RAII文件管理类
class FileWrapper {
private:
    std::ofstream file;
    std::string filename;
    
public:
    explicit FileWrapper(const std::string& fname) 
        : filename(fname) {
        file.open(filename);
        if (!file.is_open()) {
            throw std::runtime_error("Cannot open file: " + filename);
        }
        std::cout << "File opened: " << filename << std::endl;
    }
    
    ~FileWrapper() {
        if (file.is_open()) {
            file.close();
            std::cout << "File closed: " << filename << std::endl;
        }
    }
    
    // 禁止拷贝
    FileWrapper(const FileWrapper&) = delete;
    FileWrapper& operator=(const FileWrapper&) = delete;
    
    // 允许移动
    FileWrapper(FileWrapper&& other) noexcept 
        : file(std::move(other.file)), filename(std::move(other.filename)) {
        std::cout << "File moved: " << filename << std::endl;
    }
    
    FileWrapper& operator=(FileWrapper&& other) noexcept {
        if (this != &other) {
            if (file.is_open()) file.close();
            file = std::move(other.file);
            filename = std::move(other.filename);
        }
        return *this;
    }
    
    void write(const std::string& content) {
        if (file.is_open()) {
            file << content << std::endl;
        }
    }
    
    bool isOpen() const { return file.is_open(); }
};

// RAII内存管理类
template<typename T>
class DynamicArray {
private:
    std::unique_ptr<T[]> data;
    size_t size;
    
public:
    explicit DynamicArray(size_t n) 
        : data(std::make_unique<T[]>(n)), size(n) {
        std::cout << "Allocated array of " << n << " elements" << std::endl;
    }
    
    ~DynamicArray() {
        std::cout << "Deallocated array" << std::endl;
    }
    
    // 禁止拷贝
    DynamicArray(const DynamicArray&) = delete;
    DynamicArray& operator=(const DynamicArray&) = delete;
    
    // 允许移动
    DynamicArray(DynamicArray&&) = default;
    DynamicArray& operator=(DynamicArray&&) = default;
    
    T& operator[](size_t index) { return data[index]; }
    const T& operator[](size_t index) const { return data[index]; }
    
    size_t getSize() const { return size; }
    
    T* get() { return data.get(); }
};

int main() {
    std::cout << "=== File RAII Demo ===" << std::endl;
    {
        FileWrapper file("test.txt");
        file.write("Hello, RAII!");
        file.write("Automatic cleanup!");
    }  // 文件自动关闭
    
    std::cout << "\\n=== Memory RAII Demo ===" << std::endl;
    {
        DynamicArray<int> arr(5);
        for (size_t i = 0; i < arr.getSize(); ++i) {
            arr[i] = i * 10;
        }
        
        for (size_t i = 0; i < arr.getSize(); ++i) {
            std::cout << arr[i] << " ";
        }
        std::cout << std::endl;
    }  // 内存自动释放
    
    return 0;
}`,
                    description: '展示RAII资源管理的最佳实践。'
                }
            ],
            handsOn: {
                title: '设计学生成绩管理类',
                description: '设计一个Student类，遵循良好的类设计原则。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <algorithm>

class Student {
private:
    std::string id;
    std::string name;
    std::vector<double> scores;
    
    // TODO: 验证ID格式（假设ID必须以"S"开头）
    void validateId(const std::string& studentId) const {
        // 如果ID为空或不以'S'开头，抛出异常
    }
    
public:
    // TODO: 构造函数（使用explicit防止隐式转换）
    explicit Student(const std::string& studentId, const std::string& studentName) {
        // 验证并初始化id和name
    }
    
    // TODO: 添加成绩
    void addScore(double score) {
        // 如果score不在0-100范围，抛出异常
        // 否则添加到scores
    }
    
    // TODO: 计算平均分
    double getAverageScore() const {
        // 如果没有成绩，返回0
        // 否则返回平均分
    }
    
    // TODO: 获取最高分
    double getMaxScore() const {
        // 如果没有成绩，返回0
        // 否则返回最高分
    }
    
    // TODO: 获取最低分
    double getMinScore() const {
        // 如果没有成绩，返回0
        // 否则返回最低分
    }
    
    // 访问器
    std::string getId() const { return id; }
    std::string getName() const { return name; }
    size_t getScoreCount() const { return scores.size(); }
    
    // 输出运算符
    friend std::ostream& operator<<(std::ostream& os, const Student& s) {
        os << "ID: " << s.id << ", Name: " << s.name 
           << ", Average: " << s.getAverageScore()
           << ", Scores: " << s.scores.size();
        return os;
    }
};

int main() {
    try {
        Student s1("S001", "张三");
        s1.addScore(85);
        s1.addScore(92);
        s1.addScore(78);
        
        std::cout << s1 << std::endl;
        std::cout << "平均分: " << s1.getAverageScore() << std::endl;
        std::cout << "最高分: " << s1.getMaxScore() << std::endl;
        std::cout << "最低分: " << s1.getMinScore() << std::endl;
        
        // 测试异常
        // Student s2("001", "李四");  // 应该抛出异常
        // s1.addScore(150);  // 应该抛出异常
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}`,
                expectedOutput: `ID: S001, Name: 张三, Average: 85, Scores: 3
平均分: 85
最高分: 92
最低分: 78`,
                solutionRegex: 'if.*empty|if.*score.*0|throw',
                hint: '使用explicit防止隐式转换，验证输入参数',
                xp: 250
            },
            references: [
                { title: '类设计', book: 'Effective C++', chapter: '条款18-25' },
                { title: 'RAII', book: 'Effective C++', chapter: '条款13-17' },
                { title: '面向对象设计', book: '设计模式', chapter: '第1章' }
            ],
            assistantTips: [
                '遵循单一职责原则，一个类只做一件事',
                '使用RAII管理资源，避免内存泄漏',
                '数据成员应该是私有的',
                '构造函数应该explicit，除非有特殊原因',
                '遵循三/五法则'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '单一职责原则指的是？', 
                    options: [
                        { text: '一个类只能有一个成员' }, 
                        { text: '一个类只有一个变化原因', correct: true }, 
                        { text: '一个类只能有一个构造函数' }, 
                        { text: '一个类只能有一个方法' }
                    ], 
                    explanation: '单一职责原则：一个类应该只有一个引起它变化的原因。' 
                },
                { 
                    type: 'single', 
                    question: 'RAII的含义是？', 
                    options: [
                        { text: '资源分配即初始化' }, 
                        { text: '资源获取即初始化', correct: true }, 
                        { text: '资源访问即初始化' }, 
                        { text: '资源应用即初始化' }
                    ], 
                    explanation: 'RAII（Resource Acquisition Is Initialization）：资源获取即初始化。' 
                },
                { 
                    type: 'single', 
                    question: '什么时候需要virtual析构函数？', 
                    options: [
                        { text: '所有类都需要' }, 
                        { text: '类有动态内存时' }, 
                        { text: '类可能被继承时', correct: true }, 
                        { text: '永远不需要' }
                    ], 
                    explanation: '当类可能被继承，且会通过基类指针删除派生类对象时，需要virtual析构函数。' 
                },
                { 
                    type: 'single', 
                    question: '三法则指的是哪三个函数？', 
                    options: [
                        { text: '构造、析构、拷贝构造' }, 
                        { text: '析构、拷贝构造、拷贝赋值', correct: true }, 
                        { text: '构造、拷贝构造、移动构造' }, 
                        { text: '析构、移动构造、移动赋值' }
                    ], 
                    explanation: '三法则：如果需要析构函数，则也需要拷贝构造和拷贝赋值。' 
                },
                { 
                    type: 'single', 
                    question: '为什么构造函数应该声明为explicit？', 
                    options: [
                        { text: '提高性能' }, 
                        { text: '防止意外的隐式转换', correct: true }, 
                        { text: '语法要求' }, 
                        { text: '减少代码' }
                    ], 
                    explanation: 'explicit防止编译器进行意外的隐式类型转换。' 
                }
            ]
        }
    ]
};

window.Unit8Data = Unit8Data;
