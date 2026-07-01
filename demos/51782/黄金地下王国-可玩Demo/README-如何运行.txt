黄金地下王国 可玩 Demo

一、推荐运行方式

1. 解压本压缩包。
2. 双击「启动游戏.bat」。
3. 脚本会自动启动本地网页服务器，并打开浏览器访问：
   http://localhost:8000/
4. 浏览器打开后即可开始游戏。

二、为什么不能直接双击 index.html？

本游戏使用浏览器 ES Module，也就是 JavaScript 文件中包含类似：

import xxx from './xxx.js'

这样的模块加载方式。多数浏览器在直接双击打开本地 HTML 文件时，会因为安全限制阻止模块脚本加载，导致游戏无法正常运行。

因此推荐通过本地服务器访问游戏，而不是直接打开 index.html。

三、「启动游戏.bat」做了什么？

它是一个 Windows 启动脚本，主要做三件事：

1. 切换到当前解压后的游戏目录。
2. 自动打开浏览器访问 http://localhost:8000/。
3. 使用 Python 启动本地静态服务器：

   python -m http.server 8000

四、运行前提

你的电脑需要安装 Python，并且可以在命令行中使用 python 命令。

如果双击后提示找不到 python，可以选择以下任一方式：

1. 安装 Python 后重新双击「启动游戏.bat」。
2. 使用 VS Code 的 Live Server 插件打开本目录。
3. 使用其他静态服务器工具运行本目录。

五、包内文件说明

- index.html：游戏入口页面。
- style.css：游戏样式。
- js/：游戏逻辑代码。
- assets/：游戏运行所需图片资源。
- 启动游戏.bat：Windows 一键启动脚本。
- README-如何运行.txt：本说明文件。

六、补充说明

- 本包只包含当前网页游戏运行所需文件：index.html、style.css、js、assets。
- 未纳入「角色立绘」源目录；当前游戏未开放猎人职业，不影响主要体验。
- 游戏数据保存在浏览器 localStorage 中，可使用标题页「重新开始」清档。
- 如需快速测试，可打开浏览器控制台，输入：

  GmConsole.quickSetup()

  这会快速创建队伍并进入迷宫，方便体验战斗和探索流程。
