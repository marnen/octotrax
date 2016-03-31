Graph = require '../app/models/graph'
Faker = require 'faker'
SHA1 = require 'sha1'
randomHash = -> SHA1(Faker.random.number 1000)
randomCommits = (count = Faker.random.arrayElement([2..5])) ->
  randomHash() for _ in count

describe 'Graph', ->
  describe 'constructor', ->
    it 'takes an array of commit data', ->
      expect(new Graph([{sha: randomHash()}]).constructor.name).to.equal 'Graph'

  context 'instance methods', ->
    beforeEach ->
      @commits = randomCommits()
      @graph = -> new Graph @commits
    describe '#commits', ->
      it 'returns the commits that the graph was initialized with', ->
        expect(@graph().commits).to.deep.equal @commits
    describe '#toDot', ->
      it 'writes the Graphviz header information with the given options', ->
        color = Faker.internet.color()
        rowHeight = Faker.random.arrayElement [10..20]
        nodeHeight = 8
        ranksep = rowHeight - nodeHeight
        pxToIn = (px) -> px / 96.75

        options = rowHeight: rowHeight, color: color

        expect(@graph().toDot(options)).to.equal """
          digraph "commit graph" {
            nodesep = "0.1";
            ordering = out;
            rankdir = TB;
            ranksep = "#{pxToIn(ranksep)} equally"
            edge [arrowhead = none, color = "#{color}", penwidth = 2];
            node [shape = circle, style = filled, label = "", height = "#{pxToIn(8)}", color = "#{color}"];

            subgraph levels {
              edge [style = invis];
              node [style = invis, height = 0];
              #{("\"L#{i}\"" for _, i in @commits).join(' -> ')};
            }\n
        """
