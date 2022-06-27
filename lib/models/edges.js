import { Edge } from './edge.js'
import { Container } from './container.js' // eslint-disable-line no-unused-vars

/**
 * List of edges
 */
export class Edges extends Array {
    /**
     * @param {Container} source
     * @param {Container} target
     * @returns {Edge}
     */
    upsertEdge (source, target) {
        let edgeFound = this.getEdge(source, target)
        if (!edgeFound) {
            edgeFound = new Edge(source, target)
            this.push(edgeFound)
        }
        return edgeFound
    }

    /**
     * @param {Container} source
     * @param {Container} target
     * @returns {Edge|object}
     */
    getEdge (source, target) {
        return this.find(edge => edge.isMatch(source, target))
    }

    /**
     * console display
     */
    print () {
        this.forEach(edge => {
            console.info(edge.source.toString() + '  ->  ' + edge.target.toString())
        })
    }

    /**
     * Sort by name
     */
    sortByName () {
        this.sort((edgeA, edgeB) => {
            // primary sorting based on Source text
            let compareResult = edgeA.source.name.localeCompare(edgeB.source.name)
            if (compareResult === 0) {
                // secondary based on target text
                compareResult = edgeA.target.name.localeCompare(edgeB.target.name)
            }
            return compareResult
        })
    }

    /**
     * @param {Container} sourceNode
     * @returns {Edges}
     */
    getListOfTargetForThisSource (sourceNode) {
    // noinspection JSValidateTypes
        return this.filter(edge => edge.source === sourceNode)
    }

    /**
     * @param {Container} sourceNode
     * @param {Array<Container>} listOfPossibleTargets
     * @returns {number}
     */
    getTotalMatchingTargetForThisSource (sourceNode, listOfPossibleTargets) {
        let total = 0
        this.forEach(edge => {
            if (edge.source === sourceNode) {
                if (listOfPossibleTargets.includes(edge.target)) {
                    total++
                }
            }
        })
        return total
    }

    /**
     * @returns {Array<object>}
     */
    toBasicJSON () {
        const list = []
        this.forEach(edge => {
            list.push(edge.toBasicJSON())
        })
        return list
    }
}
