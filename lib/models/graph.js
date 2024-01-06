import { Container } from './container.js'
import { Edge } from './edge.js'
import { Edges } from './edges.js'
import { stringIsEmpty } from '../util/strings.js'

/**
 * @property {Container} rootNode - main starting node
 * @property {Edges} edges = the starting edges in this graph
 */
export class Graph {
  /**
   * New empty graph
   */
  constructor () {
    this.rootNode = new Container()
    this.edges = new Edges()
  }

  /**
   * @returns {Array<Container>}
   */
  getAllNodes () {
    const dataSet = new Set()
    this.rootNode.cumulateNodeInDataSet(dataSet)
    return Array.from(dataSet)
  }

  /**
   * @returns {Array<Container>}
   */
  getAllNodesInEdges () {
    const dataSet = new Set()
    this.edges.forEach(edge => {
      dataSet.add(edge.source)
      dataSet.add(edge.target)
    })
    return Array.from(dataSet)
  }

  /**
   * @returns {Container|null}
   */
  getFirstNonCommonRoot () {
    return this.rootNode.getFirstNonCommonRoot()
  }

  /**
   * @param {Container} nodeSource
   * @param {Container} nodeTarget
   * @returns {Edge}
   */
  upsertEdge (nodeSource, nodeTarget) {
    nodeSource.rollupIsCallingThisNode(nodeTarget)
    nodeTarget.rollupIsBeingCalledByThisNode(nodeSource)

    return this.edges.upsertEdge(nodeSource, nodeTarget)
  }

  /**
   * @param {Container} containerNode
   */
  dropContainerAndInternalNodesAndLinks (containerNode) {
    const nodes = containerNode.getFlatListOfNodes()
    // first drop any edge to these nodes
    nodes.forEach(node => {
      this.edges.dropEdgeWithThisTarget(node)
      this.edges.dropEdgeWithThisSource(node)
    })
    this.rootNode.removeNodeDescendant(containerNode)
  }

  /**
   * @param {string} textA
   * @param {string} textB
   * @returns { Edge }
   */
  upsertFileLinkByText (textA, textB) {
    let fileSource = Container.getLeafNodeByUserData(textA)
    if (!fileSource) {
      fileSource = new Container(null, textA)
      fileSource.setAsLeaf(textA)
    }

    let fileTarget = Container.getLeafNodeByUserData(textB)
    if (!fileTarget) {
      fileTarget = new Container(null, textB)
      fileTarget.setAsLeaf(textB)
    }
    return this.upsertEdge(fileSource, fileTarget)
  }

  /**
   * return true if both node are connected to each other
   * @param {Container} nodeA
   * @param {Container} nodeB
   * @returns {boolean}
   */
  isCircular (nodeA, nodeB) {
    if (nodeA === nodeB) {
      return false
    }

    const edge1 = this.edges.getEdge(nodeA, nodeB)
    const edge2 = this.edges.getEdge(nodeB, nodeA)

    return !!(edge1 && edge2)
  }

  /**
   * Sort and detect problems
   */
  prepareEdges () {
    this.edges.sortByName()
    this.edges.forEach(edge => {
      edge.isCircular = this.isCircular(edge.source, edge.target)
    })
  }

  /**
   * @returns {boolean}
   */
  getHasCircularDependencies () {
    return this.edges.some(edge => edge.isCircular)
  }

  /**
   * used for sorting, compare the number of calls from ListOfNodesA against the ListOfNodesB
   * @param {Array<Container>} ListOfNodesA
   * @param {Array<Container>} ListOfNodesB
   * @returns {{in: number, weight: number, out: number}}
   */
  getOutIn (ListOfNodesA, ListOfNodesB) {
    ListOfNodesA = Container.getFlatterList(ListOfNodesA)
    ListOfNodesB = Container.getFlatterList(ListOfNodesB)

    let totalPointerAtoB = 0
    ListOfNodesA.forEach(node => {
      totalPointerAtoB += this.edges.getTotalMatchingTargetForThisSource(node, ListOfNodesB)
    })

    let totalPointerBtoA = 0
    ListOfNodesB.forEach(node => {
      totalPointerBtoA += this.edges.getTotalMatchingTargetForThisSource(node, ListOfNodesA)
    })
    let weight
    if (totalPointerBtoA === 0 && totalPointerAtoB > 0) {
      weight = 1000000 + totalPointerBtoA
    } else {
      weight = (totalPointerAtoB * 100000) + (totalPointerBtoA * -1000)
    }
    return { out: totalPointerAtoB, in: totalPointerBtoA, weight }
  }

  /**
   * @returns {string}
   */
  serialize () {
    // ------------------------------------------
    // get all the unique nodes
    let allNodes = new Set()
    this.getAllNodes().forEach(n => {
      if (!stringIsEmpty(n.data)) {
        allNodes.add(n.data)
      }
    })
    allNodes = [...allNodes].sort()

    // ------------------------------------------
    // get all the edges
    let allEdges = []
    this.edges.forEach(edge => {
      const edgeDetail = { source: edge.source.data, target: edge.target.data }
      allEdges.push(edgeDetail)
    })

    // sort source + target
    allEdges = allEdges.sort((a, b) => {
      const result = a.source.localeCompare(b.source)
      if (result === 0) {
        return a.target.localeCompare(b.target)
      }
      return result
    })

    // ------------------------------------------
    // return the object
    const object = {
      nodes: allNodes,
      edges: allEdges
    }
    return JSON.stringify(object)
  }
}
