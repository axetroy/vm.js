import Context from "./context";
import { ErrDuplicateDeclard } from "./error";
import { Kind, ScopeType } from "./type";
import { Var } from "./var";

export class Scope {
  // the scope have invasive property
  public invasive: boolean = false;

  public redeclare: boolean = false; // !!dangerous

  // is the top level scope
  public isTopLevel: boolean = false;

  // scope context
  public context: Context;

  // scope var
  private content: { [key: string]: Var<any> } = {};

  constructor(
    public readonly type: ScopeType,
    public parent: Scope | null,
    label?: string
  ) {
    this.context = new Context();
  }

  public setInvasive(invasive: boolean) {
    this.invasive = invasive;
    return this;
  }

  public setContext(context: Context) {
    this.context = context;
    for (const name in context) {
      if (context.hasOwnProperty(name)) {
        // here should use $var
        this.var(name, context[name]);
      }
    }
  }

  public raw(): { [key: string]: any } {
    const map = {};
    for (const varName in this.content) {
      if (this.content.hasOwnProperty(varName)) {
        const val = this.content[varName];
        map[varName] = val.value;
      }
    }
    return map;
  }

  public hasBinding(varName: string): Var<any> | false {
    if (this.content.hasOwnProperty(varName)) {
      return this.content[varName];
    } else if (this.parent) {
      return this.parent.hasBinding(varName);
    } else {
      return false;
    }
  }

  public hasOwnBinding(varName: string): Var<any> | false {
    if (this.content.hasOwnProperty(varName)) {
      return this.content[varName];
    } else {
      return false;
    }
  }

  get global(): Scope {
    if (this.parent) {
      return this.parent.global;
    } else {
      return this;
    }
  }

  public let(varName: string, value: any): boolean {
    const $var = this.content[varName];
    if (!$var) {
      this.content[varName] = new Var("let", varName, value, this);
      return true;
    } else if (this.redeclare) {
      this.content[varName] = new Var("let", varName, value, this);
      return true;
    } else {
      throw ErrDuplicateDeclard(varName);
    }
  }

  public const(varName: string, value: any): boolean {
    const $var = this.content[varName];
    if (!$var) {
      this.content[varName] = new Var("const", varName, value, this);
      return true;
    } else if (this.redeclare) {
      this.content[varName] = new Var("const", varName, value, this);
      return true;
    } else {
      throw ErrDuplicateDeclard(varName);
    }
  }

  public var(varName: string, value: any): boolean {
    // tslint:disable-next-line
    let scope: Scope = this;

    while (
      scope.parent !== null &&
      (scope.type !== "function" && scope.type !== "class")
    ) {
      scope = scope.parent;
    }

    const $var = scope.content[varName];
    if ($var) {
      if ($var.kind !== "var") {
        // only cover var with var, not const and let
        throw ErrDuplicateDeclard(varName);
      } else {
        if (this.isTopLevel && this.context[varName]) {
          // top level context can not be cover
          // here we do nothing
        } else {
          this.content[varName] = new Var("var", varName, value, this);
        }
      }
    } else {
      this.content[varName] = new Var("var", varName, value, this);
    }
    return true;
  }

  public declare(kind: Kind, rawName: string, value: any): boolean {
    return {
      const: () => this.const(rawName, value),
      let: () => this.let(rawName, value),
      var: () => this.var(rawName, value)
    }[kind]();
  }
  public createChild(type: ScopeType, label?: string): Scope {
    return new Scope(type, this, label);
  }
  public fork(): Scope {
    // forks a new scope
    const newScope = new Scope("block", null);

    // copy the properties
    newScope.invasive = this.invasive;
    newScope.redeclare = this.redeclare;
    newScope.isTopLevel = this.isTopLevel;
    newScope.context = this.context;
    newScope.parent = this.parent;

    // copy the vars
    for (const varName in this.content) {
      if (this.content.hasOwnProperty(varName)) {
        const $var = this.content[varName];
        newScope.declare($var.kind, $var.name, $var.value);
      }
    }
    return newScope;
  }
}
