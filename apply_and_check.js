const fs = require('fs');
const babel = require('@babel/core');
const loginPath = 'src/pages/public/Login.jsx';
const navRaw = fs.readFileSync('navblock.tmp', 'utf8').replace(/[\r\n]+$/, '');
let login = fs.readFileSync(loginPath, 'utf8');
const le = /\r\n/.test(login) ? '\r\n' : '\n';
const nav = navRaw.replace(/\r\n/g, le).replace(/\n/g, le);
const re = /(<\/Button>)\r?\n[ \t]*\r?\n([ \t]*)(<Container)/;
const m = login.match(re);
if (!m) {
  console.error('Login.jsx: ANCHOR NOT FOUND (expected Back-to-Home </Button> followed by <Container>)');
  process.exitCode = 1;
} else {
  login = login.replace(re, function (match, btn, spaces, cont) {
    return btn + le + le + nav + le + le + spaces + cont;
  });
  console.log('Login.jsx: inserted nav block after Back-to-Home button (anchor char index ' + m.index + ').');
}
const footerPath = 'src/components/Footer.jsx';
let footer = fs.readFileSync(footerPath, 'utf8');
function normalize(s) {
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}
footer = normalize(footer);
login = normalize(login);
fs.writeFileSync(footerPath, footer);
fs.writeFileSync(loginPath, login);
const targets = [
  { name: 'Footer.jsx', filename: footerPath, code: footer },
  { name: 'Login.jsx', filename: loginPath, code: login },
];
for (const t of targets) {
  try {
    const out = babel.transformSync(t.code, {
      filename: t.filename,
      presets: [['@babel/preset-react'], ['@babel/preset-env']],
      configFile: false,
      babelrc: false,
    });
    console.log(t.name + ': Babel parse OK (emitted ' + out.code.length + ' chars).');
  } catch (e) {
    console.error(t.name + ': Babel PARSE ERROR: ' + e.message);
    process.exitCode = 1;
  }
}
