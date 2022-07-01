'use strict';

const { pick, uniq, prop, getOr, flatten, pipe, map } = require('lodash/fp');
const { contentTypes: contentTypesUtils } = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;
const { getService } = require('../utils');
const { validateGetNonPersonalizedAttributesInput } = require('../validation/content-types');

const { PUBLISHED_AT_ATTRIBUTE } = contentTypesUtils.constants;

const getVariationsProperty = getOr([], 'properties.variations');
const getFieldsProperty = prop('properties.fields');

const getFirstLevelPath = map(path => path.split('.')[0]);

module.exports = {
  async getNonPersonalizedAttributes(ctx) {
    const { user } = ctx.state;
    const { model, id, variation } = ctx.request.body;

    await validateGetNonPersonalizedAttributesInput({ model, id, variation });

    const {
      copyNonPersonalizedAttributes,
      isPersonalizedContentType,
      getNestedPopulateOfNonPersonalizedAttributes,
    } = getService('content-types');
    const { READ_ACTION, CREATE_ACTION } = strapi.admin.services.constants;

    const modelDef = strapi.contentType(model);
    const attributesToPopulate = getNestedPopulateOfNonPersonalizedAttributes(model);

    if (!isPersonalizedContentType(modelDef)) {
      throw new ApplicationError('model.not.personalized');
    }

    let params = modelDef.kind === 'singleType' ? {} : { id };

    const entity = await strapi
      .query(model)
      .findOne({ where: params, populate: [...attributesToPopulate, 'personalizations'] });

    if (!entity) {
      return ctx.notFound();
    }

    const permissions = await strapi.admin.services.permission.findMany({
      where: {
        action: [READ_ACTION, CREATE_ACTION],
        subject: model,
        role: {
          id: user.roles.map(prop('id')),
        },
      },
    });

    const variationPermissions = permissions
      .filter(perm => getVariationsProperty(perm).includes(variation))
      .map(getFieldsProperty);

    const permittedFields = pipe(flatten, getFirstLevelPath, uniq)(variationPermissions);

    const nonPersonalizedFields = copyNonPersonalizedAttributes(modelDef, entity);
    const sanitizedNonPersonalizedFields = pick(
      permittedFields,
      nonPersonalizedFields
    );

    ctx.body = {
      nonPersonalizedFields: sanitizedNonPersonalizedFields,
      personalizations: entity.personalizations.concat(
        pick(["id", "variation", PUBLISHED_AT_ATTRIBUTE], entity)
      ),
    };
  },
};
