---
title: "tar 命令排除文件或目录以及存在的坑"
excerpt: "最近在编写项目 CICD 时用到 tar 命令打包源代码，打包的同时想忽略一些配置文件和目录，搜索忽略参数为 exclude=dir/file ，然而使用这个命令一路踩坑。 第一个坑是忽略目录时末尾不能追加 / ，否则无效。 第二个坑时 e"
publishDate: 2023-02-23T09:05:00.000Z
updatedDate: 2023-02-23T09:07:49.000Z
isFeatured: false
tags: []
seo: 
  description: "最近在编写项目 CICD 时用到 tar 命令打包源代码，打包的同时想忽略一些配置文件和目录，搜索忽略参数为 exclude=dir/file ，然而使用这个命令一路踩坑。 第一个坑是忽略目录时末尾不能追加 / ，否则无效。 第二个坑时 e"
  pageType: article
---
最近在编写项目 CICD 时用到 tar 命令打包源代码，打包的同时想忽略一些配置文件和目录，搜索忽略参数为 `--exclude=dir/file`，然而使用这个命令一路踩坑。

第一个坑是忽略目录时末尾不能追加 `/`，否则无效。

第二个坑时 `--exclude` 参数要放在最打头位置，比如：`tar --exclude=.git -czvf source.tar.gz .[!.]* *`，如果放在 `-czvf` 之后会出现 *--exclude ‘.git’ has no effect* 并且打包失败。

参考链接：[shell-command-to-tar-directory-excluding-certain-files-folders](https://stackoverflow.com/q/984204)
