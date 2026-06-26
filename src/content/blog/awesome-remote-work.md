---
title: "自建远程办公环境之内网穿透"
excerpt: "前言 最近疫情起伏，不时就会有居家办公的场景。远程工具常见有 TeamViewer 和向日葵，前者被国内某公司代理后加强了商业使用的判定，使用五分钟后直接断开链接，体验拉胯；后者网络带宽质量差，会员居然比免费用户权益还少，限制更多，反向升级"
publishDate: 2022-09-15T09:27:00.000Z
updatedDate: 2023-11-20T07:25:27.000Z
isFeatured: false
tags: ["成长笔记", "frp"]
seo: 
  description: "前言 最近疫情起伏，不时就会有居家办公的场景。远程工具常见有 TeamViewer 和向日葵，前者被国内某公司代理后加强了商业使用的判定，使用五分钟后直接断开链接，体验拉胯；后者网络带宽质量差，会员居然比免费用户权益还少，限制更多，反向升级"
  pageType: article
---
## 前言
最近疫情起伏，不时就会有居家办公的场景。远程工具常见有 TeamViewer 和向日葵，前者被国内某公司代理后加强了商业使用的判定，使用五分钟后直接断开链接，体验拉胯；后者网络带宽质量差，会员居然比免费用户权益还少，限制更多，反向升级我倒是头一次见。

实验过程中查阅了不少文章，便倒腾出一套还算流畅的自建远程办公环境，这里做一些整理。

## 准备工作
- 一台国内服务器，配置不限，但带宽最好 ≥ 3Mbps
- 域名 可选
- 一台电脑，Windows/macOS 均可

## 选购建议

### 服务器
以国内服务器大厂阿里云和腾讯云为例，性价比来说更加推荐腾讯云，价格相对便宜，而且新用户能以很低的价格购买一台配置不错的服务器，具体的购买步骤自行搜索琢磨，基本和淘宝购物没什么区别。这里重点讲一下服务器的区域选择，你应该优先选择离你城市最近的区域，如果你在深圳，那么服务器可以优先选择深圳或者广州区域，机房离你越近，流量所经过的链路就越少，所带来的是更的延迟和更好的使用体验。另外是操作系统，建议使用 Ubuntu 20.04 LTS，本文也以这台服务器环境进行实验。最后是防火墙，这两家服务器厂商都预设了防火墙且默认仅开启 80/443 等常用端口，你需要预先放行 `7000-7999` 的 TCP 和 UDP 端口。

### 域名
域名作为可选项，但是带来的实际体验会好很多。因为我们无论在服务端还是客户端均需填写服务器地址，一个易读的域名比 `xxx.xxx.xxx.xxx` 的 IP 地址可是容易记太多了。并且后续更换服务器后只需修改域名的解析即可，不需要在各个客户端中修改配置。另外你需要为域名添加两条 A 记录解析到你的服务器，分别为 `frp` 和 `*.frp`。文章中以 `frp.wangmao.me` 作为演示，你需要替换为你自己域名。

### 其他
最近发现了几家免费 frps 服务器，但是基于安全角度我并不是很推荐，有能力还是推荐自建，如果对安全性要求不高的实验可以使用。

