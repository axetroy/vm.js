import test from "ava";
import vm from "../../../src/vm";

test("ForStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {num: 0};
for (let i = 0; i < 3; i++) {
  obj.num++;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.num === "number");
  t.deepEqual(obj.num, 3);
});

test("ForStatement-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {num: 0};
for (;;) {
  obj.num++;
  if (obj.num >= 3) {
    break;
  }
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.num === "number");
  t.deepEqual(obj.num, 3);
});
