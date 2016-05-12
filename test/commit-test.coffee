Commit = require '../app/models/commit'

describe 'Commit', ->
  describe 'constructor', ->
    it 'takes a hash of commit data', ->
      expect(new Commit(randomCommit()).constructor.name).to.equal 'Commit'
  describe 'methods', ->
    beforeEach ->
      commitData = randomCommit()
      @sha = commitData.dataset.octotraxHash
      @commit = new Commit commitData
    describe '.find', ->
      it 'finds a commit by SHA', ->
        expect(Commit.find @sha).to.equal @commit
      it "returns undefined if there's no commit to find", ->
        expect(Commit.find randomHash()).to.be.undefined
    describe '#parents', ->
      it 'returns an empty array by default', ->
        expect(@commit.parents).to.deep.equal []
      it 'is assignable', ->
        parents = ({sha: randomHash()} for [1..5])
        @commit.parents = parents
        expect(@commit.parents).to.deep.equal parents
    describe '#sha', ->
      it 'returns the Octotrax hash from the commit', ->
        commitData = randomCommit()
        expect(new Commit(commitData).sha).to.equal commitData.dataset.octotraxHash
