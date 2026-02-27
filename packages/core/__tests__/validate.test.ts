import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { validateMpdf } from '../src/validate.js';

const validManifest = {
  mpdf_version: '0.1.0',
  title: 'Test',
  author: 'Author',
  created: '2026-02-27T10:00:00Z',
  modified: '2026-02-27T10:00:00Z',
  language: 'en',
  description: '',
  tags: [],
  page: {
    size: 'A4',
    margins: { top: 25, bottom: 25, left: 20, right: 20 },
    orientation: 'portrait',
    header: true,
    footer: true,
    page_numbers: true,
  },
  theme: 'mpdf-standard-v1',
  markdown: { spec: 'commonmark-0.31', extensions: [] },
  ai: {
    content_hash: 'sha256:placeholder',
    word_count: 10,
    heading_count: 1,
    table_count: 0,
    code_block_count: 0,
    image_count: 0,
    language_detected: 'en',
  },
  checksum: 'sha256:abc',
};

describe('validateMpdf', () => {
  it('validates a complete valid input', () => {
    const content = Buffer.from('# Hello\n\nWorld');
    const hash = createHash('sha256').update(content).digest('hex');
    const manifest = {
      ...validManifest,
      ai: { ...validManifest.ai, content_hash: `sha256:${hash}` },
    };

    const result = validateMpdf({
      fileList: ['content.md', 'manifest.json', 'style/theme.css', 'fonts/inter.woff2'],
      manifestJson: manifest,
      contentMd: content,
      signatureSha256: hash,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports missing content.md', () => {
    const result = validateMpdf({
      fileList: ['manifest.json'],
      manifestJson: validManifest,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required file: content.md');
  });

  it('reports missing manifest.json', () => {
    const result = validateMpdf({
      fileList: ['content.md'],
      manifestJson: validManifest,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required file: manifest.json');
  });

  it('reports invalid manifest schema', () => {
    const result = validateMpdf({
      fileList: ['content.md', 'manifest.json'],
      manifestJson: { invalid: true },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('warns when style/ is missing', () => {
    const result = validateMpdf({
      fileList: ['content.md', 'manifest.json'],
      manifestJson: validManifest,
    });

    expect(result.warnings).toContain('No style/ directory found');
  });

  it('warns when fonts/ is missing', () => {
    const result = validateMpdf({
      fileList: ['content.md', 'manifest.json'],
      manifestJson: validManifest,
    });

    expect(result.warnings).toContain('No fonts/ directory found');
  });

  it('detects content hash mismatch', () => {
    const content = Buffer.from('# Modified content');
    const manifest = {
      ...validManifest,
      ai: { ...validManifest.ai, content_hash: 'sha256:wronghash' },
    };

    const result = validateMpdf({
      fileList: ['content.md', 'manifest.json'],
      manifestJson: manifest,
      contentMd: content,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Content hash mismatch: content.md has been modified');
  });
});
