#!/usr/bin/env node
const path = require('path');
const { scan } = require('../src/scanner');
const { report } = require('../src/reporter');

function parseArgs(argv) {
  const args = { dir: '.', json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else if (!a.startsWith('-')) args.dir = a;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: deptrim [dir] [--json]');
    console.log('Scan a JS/TS project for unused and missing dependencies.');
    process.exit(0);
  }
  try {
    const result = scan(args.dir);
    const code = report(result, { json: args.json });
    process.exit(code);
  } catch (e) {
    console.error('deptrim error:', e.message);
    process.exit(2);
  }
}

main();
