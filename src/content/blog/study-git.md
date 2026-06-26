---
title: "Git笔记"
excerpt: "今天在Windows下安装了次Node.js环境，其中也涉及到了git的安装和初始化，或许是之前学习的时候太皮，很多命令、参数都忘得干干净净。这次不妨做个笔记，以后可能（一定）会用到。 环境 操作系统：Windows 10 Version "
publishDate: 2017-07-12T11:07:00.000Z
updatedDate: 2020-12-22T02:09:52.000Z
isFeatured: false
tags: ["成长笔记", "Git", "Github"]
seo: 
  description: "今天在Windows下安装了次Node.js环境，其中也涉及到了git的安装和初始化，或许是之前学习的时候太皮，很多命令、参数都忘得干干净净。这次不妨做个笔记，以后可能（一定）会用到。 环境 操作系统：Windows 10 Version "
  pageType: article
---
今天在Windows下安装了次Node.js环境，其中也涉及到了git的安装和初始化，或许是之前学习的时候太皮，很多命令、参数都忘得干干净净。这次不妨做个笔记，以后可能（一定）会用到。
## 环境
* 操作系统：Windows 10 Version 10.0.15063
* 安装工具：Bash On Ubantu On Windows（以下简称：WinBash）

>注：因为WinBash还存在很多尚不明确的因素，安装环境受系统版本及网络影响。Ubantu、CentOS等Linux衍生系统安装方法类似。本次安装仅作参考。

>注：若使用WinBash请先开启Windows开发者模式，开启方法请自行搜索。

## 开始
### 安装Git

使用``apt-get``经行安装，命令：

```bash
$ sudo apt-get install git
```

然后输入y，完成安装。

### 检查安装
可以执行``git``命令查看是否安装成功，命令：

```bash
$ git
usage: git [--version] [--help] [-C <path>] [-c name=value]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]
$ git --version
git version 2.7.4
```

### 配置Git
git安装完成，需要初始化用户信息，这通常是全局的，命令如下：

```bash
# 配置用户名
$ git config --global user.name "your_name"
# 配置邮箱地址
$ git config --global user.email "your_email"
```

### 生成&验证SSH公匙
>公匙用于Github或服务器的免密登录的一个口令，一个公匙可多方登录，由于SSH的重要性，请勿泄露公匙。

公匙存在在``~/.ssh``目录下的``id_rsa.pub``，如果不存在先生成，存在则直接查看：

```bash
# 生成公匙
$ ssh-keygen -t rsa -C "mail@mail.com"
# 接下来直接敲三个回车
# 查看公匙
$ cat ~/.ssh/id_rsa.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCwdB8G/vCpmZu3yI7N62GqykMcBhWZ5BI34rnBXM9CNtXASGD3Pg7erkn0kuOSzSm9RkoRtnmbA/D9TNqMxNtXUxHHjEw27yFPffit1b5Zjj651Kp.......... mail@mail.com
```

关于``ssh-keygen``命令参数解释：

* -t：申明密匙类型，参数："rsa1"(SSH-1)、"rsa"(SSH-2)、"dsa"(SSH-2)
* -C：添加注释

