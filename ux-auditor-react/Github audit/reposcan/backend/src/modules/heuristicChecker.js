function createIssue(file, line, code, heuristicId, heuristicName, severity, message, suggestedFix) {
  return {
    file,
    line,
    code,
    heuristicId,
    heuristicName,
    severity,
    message,
    suggestedFix,
    type: 'heuristic',
  };
}

function checkFileContext(parsedFiles, currentFile) {
  const allContent = parsedFiles.map((f) => f.content).join('\n').toLowerCase();
  return { allContent, fileContent: currentFile.content.toLowerCase() };
}

function checkLine(file, line, context) {
  const issues = [];
  const { path } = file;
  const attrs = line.attributes || {};
  const raw = line.rawContent;
  const trimmed = line.trimmedContent.toLowerCase();

  // HEURISTIC 1 — Visibility of System Status
  if (
    (line.elementName === 'form' || trimmed.includes('<form')) &&
    !context.allContent.includes('loading') &&
    !context.allContent.includes('spinner') &&
    !context.allContent.includes('skeleton') &&
    !context.allContent.includes('isloading')
  ) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 1',
        'Visibility of System Status',
        'HIGH',
        'Form found without loading state indicators in the codebase',
        'Add loading spinners or skeleton screens during async operations'
      )
    );
  }

  if (
    (attrs.type === 'submit' || trimmed.includes('type="submit"') || trimmed.includes("type='submit'")) &&
    !context.fileContent.includes('success') &&
    !context.fileContent.includes('toast') &&
    !context.fileContent.includes('notification')
  ) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 1',
        'Visibility of System Status',
        'HIGH',
        'Submit button with no feedback mechanism detected in file',
        'Show success/error feedback after form submission'
      )
    );
  }

  // HEURISTIC 2 — Match Between System and Real World
  const jargonPatterns = [
    /errno/i,
    /stack trace/i,
    /null pointer/i,
    /undefined is not/i,
    /500 internal/i,
    /sql error/i,
  ];
  for (const pattern of jargonPatterns) {
    if (pattern.test(raw)) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 2',
          'Match Between System and Real World',
          'HIGH',
          'Technical jargon in user-facing message',
          'Replace technical error messages with user-friendly language'
        )
      );
      break;
    }
  }

  if (line.hasAlert || /\balert\s*\(/.test(raw)) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 2',
        'Match Between System and Real World',
        'HIGH',
        'alert() used instead of friendly in-app messaging',
        'Replace alert() with a toast notification or inline message component'
      )
    );
  }

  // HEURISTIC 3 — User Control and Freedom
  const destructivePatterns = /\b(delete|remove|destroy|purge|drop)\b/i;
  if (destructivePatterns.test(raw) && (line.hasOnClick || trimmed.includes('onclick') || trimmed.includes('onclick='))) {
    if (!context.fileContent.includes('confirm') && !line.hasConfirm) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 3',
          'User Control and Freedom',
          'MEDIUM',
          'Destructive action without confirmation dialog',
          'Add a confirmation step before delete/remove actions'
        )
      );
    }
  }

  if (
    (attrs.type === 'submit' || trimmed.includes('type="submit"')) &&
    !context.fileContent.includes('cancel') &&
    !context.fileContent.includes('type="reset"')
  ) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 3',
        'User Control and Freedom',
        'MEDIUM',
        'Submit button without nearby cancel option',
        'Add a cancel button to allow users to undo their action'
      )
    );
  }

  // HEURISTIC 4 — Consistency and Standards
  if (line.elementName && (attrs.style || trimmed.includes('style=') || trimmed.includes('style={'))) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 4',
        'Consistency and Standards',
        'LOW',
        'Inline styles mixed with component classes',
        'Move inline styles to CSS classes for consistency'
      )
    );
  }

  if (line.elementName === 'button' || line.elementName === 'Button') {
    const classVal = attrs.class || attrs.className || '';
    if (classVal && !['btn', 'button', 'btn-primary', 'btn-secondary'].some((c) => classVal.includes(c))) {
      const uniqueClasses = classVal.split(/\s+/).filter(Boolean);
      if (uniqueClasses.length > 0 && uniqueClasses.some((c) => c.includes('btn-') || c.includes('button-'))) {
        // multiple button naming conventions — flag once per unusual pattern
      }
    }
  }

  // HEURISTIC 5 — Error Prevention
  if (line.elementName === 'input') {
    const inputType = (attrs.type || 'text').toLowerCase();
    const importantTypes = ['email', 'password', 'tel', 'number', 'url'];
    if (importantTypes.includes(inputType)) {
      const hasValidation =
        attrs.required !== undefined ||
        attrs.pattern !== undefined ||
        attrs.minLength !== undefined ||
        attrs.minlength !== undefined ||
        attrs.maxLength !== undefined ||
        attrs.maxlength !== undefined;
      if (!hasValidation) {
        issues.push(
          createIssue(
            path,
            line.lineNumber,
            raw.trim(),
            'Heuristic 5',
            'Error Prevention',
            'HIGH',
            `Input type="${inputType}" lacks validation attributes`,
            'Add required, pattern, minLength, or similar validation attributes'
          )
        );
      }
    }
  }

  if (line.elementName === 'input' && (attrs.name === 'email' || attrs.name === 'password' || attrs.id === 'email')) {
    if (attrs.required === undefined && !raw.includes('required')) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 5',
          'Error Prevention',
          'HIGH',
          'Important form field missing required attribute',
          'Add the required attribute to critical form fields'
        )
      );
    }
  }

  // HEURISTIC 6 — Recognition Rather Than Recall
  if (line.elementName === 'input' && attrs.placeholder && !hasLabel(attrs, context.fileContent, line)) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 6',
        'Recognition Rather Than Recall',
        'MEDIUM',
        'Placeholder used as the only label for input',
        'Add a visible <label> element instead of relying on placeholder alone'
      )
    );
  }

  const autocompleteFields = ['email', 'password', 'name', 'tel', 'address', 'username'];
  if (line.elementName === 'input') {
    const nameOrType = (attrs.name || attrs.type || '').toLowerCase();
    if (autocompleteFields.some((f) => nameOrType.includes(f)) && !attrs.autoComplete && !attrs.autocomplete) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 6',
          'Recognition Rather Than Recall',
          'MEDIUM',
          'Common input field missing autocomplete attribute',
          'Add autocomplete attribute (e.g., autocomplete="email") to help users'
        )
      );
    }
  }

  // HEURISTIC 7 — Flexibility and Efficiency
  if (line.elementName === 'html' || (line.lineNumber === 1 && file.extension === 'html')) {
    if (!context.allContent.includes('skip') && !context.allContent.includes('skip-nav') && !context.allContent.includes('skipto')) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 7',
          'Flexibility and Efficiency of Use',
          'MEDIUM',
          'No skip navigation link found in codebase',
          'Add a skip-to-content link for keyboard users'
        )
      );
    }
  }

  // HEURISTIC 8 — Aesthetic and Minimalist Design
  if (line.elementName && (attrs.style || /style=\{/.test(raw))) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 8',
        'Aesthetic and Minimalist Design',
        'LOW',
        'Inline styles clutter the markup',
        'Extract inline styles to a stylesheet or styled component'
      )
    );
  }

  const divDepth = (raw.match(/<div/gi) || []).length;
  if (divDepth >= 3 || (line.elementName === 'div' && raw.match(/<div/gi)?.length >= 2)) {
    issues.push(
      createIssue(
        path,
        line.lineNumber,
        raw.trim(),
        'Heuristic 8',
        'Aesthetic and Minimalist Design',
        'LOW',
        'Excessive nested div elements (div soup)',
        'Simplify DOM structure using semantic HTML elements'
      )
    );
  }

  // HEURISTIC 9 — Help Users Recognize Errors
  const genericErrors = [
    /\berror\b/i,
    /\binvalid\b/i,
    /\bfailed\b/i,
    /\bsomething went wrong\b/i,
  ];
  for (const pattern of genericErrors) {
    if (pattern.test(raw) && (raw.includes('message') || raw.includes('error') || raw.includes('alert') || raw.includes('toast'))) {
      if (!attrs['aria-describedby'] && !attrs['aria-live']) {
        issues.push(
          createIssue(
            path,
            line.lineNumber,
            raw.trim(),
            'Heuristic 9',
            'Help Users Recognize, Diagnose, and Recover from Errors',
            'HIGH',
            'Generic error message without aria-describedby linkage',
            'Use specific error messages and link them with aria-describedby'
          )
        );
      }
      break;
    }
  }

  // HEURISTIC 10 — Help and Documentation
  if (line.elementName === 'input') {
    const complexTypes = ['date', 'time', 'datetime-local', 'file', 'range'];
    const inputType = (attrs.type || 'text').toLowerCase();
    if (complexTypes.includes(inputType) && !attrs['aria-describedby'] && !attrs.title) {
      issues.push(
        createIssue(
          path,
          line.lineNumber,
          raw.trim(),
          'Heuristic 10',
          'Help and Documentation',
          'LOW',
          'Complex input lacks help text or tooltip',
          'Add aria-describedby or title attribute with usage instructions'
        )
      );
    }
  }

  return issues;
}

function hasLabel(attrs, fileContent, line) {
  if (attrs['aria-label'] || attrs['aria-labelledby']) return true;
  if (attrs.id && fileContent.includes(`for="${attrs.id}"`)) return true;
  return /<label/i.test(line.rawContent);
}

export function runHeuristicChecks(parsedFiles) {
  const allIssues = [];
  const seenKeys = new Set();

  for (const file of parsedFiles) {
    const context = checkFileContext(parsedFiles, file);

    for (const line of file.lines) {
      const issues = checkLine(file, line, context);

      for (const issue of issues) {
        const key = `${issue.file}:${issue.line}:${issue.heuristicId}:${issue.message}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allIssues.push(issue);
        }
      }
    }
  }

  return allIssues;
}
