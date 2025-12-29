# Feature Specification: Cloudflare Deployment Configuration

**Feature Branch**: `001-cloudflare-deployment`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "Cloudflareにデプロイできる形にして。landing -> drowl.dev, api -> api.drowl.dev, worker -> worker.drowl.dev, ui -> app.drowl.dev"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Landing Page (Priority: P1)

ユーザーが https://drowl.dev にアクセスすると、マーケティングサイト（landing）が表示される。

**Why this priority**: プロダクトの顔となる最も重要なエントリーポイント。訪問者が最初に目にするページであり、ブランドイメージと初期印象を決定する。

**Independent Test**: ブラウザで https://drowl.dev にアクセスし、landingアプリケーションのコンテンツが正常に表示されることを確認できる。

**Acceptance Scenarios**:

1. **Given** ユーザーがブラウザを開いている、**When** https://drowl.dev にアクセスする、**Then** landingアプリケーションのホームページが表示される
2. **Given** ユーザーがモバイルデバイスを使用している、**When** https://drowl.dev にアクセスする、**Then** レスポンシブデザインで最適化されたlandingページが表示される
3. **Given** ユーザーが海外からアクセスしている、**When** https://drowl.dev を開く、**Then** Cloudflareのグローバルネットワークを通じて低レイテンシで配信される

---

### User Story 2 - Access Dashboard Application (Priority: P1)

ユーザーが https://app.drowl.dev にアクセスすると、ダッシュボードアプリケーション（ui）が表示される。

**Why this priority**: プロダクトのコア機能を提供するメインアプリケーション。ユーザーが実際にDevRel ROI分析を行う場所であり、P1のlanding訪問者を変換するための必須エンドポイント。

**Independent Test**: ブラウザで https://app.drowl.dev にアクセスし、uiアプリケーションのダッシュボードが正常に表示され、インタラクティブに操作できることを確認できる。

**Acceptance Scenarios**:

1. **Given** ユーザーがブラウザを開いている、**When** https://app.drowl.dev にアクセスする、**Then** uiアプリケーションのダッシュボードが表示される
2. **Given** ユーザーがダッシュボードを操作している、**When** APIリクエストが発生する、**Then** api.drowl.dev に対して正常にリクエストが送信される
3. **Given** ユーザーがダッシュボードでデータ更新を行う、**When** 保存操作を実行する、**Then** APIを通じてデータが永続化される

---

### User Story 3 - API Access for Dashboard (Priority: P1)

ダッシュボードアプリケーションが https://api.drowl.dev に対してAPIリクエストを送信し、データの取得・更新ができる。

**Why this priority**: uiアプリケーションが動作するために必須のバックエンドAPI。ダッシュボードの全機能がこのAPIに依存しているため、P1として独立してテスト可能である必要がある。

**Independent Test**: curlまたはPostmanで https://api.drowl.dev/health にリクエストを送信し、正常なレスポンスが返ることを確認できる。また、ダッシュボードからのCORSリクエストが正常に処理されることを確認できる。

**Acceptance Scenarios**:

1. **Given** APIエンドポイントがデプロイされている、**When** https://api.drowl.dev/health にGETリクエストを送信する、**Then** ヘルスチェックレスポンスが返される
2. **Given** uiアプリケーションが動作している、**When** ダッシュボードからAPIリクエストを送信する、**Then** CORSヘッダーが正しく設定され、リクエストが成功する
3. **Given** APIがデプロイされている、**When** 認証が必要なエンドポイントにアクセスする、**Then** 適切な認証チェックが実行される

---

### User Story 4 - Background Worker Processing (Priority: P2)

バックグラウンドワーカーが https://worker.drowl.dev で動作し、非同期ジョブ（イベント取り込み、キーワード抽出、分析処理）を実行する。

**Why this priority**: ダッシュボードとAPIが動作すればMVPとして機能するが、本格的なデータ処理にはワーカーが必要。P2として後から追加可能だが、フル機能の提供には必須。

**Independent Test**: ジョブキューにタスクを投入し、worker.drowl.dev がそれを処理してデータベースに結果を保存することを確認できる。また、worker.drowl.dev/health でヘルスチェックが可能。

**Acceptance Scenarios**:

1. **Given** ワーカーがデプロイされている、**When** ジョブがキューに追加される、**Then** ワーカーがジョブを取得して処理を開始する
2. **Given** イベント取り込みジョブが実行される、**When** 外部APIからデータを取得する、**Then** MinIOにrawデータが保存され、PostgreSQLにメタデータが記録される
3. **Given** ワーカーがエラーに遭遇する、**When** リトライ可能なエラーが発生する、**Then** ジョブが再キューイングされる

---

### Edge Cases

