'use strict';

const { isNil } = require('lodash/fp');
const { DEFAULT_VARIATION } = require('../constants');
const { getService } = require('../utils');

const { getCoreStore } = require('../utils');

const find = params => strapi.query('plugin::personalization.variation').findMany({ where: params });

const findById = id => strapi.query('plugin::personalization.variation').findOne({ where: { id } });

const findBySlug = slug => strapi.query('plugin::personalization.variation').findOne({ where: { slug } });

const count = params => strapi.query('plugin::personalization.variation').count({ where: params });

const create = async variation => {
  const result = await strapi.query('plugin::personalization.variation').create({ data: variation });

  // getService('metrics').sendDidUpdatePersonalizationVariationsEvent();

  return result;
};

const update = async (params, updates) => {
  const result = await strapi.query('plugin::personalization.variation').update({ where: params, data: updates });

  // getService('metrics').sendDidUpdatePersonalizationVariationsEvent();

  return result;
};

const deleteFn = async ({ id }) => {
  const variationToDelete = await findById(id);

  if (variationToDelete) {
    await deleteAllPersonalizedEntriesFor({ variation: variationToDelete.slug });
    const result = await strapi.query('plugin::personalization.variation').delete({ where: { id } });

    // getService('metrics').sendDidUpdatePersonalizationVariationsEvent();

    return result;
  }

  return variationToDelete;
};

const setDefaultVariation = ({ slug }) => getCoreStore().set({ key: 'default_variation', value: slug });

const getDefaultVariation = () => getCoreStore().get({ key: 'default_variation' });

const setIsDefault = async variations => {
  if (isNil(variations)) {
    return variations;
  }

  const actualDefault = await getDefaultVariation();

  if (Array.isArray(variations)) {
    return variations.map(variation => ({ ...variation, isDefault: actualDefault === variation.slug }));
  } else {
    // single variation
    return { ...variations, isDefault: actualDefault === variations.slug };
  }
};

const initDefaultVariation = async () => {
  const existingVariationsNb = await strapi.query('plugin::personalization.variation').count();
  if (existingVariationsNb === 0) {
    await create(DEFAULT_VARIATION);
    await setDefaultVariation({ slug: DEFAULT_VARIATION.slug });
  }
};

const deleteAllPersonalizedEntriesFor = async ({ variation }) => {
  const { isPersonalizedContentType } = getService('content-types');

  const personalizedModels = Object.values(strapi.contentTypes).filter(isPersonalizedContentType);

  for (const model of personalizedModels) {
    // FIXME: delete many content & their associations
    await strapi.query(model.uid).deleteMany({ where: { variation } });
  }
};

module.exports = () => ({
  find,
  findById,
  findBySlug,
  create,
  update,
  count,
  setDefaultVariation,
  getDefaultVariation,
  setIsDefault,
  delete: deleteFn,
  initDefaultVariation,
});
