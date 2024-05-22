+++
title = 'OGP 画像が Facebook でだけ表示されない - ある凡ミスのケース'
date = 2024-05-22T10:00:43+09:00
slug = 'og-image-within-invalid-html-head'
categories = ['コーディング']
tags = ['HTML', 'SEO']
+++

OGP を表示する `meta[property=og:image]` が Twitter Card では認識されるのに Facebook では認識されなかったあるケースです。
原因は単なるタイポですが、Twitter と Facebook とで内部のパーサーの挙動が違っていることが見てとれたので記録しておきます。

---

以下のような `head>meta[property=og:image]` 要素を記述した際に Facebook では　OGP 画像が表示されない一方、Twitter では正しく表示されました。
Facebook シェアデバッガー では `推測されるプロパティ値が他のタグから推測される場合でも、og:imageプロパティは明示的に指定してください。` というメッセージが表示されていました。

```html
<html>
  <head prefix="og: http://ogp.me/ns# website: http://ogp.me/ns/website#"></head>
  <meta property="og:image" content="https://example.com/ogp.png" /> 
  </head>
</html>
```

見ての通り `</head>` を不正に記述しており、これが原因でした。
Facebook と Twitter とで異なるのは、html パーサーの挙動が内部的に違っていることによるものと思います。
