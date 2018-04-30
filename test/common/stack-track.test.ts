import test from "ava";
import vm from "../../src/vm";

test("not defined", t => {
  const sandbox: any = vm.createContext({});

  try {
    vm.runInContext(
      `function get(){
  var a = 123;
  console.log(b);
}
  
get();`,
      sandbox
    );
    t.fail("it should throw an error");
  } catch (err) {
    t.deepEqual(err.message, "b is not defined");
    t.true(typeof err.stack === "string");
    t.deepEqual(
      err.stack,
      `ReferenceError: b is not defined
    at get (<anonymous>:3:15)
    at <anonymous>:6:1`
    );
  }
});
