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
 * Check if a file path matches any exclude pattern
 * @param {string} filePath - Relative file path to check
 * @param {string|Array<string>} excludePatterns - Glob pattern(s) to match against
 * @returns {boolean} True if the file should be excluded
 */
export function matchesExcludePattern (filePath, excludePatterns) {
  if (!Array.isArray(excludePatterns)) {
    excludePatterns = excludePatterns ? [excludePatterns] : []
  }

  return excludePatterns.some(pattern => {
    // Simple glob matching implementation
    // First escape special regex characters including *
    let regexPattern = pattern.replace(/[.+^${}()|[\]\\*?/]/g, '\\$&')

    // Then convert escaped glob patterns to regex
    regexPattern = regexPattern
      .replace(/\\\*\\\*\\\//g, '(.*/)?')  // **/ matches optional path (escaped **/)
      .replace(/\\\*\\\*/g, '.*')         // ** matches any path (escaped **)
      .replace(/\\\*/g, '.*')             // * matches any characters including / (escaped *)
      .replace(/\\\?/g, '[^/]')           // ? matches any single character except / (escaped ?)

    const regex = new RegExp('^' + regexPattern + '$')
    return regex.test(filePath)
  })
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
 * return true if the input string is null, undefined, or contains only zero or more space
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
 * Clean up XML string
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
