const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'ux-auditor-react', 'src', 'components', 'DashboardReact.jsx');
let code = fs.readFileSync(jsxPath, 'utf8');

// Replacements for Dashboard Navigation
code = code.replace(/onClick=\{\(\) => \{ \/\* switchPage\('([^']+)',this\) \*\/ \}\}/g, 'onClick={() => setActivePage(\'$1\')}');
code = code.replace(/onClick=\{\(\) => \{ \/\* switchPage\('([^']+)',document\.querySelector[^)]+\) \*\/ \}\}/g, 'onClick={() => setActivePage(\'$1\')}');
// Update active classes for sidebar
code = code.replace(/className="sb-item active"/g, 'className={`sb-item ${activePage === \'dashboard\' ? \'active\' : \'\'}`}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('accessibility'\)\}/g, 'className={`sb-item ${activePage === \'accessibility\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'accessibility\')}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('heuristics'\)\}/g, 'className={`sb-item ${activePage === \'heuristics\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'heuristics\')}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('journey'\)\}/g, 'className={`sb-item ${activePage === \'journey\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'journey\')}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('aifixes'\)\}/g, 'className={`sb-item ${activePage === \'aifixes\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'aifixes\')}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('reports'\)\}/g, 'className={`sb-item ${activePage === \'reports\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'reports\')}');
code = code.replace(/className="sb-item"(.*?)onClick=\{\(\) => setActivePage\('chat'\)\}/g, 'className={`sb-item ${activePage === \'chat\' ? \'active\' : \'\'}`}$1onClick={() => setActivePage(\'chat\')}');

// Page display logic: <div id="pageDashboard" className="page active"> -> style={{ display: activePage === 'dashboard' ? 'block' : 'none' }}
code = code.replace(/<div id="pageDashboard" className="page active">/g, '<div id="pageDashboard" className="page" style={{ display: activePage === \'dashboard\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageAccessibility" className="page">/g, '<div id="pageAccessibility" className="page" style={{ display: activePage === \'accessibility\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageHeuristics" className="page">/g, '<div id="pageHeuristics" className="page" style={{ display: activePage === \'heuristics\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageJourney" className="page">/g, '<div id="pageJourney" className="page" style={{ display: activePage === \'journey\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageAiFixes" className="page">/g, '<div id="pageAiFixes" className="page" style={{ display: activePage === \'aifixes\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageReports" className="page">/g, '<div id="pageReports" className="page" style={{ display: activePage === \'reports\' ? \'block\' : \'none\' }}>');
code = code.replace(/<div id="pageChat" className="page">/g, '<div id="pageChat" className="page" style={{ display: activePage === \'chat\' ? \'block\' : \'none\' }}>');

// Journey Steps logic
code = code.replace(/onClick=\{\(\) => \{ \/\* openJourneyStep\(this,'([^']+)'\) \*\/ \}\}/g, 'onClick={() => setActiveJourneyStep(\'$1\')}');
// Replace standard active classes in journey
code = code.replace(/className="journey-step-card(.*?)( active-step)?"(.*? onClick=\{\(\) => setActiveJourneyStep\('([^']+)'\)\})/g, 'className={`journey-step-card$1 ${activeJourneyStep === \'$4\' ? \'active-step\' : \'\'}`}$3');
// Replace journey detail panels
code = code.replace(/className="journey-detail( open)?" id="step-([^"]+)"/g, (match, open, id) => {
  return `className="journey-detail" id="step-${id}" style={{ display: activeJourneyStep === '${id}' ? 'block' : 'none' }}`;
});

// Toast logic
code = code.replace(/onClick=\{\(\) => \{ \/\* showToast\('([^']+)'[^)]*\) \*\/ \}\}/g, 'onClick={() => showToast(\'$1\')}');

// Chat logic
code = code.replace(/onClick=\{\(\) => \{ \/\* sendSuggestion\('([^']+)'\) \*\/ \}\}/g, 'onClick={() => sendChat(\'$1\')}');
code = code.replace(/onClick=\{\(\) => \{ \/\* sendChat\(\) \*\/ \}\}/g, 'onClick={() => sendChat()}');
code = code.replace(/onKeyDown="handleChatKey\(event\)"/g, 'onKeyDown={(e) => { if (e.key === \'Enter\' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}');

// Toggle chip logic
code = code.replace(/onClick=\{\(\) => \{ \/\* toggleChip\(this\) \*\/ \}\}/g, 'onClick={(e) => e.currentTarget.classList.toggle(\'active\')}');

// Toggle cat logic
code = code.replace(/onClick=\{\(\) => \{ \/\* toggleCat\(this\) \*\/ \}\}/g, 'onClick={(e) => { e.currentTarget.classList.toggle(\'open\'); e.currentTarget.nextElementSibling.classList.toggle(\'open\'); }}');


// Insert React state code
const stateCode = `
  const [activePage, setActivePage] = useState('dashboard');
  const [activeJourneyStep, setActiveJourneyStep] = useState('homepage');
  const [toastMessage, setToastMessage] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const sendChat = (text = null) => {
    const msg = text || chatInput.trim();
    if (!msg) return;
    setChatInput('');
    
    const newMessages = [...chatMessages, { sender: 'user', text: msg }];
    setChatMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      const responses = {
        'accessibility': 'Your site has 14 accessibility issues across 11 categories...',
        'usability': 'Based on heuristics, add inline real-time validation to all forms...',
        'critical': 'The keyboard focus trap in the cookie consent modal is WCAG 2.1.2 Level A...',
        'react code': 'Here is the React component with proper accessibility...',
        'tailwind css': 'Here is the WCAG-compliant Tailwind CSS button...',
        'client': 'Executive Summary: We completed a comprehensive UX audit...',
        'prioritize': 'Tier 1 Highest ROI: Checkout no inline validation (+24% conversion)...'
      };
      
      const key = Object.keys(responses).find(k => msg.toLowerCase().includes(k));
      const response = key ? responses[key] : 'I analyzed your request. Based on the audit, the checkout flow needs major usability updates.';
      
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 1200);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);
`;

code = code.replace(/const \[activePage, setActivePage\] = useState\('dashboard'\);\s*\/\/[^\n]*\s*const handleNav[^\}]+};\s*/g, stateCode);

// Add value/onChange to chat input
code = code.replace(/id="chatInput"([^>]+)>/g, 'id="chatInput"$1 value={chatInput} onChange={e => setChatInput(e.target.value)} />');

// Replace the chatMessages container with dynamic React map
const chatMessagesHtml = `<div className="chat-messages" id="chatMessages">
            <div className="chat-welcome">
              <div className="chat-avatar" style={{"background":"linear-gradient(135deg,#2563eb,#7c3aed)"}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div style={{"fontSize":"14.5px","fontWeight":"700","color":"var(--text-primary)","marginBottom":"4px"}}>How can I help you improve this site?</div>
              <div style={{"fontSize":"13px","color":"var(--text-secondary)"}}>I've analyzed all 42 pages of acme-corp.io. Ask me anything about the audit results.</div>
            </div>
          </div>`;

const chatMessagesReact = `<div className="chat-messages" id="chatMessages">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                <div className="chat-avatar" style={{"background":"linear-gradient(135deg,#2563eb,#7c3aed)"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                </div>
                <div style={{"fontSize":"14.5px","fontWeight":"700","color":"var(--text-primary)","marginBottom":"4px"}}>How can I help you improve this site?</div>
                <div style={{"fontSize":"13px","color":"var(--text-secondary)"}}>I've analyzed all 42 pages of acme-corp.io. Ask me anything about the audit results.</div>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={\`chat-msg \${msg.sender}\`}>
                <div className="chat-avatar">{msg.sender === 'ai' ? 'AI' : 'JD'}</div>
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-msg ai">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble" style={{color: 'var(--text-muted)'}}>
                   ...typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>`;

code = code.replace(chatMessagesHtml, chatMessagesReact);

// Toast rendering update
code = code.replace(/<div id="toast"(.*?)>([^<]*)<\/div>/, '<div id="toast"$1 style={{ ...$1.match(/style={{(.*?)}}/)[1], opacity: toastMessage ? "1" : "0", transform: toastMessage ? "translateY(0)" : "translateY(8px)" }}>{toastMessage}</div>');

fs.writeFileSync(jsxPath, code);
console.log('✅ Injected React logic into DashboardReact.jsx');
