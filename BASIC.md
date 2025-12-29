# 基本設計書（MVP）: DevRel ROI 可視化基盤（OSS + SaaS）

## 1. 目的・背景

### 目的

* 開発者向け製品に関する **DevRel活動の価値を可視化**する。
* 複数チャネルのデータを **キーワード軸**で収集し、**ユーザー（アカウント）を統合**し、**比較可能なレポート**を提供する。

### 背景・課題

* Web解析（匿名）・SNS/コミュニティ（特定）・開発活動（GitHub等）が分断され、DevRel ROIの根拠が作りにくい。
* 「競合比較」や「施策前後比較」を同一指標で扱うための観測基盤が不足している。

## 2. コンセプト（中核要件）

本ツールは以下の3機能で構成する。

1. **データ収集（Observation）**

   * キーワードを複数設定可能
   * データ取得経路：

     * 外部API（定期ポーリング）
     * Webhook（受信）
     * Push API（外部から送信）
   * 収集ロジックは **プラグイン化**し、後から追加可能

2. **アカウント統合（Identity Resolution）**

   * 異なるサービスのユーザーIDを統合し、一元的な人物（Identity）として扱う
   * MVPは「ルールベース + 明示リンク」を基本とする（高度推定はSaaS追加機能候補）

3. **レポーティング（Reporting）**

   * キーワード別・競合別・期間別の比較
   * 施策前後の差分、トレンド確認
   * MVPは「ダッシュボード + エクスポート」を主にする

## 3. 提供形態

## 3.1 OSS（開発時/セルフホスト）

* `docker-compose.yml` で立ち上げ可能
* 目的：素早い検証、プラグイン開発、セルフホスト運用
* テナントはUI上は不要（内部では `tenant_id="default"` 固定で扱える設計）

## 3.2 SaaS（Cloudflare全面利用）

* Cloudflare Workers（Hono）+ Cloudflare Queues + R2 を中核
* DBは Supabase Postgres を利用（Workersからの接続は運用方針に従い最適化）
* Observability は Sentry

## 4. アーキテクチャ概要

## 4.1 論理アーキテクチャ（共通）

* **Control Plane（司令塔）**

  * 設定管理（キーワード、コネクタ、統合ルール）
  * 認証/認可
  * ジョブ発行（Queuesへ enqueue）
  * UI向けAPI提供

* **Data Plane（ワーカー多数）**

  * 収集（ingest）
  * 正規化（normalize）
  * 統合（identity）
  * 集計（aggregate）
  * レポート生成（report）

* **データストア**

  * Postgres（設定・IDグラフ・集計結果）
  * オブジェクトストレージ（Raw / payload / レポート成果物）
  * キュー（ジョブ・イベント流通）

## 5. MVP スコープ

## 5.1 MVPの到達点（検証したい価値）

* キーワードを登録し、少なくとも2ソースからデータを集め、同一人物を手動/ルールで統合し、キーワード別に比較できる。

## 5.2 MVPで実装する機能（必須）

### 設定

* キーワード管理

  * `自社名` / `競合名` / `機能名` を複数登録
  * キーワードを「比較グループ（例：競合セット）」に束ねられる

### 収集

* プラグイン方式で **最低2つのコネクタ**を実装（例：Webhook受信 + ポーリングAPI）
* Raw保存（R2/S3/ローカル）

### 正規化

* 共通イベントスキーマ（後述）に変換してDBに格納

### アカウント統合（MVP）

* 明示リンク（手動で「同一人物」登録）
* ルールベース（例：同一メール、同一ハンドル等。可能な範囲）
* 統合結果に `confidence`（固定値でも可）を持たせる

### レポーティング（MVP）

* ダッシュボード

  * 期間×キーワード別件数
  * キーワード比較（自社 vs 他社）
* エクスポート（CSV/JSON）

## 5.3 MVPで後回し（SaaS差別化候補）

* 高度なID推定（行動/類似性）
* レポート自動配信・テンプレート
* 権限管理の高度化、監査ログ、運用SLO
* OLAP（ClickHouse等）導入

## 6. プラグイン設計（情報収集の拡張点）

## 6.1 方針

* 収集部分は **Manifest + Runner** の二層で拡張
* MVPは「プラグインをWorkers内（またはNode実行）に同梱」でも良いが、将来の追加を見据え、IFを固定する

## 6.2 プラグインの責務

* 入力：キーワード、期間、接続設定（トークン等）
* 出力：Raw（任意）および共通イベント（必須）

## 6.3 Manifest（例：概念）

* `id`, `name`, `version`
* `triggers`: `poll` / `webhook` / `push`
* `config_schema`: 必要な設定項目（トークン、対象チャンネル等）
* `capabilities`: レート制限情報、ページング方式など
* `output`: 生成するイベントタイプ（`mention`, `signup`, `repo_star` 等）

