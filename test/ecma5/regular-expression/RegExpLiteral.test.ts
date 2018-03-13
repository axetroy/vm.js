import test from "ava";
import vm from "../../../src/vm";

test("basic without flags", t => {
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

test("with flags", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
const reg = /^hello/i;

function isSayHi(word) {
  return reg.test(word);
}

module.exports = isSayHi;
  `,
    sandbox
  );

  t.true(func("hello world"));
  t.true(func("Hello woRld"));
});

test("with multiple flags", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
const reg = /^hello/im;

function isSayHi(word) {
  return reg.test(word);
}

module.exports = isSayHi;
  `,
    sandbox
  );

  t.true(func("hello world"));
  t.true(func("Hello woRld"));
  t.true(func("Hello \nwoRld"));
});
