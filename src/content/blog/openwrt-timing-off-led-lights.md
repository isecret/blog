---
title: "OpenWrt 定时关闭 LED 灯"
excerpt: "前段时间，上了趟车在闲鱼 ¥90 收了一款 Newwifi3 路由器。到手后立马刷入了 OpenWRT 的衍生系统——PandoraBox，并配置了源以便于开启科学上网。[脸红] 相比斐讯 K2P 配置相同，只是 5G 信号强度比较弱，不过"
publishDate: 2019-09-22T07:02:00.000Z
updatedDate: 2020-12-22T01:58:00.000Z
isFeatured: false
tags: ["成长笔记", "OpenWrt", "Shell"]
seo: 
  description: "前段时间，上了趟车在闲鱼 ¥90 收了一款 Newwifi3 路由器。到手后立马刷入了 OpenWRT 的衍生系统——PandoraBox，并配置了源以便于开启科学上网。[脸红] 相比斐讯 K2P 配置相同，只是 5G 信号强度比较弱，不过"
  pageType: article
---
前段时间，上了趟车在闲鱼 ¥90 收了一款 Newwifi3 路由器。到手后立马刷入了 OpenWRT 的衍生系统——PandoraBox，并配置了源以便于开启科学上网。[脸红]

![Newwifi3](/images/071FA4FB1D8E1D9EDD85CF4C685C431C-JPG-1c00b3b7f0.jpg)

相比斐讯 K2P 配置相同，只是 5G 信号强度比较弱，不过我一个人住小单间，完全没问题。然而到了第一天晚上就发现一个问题：路由器的四侧有一条缝用于散热，但是我躺床上，那条缝就直接对着我，而缝里边有五颗 LED 灯。[尴尬]

![侧边用于散热的缝](/images/AE6CAD72625B64F0C33C33709F612B33-JPG-0944c73ce3.jpg)

你想想，正困的时候，五条灯光直射你的眼睛，你还睡不睡。你说刺眼吧，又不能关，关了我这出租屋里 4G 信号贼差。气不气？[鼓掌]

![闪瞎狗眼](/images/0D72FFECA44190FDB2800556A282CF88-JPG-420207a67f.jpg)

无解，便开始寻找解决方案，能不能关掉着破灯：白天亮起，晚上熄灭。

找到了脚本，LED 由 `/sys/class/leds` 目录下的配置文件控制，写入不同的值来控制 LED 灯的点亮和熄灭，`0` 值为关闭，`3` 为开启，写入立即生效。

新建一个脚本用于控制 LED 熄灭，我将他存放在 `/etc/off_leds.sh`。

```shell
$ vim /etc/off_leds.sh
#!/bin/bash
for i in `ls /sys/class/leds`
do
  cd /sys/class/leds
  cd $i
  echo 0 > brightness
done
```

给它个执行权限，然后执行：

```shell
$ chmod a+x /etc/off_leds.sh
$ /etc/off_leds.sh
```

再将它加入定时任务，LED 灯开启可以通过初始化 LED 的脚本实现：

```sh
$ crontab -e
# 关闭 LED 灯
0 22 * * * /etc/off_leds.sh
# 开启 LED 灯
0 7 * * * /etc/init.d/led start
```

到点熄灭了，完美。。。个屁，然而后半夜，它自己又亮了！！！[内伤]

不知道为啥会自我唤醒 LED 灯，猜想是断网自动连接或者其他原因，但是我不管，我只想要睡觉！[哭泣]

修改定时任务：

```sh
$ crontab -e
# 关闭 LED 灯
* 22-6 * * * /etc/off_leds.sh
# 开启 LED 灯
0 7 * * * /etc/init.d/led start
```

破灯，我还治不了你了。

另外，定时任务有时候写入后会不执行，猜想是 crontab 进程挂掉了，只需要重启下路由器或者直接粗暴的拔插电源就行。