### 验证SSH公匙
将SSH公匙添加到[Github](https://github.com)或[Coding](https://coding.net)中的SSH公匙管理中，下一步操作即是验证公匙是否可用，命令：

```bash
# Github与Coding验证地址不同，以下以Github为例
$ git -T git@github.com
```

### 创建远程仓库
代码管理离不开远程仓库，远程仓库能随时同步代码、多人协助、版本回滚等。

远程仓库国内推荐使用[Coding](https://coding.net)或[Github](https://github.com)，当然，类似的平台还有[码云](https://git.oschina.net)。在Github上，直接点击``New repository``建立仓库。

比如，我现在创建一个仓库名为``test``的仓库：

![新建仓库](https://cdn.jsdelivr.net/gh/isecret/img@latest/A7FC83BE7C24464AF01945E75642D234.png)

**配置解释**:

* Repository name： 仓库名，不可于当前用户的其他仓库名重名
* Public / Private： 项目是否公开，这里说明一下的是Github的私有项目是收费的
* Add README： 是否初始化时建立``README.md``说明文件
* Add .gitignore： 是否创建忽略``.gitignore``配置文件
* Add license： 是否添加协议

## Git基础

### 建立仓库
创建完成远程仓库，转向本地，初始化本地Git仓库：

```bash
# 创建目录
$ mkdir your_project/
# 切换到目录
$ cd your_project/
# 初始化仓库，创建.git目录，将此目录作为git工作空间
$ git init
Initialized empty Git repository in /Users/secret/Desktop/test/.git/
```

初始化完成本地仓库，需要将本地仓库和远程仓库进行关联：

首先需要获取远程仓库的地址，可以打开刚刚新建的``test``的仓库：

![获取远程仓库链接](/images/D2F8A7E49C4A9501C9E76DB8B4E4BF38-6f469b017c.png)

在输入框中的内容就是该仓库的远程地址，最右边可以一键复制。

现在将本地仓库与远程仓库进行关联：

```bash
$ git remote add origin git@github.com:isecret/test.git

```

### 存入缓存区并提交
可以先尝试创建一个文件，然将它添加到缓存中：

```bash
# 创建test.txt文件
$ touch test.txt
# 编辑该文件，你同样可以选择其他编辑器
$ vim test.txt
# 保存完成后，将其添加到缓存中
$ git add test.txt
# 提交本次修改
$ git commit -m 'Create and edited test.txt'
[master (root-commit) 40a635b] Create and edited test.txt
 1 file changed, 1 insertion(+)
 create mode 100644 test.txt
```

参数说明：

* ``git add 文件名``是将此文件加入缓存区，也可以使用``git add .``将此目录加入缓存区
* ``git commit``的``-m``参数是给此次提交的动作给一个描述，比如修改了什么地方，修复了什么Bug等
* ``git add .``和``git commit -m '描述'``可以合并写为``git commit -am '描述'``

#### 查看提交记录
文件修改后提交至缓存区后，便会生成一个提交记录的HEAD信息及其描述，在后续使用可以回滚到当前版本。好比于修改代码，越改越乱的情况，就可以直接回到上一个版本重新来写。

```bash
# 查看提交版本，commit后边的内容便是版本号，最后一行是注释信息
$ git log
commit c172fa948ab343276c84ec3bbf11d0c0cd027b3c
Author: isecret <572524331@qq.com>
Date:   Sun Jul 23 12:57:36 2017 +0800

    Create and edited test.txt
```

### 查看修改记录及状态
这个顾名思义，查看当前版本的改动。在Github上能高亮显示出，不过在命令行也能查看到。

首先，我先在``text.txt``中再增加一段``Hello World``，然后查看改动：

```bash
# 增加一段Hello World!
$ vim test.txt
Hello Git!Hello World!
$ git diff
diff --git a/test.txt b/test.txt
index 106287c..d149c10 100644
--- a/test.txt
+++ b/test.txt
@@ -1 +1 @@
-Hello Git!
+Hello Git! Hello World!
# 插入:2，内容 Thanks for us!
$ vim test.txt
# 查看当前状态
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   test.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

参数说明：

* 直接使用``git diff``用于查看当前未``git add``的内容修改
* 已经``git add``但还没提交，使用``git diff --cached``查看内容修改
* ``git diff HEAD``是上面两条的合并
* ``git diff HEAD1 HEAD2 src``可以比较两个版本的``src``文件夹的差异
* ``git status``会列出还没添加到缓存区的文件/目录

## 分支

分支在Git中是一个很重要的概念，意味着你能脱离主线开发，在不影响主线的情况下还能继续工作。

而分支又简单分为基础操作、冲突合并、分支管理、bug分支、远程分支。

#### 查看分支

```bash
# 查看当前所有分支
$ git branch -a
* master
```
