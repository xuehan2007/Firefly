# Pixiv 元数据抓取参考

所有接口都需要登录态 Cookie，在已登录 pixiv.net 的浏览器标签页内导航访问即可。
返回均为 `{ "error": false, "body": ... }` 结构的 JSON，页面正文就是 JSON 文本。

## 1. 只有画师名时找 uid

- 打开 `https://www.pixiv.net/search_user.php?nick=<URL编码的名字>`，从结果链接 `users/<uid>` 取 uid。
- 用户直接给主页链接 `https://www.pixiv.net/users/15229604` 时 uid 即 15229604。

## 2. 画师全部作品 ID

`GET https://www.pixiv.net/ajax/user/{uid}/profile/all`

关键字段：

```json
{
  "body": {
    "illusts": { "147112115": null, "145768805": null },
    "manga": { },
    "bookmarkCount": { }
  }
}
```

取 `Object.keys(body.illusts)`（manga 也在 keys 中时按需合并）。

## 3. 单件作品详情

`GET https://www.pixiv.net/ajax/illust/{id}`

筛选壁纸用到的字段：

| 字段 | 用途 |
| --- | --- |
| `body.illustId` / `body.illustTitle` | 编号与标题 |
| `body.width` / `body.height` | 首页尺寸；横版进桌面、竖版进手机 |
| `body.pageCount` | >1 时必须再查 pages 接口取每页尺寸 |
| `body.xRestrict` | 0=全年龄；非 0 一律排除 |
| `body.urls.original` | 单页作品的原图 URL（多 P 时只是 p0） |
| `body.tags.tags[].tag` | 题材筛选（ブルーアーカイブ / Blue Archive / 蔚蓝档案） |
| `body.description` | 可辅助判断是否壁纸向 |

## 4. 多 P 作品逐页信息

`GET https://www.pixiv.net/ajax/illust/{id}/pages`

```json
{
  "body": [
    { "urls": { "original": "https://i.pximg.net/img-original/img/.../xxx_p0.jpg" },
      "width": 4085, "height": 8850 },
    { "urls": { "original": "..." }, "width": 1627, "height": 885 }
  ]
}
```

多 P 作品的各页尺寸/方向可能不同，**逐页独立分类与排除**（常见陷阱：套图最后一页是宽幅横图，前几页是竖图；或夹带游戏截图、低清漫画页）。

## 5. 下载原图

`i.pximg.net` 强制校验 Referer，必须带：

```
Referer: https://www.pixiv.net/
User-Agent: <常规浏览器 UA>
```

PowerShell：

```powershell
$headers = @{
  "Referer" = "https://www.pixiv.net/"
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36"
}
Invoke-WebRequest -Uri $url -Headers $headers -OutFile $out
```

浏览器内直接 fetch/打开 pximg URL 会 403，不要走浏览器下载，用 shell 批量下。

## 6. 浏览器 evaluate 踩坑

本环境（integrated_code_mode 的 browser_evaluate）实测：

- 脚本里 `Array.prototype.map` 可能返回 `undefined`（表达式被包进 try/catch 时尤其明显）。统一用 `for` 循环拼字符串。
- 每次 `browser_navigate` 后 `browser_wait_for` 1–2 秒再读正文，否则可能读到上一页。
- 返回值取 `r.content[0].text`。

可直接套用的详情抓取模板（逐 id 串行）：

```js
const ids = ["145768805", "145239839"];
const out = [];
for (const id of ids) {
  await tools.browser_navigate({ url: "https://www.pixiv.net/ajax/illust/" + id });
  await tools.browser_wait_for({ time: 2 });
  const r = await tools.browser_evaluate({
    script:
      "var b=JSON.parse(document.body.innerText).body;" +
      "b.illustId+'|'+b.illustTitle+'|'+b.width+'x'+b.height+'|p'+b.pageCount+" +
      "'|x'+b.xRestrict+'|'+(b.urls?b.urls.original:'')",
  });
  out.push(r.content[0].text);
}
text(out.join("\n"));
```

多 P 尺寸模板：

```js
await tools.browser_navigate({ url: "https://www.pixiv.net/ajax/illust/" + id + "/pages" });
await tools.browser_wait_for({ time: 2 });
const r = await tools.browser_evaluate({
  script:
    "var arr=JSON.parse(document.body.innerText).body; var s=''; " +
    "for(var i=0;i<arr.length;i++){var u=arr[i].urls.original; " +
    "if(i)s+=', '; s+='p'+i+':'+arr[i].width+'x'+arr[i].height+' '+u;} s",
});
```

## 7. 整理给用户的清单格式

每个候选输出一行：`编号 | 尺寸 | 页数 | 标题 | 作品链接 https://www.pixiv.net/artworks/{id}`，
并单列"排除项"及原因（截图/低清页/非目标题材/R-18），最终去留由用户确认。
