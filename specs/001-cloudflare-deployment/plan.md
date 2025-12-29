# Implementation Plan: Cloudflare Deployment Configuration

**Branch**: `001-cloudflare-deployment` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cloudflare-deployment/spec.md`

## Summary

drowlプラットフォームの4つのアプリケーション（landing, ui, api, worker）を、それぞれ専用のCloudflareサブドメインでデプロイ可能にする。landing（Astroマーケティングサイト）をdrowl.devに、ui（Reactダッシュボード）をapp.drowl.devに、api（Hono Control Plane）をapi.drowl.devに、worker（Data Plane）をworker.drowl.devに配信する。

技術的アプローチは、Cloudflare Pagesでlanding/uiの静的サイトをホスティングし、Cloudflare Workers上でapi/workerのサーバーレス関数を実行する。各アプリケーションはwrangler CLIを使用して独立したプロジェクトとしてデプロイされ、環境変数で外部依存関係（PostgreSQL、Redis、MinIO）に接続する。

## Technical Context

**Language/Version**: TypeScript 5.x、Node.js 20+
**Primary Dependencies**:
- Cloudflare Wrangler CLI 3.x（デプロイツール）
- Hono 4.x（api/workerフレームワーク）
- Astro 5.x（landingビルド）
- Vite 5.x（uiビルド）
**Storage**: 設定ファイル（wrangler.toml）、環境変数（.dev.vars、Cloudflare Secrets）
**Testing**:
- ローカルテスト: `wrangler dev`（Workers）、`pnpm dev`（Pages）
- デプロイ後テスト: `/health`エンドポイント検証、手動ブラウザアクセス
**Target Platform**: Cloudflare Edge Network（Workers/Pages）
**Project Type**: Webアプリケーション（4つの独立したデプロイメントユニット）
**Performance Goals**:
- landing: 2秒以内の完全ロード
- ui: 3秒以内の操作可能状態
- api: 99.9%稼働率
- api-ui間通信: 500ms以内のレスポンス（95%ile）
**Constraints**:
- Cloudflare Workers制約: 10ms CPU時間（無料）/ 50ms（有料）、メモリ128MB
- 環境変数: Cloudflare Workersは`process.env`非対応のため`env(c)`必須
- 外部DB接続: PostgreSQL/Redis/MinIOへの接続はCloudflare Workersから可能である必要がある
**Scale/Scope**:
- 4アプリケーション × 1デプロイメント設定
- 4サブドメイン × 1 DNS設定
- 最小12個の環境変数（DATABASE_URL、REDIS_URL、S3関連など）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. OSS-First Architecture

**Status**: 合格
**Rationale**: Cloudflareデプロイ設定は追加オプションであり、既存の`docker-compose.yml`ベースのOSS版を損なわない。ローカル開発は引き続き`pnpm dev`とDockerで動作し、`wrangler dev`はCloudflare環境をエミュレートする追加手段として提供される。

### ✅ II. Plugin-Based Extensibility

**Status**: N/A
**Rationale**: このフィーチャーはデプロイメント設定であり、プラグイン機構には影響しない。

### ✅ III. Immutable Raw Data

**Status**: N/A
**Rationale**: このフィーチャーはデプロイメント設定であり、データ保存ロジックには影響しない。MinIOへの接続は環境変数で維持される。

### ✅ IV. Event Sourcing & Separation of Concerns

**Status**: N/A
**Rationale**: このフィーチャーはデプロイメント設定であり、データフローには影響しない。

### ✅ V. Identity Resolution Transparency

**Status**: N/A
**Rationale**: このフィーチャーはデプロイメント設定であり、ID統合ロジックには影響しない。

### ✅ VI. Observability & Traceability

**Status**: 合格
**Rationale**: Cloudflare Workersは標準でログ出力をサポートし、既存のSentry統合は維持される。デプロイ後の`/health`エンドポイントで各サービスの稼働状況をトレース可能。

### ✅ VII. Security & Secrets Management

**Status**: 合格
**Rationale**: 環境変数はCloudflare Secretsまたは`wrangler secret put`で管理され、平文でコード・ログに残らない。既存のシークレット管理方針に準拠。

**Overall**: ✅ すべてのGate合格。Phase 0 研究に進む。

## Project Structure

### Documentation (this feature)

```text
specs/001-cloudflare-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output: Cloudflare設定調査
├── data-model.md        # N/A (このフィーチャーはデータモデル不要)
├── quickstart.md        # Phase 1 output: デプロイ手順
└── contracts/           # N/A (このフィーチャーはAPI契約変更なし)
```

### Source Code (repository root)

```text
drowl/
├── apps/
│   ├── landing/
│   │   ├── wrangler.toml           # Cloudflare Pages設定（新規）
│   │   └── astro.config.mjs        # ビルド設定（既存）
│   ├── ui/
│   │   ├── wrangler.toml           # Cloudflare Pages設定（新規）
│   │   └── vite.config.ts          # ビルド設定（既存）
│   ├── api/
│   │   ├── wrangler.toml           # Cloudflare Workers設定（新規）
│   │   └── src/index.ts            # エントリーポイント（既存、env(c)対応済み）
│   └── worker/
│       ├── wrangler.toml           # Cloudflare Workers設定（新規）
│       └── src/index.ts            # エントリーポイント（既存）
├── .github/
│   └── workflows/
│       └── deploy-cloudflare.yml   # CI/CDデプロイワークフロー（新規）
└── README.md                       # デプロイ手順を追記
```

**Structure Decision**: 各アプリケーションのルートディレクトリに`wrangler.toml`を配置し、独立したCloudflareプロジェクトとして管理する。これにより、個別デプロイとロールバックが可能になる。GitHub Actionsワークフローで4アプリケーションを並列デプロイし、ヘルスチェックで検証する。

## Complexity Tracking

該当なし。Constitution Checkで違反なし。
