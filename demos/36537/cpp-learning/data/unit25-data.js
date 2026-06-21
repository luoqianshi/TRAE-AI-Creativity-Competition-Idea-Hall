/**
 * 单元25：设计模式与实战项目
 * 学习常用设计模式并通过实战项目巩固C++知识
 */
const Unit25Data = {
    id: 25,
    title: '设计模式与实战项目',
    description: '学习常用设计模式，并通过多个实战项目巩固C++知识，掌握项目构建、测试等工程实践',
    lessons: [
        {
            id: '25.1',
            title: '创建型模式（单例、工厂、建造者）',
            duration: '45分钟',
            difficulty: '中级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 创建型模式

创建型模式关注对象的创建过程，将对象的创建和使用分离，提高系统的灵活性和可扩展性。

### 1. 单例模式（Singleton）

单例模式确保一个类只有一个实例，并提供一个全局访问点。

#### 实现要点

\`\`\`cpp
class Singleton {
private:
    static Singleton* instance;
    Singleton() = default;  // 私有构造函数
    
public:
    // 删除拷贝和赋值
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
    
    // 获取实例
    static Singleton& getInstance() {
        if (instance == nullptr) {
            instance = new Singleton();
        }
        return *instance;
    }
};

Singleton* Singleton::instance = nullptr;
\`\`\`

#### 线程安全的单例（C++11）

\`\`\`cpp
class Singleton {
public:
    static Singleton& getInstance() {
        static Singleton instance;  // C++11保证线程安全
        return instance;
    }
    
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
    
private:
    Singleton() = default;
};
\`\`\`

### 2. 工厂模式（Factory）

工厂模式定义一个创建对象的接口，让子类决定实例化哪一个类。

#### 简单工厂

\`\`\`cpp
enum class ProductType { A, B };

class Product {
public:
    virtual void use() = 0;
    virtual ~Product() = default;
};

class ProductA : public Product {
public:
    void use() override {
        std::cout << "Using Product A" << std::endl;
    }
};

class ProductB : public Product {
public:
    void use() override {
        std::cout << "Using Product B" << std::endl;
    }
};

class Factory {
public:
    static std::unique_ptr<Product> create(ProductType type) {
        switch (type) {
            case ProductType::A:
                return std::make_unique<ProductA>();
            case ProductType::B:
                return std::make_unique<ProductB>();
        }
        return nullptr;
    }
};
\`\`\`

#### 工厂方法

\`\`\`cpp
class Factory {
public:
    virtual std::unique_ptr<Product> create() = 0;
    virtual ~Factory() = default;
};

class FactoryA : public Factory {
public:
    std::unique_ptr<Product> create() override {
        return std::make_unique<ProductA>();
    }
};

class FactoryB : public Factory {
public:
    std::unique_ptr<Product> create() override {
        return std::make_unique<ProductB>();
    }
};
\`\`\`

### 3. 建造者模式（Builder）

建造者模式将复杂对象的构建与表示分离，使得同样的构建过程可以创建不同的表示。

#### 基本实现

\`\`\`cpp
class Computer {
public:
    std::string cpu;
    std::string ram;
    std::string storage;
    std::string gpu;
    
    void show() {
        std::cout << "CPU: " << cpu << "\\n";
        std::cout << "RAM: " << ram << "\\n";
        std::cout << "Storage: " << storage << "\\n";
        std::cout << "GPU: " << gpu << "\\n";
    }
};

class ComputerBuilder {
private:
    Computer computer;
    
public:
    ComputerBuilder& setCPU(const std::string& cpu) {
        computer.cpu = cpu;
        return *this;
    }
    
    ComputerBuilder& setRAM(const std::string& ram) {
        computer.ram = ram;
        return *this;
    }
    
    ComputerBuilder& setStorage(const std::string& storage) {
        computer.storage = storage;
        return *this;
    }
    
    ComputerBuilder& setGPU(const std::string& gpu) {
        computer.gpu = gpu;
        return *this;
    }
    
    Computer build() {
        return computer;
    }
};

// 使用
Computer computer = ComputerBuilder()
    .setCPU("Intel i7")
    .setRAM("16GB")
    .setStorage("512GB SSD")
    .setGPU("RTX 3080")
    .build();
\`\`\`

### 模式选择指南

- **单例模式**：当需要确保只有一个实例时
- **工厂模式**：当创建逻辑复杂或需要根据条件创建不同对象时
- **建造者模式**：当对象有很多可选参数，需要分步构建时`,
            examples: [
                {
                    title: '线程安全的日志系统（单例模式）',
                    code: `#include <iostream>
#include <string>
#include <mutex>
#include <fstream>
#include <chrono>
#include <iomanip>

class Logger {
private:
    std::ofstream logFile;
    std::mutex mtx;
    
    Logger() {
        logFile.open("app.log", std::ios::app);
    }
    
public:
    static Logger& getInstance() {
        static Logger instance;
        return instance;
    }
    
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    void log(const std::string& message) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        
        logFile << "[" << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S") 
                << "] " << message << std::endl;
    }
    
    ~Logger() {
        if (logFile.is_open()) {
            logFile.close();
        }
    }
};

int main() {
    Logger& logger = Logger::getInstance();
    
    logger.log("Application started");
    logger.log("Processing data...");
    logger.log("Application finished");
    
    std::cout << "日志已写入 app.log 文件" << std::endl;
    
    return 0;
}`
                },
                {
                    title: '文档转换器（工厂模式）',
                    code: `#include <iostream>
#include <memory>
#include <string>

// 产品接口
class Document {
public:
    virtual void exportDoc() = 0;
    virtual ~Document() = default;
};

// 具体产品
class PDFDocument : public Document {
public:
    void exportDoc() override {
        std::cout << "导出为PDF格式" << std::endl;
    }
};

class WordDocument : public Document {
public:
    void exportDoc() override {
        std::cout << "导出为Word格式" << std::endl;
    }
};

class HTMLDocument : public Document {
public:
    void exportDoc() override {
        std::cout << "导出为HTML格式" << std::endl;
    }
};

// 工厂
class DocumentFactory {
public:
    enum class Format { PDF, WORD, HTML };
    
    static std::unique_ptr<Document> create(Format format) {
        switch (format) {
            case Format::PDF:
                return std::make_unique<PDFDocument>();
            case Format::WORD:
                return std::make_unique<WordDocument>();
            case Format::HTML:
                return std::make_unique<HTMLDocument>();
        }
        return nullptr;
    }
};

int main() {
    auto pdf = DocumentFactory::create(DocumentFactory::Format::PDF);
    pdf->exportDoc();
    
    auto word = DocumentFactory::create(DocumentFactory::Format::WORD);
    word->exportDoc();
    
    auto html = DocumentFactory::create(DocumentFactory::Format::HTML);
    html->exportDoc();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现配置管理器',
                description: '使用单例模式和建造者模式实现一个灵活的配置管理器。',
                initialCode: `#include <iostream>
#include <string>
#include <map>
#include <memory>

// TODO: 实现配置类
class Config {
private:
    std::map<std::string, std::string> data;
    
public:
    // TODO: 设置配置项
    void set(const std::string& key, const std::string& value) {
        
    }
    
    // TODO: 获取配置项
    std::string get(const std::string& key, const std::string& defaultValue = "") const {
        
    }
    
    // TODO: 打印所有配置
    void print() const {
        
    }
};

// TODO: 实现配置建造者
class ConfigBuilder {
private:
    Config config;
    
public:
    // TODO: 设置服务器地址
    ConfigBuilder& setServer(const std::string& server) {
        
    }
    
    // TODO: 设置端口
    ConfigBuilder& setPort(int port) {
        
    }
    
    // TODO: 设置数据库名
    ConfigBuilder& setDatabase(const std::string& db) {
        
    }
    
    // TODO: 设置超时时间
    ConfigBuilder& setTimeout(int timeout) {
        
    }
    
    // TODO: 构建配置
    Config build() {
        
    }
};

// TODO: 实现配置管理器（单例）
class ConfigManager {
private:
    // TODO: 私有静态实例
    
    // TODO: 私有构造函数
    
public:
    // TODO: 删除拷贝和赋值
    
    // TODO: 获取实例
    
    // TODO: 加载配置
    void loadConfig(const Config& config) {
        
    }
    
    // TODO: 获取配置项
    std::string get(const std::string& key) const {
        
    }
};

int main() {
    // 使用建造者创建配置
    Config config = ConfigBuilder()
        .setServer("localhost")
        .setPort(8080)
        .setDatabase("mydb")
        .setTimeout(30)
        .build();
    
    config.print();
    
    // 使用单例管理配置
    ConfigManager& manager = ConfigManager::getInstance();
    manager.loadConfig(config);
    
    std::cout << "\\n服务器: " << manager.get("server") << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>
#include <map>
#include <memory>

class Config {
private:
    std::map<std::string, std::string> data;
    
public:
    void set(const std::string& key, const std::string& value) {
        data[key] = value;
    }
    
    std::string get(const std::string& key, const std::string& defaultValue = "") const {
        auto it = data.find(key);
        return it != data.end() ? it->second : defaultValue;
    }
    
    void print() const {
        std::cout << "=== 配置信息 ===" << std::endl;
        for (const auto& [key, value] : data) {
            std::cout << key << " = " << value << std::endl;
        }
    }
};

class ConfigBuilder {
private:
    Config config;
    
public:
    ConfigBuilder& setServer(const std::string& server) {
        config.set("server", server);
        return *this;
    }
    
    ConfigBuilder& setPort(int port) {
        config.set("port", std::to_string(port));
        return *this;
    }
    
    ConfigBuilder& setDatabase(const std::string& db) {
        config.set("database", db);
        return *this;
    }
    
    ConfigBuilder& setTimeout(int timeout) {
        config.set("timeout", std::to_string(timeout));
        return *this;
    }
    
    Config build() {
        return config;
    }
};

class ConfigManager {
private:
    Config config;
    
    ConfigManager() = default;
    
public:
    ConfigManager(const ConfigManager&) = delete;
    ConfigManager& operator=(const ConfigManager&) = delete;
    
    static ConfigManager& getInstance() {
        static ConfigManager instance;
        return instance;
    }
    
    void loadConfig(const Config& cfg) {
        config = cfg;
    }
    
    std::string get(const std::string& key) const {
        return config.get(key);
    }
};

int main() {
    Config config = ConfigBuilder()
        .setServer("localhost")
        .setPort(8080)
        .setDatabase("mydb")
        .setTimeout(30)
        .build();
    
    config.print();
    
    ConfigManager& manager = ConfigManager::getInstance();
    manager.loadConfig(config);
    
    std::cout << "\\n服务器: " << manager.get("server") << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '单例模式的主要目的是什么？',
                    options: ['提高性能', '确保类只有一个实例', '简化代码', '支持多线程'],
                    correct: 1,
                    explanation: '单例模式确保一个类只有一个实例，并提供一个全局访问点。'
                },
                {
                    question: 'C++11中，使用static局部变量实现单例有什么优势？',
                    options: ['性能更好', '编译器保证线程安全', '代码更简洁', '支持动态创建'],
                    correct: 1,
                    explanation: 'C++11标准保证静态局部变量的初始化是线程安全的。'
                },
                {
                    question: '工厂模式的主要优势是什么？',
                    options: ['减少内存使用', '将对象创建与使用分离', '提高运行速度', '简化继承关系'],
                    correct: 1,
                    explanation: '工厂模式将对象的创建逻辑封装起来，使客户端代码不需要知道具体创建细节。'
                },
                {
                    question: '建造者模式适合什么场景？',
                    options: ['创建简单对象', '对象有多个可选参数需要分步构建', '需要快速创建大量对象', '对象之间有继承关系'],
                    correct: 1,
                    explanation: '建造者模式适合构建复杂对象，特别是有很多可选参数的对象。'
                },
                {
                    question: '以下哪种情况不适合使用单例模式？',
                    options: ['日志系统', '配置管理器', '需要多个实例的类', '数据库连接池'],
                    correct: 2,
                    explanation: '单例模式适用于只需要一个实例的场景，如果需要多个实例就不适合使用单例。'
                }
            ],
            references: [
                {
                    title: 'Design Patterns - Gang of Four',
                    url: 'https://en.wikipedia.org/wiki/Design_Patterns'
                },
                {
                    title: 'Modern C++ Singleton Pattern',
                    url: 'https://en.cppreference.com/w/cpp/language/static'
                }
            ],
            assistantTips: '单例模式要特别注意线程安全和析构问题。工厂模式可以结合智能指针使用，避免内存泄漏。建造者模式支持链式调用，代码更优雅。'
        },
        {
            id: '25.2',
            title: '结构型模式（适配器、装饰器、代理）',
            duration: '45分钟',
            difficulty: '中级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 结构型模式

结构型模式关注类和对象的组合，通过继承或组合来构建更大的结构。

### 1. 适配器模式（Adapter）

适配器模式将一个类的接口转换成客户希望的另一个接口，使原本不兼容的类可以一起工作。

#### 对象适配器（使用组合）

\`\`\`cpp
// 目标接口
class Target {
public:
    virtual void request() = 0;
    virtual ~Target() = default;
};

// 被适配者
class Adaptee {
public:
    void specificRequest() {
        std::cout << "Specific request" << std::endl;
    }
};

// 适配器
class Adapter : public Target {
private:
    std::unique_ptr<Adaptee> adaptee;
    
public:
    Adapter() : adaptee(std::make_unique<Adaptee>()) {}
    
    void request() override {
        adaptee->specificRequest();
    }
};
\`\`\`

### 2. 装饰器模式（Decorator）

装饰器模式动态地给对象添加额外的职责，比生成子类更为灵活。

#### 基本实现

\`\`\`cpp
// 组件接口
class Coffee {
public:
    virtual std::string getDescription() = 0;
    virtual double getCost() = 0;
    virtual ~Coffee() = default;
};

// 具体组件
class SimpleCoffee : public Coffee {
public:
    std::string getDescription() override {
        return "Simple coffee";
    }
    
    double getCost() override {
        return 10.0;
    }
};

// 装饰器基类
class CoffeeDecorator : public Coffee {
protected:
    std::unique_ptr<Coffee> coffee;
    
public:
    CoffeeDecorator(std::unique_ptr<Coffee> c) : coffee(std::move(c)) {}
};

// 具体装饰器
class MilkDecorator : public CoffeeDecorator {
public:
    MilkDecorator(std::unique_ptr<Coffee> c) 
        : CoffeeDecorator(std::move(c)) {}
    
    std::string getDescription() override {
        return coffee->getDescription() + ", Milk";
    }
    
    double getCost() override {
        return coffee->getCost() + 2.0;
    }
};
\`\`\`

### 3. 代理模式（Proxy）

代理模式为其他对象提供代理以控制对这个对象的访问。

#### 虚拟代理（延迟加载）

\`\`\`cpp
class Image {
public:
    virtual void display() = 0;
    virtual ~Image() = default;
};

class RealImage : public Image {
private:
    std::string filename;
    
public:
    RealImage(const std::string& file) : filename(file) {
        std::cout << "Loading image: " << filename << std::endl;
    }
    
    void display() override {
        std::cout << "Displaying: " << filename << std::endl;
    }
};

class ImageProxy : public Image {
private:
    std::string filename;
    std::unique_ptr<RealImage> realImage;
    
public:
    ImageProxy(const std::string& file) : filename(file) {}
    
    void display() override {
        if (!realImage) {
            realImage = std::make_unique<RealImage>(filename);
        }
        realImage->display();
    }
};
\`\`\`

### 模式选择指南

- **适配器模式**：当需要使用现有类，但其接口与需要的不匹配时
- **装饰器模式**：当需要动态添加功能，且不能使用继承时
- **代理模式**：当需要控制对象访问或延迟加载时`,
            examples: [
                {
                    title: '日志系统装饰器',
                    code: `#include <iostream>
#include <memory>
#include <string>
#include <ctime>

// 日志接口
class Logger {
public:
    virtual void log(const std::string& message) = 0;
    virtual ~Logger() = default;
};

// 基础日志
class ConsoleLogger : public Logger {
public:
    void log(const std::string& message) override {
        std::cout << message << std::endl;
    }
};

// 时间戳装饰器
class TimestampLogger : public Logger {
private:
    std::unique_ptr<Logger> logger;
    
public:
    TimestampLogger(std::unique_ptr<Logger> l) : logger(std::move(l)) {}
    
    void log(const std::string& message) override {
        time_t now = time(nullptr);
        std::string timestamp = ctime(&now);
        timestamp.pop_back();
        logger->log("[" + timestamp + "] " + message);
    }
};

// 日志级别装饰器
class LevelLogger : public Logger {
private:
    std::unique_ptr<Logger> logger;
    std::string level;
    
public:
    LevelLogger(std::unique_ptr<Logger> l, const std::string& lvl)
        : logger(std::move(l)), level(lvl) {}
    
    void log(const std::string& message) override {
        logger->log("[" + level + "] " + message);
    }
};

int main() {
    auto logger = std::make_unique<ConsoleLogger>();
    logger = std::make_unique<TimestampLogger>(std::move(logger));
    logger = std::make_unique<LevelLogger>(std::move(logger), "INFO");
    
    logger->log("Application started");
    logger->log("Processing data");
    
    return 0;
}`
                },
                {
                    title: '数据库连接代理',
                    code: `#include <iostream>
#include <memory>
#include <string>

// 数据库接口
class Database {
public:
    virtual void query(const std::string& sql) = 0;
    virtual ~Database() = default;
};

// 真实数据库连接
class RealDatabase : public Database {
private:
    std::string connectionString;
    
public:
    RealDatabase(const std::string& connStr) : connectionString(connStr) {
        std::cout << "Connecting to database: " << connectionString << std::endl;
    }
    
    void query(const std::string& sql) override {
        std::cout << "Executing: " << sql << std::endl;
    }
    
    ~RealDatabase() {
        std::cout << "Closing database connection" << std::endl;
    }
};

// 连接池代理
class ConnectionPoolProxy : public Database {
private:
    std::string connectionString;
    std::unique_ptr<RealDatabase> connection;
    int maxUses = 3;
    int useCount = 0;
    
public:
    ConnectionPoolProxy(const std::string& connStr) 
        : connectionString(connStr) {}
    
    void query(const std::string& sql) override {
        if (!connection) {
            connection = std::make_unique<RealDatabase>(connectionString);
        }
        
        useCount++;
        connection->query(sql);
        
        if (useCount >= maxUses) {
            std::cout << "Resetting connection..." << std::endl;
            connection.reset();
            useCount = 0;
        }
    }
};

int main() {
    ConnectionPoolProxy db("localhost:5432/mydb");
    
    db.query("SELECT * FROM users");
    db.query("SELECT * FROM products");
    db.query("SELECT * FROM orders");
    db.query("SELECT * FROM customers");
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现文本处理管道',
                description: '使用装饰器模式实现一个文本处理管道，支持多种文本转换。',
                initialCode: `#include <iostream>
#include <memory>
#include <string>
#include <algorithm>
#include <cctype>

// TODO: 文本处理器接口
class TextProcessor {
public:
    virtual std::string process(const std::string& text) = 0;
    virtual ~TextProcessor() = default;
};

// TODO: 基础处理器
class BasicProcessor : public TextProcessor {
public:
    std::string process(const std::string& text) override {
        // TODO: 返回原文本
    }
};

// TODO: 装饰器基类
class TextDecorator : public TextProcessor {
protected:
    std::unique_ptr<TextProcessor> processor;
    
public:
    TextDecorator(std::unique_ptr<TextProcessor> p) : processor(std::move(p)) {}
};

// TODO: 大写转换装饰器
class UpperCaseDecorator : public TextDecorator {
public:
    UpperCaseDecorator(std::unique_ptr<TextProcessor> p) 
        : TextDecorator(std::move(p)) {}
    
    std::string process(const std::string& text) override {
        // TODO: 转换为大写
    }
};

// TODO: 去除空格装饰器
class TrimDecorator : public TextDecorator {
public:
    TrimDecorator(std::unique_ptr<TextProcessor> p) 
        : TextDecorator(std::move(p)) {}
    
    std::string process(const std::string& text) override {
        // TODO: 去除首尾空格
    }
};

int main() {
    std::string text = "  Hello World  ";
    
    auto processor = std::make_unique<BasicProcessor>();
    processor = std::make_unique<TrimDecorator>(std::move(processor));
    processor = std::make_unique<UpperCaseDecorator>(std::move(processor));
    
    std::cout << "原始: '" << text << "'" << std::endl;
    std::cout << "处理后: '" << processor->process(text) << "'" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <memory>
#include <string>
#include <algorithm>
#include <cctype>

class TextProcessor {
public:
    virtual std::string process(const std::string& text) = 0;
    virtual ~TextProcessor() = default;
};

class BasicProcessor : public TextProcessor {
public:
    std::string process(const std::string& text) override {
        return text;
    }
};

class TextDecorator : public TextProcessor {
protected:
    std::unique_ptr<TextProcessor> processor;
    
public:
    TextDecorator(std::unique_ptr<TextProcessor> p) : processor(std::move(p)) {}
};

class UpperCaseDecorator : public TextDecorator {
public:
    UpperCaseDecorator(std::unique_ptr<TextProcessor> p) 
        : TextDecorator(std::move(p)) {}
    
    std::string process(const std::string& text) override {
        std::string result = processor->process(text);
        std::transform(result.begin(), result.end(), result.begin(), ::toupper);
        return result;
    }
};

class TrimDecorator : public TextDecorator {
public:
    TrimDecorator(std::unique_ptr<TextProcessor> p) 
        : TextDecorator(std::move(p)) {}
    
    std::string process(const std::string& text) override {
        std::string result = processor->process(text);
        
        size_t start = result.find_first_not_of(" \\t\\n\\r");
        if (start == std::string::npos) return "";
        
        size_t end = result.find_last_not_of(" \\t\\n\\r");
        return result.substr(start, end - start + 1);
    }
};

int main() {
    std::string text = "  Hello World  ";
    
    auto processor = std::make_unique<BasicProcessor>();
    processor = std::make_unique<TrimDecorator>(std::move(processor));
    processor = std::make_unique<UpperCaseDecorator>(std::move(processor));
    
    std::cout << "原始: '" << text << "'" << std::endl;
    std::cout << "处理后: '" << processor->process(text) << "'" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '适配器模式的主要作用是什么？',
                    options: ['优化性能', '转换接口使不兼容的类可以一起工作', '添加新功能', '控制对象访问'],
                    correct: 1,
                    explanation: '适配器模式将一个类的接口转换成客户希望的另一个接口，使原本不兼容的类可以一起工作。'
                },
                {
                    question: '装饰器模式相比继承的优势是什么？',
                    options: ['性能更好', '可以动态添加功能', '代码更简洁', '支持多线程'],
                    correct: 1,
                    explanation: '装饰器模式可以动态地给对象添加职责，比静态继承更灵活。'
                },
                {
                    question: '以下哪种代理用于延迟加载？',
                    options: ['保护代理', '虚拟代理', '远程代理', '智能引用'],
                    correct: 1,
                    explanation: '虚拟代理用于延迟创建开销大的对象，直到真正需要时才创建。'
                },
                {
                    question: '装饰器模式中，装饰器和被装饰对象应该有什么关系？',
                    options: ['继承关系', '实现相同接口', '没有任何关系', '组合关系'],
                    correct: 1,
                    explanation: '装饰器和被装饰对象实现相同的接口，这样客户端可以透明地使用装饰后的对象。'
                },
                {
                    question: '保护代理的主要作用是什么？',
                    options: ['提高性能', '延迟加载', '控制访问权限', '添加功能'],
                    correct: 2,
                    explanation: '保护代理用于控制对原始对象的访问，可以添加权限检查等逻辑。'
                }
            ],
            references: [
                {
                    title: 'Adapter Pattern',
                    url: 'https://en.wikipedia.org/wiki/Adapter_pattern'
                },
                {
                    title: 'Decorator Pattern',
                    url: 'https://en.wikipedia.org/wiki/Decorator_pattern'
                }
            ],
            assistantTips: '适配器模式适合整合遗留代码或第三方库。装饰器模式可以灵活组合功能，但要注意不要过度使用。代理模式在远程调用、延迟加载、权限控制等场景很有用。'
        },
        {
            id: '25.3',
            title: '行为型模式（观察者、策略、命令）',
            duration: '45分钟',
            difficulty: '中级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 行为型模式

行为型模式关注对象之间的通信、职责划分和算法封装。

### 1. 观察者模式（Observer）

观察者模式定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知。

#### 基本实现

\`\`\`cpp
#include <iostream>
#include <vector>
#include <memory>
#include <string>

// 观察者接口
class Observer {
public:
    virtual void update(const std::string& message) = 0;
    virtual ~Observer() = default;
};

// 被观察者（主题）
class Subject {
private:
    std::vector<std::shared_ptr<Observer>> observers;
    std::string state;
    
public:
    void attach(std::shared_ptr<Observer> observer) {
        observers.push_back(observer);
    }
    
    void setState(const std::string& newState) {
        state = newState;
        notify();
    }
    
    void notify() {
        for (auto& observer : observers) {
            observer->update(state);
        }
    }
};

// 具体观察者
class EmailNotifier : public Observer {
public:
    void update(const std::string& message) override {
        std::cout << "Email notification: " << message << std::endl;
    }
};
\`\`\`

### 2. 策略模式（Strategy）

策略模式定义一系列算法，把它们封装起来，并使它们可以相互替换。

#### 基本实现

\`\`\`cpp
#include <iostream>
#include <memory>
#include <vector>
#include <algorithm>

// 策略接口
class SortStrategy {
public:
    virtual void sort(std::vector<int>& data) = 0;
    virtual std::string getName() = 0;
    virtual ~SortStrategy() = default;
};

// 具体策略
class QuickSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        std::sort(data.begin(), data.end());
    }
    
    std::string getName() override { return "Quick Sort"; }
};

// 上下文
class Sorter {
private:
    std::unique_ptr<SortStrategy> strategy;
    
public:
    void setStrategy(std::unique_ptr<SortStrategy> s) {
        strategy = std::move(s);
    }
    
    void doSort(std::vector<int>& data) {
        if (strategy) {
            std::cout << "Using " << strategy->getName() << std::endl;
            strategy->sort(data);
        }
    }
};
\`\`\`

### 3. 命令模式（Command）

命令模式将请求封装为对象，从而允许用不同的请求对客户进行参数化。

#### 基本实现

\`\`\`cpp
#include <iostream>
#include <memory>
#include <stack>
#include <string>

// 接收者
class Light {
public:
    void turnOn() { std::cout << "Light is ON" << std::endl; }
    void turnOff() { std::cout << "Light is OFF" << std::endl; }
};

// 命令接口
class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual ~Command() = default;
};

// 具体命令
class TurnOnCommand : public Command {
private:
    Light& light;
    
public:
    TurnOnCommand(Light& l) : light(l) {}
    
    void execute() override { light.turnOn(); }
    void undo() override { light.turnOff(); }
};

// 调用者
class RemoteControl {
private:
    std::stack<std::unique_ptr<Command>> history;
    
public:
    void executeCommand(std::unique_ptr<Command> cmd) {
        cmd->execute();
        history.push(std::move(cmd));
    }
    
    void undoLastCommand() {
        if (!history.empty()) {
            history.top()->undo();
            history.pop();
        }
    }
};
\`\`\`

### 模式选择指南

- **观察者模式**：当对象状态改变需要通知其他对象时
- **策略模式**：当需要在运行时选择算法时
- **命令模式**：当需要将操作封装为对象，支持撤销、重做时`,
            examples: [
                {
                    title: '股票价格监控系统（观察者模式）',
                    code: `#include <iostream>
#include <vector>
#include <memory>
#include <string>
#include <iomanip>

class StockObserver {
public:
    virtual void onPriceChange(const std::string& symbol, double oldPrice, double newPrice) = 0;
    virtual ~StockObserver() = default;
};

class Stock {
private:
    std::string symbol;
    double price;
    std::vector<std::shared_ptr<StockObserver>> observers;
    
public:
    Stock(const std::string& sym, double p) : symbol(sym), price(p) {}
    
    void attach(std::shared_ptr<StockObserver> observer) {
        observers.push_back(observer);
    }
    
    void setPrice(double newPrice) {
        double oldPrice = price;
        price = newPrice;
        
        for (auto& observer : observers) {
            observer->onPriceChange(symbol, oldPrice, newPrice);
        }
    }
};

class DisplayPanel : public StockObserver {
public:
    void onPriceChange(const std::string& symbol, double oldPrice, double newPrice) override {
        double change = ((newPrice - oldPrice) / oldPrice) * 100;
        std::cout << "[Display] " << symbol << ": $" << std::fixed << std::setprecision(2) 
                  << newPrice << " (" << (change >= 0 ? "+" : "") << change << "%)" << std::endl;
    }
};

class AlertSystem : public StockObserver {
private:
    double threshold;
    
public:
    AlertSystem(double t) : threshold(t) {}
    
    void onPriceChange(const std::string& symbol, double oldPrice, double newPrice) override {
        double changePercent = std::abs((newPrice - oldPrice) / oldPrice * 100);
        if (changePercent >= threshold) {
            std::cout << "[ALERT] " << symbol << " price changed by " 
                      << changePercent << "%!" << std::endl;
        }
    }
};

int main() {
    Stock apple("AAPL", 150.0);
    
    auto display = std::make_shared<DisplayPanel>();
    auto alert = std::make_shared<AlertSystem>(5.0);
    
    apple.attach(display);
    apple.attach(alert);
    
    apple.setPrice(155.0);
    apple.setPrice(165.0);
    
    return 0;
}`
                },
                {
                    title: '支付系统（策略模式）',
                    code: `#include <iostream>
#include <memory>
#include <string>

class PaymentStrategy {
public:
    virtual void pay(double amount) = 0;
    virtual std::string getName() = 0;
    virtual ~PaymentStrategy() = default;
};

class CreditCardPayment : public PaymentStrategy {
private:
    std::string cardNumber;
    
public:
    CreditCardPayment(const std::string& num) : cardNumber(num) {}
    
    void pay(double amount) override {
        std::cout << "Paid $" << amount << " using Credit Card" << std::endl;
    }
    
    std::string getName() override { return "Credit Card"; }
};

class AlipayPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        std::cout << "Paid $" << amount << " using Alipay" << std::endl;
    }
    
    std::string getName() override { return "Alipay"; }
};

class PaymentProcessor {
private:
    std::unique_ptr<PaymentStrategy> strategy;
    
public:
    void setPaymentStrategy(std::unique_ptr<PaymentStrategy> s) {
        strategy = std::move(s);
    }
    
    void processPayment(double amount) {
        if (strategy) {
            std::cout << "Processing via " << strategy->getName() << "..." << std::endl;
            strategy->pay(amount);
        }
    }
};

int main() {
    PaymentProcessor processor;
    
    processor.setPaymentStrategy(std::make_unique<CreditCardPayment>("1234567890"));
    processor.processPayment(99.99);
    
    processor.setPaymentStrategy(std::make_unique<AlipayPayment>());
    processor.processPayment(49.50);
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现文本编辑器命令系统',
                description: '使用命令模式实现一个支持撤销/重做的文本编辑器。',
                initialCode: `#include <iostream>
#include <memory>
#include <string>
#include <stack>

// TODO: 文档类
class Document {
private:
    std::string content;
    
public:
    void insert(const std::string& text) {
        content += text;
    }
    
    std::string getContent() const { return content; }
};

// TODO: 命令接口
class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual ~Command() = default;
};

// TODO: 插入命令
class InsertCommand : public Command {
private:
    Document& doc;
    std::string text;
    
public:
    InsertCommand(Document& d, const std::string& t) : doc(d), text(t) {}
    
    void execute() override {
        // TODO: 插入文本
    }
    
    void undo() override {
        // TODO: 删除最后插入的文本
    }
};

// TODO: 编辑器
class Editor {
private:
    Document document;
    std::stack<std::unique_ptr<Command>> undoStack;
    
public:
    void executeCommand(std::unique_ptr<Command> cmd) {
        // TODO: 执行命令并加入撤销栈
    }
    
    void undo() {
        // TODO: 撤销最后一个命令
    }
    
    void showContent() {
        std::cout << "Content: " << document.getContent() << std::endl;
    }
};

int main() {
    Editor editor;
    
    // TODO: 测试命令
    
    return 0;
}`,
                solution: `#include <iostream>
#include <memory>
#include <string>
#include <stack>

class Document {
private:
    std::string content;
    
public:
    void insert(const std::string& text) {
        content += text;
    }
    
    void erase(size_t len) {
        if (content.length() >= len) {
            content.erase(content.length() - len);
        }
    }
    
    std::string getContent() const { return content; }
};

class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual ~Command() = default;
};

class InsertCommand : public Command {
private:
    Document& doc;
    std::string text;
    
public:
    InsertCommand(Document& d, const std::string& t) : doc(d), text(t) {}
    
    void execute() override {
        doc.insert(text);
    }
    
    void undo() override {
        doc.erase(text.length());
    }
};

class Editor {
private:
    Document document;
    std::stack<std::unique_ptr<Command>> undoStack;
    
public:
    void executeCommand(std::unique_ptr<Command> cmd) {
        cmd->execute();
        undoStack.push(std::move(cmd));
    }
    
    void undo() {
        if (!undoStack.empty()) {
            undoStack.top()->undo();
            undoStack.pop();
        }
    }
    
    void showContent() {
        std::cout << "Content: " << document.getContent() << std::endl;
    }
};

int main() {
    Editor editor;
    
    editor.executeCommand(std::make_unique<InsertCommand>(editor.document, "Hello "));
    editor.showContent();
    
    editor.executeCommand(std::make_unique<InsertCommand>(editor.document, "World!"));
    editor.showContent();
    
    editor.undo();
    editor.showContent();
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '观察者模式中，主题（Subject）和观察者（Observer）的关系是？',
                    options: ['一对一', '一对多', '多对一', '多对多'],
                    correct: 1,
                    explanation: '观察者模式定义了一对多的依赖关系，一个主题可以有多个观察者。'
                },
                {
                    question: '策略模式的主要优势是什么？',
                    options: ['减少内存使用', '可以在运行时切换算法', '提高运行速度', '简化继承关系'],
                    correct: 1,
                    explanation: '策略模式允许在运行时选择不同的算法实现，提供了灵活性。'
                },
                {
                    question: '命令模式中，撤销（undo）操作是如何实现的？',
                    options: ['删除命令对象', '调用命令的undo方法', '恢复之前的状态', '重新执行命令'],
                    correct: 1,
                    explanation: '命令对象通常提供execute和undo两个方法，undo方法用于撤销操作。'
                },
                {
                    question: '以下哪种情况最适合使用观察者模式？',
                    options: ['需要排序数据', '对象状态改变需要通知其他对象', '需要延迟加载', '需要控制访问权限'],
                    correct: 1,
                    explanation: '观察者模式适合当一个对象状态改变需要通知其他对象的场景。'
                },
                {
                    question: '策略模式中，上下文（Context）的作用是什么？',
                    options: ['定义算法接口', '维护策略引用并调用策略方法', '实现具体算法', '创建策略对象'],
                    correct: 1,
                    explanation: '上下文维护对策略对象的引用，并在需要时调用策略的方法。'
                }
            ],
            references: [
                {
                    title: 'Observer Pattern',
                    url: 'https://en.wikipedia.org/wiki/Observer_pattern'
                },
                {
                    title: 'Strategy Pattern',
                    url: 'https://en.wikipedia.org/wiki/Strategy_pattern'
                }
            ],
            assistantTips: '观察者模式在GUI编程、事件系统中很常见。策略模式可以避免大量的if-else语句。命令模式特别适合实现撤销/重做功能。'
        },
        {
            id: '25.4',
            title: 'C++ 惯用法：Pimpl、CRTP、RAII',
            duration: '50分钟',
            difficulty: '高级',
            xp: 220,
            estimatedXp: 440,
            concepts: `## C++ 惯用法

C++惯用法是经过实践验证的编程技巧，可以提高代码质量、性能和可维护性。

### 1. Pimpl 惯用法（Pointer to Implementation）

Pimpl将类的实现细节隐藏在指针后面，减少编译依赖。

#### 基本实现

\`\`\`cpp
// Widget.h
#pragma once
#include <memory>

class Widget {
public:
    Widget();
    ~Widget();
    
    void doSomething();
    
private:
    class Impl;              // 前向声明
    std::unique_ptr<Impl> pImpl;  // 指向实现的指针
};

// Widget.cpp
#include "Widget.h"
#include <string>
#include <vector>

class Widget::Impl {
public:
    std::string name;
    std::vector<int> data;
    
    void doSomething() {
        // 实现细节
    }
};

Widget::Widget() : pImpl(std::make_unique<Impl>()) {}
Widget::~Widget() = default;  // 需要在cpp中定义

void Widget::doSomething() {
    pImpl->doSomething();
}
\`\`\`

#### Pimpl 的优势

1. **减少编译依赖**：修改实现不需要重新编译使用者的代码
2. **二进制兼容性**：可以修改实现而不影响ABI
3. **加快编译速度**：头文件更小，包含更少

### 2. CRTP（Curiously Recurring Template Pattern）

CRTP是一种模板编程技术，派生类作为基类的模板参数。

#### 静态多态

\`\`\`cpp
template <typename Derived>
class Shape {
public:
    double area() {
        return static_cast<Derived*>(this)->area_impl();
    }
};

class Circle : public Shape<Circle> {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    double area_impl() { return 3.14159 * radius * radius; }
};

class Rectangle : public Shape<Rectangle> {
private:
    double width, height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area_impl() { return width * height; }
};
\`\`\`

### 3. RAII（Resource Acquisition Is Initialization）

RAII将资源生命周期与对象生命周期绑定。

#### 基本原则

1. **构造时获取资源**
2. **析构时释放资源**
3. **禁止拷贝，允许移动**

#### 文件管理示例

\`\`\`cpp
class FileHandle {
private:
    FILE* file;
    
public:
    FileHandle(const char* filename, const char* mode) {
        file = fopen(filename, mode);
        if (!file) {
            throw std::runtime_error("Cannot open file");
        }
    }
    
    ~FileHandle() {
        if (file) {
            fclose(file);
        }
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
\`\`\`

### 惯用法选择指南

- **Pimpl**：需要隐藏实现细节、减少编译依赖时
- **CRTP**：需要静态多态、代码复用时
- **RAII**：管理资源（内存、文件、锁等）时`,
            examples: [
                {
                    title: '网络连接类（Pimpl + RAII）',
                    code: `#include <iostream>
#include <memory>
#include <string>

class NetworkConnection {
public:
    NetworkConnection(const std::string& host, int port);
    ~NetworkConnection();
    
    void connect();
    void disconnect();
    void send(const std::string& data);
    bool isConnected() const;
    
private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};

class NetworkConnection::Impl {
private:
    std::string host;
    int port;
    bool connected;
    
public:
    Impl(const std::string& h, int p) 
        : host(h), port(p), connected(false) {}
    
    void connect() {
        std::cout << "Connecting to " << host << ":" << port << std::endl;
        connected = true;
    }
    
    void disconnect() {
        if (connected) {
            std::cout << "Disconnecting" << std::endl;
            connected = false;
        }
    }
    
    void send(const std::string& data) {
        if (!connected) throw std::runtime_error("Not connected");
        std::cout << "Sending: " << data << std::endl;
    }
    
    bool isConnected() const { return connected; }
    
    ~Impl() {
        if (connected) disconnect();
    }
};

NetworkConnection::NetworkConnection(const std::string& host, int port)
    : pImpl(std::make_unique<Impl>(host, port)) {}

NetworkConnection::~NetworkConnection() = default;

void NetworkConnection::connect() { pImpl->connect(); }
void NetworkConnection::disconnect() { pImpl->disconnect(); }
void NetworkConnection::send(const std::string& data) { pImpl->send(data); }
bool NetworkConnection::isConnected() const { return pImpl->isConnected(); }

int main() {
    {
        NetworkConnection conn("example.com", 80);
        conn.connect();
        conn.send("GET / HTTP/1.1");
    }  // 自动断开连接
    
    return 0;
}`
                },
                {
                    title: '计数器类（CRTP）',
                    code: `#include <iostream>
#include <string>

template <typename Derived>
class Counter {
protected:
    static int count;
    
    Counter() { ++count; }
    Counter(const Counter&) { ++count; }
    ~Counter() { --count; }
    
public:
    static int getCount() { return count; }
};

template <typename Derived>
int Counter<Derived>::count = 0;

class Widget : public Counter<Widget> {
private:
    std::string name;
    
public:
    Widget(const std::string& n) : name(n) {
        std::cout << "Created Widget: " << name << std::endl;
    }
    
    ~Widget() {
        std::cout << "Destroyed Widget: " << name << std::endl;
    }
};

class Gadget : public Counter<Gadget> {
public:
    Gadget() { std::cout << "Created Gadget" << std::endl; }
    ~Gadget() { std::cout << "Destroyed Gadget" << std::endl; }
};

int main() {
    std::cout << "Initial Widget count: " << Widget::getCount() << std::endl;
    
    {
        Widget w1("First");
        Widget w2("Second");
        std::cout << "Widget count: " << Widget::getCount() << std::endl;
        
        Gadget g1;
        Gadget g2;
        std::cout << "Gadget count: " << Gadget::getCount() << std::endl;
    }
    
    std::cout << "After scope - Widget count: " << Widget::getCount() << std::endl;
    std::cout << "After scope - Gadget count: " << Gadget::getCount() << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现数据库连接池',
                description: '使用Pimpl和RAII实现一个线程安全的数据库连接池。',
                initialCode: `#include <iostream>
#include <memory>
#include <vector>
#include <mutex>
#include <queue>

// TODO: 数据库连接类
class DatabaseConnection {
public:
    DatabaseConnection(const std::string& connStr);
    ~DatabaseConnection();
    
    void execute(const std::string& query);
    bool isValid() const;
    
private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};

// TODO: 连接池类
class ConnectionPool {
public:
    ConnectionPool(const std::string& connStr, size_t poolSize);
    ~ConnectionPool();
    
    // RAII风格的连接守卫
    class ConnectionGuard {
    private:
        ConnectionPool& pool;
        DatabaseConnection* conn;
        
    public:
        ConnectionGuard(ConnectionPool& p, DatabaseConnection* c);
        ~ConnectionGuard();
        
        DatabaseConnection* operator->() { return conn; }
    };
    
    ConnectionGuard acquire();
    
private:
    std::queue<std::unique_ptr<DatabaseConnection>> pool;
    std::mutex mtx;
};

int main() {
    ConnectionPool pool("localhost:5432/mydb", 5);
    
    {
        auto conn = pool.acquire();
        conn->execute("SELECT * FROM users");
    }  // 自动归还连接
    
    return 0;
}`,
                solution: `#include <iostream>
#include <memory>
#include <vector>
#include <mutex>
#include <queue>

class DatabaseConnection {
private:
    std::string connectionString;
    bool valid;
    
public:
    DatabaseConnection(const std::string& connStr) 
        : connectionString(connStr), valid(true) {
        std::cout << "Creating connection: " << connStr << std::endl;
    }
    
    ~DatabaseConnection() {
        std::cout << "Closing connection" << std::endl;
    }
    
    void execute(const std::string& query) {
        if (!valid) throw std::runtime_error("Invalid connection");
        std::cout << "Executing: " << query << std::endl;
    }
    
    bool isValid() const { return valid; }
};

class ConnectionPool {
private:
    std::queue<std::unique_ptr<DatabaseConnection>> pool;
    std::mutex mtx;
    
public:
    ConnectionPool(const std::string& connStr, size_t poolSize) {
        for (size_t i = 0; i < poolSize; ++i) {
            pool.push(std::make_unique<DatabaseConnection>(connStr));
        }
        std::cout << "Created pool with " << poolSize << " connections" << std::endl;
    }
    
    ~ConnectionPool() {
        std::cout << "Destroying connection pool" << std::endl;
    }
    
    class ConnectionGuard {
    private:
        ConnectionPool& pool;
        DatabaseConnection* conn;
        
    public:
        ConnectionGuard(ConnectionPool& p, DatabaseConnection* c) 
            : pool(p), conn(c) {}
        
        ~ConnectionGuard() {
            std::lock_guard<std::mutex> lock(pool.mtx);
            pool.pool.push(std::unique_ptr<DatabaseConnection>(conn));
        }
        
        DatabaseConnection* operator->() { return conn; }
    };
    
    ConnectionGuard acquire() {
        std::lock_guard<std::mutex> lock(mtx);
        if (pool.empty()) {
            throw std::runtime_error("No available connections");
        }
        
        auto conn = pool.front().release();
        pool.pop();
        return ConnectionGuard(*this, conn);
    }
};

int main() {
    ConnectionPool pool("localhost:5432/mydb", 5);
    
    {
        auto conn = pool.acquire();
        conn->execute("SELECT * FROM users");
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'Pimpl惯用法的主要目的是什么？',
                    options: ['提高运行性能', '隐藏实现细节，减少编译依赖', '简化代码', '支持多线程'],
                    correct: 1,
                    explanation: 'Pimpl将实现细节隐藏在指针后面，修改实现不需要重新编译使用者的代码。'
                },
                {
                    question: 'CRTP相比虚函数的优势是什么？',
                    options: ['更灵活', '编译时多态，无虚函数开销', '支持运行时类型判断', '代码更简洁'],
                    correct: 1,
                    explanation: 'CRTP在编译时确定调用哪个函数，没有虚函数的运行时开销。'
                },
                {
                    question: 'RAII的核心原则是什么？',
                    options: ['资源池化', '资源生命周期与对象生命周期绑定', '延迟分配', '引用计数'],
                    correct: 1,
                    explanation: 'RAII将资源获取放在构造函数中，资源释放放在析构函数中，确保资源正确释放。'
                },
                {
                    question: '以下哪种情况最适合使用Pimpl？',
                    options: ['小型简单类', '需要隐藏实现细节的大型类', '模板类', '抽象基类'],
                    correct: 1,
                    explanation: 'Pimpl适合需要隐藏实现细节、减少编译依赖的大型类。'
                },
                {
                    question: 'CRTP中，基类如何调用派生类的方法？',
                    options: ['虚函数', 'static_cast转换后调用', '模板特化', '函数指针'],
                    correct: 1,
                    explanation: 'CRTP通过static_cast<Derived*>(this)将基类指针转换为派生类指针，然后调用派生类方法。'
                }
            ],
            references: [
                {
                    title: 'Pimpl Idiom',
                    url: 'https://en.cppreference.com/w/cpp/language/pimpl'
                },
                {
                    title: 'CRTP',
                    url: 'https://en.wikipedia.org/wiki/Curiously_recurring_template_pattern'
                }
            ],
            assistantTips: 'Pimpl可以显著减少编译时间，但会增加一次指针解引用。CRTP是强大的模板技术，但可能增加编译时间。RAII是C++最重要的惯用法之一。'
        },
        {
            id: '25.5',
            title: '实战项目：命令行学生管理系统',
            duration: '60分钟',
            difficulty: '中级',
            xp: 250,
            estimatedXp: 500,
            concepts: `## 命令行学生管理系统

通过这个项目，综合运用面向对象编程、STL、文件操作等知识。

### 项目需求

1. **学生信息管理**
   - 添加学生
   - 删除学生
   - 修改学生信息
   - 查询学生

2. **成绩管理**
   - 录入成绩
   - 计算平均分
   - 成绩排名

3. **数据持久化**
   - 保存到文件
   - 从文件加载

### 核心类设计

#### 学生类

\`\`\`cpp
class Student {
private:
    std::string id;
    std::string name;
    int age;
    std::vector<double> scores;
    
public:
    Student(const std::string& id, const std::string& name, int age);
    
    // Getters
    std::string getId() const;
    std::string getName() const;
    int getAge() const;
    double getAverageScore() const;
    
    // 成绩管理
    void addScore(double score);
    const std::vector<double>& getScores() const;
    
    // 显示信息
    void display() const;
};
\`\`\`

#### 管理器类

\`\`\`cpp
class StudentManager {
private:
    std::map<std::string, Student> students;  // ID -> Student
    
public:
    // 学生管理
    bool addStudent(const Student& student);
    bool removeStudent(const std::string& id);
    Student* findStudent(const std::string& id);
    
    // 成绩管理
    bool addScore(const std::string& id, double score);
    std::vector<Student*> getTopStudents(int n);
    
    // 显示
    void displayAll() const;
    
    // 文件操作
    bool saveToFile(const std::string& filename);
    bool loadFromFile(const std::string& filename);
};
\`\`\`

### 支持的命令

- \`add <id> <name> <age>\` - 添加学生
- \`remove <id>\` - 删除学生
- \`find <id>\` - 查找学生
- \`score <id> <score>\` - 添加成绩
- \`list\` - 列出所有学生
- \`top <n>\` - 显示前N名学生
- \`save <filename>\` - 保存到文件
- \`load <filename>\` - 从文件加载
- \`help\` - 显示帮助
- \`exit\` - 退出程序`,
            examples: [
                {
                    title: '学生管理系统核心实现',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <iomanip>

class Student {
private:
    std::string id;
    std::string name;
    int age;
    std::vector<double> scores;
    
public:
    Student() : age(0) {}
    Student(const std::string& i, const std::string& n, int a) 
        : id(i), name(n), age(a) {}
    
    std::string getId() const { return id; }
    std::string getName() const { return name; }
    int getAge() const { return age; }
    
    void setName(const std::string& n) { name = n; }
    void setAge(int a) { age = a; }
    
    void addScore(double score) { scores.push_back(score); }
    
    double getAverageScore() const {
        if (scores.empty()) return 0.0;
        double sum = 0;
        for (double s : scores) sum += s;
        return sum / scores.size();
    }
    
    void display() const {
        std::cout << "ID: " << id << ", Name: " << name 
                  << ", Age: " << age << ", Avg: " 
                  << std::fixed << std::setprecision(2) << getAverageScore() << std::endl;
    }
};

class StudentManager {
private:
    std::map<std::string, Student> students;
    
public:
    bool addStudent(const Student& student) {
        if (students.find(student.getId()) != students.end()) {
            return false;
        }
        students[student.getId()] = student;
        return true;
    }
    
    bool removeStudent(const std::string& id) {
        return students.erase(id) > 0;
    }
    
    Student* findStudent(const std::string& id) {
        auto it = students.find(id);
        return it != students.end() ? &(it->second) : nullptr;
    }
    
    bool addScore(const std::string& id, double score) {
        auto it = students.find(id);
        if (it == students.end()) return false;
        it->second.addScore(score);
        return true;
    }
    
    void displayAll() const {
        std::cout << "\\n=== All Students ===" << std::endl;
        for (const auto& pair : students) {
            pair.second.display();
        }
    }
    
    bool saveToFile(const std::string& filename) {
        std::ofstream file(filename);
        if (!file) return false;
        
        for (const auto& pair : students) {
            const Student& s = pair.second;
            file << s.getId() << " " << s.getName() << " " << s.getAge() << std::endl;
        }
        return true;
    }
};

int main() {
    StudentManager manager;
    
    manager.addStudent(Student("001", "Alice", 20));
    manager.addStudent(Student("002", "Bob", 21));
    
    manager.addScore("001", 95.0);
    manager.addScore("001", 88.0);
    manager.addScore("002", 92.0);
    
    manager.displayAll();
    
    manager.saveToFile("students.txt");
    std::cout << "Data saved to students.txt" << std::endl;
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '扩展学生管理系统',
                description: '为学生管理系统添加课程管理和成绩统计功能。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <map>

// TODO: 课程类
class Course {
private:
    std::string code;
    std::string name;
    int credits;
    
public:
    // TODO: 构造函数和getter方法
};

// TODO: 扩展学生类，支持多门课程成绩
class Student {
private:
    std::string id;
    std::string name;
    std::map<std::string, double> courseScores;  // 课程代码 -> 成绩
    
public:
    // TODO: 添加课程成绩
    void addCourseScore(const std::string& courseCode, double score) {
        
    }
    
    // TODO: 获取加权平均分（考虑学分）
    double getWeightedAverage(const std::map<std::string, Course>& courses) const {
        
    }
};

// TODO: 扩展管理器类，支持课程管理
class StudentManager {
private:
    std::map<std::string, Student> students;
    std::map<std::string, Course> courses;
    
public:
    // TODO: 添加课程
    bool addCourse(const Course& course) {
        
    }
    
    // TODO: 为学生添加课程成绩
    bool addCourseScore(const std::string& studentId, 
                       const std::string& courseCode, 
                       double score) {
        
    }
    
    // TODO: 显示学生成绩单
    void displayTranscript(const std::string& studentId) {
        
    }
};

int main() {
    // TODO: 测试新功能
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <iomanip>

class Course {
private:
    std::string code;
    std::string name;
    int credits;
    
public:
    Course(const std::string& c, const std::string& n, int cr) 
        : code(c), name(n), credits(cr) {}
    
    std::string getCode() const { return code; }
    std::string getName() const { return name; }
    int getCredits() const { return credits; }
};

class Student {
private:
    std::string id;
    std::string name;
    std::map<std::string, double> courseScores;
    
public:
    Student(const std::string& i, const std::string& n) : id(i), name(n) {}
    
    void addCourseScore(const std::string& courseCode, double score) {
        courseScores[courseCode] = score;
    }
    
    double getWeightedAverage(const std::map<std::string, Course>& courses) const {
        double totalPoints = 0;
        int totalCredits = 0;
        
        for (const auto& [code, score] : courseScores) {
            auto courseIt = courses.find(code);
            if (courseIt != courses.end()) {
                totalPoints += score * courseIt->second.getCredits();
                totalCredits += courseIt->second.getCredits();
            }
        }
        
        return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
    }
    
    std::string getName() const { return name; }
};

class StudentManager {
private:
    std::map<std::string, Student> students;
    std::map<std::string, Course> courses;
    
public:
    bool addCourse(const Course& course) {
        if (courses.find(course.getCode()) != courses.end()) return false;
        courses[course.getCode()] = course;
        return true;
    }
    
    bool addCourseScore(const std::string& studentId, 
                       const std::string& courseCode, 
                       double score) {
        auto studentIt = students.find(studentId);
        if (studentIt == students.end()) return false;
        
        if (courses.find(courseCode) == courses.end()) return false;
        
        studentIt->second.addCourseScore(courseCode, score);
        return true;
    }
    
    void displayTranscript(const std::string& studentId) {
        auto studentIt = students.find(studentId);
        if (studentIt == students.end()) {
            std::cout << "Student not found." << std::endl;
            return;
        }
        
        std::cout << "\\n=== Transcript for " << studentIt->second.getName() << " ===" << std::endl;
        std::cout << "Weighted Average: " << std::fixed << std::setprecision(2) 
                  << studentIt->second.getWeightedAverage(courses) << std::endl;
    }
};

int main() {
    StudentManager manager;
    
    manager.addCourse(Course("CS101", "Programming", 4));
    manager.addCourse(Course("MATH101", "Calculus", 3));
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '在学生管理系统中，使用std::map存储学生的主要优势是什么？',
                    options: ['内存占用更小', '查找效率高（O(log n)）', '插入速度最快', '支持随机访问'],
                    correct: 1,
                    explanation: 'std::map基于红黑树实现，查找效率为O(log n)，适合按ID快速查找学生。'
                },
                {
                    question: '文件保存时，为什么要使用std::ofstream而不是std::ifstream？',
                    options: ['性能更好', 'ofstream用于输出（写入），ifstream用于输入（读取）', '支持二进制模式', '自动处理异常'],
                    correct: 1,
                    explanation: 'ofstream用于文件输出（写入），ifstream用于文件输入（读取），这是它们的职责分工。'
                },
                {
                    question: '计算平均分时，为什么要检查scores是否为空？',
                    options: ['性能优化', '避免除以零的错误', '代码规范', '编译器要求'],
                    correct: 1,
                    explanation: '如果scores为空，除以scores.size()（即0）会导致除以零错误。'
                },
                {
                    question: '使用std::istringstream解析命令的好处是什么？',
                    options: ['性能更好', '自动处理空格分隔的单词', '支持正则表达式', '内存占用更小'],
                    correct: 1,
                    explanation: 'istringstream可以方便地按空格分割字符串，自动提取各个单词。'
                },
                {
                    question: '为什么学生类的getAverageScore方法应该声明为const？',
                    options: ['性能优化', '表示该方法不修改对象状态', '编译器要求', '支持多线程'],
                    correct: 1,
                    explanation: 'const成员函数表示该方法不会修改对象状态，可以在const对象上调用。'
                }
            ],
            references: [
                {
                    title: 'C++ File I/O',
                    url: 'https://en.cppreference.com/w/cpp/io'
                },
                {
                    title: 'Command Pattern',
                    url: 'https://en.wikipedia.org/wiki/Command_pattern'
                }
            ],
            assistantTips: '这个项目综合运用了类设计、STL容器、文件操作等知识。建议先实现基本功能，再逐步扩展。注意错误处理和边界情况的检查。'
        },
        {
            id: '25.6',
            title: '实战项目：多线程聊天服务器',
            duration: '70分钟',
            difficulty: '高级',
            xp: 280,
            estimatedXp: 560,
            concepts: `## 多线程聊天服务器

学习网络编程和多线程编程，实现一个简单的聊天服务器。

### 核心概念

#### Socket 编程基础

\`\`\`cpp
#include <sys/socket.h>
#include <netinet/in.h>

// 创建socket
int serverSocket = socket(AF_INET, SOCK_STREAM, 0);

// 绑定地址
sockaddr_in serverAddr;
serverAddr.sin_family = AF_INET;
serverAddr.sin_port = htons(8080);
serverAddr.sin_addr.s_addr = INADDR_ANY;

bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr));

// 监听
listen(serverSocket, 5);

// 接受连接
int clientSocket = accept(serverSocket, nullptr, nullptr);
\`\`\`

#### 多线程处理

\`\`\`cpp
#include <thread>
#include <vector>

std::vector<std::thread> threads;

// 为每个客户端创建线程
threads.emplace_back([clientSocket]() {
    handleClient(clientSocket);
});

// 等待所有线程
for (auto& t : threads) {
    t.join();
}
\`\`\`

#### 线程同步

\`\`\`cpp
#include <mutex>
#include <vector>

std::mutex mtx;
std::vector<int> clients;

void broadcast(const std::string& message) {
    std::lock_guard<std::mutex> lock(mtx);
    for (int client : clients) {
        send(client, message.c_str(), message.length(), 0);
    }
}
\`\`\`

### 服务器类设计

\`\`\`cpp
class ChatServer {
private:
    int serverSocket;
    std::vector<int> clients;
    std::mutex clientsMutex;
    bool running;
    
public:
    ChatServer(int port);
    ~ChatServer();
    
    void start();
    void stop();
    void broadcast(const std::string& message, int excludeClient = -1);
    void handleClient(int clientSocket);
};
\`\`\``,
            examples: [
                {
                    title: '简单聊天服务器（概念演示）',
                    code: `#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <mutex>

class ChatServer {
private:
    std::vector<std::string> messages;
    std::mutex mtx;
    bool running;
    
public:
    ChatServer() : running(true) {}
    
    void addMessage(const std::string& msg) {
        std::lock_guard<std::mutex> lock(mtx);
        messages.push_back(msg);
        std::cout << "New message: " << msg << std::endl;
    }
    
    void broadcast(const std::string& msg) {
        std::lock_guard<std::mutex> lock(mtx);
        std::cout << "Broadcasting: " << msg << std::endl;
    }
    
    void handleClient(int clientId) {
        for (int i = 0; i < 3; ++i) {
            std::string msg = "Client " + std::to_string(clientId) + " message " + std::to_string(i);
            addMessage(msg);
            broadcast(msg);
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }
    
    void run() {
        std::vector<std::thread> threads;
        
        for (int i = 0; i < 3; ++i) {
            threads.emplace_back(&ChatServer::handleClient, this, i);
        }
        
        for (auto& t : threads) {
            t.join();
        }
    }
};

int main() {
    ChatServer server;
    server.run();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现聊天室功能',
                description: '扩展聊天服务器，支持多个聊天室和私聊功能。',
                initialCode: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <thread>
#include <mutex>

// TODO: 用户类
class User {
private:
    int socket;
    std::string username;
    std::string currentRoom;
    
public:
    User(int sock, const std::string& name) 
        : socket(sock), username(name) {}
    
    int getSocket() const { return socket; }
    std::string getUsername() const { return username; }
    std::string getCurrentRoom() const { return currentRoom; }
    void setCurrentRoom(const std::string& room) { currentRoom = room; }
};

// TODO: 聊天室类
class ChatRoom {
private:
    std::string name;
    std::set<std::string> members;
    
public:
    ChatRoom(const std::string& n) : name(n) {}
    
    bool addMember(const std::string& username) {
        return members.insert(username).second;
    }
    
    bool removeMember(const std::string& username) {
        return members.erase(username) > 0;
    }
    
    const std::set<std::string>& getMembers() const { return members; }
};

// TODO: 聊天服务器类
class AdvancedChatServer {
private:
    std::map<std::string, User> users;
    std::map<std::string, ChatRoom> rooms;
    std::mutex mtx;
    
public:
    bool createRoom(const std::string& roomName) {
        std::lock_guard<std::mutex> lock(mtx);
        if (rooms.find(roomName) != rooms.end()) return false;
        rooms.emplace(roomName, ChatRoom(roomName));
        return true;
    }
    
    bool joinRoom(const std::string& username, const std::string& roomName) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto userIt = users.find(username);
        if (userIt == users.end()) return false;
        
        auto roomIt = rooms.find(roomName);
        if (roomIt == rooms.end()) return false;
        
        userIt->second.setCurrentRoom(roomName);
        roomIt->second.addMember(username);
        
        return true;
    }
    
    void sendRoomMessage(const std::string& sender, 
                        const std::string& roomName, 
                        const std::string& message) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto roomIt = rooms.find(roomName);
        if (roomIt == rooms.end()) return;
        
        std::string fullMsg = "[" + roomName + "] " + sender + ": " + message;
        
        for (const auto& member : roomIt->second.getMembers()) {
            std::cout << "To " << member << ": " << fullMsg << std::endl;
        }
    }
};

int main() {
    AdvancedChatServer server;
    
    server.createRoom("general");
    server.createRoom("random");
    
    std::cout << "Chat rooms created successfully!" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <thread>
#include <mutex>

class User {
private:
    int socket;
    std::string username;
    std::string currentRoom;
    
public:
    User(int sock = -1, const std::string& name = "") 
        : socket(sock), username(name) {}
    
    int getSocket() const { return socket; }
    std::string getUsername() const { return username; }
    std::string getCurrentRoom() const { return currentRoom; }
    void setCurrentRoom(const std::string& room) { currentRoom = room; }
};

class ChatRoom {
private:
    std::string name;
    std::set<std::string> members;
    
public:
    ChatRoom(const std::string& n) : name(n) {}
    
    bool addMember(const std::string& username) {
        return members.insert(username).second;
    }
    
    bool removeMember(const std::string& username) {
        return members.erase(username) > 0;
    }
    
    const std::set<std::string>& getMembers() const { return members; }
};

class AdvancedChatServer {
private:
    std::map<std::string, User> users;
    std::map<std::string, ChatRoom> rooms;
    std::mutex mtx;
    
public:
    bool createRoom(const std::string& roomName) {
        std::lock_guard<std::mutex> lock(mtx);
        if (rooms.find(roomName) != rooms.end()) return false;
        rooms.emplace(roomName, ChatRoom(roomName));
        return true;
    }
    
    bool joinRoom(const std::string& username, const std::string& roomName) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto userIt = users.find(username);
        if (userIt == users.end()) return false;
        
        auto roomIt = rooms.find(roomName);
        if (roomIt == rooms.end()) return false;
        
        userIt->second.setCurrentRoom(roomName);
        roomIt->second.addMember(username);
        
        return true;
    }
    
    void sendRoomMessage(const std::string& sender, 
                        const std::string& roomName, 
                        const std::string& message) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto roomIt = rooms.find(roomName);
        if (roomIt == rooms.end()) return;
        
        std::string fullMsg = "[" + roomName + "] " + sender + ": " + message;
        
        for (const auto& member : roomIt->second.getMembers()) {
            std::cout << "To " << member << ": " << fullMsg << std::endl;
        }
    }
};

int main() {
    AdvancedChatServer server;
    
    server.createRoom("general");
    server.createRoom("random");
    
    std::cout << "Chat rooms created successfully!" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '为什么需要使用mutex保护clients列表？',
                    options: ['提高性能', '防止多线程并发访问导致数据竞争', '减少内存使用', '简化代码'],
                    correct: 1,
                    explanation: '多线程环境下，多个线程可能同时访问和修改clients列表，mutex可以防止数据竞争。'
                },
                {
                    question: 'accept()函数的作用是什么？',
                    options: ['创建socket', '绑定地址', '接受客户端连接', '发送数据'],
                    correct: 2,
                    explanation: 'accept()函数用于接受客户端的连接请求，返回一个新的socket描述符用于与客户端通信。'
                },
                {
                    question: '为什么客户端的接收消息要在单独的线程中运行？',
                    options: ['性能更好', '避免阻塞主线程，实现同时发送和接收', '减少内存', '简化代码'],
                    correct: 1,
                    explanation: 'recv()是阻塞调用，在单独线程中运行可以避免阻塞主线程，实现同时发送和接收消息。'
                },
                {
                    question: 'broadcast函数中，为什么要排除发送者？',
                    options: ['提高性能', '避免发送者收到自己发送的消息', '减少网络流量', '安全考虑'],
                    correct: 1,
                    explanation: '广播消息时通常不需要将消息发回给发送者，所以排除发送者。'
                },
                {
                    question: 'SO_REUSEADDR选项的作用是什么？',
                    options: ['提高性能', '允许重用处于TIME_WAIT状态的地址', '增加缓冲区', '启用加密'],
                    correct: 1,
                    explanation: 'SO_REUSEADDR允许服务器重启后立即重用之前使用的端口，避免"地址已在使用"错误。'
                }
            ],
            references: [
                {
                    title: 'Beej\'s Guide to Network Programming',
                    url: 'https://beej.us/guide/bgnet/'
                },
                {
                    title: 'C++ Threading',
                    url: 'https://en.cppreference.com/w/cpp/thread'
                }
            ],
            assistantTips: '网络编程和多线程编程都比较复杂，建议先理解基本概念，再逐步实现功能。注意错误处理和资源释放。'
        },
        {
            id: '25.7',
            title: '实战项目：基于 STL 的文本分析器',
            duration: '60分钟',
            difficulty: '中级',
            xp: 240,
            estimatedXp: 480,
            concepts: `## 基于 STL 的文本分析器

使用STL容器和算法实现文本分析功能，包括词频统计、搜索、排序等。

### 核心类设计

\`\`\`cpp
class TextAnalyzer {
private:
    std::vector<std::string> lines;
    std::vector<std::string> words;
    std::map<std::string, int> wordFrequency;
    
public:
    bool loadFile(const std::string& filename);
    void processText();
    void analyze();
    
    // 统计功能
    int getTotalLines() const;
    int getTotalWords() const;
    
    // 词频分析
    std::vector<std::pair<std::string, int>> getTopWords(int n);
    
    // 搜索功能
    std::vector<int> findWord(const std::string& word);
};
\`\`\`

### 分词处理

\`\`\`cpp
std::vector<std::string> tokenize(const std::string& text) {
    std::vector<std::string> tokens;
    std::istringstream iss(text);
    std::string word;
    
    while (iss >> word) {
        // 清理标点符号
        word.erase(std::remove_if(word.begin(), word.end(), 
            [](char c) { return std::ispunct(c); }), word.end());
        
        // 转换为小写
        std::transform(word.begin(), word.end(), word.begin(), ::tolower);
        
        if (!word.empty()) {
            tokens.push_back(word);
        }
    }
    
    return tokens;
}
\`\`\``,
            examples: [
                {
                    title: '文本分析器核心实现',
                    code: `#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>
#include <cctype>
#include <iomanip>

class TextAnalyzer {
private:
    std::vector<std::string> words;
    std::map<std::string, int> wordFrequency;
    
public:
    bool loadFile(const std::string& filename) {
        std::ifstream file(filename);
        if (!file) return false;
        
        words.clear();
        wordFrequency.clear();
        
        std::string word;
        while (file >> word) {
            word.erase(std::remove_if(word.begin(), word.end(), ::ispunct), word.end());
            std::transform(word.begin(), word.end(), word.begin(), ::tolower);
            
            if (!word.empty()) {
                words.push_back(word);
                wordFrequency[word]++;
            }
        }
        
        return true;
    }
    
    int getTotalWords() const { return words.size(); }
    
    std::vector<std::pair<std::string, int>> getTopWords(int n) {
        std::vector<std::pair<std::string, int>> result(wordFrequency.begin(), wordFrequency.end());
        
        std::sort(result.begin(), result.end(), 
            [](const auto& a, const auto& b) {
                return a.second > b.second;
            });
        
        if (result.size() > static_cast<size_t>(n)) {
            result.resize(n);
        }
        
        return result;
    }
    
    void displayStatistics() {
        std::cout << "Total words: " << getTotalWords() << std::endl;
        std::cout << "Unique words: " << wordFrequency.size() << std::endl;
        
        std::cout << "\\nTop 5 words:" << std::endl;
        auto top = getTopWords(5);
        for (const auto& [word, count] : top) {
            std::cout << "  " << word << ": " << count << std::endl;
        }
    }
};

int main() {
    TextAnalyzer analyzer;
    
    std::ofstream file("test.txt");
    file << "Hello world! This is a test. Hello again, world!";
    file.close();
    
    if (analyzer.loadFile("test.txt")) {
        analyzer.displayStatistics();
    }
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现高级文本分析功能',
                description: '扩展文本分析器，添加N-gram分析、相似度计算等功能。',
                initialCode: `#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <set>

class AdvancedTextAnalyzer {
private:
    std::vector<std::string> words;
    std::map<std::string, int> wordFrequency;
    
public:
    bool loadFile(const std::string& filename) {
        std::ifstream file(filename);
        if (!file) return false;
        
        words.clear();
        wordFrequency.clear();
        
        std::string word;
        while (file >> word) {
            word.erase(std::remove_if(word.begin(), word.end(), ::ispunct), word.end());
            std::transform(word.begin(), word.end(), word.begin(), ::tolower);
            
            if (!word.empty()) {
                words.push_back(word);
                wordFrequency[word]++;
            }
        }
        
        return true;
    }
    
    // TODO: N-gram分析（连续N个词的组合）
    std::map<std::string, int> generateNgrams(int n) {
        std::map<std::string, int> ngrams;
        
        // TODO: 实现N-gram生成
        
        return ngrams;
    }
    
    // TODO: 计算文本相似度（Jaccard相似度）
    double calculateSimilarity(const std::vector<std::string>& otherWords) {
        // Jaccard相似度 = 交集大小 / 并集大小
        
        return 0.0;
    }
};

int main() {
    AdvancedTextAnalyzer analyzer;
    
    // TODO: 测试各项功能
    
    return 0;
}`,
                solution: `#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <cctype>

class AdvancedTextAnalyzer {
private:
    std::vector<std::string> words;
    std::map<std::string, int> wordFrequency;
    
public:
    bool loadFile(const std::string& filename) {
        std::ifstream file(filename);
        if (!file) return false;
        
        words.clear();
        wordFrequency.clear();
        
        std::string word;
        while (file >> word) {
            word.erase(std::remove_if(word.begin(), word.end(), ::ispunct), word.end());
            std::transform(word.begin(), word.end(), word.begin(), ::tolower);
            
            if (!word.empty()) {
                words.push_back(word);
                wordFrequency[word]++;
            }
        }
        
        return true;
    }
    
    std::map<std::string, int> generateNgrams(int n) {
        std::map<std::string, int> ngrams;
        
        if (words.size() < static_cast<size_t>(n)) return ngrams;
        
        for (size_t i = 0; i <= words.size() - n; ++i) {
            std::string ngram;
            for (int j = 0; j < n; ++j) {
                if (j > 0) ngram += " ";
                ngram += words[i + j];
            }
            ngrams[ngram]++;
        }
        
        return ngrams;
    }
    
    double calculateSimilarity(const std::vector<std::string>& otherWords) {
        std::set<std::string> set1(words.begin(), words.end());
        std::set<std::string> set2(otherWords.begin(), otherWords.end());
        
        std::set<std::string> intersection;
        std::set_intersection(set1.begin(), set1.end(),
                             set2.begin(), set2.end(),
                             std::inserter(intersection, intersection.begin()));
        
        std::set<std::string> unionSet;
        std::set_union(set1.begin(), set1.end(),
                      set2.begin(), set2.end(),
                      std::inserter(unionSet, unionSet.begin()));
        
        return unionSet.empty() ? 0.0 : 
               static_cast<double>(intersection.size()) / unionSet.size();
    }
};

int main() {
    AdvancedTextAnalyzer analyzer;
    
    std::ofstream file("test.txt");
    file << "The quick brown fox jumps over the lazy dog.";
    file.close();
    
    if (analyzer.loadFile("test.txt")) {
        auto bigrams = analyzer.generateNgrams(2);
        std::cout << "Top bigrams:" << std::endl;
        for (const auto& [ngram, count] : bigrams) {
            if (count > 1) {
                std::cout << "  " << ngram << ": " << count << std::endl;
            }
        }
    }
    
    return 0;
}`
            },
            quiz: [
                {
                    question: 'std::remove_if不会真正删除元素，它做了什么？',
                    options: ['删除元素', '将元素移到容器末尾并返回新末尾迭代器', '标记元素为删除', '什么都不做'],
                    correct: 1,
                    explanation: 'std::remove_if将不满足条件的元素移到容器前部，返回新逻辑末尾的迭代器，需要配合erase才能真正删除。'
                },
                {
                    question: '为什么词频统计使用std::map而不是std::vector？',
                    options: ['map更快', 'map自动按键排序，查找效率高', 'vector不支持字符串', 'map占用内存更少'],
                    correct: 1,
                    explanation: 'std::map按键自动排序，查找效率为O(log n)，适合词频统计这种需要频繁查找和更新的场景。'
                },
                {
                    question: 'std::transform函数的作用是什么？',
                    options: ['排序容器', '对每个元素应用函数并存储结果', '删除元素', '查找元素'],
                    correct: 1,
                    explanation: 'std::transform对范围内的每个元素应用指定函数，并将结果存储到目标范围。'
                },
                {
                    question: 'N-gram分析中，bigram表示什么？',
                    options: ['单个词', '连续两个词的组合', '连续三个词的组合', '句子'],
                    correct: 1,
                    explanation: 'bigram是连续两个词的组合，trigram是连续三个词的组合，N-gram是连续N个词的组合。'
                },
                {
                    question: 'Jaccard相似度的计算公式是什么？',
                    options: ['交集大小 / 并集大小', '交集大小 / 交集大小', '并集大小 / 交集大小', '交集大小 * 并集大小'],
                    correct: 0,
                    explanation: 'Jaccard相似度 = 两个集合的交集大小 / 两个集合的并集大小，用于衡量集合相似性。'
                }
            ],
            references: [
                {
                    title: 'STL Algorithms',
                    url: 'https://en.cppreference.com/w/cpp/algorithm'
                },
                {
                    title: 'Text Mining',
                    url: 'https://en.wikipedia.org/wiki/Text_mining'
                }
            ],
            assistantTips: '文本分析是自然语言处理的基础。STL提供了丰富的算法和容器，可以高效地处理文本数据。注意性能优化，特别是处理大文件时。'
        },
        {
            id: '25.8',
            title: '实战项目：2D 游戏基础框架',
            duration: '70分钟',
            difficulty: '高级',
            xp: 280,
            estimatedXp: 560,
            concepts: `## 2D 游戏基础框架

学习游戏开发的基本概念，实现一个简单的2D游戏框架。

### 游戏循环

游戏的核心是游戏循环（Game Loop）：

\`\`\`cpp
while (window.isOpen()) {
    // 1. 处理输入
    processInput();
    
    // 2. 更新游戏状态
    update(deltaTime);
    
    // 3. 渲染
    render();
}
\`\`\`

### 核心概念

#### 游戏对象

\`\`\`cpp
class GameObject {
protected:
    float x, y;           // 位置
    float velocityX, velocityY;  // 速度
    
public:
    virtual void update(float deltaTime) = 0;
    virtual void render() = 0;
    virtual ~GameObject() = default;
};
\`\`\`

#### 场景管理

\`\`\`cpp
class Scene {
protected:
    std::vector<std::unique_ptr<GameObject>> objects;
    
public:
    virtual void update(float deltaTime) {
        for (auto& obj : objects) {
            obj->update(deltaTime);
        }
    }
    
    virtual void render() {
        for (auto& obj : objects) {
            obj->render();
        }
    }
};
\`\`\``,
            examples: [
                {
                    title: '简单游戏框架（控制台版本）',
                    code: `#include <iostream>
#include <vector>
#include <memory>
#include <chrono>
#include <thread>

struct Vector2 {
    float x, y;
    Vector2(float x = 0, float y = 0) : x(x), y(y) {}
    
    Vector2 operator+(const Vector2& other) const {
        return Vector2(x + other.x, y + other.y);
    }
    
    Vector2 operator*(float scalar) const {
        return Vector2(x * scalar, y * scalar);
    }
};

class GameObject {
protected:
    Vector2 position;
    Vector2 velocity;
    char symbol;
    bool active;
    
public:
    GameObject(Vector2 pos, char sym) 
        : position(pos), symbol(sym), active(true) {}
    
    virtual ~GameObject() = default;
    
    virtual void update(float deltaTime) {
        position = position + velocity * deltaTime;
    }
    
    virtual void render() {
        if (active) {
            std::cout << symbol << " at (" << position.x << ", " << position.y << ")" << std::endl;
        }
    }
    
    bool isActive() const { return active; }
    void setActive(bool a) { active = a; }
};

class Player : public GameObject {
private:
    int score;
    
public:
    Player(Vector2 pos) : GameObject(pos, 'P'), score(0) {}
    
    void moveUp() { velocity.y = -10; }
    void moveDown() { velocity.y = 10; }
    void stop() { velocity = Vector2(0, 0); }
    
    void addScore(int s) { score += s; }
    int getScore() const { return score; }
};

class Game {
private:
    std::unique_ptr<Player> player;
    bool running;
    float totalTime;
    
public:
    Game() : running(true), totalTime(0) {
        player = std::make_unique<Player>(Vector2(5, 5));
    }
    
    void update(float deltaTime) {
        player->update(deltaTime);
        totalTime += deltaTime;
    }
    
    void render() {
        std::cout << "=== Game ===" << std::endl;
        std::cout << "Time: " << totalTime << "s" << std::endl;
        std::cout << "Score: " << player->getScore() << std::endl;
        player->render();
    }
    
    void run() {
        auto lastTime = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < 5; ++i) {
            auto currentTime = std::chrono::high_resolution_clock::now();
            float deltaTime = std::chrono::duration<float>(currentTime - lastTime).count();
            lastTime = currentTime;
            
            update(deltaTime);
            render();
            
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }
};

int main() {
    Game game;
    game.run();
    
    return 0;
}`
                }
            ],
            handsOn: {
                title: '实现组件系统',
                description: '为游戏框架实现一个灵活的组件系统，支持组合式游戏对象。',
                initialCode: `#include <iostream>
#include <memory>
#include <string>
#include <map>

// TODO: 组件基类
class Component {
public:
    virtual ~Component() = default;
    virtual void update(float deltaTime) = 0;
};

// TODO: 游戏对象（使用组件）
class Entity {
private:
    std::map<std::string, std::unique_ptr<Component>> components;
    
public:
    template <typename T, typename... Args>
    T* addComponent(Args&&... args) {
        auto comp = std::make_unique<T>(std::forward<Args>(args)...);
        T* ptr = comp.get();
        components[typeid(T).name()] = std::move(comp);
        return ptr;
    }
    
    template <typename T>
    T* getComponent() {
        auto it = components.find(typeid(T).name());
        return it != components.end() ? static_cast<T*>(it->second.get()) : nullptr;
    }
    
    void update(float deltaTime) {
        for (auto& [name, comp] : components) {
            comp->update(deltaTime);
        }
    }
};

// TODO: 位置组件
class TransformComponent : public Component {
private:
    float x, y;
    
public:
    TransformComponent(float x = 0, float y = 0) : x(x), y(y) {}
    
    void update(float deltaTime) override {}
    
    float getX() const { return x; }
    float getY() const { return y; }
    void setPosition(float newX, float newY) { x = newX; y = newY; }
};

int main() {
    Entity entity;
    
    auto transform = entity.addComponent<TransformComponent>(10.0f, 20.0f);
    
    std::cout << "Position: (" << transform->getX() << ", " << transform->getY() << ")" << std::endl;
    
    return 0;
}`,
                solution: `#include <iostream>
#include <memory>
#include <string>
#include <map>
#include <typeinfo>

class Component {
public:
    virtual ~Component() = default;
    virtual void update(float deltaTime) = 0;
};

class Entity {
private:
    std::map<std::string, std::unique_ptr<Component>> components;
    
public:
    template <typename T, typename... Args>
    T* addComponent(Args&&... args) {
        auto comp = std::make_unique<T>(std::forward<Args>(args)...);
        T* ptr = comp.get();
        components[typeid(T).name()] = std::move(comp);
        return ptr;
    }
    
    template <typename T>
    T* getComponent() {
        auto it = components.find(typeid(T).name());
        return it != components.end() ? static_cast<T*>(it->second.get()) : nullptr;
    }
    
    void update(float deltaTime) {
        for (auto& [name, comp] : components) {
            comp->update(deltaTime);
        }
    }
};

class TransformComponent : public Component {
private:
    float x, y;
    
public:
    TransformComponent(float x = 0, float y = 0) : x(x), y(y) {}
    
    void update(float deltaTime) override {}
    
    float getX() const { return x; }
    float getY() const { return y; }
    void setPosition(float newX, float newY) { x = newX; y = newY; }
};

int main() {
    Entity entity;
    
    auto transform = entity.addComponent<TransformComponent>(10.0f, 20.0f);
    
    std::cout << "Position: (" << transform->getX() << ", " << transform->getY() << ")" << std::endl;
    
    return 0;
}`
            },
            quiz: [
                {
                    question: '游戏循环的三个主要步骤是什么？',
                    options: ['加载、运行、退出', '处理输入、更新状态、渲染', '初始化、循环、清理', '创建、更新、销毁'],
                    correct: 1,
                    explanation: '游戏循环的核心是处理输入、更新游戏状态、渲染画面这三个步骤的循环执行。'
                },
                {
                    question: '为什么游戏对象通常使用虚函数？',
                    options: ['性能更好', '支持多态，允许不同类型对象有不同的行为', '减少内存', '简化代码'],
                    correct: 1,
                    explanation: '虚函数支持多态，允许不同类型的游戏对象有各自独特的更新和渲染行为。'
                },
                {
                    question: 'deltaTime的作用是什么？',
                    options: ['计算帧率', '确保游戏在不同帧率下行为一致', '减少内存使用', '提高渲染质量'],
                    correct: 1,
                    explanation: 'deltaTime表示上一帧到当前帧的时间间隔，用于确保游戏在不同帧率下有相同的物理行为。'
                },
                {
                    question: '组件系统的主要优势是什么？',
                    options: ['性能更好', '灵活组合功能，避免继承层次过深', '减少内存', '简化代码'],
                    correct: 1,
                    explanation: '组件系统允许通过组合不同的组件来构建游戏对象，比继承更灵活，避免了深层次的继承结构。'
                },
                {
                    question: '为什么游戏对象的更新和渲染要分开？',
                    options: ['性能优化', '逻辑和显示分离，便于维护和优化', '减少内存', '编译器要求'],
                    correct: 1,
                    explanation: '将更新（逻辑）和渲染（显示）分离，使代码更清晰，便于维护，也允许独立优化逻辑更新和渲染。'
                }
            ],
            references: [
                {
                    title: 'Game Programming Patterns',
                    url: 'https://gameprogrammingpatterns.com/'
                },
                {
                    title: 'Entity Component System',
                    url: 'https://en.wikipedia.org/wiki/Entity_component_system'
                }
            ],
            assistantTips: '游戏开发是一个复杂的领域，建议从简单的控制台游戏开始，逐步学习图形库（如SFML、SDL）。组件系统是现代游戏开发的重要模式。'
        },
        {
            id: '25.9',
            title: '项目构建与 CMake 基础',
            duration: '50分钟',
            difficulty: '中级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 项目构建与 CMake 基础

CMake是一个跨平台的构建系统生成器，用于管理C++项目的构建过程。

### CMakeLists.txt 基本结构

\`\`\`cmake
cmake_minimum_required(VERSION 3.10)
project(MyProject)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(myapp main.cpp)

target_link_libraries(myapp pthread)
\`\`\`

### 多文件项目

\`\`\`cmake
add_executable(myapp
    main.cpp
    student.cpp
    manager.cpp
)
\`\`\`

### 添加库

\`\`\`cmake
add_library(mylib
    lib.cpp
    lib.h
)

target_link_libraries(myapp mylib)
\`\`\`

### 构建步骤

\`\`\`bash
mkdir build
cd build
cmake ..
make
\`\`\``,
            examples: [
                {
                    title: '简单CMake项目',
                    code: `# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(StudentManager)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(student_manager
    main.cpp
    student.cpp
    manager.cpp
)

# main.cpp
#include <iostream>

int main() {
    std::cout << "Student Manager v1.0" << std::endl;
    return 0;
}

# 构建命令
# mkdir build && cd build
# cmake ..
# make
# ./student_manager`
                }
            ],
            handsOn: {
                title: '创建CMake项目',
                description: '为一个包含多个源文件的项目创建CMake构建配置。',
                initialCode: `# TODO: 创建项目结构
# myproject/
# ├── CMakeLists.txt
# ├── src/
# │   ├── main.cpp
# │   ├── student.cpp
# │   └── student.h
# └── lib/
#     ├── utils.cpp
#     └── utils.h

# TODO: 编写CMakeLists.txt
# cmake_minimum_required(VERSION 3.10)
# project(MyProject)

# TODO: 设置C++标准

# TODO: 添加可执行文件

# TODO: 添加库

# TODO: 链接库`,
                solution: `# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(MyProject)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 添加库
add_library(myutils
    lib/utils.cpp
)

# 添加可执行文件
add_executable(myapp
    src/main.cpp
    src/student.cpp
)

# 链接库
target_link_libraries(myapp myutils)

# 包含目录
target_include_directories(myapp PRIVATE 
    \${CMAKE_SOURCE_DIR}/src
    \${CMAKE_SOURCE_DIR}/lib
)`
            },
            quiz: [
                {
                    question: 'CMake的主要作用是什么？',
                    options: ['编译代码', '生成构建系统（如Makefile）', '运行程序', '调试代码'],
                    correct: 1,
                    explanation: 'CMake是一个构建系统生成器，它生成平台特定的构建文件（如Makefile、Visual Studio项目）。'
                },
                {
                    question: 'cmake_minimum_required的作用是什么？',
                    options: ['设置项目名称', '指定最低CMake版本', '设置C++标准', '添加源文件'],
                    correct: 1,
                    explanation: 'cmake_minimum_required指定项目需要的最低CMake版本，确保兼容性。'
                },
                {
                    question: 'add_executable命令的作用是什么？',
                    options: ['添加库', '创建可执行文件目标', '设置编译选项', '链接库'],
                    correct: 1,
                    explanation: 'add_executable定义一个可执行文件目标，指定其源文件。'
                },
                {
                    question: 'target_link_libraries的作用是什么？',
                    options: ['添加源文件', '链接库到目标', '设置包含目录', '添加编译选项'],
                    correct: 1,
                    explanation: 'target_link_libraries将库链接到可执行文件或其他库。'
                },
                {
                    question: '为什么建议在build目录中进行构建？',
                    options: ['性能更好', '保持源代码目录整洁，便于清理构建文件', '减少内存使用', '编译器要求'],
                    correct: 1,
                    explanation: '在单独的build目录中构建可以保持源代码目录整洁，生成的构建文件不会污染源代码，也便于清理。'
                }
            ],
            references: [
                {
                    title: 'CMake Documentation',
                    url: 'https://cmake.org/documentation/'
                },
                {
                    title: 'CMake Tutorial',
                    url: 'https://cmake.org/cmake/help/latest/guide/tutorial/'
                }
            ],
            assistantTips: 'CMake是C++项目构建的事实标准。建议从小项目开始学习，逐步掌握变量、函数、目标等概念。使用out-of-source构建（在单独目录中构建）是好习惯。'
        },
        {
            id: '25.10',
            title: '单元测试（Google Test）与持续集成概念',
            duration: '50分钟',
            difficulty: '中级',
            xp: 200,
            estimatedXp: 400,
            concepts: `## 单元测试与持续集成

单元测试是软件开发中的重要实践，确保代码质量。

### Google Test 基础

\`\`\`cpp
#include <gtest/gtest.h>

TEST(MathTest, Addition) {
    EXPECT_EQ(2 + 2, 4);
    EXPECT_NE(2 + 2, 5);
}

TEST(MathTest, Division) {
    EXPECT_DOUBLE_EQ(10.0 / 3.0, 3.333333333);
    EXPECT_THROW(divide(10, 0), std::runtime_error);
}
\`\`\`

### 断言类型

- **EXPECT_***: 失败时继续执行
- **ASSERT_***: 失败时立即停止

常用断言：
- EXPECT_EQ(expected, actual)
- EXPECT_NE(val1, val2)
- EXPECT_TRUE(condition)
- EXPECT_FALSE(condition)
- EXPECT_STREQ("hello", str)

### 测试夹具（Test Fixture）

\`\`\`cpp
class StudentTest : public ::testing::Test {
protected:
    Student student;
    
    void SetUp() override {
        student = Student("001", "Alice", 20);
    }
    
    void TearDown() override {
        // 清理资源
    }
};

TEST_F(StudentTest, HasValidId) {
    EXPECT_EQ(student.getId(), "001");
}
\`\`\`

### 持续集成（CI）

CI是自动化构建和测试的实践：

1. **代码提交** → 2. **自动构建** → 3. **运行测试** → 4. **报告结果**

常用CI工具：
- GitHub Actions
- GitLab CI
- Jenkins
- Travis CI`,
            examples: [
                {
                    title: 'Google Test示例',
                    code: `#include <gtest/gtest.h>
#include <string>

class Calculator {
public:
    int add(int a, int b) { return a + b; }
    int subtract(int a, int b) { return a - b; }
    int multiply(int a, int b) { return a * b; }
    int divide(int a, int b) {
        if (b == 0) throw std::runtime_error("Division by zero");
        return a / b;
    }
};

TEST(CalculatorTest, Addition) {
    Calculator calc;
    EXPECT_EQ(calc.add(2, 3), 5);
    EXPECT_EQ(calc.add(-1, 1), 0);
}

TEST(CalculatorTest, Division) {
    Calculator calc;
    EXPECT_EQ(calc.divide(10, 2), 5);
    EXPECT_THROW(calc.divide(10, 0), std::runtime_error);
}

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}`
                }
            ],
            handsOn: {
                title: '为学生管理系统编写测试',
                description: '使用Google Test为学生管理系统编写单元测试。',
                initialCode: `#include <gtest/gtest.h>
#include <string>

class Student {
private:
    std::string id;
    std::string name;
    int age;
    
public:
    Student(const std::string& i, const std::string& n, int a)
        : id(i), name(n), age(a) {}
    
    std::string getId() const { return id; }
    std::string getName() const { return name; }
    int getAge() const { return age; }
    
    void setAge(int a) { age = a; }
};

// TODO: 创建测试夹具
class StudentTest : public ::testing::Test {
protected:
    Student student{"001", "Alice", 20};
    
    void SetUp() override {
        // TODO: 初始化
    }
};

// TODO: 测试getId
TEST_F(StudentTest, GetId) {
    // EXPECT_EQ(student.getId(), "001");
}

// TODO: 测试setAge
TEST_F(StudentTest, SetAge) {
    // student.setAge(21);
    // EXPECT_EQ(student.getAge(), 21);
}

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}`,
                solution: `#include <gtest/gtest.h>
#include <string>

class Student {
private:
    std::string id;
    std::string name;
    int age;
    
public:
    Student(const std::string& i, const std::string& n, int a)
        : id(i), name(n), age(a) {}
    
    std::string getId() const { return id; }
    std::string getName() const { return name; }
    int getAge() const { return age; }
    
    void setAge(int a) { age = a; }
};

class StudentTest : public ::testing::Test {
protected:
    Student student{"001", "Alice", 20};
    
    void SetUp() override {
        student = Student("001", "Alice", 20);
    }
};

TEST_F(StudentTest, GetId) {
    EXPECT_EQ(student.getId(), "001");
}

TEST_F(StudentTest, GetName) {
    EXPECT_EQ(student.getName(), "Alice");
}

TEST_F(StudentTest, GetAge) {
    EXPECT_EQ(student.getAge(), 20);
}

TEST_F(StudentTest, SetAge) {
    student.setAge(21);
    EXPECT_EQ(student.getAge(), 21);
}

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}`
            },
            quiz: [
                {
                    question: 'EXPECT_EQ和ASSERT_EQ的主要区别是什么？',
                    options: ['性能不同', 'EXPECT_EQ失败继续执行，ASSERT_EQ失败立即停止', '功能不同', '使用场景不同'],
                    correct: 1,
                    explanation: 'EXPECT_EQ失败时继续执行当前测试，ASSERT_EQ失败时立即停止当前测试。'
                },
                {
                    question: '测试夹具（Test Fixture）的作用是什么？',
                    options: ['提高性能', '为多个测试提供共同的设置和清理', '减少代码', '简化测试'],
                    correct: 1,
                    explanation: '测试夹具为多个测试提供共同的初始化和清理代码，避免重复。'
                },
                {
                    question: '持续集成（CI）的主要目的是什么？',
                    options: ['提高性能', '自动化构建和测试，及早发现问题', '减少代码', '简化部署'],
                    correct: 1,
                    explanation: 'CI通过自动化构建和测试，在代码提交后立即验证，及早发现和修复问题。'
                },
                {
                    question: '以下哪个不是Google Test的断言？',
                    options: ['EXPECT_EQ', 'ASSERT_TRUE', 'CHECK_EQUAL', 'EXPECT_THROW'],
                    correct: 2,
                    explanation: 'CHECK_EQUAL不是Google Test的断言，Google Test使用EXPECT_和ASSERT_前缀的断言。'
                },
                {
                    question: '单元测试应该测试什么？',
                    options: ['所有代码', '公共接口和关键功能', '私有方法', '性能'],
                    correct: 1,
                    explanation: '单元测试应该测试类的公共接口和关键功能，确保行为正确，而不是测试实现细节。'
                }
            ],
            references: [
                {
                    title: 'Google Test Documentation',
                    url: 'https://google.github.io/googletest/'
                },
                {
                    title: 'Continuous Integration',
                    url: 'https://en.wikipedia.org/wiki/Continuous_integration'
                }
            ],
            assistantTips: '单元测试是保证代码质量的重要手段。建议测试驱动开发（TDD）：先写测试，再写实现。持续集成可以自动化测试过程，提高开发效率。'
        }
    ]
};

window.Unit25Data = Unit25Data;