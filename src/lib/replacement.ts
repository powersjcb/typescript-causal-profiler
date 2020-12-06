// reference: https://github.com/urish/typewiz/blob/d8b743a5b8c0691fed356ba5f3c04b835acb1ff3/packages/typewiz-core/src/replacement.ts
// Concept pulled from TSLint, source pulled from urish/typewiz

export class Replacement {
  public static insert(pos: number, text: string, priority = 0) {
    return new Replacement(pos, pos, text, priority);
  }

  public static delete(start: number, end: number) {
    return new Replacement(start, end, '');
  }

  constructor(readonly start: number, readonly end: number, readonly text = '', readonly priority = 0) {}
}

export function applyReplacements(source: string, replacements: Replacement[]) {
  replacements = replacements.sort((r1, r2) =>
    r2.end !== r1.end ? r2.end - r1.end : r1.start !== r2.start ? r2.start - r1.start : r1.priority - r2.priority,
  );
  for (const replacement of replacements) {
    source = source.slice(0, replacement.start) + replacement.text + source.slice(replacement.end);
  }
  return source;
}