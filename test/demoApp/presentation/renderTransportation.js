import { Transport } from '../models/transport.js'

/**
 * @param {Array<Transport>} listOfTransport
 */
export function render (listOfTransport) {
    listOfTransport.forEach(transport => {
        console.log(transport.name)
    })
}
