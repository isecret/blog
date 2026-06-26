---
title: "临时解决 macOS 下 Microsoft Edge 105 CPU 占用高"
excerpt: "最近经常发现主机异常烫手，查看资源占用情况发现 Microsoft Edge CPU 占用特别高，起初还以为是某个插件引发了什么 BUG，重启浏览器后正常，这个问题最近愈频繁，且通过分析发现是浏览器本体 CPU 占用高，后来发现在社区已经炸"
publishDate: 2022-09-21T03:32:00.000Z
updatedDate: 2022-09-26T01:08:03.000Z
isFeatured: false
tags: ["成长笔记", "Edge", "macOS"]
seo: 
  description: "最近经常发现主机异常烫手，查看资源占用情况发现 Microsoft Edge CPU 占用特别高，起初还以为是某个插件引发了什么 BUG，重启浏览器后正常，这个问题最近愈频繁，且通过分析发现是浏览器本体 CPU 占用高，后来发现在社区已经炸"
  pageType: article
---
最近经常发现主机异常烫手，查看资源占用情况发现 Microsoft Edge CPU 占用特别高，起初还以为是某个插件引发了什么 BUG，重启浏览器后正常，这个问题最近愈频繁，且通过分析发现是浏览器本体 CPU 占用高，后来发现在社区已经炸开了锅。链接地址：[100% CPU usage since Edge 105 on Mac M1 ?](https://www.reddit.com/r/MicrosoftEdge/comments/x89osx/100_cpu_usage_since_edge_105_on_mac_m1/)

![爆炸的Edge.png][1]

<del>Edge 你老实说是不是背着我在偷偷挖矿 doge</del>

评论回复指出可以禁用 *SmartScreen* 临时解决问题，不过楼层中有不少人表示问题依旧。

你可以尝试在使用终端启动 Microsoft Edge 添加参数来禁用 *SmartScreen*。

```bash
$ open /Applications/Microsoft\ Edge.app --args --enable-features=msSmartScreenLegacyDisabled
```

不过这里没有验证，如果有朋友尝试过这个方式并且解决了问题请回复一下。我使用了另一种办法，直接回退到 104 版本了。

```bash
; commit 为最后一个 104 版本
$ curl -L 'https://raw.githubusercontent.com/Homebrew/homebrew-cask/4f5ea6195c694e7e3c772e03f859d8055d36592f/Casks/microsoft-edge.rb' > microsoft-edge.rb
; 以 104 重新安装
$ brew reinstall microsoft-edge.rb
; 删除 104 自动更新组件
$ rm -rf /Applications/Microsoft Edge.app/Contents/Frameworks/Microsoft Edge Framework.framework/Helpers/EdgeUpdater.app
```

有个很蛋疼的点是 Microsoft Edge 不能关闭自动更新，有新版本后会自动升级。。

问题出现挺长时间了，希望正式版本能早些时间修复吧。


  [1]: /images/3800828495-1b2f74074d.png
