---
title: Outdent@2 をリリースしました
slug: outdent-2
author: kamataryo
date: 2024-03-08 07:00:00 +0900
categories: [OSS]
tags: [javascript, typescript, bun, Node.js]
---

Outdent というツールを作って公開しています。

{{< github repo="kamataryo/outdent" >}}

TypeScript の型定義がおかしくなっていたため修正し、また冗長な機能を省いたメジャーバージョンアップとして、 v1 -> v2.0.1 をリリースしました。

---

このツールは JavaScript のための単純な文字列処理のライブラリで、コーディングスタイルにおけるインデントとテンプレートリテラル (`Hello, ${username}` のようなバッククオートの記法) の相性の悪さを解消するものです。

深いインデントの内部で改行を含むテンプレートリテラルを使った次の例見てください。

```javascript
{
  {
    {
      {
        const words = `こんにちは。
これはテンプレートリテラルに改行を含めた例です。
改行が複数行にわたると、とても見にくくなります。`
      }
    }
  }
}
```

Outdent を使うと以下のように書くことができます。

```javascript
import { outdent } from '@kamataryo/outdent'
{
  {
    {
      {
        const words = outdent`
          こんにちは。
          これは改行を含めたテンプレートリテラルにoutdent を適用した例です。
          改行が複数行にわたっても、見易いままです。
        `
      }
    }
  }
}
```

私は Outdent を CLI ツール出力に対するテストを書く際に使っているため、 npm publish して利用しています。

## Outdent の実装

Outdent の特徴は、[**タグ付きテンプレートリテラル**](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Template_literals#%E3%82%BF%E3%82%B0%E4%BB%98%E3%81%8D%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88) という機能を使っていることです。この JavaScript の記法は [styled components](https://styled-components.com/) で知りました。 

```javascript
// styled components の例
// タグ付きテンプレートリテラルの使われ方
const Styled = styled`
  background: red;
  font-size: 20px;
  margin: 10px;
`
```

タグ付きテンプレートリテラルではなく単純な関数コールでも問題ないのですが、見た目がすっきりするので使っています。
