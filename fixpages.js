const fs = require('fs');
const path = require('path');

const jsxOutPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'DashboardReact.jsx');
let code = fs.readFileSync(jsxOutPath, 'utf8');

code = code.replace(/<div id="page-dashboard" className="page( active)?">/g, '<div id="page-dashboard" className="page" style={{ display: activePage === \'dashboard\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-accessibility" className="page( active)?">/g, '<div id="page-accessibility" className="page" style={{ display: activePage === \'accessibility\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-heuristics" className="page( active)?">/g, '<div id="page-heuristics" className="page" style={{ display: activePage === \'heuristics\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-journey" className="page( active)?">/g, '<div id="page-journey" className="page" style={{ display: activePage === \'journey\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-aifixes" className="page( active)?">/g, '<div id="page-aifixes" className="page" style={{ display: activePage === \'aifixes\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-reports" className="page( active)?">/g, '<div id="page-reports" className="page" style={{ display: activePage === \'reports\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="page-chat" className="page( active)?">/g, '<div id="page-chat" className="page" style={{ display: activePage === \'chat\' ? \'block\' : \'none\' }}>');

fs.writeFileSync(jsxOutPath, code);
console.log('✅ Fixed page IDs');
