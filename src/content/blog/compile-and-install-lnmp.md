---
title: "编译安装 LNMP/LAMP 环境"
excerpt: "在使用 LNMP 一类的集成环境之后，对单独编译安装从来是对着文档装。尽管在 Mac 下装过无数次，也踩过无数坑，但总是记不住一些细节步骤。将本次安装过程全程记录下来，在将来也可以作个参考。 安装环境 服务器：CentOS 6.8 64 m"
publishDate: 2017-11-14T12:17:00.000Z
updatedDate: 2020-12-22T02:05:51.000Z
isFeatured: false
tags: ["成长笔记", "MySQL", "Nginx", "PHP", "Shell"]
seo: 
  description: "在使用 LNMP 一类的集成环境之后，对单独编译安装从来是对着文档装。尽管在 Mac 下装过无数次，也踩过无数坑，但总是记不住一些细节步骤。将本次安装过程全程记录下来，在将来也可以作个参考。 安装环境 服务器：CentOS 6.8 64 m"
  pageType: article
---
在使用 LNMP 一类的集成环境之后，对单独编译安装从来是对着文档装。尽管在 Mac 下装过无数次，也踩过无数坑，但总是记不住一些细节步骤。将本次安装过程全程记录下来，在将来也可以作个参考。

## 安装环境

- 服务器：CentOS 6.8 64 mini
- 终端：iTerm2

> 注：为了环境足够干净，本次安装过程为全新安装，如果之前环境安装过集成环境请重装。

## 安装约定

- 文章中命令使用到的 `$` 均代表 *root* 用户身份，执行命令时请忽略 `$` 符号
- 为了保证正常安装，我发现许多同学喜欢跳着看，除开 Apache 和 Nginx 部分，其他强烈不建议你跳着看，除非你能解决类似 `Command not found` 的错误
- Apache 和 Nginx 建议二选一，本文为测试环境，会同时安装
- 软件包下载地址：/lnmp/，若不存在请手动执行 `mkdir /lnmp` 创建
- 源码包编译安装位置：/usr/local/softwareName
- 数据库存储文件路径：/data/mysql
- Nginx 站点目录：/www/

## Linux

CentOS 也是安装中的一部分，也记录下安装的过程。以下只截图的重点部分，其他直接默认即可。

### 安装

虚拟机挂载镜像后，开机，选择 `Install system with basic video driver`，回车。这个是基础安装，没有界面的。

![选择安装模式](/images/76DBBABEA449C0686B529636035D90F0-434ff533a2.png)

然后刷屏模式。。

然后检查介质，直接 `Tab` 键选择 `Skip` 跳过检查，如果手残选择了 `OK` 那么恭喜你，慢慢等吧，没半个小时好不了。

![检查安装介质](/images/8CD18A00EBD12E0F58EC9450796B7A6F-efb92695e0.png)

欢迎页面，直接回车。

选择语言，默认，继续回车。

接下来是抹掉磁盘的警告，直接按 `Tab` 键选择 `Re-initialize all` 然后回车。

![安装](/images/114A3078B32D3795544DF0D44035D93F-345119b608.png)

然后输入你的管理员密码，若是弱口令会提示密码不安全，你可以修改密码或者选择 `Use Anyway` 来忽略警告，当然我强烈不建议你使用弱口令。

选择安装磁盘，直接默认，然后按 `Tab` 键切换到 `OK`，然后回车。

![选择磁盘](/images/7E711CE963EE24767D55E2754430E8B0-5db7fe8231.png)

然后是确认写入的警告，按 `Tab ` 键选择 `Write changes to disk`。

![确认安装](/images/D8E9E0FA95250F48555242ECDFF934DE-2ee23b1194.png)

然后是漫长的安装过程，这个过程受机器配置的影响安装时间也不确定，慢慢等。

![安装中](/images/2F8B64FB579D6F8FFA89C4B60F5957DB-2e4f18cba0.png)

