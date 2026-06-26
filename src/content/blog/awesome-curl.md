---
title: "使用 cURL 代替 Postman"
excerpt: "首先先纠正一下标题，这里所指的「代替」并不是真正意义上的摒弃 Postman，而是在更多场景中也能接替 Postman 完成接口调用和调试，比如在生产环境中请求第三方服务接口，亦或者在路由器系统 OpenWrt 中下载资源。 事实上 Pos"
publishDate: 2019-06-23T02:52:00.000Z
updatedDate: 2022-07-05T05:53:40.000Z
isFeatured: false
tags: ["成长笔记", "Shell", "cURL"]
seo: 
  description: "首先先纠正一下标题，这里所指的「代替」并不是真正意义上的摒弃 Postman，而是在更多场景中也能接替 Postman 完成接口调用和调试，比如在生产环境中请求第三方服务接口，亦或者在路由器系统 OpenWrt 中下载资源。 事实上 Pos"
  pageType: article
---
首先先纠正一下标题，这里所指的「代替」并不是真正意义上的摒弃 Postman，而是在更多场景中也能接替 Postman 完成接口调用和调试，比如在生产环境中请求第三方服务接口，亦或者在路由器系统 OpenWrt 中下载资源。

事实上 Postman 能做的事儿 cURL 都能实现，在 Postman 面板右侧栏中你甚至能快捷复制 cURL 命令，这里做一些笔记后续可查。

## 参数列表
这里的参数并不完整，后续随着 cURL 的更新参数会越来越丰富，我会尽量补充。

