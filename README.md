# GLAD - Generate Layer Architecture Diagram

Automatically generate **layer diagram** view of your Javascript/Typescript source code dependencies.

## Motivation

View and Keep your project source files layer dependencies clean. Avoid circular reference or referencing an upper layer from a lower layer.  

Supports source files of type JS & TS, simply launch the ```glad``` and open the resulting ```glad.svg``` file.

## Example

![example](glad.svg)

## Technologies used

[<img src="https://img.shields.io/badge/Node.js-43853D.svg?&logo=node.js&logoColor=white">](https://nodejs.org/)
[<img src="https://img.shields.io/badge/npm-CB3837.svg?&logo=npm&logoColor=white">](https://npmjs.org/)
[<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?&logo=javascript&logoColor=black">](https://en.wikipedia.org/wiki/JavaScript)
[<img src="https://img.shields.io/badge/Json-F7DF1E.svg?logo=json&logoColor=black">](https://en.wikipedia.org/wiki/JSON)
[<img src="https://img.shields.io/badge/TS--Morph-3178C6.svg?logo=TypeScript&logoColor=white">](https://ts-morph.com/)
[<img src="https://img.shields.io/badge/SVG-FFB13B.svg?logo=svg&logoColor=black">](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics)
[<img src="https://img.shields.io/badge/eslint-4B32C3.svg?logo=ESLint&logoColor=white">](https://eslint.org/)
[<img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide">](https://standardjs.com/)

## Features

- Optional grouping of layers by folders.
- Rendering views as Posters, Layers, or Grid.
- Render with or without edges (arrow lines).

## Installation

### Globally

```bash
npm install -g .
```

### DevDependencies

```bash
npm install -D @amazon/glad
```

### As  part of your build script step

This way while coding if you introduce a circular dependencies, the build abort.

```JSon
"build": "glad ."
```

## Execute

```bash
glad
```

## CLI Help

```text
glad -h

Usage: glad < path > [options]  "Generates an SVG layer diagram file based on your TS & JS source files dependencies"

Options:
  -h, --help              Show help  [boolean]
  -i, --input             File path to scan  [string]
  -o, --output            File path to output svg  [string] [default: "./glad.svg"]
  -e, --exclude           File glob to exclude from the analysis, eg: "**/*.test.js"  [string]
      --view              Type of diagram to generate  [string] [choices: "poster", "layers", "grid"] [default: "poster"]
      --align             Set the horizontal position of the nodes  [string] [choices: "left", "center", "right"] [default: "center"]
      --edges             Type of rendering for all edges  [string] [choices: "files", "folders"] [default: "files"]
      --lines             Type of rendering for all edges  [string] [choices: "curve", "strait", "elbow", "angle", "hide", "warnings"] [default: "curve"]
      --lineEffect, --le  Special effect on the lines  [string] [default: "flat"]
  -l, --layers            Display the layers background and numbers  [boolean] [default: false]
  -d, --details           Show additional values for each folders  [boolean] [default: false]
      --json              Output the graph to file called glad.json  [boolean] [default: false]
      --debug             For tech support  [boolean] [default: false]
      --listFiles         List all input files found  [boolean] [default: false]
  -s, --silent            No output except for errors  [boolean] [default: false]
  -v, --version           Show version number  [boolean]

Examples:
  glad . --view layers -l --edges -hide  ">>> Produce a diagram with no edges, each layers are numbered."
```

## License

This project is licensed under the Apache-2.0 License.

[<img src="https://img.shields.io/badge/Apache--2.0-gray.svg?logo=Apache">](https://www.apache.org/licenses/LICENSE-2.0)
