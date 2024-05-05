import { config } from '../common/schema/config.mjs';
import { resolve } from 'path';
import fs from 'fs';
import YAML from 'yaml';

const filePath = resolve('nexus.yaml');

let fileData = {};

if (fs.existsSync(filePath)) fileData = YAML.parse(fs.readFileSync(filePath).toString());

const conf = config.parse(fileData);

if (JSON.stringify(conf) !== JSON.stringify(fileData))
  fs.writeFileSync(filePath, YAML.stringify(conf));

export default conf;
