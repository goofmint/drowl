# Implementation Plan: Project Setup & Initial Structure

**Branch**: `001-project-setup` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-setup/spec.md`

**Note**: This is a project infrastructure setup task, not a feature implementation. No runtime code will be written - only configuration files, package.json, tsconfig.json, and documentation.

## Summary

開発者がローカル環境でdrowlプロジェクトを立ち上げ、モノレポ構造を理解し、コード品質ゲートを設定できるようにする。pnpm workspacesモノレポ構成、Docker開発環境、TypeScript型定義の一元管理、Lint/型チェック/フォーマット設定を含む。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x
**Primary Dependencies**: pnpm 9.x (workspace manager), Hono 4.x (API/Worker framework), React 18 (UI), Vite 5.x (UI build), Astro 4.x (Landing)
**Storage**: PostgreSQL 16 (docker-compose), MinIO (object storage), Redis 7 (queue)
**Testing**: Vitest (unit/integration), Playwright (E2E) - 将来フェーズで追加
**Target Platform**: macOS/Linux development環境 (Windows WSL2対応)
**Project Type**: Monorepo (web) - apps/ + packages/ + plugins/ + infra/
**Performance Goals**: `pnpm install` < 2 min, `pnpm dev` startup < 30 sec, hot reload < 1 sec
**Constraints**: docker-compose必須、Node.js 20+必須、pnpm 9+必須
**Scale/Scope**: 4 apps (api, worker, ui, landing), 3 packages (core, plugin-sdk, db), 初期プラグイン2種

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: OSS-First Architecture ✅ PASS
- docker-compose.ymlで完全に動作する構成を実現
- Cloudflare依存（Hono）はNode.jsで実行可能

### Principle II: Plugin-Based Extensibility ✅ PASS
- packages/plugin-sdkでManifest型定義とBasePluginクラスを提供

### Principle III: Immutable Raw Data ⚠️ N/A
- セットアップフェーズのためデータ保存機能なし

### Principle IV: Event Sourcing & Separation of Concerns ✅ PASS
- packages/coreで共通イベントスキーマ型定義を提供

### Principle V: Identity Resolution Transparency ⚠️ N/A
- セットアップフェーズのためID統合機能なし

### Principle VI: Observability & Traceability ⚠️ N/A
- セットアップフェーズのためロギング機能なし（将来フェーズで追加）

### Principle VII: Security & Secrets Management ✅ PASS
- .env.exampleで環境変数管理パターンを確立
- .gitignoreで.envファイルを除外

### Quality Gates ✅ PASS
- ESLint・Prettier・TypeScript設定を実装
- pre-commitフックで品質チェック

## Project Structure

### Documentation (this feature)

```text
specs/001-project-setup/
├── plan.md              # This file (technical context, structure)
├── spec.md              # Feature specification (user stories)
├── tasks.md             # Implementation tasks (86 tasks)
└── checklists/
    └── requirements.md  # Quality validation (✅ PASS)
```

**Note**: research.md, data-model.md, contracts/, quickstart.mdはプロジェクトセットアップタスクのため不要。

### Source Code (repository root)

```text
drowl/
├── apps/                           # Applications
│   ├── api/                        # Control Plane API (Hono)
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   └── routes/            # API routes
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── worker/                     # Data Plane Workers (Hono)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── consumers/         # Queue consumers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                         # Product Dashboard (React + Vite)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── landing/                    # LP/Marketing (Astro)
│       ├── src/
│       │   └── pages/
│       │       └── index.astro
│       ├── package.json
│       ├── astro.config.mjs
│       └── tsconfig.json
│
├── packages/                       # Shared Packages
│   ├── core/                       # Common Types & Schemas
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── event.ts       # Event type
│   │   │   │   ├── identity.ts    # Identity, IdentityLink types
│   │   │   │   ├── keyword.ts     # Keyword type
│   │   │   │   └── job.ts         # Job type
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── plugin-sdk/                 # Plugin Development SDK
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   └── manifest.ts    # PluginManifest type
│   │   │   ├── base-plugin.ts     # BasePlugin abstract class
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── db/                         # Database Migrations
│       ├── migrations/
│       │   └── 001_initial.sql
│       └── package.json
│
├── plugins/                        # Plugins (future)
│   └── .gitkeep
│
├── infra/                          # Infrastructure
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── postgres/
│   │   │   └── init.sql
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   └── certs/
│   │   │       └── generate-certs.sh
│   │   └── .env.example
│   │
│   └── cloudflare/                 # SaaS deployment (future)
│       └── .gitkeep
│
├── pnpm-workspace.yaml             # pnpm workspace configuration
├── package.json                    # Root workspace scripts
├── tsconfig.json                   # Shared TypeScript configuration
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

**Structure Decision**: Monorepo (web) with apps/ + packages/ + plugins/ + infra/ structure. 4つのapps（api, worker, ui, landing）、3つのpackages（core, plugin-sdk, db）を持つ。pnpm workspacesで管理し、各アプリは独立したpackage.jsonを持つ。

## Complexity Tracking

**No violations** - このセットアップは憲章の原則に準拠しており、複雑性の正当化は不要。
