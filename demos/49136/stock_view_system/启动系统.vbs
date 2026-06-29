' 股票观点验证系统 - VBS启动脚本
' 双击即可运行（Windows系统自带支持）

Dim shell, fso, scriptPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取当前文件夹路径
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' 打开浏览器
shell.Run "cmd /c start http://localhost:8501", 0, False

' 启动系统
shell.Run "cmd /c """ & scriptPath & "\start_silent.bat""", 0, False