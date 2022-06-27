import path from 'path'
import { Graph } from '../models/graph.js' // eslint-disable-line no-unused-vars
import { Constants } from '../models/constants.js'
import { plural, XMLTree } from '../util/strings.js'
import { Edges } from '../models/edges.js'
import { Container } from '../models/container.js' // eslint-disable-line no-unused-vars
import { Layer } from '../models/layer.js' // eslint-disable-line no-unused-vars
import { getLayersInThisNode, Layers } from '../models/layers.js' // eslint-disable-line no-unused-vars
import { Point, Rectangle } from '../models/rectangle.js' // eslint-disable-line no-unused-vars
import { Edge } from '../models/edge.js' // eslint-disable-line no-unused-vars
import {
    getSvgCircle,
    getSvgConnectionAngle,
    getSvgConnectionLine,
    getSvgCurve,
    getSvgLine,
    getSvgRectangle
} from '../util/svg.js'

/**
 * @property {string} svgDoc - the text version of the SVG representation
 */
export class RenderBase {
    constructor () {
        this.svgDoc = ''
    }

    /**
     * @param {Graph} graph
     * @param {!object} options
     */
    init (graph, options) {
        this.graph = graph
        this.options = options
    }

    /**
     * @returns {string}
     */
    getSvgDocument () {
        return XMLTree(this.svgDoc)
    }

    /**
     * @param {Container} node
     * @param {boolean} renderRectangle
     * @param {boolean} renderText
     */
    renderLayers (node, renderRectangle = true, renderText = true) {
        getLayersInThisNode(node).forEach((layer, index) => {
            this.renderLayer(layer, node.name, index, renderRectangle, renderText)

            layer.nodes.forEach(subNode => {
                this.renderLayers(subNode, renderRectangle, renderText)
            })
        })
    }

