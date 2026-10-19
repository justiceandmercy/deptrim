const fs = require('fs');
const path = require('path');

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', 'out']);

const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto',
  'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'inspector',
  'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring',
  'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty',
  'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib', 'fs/promises'
]);

const IMPORT_PATTERNS = [
  /import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)/g
];

function packageName(spec) {
  if (!spec || spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('node:')) return null;
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    if (parts.length < 2) return null;
    return parts[0] + '/' + parts[1];
  }
  return spec.split('/')[0];
}

function walkFiles(dir, acc) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walkFiles(path.join(dir, e.name), acc);
    } else if (e.isFile()) {
      if (SOURCE_EXTENSIONS.has(path.extname(e.name))) acc.push(path.join(dir, e.name));
    }
  }
}

function extractUsed(rootDir) {
  const files = [];
  walkFiles(rootDir, files);
  const used = new Set();
  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    for (const re of IMPORT_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        const name = packageName(m[1]);
        if (name && !NODE_BUILTINS.has(name)) used.add(name);
      }
    }
  }
  return { used, fileCount: files.length };
}

function readPackageJson(dir) {
  const p = path.join(dir, 'package.json');
  const raw = fs.readFileSync(p, 'utf8');
  const pkg = JSON.parse(raw);
  const declared = new Set();
  const devDeclared = new Set();
  for (const k of Object.keys(pkg.dependencies || {})) declared.add(k);
  for (const k of Object.keys(pkg.devDependencies || {})) devDeclared.add(k);
  for (const k of Object.keys(pkg.peerDependencies || {})) declared.add(k);
  for (const k of Object.keys(pkg.optionalDependencies || {})) declared.add(k);
  return { pkg, declared, devDeclared };
}

function scan(targetDir) {
  const abs = path.resolve(targetDir || '.');
  const { declared, devDeclared } = readPackageJson(abs);
  const { used, fileCount } = extractUsed(abs);
  const unused = [...declared].filter((d) => !used.has(d)).sort();
  const unusedDev = [...devDeclared].filter((d) => !used.has(d)).sort();
  const missing = [...used].filter((u) => !declared.has(u) && !devDeclared.has(u)).sort();
  return { abs, declared: [...declared].sort(), devDeclared: [...devDeclared].sort(),
    used: [...used].sort(), unused, unusedDev, missing, fileCount };
}

module.exports = { scan, walkFiles, packageName };
