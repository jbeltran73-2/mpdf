export interface MpdfManifest {
  mpdf_version: string;
  title: string;
  author: string;
  created: string;
  modified: string;
  language: string;
  description: string;
  tags: string[];
  page: PageConfig;
  theme: string;
  markdown: MarkdownConfig;
  ai: AiMetadata;
  checksum: string;
}

export interface PageConfig {
  size: 'A4' | 'letter' | 'legal';
  margins: Margins;
  orientation: 'portrait' | 'landscape';
  header: boolean;
  footer: boolean;
  page_numbers: boolean;
}

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MarkdownConfig {
  spec: string;
  extensions: string[];
}

export interface AiMetadata {
  content_hash: string;
  word_count: number;
  heading_count: number;
  table_count: number;
  code_block_count: number;
  image_count: number;
  language_detected: string;
}

export interface MpdfCompileOptions {
  input: string;
  output?: string;
  theme?: string;
  page?: Partial<PageConfig>;
  author?: string;
  title?: string;
  language?: string;
  tags?: string[];
  description?: string;
}

export interface MpdfValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssetEntry {
  originalPath: string;
  archivePath: string;
  buffer: Buffer;
}

export interface MpdfContents {
  content: string;
  manifest: MpdfManifest;
  assets: Map<string, Buffer>;
}
