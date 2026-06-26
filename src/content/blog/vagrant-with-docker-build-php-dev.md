---
title: "使用 Vagrant+Docker 构建 PHP 最优开发环境"
excerpt: "PS: 此方案适用于 Windows、macOS 老祖宗说过磨刀不误砍柴工，又说过工欲善其事，必先利其器。这话无论放到何时都适用。上次折腾开发环境是 Docker 优化之 Docker sync 解决 Docker 挂载缓慢 的问题，然而这"
publishDate: 2019-06-05T10:35:00.000Z
updatedDate: 2020-12-22T01:58:41.000Z
isFeatured: false
tags: ["成长笔记", "Docker", "PHP", "Vagrant"]
seo: 
  description: "PS: 此方案适用于 Windows、macOS 老祖宗说过磨刀不误砍柴工，又说过工欲善其事，必先利其器。这话无论放到何时都适用。上次折腾开发环境是 Docker 优化之 Docker sync 解决 Docker 挂载缓慢 的问题，然而这"
  pageType: article
---
> PS: 此方案适用于 Windows、macOS

老祖宗说过磨刀不误砍柴工，又说过工欲善其事，必先利其器。这话无论放到何时都适用。上次折腾开发环境是 [Docker 优化之 Docker-sync 解决 Docker 挂载缓慢](/use-docker-sync-for-macos.html) 的问题，然而这一改问题更大了。

在我日常开发了数天后，总结了 docker-sync 的诸多问题：

1. 宿主机修改时而不同步，这个在文章中有讲过，怀疑和内存/运行时间有关系
2. 如果项目过大，`start` 命令的同步时间过长，这通常需要 10~20 分钟

试想，问题 1 和 2 通常是成对出现的，也就是说只要发现文件不同步，那可就一直不同步了，我曾认为同步是监听文件的修改事件来通知更新，然而 CTRL + S 按烂也没有反应。接着能做的只有清除掉同步的数据然后重新同步。[狂汗]

这通常折腾你两次你可能就很难受了，重新同步完你刚刚做的什么也忘得七七八八了，谁曾想装个同步工具反倒同步出了问题。[无奈]

上篇文章有提到，挂载速度损耗最小的是利用虚拟机挂载。

## 环境结构
简单描述这几套开发环境的结构。

```
只使用 Docker：本地文件 --挂载--> Docker 容器 --映射端口--> 宿主机

只使用 Vagrant：本地文件 --挂载--> 虚拟机 --映射端口--> 宿主机

Docker+Vagrant：本地文件 --挂载--> 虚拟机 --挂载--> Docker --映射端口--> 虚拟机 --映射端口--> 宿主机
```

## 安装
首先需要安装 Vagrant 和 VirtualBox 这两个程序。

