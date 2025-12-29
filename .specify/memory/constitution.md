<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0 (Initial constitution establishment)
- Added sections: All core principles and governance rules
- Templates requiring updates:
  ✅ Updated: None (initial creation)
  ⚠ Pending review: plan-template.md, spec-template.md, tasks-template.md
- Follow-up TODOs: Validate constitution compliance in existing templates
-->

# drowl (DevRel ROI可視化基盤) Constitution

## Core Principles

### I. OSS-First Architecture (OSS優先アーキテクチャ)

すべての機能は **OSS版で動作可能** な形で実装されなければならない。

**規則**:
- `docker-compose.yml`で完全に動作する構成を維持すること
- SaaS専用機能は明確に分離し、OSS版の機能を損なわないこと
- `tenant_id`は常に保持するが、OSS版では`"default"`固定とする
- Cloudflare依存はローカル代替手段を提供すること(Miniflare/Wrangler dev推奨)

**理由**: セルフホストユーザーとプラグイン開発者が自由に検証・拡張できることが、エコシステム成長の基盤である。

### II. Plugin-Based Extensibility (プラグイン拡張性)

データ収集部分は **Manifest + Runner** の二層構造で拡張可能とする。

**規則**:
- すべてのデータソース連携はプラグインとして実装すること
- プラグインは`id`, `name`, `version`, `triggers`, `config_schema`, `capabilities`, `output`を持つManifestを宣言すること
- Runnerは冪等実行、リトライ、レート制御、ログ/メトリクス出力、シークレット管理を担保すること
- コアシステムはプラグインに依存せず動作すること

**理由**: 多様なデータソースに対応しつつ、コアの安定性を維持するため。将来的なSaaS公式プラグインマーケットプレイス展開にも対応。

### III. Immutable Raw Data (不変Raw保存)

収集したRawデータは **必ず保存**し、削除・上書きを禁止する。

**規則**:
- すべてのイベントは`payload_ref`を持ち、オブジェクトストレージ(R2/S3/MinIO)にRawを保存すること
- 正規化後もRawは保持し続けること
- 再計算・監査・検証のためにRawにアクセス可能であること

**理由**: データの出所を保証し、集計ロジック変更時の再計算や監査要求に対応可能にする。

### IV. Event Sourcing & Separation of Concerns (イベントソーシング & 責務分離)

データフローは **収集 → 正規化 → 統合 → 集計 → レポート** の段階に分離する。

**規則**:
- 各段階はキューで疎結合とすること
- 共通イベントスキーマ(`event_id`, `tenant_id`, `source`, `event_type`, `keyword_id`, `occurred_at`, `actor_ref`, `payload_ref`, `dedupe_key`)を厳守すること
- 冪等性を`dedupe_key`で保証すること
- 集計結果は専用テーブルに分離し、指標変更に強い設計とすること

**理由**: 各段階の独立性を高め、スケール・障害分離・拡張性を確保する。

### V. Identity Resolution Transparency (ID統合の透明性)

アカウント統合は **根拠・信頼度を明示**する。

**規則**:
- すべてのID統合は`Identity Link`テーブルに記録すること
- `confidence`(0.0–1.0)、`link_type`(manual/rule/probabilistic)、`evidence`を必須とすること
- MVP段階では`manual`と`rule`のみサポートし、高度推定は将来拡張とすること
- 統合結果は後から検証・修正可能であること

**理由**: DevRel ROI測定における「人物特定」は機密性・正確性が重要であり、ブラックボックス化を避ける。

### VI. Observability & Traceability (観測可能性とトレース)

すべてのジョブとイベントは **追跡可能** であること。

**規則**:
- ジョブには`job_id`、`tenant_id`、`plugin_id`、`trigger`、`attempt`、`idempotency_key`を付与すること
- エラーはSentryに送信し、リトライ上限到達時はDLQ相当に移動すること
- ログは構造化し、キーワード・期間・ソースで検索可能とすること

**理由**: 分散ワーカー環境での障害調査・デバッグを効率化する。

### VII. Security & Secrets Management (セキュリティとシークレット管理)

外部連携の認証情報は **安全に管理** すること。

**規則**:
- Push/Webhookは署名検証またはAPIキー必須とすること
- コネクタトークンはSecrets管理(OSS: env、SaaS: Cloudflare Secrets)に格納すること
- 平文パスワード・トークンをログ・DB・コードに残さないこと
- レート制限はプラグインが宣言し、ワーカー側で制御すること

**理由**: 外部サービスの認証情報漏洩やレート制限違反はサービス全体の信頼性を損なう。

## Technology Standards

### Cloud Infrastructure (SaaS)

- **Platform**: Cloudflare Workers (Hono)
- **Queue**: Cloudflare Queues
- **Storage**: R2 (Raw/payload/レポート成果物)
- **Database**: Supabase Postgres
- **Observability**: Sentry

### Local Development (OSS)

- **Runtime**: Node.js (Hono実行) + Miniflare/Wrangler dev推奨
- **Queue**: Cloudflare Queues (Miniflare) または Redis/RabbitMQ/in-memory
- **Storage**: MinIO またはローカルファイルシステム
- **Database**: PostgreSQL (docker-compose)
- **Observability**: Sentry (開発時無効可)

### API Design

- **Framework**: Hono
- **Protocol**: REST JSON
- **Authentication**: APIキーまたは署名検証(Push/Webhook)
- **Versioning**: URL path (`/v1/...`)

## Development Workflow

### MVP Execution Strategy

**Phase 0 (1-2週間想定のMVP)**:
1. キーワード管理
2. 収集プラグイン2種(poll + webhook)
3. Event正規化(DB格納、Rawはストレージ)
4. 手動IDリンク
5. 集計(keyword×dayの件数)
6. React UIで表示

**Phase 1 (拡張)**:
1. キュー段数を増やして責務分離(normalize/identity/aggregate)
2. ルールベースID統合を拡充
3. 競合比較ビュー強化

**Phase 2 (SaaS差別化)**:
1. 確率ベース統合、レポート自動生成、公式プラグイン群

### Testing Requirements

**MVPでは**:
- プラグインの冪等性検証(同一リクエスト2回実行で重複しない)
- 共通イベントスキーマへの正規化検証
- 手動IDリンクの作成・削除・一覧取得
- 集計結果のキーワード別・期間別取得

**後続フェーズで追加**:
- ルールベースID統合の精度検証
- レート制限・リトライロジックのストレステスト
- UIの受け入れテスト

### Quality Gates

- **コミット前**: Lint・型チェック必須
- **マージ前**: プラグインのManifest検証・冪等性テスト通過必須
- **デプロイ前**: Sentryエラーレート閾値確認(SaaS)

## Governance

### Amendment Procedure

この憲章の修正は以下の手順を要する:

1. 修正提案と根拠を`.specify/memory/constitution.md`のSync Impact Reportに記載
2. 影響を受けるテンプレート(plan-template.md, spec-template.md, tasks-template.md)の確認と更新
3. バージョン番号の更新(セマンティックバージョニング):
   - MAJOR: 後方互換性のない原則削除・再定義
   - MINOR: 新原則追加または大幅なガイダンス拡張
   - PATCH: 明確化・文言修正・タイポ修正
4. ユーザー承認

### Compliance Review

- すべてのPR・レビューは本憲章への準拠を検証する
- 複雑性追加はJustification(正当化)を必須とする
- プラグイン追加時はManifest要件とRunner責務の遵守を確認する

### Runtime Development Guidance

開発時の詳細なガイダンスは `~/.claude/CLAUDE.md` および `BASIC.md` を参照。

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29
