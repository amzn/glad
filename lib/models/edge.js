import { Container } from './container.js' // eslint-disable-line no-unused-vars

/**
 * @property {Container} source - source node that links to the target node
 * @property {Container} target - target node that if referred to by the source node
 */
export class Edge {
    /**
     * @param {Container} source
     * @param {Container} target
     */
    constructor (source, target) {
        this.source = source
        this.target = target
        this.isCircular = false
    }

    /**
     * @param {Container} source
     * @param {Container} target
     * @returns {boolean}
     */
    isMatch (source, target) {
        return this.source === source && this.target === target
    }

    /**
     * @returns {{source: {name: string}, target: {name: string}}}
     */
    toBasicJSON () {
        return {
            source: this.source.toBasicJSON(),
            target: this.target.toBasicJSON()
        }
    }
}
