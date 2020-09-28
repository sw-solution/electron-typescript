export interface Module {
  logo: string;
  name: string;
  loginUrl: string;
  order: number;
}

export interface Integration {
  [key: string]: Module;
}
