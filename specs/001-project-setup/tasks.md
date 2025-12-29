# Tasks: Project Setup & Initial Structure

**Input**: Design documents from `/specs/001-project-setup/`
**Prerequisites**: spec.md (user stories with priorities P1, P2, P3)

**Tests**: Not requested in the feature specification - tests are excluded from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/`, `packages/`, `plugins/`, `infra/` at repository root
- Apps: `apps/api/`, `apps/worker/`, `apps/ui/`, `apps/landing/`
- Packages: `packages/core/`, `packages/plugin-sdk/`, `packages/db/`
- Infrastructure: `infra/docker/`, `infra/cloudflare/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create monorepo directory structure (apps/, packages/, plugins/, infra/)
- [X] T002 Initialize pnpm workspace configuration in pnpm-workspace.yaml
- [X] T003 Create root package.json with workspace scripts (dev, lint, typecheck, format)
- [X] T004 Create root tsconfig.json with shared TypeScript configuration
- [X] T005 Create .gitignore excluding node_modules, dist, .env, OS files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Create packages/core/package.json with TypeScript and Zod dependencies
- [ ] T007 [P] Define Event type in packages/core/src/types/event.ts
- [ ] T008 [P] Define Identity type in packages/core/src/types/identity.ts
- [ ] T009 [P] Define IdentityLink type in packages/core/src/types/identity.ts
- [ ] T010 [P] Define Keyword type in packages/core/src/types/keyword.ts
- [ ] T011 [P] Define Job type in packages/core/src/types/job.ts
- [ ] T012 [P] Create packages/core/src/index.ts exporting all types
- [ ] T013 [P] Create packages/plugin-sdk/package.json referencing @drowl/core
- [ ] T014 [P] Define PluginManifest type in packages/plugin-sdk/src/types/manifest.ts
- [ ] T015 [P] Create BasePlugin abstract class in packages/plugin-sdk/src/base-plugin.ts
- [ ] T016 [P] Create packages/plugin-sdk/src/index.ts exporting SDK components
- [ ] T017 Create packages/db/migrations/001_initial.sql with basic schema
- [ ] T018 Create packages/db/package.json with migration tooling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Environment Setup (Priority: P1) 🎯 MVP

**Goal**: 開発者がローカル環境でdrowlプロジェクトを立ち上げ、開発を開始できる

**Independent Test**: `git clone` → `pnpm install` → `docker-compose up` → `pnpm dev` を実行して、`https://drowl.test`でUIにアクセスできることを確認

### Docker Infrastructure for User Story 1

- [ ] T019 [P] [US1] Create infra/docker/docker-compose.yml with postgres, minio, redis services
- [ ] T020 [P] [US1] Create infra/docker/postgres/init.sql with database initialization
- [ ] T021 [P] [US1] Create infra/docker/.env.example with default environment variables
- [ ] T022 [P] [US1] Create infra/docker/nginx/nginx.conf with reverse proxy for drowl.test
- [ ] T023 [P] [US1] Create infra/docker/nginx/certs/generate-certs.sh for local HTTPS

### Apps Setup for User Story 1

- [ ] T024 [P] [US1] Initialize apps/api/package.json with Hono and dependencies
- [ ] T025 [P] [US1] Create apps/api/src/index.ts with basic Hono server
- [ ] T026 [P] [US1] Create apps/api/tsconfig.json referencing root tsconfig
- [ ] T027 [P] [US1] Initialize apps/worker/package.json with Hono and dependencies
- [ ] T028 [P] [US1] Create apps/worker/src/index.ts with worker entry point
- [ ] T029 [P] [US1] Create apps/worker/tsconfig.json referencing root tsconfig
- [ ] T030 [P] [US1] Initialize apps/ui/package.json with React, Vite, and dependencies
- [ ] T031 [P] [US1] Create apps/ui/src/App.tsx with basic React component
- [ ] T032 [P] [US1] Create apps/ui/vite.config.ts with dev server configuration
- [ ] T033 [P] [US1] Create apps/ui/tsconfig.json referencing root tsconfig
- [ ] T034 [P] [US1] Initialize apps/landing/package.json with Astro and dependencies
- [ ] T035 [P] [US1] Create apps/landing/src/pages/index.astro with landing page
- [ ] T036 [P] [US1] Create apps/landing/astro.config.mjs with configuration
- [ ] T037 [P] [US1] Create apps/landing/tsconfig.json referencing root tsconfig

