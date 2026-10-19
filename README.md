# deptrim

Find unused and missing dependencies in JavaScript/TypeScript projects.

## Description

`deptrim` scans your source tree for `import`/`require` statements and compares them against the dependencies declared in `package.json`. It reports dependencies that are declared but never imported (waste, bloat, supply-chain surface) and imports that are used but not declared (latent runtime failures).

## Features

- Detects unused `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`.
- Detects missing dependencies imported in code but absent from `package.json`.
- Supports JS, TS, JSX, TSX, Vue, Svelte, MJS, CJS.
- Scoped packages (`@scope/name`) and subpath imports handled.
- Ignores `node_modules`, build output, and VCS directories.
- JSON output for CI integration (`--json`).
- Zero runtime dependencies; pure Node.js.

## Install

```sh
npm install -g deptrim
# or run without install
npx deptrim .
```

## Usage

```sh
deptrim [dir] [--json]
```

Examples:

```sh
# scan current directory
deptrim

# scan another project
deptrim ./my-app

# machine-readable output for CI
deptrim . --json
```

Exit code is `0` when no drift is found, `1` when issues exist, `2` on error.

## License

MIT
