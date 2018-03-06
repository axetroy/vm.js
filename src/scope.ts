import {ErrDuplicateDeclard} from "./error";

export type ScopeType = "function" | "loop" | "switch" | "block";

export type Kind = "const" | "var" | "let";

export class ScopeVar {
  constructor(public kind: Kind, public value: any) {
    this.value = value;
    this.kind = kind;
  }

  $set(value: any): boolean {
    this.value = value;
    return true;
  }

  $get(): any {
    return this.value;
  }
}

export class Scope {
  private content: {[key: string]: ScopeVar} = {};
  // private parent: Scope | null;
  private prefix: string = "@";

  public invasived: boolean = false;

  constructor(
    public readonly type: ScopeType,
    private parent: Scope | null = null,
    label?: string
  ) {}

  $all() {
    const map = {};
    for (let $var in this.content) {
      const val = this.content[$var];
      map[$var.replace(/^\@/, "")] =
        val instanceof ScopeVar ? val.$get() : undefined;
    }
    return map;
  }

  $find(varName: string): ScopeVar | null {
    const name = this.prefix + varName;
    if (this.content.hasOwnProperty(name)) {
      return this.content[name];
    } else if (this.parent) {
      return this.parent.$find(varName);
    } else {
      return null;
    }
  }

  $let(varName: string, value: any): boolean {
    const name = this.prefix + varName;
    const $var = this.content[name];
    if (!$var) {
      this.content[name] = new ScopeVar("let", value);
      return true;
    } else {
      throw new ErrDuplicateDeclard(varName);
    }
  }

  $const(varName: string, value: any): boolean {
    const name = this.prefix + varName;
    const $var = this.content[name];
    if (!$var) {
      this.content[name] = new ScopeVar("const", value);
      return true;
    } else {
      throw new ErrDuplicateDeclard(varName);
    }
  }

  $var(varName: string, value: any): boolean {
    const name: string = this.prefix + varName;
    let scope: Scope = this;

    while (scope.parent !== null && scope.type !== "function") {
      scope = scope.parent;
    }

    const $var = scope.content[name];
    if ($var) {
      if ($var.kind !== "var") {
        // only recover var with var, not const and let
        throw new ErrDuplicateDeclard(name);
      } else {
        this.content[name] = new ScopeVar("var", value);
      }
    } else {
      this.content[name] = new ScopeVar("var", value);
    }
    return true;
  }

  $declar(kind: Kind, raw_name: string, value: any): boolean {
    return {
      var: () => this.$var(raw_name, value),
      let: () => this.$let(raw_name, value),
      const: () => this.$const(raw_name, value)
    }[kind]();
  }
}