### Workspace Scripts for User Story 1

- [ ] T038 [US1] Add pnpm dev script to root package.json (runs all apps concurrently)
- [ ] T039 [US1] Add pnpm dev:api, dev:worker, dev:ui, dev:landing scripts
- [ ] T040 [US1] Verify pnpm install completes successfully across all workspaces
- [ ] T041 [US1] Verify docker-compose up starts all services without errors
- [ ] T042 [US1] Verify pnpm dev starts API on port 3001, UI on port 3000, Worker
- [ ] T043 [US1] Verify https://drowl.test resolves via nginx reverse proxy (requires /etc/hosts entry)

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can clone, install, and run the local environment

---

## Phase 4: User Story 2 - Monorepo Structure Navigation (Priority: P2)

**Goal**: 開発者がモノレポの構造を理解し、新しいプラグインや機能を追加する場所を特定できる

**Independent Test**: README.mdを読んで、「Webhookプラグインを追加したい」という要求に対して`plugins/`ディレクトリが適切であることを判断できる

### Root Documentation for User Story 2

- [ ] T044 [US2] Create README.md with project overview and folder structure section
- [ ] T045 [US2] Add setup instructions to README.md (Node.js, pnpm, Docker prerequisites)
- [ ] T046 [US2] Add development commands to README.md (pnpm dev, lint, typecheck, format)
- [ ] T047 [US2] Add folder structure diagram to README.md explaining apps/, packages/, plugins/, infra/

### Directory-Specific Documentation for User Story 2

- [ ] T048 [P] [US2] Create apps/api/README.md explaining Control Plane API responsibilities
- [ ] T049 [P] [US2] Create apps/worker/README.md explaining Data Plane Worker responsibilities
- [ ] T050 [P] [US2] Create apps/ui/README.md explaining product dashboard responsibilities
- [ ] T051 [P] [US2] Create apps/landing/README.md explaining LP/marketing site responsibilities
- [ ] T052 [P] [US2] Create packages/core/README.md explaining shared types and schemas
- [ ] T053 [P] [US2] Create packages/plugin-sdk/README.md with plugin development guide
- [ ] T054 [P] [US2] Create plugins/README.md with plugin creation instructions and template

### Type Definition Discovery for User Story 2

- [ ] T055 [US2] Verify packages/core/src/types/event.ts is discoverable via IDE navigation
- [ ] T056 [US2] Verify packages/core/src/types/identity.ts is discoverable via IDE navigation
- [ ] T057 [US2] Verify packages/core/src/types/keyword.ts is discoverable via IDE navigation
- [ ] T058 [US2] Add inline JSDoc comments to all type definitions for better IDE hints

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - developers can navigate the monorepo structure

---

## Phase 5: User Story 3 - Code Quality Gates (Priority: P3)

**Goal**: 開発者がコミット前にLint・型チェック・フォーマットを実行し、品質基準を満たすコードのみをコミットできる

**Independent Test**: 意図的に型エラーを含むコードを書いて`pnpm lint`を実行し、エラーが検出されることを確認できる

### ESLint Configuration for User Story 3

- [ ] T059 [P] [US3] Create root .eslintrc.json with TypeScript ESLint rules
- [ ] T060 [P] [US3] Add eslint dependencies to root package.json
- [ ] T061 [P] [US3] Create .eslintignore excluding node_modules, dist, .astro
- [ ] T062 [US3] Add pnpm lint script to root package.json running ESLint across workspaces
- [ ] T063 [US3] Add pnpm lint:fix script to root package.json with --fix flag

### TypeScript Configuration for User Story 3

