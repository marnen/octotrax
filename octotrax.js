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
    dot += `  "${hash}" [label = "${shortHash}"];\n`;
    commitInfo[hash].parents.forEach(parent => {
      dot += `  "${hash}" -> "${parent.sha}";\n`;
    });
  });
  dot += '}';

  let svg = $(Viz(dot)).attr({id: 'octotrax-commit-graph'});
  svg.appendTo($('body'));
});
