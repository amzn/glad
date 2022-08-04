// noinspection DuplicatedCode

import { Constants } from './constants.js'
import { Rectangle } from './rectangle.js'
import { Containers } from './containers.js'

/**
 * @property {Rectangle} rect - location and surface of this layer
 * @property {number} index - incremental number starting from 1 ...
 * @property {Containers} nodes - all the nodes in this layer
 */
export class Layer {
  constructor () {
    this.rect = new Rectangle()
    this.nodes = new Containers()
    this.resetLayout()
  }

  /**
   * clear state
   */
  resetLayout () {
    this.index = -1
    this.nodes.resetLayout()
  }

  /**
   * @returns {number}
   */
  getMaxHeight () {
    return this.nodes.getMaxHeight()
  }

  /**
   * @returns {number}
   */
  getMaxRight () {
    return this.nodes.getMaxRight()
  }

  /**
   * @returns {number}
   */
  getAllNodesWith () {
    return this.nodes.getAllNodesWith()
  }

  setWidthBasedOnMaxNodeRight () {
    this.rect.w = this.getMaxRight()
  }

  sortNodesByEdgesScore () {
    this.nodes.sortByEdgesScore()
  }

  placeNodesVerticallyCenter () {
    this.nodes.forEach(node => {
      node.rect.centerVertical = this.rect.centerVertical
    })
  }

  /**
   * @param {string} verticalAlignment
   */
  placeNodesLeftToRight (verticalAlignment = Constants.ALIGN_CENTER) {
    let rollingX = this.rect.x

    // place the Containers inside the layer
    this.nodes.forEach(node => {
      // place the Container
      node.rect.x = rollingX
      node.rect.h = Math.max(node.rect.h, Constants.nodeMinSizeHeight)
      node.rect.centerVertical = this.rect.centerVertical
      node.rect.w = Math.max(node.rect.w, Constants.nodeMinSizeWidth)
      rollingX += node.rect.w

      if (verticalAlignment === Constants.ALIGN_CENTER) {
        node.rect.centerVertical = this.rect.centerVertical
      } else {
        node.rect.y = this.rect.top
      }
    })
  }

  /**
   * @param {string} verticalAlignment
   */
  placeNodesHorizontallyCenter (verticalAlignment = Constants.ALIGN_CENTER) {
    const widthNeedForNodes = this.getAllNodesWith()
    let rollingX = this.rect.x + ((this.rect.w - widthNeedForNodes) / 2)

    // place the Containers inside the layer
    this.nodes.forEach(node => {
      // place the Container
      node.rect.x = rollingX
      node.rect.w = Math.max(node.rect.w, Constants.nodeMinSizeWidth)
      node.rect.h = Math.max(node.rect.h, Constants.nodeMinSizeHeight)
      rollingX += node.rect.w

      if (verticalAlignment === Constants.ALIGN_CENTER) {
        node.rect.centerVertical = this.rect.centerVertical
      } else {
        node.rect.y = this.rect.top
      }
    })
  }

  /**
   * @param {string} verticalAlignment
   */
  placeNodesRightToLeft (verticalAlignment = Constants.ALIGN_CENTER) {
    let rollingX = this.rect.right

    // place the Containers inside the layer
    this.nodes.forEach(node => {
      // place the Container
      node.rect.w = Math.max(node.rect.w, Constants.nodeMinSizeWidth)
      node.rect.x = rollingX - node.rect.w
      node.rect.h = Math.max(node.rect.h, Constants.nodeMinSizeHeight)
      node.rect.centerVertical = this.rect.centerVertical
      rollingX -= node.rect.w

      if (verticalAlignment === Constants.ALIGN_CENTER) {
        node.rect.centerVertical = this.rect.centerVertical
      } else {
        node.rect.y = this.rect.top
      }
    })
  }

  /**
   * @returns {string}
   */
  toString () {
    return `Index ${this.index} ${this.rect.toString()} ${this.nodes.toString()}`
  }
}
