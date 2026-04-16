/**
 * ESLint Plugin: Coding Guidelines Enforcement
 *
 * Custom rules that enforce the project's CODE RED coding standards.
 * See: spec/02-coding-guidelines/03-coding-guidelines-spec/
 *
 * Rules:
 *   coding-guidelines/no-nested-if          — Zero nested if (CODE RED)
 *   coding-guidelines/boolean-naming        — is/has/can/should/was prefix (CODE RED)
 *   coding-guidelines/no-magic-strings      — No raw string literals in comparisons (CODE RED)
 *   coding-guidelines/max-function-lines    — 15-line function limit (CODE RED)
 *   coding-guidelines/promise-all-independent — Promise.all for independent awaits (CODE RED)
 *   coding-guidelines/blank-line-before-return — Blank line before return/throw (R4)
 *   coding-guidelines/no-else-after-return  — No else after return (R7)
 */

// ═══════════════════════════════════════════════════════════════
// Rule: no-nested-if (CODE RED)
// ═══════════════════════════════════════════════════════════════

function containsIf(node) {
  if (!node) return false;
  if (node.type === "IfStatement") return true;
  if (node.type === "BlockStatement" && node.body) {
    return node.body.some((s) => s.type === "IfStatement");
  }
  return false;
}

const noNestedIf = {
  meta: {
    type: "problem",
    docs: { description: "Disallow nested if statements (CODE RED)" },
    messages: {
      nestedIf: "🔴 CODE RED: Nested `if` is forbidden. Flatten with early returns, combined conditions, or extract into a named function.",
    },
    schema: [],
  },
  create(context) {
    function isInsideIf(node) {
      let current = node.parent;
      let passedLoop = false;
      while (current) {
        if (["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"].includes(current.type)) {
          passedLoop = true;
        }
        if (current.type === "IfStatement") {
          return !passedLoop;
        }
        current = current.parent;
      }
      return false;
    }

    return {
      IfStatement(node) {
        if (isInsideIf(node) && !containsIf(node.consequent)) {
          context.report({ node, messageId: "nestedIf" });
        }
        if (node.consequent?.type === "BlockStatement" && !isInsideIf(node)) {
          for (const stmt of node.consequent.body) {
            if (stmt.type === "IfStatement") {
              let p = node.parent, inLoop = false;
              while (p) {
                if (["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"].includes(p.type)) { inLoop = true; break; }
                if (p.type === "IfStatement") break;
                p = p.parent;
              }
              if (!inLoop) context.report({ node: stmt, messageId: "nestedIf" });
            }
          }
        }
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: boolean-naming (CODE RED)
// ═══════════════════════════════════════════════════════════════

const VALID_PREFIXES = ["is", "has", "can", "should", "was", "will"];
const EXEMPT_NAMES = new Set(["ok", "done", "found", "exists", "checked", "disabled", "hidden", "loading", "open", "selected", "visible", "required", "readonly", "enabled"]);

const booleanNaming = {
  meta: {
    type: "suggestion",
    docs: { description: "Boolean variables must use is/has/can/should/was/will prefix (CODE RED)" },
    messages: {
      missingPrefix: '🔴 CODE RED: Boolean variable "{{name}}" must start with is/has/can/should/was/will. Example: "is{{capitalized}}".',
    },
    schema: [{ type: "object", properties: { exemptNames: { type: "array", items: { type: "string" } } }, additionalProperties: false }],
  },
  create(context) {
    const opts = context.options[0] || {};
    const exempt = new Set([...EXEMPT_NAMES, ...(opts.exemptNames || [])]);

    function hasPrefix(name) {
      return VALID_PREFIXES.some(p => name.startsWith(p) && name.length > p.length && name[p.length] === name[p.length].toUpperCase());
    }

    function isBool(node) {
      if (node.init?.type === "Literal" && typeof node.init.value === "boolean") return true;
      if (node.init?.type === "BinaryExpression" && ["===", "!==", "==", "!=", "<", ">", "<=", ">="].includes(node.init.operator)) return true;
      if (node.init?.type === "LogicalExpression") return true;
      if (node.init?.type === "UnaryExpression" && node.init.operator === "!") return true;
      if (node.id?.typeAnnotation?.typeAnnotation?.type === "TSBooleanKeyword") return true;
      return false;
    }

    const fn = context.getFilename?.() || "";
    if (fn.includes(".test.") || fn.includes(".spec.")) return {};

    return {
      VariableDeclarator(node) {
        if (node.id?.type === "Identifier" && isBool(node)) {
          const name = node.id.name;
          if (!exempt.has(name) && !name.startsWith("_") && !hasPrefix(name)) {
            context.report({ node: node.id, messageId: "missingPrefix", data: { name, capitalized: name.charAt(0).toUpperCase() + name.slice(1) } });
          }
        }
      },
      TSPropertySignature(node) {
        if (node.key?.type === "Identifier" && node.typeAnnotation?.typeAnnotation?.type === "TSBooleanKeyword") {
          const name = node.key.name;
          if (!exempt.has(name) && !hasPrefix(name)) {
            context.report({ node: node.key, messageId: "missingPrefix", data: { name, capitalized: name.charAt(0).toUpperCase() + name.slice(1) } });
          }
        }
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: no-magic-strings (CODE RED)
// ═══════════════════════════════════════════════════════════════

const TYPEOF_VALUES = new Set(["string", "number", "boolean", "undefined", "object", "function", "bigint", "symbol"]);

const noMagicStrings = {
  meta: {
    type: "suggestion",
    docs: { description: "No raw string literals in comparisons — use enum or typed constants (CODE RED)" },
    messages: {
      magicString: '🔴 CODE RED: Magic string "{{value}}" in comparison. Use an enum constant or typed constant instead.',
    },
    schema: [{ type: "object", properties: { allowedStrings: { type: "array", items: { type: "string" } } }, additionalProperties: false }],
  },
  create(context) {
    const allowed = new Set(context.options[0]?.allowedStrings || []);
    const fn = context.getFilename?.() || "";
    if (fn.includes(".test.") || fn.includes(".spec.")) return {};

    function isExempt(v) {
      if (v === "" || v.length === 1) return true;
      if (TYPEOF_VALUES.has(v) || allowed.has(v)) return true;
      if (v.startsWith("/") || v.startsWith("http") || v.startsWith(".")) return true;
      return false;
    }

    function check(node, strNode) {
      if (strNode.type !== "Literal" || typeof strNode.value !== "string") return;
      if (isExempt(strNode.value)) return;
      const other = node.left === strNode ? node.right : node.left;
      if (other?.type === "UnaryExpression" && other.operator === "typeof") return;
      context.report({ node: strNode, messageId: "magicString", data: { value: strNode.value } });
    }

    return {
      BinaryExpression(node) {
        if (!["===", "!==", "==", "!="].includes(node.operator)) return;
        if (node.left.type === "Literal") check(node, node.left);
        if (node.right.type === "Literal") check(node, node.right);
      },
      SwitchCase(node) {
        if (node.test?.type === "Literal" && typeof node.test.value === "string" && !isExempt(node.test.value)) {
          context.report({ node: node.test, messageId: "magicString", data: { value: node.test.value } });
        }
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: max-function-lines (CODE RED)
// ═══════════════════════════════════════════════════════════════

const maxFunctionLines = {
  meta: {
    type: "problem",
    docs: { description: "Function bodies must not exceed 15 lines (CODE RED)" },
    messages: {
      tooLong: '🔴 CODE RED: Function "{{name}}" has {{actual}} lines (max {{max}}). Extract logic into smaller helpers.',
    },
    schema: [{ type: "object", properties: { max: { type: "integer", minimum: 1, default: 15 } }, additionalProperties: false }],
  },
  create(context) {
    const maxL = context.options[0]?.max || 15;
    const src = context.getSourceCode();

    function check(node) {
      const body = node.body;
      if (!body || body.type !== "BlockStatement") return;
      const start = body.loc.start.line + 1;
      const end = body.loc.end.line;
      const lines = src.lines.slice(start - 1, end - 1);
      let count = 0;
      for (const l of lines) {
        const t = l.trim();
        if (t === "" || t.startsWith("//") || t.startsWith("*") || t === "/*" || t === "*/") continue;
        count++;
      }
      if (count > maxL) {
        let name = node.id?.name || node.parent?.key?.name || (node.parent?.type === "VariableDeclarator" ? node.parent.id?.name : null) || "(anonymous)";
        context.report({ node, messageId: "tooLong", data: { name, actual: count, max: maxL } });
      }
    }

    return { FunctionDeclaration: check, FunctionExpression: check, ArrowFunctionExpression: check };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: promise-all-independent (CODE RED)
// ═══════════════════════════════════════════════════════════════

const promiseAllIndependent = {
  meta: {
    type: "problem",
    docs: { description: "Use Promise.all() for independent async calls (CODE RED)" },
    messages: {
      sequentialIndependent: '🔴 CODE RED: Sequential `await` on independent promises. Use `Promise.all([...])` instead. "{{names}}" do not depend on each other.',
    },
    schema: [],
  },
  create(context) {
    const src = context.getSourceCode();

    function getName(stmt) {
      if (stmt.type === "VariableDeclaration" && stmt.declarations[0]?.id) return stmt.declarations[0].id.name;
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "AssignmentExpression" && stmt.expression.left.type === "Identifier") return stmt.expression.left.name;
      return null;
    }

    function getAwait(stmt) {
      if (stmt.type === "VariableDeclaration" && stmt.declarations[0]?.init?.type === "AwaitExpression") return stmt.declarations[0].init;
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "AwaitExpression") return stmt.expression;
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "AssignmentExpression" && stmt.expression.right.type === "AwaitExpression") return stmt.expression.right;
      return null;
    }

    return {
      BlockStatement(node) {
        for (let i = 0; i < node.body.length - 1; i++) {
          const a1 = getAwait(node.body[i]), a2 = getAwait(node.body[i + 1]);
          if (!a1 || !a2) continue;
          const n1 = getName(node.body[i]);
          const text = src.getText(a2);
          if (!n1 || !new RegExp(`\\b${n1}\\b`).test(text)) {
            context.report({ node: node.body[i + 1], messageId: "sequentialIndependent", data: { names: `${n1 || "await#1"}, ${getName(node.body[i + 1]) || "await#2"}` } });
          }
        }
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: blank-line-before-return (Style)
// ═══════════════════════════════════════════════════════════════

const blankLineBeforeReturn = {
  meta: {
    type: "layout",
    docs: { description: "Require blank line before return/throw (R4)" },
    fixable: "whitespace",
    messages: { missingBlankLine: "Missing blank line before `{{keyword}}`." },
    schema: [],
  },
  create(context) {
    const src = context.getSourceCode();
    function chk(node, kw) {
      if (node.parent?.type !== "BlockStatement") return;
      const sibs = node.parent.body;
      const idx = sibs.indexOf(node);
      if (idx === 0 || sibs.length === 1) return;
      const prev = sibs[idx - 1];
      if (prev.type === "ReturnStatement" || prev.type === "ThrowStatement") return;
      if (node.loc.start.line - prev.loc.end.line < 2) {
        context.report({ node, messageId: "missingBlankLine", data: { keyword: kw }, fix(f) { return f.insertTextAfter(src.getTokenBefore(node), "\n"); } });
      }
    }
    return { ReturnStatement(n) { chk(n, "return"); }, ThrowStatement(n) { chk(n, "throw"); } };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule: no-else-after-return (Style)
// ═══════════════════════════════════════════════════════════════

const noElseAfterReturn = {
  meta: {
    type: "suggestion",
    docs: { description: "No else after return/throw/continue/break (R7)" },
    messages: { noElse: 'Unnecessary `else` after `{{keyword}}`. Remove and un-indent.' },
    schema: [],
  },
  create(context) {
    function getTerminator(block) {
      if (!block) return null;
      const stmts = block.type === "BlockStatement" ? block.body : [block];
      if (!stmts?.length) return null;
      const last = stmts[stmts.length - 1];
      return { ReturnStatement: "return", ThrowStatement: "throw", ContinueStatement: "continue", BreakStatement: "break" }[last.type] || null;
    }
    return {
      IfStatement(node) {
        if (!node.alternate) return;
        const kw = getTerminator(node.consequent);
        if (kw) context.report({ node: node.alternate, messageId: "noElse", data: { keyword: kw } });
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Plugin Export
// ═══════════════════════════════════════════════════════════════

export default {
  rules: {
    "no-nested-if": noNestedIf,
    "boolean-naming": booleanNaming,
    "no-magic-strings": noMagicStrings,
    "max-function-lines": maxFunctionLines,
    "promise-all-independent": promiseAllIndependent,
    "blank-line-before-return": blankLineBeforeReturn,
    "no-else-after-return": noElseAfterReturn,
  },
};
