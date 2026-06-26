---
title: "Hexo 主题 - Hola"
excerpt: "<div style=\"float: left; display: inline block;\" <iframe src=\"https://ghbtns.com/github btn.html?user=isecret&repo=Hola&"
publishDate: 2018-05-29T02:25:00.000Z
updatedDate: 2020-12-22T02:04:23.000Z
isFeatured: false
tags: ["造轮子系列", "Hexo", "Themes"]
seo: 
  description: "<div style=\"float: left; display: inline block;\" <iframe src=\"https://ghbtns.com/github btn.html?user=isecret&repo=Hola&"
  pageType: article
---
<div style="float: left; display: inline-block;"><iframe src="https://ghbtns.com/github-btn.html?user=isecret&repo=Hola&type=star&count=true" frameborder="0" scrolling="0" style="width: 90px; height: 20px"></iframe><iframe src="https://ghbtns.com/github-btn.html?user=isecret&repo=Hola&type=fork&count=true" frameborder="0" scrolling="0" style="width: 90px; height: 20px"></iframe></div><br>

> 一款简约的单页主题，很漂亮吧？

![Hola](/images/982ACAD4940DAEB88EEDDA6810B9D7B0-682403db6a.png)

## 如何使用？

首先，你需要安装 [Hexo](https://hexo.io) 用做博客载体。关于安装步骤请善用搜索引擎。然后我们使用终端工具进入 Hexo 模版目录。

```bash
cd /your_hexo_path/theme/
```

现在，我们需要克隆主题仓库，使用终端工具拉取。

```bash
git clone https://github.com/isecret/Hola
```

稍等片刻，主题将安装在 Hexo 中，安装完成后需要修改 `your_hexo_path/_config.yml`，找到 `theme` 参数，将它修改为：

```yaml
theme: Hola
```

## 自定义

### 站点关键字

修改 `your_hexo_path/theme/Hola/config.yml` 中 `keywords` 参数。

### 建站日期

这个参数用于站点底部展示，修改 `your_hexo_path/theme/Hola/config.yml` 中 `since` 参数。

### 导航栏

头部导航栏列表，修改 `your_hexo_path/theme/Hola/config.yml` 中 `menu` 参数。

### 社交（Todo）

社交地址，修改 `your_hexo_path/theme/Hola/config.yml` 中 `social` 参数。

### 字数统计

在博客站点底部，有一个字数统计，但是你需要安装插件才能启用他。

使用终端工具执行命令：

```bash
npm install hexo-wordcount
```

安装完成后，需要修改 `your_hexo_path/theme/Hola/config.yml`，找到 `footer_wordcount` 参数将它修改为 `enabled`。

### 底部补充

`footer_expand` 参数主要用于代码补充，当然你也可以直接修改主题源码。

### 站点微缩图

用于站点缩略图，ico 格式。修改 `your_hexo_path/theme/Hola/config.yml` 中 `favicon` 参数。

### 站点 Logo（Todo）

站点Logo。修改 `your_hexo_path/theme/Hola/config.yml` 中 `logo` 参数。

### 一言 hitokoto

一言随机一句话副标题。修改 `your_hexo_path/theme/Hola/config.yml` 中 `hitokoto` 为 `enabled` 参数启用。

### Gitment

基于 Github 登录的评论系统。修改 `your_hexo_path/theme/Hola/config.yml` 中 `gitment` 参数启用。

### 腾讯统计

修改 `your_hexo_path/theme/Hola/config.yml` 中 `tencent_analytics` 参数为你的 `sId`。

## 建议

如果你有任何有趣的想法，请留言或 Email 告诉我。

## 感谢

- 基础样式来自于 [NexT](https://github.com/iissnan/hexo-theme-next) 主题
- 标题样式灵感来自于 [暮光博客](https://muguang.me/)
- 预加载少不了 [instantclick.min.js](https://github.com/dieulot/instantclick)
- 感谢 [V2EX](https://www.v2ex.com/t/458438) 的朋友解答了代码库字体在 iOS 设备上的问题
