import { App } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function loadCameras(app: App | null) {
  const camerasRootPath = path.resolve(app?.getAppPath(), '../cameras');

  const moduleIconPath = 'static/module-icon.png';
  const moduleConfigPath = 'module.config';

  const modules = fs
    .readdirSync(camerasRootPath)
    .filter(
      (name) =>
        fs.lstatSync(path.join(camerasRootPath, name)).isDirectory() &&
        fs.existsSync(path.join(camerasRootPath, name, moduleIconPath)) &&
        fs.existsSync(path.join(camerasRootPath, name, moduleConfigPath))
    )
    .map((name) => {
      const config = fs
        .readFileSync(path.join(camerasRootPath, name, moduleConfigPath))
        .toString();
      const result = config.match(/module_name: "(.*)"/);
      if (result)
        return {
          module: result[1],
          name,
        };
      return {
        module: name,
        name,
      };
    });
  const cameras = modules.map((m) => {
    return {
      image: fs
        .readFileSync(path.resolve(camerasRootPath, m.name, moduleIconPath))
        .toString('base64'),
      name: m.module,
      key: m.name,
    };
  });
  return cameras;
}
