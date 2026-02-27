export const MPDF_VERSION = '0.1.0';
export const MPDF_MIME_TYPE = 'application/vnd.mpdf+zip';
export const MPDF_EXTENSION = '.mpdf';

export const COMMONMARK_SPEC = 'commonmark-0.31';

export const SUPPORTED_EXTENSIONS = [
  'tables',
  'footnotes',
  'strikethrough',
  'task-lists',
  'math-katex',
  'mermaid',
  'syntax-highlight',
  'admonitions',
  'toc',
] as const;

export const REQUIRED_FILES = ['content.md', 'manifest.json'] as const;

export const OPTIONAL_DIRECTORIES = ['style/', 'fonts/', 'assets/'] as const;

export const PAGE_SIZES = ['A4', 'letter', 'legal'] as const;
export const ORIENTATIONS = ['portrait', 'landscape'] as const;

export const DEFAULT_PAGE_CONFIG = {
  size: 'A4' as const,
  margins: { top: 25, bottom: 25, left: 20, right: 20 },
  orientation: 'portrait' as const,
  header: true,
  footer: true,
  page_numbers: true,
};

export const DEFAULT_THEME = 'mpdf-standard-v1';
