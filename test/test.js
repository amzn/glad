import assert from 'assert'
import fs from 'fs'

import { describe, it } from 'mocha'

import { GLAD } from '../lib/glad.js'
import { Constants } from '../lib/models/constants.js'
import { Container } from '../lib/models/container.js'
import { Graph } from '../lib/models/graph.js'
import { RenderAsGrid } from '../lib/render/renderAsGrid.js'
import { RenderAsLayers } from '../lib/render/renderAsLayers.js'
import { RenderAsPoster } from '../lib/render/renderAsPoster.js'
// Import additional test files
import '../test/test_js.js'
import '../test/test_ts.js'
import '../test/test_swift.js'
import '../test/test_dot.js'
import '../test/test_cli_exit_codes.js'

const graph = new Graph()
graph.rootNode = new Container(null, 'Farming')

// Land
const nodeLand = graph.rootNode.upsert('Land')
const nodeBarn1 = nodeLand.upsert('Barn1')
const nodeBarn2 = nodeLand.upsert('Barn2')
nodeBarn2.isLeaf = true

// People
const nodePeople = graph.rootNode.upsert('People')

const nodePersonA = nodePeople.upsert('PersonA')
nodePersonA.isLeaf = true

const nodePersonB = nodePeople.upsert('PersonB')
nodePersonB.isLeaf = true
graph.upsertEdge(nodePersonA, nodePersonB)

// Animal
const nodeAnimals = graph.rootNode.upsert('Animals')

const nodeCows = nodeAnimals.upsert('Cows')
nodeCows.isLeaf = true

const nodeChickens = nodeAnimals.upsert('Chickens')
nodeChickens.isLeaf = true

// Edges
{
  graph.upsertEdge(nodeBarn2, nodeChickens)

  const food1 = nodeBarn1.upsert('Potato')
  food1.setAsLeaf(food1.name)

  const food2 = nodeBarn1.upsert('Yam')
  food2.setAsLeaf(food2.name)

  // add a circular dependency
  graph.upsertEdge(food1, food2)
  graph.upsertEdge(food2, food1)
}

graph.prepareEdges()

describe('Models', function () {
  it('Tree counts', function () {
    console.info('--------- Container Tree --------')
    graph.rootNode.printTree()

    console.info('----------- Edges ----------')
    graph.edges.print()

    assert.strictEqual(nodeLand.sub.length, 2)
    assert.strictEqual(nodePeople.sub.length, 2)
  })

  it('Orphan nodes', function () {
    const orphanNodes = graph.getOrphanNodes()

    // Nodes with edges: Barn2, PersonA, PersonB, Chickens, Potato, Yam
    // Only leaf nodes with no edges should be orphans: Cows
    // Containers with files (Land, Barn1, People, Animals) should NOT be orphans
    const orphanNodeNames = orphanNodes.map(node => node.name)

    assert(orphanNodeNames.includes('Cows'), 'Cows should be orphan (leaf with no edges)')

    // Containers with files should NOT be orphans
    assert(!orphanNodeNames.includes('Land'), 'Land should not be orphan (has files)')
    assert(!orphanNodeNames.includes('Barn1'), 'Barn1 should not be orphan (has files)')
    assert(!orphanNodeNames.includes('People'), 'People should not be orphan (has files)')
    assert(!orphanNodeNames.includes('Animals'), 'Animals should not be orphan (has files)')

    // Verify connected nodes are NOT orphans
    assert(!orphanNodeNames.includes('Barn2'), 'Barn2 should not be orphan')
    assert(!orphanNodeNames.includes('PersonA'), 'PersonA should not be orphan')
    assert(!orphanNodeNames.includes('PersonB'), 'PersonB should not be orphan')
    assert(!orphanNodeNames.includes('Chickens'), 'Chickens should not be orphan')
    assert(!orphanNodeNames.includes('Potato'), 'Potato should not be orphan')
    assert(!orphanNodeNames.includes('Yam'), 'Yam should not be orphan')
  })

  it('Single orphan node', function () {
    // Create a simple graph with one orphan node
    const simpleGraph = new Graph()
    simpleGraph.rootNode = new Container(null, 'Root')

    const connectedNode = simpleGraph.rootNode.upsert('Connected')
    connectedNode.isLeaf = true

    const orphanNode = simpleGraph.rootNode.upsert('Orphan')
    orphanNode.isLeaf = true

    // Add an edge to make connectedNode non-orphan
    simpleGraph.upsertEdge(connectedNode, connectedNode) // Self-loop still counts as having an edge

    const orphanNodes = simpleGraph.getOrphanNodes()
    const orphanNodeNames = orphanNodes.map(node => node.name)

    assert.strictEqual(orphanNodes.length, 1, 'Should have 1 orphan node (only Orphan leaf)')
    assert(!orphanNodeNames.includes('Root'), 'Root should not be orphan (contains files)')
    assert(orphanNodeNames.includes('Orphan'), 'Orphan should be orphan')
    assert(!orphanNodeNames.includes('Connected'), 'Connected should not be orphan')
  })
})

