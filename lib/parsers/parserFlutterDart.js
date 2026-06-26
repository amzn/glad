import { exec } from 'node:child_process'

import { GLADContext } from '../gladContext.js'
import { consoleOutput } from '../util/console.js'
/**
 * Flutter/Dart parser for GLAD
 */
export class FlutterDartParser {
  /**
   * @param {GLADContext} context - The shared context
   */
  constructor (context) {
    this.context = context
  }

  /**
   * Convert all external to SDK
   * @param {string} containerName
   * @param {string} nodeName
   * @returns {string}
   */
  convertAllExternalToSDK (containerName, nodeName) {
    if (containerName === 'hosted') {
      containerName = 'sdk'
    }

    if (containerName === 'sdk') {
      nodeName = 'skd_components'
    }

    return nodeName
  }

  /**
   * Ensure containment and link these two nodes
   * @param {string} containerName
   * @param {string} sourceName
   * @param {string} version
   * @param {string} targetName
   */
  ensureContainmentAndLinkTheseTwo (containerName, sourceName, version, targetName) {
    // printAction('-------- ' + containerName + ' ' + sourceName + ' ' + targetName)

    this.upsertInContainer(containerName, sourceName, version)
    this.context.graph.upsertFileLinkByText(sourceName, targetName)
  }

  /**
   * Scan Dart dependencies and build graph and generate SVG
   * @returns {Promise<void>}
   */
  graphSvgFromFlutterDart () {
    return new Promise((resolve, reject) => {
      exec('dart pub deps --json', (err, output) => {
        if (err) {
          consoleOutput.error('could not execute command: ', err)
          reject(err)
          return
        }
        const blob = JSON.parse(output)
        this.loadGraphFromFlutterDependencies(blob)
        resolve()
      })
    })
  }

  /**
   * Parse Flutter dependencies JSON and build graph from it
   * @param {object} pubspecObject - The parsed pubspec JSON
   */
  loadGraphFromFlutterDependencies (pubspecObject) {
    // Add all the container nodes
    pubspecObject.packages.forEach(module => {
      const containerName = this.transFromFlutterContainerName(module)
      if (module.name !== 'flutter') {
        this.upsertInContainer(containerName, module.name, module.version)
      }
    })

    // Add all the edges
    pubspecObject.packages.forEach(module => {
      module.dependencies.forEach(depName => {
        const containerName = this.transFromFlutterContainerName(module)
        if (module.name !== 'flutter' && depName !== 'flutter') {
          this.ensureContainmentAndLinkTheseTwo(containerName, module.name, module.version, depName)
        }
      })
    })

    if (this.context.options.externals === false) {
      const container = this.context.graph.rootNode.getByText('transitive')
      if (container) {
        this.context.graph.dropContainerAndInternalNodesAndLinks(container)
      }
    }

    if (this.context.options.dev === false) {
      const container = this.context.graph.rootNode.getByText('dev')
      if (container) {
        this.context.graph.dropContainerAndInternalNodesAndLinks(container)
      }
    }
  }

  /**
   * Clean up the container name of Flutter apps
   * @param {object} module
   * @returns {string}
   */
  transFromFlutterContainerName (module) {
    let containerName = module.source
    if (module.kind === 'dev') {
      containerName = 'dev'
    } else
      if (module.source === 'git' || module.source === 'path') {
        containerName = 'direct'
      } else
        if (module.kind === 'transitive') {
          containerName = 'transitive'
        } else
          if (module.kind === 'direct' || module.source === 'sdk') {
            containerName = 'direct'
          }
    return containerName
  }

  /**
   * Upsert a node in a container
   * @param {string} containerName
   * @param {string} nodeName
   * @param {string} nodeVersion
   */
  upsertInContainer (containerName, nodeName, nodeVersion = null) {
    let containerFound = this.context.graph.rootNode.getByText(containerName)
    if (!containerFound) {
      containerFound = this.context.graph.rootNode.upsert(containerName)
    }

    if (containerFound) {
      containerFound.upsert(nodeName, nodeVersion).setAsLeaf(nodeName)
    }
  }
}
