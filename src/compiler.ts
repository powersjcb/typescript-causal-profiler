import * as ts from 'typescript';
import { sys } from 'typescript';
import {StatsCollector} from './lib/instrumentation';
import {instrumentTransformerFactory} from './transformer';

// load default configs from file and then add this customer transformer
export const compiler = (configFilePath: string, collector: StatsCollector) => {
  // tslint:disable-next-line no-any
  const host: ts.ParseConfigFileHost = ts.sys as any;
  // Fix after https://github.com/Microsoft/TypeScript/issues/18217
  host.onUnRecoverableConfigFileDiagnostic = console.error;
  const parsedCmd = ts.getParsedCommandLineOfConfigFile(configFilePath, {}, host);
  host.onUnRecoverableConfigFileDiagnostic = console.error;
  if (!parsedCmd) {
    throw Error('parsedCmd undefined');
  }

  console.log('Starting compilation')
  const {options, fileNames} = parsedCmd;

  const program = ts.createProgram({
    rootNames: fileNames,
    options,
  });

  const emitResult = program.emit(
    undefined,
    undefined,
    undefined,
    undefined,
    {
      before: [ instrumentTransformerFactory(collector)],
      after: [],
      afterDeclarations: [],
    }
  );

  ts.getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .forEach(diagnostic => {
      let msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        if (typeof diagnostic.start !== 'number') {
          throw Error('diagnostic.start is not a number')
        }
        const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        msg = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${msg}`;
      }
      console.error('Error: ', msg);
    });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode) {
    console.log(`Process exiting with code '${exitCode}'.`);
    sys.exit(exitCode);
  }
}