---
title: Bun と TypeScript でビルドする Node.js プロジェクトに型定義を追加する方法
slug: bun-type-dec
author: kamataryo
date: 2024-03-09 07:00:00 +0900
categories: [コーディング]
tags: [javascript, typescript, bun, Node.js]
---

[Bun](https://bun.sh) を使うと TypeScript のコードをビルドして Node.js などの JavaScript ランタイムで実行できるように変換することができますが、ビルド後に型定義のファイルを出力しません。

以下の Issue で書かれている通り、型定義の出力の処理は現在のところ Bun のスコープ外とされているようです。

https://github.com/oven-sh/bun/issues/5141#issuecomment-1716640660

> colinhacks commented on Sep 13, 2023
>
> This is out of scope for Bun. Currently `tsc` is the only tool in existence for reliably generating declaration files. Doing it right would require re-implementing the entire TypeScript compiler & type inference infrastructure unfortunately.
>
> This may be possible in some [limited cases](https://github.com/microsoft/TypeScript/issues/47947) eventually.
>
>> これは Bun のスコープ外です。現在のところ、`tsc`は宣言ファイルを確実に生成するための唯一のツールです。これを正しく行うには、残念ながら TypeScript コンパイラと型推論のインフラ全体を再実装する必要があります。
>>
>> これは、いくつかの[限られたケース](https://github.com/microsoft/TypeScript/issues/47947)ではいずれ可能になるかもしれません。

別々（`bun` vs. `tsc`）のプログラムにそれぞれ依拠してしまうのはあまりエレガントではない気がしますが、それでもそれぞれの機能は使いたい。なので `bun` コマンドで TypeScript のプロジェクトをビルドしながら `tsc` コマンドで型定義だけを出力するのが良いかと思われます。

---

`tsc` コマンドでは以下のオプションで型定義のみを出力することができます。

```shell
$ tsc --emitDeclarationOnly
```

bun の build コマンドは tsconfig に依存しないので型定義のみの　tsconfig を作成し、bun のビルド時に同時に型定義を出力するようにします。
以下は `./src` 以下の TypeScript のコードに対して `./dist` ディレクトリに型定義を出力するための tsconfig の例になります。

```json
# tsconfig.type-declaration.json
{
  "compilerOptions": {
    "declaration": true,
    "outDir": "./dist",
    "skipLibCheck": true,
  },
  "exclude": ["node_modules", "./src/**/*.test.ts"]
}
```

プロジェクトをビルドするコマンドは以下のようになるでしょう。

```shell
$ rm -rf dist && \
  bun build ./src/**/*.ts --outdir ./dist --target node && \
  tsc --emitDeclarationOnly --project tsconfig.type-declaration.json
```

---

この設定は、以下のリポジトリで有効にしています。

{{< github repo="kamataryo/jqf" >}}
ske
{{< github repo="kamataryo/outdent" >}}
