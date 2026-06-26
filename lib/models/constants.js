export class Constants {
  static get ALIGN_CENTER () {
    return 'center'
  }

  static get ALIGN_LEFT () {
    return 'left'
  }

  static get ALIGN_RIGHT () {
    return 'right'
  }

  static get averageWidthOfTextCharacterInPx () {
    return 11
  }

  static get EDGES () {
    return 'edges'
  }

  static get EDGES_BOTH () {
    return 'both'
  }

  static get EDGES_FOLDER () {
    return 'folders'
  }

  static get EDGES_NODE () {
    return 'files'
  }

  static get LINES () {
    return 'lines'
  }

  static get LINES_ANGLE () {
    return 'angle'
  }

  static get LINES_CURVE () {
    return 'curve'
  }

  static get LINES_ELBOW () {
    return 'elbow'
  }

  static get LINES_HIDE () {
    return 'hide'
  }

  static get LINES_STRAIT () {
    return 'strait'
  }

  static get LINES_WARNINGS () {
    return 'warnings'
  }

  // space between leaves
  static get nodeGap () {
    return 4
  }

  // Leaves and containers minimum height size in PX
  static get nodeMinSizeHeight () {
    return 80
  }

  // Leaves and containers minimum width size in PX
  static get nodeMinSizeWidth () {
    return 300
  }

  static get numberOfPossibleCharactersToFitInNodeMinWidth () {
    return Constants.nodeMinSizeWidth / Constants.averageWidthOfTextCharacterInPx
  }

  static get padding () {
    return 35
  }

  static get paddingText () {
    return 10
  }

  static get pillOffset () {
    return 20
  }

  static get pillSize () {
    return 20
  }

  static get VIEW_GRID () {
    return 'grid'
  }

  static get VIEW_LAYERS () {
    return 'layers'
  }

  static get VIEW_POSTER () {
    return 'poster'
  }
}
