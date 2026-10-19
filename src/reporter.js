function color(s, code) { return process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s; }

function report(result, opts) {
  const { abs, declared, devDeclared, used, unused, unusedDev, missing, fileCount } = result;
  const json = opts && opts.json;
  if (json) {
    process.stdout.write(JSON.stringify({ unused, unusedDev, missing, used, declared, devDeclared, fileCount }, null, 2) + '\n');
    return (unused.length || unusedDev.length || missing.length) ? 1 : 0;
  }

  console.log(color('deptrim', '1;36') + '  ' + abs);
  console.log(`scanned ${fileCount} source files, found ${used.length} imported packages`);
  console.log('');

  const section = (title, items, hint) => {
    console.log(color(title, '1;33') + (items.length ? ` (${items.length})` : ' (0)'));
    if (items.length === 0) {
      console.log(color('  none', '2'));
    } else {
      for (const it of items) console.log('  - ' + it);
    }
    if (hint) console.log(color('  ' + hint, '2'));
    console.log('');
  };

  section('Unused dependencies', unused, 'remove from dependencies');
  section('Unused devDependencies', unusedDev, 'remove from devDependencies');
  section('Missing dependencies', missing, 'add to package.json');

  const problems = unused.length + unusedDev.length + missing.length;
  if (problems === 0) {
    console.log(color('OK: no drift detected.', '32'));
  } else {
    console.log(color(`Found ${problems} issue(s).`, '31'));
  }
  return problems ? 1 : 0;
}

module.exports = { report };
