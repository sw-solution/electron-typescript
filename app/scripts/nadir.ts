import { App } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function loadDefaultNadir(app: App | null) {
  const nadirRootPath = path.resolve(app?.getAppPath(), '../static/nadir/');

  const files = fs
    .readdirSync(nadirRootPath)
    .filter(
      (name) =>
        fs.lstatSync(path.join(nadirRootPath, name)).isFile() &&
        fs.existsSync(path.join(nadirRootPath, name)) &&
        name.endsWith('.png')
    );
  const nadirs = files.map((m) => {
    return {
      image: fs.readFileSync(path.resolve(nadirRootPath, m)).toString('base64'),
      url: path.resolve(nadirRootPath, m),
    };
  });
  return nadirs;
}
