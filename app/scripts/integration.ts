import { App } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function loadIntegrations(app: App | null) {
  const integrationsRootPath = path.resolve(
    app?.getAppPath(),
    '../integrations'
  );

  const moduleIconPath = 'module-icon.png';
  const moduleConfigPath = 'module.json';

  const modules = fs
    .readdirSync(integrationsRootPath)
    .filter(
      (name) =>
        fs.lstatSync(path.join(integrationsRootPath, name)).isDirectory() &&
        fs.existsSync(
          path.join(integrationsRootPath, name, 'static', moduleIconPath)
        ) &&
        path.join(integrationsRootPath, name, moduleConfigPath)
    )
    .reduce(async (obj, m: string) => {
      const config = JSON.parse(
        fs
          .readFileSync(path.join(integrationsRootPath, m, moduleConfigPath))
          .toString()
      );

      const { params } = config.oauth;
      const queryString = Object.keys(params)
        .map((p: string) => `${p}=${process.env[params[p]]}`)
        .join('&');

      const settings = {
        name: config.name,
        loginUrl: `${config.oauth.baseUrl}&${queryString}`,
      };

      obj[m] = {
        logo: fs
          .readFileSync(
            path.resolve(integrationsRootPath, m, 'static', moduleIconPath)
          )
          .toString('base64'),
        ...settings,
      };
      return obj;
    }, {});
  return modules;
}
