import test from "ava";
import vm from "../src/vm";

test("NewExpression", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
function People(name){
  this.name = name;
}

module.exports = new People("axetroy");
module.exports.People = People;
  `,
    sandbox
  );

  t.deepEqual(output.People.length, 1);
  t.deepEqual(output.name, "axetroy");
});