    /**
     * @param {Layer} layer
     * @param {string} text
     * @param {number} index
     * @param {boolean} showRectangle
     * @param {boolean} showNumber
     */
    renderLayer (layer, text, index, showRectangle = true, showNumber = false) {
        this.renderSvgGroupStart('Layer:' + layer.index + ' of ' + text)
        const rect = layer.rect.copy()

        // Rectangle
        if (showRectangle) {
            this.addRect(rect, 'layerRectangle', null, null, text + ' ' + index, 2)
        }

        // Text
        if (showNumber || this.options.debug) {
            if (showNumber) {
                text = ''
            }
            this.svgDoc += `<text x="${layer.rect.right - Constants.paddingText}" y="${layer.rect.top + Constants.paddingText}" class='layerText' dominant-baseline="hanging" text-anchor="end" >${index + 1} ${text}</text>`
        }
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Container} node
     */
    renderNode (node) {
        const nodeName = node.name
        const groupId = `Node_${nodeName}`
        this.renderSvgGroupStart(groupId)

        const r = node.rect.copy()
        r.deflateOnCenter(Constants.nodeGap)

        // The shape
        if (node.isLeaf) {
            // File
            this.svgDoc += getSvgRectangle(r.x, r.y, r.w, r.h, 8, 8, 'nodeFile')
        } else {
            // Folder
            this.svgDoc += getSvgRectangle(r.x, r.y, r.w, r.h, 2, 2, 'nodeFolder')
        }

        node.sub.forEach(subContainer => {
            // if (!subContainer.isLeaf) {
            this.renderNode(subContainer)
            // }
        })
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Container} node
     */
    renderLabels (node) {
        const nodeName = node.name
        const groupId = `Labels_${nodeName}`
        this.renderSvgGroupStart(groupId)

        const r = node.rect

        // The Title
        const containerTitle = node.name
        let fontSize = '120%'

        if (node.isLeaf) {
            if (containerTitle.length > Constants.numberOfPossibleCharactersToFitInNodeMinWidth) {
                fontSize = '90%'
            }
            this.svgDoc += `<text class="nodeName" x="${r.centerHorizontal}" y="${r.centerVertical}" font-size="${fontSize}">${containerTitle}</text>`
        } else {
            this.svgDoc += `<text class="folderName" x="${r.x + Constants.paddingText}" y="${r.y + Constants.paddingText}">${containerTitle}</text>`
        }

        // Detail information
        if (this.options.details) {
            const itemsToShow = []
            if (!node.isLeaf) {
                const totalContainers = node.getFlatListOfContainers().length
                if (totalContainers > 0) {
                    itemsToShow.push(totalContainers + plural(' folder', totalContainers))
                }

                const totalLeaf = node.getFlatListOfNodes().length
                if (totalLeaf > 0) {
                    itemsToShow.push(totalLeaf + plural(' file', totalLeaf))
                }

                const totalEdgesGoingIn = node.getExternalSourceNodes().length
                if (totalEdgesGoingIn > 0) {
                    itemsToShow.push(totalEdgesGoingIn + ' incoming')
                }

                const totalEdgesGoingOut = node.getExternalTargetedNodes().length
                if (totalEdgesGoingOut > 0) {
                    itemsToShow.push(totalEdgesGoingOut + ' outgoing')
                }
            }

            if (!node.isLeaf) {
                const pathToThisContainer = path.dirname(node.getPath()) // strip the last right part
                if (pathToThisContainer !== '' && pathToThisContainer !== '.') {
                    itemsToShow.push('path: ...' + path.sep + pathToThisContainer + path.sep)
                }
            }

            const textInfo = itemsToShow.join(', ')

            if (textInfo !== '') {
                this.svgDoc += `<text x="${r.x + Constants.paddingText}" y="${r.bottom - Constants.paddingText}" font-size="75%">`
                this.svgDoc += `${textInfo}`
                this.svgDoc += '</text>'
            }
        }

        node.sub.forEach(subContainer => {
            // if (!subContainer.isLeaf) {
            this.renderLabels(subContainer)
            // }
        })
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Container} node
     */
    renderNodeEdgeCounters (node) {
        const nodeName = node.name
        const groupId = `Counters_${nodeName}`
        this.renderSvgGroupStart(groupId)

        if (node.isLeaf) {
            if (this.options.lines !== Constants.LINES_HIDE) {
                if (node.targetNodes.length > 0) {
                    this.addPillCounter(getEdgeDeparturePoint(node), node.targetNodes.length.toString(), 'green')
                }

                if (node.sourceNodes.length > 0) {
                    this.addPillCounter(getEdgeArrivalPoint(node), node.sourceNodes.length.toString(), 'blue')
                }
            }
        }

        node.sub.forEach(subContainer => {
            // if (!subContainer.isLeaf) {
            this.renderNodeEdgeCounters(subContainer)
            // }
        })
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Point} centerPoint
     * @param {string} value
     * @param {string} backgroundColor
     * @param {string} fontColor
     */
    addPillCounter (centerPoint, value, backgroundColor = '#000011aa', fontColor = 'white') {
        this.addPillCounterXY(centerPoint.x, centerPoint.y, value, backgroundColor, fontColor)
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} value
     * @param {string} backgroundColor
     * @param {string} fontColor
     */
    addPillCounterXY (x, y, value, backgroundColor = '#000011aa', fontColor = 'white') {
        this.renderSvgGroupStart()
        this.svgDoc += getSvgCircle(x, y, (Constants.pillSize / 2), null, backgroundColor)
        this.svgDoc += `<text x="${x}" y="${y}" fill="${fontColor}" font-size="10" text-anchor="middle" dominant-baseline="central">`
        this.svgDoc += value
        this.svgDoc += '</text>'
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Rectangle} rect
     * @param {string|null} className
     * @param {string|null} backgroundColor
     * @param {string|null} borderColor
     * @param {string|null} id
     * @param {number} roundCorner
     * @param {string|null} additionalAttribute
     */
    addRect (rect, className = null, backgroundColor = '#aaaaff', borderColor = null, id = null, roundCorner = 0, additionalAttribute = '') {
        this.addRectXYWH(rect.x, rect.y, rect.w, rect.h, className, backgroundColor, borderColor, id, roundCorner, additionalAttribute)
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string|null} className
     * @param {string|null} backgroundColor
     * @param {string|null} borderColor
     * @param {string|null} id
     * @param {number} roundCorner
     * @param {string|null} additionalAttribute
     */
    addRectXYWH (x, y, w, h, className = null, backgroundColor = '#aaaaff77', borderColor = null, id = null, roundCorner = 0, additionalAttribute = '') {
        let attribId = ''
        if (id) {
            attribId = `id='${id}'`
        }
        additionalAttribute += ' ' + attribId
        this.svgDoc += getSvgRectangle(x, y, w, h, roundCorner, roundCorner, className, borderColor, backgroundColor, additionalAttribute)
    }

