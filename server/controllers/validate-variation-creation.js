'use strict';

const { get } = require('lodash/fp');
const { ApplicationError } = require('@strapi/utils').errors;
const { getService } = require('../utils');

const validateVariationCreation = async (ctx, next) => {
  const { model } = ctx.params;
  const { query, body } = ctx.request;

  const {
    getValidVariation,
    getNewPersonalizationsFrom,
    isPersonalizedContentType,
    getAndValidateRelatedEntity,
    fillNonPersonalizedAttributes,
  } = getService("content-types");

  const modelDef = strapi.getModel(model);

  if (!isPersonalizedContentType(modelDef)) {
    return next();
  }

  const variation = get("plugins.personalization.variation", query);
  const locale = get("plugins.i18n.locale", query);

  const relatedEntityId = get("plugins.personalization.relatedEntityId", query);
  
  // cleanup to avoid creating duplicates in singletypes
  ctx.request.query = {};

  let entityVariation;
  try {
    entityVariation = await getValidVariation(variation);
  } catch (e) {
    console.log(e);
    throw new ApplicationError("This variation doesn't exist");
  }

  body.variation = entityVariation;

  // If i18n is activated, we send the locale param
  if (locale) {
    body.locale = locale;
  }

  if (modelDef.kind === "singleType") {
    const entity = await strapi.entityService.findMany(modelDef.uid, {
      variation: entityVariation,
    });

    ctx.request.query.variation = body.variation;

    // updating
    if (entity) {
      return next();
    }
  }

  let relatedEntity;
  try {
    relatedEntity = await getAndValidateRelatedEntity(
      relatedEntityId,
      model,
      entityVariation
    );
  } catch (e) {
    throw new ApplicationError(
      "The related entity doesn't exist or the entity already exists in this variation"
    );
  }

  fillNonPersonalizedAttributes(body, relatedEntity, { model });
  const personalizations = await getNewPersonalizationsFrom(relatedEntity);
  body.personalizations = personalizations;

  return next();
};

module.exports = validateVariationCreation;
