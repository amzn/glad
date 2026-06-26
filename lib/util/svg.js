import { stringIsEmpty } from './strings.js'

/**
 * @param {string} id
 * @param {string} value
 * @returns {string}
 */
export function getSvgAttribute (id, value) {
  return id + '="' + value + '"'
}

/**
 * @param {string} name
 * @param {string} value
 * @returns {string}
 */
export function getSvgAttributeIfValue (name, value) {
  if (stringIsEmpty(value)) {
    return ''
  }

  return ` ${name}="${value.trim()}"`
}

/**
 * return a string representing an SVG element for drawing a Line
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string|null} strokeColor
 * @param {string|null} fillColor
 * @param {string} attributes
 * @returns {string}
 */
export function getSvgCircle (x, y, radius, strokeColor = null, fillColor = null, attributes = '') {
  let text = `<circle cx="${x}" cy="${y}" r="${radius}"`

  text += getSvgAttributeIfValue('stroke', strokeColor)
  text += getSvgAttributeIfValue('fill', fillColor)

  if (!stringIsEmpty(attributes)) {
    text += ' ' + attributes.trim()
  }

  text += '/>'
  return text
}

/**
 * Generate a connection line with elbows
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string|null} color
 * @param {string|null} className
 * @param {string} additionalAttribute
 * @param {string} tooltip
 * @returns {string}
 */
export function getSvgConnectionAngle (x1, y1, x2, y2, color = null, className = null, additionalAttribute = '', tooltip = '') {
  if (x1 === x2) {
    return getSvgLine(x1, y1, x2, y2, color, className, additionalAttribute, tooltip)
  }

  const width = Math.abs(x2 - x1)
  const height = Math.abs(y2 - y1)

  // Handle both upward and downward edges
  const isUpward = y1 > y2
  const centerV = isUpward ? Math.max(y2 + 30, y2 + (height / 2)) : Math.min(y1 + 30, y1 + (height / 2))
  const offset = width / 20

  let svgGroup = getSvgGroupStart()

  let data

  // going down or up
  if (x1 < x2) {
    if (isUpward) {
      // going up right
      //
      //  End x2, y2
      //         |
      //   +------+
      //   |
      // Start x1, y1
      data = 'M' + x1 + ',' + y1 +
          ' L' + (x1 + offset) + ',' + (centerV - offset) +
          ' L' + (x2 - offset) + ',' + (centerV - (offset * 2)) +
          ' L' + x2 + ',' + y2
    } else {
      // going down right
      //
      //  Start x1, y1
      //  |
      //  +------+
      //         |
      //  End x2, y2
      data = 'M' + x1 + ',' + y1 +
          ' L' + (x1 + offset) + ',' + (centerV + offset) +
          ' L' + (x2 - offset) + ',' + (centerV + (offset * 2)) +
          ' L' + x2 + ',' + y2
    }
  } else {
    if (isUpward) {
      // going up left
      //
      //    End x2, y2
      //   |
      //   +------+
      //          |
      //  Start x1, y1
      data = 'M' + x1 + ',' + y1 +
          ' L' + (x1 - offset) + ',' + (centerV - offset) +
          ' L' + (x2 + offset) + ',' + (centerV - (offset * 2)) +
          ' L' + x2 + ',' + y2
    } else {
      // going down left
      //
      //  Start x1, y1
      //          |
      //   +------+
      //   |
      //   End x2, y2
      data = 'M' + x1 + ',' + y1 +
          ' L' + (x1 - offset) + ',' + (centerV + offset) +
          ' L' + (x2 + offset) + ',' + (centerV + (offset * 2)) +
          ' L' + x2 + ',' + y2
    }
  }

  let attributes = getSvgAttribute('d', data)
  if (color) {
    attributes += ' ' + getSvgAttribute('stroke', color)
  }
  if (!stringIsEmpty(additionalAttribute)) {
    attributes += ' ' + additionalAttribute.trim()
  }

  if (!stringIsEmpty(tooltip)) {
    svgGroup += `<title>${tooltip}</title>`
  }

  svgGroup += getSvgElement('path', null, className || 'line', attributes, true)

  svgGroup += getSvgGroupEnd()

  return svgGroup
}

