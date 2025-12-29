# Feature Specification: Project Setup & Initial Structure

**Feature Branch**: `001-project-setup`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "この構成で進めましょう"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Environment Setup (Priority: P1)

開発者がローカル環境でdrowlプロジェクトを立ち上げ、開発を開始できる。

**Why this priority**: 開発を始めるための最低限の基盤。これがなければ何も始まらない。

**Independent Test**: `git clone` → `pnpm install` → `docker-compose up` を実行して、APIとUIがローカルで起動することを確認できる。

Dockerではnginxリバースプロキシを使用し、`https://drowl.test`でUIにアクセスできることを確認できる。

**Acceptance Scenarios**:

1. **Given** リポジトリをクローンした状態、**When** `pnpm install`を実行、**Then** すべての依存関係がインストールされる
2. **Given** 依存関係がインストールされた状態、**When** `docker-compose up`を実行、**Then** Postgres・MinIO・Redisが起動する
3. **Given** インフラが起動した状態、**When** `pnpm dev`を実行、**Then** API・Worker・UIが起動し、ブラウザで`https://drowl.test` でアクセスできる

---

### User Story 2 - Monorepo Structure Navigation (Priority: P2)

開発者がモノレポの構造を理解し、新しいプラグインや機能を追加する場所を特定できる。

**Why this priority**: プロジェクト構造が明確でないと、コードの配置場所を間違えたり、重複したコードを書いたりする。

**Independent Test**: README.mdを読んで、「Webhookプラグインを追加したい」という要求に対して`plugins/`ディレクトリが適切であることを判断できる。

**Acceptance Scenarios**:

1. **Given** プロジェクトルートのREADME.mdを開いた状態、**When** フォルダ構成セクションを読む、**Then** `apps/`, `packages/`, `plugins/`, `infra/`の役割を理解できる
2. **Given** 新しいプラグインを追加したい状況、**When** `plugins/`ディレクトリのREADMEを参照、**Then** プラグインの作成手順とテンプレートが記載されている
3. **Given** 共通型定義を変更したい状況、**When** `packages/core/`を探索、**Then** Event・Identity・Keywordの型定義が見つかる

---

### User Story 3 - Code Quality Gates (Priority: P3)

開発者がコミット前にLint・型チェックを実行し、品質基準を満たすコードのみをコミットできる。

**Why this priority**: 憲章の「Quality Gates」に準拠するため。早期に品質問題を検出することで、レビューコストを削減。

**Independent Test**: 意図的に型エラーを含むコードを書いて`pnpm lint`を実行し、エラーが検出されることを確認できる。

**Acceptance Scenarios**:

1. **Given** TypeScriptコードに型エラーがある状態、**When** `pnpm typecheck`を実行、**Then** エラーが表示されビルドが失敗する
2. **Given** ESLintルールに違反するコードがある状態、**When** `pnpm lint`を実行、**Then** 違反箇所が表示される
3. **Given** すべてのチェックがパスした状態、**When** `git commit`を実行、**Then** pre-commitフックが通過しコミットが成功する

---

### Edge Cases

- モノレポのワークスペース依存関係が循環している場合、ビルドが失敗するか？
- Docker環境でポート競合が発生した場合、エラーメッセージは明確か？
- `pnpm install`中にネットワークエラーが発生した場合、リトライ可能か？
- 既存の`.env`ファイルがない場合、デフォルト値で起動できるか？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはpnpm workspacesを使用したモノレポ構成でなければならない
- **FR-002**: システムはTypeScriptで記述され、型定義は`packages/core`で一元管理されなければならない
- **FR-003**: ローカル開発環境はdocker-composeで完結し、Postgres・MinIO・Redisを含まなければならない
- **FR-004**: すべてのアプリ（api・worker・ui・landing）は独立したpackage.jsonを持ち、個別に起動可能でなければならない
- **FR-005**: Lint（ESLint）・型チェック（tsc）・フォーマット（Prettier）が設定されていなければならない
- **FR-006**: プロジェクトルートに包括的なREADME.mdがあり、フォルダ構成・セットアップ手順・開発コマンドが記載されていなければならない
- **FR-007**: 各主要ディレクトリ（apps/api, apps/worker, apps/ui, apps/landing, packages/core, plugins/）にREADME.mdがあり、責務と使い方が記載されていなければならない
- **FR-008**: .gitignoreが設定され、node_modules・dist・.env・OSS固有ファイルが除外されていなければならない
- **FR-009**: 憲章で定義された共通イベントスキーマ（Event・Identity・IdentityLink）の型定義が`packages/core/src/types`に存在しなければならない
- **FR-010**: プラグインSDK（`packages/plugin-sdk`）が基底クラスとManifest型定義を提供しなければならない

### Key Entities

- **Workspace**: モノレポ内の個別パッケージ（apps/*, packages/*）。pnpm workspacesで管理される
- **Application**: デプロイ可能な実行単位（api, worker, ui, landing）
- **Shared Package**: 複数アプリで共有されるライブラリ（core, plugin-sdk, db）
- **Infrastructure Configuration**: docker-compose.yml、wrangler.toml等のインフラ定義ファイル
- **Type Definition**: 共通イベントスキーマ（Event, Identity, Keyword, Job）のTypeScript型定義

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 開発者が`git clone`から`docker-compose up && pnpm dev`でローカル環境を起動するまで5分以内に完了できる
- **SC-002**: すべてのディレクトリにREADME.mdが配置され、迷わず目的のファイルを特定できる（新規開発者のオンボーディング時間を50%削減）
- **SC-003**: `pnpm lint`・`pnpm typecheck`が全ワークスペースで実行され、エラーがゼロで完了する
- **SC-004**: 憲章で定義された7つのコア原則のうち、Principle I「OSS-First Architecture」がdocker-compose.ymlの存在により検証可能である
- **SC-005**: 型定義（Event, Identity, Keyword）が`packages/core`で定義され、apps/api, apps/workerから参照可能である（型の一元管理が機能している）

## Assumptions

- Node.js 20.x以上、pnpm 9.x以上がローカルにインストールされている
- Dockerがインストールされており、`docker-compose`コマンドが利用可能
- 開発者は基本的なGit操作（clone, commit, branch）を理解している
- LPページ（apps/landing）はAstroを使用する（静的サイト生成に最適なため）
- プロダクトUI（apps/ui）はReact + Viteを使用する（SPA開発の標準スタック）
- API・WorkerはHonoフレームワークを使用する（Cloudflare Workers互換性のため）
- データベーススキーマはマイグレーションツール（Drizzle）を導入する
- package.jsonのライブラリ追加や更新は常にpnpmを使用する（直接バージョンを指定しない）
