'use strict';

const _ = require('lodash');
const { prop, pick, reduce, map, keys, toPath, isNil } = require('lodash/fp');
const utils = require('@strapi/utils');
const { getService } = require('../utils');

const { contentTypes, parseMultipartData, sanitize } = utils;
const { ApplicationError, NotFoundError } = utils.errors;

const { getContentTypeRoutePrefix, isSingleType, getWritableAttributes } = contentTypes;

/**
 * Returns all variations for an entry
 * @param {object} entry
 * @returns {string[]}
 */
const getAllVariations = entry => {
  return [entry.variation, ...map(prop('variation'), entry.personalizations)];
};

/**
 * Returns all personalizations ids for an entry
 * @param {object} entry
 * @returns {any[]}
 */
const getAllPersonalizationsIds = entry => {
  return [entry.id, ...map(prop('id'), entry.personalizations)];
};

/**
 * Returns a sanitizer object with a data & a file sanitizer for a content type
 * @param {object} contentType
 * @returns {{
 *    sanitizeInput(data: object): object,
 *    sanitizeInputFiles(files: object): object
 * }}
 */
const createSanitizer = contentType => {
  /**
   * Returns the writable attributes of a content type in the personalization routes
   * @returns {string[]}
   */
  const getAllowedAttributes = () => {
    return getWritableAttributes(contentType).filter(
      attributeName => !['variation', 'personalizations'].includes(attributeName)
    );
  };

  /**
   * Sanitizes uploaded files to keep only writable ones
   * @param {object} files - input files to sanitize
   * @returns {object}
   */
  const sanitizeInputFiles = files => {
    const allowedFields = getAllowedAttributes();
    return reduce(
      (acc, keyPath) => {
        const [rootKey] = toPath(keyPath);
        if (allowedFields.includes(rootKey)) {
          acc[keyPath] = files[keyPath];
        }

        return acc;
      },
      {},
      keys(files)
    );
  };

  /**
   * Sanitizes input data to keep only writable attributes
   * @param {object} data - input data to sanitize
   * @returns {object}
   */
  const sanitizeInput = data => {
    return pick(getAllowedAttributes(), data);
  };

  return { sanitizeInput, sanitizeInputFiles };
};

/**
 * Returns a handler to handle personalizations creation in the core api
 * @param {object} contentType
 * @returns {(object) => void}
 */
const createPersonalizationHandler = contentType => {
  const handler = createCreatePersonalizationHandler(contentType);

  return (ctx = {}) => {
    const { id } = ctx.params;
    const { data, files } = parseMultipartData(ctx);

    return handler({ id, data, files });
  };
};

const createCreatePersonalizationHandler = contentType => async (args = {}) => {
  const { copyNonPersonalizedAttributes } = getService('content-types');

  const { sanitizeInput, sanitizeInputFiles } = createSanitizer(contentType);

  const entry = isSingleType(contentType)
    ? await strapi.query(contentType.uid).findOne({ populate: ['personalizations'] })
    : await strapi
        .query(contentType.uid)
        .findOne({ where: { id: args.id }, populate: ['personalizations'] });

  if (!entry) {
    throw new NotFoundError();
  }

  const { data, files } = args;

  const { findBySlug } = getService('variations');

  if (isNil(data.variation)) {
    throw new ApplicationError('variation is missing');
  }

  const matchingVariation = await findBySlug(data.variation);
  if (!matchingVariation) {
    throw new ApplicationError('variation is invalid');
  }

  const usedVariations = getAllVariations(entry);
  if (usedVariations.includes(data.variation)) {
    throw new ApplicationError('variation is already used');
  }

  const sanitizedData = {
    ...copyNonPersonalizedAttributes(contentType, entry),
    ...sanitizeInput(data),
    variation: data.variation,
    personalizations: getAllPersonalizationsIds(entry),
  };

  const sanitizedFiles = sanitizeInputFiles(files);

  const newEntry = await strapi.entityService.create(contentType.uid, {
    data: sanitizedData,
    files: sanitizedFiles,
    populate: ['personalizations'],
  });

  return sanitize.contentAPI.output(newEntry, strapi.getModel(contentType.uid));
};

/**
 * Returns a route config to handle personalizations creation in the core api
 * @param {object} contentType
 * @returns {{ method: string, path: string, handler: string, config: { policies: string[] }}}
 */
const createPersonalizationRoute = contentType => {
  const { modelName } = contentType;

  const routePrefix = getContentTypeRoutePrefix(contentType);
  const routePath = isSingleType(contentType)
    ? `/${routePrefix}/personalizations`
    : `/${routePrefix}/:id/personalizations`;

  return {
    method: 'POST',
    path: routePath,
    handler: `${modelName}.createPersonalization`,
    config: {
      policies: [],
    },
  };
};

/**
 * Adds a route & an action to the core api controller of a content type to allow creating new personalizations
 * @param {object} contentType
 */
const addCreatePersonalizationAction = contentType => {
  const { modelName, apiName } = contentType;

  const personalizationRoute = createPersonalizationRoute(contentType);

  strapi.api[apiName].routes[modelName].routes.push(personalizationRoute);

  strapi.container.get('controllers').extend(`api::${apiName}.${modelName}`, controller => {
    return Object.assign(controller, {
      createPersonalization: createPersonalizationHandler(contentType),
    });
  });
};

const mergeCustomizer = (dest, src) => {
  if (typeof dest === 'string') {
    return `${dest}\n${src}`;
  }
};

/**
 * Add a graphql schema to the plugin's global graphl schema to be processed
 * @param {object} schema
 */
const addGraphqlSchema = schema => {
  _.mergeWith(strapi.config.get('plugin.personalization.schema.graphql'), schema, mergeCustomizer);
};

/**
 * Add personalization mutation & filters to use with the graphql plugin
 * @param {object} contentType
 */
const addGraphqlPersonalizationAction = contentType => {
  const { globalId, modelName } = contentType;

  if (!strapi.plugins.graphql) {
    return;
  }

  const { toSingular, toPlural } = strapi.plugin('graphql').service('naming');

  // We use a string instead of an enum as the variations can be changed in the admin
  // NOTE: We could use a custom scalar so the validation becomes dynamic
  const variationArgs = {
    args: {
      variation: 'String',
    },
  };

  // add variation arguments in the existing queries
  if (isSingleType(contentType)) {
    const queryName = toSingular(modelName);
    const mutationSuffix = _.upperFirst(queryName);

    addGraphqlSchema({
      resolver: {
        Query: {
          [queryName]: variationArgs,
        },
        Mutation: {
          [`update${mutationSuffix}`]: variationArgs,
          [`delete${mutationSuffix}`]: variationArgs,
        },
      },
    });
  } else {
    const queryName = toPlural(modelName);

    addGraphqlSchema({
      resolver: {
        Query: {
          [queryName]: variationArgs,
          [`${queryName}Connection`]: variationArgs,
        },
      },
    });
  }

  // add new mutation to create a personalization
  const typeName = globalId;

  const capitalizedName = _.upperFirst(toSingular(modelName));
  const mutationName = `create${capitalizedName}Personalization`;
  const mutationDef = `${mutationName}(input: update${capitalizedName}Input!): ${typeName}!`;
  const actionName = `${contentType.uid}.createPersonalization`;

  addGraphqlSchema({
    mutation: mutationDef,
    resolver: {
      Mutation: {
        [mutationName]: {
          resolver: actionName,
        },
      },
    },
  });
};

module.exports = () => ({
  addCreatePersonalizationAction,
  addGraphqlPersonalizationAction,
  createSanitizer,
  createCreatePersonalizationHandler,
});
