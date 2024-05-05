function makeWriter(namespace) {
  return function write(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let out = `${timestamp} ${namespace} ${level} ${message}`;
    if (data) out += ` ${JSON.stringify(data, null, 2)}`.replaceAll('\n', '\n  ');
    console.log(out);
  };
}

export default function (namespace) {
  const write = makeWriter(namespace);
  return {
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    trace: (message, data = null) => write('trace', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    debug: (message, data = null) => write('debug', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    notice: (message, data = null) => write('notice', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    info: (message, data = null) => write('info', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    warn: (message, data = null) => write('warn', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    error: (message, data = null) => write('error', message, data),
    /**
     *
     * @param {string} message
     * @param {any} data
     * @returns
     */
    fatal: (message, data = null) => write('fatal', message, data)
  };
}
