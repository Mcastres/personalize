'use strict';

const variations = require('./variations');
const contentTypes = require('./content-types');
const isoVariations = require('./iso-variations');

module.exports = {
  variations,
  'iso-variations': isoVariations,
  'content-types': contentTypes,
};
