# Tasks: Cloudflare Deployment Configuration

**Input**: Design documents from `/specs/001-cloudflare-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: このフィーチャーはデプロイメント設定であり、テストタスクは含まれていません。検証は手動のヘルスチェックとブラウザアクセスで実施します。

**Organization**: タスクはUser Storyごとに整理され、各ストーリーを独立して実装・検証可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するUser Story（US1, US2, US3, US4）
- ファイルパスを含む明確な説明

## Path Conventions

drowlリポジトリのルート構造：
- `apps/landing/` - Astroマーケティングサイト
- `apps/ui/` - Reactダッシュボード
- `apps/api/` - Hono Control Plane
- `apps/worker/` - Data Plane
- `.github/workflows/` - GitHub Actions
- `README.md` - プロジェクトルート

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Cloudflareデプロイメントに必要なツールと基本設定

- [ ] T001 Install wrangler CLI globally with `pnpm add -g wrangler`
- [ ] T002 Authenticate with Cloudflare using `wrangler login`
- [ ] T003 [P] Add `.dev.vars` to `.gitignore` for all apps
- [ ] T004 [P] Create `.dev.vars.example` in apps/api/ with placeholder environment variables
- [ ] T005 [P] Create `.dev.vars.example` in apps/worker/ with placeholder environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 各アプリケーションのwrangler.toml設定とGitHub Actions CI/CDワークフロー

**⚠️ CRITICAL**: このフェーズが完了するまで、User Storyの実装を開始できません

- [ ] T006 [P] Create apps/api/wrangler.toml with production and development environments per research.md
- [ ] T007 [P] Create apps/worker/wrangler.toml with production and development environments per research.md
- [ ] T008 Create .github/workflows/deploy-cloudflare.yml with matrix strategy for 4 apps per research.md
- [ ] T009 [P] Add GitHub Secrets documentation to README.md (CLOUDFLARE_API_TOKEN, DATABASE_URL, REDIS_URL, S3_*)
- [ ] T010 Verify wrangler.toml syntax with `wrangler validate` for apps/api
- [ ] T011 Verify wrangler.toml syntax with `wrangler validate` for apps/worker

**Checkpoint**: 基盤設定完了 - User Story実装を並列開始可能

---

## Phase 3: User Story 1 - Access Landing Page (Priority: P1) 🎯 MVP

**Goal**: drowl.devでlandingアプリケーション（Astroマーケティングサイト）を配信

**Independent Test**: ブラウザで https://drowl.dev にアクセスし、landingアプリケーションのコンテンツが正常に表示されることを確認

### Implementation for User Story 1

- [ ] T012 [US1] Build landing app with `cd apps/landing && pnpm build`
- [ ] T013 [US1] Deploy landing to Cloudflare Pages with `wrangler pages deploy apps/landing/dist --project-name=drowl-landing`
- [ ] T014 [US1] Configure custom domain "drowl.dev" in Cloudflare Dashboard → Pages → drowl-landing → Custom domains
- [ ] T015 [US1] Verify deployment by accessing https://drowl.dev in browser
- [ ] T016 [US1] Test mobile responsiveness by accessing https://drowl.dev on mobile device
- [ ] T017 [US1] Verify HTTPS redirect by accessing http://drowl.dev and confirming redirect to https://

**Checkpoint**: User Story 1完了 - drowl.devでlandingページが正常に配信されている

---

## Phase 4: User Story 2 - Access Dashboard Application (Priority: P1)

**Goal**: app.drowl.devでuiアプリケーション（Reactダッシュボード）を配信

**Independent Test**: ブラウザで https://app.drowl.dev にアクセスし、uiアプリケーションのダッシュボードが正常に表示され、インタラクティブに操作できることを確認

### Implementation for User Story 2

- [ ] T018 [US2] Build ui app with `cd apps/ui && pnpm build`
- [ ] T019 [US2] Deploy ui to Cloudflare Pages with `wrangler pages deploy apps/ui/dist --project-name=drowl-ui`
- [ ] T020 [US2] Configure custom domain "app.drowl.dev" in Cloudflare Dashboard → Pages → drowl-ui → Custom domains
- [ ] T021 [US2] Verify deployment by accessing https://app.drowl.dev in browser
- [ ] T022 [US2] Test dashboard interactivity by clicking UI elements and verifying responses
- [ ] T023 [US2] Verify API endpoint configuration by checking browser network tab for requests to api.drowl.dev

**Checkpoint**: User Story 2完了 - app.drowl.devでダッシュボードが正常に配信されている

---

## Phase 5: User Story 3 - API Access for Dashboard (Priority: P1)

**Goal**: api.drowl.devでAPIアプリケーション（Hono Control Plane）を配信し、ダッシュボードからのCORSリクエストを処理

**Independent Test**: curlまたはPostmanで https://api.drowl.dev/health にリクエストを送信し、正常なレスポンスが返ることを確認。ダッシュボードからのCORSリクエストが正常に処理されることを確認

### Implementation for User Story 3

- [ ] T024 [US3] Create apps/api/.dev.vars for local development with DATABASE_URL, REDIS_URL, S3_* variables
- [ ] T025 [US3] Test API locally with `cd apps/api && wrangler dev --env development`
- [ ] T026 [US3] Set production secrets with `wrangler secret put DATABASE_URL --env production` in apps/api/
- [ ] T027 [US3] Set production secrets with `wrangler secret put REDIS_URL --env production` in apps/api/
- [ ] T028 [US3] Set production secrets with `wrangler secret put S3_ENDPOINT --env production` in apps/api/
- [ ] T029 [US3] Set production secrets with `wrangler secret put S3_ACCESS_KEY --env production` in apps/api/
- [ ] T030 [US3] Set production secrets with `wrangler secret put S3_SECRET_KEY --env production` in apps/api/
- [ ] T031 [US3] Set production secrets with `wrangler secret put S3_BUCKET --env production` in apps/api/
- [ ] T032 [US3] Deploy API to Cloudflare Workers with `cd apps/api && wrangler deploy --env production`
- [ ] T033 [US3] Verify API deployment by accessing https://api.drowl.dev/health with curl
- [ ] T034 [US3] Test CORS from app.drowl.dev by making API request from dashboard and verifying response headers
- [ ] T035 [US3] Verify DNS routing by checking wrangler.toml routes configuration for api.drowl.dev/*

**Checkpoint**: User Story 3完了 - api.drowl.devでAPIが正常に動作し、CORSリクエストを処理している

---

## Phase 6: User Story 4 - Background Worker Processing (Priority: P2)

**Goal**: worker.drowl.devでworkerアプリケーション（Data Plane）を配信し、非同期ジョブを実行

**Independent Test**: worker.drowl.dev/health でヘルスチェックが正常に応答することを確認。ジョブキューにタスクを投入し、workerが処理してデータベースに結果を保存することを確認

### Implementation for User Story 4

- [ ] T036 [US4] Create apps/worker/.dev.vars for local development with DATABASE_URL, REDIS_URL, S3_* variables
- [ ] T037 [US4] Test worker locally with `cd apps/worker && wrangler dev --env development`
- [ ] T038 [US4] Set production secrets with `wrangler secret put DATABASE_URL --env production` in apps/worker/
- [ ] T039 [US4] Set production secrets with `wrangler secret put REDIS_URL --env production` in apps/worker/
- [ ] T040 [US4] Set production secrets with `wrangler secret put S3_ENDPOINT --env production` in apps/worker/
- [ ] T041 [US4] Set production secrets with `wrangler secret put S3_ACCESS_KEY --env production` in apps/worker/
- [ ] T042 [US4] Set production secrets with `wrangler secret put S3_SECRET_KEY --env production` in apps/worker/
- [ ] T043 [US4] Set production secrets with `wrangler secret put S3_BUCKET --env production` in apps/worker/
- [ ] T044 [US4] Deploy worker to Cloudflare Workers with `cd apps/worker && wrangler deploy --env production`
- [ ] T045 [US4] Verify worker deployment by accessing https://worker.drowl.dev/health with curl
- [ ] T046 [US4] Verify DNS routing by checking wrangler.toml routes configuration for worker.drowl.dev/*

**Checkpoint**: User Story 4完了 - worker.drowl.devでworkerが正常に動作している

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: すべてのUser Storyに影響する改善とドキュメント化

- [ ] T047 [P] Update README.md with deployment section per quickstart.md
- [ ] T048 [P] Add troubleshooting section to README.md with common issues from quickstart.md
- [ ] T049 Set up GitHub Secrets (CLOUDFLARE_API_TOKEN, DATABASE_URL, REDIS_URL, S3_*) in repository settings
- [ ] T050 Test GitHub Actions workflow by pushing to main branch and verifying deployment
- [ ] T051 [P] Verify all health endpoints with curl script in .github/workflows/deploy-cloudflare.yml
- [ ] T052 [P] Document rollback procedure in README.md for reverting deployments
- [ ] T053 Monitor Cloudflare dashboard for deployment status and errors
- [ ] T054 Run full quickstart.md validation from scratch on clean environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupフェーズ完了に依存 - すべてのUser Storyをブロック
- **User Stories (Phase 3-6)**: Foundationalフェーズ完了に依存
  - User Storyは並列実行可能（スタッフがいる場合）
  - または優先度順に順次実行（P1 → P2）
- **Polish (Phase 7)**: すべてのUser Story完了に依存

### User Story Dependencies

- **User Story 1 (P1 - Landing)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P1 - Dashboard)**: Foundational完了後に開始可能 - US3（API）と統合するが独立してテスト可能
- **User Story 3 (P1 - API)**: Foundational完了後に開始可能 - US2（Dashboard）から呼び出されるが独立してテスト可能
- **User Story 4 (P2 - Worker)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし

### Within Each User Story

- ローカルテスト → 本番シークレット設定 → デプロイ → 検証の順序
- カスタムドメイン設定はデプロイ後に実施
- CORS/DNS検証はデプロイとカスタムドメイン設定後に実施

### Parallel Opportunities

- **Phase 1**: すべてのタスク（T001-T005）は[P]マークで並列実行可能
- **Phase 2**: T006, T007, T009は並列実行可能（異なるファイル）
- **Phase 3-6**: すべてのUser Storyは並列実行可能（チーム容量がある場合）
- **Phase 7**: T047, T048, T051, T052は並列実行可能（異なるファイル）

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 3つのwrangler.toml設定を同時に作成:
Task: "Create apps/api/wrangler.toml"
Task: "Create apps/worker/wrangler.toml"
Task: "Add GitHub Secrets documentation to README.md"
```

