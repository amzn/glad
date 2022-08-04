import assert from 'assert'
import fs from 'fs'

import { describe, it } from 'mocha'
import { Constants } from '../lib/models/constants.js'
import { Graph } from '../lib/models/graph.js'
import { Container } from '../lib/models/container.js'
import { RenderAsGrid } from '../lib/render/renderAsGrid.js'
import { RenderAsLayers } from '../lib/render/renderAsLayers.js'
import { RenderAsPoster } from '../lib/render/renderAsPoster.js'

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
