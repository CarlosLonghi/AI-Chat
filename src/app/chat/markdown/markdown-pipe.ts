import { Pipe, PipeTransform } from '@angular/core';
import { Marked } from 'marked';

const marked = new Marked({
  async: false,
  breaks: true,
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
