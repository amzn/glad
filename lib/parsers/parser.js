import { stringIsEmpty } from '../util/strings.js'

/**
 * Base parser class with common functionality
 */
export class BaseParser {
  /**
   * @param {object} context - The shared context
   */
  constructor (context) {
    this.context = context
  }

  /**
   * Normalize the starting path from options.input
   * @returns {string}
   */
  normalizeStartingPath () {
    let startingPath = this.context.options.input
    if (startingPath && startingPath !== '.') {
      startingPath = startingPath.replace(/\/$/, '') // Remove trailing slash if present
    } else {
      startingPath = './'
    }
    return startingPath.endsWith('/') ? startingPath : startingPath + '/'
  }

  /**
   * Create the "Folder to Folder" to "File Container" mapping
   * @param {string} pathToFile
   */
  processFileAsContainer (pathToFile) {
    const listOfContainer = pathToFile.split('/').filter(token => !stringIsEmpty(token))
    this.context.graph.rootNode.createContainerMappingBasedOnArray(listOfContainer, pathToFile)
  }

  /**
   * @param {string} pathToFile
   * @param {string} importFilePath
   */
  processFilesAsEdges (pathToFile, importFilePath) {
    this.context.graph.upsertFileLinkByText(pathToFile, importFilePath)
  }

  /**
   * Common file processing logic shared across parsers
   * @param {Array} files - Array of file objects
   * @param {(file: object) => string} getPathFunc - Function to get path from file object
   * @param {(file: object) => void} processFileFunc - Function to process each file for dependencies
   * @param {boolean} shouldMergeTSAndJS - Whether to merge matching .ts and .js files (default: false)
   */
  processFilesCommon (files, getPathFunc, processFileFunc, shouldMergeTSAndJS = false) {
    if (files.length === 0) {
      return
    }

    this.context.consoleOutput.info(`Analyzing ${files.length} files ...`)

    if (this.context.options.listFiles) {
      files.forEach((file) => {
        this.context.consoleOutput.log('\t' + getPathFunc(file))
      })
    }

    // Files to Container model instances
    files.forEach(file => {
      processFileFunc(file)
    })

    // Create containers (folder) tree from each file paths
    this.context.allFiles.forEach(pathToFile => {
      this.processFileAsContainer(pathToFile)
    })

    // Create edges between files
    this.context.allFileImports.forEach(edge => {
      this.processFilesAsEdges(edge.source, edge.target)
    })

    // Merge matching .ts & .js files if requested
    if (shouldMergeTSAndJS && this.mergeMatchingTSAndJSFiles) {
      this.mergeMatchingTSAndJSFiles()
    }
  }
}
