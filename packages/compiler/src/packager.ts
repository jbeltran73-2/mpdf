import { createWriteStream } from 'node:fs';
import archiver from 'archiver';
import type { MpdfManifest, AssetEntry } from '@mpdf/core';
import type { ThemeAssets } from './theme.js';
import { computeHash, generateSignatureContent } from './integrity.js';

export interface PackageInput {
  outputPath: string;
  contentMd: string;
  manifest: MpdfManifest;
  assets: AssetEntry[];
  themeAssets: ThemeAssets;
  contentHash: string;
}

export async function packageMpdf(input: PackageInput): Promise<void> {
  const { outputPath, contentMd, manifest, assets, themeAssets, contentHash } = input;

  // Compute manifest checksum: hash the manifest without the checksum field
  const manifestWithoutChecksum = { ...manifest, checksum: '' };
  const manifestJson = JSON.stringify(manifestWithoutChecksum, null, 2);
  const manifestChecksum = computeHash(Buffer.from(manifestJson, 'utf-8'));
  manifest.checksum = `sha256:${manifestChecksum}`;

  const finalManifestJson = JSON.stringify(manifest, null, 2);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err: Error) => reject(err));
    output.on('error', (err: Error) => reject(err));
    archive.pipe(output);

    // 1. content.md
    archive.append(contentMd, { name: 'content.md' });

    // 2. manifest.json
    archive.append(finalManifestJson, { name: 'manifest.json' });

    // 3. style/
    archive.append(themeAssets.themeCss, { name: 'style/theme.css' });
    archive.append(themeAssets.printCss, { name: 'style/print.css' });

    // 4. fonts/
    for (const font of themeAssets.fonts) {
      archive.append(font.buffer, { name: `fonts/${font.name}` });
    }

    // 5. assets/
    for (const asset of assets) {
      archive.append(asset.buffer, { name: asset.archivePath });
    }

    // 6. signature.sha256
    archive.append(generateSignatureContent(contentHash), { name: 'signature.sha256' });

    archive.finalize();
  });
}
