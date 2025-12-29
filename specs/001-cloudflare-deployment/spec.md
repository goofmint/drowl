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

- **APIリクエストの失敗**: app.drowl.dev から api.drowl.dev へのリクエストが失敗した場合、ユーザーにエラーメッセージを表示し、リトライオプションを提供する必要がある。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはdrowl.devドメインでlandingアプリケーション（マーケティングサイト）を配信しなければならない
- **FR-002**: システムはapi.drowl.devドメインでAPIアプリケーション（Control Plane）を配信しなければならない
- **FR-003**: システムはapp.drowl.devドメインでuiアプリケーション（Dashboard）を配信しなければならない
- **FR-004**: システムはworker.drowl.devドメインでworkerアプリケーション（Data Plane）を配信しなければならない
- **FR-007**: app.drowl.devからapi.drowl.devへのCORSリクエストが正常に処理されなければならない
- **FR-008**: 各アプリケーションは独立してデプロイ可能でなければならない（ブルーグリーンまたはローリングアップデート）
- **FR-010**: システムは環境変数を通じてドメイン設定を管理しなければならない（ハードコーディングの回避）
- **FR-012**: Cloudflareのキャッシュポリシーは静的アセット（landing、ui）に対して最適化され、動的コンテンツ（api、worker）はキャッシュされないようにしなければならない

### Key Entities

- **Domain**: drowl.dev（ルートドメイン）および4つのサブドメイン（landing, api, app, worker）を表す。各ドメインは特定のアプリケーションにマッピングされる。
- **Application**: landing（Astro静的サイト）、api（Hono on Cloudflare Workers）、ui（React SPA）、worker（バックグラウンドジョブプロセッサー）の4つのアプリケーション。各アプリケーションは独立したデプロイメントユニット。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ユーザーが https://drowl.dev にアクセスすると、2秒以内にlandingページが完全にロードされる
- **SC-002**: ユーザーが https://app.drowl.dev にアクセスすると、3秒以内にダッシュボードが操作可能な状態になる
- **SC-003**: api.drowl.dev のヘルスチェックエンドポイントが99.9%の稼働率を達成する
- **SC-004**: app.drowl.dev から api.drowl.dev へのAPIリクエストの95%が500ms以内に完了する
- **SC-005**: デプロイメント設定が完了し、各サブドメインで対応するアプリケーションが正常にアクセス可能である
