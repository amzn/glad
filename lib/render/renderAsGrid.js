import { RenderBase } from './renderBase.js'
import { Constants } from '../models/constants.js'
import { Graph } from '../models/graph.js'
import { Container } from '../models/container.js'

// noinspection DuplicatedCode
export class RenderAsGrid extends RenderBase {
  /**
   * @param {Graph} graph
   * @param {object} options
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
    const { w, h, nodes } = layoutAsGrid(this.graph)
    this.renderSvgStart(w, h)
    this.options.details = true

    // Containers
    nodes.forEach(node => {
      this.renderNode(node)
    })

    // Edges
    this.renderEdgesOfLeaves(this.graph.edges)

    // Counters
    nodes.forEach(node => {
      this.renderNodeEdgeCounters(node)
    })

    // Container Labels
    nodes.forEach(node => {
      this.renderLabels(node)
    })

    this.renderSvgEnd()
  }
}

/**
 * n x n layout
 * @param {Graph} graph
 * @returns {{nodes: Array<Container>, w: number, h: number}}
 */
function layoutAsGrid (graph) {
  let nodesToRender = graph.getAllNodesInEdges()
  const nodesPerRow = Math.floor(Math.sqrt(nodesToRender.length))

  nodesToRender = nodesToRender.sort((a, b) => {
    const compareResultA = graph.getOutIn([a], nodesToRender)
    const compareResultB = graph.getOutIn([b], nodesToRender)
    return compareResultB.weight - compareResultA.weight
  })

  let row = 0
  let col = 0
  nodesToRender.forEach(node => {
    node.rect.x = col * Constants.nodeMinSizeWidth
    node.rect.y = row * Constants.nodeMinSizeHeight
    node.rect.h = Constants.nodeMinSizeHeight
    node.rect.w = Constants.nodeMinSizeWidth
    if (col < (nodesPerRow - 1)) {
      col++
    } else {
      col = 0
      row++
    }
  })

  const h = (row + 1) * Constants.nodeMinSizeHeight
  const w = (nodesPerRow) * Constants.nodeMinSizeWidth
  return { nodes: nodesToRender, w, h }
}
