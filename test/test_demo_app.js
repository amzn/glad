import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { GLAD } from '../lib/glad.js'
import { GLADContext } from '../lib/gladContext.js'
import { Constants } from '../lib/models/constants.js'
import { Container } from '../lib/models/container.js'
import { Graph } from '../lib/models/graph.js'
import { ConsoleOutput } from '../lib/util/console.js'

const demoAppDir = path.join('test', 'demoApp')
const posterOutputPath = path.join(demoAppDir, 'poster.svg')
const posterLayersOutputPath = path.join(demoAppDir, 'poster-layers.svg')
const orphanDemoOutputPath = path.join(demoAppDir, 'orphan-demo.svg')

/**
 * @param {string} outputPath
 */
function deleteOutputIfExists (outputPath) {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath)
  }
}

/**
 * @param {string} outputPath
 * @param {string} view
 * @param {boolean} layers
 * @returns {boolean}
 */
function generateDemoAppOutput (outputPath, view, layers = false) {
  const glad = new GLAD({
    ...getDefaultRenderOptions(),
    input: demoAppDir,
    layers,
    output: outputPath,
    view
  })

  glad.jsTsParser.generateDependenciesFromSourceFiles()
  return glad.context.processTheGraph()
}

/**
 * @param {string} outputPath
 * @returns {boolean}
 */
function generateOrphanDemoOutput (outputPath) {
  const graph = new Graph()
  graph.rootNode = new Container(null, 'Transportation')

  const vehicles = graph.rootNode.upsert('Vehicles')
  vehicles.setAsLeaf('Vehicles')

  const car = graph.rootNode.upsert('Car')
  car.setAsLeaf('Car')

  const truck = graph.rootNode.upsert('Truck')
  truck.setAsLeaf('Truck')

  const orphanVehicle = graph.rootNode.upsert('OrphanVehicle')
  orphanVehicle.setAsLeaf('OrphanVehicle')

  graph.upsertEdge(vehicles, car)
  graph.upsertEdge(vehicles, truck)

  const context = new GLADContext({
    ...getDefaultRenderOptions(),
    output: outputPath,
    view: Constants.VIEW_POSTER
  }, graph)

  context.consoleOutput = new ConsoleOutput({ silent: true })

  return context.processTheGraph()
}

/**
 * @returns {object}
 */
function getDefaultRenderOptions () {
  return {
    align: Constants.ALIGN_CENTER,
    edges: Constants.EDGES_NODE,
    layers: false,
    lineEffect: 'flat',
    lines: Constants.LINES_CURVE,
    silent: true,
    view: Constants.VIEW_POSTER
  }
}

describe('Demo App Artifacts', function () {
  it('regenerates poster.svg', function () {
    deleteOutputIfExists(posterOutputPath)

    const graphWasProcessed = generateDemoAppOutput(posterOutputPath, Constants.VIEW_POSTER)
    assert.strictEqual(graphWasProcessed, true, 'Demo app poster graph should be processed successfully')
    assert(fs.existsSync(posterOutputPath), 'poster.svg should be generated')
  })

  it('regenerates poster-layers.svg', function () {
    deleteOutputIfExists(posterLayersOutputPath)

    const graphWasProcessed = generateDemoAppOutput(posterLayersOutputPath, Constants.VIEW_LAYERS, true)
    assert.strictEqual(graphWasProcessed, true, 'Demo app layers graph should be processed successfully')
    assert(fs.existsSync(posterLayersOutputPath), 'poster-layers.svg should be generated')
  })

  it('regenerates orphan-demo.svg', function () {
    deleteOutputIfExists(orphanDemoOutputPath)

    const graphWasProcessed = generateOrphanDemoOutput(orphanDemoOutputPath)
    assert.strictEqual(graphWasProcessed, true, 'Orphan demo graph should be processed successfully')
    assert(fs.existsSync(orphanDemoOutputPath), 'orphan-demo.svg should be generated')
  })
})
