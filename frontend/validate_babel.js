const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const root = __dirname;
const presetReact = require('@babel/preset-react');
const presetEnv = require('@babel/preset-env');
const targets = [
  { name: 'Footer.jsx', file: path.join(root, 'src/components/Footer.jsx') },
  { name: 'Login.jsx', file: path.join(root, 'src/pages/public/Login.jsx') },
];
let ok = true;
for (const t of targets) {
  const code = fs.readFileSync(t.file, 'utf8');
  try {
    const out = babel.transformSync(code, {
      filename: t.file,
      presets: [presetReact, presetEnv],
    });
    console.log(t.name + ': Babel parse OK (emitted ' + out.code.length + ' chars).');
  } catch (e) {
    console.error(t.name + ': Babel PARSE ERROR: ' + e.message);
    ok = false;
  }
}
console.log(ok ? 'ALL VALID' : 'VALIDATION FAILED');
process.exit(ok ? 0 : 1);
