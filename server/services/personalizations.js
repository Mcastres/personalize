'use strict';

const { prop, isNil, isEmpty } = require('lodash/fp');

const { getService } = require('../utils');

/**
 * Adds the default variation to an object if it isn't defined yet
 * @param {Object} data a data object before being persisted into db
 */
const assignDefaultVariation = async data => {
  const { getDefaultVariation } = getService('variations');

  if (isNil(data.variation)) {
    data.variation = await getDefaultVariation();
  }
};

/**
 * Synchronize related personalizations from a root one
 * @param {Object} entry entry to update
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const syncPersonalizations = async (entry, { model }) => {
  if (Array.isArray(entry.personalizations)) {
    const newPersonalizations = [entry.id, ...entry.personalizations.map(prop('id'))];

    const updatePersonalization = id => {
      const personalizations = newPersonalizations.filter(personalizationId => personalizationId !== id);

      return strapi.query(model.uid).update({ where: { id }, data: { personalizations } });
    };

    await Promise.all(entry.personalizations.map(({ id }) => updatePersonalization(id)));
  }
};

/**
 * Update non personalized fields of all the related personalizations of an entry with the entry values
 * @param {Object} entry entry to update
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const syncNonPersonalizedAttributes = async (entry, { model }) => {
  const { copyNonPersonalizedAttributes } = getService('content-types');

  if (Array.isArray(entry.personalizations)) {
    const nonPersonalizedAttributes = copyNonPersonalizedAttributes(
      model,
      entry
    );

    if (isEmpty(nonPersonalizedAttributes)) {
      return;
    }

    const updatePersonalization = id => {
      return strapi.entityService.update(model.uid, id, { data: nonPersonalizedAttributes });
    };

    await Promise.all(entry.personalizations.map(({ id }) => updatePersonalization(id)));
  }
};

module.exports = () => ({
  assignDefaultVariation,
  syncPersonalizations,
  syncNonPersonalizedAttributes,
});
