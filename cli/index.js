#!/usr/bin/env node

import chalk from 'chalk'
import { Constants } from '../lib/models/constants.js'
import { GLAD } from '../lib/glad.js'
// Define "require"
import { createRequire } from 'module'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const require = createRequire(import.meta.url)

const packageJSon = require('../package.json')

// eslint-disable-next-line no-unused-expressions
// noinspection JSUnresolvedFunction,JSUnresolvedVariable
const arg = yargs(hideBin(process.argv))
    .usage('Usage: glad < path > [options]  "Generates an SVG layer diagram file based on your TS & JS source files dependencies"')
    .example('glad . --view layers -l --edges -hide', '">>> Produce a diagram with no edges, each layers are numbered."')
    .help('h')
    .alias('h', 'help')
    .option('input', {
        alias: 'i',
        description: 'File path to scan',
        type: 'string'
    })
    .option('output', {
        alias: 'o',
        description: 'File path to output svg',
        type: 'string',
        default: './glad.svg'
    })
    .option('exclude', {
        alias: 'e',
        description: 'File glob to exclude from the analysis, eg: "**/*.test.js"',
        type: 'string'
    })
    .option('view', {
        description: 'Type of diagram to generate',
        type: 'string',
        choices: ['poster', 'layers', 'grid'],
        default: 'poster'
    })
    .option('align', {
        description: 'Set the horizontal position of the nodes',
        type: 'string',
        choices: [Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT],
        default: Constants.ALIGN_CENTER
    })
    .option(Constants.EDGES, {
        description: 'Type of rendering for all edges',
        type: 'string',
        choices: ['files', 'folders'],
        default: 'files'
    })
    .option(Constants.LINES, {
        description: 'Type of rendering for all edges',
        type: 'string',
        choices: [Constants.LINES_CURVE, Constants.LINES_STRAIT, Constants.LINES_ELBOW, Constants.LINES_ANGLE, Constants.LINES_HIDE, Constants.LINES_WARNINGS],
        default: Constants.LINES_CURVE
    })
    .option('lineEffect', {
        alias: 'le',
        description: 'Special effect on the lines',
        type: 'string',
        choice: ['flat', 'outline', 'shadow'],
        default: 'flat'
    })
    .option('layers', {
        alias: 'l',
        description: 'Display the layers background and numbers',
        type: 'boolean',
        default: false
    })
    .option('details', {
        alias: 'd',
        description: 'Show additional values for each folders',
        type: 'boolean',
        default: false
    })
    .option('json', {
        description: 'Output the graph to file called glad.json',
        type: 'boolean',
        default: false
    })
    .option('debug', {
        description: 'For tech support',
        type: 'boolean',
        default: false
    })
    .option('listFiles', {
        description: 'List all input files found',
        type: 'boolean',
        default: false
    })
    .option('silent', {
        alias: 's',
        description: 'No output except for errors',
        type: 'boolean',
        default: false
    })
    // .version(true, 'Show version number', packageJSon.version)
    .alias('v', 'version')
    .wrap(null)
    .epilog('for more information visit https://github.com/amzn/generate-layer-architecture-diagram')
    .argv

arg.useFullLayerWidth = false // Not yet ready for public use

if (!arg.input) {
    arg.input = arg._[0]
}

if (arg.debug) {
    console.log(arg)
}

if (!arg.silent) {
    showTitle()
}

const glad = new GLAD(arg)
glad.scanSourceFilesBuildGraphAndGenerateSvg()

if (glad.graph.getHasCircularDependencies()) {
    console.error(chalk.red('found some circular dependencies'))
    // noinspection JSUnresolvedVariable
    process.exit(100)
}

/**
 * Display the title of the application
 */
function showTitle () {
    console.info(chalk.blueBright('GLAD') + '   ' + chalk.blue(packageJSon.version || ''))
}
