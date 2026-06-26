---
title: "造轮子之谷歌字体镜像站"
excerpt: "此文为 造轮子之谷歌镜像站 的衍生。 其实谷歌字体在 2017 年左右就已经解封了，现在解析到的一个北京的 IP 上。对于前端来说，使用谷歌字体再也不用担心加载不出来了。 最早玩博客的时候，谷歌字体是我必屏蔽的（<del 解决不了问题，就解"
publishDate: 2018-03-29T02:32:00.000Z
updatedDate: 2020-12-22T02:04:56.000Z
isFeatured: false
tags: ["造轮子系列", "Nginx"]
seo: 
  description: "此文为 造轮子之谷歌镜像站 的衍生。 其实谷歌字体在 2017 年左右就已经解封了，现在解析到的一个北京的 IP 上。对于前端来说，使用谷歌字体再也不用担心加载不出来了。 最早玩博客的时候，谷歌字体是我必屏蔽的（<del 解决不了问题，就解"
  pageType: article
---
> 此文为 [造轮子之谷歌镜像站](/i-love-google.html) 的衍生。

其实谷歌字体在 2017 年左右就已经解封了，现在解析到的一个北京的 IP 上。对于前端来说，使用谷歌字体再也不用担心加载不出来了。

最早玩博客的时候，谷歌字体是我必屏蔽的（<del>解决不了问题，就解决出问题的代码</del>），到后来我使用过 360 旗下的 `http://fonts.useso.com` （挂了）也用过 Cat Networks 下的 `https://fonts.cat.net`，到后来谷歌字体解封，喜大普奔连忙换上 `https://fonts.googleapis.com`，享受着谷歌给开发者带来的福利。

问题出现在最近，公司的网络防火墙貌似把谷歌字体库给墙了。以上所有字体库全都凉凉（<de;>防火墙：对，不是针对谁，在座的都是辣鸡</del>）。这样带来的问题就是——我特么打开一个带谷歌字体的网页先让我看近半分钟的**开场白**。我的博客，我刚写的 [OpenAPI](https://openapi.link)，无一幸免。

**我得做点什么。**首先得明白是什么原因，打开终端输入命令 `ping fonts.googleapis.com` 得到 IP `172.217.24.42`（香港，且无法 Ping 通）；拔掉网线，连上手机热点终端输入命令 `ping fonts.googleapis.com` 得到 IP `203.208.50.70`（北京，能 Ping 通）。

其实现在问题变得很简单了，公司的网络将谷歌字体库的域名仍解析在国外的服务器上。所以我们只需要将本地的 Hosts 文件手动指向北京的 IP 就好了。Windows 在 `C:\Windows\System32\drivers\etc\hosts`，Mac / UNIX 在 `/etc/hosts` 新增一行 `203.208.50.70  fonts.googleapis.com` 就能解决一半的问题。

**然鹅。**我就喜欢用复杂的方式来解决简单的问题！脑海中冒出一个有趣的想法——为什么不自己搭建一个谷歌字体镜像呢？

**利用 Nginx 进行反向代理，然后用 CDN 做缓存**。

套路和搭建谷歌镜像站差不多，不过值得注意的是在 `fonts.google.com` 中得到的 CSS 文件里有 `fonts.gstatic.com` （北京 IP 为 `203.208.51.56`，修改 Hosts 文件的话需要新增一行 `203.208.51.56  fonts.gstatic.com`）的路径，如果 `fonts.googleapis.com` 被墙了，那么这个肯定也不可幸免。所以需要反向代理两个站点。

搭建这个镜像站也不需要境外服务器，只需要你的服务器能正常访问就行。配置如下：

```nginx
server
{
    listen 80;
    # listen 443 ssl http2;
    server_name fonts.openapi.link;
  
    # 强制跳转 HTTPS
    #if ($server_port !~ 443){
    #    rewrite ^(/.*)$ https://$host$1 permanent;
    #}
    #HTTP_TO_HTTPS_END
    # HTTPS 证书地址
    # ssl_certificate    /foo/bar.key; 
    # ssl_certificate_key    /foo/bar.pem;
    # ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    # ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    # ssl_prefer_server_ciphers on;
    # ssl_session_cache shared:SSL:10m;
    # ssl_session_timeout 10m;
    # error_page 497  https://$host$request_uri;
    
    # 用于 fonts.googleapis.com 代理
    location /css {
      sub_filter 'fonts.gstatic.com' 'fonts.openapi.link';
      sub_filter_once off;
      sub_filter_types text/css;
      proxy_pass_header Server;
      proxy_set_header Host fonts.googleapis.com;
      proxy_set_header Accept-Encoding '';
      proxy_redirect off;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Scheme $scheme;
      proxy_pass https://fonts.googleapis.com;
      proxy_cache cache_one;
      proxy_cache_key $host$request_uri$is_args$args;
      proxy_cache_valid 200 304 301 302 1h;
      expires 365d;
    }
    # 用于 fonts.gstatic.com 代理
    location / 
    {
      proxy_pass_header Server;
      proxy_set_header Host fonts.gstatic.com;
      proxy_redirect off;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Scheme $scheme;
      proxy_pass https://fonts.gstatic.com;
      proxy_cache cache_one;
      proxy_cache_key $host$request_uri$is_args$args;
      proxy_cache_valid 200 304 301 302 1h;
      expires 365d;
    }
    # 日志
      access_log  /www/wwwlogs/fonts.openapi.link.log;
}
```

总算折腾完了，配置上 CDN，速度杠杠的。也欢迎使用我的谷歌字体镜像 `fonts.openapi.link`。

**嗷~对了！**各位看官再等等，我有一个大宝贝给你们介绍一下（<del>掏裤裆</del>）——[开放 API](https://openapi.link)：为开发者而生。

后来我想想，我折腾了这么大一圈图什么呢？