- [ ] T064 [US3] Add pnpm typecheck script to root package.json running tsc --noEmit
- [ ] T065 [US3] Verify typecheck runs across all workspaces (apps/*, packages/*)
- [ ] T066 [US3] Add composite: true to tsconfig.json for project references

### Prettier Configuration for User Story 3

- [ ] T067 [P] [US3] Create root .prettierrc.json with formatting rules
- [ ] T068 [P] [US3] Add prettier dependencies to root package.json
- [ ] T069 [P] [US3] Create .prettierignore excluding node_modules, dist, pnpm-lock.yaml
- [ ] T070 [US3] Add pnpm format script to root package.json running Prettier --write
- [ ] T071 [US3] Add pnpm format:check script to root package.json running Prettier --check

### Pre-commit Hook for User Story 3

- [ ] T072 [US3] Add husky dependency to root package.json
- [ ] T073 [US3] Initialize husky with pnpm exec husky install
- [ ] T074 [US3] Create .husky/pre-commit running lint, typecheck, format:check
- [ ] T075 [US3] Verify pre-commit hook blocks commits with lint errors
- [ ] T076 [US3] Verify pre-commit hook blocks commits with type errors
- [ ] T077 [US3] Verify pre-commit hook blocks commits with format violations
- [ ] T078 [US3] Verify pre-commit hook passes with clean code

**Checkpoint**: All user stories should now be independently functional - developers have full quality gates

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T079 [P] Add LICENSE file (MIT or Apache 2.0)
- [ ] T080 [P] Add CONTRIBUTING.md with development workflow
- [ ] T081 [P] Create .vscode/settings.json with recommended extensions
- [ ] T082 [P] Create .vscode/extensions.json recommending ESLint, Prettier, TypeScript
- [ ] T083 Run pnpm lint && pnpm typecheck && pnpm format:check to validate all quality gates
- [ ] T084 Create GitHub Actions workflow (.github/workflows/ci.yml) running lint, typecheck, format:check
- [ ] T085 Verify docker-compose up works on clean checkout
- [ ] T086 Verify pnpm install && pnpm dev completes within 5 minutes (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (only adds documentation)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (only adds tooling)

### Within Each User Story

- Docker infrastructure files can be created in parallel
- App package.json and tsconfig files can be created in parallel
- Workspace scripts run sequentially (T038-T043)
- README files can be written in parallel
- ESLint/Prettier/TypeScript config files can be created in parallel
- Pre-commit hooks must be configured after tooling is installed

### Parallel Opportunities

- All Setup tasks (T001-T005) can run in parallel (different files)
- All Foundational type definitions (T007-T011) can run in parallel
- All Foundational SDK files (T013-T016) can run in parallel
- User Story 1: Docker files (T019-T023) can run in parallel
- User Story 1: All app initialization (T024-T037) can run in parallel
- User Story 2: All README files (T048-T054) can run in parallel
- User Story 3: ESLint/Prettier config (T059-T061, T067-T069) can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
# Launch all Docker infrastructure files together:
Task: "Create infra/docker/docker-compose.yml with postgres, minio, redis services"
Task: "Create infra/docker/postgres/init.sql with database initialization"
Task: "Create infra/docker/.env.example with default environment variables"
Task: "Create infra/docker/nginx/nginx.conf with reverse proxy for drowl.test"
Task: "Create infra/docker/nginx/certs/generate-certs.sh for local HTTPS"

# Launch all app initialization together:
Task: "Initialize apps/api/package.json with Hono and dependencies"
Task: "Initialize apps/worker/package.json with Hono and dependencies"
Task: "Initialize apps/ui/package.json with React, Vite, and dependencies"
Task: "Initialize apps/landing/package.json with Astro and dependencies"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T018) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T019-T043)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Run `pnpm install` - should complete without errors
   - Run `docker-compose up` - all services should start
   - Run `pnpm dev` - API, Worker, UI, Landing should start
   - Access `https://drowl.test` - UI should load
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (18 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - 43 tasks total)
3. Add User Story 2 → Test independently → Deploy/Demo (58 tasks total)
4. Add User Story 3 → Test independently → Deploy/Demo (78 tasks total)
5. Add Polish → Final validation (86 tasks total)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (18 tasks)
2. Once Foundational is done:
   - Developer A: User Story 1 (T019-T043)
   - Developer B: User Story 2 (T044-T058) - can start immediately after Foundational
   - Developer C: User Story 3 (T059-T078) - can start immediately after Foundational
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- pnpm commands: Always use pnpm (never npm or yarn) for package management
- File paths: Always specify exact file paths for clarity
- Environment: Development assumes macOS/Linux (use WSL on Windows)
