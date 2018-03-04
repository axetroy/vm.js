import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("RegExpLiteral", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
const reg = /^hello/;

function isSayHi(word) {
  return reg.test(word);
}

module.exports = isSayHi;
  `,
    sandbox
  );

  t.true(func("hello world"));
  t.false(func("abcd"));
});
