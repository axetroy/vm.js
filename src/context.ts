export interface ISandBox {
  [k: string]: any;
}

import g from "./global";

const defaultContext: ISandBox = {
  Array,
  Boolean,
  clearInterval,
  clearTimeout,
  console,
  Date,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  Error,
  escape,
  EvalError,
  Infinity,
  isFinite,
  isNaN,
  JSON,
  Math,
  NaN,
  Number,
  Object,
  parseFloat,
  parseInt,
  Promise: typeof Promise !== "undefined" ? Promise : undefined,
  Proxy: typeof Proxy !== "undefined" ? Proxy : undefined,
  RangeError,
  ReferenceError,
  Reflect: typeof Reflect !== "undefined" ? Reflect : undefined,
  RegExp,
  setInterval,
  setTimeout,
  String,
  Symbol: typeof Symbol !== "undefined" ? Symbol : undefined,
  SyntaxError,
  TypeError,
  unescape,
  URIError
};

export default class Context {
  public global: any = g;
  constructor(externalContext: ISandBox = {}) {
    const ctx = { ...defaultContext, ...externalContext };
    for (const attr in ctx) {
      if (ctx.hasOwnProperty(attr)) {
        this[attr] = ctx[attr];
      }
    }
  }
}
