## GLAD - *Generate Layer Architecture Diagram*

Automatically generate **layer diagram** view of your Javascript/Typescript source code dependencies.

## Motivation

Self-contained, Lightweight, and Fast.

## Code style

100% ESLint clean
using ![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)

## Example

![example](https://github.com/amzn/glad/blob/main/glad.svg)

# Tech/Framework used

Supports JS/TS projects, simply launch the app and open the resulting glad.svg file.

Built with:

- [NodeJS](https://nodejs.org/)
- [Javascript](https://en.wikipedia.org/wiki/JavaScript)
- [TS-morph](https://ts-morph.com/)
- [JSON](https://en.wikipedia.org/wiki/JSON)
- [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics)

# Features

Customized the rendering views: Posters, Layers or Grid, with or without edges.

# Installation
```
npm install -g .
```

# Execute
```
glad
```

# Help
```
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

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
