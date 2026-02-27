import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import type Token from 'markdown-it/lib/token.mjs';
import type { AssetEntry } from '@mpdf/core';

interface ResolveResult {
  rewrittenContent: string;
  assets: AssetEntry[];
}

function findImagePaths(tokens: Token[]): string[] {
  const paths: string[] = [];

  for (const token of tokens) {
    if (token.children) {
      for (const child of token.children) {
        if (child.type === 'image' && child.attrGet('src')) {
          paths.push(child.attrGet('src')!);
        }
      }
    }
  }

  return paths;
}

export async function resolveAssets(
  content: string,
  tokens: Token[],
  baseDir: string,
): Promise<ResolveResult> {
  const imagePaths = findImagePaths(tokens);
  const assets: AssetEntry[] = [];
  const pathMap = new Map<string, string>();
  let counter = 0;

  for (const imgPath of imagePaths) {
    if (pathMap.has(imgPath)) continue;

    // Skip remote URLs and data URIs
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      continue;
    }

    const absPath = resolve(baseDir, imgPath);

    if (!existsSync(absPath)) {
      console.warn(`Warning: Image not found: ${imgPath} (resolved to ${absPath})`);
      continue;
    }

    counter++;
    const ext = extname(basename(imgPath));
    const archiveName = `assets/img-${String(counter).padStart(3, '0')}${ext}`;

    const buffer = readFileSync(absPath);
    assets.push({
      originalPath: imgPath,
      archivePath: archiveName,
      buffer,
    });

    pathMap.set(imgPath, archiveName);
  }

  // Rewrite image paths in markdown content
  let rewrittenContent = content;
  for (const [original, archive] of pathMap) {
    // Replace all occurrences of the original path in markdown image syntax
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rewrittenContent = rewrittenContent.replace(new RegExp(escaped, 'g'), archive);
  }

  return { rewrittenContent, assets };
}
