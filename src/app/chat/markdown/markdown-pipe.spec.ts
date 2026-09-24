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

  it('should label fenced code blocks that declare a language', () => {
    const html = pipe.transform('```java\nint x = 1 < 2;\n```');
    expect(html).toContain('<div class="code-block"><div class="code-lang">java</div>');
    expect(html).toContain('int x = 1 &lt; 2;');
  });

  it('should leave fenced code without a language as a plain block', () => {
    expect(pipe.transform('```\nx\n```')).not.toContain('code-block');
  });
});
