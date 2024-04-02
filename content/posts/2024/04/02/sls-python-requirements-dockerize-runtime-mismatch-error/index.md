+++
title = 'Serverless Python Requirements 使用時のあるクロスビルドエラーについて'
date = 2024-04-02T10:00:43+09:00
slug = 'sls-python-requirements-dockerize-runtime-mismatch-error'
categories = ['コーディング']
tags = ['AWS', 'Serverless Framework', 'Python', 'Docker', 'Node.js', 'JavaScript']
+++

[Serverless Framework](https://serverless.com/) は主に JavaScript のランタイムで使われることが多いと思いますが、最近 Python ランタイムの Lambda 関数を作成する必要があり、 [serverless-python-requirements](https://www.serverless.com/plugins/serverless-python-requirements) というライブラリを使って　Python のコードをデプロイしています。このライブラリで `custom.pythonRequirements.dockerizePip: true` というオプションを有効化すると、 `requirements.txt` の依存関係を Linux のコンテナでクロスビルドしてくれるため便利です。
クロスビルド時にあるエラーに遭遇したのでそのメモを記載します。

---

### 前提条件

- serverless@3.38.0
- serverless-python-requirements@6.1.0

### 再現方法

MacOS 環境において、serverless.yml に `provider.runtime` としてランタイムの種類を記載せず、関数レベルで指定している場合、デプロイ実行時に以下のエラーが発生します。

##### serverless.yml

```yml
service: <あなたのサービス名>
frameworkVersion: '3'

plugins:
  - serverless-python-requirements

provider:
  name: aws
  region: ap-northeast-1
  logRetentionInDays: 7
  stage: dev
  # runtime: python3.11 # ランタイムをスタックレベルで指定せず、

custom:
  pythonRequirements:
    dockerizePip: true

functions:
  main_py:
    runtime: python3.11 # ランタイムを関数レベルで指定する
    handler: handler_py.main

  main_js:
    runtime: nodejs20.x # なお、なぜ関数レベルで指定したかというと、このように複数の種類のランタイムを混在させたかったから
    handler: handler_js.main
```

##### 出力

```log
$ sls deploy

Deploying <あなたのサービス名> to stage dev (ap-northeast-1)

✖ Stack <あなたのサービス名>-dev failed to deploy (3s)
Environment: darwin, node 18.19.0, framework 3.38.0 (local), plugin 7.2.3, SDK 4.5.1
Credentials: Local, environment variables
Docs:        docs.serverless.com
Support:     forum.serverless.com
Bugs:        github.com/serverless/serverless/issues

Error:
Running "docker run --rm -v /Users/kamataryo/Library/Caches/serverless-python-requirements/caccb90f1757a760e21907a698ded42825c79604157da6614640dbccdcbb4dc1_x86_64_slspyc:/var/task:z -v /Users/kamataryo/Library/Caches/serverless-python-requirements/downloadCacheslspyc:/var/useDownloadCache:z -u 0 public.ecr.aws/sam/build-undefined:latest-x86_64 python -m pip install -t /var/task/ -r /var/task/requirements.txt --cache-dir /var/useDownloadCache" failed with: "Unable to find image 'public.ecr.aws/sam/build-undefined:latest-x86_64' locally
docker: Error response from daemon: repository public.ecr.aws/sam/build-undefined not found: name unknown: The repository with name 'build-undefined' does not exist in the registry with id 'sam'.
See 'docker run --help'."
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

### エラーの概要

`public.ecr.aws/sam/build-undefined:latest-x86_64` のイメージを取得しようとして存在していなかったためエラーとなっているようです。
試しに `provider.runtime` を存在しないはずの適当な値 `konnnichiha` に変えると、エラーメッセージが以下に変化しました。

```log
Error:
Running "docker run --rm -v /Users/kamataryo/Library/Caches/serverless-python-requirements/01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b_x86_64_slspyc:/var/task:z -v /Users/kamataryo/Library/Caches/serverless-python-requirements/downloadCacheslspyc:/var/useDownloadCache:z -u 0 public.ecr.aws/sam/build-konnnichiha:latest-x86_64 python -m pip install -t /var/task/ -r /var/task/requirements.txt --cache-dir /var/useDownloadCache" failed with: "Unable to find image 'public.ecr.aws/sam/build-konnnichiha:latest-x86_64' locally
docker: Error response from daemon: repository public.ecr.aws/sam/build-konnnichiha not found: name unknown: The repository with name 'build-konnnichiha' does not exist in the registry with id 'sam'.
```

### 解決方法

`provider.runtime` を明示的に指定します。

```yml
service: <あなたのサービス名>
frameworkVersion: '3'

plugins:
  - serverless-python-requirements

provider:
  name: aws
  region: ap-northeast-1
  logRetentionInDays: 7
  stage: dev
  runtime: python3.11 # ランタイムをスタックレベルでも指定しておく

custom:
  pythonRequirements:
    dockerizePip: true

functions:
  main_py:
    runtime: python3.11
    handler: handler_py.main

  main_js:
    runtime: nodejs20.x
    handler: handler_js.main
```

今回、利用する　Python のランタイムの種類が1つだけだったので問題ありませんでした。
複数の種類の　Python ランタイムを利用して requirements.txt の依存関係をクロスビルドしたい場合、serverless-python-requirements　を利用するのは難しいと思われます。
