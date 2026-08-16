/**
 * Styles FIRST® / FRC® / FTC® / LEGO® trademarks in Markdown and MDX bodies so content
 * authors only have to type the token in capitals. Mirrors src/utils/first.ts — keep the
 * two in sync.
 *
 * First use is tracked per document, which is exactly the "first use in body copy" FIRST's
 * trademark policy calls for. The surrounding page shell tracks its own heading/title first
 * use separately, via src/middleware.ts.
 */

const TOKEN_PATTERN = /\b(FIRST|FRC|FTC|LEGO)\b/g;

/** Never touch code — `FIRST` there is an identifier, not a trademark. */
const SKIPPED_TAGS = new Set(['code', 'pre', 'kbd', 'samp']);

function markSegments(value, claimed) {
  const nodes = [];
  let lastIndex = 0;

  for (const match of value.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, match.index) });
    }

    // Only the word "FIRST" is italicized; FRC, FTC, and LEGO are separate marks that
    // stay all caps and roman.
    nodes.push(
      token === 'FIRST'
        ? { type: 'element', tagName: 'i', properties: { className: ['first-mark'] }, children: [{ type: 'text', value: token }] }
        : { type: 'text', value: token },
    );

    if (!claimed.has(token)) {
      claimed.add(token);
      nodes.push({
        type: 'element',
        tagName: 'sup',
        properties: { className: ['first-reg'] },
        children: [{ type: 'text', value: '®' }],
      });
    }

    lastIndex = match.index + token.length;
  }

  if (!nodes.length) return null;
  if (lastIndex < value.length) {
    nodes.push({ type: 'text', value: value.slice(lastIndex) });
  }
  return nodes;
}

export default function rehypeFirstMarks() {
  return (tree) => {
    const claimed = new Set();

    const walk = (node) => {
      if (!node.children?.length) return;
      if (node.type === 'element' && SKIPPED_TAGS.has(node.tagName)) return;

      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        if (child.type === 'text') {
          const replacement = markSegments(child.value, claimed);
          if (replacement) {
            node.children.splice(i, 1, ...replacement);
            i += replacement.length - 1;
          }
        } else {
          walk(child);
        }
      }
    };

    walk(tree);
  };
}
