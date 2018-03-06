import test from "ava";
import vm from "../src/vm";

test("IfStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  isTrue: false
};

if (true){
  obj.isTrue = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.isTrue === "boolean");
  t.true(obj.isTrue);
});
