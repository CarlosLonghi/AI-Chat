import { MarkdownPipe } from './markdown-pipe';

describe('MarkdownPipe', () => {
  const pipe = new MarkdownPipe();

  it('should render bold, lists and code', () => {
    const html = pipe.transform('**oi**\n\n- a\n- b\n\n`x`');
    expect(html).toContain('<strong>oi</strong>');
    expect(html).toContain('<li>a</li>');
    expect(html).toContain('<code>x</code>');
  });

  it('should open links in a new tab', () => {
    expect(pipe.transform('[site](https://example.com)')).toContain('target="_blank"');
  });
});
