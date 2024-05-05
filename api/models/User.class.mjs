import db from '../util/db.mjs';
import NexusError from '../util/NexusError.class.mjs';
import getLogger from '../util/log.mjs';
import * as schema from '../../common/schema/user.mjs';
import * as secSchema from '../../common/schema/security.mjs';
import crypto from 'crypto';
import { z } from 'zod';
import ee from '../util/EventEngine.class.mjs';

const log = getLogger('model:User');

const sql = schema.sql(db);
const sqlSec = secSchema.sql(db);
const stringOrNull = z.string().nullable().default(null);
const stringEmail = z.string().email();

class User {
  #json;
  constructor(data) {
    this.#json = schema.user.parse(data);
  }
  get json() {
    return this.#json;
  }
  /**
   * Change the last name of the user
   * @param {string|null} newLastName
   */
  set lastName(newLastName) {
    this.#json.last_name = stringOrNull.parse(newLastName);
    this.update();
  }
  /**
   * Change the first name of the user
   * @param {string|null} newFirstName
   */
  set firstName(newFirstName) {
    this.#json.first_name = stringOrNull.parse(newFirstName);
    this.update();
  }
  /**
   * Update the user's profile image
   * @param {string|null} newProfileImage
   */
  set profileImage(newProfileImage) {
    this.#json.profile_image = stringOrNull.parse(newProfileImage);
    this.update();
  }
  /**
   * Update the user's email
   * @param {string} newEmail
   */
  set email(newEmail) {
    this.#json.email = stringEmail.parse(newEmail);
    this.update();
  }
  authenticate(password) {
    const { hash, salt } = secSchema.security.parse(
      sqlSec.get.by.user_id.get({ user_id: this.#json.user_id })
    );
    const success = hash === User.#createHash(salt, password);
    if (success) ee.userLoggedIn(this);
    return success;
  }
  /**
   * Save the current state of the user object to the database
   */
  update() {
    sql.update.run(this.#json);
    log.info(`Updated user ${this.#json.email}`);
  }
  /**
   * Update the user's password denoted by the reset key
   * @param {string} reset
   * @param {string} newPassword
   */
  static changePassword(reset, newPassword) {
    const security = secSchema.security.parse(sqlSec.get.by.reset.get({ reset }));
    security.salt = User.#createSalt();
    security.reset = null;
    security.hash = User.#createHash(security.salt, newPassword);
    sqlSec.update.run(security);
    log.info(`User password modified for ${security.user_id}`);
  }
  /**
   * Find a user by user_id or email
   * @param {{user_id?: number, email?: string}} opt
   * @returns
   */
  static get(opt = { user_id, email }) {
    let data = null;
    const { user_id, email } = opt;
    if (email) data = sql.get.by.email.get(opt);
    else if (user_id) data = sql.get.by.user_id.get(opt);
    else throw NexusError.badRequest(`Must provide user_id or email to find a user`);
    log.debug(`Found user ${data.email}`);
    return new User(data);
  }
  /**
   * Create a new user entry
   * @param {{email: string, last_name?: string, first_name?: string, profile_image?: string}} opt
   * @returns
   */
  static create(opt = { email, last_name, first_name, profile_image }) {
    const user = schema.createUser.parse(opt);
    const { lastInsertRowid } = sql.insert.run(user);
    user.user_id = lastInsertRowid;
    const security = secSchema.security.parse({ ...user, reset: User.#createReset() });
    sqlSec.insert.run({ ...user, ...security });
    ee.userCreated({ user, security });
    log.info(`Created user ${user.email}`);
    return new User(user);
  }
  /**
   * Create a password reset link addendum
   * @returns
   */
  static #createReset() {
    return crypto.createHash('md5').update(crypto.randomBytes(100000000)).digest('hex');
  }
  /**
   * Create a salt value
   * @returns
   */
  static #createSalt() {
    return crypto.createHash('sha256').update(crypto.randomBytes(100000000)).digest('hex');
  }
  /**
   * Create a password hash
   * @param {string} salt
   * @param {string} password
   */
  static #createHash(salt, password) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  }
}

export default User;
