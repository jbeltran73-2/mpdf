import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { compile } from '../src/compiler.js';
import { readZip } from '../src/zip-reader.js';

const testDir = join(tmpdir(), 'mpdf-compiler-test-' + Date.now());
const inputMd = join(testDir, 'test.md');
const outputMpdf = join(testDir, 'test.mpdf');

beforeAll(() => {
  mkdirSync(testDir, { recursive: true });
  writeFileSync(
    inputMd,
    `---
title: Test Document
author: Test Author
lang: en
---

# Hello World

This is a test document for the MPDF compiler.

## Section Two

Some text with **bold** and *italic*.

| Col A | Col B |
|-------|-------|
| 1     | 2     |

\`\`\`javascript
console.log("hello");
\`\`\`
`,
  );
});

afterAll(() => {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
});

describe('compile', () => {
  it('compiles a markdown file to .mpdf', async () => {
    const result = await compile({ input: inputMd, output: outputMpdf });
    expect(result).toBe(outputMpdf);
    expect(existsSync(outputMpdf)).toBe(true);
  });

  it('produces a valid ZIP with required files', async () => {
    const zip = await readZip(outputMpdf);
    expect(zip.fileList).toContain('content.md');
    expect(zip.fileList).toContain('manifest.json');
    expect(zip.fileList).toContain('signature.sha256');
    expect(zip.fileList.some((f) => f.startsWith('style/'))).toBe(true);
    expect(zip.fileList.some((f) => f.startsWith('fonts/'))).toBe(true);
  });

  it('produces a valid manifest with AI metadata', async () => {
    const zip = await readZip(outputMpdf, ['manifest.json']);
    const manifest = JSON.parse(zip.files.get('manifest.json')!.toString('utf-8'));

    expect(manifest.mpdf_version).toBe('0.1.0');
    expect(manifest.title).toBe('Test Document');
    expect(manifest.author).toBe('Test Author');
    expect(manifest.language).toBe('en');
    expect(manifest.ai.heading_count).toBe(2);
    expect(manifest.ai.table_count).toBe(1);
    expect(manifest.ai.code_block_count).toBe(1);
    expect(manifest.ai.word_count).toBeGreaterThan(0);
    expect(manifest.ai.content_hash).toMatch(/^sha256:/);
  });

  it('preserves markdown content (minus frontmatter)', async () => {
    const zip = await readZip(outputMpdf, ['content.md']);
    const content = zip.files.get('content.md')!.toString('utf-8');

    expect(content).toContain('# Hello World');
    expect(content).toContain('## Section Two');
    expect(content).toContain('console.log("hello")');
    // Frontmatter should be stripped (check for YAML frontmatter markers)
    expect(content).not.toContain('title: Test Document');
    expect(content).not.toContain('author: Test Author');
  });
});
