import { App } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function loadCameras(app: App | null) {
  const camerasRootPath = path.resolve(app?.getAppPath(), '../cameras');

  const moduleIconPath = 'static/module-icon.png';

  const modules = fs
    .readdirSync(camerasRootPath)
    .filter(
      (name) =>
        fs.lstatSync(path.join(camerasRootPath, name)).isDirectory() &&
        fs.existsSync(path.join(camerasRootPath, name, moduleIconPath))
    );
  const cameras = modules.map((m) => {
    return {
      image: fs
        .readFileSync(path.resolve(camerasRootPath, m, moduleIconPath))
        .toString('base64'),
      name: m,
    };
  });
  return cameras;
}