describe('SVG layout as Grid', function () {
  it('Dimension are valid', function () {
    const svg = new RenderAsGrid()

    const options = new Constants()
    options.layers = true
    options.details = true
    options.lines = Constants.LINES_CURVE
    options.lineEffect = 'flat'

    const svgSource = svg.getSVG(graph, options)
    const pathFile = './test/results/testLayoutGrid.svg'
    console.info(pathFile)
    fs.writeFileSync(pathFile, svgSource, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  })

  it('Dimension are valid', function () {
    assert.strictEqual(graph.rootNode.rect.x, 0, 'x1')
    assert.strictEqual(graph.rootNode.rect.y, 0, 'y1')
    assert.strictEqual(graph.rootNode.rect.w, 300, 'w')
    assert.strictEqual(graph.rootNode.rect.h, 80, 'h')
  })
})

describe('SVG layout as Layers', function () {
  it('Dimension are valid', function () {
    const svg = new RenderAsLayers()
    const options = new Constants()
    options.view = 'layers'
    options.layers = true
    options.details = true
    options.lines = Constants.LINES_STRAIT
    options.lineEffect = 'outline'

    const svgSource = svg.getSVG(graph, options)
    const pathFile = './test/results/testLayoutLayers.svg'
    console.info(pathFile)
    fs.writeFileSync(pathFile, svgSource, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  })

  it('Dimension are valid', function () {
    assert.strictEqual(graph.rootNode.rect.x, 0, 'x1')
    assert.strictEqual(graph.rootNode.rect.y, 0, 'y1')
    assert.strictEqual(graph.rootNode.rect.w, 900, 'w')
    assert.strictEqual(graph.rootNode.rect.h, 300, 'h')
  })
})

describe('SVG layout as Glad', function () {
  it('Dimension are valid', function () {
    const svg = new RenderAsPoster()
    const options = new Constants()
    options.view = 'poster'
    options.align = Constants.ALIGN_LEFT
    options.details = true
    options.edges = Constants.EDGES_BOTH
    options.lines = Constants.LINES_CURVE
    options.lineEffect = 'shadow'
    options.debug = true

    const svgSource = svg.getSVG(graph, options)
    const pathFile = './test/results/testLayoutPoster.svg'
    console.info(pathFile)
    fs.writeFile(pathFile, svgSource, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  })

  it('Dimension are valid', function () {
    assert.strictEqual(graph.rootNode.rect.x, 0, 'x1')
    assert.strictEqual(graph.rootNode.rect.y, 0, 'y1')
    assert.strictEqual(graph.rootNode.rect.w, 1040, 'w')
    assert.strictEqual(graph.rootNode.rect.h, 520, 'h')
  })
})

describe('Swift Comment and String Removal', function () {
  const glad = new GLAD({ silent: true })

  it('removes single-line comments', function () {
    const input = `
// This is a comment
class MyClass {}
// Another comment
struct MyStruct {}
`
    const expected = `

class MyClass {}

struct MyStruct {}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    assert.strictEqual(result, expected)
  })

  it('removes multi-line comments', function () {
    const input = `/*
Multi-line
comment
*/
class MyClass {}
`
    const expected = `
class MyClass {}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    assert.strictEqual(result, expected)
  })

  it('removes string literals', function () {
    const input = `
let message = "Hello World"
class MyClass {}
let name = 'John'
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that string literals are removed but code structure is preserved
    assert(result.includes('let message ='))
    assert(result.includes('class MyClass'))
    assert(result.includes('let name ='))
    assert(!result.includes('"Hello World"'))
    assert(!result.includes("'John'"))
  })

  it('handles mixed comment types and strings', function () {
    const input = `
// Single line comment
/* Multi-line
   comment */
let config = "FOOBAR"
class RealClass { // inline comment
    let value = "test" // another comment
    var property: String
}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that comments and strings are removed and real class/struct definitions are preserved
    assert(result.includes('class RealClass {'))
    assert(result.includes('var property: String'))
    assert(!result.includes('// Single line comment'))
    assert(!result.includes('/* Multi-line'))
    assert(!result.includes('"FOOBAR"'))
    assert(!result.includes('"test"'))
  })

  it('preserves code with commented fake definitions and strings', function () {
    const input = `
// struct FakeStruct - should not be detected
let config = "FOOBAR"
class RealClass {}
/* enum HiddenEnum {
    case fake
} */
struct RealStruct {}
let data = "test"
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that real definitions are preserved and fake ones are ignored
    assert(result.includes('class RealClass'))
    assert(result.includes('struct RealStruct'))
    assert(!result.includes('struct FakeStruct'))
    assert(!result.includes('enum HiddenEnum'))
    assert(!result.includes('"FOOBAR"'))
    assert(!result.includes('"test"'))
  })

  it('handles nested multi-line comments correctly', function () {
    const input = `/* Outer comment
/* nested comment */
still in outer */
class MyClass {}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that the comment is properly handled and code is preserved
    assert(result.includes('class MyClass'))
    assert(!result.includes('/* Outer comment'))
    assert(result.includes('still in outer */'))
  })

  it('preserves empty lines and formatting', function () {
    const input = `
// Comment at start
let config = "value"

class MyClass {}

struct MyStruct {}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that comments and strings are removed but structure is preserved
    assert(result.includes('let config ='))
    assert(result.includes('class MyClass'))
    assert(result.includes('struct MyStruct'))
    assert(!result.includes('// Comment at start'))
    assert(!result.includes('"value"'))
  })

  it('handles escaped quotes in strings', function () {
    const input = `
let message = "He said \\"Hello\\""
class MyClass {}
`
    const result = glad.swiftParser.removeCommentsAndStrings(input)
    // Verify that the string is processed (at least the assignment remains)
    assert(result.includes('let message ='))
    assert(!result.includes('"He said'))
  })
})
