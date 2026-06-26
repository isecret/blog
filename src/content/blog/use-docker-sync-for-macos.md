---
title: "Docker 优化之 Docker-sync 解决 Docker 挂载缓慢"
excerpt: "前言 Docker 为 macOS 平台提供了一个非常方便的开发环境，要知道 MAMP 环境在 macOS 是付费的，其实我挺纳闷的，Apache 是免费的，MySQL 是免费的，PHP 也是开源的，怎么集成在 macOS 上就成了付费软件"
publishDate: 2019-05-09T03:22:00.000Z
updatedDate: 2020-12-24T01:39:11.000Z
isFeatured: false
tags: ["成长笔记", "Docker"]
seo: 
  description: "前言 Docker 为 macOS 平台提供了一个非常方便的开发环境，要知道 MAMP 环境在 macOS 是付费的，其实我挺纳闷的，Apache 是免费的，MySQL 是免费的，PHP 也是开源的，怎么集成在 macOS 上就成了付费软件"
  pageType: article
---
## 前言

Docker 为 macOS 平台提供了一个非常方便的开发环境，要知道 MAMP 环境在 macOS 是付费的，其实我挺纳闷的，Apache 是免费的，MySQL 是免费的，PHP 也是开源的，怎么集成在 macOS 上就成了付费软件，颇有一种拿别人的成果赚自己的钱的感觉。

我使用 Docker 有一段时间了，再享受它带来的便利的同时也总感觉什么地方怪怪的，但也说不出来。直到和同事联调接口的时候，同事忍受不了我的本地环境非要让我更新到测试环境。我：？？？

本地环境的响应速度实在令人错愕：平均响应时间：2000ms+，如果接口里还有 CURL 的话还要翻倍。

## 天下苦秦久矣

无奈之下，检索关键字：docker so slow，结果还真不少。

首先来到 docker for mac 的一个 Issues，讨论甚是热闹，其中一个回答得很多赞。如下：

>**wadjeroudi**: For those who look for a workaround and didn't read the whole thread, here is the solution :
>https://github.com/EugenMayer/docker-sync

原文地址：https://github.com/docker/for-mac/issues/77#issuecomment-245210458

接着找到 docker-sync 的代码仓库，简介如下：

> Run your application at full speed while syncing your code for development, finally empowering you to utilize docker for development under OSX/Windows/*Linux

参照 docker-sync 的 [官方文档](https://docker-sync.readthedocs.io/en/latest/)，开始配置，过程记录下来。

首先先安装 docker-sync 及其依赖的同步策略，各平台支持的同步策略如下：

- OSX: `native_osx`,`unison`,`rsync`
- Windows: `unison`
- Linux: `native_linux`,`unison`

结论如下，如果不想折腾直接用 `unison` 就行，不过 macOS 推荐的配置为 `native_osx`。

安装 docker-sync 和 unison 策略支持：

```bash
$ gem install docker-sync
$ brew install unison
$ brew install eugenmayer/dockersync/unox
```

如果提示 `brew command not found `，请自行安装 Homebrew，地址：[Homebrew](https://brew.sh/)

编写配置文件 `docker-sync.yml`：

```yaml
version: '2'

options:
  verbose: false

syncs:
  unison-sync:
    # 需要挂载的目录
    src: '/path/to/app'
    # 同步策略 macOS 推荐 native_osx，Windows 配置为 unison
    sync_strategy: native_osx
    # 这里的用户 ID 为 1000，请确认你的 php-fpm 为同一个用户
    sync_userid: 1000
    # 忽略的文件
    sync_excludes: [
      '.gitignore',
      '.git/',
      '.DS_Store',
    ]
```

关闭并销毁容器：

```bash
$ docker-compose down
```

修改 `docker-compose.yml`：

```yaml
version: "3"

# 新增挂载卷
volumes:
  unison-sync:
    external: true

services:
  nginx:
    image: nginx:${NGINX_VERSION}
    ports:
      - "${NGINX_HTTP_HOST_PORT}:80"
      - "${NGINX_HTTPS_HOST_PORT}:443"
    volumes:
      # 此处使用挂载卷作为源
      - unison-sync:/var/www/html/:nocopy
      - ${NGINX_CONFD_DIR}:/etc/nginx/conf.d/:rw
      - ${NGINX_CONF_FILE}:/etc/nginx/nginx.conf:ro
      - ${NGINX_LOG_DIR}:/var/log/nginx/:rw
    restart: always
    networks:
      default:
        ipv4_address: 10.0.0.10
```

现在启动同步并尝试启动容器：

```bash
$ docker-sync start
$ docker-compose build  #重新构建容器
$ docker-comopse up -d
```

现在 macOS 和容器为双向同步，但也存在不同步的情况，这个时候需要手动重新同步：

```bash
$ docker-sync clean
$ docker-sync start
```

## 总结

Docker 在 macOS 和 Windows 上文件效率要低 10 倍到 40 倍不等，主要原因是 macOS 和 Windows 均是以虚拟的方式运行，文件越多，转换越慢。

最理想的方式挂载 Vagrant 至 Virtual Box，然后在 Virtual Box 里运行 Linux，在 Linux 上跑 Docker，这样将性能损耗降到最低，有时间再折腾吧。

## 参考

- [使用 docker-sync 让 mac 和 docker 之间的文件同步变快](https://ruby-china.org/topics/37289)
- [用 Docker 搭建本地开发环境](https://ninghao.net/blog/4881)
- [laradock/laradock](https://github.com/laradock/laradock)
