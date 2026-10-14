Source: https://ui.shadcn.com/llms.txt
Captured: 2026-10-14

---

Index of captured shadcn/ui registry documentation. Each entry lists the file, its source URL and what the page covers.

- `shadcn-registry.md`: https://ui.shadcn.com/docs/registry: Registry introduction; the shadcn CLI can host a custom code registry for components, hooks, pages, config and other files.
- `shadcn-registry-getting-started.md`: https://ui.shadcn.com/docs/registry/getting-started: Setting up a registry: registry.json structure (single or with include), adding items, building static JSON or serving dynamic routes, testing with CLI commands, namespace setup and publishing.
- `shadcn-registry-examples.md`: https://ui.shadcn.com/docs/registry/examples: Example registry items by type (registry:style, theme, block, ui, lib, hook, font, base), target placeholders, CSS variables, CSS imports, plugins, animations, env vars and universal items.
- `shadcn-registry-faq.md`: https://ui.shadcn.com/docs/registry/faq: Common registry questions: complex item example, adding Tailwind colors and theme variables, GitHub registryDependencies, pinning GitHub refs, private repositories.
- `shadcn-registry-authentication.md`: https://ui.shadcn.com/docs/registry/authentication: Authenticating private registries with Bearer tokens, API keys and query parameters; server-side examples; security practices and error handling.
- `shadcn-registry-mcp.md`: https://ui.shadcn.com/docs/registry/mcp: Making a registry work with the shadcn MCP server: registry index requirement, per-client MCP setup (Claude Code, Cursor, VS Code, Codex, OpenCode), best practices.
- `shadcn-registry-namespaces.md`: https://ui.shadcn.com/docs/registry/namespace: Namespaced registries (@namespace/item) in components.json, URL placeholders ({name}, {style}), authentication, dependency resolution and overrides, versioning, CLI commands, error messages.
- `shadcn-registry-directory.md`: https://ui.shadcn.com/docs/registry/registry-index: Open source registry directory: how the CLI uses it, how to submit a registry, and requirements for listing.
- `shadcn-registry-open-in-v0.md`: https://ui.shadcn.com/docs/registry/open-in-v0: Opening registry items in v0 via the open endpoint, a sample Open in v0 button, token query parameter authentication and its limitations.
- `shadcn-registry-registry-json.md`: https://ui.shadcn.com/docs/registry/registry-json: Schema reference for the root registry.json: $schema, name, homepage, include, items and their rules.
- `shadcn-registry-item-json.md`: https://ui.shadcn.com/docs/registry/registry-item-json: Schema reference for registry-item.json: name, title, description, type values, author, dependencies, registryDependencies, files and target placeholders, cssVars, css, envVars, font, docs, categories, meta.
- `shadcn-registry-github.md`: https://ui.shadcn.com/docs/registry/github: Using a public or private GitHub repository as a registry via owner/repo/item addresses: registry.json at the repo root, validation, refs and pinning, include, registry dependencies, private repository authentication and review guidance.
- `shadcn-registry-health.md`: https://ui.shadcn.com/docs/registry/health: Registry Health monitoring for directory-listed registries: check cadence, status values, score components and formulas, smoothing for new registries, directory ranking and related API fields.

Not captured: the JSON Schema endpoints https://ui.shadcn.com/schema/registry.json and https://ui.shadcn.com/schema/registry-item.json are listed in llms.txt but are JSON schema documents rather than docs pages.
