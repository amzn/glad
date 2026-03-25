# GLAD - Generate Layer Architecture Diagram

Automatically generate **layer diagram** view of your source code dependencies.

Supports **JavaScript**, **TypeScript**, **Dart** (Flutter), **Swift**, and **DOT** graph files.

## Motivation

View and Keep your project source files layer dependencies clean. Avoid circular reference or referencing an upper layer from a lower layer.

### Project types supported

* **NodeJS** - source files of type **JS & TS**
* **Flutter/Dart** - package dependencies
* **Swift** - iOS/macOS projects using Tree-Sitter parsing
* **DOT** - GraphViz DOT file input for custom diagrams

Simply launch the ```glad``` command and open the resulting ```glad.svg``` file.

## Example

![example](glad.svg)

## Technologies used

[![Node.js](https://img.shields.io/badge/Node.js-43853D.svg?&logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-CB3837.svg?&logo=npm&logoColor=white)](https://npmjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?&logo=javascript&logoColor=black)](https://en.wikipedia.org/wiki/JavaScript)
[![JSON](https://img.shields.io/badge/Json-F7DF1E.svg?logo=json&logoColor=black)](https://en.wikipedia.org/wiki/JSON)
[![TS-Morph](https://img.shields.io/badge/TS--Morph-3178C6.svg?logo=TypeScript&logoColor=white)](https://ts-morph.com/)
[![SVG](https://img.shields.io/badge/SVG-FFB13B.svg?logo=svg&logoColor=black)](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics)
[![ESLint](https://img.shields.io/badge/eslint-4B32C3.svg?logo=ESLint&logoColor=white)](https://eslint.org/)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com/)

## Features

* Optional grouping of layers by folders.
* Rendering views as Posters, Layers, or Grid.
* Render with or without edges connection lines.
* Orphan node detection - highlights files/folders with no dependencies.

## Installation

### Globally

```bash
npm install -g .
```

### DevDependencies

```bash
npm install -D @jpdup/glad
```

### As  part of your build script step

By adding "glad" to your build step, you will be alerted if you introduce a circular dependencies.

```JSon
{
  "scripts": {
    "build": "glad ."
}
}
```

### Exit Codes

`glad` returns explicit status codes so CI can fail on architecture issues:

* `0` success
* `2` invalid input (for example invalid or missing DOT file)
* `3` output write error
* `4` no files found to analyze
* `99` upward dependencies found
* `100` circular dependencies found

When both upward and circular dependencies are present, `100` is returned.

## Execute

```bash
glad
```

## CLI Help

```text
glad -h

Usage: glad < path | file.dot > [options]  "Generates an SVG layer diagram file based on your source code dependencies or DOT graph files"

Options:
  -h, --help              Show help  [boolean]
      --align             Set the horizontal position of the nodes  [string] [choices: "left", "center", "right"] [default: "center"]
      --debug             For tech support  [boolean] [default: false]
  -d, --details           Show additional values for each folders  [boolean] [default: false]
      --dev               Show Dev dependencies  [boolean] [default: false]
      --edges             Type of rendering for all edges  [string] [choices: "files", "folders"] [default: "files"]
  -e, --exclude           File glob patterns to exclude from the analysis, eg: "**/*.test.js" "**/AppLogger*"  [array]
      --externals, --ex   Show external dependencies  [boolean] [default: false]
  -i, --input             File path to scan  [string]
      --json              Output the graph to file called glad.json  [boolean] [default: false]
  -l, --layers            Display the layers background and numbers  [boolean] [default: false]
      --lineEffect, --le  Special effect on the lines  [string] [default: "flat"]
      --lines             Type of rendering for all edges  [string] [choices: "curve", "strait", "elbow", "angle", "hide", "warnings"] [default: "curve"]
      --listFiles         List all input files found  [boolean] [default: false]
      --orphans           List all orphan nodes (nodes with no edges)  [boolean] [default: false]
  -o, --output            File path to output svg  [string] [default: "./glad.svg"]
  -s, --silent            No output except for errors  [boolean] [default: false]
      --view              Type of diagram to generate  [string] [choices: "poster", "layers", "grid"] [default: "poster"]
  -v, --version           Show version number  [boolean]

Examples:
  glad . --view layers -l --edges -hide  ">>> Produce a diagram with no edges, each layers are numbered."
  glad myGraph.dot --view layers -l      ">>> Generate layers diagram from DOT graph file."

for more information visit https://github.com/amzn/generate-layer-architecture-diagram
```

## License

This project is licensed under the Apache-2.0 License.

[![Apache 2.0 License](https://img.shields.io/badge/Apache--2.0-gray.svg?logo=Apache)](https://www.apache.org/licenses/LICENSE-2.0)
