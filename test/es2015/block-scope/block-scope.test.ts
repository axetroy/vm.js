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

// test("let have block scope", t => {
//   const sandbox: any = vm.createContext();

//   const obj = vm.runInContext(
//     `
// var a = 123;
// var b;
// {
//   let b = 321;
// }

// module.exports = {a:a, b:b};
//   `,
//     sandbox
//   );

//   t.deepEqual(obj.a, 123);
//   t.deepEqual(obj.b, undefined);
// });