```
-a/--append    上传文件时，附加到目标文件
-A/--user-agent <string>    设置用户代理发送给服务器
-anyauth    可以使用“任何”身份验证方法
-b/--cookie <name=string/file>    cookie字符串或文件读取位置
    --basic    使用HTTP基本验证
-B/--use-ascii    使用ASCII /文本传输
-c/--cookie-jar <file>    操作结束后把cookie写入到这个文件中
-C/--continue-at <offset>    断点续转
-d/--data <data>    HTTP POST方式传送数据
    --data-ascii <data>    以ascii的方式post数据
    --data-binary <data>    以二进制的方式post数据
    --data-urlencode <name=data/name@filename> HTTP POST 数据 url 编码
    --negotiate    使用HTTP身份验证
    --digest    使用数字身份验证
    --disable-eprt    禁止使用EPRT或LPRT
    --disable-epsv    禁止使用EPSV
-D/--dump-header <file>    把header信息写入到该文件中
    --egd-file <file>    为随机数据(SSL)设置EGD socket路径
    --tcp-nodelay    使用TCP_NODELAY选项
-e/--referer    来源网址
-E/--cert <cert[:passwd]>    客户端证书文件和密码 (SSL)
    --cert-type <type>    证书文件类型 (DER/PEM/ENG) (SSL)
    --key <key>    私钥文件名 (SSL)
    --key-type <type>    私钥文件类型 (DER/PEM/ENG) (SSL)
    --pass <pass>    私钥密码 (SSL)
    --engine <eng>    加密引擎使用 (SSL). "--engine list" for list
    --cacert <file>    CA证书 (SSL)
    --capath <directory>    CA目录 (made using c_rehash) to verify peer against (SSL)
    --ciphers <list>    SSL密码
    --compressed    要求返回是压缩的形势 (using deflate or gzip)
    --connect-timeout <seconds>    设置最大请求时间
    --create-dirs    建立本地目录的目录层次结构
    --crlf    上传是把LF转变成CRLF
-f/--fail    连接失败时不显示http错误
    --ftp-create-dirs    如果远程目录不存在，创建远程目录
    --ftp-method [multicwd/nocwd/singlecwd]    控制CWD的使用
    --ftp-pasv    使用 PASV/EPSV 代替端口
    --ftp-skip-pasv-ip    使用PASV的时候,忽略该IP地址
    --ftp-ssl    尝试用 SSL/TLS 来进行ftp数据传输
    --ftp-ssl-reqd    要求用 SSL/TLS 来进行ftp数据传输
-F/--form <name=content>    模拟http表单提交数据
    --form-string <name=string>    模拟http表单提交数据
-g/--globoff    禁用网址序列和范围使用{}和[]
-G/--get    以get的方式来发送数据
-H/--header <line>    自定义头信息传递给服务器
    --ignore-content-length    忽略的HTTP头信息的长度
-i/--include    输出时包括protocol头信息
-I/--head    只显示请求头信息
-j/--junk-session-cookies    读取文件进忽略session cookie
    --interface <interface>    使用指定网络接口/地址
    --krb4 <level>    使用指定安全级别的krb4
-k/--insecure    允许不使用证书到SSL站点
-K/--config    指定的配置文件读取
-l/--list-only    列出ftp目录下的文件名称
    --limit-rate <rate>    设置传输速度
    --local-port<NUM>    强制使用本地端口号
-L/--location    跟随重定向
    --location-trusted  Like '--location', and send auth to other hosts (H)
    --login-options OPTIONS  Server login options (IMAP, POP3, SMTP)
-m/--max-time <seconds>    设置最大传输时间
    --max-redirs <num>    设置最大读取的目录数
    --max-filesize <bytes>    设置最大下载的文件总量
-M/--manual    显示全手动
-n/--netrc    从netrc文件中读取用户名和密码
    --netrc-optional    使用 .netrc 或者 URL来覆盖-n
    --ntlm    使用 HTTP NTLM 身份验证
-N/--no-buffer    禁用缓冲输出
-o/--output    把输出写到该文件中
-O/--remote-name    把输出写到该文件中，保留远程文件的文件名
-p/--proxytunnel    使用HTTP代理
    --proxy-anyauth    选择任一代理身份验证方法
    --proxy-basic    在代理上使用基本身份验证
    --proxy-digest    在代理上使用数字身份验证
    --proxy-ntlm    在代理上使用ntlm身份验证
-P/--ftp-port <address>    使用端口地址，而不是使用PASV
-q    作为第一个参数，关闭 .curlrc
-Q/--quote <cmd>    文件传输前，发送命令到服务器
-r/--range <range>    检索来自HTTP/1.1或FTP服务器字节范围
--range-file    读取（SSL）的随机文件
-R/--remote-time    在本地生成文件时，保留远程文件时间
    --retry <num>    传输出现问题时，重试的次数
    --retry-delay <seconds>    传输出现问题时，设置重试间隔时间
    --retry-max-time <seconds>    传输出现问题时，设置最大重试时间
-s/--silent    静默模式。不输出任何东西
-S/--show-error    显示错误
    --socks4 <host[:port]>    用socks4代理给定主机和端口
    --socks5 <host[:port]>    用socks5代理给定主机和端口
    --stderr <file>    
-t/--telnet-option <OPT=val>    Telnet选项设置
    --trace <file>    对指定文件进行debug
    --trace-ascii <file>    Like --跟踪但没有hex输出
    --trace-time    跟踪/详细输出时，添加时间戳
-T/--upload-file <file>    上传文件
    --url <URL>    Spet URL to work with
-u/--user <user[:password]>    设置服务器的用户和密码
-U/--proxy-user <user[:password]>    设置代理用户名和密码
-w/--write-out [format]    什么输出完成后
-x/--proxy <host[:port]>    在给定的端口上使用HTTP代理
-X/--request <command>    指定什么命令
-y/--speed-time    放弃限速所要的时间，默认为30
-Y/--speed-limit    停止传输速度的限制，速度时间
```

## 示例
```
# 模拟 POST FORM 提交
$ curl http://localhost -d "a=1&b=2&c=3" 
# 携带 cookie 请求
$ curl http://localhost -b "cookie_field=value"
# 模拟 POST 上传文件
$ curl http://localhost -F "a=1" -F "file=@/path/to/file"
# 模拟 POST JSON 提交 需要设置 header 头
$ curl http://localhost -H "Content-Type:application/json" -d '{"a":1,"b":"secret"}'
# 申明请求 method
$ curl http://localhost -X GET/POST/PUT/DELETE/...
# 跟随重定向
$ curl http://localhost -L
# 显示 response header
$ curl http://localhost -i
# 显示调试信息
$ curl http://localhost -v
# GET 请求 url 编码参数
$ curl http://localhost -G --data-urlencode "port=4546" --data-urlencode "back_url=https://localhost/callback"
```

另外我终端中安装了 JSON 解析工具，可以通过管道符解析 JSON，macOS 通过 brew 安装：`brew install jq`。用法：`curl http://localhost | jq`，前提是响应的数据是一个正确的 JSON 格式，否则会报 `parse error` 的错误。

能用命令解决的绝不用 GUI，这是一种偏执，也是一种信仰。
