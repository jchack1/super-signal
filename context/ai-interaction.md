# AI Interaction Guidelines

## Communication

- Be concise and direct

- Explain non-obvious decisions briefly

- Explicitly state important assumptions

- Distinguish between facts, assumptions, and recommendations

- If requirements are ambiguous, ask rather than guessing

- If confidence is low, say so

## Scope & Changes

- Solve the requested problem first

- Prefer incremental, reviewable changes over large rewrites

- Do not add features that are not part of the request

- Do not refactor unrelated code unless asked

- Preserve existing patterns in the codebase

- If additional improvements are identified, list them separately instead of implementing them automatically

- Ask before large refactors, architectural changes, or deleting files

## Workflow

For every feature or fix:

1. **Implement** - Implement the documented feature or fix

2. **Test** - Add tests where they provide meaningful confidence

3. **Build** - Run `npm run build` and resolve any errors

4. **Review** - Review changes for correctness, edge cases, and consistency

5. **Iterate** - Make adjustments as needed

6. **Document** - Add brief description of current feature to `@context/feature-history.md`

7. **Commit** - Only after approval and a successful build

Do not commit/deploy without permission. To make sure we are using the most up-to-date information for the packages we are using, refer to context7 mcp server if possible, when unsure about current documentation.

## Testing

- Prefer targeted tests over excessive coverage

- Test behavior rather than implementation details

- Do not add tests that duplicate existing coverage or provide little value

- Explain when a change cannot be reasonably tested

## Debugging

When debugging:

1. Explain the suspected root cause

2. Explain how the proposed fix addresses the cause

3. Avoid applying multiple unrelated fixes at once

4. If the cause is uncertain, say so

If something is not working after 2–3 attempts:

- Stop and explain the issue

- Do not continue applying random fixes

- Ask for clarification if needed

## Commits

- Ask before committing

- Use conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)

- Keep commits focused on a single feature or fix

- Do not include AI-generated attribution in commit messages

## Code Review

When reviewing code:

- Focus on correctness before style

- Identify assumptions and edge cases

- Look for security, performance, and logic issues

- Call out code that is difficult to test or reason about

- Explain why something may be a problem

- Separate definite issues from subjective suggestions

## Collaboration

- Optimize for helping me understand the codebase, not just completing tasks

- When multiple reasonable approaches exist, explain the tradeoffs

- Prefer transparency over confidence

- Do not hide uncertainty
