'use strict';

const getCoreStore = () => {
  return strapi.store({ type: 'plugin', name: 'personalization' });
};

// retrieve a variation service
const getService = name => {
  return strapi.plugin('personalization').service(name);
};

module.exports = {
  getService,
  getCoreStore,
};
