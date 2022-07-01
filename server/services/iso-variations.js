'use strict';

const { isoVariations } = require('../constants');

const getIsoVariations = () => isoVariations;

module.exports = () => ({
  getIsoVariations,
});
