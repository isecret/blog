---
title: "PHP 在 Docker 中配置 XDebug"
excerpt: "大概半年前，我将本地的开发环境换成了 Docker 来管理。也写了一套具有雏形的管理脚本，不过因为各种各样的问题，时不时需要去修改脚本甚是麻烦，最近选择将它换为 yeszao/dnmp 提供的脚本，内置 Nginx、PHP7/PHP5、My"
publishDate: 2019-04-15T07:11:00.000Z
updatedDate: 2020-12-22T02:00:53.000Z
isFeatured: false
tags: ["成长笔记", "Docker", "PHP", "XDebug"]
seo: 
  description: "大概半年前，我将本地的开发环境换成了 Docker 来管理。也写了一套具有雏形的管理脚本，不过因为各种各样的问题，时不时需要去修改脚本甚是麻烦，最近选择将它换为 yeszao/dnmp 提供的脚本，内置 Nginx、PHP7/PHP5、My"
  pageType: article
---
大概半年前，我将本地的开发环境换成了 Docker 来管理。也写了一套具有雏形的管理脚本，不过因为各种各样的问题，时不时需要去修改脚本甚是麻烦，最近选择将它换为 [yeszao/dnmp](https://github.com/yeszao/dnmp) 提供的脚本，内置 Nginx、PHP7/PHP5、MySQL、Redis。拥有丰富的配置项和标准的拓展。很是不错，不过我所开发的项目中有 `yaf` 拓展在这个脚本中没有实现，所以我 fork 了项目并添加了自己所需要的拓展，项目地址 [isecret/dnmp](https://github.com/isecret/dnmp)，分支为 `own`，意为自己的分支，因为 `yaf` 拓展并非大众需求也就没有提交合并，就当做提供一个自己添加拓展的方法吧。

DNMP 同时内置了 XDebug，我在配置的时候遇到了坑，在此记录一下。XDebug 默认开启，配置文件在项目目录 `conf/php.ini` 末尾，默认配置如下。

```ini
[XDebug]
; Debug Config
xdebug.remote_enable = 1
xdebug.remote_handler = "dbgp"
xdebug.remote_connect_back = 1
xdebug.remote_port = 9000
;xdebug.remote_log = "/var/log/dnmp/php.xdebug.log"
```

然而我在 VS Code 中配置好 `launch.json` 后，尝试断点却始终无法正常工作。

```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for XDebug",
            "type": "php",
            "request": "launch",
            "pathMappings": {
                "/var/www/html/project_name": "${workspaceRoot}"
            },
            "port": 9000
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9000
        }
    ]
}
```

我尝试开启编辑器中的日志，新增 `log` 参数为 `true`。结果如下：

```
// 开启时
<- launchResponse
Response {
  seq: 0,
  type: 'response',
  request_seq: 2,
  command: 'launch',
  success: true }
// 终止时
-> disconnectRequest
{ command: 'disconnect',
  arguments: { restart: false },
  type: 'request',
  seq: 3 }
<- disconnectResponse
Response {
  seq: 0,
  type: 'response',
  request_seq: 3,
  command: 'disconnect',
  success: true }
```

然而我尝试在服务端开启日志却找到不到日志文件。

我一直以为是我配置的原因，然而我在同事的机器上却成功断点了。

说明：我的环境为 macOS，同事是 Windows 10，我不知道这个问题是否和系统有关系。

调试了许久仍然没有结果，为此我在 DNMP 项目中发起了 [issues](<https://github.com/yeszao/dnmp/issues/130>)，希望有人遇到过这个问题。经过漫长的等待，终于有朋友遇到过同样的问题并找到了解决办法。他原话如下：

> @netwu: 9000端口已经被 php-fpm用了，所以得修改xdebug默认的端口，我用的9001...

我从未想过端口占用的问题，因为在 Windows 中我同事并未修改 XDebug 或者 php-fpm 的端口，这也是我不确定是否是因为操作系统造成的原因。

另外，同事的 XDebug 服务端的配置文件有做过修改，增加了 `xdebug.remote_host`  参数设置为`172.25.160.1`，`172.25.160.1` 的来源是通过 `ipconfig` 命令查看到的 Docker 与宿主机通信的地址。

在 macOS 上这个地址通常使用 `docker.for.mac.localhost` 来代替。

最终我本地的配置如下：

```
// conf/php.ini
...
[XDebug]
xdebug.remote_enable = 1
#xdebug.remote_mode = "req"
#xdebug.remote_connect_back = on
xdebug.remote_autostart = on
xdebug.remote_host = docker.for.mac.localhost
xdebug.remote_port = 9001
#xdebug.remote_log = /var/log/php-fpm/x-debug-remote.log
...
// launch.json
{
    "version": "0.2.0",
    "configurations": [

        {
            "name": "Listen for XDebug",
            "type": "php",
            "request": "launch",
            "pathMappings": {
                "/var/www/html/project_name": "${workspaceRoot}"
            },
            "port": 9001
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9001
        }
    ]
}
```

最后修改完配置文件记得重启 PHP 容器。

XDebug 的编译安装可以参考往期的一篇文章：[PHP 安装 XDebug 并配置远程调试](https:///php-installed-xdebug.html)
