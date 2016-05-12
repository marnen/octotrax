'use strict';

let _allCommits = {};
let _sha = new WeakMap();

module.exports = class Commit {
  constructor({dataset: {octotraxHash: sha}}) {
    _sha.set(this, sha);
    _allCommits[sha] = this;
  }

  static find(sha) {
    return _allCommits[sha];
  }

  get sha() { return _sha.get(this); }
};
