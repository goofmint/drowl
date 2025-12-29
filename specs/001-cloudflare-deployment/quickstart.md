# Quickstart: Cloudflare Deployment

**Feature**: 001-cloudflare-deployment
**Date**: 2025-12-29
**Audience**: 開発者、DevOps担当者

## Prerequisites

- Cloudflareアカウント（有料プランまたは無料プラン）
- `drowl.dev`ドメインがCloudflareで管理されていること（ネームサーバーがCloudflareに設定済み）
- GitHub Secretsに以下を設定済み：
  - `CLOUDFLARE_API_TOKEN`（Workers/Pages書き込み権限）
  - `DATABASE_URL`（PostgreSQL接続文字列）
  - `REDIS_URL`（Redis接続文字列）
  - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`（MinIO接続情報）
- ローカル開発環境：Node.js 20+、pnpm 9+、wrangler CLI 3+

## Step 1: Install Wrangler CLI

```bash
pnpm add -g wrangler
wrangler --version  # 3.x以上を確認
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
# ブラウザでCloudflareログインを完了
```

## Step 3: Create `.dev.vars` for Local Development

各アプリケーションディレクトリに`.dev.vars`ファイルを作成（**Gitにコミットしない**）：

**apps/api/.dev.vars**:
```env
DATABASE_URL=postgresql://drowl:drowl_dev_password@localhost:5432/drowl
REDIS_URL=redis://:drowl_dev_password_redis@localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=drowl
S3_SECRET_KEY=drowl_dev_password_minio
S3_BUCKET=drowl-events
```

**apps/worker/.dev.vars**:
```env
DATABASE_URL=postgresql://drowl:drowl_dev_password@localhost:5432/drowl
REDIS_URL=redis://:drowl_dev_password_redis@localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=drowl
S3_SECRET_KEY=drowl_dev_password_minio
S3_BUCKET=drowl-events
```

## Step 4: Create `wrangler.toml` Configuration

**apps/api/wrangler.toml**:
```toml
name = "drowl-api"
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

**apps/worker/wrangler.toml**:
```toml
name = "drowl-worker"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[env.production]
name = "drowl-worker"
routes = [
  { pattern = "worker.drowl.dev/*", zone_name = "drowl.dev" }
]
vars = { NODE_ENV = "production" }

[env.development]
name = "drowl-worker-dev"
vars = { NODE_ENV = "development" }
```

## Step 5: Test Locally with Wrangler

```bash
# APIをローカル実行
cd apps/api
wrangler dev --env development
# http://localhost:8787 でアクセス可能

# Workerをローカル実行
cd apps/worker
wrangler dev --env development
# http://localhost:8788 でアクセス可能
```

## Step 6: Deploy Workers to Production

```bash
# 本番環境変数を設定（初回のみ）
cd apps/api
echo "postgresql://..." | wrangler secret put DATABASE_URL --env production
echo "redis://..." | wrangler secret put REDIS_URL --env production
echo "http://..." | wrangler secret put S3_ENDPOINT --env production
echo "..." | wrangler secret put S3_ACCESS_KEY --env production
echo "..." | wrangler secret put S3_SECRET_KEY --env production
echo "drowl-events" | wrangler secret put S3_BUCKET --env production

cd ../worker
echo "postgresql://..." | wrangler secret put DATABASE_URL --env production
echo "redis://..." | wrangler secret put REDIS_URL --env production
echo "http://..." | wrangler secret put S3_ENDPOINT --env production
echo "..." | wrangler secret put S3_ACCESS_KEY --env production
echo "..." | wrangler secret put S3_SECRET_KEY --env production
echo "drowl-events" | wrangler secret put S3_BUCKET --env production

# デプロイ
cd apps/api
wrangler deploy --env production

cd apps/worker
wrangler deploy --env production
```

## Step 7: Deploy Pages (Landing/UI)

```bash
# Landingをビルド
cd apps/landing
pnpm build
wrangler pages deploy dist --project-name=drowl-landing

# UIをビルド
cd apps/ui
pnpm build
wrangler pages deploy dist --project-name=drowl-ui
```

## Step 8: Configure Custom Domains

### Cloudflare Dashboard設定

1. **landing（drowl.dev）**:
   - Cloudflare Dashboard → Pages → drowl-landing → Custom domains
   - "drowl.dev" を追加
   - DNS設定は自動的に作成される

2. **ui（app.drowl.dev）**:
   - Cloudflare Dashboard → Pages → drowl-ui → Custom domains
   - "app.drowl.dev" を追加
   - DNS設定は自動的に作成される

3. **api（api.drowl.dev）**:
   - `wrangler.toml`の`routes`設定で自動（デプロイ時に適用済み）

4. **worker（worker.drowl.dev）**:
   - `wrangler.toml`の`routes`設定で自動（デプロイ時に適用済み）

## Step 9: Verify Deployment

```bash
# 各サービスのヘルスチェック
curl https://drowl.dev
curl https://app.drowl.dev
curl https://api.drowl.dev/health
curl https://worker.drowl.dev/health
```

すべてのエンドポイントが正常に応答することを確認。

## Step 10: Setup CI/CD (Optional)

GitHub ActionsでCloudflareデプロイを自動化する場合は、以下のワークフローファイルを追加：

`.github/workflows/deploy-cloudflare.yml`（詳細はresearch.mdを参照）

## Troubleshooting

### Issue: `wrangler deploy`で"zone not found"エラー

**Solution**: `wrangler.toml`の`zone_name`がCloudflareで管理されているドメインと一致していることを確認。

### Issue: 環境変数が読み込まれない

**Solution**:
- ローカル開発: `.dev.vars`ファイルが存在し、正しい形式であることを確認
- 本番環境: `wrangler secret list --env production`で設定済みシークレットを確認

### Issue: Custom domainがPages に反映されない

**Solution**: DNSプロパゲーションに最大48時間かかる場合がある。`nslookup app.drowl.dev`でDNS解決を確認。

### Issue: Workersからデータベースに接続できない

**Solution**:
- データベース/RedisがCloudflare Workersからアクセス可能なパブリックIPまたはVPNで接続可能であることを確認
- Cloudflare Workersは外部HTTPSリクエストに制限がないが、PostgreSQL/Redisは通常のTCP接続が必要
- 必要に応じてHTTPSプロキシまたはCloudflare Tunnelを検討

## Next Steps

- `/speckit.tasks`でタスクリストを生成
- タスクに従って実装を開始
- ヘルスチェック監視の設定
- エラートラッキング（Sentry）の統合
