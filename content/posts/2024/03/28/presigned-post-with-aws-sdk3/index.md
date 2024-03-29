+++
title = 'AWS SDK v3 で Presigned Post を使い S3 にデータをアップロードする'
date = 2024-03-28T10:06:08+09:00
slug = 'presigned-post-with-aws-sdk3'
categories = ['コーディング']
tags = ['AWS', 'S3', 'Node.js', 'JavaScript']

+++

Presigned Post を使い、 Amazon S3 のバケツにデータをアップロードを許可する方法です。この方法により AWS のクレデンシャルを持たないエンドユーザーに対してパブリックな URL を発行し、 S3 バケツへの限定的なアクセスを許可することができます。

---

### インフラ

当該のバケツに対して CORS の許可を与えたください。

```shell
$ aws s3api put-bucket-cors --bucket <あなたのバケツ名> --cors-configuration file://bucket-cors.json
```

```json
// ./bucket-cors.json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["POST"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### サーバーサイド

サーバーサイドでは Presigned Post の機能を使いデータアップロード用の URL を生成します。処理の実行にあたって当該のバケツに対する `s3::PutObject` のアクションを許可してください。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
    "Action": [
      "s3:PutObject"
    ],
      "Resource": "arn:aws:s3:::<あなたのバケツ名>/*",
      "Effect": "Allow"
    }
  ]
}
```

以下の2つのライブラリを使います。

```shell
$ npm install @aws-sdk/client-s3 @aws-sdk/s3-presigned-post -D
```

```typescript
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

const s3Client = new S3Client({})

const { url, fields } = await createPresignedPost(client, {
  Bucket: '<あなたのバケツ名>',
  Key: `<オブジェクトのキー>`,
  Expires: 3600, // URL の有効期限を秒で指定
})
```

なお、この際に `Conditions` パラメーターを利用することでさまざまなポリシーを設定することができます。例えば `content-length-range	` を指定してアップロードのサイズを制限したり。詳細は以下に記載されています。

https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html

ここで生成された `url` と `fields` をエンドユーザー（クライアントサイド）に渡します。
これらのデータは以下のようなフォーマットです。

```json
{
  "url": "https://<あなたのバケツ名>.s3.<バケツのリージョン名>.amazonaws.com/",
  "fields": {
    "bucket": "<あなたのバケツ名>",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": "...",
    "X-Amz-Date": "20240328T080640Z",
    "X-Amz-Security-Token": "...",
    "key": "<オブジェクトのキー>",
    "Policy": "...",
    "X-Amz-Signature": "..."
  }
}
```

### クライアントサイド

クライアントサイドでは、上記で得られた `url` に対して `fields` をフォームデータとして送信し、その際に送信したいデータを `file` として追加します。

```typescript
async function presignedPost(file: File) {
  const formData = new FormData()
  
  for (const key in fields) {
    formData.append(key, fields[key])
  }
  formData.append('file', file)

  await fetch(url, {
    method: 'POST',
    body: formData
  })
}
```

この処理を実行することで当該のキーの S3 オブジェクトとしてデータがアップロードされます。

---

エンドユーザーにアバター画像をアップロードさせたり、何らかの処理を行うために大きなファイルをアップロードするような用途に適していると思います。アップロードしたデータは S3 のストリームイベントなどを通して別の処理をトリガーさせることができます。
