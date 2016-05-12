Commit = require '../app/models/commit'
randomParent = -> {sha: randomHash()}

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
    describe '#isMerge', ->
      beforeEach ->
        @subject = -> @commit.isMerge()
      context 'no parents', ->
        beforeEach ->
          @commit.parents = []
        it 'returns false', ->
          expect(@subject()).to.be.false
      context 'one parent', ->
        beforeEach ->
          @commit.parents = [randomParent()]
        it 'returns false', ->
          expect(@subject()).to.be.false
      context 'more than one parent', ->
        beforeEach ->
          count = Faker.random.arrayElement [2..5]
          @commit.parents = (randomParent() for [1..count])
        it 'returns true', ->
          expect(@subject()).to.be.true

    describe '#parents', ->
      it 'returns an empty array by default', ->
        expect(@commit.parents).to.deep.equal []
      it 'is assignable', ->
        parents = (randomParent() for [1..5])
        @commit.parents = parents
        expect(@commit.parents).to.deep.equal parents
    describe '#sha', ->
      it 'returns the Octotrax hash from the commit', ->
        commitData = randomCommit()
        expect(new Commit(commitData).sha).to.equal commitData.dataset.octotraxHash