    /**
     * @param {Edges} edges
     */
    renderEdgesOfLeaves (edges) {
        if (this.options.lines === Constants.LINES_HIDE) {
            return
        }

        this.renderSvgGroupStart('Edges')
        edges.forEach(edge => {
            const sourceCenter = getEdgeDeparturePoint(edge.source)
            const targetCenter = getEdgeArrivalPoint(edge.target)
            this.addLinePointer(sourceCenter, targetCenter, edge.isCircular)
        })
        this.renderSvgGroupEnd()
    }

    /**
     * @param {Array<Container>} containers
     */
    renderEdgesOfContainer (containers) {
        this.renderSvgGroupStart('Edges_Containers')

        const containerEdgeDeparture = new Map()
        const containerCounterForSources = {}
        const containerCounterForTargets = {}

        containers.forEach(sourceContainer => {
            sourceContainer.getAllTargetedContainers().forEach(targetContainer => {
                if (!containerEdgeDeparture.has(sourceContainer)) {
                    containerEdgeDeparture.set(sourceContainer, new Set())
                }
                containerEdgeDeparture.get(sourceContainer).add(targetContainer)

                if (!containerCounterForSources[sourceContainer.id]) {
                    containerCounterForSources[sourceContainer.id] = 1
                } else {
                    containerCounterForSources[sourceContainer.id]++
                }

                if (!containerCounterForTargets[targetContainer.id]) {
                    containerCounterForTargets[targetContainer.id] = 1
                } else {
                    containerCounterForTargets[targetContainer.id]++
                }
            })
        })

        containerEdgeDeparture.forEach((valueSet, keySource) => {
            valueSet.forEach(target => {
                const sourceCenter = getEdgeDeparturePoint(keySource)
                const targetCenter = getEdgeArrivalPoint(target)
                this.addLinePointer(sourceCenter, targetCenter, false)

                this.addPillCounter(sourceCenter, containerCounterForSources[keySource.id], 'green')
                this.addPillCounter(targetCenter, containerCounterForTargets[target.id], 'blue')
            })
        })

        this.renderSvgGroupEnd()
    }

    /**
     * @param {Point} pointSource
     * @param {Point} pointTarget
     * @param {boolean} isCircular
     */
    addLinePointer (pointSource, pointTarget, isCircular = false) {
        const x1 = pointSource.x
        const y1 = pointSource.y
        const x2 = pointTarget.x
        const y2 = pointTarget.y

        let color
        if (isCircular) {
            color = '#EB4132' // red
        } else {
            if (y1 < y2) {
                if (this.options.lines === Constants.LINES_WARNINGS) {
                    // the user does not want to see the green lines
                    return
                }
                color = '#377E2288' // green & transparent
            } else {
                color = '#F09235' // orange
            }
        }
        let shadow = ''
        if (this.options.lineEffect.includes('outline')) {
            shadow = 'filter=\'url(#outlineBlack)\''
        }
        if (this.options.lineEffect.includes('shadow')) {
            shadow = 'filter=\'url(#shadow)\''
        }

        switch (this.options.lines) {
        case Constants.LINES_STRAIT:
            this.svgDoc += getSvgLine(x1, y1, x2, y2, color, shadow)
            break
        case Constants.LINES_ELBOW:
            this.svgDoc += getSvgConnectionLine(x1, y1, x2, y2, color, shadow)
            break
        case Constants.LINES_ANGLE:
            this.svgDoc += getSvgConnectionAngle(x1, y1, x2, y2, color, shadow)
            break
        case Constants.LINES_CURVE:
        default:
            this.svgDoc += getSvgCurve(x1, y1, x2, y2, color, shadow)
            break
        }
    }

