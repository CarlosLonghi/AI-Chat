import { Pipe, PipeTransform } from '@angular/core';
import { Marked } from 'marked';

// Fenced code with a language: add a header strip that names it.
const LANGUAGE_BLOCK = /<pre><code class="language-([^"\s]+)">([\s\S]*?)<\/code><\/pre>/g;

const marked = new Marked({
  async: false,
  breaks: true,
  hooks: {
    postprocess: (html) =>
      html.replace(
        LANGUAGE_BLOCK,
        (_, lang: string, code: string) =>
          `<div class="code-block"><div class="code-lang">${lang}</div><pre><code class="language-${lang}">${code}</code></pre></div>`,
      ),
  },
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
  },
});

/**
 * Converts markdown to HTML. Meant to be bound to `[innerHTML]`, where Angular
 * sanitizes the result, so untrusted model output cannot inject scripts.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    return marked.parse(value) as string;
  }
}
