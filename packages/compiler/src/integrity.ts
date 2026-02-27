import { createHash } from 'node:crypto';

export function computeHash(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function generateSignatureContent(contentMdHash: string): string {
  return contentMdHash + '\n';
}
