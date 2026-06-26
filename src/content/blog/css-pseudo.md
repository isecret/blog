---
title: "CSS伪类总结"
excerpt: "个人用伪类在布居中比较频繁，因为觉得能用CSS完成的动画，尽量不用JS，总觉得JS或多或少会影响页面加载速度和流畅度，个人觉得比较经典，其中也有很多平常开发中遇到的一些小问题，也终于有了解释，所以写篇文章总结下。 伪类？ 先来回顾伪类的使用"
publishDate: 2017-07-24T11:21:00.000Z
updatedDate: 2020-12-22T02:17:14.000Z
isFeatured: false
tags: ["成长笔记", "CSS"]
seo: 
  description: "个人用伪类在布居中比较频繁，因为觉得能用CSS完成的动画，尽量不用JS，总觉得JS或多或少会影响页面加载速度和流畅度，个人觉得比较经典，其中也有很多平常开发中遇到的一些小问题，也终于有了解释，所以写篇文章总结下。 伪类？ 先来回顾伪类的使用"
  pageType: article
---
个人用伪类在布居中比较频繁，因为觉得能用CSS完成的动画，尽量不用JS，总觉得JS或多或少会影响页面加载速度和流畅度，个人觉得比较经典，其中也有很多平常开发中遇到的一些小问题，也终于有了解释，所以写篇文章总结下。

## 伪类？
先来回顾伪类的使用方法，类/标签名:伪类类型便可以构造一个伪类：
```css
selector:pseudo-class {
	property: value;
	...
}

.class:pseudo-class {
	property: value;
	...
}
```

常用的伪类：``hover``、``active``、``visited``、``link``、``first-child``、``last-child``、``nth-child(n)``等等。

## 小问题
### 问题1
现在一个页面，需要实现a标签不同伪类下颜色不同，代码如下：
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Pseudo - Secret Blog</title>
	<style type="text/css">
		a:hover {
			color: red;
		}

		a:visited {
			color: blue;
		}

		a:link {
			color: green;
		}

		a:active {
			color: yellow;
		}
	</style>
</head>
<body>
	<a href="#">Click it!</a>
</body>
</html>
```

效果演示：[Pseudo - Secret Blog](https://static.openapi.link/pseudo.html)

有错么？代码看起来没错呀，我``hover``去哪儿呢？之前也遇到过类似的问题，代码没错啊，怎么没效果呢？

W3C中提到（[CSS 伪类](http://www.w3school.com.cn/css/css_pseudo_classes.asp)）：

>提示：在 CSS 定义中，a:hover 必须被置于 a:link 和 a:visited 之后，才是有效的。
>提示：在 CSS 定义中，a:active 必须被置于 a:hover 之后，才是有效的。
>提示：伪类名称对大小写不敏感。

上面提到``hover``必须放到``link``和``visited``之后，而``active``又要放到``hover``之后，所有正确的书写顺序是：``link -> visited -> hover -> active``。

### 问题2
``first-child``和``last-child``非常好用，使用方式各式各样，一般用于修改第一个或者最后一个的样式，下列代码大家来分析下，看看有什么错误：
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Child - Secret Blog</title>
	<style type="text/css">
		ul li:first-child{
			color: red;
		}
		ul li:nth-child(2){
			color: blue;
		}
		ul li:nth-child(3){
			color: yellow;
		}
		ul li:last-child{
			color: green;
		}
	</style>
</head>
<body>
	<ul>
		<p>List</p>
		<li>First</li>
		<li>Second</li>
		<li>Third</li>
		<li>Last</li>
		<p>List End</p>
	</ul>
</body>
</html>
```

效果演示：[child - Secret Blog](https://static.openapi.link/child.html)

和预想的效果有差异？第一个不是红色字体而是是蓝色呢？第二个不是蓝色又是黄色的，还有最后一个的绿色也没了。

W3C解释（[原文地址](http://www.w3school.com.cn/cssref/pr_pseudo_first-child.asp)）：
>利用 :first-child 这个伪类，只有当元素是另一个元素的第一个子元素时才能匹配。例如，p:first-child 会选择作为另外某个元素第一个子元素的所有 p 元素。一般可能认为这会选择作为段落第一个子元素的元素，但事实上并非如此，如果要选择段落的第一个子元素，应当写为 p > *:first-child。

只有当元素是另一个元素的第一个子元素时才能匹配，通俗的讲，就是上面代码里，`div li:frist-child`并不是指向下面``ul``中的第一个``li``，因为``li``并不在``ul``中的一个元素。``last-child``同理。

而``nth-child``的指向，仔细看一下就会发现，如果将``p``标签作为第一个的话，那么颜色就没错。而浏览器也正是这样解析的。

## 总结
CSS 中伪类是一个很奇怪的东西，很多错误发生在细节上却毫无察觉。
