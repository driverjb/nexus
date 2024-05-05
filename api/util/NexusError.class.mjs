class NexusError {
  /**
   *
   * @param {string|Error} base
   */
  constructor(base, code) {
    if (typeof base == 'string') base = new Error(base);
    this.code = code;
  }
  static notFound(message) {
    return new NexusError(message, 404);
  }
  static forbidden(message) {
    return new NexusError(message, 403);
  }
  static unauthorized(message) {
    return new NexusError(message, 401);
  }
  static badRequest(message) {
    return new NexusError(message, 400);
  }
  static serverError(message) {
    return new NexusError(message, 500);
  }
}

export default NexusError;
