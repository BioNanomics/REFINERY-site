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

  it('expands FRC to the FIRST mark plus "Robotics Competition", never the bare abbreviation', () => {
    const tree = root(element('p', [text('FRC teams build robots')]));
    run(tree);
    const children = tree.children[0].children;
    expect(children[0]).toMatchObject({
      tagName: 'i',
      children: [{ type: 'text', value: 'FIRST' }],
    });
    expect(children[1]).toMatchObject({ tagName: 'sup' });
    expect(children[2]).toEqual({ type: 'text', value: ' Robotics Competition' });
    expect(children[3]).toEqual({ type: 'text', value: ' teams build robots' });
  });

  it('expands FTC to the FIRST mark plus "Tech Challenge"', () => {
    const tree = root(element('p', [text('an FTC event')]));
    run(tree);
    const children = tree.children[0].children;
    expect(children[1]).toMatchObject({
      tagName: 'i',
      children: [{ type: 'text', value: 'FIRST' }],
    });
    expect(children[3]).toEqual({ type: 'text', value: ' Tech Challenge' });
  });

  it('does not italicize LEGO, but does mark its first use', () => {
    const tree = root(element('p', [text('LEGO bricks')]));
    run(tree);
    const children = tree.children[0].children;
    expect(children[0]).toEqual({ type: 'text', value: 'LEGO' });
    expect(children[1]).toMatchObject({ tagName: 'sup' });
  });

  it('shares the FIRST claim between a bare mention and an FRC/FTC expansion', () => {
    const tree = root(
      element('p', [text('FIRST is great.')]),
      element('p', [text('Our FRC team competes every spring.')]),
    );
    run(tree);
    const secondParagraph = tree.children[1].children;
    // The expansion still gets the italic FIRST, but no second ® — FIRST was already
    // claimed by the first paragraph's bare mention.
    expect(secondParagraph.some((n: any) => n.tagName === 'i')).toBe(true);
    expect(secondParagraph.some((n: any) => n.tagName === 'sup')).toBe(false);
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
