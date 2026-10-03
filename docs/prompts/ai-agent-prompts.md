# Master AI Agent Prompt

When working as an AI coding agent on this repository, follow these rules:

1. **Inspect Before Modifying**: Always read the existing models, routes, and `docs/` before making architectural changes.
2. **Do Not Invent**: Do not hallucinate fields or relationships that do not exist in the database schema.
3. **Preserve Logic**: When editing, do not break the "AI proposes, Human authorizes" principle.
4. **Follow Architecture**: Use FastAPI dependencies for DB and Auth. Use Next.js App Router conventions.
5. **Lint and Test**: Verify your changes using available tools.
