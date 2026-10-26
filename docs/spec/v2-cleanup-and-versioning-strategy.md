# Specification: Repository Cleanup & v2 Versioning Strategy

## Status: Approved

## 1. Overview & Objectives
The `worship-app` project is transitioning from its initial proof-of-concept/v1 architecture to a completely redesigned v2 architecture. This specification details the steps to safely snapshot and archive the v1 codebase, clean the repository root down to a clean slate, and establish the versioning standards for v2 development.

---

## 2. Archival & Preservation Strategy (v1 Baseline)

To ensure zero loss of historical context, code, or assets:
1. **Annotated Tag**:
   - Tag Name: `v1.0.0`
   - Target Commit: `3727c1c` (`feat: change page title and icon`)
   - Message: `v1.0.0: Final release of initial v1 architecture`
2. **Archive Branch**:
   - Branch Name: `archive/v1`
   - Purpose: Direct checkouts, reference, or emergency maintenance without detaching HEAD or hunting tags.
3. **Remote Preservation**:
   - Synchronize both tag and branch with remote repository:
     ```bash
     git push origin v1.0.0
     git push origin archive/v1
     ```

---

## 3. Workspace Cleanup Scope

The workspace on `main` will be wiped completely to provide a clean canvas for manual scaffolding of the v2 architecture.

### 3.1 Retained Files & Directories
- `.git/` (full Git history and commit log retained).
- `.gitignore` (re-initialized with modern Node/Web defaults).

### 3.2 Deleted Files & Directories
- Source code: `src/` (components, pages, stores, schemas, lib).
- Assets: `public/`.
- Project configuration:
  - `package.json`, `yarn.lock`
  - `tsconfig.json`, `tsconfig.node.json`
  - `vite.config.ts`, `vercel.json`
  - `.eslintrc.json`, `.prettierrc.json`, `.husky/`
- Documentation: `README.md`

### 3.3 Target `.gitignore` Specification
The new `.gitignore` must accommodate modern JavaScript/TypeScript toolchains (Vite, Next.js, Astro, Remix) and package managers (pnpm, bun, yarn, npm):
- Dependency directories: `node_modules/`, `.pnp/`
- Build outputs: `dist/`, `build/`, `.out/`, `.next/`, `.astro/`
- Environment files: `.env`, `.env.local`, `.env.*.local`
- Logs & debug files: `*.log`, `npm-debug.log*`, `yarn-debug.log*`, `pnpm-debug.log*`
- Editor & OS files: `.DS_Store`, `Thumbs.db`, `.vscode/*` (with exceptions for settings if needed), `.idea/*`
- Test coverage & cache: `coverage/`, `.turbo/`, `.cache/`

### 3.4 Cleanup Commit
- Message: `chore: cleanup v1 codebase for v2 re-architecture`
- Status: Maintained locally on `main` until explicit user review and push.

---

## 4. Versioning Strategy for v2

### 4.1 Semantic Versioning (SemVer)
- **Starting Version**: `2.0.0`
- Format: `MAJOR.MINOR.PATCH`
  - `MAJOR`: Breaking architectural or API changes.
  - `MINOR`: New features backward-compatible.
  - `PATCH`: Backward-compatible bug fixes.

### 4.2 Commit Convention
Strict adherence to Conventional Commits:
- `feat:` -> bumps MINOR
- `fix:` -> bumps PATCH
- `feat!:` or `BREAKING CHANGE:` -> bumps MAJOR
- `chore:`, `refactor:`, `docs:`, `perf:`, `test:`, `style:`, `ci:` -> internal maintenance, generally no version bump unless configured.

### 4.3 Automated Release Pipeline
- **Engine**: GitHub Actions with `release-please` (or `@changesets/action`).
- **Timing**: Defer configuration until the v2 application structure and initial `package.json` are committed by the user.

---

## 5. Verification Checklist
- [ ] `v1.0.0` tag exists locally and matches HEAD commit `3727c1c`.
- [ ] `archive/v1` branch exists and points to `3727c1c`.
- [ ] Remote `origin` has received `v1.0.0` and `archive/v1`.
- [ ] Workspace on `main` contains exclusively `.git/` and `.gitignore`.
- [ ] Working tree is clean after the cleanup commit.
- [ ] Git history remains intact via `git log`.