    /**
     * @param {number} w
     * @param {number} h
     */
    renderSvgStart (w = 1000, h = 1000) {
        this.svgDoc += '<?xml version="1.0" standalone="no"?>'
        this.svgDoc += `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif" style="background-color:white">`
        this.addSvgStylesAndDefinitions()
    }

    renderSvgEnd () {
        this.svgDoc += '</svg>'
    }

    /**
     * @param {string|null} id
     * @param {string|null} className
     */
    renderSvgGroupStart (id = null, className = null) {
        const idText = id ? 'id=\'' + id + '\'' : ''
        this.svgDoc += '<g ' + idText + ' ' + (className || '') + '>'
    }

    renderSvgGroupEnd () {
        this.svgDoc += '</g>'
    }

    addSvgStylesAndDefinitions () {
        this.svgDoc += `<style>
    .layerRectangle {
      stroke: black;
      stroke-dasharray: 5,5;
      fill: url('#layers')
    }
    .layerText {
      fill: purple;
      font-size: 150%;
      filter: url(#outlineWhite);
    }
    .nodeFolder {
      fill: #aaaaaa33;
      stroke: whitesmoke;
    }
    .nodeFile {
      fill: #ffffffee;
      stroke: gray;
    }
    .folderName {
      font-size: 180%;
      fill : white;
      font-weight: bolder;
      text-anchor: start;
      letter-spacing : 1px;
      dominant-baseline: hanging;
      filter: url(#shadow);
    }
    .nodeName {
      fill : black;
      font-weight: bold;
      text-anchor: middle;
      dominant-baseline: central;
      filter: url(#outlineWhite);
    }
    .line {
      fill : none;
      stroke-width: 3;
      opacity: 0.5;
    }
    .line:hover {
      stroke-width: 6;
      opacity: 1;
    }

    </style>`

        this.svgDoc += '<defs id=\'idSvgDef\'>'
        this.svgDoc += '<linearGradient id="layers" gradientTransform="rotate(90)"><stop offset="0%"  stop-color="rgba(105, 24, 114, 0.10)"/><stop offset="100%" stop-color="rgba(105, 24, 114, 0.30)" /></linearGradient>'
        this.svgDoc += `<filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="1" dy="1" result="offsetblur"/>
      <feFlood flood-color="black"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge></filter>`

        this.svgDoc += `<filter id="outlineWhite">
        <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="2"/>        
        <feFlood flood-color="#ffffffaa" flood-opacity="1" result="WHITE"/>
        <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE"/>
        <feMerge>
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>`

        this.svgDoc += `<filter id="outlineBlack">
        <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="2"/>
        <feFlood flood-color="#000000aa" flood-opacity="1" result="BLACK"/>
        <feComposite in="BLACK" in2="DILATED" operator="in" result="OUTLINE"/>
        <feMerge>
            <feMergeNode in="OUTLINE"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>`

        this.svgDoc += '<marker id=\'lineEnd\' viewBox= \'0 -5 30 10\' refX=\'12\' orient=\'auto\'>'
        this.svgDoc += '<path d=\'M0,-16L32,0L0,16\' fill=\'#3058FFaa\'/>'
        this.svgDoc += '</marker>'

        this.svgDoc += '<marker id=\'lineStart\' viewBox= \'0 -4 8 8\' refX=\'4\' orient=\'auto\'>'
        this.svgDoc += '<circle cx=\'4\' r=\'4\' fill=\'#377E22aa\'/>'
        this.svgDoc += '</marker>'

        this.svgDoc += '</defs>'
    }
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Array<Container>} nodes
 * @param {object} options
 * @returns {{nodesToRender, w: number, layers, h: number}}
 */
