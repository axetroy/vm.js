export interface IPoint {
  line: number;
  column: number;
}

export interface ILocation {
  start: IPoint;
  end: IPoint;
}

export interface IPen {
  stack: string;
  filename: string;
  location: ILocation;
}

export class Stack {
  private stackList: string[] = [];
  private items: IPen[] = [];
  constructor(private limitSize: number = Error.stackTraceLimit || 10) {}
  public enter(stackName: string) {
    this.stackList.push(stackName);
  }
  public leave() {
    this.stackList.pop();
    this.items.pop();
  }
  public push(item: IPen) {
    if (this.size > this.limitSize) {
      this.items.shift();
    }
    this.items.push(item);
  }

  public get currentStackName(): string {
    return this.stackList.length
      ? this.stackList[this.stackList.length - 1]
      : "";
  }

  public peek(): IPen {
    return this.items[this.items.length - 1];
  }

  public isEmpty() {
    return this.items.length === 0;
  }

  public clear() {
    this.items = [];
  }

  public get raw(): string {
    return this.items
      .reverse()
      .map(v => {
        const meta = `<${v.filename}>:${v.location.start.line}:${
          v.location.start.column + 1 // while + 1 ? because the stack track diffrent with babylon parser
        }`;
        return v.stack ? `at ${v.stack} (${meta})` : `at ${meta}`;
      })
      .map(v => "    " + v)
      .join("\n");
  }

  get size() {
    return this.items.length;
  }
}
