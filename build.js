import {
  flattenDiagnosticMessageText,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics,
  createProgram,
  ModuleKind,
  ScriptTarget,
  ModuleResolutionKind,
} from 'typescript';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync } from 'fs';

const rootNames = ['src/index.ts'].map((file) =>
  join(dirname(fileURLToPath(import.meta.url)), file),
);

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'dist');

// rimraf
rmSync(outDir, { recursive: true, force: true });

// build
/** @type {import('typescript').CompilerOptions} */
const baseOptions = {
  strict: true,
  baseUrl: import.meta.url,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  module: ModuleKind.Node16,
  moduleResolution: ModuleResolutionKind.Node16,
};

// compile cjs
const cjsProgram = createProgram({
  options: {
    ...baseOptions,
    outDir: join(outDir, 'cjs'),
    target: ScriptTarget.ES2015,
  },
  rootNames,
});
// eslint-disable-next-line no-console, no-undef
console.log('Emitting CJS');
const cjsEmitResult = cjsProgram.emit();
reportDiagnostic(cjsProgram, cjsEmitResult);

// compile esm
const esmProgram = createProgram({
  options: {
    ...baseOptions,
    outDir: join(outDir, 'esm'),
    target: ScriptTarget.ESNext,
  },
  rootNames,
});
// eslint-disable-next-line no-console, no-undef
console.log('Emitting ESM');
const esmEmitResult = esmProgram.emit();
reportDiagnostic(esmProgram, esmEmitResult);

// emit declaration files
const dtsProgram = createProgram({
  options: {
    ...baseOptions,
    declaration: true,
    declarationMap: true,
    emitDeclarationOnly: true,
    outFile: join(outDir, 'index.d.ts'),
  },
  rootNames,
});
// eslint-disable-next-line no-console, no-undef
console.log('Emitting DTS');
const dtsEmitResult = dtsProgram.emit();
reportDiagnostic(dtsProgram, dtsEmitResult);

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
