
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
 * @param {string|null} id
 * @param {string|null} className
 * @returns {string}
 */
export function getSvgGroupStart (id = null, className = null) {
    return getSvgElement('g', id, className)
}

/**
 * @returns {string}
 */
export function getSvgGroupEnd () {
    return getSvgEndTag('g')
}

/**
 * return a string representing an SVG element for drawing a Line
 *
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

    if (attributes && attributes !== '') {
        text += ' ' + attributes.trim()
    }

    text += '/>'
    return text
}

/**
 * return a string representing an SVG element for drawing a Line
 *
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

    if (attributes && attributes !== '') {
        text += ' ' + attributes.trim()
    }

    text += '/>'
    return text
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
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 * @param {string} additionalAttribute
 * @returns {string}
 */
export function getSvgCurve (x1, y1, x2, y2, color, additionalAttribute = '') {
    let pathData
    const testIfHorizontal = y1 / y2
    if (testIfHorizontal < 0.5) {
        pathData = getSvgPathCurveData(x1, y1, x2, y2)
    } else {
        pathData = getSvgPathCurveData(x1, y1, x2, y2)
    }
    return `<path class="line" d="${pathData}" fill="none" stroke="${color}" ` + additionalAttribute + '/>'
}

/**
 * return a string representing an SVG element for drawing a Line
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 * @param {string} filter
 * @returns {string}
 */
export function getSvgLine (x1, y1, x2, y2, color = 'black', filter = '') {
    return `<line class="line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${filter}/>`
}

/**
 * @param {string} name
 * @param {string} value
 * @returns {string}
 */
export function getSvgAttributeIfValue (name, value) {
    if (value && value !== '') {
        return ` ${name}="${value.trim()}"`
    }
    return ''
}

/**
 * @param {string} id
 * @param {string} value
 * @returns {string}
 */
export function getSvgAttribute (id, value) {
    return id + '="' + value + '"'
}

/**
 * Generate a connection line with elbows
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 * @param {string|null} additionalAttribute
 * @returns {string}
 */
export function getSvgConnectionLine (x1, y1, x2, y2, color = 'black', additionalAttribute = null) {
    if (x1 === x2) {
        return getSvgCurve(x1, y1, x2, y2, color, additionalAttribute)
    }

    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    if (y1 > y2) {
    // swap coordinate this way we only have to implement 2 cases
        return ''
    }

    const centerV = y1 + (height / 2)
    const elbowRoom = Math.min(width, height)
    const curveSize = Math.min(elbowRoom / 4)

    let svgGroup = getSvgGroupStart()

    let data

    // going down
    if (x1 < x2) {
    // going left
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
    } else {
    // going right

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

    svgGroup += getSvgElement('path', null, 'line', getSvgAttribute('stroke', color) + ' ' + getSvgAttribute('d', data), true)

    svgGroup += getSvgGroupEnd()

    return svgGroup
}

/**
 * Generate a connection line with elbows
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 * @param {string|null} additionalAttribute
 * @returns {string}
 */
export function getSvgConnectionAngle (x1, y1, x2, y2, color = 'black', additionalAttribute = null) {
    if (x1 === x2) {
        return getSvgLine(x1, y1, x2, y2, color, additionalAttribute)
    }

    if (y1 > y2) {
    // swap coordinate this way we only have to implement 2 cases
        return ''
    }

    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    const centerV = Math.min(y1 + 30, y1 + (height / 2))
    const offset = width / 20

    let svgGroup = getSvgGroupStart()

    let data

    // going down
    if (x1 < x2) {
    // going right
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
    } else {
    // going left

        //  Start x1, y1
        //          |
        //   +------+
        //   |
        //   End x2, y2

        data = data = 'M' + x1 + ',' + y1 +
    ' L' + (x1 - offset) + ',' + (centerV + offset) +
    ' L' + (x2 + offset) + ',' + (centerV + (offset * 2)) +
    ' L' + x2 + ',' + y2
    }

    svgGroup += getSvgElement('path', null, 'line', getSvgAttribute('stroke', color) + ' ' + getSvgAttribute('d', data), true)

    svgGroup += getSvgGroupEnd()

    return svgGroup
}
