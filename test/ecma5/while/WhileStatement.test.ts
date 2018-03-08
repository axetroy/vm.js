import test from "ava";
import vm from "../../../src/vm";

test("WhileStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};

while (obj.i < 3) {
  obj.i++;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 3);
});

test("WhileStatement-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};

while (true) {
  obj.i++;
  if (obj.i >= 3) {
    break;
  }
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 3);
});
