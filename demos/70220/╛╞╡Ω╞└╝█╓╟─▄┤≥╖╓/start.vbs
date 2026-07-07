' 酒店评价智能分析评分系统 - 一键启动脚本
Option Explicit

Dim fso, shell, scriptPath, rootPath, proxyPath, nodeExe
Dim proxyCmd, result

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' 获取脚本所在目录
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
rootPath = scriptPath
proxyPath = fso.BuildPath(rootPath, "proxy")

' 检查 Node.js
nodeExe = FindNodeJs(shell)
If nodeExe = "" Then
    MsgBox "未检测到 Node.js，请先安装 Node.js。" & vbCrLf & "下载地址：https://nodejs.org", vbCritical, "错误"
    WScript.Quit 1
End If

' 启动代理服务（显示黑色窗口，方便查看日志）
proxyCmd = "cmd /c ""cd /d " & proxyPath & " && " & nodeExe & " proxy.js"""
shell.Run proxyCmd, 1, False

' 等待代理服务启动
WScript.Sleep 4000

' 打开浏览器
shell.Run "http://localhost:3000/", 1, False

' 提示用户
MsgBox "系统已启动！" & vbCrLf & vbCrLf & _
       "代理服务：http://localhost:3000" & vbCrLf & _
       "关闭黑色的 Hotel Review Proxy 窗口即可停止代理服务。", vbInformation, "启动成功"

Set shell = Nothing
Set fso = Nothing

' 查找 node.exe 路径
Function FindNodeJs(shellObj)
    Dim exec, output
    On Error Resume Next
    Set exec = shellObj.Exec("node --version")
    If Err.Number <> 0 Then
        FindNodeJs = ""
        Exit Function
    End If
    output = exec.StdOut.ReadLine()
    If output <> "" Then
        FindNodeJs = "node"
    Else
        FindNodeJs = ""
    End If
    On Error GoTo 0
End Function
