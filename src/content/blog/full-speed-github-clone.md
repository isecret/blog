---
title: "让 Github clone 速度拉满"
excerpt: "起因 在项目中不时需要一些开源的工具或者库需要 clone 下来编译或者使用，但是境内访问 Github 的速度实在难堪，导致 clone 的速度经常在 100kb 左右浮动，这仓库要是小忍忍也就过去了，而一些比较大的包那没一下午你还真搞不"
publishDate: 2020-04-08T04:20:00.000Z
updatedDate: 2020-12-22T01:57:09.000Z
isFeatured: false
tags: ["成长笔记", "Github", "Proxy"]
seo: 
  description: "起因 在项目中不时需要一些开源的工具或者库需要 clone 下来编译或者使用，但是境内访问 Github 的速度实在难堪，导致 clone 的速度经常在 100kb 左右浮动，这仓库要是小忍忍也就过去了，而一些比较大的包那没一下午你还真搞不"
  pageType: article
---
## 起因

在项目中不时需要一些开源的工具或者库需要 clone 下来编译或者使用，但是境内访问 Github 的速度实在难堪，导致 clone 的速度经常在 `100kb` 左右浮动，这仓库要是小忍忍也就过去了，而一些比较大的包那没一下午你还真搞不定。

## 对比

没有对比没有伤害，我这里使用 `laradock/laradock` 作为示例，为了排除我本地网络的影响，本次实验在阿里云的服务器上进行，直接上图。

直连 Github clone 仓库：

![直连 Github clone 仓库](/images/9D29C2CD7D0DD39156A607ABEB9840EC-c43551682d.png)



通过镜像 clone 仓库：

![通过镜像 clone 仓库](/images/7F0708B8C94931A3183AEECD6C093AD5-68e2ed395f.png)



速度提升非常明显，而速度就是妥妥的生产力啊。

## 配置

```nginx
upstream github {
    server 192.30.253.112:443;
    server 192.30.253.113:443;
    keepalive 16;
}

server
{
    listen 80;
    listen 443 ssl http2 reuseport;

    ssl_certificate /etc/nginx/ssl/git.wangmao.me.crt;
    ssl_certificate_key /etc/nginx/ssl/git.wangmao.me.key;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_session_timeout      1d;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;

    ssl_session_cache        shared:SSL:50m;

    ssl_session_tickets      on;

    ssl_stapling             on;

    server_name git.wangmao.me;

    if ($http_user_agent ~* "qihoobot|Baiduspider|Googlebot|Googlebot-Mobile|Googlebot-Image|Mediapartners-Google|Adsbot-Google|Feedfetcher-Google|Yahoo! Slurp|Yahoo! Slurp China|YoudaoBot|Sosospider|Sogou spider|Sogou web spider|MSNBot|ia_archiver|Tomato Bot")
    {
        return 403;
    }
  
    if ($server_port !~ 443) {
        rewrite ^(/.*)$ https://$host$1 permanent; 
    }

    location / {
        proxy_set_header Accept-Encoding "";
        proxy_set_header Connection "";
        proxy_http_version 1.1;
        proxy_connect_timeout    10s;
        proxy_read_timeout       10s;
        proxy_set_header Host github.com;

        proxy_hide_header Strict-Transport-Security;

        proxy_pass https://github;
    }
}
```

## 其他方法

除了使用镜像站 clone 仓库，你还可以使用各类「网络优化」软件，通常他们支持 `sock5` 或者 `http` 通过本地或者局域网设置代理。

在终端中命令通常如下：

```bash
# 设置终端代理
$ export https_proxy=http://127.0.0.1:1080 http_proxy=http://127.0.0.1:1080 all_proxy=socks5://127.0.0.1:1081
# 取消终端代理
$ unset https_proxy http_proxy all_proxy
```

我将多个封装为别名，`oh-my-zsh` 编辑 `~/.zshrc` 插入，`bash` 编辑 `~/.bash_profile`：

```bash
# 设置代理
alias proxy="export http_proxy=$PROXYURL:$PROXYPORT https_proxy=$PROXYURL:$PROXYPORT all_proxy=socks5://127.0.0.1:1081;curl cip.cc"
# 取消代理
alias noproxy="unset http_proxy https_proxy all_proxy;curl cip.cc"
```

然后 `source ./zshrc` 就可以使用快捷命令啦。

```bash
$ proxy
IP	: 34.97.27.*
地址	: 美国  美国

数据二	: 日本 | 大阪Google云计算数据中心

数据三	: 美国德克萨斯休斯顿

URL	: http://www.cip.cc/34.97.27.*

$ noproxy
IP	: 120.237.94.*
地址	: 中国  广东  深圳
运营商	: 移动

数据二	: 广东省深圳市 | 移动

数据三	: 中国广东深圳 | 移动

URL	: http://www.cip.cc/120.237.94.*

```

## 参考

- [使用nginx反向代理github - 技术宅改变世界](https://ghostcir.com/s/128.html)
