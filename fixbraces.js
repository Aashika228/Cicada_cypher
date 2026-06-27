const fs = require('fs');
const path = require('path');

const jsxOutPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'DashboardReact.jsx');
let code = fs.readFileSync(jsxOutPath, 'utf8');

// Replace {<br  /> with {"{"}<br  />
code = code.replace(/\{<br/g, '{"{"}<br');
// Replace <br  />\n              } with <br  />\n              {"}"}
code = code.replace(/<br  \/>\r?\n\s*\}/g, '<br  />\n              {"}"}');

fs.writeFileSync(jsxOutPath, code);
console.log('✅ Fixed braces in DashboardReact.jsx');
