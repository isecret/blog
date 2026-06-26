---
title: "使用 Nginx 代理新浪图床绕过防盗链 403"
excerpt: "不知什么时候起，新浪图床开始对图片采取防盗链措施。还好博客的图片很早之前就迁移到了 OneDrive，免费的才是最贵的来描述使用新浪作为图床的朋友再适合不过。 不过我看了一下防盗链机制，发现还有机会抢救一下。目前发现第三方域名调用图片，Ne"
publishDate: 2019-05-22T08:32:00.000Z
updatedDate: 2020-12-22T01:59:35.000Z
isFeatured: false
tags: ["成长笔记", "Nginx", "Sina", "图床"]
seo: 
  description: "不知什么时候起，新浪图床开始对图片采取防盗链措施。还好博客的图片很早之前就迁移到了 OneDrive，免费的才是最贵的来描述使用新浪作为图床的朋友再适合不过。 不过我看了一下防盗链机制，发现还有机会抢救一下。目前发现第三方域名调用图片，Ne"
  pageType: article
---
不知什么时候起，新浪图床开始对图片采取防盗链措施。还好博客的图片很早之前就迁移到了 OneDrive，免费的才是最贵的来描述使用新浪作为图床的朋友再适合不过。

不过我看了一下防盗链机制，发现还有机会抢救一下。目前发现第三方域名调用图片，Network 为 403，通过图片链接点击也是 403，而直接复制新标签页打开则正常显示。

这种防盗链机制我在 [donwa/oneindex](https://github.com/donwa/oneindex) 程序上也写过，根据请求头的 `Referer` 来判断请求的来源页，如果非白名单域名则直接返回 403。

使用 CURL 证实猜想：

```bash
$ curl http://ww1.sinaimg.cn/large/0061wtobgy1fxmqoe86rkj30gb0gb76n.jpg -H "Referer:https://blog.wangmao.me/" -G -I 
HTTP/1.1 403 Forbidden
Server: Tengine
Date: Wed, 22 May 2019 08:48:35 GMT
Content-Type: text/html
Content-Length: 254
Connection: keep-alive
X-Tengine-Error: denied by Referer ACL
X-Via-CDN: f=alicdn,s=cache1.cn64,c=183.62.230.102;
Via: cache1.cn64[,403003]
Timing-Allow-Origin: *
EagleId: 7793461515585149156862720e

$ curl http://ww1.sinaimg.cn/large/0061wtobgy1fxmqoe86rkj30gb0gb76n.jpg -H "Referer:https://mobile.sina.com.cn/" -G -I
HTTP/1.1 200 OK
Server: Tengine
Content-Type: image/jpeg
Content-Length: 97491
Connection: keep-alive
Date: Tue, 21 May 2019 03:42:08 GMT
x-debug-hit: sto(97491,0.001)
Pragma: public
Cache-Control: max-age=7776000
Last-Modified: Mon, 08 Jul 2013 18:06:40 GMT
Expires: Mon, 19 Aug 2019 03:42:08 GMT
X-Request-ID: g2.125-1558410128.494000-2249042609
LB_HEADER: wbtngx.29.wbg1.shx.lb.sinanode.com
Via: http/1.1 cnc.beixian.ha2ts4.212 (ApacheTrafficServer/6.2.1 [cMsSfW]), http/1.1 cmcc.beijing.ha2ts4.160 (ApacheTrafficServer/6.2.1 [cMsSfW]), cache4.l2cm12-1[0,200-0,H], cache19.l2cm12-1[0,0], cache8.cn64[70,200-0,M], cache10.cn64[71,0]
X-Via-Edge: 15584101284105dd10d6fdec1b3dd569fc895
X-Via-CDN: f=alicdn,s=cache10.cn64,c=183.62.230.102;f=alicdn,s=cache19.l2cm12-1,c=119.147.70.28;f=edge,s=cmcc.beijing.ha2ts4.205.nb.sinaedge.com,c=111.13.209.93;f=Edge,s=cmcc.beijing.ha2ts4.160,c=221.179.175.205;f=edge,s=cnc.beixian.ha2ts4.213.nb.sinaedge.com,c=172.16.181.61;f=Edge,s=cnc.beixian.ha2ts4.212,c=123.126.157.213
Ali-Swift-Global-Savetime: 1558410128
X-Swift-SaveTime: Tue, 21 May 2019 03:42:08 GMT
X-Swift-CacheTime: 7776000
Age: 104777
X-Cache: MISS TCP_MISS dirn:-2:-2
X-Swift-SaveTime: Wed, 22 May 2019 08:48:25 GMT
X-Swift-CacheTime: 7671223
Timing-Allow-Origin: *
EagleId: 7793461e15585149053975458e
```

这就好办了，Nginx 直接代理 `Referer` 欺骗图床服务器。实现代码如下：

```nginx
server {
  listen 80;
  listen 443 ssl http2;
  server_name sina-img.wangmao.me;
  index index.html index.htm index.php;
  ...
  #全站代理
  location / {
    #设置 host
    proxy_set_header Host $proxy_host;
    #设置 referer 这里我用的手机版的新浪首页你可以自己找找其他的
    proxy_set_header Referer https://mobile.sina.com.cn;
    #最后代理域名 ws1 ww1 wx3 wx4 等
    proxy_pass https://ww1.sinaimg.cn/;
  }
  ...
}
```

 当然这样会走自己的服务器的流量，你需要修改全文替换新浪的域名为你的域名。就像这样 `https://sina-img.wangmao.me/large/0061wtobgy1fxmqoe86rkj30gb0gb76n.jpg`。


还是趁早迁移吧，毕竟免费的才是最贵的。
