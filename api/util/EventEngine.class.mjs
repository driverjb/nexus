import { EventEmitter } from 'events';

class EventEngine {
  /** @type {EventEmitter} */
  #e;
  constructor() {
    this.#e = new EventEmitter();
  }
  userLoggedIn(user) {
    this.#e.emit('user:login', user);
  }
  onUserLoggedIn(handler) {
    this.#e.on('user:login', handler);
  }
  userCreated(user) {
    this.#e.emit('user:created', user);
  }
  onUserCreated(handler) {
    this.#e.on('user:created', handler);
  }
}

export default new EventEngine();
