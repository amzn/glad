import { Constants } from './constants.js'
import { Rectangle } from './rectangle.js'
import path from 'path'

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
   * @param {Container|null} parent
   * @param {string} name
   */
  constructor (parent = null, name = '') {
    this.id = 'n' + (++nodeId)
    this.parent = parent
    this._text = name
    this.data = ''
    this.isLeaf = false

    this.sub = []

    // All things Layout
    this.rect = new Rectangle(0, 0, Constants.nodeMinSizeWidth, Constants.nodeMinSizeHeight)

    // All things "Edge"
    this.targetNodes = [] // Containers that this node targets (aka calls)
    this.sourceNodes = [] // Containers that call this node
  }

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

  static getNodeListAsToolTip (nodes) {
    return nodes.map((entry, index) => (index + 1) + ' ' + entry.getPath()).join('\n')
  }

  printTree (indent = 0) {
    console.info('  '.repeat(indent) + this.toString())
    this.sub.forEach(node => node.printTree(indent + 1))
  }

  /**
   * @param {string} text
   * @returns {Container}
   */
  upsert (text) {
    let subContainer = this.getByText(text)
    if (!subContainer) {
      subContainer = new Container(this, text)
      this.sub.push(subContainer)
    }
    return subContainer
  }

  /**
   * @param {string} userData
   * @returns {any}
   */
  static getLeafNodeByUserData (userData) {
    return leafNodes.get(userData)
  }

  /**
   * @param {string }text
   * @returns {Container}
   */
  getByText (text) {
    return this.sub.find(c => c.name === text)
  }

  /**
   * @returns {number}
   */
  getWeight () {
    return this.targetNodes.length + this.sourceNodes.length
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
   * @returns {string}
   */
  getPath () {
    if (this.parent) {
      return this.parent.getPath() + '/' + this.name
    }
    return this.name
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
   * @param {string} userData
   */
  setAsLeaf (userData) {
    // this is a leaf
    this.isLeaf = true
    this.data = userData
    leafNodes.set(userData, this)
  }

  /**
   * @returns {string}
   */
  toString () {
    let text = `${this.parent ? this.parent.name : ''}.${this.name}, ${this.rect.toString()}`

    if (this.sub.length > 0) {
      text += ` contains(${this.sub.length})`
    }
    return text
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
   * @param {Set<Container>}dataSet
   */
  cumulateNodeInDataSet (dataSet) {
    dataSet.add(this)

    this.sub.forEach(node => {
      node.cumulateNodeInDataSet(dataSet)
    })
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
   * @param {Container} nodeTarget
   */
  rollupIsCallingThisNode (nodeTarget) {
    this.targetNodes.push(nodeTarget)
    if (this.parent) {
      this.parent.rollupIsCallingThisNode(nodeTarget)
    }
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
   * @returns {Array<Container>}
   */
  getExternalTargetedNodes () {
    const allNodesInThisContainer = this.getFlatListOfNodes()
    return this.targetNodes.filter(n => {
      return !allNodesInThisContainer.includes(n)
    })
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
  getAllTargetedContainers () {
    const list = []
    this.getExternalTargetedNodes().forEach(node => {
      if (node.parent) {
        list.push(node.parent)
      }
    })
    return list
  }
}
