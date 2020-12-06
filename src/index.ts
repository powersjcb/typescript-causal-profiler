// todo: write causal profile high level logic


import {compiler} from './compiler';
import {StatsCollector} from './lib/instrumentation';

const collector = new StatsCollector()

compiler('./tsconfig.json', collector)

console.log(collector.getReferences())