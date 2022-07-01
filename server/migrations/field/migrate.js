'use strict';

const { pick, prop } = require('lodash/fp');
const { getService } = require('../../utils');
const { shouldBeProcessed, getUpdatesInfo, getSortedVariations } = require('./utils');

const BATCH_SIZE = 1000;

const migrateBatch = async (entries, { model, attributesToMigrate }, { transacting }) => {
  const { copyNonPersonalizedAttributes } = getService('content-types');

  const updatePromises = entries.map(entity => {
    const updateValues = pick(attributesToMigrate, copyNonPersonalizedAttributes(model, entity));
    const entriesIdsToUpdate = entity.personalizations.map(prop('id'));
    return Promise.all(
      entriesIdsToUpdate.map(id =>
        strapi.query(model.uid).update({ id }, updateValues, { transacting })
      )
    );
  });

  await Promise.all(updatePromises);
};

const migrate = async ({ model, attributesToMigrate }, { migrateFn, transacting } = {}) => {
  const variations = await getSortedVariations({ transacting });
  const processedVariationSlugs = [];
  for (const variation of variations) {
    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const entries = await strapi
        .query(model.uid)
        .find({ variation, _start: offset, _limit: BATCH_SIZE }, null, { transacting });
      const entriesToProcess = entries.filter(shouldBeProcessed(processedVariationSlugs));

      if (migrateFn) {
        const updatesInfo = getUpdatesInfo({ entriesToProcess, attributesToMigrate });
        await migrateFn({ updatesInfo, model }, { transacting });
      } else {
        await migrateBatch(entriesToProcess, { model, attributesToMigrate }, { transacting });
      }

      if (entries.length < BATCH_SIZE) {
        break;
      }
      offset += BATCH_SIZE;
    }
    processedVariationSlugs.push(variation);
  }
};

module.exports = {
  migrate,
};
