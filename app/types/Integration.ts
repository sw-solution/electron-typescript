export interface Module {
  logo: string;
  name: string;
  oauth: {
    params: any;
    baseUrl: string;
  };
}

export interface Integration {
  [key: string]: Module;
}
