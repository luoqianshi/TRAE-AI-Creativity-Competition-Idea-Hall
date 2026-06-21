/**
 * 单元18：输入输出与文件系统
 */
const Unit18Data = {
    id: 18,
    title: '输入输出与文件系统',
    description: '深入理解C++ IO系统，掌握文件操作、字符串流、格式控制及C++17文件系统库',
    lessons: [
        {
            id: '18.1',
            title: 'IO 类继承体系',
            duration: '30分钟',
            difficulty: '基础',
            xp: 100,
            estimatedXp: 300,
            concepts: `## IO 类继承体系

### IO 库概述

C++ 的 IO 库提供了一个类型安全的输入输出系统，基于继承体系构建。

\`\`\`cpp
#include <iostream>   // 标准IO
#include <fstream>    // 文件IO
#include <sstream>    // 字符串IO
\`\`\`

### IO 类继承关系

\`\`\`
                    ios_base
                       |
                      ios
                     /   \\
           istream  -----  ostream
           /    \\         /    \\
    ifstream  iostream  ofstream
              /    \\
         istringstream ostringstream
\`\`\`

### 核心类说明

#### 1. ios_base 和 ios

\`\`\`cpp
// ios_base：所有IO类的基类
// 定义了格式标志、状态标志等

// ios：继承自ios_base
// 提供格式控制、状态管理等功能

std::ios::fmtflags flags = std::cout.flags();
std::ios::iostate state = std::cin.rdstate();
\`\`\`

#### 2. 标准输入输出流

\`\`\`cpp
#include <iostream>

// 标准输出流
std::cout << "标准输出" << std::endl;
std::cerr << "标准错误（无缓冲）" << std::endl;
std::clog << "标准日志（有缓冲）" << std::endl;

// 标准输入流
int value;
std::cin >> value;
\`\`\`

#### 3. 文件流

\`\`\`cpp
#include <fstream>

// 输入文件流
std::ifstream inFile("input.txt");

// 输出文件流
std::ofstream outFile("output.txt");

// 输入输出文件流
std::fstream ioFile("data.txt");
\`\`\`

#### 4. 字符串流

\`\`\`cpp
#include <sstream>

// 输入字符串流
std::istringstream iss("123 456");

// 输出字符串流
std::ostringstream oss;

// 输入输出字符串流
std::stringstream ss;
\`\`\`

### 宽字符版本

每个 IO 类都有对应的宽字符版本：

\`\`\`cpp
// 宽字符流
std::wcout << L"宽字符输出" << std::endl;
std::wcin >> wvalue;

// 宽字符文件流
std::wifstream wInFile("input.txt");
std::wofstream wOutFile("output.txt");

// 宽字符字符串流
std::wstringstream wss;
\`\`\`

### 流的类型特征

#### 1. 不能拷贝

\`\`\`cpp
std::ofstream out1("file1.txt");
std::ofstream out2 = out1;  // 错误！不能拷贝

// 只能传递引用或指针
void processStream(std::ostream& os) {
    os << "Hello" << std::endl;
}
\`\`\`

#### 2. 可以移动（C++11）

\`\`\`cpp
std::ofstream createStream() {
    std::ofstream out("file.txt");
    return out;  // 移动返回
}

std::ofstream out = createStream();  // 移动构造
\`\`\`

#### 3. 条件状态

\`\`\`cpp
std::ifstream file("data.txt");

// 检查流状态
if (file) {
    // 流有效
}

if (file.good()) {
    // 流状态良好
}

if (file.fail()) {
    // IO操作失败
}

if (file.bad()) {
    // 流损坏
}

if (file.eof()) {
    // 到达文件末尾
}
\`\`\`

### 全局流对象

\`\`\`cpp
// 标准流对象
std::cin   // 标准输入
std::cout  // 标准输出
std::cerr  // 标准错误（无缓冲）
std::clog  // 标准日志（有缓冲）

// 宽字符版本
std::wcin
std::wcout
std::wcerr
std::wclog
\`\`\`

### 流的刷新

\`\`\`cpp
// 手动刷新
std::cout << "Hello" << std::flush;

// 换行并刷新
std::cout << "World" << std::endl;

// 单位刷新（每次输出都刷新）
std::cout << std::unitbuf;
std::cout << "This flushes immediately";
std::cout << std::nounitbuf;  // 关闭单位刷新
\`\`\`

### 流的绑定

\`\`\`cpp
// cin 绑定到 cout
// 每次读取 cin 时，cout 会自动刷新

// 获取绑定的流
std::ostream* oldTie = std::cin.tie();  // 返回 &std::cout

// 解除绑定
std::cin.tie(nullptr);

// 重新绑定
std::cin.tie(&std::cerr);
\`\`\`

### 使用场景

| 流类型 | 使用场景 |
|--------|----------|
| iostream | 标准输入输出 |
| fstream | 文件读写 |
| sstream | 字符串格式化 |
| cerr | 错误信息输出 |
| clog | 日志信息输出 |`,
            examples: [
                {
                    title: 'IO类基本使用',
                    code: `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

int main() {
    // 标准IO
    std::cout << "=== 标准IO ===" << std::endl;
    std::cout << "标准输出" << std::endl;
    std::cerr << "标准错误" << std::endl;
    std::clog << "标准日志" << std::endl;
    
    // 字符串流
    std::cout << "\\n=== 字符串流 ===" << std::endl;
    std::ostringstream oss;
    oss << "姓名: " << "张三" << ", 年龄: " << 25;
    std::cout << oss.str() << std::endl;
    
    // 字符串解析
    std::istringstream iss("100 200 300");
    int a, b, c;
    iss >> a >> b >> c;
    std::cout << "解析结果: " << a << ", " << b << ", " << c << std::endl;
    
    // 文件流
    std::cout << "\\n=== 文件流 ===" << std::endl;
    {
        std::ofstream outFile("test.txt");
        if (outFile) {
            outFile << "Hello, File IO!" << std::endl;
            outFile << "Line 2" << std::endl;
        }
    }
    
    {
        std::ifstream inFile("test.txt");
        if (inFile) {
            std::string line;
            while (std::getline(inFile, line)) {
                std::cout << "读取: " << line << std::endl;
            }
        }
    }
    
    return 0;
}`,
                    description: '展示IO类的基本使用方法。'
                },
                {
                    title: '流状态检查',
                    code: `#include <iostream>
#include <fstream>

void printStreamState(const std::ios& stream, const std::string& name) {
    std::cout << name << " 状态:" << std::endl;
    std::cout << "  good(): " << stream.good() << std::endl;
    std::cout << "  eof():  " << stream.eof() << std::endl;
    std::cout << "  fail(): " << stream.fail() << std::endl;
    std::cout << "  bad():  " << stream.bad() << std::endl;
}

int main() {
    // 正常状态
    std::cout << "=== 正常状态 ===" << std::endl;
    printStreamState(std::cin, "cin");
    
    // 输入失败
    std::cout << "\\n=== 输入失败测试 ===" << std::endl;
    std::cout << "请输入一个数字（输入字母测试失败）: ";
    int num;
    std::cin >> num;
    
    if (std::cin.fail()) {
        std::cout << "输入失败！" << std::endl;
        printStreamState(std::cin, "cin");
        
        // 清除错误状态
        std::cin.clear();
        std::cout << "\\n清除错误状态后:" << std::endl;
        printStreamState(std::cin, "cin");
        
        // 忽略错误输入
        std::cin.ignore(10000, '\\n');
    }
    
    // 文件打开失败
    std::cout << "\\n=== 文件打开失败 ===" << std::endl;
    std::ifstream file("nonexistent.txt");
    printStreamState(file, "file");
    
    if (!file) {
        std::cout << "文件打开失败！" << std::endl;
    }
    
    return 0;
}`,
                    description: '展示如何检查和处理流的状态。'
                }
            ],
            handsOn: {
                title: '实现日志系统',
                description: '使用不同的输出流实现一个简单的日志系统。',
                initialCode: `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <ctime>

enum class LogLevel {
    INFO,
    WARNING,
    ERROR
};

class Logger {
private:
    std::ofstream logFile;
    
    // 获取当前时间字符串
    std::string getCurrentTime() {
        // TODO: 实现获取当前时间
        // 格式: YYYY-MM-DD HH:MM:SS
        return "";
    }
    
    // 获取日志级别字符串
    std::string getLevelString(LogLevel level) {
        // TODO: 根据级别返回对应字符串
        // INFO -> "[INFO]"
        // WARNING -> "[WARNING]"
        // ERROR -> "[ERROR]"
        return "";
    }
    
public:
    // 构造函数
    Logger(const std::string& filename) {
        // TODO: 打开日志文件
    }
    
    ~Logger() {
        // TODO: 关闭日志文件
    }
    
    // 写入日志
    void log(LogLevel level, const std::string& message) {
        // TODO: 实现日志写入
        // 格式: [时间] [级别] 消息
        // 同时输出到文件和 std::cerr（如果是ERROR）
    }
    
    // 检查日志文件是否打开
    bool isOpen() const {
        // TODO: 返回文件是否打开
        return false;
    }
};

int main() {
    Logger logger("app.log");
    
    if (!logger.isOpen()) {
        std::cerr << "无法打开日志文件！" << std::endl;
        return 1;
    }
    
    logger.log(LogLevel::INFO, "应用程序启动");
    logger.log(LogLevel::WARNING, "内存使用率较高");
    logger.log(LogLevel::ERROR, "数据库连接失败");
    logger.log(LogLevel::INFO, "应用程序关闭");
    
    std::cout << "日志已写入 app.log" << std::endl;
    
    return 0;
}`,
                expectedOutput: `日志已写入 app.log

// app.log 内容示例:
[2024-01-15 10:30:45] [INFO] 应用程序启动
[2024-01-15 10:30:45] [WARNING] 内存使用率较高
[2024-01-15 10:30:45] [ERROR] 数据库连接失败
[2024-01-15 10:30:45] [INFO] 应用程序关闭`,
                solutionRegex: 'ofstream|ifstream|is_open|close|time|strftime',
                hint: '使用time函数获取时间，strftime格式化，ofstream写入文件',
                xp: 150
            },
            references: [
                { title: 'IO库', book: 'C++ Primer 第五版', chapter: '第8章' },
                { title: '输入输出流', book: 'The C++ Programming Language', chapter: '第38章' }
            ],
            assistantTips: [
                '流对象不能拷贝，只能传递引用',
                'cerr用于错误输出，无缓冲',
                'clog用于日志输出，有缓冲',
                'cin绑定到cout，读取时自动刷新cout'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '以下哪个类是所有IO类的基类？', 
                    options: [
                        { text: 'ios' }, 
                        { text: 'ios_base', correct: true }, 
                        { text: 'istream' }, 
                        { text: 'ostream' }
                    ], 
                    explanation: 'ios_base是所有IO类的最底层基类，定义了格式标志和状态标志。' 
                },
                { 
                    type: 'single', 
                    question: 'cerr和clog的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'cerr无缓冲，clog有缓冲', correct: true }, 
                        { text: 'cerr有缓冲，clog无缓冲' }, 
                        { text: 'cerr用于文件，clog用于控制台' }
                    ], 
                    explanation: 'cerr是无缓冲的，立即输出；clog是有缓冲的，效率更高。' 
                },
                { 
                    type: 'single', 
                    question: '流对象可以拷贝吗？', 
                    options: [
                        { text: '可以' }, 
                        { text: '不可以', correct: true }, 
                        { text: '只有文件流可以' }, 
                        { text: '只有字符串流可以' }
                    ], 
                    explanation: '流对象不能拷贝，只能传递引用或指针，但可以移动（C++11）。' 
                },
                { 
                    type: 'single', 
                    question: 'std::endl的作用是？', 
                    options: [
                        { text: '只输出换行符' }, 
                        { text: '输出换行符并刷新缓冲区', correct: true }, 
                        { text: '只刷新缓冲区' }, 
                        { text: '清空流' }
                    ], 
                    explanation: 'std::endl输出换行符并刷新缓冲区，相当于 << "\\n" << std::flush。' 
                },
                { 
                    type: 'single', 
                    question: 'cin默认绑定到哪个流？', 
                    options: [
                        { text: 'cerr' }, 
                        { text: 'clog' }, 
                        { text: 'cout', correct: true }, 
                        { text: '不绑定任何流' }
                    ], 
                    explanation: 'cin默认绑定到cout，每次读取cin时cout会自动刷新。' 
                }
            ]
        },
        {
            id: '18.2',
            title: '条件状态管理',
            duration: '35分钟',
            difficulty: '基础',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 条件状态管理

### 流的条件状态

每个流都有一组条件状态标志，用于指示IO操作的结果。

\`\`\`cpp
// 状态标志类型
std::ios::iostate

// 状态标志值
std::ios::goodbit   // 无错误
std::ios::eofbit    // 到达文件末尾
std::ios::failbit   // IO操作失败
std::ios::badbit    // 流损坏
\`\`\`

### 状态查询函数

#### 1. 基本查询

\`\`\`cpp
std::ifstream file("data.txt");

// 检查流是否有效
if (file) {
    // 流有效，可以操作
}

// 检查是否无错误
if (file.good()) {
    // 流状态良好
}

// 检查是否到达末尾
if (file.eof()) {
    // 到达文件末尾
}

// 检查是否失败
if (file.fail()) {
    // IO操作失败
}

// 检查是否损坏
if (file.bad()) {
    // 流损坏
}
\`\`\`

#### 2. 状态管理函数

\`\`\`cpp
// 获取当前状态
std::ios::iostate state = std::cin.rdstate();

// 设置状态
std::cin.setstate(std::ios::failbit);  // 添加failbit

// 清除状态
std::cin.clear();  // 清除所有错误状态
std::cin.clear(std::ios::failbit);  // 清除failbit
\`\`\`

#### 3. 清除错误状态

\`\`\`cpp
int value;
std::cin >> value;

if (std::cin.fail()) {
    // 输入失败（如输入了字母）
    
    // 1. 清除错误状态
    std::cin.clear();
    
    // 2. 忽略错误输入
    std::cin.ignore(10000, '\\n');
    
    // 3. 重新输入
    std::cout << "请重新输入: ";
    std::cin >> value;
}
\`\`\``,
            examples: [
                {
                    title: '状态检查示例',
                    code: `#include <iostream>
#include <fstream>

void printState(const std::ios& stream, const std::string& name) {
    std::cout << name << " 状态:" << std::endl;
    std::cout << "  good(): " << stream.good() << std::endl;
    std::cout << "  eof():  " << stream.eof() << std::endl;
    std::cout << "  fail(): " << stream.fail() << std::endl;
    std::cout << "  bad():  " << stream.bad() << std::endl;
}

int main() {
    // 正常状态
    std::cout << "=== 正常状态 ===" << std::endl;
    printState(std::cin, "cin");
    
    // 模拟输入失败
    std::cout << "\\n=== 设置failbit ===" << std::endl;
    std::cin.setstate(std::ios::failbit);
    printState(std::cin, "cin");
    
    // 清除状态
    std::cout << "\\n=== 清除状态 ===" << std::endl;
    std::cin.clear();
    printState(std::cin, "cin");
    
    return 0;
}`,
                    description: '展示流状态的检查和操作。'
                },
                {
                    title: '健壮的输入处理',
                    code: `#include <iostream>
#include <limits>

int getInteger(const std::string& prompt, int min, int max) {
    int value;
    
    while (true) {
        std::cout << prompt;
        std::cin >> value;
        
        if (std::cin.eof()) {
            std::cout << "\\n输入结束" << std::endl;
            return 0;
        }
        
        if (std::cin.fail()) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
            std::cout << "输入无效，请输入一个整数！" << std::endl;
            continue;
        }
        
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
        
        if (value < min || value > max) {
            std::cout << "输入范围: " << min << " ~ " << max << std::endl;
            continue;
        }
        
        return value;
    }
}

int main() {
    int age = getInteger("请输入年龄 (0-150): ", 0, 150);
    std::cout << "年龄: " << age << std::endl;
    
    return 0;
}`,
                    description: '展示如何实现健壮的用户输入处理。'
                }
            ],
            handsOn: {
                title: '实现输入验证器',
                description: '实现一个通用的输入验证器，支持多种数据类型和验证规则。',
                initialCode: `#include <iostream>
#include <string>
#include <limits>

class InputValidator {
public:
    // 获取整数（带范围检查）
    static int getInteger(const std::string& prompt, 
                          int min = std::numeric_limits<int>::min(),
                          int max = std::numeric_limits<int>::max()) {
        // TODO: 实现整数输入验证
        return 0;
    }
    
    // 获取字符串（带长度检查）
    static std::string getString(const std::string& prompt,
                                  size_t minLength = 0,
                                  size_t maxLength = 100) {
        // TODO: 实现字符串输入验证
        return "";
    }
};

int main() {
    int age = InputValidator::getInteger("请输入年龄 (0-150): ", 0, 150);
    std::cout << "年龄: " << age << std::endl;
    
    std::string name = InputValidator::getString("请输入姓名 (2-20字符): ", 2, 20);
    std::cout << "姓名: " << name << std::endl;
    
    return 0;
}`,
                expectedOutput: `请输入年龄 (0-150): 25
年龄: 25
请输入姓名 (2-20字符): 张三
姓名: 张三`,
                solutionRegex: 'clear|ignore|fail|eof|getline|cin',
                hint: '使用cin.fail()检查失败，clear()清除状态，ignore()忽略输入',
                xp: 180
            },
            references: [
                { title: '条件状态', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                '使用clear()清除错误状态',
                '使用ignore()跳过无效输入',
                'eofbit表示到达末尾，不是错误',
                'failbit可恢复，badbit通常不可恢复'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '哪个状态标志表示流损坏？', 
                    options: [
                        { text: 'goodbit' }, 
                        { text: 'eofbit' }, 
                        { text: 'failbit' }, 
                        { text: 'badbit', correct: true }
                    ], 
                    explanation: 'badbit表示流损坏，通常是不可恢复的错误。' 
                },
                { 
                    type: 'single', 
                    question: 'clear()函数的作用是？', 
                    options: [
                        { text: '清空流内容' }, 
                        { text: '清除错误状态', correct: true }, 
                        { text: '关闭流' }, 
                        { text: '重置流位置' }
                    ], 
                    explanation: 'clear()用于清除流的错误状态，将其设置为goodbit。' 
                },
                { 
                    type: 'single', 
                    question: '输入失败后应该做什么？', 
                    options: [
                        { text: '直接继续读取' }, 
                        { text: '清除状态并忽略错误输入', correct: true }, 
                        { text: '关闭程序' }, 
                        { text: '重新打开流' }
                    ], 
                    explanation: '输入失败后需要clear()清除状态，然后ignore()跳过错误输入。' 
                },
                { 
                    type: 'single', 
                    question: 'while(cin >> value) 循环何时结束？', 
                    options: [
                        { text: '输入0时' }, 
                        { text: '输入失败或EOF时', correct: true }, 
                        { text: '输入空格时' }, 
                        { text: '输入换行时' }
                    ], 
                    explanation: '循环条件检查流状态，输入失败或EOF时转换为false。' 
                },
                { 
                    type: 'single', 
                    question: 'eofbit何时被设置？', 
                    options: [
                        { text: '输入失败时' }, 
                        { text: '流损坏时' }, 
                        { text: '到达文件/输入末尾时', correct: true }, 
                        { text: '格式错误时' }
                    ], 
                    explanation: 'eofbit在读取到文件末尾或输入结束时被设置。' 
                }
            ]
        },
        {
            id: '18.3',
            title: '文件输入输出（ifstream/ofstream/fstream）',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 文件输入输出（ifstream/ofstream/fstream）

### 文件流概述

C++ 使用文件流类进行文件操作：

\`\`\`cpp
#include <fstream>

std::ifstream   // 输入文件流（读取）
std::ofstream   // 输出文件流（写入）
std::fstream    // 输入输出文件流（读写）
\`\`\`

### 打开文件

\`\`\`cpp
// 输入文件流
std::ifstream inFile("input.txt");

// 输出文件流
std::ofstream outFile("output.txt");

// 检查是否打开成功
if (!inFile) {
    std::cerr << "无法打开文件" << std::endl;
}
\`\`\`

### 文件打开模式

\`\`\`cpp
std::ios::in       // 打开用于读取
std::ios::out      // 打开用于写入
std::ios::app      // 追加模式
std::ios::ate      // 打开后定位到文件末尾
std::ios::trunc    // 截断文件（清空）
std::ios::binary   // 二进制模式

// 追加模式
std::ofstream appFile("log.txt", std::ios::app);

// 读写模式
std::fstream ioFile("data.txt", std::ios::in | std::ios::out);

// 二进制模式
std::ofstream binFile("data.bin", std::ios::binary);
\`\`\`

### 文件读写

#### 文本读写

\`\`\`cpp
// 写入
std::ofstream outFile("output.txt");
outFile << "第一行" << std::endl;
outFile << "第二行" << std::endl;

// 读取（逐行）
std::ifstream inFile("input.txt");
std::string line;
while (std::getline(inFile, line)) {
    std::cout << line << std::endl;
}
\`\`\`

#### 二进制读写

\`\`\`cpp
struct Person {
    char name[50];
    int age;
};

// 写入
std::ofstream outFile("data.bin", std::ios::binary);
Person p = {"张三", 25};
outFile.write(reinterpret_cast<char*>(&p), sizeof(Person));

// 读取
std::ifstream inFile("data.bin", std::ios::binary);
Person p;
inFile.read(reinterpret_cast<char*>(&p), sizeof(Person));
\`\`\`

### 文件位置

\`\`\`cpp
std::fstream file("data.txt", std::ios::in | std::ios::out);

// 获取位置
std::streampos readPos = file.tellg();
std::streampos writePos = file.tellp();

// 设置位置
file.seekg(0);                    // 移动到开头
file.seekg(0, std::ios::end);     // 移动到末尾
file.seekp(10);                   // 移动到位置10
\`\`\``,
            examples: [
                {
                    title: '文件读写基础',
                    code: `#include <iostream>
#include <fstream>
#include <string>

int main() {
    const std::string filename = "test.txt";
    
    // 写入文件
    std::cout << "=== 写入文件 ===" << std::endl;
    {
        std::ofstream outFile(filename);
        if (!outFile) {
            std::cerr << "无法打开文件进行写入" << std::endl;
            return 1;
        }
        
        outFile << "第一行：Hello, File IO!" << std::endl;
        outFile << "第二行：C++ 文件操作" << std::endl;
        outFile << "第三行：测试数据 123" << std::endl;
        
        std::cout << "文件写入完成" << std::endl;
    }
    
    // 读取文件（逐行）
    std::cout << "\\n=== 逐行读取 ===" << std::endl;
    {
        std::ifstream inFile(filename);
        if (!inFile) {
            std::cerr << "无法打开文件进行读取" << std::endl;
            return 1;
        }
        
        std::string line;
        int lineNum = 1;
        while (std::getline(inFile, line)) {
            std::cout << lineNum++ << ": " << line << std::endl;
        }
    }
    
    // 获取文件大小
    std::ifstream sizeFile(filename, std::ios::binary | std::ios::ate);
    if (sizeFile) {
        std::cout << "\\n文件大小: " << sizeFile.tellg() << " 字节" << std::endl;
    }
    
    return 0;
}`,
                    description: '展示文件的基本读写操作。'
                },
                {
                    title: '二进制文件操作',
                    code: `#include <iostream>
#include <fstream>
#include <string>
#include <vector>

struct Student {
    int id;
    char name[50];
    double score;
    
    Student() : id(0), score(0.0) {
        name[0] = '\\0';
    }
    
    Student(int i, const std::string& n, double s) : id(i), score(s) {
        strncpy(name, n.c_str(), 49);
        name[49] = '\\0';
    }
    
    void print() const {
        std::cout << "ID: " << id << ", 姓名: " << name 
                  << ", 成绩: " << score << std::endl;
    }
};

int main() {
    const std::string filename = "students.bin";
    
    // 写入二进制文件
    std::cout << "=== 写入二进制文件 ===" << std::endl;
    {
        std::ofstream outFile(filename, std::ios::binary);
        
        if (!outFile) {
            std::cerr << "无法打开文件" << std::endl;
            return 1;
        }
        
        std::vector<Student> students = {
            Student(101, "张三", 85.5),
            Student(102, "李四", 92.0),
            Student(103, "王五", 78.5)
        };
        
        for (const auto& s : students) {
            outFile.write(reinterpret_cast<const char*>(&s), sizeof(Student));
            s.print();
        }
    }
    
    // 读取二进制文件
    std::cout << "\\n=== 读取二进制文件 ===" << std::endl;
    {
        std::ifstream inFile(filename, std::ios::binary);
        
        if (!inFile) {
            std::cerr << "无法打开文件" << std::endl;
            return 1;
        }
        
        Student s;
        while (inFile.read(reinterpret_cast<char*>(&s), sizeof(Student))) {
            s.print();
        }
    }
    
    return 0;
}`,
                    description: '展示二进制文件的读写操作。'
                }
            ],
            handsOn: {
                title: '实现配置文件管理器',
                description: '实现一个简单的配置文件管理器，支持读写键值对配置。',
                initialCode: `#include <iostream>
#include <fstream>
#include <string>
#include <map>

class ConfigManager {
private:
    std::string filename;
    std::map<std::string, std::string> config;
    
public:
    ConfigManager(const std::string& file) : filename(file) {
        // TODO: 加载配置文件
    }
    
    ~ConfigManager() {
        // TODO: 保存配置到文件
    }
    
    // 设置配置项
    void set(const std::string& key, const std::string& value) {
        // TODO: 设置配置项
    }
    
    // 获取配置项
    std::string get(const std::string& key, const std::string& defaultValue = "") const {
        // TODO: 获取配置项
        return defaultValue;
    }
    
    // 显示所有配置
    void display() const {
        std::cout << "配置项:" << std::endl;
        for (const auto& [key, value] : config) {
            std::cout << "  " << key << " = " << value << std::endl;
        }
    }
};

int main() {
    ConfigManager config("config.ini");
    
    config.set("server", "localhost");
    config.set("port", "8080");
    config.set("database", "mydb");
    
    config.display();
    
    std::cout << "\\nserver: " << config.get("server") << std::endl;
    std::cout << "port: " << config.get("port") << std::endl;
    
    return 0;
}`,
                expectedOutput: `配置项:
  database = mydb
  port = 8080
  server = localhost

server: localhost
port: 8080`,
                solutionRegex: 'ifstream|ofstream|getline|find|substr|map',
                hint: '使用getline逐行读取，find查找等号，substr分割键值',
                xp: 200
            },
            references: [
                { title: '文件IO', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                '使用RAII自动管理文件资源',
                '二进制模式用于非文本文件',
                'seekg/seekp用于随机访问',
                '追加模式使用ios::app'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'ifstream默认的打开模式是？', 
                    options: [
                        { text: 'ios::out' }, 
                        { text: 'ios::in', correct: true }, 
                        { text: 'ios::app' }, 
                        { text: 'ios::binary' }
                    ], 
                    explanation: 'ifstream默认是ios::in模式，用于读取。' 
                },
                { 
                    type: 'single', 
                    question: '如何以追加模式打开文件？', 
                    options: [
                        { text: 'ios::out' }, 
                        { text: 'ios::app', correct: true }, 
                        { text: 'ios::ate' }, 
                        { text: 'ios::trunc' }
                    ], 
                    explanation: 'ios::app是追加模式，所有写入都在文件末尾。' 
                },
                { 
                    type: 'single', 
                    question: 'tellg()返回什么？', 
                    options: [
                        { text: '文件大小' }, 
                        { text: '当前读位置', correct: true }, 
                        { text: '当前写位置' }, 
                        { text: '剩余字节数' }
                    ], 
                    explanation: 'tellg()返回当前读位置，tellp()返回当前写位置。' 
                },
                { 
                    type: 'single', 
                    question: 'seekg(0, ios::end)的作用是？', 
                    options: [
                        { text: '移动到文件开头' }, 
                        { text: '移动到文件末尾', correct: true }, 
                        { text: '后退一个位置' }, 
                        { text: '前进一个位置' }
                    ], 
                    explanation: 'seekg(0, ios::end)将读位置移动到文件末尾。' 
                },
                { 
                    type: 'single', 
                    question: '二进制写入使用哪个函数？', 
                    options: [
                        { text: 'write()', correct: true }, 
                        { text: '<< 操作符' }, 
                        { text: 'put()' }, 
                        { text: 'binary_write()' }
                    ], 
                    explanation: 'write()用于二进制写入，<< 操作符用于文本写入。' 
                }
            ]
        },
        {
            id: '18.4',
            title: '字符串流（stringstream）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 字符串流（stringstream）

### 字符串流概述

字符串流将字符串作为IO源，支持格式化输入输出。

\`\`\`cpp
#include <sstream>

std::istringstream   // 输入字符串流
std::ostringstream   // 输出字符串流
std::stringstream    // 输入输出字符串流
\`\`\`

### 输出字符串流

\`\`\`cpp
std::ostringstream oss;

oss << "姓名: " << "张三" << std::endl;
oss << "年龄: " << 25 << std::endl;

std::string result = oss.str();
\`\`\`

### 输入字符串流

\`\`\`cpp
std::istringstream iss("100 200 300");

int a, b, c;
iss >> a >> b >> c;

// 字符串解析
std::string line = "张三,25,92.5";
std::istringstream iss2(line);
std::string name, ageStr, scoreStr;
std::getline(iss2, name, ',');
std::getline(iss2, ageStr, ',');
std::getline(iss2, scoreStr);
\`\`\`

### 类型转换

\`\`\`cpp
// 数字转字符串
template<typename T>
std::string toString(const T& value) {
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

// 字符串转数字
template<typename T>
T fromString(const std::string& str) {
    std::istringstream iss(str);
    T value;
    iss >> value;
    return value;
}
\`\`\``,
            examples: [
                {
                    title: '字符串流基础',
                    code: `#include <iostream>
#include <sstream>
#include <string>

int main() {
    // 输出字符串流
    std::cout << "=== 输出字符串流 ===" << std::endl;
    std::ostringstream oss;
    oss << "姓名: " << "张三" << std::endl;
    oss << "年龄: " << 25 << std::endl;
    std::cout << oss.str();
    
    // 输入字符串流
    std::cout << "\\n=== 输入字符串流 ===" << std::endl;
    std::istringstream iss("100 200 300");
    int a, b, c;
    iss >> a >> b >> c;
    std::cout << "解析结果: " << a << ", " << b << ", " << c << std::endl;
    
    // 字符串分割
    std::cout << "\\n=== 字符串分割 ===" << std::endl;
    std::string csv = "apple,banana,cherry";
    std::istringstream iss2(csv);
    std::string item;
    while (std::getline(iss2, item, ',')) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示字符串流的基本操作。'
                },
                {
                    title: '字符串流应用',
                    code: `#include <iostream>
#include <sstream>
#include <string>
#include <vector>

// 字符串分割
std::vector<std::string> split(const std::string& str, char delimiter) {
    std::vector<std::string> tokens;
    std::istringstream iss(str);
    std::string token;
    
    while (std::getline(iss, token, delimiter)) {
        tokens.push_back(token);
    }
    
    return tokens;
}

// 字符串连接
template<typename T>
std::string join(const std::vector<T>& items, const std::string& delimiter) {
    std::ostringstream oss;
    for (size_t i = 0; i < items.size(); ++i) {
        if (i > 0) oss << delimiter;
        oss << items[i];
    }
    return oss.str();
}

int main() {
    // 字符串分割
    std::string csv = "apple,banana,cherry,date";
    auto fruits = split(csv, ',');
    
    std::cout << "分割结果: ";
    for (const auto& f : fruits) {
        std::cout << f << " ";
    }
    std::cout << std::endl;
    
    // 字符串连接
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::cout << "连接结果: " << join(numbers, "-") << std::endl;
    
    return 0;
}`,
                    description: '展示字符串流的实际应用。'
                }
            ],
            handsOn: {
                title: '实现模板引擎',
                description: '使用字符串流实现一个简单的模板引擎，支持变量替换。',
                initialCode: `#include <iostream>
#include <sstream>
#include <string>
#include <map>

class TemplateEngine {
private:
    std::string templateStr;
    
public:
    TemplateEngine(const std::string& tmpl) : templateStr(tmpl) {}
    
    // 渲染模板
    std::string render(const std::map<std::string, std::string>& variables) {
        // TODO: 实现模板渲染
        // 将 {{变量名}} 替换为对应的值
        return templateStr;
    }
};

int main() {
    std::string htmlTemplate = R"(
<html>
<head><title>{{title}}</title></head>
<body>
    <h1>{{heading}}</h1>
    <p>欢迎, {{username}}!</p>
</body>
</html>
)";

    TemplateEngine engine(htmlTemplate);
    
    std::map<std::string, std::string> variables = {
        {"title", "用户中心"},
        {"heading", "欢迎页面"},
        {"username", "张三"}
    };
    
    std::string result = engine.render(variables);
    std::cout << result << std::endl;
    
    return 0;
}`,
                expectedOutput: `
<html>
<head><title>用户中心</title></head>
<body>
    <h1>欢迎页面</h1>
    <p>欢迎, 张三!</p>
</body>
</html>`,
                solutionRegex: 'ostringstream|istringstream|find|replace|substr|map',
                hint: '使用ostringstream构建结果，find查找{{}}，map存储变量',
                xp: 180
            },
            references: [
                { title: '字符串流', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                'ostringstream用于构建字符串',
                'istringstream用于解析字符串',
                'str()获取内容，str("")清空',
                'clear()清除流状态'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'ostringstream的str()方法返回什么？', 
                    options: [
                        { text: '流对象本身' }, 
                        { text: '流中的字符串内容', correct: true }, 
                        { text: '流的状态' }, 
                        { text: '流的大小' }
                    ], 
                    explanation: 'str()返回流中累积的字符串内容。' 
                },
                { 
                    type: 'single', 
                    question: '如何清空ostringstream的内容？', 
                    options: [
                        { text: 'clear()' }, 
                        { text: 'str("")', correct: true }, 
                        { text: 'reset()' }, 
                        { text: 'flush()' }
                    ], 
                    explanation: 'str("")清空流的内容，clear()清除流的状态。' 
                },
                { 
                    type: 'single', 
                    question: 'istringstream适合用于？', 
                    options: [
                        { text: '构建字符串' }, 
                        { text: '解析字符串', correct: true }, 
                        { text: '文件读取' }, 
                        { text: '网络通信' }
                    ], 
                    explanation: 'istringstream用于从字符串中解析数据。' 
                },
                { 
                    type: 'single', 
                    question: "getline(iss, str, ',')的作用是？", 
                    options: [
                        { text: '读取一行' }, 
                        { text: '读取到逗号为止', correct: true }, 
                        { text: '读取逗号' }, 
                        { text: '跳过逗号' }
                    ], 
                    explanation: 'getline的第三个参数指定分隔符，读取到分隔符为止。' 
                },
                { 
                    type: 'single', 
                    question: 'stringstream相比ostringstream的优势是？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '支持读写', correct: true }, 
                        { text: '内存更小' }, 
                        { text: '更安全' }
                    ], 
                    explanation: 'stringstream同时支持输入和输出操作。' 
                }
            ]
        },
        {
            id: '18.5',
            title: '格式控制与操纵符',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 格式控制与操纵符

### 格式控制概述

C++ 提供了丰富的格式控制功能，用于控制IO的格式。

\`\`\`cpp
#include <iostream>
#include <iomanip>  // 格式操纵符
\`\`\`

### 布尔值格式

\`\`\`cpp
bool flag = true;
std::cout << flag << std::endl;  // 1
std::cout << std::boolalpha << flag << std::endl;  // true
std::cout << std::noboolalpha << flag << std::endl;  // 1
\`\`\`

### 整数进制

\`\`\`cpp
int value = 255;
std::cout << std::dec << value << std::endl;  // 255
std::cout << std::hex << value << std::endl;  // ff
std::cout << std::oct << value << std::endl;  // 377
std::cout << std::showbase << std::hex << value << std::endl;  // 0xff
\`\`\`

### 浮点数格式

\`\`\`cpp
double pi = 3.141592653589793;
std::cout << pi << std::endl;  // 3.14159
std::cout << std::fixed << std::setprecision(2) << pi << std::endl;  // 3.14
std::cout << std::scientific << std::setprecision(4) << pi << std::endl;  // 3.1416e+00
\`\`\`

### 宽度与对齐

\`\`\`cpp
std::cout << std::setw(10) << 123 << std::endl;  // "       123"
std::cout << std::setw(10) << std::left << 123 << std::endl;  // "123       "
std::cout << std::setfill('0') << std::setw(10) << 123 << std::endl;  // "0000000123"
\`\`\``,
            examples: [
                {
                    title: '格式化输出示例',
                    code: `#include <iostream>
#include <iomanip>

int main() {
    // 布尔值格式
    std::cout << "=== 布尔值格式 ===" << std::endl;
    bool flag = true;
    std::cout << "默认: " << flag << std::endl;
    std::cout << "boolalpha: " << std::boolalpha << flag << std::endl;
    std::cout << std::noboolalpha;
    
    // 整数进制
    std::cout << "\\n=== 整数进制 ===" << std::endl;
    int value = 255;
    std::cout << "十进制: " << std::dec << value << std::endl;
    std::cout << "十六进制: " << std::hex << value << std::endl;
    std::cout << "八进制: " << std::oct << value << std::endl;
    std::cout << std::dec;
    
    // 浮点数格式
    std::cout << "\\n=== 浮点数格式 ===" << std::endl;
    double pi = 3.141592653589793;
    std::cout << "默认: " << pi << std::endl;
    std::cout << "固定精度: " << std::fixed << std::setprecision(2) << pi << std::endl;
    std::cout << std::defaultfloat;
    
    // 宽度和对齐
    std::cout << "\\n=== 宽度和对齐 ===" << std::endl;
    std::cout << "右对齐: " << std::setw(10) << std::right << 123 << std::endl;
    std::cout << "左对齐: " << std::setw(10) << std::left << 123 << std::endl;
    std::cout << "填充0: " << std::setfill('0') << std::setw(10) << 123 << std::endl;
    
    return 0;
}`,
                    description: '展示各种格式化输出。'
                },
                {
                    title: '格式化表格',
                    code: `#include <iostream>
#include <iomanip>
#include <string>
#include <vector>

struct Student {
    std::string name;
    int age;
    double score;
};

void printStudentTable(const std::vector<Student>& students) {
    // 表头
    std::cout << std::left;
    std::cout << std::setw(15) << "姓名"
              << std::setw(8) << "年龄"
              << std::setw(10) << "成绩" << std::endl;
    
    // 分隔线
    std::cout << std::setfill('-');
    std::cout << std::setw(33) << "" << std::endl;
    std::cout << std::setfill(' ');
    
    // 数据行
    std::cout << std::fixed << std::setprecision(1);
    for (const auto& s : students) {
        std::cout << std::left;
        std::cout << std::setw(15) << s.name
                  << std::setw(8) << s.age
                  << std::setw(10) << s.score << std::endl;
    }
}

int main() {
    std::vector<Student> students = {
        {"张三", 20, 85.5},
        {"李四", 22, 92.0},
        {"王五", 21, 78.5}
    };
    
    std::cout << "=== 学生成绩表 ===" << std::endl;
    printStudentTable(students);
    
    return 0;
}`,
                    description: '展示如何格式化输出表格。'
                }
            ],
            handsOn: {
                title: '实现格式化报告生成器',
                description: '实现一个报告生成器，支持多种格式化输出。',
                initialCode: `#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <map>

class ReportGenerator {
private:
    std::string title;
    std::vector<std::map<std::string, std::string>> data;
    std::vector<std::string> columns;
    
public:
    ReportGenerator(const std::string& t) : title(t) {}
    
    // 添加列定义
    void addColumn(const std::string& name, int width = 10) {
        // TODO: 添加列定义
    }
    
    // 添加数据行
    void addRow(const std::map<std::string, std::string>& row) {
        // TODO: 添加数据行
    }
    
    // 生成报告
    void generate() {
        // TODO: 生成格式化报告
    }
};

int main() {
    ReportGenerator report("销售报告");
    
    report.addColumn("产品", 15);
    report.addColumn("数量", 10);
    report.addColumn("单价", 10);
    report.addColumn("总价", 12);
    
    report.addRow({
        {"产品", "笔记本电脑"},
        {"数量", "5"},
        {"单价", "5999.00"},
        {"总价", "29995.00"}
    });
    
    report.addRow({
        {"产品", "鼠标"},
        {"数量", "10"},
        {"单价", "99.00"},
        {"总价", "990.00"}
    });
    
    report.generate();
    
    return 0;
}`,
                expectedOutput: `================================
          销售报告
================================

产品            数量       单价         总价       
------------------------------------------------
笔记本电脑      5          5999.00     29995.00   
鼠标            10         99.00       990.00`,
                solutionRegex: 'setw|setfill|left|right|fixed|setprecision',
                hint: '使用setw设置宽度，setfill设置填充，left/right设置对齐',
                xp: 200
            },
            references: [
                { title: '格式控制', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                'setw只影响下一个输出',
                '使用flags()保存和恢复格式',
                'fixed和scientific需要配合setprecision',
                '自定义操纵符可以实现特殊格式'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'setw(10)的作用范围是？', 
                    options: [
                        { text: '整个程序' }, 
                        { text: '只影响下一个输出', correct: true }, 
                        { text: '当前行' }, 
                        { text: '直到下次设置' }
                    ], 
                    explanation: 'setw只影响紧随其后的一个输出项。' 
                },
                { 
                    type: 'single', 
                    question: '如何让浮点数输出2位小数？', 
                    options: [
                        { text: 'setprecision(2)' }, 
                        { text: 'fixed + setprecision(2)', correct: true }, 
                        { text: 'setw(2)' }, 
                        { text: 'setfill(2)' }
                    ], 
                    explanation: '需要fixed和setprecision配合使用才能设置小数位数。' 
                },
                { 
                    type: 'single', 
                    question: 'showbase的作用是？', 
                    options: [
                        { text: '显示基数' }, 
                        { text: '显示进制前缀', correct: true }, 
                        { text: '显示基础信息' }, 
                        { text: '显示底部' }
                    ], 
                    explanation: 'showbase显示进制前缀，如0x表示十六进制。' 
                },
                { 
                    type: 'single', 
                    question: '如何恢复默认浮点格式？', 
                    options: [
                        { text: 'resetiosflags' }, 
                        { text: 'defaultfloat', correct: true }, 
                        { text: 'normalfloat' }, 
                        { text: 'clearformat' }
                    ], 
                    explanation: 'defaultfloat恢复默认的浮点数格式。' 
                },
                { 
                    type: 'single', 
                    question: 'setfill('0')的作用是？', 
                    options: [
                        { text: '填充数字0' }, 
                        { text: '设置填充字符为0', correct: true }, 
                        { text: '设置宽度为0' }, 
                        { text: '清空填充' }
                    ], 
                    explanation: 'setfill设置填充字符，在宽度不足时使用。' 
                }
            ]
        },
        {
            id: '18.6',
            title: '未格式化输入输出',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 未格式化输入输出

### 未格式化IO概述

未格式化IO直接处理字符，不进行格式转换。

\`\`\`cpp
// 未格式化输入
int get();               // 读取一个字符
istream& get(char& c);   // 读取一个字符到c
istream& getline(char* s, streamsize n);  // 读取一行
istream& read(char* s, streamsize n);     // 读取n个字符
streamsize gcount();     // 返回上次读取的字符数

// 未格式化输出
ostream& put(char c);    // 输出一个字符
ostream& write(const char* s, streamsize n);  // 输出n个字符
\`\`\`

### 单字符操作

\`\`\`cpp
// 方式1：返回int类型
int ch = std::cin.get();  // 返回字符的ASCII码，失败返回EOF

// 方式2：引用参数
char c;
std::cin.get(c);  // 读取字符到c

// 输出单字符
std::cout.put('A');
std::cout.put('\\n');
\`\`\`

### 行读取

\`\`\`cpp
char buffer[100];

// get：读取一行，不含换行符，换行符留在流中
std::cin.get(buffer, 100);

// getline：读取一行，包含换行符，换行符被丢弃
std::cin.getline(buffer, 100);

// 读取到指定分隔符
std::cin.getline(buffer, 100, ':');
\`\`\`

### 块读写

\`\`\`cpp
char buffer[100];

// 读取指定数量的字符
std::cin.read(buffer, 50);

// 获取实际读取的字符数
std::streamsize count = std::cin.gcount();

// 写入指定数量的字符
std::cout.write(buffer, count);
\`\`\`

### 忽略和查看

\`\`\`cpp
// 忽略字符
std::cin.ignore();  // 忽略一个字符
std::cin.ignore(100);  // 忽略最多100个字符
std::cin.ignore(100, '\\n');  // 忽略到换行符或100个字符

// 查看下一个字符但不读取
int ch = std::cin.peek();

// 放回字符
std::cin.putback(c);

// 撤销读取
std::cin.unget();
\`\`\``,
            examples: [
                {
                    title: '未格式化IO基础',
                    code: `#include <iostream>
#include <string>
#include <limits>

int main() {
    // 单字符操作
    std::cout << "=== 单字符操作 ===" << std::endl;
    std::cout << "请输入一个字符: ";
    char c;
    std::cin.get(c);
    std::cout << "读取到: ";
    std::cout.put(c);
    std::cout.put('\\n');
    
    // 行读取
    std::cout << "\\n=== 行读取 ===" << std::endl;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
    
    std::cout << "请输入一行文本: ";
    char buffer[100];
    std::cin.getline(buffer, 100);
    std::cout << "读取到: " << buffer << std::endl;
    
    // peek 和 ignore
    std::cout << "\\n=== peek 和 ignore ===" << std::endl;
    std::cout << "请输入一些文本: ";
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
    
    int next = std::cin.peek();
    std::cout << "下一个字符: " << (char)next << std::endl;
    
    // 块读写
    std::cout << "\\n=== 块读写 ===" << std::endl;
    const char* data = "Hello, World!";
    std::cout.write(data, 5);
    std::cout.put('\\n');
    std::cout.write(data, 13);
    std::cout.put('\\n');
    
    return 0;
}`,
                    description: '展示未格式化IO的基本操作。'
                },
                {
                    title: '文件复制',
                    code: `#include <iostream>
#include <fstream>
#include <string>

// 使用未格式化IO复制文件
bool copyFile(const std::string& src, const std::string& dst) {
    std::ifstream in(src, std::ios::binary);
    std::ofstream out(dst, std::ios::binary);
    
    if (!in || !out) {
        return false;
    }
    
    // 使用 read/write
    char buffer[4096];
    while (in.read(buffer, sizeof(buffer))) {
        out.write(buffer, in.gcount());
    }
    
    if (in.gcount() > 0) {
        out.write(buffer, in.gcount());
    }
    
    return true;
}

int main() {
    // 创建测试文件
    {
        std::ofstream test("source.txt");
        test << "这是一个测试文件\\n";
        test << "包含多行文本\\n";
    }
    
    std::cout << "=== 复制文件 ===" << std::endl;
    
    if (copyFile("source.txt", "copy.txt")) {
        std::cout << "复制成功" << std::endl;
    }
    
    // 验证复制结果
    std::cout << "\\n=== 验证复制结果 ===" << std::endl;
    
    std::ifstream in("copy.txt");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << std::endl;
    }
    
    return 0;
}`,
                    description: '展示使用未格式化IO复制文件。'
                }
            ],
            handsOn: {
                title: '实现简单词法分析器',
                description: '使用未格式化IO实现一个简单的词法分析器。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <cctype>

enum class TokenType {
    NUMBER,      // 数字
    OPERATOR,    // 运算符
    IDENTIFIER,  // 标识符
    WHITESPACE,  // 空白
    UNKNOWN      // 未知
};

struct Token {
    TokenType type;
    std::string value;
};

class Lexer {
private:
    std::istream& input;
    
public:
    Lexer(std::istream& is) : input(is) {}
    
    // 读取下一个token
    Token nextToken() {
        // TODO: 实现词法分析
        return Token(TokenType::UNKNOWN, "");
    }
    
    // 读取所有token
    std::vector<Token> tokenize() {
        // TODO: 读取所有token
        return {};
    }
};

int main() {
    std::string code = "x = 10 + 20 * y";
    std::istringstream iss(code);
    
    Lexer lexer(iss);
    
    std::cout << "=== 词法分析结果 ===" << std::endl;
    auto tokens = lexer.tokenize();
    
    for (const auto& token : tokens) {
        if (token.type != TokenType::WHITESPACE) {
            std::cout << (int)token.type << ": " << token.value << std::endl;
        }
    }
    
    return 0;
}`,
                expectedOutput: `=== 词法分析结果 ===
2: x
1: =
0: 10
1: +
0: 20
1: *
2: y`,
                solutionRegex: 'get|peek|putback|unget|isdigit|isalpha|isspace',
                hint: '使用peek查看下一个字符，get读取字符，isdigit/isalpha判断类型',
                xp: 180
            },
            references: [
                { title: '未格式化IO', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                'get()读取字符但不跳过空白',
                'getline()会丢弃分隔符',
                'peek()可以查看下一个字符',
                'gcount()返回上次读取的字符数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'get()和>>的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'get()不跳过空白', correct: true }, 
                        { text: 'get()更慢' }, 
                        { text: 'get()只能读取数字' }
                    ], 
                    explanation: 'get()是未格式化输入，不跳过空白字符。' 
                },
                { 
                    type: 'single', 
                    question: 'getline()和get()读取行的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'getline()丢弃换行符，get()保留', correct: true }, 
                        { text: 'get()丢弃换行符，getline()保留' }, 
                        { text: 'getline()更快' }
                    ], 
                    explanation: 'getline()读取后会丢弃分隔符，get()保留在流中。' 
                },
                { 
                    type: 'single', 
                    question: 'peek()的作用是？', 
                    options: [
                        { text: '读取并删除下一个字符' }, 
                        { text: '查看下一个字符但不读取', correct: true }, 
                        { text: '跳过下一个字符' }, 
                        { text: '清空输入缓冲区' }
                    ], 
                    explanation: 'peek()查看下一个字符但不从流中移除。' 
                },
                { 
                    type: 'single', 
                    question: 'gcount()返回什么？', 
                    options: [
                        { text: '文件大小' }, 
                        { text: '上次读取的字符数', correct: true }, 
                        { text: '剩余字符数' }, 
                        { text: '总字符数' }
                    ], 
                    explanation: 'gcount()返回上次未格式化读取操作读取的字符数。' 
                },
                { 
                    type: 'single', 
                    question: 'putback()的作用是？', 
                    options: [
                        { text: '输出字符' }, 
                        { text: '将字符放回流中', correct: true }, 
                        { text: '删除字符' }, 
                        { text: '替换字符' }
                    ], 
                    explanation: 'putback()将一个字符放回输入流，可以重新读取。' 
                }
            ]
        },
        {
            id: '18.7',
            title: '随机访问流',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 随机访问流

### 随机访问概述

随机访问允许在流的任意位置进行读写操作。

\`\`\`cpp
// 位置类型
std::streampos   // 位置类型

// 位置操作
seekg()  // 设置读位置
seekp()  // 设置写位置
tellg()  // 获取读位置
tellp()  // 获取写位置
\`\`\`

### 位置操作

\`\`\`cpp
std::fstream file("data.txt", std::ios::in | std::ios::out);

// 获取位置
std::streampos readPos = file.tellg();
std::streampos writePos = file.tellp();

// 设置位置
file.seekg(0);                    // 移动到开头
file.seekg(10);                   // 移动到位置10
file.seekg(0, std::ios::end);     // 移动到末尾
file.seekg(-10, std::ios::end);   // 从末尾后退10字节
file.seekg(5, std::ios::cur);     // 从当前位置前进5字节
\`\`\`

### 文件大小

\`\`\`cpp
std::ifstream file("data.txt", std::ios::binary | std::ios::ate);

if (file) {
    std::streamsize size = file.tellg();
    std::cout << "文件大小: " << size << " 字节" << std::endl;
    
    file.seekg(0, std::ios::beg);  // 回到开头
}
\`\`\`

### 随机访问记录

\`\`\`cpp
struct Record {
    int id;
    char name[50];
    double value;
};

// 读取指定记录
Record readRecord(const std::string& filename, int index) {
    std::ifstream file(filename, std::ios::binary);
    Record record;
    
    if (file) {
        std::streampos pos = index * sizeof(Record);
        file.seekg(pos);
        file.read(reinterpret_cast<char*>(&record), sizeof(Record));
    }
    
    return record;
}
\`\`\``,
            examples: [
                {
                    title: '随机访问基础',
                    code: `#include <iostream>
#include <fstream>
#include <string>

int main() {
    const std::string filename = "random.dat";
    
    // 创建测试文件
    {
        std::ofstream out(filename, std::ios::binary);
        for (int i = 0; i < 10; ++i) {
            out.write(reinterpret_cast<const char*>(&i), sizeof(int));
        }
    }
    
    // 随机读取
    std::cout << "=== 随机读取 ===" << std::endl;
    {
        std::ifstream in(filename, std::ios::binary);
        
        // 读取第5个整数
        in.seekg(5 * sizeof(int));
        int value;
        in.read(reinterpret_cast<char*>(&value), sizeof(int));
        std::cout << "第5个整数: " << value << std::endl;
        
        // 获取文件大小
        in.seekg(0, std::ios::end);
        auto size = in.tellg();
        std::cout << "文件大小: " << size << " 字节" << std::endl;
        std::cout << "整数数量: " << size / sizeof(int) << std::endl;
    }
    
    return 0;
}`,
                    description: '展示随机访问的基本操作。'
                },
                {
                    title: '记录管理',
                    code: `#include <iostream>
#include <fstream>
#include <string>

struct Student {
    int id;
    char name[50];
    double score;
};

int main() {
    const std::string filename = "students.dat";
    
    // 写入记录
    {
        std::ofstream out(filename, std::ios::binary);
        Student s1 = {101, "张三", 85.5};
        Student s2 = {102, "李四", 92.0};
        Student s3 = {103, "王五", 78.5};
        
        out.write(reinterpret_cast<const char*>(&s1), sizeof(Student));
        out.write(reinterpret_cast<const char*>(&s2), sizeof(Student));
        out.write(reinterpret_cast<const char*>(&s3), sizeof(Student));
    }
    
    // 随机读取第2条记录
    std::cout << "=== 读取第2条记录 ===" << std::endl;
    {
        std::ifstream in(filename, std::ios::binary);
        in.seekg(sizeof(Student));  // 跳过第1条
        
        Student s;
        in.read(reinterpret_cast<char*>(&s), sizeof(Student));
        std::cout << "ID: " << s.id << ", 姓名: " << s.name 
                  << ", 成绩: " << s.score << std::endl;
    }
    
    return 0;
}`,
                    description: '展示使用随机访问管理记录文件。'
                }
            ],
            handsOn: {
                title: '实现简单数据库',
                description: '使用随机访问实现一个简单的键值存储数据库。',
                initialCode: `#include <iostream>
#include <fstream>
#include <string>
#include <map>

class SimpleDatabase {
private:
    std::string filename;
    std::map<std::string, std::streampos> index;
    
public:
    SimpleDatabase(const std::string& file) : filename(file) {}
    
    // 设置键值
    void set(const std::string& key, const std::string& value) {
        // TODO: 实现设置键值
    }
    
    // 获取值
    std::string get(const std::string& key) {
        // TODO: 实现获取值
        return "";
    }
    
    // 删除键
    bool remove(const std::string& key) {
        // TODO: 实现删除键
        return false;
    }
    
    // 显示所有键值
    void displayAll() {
        // TODO: 显示所有键值对
    }
};

int main() {
    SimpleDatabase db("mydb.dat");
    
    db.set("name", "张三");
    db.set("age", "25");
    db.set("city", "北京");
    
    std::cout << "=== 设置后 ===" << std::endl;
    db.displayAll();
    
    std::cout << "\\nname: " << db.get("name") << std::endl;
    std::cout << "age: " << db.get("age") << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 设置后 ===
age = 25
city = 北京
name = 张三

name: 张三
age: 25`,
                solutionRegex: 'seekg|seekp|tellg|tellp|write|read|map',
                hint: '使用map存储索引，seekg/seekp定位，write/read读写',
                xp: 200
            },
            references: [
                { title: '随机访问', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                '二进制模式下位置更准确',
                '读写切换时需要重新定位',
                'tellg/tellp返回当前位置',
                'seekg/seekp可以相对或绝对定位'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'seekg(0, ios::end)的作用是？', 
                    options: [
                        { text: '移动到文件开头' }, 
                        { text: '移动到文件末尾', correct: true }, 
                        { text: '移动到当前位置' }, 
                        { text: '清空文件' }
                    ], 
                    explanation: 'seekg(0, ios::end)将读位置移动到文件末尾。' 
                },
                { 
                    type: 'single', 
                    question: 'tellg()返回什么？', 
                    options: [
                        { text: '文件大小' }, 
                        { text: '当前读位置', correct: true }, 
                        { text: '当前写位置' }, 
                        { text: '剩余字节数' }
                    ], 
                    explanation: 'tellg()返回当前读位置，tellp()返回当前写位置。' 
                },
                { 
                    type: 'single', 
                    question: '如何获取文件大小？', 
                    options: [
                        { text: 'size()' }, 
                        { text: '打开时定位到末尾，使用tellg()', correct: true }, 
                        { text: 'length()' }, 
                        { text: 'count()' }
                    ], 
                    explanation: '打开文件时使用ios::ate定位到末尾，然后tellg()返回大小。' 
                },
                { 
                    type: 'single', 
                    question: '文本模式下随机访问的问题是？', 
                    options: [
                        { text: '不能随机访问' }, 
                        { text: '位置可能不准确（换行符转换）', correct: true }, 
                        { text: '速度太慢' }, 
                        { text: '不支持seek' }
                    ], 
                    explanation: '文本模式下换行符可能被转换，导致位置计算不准确。' 
                },
                { 
                    type: 'single', 
                    question: '读写切换时需要做什么？', 
                    options: [
                        { text: '关闭文件' }, 
                        { text: '重新定位', correct: true }, 
                        { text: '清空缓冲区' }, 
                        { text: '刷新流' }
                    ], 
                    explanation: '读写切换时需要使用seekg/seekp重新定位。' 
                }
            ]
        },
        {
            id: '18.8',
            title: '文件系统库（C++17）：path、directory_iterator',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 130,
            estimatedXp: 380,
            concepts: `## 文件系统库（C++17）：path、directory_iterator

### 文件系统库概述

C++17 引入了 <filesystem> 库，提供跨平台的文件系统操作。

\`\`\`cpp
#include <filesystem>
namespace fs = std::filesystem;
\`\`\`

### path 类

\`\`\`cpp
// 创建路径
fs::path p1("/usr/local/bin");
fs::path p2 = "folder/file.txt";

// 路径拼接
fs::path p3 = fs::path("data") / "files" / "test.txt";

// 路径分解
fs::path p = "/home/user/documents/file.txt";
p.parent_path();    // "/home/user/documents"
p.filename();       // "file.txt"
p.stem();           // "file"
p.extension();      // ".txt"
\`\`\`

### 文件操作

\`\`\`cpp
// 检查文件是否存在
bool exists = fs::exists("file.txt");

// 检查是否为目录
bool isDir = fs::is_directory("folder");

// 获取文件大小
uintmax_t size = fs::file_size("file.txt");

// 创建目录
fs::create_directory("new_folder");
fs::create_directories("a/b/c/d");

// 删除文件或目录
fs::remove("file.txt");
fs::remove_all("folder");

// 重命名
fs::rename("old.txt", "new.txt");

// 复制文件
fs::copy_file("src.txt", "dst.txt");
\`\`\`

### 目录遍历

\`\`\`cpp
// 遍历目录
for (const auto& entry : fs::directory_iterator("folder")) {
    std::cout << entry.path() << std::endl;
}

// 递归遍历
for (const auto& entry : fs::recursive_directory_iterator("folder")) {
    std::cout << entry.path() << std::endl;
}
\`\`\``,
            examples: [
                {
                    title: '文件系统基础',
                    code: `#include <iostream>
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

int main() {
    // 当前路径
    std::cout << "=== 当前路径 ===" << std::endl;
    std::cout << "当前目录: " << fs::current_path() << std::endl;
    
    // 创建测试目录
    fs::path testDir = fs::current_path() / "test_fs";
    fs::create_directories(testDir / "subdir");
    
    std::cout << "\\n=== 创建目录 ===" << std::endl;
    std::cout << "创建目录: " << testDir << std::endl;
    
    // 创建测试文件
    std::ofstream(testDir / "file1.txt") << "Hello";
    std::ofstream(testDir / "file2.txt") << "World";
    
    // 路径操作
    std::cout << "\\n=== 路径操作 ===" << std::endl;
    fs::path p = testDir / "file1.txt";
    std::cout << "完整路径: " << p << std::endl;
    std::cout << "文件名: " << p.filename() << std::endl;
    std::cout << "扩展名: " << p.extension() << std::endl;
    
    // 文件信息
    std::cout << "\\n=== 文件信息 ===" << std::endl;
    std::cout << "文件大小: " << fs::file_size(p) << " 字节" << std::endl;
    
    // 目录遍历
    std::cout << "\\n=== 目录遍历 ===" << std::endl;
    for (const auto& entry : fs::directory_iterator(testDir)) {
        std::cout << entry.path().filename();
        if (fs::is_directory(entry)) {
            std::cout << "/";
        }
        std::cout << std::endl;
    }
    
    // 清理
    fs::remove_all(testDir);
    std::cout << "\\n已清理测试目录" << std::endl;
    
    return 0;
}`,
                    description: '展示文件系统库的基本操作。'
                },
                {
                    title: '文件搜索工具',
                    code: `#include <iostream>
#include <filesystem>
#include <vector>
#include <string>

namespace fs = std::filesystem;

// 查找指定扩展名的文件
std::vector<fs::path> findFiles(const fs::path& dir, const std::string& ext) {
    std::vector<fs::path> result;
    
    for (const auto& entry : fs::recursive_directory_iterator(dir)) {
        if (fs::is_regular_file(entry) && 
            entry.path().extension() == ext) {
            result.push_back(entry.path());
        }
    }
    
    return result;
}

// 获取目录大小
uintmax_t getDirectorySize(const fs::path& dir) {
    uintmax_t size = 0;
    
    for (const auto& entry : fs::recursive_directory_iterator(dir)) {
        if (fs::is_regular_file(entry)) {
            size += fs::file_size(entry);
        }
    }
    
    return size;
}

int main() {
    fs::path currentDir = fs::current_path();
    
    std::cout << "=== 查找 .txt 文件 ===" << std::endl;
    auto txtFiles = findFiles(currentDir, ".txt");
    
    for (const auto& file : txtFiles) {
        std::cout << file.filename() << " (" 
                  << fs::file_size(file) << " bytes)" << std::endl;
    }
    
    std::cout << "\\n=== 目录大小 ===" << std::endl;
    std::cout << "当前目录大小: " << getDirectorySize(currentDir) 
              << " 字节" << std::endl;
    
    return 0;
}`,
                    description: '展示文件搜索和目录大小统计。'
                }
            ],
            handsOn: {
                title: '实现文件管理器',
                description: '使用文件系统库实现一个简单的文件管理器。',
                initialCode: `#include <iostream>
#include <filesystem>
#include <string>
#include <vector>

namespace fs = std::filesystem;

class FileManager {
private:
    fs::path currentPath;
    
public:
    FileManager() : currentPath(fs::current_path()) {}
    
    // 列出当前目录内容
    void listDirectory() {
        // TODO: 列出当前目录的文件和子目录
    }
    
    // 切换目录
    bool changeDirectory(const std::string& dir) {
        // TODO: 切换到指定目录
        return false;
    }
    
    // 创建目录
    bool createDirectory(const std::string& name) {
        // TODO: 创建目录
        return false;
    }
    
    // 删除文件或目录
    bool remove(const std::string& name) {
        // TODO: 删除文件或目录
        return false;
    }
    
    // 复制文件
    bool copyFile(const std::string& src, const std::string& dst) {
        // TODO: 复制文件
        return false;
    }
    
    // 显示当前路径
    void printCurrentPath() const {
        std::cout << "当前路径: " << currentPath << std::endl;
    }
};

int main() {
    FileManager fm;
    
    fm.printCurrentPath();
    
    std::cout << "\\n=== 目录列表 ===" << std::endl;
    fm.listDirectory();
    
    std::cout << "\\n=== 创建目录 ===" << std::endl;
    fm.createDirectory("test_dir");
    fm.listDirectory();
    
    std::cout << "\\n=== 删除目录 ===" << std::endl;
    fm.remove("test_dir");
    fm.listDirectory();
    
    return 0;
}`,
                expectedOutput: `当前路径: C:\\Users\\...\\current_path

=== 目录列表 ===
[DIR] folder1
[DIR] folder2
[FILE] file1.txt (100 bytes)
[FILE] file2.txt (200 bytes)

=== 创建目录 ===
[DIR] folder1
[DIR] folder2
[DIR] test_dir
[FILE] file1.txt (100 bytes)
[FILE] file2.txt (200 bytes)

=== 删除目录 ===
[DIR] folder1
[DIR] folder2
[FILE] file1.txt (100 bytes)
[FILE] file2.txt (200 bytes)`,
                solutionRegex: 'directory_iterator|is_directory|is_regular_file|create_directory|remove',
                hint: '使用directory_iterator遍历，is_directory判断类型，create_directory创建',
                xp: 200
            },
            references: [
                { title: '文件系统库', book: 'C++17 - The Complete Guide', chapter: '第7章' }
            ],
            assistantTips: [
                '使用fs::path处理跨平台路径',
                'directory_iterator遍历单层目录',
                'recursive_directory_iterator递归遍历',
                '使用fs::exists检查文件是否存在'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'fs::path的 / 操作符用于？', 
                    options: [
                        { text: '除法运算' }, 
                        { text: '路径拼接', correct: true }, 
                        { text: '路径比较' }, 
                        { text: '路径分割' }
                    ], 
                    explanation: 'fs::path的 / 操作符用于拼接路径组件。' 
                },
                { 
                    type: 'single', 
                    question: 'directory_iterator和recursive_directory_iterator的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: '后者递归遍历子目录', correct: true }, 
                        { text: '前者更快' }, 
                        { text: '后者只能遍历文件' }
                    ], 
                    explanation: 'recursive_directory_iterator会递归遍历所有子目录。' 
                },
                { 
                    type: 'single', 
                    question: '如何获取文件大小？', 
                    options: [
                        { text: 'fs::size()' }, 
                        { text: 'fs::file_size()', correct: true }, 
                        { text: 'fs::get_size()' }, 
                        { text: 'fs::length()' }
                    ], 
                    explanation: 'fs::file_size()返回文件大小（字节数）。' 
                },
                { 
                    type: 'single', 
                    question: 'create_directories和create_directory的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: '前者创建多级目录', correct: true }, 
                        { text: '后者创建多级目录' }, 
                        { text: '前者更快' }
                    ], 
                    explanation: 'create_directories会创建所有不存在的父目录。' 
                },
                { 
                    type: 'single', 
                    question: 'path.filename()返回什么？', 
                    options: [
                        { text: '完整路径' }, 
                        { text: '文件名（含扩展名）', correct: true }, 
                        { text: '文件名（不含扩展名）' }, 
                        { text: '扩展名' }
                    ], 
                    explanation: 'filename()返回路径中的文件名部分（包含扩展名）。' 
                }
            ]
        },
        {
            id: '18.9',
            title: '序列化与反序列化基础',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 序列化与反序列化基础

### 序列化概述

序列化是将对象转换为可存储或传输的格式，反序列化是反向过程。

\`\`\`cpp
// 序列化：对象 -> 字节流
// 反序列化：字节流 -> 对象
\`\`\`

### 二进制序列化

\`\`\`cpp
#include <fstream>

struct Person {
    int id;
    char name[50];
    int age;
    
    // 序列化
    void serialize(std::ofstream& out) const {
        out.write(reinterpret_cast<const char*>(&id), sizeof(id));
        out.write(name, sizeof(name));
        out.write(reinterpret_cast<const char*>(&age), sizeof(age));
    }
    
    // 反序列化
    void deserialize(std::ifstream& in) {
        in.read(reinterpret_cast<char*>(&id), sizeof(id));
        in.read(name, sizeof(name));
        in.read(reinterpret_cast<char*>(&age), sizeof(age));
    }
};
\`\`\`

### 文本序列化

\`\`\`cpp
#include <fstream>
#include <sstream>

struct Person {
    int id;
    std::string name;
    int age;
    
    // 序列化为文本
    std::string serialize() const {
        std::ostringstream oss;
        oss << id << "," << name << "," << age;
        return oss.str();
    }
    
    // 从文本反序列化
    static Person deserialize(const std::string& str) {
        Person p;
        std::istringstream iss(str);
        std::string idStr, ageStr;
        
        std::getline(iss, idStr, ',');
        std::getline(iss, p.name, ',');
        std::getline(iss, ageStr);
        
        p.id = std::stoi(idStr);
        p.age = std::stoi(ageStr);
        
        return p;
    }
};
\`\`\`

### JSON格式序列化（简化版）

\`\`\`cpp
#include <string>
#include <sstream>

struct Person {
    int id;
    std::string name;
    int age;
    
    // 序列化为JSON
    std::string toJson() const {
        std::ostringstream oss;
        oss << "{\\n";
        oss << "  \\"id\\": " << id << ",\\n";
        oss << "  \\"name\\": \\"" << name << "\\",\\n";
        oss << "  \\"age\\": " << age << "\\n";
        oss << "}";
        return oss.str();
    }
};
\`\`\`

### 注意事项

1. **版本兼容性**：数据格式变化时需要处理版本
2. **字节序**：不同平台可能需要处理大小端
3. **指针和引用**：不能直接序列化
4. **动态内存**：需要特殊处理`,
            examples: [
                {
                    title: '二进制序列化',
                    code: `#include <iostream>
#include <fstream>
#include <string>

struct Person {
    int id;
    char name[50];
    int age;
    
    Person() : id(0), age(0) {
        name[0] = '\\0';
    }
    
    Person(int i, const std::string& n, int a) : id(i), age(a) {
        strncpy(name, n.c_str(), 49);
        name[49] = '\\0';
    }
    
    void print() const {
        std::cout << "ID: " << id << ", 姓名: " << name 
                  << ", 年龄: " << age << std::endl;
    }
};

int main() {
    const std::string filename = "persons.bin";
    
    // 序列化
    std::cout << "=== 序列化 ===" << std::endl;
    {
        std::ofstream out(filename, std::ios::binary);
        
        Person p1(1, "张三", 25);
        Person p2(2, "李四", 30);
        
        out.write(reinterpret_cast<const char*>(&p1), sizeof(Person));
        out.write(reinterpret_cast<const char*>(&p2), sizeof(Person));
        
        p1.print();
        p2.print();
    }
    
    // 反序列化
    std::cout << "\\n=== 反序列化 ===" << std::endl;
    {
        std::ifstream in(filename, std::ios::binary);
        
        Person p;
        while (in.read(reinterpret_cast<char*>(&p), sizeof(Person))) {
            p.print();
        }
    }
    
    return 0;
}`,
                    description: '展示二进制序列化和反序列化。'
                },
                {
                    title: '文本序列化',
                    code: `#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>

struct Person {
    int id;
    std::string name;
    int age;
    
    Person() : id(0), age(0) {}
    Person(int i, const std::string& n, int a) : id(i), name(n), age(a) {}
    
    // 序列化为CSV格式
    std::string serialize() const {
        std::ostringstream oss;
        oss << id << "," << name << "," << age;
        return oss.str();
    }
    
    // 从CSV反序列化
    static Person deserialize(const std::string& str) {
        Person p;
        std::istringstream iss(str);
        std::string idStr, ageStr;
        
        std::getline(iss, idStr, ',');
        std::getline(iss, p.name, ',');
        std::getline(iss, ageStr);
        
        p.id = std::stoi(idStr);
        p.age = std::stoi(ageStr);
        
        return p;
    }
    
    void print() const {
        std::cout << "ID: " << id << ", 姓名: " << name 
                  << ", 年龄: " << age << std::endl;
    }
};

int main() {
    const std::string filename = "persons.csv";
    
    // 序列化
    std::cout << "=== 序列化 ===" << std::endl;
    {
        std::ofstream out(filename);
        
        std::vector<Person> persons = {
            Person(1, "张三", 25),
            Person(2, "李四", 30),
            Person(3, "王五", 28)
        };
        
        for (const auto& p : persons) {
            out << p.serialize() << std::endl;
            p.print();
        }
    }
    
    // 反序列化
    std::cout << "\\n=== 反序列化 ===" << std::endl;
    {
        std::ifstream in(filename);
        std::string line;
        
        while (std::getline(in, line)) {
            Person p = Person::deserialize(line);
            p.print();
        }
    }
    
    return 0;
}`,
                    description: '展示文本序列化和反序列化。'
                }
            ],
            handsOn: {
                title: '实现简单序列化框架',
                description: '实现一个支持多种数据类型的简单序列化框架。',
                initialCode: `#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <map>

class Serializer {
public:
    // 序列化整数
    static void writeInt(std::ostream& out, int value) {
        // TODO: 实现整数序列化
    }
    
    // 序列化字符串
    static void writeString(std::ostream& out, const std::string& str) {
        // TODO: 实现字符串序列化
        // 格式: 长度 + 内容
    }
    
    // 反序列化整数
    static int readInt(std::istream& in) {
        // TODO: 实现整数反序列化
        return 0;
    }
    
    // 反序列化字符串
    static std::string readString(std::istream& in) {
        // TODO: 实现字符串反序列化
        return "";
    }
};

struct Student {
    int id;
    std::string name;
    std::vector<int> scores;
    
    void serialize(std::ostream& out) const {
        // TODO: 使用Serializer序列化
    }
    
    void deserialize(std::istream& in) {
        // TODO: 使用Serializer反序列化
    }
    
    void print() const {
        std::cout << "ID: " << id << ", 姓名: " << name 
                  << ", 成绩: ";
        for (int s : scores) {
            std::cout << s << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    const std::string filename = "students.dat";
    
    // 序列化
    std::cout << "=== 序列化 ===" << std::endl;
    {
        std::ofstream out(filename, std::ios::binary);
        
        Student s1 = {101, "张三", {85, 90, 88}};
        Student s2 = {102, "李四", {92, 88, 95}};
        
        s1.serialize(out);
        s2.serialize(out);
        
        s1.print();
        s2.print();
    }
    
    // 反序列化
    std::cout << "\\n=== 反序列化 ===" << std::endl;
    {
        std::ifstream in(filename, std::ios::binary);
        
        Student s;
        while (in.peek() != EOF) {
            s.deserialize(in);
            s.print();
        }
    }
    
    return 0;
}`,
                expectedOutput: `=== 序列化 ===
ID: 101, 姓名: 张三, 成绩: 85 90 88 
ID: 102, 姓名: 李四, 成绩: 92 88 95 

=== 反序列化 ===
ID: 101, 姓名: 张三, 成绩: 85 90 88 
ID: 102, 姓名: 李四, 成绩: 92 88 95`,
                solutionRegex: 'write|read|sizeof|reinterpret_cast|ostringstream|istringstream',
                hint: '使用write/read进行二进制序列化，ostringstream/istringstream进行文本序列化',
                xp: 200
            },
            references: [
                { title: '序列化', book: 'C++ Primer 第五版', chapter: '第8章' }
            ],
            assistantTips: [
                '二进制序列化效率高但不跨平台',
                '文本序列化可读性好但效率低',
                '注意处理字节序问题',
                '指针和动态内存需要特殊处理'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '序列化的主要目的是？', 
                    options: [
                        { text: '提高程序性能' }, 
                        { text: '将对象转换为可存储或传输的格式', correct: true }, 
                        { text: '加密数据' }, 
                        { text: '压缩数据' }
                    ], 
                    explanation: '序列化是将对象转换为可存储或传输的格式。' 
                },
                { 
                    type: 'single', 
                    question: '二进制序列化的优点是？', 
                    options: [
                        { text: '可读性好' }, 
                        { text: '效率高、体积小', correct: true }, 
                        { text: '跨平台' }, 
                        { text: '易于调试' }
                    ], 
                    explanation: '二进制序列化效率高、体积小，但可读性差。' 
                },
                { 
                    type: 'single', 
                    question: '文本序列化的优点是？', 
                    options: [
                        { text: '效率高' }, 
                        { text: '体积小' }, 
                        { text: '可读性好、跨平台', correct: true }, 
                        { text: '速度快' }
                    ], 
                    explanation: '文本序列化可读性好、跨平台，但效率较低。' 
                },
                { 
                    type: 'single', 
                    question: '序列化指针时需要注意什么？', 
                    options: [
                        { text: '可以直接序列化' }, 
                        { text: '指针不能直接序列化', correct: true }, 
                        { text: '需要转换为整数' }, 
                        { text: '需要加密' }
                    ], 
                    explanation: '指针存储的是内存地址，不能直接序列化。' 
                },
                { 
                    type: 'single', 
                    question: '字节序问题出现在什么情况下？', 
                    options: [
                        { text: '同一平台' }, 
                        { text: '不同平台之间传输数据', correct: true }, 
                        { text: '文本序列化' }, 
                        { text: 'JSON格式' }
                    ], 
                    explanation: '不同平台可能使用不同的字节序（大端/小端）。' 
                }
            ]
        }
    ]
};

window.Unit18Data = Unit18Data;
