'use strict';
let pxToIn = px => { return px / 96.75 };
let hexColor = color => {
  if (color[0] === '#') {
    return color;
  } else {
    let rgb = color.match(/\d+/g).map(num => { return parseInt(num).toString(16) });
    return `#${rgb.join('')}`;
  }
}

let commits = $('li.commit');
commits.attr('data-octotrax-hash', function () {
  return this.dataset.channel.split(':').slice(-1)[0];
});

let head = commits.first();
let headHash = head.attr('data-octotrax-hash');
let color = hexColor(head.find('.sha.btn').first().css('color'));
let rowHeight = head.height();
let nodeHeight = 8;
let ranksep = rowHeight - nodeHeight;
let dot =
`
digraph "commit graph" {
  rankdir = TB;
  ranksep = "${pxToIn(ranksep)} equally"
  edge [arrowhead = none, color = "${color}", penwidth = 2];
  node [shape = circle, style = filled, label = "", height = "${pxToIn(nodeHeight)}", color = "${color}"];

  subgraph levels {
    edge [style = invis];
    node [style = invis, height = 0];
    ${Array.from(new Array(commits.length), (_, i) => `"L${i}"`).join(' -> ')};
  }
`;

let username = $('.entry-title .author').text();
let repo = $('.entry-title [itemprop="name"]').text();
let octokat = new Octokat();
octokat.repos(username, repo).commits.fetch(
  {sha: headHash, per_page: commits.length}
).then(rawInfo => {
  let commitInfo = {};
  rawInfo.forEach(commit => {
    commitInfo[commit.sha] = commit;
  });

  commits.toArray().forEach((commit, index) => {
    let hash = commit.dataset.octotraxHash;
    let parents = commitInfo[hash].parents;
    let isMerge = parents.length > 1;

    parents.forEach((parent, index) => {
      let edge = `  "${hash}" -> "${parent.sha}"`;
      if (isMerge) {
        edge += ` [weight = ${parents.length - index}]`;
      }
      if (!commitInfo[parent.sha]) {
        edge += ` [arrowhead = normal]`
        dot += `  "${parent.sha}" [style = invis];\n`
      }
      dot += `  ${edge};\n`;
    });
    dot += `  { rank = same; "${hash}"; "L${index}"; }\n`
  });
  dot += '}';

  let svg = $(Viz(dot));
  let svgDiv = $('<div></div>').attr({id: 'octotrax-commit-graph'}).append(svg);
  let commitsListing = $('.commits-listing');
  svgDiv.css('margin-top', ((rowHeight - nodeHeight) - 2) / 2);
  svgDiv.prependTo(commitsListing);
  svgDiv.css('left', -svgDiv.width());
});
