# Research: Cloudflare Deployment Configuration

**Feature**: 001-cloudflare-deployment
**Date**: 2025-12-29
**Purpose**: Cloudflare Pages/Workersへのデプロイメント設定のベストプラクティスと技術選択を調査

## Research Questions

1. **wrangler.tomlの構成方法**: 各アプリケーション（landing/ui/api/worker）に必要な設定パラメータ
2. **環境変数管理**: Cloudflare Workers/Pagesでの環境変数セキュア管理方法
3. **Cloudflare PagesとWorkersの違い**: 静的サイトとサーバーレス関数のデプロイメント方式の違い
4. **カスタムドメイン設定**: サブドメイン（drowl.dev, api.drowl.dev, app.drowl.dev, worker.drowl.dev）のルーティング方法
5. **CI/CD統合**: GitHub ActionsとCloudflareの連携パターン

## Findings

### 1. wrangler.toml Configuration

**Decision**: 各アプリケーションのルートディレクトリに`wrangler.toml`を配置し、以下の構造を使用

**Cloudflare Workers（api/worker）**:
```toml
name = "drowl-api"  # または "drowl-worker"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[env.production]
name = "drowl-api"
routes = [
  { pattern = "api.drowl.dev/*", zone_name = "drowl.dev" }
]
vars = { NODE_ENV = "production" }

[env.development]
name = "drowl-api-dev"
vars = { NODE_ENV = "development" }
```

**Cloudflare Pages（landing/ui）**:
Cloudflare Pagesは`wrangler.toml`を使用せず、Cloudflareダッシュボードまたは`wrangler pages deploy`コマンドで設定する。ビルド出力ディレクトリ（`dist/`または`build/`）を指定し、カスタムドメインはCloudflareダッシュボードで設定する。

**Rationale**:
- Workersは`wrangler.toml`で完全に設定可能
- Pagesはビルド成果物のデプロイに特化し、設定はダッシュボードまたはCLIフラグで管理
- 環境ごとに`[env.production]`/`[env.development]`セクションで分離

**Alternatives Considered**:
- すべてのアプリを単一`wrangler.toml`で管理 → 却下：独立デプロイが困難
- 環境変数をwrangler.tomlに直接記述 → 却下：シークレット漏洩リスク

### 2. Environment Variables Management

**Decision**: 本番環境変数は`wrangler secret put`で管理し、開発環境は`.dev.vars`ファイルを使用

**実装方法**:
```bash
# 本番シークレット設定（CI/CDで実行）
echo "postgresql://..." | wrangler secret put DATABASE_URL --env production
echo "redis://..." | wrangler secret put REDIS_URL --env production
echo "minio_key" | wrangler secret put S3_ACCESS_KEY --env production
echo "minio_secret" | wrangler secret put S3_SECRET_KEY --env production

# ローカル開発用（.dev.vars）
DATABASE_URL=postgresql://drowl:password@localhost:5432/drowl
REDIS_URL=redis://:password@localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=drowl
S3_SECRET_KEY=drowl_dev_password_minio
S3_BUCKET=drowl-events
```

**Rationale**:
- `wrangler secret put`はCloudflare Secretsに暗号化保存され、ログに表示されない
- `.dev.vars`はローカル開発専用で、`.gitignore`に追加して漏洩を防止
- `env(c)`パターンでコード側から環境変数にアクセス（既に実装済み）

**Alternatives Considered**:
- 環境変数をGitHub Secretsのみで管理 → 却下：Cloudflare Secretsと二重管理が必要
- すべての環境変数を公開 → 却下：シークレット漏洩リスク

### 3. Cloudflare Pages vs Workers

**Decision**:
- **landing（Astro静的サイト）**: Cloudflare Pagesでホスティング
- **ui（React SPA）**: Cloudflare Pagesでホスティング
- **api（Hono Control Plane）**: Cloudflare Workersで実行
- **worker（Data Plane）**: Cloudflare Workersで実行

**Pages特性**:
- 静的ファイル（HTML/CSS/JS）の配信に最適化
- ビルド時に生成されたファイルをCDNエッジで配信
- 無料プラン: 500ビルド/月、無制限帯域
- カスタムドメイン: Cloudflareダッシュボードで設定

**Workers特性**:
- サーバーレス関数の実行（JavaScript/TypeScript）
- エッジロケーションでコード実行
- 無料プラン: 100,000リクエスト/日、10ms CPU時間/リクエスト
- カスタムドメイン: `routes`設定で自動ルーティング

