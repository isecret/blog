---
title: "记一场服务器事故"
excerpt: "没有删过服务器的人生是不完整的人生。 事情是这样的，最近一个项目需要升级服务器操作系统，申请了新的服务器用作迁移，在测试环境安装完 Docker 后编排完容器顺利启动。然后开始改造 CICD 管道，由于时间匆忙没有来得及为管道申请账号，调通"
publishDate: 2023-02-13T10:21:00.000Z
updatedDate: 2023-02-13T10:25:57.000Z
isFeatured: false
tags: []
seo: 
  description: "没有删过服务器的人生是不完整的人生。 事情是这样的，最近一个项目需要升级服务器操作系统，申请了新的服务器用作迁移，在测试环境安装完 Docker 后编排完容器顺利启动。然后开始改造 CICD 管道，由于时间匆忙没有来得及为管道申请账号，调通"
  pageType: article
---
*没有删过服务器的人生是不完整的人生。*

事情是这样的，最近一个项目需要升级服务器操作系统，申请了新的服务器用作迁移，在测试环境安装完 Docker 后编排完容器顺利启动。然后开始改造 CICD 管道，由于时间匆忙没有来得及为管道申请账号，调通管道时运行用户是我自己的账号，能通过 `sudo` 执行管理员权限。

改造了数次，从构建到部署一些零零碎碎的问题，像目录不存在，目录错误，权限不足等等都陆续处理了。直到改部署清空阶段出了问题，脚本类似下面：

```bash
#!/bin/bash
$work_dir = "$(projectDir)/"

if [ "`ls -A $work_dir`" = "" ]; then
  echo "$work_dir is empty"
else
  echo "$work_dir is not empty, clean up"
  rm -rf $work_dir/*
fi
```

脚本看上去没什么问题，如果项目目录不为空则清空项目目录。然而部署执行了好几分钟没有结束，我查看日志的时候，瞬间明白过来发生了什么。

```bash
rm: cannot remove '/data': Device or resource busy
rm: cannot remove '/dev/hugepages': Device or resource busy
rm: cannot remove '/dev/mqueue': Device or resource busy
rm: cannot remove '/dev/shm': Device or resource busy
rm: cannot remove '/dev/pts/ptmx': Operation not permitted
rm: cannot remove '/etc/resolv.conf': Operation not permitted
rm: cannot remove '/proc/fb': Operation not permitted
rm: cannot remove '/proc/fs/aufs/plink_maint': Operation not permitted
```

问题出在 `projectDir` 管道变量，新引入的管道变量忘记赋值，灾难便开始了，**projectDir 未赋值是拼接路径时是空字符串，最后的清空命令变成了 `rm -rf /*`**。最后部署脚本执行失败了，再过了几分钟，服务器离线了。

是的，把服务器给干关机了。幸好服务器是刚申请下来的没有数据，而且是测试环境，联系运维同事很快重装了，但是这种后怕的感觉还是久久不能平静，为此思考了两个改进的方案，以防止后面再次踩坑。

1. 回收管道权限，权限最小化，仅工作目录可执行写操作；
2. 对路径变量使用前进行判断，变量不存在及时抛出异常。