export function createLayers (graph, layers, nodes, options) {
    if (nodes.length > 0) {
    // identify the circular edges
        const allCircularEdges = new Edges()
        nodes.forEach(node => {
            const circularEdges = findDirectCircularNodes(graph, node)
            circularEdges.forEach(edge => {
                allCircularEdges.upsertEdge(edge.source, edge.target)
            })
        })

        // temporary remove all the circular nodes
        let circularNodes = nodes.filter(node => allCircularEdges.some(edge => edge.source === node || edge.target === node))

        nodes = nodes.filter(node => !circularNodes.includes(node))
        let lastLayerChecksum = ''
        let retries = 0
        layers.setAllLayersToTheSameMaxWidth()
        while (retries++ < 99) {
            moveNodesToLayers(graph, layers, nodes)
            layers.compactEmptyLayers()
            layers = layers.sortByIndex()

            if (lastLayerChecksum === layers.toString()) {
                break
            }
            lastLayerChecksum = layers.toString()
        }

        moveObviousOnes(layers)

        // add back the circular nodes
        circularNodes = circularNodes.sort((a, b) => a.targetNodes.length - b.targetNodes.length)
        circularNodes.forEach(node => nodes.push(node))
        // place them
        moveNodesToLayers(graph, layers, circularNodes)

        layers.compactEmptyLayers()
    }

    const { w, h } = layers.placeLayersAndNodes(options.align)

    return { nodesToRender: nodes, layers, w, h }
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Array<Container>} nodes
 */
function moveNodesToLayers (graph, layers, nodes) {
    const processNodes = [...nodes] // copy the list
    while (processNodes.length > 0) {
    // pop the first node in the list
        const poppedNode = processNodes.shift()

        // place it in the best layer
        upsertToTheBestLayer(graph, layers, poppedNode)
    }
}

/**
 * @param {Layers} layers
 */
function moveObviousOnes (layers) {
    // one more pass to catch any wrong placement
    const layerTop = layers[0]
    const layerBottom = layers[layers.length - 1]
    layers.forEach(layer => {
        if (layer !== layerBottom) {
            layer.nodes.forEach(node => {
                if (node.targetNodes.length === 0 && node.sourceNodes.length === 0) {
                    layers.moveNodeFromTo(layer, layerTop, node)
                } else if (node.targetNodes.length === 0) {
                    layers.moveNodeFromTo(layer, layerBottom, node)
                }
            })
        }
    })
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Container} node
 */
function upsertToTheBestLayer (graph, layers, node) {
    // Someone calling this Container?
    {
        const layerMatched = firstLayerStartingFromTheBottomThatCallsThisNode(graph, layers, node)
        if (layerMatched) {
            setInLayerOrInsertIfNeeded(graph, layers, node, layerMatched.index + 1)
            return
        }
    }

    // Place it where there is no friction - starting from the top
    {
        const layerMatched = firstLayerStartingFromTopWithNoEdges(graph, layers, node)
        if (layerMatched) {
            layers.moveNodeTo(layerMatched, node)
            return
        }
    }

    // Top Down - Does it call something?
    {
        const layerMatched = firstLayerStartingFromTopThatThisNodeCalls(graph, layers, node)
        if (layerMatched) {
            setInLayerOrInsertIfNeeded(graph, layers, node, layerMatched.index - 1)
            return
        }
    }

    // Add a new layer at the end of the layer list
    layers.addLayer().nodes.push(node)
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Container} node
 * @returns {Layer|*|null}
 */