- **DNSプロパゲーション中のアクセス**: ドメイン設定変更後、DNS伝播が完了する前にアクセスした場合、一時的に古いIPアドレスまたはエラーページが表示される可能性がある。最大48時間のTTLを考慮する必要がある。
- **Cloudflareダウンタイム**: Cloudflareサービスに障害が発生した場合、すべてのサブドメインにアクセスできなくなる。フォールバック戦略またはステータスページが必要。
- **デプロイ中のダウンタイム**: 新バージョンのデプロイ中、一時的にサービスが利用できなくなる可能性がある。ブルーグリーンデプロイまたはローリングアップデートでダウンタイムを最小化する必要がある。
- **APIリクエストの失敗**: app.drowl.dev から api.drowl.dev へのリクエストが失敗した場合、ユーザーにエラーメッセージを表示し、リトライオプションを提供する必要がある。
- **大量トラフィック**: 予期しないトラフィックスパイク時、Cloudflareのレート制限またはDDoS保護が発動する可能性がある。適切なレート制限ポリシーとキャッシュ戦略が必要。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはdrowl.devドメインでlandingアプリケーション（マーケティングサイト）を配信しなければならない
- **FR-002**: システムはapi.drowl.devドメインでAPIアプリケーション（Control Plane）を配信しなければならない
- **FR-003**: システムはapp.drowl.devドメインでuiアプリケーション（Dashboard）を配信しなければならない
- **FR-004**: システムはworker.drowl.devドメインでworkerアプリケーション（Data Plane）を配信しなければならない
- **FR-005**: すべてのドメインはHTTPSで保護され、有効なSSL/TLS証明書を使用しなければならない
- **FR-006**: HTTPリクエストは自動的にHTTPSへリダイレクトされなければならない
- **FR-007**: app.drowl.devからapi.drowl.devへのCORSリクエストが正常に処理されなければならない
- **FR-008**: 各アプリケーションは独立してデプロイ可能でなければならない（ブルーグリーンまたはローリングアップデート）
- **FR-009**: DNSレコードは各サブドメインを正しいCloudflareエンドポイントにルーティングしなければならない
- **FR-010**: システムは環境変数を通じてドメイン設定を管理しなければならない（ハードコーディングの回避）
- **FR-011**: 各アプリケーションはヘルスチェックエンドポイント（/health）を提供し、デプロイ後の検証を可能にしなければならない
- **FR-012**: Cloudflareのキャッシュポリシーは静的アセット（landing、ui）に対して最適化され、動的コンテンツ（api、worker）はキャッシュされないようにしなければならない

### Key Entities

- **Domain**: drowl.dev（ルートドメイン）および4つのサブドメイン（landing, api, app, worker）を表す。各ドメインは特定のアプリケーションにマッピングされる。
- **Application**: landing（Astro静的サイト）、api（Hono on Cloudflare Workers）、ui（React SPA）、worker（バックグラウンドジョブプロセッサー）の4つのアプリケーション。各アプリケーションは独立したデプロイメントユニット。
- **SSL Certificate**: Cloudflareが管理するSSL/TLS証明書。各ドメインに対して自動発行・更新される。
- **DNS Record**: 各サブドメインをCloudflareのエッジネットワークにルーティングするためのAレコードまたはCNAMEレコード。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ユーザーが https://drowl.dev にアクセスすると、2秒以内にlandingページが完全にロードされる
- **SC-002**: ユーザーが https://app.drowl.dev にアクセスすると、3秒以内にダッシュボードが操作可能な状態になる
- **SC-003**: api.drowl.dev のヘルスチェックエンドポイントが99.9%の稼働率を達成する
- **SC-004**: app.drowl.dev から api.drowl.dev へのAPIリクエストの95%が500ms以内に完了する
- **SC-005**: デプロイメント設定が完了し、各サブドメインで対応するアプリケーションが正常にアクセス可能である

## Assumptions

1. **Cloudflareアカウント**: 既にCloudflareアカウントが存在し、drowl.devドメインがCloudflareで管理されていると仮定
2. **ドメイン所有権**: drowl.devドメインの所有権を持ち、ネームサーバーをCloudflareに変更する権限があると仮定
3. **Cloudflare Workersプラン**: api.drowl.devとworker.drowl.devをCloudflare Workers上で動作させるため、適切なCloudflare Workers有料プランに加入していると仮定
4. **Cloudflare Pagesプラン**: landing（Astro）とui（React SPA）をCloudflare Pagesでホストするため、Cloudflare Pagesの利用が可能であると仮定
5. **環境変数管理**: Cloudflare Workers/Pagesのダッシュボードまたはwrangler CLIを通じて環境変数を設定できると仮定
6. **CI/CD統合**: GitHubリポジトリとCloudflareの連携が設定され、mainブランチへのプッシュで自動デプロイされると仮定
7. **データベース接続**: apiとworkerはCloudflare Workersから外部PostgreSQL/Redis/MinIOに接続するため、接続可能なネットワーク構成であると仮定
8. **CORS設定**: api.drowl.devはapp.drowl.devからのCORSリクエストを許可するよう設定されると仮定

## Out of Scope

- **カスタムメール設定**: @drowl.dev メールアドレスの設定は本フィーチャーの範囲外
- **CDN以外のCloudflare機能**: WAF、Rate Limiting、Bot Managementなどの高度なCloudflare機能の詳細設定は範囲外
- **バックエンドインフラのCloudflare移行**: PostgreSQL、Redis、MinIOをCloudflareサービス（D1、R2、KVなど）に移行することは範囲外。既存のDockerベースインフラを維持
- **ドメイン購入**: drowl.devドメインが既に購入済みであることを前提とし、新規購入は範囲外
- **マルチリージョンデプロイ**: 特定リージョンへのデプロイメント制限や複数リージョンへの明示的な配置は範囲外（Cloudflareのグローバルネットワークに依存）
