const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'Dashboard.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace dark code block backgrounds
css = css.replace(/background:\s*#080c18;/g, 'background: #f1f5f9;');
css = css.replace(/color:\s*#c4cbdd;/g, 'color: #334155;');

// Replace dark border/shadow glows with lighter ones
css = css.replace(/rgba\(0,0,0,\.4\)/g, 'rgba(0,0,0,.1)');
css = css.replace(/rgba\(0,0,0,\.35\)/g, 'rgba(0,0,0,.08)');
css = css.replace(/rgba\(0,0,0,\.3\)/g, 'rgba(0,0,0,.06)');
css = css.replace(/rgba\(0,0,0,0\.3\)/g, 'rgba(0,0,0,.06)');
css = css.replace(/rgba\(0,0,0,\.2\)/g, 'rgba(0,0,0,.04)');

// Lighten gradients that were using dark RGBs
css = css.replace(/rgba\(15,\s*20,\s*40,\s*0\.85\)/g, 'rgba(255, 255, 255, 0.85)');
css = css.replace(/rgba\(20,\s*28,\s*58,\s*0\.65\)/g, 'rgba(255, 255, 255, 0.65)');
css = css.replace(/rgba\(30,\s*40,\s*80,\s*0\.5\)/g, 'rgba(241, 245, 249, 0.7)');

// Replace any stray dark colors
css = css.replace(/#0a0e1a/g, '#f8fafc');
css = css.replace(/#0f1424/g, '#f1f5f9');

// Replace text colors that were missed
css = css.replace(/#e8ecf4/g, '#0f172a');
css = css.replace(/#8b92a8/g, '#475569');
css = css.replace(/#5a6178/g, '#94a3b8');

fs.writeFileSync(cssPath, css);
console.log('✅ Applied light theme colors in Dashboard.css');
