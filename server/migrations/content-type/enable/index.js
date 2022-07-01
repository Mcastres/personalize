'use strict';

const { getService } = require('../../../utils');
const { DEFAULT_VARIATION } = require('../../../constants');

// if Personalization enabled set default variation
module.exports = async ({ oldContentTypes, contentTypes }) => {
  const { isPersonalizedContentType } = getService('content-types');
  const { getDefaultVariation } = getService('variations');

  if (!oldContentTypes) {
    return;
  }

  for (const uid in contentTypes) {
    if (!oldContentTypes[uid]) {
      continue;
    }

    const oldContentType = oldContentTypes[uid];
    const contentType = contentTypes[uid];

    if (!isPersonalizedContentType(oldContentType) && isPersonalizedContentType(contentType)) {
      const defaultVariation = (await getDefaultVariation()) || DEFAULT_VARIATION.slug;

      await strapi.db
        .queryBuilder(uid)
        .update({ variation: defaultVariation })
        .where({ variation: null })
        .execute();
    }
  }
};
