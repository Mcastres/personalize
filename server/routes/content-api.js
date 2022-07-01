'use strict';

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/variations',
      handler: 'variations.listVariations',
    },
  ],
};
