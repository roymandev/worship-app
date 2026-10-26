# Worship App v2

A modern client-side Single Page Application (SPA) for worship presentations and song management.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Client SPA with file-based routing and code splitting)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Tooling & Linter**: [Biome](https://biomejs.dev/)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)

## Available Scripts

- `bun run dev` - Start the local Vite development server on port 3000
- `bun run build` - Build the production SPA bundle into `dist`
- `bun run check` - Run Biome formatting and lint diagnostics check
- `bun run format` - Format source files with Biome
- `bun run generate-routes` - Generate route tree (`tsr generate`) for TanStack Router

## Project Structure

```text
├── src/
│   ├── routes/          # TanStack Router file-based routes
│   │   ├── __root.tsx   # Root route layout, error boundaries & fallbacks
│   │   └── index.tsx    # Home page
│   ├── main.tsx         # Client entrypoint and DOM mounting
│   ├── router.tsx       # TanStack Router instance configuration
│   ├── routeTree.gen.ts # Auto-generated route tree
│   └── styles.css       # Tailwind CSS v4 entrypoint
├── tsr.config.json      # TanStack Router configuration
├── vite.config.ts       # Vite bundler configuration
└── biome.json           # Biome linter/formatter configuration
```
