import type Token from 'markdown-it/lib/token.mjs';

export interface ExtractedMetadata {
  word_count: number;
  heading_count: number;
  table_count: number;
  code_block_count: number;
  image_count: number;
}

function countInChildren(tokens: Token[], type: string): number {
  let count = 0;
  for (const token of tokens) {
    if (token.children) {
      for (const child of token.children) {
        if (child.type === type) count++;
      }
    }
  }
  return count;
}

export function extractMetadata(tokens: Token[], content: string): ExtractedMetadata {
  let headingCount = 0;
  let tableCount = 0;
  let codeBlockCount = 0;

  for (const token of tokens) {
    switch (token.type) {
      case 'heading_open':
        headingCount++;
        break;
      case 'table_open':
        tableCount++;
        break;
      case 'fence':
      case 'code_block':
        codeBlockCount++;
        break;
    }
  }

  const imageCount = countInChildren(tokens, 'image');

  // Word count: strip fenced code blocks and inline code, count whitespace-separated words
  const textWithoutCode = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');
  const wordCount = textWithoutCode.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    word_count: wordCount,
    heading_count: headingCount,
    table_count: tableCount,
    code_block_count: codeBlockCount,
    image_count: imageCount,
  };
}
