'use strict';

const { getService } = require('../../../utils');
const { DEFAULT_VARIATION } = require('../../../constants');

// Disable personalization on CT -> Delete all entities that are not in the default variation
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

    // if Personalization is disabled remove non default variations before sync
    if (isPersonalizedContentType(oldContentType) && !isPersonalizedContentType(contentType)) {
      const defaultVariation = (await getDefaultVariation()) || DEFAULT_VARIATION.slug;

      await strapi.db
        .queryBuilder(uid)
        .delete()
        .where({ variation: { $ne: defaultVariation } })
        .execute();
    }
  }
};
