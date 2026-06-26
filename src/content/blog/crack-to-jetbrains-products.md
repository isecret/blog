---
title: "JetBrains 全系产品破解激活"
excerpt: "Update: 2022 11 10: 最近使用了一段时间 EAP(Early Access Program) 版本，可以理解为正式版本的提前预览版，不需要订阅，问题地址如下：JetBrains 产品正版免授权使用。 2022 10 28:"
publishDate: 2022-10-11T07:05:00.000Z
updatedDate: 2022-11-14T06:18:12.000Z
isFeatured: false
tags: []
seo: 
  description: "Update: 2022 11 10: 最近使用了一段时间 EAP(Early Access Program) 版本，可以理解为正式版本的提前预览版，不需要订阅，问题地址如下：JetBrains 产品正版免授权使用。 2022 10 28:"
  pageType: article
---
Update:

- 2022-11-10: 最近使用了一段时间 EAP(Early Access Program) 版本，可以理解为正式版本的提前预览版，不需要订阅，问题地址如下：[JetBrains 产品正版免授权使用](https://blog.wangmao.me/eap-for-jetbrains-products.html)。
- 2022-10-28: 心理还是过不去，已经卸载 crack 工具，改用社区版本（Community Edition）。

---

说实话我是不太情愿去破解使用的，一直以来都使用开源授权，无奈这段时间太懒授权都要到期了，而公司采购的 IntelliJ IDEA 又正在路上，只能先用破解顶一段时间了。

![WechatIMG24767.png][1]

项目地址：[https://3.jetbra.in](https://3.jetbra.in/)

进入后找到第一个在线的服务，在顶部找到 Download jetbra.zip，下载压缩包后解压到个人目录下，我的解压地址为: `/Users/secret/Tools/jetbra/`，Windows 用户解压到 C: 或者 D: 磁盘根目录即可。

macOS/Linux 用户终端执行安装命令：

```bash
; 进入项目解压目录
$ cd /Users/secret/Tools/jetbra/scripts/
; 自动安装初始化 vmoptions 参数
$ bash ./install.sh
```

Windows 用户通过双击 `scripts\install-current-user.vbs` 为当前用户安装或者 `scripts\install-all-users.vbs` 为所有用户安装。

安装完成后退出你的 JetBrains 账户，重启 idea 然后选择通过激活码激活，激活码在刚刚下载压缩包的站点中找到对应产品，光标移动到密文区域，点击 `Copy to clipboard` 复制到粘贴板，然后粘贴到激活码输入栏中激活即可。

  [1]: /images/3743387333-5d43a91012.png
