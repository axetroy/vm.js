import test from "ava";
import vm from "../../../src/vm";

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var obj = {
  1: false,
  2: false,
  3: false
};

loop1:
for (var attr in obj) {
  obj[attr] = true;
  if (attr % 2 === 0){
    break loop1;
  }
}

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj, {
    1: true,
    2: true,
    3: false
  });
});

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const { attr, index }: any = vm.runInContext(
    `
var obj = {
  1: false,
  2: false,
  3: false
};

loop1:
for (var attr in obj) {
  obj[attr] = true;
  loop2:
  for (var index in [1,2,3,4]){
    if ((index + 1)%3 === 0){
      break loop1;
    }
  }
}

module.exports = {attr, index};
  `,
    sandbox
  );

  t.deepEqual(attr, "1");
  t.deepEqual(index, "2");
});

test("continue with label", t => {
  const sandbox: any = vm.createContext({});

  const { attr, index, m }: any = vm.runInContext(
    `
var obj = {
  1: false,
  2: false,
  3: false
};

loop1:
for (var attr in obj) {
  obj[attr] = true;
  loop2:
  for (var index in [1,2,3,4]){
    if ((index + 1)%3 === 0){
      break loop1;
    }
    loop3:
    for (var m in [1, 2, 3, 4]){
      if ((m + 1) % 2 === 0){
        continue loop2;
      }
    }
  }
}

module.exports = {attr, index,m};
  `,
    sandbox
  );

  t.deepEqual(attr, "1");
  t.deepEqual(index, "2");
  t.deepEqual(m, "3");
});
