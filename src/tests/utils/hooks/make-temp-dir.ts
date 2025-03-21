import fs from 'node:fs';
import path from 'node:path';
import { after } from 'node:test';

export function makeTempDir() {
  const tempDirPath = path.resolve(fs.mkdtempSync('test-tmpdir-'));

  after(() => {
    fs.rmSync(tempDirPath, { recursive: true, force: true });
  });

  return tempDirPath;
}
