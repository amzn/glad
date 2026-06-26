import assert from 'assert'
import fs from 'fs'

import { describe, it } from 'mocha'

import { GLAD } from '../lib/glad.js'

describe('DOT File Support', function () {
  it('generates SVG from DOT file with exclude patterns', function () {
    const outputFilePath = './test/results/test_output_dot.svg'

    // Test the most complex use case: hierarchical DOT content with exclude patterns
    const dotContent = `
digraph G {
  "/lib/main.dart" [label="main"];
  "/lib/utils/helper.dart" [label="helper"];
  "/lib/home_screen.dart" [label="home"];
  "/lib/main.dart" -> "/lib/home_screen.dart";
  "/lib/main.dart" -> "/lib/utils/helper.dart";
}
`
    // Create GLAD instance with exclude pattern
    const gladWithExclude = new GLAD({
      exclude: ['**/test/**'],

      output: outputFilePath,
      silent: true
    })

    // Write test DOT file
    const dotFilePath = './test_temp.dot'
    fs.writeFileSync(dotFilePath, dotContent)

    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath)
    }

    try {
      // Set input to the temp file
      gladWithExclude.options.input = dotFilePath

      // Load the DOT graph and then process it the same way the CLI does.
      gladWithExclude.parseDot.graphSvgFromDotFile()
      const graphWasProcessed = gladWithExclude.context.processTheGraph()
      assert.strictEqual(graphWasProcessed, true, 'Graph should be processed successfully')

      // Check that SVG file was created
      assert(fs.existsSync(outputFilePath), 'SVG file should be generated')

      // Verify that hierarchical nodes were created correctly with exclude patterns
      const allNodes = gladWithExclude.graph.getAllNodes()
      const leafNodes = allNodes.filter(node => node.isLeaf)
      const leafNodeNames = leafNodes.map(node => node.name).sort()

      // Should only include non-test leaf files (container prefixes stripped from names)
      assert.deepStrictEqual(leafNodeNames, ['helper.dart', 'home_screen.dart', 'main.dart'])

      // Should have 2 edges (test_helper edges excluded)
      assert.strictEqual(gladWithExclude.graph.edges.length, 2)
      const edgeSources = []
      const edgeTargets = []
      gladWithExclude.graph.edges.forEach(edge => {
        edgeSources.push(edge.source.name)
        edgeTargets.push(edge.target.name)
      })
      edgeSources.sort()
      edgeTargets.sort()
      assert.deepStrictEqual(edgeSources, ['main.dart', 'main.dart'])
      assert.deepStrictEqual(edgeTargets, ['helper.dart', 'home_screen.dart'])
    } finally {
      // Clean up temp file
      if (fs.existsSync(dotFilePath)) {
        fs.unlinkSync(dotFilePath)
      }
    }
  })
})
