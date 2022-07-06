/**
 * @param {string} text
 * @param {string} textToRemove
 * @returns {string}
 */
export function ensureNotEndingWith (text, textToRemove) {
    if (text.endsWith(textToRemove)) {
        const index = text.lastIndexOf(textToRemove)
        if (index !== -1) {
            return text.substring(0, index)
        }
    }
    return text
}

/**
 * @param {string} text
 * @param {string} textToAdd
 * @returns {string}
 */
export function ensureEndsWith (text, textToAdd) {
    if (text.endsWith(textToAdd)) {
        return text
    }
    return text + textToAdd
}

/**
 * return true if the input string is null, undefined, or contains only zero or more space
 *
 * @param {string} text
 * @returns {boolean}
 */
export function stringIsEmpty (text) {
    if (!text) {
        return true
    }

    return text.trim() === ''
}

/**
 * @param {string} text
 * @param {number} quantity
 * @returns {string}
 */
export function plural (text, quantity) {
    return text + (quantity > 1 ? 's' : '')
}

/**
 * Clean up XML string
 *
 * @param {string} xmlString
 * @param {string} indentType
 * @returns {string}
 */
export function XMLTree (xmlString, indentType = '  ') {
    let formatted = ''
    let indentCount = 0
    xmlString.split(/>\s*</).forEach(node => {
        if (node.match(/^\/\w/)) {
            // decrease indent
            indentCount = Math.max(0, --indentCount)
        }

        formatted += indentType.repeat(indentCount)
        formatted += '<' + node.trim() + '>\n'

        // eslint-disable-next-line no-useless-escape
        if (node.match(/^<?\w[^>]*[^\/]$/)) {
            // increase indent
            indentCount++
        }
    })
    return formatted.substring(1, formatted.length - 2) // remove trailing ">\n"
}
