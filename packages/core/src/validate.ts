import { createHash } from 'node:crypto';
import { ManifestSchema } from './manifest.js';
import type { MpdfValidationResult } from './types.js';
import { REQUIRED_FILES } from './constants.js';

export interface ValidationInput {
  fileList: string[];
  manifestJson: unknown;
  contentMd?: Buffer;
  signatureSha256?: string;
}

export function validateMpdf(input: ValidationInput): MpdfValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of REQUIRED_FILES) {
    if (!input.fileList.includes(file)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  const manifestResult = ManifestSchema.safeParse(input.manifestJson);
  if (!manifestResult.success) {
    for (const issue of manifestResult.error.issues) {
      errors.push(`Manifest: ${issue.path.join('.')} - ${issue.message}`);
    }
  }

  if (!input.fileList.some((f) => f.startsWith('style/'))) {
    warnings.push('No style/ directory found');
  }

  if (!input.fileList.some((f) => f.startsWith('fonts/'))) {
    warnings.push('No fonts/ directory found');
  }

  if (input.contentMd && manifestResult.success) {
    const hash = createHash('sha256').update(input.contentMd).digest('hex');
    const expected = manifestResult.data.ai.content_hash.replace('sha256:', '');
    if (hash !== expected) {
      errors.push('Content hash mismatch: content.md has been modified');
    }
  }

  if (input.signatureSha256 && input.contentMd) {
    const hash = createHash('sha256').update(input.contentMd).digest('hex');
    if (input.signatureSha256.trim() !== hash) {
      errors.push('Signature mismatch: signature.sha256 does not match content.md');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
