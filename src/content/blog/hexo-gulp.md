---
title: "Hexo插件之gulp"
excerpt: "折腾完hexo，开始处理一些小细节，之前调试主题的时候就发现NexT并没有对代码进行压缩处理，详情见：如何优化NexT主题？ 为何要压缩代码？ 首先，没有比较就没有伤害： 这是主页压缩前后的对比图，主要将多余空格和换行给去掉，CSS和JS同"
publishDate: 2017-07-11T05:24:00.000Z
updatedDate: 2020-12-22T02:13:16.000Z
isFeatured: false
tags: ["成长笔记", "Javascript", "gulp"]
seo: 
  description: "折腾完hexo，开始处理一些小细节，之前调试主题的时候就发现NexT并没有对代码进行压缩处理，详情见：如何优化NexT主题？ 为何要压缩代码？ 首先，没有比较就没有伤害： 这是主页压缩前后的对比图，主要将多余空格和换行给去掉，CSS和JS同"
  pageType: article
---
折腾完hexo，开始处理一些小细节，之前调试主题的时候就发现NexT并没有对代码进行压缩处理，详情见：[如何优化NexT主题？](http://theme-next.iissnan.com/faqs.html#optimize)

## 为何要压缩代码？
首先，没有比较就没有伤害：

![压缩前后对比图](/images/74E15CF934EF4E0A5A8B96DDFBF08753-e32bfb44d6.png)

这是主页压缩前后的对比图，主要将多余空格和换行给去掉，CSS和JS同理。

压缩的优势？列出以下四点，欢迎补充：

- 减小了文件的体积
- 减小了网络传输量和带宽占用
- 减小了服务器的处理的压力
- 提高了页面的渲染显示的速度

## gulp能做什么？
gulp是一款基于Node.js的一款利用数据流自动化构建工具，利用其插件可以对文件进行IO操作，其中包括压缩代码等功能。

## gulp的安装
>注：安装此插件务必确认安装Node环境及包管理工具（npm或cnpm）

任何一款js插件，首先是参考文档说明。详见：[官方文档](http://www.gulpjs.com.cn/docs/)

首先，需要安装gulp及其配套的插件。

```bash
$ cd blogdir/
$ cnpm install gulp --save
$ cnpm install gulp-htmlclean --save
$ cnpm install gulp-htmlmin --save
$ cnpm install gulp-minify-css --save
$ cnpm install gulp-uglify --save
```
注：``cnpm``为淘宝npm镜像，如果发现``cnpm``提示``command not found``，请[自行安装](http://npm.taobao.org/)或使用``npm``，使用方法与``npm``相同，不过将镜像存储在国内加快包下载速度。

完成后查看``package.json``是否包含上列安装的包：

``` javascript
"dependencies": {
    "gulp": "^3.9.1",
    "gulp-htmlclean": "^2.7.14",
    "gulp-htmlmin": "^3.0.0",
    "gulp-imagemin": "^3.3.0",
    "gulp-minify-css": "^1.2.4",
    "gulp-uglify": "^3.0.0",
    "hexo": "^3.2.0",
    "hexo-deployer-git": "^0.3.0",
    "hexo-generator-archive": "^0.1.4",
    "hexo-generator-category": "^0.1.3",
    "hexo-generator-index": "^0.2.0",
    "hexo-generator-tag": "^0.2.0",
    "hexo-renderer-ejs": "^0.2.0",
    "hexo-renderer-marked": "^0.2.10",
    "hexo-renderer-stylus": "^0.3.1",
    "hexo-server": "^0.2.0"
  }
```
然后新建``gulpfile.js``文件到hexo根目录，内容如下：

``` javascript
var gulp = require('gulp');

//Plugins模块获取
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');

// 压缩 public 目录 css文件
gulp.task('minify-css', function() {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./public'));
});

// 压缩 public 目录 html文件
gulp.task('minify-html', function() {
  return gulp.src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(htmlmin({
         removeComments: true,
         minifyJS: true,
         minifyCSS: true,
         minifyURLs: true,
    }))
    .pipe(gulp.dest('./public'))
});

// 压缩 public/js 目录 js文件
gulp.task('minify-js', function() {
    return gulp.src('./public/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});


// 执行 gulp 命令时执行的任务
gulp.task('default', [
    'minify-html','minify-css','minify-js'
]);
```
至此，安装完成。

## gulp的使用
gulp的使用很简单，只需要在部署之前将代码压缩即可：

```bash
$ hexo clean
$ hexo g
INFO  Start processing
INFO  Files loaded in 723 ms
INFO  Generated: index.html
$ gulp
[13:18:33] Using gulpfile ~/blog/gulpfile.js
[13:18:33] Starting 'minify-html'...
[13:18:33] Starting 'minify-css'...
[13:18:33] Starting 'minify-js'...
$ hexo d
INFO  Deploying: git
INFO  Clearing .deploy_git folder...
INFO  Copying files from public folder...
```
