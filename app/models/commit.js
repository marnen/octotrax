'use strict';

let _sha = new WeakMap();

module.exports = class Commit {
  constructor({dataset: {octotraxHash: sha}}) {
    _sha.set(this, sha);
  }

  get sha() { return _sha.get(this); }
};