- Vagrant：[下载地址](https://www.vagrantup.com/downloads.html)
- VirtualBox：[下载地址](https://www.virtualbox.org/wiki/Downloads)

选择你系统对应的最新版本，安装步骤不用细细的讲。

## 导入镜像

```bash
# 创建 vagrant 镜像配置目录
$ mkdir ~/vagrant
# 拉取 centos 镜像
$ cd ~/vagrant
$ vagrant init centos/7
```

通过 `vagrant init` 命令拉取镜像在国内速度很慢，你可以配置代理来加速拉取，前提是需要先启用代理。

```bash
$ export http_proxy=http://0.0.0.0:1087
$ export https_proxy=http://0.0.0.0:1087
```

或者你可以自己下载镜像，通过命令来手动导入镜像。

```bash
// 复制镜像到 vagrant 目录
$ cp /path/to/centos-7.box ~/vagrant
$ vagrant box add centos-7.box
$ vagrant init centos-7
```

## 配置
当镜像导入成功后，`~/vagrant` 目录将生成一个 `Vagrantfile` 你可以编辑它用于配置挂载的目录，映射的端口等。

```bash
# 映射端口
config.vm.network "forwarded_port", guest: 80, host: 80
config.vm.network "forwarded_port", guest: 80, host: 80, host_ip: "127.0.0.1"
# 挂载目录 忽略挂载 vagrant 目录
config.vm.synced_folder ".", "/vagrant", disabled: true
config.vm.synced_folder "~/dnmp", "/root/dnmp"
config.vm.synced_folder "~/Project", "/root/Project"
```

端口映射 80 和 3306 等，目录挂载我这里挂载了 `~/dnmp` 目录，这个是一个类似 [laradock/laradock](https://github.com/laradock/laradock) 的项目，配置了我日常的开发环境，包括 PHP、Nginx、Redis、MySQL 等，使用 Docker 能快速构建我的开发环境。

## 安装 Docker
当 `Vagrantfile` 配置完成，便可以使用 `vagrant up` 命令启动虚拟机。但注意，关于 `vagrant` 相关的命令，你只能在 `~/vagrant` 目录下才能执行，它依赖 `Vagrantfile` 文件。

```bash
$ cd ~/vgrant
# 开启虚拟机
$ vagrant up
...
# 登录到虚拟机
$ vagrant ssh
...
# 默认登录是 vagrant 用户，手动切换到 root 用户
$ sudo su -
```

至此虚拟机部分已经安装完成，后续如果调整 `Vagrantfile` 后需要执行 `vagrant reload --provision` 命令。

后续操作全部在虚拟机(使用 `vagrant ssh` 登录)中进行，然后准备 Docker 安装的必要的工具以及 Docker 的软件源。

```bash
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2
# 添加 docker 的软件源
$ sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 更新 yum 缓存
$ sudo yum makecache fast
# 安装 docker-ce 版本
$ sudo yum -y install docker-ce
...
# 安装完成后启动 docker 的后台程序
$ sudo systemctl start docker
```

安装完成后，你可以使用 `docker -v` 命令查看当前安装的 Docker 版本。

## 优化 Docker
首先需要修改 Docker 的镜像地址，大陆使用 Docker 官方镜像速度令人发指，这里我使用阿里云提供的镜像加速服务。你可以打开登录阿里云的容器镜像服务来获取加速地址。地址：[容器镜像服务](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)

然后复制上你的加速地址，并打开 Docker 的配置文件。

```bash
$ vi /etc/docker/daemon.json
```

增加配置文件，并复制替换加速地址，格式如下：

```bash
{
    "registry-mirrors": ["https://xxxxxx.mirror.aliyuncs.com"]
}
```

配置完成后，需要重启 Docker 的镜像来加载加速地址。

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 构建开发环境
我这里使用的 [yeszao/dnmp](https://github.com/yeszao/dnmp)，我 fork 了一个分支到我的仓库并做了一些调整，地址：[isecret/dnmp](https://github.com/isecret/dnmp)。

本地我将仓库 `clone` 到 `~/dnmp` 目录，并挂载到虚拟机的 `/root/dnmp` 目录，后续的操作使用同一套配置。

关于 dnmp 的操作可以查看对应的 `README.md` 来获得帮助。

## 注意事项
### MySQL 无法启动，对应目录不可写入？
我曾在环境配置完成的时候发现 MySQL 拉不起来，查看日志发现对应目录不可写 [喷血]，在查找相关文档的时候找到了 Docker 官方仓库的 Issues，地址：[mysqld: Can't create/write to file '/var/lib/mysql/is_writable' (Errcode: 13 - Permission denied) #219](https://github.com/docker-library/mysql/issues/219)，翻译下原文，这种情况通常在 macOS 和 Windows 挂载会出现，Docker 容器默认会以 mysql 用户运行，而挂载的文件则是 root 用户的 UID，需要指定容器的用户为 docker 用户的 UID `1000:50`。

配置文件如下：
```dockerfile
mysql:
    image: mysql:${MYSQL_VERSION}
    user: "1000:50"
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    ports:
      - "${MYSQL_HOST_PORT}:3306"
    volumes:
      - ${MYSQL_CONF_FILE}:/etc/mysql/conf.d/mysql.cnf:ro
      - ${MYSQL_DATA_DIR}:/var/lib/mysql/:rw
    command: --innodb-use-native-aio=0
    networks:
      - default
```

修改完成后，需要重新 bulid 容器。
