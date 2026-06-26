---
title: "在终端设置代理快捷命令"
excerpt: "Update: 2022 10 25: 更新公网获取地址 2021 01 25: 更新本地多网卡的情况 终端设置代理命令之前文章有写过的，趁今天重装了系统完善一下。 我的 Shell 使用 zsh ，在 /.zshrc 下追加，如果使用 b"
publishDate: 2020-12-21T11:47:00.000Z
updatedDate: 2022-10-25T02:22:05.000Z
isFeatured: false
tags: ["成长笔记", "Proxy", "Shell"]
seo: 
  description: "Update: 2022 10 25: 更新公网获取地址 2021 01 25: 更新本地多网卡的情况 终端设置代理命令之前文章有写过的，趁今天重装了系统完善一下。 我的 Shell 使用 zsh ，在 /.zshrc 下追加，如果使用 b"
  pageType: article
---
Update: 
- 2022-10-25: 更新公网获取地址
- 2021-01-25: 更新本地多网卡的情况

终端设置代理命令之前文章有写过的，趁今天重装了系统完善一下。

我的 Shell 使用 `zsh`，在 `~/.zshrc` 下追加，如果使用 `bash` 需要修改 `~/.bashrc`，可以使用 `echo $SHELL` 查看当前正在使用的 Shell。

命令用到了 `jq` 命令，需要先安装 `brew install jq`，其他平台替换为 `yum` 或者 `apt-get`。

```shell
# 获取内网 IP
getlocalip() {
  local_ip=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{printf("%s / %s; ", $2, $6)}')

  if [ ! "${local_ip}" ]; then
    echo "Your are offline."
  else
    echo "${local_ip}"
  fi
}

# 获取外网 IP
getpublicip() {
  response=$(curl -Lsk 'https://ip.gs/json')
  if [ ! "${response}" ]; then
    echo "You are offline."
  else
    ip=$(echo $response | jq -r '.ip')
    country=$(echo $response | jq -r '.country')
    country_code=$(echo $response | jq -r '.country_code')
    city=$(echo $response | jq -r '.city')
    isp=$(echo $response | jq -r '.isp')
    echo "${ip} at ${city} in ${country}(${country_code}) / ${isp}"
  fi
}

# 获取 内外网 IP
getip() {
  echo "Local IP: $(getlocalip)"
  echo "Public IP: $(getpublicip)"
}

# 定义代理地址
export PROXY_URL=127.0.0.1:7890

# 开启代理
proxyon() {
  export https_proxy=http://${PROXY_URL};
  export http_proxy=http://${PROXY_URL};
  export all_proxy=socks5://${PROXY_URL};
  export no_proxy=localhost,127.0.0.1,*.local,*.vanke.com,*.vankeservice.com
  getip
}

# 关闭代理
proxyoff() {
  unset https_proxy http_proxy all_proxy no_proxy;
  getip
}
```

然后 `source ~/.zshrc`，就可以使用命令了。

```shell
$ getlocalip
10.39.32.* / 10.39.32.255; 10.39.229.* / 10.39.229.255;
$ getpublicip
120.237.94.* at Shenzhen in China(CN) / China Mobile Guangdong
$ getip
Local IP: 10.39.32.* / 10.39.32.255; 10.39.229.* / 10.39.229.255;
Public IP: 58.250.23.228 at Shenzhen in China(CN) / China Unicom Guangdong
$ proxyon
Local IP: 10.39.32.* / 10.39.32.255; 10.39.229.* / 10.39.229.255;
Public IP: 52.175.9.* at Central in Hong Kong(HK) / Microsoft Corporation
$ proxyoff
Local IP: 10.39.32.* / 10.39.32.255; 10.39.229.* / 10.39.229.255;
Public IP: 183.62.230.* at Guangzhou in China(CN) / China Telecom
```
