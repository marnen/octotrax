'use strict';

let unindent = require('unindent');

let _commits = new WeakMap();
let _commitInfo = new WeakMap();

module.exports = class Graph {
  constructor(commits, {info}) {
    let commitsArray = commits.toArray ? commits.toArray() : commits;
    _commits.set(this, commitsArray);
    _commitInfo.set(this, info);
  }

  get commits() { return _commits.get(this) }

  toDot({color, rowHeight}) {
    const nodeHeight = 8;
    let pxToIn = px => px / 96.75;
    let ranksep = rowHeight - nodeHeight;

    let dot = unindent(`
    digraph "commit graph" {
      nodesep = "0.1";
      ordering = out;
      rankdir = TB;
      ranksep = "${pxToIn(ranksep)} equally"
      edge [arrowhead = none, color = "${color}", penwidth = 2];
      node [shape = circle, style = filled, label = "", height = "${pxToIn(nodeHeight)}", color = "${color}"];

      subgraph levels {
        edge [style = invis];
        node [style = invis, height = 0];
        ${Array.from(new Array(this.commits.length), (_, i) => `"L${i}"`).join(' -> ')};
      }
    `, {trim: true}) + '\n';

    this.commits.forEach((commit, index) => {
      let hash = commit.dataset.octotraxHash;
      let commitInfo = _commitInfo.get(this);
      let parents = commitInfo[hash].parents;
      let isMerge = parents.length > 1;

      parents.forEach((parent, index) => {
        let edge = `  "${hash}" -> "${parent.sha}"`;
        if (isMerge) {
          edge += ` [weight = ${parents.length - index}]`;
          // TODO: if a merge is the first parent of another merge, make its weights even higher
          // IDEA: for merges, weight = parents.length + commitIndex - parentIndex;
          //       for non-merges, weight = parent.weight.
          //       This would require keeping track of parent.weight, but might guarantee vertical lines.
        }
        if (!commitInfo[parent.sha]) {
          edge += ` [arrowhead = normal]`;
          dot += `  "${parent.sha}" [style = invis];\n`;
        }
        dot += `  ${edge};\n`;
      });
      dot += `  { rank = same; "${hash}"; "L${index}"; }\n`;
    });

    dot += '}\n';
    return dot;
  }
};
