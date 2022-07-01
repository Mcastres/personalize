'use strict';

const { reduce } = require('lodash/fp');
const { getService } = require('../utils');

const sendDidInitializeEvent = async () => {
  const { isPersonalizedContentType } = getService('content-types');

  const numberOfContentTypes = reduce(
    (sum, contentType) => (isPersonalizedContentType(contentType) ? sum + 1 : sum),
    0
  )(strapi.contentTypes);

  await strapi.telemetry.send('didInitializePersonalization', { numberOfContentTypes });
};

const sendDidUpdatePersonalizationVariationsEvent = async () => {
  const numberOfVariations = await getService('variations').count();

  await strapi.telemetry.send('didUpdatePersonalizationVariations', { numberOfVariation });
};

module.exports = () => ({
  sendDidInitializeEvent,
  sendDidUpdatePersonalizationVariationsEvent,
});
