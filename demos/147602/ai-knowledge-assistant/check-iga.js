const { execSync } = require('child_process');

function run(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', shell: 'cmd.exe' });
    console.log(out);
    return out;
  } catch (e) {
    console.log('stdout:', e.stdout || '');
    console.log('stderr:', e.stderr || '');
    return null;
  }
}

console.log('=== iga pages deploy --help ===');
run('iga pages deploy --help');

console.log('\n=== iga pages list --help ===');
run('iga pages list --help');
