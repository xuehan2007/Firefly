---
title: 在文章中嵌入视频
published: 1970-01-01
description: 这篇文章演示如何在博客文章中嵌入视频。
tags: [示例, 视频, Firefly]
category: 文章示例
slug: video
series: "Firefly 功能示例"
seriesOrder: 5
---

## 最简方法：直接粘贴视频链接

把视频链接**单独占一行**，保存后会自动变成视频播放器（无需 iframe 代码）。

支持 YouTube、Bilibili（多 P 可加 `?p=2`）以及直链视频文件（mp4/webm/ogv/mov）。

https://www.youtube.com/watch?v=5gIf0_xpFPI

---

## 传统方法：粘贴嵌入代码

也可以从 YouTube 或其他平台复制嵌入代码，然后将其粘贴到 markdown 文件中。

```yaml
---
title: 在文章中嵌入视频
published: 2023-10-19
// ...
---

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allowfullscreen></iframe>
```
## YouTube

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Bilibili

<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0> </iframe>