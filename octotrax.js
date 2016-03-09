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
let color = hexColor(head.find('.commit-author').first().css('color'));
let rowHeight = head.height();
let nodeHeight = 9;
let ranksep = rowHeight - nodeHeight;
let dot =
`
digraph "commit graph" {
  rankdir = TB;
  ranksep = "${pxToIn(ranksep)} equally"
  splines = line;
  edge [arrowhead = none, color = "${color}"];
  node [shape = circle, label = "", height = "${pxToIn(nodeHeight)}", color = "${color}"];
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
  commits.toArray().forEach(commit => {
    let hash = commit.dataset.octotraxHash;
    let shortHash = hash.slice(0, 7);
    commitInfo[hash].parents.forEach(parent => {
      dot += `  "${hash}" -> "${parent.sha}";\n`;
    });
  });
  dot += '}';

  let svg = $(Viz(dot));
  let svgDiv = $('<div></div>').attr({id: 'octotrax-commit-graph'}).append(svg);
  svgDiv.css('margin-top', ((rowHeight - nodeHeight) - 2) / 2);
  let commitsListing = $('.commits-listing');
  svgDiv.insertBefore(commitsListing);
  commitsListing.width((_, oldWidth) => {
    return (oldWidth - svgDiv.width()) - 1;
  });
});
