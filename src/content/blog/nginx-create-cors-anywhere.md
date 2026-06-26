---
title: "使用 Nginx 实现 CORS Anywhere"
excerpt: "关于 CORS 的介绍，可以参见往期文章：简单谈谈跨域请求（CORS）。 简单来说，CORS 是一种解决浏览器跨域问题的方法，NPM 的实现有 Rob W/cors anywhere 这个轮子。 我也曾写过 PHP 的轮子 isecret/"
publishDate: 2019-05-21T09:22:00.000Z
updatedDate: 2020-12-22T01:59:52.000Z
isFeatured: false
tags: ["成长笔记", "CORS", "Nginx"]
seo: 
  description: "关于 CORS 的介绍，可以参见往期文章：简单谈谈跨域请求（CORS）。 简单来说，CORS 是一种解决浏览器跨域问题的方法，NPM 的实现有 Rob W/cors anywhere 这个轮子。 我也曾写过 PHP 的轮子 isecret/"
  pageType: article
---
关于 CORS 的介绍，可以参见往期文章：[简单谈谈跨域请求（CORS）](/talk-about-cors.html)。

简单来说，CORS 是一种解决浏览器跨域问题的方法，NPM 的实现有 [Rob--W/cors-anywhere](https://github.com/Rob--W/cors-anywhere) 这个轮子。

我也曾写过 PHP 的轮子 [isecret/gh-oauth-server](https://github.com/isecret/gh-oauth-server) 用于解决 Github 的跨域请求，最近又冒出了利用 Nginx 反向代理来再造轮子。

思路如下：针对预检请求(OPTION)响应头增加 `Access-Control-Allow-*` 相关的头信息，查阅文档发现 `add_header` 可实现；其次是代理URL地址的问题，我选择直接获取域名后的字符作为代理的地址，格式如下：`https://cors.wangmao.me/https://github.com/login/oauth/access_token`，取 Host `https://cors.wangmao.me/` 之后的字符作为 URL，这个地址看起来很诡异，但确实是最优的解决方式，代理地址通过正则可以匹配出来，但是注意这里匹配出来的 uri 实际上是 `https:/github.com/login/oauth/access_token`，协议部分只有一个 `/`，所以需要自己补充；另外是代理的 `Host` 和 `Referer`，这俩就直接取 `$proxy_host` 可以搞定。

具体实现如下：

```nginx
http {
  # 代理变量时需要告知DNS，不然会报出 no resolver defined to resolve 错误
  resolver 8.8.8.8;
}

server {
  listen 80;
  listen 443 ssl http2;
  ssl_certificate /usr/local/nginx/conf/ssl/cors.wangmao.me.crt;
  ssl_certificate_key /usr/local/nginx/conf/ssl/cors.wangmao.me.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
  ssl_ciphers TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_timeout 10m;
  ssl_session_cache builtin:1000 shared:SSL:10m;
  ssl_buffer_size 1400;
  add_header Strict-Transport-Security max-age=15768000;
  ssl_stapling on;
  ssl_stapling_verify on;
  server_name cors.wangmao.me;
  access_log off;
  error_log /data/wwwlogs/cors.wangmao.me.error.log;
  index index.html index.htm index.php;
  root /data/wwwroot/cors.wangmao.me;
  if ($ssl_protocol = "") { return 301 https://$host$request_uri; }

  include /usr/local/nginx/conf/rewrite/none.conf;
  #error_page 404 /404.html;
  #error_page 502 /502.html;

  #取代理地址 $1 为协议，$2 为地址
  #另外这里取到的 requst_uri https://xxx.com 实际为 http:/xxx.com 只有一个 /
  location ~* "/(.*):/(.*)" {
    #增加响应头允许请求的域和方法等
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "POST,GET,PUT,OPTIONS,DELETE";
    add_header Access-Control-Max-Age "3600";
    add_header Access-Control-Allow-Headers "Origin,X-Requested-With,Content-Type,Accept,Authorization,FOO";
    add_header Content-Length 0;
    add_header Content-Type "application/json;charset=utf-8,text/plain";
    add_header Proxy-Addr https://cors.wangmao.me;
    #如果为预检请求则直接响应204
    if ($request_method = OPTIONS ) {
      return 204;
    }
    #设置代理 Host 和 Referer
    proxy_set_header Host $proxy_host;
    proxy_set_header Referer $proxy_host;
    #告知代理内容类型为 json
    proxy_set_header Accept "application/json";
    #增加一个代理UA头
    proxy_set_header User-Agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36";
    #代理地址
    proxy_pass $1://$2/;
  }

  location ~ /\.ht {
    deny all;
  }
}
```
