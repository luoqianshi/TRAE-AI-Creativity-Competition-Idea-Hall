import{k as Su,d as Du,l as xu,o as hn,c as Sn,a as Y,F as Pe,r as we,u as oe,t as qn,j as Be,m as Cu,g as Fe,n as yu,p as Iu,h as vu,i as Ru,w as ku,b as Lu,q as Ou,_ as Nu}from"./index-Ht_o06TF.js";import{n as Ue,d as Mu}from"./nav-q_ZgqgCT.js";const Pu=`# 01 · Java 入门与环境搭建
> 零基础：先理解概念，再动手安装；让 "JDK/JVM/JRE/Temurin/OpenJDK" 这些词不再神秘

---

## 一、先搞懂几个名词

零基础同学最容易被 **"JDK / JVM / JRE / Temurin / OpenJDK / javac / JIT"** 这些词搞懵。
我们用一张表 + 一张图把它们讲清楚：

| 名词 | 全称 | 一句话解释 | 你需要它吗？
| --- | --- | --- | --- |
| **JVM** | Java Virtual Machine（Java 虚拟机） | 把 \`.class\` 字节码翻译给 CPU 执行的 "翻译官"。**Java 跨平台的核心**。 | ✅ 运行 Java 程序必须有 |
| **JRE** | Java Runtime Environment（Java 运行环境） | **JVM + 系统库** 的组合包，只够 "跑 Java 程序"，不能 "写/编译"。 | ✅ 普通用户装这个就够了 |
| **JDK** | Java Development Kit（Java 开发工具包） | **JRE + javac 编译器 + 其他工具**。开发者装它，才能把 \`.java\` 编译成 \`.class\`。 | ✅✅ **必须装这个** |
| **javac** | Java Compiler | JDK 里自带的命令行编译器，把 \`.java\` 编译成 \`.class\`。 | 装完 JDK 自动获得 |
| **JIT** | Just-In-Time Compiler（即时编译器） | JVM **内部**的优化工具：把频繁执行的 "热点代码" 再编译成机器码，让 Java 跑得更快，速度接近 C++。 | JVM 内部概念，不用单独装 |
| **OpenJDK** | Open Java Development Kit | Java 的 **开源参考实现**（一个**源代码项目**）。Oracle 把 Java 的源代码贡献给 OpenJDK 社区，所有发行版都基于它二次打包。 | 它是源代码项目，不是你直接下载的那个安装包 |
| **Temurin** | Eclipse Temurin | 由 Eclipse 基金会基于 **OpenJDK 源码**编译发布的 **预编译发行版**（免费、开源、商用也免费）。 | 👉 **本工程推荐下载这个** |
| **Oracle JDK** | Oracle Java SE | Oracle 官方发布的版本。**商用需要收费许可**（个人学习免费）。 | 不推荐 |
| **LTS** | Long Term Support | 长期支持版本，代表这个版本的 Java 会被维护很多年（一般 5~8 年）。 | 装 JDK 17 就是在选 LTS |

它们的关系用一张图表示：

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                  JDK（开发工具包 · 开发者必备）                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           JRE（运行环境 · 给普通用户跑程序）                   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │        JVM（虚拟机 · 真正干活的核心）                  │   │   │
│  │  │   · Class Loader 类加载器                           │   │   │
│  │  │   · 字节码解释执行                                 │   │   │
│  │  │   · GC 垃圾回收器（自动释放内存）                      │   │   │
│  │  │   · JIT 即时编译器（热点代码优化，让 Java 变快）         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │   + Java 标准库（数万类：集合、IO、网络、加密、并发……）          │   │
│  └─────────────────────────────────────────────────────────┘   │
│   + javac 编译器 + javadoc 文档工具 + jar 打包工具 + jdb 调试器... │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

所以一句话总结：**开发者只需要装 JDK，它里面已经包含了 JRE 和 JVM**。普通用户只需要 JRE 即可（不过 2024 年后 Spring Boot / IDEA 通常自带 JDK，你下载的几乎都是 JDK）。

---

## 二、Java 到底是编译型还是解释型？

这个问题面试常问。正确答法：**两者都有（混合模式）**。

\`\`\`
你的 .java 源代码
     │
     │ javac 编译（编译型）
     ▼
   .class 字节码（跨平台的中间语言）
     │
     │ JVM 加载 + 解释执行（解释型）
     ▼
   机器码（OS 真正执行）
     │
     │ JIT 编译热点代码（编译型）
     ▼
   性能接近 C++ 的机器码
\`\`\`

- 第一段（\`.java\` → \`.class\`）是**编译型**：编译一次，到处能跑
- 第二段（\`.class\` → 机器码）默认是**解释型**，逐行执行
- 第三段（JIT）又是**编译型**：热点代码再编译成高效机器码

> 💡 这就是 Java 比 Python 快，但又不如 C++ 快的原因：Java 启动慢（先解释），但跑久了 JIT 发挥作用后非常快。

---

## 三、为什么推荐 Temurin，而不是 "官方 OpenJDK"

### 3.1 OpenJDK 是什么？

OpenJDK 是一个**开源项目**（https://openjdk.org/），它维护着 Java 的源代码。它本身**不**发布可以直接下载安装的 \`.msi\` / \`.dmg\` / \`.tar.gz\` 安装包。

> 打个比方：OpenJDK 就像 **Linux 内核**。你不能直接 "下载内核" 装到电脑上用。你实际用的是 Ubuntu、Debian、CentOS 等**发行版** —— 它们基于同一份内核源码打包出来。

同理，基于 OpenJDK 源码打包的 **JDK 发行版**有很多：

| 发行版 | 维护方 | 说明 |
| --- | --- | --- |
| **Eclipse Temurin** 👍 | Eclipse 基金会（Adoptium 项目） | 开源、免费商用、社区最大、更新及时、TCO 最低 |
| Oracle JDK | Oracle 公司 | "官方"发行，**商用需要付费订阅** |
| OpenJDK 官方构建 | Oracle + 社区 | 每半年打一个 tag，但长期支持版**只有 6 个月公开更新**（企业直接用不稳） |
| Amazon Corretto | 亚马逊 | AWS 生态常见 |
| Azul Zulu | Azul Systems | Docker 镜像流行 |
| Microsoft Build of OpenJDK | 微软 | Azure 生态 |
| Liberica JDK | BellSoft | 支持 ARM，包体小 |
| 国产：龙芯 LoongArch / 华为 openEuler JDK | 国内厂商 | ARM / 国产化需求用 |

### 3.2 为什么选 Temurin（5 个理由）

1. **免费 + 免费商用**：没有许可风险，小团队到大厂直接用
2. **开源全公开**：https://github.com/adoptium 可审计
3. **超长 LTS**：Temurin JDK 17 由 Eclipse 维护到 **至少 2031 年**（比大多数公司的项目存活时间都长）
4. **开箱即用的安装包**：Windows \`.msi\`、macOS \`.dmg\`、Linux \`.deb/.rpm\` 都有，**勾选一个选项就能自动帮你配 \`JAVA_HOME\` + \`PATH\`**
5. **行业广泛认可**：Apache、Netflix、阿里大厂都在用，国内 JD 里也频繁出现 "Temurin JDK 17+"

> 📌 **口诀**："OpenJDK 是源码（Linux kernel），Temurin 是发行版（Ubuntu），**装 Temurin 就够了**。"

### 3.3 为什么不选其它

| 版本 | 不推荐理由 |
| --- | --- |
| Oracle JDK | 商用需要花钱许可 |
| OpenJDK 官方构建 | 只有 6 个月公开支持，企业用不稳 |
| 某某公司定制版 | 往往依赖它家云服务，脱离生态就麻烦 |
| JDK 8 / 11 | 太老，Spring Boot 3 不支持，学了也没新项目用 |
| JDK 22/23 非 LTS | 6 个月就过期，企业没人用 |

---

## 四、版本怎么选？LTS 是什么？

### 4.1 Java 的发布节奏

从 JDK 10 开始，Java 切换到了 **"6 个月发一版 + 3 年一个 LTS"** 的节奏：

- 每 6 个月（3 月 / 9 月）发一个新版本
- 每 3 年左右出一个 **LTS**（Long Term Support，长期支持版）

LTS 与普通版本的对比：

| 版本类型 | 支持时间 | 企业选择 |
| --- | --- | --- |
| LTS（8、11、17、21） | 至少 5 年，Temurin 承诺 8 年以上 | **强烈推荐** |
| 非 LTS（9、10、12、14、15、16、18、19、20、22） | 6 个月 → 下一个版本出来就不再更新 | ❌ 不推荐生产使用 |

### 4.2 本工程选 Temurin JDK 17 的理由

1. **Spring Boot 3.x 最低要求 JDK 17**（本工程主线是 Spring Boot）
2. 比 JDK 8/11 新、比 JDK 21/22 更成熟稳定
3. **Temurin JDK 17 LTS 支持到 2031+**
4. IDEA 社区版支持最好的版本之一
5. **国内互联网公司 Java 后端的主流版本**（2024 年起，JDK 17 已经占比第一）

### 4.3 JDK 8 vs 17 对比（了解即可）

| 特性 | JDK 8 | JDK 17 |
| --- | --- | --- |
| 发布时间 | 2014 | 2021.09 |
| 支持结束 | 2030（付费）/ 2026（公版） | **2031+** |
| 模块系统（JPMS） | — | ✅ |
| Records（不可变数据类） | — | ✅ |
| Pattern Matching（模式匹配） | — | ✅ |
| Sealed Class（密封类） | — | ✅ |
| ZGC 低延迟垃圾回收器 | — | ✅（生产可用） |
| 性能（Startup / Throughput） | 基准线 | **提升 30%+** |
| Docker 容器化支持 | 弱 | 原生一流 |

零基础同学先不用理解这些术语。你只要记住：**"装 Temurin JDK 17"** 就行。

---

## 五、你需要装的工具清单（带版本）

| 工具 | 推荐版本 | 说明 |
| --- | --- | --- |
| **JDK** | **Eclipse Temurin 17 LTS** | 本工程的核心 |
| **Maven** | 3.9.x | Java 包管理工具（**下一章**详解） |
| **IDE** | IntelliJ IDEA Community 2024.x | 免费、社区版够学 |
| **Git** | 最新稳定版 | 代码版本控制（后面会用到） |
| 终端 | Windows Terminal / PowerShell 7 | 随意 |

详细安装步骤见：
- [01b · JDK / Maven 多平台安装详细步骤]
- [01c · IDEA 社区版使用指南]

---

## 六、第一个程序（先看到它能跑）

在 IDEA 里 \`File → New → Project → Java\`：

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Learn Java!");
    }
}
\`\`\`

点击绿色 ▶ 运行，控制台输出：

\`\`\`
Hello, Learn Java!
\`\`\`

**这段代码的每个关键字本章都先不解释**。零基础先做到 "能跑通"。后面章节会一个个拆开讲。

---

## 七、常见坑与排查

| 症状 | 大概率原因 | 解决办法 |
| --- | --- | --- |
| \`java\` 命令找不到 | 环境变量 \`PATH\` 没配好 | 重新打开 PowerShell / 重启电脑；详见 [01b] |
| \`javac\` 能运行，\`java -version\` 却显示 \`1.8\` | 电脑上残留了旧 JDK 8 | 卸载所有旧 JDK，重装 Temurin 17 |
| IDEA 报错 "cannot find symbol" | 项目 SDK 没关联 | \`File → Project Structure → Project SDK\` 选 JDK 17 |
| \`mvn\` 命令不识别 | Maven 环境变量没配 | 见 [01b] 的 Maven 部分 |
| 终端中文乱码 | Windows PowerShell 编码为 GBK | 先执行 \`chcp 65001\` 切到 UTF-8 |
| 提示 "无法验证发布者" | Windows SmartScreen 拦截 | 右键 → "仍要运行"，或者去控制面板临时调低 UAC |

---

## 八、配套 Demo

- \`backend/demo-01-java-basics/\` —— 用本章配置的 JDK + Maven 跑通的第一个工程

---

## 九、面试常见追问（提前背）

1. **JVM / JDK / JRE 三者关系？**
   JVM 是虚拟机（跑程序的核心）；JRE = JVM + 系统库（够跑程序）；JDK = JRE + 编译器等工具（够写程序）。

2. **Java 是编译型还是解释型？**
   两者都有。\`.java\` 先被 javac 编译成字节码（编译型）；字节码在 JVM 里被解释执行，热点代码再被 JIT 编译成机器码（混合模式）。

3. **为什么企业用 Java 8/11/17 这几个 LTS 比较多？**
   只有 LTS 有 5 年以上长期支持；非 LTS 6 个月就结束，风险高。

4. **Temurin 是什么？为什么不装 "官方" Oracle JDK？**
   Temurin 是 Eclipse 基金会基于 OpenJDK 源码打包的免费发行版，商用也免费。Oracle JDK 商用需要订阅，不推荐。

5. **OpenJDK 是什么？能直接装吗？**
   Java 的开源参考实现（**一个源码项目**）。不建议直接下载 OpenJDK 官方构建，它只有 6 个月支持；装 Temurin 这类发行版就好。
`,wu=`# 01b · JDK / Maven 多平台安装详细步骤
> 零基础：跟着截图和命令一步步来，确保你的电脑上能跑 \`java -version\` 和 \`mvn -v\`

---

## 一、环境变量是什么？（概念铺垫）

在装 JDK / Maven 之前，必须先理解三个词：**PATH、JAVA_HOME、MAVEN_HOME**。

| 变量 | 一句话解释 | 为什么需要它？ |
| --- | --- | --- |
| **PATH** | 操作系统的 **"快捷方式目录清单"**：你在终端输入一个命令时，系统会按 PATH 里列出的目录依次查找，看有没有对应的可执行文件（\`java.exe\`、\`mvn.cmd\`、\`javac.exe\`……） | 不加到 PATH，在任意目录输入 \`java\` 就会提示"不是内部或外部命令" |
| **JAVA_HOME** | 指向 **JDK 根目录** 的一个变量（比如 \`C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.12-hotspot\\\`） | 很多工具（IDEA、Maven、Gradle、Tomcat）都会读这个变量来找到 JDK |
| **MAVEN_HOME** | 指向 **Maven 解压目录** 的一个变量（比如 \`D:\\tools\\apache-maven-3.9.9\`） | Maven 命令工具和 IDEA 的 Maven 插件会读它 |

### 记忆法（一句话口诀）

> **"HOME 是地址，PATH 是入口。"**

- \`JAVA_HOME\` 告诉别人：**"JDK 住在哪儿"**（地址）
- \`PATH\` 告诉系统：**"去哪里找可执行命令"**（入口，也就是 \`bin\` 目录）

换句话说，\`JAVA_HOME\\bin\` 就等价于可执行命令所在的路径，把这个路径加到 PATH 里，你就能在任意目录下直接敲 \`java\` 了。

---

## 二、Windows 安装 Temurin JDK 17

### 步骤 1 · 下载

打开 Adoptium 中文官网：

https://adoptium.net/zh-CN/temurin/releases/?version=17&os=windows

页面会自动识别你的系统，直接点击 **.msi 安装包** 下载即可（通常是 64 位 x64 版本）。

> 如果页面弹出的是英文，右上角切换到中文；如果是 ARM 处理器的 Windows（比如部分 Surface / 骁龙本），请选择 **aarch64** 架构。

### 步骤 2 · 安装时勾选 3 个关键选项

运行下载的 \`.msi\` 安装程序，一路下一步，在"自定义设置"（Custom Setup）这一步，**把下列 3 项全部勾选为"整个功能安装到本地硬盘"**：

- ✅ **Add to PATH**（添加到环境变量 PATH）
- ✅ **Set JAVA_HOME variable**（设置 JAVA_HOME 变量）
- ✅ **Associate .jar**（关联 .jar 文件）

勾选完点击"安装"，等进度条走完即可。

### 步骤 3 · 验证（重要！）

安装完成后，**打开一个全新的 PowerShell 窗口**（之前已经打开的不会读取到新环境变量），依次运行以下三条命令：

\`\`\`powershell
java -version
javac -version
echo $env:JAVA_HOME
\`\`\`

预期输出长这样（版本号可能略有不同，不影响）：

\`\`\`
PS C:\\Users\\Tom> java -version
openjdk version "17.0.12" 2024-07-16
OpenJDK Runtime Environment Temurin-17.0.12+7 (build 17.0.12+7, mixed mode, sharing)
OpenJDK 64-Bit Server VM Temurin-17.0.12+7 (build 17.0.12+7, mixed mode, sharing)

PS C:\\Users\\Tom> javac -version
javac 17.0.12

PS C:\\Users\\Tom> echo $env:JAVA_HOME
C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.12-hotspot
\`\`\`

如果三条都能输出类似结果，说明 JDK 安装成功。

### 步骤 4 · 手动配置环境变量的方法（安装时忘了勾选？）

如果你安装时没有勾选上面三个选项，可以手动配：

1. 按 \`Win + R\`，输入 \`sysdm.cpl\` 回车 → 打开"系统属性"
2. 切换到 **高级** 选项卡 → 点击 **环境变量**
3. 在"系统变量"区（下方大框）：
   - 新建变量名 \`JAVA_HOME\`，值填 JDK 根目录，如：
     \`\`\`
     C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.12-hotspot
     \`\`\`
   - 找到已有的 \`Path\` 变量，**编辑**，在末尾加一行：
     \`\`\`
     %JAVA_HOME%\\bin
     \`\`\`
4. 一路确定 → **关闭所有终端重新打开**，再次运行 \`java -version\` 验证。

---

## 三、Windows 安装 Maven 3.9

### 步骤 1 · 下载

打开 Maven 官网的下载页：

https://maven.apache.org/download.cgi

找到 **apache-maven-3.9.x-bin.zip**（3.9 系列最新版即可），下载 zip 包。

> 不要下载 \`src\` 源码包，那是给开发者看的，你要的是 \`bin\` 二进制包。

### 步骤 2 · 解压到一个"干净"的路径

**非常重要**：解压路径 **不要有空格，不要有中文，不要有特殊字符**。

✅ 好路径：\`D:\\tools\\apache-maven-3.9.9\`
❌ 坏路径：\`D:\\我的工具\\Apache Maven 3.9.9\\\`（有中文、有空格）

解压完成后，确认里面能看到 \`bin\` 目录：

\`\`\`
D:\\tools\\apache-maven-3.9.9
├── bin\\
│   ├── mvn.cmd        ← Windows 用这个
│   └── mvn            ← Linux/macOS 用这个
├── conf\\
│   └── settings.xml   ← 后面要改它
├── lib\\
└── README.txt
\`\`\`

### 步骤 3 · 配置环境变量

和 JDK 一样的操作：

1. \`Win + R\` → \`sysdm.cpl\` → 高级 → 环境变量
2. 系统变量区：
   - 新建 \`MAVEN_HOME\`，值：
     \`\`\`
     D:\\tools\\apache-maven-3.9.9
     \`\`\`
   - 编辑 \`Path\`，末尾加一行：
     \`\`\`
     %MAVEN_HOME%\\bin
     \`\`\`
3. 确定 → 关闭所有终端。

### 步骤 4 · 验证

**新开一个 PowerShell**，运行：

\`\`\`powershell
mvn -v
\`\`\`

预期输出（\`Maven home\` 和 \`Java version\` 都要能看到）：

\`\`\`
Apache Maven 3.9.9 (8e8579a4e7f6b2351f544fb13edfe8541340a67c)
Maven home: D:\\tools\\apache-maven-3.9.9
Java version: 17.0.12, vendor: Eclipse Adoptium, runtime: C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.12-hotspot
Default locale: zh_CN, platform encoding: UTF-8
OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"
\`\`\`

### 步骤 5 · 配置阿里云镜像（墙内速度提升 10 倍）

Maven 默认从海外中央仓库下载依赖，速度非常慢。修改 \`conf/settings.xml\` 文件，把中央仓库切换到阿里云镜像。

1. 打开文件：\`D:\\tools\\apache-maven-3.9.9\\conf\\settings.xml\`
2. 找 \`<!-- localRepository -->\` 这一块，把本地仓库路径改成非 C 盘的一个目录（避免 Windows 权限问题 + 系统还原丢失）：

\`\`\`xml
<!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: \${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->
<localRepository>D:\\maven-repo</localRepository>
\`\`\`

3. 在 \`<mirrors>\` 节点（文件中间部分）里，替换或添加下面的阿里云镜像配置：

\`\`\`xml
<mirrors>
  <!-- 阿里云中央仓库镜像（墙内必加） -->
  <mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>

  <!-- 如果你需要 Spring 的快照/里程碑包，可再加一个：
  <mirror>
    <id>aliyun-spring</id>
    <mirrorOf>spring-milestones,spring-snapshots</mirrorOf>
    <name>阿里云 Spring 仓库</name>
    <url>https://maven.aliyun.com/repository/spring</url>
  </mirror>
  -->
</mirrors>
\`\`\`

保存后，跑一下下面的命令验证镜像是否生效（你会看到下载域名变成了 \`maven.aliyun.com\`）：

\`\`\`powershell
cd D:\\
mvn help:system
\`\`\`

---

## 四、macOS 安装 JDK 17 + Maven

### 方式 A · 用 Homebrew（推荐，一行搞定）

如果你已经装了 Homebrew（https://brew.sh/index_zh-cn），直接：

\`\`\`bash
# 安装 Temurin JDK 17（会自动配好）
brew install --cask temurin17

# 安装 Maven 3.9
brew install maven
\`\`\`

验证：

\`\`\`bash
java -version
javac -version
mvn -v
echo $JAVA_HOME
\`\`\`

### 方式 B · 手动下载 pkg 安装包

1. 打开 https://adoptium.net/zh-CN/temurin/releases/?version=17
2. **选对架构**：
   - **Intel 芯片的 Mac** → 选 **x64** 的 \`.pkg\`
   - **Apple 芯片（M1/M2/M3/M4）** → 选 **aarch64** 的 \`.pkg\`
3. 双击安装包一路下一步，无需勾选。

安装完成后，配置 shell 环境变量。macOS 新版默认用 \`zsh\`，编辑 \`~/.zshrc\`：

\`\`\`bash
open -e ~/.zshrc
\`\`\`

在末尾加：

\`\`\`bash
# Java
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

# Maven（假设你把 Maven 解压到了 /opt/apache-maven-3.9.9）
export MAVEN_HOME=/opt/apache-maven-3.9.9
export PATH=$MAVEN_HOME/bin:$PATH
\`\`\`

保存后让它生效：

\`\`\`bash
source ~/.zshrc
java -version
mvn -v
\`\`\`

> 如果你的 Mac 还是老版本用 \`bash\`，就把上面的 \`~/.zshrc\` 换成 \`~/.bash_profile\`。

---

## 五、Linux (Ubuntu / Debian) 安装 JDK 17

Adoptium 已经提供了官方 apt 仓库，一行命令系列：

\`\`\`bash
# 1. 更新包索引 + 装必要工具
sudo apt update && sudo apt install -y wget apt-transport-https gnupg

# 2. 导入 Adoptium 的 GPG 公钥
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/trusted.gpg.d/adoptium.asc

# 3. 添加 apt 仓库
echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

# 4. 安装 Temurin JDK 17
sudo apt update && sudo apt install -y temurin-17-jdk

# 5. 如果系统里有多个 JDK，用下面命令切默认：
sudo update-alternatives --config java
sudo update-alternatives --config javac
\`\`\`

验证：

\`\`\`bash
java -version
javac -version
echo $JAVA_HOME
\`\`\`

Maven 则直接 \`apt install maven\` 或手动解压配环境变量（和 Windows 一样）。

---

## 六、常见问题速查

| 症状 / 报错 | 大概率原因 | 99% 解决方法 |
| --- | --- | --- |
| \`'java' 不是内部或外部命令\` | 没加到 PATH，或旧终端没刷新 | 关闭所有终端重新打开；或去环境变量确认 \`%JAVA_HOME%\\bin\` 在 Path 里 |
| \`java -version\` 能跑，\`javac\` 却不行 | 只装了 JRE，没装 JDK；或 JAVA_HOME 指向了 JRE 目录 | 卸载现有，重新装 Temurin JDK 17 的 \`.msi\` 并勾选 PATH/\`JAVA_HOME\` |
| \`java -version\` 显示的是 1.8 或 11 | 电脑上残留了旧版本 JDK，PATH 里旧版本排在前面 | 控制面板 → 程序 → 卸载所有旧 JDK；或在环境变量 Path 里把 Temurin 的 \`bin\` 移到最顶部 |
| \`mvn\` 提示"未将对象引用设置到对象的实例"（或类似中文乱码报错） | Windows PowerShell 默认编码 GBK | 先执行 \`chcp 65001\` 切到 UTF-8；或改用 Windows Terminal |
| Maven 依赖下载非常慢 / 卡死 | 没配阿里云镜像，走了海外仓库 | 见章节三步骤 5，检查 \`conf/settings.xml\` 的 \`<mirrors>\` 和 \`<localRepository>\` |
| \`mvn\` 能跑但提示 "Java version: 1.8" | 系统里有多个 JDK，Maven 读到了 JDK 8 | \`$env:JAVA_HOME\` 检查是否指向 Temurin 17；或重启电脑 |
| 解压 Maven 后 \`bin\` 目录里没看到 \`mvn.cmd\` | 下错了包（下成了 \`src\` 源码包） | 重新下载 \`apache-maven-3.9.x-bin.zip\` |
| IDEA 里提示 "Maven home directory is not specified" | IDEA 没识别到 Maven | \`File → Settings → Build, Execution, Deployment → Build Tools → Maven\`，把 \`Maven home path\` 指向你解压的 Maven 根目录（如 \`D:\\tools\\apache-maven-3.9.9\`） |
| \`echo $env:JAVA_HOME\` 输出为空 | 环境变量设置了但没生效 | 关闭所有终端重新打开；或者**重启电脑**（Windows 有时需要重启才能刷新系统级变量） |
| 下载 Temurin 页面看不到 \`.msi\` 按钮 | 页面语言/筛选问题 | 打开 https://adoptium.net/zh-CN/temurin/releases/?version=17&os=windows，Operating System 选 Windows，Architecture 选 x64，Package Type 选 JDK |
`,Bu=`# 01c · IDEA 社区版使用指南
> 从零开始：用 IntelliJ IDEA 把你第一个 Java 项目跑起来，掌握常用操作和调试

---

## 一、为什么选 IDEA 社区版

市面上常见的 Java IDE 有三个：

| IDE | 开发公司 | 是否收费 | 一句话评价 |
| --- | --- | --- | --- |
| **IntelliJ IDEA Community** | JetBrains | ✅ 免费 | Java 开发者首选，智能提示、代码补全、调试体验业界第一 |
| Eclipse | 开源社区 | ✅ 免费 | 老牌、插件多，但界面和流畅度不如 IDEA，学习曲线较陡 |
| Visual Studio Code | Microsoft | ✅ 免费 | 通用编辑器，Java 能力靠插件支撑，深度开发体验一般 |

对于零基础同学，**直接用 IntelliJ IDEA Community（社区版）** 就行，理由：

1. **开箱即用**：自带 Java 编译、Maven、Git、调试器，装完就能开发，不用折腾一堆插件
2. **智能提示最强**：拼写错误、类型不匹配、未使用变量……它会在你输入时就标红提示
3. **业界标准**：90% 以上的 Java 后端工程师都在用它，和团队协作零障碍
4. **免费够用**：社区版已经支持 Java、Kotlin、Groovy、Maven、Git 等核心功能；付费的 Ultimate 版更多是 Spring 高级集成、数据库工具、前端框架等，初学者不需要

### 关于 JetBrains Toolbox（推荐安装方式）

JetBrains 自家出的一个"应用商店"工具，能：

- **一键安装 / 升级** IDEA、PyCharm、WebStorm 等所有 JetBrains 产品
- **多版本共存**：同时装 IDEA 2024.1 和 2023.3，大版本升级时不会覆盖旧版
- **统一管理授权**：学生 / 公司授权只需登录一次

对初学者来说，Toolbox 不是必须的，但装了以后**升级特别省事**。下载地址：https://www.jetbrains.com/toolbox-app/

---

## 二、下载与安装（三平台）

### Windows

1. 打开官网下载页：https://www.jetbrains.com/idea/download/#section=windows
2. **选 Community（社区版）**，不要选 Ultimate（付费版）
3. 下载完成后，双击 \`.exe\` 安装
4. 安装向导里有几个勾选项，建议：

   | 勾选项 | 建议 | 说明 |
   | --- | --- | --- |
   | ✅ Create Desktop Shortcut | 必勾 | 在桌面生成快捷方式 |
   | ✅ Update PATH variable | 必勾 | 让命令行里也能启动 IDEA |
   | ✅ Update context menu | 可选 | 右键文件夹时多一个"用 IDEA 打开"的选项 |
   | ✅ Create Associations \`.java\` | 可选 | \`.java\` 文件默认用 IDEA 打开 |

5. 安装完成后，**第一次启动会让 IDE 建立索引（Indexing）**，此时 CPU 占用较高，耐心等它走完（2~5 分钟）。**索引没建完不要急着写代码**，否则智能提示会失效。

### macOS

1. 同一页面下载 \`.dmg\` 文件（注意区分 Intel 和 Apple Silicon 版本）
2. 双击挂载，把 **IntelliJ IDEA** 图标拖到 **Applications** 文件夹
3. 从 Launchpad 里首次启动，等索引建立完成

### Linux

推荐两种方式二选一：

**方式 A · Toolbox 安装（推荐）**

\`\`\`bash
# 下载 Toolbox 的 .tar.gz，解压后运行
./jetbrains-toolbox
\`\`\`

然后在 Toolbox 里点"Install"装 IDEA Community。

**方式 B · 手动解压**

\`\`\`bash
# 从官网下载 ideaIC-xxx.tar.gz，解压到 /opt
sudo tar -xzf ideaIC-*.tar.gz -C /opt
# 进入 bin 目录启动
cd /opt/idea-IC-*/bin
./idea.sh
\`\`\`

---

## 三、首次启动向导

第一次启动会看到以下几个步骤，按推荐选择即可：

### 1. Import Settings

如果你是第一次用，选 **Do not import settings**，下一步。

### 2. JetBrains Privacy Policy（隐私政策）

勾选 **I confirm that I have read and accept the terms of this License Agreement**，点 Continue。

### 3. Data Sharing（数据共享）

选 **Don't send**（不发送匿名使用数据）。

### 4. Choose Theme（选主题）

| 主题 | 说明 |
| --- | --- |
| **Darcula** | 深色主题，护眼，**推荐** |
| **Light** | 亮色主题 |
| **High contrast** | 高对比度，视觉障碍用户用 |

以后随时可以在 \`File → Settings → Appearance & Behavior → Appearance\` 里切换。

### 5. Plugins（插件）

**保留默认即可**。左侧列出的是插件分组，默认已启用的不要取消勾选。等你熟练后再按需安装（例如中文语言包、Lombok 插件等）。

### 6. Start Using IDEA

进入欢迎页后，点击 **New Project** 或 **Open** 开始使用。

---

## 四、新建第一个 Java 项目

### 步骤 1 · New Project

欢迎页 → 点 **New Project**，或在菜单里 \`File → New → Project\`。

### 步骤 2 · 选择 Java + 配置 JDK

左侧选择 **Java**，右侧顶部的 **Project SDK** 下拉框里选择你已安装的 JDK（例如 \`temurin-17\`）。

> 如果下拉框里看不到任何 JDK，说明 IDEA 还没检测到，点旁边的 **Add SDK** → **JDK**，手动选择 JDK 安装目录：
> - Windows 下通常是 \`C:\\Program Files\\Eclipse Adoptium\\jdk-17.x.x-hotspot\`
> - macOS 下通常是 \`/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home\`
> - Linux 下通常是 \`/usr/lib/jvm/temurin-17-jdk\`

Build system 选 **IntelliJ**（最基础的项目结构，Maven/Gradle 后面章节再讲），JDK 选 17，**不勾** Add sample code。

### 步骤 3 · 起名字 + 选路径

- **Name**：项目名，例如 \`hello-java\`
- **Location**：项目存放目录，**路径不要有空格、不要有中文**（避免后续坑）

点 **Create**，项目就建好了。

### 步骤 4 · 新建 Java Class

左侧 **Project** 窗口里，展开项目 → 右键 \`src\` 目录 → **New → Java Class**，名字写 \`Hello\`，回车。

文件里写：

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, IntelliJ IDEA!");
    }
}
\`\`\`

### 步骤 5 · 运行

有三种方式运行，任选其一：

1. 点击 \`main\` 方法左侧行号旁边的 **绿色 ▶ 小三角** → 选 **Run 'Hello.main()'**
2. 快捷键 **Shift + F10**（运行最近一次配置）
3. 菜单 **Run → Run 'Hello'**

底部会弹出 **Run** 窗口，你会看到：

\`\`\`
Hello, IntelliJ IDEA!

Process finished with exit code 0
\`\`\`

\`exit code 0\` 表示程序正常退出；如果是其他数字，说明执行过程中有错误。

---

## 五、项目 SDK 关联 / 切换

如果打开一个已有项目时提示 "Project SDK is not defined"，或你想切换到另一个 JDK 版本，按以下步骤操作：

### 方式 A · 打开 Project Structure 对话框

菜单 **File → Project Structure**（或按快捷键 **Ctrl + Alt + Shift + S**）。

### 方式 B · 用右下角快速入口

IDEA 右下角通常会显示当前项目的 SDK 版本（例如 \`17\`），点它 → **SDK** → 选版本或 **Add SDK**。

### 在 Project Structure 里配置

\`\`\`
Project Settings
├── Project        ← 项目级别的 SDK / 语言等级
│   ├── SDK: 选择 temurin-17
│   ├── Language level: 选择 17 - Sealed classes, pattern matching for switch
│   └── Project compiler output: 例如 D:\\projects\\hello-java\\out
├── Modules        ← 每个模块可以单独设 SDK（多模块项目用）
│   └── Sources / Paths / Dependencies
└── SDKs           ← 已在 IDEA 注册的所有 JDK 列表（可新增/删除）
\`\`\`

**重点：**
- **SDK 和 JDK 在 IDEA 里是一个意思**，只是叫法不同
- \`Project compiler output\` 必须设置（指定编译后的 \`.class\` 文件放到哪个目录），否则运行时会报 "Cannot start compilation: the output path is not specified"
- 建议把 SDK 和 Language level 配成**同一个版本号**（都配 17），避免语法不兼容

---

## 六、常用快捷键（Windows 版）

> macOS 用户把 \`Ctrl\` 换成 \`⌘\`、\`Alt\` 换成 \`⌥\` 基本就对应上了。

| 快捷键 | 作用 | 备注 |
| --- | --- | --- |
| **Ctrl + Alt + L** | 格式化代码 | 一键对齐缩进、空格、换行，**天天用** |
| **Alt + Enter** | 显示智能建议 | 光标停在红色错误处按它，会列出修复方案；黄色警告也能用 |
| **Ctrl + Shift + F10** | 运行当前类 | 相当于点绿色 ▶ |
| **Shift + F9** | 以 Debug 模式运行 | 调错用 |
| **Ctrl + N** | 按类名查找 | 输入类名模糊搜索，打不全也能搜（驼峰式缩写） |
| **Ctrl + Shift + N** | 按文件名查找 | 搜任何文件（配置文件、文本等） |
| **Ctrl + B / Ctrl + 左键点击** | 跳转到定义 | 想看某个方法/变量在哪定义的，光标停在上面按它 |
| **Ctrl + Alt + O** | 优化 import | 自动移除未使用的 import，合并同类导入 |
| **Ctrl + F9** | 编译项目（Build Project） | 检查全项目有没有语法错误 |
| **Ctrl + /** | 注释 / 取消注释行 | 选中多行也能用，批量切换注释 |
| **Ctrl + Shift + /** | 块注释 | 用 \`/* ... */\` 包起来 |
| **Alt + Shift + ↑ / ↓** | 上下移动整行 | 调整代码顺序非常顺手 |
| **Alt + Insert** | 生成代码 | 构造器 / getter / setter / toString / 重写方法（在类里按） |
| **Ctrl + D** | 复制当前行 | 光标在哪就复制哪一行 |
| **Ctrl + Y** | 删除当前行 | 注意不是撤销（撤销是 Ctrl+Z） |
| **Shift + Shift** | 搜索一切 | 搜类、文件、动作、设置、菜单项，**最强大的一个** |
| **Ctrl + Alt + S** | 快速打开 Settings | 不用找菜单 |
| **Ctrl + E** | 最近打开的文件列表 | 在多个文件间切换 |
| **Ctrl + W** | 递进式选中 | 连续按 → 选中变量 → 选中整行 → 选中方法 → 选中整个类 |
| **F2** | 跳到下一个错误 / 警告 | 配合 Alt+Enter 快速修复 |

### 零基础练手建议

刚接触时，先记住 3 个快捷键就够用：

1. **Shift + Shift** — 搜任何东西，找不到功能时先按它
2. **Alt + Enter** — 看到标红/标黄就按它，IDE 会教你怎么修
3. **Ctrl + Shift + F10** — 跑当前文件

熟练后再慢慢把其他快捷键加进来。**不要一口气背完**，边写边记。

---

## 七、调试（Debug）入门

程序有 Bug 是常态。IDEA 的 Debugger 让你一步一步看代码怎么执行、每个变量的值是什么。

### 步骤 1 · 打一个断点（Breakpoint）

在你想停下来查看的那一行代码**左侧行号旁的空白处单击一下**，会出现一个红点：

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        int sum = a + b;      // ← 在这里行号旁点击，打一个红点断点
        System.out.println("sum = " + sum);
    }
}
\`\`\`

再次点击红点即可取消断点。

### 步骤 2 · 以 Debug 模式运行

有三种方式：

1. 点击绿色 ▶ 旁的**绿色小虫子 🐞**图标
2. 快捷键 **Shift + F9**
3. 菜单 **Run → Debug 'Hello'**

程序启动后执行到断点那一行会**暂停**，此时你能看到 IDEA 底部的 Debug 窗口。

### 步骤 3 · 单步执行（核心操作）

Debug 工具栏里有 6 个关键按钮：

| 按钮示意 | 快捷键 | 作用 |
| --- | --- | --- |
| ▶️（绿色三角） | **F9** | **继续执行**，直到下一个断点或程序结束 |
| 🔽↘️ | **F8** | **步过（Step Over）**，执行当前行，进入下一行；如果是方法调用，整个方法一次性跑完，不会进入方法内部 |
| 🔽↘️↓ | **F7** | **步入（Step Into）**，进入调用的方法内部（如果是 JDK 方法会进入 JDK 源码） |
| ↗️🔼 | **Shift + F8** | **步出（Step Out）**，跳出当前方法，回到调用处 |
| 🔲 | **Ctrl + F2** | 停止调试，终止程序 |
| 🖊️ | — | **计算表达式（Evaluate Expression）**，临时输入表达式看结果 |

### 步骤 4 · 查看变量

Debug 窗口底部的 **Variables** 面板会显示当前作用域内所有变量的值。把鼠标悬停在代码中的变量上，也会弹出一个小提示框显示它的值。

### 步骤 5 · Watches 观察自定义表达式

在 Watches 面板点 **+**，输入任意表达式（例如 \`a * 2\`、\`sum > 15\`），实时求值观察变化。

### 一个完整的调试练习

把下面代码写到 \`Hello.java\`，在第 7 行打一个断点：

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        int[] nums = {3, 7, 12, 5, 9};
        int sum = 0;
        for (int n : nums) {
            sum = sum + n;     // ← 在这里打一个断点
            System.out.println("当前 sum = " + sum);
        }
        System.out.println("最终 sum = " + sum);
    }
}
\`\`\`

Debug 启动后：

1. 程序停在第 7 行，**Variables** 里能看到 \`n\`、\`sum\`、\`nums\` 的当前值
2. 按 **F8**，代码执行一行，\`sum\` 的值会更新
3. 继续按 F8，观察每次循环 \`sum\` 是如何累加的
4. 按 **F9** 直接跳到下一次断点（或程序结束）

> 💡 小技巧：在断点红点上**右键**，可以设置"条件断点"——例如输入 \`n > 7\`，程序只会在 \`n\` 大于 7 时才停下来。复杂循环特别好用。

---

## 八、Maven 工具窗口

当你打开的是 Maven 项目（后面章节的 demo 都是 Maven 项目），IDEA 右侧边栏会出现一个 **Maven** 标签，点击展开：

\`\`\`
Maven
└── demo-01-java-basics
    ├── Lifecycle
    │   ├── clean      ← 清理 target 目录
    │   ├── validate
    │   ├── compile    ← 编译源码（最常用）
    │   ├── test       ← 运行单元测试
    │   ├── package    ← 打成 jar/war 包
    │   ├── verify
    │   ├── install    ← 安装到本地 Maven 仓库
    │   └── deploy
    ├── Plugins        ← 执行具体插件（如 spring-boot-maven-plugin）
    └── Dependencies   ← 查看项目依赖树（排查版本冲突很有用）
\`\`\`

双击 **Lifecycle** 下的任一条目即可执行对应命令（等价于在命令行跑 \`mvn compile\` 等）。

### 两个最常用操作

1. **刷新依赖**：Maven 窗口顶部有一个 🔄 **Reload All Maven Projects** 按钮。在你修改了 \`pom.xml\` 或新增了依赖后，一定要点一下让 IDEA 重新解析。

2. **跳过测试打包**：在 Lifecycle 里同时选中 \`clean\` 和 \`package\`（按住 Ctrl 多选），右键 **Run**，命令行等价于 \`mvn clean package -DskipTests\`。

---

## 九、文件编码 UTF-8（重要）

这一步**非常关键但容易被忽略**，尤其是 Windows 用户——Windows 中文版系统默认编码是 GBK，和 UTF-8 混用会导致代码里中文注释乱码、日志乱码、甚至编译失败。

### 统一设置 UTF-8

1. **Ctrl + Alt + S** 打开 Settings
2. 进入 **Editor → File Encodings**
3. 把下面几处全部设为 **UTF-8**：

   | 选项 | 建议值 | 说明 |
   | --- | --- | --- |
   | Global Encoding | UTF-8 | 全局默认 |
   | Project Encoding | UTF-8 | 当前项目默认 |
   | Default encoding for properties files | UTF-8 | \`.properties\` 文件的编码 |
   | Transparent native-to-ascii conversion | ✅ 勾选 | 让 properties 文件保存时自动转成 \`\\uXXXX\` ASCII 格式，但编辑时仍显示中文 |

4. 点 **OK**，然后执行 \`Build → Rebuild Project\` 让旧的编译产物重新生成。

### 为什么要这样做

- **Java 源代码**（\`.java\`）应该用 UTF-8，跨平台一致
- **Maven** 默认会读项目的编码设置
- **properties 文件**比较特殊：Java 原生只认 ISO-8859-1，所以需要 IDEA 在保存时把中文自动转换成 \`\\uXXXX\` 转义序列，即"Transparent native-to-ascii"这项

---

## 十、字体与主题

默认字体偏小、偏模糊，按以下步骤调整到舒服的大小：

### 主题

\`Settings → Appearance & Behavior → Appearance\`

- **Theme**：Darcula（深色）/ Light（亮色）/ High contrast
- **Use custom font**：可不勾，用默认字体即可

### 编辑器字体

\`Settings → Editor → Font\`

| 选项 | 推荐值 | 说明 |
| --- | --- | --- |
| **Font** | **JetBrains Mono** | JetBrains 自家字体，专为代码设计，显示效果最好 |
| **Size** | 14 ~ 16 | 根据屏幕大小调整，14 是常用值 |
| **Line height** | 1.6 | 行间距大一点，读起来更轻松 |
| **Fallback font** | 任意支持中文的字体（如 SimSun / Microsoft YaHei） | 中文显示用 |

### 快速切换主题

按 **Ctrl + \`**（数字 1 左边那个键）→ 弹出一个菜单 → 选 **Theme** → 直接在 Darcula / Light / High contrast 之间切换，不用进 Settings。

---

## 十一、代码补全 / 模板（Live Templates）

IDEA 内置了大量代码模板，输入几个字母就能展开成一大段代码，大大提高效率。

### 最常用的几个模板

| 模板缩写 | 展开后代码 | 场景 |
| --- | --- | --- |
| \`main\` 或 \`psvm\` | \`public static void main(String[] args) { ... }\` | 新建主方法 |
| \`sout\` | \`System.out.println();\` | 打印一行 |
| \`soutm\` | \`System.out.println("ClassName.methodName");\` | 打印当前类名 + 方法名（调试用） |
| \`soutv\` | \`System.out.println("var = " + var);\` | 打印某个变量的值 |
| \`fori\` | \`for (int i = 0; i < n; i++) { ... }\` | 普通 for 循环 |
| \`iter\` | \`for (String item : list) { ... }\` | for-each 遍历集合 |
| \`itar\` | 数组索引遍历 | 遍历数组 |
| \`ifn\` | \`if (xxx == null)\` | 判断为 null |
| \`inn\` | \`if (xxx != null)\` | 判断不为 null |

使用方式：在编辑器里敲出缩写，按 **Tab**（或 Enter）展开。

> 💡 小技巧：在空白处输入 \`.var\` 也能触发智能补全。例如输入 \`new ArrayList<String>()\` 后紧接着输入 \`.var\` 再回车，会自动补成 \`ArrayList<String> list = new ArrayList<>();\`。

### 自定义 Live Templates

\`Settings → Editor → Live Templates\` 里可以看到所有分组（Java、output、iterations 等），也能自己加。例如想加一个 \`logger\` 模板：

1. 点右上角 **+** → **Template Group** → 名字写 \`user\`
2. 选中 \`user\` 分组 → 点 **+** → **Live Template**
3. **Abbreviation** 填 \`log\`，**Template text** 填：

   \`\`\`
   private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger($CLASS$.class);
   \`\`\`

4. **Edit variables** → 把 \`CLASS\` 设为 \`className()\`
5. **No applicable contexts yet** → 点 **Define** → 勾选 **Java → Declaration**
6. 保存后，在任何类里敲 \`log\` + Tab 就能自动插入一行 logger 声明

---

## 十二、常见问题

| 问题现象 | 原因 / 解决 |
| --- | --- |
| **Cannot start compilation: the output path is not specified** | \`File → Project Structure → Project → Project compiler output\` 设置一个目录，例如 \`D:\\projects\\hello-java\\out\` |
| **提示 "JDK is not defined" / "Project SDK is not defined"** | 回到第五章，\`Project Structure → Project → SDK\` 从下拉里选一个；下拉为空就点 **Add SDK** 手动指定 JDK 安装目录 |
| **Maven 包下载不下来** | 没配阿里云镜像。参考 [01b 章节]，在 Maven 的 \`settings.xml\` 里加 \`<mirrors>\` 配置；然后在 IDEA 的 \`Settings → Build, Execution, Deployment → Build Tools → Maven → User settings file\` 指向这个文件，勾上 Override |
| **中文 / 其他字符乱码** | 先按第九章把三处编码都设为 UTF-8 + 勾选 Transparent native-to-ascii，然后 \`Build → Rebuild Project\` 重建；如果控制台还乱码，检查 Run Configuration 的 VM options 加 \`-Dfile.encoding=UTF-8\` |
| **想切换中文界面** | \`Settings → Plugins\`，搜 **Chinese (Simplified)**，安装后重启 IDEA。不想用了再到 Plugins 里禁用它即可切回英文 |
| **想快速打开设置** | 按 **Ctrl + Alt + S**，或者按两次 **Shift** 搜 "Settings" |
| **项目文件丢失 / 打不开 / 想重新打开** | \`File → Open\`，直接指定项目根目录即可（Maven 项目打开 \`pom.xml\` 所在目录；普通 Java 项目打开 \`src\` 所在目录） |
| **索引建立非常慢 / CPU 一直 100%** | 首次打开大项目索引慢是正常的；如果持续卡顿，检查项目目录是否包含大量非代码文件（如 node_modules、大型数据集），在 Project Structure → Modules → Sources 里把它们标记为 **Excluded**，IDEA 就不会索引它们 |
| **运行后 Run 窗口中文是乱码** | Run Configuration 的 VM options 加 \`-Dfile.encoding=UTF-8\`；并确认 Windows 系统区域设置里没有开启"Beta: 使用 Unicode UTF-8"（这项会破坏很多老程序） |
| **找不到绿色 ▶ 运行按钮** | 检查当前文件是否是一个合法的 Java class，且里面有 \`public static void main(String[] args)\` 方法；确认项目 SDK 已正确关联（右下角有版本号） |

---

> 📌 **本章学习目标自查**：能独立新建一个 Java 项目、写一个带 \`main\` 方法的类、按绿色 ▶ 运行、能在 Debug 里单步观察变量、能切换项目 SDK、能设置 UTF-8 编码。满足这些，你已经掌握了 IDEA 的 80% 日常使用。
`,Fu=`# 02 · Java 语法速成
> 半小时过完 Java 基础语法，能读懂 demo-01 的代码

## 是什么

这一节用最快速度过完 Java **基础语法**，让零基础能**读懂**企业代码。所有内容都结合实际业务场景，避免学院派的「鸡兔同笼」。

## 1. 数据类型

Java 是**强类型语言**，变量必须先声明类型：

\`\`\`java
// 基本类型
int age = 18;              // 整数
long userId = 9000000000L; // 长整型（注意 L 后缀）
double price = 99.9;       // 浮点
boolean active = true;     // 布尔
char c = 'A';              // 单字符

// 引用类型
String name = "Tom";       // 字符串（注意大写 S）
int[] nums = {1, 2, 3};    // 数组
List<String> tags = new ArrayList<>(); // 集合
\`\`\`

**业务场景**：商品表里价格用 \`BigDecimal\`，**不要用 double**：

\`\`\`java
BigDecimal price = new BigDecimal("99.90");
price = price.multiply(new BigDecimal("0.8")); // 8 折
\`\`\`

## 2. 变量与常量

\`\`\`java
// 变量
int stock = 100;

// 常量（用 final，类常量用 static final）
final String DEFAULT_TENANT = "default";
static final int MAX_PAGE_SIZE = 200;
\`\`\`

> 业务里所有"魔法值"都应抽成常量。比如订单超时时间、密码最短长度。

## 3. 流程控制

\`\`\`java
// if-else
if (stock > 0) {
    System.out.println("有货");
} else {
    System.out.println("缺货");
}

// switch（Java 14+ 写法）
String status = switch (orderState) {
    case "PAID" -> "已支付";
    case "SHIPPED" -> "已发货";
    default -> "未知";
};

// for 循环
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}

// forEach 遍历集合（企业最常用）
List<String> products = List.of("iPhone", "iPad", "Mac");
for (String p : products) {
    System.out.println(p);
}
\`\`\`

## 4. 方法

\`\`\`java
/**
 * 计算订单总价（业务例子）
 */
public BigDecimal calcOrderTotal(List<OrderItem> items) {
    BigDecimal total = BigDecimal.ZERO;
    for (OrderItem item : items) {
        total = total.add(item.getPrice().multiply(new BigDecimal(item.getQty())));
    }
    return total;
}
\`\`\`

**重点**：
- 方法必须声明返回类型（\`void\` 表示无返回）
- 形参是**值传递**（基本类型拷值、引用类型拷引用）
- 企业里方法不要超过 50 行，太长就拆

## 5. 类与对象（OOP 入门）

\`\`\`java
public class Product {
    // 字段（也叫属性、成员变量）
    private Long id;
    private String name;
    private BigDecimal price;

    // 构造器
    public Product(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    // 行为
    public boolean isExpensive() {
        return price.compareTo(new BigDecimal("1000")) > 0;
    }

    // getter / setter（可以用 Lombok @Data 简化）
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
\`\`\`

使用：

\`\`\`java
Product p = new Product("iPhone", new BigDecimal("5999"));
boolean expensive = p.isExpensive(); // true
\`\`\`

## 6. 字符串（高频）

\`\`\`java
String s = "Hello";

// 长度
s.length();

// 拼接（**用 StringBuilder**，不要在循环里用 +）
StringBuilder sb = new StringBuilder();
for (String tag : tags) {
    sb.append(tag).append(",");
}
String joined = sb.toString();

// 判空（企业级写法）
if (StrUtil.isBlank(s)) {  // Hutool 工具
    throw new IllegalArgumentException("name 不能为空");
}

// 模板
String desc = StrUtil.format("商品:{}, 价格:{}", name, price);
\`\`\`

## 7. 数组

\`\`\`java
String[] names = new String[3];
int[] ids = {1, 2, 3};
// 数组定长，**企业里几乎都用 List 而不是数组**
List<String> list = Arrays.asList("a", "b", "c");
\`\`\`

## 8. 包装类

\`\`\`java
// 基本类型 → 包装类（自动装箱）
Integer boxed = 100;
// 包装类 → 基本类型（自动拆箱）
int primitive = boxed;
// 业务：MyBatis-Plus 里实体字段统一用包装类，因为 null 表示"未设置"
private Integer stock; // 不写 int stock = 0;
\`\`\`

## 常见坑

- ❌ 用 \`==\` 比较字符串 → 用 \`.equals()\`
- ❌ 用 \`double\` 表示金额 → 用 \`BigDecimal\`
- ❌ 在循环里 \`+\` 拼字符串 → 用 \`StringBuilder\`
- ❌ 实体字段用 \`int/long\` → 用 \`Integer/Long\`（数据库 NULL 兼容）
- ❌ 方法超过 100 行 → 拆

## 配套 Demo

- \`backend/demo-01-java-basics/\`
  - \`com.learnjava.demo01.syntax.DataTypeDemo\`
  - \`com.learnjava.demo01.syntax.StringDemo\`
  - \`com.learnjava.demo01.syntax.MethodDemo\`

## 面试常见追问

- \`==\` vs \`.equals()\` 的区别？
- 为什么金额用 \`BigDecimal\` 而不用 \`double\`？
- 什么是自动装箱 / 拆箱？有什么坑？
- Java 传参是值传递还是引用传递？
`,Uu=`# 03 · 面向对象（OOP）
> 类、继承、封装、多态、接口 —— 写出能维护的代码

## 是什么

**面向对象**是 Java 的灵魂。所有企业代码都是围绕 OOP 设计的。OOP 三大特性：

| 特性 | 含义 | 业务例子 |
| --- | --- | --- |
| 封装 | 隐藏实现细节 | 商品价格不允许外部随便改 |
| 继承 | 复用父类能力 | 不同类型订单（实物/虚拟）复用 Order 基础 |
| 多态 | 同一接口不同实现 | 不同支付方式（微信/支付宝）调用同一方法 |

## 1. 封装

把字段 \`private\` 化，对外暴露方法控制访问：

\`\`\`java
public class Product {
    private BigDecimal price;

    // 不能直接 product.price = -1
    public void setPrice(BigDecimal price) {
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("价格不能为负");
        }
        this.price = price;
    }
}
\`\`\`

企业里 **99%** 的字段都是 \`private\`，通过 getter/setter 访问。可以使用 **Lombok** 简化：

\`\`\`java
@Data
public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
}
\`\`\`

\`@Data\` 自动生成 getter/setter/toString/equals/hashCode。

## 2. 继承

\`\`\`java
// 父类
public class Order {
    protected Long id;
    protected BigDecimal amount;
    public void pay() { /* 通用支付 */ }
}

// 子类
public class PhysicalOrder extends Order {
    private String expressNo; // 物流单号
}

public class VirtualOrder extends Order {
    private String cardCode; // 虚拟卡密
}
\`\`\`

**业务**：实物订单要发货，虚拟订单发卡密 —— 共用"支付"逻辑，各自扩展自己的"履约"逻辑。

> 实际企业里**不推荐深继承**（Java 是单继承），更推荐**组合 + 接口**。

## 3. 多态

\`\`\`java
// 抽象父类
public abstract class Payment {
    public abstract void pay(BigDecimal amount);
}

// 微信支付
@Service
public class WechatPayment extends Payment {
    @Override public void pay(BigDecimal amount) {
        // 调微信 SDK
    }
}

// 支付宝
@Service
public class AlipayPayment extends Payment {
    @Override public void pay(BigDecimal amount) {
        // 调支付宝 SDK
    }
}
\`\`\`

调用方：

\`\`\`java
// 实际企业里会用工厂 + Map 注入，这里先看最简单的版本
Payment payment = channel.equals("WECHAT") ? new WechatPayment() : new AlipayPayment();
payment.pay(order.getAmount());
\`\`\`

**多态的意义**：调用方不关心具体实现，新增一种支付方式时改最少的代码。

## 4. 接口

接口 = 一组行为的**约定**：

\`\`\`java
public interface CacheService {
    void set(String key, Object value, long ttl);
    <T> T get(String key, Class<T> type);
    void delete(String key);
}
\`\`\`

多种实现：

\`\`\`java
@Service
public class LocalCacheService implements CacheService { /* JVM 内存 */ }

@Service
public class RedisCacheService implements CacheService { /* Redis */ }
\`\`\`

**业务**：商品查询先用本地缓存，未命中再走 Redis，通过接口解耦。

> Java 8+ 接口可以有 \`default\` 默认方法。

## 5. 抽象类 vs 接口

| 维度 | 抽象类 | 接口 |
| --- | --- | --- |
| 关键字 | \`abstract class\` | \`interface\` |
| 方法 | 可有抽象 + 具体 | Java 8+ 可有 default |
| 字段 | 任意 | 默认 \`public static final\` |
| 继承 | 单继承 | 多实现 |
| 业务用法 | 同一类事物的"模板" | 不同事物的"能力" |

\`\`\`java
// 模板
public abstract class BaseService<T> {
    public Result<T> getById(Long id) { /* 通用逻辑 */ }
    protected abstract void validate(T entity);
}

// 能力
public interface TenantAware {
    Long getTenantId();
}
\`\`\`

## 6. 内部类 / 枚举（进阶，企业常用）

### 枚举

\`\`\`java
public enum OrderStatus {
    PENDING("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELED("已取消");

    private final String desc;
    OrderStatus(String desc) { this.desc = desc; }
    public String getDesc() { return desc; }
}
\`\`\`

业务里**所有状态字段**都应用枚举，**不要用 int 或 String**。

### 内部类（DTO/VO）

\`\`\`java
// 简单 DTO
public record PageReq(int page, int size) {}
\`\`\`

Java 14+ \`record\` 关键字可以一行声明不可变 DTO。

## 7. 三大设计原则（必背）

| 原则 | 含义 |
| --- | --- |
| 单一职责 SRP | 一个类只做一件事 |
| 开闭原则 OCP | 对扩展开放、对修改关闭 |
| 里氏替换 LSP | 父类能用的地方子类一定能用 |
| 依赖倒置 DIP | 依赖抽象、不依赖具体 |
| 接口隔离 ISP | 接口要小而专 |

> 面试必问，但**最有效的是写代码时慢慢体会**。

## 常见坑

- ❌ 滥用继承 → 优先组合
- ❌ 用 \`int\` 存状态码 → 用 \`enum\`
- ❌ 把所有逻辑写在一个 Service 里 → 拆
- ❌ 字段全 \`public\` → 几乎都该 \`private\`

## 配套 Demo

- \`backend/demo-01-java-basics/com/learnjava/demo01/oop/\`
  - \`Product\`、\`Order\`、\`WechatPayment\`、\`AlipayPayment\`

## 面试常见追问

- 抽象类和接口的区别？
- 多态的实现原理？（方法区 vtable）
- \`final\`、\`finally\`、\`finalize\` 区别？
- 什么是 SOLID 原则？
`,ju=`# 04 · 集合框架（Collection）
> List / Set / Map —— 后端 90% 的业务都在操作集合

## 是什么

Java 集合框架（\`java.util\`）是后端开发**最高频**使用的工具。理解 List / Set / Map 的差异与适用场景，是写出高效 Java 代码的前提。

## 1. 总体结构

\`\`\`
Collection
├── List（有序、可重复）
│   ├── ArrayList（数组实现、查询快、增删慢）
│   └── LinkedList（链表实现、增删快、查询慢）
└── Set（无序、不可重复）
    ├── HashSet（哈希表）
    └── TreeSet（红黑树、有序）

Map（键值对）
├── HashMap（哈希表、最常用）
├── LinkedHashMap（保留插入顺序）
└── TreeMap（按 key 排序）
\`\`\`

## 2. List —— 业务最常用

### ArrayList vs LinkedList

| 场景 | 推荐 |
| --- | --- |
| 大量查询 / 少量增删 | **ArrayList** ✅（99% 场景） |
| 大量增删 / 少量查询 | LinkedList |
| 队列 | \`ArrayDeque\`（比 LinkedList 快） |

\`\`\`java
List<Product> products = new ArrayList<>();
products.add(new Product("iPhone", new BigDecimal("5999")));
products.add(new Product("iPad", new BigDecimal("3999")));

// 遍历
for (Product p : products) { System.out.println(p.getName()); }

// 排序
products.sort(Comparator.comparing(Product::getPrice).reversed());

// 转数组
Product[] arr = products.toArray(new Product[0]);

// stream（业务高频）
List<String> names = products.stream()
    .map(Product::getName)
    .filter(Objects::nonNull)
    .toList();
\`\`\`

### \`Arrays.asList\` 的坑

\`\`\`java
// ❌ 返回的是固定大小 List，不能 add/remove
List<String> list = Arrays.asList("a", "b");

// ✅ 用 List.of (Java 9+，不可变) 或 new ArrayList<>(Arrays.asList(...))
List<String> ok = new ArrayList<>(Arrays.asList("a", "b"));
\`\`\`

## 3. Set —— 去重

\`\`\`java
// 用 Set 找出两个商品集合的交集
Set<Long> cartIds = Set.of(1L, 2L, 3L);
Set<Long> favIds = Set.of(3L, 4L, 5L);
Set<Long> both = new HashSet<>(cartIds);
both.retainAll(favIds); // [3]
\`\`\`

**业务**：判断"用户是否已购买某商品"、找"两个集合的差集"。

## 4. Map —— KV 缓存必备

### HashMap 用法

\`\`\`java
Map<Long, Product> idToProduct = new HashMap<>();
idToProduct.put(1L, product);

// 查
Product p = idToProduct.get(1L);   // null if not exists
Product p2 = idToProduct.getOrDefault(2L, Product.EMPTY); // 给默认值

// 遍历
for (Map.Entry<Long, Product> e : idToProduct.entrySet()) {
    System.out.println(e.getKey() + ":" + e.getValue());
}

// Java 8+ forEach
idToProduct.forEach((k, v) -> System.out.println(k + " -> " + v));
\`\`\`

### 业务场景：分组

\`\`\`java
// 按商品分类分组
Map<Long, List<Product>> grouped = products.stream()
    .collect(Collectors.groupingBy(Product::getCategoryId));

// 统计每个分类的商品数
Map<Long, Long> count = products.stream()
    .collect(Collectors.groupingBy(Product::getCategoryId, Collectors.counting()));
\`\`\`

### 不可变 Map

\`\`\`java
Map<String, String> map = Map.of("k1", "v1", "k2", "v2"); // 不可变，更安全
\`\`\`

## 5. 选择合适的集合类

**业务黄金法则**：

| 业务场景 | 选 |
| --- | --- |
| 一组商品列表要分页 | \`ArrayList\` |
| 订单去重判断 | \`HashSet\` |
| 商品 ID → 商品 | \`HashMap\` |
| 需要按价格排序的商品 | \`TreeSet\` |
| LRU 缓存（最近最少使用） | \`LinkedHashMap\`（accessOrder=true） |
| 多线程环境共享 | \`ConcurrentHashMap\` / \`CopyOnWriteArrayList\` |

## 6. Stream API（必学）

\`\`\`java
List<Product> ps = products.stream()
    .filter(p -> p.getPrice().compareTo(new BigDecimal("100")) > 0) // 过滤
    .map(Product::getName)                                            // 转换
    .sorted()                                                          // 排序
    .limit(10)                                                         // 限制
    .toList();                                                         // 收集
\`\`\`

常见操作：

- \`filter\` 过滤
- \`map\` 转换
- \`flatMap\` 扁平化（处理嵌套集合）
- \`sorted\` 排序
- \`distinct\` 去重
- \`reduce\` 归约
- \`collect\` 收集
- \`forEach\` 遍历
- \`anyMatch / allMatch / noneMatch\` 断言
- \`findFirst / findAny\` 查找

**坑**：Stream 不能复用 + 不适合极简循环（性能略差）。

## 7. 工具库（Hutool 推荐）

企业里通常引入 \`cn.hutool:hutool-all\`，集合操作更便捷：

\`\`\`java
// 判空
CollUtil.isEmpty(list);
CollUtil.isNotEmpty(map);

// 转字符串
String str = CollUtil.join(list, ",");

// 分组
Map<Long, List<Product>> map = CollUtil.groupByField(products, "categoryId");
\`\`\`

## 8. 并发集合（中级）

\`\`\`java
// 多线程安全 Map
ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();
cache.put("k", "v");
cache.computeIfAbsent("k", key -> loadFromDb(key));
\`\`\`

详细见 \`15-thread-pool\` 章节。

## 常见坑

- ❌ 用 \`Arrays.asList\` 然后 \`add\` → \`UnsupportedOperationException\`
- ❌ 大量数据用 \`LinkedList\` → \`ArrayList\` 更快
- ❌ 直接遍历中 \`add/remove\` → 用迭代器或 \`removeIf\`
- ❌ 把 \`ArrayList\` 共享给多线程 → 用 \`CopyOnWriteArrayList\` / \`ConcurrentHashMap\`

## 配套 Demo

- \`backend/demo-01-java-basics/com/learnjava/demo01/collection/\`
  - \`ListDemo\`、\`MapDemo\`、\`SetDemo\`、\`StreamDemo\`

## 面试常见追问

- \`ArrayList\` 和 \`LinkedList\` 区别？时间复杂度？
- \`HashMap\` 底层原理？JDK 8 做了什么优化？
- 为什么 \`HashMap\` 容量是 2 的幂？
- \`ConcurrentHashMap\` 1.7 vs 1.8 的差异？
- 讲讲 Stream 常用的中间操作和终止操作？
`,Hu=`# 05 · 异常处理与日志
> 写出能定位问题的企业级代码

## 是什么

后端线上出问题，**第一个看的是日志**。这一节讲清楚 Java 异常体系和企业常用的日志规范。

## 1. Java 异常体系

\`\`\`
Throwable
├── Error（程序无法处理，比如 OOM）
└── Exception
    ├── RuntimeException（运行时，比如 NPE）
    │   ├── NullPointerException
    │   ├── IndexOutOfBoundsException
    │   ├── IllegalArgumentException
    │   └── ...
    └── Checked Exception（编译时，强制处理）
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
\`\`\`

> **企业现状**：业务里 **90% 用 RuntimeException + 全局统一处理**。Checked 异常太繁琐（要 throws），基本被弃用。

## 2. 业务异常（必学）

\`\`\`java
// 自定义业务异常基类
@Getter
public class BizException extends RuntimeException {
    private final int code;
    private final String message;

    public BizException(ResultCode rc) {
        super(rc.getMessage());
        this.code = rc.getCode();
        this.message = rc.getMessage();
    }

    public BizException(ResultCode rc, String message) {
        super(message);
        this.code = rc.getCode();
        this.message = message;
    }
}
\`\`\`

错误码枚举：

\`\`\`java
public enum ResultCode {
    SUCCESS(0, "成功"),
    PARAM_ERROR(40000, "参数错误"),
    NOT_FOUND(40400, "资源不存在"),
    STOCK_NOT_ENOUGH(50010, "库存不足"),
    AUTH_FAIL(40100, "未登录"),
    FORBIDDEN(40300, "无权限"),
    SYSTEM_ERROR(50000, "系统异常");

    private final int code;
    private final String msg;

    ResultCode(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
    public int getCode() { return code; }
    public String getMessage() { return msg; }
}
\`\`\`

抛出：

\`\`\`java
if (product.getStock() < item.getQty()) {
    throw new BizException(ResultCode.STOCK_NOT_ENOUGH);
}
\`\`\`

## 3. try-catch 实战

\`\`\`java
// ❌ 反面教材
try {
    doSomething();
} catch (Exception e) {
    e.printStackTrace();  // 千万别这样
}

// ✅ 正确姿势
try {
    return orderService.create(req);
} catch (BizException e) {
    log.warn("业务异常: code={}, msg={}", e.getCode(), e.getMessage());
    return Result.fail(e.getCode(), e.getMessage());
} catch (Exception e) {
    log.error("系统异常", e);  // 打日志
    return Result.fail(ResultCode.SYSTEM_ERROR);
}
\`\`\`

**企业约定**：
- 业务异常：**有预期、可控** → 用 \`BizException\` + \`ResultCode\` 错误码
- 系统异常：**没预期、不可控** → 记录到 error 日志 + 返回通用错误码

## 4. 全局异常处理（Spring Boot）

**这是企业里最重要的一段代码**：

\`\`\`java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        log.warn("biz error: code={} msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ":" + f.getDefaultMessage())
                .collect(Collectors.joining(";"));
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleAll(Exception e) {
        log.error("system error", e);
        return Result.fail(ResultCode.SYSTEM_ERROR);
    }
}
\`\`\`

## 5. 日志（SLF4J + Logback）

Spring Boot 默认集成 SLF4J + Logback，直接用即可：

\`\`\`java
@Slf4j  // Lombok 自动生成 log 字段
@Service
public class OrderService {

    public Order create(OrderReq req) {
        log.info("创建订单, userId={}, items={}", req.getUserId(), req.getItems().size());
        try {
            // 业务逻辑
            log.debug("扣减库存: productId={}, qty={}", productId, qty);
            return order;
        } catch (Exception e) {
            log.error("订单创建失败, req={}", req, e);  // 异常最后一位
            throw e;
        }
    }
}
\`\`\`

### 日志级别

| 级别 | 用途 |
| --- | --- |
| ERROR | 系统异常，需要运维介入 |
| WARN | 业务异常（库存不足、参数校验失败） |
| INFO | 关键业务节点（创建订单、登录） |
| DEBUG | 详细信息（生产默认不输出） |
| TRACE | 最详细（一般不用） |

### 严禁

\`\`\`java
// ❌ 字符串拼接（占内存 + 性能差）
log.info("用户" + userId + "登录");

// ✅ 占位符
log.info("用户{}登录", userId);

// ❌ 打印敏感信息
log.info("password={}", user.getPassword());
log.info("银行卡={}", cardNo);  // 脱敏后再打

// ❌ 异常吞掉
catch (Exception e) { /* 啥也不做 */ }
\`\`\`

## 6. 统一响应 Result

\`\`\`java
@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp = System.currentTimeMillis();

    public static <T> Result<T> ok() { return new Result<>(0, "ok", null, 0L); }
    public static <T> Result<T> ok(T data) { return new Result<>(0, "ok", data, 0L); }
    public static <T> Result<T> fail(int code, String msg) { return new Result<>(code, msg, null, 0L); }
    public static <T> Result<T> fail(ResultCode rc) { return new Result<>(rc.getCode(), rc.getMessage(), null, 0L); }
}
\`\`\`

## 常见坑

- ❌ 业务里 \`e.printStackTrace()\` → 改用日志
- ❌ 异常里不打 context → 至少打 \`userId/orderId\` 等关键 ID
- ❌ 把所有异常都 \`try-catch\` 吞掉 → 该抛就抛
- ❌ 日志里打印密码 / 身份证 / 卡号
- ❌ \`catch (Throwable t)\` → 太宽，吞掉 OOM

## 配套 Demo

- \`backend/demo-01-java-basics/com/learnjava/demo01/exception/\`
- \`backend/demo-03-springboot-redis-auth/\` 的 \`GlobalExceptionHandler\`

## 面试常见追问

- Error 和 Exception 的区别？
- Checked Exception 和 RuntimeException 区别？
- Spring Boot 的 \`@RestControllerAdvice\` 怎么用？
- 业务异常和系统异常如何区分处理？
- 日志级别怎么选用？
`,qu=`# 06 · Maven 工程与依赖管理
> 理解 pom.xml，能自己引入第三方库

## 是什么

Maven 是 Java 项目的**包管理 + 构建工具**。所有企业 Java 工程都用它（或者 Gradle，但 Maven 仍是国内主流）。

核心概念：

| 概念 | 含义 |
| --- | --- |
| POM | \`pom.xml\`，项目模型 |
| GAV | groupId / artifactId / version 定位一个 jar |
| Repository | 仓库（本地 + 远程） |
| Lifecycle | 生命周期（clean → compile → test → package） |
| Phase | 阶段（compile / test / package / install / deploy） |
| Goal | 阶段里具体做的事 |

## 1. 最小可用的 pom.xml

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <!-- 父 POM：继承 Spring Boot 默认配置 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.learnjava</groupId>
    <artifactId>demo-02-springboot-crud</artifactId>
    <version>1.0.0</version>
    <name>demo-02-springboot-crud</name>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 测试 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
\`\`\`

## 2. 标准目录结构（Maven 约定）

\`\`\`
demo-02/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/                 # 业务代码
│   │   │   └── com/learnjava/demo02/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── mapper/
│   │   │       ├── entity/
│   │   │       ├── dto/
│   │   │       ├── config/
│   │   │       └── Application.java
│   │   └── resources/            # 配置文件
│   │       ├── application.yml
│   │       ├── mapper/           # MyBatis XML
│   │       └── static/
│   └── test/                     # 测试代码
│       └── java/
└── target/                       # 编译输出（自动生成）
\`\`\`

**约定优于配置**：\`src/main/java\` 写代码、\`src/test/java\` 写测试，**不要乱**。

## 3. 依赖管理实操

### 引入一个第三方库

1. 找 Maven Central（如 https://mvnrepository.com/）
2. 复制 dependency 段到 pom
3. IDEA 提示 "Enable auto-import" → 开启

\`\`\`xml
<!-- Hutool 工具集 -->
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.27</version>
</dependency>
\`\`\`

### 依赖传递

如果你引入了 \`spring-boot-starter-web\`，它会自动带入：
- Spring MVC
- Jackson（JSON）
- Tomcat（内嵌）
- ...

**坑**：版本冲突。可以用 \`mvn dependency:tree\` 排查：

\`\`\`bash
mvn dependency:tree -Dverbose
\`\`\`

### 排除不需要的传递依赖

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
\`\`\`

### dependencyManagement（统一版本）

父 POM 里统一管版本，子模块不写版本号：

\`\`\`xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>3.5.7</version>
        </dependency>
    </dependencies>
</dependencyManagement>
\`\`\`

## 4. 常用命令

\`\`\`bash
mvn clean                # 清理 target
mvn compile              # 编译
mvn test                 # 跑单元测试
mvn package              # 打包成 jar
mvn install              # 装到本地仓库（给其他工程用）
mvn spring-boot:run      # 跑 Spring Boot
mvn -DskipTests package  # 跳过测试打包
mvn dependency:tree      # 看依赖树
\`\`\`

**IDEA 里**：右侧 Maven 面板有 GUI 按钮，不需要手敲。

## 5. 多模块工程（大厂标配）

\`\`\`
parent/                     # 父 POM（packaging=pom）
├── pom.xml
├── common/                  # 公共工具包
│   └── pom.xml
├── user/                    # 用户服务
│   └── pom.xml
├── order/                   # 订单服务
│   └── pom.xml
└── mall-api/                # 聚合 API 模块
    └── pom.xml
\`\`\`

父 POM 统一管理依赖版本，子模块继承即可。**本工程 demo-04 演示**。

## 6. 国内加速（重要）

修改 \`~/.m2/settings.xml\`：

\`\`\`xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <name>Aliyun Public</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
\`\`\`

## 常见坑

- ❌ 复制依赖时忘了 \`groupId\` / \`artifactId\` / \`version\` 三件套
- ❌ 测试代码写到 \`src/main\` 下
- ❌ \`target/\` 提交到 Git
- ❌ 不指定 \`<java.version>\`，默认是 1.5
- ❌ 用过时的 \`javax.*\`（应改为 \`jakarta.*\`，Spring Boot 3 强制）

## 配套 Demo

- 所有 demo 工程根目录都有 \`pom.xml\`
- \`backend/demo-04-multitenant-mall/\` 演示多模块

## 面试常见追问

- Maven 的生命周期是什么？
- \`dependency\` 与 \`dependencyManagement\` 区别？
- 怎么解决 jar 包冲突？
- 父 POM 的作用？
- Maven 和 Gradle 怎么选？
`,zu=`# 07 · JUnit 5 单元测试
> 每个后端工程师都要会写测试

## 是什么

单元测试 = **对一个最小的代码单元（方法）做验证**。是企业保证代码质量的第一道防线，也是面试加分项。

Java 主流测试框架：**JUnit 5**（Jupiter）。

## 1. 第一个测试

\`\`\`java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalcTest {

    @Test
    void testAdd() {
        Calc c = new Calc();
        int result = c.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    void testDivide() {
        Calc c = new Calc();
        assertThrows(IllegalArgumentException.class,
            () -> c.divide(1, 0));
    }
}
\`\`\`

\`@Test\` 标注方法是测试方法，方法**必须 \`void\` 无参**。

## 2. 常用断言

\`\`\`java
// 相等
assertEquals(5, calc.add(2, 3));
assertNotEquals(4, result);

// 布尔
assertTrue(stock > 0);
assertFalse(product.isDeleted());

// 空
assertNull(obj);
assertNotNull(obj);

// 抛异常
assertThrows(IllegalArgumentException.class, () -> service.bad());

// 不抛
assertDoesNotThrow(() -> service.ok());

// 组合（推荐）
assertAll("product",
    () -> assertEquals("iPhone", p.getName()),
    () -> assertEquals(new BigDecimal("5999"), p.getPrice())
);
\`\`\`

## 3. 生命周期

\`\`\`java
class OrderServiceTest {

    @BeforeAll   // 整个测试类前跑一次（static）
    static void initAll() { /* 启动 DB */ }

    @BeforeEach  // 每个测试方法前跑
    void init() { /* 准备数据 */ }

    @Test
    void testCreate() { /* ... */ }

    @AfterEach   // 每个测试方法后跑
    void tearDown() { /* 清理 */ }

    @AfterAll    // 整个测试类后跑一次（static）
    static void destroyAll() { /* 关闭 DB */ }
}
\`\`\`

## 4. 参数化测试

\`\`\`java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 0, -1})
void testIsPositive(int n) {
    assertEquals(n > 0, new Calc().isPositive(n));
}

@ParameterizedTest
@CsvSource({
    "1, 2, 3",
    "10, 20, 30",
    "0, 0, 0"
})
void testAddCsv(int a, int b, int expected) {
    assertEquals(expected, new Calc().add(a, b));
}
\`\`\`

## 5. 业务测试（带 Spring）

\`\`\`java
@SpringBootTest
@Transactional  // 每个测试自动回滚，不污染数据库
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @Test
    void testCreate() {
        Product p = new Product();
        p.setName("iPhone");
        p.setPrice(new BigDecimal("5999"));
        p.setStock(100);

        boolean ok = productService.save(p);
        assertTrue(ok);
        assertNotNull(p.getId());
    }
}
\`\`\`

### 测试分层

| 类型 | 注解 | 启动容器 | 速度 |
| --- | --- | --- | --- |
| 单元测试 | 无 | 否 | ⚡⚡⚡ |
| 切片测试 | \`@WebMvcTest\`、\`@DataJpaTest\` | 部分 | ⚡⚡ |
| 集成测试 | \`@SpringBootTest\` | 全 | ⚡ |

> 实际企业：70% 单元 + 20% 切片 + 10% 集成。

## 6. Mock 工具（Mockito）

\`\`\`java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void testCreateOrder() {
        // 模拟 productService 返回
        when(productService.getById(1L))
            .thenReturn(new Product().setName("iPhone").setStock(10));

        Order order = orderService.create(/* ... */);

        assertNotNull(order);
        verify(productService, times(1)).getById(1L);
    }
}
\`\`\`

**业务场景**：下单时扣库存，希望只测订单逻辑、不真去 DB 查商品。

## 7. 覆盖率

\`\`\`xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
    </executions>
</plugin>
\`\`\`

跑 \`mvn test\` 后看 \`target/site/jacoco/index.html\`。

> 企业对覆盖率一般要求 60% ~ 80%，**不是越高越好**，关键路径必须覆盖。

## 8. 命名与组织

\`\`\`java
// 风格 1：方法名 = 行为描述
void createOrder_shouldReturnOrderId_whenStockEnough() { }

// 风格 2：given-when-then
void createOrder_givenEnoughStock_whenCreate_thenSuccess() { }
\`\`\`

每个 Service 一个测试类，每个 public 方法至少 1 个测试。

## 常见坑

- ❌ 测试方法依赖执行顺序 → 用 \`@BeforeEach\` 准备
- ❌ 测试用了真实 DB 没回滚 → 加 \`@Transactional\`
- ❌ 断言信息不明确 → 写 \`assertEquals(5, result, "sum should be 5")\`
- ❌ Mock 不还原 → 加 \`@ExtendWith(MockitoExtension.class)\`
- ❌ 单元测试里写慢 IO → 抽出接口 + Mock

## 配套 Demo

- \`backend/demo-01-java-basics/src/test/\`
- \`backend/demo-02-springboot-crud/src/test/\`

## 面试常见追问

- \`@BeforeEach\` 和 \`@BeforeAll\` 区别？
- \`@SpringBootTest\` 和 \`@WebMvcTest\` 区别？
- Mock 和 Stub 区别？
- 什么是测试金字塔？
- TDD 是什么？真的能用吗？
`,Ju=`# 08 · Spring Boot 启动原理
> 搞懂 \`@SpringBootApplication\` 背后到底干了什么

## 是什么

**Spring Boot** 是当下 Java 后端**绝对主流**的框架。它的核心使命：

> 让你用最少的配置，**快速启动一个生产级 Spring 应用**。

## 1. 一个最小 Spring Boot 工程

\`\`\`java
@SpringBootApplication
public class MallApplication {
    public static void main(String[] args) {
        SpringApplication.run(MallApplication.class, args);
    }
}
\`\`\`

跑起来就启动了一个内嵌 Tomcat，默认 8080 端口。

## 2. \`@SpringBootApplication\` 拆解

它是三个注解的合体：

\`\`\`java
@SpringBootConfiguration  // 表明这是个配置类（等价 @Configuration）
@EnableAutoConfiguration  // ⭐ 核心：自动装配
@ComponentScan            // 扫描当前包及其子包的 @Component
\`\`\`

### 自动装配原理

1. \`spring-boot-autoconfigure.jar\` 里有 \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\`
2. 里面列了 100+ \`XxxAutoConfiguration\` 类
3. Spring 启动时按需加载
4. 每个 AutoConfiguration 上都有 \`@Conditional\` 条件：
   - \`@ConditionalOnClass\` 某个类在 classpath
   - \`@ConditionalOnBean\` 某个 Bean 存在
   - \`@ConditionalOnProperty\` 配置项匹配
   - \`@ConditionalOnMissingBean\` 没有同类型 Bean

> 这就是 "Starter" 的魔法：引一个 starter，对应 AutoConfiguration 就生效。

## 3. 启动流程（面试必背）

\`\`\`
1. new SpringApplication(primarySource)
   - 推断应用类型（Servlet/Reactive）
   - 加载所有 ApplicationContextInitializer
   - 加载所有 ApplicationListener
   - 推断 main 方法所在类

2. run() 启动
   ├─ 启动 StopWatch
   ├─ 触发 ApplicationStartingEvent
   ├─ 准备 Environment（配置文件解析）
   ├─ 打印 banner
   ├─ 创建 ApplicationContext
   ├─ 准备 BeanFactory
   ├─ 执行 ApplicationContextInitializer
   ├─ 加载 Bean 定义
   ├─ 执行 BeanFactoryPostProcessor
   ├─ 实例化所有非 lazy 单例 Bean
   ├─ 触发 ContextRefreshedEvent
   ├─ 调用 CommandLineRunner / ApplicationRunner
   └─ 触发 ApplicationStartedEvent
\`\`\`

## 4. 配置文件优先级

\`application.yml\` / \`application.properties\`，优先级从高到低：

\`\`\`
1. 命令行参数：--server.port=9090
2. 环境变量：SERVER_PORT=9090
3. application-{profile}.yml（profile 激活的）
4. application.yml
5. 默认值（代码里写的）
\`\`\`

### 多环境配置

\`\`\`yaml
# application.yml
spring:
  profiles:
    active: dev
\`\`\`

\`\`\`yaml
# application-dev.yml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mall_dev
\`\`\`

\`\`\`yaml
# application-prod.yml
server:
  port: 80
\`\`\`

启动时切换：\`java -jar app.jar --spring.profiles.active=prod\`

## 5. 常用注解

| 注解 | 作用 |
| --- | --- |
| \`@Component\` | 通用组件 |
| \`@Service\` | 业务层 |
| \`@Repository\` | 数据访问层 |
| \`@Controller\` | 控制层（返回视图） |
| \`@RestController\` | REST 控制层（返回 JSON） |
| \`@Configuration\` | 配置类 |
| \`@Bean\` | 标注方法返回 Bean |
| \`@Value("\${key}")\` | 读配置 |
| \`@ConfigurationProperties\` | 批量绑定 |
| \`@Autowired\` / \`@Resource\` | 注入 |
| \`@Qualifier("name")\` | 多 Bean 选一 |

## 6. 一个完整 Controller

\`\`\`java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor  // Lombok 构造器注入
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.ok(productService.getById(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody @Valid ProductReq req) {
        return Result.ok(productService.create(req));
    }

    @GetMapping
    public Result<Page<Product>> page(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return Result.ok(productService.page(page, size));
    }
}
\`\`\`

> **企业规范**：所有 Controller 方法返回 \`Result<T>\`，**不要直接返回实体**。

## 7. 注入方式（选构造器注入）

\`\`\`java
// ❌ 字段注入：无法做单元测试
@Autowired
private ProductService productService;

// ✅ 构造器注入：可测试、final、强制依赖
private final ProductService productService;
public ProductController(ProductService productService) {
    this.productService = productService;
}

// ✅ Lombok 简化
@RestController
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
}
\`\`\`

## 8. 启动慢的排查

\`\`\`yaml
# application.yml 开启启动 debug
debug: true
\`\`\`

或：

\`\`\`java
public static void main(String[] args) {
    SpringApplication app = new SpringApplication(MallApplication.class);
    app.setLogStartupInfo(true);
    app.run(args);
}
\`\`\`

看到 \`HHH000040: ...\` 等日志时，能定位到慢 Bean。

## 常见坑

- ❌ 同类型有多个 Bean → 用 \`@Primary\` 或 \`@Qualifier\`
- ❌ 循环依赖（A 依赖 B，B 依赖 A）→ 重构代码或用 \`@Lazy\`
- ❌ 配置文件没生效 → 检查 \`application.yml\` 位置
- ❌ profile 没激活 → \`--spring.profiles.active=xxx\`
- ❌ \`@Autowired\` 注入 \`null\` → Bean 没被 Spring 管理（漏了 \`@Service\` 等）

## 配套 Demo

- \`backend/demo-02-springboot-crud/\`
- \`backend/demo-04-multitenant-mall/\`

## 面试常见追问

- Spring Boot 自动装配原理？
- \`@SpringBootApplication\` 包含了什么？
- Bean 的生命周期？
- 构造器注入和字段注入的区别？
- 怎么解决循环依赖？
`,Ku=`# 09 · RESTful API 设计规范
> 写出"看着就像大厂写的"接口

## 是什么

**RESTful** 是一种**接口设计风格**（不是标准），目标是让接口：
- 资源导向（URL 表达"是什么"）
- 语义清晰（HTTP Method 表达"做什么"）
- 状态自描述（HTTP 状态码表达"结果"）

## 1. 七大约定

### (1) URL 表资源（名词复数），不用动词

\`\`\`
❌ POST /createProduct
❌ GET  /getProduct
✅ POST /api/products
✅ GET  /api/products/123
\`\`\`

### (2) HTTP Method 表动作

| Method | 含义 | 示例 |
| --- | --- | --- |
| \`GET\` | 查询 | \`GET /api/products\` |
| \`POST\` | 创建 | \`POST /api/products\` |
| \`PUT\` | 完整更新 | \`PUT /api/products/123\` |
| \`PATCH\` | 部分更新 | \`PATCH /api/products/123\` |
| \`DELETE\` | 删除 | \`DELETE /api/products/123\` |

### (3) 用 HTTP 状态码

| 码 | 含义 | 业务示例 |
| --- | --- | --- |
| 200 | 成功 | 查询成功 |
| 201 | 创建成功 | 新建订单 |
| 204 | 成功无 body | 删除成功 |
| 400 | 客户端错 | 参数错误 |
| 401 | 未认证 | 没登录 |
| 403 | 无权限 | 角色不够 |
| 404 | 资源不存在 | 商品下架 |
| 409 | 冲突 | 库存不足 |
| 500 | 服务器错 | 系统异常 |

> **实际企业**：很多公司**仍然用 200 + 业务错误码**（如本工程），前端只需看 code。两种风格都有，看团队约定。

### (4) 路径用小写 + 复数 + \`-\` 不用驼峰

\`\`\`
✅ /api/user-orders
❌ /api/userOrders
❌ /api/UserOrders
\`\`\`

### (5) 复杂查询用 query string

\`\`\`
GET /api/products?categoryId=1&page=1&size=10&sort=price_desc
\`\`\`

### (6) 嵌套资源限 1~2 层

\`\`\`
✅ POST /api/orders/123/items
❌ GET  /api/orders/123/items/456/comments/789/users
\`\`\`

### (7) 版本号放 URL 或 Header

\`\`\`
URL 风格：/api/v1/products
Header 风格：Accept: application/vnd.myapp.v1+json
\`\`\`

> 本工程 demo 用 \`/api/...\` 不带 v1（demo 阶段）；企业工程**一定**带版本。

## 2. 业务示例：商品模块

\`\`\`java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    // 列表（分页 + 条件）
    @GetMapping
    public Result<Page<Product>> list(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) { ... }

    // 详情
    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) { ... }

    // 新建
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Result<Long> create(@RequestBody @Valid ProductReq req) { ... }

    // 修改
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody @Valid ProductReq req) { ... }

    // 删除
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Result<Void> delete(@PathVariable Long id) { ... }

    // 业务子资源
    @PostMapping("/{id}/on-shelf")
    public Result<Void> onShelf(@PathVariable Long id) { ... }
}
\`\`\`

## 3. 统一响应体（推荐）

\`\`\`json
{
  "code": 0,
  "message": "ok",
  "data": { ... },
  "timestamp": 1700000000000
}
\`\`\`

\`\`\`java
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp = System.currentTimeMillis();
}
\`\`\`

## 4. 分页参数（推荐 page/size）

请求：
\`\`\`
GET /api/products?page=1&size=10
\`\`\`

响应：
\`\`\`json
{
  "code": 0,
  "data": {
    "records": [...],
    "total": 1234,
    "page": 1,
    "size": 10
  }
}
\`\`\`

> MyBatis-Plus 的 \`Page<T>\` 直接对接。

## 5. 错误响应

\`\`\`json
{
  "code": 50010,
  "message": "库存不足",
  "data": null,
  "timestamp": 1700000000000
}
\`\`\`

**业务错误码设计**（参考本工程）：

| 段 | 含义 | 例 |
| --- | --- | --- |
| 0 | 成功 | \`0\` |
| 4xxxx | 客户端错 | \`40000\` 参数 / \`40100\` 未登录 |
| 5xxxx | 业务错 | \`50010\` 库存不足 / \`50020\` 余额不足 |
| 9xxxx | 系统错 | \`50000\` 系统异常 |

## 6. 接口幂等

**关键操作**必须幂等（POST 重复调用结果一致）：

\`\`\`
POST /api/orders
Header: Idempotency-Key: 5f8e...
\`\`\`

详细见 \`17-idempotent\`。

## 7. 鉴权传递

\`\`\`
GET /api/orders
Header: Authorization: Bearer <token>
\`\`\`

## 8. 接口文档（OpenAPI）

引入 \`springdoc-openapi-starter-webmvc-ui\`：

\`\`\`xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
\`\`\`

访问 \`http://localhost:8080/swagger-ui.html\`。

## 常见坑

- ❌ URL 带动词：\`/getProduct\`
- ❌ URL 全大写：\`/api/Product\`
- ❌ POST 改一切（PUT/PATCH 不用）
- ❌ 状态码永远 200，错误信息塞 message
- ❌ 把"未登录"返 200，前端还要 if code==40100

## 配套 Demo

- \`backend/demo-02-springboot-crud/\`（商品 CRUD）

## 面试常见追问

- REST 和 RPC 的区别？
- 怎么设计 URL 才"RESTful"？
- POST 和 PUT 的区别？
- 业务错误码如何设计？
- 你的接口如何做版本管理？
`,Gu=`# 10 · 分层架构（Controller / Service / Mapper）
> 所有企业 Java 工程的骨架

## 是什么

**分层架构**是把代码按职责拆到不同包 / 类里，避免"一个类 1000 行"。这是企业 Java 工程的**入门第一课**。

## 1. 经典三层

\`\`\`
┌──────────────────────────────┐
│  Controller  接口层           │  ← 收参数、返结果
├──────────────────────────────┤
│  Service     业务层           │  ← 业务逻辑、事务控制
├──────────────────────────────┤
│  Mapper      数据访问层        │  ← 数据库操作
└──────────────────────────────┘
\`\`\`

> 实际企业会加 \`DTO / VO / BO / DO\` 多个对象在不同层传递。

## 2. 详细包结构

\`\`\`
com.learnjava.demo04
├── controller/        # REST 接口
├── service/           # 业务接口
│   └── impl/          # 业务实现
├── mapper/            # MyBatis-Plus Mapper
├── entity/            # DO（Data Object）数据库映射
├── dto/               # 入参（Data Transfer Object）
├── vo/                # 出参（View Object）
├── convert/           # DO ↔ DTO ↔ VO 转换
├── config/            # 配置类
├── exception/         # 业务异常
├── common/            # 公共响应、工具
└── util/              # 工具类
\`\`\`

## 3. 实体分层（关键概念）

| 对象 | 用途 | 位置 |
| --- | --- | --- |
| \`DO\` | 持久化对象，对应数据库表 | \`entity/\` |
| \`DTO\` | 入参对象，Controller 接收 | \`dto/\` |
| \`VO\` | 出参对象，Controller 返回 | \`vo/\` |
| \`BO\` | 业务对象，Service 内部 | \`service/internal/\` |

\`\`\`java
// DO：和数据库一致
@Data
@TableName("t_product")
public class ProductDO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private LocalDateTime createTime;
}

// DTO：入参
@Data
public class ProductCreateDTO {
    @NotBlank
    private String name;
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;
    @NotNull
    @Min(0)
    private Integer stock;
}

// VO：出参
@Data
public class ProductVO {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private String statusDesc;
}
\`\`\`

**为什么不用一个对象走天下？**
- 入参字段 ≠ DB 字段（如前端传 \`passwordConfirm\`，DB 没有）
- DB 字段 ≠ 出参字段（如 DB 有 \`password_hash\`，出参不能有）
- 多表 JOIN 后字段多，前端只需部分

## 4. 转换工具（MapStruct）

手写 getter/setter 太繁琐，用 MapStruct 编译期生成：

\`\`\`java
@Mapper
public interface ProductConvert {
    ProductConvert INSTANCE = Mappers.getMapper(ProductConvert.class);

    ProductVO toVO(ProductDO entity);

    ProductDO toDO(ProductCreateDTO dto);
}
\`\`\`

\`\`\`java
ProductVO vo = ProductConvert.INSTANCE.toVO(productDO);
\`\`\`

企业里**90% 用 MapStruct** 或 **Hutool BeanUtil**（简单场景）。

## 5. 完整调用链示例

### Mapper 层

\`\`\`java
public interface ProductMapper extends BaseMapper<ProductDO> {
    // 简单的 CRUD 由 BaseMapper 提供
    // 复杂查询用注解
    @Select("SELECT * FROM t_product WHERE category_id = #{categoryId} AND deleted = 0")
    List<ProductDO> selectByCategory(Long categoryId);
}
\`\`\`

### Service 层

\`\`\`java
public interface ProductService extends IService<ProductDO> {
    Long createProduct(ProductCreateDTO dto);
    ProductVO getProductVO(Long id);
    Page<ProductVO> pageProducts(int page, int size, Long categoryId);
}

@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, ProductDO>
        implements ProductService {

    private final ProductConvert convert;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createProduct(ProductCreateDTO dto) {
        // 1. 业务校验
        if (dto.getStock() > 10000) {
            throw new BizException(ResultCode.STOCK_TOO_LARGE);
        }
        // 2. DTO -> DO
        ProductDO entity = convert.toDO(dto);
        entity.setCreateTime(LocalDateTime.now());
        // 3. 落库
        this.save(entity);
        return entity.getId();
    }

    @Override
    public ProductVO getProductVO(Long id) {
        ProductDO entity = this.getById(id);
        if (entity == null) {
            throw new BizException(ResultCode.PRODUCT_NOT_FOUND);
        }
        return convert.toVO(entity);
    }
}
\`\`\`

### Controller 层

\`\`\`java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public Result<ProductVO> getById(@PathVariable Long id) {
        return Result.ok(productService.getProductVO(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody @Valid ProductCreateDTO dto) {
        return Result.ok(productService.createProduct(dto));
    }
}
\`\`\`

## 6. 关键原则

| 原则 | 含义 |
| --- | --- |
| Controller 薄 | 只做参数接收 / 返回，不写业务 |
| Service 厚 | 业务逻辑都在 Service |
| 禁止跨层调用 | Controller 不能直接调 Mapper |
| DTO/VO/DO 不混用 | 各层用各自对象 |
| 事务在 Service | \`@Transactional\` 加在 Service 方法 |

## 7. 事务边界（重要）

\`\`\`java
// ❌ 事务加在 Controller：别人 new 一个 service 调不到
@Transactional
public Long create(...) {}

// ✅ 事务加在 Service 方法上
@Override
@Transactional(rollbackFor = Exception.class)
public Long create(...) {}

// ❌ 自调用失效（同类 a() 调 b()，b 上的 @Transactional 失效）
public void a() { this.b(); }
@Transactional public void b() {}

// ✅ 拆到两个 Service 或注入自己（@Lazy）
\`\`\`

## 8. 异常处理在哪个层

- Service 抛 \`BizException\`
- Controller 不 try-catch
- 全局 \`@RestControllerAdvice\` 统一处理

## 常见坑

- ❌ Controller 写业务：\`if (price > 0) ...\`
- ❌ 跨层调：Controller 直接 \`@Autowired ProductMapper\`
- ❌ 实体不区分：DO 直接当 VO 返回（暴露字段）
- ❌ 事务加错位置
- ❌ 同类自调用

## 配套 Demo

- \`backend/demo-02-springboot-crud/\` 标准三层
- \`backend/demo-04-multitenant-mall/\` 复杂业务分层

## 面试常见追问

- 三层架构每一层职责？
- DTO、VO、DO 区别？
- 为什么要分层？不分行不行？
- \`@Transactional\` 加在 Controller 还是 Service？
- 自调用事务失效如何解决？
`,Vu=`# 11 · MyBatis-Plus 实战
> 写最少的代码，做最多的 CRUD

## 是什么

**MyBatis-Plus（MP）** 是 MyBatis 的增强工具，国内使用率第一。核心能力：

- 内置通用 CRUD：\`save\`、\`updateById\`、\`removeById\`、\`page\` ...
- 强大的条件构造器：\`QueryWrapper\` / \`LambdaQueryWrapper\`
- 分页插件、字段自动填充、逻辑删除、租户隔离 ...

> 一句话：**让你 90% 场景不用写 SQL**。

## 1. 引入依赖

\`\`\`xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.7</version>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-jsqlparser</artifactId>
    <version>3.5.7</version>
</dependency>
\`\`\`

## 2. 配置

\`\`\`yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mall_dev?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true   # 下划线转驼峰
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 打印 SQL
  global-config:
    db-config:
      id-type: AUTO                      # 主键策略
      logic-delete-field: deleted        # 逻辑删除字段
      logic-delete-value: 1
      logic-not-delete-value: 0
\`\`\`

## 3. 注册分页插件

\`\`\`java
@Configuration
@MapperScan("com.learnjava.demo02.mapper")
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        // 乐观锁（可选）
        // interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
\`\`\`

## 4. 实体类

\`\`\`java
@Data
@TableName("t_product")  // 表名
public class ProductDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private BigDecimal price;

    private Integer stock;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic   // 逻辑删除
    private Integer deleted;
}
\`\`\`

### 字段填充（自动写 createTime / updateTime）

\`\`\`java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
\`\`\`

## 5. Mapper

\`\`\`java
public interface ProductMapper extends BaseMapper<ProductDO> {
    // 简单 CRUD 不用写，自带
    // 复杂 SQL 自己写
    @Select("SELECT * FROM t_product WHERE category_id = #{categoryId} AND deleted = 0")
    List<ProductDO> selectByCategory(Long categoryId);
}
\`\`\`

## 6. Service

\`\`\`java
public interface ProductService extends IService<ProductDO> {
    // 简单 CRUD 已有
    // 复杂业务自己加
}

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, ProductDO>
        implements ProductService {
}
\`\`\`

## 7. CRUD 速查表

\`\`\`java
// ===== 新增 =====
boolean ok = productService.save(product);
boolean ok = productService.saveBatch(list);     // 批量
boolean ok = productService.saveOrUpdate(product);

// ===== 删除 =====
boolean ok = productService.removeById(1L);
boolean ok = productService.remove(new LambdaQueryWrapper<ProductDO>()
        .eq(ProductDO::getStock, 0));

// ===== 修改 =====
boolean ok = productService.updateById(product);
boolean ok = productService.update(Wrappers.<ProductDO>lambdaUpdate()
        .set(ProductDO::getStock, 0)
        .eq(ProductDO::getCategoryId, 1L));

// ===== 查询 =====
ProductDO p = productService.getById(1L);
List<ProductDO> all = productService.list();
long cnt = productService.count();

// 分页
Page<ProductDO> page = productService.page(
    Page.of(1, 10),
    Wrappers.<ProductDO>lambdaQuery()
        .eq(ProductDO::getCategoryId, 1L)
        .orderByDesc(ProductDO::getCreateTime)
);
\`\`\`

## 8. LambdaQueryWrapper（强烈推荐）

\`\`\`java
// 避免字段名硬编码，重构安全
List<ProductDO> list = productService.lambdaQuery()
    .eq(ProductDO::getCategoryId, 1L)
    .like(ProductDO::getName, "iPhone")
    .ge(ProductDO::getPrice, 1000)
    .orderByDesc(ProductDO::getCreateTime)
    .last("LIMIT 10")
    .list();

// 分页 + 条件
Page<ProductDO> page = productService.lambdaQuery()
    .eq(ProductDO::getDeleted, 0)
    .page(Page.of(1, 10));

// 查特定字段
List<ProductVO> vos = productService.lambdaQuery()
    .select(ProductDO::getId, ProductDO::getName, ProductDO::getPrice)
    .list()
    .stream()
    .map(ProductConvert.INSTANCE::toVO)
    .toList();
\`\`\`

## 9. 分页 + 返回 VO

\`\`\`java
public Page<ProductVO> pageVO(int page, int size, Long categoryId) {
    Page<ProductDO> p = this.lambdaQuery()
        .eq(categoryId != null, ProductDO::getCategoryId, categoryId)
        .page(Page.of(page, size));

    Page<ProductVO> result = new Page<>(p.getCurrent(), p.getSize(), p.getTotal());
    result.setRecords(p.getRecords().stream()
        .map(ProductConvert.INSTANCE::toVO)
        .toList());
    return result;
}
\`\`\`

## 10. 复杂 SQL 用 XML

\`\`\`xml
<!-- resources/mapper/ProductMapper.xml -->
<mapper namespace="com.learnjava.demo02.mapper.ProductMapper">
    <resultMap id="BaseResultMap" type="com.learnjava.demo02.entity.ProductDO">
        <id column="id" property="id"/>
        <result column="name" property="name"/>
        <result column="price" property="price"/>
    </resultMap>

    <select id="selectHotProducts" resultMap="BaseResultMap">
        SELECT * FROM t_product
        WHERE deleted = 0
        ORDER BY sales DESC
        LIMIT 10
    </select>
</mapper>
\`\`\`

## 11. 性能小技巧

\`\`\`yaml
mybatis-plus:
  configuration:
    cache-enabled: true                 # 二级缓存（企业很少用）
    default-executor-type: REUSE        # 复用执行器
    map-underscore-to-camel-case: true
\`\`\`

- 简单查询走 \`BaseMapper\`（自动生成 SQL）
- 复杂多表 JOIN 走 XML
- 大批量插入用 \`saveBatch\` + 重写 \`sqlSessionFactory\` 的 \`executorType=BATCH\`

## 12. 与 JPA / MyBatis 选型

| 维度 | MyBatis-Plus | JPA/Hibernate | MyBatis |
| --- | --- | --- | --- |
| 学习成本 | 低 | 中 | 中 |
| 灵活度 | 高 | 低 | 高 |
| 性能 | 优 | 良 | 优 |
| 国内使用率 | 🔥🔥🔥 | 🔥 | 🔥🔥 |

## 常见坑

- ❌ 字段没加 \`@TableField(fill=...)\` 导致 createTime 为空
- ❌ 逻辑删除字段没配，全表 update 变真删
- ❌ 分页插件没注册，\`Page\` 不生效
- ❌ 复杂业务硬写 Wrapper，**超过 3 个表 JOIN 用 XML**
- ❌ 返回 \`List<Map>\`，应该返回具体实体

## 配套 Demo

- \`backend/demo-02-springboot-crud/\`
- \`backend/demo-04-multitenant-mall/\`

## 面试常见追问

- MyBatis-Plus 和 JPA 区别？
- \`@TableLogic\` 原理？
- 逻辑删除和物理删除怎么选？
- 如何做批量插入 10w 条？
- 分页插件原理？
`,Wu=`# 12 · 统一响应与全局异常
> 让前端不用天天问你"这个错误码是啥"

## 是什么

企业级 API 的两个基本盘：
1. **统一响应体**：所有接口都返回同样结构的 JSON
2. **全局异常处理**：所有异常都在一个地方处理

## 1. 统一响应体

### Result 通用类

\`\`\`java
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> implements Serializable {

    private int code;
    private String message;
    private T data;
    private long timestamp = System.currentTimeMillis();

    public static <T> Result<T> ok() {
        return build(0, "ok", null);
    }

    public static <T> Result<T> ok(T data) {
        return build(0, "ok", data);
    }

    public static <T> Result<T> fail(int code, String msg) {
        return build(code, msg, null);
    }

    public static <T> Result<T> fail(ResultCode rc) {
        return build(rc.getCode(), rc.getMessage(), null);
    }

    public static <T> Result<T> fail(ResultCode rc, String msg) {
        return build(rc.getCode(), msg, null);
    }

    private static <T> Result<T> build(int code, String msg, T data) {
        Result<T> r = new Result<>();
        r.code = code;
        r.message = msg;
        r.data = data;
        return r;
    }

    public boolean isSuccess() {
        return this.code == 0;
    }
}
\`\`\`

### 错误码枚举

\`\`\`java
@Getter
public enum ResultCode {
    SUCCESS(0, "成功"),

    // 4xxxx 客户端
    PARAM_ERROR(40000, "参数错误"),
    PARAM_MISSING(40001, "缺少必填参数"),
    UNAUTHORIZED(40100, "未登录"),
    TOKEN_EXPIRED(40101, "登录已过期"),
    FORBIDDEN(40300, "无权限"),
    NOT_FOUND(40400, "资源不存在"),

    // 5xxxx 业务
    PRODUCT_NOT_FOUND(50010, "商品不存在"),
    STOCK_NOT_ENOUGH(50011, "库存不足"),
    ORDER_STATE_INVALID(50020, "订单状态非法"),

    // 9xxxx 系统
    SYSTEM_ERROR(50000, "系统繁忙，请稍后再试");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
\`\`\`

> 业务码建议**5 位**段（系统/模块/具体错误），方便按段位统计报警。

## 2. 业务异常类

\`\`\`java
@Getter
public class BizException extends RuntimeException {

    private final int code;
    private final String message;

    public BizException(ResultCode rc) {
        super(rc.getMessage());
        this.code = rc.getCode();
        this.message = rc.getMessage();
    }

    public BizException(ResultCode rc, String message) {
        super(message);
        this.code = rc.getCode();
        this.message = message;
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
\`\`\`

## 3. 全局异常处理（核心）

\`\`\`java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常 */
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        log.warn("[biz] code={} msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /** @Valid 校验失败 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        log.warn("[valid] {}", msg);
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    /** 单个参数校验 */
    @ExceptionHandler(ConstraintViolationException.class)
    public Result<Void> handleConstraint(ConstraintViolationException e) {
        String msg = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + " " + v.getMessage())
                .collect(Collectors.joining("; "));
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    /** 缺少请求体 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<Void> handleBody(HttpMessageNotReadableException e) {
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), "请求体格式错误");
    }

    /** 404 */
    @ExceptionHandler(NoHandlerFoundException.class)
    public Result<Void> handleNotFound(NoHandlerFoundException e) {
        return Result.fail(ResultCode.NOT_FOUND);
    }

    /** 兜底 */
    @ExceptionHandler(Throwable.class)
    public Result<Void> handleAll(Throwable e) {
        log.error("[system] unhandled", e);
        return Result.fail(ResultCode.SYSTEM_ERROR);
    }
}
\`\`\`

> 实际企业里**拆细**（每种异常一个 handler），便于日志归类。

## 4. Service 抛出

\`\`\`java
@Override
public void reduceStock(Long productId, int qty) {
    ProductDO p = this.getById(productId);
    if (p == null) {
        throw new BizException(ResultCode.PRODUCT_NOT_FOUND);
    }
    if (p.getStock() < qty) {
        throw new BizException(ResultCode.STOCK_NOT_ENOUGH,
            "需要 " + qty + " 现有 " + p.getStock());
    }
    // 扣减
    p.setStock(p.getStock() - qty);
    this.updateById(p);
}
\`\`\`

Controller **不写 try-catch**，异常自动被全局处理。

## 5. Controller 统一

\`\`\`java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public Result<ProductVO> getById(@PathVariable Long id) {
        return Result.ok(productService.getProductVO(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody @Valid ProductCreateDTO dto) {
        return Result.ok(productService.create(dto));
    }
}
\`\`\`

所有方法返回 \`Result<T>\`，前端只判断 \`code == 0\`。

## 6. 参数校验（@Valid）

\`\`\`java
@Data
public class UserCreateDTO {

    @NotBlank(message = "用户名不能为空")
    @Length(min = 3, max = 20, message = "用户名长度 3-20")
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotNull
    @Min(0)
    @Max(150)
    private Integer age;

    @NotEmpty
    private List<@NotBlank String> tags;
}
\`\`\`

> 注意 \`@NotEmpty\` 后面可以接 \`@NotBlank\` 校验集合内元素。

## 7. 状态码 vs 业务码

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 用 HTTP 状态码 | 标准 | 4xx/5xx 语义有限 |
| 全 200 + 业务码 | 灵活、前端简单 | 偏离 HTTP 语义 |
| 混合 | 推荐 | 需要规范 |

本工程采用**全 200 + 业务码**。如需兼容 HTTP 语义，可加 \`ResponseEntity<Result<T>>\`。

## 8. 链路追踪（生产必备）

\`\`\`yaml
# 日志加 traceId
logging:
  pattern:
    level: "%5p [\${spring.application.name},%X{traceId},%X{spanId}]"
\`\`\`

通过 MDC 在拦截器/Filter 里塞 traceId，全局异常处理时打印。

## 常见坑

- ❌ Controller 里 try-catch 后只 \`log.info\`，**忘了抛** → 全局拿不到
- ❌ 业务异常用 \`e.printStackTrace()\` → 改日志
- ❌ 全局兜底 catch Throwable，吞掉 OOM → catch Exception
- ❌ 错误信息暴露系统细节（"NullPointerException at line 23"）
- ❌ 错误码每个接口一个 → 统一 ResultCode

## 配套 Demo

- \`backend/demo-02-springboot-crud/common/Result.java\`
- \`backend/demo-03-springboot-redis-auth/common/GlobalExceptionHandler.java\`

## 面试常见追问

- \`@RestControllerAdvice\` 和 \`@ControllerAdvice\` 区别？
- \`@ExceptionHandler\` 优先级？
- 业务异常和系统异常怎么分？
- 错误码体系怎么设计？
- 为什么要用统一响应体？
`,$u=`# 13 · 鉴权与 JWT
> 不让任何人能调你的接口

## 是什么

**鉴权** = 验证"你是谁、你能不能做"。

- **认证 (Authentication)**：你是谁？→ 登录
- **授权 (Authorization)**：你能做什么？→ 权限控制

企业最常用方案：**JWT（JSON Web Token）** 做无状态认证。

## 1. 为什么用 JWT

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| Session + Cookie | 简单 | 难做分布式 |
| JWT | 无状态、跨语言、天然分布式 | 没法主动失效（除非加黑名单） |

> 现代微服务几乎都用 JWT。

## 2. JWT 结构

JWT = 三段 Base64：

\`\`\`
eyJhbGciOiJIUzI1NiJ9.    ← Header：算法、类型
eyJzdWIiOiIxMjM0NSJ9.    ← Payload：业务数据
SflKxwRJSMeKKF2QT4fwp...  ← Signature：签名
\`\`\`

### 常见 Payload 字段

\`\`\`json
{
  "sub": "10086",            // 用户 ID
  "iat": 1700000000,         // 签发时间
  "exp": 1700086400,         // 过期时间
  "tenantId": 1,             // 多租户
  "roles": ["USER"]          // 角色
}
\`\`\`

## 3. 引入 jjwt 0.12.x

\`\`\`xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
\`\`\`

## 4. 配置

\`\`\`yaml
jwt:
  secret: \${JWT_SECRET:learn-java-super-long-secret-key-2026-demo-123456}
  expire: 7200           # 秒，2 小时
  header: Authorization
  prefix: "Bearer "
\`\`\`

## 5. JwtUtil

\`\`\`java
@Slf4j
@Component
public class JwtUtil {

    @Value("\${jwt.secret}")
    private String secret;

    @Value("\${jwt.expire}")
    private long expire;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generate(Long userId, String username, Long tenantId) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("username", username)
            .claim("tenantId", tenantId)
            .issuedAt(new Date(now))
            .expiration(new Date(now + expire * 1000))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
\`\`\`

## 6. 登录实现

\`\`\`java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String login(String username, String rawPwd) {
        UserDO user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BizException(ResultCode.UNAUTHORIZED, "用户不存在");
        }
        if (!passwordEncoder.matches(rawPwd, user.getPassword())) {
            throw new BizException(ResultCode.UNAUTHORIZED, "密码错误");
        }
        return jwtUtil.generate(user.getId(), user.getUsername(), user.getTenantId());
    }
}
\`\`\`

## 7. 拦截器（核心）

\`\`\`java
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
        // 放行 OPTIONS
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            return true;
        }

        String token = req.getHeader("Authorization");
        if (StrUtil.isBlank(token) || !token.startsWith("Bearer ")) {
            throw new BizException(ResultCode.UNAUTHORIZED);
        }
        token = token.substring(7);

        try {
            Claims claims = jwtUtil.parse(token);
            Long userId = Long.parseLong(claims.getSubject());
            String username = claims.get("username", String.class);
            Long tenantId = claims.get("tenantId", Long.class);

            // 把用户信息塞到 ThreadLocal
            UserContext.set(userId, username, tenantId);
            return true;
        } catch (ExpiredJwtException e) {
            throw new BizException(ResultCode.TOKEN_EXPIRED);
        } catch (Exception e) {
            log.warn("token invalid: {}", e.getMessage());
            throw new BizException(ResultCode.UNAUTHORIZED);
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse resp,
                                Object handler, Exception ex) {
        UserContext.clear();   // 必须清理，防止线程复用泄漏
    }
}
\`\`\`

## 8. 用户上下文（ThreadLocal）

\`\`\`java
public class UserContext {

    private static final ThreadLocal<UserInfo> CTX = new ThreadLocal<>();

    public static void set(Long userId, String username, Long tenantId) {
        CTX.set(new UserInfo(userId, username, tenantId));
    }

    public static UserInfo get() {
        return CTX.get();
    }

    public static Long userId() {
        UserInfo u = CTX.get();
        return u == null ? null : u.getUserId();
    }

    public static Long tenantId() {
        UserInfo u = CTX.get();
        return u == null ? null : u.getTenantId();
    }

    public static void clear() {
        CTX.remove();
    }

    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long userId;
        private String username;
        private Long tenantId;
    }
}
\`\`\`

## 9. 注册拦截器

\`\`\`java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor(jwtUtil))
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/auth/login",
                "/api/auth/register",
                "/swagger-ui/**",
                "/v3/api-docs/**"
            );
    }
}
\`\`\`

## 10. 密码加密（BCrypt）

\`\`\`java
// 永远不要存明文密码
String hash = new BCryptPasswordEncoder().encode("123456");
// $2a$10$...

// 校验
boolean ok = new BCryptPasswordEncoder().matches("123456", hash);
\`\`\`

Spring Security 的 \`BCryptPasswordEncoder\` 每次生成的 hash 都不同（带 salt）。

## 11. 注解式鉴权（进阶）

\`\`\`java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value();
}

@RequireRole("ADMIN")
@DeleteMapping("/{id}")
public Result<Void> delete(@PathVariable Long id) { ... }

// 拦截器或 AOP 里解析
if (!Arrays.asList(roles).contains(user.getRole())) {
    throw new BizException(ResultCode.FORBIDDEN);
}
\`\`\`

## 12. 完整登录流程

\`\`\`
[1] 客户端 POST /api/auth/login {username, password}
[2] 服务端校验账号 → 签发 token
[3] 返回 { token, expiresIn }

[4] 客户端后续请求 Header: Authorization: Bearer <token>
[5] AuthInterceptor 解析 token → UserContext
[6] Controller / Service 从 UserContext 拿 userId, tenantId
[7] 请求结束 → UserContext.clear()
\`\`\`

## 13. 退出登录（可选）

JWT **无法主动失效**，两种方案：
1. **前端丢弃 token**（最常用）
2. **维护服务端黑名单**（Redis 存已退出 token，TTL=剩余过期时间）

\`\`\`java
// 退出
public void logout() {
    Long userId = UserContext.userId();
    String token = currentToken.get();  // 拦截器里放进 ThreadLocal
    long ttl = jwtUtil.parse(token).getExpiration().getTime() - System.currentTimeMillis();
    redisTemplate.opsForValue().set("logout:" + token, "1", ttl, TimeUnit.MILLISECONDS);
}

// 拦截器里检查
if (redisTemplate.hasKey("logout:" + token)) {
    throw new BizException(ResultCode.UNAUTHORIZED);
}
\`\`\`

## 常见坑

- ❌ 把 userId 放 URL \`?userId=1\` → 任何人都能伪装
- ❌ token 不验签 / 用了弱 secret
- ❌ ThreadLocal 用完不清理 → 线程复用泄漏
- ❌ 密码明文 / MD5（不带 salt）→ BCrypt
- ❌ 拦截器写在 filter 之后，导致 OPTIONS 跨域预检被拦

## 配套 Demo

- \`backend/demo-03-springboot-redis-auth/\`
  - \`auth/JwtUtil\`
  - \`auth/AuthInterceptor\`
  - \`common/UserContext\`

## 面试常见追问

- JWT 和 Session 区别？
- JWT 如何主动失效？
- 什么是无状态鉴权？
- 怎么防止 JWT 被盗用？
- ThreadLocal 内存泄漏原理？
`,Yu=`# 14 · Redis 缓存与三大问题
> 性能优化的"第一把刀"

## 是什么

**Redis** 是一个**内存 KV 存储**，常用于：
- 缓存（最常见）
- 分布式锁
- 排行榜 / 计数器
- 限流 / 防重
- 消息队列（Stream）

Java 集成框架：**Spring Data Redis**。

## 1. 引入

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
\`\`\`

\`\`\`yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password:
      database: 0
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 16
          max-idle: 8
          min-idle: 2
\`\`\`

## 2. RedisTemplate 配置

\`\`\`java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> tpl = new RedisTemplate<>();
        tpl.setConnectionFactory(factory);

        // key 用 String
        tpl.setKeySerializer(new StringRedisSerializer());
        tpl.setHashKeySerializer(new StringRedisSerializer());

        // value 用 JSON
        Jackson2JsonRedisSerializer<Object> json =
            new Jackson2JsonRedisSerializer<>(objectMapper(), Object.class);
        tpl.setValueSerializer(json);
        tpl.setHashValueSerializer(json);

        tpl.afterPropertiesSet();
        return tpl;
    }

    private ObjectMapper objectMapper() {
        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        om.activateDefaultTyping(om.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
        return om;
    }
}
\`\`\`

## 3. 工具类（企业必备）

\`\`\`java
@Component
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void set(String key, Object value, long ttlSec) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSec));
    }

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    public Long incr(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    public Long decr(String key) {
        return redisTemplate.opsForValue().decrement(key);
    }

    public Boolean expire(String key, long ttlSec) {
        return redisTemplate.expire(key, Duration.ofSeconds(ttlSec));
    }
}
\`\`\`

## 4. 缓存使用模式

### Cache-Aside（最常用）

\`\`\`java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;
    private final RedisService redis;

    private static final String KEY_PRODUCT = "product:";
    private static final long TTL = 600;

    public ProductVO getById(Long id) {
        // 1. 查缓存
        ProductVO cached = redis.get(KEY_PRODUCT + id);
        if (cached != null) {
            return cached;
        }
        // 2. 查 DB
        ProductDO entity = productMapper.selectById(id);
        if (entity == null) {
            return null;
        }
        // 3. 写缓存
        ProductVO vo = ProductConvert.INSTANCE.toVO(entity);
        redis.set(KEY_PRODUCT + id, vo, TTL);
        return vo;
    }

    public void update(ProductDO entity) {
        productMapper.updateById(entity);
        // 更新时删除缓存（下次查询回源）
        redis.delete(KEY_PRODUCT + entity.getId());
    }
}
\`\`\`

### Read-Through / Write-Through

由缓存层自己回源。Spring Cache 注解就是这种思路。

## 5. Spring Cache 注解

\`\`\`java
@EnableCaching
@Configuration
public class CacheConfig { }

@Service
public class ProductService {

    @Cacheable(value = "product", key = "#id")
    public ProductVO getById(Long id) { ... }

    @CachePut(value = "product", key = "#entity.id")
    public ProductVO update(ProductDO entity) { ... }

    @CacheEvict(value = "product", key = "#id")
    public void delete(Long id) { ... }
}
\`\`\`

> 简单场景用注解，复杂业务手写（更可控）。

## 6. ⭐ 缓存三大问题（面试必考）

### (1) 缓存穿透

**场景**：查一个**不存在**的 ID，每次都打到 DB。

**解决**：
- 空值缓存：DB 返回 null 时，缓存一个空标记（如 \`__NIL__\`），TTL 短（30s）
- 布隆过滤器：拦截明显不存在的 key

\`\`\`java
public ProductVO getById(Long id) {
    ProductVO cached = redis.get(KEY_PRODUCT + id);
    if (cached != null) {
        if (cached == NIL_MARK) return null;  // 空标记
        return cached;
    }
    ProductDO entity = productMapper.selectById(id);
    if (entity == null) {
        redis.set(KEY_PRODUCT + id, NIL_MARK, 30);
        return null;
    }
    ProductVO vo = ProductConvert.INSTANCE.toVO(entity);
    redis.set(KEY_PRODUCT + id, vo, TTL);
    return vo;
}
\`\`\`

### (2) 缓存击穿

**场景**：热点 key **过期瞬间**，大量请求打到 DB。

**解决**：
- 互斥锁（分布式锁）：只有一个线程查 DB，其他等待
- 永不过期：后台异步刷新

\`\`\`java
public ProductVO getById(Long id) {
    ProductVO cached = redis.get(KEY_PRODUCT + id);
    if (cached != null) return cached;

    String lockKey = "lock:product:" + id;
    if (redis.setIfAbsent(lockKey, "1", 5)) {   // SETNX + TTL
        try {
            ProductDO entity = productMapper.selectById(id);
            // ... 写缓存
        } finally {
            redis.delete(lockKey);
        }
    } else {
        // 别人在查，等一下重试
        Thread.sleep(50);
        return getById(id);
    }
}
\`\`\`

### (3) 缓存雪崩

**场景**：**大量 key 同时过期**，请求全打到 DB。

**解决**：
- 过期时间加随机值：\`TTL + Random(0~300)\`
- 多级缓存：本地 + Redis
- 限流 / 熔断

\`\`\`java
long ttl = 600 + ThreadLocalRandom.current().nextLong(300);
redis.set(KEY_PRODUCT + id, vo, ttl);
\`\`\`

## 7. 数据一致性

| 方案 | 一致性 | 复杂度 |
| --- | --- | --- |
| 先更新 DB，再删缓存 | 最终一致 | 低 ✅ |
| 先删缓存，再更新 DB | 可能脏读 | 低 |
| 延迟双删 | 较强 | 中 |
| 订阅 binlog 异步删缓存 | 最强 | 高 |

> 企业里**最常用**是「先更新 DB，再删缓存」+ 失败重试。

## 8. Key 设计规范

| 类型 | 格式 | 示例 |
| --- | --- | --- |
| 单值 | \`业务:类型:ID\` | \`product:10086\` |
| 列表 | \`业务:类型:list:条件\` | \`product:hot:list\` |
| 哈希 | \`业务:类型:{ID}:field\` | \`user:{10086}:profile\` |
| 集合 | \`业务:类型:set\` | \`cart:user:10086\` |
| 多租户 | \`t{tenantId}:product:10086\` | \`t1:product:10086\` |

> 业务前缀 + 模块 + 业务 ID + 字段，**冒号分隔**是事实标准。

## 9. 常用命令速查

\`\`\`java
// String
opsForValue().set / get / incr / decr / setIfAbsent

// Hash
opsForHash().put / get / entries / values

// List（队列）
opsForList().leftPush / rightPop / range

// Set
opsForSet().add / members / isMember

// SortedSet（排行榜）
opsForZSet().add / range / rank
\`\`\`

## 常见坑

- ❌ 大 key（value > 1MB）→ 拆
- ❌ 没设 TTL → 内存撑爆
- ❌ Redis 当 DB 用 → 它是缓存
- ❌ 多服务共享 key 忘了加租户前缀
- ❌ 序列化用 JDK 自带 → 改 JSON

## 配套 Demo

- \`backend/demo-03-springboot-redis-auth/cache/\`
- \`backend/demo-04-multitenant-mall/cache/\`

## 面试常见追问

- 缓存三大问题？怎么解决？
- Cache-Aside 模式流程？
- 缓存和 DB 数据一致性方案？
- Redis 内存满了怎么办？
- Redis 的 key 过期策略？
`,Qu=`# 15 · 多线程与线程池
> 让服务"扛得住"的核心能力

## 是什么

Java 后端常需要**并发处理**：
- 异步发短信
- 批量处理订单
- 异步日志落盘
- 定时任务

直接 \`new Thread\` 是反模式，必须用**线程池**统一管理。

## 1. 为什么要用线程池

- ✅ 复用线程，避免频繁创建 / 销毁
- ✅ 控制并发数，防止 OOM
- ✅ 任务排队，可观测
- ❌ \`new Thread().start()\` → 资源不可控，**千万别这么写**

## 2. ThreadPoolExecutor 7 大参数

\`\`\`java
public ThreadPoolExecutor(
    int corePoolSize,        // 核心线程数（即使空闲也不回收）
    int maximumPoolSize,     // 最大线程数
    long keepAliveTime,      // 空闲线程存活时间（非核心）
    TimeUnit unit,           // 时间单位
    BlockingQueue<Runnable> workQueue,   // 任务队列
    ThreadFactory threadFactory,         // 线程工厂（命名用）
    RejectedExecutionHandler handler    // 拒绝策略
)
\`\`\`

**执行流程**：
\`\`\`
提交任务 →
  1. 核心线程数未满 → 创建核心线程执行
  2. 核心满 → 任务入队
  3. 队列满 → 创建非核心线程
  4. 线程数到 max → 触发拒绝策略
\`\`\`

## 3. 4 种拒绝策略

| 策略 | 行为 |
| --- | --- |
| AbortPolicy（默认） | 抛 \`RejectedExecutionException\` |
| CallerRunsPolicy | 调用者自己跑（最常用，能削峰） |
| DiscardPolicy | 静默丢弃 |
| DiscardOldestPolicy | 丢最老的任务 |

## 4. 线程池大小怎么定

**公式**（CPU 密集 vs IO 密集）：

\`\`\`
CPU 密集：N_cpu + 1
IO 密集：N_cpu * 2   (或更高，经验值 50~200)

N_cpu = Runtime.getRuntime().availableProcessors()
\`\`\`

> 实际企业：根据 QPS 和 平均 RT 压测调优。

## 5. Spring Boot 异步线程池（推荐）

### 配置

\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(8);
        exec.setMaxPoolSize(32);
        exec.setQueueCapacity(200);
        exec.setKeepAliveSeconds(60);
        exec.setThreadNamePrefix("async-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 等待所有任务完成再关闭
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(30);
        exec.initialize();
        return exec;
    }
}
\`\`\`

### 使用

\`\`\`java
@Service
@RequiredArgsConstructor
public class SmsService {

    @Async("taskExecutor")
    public void sendAsync(String phone, String content) {
        // 调用第三方短信 API
        log.info("send sms to {}: {}", phone, content);
    }
}

// Controller
@RestController
@RequiredArgsConstructor
public class UserController {

    private final SmsService smsService;

    @PostMapping("/register")
    public Result<Long> register(@RequestBody UserCreateDTO dto) {
        Long userId = userService.create(dto);
        smsService.sendAsync(dto.getPhone(), "欢迎注册");
        return Result.ok(userId);
    }
}
\`\`\`

> **注意**：\`@Async\` 方法**不能在本类内自调用**，必须注入其他 Bean。

## 6. CompletableFuture（高级）

\`\`\`java
public void batchProcess(List<Long> orderIds) {
    List<CompletableFuture<Void>> futures = orderIds.stream()
        .map(id -> CompletableFuture.runAsync(() -> processOrder(id), taskExecutor))
        .toList();

    // 等所有完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
}
\`\`\`

链式调用：

\`\`\`java
CompletableFuture.supplyAsync(this::queryDb, taskExecutor)
    .thenApply(this::convert)
    .thenAccept(this::sendNotify)
    .exceptionally(e -> {
        log.error("err", e);
        return null;
    });
\`\`\`

## 7. ThreadLocal 实战（多租户上下文）

\`\`\`java
// 见 13-auth-jwt
public class TenantContext {
    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();
    public static void set(Long id) { CURRENT.set(id); }
    public static Long get() { return CURRENT.get(); }
    public static void clear() { CURRENT.remove(); }
}
\`\`\`

> **必须清理**，否则线程复用会泄漏。

## 8. 锁（synchronized / ReentrantLock）

\`\`\`java
// 简单同步
private final Object lock = new Object();
public void process() {
    synchronized (lock) {
        // 临界区
    }
}

// 可中断 / 公平 / 超时
private final ReentrantLock lock = new ReentrantLock(true);
public void process() {
    if (lock.tryLock(1, TimeUnit.SECONDS)) {
        try {
            // 临界区
        } finally {
            lock.unlock();
        }
    }
}
\`\`\`

> 业务里**少用锁**（性能差、易死锁），优先用 Redis 分布式锁（见 19）。

## 9. 常见并发工具

\`\`\`java
CountDownLatch latch = new CountDownLatch(3);
// 3 个子任务完成后继续
latch.countDown();
latch.await();

Semaphore sem = new Semaphore(10);  // 限流 10 个并发
sem.acquire();
sem.release();

ConcurrentHashMap<K, V> map = new ConcurrentHashMap<>();
map.computeIfAbsent(key, k -> load(k));
\`\`\`

## 10. 线程池监控

\`\`\`java
@Bean
public TaskExecutor taskExecutor() {
    ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
    // ... 配参数
    exec.setTaskDecorator(runnable -> {
        long start = System.currentTimeMillis();
        runnable.run();
        long cost = System.currentTimeMillis() - start;
        // 上报 Prometheus
        return runnable;
    });
    return exec;
}
\`\`\`

> 生产里要监控队列大小、活跃线程数、拒绝次数。

## 11. 常见坑

- ❌ \`new Thread(() -> ...).start()\` → 不可控
- ❌ \`@Async\` 自调用 → 不生效
- ❌ ThreadLocal 用完不清理 → 内存泄漏
- ❌ 队列设成 \`new LinkedBlockingQueue<>()\`（默认 Integer.MAX_VALUE）→ OOM 风险
- ❌ 异常被吞没 → \`try { runnable } catch (Throwable t) { log.error }\`
- ❌ 锁里调用外部 HTTP → 雪崩

## 配套 Demo

- \`backend/demo-04-multitenant-mall/config/AsyncConfig.java\`
- \`backend/demo-04-multitenant-mall/async/\`

## 面试常见追问

- 线程池 7 大参数？
- 4 种拒绝策略？
- 线程池大小怎么定？
- \`@Async\` 失效场景？
- ThreadLocal 内存泄漏原理？
- \`synchronized\` 和 \`ReentrantLock\` 区别？
`,Zu=`# 16 · 多租户架构设计
> 一个服务、多个客户、数据严格隔离

## 是什么

**多租户（Multi-Tenancy）** 是一套软件**同时服务多个客户（租户）**的架构。比如一个 SaaS 商城，让 N 个品牌商都能用一套后端，但**数据严格隔离**。

> 商城 SaaS：每个入驻商家是一个租户。

## 1. 三种隔离模式

| 模式 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- |
| **独立数据库** | 隔离最强、易备份/迁移 | 成本高、DB 多 | 大客户、SaaS 高端 |
| **共享 DB，独立 Schema** | 隔离好、迁移中等 | 跨库查询难 | 中型 |
| **共享 DB，共享 Schema，租户字段** | 成本最低、扩展最强 | 实现复杂、易出错 | 大量中小租户 |

> 本工程 demo-04 采用 **第三种**（最常见、最省钱、也最考验工程能力）。

## 2. 数据模型

每张业务表加 \`tenant_id\` 字段：

\`\`\`sql
CREATE TABLE t_product (
    id           BIGINT PRIMARY KEY,
    tenant_id    BIGINT NOT NULL,
    name         VARCHAR(200),
    price        DECIMAL(10,2),
    -- ...
    KEY idx_tenant (tenant_id)
);
\`\`\`

> **所有查询都自动带 \`tenant_id = ?\` 过滤**。

## 3. 租户上下文

\`\`\`java
public class TenantContext {
    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();
    public static void set(Long id) { CURRENT.set(id); }
    public static Long get() { return CURRENT.get(); }
    public static Long require() {
        Long t = CURRENT.get();
        if (t == null) throw new BizException(ResultCode.TENANT_MISSING);
        return t;
    }
    public static void clear() { CURRENT.remove(); }
}
\`\`\`

拦截器从 JWT 取出 \`tenantId\` 塞入：

\`\`\`java
// AuthInterceptor.preHandle
TenantContext.set(tenantId);

// afterCompletion
TenantContext.clear();
\`\`\`

## 4. MyBatis-Plus 多租户插件（最简单）

### 引入（Spring Boot 3）

\`\`\`xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.7</version>
</dependency>
\`\`\`

### 配置文件

\`\`\`yaml
mybatis-plus:
  extension:
    tenants:
      - id: 1
        ignore-table:
          - t_dict
          - t_config
\`\`\`

### 注册拦截器

\`\`\`java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 多租户插件
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor(
            new TenantLineHandler() {
                @Override
                public Expression getTenantId() {
                    return new LongValue(TenantContext.require());
                }
                @Override
                public boolean ignoreTable(String tableName) {
                    // 字典表等不需要带 tenant_id
                    return "t_dict".equalsIgnoreCase(tableName);
                }
                @Override
                public boolean ignoreInsert(List<Column> columns, String tenantIdColumn) {
                    // 插入时自动写 tenant_id
                    return false;
                }
            }
        );
        interceptor.addInnerInterceptor(tenantInterceptor);

        // 2. 分页
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
\`\`\`

### 效果

\`\`\`java
// 你的代码
productMapper.selectById(1L);

// 实际执行
SELECT * FROM t_product WHERE id = 1 AND tenant_id = 1;
\`\`\`

> 增删改查全部自动加条件，**开发者完全无感**。

## 5. 实体类约定

\`\`\`java
@Data
@TableName("t_product")
public class ProductDO {
    @TableId(type = IdType.AUTO)
    private Long id;

    // 这个字段名要和你配置的 tenantIdColumn 一致
    private Long tenantId;
}
\`\`\`

> MP 默认从 \`TenantContext\` 拿 \`tenantId\`，自动塞到 \`tenant_id\` 字段。

## 6. 显式租户（特殊场景）

\`\`\`java
// 跨租户查询（如后台管理系统）
@InterceptorIgnore(tenantLine = "true")
public List<Product> selectAll() { ... }

// 临时切换
TenantContext.set(2L);
List<Product> ps = mapper.selectList(null);
TenantContext.clear();
\`\`\`

## 7. 缓存 key 加租户前缀

\`\`\`java
private String key(Long id) {
    return "t" + TenantContext.require() + ":product:" + id;
}
\`\`\`

## 8. 跨租户数据查询（管理后台）

\`\`\`java
// 管理后台查询所有租户订单
@InterceptorIgnore(tenantLine = "true", dataPermission = "true")
@Select("SELECT * FROM t_order WHERE status = #{status}")
List<Order> selectByStatus(String status);
\`\`\`

> 用 \`@InterceptorIgnore\` 绕过租户拦截。

## 9. 数据权限（按用户 + 租户）

\`\`\`java
// 商家只能看自己店铺的商品
public class DataScopeHandler implements DataPermissionHandler {

    @Override
    public Expression getSqlSegment(Table table, Expression where, String mappedStatementId) {
        // 当前用户所属店铺
        Long shopId = SecurityUtils.getCurrentShopId();
        return new LongValue(shopId);
    }
}
\`\`\`

## 10. 租户管理（运营后台）

\`\`\`sql
CREATE TABLE t_tenant (
    id          BIGINT PRIMARY KEY,
    code        VARCHAR(50) UNIQUE,    -- 租户编码
    name        VARCHAR(200),
    status      TINYINT,               -- 1 启用 0 停用
    expire_at   DATETIME,
    create_at   DATETIME
);
\`\`\`

接口：
- \`POST /api/admin/tenants\` 创建租户
- \`PATCH /api/admin/tenants/{id}/disable\` 停用
- \`POST /api/admin/tenants/{id}/reset-password\` 重置密码

## 11. 多租户的常见坑

| 坑 | 解决 |
| --- | --- |
| 缓存 key 忘了加租户 | 封装 RedisService，所有 key 自动加 \`t{tenantId}\` 前缀 |
| 后台跨租户查询 | \`@InterceptorIgnore(tenantLine = "true")\` |
| 字典 / 配置表不需租户 | \`ignoreTable\` 跳过 |
| 异步任务取不到 TenantContext | 任务开始时**手动 set** + 结束 clear |
| 主键冲突 | 全局用雪花 ID 或 UUID 兜底 |

## 12. 选型建议

| 业务规模 | 推荐 |
| --- | --- |
| 0-100 租户 | 独立数据库（数据可控） |
| 100-10000 租户 | 共享 DB + tenant_id 字段 |
| 10000+ 租户 | 分库分表 + 字段方案 |

## 配套 Demo

- \`backend/demo-04-multitenant-mall/\`
  - \`common/TenantContext\`
  - \`config/MybatisPlusConfig\`
  - 所有业务表的 DO 都有 \`tenantId\`

## 面试常见追问

- 多租户三种模式区别？
- MyBatis-Plus 多租户原理？
- 缓存里怎么隔离租户？
- 异步任务中怎么传递租户？
- 跨租户后台管理怎么实现？
`,Xu=`# 17 · 接口幂等性与防重
> 防止"重复支付、重复下单"造成的资损

## 是什么

**幂等性（Idempotency）**：同一个请求**执行一次和执行多次**结果一样。

业务里**关键操作必须幂等**：
- 创建订单
- 支付回调
- 退款
- 资金转账

否则网络抖动 + 客户端重试 = 用户被扣两次钱。

## 1. HTTP 幂等性

| Method | 天然幂等？ |
| --- | --- |
| GET | ✅ |
| PUT | ✅ |
| DELETE | ✅ |
| **POST** | ❌（不幂等） |

> POST 是"创建"语义，重复 POST = 多个对象。所以关键 POST 业务**必须**自己保证幂等。

## 2. 幂等实现方案对比

| 方案 | 原理 | 适用 |
| --- | --- | --- |
| **唯一索引** | DB 唯一约束 | 强一致场景 ✅ |
| **Idempotency-Key** | 客户端传唯一 key | 通用（推荐） |
| 状态机 | 限制状态转移 | 订单状态 |
| 乐观锁 / 分布式锁 | 互斥执行 | 高竞争 |
| Token 机制 | 一次性 token | 表单提交 |

> **企业首选**：\`Idempotency-Key + Redis\` 或 \`DB 唯一索引\`。

## 3. Idempotency-Key 方案（推荐）

### 流程

\`\`\`
[1] 客户端生成唯一 key（UUID），请求时带入 Header
    Idempotency-Key: 5f8e0c8a-1234-...

[2] 服务端先查 Redis：
    - 已有该 key → 直接返回上次结果
    - 没有 → 执行业务，结果写入 Redis（TTL 24h）

[3] 并发处理：
    - 同一 key 并发请求 → 只有第一个执行，其他等待或失败
\`\`\`

### 注解

\`\`\`java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    /** 锁的 key 前缀 */
    String prefix();
    /** key 取自哪个参数（支持 SpEL） */
    String key();
    /** 锁过期时间（秒） */
    long ttl() default 60;
}
\`\`\`

### AOP 切面

\`\`\`java
@Aspect
@Component
@RequiredArgsConstructor
public class IdempotentAspect {

    private final StringRedisTemplate redis;

    @Around("@annotation(anno)")
    public Object around(ProceedingJoinPoint pjp, Idempotent anno) throws Throwable {
        // 1. 取 Idempotency-Key（Header / SpEL 参数）
        String keyValue = resolveKey(anno, pjp);
        String lockKey = "idem:" + anno.prefix() + ":" + keyValue;

        // 2. SETNX 抢锁
        Boolean ok = redis.opsForValue().setIfAbsent(lockKey, "1", Duration.ofSeconds(anno.ttl()));
        if (Boolean.FALSE.equals(ok)) {
            // 已有请求在跑 / 已完成
            String cached = redis.opsForValue().get(lockKey + ":result");
            if (cached != null) {
                return JsonUtil.parse(cached);
            }
            throw new BizException(ResultCode.REQUEST_REPEAT);
        }

        try {
            // 3. 执行业务
            Object result = pjp.proceed();
            // 4. 缓存结果（短期）
            redis.opsForValue().set(lockKey + ":result",
                JsonUtil.toJson(result), Duration.ofHours(24));
            return result;
        } catch (Throwable e) {
            // 失败释放锁，允许重试
            redis.delete(lockKey);
            throw e;
        }
    }

    private String resolveKey(Idempotent anno, ProceedingJoinPoint pjp) {
        // 1. 优先 Header
        HttpServletRequest req = ((ServletRequestAttributes)
            RequestContextHolder.getRequestAttributes()).getRequest();
        String headerKey = req.getHeader("Idempotency-Key");
        if (StrUtil.isNotBlank(headerKey)) return headerKey;

        // 2. SpEL 解析参数
        // ...省略
        return UUID.randomUUID().toString();
    }
}
\`\`\`

## 4. 业务使用

\`\`\`java
@PostMapping
@Idempotent(prefix = "order", key = "#req.bizId", ttl = 30)
public Result<Long> createOrder(@RequestBody OrderCreateReq req) {
    return Result.ok(orderService.create(req));
}
\`\`\`

## 5. 数据库唯一索引（强一致）

\`\`\`sql
CREATE TABLE t_order (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    biz_id      VARCHAR(64) NOT NULL,    -- 业务幂等 key
    tenant_id   BIGINT NOT NULL,
    amount      DECIMAL(10,2),
    UNIQUE KEY uk_tenant_biz (tenant_id, biz_id)
);
\`\`\`

\`\`\`java
try {
    orderMapper.insert(order);
} catch (DuplicateKeyException e) {
    // 重复请求，返已存在的
    return orderMapper.selectByBizId(order.getBizId());
}
\`\`\`

> 适合**支付回调、消息消费**等强一致场景。

## 6. 状态机（订单防重）

\`\`\`java
// 订单状态：PENDING → PAID → SHIPPED → COMPLETED
public void pay(Long orderId) {
    OrderDO o = orderMapper.selectById(orderId);
    if (o.getStatus() != OrderStatus.PENDING) {
        // 已经支付过 / 已关闭 → 直接成功
        log.info("order already paid: {}", orderId);
        return;
    }
    // CAS 更新（带状态条件）
    int rows = orderMapper.updateStatusIfMatch(orderId,
        OrderStatus.PAID, OrderStatus.PENDING);
    if (rows == 0) {
        log.info("order status changed concurrently");
        return;
    }
    // ... 后续业务
}
\`\`\`

## 7. Token 机制（防表单重复提交）

\`\`\`java
@GetMapping("/form")
public Result<String> getForm() {
    String token = UUID.randomUUID().toString();
    redis.opsForValue().set("form:token:" + token, "1", Duration.ofMinutes(5));
    return Result.ok(token);
}

@PostMapping("/submit")
public Result<Void> submit(@RequestHeader("X-Form-Token") String token) {
    Boolean ok = redis.delete("form:token:" + token);
    if (Boolean.FALSE.equals(ok)) {
        throw new BizException(ResultCode.FORM_REPEAT_SUBMIT);
    }
    // 业务
}
\`\`\`

## 8. 选型决策

| 业务 | 推荐 |
| --- | --- |
| 创建订单 | Idempotency-Key（Header） |
| 支付回调 | **DB 唯一索引**（必须！） |
| 退款 | Idempotency-Key + DB 状态机 |
| 转账 | DB 唯一索引 + 分布式锁 |
| 表单提交 | Token |
| 消息消费 | DB 唯一索引 |

## 9. 测试用例

\`\`\`java
@Test
void testIdempotent() {
    // 同一 key 调两次
    Result<Long> r1 = orderApi.create(req, header("Idempotency-Key", "abc"));
    Result<Long> r2 = orderApi.create(req, header("Idempotency-Key", "abc"));

    assertEquals(r1.getData(), r2.getData());  // 同一个订单 ID
    assertEquals(1, orderMapper.selectCount().intValue()); // 只创建了 1 个
}
\`\`\`

## 常见坑

- ❌ 依赖前端 disabled 防重 → 后端必须自己防
- ❌ 用了 Redis 但没设 TTL → 内存撑爆
- ❌ 失败也缓存结果 → 用户无法重试
- ❌ 业务字段当幂等 key（可能重复）
- ❌ 并发场景没用 SETNX 抢锁 → 多个请求都执行

## 配套 Demo

- \`backend/demo-04-multitenant-mall/idem/IdempotentAspect.java\`

## 面试常见追问

- 什么是幂等？为什么需要？
- 幂等的实现方式有哪些？
- 支付回调怎么保证不重复执行？
- 数据库唯一索引和 Redis 锁怎么选？
- 状态机如何保证并发安全？
`,nr=`# 18 · 限流方案
> 防止流量打爆你的服务

## 是什么

**限流（Rate Limit）**：限制单位时间内的请求量，保护服务。

## 1. 限流的应用场景

| 场景 | 限流目标 |
| --- | --- |
| 秒杀 | 防止 1w 人抢 100 件商品把系统打挂 |
| 短信发送 | 防止恶意刷短信 |
| 第三方 API | 不超过对方配额 |
| 后台管理 | 防误操作 / 暴力破解 |

## 2. 常见算法

### (1) 固定窗口计数器

\`\`\`
每分钟计数 + 1，达到上限拒绝
\`\`\`

- 简单
- 边界问题：59s + 1s 都能打满

### (2) 滑动窗口

\`\`\`
按时间窗 + 细分子窗口滚动统计
\`\`\`

- 精度高
- 实现稍复杂

### (3) 令牌桶（Token Bucket）

\`\`\`
桶里放令牌，每 N ms 放一个；请求消耗令牌；没令牌就拒
\`\`\`

- **允许突发流量**
- 最常用 ✅

### (4) 漏桶（Leaky Bucket）

\`\`\`
请求入桶，桶按固定速率流出；桶满就拒
\`\`\`

- 输出稳定
- 不能应对突发

## 3. 选型

| 算法 | 适用 |
| --- | --- |
| 固定窗口 | 简单场景、统计用 |
| 滑动窗口 | 精准限流 |
| 令牌桶 | **API 网关、业务限流**（推荐） |
| 漏桶 | 流量整形 |

## 4. 阿里 Sentinel（生产首选）

### 引入

\`\`\`xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-spring-boot3-starter</artifactId>
    <version>1.8.8</version>
</dependency>
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>1.8.8</version>
</dependency>
\`\`\`

\`\`\`yaml
spring:
  application:
    name: mall-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel 控制台
      eager: true
\`\`\`

### 用法 1：注解

\`\`\`java
@SentinelResource(
    value = "createOrder",
    blockHandler = "createOrderBlockHandler"  // 限流后调用
)
@PostMapping
public Result<Long> create(@RequestBody OrderCreateReq req) {
    return Result.ok(orderService.create(req));
}

public Result<Long> createOrderBlock(OrderCreateReq req, BlockException e) {
    return Result.fail(ResultCode.RATE_LIMIT);
}
\`\`\`

### 用法 2：编程式

\`\`\`java
try (Entry entry = SphU.entry("queryProduct")) {
    return productService.query(req);
} catch (BlockException e) {
    return Result.fail(ResultCode.RATE_LIMIT);
}
\`\`\`

### 控制台规则

Sentinel Dashboard 配规则：
- QPS 阈值 = 100
- 流控模式：直接 / 关联 / 链路
- 流控效果：快速失败 / Warm Up / 排队等待

## 5. 分布式限流（Redis 令牌桶）

集群环境要用 Redis 统一计数：

\`\`\`java
@Component
@RequiredArgsConstructor
public class RedisRateLimiter {

    private final StringRedisTemplate redis;

    private static final String SCRIPT = """
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local requested = tonumber(ARGV[4])

        local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
        local tokens = tonumber(bucket[1]) or capacity
        local lastRefill = tonumber(bucket[2]) or now

        -- 计算补充
        local delta = math.max(0, now - lastRefill)
        local refill = delta * rate / 1000
        tokens = math.min(capacity, tokens + refill)

        local allowed = 0
        if tokens >= requested then
            tokens = tokens - requested
            allowed = 1
        end

        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('PEXPIRE', key, 60000)

        return allowed
    """;

    public boolean tryAcquire(String key, int capacity, int ratePerSec) {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>(SCRIPT, Long.class);
        Long allowed = redis.execute(script,
            List.of("rl:" + key),
            String.valueOf(capacity),
            String.valueOf(ratePerSec),
            String.valueOf(System.currentTimeMillis()),
            "1"
        );
        return allowed != null && allowed == 1;
    }
}
\`\`\`

使用：

\`\`\`java
@PostMapping("/sms/send")
public Result<Void> send(@RequestParam String phone) {
    if (!rateLimiter.tryAcquire("sms:" + phone, 5, 1)) {
        // 桶容量 5，1 个/秒
        return Result.fail(ResultCode.RATE_LIMIT);
    }
    smsService.send(phone);
    return Result.ok();
}
\`\`\`

## 6. Nginx 层限流（最前置）

\`\`\`nginx
# 限制每 IP 每秒 10 个请求
limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=ip_limit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
\`\`\`

## 7. 多维度限流

\`\`\`java
// 限流维度
public enum RateLimitDimension {
    GLOBAL,        // 全局
    PER_USER,      // 每用户
    PER_IP,        // 每 IP
    PER_TENANT,    // 每租户
    PER_API        // 每接口
}

@SentinelResource(
    value = "createOrder",
    blockHandler = "...",
    // 限流维度：按用户
    resourceType = SentinelResourceConstants.USER_FLOW
)
\`\`\`

## 8. 限流后的降级

| 策略 | 行为 |
| --- | --- |
| 快速失败 | 直接返错误（推荐） |
| 排队等待 | 阻塞到令牌可用 |
| 预热 | 启动慢一点，逐步加流量 |
| 降级 | 走简化逻辑（如返缓存） |

## 9. 监控告警

- Sentinel 实时监控（Dashboard）
- 慢调用 / 异常数 / 拒绝 QPS → 告警

\`\`\`yaml
# Spring Boot Admin + Sentinel 整合
spring.boot.admin.client.url: http://localhost:9000
\`\`\`

## 10. 测试

\`\`\`bash
# 压测工具
ab -n 1000 -c 50 http://localhost:8080/api/products
wrk -t4 -c100 -d30s http://localhost:8080/api/products
\`\`\`

## 常见坑

- ❌ 限流粒度太粗（整个服务一个）→ 按用户/租户/IP
- ❌ 限流规则不更新 → 业务高峰要调
- ❌ 限流后不返友好提示 → 客户端体验差
- ❌ 限流指标不监控 → 不知道是否真的触发了

## 配套 Demo

- \`backend/demo-04-multitenant-mall/ratelimit/RedisRateLimiter.java\`

## 面试常见追问

- 限流算法有哪些？区别？
- 分布式限流怎么实现？
- 令牌桶和漏桶区别？
- 限流和熔断区别？
- Sentinel vs Hystrix？
`,er=`# 19 · 分布式锁（Redis）
> 集群下"同一时刻只能一个"的正确姿势

## 是什么

**分布式锁**：在分布式系统下，让**多个节点同一时刻只有一个**能执行某段代码。

业务场景：
- 防止重复下单（同一用户并发）
- 秒杀超卖
- 定时任务多节点只跑一次
- 库存扣减串行化

## 1. 三大要求

| 要求 | 含义 |
| --- | --- |
| 互斥 | 任意时刻只有一个客户端持有 |
| 不死锁 | 客户端崩溃也能释放 |
| 容错 | 只要多数 Redis 节点存活，就能加锁解锁 |

## 2. SETNX 实现（最基础）

\`\`\`java
public boolean tryLock(String key, long ttlSec) {
    return Boolean.TRUE.equals(
        redis.opsForValue().setIfAbsent("lock:" + key, "1", Duration.ofSeconds(ttlSec))
    );
}

public void unlock(String key) {
    redis.delete("lock:" + key);
}
\`\`\`

> **必须设置 TTL**，否则持锁节点崩溃会死锁。

### 问题

- 释放别人的锁：A 加锁后慢，锁过期，B 加锁，A 醒来删了 B 的锁
- 不可重入

## 3. Redisson（生产首选）

### 引入

\`\`\`xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.27.2</version>
</dependency>
\`\`\`

### 配置

\`\`\`yaml
spring:
  redis:
    host: localhost
    port: 6379
\`\`\`

\`\`\`java
@Configuration
public class RedissonConfig {

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redisson() {
        Config config = new Config();
        config.useSingleServer()
            .setAddress("redis://localhost:6379")
            .setPassword("")
            .setDatabase(0);
        return Redisson.create(config);
    }
}
\`\`\`

### 用法

\`\`\`java
@Component
@RequiredArgsConstructor
public class StockService {

    private final RedissonClient redisson;

    public void reduceStock(Long productId, int qty) {
        RLock lock = redisson.getLock("lock:stock:" + productId);

        try {
            // 尝试加锁：最多等 3 秒，锁 10 秒后自动释放
            boolean ok = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!ok) {
                throw new BizException(ResultCode.SYSTEM_BUSY);
            }
            // 临界区
            int stock = stockMapper.selectStock(productId);
            if (stock < qty) throw new BizException(ResultCode.STOCK_NOT_ENOUGH);
            stockMapper.updateStock(productId, qty);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            // 只释放自己的锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
\`\`\`

> Redisson 内置看门狗（默认 30s），自动续期，**不死锁**。

## 4. Redisson 高级特性

| 特性 | 用途 |
| --- | --- |
| \`RLock\` | 可重入锁 |
| \`RFairLock\` | 公平锁（按等待顺序） |
| \`RReadWriteLock\` | 读写锁 |
| \`RCountDownLatch\` | 分布式 CountDownLatch |
| \`RRateLimiter\` | 分布式限流 |
| \`RTopic\` | 发布订阅 |
| \`RBucket\` / \`RMap\` | 分布式数据结构 |

## 5. Redisson 看门狗

\`\`\`java
// 不传 leaseTime，启动看门狗
lock.lock();  // 默认 30s，每 10s 续期到 30s

// 传 leaseTime，不续期
lock.lock(10, TimeUnit.SECONDS);
lock.tryLock(3, 10, TimeUnit.SECONDS);
\`\`\`

> **生产推荐不传 leaseTime**，让看门狗自动续期。

## 6. Redlock（高可用）

要更高可用度？用 **Redlock** 算法（多个独立 Redis 节点投票）：

\`\`\`java
RedissonClient redisson = Redisson.create(config); // 多节点配置
RLock lock = redisson.getRedLock(lock1, lock2, lock3);
\`\`\`

> 一般业务 **Redisson 单 Redis 够用**。金融场景才用 Redlock。

## 7. 锁 vs 唯一索引 vs 状态机

| 方案 | 适用 |
| --- | --- |
| Redis 分布式锁 | 短临界区、不能依赖 DB |
| DB 唯一索引 | 强一致、简单 |
| 状态机 | 状态转移类业务 |
| 乐观锁（version） | 读多写少 |

> 实战组合：**DB 唯一索引 + Redis 锁（粗粒度）**。

## 8. 业务级防重：秒杀示例

\`\`\`java
public Result<Long> seckill(Long productId, Long userId) {
    // 1. 限购（每人 1 件）
    Long count = redis.opsForValue().increment("seckill:user:" + productId + ":" + userId);
    if (count > 1) {
        throw new BizException(ResultCode.SECKILL_REPEAT);
    }

    // 2. 库存预扣（Lua 原子）
    Long stock = redisStockService.decr(productId);
    if (stock < 0) {
        // 回滚限购
        redis.opsForValue().decrement("seckill:user:" + productId + ":" + userId);
        throw new BizException(ResultCode.SECKILL_SOLD_OUT);
    }

    // 3. 异步下单
    seckillQueue.put(new SeckillMessage(productId, userId));
    return Result.ok(/*排队中*/);
}
\`\`\`

## 9. 常见坑

- ❌ 不设 TTL → 客户端崩溃死锁
- ❌ 释放别人锁 → 用 Lua 脚本 CAS
- ❌ 锁里调用外部 HTTP → 慢 → 锁过期
- ❌ 没用 try-finally → 异常没释放
- ❌ 自调用 tryLock 不检查 isHeldByCurrentThread → IllegalMonitorStateException

## 10. 替代方案：Zookeeper

\`Curator\` 框架提供分布式锁，但性能不如 Redis，企业越来越少用。

## 11. 完整可重入示例

\`\`\`java
public void outer() {
    RLock lock = redisson.getLock("order:" + orderId);
    if (lock.tryLock()) {
        try {
            // outer 加锁
            inner();  // 同一线程可重入，不会死锁
        } finally {
            lock.unlock();
        }
    }
}

public void inner() {
    RLock lock = redisson.getLock("order:" + orderId);
    if (lock.tryLock()) {
        try {
            // 业务
        } finally {
            lock.unlock();
        }
    }
}
\`\`\`

## 配套 Demo

- \`backend/demo-04-multitenant-mall/lock/StockService.java\`

## 面试常见追问

- 分布式锁三大要求？
- SETNX 实现有什么问题？
- Redisson 看门狗原理？
- Redlock 是什么？什么场景用？
- 分布式锁 vs 数据库锁怎么选？
`,tr=`# 20 · 工程化与监控
> 从"能跑"到"能上生产"

## 是什么

**工程化**是把代码变成"可观测、可维护、可发布"产品的过程。包括：

- 统一异常 / 响应 / 日志
- 接口文档
- 监控告警
- CI/CD
- 配置中心

## 1. 项目骨架

\`\`\`
mall/
├── pom.xml                    # 父 POM
├── mall-common/               # 公共模块（Result/异常/工具）
├── mall-domain/               # 领域模型（DO/Enum）
├── mall-api/                  # API 模块
├── mall-service/              # 业务实现
│   ├── controller/
│   ├── service/
│   │   └── impl/
│   ├── mapper/
│   ├── config/
│   ├── job/                   # 定时任务
│   ├── mq/                    # MQ 消费
│   └── web/                   # 拦截器、Filter
├── mall-app/                  # 启动模块
└── mall-start/                # 独立启动类
\`\`\`

> 实际企业里**多模块**清晰，本工程 demo-04 演示。

## 2. 配置管理

### application.yml 分层

\`\`\`yaml
# application.yml 公共
spring:
  application:
    name: mall-service
  profiles:
    active: dev

server:
  port: 8080

mybatis-plus:
  ...

logging:
  level:
    root: INFO
    com.learnjava: DEBUG
\`\`\`

\`\`\`yaml
# application-dev.yml 开发
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mall_dev
\`\`\`

\`\`\`yaml
# application-prod.yml 生产
spring:
  datasource:
    url: jdbc:mysql://\${DB_HOST}:\${DB_PORT}/mall_prod
\`\`\`

### 配置中心（Nacos）

\`\`\`xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    <version>2022.0.0.0-RC2</version>
</dependency>
\`\`\`

\`\`\`yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        file-extension: yaml
\`\`\`

> 配置改完**热更新**不用重启。

## 3. 日志规范

### logback-spring.xml

\`\`\`xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%X{traceId}] [%t] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </root>

    <logger name="com.learnjava" level="DEBUG"/>
</configuration>
\`\`\`

### 关键日志点

\`\`\`java
log.info("收到请求: uri={}, params={}", uri, params);
log.info("业务节点: userId={}, action={}", userId, action);
log.warn("业务异常: code={}, msg={}", code, msg);
log.error("系统异常: orderId={}", orderId, throwable);
\`\`\`

> **禁止**：
> - 打密码、身份证、银行卡
> - 循环里打日志
> - \`e.printStackTrace()\`

## 4. 接口文档（springdoc-openapi）

\`\`\`xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
\`\`\`

\`\`\`java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Mall Service API")
                .version("1.0")
                .description("多租户商城后端 API"))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
\`\`\`

Controller 加注解：

\`\`\`java
@Operation(summary = "创建订单")
@ApiResponses({@ApiResponse(responseCode = "200", description = "成功")})
@PostMapping
public Result<Long> create(@RequestBody OrderCreateReq req) { ... }
\`\`\`

访问 \`http://localhost:8080/swagger-ui.html\`。

## 5. 监控（Actuator + Prometheus + Grafana）

### 引入

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
\`\`\`

\`\`\`yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: mall-service
\`\`\`

### 关键指标

| 指标 | 含义 |
| --- | --- |
| \`http_server_requests_seconds_count\` | 请求数 |
| \`http_server_requests_seconds_sum\` | 累计耗时 |
| \`jvm_memory_used_bytes\` | JVM 内存 |
| \`jvm_gc_pause_seconds_max\` | GC 停顿 |
| \`hikaricp_connections_active\` | DB 连接池活跃数 |
| \`redis_lettuce_commands_seconds_count\` | Redis 调用数 |

### Grafana Dashboard

导入 Spring Boot 官方模板，监控：QPS、RT、错误率、JVM、DB、Redis。

## 6. 健康检查

\`\`\`yaml
management:
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
\`\`\`

\`/actuator/health/liveness\` —— 探活
\`/actuator/health/readiness\` —— 就绪（依赖 OK 才返 200）

> K8s 会读这两个端点决定是否把流量切过来。

## 7. 链路追踪（Micrometer Tracing + Zipkin）

\`\`\`xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
\`\`\`

\`\`\`yaml
management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans
\`\`\`

每个请求自动生成 traceId，前端 Header \`traceparent\` 也能串联。

## 8. 统一异常（回顾）

见 \`12-response-exception\`，所有异常 → 统一响应 + 日志 + traceId。

## 9. 启动检查

\`\`\`java
@Component
@RequiredArgsConstructor
public class StartupChecker implements ApplicationRunner {

    private final DataSource dataSource;
    private final RedisTemplate<String, Object> redis;

    @Override
    public void run(ApplicationArguments args) {
        checkDb();
        checkRedis();
        log.info("✅ startup check passed");
    }

    private void checkDb() {
        try (Connection c = dataSource.getConnection()) {
            c.isValid(2);
        } catch (Exception e) {
            throw new RuntimeException("❌ DB unreachable", e);
        }
    }

    private void checkRedis() {
        redis.opsForValue().set("startup:check", "1");
    }
}
\`\`\`

## 10. 优雅停机

\`\`\`yaml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
\`\`\`

K8s 发 SIGTERM → Spring 处理完在飞请求 → 退出。

## 11. 性能压测

\`\`\`bash
# ab
ab -n 10000 -c 100 http://localhost:8080/api/products

# wrk
wrk -t4 -c100 -d30s http://localhost:8080/api/products

# jmeter（GUI 复杂场景）
\`\`\`

JMH 测单方法性能：

\`\`\`java
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MICROSECONDS)
public class MyBenchmark {
    @Benchmark
    public String test() { return "ok"; }
}
\`\`\`

## 12. CI/CD（简化版）

\`\`\`yaml
# .github/workflows/build.yml
name: build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with: { distribution: temurin, java-version: 17 }
      - run: ./mvnw -B clean verify
      - run: ./mvnw -B package -DskipTests
      - uses: actions/upload-artifact@v3
        with: { name: jar, path: target/*.jar }
\`\`\`

## 13. 部署模式

| 模式 | 适合 |
| --- | --- |
| JAR + Docker | 单体 / 微服务 |
| K8s Deployment | 大规模 |
| Serverless | 弹性业务 |

Dockerfile 最小示例：

\`\`\`dockerfile
FROM eclipse-temurin:17-jre
COPY target/app.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
\`\`\`

## 14. 常见坑

- ❌ 日志全在容器 stdout → 没用日志收集
- ❌ 没有健康检查 → K8s 误判
- ❌ 启动慢（30s+）→ K8s 健康检查超时
- ❌ 没用配置中心 → 改个 URL 要重启 100 个实例
- ❌ 没压测就上线

## 配套 Demo

- 所有 demo 的 \`application.yml\` 都按此规范
- \`backend/demo-04-multitenant-mall/\` 多模块示例

## 面试常见追问

- 链路追踪原理（traceId/spanId 怎么串）？
- 健康检查和就绪检查区别？
- 优雅停机怎么实现？
- 监控指标怎么采集？
- 你们公司 CI/CD 怎么做的？
`,ur=`# 01 · MySQL 安装与连接
> 三种方式把 MySQL 跑起来

## 是什么

**MySQL** 是世界上最流行的开源关系型数据库（RDBMS）。Java 后端最常用的搭档。

## 1. 三种安装方式（任选一种）

### 方式 1：官方安装包（推荐新手）

1. 下载：https://dev.mysql.com/downloads/mysql/
2. 选 **MySQL Community Server 8.0.x**
3. Windows 一路下一步；macOS 用 DMG
4. 记住设置的 **root 密码**

验证：

\`\`\`bash
mysql -uroot -p
# Enter password: ******
mysql> SELECT VERSION();
\`\`\`

### 方式 2：Docker（推荐）

\`\`\`bash
docker run -d \\
  --name mysql8 \\
  -p 3306:3306 \\
  -e MYSQL_ROOT_PASSWORD=root \\
  -e MYSQL_DATABASE=mall_dev \\
  -e TZ=Asia/Shanghai \\
  mysql:8.0
\`\`\`

\`\`\`bash
docker exec -it mysql8 mysql -uroot -proot
\`\`\`

> 学习阶段用 Docker 最省心，**不需要装本地服务**。

### 方式 3：集成环境

- Windows：XAMPP、phpStudy（自带 phpMyAdmin）
- macOS：MAMP
- 适合纯前端 / 不愿意折腾 DB 的人

## 2. GUI 工具

| 工具 | 平台 | 价格 | 推荐度 |
| --- | --- | --- | --- |
| Navicat | 全 | 收费（有个人版） | ⭐⭐⭐⭐ |
| DBeaver | 全 | 免费开源 | ⭐⭐⭐⭐⭐ |
| MySQL Workbench | 全 | 免费 | ⭐⭐⭐ |
| DataGrip | 全 | 收费（学生免费） | ⭐⭐⭐⭐⭐ |
| SQLyog | Windows | 社区版免费 | ⭐⭐⭐ |

> IDEA 社区版**不带** Database 工具，推荐 **DBeaver**（免费）。

## 3. 命令行速查

\`\`\`bash
# 连接
mysql -h127.0.0.1 -P3306 -uroot -p

# 查版本
SELECT VERSION();

# 查所有数据库
SHOW DATABASES;

# 切换 / 创建 / 删库
USE mall_dev;
CREATE DATABASE mall_dev DEFAULT CHARSET utf8mb4;
DROP DATABASE mall_dev;

# 查所有表
SHOW TABLES;

# 退出
EXIT;
\`\`\`

## 4. 创建本工程数据库

\`\`\`sql
CREATE DATABASE mall_dev   DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE mall_test  DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE mall_prod  DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

> **为什么 utf8mb4？** MySQL 的 \`utf8\` 只支持 3 字节，不能存 emoji；\`utf8mb4\` 才是真正的 UTF-8（4 字节）。

## 5. 用户与权限

\`\`\`sql
-- 创建一个应用专用用户（不要在代码里用 root）
CREATE USER 'mall'@'%' IDENTIFIED BY 'mall_pwd_2026';

-- 授权
GRANT ALL PRIVILEGES ON mall_dev.* TO 'mall'@'%';
GRANT ALL PRIVILEGES ON mall_test.* TO 'mall'@'%';

-- 远程连接（生产才开）
GRANT ALL PRIVILEGES ON mall_prod.* TO 'mall'@'%' WITH GRANT OPTION;

-- 刷新
FLUSH PRIVILEGES;
\`\`\`

> 企业里**绝对不能用 root 跑应用**，最小权限原则。

## 6. IDEA 社区版的 DB 工具

IDEA Community 没有内置 DB 工具，推荐：

- **DBeaver**（免费开源、Java 写的）
- **Navicat Lite**（个人版免费）
- 直接用 \`mysql\` 命令行（最快）

## 7. Java JDBC 连接字符串

\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mall_dev?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: mall
    password: mall_pwd_2026
    driver-class-name: com.mysql.cj.jdbc.Driver
\`\`\`

关键参数：

| 参数 | 作用 |
| --- | --- |
| \`useSSL=false\` | 关闭 SSL（开发环境） |
| \`serverTimezone=Asia/Shanghai\` | 时区（不设会差 8 小时） |
| \`characterEncoding=UTF-8\` | 字符集 |
| \`useUnicode=true\` | 启用 Unicode |
| \`allowPublicKeyRetrieval=true\` | 解决 caching_sha2_password 报错 |

## 8. 常见坑

- ❌ 用了 \`utf8\` 存 emoji → 改 \`utf8mb4\`
- ❌ 用了 root → 建应用专用用户
- ❌ 时区没设 → 时间差 8 小时
- ❌ 3306 端口被占用 → 改端口或停老实例
- ❌ Docker 容器删了数据没 → 用 \`-v\` 挂载

## 配套 Demo

- \`backend/demo-02-springboot-crud/sql/init.sql\`
- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- utf8 和 utf8mb4 区别？
- 为什么不能用 root 跑应用？
- MySQL 默认端口？时区？
- 关系型数据库和非关系型区别？
`,rr=`# 02 · 库 / 表 / 字段基础
> 数据库里的"文件夹-表格-列"

## 是什么

MySQL 是**层次结构**：

\`\`\`
MySQL Server
└── Database（数据库 / schema）
    └── Table（表）
        └── Column（列 / 字段）
        └── Row（行 / 记录）
\`\`\`

## 1. 数据库操作

\`\`\`sql
-- 创建（注意字符集和排序规则）
CREATE DATABASE mall_dev
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 查看
SHOW DATABASES;
SHOW CREATE DATABASE mall_dev;   -- 看创建语句

-- 切换
USE mall_dev;

-- 删（危险操作）
DROP DATABASE mall_dev;
\`\`\`

## 2. 表的创建（核心）

\`\`\`sql
CREATE TABLE t_product (
    id           BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '主键',
    tenant_id    BIGINT       NOT NULL                COMMENT '租户 ID',
    name         VARCHAR(200) NOT NULL                COMMENT '商品名称',
    price        DECIMAL(10,2) NOT NULL               COMMENT '价格',
    stock        INT          NOT NULL DEFAULT 0      COMMENT '库存',
    status       TINYINT      NOT NULL DEFAULT 1      COMMENT '1 上架 0 下架',
    description  TEXT                                  COMMENT '描述',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_tenant (tenant_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
\`\`\`

要点：

- \`AUTO_INCREMENT\`：自增 ID
- \`COMMENT\`：注释（**一定要加**，方便以后维护）
- \`ENGINE=InnoDB\`：事务、行锁（**不要用 MyISAM**）
- \`DEFAULT CHARSET=utf8mb4\`：4 字节 UTF-8
- 主键 + 索引一次性建好

## 3. 字段命名规范

| 规则 | 例子 |
| --- | --- |
| 小写 + 下划线 | \`user_name\` ❌ \`userName\` |
| 见名知意 | \`status\` ❌ \`s\` |
| 不用复数 | \`order\` ❌ \`orders\` |
| 布尔用 \`is_\` 或 \`tinyint\` | \`is_active\` |
| 时间用 \`_time\` 后缀 | \`create_time\` |
| 状态用 \`status\` | \`status\` |

> Java 端通过 \`map-underscore-to-camel-case\` 自动转驼峰。

## 4. 必备字段（每张业务表）

\`\`\`sql
id          BIGINT       -- 主键
create_time DATETIME     -- 创建时间
update_time DATETIME     -- 更新时间
deleted     TINYINT      -- 逻辑删除（0 未删 1 已删）
tenant_id   BIGINT       -- 多租户 ID
\`\`\`

逻辑删除字段统一使用 \`deleted\` 命名，方便 MyBatis-Plus 自动识别。

## 5. 删改表

\`\`\`sql
-- 加列
ALTER TABLE t_product ADD COLUMN brand VARCHAR(100) AFTER name;

-- 改列
ALTER TABLE t_product MODIFY COLUMN name VARCHAR(300) NOT NULL;

-- 删列（危险）
ALTER TABLE t_product DROP COLUMN brand;

-- 改表名
RENAME TABLE t_product TO t_goods;

-- 删表（生产禁用）
DROP TABLE t_product;
TRUNCATE TABLE t_product;  -- 更快、不可回滚
\`\`\`

## 6. 查看表

\`\`\`sql
SHOW TABLES;                -- 当前库所有表
DESC t_product;             -- 表结构
SHOW CREATE TABLE t_product;  -- 完整建表语句
SHOW TABLE STATUS;          -- 表状态（行数 / 引擎）
\`\`\`

## 7. 表设计三大范式（基础）

| 范式 | 含义 |
| --- | --- |
| 1NF | 字段不可再分（每列一个值） |
| 2NF | 非主键字段完全依赖主键 |
| 3NF | 非主键字段不能传递依赖 |

> **实战**：会为了性能**反范式**（冗余字段）。如订单表冗余商品名 / 价格。

## 8. 反范式：业务实战

\`\`\`sql
-- 订单表冗余商品名和价格（避免 JOIN）
CREATE TABLE t_order (
    id          BIGINT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,   -- 冗余
    unit_price  DECIMAL(10,2) NOT NULL,   -- 冗余
    qty         INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status      TINYINT NOT NULL,
    create_time DATETIME NOT NULL,
    KEY idx_user (user_id)
);
\`\`\`

> 优点：单表查订单不需要 JOIN 商品表
> 缺点：商品改名时订单表里还是旧名（**业务上反而正确**）

## 9. 业务里常见的反范式字段

| 字段 | 用途 |
| --- | --- |
| \`create_time\` | 业务排查 |
| \`update_time\` | 缓存失效 |
| \`creator_id\` | 审计 |
| \`tenant_id\` | 多租户 |
| \`deleted\` | 逻辑删除 |
| \`version\` | 乐观锁 |

## 10. 命名建议

| 类型 | 命名 | 例 |
| --- | --- | --- |
| 表 | \`t_<模块>_<业务>\` 或 \`t_<业务>\` | \`t_product\`, \`t_order\` |
| 索引 | \`idx_<字段>\` | \`idx_user_id\` |
| 唯一索引 | \`uk_<字段>\` | \`uk_order_no\` |
| 主键 | \`id\` | \`id\` |

## 常见坑

- ❌ 字段没注释 → 半年后没人看得懂
- ❌ 用 MyISAM → 不支持事务
- ❌ \`VARCHAR(255)\` 一把梭 → 按需设置（过长影响索引）
- ❌ 没建索引 → 全表扫描
- ❌ 时间字段用 \`VARCHAR\` → 排序、比较都慢

## 配套 Demo

- \`backend/demo-02-springboot-crud/sql/init.sql\`

## 面试常见追问

- 三大范式是什么？实战中会全遵守吗？
- 逻辑删除 vs 物理删除？
- \`datetime\` vs \`timestamp\` 区别？
- 反范式举例？
- 表必须有主键吗？没有会怎样？
`,ar=`# 03 · 增删改查 SQL
> 后端 90% 的工作都围绕这几条 SQL

## 是什么

CRUD = **C**reate / **R**ead / **U**pdate / **D**elete，对应 INSERT / SELECT / UPDATE / DELETE。

## 1. INSERT（新增）

### 单条

\`\`\`sql
INSERT INTO t_product (tenant_id, name, price, stock)
VALUES (1, 'iPhone', 5999.00, 100);
\`\`\`

### 多条

\`\`\`sql
INSERT INTO t_product (tenant_id, name, price, stock) VALUES
  (1, 'iPhone',  5999.00, 100),
  (1, 'iPad',    3999.00,  50),
  (1, 'MacBook', 9999.00,  20);
\`\`\`

### 插入或更新（ON DUPLICATE KEY）

\`\`\`sql
INSERT INTO t_stock (product_id, stock)
VALUES (100, 50)
ON DUPLICATE KEY UPDATE stock = stock + 50;
\`\`\`

> 适合"扣库存、加积分"类业务。

### 插入或替换

\`\`\`sql
REPLACE INTO t_config(\`key\`, \`value\`) VALUES ('site_name', 'MyMall');
\`\`\`

## 2. SELECT（查询）

### 基础查询

\`\`\`sql
SELECT id, name, price FROM t_product;
SELECT * FROM t_product;  -- 生产少用
\`\`\`

### WHERE 条件

\`\`\`sql
-- 等于
SELECT * FROM t_product WHERE tenant_id = 1;

-- 多条件
SELECT * FROM t_product
WHERE tenant_id = 1
  AND status = 1
  AND price BETWEEN 100 AND 5000;

-- 模糊
SELECT * FROM t_product WHERE name LIKE '%iPhone%';

-- IN
SELECT * FROM t_product WHERE id IN (1, 2, 3);

-- 多个值
SELECT * FROM t_product WHERE category_id IN (SELECT id FROM t_category WHERE parent_id = 5);
\`\`\`

### 排序 + 分页

\`\`\`sql
-- 排序
SELECT * FROM t_product ORDER BY create_time DESC;
SELECT * FROM t_product ORDER BY price ASC, create_time DESC;

-- 分页（LIMIT offset, size）
SELECT * FROM t_product
WHERE tenant_id = 1
ORDER BY id DESC
LIMIT 0, 10;   -- 第 1 页 10 条

-- 分页 = 20, 10
SELECT * FROM t_product
WHERE tenant_id = 1
ORDER BY id DESC
LIMIT 20, 10;
\`\`\`

> 大数据**别用大 offset**，要"游标分页"：\`WHERE id < 上一页最后ID ORDER BY id DESC LIMIT 10\`。

### 去重 + 聚合

\`\`\`sql
SELECT DISTINCT category_id FROM t_product;

SELECT
  category_id,
  COUNT(*) AS cnt,
  AVG(price) AS avg_price,
  MAX(price) AS max_price,
  MIN(price) AS min_price,
  SUM(stock)  AS total_stock
FROM t_product
WHERE tenant_id = 1
GROUP BY category_id
HAVING cnt > 5
ORDER BY cnt DESC;
\`\`\`

### 多表 JOIN

\`\`\`sql
-- 内连接（取交集）
SELECT p.id, p.name, c.name AS category_name
FROM t_product p
JOIN t_category c ON p.category_id = c.id
WHERE p.tenant_id = 1;

-- 左连接（保留左表全部）
SELECT o.id, o.amount, u.username
FROM t_order o
LEFT JOIN t_user u ON o.user_id = u.id;

-- 多表
SELECT o.id, u.username, p.name AS product_name, oi.qty
FROM t_order o
JOIN t_user u        ON o.user_id   = u.id
JOIN t_order_item oi ON oi.order_id = o.id
JOIN t_product p     ON oi.product_id = p.id
WHERE o.tenant_id = 1;
\`\`\`

### 子查询

\`\`\`sql
-- 标量子查询
SELECT *,
  (SELECT COUNT(*) FROM t_order WHERE user_id = u.id) AS order_count
FROM t_user u
WHERE u.tenant_id = 1;

-- IN 子查询
SELECT * FROM t_product
WHERE id IN (SELECT product_id FROM t_order_item GROUP BY product_id HAVING SUM(qty) > 1000);
\`\`\`

## 3. UPDATE（修改）

\`\`\`sql
-- 基础
UPDATE t_product SET price = 5499 WHERE id = 1;

-- 多个字段
UPDATE t_product
SET price = 5499, status = 1, update_time = NOW()
WHERE id = 1;

-- 批量
UPDATE t_product
SET status = 0
WHERE category_id = 5 AND tenant_id = 1;

-- 关联更新
UPDATE t_product p
JOIN t_category c ON p.category_id = c.id
SET p.status = 0
WHERE c.name = '已下架分类';
\`\`\`

> ⚠️ **一定带 WHERE**，否则全表更新。

## 4. DELETE（删除）

\`\`\`sql
-- 物理删除（生产慎用）
DELETE FROM t_product WHERE id = 1;

-- 批量
DELETE FROM t_product WHERE category_id = 5;

-- 关联删除
DELETE o, oi
FROM t_order o
JOIN t_order_item oi ON oi.order_id = o.id
WHERE o.id = 1;
\`\`\`

> **企业里 99% 用逻辑删除**：\`UPDATE ... SET deleted = 1 WHERE id = ?\`

## 5. 常用函数

\`\`\`sql
-- 字符串
CONCAT('Hi, ', name)                -- 拼接
UPPER(name) / LOWER(name)           -- 大小写
LENGTH(name) / CHAR_LENGTH(name)    -- 长度
TRIM(name) / LTRIM / RTRIM          -- 去空格
SUBSTRING(name, 1, 3)               -- 截取

-- 数值
ROUND(price, 2)                     -- 四舍五入
CEIL / FLOOR                        -- 向上 / 向下取整
ABS / MOD                           -- 绝对值 / 取模

-- 时间
NOW() / CURDATE() / CURTIME()
DATE_FORMAT(create_time, '%Y-%m-%d')
DATE_ADD(create_time, INTERVAL 7 DAY)
DATEDIFF(end_time, start_time)
YEAR(create_time) / MONTH / DAY

-- 条件
IF(price > 100, 'expensive', 'cheap')
IFNULL(stock, 0)
COALESCE(a, b, c, 0)   -- 第一个非空
CASE WHEN ... THEN ... END
\`\`\`

## 6. 性能小习惯

\`\`\`sql
-- ✅ SELECT 具体字段，不要 SELECT *
SELECT id, name, price FROM t_product WHERE id = 1;

-- ✅ LIMIT 限制
SELECT id, name FROM t_product LIMIT 1000;

-- ✅ 避免在 WHERE 上做函数运算（索引失效）
WHERE DATE(create_time) = '2026-01-01'            -- ❌
WHERE create_time >= '2026-01-01' AND create_time < '2026-01-02'  -- ✅

-- ✅ 用 EXISTS 代替 IN（大数据）
SELECT * FROM t_user u
WHERE EXISTS (SELECT 1 FROM t_order o WHERE o.user_id = u.id);
\`\`\`

## 7. MyBatis-Plus 对应

\`\`\`java
// 上面所有 SQL 大部分不用写，MP 自动生成
productMapper.selectById(1L);
productMapper.selectList(Wrappers.<ProductDO>lambdaQuery().eq(...));
productMapper.updateById(entity);
\`\`\`

## 常见坑

- ❌ 忘了 \`WHERE\` 条件 → 改了一整张表
- ❌ \`SELECT *\` 性能差
- ❌ \`LIMIT 1000000, 10\` 慢 → 游标分页
- ❌ 时间字段用了 \`VARCHAR\`
- ❌ 用 \`DELETE\` 删业务数据 → 改逻辑删除

## 配套 Demo

- \`backend/demo-02-springboot-crud/sql/init.sql\`
- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- \`IN\` 和 \`EXISTS\` 区别？
- \`WHERE\` 和 \`HAVING\` 区别？
- \`INNER JOIN\` / \`LEFT JOIN\` / \`RIGHT JOIN\` 区别？
- 物理删除 vs 逻辑删除？
- 为什么避免 \`SELECT *\`？
`,ir=`# 04 · 约束
> 让数据库自己保证数据正确

## 是什么

**约束（Constraint）** 是数据库对数据的**强制规则**。业务上很多校验，应该放在数据库层兜底。

## 1. 主键约束（PRIMARY KEY）

\`\`\`sql
CREATE TABLE t_product (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    PRIMARY KEY (id)
);
\`\`\`

要点：
- 唯一且非空
- 一张表**只能有一个**
- MySQL InnoDB 表**必须有主键**（没设会自动选一列；推荐显式 BIGINT 自增）

### 复合主键

\`\`\`sql
CREATE TABLE t_order_item (
    order_id   BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    qty        INT NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
\`\`\`

> 业务里**很少用复合主键**，通常用联合唯一索引。

## 2. 唯一约束（UNIQUE）

\`\`\`sql
CREATE TABLE t_user (
    id        BIGINT PRIMARY KEY,
    username  VARCHAR(50) NOT NULL,
    email     VARCHAR(100),
    UNIQUE KEY uk_username (username),         -- 单列唯一
    UNIQUE KEY uk_email (email)
);
\`\`\`

> 唯一约束**允许 NULL**，且 NULL 不冲突（多个 NULL 行不视为重复）。

### 联合唯一

\`\`\`sql
CREATE TABLE t_product_sku (
    id          BIGINT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL,
    spu_id      BIGINT NOT NULL,
    sku_code    VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_tenant_spu_code (tenant_id, spu_id, sku_code)
);
\`\`\`

> 业务里"幂等键"常用联合唯一。配合 Java 的 \`try-catch DuplicateKeyException\` 做幂等。

## 3. 非空约束（NOT NULL）

\`\`\`sql
CREATE TABLE t_product (
    id    BIGINT NOT NULL,
    name  VARCHAR(200) NOT NULL,    -- 必须传
    description TEXT                  -- 可空
);
\`\`\`

> **业务字段建议都 NOT NULL + DEFAULT**，避免 NPE。

## 4. 默认值（DEFAULT）

\`\`\`sql
CREATE TABLE t_product (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    status      TINYINT NOT NULL DEFAULT 1,            -- 默认上架
    stock       INT NOT NULL DEFAULT 0,                -- 默认 0 库存
    deleted     TINYINT NOT NULL DEFAULT 0,             -- 默认未删
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

> 时间字段几乎都用 \`DEFAULT CURRENT_TIMESTAMP\`，Java 端不用手动 set。

## 5. 外键约束（FOREIGN KEY）

\`\`\`sql
CREATE TABLE t_order (
    id      BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES t_user(id)
);
\`\`\`

### 实际企业里**很少用外键**，原因：

1. 性能差（每次写要检查）
2. 难做分库分表
3. 级联删除危险

> 业务里**靠应用层 + 业务校验**保证关联正确性。但**学习阶段**了解概念还是要的。

## 6. 检查约束（CHECK，MySQL 8+）

\`\`\`sql
CREATE TABLE t_product (
    id    BIGINT PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    CHECK (price >= 0),
    CHECK (stock >= 0)
);
\`\`\`

> MySQL 8.0.16+ 才支持 CHECK，之前版本会被忽略。

## 7. 自增（AUTO_INCREMENT）

\`\`\`sql
CREATE TABLE t_order (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ...
);
\`\`\`

- 整型才支持
- 一张表只能有一个
- 删行后自增值**不重置**

### 分布式 ID（推荐用雪花算法）

\`\`\`sql
-- 用 BIGINT 存雪花 ID
id BIGINT NOT NULL
\`\`\`

> MyBatis-Plus 内置 \`IdType.ASSIGN_ID\`（雪花）。

## 8. 添加 / 删除约束

\`\`\`sql
-- 加唯一
ALTER TABLE t_user ADD UNIQUE KEY uk_email (email);

-- 删约束
ALTER TABLE t_user DROP INDEX uk_email;
ALTER TABLE t_user DROP PRIMARY KEY;
\`\`\`

## 9. 业务实战：商品表（带完整约束）

\`\`\`sql
CREATE TABLE t_product (
    id           BIGINT       NOT NULL                COMMENT '主键',
    tenant_id    BIGINT       NOT NULL DEFAULT 0      COMMENT '租户',
    category_id  BIGINT       NOT NULL DEFAULT 0      COMMENT '分类',
    name         VARCHAR(200) NOT NULL                COMMENT '商品名',
    code         VARCHAR(64)  NOT NULL                COMMENT '商品编码',
    price        DECIMAL(10,2) NOT NULL               COMMENT '售价',
    stock        INT          NOT NULL DEFAULT 0      COMMENT '库存',
    status       TINYINT      NOT NULL DEFAULT 1      COMMENT '1 上架 0 下架',
    description  TEXT                                  COMMENT '描述',
    deleted      TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_code (tenant_id, code),
    KEY idx_tenant_category (tenant_id, category_id),
    KEY idx_status (status),
    CHECK (price >= 0),
    CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
\`\`\`

## 10. 命名规范

| 类型 | 前缀 | 例子 |
| --- | --- | --- |
| 主键 | \`PRIMARY\` | \`PRIMARY KEY (id)\` |
| 唯一 | \`uk_\` | \`uk_email\` |
| 普通索引 | \`idx_\` | \`idx_user_id\` |
| 外键 | \`fk_\` | \`fk_user_id\` |

## 常见坑

- ❌ 字段没 NOT NULL + DEFAULT → 业务里一堆 NPE
- ❌ 主键用 UUID → 索引大、性能差；用 BIGINT 雪花
- ❌ 表没有主键 → InnoDB 会自动选 + 隐藏行
- ❌ 用了外键 + 级联 → 危险
- ❌ 唯一约束忘了联合 → 数据脏

## 配套 Demo

- \`backend/demo-02-springboot-crud/sql/init.sql\`
- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- 主键和唯一索引区别？
- 为什么不用外键？
- 自增主键用完怎么办？（雪花 / 段式 / UUID）
- \`AUTO_INCREMENT\` 在事务回滚后会回退吗？
- CHECK 约束什么时候支持的？
`,or=`# 05 · 数据类型与最佳实践
> 选错类型性能可能差 100 倍

## 是什么

MySQL 有三大类数据类型：
- **数值**
- **字符串**
- **时间**

选错类型会让：
- 存储浪费
- 索引失效
- 比较结果错误
- 性能骤降

## 1. 数值类型

| 类型 | 大小 | 范围 | 业务用途 |
| --- | --- | --- | --- |
| \`TINYINT\` | 1 字节 | -128 ~ 127 | 状态、布尔（0/1） |
| \`SMALLINT\` | 2 字节 | -32768 ~ 32767 | 枚举值 |
| \`INT\` | 4 字节 | ±21 亿 | 计数 |
| \`BIGINT\` | 8 字节 | ±9.2 × 10¹⁸ | **主键、外键** ✅ |
| \`DECIMAL(M,D)\` | 变长 | 精确小数 | **金额** ✅ |
| \`FLOAT\` | 4 字节 | 不精确 | 不用 |
| \`DOUBLE\` | 8 字节 | 不精确 | 不用 |

### 金额永远用 DECIMAL

\`\`\`sql
price DECIMAL(10,2)   -- 8 位整数 + 2 位小数，范围 -99999999.99 ~ 99999999.99
\`\`\`

> ❌ \`FLOAT/DOUBLE\` 会丢精度（IEEE 754），\`0.1 + 0.2 = 0.30000000000000004\`。

## 2. 字符串类型

| 类型 | 长度 | 业务用途 |
| --- | --- | --- |
| \`CHAR(N)\` | 固定 N | 固定长度（手机号、状态码） |
| \`VARCHAR(N)\` | 变长（最大 N） | 名称、描述 |
| \`TEXT\` | 最多 65535 字节 | 长文本 |
| \`MEDIUMTEXT\` | 16 MB | 文章 |
| \`LONGTEXT\` | 4 GB | 极少用 |
| \`BLOB\` | 二进制 | 图片 / 文件（**生产存 OSS**） |

### VARCHAR 长度计算

- \`VARCHAR(N)\` 中 N 是**字符数**（不是字节）
- 用 utf8mb4：1 字符最多 4 字节
- \`VARCHAR(255)\` = 最多 1020 字节
- **推荐**：按需设，**不要全部 255**

\`\`\`sql
username  VARCHAR(50)    -- 50 字符
name      VARCHAR(200)   -- 商品名
desc      VARCHAR(1000)  -- 简介
detail    TEXT            -- 详情
\`\`\`

## 3. 时间类型

| 类型 | 范围 | 存储 | 特点 |
| --- | --- | --- | --- |
| \`DATETIME\` | 1000-01-01 ~ 9999-12-31 | 5 字节 | **业务时间** ✅ |
| \`TIMESTAMP\` | 1970-01-01 ~ 2038-01-19 | 4 字节 | 受时区影响 |
| \`DATE\` | 1000-01-01 ~ 9999-12-31 | 3 字节 | 生日 |
| \`TIME\` | -838:59:59 ~ 838:59:59 | 3 字节 | 时长 |
| \`YEAR\` | 1901 ~ 2155 | 1 字节 | 年份 |

### 业务推荐

\`\`\`sql
create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
update_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
birthday     DATE
expire_at    DATETIME
\`\`\`

> **业务时间统一 \`DATETIME\`**；\`TIMESTAMP\` 受时区影响，容易踩坑。

## 4. JSON 类型（MySQL 5.7+）

\`\`\`sql
attrs JSON NOT NULL
\`\`\`

\`\`\`sql
INSERT INTO t_product (name, attrs) VALUES ('iPhone', '{"color":"black","storage":"256"}');

SELECT name, JSON_EXTRACT(attrs, '$.color') FROM t_product;
SELECT name, attrs->>'$.color' AS color FROM t_product;     -- 5.7+

-- 建索引
ALTER TABLE t_product ADD INDEX idx_color ((CAST(attrs->>'$.color' AS CHAR(20))));
\`\`\`

> JSON 字段**慎用**：难查询、难约束、索引有限。能拆成列就拆。

## 5. 枚举 ENUM / 集合 SET

\`\`\`sql
status ENUM('PENDING', 'PAID', 'SHIPPED', 'COMPLETED') NOT NULL
\`\`\`

> 优点：紧凑、只允许列表内值
> 缺点：加新值要 ALTER TABLE；**业务上推荐用 TINYINT + Java 端枚举**

## 6. 业务实战表（商城商品 SKU）

\`\`\`sql
CREATE TABLE t_product_sku (
    id           BIGINT        NOT NULL                COMMENT 'SKU 主键',
    tenant_id    BIGINT        NOT NULL                COMMENT '租户',
    spu_id       BIGINT        NOT NULL                COMMENT 'SPU 关联',
    sku_code     VARCHAR(64)   NOT NULL                COMMENT 'SKU 编码',
    name         VARCHAR(200)  NOT NULL                COMMENT 'SKU 名称',
    price        DECIMAL(10,2) NOT NULL                COMMENT '售价',
    cost_price   DECIMAL(10,2) NOT NULL DEFAULT 0      COMMENT '成本价',
    stock        INT           NOT NULL DEFAULT 0      COMMENT '库存',
    weight       INT           NOT NULL DEFAULT 0      COMMENT '克',
    spec         JSON                                   COMMENT '规格 {"颜色":"黑"}',
    status       TINYINT       NOT NULL DEFAULT 1      COMMENT '1 上架 0 下架',
    deleted      TINYINT       NOT NULL DEFAULT 0      COMMENT '逻辑删除',
    create_time  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_spu_code (tenant_id, spu_id, sku_code),
    KEY idx_tenant_spu (tenant_id, spu_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品 SKU 表';
\`\`\`

## 7. 选型决策树

\`\`\`
主键？           BIGINT AUTO_INCREMENT 或雪花
外键？           BIGINT
状态？           TINYINT（0/1/2...）+ Java 枚举
金额？           DECIMAL(10,2)
名称/标题？      VARCHAR(50~200)
简介？           VARCHAR(500~1000)
详情？           TEXT
长文？           MEDIUMTEXT
时间？           DATETIME DEFAULT CURRENT_TIMESTAMP
布尔？           TINYINT(1) 或 TINYINT
枚举？           TINYINT（业务首选）
可扩展属性？     JSON（谨慎使用）
\`\`\`

## 8. 坑与最佳实践

| 实践 | 原因 |
| --- | --- |
| 主键用 \`BIGINT\` 雪花 | 32 位 INT 高并发会爆 |
| 金额用 \`DECIMAL\` | 精度 |
| 不用 \`FLOAT/DOUBLE\` | 精度 |
| 时间用 \`DATETIME\` | 不受时区影响 |
| 不用 \`VARCHAR(255)\` 一把梭 | 浪费 + 索引效率 |
| 业务字段 \`NOT NULL DEFAULT\` | 避免 NPE |
| IP 用 \`INT UNSIGNED\`（\`INET_ATON\`） | 省 12 字节 |
| 手机号 \`VARCHAR(20)\` | 国际号不同长度 |
| 大文本用 \`TEXT\` 别放主表 | 影响 InnoDB 页 |

## 9. VARCHAR 长度与索引

- **MySQL 5.x**：\`VARCHAR\` 长度过长**会变 TEXT**，不能建普通索引
- **MySQL 8.0**：默认 \`innodb_large_prefix\`，可建索引
- 行最大 65535 字节（所有列总和）

> 单列 \`VARCHAR(N)\` 中 N 推荐 ≤ 200，超过用 \`TEXT\`。

## 10. 业务里"金额"实战

\`\`\`sql
-- 订单表
amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '订单金额'

-- 钱包
balance DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '余额'
\`\`\`

精度计算：
- 0.01 元精度 → 12 位整数 = 万亿级
- 一般业务 12 位整数足够

## 常见坑

- ❌ 金额用 \`FLOAT\` → 精度丢失
- ❌ 时间用 \`VARCHAR\` → 排序、范围查询都慢
- ❌ 状态用 \`VARCHAR\` → 浪费空间 + 易写错
- ❌ 主键用 \`INT AUTO_INCREMENT\` → 高并发会爆
- ❌ 大字段（TEXT）放主表 → 拖慢所有查询

## 配套 Demo

- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- \`DECIMAL\` 和 \`FLOAT\` 区别？
- \`DATETIME\` 和 \`TIMESTAMP\` 区别？
- 金额用什么类型？
- 状态字段用什么类型？
- \`VARCHAR\` 和 \`CHAR\` 区别？
`,cr=`# 06 · 索引原理与 EXPLAIN
> 数据库性能优化的核心

## 是什么

**索引（Index）** 是帮助 MySQL **高效获取数据**的**数据结构**（B+Tree）。类比书的目录。

> 面试必考：索引原理、聚簇索引、覆盖索引、索引失效。

## 1. 索引类型

| 类型 | 特点 |
| --- | --- |
| **主键索引** | 唯一 + 非空 + 聚簇 |
| **唯一索引** | 唯一 + 可多个 NULL |
| **普通索引** | 无限制 |
| **联合索引** | 多列组合 |
| **全文索引** | \`FULLTEXT\`，文本搜索 |
| **前缀索引** | 长字符串前 N 字符 |

## 2. 索引数据结构（B+Tree）

\`\`\`
                [50]
               /    \\
          [20,30]    [70,80]
          /  |  \\    /  |  \\
       [10][25][35][60][75][90]
       数据行数据行 数据行 ...
\`\`\`

特点：
- **多路平衡树**（不是二叉树）
- **叶子节点连起来**（范围查询快）
- 非叶子节点只存 key，**叶子节点存数据**（聚簇索引）或主键（非聚簇）

## 3. 聚簇索引 vs 非聚簇

**InnoDB**（必用引擎）：

| 维度 | 聚簇索引 | 非聚簇 |
| --- | --- | --- |
| 数量 | **1 个**（主键） | 多个 |
| 叶子节点 | 存**完整行数据** | 存**主键 + 索引列** |
| 查主键 | 极快 | - |
| 查其他 | 回表 | 走索引 → 回表 |

> **MyISAM 全部都是非聚簇**（叶子存的是数据行地址）。**InnoDB 默认用主键做聚簇**。

## 4. 创建索引

\`\`\`sql
-- 普通索引
CREATE INDEX idx_user_id ON t_order(user_id);

-- 唯一索引
CREATE UNIQUE INDEX uk_order_no ON t_order(order_no);

-- 联合索引
CREATE INDEX idx_tenant_status ON t_product(tenant_id, status, create_time);

-- 建表时一起
CREATE TABLE t_product (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200),
    price DECIMAL(10,2),
    KEY idx_name (name),
    KEY idx_price (price)
);

-- 删除
DROP INDEX idx_user_id ON t_order;

-- 查看
SHOW INDEX FROM t_order;
\`\`\`

## 5. 联合索引（最常用，最易错）

\`\`\`sql
KEY idx_a_b_c (a, b, c)
\`\`\`

**最左前缀原则**：必须从最左列开始

| WHERE | 用到索引？ |
| --- | --- |
| \`WHERE a = 1\` | ✅ |
| \`WHERE a = 1 AND b = 2\` | ✅ |
| \`WHERE a = 1 AND b = 2 AND c = 3\` | ✅ |
| \`WHERE b = 2\` | ❌ |
| \`WHERE a = 1 AND c = 3\` | ✅ a 部分，c 失效 |
| \`WHERE a = 1 AND b > 2 AND c = 3\` | ✅ a,b 范围，c 失效 |

> **业务建议**：把区分度高的放最左，范围 / 排序放最后。

## 6. EXPLAIN（SQL 性能分析工具）

\`\`\`sql
EXPLAIN SELECT * FROM t_product WHERE tenant_id = 1 AND status = 1;
\`\`\`

返回关键列：

| 列 | 含义 |
| --- | --- |
| \`id\` | 序号 |
| \`select_type\` | SIMPLE / PRIMARY / SUBQUERY |
| \`table\` | 表 |
| \`type\` | **访问类型**（重要） |
| \`possible_keys\` | 可能用到的索引 |
| \`key\` | **实际用到的索引** |
| \`key_len\` | 索引长度 |
| \`rows\` | 扫描行数（预估） |
| \`Extra\` | 额外信息（重要） |

### type 从优到差

\`\`\`
system > const > eq_ref > ref > range > index > ALL
                                        ↑       ↑
                                       索引扫  全表扫
\`\`\`

| type | 含义 | 性能 |
| --- | --- | --- |
| \`const\` | 主键 / 唯一索引等值 | ⚡⚡⚡ |
| \`eq_ref\` | 唯一索引 JOIN | ⚡⚡⚡ |
| \`ref\` | 非唯一索引 | ⚡⚡ |
| \`range\` | 范围 | ⚡ |
| \`index\` | 全索引扫 | 慢 |
| \`ALL\` | 全表扫 | **最差** |

> 业务 SQL 至少要 **\`ref\` 以上**，出现 \`ALL\` 就要优化。

## 7. EXPLAIN 实战

\`\`\`sql
EXPLAIN SELECT * FROM t_order WHERE user_id = 100;
\`\`\`

\`\`\`
id  select_type  table  type  key         rows  Extra
1   SIMPLE       t_order ref   idx_user_id  50
\`\`\`

OK，走了索引。

\`\`\`sql
EXPLAIN SELECT * FROM t_order WHERE YEAR(create_time) = 2026;
\`\`\`

\`\`\`
type: ALL     -- 全表扫
\`\`\`

❌ 函数运算导致索引失效。

## 8. 索引失效的常见场景

\`\`\`sql
-- 1. 函数 / 表达式
WHERE DATE(create_time) = '2026-01-01'         -- ❌
WHERE create_time >= '2026-01-01' AND create_time < '2026-01-02'  -- ✅

-- 2. 隐式类型转换
WHERE phone = 13800000000        -- ❌ phone 是 varchar
WHERE phone = '13800000000'      -- ✅

-- 3. 前导模糊
WHERE name LIKE '%iPhone%'        -- ❌
WHERE name LIKE 'iPhone%'         -- ✅

-- 4. OR 条件
WHERE a = 1 OR b = 2              -- ❌（除非 a,b 都有索引）

-- 5. 不等号
WHERE status != 1                  -- ❌
WHERE status IN (0, 2)             -- ✅

-- 6. IS NULL
WHERE name IS NULL                 -- MySQL 8 优化了
\`\`\`

## 9. 覆盖索引（避免回表）

\`\`\`sql
-- 联合索引
KEY idx_tenant_status_name (tenant_id, status, name)

-- 查询
SELECT name FROM t_product WHERE tenant_id = 1 AND status = 1;
\`\`\`

> 索引里就包含 \`name\`，**不用回表** → 叫**覆盖索引（Using index）**。

## 10. 索引下推（ICP，MySQL 5.6+）

\`\`\`sql
KEY idx_tenant_status (tenant_id, status)

SELECT * FROM t_product
WHERE tenant_id = 1 AND status LIKE '%abc%';  -- LIKE 后面 % 在前不能走索引
\`\`\`

> 5.6+ 会把 status 条件**下推到存储引擎层**，减少回表行数。

## 11. 索引设计原则

| 原则 | 原因 |
| --- | --- |
| 表必须有主键 | InnoDB 聚簇要求 |
| 高频查询字段建索引 | 加速 |
| 区分度低的字段不建（如 status） | 索引效果差 |
| 联合索引最左列放区分度高的 | 过滤强 |
| 频繁更新的字段少建索引 | 维护成本 |
| 写多读少的表少建索引 | 写入慢 |
| 不在低基数列建索引 | \`sex\` (男/女) 没意义 |
| 短字段建索引（如 INT） | 索引小、快 |

## 12. 真实优化案例

### 案例 1：慢 SQL 排查

\`\`\`sql
-- 慢 SQL
SELECT * FROM t_order
WHERE user_id = 100
  AND status IN (1, 2, 3)
  AND create_time > '2026-01-01'
ORDER BY id DESC
LIMIT 20;
\`\`\`

> 索引：\`KEY idx_user_status_time (user_id, status, create_time, id)\`

### 案例 2：分页慢

\`\`\`sql
-- ❌ 慢
SELECT * FROM t_order ORDER BY id DESC LIMIT 100000, 20;

-- ✅ 游标分页
SELECT * FROM t_order WHERE id < 上一页最后ID ORDER BY id DESC LIMIT 20;
\`\`\`

## 13. 索引监控

\`\`\`sql
-- 查看索引使用情况
SELECT * FROM sys.schema_index_statistics;

-- 查看冗余索引
SELECT * FROM sys.schema_redundant_indexes;

-- 慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 1 秒
\`\`\`

## 14. 常见坑

- ❌ 索引越多越好 → 写慢、占空间
- ❌ 小表建索引 → 全表扫更快
- ❌ 字段值基数小（如状态 0/1）建索引 → 没意义
- ❌ 没 EXPLAIN 习惯 → 不知道用没用上
- ❌ 索引列做函数 → 失效
- ❌ \`LIKE '%xxx%'\` 开头 → 失效

## 配套 Demo

- \`backend/demo-02-springboot-crud/sql/init.sql\`（含合理索引）
- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问（必考）

- B+Tree 和 B-Tree 区别？
- 聚簇索引和非聚簇索引区别？
- 最左前缀原则？
- 索引下推是什么？
- 覆盖索引是什么？
- 索引失效的场景？
- 怎么分析慢 SQL？
`,sr=`# 07 · 事务与隔离级别
> 银行转账不能少 1 分钱

## 是什么

**事务（Transaction）** 是一组 SQL，**要么全成功，要么全失败**。

ACID：

| 特性 | 含义 |
| --- | --- |
| **A**tomicity 原子性 | 不可分割 |
| **C**onsistency 一致性 | 数据从一致到一致 |
| **I**solation 隔离性 | 并发事务互不干扰 |
| **D**urability 持久性 | 提交后永久 |

> 业务里**任何写操作**都该在事务里。

## 1. 事务语法

\`\`\`sql
-- 显式开启
START TRANSACTION;

UPDATE t_account SET balance = balance - 100 WHERE id = 1;
UPDATE t_account SET balance = balance + 100 WHERE id = 2;

-- 提交 / 回滚
COMMIT;
ROLLBACK;
\`\`\`

> MySQL 默认**自动提交**：\`SET autocommit = 1;\` 每条 SQL 一个事务。

## 2. Spring 事务

\`\`\`java
@Transactional(rollbackFor = Exception.class)
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    accountMapper.deduct(fromId, amount);
    accountMapper.add(toId, amount);
}
\`\`\`

要点：
- 加在 **Service 方法**（不是 Controller / Mapper）
- \`rollbackFor = Exception.class\`（默认只回滚 RuntimeException）
- 自调用失效（同类 a() 调 b()，b 的事务不生效）
- 异常被 catch 吞掉 → 事务不生效

## 3. 四大隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
| --- | --- | --- | --- | --- |
| READ UNCOMMITTED | ✅ | ✅ | ✅ | ⚡⚡⚡ |
| READ COMMITTED | ❌ | ✅ | ✅ | ⚡⚡ |
| REPEATABLE READ（**MySQL 默认**） | ❌ | ❌ | ✅ | ⚡ |
| SERIALIZABLE | ❌ | ❌ | ❌ | ⚡ |

> MySQL InnoDB 在 RR 级别下用 **MVCC + 间隙锁**，能避免大部分幻读。

### 设置

\`\`\`sql
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

查看：

\`\`\`sql
SELECT @@global.transaction_isolation;
SELECT @@session.transaction_isolation;
\`\`\`

## 4. 并发问题详解

### 脏读（Dirty Read）

读到**别的事务未提交**的数据。

### 不可重复读（Non-repeatable Read）

同一事务两次读，**值不同**（被别的事务 update / delete 改了）。

### 幻读（Phantom Read）

同一事务两次查，**行数不同**（被别的事务 insert 了）。

## 5. MVCC（多版本并发控制）

InnoDB 用 MVCC 解决大部分并发问题：

- 每行记录有**隐藏列**：\`DB_TRX_ID\`（事务 ID）、\`DB_ROLL_PTR\`（回滚指针）
- 读有**快照读**（普通 SELECT）和**当前读**（\`SELECT ... FOR UPDATE\`）
- RR 级别下，事务开始时建快照，整个事务看到**一致的数据版本**

\`\`\`sql
-- 当前读（不走 MVCC，会加锁）
SELECT * FROM t_account WHERE id = 1 FOR UPDATE;
\`\`\`

## 6. 事务传播行为（Spring 重点）

\`\`\`java
@Transactional(propagation = Propagation.REQUIRED)  // 默认：加入 / 新建
@Transactional(propagation = Propagation.REQUIRES_NEW)  // 总是新事务
@Transactional(propagation = Propagation.NESTED)  // 嵌套事务
@Transactional(propagation = Propagation.MANDATORY)  // 必须有事务
@Transactional(propagation = Propagation.SUPPORTS)  // 有就用，没有就不用
@Transactional(propagation = Propagation.NOT_SUPPORTED)  // 不用事务
@Transactional(propagation = Propagation.NEVER)  // 不能有事务
\`\`\`

### 业务示例

\`\`\`java
// 主事务方法
@Transactional
public void createOrder(OrderCreateReq req) {
    orderMapper.insert(order);
    // 嵌套事务：失败不影响主事务的回滚
    couponService.use(req.getCouponId());  // REQUIRES_NEW
}
\`\`\`

## 7. 死锁（Deadlock）

两个事务互相等对方释放锁。

\`\`\`sql
-- 事务 A
UPDATE t_a SET ... WHERE id = 1;  -- 锁 id=1
UPDATE t_b SET ... WHERE id = 1;  -- 等 B 释放 id=1

-- 事务 B
UPDATE t_b SET ... WHERE id = 1;  -- 锁 id=1
UPDATE t_a SET ... WHERE id = 1;  -- 等 A 释放 id=1
\`\`\`

### 排查

\`\`\`sql
SHOW ENGINE INNODB STATUS\\G
\`\`\`

看 \`LATEST DETECTED DEADLOCK\` 段落。

### 解决

1. **统一加锁顺序**：按 ID 升序
2. **短事务**：减少持有锁时间
3. **合适隔离级别**：不要 SERIALIZABLE
4. **设置锁超时**：
   \`\`\`sql
   SET innodb_lock_wait_timeout = 5;
   \`\`\`
5. **重试机制**：捕获 \`DeadlockLoserDataAccessException\` 后重试

## 8. 实战：转账

\`\`\`java
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountMapper accountMapper;

    @Transactional(rollbackFor = Exception.class)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // 1. 校验余额
        AccountDO from = accountMapper.selectById(fromId);
        if (from.getBalance().compareTo(amount) < 0) {
            throw new BizException(ResultCode.BALANCE_NOT_ENOUGH);
        }
        // 2. 扣减
        int rows = accountMapper.deductBalance(fromId, amount);
        if (rows == 0) {
            throw new BizException(ResultCode.ACCOUNT_NOT_FOUND);
        }
        // 3. 增加
        accountMapper.addBalance(toId, amount);
    }
}
\`\`\`

## 9. 业务级事务

\`\`\`java
// 1. 订单创建
@Transactional
public Long createOrder(OrderCreateReq req) {
    // 订单主表
    orderMapper.insert(order);
    // 订单项
    orderItemMapper.insertBatch(items);
    // 扣库存
    stockService.reduce(items);   // 嵌套 / 同一事务
    // 扣积分
    pointService.deduct(userId, ...);
    return order.getId();
}
\`\`\`

> 全部在**一个事务**里，**任何一步失败全部回滚**。

## 10. 分布式事务（简介）

跨服务、跨库的事务：

| 方案 | 思路 |
| --- | --- |
| 2PC / 3PC | 强一致、慢 |
| TCC | Try / Confirm / Cancel |
| 本地消息表 | 最终一致 ✅ |
| RocketMQ 事务消息 | 最终一致 ✅ |
| Saga | 长事务拆分 |

> 本工程 demo-04 演示**本地消息表**方案。

## 常见坑

- ❌ 事务里调 HTTP / RPC → 慢、可能超时
- ❌ 自调用 → 事务失效
- ❌ \`try-catch\` 吞掉异常 → 事务不回滚
- ❌ \`rollbackFor\` 没设 → Checked 异常不回滚
- ❌ 大事务（10w 行 UPDATE）→ 锁等待、阻塞
- ❌ \`@Transactional\` 加在 Controller → 别人 new service 调不到

## 配套 Demo

- \`backend/demo-02-springboot-crud/service/ProductServiceImpl.java\`
- \`backend/demo-04-multitenant-mall/service/OrderServiceImpl.java\`

## 面试常见追问（必考）

- 事务 ACID 是什么？
- 四个隔离级别？MySQL 默认哪个？
- 什么是脏读 / 不可重复读 / 幻读？
- MVCC 原理？
- Spring \`@Transactional\` 失效场景？
- 事务传播行为有哪些？
- 死锁怎么排查？
`,lr=`# 08 · 锁与死锁排查
> 高并发下保证数据正确

## 是什么

MySQL **InnoDB** 提供多种**锁**用于并发控制。理解锁机制是排查生产问题的必备技能。

## 1. 锁的分类

| 维度 | 类型 |
| --- | --- |
| 锁粒度 | 行锁 / 表锁 / 间隙锁 |
| 锁模式 | 共享锁（S）/ 排他锁（X） |
| 锁思想 | 悲观锁 / 乐观锁 |
| 锁算法 | 记录锁 / 间隙锁 / Next-Key Lock |

## 2. 行锁 vs 表锁

| 维度 | 行锁 | 表锁 |
| --- | --- | --- |
| 粒度 | 单行 | 整表 |
| 并发 | 高 | 低 |
| 引擎 | **InnoDB** | MyISAM / 手动 LOCK TABLES |
| 业务 | 主流 | 备份、DDL |

> **InnoDB 默认行锁**，是企业首选。

## 3. 共享锁（S）与排他锁（X）

\`\`\`sql
-- 共享锁：读锁，多个事务可同时持有
SELECT * FROM t_product WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁：写锁，独占
SELECT * FROM t_product WHERE id = 1 FOR UPDATE;

-- UPDATE / DELETE 隐式加 X 锁
UPDATE t_product SET stock = stock - 1 WHERE id = 1;
\`\`\`

> 事务提交或回滚后锁释放。

## 4. 间隙锁（Gap Lock）

**InnoDB 在 RR 隔离级别**下用**间隙锁**防止幻读：

\`\`\`sql
-- 假设 id 已有 1, 5, 10
-- 事务 A
SELECT * FROM t_product WHERE id BETWEEN 5 AND 10 FOR UPDATE;
-- 锁住 [5,10] 区间，其他事务不能 insert id=6,7,8,9
\`\`\`

> RR 隔离 + 范围查询 → 自动加 Next-Key Lock（行 + 间隙）。

## 5. 当前读 vs 快照读

| 类型 | SQL | 实现 |
| --- | --- | --- |
| 快照读 | \`SELECT\` | MVCC，无锁 |
| 当前读 | \`SELECT ... FOR UPDATE\` / \`UPDATE\` / \`DELETE\` | 加锁 |

\`\`\`sql
-- 快照读（不锁）
SELECT * FROM t_product WHERE id = 1;

-- 当前读（X 锁）
SELECT * FROM t_product WHERE id = 1 FOR UPDATE;
\`\`\`

## 6. 死锁（Deadlock）

两个事务互相等对方的锁。

### 死锁日志

\`\`\`sql
SHOW ENGINE INNODB STATUS\\G
\`\`\`

看 \`LATEST DETECTED DEADLOCK\` 段：

\`\`\`
LATEST DETECTED DEADLOCK
------------------------
*** (1) TRANSACTION:
TRANSACTION 1234, ACTIVE 5 sec
LOCK WAIT 5 lock struct(s), heap size 1136, 2 row lock(s)
MySQL thread id 1, OS thread handle 1234, query id 100
UPDATE t_account SET balance = balance - 100 WHERE id = 1
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 10 page no 4 n bits 72 index PRIMARY of table \`mall\`.\`t_account\`
trx id 1234 lock_mode X locks gap before rec insert intention waiting
*** (2) TRANSACTION:
...
*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
...
*** WE ROLL BACK TRANSACTION (2)
\`\`\`

> InnoDB 自动检测死锁，**回滚代价小的事务**。

## 7. 死锁排查步骤

1. 抓死锁日志：\`SHOW ENGINE INNODB STATUS\\G\`
2. 看 \`SHOW PROCESSLIST\`：阻塞中的事务
3. \`information_schema.innodb_trx\`：所有活跃事务
4. \`information_schema.innodb_locks\`：锁等待关系
5. \`information_schema.innodb_lock_waits\`：等待图

\`\`\`sql
-- 当前活跃事务
SELECT * FROM information_schema.innodb_trx;

-- 锁等待
SELECT * FROM information_schema.innodb_lock_waits;
\`\`\`

## 8. 死锁预防

### (1) 统一加锁顺序

\`\`\`java
// ❌ A 锁 1 再锁 2；B 锁 2 再锁 1
// ✅ 都按 id 升序
for (Long id : ids.stream().sorted().toList()) {
    accountMapper.lockById(id);
}
\`\`\`

### (2) 短事务

- 事务内不做 HTTP / RPC
- 事务内不 \`Thread.sleep\`
- 事务内不做大批量操作

### (3) 合理使用索引

\`\`\`sql
-- ❌ 全表扫 → 锁很多行
UPDATE t_account SET balance = 0 WHERE name = 'A';

-- ✅ 用主键/索引 → 锁少量行
UPDATE t_account SET balance = 0 WHERE id = 100;
\`\`\`

### (4) 锁粒度

\`\`\`sql
-- 锁整表
SELECT * FROM t_account FOR UPDATE;
-- 锁一行
SELECT * FROM t_account WHERE id = 1 FOR UPDATE;
\`\`\`

### (5) 设置锁超时

\`\`\`sql
SET innodb_lock_wait_timeout = 5;  -- 5 秒超时
\`\`\`

Java：

\`\`\`yaml
spring:
  datasource:
    hikari:
      connection-timeout: 5000
\`\`\`

### (6) 重试机制

\`\`\`java
@Retryable(
    value = DeadlockLoserDataAccessException.class,
    maxAttempts = 3,
    backoff = @Backoff(delay = 100, multiplier = 2)
)
@Transactional
public void transfer(...) { ... }
\`\`\`

## 9. 乐观锁 vs 悲观锁

### 悲观锁（先锁后改）

\`\`\`java
// SQL: SELECT ... FOR UPDATE
public void pessimisticDeduct(Long productId, int qty) {
    ProductDO p = mapper.selectForUpdate(productId);
    if (p.getStock() < qty) throw new BizException(STOCK_NOT_ENOUGH);
    p.setStock(p.getStock() - qty);
    mapper.updateById(p);
}
\`\`\`

### 乐观锁（先改后校验）

\`\`\`sql
-- 加 version 列
ALTER TABLE t_product ADD COLUMN version INT NOT NULL DEFAULT 0;
\`\`\`

\`\`\`java
@Version
private Integer version;
\`\`\`

\`\`\`sql
-- 实际 SQL
UPDATE t_product
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;
\`\`\`

\`\`\`java
public void optimisticDeduct(Long productId, int qty) {
    int rows = mapper.deduct(productId, qty, currentVersion);
    if (rows == 0) {
        throw new BizException(STOCK_VERSION_CONFLICT);  // 重试
    }
}
\`\`\`

| 维度 | 悲观锁 | 乐观锁 |
| --- | --- | --- |
| 假设 | 一定冲突 | 一般不冲突 |
| 实现 | \`FOR UPDATE\` | version 字段 |
| 性能 | 低 | 高 |
| 适用 | 强一致（金融） | 读多写少（库存） |

## 10. 业务实战：扣库存

\`\`\`java
// 方案 1：乐观锁 + 重试
@Retryable(value = OptimisticLockingFailureException.class, maxAttempts = 3)
public void deductStock(Long productId, int qty) {
    ProductDO p = mapper.selectById(productId);
    if (p.getStock() < qty) throw new BizException(STOCK_NOT_ENOUGH);
    int rows = mapper.deductWithVersion(productId, qty, p.getVersion());
    if (rows == 0) {
        throw new OptimisticLockingFailureException("version conflict");
    }
}
\`\`\`

\`\`\`java
// 方案 2：Redis 预扣 + 异步落库（秒杀）
RLock lock = redisson.getLock("stock:" + productId);
if (lock.tryLock(1, 5, TimeUnit.SECONDS)) {
    try {
        Long stock = redisStockService.decr(productId);
        if (stock < 0) {
            redisStockService.incr(productId);
            throw new BizException(SECKILL_SOLD_OUT);
        }
        // 异步落库
        kafkaTemplate.send("stock-deduct", new StockMessage(productId, qty));
    } finally {
        lock.unlock();
    }
}
\`\`\`

## 11. 监控与告警

\`\`\`sql
-- 查锁等待
SELECT
  r.trx_id AS waiting_trx,
  r.lock_table AS waiting_table,
  b.trx_id AS blocking_trx,
  b.lock_table AS blocking_table
FROM information_schema.innodb_lock_waits w
JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
\`\`\`

Grafana 监控：\`mysql_innodb_row_lock_waits\`、\`mysql_innodb_deadlocks\`。

## 12. 排查流程

\`\`\`
1. 业务反馈：操作卡住 / 超时
2. 查慢 SQL 日志：show processlist
3. 查死锁：show engine innodb status
4. 查锁等待：information_schema.innodb_lock_waits
5. 看 SQL：EXPLAIN
6. 加索引 / 调事务 / 加重试
\`\`\`

## 常见坑

- ❌ 事务里循环更新 → 长事务、锁升级
- ❌ 没建索引 → 锁很多行（**间隙锁范围大**）
- ❌ 加锁顺序不一致 → 死锁
- ❌ 高并发热点行 → 用乐观锁 / 分布式锁
- ❌ 锁等待没超时 → 业务挂死

## 配套 Demo

- \`backend/demo-04-multitenant-mall/service/StockService.java\`

## 面试常见追问

- 行锁和表锁区别？
- 共享锁和排他锁？
- 什么是间隙锁？
- 死锁怎么排查？
- 乐观锁和悲观锁区别？
- RR 隔离级别能完全避免幻读吗？
`,dr=`# 09 · SQL 性能优化套路
> 慢 SQL 排查与优化方法论

## 是什么

SQL 性能优化是后端工程师的"硬功夫"。本节总结**实战套路**，遇到慢 SQL 知道从哪儿下手。

## 1. 优化总览

\`\`\`
发现 → 抓取 → 分析 → 优化 → 验证
\`\`\`

| 步骤 | 工具 |
| --- | --- |
| 1. 发现 | 慢查询日志 / 监控 / 用户反馈 |
| 2. 抓取 | 慢查询日志 + 业务 traceId |
| 3. 分析 | EXPLAIN / PROFILING |
| 4. 优化 | 索引 / SQL / 架构 |
| 5. 验证 | 压测 + EXPLAIN 对比 |

## 2. 慢查询日志

### 开启

\`\`\`sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;   -- 1 秒
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 文件位置
SHOW VARIABLES LIKE 'slow_query_log_file';
\`\`\`

### 持久化（my.cnf）

\`\`\`ini
[mysqld]
slow_query_log = 1
long_query_time = 1
log_queries_not_using_indexes = 1
slow_query_log_file = /var/log/mysql/slow.log
\`\`\`

### 分析

\`\`\`bash
# 查最慢的 10 条
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 看特定 SQL 出现频率
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log
\`\`\`

## 3. EXPLAIN（核心工具）

\`\`\`sql
EXPLAIN SELECT * FROM t_order WHERE user_id = 100 AND status = 1;
\`\`\`

### 关注列

| 列 | 关注什么 |
| --- | --- |
| \`type\` | 是否 \`ALL\`（全表扫） |
| \`key\` | 是否用了索引 |
| \`rows\` | 扫描行数（越大越差） |
| \`Extra\` | \`Using filesort\` / \`Using temporary\` / \`Using index\` |

### 关键 Extra

| 值 | 含义 | 优化 |
| --- | --- | --- |
| \`Using filesort\` | 额外排序 | 索引覆盖 ORDER BY |
| \`Using temporary\` | 临时表 | 优化 GROUP BY |
| \`Using index\` | 覆盖索引 | ✅ 好 |
| \`Using where\` | 回表 + WHERE | 正常 |
| \`Using join buffer\` | JOIN buffer | 加索引 |

## 4. 索引优化

### 黄金法则

\`\`\`sql
-- 1. 区分度高的放最左
-- 2. 范围 / 排序放最后
-- 3. 覆盖 SELECT 字段
-- 4. 不在低基数列建
\`\`\`

### 案例

\`\`\`sql
-- 订单查询常见
SELECT * FROM t_order
WHERE user_id = ? AND status IN (1,2,3) AND create_time > '2026-01-01'
ORDER BY id DESC
LIMIT 20;

-- 最佳索引
KEY idx_user_status_time_id (user_id, status, create_time, id)
\`\`\`

> 走覆盖索引 + 避免 filesort + 减少回表。

## 5. SQL 改写套路

### (1) 避免 SELECT *

\`\`\`sql
-- ❌
SELECT * FROM t_product WHERE id = 1;

-- ✅
SELECT id, name, price FROM t_product WHERE id = 1;
\`\`\`

### (2) 避免在 WHERE 上用函数

\`\`\`sql
-- ❌
WHERE DATE(create_time) = '2026-01-01';

-- ✅
WHERE create_time >= '2026-01-01' AND create_time < '2026-01-02';
\`\`\`

### (3) OR 改 UNION

\`\`\`sql
-- ❌
WHERE a = 1 OR b = 2;

-- ✅
WHERE a = 1
UNION ALL
WHERE b = 2;
\`\`\`

### (4) 大 IN 拆批

\`\`\`sql
-- ❌ WHERE id IN (1,2,3,...,10000);
-- ✅ 拆成 500 一批
\`\`\`

### (5) LIMIT 大偏移

\`\`\`sql
-- ❌ LIMIT 100000, 20
-- ✅ 游标分页
WHERE id < lastId ORDER BY id DESC LIMIT 20;
\`\`\`

### (6) 批量插入

\`\`\`sql
-- ✅
INSERT INTO t_product (name, price) VALUES
('A', 1), ('B', 2), ('C', 3);
\`\`\`

### (7) 删 OR 改逻辑删除

\`\`\`sql
-- 物理删除 1 亿行 → 锁长、binlog 大
-- 改 UPDATE ... SET deleted = 1
\`\`\`

## 6. JOIN 优化

\`\`\`sql
-- 驱动表（小表在前）
SELECT *
FROM t_order o
JOIN t_user u ON o.user_id = u.id
WHERE o.tenant_id = 1;

-- 保证 JOIN 字段有索引
KEY idx_user_id (user_id) ON t_order;

-- 避免 3 张表以上的复杂 JOIN（拆应用层）
\`\`\`

## 7. 子查询改 JOIN

\`\`\`sql
-- ❌
SELECT * FROM t_product
WHERE id IN (SELECT product_id FROM t_order_item WHERE qty > 100);

-- ✅
SELECT DISTINCT p.*
FROM t_product p
JOIN t_order_item oi ON p.id = oi.product_id
WHERE oi.qty > 100;
\`\`\`

> MySQL 5.6+ 优化了部分子查询，但**JOIN 仍然更可控**。

## 8. ORDER BY 优化

\`\`\`sql
-- 索引覆盖 ORDER BY（最左前缀）
KEY idx_status_create (status, create_time)

-- ✅ 走索引排序
SELECT * FROM t_order WHERE status = 1 ORDER BY create_time DESC;
\`\`\`

> 8.0+ 支持降序索引：\`KEY idx (status ASC, create_time DESC)\`。

## 9. GROUP BY 优化

\`\`\`sql
-- ❌ Using temporary
SELECT user_id, COUNT(*) FROM t_order GROUP BY user_id;

-- ✅ 走索引
KEY idx_user_status (user_id, status)

-- 大数据 GROUP BY
SELECT user_id, COUNT(*) FROM t_order GROUP BY user_id;  -- 1M 行慢
-- → 用 SQL_BIG_RESULT 提示
SELECT SQL_BIG_RESULT user_id, COUNT(*) FROM t_order GROUP BY user_id;
\`\`\`

## 10. 架构层优化

### 读写分离

\`\`\`
主库（写） ──┐
            ├── 同步 ── 从库（读）
            └── 从库 2（读）
\`\`\`

应用层：
- MyBatis-Plus Dynamic-Datasource
- Sharding-JDBC

### 分库分表

| 策略 | 场景 |
| --- | --- |
| 水平分表 | 单表 > 500w 行 |
| 水平分库 | 写并发瓶颈 |
| 垂直分表 | 大字段 / 冷热数据分离 |
| 垂直分库 | 微服务化 |

### 缓存前置

\`\`\`
业务 → Redis (99%) → DB (1%)
\`\`\`

> 缓存设计见 14-redis。

## 11. 配置优化

\`\`\`ini
# my.cnf
innodb_buffer_pool_size = 4G        # 缓冲池（最重要）
innodb_log_file_size = 1G
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2
sync_binlog = 1000
max_connections = 1000
\`\`\`

> \`innodb_buffer_pool_size\` 通常设为物理内存 **60%~80%**。

## 12. 监控指标

| 指标 | 监控 |
| --- | --- |
| QPS / TPS | \`SHOW GLOBAL STATUS LIKE 'Queries'\` |
| 慢查询数 | \`Slow_queries\` |
| 锁等待 | \`Innodb_row_lock_waits\` |
| 缓冲池命中率 | \`Innodb_buffer_pool_read_requests\` / \`Innodb_buffer_pool_reads\` |
| 死锁 | \`Innodb_deadlocks\` |

> 推荐 **Prometheus + mysqld_exporter + Grafana**。

## 13. 排查实战模板

\`\`\`sql
-- 1. 看慢查询
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS\\G;

-- 2. EXPLAIN
EXPLAIN SELECT ...;

-- 3. 看索引
SHOW INDEX FROM t_order;

-- 4. 看统计
ANALYZE TABLE t_order;

-- 5. 优化
ALTER TABLE t_order ADD INDEX idx_xxx (col);
-- 改写 SQL
-- 加缓存
\`\`\`

## 14. 业务经验

| 问题 | 解法 |
| --- | --- |
| COUNT 慢 | 估算 / 缓存 / 数仓 |
| 深分页 | 游标分页 |
| 模糊搜索 | Elasticsearch |
| 实时排行 | Redis SortedSet |
| 大量写 | 队列削峰 + 批量写 |
| 慢 SQL 难定位 | 开慢日志 + traceId |

## 常见坑

- ❌ 没看 EXPLAIN 就改索引
- ❌ 加了索引不 ANALYZE TABLE
- ❌ 物理删除大批量数据
- ❌ 不区分 OLTP / OLAP
- ❌ 把 MySQL 当 ES 用（全文模糊）

## 配套 Demo

- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- 慢 SQL 怎么排查？
- EXPLAIN 重点看哪些列？
- 索引设计原则？
- 大表分页怎么优化？
- 缓冲池命中率多少算正常？
`,pr=`# 10 · 多租户数据隔离
> SaaS 商城：数据严格按租户分开

## 是什么

多租户数据隔离是 SaaS 系统的**核心设计**。本节从**数据库层**讲三种方案和选型。

> 业务上配合 \`16-multitenant\`（Java 应用层）一起看。

## 1. 三种方案回顾

| 方案 | 描述 | 隔离强度 | 成本 |
| --- | --- | --- | --- |
| 独立数据库 | 一租户一库 | 强 🔥🔥🔥 | 高 |
| 共享 DB，独立 Schema | 一租户一 schema | 中 🔥🔥 | 中 |
| 共享 DB，共享 Schema | 字段 \`tenant_id\` | 弱 🔥 | 低 |

## 2. 独立数据库（最强）

\`\`\`sql
-- 租户 1
CREATE DATABASE mall_tenant_1;
USE mall_tenant_1;
CREATE TABLE t_order (...);

-- 租户 2
CREATE DATABASE mall_tenant_2;
USE mall_tenant_2;
CREATE TABLE t_order (...);
\`\`\`

### 路由

\`\`\`java
// 按租户动态切换数据源
public class TenantDataSourceRouter extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.get();
    }
}
\`\`\`

### 优缺点

- ✅ 物理隔离，可单独备份 / 恢复 / 迁移
- ✅ 大客户定制容易
- ❌ DB 多，运维成本高
- ❌ 跨租户统计难

> 适合**大客户 / 金融 / 高合规**场景。

## 3. 共享 DB，字段方案（最常用）

每张业务表加 \`tenant_id\`：

\`\`\`sql
CREATE TABLE t_product (
    id          BIGINT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL,
    name        VARCHAR(200),
    price       DECIMAL(10,2),
    KEY idx_tenant (tenant_id)
);
\`\`\`

### 必备索引

\`\`\`sql
-- 联合索引 (tenant_id, ...) 让所有查询都走 tenant_id 前缀
KEY idx_tenant_status (tenant_id, status)
KEY idx_tenant_create (tenant_id, create_time)
\`\`\`

### 应用层自动拼接

\`\`\`java
// 见 16-multitenant 的 MyBatis-Plus 拦截器
// 实际执行
SELECT * FROM t_product WHERE id = 1 AND tenant_id = 1;
\`\`\`

### 优缺点

- ✅ 成本最低（一个 DB）
- ✅ 弹性扩缩容
- ❌ 应用层**必须**保证
- ❌ 一条错误 SQL 暴露数据 → 严防

> 适合**大量中小租户**（电商 SaaS、在线教育）。

## 4. 中间方案：分库 + 字段

\`\`\`sql
-- 大租户独立库
mall_db_tenant_1, mall_db_tenant_2, ...

-- 小租户共享库 + tenant_id
mall_db_shared.t_product
\`\`\`

> 用 Sharding-JDBC 配置规则，**自动路由**。

## 5. 数据迁移（独立库方案）

\`\`\`sql
-- 新建租户库
CREATE DATABASE mall_tenant_3;

-- 从模板库复制结构
mysqldump -d mall_template | mysql mall_tenant_3;

-- 后续逻辑在 Java 里建表 / 初始化数据
\`\`\`

## 6. 跨租户查询（运营后台）

\`\`\`sql
-- 统计所有租户订单数
SELECT
  tenant_id,
  COUNT(*) AS order_cnt,
  SUM(amount) AS total_amount
FROM t_order
WHERE create_time > '2026-01-01'
GROUP BY tenant_id;
\`\`\`

> 走 OLAP 工具（ClickHouse、StarRocks）更好。

## 7. 数据备份策略

| 方案 | 策略 |
| --- | --- |
| 独立库 | 按租户分别备份，按需恢复 |
| 共享库 | 整库备份 + binlog 增量 |
| 混合 | 大租户单独备份 |

## 8. 软删除与租户

\`\`\`sql
-- 逻辑删除 + 租户
UPDATE t_product
SET deleted = 1
WHERE id = 100 AND tenant_id = 1;  -- 必须带 tenant_id
\`\`\`

> 业务层 \`updateById\` 通过拦截器自动加 \`tenant_id\`。

## 9. 跨租户 JOIN（避免）

\`\`\`sql
-- ❌ 跨租户 JOIN
SELECT o.id, u.username, p.name
FROM t_order o
JOIN t_user u ...
JOIN t_product p ...
WHERE o.tenant_id = 1;  -- 必须所有表都带 tenant_id，且要一致
\`\`\`

> **强烈建议**：查询时所有表都带 \`tenant_id\`，避免跨租户数据污染。

## 10. 性能注意

\`\`\`sql
-- 索引必须 tenant_id 在最左
KEY idx_tenant_status (tenant_id, status)
-- 不然会出现"全租户扫描"
KEY idx_status (status)  -- ❌
\`\`\`

> 业务慢 SQL 80% 来自"忘了带 tenant_id"或"索引没把 tenant_id 放最左"。

## 11. 业务实战：分库分表（共享 DB 撑不住时）

\`\`\`sql
-- 按 tenant_id 哈希分 64 库
DB_0, DB_1, ..., DB_63
-- 每库再按 create_time 分 12 表
t_order_202601, t_order_202602, ...
\`\`\`

用 Sharding-JDBC：

\`\`\`yaml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1,ds2,ds3
    rules:
      sharding:
        tables:
          t_order:
            actual-data-nodes: ds$->{0..3}.t_order_$->{202601..202612}
            database-strategy:
              standard:
                sharding-column: tenant_id
                sharding-algorithm-name: tenant-hash
\`\`\`

## 12. 选型决策

| 租户数 | 方案 |
| --- | --- |
| 1-100 | 独立库 |
| 100-10000 | 共享 DB + 字段 |
| 10000+ | 分库分表 |
| 超级大租户 | 独立库 + 单独部署 |

## 13. 业务实战

\`\`\`java
// 自动注入 tenant_id（MyBatis-Plus）
public class ProductServiceImpl extends ServiceImpl<ProductMapper, ProductDO>
    implements ProductService {

    @Override
    @Transactional
    public Long create(ProductCreateDTO dto) {
        ProductDO entity = convert.toDO(dto);
        // 不用 set tenant_id，MP 自动从 TenantContext 拿
        this.save(entity);
        return entity.getId();
    }
}
\`\`\`

## 常见坑

- ❌ 业务表忘了加 \`tenant_id\` → 数据混乱
- ❌ 索引没把 \`tenant_id\` 放最左 → 慢
- ❌ 后台跨租户查询 → 必须 \`@InterceptorIgnore\`
- ❌ 缓存 key 没加租户前缀 → 缓存污染
- ❌ 定时任务忘了 set tenant → 漏数据
- ❌ 跨租户 JOIN → 性能极差

## 配套 Demo

- \`backend/demo-04-multitenant-mall/sql/\`

## 面试常见追问

- 多租户三种方案？优缺点？
- 为什么共享 DB + 字段最常用？
- 跨租户后台查询怎么实现？
- 多租户 + 分库分表怎么选？
- 数据隔离错了怎么办？
`,fr=`# 01 · 多租户商城业务总览
> 一套后端服务 N 个商家

## 业务定位

**多租户商城（SaaS Mall）** = 平台给多个商家（租户）开店，每个商家**独立运营**，但共用一套后端。

## 角色

| 角色 | 说明 |
| --- | --- |
| 平台方（Platform） | 系统运营，管理租户、配置 |
| 商家（Tenant Admin） | 商家后台，管理商品 / 订单 / 库存 |
| 顾客（Customer） | C 端用户，下单购物 |
| 客服（Customer Service） | 处理订单 / 售后 |

## 核心模块

\`\`\`
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  用户中心    │  商品中心    │  交易/订单   │  营销/促销   │
│  - 登录/注册 │  - SPU/SKU   │  - 购物车    │  - 优惠券    │
│  - 收货地址  │  - 分类      │  - 订单      │  - 满减      │
│  - 会员      │  - 库存      │  - 支付      │  - 秒杀      │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  库存中心    │  支付中心    │  运营后台    │  统计中心    │
│  - 预占/扣减 │  - 微信/支付宝│  - 商家管理  │  - 销售报表  │
│  - 仓库      │  - 回调      │  - 商品审核  │  - 用户画像  │
└──────────────┴──────────────┴──────────────┴──────────────┘
\`\`\`

## 数据流

\`\`\`
[用户] → [浏览商品] → [加入购物车] → [提交订单] → [支付]
                                              ↓
                                       [库存预占/扣减]
                                              ↓
                                       [订单状态机]
                                              ↓
                                        [发货 / 完成]
\`\`\`

## 核心概念

### SPU vs SKU

| 概念 | 含义 | 例子 |
| --- | --- | --- |
| **SPU**（Standard Product Unit） | 商品的"款" | iPhone 15 |
| **SKU**（Stock Keeping Unit） | 最小库存单位 | iPhone 15 黑色 256G |

> 业务里**库存 / 价格都挂在 SKU 上**。

### 订单状态机

\`\`\`
PENDING ──支付──> PAID ──发货──> SHIPPED ──签收──> COMPLETED
   │                │                                
   └──取消──> CANCELED   ←──────取消──┘
\`\`\`

## 关键技术挑战

| 挑战 | 解决 |
| --- | --- |
| 数据隔离 | 多租户（字段方案） |
| 库存超卖 | Redis 预扣 + 乐观锁 |
| 高并发 | 限流 + 队列削峰 |
| 支付幂等 | Idempotency-Key + 状态机 |
| 分布式事务 | 本地消息表 / MQ 事务消息 |
| 性能 | 缓存 + 读写分离 + 分库分表 |

## 业务接口分类

| 类型 | 例 | 鉴权 |
| --- | --- | --- |
| 公开 | 商品列表、商品详情 | 无 |
| 用户 | 下单、查订单 | JWT（用户） |
| 商家 | 上架、改价 | JWT + 租户 + 角色 |
| 平台 | 创租户、停租户 | 平台超管 |

## 学习路径

1. 读 [02-tenant-rbac](file:///docs/project/02-tenant-rbac) —— 理解租户与权限
2. 读 [03-product](file:///docs/project/03-product) —— 商品模型
3. 读 [04-order-state](file:///docs/project/04-order-state) —— 订单状态机
4. 读 [05-stock](file:///docs/project/05-stock) —— 库存方案
5. 读 [06-pay](file:///docs/project/06-pay) —— 支付与回调
6. 配合 demo-04 代码学习

## 配套 Demo

- \`backend/demo-04-multitenant-mall/\`
`,br=`# 02 · 租户模型与权限设计
> 谁能做什么

## 1. 角色模型（RBAC）

\`\`\`
用户 (User)
  ↓ 多对多
角色 (Role)        ──── 系统管理员、商家管理员、普通用户
  ↓ 多对多
权限 (Permission)  ──── product:create, order:view
\`\`\`

## 2. 数据模型

\`\`\`sql
-- 租户
CREATE TABLE t_tenant (
    id          BIGINT PRIMARY KEY,
    code        VARCHAR(50) UNIQUE,
    name        VARCHAR(200),
    status      TINYINT,            -- 1 启用 0 停用
    expire_at   DATETIME,
    create_time DATETIME
);

-- 用户
CREATE TABLE t_user (
    id          BIGINT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL,
    username    VARCHAR(50),
    password    VARCHAR(200),       -- BCrypt hash
    nickname    VARCHAR(50),
    phone       VARCHAR(20),
    email       VARCHAR(100),
    status      TINYINT,
    create_time DATETIME
);

-- 角色
CREATE TABLE t_role (
    id          BIGINT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL,
    code        VARCHAR(50),        -- TENANT_ADMIN, STAFF
    name        VARCHAR(50)
);

-- 用户-角色
CREATE TABLE t_user_role (
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id, role_id)
);

-- 角色-权限
CREATE TABLE t_role_permission (
    role_id       BIGINT,
    permission    VARCHAR(100),     -- product:create
    PRIMARY KEY (role_id, permission)
);
\`\`\`

## 3. 业务角色

| 角色 | code | 权限 |
| --- | --- | --- |
| 平台超管 | \`PLATFORM_ADMIN\` | 所有租户 / 配置 |
| 租户超管 | \`TENANT_ADMIN\` | 本租户全部 |
| 运营 | \`STAFF\` | 商品 / 订单 |
| 客服 | \`CS\` | 订单查询 / 售后 |
| 用户 | \`CUSTOMER\` | 下单 / 个人中心 |

## 4. JWT 设计

\`\`\`json
{
  "sub": "10086",
  "username": "tom",
  "tenantId": 1,
  "roles": ["TENANT_ADMIN"],
  "iat": 1700000000,
  "exp": 1700086400
}
\`\`\`

## 5. 权限拦截

\`\`\`java
// 自定义注解
@RequirePermission("product:create")
@PostMapping
public Result<Long> create(@RequestBody ProductCreateDTO dto) { ... }
\`\`\`

AOP 拦截：

\`\`\`java
@Around("@annotation(perm)")
public Object around(ProceedingJoinPoint pjp, RequirePermission perm) {
    Set<String> userPerms = UserContext.getPermissions();
    if (!userPerms.contains(perm.value())) {
        throw new BizException(ResultCode.FORBIDDEN);
    }
    return pjp.proceed();
}
\`\`\`

## 6. 数据权限（额外层）

\`\`\`java
// 商家只能看自己店铺
@RequiresDataScope(DataScopeType.SHOP)
public List<Order> list() { ... }
\`\`\`

| 类型 | 含义 |
| --- | --- |
| \`ALL\` | 全部 |
| \`TENANT\` | 本租户 |
| \`SHOP\` | 本店铺 |
| \`SELF\` | 仅自己创建 |

## 7. 多租户 SQL 拦截

\`\`\`sql
-- MyBatis-Plus 自动加
SELECT * FROM t_product WHERE id = 1 AND tenant_id = 1;

-- 后台超管查询全部
@InterceptorIgnore(tenantLine = "true")
public List<Product> selectAll() { ... }
\`\`\`

## 8. 接口权限矩阵

| 接口 | 平台 | 租户 | 用户 |
| --- | --- | --- | --- |
| 创租户 | ✅ | ❌ | ❌ |
| 上架商品 | ❌ | ✅ | ❌ |
| 下单 | ❌ | ❌ | ✅ |
| 查全部订单 | ✅ | ❌ | ❌ |
| 查本租户订单 | ❌ | ✅ | ❌ |
| 查本人订单 | ❌ | ❌ | ✅ |

## 配套 Demo

- \`backend/demo-04-multitenant-mall/\`
  - \`entity/\`
  - \`auth/\`
  - \`config/MybatisPlusConfig\`
`,mr=`# 03 · 商品 / SKU / SPU
> 一个商品两条命

## 概念

| 名词 | 含义 | 例子 |
| --- | --- | --- |
| **SPU** | 商品款（标准化产品单元） | iPhone 15 |
| **SKU** | 最小库存单位 | iPhone 15 黑色 256G |

**关系**：1 个 SPU 包含 N 个 SKU。

\`\`\`
SPU: iPhone 15
├── SKU: iPhone 15 黑色 128G
├── SKU: iPhone 15 黑色 256G
├── SKU: iPhone 15 白色 128G
└── SKU: iPhone 15 白色 256G
\`\`\`

## 数据模型

\`\`\`sql
-- SPU（商品款）
CREATE TABLE t_product_spu (
    id           BIGINT PRIMARY KEY,
    tenant_id    BIGINT NOT NULL,
    category_id  BIGINT NOT NULL,
    name         VARCHAR(200),       -- iPhone 15
    brand        VARCHAR(100),
    description  TEXT,
    status       TINYINT,
    create_time  DATETIME
);

-- SKU（最小库存单位）
CREATE TABLE t_product_sku (
    id           BIGINT PRIMARY KEY,
    tenant_id    BIGINT NOT NULL,
    spu_id       BIGINT NOT NULL,
    sku_code     VARCHAR(64),
    name         VARCHAR(200),       -- iPhone 15 黑色 256G
    price        DECIMAL(10,2),
    cost_price   DECIMAL(10,2),
    stock        INT DEFAULT 0,
    weight       INT DEFAULT 0,      -- 克
    spec         JSON,               -- {"颜色":"黑","内存":"256G"}
    status       TINYINT,
    UNIQUE KEY uk_tenant_spu_code (tenant_id, spu_id, sku_code)
);

-- 商品分类
CREATE TABLE t_category (
    id          BIGINT PRIMARY KEY,
    tenant_id   BIGINT,
    parent_id   BIGINT DEFAULT 0,
    name        VARCHAR(100),
    level       TINYINT,             -- 1 一级 2 二级 3 三级
    sort        INT
);
\`\`\`

## 业务接口

| 接口 | 说明 |
| --- | --- |
| \`POST /api/products\` | 创建 SPU（含 SKU） |
| \`GET /api/products/{id}\` | 详情（SPU + SKU 列表） |
| \`PATCH /api/products/{id}/on-shelf\` | 上架 |
| \`PATCH /api/products/{id}/off-shelf\` | 下架 |
| \`PATCH /api/products/{id}/price\` | 改价 |

## 创建商品业务流

\`\`\`
1. 校验分类
2. 校验 SKU 编码唯一
3. 事务：
   - INSERT t_product_spu
   - INSERT t_product_sku (N 个)
4. 清理相关缓存
\`\`\`

## 缓存设计

| Key | Value | TTL |
| --- | --- | --- |
| \`t{tenant}:product:{spuId}\` | SPU + SKU 列表 | 5 min |
| \`t{tenant}:product:hot:list\` | 热门商品 | 1 min |

## 上 / 下架

\`\`\`java
public void onShelf(Long spuId) {
    ProductSpuDO spu = spuMapper.selectById(spuId);
    spu.setStatus(1);
    spuMapper.updateById(spu);
    // 同步所有 SKU
    skuMapper.updateStatusBySpuId(spuId, 1);
    // 清缓存
    redis.delete("t" + TenantContext.require() + ":product:" + spuId);
}
\`\`\`

## 改价

\`\`\`java
public void updatePrice(Long skuId, BigDecimal price) {
    SkuDO sku = skuMapper.selectById(skuId);
    BigDecimal old = sku.getPrice();
    sku.setPrice(price);
    skuMapper.updateById(sku);
    // 记录价格变更（审计）
    priceLogMapper.insert(new PriceLog(skuId, old, price));
    // 清缓存
    redis.delete("t" + TenantContext.require() + ":product:" + sku.getSpuId());
}
\`\`\`

## 关联文档

- [11-mybatis-plus](file:///docs/java/11-mybatis-plus)
- [16-multitenant](file:///docs/java/16-multitenant)
- [14-redis](file:///docs/java/14-redis)

## 配套 Demo

- \`backend/demo-04-multitenant-mall/service/ProductService.java\`
`,gr=`# 04 · 订单状态机
> 订单的"一生"

## 状态总览

\`\`\`
PENDING ──支付──> PAID ──发货──> SHIPPED ──签收──> COMPLETED
   │                │                                  
   │                ├─申请退款──> REFUNDING ──通过──> REFUNDED
   │                │                       └──拒绝──> PAID
   │                │
   └──取消──> CANCELED
\`\`\`

| 状态 | 说明 |
| --- | --- |
| \`PENDING\` | 待支付 |
| \`PAID\` | 已支付 |
| \`SHIPPED\` | 已发货 |
| \`COMPLETED\` | 已完成（确认收货） |
| \`CANCELED\` | 已取消（未支付） |
| \`REFUNDING\` | 退款中 |
| \`REFUNDED\` | 已退款 |

## 数据模型

\`\`\`sql
CREATE TABLE t_order (
    id            BIGINT PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    order_no      VARCHAR(32) UNIQUE,        -- 业务单号
    user_id       BIGINT NOT NULL,
    status        VARCHAR(20) NOT NULL,      -- 状态
    total_amount  DECIMAL(12,2),
    pay_amount    DECIMAL(12,2),
    pay_method    VARCHAR(20),
    pay_time      DATETIME,
    ship_time     DATETIME,
    complete_time DATETIME,
    cancel_time   DATETIME,
    address_id    BIGINT,
    remark        VARCHAR(500),
    create_time   DATETIME,
    update_time   DATETIME,
    KEY idx_user (user_id),
    KEY idx_tenant_status (tenant_id, status)
);

-- 订单项
CREATE TABLE t_order_item (
    id           BIGINT PRIMARY KEY,
    order_id     BIGINT,
    spu_id       BIGINT,
    sku_id       BIGINT,
    product_name VARCHAR(200),               -- 冗余
    sku_name     VARCHAR(200),
    unit_price   DECIMAL(10,2),              -- 冗余
    qty          INT,
    subtotal     DECIMAL(10,2)
);
\`\`\`

## 状态机实现

### 1. 枚举定义

\`\`\`java
public enum OrderStatus {
    PENDING, PAID, SHIPPED, COMPLETED,
    CANCELED, REFUNDING, REFUNDED;

    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case PENDING   -> target == PAID || target == CANCELED;
            case PAID      -> target == SHIPPED || target == REFUNDING;
            case SHIPPED   -> target == COMPLETED || target == REFUNDING;
            case REFUNDING -> target == REFUNDED || target == PAID;
            case COMPLETED, CANCELED, REFUNDED -> false;
        };
    }
}
\`\`\`

### 2. 状态机服务

\`\`\`java
@Service
@RequiredArgsConstructor
public class OrderStateMachine {

    private final OrderMapper orderMapper;

    @Transactional
    public void transition(Long orderId, OrderStatus target) {
        OrderDO order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException(ResultCode.ORDER_NOT_FOUND);
        }
        OrderStatus current = OrderStatus.valueOf(order.getStatus());
        if (!current.canTransitionTo(target)) {
            throw new BizException(ResultCode.ORDER_STATE_INVALID,
                current + " -> " + target + " not allowed");
        }
        // CAS：带状态条件更新
        int rows = orderMapper.updateStatusIf(orderId, current.name(), target.name());
        if (rows == 0) {
            throw new BizException(ResultCode.ORDER_STATE_INVALID, "并发冲突");
        }
    }
}
\`\`\`

### 3. 业务操作 = 状态转移

\`\`\`java
public void pay(Long orderId, String payMethod) {
    stateMachine.transition(orderId, OrderStatus.PAID);
    OrderDO order = orderMapper.selectById(orderId);
    order.setPayMethod(payMethod);
    order.setPayTime(LocalDateTime.now());
    orderMapper.updateById(order);
}

public void ship(Long orderId) {
    stateMachine.transition(orderId, OrderStatus.SHIPPED);
    // ... 发货逻辑
}

public void cancel(Long orderId) {
    stateMachine.transition(orderId, OrderStatus.CANCELED);
    // 释放库存
    stockService.release(orderId);
}
\`\`\`

## 4. 支付回调

\`\`\`java
@PostMapping("/pay/callback")
public Result<Void> payCallback(@RequestBody PayCallbackReq req) {
    // 1. 验证签名
    if (!payService.verifySign(req)) {
        return Result.fail("sign error");
    }
    // 2. 幂等
    if (payLogMapper.exists(req.getTradeNo())) {
        return Result.ok();  // 已处理
    }
    // 3. 状态转移
    OrderDO order = orderMapper.selectByOrderNo(req.getOrderNo());
    stateMachine.transition(order.getId(), OrderStatus.PAID);
    // 4. 记录
    payLogMapper.insert(new PayLog(...));
    return Result.ok();
}
\`\`\`

## 5. 超时自动取消

\`\`\`java
@Scheduled(cron = "0 */1 * * * ?")   // 每分钟
public void cancelTimeoutOrders() {
    LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
    List<OrderDO> orders = orderMapper.selectTimeoutPending(threshold);
    for (OrderDO o : orders) {
        try {
            stateMachine.transition(o.getId(), OrderStatus.CANCELED);
            stockService.release(o.getId());
        } catch (Exception e) {
            log.warn("auto cancel failed: {}", o.getId(), e);
        }
    }
}
\`\`\`

## 6. 状态机图示

\`\`\`
[PENDING] ──支付──> [PAID] ──发货──> [SHIPPED] ──签收──> [COMPLETED]
    │                  │                  │
    │                  ├─退款──> [REFUNDING] ──通过──> [REFUNDED]
    │                  │                  │
    │                  │                  └──拒绝──> [PAID]
    │                  │
    └──取消──> [CANCELED]
\`\`\`

## 7. 实战经验

- 状态字段用 \`VARCHAR\` 存枚举名（比 \`TINYINT\` 易读、易调试）
- 状态转移**用 CAS**（带 WHERE 条件）防并发
- 关键状态变更写**操作日志**
- 退款 / 售后**单独流程**，不要混在主状态机

## 8. 异常处理

| 场景 | 处理 |
| --- | --- |
| 状态非法转移 | 抛 \`ORDER_STATE_INVALID\` |
| 并发冲突 | CAS 失败 → 重试 / 提示 |
| 回调超时 | 主动查单 / 补单 |
| 状态卡住 | 定时任务扫描 + 报警 |

## 关联文档

- [12-response-exception](file:///docs/java/12-response-exception)
- [17-idempotent](file:///docs/java/17-idempotent)
- [07-transaction](file:///docs/mysql/07-transaction)

## 配套 Demo

- \`backend/demo-04-multitenant-mall/order/OrderStateMachine.java\`
`,Er=`# 05 · 库存扣减方案
> 不超卖、不少卖

## 是什么

**库存扣减**是电商最核心的并发问题：
- 100 件商品，1000 人同时买
- **不能超卖**（卖 101 件）
- 也不能少卖（实际有 100 件只卖了 99 件）

## 1. 三种主流方案

| 方案 | 原理 | 性能 | 一致性 |
| --- | --- | --- | --- |
| **DB 行锁 + 乐观锁** | \`version\` 字段 CAS | 中 | 强 |
| **Redis 预扣 + 异步落库** | Redis DECR | 高 | 最终 |
| **Redis + Lua 原子脚本** | Lua 脚本 | 极高 | 最终 |

## 2. 方案 1：DB 乐观锁（适合中低并发）

\`\`\`sql
-- 商品表加 version
ALTER TABLE t_product_sku ADD COLUMN version INT NOT NULL DEFAULT 0;
\`\`\`

\`\`\`java
// 扣库存
public boolean deduct(Long skuId, int qty) {
    int rows = skuMapper.deductStock(skuId, qty);
    // SQL: UPDATE t_product_sku
    //      SET stock = stock - #{qty}, version = version + 1
    //      WHERE id = #{skuId} AND stock >= #{qty} AND version = #{version}
    return rows > 0;
}
\`\`\`

\`\`\`java
// 调用方
boolean ok = stockService.deduct(skuId, qty, currentVersion);
if (!ok) {
    // 重试 / 提示
}
\`\`\`

**优点**：强一致
**缺点**：高并发时**重试多、慢**

## 3. 方案 2：Redis 预扣（秒杀推荐）

\`\`\`java
// 1. 预扣：Redis DECR（原子）
Long stock = redis.opsForValue().decrement("t{tenant}:stock:" + skuId);
if (stock < 0) {
    // 回滚
    redis.opsForValue().increment("t{tenant}:stock:" + skuId);
    throw new BizException(SECKILL_SOLD_OUT);
}

// 2. 异步落库（MQ）
kafkaTemplate.send("stock-deduct", new StockMessage(skuId, qty, orderId));
\`\`\`

消费端：

\`\`\`java
@KafkaListener(topics = "stock-deduct")
public void onDeduct(StockMessage msg) {
    // DB 扣减
    boolean ok = skuMapper.deduct(msg.getSkuId(), msg.getQty());
    if (!ok) {
        // 补偿：Redis 加回
        redis.opsForValue().increment("t{tenant}:stock:" + msg.getSkuId());
    }
}
\`\`\`

**优点**：扛高并发
**缺点**：要保证最终一致（补偿 / 对账）

## 4. 方案 3：Redis Lua 原子脚本（最稳）

\`\`\`lua
-- stock.lua
local key = KEYS[1]
local qty = tonumber(ARGV[1])
local current = tonumber(redis.call('GET', key) or '0')
if current >= qty then
    redis.call('DECRBY', key, qty)
    return current - qty
else
    return -1
end
\`\`\`

\`\`\`java
public Long deductStock(Long skuId, int qty) {
    Long stock = redisTemplate.execute(stockScript,
        List.of("t" + TenantContext.require() + ":stock:" + skuId),
        String.valueOf(qty));
    if (stock < 0) {
        throw new BizException(SECKILL_SOLD_OUT);
    }
    return stock;
}
\`\`\`

> **Lua 脚本在 Redis 单线程里执行，绝对原子**。

## 5. 库存预占（订单取消时回退）

\`\`\`
下单成功 ──> 库存预占（30 分钟）
   │
   ├── 支付成功 ──> 真实扣减
   │
   └── 30 分钟未支付 ──> 释放预占
\`\`\`

\`\`\`java
// 预占
public void reserve(Long orderId, List<OrderItem> items) {
    for (OrderItem item : items) {
        skuService.reserveStock(item.getSkuId(), item.getQty());
    }
    reserveMapper.insert(new Reserve(orderId, ...));
}

// 释放
public void release(Long orderId) {
    Reserve r = reserveMapper.selectByOrderId(orderId);
    if (r != null) {
        skuService.releaseStock(r.getItems());
        r.setStatus(RELEASED);
        reserveMapper.updateById(r);
    }
}

// 真实扣减
public void confirm(Long orderId) {
    Reserve r = reserveMapper.selectByOrderId(orderId);
    skuMapper.deduct(r.getItems());  // DB 扣
    r.setStatus(CONFIRMED);
    reserveMapper.updateById(r);
}
\`\`\`

## 6. 业务实战：下单

\`\`\`java
@Transactional
public Long createOrder(OrderCreateReq req) {
    // 1. 算金额
    BigDecimal total = calcTotal(req);
    // 2. 创建订单
    OrderDO order = new OrderDO();
    order.setOrderNo(generateOrderNo());
    order.setStatus(OrderStatus.PENDING.name());
    order.setTotalAmount(total);
    orderMapper.insert(order);
    // 3. 订单项
    orderItemMapper.insertBatch(buildItems(order.getId(), req));
    // 4. 库存预占（Redis 扣）
    stockService.reserve(order.getId(), req.getItems());
    // 5. 限时支付
    scheduleCancelJob(order.getId(), 30);   // 30 分钟超时
    return order.getId();
}
\`\`\`

## 7. 数据一致性保障

### 库存同步

\`\`\`
Redis 库存 ← 启动时 ← 加载 → DB
Redis 库存 ← 定时同步 → DB（每分钟）
\`\`\`

\`\`\`java
@Scheduled(cron = "0 */1 * * * ?")
public void syncStock() {
    List<SkuDO> all = skuMapper.selectAll();
    for (SkuDO sku : all) {
        redis.opsForValue().set("t" + sku.getTenantId() + ":stock:" + sku.getId(), sku.getStock());
    }
}
\`\`\`

### 对账

\`\`\`sql
-- 每小时对账
SELECT sku_id,
  redis_stock,
  db_stock,
  redis_stock - db_stock AS diff
FROM stock_compare
WHERE ABS(diff) > 0;
\`\`\`

> 差异 > 0 → 告警 + 修正。

## 8. 选型

| 场景 | 方案 |
| --- | --- |
| 普通下单 | DB 乐观锁 |
| 大促秒杀 | Redis Lua 原子 |
| 极致性能 | Redis + MQ 异步 |
| 金融高合规 | DB 悲观锁 + 唯一约束 |

## 常见坑

- ❌ 直接 \`UPDATE stock = stock - 1\`（不判断 ≥ 0）→ 超卖
- ❌ 用 \`synchronized\` 锁（分布式不生效）→ 用 Redis 分布式锁
- ❌ Redis 扣完忘了 DB 扣 → 异步 + 对账
- ❌ 取消订单不释放库存 → 积压
- ❌ 没考虑**预占 vs 真实扣减**的差异

## 关联文档

- [14-redis](file:///docs/java/14-redis)
- [19-distributed-lock](file:///docs/java/19-distributed-lock)
- [18-rate-limit](file:///docs/java/18-rate-limit)
- [17-idempotent](file:///docs/java/17-idempotent)

## 配套 Demo

- \`backend/demo-04-multitenant-mall/service/StockService.java\`
`,hr=`# 06 · 支付与回调（模拟）
> 真实支付流程拆解

## 1. 支付流程

\`\`\`
[用户] ──点击支付──> [商城] ──调支付──> [支付网关] ──展示二维码──> [用户]
                          │                    │
                          │                    └──扫码支付──> [银行]
                          │                                  
                          │<──────异步回调（HTTP）────────┘
                          │
                          └──> [查单]（主动轮询兜底）
\`\`\`

## 2. 数据模型

\`\`\`sql
-- 支付单
CREATE TABLE t_pay_order (
    id            BIGINT PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    pay_no        VARCHAR(32) UNIQUE,           -- 支付单号
    order_id      BIGINT NOT NULL,
    order_no      VARCHAR(32) NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    method        VARCHAR(20),                  -- WECHAT / ALIPAY
    status        VARCHAR(20),                  -- PENDING / SUCCESS / FAILED
    trade_no      VARCHAR(64),                  -- 第三方流水号
    pay_time      DATETIME,
    create_time   DATETIME
);

-- 支付回调日志
CREATE TABLE t_pay_log (
    id          BIGINT PRIMARY KEY,
    pay_no      VARCHAR(32),
    request     TEXT,             -- 原始回调 body
    response    TEXT,             -- 我们的响应
    status      VARCHAR(20),      -- SUCCESS / FAILED
    create_time DATETIME
);
\`\`\`

## 3. 创建支付单

\`\`\`java
@Service
public class PayService {

    @Transactional
    public PayOrderResp create(Long orderId, String method) {
        OrderDO order = orderMapper.selectById(orderId);
        if (order.getStatus() != OrderStatus.PENDING.name()) {
            throw new BizException(ORDER_STATE_INVALID);
        }
        // 防重复：基于 orderNo 唯一
        PayOrderDO exist = payMapper.selectByOrderNo(order.getOrderNo());
        if (exist != null) {
            return PayConvert.toResp(exist);
        }
        // 创建
        PayOrderDO pay = new PayOrderDO();
        pay.setPayNo(generatePayNo());
        pay.setOrderId(orderId);
        pay.setOrderNo(order.getOrderNo());
        pay.setAmount(order.getPayAmount());
        pay.setMethod(method);
        pay.setStatus(PENDING.name());
        payMapper.insert(pay);
        // 调支付网关（这里 mock）
        String qrCode = payGateway.createQrCode(pay);
        return new PayOrderResp(pay.getPayNo(), qrCode);
    }
}
\`\`\`

## 4. 异步回调

\`\`\`java
@Slf4j
@RestController
@RequestMapping("/api/pay")
public class PayCallbackController {

    @PostMapping("/callback")
    public String callback(HttpServletRequest req) {
        String body = readBody(req);
        // 1. 验签
        if (!verifySign(body)) {
            log.warn("pay sign invalid: {}", body);
            return "FAIL";
        }
        // 2. 解析
        PayCallbackReq cb = parse(body);
        // 3. 幂等
        if (payLogMapper.existsByPayNo(cb.getPayNo())) {
            return "SUCCESS";  // 已处理
        }
        // 4. 业务处理（事务）
        try {
            payService.handlePaid(cb);
        } catch (Exception e) {
            log.error("pay callback error", e);
            return "FAIL";   // 让支付方重试
        }
        // 5. 记录日志
        payLogMapper.insert(new PayLog(cb.getPayNo(), body, "SUCCESS"));
        return "SUCCESS";
    }
}
\`\`\`

## 5. 业务处理（事务）

\`\`\`java
@Transactional(rollbackFor = Exception.class)
public void handlePaid(PayCallbackReq cb) {
    // 1. 查支付单
    PayOrderDO pay = payMapper.selectByPayNo(cb.getPayNo());
    if (pay == null) {
        throw new BizException(PAY_NOT_FOUND);
    }
    if (pay.getStatus() == SUCCESS.name()) {
        return;  // 已成功
    }
    // 2. 验金额
    if (pay.getAmount().compareTo(cb.getAmount()) != 0) {
        throw new BizException(PAY_AMOUNT_MISMATCH);
    }
    // 3. 改支付单状态
    pay.setStatus(SUCCESS.name());
    pay.setTradeNo(cb.getTradeNo());
    pay.setPayTime(LocalDateTime.now());
    payMapper.updateById(pay);
    // 4. 改订单状态
    stateMachine.transition(pay.getOrderId(), OrderStatus.PAID);
    // 5. 真实扣库存
    stockService.confirm(pay.getOrderId());
    // 6. 增加会员积分
    pointService.add(order.getUserId(), pay.getAmount());
}
\`\`\`

## 6. 主动查单（兜底）

支付回调**不可靠**（网络抖动、用户断网）。必须主动查单。

\`\`\`java
@Scheduled(fixedRate = 30000)   // 30 秒一次
public void scanPendingPay() {
    LocalDateTime threshold = LocalDateTime.now().minusMinutes(2);
    List<PayOrderDO> pendings = payMapper.selectStalePending(threshold);
    for (PayOrderDO pay : pendings) {
        PayCallbackReq cb = payGateway.query(pay.getPayNo());
        if (cb != null && cb.isSuccess()) {
            payService.handlePaid(cb);
        }
    }
}
\`\`\`

## 7. 幂等保障

### 三道防线

1. **支付单唯一**：\`pay_no\` 唯一索引
2. **日志记录**：\`t_pay_log\` 记录原始 body
3. **状态机**：已 SUCCESS 不再处理

## 8. 重复支付 / 退款

| 场景 | 处理 |
| --- | --- |
| 同一订单多次支付 | 第二次报"已支付" |
| 已支付再发起 | 退款流程 |
| 支付成功但回调失败 | 主动查单 + 对账 |
| 银行已扣但我们没记录 | 监控告警 + 人工 |

## 9. 支付网关 Mock

\`\`\`java
@Component
public class MockPayGateway {

    public String createQrCode(PayOrderDO pay) {
        // 真实环境调微信/支付宝 API
        // 这里直接返一个伪二维码
        return "mock://pay?payNo=" + pay.getPayNo() + "&amount=" + pay.getAmount();
    }

    public PayCallbackReq query(String payNo) {
        // 真实环境调微信/支付宝查单 API
        // 这里返 null 或构造一个 SUCCESS
        return null;
    }
}
\`\`\`

## 10. 安全

| 措施 | 作用 |
| --- | --- |
| 签名验证 | 防止伪造回调 |
| HTTPS | 防止中间人 |
| 防重放 | 时间戳 / nonce |
| 金额校验 | 防止篡改 |
| IP 白名单 | 仅支付方 IP 可调 |

## 11. 异常处理

| 异常 | 处理 |
| --- | --- |
| 签名错误 | 返 FAIL + 告警 |
| 金额不符 | 返 FAIL + 告警 |
| 订单状态非法 | 返 FAIL（不重试） |
| 系统异常 | 返 FAIL（让支付方重试） |

## 关联文档

- [17-idempotent](file:///docs/java/17-idempotent)
- [04-order-state](file:///docs/project/04-order-state)
- [05-stock](file:///docs/project/05-stock)

## 配套 Demo

- \`backend/demo-04-multitenant-mall/pay/PayService.java\`
- \`backend/demo-04-multitenant-mall/pay/MockPayGateway.java\`
`,_r=`# 07 · 商城接口列表
> 一张表看懂 demo-04 全部接口

## 用户模块

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | \`/api/auth/register\` | 公开 | 用户注册 |
| POST | \`/api/auth/login\` | 公开 | 登录返 token |
| POST | \`/api/auth/logout\` | 用户 | 退出登录 |
| GET | \`/api/users/me\` | 用户 | 当前用户信息 |
| PATCH | \`/api/users/me\` | 用户 | 改昵称 / 头像 |

## 商品模块

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | \`/api/products\` | 公开 | 商品列表（分页 + 筛选） |
| GET | \`/api/products/{id}\` | 公开 | 商品详情 |
| POST | \`/api/products\` | 商家 | 创建商品 |
| PATCH | \`/api/products/{id}\` | 商家 | 修改商品 |
| DELETE | \`/api/products/{id}\` | 商家 | 删除 |
| PATCH | \`/api/products/{id}/on-shelf\` | 商家 | 上架 |
| PATCH | \`/api/products/{id}/off-shelf\` | 商家 | 下架 |

## 购物车

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | \`/api/cart\` | 用户 | 我的购物车 |
| POST | \`/api/cart/items\` | 用户 | 加入购物车 |
| PATCH | \`/api/cart/items/{id}\` | 用户 | 改数量 |
| DELETE | \`/api/cart/items/{id}\` | 用户 | 删除 |
| DELETE | \`/api/cart\` | 用户 | 清空 |

## 订单模块

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | \`/api/orders\` | 用户 | 创建订单 |
| GET | \`/api/orders/{id}\` | 用户 | 订单详情 |
| GET | \`/api/orders\` | 用户 | 我的订单 |
| POST | \`/api/orders/{id}/cancel\` | 用户 | 取消订单 |
| POST | \`/api/orders/{id}/pay\` | 用户 | 发起支付 |
| POST | \`/api/orders/{id}/confirm\` | 用户 | 确认收货 |
| POST | \`/api/orders/{id}/refund\` | 用户 | 申请退款 |

## 支付

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | \`/api/pay/callback\` | 公开（验签） | 支付回调 |
| GET | \`/api/pay/orders/{payNo}\` | 用户 | 查支付单 |

## 平台管理

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | \`/api/admin/tenants\` | 平台 | 创建租户 |
| GET | \`/api/admin/tenants\` | 平台 | 租户列表 |
| PATCH | \`/api/admin/tenants/{id}/disable\` | 平台 | 停用租户 |
| PATCH | \`/api/admin/tenants/{id}/enable\` | 平台 | 启用租户 |
| GET | \`/api/admin/stats\` | 平台 | 全局统计 |

## 商家后台

| Method | URL | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | \`/api/merchant/orders\` | 商家 | 租户订单列表 |
| PATCH | \`/api/merchant/orders/{id}/ship\` | 商家 | 发货 |
| GET | \`/api/merchant/stats\` | 商家 | 销售统计 |

## 错误码速查

| 码 | 含义 |
| --- | --- |
| 0 | 成功 |
| 40000 | 参数错误 |
| 40100 | 未登录 |
| 40101 | token 过期 |
| 40300 | 无权限 |
| 40400 | 资源不存在 |
| 50010 | 商品不存在 |
| 50011 | 库存不足 |
| 50020 | 订单状态非法 |
| 50030 | 余额不足 |
| 50040 | 支付失败 |
| 50000 | 系统异常 |
| 60001 | 限流 |
| 60002 | 重复请求 |
| 70001 | 租户缺失 |
| 70002 | 租户已停用 |

## 关联文档

- [09-restful](file:///docs/java/09-restful)
- [12-response-exception](file:///docs/java/12-response-exception)
- [16-multitenant](file:///docs/java/16-multitenant)

## 配套 Demo

- \`backend/demo-04-multitenant-mall/controller/\`
`,je={};function Tr(n){let e=je[n];if(e)return e;e=je[n]=[];for(let t=0;t<128;t++){const u=String.fromCharCode(t);e.push(u)}for(let t=0;t<n.length;t++){const u=n.charCodeAt(t);e[u]="%"+("0"+u.toString(16).toUpperCase()).slice(-2)}return e}function yn(n,e){typeof e!="string"&&(e=yn.defaultChars);const t=Tr(e);return n.replace(/(%[a-f0-9]{2})+/gi,function(u){let r="";for(let a=0,o=u.length;a<o;a+=3){const i=parseInt(u.slice(a+1,a+3),16);if(i<128){r+=t[i];continue}if((i&224)===192&&a+3<o){const c=parseInt(u.slice(a+4,a+6),16);if((c&192)===128){const s=i<<6&1984|c&63;s<128?r+="��":r+=String.fromCharCode(s),a+=3;continue}}if((i&240)===224&&a+6<o){const c=parseInt(u.slice(a+4,a+6),16),s=parseInt(u.slice(a+7,a+9),16);if((c&192)===128&&(s&192)===128){const l=i<<12&61440|c<<6&4032|s&63;l<2048||l>=55296&&l<=57343?r+="���":r+=String.fromCharCode(l),a+=6;continue}}if((i&248)===240&&a+9<o){const c=parseInt(u.slice(a+4,a+6),16),s=parseInt(u.slice(a+7,a+9),16),l=parseInt(u.slice(a+10,a+12),16);if((c&192)===128&&(s&192)===128&&(l&192)===128){let f=i<<18&1835008|c<<12&258048|s<<6&4032|l&63;f<65536||f>1114111?r+="����":(f-=65536,r+=String.fromCharCode(55296+(f>>10),56320+(f&1023))),a+=9;continue}}r+="�"}return r})}yn.defaultChars=";/?:@&=+$,#";yn.componentChars="";const He={};function Ar(n){let e=He[n];if(e)return e;e=He[n]=[];for(let t=0;t<128;t++){const u=String.fromCharCode(t);/^[0-9a-z]$/i.test(u)?e.push(u):e.push("%"+("0"+t.toString(16).toUpperCase()).slice(-2))}for(let t=0;t<n.length;t++)e[n.charCodeAt(t)]=n[t];return e}function Bn(n,e,t){typeof e!="string"&&(t=e,e=Bn.defaultChars),typeof t>"u"&&(t=!0);const u=Ar(e);let r="";for(let a=0,o=n.length;a<o;a++){const i=n.charCodeAt(a);if(t&&i===37&&a+2<o&&/^[0-9a-f]{2}$/i.test(n.slice(a+1,a+3))){r+=n.slice(a,a+3),a+=2;continue}if(i<128){r+=u[i];continue}if(i>=55296&&i<=57343){if(i>=55296&&i<=56319&&a+1<o){const c=n.charCodeAt(a+1);if(c>=56320&&c<=57343){r+=encodeURIComponent(n[a]+n[a+1]),a++;continue}}r+="%EF%BF%BD";continue}r+=encodeURIComponent(n[a])}return r}Bn.defaultChars=";/?:@&=+$,-_.!~*'()#";Bn.componentChars="-_.!~*'()";function he(n){let e="";return e+=n.protocol||"",e+=n.slashes?"//":"",e+=n.auth?n.auth+"@":"",n.hostname&&n.hostname.indexOf(":")!==-1?e+="["+n.hostname+"]":e+=n.hostname||"",e+=n.port?":"+n.port:"",e+=n.pathname||"",e+=n.search||"",e+=n.hash||"",e}function Wn(){this.protocol=null,this.slashes=null,this.auth=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.pathname=null}const Sr=/^([a-z0-9.+-]+:)/i,Dr=/:[0-9]*$/,xr=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,Cr=["<",">",'"',"`"," ","\r",`
`,"	"],yr=["{","}","|","\\","^","`"].concat(Cr),Ir=["'"].concat(yr),qe=["%","/","?",";","#"].concat(Ir),ze=["/","?","#"],vr=255,Je=/^[+a-z0-9A-Z_-]{0,63}$/,Rr=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,Ke={javascript:!0,"javascript:":!0},Ge={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function _e(n,e){if(n&&n instanceof Wn)return n;const t=new Wn;return t.parse(n,e),t}Wn.prototype.parse=function(n,e){let t,u,r,a=n;if(a=a.trim(),!e&&n.split("#").length===1){const s=xr.exec(a);if(s)return this.pathname=s[1],s[2]&&(this.search=s[2]),this}let o=Sr.exec(a);if(o&&(o=o[0],t=o.toLowerCase(),this.protocol=o,a=a.substr(o.length)),(e||o||a.match(/^\/\/[^@\/]+@[^@\/]+/))&&(r=a.substr(0,2)==="//",r&&!(o&&Ke[o])&&(a=a.substr(2),this.slashes=!0)),!Ke[o]&&(r||o&&!Ge[o])){let s=-1;for(let p=0;p<ze.length;p++)u=a.indexOf(ze[p]),u!==-1&&(s===-1||u<s)&&(s=u);let l,f;s===-1?f=a.lastIndexOf("@"):f=a.lastIndexOf("@",s),f!==-1&&(l=a.slice(0,f),a=a.slice(f+1),this.auth=l),s=-1;for(let p=0;p<qe.length;p++)u=a.indexOf(qe[p]),u!==-1&&(s===-1||u<s)&&(s=u);s===-1&&(s=a.length),a[s-1]===":"&&s--;const b=a.slice(0,s);a=a.slice(s),this.parseHost(b),this.hostname=this.hostname||"";const d=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!d){const p=this.hostname.split(/\./);for(let g=0,h=p.length;g<h;g++){const v=p[g];if(v&&!v.match(Je)){let _="";for(let T=0,D=v.length;T<D;T++)v.charCodeAt(T)>127?_+="x":_+=v[T];if(!_.match(Je)){const T=p.slice(0,g),D=p.slice(g+1),A=v.match(Rr);A&&(T.push(A[1]),D.unshift(A[2])),D.length&&(a=D.join(".")+a),this.hostname=T.join(".");break}}}}this.hostname.length>vr&&(this.hostname=""),d&&(this.hostname=this.hostname.substr(1,this.hostname.length-2))}const i=a.indexOf("#");i!==-1&&(this.hash=a.substr(i),a=a.slice(0,i));const c=a.indexOf("?");return c!==-1&&(this.search=a.substr(c),a=a.slice(0,c)),a&&(this.pathname=a),Ge[t]&&this.hostname&&!this.pathname&&(this.pathname=""),this};Wn.prototype.parseHost=function(n){let e=Dr.exec(n);e&&(e=e[0],e!==":"&&(this.port=e.substr(1)),n=n.substr(0,n.length-e.length)),n&&(this.hostname=n)};const kr=Object.freeze(Object.defineProperty({__proto__:null,decode:yn,encode:Bn,format:he,parse:_e},Symbol.toStringTag,{value:"Module"})),_t=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Tt=/[\0-\x1F\x7F-\x9F]/,Lr=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/,Te=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/,At=/[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/,St=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/,Or=Object.freeze(Object.defineProperty({__proto__:null,Any:_t,Cc:Tt,Cf:Lr,P:Te,S:At,Z:St},Symbol.toStringTag,{value:"Module"})),Nr=new Uint16Array('ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map(n=>n.charCodeAt(0))),Mr=new Uint16Array("Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map(n=>n.charCodeAt(0)));var ce;const Pr=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]),wr=(ce=String.fromCodePoint)!==null&&ce!==void 0?ce:function(n){let e="";return n>65535&&(n-=65536,e+=String.fromCharCode(n>>>10&1023|55296),n=56320|n&1023),e+=String.fromCharCode(n),e};function Br(n){var e;return n>=55296&&n<=57343||n>1114111?65533:(e=Pr.get(n))!==null&&e!==void 0?e:n}var j;(function(n){n[n.NUM=35]="NUM",n[n.SEMI=59]="SEMI",n[n.EQUALS=61]="EQUALS",n[n.ZERO=48]="ZERO",n[n.NINE=57]="NINE",n[n.LOWER_A=97]="LOWER_A",n[n.LOWER_F=102]="LOWER_F",n[n.LOWER_X=120]="LOWER_X",n[n.LOWER_Z=122]="LOWER_Z",n[n.UPPER_A=65]="UPPER_A",n[n.UPPER_F=70]="UPPER_F",n[n.UPPER_Z=90]="UPPER_Z"})(j||(j={}));const Fr=32;var pn;(function(n){n[n.VALUE_LENGTH=49152]="VALUE_LENGTH",n[n.BRANCH_LENGTH=16256]="BRANCH_LENGTH",n[n.JUMP_TABLE=127]="JUMP_TABLE"})(pn||(pn={}));function ge(n){return n>=j.ZERO&&n<=j.NINE}function Ur(n){return n>=j.UPPER_A&&n<=j.UPPER_F||n>=j.LOWER_A&&n<=j.LOWER_F}function jr(n){return n>=j.UPPER_A&&n<=j.UPPER_Z||n>=j.LOWER_A&&n<=j.LOWER_Z||ge(n)}function Hr(n){return n===j.EQUALS||jr(n)}var U;(function(n){n[n.EntityStart=0]="EntityStart",n[n.NumericStart=1]="NumericStart",n[n.NumericDecimal=2]="NumericDecimal",n[n.NumericHex=3]="NumericHex",n[n.NamedEntity=4]="NamedEntity"})(U||(U={}));var ln;(function(n){n[n.Legacy=0]="Legacy",n[n.Strict=1]="Strict",n[n.Attribute=2]="Attribute"})(ln||(ln={}));class qr{constructor(e,t,u){this.decodeTree=e,this.emitCodePoint=t,this.errors=u,this.state=U.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=ln.Strict}startEntity(e){this.decodeMode=e,this.state=U.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1}write(e,t){switch(this.state){case U.EntityStart:return e.charCodeAt(t)===j.NUM?(this.state=U.NumericStart,this.consumed+=1,this.stateNumericStart(e,t+1)):(this.state=U.NamedEntity,this.stateNamedEntity(e,t));case U.NumericStart:return this.stateNumericStart(e,t);case U.NumericDecimal:return this.stateNumericDecimal(e,t);case U.NumericHex:return this.stateNumericHex(e,t);case U.NamedEntity:return this.stateNamedEntity(e,t)}}stateNumericStart(e,t){return t>=e.length?-1:(e.charCodeAt(t)|Fr)===j.LOWER_X?(this.state=U.NumericHex,this.consumed+=1,this.stateNumericHex(e,t+1)):(this.state=U.NumericDecimal,this.stateNumericDecimal(e,t))}addToNumericResult(e,t,u,r){if(t!==u){const a=u-t;this.result=this.result*Math.pow(r,a)+parseInt(e.substr(t,a),r),this.consumed+=a}}stateNumericHex(e,t){const u=t;for(;t<e.length;){const r=e.charCodeAt(t);if(ge(r)||Ur(r))t+=1;else return this.addToNumericResult(e,u,t,16),this.emitNumericEntity(r,3)}return this.addToNumericResult(e,u,t,16),-1}stateNumericDecimal(e,t){const u=t;for(;t<e.length;){const r=e.charCodeAt(t);if(ge(r))t+=1;else return this.addToNumericResult(e,u,t,10),this.emitNumericEntity(r,2)}return this.addToNumericResult(e,u,t,10),-1}emitNumericEntity(e,t){var u;if(this.consumed<=t)return(u=this.errors)===null||u===void 0||u.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(e===j.SEMI)this.consumed+=1;else if(this.decodeMode===ln.Strict)return 0;return this.emitCodePoint(Br(this.result),this.consumed),this.errors&&(e!==j.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed}stateNamedEntity(e,t){const{decodeTree:u}=this;let r=u[this.treeIndex],a=(r&pn.VALUE_LENGTH)>>14;for(;t<e.length;t++,this.excess++){const o=e.charCodeAt(t);if(this.treeIndex=zr(u,r,this.treeIndex+Math.max(1,a),o),this.treeIndex<0)return this.result===0||this.decodeMode===ln.Attribute&&(a===0||Hr(o))?0:this.emitNotTerminatedNamedEntity();if(r=u[this.treeIndex],a=(r&pn.VALUE_LENGTH)>>14,a!==0){if(o===j.SEMI)return this.emitNamedEntityData(this.treeIndex,a,this.consumed+this.excess);this.decodeMode!==ln.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1}emitNotTerminatedNamedEntity(){var e;const{result:t,decodeTree:u}=this,r=(u[t]&pn.VALUE_LENGTH)>>14;return this.emitNamedEntityData(t,r,this.consumed),(e=this.errors)===null||e===void 0||e.missingSemicolonAfterCharacterReference(),this.consumed}emitNamedEntityData(e,t,u){const{decodeTree:r}=this;return this.emitCodePoint(t===1?r[e]&~pn.VALUE_LENGTH:r[e+1],u),t===3&&this.emitCodePoint(r[e+2],u),u}end(){var e;switch(this.state){case U.NamedEntity:return this.result!==0&&(this.decodeMode!==ln.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case U.NumericDecimal:return this.emitNumericEntity(0,2);case U.NumericHex:return this.emitNumericEntity(0,3);case U.NumericStart:return(e=this.errors)===null||e===void 0||e.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case U.EntityStart:return 0}}}function Dt(n){let e="";const t=new qr(n,u=>e+=wr(u));return function(r,a){let o=0,i=0;for(;(i=r.indexOf("&",i))>=0;){e+=r.slice(o,i),t.startEntity(a);const s=t.write(r,i+1);if(s<0){o=i+t.end();break}o=i+s,i=s===0?o+1:o}const c=e+r.slice(o);return e="",c}}function zr(n,e,t,u){const r=(e&pn.BRANCH_LENGTH)>>7,a=e&pn.JUMP_TABLE;if(r===0)return a!==0&&u===a?t:-1;if(a){const c=u-a;return c<0||c>=r?-1:n[t+c]-1}let o=t,i=o+r-1;for(;o<=i;){const c=o+i>>>1,s=n[c];if(s<u)o=c+1;else if(s>u)i=c-1;else return n[c+r]}return-1}const xt=Dt(Nr);Dt(Mr);function Jr(n,e=ln.Legacy){return xt(n,e)}function Kr(n){return xt(n,ln.Strict)}function Gr(n){return Object.prototype.toString.call(n)}function Ae(n){return Gr(n)==="[object String]"}const Vr=Object.prototype.hasOwnProperty;function Wr(n,e){return Vr.call(n,e)}function Zn(n){return Array.prototype.slice.call(arguments,1).forEach(function(t){if(t){if(typeof t!="object")throw new TypeError(t+"must be object");Object.keys(t).forEach(function(u){n[u]=t[u]})}}),n}function Ct(n,e,t){return[].concat(n.slice(0,e),t,n.slice(e+1))}function Se(n){return!(n>=55296&&n<=57343||n>=64976&&n<=65007||(n&65535)===65535||(n&65535)===65534||n>=0&&n<=8||n===11||n>=14&&n<=31||n>=127&&n<=159||n>1114111)}function kn(n){if(n>65535){n-=65536;const e=55296+(n>>10),t=56320+(n&1023);return String.fromCharCode(e,t)}return String.fromCharCode(n)}const yt=/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,$r=/&([a-z#][a-z0-9]{1,31});/gi,Yr=new RegExp(yt.source+"|"+$r.source,"gi"),Qr=/^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;function Zr(n,e){if(e.charCodeAt(0)===35&&Qr.test(e)){const u=e[1].toLowerCase()==="x"?parseInt(e.slice(2),16):parseInt(e.slice(1),10);return Se(u)?kn(u):n}const t=Jr(n);return t!==n?t:n}function Xr(n){return n.indexOf("\\")<0?n:n.replace(yt,"$1")}function In(n){return n.indexOf("\\")<0&&n.indexOf("&")<0?n:n.replace(Yr,function(e,t,u){return t||Zr(e,u)})}const na=/[&<>"]/,ea=/[&<>"]/g,ta={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"};function ua(n){return ta[n]}function bn(n){return na.test(n)?n.replace(ea,ua):n}const ra=/[.?*+^$[\]\\(){}|-]/g;function aa(n){return n.replace(ra,"\\$&")}function w(n){switch(n){case 9:case 32:return!0}return!1}function Ln(n){if(n>=8192&&n<=8202)return!0;switch(n){case 9:case 10:case 11:case 12:case 13:case 32:case 160:case 5760:case 8239:case 8287:case 12288:return!0}return!1}function It(n){return Te.test(n)||At.test(n)}function On(n){return It(kn(n))}function Nn(n){switch(n){case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 124:case 125:case 126:return!0;default:return!1}}function Xn(n){return n=n.trim().replace(/\s+/g," "),"ẞ".toLowerCase()==="Ṿ"&&(n=n.replace(/ẞ/g,"ß")),n.toLowerCase().toUpperCase()}function Ve(n){return n===32||n===9||n===10||n===13}function ne(n){let e=0;for(;e<n.length&&Ve(n.charCodeAt(e));e++);let t=n.length-1;for(;t>=e&&Ve(n.charCodeAt(t));t--);return n.slice(e,t+1)}const ia={mdurl:kr,ucmicro:Or},oa=Object.freeze(Object.defineProperty({__proto__:null,arrayReplaceAt:Ct,asciiTrim:ne,assign:Zn,escapeHtml:bn,escapeRE:aa,fromCodePoint:kn,has:Wr,isMdAsciiPunct:Nn,isPunctChar:It,isPunctCharCode:On,isSpace:w,isString:Ae,isValidEntityCode:Se,isWhiteSpace:Ln,lib:ia,normalizeReference:Xn,unescapeAll:In,unescapeMd:Xr},Symbol.toStringTag,{value:"Module"}));function ca(n,e,t){let u,r,a,o;const i=n.posMax,c=n.pos;for(n.pos=e+1,u=1;n.pos<i;){if(a=n.src.charCodeAt(n.pos),a===93&&(u--,u===0)){r=!0;break}if(o=n.pos,n.md.inline.skipToken(n),a===91){if(o===n.pos-1)u++;else if(t)return n.pos=c,-1}}let s=-1;return r&&(s=n.pos),n.pos=c,s}function sa(n,e,t){let u,r=e;const a={ok:!1,pos:0,str:""};if(n.charCodeAt(r)===60){for(r++;r<t;){if(u=n.charCodeAt(r),u===10||u===60)return a;if(u===62)return a.pos=r+1,a.str=In(n.slice(e+1,r)),a.ok=!0,a;if(u===92&&r+1<t){r+=2;continue}r++}return a}let o=0;for(;r<t&&(u=n.charCodeAt(r),!(u===32||u<32||u===127));){if(u===92&&r+1<t){if(n.charCodeAt(r+1)===32)break;r+=2;continue}if(u===40&&(o++,o>32))return a;if(u===41){if(o===0)break;o--}r++}return e===r||o!==0||(a.str=In(n.slice(e,r)),a.pos=r,a.ok=!0),a}function la(n,e,t,u){let r,a=e;const o={ok:!1,can_continue:!1,pos:0,str:"",marker:0};if(u)o.str=u.str,o.marker=u.marker;else{if(a>=t)return o;let i=n.charCodeAt(a);if(i!==34&&i!==39&&i!==40)return o;e++,a++,i===40&&(i=41),o.marker=i}for(;a<t;){if(r=n.charCodeAt(a),r===o.marker)return o.pos=a+1,o.str+=In(n.slice(e,a)),o.ok=!0,o;if(r===40&&o.marker===41)return o;r===92&&a+1<t&&a++,a++}return o.can_continue=!0,o.str+=In(n.slice(e,a)),o}const da=Object.freeze(Object.defineProperty({__proto__:null,parseLinkDestination:sa,parseLinkLabel:ca,parseLinkTitle:la},Symbol.toStringTag,{value:"Module"})),an={};an.code_inline=function(n,e,t,u,r){const a=n[e];return"<code"+r.renderAttrs(a)+">"+bn(a.content)+"</code>"};an.code_block=function(n,e,t,u,r){const a=n[e];return"<pre"+r.renderAttrs(a)+"><code>"+bn(n[e].content)+`</code></pre>
`};an.fence=function(n,e,t,u,r){const a=n[e],o=a.info?In(a.info).trim():"";let i="",c="";if(o){const l=o.split(/(\s+)/g);i=l[0],c=l.slice(2).join("")}let s;if(t.highlight?s=t.highlight(a.content,i,c)||bn(a.content):s=bn(a.content),s.indexOf("<pre")===0)return s+`
`;if(o){const l=a.attrIndex("class"),f=a.attrs?a.attrs.slice():[];l<0?f.push(["class",t.langPrefix+i]):(f[l]=f[l].slice(),f[l][1]+=" "+t.langPrefix+i);const b={attrs:f};return`<pre><code${r.renderAttrs(b)}>${s}</code></pre>
`}return`<pre><code${r.renderAttrs(a)}>${s}</code></pre>
`};an.image=function(n,e,t,u,r){const a=n[e];return a.attrs[a.attrIndex("alt")][1]=r.renderInlineAsText(a.children,t,u),r.renderToken(n,e,t)};an.hardbreak=function(n,e,t){return t.xhtmlOut?`<br />
`:`<br>
`};an.softbreak=function(n,e,t){return t.breaks?t.xhtmlOut?`<br />
`:`<br>
`:`
`};an.text=function(n,e){return bn(n[e].content)};an.html_block=function(n,e){return n[e].content};an.html_inline=function(n,e){return n[e].content};function Rn(){this.rules=Zn({},an)}Rn.prototype.renderAttrs=function(e){let t,u,r;if(!e.attrs)return"";for(r="",t=0,u=e.attrs.length;t<u;t++)r+=" "+bn(e.attrs[t][0])+'="'+bn(e.attrs[t][1])+'"';return r};Rn.prototype.renderToken=function(e,t,u){const r=e[t];let a="";if(r.hidden)return"";r.block&&r.nesting!==-1&&t&&e[t-1].hidden&&(a+=`
`),a+=(r.nesting===-1?"</":"<")+r.tag,a+=this.renderAttrs(r),r.nesting===0&&u.xhtmlOut&&(a+=" /");let o=!1;if(r.block&&(o=!0,r.nesting===1&&t+1<e.length)){const i=e[t+1];(i.type==="inline"||i.hidden||i.nesting===-1&&i.tag===r.tag)&&(o=!1)}return a+=o?`>
`:">",a};Rn.prototype.renderInline=function(n,e,t){let u="";const r=this.rules;for(let a=0,o=n.length;a<o;a++){const i=n[a].type;typeof r[i]<"u"?u+=r[i](n,a,e,t,this):u+=this.renderToken(n,a,e)}return u};Rn.prototype.renderInlineAsText=function(n,e,t){let u="";for(let r=0,a=n.length;r<a;r++)switch(n[r].type){case"text":u+=n[r].content;break;case"image":u+=this.renderInlineAsText(n[r].children,e,t);break;case"html_inline":case"html_block":u+=n[r].content;break;case"softbreak":case"hardbreak":u+=`
`;break}return u};Rn.prototype.render=function(n,e,t){let u="";const r=this.rules;for(let a=0,o=n.length;a<o;a++){const i=n[a].type;i==="inline"?u+=this.renderInline(n[a].children,e,t):typeof r[i]<"u"?u+=r[i](n,a,e,t,this):u+=this.renderToken(n,a,e,t)}return u};function K(){this.__rules__=[],this.__cache__=null}K.prototype.__find__=function(n){for(let e=0;e<this.__rules__.length;e++)if(this.__rules__[e].name===n)return e;return-1};K.prototype.__compile__=function(){const n=this,e=[""];n.__rules__.forEach(function(t){t.enabled&&t.alt.forEach(function(u){e.indexOf(u)<0&&e.push(u)})}),n.__cache__={},e.forEach(function(t){n.__cache__[t]=[],n.__rules__.forEach(function(u){u.enabled&&(t&&u.alt.indexOf(t)<0||n.__cache__[t].push(u.fn))})})};K.prototype.at=function(n,e,t){const u=this.__find__(n),r=t||{};if(u===-1)throw new Error("Parser rule not found: "+n);this.__rules__[u].fn=e,this.__rules__[u].alt=r.alt||[],this.__cache__=null};K.prototype.before=function(n,e,t,u){const r=this.__find__(n),a=u||{};if(r===-1)throw new Error("Parser rule not found: "+n);this.__rules__.splice(r,0,{name:e,enabled:!0,fn:t,alt:a.alt||[]}),this.__cache__=null};K.prototype.after=function(n,e,t,u){const r=this.__find__(n),a=u||{};if(r===-1)throw new Error("Parser rule not found: "+n);this.__rules__.splice(r+1,0,{name:e,enabled:!0,fn:t,alt:a.alt||[]}),this.__cache__=null};K.prototype.push=function(n,e,t){const u=t||{};this.__rules__.push({name:n,enabled:!0,fn:e,alt:u.alt||[]}),this.__cache__=null};K.prototype.enable=function(n,e){Array.isArray(n)||(n=[n]);const t=[];return n.forEach(function(u){const r=this.__find__(u);if(r<0){if(e)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[r].enabled=!0,t.push(u)},this),this.__cache__=null,t};K.prototype.enableOnly=function(n,e){Array.isArray(n)||(n=[n]),this.__rules__.forEach(function(t){t.enabled=!1}),this.enable(n,e)};K.prototype.disable=function(n,e){Array.isArray(n)||(n=[n]);const t=[];return n.forEach(function(u){const r=this.__find__(u);if(r<0){if(e)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[r].enabled=!1,t.push(u)},this),this.__cache__=null,t};K.prototype.getRules=function(n){return this.__cache__===null&&this.__compile__(),this.__cache__[n]||[]};function X(n,e,t){this.type=n,this.tag=e,this.attrs=null,this.map=null,this.nesting=t,this.level=0,this.children=null,this.content="",this.markup="",this.info="",this.meta=null,this.block=!1,this.hidden=!1}X.prototype.attrIndex=function(e){if(!this.attrs)return-1;const t=this.attrs;for(let u=0,r=t.length;u<r;u++)if(t[u][0]===e)return u;return-1};X.prototype.attrPush=function(e){this.attrs?this.attrs.push(e):this.attrs=[e]};X.prototype.attrSet=function(e,t){const u=this.attrIndex(e),r=[e,t];u<0?this.attrPush(r):this.attrs[u]=r};X.prototype.attrGet=function(e){const t=this.attrIndex(e);let u=null;return t>=0&&(u=this.attrs[t][1]),u};X.prototype.attrJoin=function(e,t){const u=this.attrIndex(e);u<0?this.attrPush([e,t]):this.attrs[u][1]=this.attrs[u][1]+" "+t};function vt(n,e,t){this.src=n,this.env=t,this.tokens=[],this.inlineMode=!1,this.md=e}vt.prototype.Token=X;const pa=/\r\n?|\n/g,fa=/\0/g;function ba(n){let e;e=n.src.replace(pa,`
`),e=e.replace(fa,"�"),n.src=e}function ma(n){let e;n.inlineMode?(e=new n.Token("inline","",0),e.content=n.src,e.map=[0,1],e.children=[],n.tokens.push(e)):n.md.block.parse(n.src,n.md,n.env,n.tokens)}function ga(n){const e=n.tokens;for(let t=0,u=e.length;t<u;t++){const r=e[t];r.type==="inline"&&n.md.inline.parse(r.content,n.md,n.env,r.children)}}function Ea(n){return/^<a[>\s]/i.test(n)}function ha(n){return/^<\/a\s*>/i.test(n)}function _a(n){const e=n.tokens;if(n.md.options.linkify)for(let t=0,u=e.length;t<u;t++){if(e[t].type!=="inline"||!n.md.linkify.pretest(e[t].content))continue;let r=e[t].children,a=0;for(let o=r.length-1;o>=0;o--){const i=r[o];if(i.type==="link_close"){for(o--;r[o].level!==i.level&&r[o].type!=="link_open";)o--;continue}if(i.type==="html_inline"&&(Ea(i.content)&&a>0&&a--,ha(i.content)&&a++),!(a>0)&&i.type==="text"&&n.md.linkify.test(i.content)){const c=i.content;let s=n.md.linkify.match(c);const l=[];let f=i.level,b=0;s.length>0&&s[0].index===0&&o>0&&r[o-1].type==="text_special"&&(s=s.slice(1));for(let d=0;d<s.length;d++){const p=s[d].url,g=n.md.normalizeLink(p);if(!n.md.validateLink(g))continue;let h=s[d].text;s[d].schema?s[d].schema==="mailto:"&&!/^mailto:/i.test(h)?h=n.md.normalizeLinkText("mailto:"+h).replace(/^mailto:/,""):h=n.md.normalizeLinkText(h):h=n.md.normalizeLinkText("http://"+h).replace(/^http:\/\//,"");const v=s[d].index;if(v>b){const A=new n.Token("text","",0);A.content=c.slice(b,v),A.level=f,l.push(A)}const _=new n.Token("link_open","a",1);_.attrs=[["href",g]],_.level=f++,_.markup="linkify",_.info="auto",l.push(_);const T=new n.Token("text","",0);T.content=h,T.level=f,l.push(T);const D=new n.Token("link_close","a",-1);D.level=--f,D.markup="linkify",D.info="auto",l.push(D),b=s[d].lastIndex}if(b<c.length){const d=new n.Token("text","",0);d.content=c.slice(b),d.level=f,l.push(d)}e[t].children=r=Ct(r,o,l)}}}}const Rt=/\+-|\.\.|\?\?\?\?|!!!!|,,|--/,Ta=/\((c|tm|r)\)/i,Aa=/\((c|tm|r)\)/ig,Sa={c:"©",r:"®",tm:"™"};function Da(n,e){return Sa[e.toLowerCase()]}function xa(n){let e=0;for(let t=n.length-1;t>=0;t--){const u=n[t];u.type==="text"&&!e&&(u.content=u.content.replace(Aa,Da)),u.type==="link_open"&&u.info==="auto"&&e--,u.type==="link_close"&&u.info==="auto"&&e++}}function Ca(n){let e=0;for(let t=n.length-1;t>=0;t--){const u=n[t];u.type==="text"&&!e&&Rt.test(u.content)&&(u.content=u.content.replace(/\+-/g,"±").replace(/\.{2,}/g,"…").replace(/([?!])…/g,"$1..").replace(/([?!]){4,}/g,"$1$1$1").replace(/,{2,}/g,",").replace(/(^|[^-])---(?=[^-]|$)/mg,"$1—").replace(/(^|\s)--(?=\s|$)/mg,"$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg,"$1–")),u.type==="link_open"&&u.info==="auto"&&e--,u.type==="link_close"&&u.info==="auto"&&e++}}function ya(n){let e;if(n.md.options.typographer)for(e=n.tokens.length-1;e>=0;e--)n.tokens[e].type==="inline"&&(Ta.test(n.tokens[e].content)&&xa(n.tokens[e].children),Rt.test(n.tokens[e].content)&&Ca(n.tokens[e].children))}const Ia=/['"]/,We=/['"]/g,$e="’";function zn(n,e,t,u){n[e]||(n[e]=[]),n[e].push({pos:t,ch:u})}function va(n,e){let t="",u=0;e.sort((r,a)=>r.pos-a.pos);for(let r=0;r<e.length;r++){const a=e[r];t+=n.slice(u,a.pos)+a.ch,u=a.pos+1}return t+n.slice(u)}function Ra(n,e){let t;const u=[],r={};for(let a=0;a<n.length;a++){const o=n[a],i=n[a].level;for(t=u.length-1;t>=0&&!(u[t].level<=i);t--);if(u.length=t+1,o.type!=="text")continue;const c=o.content;let s=0;const l=c.length;n:for(;s<l;){We.lastIndex=s;const f=We.exec(c);if(!f)break;let b=!0,d=!0;s=f.index+1;const p=f[0]==="'";let g=32;if(f.index-1>=0)g=c.charCodeAt(f.index-1);else for(t=a-1;t>=0&&!(n[t].type==="softbreak"||n[t].type==="hardbreak");t--)if(n[t].content){g=n[t].content.charCodeAt(n[t].content.length-1);break}let h=32;if(s<l)h=c.charCodeAt(s);else for(t=a+1;t<n.length&&!(n[t].type==="softbreak"||n[t].type==="hardbreak");t++)if(n[t].content){h=n[t].content.charCodeAt(0);break}const v=Nn(g)||On(g),_=Nn(h)||On(h),T=Ln(g),D=Ln(h);if(D?b=!1:_&&(T||v||(b=!1)),T?d=!1:v&&(D||_||(d=!1)),h===34&&f[0]==='"'&&g>=48&&g<=57&&(d=b=!1),b&&d&&(b=v,d=_),!b&&!d){p&&zn(r,a,f.index,$e);continue}if(d)for(t=u.length-1;t>=0;t--){let A=u[t];if(u[t].level<i)break;if(A.single===p&&u[t].level===i){A=u[t];let y,O;p?(y=e.md.options.quotes[2],O=e.md.options.quotes[3]):(y=e.md.options.quotes[0],O=e.md.options.quotes[1]),zn(r,a,f.index,O),zn(r,A.token,A.pos,y),u.length=t;continue n}}b?u.push({token:a,pos:f.index,single:p,level:i}):d&&p&&zn(r,a,f.index,$e)}}Object.keys(r).forEach(function(a){n[a].content=va(n[a].content,r[a])})}function ka(n){if(n.md.options.typographer)for(let e=n.tokens.length-1;e>=0;e--)n.tokens[e].type!=="inline"||!Ia.test(n.tokens[e].content)||Ra(n.tokens[e].children,n)}function La(n){let e,t;const u=n.tokens,r=u.length;for(let a=0;a<r;a++){if(u[a].type!=="inline")continue;const o=u[a].children,i=o.length;for(e=0;e<i;e++)o[e].type==="text_special"&&(o[e].type="text");for(e=t=0;e<i;e++)o[e].type==="text"&&e+1<i&&o[e+1].type==="text"?o[e+1].content=o[e].content+o[e+1].content:(e!==t&&(o[t]=o[e]),t++);e!==t&&(o.length=t)}}const se=[["normalize",ba],["block",ma],["inline",ga],["linkify",_a],["replacements",ya],["smartquotes",ka],["text_join",La]];function De(){this.ruler=new K;for(let n=0;n<se.length;n++)this.ruler.push(se[n][0],se[n][1])}De.prototype.process=function(n){const e=this.ruler.getRules("");for(let t=0,u=e.length;t<u;t++)e[t](n)};De.prototype.State=vt;function on(n,e,t,u){this.src=n,this.md=e,this.env=t,this.tokens=u,this.bMarks=[],this.eMarks=[],this.tShift=[],this.sCount=[],this.bsCount=[],this.blkIndent=0,this.line=0,this.lineMax=0,this.tight=!1,this.ddIndent=-1,this.listIndent=-1,this.parentType="root",this.level=0;const r=this.src;for(let a=0,o=0,i=0,c=0,s=r.length,l=!1;o<s;o++){const f=r.charCodeAt(o);if(!l)if(w(f)){i++,f===9?c+=4-c%4:c++;continue}else l=!0;(f===10||o===s-1)&&(f!==10&&o++,this.bMarks.push(a),this.eMarks.push(o),this.tShift.push(i),this.sCount.push(c),this.bsCount.push(0),l=!1,i=0,c=0,a=o+1)}this.bMarks.push(r.length),this.eMarks.push(r.length),this.tShift.push(0),this.sCount.push(0),this.bsCount.push(0),this.lineMax=this.bMarks.length-1}on.prototype.push=function(n,e,t){const u=new X(n,e,t);return u.block=!0,t<0&&this.level--,u.level=this.level,t>0&&this.level++,this.tokens.push(u),u};on.prototype.isEmpty=function(e){return this.bMarks[e]+this.tShift[e]>=this.eMarks[e]};on.prototype.skipEmptyLines=function(e){for(let t=this.lineMax;e<t&&!(this.bMarks[e]+this.tShift[e]<this.eMarks[e]);e++);return e};on.prototype.skipSpaces=function(e){for(let t=this.src.length;e<t;e++){const u=this.src.charCodeAt(e);if(!w(u))break}return e};on.prototype.skipSpacesBack=function(e,t){if(e<=t)return e;for(;e>t;)if(!w(this.src.charCodeAt(--e)))return e+1;return e};on.prototype.skipChars=function(e,t){for(let u=this.src.length;e<u&&this.src.charCodeAt(e)===t;e++);return e};on.prototype.skipCharsBack=function(e,t,u){if(e<=u)return e;for(;e>u;)if(t!==this.src.charCodeAt(--e))return e+1;return e};on.prototype.getLines=function(e,t,u,r){if(e>=t)return"";const a=new Array(t-e);for(let o=0,i=e;i<t;i++,o++){let c=0;const s=this.bMarks[i];let l=s,f;for(i+1<t||r?f=this.eMarks[i]+1:f=this.eMarks[i];l<f&&c<u;){const b=this.src.charCodeAt(l);if(w(b))b===9?c+=4-(c+this.bsCount[i])%4:c++;else if(l-s<this.tShift[i])c++;else break;l++}c>u?a[o]=new Array(c-u+1).join(" ")+this.src.slice(l,f):a[o]=this.src.slice(l,f)}return a.join("")};on.prototype.Token=X;const Oa=65536;function le(n,e){const t=n.bMarks[e]+n.tShift[e],u=n.eMarks[e];return n.src.slice(t,u)}function Ye(n){const e=[],t=n.length;let u=0,r=n.charCodeAt(u),a=!1,o=0,i="";for(;u<t;)r===124&&(a?(i+=n.substring(o,u-1),o=u):(e.push(i+n.substring(o,u)),i="",o=u+1)),a=r===92,u++,r=n.charCodeAt(u);return e.push(i+n.substring(o)),e}function Na(n,e,t,u){if(e+2>t)return!1;let r=e+1;if(n.sCount[r]<n.blkIndent||n.sCount[r]-n.blkIndent>=4)return!1;let a=n.bMarks[r]+n.tShift[r];if(a>=n.eMarks[r])return!1;const o=n.src.charCodeAt(a++);if(o!==124&&o!==45&&o!==58||a>=n.eMarks[r])return!1;const i=n.src.charCodeAt(a++);if(i!==124&&i!==45&&i!==58&&!w(i)||o===45&&w(i))return!1;for(;a<n.eMarks[r];){const D=n.src.charCodeAt(a);if(D!==124&&D!==45&&D!==58&&!w(D))return!1;a++}let c=le(n,e+1),s=c.split("|");const l=[];for(let D=0;D<s.length;D++){const A=s[D].trim();if(!A){if(D===0||D===s.length-1)continue;return!1}if(!/^:?-+:?$/.test(A))return!1;A.charCodeAt(A.length-1)===58?l.push(A.charCodeAt(0)===58?"center":"right"):A.charCodeAt(0)===58?l.push("left"):l.push("")}if(c=le(n,e).trim(),c.indexOf("|")===-1||n.sCount[e]-n.blkIndent>=4)return!1;s=Ye(c),s.length&&s[0]===""&&s.shift(),s.length&&s[s.length-1]===""&&s.pop();const f=s.length;if(f===0||f!==l.length)return!1;if(u)return!0;const b=n.parentType;n.parentType="table";const d=n.md.block.ruler.getRules("blockquote"),p=n.push("table_open","table",1),g=[e,0];p.map=g;const h=n.push("thead_open","thead",1);h.map=[e,e+1];const v=n.push("tr_open","tr",1);v.map=[e,e+1];for(let D=0;D<s.length;D++){const A=n.push("th_open","th",1);l[D]&&(A.attrs=[["style","text-align:"+l[D]]]);const y=n.push("inline","",0);y.content=s[D].trim(),y.children=[],n.push("th_close","th",-1)}n.push("tr_close","tr",-1),n.push("thead_close","thead",-1);let _,T=0;for(r=e+2;r<t&&!(n.sCount[r]<n.blkIndent);r++){let D=!1;for(let y=0,O=d.length;y<O;y++)if(d[y](n,r,t,!0)){D=!0;break}if(D||(c=le(n,r).trim(),!c)||n.sCount[r]-n.blkIndent>=4||(s=Ye(c),s.length&&s[0]===""&&s.shift(),s.length&&s[s.length-1]===""&&s.pop(),T+=f-s.length,T>Oa))break;if(r===e+2){const y=n.push("tbody_open","tbody",1);y.map=_=[e+2,0]}const A=n.push("tr_open","tr",1);A.map=[r,r+1];for(let y=0;y<f;y++){const O=n.push("td_open","td",1);l[y]&&(O.attrs=[["style","text-align:"+l[y]]]);const M=n.push("inline","",0);M.content=s[y]?s[y].trim():"",M.children=[],n.push("td_close","td",-1)}n.push("tr_close","tr",-1)}return _&&(n.push("tbody_close","tbody",-1),_[1]=r),n.push("table_close","table",-1),g[1]=r,n.parentType=b,n.line=r,!0}function Ma(n,e,t){if(n.sCount[e]-n.blkIndent<4)return!1;let u=e+1,r=u;for(;u<t;){if(n.isEmpty(u)){u++;continue}if(n.sCount[u]-n.blkIndent>=4){u++,r=u;continue}break}n.line=r;const a=n.push("code_block","code",0);return a.content=n.getLines(e,r,4+n.blkIndent,!1)+`
`,a.map=[e,n.line],!0}function Pa(n,e,t,u){let r=n.bMarks[e]+n.tShift[e],a=n.eMarks[e];if(n.sCount[e]-n.blkIndent>=4||r+3>a)return!1;const o=n.src.charCodeAt(r);if(o!==126&&o!==96)return!1;let i=r;r=n.skipChars(r,o);let c=r-i;if(c<3)return!1;const s=n.src.slice(i,r),l=n.src.slice(r,a);if(o===96&&l.indexOf(String.fromCharCode(o))>=0)return!1;if(u)return!0;let f=e,b=!1;for(;f++,!(f>=t||(r=i=n.bMarks[f]+n.tShift[f],a=n.eMarks[f],r<a&&n.sCount[f]<n.blkIndent));)if(n.src.charCodeAt(r)===o&&!(n.sCount[f]-n.blkIndent>=4)&&(r=n.skipChars(r,o),!(r-i<c)&&(r=n.skipSpaces(r),!(r<a)))){b=!0;break}c=n.sCount[e],n.line=f+(b?1:0);const d=n.push("fence","code",0);return d.info=l,d.content=n.getLines(e+1,f,c,!0),d.markup=s,d.map=[e,n.line],!0}function wa(n,e,t,u){let r=n.bMarks[e]+n.tShift[e],a=n.eMarks[e];const o=n.lineMax;if(n.sCount[e]-n.blkIndent>=4||n.src.charCodeAt(r)!==62)return!1;if(u)return!0;const i=[],c=[],s=[],l=[],f=n.md.block.ruler.getRules("blockquote"),b=n.parentType;n.parentType="blockquote";let d=!1,p;for(p=e;p<t;p++){const T=n.sCount[p]<n.blkIndent;if(r=n.bMarks[p]+n.tShift[p],a=n.eMarks[p],r>=a)break;if(n.src.charCodeAt(r++)===62&&!T){let A=n.sCount[p]+1,y,O;n.src.charCodeAt(r)===32?(r++,A++,O=!1,y=!0):n.src.charCodeAt(r)===9?(y=!0,(n.bsCount[p]+A)%4===3?(r++,A++,O=!1):O=!0):y=!1;let M=A;for(i.push(n.bMarks[p]),n.bMarks[p]=r;r<a;){const B=n.src.charCodeAt(r);if(w(B))B===9?M+=4-(M+n.bsCount[p]+(O?1:0))%4:M++;else break;r++}d=r>=a,c.push(n.bsCount[p]),n.bsCount[p]=n.sCount[p]+1+(y?1:0),s.push(n.sCount[p]),n.sCount[p]=M-A,l.push(n.tShift[p]),n.tShift[p]=r-n.bMarks[p];continue}if(d)break;let D=!1;for(let A=0,y=f.length;A<y;A++)if(f[A](n,p,t,!0)){D=!0;break}if(D){n.lineMax=p,n.blkIndent!==0&&(i.push(n.bMarks[p]),c.push(n.bsCount[p]),l.push(n.tShift[p]),s.push(n.sCount[p]),n.sCount[p]-=n.blkIndent);break}i.push(n.bMarks[p]),c.push(n.bsCount[p]),l.push(n.tShift[p]),s.push(n.sCount[p]),n.sCount[p]=-1}const g=n.blkIndent;n.blkIndent=0;const h=n.push("blockquote_open","blockquote",1);h.markup=">";const v=[e,0];h.map=v,n.md.block.tokenize(n,e,p);const _=n.push("blockquote_close","blockquote",-1);_.markup=">",n.lineMax=o,n.parentType=b,v[1]=n.line;for(let T=0;T<l.length;T++)n.bMarks[T+e]=i[T],n.tShift[T+e]=l[T],n.sCount[T+e]=s[T],n.bsCount[T+e]=c[T];return n.blkIndent=g,!0}function Ba(n,e,t,u){const r=n.eMarks[e];if(n.sCount[e]-n.blkIndent>=4)return!1;let a=n.bMarks[e]+n.tShift[e];const o=n.src.charCodeAt(a++);if(o!==42&&o!==45&&o!==95)return!1;let i=1;for(;a<r;){const s=n.src.charCodeAt(a++);if(s!==o&&!w(s))return!1;s===o&&i++}if(i<3)return!1;if(u)return!0;n.line=e+1;const c=n.push("hr","hr",0);return c.map=[e,n.line],c.markup=Array(i+1).join(String.fromCharCode(o)),!0}function Qe(n,e){const t=n.eMarks[e];let u=n.bMarks[e]+n.tShift[e];const r=n.src.charCodeAt(u++);if(r!==42&&r!==45&&r!==43)return-1;if(u<t){const a=n.src.charCodeAt(u);if(!w(a))return-1}return u}function Ze(n,e){const t=n.bMarks[e]+n.tShift[e],u=n.eMarks[e];let r=t;if(r+1>=u)return-1;let a=n.src.charCodeAt(r++);if(a<48||a>57)return-1;for(;;){if(r>=u)return-1;if(a=n.src.charCodeAt(r++),a>=48&&a<=57){if(r-t>=10)return-1;continue}if(a===41||a===46)break;return-1}return r<u&&(a=n.src.charCodeAt(r),!w(a))?-1:r}function Fa(n,e){const t=n.level+2;for(let u=e+2,r=n.tokens.length-2;u<r;u++)n.tokens[u].level===t&&n.tokens[u].type==="paragraph_open"&&(n.tokens[u+2].hidden=!0,n.tokens[u].hidden=!0,u+=2)}function Ua(n,e,t,u){let r,a,o,i,c=e,s=!0;if(n.sCount[c]-n.blkIndent>=4||n.listIndent>=0&&n.sCount[c]-n.listIndent>=4&&n.sCount[c]<n.blkIndent)return!1;let l=!1;u&&n.parentType==="paragraph"&&n.sCount[c]>=n.blkIndent&&(l=!0);let f,b,d;if((d=Ze(n,c))>=0){if(f=!0,o=n.bMarks[c]+n.tShift[c],b=Number(n.src.slice(o,d-1)),l&&b!==1)return!1}else if((d=Qe(n,c))>=0)f=!1;else return!1;if(l&&n.skipSpaces(d)>=n.eMarks[c])return!1;if(u)return!0;const p=n.src.charCodeAt(d-1),g=n.tokens.length;f?(i=n.push("ordered_list_open","ol",1),b!==1&&(i.attrs=[["start",b]])):i=n.push("bullet_list_open","ul",1);const h=[c,0];i.map=h,i.markup=String.fromCharCode(p);let v=!1;const _=n.md.block.ruler.getRules("list"),T=n.parentType;for(n.parentType="list";c<t;){a=d,r=n.eMarks[c];const D=n.sCount[c]+d-(n.bMarks[c]+n.tShift[c]);let A=D;for(;a<r;){const $=n.src.charCodeAt(a);if($===9)A+=4-(A+n.bsCount[c])%4;else if($===32)A++;else break;a++}const y=a;let O;y>=r?O=1:O=A-D,O>4&&(O=1);const M=D+O;i=n.push("list_item_open","li",1),i.markup=String.fromCharCode(p);const B=[c,0];i.map=B,f&&(i.info=n.src.slice(o,d-1));const W=n.tight,cn=n.tShift[c],mn=n.sCount[c],gn=n.listIndent;if(n.listIndent=n.blkIndent,n.blkIndent=M,n.tight=!0,n.tShift[c]=y-n.bMarks[c],n.sCount[c]=A,y>=r&&n.isEmpty(c+1)?n.line=Math.min(n.line+2,t):n.md.block.tokenize(n,c,t,!0),(!n.tight||v)&&(s=!1),v=n.line-c>1&&n.isEmpty(n.line-1),n.blkIndent=n.listIndent,n.listIndent=gn,n.tShift[c]=cn,n.sCount[c]=mn,n.tight=W,i=n.push("list_item_close","li",-1),i.markup=String.fromCharCode(p),c=n.line,B[1]=c,c>=t||n.sCount[c]<n.blkIndent||n.sCount[c]-n.blkIndent>=4)break;let Z=!1;for(let $=0,m=_.length;$<m;$++)if(_[$](n,c,t,!0)){Z=!0;break}if(Z)break;if(f){if(d=Ze(n,c),d<0)break;o=n.bMarks[c]+n.tShift[c]}else if(d=Qe(n,c),d<0)break;if(p!==n.src.charCodeAt(d-1))break}return f?i=n.push("ordered_list_close","ol",-1):i=n.push("bullet_list_close","ul",-1),i.markup=String.fromCharCode(p),h[1]=c,n.line=c,n.parentType=T,s&&Fa(n,g),!0}function ja(n,e,t,u){let r=n.bMarks[e]+n.tShift[e],a=n.eMarks[e],o=e+1;if(n.sCount[e]-n.blkIndent>=4||n.src.charCodeAt(r)!==91)return!1;function i(_){const T=n.lineMax;if(_>=T||n.isEmpty(_))return null;let D=!1;if(n.sCount[_]-n.blkIndent>3&&(D=!0),n.sCount[_]<0&&(D=!0),!D){const O=n.md.block.ruler.getRules("reference"),M=n.parentType;n.parentType="reference";let B=!1;for(let W=0,cn=O.length;W<cn;W++)if(O[W](n,_,T,!0)){B=!0;break}if(n.parentType=M,B)return null}const A=n.bMarks[_]+n.tShift[_],y=n.eMarks[_];return n.src.slice(A,y+1)}let c=n.src.slice(r,a+1);a=c.length;let s=-1;for(r=1;r<a;r++){const _=c.charCodeAt(r);if(_===91)return!1;if(_===93){s=r;break}else if(_===10){const T=i(o);T!==null&&(c+=T,a=c.length,o++)}else if(_===92&&(r++,r<a&&c.charCodeAt(r)===10)){const T=i(o);T!==null&&(c+=T,a=c.length,o++)}}if(s<0||c.charCodeAt(s+1)!==58)return!1;for(r=s+2;r<a;r++){const _=c.charCodeAt(r);if(_===10){const T=i(o);T!==null&&(c+=T,a=c.length,o++)}else if(!w(_))break}const l=n.md.helpers.parseLinkDestination(c,r,a);if(!l.ok)return!1;const f=n.md.normalizeLink(l.str);if(!n.md.validateLink(f))return!1;r=l.pos;const b=r,d=o,p=r;for(;r<a;r++){const _=c.charCodeAt(r);if(_===10){const T=i(o);T!==null&&(c+=T,a=c.length,o++)}else if(!w(_))break}let g=n.md.helpers.parseLinkTitle(c,r,a);for(;g.can_continue;){const _=i(o);if(_===null)break;c+=_,r=a,a=c.length,o++,g=n.md.helpers.parseLinkTitle(c,r,a,g)}let h;for(r<a&&p!==r&&g.ok?(h=g.str,r=g.pos):(h="",r=b,o=d);r<a;){const _=c.charCodeAt(r);if(!w(_))break;r++}if(r<a&&c.charCodeAt(r)!==10&&h)for(h="",r=b,o=d;r<a;){const _=c.charCodeAt(r);if(!w(_))break;r++}if(r<a&&c.charCodeAt(r)!==10)return!1;const v=Xn(c.slice(1,s));return v?(u||(typeof n.env.references>"u"&&(n.env.references={}),typeof n.env.references[v]>"u"&&(n.env.references[v]={title:h,href:f}),n.line=o),!0):!1}const Ha=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],qa="[a-zA-Z_:][a-zA-Z0-9:._-]*",za="[^\"'=<>`\\x00-\\x20]+",Ja="'[^']*'",Ka='"[^"]*"',Ga="(?:"+za+"|"+Ja+"|"+Ka+")",Va="(?:\\s+"+qa+"(?:\\s*=\\s*"+Ga+")?)",kt="<[A-Za-z][A-Za-z0-9\\-]*"+Va+"*\\s*\\/?>",Lt="<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>",Wa="<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->",$a="<[?][\\s\\S]*?[?]>",Ya="<![A-Za-z][^>]*>",Qa="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",Za=new RegExp("^(?:"+kt+"|"+Lt+"|"+Wa+"|"+$a+"|"+Ya+"|"+Qa+")"),Xa=new RegExp("^(?:"+kt+"|"+Lt+")"),_n=[[/^<(script|pre|style|textarea)(?=(\s|>|$))/i,/<\/(script|pre|style|textarea)>/i,!0],[/^<!--/,/-->/,!0],[/^<\?/,/\?>/,!0],[/^<![A-Z]/,/>/,!0],[/^<!\[CDATA\[/,/\]\]>/,!0],[new RegExp("^</?("+Ha.join("|")+")(?=(\\s|/?>|$))","i"),/^$/,!0],[new RegExp(Xa.source+"\\s*$"),/^$/,!1]];function ni(n,e,t,u){let r=n.bMarks[e]+n.tShift[e],a=n.eMarks[e];if(n.sCount[e]-n.blkIndent>=4||!n.md.options.html||n.src.charCodeAt(r)!==60)return!1;let o=n.src.slice(r,a),i=0;for(;i<_n.length&&!_n[i][0].test(o);i++);if(i===_n.length)return!1;if(u)return _n[i][2];let c=e+1;const s=_n[i][1].test("");if(!_n[i][1].test(o)){for(;c<t&&!(n.sCount[c]<n.blkIndent&&(s||!n.isEmpty(c)));c++)if(r=n.bMarks[c]+n.tShift[c],a=n.eMarks[c],o=n.src.slice(r,a),_n[i][1].test(o)){o.length!==0&&c++;break}}n.line=c;const l=n.push("html_block","",0);return l.map=[e,c],l.content=n.getLines(e,c,n.blkIndent,!0),!0}function ei(n,e,t,u){let r=n.bMarks[e]+n.tShift[e],a=n.eMarks[e];if(n.sCount[e]-n.blkIndent>=4)return!1;let o=n.src.charCodeAt(r);if(o!==35||r>=a)return!1;let i=1;for(o=n.src.charCodeAt(++r);o===35&&r<a&&i<=6;)i++,o=n.src.charCodeAt(++r);if(i>6||r<a&&!w(o))return!1;if(u)return!0;a=n.skipSpacesBack(a,r);const c=n.skipCharsBack(a,35,r);c>r&&w(n.src.charCodeAt(c-1))&&(a=c),n.line=e+1;const s=n.push("heading_open","h"+String(i),1);s.markup="########".slice(0,i),s.map=[e,n.line];const l=n.push("inline","",0);l.content=ne(n.src.slice(r,a)),l.map=[e,n.line],l.children=[];const f=n.push("heading_close","h"+String(i),-1);return f.markup="########".slice(0,i),!0}function ti(n,e,t){const u=n.md.block.ruler.getRules("paragraph");if(n.sCount[e]-n.blkIndent>=4)return!1;const r=n.parentType;n.parentType="paragraph";let a=0,o,i=e+1;for(;i<t&&!n.isEmpty(i);i++){if(n.sCount[i]-n.blkIndent>3)continue;if(n.sCount[i]>=n.blkIndent){let d=n.bMarks[i]+n.tShift[i];const p=n.eMarks[i];if(d<p&&(o=n.src.charCodeAt(d),(o===45||o===61)&&(d=n.skipChars(d,o),d=n.skipSpaces(d),d>=p))){a=o===61?1:2;break}}if(n.sCount[i]<0)continue;let b=!1;for(let d=0,p=u.length;d<p;d++)if(u[d](n,i,t,!0)){b=!0;break}if(b)break}if(!a)return n.parentType=r,!1;const c=ne(n.getLines(e,i,n.blkIndent,!1));n.line=i+1;const s=n.push("heading_open","h"+String(a),1);s.markup=String.fromCharCode(o),s.map=[e,n.line];const l=n.push("inline","",0);l.content=c,l.map=[e,n.line-1],l.children=[];const f=n.push("heading_close","h"+String(a),-1);return f.markup=String.fromCharCode(o),n.parentType=r,!0}function ui(n,e,t){const u=n.md.block.ruler.getRules("paragraph"),r=n.parentType;let a=e+1;for(n.parentType="paragraph";a<t&&!n.isEmpty(a);a++){if(n.sCount[a]-n.blkIndent>3||n.sCount[a]<0)continue;let s=!1;for(let l=0,f=u.length;l<f;l++)if(u[l](n,a,t,!0)){s=!0;break}if(s)break}const o=ne(n.getLines(e,a,n.blkIndent,!1));n.line=a;const i=n.push("paragraph_open","p",1);i.map=[e,n.line];const c=n.push("inline","",0);return c.content=o,c.map=[e,n.line],c.children=[],n.push("paragraph_close","p",-1),n.parentType=r,!0}const Jn=[["table",Na,["paragraph","reference"]],["code",Ma],["fence",Pa,["paragraph","reference","blockquote","list"]],["blockquote",wa,["paragraph","reference","blockquote","list"]],["hr",Ba,["paragraph","reference","blockquote","list"]],["list",Ua,["paragraph","reference","blockquote"]],["reference",ja],["html_block",ni,["paragraph","reference","blockquote"]],["heading",ei,["paragraph","reference","blockquote"]],["lheading",ti],["paragraph",ui]];function ee(){this.ruler=new K;for(let n=0;n<Jn.length;n++)this.ruler.push(Jn[n][0],Jn[n][1],{alt:(Jn[n][2]||[]).slice()})}ee.prototype.tokenize=function(n,e,t){const u=this.ruler.getRules(""),r=u.length,a=n.md.options.maxNesting;let o=e,i=!1;for(;o<t&&(n.line=o=n.skipEmptyLines(o),!(o>=t||n.sCount[o]<n.blkIndent));){if(n.level>=a){n.line=t;break}const c=n.line;let s=!1;for(let l=0;l<r;l++)if(s=u[l](n,o,t,!1),s){if(c>=n.line)throw new Error("block rule didn't increment state.line");break}if(!s)throw new Error("none of the block rules matched");n.tight=!i,n.isEmpty(n.line-1)&&(i=!0),o=n.line,o<t&&n.isEmpty(o)&&(i=!0,o++,n.line=o)}};ee.prototype.parse=function(n,e,t,u){if(!n)return;const r=new this.State(n,e,t,u);this.tokenize(r,r.line,r.lineMax)};ee.prototype.State=on;function Fn(n,e,t,u){this.src=n,this.env=t,this.md=e,this.tokens=u,this.tokens_meta=Array(u.length),this.pos=0,this.posMax=this.src.length,this.level=0,this.pending="",this.pendingLevel=0,this.cache={},this.delimiters=[],this._prev_delimiters=[],this.backticks={},this.backticksScanned=!1,this.linkLevel=0}Fn.prototype.pushPending=function(){const n=new X("text","",0);return n.content=this.pending,n.level=this.pendingLevel,this.tokens.push(n),this.pending="",n};Fn.prototype.push=function(n,e,t){this.pending&&this.pushPending();const u=new X(n,e,t);let r=null;return t<0&&(this.level--,this.delimiters=this._prev_delimiters.pop()),u.level=this.level,t>0&&(this.level++,this._prev_delimiters.push(this.delimiters),this.delimiters=[],r={delimiters:this.delimiters}),this.pendingLevel=this.level,this.tokens.push(u),this.tokens_meta.push(r),u};Fn.prototype.scanDelims=function(n,e){const t=this.posMax,u=this.src.charCodeAt(n);let r;if(n===0)r=32;else if(n===1)r=this.src.charCodeAt(0),(r&63488)===55296&&(r=65533);else if(r=this.src.charCodeAt(n-1),(r&64512)===56320){const h=this.src.charCodeAt(n-2);r=(h&64512)===55296?65536+(h-55296<<10)+(r-56320):65533}else(r&64512)===55296&&(r=65533);let a=n;for(;a<t&&this.src.charCodeAt(a)===u;)a++;const o=a-n;let i=a<t?this.src.charCodeAt(a):32;if((i&64512)===55296){const h=this.src.charCodeAt(a+1);i=(h&64512)===56320?65536+(i-55296<<10)+(h-56320):65533}else(i&64512)===56320&&(i=65533);const c=Nn(r)||On(r),s=Nn(i)||On(i),l=Ln(r),f=Ln(i),b=!f&&(!s||l||c),d=!l&&(!c||f||s);return{can_open:b&&(e||!d||c),can_close:d&&(e||!b||s),length:o}};Fn.prototype.Token=X;function ri(n){switch(n){case 10:case 33:case 35:case 36:case 37:case 38:case 42:case 43:case 45:case 58:case 60:case 61:case 62:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 125:case 126:return!0;default:return!1}}function ai(n,e){let t=n.pos;for(;t<n.posMax&&!ri(n.src.charCodeAt(t));)t++;return t===n.pos?!1:(e||(n.pending+=n.src.slice(n.pos,t)),n.pos=t,!0)}const ii=/(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;function oi(n,e){if(!n.md.options.linkify||n.linkLevel>0)return!1;const t=n.pos,u=n.posMax;if(t+3>u||n.src.charCodeAt(t)!==58||n.src.charCodeAt(t+1)!==47||n.src.charCodeAt(t+2)!==47)return!1;const r=n.pending.match(ii);if(!r)return!1;const a=r[1],o=n.md.linkify.matchAtStart(n.src.slice(t-a.length));if(!o)return!1;let i=o.url;if(i.length<=a.length)return!1;let c=i.length;for(;c>0&&i.charCodeAt(c-1)===42;)c--;c!==i.length&&(i=i.slice(0,c));const s=n.md.normalizeLink(i);if(!n.md.validateLink(s))return!1;if(!e){n.pending=n.pending.slice(0,-a.length);const l=n.push("link_open","a",1);l.attrs=[["href",s]],l.markup="linkify",l.info="auto";const f=n.push("text","",0);f.content=n.md.normalizeLinkText(i);const b=n.push("link_close","a",-1);b.markup="linkify",b.info="auto"}return n.pos+=i.length-a.length,!0}function ci(n,e){let t=n.pos;if(n.src.charCodeAt(t)!==10)return!1;const u=n.pending.length-1,r=n.posMax;if(!e)if(u>=0&&n.pending.charCodeAt(u)===32)if(u>=1&&n.pending.charCodeAt(u-1)===32){let a=u-1;for(;a>=1&&n.pending.charCodeAt(a-1)===32;)a--;n.pending=n.pending.slice(0,a),n.push("hardbreak","br",0)}else n.pending=n.pending.slice(0,-1),n.push("softbreak","br",0);else n.push("softbreak","br",0);for(t++;t<r&&w(n.src.charCodeAt(t));)t++;return n.pos=t,!0}const xe=[];for(let n=0;n<256;n++)xe.push(0);"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(n){xe[n.charCodeAt(0)]=1});function si(n,e){let t=n.pos;const u=n.posMax;if(n.src.charCodeAt(t)!==92||(t++,t>=u))return!1;let r=n.src.charCodeAt(t);if(r===10){for(e||n.push("hardbreak","br",0),t++;t<u&&(r=n.src.charCodeAt(t),!!w(r));)t++;return n.pos=t,!0}let a=n.src[t];if(r>=55296&&r<=56319&&t+1<u){const i=n.src.charCodeAt(t+1);i>=56320&&i<=57343&&(a+=n.src[t+1],t++)}const o="\\"+a;if(!e){const i=n.push("text_special","",0);r<256&&xe[r]!==0?i.content=a:i.content=o,i.markup=o,i.info="escape"}return n.pos=t+1,!0}function li(n,e){let t=n.pos;if(n.src.charCodeAt(t)!==96)return!1;const r=t;t++;const a=n.posMax;for(;t<a&&n.src.charCodeAt(t)===96;)t++;const o=n.src.slice(r,t),i=o.length;if(n.backticksScanned&&(n.backticks[i]||0)<=r)return e||(n.pending+=o),n.pos+=i,!0;let c=t,s;for(;(s=n.src.indexOf("`",c))!==-1;){for(c=s+1;c<a&&n.src.charCodeAt(c)===96;)c++;const l=c-s;if(l===i){if(!e){const f=n.push("code_inline","code",0);f.markup=o,f.content=n.src.slice(t,s).replace(/\n/g," ").replace(/^ (.+) $/,"$1")}return n.pos=c,!0}n.backticks[l]=s}return n.backticksScanned=!0,e||(n.pending+=o),n.pos+=i,!0}function di(n,e){const t=n.pos,u=n.src.charCodeAt(t);if(e||u!==126)return!1;const r=n.scanDelims(n.pos,!0);let a=r.length;const o=String.fromCharCode(u);if(a<2)return!1;let i;a%2&&(i=n.push("text","",0),i.content=o,a--);for(let c=0;c<a;c+=2)i=n.push("text","",0),i.content=o+o,n.delimiters.push({marker:u,length:0,token:n.tokens.length-1,end:-1,open:r.can_open,close:r.can_close});return n.pos+=r.length,!0}function Xe(n,e){let t;const u=[],r=e.length;for(let a=0;a<r;a++){const o=e[a];if(o.marker!==126||o.end===-1)continue;const i=e[o.end];t=n.tokens[o.token],t.type="s_open",t.tag="s",t.nesting=1,t.markup="~~",t.content="",t=n.tokens[i.token],t.type="s_close",t.tag="s",t.nesting=-1,t.markup="~~",t.content="",n.tokens[i.token-1].type==="text"&&n.tokens[i.token-1].content==="~"&&u.push(i.token-1)}for(;u.length;){const a=u.pop();let o=a+1;for(;o<n.tokens.length&&n.tokens[o].type==="s_close";)o++;o--,a!==o&&(t=n.tokens[o],n.tokens[o]=n.tokens[a],n.tokens[a]=t)}}function pi(n){const e=n.tokens_meta,t=n.tokens_meta.length;Xe(n,n.delimiters);for(let u=0;u<t;u++)e[u]&&e[u].delimiters&&Xe(n,e[u].delimiters)}const Ot={tokenize:di,postProcess:pi};function fi(n,e){const t=n.pos,u=n.src.charCodeAt(t);if(e||u!==95&&u!==42)return!1;const r=n.scanDelims(n.pos,u===42);for(let a=0;a<r.length;a++){const o=n.push("text","",0);o.content=String.fromCharCode(u),n.delimiters.push({marker:u,length:r.length,token:n.tokens.length-1,end:-1,open:r.can_open,close:r.can_close})}return n.pos+=r.length,!0}function nt(n,e){const t=e.length;for(let u=t-1;u>=0;u--){const r=e[u];if(r.marker!==95&&r.marker!==42||r.end===-1)continue;const a=e[r.end],o=u>0&&e[u-1].end===r.end+1&&e[u-1].marker===r.marker&&e[u-1].token===r.token-1&&e[r.end+1].token===a.token+1,i=String.fromCharCode(r.marker),c=n.tokens[r.token];c.type=o?"strong_open":"em_open",c.tag=o?"strong":"em",c.nesting=1,c.markup=o?i+i:i,c.content="";const s=n.tokens[a.token];s.type=o?"strong_close":"em_close",s.tag=o?"strong":"em",s.nesting=-1,s.markup=o?i+i:i,s.content="",o&&(n.tokens[e[u-1].token].content="",n.tokens[e[r.end+1].token].content="",u--)}}function bi(n){const e=n.tokens_meta,t=n.tokens_meta.length;nt(n,n.delimiters);for(let u=0;u<t;u++)e[u]&&e[u].delimiters&&nt(n,e[u].delimiters)}const Nt={tokenize:fi,postProcess:bi};function mi(n,e){let t,u,r,a,o="",i="",c=n.pos,s=!0;if(n.src.charCodeAt(n.pos)!==91)return!1;const l=n.pos,f=n.posMax,b=n.pos+1,d=n.md.helpers.parseLinkLabel(n,n.pos,!0);if(d<0)return!1;let p=d+1;if(p<f&&n.src.charCodeAt(p)===40){for(s=!1,p++;p<f&&(t=n.src.charCodeAt(p),!(!w(t)&&t!==10));p++);if(p>=f)return!1;if(c=p,r=n.md.helpers.parseLinkDestination(n.src,p,n.posMax),r.ok){for(o=n.md.normalizeLink(r.str),n.md.validateLink(o)?p=r.pos:o="",c=p;p<f&&(t=n.src.charCodeAt(p),!(!w(t)&&t!==10));p++);if(r=n.md.helpers.parseLinkTitle(n.src,p,n.posMax),p<f&&c!==p&&r.ok)for(i=r.str,p=r.pos;p<f&&(t=n.src.charCodeAt(p),!(!w(t)&&t!==10));p++);}(p>=f||n.src.charCodeAt(p)!==41)&&(s=!0),p++}if(s){if(typeof n.env.references>"u")return!1;if(p<f&&n.src.charCodeAt(p)===91?(c=p+1,p=n.md.helpers.parseLinkLabel(n,p),p>=0?u=n.src.slice(c,p++):p=d+1):p=d+1,u||(u=n.src.slice(b,d)),a=n.env.references[Xn(u)],!a)return n.pos=l,!1;o=a.href,i=a.title}if(!e){n.pos=b,n.posMax=d;const g=n.push("link_open","a",1),h=[["href",o]];g.attrs=h,i&&h.push(["title",i]),n.linkLevel++,n.md.inline.tokenize(n),n.linkLevel--,n.push("link_close","a",-1)}return n.pos=p,n.posMax=f,!0}function gi(n,e){let t,u,r,a,o,i,c,s,l="";const f=n.pos,b=n.posMax;if(n.src.charCodeAt(n.pos)!==33||n.src.charCodeAt(n.pos+1)!==91)return!1;const d=n.pos+2,p=n.md.helpers.parseLinkLabel(n,n.pos+1,!1);if(p<0)return!1;if(a=p+1,a<b&&n.src.charCodeAt(a)===40){for(a++;a<b&&(t=n.src.charCodeAt(a),!(!w(t)&&t!==10));a++);if(a>=b)return!1;for(s=a,i=n.md.helpers.parseLinkDestination(n.src,a,n.posMax),i.ok&&(l=n.md.normalizeLink(i.str),n.md.validateLink(l)?a=i.pos:l=""),s=a;a<b&&(t=n.src.charCodeAt(a),!(!w(t)&&t!==10));a++);if(i=n.md.helpers.parseLinkTitle(n.src,a,n.posMax),a<b&&s!==a&&i.ok)for(c=i.str,a=i.pos;a<b&&(t=n.src.charCodeAt(a),!(!w(t)&&t!==10));a++);else c="";if(a>=b||n.src.charCodeAt(a)!==41)return n.pos=f,!1;a++}else{if(typeof n.env.references>"u")return!1;if(a<b&&n.src.charCodeAt(a)===91?(s=a+1,a=n.md.helpers.parseLinkLabel(n,a),a>=0?r=n.src.slice(s,a++):a=p+1):a=p+1,r||(r=n.src.slice(d,p)),o=n.env.references[Xn(r)],!o)return n.pos=f,!1;l=o.href,c=o.title}if(!e){u=n.src.slice(d,p);const g=[];n.md.inline.parse(u,n.md,n.env,g);const h=n.push("image","img",0),v=[["src",l],["alt",""]];h.attrs=v,h.children=g,h.content=u,c&&v.push(["title",c])}return n.pos=a,n.posMax=b,!0}const Ei=/^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,hi=/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;function _i(n,e){let t=n.pos;if(n.src.charCodeAt(t)!==60)return!1;const u=n.pos,r=n.posMax;for(;;){if(++t>=r)return!1;const o=n.src.charCodeAt(t);if(o===60)return!1;if(o===62)break}const a=n.src.slice(u+1,t);if(hi.test(a)){const o=n.md.normalizeLink(a);if(!n.md.validateLink(o))return!1;if(!e){const i=n.push("link_open","a",1);i.attrs=[["href",o]],i.markup="autolink",i.info="auto";const c=n.push("text","",0);c.content=n.md.normalizeLinkText(a);const s=n.push("link_close","a",-1);s.markup="autolink",s.info="auto"}return n.pos+=a.length+2,!0}if(Ei.test(a)){const o=n.md.normalizeLink("mailto:"+a);if(!n.md.validateLink(o))return!1;if(!e){const i=n.push("link_open","a",1);i.attrs=[["href",o]],i.markup="autolink",i.info="auto";const c=n.push("text","",0);c.content=n.md.normalizeLinkText(a);const s=n.push("link_close","a",-1);s.markup="autolink",s.info="auto"}return n.pos+=a.length+2,!0}return!1}function Ti(n){return/^<a[>\s]/i.test(n)}function Ai(n){return/^<\/a\s*>/i.test(n)}function Si(n){const e=n|32;return e>=97&&e<=122}function Di(n,e){if(!n.md.options.html)return!1;const t=n.posMax,u=n.pos;if(n.src.charCodeAt(u)!==60||u+2>=t)return!1;const r=n.src.charCodeAt(u+1);if(r!==33&&r!==63&&r!==47&&!Si(r))return!1;const a=n.src.slice(u).match(Za);if(!a)return!1;if(!e){const o=n.push("html_inline","",0);o.content=a[0],Ti(o.content)&&n.linkLevel++,Ai(o.content)&&n.linkLevel--}return n.pos+=a[0].length,!0}const xi=/^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,Ci=/^&([a-z][a-z0-9]{1,31});/i;function yi(n,e){const t=n.pos,u=n.posMax;if(n.src.charCodeAt(t)!==38||t+1>=u)return!1;if(n.src.charCodeAt(t+1)===35){const a=n.src.slice(t).match(xi);if(a){if(!e){const o=a[1][0].toLowerCase()==="x"?parseInt(a[1].slice(1),16):parseInt(a[1],10),i=n.push("text_special","",0);i.content=Se(o)?kn(o):kn(65533),i.markup=a[0],i.info="entity"}return n.pos+=a[0].length,!0}}else{const a=n.src.slice(t).match(Ci);if(a){const o=Kr(a[0]);if(o!==a[0]){if(!e){const i=n.push("text_special","",0);i.content=o,i.markup=a[0],i.info="entity"}return n.pos+=a[0].length,!0}}}return!1}function et(n){const e={},t=n.length;if(!t)return;let u=0,r=-2;const a=[];for(let o=0;o<t;o++){const i=n[o];if(a.push(0),(n[u].marker!==i.marker||r!==i.token-1)&&(u=o),r=i.token,i.length=i.length||0,!i.close)continue;e.hasOwnProperty(i.marker)||(e[i.marker]=[-1,-1,-1,-1,-1,-1]);const c=e[i.marker][(i.open?3:0)+i.length%3];let s=u-a[u]-1,l=s;for(;s>c;s-=a[s]+1){const f=n[s];if(f.marker===i.marker&&f.open&&f.end<0){let b=!1;if((f.close||i.open)&&(f.length+i.length)%3===0&&(f.length%3!==0||i.length%3!==0)&&(b=!0),!b){const d=s>0&&!n[s-1].open?a[s-1]+1:0;a[o]=o-s+d,a[s]=d,i.open=!1,f.end=o,f.close=!1,l=-1,r=-2;break}}}l!==-1&&(e[i.marker][(i.open?3:0)+(i.length||0)%3]=l)}}function Ii(n){const e=n.tokens_meta,t=n.tokens_meta.length;et(n.delimiters);for(let u=0;u<t;u++)e[u]&&e[u].delimiters&&et(e[u].delimiters)}function vi(n){let e,t,u=0;const r=n.tokens,a=n.tokens.length;for(e=t=0;e<a;e++)r[e].nesting<0&&u--,r[e].level=u,r[e].nesting>0&&u++,r[e].type==="text"&&e+1<a&&r[e+1].type==="text"?r[e+1].content=r[e].content+r[e+1].content:(e!==t&&(r[t]=r[e]),t++);e!==t&&(r.length=t)}const de=[["text",ai],["linkify",oi],["newline",ci],["escape",si],["backticks",li],["strikethrough",Ot.tokenize],["emphasis",Nt.tokenize],["link",mi],["image",gi],["autolink",_i],["html_inline",Di],["entity",yi]],pe=[["balance_pairs",Ii],["strikethrough",Ot.postProcess],["emphasis",Nt.postProcess],["fragments_join",vi]];function Un(){this.ruler=new K;for(let n=0;n<de.length;n++)this.ruler.push(de[n][0],de[n][1]);this.ruler2=new K;for(let n=0;n<pe.length;n++)this.ruler2.push(pe[n][0],pe[n][1])}Un.prototype.skipToken=function(n){const e=n.pos,t=this.ruler.getRules(""),u=t.length,r=n.md.options.maxNesting,a=n.cache;if(typeof a[e]<"u"){n.pos=a[e];return}let o=!1;if(n.level<r){for(let i=0;i<u;i++)if(n.level++,o=t[i](n,!0),n.level--,o){if(e>=n.pos)throw new Error("inline rule didn't increment state.pos");break}}else n.pos=n.posMax;o||n.pos++,a[e]=n.pos};Un.prototype.tokenize=function(n){const e=this.ruler.getRules(""),t=e.length,u=n.posMax,r=n.md.options.maxNesting;for(;n.pos<u;){const a=n.pos;let o=!1;if(n.level<r){for(let i=0;i<t;i++)if(o=e[i](n,!1),o){if(a>=n.pos)throw new Error("inline rule didn't increment state.pos");break}}if(o){if(n.pos>=u)break;continue}n.pending+=n.src[n.pos++]}n.pending&&n.pushPending()};Un.prototype.parse=function(n,e,t,u){const r=new this.State(n,e,t,u);this.tokenize(r);const a=this.ruler2.getRules(""),o=a.length;for(let i=0;i<o;i++)a[i](r)};Un.prototype.State=Fn;function Ri(n){const e={};n=n||{},e.src_Any=_t.source,e.src_Cc=Tt.source,e.src_Z=St.source,e.src_P=Te.source,e.src_ZPCc=[e.src_Z,e.src_P,e.src_Cc].join("|"),e.src_ZCc=[e.src_Z,e.src_Cc].join("|");const t="[><｜]";return e.src_pseudo_letter="(?:(?!"+t+"|"+e.src_ZPCc+")"+e.src_Any+")",e.src_ip4="(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",e.src_auth="(?:(?:(?!"+e.src_ZCc+"|[@/\\[\\]()]).)+@)?",e.src_port="(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?",e.src_host_terminator="(?=$|"+t+"|"+e.src_ZPCc+")(?!"+(n["---"]?"-(?!--)|":"-|")+"_|:\\d|\\.-|\\.(?!$|"+e.src_ZPCc+"))",e.src_path="(?:[/?#](?:(?!"+e.src_ZCc+"|"+t+`|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!`+e.src_ZCc+"|\\]).)*\\]|\\((?:(?!"+e.src_ZCc+"|[)]).)*\\)|\\{(?:(?!"+e.src_ZCc+'|[}]).)*\\}|\\"(?:(?!'+e.src_ZCc+`|["]).)+\\"|\\'(?:(?!`+e.src_ZCc+"|[']).)+\\'|\\'(?="+e.src_pseudo_letter+"|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!"+e.src_ZCc+"|[.]|$)|"+(n["---"]?"\\-(?!--(?:[^-]|$))(?:-*)|":"\\-+|")+",(?!"+e.src_ZCc+"|$)|;(?!"+e.src_ZCc+"|$)|\\!+(?!"+e.src_ZCc+"|[!]|$)|\\?(?!"+e.src_ZCc+"|[?]|$))+|\\/)?",e.src_email_name='[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*',e.src_xn="xn--[a-z0-9\\-]{1,59}",e.src_domain_root="(?:"+e.src_xn+"|"+e.src_pseudo_letter+"{1,63})",e.src_domain="(?:"+e.src_xn+"|(?:"+e.src_pseudo_letter+")|(?:"+e.src_pseudo_letter+"(?:-|"+e.src_pseudo_letter+"){0,61}"+e.src_pseudo_letter+"))",e.src_host="(?:(?:(?:(?:"+e.src_domain+")\\.)*"+e.src_domain+"))",e.tpl_host_fuzzy="(?:"+e.src_ip4+"|(?:(?:(?:"+e.src_domain+")\\.)+(?:%TLDS%)))",e.tpl_host_no_ip_fuzzy="(?:(?:(?:"+e.src_domain+")\\.)+(?:%TLDS%))",e.src_host_strict=e.src_host+e.src_host_terminator,e.tpl_host_fuzzy_strict=e.tpl_host_fuzzy+e.src_host_terminator,e.src_host_port_strict=e.src_host+e.src_port+e.src_host_terminator,e.tpl_host_port_fuzzy_strict=e.tpl_host_fuzzy+e.src_port+e.src_host_terminator,e.tpl_host_port_no_ip_fuzzy_strict=e.tpl_host_no_ip_fuzzy+e.src_port+e.src_host_terminator,e.tpl_host_fuzzy_test="localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:"+e.src_ZPCc+"|>|$))",e.tpl_email_fuzzy="(^|"+t+'|"|\\(|'+e.src_ZCc+")("+e.src_email_name+"@"+e.tpl_host_fuzzy_strict+")",e.tpl_link_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+e.src_ZPCc+"))((?![$+<=>^`|｜])"+e.tpl_host_port_fuzzy_strict+e.src_path+")",e.tpl_link_no_ip_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+e.src_ZPCc+"))((?![$+<=>^`|｜])"+e.tpl_host_port_no_ip_fuzzy_strict+e.src_path+")",e}function Ee(n){return Array.prototype.slice.call(arguments,1).forEach(function(t){t&&Object.keys(t).forEach(function(u){n[u]=t[u]})}),n}function te(n){return Object.prototype.toString.call(n)}function ki(n){return te(n)==="[object String]"}function Li(n){return te(n)==="[object Object]"}function Oi(n){return te(n)==="[object RegExp]"}function tt(n){return te(n)==="[object Function]"}function Ni(n){return n.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}const Mt={fuzzyLink:!0,fuzzyEmail:!0,fuzzyIP:!1};function Mi(n){return Object.keys(n||{}).reduce(function(e,t){return e||Mt.hasOwnProperty(t)},!1)}const Pi={"http:":{validate:function(n,e,t){const u=n.slice(e);return t.re.http||(t.re.http=new RegExp("^\\/\\/"+t.re.src_auth+t.re.src_host_port_strict+t.re.src_path,"i")),t.re.http.test(u)?u.match(t.re.http)[0].length:0}},"https:":"http:","ftp:":"http:","//":{validate:function(n,e,t){const u=n.slice(e);return t.re.no_http||(t.re.no_http=new RegExp("^"+t.re.src_auth+"(?:localhost|(?:(?:"+t.re.src_domain+")\\.)+"+t.re.src_domain_root+")"+t.re.src_port+t.re.src_host_terminator+t.re.src_path,"i")),t.re.no_http.test(u)?e>=3&&n[e-3]===":"||e>=3&&n[e-3]==="/"?0:u.match(t.re.no_http)[0].length:0}},"mailto:":{validate:function(n,e,t){const u=n.slice(e);return t.re.mailto||(t.re.mailto=new RegExp("^"+t.re.src_email_name+"@"+t.re.src_host_strict,"i")),t.re.mailto.test(u)?u.match(t.re.mailto)[0].length:0}}},wi="a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",Bi="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");function Fi(n){return function(e,t){const u=e.slice(t);return n.test(u)?u.match(n)[0].length:0}}function ut(){return function(n,e){e.normalize(n)}}function $n(n){const e=n.re=Ri(n.__opts__),t=n.__tlds__.slice();n.onCompile(),n.__tlds_replaced__||t.push(wi),t.push(e.src_xn),e.src_tlds=t.join("|");function u(i){return i.replace("%TLDS%",e.src_tlds)}e.email_fuzzy=RegExp(u(e.tpl_email_fuzzy),"i"),e.email_fuzzy_global=RegExp(u(e.tpl_email_fuzzy),"ig"),e.link_fuzzy=RegExp(u(e.tpl_link_fuzzy),"i"),e.link_fuzzy_global=RegExp(u(e.tpl_link_fuzzy),"ig"),e.link_no_ip_fuzzy=RegExp(u(e.tpl_link_no_ip_fuzzy),"i"),e.link_no_ip_fuzzy_global=RegExp(u(e.tpl_link_no_ip_fuzzy),"ig"),e.host_fuzzy_test=RegExp(u(e.tpl_host_fuzzy_test),"i");const r=[];n.__compiled__={};function a(i,c){throw new Error('(LinkifyIt) Invalid schema "'+i+'": '+c)}Object.keys(n.__schemas__).forEach(function(i){const c=n.__schemas__[i];if(c===null)return;const s={validate:null,link:null};if(n.__compiled__[i]=s,Li(c)){Oi(c.validate)?s.validate=Fi(c.validate):tt(c.validate)?s.validate=c.validate:a(i,c),tt(c.normalize)?s.normalize=c.normalize:c.normalize?a(i,c):s.normalize=ut();return}if(ki(c)){r.push(i);return}a(i,c)}),r.forEach(function(i){n.__compiled__[n.__schemas__[i]]&&(n.__compiled__[i].validate=n.__compiled__[n.__schemas__[i]].validate,n.__compiled__[i].normalize=n.__compiled__[n.__schemas__[i]].normalize)}),n.__compiled__[""]={validate:null,normalize:ut()};const o=Object.keys(n.__compiled__).filter(function(i){return i.length>0&&n.__compiled__[i]}).map(Ni).join("|");n.re.schema_test=RegExp("(^|(?!_)(?:[><｜]|"+e.src_ZPCc+"))("+o+")","i"),n.re.schema_search=RegExp("(^|(?!_)(?:[><｜]|"+e.src_ZPCc+"))("+o+")","ig"),n.re.schema_at_start=RegExp("^"+n.re.schema_search.source,"i"),n.re.pretest=RegExp("("+n.re.schema_test.source+")|("+n.re.host_fuzzy_test.source+")|@","i")}function Pt(n,e,t,u){const r=n.slice(t,u);this.schema=e.toLowerCase(),this.index=t,this.lastIndex=u,this.raw=r,this.text=r,this.url=r}function V(n,e){if(!(this instanceof V))return new V(n,e);e||Mi(n)&&(e=n,n={}),this.__opts__=Ee({},Mt,e),this.__schemas__=Ee({},Pi,n),this.__compiled__={},this.__tlds__=Bi,this.__tlds_replaced__=!1,this.re={},$n(this)}V.prototype.add=function(e,t){return this.__schemas__[e]=t,$n(this),this};V.prototype.set=function(e){return this.__opts__=Ee(this.__opts__,e),this};V.prototype.test=function(e){if(!e.length)return!1;let t,u;if(this.re.schema_test.test(e)){for(u=this.re.schema_search,u.lastIndex=0;(t=u.exec(e))!==null;)if(this.testSchemaAt(e,t[2],u.lastIndex))return!0}return!!(this.__opts__.fuzzyLink&&this.__compiled__["http:"]&&e.search(this.re.host_fuzzy_test)>=0&&e.match(this.__opts__.fuzzyIP?this.re.link_fuzzy:this.re.link_no_ip_fuzzy)!==null||this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"]&&e.indexOf("@")>=0&&e.match(this.re.email_fuzzy)!==null)};V.prototype.pretest=function(e){return this.re.pretest.test(e)};V.prototype.testSchemaAt=function(e,t,u){return this.__compiled__[t.toLowerCase()]?this.__compiled__[t.toLowerCase()].validate(e,u,this):0};V.prototype.match=function(e){const t=[],u=[],r=[],a=[];let o,i,c;function s(b,d){return b?d?b.index!==d.index?b.index<d.index?b:d:b.lastIndex>=d.lastIndex?b:d:b:d}if(!e.length)return null;if(this.re.schema_test.test(e))for(c=this.re.schema_search,c.lastIndex=0;(o=c.exec(e))!==null;)i=this.testSchemaAt(e,o[2],c.lastIndex),i&&u.push({schema:o[2],index:o.index+o[1].length,lastIndex:o.index+o[0].length+i});if(this.__opts__.fuzzyLink&&this.__compiled__["http:"])for(c=this.__opts__.fuzzyIP?this.re.link_fuzzy_global:this.re.link_no_ip_fuzzy_global,c.lastIndex=0;(o=c.exec(e))!==null;)r.push({schema:"",index:o.index+o[1].length,lastIndex:o.index+o[0].length});if(this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"])for(c=this.re.email_fuzzy_global,c.lastIndex=0;(o=c.exec(e))!==null;)a.push({schema:"mailto:",index:o.index+o[1].length,lastIndex:o.index+o[0].length});const l=[0,0,0];let f=0;for(;;){const b=[u[l[0]],a[l[1]],r[l[2]]],d=s(s(b[0],b[1]),b[2]);if(!d)break;if(d===b[0]?l[0]++:d===b[1]?l[1]++:l[2]++,d.index<f)continue;const p=new Pt(e,d.schema,d.index,d.lastIndex);this.__compiled__[p.schema].normalize(p,this),t.push(p),f=d.lastIndex}return t.length?t:null};V.prototype.matchAtStart=function(e){if(!e.length)return null;const t=this.re.schema_at_start.exec(e);if(!t)return null;const u=this.testSchemaAt(e,t[2],t[0].length);if(!u)return null;const r=new Pt(e,t[2],t.index+t[1].length,t.index+t[0].length+u);return this.__compiled__[r.schema].normalize(r,this),r};V.prototype.tlds=function(e,t){return e=Array.isArray(e)?e:[e],t?(this.__tlds__=this.__tlds__.concat(e).sort().filter(function(u,r,a){return u!==a[r-1]}).reverse(),$n(this),this):(this.__tlds__=e.slice(),this.__tlds_replaced__=!0,$n(this),this)};V.prototype.normalize=function(e){e.schema||(e.url="http://"+e.url),e.schema==="mailto:"&&!/^mailto:/i.test(e.url)&&(e.url="mailto:"+e.url)};V.prototype.onCompile=function(){};const Cn=2147483647,un=36,Ce=1,Mn=26,Ui=38,ji=700,wt=72,Bt=128,Ft="-",Hi=/^xn--/,qi=/[^\0-\x7F]/,zi=/[\x2E\u3002\uFF0E\uFF61]/g,Ji={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},fe=un-Ce,rn=Math.floor,be=String.fromCharCode;function dn(n){throw new RangeError(Ji[n])}function Ki(n,e){const t=[];let u=n.length;for(;u--;)t[u]=e(n[u]);return t}function Ut(n,e){const t=n.split("@");let u="";t.length>1&&(u=t[0]+"@",n=t[1]),n=n.replace(zi,".");const r=n.split("."),a=Ki(r,e).join(".");return u+a}function jt(n){const e=[];let t=0;const u=n.length;for(;t<u;){const r=n.charCodeAt(t++);if(r>=55296&&r<=56319&&t<u){const a=n.charCodeAt(t++);(a&64512)==56320?e.push(((r&1023)<<10)+(a&1023)+65536):(e.push(r),t--)}else e.push(r)}return e}const Gi=n=>String.fromCodePoint(...n),Vi=function(n){return n>=48&&n<58?26+(n-48):n>=65&&n<91?n-65:n>=97&&n<123?n-97:un},rt=function(n,e){return n+22+75*(n<26)-((e!=0)<<5)},Ht=function(n,e,t){let u=0;for(n=t?rn(n/ji):n>>1,n+=rn(n/e);n>fe*Mn>>1;u+=un)n=rn(n/fe);return rn(u+(fe+1)*n/(n+Ui))},qt=function(n){const e=[],t=n.length;let u=0,r=Bt,a=wt,o=n.lastIndexOf(Ft);o<0&&(o=0);for(let i=0;i<o;++i)n.charCodeAt(i)>=128&&dn("not-basic"),e.push(n.charCodeAt(i));for(let i=o>0?o+1:0;i<t;){const c=u;for(let l=1,f=un;;f+=un){i>=t&&dn("invalid-input");const b=Vi(n.charCodeAt(i++));b>=un&&dn("invalid-input"),b>rn((Cn-u)/l)&&dn("overflow"),u+=b*l;const d=f<=a?Ce:f>=a+Mn?Mn:f-a;if(b<d)break;const p=un-d;l>rn(Cn/p)&&dn("overflow"),l*=p}const s=e.length+1;a=Ht(u-c,s,c==0),rn(u/s)>Cn-r&&dn("overflow"),r+=rn(u/s),u%=s,e.splice(u++,0,r)}return String.fromCodePoint(...e)},zt=function(n){const e=[];n=jt(n);const t=n.length;let u=Bt,r=0,a=wt;for(const c of n)c<128&&e.push(be(c));const o=e.length;let i=o;for(o&&e.push(Ft);i<t;){let c=Cn;for(const l of n)l>=u&&l<c&&(c=l);const s=i+1;c-u>rn((Cn-r)/s)&&dn("overflow"),r+=(c-u)*s,u=c;for(const l of n)if(l<u&&++r>Cn&&dn("overflow"),l===u){let f=r;for(let b=un;;b+=un){const d=b<=a?Ce:b>=a+Mn?Mn:b-a;if(f<d)break;const p=f-d,g=un-d;e.push(be(rt(d+p%g,0))),f=rn(p/g)}e.push(be(rt(f,0))),a=Ht(r,s,i===o),r=0,++i}++r,++u}return e.join("")},Wi=function(n){return Ut(n,function(e){return Hi.test(e)?qt(e.slice(4).toLowerCase()):e})},$i=function(n){return Ut(n,function(e){return qi.test(e)?"xn--"+zt(e):e})},Jt={version:"2.3.1",ucs2:{decode:jt,encode:Gi},decode:qt,encode:zt,toASCII:$i,toUnicode:Wi},Yi={options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:100},components:{core:{},block:{},inline:{}}},Qi={options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["paragraph"]},inline:{rules:["text"],rules2:["balance_pairs","fragments_join"]}}},Zi={options:{html:!0,xhtmlOut:!0,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["blockquote","code","fence","heading","hr","html_block","lheading","list","reference","paragraph"]},inline:{rules:["autolink","backticks","emphasis","entity","escape","html_inline","image","link","newline","text"],rules2:["balance_pairs","emphasis","fragments_join"]}}},Xi={default:Yi,zero:Qi,commonmark:Zi},no=/^(vbscript|javascript|file|data):/,eo=/^data:image\/(gif|png|jpeg|webp);/;function to(n){const e=n.trim().toLowerCase();return no.test(e)?eo.test(e):!0}const Kt=["http:","https:","mailto:"];function uo(n){const e=_e(n,!0);if(e.hostname&&(!e.protocol||Kt.indexOf(e.protocol)>=0))try{e.hostname=Jt.toASCII(e.hostname)}catch{}return Bn(he(e))}function ro(n){const e=_e(n,!0);if(e.hostname&&(!e.protocol||Kt.indexOf(e.protocol)>=0))try{e.hostname=Jt.toUnicode(e.hostname)}catch{}return yn(he(e),yn.defaultChars+"%")}function Q(n,e){if(!(this instanceof Q))return new Q(n,e);e||Ae(n)||(e=n||{},n="default"),this.inline=new Un,this.block=new ee,this.core=new De,this.renderer=new Rn,this.linkify=new V,this.validateLink=to,this.normalizeLink=uo,this.normalizeLinkText=ro,this.utils=oa,this.helpers=Zn({},da),this.options={},this.configure(n),e&&this.set(e)}Q.prototype.set=function(n){return Zn(this.options,n),this};Q.prototype.configure=function(n){const e=this;if(Ae(n)){const t=n;if(n=Xi[t],!n)throw new Error('Wrong `markdown-it` preset "'+t+'", check name')}if(!n)throw new Error("Wrong `markdown-it` preset, can't be empty");return n.options&&e.set(n.options),n.components&&Object.keys(n.components).forEach(function(t){n.components[t].rules&&e[t].ruler.enableOnly(n.components[t].rules),n.components[t].rules2&&e[t].ruler2.enableOnly(n.components[t].rules2)}),this};Q.prototype.enable=function(n,e){let t=[];Array.isArray(n)||(n=[n]),["core","block","inline"].forEach(function(r){t=t.concat(this[r].ruler.enable(n,!0))},this),t=t.concat(this.inline.ruler2.enable(n,!0));const u=n.filter(function(r){return t.indexOf(r)<0});if(u.length&&!e)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+u);return this};Q.prototype.disable=function(n,e){let t=[];Array.isArray(n)||(n=[n]),["core","block","inline"].forEach(function(r){t=t.concat(this[r].ruler.disable(n,!0))},this),t=t.concat(this.inline.ruler2.disable(n,!0));const u=n.filter(function(r){return t.indexOf(r)<0});if(u.length&&!e)throw new Error("MarkdownIt. Failed to disable unknown rule(s): "+u);return this};Q.prototype.use=function(n){const e=[this].concat(Array.prototype.slice.call(arguments,1));return n.apply(n,e),this};Q.prototype.parse=function(n,e){if(typeof n!="string")throw new Error("Input data should be a String");const t=new this.core.State(n,this,e);return this.core.process(t),t.tokens};Q.prototype.render=function(n,e){return e=e||{},this.renderer.render(this.parse(n,e),this.options,e)};Q.prototype.parseInline=function(n,e){const t=new this.core.State(n,this,e);return t.inlineMode=!0,this.core.process(t),t.tokens};Q.prototype.renderInline=function(n,e){return e=e||{},this.renderer.render(this.parseInline(n,e),this.options,e)};function Gt(n){return n instanceof Map?n.clear=n.delete=n.set=function(){throw new Error("map is read-only")}:n instanceof Set&&(n.add=n.clear=n.delete=function(){throw new Error("set is read-only")}),Object.freeze(n),Object.getOwnPropertyNames(n).forEach(e=>{const t=n[e],u=typeof t;(u==="object"||u==="function")&&!Object.isFrozen(t)&&Gt(t)}),n}class at{constructor(e){e.data===void 0&&(e.data={}),this.data=e.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}}function Vt(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function fn(n,...e){const t=Object.create(null);for(const u in n)t[u]=n[u];return e.forEach(function(u){for(const r in u)t[r]=u[r]}),t}const ao="</span>",it=n=>!!n.scope,io=(n,{prefix:e})=>{if(n.startsWith("language:"))return n.replace("language:","language-");if(n.includes(".")){const t=n.split(".");return[`${e}${t.shift()}`,...t.map((u,r)=>`${u}${"_".repeat(r+1)}`)].join(" ")}return`${e}${n}`};class oo{constructor(e,t){this.buffer="",this.classPrefix=t.classPrefix,e.walk(this)}addText(e){this.buffer+=Vt(e)}openNode(e){if(!it(e))return;const t=io(e.scope,{prefix:this.classPrefix});this.span(t)}closeNode(e){it(e)&&(this.buffer+=ao)}value(){return this.buffer}span(e){this.buffer+=`<span class="${e}">`}}const ot=(n={})=>{const e={children:[]};return Object.assign(e,n),e};class ye{constructor(){this.rootNode=ot(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(e){this.top.children.push(e)}openNode(e){const t=ot({scope:e});this.add(t),this.stack.push(t)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(e){return this.constructor._walk(e,this.rootNode)}static _walk(e,t){return typeof t=="string"?e.addText(t):t.children&&(e.openNode(t),t.children.forEach(u=>this._walk(e,u)),e.closeNode(t)),e}static _collapse(e){typeof e!="string"&&e.children&&(e.children.every(t=>typeof t=="string")?e.children=[e.children.join("")]:e.children.forEach(t=>{ye._collapse(t)}))}}class co extends ye{constructor(e){super(),this.options=e}addText(e){e!==""&&this.add(e)}startScope(e){this.openNode(e)}endScope(){this.closeNode()}__addSublanguage(e,t){const u=e.root;t&&(u.scope=`language:${t}`),this.add(u)}toHTML(){return new oo(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}}function Pn(n){return n?typeof n=="string"?n:n.source:null}function Wt(n){return An("(?=",n,")")}function so(n){return An("(?:",n,")*")}function lo(n){return An("(?:",n,")?")}function An(...n){return n.map(t=>Pn(t)).join("")}function po(n){const e=n[n.length-1];return typeof e=="object"&&e.constructor===Object?(n.splice(n.length-1,1),e):{}}function Ie(...n){return"("+(po(n).capture?"":"?:")+n.map(u=>Pn(u)).join("|")+")"}function $t(n){return new RegExp(n.toString()+"|").exec("").length-1}function fo(n,e){const t=n&&n.exec(e);return t&&t.index===0}const bo=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function ve(n,{joinWith:e}){let t=0;return n.map(u=>{t+=1;const r=t;let a=Pn(u),o="";for(;a.length>0;){const i=bo.exec(a);if(!i){o+=a;break}o+=a.substring(0,i.index),a=a.substring(i.index+i[0].length),i[0][0]==="\\"&&i[1]?o+="\\"+String(Number(i[1])+r):(o+=i[0],i[0]==="("&&t++)}return o}).map(u=>`(${u})`).join(e)}const mo=/\b\B/,Yt="[a-zA-Z]\\w*",Re="[a-zA-Z_]\\w*",Qt="\\b\\d+(\\.\\d+)?",Zt="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",Xt="\\b(0b[01]+)",go="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",Eo=(n={})=>{const e=/^#![ ]*\//;return n.binary&&(n.begin=An(e,/.*\b/,n.binary,/\b.*/)),fn({scope:"meta",begin:e,end:/$/,relevance:0,"on:begin":(t,u)=>{t.index!==0&&u.ignoreMatch()}},n)},wn={begin:"\\\\[\\s\\S]",relevance:0},ho={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[wn]},_o={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[wn]},To={begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},ue=function(n,e,t={}){const u=fn({scope:"comment",begin:n,end:e,contains:[]},t);u.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});const r=Ie("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return u.contains.push({begin:An(/[ ]+/,"(",r,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),u},Ao=ue("//","$"),So=ue("/\\*","\\*/"),Do=ue("#","$"),xo={scope:"number",begin:Qt,relevance:0},Co={scope:"number",begin:Zt,relevance:0},yo={scope:"number",begin:Xt,relevance:0},Io={scope:"regexp",begin:/\/(?=[^/\n]*\/)/,end:/\/[gimuy]*/,contains:[wn,{begin:/\[/,end:/\]/,relevance:0,contains:[wn]}]},vo={scope:"title",begin:Yt,relevance:0},Ro={scope:"title",begin:Re,relevance:0},ko={begin:"\\.\\s*"+Re,relevance:0},Lo=function(n){return Object.assign(n,{"on:begin":(e,t)=>{t.data._beginMatch=e[1]},"on:end":(e,t)=>{t.data._beginMatch!==e[1]&&t.ignoreMatch()}})};var Kn=Object.freeze({__proto__:null,APOS_STRING_MODE:ho,BACKSLASH_ESCAPE:wn,BINARY_NUMBER_MODE:yo,BINARY_NUMBER_RE:Xt,COMMENT:ue,C_BLOCK_COMMENT_MODE:So,C_LINE_COMMENT_MODE:Ao,C_NUMBER_MODE:Co,C_NUMBER_RE:Zt,END_SAME_AS_BEGIN:Lo,HASH_COMMENT_MODE:Do,IDENT_RE:Yt,MATCH_NOTHING_RE:mo,METHOD_GUARD:ko,NUMBER_MODE:xo,NUMBER_RE:Qt,PHRASAL_WORDS_MODE:To,QUOTE_STRING_MODE:_o,REGEXP_MODE:Io,RE_STARTERS_RE:go,SHEBANG:Eo,TITLE_MODE:vo,UNDERSCORE_IDENT_RE:Re,UNDERSCORE_TITLE_MODE:Ro});function Oo(n,e){n.input[n.index-1]==="."&&e.ignoreMatch()}function No(n,e){n.className!==void 0&&(n.scope=n.className,delete n.className)}function Mo(n,e){e&&n.beginKeywords&&(n.begin="\\b("+n.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",n.__beforeBegin=Oo,n.keywords=n.keywords||n.beginKeywords,delete n.beginKeywords,n.relevance===void 0&&(n.relevance=0))}function Po(n,e){Array.isArray(n.illegal)&&(n.illegal=Ie(...n.illegal))}function wo(n,e){if(n.match){if(n.begin||n.end)throw new Error("begin & end are not supported with match");n.begin=n.match,delete n.match}}function Bo(n,e){n.relevance===void 0&&(n.relevance=1)}const Fo=(n,e)=>{if(!n.beforeMatch)return;if(n.starts)throw new Error("beforeMatch cannot be used with starts");const t=Object.assign({},n);Object.keys(n).forEach(u=>{delete n[u]}),n.keywords=t.keywords,n.begin=An(t.beforeMatch,Wt(t.begin)),n.starts={relevance:0,contains:[Object.assign(t,{endsParent:!0})]},n.relevance=0,delete t.beforeMatch},Uo=["of","and","for","in","not","or","if","then","parent","list","value"],jo="keyword";function nu(n,e,t=jo){const u=Object.create(null);return typeof n=="string"?r(t,n.split(" ")):Array.isArray(n)?r(t,n):Object.keys(n).forEach(function(a){Object.assign(u,nu(n[a],e,a))}),u;function r(a,o){e&&(o=o.map(i=>i.toLowerCase())),o.forEach(function(i){const c=i.split("|");u[c[0]]=[a,Ho(c[0],c[1])]})}}function Ho(n,e){return e?Number(e):qo(n)?0:1}function qo(n){return Uo.includes(n.toLowerCase())}const ct={},Tn=n=>{console.error(n)},st=(n,...e)=>{console.log(`WARN: ${n}`,...e)},Dn=(n,e)=>{ct[`${n}/${e}`]||(console.log(`Deprecated as of ${n}. ${e}`),ct[`${n}/${e}`]=!0)},Yn=new Error;function eu(n,e,{key:t}){let u=0;const r=n[t],a={},o={};for(let i=1;i<=e.length;i++)o[i+u]=r[i],a[i+u]=!0,u+=$t(e[i-1]);n[t]=o,n[t]._emit=a,n[t]._multi=!0}function zo(n){if(Array.isArray(n.begin)){if(n.skip||n.excludeBegin||n.returnBegin)throw Tn("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),Yn;if(typeof n.beginScope!="object"||n.beginScope===null)throw Tn("beginScope must be object"),Yn;eu(n,n.begin,{key:"beginScope"}),n.begin=ve(n.begin,{joinWith:""})}}function Jo(n){if(Array.isArray(n.end)){if(n.skip||n.excludeEnd||n.returnEnd)throw Tn("skip, excludeEnd, returnEnd not compatible with endScope: {}"),Yn;if(typeof n.endScope!="object"||n.endScope===null)throw Tn("endScope must be object"),Yn;eu(n,n.end,{key:"endScope"}),n.end=ve(n.end,{joinWith:""})}}function Ko(n){n.scope&&typeof n.scope=="object"&&n.scope!==null&&(n.beginScope=n.scope,delete n.scope)}function Go(n){Ko(n),typeof n.beginScope=="string"&&(n.beginScope={_wrap:n.beginScope}),typeof n.endScope=="string"&&(n.endScope={_wrap:n.endScope}),zo(n),Jo(n)}function Vo(n){function e(o,i){return new RegExp(Pn(o),"m"+(n.case_insensitive?"i":"")+(n.unicodeRegex?"u":"")+(i?"g":""))}class t{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(i,c){c.position=this.position++,this.matchIndexes[this.matchAt]=c,this.regexes.push([c,i]),this.matchAt+=$t(i)+1}compile(){this.regexes.length===0&&(this.exec=()=>null);const i=this.regexes.map(c=>c[1]);this.matcherRe=e(ve(i,{joinWith:"|"}),!0),this.lastIndex=0}exec(i){this.matcherRe.lastIndex=this.lastIndex;const c=this.matcherRe.exec(i);if(!c)return null;const s=c.findIndex((f,b)=>b>0&&f!==void 0),l=this.matchIndexes[s];return c.splice(0,s),Object.assign(c,l)}}class u{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(i){if(this.multiRegexes[i])return this.multiRegexes[i];const c=new t;return this.rules.slice(i).forEach(([s,l])=>c.addRule(s,l)),c.compile(),this.multiRegexes[i]=c,c}resumingScanAtSamePosition(){return this.regexIndex!==0}considerAll(){this.regexIndex=0}addRule(i,c){this.rules.push([i,c]),c.type==="begin"&&this.count++}exec(i){const c=this.getMatcher(this.regexIndex);c.lastIndex=this.lastIndex;let s=c.exec(i);if(this.resumingScanAtSamePosition()&&!(s&&s.index===this.lastIndex)){const l=this.getMatcher(0);l.lastIndex=this.lastIndex+1,s=l.exec(i)}return s&&(this.regexIndex+=s.position+1,this.regexIndex===this.count&&this.considerAll()),s}}function r(o){const i=new u;return o.contains.forEach(c=>i.addRule(c.begin,{rule:c,type:"begin"})),o.terminatorEnd&&i.addRule(o.terminatorEnd,{type:"end"}),o.illegal&&i.addRule(o.illegal,{type:"illegal"}),i}function a(o,i){const c=o;if(o.isCompiled)return c;[No,wo,Go,Fo].forEach(l=>l(o,i)),n.compilerExtensions.forEach(l=>l(o,i)),o.__beforeBegin=null,[Mo,Po,Bo].forEach(l=>l(o,i)),o.isCompiled=!0;let s=null;return typeof o.keywords=="object"&&o.keywords.$pattern&&(o.keywords=Object.assign({},o.keywords),s=o.keywords.$pattern,delete o.keywords.$pattern),s=s||/\w+/,o.keywords&&(o.keywords=nu(o.keywords,n.case_insensitive)),c.keywordPatternRe=e(s,!0),i&&(o.begin||(o.begin=/\B|\b/),c.beginRe=e(c.begin),!o.end&&!o.endsWithParent&&(o.end=/\B|\b/),o.end&&(c.endRe=e(c.end)),c.terminatorEnd=Pn(c.end)||"",o.endsWithParent&&i.terminatorEnd&&(c.terminatorEnd+=(o.end?"|":"")+i.terminatorEnd)),o.illegal&&(c.illegalRe=e(o.illegal)),o.contains||(o.contains=[]),o.contains=[].concat(...o.contains.map(function(l){return Wo(l==="self"?o:l)})),o.contains.forEach(function(l){a(l,c)}),o.starts&&a(o.starts,i),c.matcher=r(c),c}if(n.compilerExtensions||(n.compilerExtensions=[]),n.contains&&n.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return n.classNameAliases=fn(n.classNameAliases||{}),a(n)}function tu(n){return n?n.endsWithParent||tu(n.starts):!1}function Wo(n){return n.variants&&!n.cachedVariants&&(n.cachedVariants=n.variants.map(function(e){return fn(n,{variants:null},e)})),n.cachedVariants?n.cachedVariants:tu(n)?fn(n,{starts:n.starts?fn(n.starts):null}):Object.isFrozen(n)?fn(n):n}var $o="11.11.1";class Yo extends Error{constructor(e,t){super(e),this.name="HTMLInjectionError",this.html=t}}const me=Vt,lt=fn,dt=Symbol("nomatch"),Qo=7,uu=function(n){const e=Object.create(null),t=Object.create(null),u=[];let r=!0;const a="Could not find the language '{}', did you forget to load/include a language module?",o={disableAutodetect:!0,name:"Plain text",contains:[]};let i={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:co};function c(m){return i.noHighlightRe.test(m)}function s(m){let x=m.className+" ";x+=m.parentNode?m.parentNode.className:"";const S=i.languageDetectRe.exec(x);if(S){const R=M(S[1]);return R||(st(a.replace("{}",S[1])),st("Falling back to no-highlight mode for this block.",m)),R?S[1]:"no-highlight"}return x.split(/\s+/).find(R=>c(R)||M(R))}function l(m,x,S){let R="",L="";typeof x=="object"?(R=m,S=x.ignoreIllegals,L=x.language):(Dn("10.7.0","highlight(lang, code, ...args) has been deprecated."),Dn("10.7.0",`Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`),L=m,R=x),S===void 0&&(S=!0);const F={code:R,language:L};Z("before:highlight",F);const q=F.result?F.result:f(F.language,F.code,S);return q.code=F.code,Z("after:highlight",q),q}function f(m,x,S,R){const L=Object.create(null);function F(E,C){return E.keywords[C]}function q(){if(!I.keywords){H.addText(P);return}let E=0;I.keywordPatternRe.lastIndex=0;let C=I.keywordPatternRe.exec(P),k="";for(;C;){k+=P.substring(E,C.index);const N=tn.case_insensitive?C[0].toLowerCase():C[0],z=F(I,N);if(z){const[sn,Tu]=z;if(H.addText(k),k="",L[N]=(L[N]||0)+1,L[N]<=Qo&&(Hn+=Tu),sn.startsWith("_"))k+=C[0];else{const Au=tn.classNameAliases[sn]||sn;en(C[0],Au)}}else k+=C[0];E=I.keywordPatternRe.lastIndex,C=I.keywordPatternRe.exec(P)}k+=P.substring(E),H.addText(k)}function nn(){if(P==="")return;let E=null;if(typeof I.subLanguage=="string"){if(!e[I.subLanguage]){H.addText(P);return}E=f(I.subLanguage,P,!0,Me[I.subLanguage]),Me[I.subLanguage]=E._top}else E=d(P,I.subLanguage.length?I.subLanguage:null);I.relevance>0&&(Hn+=E.relevance),H.__addSublanguage(E._emitter,E.language)}function G(){I.subLanguage!=null?nn():q(),P=""}function en(E,C){E!==""&&(H.startScope(C),H.addText(E),H.endScope())}function ke(E,C){let k=1;const N=C.length-1;for(;k<=N;){if(!E._emit[k]){k++;continue}const z=tn.classNameAliases[E[k]]||E[k],sn=C[k];z?en(sn,z):(P=sn,q(),P=""),k++}}function Le(E,C){return E.scope&&typeof E.scope=="string"&&H.openNode(tn.classNameAliases[E.scope]||E.scope),E.beginScope&&(E.beginScope._wrap?(en(P,tn.classNameAliases[E.beginScope._wrap]||E.beginScope._wrap),P=""):E.beginScope._multi&&(ke(E.beginScope,C),P="")),I=Object.create(E,{parent:{value:I}}),I}function Oe(E,C,k){let N=fo(E.endRe,k);if(N){if(E["on:end"]){const z=new at(E);E["on:end"](C,z),z.isMatchIgnored&&(N=!1)}if(N){for(;E.endsParent&&E.parent;)E=E.parent;return E}}if(E.endsWithParent)return Oe(E.parent,C,k)}function mu(E){return I.matcher.regexIndex===0?(P+=E[0],1):(ie=!0,0)}function gu(E){const C=E[0],k=E.rule,N=new at(k),z=[k.__beforeBegin,k["on:begin"]];for(const sn of z)if(sn&&(sn(E,N),N.isMatchIgnored))return mu(C);return k.skip?P+=C:(k.excludeBegin&&(P+=C),G(),!k.returnBegin&&!k.excludeBegin&&(P=C)),Le(k,E),k.returnBegin?0:C.length}function Eu(E){const C=E[0],k=x.substring(E.index),N=Oe(I,E,k);if(!N)return dt;const z=I;I.endScope&&I.endScope._wrap?(G(),en(C,I.endScope._wrap)):I.endScope&&I.endScope._multi?(G(),ke(I.endScope,E)):z.skip?P+=C:(z.returnEnd||z.excludeEnd||(P+=C),G(),z.excludeEnd&&(P=C));do I.scope&&H.closeNode(),!I.skip&&!I.subLanguage&&(Hn+=I.relevance),I=I.parent;while(I!==N.parent);return N.starts&&Le(N.starts,E),z.returnEnd?0:C.length}function hu(){const E=[];for(let C=I;C!==tn;C=C.parent)C.scope&&E.unshift(C.scope);E.forEach(C=>H.openNode(C))}let jn={};function Ne(E,C){const k=C&&C[0];if(P+=E,k==null)return G(),0;if(jn.type==="begin"&&C.type==="end"&&jn.index===C.index&&k===""){if(P+=x.slice(C.index,C.index+1),!r){const N=new Error(`0 width match regex (${m})`);throw N.languageName=m,N.badRule=jn.rule,N}return 1}if(jn=C,C.type==="begin")return gu(C);if(C.type==="illegal"&&!S){const N=new Error('Illegal lexeme "'+k+'" for mode "'+(I.scope||"<unnamed>")+'"');throw N.mode=I,N}else if(C.type==="end"){const N=Eu(C);if(N!==dt)return N}if(C.type==="illegal"&&k==="")return P+=`
`,1;if(ae>1e5&&ae>C.index*3)throw new Error("potential infinite loop, way more iterations than matches");return P+=k,k.length}const tn=M(m);if(!tn)throw Tn(a.replace("{}",m)),new Error('Unknown language: "'+m+'"');const _u=Vo(tn);let re="",I=R||_u;const Me={},H=new i.__emitter(i);hu();let P="",Hn=0,En=0,ae=0,ie=!1;try{if(tn.__emitTokens)tn.__emitTokens(x,H);else{for(I.matcher.considerAll();;){ae++,ie?ie=!1:I.matcher.considerAll(),I.matcher.lastIndex=En;const E=I.matcher.exec(x);if(!E)break;const C=x.substring(En,E.index),k=Ne(C,E);En=E.index+k}Ne(x.substring(En))}return H.finalize(),re=H.toHTML(),{language:m,value:re,relevance:Hn,illegal:!1,_emitter:H,_top:I}}catch(E){if(E.message&&E.message.includes("Illegal"))return{language:m,value:me(x),illegal:!0,relevance:0,_illegalBy:{message:E.message,index:En,context:x.slice(En-100,En+100),mode:E.mode,resultSoFar:re},_emitter:H};if(r)return{language:m,value:me(x),illegal:!1,relevance:0,errorRaised:E,_emitter:H,_top:I};throw E}}function b(m){const x={value:me(m),illegal:!1,relevance:0,_top:o,_emitter:new i.__emitter(i)};return x._emitter.addText(m),x}function d(m,x){x=x||i.languages||Object.keys(e);const S=b(m),R=x.filter(M).filter(W).map(G=>f(G,m,!1));R.unshift(S);const L=R.sort((G,en)=>{if(G.relevance!==en.relevance)return en.relevance-G.relevance;if(G.language&&en.language){if(M(G.language).supersetOf===en.language)return 1;if(M(en.language).supersetOf===G.language)return-1}return 0}),[F,q]=L,nn=F;return nn.secondBest=q,nn}function p(m,x,S){const R=x&&t[x]||S;m.classList.add("hljs"),m.classList.add(`language-${R}`)}function g(m){let x=null;const S=s(m);if(c(S))return;if(Z("before:highlightElement",{el:m,language:S}),m.dataset.highlighted){console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.",m);return}if(m.children.length>0&&(i.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(m)),i.throwUnescapedHTML))throw new Yo("One of your code blocks includes unescaped HTML.",m.innerHTML);x=m;const R=x.textContent,L=S?l(R,{language:S,ignoreIllegals:!0}):d(R);m.innerHTML=L.value,m.dataset.highlighted="yes",p(m,S,L.language),m.result={language:L.language,re:L.relevance,relevance:L.relevance},L.secondBest&&(m.secondBest={language:L.secondBest.language,relevance:L.secondBest.relevance}),Z("after:highlightElement",{el:m,result:L,text:R})}function h(m){i=lt(i,m)}const v=()=>{D(),Dn("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")};function _(){D(),Dn("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")}let T=!1;function D(){function m(){D()}if(document.readyState==="loading"){T||window.addEventListener("DOMContentLoaded",m,!1),T=!0;return}document.querySelectorAll(i.cssSelector).forEach(g)}function A(m,x){let S=null;try{S=x(n)}catch(R){if(Tn("Language definition for '{}' could not be registered.".replace("{}",m)),r)Tn(R);else throw R;S=o}S.name||(S.name=m),e[m]=S,S.rawDefinition=x.bind(null,n),S.aliases&&B(S.aliases,{languageName:m})}function y(m){delete e[m];for(const x of Object.keys(t))t[x]===m&&delete t[x]}function O(){return Object.keys(e)}function M(m){return m=(m||"").toLowerCase(),e[m]||e[t[m]]}function B(m,{languageName:x}){typeof m=="string"&&(m=[m]),m.forEach(S=>{t[S.toLowerCase()]=x})}function W(m){const x=M(m);return x&&!x.disableAutodetect}function cn(m){m["before:highlightBlock"]&&!m["before:highlightElement"]&&(m["before:highlightElement"]=x=>{m["before:highlightBlock"](Object.assign({block:x.el},x))}),m["after:highlightBlock"]&&!m["after:highlightElement"]&&(m["after:highlightElement"]=x=>{m["after:highlightBlock"](Object.assign({block:x.el},x))})}function mn(m){cn(m),u.push(m)}function gn(m){const x=u.indexOf(m);x!==-1&&u.splice(x,1)}function Z(m,x){const S=m;u.forEach(function(R){R[S]&&R[S](x)})}function $(m){return Dn("10.7.0","highlightBlock will be removed entirely in v12.0"),Dn("10.7.0","Please use highlightElement now."),g(m)}Object.assign(n,{highlight:l,highlightAuto:d,highlightAll:D,highlightElement:g,highlightBlock:$,configure:h,initHighlighting:v,initHighlightingOnLoad:_,registerLanguage:A,unregisterLanguage:y,listLanguages:O,getLanguage:M,registerAliases:B,autoDetection:W,inherit:lt,addPlugin:mn,removePlugin:gn}),n.debugMode=function(){r=!1},n.safeMode=function(){r=!0},n.versionString=$o,n.regex={concat:An,lookahead:Wt,either:Ie,optional:lo,anyNumberOfTimes:so};for(const m in Kn)typeof Kn[m]=="object"&&Gt(Kn[m]);return Object.assign(n,Kn),n},vn=uu({});vn.newInstance=()=>uu({});var Zo=vn;vn.HighlightJS=vn;vn.default=vn;const J=Su(Zo);var xn="[0-9](_*[0-9])*",Gn=`\\.(${xn})`,Vn="[0-9a-fA-F](_*[0-9a-fA-F])*",pt={className:"number",variants:[{begin:`(\\b(${xn})((${Gn})|\\.)?|(${Gn}))[eE][+-]?(${xn})[fFdD]?\\b`},{begin:`\\b(${xn})((${Gn})[fFdD]?\\b|\\.([fFdD]\\b)?)`},{begin:`(${Gn})[fFdD]?\\b`},{begin:`\\b(${xn})[fFdD]\\b`},{begin:`\\b0[xX]((${Vn})\\.?|(${Vn})?\\.(${Vn}))[pP][+-]?(${xn})[fFdD]?\\b`},{begin:"\\b(0|[1-9](_*[0-9])*)[lL]?\\b"},{begin:`\\b0[xX](${Vn})[lL]?\\b`},{begin:"\\b0(_*[0-7])*[lL]?\\b"},{begin:"\\b0[bB][01](_*[01])*[lL]?\\b"}],relevance:0};function ru(n,e,t){return t===-1?"":n.replace(e,u=>ru(n,e,t-1))}function Xo(n){const e=n.regex,t="[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*",u=t+ru("(?:<"+t+"~~~(?:\\s*,\\s*"+t+"~~~)*>)?",/~~~/g,2),c={keyword:["synchronized","abstract","private","var","static","if","const ","for","while","strictfp","finally","protected","import","native","final","void","enum","else","break","transient","catch","instanceof","volatile","case","assert","package","default","public","try","switch","continue","throws","protected","public","private","module","requires","exports","do","sealed","yield","permits","goto","when"],literal:["false","true","null"],type:["char","boolean","long","float","int","byte","short","double"],built_in:["super","this"]},s={className:"meta",begin:"@"+t,contains:[{begin:/\(/,end:/\)/,contains:["self"]}]},l={className:"params",begin:/\(/,end:/\)/,keywords:c,relevance:0,contains:[n.C_BLOCK_COMMENT_MODE],endsParent:!0};return{name:"Java",aliases:["jsp"],keywords:c,illegal:/<\/|#/,contains:[n.COMMENT("/\\*\\*","\\*/",{relevance:0,contains:[{begin:/\w+@/,relevance:0},{className:"doctag",begin:"@[A-Za-z]+"}]}),{begin:/import java\.[a-z]+\./,keywords:"import",relevance:2},n.C_LINE_COMMENT_MODE,n.C_BLOCK_COMMENT_MODE,{begin:/"""/,end:/"""/,className:"string",contains:[n.BACKSLASH_ESCAPE]},n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,{match:[/\b(?:class|interface|enum|extends|implements|new)/,/\s+/,t],className:{1:"keyword",3:"title.class"}},{match:/non-sealed/,scope:"keyword"},{begin:[e.concat(/(?!else)/,t),/\s+/,t,/\s+/,/=(?!=)/],className:{1:"type",3:"variable",5:"operator"}},{begin:[/record/,/\s+/,t],className:{1:"keyword",3:"title.class"},contains:[l,n.C_LINE_COMMENT_MODE,n.C_BLOCK_COMMENT_MODE]},{beginKeywords:"new throw return else",relevance:0},{begin:["(?:"+u+"\\s+)",n.UNDERSCORE_IDENT_RE,/\s*(?=\()/],className:{2:"title.function"},keywords:c,contains:[{className:"params",begin:/\(/,end:/\)/,keywords:c,relevance:0,contains:[s,n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,pt,n.C_BLOCK_COMMENT_MODE]},n.C_LINE_COMMENT_MODE,n.C_BLOCK_COMMENT_MODE]},pt,s]}}function ft(n){const e=n.regex,t=e.concat(/[\p{L}_]/u,e.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),u=/[\p{L}0-9._:-]+/u,r={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},a={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},o=n.inherit(a,{begin:/\(/,end:/\)/}),i=n.inherit(n.APOS_STRING_MODE,{className:"string"}),c=n.inherit(n.QUOTE_STRING_MODE,{className:"string"}),s={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:u,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[r]},{begin:/'/,end:/'/,contains:[r]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[a,c,i,o,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[a,o,c,i]}]}]},n.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},r,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[c]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[s],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[s],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:e.concat(/</,e.lookahead(e.concat(t,e.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:t,relevance:0,starts:s}]},{className:"tag",begin:e.concat(/<\//,e.lookahead(e.concat(t,/>/))),contains:[{className:"name",begin:t,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}}const bt="[A-Za-z$_][0-9A-Za-z$_]*",nc=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends","using"],ec=["true","false","null","undefined","NaN","Infinity"],au=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],iu=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],ou=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],tc=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],uc=[].concat(ou,au,iu);function mt(n){const e=n.regex,t=(S,{after:R})=>{const L="</"+S[0].slice(1);return S.input.indexOf(L,R)!==-1},u=bt,r={begin:"<>",end:"</>"},a=/<[A-Za-z0-9\\._:-]+\s*\/>/,o={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(S,R)=>{const L=S[0].length+S.index,F=S.input[L];if(F==="<"||F===","){R.ignoreMatch();return}F===">"&&(t(S,{after:L})||R.ignoreMatch());let q;const nn=S.input.substring(L);if(q=nn.match(/^\s*=/)){R.ignoreMatch();return}if((q=nn.match(/^\s+extends\s+/))&&q.index===0){R.ignoreMatch();return}}},i={$pattern:bt,keyword:nc,literal:ec,built_in:uc,"variable.language":tc},c="[0-9](_?[0-9])*",s=`\\.(${c})`,l="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",f={className:"number",variants:[{begin:`(\\b(${l})((${s})|\\.)?|(${s}))[eE][+-]?(${c})\\b`},{begin:`\\b(${l})\\b((${s})\\b|\\.)?|(${s})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},b={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},d={begin:".?html`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"xml"}},p={begin:".?css`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"css"}},g={begin:".?gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"graphql"}},h={className:"string",begin:"`",end:"`",contains:[n.BACKSLASH_ESCAPE,b]},_={className:"comment",variants:[n.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:u+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),n.C_BLOCK_COMMENT_MODE,n.C_LINE_COMMENT_MODE]},T=[n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,d,p,g,h,{match:/\$\d+/},f];b.contains=T.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(T)});const D=[].concat(_,b.contains),A=D.concat([{begin:/(\s*)\(/,end:/\)/,keywords:i,contains:["self"].concat(D)}]),y={className:"params",begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:A},O={variants:[{match:[/class/,/\s+/,u,/\s+/,/extends/,/\s+/,e.concat(u,"(",e.concat(/\./,u),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,u],scope:{1:"keyword",3:"title.class"}}]},M={relevance:0,match:e.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...au,...iu]}},B={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},W={variants:[{match:[/function/,/\s+/,u,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[y],illegal:/%/},cn={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function mn(S){return e.concat("(?!",S.join("|"),")")}const gn={match:e.concat(/\b/,mn([...ou,"super","import"].map(S=>`${S}\\s*\\(`)),u,e.lookahead(/\s*\(/)),className:"title.function",relevance:0},Z={begin:e.concat(/\./,e.lookahead(e.concat(u,/(?![0-9A-Za-z$_(])/))),end:u,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},$={match:[/get|set/,/\s+/,u,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},y]},m="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+n.UNDERSCORE_IDENT_RE+")\\s*=>",x={match:[/const|var|let/,/\s+/,u,/\s*/,/=\s*/,/(async\s*)?/,e.lookahead(m)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[y]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:A,CLASS_REFERENCE:M},illegal:/#(?![$_A-z])/,contains:[n.SHEBANG({label:"shebang",binary:"node",relevance:5}),B,n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,d,p,g,h,_,{match:/\$\d+/},f,M,{scope:"attr",match:u+e.lookahead(":"),relevance:0},x,{begin:"("+n.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[_,n.REGEXP_MODE,{className:"function",begin:m,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:n.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:A}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:r.begin,end:r.end},{match:a},{begin:o.begin,"on:begin":o.isTrulyOpeningTag,end:o.end}],subLanguage:"xml",contains:[{begin:o.begin,end:o.end,skip:!0,contains:["self"]}]}]},W,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+n.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[y,n.inherit(n.TITLE_MODE,{begin:u,className:"title.function"})]},{match:/\.\.\./,relevance:0},Z,{match:"\\$"+u,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[y]},gn,cn,O,$,{match:/\$[(.]/}]}}const Qn="[A-Za-z$_][0-9A-Za-z$_]*",cu=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends","using"],su=["true","false","null","undefined","NaN","Infinity"],lu=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],du=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],pu=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],fu=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],bu=[].concat(pu,lu,du);function rc(n){const e=n.regex,t=(S,{after:R})=>{const L="</"+S[0].slice(1);return S.input.indexOf(L,R)!==-1},u=Qn,r={begin:"<>",end:"</>"},a=/<[A-Za-z0-9\\._:-]+\s*\/>/,o={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(S,R)=>{const L=S[0].length+S.index,F=S.input[L];if(F==="<"||F===","){R.ignoreMatch();return}F===">"&&(t(S,{after:L})||R.ignoreMatch());let q;const nn=S.input.substring(L);if(q=nn.match(/^\s*=/)){R.ignoreMatch();return}if((q=nn.match(/^\s+extends\s+/))&&q.index===0){R.ignoreMatch();return}}},i={$pattern:Qn,keyword:cu,literal:su,built_in:bu,"variable.language":fu},c="[0-9](_?[0-9])*",s=`\\.(${c})`,l="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",f={className:"number",variants:[{begin:`(\\b(${l})((${s})|\\.)?|(${s}))[eE][+-]?(${c})\\b`},{begin:`\\b(${l})\\b((${s})\\b|\\.)?|(${s})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},b={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},d={begin:".?html`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"xml"}},p={begin:".?css`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"css"}},g={begin:".?gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[n.BACKSLASH_ESCAPE,b],subLanguage:"graphql"}},h={className:"string",begin:"`",end:"`",contains:[n.BACKSLASH_ESCAPE,b]},_={className:"comment",variants:[n.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:u+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),n.C_BLOCK_COMMENT_MODE,n.C_LINE_COMMENT_MODE]},T=[n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,d,p,g,h,{match:/\$\d+/},f];b.contains=T.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(T)});const D=[].concat(_,b.contains),A=D.concat([{begin:/(\s*)\(/,end:/\)/,keywords:i,contains:["self"].concat(D)}]),y={className:"params",begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:A},O={variants:[{match:[/class/,/\s+/,u,/\s+/,/extends/,/\s+/,e.concat(u,"(",e.concat(/\./,u),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,u],scope:{1:"keyword",3:"title.class"}}]},M={relevance:0,match:e.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...lu,...du]}},B={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},W={variants:[{match:[/function/,/\s+/,u,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[y],illegal:/%/},cn={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function mn(S){return e.concat("(?!",S.join("|"),")")}const gn={match:e.concat(/\b/,mn([...pu,"super","import"].map(S=>`${S}\\s*\\(`)),u,e.lookahead(/\s*\(/)),className:"title.function",relevance:0},Z={begin:e.concat(/\./,e.lookahead(e.concat(u,/(?![0-9A-Za-z$_(])/))),end:u,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},$={match:[/get|set/,/\s+/,u,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},y]},m="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+n.UNDERSCORE_IDENT_RE+")\\s*=>",x={match:[/const|var|let/,/\s+/,u,/\s*/,/=\s*/,/(async\s*)?/,e.lookahead(m)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[y]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:A,CLASS_REFERENCE:M},illegal:/#(?![$_A-z])/,contains:[n.SHEBANG({label:"shebang",binary:"node",relevance:5}),B,n.APOS_STRING_MODE,n.QUOTE_STRING_MODE,d,p,g,h,_,{match:/\$\d+/},f,M,{scope:"attr",match:u+e.lookahead(":"),relevance:0},x,{begin:"("+n.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[_,n.REGEXP_MODE,{className:"function",begin:m,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:n.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:A}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:r.begin,end:r.end},{match:a},{begin:o.begin,"on:begin":o.isTrulyOpeningTag,end:o.end}],subLanguage:"xml",contains:[{begin:o.begin,end:o.end,skip:!0,contains:["self"]}]}]},W,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+n.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[y,n.inherit(n.TITLE_MODE,{begin:u,className:"title.function"})]},{match:/\.\.\./,relevance:0},Z,{match:"\\$"+u,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[y]},gn,cn,O,$,{match:/\$[(.]/}]}}function gt(n){const e=n.regex,t=rc(n),u=Qn,r=["any","void","number","boolean","string","object","never","symbol","bigint","unknown"],a={begin:[/namespace/,/\s+/,n.IDENT_RE],beginScope:{1:"keyword",3:"title.class"}},o={beginKeywords:"interface",end:/\{/,excludeEnd:!0,keywords:{keyword:"interface extends",built_in:r},contains:[t.exports.CLASS_REFERENCE]},i={className:"meta",relevance:10,begin:/^\s*['"]use strict['"]/},c=["type","interface","public","private","protected","implements","declare","abstract","readonly","enum","override","satisfies"],s={$pattern:Qn,keyword:cu.concat(c),literal:su,built_in:bu.concat(r),"variable.language":fu},l={className:"meta",begin:"@"+u},f=(g,h,v)=>{const _=g.contains.findIndex(T=>T.label===h);if(_===-1)throw new Error("can not find mode to replace");g.contains.splice(_,1,v)};Object.assign(t.keywords,s),t.exports.PARAMS_CONTAINS.push(l);const b=t.contains.find(g=>g.scope==="attr"),d=Object.assign({},b,{match:e.concat(u,e.lookahead(/\s*\?:/))});t.exports.PARAMS_CONTAINS.push([t.exports.CLASS_REFERENCE,b,d]),t.contains=t.contains.concat([l,a,o,d]),f(t,"shebang",n.SHEBANG()),f(t,"use_strict",i);const p=t.contains.find(g=>g.label==="func.def");return p.relevance=0,Object.assign(t,{name:"TypeScript",aliases:["ts","tsx","mts","cts"]}),t}function ac(n){const e=n.regex,t=n.COMMENT("--","$"),u={scope:"string",variants:[{begin:/'/,end:/'/,contains:[{match:/''/}]}]},r={begin:/"/,end:/"/,contains:[{match:/""/}]},a=["true","false","unknown"],o=["double precision","large object","with timezone","without timezone"],i=["bigint","binary","blob","boolean","char","character","clob","date","dec","decfloat","decimal","float","int","integer","interval","nchar","nclob","national","numeric","real","row","smallint","time","timestamp","varchar","varying","varbinary"],c=["add","asc","collation","desc","final","first","last","view"],s=["abs","acos","all","allocate","alter","and","any","are","array","array_agg","array_max_cardinality","as","asensitive","asin","asymmetric","at","atan","atomic","authorization","avg","begin","begin_frame","begin_partition","between","bigint","binary","blob","boolean","both","by","call","called","cardinality","cascaded","case","cast","ceil","ceiling","char","char_length","character","character_length","check","classifier","clob","close","coalesce","collate","collect","column","commit","condition","connect","constraint","contains","convert","copy","corr","corresponding","cos","cosh","count","covar_pop","covar_samp","create","cross","cube","cume_dist","current","current_catalog","current_date","current_default_transform_group","current_path","current_role","current_row","current_schema","current_time","current_timestamp","current_path","current_role","current_transform_group_for_type","current_user","cursor","cycle","date","day","deallocate","dec","decimal","decfloat","declare","default","define","delete","dense_rank","deref","describe","deterministic","disconnect","distinct","double","drop","dynamic","each","element","else","empty","end","end_frame","end_partition","end-exec","equals","escape","every","except","exec","execute","exists","exp","external","extract","false","fetch","filter","first_value","float","floor","for","foreign","frame_row","free","from","full","function","fusion","get","global","grant","group","grouping","groups","having","hold","hour","identity","in","indicator","initial","inner","inout","insensitive","insert","int","integer","intersect","intersection","interval","into","is","join","json_array","json_arrayagg","json_exists","json_object","json_objectagg","json_query","json_table","json_table_primitive","json_value","lag","language","large","last_value","lateral","lead","leading","left","like","like_regex","listagg","ln","local","localtime","localtimestamp","log","log10","lower","match","match_number","match_recognize","matches","max","member","merge","method","min","minute","mod","modifies","module","month","multiset","national","natural","nchar","nclob","new","no","none","normalize","not","nth_value","ntile","null","nullif","numeric","octet_length","occurrences_regex","of","offset","old","omit","on","one","only","open","or","order","out","outer","over","overlaps","overlay","parameter","partition","pattern","per","percent","percent_rank","percentile_cont","percentile_disc","period","portion","position","position_regex","power","precedes","precision","prepare","primary","procedure","ptf","range","rank","reads","real","recursive","ref","references","referencing","regr_avgx","regr_avgy","regr_count","regr_intercept","regr_r2","regr_slope","regr_sxx","regr_sxy","regr_syy","release","result","return","returns","revoke","right","rollback","rollup","row","row_number","rows","running","savepoint","scope","scroll","search","second","seek","select","sensitive","session_user","set","show","similar","sin","sinh","skip","smallint","some","specific","specifictype","sql","sqlexception","sqlstate","sqlwarning","sqrt","start","static","stddev_pop","stddev_samp","submultiset","subset","substring","substring_regex","succeeds","sum","symmetric","system","system_time","system_user","table","tablesample","tan","tanh","then","time","timestamp","timezone_hour","timezone_minute","to","trailing","translate","translate_regex","translation","treat","trigger","trim","trim_array","true","truncate","uescape","union","unique","unknown","unnest","update","upper","user","using","value","values","value_of","var_pop","var_samp","varbinary","varchar","varying","versioning","when","whenever","where","width_bucket","window","with","within","without","year"],l=["abs","acos","array_agg","asin","atan","avg","cast","ceil","ceiling","coalesce","corr","cos","cosh","count","covar_pop","covar_samp","cume_dist","dense_rank","deref","element","exp","extract","first_value","floor","json_array","json_arrayagg","json_exists","json_object","json_objectagg","json_query","json_table","json_table_primitive","json_value","lag","last_value","lead","listagg","ln","log","log10","lower","max","min","mod","nth_value","ntile","nullif","percent_rank","percentile_cont","percentile_disc","position","position_regex","power","rank","regr_avgx","regr_avgy","regr_count","regr_intercept","regr_r2","regr_slope","regr_sxx","regr_sxy","regr_syy","row_number","sin","sinh","sqrt","stddev_pop","stddev_samp","substring","substring_regex","sum","tan","tanh","translate","translate_regex","treat","trim","trim_array","unnest","upper","value_of","var_pop","var_samp","width_bucket"],f=["current_catalog","current_date","current_default_transform_group","current_path","current_role","current_schema","current_transform_group_for_type","current_user","session_user","system_time","system_user","current_time","localtime","current_timestamp","localtimestamp"],b=["create table","insert into","primary key","foreign key","not null","alter table","add constraint","grouping sets","on overflow","character set","respect nulls","ignore nulls","nulls first","nulls last","depth first","breadth first"],d=l,p=[...s,...c].filter(A=>!l.includes(A)),g={scope:"variable",match:/@[a-z0-9][a-z0-9_]*/},h={scope:"operator",match:/[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,relevance:0},v={match:e.concat(/\b/,e.either(...d),/\s*\(/),relevance:0,keywords:{built_in:d}};function _(A){return e.concat(/\b/,e.either(...A.map(y=>y.replace(/\s+/,"\\s+"))),/\b/)}const T={scope:"keyword",match:_(b),relevance:0};function D(A,{exceptions:y,when:O}={}){const M=O;return y=y||[],A.map(B=>B.match(/\|\d+$/)||y.includes(B)?B:M(B)?`${B}|0`:B)}return{name:"SQL",case_insensitive:!0,illegal:/[{}]|<\//,keywords:{$pattern:/\b[\w\.]+/,keyword:D(p,{when:A=>A.length<3}),literal:a,type:i,built_in:f},contains:[{scope:"type",match:_(o)},T,v,g,u,r,n.C_NUMBER_MODE,n.C_BLOCK_COMMENT_MODE,t,h]}}function Et(n){const e=n.regex,t={},u={begin:/\$\{/,end:/\}/,contains:["self",{begin:/:-/,contains:[t]}]};Object.assign(t,{className:"variable",variants:[{begin:e.concat(/\$[\w\d#@][\w\d_]*/,"(?![\\w\\d])(?![$])")},u]});const r={className:"subst",begin:/\$\(/,end:/\)/,contains:[n.BACKSLASH_ESCAPE]},a=n.inherit(n.COMMENT(),{match:[/(^|\s)/,/#.*$/],scope:{2:"comment"}}),o={begin:/<<-?\s*(?=\w+)/,starts:{contains:[n.END_SAME_AS_BEGIN({begin:/(\w+)/,end:/(\w+)/,className:"string"})]}},i={className:"string",begin:/"/,end:/"/,contains:[n.BACKSLASH_ESCAPE,t,r]};r.contains.push(i);const c={match:/\\"/},s={className:"string",begin:/'/,end:/'/},l={match:/\\'/},f={begin:/\$?\(\(/,end:/\)\)/,contains:[{begin:/\d+#[0-9a-f]+/,className:"number"},n.NUMBER_MODE,t]},b=["fish","bash","zsh","sh","csh","ksh","tcsh","dash","scsh"],d=n.SHEBANG({binary:`(${b.join("|")})`,relevance:10}),p={className:"function",begin:/\w[\w\d_]*\s*\(\s*\)\s*\{/,returnBegin:!0,contains:[n.inherit(n.TITLE_MODE,{begin:/\w[\w\d_]*/})],relevance:0},g=["if","then","else","elif","fi","time","for","while","until","in","do","done","case","esac","coproc","function","select"],h=["true","false"],v={match:/(\/[a-z._-]+)+/},_=["break","cd","continue","eval","exec","exit","export","getopts","hash","pwd","readonly","return","shift","test","times","trap","umask","unset"],T=["alias","bind","builtin","caller","command","declare","echo","enable","help","let","local","logout","mapfile","printf","read","readarray","source","sudo","type","typeset","ulimit","unalias"],D=["autoload","bg","bindkey","bye","cap","chdir","clone","comparguments","compcall","compctl","compdescribe","compfiles","compgroups","compquote","comptags","comptry","compvalues","dirs","disable","disown","echotc","echoti","emulate","fc","fg","float","functions","getcap","getln","history","integer","jobs","kill","limit","log","noglob","popd","print","pushd","pushln","rehash","sched","setcap","setopt","stat","suspend","ttyctl","unfunction","unhash","unlimit","unsetopt","vared","wait","whence","where","which","zcompile","zformat","zftp","zle","zmodload","zparseopts","zprof","zpty","zregexparse","zsocket","zstyle","ztcp"],A=["chcon","chgrp","chown","chmod","cp","dd","df","dir","dircolors","ln","ls","mkdir","mkfifo","mknod","mktemp","mv","realpath","rm","rmdir","shred","sync","touch","truncate","vdir","b2sum","base32","base64","cat","cksum","comm","csplit","cut","expand","fmt","fold","head","join","md5sum","nl","numfmt","od","paste","ptx","pr","sha1sum","sha224sum","sha256sum","sha384sum","sha512sum","shuf","sort","split","sum","tac","tail","tr","tsort","unexpand","uniq","wc","arch","basename","chroot","date","dirname","du","echo","env","expr","factor","groups","hostid","id","link","logname","nice","nohup","nproc","pathchk","pinky","printenv","printf","pwd","readlink","runcon","seq","sleep","stat","stdbuf","stty","tee","test","timeout","tty","uname","unlink","uptime","users","who","whoami","yes"];return{name:"Bash",aliases:["sh","zsh"],keywords:{$pattern:/\b[a-z][a-z0-9._-]+\b/,keyword:g,literal:h,built_in:[..._,...T,"set","shopt",...D,...A]},contains:[d,n.SHEBANG(),p,f,a,o,v,i,c,s,l,t]}}function ic(n){const e={className:"attr",begin:/"(\\.|[^\\"\r\n])*"(?=\s*:)/,relevance:1.01},t={match:/[{}[\],:]/,className:"punctuation",relevance:0},u=["true","false","null"],r={scope:"literal",beginKeywords:u.join(" ")};return{name:"JSON",aliases:["jsonc"],keywords:{literal:u},contains:[e,t,n.QUOTE_STRING_MODE,r,n.C_NUMBER_MODE,n.C_LINE_COMMENT_MODE,n.C_BLOCK_COMMENT_MODE],illegal:"\\S"}}function ht(n){const e="true false yes no null",t="[\\w#;/?:@&=+$,.~*'()[\\]]+",u={className:"attr",variants:[{begin:/[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/},{begin:/"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/},{begin:/'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/}]},r={className:"template-variable",variants:[{begin:/\{\{/,end:/\}\}/},{begin:/%\{/,end:/\}/}]},a={className:"string",relevance:0,begin:/'/,end:/'/,contains:[{match:/''/,scope:"char.escape",relevance:0}]},o={className:"string",relevance:0,variants:[{begin:/"/,end:/"/},{begin:/\S+/}],contains:[n.BACKSLASH_ESCAPE,r]},i=n.inherit(o,{variants:[{begin:/'/,end:/'/,contains:[{begin:/''/,relevance:0}]},{begin:/"/,end:/"/},{begin:/[^\s,{}[\]]+/}]}),b={className:"number",begin:"\\b"+"[0-9]{4}(-[0-9][0-9]){0,2}"+"([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?"+"(\\.[0-9]*)?"+"([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?"+"\\b"},d={end:",",endsWithParent:!0,excludeEnd:!0,keywords:e,relevance:0},p={begin:/\{/,end:/\}/,contains:[d],illegal:"\\n",relevance:0},g={begin:"\\[",end:"\\]",contains:[d],illegal:"\\n",relevance:0},h=[u,{className:"meta",begin:"^---\\s*$",relevance:10},{className:"string",begin:"[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"},{begin:"<%[%=-]?",end:"[%-]?%>",subLanguage:"ruby",excludeBegin:!0,excludeEnd:!0,relevance:0},{className:"type",begin:"!\\w+!"+t},{className:"type",begin:"!<"+t+">"},{className:"type",begin:"!"+t},{className:"type",begin:"!!"+t},{className:"meta",begin:"&"+n.UNDERSCORE_IDENT_RE+"$"},{className:"meta",begin:"\\*"+n.UNDERSCORE_IDENT_RE+"$"},{className:"bullet",begin:"-(?=[ ]|$)",relevance:0},n.HASH_COMMENT_MODE,{beginKeywords:e,keywords:{literal:e}},b,{className:"number",begin:n.C_NUMBER_RE+"\\b",relevance:0},p,g,a,o],v=[...h];return v.pop(),v.push(i),d.contains=v,{name:"YAML",case_insensitive:!0,aliases:["yml"],contains:h}}function oc(n){const e="[ \\t\\f]*",t="[ \\t\\f]+",u=e+"[:=]"+e,r=t,a="("+u+"|"+r+")",o="([^\\\\:= \\t\\f\\n]|\\\\.)+",i={end:a,relevance:0,starts:{className:"string",end:/$/,relevance:0,contains:[{begin:"\\\\\\\\"},{begin:"\\\\\\n"}]}};return{name:".properties",disableAutodetect:!0,case_insensitive:!0,illegal:/\S/,contains:[n.COMMENT("^\\s*[!#]","$"),{returnBegin:!0,variants:[{begin:o+u},{begin:o+r}],contains:[{className:"attr",begin:o,endsParent:!0}],starts:i},{className:"attr",begin:o+e+"$"}]}}const cc={class:"doc-page"},sc={class:"doc-aside"},lc={class:"aside-inner"},dc={class:"aside-group-title"},pc=["innerHTML"],fc={class:"doc-pager"},bc={class:"pager-inner"},mc={class:"pager-title"},gc={class:"pager-title"},Ec=Du({__name:"DocView",setup(n){J.registerLanguage("java",Xo),J.registerLanguage("xml",ft),J.registerLanguage("html",ft),J.registerLanguage("javascript",mt),J.registerLanguage("js",mt),J.registerLanguage("typescript",gt),J.registerLanguage("ts",gt),J.registerLanguage("sql",ac),J.registerLanguage("bash",Et),J.registerLanguage("sh",Et),J.registerLanguage("json",ic),J.registerLanguage("yaml",ht),J.registerLanguage("yml",ht),J.registerLanguage("properties",oc);const t={html:!1,linkify:!0,typographer:!0,highlight:(b,d)=>{if(d&&J.getLanguage(d))try{return`<pre class="hljs"><code>${J.highlight(b,{language:d,ignoreIllegals:!0}).value}</code></pre>`}catch{}return`<pre class="hljs"><code>${u.utils.escapeHtml(b)}</code></pre>`}},u=new Q(t),r=Object.assign({"/src/docs/java/01-intro.md":Pu,"/src/docs/java/01b-install.md":wu,"/src/docs/java/01c-idea.md":Bu,"/src/docs/java/02-syntax.md":Fu,"/src/docs/java/03-oop.md":Uu,"/src/docs/java/04-collection.md":ju,"/src/docs/java/05-exception-log.md":Hu,"/src/docs/java/06-maven.md":qu,"/src/docs/java/07-junit.md":zu,"/src/docs/java/08-springboot.md":Ju,"/src/docs/java/09-restful.md":Ku,"/src/docs/java/10-layered-arch.md":Gu,"/src/docs/java/11-mybatis-plus.md":Vu,"/src/docs/java/12-response-exception.md":Wu,"/src/docs/java/13-auth-jwt.md":$u,"/src/docs/java/14-redis.md":Yu,"/src/docs/java/15-thread-pool.md":Qu,"/src/docs/java/16-multitenant.md":Zu,"/src/docs/java/17-idempotent.md":Xu,"/src/docs/java/18-rate-limit.md":nr,"/src/docs/java/19-distributed-lock.md":er,"/src/docs/java/20-engineering.md":tr,"/src/docs/mysql/01-install.md":ur,"/src/docs/mysql/02-basic.md":rr,"/src/docs/mysql/03-crud.md":ar,"/src/docs/mysql/04-constraint.md":ir,"/src/docs/mysql/05-datatype.md":or,"/src/docs/mysql/06-index.md":cr,"/src/docs/mysql/07-transaction.md":sr,"/src/docs/mysql/08-lock.md":lr,"/src/docs/mysql/09-optimize.md":dr,"/src/docs/mysql/10-multitenant-data.md":pr,"/src/docs/project/01-overview.md":fr,"/src/docs/project/02-tenant-rbac.md":br,"/src/docs/project/03-product.md":mr,"/src/docs/project/04-order-state.md":gr,"/src/docs/project/05-stock.md":Er,"/src/docs/project/06-pay.md":hr,"/src/docs/project/07-api-list.md":_r}),a=yu(),o=Iu(),i=Cu("加载中..."),c=Fe(()=>{const b=a.params.category,d=a.params.slug;return`${b}-${d}`});function s(b){const d=Mu[b];if(!d){i.value="## 文档不存在或正在编写中...";return}const p=Object.keys(r).find(h=>h.endsWith("/"+d)),g=p?r[p]:null;if(!g){i.value=`## 文档文件未找到

请检查 \`site/src/${d}\` 是否存在。`;return}i.value=u.render(g)}xu(c,b=>s(b),{immediate:!0});const l=Fe(()=>{const b=[];for(const p of Ue)for(const g of p.items)b.push({group:p.title,base:p.base,title:g.title,path:g.path});const d=b.findIndex(p=>p.base.endsWith("/"+a.params.category)&&p.path===a.params.slug);return{prev:d>0?b[d-1]:null,next:d>=0&&d<b.length-1?b[d+1]:null}});function f(b){b&&o.push(b.base+"/"+b.path)}return(b,d)=>{const p=vu("RouterLink");return hn(),Sn("div",cc,[Y("aside",sc,[Y("div",lc,[d[2]||(d[2]=Y("h3",null,"学习目录",-1)),(hn(!0),Sn(Pe,null,we(oe(Ue),g=>(hn(),Sn("div",{key:g.title,class:"aside-group"},[Y("div",dc,qn(g.title),1),(hn(!0),Sn(Pe,null,we(g.items,h=>(hn(),Ru(p,{key:h.path,to:g.base+"/"+h.path,class:Ou(["aside-link",{active:g.base.endsWith("/"+oe(a).params.category)&&h.path===oe(a).params.slug}])},{default:ku(()=>[Lu(qn(h.title),1)]),_:2},1032,["to","class"]))),128))]))),128))])]),Y("article",{class:"doc-content",innerHTML:i.value},null,8,pc),Y("aside",fc,[Y("div",bc,[d[5]||(d[5]=Y("h4",null,"📍 上下篇",-1)),l.value.prev?(hn(),Sn("button",{key:0,class:"pager-btn prev",onClick:d[0]||(d[0]=g=>f(l.value.prev))},[d[3]||(d[3]=Y("span",{class:"pager-label"},"← 上一篇",-1)),Y("span",mc,qn(l.value.prev.title),1)])):Be("",!0),l.value.next?(hn(),Sn("button",{key:1,class:"pager-btn next",onClick:d[1]||(d[1]=g=>f(l.value.next))},[d[4]||(d[4]=Y("span",{class:"pager-label"},"下一篇 →",-1)),Y("span",gc,qn(l.value.next.title),1)])):Be("",!0)])])])}}}),Tc=Nu(Ec,[["__scopeId","data-v-49876b1e"]]);export{Tc as default};
//# sourceMappingURL=DocView-CTqiofsA.js.map
