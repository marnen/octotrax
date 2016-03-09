'use strict';

let commits = $('li.commit');
commits.attr('data-octotrax-hash', function () {
  return this.dataset.channel.split(':').slice(-1)[0];
});

let head = commits.first();
let headHash = head.attr('data-octotrax-hash');

let dot =
`
digraph "commit graph" {
  rankdir = TB;
  splines = line;
  node [shape = circle, label = "", height = ${6/72}];
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
  let commitsListing = $('.commits-listing');
  svgDiv.insertBefore(commitsListing);
  commitsListing.width((_, oldWidth) => {
    return oldWidth - svgDiv.width();
  });
});
