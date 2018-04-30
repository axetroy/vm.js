import test from "ava";
import { Scope } from "./scope";
import { Context, DEFAULT_CONTEXT } from "./context";
import { ErrDuplicateDeclard } from "./error";
import { ScopeType } from "./type";

test("root scope", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.deepEqual(scope.type, ScopeType.Root);
  t.deepEqual(scope.level, 0);
  t.deepEqual(scope.length, 0);
  t.deepEqual(scope.parent, null);
  t.true(scope.isolated);
  t.false(scope.invasive);
  t.deepEqual(scope.raw, {});
  t.deepEqual(scope.length, 0);
  t.deepEqual(scope.origin, null);
});

test("setContext()", t => {
  const scope = new Scope(ScopeType.Root, null);
  scope.setContext(new Context());

  // default context
  t.deepEqual(scope.raw, DEFAULT_CONTEXT);

  scope.setContext(new Context({ name: "axetroy" }));

  // context
  t.deepEqual(scope.raw, { ...DEFAULT_CONTEXT, ...{ name: "axetroy" } });

  t.true(!!scope.hasOwnBinding("name"));
});

test("hasOwnBinding()", t => {
  const scope = new Scope(ScopeType.Root, null);
  scope.setContext(new Context());
  t.true(!!scope.hasOwnBinding("console"));
});

test("hasBinding()", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm"));

  const child = scope.createChild(ScopeType.Block);

  // can not found the var in the current scope
  t.deepEqual(child.hasOwnBinding("name"), undefined);

  // can found the var in the parent scope
  t.true(!!child.hasBinding("name"));
});

test("var()", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm"));

  const $var = scope.hasOwnBinding("name");

  if (!$var) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");
});

test("'var' can be redeclare if variable have been declare with 'var'", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm"));

  const $var = scope.hasOwnBinding("name");

  if (!$var) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");

  t.true(scope.var("name", "hello")); // redeclare

  const $newVar = scope.hasOwnBinding("name");

  if (!$newVar) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");
  t.deepEqual($newVar.value, "hello");
});

test("let can be redeclare", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare

  const $var = scope.hasOwnBinding("name");

  if (!$var) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");

  t.throws(() => {
    scope.let("name", "hello"); // redeclare
  }, ErrDuplicateDeclard("name").message);
});

test("const can be redeclare", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare

  const $var = scope.hasOwnBinding("name");

  if (!$var) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");

  t.throws(() => {
    scope.const("name", "hello"); // redeclare
  }, ErrDuplicateDeclard("name").message);
});

test("delete variable from a scope", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare

  t.deepEqual(scope.length, 1);

  const $var = scope.hasOwnBinding("name");

  if (!$var) {
    return t.fail("Var should be found");
  }

  t.deepEqual($var.value, "vm");

  t.true(scope.del("name"));

  t.deepEqual(scope.hasOwnBinding("name"), undefined);
  t.deepEqual(scope.length, 0);
});

test("create child", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare
  t.deepEqual(scope.level, 0);
  t.deepEqual(scope.length, 1);

  const child = scope.createChild(ScopeType.Block);
  t.deepEqual(child.level, 1);
  t.deepEqual(child.length, 0);

  t.deepEqual(child.hasOwnBinding("name"), undefined);
  t.true(!!child.hasBinding("name"));
});

test("fork child", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare
  t.deepEqual(scope.level, 0);
  t.deepEqual(scope.length, 1);
  t.deepEqual(scope.raw, { name: "vm" });

  const sibling = scope.fork(ScopeType.Block);
  t.deepEqual(sibling.type, ScopeType.Block);
  t.deepEqual(sibling.level, 0);
  t.deepEqual(sibling.length, 1);
  t.deepEqual(sibling.raw, { name: "vm" });
  t.true(sibling.origin === scope);

  t.true(!!sibling.hasBinding("name"));

  // fork another
  scope.fork();
});

test("locate scope", t => {
  const scope = new Scope(ScopeType.Root, null);
  t.true(scope.var("name", "vm")); // declare

  const child = scope.createChild(ScopeType.Block);

  const childChild = child.createChild(ScopeType.Block);

  const target = childChild.locate("name");

  if (!target) {
    t.fail("Can not found the target scope");
  }

  t.true(target === scope);

  t.deepEqual(childChild.locate("customerVarName"), undefined);
});
