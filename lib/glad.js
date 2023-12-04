import fs from 'fs'
import chalk from 'chalk'
import * as TSMorph from 'ts-morph'
import { Graph } from './models/graph.js'
import { Container } from './models/container.js'
import { Constants } from './models/constants.js'
import { RenderAsPoster } from './render/renderAsPoster.js'
import { RenderAsGrid } from './render/renderAsGrid.js'
import { RenderAsLayers } from './render/renderAsLayers.js'
import { ensureEndsWith, ensureNotEndingWith, stringIsEmpty } from './util/strings.js'

/**
 * @typedef Options
 * @property {boolean} listFiles - output the list of files used as input
 */

/**
 * @property {Options} options - Input arguments for controlling how to process and generate the graph
 * @property {Set<object>} allFiles - the files that we used for generating the graph
 * @property {Array<object>} allFileImports - all import files found in the sources
 * @property {Graph} graph = the single graph for holding all dependencies
 */
export class GLAD {
  /**
   * @param {object} options
   */
  constructor (options) {
    this.options = options
    this.graph = new Graph()
    this.allFiles = new Set()
    this.allFileImports = []
  }

  /**
   * The main files to import starts here
   */
  scanSourceFilesBuildGraphAndGenerateSvg () {
    this.generateDependenciesFromSourceFiles()
    this.processTheGraph()
  }

  processTheGraph () {
    if (this.graph.rootNode.sub.length === 0) {
      console.error('No files found')
      return
    }

    this.graph.prepareEdges()

    if (this.options.debug) {
      console.info('--------- Container Tree --------')
      this.graph.rootNode.printTree()

      console.info('----------- Edges ----------')
      this.graph.edges.print()
    }

    // Generate the Graph
    if (this.options.json) {
      this.generateJSON()
    }

    // Generate the SVG
    this.generateSVG()
  }

  /**
   * THe logic for creating the graph starts here
   */
  generateDependenciesFromSourceFiles () {
    this.project = new TSMorph.Project({
      compilerOptions: {
        target: TSMorph.ScriptTarget.ES2020,
        allowJs: true
      }
    })

    let startingPath = this.options.input
    if (startingPath && startingPath !== '.') {
      startingPath = ensureNotEndingWith(startingPath, '.')
    } else {
      startingPath = './'
    }
    startingPath = ensureEndsWith(startingPath, '/')

    if (!this.options.silent) {
      console.info(`Searching "${startingPath}" ...`)
    }

    const sourceFileGlobs = [
      '!**/node_modules/**/*',
      '!**/bin/**/*',
      '!**/cdk.out/**/*',
      '!**/bin/**/*',
      '!**/build/**/*',
      '!**/*.d.js',
      '!**/*.d.ts',
      startingPath + '**/*.js',
      startingPath + '**/*.ts'
    ]

    if (this.options.exclude) {
      sourceFileGlobs.push('!' + this.options.exclude)
    }

    this.project.addSourceFilesAtPaths(sourceFileGlobs)

    const files = this.project.getSourceFiles()

    if (files.length === 0) {
      return
    }

    if (!this.options.silent) {
      console.info(`Analyzing ${files.length} files ...`)
    }

    if (this.options.listFiles) {
      files.forEach((file) => {
        console.log('\t' + file.getFilePath())
      })
    }

    // Files to Container model instances
    files.forEach(sourceFile => {
      // update the current value in your application..
      this.getTargetFiles(sourceFile)
    })

    // Create containers (folder) tree from each file paths
    this.allFiles.forEach(pathToFile => {
      this.processFileAsContainer(pathToFile)
    })

    // Create edges between files
    this.allFileImports.forEach(edge => {
      this.processFilesAsEdges(edge.source, edge.target)
    })

    // Merge matching .ts & .js
    {
      const fileSetToMerge = []
      this.allFiles.forEach(file => {
        if (file.endsWith('.js')) {
          const tsVersion = file.replace('.js', '.ts')
          if (this.allFiles.has(tsVersion)) {
            fileSetToMerge.push({ js: file, ts: tsVersion })
          }
        }
      })

      fileSetToMerge.forEach(filesToMerge => {
        const nodeToKeep = Container.getLeafNodeByUserData(filesToMerge.ts)
        if (nodeToKeep) {
          const nodeToMerge = Container.getLeafNodeByUserData(filesToMerge.js)
          if (nodeToMerge) {
            nodeToKeep.targetNodes.concat(nodeToMerge.targetNodes)
            nodeToKeep.sourceNodes.concat(nodeToMerge.sourceNodes)

            // redirect all edges to the merged node
            this.graph.edges.forEach(edge => {
              if (edge.source === nodeToMerge) {
                edge.source = nodeToKeep
              }
              if (edge.target === nodeToMerge) {
                edge.target = nodeToKeep
              }
            })
            nodeToKeep.name += '/.js'
          }
          this.graph.rootNode.removeNodeDescendant(nodeToMerge)
        }
      })
    }
  }

