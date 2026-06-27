function extractAttributes(tagContent) {
  const attributes = {};
  const attrRegex = /([@]?[\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s/>]+)))?/g;
  let match;

  while ((match = attrRegex.exec(tagContent)) !== null) {
    const name = match[1];
    if (name === '/' || name.startsWith('<')) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    attributes[name] = value;
  }

  return attributes;
}

function extractElementName(line) {
  const tagMatch = line.match(/<\s*\/?\s*([a-zA-Z][\w-]*)/);
  if (tagMatch) return tagMatch[1].toLowerCase();

  const jsxMatch = line.match(/<\s*([A-Z][\w]*)/);
  if (jsxMatch) return jsxMatch[1];

  return null;
}

function parseHtmlLine(lineNumber, rawContent) {
  const trimmedContent = rawContent.trim();
  const elementName = extractElementName(trimmedContent);
  const tagMatch = trimmedContent.match(/<\s*\/?\s*([a-zA-Z][\w-]*)([^>]*)>/);
  const attributes = tagMatch ? extractAttributes(tagMatch[2] || '') : {};

  return {
    lineNumber,
    rawContent,
    trimmedContent,
    elementName,
    attributes,
    hasOnClick: 'onclick' in attributes || 'onClick' in attributes,
    hasAlt: 'alt' in attributes,
    hasAriaLabel: 'aria-label' in attributes || 'ariaLabel' in attributes,
    hasOnKeyDown: 'onkeydown' in attributes || 'onKeyDown' in attributes,
    isProperty: false,
    propertyName: null,
    propertyValue: null,
  };
}

function parseCssLine(lineNumber, rawContent) {
  const trimmedContent = rawContent.trim();
  const propMatch = trimmedContent.match(/^([\w-]+)\s*:\s*(.+?);?\s*$/);

  return {
    lineNumber,
    rawContent,
    trimmedContent,
    elementName: null,
    attributes: {},
    hasOnClick: false,
    hasAlt: false,
    hasAriaLabel: false,
    hasOnKeyDown: false,
    isProperty: Boolean(propMatch),
    propertyName: propMatch ? propMatch[1] : null,
    propertyValue: propMatch ? propMatch[2].replace(/;$/, '') : null,
  };
}

function parseReactLine(lineNumber, rawContent) {
  const trimmedContent = rawContent.trim();
  const elementName = extractElementName(trimmedContent);
  const tagMatch = trimmedContent.match(/<\s*\/?\s*([a-zA-Z][\w.]*)([^/>]*)/);
  const attributes = tagMatch ? extractAttributes(tagMatch[2] || '') : {};

  const jsxPropMatch = trimmedContent.match(/^([\w.]+)\s*=\s*(.+)$/);

  return {
    lineNumber,
    rawContent,
    trimmedContent,
    elementName,
    attributes,
    hasOnClick: 'onClick' in attributes || 'onclick' in attributes || /\bonClick\s*=/.test(trimmedContent),
    hasAlt: 'alt' in attributes,
    hasAriaLabel: 'aria-label' in attributes || 'ariaLabel' in attributes,
    hasOnKeyDown: 'onKeyDown' in attributes || 'onkeydown' in attributes || /\bonKeyDown\s*=/.test(trimmedContent),
    isProperty: Boolean(jsxPropMatch) && !trimmedContent.startsWith('<'),
    propertyName: jsxPropMatch ? jsxPropMatch[1] : null,
    propertyValue: jsxPropMatch ? jsxPropMatch[2] : null,
  };
}

function parseJsLine(lineNumber, rawContent) {
  const trimmedContent = rawContent.trim();
  const alertMatch = trimmedContent.match(/\balert\s*\(/);
  const confirmMatch = trimmedContent.match(/\bconfirm\s*\(/);

  return {
    lineNumber,
    rawContent,
    trimmedContent,
    elementName: null,
    attributes: {},
    hasOnClick: /\bonClick\s*=/.test(trimmedContent) || /\.addEventListener\s*\(\s*['"]click/.test(trimmedContent),
    hasAlt: false,
    hasAriaLabel: false,
    hasOnKeyDown: /\bonKeyDown\s*=/.test(trimmedContent),
    isProperty: false,
    propertyName: null,
    propertyValue: null,
    hasAlert: Boolean(alertMatch),
    hasConfirm: Boolean(confirmMatch),
  };
}

function getParser(extension) {
  switch (extension) {
    case 'html':
    case 'vue':
      return parseHtmlLine;
    case 'css':
    case 'scss':
      return parseCssLine;
    case 'jsx':
    case 'tsx':
      return parseReactLine;
    case 'js':
    case 'ts':
      return parseJsLine;
    default:
      return parseHtmlLine;
  }
}

export function parseRepoFiles(files) {
  return files.map((file) => {
    const lines = file.content.split('\n');
    const parseLine = getParser(file.extension);

    const parsedLines = lines.map((rawContent, index) => parseLine(index + 1, rawContent));

    return {
      path: file.path,
      extension: file.extension,
      lineCount: file.lineCount,
      content: file.content,
      lines: parsedLines,
    };
  });
}

export { extractAttributes, extractElementName };
