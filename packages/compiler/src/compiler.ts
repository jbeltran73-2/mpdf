import { readFileSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { parseFrontmatter } from './frontmatter.js';
import { getTokens } from './parser.js';
import { resolveAssets } from './resolver.js';
import { extractMetadata } from './metadata.js';
import { loadTheme } from './theme.js';
import { packageMpdf } from './packager.js';
import { computeHash } from './integrity.js';
import { detectLanguage } from './language.js';
import type { MpdfCompileOptions, MpdfManifest } from '@mpdf/core';
import {
  MPDF_VERSION,
  COMMONMARK_SPEC,
  SUPPORTED_EXTENSIONS,
  DEFAULT_PAGE_CONFIG,
  DEFAULT_THEME,
} from '@mpdf/core';

export async function compile(options: MpdfCompileOptions): Promise<string> {
  const inputPath = resolve(options.input);
  const raw = readFileSync(inputPath, 'utf-8');

  // 1. Parse frontmatter
  const { content: markdownContent, data: frontmatter } = parseFrontmatter(raw);

  // 2. Parse markdown to tokens
  const tokens = getTokens(markdownContent);

  // 3. Resolve images and assets
  const { rewrittenContent, assets } = await resolveAssets(
    markdownContent,
    tokens,
    dirname(inputPath),
  );

  // 4. Extract AI metadata
  const metadata = extractMetadata(tokens, rewrittenContent);

  // 5. Compute content hash
  const contentBuffer = Buffer.from(rewrittenContent, 'utf-8');
  const contentHash = computeHash(contentBuffer);

  // 6. Detect language
  const language =
    options.language ||
    (frontmatter.lang as string) ||
    (frontmatter.language as string) ||
    detectLanguage(rewrittenContent);

  // 7. Build manifest
  const now = new Date().toISOString();
  const title =
    options.title || (frontmatter.title as string) || basename(inputPath, extname(inputPath));
  const author = options.author || (frontmatter.author as string) || '';
  const description = options.description || (frontmatter.description as string) || '';
  const tags = options.tags || (frontmatter.tags as string[]) || [];

  const pageSize = options.page?.size || DEFAULT_PAGE_CONFIG.size;

  const manifest: MpdfManifest = {
    mpdf_version: MPDF_VERSION,
    title,
    author,
    created: (frontmatter.date as string) || now,
    modified: now,
    language,
    description,
    tags,
    page: {
      ...DEFAULT_PAGE_CONFIG,
      size: pageSize,
      ...options.page,
    },
    theme: DEFAULT_THEME,
    markdown: {
      spec: COMMONMARK_SPEC,
      extensions: [...SUPPORTED_EXTENSIONS],
    },
    ai: {
      content_hash: `sha256:${contentHash}`,
      word_count: metadata.word_count,
      heading_count: metadata.heading_count,
      table_count: metadata.table_count,
      code_block_count: metadata.code_block_count,
      image_count: metadata.image_count,
      language_detected: language,
    },
    checksum: '', // Set by packager
  };

  // 8. Load theme
  const themeAssets = loadTheme('standard');

  // 9. Package into .mpdf
  const outputPath = options.output || inputPath.replace(/\.md$/, '.mpdf');
  await packageMpdf({
    outputPath: resolve(outputPath),
    contentMd: rewrittenContent,
    manifest,
    assets,
    themeAssets,
    contentHash,
  });

  return resolve(outputPath);
}
