---
title: "Java 8 默认禁用 TLSv1 导致 SQLServer 连接失败"
excerpt: "一个月前为一个老项目升级了 JDK 版本，现在整个环境都使用 Docker 镜像启动，Web 服务一切正常，测试也验收通过了。 最近运维同学找过来说有一批新数据没有同步过来，查询了表数据和日志基本判定是定时任务的问题，找过找到日志定位发现错"
publishDate: 2023-03-07T04:52:00.000Z
updatedDate: 2023-03-08T06:07:51.000Z
isFeatured: false
tags: []
seo: 
  description: "一个月前为一个老项目升级了 JDK 版本，现在整个环境都使用 Docker 镜像启动，Web 服务一切正常，测试也验收通过了。 最近运维同学找过来说有一批新数据没有同步过来，查询了表数据和日志基本判定是定时任务的问题，找过找到日志定位发现错"
  pageType: article
---
一个月前为一个老项目升级了 JDK 版本，现在整个环境都使用 Docker 镜像启动，Web 服务一切正常，测试也验收通过了。

最近运维同学找过来说有一批新数据没有同步过来，查询了表数据和日志基本判定是定时任务的问题，找过找到日志定位发现错误，具体是定时任务在连接 SQLServer 服务器时出错：

```
The driver could not establish a secure connection to SQL Server by using Secure Sockets Layer (SSL) encryption: No appropriate protocol (protocol is disabled or cipher suites are inappropriate)
```

搜索发现是因为 Java 8 在新版本中将 TLSv1.0 和 TLSv1.1 禁用了，而项目中 SQLServer 驱动使用的正是 TLSv1。

首先找到 `jre` 目录：

```bash
$ env | grep JAVA_HOME
JAVA_HOME=/opt/java/openjdk
$ cd /opt/java/openjdk/jre/lib/security/
$ vim java.security
```

编辑 `java.security` 文件，然后找到 `jdk.tls.disabledAlgorithms` 属性中删除 `TLSv1` 和 `TLSv1.1`，修改完如下：

```
...
jdk.tls.disabledAlgorithms=SSLv3, RC4, DES, MD5withRSA, \
    DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL, \
    include jdk.disabled.namedCurves
...
```

然后重启 Web 应用即可。不过我这里是通过容器启动的，我的做法是将 `java.security` 在本地存储一份，修改完成后通过挂载的方式放进容器中，配置如下：

```yaml
version: '3'
services:
  tomcat_task:
    image: tomcat:8.5.85-jdk8-temurin-jammy
    container_name: tomcat_task
    environment:
      TZ: "Asia/Shanghai"
    volumes:
      - ./java/conf/java.security:/opt/java/openjdk/jre/lib/security/java.security
      - ./tomcat/conf/server.xml:/usr/local/tomcat/conf/server.xml
      - ./tomcat/conf/web.xml:/usr/local/tomcat/conf/web.xml
      - ./tomcat/webapps:/usr/local/tomcat/webapps
      - ./tomcat/logs:/usr/local/tomcat/logs
```

重启容器生效。

参考：
- [Java 8 发行版要点说明](https://www.java.com/zh-CN/download/help/release_changes.html)
- [Postfix and OpenJDK 11: "No appropriate protocol (protocol is disabled or cipher suites are inappropriate)"](https://stackoverflow.com/a/68524796)
- [Java8 (291) 之后，禁用了 TLS1.1 , 使 JDBC 无法用 SSL 连接 SqlServer2008 怎么办，以下是解决办法](https://blog.csdn.net/kfepiza/article/details/119084415)
