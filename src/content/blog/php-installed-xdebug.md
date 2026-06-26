---
title: "PHP 安装 XDebug 并配置远程调试"
excerpt: "Xdebug 是一个开放源代码的 PHP 程序调试器 (即一个 Debug 工具)，可以用来跟踪，调试和分析 PHP 程序的运行状况。Xdebug 现在的最新版本添加了对 PHP7 的支持。——摘自『xdebug 百度百科』 如果有学习过 "
publishDate: 2018-04-29T04:56:00.000Z
updatedDate: 2020-12-22T02:04:34.000Z
isFeatured: false
tags: ["成长笔记", "PHP", "XDebug"]
seo: 
  description: "Xdebug 是一个开放源代码的 PHP 程序调试器 (即一个 Debug 工具)，可以用来跟踪，调试和分析 PHP 程序的运行状况。Xdebug 现在的最新版本添加了对 PHP7 的支持。——摘自『xdebug 百度百科』 如果有学习过 "
  pageType: article
---
> Xdebug 是一个开放源代码的 PHP 程序调试器 (即一个 Debug 工具)，可以用来跟踪，调试和分析 PHP 程序的运行状况。Xdebug 现在的最新版本添加了对 PHP7 的支持。——摘自『[xdebug_百度百科](https://baike.baidu.com/item/xdebug/5479630)』

如果有学习过 C 的话，应该使用过 VC++ 的断点调试，可以对执行中的程序进行跟踪，分析程序的执行流程和影响性能缓慢的问题。不过在 PHP 这，却变成了 `var_dump();die();` 一类的暴力手工断点。Xdebug 将很好的改变这一现状。

## 环境

- 网络环境：局域网
- 本地环境：Mac OSX 10.13.4 + Visual Studio Code 1.22.2
- 开发环境：CentOS 7.4 x64、PHP 7.17 NTS x64
- 代码同步：Visual Studio Code（SFTP）

## Window 环境

安装拓展之前需要知道运行环境的 PHP 版本信息，以便下载正确的拓展。

首先，拓展分运行架构，x64 和 x86；其次 PHP 分版本，不同版本的拓展程序不同，以及 TS 和 NTS 版本。

通过右击计算机，属性中可以了解到环境的运行架构。

执行命令来获取 PHP 版本：

```bash
$ php -v
PHP 7.1.7 (cli) (built: Mar 15 2018 11:08:04) ( NTS )
Copyright (c) 1997-2017 The PHP Group
Zend Engine v3.1.0, Copyright (c) 1998-2017 Zend Technologies
    with Xdebug v2.7.0alpha1, Copyright (c) 2002-2018, by Derick Rethans
```

PHP 版本为 7.1.7，NTS 版本。

来到 XDebug 的官方站点下载对应拓展：[Xdebug:[Downloads]](https://xdebug.org/download.php)。

## Unix 环境

Unix 环境下，测试服务器下载拓展：

```bash
$ wget https://xdebug.org/files/xdebug-2.7.0alpha1.tgz
```

解压拓展包并进入解压目录：

```bash
$ tar zxvf xdebug-2.7.0alpha1.tgz
$ cd xdebug-2.7.0alpha1
```

执行编译：

```bash
$ phpize
$ ./configure --enable-xdebug --with-php-config=/usr/local/php/bin/php-config # php 配置目录请以实际环境修改
# 省略...
$ make && make install
# 省略...
Installing shared extensions:     /usr/local/php/lib/php/extensions/no-debug-non-zts-20160303/
# 省略...
```

复制上拓展的存放目录，这很重要。

现在打开编辑 `php.ini` 文件：

```bash
$ /usr/local/php/etc/php.ini
```

底部追加 Xdebug 配置：

```ini
zend_extension=/usr/local/php/lib/php/extensions/no-debug-non-zts-20160303/xdebug.so
[XDebug]
xdebug.remote_enable = on
xdebug.remote_autostart = 1
;xdebug.remote_host = 192.168.10.1
xdebug.remote_port = 9000
xdebug.remote_connect_back = 1
xdebug.auto_trace = 1
xdebug.collect_includes = 1
xdebug.collect_params = 1
xdebug.remote_log = /tmp/xdebug.log
```

以上配置中已经开启了远程调试。若是本机环境则配置 `remote_enable` 为 `0` 即可。

配置完成后，重启 PHP：

```bash
$ service php-fpm restart
```

然后查看配置是否成功：

```bash
$ php -m
tokenizer
xdebug
xml
xmlreader
xmlrpc
xmlwriter
xsl
yaf
zip
zlib

[Zend Modules]
Xdebug
```

如果能看见 `Xdebug` 字样则配置成功，否则重新执行安装。

## 配置远程调试

这里我使用 Visual Studio Code 编辑器的 Xdebug 调试工具（需要安装）。打开一个项目，选择右边的蟑螂图标，进入 Xdebug界面，配置 Xdebug 远程调试，配置文件 `configurations` 新增一个项目配置：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Test",
            "type": "php",
            "request": "launch",
            "port": 9000,
            "serverSourceRoot": "/home/wwwroot/pulin_openapi",
            "localSourceRoot": "${workspaceRoot}"
        },
        {
            "name": "Listen for XDebug",
            "type": "php",
            "request": "launch",
            "port": 9000,
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9000,
        }
    ]
}
```

`serverSourceRoot` 是你服务器中项目的路径，`localSourceRoot` 是你本机环境中的项目路径。

现在，在项目中打上一个断点测试，按下 `F5` 一下吧~

## 参考

- [PHP 调试跟踪之 XDebug 使用总结 - CSDN 博客](https://blog.csdn.net/why_2012_gogo/article/details/51170609)
- [CentOS7 下安装和使用 Xdebug - 午时的海 - 博客园](https://www.cnblogs.com/wicub/p/6226996.html)