**Rationale**:
- landingとuiは静的ビルド成果物のため、Pagesが最適
- apiとworkerはサーバーサイド処理（DB/Redis接続、ジョブ処理）のため、Workersが必須
- Pagesはビルド最適化とキャッシュを自動管理

**Alternatives Considered**:
- すべてをWorkersで実行 → 却下：静的ファイル配信にWorkers不要（コスト増）
- すべてをPagesで実行 → 却下：apiとworkerはサーバーサイド処理が必要

### 4. Custom Domain Configuration

**Decision**: Cloudflareダッシュボードで各サブドメインをPages/Workersプロジェクトにルーティング

**設定手順**:
1. **drowl.dev（landing）**: Cloudflare Pages → Custom Domains → "drowl.dev" 追加
2. **app.drowl.dev（ui）**: Cloudflare Pages → Custom Domains → "app.drowl.dev" 追加
3. **api.drowl.dev（api）**: `wrangler.toml`の`routes`設定で自動（`pattern = "api.drowl.dev/*"`）
4. **worker.drowl.dev（worker）**: `wrangler.toml`の`routes`設定で自動（`pattern = "worker.drowl.dev/*"`）

**DNS設定**:
- すべてのサブドメインはCloudflareで管理（ネームサーバーがCloudflare）
- Pages: 自動的にCNAMEレコードが作成される
- Workers: `routes`設定で自動的にルーティングされる

**Rationale**:
- Cloudflareダッシュボードで一元管理し、DNS伝播とSSL証明書を自動化
- Workers routesはデプロイ時に自動適用され、手動設定不要
- SSL/TLS証明書はCloudflareが自動発行・更新

**Alternatives Considered**:
- 外部DNS（Route53など）で管理 → 却下：Cloudflare統合の利点を失う
- 手動でDNSレコード作成 → 却下：Cloudflareが自動管理するため不要

### 5. CI/CD Integration with GitHub Actions

**Decision**: GitHub ActionsでCloudflareデプロイを自動化し、`wrangler deploy`コマンドを使用

**ワークフロー構造**:
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy-pages:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [landing, ui]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter @drowl/${{ matrix.app }} build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy apps/${{ matrix.app }}/dist --project-name=drowl-${{ matrix.app }}

  deploy-workers:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [api, worker]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/${{ matrix.app }}
          command: deploy --env production
          secrets: |
            DATABASE_URL
            REDIS_URL
            S3_ENDPOINT
            S3_ACCESS_KEY
            S3_SECRET_KEY
            S3_BUCKET
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          S3_ENDPOINT: ${{ secrets.S3_ENDPOINT }}
          S3_ACCESS_KEY: ${{ secrets.S3_ACCESS_KEY }}
          S3_SECRET_KEY: ${{ secrets.S3_SECRET_KEY }}
          S3_BUCKET: ${{ secrets.S3_BUCKET }}

  health-check:
    needs: [deploy-pages, deploy-workers]
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -f https://drowl.dev || exit 1
          curl -f https://app.drowl.dev || exit 1
          curl -f https://api.drowl.dev/health || exit 1
          curl -f https://worker.drowl.dev/health || exit 1
```

**Rationale**:
- matrixストラテジーで4アプリケーションを並列デプロイ（高速化）
- `cloudflare/wrangler-action@v3`公式アクションで安定性確保
- デプロイ後のヘルスチェックで異常を早期検出
- GitHub Secretsでシークレット管理（`CLOUDFLARE_API_TOKEN`、DB認証情報など）

**Alternatives Considered**:
- 手動デプロイ → 却下：再現性とスピード不足
- 4つの独立したワークフロー → 却下：並列化の利点を失う
- wrangler CLIを直接実行 → 却下：公式アクションの方が安定性とキャッシュ最適化が優れている

## Summary

Cloudflareデプロイメント設定は以下の技術選択で実装する：

1. **wrangler.toml**: api/workerに配置し、環境ごとに`[env]`セクション分離
2. **環境変数**: 本番は`wrangler secret put`、開発は`.dev.vars`
3. **Pages vs Workers**: landing/ui → Pages、api/worker → Workers
4. **カスタムドメイン**: Cloudflareダッシュボード（Pages）と`routes`設定（Workers）
5. **CI/CD**: GitHub ActionsでmatrixストラテジーとCloudflare公式アクション使用

これらの選択により、独立デプロイ、シークレット保護、自動ヘルスチェックを実現する。
