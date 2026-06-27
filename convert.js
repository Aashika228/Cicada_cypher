const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'dashboard.html');
const cssOutPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'Dashboard.css');
const jsxOutPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'DashboardReact.jsx');

const file = fs.readFileSync(srcPath, 'utf8');

// 1. Extract CSS
const styleStart = file.indexOf('<style>');
const styleEnd = file.indexOf('</style>');
if (styleStart !== -1 && styleEnd !== -1) {
  let css = file.substring(styleStart + 7, styleEnd).trim();
  // We can prefix the body styles to apply specifically to the dashboard wrapper if needed
  css = css.replace(/body\s*{/g, '.dashboard-page-container {');
  fs.writeFileSync(cssOutPath, css);
  console.log('✅ Extracted CSS to Dashboard.css');
}

// 2. Extract HTML Body
const bodyStart = file.indexOf('<body');
const bodyEnd = file.indexOf('</body>');
let bodyContent = file.substring(bodyStart, bodyEnd);
bodyContent = bodyContent.substring(bodyContent.indexOf('>') + 1).trim();

// Remove the <script> block at the end
const scriptStart = bodyContent.indexOf('<script>');
if (scriptStart !== -1) {
  bodyContent = bodyContent.substring(0, scriptStart).trim();
}

// 3. Transform HTML to JSX
let jsx = bodyContent;

// Attributes
jsx = jsx.replace(/class="/g, 'className="');
jsx = jsx.replace(/for="/g, 'htmlFor="');
jsx = jsx.replace(/onclick="/g, 'onClick="');

// SVG Attributes
jsx = jsx.replace(/stroke-width="/g, 'strokeWidth="');
jsx = jsx.replace(/stroke-linecap="/g, 'strokeLinecap="');
jsx = jsx.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
jsx = jsx.replace(/fill-rule="/g, 'fillRule="');
jsx = jsx.replace(/clip-rule="/g, 'clipRule="');

// Self-closing tags
jsx = jsx.replace(/<img([^>]*)>/g, (match, attrs) => {
  if (attrs.endsWith('/')) return match;
  return `<img${attrs} />`;
});
jsx = jsx.replace(/<input([^>]*)>/g, (match, attrs) => {
  if (attrs.endsWith('/')) return match;
  return `<input${attrs} />`;
});
jsx = jsx.replace(/<hr([^>]*)>/g, '<hr$1 />');
jsx = jsx.replace(/<br([^>]*)>/g, '<br$1 />');

// Inline styles
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

// HTML Comments to JSX Comments
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

// Wrap in a component
const componentCode = `import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/clerk-react';
import './Dashboard.css';

const DashboardReact = () => {
  const [activePage, setActivePage] = useState('dashboard');
  
  // Custom navigation handler to replace inline onClick
  const handleNav = (page) => {
    setActivePage(page);
  };

  return (
    <div className="dashboard-page-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      ${jsx}
    </div>
  );
};

export default DashboardReact;
`;

fs.writeFileSync(jsxOutPath, componentCode);
console.log('✅ Generated DashboardReact.jsx');