  /**
   * @param {TSMorph.SourceFile} sourceFile
   */
  getTargetFiles (sourceFile) {
    const pathToFile = sourceFile.getFilePath()
    const importingFiles = sourceFile.getReferencedSourceFiles()
    importingFiles.forEach(importFile => {
      const importFilePath = importFile.getFilePath()
      if (importFilePath.indexOf('node_modules') > -1) {
        // skip any reference to node_modules
      } else {
        this.allFiles.add(pathToFile)
        this.allFiles.add(importFilePath)
        this.allFileImports.push({ source: pathToFile, target: importFilePath })
      }
    })
  }

  /**
   * Create the "Folder to Folder" to "File Container" mapping
   * @param {string} pathToFile
   */
  processFileAsContainer (pathToFile) {
    const listOfContainer = pathToFile.split('/').filter(token => !stringIsEmpty(token))
    this.graph.rootNode.createContainerMappingBasedOnArray(listOfContainer, pathToFile)
  }

  /**
   * @param {string} pathToFile
   * @param {string} importFilePath
   */
  processFilesAsEdges (pathToFile, importFilePath) {
    this.graph.upsertFileLinkByText(pathToFile, importFilePath)
  }

  /**
   * Create a JSON file based on the graph
   */
  generateJSON () {
    if (!this.options.silent) {
      printAction('./poster.json')
    }
    const graphAsText = this.graph.serialize()
    fs.writeFileSync('poster.json', graphAsText, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  }

  /**
   * Create an SVG file from the Renderer
   */
  generateSVG () {
    if (!this.options.silent) {
      printAction(this.options.output)
    }

    const renderAs = this.getRendererBasedOnUserChoice()

    const svgSource = renderAs.getSVG(this.graph, this.options)

    fs.writeFileSync(this.options.output, svgSource, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  }

  /**
   * What diagrams to render?
   * @returns {RenderAsGrid|RenderAsLayers|RenderAsPoster}
   */
  getRendererBasedOnUserChoice () {
    switch (this.options.view) {
      case Constants.VIEW_GRID:
        return new RenderAsGrid()

      case Constants.VIEW_LAYERS:
        return new RenderAsLayers()

      case Constants.VIEW_POSTER:
      default:
        return new RenderAsPoster()
    }
  }

  loadGraphFromJSON (jsonFile) {
    // Read the input dependency structure
    const blob = JSON.parse(jsonFile)

    // Add all the container nodes
    blob.packages.forEach(module => {
      this.upsertInContainer(module.source, module.name, module.version)
    })

    // Add all the edges
    blob.packages.forEach(module => {
      module.dependencies.forEach(depName => {
        this.ensureContainmentAndLinkTheseTwo(module.source, module.name, module.version, depName)
      })
    })

    if (this.options.externals === false) {
      this.graph.dropContainerAndInternalNodesAndLinks(this.graph.rootNode.getByText('External'))
    }

    // this.graph.edges.forEach(edge => {
    //   printAction(edge.target.toString())
    // })

    this.processTheGraph()
  }

  ensureContainmentAndLinkTheseTwo (containerName, sourceName, version, targetName) {
    // printAction('-------- ' + containerName + ' ' + sourceName + ' ' + targetName)

    this.upsertInContainer(containerName, sourceName, version)
    this.graph.upsertFileLinkByText(sourceName, targetName)
  }

  convertAllExternalToSDK (containerName, nodeName) {
    if (containerName === 'hosted') {
      containerName = 'sdk'
    }

    if (containerName === 'sdk') {
      nodeName = 'skd_components'
    }

    return nodeName
  }

  upsertInContainer (containerName, nodeName, nodeVersion = null) {
    if (containerName === 'root' || containerName === '') {
      containerName = 'path'
    }

    if (containerName === 'sdk' || containerName === 'hosted') {
      containerName = 'External'
    }

    let containerFound = this.graph.rootNode.getByText(containerName)
    if (!containerFound) {
      containerFound = this.graph.rootNode.upsert(containerName)
    }

    if (containerFound) {
      containerFound.upsert(nodeName, nodeVersion).setAsLeaf(nodeName)
    }
  }
}

/**
 * @param {string} text
 */
function printAction (text) {
  console.info(chalk.yellowBright(text))
}
