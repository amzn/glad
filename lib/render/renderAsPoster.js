import { createLayers, RenderBase } from './renderBase.js'
import { Constants } from '../models/constants.js'
import { Graph } from '../models/graph.js'
import { Container } from '../models/container.js'
import { getLayersInThisNode } from '../models/layers.js'

export class RenderAsPoster extends RenderBase {
  /**
   * @param {Graph} graph
   * @param {Constants} options
   * @returns {string}
   */
  getSVG (graph, options) {
    super.init(graph, options)
    this.render()
    return this.getSvgDocument()
  }

  /**
   * Override rendering method
   */
  render () {
    layoutAsFoldersWithLayers(this.graph, this.options)

    this.renderSvgStart(this.graph.rootNode.rect.w, this.graph.rootNode.rect.h)

    const startingNode = this.graph.getFirstNonCommonRoot()

    if (this.options.layers) {
      this.renderLayerAs('Layers_Rects', startingNode, true, false)
    }

    // ALPHA Not yer ready
    // flush folder's width to parents inner width
    if (this.options.useFullLayerWidth) {
      this.graph.getAllNodes().forEach(node => {
        if (!node.isLeaf && node.parent) {
          const layers = getLayersInThisNode(node.parent)
          const layer = layers.getLayerWithThisNode(node)
          if (layer.nodes.length === 1) {
            // noinspection JSUnresolvedVariable
            node.rect.x = node.parent.rect.x1 + (Constants.padding / 2)
            // noinspection JSUnresolvedVariable
            node.rect.width = node.parent.rect.width - Constants.padding
          }
        }
      })
    }

    // Containers
    this.renderNode(startingNode)

    // Edges
    if (this.options.edges === Constants.EDGES_NODE || this.options.edges === Constants.EDGES_BOTH) {
      this.renderEdgesOfLeaves(this.graph.edges)
    }
    if (this.options.edges === Constants.EDGES_FOLDER || this.options.edges === Constants.EDGES_BOTH) {
      const containers = new Set()
      this.graph.getAllNodes().forEach(c => {
        if (c.parent) {
          containers.add(c.parent)
        }
      })
      this.renderEdgesOfContainer([...containers])
    }

    // Counters
    if (this.options.edges === Constants.EDGES_NODE || this.options.edges === Constants.EDGES_BOTH) {
      this.renderNodeEdgeCounters(startingNode)
    }

    // Labels
    this.renderLabels(startingNode)

    if (this.options.layers) {
      this.renderLayerAs('Layers_Text', startingNode, false, true)
    }

    this.renderSvgEnd()
  }

  /**
   * @param {string} groupId
   * @param {Container} startingNode
   * @param {boolean} renderRectangle
   * @param {boolean} renderText
   */
  renderLayerAs (groupId, startingNode, renderRectangle = true, renderText = true) {
    this.renderSvgGroupStart(groupId)
    this.renderLayers(startingNode, renderRectangle, renderText)
    this.renderSvgGroupEnd()
  }
}

/**
 * Glad layout using Folders / Files / Edges
 *
 * @param {Graph} graph
 * @param {object} options
 */
function layoutAsFoldersWithLayers (graph, options) {
  graph.rootNode = graph.getFirstNonCommonRoot()
  graph.rootNode.parent = null // disconnect from the ancestors
  recursiveCreateLayers(graph, graph.rootNode, options)
  moveLayersAndNodesToMatchTheirContainers(graph.rootNode, options)
}

/**
 * @param {Graph} graph
 * @param {Container} node
 * @param {object} options
 */
function recursiveCreateLayers (graph, node, options) {
  node.sub.forEach(n => {
    recursiveCreateLayers(graph, n, options)
  })

  createLayers(graph, getLayersInThisNode(node), node.sub, options)

  // Normalize the layers heights and Widths
  getLayersInThisNode(node).forEach(layer => {
    layer.rect.h = layer.getMaxHeight()
    layer.rect.w = layer.getAllNodesWith()
  })

  getLayersInThisNode(node).setAllLayersToTheSameMaxWidth()

  // Make sure that every container are large enough to hold their descendent objects
  node.rect.h = Math.max(node.rect.h, getLayersInThisNode(node).getTotalHeight())
  node.rect.w = Math.max(node.rect.w, getLayersInThisNode(node).getMaxWidth())

  // Container needs a bit of space to better visually see their child nodes
  if (!node.isLeaf) {
    node.rect.w += Constants.padding
    node.rect.h += Constants.padding * 2
  }
}

/**
 * @param {Container} node
 * @param {object} options
 * @param {string} verticalAlignment
 */
function moveLayersAndNodesToMatchTheirContainers (node, options, verticalAlignment = 'top') {
  // sort sub node by index
  sortSubNodesByIndex(node)

  const nodeLayers = getLayersInThisNode(node)
  nodeLayers.placeVerticallyStartingFrom(node.rect.top)
  nodeLayers.placeHorizontallyInsideTheContainer(node)
  nodeLayers.placeNodeInsideTheLayers(options.align, verticalAlignment)
  node.sub.forEach(sub => {
    moveLayersAndNodesToMatchTheirContainers(sub, options, verticalAlignment)
  })
}

/**
 * @param {Container} node
 */
function sortSubNodesByIndex (node) {
  node.sub.sort((a, b) => {
    const result = a.rect.top - b.rect.top
    if (result === 0) {
      return a.rect.left - b.rect.left
    }
    return result
  })
}