## 6.4 Runner（共通実行基盤）

* 冪等実行（idempotency key）
* リトライ、レート制御
* ログ/メトリクス出力（Sentry連携）
* シークレットの安全な受け渡し

## 7. 共通イベントスキーマ（MVP）

## 7.1 Event（正規化後）

* `event_id`（UUID）
* `tenant_id`（OSSは `default` 固定）
* `source`（例：x, slack, github, ga）
* `event_type`（例：mention, message, click, signup）
* `keyword_id`（どのキーワードにヒットしたか）
* `occurred_at`（発生時刻）
* `actor_ref`（source側のユーザー参照：`source_user_id`等）
* `payload_ref`（オブジェクトストレージ参照）
* `dedupe_key`（冪等キー：source+native_id等）

## 7.2 Identity（統合後の人物）

* `identity_id`（UUID）
* `display_name`（任意）
* `created_at`

## 7.3 Identity Link（ソースID→統合ID）

* `source`
* `source_user_id`
* `identity_id`
* `confidence`（0.0–1.0）
* `link_type`（manual / rule）
* `evidence`（任意：根拠メモ）
* `created_at`

## 8. キュー設計（MVP）

## 8.1 Queue種別（SaaS）

* `ingest`：外部API取得/Webhook受信の後段処理
* `normalize`：共通スキーマ化
* `identity`：統合処理
* `aggregate`：集計更新
* （任意）`report`：レポート生成

MVPは **`ingest` と `aggregate` の2段**から開始し、伸ばす。

## 8.2 メッセージ基本形

* `job_id`
* `tenant_id`
* `plugin_id`
* `trigger`（poll/webhook/push）
* `time_range`（poll時）
* `keyword_ids`
* `attempt`
* `idempotency_key`

## 9. API設計（MVP）

APIサーバ：Hono（Workers）

### 管理系

* `POST /keywords` `GET /keywords`
* `POST /connectors` `GET /connectors`（コネクタ設定）
* `POST /identity-links`（手動リンク）
* `POST /jobs/ingest`（手動収集トリガ）

### 参照系

* `GET /metrics?from=&to=&keyword_id=`（集計結果）
* `GET /events?from=&to=&keyword_id=`（必要なら）

### Ingest入口

* `POST /webhooks/{plugin_id}`（署名検証）
* `POST /push/{plugin_id}`（APIキー/署名）

## 10. デプロイ構成

## 10.1 OSS/開発（docker-compose）

目的：ローカルでMVP検証とプラグイン開発を完結

* `api`（HonoをNodeで実行 or Workersローカル実行のラッパ）
* `worker`（ingest/aggregate：プロセス分割でも単体でも可）
* `postgres`
* `object-storage`（MinIO等）
* `queue`（ローカル代替：Redis/RabbitMQ もしくは in-memory）
* `sentry`（任意。開発は無効でも可）

補足：

* Cloudflare依存をローカルで寄せたい場合、**Miniflare（Wrangler dev）でWorkers/R2/Queues相当を再現**し、DBのみdockerのPostgresにする構成が適合。

## 10.2 SaaS（Cloudflare）

* `api-worker`（Hono）
* `queue-consumers`（Workers）
* `R2`
* `Cloudflare Queues`
* `Supabase Postgres`
* `Sentry`

## 11. セキュリティ・運用（MVPの最低限）

* Push/Webhookは署名検証またはAPIキー必須
* コネクタトークンはSecrets管理（OSSはenv、SaaSはCFのSecrets）
* 冪等性：`dedupe_key` による重複排除
* レート制限：プラグインが宣言する制限値に基づきワーカー側で制御
* 失敗時：リトライ（attempt上限）＋DLQ相当（SaaSはQueues運用に合わせる）

## 12. 実装ロードマップ（短期）

### Phase 0（1–2週間想定のMVP）

* キーワード管理
* 収集プラグイン2種（poll + webhook）
* Event正規化（DB格納、Rawはストレージ）
* 手動IDリンク
* 集計（keyword×dayの件数）
* React UIで表示

### Phase 1（拡張）

* キュー段数を増やして責務分離（normalize/identity/aggregate）
* ルールベースID統合を拡充
* 競合比較ビュー強化

### Phase 2（SaaS差別化）

* 確率ベース統合、レポート自動生成、公式プラグイン群

## 13. 主要な設計判断（要点）

* **tenant_idは保持**（OSSはdefault固定）＝将来SaaS化の移行コスト最小化
* **プラグインはManifestで宣言し、Runnerで実行**＝拡張容易、SaaSでの公式管理も可能
* **Rawを必ず保存**＝再計算・検証・監査に耐える
* **集計テーブル分離**＝指標追加/変更に強い
