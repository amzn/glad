// noinspection JSUnusedGlobalSymbols
/**
 * A simple Rectangle implementation
 * @property {number} x1 - left
 * @property {number} y1 - top
 * @property {number} x2 - right
 * @property {number} y2 - bottom
 */
export class Rectangle {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor (x = 0, y = 0, width = 0, height = 0) {
    this._x = x
    this._y = y
    this._w = width
    this._h = height
  }

  /**
   * @returns {Rectangle}
   */
  copy () {
    return new Rectangle(this.x, this.y, this.w, this.h)
  }

  /**
   * @returns {number}
   */
  get x () {
    return this._x
  }

  /**
   * @param {number} value
   */
  set x (value) {
    this._x = value
  }

  /**
   * @returns {number}
   */
  get y () {
    return this._y
  }

  /**
   * @param {number} value
   */
  set y (value) {
    this._y = value
  }

  /**
   * @returns {number}
   */
  get w () {
    return this._w
  }

  /**
   * @param {number} value
   */
  set w (value) {
    // if (value < this._w) {
    //   console.log("W was " + this._w + "  now is " + value);
    // }

    this._w = value
  }

  /**
   * @returns {number}
   */
  get h () {
    return this._h
  }

  /**
   * @param {number} value
   */
  set h (value) {
    // if (value < this._h) {
    //   console.log("H was " + this._h + "  now is " + value);
    // }
    this._h = value
  }

  /**
   * @returns {number}
   */
  get x1 () {
    return this.x
  }

  /**
   * @returns {number}
   */
  get x2 () {
    return this.x + this.w
  }

  /**
   * @param {number} value
   */
  set x2 (value) {
    this.right = value
  }

  /**
   * @returns {number}
   */
  get y1 () {
    return this.y
  }

  /**
   * @returns {number}
   */
  get y2 () {
    return this.y + this.h
  }

  /**
   * @returns {number}
   */
  get left () {
    return this.x
  }

  /**
   * @returns {number}
   */
  get right () {
    return this.x + this.w
  }

  /**
   * @param {number} valueX
   */
  set right (valueX) {
    this.w = valueX - this.x
  }

  /**
   * @returns {number}
   */
  get top () {
    return this.y
  }

  /**
   * @returns {number}
   */
  get bottom () {
    return this.y2
  }

  /**
   * @param {number} valueY
   */
  set bottom (valueY) {
    this.h = valueY - this.y
  }

  /**
   * @returns {number}
   */
  get width () {
    return this.w
  }

  /**
   * @param {number} value
   */
  set width (value) {
    this.w = value
  }

  /**
   * @returns {number}
   */
  get height () {
    return this.h
  }

  /**
   * @returns {Point}
   */
  getCenter () {
    return new Point(this.centerHorizontal, this.centerVertical)
  }

  /**
   * @returns {number}
   */
  get centerVertical () {
    let c = this.y
    c += this.h / 2
    return c
  }

  /**
   * @param {number} newCenterY
   */
  set centerVertical (newCenterY) {
    this.y = newCenterY - (this.h / 2)
  }

  /**
   * @returns {number}
   */
  get centerHorizontal () {
    let c = this.x
    c += this.w / 2
    return c
  }

  /**
   * @returns {boolean}
   */
  get isSquare () {
    return this.w === this.h
  }

  /**
   * return true if the aspect ratio delta is less than 5%
   * w     h    ratio
   * 10    10   1.0  YES
   * 10    20   0.5  NO
   * 12    10   0.83 NO
   * 11    10   0.90 NO
   * 105   100  0.95 YES
   * @returns {boolean}
   */
  get isSquarish () {
    if (this.isSquare) {
      return true
    }

    let ratio = 0

    if (this.h > this.w) {
      ratio = this.w / this.h
    }

    if (this.h < this.w) {
      ratio = this.h / this.w
    }

    return ratio >= 0.95
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  set (x1, y1, x2, y2) {
    this.x = x1
    this.y = y1

    this.right = x2
    this.bottom = y2
  }

  /**
   * @param {Rectangle} rect
   */
  setFromRect (rect) {
    this.set(rect.x1, rect.y1, rect.x2, rect.y)
  }

  /**
   * @param {number} value
   */
  deflateOnCenter (value) {
    this.set(this.x + value,
      this.y + value,
      this.right - value,
      this.bottom - value)
  }

  /**
   * @param {number} value
   */
  inflateOnCenter (value) {
    this.set(this.x - value,
      this.y - value,
      this.right + value,
      this.bottom + value)
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate (x, y) {
    this.x += x
    this.right += x

    this.y += y
    this.bottom += y
  }

  /**
   * @param {Rectangle} rectToVerify
   * @returns {boolean}
   */
  isSame (rectToVerify) {
    return this.x1 === rectToVerify.x1 && this.y1 === rectToVerify.y1 && this.width === rectToVerify.width && this.height === rectToVerify.height
  }

  /**
   * @returns {string}
   */
  toString () {
    return `x${this.x} y${this.y} w${this.w} h${this.h}`
  }
}

/**
 * @property {number} x - the X coordinate
 * @property {number} y - the Y coordinate
 */
export class Point {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}
