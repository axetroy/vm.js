import test from "ava";

import vm from "../../../src/vm";

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

test("async with resolve", async t => {
  const sandbox: any = vm.createContext({});

  const get = vm.runInContext(
    `
async function get(name){
  return 123;
}

module.exports = get;
  `,
    sandbox
  );

  const promise = get("name");

  t.true(promise instanceof Promise);

  const result = await promise;

  t.deepEqual(result, 123);
});

test("async with reject", async t => {
  const sandbox: any = vm.createContext({});

  const get = vm.runInContext(
    `
async function get(name){
  return Promise.reject("error");
}

module.exports = get;
  `,
    sandbox
  );

  const promise = get("name");

  t.true(promise instanceof Promise);

  try {
    await promise;
  } catch (err) {
    t.deepEqual(err, "error");
  }
});

test("async with async action", async t => {
  const sandbox: any = vm.createContext({ sleep });

  const get = vm.runInContext(
    `
async function get(name){
  await sleep(20);
  return Promise.resolve("data");
}

module.exports = get;
  `,
    sandbox
  );

  const promise = get("name");

  t.true(promise instanceof Promise);

  const result = await promise;

  t.deepEqual(result, "data");
});

// test("async with async action expression", async t => {
//   const sandbox: any = vm.createContext();

//   const get = vm.runInContext(
//     `
// function getData(){
//   return new Promise(function(resolve,reject){
//     resolve("hello");
//   });
// }
// async function get(name){
//   var a = 3;
//   return await getData() + " world";
// }

// module.exports = get;
//   `,
//     sandbox
//   );

//   const promise = get("name");

//   t.true(promise instanceof Promise);

//   const result = await promise;

//   t.deepEqual(result, "hello world");
// });
