import esbuild from 'esbuild';
import { rmSync } from 'fs';
import { dirname, join } from 'path';
import {
  createProgram,
  flattenDiagnosticMessageText,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics,
  ModuleKind,
  ModuleResolutionKind,
} from 'typescript';
import { fileURLToPath } from 'url';

const entryPoints = ['src/index.ts'].map((file) =>
  join(dirname(fileURLToPath(import.meta.url)), file),
);

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'dist');

// rimraf
rmSync(outDir, { recursive: true, force: true });

buildAll();

async function buildAll() {
  return Promise.all([
    build('script', {
      entryPoints,
      platform: 'browser',
      minify: true,
      target: ['es6'],
    }),
    build('esm', {
      entryPoints,
      platform: 'neutral',
    }),
    build('cjs', {
      entryPoints,
      target: ['node10.4'],
      platform: 'node',
    }),
    buildDts({ entryPoints }),
  ]);
}

async function build(name, options) {
  const path = `${name}.js`;
  // eslint-disable-next-line no-console, no-undef
  console.log(`Building ${name}`);

  return esbuild.build({
    outfile: join(outDir, path),
    bundle: true,
    loader: { '.ts': 'ts' },
    ...options,
  });
}

async function buildDts({ entryPoints: rootNames }) {
  // compile cjs
  const cjsProgram = createProgram({
    options: {
      declaration: true,
      declarationMap: true,
      strict: true,
      baseUrl: import.meta.url,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      module: ModuleKind.Node16,
      moduleResolution: ModuleResolutionKind.Node16,
      emitDeclarationOnly: true,
      outDir,
    },
    rootNames,
  });
  const cjsEmitResult = cjsProgram.emit();
  reportDiagnostic(cjsProgram, cjsEmitResult);
}

/**
 * Report diagnostics and errors from the TypeScript compiler
 * @param {import('typescript').Program} program
 * @param {import('typescript').EmitResult} emitResult
 */
function reportDiagnostic(program, emitResult) {
  getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .forEach((diagnostic) => {
      if (diagnostic.file) {
        let { line, character } = getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start,
        );
        let message = flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        );
        // eslint-disable-next-line no-console, no-undef
        console.error(
          `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        // eslint-disable-next-line no-console, no-undef
        console.error(
          flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        );
      }
    });
}
