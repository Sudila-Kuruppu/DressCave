import fs from 'fs';
import path from 'path';

test('project structure exists', () => {
  const pkgPath = path.resolve(__dirname, '../package.json');
  expect(fs.existsSync(pkgPath)).toBe(true);
});
