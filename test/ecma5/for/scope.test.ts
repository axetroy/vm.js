import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

// TODO: complete test case

// test("var in for block should cover the parent scope", t => {
//   const sandbox: any = vm.createContext({});

//   const a: any = vm.runInContext(
//     `
// var a = 1;

// var arr = [1, 2, 3];

// for (let i = 0; i < arr.length; i++) {
//   var a = arr[i]; // cover parent scope
// }

// module.exports = a;
//   `,
//     sandbox
//   );
//   t.deepEqual(a, 3);
// });

// test("let in for block should define in it's scope", t => {
//   const sandbox: any = vm.createContext({});

//   const obj: any = vm.runInContext(
//     `
// var a = 1;
// var b;

// const arr = [1, 2, 3];

// for (let i = 0; i < arr.length; i++) {
//   let a = arr[i]; // define in his block scope
//   b = a;
// }

// module.exports = { a: a, b: b };
//   `,
//     sandbox
//   );
//   t.deepEqual(obj.a, 1);
//   t.deepEqual(obj.b, 3);
// });

// test("const in for block should define in it's scope", t => {
//   const sandbox: any = vm.createContext({});

//   const obj: any = vm.runInContext(
//     `
// var a = 1;
// var b;

// var obj = {
//   0: 0,
//   1: 1,
//   2: 2,
//   3: 3,
//   4: 4
// };

// for (let attr in obj){
//   const a = obj[attr];  // define in his block scope
//   b = a;
// }

// module.exports = {a: a, b: b};
//   `,
//     sandbox
//   );
//   t.deepEqual(obj.a, 1);
//   t.deepEqual(obj.b, 4);
// });

// test("var in for block and parent scope const some name var", t => {
//   const sandbox: any = vm.createContext({});

//   t.throws(function() {
//     vm.runInContext(
//       `
// let a = 1;  // define let var

// var obj = {
//   0: 0,
//   1: 1,
//   2: 2,
//   3: 3,
//   4: 4
// };

// for (let attr in obj){
//   var a = obj[attr];  // define var, it should throw
// }

// module.exports = {a: a};
//     `,
//       sandbox
//     );
//   }, new ErrDuplicateDeclard("a").message);
// });
