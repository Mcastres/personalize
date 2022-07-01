'use strict';

const { isEmpty } = require('lodash/fp');

const { getService } = require('../../utils');

/**
 * Handler for the permissions layout (sections builder)
 * Adds the variations property to the subjects
 * @param {Action} action
 * @param {ContentTypesSection} section
 * @return {Promise<void>}
 */
const variationsPropertyHandler = async ({ action, section }) => {
  const { actionProvider } = strapi.admin.services.permission;

  const variations = await getService('variations').find();

  // Do not add the variations property if there is none registered
  if (isEmpty(variations)) {
    return;
  }

  for (const subject of section.subjects) {
    const applies = await actionProvider.appliesToProperty('variations', action.actionId, subject.uid);
    const hasVariationsProperty = subject.properties.find(property => property.value === 'variations');

    if (applies && !hasVariationsProperty) {
      subject.properties.push({
        label: 'Variations',
        value: 'variations',
        children: variations.map(({ name, slug }) => ({ label: name || slug, value: slug })),
      });
    }
  }
};

const registerVariationsPropertyHandler = () => {
  const { sectionsBuilder } = strapi.admin.services.permission;

  sectionsBuilder.addHandler('singleTypes', variationsPropertyHandler);
  sectionsBuilder.addHandler('collectionTypes', variationsPropertyHandler);
};

module.exports = {
  variationsPropertyHandler,
  registerVariationsPropertyHandler,
};
