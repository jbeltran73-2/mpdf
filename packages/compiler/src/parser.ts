import MarkdownIt from 'markdown-it';
import footnotePlugin from 'markdown-it-footnote';
import taskListPlugin from 'markdown-it-task-lists';
import type Token from 'markdown-it/lib/token.mjs';

let md: MarkdownIt | null = null;

function getParser(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });
    md.use(footnotePlugin);
    md.use(taskListPlugin, { enabled: true, label: true });
  }
  return md;
}

export function getTokens(markdown: string): Token[] {
  return getParser().parse(markdown, {});
}

export function renderHtml(markdown: string): string {
  return getParser().render(markdown);
}
