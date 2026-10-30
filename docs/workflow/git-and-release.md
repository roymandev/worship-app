# Git Branching, Versioning & Release Workflow

This document details the day-to-day workflow for branching, local development, pull requests, versioning, and releasing in `worship-app`.

---

## 1. Branching Strategy

We follow **Trunk-Based Development**. The `main` branch is the continuous integration trunk and must always remain deployable and passing the Verification Gate.

### Branch Conventions
All branches originate directly from `main` and use kebab-case descriptors prefixed by the intent:

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feat/` | New user-facing capability or system feature | `feat/playlist-keyboard-drag` |
| `fix/` | Bug fix or regression repair | `fix/menubar-focus-trap` |
| `refactor/` | Code structure change preserving behavior | `refactor/panel-store-selectors` |
| `chore/` | Tooling, dependencies, or configuration | `chore/bump-react-19` |
| `docs/` | ADRs, documentation, or specifications | `docs/hotkey-catalog` |

---

## 2. Local Feature Lifecycle

### Step 1: Branch Creation
Ensure local `main` is fresh, then create a short-lived branch:
```bash
git checkout main
git pull origin main
git checkout -b feat/playlist-item-reorder
```

### Step 2: Implementation & Verification Hooks
Make your changes. Husky enforces local safety nets:
- **`pre-commit`**: Runs `lint-staged` with `biome check --write` on staged files.
- **`pre-push`**: Runs `bun run typecheck` and `bun test`.

You can manually run the full project Verification Gate at any time:
```bash
bun run check      # Biome format and lint check
bun run typecheck  # TypeScript compiler check
bun test           # Bun test suite
bun run build      # Vite production build
```

### Step 3: Pull Request Creation via `/mr`
When work on your branch is complete and pushed, create or update the Pull Request using the OpenCode `/mr` command.

The command automatically generates a Conventional Commit title and structured PR description. PR titles strictly follow Conventional Commits (`type(scope): subject` or `type: subject`), while ticket IDs belong in the branch name (e.g. `feat/01-...`) and PR body:
```
<type>(<scope>): <summary>
```
*Example titles:*
- `feat(playlist): add inline keyboard reorder controls`
- `fix(workspace): prevent focus leakage on panel resize`

---

## 3. Pull Request Review & CI Gate

### GitHub Actions CI (`ci.yml`)
Every PR automatically runs:
1. **PR Title Linter** (`action-semantic-pull-request`): Enforces standard Conventional Commit format (`type(scope): subject` or `type: subject`). WIP drafts (`wip: ...`) are supported.
2. **Quality Verification**:
   - `bun run check`
   - `bun run typecheck`
   - `bun test`
   - `bun run build`

### Merge Strategy: Squash and Merge
- PRs must be merged using **Squash and Merge**.
- GitHub creates a single atomic commit on `main` using the validated PR title.
- Individual WIP or fixup commits within your branch are flattened, maintaining a clean, linear git history on `main`.

---

## 4. Automated Versioning and Release Lifecycle

We use **Google Release Please** (`release.yml`).

```
PR Squash-Merged to main
         │
         ▼
GitHub Actions: release-please-action
         │
         ├───► Checks Conventional Commits since last release
         ├───► Creates or updates Release PR: "chore(main): release 2.0.0-alpha.x"
         └───► Updates CHANGELOG.md & bumps package.json version
```

### How Releases are Cut
1. Merging features or fixes into `main` causes Release Please to open or update a pending Release PR (e.g. `chore(main): release 2.0.0-alpha.1`).
2. The Release PR accumulates changelogs across all merged PRs.
3. When the team decides to publish a release milestone, a maintainer simply **merges the Release PR**.
4. Release Please automatically:
   - Tags the commit with `vX.Y.Z` (e.g., `v2.0.0-alpha.1`).
   - Publishes the GitHub Release with markdown changelogs.
   - Sets `release_created: true` for any downstream deployment triggers.

---

## 5. Pre-Release (Alpha) to Stable v2 Transition

- **Current Baseline**: `2.0.0-alpha.0` with `prerelease: true` in `release-please-config.json`.
- **Pre-release Tags**: Releases cut during active v2 rewrite are tagged `v2.0.0-alpha.1`, `v2.0.0-alpha.2`, etc.
- **Stable Promotion**: When the v2 architecture reaches general availability (GA), update `release-please-config.json` to set `"prerelease": false`. The subsequent Release PR will cut official `v2.0.0`.
