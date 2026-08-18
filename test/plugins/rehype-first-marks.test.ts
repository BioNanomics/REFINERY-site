import { describe, expect, it } from 'vitest';
import rehypeFirstMarks from '../../src/plugins/rehype-first-marks.mjs';

function text(value: string) {
  return { type: 'text', value };
}

function element(tagName: string, children: any[]) {
  return { type: 'element', tagName, properties: {}, children };
}

function root(...children: any[]) {
  return { type: 'root', children };
}

function run(tree: any) {
  rehypeFirstMarks()(tree);
  return tree;
}

describe('rehypeFirstMarks', () => {
  it('wraps FIRST in an italic mark and appends a ® on first use', () => {
    const tree = root(element('p', [text('Join FIRST today')]));
    run(tree);
    const children = tree.children[0].children;
    expect(children[0]).toEqual({ type: 'text', value: 'Join ' });
    expect(children[1]).toMatchObject({
      type: 'element',
      tagName: 'i',
      properties: { className: ['first-mark'] },
      children: [{ type: 'text', value: 'FIRST' }],
    });
    expect(children[2]).toMatchObject({
      type: 'element',
      tagName: 'sup',
      properties: { className: ['first-reg'] },
      children: [{ type: 'text', value: '®' }],
    });
    expect(children[3]).toEqual({ type: 'text', value: ' today' });
  });

  it('does not italicize FRC/FTC/LEGO, but does mark their first use', () => {
    const tree = root(element('p', [text('FRC teams build robots')]));
    run(tree);
    const children = tree.children[0].children;
    expect(children[0]).toEqual({ type: 'text', value: 'FRC' });
    expect(children[1]).toMatchObject({ tagName: 'sup' });
  });

  it('only marks the first use of a token across the whole document', () => {
    const tree = root(
      element('p', [text('FIRST is great.')]),
      element('p', [text('We love FIRST.')]),
    );
    run(tree);
    const firstParagraph = tree.children[0].children;
    const secondParagraph = tree.children[1].children;

    // First paragraph: text, <i>FIRST</i>, <sup>®</sup>, trailing text.
    expect(firstParagraph.some((n: any) => n.tagName === 'sup')).toBe(true);

    // Second paragraph gets the italic wrap but no second ® for the same token.
    expect(secondParagraph.some((n: any) => n.tagName === 'sup')).toBe(false);
    expect(secondParagraph.some((n: any) => n.tagName === 'i')).toBe(true);
  });

  it('does not touch text inside code/pre/kbd/samp', () => {
    const tree = root(element('code', [text('const FIRST = 1;')]));
    run(tree);
    expect(tree.children[0].children).toEqual([{ type: 'text', value: 'const FIRST = 1;' }]);
  });

  it('leaves plain text with no tokens unchanged', () => {
    const tree = root(element('p', [text('our first season')]));
    run(tree);
    expect(tree.children[0].children).toEqual([{ type: 'text', value: 'our first season' }]);
  });

  it('starts a fresh claim set on every plugin invocation', () => {
    const first = root(element('p', [text('FIRST')]));
    const second = root(element('p', [text('FIRST')]));
    run(first);
    run(second);
    expect(first.children[0].children.some((n: any) => n.tagName === 'sup')).toBe(true);
    expect(second.children[0].children.some((n: any) => n.tagName === 'sup')).toBe(true);
  });
});
