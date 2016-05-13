'use strict';

let allCommits = {};
let _parents = new WeakMap();
let _sha = new WeakMap();

module.exports = class Commit {
  constructor({dataset: {octotraxHash: sha}}) {
    _sha.set(this, sha);
    allCommits[sha] = this;
  }

  static find(sha) {
    return allCommits[sha];
  }

  isMerge() {
    return this.parents.length > 1;
  }

  get parents() { return _parents.get(this) || []; }
  set parents(parents) { _parents.set(this, parents); }

  get sha() { return _sha.get(this); }
};
