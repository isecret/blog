---
title: "让 OpenWrt 网络自动重连"
excerpt: "Update: 2021 01 28: 换了联通宽带，不需要路由器拨号了，定时任务暂停了。 家里的路由器经常在一觉醒来的时候断网，随即小爱音响及其绑定的智能家具全都停止工作。每天早上八点的时候小爱同学会定时帮我加热热水器，而断网后只能去洗冷"
publishDate: 2020-12-22T01:50:00.000Z
updatedDate: 2021-01-29T06:36:14.000Z
isFeatured: false
tags: ["成长笔记", "OpenWrt", "Shell"]
seo: 
  description: "Update: 2021 01 28: 换了联通宽带，不需要路由器拨号了，定时任务暂停了。 家里的路由器经常在一觉醒来的时候断网，随即小爱音响及其绑定的智能家具全都停止工作。每天早上八点的时候小爱同学会定时帮我加热热水器，而断网后只能去洗冷"
  pageType: article
---
Update:
- 2021-01-28: 换了联通宽带，不需要路由器拨号了，定时任务暂停了。

家里的路由器经常在一觉醒来的时候断网，随即小爱音响及其绑定的智能家具全都停止工作。每天早上八点的时候小爱同学会定时帮我加热热水器，而断网后只能去洗冷水。一次两次拔下路由器能解决，但最近越来越冷，洗冷水也觉得越发刺骨，我也实在没有动力从温暖的被窝里起来拔插路由器。

```shell
$ vim /etc/network-watch-dog
#!/bin/sh

# 锁文件位置
LOCK_FILE_PATH=/tmp/.network-watch-dog.lock
# 每次发包次数
PING_COUNT=3
# 离上次断网最大等待时间
MAX_WAITING_SECONDS=600

# 这里直接固定 ping ali dns
SUCCESS_COUNT=$(ping 223.5.5.5 -c ${PING_COUNT} 2>&1 | grep '64 bytes' | wc -l)

if [ ${SUCCESS_COUNT} == 0 ]; then
  TIMESTAMP=$(date +%s)

  if [ -f ${LOCK_FILE_PATH} ]; then
    LOCK_TIMESTAMP=$(cat ${LOCK_FILE_PATH})
    # 超过最大等待时间 删除锁文件重启
    if [ $(expr ${TIMESTAMP} - ${LOCK_TIMESTAMP}) -ge ${MAX_WAITING_SECONDS} ]; then
      rm -rf ${LOCK_FILE_PATH}
      reboot
    fi
  else
    # 写入断网时间到锁文件
    echo ${TIMESTAMP} > ${LOCK_FILE_PATH}
  fi
  /etc/init.d/network restart
else
  # 成功联网后判断上次断网遗留的锁文件
  if [ -f ${LOCK_FILE_PATH} ]; then
    rm -rf ${LOCK_FILE_PATH}
  fi
fi
```

最后给个执行权限，在定时任务中加入这条脚本，我这里每三分钟执行一次。

```shell
$ chmod a+x /etc/network-watch-dog
$ crontab -e
*/3 * * * * /etc/network-watch-dog > /dev/null 2>&1
```

等两天打算搞个断网消息通知。
