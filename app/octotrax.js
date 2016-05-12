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
let username = $('.entry-title .author').text();
let repo = $('.entry-title [itemprop="name"]').text();
let Octokat = require('octokat');
let octokat = new Octokat();
octokat.repos(username, repo).commits.fetch(
  {sha: headHash, per_page: commits.length}
).then(rawInfo => {
  let commitInfo = {};
  rawInfo.forEach(commit => {
    // TODO: make this a Commit class property
    commitInfo[commit.sha] = commit;
  });

  let color = hexColor(head.find('.sha.btn').first().css('color'));
  let rowHeight = head.height();
  let nodeHeight = 8;
  let graph = new Graph(commits, {info: commitInfo});
  let dot = graph.toDot({rowHeight, color});

  let svg = $(Viz(dot));
  let svgDiv = $('<div></div>').attr({id: 'octotrax-commit-graph'}).append(svg);
  let commitsListing = $('.commits-listing');
  svgDiv.css('margin-top', ((rowHeight - nodeHeight) - 2) / 2);
  svgDiv.prependTo(commitsListing);
  svgDiv.css('left', -svgDiv.width());
});
