'use strict';

const { getService } = require('../utils');

module.exports = {
  listIsoVariations(ctx) {
    const isoVariationsService = getService('iso-variations');

    ctx.body = isoVariationsService.getIsoVariations();
  },
};
