'use strict';

/**
 * Returns the default variation based either on env var or english
 * @returns {string}
 */
const getInitVariation = () => {
  return {
    slug: 'default',
    name: 'Default',
    isDefault: true
  };
};

const DEFAULT_VARIATION = getInitVariation();

module.exports = {
  DEFAULT_VARIATION,
  getInitVariation,
};
