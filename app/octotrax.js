'use strict';
let hexColor = color => {
  if (color[0] === '#') {
    return color;
  } else {
    let rgb = color.match(/\d+/g).map(num => parseInt(num).toString(16));
    return `#${rgb.join('')}`;
  }
};

let $ = require('jquery');
let Graph = require('models/graph');

let commits = $('li.commit');
commits.attr('data-octotrax-hash', function () {
  return this.dataset.channel.split(':').slice(-1)[0];
});

let head = commits.first();
let headHash = head.attr('data-octotrax-hash');
let color = hexColor(head.find('.sha.btn').first().css('color'));
let rowHeight = head.height();
let nodeHeight = 8;
let graph = new Graph(commits);
let dot = graph.toDot({rowHeight: rowHeight, color: color});

let username = $('.entry-title .author').text();
let repo = $('.entry-title [itemprop="name"]').text();
let Octokat = require('octokat');
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
  dot += '}';

  let svg = $(Viz(dot));
  let svgDiv = $('<div></div>').attr({id: 'octotrax-commit-graph'}).append(svg);
  let commitsListing = $('.commits-listing');
  svgDiv.css('margin-top', ((rowHeight - nodeHeight) - 2) / 2);
  svgDiv.prependTo(commitsListing);
  svgDiv.css('left', -svgDiv.width());
});
