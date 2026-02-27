import { describe, it, expect } from 'vitest';
import { getTokens } from '../src/parser.js';
import { extractMetadata } from '../src/metadata.js';

describe('extractMetadata', () => {
  it('counts headings correctly', () => {
    const md = '# H1\n\n## H2\n\n### H3\n\nText here.';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    expect(meta.heading_count).toBe(3);
  });

  it('counts tables correctly', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |\n\nText\n\n| C | D |\n|---|---|\n| 3 | 4 |';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    expect(meta.table_count).toBe(2);
  });

  it('counts code blocks correctly', () => {
    const md = '```js\nconsole.log("hi");\n```\n\nText\n\n```python\nprint("hi")\n```';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    expect(meta.code_block_count).toBe(2);
  });

  it('counts words excluding code blocks', () => {
    const md = 'Hello world.\n\n```js\nconst x = 1;\n```\n\nGoodbye world.';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    // "Hello world." + "Goodbye world." = 4 words (code block excluded)
    expect(meta.word_count).toBeGreaterThanOrEqual(3);
    expect(meta.word_count).toBeLessThanOrEqual(5);
  });

  it('counts images correctly', () => {
    const md = '![Alt1](img1.png)\n\nText\n\n![Alt2](img2.png)';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    expect(meta.image_count).toBe(2);
  });

  it('returns zero counts for empty markdown', () => {
    const md = '';
    const tokens = getTokens(md);
    const meta = extractMetadata(tokens, md);
    expect(meta.heading_count).toBe(0);
    expect(meta.table_count).toBe(0);
    expect(meta.code_block_count).toBe(0);
    expect(meta.image_count).toBe(0);
  });
});
