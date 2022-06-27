import { Transport } from '../models/transport.js' // eslint-disable-line no-unused-vars

/**
 * @param {Array<Transport>} listOfTransport
 */
export function render (listOfTransport) {
    listOfTransport.forEach(transport => {
        console.log(transport.name)
    })
}
