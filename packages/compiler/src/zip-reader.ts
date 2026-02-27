import yauzl from 'yauzl';

export interface ZipContents {
  fileList: string[];
  files: Map<string, Buffer>;
}

export function readZip(path: string, filesToExtract?: string[]): Promise<ZipContents> {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return reject(new Error('Failed to open ZIP file'));

      const fileList: string[] = [];
      const files = new Map<string, Buffer>();

      zipfile.readEntry();
      zipfile.on('entry', (entry: yauzl.Entry) => {
        fileList.push(entry.fileName);

        if (filesToExtract && !filesToExtract.includes(entry.fileName)) {
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
