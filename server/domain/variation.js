'use strict';

const formatVariation = variation => {
  return {
    ...variation,
    name: variation.name || null,
  };
};

module.exports = { formatVariation };
