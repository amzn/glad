# Changelog

All notable changes to this project will be documented in this file.

## [1.4.3]  2026-04-08

    - Skip .swiftpm and DerivedData directories when scanning Swift projects to prevent hangs on large SPM workspaces

## [1.4.2]  2026-03-25

    - Stabilize CLI exit codes for CI integrations with explicit status mapping
    - Add `99` exit code for upward dependencies and keep `100` for circular dependencies (highest priority)
    - Return non-zero when no files are found to analyze
    - Improve error classification for invalid input and output write failures
    - Ensure Swift extension-only files are not incorrectly reported as orphan nodes
    - Add CLI exit-code test coverage
    - Document exit-code contract in README

## [1.4.1]  2026-01-07

    - Fix upward dependency count discrepancy: Count now accurately reflects rendered upward dependencies across all view modes and line filtering options
    - Upward dependency detection now based on actual rendering positions rather than layout simulation, ensuring consistency between reported counts and visual output

## [1.4.0]  2025-12-31

    - Major performance optimization for large graphs: 17.5x faster processing of complex dependency graphs
    - Implemented dynamic retry limits in layering algorithm based on graph size (max 99, min 10, scaled by node count / 10)
    - Added early convergence detection with stable iteration tracking (stops after 3 identical layer arrangements)
    - Introduced edge counting caching system with Map-based cache for expensive getOutIn() calculations
    - Cache invalidation on graph changes with efficient string-based keys using sorted node IDs
    - Optimized layering functions to use cached edge counting operations
    - Reduced computational complexity from potentially millions of edge traversals to cached lookups
    - Performance improvement: Large graphs (323 nodes, 1224 edges) now process in ~8 seconds instead of 2+ minutes

## [1.3.9]  2025-12-28

    - Update repository URLs to point to correct GitHub repository (jpdup/glad)

## [1.3.8]  2025-12-28

    - Centralized console output system with ConsoleOutput class for consistent output control
    - Improved SVG generation performance by replacing string concatenation with array-based building
    - Added comprehensive silent mode (--silent flag) support that suppresses all informational output
    - Refactored all console usage throughout the codebase to use the centralized output system
    - Enhanced console output with colored messages (success, warnings, errors) using chalk
    - Better separation of concerns with console output handling
    - Updated JSDoc documentation for svgDoc property to reflect array type instead of string
    - Minor documentation improvements
    - Fix bug: It was parsing Dart/Flutter twice

## [1.3.7]  2025-12-26

    - Update packages.

## [1.3.6]  2025-12-24

    - Fix DOT parser exclude pattern matching to properly handle glob patterns with path separators
    - DRY refactoring: Eliminate code duplication in parsers by extracting common file processing logic into `processFilesCommon()` method in BaseParser

## [1.3.5]  2025-12-24

    - Fix DOT file parser edge creation when exclude patterns are used

## [1.3.4]  2025-12-22

    - Support `.dot` file input

## [1.3.3]  2025-12-19

    - Make orange and red edges wider using CSS classes (.lineOrange and .lineRed) for better visibility
  
## [1.3.2]  2025-12-13

    - Fix --exclude parameter for Swift projects
    - Support multiple exclude patterns
    - Improve glob pattern matching for file exclusion

## [1.3.1]  2025-12-08

    - Add orphan node detection and visualization
    - Orphan nodes (files/folders with no edges) highlighted with red backgrounds in SVG outputs
    - Add --orphans CLI flag to list all orphan nodes    

## [1.3.0]  2025-12-08

    - Use Tree-Sister for parsing Swift files
    - Add tests for JS, TS, SWIFT

## [1.2.9]  2025-12-08

    - Improve Swift parsing: Discard comments and text string

## [1.2.8]  2025-12-07

    - fix for DRY

## [1.2.7]  2025-12-07

    - Display total node and edge counts

## [1.2.6]  2025-12-07

    - Display count of "circular" and "up" dependencies
    - Display total node and edge counts

## [1.2.5]  2025-12-06

    - Update packages
    - Fix LINT warnings
    - Support Swift projects

## [1.2.4]  2024-01-06

    - Improve Flutter/Dart dependency container names

## [1.2.3]  2023-12-04

    - Sort tooltips

## [1.2.2]  2023-12-04

    - Better colors

## [1.2.1]  2023-11-18

    - Show Dart module versions

## [1.2.0]  2023-08-07

    - Support for Flutter/Dart projects

## [1.1.5]  2023-08-07

    - Update packages

## [1.1.4]  2023-01-12

    - Exclude "node_modules" from import targets

## [1.1.3]  2023-01-11

    - Fix for running on Windows

## [1.1.2]  2022-08-04

    - package.json fix "main: cli/index.js"
    - update package eslint 8.21.0 and eslint-plugin-jsdoc 39.3.4
    - eslint config set to node:true and eslint:recommended, tab-space from 4 to 2

## [1.1.1]  2022-07-16

    - remove the NodeJS and NPM engine version enforcement, tested to work with NodeJS 14 & 16

## [1.1.0]  2022-07-05

    - Update packages
    - add tooltip to Edges and Counters

## [1.0.2]  2022-06-31

### instructions

    - updated README.md with installation instructions

## [1.0.1]  2022-06-30

### GitHub repo is now public

    - updated README.md
    - publish to npmjs.org 

## [0.1.0]  2022-06-27

### Added

    - Published to NPMjs.com as "amazon-glad"
