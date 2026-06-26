import fs from 'fs'

import { GLADContext } from '../gladContext.js'
import { Container } from '../models/container.js'
import { matchesExcludePattern } from '../util/strings.js'

/**
 * DOT file parser for GLAD
 */
export class DotParser {
  /**
   * @param {GLADContext} context - The shared context
   */
  constructor (context) {
    this.context = context
  }

  /**
   * Process DOT files for graph generation
   */
  graphSvgFromDotFile () {
    const dotFilePath = this.context.options.input

    if (!fs.existsSync(dotFilePath)) {
      throw new Error(`DOT file not found: ${dotFilePath}`)
    }

    this.context.consoleOutput.info(`Reading DOT file: ${dotFilePath}`)

    const dotContent = fs.readFileSync(dotFilePath, 'utf8')
    this.loadGraphFromDot(dotContent)
  }

  /**
   * Parse DOT format content and build graph from it
   * @param {string} dotContent - The DOT format string
   */
  loadGraphFromDot (dotContent) {
    const parsed = this.parseDotContent(dotContent)

    // Strip leading "/" from node names and edges if all start with "/"
    if (parsed.nodes.length > 0 && parsed.nodes.every(node => node.startsWith('/'))) {
      parsed.nodes = parsed.nodes.map(node => node.substring(1))
      parsed.edges = parsed.edges.map(edge => ({
        source: edge.source.substring(1),
        target: edge.target.substring(1)
      }))
    }

    // Apply exclude patterns to filter nodes
    let filteredNodes = parsed.nodes
    if (this.context.options.exclude) {
      filteredNodes = parsed.nodes.filter(nodeName => {
        const shouldExclude = matchesExcludePattern(nodeName, this.context.options.exclude)
        if (shouldExclude) {
          this.context.consoleOutput.info(`Excluding node: ${nodeName}`)
        }
        return !shouldExclude
      })
    }

    // Create nodes (only those not excluded)
    filteredNodes.forEach(nodeName => {
      // Split node name by / or \ to create container hierarchy
      const parts = nodeName.split(/[/\\]/).filter(part => part.length > 0)
      if (parts.length > 1) {
        // Create container hierarchy for DOT files
        let current = this.context.graph.rootNode
        for (let i = 0; i < parts.length - 1; i++) {
          current = current.upsert(parts[i])
        }
        // Create the leaf with the file name as name, but full path as userData
        current.upsert(parts[parts.length - 1]).setAsLeaf(nodeName)
      } else {
        // Single part, create as leaf
        this.context.graph.rootNode.upsert(nodeName).setAsLeaf(nodeName)
      }
    })

    // Create edges (only between nodes that weren't excluded)
    const filteredNodeSet = new Set(filteredNodes)
    parsed.edges.forEach(edge => {
      // Only create edge if both source and target nodes are not excluded
      if (filteredNodeSet.has(edge.source) && filteredNodeSet.has(edge.target)) {
        this.context.graph.upsertFileLinkByText(edge.source, edge.target)
      }
    })

    // Strip container prefixes from leaf node display names
    filteredNodes.forEach(nodeName => {
      const leaf = Container.getLeafNodeByUserData(nodeName)
      if (leaf) {
        leaf.name = nodeName.split('/').pop()
      }
    })
  }

  /**
   * Parse DOT format string into nodes and edges
   * @param {string} content - DOT format string
   * @returns {object} Object with nodes array and edges array
   */
  parseDotContent (content) {
    const nodes = new Set()
    const edges = []

    // Remove comments (lines starting with # or //, and /* */ blocks)
    let cleanedContent = content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')
      })
      .join('\n')

    // Remove /* */ comments
    cleanedContent = cleanedContent.replace(/\/\*[\s\S]*?\*\//g, '')

    // More robust regex-based DOT parser
    // Match digraph declarations and graph content
    const digraphMatch = cleanedContent.match(/digraph\s+["\w]+\s*\{([\s\S]*)\}/)
    if (!digraphMatch) {
      throw new Error('Invalid DOT format: no digraph found')
    }

    const graphContent = digraphMatch[1]

    // Remove subgraph blocks (we'll handle them later if needed)
    const processedContent = graphContent.replace(/subgraph\s+[^}]*\{[^}]*\}/g, '')

    // Match nodes with optional attributes: "node_name" [label="..."];
    const nodeRegex = /"([^"]+)"\s*\[([^\]]*)\]\s*;/g
    let match
    while ((match = nodeRegex.exec(processedContent)) !== null) {
      const nodeName = match[1]
      nodes.add(nodeName)
    }

    // Also match simple nodes without attributes: "node_name"; or node_name;
    const simpleNodeRegex = /"([^"]+)"\s*;|\b(\w+)\s*;/g
    while ((match = simpleNodeRegex.exec(processedContent)) !== null) {
      const nodeName = match[1] || match[2] // Either quoted or unquoted
      nodes.add(nodeName)
    }

    // Match edges with optional attributes: "source" -> "target" [style=dashed];
    const edgeRegex = /"([^"]+)"\s*->\s*"([^"]+)"(?:\s*\[([^\]]*)\])?\s*;/g
    while ((match = edgeRegex.exec(processedContent)) !== null) {
      const source = match[1]
      const target = match[2]
      edges.push({ source, target })
    }

    // Fallback: match simpler edge format if quoted version fails
    if (edges.length === 0) {
      const simpleEdgeRegex = /(\w+)\s*->\s*(\w+)\s*(?:\[[^\]]*\])?\s*;/g
      while ((match = simpleEdgeRegex.exec(processedContent)) !== null) {
        const source = match[1]
        const target = match[2]
        nodes.add(source)
        nodes.add(target)
        edges.push({ source, target })
      }
    }

    return {
      edges,
      nodes: Array.from(nodes)
    }
  }
}
