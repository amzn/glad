import chalk from 'chalk'

/**
 * Console output helper class for centralized control of console outputs
 */
export class ConsoleOutput {
  constructor (options = {}) {
    this.options = {
      debug: options.debug || false,
      silent: options.silent || false,
      ...options
    }
  }

  /**
   * Log debug message
   * @param {string} message
   */
  debug (message) {
    if (this.options.debug) {
      console.log(message)
    }
  }

  /**
   * Log error message
   * @param {string} message
   */
  error (message) {
    console.error(chalk.red(message))
  }

  /**
   * Log info message
   * @param {string} message
   */
  info (message) {
    if (!this.options.silent) {
      console.info(chalk.blue(message))
    }
  }

  /**
   * Log regular message
   * @param {string} message
   */
  log (message) {
    if (!this.options.silent) {
      console.log(message)
    }
  }

  /**
   * Log green message (for success/file output)
   * @param {string} message
   */
  success (message) {
    if (!this.options.silent) {
      console.info(chalk.green(message))
    }
  }

  /**
   * End a timer
   * @param {string} label
   */
  timeEnd (label) {
    if (!this.options.silent) {
      console.timeEnd(chalk.gray(label))
    }
  }

  /**
   * Start a timer
   * @param {string} label
   */
  timeStart (label) {
    if (!this.options.silent) {
      console.time(chalk.gray(label))
    }
  }

  /**
   * Log blue bright message (for titles)
   * @param {string} message
   */
  title (message) {
    if (!this.options.silent) {
      console.info(chalk.cyanBright(chalk.bold(message)))
    }
  }

  /**
   * Log warning message
   * @param {string} message
   */
  warning (message) {
    if (!this.options.silent) {
      console.warn(chalk.yellow(message))
    }
  }
}

// Default instance
export const consoleOutput = new ConsoleOutput()
