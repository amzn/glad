import path from 'path'

import { Constants } from './constants.js'
import { Rectangle } from './rectangle.js'

const leafNodes = new Map()

let nodeId = 0

// noinspection JSUnresolvedVariable,JSUnresolvedFunction
/**
 * @property {string} id - unique identification
 * @property {string} name - display name
 * @property {string} _text - private
 * @property {Container} parent - parent node holding this node
 * @property {boolean} isLeaf - container versus end node
 * @property {string} data - user data
 * @property {Array<Container>} sub - list of sub nodes
 * @property {Rectangle} rect - location of the node to render at
 * @property {Array<Container>} targetNodes - all nodes that this node targets
 * @property {Array<Container>} sourceNodes - all nodes that points to this node
 */
export class Container {
  /**
   * @param {string} text
   */
  set name (text) {
    this._text = text
  }

  /**
   * @returns {string}
   */
  get name () {
    return this._text
  }

  /**
   * @param {Container|null} parent
   * @param {string} name
   * @param {string} version
   */
  constructor (parent = null, name = '', version = null) {
    this.id = 'n' + (++nodeId)
    this.parent = parent
    this._text = name
    this.data = ''
    this.isLeaf = false
    this.excludeFromOrphanDetection = false
    this.version = version

    this.sub = []

    // All things Layout
    this.rect = new Rectangle(0, 0, Constants.nodeMinSizeWidth, Constants.nodeMinSizeHeight)

    // All things "Edge"
    this.targetNodes = [] // Containers that this node targets (aka calls)
    this.sourceNodes = [] // Containers that call this node
  }

  /**
   * return a list with unique node (remove duplicates)
   * @param {Array<Container>} listOfNodes
   * @returns {Array<Container>}
   */
  static getFlatterList (listOfNodes) {
    let flatListOfAllNodesTarget = listOfNodes
    listOfNodes.forEach(node => {
      flatListOfAllNodesTarget = flatListOfAllNodesTarget.concat(node.getFlatListOfNodes())
    })
    return [...new Set(flatListOfAllNodesTarget)] // only return unique items
  }

  /**
   * @param {string} userData
   * @returns {Container}
   */
  static getLeafNodeByUserData (userData) {
    return leafNodes.get(userData)
  }

  static getNodeListAsToolTip (nodes) {
    const sortedList = nodes.map(entry => entry.getPath()).sort()
    const externalNodes = sortedList.filter(entry => entry.startsWith('/External/'))
    const productNodes = sortedList.filter(entry => !externalNodes.includes(entry))
    const organizedList = productNodes.concat(externalNodes)
    return organizedList.map((entry, index) => (index + 1) + ' ' + entry).join('\n')
  }

  /**
   * give this /A/B/C.txt create this
   * / -> /A -> /A/B -> /A/B/C.txt
   * @param {Array<string>} arrayToTurnIntoTree
   * @param {string} userData
   */
  createContainerMappingBasedOnArray (arrayToTurnIntoTree, userData) {
    if (arrayToTurnIntoTree.length >= 1) {
      const sub = this.upsert(arrayToTurnIntoTree[0])
      const nextTokens = arrayToTurnIntoTree.slice(1)
      // if this is the last item in the array, then declare this a leaf node
      if (nextTokens.length === 0) {
        sub.setAsLeaf(userData)
      } else {
        sub.data = path.dirname(userData)
        sub.createContainerMappingBasedOnArray(nextTokens, userData)
      }
    }
  }

  /**
   * @param {Set<Container>}dataSet
   */
  cumulateNodeInDataSet (dataSet) {
    dataSet.add(this)

    this.sub.forEach(node => {
      node.cumulateNodeInDataSet(dataSet)
    })
  }

  /**
   * @returns {Array<Container>}
   */
  getAllTargetedContainers () {
    const list = []
    this.getExternalTargetedNodes().forEach(node => {
      if (node.parent) {
        list.push(node.parent)
      }
    })
    return list
  }

  /**
   * @param {string }text
   * @returns {Container}
   */
  getByText (text) {
    return this.sub.find(c => c.name === text)
  }

