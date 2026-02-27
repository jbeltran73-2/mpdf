import { describe, it, expect } from 'vitest';
import { ManifestSchema } from '../src/manifest.js';

const validManifest = {
  mpdf_version: '0.1.0',
  title: 'Test Document',
  author: 'Test Author',
  created: '2026-02-27T10:00:00Z',
  modified: '2026-02-27T10:00:00Z',
  language: 'en',
  description: 'A test document',
  tags: ['test'],
  page: {
    size: 'A4' as const,
    margins: { top: 25, bottom: 25, left: 20, right: 20 },
    orientation: 'portrait' as const,
    header: true,
    footer: true,
    page_numbers: true,
  },
  theme: 'mpdf-standard-v1',
  markdown: {
    spec: 'commonmark-0.31',
    extensions: ['tables', 'footnotes'],
  },
  ai: {
    content_hash: 'sha256:abc123',
    word_count: 100,
    heading_count: 5,
    table_count: 2,
    code_block_count: 3,
    image_count: 1,
    language_detected: 'en',
  },
  checksum: 'sha256:def456',
};

describe('ManifestSchema', () => {
  it('validates a correct manifest', () => {
    const result = ManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = ManifestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid page size', () => {
    const invalid = { ...validManifest, page: { ...validManifest.page, size: 'B5' } };
    const result = ManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const invalid = { ...validManifest, created: 'not-a-date' };
    const result = ManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative word count', () => {
    const invalid = {
      ...validManifest,
      ai: { ...validManifest.ai, word_count: -1 },
    };
    const result = ManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects content_hash without sha256: prefix', () => {
    const invalid = {
      ...validManifest,
      ai: { ...validManifest.ai, content_hash: 'abc123' },
    };
    const result = ManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts letter page size', () => {
    const letterPage = { ...validManifest, page: { ...validManifest.page, size: 'letter' } };
    const result = ManifestSchema.safeParse(letterPage);
    expect(result.success).toBe(true);
  });

  it('accepts landscape orientation', () => {
    const landscape = {
      ...validManifest,
      page: { ...validManifest.page, orientation: 'landscape' },
    };
    const result = ManifestSchema.safeParse(landscape);
    expect(result.success).toBe(true);
  });
});
