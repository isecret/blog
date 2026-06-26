---
title: "OpenCV 模糊处理图片中包含的二维码"
excerpt: "之前在某电商 App 上浏览商品评论区时，发现一些晒单照片中包含的二维码被马赛克处理了，从马赛克的处理痕迹来看不像是用户手动处理的，更像是机器识别+处理的，对此我更好奇其实现原理了。 借助 ChatGPT，了解到主流的处理方式是通过 Ope"
publishDate: 2024-08-01T03:16:00.000Z
updatedDate: 2024-08-01T07:12:47.000Z
isFeatured: false
tags: ["成长笔记"]
seo: 
  description: "之前在某电商 App 上浏览商品评论区时，发现一些晒单照片中包含的二维码被马赛克处理了，从马赛克的处理痕迹来看不像是用户手动处理的，更像是机器识别+处理的，对此我更好奇其实现原理了。 借助 ChatGPT，了解到主流的处理方式是通过 Ope"
  pageType: article
---
之前在某电商 App 上浏览商品评论区时，发现一些晒单照片中包含的二维码被马赛克处理了，从马赛克的处理痕迹来看不像是用户手动处理的，更像是机器识别+处理的，对此我更好奇其实现原理了。

借助 ChatGPT，了解到主流的处理方式是通过 OpenCV 识别二维码的位置，并创建一个模糊图层对其覆盖。

那么 OpenCV 又是什么？引用 ChatGPT 的解释为：


>OpenCV（Open Source Computer Vision Library）是一个开源的计算机视觉和机器学习软件库。由Intel公司在1999年创立，现在由一个活跃的社区维护，并得到了包括企业和个人在内的多方贡献。

>OpenCV可以用于各种视觉处理任务，例如：
>- 图像和视频的基本操作，如读取、显示、转换颜色空间等。
>- 特征检测和描述，如角点、边缘、斑点等。
>- 目标检测和识别，包括人脸检测、行人检测等。

比如常见的二维码扫码支付等，就是用到了 OpenCV。

使用 ChatGPT 生成代码如下：
```python
# blur-qr-code.py
import cv2
from pyzbar.pyzbar import decode
import numpy as np

# 读取图片
image = cv2.imread('qrcode_image.jpg')

# 转换为灰度图
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# 寻找并解码二维码
decoded_objects = decode(gray)
for obj in decoded_objects:
    # 获取二维码的位置
    x, y, w, h = obj.rect
    barcode = obj.data.decode('utf-8')
    print("Found QR Code: ", barcode)

    # 对二维码区域进行高斯模糊处理
    blurred_qr = cv2.GaussianBlur(image[y:y+h, x:x+w], (101, 101), 0)

    # 将模糊后的区域放回原图
    image[y:y+h, x:x+w] = blurred_qr

# 保存或显示结果图片
cv2.imwrite('blurred_qrcode_image.png', image)
```

实际效果如下：
![blurred_qrcodes_image-imageonline.co-merged.png][1]

附上实验用到的环境配置：
```
# docker-compose.yaml
services:
  opencv-python-service:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/app
    working_dir: /app
    # 使用 pip 来安装 OpenCV，然后运行你的脚本
    command: ["sh", "-c", "python blur-qr-code.py"]

# Dockerfile
FROM python:3.8-slim

# 安装 zbar 库
RUN apt-get update && apt-get install -y --no-install-recommends libzbar0

# 安装 pyzbar Python 包
RUN pip install opencv-python-headless pyzbar
```


  [1]: /images/1526372042-da6cb97180.png
