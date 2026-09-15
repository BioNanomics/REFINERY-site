/**
 * Styles FIRST® / FRC® / FTC® / LEGO® trademarks in Markdown and MDX bodies so content
 * authors only have to type the token in capitals. Mirrors src/utils/first.ts — keep the
 * two in sync.
 *
 * FIRST has asked partner sites never to display the FRC/FTC program abbreviations — every
 * mention should spell out the full program name instead. So FRC/FTC don't render as
 * themselves here: typing either expands to the italicized FIRST mark plus its plain-text
 * program name ("Robotics Competition" / "Tech Challenge"), the same expansion
 * src/utils/first.ts applies to prop-based text. This keeps the "just type the token in
 * caps" authoring convention working for every existing and future team/people/news entry
 * without anyone having to spell it out by hand.
 *
 * First use is tracked per document, which is exactly the "first use in body copy" FIRST's
 * trademark policy calls for. The surrounding page shell tracks its own heading/title first
 * use separately, via src/middleware.ts.
 */

const TOKEN_PATTERN = /\b(FIRST|FRC|FTC|LEGO)\b/g;

/** Never touch code — `FIRST` there is an identifier, not a trademark. */
const SKIPPED_TAGS = new Set(['code', 'pre', 'kbd', 'samp']);

/** FRC/FTC's plain-text expansion — see the file header. */
const PROGRAM_NAME_SUFFIXES = { FRC: 'Robotics Competition', FTC: 'Tech Challenge' };

function markSegments(value, claimed) {
  const nodes = [];
  let lastIndex = 0;

  for (const match of value.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, match.index) });
    }

    const suffix = PROGRAM_NAME_SUFFIXES[token];

    if (token === 'FIRST' || suffix) {
      // Only the word "FIRST" is italicized — including the "FIRST" inside an expanded
      // FRC/FTC mention. The descriptive words that follow are not part of the word mark.
      nodes.push({
        type: 'element',
        tagName: 'i',
        properties: { className: ['first-mark'] },
        children: [{ type: 'text', value: 'FIRST' }],
      });
      if (!claimed.has('FIRST')) {
        claimed.add('FIRST');
        nodes.push({
          type: 'element',
          tagName: 'sup',
          properties: { className: ['first-reg'] },
          children: [{ type: 'text', value: '®' }],
        });
      }
      if (suffix) {
        nodes.push({ type: 'text', value: ` ${suffix}` });
      }
    } else {
      // LEGO: a separate registered mark that stays roman, marked on its own first use.
      nodes.push({ type: 'text', value: token });
      if (!claimed.has(token)) {
        claimed.add(token);
        nodes.push({
          type: 'element',
          tagName: 'sup',
          properties: { className: ['first-reg'] },
          children: [{ type: 'text', value: '®' }],
        });
      }
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
