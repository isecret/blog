---
title: "Windows 10 下 Docker 启动失败 Docker Desktop Stoped"
excerpt: "前言 最近家里台式机重装了 Windows 10 系统，备份了资料并格式化了所有的磁盘，得需要重新安装应用。 这台机器我的定位始终是游戏机+一台备用机，所以在安装完操作系统后第一时间便安装了腾讯的 Wegame 客户端并下载了英雄联盟，相比"
publishDate: 2022-06-21T01:32:00.000Z
updatedDate: 2022-07-04T06:21:20.000Z
isFeatured: false
tags: []
seo: 
  description: "前言 最近家里台式机重装了 Windows 10 系统，备份了资料并格式化了所有的磁盘，得需要重新安装应用。 这台机器我的定位始终是游戏机+一台备用机，所以在安装完操作系统后第一时间便安装了腾讯的 Wegame 客户端并下载了英雄联盟，相比"
  pageType: article
---
## 前言
最近家里台式机重装了 Windows 10 系统，备份了资料并格式化了所有的磁盘，得需要重新安装应用。

这台机器我的定位始终是游戏机+一台备用机，所以在安装完操作系统后第一时间便安装了腾讯的 Wegame 客户端并下载了英雄联盟，相比先前升级的 Windows 11 来说，掉线的频率似乎也低了很多。

然而最近心血来潮，想学习 Golang，在看了几天文档之后决定开始实操，部署好环境后打算开始学习 Gorm，就得安装 MySQL 数据库环境，本来打算直接用 Docker 部署一个，但最新 Relase 居然启动不了，始终 stoped -> starting -> stoping -> stoped。。

老实说我没遇到过这种问题，后来检索了发现说新版本似乎有问题，有人卸载后安装 v4.4.4 解决了问题，我当然没有这种运气，要是说回退能解决问题的话也就没有这篇文章了。

后来再次检索发现，可以通过 Power Shell 管理员身份执行 `netsh winsock reset` 解决问题，它确实为我解决了问题，也让我安装完 Docker 折腾三个小时后第一次看到 **Docker Desktop is running**，启动后已经是晚上十一点了，便关机睡觉。

第二天，玩完游戏需要出门，想在出门这段时间运行 `docker build` 来构建镜像，然后它又起不来了。。

## 谁在捣乱？
出门后我仔细回想今天到底都做了啥，为什么它又启动不了，以及昨晚的 **Running** 到底是不是错觉。

游戏？

为了验证猜想，我运行了重置 Winsock 后重启了计算机后直接启动 Docker，能够正常启动 Pull 了一个镜像也能正常启动，随后我便退出了 Docker 启动 Wegame，然后重新启动 Docker 也能够正常启动。

接着，退出 Docker 后从 Wegame 启动了 LOL，看着右下角的 Wegame 网络加速：「为您加速 31 ms」就大感不妙，随后启动 Docekr，果然启动失败了。

随后，检索关键字「Windows10 Wegame Docker 冲突」，果然找到了线索，同时找到了一篇讨论的文章，链接如下：[Winsock module breaks WSL2 #4177](https://github.com/microsoft/WSL/issues/4177#issuecomment-597736482)，大概内容是 Wegame 的加速器（基于腾讯加速器组件）使用了 Winsock 设置代理时会影响 LSP DLL 从而导致 WSL2 启动异常，所以在启动时需要将 LSP DLL 排除在 WSL 进程中，并且文章提供了工具。

除了工具外，我在文章 [WSL2启动时提示：参考的对象类型不支持尝试的操作](https://blog.csdn.net/fangye945a/article/details/123832623) 中找到了手动修改注册表的方式，通过运行 `regedit` 命令打开注册表编辑器，进入路径 `计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WinSock2\Parameters\AppId_Catalog\0408F7A3`，修改或新增名称 `AppFullPath`，类型 `字符串值`，数据填入：`C:\Windows\System32\wsl.exe`，修改或新增 `PermittedLspCategories`，类型 `DWORD(32位)值`，数据填入： `0x80000000`。

## Fixed it

首先打开文章提供的工具保存本地，地址: [NoLsp.exe](http://www.proxifier.com/tmp/Test20200228/NoLsp.exe)

然后右键 Windows 图标打开一个「Windows Power Shell（管理员）」并进入工具保存的目录然后执行:

```powershell
NoLsp.exe C:\Windows\System32\wsl.exe
```

## 最后
尝试检索「加速器与 WSL 冲突」关键字会得到更多结果，目前已知腾讯加速器（含 Wegame）和 UU 加速器出现这种情况，如果碰巧电脑上有游戏加速器而 Docker 正好罢工不妨试试这个解决方案。

## 参考
1. [Winsock module breaks WSL2 #4177](https://github.com/microsoft/WSL/issues/4177#issuecomment-597736482)
2. [腾讯这个 Wegame 啊，你要是能火就怪了](https://www.v2ex.com/t/519090)
3. [WSL2启动时提示：参考的对象类型不支持尝试的操作](https://blog.csdn.net/fangye945a/article/details/123832623)

Happy Coding :)
