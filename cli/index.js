#!/usr/bin/env node

import { createRequire } from 'module'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { GLAD } from '../lib/glad.js'
import { Constants } from '../lib/models/constants.js'
import { SwiftParser } from '../lib/parsers/parserSwift.js'
import { ConsoleOutput } from '../lib/util/console.js'

const require = createRequire(import.meta.url)
const fs = require('fs')

const packageJson = require('../package.json')

const EXIT_CODES = {
  CIRCULAR_DEPENDENCY: 100,
  GENERAL_ERROR: 1,
  INPUT_ERROR: 2,
  NO_FILES_FOUND: 4,
  OUTPUT_ERROR: 3,
  UPWARD_DEPENDENCY: 99
}

/**
 * Classify runtime failures to stable CLI exit codes.
 * @param {Error & {code?: string}} error
 * @returns {number}
 */
function classifyErrorCode (error) {
  const message = error && error.message ? error.message : ''

  if (message.startsWith('DOT file not found:') || message.startsWith('Invalid DOT format:')) {
    return EXIT_CODES.INPUT_ERROR
  }

  if (error && ['EACCES', 'EISDIR', 'ENOENT', 'ENOSPC', 'ENOTDIR', 'EPERM', 'EROFS'].includes(error.code)) {
    return EXIT_CODES.OUTPUT_ERROR
  }

  return EXIT_CODES.GENERAL_ERROR
}

/**
 * Main entry point
 */
async function main () {
  const arg = setupArguments()

  arg.useFullLayerWidth = false // Not yet ready for public use

  if (!arg.input) {
    arg.input = arg._[0]
  }

  // Create console output helper

  const glad = new GLAD(arg)

  // Set consoleOutput on context for cleaner access
  glad.context.consoleOutput = new ConsoleOutput({ debug: arg.debug, silent: arg.silent })

  try {
    if (arg.debug) {
      glad.context.consoleOutput.debug(arg)
    }

    // Title and Version
    glad.context.consoleOutput.title('GLAD ' + packageJson.version)

    // Start to measure the time spent running the app
    glad.context.consoleOutput.timeStart('Completed')

    //
    // Determine the input context
    //
    if (arg.input && arg.input.endsWith('.dot')) {
      // DOT file input
      glad.parseDot.graphSvgFromDotFile()
    } else if (fs.existsSync('./pubspec.yaml')) {
      //  Dart Project
      await glad.flutterDartParser.graphSvgFromFlutterDart()
    } else if (SwiftParser.isSwiftProject(arg.input)) {
      // Swift Project
      glad.swiftParser.generateDependenciesFromSwiftFiles()
    } else {
      // NodeJS project
      glad.jsTsParser.generateDependenciesFromSourceFiles()
    }

    const graphWasProcessed = glad.context.processTheGraph()
    if (!graphWasProcessed) {
      process.exitCode = EXIT_CODES.NO_FILES_FOUND
      return
    }

    const totalNodes = glad.graph.getAllNodes().length
    const totalEdges = glad.graph.edges.length
    const orphanNodes = glad.graph.getOrphanNodes()
    const orphanCount = orphanNodes.length
    const upDependencyCount = glad.graph.getUpDependenciesCount()
    const circularCount = glad.graph.getCircularDependenciesCount()

    // Handle --orphans flag
    if (arg.orphans) {
      if (orphanCount === 0) {
        glad.context.consoleOutput.log('No orphan nodes found.')
      } else {
        glad.context.consoleOutput.warning(`Found ${orphanCount} orphan node(s):`)
        orphanNodes.forEach(node => {
          glad.context.consoleOutput.log(`  - ${node.name}`)
        })
      }
    }

    glad.context.consoleOutput.log(`Nodes: ${totalNodes}, Edges: ${totalEdges}`)

    // Warning of orphan nodes
    if (orphanCount > 0) {
      glad.context.consoleOutput.warning(`Orphan nodes: ${orphanCount}`)
    }

    // Warning of upward nodes
    if (upDependencyCount > 0) {
      glad.context.consoleOutput.warning(`Upward dependencies: ${upDependencyCount}`)
    }

    // Error of circular edges
    if (circularCount > 0) {
      glad.context.consoleOutput.error(`Circular dependencies: ${circularCount}`)
    }

    glad.context.consoleOutput.timeEnd('Completed')

    if (circularCount > 0) {
      process.exitCode = EXIT_CODES.CIRCULAR_DEPENDENCY
      return
    }

    if (upDependencyCount > 0) {
      process.exitCode = EXIT_CODES.UPWARD_DEPENDENCY
    }
  } catch (error) {
    const exitCode = classifyErrorCode(error)
    glad.context.consoleOutput.error(error.message)
    if (arg.debug) {
      glad.context.consoleOutput.debug(error.stack)
    }
    process.exitCode = exitCode
  }
}

