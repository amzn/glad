/**
 * Context object shared between GLAD and parsers
 */
// Import dependencies needed by GLADContext
import fs from 'fs'

import { Constants } from './models/constants.js'
import { Layers } from './models/layers.js'
import { RenderAsGrid } from './render/renderAsGrid.js'
import { RenderAsLayers } from './render/renderAsLayers.js'
import { RenderAsPoster } from './render/renderAsPoster.js'
import { createLayers } from './render/renderBase.js'

export class GLADContext {
  constructor (options, graph) {
    this.options = options
    this.graph = graph
    this.allFiles = new Set()
    this.allFileImports = []
    this.project = null // For jsTsParser
  }

  /**
   * Create a JSON file based on the graph
   */
  generateJSON () {
    this.writeOutputFile('./glad.json', this.graph.serialize())
  }

  /**
   * Create an SVG file from the Renderer
   */
  generateSVG () {
    const renderAs = this.getRendererBasedOnUserChoice()
    const svgSource = renderAs.getSVG(this.graph, this.options)
    this.writeOutputFile(this.options.output, svgSource)
  }

  /**
   * What diagrams to render?
   * @returns {RenderAsGrid|RenderAsLayers|RenderAsPoster}
   */
  getRendererBasedOnUserChoice () {
    switch (this.options.view) {
      case Constants.VIEW_GRID:
        return new RenderAsGrid()

      case Constants.VIEW_LAYERS:
        return new RenderAsLayers()

      case Constants.VIEW_POSTER:
      default:
        return new RenderAsPoster()
    }
  }

  /**
   * Process the graph (shared method)
   * @returns {boolean} False when there are no files to process, true otherwise.
   */
  processTheGraph () {
    if (this.graph.rootNode.sub.length === 0) {
      this.consoleOutput.error('No files found')
      return false
    }

    this.graph.prepareEdges()

    // Run layering to determine up dependencies (bad architecture)
    this.runLayeringForDependencyAnalysis()

    if (this.options.debug) {
      this.consoleOutput.info('--------- Container Tree --------')
      this.graph.rootNode.printTree()

      this.consoleOutput.info('----------- Edges ----------')
      this.graph.edges.print()
    }

    // Generate the Graph
    if (this.options.json) {
      this.generateJSON()
    }

    // Generate the SVG
    this.generateSVG()
    return true
  }

  /**
   * Run layering algorithm to determine which edges are "up dependencies" (bad architecture)
   */
  runLayeringForDependencyAnalysis () {
    const nodesToRender = this.graph.getAllNodesInEdges()
    if (nodesToRender.length === 0) return

    const layers = new Layers()

    // Use the same layering logic as the visualization
    createLayers(this.graph, layers, nodesToRender, this.options)

    // Now simulate what the renderer would do - mark edges as up dependencies
    // based on the y-coordinates that would be assigned
    this.simulateRenderingToMarkUpDependencies(layers)
  }

  /**
   * Simulate rendering to determine which edges would be orange (up dependencies)
   * @param {Layers} layers
   */
  simulateRenderingToMarkUpDependencies (layers) {
    // For layers view: higher layer index = lower on screen (higher y)
    // Orange lines occur when source y >= target y, i.e., sourceLayer >= targetLayer

    // For each edge, determine if it would be drawn as orange
    this.graph.edges.forEach(edge => {
      if (!edge.isCircular) {
        // Find which layer each node is in
        let sourceLayerIndex = -1
        let targetLayerIndex = -1

        layers.forEach((layer, index) => {
          if (layer.nodes.includes(edge.source)) {
            sourceLayerIndex = index
          }
          if (layer.nodes.includes(edge.target)) {
            targetLayerIndex = index
          }
        })

        // If source is in a higher or equal layer index than target,
        // it would be drawn as orange (up dependency)
        if (sourceLayerIndex >= targetLayerIndex && sourceLayerIndex !== -1 && targetLayerIndex !== -1) {
          edge.isUpDependency = true
        }
      }
    })
  }

  /**
   * Write content to a file with consistent error handling and logging
   * @param {string} filePath - Path to the output file
   * @param {string} content - Content to write
   */
  writeOutputFile (filePath, content) {
    fs.writeFileSync(filePath, content)
    this.consoleOutput.success(filePath)
  }
}
