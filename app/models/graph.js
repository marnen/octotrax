'use strict';

let unindent = require('unindent');

let _commits = new WeakMap();

module.exports = class Graph {
  constructor(commits) {
    _commits.set(this, commits);
  }

  get commits() { return _commits.get(this) }

  toDot(options) {
    const nodeHeight = 8;
    let pxToIn = px => px / 96.75;
    let ranksep = options.rowHeight - nodeHeight;

    return unindent(`
    digraph "commit graph" {
      nodesep = "0.1";
      ordering = out;
      rankdir = TB;
      ranksep = "${pxToIn(ranksep)} equally"
      edge [arrowhead = none, color = "${options.color}", penwidth = 2];
      node [shape = circle, style = filled, label = "", height = "${pxToIn(nodeHeight)}", color = "${options.color}"];

      subgraph levels {
        edge [style = invis];
        node [style = invis, height = 0];
        ${Array.from(new Array(this.commits.length), (_, i) => `"L${i}"`).join(' -> ')};
      }
    `, {trim: true}) + '\n';
  }
};
