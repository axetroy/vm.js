import test from "ava";
import vm from "../../../src/vm";

test("ArrowFunctionExpression-1", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const func = vm.runInContext(
    `
const func = () => {
  return "hello " + name;
};

module.exports = func;
  `,
    sandbox
  );

  t.true(typeof func === "function");
  t.deepEqual(func.length, 0);
  t.deepEqual(func(), "hello world");
});

test("ArrowFunctionExpression-2", t => {
  const sandbox: any = vm.createContext();

  const func = vm.runInContext(
    `
const func = () => "hello " + this.aabbcc;

module.exports = func;
  `,
    sandbox
  );

  t.true(typeof func === "function");
  t.deepEqual(func.length, 0);
  t.deepEqual(func.name, "");
  t.deepEqual(func(), "hello undefined");
});

test("ArrowFunctionExpression-3", t => {
  const sandbox: any = vm.createContext();

  const func = vm.runInContext(
    `
function main() {
  return () => {
    return "hello " + this.name;
  };
}

function call(name) {
  return main.call({name: name})();
}

module.exports = call;
  `,
    sandbox
  );

  t.true(typeof func === "function");
  t.deepEqual(func.length, 1);
  t.deepEqual(func("world"), "hello world");
  t.deepEqual(func("axetroy"), "hello axetroy");
});
