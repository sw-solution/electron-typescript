import { App } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function loadCameras(app: App | null) {
  const camerasRootPath = path.resolve(app?.getAppPath(), '../cameras');

  const moduleIconPath = 'module-icon.png';
  const moduleConfigPath = 'module.json';

  const modules = await Promise.all(
    fs
      .readdirSync(camerasRootPath)
      .filter(
        (name) =>
          fs.lstatSync(path.join(camerasRootPath, name)).isDirectory() &&
          fs.existsSync(path.join(camerasRootPath, name, moduleIconPath)) &&
          fs.existsSync(path.join(camerasRootPath, name, moduleConfigPath))
      )
      .map(async (name) => {
        try {
          const config = JSON.parse(
            fs
              .readFileSync(path.join(camerasRootPath, name, moduleConfigPath))
              .toString()
          );

          return {
            module: `${config.module_camera_exif_make} ${config.module_camera_model}`,
            name,
          };
        } catch (e) {
          return {
            module: name,
            name,
          };
        }
      })
  );
  const cameras = await Promise.all(
    modules.map((m) => {
      return {
        image: fs
          .readFileSync(path.resolve(camerasRootPath, m.name, moduleIconPath))
          .toString('base64'),
        name: m.module,
        key: m.name,
      };
    })
  );
  return cameras;
}
