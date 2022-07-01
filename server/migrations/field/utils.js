'use strict';

const { isScalarAttribute } = require('@strapi/utils').contentTypes;
const { pick, prop, map, intersection, isEmpty, orderBy, pipe, every } = require('lodash/fp');
const { getService } = require('../../utils');

const shouldBeProcessed = processedVariationSlugs => entry => {
  return (
    entry.personalizations.length > 0 &&
    intersection(entry.personalizations.map(prop('variation')), processedVariationSlugs).length === 0
  );
};

const getUpdatesInfo = ({ entriesToProcess, attributesToMigrate }) => {
  const updates = [];
  for (const entry of entriesToProcess) {
    const attributesValues = pick(attributesToMigrate, entry);
    const entriesIdsToUpdate = entry.personalizations.map(prop('id'));
    updates.push({ entriesIdsToUpdate, attributesValues });
  }
  return updates;
};

const getSortedVariations = async ({ transacting } = {}) => {
  const variationService = getService('variations');

  let defaultVariation;
  try {
    const storeRes = await strapi
      .query('strapi::core-store')
      .findOne({ key: 'plugin_personalization_default_variation' }, null, { transacting });
    defaultVariation = JSON.parse(storeRes.value);
  } catch (e) {
    throw new Error("Could not migrate because the default variation doesn't exist");
  }

  const variations = await variationService.find({}, null, { transacting });
  if (isEmpty(variations)) {
    throw new Error('Could not migrate because no variation exist');
  }

  // Put default variation first
  return pipe(
    map(variation => ({ slug: variation.slug, isDefault: variation.slug === defaultVariation })),
    orderBy(['isDefault', 'slug'], ['desc', 'asc']),
    map(prop('slug'))
  )(variations);
};

const areScalarAttributesOnly = ({ model, attributes }) =>
  pipe(pick(attributes), every(isScalarAttribute))(model.attributes);

module.exports = {
  shouldBeProcessed,
  getUpdatesInfo,
  getSortedVariations,
  areScalarAttributesOnly,
};
