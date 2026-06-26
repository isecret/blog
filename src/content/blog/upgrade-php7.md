---
title: "PHP 7.0.9 升级 PHP 7.1.5"
excerpt: "最近公司分配了一个项目给我，时间相对充裕，所以也就直接用 Laravel 5.6 练手了。参照慕课网实战课程「Laravel 快速开发简书」和 Laravel China 社区出的 「Web 开发实战入门 (Laravel 5.5)」以及 "
publishDate: 2018-07-11T03:40:00.000Z
updatedDate: 2020-12-22T02:03:37.000Z
isFeatured: false
tags: ["成长笔记", "PHP"]
seo: 
  description: "最近公司分配了一个项目给我，时间相对充裕，所以也就直接用 Laravel 5.6 练手了。参照慕课网实战课程「Laravel 快速开发简书」和 Laravel China 社区出的 「Web 开发实战入门 (Laravel 5.5)」以及 "
  pageType: article
---
最近公司分配了一个项目给我，时间相对充裕，所以也就直接用 Laravel 5.6 练手了。参照慕课网实战课程「[Laravel 快速开发简书](https://coding.imooc.com/learn/list/111.html)」和 Laravel China 社区出的 「[Web 开发实战入门 (Laravel 5.5)](https://laravel-china.org/courses/laravel-essential-training-5.5)」以及 Laravel China 社区翻译的「[Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6)」直接开怼。

上线前服务器资源成了一个问题，因为这个项目并没提到正式流程中，所有曲线救国，直接上线在官网的服务器。

## 配置

- 阿里云 2 核 4 GB * 3（两台生产使用SLB，一台测试）
- CentOS 7.4 x86_64
- Nginx 1.12 + PHP 7.0.9

此次升级共三台服务器，两台生产环境和一台测试环境。

查看 [Laravel 5.6 服务器要求](https://laravel-china.org/docs/laravel/5.6/installation/1352#server-requirements) PHP 版本为 `PHP >= 7.1.3`，因为开发环境装的 `7.1.5`，所以就直接上 `7.1.5` 了。

## 评估影响范围

首先，生产环境还运行着一个官网，不过流量可以忽略不计，所以短暂的宕机是可以接受的，不然我要等到晚上才能升级。

连上服务器，根据需求判断是否需要备份之前的数据。是否安装了其他拓展（Redis、Mencache、Swoole、Yaf 等）有的话需要将 `php.ini` 文件备份下来。

由于官网 PHP 一直没用过，也没装过什么拓展，所以也就直接覆盖升级了。

## 升级

> 注意：是覆盖升级！并非多版本切换。

首先需要找到 PHP 老版本的安装目录。一般路径为 `/usr/local/php`，现在需要获取当初安装时的配置情况。

使用命令：

```bash
$ php -i | grep configure | sed -e "s/Configure Command => //; s/'//g"
 ./configure  --prefix=/usr/local/php --with-config-file-path=/usr/local/php/etc --with-gd --with-iconv --with-zlib --enable-xml --enable-bcmath --enable-shmop --enable-sysvsem --enable-inline-optimization --with-curlwrappers --enable-mbregex --enable-fpm --enable-mbstring --enable-ftp --enable-gd-native-ttf --with-openssl --enable-pcntl --enable-sockets --with-xmlrpc --enable-zip --enable-soap --with-pear --with-gettext --enable-session --with-mcrypt --with-curl --with-jpeg-dir=/usr --with-freetype-dir=/usr
```

若提示 `command not found: php` 则需要进入到 `/usr/local/php/bin/` 使用 `./php` 来执行命令。

将以上配置给复制下来，保存好。

然后下载对应升级的 PHP 版本，这里我选择 `7.1.5` 如果需要其他版本的只需要在下面命令修改对应版本即可。

```bash
$ cd ~
$ wget -c http://cn2.php.net/get/php-7.1.5.tar.gz/from/this/mirror -O php-7.1.5.tar.gz
$ tar zxvf php-7.1.5.tar.gz
$ cd php-7.1.5
```

解压完成，现在开始配置 PHP，这时需要复制上刚刚保存的 `./configure` 命令。

```bash
$ ./configure  --prefix=/usr/local/php --with-config-file-path=/usr/local/php/etc --with-gd --with-iconv --with-zlib --enable-xml --enable-bcmath --enable-shmop --enable-sysvsem --enable-inline-optimization --with-curlwrappers --enable-mbregex --enable-fpm --enable-mbstring --enable-ftp --enable-gd-native-ttf --with-openssl --enable-pcntl --enable-sockets --with-xmlrpc --enable-zip --enable-soap --with-pear --with-gettext --enable-session --with-mcrypt --with-curl --with-jpeg-dir=/usr --with-freetype-dir=/usr
$ make && make install
```

如果命令有提示 `Permission denied` 请使用 `sudo` 来运行命令。

## 优化

至此，升级已经完成了。但是仍然有优化的地方。

增加或替换 `/usr/bin/` 目录下相关 PHP 的命令脚本。

```bash
$ cd /usr/local/php
$ cp -f php phpize php-config php /usr/bin/
$ php -v
PHP 7.1.5 (cli) (built: Jun  5 2017 18:00:45) ( NTS )
Copyright (c) 1997-2017 The PHP Group
Zend Engine v3.1.0, Copyright (c) 1998-2017 Zend Technologies
```

## 重启 PHP-FPM

现在需要将 php-fpm 重启使其生效。命令：

```bash
$ killall php-fpm
$ sudo /usr/local/php/sbin/php-fpm
```
