# Contributing to ProjectHub

Thanks for your interest in improving ProjectHub! This repo ships the desktop app; end users install from Releases. Please follow these guidelines when contributing.

## Getting Started
- Use the latest **main** branch.
- Install deps: `yarn install`
- Run dev app: `yarn dev`
- Run lint/tests before opening a PR: `yarn lint && yarn test && yarn typecheck`

## Pull Requests
1. Fork and branch from `main`.
2. Keep changes small and focused; include tests when possible.
3. Update docs (README or wiki) if behavior or settings change.
4. Ensure CI passes.
5. Use clear commit messages and PR descriptions outlining what/why.

## Reporting Issues
- Use GitHub Issues with a concise repro (steps, expected, actual) and your OS/app version.

## Code Style
- TypeScript/React with ESLint + Prettier defaults in this repo.
- Keep files/functions reasonably small; prefer clear naming over comments.

## Communication
- Be respectful (see CODE_OF_CONDUCT.md).
- Security issues: email `security@projecthub.app` (see SECURITY.md).

Thank you for contributing!
