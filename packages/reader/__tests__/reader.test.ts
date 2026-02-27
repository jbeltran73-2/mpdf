import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { extractMarkdown, readMpdf, getManifest, validate } from '../src/index.js';

// We'll compile a test .mpdf using the compiler
const testDir = join(tmpdir(), 'mpdf-reader-test-' + Date.now());
const inputMd = join(testDir, 'test.md');
const testMpdf = join(testDir, 'test.mpdf');

beforeAll(async () => {
  mkdirSync(testDir, { recursive: true });
  writeFileSync(
    inputMd,
    `---
title: Reader Test
author: Test
lang: en
---

# Test Heading

This is a test for the reader library.

| A | B |
|---|---|
| 1 | 2 |
`,
  );

  // Use the compiler to build a test .mpdf
  const { compile } = await import('../../compiler/src/compiler.js');
  await compile({ input: inputMd, output: testMpdf });
});

afterAll(() => {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
});

describe('extractMarkdown', () => {
  it('extracts markdown content from .mpdf', async () => {
    const content = await extractMarkdown(testMpdf);
    expect(content).toContain('# Test Heading');
    expect(content).toContain('This is a test for the reader library.');
  });
});

describe('readMpdf', () => {
  it('reads content and manifest', async () => {
    const result = await readMpdf(testMpdf);
    expect(result.content).toContain('# Test Heading');
    expect(result.manifest.title).toBe('Reader Test');
    expect(result.manifest.author).toBe('Test');
    expect(result.manifest.ai.heading_count).toBe(1);
    expect(result.manifest.ai.table_count).toBe(1);
  });
});

describe('getManifest', () => {
  it('reads only the manifest', async () => {
    const manifest = await getManifest(testMpdf);
    expect(manifest.mpdf_version).toBe('0.1.0');
    expect(manifest.title).toBe('Reader Test');
    expect(manifest.language).toBe('en');
  });
});

describe('validate', () => {
  it('validates a correct .mpdf file', async () => {
    const result = await validate(testMpdf);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