1. [免费FRP - frp.104300.xyz](https://frp.104300.xyz/) - 来源：B 站 Up 主用爱发电
2. [SakuraFrp - www.natfrp.com](https://www.natfrp.com/) - 来源：V2EX 网友自建，网站已备案，国内隧道需实名
3. [Free FRP 免费 FRP 内网穿透 - freefrp.net](https://freefrp.net) - 来源：V2EX 网友自建

## 配置 frps 服务端
默认你已经购买好了服务器，且已经使用 SSH 连接。这里内网穿透工具使用 frp([https://github.com/fatedier/frp](https://github.com/fatedier/frp))，分为服务端(frps)和客户端(frpc)，当前版本为 `0.44.0`，本文安装以此版本为例，你也可以到 [Release](https://github.com/fatedier/frp/releases) 页面找到最新版本后缀为 `*_linux_amd64.tar.gz` 的下载地址并替换。现在开始安装服务端，安装前请确保你切换了 `root` 用户，以避免权限不足的问题。

```shell
; 切换 root 管理员
$ sudo su -
; 下载 frp 程序
# wget https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_linux_amd64.tar.gz
; 解压
# mkdir /opt/frp && tar -zxvf frp_0.44.0_linux_amd64.tar.gz -C /opt/frp
; 进入 frp 目录
# cd /opt/frp && ls
; frps 是服务端的程序, frps.ini 是其配置, frps_full.ini 是配置模版
frpc  frpc_full.ini  frpc.ini  frps  frps_full.ini  frps.ini  frps.log  LICENSE
; 修改配置
# vim frps.ini
```

打开文件后，按 `i` 进入编辑模式，并修改为以下配置：

```ini
[common]
subdomain_host = frp.wangmao.me
bind_port = 7000
token = 1234567890
```

接着按 `Esc` 退出编辑模式，再按 `:x` 保存并关闭文件。

然后启动 frps 服务端程序。

```
; 启动 frps 服务端并后台运行
# nohup ./frps -c frps.ini > frps.log 2>&1 &
; 查看启动日志
# cat frps.log 
2022/09/14 16:56:10 [I] [root.go:209] frps uses config file: frps.ini
2022/09/14 16:56:10 [I] [service.go:194] frps tcp listen on 0.0.0.0:7000
2022/09/14 16:56:10 [I] [root.go:218] frps started successfully
```

## 添加 frps 服务并开机自启
如果你需要在服务器重启后自动 frps，那么需要将其添加为自定义服务并设置开机自启。

开始前需关闭手动执行 frps 的进程避免后续实验出现意外。

```shell
; 结束上面手动启动的 frps 进程
# kill -9 $(pidof frps)
```

现在开始配置 frps 服务。

```shell
; 进入服务配置目录
# cd /usr/lib/systemd/system
; 创建 frps 服务配置
# touch frps.service
; 编辑 frps 服务配置
# vim frps.service
```

打开文件后，按 `i` 进入编辑模式，并修改为以下配置：

```ini
[Unit]
Description=frp-server
After=network.target remote-fs.target nss-lookup.target
 
[Service]
Type=simple
PIDFile=/tmp/frps.pid
ExecStart=/opt/frp/frps -c /opt/frp/frps.ini
ExecStop=/bin/kill -9 QUIT $MAINPID
ExecReload=/bin/kill -s QUIT $MAINPID
PrivateTmp=true
 
[Install]
WantedBy=multi-user.target
```
接着按 `Esc` 退出编辑模式，再按 `:x` 保存并关闭文件。

```shell
; 刷新服务文件
# systemctl daemon-reload
; 以服务方式启动 frps
# systemctl start frps
; 查看 frps 启动状态 按 q 关闭
# systemctl status frps
frps.service - frp-server
     Loaded: loaded (/lib/systemd/system/frps.service; disabled; vendor preset: enabled)
     Active: active (running) since Thu 2022-09-15 14:01:39 CST; 1s ago
   Main PID: 187632 (frps)
      Tasks: 5 (limit: 2264)
     Memory: 10.9M
     CGroup: /system.slice/frps.service
             └─187632 /opt/frp/frps -c /opt/frp/frps.ini

Sep 15 14:01:39 VM-4-4-ubuntu frps[187632]: 2022/09/15 14:01:39 [I] [service.go:194] frps tcp listen on 0.0.0.0:7000
Sep 15 14:01:39 VM-4-4-ubuntu frps[187632]: 2022/09/15 14:01:39 [I] [root.go:218] frps started successfully
; 加入开机自启
# systemctl enable frps
Created symlink /etc/systemd/system/multi-user.target.wants/frps.service → /lib/systemd/system/frps.service.
```

最后是一些常用的命令，可能会用到。

```shell
; 启动 frps
# systemctl start frps
; 停止 frps
# systemctl stop frps
; 重启 frps
# systemctl restart frps
; 加入开机自启
# systemctl enable frps
; 禁用开机自启
# systemctl disable frps
```

## 配置 frpc 客户端
### Windows
#### 安装 frpc 客户端
首先下载 frpc Windows 客户端程序，下载地址如下：[frp_0.44.0_windows_amd64.zip](https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_windows_amd64.zip)，或者到 [Release](https://github.com/fatedier/frp/releases) 页面找到最新版本后缀为 `*_windows_amd64.zip` 的下载最新版本。

下载后得到一个名为 `frp_0.44.0_windows_amd64.zip` 压缩包，解压后得到 `frp_0.44.0_windows_amd64`，更改文件夹名称为 `frp`，并复制到 `C:\` 磁盘根部，确保你的 `frpc.exe` 程序的完整路径为 `C:\frp\frpc.exe` 即可。

此步骤可能遇到权限问题，因为公司电脑可能运行的用户可能并没有管理员权限，你可以联系 IT 工程师获得管理员密码。另外，如果电脑有运行 360 等杀毒软件，请将 `C:\frp\frpc.exe` 加入白名单，并且 360 团队版需在设置中关闭「黑客入侵防护」中「自动阻止高风险的远程登录行为」，确保前面的勾要取消掉。

#### 配置 frpc 客户端
使用文本文件编辑器打开 `C:\frp\frpc.ini` 配置文件，保存如下配置。

```ini
[common]
server_addr = frp.wangmao.me
server_port = 7000
token = 1234567890
tls_enable = true

# 远程桌面 3389 端口
[rdp]
type = tcp
local_ip = 127.0.0.1
local_port = 3389
remote_port = 7001
use_encryption = true
use_compression = true
```

然后右键 Windows 图标，选择 `Windows PowerShell(管理员)`，输入命令来启动客户端。

```powershell
PS cd C:\frp
PS ./frpc -c frpc.ini
```

启动后，请保持窗口运行，你可以最小化窗口运行，但不要关闭。

#### 配置远程桌面连接
在此之前，需为你的登录用户设置一个强密码，因为一旦开启内网穿透你的电脑将暴露在公网中，设置弱密码的风险很高，因此造成数据被盗窃勒索自行承担。

修改用户密码在 `开始>设置>账户>登录选项` 中，选择 `Windows Hello PIN` 设置你的密码。

Windows 中远程桌面连接默认为关闭状态，需选择 `开始>设置>系统>远程桌面`，然后打开 `启用远程桌面`。如果电脑并非管理员用户需要额外添加允许该用户远程访问，滑动到底部找到 `选择可远程访问这台电脑的用户`，查找添加该用户即可。

至此你可以在另一台电脑上远程操作这台 Windows，换到另一台电脑中，Windows 在开始中搜索 `remote` 关键词，找到 `远程桌面连接` 应用。计算机：`frp.wangmao.me:7001`，并展开 `更多选项` 在用户名中填入你的用户名，然后点击连接，连接后需输入设置的密码即可登录，你也可以勾选「记住我的凭证」以便于下次免密登录。

macOS 需额外下载远程桌面的应用，你可以使用 `brew install microsoft-remote-desktop` 安装，或下载 [Microsoft_Remote_Desktop_10.7.9_installer.pkg](https://officecdn-microsoft-com.akamaized.net/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/Microsoft_Remote_Desktop_10.7.9_installer.pkg) 并安装，安装完成后点击上面 「+」选择 `Add PC`，在 `PC name` 中填入 `frp.wangmao.me:7001`，`User account` 中选择 `Add User account`，然后添加你的用户信息并选择即可连接。

#### 配置 TeamViewer 远程连接
这个思路是无意间看到发现挺有趣，大概思路是通过局域网 LAN 连接绕过 TeamViewer 的商业授权提醒。

首先，你需要额外放行服务器防火墙端口 `5938`，因为此接口为 TeamViewer 连接的固定端口且不可更改。

此外，在被控端设置 `常规>网络设置>呼入的LAN连接` 修改为 `接受`。最后在控制端的 `伙伴ID` 中输入服务器 IP，密码为被控端的密码，你也可以在被控端 `安全性>个人密码(用于无人值守访问)` 中额外设置。（这里不确定能不能输入域名连接，有尝试过的小伙伴告诉我一下结论，感谢）

你可以点击这篇文章 [frp+TeamViewer 完美解决TeamViewer5分钟商业提醒](https://www.emengweb.com/p/frp-TeamViewer-%E5%AE%8C%E7%BE%8E%E8%A7%A3%E5%86%B3TeamViewer5%E5%88%86%E9%92%9F%E5%95%86%E4%B8%9A%E6%8F%90%E9%86%92) 查看具体操作。

#### 配置 MySQL 和 Redis 远程连接
同样开始前，你需要为 MySQL 和 Redis 设置一个强密码，因为弱口令被脱裤或者删库的情况屡见不鲜。

编辑 `C:\frp\frpc.ini` 追加配置。

```ini
# MySQL 3306 端口
[mysql]
type = tcp
local_ip = 127.0.0.1
local_port = 3306
remote_port = 7002

# Redis 6379 端口
[redis]
type = tcp
local_ip = 127.0.0.1
local_port = 6379
remote_port = 7003
```

关闭 Power Shell 窗口重新运行以完成重启 frpc 客户端，关闭后右键 Windows 图标，选择 `Windows PowerShell(管理员)`，输入命令来启动客户端。

```powershell
PS cd C:\frp
PS ./frpc -c frpc.ini
```

#### 添加 frpc 为服务项
你可以将 frpc 添加为服务项以便于开机自启和后台运行，这里需要使用到 winsw 工具，下载地址如下：[WinSW-x64-v3.0.0-alpha.exe](https://github.com/winsw/winsw/releases/download/v3.0.0-alpha.10/WinSW-x64.exe)，或到 Release 页面下载最新版本。

下载后得到 `WinSW-x64.exe`，将其重命名为 `winsw.exe` 并复制到 `C:\frp` 文件夹下。

新建一个文本文件 `winsw.xml`，保存如下配置。

```xml
<service>
  <id>frpc</id>
  <name>frpc</name>
  <description>Frp Client</description>
  
  <executable>C:\frp\frpc.exe</executable>
  <arguments>-c "C:\frp\frpc.ini"</arguments>
</service>
```

然后右键 Windows 图标，选择 `Windows PowerShell(管理员)`，输入命令来启动安装服务项。

```powershell
PS cd C:\frp
# 安装服务
PS winsw.exe install
# 启动服务
PS winsw.exe start
```

另外，你还可以使用其他的命令来控制服务项。

```powershell
# 安装服务
PS winsw.exe install
# 卸载服务
PS winsw.exe uninstall
# 启动服务
PS winsw.exe start
# 停止服务
PS winsw.exe stop
# 重启服务
PS winsw.exe restart
# 查看服务状态
PS winsw.exe status
```

### macOS
首先下载 frpc macOS 客户端，你可以通过 `brew install frpc` 下载，或者 [frp_0.44.0_darwin_amd64.tar.gz](https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_darwin_amd64.tar.gz)，亦或者到 [Release](https://github.com/fatedier/frp/releases) 页面下载最新版本且后缀名为 `*_darwin_amd64.tar.gz`。如果你是 ARM 架构的芯片，需下载 `*_darwin_arm64.tar.gz`。

#### 配置并启动 frpc

编辑 `/usr/local/etc/frp/frpc.ini` 配置文件保存以下配置。

```ini
[common]
server_addr = frp.wangmao.me
server_port = 7000
token = 1234567890
tls_enable = true

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 7004
use_encryption = true
use_compression = true

[vnc]
type = tcp
local_ip = 127.0.0.1
local_port = 5900
remote_port = 7005
use_encryption = true
use_compression = true
```

配置完成后，便可以尝试启动客户端。

```bash
; 启动并开机自启
$ brew services start frpc
```

#### SSH 远程登录
如果你需要 SSH 远程登录，需要 `系统便好设置>共享>远程登录` 中启用，并确保你的账号允许访问。

然后在其他设备上使用 SSH 连接。

```bash
; 连接地址为 frp.wangmao.me 端口为 7004 同上面 SSH remote_port 配置相同
$ ssh frp.wangmao.me -p 7004
```

#### VNC 远程登录
如果你需要远程控制 macOS，需要 `系统便好设置>共享>屏幕共享` 中启用，并确保你的账号允许访问。

然后在其他设备上使用 VNC 客户端连接，macOS 自带了 VNC 客户端，按下 `CMD+空格` 唤出搜索，输入 `vnc://frp.wangmao.me:7005` 后回车便可打开 VNC 客户端。

Windows 下可以下载 [RealVNC Viewer](https://www.realvnc.com/en/connect/download/viewer/)，安装完成后在顶部输入框中填写 `frp.wangmao:7005` 后回车便可进行连接。

需要注意的是通过 VNC 连接会唤醒你的屏幕，所有请在下班前关闭显示器，否则可能会发生一群人围观你显示器的情况。反倒是 Windows 远程登录会锁定屏幕，这点好评。当然你也可以尝试使用 TeamViewer，可以禁用远程屏幕和远程输入。

### OpenWrt
待补充

## 参考
- [Linux添加自定义服务（service文件）](https://blog.csdn.net/yanhanhui1/article/details/117196904)
- [公网Linux环境搭建frp实现内网穿透](https://blog.csdn.net/pariese/article/details/118386759)
- [Windows/Linux 创建开机启动服务](https://www.jianshu.com/p/a5c02083c4b4)
- [frp+TeamViewer 完美解决TeamViewer5分钟商业提醒](https://www.emengweb.com/p/frp-TeamViewer-%E5%AE%8C%E7%BE%8E%E8%A7%A3%E5%86%B3TeamViewer5%E5%88%86%E9%92%9F%E5%95%86%E4%B8%9A%E6%8F%90%E9%86%92)