  /**
   * @returns {Array<Container>}
   */
  getExternalSourceNodes () {
    const allNodesInThisContainer = this.getFlatListOfNodes()
    return this.sourceNodes.filter(n => {
      return !allNodesInThisContainer.includes(n)
    })
  }

  /**
   * @returns {Array<Container>}
   */
  getExternalTargetedNodes () {
    const allNodesInThisContainer = this.getFlatListOfNodes()
    return this.targetNodes.filter(n => {
      return !allNodesInThisContainer.includes(n)
    })
  }

  /**
   * @returns {Container}
   */
  getFirstNonCommonRoot () {
    if (this.sub.length === 1) {
      return this.sub[0].getFirstNonCommonRoot()
    }

    return this
  }

  /**
   * get list of nodes (recursive)
   * @returns {Array<Container>}
   */
  getFlatListOfContainers () {
    let list = []
    this.sub.forEach(n => {
      if (!n.isLeaf) {
        list.push(this)
        list = list.concat(n.getFlatListOfContainers())
      }
    })
    return list
  }

  /**
   * get list of nodes (recursive)
   * @returns {Array<Container>}
   */
  getFlatListOfNodes () {
    if (this.isLeaf) {
      return [this]
    }
    let list = []
    this.sub.forEach(n => {
      list = list.concat(n.getFlatListOfNodes())
    })
    return list
  }

  /**
   * @returns {string}
   */
  getPath () {
    if (this.parent) {
      return this.parent.getPath() + '/' + this.name
    }
    return this.name
  }

  /**
   * @returns {number}
   */
  getWeight () {
    return this.targetNodes.length + this.sourceNodes.length
  }

  printTree (indent = 0) {
    console.info('  '.repeat(indent) + this.toString())
    this.sub.forEach(node => node.printTree(indent + 1))
  }

  /**
   * @param {Container} nodeToDelete
   */
  removeNodeDescendant (nodeToDelete) {
    this.sub = this.sub.filter(sub => sub !== nodeToDelete)
    this.sub.forEach(sub => {
      sub.removeNodeDescendant(nodeToDelete)
    })
  }

  /**
   * @param {Container} nodeCallers
   */
  rollupIsBeingCalledByThisNode (nodeCallers) {
    this.sourceNodes.push(nodeCallers)
    if (this.parent) {
      this.parent.rollupIsBeingCalledByThisNode(nodeCallers)
    }
  }

  /**
   * @param {Container} nodeTarget
   */
  rollupIsCallingThisNode (nodeTarget) {
    this.targetNodes.push(nodeTarget)
    if (this.parent) {
      this.parent.rollupIsCallingThisNode(nodeTarget)
    }
  }

  /**
   * @param {string} userData
   */
  setAsLeaf (userData) {
    // this is a leaf
    this.isLeaf = true
    this.data = userData
    leafNodes.set(userData, this)
  }

  /**
   * @returns {object}
   */
  toBasicJSON () {
    const object = {
      name: this.name
    }

    if (this.isLeaf) {
      object.userData = this.data
    }

    if (this.sub.length > 0) {
      const subNodesAsBasicJSON = []
      this.sub.forEach(sub => {
        subNodesAsBasicJSON.push(sub.toBasicJSON())
      })
      object.nodes = subNodesAsBasicJSON
    }
    return object
  }

  /**
   * @returns {string}
   */
  toString () {
    let text = `${this.parent ? this.parent.name : ''}.${this.name + this.versionToString()}, ${this.rect.toString()}`

    if (this.sub.length > 0) {
      text += ` contains(${this.sub.length})`
    }
    return text
  }

  /**
   * @param {string} text
   * @param {string|null} version
   * @returns {Container}
   */
  upsert (text, version = null) {
    let subContainer = this.getByText(text)
    if (!subContainer) {
      subContainer = new Container(this, text, version)
      this.sub.push(subContainer)
    }
    return subContainer
  }

  versionToString () {
    if (this.version) {
      return this.version
    }
    return ''
  }
}
