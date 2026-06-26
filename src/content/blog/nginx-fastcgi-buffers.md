---
title: "Nginx fastcgi_temp 目录不可写带来的灾难"
excerpt: "解决问题 如上文，解决完 Nginx 默认进程守护后，日志消停下来终于能看到报错信息。 错误日志： 看到 Permission denied 瞬间菊花一紧。 回想起来 Nginx 的运行用户是一个普通用户，对以 root 用户的目录确实是不"
publishDate: 2018-09-21T01:24:00.000Z
updatedDate: 2020-12-22T02:01:49.000Z
isFeatured: false
tags: ["成长笔记", "Nginx"]
seo: 
  description: "解决问题 如上文，解决完 Nginx 默认进程守护后，日志消停下来终于能看到报错信息。 错误日志： 看到 Permission denied 瞬间菊花一紧。 回想起来 Nginx 的运行用户是一个普通用户，对以 root 用户的目录确实是不"
  pageType: article
---
## 解决问题

如上文，解决完 *Nginx* 默认进程守护后，日志消停下来终于能看到报错信息。

错误日志：

```
2018/09/20 15:02:36 [crit] 3396#0: *10 open()
"/usr/local/nginx/fastcgi_temp/2/00/0000000002" failed (13: Permission denied)
```

看到 **Permission denied** 瞬间菊花一紧。

回想起来 *Nginx* 的运行用户是一个普通用户，对以 *root* 用户的目录确实是不可写的（Nginx 以 root 用户身份安装）。

找到 Nginx 的配置文件 *nginx.conf*，修改 `user` 参数为 `root`。

重启 *Nginx* 后，导出功能正常。问题已经解决。

## 问题还原

但是，为什么会「导出当前页」能正常导出而「导出全部」就失败呢？刨根问底得去查 [参考资料](https://blog.csdn.net/crx05/article/details/70210323) 找到解释：

> 先简单的说一下 Nginx 的 buffer 机制，对于来自 FastCGI Server 的 Response，Nginx 将其缓冲到内存中，然后依次发送到客户端浏览器。缓冲区的大小由 fastcgi_buffers 和 fastcgi_buffer_size 两个值控制。
>
> Nginx 默认配置如下：
>
> ```nginx
fastcgi_buffers      8 4/8K;
fastcgi_buffer_size  4K;
```
>
> fastcgi_buffers 控制 nginx 最多创建 8 个大小为 4K 的缓冲区，而 fastcgi_buffer_size 则是处理 Response 时第一个缓冲区的大小，不包含在前者中。所以总计能创建的最大内存缓冲区大小是 8*4K+4K = 36k。而这些缓冲区是根据实际的 Response 大小动态生成的，并不是一次性创建的。比如一个 8K 的页面，Nginx 会创建 2*4K 共 2 个 buffers。
>
> 当 Response 小于等于 36k 时，所有数据当然全部在内存中处理。如果 Response 大于 36k 呢？fastcgi_temp 的作用就在于此。多出来的数据会被临时写入到文件中，放在这个目录下面。

也就是说，当前几台服务器上的站点，一旦响应的数据超过 36 KB 超出的部分将写到 *fastcgi_temp* 目录，如果 *fastcgi_temp* 不可写的话将只返回前 36 KB 的内容，难怪手动将分页条数参数给到 *1000* 页面不完整。

## 参考资料

- [分析 fastcgi_temp 错误以及 Nginx 的 Buffer 机制](https://blog.csdn.net/crx05/article/details/70210323)
- [HttpFcgi 模块](http://www.nginx.cn/doc/standard/httpfcgi.html#top)
