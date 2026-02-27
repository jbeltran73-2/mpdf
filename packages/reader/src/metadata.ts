import yauzl from 'yauzl';
import type { MpdfManifest, MpdfValidationResult } from '@mpdf/core';
import { ManifestSchema, validateMpdf } from '@mpdf/core';

function readSpecificFiles(
  path: string,
  fileNames: string[],
): Promise<{ fileList: string[]; files: Map<string, Buffer> }> {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return reject(new Error('Failed to open ZIP file'));

      const fileList: string[] = [];
      const files = new Map<string, Buffer>();

      zipfile.readEntry();
      zipfile.on('entry', (entry: yauzl.Entry) => {
        fileList.push(entry.fileName);

        if (!fileNames.includes(entry.fileName) || entry.fileName.endsWith('/')) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (err, stream) => {
          if (err) return reject(err);
          if (!stream) return reject(new Error(`Failed to read ${entry.fileName}`));

          const chunks: Buffer[] = [];
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => {
            files.set(entry.fileName, Buffer.concat(chunks));
            zipfile.readEntry();
          });
        });
      });
      zipfile.on('end', () => resolve({ fileList, files }));
      zipfile.on('error', (err: Error) => reject(err));
    });
  });
}

export async function getManifest(path: string): Promise<MpdfManifest> {
  const { files } = await readSpecificFiles(path, ['manifest.json']);
  const manifestBuf = files.get('manifest.json');

  if (!manifestBuf) {
    throw new Error('Invalid .mpdf file: missing manifest.json');
  }

  const manifestJson = JSON.parse(manifestBuf.toString('utf-8'));
  return ManifestSchema.parse(manifestJson) as MpdfManifest;
}

export async function validate(path: string): Promise<MpdfValidationResult> {
  const { fileList, files } = await readSpecificFiles(path, [
    'manifest.json',
    'content.md',
    'signature.sha256',
  ]);

  const manifestBuf = files.get('manifest.json');
  const contentBuf = files.get('content.md');
  const signatureBuf = files.get('signature.sha256');

  const manifestJson = manifestBuf ? JSON.parse(manifestBuf.toString('utf-8')) : null;

  return validateMpdf({
    fileList,
    manifestJson,
    contentMd: contentBuf,
    signatureSha256: signatureBuf?.toString('utf-8'),
  });
}
