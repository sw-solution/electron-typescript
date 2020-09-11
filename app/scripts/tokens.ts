import Store from './utils/store';

const tokenStore = new Store({
  configName: 'tokens',
  defaults: {},
});

export default tokenStore;
