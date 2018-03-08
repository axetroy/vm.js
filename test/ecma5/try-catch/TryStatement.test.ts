import test from "ava";
import vm from "../../../src/vm";

test("TryStatement", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  runTry: false,
  runError: false
};

try {
  obj.runTry = true;
} catch (err) {
  obj.runError = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(obj.runTry);
  t.false(obj.runError);
});

test("TryStatement-with-throw", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  runTry: false,
  runError: false
};

try {
  obj.runTry = true;
  throw new Error("invalid ...");
} catch (err) {
  obj.runError = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(obj.runTry);
  t.true(obj.runError);
});