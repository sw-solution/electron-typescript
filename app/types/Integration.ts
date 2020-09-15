export interface Module {
  logo: string;
  name: string;
  loginUrl: string;
}

export interface Integration {
  [key: string]: Module;
}
