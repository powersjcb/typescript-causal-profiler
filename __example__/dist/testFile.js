"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.func3 = exports.func2 = exports.func1 = void 0;
const func1 = () => { (function instrumented() { console.log("instrumented"); console.log('original func1'); })(); };
exports.func1 = func1;
const func2 = () => { (function instrumented() { console.log("instrumented"); exports.func1(); })(); };
exports.func2 = func2;
const func3 = () => { (function instrumented() { console.log("instrumented"); exports.func2(); })(); };
exports.func3 = func3;
;
;
//# sourceMappingURL=testFile.js.map