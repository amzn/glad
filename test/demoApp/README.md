# HOW TO RUN THE DEMO

```node index.js```

This demo showcases the orphan node functionality in GLAD graphs. Orphan nodes (nodes with no incoming or outgoing edges) are highlighted with red backgrounds in the SVG visualization.

## Demo Features

- **Original demo**: Simple transport class demonstration
- **Orphan node demo**: Creates a graph with:
  - Connected nodes (Car ↔ Truck)
  - Orphan nodes (Transportation root, OrphanVehicle)
- **Visual output**: Generates `orphan-demo.svg` showing orphan nodes in red

## Generate Posters

```bash
glad
glad -l -o myGraph.svg
```

## List Orphan Nodes

To list all orphan nodes (nodes with no edges) in your codebase:

```bash
glad --orphans
```

Example output:
```
Found 3 orphan node(s):
  - utils/helpers.js
  - legacy/oldFeature.js
  - unused/module.js
```

## Note: Orphan Node Visualization

In the real GLAD app, orphan nodes are automatically detected and highlighted with red backgrounds in all SVG outputs (grid, layers, poster views). This helps identify isolated components or unused code that may need attention.
