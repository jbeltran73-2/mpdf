import yauzl from 'yauzl';
import type { MpdfManifest, MpdfContents } from '@mpdf/core';
import { ManifestSchema } from '@mpdf/core';

interface ZipEntry {
  fileName: string;
  buffer: Buffer;
}

function readEntries(path: string, filesToExtract?: string[]): Promise<ZipEntry[]> {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return reject(new Error('Failed to open ZIP file'));

      const entries: ZipEntry[] = [];

      zipfile.readEntry();
      zipfile.on('entry', (entry: yauzl.Entry) => {
        if (filesToExtract && !filesToExtract.includes(entry.fileName)) {
          zipfile.readEntry();
          return;
        }

        if (entry.fileName.endsWith('/')) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (err, stream) => {
          if (err) return reject(err);
          if (!stream) return reject(new Error(`Failed to read ${entry.fileName}`));

          const chunks: Buffer[] = [];
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => {
            entries.push({ fileName: entry.fileName, buffer: Buffer.concat(chunks) });
            zipfile.readEntry();
          });
        });
      });
      zipfile.on('end', () => resolve(entries));
      zipfile.on('error', (err: Error) => reject(err));
    });
  });
}

export async function extractMarkdown(path: string): Promise<string> {
  const entries = await readEntries(path, ['content.md']);
  const contentEntry = entries.find((e) => e.fileName === 'content.md');

  if (!contentEntry) {
    throw new Error('Invalid .mpdf file: missing content.md');
  }

  return contentEntry.buffer.toString('utf-8');
}

export async function readMpdf(path: string): Promise<MpdfContents> {
  const entries = await readEntries(path);

  const contentEntry = entries.find((e) => e.fileName === 'content.md');
  const manifestEntry = entries.find((e) => e.fileName === 'manifest.json');

  if (!contentEntry) {
    throw new Error('Invalid .mpdf file: missing content.md');
  }
  if (!manifestEntry) {
    throw new Error('Invalid .mpdf file: missing manifest.json');
  }

  const manifestJson = JSON.parse(manifestEntry.buffer.toString('utf-8'));
  const manifest = ManifestSchema.parse(manifestJson) as MpdfManifest;

  const assets = new Map<string, Buffer>();
  for (const entry of entries) {
    if (entry.fileName.startsWith('assets/')) {
      assets.set(entry.fileName, entry.buffer);
    }
  }

  return {
    content: contentEntry.buffer.toString('utf-8'),
    manifest,
    assets,
  };
}
