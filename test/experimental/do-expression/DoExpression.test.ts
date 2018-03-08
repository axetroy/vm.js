import test from "ava";
import vm from "../../../src/vm";

test("DoExpression", t => {
  const sandbox: any = vm.createContext({});

  const get: any = vm.runInContext(
    `
function get(x){
  return do {
    if(x > 10) {
      'big';
    } else {
      'small';
    }
  };
}
module.exports = get;
    `,
    sandbox
  );

  t.deepEqual(get(11), "big");
  t.deepEqual(get(10), "small");
});
