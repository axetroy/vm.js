declare const wx: any;
declare const window: any;

const g =
  typeof global !== "undefined" // support nodejs
    ? global
    : typeof window !== "undefined" // support browser
      ? window
      : typeof wx !== "undefined" ? wx : this || {}; // support wechat app and web worker

export default g;
