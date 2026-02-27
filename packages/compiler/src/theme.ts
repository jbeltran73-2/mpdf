import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In the built package, dist/ is one level below assets/
const ASSETS_DIR = resolve(__dirname, '..', 'assets');

export interface ThemeAssets {
  themeCss: Buffer;
  printCss: Buffer;
  fonts: Array<{ name: string; buffer: Buffer }>;
}

const FONT_FILES = [
  'inter-regular.woff2',
  'inter-bold.woff2',
  'inter-italic.woff2',
  'jetbrains-mono-regular.woff2',
];

export function loadTheme(themeName: string): ThemeAssets {
  const themeDir = resolve(ASSETS_DIR, 'themes', themeName);

  const themeCss = readFileSync(resolve(themeDir, 'theme.css'));
  const printCss = readFileSync(resolve(themeDir, 'print.css'));

  const fontsDir = resolve(ASSETS_DIR, 'fonts');
  const fonts = FONT_FILES.map((name) => ({
    name,
    buffer: readFileSync(resolve(fontsDir, name)),
  }));

  return { themeCss, printCss, fonts };
}