/**
 * Configures and parses command line arguments
 * @returns {object} Parsed arguments
 */
function setupArguments () {
  // noinspection JSUnresolvedFunction,JSUnresolvedVariable
  return yargs(hideBin(process.argv))
    .usage('Usage: glad < path | file.dot > [options]  "Generates an SVG layer diagram file based on your source code dependencies or DOT graph files"')
    .example('glad . --view layers -l --edges -hide', '">>> Produce a diagram with no edges, each layers are numbered."')
    .example('glad myGraph.dot --view layers -l', '">>> Generate layers diagram from DOT graph file."')
    .help('h')
    .alias('h', 'help')
    .option('align', {
      choices: [Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT],
      default: Constants.ALIGN_CENTER,
      description: 'Set the horizontal position of the nodes',
      type: 'string'
    })
    .option('debug', {
      default: false,
      description: 'For tech support',
      type: 'boolean'
    })
    .option('details', {
      alias: 'd',
      default: false,
      description: 'Show additional values for each folders',
      type: 'boolean'
    })
    .option('dev', {
      default: false,
      description: 'Show Dev dependencies',
      type: 'boolean'
    })
    .option(Constants.EDGES, {
      choices: ['files', 'folders'],
      default: 'files',
      description: 'Type of rendering for all edges',
      type: 'string'
    })
    .option('exclude', {
      alias: 'e',
      description: 'File glob patterns to exclude from the analysis, eg: "**/*.test.js" "**/AppLogger*"',
      type: 'array'
    })
    .option('externals', {
      alias: 'ex',
      default: false,
      description: 'Show external dependencies',
      type: 'boolean'
    })
    .option('input', {
      alias: 'i',
      description: 'File path to scan',
      type: 'string'
    })
    .option('json', {
      default: false,
      description: 'Output the graph to file called glad.json',
      type: 'boolean'
    })
    .option('layers', {
      alias: 'l',
      default: false,
      description: 'Display the layers background and numbers',
      type: 'boolean'
    })
    .option('lineEffect', {
      alias: 'le',
      choice: ['flat', 'outline', 'shadow'],
      default: 'flat',
      description: 'Special effect on the lines',
      type: 'string'
    })
    .option(Constants.LINES, {
      choices: [Constants.LINES_CURVE, Constants.LINES_STRAIT, Constants.LINES_ELBOW, Constants.LINES_ANGLE, Constants.LINES_HIDE, Constants.LINES_WARNINGS],
      default: Constants.LINES_CURVE,
      description: 'Type of rendering for all edges',
      type: 'string'
    })
    .option('listFiles', {
      default: false,
      description: 'List all input files found',
      type: 'boolean'
    })
    .option('orphans', {
      default: false,
      description: 'List all orphan nodes (nodes with no edges)',
      type: 'boolean'
    })
    .option('output', {
      alias: 'o',
      default: './glad.svg',
      description: 'File path to output svg',
      type: 'string'
    })
    .option('silent', {
      alias: 's',
      default: false,
      description: 'No output except for errors',
      type: 'boolean'
    })
    .option('view', {
      choices: ['poster', 'layers', 'grid'],
      default: 'poster',
      description: 'Type of diagram to generate',
      type: 'string'
    })
    // .version(true, 'Show version number', packageJson.version)
    .alias('v', 'version')
    .wrap(null)
    .epilog('for more information visit https://github.com/amzn/generate-layer-architecture-diagram')
    .argv
}

main()
