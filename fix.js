const fs = require('fs');
const path = require('path');

const jsxOutPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'DashboardReact.jsx');
let jsx = fs.readFileSync(jsxOutPath, 'utf8');

// Fix onClick strings
jsx = jsx.replace(/onClick="([^"]*)"/g, 'onClick={() => { /* $1 */ }}');

// Fix inline styles that might have been missed
// E.g. style="display:none" -> style={{ display: 'none' }}
// We already did this, but just in case:
jsx = jsx.replace(/style="([^"]*)"/g, (match, styles) => {
  let obj = {};
  styles.split(';').forEach(s => {
    if(!s.trim()) return;
    let [k, ...vParts] = s.split(':');
    let v = vParts.join(':');
    if(k && v) {
      let camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      obj[camelK] = v.trim();
    }
  });
  return `style={${JSON.stringify(obj)}}`;
});

// Fix attributes
jsx = jsx.replace(/tabindex=/gi, 'tabIndex=');
jsx = jsx.replace(/readonly/gi, 'readOnly');
jsx = jsx.replace(/autocomplete/gi, 'autoComplete');

// Any stray <path> or <img> without closures?
// Let's use a quick parser or just trust it.

fs.writeFileSync(jsxOutPath, jsx);
console.log('✅ Patched DashboardReact.jsx');
