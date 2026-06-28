function hexToRgb(hex) {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }
  if (cleaned.length === 6) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }
  return null;
}

function parseColor(value) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();

  if (trimmed.startsWith('#')) {
    return hexToRgb(trimmed);
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  const named = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
    yellow: { r: 255, g: 255, b: 0 },
    orange: { r: 255, g: 165, b: 0 },
    purple: { r: 128, g: 0, b: 128 },
    pink: { r: 255, g: 192, b: 203 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    lime: { r: 0, g: 255, b: 0 },
    navy: { r: 0, g: 0, b: 128 },
    teal: { r: 0, g: 128, b: 128 },
    silver: { r: 192, g: 192, b: 192 },
    maroon: { r: 128, g: 0, b: 0 },
    olive: { r: 128, g: 128, b: 0 },
    aqua: { r: 0, g: 255, b: 255 },
    fuchsia: { r: 255, g: 0, b: 255 },
  };

  return named[trimmed] || null;
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseFontSizePx(value) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const pxMatch = trimmed.match(/^([\d.]+)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const remMatch = trimmed.match(/^([\d.]+)rem$/);
  if (remMatch) return parseFloat(remMatch[1]) * 16;
  const emMatch = trimmed.match(/^([\d.]+)em$/);
  if (emMatch) return parseFloat(emMatch[1]) * 16;
  const ptMatch = trimmed.match(/^([\d.]+)pt$/);
  if (ptMatch) return parseFloat(ptMatch[1]) * 1.333;
  return null;
}

function hasAssociatedLabel(line, attributes) {
  if (attributes['aria-label'] || attributes.ariaLabel) return true;
  if (attributes['aria-labelledby'] || attributes.ariaLabelledby) return true;
  if (attributes.id) return true;
  if (/<label/i.test(line.rawContent)) return true;
  return false;
}

function getButtonText(line) {
  const textMatch = line.rawContent.match(/>([^<]+)</);
  return textMatch ? textMatch[1].trim() : '';
}

function createIssue(file, line, code, wcagId, wcagName, wcagLevel, severity, message, suggestedFix) {
  return {
    file,
    line,
    code,
    wcagId,
    wcagName,
    wcagLevel,
    severity,
    message,
    suggestedFix,
    type: 'wcag',
  };
}

function checkLine(file, line) {
  const issues = [];
  const { path } = file;
  const attrs = line.attributes || {};

  // WCAG 1.1.1 — Missing alt on img
  if (line.elementName === 'img' && !line.hasAlt) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        line.rawContent.trim(),
        'WCAG 1.1.1',
        'Non-text Content',
        'A',
        'HIGH',
        'Image element is missing an alt attribute',
        'Add a descriptive alt attribute to the img element'
      )
    );
  }

  // WCAG 1.3.1 — Input with no label or aria-label
  if (line.elementName === 'input' && !hasAssociatedLabel(line, attrs)) {
    const inputType = (attrs.type || 'text').toLowerCase();
    if (!['hidden', 'submit', 'button', 'reset'].includes(inputType)) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          line.rawContent.trim(),
          'WCAG 1.3.1',
          'Info and Relationships',
          'A',
          'HIGH',
          'Form input lacks an associated label or aria-label',
          'Add a <label> element or aria-label attribute to the input'
        )
      );
    }
  }

  // WCAG 1.4.3 — Contrast below 4.5:1
  if (line.isProperty) {
    const prop = line.propertyName?.toLowerCase();
    if (prop === 'color' || prop === 'background' || prop === 'background-color') {
      const colorVal = line.propertyValue;
      const bgDefault = { r: 255, g: 255, b: 255 };
      const fgDefault = { r: 0, g: 0, b: 0 };
      const color = parseColor(colorVal);

      if (color) {
        const ratio =
          prop === 'color'
            ? contrastRatio(color, bgDefault)
            : contrastRatio(fgDefault, color);

        if (ratio < 4.5) {
          issues.push(
            createIssue(
              path,
              line.lineNumber,
              line.rawContent.trim(),
              'WCAG 1.4.3',
              'Contrast (Minimum)',
              'AA',
              'HIGH',
              `Color contrast ratio ${ratio.toFixed(2)}:1 is below the required 4.5:1`,
              'Adjust foreground and background colors to meet 4.5:1 contrast ratio'
            )
          );
        }
      }
    }
  }

  // WCAG 1.4.4 — Font size below 12px
  if (line.isProperty && line.propertyName?.toLowerCase() === 'font-size') {
    const sizePx = parseFontSizePx(line.propertyValue);
    if (sizePx !== null && sizePx < 12) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          line.rawContent.trim(),
          'WCAG 1.4.4',
          'Resize Text',
          'AA',
          'MEDIUM',
          `Font size ${sizePx}px is below the recommended 12px minimum`,
          'Increase font-size to at least 12px (preferably 16px for body text)'
        )
      );
    }
  }

  // WCAG 2.1.1 — onClick on div/span without keyboard handler
  const interactiveElements = ['div', 'span', 'li', 'td', 'p'];
  if (
    line.elementName &&
    interactiveElements.includes(line.elementName.toLowerCase()) &&
    line.hasOnClick &&
    !line.hasOnKeyDown &&
    !attrs.role &&
    !attrs.tabIndex &&
    !attrs.tabindex
  ) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        line.rawContent.trim(),
        'WCAG 2.1.1',
        'Keyboard',
        'A',
        'CRITICAL',
        'Click handler on non-interactive element without keyboard support',
        'Use a <button> element or add onKeyDown handler, role="button", and tabIndex={0}'
      )
    );
  }

  // WCAG 2.4.3 — Positive tabIndex
  const tabIndex = attrs.tabIndex ?? attrs.tabindex;
  if (tabIndex !== undefined && parseInt(tabIndex, 10) > 0) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        line.rawContent.trim(),
        'WCAG 2.4.3',
        'Focus Order',
        'A',
        'HIGH',
        'Positive tabIndex disrupts natural focus order',
        'Remove tabIndex or set tabIndex={0}; rely on natural DOM order'
      )
    );
  }

  // WCAG 2.4.4 — Vague link text
  if (line.elementName === 'a' || line.elementName === 'Link') {
    const linkText = getButtonText(line).toLowerCase();
    const vaguePatterns = [
      'click here',
      'read more',
      'learn more',
      'here',
      'more',
      'link',
      'this',
    ];
    if (vaguePatterns.some((p) => linkText === p || linkText.includes(p))) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          line.rawContent.trim(),
          'WCAG 2.4.4',
          'Link Purpose (In Context)',
          'A',
          'MEDIUM',
          'Link text is vague and does not describe its destination',
          'Use descriptive link text that explains where the link goes'
        )
      );
    }
  }

  // WCAG 2.4.7 — outline:none removes focus
  if (
    line.isProperty &&
    (line.propertyName?.toLowerCase() === 'outline' ||
      line.trimmedContent.includes('outline:') ||
      line.trimmedContent.includes('outline :'))
  ) {
    const val = (line.propertyValue || line.trimmedContent).toLowerCase();
    if (val.includes('none') || val.includes('0')) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          line.rawContent.trim(),
          'WCAG 2.4.7',
          'Focus Visible',
          'AA',
          'HIGH',
          'CSS removes visible focus indicator (outline: none)',
          'Provide a visible focus style instead of removing outline'
        )
      );
    }
  }

  // WCAG 3.1.1 — html tag missing lang attribute
  if (line.elementName === 'html' && !line.rawContent.trim().startsWith('</') && !attrs.lang) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        line.rawContent.trim(),
        'WCAG 3.1.1',
        'Language of Page',
        'A',
        'HIGH',
        'HTML element is missing a lang attribute',
        'Add lang="en" (or appropriate language code) to the <html> element'
      )
    );
  }

  // WCAG 4.1.2 — Button with no text or aria-label
  if (line.elementName === 'button' || attrs.role === 'button') {
    const buttonText = getButtonText(line);
    if (!buttonText && !line.hasAriaLabel && !attrs['aria-labelledby']) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          line.rawContent.trim(),
          'WCAG 4.1.2',
          'Name, Role, Value',
          'A',
          'CRITICAL',
          'Button has no accessible name (no text or aria-label)',
          'Add visible text content or an aria-label to the button'
        )
      );
    }
  }

  return issues;
}

export function runWcagChecks(parsedFiles) {
  const allIssues = [];

  for (const file of parsedFiles) {
    for (const line of file.lines) {
      const issues = checkLine(file, line);
      allIssues.push(...issues);
    }
  }

  return allIssues;
}

export { contrastRatio, parseColor, parseFontSizePx };
