import { z } from 'zod';

export const MarginsSchema = z.object({
  top: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
  right: z.number().min(0),
});

export const PageConfigSchema = z.object({
  size: z.enum(['A4', 'letter', 'legal']),
  margins: MarginsSchema,
  orientation: z.enum(['portrait', 'landscape']),
  header: z.boolean(),
  footer: z.boolean(),
  page_numbers: z.boolean(),
});

export const MarkdownConfigSchema = z.object({
  spec: z.string(),
  extensions: z.array(z.string()),
});

export const AiMetadataSchema = z.object({
  content_hash: z.string().startsWith('sha256:'),
  word_count: z.number().int().min(0),
  heading_count: z.number().int().min(0),
  table_count: z.number().int().min(0),
  code_block_count: z.number().int().min(0),
  image_count: z.number().int().min(0),
  language_detected: z.string().min(2).max(10),
});

export const ManifestSchema = z.object({
  mpdf_version: z.string(),
  title: z.string(),
  author: z.string(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
  language: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  page: PageConfigSchema,
  theme: z.string(),
  markdown: MarkdownConfigSchema,
  ai: AiMetadataSchema,
  checksum: z.string().startsWith('sha256:'),
});

export type ManifestInput = z.input<typeof ManifestSchema>;
export type ManifestOutput = z.output<typeof ManifestSchema>;
