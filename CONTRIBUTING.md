# Contributing to drowl

Thank you for your interest in contributing to drowl! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 9+
- Docker for local development
- Git for version control

### Setting Up Your Development Environment

1. **Fork the Repository**

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/drowl.git
cd drowl
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Start Docker Services**

```bash
cd infra/docker
cp .env.example .env
docker-compose up -d
cd ../..
```

4. **Run Development Servers**

```bash
pnpm dev
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow the project's coding standards:

- **TypeScript**: Use strict typing, avoid `any`
- **ESLint**: Follow configured rules
- **Prettier**: Code is auto-formatted on commit
- **Comments**: Add JSDoc for public APIs

### 3. Run Quality Checks

Before committing, ensure your code passes all checks:

```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Format check
pnpm format:check

# Auto-fix formatting
pnpm format

# Run all checks
pnpm lint && pnpm typecheck && pnpm format:check
```

### 4. Commit Your Changes

We use conventional commits:

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or fixes
- `chore:` - Maintenance tasks

**Pre-commit hooks** will automatically run lint, typecheck, and format:check. If any check fails, the commit will be blocked until you fix the issues.

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Title**: Clear, concise description
- **Description**: What changed and why
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes

## Project Structure

```
drowl/
├── apps/              # Deployable applications
│   ├── api/          # Control Plane API
│   ├── worker/       # Data Plane Worker
│   ├── ui/           # Product Dashboard
│   └── landing/      # Marketing Site
├── packages/         # Shared libraries
│   ├── core/         # Core types and schemas
│   ├── plugin-sdk/   # Plugin SDK
│   └── db/           # Database migrations
├── plugins/          # Plugin implementations
└── infra/            # Infrastructure config
```

## Adding New Features

### Adding a New API Endpoint

1. Add route handler in `apps/api/src/routes/`
2. Add types in `packages/core/src/types/` if needed
3. Update API README with endpoint documentation
4. Add tests (when testing framework is set up)

### Creating a New Plugin

1. Create plugin directory in `plugins/`
2. Follow the template in `plugins/README.md`
3. Implement `BasePlugin` from `@drowl/plugin-sdk`
4. Add plugin documentation
5. Add tests

### Modifying Core Types

1. Update types in `packages/core/src/types/`
2. Update Zod schemas for runtime validation
3. Add JSDoc comments for IDE hints
4. Update documentation in `packages/core/README.md`
5. Consider migration impact on existing data

## Testing

Currently, the project is in initial setup phase. Testing guidelines will be added as the testing framework is established.

## Documentation

- Update README.md for user-facing changes
- Update relevant package/app README for technical changes
- Add JSDoc comments for new functions and types
- Update CHANGELOG.md (when established)

## Review Process

1. **Automated Checks**: CI runs lint, typecheck, format:check
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Address review comments
4. **Approval**: Once approved, your PR will be merged

## Coding Standards

### TypeScript

- Use strict mode
- Avoid `any` type (use `unknown` if needed)
- Prefer `type` over `interface` for simple types
- Use `interface` for objects that may be extended
- Add JSDoc comments for exported functions

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Directories**: `kebab-case/`
- **Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### File Organization

- One exported type/class per file (exceptions for related types)
- Group related functionality in directories
- Index files (`index.ts`) for clean exports

### Error Handling

- Use descriptive error messages
- Log errors with context
- Handle promises properly (no floating promises)
- Use Zod for input validation

## Architecture Principles

Follow the drowl constitution (`.specify/memory/constitution.md`):

1. **OSS-First**: docker-compose.yml required
2. **Plugin-Based**: Extend via plugins
3. **Immutable Raw Data**: Store events in object storage
4. **Event Sourcing**: Separate control/data planes
5. **Identity Transparency**: Clear confidence scoring
6. **Observability**: Correlation IDs, structured logging
7. **Security**: Encrypted secrets, secure credentials

## Questions?

- Open an issue for bugs or feature requests
- Join discussions for questions
- Check existing issues before creating new ones

## License

By contributing to drowl, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in the project README and release notes.

Thank you for contributing to drowl! 🎉
