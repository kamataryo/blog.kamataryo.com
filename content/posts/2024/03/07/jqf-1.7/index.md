---
title: Jqf@1.7 をリリースしました
slug: jqf-1.7
author: kamataryo
date: 2024-03-07 17:00:00 +0900
categories: [OSS]
tags: [javascript, typescript, bun, Node.js]
---

Jqf というオープンソースの CLI ツールを作成しています。  
最近手を入れていなかったのですが、時間ができたのでメンテナンスを行い新しいバージョン(1.7.1)をリリースしました。

{{< github repo="kamataryo/jqf" >}}

## Jqf について

jqf は [jq](https://jqlang.github.io/jq/) ライクな CLI による JSON プロセッサです。標準入力として JSON を受け取り、JavaScript の関数表現によって JSON を処理できます。

```shell
$ echo '{ "hello": "world!" }' | npx jqf 'obj => obj.hello'
"world!"
```

map などのメソッドもあります。

```shell
$ echo "[1,2,3]" | npx jqf map -m "x => x ** 2"
[1,4,9]
```

データを CLI 上でサクッと処理したいときに便利でよく使っています。

ドキュメントサイトも作っているので、詳しい使い方はこちらから確認してみてください。

https://jqf.kamataryo.com/docs/ja/install

## v1.7 での変更点

新しい機能の追加はありませんが、開発環境を全て [Bun](https://bun.sh) に統一しました。  
ビルドも速く TypeScript 周りの設定も簡単です。   
Bun を使うことで、TypeScript のコードから Node.js のランタイムで利用できる JavaScript  の CLI のファイルが生成できました。例えば以下は jqf の JavaScript ファイルを生成する bun のコマンドです。

```shell
$ bun build ./src/index.ts ./src/cli.ts --outdir ./dist --target node
```

今後、単機能の JavaScript ライブラリを作成する場合は Bun を積極的に利用すると思います。
