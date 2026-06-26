import * as TSMorph from 'ts-morph'

import { Container } from '../models/container.js'

import { BaseParser } from './parser.js'

/**
 * JavaScript/TypeScript parser for GLAD
 */
export class JsTsParser extends BaseParser {
  /**
   * Generate dependencies from JavaScript/TypeScript source files
   */
  generateDependenciesFromSourceFiles () {
    this.context.project = new TSMorph.Project({
      compilerOptions: {
        allowJs: true,
        target: TSMorph.ScriptTarget.ES2020
      }
    })

    const startingPath = this.normalizeStartingPath()

    this.context.consoleOutput.info(`Searching "${startingPath}" ...`)

    const sourceFileGlobs = [
      '!**/node_modules/**/*',
      '!**/bin/**/*',
      '!**/cdk.out/**/*',
      '!**/bin/**/*',
      '!**/build/**/*',
      '!**/*.d.js',
      '!**/*.d.ts',
      '!**/*.d.tsx',
      startingPath + '**/*.js',
      startingPath + '**/*.ts',
      startingPath + '**/*.tsx'
    ]

    if (this.context.options.exclude) {
      const excludePatterns = Array.isArray(this.context.options.exclude) ? this.context.options.exclude : [this.context.options.exclude]
      excludePatterns.forEach(pattern => {
        sourceFileGlobs.push('!' + pattern)
      })
    }

    this.context.project.addSourceFilesAtPaths(sourceFileGlobs)

    const files = this.context.project.getSourceFiles()
    this.processFiles(files, (file) => file.getFilePath())
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
        this.context.allFiles.add(pathToFile)
        this.context.allFiles.add(importFilePath)
        this.context.allFileImports.push({ source: pathToFile, target: importFilePath })
      }
    })
  }

  /**
   * Merge matching .ts and .js files
   */
  mergeMatchingTSAndJSFiles () {
    const fileSetToMerge = []
    this.context.allFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const tsVersion = file.replace('.js', '.ts')
        if (this.context.allFiles.has(tsVersion)) {
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
          this.context.graph.edges.forEach(edge => {
            if (edge.source === nodeToMerge) {
              edge.source = nodeToKeep
            }
            if (edge.target === nodeToMerge) {
              edge.target = nodeToKeep
            }
          })
          nodeToKeep.name += '/.js'
        }
        this.context.graph.rootNode.removeNodeDescendant(nodeToMerge)
      }
    })
  }

  /**
   * Common file processing logic for JS/TS files
   * @param {Array} files - Array of TSMorph.SourceFile objects
   * @param {(file: object) => string} getPathFunc - Function to get path from file object
   */
  processFiles (files, getPathFunc) {
    this.processFilesCommon(files, getPathFunc, (file) => this.getTargetFiles(file), true)
  }
}
