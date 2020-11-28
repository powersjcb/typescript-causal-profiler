import * as ts from 'typescript';

// inject breakpoints into the source
export const transformerFactory = (context: ts.TransformationContext): ts.CustomTransformer => {
  return {
    transformSourceFile: (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        transformNode(node);
        return ts.visitEachChild(node, visitor, context);
      }
      return ts.visitNode(sourceFile, visitor)
    }, // todo: insert debug like statements
    transformBundle: (node: ts.Bundle) => node,
  };
};


const transformNode = (node: ts.Node): ts.Node => {
  if (ts.isArrowFunction(node)) {
    // note: https://github.com/microsoft/TypeScript/issues/40507
    // noinspection JSDeprecatedSymbols
    const newNode = ts.getMutableClone(node)
    ts.factory.updateArrowFunction(newNode)
    return newNode;
  }
  return node;
};
