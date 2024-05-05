import chk from 'chokidar';
import config from './config.mjs';
import path from 'path';
import fs from 'fs';
import db from './util/db.mjs';
import crypto from 'crypto';
import * as schema from '../common/schema/media.mjs';
import getLogger from './util/log.mjs';

const sql = schema.sql(db);
const log = getLogger('module:media-watcher');

function storagePath(name) {
  return path.join(config.mediaStorageLocation, name);
}

if (!fs.existsSync(config.mediaStorageLocation))
  fs.mkdirSync(config.mediaStorageLocation, { recursive: true });

config.mediaFolders.forEach((folder) => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

function handleNew(srcPath, file_name) {
  const destPath = storagePath(file_name);
  fs.renameSync(srcPath, destPath);
  log.info('File archived', { srcPath, destPath });
  sql.insert.run({ file_name });
}

function handleDuplicate(srcPath, hash, fileName) {
  const dupePath = path.join(config.mediaDuplicationStorageLocation, hash);
  fs.mkdirSync(dupePath, { recursive: true });
  const originalName = path.basename(srcPath);
  fs.renameSync(srcPath, path.join(dupePath, originalName.toLowerCase()));
  const existingFile = storagePath(fileName);
  fs.copyFileSync(existingFile, path.join(dupePath, path.basename(existingFile)));
  log.warn('Duplicate entry created for review', { dupePath });
}

config.mediaFolders.forEach((folder) => {
  const watcher = chk.watch(path.resolve(folder), { persistent: true, awaitWriteFinish: true });
  watcher.on('add', (srcPath) => {
    const extension = path.extname(srcPath).toLowerCase();
    const hash = crypto.createHash('md5').update(fs.readFileSync(srcPath)).digest('hex');
    //TODO check database for existing hash
    const file_name = `${hash}${extension}`;
    const data = sql.get.by.file_name.get({ file_name });
    if (data) handleDuplicate(srcPath, hash, data.file_name);
    else handleNew(srcPath, file_name);
  });
});
