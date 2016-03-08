'use strict';

let commits = $('li.commit');
commits.attr('data-octotrax-hash', function () {
  return this.dataset.channel.split(':').slice(-1)[0];
});

let dot =
`
digraph "commit graph" {
  rankdir = TB;
`

var childHash;
commits.toArray().forEach(commit => {
  let shortHash = commit.dataset.octotraxHash.slice(0, 7);
  if (childHash) {
    dot += `  "${childHash}" -> "${shortHash}";\n`;
  }
  childHash = shortHash;
});
dot += '}';

let svg = $(Viz(dot)).attr({id: 'octotrax-commit-graph'});
svg.appendTo($('body'));
