---
title: "使用 Supervisor 守护 PHP-FPM 进程"
excerpt: "上回的 Laravel 应用开发完成上线之后，稳定的跑了一个月。业务一切正常，就这最近一周应用负载的第二台服务器总是抽风。 先说说应用的场景。 我们的应用项目代码在我们自己的服务器上，两台服务器做承载。按理来说其中一台服务器宕掉会立马故障转"
publishDate: 2018-09-01T03:48:00.000Z
updatedDate: 2020-12-22T02:02:45.000Z
isFeatured: false
tags: ["成长笔记", "Laravel", "PHP", "Supervisor"]
seo: 
  description: "上回的 Laravel 应用开发完成上线之后，稳定的跑了一个月。业务一切正常，就这最近一周应用负载的第二台服务器总是抽风。 先说说应用的场景。 我们的应用项目代码在我们自己的服务器上，两台服务器做承载。按理来说其中一台服务器宕掉会立马故障转"
  pageType: article
---
[上回的 Laravel 应用](https://blog.wangmao.me/laravel-queue-question.html)开发完成上线之后，稳定的跑了一个月。业务一切正常，就这最近一周应用负载的第二台服务器总是抽风。

先说说应用的场景。

我们的应用项目代码在我们自己的服务器上，两台服务器做承载。按理来说其中一台服务器宕掉会立马故障转移到另一台服务器。但是应用前边还有两台服务器。

不太好解释，一个请求差不多是这样的：

```
https://www.a.com/
       | 
       | (SLB 轮询到 Server 3、Server 4 上的一台服务器，然后 301 重定向)
       ↓
https://www.b.com/abc
       |
       |（SLB 轮询）
       ↓
Server 1、Server 2（所属其他项目组）
       |
       |（Nginx 转发）
       ↓
Server 3、Server 4 (所属我们项目组)
       |
       | (Nginx 转发到 Localhost 8800端口)
       ↓
      响应
```

这种场景有些特殊，困于公司的各种恼人的流程，实在想不出其他法子了，以至于开发的应用适配这个架构改了好多次。

现在问题是：当 *Server 3*、*Server 4* 宕机了，*SLB* 无法故障转移。碰巧的是 *php-fpm* 在 *Server 4* 上**三天挂掉了三次**。

我们唯一知道服务器宕掉的途径是——**业务群炸了！**这显然已经晚了，业务势必受到影响。

在翻看 *php-fpm* 日志和 *nginx* 日志查找了半天没有结果的情况下，心生一秒计——*Supervisor* 守护进程。

*Supervisor* 简单来说就是在你需要常驻运行的程序挂掉的时候及时拉起。这对于现在的场景是非常合适啊。

编辑 ``/etc/supervisord.d/php-fpm.ini``，配置如下：

```ini
[program:php-fpm]
command=bash -c "sleep 1 && /usr/local/php7/sbin/php-fpm --fpm-config /usr/local/php7/etc/php-fpm.conf --pid /usr/local/php7/var/run/php-fpm.pid"
process_name=%(program_name)s
autostart=true
autorestart=true
startretries=5
exitcodes=0,2,70
stopsignal=QUIT
stopwaitsecs=2
stdout_logfile=/data/logs/supervisord/php-fpm.log
```

进入 Supervisor 控制台：

```bash
$ sudo supervisorctl
nginx                            RUNNING   pid 26046, uptime 0:00:01
php-fpm                          STARTING
supervisor> reread
php-fpm: changed
supervisor> start php-fpm
php-fpm: ERROR (abnormal termination)
```

请记住这里最后的结果是 **ERROR**，然而查看进程 *php-fpm* 确实在跑了，*kill* 掉进程也能拉起来，我不太清楚为什么会这样。但是跑了一天后，*php-fpm* 又挂了。对，是又挂了而且没拉起来。

继续锁定 **ERROR**，先查看 *php-fpm* 日志。

```
[01-Sep-2018 11:20:21] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:20:21] ERROR: FPM initialization failed
[01-Sep-2018 11:20:23] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:20:23] ERROR: FPM initialization failed
[01-Sep-2018 11:20:24] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:20:24] ERROR: FPM initialization failed
[01-Sep-2018 11:20:25] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:20:25] ERROR: FPM initialization failed
```

一直在报这个错误，看来必须要解决才行呢，看样子是端口被占用了？但是是基于 *supervisor* 启动的，怎么会有这种错误呢？

当然，配置是有问题的。

*php-fpm* 进程默认是以 *daemon* 方式启动的，而 [Supervisor 文档](http://www.supervisord.org/subprocess.html#nondaemonizing-of-subprocesses) 的说明是，**使用 supervisor 监护进程时，被监护的进程不能是守护进程。**

我们需要关闭 `php-fpm` 的进程守护，编辑 `/usr/local/php/etc/php-fpm.conf`，查找 `daemonize` 修改为 `no`。

然后 *killall php-fpm* 的所有进程，现在查看 *php-fpm* 日志。

```bash
$ tail -f /usr/local/php/var/log/php-fpm.log
[01-Sep-2018 11:28:25] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:28:25] ERROR: FPM initialization failed
[01-Sep-2018 11:28:26] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:28:26] ERROR: FPM initialization failed
[01-Sep-2018 11:28:27] ERROR: unable to bind listening socket for address '127.0.0.1:9000': Address already in use (98)
[01-Sep-2018 11:28:27] ERROR: FPM initialization failed
[01-Sep-2018 11:28:28] NOTICE: Terminating ...
[01-Sep-2018 11:28:28] NOTICE: exiting, bye-bye!
[01-Sep-2018 11:28:29] NOTICE: fpm is running, pid 26011
[01-Sep-2018 11:28:29] NOTICE: ready to handle connections
```

查看 `supervisor` 状态：

```bash
$ sudo supervisorctl
nginx                            RUNNING   pid 26046, uptime 0:00:01
php-fpm                          RUNNING   pid 26009, uptime 0:00:45
```

关于 *php-fpm* 为什么会隔三差五挂掉还没查出来，为了不影响业务，只能先守护进程保证业务正常运作。
