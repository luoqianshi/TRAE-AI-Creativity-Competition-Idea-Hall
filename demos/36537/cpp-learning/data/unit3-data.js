/**
 * 第3章：字符串、向量与数组
 * 完整的学习内容
 */

var Unit3Data = {
    id: 3,
    title: '字符串、向量与数组',
    description: '掌握C++中重要的标准库类型：string、vector和数组',
    lessons: [
        {
            id: '3.1',
            title: 'std::string 基础',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## std::string 基础

### 什么是 std::string？

\`std::string\` 是C++标准库提供的**可变长度字符序列**，比C风格字符串更安全、更方便。

\`\`\`cpp
#include <string>

std::string s1;              // 空字符串
std::string s2 = "Hello";    // 拷贝初始化
std::string s3("World");     // 直接初始化
std::string s4(10, 'a');     // 10个'a'，即"aaaaaaaaaa"
std::string s5 = s2;         // 拷贝构造
std::string s6 = std::move(s5);  // 移动构造（C++11）
\`\`\`

### string 的特点

| 特性 | 说明 |
|------|------|
| 自动管理内存 | 无需手动分配和释放 |
| 可变长度 | 可以动态增长和缩小 |
| 安全 | 边界检查（at函数） |
| 方便的操作 | +、+=、比较运算符 |

### 常用操作

\`\`\`cpp
#include <iostream>
#include <string>

int main() {
    std::string s = "Hello";
    
    // 获取长度
    std::cout << s.size() << std::endl;     // 5
    std::cout << s.length() << std::endl;   // 5
    std::cout << s.empty() << std::endl;    // false
    
    // 访问字符
    std::cout << s[0] << std::endl;         // 'H'
    std::cout << s.at(0) << std::endl;      // 'H'（带边界检查）
    std::cout << s.front() << std::endl;    // 'H'
    std::cout << s.back() << std::endl;     // 'o'
    
    // 修改
    s[0] = 'h';           // "hello"
    s.push_back('!');     // "hello!"
    s.pop_back();         // "hello"
    
    return 0;
}
\`\`\`

### 字符串拼接

\`\`\`cpp
std::string s1 = "Hello";
std::string s2 = "World";

// 使用 +
std::string s3 = s1 + " " + s2;  // "Hello World"

// 使用 +=
s1 += " ";
s1 += s2;  // s1 = "Hello World"

// 使用 append
s1.append("!");
\`\`\`

### 字符串比较

\`\`\`cpp
std::string s1 = "apple";
std::string s2 = "banana";

// 字典序比较
if (s1 < s2) {   // true
    std::cout << "apple < banana" << std::endl;
}

if (s1 == "apple") {  // true
    std::cout << "相等" << std::endl;
}
\`\`\`

### 输入输出

\`\`\`cpp
#include <iostream>
#include <string>

int main() {
    std::string s;
    
    // cin 读取到空白符停止
    std::cin >> s;
    
    // getline 读取整行
    std::getline(std::cin, s);
    
    // 输出
    std::cout << s << std::endl;
    
    return 0;
}
\`\`\`

### C字符串转换

\`\`\`cpp
std::string s = "Hello";
const char* cstr = s.c_str();  // 返回C风格字符串
const char* data = s.data();   // C++17: 同c_str()
\`\`\`

### 最佳实践

1. **优先使用 std::string**
   \`\`\`cpp
   // 推荐
   std::string name = "Hello";
   
   // 避免（除非有特殊需求）
   char name[] = "Hello";
   \`\`\`

2. **使用 at() 进行安全访问**
   \`\`\`cpp
   std::string s = "Hello";
   try {
       char c = s.at(10);  // 抛出异常
   } catch (const std::out_of_range& e) {
       // 处理越界
   }
   \`\`\`

3. **预留空间提高性能**
   \`\`\`cpp
   std::string result;
   result.reserve(1000);  // 预留空间，避免多次重新分配
   for (int i = 0; i < 100; ++i) {
       result += "data";
   }
   \`\`\`

### 常见错误

1. **使用无效的 C 字符串指针**
   \`\`\`cpp
   std::string s = "Hello";
   const char* p = s.c_str();
   s += " World";  // p 可能失效！
   std::cout << p;  // 危险！
   \`\`\`

2. **忽略空字符串检查**
   \`\`\`cpp
   std::string s;
   if (s.empty()) {  // 应该先检查
       // 处理空字符串
   }
   \`\`\`

3. **低效的字符串拼接**
   \`\`\`cpp
   // 低效
   std::string result;
   for (int i = 0; i < 1000; ++i) {
       result = result + std::to_string(i);  // 每次创建临时对象
   }
   
   // 高效
   result += std::to_string(i);  // 直接追加
   \`\`\`

### 深入理解

**string 的内存管理**

std::string 内部使用动态内存：
- 小字符串优化（SSO）：短字符串可能存储在对象内部
- 动态分配：长字符串存储在堆上
- 自动管理：无需手动释放

**string 的容量策略**

\`\`\`cpp
std::string s;
s.reserve(100);  // 预留容量
std::cout << s.capacity();  // >= 100
std::cout << s.size();      // 0

s = "Hello";
s.shrink_to_fit();  // 请求减少容量
\`\`\`

**移动语义**

C++11 引入移动语义后，string 操作更高效：
\`\`\`cpp
std::string createString() {
    return "Hello";  // 返回值优化或移动
}

std::string s = createString();  // 移动构造，无拷贝
\`\`\`

**string_view（C++17）**

用于避免不必要的字符串拷贝：
\`\`\`cpp
#include <string_view>

void process(std::string_view sv) {
    // 不拷贝字符串
}

std::string s = "Hello";
process(s);        // 隐式转换
process("World");  // 也支持
\`\`\``,

            examples: [
                {
                    title: 'string基础操作',
                    code: `#include <iostream>
#include <string>

int main() {
    // 创建字符串
    std::string s1 = "Hello";
    std::string s2 = "World";
    std::string s3(5, '*');  // "*****"
    
    std::cout << "s1: " << s1 << std::endl;
    std::cout << "s2: " << s2 << std::endl;
    std::cout << "s3: " << s3 << std::endl;
    
    // 长度和容量
    std::cout << "\\ns1长度: " << s1.size() << std::endl;
    std::cout << "s1是否为空: " << (s1.empty() ? "是" : "否") << std::endl;
    
    // 字符访问
    std::cout << "\\n第一个字符: " << s1.front() << std::endl;
    std::cout << "最后一个字符: " << s1.back() << std::endl;
    std::cout << "s1[1]: " << s1[1] << std::endl;
    
    // 拼接
    std::string s4 = s1 + " " + s2;
    std::cout << "\\n拼接结果: " << s4 << std::endl;
    
    return 0;
}`,
                    description: '演示std::string的基本操作。'
                },
                {
                    title: '字符串输入',
                    code: `#include <iostream>
#include <string>

int main() {
    std::string name;
    std::string line;
    
    std::cout << "请输入一个单词: ";
    std::cin >> name;
    std::cout << "你输入的是: " << name << std::endl;
    
    // 清除缓冲区
    std::cin.ignore();
    
    std::cout << "请输入一行文字: ";
    std::getline(std::cin, line);
    std::cout << "你输入的是: " << line << std::endl;
    
    return 0;
}`,
                    description: '演示字符串的输入方式。'
                }
            ],
            handsOn: {
                title: 'string练习',
                description: '创建一个字符串，进行各种基本操作。',
                initialCode: `#include <iostream>
#include <string>

int main() {
    // TODO: 创建字符串 "Hello C++"
    // TODO: 输出字符串长度
    // TODO: 在末尾添加 " World"
    // TODO: 输出最终结果
    
    return 0;
}`,
                expectedOutput: '长度: 8\n最终: Hello C++ World',
                solutionRegex: 'std::string|\\.size\\(\\)|\\+=|\\.append',
                hint: '使用size()获取长度，使用+=或append()添加内容',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'std::string 定义在哪个头文件中？', options: [{ text: '<cstring>' }, { text: '<string>', correct: true }, { text: '<string.h>' }, { text: '<str>' }], explanation: 'std::string定义在<string>头文件中。' },
                { type: 'single', question: 's.at(i) 和 s[i] 的区别是什么？', options: [{ text: '没有区别' }, { text: 'at()有边界检查', correct: true }, { text: '[]有边界检查' }, { text: 'at()更快' }], explanation: 'at()函数会进行边界检查，越界时抛出异常；[]不检查，越界行为未定义。' },
                { type: 'single', question: '如何创建包含10个\'a\'的字符串？', options: [{ text: 'std::string s = "aaaaaaaaaa"' }, { text: 'std::string s(10, \'a\')', correct: true }, { text: 'std::string s(10, "a")' }, { text: 'std::string s = 10 * \'a\'' }], explanation: 'string s(n, c)创建包含n个字符c的字符串。' },
                { type: 'single', question: 'getline和cin >> 的区别是什么？', options: [{ text: '没有区别' }, { text: 'getline读取整行，cin >> 读取到空白符', correct: true }, { text: 'cin >> 读取整行' }, { text: 'getline更快' }], explanation: 'cin >> 遇到空白符（空格、制表符、换行）停止；getline读取整行直到换行符。' },
                { type: 'single', question: 's.c_str() 返回什么？', options: [{ text: 'std::string' }, { text: 'const char*', correct: true }, { text: 'char*' }, { text: 'int' }], explanation: 'c_str()返回以null结尾的C风格字符串指针（const char*）。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.2节' }
            ],
            assistantTips: [
                '优先使用std::string而不是C风格字符串',
                '使用at()进行安全的元素访问',
                'getline适合读取包含空格的输入'
            ]
        },
        {
            id: '3.2',
            title: '字符串操作',
            duration: '35分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 400,
            concepts: `## 字符串操作

### 子串操作

\`\`\`cpp
#include <string>

std::string s = "Hello World";

// 获取子串
std::string sub = s.substr(0, 5);  // "Hello"
std::string sub2 = s.substr(6);    // "World"（从位置6到末尾）
\`\`\`

### 插入和删除

\`\`\`cpp
std::string s = "Hello";

// 插入
s.insert(5, " World");   // "Hello World"
s.insert(0, 3, '!');     // "!!!Hello World"

// 删除
s.erase(0, 3);           // "Hello World"
s.erase(5);              // "Hello"（从位置5删除到末尾）
s.pop_back();            // "Hell"
s.clear();               // 清空字符串
\`\`\`

### 替换操作

\`\`\`cpp
std::string s = "Hello World";

// 替换
s.replace(6, 5, "C++");  // "Hello C++"
s.replace(0, 5, "Hi");   // "Hi C++"
\`\`\`

### 查找操作

\`\`\`cpp
std::string s = "Hello World";

// 查找子串
size_t pos = s.find("World");   // 6
size_t pos2 = s.find("xyz");    // std::string::npos（未找到）

// 从后向前查找
size_t pos3 = s.rfind("o");     // 7

// 查找字符
size_t pos4 = s.find_first_of("aeiou");  // 第一个元音字母位置
size_t pos5 = s.find_last_of("aeiou");   // 最后一个元音字母位置
size_t pos6 = s.find_first_not_of(" ");  // 第一个非空格字符
\`\`\`

### 字符串比较

\`\`\`cpp
std::string s1 = "apple";
std::string s2 = "banana";

// compare 返回值
// < 0: s1 < s2
// = 0: s1 == s2
// > 0: s1 > s2
int result = s1.compare(s2);  // < 0

// 比较子串
int result2 = s1.compare(0, 3, "app");  // 比较"app"和"app"
\`\`\`

### 大小写转换

\`\`\`cpp
#include <algorithm>
#include <string>

std::string s = "Hello";

// 转大写
std::transform(s.begin(), s.end(), s.begin(), ::toupper);
// s = "HELLO"

// 转小写
std::transform(s.begin(), s.end(), s.begin(), ::tolower);
// s = "hello"
\`\`\`

### 字符串分割

\`\`\`cpp
#include <sstream>
#include <string>
#include <vector>

std::string s = "Hello World C++";
std::istringstream iss(s);
std::vector<std::string> words;
std::string word;

while (iss >> word) {
    words.push_back(word);
}
// words = {"Hello", "World", "C++"}
\`\`\`

### 最佳实践

1. **使用 find 的返回值检查**
   \`\`\`cpp
   std::string s = "Hello World";
   size_t pos = s.find("xyz");
   if (pos != std::string::npos) {
       // 找到了
   } else {
       // 未找到
   }
   \`\`\`

2. **高效替换所有匹配**
   \`\`\`cpp
   std::string replaceAll(std::string s, const std::string& from, const std::string& to) {
       size_t pos = 0;
       while ((pos = s.find(from, pos)) != std::string::npos) {
           s.replace(pos, from.length(), to);
           pos += to.length();
       }
       return s;
   }
   \`\`\`

3. **使用正则表达式进行复杂操作**
   \`\`\`cpp
   #include <regex>
   
   std::string s = "Hello 123 World 456";
   std::regex r("\\\\d+");
   std::string result = std::regex_replace(s, r, "NUM");
   // result = "Hello NUM World NUM"
   \`\`\`

### 常见错误

1. **忽略 npos 检查**
   \`\`\`cpp
   std::string s = "Hello";
   size_t pos = s.find("xyz");
   s.substr(pos);  // 错误！pos 可能是 npos
   \`\`\`

2. **substr 参数错误**
   \`\`\`cpp
   std::string s = "Hello";
   s.substr(0, 100);  // 安全：自动截断到字符串末尾
   s.substr(10, 5);   // 错误！起始位置越界
   \`\`\`

3. **replace 参数混淆**
   \`\`\`cpp
   std::string s = "Hello World";
   s.replace(6, 5, "C++");  // 从位置6开始，替换5个字符为"C++"
   // s = "Hello C++"
   \`\`\`

### 深入理解

**字符串操作的复杂度**

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| find | O(n) | 线性搜索 |
| substr | O(n) | 创建新字符串 |
| replace | O(n) | 可能需要移动字符 |
| insert | O(n) | 需要移动后续字符 |
| erase | O(n) | 需要移动后续字符 |

**字符串分割的多种方法**

\`\`\`cpp
// 方法1：使用 stringstream
std::stringstream ss("a,b,c");
std::string item;
while (std::getline(ss, item, ',')) {
    // 处理 item
}

// 方法2：使用 find 和 substr
std::string s = "a,b,c";
size_t start = 0, end;
while ((end = s.find(',', start)) != std::string::npos) {
    std::string item = s.substr(start, end - start);
    start = end + 1;
}
\`\`\`

**字符串格式化（C++20）**

\`\`\`cpp
#include <format>

std::string s = std::format("Hello, {}!", "World");
std::string s2 = std::format("Value: {:.2f}", 3.14159);
\`\`\``,

            examples: [
                {
                    title: '字符串查找和替换',
                    code: `#include <iostream>
#include <string>

int main() {
    std::string s = "Hello World, Hello C++";
    
    // 查找
    size_t pos = s.find("Hello");
    std::cout << "第一个Hello位置: " << pos << std::endl;
    
    // 查找所有出现位置
    pos = 0;
    std::cout << "\\n所有Hello位置: ";
    while ((pos = s.find("Hello", pos)) != std::string::npos) {
        std::cout << pos << " ";
        pos++;
    }
    std::cout << std::endl;
    
    // 替换
    std::string s2 = s;
    s2.replace(0, 5, "Hi");  // 替换第一个Hello
    std::cout << "\\n替换后: " << s2 << std::endl;
    
    // 替换所有
    pos = 0;
    while ((pos = s.find("Hello", pos)) != std::string::npos) {
        s.replace(pos, 5, "Hi");
        pos += 2;
    }
    std::cout << "全部替换: " << s << std::endl;
    
    return 0;
}`,
                    description: '演示字符串的查找和替换操作。'
                },
                {
                    title: '字符串分割',
                    code: `#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string text = "apple,banana,orange,grape";
    
    // 使用stringstream分割
    std::stringstream ss(text);
    std::string item;
    std::vector<std::string> fruits;
    
    while (std::getline(ss, item, ',')) {
        fruits.push_back(item);
    }
    
    std::cout << "分割结果:" << std::endl;
    for (const auto& fruit : fruits) {
        std::cout << "  - " << fruit << std::endl;
    }
    
    return 0;
}`,
                    description: '演示如何分割字符串。'
                }
            ],
            handsOn: {
                title: '字符串操作练习',
                description: '实现一个简单的字符串替换函数。',
                initialCode: `#include <iostream>
#include <string>

int main() {
    std::string s = "The quick brown fox jumps over the lazy dog";
    
    // TODO: 将所有 "the" 替换为 "a"（不区分大小写）
    // 提示：先转换为小写处理
    
    std::cout << s << std::endl;
    
    return 0;
}`,
                expectedOutput: 'a quick brown fox jumps over a lazy dog',
                solutionRegex: '\\.find|\\.replace|tolower',
                hint: '使用find查找位置，replace进行替换',
                xp: 150
            },
            quiz: [
                { type: 'single', question: 'substr(6, 3) 表示什么？', options: [{ text: '从位置3开始取6个字符' }, { text: '从位置6开始取3个字符', correct: true }, { text: '取第6到第3个字符' }, { text: '取6个字符，从第3个开始' }], explanation: 'substr(pos, len)从位置pos开始取len个字符。' },
                { type: 'single', question: 'find()找不到时返回什么？', options: [{ text: '0' }, { text: '-1' }, { text: 'std::string::npos', correct: true }, { text: '空字符串' }], explanation: 'find()找不到时返回std::string::npos，这是一个特殊值表示无效位置。' },
                { type: 'single', question: 's.erase(5) 做什么？', options: [{ text: '删除第5个字符' }, { text: '删除前5个字符' }, { text: '从位置5删除到末尾', correct: true }, { text: '删除5个字符' }], explanation: 'erase(pos)从位置pos删除到字符串末尾。' },
                { type: 'single', question: 'rfind() 和 find() 的区别是什么？', options: [{ text: '没有区别' }, { text: 'rfind从后向前查找', correct: true }, { text: 'rfind查找反向字符串' }, { text: 'find更快' }], explanation: 'rfind()从字符串末尾向前查找子串。' },
                { type: 'single', question: '如何将字符串全部转为大写？', options: [{ text: 's.upper()' }, { text: '使用std::transform和toupper', correct: true }, { text: 's.toUpper()' }, { text: 'toupper(s)' }], explanation: 'C++没有string的upper()方法，需要使用std::transform配合toupper。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.2.3节' }
            ],
            assistantTips: [
                'find返回位置或npos，记得检查返回值',
                'replace需要指定位置和长度',
                '使用stringstream可以方便地分割字符串'
            ]
        },
        {
            id: '3.3',
            title: '字符串与数值转换',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 字符串与数值转换

### 字符串转数值（C++11）

\`\`\`cpp
#include <string>

// 字符串转整数
std::string s1 = "12345";
int i = std::stoi(s1);           // 12345
long l = std::stol(s1);          // 12345
long long ll = std::stoll(s1);   // 12345

// 字符串转无符号整数
unsigned long ul = std::stoul(s1);
unsigned long long ull = std::stoull(s1);

// 字符串转浮点数
std::string s2 = "3.14159";
float f = std::stof(s2);         // 3.14159
double d = std::stod(s2);        // 3.14159
long double ld = std::stold(s2); // 3.14159
\`\`\`

### 进制转换

\`\`\`cpp
std::string hex = "ff";
int value = std::stoi(hex, nullptr, 16);  // 255

std::string binary = "1010";
int value2 = std::stoi(binary, nullptr, 2);  // 10
\`\`\`

### 数值转字符串（C++11）

\`\`\`cpp
#include <string>

int i = 42;
std::string s1 = std::to_string(i);    // "42"

double d = 3.14159;
std::string s2 = std::to_string(d);    // "3.141590"

float f = 2.5f;
std::string s3 = std::to_string(f);    // "2.500000"
\`\`\`

### 格式化字符串（C++20）

\`\`\`cpp
#include <format>
#include <string>

std::string s = std::format("Hello, {}!", "World");
// "Hello, World!"

std::string s2 = std::format("Value: {:.2f}", 3.14159);
// "Value: 3.14"

std::string s3 = std::format("{0} + {1} = {2}", 1, 2, 3);
// "1 + 2 = 3"
\`\`\`

### 使用 stringstream

\`\`\`cpp
#include <sstream>
#include <string>

// 数值转字符串
std::ostringstream oss;
oss << 42 << " " << 3.14;
std::string s = oss.str();  // "42 3.14"

// 字符串转数值
std::istringstream iss("42 3.14");
int i;
double d;
iss >> i >> d;  // i = 42, d = 3.14
\`\`\`

### 传统方法（C风格）

\`\`\`cpp
#include <cstdlib>
#include <cstring>

// 字符串转数值
int i = atoi("123");           // 123
double d = atof("3.14");       // 3.14
long l = atol("123456");       // 123456

// 数值转字符串
char buf[100];
sprintf(buf, "%d", 42);        // buf = "42"
sprintf(buf, "%.2f", 3.14);    // buf = "3.14"
\`\`\`

### 错误处理

\`\`\`cpp
#include <string>
#include <stdexcept>

try {
    std::string s = "abc";
    int i = std::stoi(s);  // 抛出 std::invalid_argument
} catch (const std::invalid_argument& e) {
    std::cout << "无效参数: " << e.what() << std::endl;
} catch (const std::out_of_range& e) {
    std::cout << "超出范围: " << e.what() << std::endl;
}
\`\`\`

### 最佳实践

1. **使用 C++11 的转换函数**
   \`\`\`cpp
   // 推荐
   int i = std::stoi("123");
   double d = std::stod("3.14");
   std::string s = std::to_string(42);
   
   // 避免（除非需要兼容旧代码）
   int i = atoi("123");  // 无法检测错误
   \`\`\`

2. **处理转换失败**
   \`\`\`cpp
   try {
       int value = std::stoi(input);
   } catch (const std::invalid_argument&) {
       std::cerr << "无效的数字格式" << std::endl;
   } catch (const std::out_of_range&) {
       std::cerr << "数值超出范围" << std::endl;
   }
   \`\`\`

3. **使用 stoi 的额外参数**
   \`\`\`cpp
   size_t pos;
   int value = std::stoi("123abc", &pos);  // pos = 3
   // 可以检测是否整个字符串都被转换
   \`\`\`

### 常见错误

1. **忽略转换失败**
   \`\`\`cpp
   int x = std::stoi("abc");  // 抛出异常！
   // 应该用 try-catch
   \`\`\`

2. **精度丢失**
   \`\`\`cpp
   std::string s = std::to_string(3.14159265358979);
   // s = "3.141593"（精度有限）
   \`\`\`

3. **进制转换错误**
   \`\`\`cpp
   // 十六进制字符串
   std::string hex = "FF";
   int value = std::stoi(hex, nullptr, 16);  // 255
   // 忘记指定进制会得到 0
   \`\`\`

### 深入理解

**字符串转数值的内部机制**

std::stoi 等函数的工作流程：
1. 跳过前导空白字符
2. 解析可选符号（+/-）
3. 解析数字字符
4. 检测溢出
5. 返回结果或抛出异常

**数值转字符串的格式**

std::to_string 的格式：
- 整数：直接转换
- 浮点数：默认 6 位精度
- 科学计数法：大数自动使用

**stringstream 的高级用法**

\`\`\`cpp
std::ostringstream oss;
oss << std::fixed << std::setprecision(2) << 3.14159;
std::string s = oss.str();  // "3.14"

// 格式化输出
oss << std::hex << 255;  // "ff"
oss << std::setw(5) << std::setfill('0') << 42;  // "00042"
\`\`\``,

            examples: [
                {
                    title: '数值与字符串转换',
                    code: `#include <iostream>
#include <string>
#include <sstream>

int main() {
    // 字符串转数值
    std::string numStr = "12345";
    int num = std::stoi(numStr);
    std::cout << "字符串转整数: " << num << std::endl;
    
    std::string floatStr = "3.14159";
    double pi = std::stod(floatStr);
    std::cout << "字符串转浮点: " << pi << std::endl;
    
    // 数值转字符串
    int value = 42;
    std::string str = std::to_string(value);
    std::cout << "\\n整数转字符串: " << str << std::endl;
    
    // 使用stringstream
    std::ostringstream oss;
    oss << "答案是: " << 42 << ", 精度: " << 3.14;
    std::cout << "\\nstringstream结果: " << oss.str() << std::endl;
    
    return 0;
}`,
                    description: '演示数值与字符串之间的转换。'
                },
                {
                    title: '进制转换',
                    code: `#include <iostream>
#include <string>

int main() {
    // 十六进制字符串转整数
    std::string hexStr = "FF";
    int hexValue = std::stoi(hexStr, nullptr, 16);
    std::cout << "十六进制 FF = " << hexValue << std::endl;
    
    // 二进制字符串转整数
    std::string binStr = "1010";
    int binValue = std::stoi(binStr, nullptr, 2);
    std::cout << "二进制 1010 = " << binValue << std::endl;
    
    // 八进制字符串转整数
    std::string octStr = "77";
    int octValue = std::stoi(octStr, nullptr, 8);
    std::cout << "八进制 77 = " << octValue << std::endl;
    
    // 整数转十六进制字符串
    int value = 255;
    char buf[20];
    sprintf(buf, "%X", value);
    std::cout << "\\n255的十六进制: " << buf << std::endl;
    
    return 0;
}`,
                    description: '演示不同进制的转换。'
                }
            ],
            handsOn: {
                title: '字符串与数值转换',
                description: '实现字符串与数值之间的相互转换。',
                initialCode: `#include <iostream>
#include <string>

int main() {
    // ===== 你的代码 =====
    // TODO: 将字符串 "123" 转换为整数并输出
    
    // TODO: 将整数 456 转换为字符串并输出
    
    // TODO: 将十六进制字符串 "FF" (基数为16) 转换为整数并输出
    
    return 0;
}`,
                expectedOutput: '字符串转整数: 123\\n整数转字符串: 456\\n十六进制转整数: 255',
                solutionRegex: 'std::stoi|std::to_string',
                hint: '使用 std::stoi(str, nullptr, 16) 转换十六进制',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'std::stoi() 定义在哪个头文件？', options: [{ text: '<cstdlib>' }, { text: '<string>', correct: true }, { text: '<sstream>' }, { text: '<iostream>' }], explanation: 'std::stoi等字符串转换函数定义在<string>头文件中。' },
                { type: 'single', question: 'std::to_string(42) 返回什么？', options: [{ text: '42' }, { text: '"42"', correct: true }, { text: '"42.0"' }, { text: '编译错误' }], explanation: 'to_string将数值转换为字符串，返回"42"。' },
                { type: 'single', question: '如何将十六进制字符串"FF"转为整数？', options: [{ text: 'std::stoi("FF")' }, { text: 'std::stoi("FF", nullptr, 16)', correct: true }, { text: 'std::stoul("FF")' }, { text: 'atoi("FF")' }], explanation: 'stoi的第三个参数指定进制，16表示十六进制。' },
                { type: 'single', question: '当stoi无法转换时会发生什么？', options: [{ text: '返回0' }, { text: '返回-1' }, { text: '抛出异常', correct: true }, { text: '返回空字符串' }], explanation: 'stoi在无法转换时抛出std::invalid_argument异常。' },
                { type: 'single', question: 'ostringstream的作用是什么？', options: [{ text: '从字符串读取' }, { text: '将数据写入字符串', correct: true }, { text: '格式化输出到控制台' }, { text: '文件操作' }], explanation: 'ostringstream用于将各种类型的数据写入字符串流。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.2节' }
            ],
            assistantTips: [
                '优先使用C++11的to_string和sto系列函数',
                '注意处理转换失败的情况',
                'stringstream适合复杂的格式化需求'
            ]
        },
        {
            id: '3.4',
            title: 'std::vector 基础',
            duration: '35分钟',
            difficulty: '基础',
            xp: 150,
            estimatedXp: 400,
            concepts: `## std::vector 基础

### 什么是 vector？

\`std::vector\` 是一个**动态数组**，可以自动管理内存，大小可变。

\`\`\`cpp
#include <vector>

std::vector<int> v1;              // 空vector
std::vector<int> v2(10);          // 10个元素，默认值0
std::vector<int> v3(10, 5);       // 10个元素，每个都是5
std::vector<int> v4 = {1, 2, 3};  // 初始化列表
std::vector<int> v5(v4);          // 拷贝构造
std::vector<int> v6 = v4;         // 拷贝构造
\`\`\`

### vector 的特点

| 特性 | 说明 |
|------|------|
| 连续内存 | 元素在内存中连续存储 |
| 动态大小 | 可以动态增长和缩小 |
| 随机访问 | O(1)时间访问任意元素 |
| 尾部操作高效 | push_back/pop_back O(1) |
| 中间插入慢 | 需要移动元素 |

### 常用操作

\`\`\`cpp
#include <vector>
#include <iostream>

int main() {
    std::vector<int> v = {1, 2, 3};
    
    // 容量和大小
    std::cout << v.size() << std::endl;      // 3
    std::cout << v.empty() << std::endl;     // false
    std::cout << v.capacity() << std::endl;  // >= 3
    
    // 访问元素
    std::cout << v[0] << std::endl;          // 1
    std::cout << v.at(0) << std::endl;       // 1（带边界检查）
    std::cout << v.front() << std::endl;     // 1
    std::cout << v.back() << std::endl;      // 3
    
    // 修改元素
    v[0] = 10;
    
    // 添加元素
    v.push_back(4);      // v = {10, 2, 3, 4}
    v.emplace_back(5);   // C++11，更高效
    
    // 删除元素
    v.pop_back();        // 删除最后一个
    v.erase(v.begin());  // 删除第一个
    v.clear();           // 清空
    
    return 0;
}
\`\`\`

### 容量管理

\`\`\`cpp
std::vector<int> v;

// 预分配空间
v.reserve(100);  // 预留至少100个元素的空间

// 调整大小
v.resize(10);     // 大小变为10，新元素默认初始化
v.resize(20, 5);  // 大小变为20，新元素初始化为5
v.resize(5);      // 大小变为5，删除多余元素

// 收缩容量
v.shrink_to_fit();  // 请求减少容量以匹配大小
\`\`\`

### 遍历方式

\`\`\`cpp
std::vector<int> v = {1, 2, 3, 4, 5};

// 下标遍历
for (size_t i = 0; i < v.size(); ++i) {
    std::cout << v[i] << " ";
}

// 迭代器遍历
for (auto it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << " ";
}

// 范围for循环（C++11）
for (int x : v) {
    std::cout << x << " ";
}

// 范围for引用（可修改）
for (int& x : v) {
    x *= 2;
}
\`\`\`

### 二维 vector

\`\`\`cpp
// 3行4列的二维vector
std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));

// 访问元素
matrix[0][0] = 1;

// 使用初始化列表
std::vector<std::vector<int>> mat = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
\`\`\`

### 最佳实践

1. **使用 reserve 预分配空间**
   \`\`\`cpp
   std::vector<int> v;
   v.reserve(1000);  // 预分配，避免多次扩容
   for (int i = 0; i < 1000; ++i) {
       v.push_back(i);
   }
   \`\`\`

2. **优先使用 emplace_back**
   \`\`\`cpp
   std::vector<std::string> v;
   v.push_back("Hello");     // 创建临时对象
   v.emplace_back("World");  // 直接在容器中构造
   \`\`\`

3. **使用范围 for 遍历**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3, 4, 5};
   
   // 只读遍历
   for (int x : v) { }
   
   // 修改遍历
   for (int& x : v) { x *= 2; }
   
   // 常量引用遍历（避免拷贝）
   for (const auto& x : v) { }
   \`\`\`

### 常见错误

1. **迭代器失效**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   auto it = v.begin();
   v.push_back(4);  // 可能导致 it 失效
   *it;  // 危险！
   \`\`\`

2. **越界访问**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   int x = v[10];  // 未定义行为
   int y = v.at(10);  // 抛出异常
   \`\`\`

3. **容量与大小混淆**
   \`\`\`cpp
   std::vector<int> v;
   v.reserve(10);
   std::cout << v.size();     // 0
   std::cout << v.capacity(); // 10
   \`\`\`

### 深入理解

**vector 的内存管理**

vector 的扩容策略：
- 当空间不足时，分配更大的空间（通常是原来的 2 倍）
- 复制或移动元素到新空间
- 释放旧空间

**size vs capacity**

- **size**：实际元素个数
- **capacity**：已分配空间可容纳的元素数
- 使用 shrink_to_fit 可以请求释放多余空间

**vector 的性能特点**

| 操作 | 时间复杂度 |
|------|-----------|
| push_back | O(1) 均摊 |
| pop_back | O(1) |
| insert/erase（中间） | O(n) |
| 随机访问 | O(1) |
| 查找 | O(n) |

**vector<bool> 的特殊性**

\`\`\`cpp
std::vector<bool> v = {true, false, true};
// vector<bool> 是特化版本，每个元素只占 1 位
// 不能取元素地址
// bool* p = &v[0];  // 错误！
\`\`\``,

            examples: [
                {
                    title: 'vector基本操作',
                    code: `#include <iostream>
#include <vector>

int main() {
    // 创建和初始化
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    std::cout << "初始vector: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // 添加元素
    v.push_back(6);
    v.push_back(7);
    std::cout << "添加后: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // 删除元素
    v.pop_back();
    std::cout << "删除最后: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // 大小和容量
    std::cout << "\\n大小: " << v.size() << std::endl;
    std::cout << "容量: " << v.capacity() << std::endl;
    
    return 0;
}`,
                    description: '演示vector的基本操作。'
                },
                {
                    title: '二维vector',
                    code: `#include <iostream>
#include <vector>

int main() {
    // 创建3x4的矩阵
    std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));
    
    // 填充数据
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 4; ++j) {
            matrix[i][j] = i * 4 + j + 1;
        }
    }
    
    // 输出矩阵
    std::cout << "矩阵内容:" << std::endl;
    for (const auto& row : matrix) {
        for (int val : row) {
            std::cout << val << "\\t";
        }
        std::cout << std::endl;
    }
    
    // 使用初始化列表
    std::vector<std::vector<int>> mat = {
        {1, 2, 3},
        {4, 5, 6}
    };
    
    std::cout << "\\n另一个矩阵:" << std::endl;
    for (const auto& row : mat) {
        for (int val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}`,
                    description: '演示二维vector的使用。'
                }
            ],
            handsOn: {
                title: 'vector练习',
                description: '创建一个vector，实现添加、删除和遍历操作。',
                initialCode: `#include <iostream>
#include <vector>

int main() {
    // TODO: 创建一个空vector
    // TODO: 添加数字1到5
    // TODO: 输出所有元素
    // TODO: 删除最后一个元素
    // TODO: 再次输出
    
    return 0;
}`,
                expectedOutput: '初始: 1 2 3 4 5\n删除后: 1 2 3 4',
                solutionRegex: 'push_back|pop_back|for.*:.*v',
                hint: '使用push_back添加，pop_back删除，范围for遍历',
                xp: 150
            },
            quiz: [
                { type: 'single', question: 'vector的元素在内存中如何存储？', options: [{ text: '分散存储' }, { text: '连续存储', correct: true }, { text: '链式存储' }, { text: '随机存储' }], explanation: 'vector的元素在内存中连续存储，支持随机访问。' },
                { type: 'single', question: 'push_back的时间复杂度是多少？', options: [{ text: 'O(n)' }, { text: 'O(1)均摊', correct: true }, { text: 'O(log n)' }, { text: 'O(n²)' }], explanation: 'push_back在大部分情况下是O(1)，扩容时是O(n)，均摊后为O(1)。' },
                { type: 'single', question: 'reserve(100)的作用是什么？', options: [{ text: '创建100个元素' }, { text: '预留至少100个元素的空间', correct: true }, { text: '删除100个元素' }, { text: '调整大小为100' }], explanation: 'reserve预分配空间但不创建元素，避免多次扩容。' },
                { type: 'single', question: 'v.at(i)和v[i]的区别是什么？', options: [{ text: '没有区别' }, { text: 'at()有边界检查', correct: true }, { text: '[]有边界检查' }, { text: 'at()更快' }], explanation: 'at()会检查边界，越界时抛出异常；[]不检查，越界行为未定义。' },
                { type: 'single', question: 'emplace_back比push_back有什么优势？', options: [{ text: '更快' }, { text: '可以原地构造对象', correct: true }, { text: '可以添加多个元素' }, { text: '没有区别' }], explanation: 'emplace_back可以直接在容器中构造对象，避免临时对象的创建和拷贝。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.3节' }
            ],
            assistantTips: [
                '使用reserve预分配空间可以提高性能',
                '优先使用emplace_back而不是push_back',
                '注意区分size()和capacity()'
            ]
        },
        {
            id: '3.5',
            title: 'vector 迭代器',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## vector 迭代器

### 什么是迭代器？

迭代器是访问容器元素的**统一方式**，类似于指针。

\`\`\`cpp
#include <vector>

std::vector<int> v = {1, 2, 3, 4, 5};

// 获取迭代器
std::vector<int>::iterator it = v.begin();  // 指向第一个元素
std::vector<int>::iterator end = v.end();   // 指向最后一个元素之后

// 使用auto简化
auto it2 = v.begin();
\`\`\`

### 迭代器类型

\`\`\`cpp
std::vector<int> v = {1, 2, 3, 4, 5};

// 正向迭代器
std::vector<int>::iterator it = v.begin();

// 常量迭代器（不能修改元素）
std::vector<int>::const_iterator cit = v.cbegin();

// 反向迭代器
std::vector<int>::reverse_iterator rit = v.rbegin();

// 常量反向迭代器
std::vector<int>::const_reverse_iterator crit = v.crbegin();
\`\`\`

### 迭代器操作

\`\`\`cpp
std::vector<int> v = {1, 2, 3, 4, 5};
auto it = v.begin();

// 读取元素
int x = *it;  // 1

// 修改元素
*it = 10;     // v = {10, 2, 3, 4, 5}

// 移动迭代器
++it;         // 指向第二个元素
it++;         // 指向第三个元素
it += 2;      // 向前移动2个位置
it -= 1;      // 向后移动1个位置

// 迭代器算术
auto it2 = v.begin() + 3;  // 指向第4个元素
int diff = it2 - v.begin();  // 3
\`\`\`

### 使用迭代器遍历

\`\`\`cpp
std::vector<int> v = {1, 2, 3, 4, 5};

// 正向遍历
for (auto it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << " ";
}

// 反向遍历
for (auto rit = v.rbegin(); rit != v.rend(); ++rit) {
    std::cout << *rit << " ";
}

// C++11范围for（内部使用迭代器）
for (int x : v) {
    std::cout << x << " ";
}
\`\`\`

### 迭代器失效

某些操作会使迭代器失效：

\`\`\`cpp
std::vector<int> v = {1, 2, 3};
auto it = v.begin();

v.push_back(4);  // 可能导致it失效（如果发生扩容）

// 安全的做法
it = v.begin();  // 重新获取迭代器
\`\`\`

**导致迭代器失效的操作**：
- push_back：如果发生扩容
- insert/erase：被操作位置之后的迭代器失效
- resize/reserve/clear：所有迭代器失效

### 迭代器与算法

\`\`\`cpp
#include <algorithm>
#include <vector>

std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};

// 排序
std::sort(v.begin(), v.end());

// 查找
auto it = std::find(v.begin(), v.end(), 5);

// 计数
int count = std::count(v.begin(), v.end(), 1);

// 遍历
std::for_each(v.begin(), v.end(), [](int x) {
    std::cout << x << " ";
});
\`\`\`

### 最佳实践

1. **优先使用 auto 声明迭代器**
   \`\`\`cpp
   // 推荐
   auto it = v.begin();

   // 不推荐（繁琐）
   std::vector<int>::iterator it = v.begin();
   \`\`\`

2. **使用 cbegin/cend 获取常量迭代器**
   \`\`\`cpp
   void printVector(const std::vector<int>& v) {
       for (auto it = v.cbegin(); it != v.cend(); ++it) {
           std::cout << *it << " ";
       }
   }
   \`\`\`

3. **注意迭代器失效问题**
   \`\`\`cpp
   // 错误：在循环中push_back可能导致迭代器失效
   for (auto it = v.begin(); it != v.end(); ++it) {
       v.push_back(*it);  // 危险！
   }

   // 正确：先保存大小或使用索引
   size_t oldSize = v.size();
   for (size_t i = 0; i < oldSize; ++i) {
       v.push_back(v[i]);
   }
   \`\`\`

4. **优先使用范围 for 循环**
   \`\`\`cpp
   // 简洁
   for (int x : v) {
       std::cout << x << " ";
   }

   // 需要修改元素时使用引用
   for (int& x : v) {
       x *= 2;
   }
   \`\`\`

### 常见错误

1. **解引用 end() 迭代器**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   auto it = v.end();
   std::cout << *it;  // 错误！end()不指向有效元素
   \`\`\`

2. **使用失效的迭代器**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   auto it = v.begin();
   v.push_back(4);  // 可能导致it失效
   *it = 10;        // 危险！可能崩溃
   \`\`\`

3. **混淆正向和反向迭代器**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   auto it = v.begin();
   auto rit = v.rbegin();
   // it 和 rit 类型不同，不能直接比较或赋值
   \`\`\`

4. **忽略迭代器范围的有效性**
   \`\`\`cpp
   std::vector<int> v = {1, 2, 3};
   auto first = v.begin() + 10;  // 超出范围
   // 使用 first 是未定义行为
   \`\`\`

### 深入理解

**迭代器的本质**

迭代器是一种抽象，提供统一的元素访问方式：
- 类似指针的行为（解引用、递增）
- 隐藏容器的内部实现
- 使算法与容器解耦

**迭代器分类**

C++ 标准库定义了五类迭代器：
1. **输入迭代器**：只读，单遍扫描
2. **输出迭代器**：只写，单遍扫描
3. **前向迭代器**：可读写，多遍扫描
4. **双向迭代器**：可前后移动
5. **随机访问迭代器**：支持算术运算

vector 的迭代器是随机访问迭代器，功能最强大。

**迭代器失效的内部原因**

vector 使用连续内存存储元素：
- 扩容时需要分配新内存并移动元素
- 插入/删除可能导致元素移动
- 迭代器存储的是元素地址，元素移动后地址变化

**迭代器与指针的关系**

\`\`\`cpp
std::vector<int> v = {1, 2, 3};
int* ptr = &v[0];  // 指向第一个元素
auto it = v.begin();  // 迭代器

// 对于vector，迭代器内部可能就是指针
// 但不应该依赖这个实现细节
\`\`\``,
            examples: [
                {
                    title: '迭代器基本用法',
                    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    // 正向遍历
    std::cout << "正向遍历: ";
    for (auto it = v.begin(); it != v.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    
    // 反向遍历
    std::cout << "反向遍历: ";
    for (auto rit = v.rbegin(); rit != v.rend(); ++rit) {
        std::cout << *rit << " ";
    }
    std::cout << std::endl;
    
    // 修改元素
    for (auto it = v.begin(); it != v.end(); ++it) {
        *it *= 2;  // 每个元素乘以2
    }
    
    std::cout << "修改后: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '演示迭代器的基本用法。'
                },
                {
                    title: '迭代器与算法',
                    code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // 排序
    std::sort(v.begin(), v.end());
    std::cout << "排序后: ";
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // 查找
    auto it = std::find(v.begin(), v.end(), 5);
    if (it != v.end()) {
        std::cout << "找到5，位置: " << (it - v.begin()) << std::endl;
    }
    
    // 计数
    int count = std::count(v.begin(), v.end(), 1);
    std::cout << "1出现的次数: " << count << std::endl;
    
    // 最小最大值
    auto minIt = std::min_element(v.begin(), v.end());
    auto maxIt = std::max_element(v.begin(), v.end());
    std::cout << "最小值: " << *minIt << ", 最大值: " << *maxIt << std::endl;
    
    return 0;
}`,
                    description: '演示迭代器与标准算法的配合使用。'
                }
            ],
            handsOn: {
                title: '迭代器练习',
                description: '使用迭代器实现vector的反转。',
                initialCode: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};
    
    // TODO: 使用迭代器和std::reverse反转vector
    // 提示: std::reverse(begin, end)
    
    // 输出结果
    for (int x : v) {
        std::cout << x << " ";
    }
    
    return 0;
}`,
                expectedOutput: '5 4 3 2 1',
                solutionRegex: 'std::reverse|v\\.begin|v\\.end',
                hint: '使用std::reverse(v.begin(), v.end())',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'v.begin()指向什么？', options: [{ text: '第一个元素之前' }, { text: '第一个元素', correct: true }, { text: '最后一个元素' }, { text: '最后一个元素之后' }], explanation: 'begin()返回指向第一个元素的迭代器。' },
                { type: 'single', question: 'v.end()指向什么？', options: [{ text: '最后一个元素' }, { text: '最后一个元素之后', correct: true }, { text: '第一个元素' }, { text: '空' }], explanation: 'end()返回指向最后一个元素之后的迭代器，是一个"尾后迭代器"。' },
                { type: 'single', question: 'rbegin()是什么迭代器？', options: [{ text: '正向迭代器' }, { text: '反向迭代器', correct: true }, { text: '常量迭代器' }, { text: '随机迭代器' }], explanation: 'rbegin()返回反向迭代器，指向最后一个元素。' },
                { type: 'single', question: '哪个操作可能导致迭代器失效？', options: [{ text: '读取元素' }, { text: 'push_back（如果扩容）', correct: true }, { text: '获取大小' }, { text: '比较迭代器' }], explanation: 'push_back可能导致vector扩容，使所有迭代器失效。' },
                { type: 'single', question: '*it 表示什么？', options: [{ text: '迭代器本身' }, { text: '迭代器指向的元素', correct: true }, { text: '迭代器的地址' }, { text: '迭代器的类型' }], explanation: '*是解引用运算符，*it获取迭代器指向的元素。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.4节' }
            ],
            assistantTips: [
                '使用auto简化迭代器声明',
                '注意迭代器失效问题',
                '优先使用范围for循环'
            ]
        },
        {
            id: '3.6',
            title: '数组基础',
            duration: '30分钟',
            difficulty: '基础',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 数组基础

### 什么是数组？

数组是**固定大小**的连续内存空间，存储相同类型的元素。

### 数组定义

\`\`\`cpp
// 传统数组（C风格）
int arr1[5];                // 5个int，未初始化
int arr2[5] = {1, 2, 3, 4, 5};  // 初始化
int arr3[5] = {1, 2};       // {1, 2, 0, 0, 0}
int arr4[] = {1, 2, 3};     // 大小自动推断为3
int arr5[5] = {};           // 全部初始化为0

// C++11 数组
#include <array>
std::array<int, 5> arr6 = {1, 2, 3, 4, 5};
\`\`\`

### 数组访问

\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};

// 下标访问
int x = arr[0];    // 10
arr[0] = 100;      // 修改

// 越界访问（危险！）
int y = arr[10];   // 未定义行为
\`\`\`

### 数组与指针

数组名在很多情况下会退化为指针：

\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};

int* p = arr;      // arr退化为指针
int x = *p;        // 1
int y = *(p + 1);  // 2
int z = p[2];      // 3（指针也可以用下标）
\`\`\`

### 数组遍历

\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};

// 下标遍历
for (int i = 0; i < 5; ++i) {
    std::cout << arr[i] << " ";
}

// 指针遍历
for (int* p = arr; p != arr + 5; ++p) {
    std::cout << *p << " ";
}

// 范围for（C++11）
for (int x : arr) {
    std::cout << x << " ";
}
\`\`\`

### std::array（C++11）

\`\`\`cpp
#include <array>

std::array<int, 5> arr = {1, 2, 3, 4, 5};

// 获取大小
arr.size();      // 5
arr.empty();     // false

// 访问元素
arr[0];          // 不检查边界
arr.at(0);       // 检查边界
arr.front();     // 第一个元素
arr.back();      // 最后一个元素

// 数据访问
int* p = arr.data();  // 返回底层数组指针

// 填充
arr.fill(0);     // 所有元素设为0
\`\`\`

### 数组 vs vector vs std::array

| 特性 | 数组 | std::array | vector |
|------|------|-----------|--------|
| 大小 | 固定 | 固定 | 动态 |
| 内存 | 栈 | 栈 | 堆 |
| 安全性 | 低 | 中 | 高 |
| 功能 | 基础 | 中等 | 丰富 |

### 数组作为函数参数

\`\`\`cpp
// 数组退化为指针
void func(int arr[]);        // 等价于 void func(int* arr)
void func(int arr[10]);      // 大小被忽略

// 使用引用保留数组大小
void func(int (&arr)[10]);   // 必须传入大小为10的数组

// 使用std::array
void func(std::array<int, 10>& arr);

// 使用模板
template<size_t N>
void func(int (&arr)[N]);
\`\`\`

### 最佳实践

1. **优先使用 std::array 而非 C 风格数组**
   \`\`\`cpp
   // 推荐
   std::array<int, 5> arr = {1, 2, 3, 4, 5};

   // 不推荐
   int arr[5] = {1, 2, 3, 4, 5};
   \`\`\`

2. **使用 at() 进行边界检查**
   \`\`\`cpp
   std::array<int, 5> arr = {1, 2, 3, 4, 5};
   try {
       int x = arr.at(10);  // 抛出异常
   } catch (std::out_of_range& e) {
       std::cerr << e.what() << std::endl;
   }
   \`\`\`

3. **使用范围 for 循环遍历**
   \`\`\`cpp
   int arr[5] = {1, 2, 3, 4, 5};
   for (int x : arr) {
       std::cout << x << " ";
   }
   \`\`\`

4. **始终初始化数组**
   \`\`\`cpp
   int arr[5] = {};  // 全部初始化为0
   std::array<int, 5> arr = {};  // 全部初始化为0
   \`\`\`

### 常见错误

1. **数组越界访问**
   \`\`\`cpp
   int arr[5] = {1, 2, 3, 4, 5};
   int x = arr[5];   // 错误！索引范围是0-4
   int y = arr[-1];  // 错误！负数索引
   \`\`\`

2. **未初始化数组**
   \`\`\`cpp
   int arr[5];  // 未初始化，内容不确定
   for (int i = 0; i < 5; ++i) {
       std::cout << arr[i];  // 可能输出任意值
   }
   \`\`\`

3. **数组大小必须是编译时常量**
   \`\`\`cpp
   int n = 5;
   int arr[n];  // 错误！n不是编译时常量

   // 正确做法
   const int N = 5;
   int arr[N];  // 正确

   // 或使用 vector
   std::vector<int> v(n);  // 正确
   \`\`\`

4. **返回局部数组的指针**
   \`\`\`cpp
   int* func() {
       int arr[5] = {1, 2, 3, 4, 5};
       return arr;  // 错误！返回局部数组的地址
   }
   \`\`\`

### 深入理解

**数组的内存布局**

数组在内存中是连续存储的：
\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};
// 内存布局：
// 地址:   &arr[0]  &arr[1]  &arr[2]  &arr[3]  &arr[4]
// 值:        1        2        3        4        5
// 偏移:      0       4        8       12       16 (字节)
\`\`\`

**数组名与指针的区别**

虽然数组名常退化为指针，但它们有本质区别：
\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};
int* p = arr;

sizeof(arr);  // 20 (整个数组的大小)
sizeof(p);    // 4 或 8 (指针的大小)

// arr 是常量，不能修改
arr = p;  // 错误！
p = arr;  // 正确
\`\`\`

**std::array 的优势**

- 知道自己的大小（size() 方法）
- 支持迭代器
- 支持 at() 边界检查
- 支持复制和赋值
- 与 STL 算法兼容

**多维数组**

\`\`\`cpp
int matrix[3][4];  // 3行4列
int cube[2][3][4]; // 三维数组

// 初始化
int matrix2[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
\`\`\``,
            examples: [
                {
                    title: '数组基本操作',
                    code: `#include <iostream>
#include <array>

int main() {
    // 传统数组
    int arr1[5] = {1, 2, 3, 4, 5};
    
    std::cout << "传统数组: ";
    for (int i = 0; i < 5; ++i) {
        std::cout << arr1[i] << " ";
    }
    std::cout << std::endl;
    
    // std::array
    std::array<int, 5> arr2 = {10, 20, 30, 40, 50};
    
    std::cout << "std::array: ";
    for (int x : arr2) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    // std::array 特有功能
    std::cout << "大小: " << arr2.size() << std::endl;
    std::cout << "第一个: " << arr2.front() << std::endl;
    std::cout << "最后一个: " << arr2.back() << std::endl;
    
    // 填充
    arr2.fill(0);
    std::cout << "填充后: ";
    for (int x : arr2) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '演示传统数组和std::array的基本操作。'
                },
                {
                    title: '数组与指针',
                    code: `#include <iostream>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    
    // 数组名退化为指针
    int* p = arr;
    
    std::cout << "通过指针访问:" << std::endl;
    for (int i = 0; i < 5; ++i) {
        std::cout << "*(p + " << i << ") = " << *(p + i) << std::endl;
    }
    
    // 指针算术
    std::cout << "\\n指针算术:" << std::endl;
    int* start = arr;
    int* end = arr + 5;
    
    for (int* ptr = start; ptr != end; ++ptr) {
        std::cout << *ptr << " ";
    }
    std::cout << std::endl;
    
    // 指针下标
    std::cout << "\\n指针下标: p[2] = " << p[2] << std::endl;
    
    return 0;
}`,
                    description: '演示数组与指针的关系。'
                }
            ],
            handsOn: {
                title: '数组练习',
                description: '使用std::array存储并计算数组元素的和。',
                initialCode: `#include <iostream>
#include <array>

int main() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};
    
    // TODO: 计算数组元素的和
    int sum = 0;
    
    std::cout << "数组元素的和: " << sum << std::endl;
    
    return 0;
}`,
                expectedOutput: '数组元素的和: 15',
                solutionRegex: 'for.*arr|sum.*\\+=',
                hint: '使用范围for循环遍历数组',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'int arr[5] = {1, 2}; 后arr[2]的值是？', options: [{ text: '未定义' }, { text: '0', correct: true }, { text: '1' }, { text: '2' }], explanation: '部分初始化时，未指定的元素会被初始化为0。' },
                { type: 'single', question: 'std::array相比传统数组的优势是什么？', options: [{ text: '大小可变' }, { text: '提供size()等成员函数', correct: true }, { text: '存储在堆上' }, { text: '没有区别' }], explanation: 'std::array提供size()、at()、front()、back()等成员函数，更安全方便。' },
                { type: 'single', question: '数组名arr在表达式中通常表示什么？', options: [{ text: '整个数组' }, { text: '指向第一个元素的指针', correct: true }, { text: '数组大小' }, { text: '最后一个元素' }], explanation: '在大多数表达式中，数组名会退化为指向第一个元素的指针。' },
                { type: 'single', question: 'arr.at(0) 和 arr[0] 的区别？', options: [{ text: '没有区别' }, { text: 'at()有边界检查', correct: true }, { text: '[]有边界检查' }, { text: 'at()更快' }], explanation: 'at()会进行边界检查，越界时抛出异常。' },
                { type: 'single', question: 'std::array存储在什么内存区域？', options: [{ text: '堆' }, { text: '栈', correct: true }, { text: '静态存储区' }, { text: '取决于大小' }], explanation: 'std::array和传统数组一样存储在栈上。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.5节' }
            ],
            assistantTips: [
                '优先使用std::array而不是传统数组',
                '注意数组越界问题',
                '理解数组与指针的关系'
            ]
        },
        {
            id: '3.7',
            title: '多维数组',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## 多维数组

### 二维数组定义

\`\`\`cpp
// 传统二维数组
int matrix[3][4];  // 3行4列

// 初始化
int arr[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};

// 部分初始化
int arr2[2][3] = {{1}, {4}};  // {{1, 0, 0}, {4, 0, 0}}

// 自动推断行数
int arr3[][3] = {{1, 2, 3}, {4, 5, 6}};  // 2行3列
\`\`\`

### 二维数组访问

\`\`\`cpp
int matrix[3][4] = {
    {1, 2, 3, 4},
    {5, 6, 7, 8},
    {9, 10, 11, 12}
};

// 访问元素
int x = matrix[0][0];  // 1
matrix[1][2] = 100;    // 修改

// 遍历
for (int i = 0; i < 3; ++i) {
    for (int j = 0; j < 4; ++j) {
        std::cout << matrix[i][j] << " ";
    }
    std::cout << std::endl;
}
\`\`\`

### 二维数组的内存布局

二维数组在内存中是**行优先**存储的：

\`\`\`
matrix[0][0] matrix[0][1] matrix[0][2] matrix[0][3]
matrix[1][0] matrix[1][1] matrix[1][2] matrix[1][3]
matrix[2][0] matrix[2][1] matrix[2][2] matrix[2][3]
\`\`\`

### 使用vector实现二维数组

\`\`\`cpp
#include <vector>

// 3行4列，初始值为0
std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));

// 访问
matrix[0][0] = 1;

// 动态调整大小
matrix.resize(5);  // 5行
matrix[0].resize(6);  // 第一行6列
\`\`\`

### 三维数组

\`\`\`cpp
// 2层3行4列
int cube[2][3][4];

// 初始化
int cube2[2][2][2] = {
    {{1, 2}, {3, 4}},
    {{5, 6}, {7, 8}}
};

// 访问
int x = cube2[0][1][0];  // 3
\`\`\`

### 多维数组作为函数参数

\`\`\`cpp
// 必须指定除第一维外的所有维度
void print(int arr[][4], int rows) {
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < 4; ++j) {
            std::cout << arr[i][j] << " ";
        }
        std::cout << std::endl;
    }
}

// 使用模板
template<size_t Rows, size_t Cols>
void print(int (&arr)[Rows][Cols]) {
    for (int i = 0; i < Rows; ++i) {
        for (int j = 0; j < Cols; ++j) {
            std::cout << arr[i][j] << " ";
        }
        std::cout << std::endl;
    }
}
\`\`\`

### 最佳实践

1. **优先使用 vector<vector> 而非 C 风格多维数组**
   \`\`\`cpp
   // 推荐：灵活、安全
   std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));

   // 不推荐：固定大小、不安全
   int matrix[3][4];
   \`\`\`

2. **使用 constexpr 定义维度常量**
   \`\`\`cpp
   constexpr int ROWS = 3;
   constexpr int COLS = 4;
   int matrix[ROWS][COLS];
   \`\`\`

3. **封装多维数组为类**
   \`\`\`cpp
   class Matrix {
   private:
       std::vector<std::vector<int>> data;
   public:
       Matrix(int rows, int cols) : data(rows, std::vector<int>(cols)) {}
       int& at(int r, int c) { return data[r][c]; }
       int rows() const { return data.size(); }
       int cols() const { return data[0].size(); }
   };
   \`\`\`

4. **使用一维数组模拟多维数组**
   \`\`\`cpp
   // 对于性能敏感场景，一维数组更高效
   std::vector<int> matrix(rows * cols);
   int& at(int r, int c) { return matrix[r * cols + c]; }
   \`\`\`

### 常见错误

1. **维度顺序混淆**
   \`\`\`cpp
   int matrix[3][4];  // 3行4列
   int x = matrix[4][3];  // 错误！越界
   // 正确：matrix[行][列]，行范围0-2，列范围0-3
   \`\`\`

2. **函数参数维度缺失**
   \`\`\`cpp
   void func(int arr[][]);  // 错误！必须指定列数
   void func(int arr[][4]);  // 正确
   \`\`\`

3. **初始化列表格式错误**
   \`\`\`cpp
   int arr[2][3] = {1, 2, 3, 4, 5, 6};  // 可以但不易读
   int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};  // 推荐
   \`\`\`

4. **vector<vector> 的每行大小不一致**
   \`\`\`cpp
   std::vector<std::vector<int>> matrix;
   matrix.resize(3);
   matrix[0].resize(4);
   matrix[1].resize(5);  // 每行大小不同！
   // 这可能是预期行为，但需要特别注意
   \`\`\`

### 深入理解

**行优先存储的意义**

C/C++ 采用行优先存储，这意味着：
- 同一行的元素在内存中连续
- 按行遍历比按列遍历更高效（缓存友好）
- 对于大型矩阵，遍历顺序影响性能

\`\`\`cpp
int matrix[1000][1000];

// 高效：按行遍历
for (int i = 0; i < 1000; ++i)
    for (int j = 0; j < 1000; ++j)
        matrix[i][j] = 0;

// 低效：按列遍历
for (int j = 0; j < 1000; ++j)
    for (int i = 0; i < 1000; ++i)
        matrix[i][j] = 0;
\`\`\`

**多维数组的退化**

\`\`\`cpp
int matrix[3][4];
// matrix 退化为 int (*)[4]（指向4个int数组的指针）
// matrix[0] 退化为 int*（指向第一个元素的指针）
\`\`\`

**动态二维数组的实现方式**

1. **vector<vector>**：最灵活，但内存不连续
2. **一维数组模拟**：内存连续，性能好
3. **指针数组**：C风格，需要手动管理内存

\`\`\`cpp
// 指针数组方式
int** matrix = new int*[rows];
for (int i = 0; i < rows; ++i) {
    matrix[i] = new int[cols];
}
// 使用后需要逐行释放
\`\`\``,
            examples: [
                {
                    title: '二维数组操作',
                    code: `#include <iostream>

int main() {
    // 定义并初始化
    int matrix[3][4] = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    
    // 输出矩阵
    std::cout << "矩阵内容:" << std::endl;
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 4; ++j) {
            std::cout << matrix[i][j] << "\\t";
        }
        std::cout << std::endl;
    }
    
    // 计算行和
    std::cout << "\\n每行和:" << std::endl;
    for (int i = 0; i < 3; ++i) {
        int sum = 0;
        for (int j = 0; j < 4; ++j) {
            sum += matrix[i][j];
        }
        std::cout << "第" << i << "行和: " << sum << std::endl;
    }
    
    return 0;
}`,
                    description: '演示二维数组的基本操作。'
                },
                {
                    title: 'vector实现二维数组',
                    code: `#include <iostream>
#include <vector>

int main() {
    // 创建3x4的矩阵
    std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));
    
    // 填充数据
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 4; ++j) {
            matrix[i][j] = i * 4 + j + 1;
        }
    }
    
    // 输出
    std::cout << "矩阵:" << std::endl;
    for (const auto& row : matrix) {
        for (int val : row) {
            std::cout << val << "\\t";
        }
        std::cout << std::endl;
    }
    
    // 动态调整
    matrix.push_back({13, 14, 15, 16});  // 添加一行
    std::cout << "\n添加一行后:" << std::endl;
    std::cout << "行数: " << matrix.size() << std::endl;
    std::cout << "列数: " << matrix[0].size() << std::endl;
    
    return 0;
}`,
                    description: '演示使用vector实现动态二维数组。'
                }
            ],
            handsOn: {
                title: '二维数组操作',
                description: '创建一个3x3的二维数组，计算并输出矩阵的主对角线元素之和。',
                initialCode: `#include <iostream>

int main() {
    // ===== 你的代码 =====
    // 定义一个3x3的二维数组
    int matrix[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    
    // TODO: 计算主对角线元素之和 (matrix[0][0] + matrix[1][1] + matrix[2][2])
    // 并输出结果
    
    return 0;
}`,
                expectedOutput: '主对角线之和: 15',
                solutionRegex: 'matrix\\[0\\]\\[0\\]|matrix\\[1\\]\\[1\\]|对角线',
                hint: '主对角线是行列索引相同的元素: [0][0], [1][1], [2][2]',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'int arr[3][4] 有多少个元素？', options: [{ text: '3' }, { text: '4' }, { text: '12', correct: true }, { text: '7' }], explanation: '3行4列，共3×4=12个元素。' },
                { type: 'single', question: '二维数组在内存中如何存储？', options: [{ text: '列优先' }, { text: '行优先', correct: true }, { text: '随机顺序' }, { text: '取决于类型' }], explanation: 'C++中二维数组按行优先顺序存储。' },
                { type: 'single', question: 'int arr[][3] = {{1,2,3},{4,5,6}}; 有几行？', options: [{ text: '1' }, { text: '2', correct: true }, { text: '3' }, { text: '编译错误' }], explanation: '根据初始化列表自动推断为2行。' },
                { type: 'single', question: 'vector<vector<int>>相比传统二维数组的优势？', options: [{ text: '访问更快' }, { text: '大小可动态调整', correct: true }, { text: '占用更少内存' }, { text: '没有优势' }], explanation: 'vector可以动态调整大小，更灵活。' },
                { type: 'single', question: '二维数组作为函数参数时，必须指定什么？', options: [{ text: '行数' }, { text: '列数', correct: true }, { text: '都不需要' }, { text: '都需要' }], explanation: '二维数组作为参数时，必须指定列数（除第一维外的所有维度）。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.6节' }
            ],
            assistantTips: [
                '理解二维数组的行优先存储',
                '优先使用vector<vector<T>>实现动态二维数组',
                '注意多维数组作为参数时的维度指定'
            ]
        },
        {
            id: '3.8',
            title: 'C风格字符串',
            duration: '25分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## C风格字符串

### 什么是C风格字符串？

C风格字符串是以**空字符（'\\0'）结尾**的字符数组。

\`\`\`cpp
char str1[] = "Hello";     // 自动添加'\\0'，大小为6
char str2[6] = "Hello";    // 正确
char str3[5] = "Hello";    // 错误！没有空间放'\\0'
char str4[] = {'H', 'i', '\\0'};  // 手动添加'\\0'
\`\`\`

### C字符串函数

需要 \`#include <cstring>\`

\`\`\`cpp
#include <cstring>

char s1[20] = "Hello";
char s2[20] = "World";

// 长度（不包括'\\0'）
size_t len = strlen(s1);  // 5

// 复制
strcpy(s1, s2);           // s1 = "World"
strncpy(s1, s2, 3);       // 复制最多3个字符

// 连接
strcat(s1, s2);           // s1 = "WorldWorld"
strncat(s1, s2, 3);       // 连接最多3个字符

// 比较
int result = strcmp(s1, s2);  // < 0: s1 < s2, = 0: 相等, > 0: s1 > s2
strncmp(s1, s2, 3);       // 比较前3个字符

// 查找
char* p = strchr(s1, 'o');    // 查找字符
char* p2 = strstr(s1, "or");  // 查找子串
\`\`\`

### C字符串 vs C++ string

| 特性 | C字符串 | std::string |
|------|---------|-------------|
| 内存管理 | 手动 | 自动 |
| 安全性 | 低 | 高 |
| 操作 | 函数 | 成员函数/运算符 |
| 大小 | 固定 | 动态 |
| 拼接 | strcat | +, += |

### 常见错误

\`\`\`cpp
// 错误1：数组越界
char s[5] = "Hello";  // 错误！需要6个字符

// 错误2：未初始化
char s[10];
strcat(s, "Hello");   // 危险！s未初始化

// 错误3：指针指向字符串字面量
char* p = "Hello";    // 危险！不能修改
const char* p2 = "Hello";  // 正确

// 错误4：忘记'\\0'
char s[5] = {'H', 'e', 'l', 'l', 'o'};  // 不是有效的C字符串！
\`\`\`

### 安全的C字符串函数

\`\`\`cpp
// 使用strncpy、strncat等带长度限制的函数
char dest[10];
strncpy(dest, source, sizeof(dest) - 1);
dest[sizeof(dest) - 1] = '\\0';  // 确保以'\\0'结尾

// 或使用安全版本（如果可用）
strcpy_s(dest, sizeof(dest), source);
\`\`\`

### 转换

\`\`\`cpp
// C++ string -> C字符串
std::string cppStr = "Hello";
const char* cStr = cppStr.c_str();

// C字符串 -> C++ string
const char* cStr = "Hello";
std::string cppStr = cStr;
std::string cppStr2(cStr);
\`\`\`

### 字符处理函数

需要 \`#include <cctype>\`

\`\`\`cpp
#include <cctype>

isalpha('A');   // 是否为字母
isdigit('5');   // 是否为数字
isalnum('a');   // 是否为字母或数字
isspace(' ');   // 是否为空白字符
isupper('A');   // 是否为大写
islower('a');   // 是否为小写
toupper('a');   // 转大写
tolower('A');   // 转小写
\`\`\`

### 最佳实践

1. **优先使用 std::string 而非 C 风格字符串**
   \`\`\`cpp
   // 推荐
   std::string s = "Hello";

   // 不推荐
   char s[] = "Hello";
   \`\`\`

2. **使用 const char* 指向字符串字面量**
   \`\`\`cpp
   const char* p = "Hello";  // 正确：明确表示不可修改
   char* p = "Hello";        // 错误：C++11后不推荐
   \`\`\`

3. **使用安全版本的字符串函数**
   \`\`\`cpp
   // 使用带长度限制的版本
   char dest[10];
   strncpy(dest, src, sizeof(dest) - 1);
   dest[sizeof(dest) - 1] = '\\0';  // 确保终止

   // 或使用 C11 的安全版本（如果支持）
   strcpy_s(dest, sizeof(dest), src);
   \`\`\`

4. **检查字符串函数的返回值**
   \`\`\`cpp
   char* result = strchr(str, 'x');
   if (result != nullptr) {
       // 找到了
   }
   \`\`\`

5. **使用 c_str() 与 C API 交互**
   \`\`\`cpp
   std::string filename = "data.txt";
   // C API 需要 const char*
   FILE* f = fopen(filename.c_str(), "r");
   \`\`\`

### 深入理解

**空字符的重要性**

C 风格字符串的核心特征是以 '\\0' 结尾：
- 字符串函数依赖 '\\0' 确定字符串结束
- 没有 '\\0' 会导致函数越界访问
- strlen 返回的长度不包括 '\\0'

**字符串字面量的存储**

\`\`\`cpp
const char* s1 = "Hello";  // 存储在只读数据段
const char* s2 = "Hello";  // 可能与 s1 指向同一地址（编译器优化）

char s3[] = "Hello";  // 存储在栈上，可以修改
s3[0] = 'h';  // 正确
// s1[0] = 'h';  // 错误！运行时崩溃
\`\`\`

**字符处理函数的返回值**

\`\`\`cpp
// 这些函数返回 int 而非 bool，因为可以用于任何字符值
int result = isalpha('A');  // 非零表示真
int upper = toupper('a');   // 返回转换后的字符
\`\`\`

**C 字符串与 C++ string 的性能差异**

- **C 字符串**：操作需要遍历整个字符串（如 strlen），但内存占用小
- **std::string**：存储长度信息，操作更快，但有额外开销

\`\`\`cpp
char cStr[] = "Hello";
std::string cppStr = "Hello";

// C字符串：O(n) 操作
strlen(cStr);  // 需要遍历到 '\\0'

// C++ string：O(1) 操作
cppStr.size();  // 直接返回存储的长度
\`\`\``,
            examples: [
                {
                    title: 'C字符串函数',
                    code: `#include <iostream>
#include <cstring>

int main() {
    char s1[20] = "Hello";
    char s2[20] = "World";
    
    // 长度
    std::cout << "s1长度: " << strlen(s1) << std::endl;
    
    // 复制
    char s3[20];
    strcpy(s3, s1);
    std::cout << "复制后s3: " << s3 << std::endl;
    
    // 连接
    char s4[20] = "Hello ";
    strcat(s4, s2);
    std::cout << "连接后: " << s4 << std::endl;
    
    // 比较
    int cmp = strcmp(s1, s2);
    std::cout << "比较结果: " << cmp << std::endl;
    if (cmp < 0) {
        std::cout << "s1 < s2" << std::endl;
    }
    
    // 查找
    char* p = strchr(s1, 'l');
    if (p) {
        std::cout << "找到'l'在位置: " << (p - s1) << std::endl;
    }
    
    return 0;
}`,
                    description: '演示C字符串函数的使用。'
                },
                {
                    title: 'C字符串与string转换',
                    code: `#include <iostream>
#include <string>
#include <cstring>

int main() {
    // C++ string -> C字符串
    std::string cppStr = "Hello C++";
    const char* cStr = cppStr.c_str();
    std::cout << "C字符串: " << cStr << std::endl;
    
    // C字符串 -> C++ string
    const char* cStr2 = "Hello C";
    std::string cppStr2 = cStr2;
    std::cout << "C++ string: " << cppStr2 << std::endl;
    
    // 混合使用
    std::string s = "Hello";
    char buffer[100];
    strcpy(buffer, s.c_str());
    strcat(buffer, " World");
    std::cout << "混合结果: " << buffer << std::endl;
    
    return 0;
}`,
                    description: '演示C字符串与std::string之间的转换。'
                }
            ],
            handsOn: {
                title: 'C风格字符串操作',
                description: '使用C字符串函数实现字符串的连接和比较。',
                initialCode: `#include <iostream>
#include <cstring>

int main() {
    // ===== 你的代码 =====
    // 定义两个C风格字符串
    char s1[50] = "Hello";
    char s2[50] = "World";
    
    // TODO: 使用strlen输出s1的长度
    // std::cout << "s1长度: " << strlen(s1) << std::endl;
    
    // TODO: 使用strcmp比较s1和s2，输出比较结果
    // 如果s1 < s2输出"小于"，s1 > s2输出"大于"，相等输出"相等"
    
    // TODO: 使用strcat将s2连接到s1后面，并输出结果
    
    return 0;
}`,
                expectedOutput: 's1长度: 5\\n小于\\n连接后: HelloWorld',
                solutionRegex: 'strlen|strcmp|strcat',
                hint: 'strlen求长度，strcmp比较，strcat连接字符串',
                xp: 120
            },
            quiz: [
                { type: 'single', question: 'C风格字符串以什么结尾？', options: [{ text: '\\n' }, { text: '\\0', correct: true }, { text: 'EOF' }, { text: 'NULL' }], explanation: 'C风格字符串以空字符\'\\0\'结尾。' },
                { type: 'single', question: 'char s[] = "Hello"; s的大小是多少？', options: [{ text: '5' }, { text: '6', correct: true }, { text: '不确定' }, { text: '7' }], explanation: '"Hello"有5个字符，加上自动添加的\'\\0\'，共6个字节。' },
                { type: 'single', question: 'strlen("Hello") 返回什么？', options: [{ text: '5', correct: true }, { text: '6' }, { text: '4' }, { text: '不确定' }], explanation: 'strlen返回字符串长度，不包括结尾的\'\\0\'。' },
                { type: 'single', question: 'strcmp("abc", "abd") 返回什么？', options: [{ text: '正数' }, { text: '负数', correct: true }, { text: '0' }, { text: '不确定' }], explanation: '"abc" < "abd"（字典序），所以返回负数。' },
                { type: 'single', question: '为什么char* p = "Hello"是危险的？', options: [{ text: '语法错误' }, { text: '字符串字面量是只读的', correct: true }, { text: '内存泄漏' }, { text: '没有危险' }], explanation: '字符串字面量存储在只读区域，修改会导致未定义行为。应使用const char*。' }
            ],
            references: [
                { title: 'C++ Primer 第五版', book: '第3.5.4节' }
            ],
            assistantTips: [
                '优先使用std::string而不是C风格字符串',
                '使用C字符串函数时注意缓冲区溢出',
                '字符串字面量应该用const char*指向'
            ]
        }
    ]
};
