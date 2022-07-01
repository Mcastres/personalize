'use strict';

const { difference, keys, intersection, isEmpty } = require('lodash/fp');
const { getService } = require('../../utils');

const migrateForBookshelf = require('./migrate-for-bookshelf');

/*
 ->
 ->
*/

// Migration when personalization is disabled on a field of a content-type that have Personalization enabled
const after = async ({ model, definition, previousDefinition, ORM }) => {
  const { isPersonalizedContentType, getPersonalizedAttributes } = getService('content-types');

  if (!isPersonalizedContentType(model) || !isPersonalizedContentType(previousDefinition)) {
    return;
  }

  const personalizedAttributes = getPersonalizedAttributes(definition);
  const prevPersonalizedAttributes = getPersonalizedAttributes(previousDefinition);
  const attributesDisabled = difference(prevPersonalizedAttributes, personalizedAttributes);
  const attributesToMigrate = intersection(keys(definition.attributes), attributesDisabled);

  if (isEmpty(attributesToMigrate)) {
    return;
  }

  await migrateForBookshelf({ ORM, model, attributesToMigrate });
};

const before = () => {};

module.exports = {
  before,
  after,
};
