import { Constants } from './constants.js'
import { Layer } from './layer.js'
import { Container } from './container.js'

const nodeLayersMapping = new Map()

/**
 * Array of Layer
 *
 * @augments {Array<Layer>}
 */
export class Layers extends Array {
  /**
   * @returns {Layer}
   */
  addLayer () {
    const newLayer = new Layer()
    newLayer.index = this.length
    this.push(newLayer)
    return newLayer
  }

  /**
   * @param {number} index
   * @returns {Layer}
   */
  insertLayerAt (index) {
    const newLayer = new Layer()
    this.splice(index, 0, newLayer)

    // reIndex all the layers
    this.forEach((layer, index) => {
      layer.index = index
    })
    return newLayer
  }

  /**
   * @returns {number}
   */
  getTotalHeight () {
    let h = 0
    this.forEach(layer => {
      h += Math.max(layer.rect.h, layer.getMaxHeight())
    })
    return h
  }

  /**
   * @returns {number}
   */
  getMaxWidth () {
    let w = 0
    this.forEach(layer => {
      w = Math.max(w, layer.rect.w)
    })
    return w
  }

  /**
   * @param {Container} node
   * @returns {object}
   */
  getLayerWithThisNode (node) {
    return this.find((layer) => {
      return layer.nodes.find(n => n.id === node.id)
    })
  }

  /**
   * Remove empty layers
   */
  compactEmptyLayers () {
    const listOfLayerIndexToRemove = []
    this.forEach((layer, index) => {
      if (layer.nodes.length === 0) {
        listOfLayerIndexToRemove.push(index)
      }
    })

    listOfLayerIndexToRemove.reverse().forEach(indexToRemove => {
      this.splice(indexToRemove, 1)
    })

    this.indexAll()
  }

  /**
   * @param {Layer} newLayer
   * @param {Container} node
   */
  moveNodeTo (newLayer, node) {
    const currentLayer = this.getLayerWithThisNode(node)
    if (currentLayer) {
      // is this a move
      this.moveNodeFromTo(currentLayer, newLayer, node)
    } else {
      // or simply a put
      newLayer.nodes.push(node)
    }
  }

  /**
   * @param {Layer} layerFrom
   * @param {Layer} layerTo
   * @param {Container} node
   */
  moveNodeFromTo (layerFrom, layerTo, node) {
    layerFrom.nodes.removeNode(node)
    layerTo.nodes.push(node)
  }

  /**
   * @param {string} horizontalAlignment
   * @param {string} verticalAlignment
   */
  placeNodeInsideTheLayers (horizontalAlignment = Constants.ALIGN_CENTER, verticalAlignment = Constants.ALIGN_CENTER) {
    this.forEach(layer => {
      layer.sortNodesByEdgesScore()

      switch (horizontalAlignment) {
        case 'left':
          layer.placeNodesLeftToRight(verticalAlignment)
          break
        case Constants.ALIGN_CENTER:
          layer.placeNodesHorizontallyCenter(verticalAlignment)
          break
        case 'right':
          layer.placeNodesRightToLeft(verticalAlignment)
          break
      }
      layer.nodes.forEach(node => {
        getLayersInThisNode(node).placeNodeInsideTheLayers(horizontalAlignment, verticalAlignment)
      })
    })
  }

  /**
   * @param {number} y
   */
  placeVerticallyStartingFrom (y) {
    this.forEach(layer => {
      layer.rect.y = y + Constants.padding
      layer.placeNodesVerticallyCenter()
      y += layer.rect.h
    })
  }

  /**
   * @param {Container} node
   */
  placeHorizontallyInsideTheContainer (node) {
    this.forEach(layer => {
      layer.rect.x = node.rect.left + Constants.padding / 2
    })
  }

  /**
   * for each "layers" place nodes using the requested horizontal alignment
   *
   * @param {string} alignHorizontally "left" "center" "right"
   * @param {number} defaultLayerHeight
   * @returns {{w: number, h: number}}
   */
  placeLayersAndNodes (alignHorizontally = Constants.ALIGN_CENTER, defaultLayerHeight = Constants.nodeMinSizeHeight + (Constants.padding * 2)) {
    let maxWidthFound = 0
    let rollingY = 0

    this.forEach(layer => {
      // set the layer vertically
      layer.rect.y = rollingY
      layer.rect.h = defaultLayerHeight

      maxWidthFound = Math.max(maxWidthFound, layer.nodes.length * Constants.nodeMinSizeWidth)

      rollingY += layer.rect.h
    })

    // make all layer the same max width
    this.forEach(layer => {
      layer.rect.x = 0
      layer.rect.w = maxWidthFound
    })

    this.placeNodeInsideTheLayers(alignHorizontally)

    return { w: maxWidthFound, h: rollingY }
  }

  /**
   * All layer will have the same exact width
   */
  setAllLayersToTheSameMaxWidth () {
    const maxWidthFound = this.getMaxWidth()
    this.forEach(layer => {
      layer.rect.w = maxWidthFound
    })
  }

  /**
   * let all layer get a new sequential index number
   */
  indexAll () {
    this.forEach((layer, index) => {
      layer.index = index
    })
  }

  /**
   * @returns {Layers}
   */
  sortByIndex () {
    this.sort((a, b) => {
      return a.index - b.index
    })
    return this
  }

  /**
   * @returns {number}
   */
  totalNodes () {
    const result = this.reduce((acc, layer) => { return acc + layer.nodes.length }, 0)
    return Number(result)
  }

  /**
   * @returns {string}
   */
  toString () {
    let text = 'Layers:' + this.length + ' Containers:' + this.totalNodes()
    this.forEach((layer) => {
      text += ', {' + layer.toString() + '}'
    })
    return text
  }
}

/**
 * @param {Container} node
 * @returns {Layers}
 */
export function getLayersInThisNode (node) {
  if (!nodeLayersMapping.has(node)) {
    nodeLayersMapping.set(node, new Layers())
  }
  return nodeLayersMapping.get(node)
}
