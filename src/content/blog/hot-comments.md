---
title: "乐评·一言 API - 随机获取网易云热评"
excerpt: "主页：https://comments.hk/ 文档：https://github.com/isecret/yuncun/blob/master/DOC.md PS：首页定时 10s 自动更新 关于乐评 人这辈子，最害怕突然把某一首歌听懂了"
publishDate: 2019-04-22T03:08:00.000Z
updatedDate: 2020-12-22T02:00:36.000Z
isFeatured: false
tags: ["造轮子系列", "PHP", "网易云音乐"]
seo: 
  description: "主页：https://comments.hk/ 文档：https://github.com/isecret/yuncun/blob/master/DOC.md PS：首页定时 10s 自动更新 关于乐评 人这辈子，最害怕突然把某一首歌听懂了"
  pageType: article
---
![主页](/images/8C45A5C112406A48F8AF9C58485DE4EE-8e38d2956d.png)

主页：[https://comments.hk/](https://comments.hk/)

文档：[https://github.com/isecret/yuncun/blob/master/DOC.md](https://github.com/isecret/yuncun/blob/master/DOC.md)

PS：首页定时 10s 自动更新

## 关于乐评

>人这辈子，最害怕突然把某一首歌听懂了。  ——来自 北风神75 在「有多少爱可以重来」的评论

项目灵感来源于网易云音乐的与农夫山泉合作的乐瓶营销「乐瓶」——这 30 条乐评，是从网易云音乐后台点赞数最高的 8000 条乐评中，经过人工筛选产生的，它们文字简练，富有故事性，即使脱离歌曲本身也可以被理解。

在使用网易云音乐的时候，常常在评论区看到与之共鸣的评论。有时候很想将其记录下来，同朋友分享。时间久了，那种感动依然不可褪去。

你能在这倾听别人的故事，亦或许是你的故事。

## 我们能提供什么

截止目前，已拉取热歌排行榜 TOP199 的热门评论，共计 2984 条热门评论。

项目后台定期拉取热门歌曲排行榜列表并获取其中的热门评论，通过接口随机分发一条热门评论，你可以查看 [API 文档](https://github.com/isecret/yuncun/blob/master/DOC.md) 快速接入。

当然，你也可以通过提交歌曲或歌单 ID 来完善这个项目，将你的感动带给更多的人。

## API 文档

### JSON 格式

请求地址：`https://api.comments.hk/`

请求方式：`GET`

请求参数： 暂无

返回类型：JSON

返回参数：

|    参数名    | 含义 |
| ---------- | --- |
| song_id | 歌曲 ID |
| title | 歌曲名称 |
| images | 歌曲封面图片，已处理为 https 链接 |
| author | 歌曲作者 |
| album | 歌曲所属专辑 |
| description | 歌曲描述 |
| pub_date | 歌曲发行时间 |
| comment_id | 评论 ID |
| comment_user_id | 评论所属用户 ID |
| comment_nickname | 评论所属用户名称 |
| comment_avatar_url | 评论所属用户头像链接，已处理为 https 链接 |
| comment_content | 评论正文 |
| comment_pub_date | 评论发表日期 |

### 示例
```js
<script>
  var xhr = new XMLHttpRequest();
  xhr.open('get', 'https://api.comments.hk/');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var data = JSON.parse(xhr.responseText);
      var hotComments = document.getElementById('hotComments');
      hotComments.innerText = data.comment_content;
    }
  }
  xhr.send();
</script>
```

## 更新日志
- 2019/4/21 更新 JSON 文档第一版

## 感谢

- [今日诗词](https://www.jinrishici.com/)

## 数据来源

项目歌曲数据、图像和评论数据来源于网易云音乐，网易云音乐对其拥有内容、商标所有权。
