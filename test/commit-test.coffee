Commit = require '../app/models/commit'

describe 'Commit', ->
  describe 'constructor', ->
    it 'takes a hash of commit data', ->
      expect(new Commit(randomCommit()).constructor.name).to.equal 'Commit'
  describe '#sha', ->
    it 'returns the Octotrax hash from the commit', ->
      commit = randomCommit()
      expect(new Commit(commit).sha).to.equal commit.dataset.octotraxHash
