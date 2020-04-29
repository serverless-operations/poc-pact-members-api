# poc-pact-members-api
Sample WebAPI for spiking Pact contract testing

## Pact テストのデモ実行手順
Provider となる WebAPI のテストを実行して Pact を検証、ブローカーへ結果を送信します。  

### 前提条件
予め Consumer からブローカーへ登録された Pact のタグ（e.g.`master`）とバージョン（e.g.`0.0.0`）を合わせて検証を実行する必要があります。

### 実行環境
- Node.js `v12.13.0` 以上
- Yarn `1.22.0` 以上

### 依存関係のセットアップ
```shell
yarn setup
```

### 環境変数の設定
`.env.example` をコピーして `.env` ファイルを作成、以下の環境変数をセットします
```
# Lambda environment variables
ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN=
S3_BUCKET=

# Testing environment variables
PROVIDER_BASE_URL=
PACT_BROKER_URL=
PACT_BROKER_TOKEN=
```

### Pact テストの実行
```shell
# 非同期処理の Consumer テスト
yarn test:pact-consumer

# 非同期処理の Consumer テスト結果をブローカーへ送信する
yarn test:publish

# HTTP API, 非同期処理の Provider テスト
yarn test:pact-provider
```
