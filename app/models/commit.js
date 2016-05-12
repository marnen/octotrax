'use strict';

let _allCommits = {};
let _parents = new WeakMap();
let _sha = new WeakMap();

module.exports = class Commit {
  constructor({dataset: {octotraxHash: sha}}) {
    _sha.set(this, sha);
    _allCommits[sha] = this;
  }

  static find(sha) {
    return _allCommits[sha];
  }

  get parents() { return _parents.get(this) || []; }
  set parents(parents) { _parents.set(this, parents); }

  get sha() { return _sha.get(this); }
};
