+++
title = 'httrack でウェブサイトを丸ごとダウンロードする'
date = 2024-05-28T10:00:43+09:00
slug = 'httrack'
categories = ['コーディング']
tags = ['HTML', 'linux']
+++

月末に閉鎖されるあるウェブサイトを外部から丸ごとダウンロードしてアーカイブする必要があり、HTTrack というツールを使ってみました。 

https://www.httrack.com/

Mac の場合は Homebrew から、 Ubuntu の場合は apt などでインストールできます。

```shell
$ brew install httrack
$ apt-get install httrack
```

### 使い方の例

基本の使い方は以下です。

```shell
$ httrack "https://example.com" -O "path/to/download/dir"
```

色々なオプションがあるので上記のサイトを参考にしてください。

今回私は、サイト example.com を対象に、このサイトに対して example-static.s3.amazonaws.com から配信されている画像等も丸ごと保存したかったので、以下の様にオプションを渡しました。

```shell
httrack "https://example.com/" -O "./output" "+example-static.s3.amazonaws.com/*" -v
```

これで CDN に保存されているデータも丸ごとアーカイブすることができました。

なお、サイトが巨大だと結構時間がかかるため、 nohup を使ってバックグラウンドで実行しています。

```shell
nohup httrack "https://example.com/" -O "./output" "+example-static.s3.amazonaws.com/*" -v &
```
