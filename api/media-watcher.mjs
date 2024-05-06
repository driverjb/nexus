import chk from 'chokidar';
import config from './config.mjs';
import path from 'path';
import { DiscoveredFile } from './models/DiscoveredFile.mjs';

config.mediaFolders.forEach((folder) => {
  const watcher = chk.watch(path.resolve(folder), { persistent: true, awaitWriteFinish: true });
  watcher.on('add', (srcPath) => {
    new DiscoveredFile(srcPath);
  });
});
