import { describe, expect, it } from 'vitest';
import rehypeExternalLinks from '../../src/plugins/rehype-external-links.mjs';

function link(href: string, properties: Record<string, unknown> = {}) {
  return { type: 'element', tagName: 'a', properties: { href, ...properties }, children: [] };
}

function root(...children: any[]) {
  return { type: 'root', children };
}

function run(tree: any) {
  rehypeExternalLinks()(tree);
  return tree;
}

describe('rehypeExternalLinks', () => {
  it('marks an http(s) link as external', () => {
    const tree = root(link('https://example.com'));
    run(tree);
    expect(tree.children[0].properties.target).toBe('_blank');
    expect(tree.children[0].properties.rel).toEqual(['noopener', 'noreferrer']);
  });

  it('matches http as well as https', () => {
    const tree = root(link('http://example.com'));
    run(tree);
    expect(tree.children[0].properties.target).toBe('_blank');
  });

  it('leaves a relative link untouched', () => {
    const tree = root(link('/about'));
    run(tree);
    expect(tree.children[0].properties.target).toBeUndefined();
    expect(tree.children[0].properties.rel).toBeUndefined();
  });

  it('leaves an in-page anchor untouched', () => {
    const tree = root(link('#section'));
    run(tree);
    expect(tree.children[0].properties.target).toBeUndefined();
  });

  it('leaves mailto: and tel: links untouched', () => {
    const tree = root(link('mailto:info@refineryrobotics.org'), link('tel:+12605551234'));
    run(tree);
    expect(tree.children[0].properties.target).toBeUndefined();
    expect(tree.children[1].properties.target).toBeUndefined();
  });

  it('preserves an existing target/rel rather than overwriting it', () => {
    const tree = root(link('https://example.com', { target: '_self', rel: ['nofollow'] }));
    run(tree);
    expect(tree.children[0].properties.target).toBe('_self');
    expect(tree.children[0].properties.rel).toEqual(['nofollow']);
  });

  it('finds an external link nested inside other elements', () => {
    const tree = root({
      type: 'element',
      tagName: 'p',
      properties: {},
      children: [link('https://example.com')],
    });
    run(tree);
    expect(tree.children[0].children[0].properties.target).toBe('_blank');
  });

  it('ignores non-anchor elements and text nodes', () => {
    const tree = root(
      { type: 'text', value: 'hello' },
      { type: 'element', tagName: 'p', properties: {}, children: [] },
    );
    expect(() => run(tree)).not.toThrow();
  });
});
