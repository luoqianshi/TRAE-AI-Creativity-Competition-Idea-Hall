/**
 * 单元19：其他标准库组件
 */
const Unit19Data = {
    id: 19,
    title: '其他标准库组件',
    description: '掌握C++标准库中的正则表达式、随机数生成、时间处理、元组、bitset、分配器、valarray和数学函数等组件',
    lessons: [
        {
            id: '19.1',
            title: '正则表达式（regex）',
            duration: '50分钟',
            difficulty: '进阶',
            xp: 150,
            estimatedXp: 400,
            concepts: `## 正则表达式（regex）

### 什么是正则表达式？

正则表达式是一种用于匹配字符串模式的强大工具。C++11引入了<regex>库。

\`\`\`cpp
#include <regex>
#include <string>

std::regex pattern(R"(\\d+)");  // 匹配数字
\`\`\`

### 基本组件

#### 1. regex类

\`\`\`cpp
// 构造正则表达式对象
std::regex r1("pattern");
std::regex r2(R"(\\d{3}-\\d{4})");  // 原始字符串字面量

// 正则表达式语法类型
std::regex r3("pattern", std::regex::ECMAScript);  // 默认
std::regex r4("pattern", std::regex::basic);
std::regex r5("pattern", std::regex::extended);
\`\`\`

#### 2. 匹配函数

\`\`\`cpp
#include <regex>

std::string text = "Hello 123 World 456";
std::regex pattern(R"(\\d+)");

// regex_match：整个字符串必须匹配
bool match1 = std::regex_match("123", pattern);  // true
bool match2 = std::regex_match("abc", pattern);  // false

// regex_search：搜索匹配的子串
bool found = std::regex_search(text, pattern);  // true

// regex_replace：替换匹配的子串
std::string result = std::regex_replace(text, pattern, "NUM");
// "Hello NUM World NUM"
\`\`\`

### 正则表达式语法

#### 常用元字符

| 元字符 | 含义 | 示例 |
|--------|------|------|
| . | 任意单个字符 | a.c 匹配 abc, a1c |
| ^ | 行首 | ^Hello 匹配开头的Hello |
| $ | 行尾 | World$ 匹配结尾的World |
| * | 0次或多次 | ab* 匹配 a, ab, abb... |
| + | 1次或多次 | ab+ 匹配 ab, abb... |
| ? | 0次或1次 | ab? 匹配 a, ab |
| | | 或 | a|b 匹配 a 或 b |
| [] | 字符集 | [abc] 匹配 a, b, c |
| [^] | 否定字符集 | [^abc] 匹配非a,b,c |
| () | 分组 | (ab)+ 匹配 ab, abab... |

#### 预定义字符类

| 字符类 | 含义 | 等价形式 |
|--------|------|----------|
| \\d | 数字 | [0-9] |
| \\D | 非数字 | [^0-9] |
| \\w | 单词字符 | [a-zA-Z0-9_] |
| \\W | 非单词字符 | [^a-zA-Z0-9_] |
| \\s | 空白字符 | [ \\t\\n\\r\\f] |
| \\S | 非空白字符 | [^ \\t\\n\\r\\f] |

#### 量词

\`\`\`cpp
// 贪婪量词（默认）
std::regex r1("a*");   // 匹配尽可能多的a
std::regex r2("a+");   // 匹配至少一个a
std::regex r3("a?");   // 匹配0或1个a
std::regex r4("a{n}"); // 恰好n个a
std::regex r5("a{n,}");// 至少n个a
std::regex r6("a{n,m}");// n到m个a

// 非贪婪量词（加?）
std::regex r7("a*?");  // 匹配尽可能少的a
std::regex r8("a+?");  // 匹配至少一个，但尽可能少
\`\`\`

### 匹配结果

#### smatch类

\`\`\`cpp
#include <regex>

std::string text = "2023-12-25";
std::regex pattern(R"((\\d{4})-(\\d{2})-(\\d{2}))");
std::smatch match;

if (std::regex_search(text, match, pattern)) {
    std::cout << "完整匹配: " << match[0] << std::endl;  // 2023-12-25
    std::cout << "年份: " << match[1] << std::endl;      // 2023
    std::cout << "月份: " << match[2] << std::endl;      // 12
    std::cout << "日期: " << match[3] << std::endl;      // 25
    
    // 位置信息
    std::cout << "位置: " << match.position() << std::endl;
    std::cout << "长度: " << match.length() << std::endl;
}
\`\`\`

#### 迭代匹配

\`\`\`cpp
std::string text = "Hello 123 World 456 Test 789";
std::regex pattern(R"(\\d+)");
std::sregex_iterator it(text.begin(), text.end(), pattern);
std::sregex_iterator end;

while (it != end) {
    std::smatch match = *it;
    std::cout << match.str() << " ";
    ++it;
}
// 输出: 123 456 789
\`\`\`

### 实用示例

#### 验证邮箱

\`\`\`cpp
bool isValidEmail(const std::string& email) {
    std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
    return std::regex_match(email, pattern);
}
\`\`\`

#### 验证手机号

\`\`\`cpp
bool isValidPhone(const std::string& phone) {
    std::regex pattern(R"(1[3-9]\\d{9})");
    return std::regex_match(phone, pattern);
}
\`\`\`

#### 提取URL

\`\`\`cpp
std::vector<std::string> extractUrls(const std::string& text) {
    std::regex pattern(R"(https?://[\\w.-]+(?:/[\\w./-]*)?)");
    std::sregex_iterator it(text.begin(), text.end(), pattern);
    std::sregex_iterator end;
    
    std::vector<std::string> urls;
    while (it != end) {
        urls.push_back(it->str());
        ++it;
    }
    return urls;
}
\`\`\``,
            examples: [
                {
                    title: '正则表达式基本使用',
                    code: `#include <iostream>
#include <regex>
#include <string>

int main() {
    std::string text = "Hello 123 World 456";
    
    // 1. regex_match - 整个字符串匹配
    std::regex numPattern(R"(\\d+)");
    std::cout << "regex_match测试:" << std::endl;
    std::cout << "  '123' 匹配数字: " << std::regex_match("123", numPattern) << std::endl;
    std::cout << "  'abc' 匹配数字: " << std::regex_match("abc", numPattern) << std::endl;
    
    // 2. regex_search - 搜索匹配
    std::cout << "\\nregex_search测试:" << std::endl;
    std::cout << "  文本中包含数字: " << std::regex_search(text, numPattern) << std::endl;
    
    // 3. regex_replace - 替换
    std::string replaced = std::regex_replace(text, numPattern, "NUM");
    std::cout << "\\nregex_replace测试:" << std::endl;
    std::cout << "  原文本: " << text << std::endl;
    std::cout << "  替换后: " << replaced << std::endl;
    
    // 4. 提取匹配结果
    std::string date = "2023-12-25";
    std::regex datePattern(R"((\\d{4})-(\\d{2})-(\\d{2}))");
    std::smatch match;
    
    std::cout << "\\n提取日期:" << std::endl;
    if (std::regex_search(date, match, datePattern)) {
        std::cout << "  完整日期: " << match[0] << std::endl;
        std::cout << "  年: " << match[1] << std::endl;
        std::cout << "  月: " << match[2] << std::endl;
        std::cout << "  日: " << match[3] << std::endl;
    }
    
    return 0;
}`,
                    description: '展示正则表达式的基本使用方法。'
                },
                {
                    title: '正则表达式实用示例',
                    code: `#include <iostream>
#include <regex>
#include <string>
#include <vector>

// 验证邮箱
bool isValidEmail(const std::string& email) {
    std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
    return std::regex_match(email, pattern);
}

// 验证手机号
bool isValidPhone(const std::string& phone) {
    std::regex pattern(R"(1[3-9]\\d{9})");
    return std::regex_match(phone, pattern);
}

// 提取所有数字
std::vector<std::string> extractNumbers(const std::string& text) {
    std::regex pattern(R"(\\d+)");
    std::sregex_iterator it(text.begin(), text.end(), pattern);
    std::sregex_iterator end;
    
    std::vector<std::string> numbers;
    while (it != end) {
        numbers.push_back(it->str());
        ++it;
    }
    return numbers;
}

// 分割字符串
std::vector<std::string> splitByRegex(const std::string& text, const std::string& delim) {
    std::regex pattern(delim);
    std::sregex_token_iterator it(text.begin(), text.end(), pattern, -1);
    std::sregex_token_iterator end;
    
    return std::vector<std::string>(it, end);
}

int main() {
    // 测试邮箱验证
    std::cout << "邮箱验证:" << std::endl;
    std::cout << "  test@example.com: " << isValidEmail("test@example.com") << std::endl;
    std::cout << "  invalid-email: " << isValidEmail("invalid-email") << std::endl;
    
    // 测试手机号验证
    std::cout << "\\n手机号验证:" << std::endl;
    std::cout << "  13812345678: " << isValidPhone("13812345678") << std::endl;
    std::cout << "  12345678901: " << isValidPhone("12345678901") << std::endl;
    
    // 提取数字
    std::string text = "价格: 100元, 数量: 5个, 总价: 500元";
    std::cout << "\\n提取数字:" << std::endl;
    std::cout << "  文本: " << text << std::endl;
    auto numbers = extractNumbers(text);
    std::cout << "  数字: ";
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    // 分割字符串
    std::string csv = "apple,banana,cherry";
    std::cout << "\\n分割字符串:" << std::endl;
    std::cout << "  原字符串: " << csv << std::endl;
    auto parts = splitByRegex(csv, ",");
    std::cout << "  分割结果: ";
    for (const auto& part : parts) {
        std::cout << "[" << part << "] ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示正则表达式的实用示例。'
                }
            ],
            handsOn: {
                title: '实现文本处理工具',
                description: '使用正则表达式实现文本验证和提取功能。',
                initialCode: `#include <iostream>
#include <regex>
#include <string>
#include <vector>

// TODO: 实现IP地址验证
// IPv4格式: xxx.xxx.xxx.xxx (每个xxx范围0-255)
bool isValidIPv4(const std::string& ip) {
    // TODO: 使用正则表达式验证IP地址
    return false;
}

// TODO: 实现提取所有邮箱地址
std::vector<std::string> extractEmails(const std::string& text) {
    // TODO: 使用正则表达式提取所有邮箱地址
    return {};
}

// TODO: 实现简单模板替换
// 将模板中的{{name}}替换为实际值
std::string renderTemplate(const std::string& tmpl, 
                           const std::string& name,
                           const std::string& value) {
    // TODO: 使用regex_replace实现模板替换
    return tmpl;
}

// TODO: 实现密码强度验证
// 要求: 至少8位，包含大小写字母和数字
bool isStrongPassword(const std::string& password) {
    // TODO: 使用正则表达式验证密码强度
    return false;
}

int main() {
    // 测试IP验证
    std::cout << "IP地址验证:" << std::endl;
    std::cout << "  192.168.1.1: " << isValidIPv4("192.168.1.1") << std::endl;
    std::cout << "  256.1.1.1: " << isValidIPv4("256.1.1.1") << std::endl;
    std::cout << "  1.1.1: " << isValidIPv4("1.1.1") << std::endl;
    
    // 测试邮箱提取
    std::string text = "联系我们: support@example.com 或 sales@test.org";
    std::cout << "\\n邮箱提取:" << std::endl;
    std::cout << "  文本: " << text << std::endl;
    auto emails = extractEmails(text);
    std::cout << "  邮箱: ";
    for (const auto& email : emails) {
        std::cout << email << " ";
    }
    std::cout << std::endl;
    
    // 测试模板替换
    std::string tmpl = "Hello, {{name}}! Welcome to {{name}}'s page.";
    std::cout << "\\n模板替换:" << std::endl;
    std::cout << "  原模板: " << tmpl << std::endl;
    std::cout << "  替换后: " << renderTemplate(tmpl, "name", "Alice") << std::endl;
    
    // 测试密码验证
    std::cout << "\\n密码强度验证:" << std::endl;
    std::cout << "  'Password1': " << isStrongPassword("Password1") << std::endl;
    std::cout << "  'weak': " << isStrongPassword("weak") << std::endl;
    std::cout << "  'NoDigits': " << isStrongPassword("NoDigits") << std::endl;
    
    return 0;
}`,
                expectedOutput: `IP地址验证:
  192.168.1.1: 1
  256.1.1.1: 0
  1.1.1: 0

邮箱提取:
  文本: 联系我们: support@example.com 或 sales@test.org
  邮箱: support@example.com sales@test.org 

模板替换:
  原模板: Hello, {{name}}! Welcome to {{name}}'s page.
  替换后: Hello, Alice! Welcome to Alice's page.

密码强度验证:
  'Password1': 1
  'weak': 0
  'NoDigits': 0`,
                solutionRegex: 'regex|regex_match|regex_search|regex_replace|smatch',
                hint: 'IP验证用分组匹配每段数字，邮箱用标准模式，模板用regex_replace，密码用多个条件',
                xp: 200
            },
            references: [
                { title: '正则表达式', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: 'regex库', book: 'C++标准库', chapter: '正则表达式' }
            ],
            assistantTips: [
                '使用原始字符串字面量R"(...)"避免转义',
                'regex_match要求整个字符串匹配',
                'regex_search搜索子串匹配',
                '使用sregex_iterator迭代所有匹配'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'regex_match和regex_search的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'regex_match要求整个字符串匹配，regex_search搜索子串', correct: true }, 
                        { text: 'regex_search更快' }, 
                        { text: 'regex_match只匹配数字' }
                    ], 
                    explanation: 'regex_match要求整个字符串完全匹配，regex_search只需要找到匹配的子串。' 
                },
                { 
                    type: 'single', 
                    question: '\\\\d在正则表达式中表示什么？', 
                    options: [
                        { text: '字母d' }, 
                        { text: '数字字符[0-9]', correct: true }, 
                        { text: '任意字符' }, 
                        { text: '空白字符' }
                    ], 
                    explanation: '\\\\d是预定义字符类，等价于[0-9]，匹配任意数字字符。' 
                },
                { 
                    type: 'single', 
                    question: '如何匹配"至少3个数字"？', 
                    options: [
                        { text: '\\\\d{3}' }, 
                        { text: '\\\\d{3,}', correct: true }, 
                        { text: '\\\\d*3' }, 
                        { text: '\\\\d+3' }
                    ], 
                    explanation: '{n,}表示至少n次，\\\\d{3,}匹配至少3个数字。' 
                },
                { 
                    type: 'single', 
                    question: 'smatch[0]返回什么？', 
                    options: [
                        { text: '第一个捕获组' }, 
                        { text: '完整匹配的字符串', correct: true }, 
                        { text: '匹配前的字符串' }, 
                        { text: '匹配后的字符串' }
                    ], 
                    explanation: 'smatch[0]返回整个匹配的字符串，smatch[1]开始是捕获组。' 
                },
                { 
                    type: 'single', 
                    question: '为什么要使用原始字符串字面量R"(...)"？', 
                    options: [
                        { text: '性能更好' }, 
                        { text: '避免转义反斜杠', correct: true }, 
                        { text: '支持更多语法' }, 
                        { text: '更安全' }
                    ], 
                    explanation: '正则表达式中大量使用反斜杠，原始字符串避免双重转义。' 
                }
            ]
        },
        {
            id: '19.2',
            title: '随机数生成（random）',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 380,
            concepts: `## 随机数生成（random）

### C++随机数库概述

C++11引入了<random>库，提供高质量的随机数生成器。

\`\`\`cpp
#include <random>

// 传统方式（不推荐）
srand(time(0));
int r = rand();

// 现代方式（推荐）
std::random_device rd;
std::mt19937 gen(rd());
int r = gen();
\`\`\`

### 随机数引擎

随机数引擎负责生成随机数序列。

#### 1. random_device

真随机数生成器（如果硬件支持）。

\`\`\`cpp
#include <random>

std::random_device rd;
unsigned int seed = rd();  // 获取随机种子
\`\`\`

#### 2. 伪随机数引擎

\`\`\`cpp
#include <random>

// Mersenne Twister引擎（最常用）
std::mt19937 gen1;  // 32位
std::mt19937_64 gen2;  // 64位

// 线性同余引擎
std::minstd_rand gen3;

// 混合引擎
std::ranlux24 gen4;
std::ranlux48 gen5;
\`\`\`

#### 3. 使用种子

\`\`\`cpp
std::random_device rd;
std::mt19937 gen(rd());  // 使用真随机数作为种子

// 或使用固定种子（可重现）
std::mt19937 gen2(42);
\`\`\`

### 随机数分布

分布将引擎生成的随机数映射到特定范围或分布。

#### 均匀分布

\`\`\`cpp
#include <random>

std::random_device rd;
std::mt19937 gen(rd());

// 均匀整数分布
std::uniform_int_distribution<> dis1(1, 100);  // [1, 100]
int r1 = dis1(gen);

// 均匀浮点分布
std::uniform_real_distribution<> dis2(0.0, 1.0);  // [0.0, 1.0)
double r2 = dis2(gen);
\`\`\`

#### 正态分布

\`\`\`cpp
std::random_device rd;
std::mt19937 gen(rd());

// 正态分布
std::normal_distribution<> dis(0.0, 1.0);  // 均值0，标准差1
double r = dis(gen);
\`\`\`

#### 其他分布

\`\`\`cpp
std::random_device rd;
std::mt19937 gen(rd());

// 伯努利分布
std::bernoulli_distribution bern(0.7);  // 70%概率为true
bool b = bern(gen);

// 二项分布
std::binomial_distribution<> bin(10, 0.5);  // n=10, p=0.5
int k = bin(gen);

// 泊松分布
std::poisson_distribution<> poi(4.0);  // λ=4
int n = poi(gen);

// 指数分布
std::exponential_distribution<> exp(1.0);  // λ=1
double t = exp(gen);
\`\`\`

### 实用示例

#### 生成指定范围的随机整数

\`\`\`cpp
int randomInt(int min, int max) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(min, max);
    return dis(gen);
}
\`\`\`

#### 生成随机浮点数

\`\`\`cpp
double randomDouble(double min, double max) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(min, max);
    return dis(gen);
}
\`\`\`

#### 随机打乱容器

\`\`\`cpp
#include <algorithm>
#include <random>
#include <vector>

std::vector<int> vec = {1, 2, 3, 4, 5};
std::random_device rd;
std::mt19937 gen(rd());
std::shuffle(vec.begin(), vec.end(), gen);
\`\`\`

#### 随机选择元素

\`\`\`cpp
#include <random>
#include <vector>

template<typename T>
const T& randomChoice(const std::vector<T>& vec) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<size_t> dis(0, vec.size() - 1);
    return vec[dis(gen)];
}
\`\`\`

### 性能考虑

\`\`\`cpp
// 不推荐：每次调用都创建引擎
int badRandom() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 100);
    return dis(gen);
}

// 推荐：复用引擎
class RandomGenerator {
private:
    std::random_device rd;
    std::mt19937 gen;
    std::uniform_int_distribution<> dis;
    
public:
    RandomGenerator(int min, int max) 
        : gen(rd()), dis(min, max) {}
    
    int next() { return dis(gen); }
};
\`\`\``,
            examples: [
                {
                    title: '随机数基本使用',
                    code: `#include <iostream>
#include <random>
#include <vector>
#include <algorithm>

int main() {
    std::random_device rd;
    std::mt19937 gen(rd());
    
    // 1. 均匀整数分布
    std::cout << "均匀整数分布 [1, 100]:" << std::endl;
    std::uniform_int_distribution<> intDis(1, 100);
    for (int i = 0; i < 5; ++i) {
        std::cout << intDis(gen) << " ";
    }
    std::cout << std::endl;
    
    // 2. 均匀浮点分布
    std::cout << "\\n均匀浮点分布 [0.0, 1.0]:" << std::endl;
    std::uniform_real_distribution<> realDis(0.0, 1.0);
    for (int i = 0; i < 5; ++i) {
        std::cout << realDis(gen) << " ";
    }
    std::cout << std::endl;
    
    // 3. 正态分布
    std::cout << "\\n正态分布 (均值=50, 标准差=10):" << std::endl;
    std::normal_distribution<> normDis(50.0, 10.0);
    for (int i = 0; i < 5; ++i) {
        std::cout << normDis(gen) << " ";
    }
    std::cout << std::endl;
    
    // 4. 随机打乱
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::shuffle(vec.begin(), vec.end(), gen);
    std::cout << "\\n随机打乱: ";
    for (int v : vec) {
        std::cout << v << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示随机数生成的基本使用。'
                },
                {
                    title: '模拟掷骰子和抽奖',
                    code: `#include <iostream>
#include <random>
#include <vector>
#include <map>

// 模拟掷骰子
void simulateDice(int times) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 6);
    
    std::map<int, int> counts;
    for (int i = 0; i < times; ++i) {
        int result = dis(gen);
        counts[result]++;
    }
    
    std::cout << "掷骰子 " << times << " 次结果:" << std::endl;
    for (const auto& [num, count] : counts) {
        std::cout << "  " << num << ": " << count 
                  << " (" << (count * 100.0 / times) << "%)" << std::endl;
    }
}

// 模拟抽奖
void simulateLottery(const std::vector<std::string>& prizes, 
                     const std::vector<double>& weights,
                     int times) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::discrete_distribution<> dis(weights.begin(), weights.end());
    
    std::map<std::string, int> counts;
    for (int i = 0; i < times; ++i) {
        int idx = dis(gen);
        counts[prizes[idx]]++;
    }
    
    std::cout << "\\n抽奖 " << times << " 次结果:" << std::endl;
    for (const auto& [prize, count] : counts) {
        std::cout << "  " << prize << ": " << count 
                  << " (" << (count * 100.0 / times) << "%)" << std::endl;
    }
}

int main() {
    // 模拟掷骰子
    simulateDice(10000);
    
    // 模拟抽奖
    std::vector<std::string> prizes = {"一等奖", "二等奖", "三等奖", "谢谢参与"};
    std::vector<double> weights = {0.01, 0.05, 0.1, 0.84};  // 权重
    simulateLottery(prizes, weights, 10000);
    
    return 0;
}`,
                    description: '展示随机数的实际应用。'
                }
            ],
            handsOn: {
                title: '实现随机工具类',
                description: '创建一个功能完整的随机数生成工具类。',
                initialCode: `#include <iostream>
#include <random>
#include <vector>
#include <string>

class RandomUtils {
private:
    std::random_device rd;
    std::mt19937 gen;
    
public:
    RandomUtils() : gen(rd()) {}
    
    // TODO: 生成指定范围的随机整数 [min, max]
    int randomInt(int min, int max) {
        // TODO: 实现随机整数生成
        return 0;
    }
    
    // TODO: 生成指定范围的随机浮点数 [min, max)
    double randomDouble(double min, double max) {
        // TODO: 实现随机浮点数生成
        return 0.0;
    }
    
    // TODO: 以概率p返回true
    bool randomBool(double p = 0.5) {
        // TODO: 实现概率布尔值
        return false;
    }
    
    // TODO: 从容器中随机选择一个元素
    template<typename T>
    const T& randomChoice(const std::vector<T>& vec) {
        // TODO: 实现随机选择
        static T dummy;
        return dummy;
    }
    
    // TODO: 生成随机字符串（指定长度和字符集）
    std::string randomString(size_t length, 
                             const std::string& charset = "abcdefghijklmnopqrstuvwxyz") {
        // TODO: 实现随机字符串生成
        return "";
    }
    
    // TODO: 随机打乱容器
    template<typename T>
    void shuffle(std::vector<T>& vec) {
        // TODO: 实现随机打乱
    }
};

int main() {
    RandomUtils utils;
    
    std::cout << "随机整数 [1, 100]:" << std::endl;
    for (int i = 0; i < 5; ++i) {
        std::cout << utils.randomInt(1, 100) << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n随机浮点数 [0.0, 1.0]:" << std::endl;
    for (int i = 0; i < 5; ++i) {
        std::cout << utils.randomDouble(0.0, 1.0) << " ";
    }
    std::cout << std::endl;
    
    std::cout << "\\n随机布尔值 (p=0.7):" << std::endl;
    for (int i = 0; i < 10; ++i) {
        std::cout << (utils.randomBool(0.7) ? "T" : "F") << " ";
    }
    std::cout << std::endl;
    
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::cout << "\\n随机选择: " << utils.randomChoice(vec) << std::endl;
    
    std::cout << "\\n随机字符串 (长度=10): " << utils.randomString(10) << std::endl;
    
    std::vector<int> toShuffle = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    utils.shuffle(toShuffle);
    std::cout << "\\n打乱后: ";
    for (int v : toShuffle) {
        std::cout << v << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
                expectedOutput: `随机整数 [1, 100]:
(随机5个1-100的整数)

随机浮点数 [0.0, 1.0]:
(随机5个0-1的浮点数)

随机布尔值 (p=0.7):
(随机10个布尔值，约70%为T)

随机选择: (vec中的随机一个元素)

随机字符串 (长度=10): (10个随机小写字母)

打乱后: (1-10的随机排列)`,
                solutionRegex: 'uniform_int_distribution|uniform_real_distribution|bernoulli_distribution|shuffle',
                hint: '使用uniform_int_distribution生成整数，uniform_real_distribution生成浮点数，bernoulli_distribution生成布尔值',
                xp: 180
            },
            references: [
                { title: '随机数库', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '随机数生成', book: 'C++标准库', chapter: '随机数' }
            ],
            assistantTips: [
                '使用mt19937作为默认引擎',
                '复用引擎而不是每次创建',
                'random_device可能较慢，用作种子即可',
                '使用分布来获得特定范围的随机数'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'C++11的<random>库相比rand()的优势是？', 
                    options: [
                        { text: '更简单' }, 
                        { text: '更高质量的随机数和灵活的分布', correct: true }, 
                        { text: '更快' }, 
                        { text: '不需要种子' }
                    ], 
                    explanation: '<random>库提供更好的随机数质量和多种分布选择。' 
                },
                { 
                    type: 'single', 
                    question: 'std::mt19937是什么？', 
                    options: [
                        { text: '随机数分布' }, 
                        { text: 'Mersenne Twister随机数引擎', correct: true }, 
                        { text: '真随机数生成器' }, 
                        { text: '随机数种子' }
                    ], 
                    explanation: 'mt19937是Mersenne Twister引擎，是常用的伪随机数生成器。' 
                },
                { 
                    type: 'single', 
                    question: 'uniform_int_distribution<>(1, 100)生成什么范围的数？', 
                    options: [
                        { text: '[1, 99]' }, 
                        { text: '[1, 100]', correct: true }, 
                        { text: '(1, 100)' }, 
                        { text: '(0, 100)' }
                    ], 
                    explanation: 'uniform_int_distribution生成闭区间的整数，包含两端。' 
                },
                { 
                    type: 'single', 
                    question: 'std::random_device的作用是？', 
                    options: [
                        { text: '生成伪随机数' }, 
                        { text: '生成真随机数或高质量种子', correct: true }, 
                        { text: '定义随机数分布' }, 
                        { text: '打乱容器' }
                    ], 
                    explanation: 'random_device生成真随机数（如果硬件支持），常用作种子。' 
                },
                { 
                    type: 'single', 
                    question: '如何生成正态分布的随机数？', 
                    options: [
                        { text: 'uniform_int_distribution' }, 
                        { text: 'normal_distribution', correct: true }, 
                        { text: 'bernoulli_distribution' }, 
                        { text: 'poisson_distribution' }
                    ], 
                    explanation: 'normal_distribution生成正态分布（高斯分布）的随机数。' 
                }
            ]
        },
        {
            id: '19.3',
            title: '时间与时钟（chrono）',
            duration: '45分钟',
            difficulty: '进阶',
            xp: 140,
            estimatedXp: 380,
            concepts: `## 时间与时钟（chrono）

### chrono库概述

C++11引入了<chrono>库，提供类型安全的时间操作。

\`\`\`cpp
#include <chrono>

using namespace std::chrono;

// 创建时长
auto duration1 = 5s;   // 5秒
auto duration2 = 100ms; // 100毫秒
auto duration3 = 1h;   // 1小时
\`\`\`

### 时长（duration）

duration表示一段时间间隔。

#### 基本使用

\`\`\`cpp
#include <chrono>

// 创建时长
std::chrono::duration<int> d1(5);  // 5个"单位"
std::chrono::seconds d2(10);       // 10秒
std::chrono::milliseconds d3(100); // 100毫秒
std::chrono::microseconds d4(1000);// 1000微秒
std::chrono::nanoseconds d5(10000);// 10000纳秒

// C++14字面量
using namespace std::chrono_literals;
auto d6 = 5s;    // 5秒
auto d7 = 100ms; // 100毫秒
auto d8 = 1h;    // 1小时
auto d9 = 30min; // 30分钟
\`\`\`

#### 时长运算

\`\`\`cpp
using namespace std::chrono;
using namespace std::chrono_literals;

auto d1 = 5s + 3s;      // 8秒
auto d2 = 1h - 30min;   // 30分钟
auto d3 = 2 * 500ms;    // 1秒
auto d4 = 1s / 2;       // 500毫秒

// 比较
bool b1 = (5s > 3s);    // true
bool b2 = (100ms == 100000us);  // true
\`\`\`

#### 时长转换

\`\`\`cpp
using namespace std::chrono;

seconds s(90);
auto m = duration_cast<minutes>(s);  // 1分钟（截断）
auto ms = duration_cast<milliseconds>(s);  // 90000毫秒

// 获取数值
std::cout << s.count() << std::endl;  // 90
\`\`\`

### 时钟（clock）

时钟提供当前时间点。

#### 三种时钟

\`\`\`cpp
#include <chrono>

// 1. system_clock：系统时钟
auto now1 = std::chrono::system_clock::now();

// 2. steady_clock：单调时钟（不会倒退）
auto now2 = std::chrono::steady_clock::now();

// 3. high_resolution_clock：高精度时钟
auto now3 = std::chrono::high_resolution_clock::now();
\`\`\`

#### 时钟选择

| 时钟 | 特点 | 用途 |
|------|------|------|
| system_clock | 可与C时间转换 | 日历时间 |
| steady_clock | 单调递增 | 计时 |
| high_resolution_clock | 最高精度 | 精确测量 |

### 时间点（time_point）

time_point表示一个具体的时间点。

\`\`\`cpp
#include <chrono>

using namespace std::chrono;

// 获取当前时间点
auto now = system_clock::now();

// 时间点运算
auto tomorrow = now + hours(24);
auto yesterday = now - hours(24);

// 时间点差值
auto diff = tomorrow - now;  // 24小时的duration

// 转换为time_t
std::time_t t = system_clock::to_time_t(now);
\`\`\`

### 实用示例

#### 计时器

\`\`\`cpp
#include <chrono>
#include <iostream>

class Timer {
private:
    std::chrono::steady_clock::time_point start;
    
public:
    Timer() : start(std::chrono::steady_clock::now()) {}
    
    void reset() {
        start = std::chrono::steady_clock::now();
    }
    
    template<typename Duration = std::chrono::milliseconds>
    auto elapsed() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<Duration>(now - start).count();
    }
};

// 使用
Timer timer;
// ... 执行代码 ...
std::cout << "耗时: " << timer.elapsed() << "ms" << std::endl;
\`\`\`

#### 日期时间格式化

\`\`\`cpp
#include <chrono>
#include <iomanip>
#include <sstream>

std::string formatTime(const std::chrono::system_clock::time_point& tp) {
    auto t = std::chrono::system_clock::to_time_t(tp);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&t), "%Y-%m-%d %H:%M:%S");
    return ss.str();
}
\`\`\`

#### 程序睡眠

\`\`\`cpp
#include <chrono>
#include <thread>

// 睡眠1秒
std::this_thread::sleep_for(std::chrono::seconds(1));

// 睡眠100毫秒
std::this_thread::sleep_for(std::chrono::milliseconds(100));

// 睡眠到指定时间点
auto deadline = std::chrono::system_clock::now() + std::chrono::hours(1);
std::this_thread::sleep_until(deadline);
\`\`\``,
            examples: [
                {
                    title: '时间测量',
                    code: `#include <iostream>
#include <chrono>
#include <thread>

class Timer {
private:
    std::chrono::steady_clock::time_point start;
    
public:
    Timer() : start(std::chrono::steady_clock::now()) {}
    
    void reset() {
        start = std::chrono::steady_clock::now();
    }
    
    double elapsedSeconds() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration<double>(now - start).count();
    }
    
    long long elapsedMilliseconds() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(now - start).count();
    }
};

void simulateWork() {
    // 模拟工作
    for (volatile int i = 0; i < 100000000; ++i);
}

int main() {
    Timer timer;
    
    std::cout << "开始执行..." << std::endl;
    
    simulateWork();
    std::cout << "第一次执行耗时: " << timer.elapsedMilliseconds() << "ms" << std::endl;
    
    timer.reset();
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    std::cout << "睡眠500ms后: " << timer.elapsedMilliseconds() << "ms" << std::endl;
    
    // 时长运算
    using namespace std::chrono_literals;
    auto total = 1h + 30min + 45s;
    std::cout << "\\n1小时30分45秒 = " 
              << std::chrono::duration_cast<std::chrono::minutes>(total).count() 
              << "分钟" << std::endl;
    
    return 0;
}`,
                    description: '展示时间测量和时长运算。'
                },
                {
                    title: '日期时间处理',
                    code: `#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <ctime>

// 格式化时间点
std::string formatTimePoint(const std::chrono::system_clock::time_point& tp) {
    auto t = std::chrono::system_clock::to_time_t(tp);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&t), "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

// 获取当前日期
std::string getCurrentDate() {
    auto now = std::chrono::system_clock::now();
    auto t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&t), "%Y-%m-%d");
    return ss.str();
}

// 计算两个时间点的天数差
int daysBetween(const std::chrono::system_clock::time_point& t1,
                const std::chrono::system_clock::time_point& t2) {
    auto diff = t2 - t1;
    return std::chrono::duration_cast<std::chrono::hours>(diff).count() / 24;
}

int main() {
    // 当前时间
    auto now = std::chrono::system_clock::now();
    std::cout << "当前时间: " << formatTimePoint(now) << std::endl;
    std::cout << "当前日期: " << getCurrentDate() << std::endl;
    
    // 未来时间
    auto tomorrow = now + std::chrono::hours(24);
    auto nextWeek = now + std::chrono::hours(24 * 7);
    
    std::cout << "\\n明天: " << formatTimePoint(tomorrow) << std::endl;
    std::cout << "下周: " << formatTimePoint(nextWeek) << std::endl;
    
    // 时间差
    std::cout << "\\n距离下周还有 " << daysBetween(now, nextWeek) << " 天" << std::endl;
    
    // 时长转换
    using namespace std::chrono_literals;
    auto duration = 2h + 30min;
    std::cout << "\\n2小时30分钟:" << std::endl;
    std::cout << "  = " << std::chrono::duration_cast<std::chrono::minutes>(duration).count() 
              << " 分钟" << std::endl;
    std::cout << "  = " << std::chrono::duration_cast<std::chrono::seconds>(duration).count() 
              << " 秒" << std::endl;
    
    return 0;
}`,
                    description: '展示日期时间处理。'
                }
            ],
            handsOn: {
                title: '实现计时器和倒计时',
                description: '使用chrono库实现计时器和倒计时功能。',
                initialCode: `#include <iostream>
#include <chrono>
#include <thread>
#include <string>
#include <iomanip>

// TODO: 实现秒表类
class Stopwatch {
private:
    std::chrono::steady_clock::time_point startTime;
    bool running = false;
    
public:
    // TODO: 开始计时
    void start() {
        // TODO: 实现开始计时
    }
    
    // TODO: 停止计时
    void stop() {
        // TODO: 实现停止计时
    }
    
    // TODO: 重置
    void reset() {
        // TODO: 实现重置
    }
    
    // TODO: 获取经过的时间（毫秒）
    long long elapsedMilliseconds() const {
        // TODO: 返回经过的毫秒数
        return 0;
    }
    
    // TODO: 获取经过的时间（格式化字符串）
    std::string elapsedFormatted() const {
        // TODO: 返回格式化的时间字符串 (HH:MM:SS.mmm)
        return "00:00:00.000";
    }
};

// TODO: 实现倒计时类
class Countdown {
private:
    std::chrono::seconds totalDuration;
    std::chrono::steady_clock::time_point startTime;
    bool running = false;
    
public:
    Countdown(int seconds) : totalDuration(seconds) {}
    
    // TODO: 开始倒计时
    void start() {
        // TODO: 实现开始倒计时
    }
    
    // TODO: 获取剩余时间（秒）
    int remainingSeconds() const {
        // TODO: 返回剩余秒数
        return 0;
    }
    
    // TODO: 是否已结束
    bool isExpired() const {
        // TODO: 返回是否已结束
        return true;
    }
};

int main() {
    // 测试秒表
    std::cout << "=== 秒表测试 ===" << std::endl;
    Stopwatch sw;
    
    sw.start();
    std::this_thread::sleep_for(std::chrono::milliseconds(1500));
    std::cout << "经过时间: " << sw.elapsedFormatted() << std::endl;
    
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    sw.stop();
    std::cout << "停止时: " << sw.elapsedFormatted() << std::endl;
    
    sw.reset();
    std::cout << "重置后: " << sw.elapsedFormatted() << std::endl;
    
    // 测试倒计时
    std::cout << "\\n=== 倒计时测试 ===" << std::endl;
    Countdown cd(5);
    cd.start();
    
    while (!cd.isExpired()) {
        std::cout << "剩余: " << cd.remainingSeconds() << " 秒" << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
    std::cout << "倒计时结束!" << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 秒表测试 ===
经过时间: 00:00:01.500
停止时: 00:00:02.000
重置后: 00:00:00.000

=== 倒计时测试 ===
剩余: 5 秒
剩余: 4 秒
剩余: 3 秒
剩余: 2 秒
剩余: 1 秒
倒计时结束!`,
                solutionRegex: 'steady_clock|now|duration_cast|time_point',
                hint: '使用steady_clock::now()获取时间点，duration_cast转换时长',
                xp: 180
            },
            references: [
                { title: 'chrono库', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '时间库', book: 'C++标准库', chapter: '时间处理' }
            ],
            assistantTips: [
                '计时用steady_clock，日期用system_clock',
                '使用duration_cast进行时长转换',
                'C++14支持字面量如5s, 100ms',
                'sleep_for用于程序暂停'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'steady_clock的特点是？', 
                    options: [
                        { text: '可以修改' }, 
                        { text: '单调递增，不会倒退', correct: true }, 
                        { text: '精度最低' }, 
                        { text: '与系统时间同步' }
                    ], 
                    explanation: 'steady_clock是单调时钟，不会因为系统时间调整而倒退。' 
                },
                { 
                    type: 'single', 
                    question: 'duration_cast的作用是？', 
                    options: [
                        { text: '创建时长' }, 
                        { text: '转换时长单位', correct: true }, 
                        { text: '比较时长' }, 
                        { text: '格式化时长' }
                    ], 
                    explanation: 'duration_cast用于在不同时长单位之间转换。' 
                },
                { 
                    type: 'single', 
                    question: '5s表示什么？', 
                    options: [
                        { text: '字符串"5s"' }, 
                        { text: '5秒的duration', correct: true }, 
                        { text: '5秒的时间点' }, 
                        { text: '5秒的时钟' }
                    ], 
                    explanation: '5s是C++14的字面量，表示5秒的duration对象。' 
                },
                { 
                    type: 'single', 
                    question: '如何让程序暂停1秒？', 
                    options: [
                        { text: 'sleep(1)' }, 
                        { text: 'std::this_thread::sleep_for(1s)', correct: true }, 
                        { text: 'wait(1s)' }, 
                        { text: 'pause(1s)' }
                    ], 
                    explanation: '使用std::this_thread::sleep_for让程序暂停指定时长。' 
                },
                { 
                    type: 'single', 
                    question: 'system_clock::now()返回什么？', 
                    options: [
                        { text: '时长' }, 
                        { text: '时间点', correct: true }, 
                        { text: '时间戳' }, 
                        { text: '时钟' }
                    ], 
                    explanation: 'now()返回当前的时间点（time_point）。' 
                }
            ]
        },
        {
            id: '19.4',
            title: '元组（tuple）',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 元组（tuple）

### 什么是tuple？

tuple是一个可以存储不同类型元素的固定大小集合。

\`\`\`cpp
#include <tuple>

// 创建元组
std::tuple<int, std::string, double> t1(1, "hello", 3.14);
auto t2 = std::make_tuple(2, "world", 2.71);
\`\`\`

### 创建元组

\`\`\`cpp
#include <tuple>
#include <string>

// 方式1：直接构造
std::tuple<int, std::string, double> t1(1, "hello", 3.14);

// 方式2：make_tuple（类型自动推导）
auto t2 = std::make_tuple(2, "world", 2.71);

// 方式3：初始化列表（C++11）
std::tuple<int, std::string> t3{3, "test"};

// 方式4：CTAD（C++17）
std::tuple t4(4, "cpp", 1.0);  // 自动推导类型

// 创建空元组
std::tuple<> empty;
\`\`\`

### 访问元素

#### 使用get

\`\`\`cpp
#include <tuple>
#include <iostream>

auto t = std::make_tuple(1, "hello", 3.14);

// 按索引访问
std::cout << std::get<0>(t) << std::endl;  // 1
std::cout << std::get<1>(t) << std::endl;  // hello
std::cout << std::get<2>(t) << std::endl;  // 3.14

// 修改元素
std::get<0>(t) = 10;
\`\`\`

#### 使用tie解包

\`\`\`cpp
#include <tuple>

auto t = std::make_tuple(1, "hello", 3.14);

int i;
std::string s;
double d;

// 解包元组
std::tie(i, s, d) = t;
// i = 1, s = "hello", d = 3.14

// 忽略某些元素
int first, third;
std::tie(first, std::ignore, third) = std::make_tuple(1, 2, 3);
\`\`\`

#### 结构化绑定（C++17）

\`\`\`cpp
#include <tuple>

auto t = std::make_tuple(1, "hello", 3.14);

// 直接解包到变量
auto [i, s, d] = t;  // i=1, s="hello", d=3.14

// 引用
auto& [ri, rs, rd] = t;
ri = 10;  // 修改原元组
\`\`\`

### 元组操作

#### 获取大小

\`\`\`cpp
#include <tuple>

auto t = std::make_tuple(1, "hello", 3.14);
std::cout << std::tuple_size<decltype(t)>::value << std::endl;  // 3
\`\`\`

#### 获取元素类型

\`\`\`cpp
#include <tuple>
#include <type_traits>

auto t = std::make_tuple(1, "hello", 3.14);

// 获取第1个元素的类型
using FirstType = std::tuple_element<0, decltype(t)>::type;  // int
\`\`\`

#### 比较

\`\`\`cpp
auto t1 = std::make_tuple(1, "hello");
auto t2 = std::make_tuple(1, "hello");
auto t3 = std::make_tuple(2, "world");

std::cout << (t1 == t2) << std::endl;  // 1 (true)
std::cout << (t1 < t3) << std::endl;   // 1 (true)
\`\`\`

#### 连接元组

\`\`\`cpp
auto t1 = std::make_tuple(1, 2);
auto t2 = std::make_tuple(3.0, 4.0);

auto t3 = std::tuple_cat(t1, t2);  // (1, 2, 3.0, 4.0)
\`\`\`

### 实用示例

#### 返回多个值

\`\`\`cpp
#include <tuple>
#include <string>

// 返回多个值
std::tuple<bool, int, std::string> divide(int a, int b) {
    if (b == 0) {
        return {false, 0, "division by zero"};
    }
    return {true, a / b, "success"};
}

// 使用
auto [success, result, message] = divide(10, 3);
\`\`\`

#### 存储异构数据

\`\`\`cpp
#include <tuple>
#include <vector>

// 存储不同类型的数据
std::vector<std::tuple<int, std::string, double>> records = {
    {1, "Alice", 85.5},
    {2, "Bob", 92.0},
    {3, "Charlie", 78.5}
};

// 遍历
for (const auto& [id, name, score] : records) {
    std::cout << id << ": " << name << " - " << score << std::endl;
}
\`\`\`

#### 字典序比较

\`\`\`cpp
#include <tuple>
#include <algorithm>

struct Person {
    std::string name;
    int age;
    double score;
    
    auto asTuple() const {
        return std::tie(name, age, score);
    }
    
    bool operator<(const Person& other) const {
        return asTuple() < other.asTuple();
    }
};
\`\`\``,
            examples: [
                {
                    title: '元组基本操作',
                    code: `#include <iostream>
#include <tuple>
#include <string>

int main() {
    // 创建元组
    auto t = std::make_tuple(1, "hello", 3.14);
    
    // 访问元素
    std::cout << "元组内容:" << std::endl;
    std::cout << "  第1个: " << std::get<0>(t) << std::endl;
    std::cout << "  第2个: " << std::get<1>(t) << std::endl;
    std::cout << "  第3个: " << std::get<2>(t) << std::endl;
    
    // 修改元素
    std::get<0>(t) = 10;
    std::cout << "\\n修改后第1个: " << std::get<0>(t) << std::endl;
    
    // 使用tie解包
    int i;
    std::string s;
    double d;
    std::tie(i, s, d) = t;
    std::cout << "\\ntie解包: " << i << ", " << s << ", " << d << std::endl;
    
    // C++17结构化绑定
    auto [a, b, c] = t;
    std::cout << "结构化绑定: " << a << ", " << b << ", " << c << std::endl;
    
    // 元组大小
    std::cout << "\\n元组大小: " << std::tuple_size<decltype(t)>::value << std::endl;
    
    // 比较
    auto t1 = std::make_tuple(1, "test");
    auto t2 = std::make_tuple(1, "test");
    auto t3 = std::make_tuple(2, "test");
    std::cout << "\\nt1 == t2: " << (t1 == t2) << std::endl;
    std::cout << "t1 < t3: " << (t1 < t3) << std::endl;
    
    // 连接元组
    auto cat = std::tuple_cat(t1, t2);
    std::cout << "\\n连接后大小: " << std::tuple_size<decltype(cat)>::value << std::endl;
    
    return 0;
}`,
                    description: '展示元组的基本操作。'
                },
                {
                    title: '元组实用示例',
                    code: `#include <iostream>
#include <tuple>
#include <string>
#include <vector>
#include <algorithm>

// 返回多个值
std::tuple<bool, int, std::string> divide(int a, int b) {
    if (b == 0) {
        return {false, 0, "division by zero"};
    }
    return {true, a / b, "success"};
}

// 查找最小最大值
template<typename T>
std::tuple<T, T, T> minMaxSum(const std::vector<T>& vec) {
    if (vec.empty()) {
        return {T{}, T{}, T{}};
    }
    
    T minVal = vec[0];
    T maxVal = vec[0];
    T sum = vec[0];
    
    for (size_t i = 1; i < vec.size(); ++i) {
        minVal = std::min(minVal, vec[i]);
        maxVal = std::max(maxVal, vec[i]);
        sum += vec[i];
    }
    
    return {minVal, maxVal, sum};
}

int main() {
    // 返回多个值
    std::cout << "=== 除法函数 ===" << std::endl;
    auto [success1, result1, msg1] = divide(10, 3);
    std::cout << "10 / 3: " << result1 << " (" << msg1 << ")" << std::endl;
    
    auto [success2, result2, msg2] = divide(10, 0);
    std::cout << "10 / 0: " << result2 << " (" << msg2 << ")" << std::endl;
    
    // 统计信息
    std::cout << "\\n=== 统计信息 ===" << std::endl;
    std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    auto [min, max, sum] = minMaxSum(nums);
    std::cout << "数组: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << "\\n最小值: " << min << std::endl;
    std::cout << "最大值: " << max << std::endl;
    std::cout << "总和: " << sum << std::endl;
    
    // 存储记录
    std::cout << "\\n=== 学生记录 ===" << std::endl;
    std::vector<std::tuple<int, std::string, double>> students = {
        {1, "Alice", 85.5},
        {2, "Bob", 92.0},
        {3, "Charlie", 78.5}
    };
    
    for (const auto& [id, name, score] : students) {
        std::cout << id << ": " << name << " - " << score << std::endl;
    }
    
    return 0;
}`,
                    description: '展示元组的实用示例。'
                }
            ],
            handsOn: {
                title: '使用元组实现数据统计',
                description: '使用元组实现统计函数，返回多个统计结果。',
                initialCode: `#include <iostream>
#include <tuple>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>

// TODO: 实现统计函数
// 返回: (最小值, 最大值, 平均值, 总和)
template<typename T>
std::tuple<T, T, double, T> statistics(const std::vector<T>& data) {
    // TODO: 实现统计计算
    return {T{}, T{}, 0.0, T{}};
}

// TODO: 实现查找函数
// 返回: (是否找到, 索引位置, 值)
template<typename T>
std::tuple<bool, size_t, T> findElement(const std::vector<T>& data, const T& target) {
    // TODO: 实现查找
    return {false, 0, T{}};
}

// TODO: 实现解析函数
// 解析"姓名,年龄,分数"格式的字符串
// 返回: (姓名, 年龄, 分数)
std::tuple<std::string, int, double> parseRecord(const std::string& record) {
    // TODO: 实现解析
    return {"", 0, 0.0};
}

int main() {
    // 测试统计函数
    std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    std::cout << "数据: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    
    auto [min, max, avg, sum] = statistics(nums);
    std::cout << "\\n统计结果:" << std::endl;
    std::cout << "  最小值: " << min << std::endl;
    std::cout << "  最大值: " << max << std::endl;
    std::cout << "  平均值: " << avg << std::endl;
    std::cout << "  总和: " << sum << std::endl;
    
    // 测试查找函数
    std::cout << "\\n查找测试:" << std::endl;
    auto [found1, pos1, val1] = findElement(nums, 5);
    std::cout << "  查找5: " << (found1 ? "找到" : "未找到") 
              << ", 位置: " << pos1 << std::endl;
    
    auto [found2, pos2, val2] = findElement(nums, 10);
    std::cout << "  查找10: " << (found2 ? "找到" : "未找到") << std::endl;
    
    // 测试解析函数
    std::cout << "\\n解析测试:" << std::endl;
    std::string record = "张三,20,85.5";
    auto [name, age, score] = parseRecord(record);
    std::cout << "  原始: " << record << std::endl;
    std::cout << "  姓名: " << name << std::endl;
    std::cout << "  年龄: " << age << std::endl;
    std::cout << "  分数: " << score << std::endl;
    
    return 0;
}`,
                expectedOutput: `数据: 3 1 4 1 5 9 2 6 5 3 

统计结果:
  最小值: 1
  最大值: 9
  平均值: 3.9
  总和: 39

查找测试:
  查找5: 找到, 位置: 4
  查找10: 未找到

解析测试:
  原始: 张三,20,85.5
  姓名: 张三
  年龄: 20
  分数: 85.5`,
                solutionRegex: 'make_tuple|tie|get|tuple_size|tuple_element',
                hint: '使用min_element/max_element/accumulate计算统计值，find查找元素',
                xp: 160
            },
            references: [
                { title: 'tuple', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '元组', book: 'C++标准库', chapter: 'tuple' }
            ],
            assistantTips: [
                '使用make_tuple创建元组',
                'get<索引>访问元素',
                'C++17结构化绑定简化解包',
                'tuple适合返回多个值'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '如何访问tuple的第一个元素？', 
                    options: [
                        { text: 't[0]' }, 
                        { text: 'std::get<0>(t)', correct: true }, 
                        { text: 't.first()' }, 
                        { text: 't.at(0)' }
                    ], 
                    explanation: '使用std::get<索引>访问tuple元素。' 
                },
                { 
                    type: 'single', 
                    question: 'std::tie的作用是？', 
                    options: [
                        { text: '创建元组' }, 
                        { text: '解包元组到变量', correct: true }, 
                        { text: '比较元组' }, 
                        { text: '连接元组' }
                    ], 
                    explanation: 'std::tie创建一个引用元组，用于解包。' 
                },
                { 
                    type: 'single', 
                    question: 'C++17结构化绑定的语法是？', 
                    options: [
                        { text: 'auto t = tuple' }, 
                        { text: 'auto [a, b, c] = tuple', correct: true }, 
                        { text: 'tie(a, b, c) = tuple' }, 
                        { text: 'get(tuple, a, b, c)' }
                    ], 
                    explanation: 'C++17引入结构化绑定，直接解包元组。' 
                },
                { 
                    type: 'single', 
                    question: 'tuple_cat的作用是？', 
                    options: [
                        { text: '创建元组' }, 
                        { text: '连接多个元组', correct: true }, 
                        { text: '比较元组' }, 
                        { text: '复制元组' }
                    ], 
                    explanation: 'tuple_cat将多个元组连接成一个新的元组。' 
                },
                { 
                    type: 'single', 
                    question: 'tuple_size获取什么？', 
                    options: [
                        { text: '元组的大小（元素个数）', correct: true }, 
                        { text: '元组的字节数' }, 
                        { text: '元组的类型' }, 
                        { text: '元组的索引' }
                    ], 
                    explanation: 'tuple_size返回元组中元素的个数。' 
                }
            ]
        },
        {
            id: '19.5',
            title: 'bitset',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## bitset

### 什么是bitset？

bitset是一个存储固定大小位序列的容器，支持位操作。

\`\`\`cpp
#include <bitset>

std::bitset<8> bits;  // 8位，全为0
std::bitset<8> bits2(0xFF);  // 8位，全为1
std::bitset<8> bits3("10101010");  // 从字符串构造
\`\`\`

### 创建bitset

\`\`\`cpp
#include <bitset>
#include <string>

// 默认构造（全0）
std::bitset<8> b1;  // 00000000

// 从整数构造
std::bitset<8> b2(255);  // 11111111
std::bitset<8> b3(0b10101010);  // 10101010

// 从字符串构造
std::bitset<8> b4("10101010");
std::bitset<8> b5(std::string("10101010"));

// 从字符串的一部分构造
std::string s = "10101010";
std::bitset<8> b6(s, 0, 8);  // 从位置0开始，取8个字符
\`\`\`

### 访问位

\`\`\`cpp
#include <bitset>

std::bitset<8> bits("10101010");

// 下标访问
bool b0 = bits[0];  // 最低位（最右边）：0
bool b7 = bits[7];  // 最高位（最左边）：1

// test()访问（检查边界）
bool t0 = bits.test(0);  // 0
bool t7 = bits.test(7);  // 1

// 检查所有位
bool all = bits.all();   // 是否全为1
bool any = bits.any();   // 是否有1
bool none = bits.none(); // 是否全为0

// 统计1的个数
size_t count = bits.count();  // 4

// 总位数
size_t size = bits.size();  // 8
\`\`\`

### 修改位

\`\`\`cpp
#include <bitset>

std::bitset<8> bits;

// 设置位
bits.set(0);     // 设置第0位为1
bits.set(1, 0);  // 设置第1位为0
bits.set();      // 设置所有位为1

// 重置位
bits.reset(0);   // 重置第0位为0
bits.reset();    // 重置所有位为0

// 翻转位
bits.flip(0);    // 翻转第0位
bits.flip();     // 翻转所有位
\`\`\`

### 位运算

\`\`\`cpp
#include <bitset>

std::bitset<8> a("10101010");
std::bitset<8> b("11001100");

// 位运算
auto c1 = a & b;   // 与：10001000
auto c2 = a | b;   // 或：11101110
auto c3 = a ^ b;   // 异或：01100110
auto c4 = ~a;      // 取反：01010101

// 移位
auto c5 = a << 2;  // 左移：10101000
auto c6 = a >> 2;  // 右移：00101010

// 复合赋值
a &= b;
a |= b;
a ^= b;
a <<= 2;
a >>= 2;
\`\`\`

### 转换

\`\`\`cpp
#include <bitset>
#include <string>
#include <iostream>

std::bitset<8> bits("10101010");

// 转为字符串
std::string s = bits.to_string();  // "10101010"

// 转为无符号整数
unsigned long ul = bits.to_ulong();
unsigned long long ull = bits.to_ullong();

// 输出
std::cout << bits << std::endl;  // 10101010
\`\`\`

### 实用示例

#### 权限管理

\`\`\`cpp
#include <bitset>

enum Permission {
    READ    = 0,
    WRITE   = 1,
    EXECUTE = 2,
    ADMIN   = 3
};

std::bitset<4> permissions;

permissions.set(READ);
permissions.set(WRITE);

if (permissions.test(READ)) {
    // 有读权限
}
\`\`\`

#### 位标志

\`\`\`cpp
#include <bitset>

enum Flags {
    FLAG_A = 0,
    FLAG_B = 1,
    FLAG_C = 2,
    FLAG_D = 3
};

std::bitset<4> flags;

flags.set(FLAG_A);
flags.set(FLAG_C);

// 检查标志
if (flags.test(FLAG_A) && flags.test(FLAG_C)) {
    // A和C都设置了
}
\`\`\`

#### 子集判断

\`\`\`cpp
#include <bitset>

template<size_t N>
bool isSubset(const std::bitset<N>& a, const std::bitset<N>& b) {
    return (a & b) == a;
}
\`\`\``,
            examples: [
                {
                    title: 'bitset基本操作',
                    code: `#include <iostream>
#include <bitset>
#include <string>

int main() {
    // 创建bitset
    std::bitset<8> b1;  // 全0
    std::bitset<8> b2(255);  // 11111111
    std::bitset<8> b3("10101010");
    
    std::cout << "b1: " << b1 << std::endl;
    std::cout << "b2: " << b2 << std::endl;
    std::cout << "b3: " << b3 << std::endl;
    
    // 访问位
    std::cout << "\\nb3[0]: " << b3[0] << std::endl;
    std::cout << "b3[7]: " << b3[7] << std::endl;
    std::cout << "b3.test(0): " << b3.test(0) << std::endl;
    
    // 统计
    std::cout << "\\n统计:" << std::endl;
    std::cout << "  1的个数: " << b3.count() << std::endl;
    std::cout << "  总位数: " << b3.size() << std::endl;
    std::cout << "  是否全1: " << b3.all() << std::endl;
    std::cout << "  是否有1: " << b3.any() << std::endl;
    std::cout << "  是否全0: " << b3.none() << std::endl;
    
    // 修改位
    std::bitset<8> b4;
    b4.set(0);    // 设置第0位
    b4.set(2);
    b4.set(4);
    std::cout << "\\n设置后: " << b4 << std::endl;
    
    b4.flip();    // 翻转所有位
    std::cout << "翻转后: " << b4 << std::endl;
    
    b4.reset(0);  // 重置第0位
    std::cout << "重置后: " << b4 << std::endl;
    
    // 位运算
    std::bitset<8> a("10101010");
    std::bitset<8> b("11001100");
    std::cout << "\\n位运算:" << std::endl;
    std::cout << "  a & b: " << (a & b) << std::endl;
    std::cout << "  a | b: " << (a | b) << std::endl;
    std::cout << "  a ^ b: " << (a ^ b) << std::endl;
    std::cout << "  ~a: " << (~a) << std::endl;
    
    // 转换
    std::cout << "\\n转换:" << std::endl;
    std::cout << "  to_string: " << b3.to_string() << std::endl;
    std::cout << "  to_ulong: " << b3.to_ulong() << std::endl;
    
    return 0;
}`,
                    description: '展示bitset的基本操作。'
                },
                {
                    title: '权限管理示例',
                    code: `#include <iostream>
#include <bitset>
#include <string>

// 权限枚举
enum Permission {
    READ    = 0,  // 读
    WRITE   = 1,  // 写
    EXECUTE = 2,  // 执行
    DELETE  = 3,  // 删除
    ADMIN   = 4   // 管理
};

class User {
private:
    std::string name;
    std::bitset<5> permissions;
    
public:
    User(const std::string& n) : name(n) {}
    
    // 授予权限
    void grant(Permission p) {
        permissions.set(p);
    }
    
    // 撤销权限
    void revoke(Permission p) {
        permissions.reset(p);
    }
    
    // 检查权限
    bool hasPermission(Permission p) const {
        return permissions.test(p);
    }
    
    // 显示权限
    void showPermissions() const {
        std::cout << name << " 的权限:" << std::endl;
        std::cout << "  读: " << (hasPermission(READ) ? "是" : "否") << std::endl;
        std::cout << "  写: " << (hasPermission(WRITE) ? "是" : "否") << std::endl;
        std::cout << "  执行: " << (hasPermission(EXECUTE) ? "是" : "否") << std::endl;
        std::cout << "  删除: " << (hasPermission(DELETE) ? "是" : "否") << std::endl;
        std::cout << "  管理: " << (hasPermission(ADMIN) ? "是" : "否") << std::endl;
        std::cout << "  位表示: " << permissions << std::endl;
    }
};

int main() {
    User admin("管理员");
    admin.grant(READ);
    admin.grant(WRITE);
    admin.grant(EXECUTE);
    admin.grant(DELETE);
    admin.grant(ADMIN);
    
    User guest("访客");
    guest.grant(READ);
    
    User editor("编辑者");
    editor.grant(READ);
    editor.grant(WRITE);
    
    std::cout << "=== 权限管理 ===" << std::endl;
    admin.showPermissions();
    std::cout << std::endl;
    guest.showPermissions();
    std::cout << std::endl;
    editor.showPermissions();
    
    std::cout << "\\n=== 撤销权限 ===" << std::endl;
    admin.revoke(ADMIN);
    admin.showPermissions();
    
    return 0;
}`,
                    description: '使用bitset实现权限管理。'
                }
            ],
            handsOn: {
                title: '实现位图和集合操作',
                description: '使用bitset实现位图和集合运算。',
                initialCode: `#include <iostream>
#include <bitset>
#include <string>

// TODO: 实现位图类
template<size_t N>
class Bitmap {
private:
    std::bitset<N> bits;
    
public:
    // TODO: 设置位
    void set(size_t index) {
        // TODO: 设置指定位为1
    }
    
    // TODO: 重置位
    void reset(size_t index) {
        // TODO: 设置指定位为0
    }
    
    // TODO: 测试位
    bool test(size_t index) const {
        // TODO: 返回指定位的值
        return false;
    }
    
    // TODO: 翻转位
    void flip(size_t index) {
        // TODO: 翻转指定位
    }
    
    // TODO: 统计1的个数
    size_t count() const {
        // TODO: 返回1的个数
        return 0;
    }
    
    // TODO: 判断是否全为0
    bool empty() const {
        // TODO: 返回是否全为0
        return true;
    }
    
    // 显示
    void display() const {
        std::cout << bits << std::endl;
    }
};

// TODO: 实现集合操作
template<size_t N>
class BitSet {
private:
    std::bitset<N> bits;
    
public:
    // TODO: 添加元素
    void add(size_t element) {
        // TODO: 添加元素到集合
    }
    
    // TODO: 移除元素
    void remove(size_t element) {
        // TODO: 从集合移除元素
    }
    
    // TODO: 检查元素是否存在
    bool contains(size_t element) const {
        // TODO: 检查元素是否在集合中
        return false;
    }
    
    // TODO: 并集
    BitSet operator|(const BitSet& other) const {
        // TODO: 返回并集
        return BitSet();
    }
    
    // TODO: 交集
    BitSet operator&(const BitSet& other) const {
        // TODO: 返回交集
        return BitSet();
    }
    
    // TODO: 差集
    BitSet operator-(const BitSet& other) const {
        // TODO: 返回差集
        return BitSet();
    }
    
    // 显示
    void display() const {
        std::cout << "{ ";
        for (size_t i = 0; i < N; ++i) {
            if (bits.test(i)) {
                std::cout << i << " ";
            }
        }
        std::cout << "}" << std::endl;
    }
};

int main() {
    // 测试位图
    std::cout << "=== 位图测试 ===" << std::endl;
    Bitmap<16> bitmap;
    
    bitmap.set(0);
    bitmap.set(3);
    bitmap.set(7);
    bitmap.set(15);
    
    std::cout << "设置后: ";
    bitmap.display();
    
    std::cout << "位3: " << bitmap.test(3) << std::endl;
    std::cout << "位5: " << bitmap.test(5) << std::endl;
    
    bitmap.flip(3);
    std::cout << "翻转位3后: ";
    bitmap.display();
    
    std::cout << "1的个数: " << bitmap.count() << std::endl;
    
    // 测试集合操作
    std::cout << "\\n=== 集合操作测试 ===" << std::endl;
    BitSet<10> set1, set2;
    
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set1.add(5);
    
    set2.add(2);
    set2.add(3);
    set2.add(4);
    set2.add(6);
    
    std::cout << "集合1: ";
    set1.display();
    
    std::cout << "集合2: ";
    set2.display();
    
    std::cout << "并集: ";
    (set1 | set2).display();
    
    std::cout << "交集: ";
    (set1 & set2).display();
    
    std::cout << "差集: ";
    (set1 - set2).display();
    
    return 0;
}`,
                expectedOutput: `=== 位图测试 ===
设置后: 1000000100000001
位3: 1
位5: 0
翻转位3后: 1000000000000001
1的个数: 3

=== 集合操作测试 ===
集合1: { 1 2 3 5 }
集合2: { 2 3 4 6 }
并集: { 1 2 3 4 5 6 }
交集: { 2 3 }
差集: { 1 5 }`,
                solutionRegex: 'set|reset|test|flip|count|bitset',
                hint: '使用bitset的set/reset/test/flip/count方法',
                xp: 160
            },
            references: [
                { title: 'bitset', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '位操作', book: 'C++标准库', chapter: 'bitset' }
            ],
            assistantTips: [
                'bitset大小在编译时确定',
                '使用set/reset/flip修改位',
                '使用test安全访问位',
                '支持所有位运算操作'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'bitset<8>的大小何时确定？', 
                    options: [
                        { text: '运行时' }, 
                        { text: '编译时', correct: true }, 
                        { text: '可以动态改变' }, 
                        { text: '取决于初始值' }
                    ], 
                    explanation: 'bitset的大小是模板参数，在编译时确定。' 
                },
                { 
                    type: 'single', 
                    question: 'bitset的test()和[]的区别是？', 
                    options: [
                        { text: '没有区别' }, 
                        { text: 'test()会检查边界', correct: true }, 
                        { text: '[]更快' }, 
                        { text: 'test()只读' }
                    ], 
                    explanation: 'test()会检查边界，越界时抛出异常；[]不检查。' 
                },
                { 
                    type: 'single', 
                    question: 'bitset的count()返回什么？', 
                    options: [
                        { text: '总位数' }, 
                        { text: '1的个数', correct: true }, 
                        { text: '0的个数' }, 
                        { text: '字节数' }
                    ], 
                    explanation: 'count()返回bitset中1的个数。' 
                },
                { 
                    type: 'single', 
                    question: 'bitset的flip()作用是？', 
                    options: [
                        { text: '设置所有位为1' }, 
                        { text: '设置所有位为0' }, 
                        { text: '翻转所有位', correct: true }, 
                        { text: '交换位' }
                    ], 
                    explanation: 'flip()翻转所有位（0变1，1变0）。' 
                },
                { 
                    type: 'single', 
                    question: '如何创建全1的bitset<8>？', 
                    options: [
                        { text: 'bitset<8>()' }, 
                        { text: 'bitset<8>(255)', correct: true }, 
                        { text: 'bitset<8>("1")' }, 
                        { text: 'bitset<8>(1)' }
                    ], 
                    explanation: '255的二进制是11111111，正好8个1。' 
                }
            ]
        },
        {
            id: '19.6',
            title: '分配器（allocator）定制',
            duration: '40分钟',
            difficulty: '高级',
            xp: 130,
            estimatedXp: 360,
            concepts: `## 分配器（allocator）定制

### 什么是分配器？

分配器是STL容器用于内存管理的抽象，负责内存的分配和释放。

\`\`\`cpp
#include <memory>
#include <vector>

// 默认分配器
std::vector<int> v1;

// 自定义分配器
std::vector<int, MyAllocator<int>> v2;
\`\`\`

### 默认分配器

\`\`\`cpp
#include <memory>

std::allocator<int> alloc;

// 分配内存（未构造）
int* p = alloc.allocate(5);  // 分配5个int的空间

// 构造对象
for (int i = 0; i < 5; ++i) {
    alloc.construct(p + i, i * 10);
}

// 使用
for (int i = 0; i < 5; ++i) {
    std::cout << p[i] << " ";
}

// 销毁对象
for (int i = 0; i < 5; ++i) {
    alloc.destroy(p + i);
}

// 释放内存
alloc.deallocate(p, 5);
\`\`\`

### 分配器接口

一个完整的分配器需要实现以下接口：

\`\`\`cpp
template<typename T>
class MyAllocator {
public:
    // 类型定义
    using value_type = T;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = T&;
    using const_reference = const T&;
    using size_type = std::size_t;
    using difference_type = std::ptrdiff_t;
    
    // 分配内存
    T* allocate(std::size_t n) {
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }
    
    // 释放内存
    void deallocate(T* p, std::size_t n) {
        ::operator delete(p);
    }
    
    // 构造对象（C++11前需要）
    template<typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        ::new((void*)p) U(std::forward<Args>(args)...);
    }
    
    // 销毁对象（C++11前需要）
    template<typename U>
    void destroy(U* p) {
        p->~U();
    }
};
\`\`\`

### 简单的自定义分配器

\`\`\`cpp
#include <memory>
#include <iostream>
#include <vector>

template<typename T>
class TrackingAllocator {
public:
    using value_type = T;
    
    static size_t total_allocated;
    static size_t total_deallocated;
    
    T* allocate(std::size_t n) {
        size_t bytes = n * sizeof(T);
        total_allocated += bytes;
        std::cout << "分配 " << bytes << " 字节" << std::endl;
        return static_cast<T*>(::operator new(bytes));
    }
    
    void deallocate(T* p, std::size_t n) {
        size_t bytes = n * sizeof(T);
        total_deallocated += bytes;
        std::cout << "释放 " << bytes << " 字节" << std::endl;
        ::operator delete(p);
    }
    
    // 重载相等比较
    bool operator==(const TrackingAllocator&) const { return true; }
    bool operator!=(const TrackingAllocator&) const { return false; }
};

template<typename T>
size_t TrackingAllocator<T>::total_allocated = 0;

template<typename T>
size_t TrackingAllocator<T>::total_deallocated = 0;
\`\`\`

### 池分配器

池分配器预先分配大块内存，减少内存分配次数。

\`\`\`cpp
#include <memory>
#include <vector>

template<typename T, size_t BlockSize = 4096>
class PoolAllocator {
public:
    using value_type = T;
    
private:
    struct Block {
        char* memory;
        size_t used;
        Block* next;
    };
    
    Block* currentBlock = nullptr;
    
public:
    T* allocate(std::size_t n) {
        size_t bytes = n * sizeof(T);
        
        if (!currentBlock || currentBlock->used + bytes > BlockSize) {
            // 分配新块
            Block* newBlock = new Block;
            newBlock->memory = static_cast<char*>(::operator new(BlockSize));
            newBlock->used = 0;
            newBlock->next = currentBlock;
            currentBlock = newBlock;
        }
        
        T* result = reinterpret_cast<T*>(currentBlock->memory + currentBlock->used);
        currentBlock->used += bytes;
        return result;
    }
    
    void deallocate(T* p, std::size_t n) {
        // 池分配器通常不单独释放
    }
};
\`\`\`

### 使用自定义分配器

\`\`\`cpp
#include <vector>
#include <list>
#include <map>

// 使用跟踪分配器的vector
std::vector<int, TrackingAllocator<int>> vec;

// 使用池分配器的list
std::list<int, PoolAllocator<int>> lst;

// 使用自定义分配器的map
std::map<int, std::string, std::less<int>, 
         TrackingAllocator<std::pair<const int, std::string>>> m;
\`\`\`

### 分配器的应用场景

1. **内存跟踪**：统计内存使用情况
2. **内存池**：提高分配效率
3. **共享内存**：在共享内存中分配对象
4. **自定义内存管理**：特殊内存需求`,
            examples: [
                {
                    title: '跟踪分配器',
                    code: `#include <iostream>
#include <memory>
#include <vector>
#include <string>

// 跟踪内存分配的分配器
template<typename T>
class TrackingAllocator {
public:
    using value_type = T;
    
    static size_t total_allocated;
    static size_t total_deallocated;
    static int allocation_count;
    
    T* allocate(std::size_t n) {
        size_t bytes = n * sizeof(T);
        total_allocated += bytes;
        allocation_count++;
        std::cout << "分配: " << bytes << " 字节 (" << n << " 个对象)" << std::endl;
        return static_cast<T*>(::operator new(bytes));
    }
    
    void deallocate(T* p, std::size_t n) {
        size_t bytes = n * sizeof(T);
        total_deallocated += bytes;
        std::cout << "释放: " << bytes << " 字节" << std::endl;
        ::operator delete(p);
    }
    
    static void printStats() {
        std::cout << "\\n内存统计:" << std::endl;
        std::cout << "  总分配: " << total_allocated << " 字节" << std::endl;
        std::cout << "  总释放: " << total_deallocated << " 字节" << std::endl;
        std::cout << "  分配次数: " << allocation_count << std::endl;
    }
};

template<typename T>
size_t TrackingAllocator<T>::total_allocated = 0;

template<typename T>
size_t TrackingAllocator<T>::total_deallocated = 0;

template<typename T>
int TrackingAllocator<T>::allocation_count = 0;

int main() {
    std::cout << "=== 使用跟踪分配器的vector ===" << std::endl;
    
    std::vector<int, TrackingAllocator<int>> vec;
    
    std::cout << "\\n添加元素:" << std::endl;
    for (int i = 0; i < 10; ++i) {
        vec.push_back(i);
    }
    
    std::cout << "\\nvector大小: " << vec.size() << std::endl;
    std::cout << "vector容量: " << vec.capacity() << std::endl;
    
    TrackingAllocator<int>::printStats();
    
    return 0;
}`,
                    description: '展示跟踪内存分配的分配器。'
                },
                {
                    title: '简单池分配器',
                    code: `#include <iostream>
#include <memory>
#include <list>
#include <chrono>

// 简单的池分配器
template<typename T, size_t PoolSize = 1024>
class SimplePoolAllocator {
public:
    using value_type = T;
    
private:
    static char* pool;
    static size_t offset;
    
public:
    T* allocate(std::size_t n) {
        size_t bytes = n * sizeof(T);
        if (offset + bytes > PoolSize) {
            throw std::bad_alloc();
        }
        T* result = reinterpret_cast<T*>(pool + offset);
        offset += bytes;
        return result;
    }
    
    void deallocate(T* p, std::size_t n) {
        // 池分配器通常不单独释放
    }
    
    static void reset() {
        offset = 0;
    }
};

template<typename T, size_t PoolSize>
char* SimplePoolAllocator<T, PoolSize>::pool = new char[PoolSize];

template<typename T, size_t PoolSize>
size_t SimplePoolAllocator<T, PoolSize>::offset = 0;

// 性能测试
void testPerformance() {
    const int N = 10000;
    
    // 标准分配器
    auto start = std::chrono::high_resolution_clock::now();
    {
        std::list<int> lst;
        for (int i = 0; i < N; ++i) {
            lst.push_back(i);
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "标准分配器: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " 微秒" << std::endl;
    
    // 池分配器
    SimplePoolAllocator<int>::reset();
    start = std::chrono::high_resolution_clock::now();
    {
        std::list<int, SimplePoolAllocator<int>> lst;
        for (int i = 0; i < N; ++i) {
            lst.push_back(i);
        }
    }
    end = std::chrono::high_resolution_clock::now();
    std::cout << "池分配器: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " 微秒" << std::endl;
}

int main() {
    std::cout << "=== 池分配器性能测试 ===" << std::endl;
    testPerformance();
    
    return 0;
}`,
                    description: '展示简单的池分配器。'
                }
            ],
            handsOn: {
                title: '实现统计分配器',
                description: '实现一个统计内存使用情况的分配器。',
                initialCode: `#include <iostream>
#include <memory>
#include <vector>
#include <string>

// TODO: 实现统计分配器
template<typename T>
class StatsAllocator {
public:
    using value_type = T;
    
    // TODO: 添加静态统计变量
    // static size_t total_allocations;
    // static size_t total_deallocations;
    // static size_t current_memory;
    // static size_t peak_memory;
    
    // TODO: 实现allocate方法
    T* allocate(std::size_t n) {
        // TODO: 分配内存并更新统计
        return nullptr;
    }
    
    // TODO: 实现deallocate方法
    void deallocate(T* p, std::size_t n) {
        // TODO: 释放内存并更新统计
    }
    
    // TODO: 实现静态统计方法
    static void printStats() {
        // TODO: 打印统计信息
    }
    
    static void resetStats() {
        // TODO: 重置统计
    }
};

// TODO: 初始化静态变量

int main() {
    // 测试统计分配器
    std::cout << "=== 统计分配器测试 ===" << std::endl;
    
    StatsAllocator<int>::resetStats();
    
    std::vector<int, StatsAllocator<int>> vec;
    
    std::cout << "\\n添加元素:" << std::endl;
    for (int i = 0; i < 20; ++i) {
        vec.push_back(i);
        if (i % 5 == 4) {
            std::cout << "添加 " << (i + 1) << " 个元素后:" << std::endl;
            StatsAllocator<int>::printStats();
        }
    }
    
    std::cout << "\\n最终统计:" << std::endl;
    StatsAllocator<int>::printStats();
    
    std::cout << "\\nvector大小: " << vec.size() << std::endl;
    std::cout << "vector容量: " << vec.capacity() << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 统计分配器测试 ===

添加元素:
添加 5 个元素后:
总分配次数: 5
总释放次数: 4
当前内存: 16 字节
峰值内存: 32 字节

...

最终统计:
总分配次数: X
总释放次数: Y
当前内存: Z 字节
峰值内存: P 字节

vector大小: 20
vector容量: C`,
                solutionRegex: 'allocate|deallocate|operator new|operator delete',
                hint: '使用静态变量记录统计信息，allocate增加计数，deallocate减少',
                xp: 180
            },
            references: [
                { title: '分配器', book: 'C++ Primer 第五版', chapter: '第12章' },
                { title: '自定义分配器', book: 'Effective STL', chapter: '条款11' }
            ],
            assistantTips: [
                '分配器负责内存分配和对象构造分离',
                '默认分配器使用new和delete',
                '自定义分配器可用于内存跟踪和优化',
                '池分配器适合频繁分配释放的场景'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: '分配器的作用是？', 
                    options: [
                        { text: '排序容器' }, 
                        { text: '管理内存分配和释放', correct: true }, 
                        { text: '比较元素' }, 
                        { text: '迭代元素' }
                    ], 
                    explanation: '分配器负责容器的内存管理。' 
                },
                { 
                    type: 'single', 
                    question: 'allocate和deallocate分别做什么？', 
                    options: [
                        { text: '构造和销毁对象' }, 
                        { text: '分配和释放内存', correct: true }, 
                        { text: '复制和移动对象' }, 
                        { text: '比较和交换对象' }
                    ], 
                    explanation: 'allocate分配内存，deallocate释放内存，不涉及对象构造。' 
                },
                { 
                    type: 'single', 
                    question: '池分配器的优势是？', 
                    options: [
                        { text: '内存占用更小' }, 
                        { text: '减少内存分配次数，提高性能', correct: true }, 
                        { text: '更安全' }, 
                        { text: '支持更多类型' }
                    ], 
                    explanation: '池分配器预先分配大块内存，减少频繁的小块内存分配。' 
                },
                { 
                    type: 'single', 
                    question: 'construct和destroy的作用是？', 
                    options: [
                        { text: '分配和释放内存' }, 
                        { text: '构造和销毁对象', correct: true }, 
                        { text: '复制和移动对象' }, 
                        { text: '创建和删除容器' }
                    ], 
                    explanation: 'construct在已分配的内存上构造对象，destroy调用析构函数。' 
                },
                { 
                    type: 'single', 
                    question: '为什么需要自定义分配器？', 
                    options: [
                        { text: '必须的' }, 
                        { text: '用于特殊内存需求、性能优化或内存跟踪', correct: true }, 
                        { text: '更安全' }, 
                        { text: '更简单' }
                    ], 
                    explanation: '自定义分配器用于特殊场景，如内存池、共享内存、内存跟踪等。' 
                }
            ]
        },
        {
            id: '19.7',
            title: '数值数组 valarray',
            duration: '35分钟',
            difficulty: '进阶',
            xp: 110,
            estimatedXp: 330,
            concepts: `## 数值数组 valarray

### 什么是valarray？

valarray是专为数值计算设计的数组，支持整体操作和切片。

\`\`\`cpp
#include <valarray>

std::valarray<int> arr = {1, 2, 3, 4, 5};

// 整体操作
arr *= 2;  // 每个元素乘2
\`\`\`

### 创建valarray

\`\`\`cpp
#include <valarray>

// 默认构造
std::valarray<int> v1;

// 指定大小
std::valarray<int> v2(10);  // 10个元素，值为0

// 指定大小和初始值
std::valarray<int> v3(5, 10);  // 10个元素，值为5

// 初始化列表
std::valarray<int> v4 = {1, 2, 3, 4, 5};

// 从数组构造
int arr[] = {1, 2, 3, 4, 5};
std::valarray<int> v5(arr, 5);
\`\`\`

### 元素访问

\`\`\`cpp
#include <valarray>

std::valarray<int> v = {1, 2, 3, 4, 5};

// 下标访问
int val = v[0];  // 1
v[0] = 10;

// 大小
size_t n = v.size();
\`\`\`

### 整体操作

\`\`\`cpp
#include <valarray>

std::valarray<int> v1 = {1, 2, 3, 4, 5};
std::valarray<int> v2 = {5, 4, 3, 2, 1};

// 算术运算
auto r1 = v1 + v2;  // {6, 6, 6, 6, 6}
auto r2 = v1 - v2;  // {-4, -2, 0, 2, 4}
auto r3 = v1 * v2;  // {5, 8, 9, 8, 5}
auto r4 = v1 / v2;  // {0, 0, 1, 2, 5}

// 与标量运算
auto r5 = v1 + 10;  // {11, 12, 13, 14, 15}
auto r6 = v1 * 2;   // {2, 4, 6, 8, 10}

// 复合赋值
v1 += v2;
v1 *= 2;
\`\`\`

### 数学函数

\`\`\`cpp
#include <valarray>
#include <cmath>

std::valarray<double> v = {1.0, 2.0, 3.0, 4.0, 5.0};

// 数学函数（对每个元素）
auto r1 = std::abs(v);
auto r2 = std::sqrt(v);
auto r3 = std::pow(v, 2);
auto r4 = std::exp(v);
auto r5 = std::log(v);
auto r6 = std::sin(v);
auto r7 = std::cos(v);

// 三角函数
auto r8 = std::tan(v);
auto r9 = std::asin(v);
auto r10 = std::acos(v);
auto r11 = std::atan(v);
\`\`\`

### 聚合操作

\`\`\`cpp
#include <valarray>

std::valarray<int> v = {1, 2, 3, 4, 5};

// 求和
int sum = v.sum();  // 15

// 最小值
int min = v.min();  // 1

// 最大值
int max = v.max();  // 5

// 位移
auto shifted = v.cshift(2);  // 循环左移2位：{3, 4, 5, 1, 2}
auto shifted2 = v.cshift(-1);  // 循环右移1位：{5, 1, 2, 3, 4}
\`\`\`

### 切片操作

\`\`\`cpp
#include <valarray>

std::valarray<int> v = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

// slice：起始位置、长度、步长
std::slice s(0, 5, 2);  // 从位置0开始，取5个，步长2
auto sub = v[s];  // {0, 2, 4, 6, 8}

// gslice：通用切片
std::gslice gs(1, {2, 3}, {4, 1});  // 复杂切片

// mask_array：条件选择
std::valarray<bool> mask = {true, false, true, false, true, 
                            false, true, false, true, false};
auto selected = v[mask];  // {0, 2, 4, 6, 8}

// indirect_array：索引选择
std::valarray<size_t> indices = {0, 2, 4, 6, 8};
auto indirect = v[indices];  // {0, 2, 4, 6, 8}
\`\`\`

### 实用示例

#### 向量运算

\`\`\`cpp
#include <valarray>

// 点积
template<typename T>
T dot(const std::valarray<T>& a, const std::valarray<T>& b) {
    return (a * b).sum();
}

// 向量长度
template<typename T>
T length(const std::valarray<T>& v) {
    return std::sqrt((v * v).sum());
}

// 归一化
template<typename T>
std::valarray<T> normalize(const std::valarray<T>& v) {
    return v / length(v);
}
\`\`\``,
            examples: [
                {
                    title: 'valarray基本操作',
                    code: `#include <iostream>
#include <valarray>
#include <cmath>

int main() {
    // 创建valarray
    std::valarray<int> v1 = {1, 2, 3, 4, 5};
    std::valarray<int> v2 = {5, 4, 3, 2, 1};
    
    std::cout << "v1: ";
    for (int x : v1) std::cout << x << " ";
    std::cout << std::endl;
    
    std::cout << "v2: ";
    for (int x : v2) std::cout << x << " ";
    std::cout << std::endl;
    
    // 算术运算
    std::cout << "\\n算术运算:" << std::endl;
    std::cout << "v1 + v2: ";
    for (int x : v1 + v2) std::cout << x << " ";
    std::cout << std::endl;
    
    std::cout << "v1 * v2: ";
    for (int x : v1 * v2) std::cout << x << " ";
    std::cout << std::endl;
    
    std::cout << "v1 * 2: ";
    for (int x : v1 * 2) std::cout << x << " ";
    std::cout << std::endl;
    
    // 聚合操作
    std::cout << "\\n聚合操作:" << std::endl;
    std::cout << "v1.sum(): " << v1.sum() << std::endl;
    std::cout << "v1.min(): " << v1.min() << std::endl;
    std::cout << "v1.max(): " << v1.max() << std::endl;
    
    // 数学函数
    std::valarray<double> v3 = {1.0, 4.0, 9.0, 16.0, 25.0};
    std::cout << "\\n数学函数:" << std::endl;
    std::cout << "sqrt(v3): ";
    for (double x : std::sqrt(v3)) std::cout << x << " ";
    std::cout << std::endl;
    
    // 切片
    std::valarray<int> v4 = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    std::cout << "\\n切片操作:" << std::endl;
    std::cout << "v4[0:5:2]: ";
    for (int x : v4[std::slice(0, 5, 2)]) std::cout << x << " ";
    std::cout << std::endl;
    
    // 循环移位
    std::cout << "\\n循环移位:" << std::endl;
    std::cout << "v4.cshift(2): ";
    for (int x : v4.cshift(2)) std::cout << x << " ";
    std::cout << std::endl;
    
    return 0;
}`,
                    description: '展示valarray的基本操作。'
                },
                {
                    title: '向量运算',
                    code: `#include <iostream>
#include <valarray>
#include <cmath>

// 点积
template<typename T>
T dot(const std::valarray<T>& a, const std::valarray<T>& b) {
    return (a * b).sum();
}

// 向量长度
template<typename T>
T length(const std::valarray<T>& v) {
    return std::sqrt((v * v).sum());
}

// 归一化
template<typename T>
std::valarray<T> normalize(const std::valarray<T>& v) {
    T len = length(v);
    if (len == 0) return v;
    return v / len;
}

// 角度
template<typename T>
T angle(const std::valarray<T>& a, const std::valarray<T>& b) {
    T cosAngle = dot(a, b) / (length(a) * length(b));
    return std::acos(cosAngle) * 180.0 / M_PI;
}

int main() {
    std::valarray<double> v1 = {1.0, 0.0, 0.0};
    std::valarray<double> v2 = {0.0, 1.0, 0.0};
    std::valarray<double> v3 = {1.0, 1.0, 0.0};
    
    std::cout << "向量运算示例:" << std::endl;
    
    std::cout << "\\nv1 = (1, 0, 0)" << std::endl;
    std::cout << "v2 = (0, 1, 0)" << std::endl;
    std::cout << "v3 = (1, 1, 0)" << std::endl;
    
    std::cout << "\\n点积:" << std::endl;
    std::cout << "v1 · v2 = " << dot(v1, v2) << std::endl;
    std::cout << "v1 · v3 = " << dot(v1, v3) << std::endl;
    
    std::cout << "\\n向量长度:" << std::endl;
    std::cout << "|v1| = " << length(v1) << std::endl;
    std::cout << "|v3| = " << length(v3) << std::endl;
    
    std::cout << "\\n归一化:" << std::endl;
    auto n3 = normalize(v3);
    std::cout << "v3归一化 = (" << n3[0] << ", " << n3[1] << ", " << n3[2] << ")" << std::endl;
    
    std::cout << "\\n夹角:" << std::endl;
    std::cout << "v1与v2夹角 = " << angle(v1, v2) << "°" << std::endl;
    std::cout << "v1与v3夹角 = " << angle(v1, v3) << "°" << std::endl;
    
    return 0;
}`,
                    description: '展示使用valarray进行向量运算。'
                }
            ],
            handsOn: {
                title: '实现统计计算',
                description: '使用valarray实现统计计算函数。',
                initialCode: `#include <iostream>
#include <valarray>
#include <cmath>
#include <vector>

// TODO: 计算平均值
template<typename T>
double mean(const std::valarray<T>& data) {
    // TODO: 计算并返回平均值
    return 0.0;
}

// TODO: 计算方差
template<typename T>
double variance(const std::valarray<T>& data) {
    // TODO: 计算并返回方差
    return 0.0;
}

// TODO: 计算标准差
template<typename T>
double stdDev(const std::valarray<T>& data) {
    // TODO: 计算并返回标准差
    return 0.0;
}

// TODO: 归一化（Z-score）
template<typename T>
std::valarray<double> zScore(const std::valarray<T>& data) {
    // TODO: 计算并返回Z-score归一化结果
    return std::valarray<double>();
}

// TODO: 计算相关系数
template<typename T>
double correlation(const std::valarray<T>& x, const std::valarray<T>& y) {
    // TODO: 计算并返回相关系数
    return 0.0;
}

int main() {
    std::valarray<double> data = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0};
    
    std::cout << "数据: ";
    for (double x : data) std::cout << x << " ";
    std::cout << std::endl;
    
    std::cout << "\\n统计计算:" << std::endl;
    std::cout << "  平均值: " << mean(data) << std::endl;
    std::cout << "  方差: " << variance(data) << std::endl;
    std::cout << "  标准差: " << stdDev(data) << std::endl;
    
    std::cout << "\\nZ-score归一化:" << std::endl;
    auto z = zScore(data);
    std::cout << "  ";
    for (double x : z) std::cout << x << " ";
    std::cout << std::endl;
    
    std::valarray<double> x = {1.0, 2.0, 3.0, 4.0, 5.0};
    std::valarray<double> y = {2.0, 4.0, 6.0, 8.0, 10.0};
    
    std::cout << "\\n相关系数计算:" << std::endl;
    std::cout << "  x: ";
    for (double v : x) std::cout << v << " ";
    std::cout << std::endl;
    std::cout << "  y: ";
    for (double v : y) std::cout << v << " ";
    std::cout << std::endl;
    std::cout << "  相关系数: " << correlation(x, y) << std::endl;
    
    return 0;
}`,
                expectedOutput: `数据: 1 2 3 4 5 6 7 8 9 10 

统计计算:
  平均值: 5.5
  方差: 8.25
  标准差: 2.87228

Z-score归一化:
  -1.5667 -1.2185 -0.8704 -0.5222 -0.1741 0.1741 0.5222 0.8704 1.2185 1.5667 

相关系数计算:
  x: 1 2 3 4 5 
  y: 2 4 6 8 10 
  相关系数: 1`,
                solutionRegex: 'sum|size|sqrt|pow|valarray',
                hint: '使用sum()求和，size()获取大小，sqrt()计算平方根',
                xp: 160
            },
            references: [
                { title: 'valarray', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '数值数组', book: 'C++标准库', chapter: 'valarray' }
            ],
            assistantTips: [
                'valarray专为数值计算优化',
                '支持整体操作，无需循环',
                '切片操作可高效访问子数组',
                '适合向量、矩阵等数学运算'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'valarray的主要用途是？', 
                    options: [
                        { text: '存储字符串' }, 
                        { text: '数值计算', correct: true }, 
                        { text: '文件操作' }, 
                        { text: '网络编程' }
                    ], 
                    explanation: 'valarray专为数值计算设计，支持整体操作。' 
                },
                { 
                    type: 'single', 
                    question: 'v1 + v2对valarray做什么？', 
                    options: [
                        { text: '连接两个数组' }, 
                        { text: '对应元素相加', correct: true }, 
                        { text: '追加v2到v1' }, 
                        { text: '比较大小' }
                    ], 
                    explanation: 'valarray的算术运算对每个对应元素进行操作。' 
                },
                { 
                    type: 'single', 
                    question: 'valarray的sum()方法返回什么？', 
                    options: [
                        { text: '元素个数' }, 
                        { text: '所有元素的和', correct: true }, 
                        { text: '平均值' }, 
                        { text: '第一个元素' }
                    ], 
                    explanation: 'sum()返回所有元素的总和。' 
                },
                { 
                    type: 'single', 
                    question: 'slice(0, 5, 2)表示什么？', 
                    options: [
                        { text: '从位置0到5' }, 
                        { text: '从位置0开始，取5个，步长2', correct: true }, 
                        { text: '从位置2开始，取5个' }, 
                        { text: '从位置0开始，步长5' }
                    ], 
                    explanation: 'slice(起始, 长度, 步长)定义切片。' 
                },
                { 
                    type: 'single', 
                    question: 'cshift(2)对valarray做什么？', 
                    options: [
                        { text: '删除前2个元素' }, 
                        { text: '循环左移2位', correct: true }, 
                        { text: '右移2位' }, 
                        { text: '翻转' }
                    ], 
                    explanation: 'cshift(n)循环移位，正数左移，负数右移。' 
                }
            ]
        },
        {
            id: '19.8',
            title: '数学函数与复数',
            duration: '40分钟',
            difficulty: '进阶',
            xp: 120,
            estimatedXp: 350,
            concepts: `## 数学函数与复数

### 数学函数库

C++提供了丰富的数学函数，主要在<cmath>中。

#### 基本数学函数

\`\`\`cpp
#include <cmath>

// 绝对值
int a1 = std::abs(-5);      // 5
double a2 = std::fabs(-3.14);  // 3.14

// 幂运算
double p1 = std::pow(2, 3);   // 8.0
double p2 = std::sqrt(16);    // 4.0
double p3 = std::cbrt(27);    // 3.0 (立方根)
double p4 = std::hypot(3, 4); // 5.0 (斜边)

// 指数和对数
double e1 = std::exp(1.0);    // e
double e2 = std::exp2(3.0);   // 8.0 (2^3)
double l1 = std::log(e1);     // 1.0
double l2 = std::log10(100);  // 2.0
double l3 = std::log2(8);     // 3.0
\`\`\`

#### 三角函数

\`\`\`cpp
#include <cmath>

double angle = M_PI / 4;  // 45度

// 基本三角函数
double s = std::sin(angle);   // 正弦
double c = std::cos(angle);   // 余弦
double t = std::tan(angle);   // 正切

// 反三角函数
double as = std::asin(0.5);   // 反正弦
double ac = std::acos(0.5);   // 反余弦
double at = std::atan(1.0);   // 反正切

// 双曲函数
double sh = std::sinh(1.0);   // 双曲正弦
double ch = std::cosh(1.0);   // 双曲余弦
double th = std::tanh(1.0);   // 双曲正切
\`\`\`

#### 取整函数

\`\`\`cpp
#include <cmath>

double x = 3.7;
double y = -3.7;

// 向下取整
double f1 = std::floor(x);  // 3.0
double f2 = std::floor(y);  // -4.0

// 向上取整
double c1 = std::ceil(x);   // 4.0
double c2 = std::ceil(y);   // -3.0

// 截断（向零取整）
double t1 = std::trunc(x);  // 3.0
double t2 = std::trunc(y);  // -3.0

// 四舍五入
double r1 = std::round(x);  // 4.0
double r2 = std::round(y);  // -4.0
\`\`\`

### 复数

C++在<complex>中提供了复数支持。

#### 创建复数

\`\`\`cpp
#include <complex>

// 创建复数
std::complex<double> c1(3.0, 4.0);  // 3 + 4i
std::complex<double> c2 = 5.0;       // 5 + 0i
std::complex<double> c3 = {1.0, 2.0}; // 1 + 2i

// 使用字面量（C++14）
using namespace std::complex_literals;
auto c4 = 3.0 + 4.0i;  // 复数
\`\`\`

#### 复数操作

\`\`\`cpp
#include <complex>

std::complex<double> c(3.0, 4.0);

// 访问实部和虚部
double re = c.real();  // 3.0
double im = c.imag();  // 4.0

// 修改
c.real(5.0);
c.imag(6.0);

// 模和辐角
double m = std::abs(c);    // 模（绝对值）
double a = std::arg(c);    // 辐角

// 共轭
auto conj = std::conj(c);
\`\`\`

#### 复数运算

\`\`\`cpp
#include <complex>

std::complex<double> c1(3.0, 4.0);
std::complex<double> c2(1.0, 2.0);

// 算术运算
auto r1 = c1 + c2;  // 加法
auto r2 = c1 - c2;  // 减法
auto r3 = c1 * c2;  // 乘法
auto r4 = c1 / c2;  // 除法

// 复数函数
auto s = std::sqrt(c1);    // 平方根
auto e = std::exp(c1);     // 指数
auto l = std::log(c1);     // 自然对数
auto p = std::pow(c1, 2);  // 幂
\`\`\`

#### 复数三角函数

\`\`\`cpp
#include <complex>

std::complex<double> c(1.0, 1.0);

// 三角函数
auto s = std::sin(c);
auto c_ = std::cos(c);
auto t = std::tan(c);

// 双曲函数
auto sh = std::sinh(c);
auto ch = std::cosh(c);
auto th = std::tanh(c);
\`\`\`

### 数值算法

\`\`\`cpp
#include <numeric>
#include <vector>

std::vector<int> v = {1, 2, 3, 4, 5};

// 累加
int sum = std::accumulate(v.begin(), v.end(), 0);  // 15

// 内积
std::vector<int> v2 = {1, 1, 1, 1, 1};
int dot = std::inner_product(v.begin(), v.end(), v2.begin(), 0);  // 15

// 部分和
std::vector<int> partial(5);
std::partial_sum(v.begin(), v.end(), partial.begin());
// partial = {1, 3, 6, 10, 15}

// 相邻差
std::vector<int> diff(5);
std::adjacent_difference(v.begin(), v.end(), diff.begin());
// diff = {1, 1, 1, 1, 1}
\`\`\``,
            examples: [
                {
                    title: '数学函数示例',
                    code: `#include <iostream>
#include <cmath>
#include <iomanip>

int main() {
    std::cout << std::fixed << std::setprecision(4);
    
    std::cout << "=== 基本数学函数 ===" << std::endl;
    std::cout << "abs(-5): " << std::abs(-5) << std::endl;
    std::cout << "sqrt(16): " << std::sqrt(16) << std::endl;
    std::cout << "pow(2, 10): " << std::pow(2, 10) << std::endl;
    std::cout << "cbrt(27): " << std::cbrt(27) << std::endl;
    
    std::cout << "\\n=== 三角函数 ===" << std::endl;
    double angle = M_PI / 4;
    std::cout << "sin(45°): " << std::sin(angle) << std::endl;
    std::cout << "cos(45°): " << std::cos(angle) << std::endl;
    std::cout << "tan(45°): " << std::tan(angle) << std::endl;
    
    std::cout << "\\n=== 指数对数 ===" << std::endl;
    std::cout << "exp(1): " << std::exp(1.0) << std::endl;
    std::cout << "log(e): " << std::log(std::exp(1.0)) << std::endl;
    std::cout << "log10(100): " << std::log10(100) << std::endl;
    std::cout << "log2(8): " << std::log2(8) << std::endl;
    
    std::cout << "\\n=== 取整函数 ===" << std::endl;
    double x = 3.7;
    std::cout << "x = " << x << std::endl;
    std::cout << "floor(x): " << std::floor(x) << std::endl;
    std::cout << "ceil(x): " << std::ceil(x) << std::endl;
    std::cout << "trunc(x): " << std::trunc(x) << std::endl;
    std::cout << "round(x): " << std::round(x) << std::endl;
    
    std::cout << "\\n=== 特殊值 ===" << std::endl;
    std::cout << "π = " << M_PI << std::endl;
    std::cout << "e = " << M_E << std::endl;
    
    return 0;
}`,
                    description: '展示常用数学函数。'
                },
                {
                    title: '复数运算',
                    code: `#include <iostream>
#include <complex>
#include <cmath>
#include <iomanip>

int main() {
    std::cout << std::fixed << std::setprecision(2);
    
    // 创建复数
    std::complex<double> c1(3.0, 4.0);  // 3 + 4i
    std::complex<double> c2(1.0, 1.0);  // 1 + i
    
    std::cout << "=== 复数基本操作 ===" << std::endl;
    std::cout << "c1 = " << c1 << std::endl;
    std::cout << "c2 = " << c2 << std::endl;
    
    // 访问实部和虚部
    std::cout << "\\n实部和虚部:" << std::endl;
    std::cout << "c1.real() = " << c1.real() << std::endl;
    std::cout << "c1.imag() = " << c1.imag() << std::endl;
    
    // 模和辐角
    std::cout << "\\n模和辐角:" << std::endl;
    std::cout << "|c1| = " << std::abs(c1) << std::endl;
    std::cout << "arg(c1) = " << std::arg(c1) * 180 / M_PI << "°" << std::endl;
    
    // 算术运算
    std::cout << "\\n算术运算:" << std::endl;
    std::cout << "c1 + c2 = " << (c1 + c2) << std::endl;
    std::cout << "c1 - c2 = " << (c1 - c2) << std::endl;
    std::cout << "c1 * c2 = " << (c1 * c2) << std::endl;
    std::cout << "c1 / c2 = " << (c1 / c2) << std::endl;
    
    // 复数函数
    std::cout << "\\n复数函数:" << std::endl;
    std::cout << "sqrt(c1) = " << std::sqrt(c1) << std::endl;
    std::cout << "exp(c1) = " << std::exp(c1) << std::endl;
    std::cout << "conj(c1) = " << std::conj(c1) << std::endl;
    
    // 复数三角函数
    std::cout << "\\n复数三角函数:" << std::endl;
    std::cout << "sin(c2) = " << std::sin(c2) << std::endl;
    std::cout << "cos(c2) = " << std::cos(c2) << std::endl;
    
    // 欧拉公式验证: e^(iπ) + 1 = 0
    std::complex<double> i(0, 1);
    std::complex<double> euler = std::exp(i * M_PI) + 1.0;
    std::cout << "\\n欧拉公式验证: e^(iπ) + 1 = " << euler << std::endl;
    
    return 0;
}`,
                    description: '展示复数运算。'
                }
            ],
            handsOn: {
                title: '实现数学工具函数',
                description: '实现常用的数学工具函数。',
                initialCode: `#include <iostream>
#include <cmath>
#include <complex>
#include <vector>
#include <numeric>

// TODO: 判断是否为素数
bool isPrime(int n) {
    // TODO: 实现素数判断
    return false;
}

// TODO: 计算最大公约数
int gcd(int a, int b) {
    // TODO: 实现最大公约数
    return 0;
}

// TODO: 计算最小公倍数
int lcm(int a, int b) {
    // TODO: 实现最小公倍数
    return 0;
}

// TODO: 计算阶乘
long long factorial(int n) {
    // TODO: 实现阶乘
    return 0;
}

// TODO: 计算斐波那契数
long long fibonacci(int n) {
    // TODO: 实现斐波那契数
    return 0;
}

// TODO: 解二次方程 ax^2 + bx + c = 0
// 返回解的个数和两个解
std::tuple<int, std::complex<double>, std::complex<double>> 
solveQuadratic(double a, double b, double c) {
    // TODO: 实现二次方程求解
    return {0, 0.0, 0.0};
}

int main() {
    // 测试素数
    std::cout << "=== 素数测试 ===" << std::endl;
    for (int i = 2; i <= 20; ++i) {
        if (isPrime(i)) {
            std::cout << i << " ";
        }
    }
    std::cout << std::endl;
    
    // 测试GCD和LCM
    std::cout << "\\n=== GCD和LCM ===" << std::endl;
    std::cout << "gcd(12, 18) = " << gcd(12, 18) << std::endl;
    std::cout << "lcm(12, 18) = " << lcm(12, 18) << std::endl;
    
    // 测试阶乘
    std::cout << "\\n=== 阶乘 ===" << std::endl;
    for (int i = 0; i <= 10; ++i) {
        std::cout << i << "! = " << factorial(i) << std::endl;
    }
    
    // 测试斐波那契
    std::cout << "\\n=== 斐波那契数列 ===" << std::endl;
    for (int i = 0; i <= 10; ++i) {
        std::cout << "F(" << i << ") = " << fibonacci(i) << std::endl;
    }
    
    // 测试二次方程
    std::cout << "\\n=== 二次方程求解 ===" << std::endl;
    auto [n1, x1, x2] = solveQuadratic(1, -5, 6);
    std::cout << "x^2 - 5x + 6 = 0: " << n1 << "个解" << std::endl;
    if (n1 > 0) std::cout << "  x1 = " << x1 << std::endl;
    if (n1 > 1) std::cout << "  x2 = " << x2 << std::endl;
    
    return 0;
}`,
                expectedOutput: `=== 素数测试 ===
2 3 5 7 11 13 17 19 

=== GCD和LCM ===
gcd(12, 18) = 6
lcm(12, 18) = 36

=== 阶乘 ===
0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720
7! = 5040
8! = 40320
9! = 362880
10! = 3628800

=== 斐波那契数列 ===
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34
F(10) = 55

=== 二次方程求解 ===
x^2 - 5x + 6 = 0: 2个解
  x1 = (2,0)
  x2 = (3,0)`,
                solutionRegex: 'sqrt|pow|abs|complex|tuple',
                hint: '素数用试除法，GCD用辗转相除法，二次方程用求根公式',
                xp: 160
            },
            references: [
                { title: '数学函数', book: 'C++ Primer 第五版', chapter: '第17章' },
                { title: '复数', book: 'C++标准库', chapter: 'complex' }
            ],
            assistantTips: [
                'cmath提供丰富的数学函数',
                'complex支持复数运算',
                '数值算法在numeric头文件中',
                '使用M_PI和M_E等常量'
            ],
            quiz: [
                { 
                    type: 'single', 
                    question: 'std::sqrt(-1)的结果是？', 
                    options: [
                        { text: '0' }, 
                        { text: 'NaN（非数字）', correct: true }, 
                        { text: '-1' }, 
                        { text: '1' }
                    ], 
                    explanation: '对负数开平方根在实数范围内无定义，返回NaN。' 
                },
                { 
                    type: 'single', 
                    question: 'complex<double> c(3, 4)的模是多少？', 
                    options: [
                        { text: '3' }, 
                        { text: '4' }, 
                        { text: '5', correct: true }, 
                        { text: '7' }
                    ], 
                    explanation: '模 = sqrt(3² + 4²) = sqrt(9 + 16) = 5。' 
                },
                { 
                    type: 'single', 
                    question: 'floor(-3.7)的结果是？', 
                    options: [
                        { text: '-3' }, 
                        { text: '-4', correct: true }, 
                        { text: '3' }, 
                        { text: '4' }
                    ], 
                    explanation: 'floor向下取整，-3.7向下取整是-4。' 
                },
                { 
                    type: 'single', 
                    question: '如何创建复数 3 + 4i？', 
                    options: [
                        { text: 'complex<double>(3, 4)', correct: true }, 
                        { text: 'complex<double>(4, 3)' }, 
                        { text: 'complex(3, 4)' }, 
                        { text: 'complex<double>(3 + 4i)' }
                    ], 
                    explanation: 'complex<double>(real, imag)创建复数，第一个参数是实部。' 
                },
                { 
                    type: 'single', 
                    question: 'std::pow(2, 10)的结果是？', 
                    options: [
                        { text: '20' }, 
                        { text: '100' }, 
                        { text: '1024', correct: true }, 
                        { text: '512' }
                    ], 
                    explanation: 'pow(2, 10) = 2^10 = 1024。' 
                }
            ]
        }
    ]
};

window.Unit19Data = Unit19Data;