function firstLayerStartingFromTopWithNoEdges (graph, layers, node) {
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        const currentLayer = layers[layerIndex]
        // Exclude this node from the list of peer nodes to compare against
        const peerNodesOnThatLayer = currentLayer.nodes.filter(peerNode => peerNode !== node) // jshint ignore:line
        const compareResult = graph.getOutIn([node], peerNodesOnThatLayer)
        if (compareResult.in === 0) {
            return currentLayer
        }
    }
    return null
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Container} node
 * @returns {Layer|*|null}
 */
function firstLayerStartingFromTopThatThisNodeCalls (graph, layers, node) {
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        const currentLayer = layers[layerIndex]
        // Exclude this node from the list of peer nodes to compare against
        const peerNodesOnThatLayer = currentLayer.nodes.filter(peerNode => peerNode !== node) // jshint ignore:line
        const compareResult = graph.getOutIn([node], peerNodesOnThatLayer)
        if (compareResult.out > 0) {
            return currentLayer
        }
    }
    return null
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Container} node
 * @param {number} layerIndex
 * @returns {Layer|*}
 */
function setInLayerOrInsertIfNeeded (graph, layers, node, layerIndex) {
    if (layerIndex >= 0 && layerIndex < layers.length) {
        const layerToTestIfAllowed = layers[layerIndex]
        const compareResult = graph.getOutIn([node], layerToTestIfAllowed.nodes)
        if (compareResult.in === 0 && compareResult.out === 0) {
            // placing in this layer is valid
            layers.moveNodeTo(layerToTestIfAllowed, node)
            return layerToTestIfAllowed
        }
    }

    // insert a new layer
    const newLayer = layers.insertLayerAt(layerIndex)
    const layerThisNodeCurrentlyResideOn = layers.getLayerWithThisNode(node)
    if (layerThisNodeCurrentlyResideOn) {
        layers.moveNodeFromTo(layerThisNodeCurrentlyResideOn, newLayer, node)
    } else {
        layers.moveNodeTo(newLayer, node)
    }
    return newLayer
}

/**
 * @param {Graph} graph
 * @param {Layers} layers
 * @param {Container} node
 * @returns {Layer|*|null}
 */
function firstLayerStartingFromTheBottomThatCallsThisNode (graph, layers, node) {
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
        const currentLayer = layers[layerIndex]
        // Exclude this node from the list of peer nodes to compare against
        const peerNodesOnThatLayer = currentLayer.nodes.filter(peerNode => peerNode !== node) // jshint ignore:line
        const compareResult = graph.getOutIn([node], peerNodesOnThatLayer)
        if (compareResult.in > 0) {
            return currentLayer
        }
    }
    return null
}

/**
 * @param {Graph} graph
 * @param {Container} node
 * @returns {Array<Edge>}
 */
function findDirectCircularNodes (graph, node) {
    const edgesWithTargets = graph.edges.getListOfTargetForThisSource(node)
    const targets = new Set()
    edgesWithTargets.forEach(edge => targets.add(edge.target))

    const circulars = []

    graph.edges.forEach(edge => {
        if (targets.has(edge.source) && edge.target === node) {
            // circular
            circulars.push(edge)
        }
    })
    return circulars
}

/**
 * @param {Container} node
 * @returns {Point}
 */
function getEdgeArrivalPoint (node) {
    if (node.isLeaf) {
        return new Point(node.rect.left + Constants.pillOffset, node.rect.top + Constants.pillOffset)
    } else {
        return new Point(node.rect.centerHorizontal - Constants.pillOffset, node.rect.top + Constants.pillOffset)
    }
}

/**
 * return the location of the bottom center of the rect
 *
 * @param {Container} node
 * @returns {Point}
 */
function getEdgeDeparturePoint (node) {
    if (node.isLeaf) {
        return new Point(node.rect.right - Constants.pillOffset, node.rect.bottom - Constants.pillOffset)
    } else {
        return new Point(node.rect.centerHorizontal + Constants.pillOffset, node.rect.bottom - Constants.pillOffset)
    }
}