## Parallel Example: User Story 3 (API Deployment)

```bash
# 本番シークレット設定を同時に実行:
Task: "wrangler secret put DATABASE_URL --env production"
Task: "wrangler secret put REDIS_URL --env production"
Task: "wrangler secret put S3_ENDPOINT --env production"
Task: "wrangler secret put S3_ACCESS_KEY --env production"
Task: "wrangler secret put S3_SECRET_KEY --env production"
Task: "wrangler secret put S3_BUCKET --env production"
```

---

## Implementation Strategy

### MVP First (User Story 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - すべてのストーリーをブロック)
3. Complete Phase 3: User Story 1 (Landing)
4. Complete Phase 4: User Story 2 (Dashboard)
5. Complete Phase 5: User Story 3 (API)
6. **STOP and VALIDATE**: 3つのP1 User Storyを独立してテスト
7. Deploy/demo if ready - これでMVPとして機能

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → Deploy/Demo（Landing配信！）
3. User Story 2追加 → 独立してテスト → Deploy/Demo（Dashboard配信！）
4. User Story 3追加 → 独立してテスト → Deploy/Demo（API連携！）
5. User Story 4追加 → 独立してテスト → Deploy/Demo（Worker処理！）
6. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合：

1. チーム全員でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1 (Landing)
   - Developer B: User Story 2 (Dashboard)
   - Developer C: User Story 3 (API)
   - Developer D: User Story 4 (Worker) ※P2なので低優先度
3. ストーリーが独立して完了・統合

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルはタスクを特定のUser Storyにマッピング（トレーサビリティ）
- 各User Storyは独立して完了・テスト可能であるべき
- 各タスクまたは論理的グループ後にコミット
- 各チェックポイントでストーリーを独立して検証
- 避けるべき：曖昧なタスク、同一ファイルの競合、ストーリーの独立性を壊す依存関係

---

## Summary

- **Total Tasks**: 54タスク
- **Phase 1 (Setup)**: 5タスク
- **Phase 2 (Foundational)**: 6タスク（CRITICAL - すべてのストーリーをブロック）
- **Phase 3 (US1 - Landing)**: 6タスク
- **Phase 4 (US2 - Dashboard)**: 6タスク
- **Phase 5 (US3 - API)**: 12タスク
- **Phase 6 (US4 - Worker)**: 11タスク
- **Phase 7 (Polish)**: 8タスク
- **Parallel Opportunities**: 15タスク（[P]マーク）
- **MVP Scope**: Phase 1-5（User Story 1-3 = Landing + Dashboard + API）
- **Format Validation**: ✅ すべてのタスクがチェックリスト形式（checkbox、ID、ラベル、ファイルパス）に準拠
