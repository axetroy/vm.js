import test from "ava";
import vm from "../../../src/vm";

test("var don't have block scope", t => {
  const sandbox: any = vm.createContext();

  const obj = vm.runInContext(
    `
var a = 123;
var b;
{
  var b = 321;
}

module.exports = {a:a, b:b};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 123);
  t.deepEqual(obj.b, 321);
});

test("let have block scope", t => {
  const sandbox: any = vm.createContext();

  const obj = vm.runInContext(
    `
var a = 123;
var b;
{
  let b = 321;
}

module.exports = {a:a, b:b};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 123);
  t.deepEqual(obj.b, undefined);
});

test("let have block scope in the function", t => {
  const sandbox: any = vm.createContext();

  const abc = vm.runInContext(
    `
function abc(){
  var a = 123;
  var b;
  {
    let a = 321;
    b = a;
  }
  return {a: a, b: b};
}
module.exports = abc;
  `,
    sandbox
  );

  const r = abc();

  t.deepEqual(r.a, 123);
  t.deepEqual(r.b, 321);
});
