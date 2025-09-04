# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Build in stub mode for development
- `pnpm start` - Run TypeScript directly with tsx
- `pnpm build` - Build the project using unbuild

### Testing
- `pnpm test` - Run all tests with Vitest
- `pnpm test [filename]` - Run specific test file
- `pnpm vitest watch` - Run tests in watch mode

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

### Release
- `pnpm release` - Bump version and publish to npm

### Shorthand Commands (with @antfu/ni)
- `nr` - Alias for `pnpm run` (e.g., `nr test`, `nr lint`)
- `nci` - Clean install dependencies

## Architecture

This is a TypeScript starter template for building npm packages, configured with:

### Build System
- **unbuild** for building the package with automatic declaration generation
- Entry point at `src/index.ts`
- Outputs to `dist/` with ESM format (`.mjs` files)
- Dependencies from `@antfu/utils` are inlined during build

### Development Tools
- **TypeScript** with strict mode and ESNext target
- **Vitest** for testing with support for package exports validation
- **ESLint** with @antfu/eslint-config for code linting
- **pnpm** as the package manager with workspace support
- **simple-git-hooks** with lint-staged for pre-commit linting

### Project Structure
- `src/` - Source code (main entry: `src/index.ts`)
- `test/` - Test files using Vitest
- `dist/` - Build output (git-ignored)
- Uses pnpm workspace with catalogs for dependency management
- Configured for ESM-only output with proper TypeScript declarations
