'use strict';
// Trusted tooling only. TypeScript parses scanned files as data, never imports them.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** @param {string} modulePath */
function parser(modulePath) {
  const ts = require(modulePath ? path.resolve(modulePath) : 'typescript');
  if (ts.version !== '5.9.3') throw new Error('Expected trusted TypeScript 5.9.3');
  return ts;
}

/** @param {any} ts @param {string} source @param {string} filename */
function normalize(ts, source, filename) {
  filename = filename.replace(/\\/g, '/');
  const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  if (sf.parseDiagnostics.length) throw new Error('Parse error at offset ' + sf.parseDiagnostics[0].start);
  // A noResolve, noLib, in-memory program binds local symbols without reading dependencies.
  const host = {
    getSourceFile: name => name === filename ? sf : undefined,
    getDefaultLibFileName: () => '', writeFile: () => {}, getCurrentDirectory: () => '',
    getDirectories: () => [], fileExists: name => name === filename,
    readFile: name => name === filename ? source : undefined,
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram([filename], {noResolve: true, noLib: true, allowJs: true, target: ts.ScriptTarget.Latest}, host);
  const checker = program.getTypeChecker();
  const output = [];
  function one(fn) {
    const ids = new Map();
    const tokens = [];
    const propertyName = n => {
      const p = n.parent;
      return p && ((ts.isPropertyAccessExpression(p) && p.name === n) ||
        ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isPropertyDeclaration(p)) && p.name === n));
    };
    const binding = n => {
      const symbol = checker.getSymbolAtLocation(n);
      if (!symbol) return 'global:' + n.text;
      if (!ids.has(symbol)) ids.set(symbol, ids.size);
      return 'id:' + ids.get(symbol);
    };
    function visit(n) {
      if (ts.isTypeNode(n)) return;
      if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isTypeAssertionExpression(n) || ts.isNonNullExpression(n)) return visit(n.expression);
      // Shorthand keys are observable property names, not cosmetic local identifiers.
      if (ts.isShorthandPropertyAssignment(n)) {
        tokens.push('(ShorthandPropertyAssignment', 'property:' + n.name.text, binding(n.name));
        if (n.objectAssignmentInitializer) visit(n.objectAssignmentInitializer);
        tokens.push(')'); return;
      }
      if (ts.isIdentifier(n)) { tokens.push(propertyName(n) ? 'property:' + n.text : binding(n)); return; }
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) { tokens.push('string:' + n.text); return; }
      if (ts.isNumericLiteral(n)) { tokens.push('number:' + Number(n.text)); return; }
      if (ts.isRegularExpressionLiteral(n)) { tokens.push('regex:' + n.text); return; }
      if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) { tokens.push('template:' + n.kind + ':' + n.text); return; }
      tokens.push('(' + ts.SyntaxKind[n.kind]);
      ts.forEachChild(n, child => { visit(child); });
      tokens.push(')');
    }
    // Deliberately omit the function's declaration name; preserve async/generator behavior.
    tokens.push(fn.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async' : 'sync');
    tokens.push(fn.asteriskToken ? 'generator' : 'ordinary');
    fn.parameters.forEach(visit);
    visit(fn.body);
    const name = fn.name?.text || (ts.isVariableDeclaration(fn.parent) ? fn.parent.name.getText(sf) : '<anonymous>');
    return {name, line: sf.getLineAndCharacterOfPosition(fn.getStart(sf)).line + 1,
      end_line: sf.getLineAndCharacterOfPosition(fn.end).line + 1,
      start: fn.getStart(sf), end: fn.end, tokens,
      fingerprint: crypto.createHash('sha256').update(JSON.stringify(tokens)).digest('hex')};
  }
  function collect(n) {
    if ((ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n)) && n.body) {
      if (n.end - n.pos > 256 * 1024) throw new Error('Function exceeds normalization budget');
      output.push(one(n));
      if (output.length > 15000) throw new Error('Function count budget exceeded');
    }
    ts.forEachChild(n, collect);
  }
  collect(sf);
  return output;
}

module.exports = {parser, normalize};
if (require.main === module) {
  try {
    const [file, modulePath] = process.argv.slice(2);
    if (!file || fs.statSync(file).size > 16 * 1024 * 1024) throw new Error('Missing/oversize input');
    const ts = parser(modulePath);
    const source = fs.readFileSync(file, 'utf8');
    console.log(JSON.stringify({parser: 'typescript@' + ts.version, functions: normalize(ts, source, path.resolve(file))}));
  } catch (error) { console.error(String(error)); process.exitCode = 2; }
}
