---
title: "使用 Supervisor 守护 Nginx 进程"
excerpt: "紧接上次的 使用 Supervisor 守护 php fpm 进程，在 Supervisor 控制台中能看见有 Nginx 的任务。这个任务并不是我加的，而是我拿到服务器就已经配好了，很可能是运维配置的。 今天调 Bug 的时候发现了问题，"
publishDate: 2018-09-21T01:24:00.000Z
updatedDate: 2020-12-22T02:01:31.000Z
isFeatured: false
tags: ["成长笔记", "Nginx", "Supervisor"]
seo: 
  description: "紧接上次的 使用 Supervisor 守护 php fpm 进程，在 Supervisor 控制台中能看见有 Nginx 的任务。这个任务并不是我加的，而是我拿到服务器就已经配好了，很可能是运维配置的。 今天调 Bug 的时候发现了问题，"
  pageType: article
---
紧接上次的 [使用 Supervisor 守护 php-fpm 进程](/supervisor-with-php-fpm.html)，在 *Supervisor* 控制台中能看见有 *Nginx* 的任务。这个任务并不是我加的，而是我拿到服务器就已经配好了，很可能是运维配置的。

今天调 Bug 的时候发现了问题，所以分为两篇来讲。

## 问题描述

上回使用 *Laravel Admin* 搭建了后台，功能看似一切正常，然而今天给同事演示导出功能的时候出了幺蛾子。问题也实在奇怪：当「导出当前页」能正常导出，「导出全部」则始终网络错误。

## 神操作

刚开始以为是 *Laravel Admin* 使用的 *Excel* 拓展类（[maatwebsite/Laravel-Excel](https://github.com/maatwebsite/Laravel-Excel)）的问题，将导出类替换为 [league/csv](https://github.com/thephpleague/csv)，然鹅。我发现在测试环境无论是 *Laravel-Excel* 还是 *csv* 都能导出。也就是说我白忙活了半天？

## 日志！

一边安慰自己是在排除代码问题，一边去查看 *Nginx* 的错误日志。*Nginx* 是 *root* 用户安装的，查看日志必须加 `sudo`，忽然发现日志一直在输出错误：

```
2018/09/20 16:14:38 [emerg] 23817#0: bind() to 0.0.0.0:8800 failed (98: Address already in use)
2018/09/20 16:14:38 [emerg] 23817#0: bind() to 0.0.0.0:80 failed (98: Address already in use)
2018/09/20 16:14:38 [emerg] 23817#0: bind() to 0.0.0.0:443 failed (98: Address already in use)
2018/09/20 16:14:38 [emerg] 23817#0: bind() to 0.0.0.0:8800 failed (98: Address already in use)
2018/09/20 16:14:38 [emerg] 23817#0: still could not bind()
```

每秒都在输出，惊得我立马查看线上环境，然而一切正常。缓过神来，发现这个日志实在眼熟，我们是不是在哪儿见过？简直和 [使用 Supervisor 守护 php-fpm 进程](/supervisor-with-php-fpm.html) 的 php-fpm 的错误日志如出一辙啊。那我可大概知道是什么原因了。

## 查证

首先在 [Nginx 中文文档](http://www.nginx.cn/doc) 中找到 [Nginx 主模块](http://www.nginx.cn/doc/core/mainmodule.html)，找到 `daemon` 命令，官方给出的解释是：

> **语法:** *daemon on | off*
>
> **缺省值:** *on*
>
> Do not use the "daemon" and "master_process" directives in a production mode, these options are mainly used for development only. You can use `daemon off`
>

大意：在生产环境中 `daemon` 和 `master_process` 配置均不可使用，仅用于开发测试。

为了方便开发测试 *Nginx* 的 *daemon* 参数默认值为 *on*。

然后找到 *Nginx* 的配置文件 `/usr/local/nginx/conf/nginx.conf`，检索 `daemon` 参数。然后是意料之中 *Pattern not found: daemon*。

## 解决方案

第一种是直接在 *nginx.conf* 配置文件中增加 `daemon off;` 参数。

第二种则是在启动 *Nginx* 时追加命令，命令为： 

```bash
/usr/local/nginx/sbin/nginx -g 'daemon off;'
```

由于线上环境 *Nginx* 配置文件由 *Supervisor* 守护，所以直接修改 *supervisord.conf*：

```ini
[program:nginx]
command=/usr/local/nginx/sbin/nginx -g 'daemon off;'
directory=/usr/local/nginx
autostart=true
autorestart=true
redirect_stderr=true
priority=10
stdout_logfile=/data/logs/supervisord/nginx.log
```

修改后记得更新 Supervisor 以及重启 Nginx 进程，命令：

```bash
$ supervisorctl reread # 重新读取配置
$ supervisorctl update # 更新配置
$ supervisorctl restart nginx  # 重启 nginx
$ killall nginx  # 杀掉所有的 nginx 进程
```

至此 Nginx 日志终于消停下来，我也能慢慢的查问题了。
