---
title: "解决 macOS 零信任（aTrust）客户端启动报错：重新启动核心服务失败"
excerpt: "公司最近更换了 VPN，从 EasyConnect 换成了 aTrust，都是深信服家的产品这里就不讨论哪个好用哪个难用了，反正装上之后都是在裸奔。 我一直在使用 EasyConnect 但是最近停服了，而 aTrust 启动总是报错：重新"
publishDate: 2023-04-17T10:27:00.000Z
updatedDate: 2023-11-14T03:19:28.000Z
isFeatured: false
tags: ["atrust", "深信服"]
seo: 
  description: "公司最近更换了 VPN，从 EasyConnect 换成了 aTrust，都是深信服家的产品这里就不讨论哪个好用哪个难用了，反正装上之后都是在裸奔。 我一直在使用 EasyConnect 但是最近停服了，而 aTrust 启动总是报错：重新"
  pageType: article
---
公司最近更换了 VPN，从 EasyConnect 换成了 aTrust，都是深信服家的产品这里就不讨论哪个好用哪个难用了，反正装上之后都是在裸奔。

我一直在使用 EasyConnect 但是最近停服了，而 aTrust 启动总是报错：重新启动核心服务失败。

![Image_20230417173452.png][1]

我尝试了卸载重装、重启等一系列操作依然无法启动，后来按照之前卸载 EasyConnect 的方法试了一遍发现有用，这里记录一下。

1. 退出并卸载 aTrust，直接拖进废纸篓就行
2. 终端执行命令 `open /Library/LaunchDaemons/`，删除所有 `com.sangfor` 开头的文件
3. 终端执行命令 `open /Library/LaunchAgents/`，删除所有 `com.sangfor` 开头的文件
4. 重启
5. 打开钥匙串，搜索 `sangfor` 删除根证书
6. 重新安装即可

<del>呜呜呜，完了，我的电脑不干净了。</del>

  [1]: /images/2854127981-6e6ffde8ce.png
