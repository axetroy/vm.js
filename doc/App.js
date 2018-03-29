import React, { Component } from "react";
import CodeMirror from "react-codemirror";

import "./App.css";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/edit//matchtags.js";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.css";

import vm from "../build/src/vm";
import pkg from "../package";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: `
class Animal {
  constructor() {
    this.runable = true;
    this.breathable = true;
  }
}

class Human extends Animal{
  nameable = true;
  constructor(myName) {
    super();
    this.name = myName;
  }
}

class Developer extends Human{
  codeable = true;
  constructor(developerName){
    super(developerName);
    this.hiredable = true;
  }
  hi(name){
    alert(JSON.stringify({
      message: \`Hi \${name}, I am \${this.name}\`,
      name: this.name,                // inherit from Human
      nameable: this.nameable,        // inherit from Human
      hiredable: this.hiredable,      // get from Developer
      codeable: this.codeable,        // get from Developer
      runable: this.runable,          // inherit from Animal
      breathable: this.breathable     // inherit from Animal
    }, null, 2))
  }
}

const axetroy = new Developer("Axetroy");

axetroy.hi("friend");
      `.trim(),
      error: ""
    };
  }
  updateCode(newCode) {
    this.setState({
      code: newCode,
      error: ""
    });
  }
  runCode(code) {
    try {
      const ctx = {};

      for (let key in window) {
        const val = window[key];
        if (typeof val === "function") {
          ctx[key] = window[key].bind(window);
        } else {
          ctx[key] = window[key];
        }
      }

      ctx.require = require;
      const sandbox = vm.createContext(ctx);
      vm.runInContext(code, sandbox);
    } catch (err) {
      console.error(err);
      this.setState({ error: err.stack });
    }
  }
  render() {
    return (
      <div>
        <a target="_blank" href={`https://github.com/axetroy/vm.js`}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 250 250"
            style={{
              fill: "#64CEAA",
              color: "#fff",
              position: "absolute",
              top: "0",
              border: 0,
              right: 0
            }}
          >
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
            <path
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              fill="currentColor"
              style={{ transformOrigin: "130px 106px" }}
              className="octo-arm"
            />
            <path
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              fill="currentColor"
              className="octo-body"
            />
          </svg>
        </a>
        <div className="container">
          <div style={{ margin: "2rem 0" }}>
            <h3 style={{ textAlign: "center" }}>vm.js@{pkg.version}</h3>
            <p style={{ textAlign: "center", color: "#ccc", margin: "0.5rem" }}>
              Javascript Interpreter, run Javascript code in ECMAScript
            </p>
            <p>
              Run Javascript code in ECMAScript, without eval(), new Function(),
              setTimeout()...
            </p>
            <p>
              It's useful to do dirty job in some environment whitch do not
              allow you exec custom Javascript code.
            </p>
            <p>For example: hot-load in Wechat mini app</p>
          </div>
          <div>
            <CodeMirror
              ref={m => {
                if (!m) return;
                const editor = m.codeMirror;
                // console.dir(m);
                // console.dir(m.getCodeMirror());
                // console.dir(m.getCodeMirrorInstance());
                // const node = document.createElement("div");
                // node.innerText = "Run";
                // editor.addPanel(node, { position: "top", stable: true });
              }}
              className="code-mirror"
              value={this.state.code}
              onChange={this.updateCode.bind(this)}
              options={{
                mode: {
                  name: "javascript"
                },
                styleActiveLine: true,
                indentUnit: 2,
                smartIndent: true,
                tabSize: 2,
                indentWithTabs: false,
                // lineWrapping: true,
                lineNumbers: true,
                // showCursorWhenSelecting: true,
                autofocus: false,
                dragDrop: true,
                allowDropFileTypes: ["js"],
                cursorBlinkRate: 530,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                matchTags: { bothTags: true },
                highlightSelectionMatches: {
                  showToken: /\w/,
                  annotateScrollbar: true
                }
              }}
            />
            <div style={{ textAlign: "center", margin: "1rem" }}>
              <button
                type="button"
                className="btn"
                onClick={() => this.runCode(this.state.code)}
              >
                Run the code!
              </button>
            </div>
            <pre style={{ overflow: "scroll" }}>{this.state.error}</pre>
          </div>
        </div>
      </div>
    );
  }
}
