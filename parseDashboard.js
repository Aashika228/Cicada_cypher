const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

const styleStart = file.indexOf('<style>');
const styleEnd = file.indexOf('</style>');
const css = file.substring(styleStart + 7, styleEnd).trim();

const bodyStart = file.indexOf('<body');
const bodyEnd = file.indexOf('</body>');
let bodyContent = file.substring(bodyStart, bodyEnd);
bodyContent = bodyContent.substring(bodyContent.indexOf('>') + 1).trim();

const scriptStart = bodyContent.indexOf('<script>');
let htmlBody = bodyContent;
let jsContent = '';
if (scriptStart !== -1) {
  htmlBody = bodyContent.substring(0, scriptStart).trim();
  jsContent = bodyContent.substring(scriptStart + 8, bodyContent.indexOf('</script>')).trim();
}

console.log('CSS Length:', css.split('\n').length, 'lines');
console.log('HTML Length:', htmlBody.split('\n').length, 'lines');
console.log('JS Length:', jsContent.split('\n').length, 'lines');

fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify({
  cssLines: css.split('\n').length,
  htmlLines: htmlBody.split('\n').length,
  jsLines: jsContent.split('\n').length
}));
