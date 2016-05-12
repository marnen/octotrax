Graph = require '../app/models/graph'
Commit = require '../app/models/commit' # TODO: can we stub more of this?
randomCommits = (count = Faker.random.arrayElement([2..5])) ->
  for [1..count]
    randomCommit()
randomParent = -> {sha: randomHash()}
commitInfo = (commits = randomCommits(1)) ->
  results = {}
  for commit in commits
    hash = commit.dataset.octotraxHash
    info =
      sha: hash
      parents: [randomParent()]
    results[hash] = info
  results

describe 'Graph', ->
  describe 'constructor', ->
    it 'takes an array of commit data and a "hash" of commit info', ->
      commits = randomCommits()
      expect(new Graph(commits, info: commitInfo(commits)).constructor.name).to.equal 'Graph'

  context 'instance methods', ->
    beforeEach ->
      @commits = randomCommits()
      @commitInfo = commitInfo @commits
      @graph = -> new Graph @commits, info: @commitInfo
    describe '#commits', ->
      it 'returns Commit objects made from the commits that the graph was initialized with', ->
        commitObjects = (new Commit(commit) for commit in @commits)
        expect(@graph().commits).to.deep.equal commitObjects
      it 'puts parentage info from the info hash into the appropriate Commit objects', ->
        for commit in @graph().commits
          expect(commit.parents).to.deep.equal @commitInfo[commit.sha].parents
    describe '#toDot', ->
      beforeEach ->
        @defaultOptions =
          rowHeight: Faker.random.arrayElement [10..20],
          color: Faker.internet.color()
        @dot = (options = {}) ->
          @graph().toDot Object.assign(@defaultOptions, options)
      it 'writes the Graphviz header information with the given options', ->
        nodeHeight = 8
        ranksep = @defaultOptions.rowHeight - nodeHeight
        pxToIn = (px) -> px / 96.75

        expect(@dot()).to.contain """
          digraph "commit graph" {
            nodesep = "0.1";
            ordering = out;
            rankdir = TB;
            ranksep = "#{pxToIn(ranksep)} equally"
            edge [arrowhead = none, color = "#{@defaultOptions.color}", penwidth = 2];
            node [shape = circle, style = filled, label = "", height = "#{pxToIn(nodeHeight)}", color = "#{@defaultOptions.color}"];

            subgraph levels {
              edge [style = invis];
              node [style = invis, height = 0];
              #{("\"L#{i}\"" for _, i in @commits).join(' -> ')};
            }\n
        """
      it 'writes a level subgraph for each commit', ->
        for commit, index in @commits
          expect(@dot()).to.contain """
            { rank = same; "#{commit.dataset.octotraxHash}"; "L#{index}"; }
          """
      it 'writes an edge for each parent relationship', ->
        hash = @commits[0].dataset.octotraxHash
        @commitInfo[hash].parents.push randomParent()

        for commit in @commits
          hash = commit.dataset.octotraxHash
          for parent in @commitInfo[hash].parents
            expect(@dot()).to.contain """
              "#{hash}" -> "#{parent.sha}"
            """
      context 'commit translation', ->
        beforeEach ->
          @commit = @commits[0]
          @hash = @commit.dataset.octotraxHash
          @parents = @commitInfo[@hash].parents
        context 'parent', ->
          beforeEach ->
            @parent = @parents[0]
            @normalArrowhead = ///
               "#{@hash}"\ ->\ "#{@parent.sha}".*\[arrowhead\ =\ normal\]
            ///
          context 'Commit object exists', ->
            beforeEach ->
              new Commit dataset: octotraxHash: @parent.sha
            it 'uses a normal node for the parent', ->
              expect(@dot()).not.to.match @normalArrowhead
          context 'Commit object does not exist', ->
            it 'uses an arrowhead for the parent node', ->
              expect(@dot()).to.match @normalArrowhead
              expect(@dot()).to.contain """
                "#{@parent.sha}" [style = invis]
              """
        context 'merge commit', ->
          beforeEach ->
            for [1..2]
              @parents.push randomParent()
          it 'weights each edge based on the order of the parent commit', ->
            for parent, index in @parents
              expect(@dot()).to.contain """
                "#{@hash}" -> "#{parent.sha}" [weight = #{@parents.length - index}]
              """
        context 'not a merge commit', ->
          it 'does not weight edges', ->
            # TODO: this may change in the future!
            expect(@dot()).not.to.contain 'weight'