安装完成，回车重启。

![重启服务器](/images/AEE3F6CD1F1F77C3B45B0E647C3FE677-cc172149d5.png)

重启完成后直接输入用户名（root），密码登录系统。

### 配置网络

由于我是虚拟机安装，刚安装完成还没有网络，所以得先修改下网卡配置。

```shell
$ vi /etc/sysconfig/network-scripts/ifcfg-eth0 #修改网卡配置
```

将 `ONBOOT` 改为 `yes`，然后执行命令让网卡配置重载。

```shell
$ service network restart #重启网络服务
```

修改完网卡，尝试使用 `ping` 命令测试网络是否通畅。

### 更换 yum 源

总所周知的原因，国内的 yum 下载速度不用多说。先安装需要用到的工具。

```shell
$ yum install -y wget curl vim #安装需要的工具
```

安装完工具，然后先备份下 yum 源

```shell
$ mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```

然后将阿里云的 yum 源下载到本地的 `etc/yum.repos.d/`，当然你也可以选择其他的源镜像，比如：[163](http://mirrors.163.com/) 或者 [中科大](http://mirrors.ustc.edu.cn/) 的镜像源。这里我直接以阿里云的为例。

你可以使用 `wget` 进行下载：

```shell
$ wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-6.repo
```

或者使用 `curl` 进行下载（二选一）：

```shell
$ curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-6.repo
```

然后清空缓存。

```shell
$ yum clean all
$ yum makecache
```

然后执行升级命令：

```shell
$ yum update
```

安装更新，键入 `y` 回车继续。这个过程的等待时间由你的服务器配置和带宽决定。

## 安装前的配置

### 防火墙配置

防火墙用于管理入栈和出栈流量，所以先配置放行端口，HTTP 协议端口：80、MySQL 数据库端口：3306、HTTPS 协议端口：443。当然，你也可以直接将防火墙关掉，但是强烈不建议这么做。

```shell
$ vim /etc/sysconfig/iptables #编辑防火墙规则
```

在 `COMMIT` 之前按下 `i` 键插入规则。

```
-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp --dport 443 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp --dport 3306 -j ACCEPT
```

按下 `Esc` 键，键入 `:wq` 保存，然后重启防火墙。

```shell
$ service iptables restart
```

然后查看防火墙规则，是否有刚添加的规则。

```shell
$ iptables -L
```

如果有 `http` 或者 `80` 端口开放则配置完成。

### 关闭 SELinux

SELinux 是红帽（Red Hat）系列系统中的一个强制访问控制系统，你可以理解为 360 安全卫士，是必须关的一个东西。（除了百度，最讨厌的就是 360 了，当然还有金山。）

首先编辑 SELinux 的配置文件：

```shell
$ vim /etc/selinux/config #配置 SELinux
```

按下 `i` 插入，将 `SELINUX=enforcing` 前边加一个 `#` 注释掉，`SELINUXTYPE=targeted` 同样在前面加 `#` 注释掉，在尾部插入 `SELINUX=disabled`，然后按下 `Esc` 键入 `:wq` 保存。

然后执行命令使配置生效。

```shell
$ setenforce 0
```

> 注：这里有一个坑，执行命令后，配置可能还是未生效。最好的解决方案是：重启服务器。

### 安装编译工具和库文件

软件的安装编译需要用到的工具，直接复制安装，这个过程比较漫长。

```shell
$ yum install -y make apr* autoconf automake curl curl-devel gcc gcc-c++  cmake  gtk+-devel zlib-devel openssl openssl-devel pcre-devel gd kernel keyutils patch perl kernel-headers compat* cpp glibc libgomp libstdc++-devel keyutils-libs-devel  libarchive   libsepol-devel libselinux-devel krb5-devel libXpm* freetype freetype-devel freetype* fontconfig fontconfig-devel libjpeg* libpng* php-common php-gd gettext gettext-devel ncurses* libtool* libxml2 libxml2-devel patch policycoreutils bison
```

### 安装 libmcrypt

libmcrypt 是 PHP 的加密拓展库。这里我准备了一个下载地址：[libmcrypt-2.5.8.tar.gz](https://static.openapi.link/libmcrypt-2.5.8.tar.gz)。

你可以使用 `wget` 命令进行下载。 若不存在 */lnmp/* 目录请先使用 `mkdir /lnmp` 创建目录。

```shell
$ cd /lnmp/ # 切换到 /lnmp 目录，不存在则先 mkdir /lnmp 再执行
$ wget https://static.openapi.link/libmcrypt-2.5.8.tar.gz  # 下载 libmcrypt 包
$ tar zxvf libmcrypt-2.5.8.tar.gz  # 解压 libmcrypt 包
$ cd libmcrypt-2.5.8  # 进入 libmcrypt 解压的目录
$ ./configure  # 配置
$ make && make install  # 编译安装
```

这个过程大约在 10s-20s内完成，接下来开始安装 Nginx。

## Nginx

### 创建 Nginx 用户组

首先，下载 Nginx，下载地址：[Nginx-1.13.2.tar.gz](http://nginx.org/download/nginx-1.13.2.tar.gz)，下载到 `/lnmp/`。

```shell
$ cd /lnmp/
$ wget http://nginx.org/download/nginx-1.13.2.tar.gz
$ tar zxvf nginx-1.13.2.tar.gz
$ cd nginx-1.13.2
```

到这里，建议为 Nginx 创建一个运行的账户 *www*，且该账户不允许登录系统。

```shell
$ useradd www -s /sbin/nologin  # 创建一个运行账户
```

### 安装 Nginx

开始编译 Nginx 并安装。

```shell
$ ./configure --prefix=/usr/local/nginx --user=www --group=www --without-http_memcached_module --with-http_stub_status_module --with-http_ssl_module  # 配置
$ make && make install  # 编译并安装
```

### 配置

要将 Nginx 加入开机启动项，需要先下载一个管理脚本，下载地址：[nginx](https://static.openapi.link/nginx)，同样下载到 `/lnmp/` 中。

```shell
$ cd /lnmp/
$ wget https://static.openapi.link/nginx  # 下载脚本
```

或者编写一个名为 `nginx` 脚本。

```shell
$ cd /lnmp/
$ vim nginx
```

将以下代码复制粘贴进该脚本中。

```shell
#!/bin/bash
# nginx Startup script for the Nginx HTTP Server
# it is v.0.0.2 version.
# chkconfig: - 85 15
# description: Nginx is a high-performance web and proxy server.
# It has a lot of features, but it's not for everyone.
# processname: nginx
# pidfile: /var/run/nginx.pid
# config: /usr/local/nginx/conf/nginx.conf
nginxd=/usr/local/nginx/sbin/nginx
nginx_config=/usr/local/nginx/conf/nginx.conf
nginx_pid=/usr/local/nginx/logs/nginx.pid
RETVAL=0
prog="nginx"
# Source function library.
. /etc/rc.d/init.d/functions
# Source networking configuration.
. /etc/sysconfig/network
# Check that networking is up.
[ ${NETWORKING} = "no" ] && exit 0
[ -x $nginxd ] || exit 0
# Start nginx daemons functions.
start() {
if [ -e $nginx_pid ];then
echo "nginx already running...."
exit 1
fi
echo -n $"Starting $prog: "
daemon $nginxd -c ${nginx_config}
RETVAL=$?
echo
[ $RETVAL = 0 ] && touch /var/lock/subsys/nginx
return $RETVAL
}
# Stop nginx daemons functions.
stop() {
echo -n $"Stopping $prog: "
killproc $nginxd
RETVAL=$?
echo
[ $RETVAL = 0 ] && rm -f /var/lock/subsys/nginx /usr/local/nginx/logs/nginx.pid
}
reload() {
echo -n $"Reloading $prog: "
#kill -HUP `cat ${nginx_pid}`
killproc $nginxd -HUP
RETVAL=$?
echo
}
# See how we were called.
case "$1" in
start)
start
;;
stop)
stop
;;
reload)
reload
;;
restart)
stop
start
;;
status)
status $prog
RETVAL=$?
;;
*)
echo $"Usage: $prog {start|stop|restart|reload|status|help}"
exit 1
esac
exit $RETVAL
```

然后按下 `Esc` 键，键入 `:wq` 保存并退出。

设置将 Nginx 加入开机启动项，并赋予执行权限。

```shell
$ cp /lnmp/nginx /etc/init.d/  # 将脚本拷贝至服务项
$ chmod 755 /etc/init.d/nginx  # 赋予脚本执行权限
$ chkconfig nginx start  # 设置开机启动项
$ service nginx start  # 启动 Nginx
nginx already running....
```

此刻，通过本地浏览器访问该服务器 IP 地址，能看到 `Welcome to nginx` 说明安装成功。

![Welcome to nginx](/images/2AAB7BA577F1FCE4692C77B86239219E-f1c1ba26a7.png)

若访问失败，请检查 [#防火墙配置](#防火墙配置) 或检查是否有开启 Shadowsocks 类似的翻墙程序。

## MySQL

### 创建 MySQL 用户组

MySQL 的安装同样需要新建一个 *mysql* 的用户（组），且不允许登录。

```shell
$ useradd mysql -s /sbin/nologin
```

创建 MySQL 数据库文件存放目录，并修改所属用户为 *mysql*。

```shell
$ mkdir -p /var/mysql/data  # 创建数据库文件存放目录
$ chown -R mysql:mysql /var/mysql/data  # 设置该目录用户为 mysql
```

### 安装 MySQL

开始安装 MySQL，同样需先下载 MySQL，下载地址：[mysql-5.5.28.tar.gz](https://static.openapi.link/mysql-5.5.28.tar.gz)，下载到 `/lnmp/` 目录下。

```shell
$ cd /lnmp/
$ wget https://static.openapi.link/mysql-5.5.28.tar.gz  # 下载 MySQL
$ tar zxvf mysql-5.5.28.tar.gz  # 解压
$ cd mysql-5.5.28  # 进入解压目录
$ cmake -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
-DMYSQL_UNIX_ADDR=/usr/local/mysql/mysql.sock \
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_MYISAM_STORAGE_ENGINE=1 \
-DWITH_INNOBASE_STORAGE_ENGINE=1 \
-DWITH_MEMORY_STORAGE_ENGINE=1 \
-DWITH_READLINE=1 -DENABLED_LOCAL_INFILE=1 \
-DMYSQL_DATADIR=/var/mysql/data \
-DMYSQL_USER=mysql -DMYSQL_TCP_PORT=3306
$ make && make install  # 编译安装
```

这个等待过程视机器性能而定，完成后配置 MySQL 的配置文件。

```shell
$ cd /usr/local/mysql
$ cp ./support-files/my-huge.cnf /etc/my.cnf  #拷贝配置文件
#键入 y 覆盖
$ vim /etc/my.cnf  #编辑配置文件，在 [mysqld] 部分增加
```

在 `[mysql]` 中添加数据库文件的保存路径。

```
datadir = /var/mysql/data
```

按下 `Esc` 键，键入 `:wq` 保存并退出，接着生成数据库文件，并将 MySQL 添加至服务项。

```shell
$ ./scripts/mysql_install_db --user=mysql  #生成mysql系统数据库
$ cp ./support-files/mysql.server /etc/init.d/mysql  #把 Mysql 加入系统启动
```

### 配置

```shell
$ vim /etc/init.d/mysql
```

找到 `basedir` 和 `datadir`，默认情况下，他们应该没有值，将配置修改。

```
basedir=/usr/local/mysql
datadir=/var/mysql/data
```

按下 `Esc` 键，键入 `:wq` 保存并退出，接着赋予脚本执行权限并加入开机启动项。

```shell
$ chmod 755 /etc/init.d/mysql  # 赋予执行权限
$ chkconfig mysql on  # 添加开机启动项
$ chown -R mysql /usr/local/mysql  # 将 /usr/local/mysql 所属用户修改为 mysql
$ service mysql start  # 启动 MySQL
Starting MySQL.. SUCCESS!
```

最后，将 MySQL 加入系统环境变量中，即可使用 `mysql` 命令。

```shell
$ vim /etc/profile
```

在文件末尾追加。

```
export PATH=$PATH:/usr/local/mysql/bin
```

按下 `Esc` 键，键入 `:wq` 保存并退出，然后将配置生效。

```shell
$ source /etc/profile
```

### 配置 MySQL 管理员密码。

```shell
$ mysql_secure_installation
...
Enter current password for root (enter for none):  # 输入 root 密码，没有，直接回车
...
Set root password? [Y/n]  # 输入 y 回车
...
New password:  # 设置密码
Re-enter new password:  # 确认密码
...
Remove anonymous users? [Y/n]  # 移除匿名用户，输入 y 回车
...
Disallow root login remotely? [Y/n]  # 不允许 root 用户远程登录，允许，输入 n 回车
...
Remove test database and access to it? [Y/n]  # 移除 test 数据库，这个随便
...
Reload privilege tables now?  # 重载，是，输入 y 回车
...
Thanks for using MySQL!
```

现在，在终端中输入 `mysql` 命令是否正常。

```shell
$ mysql -uroot -p
Enter password:
mysql>
```

按下 `Ctrl + C` 退出 MySQL，至此，MySQL 安装完成。

## PHP7

首先下载 PHP7 的包，下载地址：[php-7.1.11.tar.gz](http://cn2.php.net/get/php-7.1.11.tar.gz/from/this/mirror)，下载到 `/lnmp/` 目录下。

```shell
$ cd /lnmp/
$ wget -O php-7.1.11.tar.gz http://cn2.php.net/get/php-7.1.11.tar.gz/from/this/mirror  # 下载
$ tar zxvf php-7.1.11.tar.gz  # 解压
$ cd php-7.1.11
$ ./configure --prefix=/usr/local/php7 --with-config-file-path=/usr/local/php7/etc  --with-mysqli=/usr/local/mysql/bin/mysql_config --enable-mysqlnd --with-mysql-sock=/usr/local/mysql/mysql.sock --with-gd --with-iconv --with-zlib --enable-xml --enable-bcmath --enable-shmop --enable-sysvsem --enable-inline-optimization --enable-mbregex --enable-fpm --enable-mbstring --enable-ftp --enable-gd-native-ttf --with-openssl --enable-pcntl --enable-sockets --with-xmlrpc --enable-zip --enable-soap --without-pear --with-gettext --enable-session --with-mcrypt --with-curl --with-jpeg-dir --with-freetype-dir   --with-pdo-mysql=/usr/local/mysql/
$ make && make install  # 编译并安装
```

这个过程就有点长了，可以喝杯茶 ????，放松放松眼睛 ，或者给我留个言吧 _(:зゝ∠)__。

### 配置

一杯茶之后，继续。

```shell
$ cp php.ini-production /usr/local/php7/etc/php.ini  # 复制 php 配置文件到安装目录
$ rm -f /etc/php.ini  # 删除系统自带配置文件
$ ln -s /usr/local/php7/etc/php.ini /etc/php.ini  # 添加软链接
$ cp /usr/local/php7/etc/php-fpm.conf.default /usr/local/php7/etc/php-fpm.conf  # 拷贝模板配置文件为php-fpm配置文件
$ vim /usr/local/php7/etc/php-fpm.conf
```

找到 `;pid = run/php-fpm.pid` 将前面的 `;` 去掉。

```shell
$ cp /usr/local/php7/etc/php-fpm.d/www.conf.default /usr/local/php7/etc/php-fpm.d/www.conf  # 复制配置文件
$ vim /usr/local/php7/etc/php-fpm.d/www.conf  # 编辑配置文件
```

找到 `user = nobody` 和 `group = nobody`，`nobody` 均改为 `www` 用户（组）。

### 开机启动

```shell
$ cp sapi/fpm/init.d.php-fpm /etc/init.d/php-fpm  #拷贝php-fpm到启动目录
$ chmod 0755 /etc/init.d/php-fpm  #修改权限
$ chkconfig php-fpm on  #设置开机启动
$ service php-fpm start  #启动php-fpm
Starting php-fpm  done
```

### 配置 Nginx 支持 PHP

```shell
$ vim /usr/local/nginx/conf/nginx.conf  # 编辑 nginx 配置文件
```

找到一下代码去掉前面的注释符号 `#`。

```nginx
location ~ .php$ {
    ...
    # fastcgi_param SCRIPT_FILENAME /scripts$fastcgi_script_name;
    # 注释掉以上条代码添加下面代码
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

至此，PHP 与 Nginx 关联配置完成，你可以在 `/usr/local/nginx/html/` 新建 `index.php` 中写入 PHP 代码测试。

### 配置主机

Nginx 默认的路径：`/usr/local/nginx/html/` 这样的目录太深了不利于操作，我把他放到根目录以便查找。

```shell
$ ln -s /usr/local/nginx/html/ /www  # 设置软连接
```

然后配置虚拟主机。

```shell
$ vim /usr/local/nginx/conf/nginx.conf  # 编辑 Nginx 配置文件
```

在 **最末尾的 `}` 之前一行** 插入 `include "vhost/*.conf";`，并创建虚拟主机配置目录。

```shell
$ cd /usr/local/nginx/conf
$ mkdir vhost
```

若需要新增一个虚拟站点，则直接在 `/usr/local/nginx/conf/vhost` 目录下新建一个站点配置文件，并在 `/www/` 下创建一个同名的目录即可。

格式如下：

```nginx
server {
        listen       80;  # 监听端口
        server_name  www.example.com;  # 域名
        root         /www/www.example.com;  # 站点根目录
        index  index.php index.html index.htm;

        location ~ \.php$ {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }
}
```

## Apache *

> 注：强烈不建议同时安装 Apache 和 Nginx。

首先你到官网下载 [Apache](https://httpd.apache.org/download.cgi)，这里我安装的是 2.2.34 比较稳定的版本，我准备了一个地址：[httpd-2.2.34.tar.gz](http://mirrors.shuosc.org/apache//httpd/httpd-2.2.34.tar.gz)。

你可以使用 `wget` 命令进行下载。 若不存在 */lnmp/* 目录请先使用 `mkdir /lnmp` 创建目录。

```shell
$ cd /lnmp  # 切换到 /lnmp 目录，不存在则先 mkdir /lnmp 再执行
$ wget http://mirrors.shuosc.org/apache//httpd/httpd-2.2.34.tar.gz  #下载 httpd 包
```

然后解压并进入解压后的目录。

```shell
$ tar zxvf httpd-2.2.34.tar.gz  #解压 httpd 包
$ cd httpd-2.2.34  #进入 httpd 解压后的目录
```

配置安装位置并开始安装。

```shell
$ ./configure --prefix=/user/local/apache2  #配置安装目录
$ make && make install  #编译并安装
```

启动 Apache 服务器。

```shell
$ /usr/local/apache2/bin/apachectl start
```

关于 Apache 只简单介绍到这里，关于开机启动项、系统服务、虚拟主机（virtual host）等配置先立个 flag，有时间再更新。
