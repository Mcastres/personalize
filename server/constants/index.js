'use strict';

const isoLocales = require('./iso-locales');

/**
 * Returns the default locale based either on env var or english
 * @returns {string}
 */
const getInitLocale = () => {
  return {
    slug: 'default',
    name: 'Default',
    isDefault: true
  };
};

const DEFAULT_LOCALE = getInitLocale();

module.exports = {
  isoLocales,
  DEFAULT_LOCALE,
  getInitLocale,
};
