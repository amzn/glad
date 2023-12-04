import { createLayers, RenderBase } from './renderBase.js'
import { Constants } from '../models/constants.js'
import { Layers } from '../models/layers.js'
import { Graph } from '../models/graph.js'

// noinspection DuplicatedCode
export class RenderAsLayers extends RenderBase {
  /**
   * @param {!Graph} graph
   * @param {!Constants} options
   * @returns {string}
   */
  getSVG (graph, options) {
    super.init(graph, options)
    this.render()
    return this.getSvgDocument()
  }

  /**
   * Override default render()
   */
  render () {
    const { w, h, layers, nodes } = layoutAsLayerEdges(this.graph, this.options)
    const startingNode = this.graph.getFirstNonCommonRoot()
    startingNode.rect.w = w
    startingNode.rect.h = h

    this.renderSvgStart(w, h)

    this.svgDoc += '<rect width="100%" height="100%" fill="white"/>'

    // ---------------------------------
    // Layers
    if (this.options.layers) {
      this.renderSvgGroupStart('Layers')
      layers.forEach((layer, index) => {
        this.renderLayer(layer, '', index, true, true)
      })
      this.renderSvgGroupEnd()
    }

    // ---------------------------------
    // Containers
    this.options.details = true

    nodes.forEach(node => {
      this.renderNode(node)
    })

    // ---------------------------------
    // Edges
    this.renderEdgesOfLeaves(this.graph.edges)

    // Counters
    nodes.forEach(node => {
      this.renderNodeEdgeCounters(node)
    })

    // ---------------------------------
    // Container Labels
    nodes.forEach(node => {
      this.renderLabels(node)
    })

    this.renderSvgEnd()
  }
}

/**
 * Layer Diagram using all Edges
 * @param {Graph} graph
 * @param {object} options
 * @returns {{nodes: Array<*>, w: number, h: number, layers: Layers}}
 */
function layoutAsLayerEdges (graph, options) {
  const layers = new Layers()
  const nodesToRender = graph.getAllNodesInEdges()

  const returnedObject = createLayers(graph, layers, nodesToRender, options)
  layers.forEach(layer => {
    layer.setWidthBasedOnMaxNodeRight()
  })
  layers.setAllLayersToTheSameMaxWidth()
  return {
    w: layers.getMaxWidth(),
    h: layers.getTotalHeight(),
    layers: returnedObject.layers,
    nodes: returnedObject.nodesToRender
  }
}
