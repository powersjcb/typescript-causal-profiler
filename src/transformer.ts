import * as ts from 'typescript';
import {StatsCollector} from './lib/instrumentation';

// inject breakpoints into the source
export const instrumentTransformerFactory = (collector: StatsCollector) => (context: ts.TransformationContext): ts.CustomTransformer => {
  return {
    transformSourceFile: (sourceFile: ts.SourceFile) => {
      const replacements: {[key: string]: ts.Node} = {};
      const visitor = (node: ts.Node): ts.Node => {
        const maybeUpdated = transformNode(collector, node);
        if (maybeUpdated !== node) {
          replacements[referenceFor(node)] = maybeUpdated;
        }
        ts.visitEachChild(node, visitor, context);
        return node;
      }
      ts.visitNode(sourceFile, visitor)
      const last = replacements['/Users/jpowers/workspace/typescript-causal-profiler/__example__/testFile.ts [142-150] func1()'];
      console.log(last)
      const replacer = (node: ts.Node): ts.Node => {
        const replacement = replacements[referenceFor(node)]
        if (replacement) {
          delete replacements[referenceFor(node)]
          ts.visitEachChild(replacement, replacer, context)
          return replacement;
        }
        ts.visitEachChild(node, replacer, context);
        return node;
      }
      return ts.visitNode(sourceFile, replacer)
    },
    transformBundle: (node: ts.Bundle) => node,
  };
};

const referenceFor = (n: ts.Node): string => {
  if (!n.getSourceFile()) {
    return 'injected'
  }
  return `${n.getSourceFile().fileName} [${n.pos}-${n.end}] ${n.getText()}`;
};

// function isRequireContextExpression(node: ts.Expression) {
//   return (
//     ts.isPropertyAccessExpression(node) &&
//     ts.isIdentifier(node.expression) &&
//     node.expression.)text === 'require' &&
//     ts.isIdentifier(node.name) &&
//     node.name.text === 'context'
//   );
// }

const transformNode = (collector: StatsCollector, node: ts.Node): ts.Node => {
  if (ts.isCallExpression(node)) {
    // console.log(referenceFor(node), ts.isCallExpression(node), node)
    collector.trackInstrumentation(referenceFor(node));
    // note: https://github.com/microsoft/TypeScript/issues/40507
    // noinspection JSDeprecatedSymbols
    const instrumentationStatement = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("console"),
        ts.factory.createIdentifier("log")
      ),
      undefined,
      [ts.factory.createStringLiteral("instrumented")]
    ));
    const replacement = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createParenthesizedExpression(
        ts.factory.createFunctionExpression(
          undefined,
          undefined,
          'instrumented',
          undefined,
          [],
          undefined,
          ts.factory.createBlock([
              instrumentationStatement,
              ts.factory.createExpressionStatement(ts.getMutableClone(node)),
            ],
            false,
          )
        ),
      ),
      undefined,
      [],
    ));
    return replacement;
  }
  return node;
};

