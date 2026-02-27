import { Command } from 'commander';
import chalk from 'chalk';
import { compile } from './compiler.js';
import { readZip } from './zip-reader.js';
import { MPDF_VERSION, validateMpdf } from '@mpdf/core';
import type { PageConfig } from '@mpdf/core';

const program = new Command();

program
  .name('mpdf')
  .description('MPDF — Markdown Portable Document Format compiler')
  .version(MPDF_VERSION);

program
  .command('compile <input>')
  .description('Compile a Markdown file to .mpdf')
  .option('-o, --output <path>', 'Output .mpdf file path')
  .option('--theme <name>', 'Theme name', 'standard')
  .option('--page <size>', 'Page size (A4, letter, legal)', 'A4')
  .option('--author <name>', 'Document author')
  .option('--title <title>', 'Document title')
  .option('--lang <code>', 'Document language (BCP 47)')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (input: string, options) => {
    try {
      const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : undefined;
      const page: Partial<PageConfig> = {};
      if (options.page) page.size = options.page;

      const outputPath = await compile({
        input,
        output: options.output,
        theme: options.theme,
        author: options.author,
        title: options.title,
        language: options.lang,
        tags,
        page,
      });

      console.log(chalk.green('✓') + ` Compiled to ${chalk.bold(outputPath)}`);
    } catch (err) {
      console.error(chalk.red('✗ Compilation failed:'), (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('validate <file>')
  .description('Validate an .mpdf file')
  .action(async (file: string) => {
    try {
      const zip = await readZip(file, ['manifest.json', 'content.md', 'signature.sha256']);
      const manifestBuf = zip.files.get('manifest.json');
      const contentBuf = zip.files.get('content.md');
      const signatureBuf = zip.files.get('signature.sha256');

      if (!manifestBuf) {
        console.error(chalk.red('✗ Invalid .mpdf: missing manifest.json'));
        process.exit(1);
      }

      const manifestJson = JSON.parse(manifestBuf.toString('utf-8'));
      const result = validateMpdf({
        fileList: zip.fileList,
        manifestJson,
        contentMd: contentBuf,
        signatureSha256: signatureBuf?.toString('utf-8'),
      });

      if (result.valid) {
        console.log(chalk.green('✓ Valid .mpdf file'));
      } else {
        console.log(chalk.red('✗ Invalid .mpdf file'));
      }

      if (result.errors.length > 0) {
        console.log(chalk.red('\nErrors:'));
        for (const err of result.errors) {
          console.log(chalk.red(`  • ${err}`));
        }
      }

      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        for (const warn of result.warnings) {
          console.log(chalk.yellow(`  • ${warn}`));
        }
      }

      process.exit(result.valid ? 0 : 1);
    } catch (err) {
      console.error(chalk.red('✗ Validation failed:'), (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('info <file>')
  .description('Display .mpdf manifest information')
  .action(async (file: string) => {
    try {
      const zip = await readZip(file, ['manifest.json']);
      const manifestBuf = zip.files.get('manifest.json');

      if (!manifestBuf) {
        console.error(chalk.red('✗ Invalid .mpdf: missing manifest.json'));
        process.exit(1);
      }

      const manifest = JSON.parse(manifestBuf.toString('utf-8'));

      console.log(chalk.bold.blue('MPDF Document Info'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`${chalk.gray('Title:')}         ${manifest.title}`);
      console.log(`${chalk.gray('Author:')}        ${manifest.author || '(not set)'}`);
      console.log(`${chalk.gray('Language:')}      ${manifest.language}`);
      console.log(`${chalk.gray('MPDF Version:')}  ${manifest.mpdf_version}`);
      console.log(`${chalk.gray('Created:')}       ${manifest.created}`);
      console.log(`${chalk.gray('Modified:')}      ${manifest.modified}`);
      console.log(`${chalk.gray('Theme:')}         ${manifest.theme}`);
      console.log(`${chalk.gray('Page:')}          ${manifest.page?.size} ${manifest.page?.orientation}`);

      if (manifest.tags?.length > 0) {
        console.log(`${chalk.gray('Tags:')}          ${manifest.tags.join(', ')}`);
      }
      if (manifest.description) {
        console.log(`${chalk.gray('Description:')}   ${manifest.description}`);
      }

      console.log();
      console.log(chalk.bold.blue('AI Metadata'));
      console.log(chalk.gray('─'.repeat(50)));
      const ai = manifest.ai;
      if (ai) {
        console.log(`${chalk.gray('Words:')}         ${ai.word_count}`);
        console.log(`${chalk.gray('Headings:')}      ${ai.heading_count}`);
        console.log(`${chalk.gray('Tables:')}        ${ai.table_count}`);
        console.log(`${chalk.gray('Code blocks:')}   ${ai.code_block_count}`);
        console.log(`${chalk.gray('Images:')}        ${ai.image_count}`);
        console.log(`${chalk.gray('Language:')}      ${ai.language_detected}`);
        console.log(`${chalk.gray('Content hash:')}  ${ai.content_hash}`);
      }

      console.log();
      console.log(chalk.bold.blue('Files'));
      console.log(chalk.gray('─'.repeat(50)));
      for (const f of zip.fileList) {
        console.log(`  ${f}`);
      }
    } catch (err) {
      console.error(chalk.red('✗ Failed to read .mpdf:'), (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
