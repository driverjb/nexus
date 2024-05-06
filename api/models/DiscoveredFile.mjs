import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config.mjs';
import * as schema from '../../common/schema/media.mjs';
import db from '../util/db.mjs';
import getLogger from '../util/log.mjs';

const sql = schema.sql(db);
const log = getLogger('model:DiscoveredFile');

export class DiscoveredFile {
  #hash;
  #srcPath;
  constructor(srcPath) {
    this.#hash = crypto.createHash('md5').update(fs.readFileSync(srcPath)).digest('hex');
    this.#srcPath = srcPath;
    if (this.isDuplicate) this.#handleDuplicate();
    else this.#handleNew();
  }
  get hash() {
    return this.#hash;
  }
  get extension() {
    return path.extname(this.#srcPath);
  }
  get fileName() {
    return `${path.basename(this.#srcPath)}${this.extension}`;
  }
  get newFileName() {
    return `${this.#hash}${this.extension}`.toLowerCase();
  }
  get isDuplicate() {
    const result = sql.get({ file_name: this.newFileName });
    if (result) return true;
    return false;
  }
  #handleDuplicate() {
    const existingFile = path.join(config.mediaStorageLocation, this.newFileName);
    const dupeFolder = path.join(config.mediaDuplicationStorageLocation, this.hash);
    fs.mkdirSync(dupeFolder, { recursive: true });
    fs.copyFileSync(existingFile, path.join(dupeFolder, this.newFileName));
    fs.renameSync(this.#srcPath, path.join(dupeFolder, this.fileName));
    log.warn('Duplicate file detected', {
      src: this.#srcPath,
      archivedFile: this.newFileName,
      inspect: dupeFolder
    });
  }
  #handleNew() {
    const dst = path.join(config.mediaStorageLocation, this.newFileName);
    fs.renameSync(this.#srcPath, dst);
    sql.insert({ file_name: this.newFileName });
    log.info('File archived', { src: this.#srcPath, dst });
  }
}
