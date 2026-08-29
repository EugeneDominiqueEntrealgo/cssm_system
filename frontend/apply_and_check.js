const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const root = __dirname; // frontend/ directory
const footerPath = path.join(root, 'src/components/Footer.jsx');
const loginPath = path.join(root, 'src/pages/public/Login.jsx');

const navLines = [
  '      {/* Upper-side quick links: Shop ? Services ? About Us ? Contract */}',
  '      <Box',
  '        sx={{',
  '          position: "absolute",',
  '          zIndex: 10,',
  '          top: { xs: 15, md: 24 },',
  '          right: { xs: 15, md: 30 },',
  '          display: "flex",',
  '          alignItems: "center",',
  '          gap: 1,',
  '          px: 2,',
  '          py: 0.6,',
  '          borderRadius: 3,',
  '          bgcolor: "rgba(255,255,255,.85)",',
  '          border: "1px solid rgba(226,232,240,.8)",',
  '          backdropFilter: "blur(12px)",',
  '          boxShadow: "0 2px 10px rgba(15,23,42,.06)",',
  '        }}',
  '      >',
  '        {["Shop", "Services", "About Us", "Contract"].map((label, idx) => (',
  '          <React.Fragment key={label}>',
  '            {idx > 0 && (',
  '              <Box sx={{ color: "#94A3B8", fontSize: 18, lineHeight: 1 }}>?</Box>',
  '            )}',
  '            <Link',
  '              to="#"',
  '              onClick={(e) => e.preventDefault()}',
  '              style={{',
  '                fontSize: 12,',
  '                fontWeight: 700,',
  '                color: "#047857",',
  '                textDecoration: "none",',
  '                whiteSpace: "nowrap",',
  '                letterSpacing: ".05em",',
  '              }}',
  '            >',
  '              {label}',
  '            </Link>',
  '          </React.Fragment>',
  '        ))}',
  '      </Box>',
];

// --- 1. Insert nav links into Login.jsx (after the Back-to-Home </Button>) ---
const nav = navLines.join('\n');
let login = fs.readFileSync(loginPath, 'utf8');
const le = /\r\n/.test(login) ? '\r\n' : '\n';
const navNorm = nav.replace(/\r\n/g, le).replace(/\n/g, le);
const re = /(<\/Button>)\r?\n[ \t]*\r?\n([ \t]*)(<Container)/;
const m = login.match(re);
if (!m) {
  console.error('Login.jsx: ANCHOR NOT FOUND (expected Back-to-Home </Button> followed by <Container>)');
  process.exitCode = 1;
} else {
  login = login.replace(re, function (match, btn, spaces, cont) {
    return btn + le + le + navNorm + le + le + spaces + cont;
  });
  console.log('Login.jsx: inserted nav block (anchor char index ' + m.index + ').');
}

// --- 2. Normalize EOL to CRLF + strip BOM for both files ---
let footer = fs.readFileSync(footerPath, 'utf8');
function normalize(s) {
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}
footer = normalize(footer);
login = normalize(login);
fs.writeFileSync(footerPath, footer);
fs.writeFileSync(loginPath, login);

// --- 3. Babel-validate both files ---
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
console.log('Done.');
