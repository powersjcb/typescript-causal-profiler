// hooks that are injected into AST

export interface InstrumentationCollector {
  increment(reference: string): void;
  getCount(reference: string): number;
  getReferences(): string[];
}

export class StatsCollector {
  private data: {[key: string]: number};
  constructor() {
    this.data = {};
  }

  // compile-time only
  trackInstrumentation(reference: string): void {
    this.data[reference] = 0;
  }

  // runtime only
  // todo: reference a global value to track counts
  increment(reference: string): void {
    this.data[reference] = this.getCount(reference) + 1;
  };
  getCount(reference: string): number {
    const val = this.data[reference];
    if (val === undefined) {
      throw new Error('reference not instrumented: ' + reference);
    }
    return val;
  };
  getReferences(): string[] {
      return Object.keys(this.data);
  };
};

