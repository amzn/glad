import { Constants } from './constants.js'
import { Container } from './container.js'

/**
 * @augments {Array<object>}
 */
export class Containers extends Array {
  /**
   * @returns {number}
   */
  getAllNodesWith () {
    let total = 0
    this.forEach(node => {
      total += Math.max(Constants.nodeMinSizeWidth, node.rect.w)
    })
    return total
  }

  /**
   * @returns {number}
   */
  getMaxHeight () {
    let max = 0
    this.forEach(node => {
      max = Math.max(max, node.rect.h)
    })
    return max
  }

  /**
   * @returns {number}
   */
  getMaxRight () {
    let max = 0
    this.forEach(node => {
      max = Math.max(max, node.rect.right)
    })
    return max
  }

  /**
   * @param {Container} node
   * @returns {Containers}
   */
  removeNode (node) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === node) {
        this.splice(i, 1)
        break
      }
    }
    return this
  }

  resetLayout () {
    this.forEach(node => {
      node.resetLayout()
    })
  }

  /**
   * sort
   */
  sortByEdgesScore () {
    this.sort((a, b) => {
      const score = b.getWeight() - a.getWeight()
      if (score === 0) {
        return a.name.localeCompare(b.name)
      }
      return score
    })
  }

  /**
   * @returns {string}
   */
  toString () {
    let nodesAsText = ''
    this.forEach(n => { nodesAsText += n.name + ' ' })
    return nodesAsText
  }
}
