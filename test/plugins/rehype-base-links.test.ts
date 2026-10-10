import { describe, expect, it } from 'vitest';
import rehypeBaseLinks from '../../src/plugins/rehype-base-links.mjs';

function link(href: string) {
  return { type: 'element', tagName: 'a', properties: { href }, children: [] };
}

function root(...children: any[]) {
  return { type: 'root', children };
}

function run(tree: any, base?: string) {
  rehypeBaseLinks(base === undefined ? undefined : { base })(tree);
  return tree;
}

const hrefOf = (tree: any, i = 0) => tree.children[i].properties.href;

describe('rehypeBaseLinks', () => {
  it('prefixes the base onto a root-relative link', () => {
    expect(hrefOf(run(root(link('/news/x/')), '/preview'))).toBe('/preview/news/x/');
  });

  it('accepts a base written with a trailing slash', () => {
    expect(hrefOf(run(root(link('/news/x/')), '/preview/'))).toBe('/preview/news/x/');
  });

  it('does nothing when the base is the domain root', () => {
    expect(hrefOf(run(root(link('/news/x/')), '/'))).toBe('/news/x/');
    expect(hrefOf(run(root(link('/news/x/'))))).toBe('/news/x/');
  });

  it('never prefixes a link twice', () => {
    const tree = root(link('/preview/news/x/'), link('/preview'));
    run(tree, '/preview');
    expect(hrefOf(tree, 0)).toBe('/preview/news/x/');
    expect(hrefOf(tree, 1)).toBe('/preview');
  });

  it('only prefixes a base that matches a whole path segment', () => {
    // "/preview-old" starts with the base text but is a different path.
    expect(hrefOf(run(root(link('/preview-old/')), '/preview'))).toBe(
      '/preview/preview-old/',
    );
  });

  it('leaves external, protocol-relative, anchor, and mailto links alone', () => {
    const hrefs = ['https://example.com/', '//cdn.example.com/x', '#section', 'mailto:info@refineryrobotics.org'];
    const tree = run(root(...hrefs.map(link)), '/preview');
    hrefs.forEach((href, i) => expect(hrefOf(tree, i)).toBe(href));
  });

  it('finds a link nested inside other elements', () => {
    const tree = root({ type: 'element', tagName: 'p', properties: {}, children: [link('/classes/')] });
    run(tree, '/preview');
    expect(tree.children[0].children[0].properties.href).toBe('/preview/classes/');
  });
});
