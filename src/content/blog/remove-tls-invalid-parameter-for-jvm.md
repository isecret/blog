---
title: "Java 8 指定默认协议为 TLSv1 导致 HTTP 客户端 SSL Connection Reset"
excerpt: "昨天在解决 Java 8 移除 TLSv1 导致 SQLServer 连接失败 时尝试过这个办法，通过 JVM 参数 Djdk.tls.client.protocols=TLSv1 指定 TLS 协议版本，链接：SQL Server JDB"
publishDate: 2023-03-08T06:07:00.000Z
updatedDate: 2023-03-08T06:12:59.000Z
isFeatured: false
tags: []
seo: 
  description: "昨天在解决 Java 8 移除 TLSv1 导致 SQLServer 连接失败 时尝试过这个办法，通过 JVM 参数 Djdk.tls.client.protocols=TLSv1 指定 TLS 协议版本，链接：SQL Server JDB"
  pageType: article
---
昨天在解决 [Java 8 移除 TLSv1 导致 SQLServer 连接失败](https://blog.wangmao.me/enable-tls-v1-for-java8.html) 时尝试过这个办法，通过 JVM 参数 `-Djdk.tls.client.protocols=TLSv1` 指定 TLS 协议版本，链接：[SQL Server JDBC Error on Java 8: The driver could not establish a secure connection to SQL Server by using Secure Sockets Layer (SSL) encryption](https://stackoverflow.com/a/32766115)。

但是因为 TLSv1 被 Java8 默认禁用，所以配置没有生效，问题也没有解决，但是直到后面调整完 `java.security` 解决问题我也没有删除该 JVM 参数，然而当天晚上的定时任务就挂了。

定时任务中有一个请求内部应用的接口用于数据查询，报错为 `SSL Connection Reset`，最开始我还以为是对方服务挂了，然而我使用工具请求发现服务正常运行。瞬间我就想到了昨天修改的参数，因为现在主流 HTTPS 的 TLS 协议仅支持 TLSv1.2 以上，这里使用 TLSv1 请求，Web 服务器拒绝了该协议版本。

解决方案有三种，第一种是让第三方系统增加 TLSv1 的支持（<del>做梦</del>）；第二种是追加 `-Dhttps.protocols=TLSv1.2` JVM 参数使 HTTP 客户端发送 TLSv1.2 协议，然而我仍担心有其他问题出现；最后一种显然靠谱得多，移除 `jdk.tls.client.protocols` JVM 参数。