/**
 * Generate a connection line with elbows
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string|null} color
 * @param {string|null} className
 * @param {string} additionalAttribute
 * @param {string} tooltip
 * @returns {string}
 */
export function getSvgConnectionLine (x1, y1, x2, y2, color = null, className = null, additionalAttribute = '', tooltip = '') {
  if (x1 === x2) {
    return getSvgCurve(x1, y1, x2, y2, color, className, additionalAttribute, tooltip)
  }

  const width = Math.abs(x2 - x1)
  const height = Math.abs(y2 - y1)

  // Handle both upward and downward edges
  const isUpward = y1 > y2
  const centerV = isUpward ? y2 + (height / 2) : y1 + (height / 2)
  const elbowRoom = Math.min(width, height)
  const curveSize = Math.min(elbowRoom / 4)

  let svgGroup = getSvgGroupStart()

  let data

  // going down or up
  if (x1 < x2) {
    if (isUpward) {
      // going up left
      //
      //  End x2, y2
      //   |
      //   \------\
      //          |
      //    Start x1, y1
      data = 'M' + x1 + ',' + y1 +
          ' V' + (centerV + curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 1 ' + curveSize + ' ' + -curveSize +
          ' H' + (x2 - curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 0 ' + curveSize + ' ' + -curveSize +
          ' V' + y2
    } else {
      // going down left
      //
      //        Start x1, y1
      //          |
      //   /------/
      //   |
      //  End x2, y2
      data = 'M' + x1 + ',' + y1 +
          ' V' + (centerV - curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 0 ' + curveSize + ' ' + curveSize +
          ' H' + (x2 - curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 1 ' + curveSize + ' ' + curveSize +
          ' V' + y2
    }
  } else {
    if (isUpward) {
      // going up right
      //
      //   End x2, y2
      //    |
      //   /------\
      //   |
      // Start x1, y1
      data = 'M' + x1 + ',' + y1 +
          ' V' + (centerV + curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 0 ' + -curveSize + ' ' + -curveSize +
          ' H' + (x2 + curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 1 ' + -curveSize + ' ' + -curveSize +
          ' V' + y2
    } else {
      // going down right
      //
      //  Start x1, y1
      //   |
      //   \------\
      //          |
      //    End x2, y2
      data = 'M' + x1 + ',' + y1 +
          ' V' + (centerV - curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 1 ' + -curveSize + ' ' + curveSize +
          ' H' + (x2 + curveSize) +
          ' a' + curveSize + ',' + curveSize + ' 0 0 0 ' + -curveSize + ' ' + curveSize +
          ' V' + y2
    }
  }

  let attributes = getSvgAttribute('d', data)
  if (color) {
    attributes += ' ' + getSvgAttribute('stroke', color)
  }
  if (!stringIsEmpty(additionalAttribute)) {
    attributes += ' ' + additionalAttribute.trim()
  }

  if (!stringIsEmpty(tooltip)) {
    svgGroup += `<title>${tooltip}</title>`
  }

  svgGroup += getSvgElement('path', null, className || 'line', attributes, true)

  svgGroup += getSvgGroupEnd()

  return svgGroup
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string|null} color
 * @param {string|null} className
 * @param {string} additionalAttribute
 * @param {string} tooltip
 * @returns {string}
 */
export function getSvgCurve (x1, y1, x2, y2, color = null, className = null, additionalAttribute = '', tooltip = '') {
  let pathData
  const testIfHorizontal = y1 / y2
  if (testIfHorizontal < 0.5) {
    pathData = getSvgPathCurveData(x1, y1, x2, y2)
  } else {
    pathData = getSvgPathCurveData(x1, y1, x2, y2)
  }

  if (!stringIsEmpty(tooltip)) {
    tooltip = `<title>${tooltip}</title>`
  }

  let attributes = `d="${pathData}" fill="none"`
  if (className) {
    attributes += ` class="${className}"`
  } else {
    attributes += ' class="line"'
  }
  if (color) {
    attributes += ` stroke="${color}"`
  }
  if (!stringIsEmpty(additionalAttribute)) {
    attributes += ' ' + additionalAttribute.trim()
  }

  return `<path ${attributes}>${tooltip}</path>`
}

/**
 * @param {string} svgElement
 * @param {string|null} id
 * @param {string|null} className
 * @param {string|null} attributes
 * @param {boolean} closeElement
 * @returns {string}
 */
export function getSvgElement (svgElement = 'g', id = null, className = null, attributes = null, closeElement = false) {
  if (id) {
    id = 'id="' + id + '"'
  }

  if (className) {
    className = 'class="' + className + '"'
  }
  const content = `${svgElement} ${id || ''} ${className || ''} ${attributes || ''} ${closeElement ? '/' : ''}`

  return '<' + content.trim() + '>'
}

/**
 * @param {string} svgElement
 * @returns {string}
 */
export function getSvgEndTag (svgElement = 'g') {
  return `</${svgElement}>`
}

/**
 * @returns {string}
 */
export function getSvgGroupEnd () {
  return getSvgEndTag('g')
}

/**
 * @param {string|null} id
 * @param {string|null} className
 * @returns {string}
 */
export function getSvgGroupStart (id = null, className = null) {
  return getSvgElement('g', id, className)
}

/**
 * return a string representing an SVG element for drawing a Line
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string|null} color
 * @param {string|null} className
 * @param {string} additionalAttribute
 * @param {string} tooltip
 * @returns {string}
 */
export function getSvgLine (x1, y1, x2, y2, color = null, className = null, additionalAttribute = '', tooltip = '') {
  let attributes = `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`
  if (className) {
    attributes += ` class="${className}"`
  } else {
    attributes += ' class="line"'
  }
  if (color) {
    attributes += ` stroke="${color}"`
  }
  if (!stringIsEmpty(additionalAttribute)) {
    attributes += ' ' + additionalAttribute.trim()
  }

  if (!stringIsEmpty(tooltip)) {
    tooltip = `<title>${tooltip}</title>`
  }

  return `<line ${attributes}>${tooltip}</line>`
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {string}
 */
export function getSvgPathCurveData (x1, y1, x2, y2) {
  const testIfHorizontal = Math.abs(y1 - y2)
  let halfDeltaW
  let halfDeltaV

  if (testIfHorizontal < 5) {
    halfDeltaW = Math.floor((x2 - x1) / 2)
    halfDeltaV = Math.max(10, Math.floor(Math.abs(halfDeltaW / 15)))
  } else {
    halfDeltaV = Math.floor((y2 - y1) / 2)
    halfDeltaW = Math.max(10, Math.floor(Math.abs(halfDeltaV / 15)))
  }
  return `M${x1} ${y1} C ${x1 + halfDeltaW} ${y1 + halfDeltaV},${x2 - halfDeltaW} ${y2 - halfDeltaV}, ${x2} ${y2}`
}

/**
 * return a string representing an SVG element for drawing a Line
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} rx
 * @param {number} ry
 * @param {string|null} className
 * @param {string|null} strokeColor
 * @param {string|null} fillColor
 * @param {string} attributes
 * @returns {string}
 */
export function getSvgRectangle (x, y, width, height, rx = 0, ry = 0, className = null, strokeColor = null, fillColor = null, attributes = '') {
  let text = `<rect x="${x}" y="${y}" width="${width}" height="${height}"`
  if (rx > 0) {
    text += getSvgAttributeIfValue('rx', rx.toString())
  }
  if (ry > 0) {
    text += getSvgAttributeIfValue('ry', ry.toString())
  }

  text += getSvgAttributeIfValue('class', className)
  text += getSvgAttributeIfValue('stroke', strokeColor)
  text += getSvgAttributeIfValue('fill', fillColor)

  if (!stringIsEmpty(attributes)) {
    text += ' ' + attributes.trim()
  }

  text += '/>'
  return text
}
