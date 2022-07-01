'use strict';

const _ = require('lodash');
const { pick, pipe, has, prop, isNil, cloneDeep, isArray, difference } = require('lodash/fp');
const {
  isRelationalAttribute,
  getVisibleAttributes,
  isTypedAttribute,
  getScalarAttributes,
} = require('@strapi/utils').contentTypes;
const { ApplicationError } = require('@strapi/utils').errors;
const { getService } = require('../utils');

const hasPersonalizedOption = modelOrAttribute => {
  return prop('pluginOptions.personalization.personalized', modelOrAttribute) === true;
};

const getValidVariation = async variation => {
  const variationsService = getService('variations');

  if (isNil(variation)) {
    return variationsService.getDefaultVariation();
  }

  const foundVariation = await variationsService.findBySlug(variation);
  if (!foundVariation) {
    throw new ApplicationError('Variation not found');
  }

  return variation;
};

/**
 * Get the related entity used for entity creation
 * @param {Object} relatedEntity related entity
 * @returns {id[]} related entity
 */
const getNewPersonalizationsFrom = async relatedEntity => {
  if (relatedEntity) {
    return [relatedEntity.id, ...relatedEntity.personalizations.map(prop('id'))];
  }

  return [];
};

/**
 * Get the related entity used for entity creation
 * @param {id} relatedEntityId related entity id
 * @param {string} model corresponding model
 * @param {string} variation variation of the entity to create
 * @returns {Object} related entity
 */
const getAndValidateRelatedEntity = async (relatedEntityId, model, variation) => {
  const { kind } = strapi.getModel(model);
  let relatedEntity;

  if (kind === 'singleType') {
    relatedEntity = await strapi.query(model).findOne({ populate: ['personalizations'] });
  } else if (relatedEntityId) {
    relatedEntity = await strapi
      .query(model)
      .findOne({ where: { id: relatedEntityId }, populate: ['personalizations'] });
  }

  if (relatedEntityId && !relatedEntity) {
    throw new ApplicationError("The related entity doesn't exist");
  }

  if (
    relatedEntity &&
    (relatedEntity.variation === variation ||
      relatedEntity.personalizations.map(prop('variation')).includes(variation))
  ) {
    throw new ApplicationError('The entity already exists in this variation');
  }

  return relatedEntity;
};

/**
 * Returns whether an attribute is personalized or not
 * @param {*} attribute
 * @returns
 */
const isPersonalizedAttribute = attribute => {
  return (
    hasPersonalizedOption(attribute) ||
    isRelationalAttribute(attribute) ||
    isTypedAttribute(attribute, 'uid')
  );
};

/**
 * Returns whether a model is personalized or not
 * @param {*} model
 * @returns
 */
const isPersonalizedContentType = model => {
  return hasPersonalizedOption(model);
};

/**
 * Returns the list of attribute names that are not personalized
 * @param {object} model
 * @returns {string[]}
 */
const getNonPersonalizedAttributes = model => {
  return getVisibleAttributes(model).filter(
    attrName => !isPersonalizedAttribute(model.attributes[attrName])
  );
};

const removeId = value => {
  if (typeof value === 'object' && has('id', value)) {
    delete value.id;
  }
};

const removeIds = model => entry => removeIdsMut(model, cloneDeep(entry));

const removeIdsMut = (model, entry) => {
  if (isNil(entry)) {
    return entry;
  }

  removeId(entry);

  _.forEach(model.attributes, (attr, attrName) => {
    const value = entry[attrName];
    if (attr.type === 'dynamiczone' && isArray(value)) {
      value.forEach(compo => {
        if (has('__component', compo)) {
          const model = strapi.components[compo.__component];
          removeIdsMut(model, compo);
        }
      });
    } else if (attr.type === 'component') {
      const model = strapi.components[attr.component];
      if (isArray(value)) {
        value.forEach(compo => removeIdsMut(model, compo));
      } else {
        removeIdsMut(model, value);
      }
    }
  });

  return entry;
};

/**
 * Returns a copy of an entry picking only its non personalized attributes
 * @param {object} model
 * @param {object} entry
 * @returns {object}
 */
const copyNonPersonalizedAttributes = (model, entry) => {
  const nonPersonalizedAttributes = getNonPersonalizedAttributes(model);

  return pipe(pick(nonPersonalizedAttributes), removeIds(model))(entry);
};

/**
 * Returns the list of attribute names that are personalized
 * @param {object} model
 * @returns {string[]}
 */
const getPersonalizedAttributes = model => {
  return getVisibleAttributes(model).filter(attrName =>
    isPersonalizedAttribute(model.attributes[attrName])
  );
};

/**
 * Fill non personalized fields of an entry if there are nil
 * @param {Object} entry entry to fill
 * @param {Object} relatedEntry values used to fill
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const fillNonPersonalizedAttributes = (entry, relatedEntry, { model }) => {
  if (isNil(relatedEntry)) {
    return;
  }

  const modelDef = strapi.getModel(model);
  const relatedEntryCopy = copyNonPersonalizedAttributes(modelDef, relatedEntry);

  _.forEach(relatedEntryCopy, (value, field) => {
    if (isNil(entry[field])) {
      entry[field] = value;
    }
  });
};

/**
 * build the populate param to
 * @param {String} modelUID uid of the model, could be of a content-type or a component
 */
const getNestedPopulateOfNonPersonalizedAttributes = modelUID => {
  const schema = strapi.getModel(modelUID);
  const scalarAttributes = getScalarAttributes(schema);
  const nonPersonalizedAttributes = getNonPersonalizedAttributes(schema);
  const currentAttributesToPopulate = difference(nonPersonalizedAttributes, scalarAttributes);
  const attributesToPopulate = [...currentAttributesToPopulate];

  for (let attrName of currentAttributesToPopulate) {
    const attr = schema.attributes[attrName];
    if (attr.type === 'component') {
      const nestedPopulate = getNestedPopulateOfNonPersonalizedAttributes(attr.component).map(
        nestedAttr => `${attrName}.${nestedAttr}`
      );
      attributesToPopulate.push(...nestedPopulate);
    } else if (attr.type === 'dynamiczone') {
      attr.components.forEach(componentName => {
        const nestedPopulate = getNestedPopulateOfNonPersonalizedAttributes(componentName).map(
          nestedAttr => `${attrName}.${nestedAttr}`
        );
        attributesToPopulate.push(...nestedPopulate);
      });
    }
  }

  return attributesToPopulate;
};

module.exports = () => ({
  isPersonalizedContentType,
  getValidVariation,
  getNewPersonalizationsFrom,
  getPersonalizedAttributes,
  getNonPersonalizedAttributes,
  copyNonPersonalizedAttributes,
  getAndValidateRelatedEntity,
  fillNonPersonalizedAttributes,
  getNestedPopulateOfNonPersonalizedAttributes,
});
