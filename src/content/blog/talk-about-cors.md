---
title: "简单谈谈跨域请求（CORS）"
excerpt: "记一次被虐的经历 大概一年前左右，在一次面试的时候面试官问到了我跨域相关知识面。我当时错误并执拗的认为跨域请求是服务器响应的原因，因为在解决过程中增加一些 header 信息便能解决问题并没有深入的去探索过。面试当然挂了，而且感觉很丢脸。o"
publishDate: 2018-09-04T09:02:00.000Z
updatedDate: 2020-12-22T02:01:17.000Z
isFeatured: false
tags: ["成长笔记", "CORS"]
seo: 
  description: "记一次被虐的经历 大概一年前左右，在一次面试的时候面试官问到了我跨域相关知识面。我当时错误并执拗的认为跨域请求是服务器响应的原因，因为在解决过程中增加一些 header 信息便能解决问题并没有深入的去探索过。面试当然挂了，而且感觉很丢脸。o"
  pageType: article
---
## 记一次被虐的经历

大概一年前左右，在一次面试的时候面试官问到了我跨域相关知识面。我当时错误并执拗的认为跨域请求是服务器响应的原因，因为在解决过程中增加一些 *header* 信息便能解决问题并没有深入的去探索过。面试当然挂了，而且感觉很丢脸。o(*////▽////*)q

在后来的开发过程中，遇到过不少跨域请求的问题。解决方式无非依葫芦画瓢，*Ctrl + C* 和 *Ctrl + V* 解决。 

大概这样子：

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
```

我不知道各个参数的含义，但对于结果来说，确实能解决问题。

难得有空，在学习 [Laravel / PHP 扩展包视频教程](https://laravel-china.org/courses/laravel-package) 时，无意发现了一个关于解决跨域的拓展 [barryvdh/laravel-cors](https://github.com/barryvdh/laravel-cors)，[文章 (012. 解决跨域问题（ CORS ）——barryvdh/laravel-cors)](https://laravel-china.org/courses/laravel-package/2026/solving-cross-domain-problems-cors-barryvdhlaravel-cors) 很好的解释了 CORS 及同源策略。

## 同源策略

同源策略一般是指浏览器的基本安全功能。同源的含义为：域名，协议，端口都相同。如果两个地址不同源，那么：

1. *Cookie*、*LocalStorage* 和 *IndexDB* 无法相互读取；
2. *DOM* 无法相互获得；
3. *AJAX* 请求不能相互发送。

其实这里不太准确，因为跨域请求并不能限制发送请求，有可能跨域请求能正常发起，只是结果被浏览器拦截了。最好的例子是 *CSRF 跨站攻击*。参考：[HTTP 访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)

## 跨域资源共享（CORS）

*CORS* 全称 **跨域资源共享（Cross-origin resource sharing）**，是一种解决浏览器跨域问题的方法。*CORS* 请求 **常用** 的为两种，分别为：[简单请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#%E7%AE%80%E5%8D%95%E8%AF%B7%E6%B1%82) 和 [预检请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#%E9%A2%84%E6%A3%80%E8%AF%B7%E6%B1%82)。

### 简单请求

简单请求是指 **不会触发预检请求的被称为简单请求**，不触发的条件如下：

- 使用以下请求方式之一：
  - `GET`
  - `POST`
  - `HEAD`
- 同时请求头中不得设置以下字段之外的参数（CORS 安全的头部字段）：
  - `Accpet`
  - `Accpet-Language`
  - `Content-Language`
  - `Content-Type`（仅限于以下值）
    - `text/plain`
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
  - `DPR`
  - `Downlink`
  - `Save-Data`
  - `Viewport-Width`
  - `Width`
- 请求中的任意 `XMLHttpRequestUpload` 对象均没有注册任何事件监听器；`XMLHttpRequestUpload` 对象可以使用 `XMLHttpRequest.upload` 属性访问。
- 请求中没有使用 `ReadableStream` 对象。

### 预检请求

预检请求是指在发送真实请求之前会向目标地址发送一个 `OPTIONS` 请求，用来从服务器获取获取头部信息。预检请求将携带头部信息 `Access-Control-Request-Method` 和 `Access-Control-Request-Headers`，分别用于告知服务器当前的请求方式和自定义头部信息。

预检请求响应后，服务器将返回 `Access-Control-Allow-Origin` 用于告知浏览器允许请求的域，`*` 代表所有，`Access-Control-Allow-Methods` 用于告知浏览器允许请求的方法，`Access-Control-Allow-Headers` 用于告知浏览器允许携带的头部信息，`Access-Control-Max-Age` 表示预检信息的有效时间，在这段时间之类浏览器无需为同一请求发起多次预检请求。当预检请求通过后，再发送真实请求。

## 题外话

除了使用 CORS 来解决跨域问题，常规操作和曲线救国的操作我也收集了一些。

分为两种情况：**对目标服务器有控制权限** 和 **对目标服务器没有控制权限**。

### 有控制权限

有操作权限就很简单，除开上文所讲的 *CORS* 解决方案外，还有一个解决方案为：*JSONP*，是利用加载外链资源加载目标服务器内容，*JSONP* 不属于 *AJAX* 请求，所以不需要遵循同源策略。

一个简单 *JSONP* 的实现。

```
// getLocation.php
<?php
echo "var __IP ='$_SERVER['REMOTE_ADDR']';";

// home.html
...
<script src="getLocation.php"></script>
<script>
	console.log(__IP);
</script>
...
```

当然，你还可以在服务器端输出回调地址，使前端调用时能拉起回调（*callback*）。

```
// getLocation.php
<?php
$callback = $_GET['callback'];
echo "$callback($_SERVER['REMOTE_ADDR']);";

// home.html
...
<script>
	function say(something) {
        console.log(someting);
	}
</script>
<script src="getLocation.php?callback=say"></script>
...
```

### 没用控制权限

对于没有控制权限的，还想使用目标接口的，我能想到的只有通过服务器做转发。原理为：前端请求转发服务器，由转发服务器采集接口内容，然后通过 *CORS* 返回。绕来绕去又回到了 *CORS*。
